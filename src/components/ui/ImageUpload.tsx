import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpload } from '@/hooks/useUpload';
import { Upload, X, Image, AlertCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUploadSuccess?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  folder?: string;
  maxFiles?: number;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  multiple = false,
  folder = 'uploads',
  maxFiles = 5,
  className = ''
}) => {
  const [uploadedImages, setUploadedImages] = useState<Array<{
    url: string;
    publicId: string;
    name: string;
  }>>([]);

  const { 
    uploadSingle, 
    uploadMultiple, 
    uploading, 
    progress, 
    error, 
    reset,
    configStatus 
  } = useUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!configStatus.configured) {
      toast.error('Cloudinary not configured. Please check environment variables.');
      return;
    }

    reset();

    try {
      const options = { 
        folder,
        quality: 'auto' as const,
        format: 'auto' as const
      };

      let results;
      if (multiple) {
        results = await uploadMultiple(acceptedFiles, options);
      } else {
        const result = await uploadSingle(acceptedFiles[0], options);
        results = [result];
      }

      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);

      if (successfulUploads.length > 0) {
        const newImages = successfulUploads.map(result => ({
          url: result.secure_url || result.url || '',
          publicId: result.public_id || '',
          name: acceptedFiles[results.indexOf(result)]?.name || 'Unknown'
        }));

        setUploadedImages(prev => [...prev, ...newImages]);
        
        const urls = newImages.map(img => img.url);
        onUploadSuccess?.(urls);
        
        toast.success(`${successfulUploads.length} image(s) uploaded successfully!`);
      }

      if (failedUploads.length > 0) {
        const errorMessage = `${failedUploads.length} upload(s) failed`;
        onUploadError?.(errorMessage);
        toast.error(errorMessage);
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed';
      onUploadError?.(errorMessage);
      toast.error(errorMessage);
    }
  }, [
    uploadSingle, 
    uploadMultiple, 
    multiple, 
    folder, 
    reset, 
    onUploadSuccess, 
    onUploadError,
    configStatus.configured
  ]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple,
    maxFiles: multiple ? maxFiles : 1,
    disabled: uploading
  });

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadedImages([]);
    reset();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Image Upload
          {!configStatus.configured && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </CardTitle>
        <CardDescription>
          {multiple 
            ? `Upload up to ${maxFiles} images at once`
            : 'Upload a single image'
          }
          {!configStatus.configured && (
            <span className="text-red-500 block mt-1">
              ⚠️ Cloudinary not configured
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Configuration Status */}
        {!configStatus.configured && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Configuration Required</h4>
            <p className="text-sm text-red-700 mb-2">
              Please add these environment variables to your .env file:
            </p>
            <div className="bg-red-100 rounded p-2 font-mono text-xs">
              <div>VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name</div>
              <div>VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset</div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
            ${!configStatus.configured ? 'pointer-events-none opacity-30' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-2">
            <Image className="w-8 h-8 text-gray-400" />
            {uploading ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Uploading... {progress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : isDragActive ? (
              <p className="text-sm text-blue-600">Drop images here...</p>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF, WebP up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Uploaded Images ({uploadedImages.length})</h4>
              <Button onClick={clearAll} size="sm" variant="outline">
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadedImages.map((image, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <img 
                    src={image.url} 
                    alt={image.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{image.name}</p>
                    <p className="text-xs text-gray-500 truncate">{image.url}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => copyToClipboard(image.url)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      onClick={() => removeImage(index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUpload;