import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaGoogle, FaDiscord , FaFacebook, FaUserAlt } from "react-icons/fa";
import { Modal } from '../components/ui/modal';

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
  { name: "Custom", path: "/custom" },
  { name: "Services", path: "/services" },
  { name: "Restaurants", path: "/restaurants" },
];

export const Navbar: React.FC = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loginService, setLoginService] = useState("");

    const [user, setUser] = useState<{ name: string } | null>(null);

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


const handleProceedLogin = () => {
        setUser({ name: "Paw Pasta" }); 
        setIsModalOpen(false);
    };

const handleLoginClick = (service: string) => {
        setLoginService(service);
        setIsModalOpen(true);
    };

const handleLogout = () => {
        setUser(null);
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
      <div className="flex items-center space-x-2">
        <img src={logo} alt="Logo" className="h-10 w-10" />
        <span className="font-bold text-2xl text-red-500">Chicken Kitchen</span>
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
        <motion.div whileHover={{ scale: 1.2 }} className="cursor-pointer text-gray-700">
            <FaShoppingCart size={20} />
        </motion.div>

        <div className="w-px h-6 bg-gray-300"></div>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md"
                        >
                        <FaUserAlt className="text-gray-700" size={20} />
                        <span className="font-semibold text-gray-800">{user.name}</span>
                        </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 border-gray-300">
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <div className="h-px bg-gray-200 my-1 -mx-1" />
                            <DropdownMenuItem>Payment</DropdownMenuItem>
                            <div className="h-px bg-gray-200 my-1 -mx-1" />
                            <DropdownMenuItem>Orders</DropdownMenuItem>
                            <div className="h-px bg-gray-200 my-1 -mx-1" />
                            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center space-x-5">
                           <motion.div onClick={() => handleLoginClick('Google')} whileHover={{ scale: 1.2 }} className="cursor-pointer text-gray-700">
                                <FaGoogle size={20} />
                            </motion.div>
                            <motion.div onClick={() => handleLoginClick('Discord')} whileHover={{ scale: 1.2 }} className="cursor-pointer text-gray-700">
                                <FaDiscord size={20} />
                            </motion.div>
                            <motion.div onClick={() => handleLoginClick('Facebook')} whileHover={{ scale: 1.2 }} className="cursor-pointer text-gray-700">
                                <FaFacebook size={20} />
                            </motion.div>
                        </div>
                    )
            }
      </div>
      </div>
    </motion.header>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <p className="text-gray-600">
                You are about to log in with <span className="font-bold text-red-500">{loginService}</span>.
            </p>
            <button 
                onClick={handleProceedLogin}
                className="mt-6 bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
            >
            Proceed
            </button>
        </div>
    </Modal>
    </>
  );
};