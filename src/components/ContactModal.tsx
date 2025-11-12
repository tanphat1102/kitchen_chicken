import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, MapPin, Bike } from 'lucide-react';
import LoginBg from '@/assets/img/LoginBg.png';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
          />

          <motion.div
            className="fixed bottom-8 z-[60] pointer-events-none"
            initial={{ left: -200, opacity: 0 }}
            animate={{ left: 32, opacity: 1 }}
            exit={{ left: -200, opacity: 0 }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut"
            }}
          >
            <div className="relative">
              {/* Delivery Person Icon with pedaling animation */}
              <motion.div
                animate={{ 
                  y: [0, -3, 0, -3, 0],
                  rotate: [0, -2, 0, 2, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: 2,
                  ease: "easeInOut",
                  delay: 0.3
                }}
                className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 0.6,
                    repeat: 3,
                    ease: "linear",
                    delay: 0.3
                  }}
                >
                  <Bike className="text-white" size={32} />
                </motion.div>
              </motion.div>
              
              {/* Rope/Line - Appears second, after delivery person */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 80, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ 
                  delay: 0.6,
                  duration: 0.4,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 -translate-y-1/2 left-full h-1 bg-gradient-to-r from-red-500 via-orange-400 to-transparent shadow-lg"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))'
                }}
              />
            </div>
          </motion.div>

          {/* Modal - Appears last, pulled by the rope */}
          <motion.div
            initial={{ 
              x: -600,
              opacity: 0,
              rotate: -5
            }}
            animate={{ 
              x: 0,
              opacity: 1,
              rotate: [0, -2, -1, 0]
            }}
            exit={{ 
              x: -600,
              opacity: 0,
              rotate: -5
            }}
            transition={{ 
              delay: 1.0,
              type: "spring",
              damping: 20,
              stiffness: 100,
              duration: 0.6,
              rotate: {
                duration: 0.6,
                times: [0, 0.3, 0.6, 1]
              }
            }}
            className="fixed left-28 top-1/2 -translate-y-1/2 z-[55] w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-100 via-red-300 to-red-500 px-6 py-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Phone className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Contact Us</h2>
                      <p className="text-white/90 text-xs">We're here to help!</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-6 space-y-4">
                {/* Hotline */}
                <div className="flex items-start gap-3 group">
                  <Phone className="text-red-600 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" size={20} />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm mb-0.5">Hotline</h3>
                    <a 
                      href="tel:1900123456" 
                      className="text-red-600 font-semibold hover:text-red-700 transition-colors"
                    >
                      1900 123 456
                    </a>
                    <p className="text-gray-500 text-xs mt-0.5">Available 24/7</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 group">
                  <Mail className="text-orange-600 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" size={20} />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm mb-0.5">Email</h3>
                    <a 
                      href="mailto:chickenkitchen785@gmail.com"
                      className="text-orange-600 font-semibold hover:text-orange-700 transition-colors break-all text-sm"
                    >
                      chickenkitchen785@gmail.com
                    </a>
                    <p className="text-gray-500 text-xs mt-0.5">We'll reply within 24h</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 group">
                  <MapPin className="text-green-600 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" size={20} />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm mb-0.5">Main Office</h3>
                    <p className="text-gray-600 text-sm">
                      Lot E2a-7, Street D1, Long Thanh My, Thu Duc City
                    </p>
                  </div>
                </div>

                {/* Image */}
                <div className="relative rounded-xl overflow-hidden mt-4">
                  <img 
                    src={LoginBg} 
                    alt="Our Restaurant" 
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
