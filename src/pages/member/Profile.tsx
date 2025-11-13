import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Calendar, Clock, Camera, Loader2, 
  Edit3, Check, X, Image as ImageIcon, ArrowLeft,
  Wallet, TrendingUp, TrendingDown, DollarSign, History, Filter
} from 'lucide-react';
import { useProfileLogic } from '@/hooks/useProfileLogic';
import { APP_ROUTES } from '@/routes/route.constants';
import { userService } from '@/services/userService';
import type { UserWalletResponse } from '@/types/api.types';

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

  const [wallet, setWallet] = useState<UserWalletResponse | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setWalletLoading(true);
        const walletData = await userService.getMyWallet();
        setWallet(walletData);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      } finally {
        setWalletLoading(false);
      }
    };

    if (profile) {
      fetchWallet();
    }
  }, [profile]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!wallet?.transactions) return [];
    
    let filtered = [...wallet.transactions];
    
    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter((t: any) => t.transactionType === filterType);
    }
    
    // Filter by date
    if (filterDate) {
      filtered = filtered.filter((t: any) => {
        if (!t.createAt) return false;
        const transactionDate = new Date(t.createAt).toISOString().split('T')[0];
        return transactionDate === filterDate;
      });
    }
    
    return filtered;
  }, [wallet?.transactions, filterType, filterDate]);

  // Calculate current balance from transactions OR use API balance
  const currentBalance = useMemo(() => {
    // Use API balance if available, otherwise calculate from transactions
    if (wallet?.balance !== undefined && wallet?.balance !== null) {
      return wallet.balance;
    }
    
    if (!wallet?.transactions) return 0;
    
    return wallet.transactions.reduce((balance: number, transaction: any) => {
      if (transaction.transactionType === 'DEBIT') {
        return balance + (transaction.amount || 0);
      } else if (transaction.transactionType === 'CREDIT') {
        return balance - (transaction.amount || 0);
      }
      return balance;
    }, 0);
  }, [wallet?.balance, wallet?.transactions]);

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

        {/* Wallet Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Wallet Header - Minimalist */}
            <div className={`p-6 border-b border-gray-200 transition-colors ${
              filterType === 'DEBIT' 
                ? 'bg-green-50' 
                : filterType === 'CREDIT' 
                ? 'bg-red-50' 
                : 'bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className={`w-6 h-6 ${
                    filterType === 'DEBIT'
                      ? 'text-green-600'
                      : filterType === 'CREDIT'
                      ? 'text-red-600'
                      : 'text-gray-700'
                  }`} />
                  <div>
                    <h2 className={`text-xl font-semibold transition-colors ${
                      filterType === 'DEBIT'
                        ? 'text-green-700'
                        : filterType === 'CREDIT'
                        ? 'text-red-700'
                        : 'text-gray-900'
                    }`}>
                      My Wallet
                    </h2>
                    <p className={`text-sm ${
                      filterType === 'DEBIT'
                        ? 'text-green-600'
                        : filterType === 'CREDIT'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {filterType === 'DEBIT' 
                        ? 'Debit Transactions' 
                        : filterType === 'CREDIT' 
                        ? 'Credit Transactions' 
                        : 'Balance and transactions'}
                    </p>
                  </div>
                </div>
                {walletLoading && (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                )}
              </div>
            </div>

            {/* Balance Card - Minimalist */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Intl.NumberFormat('vi-VN').format(currentBalance)} VND
                  </p>
                </div>
              </div>
            </div>

            {/* Filters - Minimalist */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                
                {/* Type Filter */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilterType('ALL')}
                    className={`px-3 py-1 text-xs font-medium rounded transition ${
                      filterType === 'ALL'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('DEBIT')}
                    className={`px-3 py-1 text-xs font-medium rounded transition ${
                      filterType === 'DEBIT'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Debit
                  </button>
                  <button
                    onClick={() => setFilterType('CREDIT')}
                    className={`px-3 py-1 text-xs font-medium rounded transition ${
                      filterType === 'CREDIT'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Credit
                  </button>
                </div>

                {/* Date Filter */}
                <div className="flex items-center space-x-2 ml-auto">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-3 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                  {filterDate && (
                    <button
                      onClick={() => setFilterDate('')}
                      className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction History - Minimalist */}
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <History className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Transaction History ({filteredTransactions.length})
                </h3>
              </div>

              {walletLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction: any, index: number) => {
                    const isDebit = transaction.transactionType === 'DEBIT';
                    const isCredit = transaction.transactionType === 'CREDIT';
                    
                    return (
                      <motion.div
                        key={transaction.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: index * 0.08,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className={`relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-dashed ${
                          isDebit 
                            ? 'bg-green-50 border-green-500' 
                            : isCredit 
                            ? 'bg-red-50 border-red-500'
                            : 'bg-gray-50 border-gray-500'
                        }`}
                      >
                        {/* Decorative line */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${
                          isDebit ? 'bg-green-400' : isCredit ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                        
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-4">
                            {/* Icon */}
                            <div className={`p-3 rounded-full ${
                              isDebit 
                                ? 'bg-green-500' 
                                : isCredit 
                                ? 'bg-red-500' 
                                : 'bg-gray-500'
                            }`}>
                              {isDebit ? (
                                <TrendingUp className="w-5 h-5 text-white" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-white" />
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1">
                              <p className={`text-sm font-semibold mb-1 ${
                                isDebit ? 'text-green-800' : isCredit ? 'text-red-800' : 'text-gray-800'
                              }`}>
                                {transaction.note || 'No note'}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-white border border-gray-300 text-gray-700">
                                  {transaction.createAt 
                                    ? new Date(transaction.createAt).toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Amount */}
                          <div className="text-right">
                            <p className={`text-lg font-bold mb-1 ${
                              isDebit ? 'text-green-600' : isCredit ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {isDebit ? '+' : isCredit ? '-' : ''}
                              {new Intl.NumberFormat('vi-VN').format(Math.abs(transaction.amount || 0))}
                            </p>
                            <p className={`text-xs font-medium ${
                              isDebit ? 'text-green-500' : isCredit ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              VND
                            </p>
                          </div>
                        </div>
                        
                        {/* Bottom accent */}
                        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                          isDebit 
                            ? 'bg-gradient-to-r from-transparent via-green-400 to-transparent' 
                            : 'bg-gradient-to-r from-transparent via-red-400 to-transparent'
                        }`} />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No transactions found</p>
                  {(filterType !== 'ALL' || filterDate) && (
                    <button
                      onClick={() => {
                        setFilterType('ALL');
                        setFilterDate('');
                      }}
                      className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
