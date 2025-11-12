import { motion } from 'framer-motion';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import { IoSpeedometer } from 'react-icons/io5';
import { MdRestaurantMenu } from 'react-icons/md';
import { TbTruckDelivery } from 'react-icons/tb';

import healMeal from '../../assets/img/healMeal.png';
import salabowl from '../../assets/img/salabowl.png';
import deliveryPerson from '../../assets/img/deliveryPerson.png';
import leaf from '../../assets/img/leaf.png';

const PromotionBanner = () => {
  return (
    <section className="bg-white py-20 px-8 overflow-hidden">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              className="inline-block"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-sm font-bold text-red-500 tracking-wider uppercase">
                SMART CALORIES - EAT HAPPY
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Order Your Healthy Meal{' '}
              <span className="block mt-2">Anytime! Anywhere!</span>
            </motion.h2>

            {/* Features List */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {[
                { 
                  icon: IoSpeedometer, 
                  text: 'Track Your Calories - Stay On Target',
                  color: 'text-black'
                },
                { 
                  icon: MdRestaurantMenu, 
                  text: 'Custom Your Perfect Meal',
                  color: 'text-black'
                },
                { 
                  icon: TbTruckDelivery, 
                  text: 'Fast Delivery & Easy Pickup',
                  color: 'text-black'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 group cursor-pointer"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.6 + index * 0.15,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ x: 15, scale: 1.02 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1 + index * 0.3,
                      ease: "easeInOut"
                    }}
                  >
                    <item.icon className={`${item.color} text-4xl`} />
                  </motion.div>
                  <span className="text-gray-700 font-semibold text-lg group-hover:text-gray-900 transition-colors">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              className="flex flex-wrap gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <motion.button
                className="relative overflow-hidden bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-3 shadow-lg"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(236, 72, 153, 0.3)"
                }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  const button = e.currentTarget;
                  const ripple = document.createElement('span');
                  const rect = button.getBoundingClientRect();
                  const size = Math.max(rect.width, rect.height);
                  const x = e.clientX - rect.left - size / 2;
                  const y = e.clientY - rect.top - size / 2;
                  
                  ripple.style.width = ripple.style.height = `${size}px`;
                  ripple.style.left = `${x}px`;
                  ripple.style.top = `${y}px`;
                  ripple.classList.add('ripple');
                  
                  button.appendChild(ripple);
                  
                  setTimeout(() => ripple.remove(), 600);
                }}
              >
                <FaGooglePlay className="text-xl relative z-10" />
                <span className="relative z-10">Google Play</span>
              </motion.button>

              <motion.button
                className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-3 shadow-lg"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs opacity-80">Get 25% OFF</span>
                  <span className="text-sm font-bold">Download App</span>
                </div>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Content - Images */}
          <motion.div
            className="relative flex justify-center items-center"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-2xl h-[500px]">
              
              {/* Background Circle - Pink */}
              <motion.div
                className="absolute top-1/2 right-0 transform -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-pink-400 to-red-400 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, delay: 0.3 }}
              />

              {/* Floating Delivery Person */}
              <motion.div
                className="absolute left-[-40px] top-10 z-20"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                animate={{ 
                  y: [0, -20, 0]
                }}
                style={{
                  animation: 'float 3s ease-in-out infinite'
                }}
              >
                <img 
                  src={healMeal}
                  alt="Healthy Meal"
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                />
              </motion.div>

              {/* Phone Mockup */}
              <motion.div
                className="absolute right-20 top-1/2 transform -translate-y-1/2 z-30"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <div className="relative w-64 h-[500px] bg-white rounded-[40px] shadow-2xl p-3 border-8 border-gray-800">
                  <div className="w-full h-full bg-gradient-to-b from-orange-50 to-white rounded-[32px] overflow-hidden">
                    {/* Phone Screen Content */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-l font-bold text-red-800">Chicken Kitchen</h3>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Food Items */}
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((item) => (
                          <motion.div
                            key={item}
                            className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.4, delay: 0.8 + item * 0.1 }}
                          >
                            <div className="w-12 h-12 bg-orange-200 rounded-lg"></div>
                            <div className="flex-1">
                              <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-200 rounded w-1/2 mt-1"></div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Food Items */}
              <motion.div
                className="absolute top-10 right-0 z-40"
                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, 0]
                }}
                style={{
                  animation: 'float 4s ease-in-out infinite'
                }}
              >
                <img 
                  src={salabowl}
                  alt="Salad Bowl"
                  className="w-32 h-32 object-contain drop-shadow-xl"
                />
              </motion.div>

              <motion.div
                className="absolute bottom-20 left-10 z-40"
                initial={{ opacity: 0, scale: 0, rotate: 45 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 1 }}
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, -5, 0]
                }}
                style={{
                  animation: 'float 3.5s ease-in-out infinite'
                }}
              >
                <img 
                  src={deliveryPerson}
                  alt="Delivery Person"
                  className="w-52 h-52 object-contain drop-shadow-xl"
                />
              </motion.div>

              <motion.div
                className="absolute top-5 left-1/4 z-10"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                animate={{ 
                  y: [0, -12, 0]
                }}
                style={{
                  animation: 'float 4.5s ease-in-out infinite'
                }}
              >
                <img 
                  src={leaf}
                  alt="Healthy Meal"
                  className="w-24 h-24 object-contain drop-shadow-xl"
                />
              </motion.div>

              {/* Additional floating food item */}
              <motion.div
                className="absolute bottom-5 right-32 z-15"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                animate={{ 
                  y: [0, -18, 0],
                  rotate: [0, 10, 0]
                }}
                style={{
                  animation: 'float 5s ease-in-out infinite'
                }}
              >
                <img 
                  src="https://www.pngall.com/wp-content/uploads/2016/05/Juice-Free-Download-PNG.png"
                  alt="Fresh Juice"
                  className="w-20 h-20 object-contain drop-shadow-xl"
                />
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        }

        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default PromotionBanner;
