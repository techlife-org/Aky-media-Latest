"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DragDropUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  accept?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
}

export function DragDropUpload({
  onFilesSelected,
  maxFiles = 5,
  accept = "image/*,.pdf,.doc,.docx,.txt,video/*",
  multiple = true,
  disabled = false,
  className,
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        onFilesSelected(files.slice(0, maxFiles))
      }
    },
    [disabled, maxFiles, onFilesSelected],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return

      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        onFilesSelected(files.slice(0, maxFiles))
      }
      // Reset input value to allow selecting the same file again
      e.target.value = ""
    },
    [disabled, maxFiles, onFilesSelected],
  )

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center transition-colors
        ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary hover:bg-primary/5"}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById("file-upload")?.click()}
    >
      <input
        id="file-upload"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
      />

      <div className="flex flex-col items-center space-y-2">
        <Upload className={`w-8 h-8 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
        <div className="text-sm">
          {isDragOver ? (
            <p className="text-primary font-medium">Drop files here</p>
          ) : (
            <div>
              <p className="font-medium">Drag & drop files here</p>
              <p className="text-muted-foreground">or click to browse</p>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Maximum {maxFiles} files</p>
      </div>
    </div>
  )
}

export default DragDropUpload

interface ImagePreviewProps {
  images: string[]
  onRemove: (index: number) => void
  disabled?: boolean
}

export function ImagePreview({ images, onRemove, disabled = false }: ImagePreviewProps) {
  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((url, index) => (
        <div key={index} className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden border border-border">
            <img src={url || "/placeholder.svg"} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {index === 0 && (
            <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              Banner
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
