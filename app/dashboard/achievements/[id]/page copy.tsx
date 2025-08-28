"use client";

import React, { useState, useEffect, Suspense, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { convertHeicToJpeg } from '@/app/utils/heic-convert';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';

const achievementFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['completed', 'ongoing', 'determined']),
  progress: z.number().min(0).max(100),
  category: z.enum(['infrastructure', 'education', 'healthcare', 'finance', 'agriculture', 'environment', 'security']),
  date: z.string().min(4, 'Please enter a valid date'),
  location: z.string().min(2, 'Location is required'),
  impact: z.string().min(5, 'Impact description is required'),
  details: z.string().transform((val) => 
    val.split('\n').filter(item => item.trim() !== '')
  ),
  icon: z.string().optional(),
  images: z.array(z.string()).max(3, 'Maximum 3 images allowed').optional().default([]),
});

type AchievementFormValues = z.infer<typeof achievementFormSchema>;

const defaultValues: Partial<AchievementFormValues> = {
  status: 'ongoing',
  progress: 0,
  category: 'infrastructure',
  details: [],
};

function AchievementForm({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchAchievement = async () => {
      if (id === 'new') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/achievements/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store' // Prevent caching
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch achievement');
        }
        
        const data = await response.json();
        
        const formData = {
          ...data,
          details: data.details ? data.details.join('\n') : '',
          images: data.images || [],
        };
        
        form.reset(formData);
        if (data.images?.length) {
          setPreviewUrls(data.images);
        }
      } catch (error) {
        console.error('Error fetching achievement:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load achievement');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievement();
  }, [id, form]);

  // Memoize the HEIC conversion function
  const convertFileIfNeeded = useCallback(async (file: File): Promise<File> => {
    try {
      return await convertHeicToJpeg(file);
    } catch (error) {
      console.error('Error in HEIC conversion:', error);
      return file; // Return original if conversion fails
    }
  }, []);

  const handleImageUpload = async (file: File): Promise<string> => {
    // Validate file type and size before processing
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    if (!validImageTypes.includes(file.type.toLowerCase()) && 
        !file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif|heic|heif)$/i)) {
      throw new Error('Invalid file type. Please upload an image file (JPEG, PNG, WebP, AVIF, HEIC).');
    }
    
    if (file.size > maxFileSize) {
      throw new Error(`File is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
    }
    
    setUploading(true);
    let uploadProgress = 0;
    const progressInterval = setInterval(() => {
      uploadProgress = Math.min(uploadProgress + 10, 90); // Simulate progress up to 90%
      toast.loading(`Uploading ${file.name}... (${uploadProgress}%)`, {
        id: `upload-${file.name}`
      });
    }, 200);
    
    try {
      // Show initial loading toast
      toast.loading(`Starting upload for ${file.name}...`, {
        id: `upload-${file.name}`
      });
      
      // Convert HEIC to JPEG if needed
      const processedFile = await convertFileIfNeeded(file);
      
      const formData = new FormData();
      formData.append('file', processedFile);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse the error as JSON, use the status text
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Show success toast with preview
      toast.success(`Uploaded ${file.name} successfully`, {
        id: `upload-${file.name}`,
        duration: 3000,
      });
      
      return result.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Show error toast with details
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(`Upload failed: ${errorMessage}`, {
        id: `upload-${file.name}`,
        duration: 5000,
      });
      
      throw error;
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if we've reached the maximum number of images (3)
    const currentImages = form.getValues('images') || [];
    if (currentImages.length >= 3) {
      toast.error('Maximum of 3 images allowed');
      e.target.value = '';
      return;
    }
    
    try {
      setUploading(true);
      const imageUrl = await handleImageUpload(file);
      
      // Add to form values
      form.setValue('images', [...currentImages, imageUrl], { shouldValidate: true });
      
      // Update preview URLs
      setPreviewUrls(prev => [...prev, imageUrl]);
      
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      // Reset the file input
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const currentImages = [...previewUrls];
    currentImages.splice(index, 1);
    setPreviewUrls(currentImages);
    form.setValue('images', currentImages);
  };

  const onSubmit = async (data: AchievementFormValues) => {
    try {
      setIsSubmitting(true);
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' 
        ? '/api/achievements' 
        : `/api/achievements/${id}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save achievement');
      
      toast.success('Achievement saved successfully');
      
      router.push('/dashboard/achievements');
      router.refresh();
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast.error('Failed to save achievement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {id === 'new' ? 'Add New' : 'Edit'} Achievement
          </h1>
          <p className="text-muted-foreground">
            {id === 'new' 
              ? 'Add a new achievement to track' 
              : 'Update the achievement details'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter achievement title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="determined">Determined</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2023-2024" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the date or time period for this achievement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kano State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a detailed description of the achievement"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="impact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact</FormLabel>
                <FormControl>
                  <Input placeholder="Briefly describe the impact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Points</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter key points (one per line)"
                    className="min-h-[100px]"
                    value={Array.isArray(field.value) ? field.value.join('\n') : field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Enter each key point on a new line
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload Section */}
          <div className="space-y-4">
            <div>
              <FormLabel>Images (Max 3)</FormLabel>
              <div className="mt-2 flex flex-wrap gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="w-32 h-32 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {previewUrls.length < 3 && (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-sm text-gray-500">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      multiple
                      disabled={uploading || previewUrls.length >= 3}
                    />
                  </label>
                )}
              </div>
              {uploading && (
                <p className="mt-2 text-sm text-gray-500">Uploading images...</p>
              )}
              <FormDescription>
                Upload up to 3 images. Maximum file size: 5MB each.
              </FormDescription>
              <FormMessage />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/achievements')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {id === 'new' ? 'Create Achievement' : 'Update Achievement'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

async function getParams(params: { id: string }) {
  return params;
}

export default function EditAchievementPage({ params }: { params: { id: string } }) {
  // Properly unwrap the params using React.use()
  const { id } = use(getParams(params));
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <AchievementForm id={id} />
    </Suspense>
  );
}
