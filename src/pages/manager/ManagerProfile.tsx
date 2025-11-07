import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, Loader2, 
  Edit3, Check, X, Camera, Upload 
} from 'lucide-react';
import { useProfileLogic } from '@/hooks/useProfileLogic';

export const ManagerProfile: React.FC = () => {
  const {
    profile,
    isLoading,
    isSaving,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    isUploading,
    handleAvatarChange,
    handleSubmit,
    cancelEdit,
  } = useProfileLogic();

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-gray-900" />
            <p className="text-gray-600 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="text-4xl">😔</div>
            <h2 className="text-xl font-bold text-gray-800">Profile Not Found</h2>
            <p className="text-gray-600">Unable to load profile information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <User className="h-8 w-8 text-gray-900" />
            <span>Profile</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="p-6">
          {/* Header with Edit Button */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <p className="text-sm text-gray-500 mt-1">Update your profile information</p>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={cancelEdit}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-start space-x-6 pb-6 border-b border-gray-100">
              {/* Avatar Preview */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                  {formData.imageURL || profile?.imageURL ? (
                    <img
                      src={formData.imageURL || profile?.imageURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Upload Overlay when editing */}
                {isEditing && (
                  <label 
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </label>
                )}
                
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={!isEditing || isUploading}
                  className="hidden"
                />
              </div>

              {/* Avatar Info */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Profile Picture</h3>
                <p className="text-xs text-gray-500 mb-3">
                  {isEditing 
                    ? 'Click on the avatar to upload a new photo. Max size: 5MB' 
                    : 'Your profile picture is visible to all users'}
                </p>
                
                {isEditing && (
                  <label 
                    htmlFor="avatar-upload"
                    className="inline-flex items-center space-x-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs font-medium cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-3 py-2 rounded-md border transition-all text-sm ${
                  isEditing
                    ? 'border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-500'
                } outline-none`}
                placeholder="Your full name"
                required={isEditing}
              />
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1.5">
                  This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50 cursor-not-allowed text-gray-500 outline-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                You can manage verified email addresses in your email settings.
              </p>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Birthday
              </label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                disabled={!isEditing}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 rounded-md border transition-all text-sm ${
                  isEditing
                    ? 'border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-500'
                } outline-none`}
              />
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1.5">
                  Your date of birth is used to calculate your age.
                </p>
              )}
            </div>

            {/* Account Created (Read-only) */}
            {profile?.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Account Created
                </label>
                <input
                  type="text"
                  value={new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  disabled
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50 cursor-not-allowed text-gray-500 outline-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  This is when your account was first created.
                </p>
              </div>
            )}

            {/* Save Button */}
            {isEditing && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center space-x-2 px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update profile</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagerProfile;
