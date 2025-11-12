import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  Calendar, 
  TrendingDown, 
  Sparkles, 
  Clock,
  Gift,
  Percent,
  DollarSign,
  Copy,
  Check
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { promotionService, type Promotion } from '@/services/promotionService';
import { toast } from 'sonner';

const CurrentDeals: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'percent' | 'amount'>('all');

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionService.getAllPublic();
      const activePromotions = data.filter(p => p.isActive && new Date(p.endDate) > new Date());
      setPromotions(activePromotions);
    } catch (error) {
      console.error('Failed to load promotions:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredPromotions = promotions.filter(promo => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'percent') return promo.discountType === 'PERCENT';
    if (selectedCategory === 'amount') return promo.discountType === 'AMOUNT';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full mb-6">
              <span className="font-semibold">Limited Time Offers</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Current Deals & Promotions
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Don't miss out on our amazing deals! Save big on your favorite meals with exclusive discounts and special offers.
            </p>

            {/* Filter Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-red-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Gift className="inline mr-2" size={20} />
                All Deals
              </button>
              <button
                onClick={() => setSelectedCategory('percent')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategory === 'percent'
                    ? 'bg-red-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Percent className="inline mr-2" size={20} />
                Percentage Off
              </button>
              <button
                onClick={() => setSelectedCategory('amount')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategory === 'amount'
                    ? 'bg-red-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <DollarSign className="inline mr-2" size={20} />
                Fixed Amount
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="max-w-7xl mx-auto px-8 pb-20">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredPromotions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Gift className="mx-auto text-gray-300 mb-4" size={80} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Deals Available</h3>
            <p className="text-gray-600">Check back soon for exciting new offers!</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPromotions.map((promo, index) => {
                const daysRemaining = getDaysRemaining(promo.endDate);
                const isUrgent = daysRemaining <= 3;

                return (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group relative"
                  >
                    {/* Card */}
                    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-red-200">
                      {/* Gradient Header */}
                      <div className={`h-32 bg-gradient-to-br ${
                        promo.discountType === 'PERCENT' 
                          ? 'from-red-500 to-orange-500' 
                          : 'from-purple-500 to-pink-500'
                      } relative overflow-hidden`}>
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full"></div>
                        
                        {/* Discount Badge */}
                        <div className="absolute top-6 left-6 z-10">
                          <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg">
                            <div className="flex items-center gap-2">
                              {promo.discountType === 'PERCENT' ? (
                                <>
                                  <TrendingDown className="text-red-500" size={24} />
                                  <span className="text-3xl font-bold text-gray-800">
                                    {promo.discountValue}%
                                  </span>
                                </>
                              ) : (
                                <>
                                  <DollarSign className="text-purple-500" size={24} />
                                  <span className="text-3xl font-bold text-gray-800">
                                    {promo.discountValue} VND
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 font-semibold">OFF</p>
                          </div>
                        </div>

                        {/* Urgency Badge */}
                        {isUrgent && (
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute top-6 right-6 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                          >
                            🔥 Ending Soon!
                          </motion.div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-red-500 transition-colors">
                          {promo.name}
                        </h3>
                        
                        {promo.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {promo.description}
                          </p>
                        )}

                        {/* Code Section */}
                        {promo.code && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Tag className="text-gray-400" size={16} />
                              <span className="text-sm text-gray-600 font-semibold">Promo Code:</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3">
                                <code className="text-lg font-bold text-gray-800 tracking-wider">
                                  {promo.code}
                                </code>
                              </div>
                              <button
                                onClick={() => copyCode(promo.code!)}
                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
                              >
                                {copiedCode === promo.code ? (
                                  <Check size={20} />
                                ) : (
                                  <Copy size={20} />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={16} />
                            <span>Valid until {formatDate(promo.endDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock size={16} />
                            <span className={isUrgent ? 'text-red-500 font-semibold' : ''}>
                              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                            </span>
                          </div>
                          {promo.quantity > 0 && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Gift size={16} />
                              <span>{promo.quantity} codes available</span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <motion.a
                          href="/menu"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-6 block w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 rounded-lg text-center transition-all shadow-md hover:shadow-lg"
                        >
                          Shop Now
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      <Footer />

      {/* Custom animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default CurrentDeals;
