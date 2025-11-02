import { useState, useEffect } from 'react';
import { userService } from '@/services';
import { useUpload } from '@/hooks/useUpload';
import type { UserProfile, UpdateProfileRequest } from '@/types/api.types';
import { toast } from 'sonner';

export const useProfileLogic = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    birthday: '',
    imageURL: '',
  });

  const { uploadSingle, uploading: isUploading } = useUpload();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getMyProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName,
        birthday: data.birthday || '',
        imageURL: data.imageURL || '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      const result = await uploadSingle(file);
      if (result.success && result.secure_url) {
        setFormData(prev => ({ ...prev, imageURL: result.secure_url! }));
        toast.success('Avatar uploaded successfully');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!profile) return;

    try {
      setIsSaving(true);

      const updateData: UpdateProfileRequest = {};
      if (formData.fullName !== profile.fullName) {
        updateData.fullName = formData.fullName;
      }
      if (formData.birthday !== (profile.birthday || '')) {
        updateData.birthday = formData.birthday || undefined;
      }
      if (formData.imageURL !== (profile.imageURL || '')) {
        updateData.imageURL = formData.imageURL || undefined;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setIsEditing(false);
        return;
      }

      const updatedProfile = await userService.updateMyProfile(updateData);
      setProfile(updatedProfile);
      setFormData({
        fullName: updatedProfile.fullName,
        birthday: updatedProfile.birthday || '',
        imageURL: updatedProfile.imageURL || '',
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        birthday: profile.birthday || '',
        imageURL: profile.imageURL || '',
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return {
    profile,
    isLoading,
    isSaving,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    isUploading,
    loadProfile,
    handleAvatarChange,
    handleSubmit,
    cancelEdit,
    formatDate,
  };
};
