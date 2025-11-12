import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUserAlt, FaSignInAlt } from "react-icons/fa";
import LoginModal from '@/components/shared/LoginModal';
import { useAuth } from '@/contexts/AuthContext';
import { APP_ROUTES, MEMBER_ROUTES, ADMIN_ROUTES, MANAGER_ROUTES } from '@/routes/route.constants';
import { useCurrentOrder } from '@/hooks/useOrderCustomer';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import logo from '../assets/img/Logo.png'; 

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Menu", path: "/menu" },
  { name: "Custom", path: "/custom-order" },
  { name: "Services", path: "/services" },
  { name: "Restaurants", path: "/restaurants" },
];

export const Navbar: React.FC = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, signOut } = useAuth();
    const [storeId] = useState(1); 

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get cart data to display item count
    const { data: order, isLoading: isLoadingOrder } = useCurrentOrder(storeId, !!currentUser);
    const cartItemCount = React.useMemo(() => {
        if (!order?.dishes) return 0;
        
        const total = order.dishes.reduce((sum, dish) => {
            
            const qty = Number(dish.quantity) || 0;
            return sum + qty;
        }, 0);
        return total;
    }, [order?.dishes]);

    // State for flying animation
    const [flyingImages, setFlyingImages] = useState<Array<{
        id: string;
        imageUrl: string;
        startX: number;
        startY: number;
    }>>([]);
    const cartIconRef = useRef<HTMLDivElement>(null);
    const [cartBounce, setCartBounce] = useState(false);

    const [showNav, setShowNav] = useState(true);
    const lastScrollY = useRef(0);
    useEffect(() => {
      const onScroll = () => {
        const y = window.scrollY || 0;
        if (y < 10) {
          setShowNav(true);
        } else {
          if (y > lastScrollY.current + 5) {
            setShowNav(false);
          } else if (y < lastScrollY.current - 5) {
            setShowNav(true);
          }
        }
        lastScrollY.current = y;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
}, [isSearchOpen]);

    // Listen for auth:login-required event
    useEffect(() => {
      const handleLoginRequired = () => {
        setIsModalOpen(true);
      };
      
      window.addEventListener('auth:login-required', handleLoginRequired);
      window.addEventListener('auth:unauthorized', handleLoginRequired);
      
      return () => {
        window.removeEventListener('auth:login-required', handleLoginRequired);
        window.removeEventListener('auth:unauthorized', handleLoginRequired);
      };
    }, []);

    // Listen for dish added to cart event for flying animation
    useEffect(() => {
      const handleDishAdded = (event: Event) => {
        const customEvent = event as CustomEvent;
        const { imageUrl, element } = customEvent.detail;
        
        if (!element || !cartIconRef.current) return;

        const rect = element.getBoundingClientRect();
        const id = `flying-${Date.now()}-${Math.random()}`;
        
        setFlyingImages(prev => [...prev, {
          id,
          imageUrl,
          startX: rect.left + rect.width / 2,
          startY: rect.top + rect.height / 2,
        }]);

        // Trigger cart bounce animation
        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 500);

        // Remove after animation completes
        setTimeout(() => {
          setFlyingImages(prev => prev.filter(img => img.id !== id));
        }, 1000);
      };

      window.addEventListener('dish:added-to-cart', handleDishAdded);
      return () => window.removeEventListener('dish:added-to-cart', handleDishAdded);
    }, []);


// Open the central LoginModal
const openLogin = () => setIsModalOpen(true);

const handleLogout = async () => {
    try {
        await signOut();
        
        // Only redirect to home if user is on a protected route (admin/manager/member)
        const currentPath = location.pathname;
        if (currentPath.startsWith('/admin') || currentPath.startsWith('/manager') || currentPath.startsWith('/member')) {
            navigate('/');
        }
        // Otherwise stay on the current public page
    } catch (error) {
        console.error('Logout error:', error);
    }
};

const handleDashboardClick = () => {
    // Navigate to dashboard based on user role
    if (currentUser?.role === 'admin') {
        navigate(ADMIN_ROUTES.ADMIN_DASHBOARD);
    } else if (currentUser?.role === 'manager') {
        navigate(MANAGER_ROUTES.MANAGER_DASHBOARD);
    } else if (currentUser?.role === 'member') {
        navigate(MEMBER_ROUTES.MEMBER_DASHBOARD);
    } else {
        // Fallback for guest or undefined role
        navigate(APP_ROUTES.HOME);
    }
};

     return (
    <>
    <div
      className="fixed top-0 left-0 right-0 h-5 z-[60] opacity-0"
      onMouseEnter={() => setShowNav(true)}
    />

    <motion.header
      initial={{ y: -80 }}
      animate={{ y: showNav ? 0 : -80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-2 left-0 right-0 z-[100]"
    >
      <div className="w-[min(95%,1100px)] mx-auto flex justify-between items-center px-4 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-white/30 shadow-lg">
      <div 
        className="flex items-center space-x-2 cursor-pointer group"
        onClick={() => navigate(APP_ROUTES.HOME)}
      >
        <motion.img 
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          src={logo} 
          alt="Logo" 
          className="h-10 w-10 object-cover rounded-full" 
          style={{ 
            background: 'transparent',
            filter: 'brightness(1.2) contrast(1.1)',
            mixBlendMode: 'darken'
          }}
        />
        <span className="font-bold text-2xl text-red-500 group-hover:text-red-600 transition-colors">
          Chicken Kitchen
        </span>
      </div>

      <nav>
        <ul className="flex items-center space-x-8">
          {navLinks.map((link) => (
            <li key={link.name} className="relative">
              <NavLink to={link.path}>
                {({ isActive }) => (
                  <motion.span
                    whileHover={{ y: -2 }}
                    className={`inline-block cursor-pointer ${
                        isActive ? 'font-semibold text-red-500' : 'text-gray-600'
                    } hover:text-red-900`}
                  >
                    {link.name}
                    
                    {isActive && (
                      <motion.div
                        className="absolute bottom-[-5px] left-0 w-full h-1 bg-red-500"
                        layoutId="underline"
                      />
                    )}
                  </motion.span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

    <div className="flex items-center space-x-5 relative">
        <motion.div 
            whileHover={{ scale: 1.2 }} 
            className={`cursor-pointer z-10 relative transition-colors duration-300 ${
                isSearchOpen ? 'text-red-500' : 'text-gray-700'
            }`}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
            <FaSearch size={20} />

            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                      key="search-pop"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: [0.16,1,0.3,1] as any }}
                      className="absolute top-full right-0 mt-3"
                    >
                      <input
                        ref={searchInputRef}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const q = searchTerm.trim();
                            if (q) navigate(`/menu?q=${encodeURIComponent(q)}`);
                            setIsSearchOpen(false);
                          }
                        }}
                        placeholder="Search menu..."
                        className="w-56 h-9 px-3 text-sm rounded-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-gray-500"
                        onBlur={() => setIsSearchOpen(false)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
        <motion.div 
            ref={cartIconRef}
            whileHover={{ scale: 1.2 }} 
            className={`cursor-pointer text-gray-700 relative ${cartBounce ? 'cart-bounce-animation' : ''}`}
            onClick={() => navigate(APP_ROUTES.CART)}
            style={{ zIndex: 10 }}
        >
            <FaShoppingCart size={20} />
            {cartItemCount > 0 && (
              <motion.div
                key={`cart-badge-${cartItemCount}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-lg border-2 border-white"
                style={{ zIndex: 20 }}
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </motion.div>
            )}
        </motion.div>

        <div className="w-px h-6 bg-gray-300"></div>
            {currentUser ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200"
                        >
                            {currentUser.photoURL ? (
                                <img 
                                    src={currentUser.photoURL} 
                                    alt={currentUser.displayName || 'User'}
                                    className="w-6 h-6 rounded-full"
                                />
                            ) : (
                                <FaUserAlt className="text-gray-700" size={20} />
                            )}
                            <span className="font-semibold text-gray-800">
                                {currentUser.displayName || currentUser.email || 'User'}
                            </span>
                        </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 border-gray-300">
                        <DropdownMenuItem onClick={() => navigate(MEMBER_ROUTES.MEMBER_PROFILE)}>
                            My Profile
                        </DropdownMenuItem>
                        <div className="h-px bg-gray-200 my-1 -mx-1" />
                        <DropdownMenuItem onClick={handleDashboardClick}>
                            Dashboard
                        </DropdownMenuItem>
                        <div className="h-px bg-gray-200 my-1 -mx-1" />
                        <DropdownMenuItem onClick={() => navigate(APP_ROUTES.ORDER_HISTORY)}>
                            Order History
                        </DropdownMenuItem>
                        <div className="h-px bg-gray-200 my-1 -mx-1" />
                        <DropdownMenuItem>Payment</DropdownMenuItem>
                        <div className="h-px bg-gray-200 my-1 -mx-1" />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <motion.button
                    onClick={openLogin}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md transition-colors"
                >
                    <FaSignInAlt size={18} />
                    <span className="font-medium">Login</span>
                </motion.button>
            )
        }
      </div>
      </div>
    </motion.header>

  <LoginModal open={isModalOpen} onOpenChange={setIsModalOpen} />

  {/* Flying dish animations */}
  <AnimatePresence>
    {flyingImages.map((item) => {
      if (!cartIconRef.current) return null;
      
      const cartRect = cartIconRef.current.getBoundingClientRect();
      const endX = cartRect.left + cartRect.width / 2;
      const endY = cartRect.top + cartRect.height / 2;

      return (
        <motion.div
          key={item.id}
          initial={{ 
            x: item.startX, 
            y: item.startY,
            scale: 1,
            opacity: 1 
          }}
          animate={{ 
            x: endX, 
            y: endY,
            scale: 0.2,
            opacity: 0.8
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.8,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          className="fixed pointer-events-none z-[200]"
          style={{
            width: '80px',
            height: '80px',
          }}
        >
          <img 
            src={item.imageUrl} 
            alt="Flying dish"
            className="w-full h-full object-cover rounded-full shadow-lg"
          />
        </motion.div>
      );
    })}
  </AnimatePresence>
    </>
  );
};