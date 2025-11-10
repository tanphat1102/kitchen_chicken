import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Zap, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  Github,
  Linkedin,
  Mail,
  Code,
  Server,
  Sparkles,
  Lock,
  Package
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

// Import team member avatars
import avatarBao from '@/assets/img/Bao.jpg';
import avatarKhiem from '@/assets/img/Khiem.jpg';
import avatarPhat from '@/assets/img/Phat.jpg';
import avatarAn from '@/assets/img/An.jpg';
import avatarThuan from '@/assets/img/Thuan.jpg';

// Core Services
const coreServices = [
  {
    icon: ShoppingCart,
    title: 'Multi-Step Food Ordering',
    description: 'Intuitive step-by-step ordering process with real-time validation and branch selection.',
    color: 'from-blue-500 to-purple-600'
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Suggestions',
    description: 'Smart menu recommendations based on preferences, dietary needs, and order history.',
    color: 'from-purple-500 to-pink-600'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Multiple payment options with VNPay, Momo integration and encrypted transactions.',
    color: 'from-green-500 to-teal-600'
  },
  {
    icon: Clock,
    title: 'Real-Time Tracking',
    description: 'Live order status updates from confirmation to ready for pickup with notifications.',
    color: 'from-orange-500 to-red-600'
  }
];

// Key Business Rules (Highlight only 8 most important)
const keyBusinessRules = [
  { 
    icon: Lock, 
    title: 'Secure Authentication', 
    description: 'Google & GitHub OAuth integration with session management and auto-logout after 15 minutes inactivity.',
    category: 'Security'
  },
  { 
    icon: ShoppingCart, 
    title: 'Daily Menu Ordering', 
    description: 'Orders can only be placed from daily menu available at 8:00 AM, preventing pre-orders for past dates.',
    category: 'Ordering'
  },
  { 
    icon: CreditCard, 
    title: 'Payment Before Processing', 
    description: 'Complete payment verification required before orders are sent to kitchen, with instant receipt generation.',
    category: 'Payment'
  },
  { 
    icon: TrendingUp, 
    title: 'Order Status Flow', 
    description: 'Defined sequence: New → Confirmed → Processing → Completed with email notifications at each stage.',
    category: 'Order Management'
  },
  { 
    icon: Package, 
    title: 'Inventory Tracking', 
    description: 'Real-time stock monitoring with FIFO principle, automatic blocking of out-of-stock items, and low-stock alerts.',
    category: 'Inventory'
  },
  { 
    icon: CheckCircle, 
    title: 'Branch Confirmation', 
    description: 'Pickup branch must be confirmed before payment, with no changes allowed after order submission.',
    category: 'Ordering'
  },
  { 
    icon: Zap, 
    title: 'High Performance', 
    description: 'Sub-2-second page load times with support for 1000+ concurrent orders per hour.',
    category: 'Performance'
  },
  { 
    icon: Shield, 
    title: 'Data Security', 
    description: 'SHA-256 encryption and SSL/TLS for all sensitive data with comprehensive transaction logging.',
    category: 'Security'
  }
];

// Team Members Data
const teamMembers = [
  {
    name: 'Le Tran Gia Bao',
    role: 'Backend Developer',
    type: 'backend',
    description: 'Specialized in Kotlin, Spring Boot, RESTful APIs, and MySQL database design.',
    avatar: avatarBao,
    github: '', // TODO: Add GitHub profile URL
    linkedin: '', // TODO: Add LinkedIn profile URL
    email: '' // TODO: Add email address
  },
  {
    name: 'Nguyen Gia Khiem',
    role: 'Backend Developer',
    type: 'backend',
    description: 'Expert in Java, Spring Security, JWT authentication, and Firebase integration.',
    avatar: avatarKhiem,
    github: '', // TODO: Add GitHub profile URL
    linkedin: '', // TODO: Add LinkedIn profile URL
    email: '' // TODO: Add email address
  },
  {
    name: 'Tran Tan Phat',
    role: 'Frontend Developer',
    type: 'frontend',
    description: 'Focused on React, TypeScript, Vite, and modern UI/UX with Tailwind CSS.',
    avatar: avatarPhat,
    github: '', // TODO: Add GitHub profile URL
    linkedin: '', // TODO: Add LinkedIn profile URL
    email: '' // TODO: Add email address
  },
  {
    name: 'Le Truc An',
    role: 'Frontend Developer',
    type: 'frontend',
    description: 'Specialized in responsive design, Framer Motion animations, and React Query.',
    avatar: avatarAn,
    github: '', // TODO: Add GitHub profile URL
    linkedin: '', // TODO: Add LinkedIn profile URL
    email: '' // TODO: Add email address
  },
  {
    name: 'Tran Quang Thuan',
    role: 'Frontend Developer',
    type: 'frontend',
    description: 'Expert in React component architecture, state management, and performance optimization.',
    avatar: avatarThuan,
    github: '', // TODO: Add GitHub profile URL
    linkedin: '', // TODO: Add LinkedIn profile URL
    email: '' // TODO: Add email address
  }
];

// Partners Data
const partners = [
  {
    name: 'Firebase',
    category: 'Authentication & Database',
    description: 'Real-time authentication and cloud database services',
    logo: '', // TODO: Add logo URL
    website: 'https://firebase.google.com'
  },
  {
    name: 'VNPay',
    category: 'Payment Gateway',
    description: 'Leading Vietnamese online payment gateway',
    logo: '', // TODO: Add logo URL
    website: 'https://vnpay.vn'
  },
  {
    name: 'Momo',
    category: 'E-Wallet & Payment',
    description: 'Vietnam\'s #1 e-wallet and mobile payment platform',
    logo: '', // TODO: Add logo URL
    website: 'https://momo.vn'
  },
  {
    name: 'Google Cloud',
    category: 'Cloud Services',
    description: 'Cloud infrastructure and OAuth authentication',
    logo: '', // TODO: Add logo URL
    website: 'https://cloud.google.com'
  },
  {
    name: 'GitHub',
    category: 'Development Platform',
    description: 'Version control and OAuth authentication provider',
    logo: '', // TODO: Add logo URL
    website: 'https://github.com'
  },
  {
    name: 'MySQL',
    category: 'Database',
    description: 'Reliable relational database management system',
    logo: '', // TODO: Add logo URL
    website: 'https://www.mysql.com'
  },
  {
    name: 'Spring Boot',
    category: 'Backend Framework',
    description: 'Java-based framework for building enterprise applications',
    logo: '', // TODO: Add logo URL
    website: 'https://spring.io/projects/spring-boot'
  },
  {
    name: 'React',
    category: 'Frontend Framework',
    description: 'Modern JavaScript library for building user interfaces',
    logo: '', // TODO: Add logo URL
    website: 'https://react.dev'
  },
  {
    name: 'Vercel',
    category: 'Hosting & Deployment',
    description: 'Cloud platform for static sites and serverless functions',
    logo: '', // TODO: Add logo URL
    website: 'https://vercel.com'
  }
];

export const Services: React.FC = () => {
  // Group team members
  const backendTeam = teamMembers.filter(member => member.type === 'backend');
  const frontendTeam = teamMembers.filter(member => member.type === 'frontend');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Navbar />

      {/* Hero Section - Redesigned */}
      <section className="relative bg-white overflow-hidden py-20 md:py-32">
        {/* Animated background blobs */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-40"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-30"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Icon Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 200
              }}
              className="mb-8"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-16 h-16 md:w-20 md:h-20 mx-auto text-orange-500 drop-shadow-lg" />
              </motion.div>
            </motion.div>

            {/* Title Animation */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            >
              <span className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent">
                Our Services
              </span>
            </motion.h1>

            {/* Subtitle Animation */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-10 font-medium px-4"
            >
              Multi-step Food Ordering With 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 font-bold"> AI Suggestion </span>
              For Bambi Kitchen
            </motion.p>

            {/* Badges Animation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm md:text-base"
            >
              <motion.span 
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-5 py-2.5 rounded-full shadow-md border border-orange-200"
              >
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold">Project Code: SE1831</span>
              </motion.span>
              <span className="hidden sm:block text-gray-400">•</span>
              <motion.span 
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-5 py-2.5 rounded-full shadow-md border border-purple-200"
              >
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold">Supervisor: Lâm Hữu Khánh Phương</span>
              </motion.span>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Core Services Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-600 rounded-full text-sm font-semibold border border-orange-200">
                ✨ What We Offer
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Innovative Solutions
              </span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Cutting-edge technology meets seamless user experience in our food ordering platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {coreServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.15,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 md:p-10 border border-gray-100 overflow-hidden"
                >
                  {/* Animated background gradient */}
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-20 rounded-full -mr-20 -mt-20 transition-opacity duration-500 blur-2xl`}></div>
                  <motion.div 
                    className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${service.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                  ></motion.div>
                  
                  <div className="relative z-10">
                    <motion.div 
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`inline-flex p-4 md:p-5 rounded-2xl bg-gradient-to-br ${service.color} text-white mb-6 shadow-lg`}
                    >
                      <Icon className="w-8 h-8 md:w-10 md:h-10" />
                    </motion.div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300">
                      {service.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Business Rules Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-100 to-transparent rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-100 to-transparent rounded-full blur-3xl opacity-30"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-6"
            >
              <Shield className="w-16 h-16 md:w-20 md:h-20 mx-auto text-orange-500 drop-shadow-lg" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Key Business Rules
              </span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Core principles ensuring security, reliability, and exceptional service quality
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {keyBusinessRules.map((rule, index) => {
              const Icon = rule.icon;
              return (
                <motion.div
                  key={rule.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.08,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-orange-200 group"
                >
                  <motion.div 
                    className="flex items-start gap-3 mb-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 flex-shrink-0 group-hover:shadow-md transition-shadow duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                  </motion.div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg group-hover:text-orange-600 transition-colors duration-300">
                    {rule.title}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4">
                    {rule.description}
                  </p>
                  <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border border-orange-100">
                    {rule.category}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 rounded-full text-sm font-semibold border border-blue-200">
                👥 Meet Our Team
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Talented Developers
              </span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 px-4">
              Behind every great project is a great team
            </p>
          </motion.div>

          {/* Backend Team */}
          <div className="mb-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-10"
            >
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md">
                <Server className="text-blue-600 w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Backend Team
              </h3>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              {backendTeam.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.15,
                    duration: 0.6,
                    type: "spring"
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-blue-100 hover:border-blue-300 group relative overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="flex flex-col items-center text-center relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover mb-5 border-4 border-blue-200 group-hover:border-blue-400 transition-all duration-300 shadow-xl"
                        />
                      ) : (
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-5 text-white text-3xl font-bold shadow-xl">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </motion.div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{member.name}</h4>
                    <p className="text-blue-600 font-semibold mb-4 text-sm md:text-base">{member.role}</p>
                    <p className="text-gray-600 text-xs md:text-sm mb-5 leading-relaxed">{member.description}</p>
                    <div className="flex gap-3">
                      {member.github && (
                        <motion.a 
                          whileHover={{ scale: 1.2, y: -2 }}
                          href={member.github} 
                          className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-all duration-300" 
                          aria-label="GitHub"
                        >
                          <Github className="w-5 h-5" />
                        </motion.a>
                      )}
                      {member.linkedin && (
                        <motion.a 
                          whileHover={{ scale: 1.2, y: -2 }}
                          href={member.linkedin} 
                          className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-all duration-300" 
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="w-5 h-5" />
                        </motion.a>
                      )}
                      {member.email && (
                        <motion.a 
                          whileHover={{ scale: 1.2, y: -2 }}
                          href={`mailto:${member.email}`} 
                          className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-all duration-300" 
                          aria-label="Email"
                        >
                          <Mail className="w-5 h-5" />
                        </motion.a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Frontend Team */}
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-10"
            >
              <div className="p-3 bg-gradient-to-br from-red-100 to-orange-200 rounded-xl shadow-md">
                <Code className="text-red-600 w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Frontend Team
              </h3>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {frontendTeam.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.15,
                    duration: 0.6,
                    type: "spring"
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-red-100 hover:border-red-300 group relative overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="flex flex-col items-center text-center relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover mb-5 border-4 border-red-200 group-hover:border-red-400 transition-all duration-300 shadow-xl"
                        />
                      ) : (
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-red-400 to-orange-600 flex items-center justify-center mb-5 text-white text-3xl font-bold shadow-xl">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </motion.div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{member.name}</h4>
                    <p className="text-red-600 font-semibold mb-4 text-sm md:text-base">{member.role}</p>
                    <p className="text-gray-600 text-xs md:text-sm mb-5 leading-relaxed">{member.description}</p>
                    <div className="flex gap-3">
                      {member.github && (
                        <motion.a 
                          whileHover={{ scale: 1.2, y: -2 }}
                          href={member.github} 
                          className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-all duration-300" 
                          aria-label="GitHub"
                        >
                          <Github className="w-5 h-5" />
                        </motion.a>
                      )}
                      {member.linkedin && (
                        <motion.a 
                          whileHover={{ scale: 1.2, y: -2 }}
                          href={member.linkedin} 
                          className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-all duration-300" 
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="w-5 h-5" />
                        </motion.a>
                      )}
                      {member.email && (
                        <motion.a 
                          whileHover={{ scale: 1.2, y: -2 }}
                          href={`mailto:${member.email}`} 
                          className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-all duration-300" 
                          aria-label="Email"
                        >
                          <Mail className="w-5 h-5" />
                        </motion.a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-100 to-transparent rounded-full blur-3xl opacity-30"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 rounded-full text-sm font-semibold border border-purple-200">
                🤝 Our Partners
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Trusted Technology Partners
              </span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 px-4">
              Helping us deliver excellence every day
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.5,
                  type: "spring"
                }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200 group"
              >
                <div className="flex flex-col items-center text-center h-full">
                  {/* Logo Placeholder */}
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300"
                  >
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="w-14 h-14 md:w-16 md:h-16 object-contain" />
                    ) : (
                      <div className="text-purple-400 font-bold text-lg md:text-xl">
                        {partner.name.split(' ').map(w => w[0]).join('')}
                      </div>
                    )}
                  </motion.div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    {partner.name}
                  </h3>
                  <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 mb-3 border border-purple-100">
                    {partner.category}
                  </span>
                  <p className="text-gray-600 text-xs md:text-sm mb-4 flex-grow leading-relaxed">
                    {partner.description}
                  </p>
                  
                  {partner.website && (
                    <motion.a 
                      whileHover={{ x: 5 }}
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-2 transition-all duration-300"
                    >
                      Visit Website
                      <motion.svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        whileHover={{ x: 3 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </motion.svg>
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supervisor Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            whileHover={{ 
              y: -5,
              transition: { duration: 0.3 }
            }}
            className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 md:p-10 border border-purple-100 overflow-hidden group"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <motion.div 
              className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="text-center relative z-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="inline-block p-4 md:p-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-5 shadow-xl"
              >
                <Users className="text-white w-8 h-8 md:w-10 md:h-10" />
              </motion.div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Project Supervisor</h3>
              <p className="text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-bold mb-3">
                Lâm Hữu Khánh Phương
              </p>
              <motion.p 
                className="text-gray-600 mb-5"
                whileHover={{ scale: 1.05 }}
              >
                <a 
                  href="mailto:phuonglhk@fpt.edu.vn" 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all duration-300 font-medium text-purple-700"
                >
                  <Mail className="w-4 h-4" />
                  phuonglhk@fpt.edu.vn
                </a>
              </motion.p>
              <div className="border-t border-purple-100 pt-5 mt-5">
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  Guiding and supporting the development of the 
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600"> Chicken Kitchen </span>
                  project
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
