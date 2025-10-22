import {
  uploadService,
  type UploadOptions,
  type UploadResult,
} from "@/services/uploadService";
import { useCallback, useState } from "react";

interface UseUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  results: UploadResult[];
}

interface UseUploadReturn extends UseUploadState {
  uploadSingle: (file: File, options?: UploadOptions) => Promise<UploadResult>;
  uploadMultiple: (
    files: File[],
    options?: UploadOptions,
  ) => Promise<UploadResult[]>;
  reset: () => void;
  validateFile: (file: File) => { valid: boolean; error?: string };
  generateOptimizedUrl: (publicId: string, options?: UploadOptions) => string;
  configStatus: {
    configured: boolean;
    cloudName: boolean;
    uploadPreset: boolean;
  };
}

export const useUpload = (): UseUploadReturn => {
  const [state, setState] = useState<UseUploadState>({
    uploading: false,
    progress: 0,
    error: null,
    results: [],
  });

  const reset = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      error: null,
      results: [],
    });
  }, []);

  const uploadSingle = useCallback(
    async (file: File, options: UploadOptions = {}): Promise<UploadResult> => {
      setState((prev) => ({
        ...prev,
        uploading: true,
        progress: 0,
        error: null,
      }));

      try {
        // Validate file first
        const validation = uploadService.validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Simulate progress for UI feedback
        setState((prev) => ({ ...prev, progress: 25 }));

        const result = await uploadService.uploadImage(file, options);

        setState((prev) => ({
          ...prev,
          progress: 100,
          results: [result],
          error: result.success ? null : result.error || "Upload failed",
        }));

        return result;
      } catch (error: any) {
        const errorMessage = error.message || "Upload failed";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          progress: 0,
        }));

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setState((prev) => ({ ...prev, uploading: false }));
      }
    },
    [],
  );

  const uploadMultiple = useCallback(
    async (
      files: File[],
      options: UploadOptions = {},
    ): Promise<UploadResult[]> => {
      setState((prev) => ({
        ...prev,
        uploading: true,
        progress: 0,
        error: null,
        results: [],
      }));

      try {
        // Validate all files first
        for (const file of files) {
          const validation = uploadService.validateFile(file);
          if (!validation.valid) {
            throw new Error(`${file.name}: ${validation.error}`);
          }
        }

        // Simulate progress
        setState((prev) => ({ ...prev, progress: 20 }));

        const results = await uploadService.uploadMultipleImages(
          files,
          options,
        );

        const hasErrors = results.some((r) => !r.success);
        const errorMessage = hasErrors
          ? `Some uploads failed: ${results.filter((r) => !r.success).length}/${files.length}`
          : null;

        setState((prev) => ({
          ...prev,
          progress: 100,
          results,
          error: errorMessage,
        }));

        return results;
      } catch (error: any) {
        const errorMessage = error.message || "Batch upload failed";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          progress: 0,
          results: [],
        }));

        return files.map(() => ({
          success: false,
          error: errorMessage,
        }));
      } finally {
        setState((prev) => ({ ...prev, uploading: false }));
      }
    },
    [],
  );

  const validateFile = useCallback((file: File) => {
    return uploadService.validateFile(file);
  }, []);

  const generateOptimizedUrl = useCallback(
    (publicId: string, options: UploadOptions = {}) => {
      return uploadService.generateOptimizedUrl(publicId, options);
    },
    [],
  );

  const configStatus = uploadService.getConfigStatus();

  return {
    ...state,
    uploadSingle,
    uploadMultiple,
    reset,
    validateFile,
    generateOptimizedUrl,
    configStatus,
  };
};

// Hook for simple single image upload
export const useImageUpload = () => {
  const { uploadSingle, uploading, error, results, reset } = useUpload();

  const upload = useCallback(
    async (file: File, options?: UploadOptions) => {
      const result = await uploadSingle(file, options);
      return result.success ? result.secure_url || result.url : null;
    },
    [uploadSingle],
  );

  return {
    upload,
    uploading,
    error,
    result: results[0] || null,
    reset,
  };
};
