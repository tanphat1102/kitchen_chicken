import React from 'react';
import { motion } from 'framer-motion';
import { FaGoogle ,FaInstagram, FaFacebook } from "react-icons/fa";

import logo from '../assets/img/Logo.png'; 

const footerLinks = {
  about: ["Our Story", "Our Locations", "Current Deals", "Contact Us"],
  menu: ["Dishes", "Custom", "Dessert", "Take & Bake"],
  locations: ["Tí Đô", "Tí Quậy", "Tí Nữa", "Tí Tẹo"],
};

const FooterLinkColumn: React.FC<{ title: string; links: string[] }> = ({ title, links }) => (
  <div>
    <h3 className="font-bold uppercase text-gray-800 tracking-wider mb-4">{title}</h3>
    <ul className="space-y-2">
      {links.map(link => (
        <li key={link}>
          <a href="#" className="text-gray-600 hover:text-red-500 transition-colors">
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#FEF1E1] text-gray-700">
      <div className="max-w-7xl mx-auto py-16 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="Foody Logo" className="h-10 w-10" />
              <span className="font-bold text-2xl text-red-500">Chicken Kitchen</span>
            </div>
            <p className="text-gray-600 text-sm">
              Master your meals, conquer your goals. Here, you're the chef. Craft your own unique meal with your favorite ingredients, or grab a delicious option from our set menu.
            </p>
            <div className="flex space-x-4 mt-6">
                <a href="#" className="text-gray-500 hover:text-red-500"><FaGoogle size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-red-500"><FaFacebook  size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-red-500"><FaInstagram size={20} /></a>
            </div>
          </div>

          <FooterLinkColumn title="About Us" links={footerLinks.about} />
          <FooterLinkColumn title="Our Menu" links={footerLinks.menu} />
          <FooterLinkColumn title="Our Location" links={footerLinks.locations} />
        </div>
      </div>

      <div className="border-t border-gray-300">
        <div className="max-w-7xl mx-auto py-4 px-8 flex justify-between items-center text-sm text-gray-500">
          <span>Copyright © 2025 The Chicken Kitchen</span>
          <span>Powered by The Chicken Kitchen</span>
        </div>
      </div>
    </footer>
  );
};