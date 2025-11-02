import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, Clock, Camera, Loader2, 
  Edit3, Check, X, Image as ImageIcon 
} from 'lucide-react';
import { useProfileLogic } from '@/hooks/useProfileLogic';

export const AdminProfile: React.FC = () => {
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
    formatDate,
  } = useProfileLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-600" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="text-4xl">😔</div>
          <h2 className="text-xl font-bold text-gray-800">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load profile information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left - Avatar & Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Avatar Section */}
            <div className="relative bg-gradient-to-br from-red-500 to-orange-500 p-6">
              <div className="relative mx-auto w-24 h-24 group">
                <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                  {formData.imageURL ? (
                    <img src={formData.imageURL} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={isUploading} />
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </label>
                )}
              </div>
              
              <h2 className="text-center text-xl font-bold text-white mt-4">{profile.fullName}</h2>
              <p className="text-center text-white/90 text-sm mt-1">{profile.email}</p>
            </div>

            {/* Quick Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Member Since</p>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(profile.createdAt)}</p>
                </div>
              </div>

              {profile.birthday && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Birthday</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(profile.birthday)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right - Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-2"
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  onClick={cancelEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Full Name</span>
                  {isEditing && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all text-sm ${
                    isEditing
                      ? 'border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  } outline-none`}
                  required={isEditing}
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 bg-gray-50 cursor-not-allowed outline-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Birthday */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Birthday</span>
                </label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                  disabled={!isEditing}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all text-sm ${
                    isEditing
                      ? 'border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  } outline-none`}
                />
              </div>

              {/* Image URL (optional) */}
              {isEditing && formData.imageURL && (
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <span>Profile Picture URL</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={formData.imageURL}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageURL: e.target.value }))}
                      className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-sm"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageURL: '' }))}
                      className="px-3 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {isEditing && (
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminProfile;
