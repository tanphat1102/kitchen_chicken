import React from 'react';
import { FaPlus } from 'react-icons/fa';

interface MenuItemCardProps {
  imageUrl: string;
  title: string;
  description: string;
  // price: number; 
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ imageUrl, title, description, price }) => {
  return (
    <div className="relative font-sans w-full max-w-[260px] mx-auto pt-16 group transition-transform duration-300 hover:scale-105">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-lg">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        </div>
      </div> 

      <div className="relative rounded-3xl shadow-lg flex flex-col min-h-[280px] overflow-hidden">
        
        <div className="h-10 bg-red-600 rounded-t-3xl"></div>
        
        <div className="relative bg-white rounded-b-3xl p-4 pt-20 text-center flex flex-col flex-grow">
          
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-red-600 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              {description}
            </p>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <p className="text-2xl font-bold text-red-600">
              {/* {price.toFixed(2)}$ */}
            </p>
            <button className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors">
              <FaPlus />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;