"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard-layout';

interface Achievement {
    _id: string;
    title: string;
    description: string;  // Add this line
    category: string;
    status: 'completed' | 'ongoing' | 'determined';
    progress: number;
    date: string;
    location: string;
    impact: string;
    details: string[];
    icon: string;
  }

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/achievements', {
          next: { tags: ['achievements'] } // Enable revalidation
        });
        if (!response.ok) throw new Error('Failed to fetch achievements');
        const data = await response.json();
        setAchievements(data);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        toast.error('Failed to load achievements. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const refreshAchievements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/achievements', {
        next: { revalidate: 0 } // Force revalidation
      });
      if (!response.ok) throw new Error('Failed to fetch achievements');
      const data = await response.json();
      setAchievements(data);
      toast.success('Achievements refreshed');
    } catch (error) {
      console.error('Error refreshing achievements:', error);
      toast.error('Failed to refresh achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      const response = await fetch(`/api/achievements/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete achievement');
      
      toast.success('Achievement deleted successfully');
      // Use refreshAchievements to ensure we have the latest data
      await refreshAchievements();
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast.error('Failed to delete achievement');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'determined':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || achievement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
   <DashboardLayout>
     <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground">
            Manage and track all achievements
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/achievements/new')}>
          <Plus className="mr-2 h-4 w-4" /> Add Achievement
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search achievements..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
            <option value="determined">Determined</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAchievements.length > 0 ? (
              filteredAchievements.map((achievement) => (
                <TableRow key={achievement._id}>
                  <TableCell className="font-medium">
                    <div className="line-clamp-1">{achievement.title}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {achievement.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${getStatusBadge(achievement.status)}`}>
                      {achievement.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            achievement.status === 'completed' ? 'bg-green-500' : 
                            achievement.status === 'ongoing' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`} 
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{achievement.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{achievement.location}</TableCell>
                  <TableCell>{achievement.date}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/achievements/${achievement._id}`)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(achievement._id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No achievements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
   </DashboardLayout>
  );
}
