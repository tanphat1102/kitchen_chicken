// Cloudinary configuration - Client-side only
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Types
export interface UploadResult {
  success: boolean;
  url?: string;
  public_id?: string;
  secure_url?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  error?: string;
}

export interface UploadOptions {
  folder?: string;
  transformation?: string;
  quality?: "auto" | number;
  format?: "auto" | "jpg" | "png" | "webp";
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "crop";
  gravity?: "auto" | "face" | "center";
}

class UploadService {
  private readonly cloudName: string;
  private readonly uploadPreset: string;

  constructor() {
    this.cloudName = CLOUD_NAME || "";
    this.uploadPreset = UPLOAD_PRESET || "";

    if (!this.cloudName) {
      console.warn("⚠️ Cloudinary cloud name not configured");
    }
    if (!this.uploadPreset) {
      console.warn("⚠️ Cloudinary upload preset not configured");
    }
  }

  /**
   * Upload image to Cloudinary using unsigned upload (client-side)
   */
  async uploadImage(
    file: File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    try {
      console.log("📤 Starting image upload to Cloudinary...", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        options,
      });

      if (!this.cloudName || !this.uploadPreset) {
        throw new Error("Cloudinary not properly configured");
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB");
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.uploadPreset);

      // Add optional parameters
      if (options.folder) {
        formData.append("folder", options.folder);
      }

      // Note: Transformations are not allowed in unsigned uploads
      // They should be applied via upload preset or after upload via URL transformations

      // Upload to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Cloudinary upload error:", errorData);
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      console.log("✅ Image uploaded successfully:", {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      });

      return {
        success: true,
        url: result.url,
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: File[],
    options: UploadOptions = {},
  ): Promise<UploadResult[]> {
    console.log("📤 Starting multiple image upload...", {
      fileCount: files.length,
      options,
    });

    const uploadPromises = files.map((file) => {
      const fileOptions = {
        ...options,
        folder: options.folder
          ? `${options.folder}/batch_${Date.now()}`
          : undefined,
      };

      return this.uploadImage(file, fileOptions);
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successCount = results.filter((r) => r.success).length;

      console.log(
        `✅ Batch upload completed: ${successCount}/${files.length} successful`,
      );

      return results;
    } catch (error) {
      console.error("❌ Batch upload error:", error);
      return files.map(() => ({
        success: false,
        error: "Batch upload failed",
      }));
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(
    publicId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🗑️ Deleting image from Cloudinary:", publicId);

      // Note: Deletion requires server-side implementation with API secret
      // This is a placeholder for client-side interface
      console.warn(
        "⚠️ Image deletion should be implemented on the server side for security",
      );

      return {
        success: false,
        error: "Deletion must be implemented on server side",
      };
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      return {
        success: false,
        error: error.message || "Delete failed",
      };
    }
  }

  /**
   * Generate optimized URL with transformations
   */
  generateOptimizedUrl(publicId: string, options: UploadOptions = {}): string {
    if (!this.cloudName || !publicId) {
      return "";
    }

    const transformation = this.buildTransformation(options);
    const transformationStr = transformation ? `/${transformation}` : "";

    return `https://res.cloudinary.com/${this.cloudName}/image/upload${transformationStr}/${publicId}`;
  }

  /**
   * Build transformation string from options
   */
  private buildTransformation(options: UploadOptions): string {
    const transformations: string[] = [];

    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }

    if (options.format) {
      transformations.push(`f_${options.format}`);
    }

    if (options.width || options.height) {
      let resize = "";
      if (options.width) resize += `w_${options.width}`;
      if (options.height) resize += `${resize ? "," : ""}h_${options.height}`;
      transformations.push(resize);
    }

    if (options.crop) {
      transformations.push(`c_${options.crop}`);
    }

    if (options.gravity) {
      transformations.push(`g_${options.gravity}`);
    }

    return transformations.join(",");
  }

  /**
   * Get upload configuration status
   */
  getConfigStatus(): {
    configured: boolean;
    cloudName: boolean;
    uploadPreset: boolean;
  } {
    return {
      configured: !!(this.cloudName && this.uploadPreset),
      cloudName: !!this.cloudName,
      uploadPreset: !!this.uploadPreset,
    };
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return { valid: false, error: "File must be an image" };
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: "File size must be less than 10MB" };
    }

    // Check file name
    if (!file.name || file.name.length === 0) {
      return { valid: false, error: "File must have a name" };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const uploadService = new UploadService();
export default uploadService;
