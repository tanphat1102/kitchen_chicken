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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-500 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Sparkles className="w-16 h-16 mx-auto text-yellow-300 mb-4" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Services</h1>
            <p className="text-xl md:text-2xl text-red-50 mb-6 font-medium">
              Multi-step Food Ordering With AI Suggestion For Bambi Kitchen
            </p>
            <div className="flex items-center justify-center gap-6 text-red-100">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Project Code: SE1831
              </span>
              <span className="hidden md:block">•</span>
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Supervisor: Lâm Hữu Khánh Phương
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core Services Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Innovative food ordering platform with cutting-edge technology and seamless user experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-200 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
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
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Shield className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Key Business Rules</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Core principles ensuring security, reliability, and exceptional service quality
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyBusinessRules.map((rule, index) => {
              const Icon = rule.icon;
              return (
                <motion.div
                  key={rule.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 hover:border-red-200"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 flex-shrink-0">
                      <Icon size={24} />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    {rule.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {rule.description}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {rule.category}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 text-sm">
              🔒 These are our 8 core business rules. For complete documentation with all 49 rules, 
              <br/>please refer to the project's Business Requirements Document.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600">
              Meet the talented developers behind Chicken Kitchen
            </p>
          </motion.div>

          {/* Backend Team */}
          <div className="mb-16">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Server className="text-blue-600" size={32} />
              <h3 className="text-3xl font-bold text-gray-900">Backend Team</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {backendTeam.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-200"
                >
                  <div className="flex flex-col items-center text-center">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 text-white text-3xl font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h4>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm mb-4">{member.description}</p>
                    <div className="flex gap-3">
                      {member.github && (
                        <a href={member.github} className="text-gray-600 hover:text-blue-600 transition">
                          <Github size={20} />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} className="text-gray-600 hover:text-blue-600 transition">
                          <Linkedin size={20} />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-gray-600 hover:text-blue-600 transition">
                          <Mail size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Frontend Team */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-8">
              <Code className="text-red-600" size={32} />
              <h3 className="text-3xl font-bold text-gray-900">Frontend Team</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {frontendTeam.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-200"
                >
                  <div className="flex flex-col items-center text-center">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-red-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mb-4 text-white text-3xl font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h4>
                    <p className="text-red-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm mb-4">{member.description}</p>
                    <div className="flex gap-3">
                      {member.github && (
                        <a href={member.github} className="text-gray-600 hover:text-red-600 transition">
                          <Github size={20} />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} className="text-gray-600 hover:text-red-600 transition">
                          <Linkedin size={20} />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-gray-600 hover:text-red-600 transition">
                          <Mail size={20} />
                        </a>
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
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Partners</h2>
            <p className="text-xl text-gray-600 mb-8">
              Trusted technology partners helping us deliver excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 group"
              >
                <div className="flex flex-col items-center text-center h-full">
                  {/* Logo Placeholder */}
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="text-gray-400 font-bold text-xl">
                        {partner.name.split(' ').map(w => w[0]).join('')}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h3>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 mb-3">
                    {partner.category}
                  </span>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {partner.description}
                  </p>
                  
                  {partner.website && (
                    <a 
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      Visit Website
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-xl px-6 py-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>Note:</strong> Partner logos and additional information will be updated soon. 
                You can add them by editing the <code className="bg-blue-100 px-2 py-1 rounded">partners</code> array in the source code.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Supervisor Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
          >
            <div className="text-center">
              <div className="inline-block p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Supervisor</h3>
              <p className="text-xl text-purple-600 font-semibold mb-2">
                Lâm Hữu Khánh Phương
              </p>
              <p className="text-gray-600 mb-4">
                <a href="mailto:phuonglhk@fpt.edu.vn" className="hover:text-purple-600 transition">
                  phuonglhk@fpt.edu.vn
                </a>
              </p>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-gray-700">
                  Guiding and supporting the development of the <strong>Chicken Kitchen</strong> project
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;
