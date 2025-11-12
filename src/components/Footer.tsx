import React, { useEffect, useState } from 'react';
import { FaGoogle, FaInstagram, FaFacebook, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { storeService, type Store } from '@/services/storeService';
import { ContactModal } from './ContactModal';

import logo from '../assets/img/Logo.png'; 

const footerLinks = {
  about: [
    { name: "Our Story", path: "/story" },
    { name: "Our Locations", path: "/restaurants" },
    { name: "Current Deals", path: "/deals" },
    { name: "Contact Us", path: "#" }
  ],
  menu: [
    { name: "Menu", path: "/menu" },
    { name: "Custom", path: "/custom-order" },
    { name: "Dessert", path: "#" },
    { name: "Take & Bake", path: "#" }
  ],
};

const FooterLinkColumn: React.FC<{ title: string; links: Array<{ name: string; path: string }>; onNavigate: (path: string) => void; onContactClick?: () => void }> = ({ title, links, onNavigate, onContactClick }) => (
  <div>
    <h3 className="font-bold uppercase text-gray-800 tracking-wider mb-4">{title}</h3>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.name}>
          <span
            onClick={() => {
              if (link.name === "Contact Us" && onContactClick) {
                onContactClick();
              } else {
                onNavigate(link.path);
              }
            }}
            className="text-gray-600 cursor-pointer"
          >
            {link.name}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const LocationColumn: React.FC<{ stores: Store[]; onStoreClick: (storeId: number) => void }> = ({ stores, onStoreClick }) => (
  <div>
    <h3 className="font-bold uppercase text-gray-800 tracking-wider mb-4">Our Location</h3>
    <ul className="space-y-2">
      {stores.slice(0, 4).map((store) => (
        <li key={store.id}>
          <span 
            onClick={() => onStoreClick(store.id)}
            className="text-gray-600 flex items-center gap-2 py-1 cursor-pointer"
          >
            <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" size={14} />
            <span className="line-clamp-1">
              {store.name}
            </span>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await storeService.getAll();
        setStores(data);
      } catch (error) {
        console.error('Failed to load stores for footer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleStoreClick = (storeId: number) => {
    navigate(`/restaurants?storeId=${storeId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (path: string) => {
    if (path !== '#') {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  return (
    <footer className="w-full bg-[#FEF1E1] text-gray-700">
      <div className="max-w-7xl mx-auto py-16 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={logo} 
                alt="Foody Logo" 
                className="h-10 w-10 object-cover rounded-full" 
                style={{ 
                  background: 'transparent',
                  filter: 'brightness(1.2) contrast(1.1)',
                  mixBlendMode: 'darken'
                }}
              />
              <span className="font-bold text-2xl text-red-500">Chicken Kitchen</span>
            </div>
            <p className="text-gray-600 text-sm">
              Master your meals, conquer your goals. Here, you're the chef. Craft your own unique meal with your favorite ingredients, or grab a delicious option from our set menu.
            </p>
            <div className="flex space-x-4 mt-6">
              <a 
                href="#" 
                className="text-gray-500 focus:outline-none"
              >
                <FaGoogle size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-500 focus:outline-none"
              >
                <FaFacebook size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-500 focus:outline-none"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          <FooterLinkColumn 
            title="About Us" 
            links={footerLinks.about} 
            onNavigate={handleLinkClick}
            onContactClick={handleContactClick}
          />
          <FooterLinkColumn title="Our Menu" links={footerLinks.menu} onNavigate={handleLinkClick} />
          {loading ? (
            <div>
              <h3 className="font-bold uppercase text-gray-800 tracking-wider mb-4">Our Location</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">High Tech Park</li>
              </ul>
            </div>
          ) : (
            <LocationColumn stores={stores} onStoreClick={handleStoreClick} />
          )}
        </div>
      </div>

      <div className="border-t border-gray-300">
        <div className="max-w-7xl mx-auto py-4 px-8 flex justify-between items-center text-sm text-gray-500">
          <span>Copyright © 2025 The Chicken Kitchen</span>
          <span>Powered by The Chicken Kitchen</span>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </footer>
  );
};