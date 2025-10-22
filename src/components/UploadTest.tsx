import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/ui/ImageUpload';
import { useImageUpload } from '@/hooks/useUpload';
import { uploadService } from '@/services/uploadService';
import { Copy, ExternalLink, Settings } from 'lucide-react';
import { toast } from 'sonner';

const UploadTest: React.FC = () => {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [optimizedUrls, setOptimizedUrls] = useState<{ [key: string]: string }>({});
  
  const simpleUpload = useImageUpload();
  const configStatus = uploadService.getConfigStatus();

  const handleUploadSuccess = (urls: string[]) => {
    setUploadedUrls(prev => [...prev, ...urls]);
    toast.success(`${urls.length} image(s) uploaded successfully!`);
  };

  const handleUploadError = (error: string) => {
    toast.error(`Upload failed: ${error}`);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const generateOptimizedUrl = (originalUrl: string, type: string) => {
    // Extract public_id from URL
    const publicIdMatch = originalUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    if (!publicIdMatch) return originalUrl;
    
    const publicId = publicIdMatch[1];
    
    let options = {};
    switch (type) {
      case 'thumbnail':
        options = { width: 150, height: 150, crop: 'fill' as const };
        break;
      case 'medium':
        options = { width: 400, height: 300, crop: 'fit' as const };
        break;
      case 'webp':
        options = { format: 'webp' as const, quality: 'auto' as const };
        break;
      default:
        return originalUrl;
    }
    
    return uploadService.generateOptimizedUrl(publicId, options);
  };

  const testOptimization = (url: string) => {
    const optimized = {
      thumbnail: generateOptimizedUrl(url, 'thumbnail'),
      medium: generateOptimizedUrl(url, 'medium'),
      webp: generateOptimizedUrl(url, 'webp'),
    };
    
    setOptimizedUrls(prev => ({
      ...prev,
      [url]: JSON.stringify(optimized, null, 2)
    }));
  };

  const clearAll = () => {
    setUploadedUrls([]);
    setOptimizedUrls({});
    simpleUpload.reset();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🖼️ Cloudinary Upload Test</h1>
        <p className="text-gray-600">
          Test image upload functionality with Cloudinary integration
        </p>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg ${configStatus.configured ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="font-medium">Overall Status</div>
              <div className={`text-sm ${configStatus.configured ? 'text-green-600' : 'text-red-600'}`}>
                {configStatus.configured ? '✅ Configured' : '❌ Not Configured'}
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${configStatus.cloudName ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="font-medium">Cloud Name</div>
              <div className={`text-sm ${configStatus.cloudName ? 'text-green-600' : 'text-red-600'}`}>
                {configStatus.cloudName ? '✅ Set' : '❌ Missing'}
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${configStatus.uploadPreset ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="font-medium">Upload Preset</div>
              <div className={`text-sm ${configStatus.uploadPreset ? 'text-green-600' : 'text-red-600'}`}>
                {configStatus.uploadPreset ? '✅ Set' : '❌ Missing'}
              </div>
            </div>
          </div>

          {!configStatus.configured && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Create a Cloudinary account at <a href="https://cloudinary.com" className="underline">cloudinary.com</a></li>
                <li>Go to Settings → Upload → Add upload preset</li>
                <li>Create an unsigned upload preset</li>
                <li>Add these to your .env file:</li>
              </ol>
              <div className="mt-2 bg-yellow-100 rounded p-2 font-mono text-xs">
                <div>VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name</div>
                <div>VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Single Image Upload</CardTitle>
            <CardDescription>Upload one image at a time</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              multiple={false}
              folder="test/single"
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </CardContent>
        </Card>

        {/* Multiple Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Multiple Images Upload</CardTitle>
            <CardDescription>Upload up to 5 images at once</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              multiple={true}
              maxFiles={5}
              folder="test/batch"
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {uploadedUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upload Results ({uploadedUrls.length})</span>
              <Button onClick={clearAll} variant="outline" size="sm">
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedUrls.map((url, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={url} 
                      alt={`Upload ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={url} 
                          readOnly 
                          className="flex-1 px-2 py-1 text-sm border rounded"
                        />
                        <Button
                          onClick={() => copyToClipboard(url)}
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => window.open(url, '_blank')}
                          size="sm"
                          variant="outline"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => testOptimization(url)}
                          size="sm"
                          variant="secondary"
                        >
                          Test Transformations
                        </Button>
                      </div>
                      
                      {optimizedUrls[url] && (
                        <div className="mt-2">
                          <h5 className="text-sm font-medium mb-1">Optimized URLs:</h5>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {optimizedUrls[url]}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadTest;