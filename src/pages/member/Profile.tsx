import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Calendar, Clock, Camera, Loader2, 
  Edit3, Check, X, Image as ImageIcon, ArrowLeft
} from 'lucide-react';
import { useProfileLogic } from '@/hooks/useProfileLogic';
import { APP_ROUTES } from '@/routes/route.constants';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-600" />
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">😔</div>
          <h2 className="text-2xl font-bold text-gray-800">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(APP_ROUTES.HOME)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Avatar & Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
              <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-orange-500 p-8">
                <div className="relative mx-auto w-32 h-32 group">
                  <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                    {formData.imageURL ? (
                      <img src={formData.imageURL} alt={profile.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={isUploading} />
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-white mx-auto mb-1" />
                          <span className="text-xs text-white font-medium">Change</span>
                        </div>
                      )}
                    </label>
                  )}
                </div>
                
                <h2 className="text-center text-2xl font-bold text-white mt-4">{profile.fullName}</h2>
                <p className="text-center text-white/90 text-sm mt-1">{profile.email}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Member Since</p>
                    <p className="text-sm font-semibold">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>

                {profile.birthday && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Birthday</p>
                      <p className="text-sm font-semibold">{formatDate(profile.birthday)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right - Edit Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {isEditing ? 'Update your profile details' : 'View your account information'}
                  </p>
                </div>
                
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="font-medium">Edit Profile</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="font-medium">Cancel</span>
                  </motion.button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      isEditing
                        ? 'border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    } outline-none`}
                    placeholder="Enter your full name"
                    required={isEditing}
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 cursor-not-allowed outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                    <span>📧</span>
                    <span>Your email is linked to your authentication provider and cannot be changed</span>
                  </p>
                </div>

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
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      isEditing
                        ? 'border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    } outline-none`}
                  />
                </div>

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
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                        placeholder="https://example.com/avatar.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageURL: '' }))}
                        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
