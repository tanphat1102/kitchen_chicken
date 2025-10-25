import React, { useState, useRef, useEffect } from 'react';
import { FaStore, FaChevronDown } from 'react-icons/fa';
import { type Store } from '@/services/storeService';
import { motion } from 'framer-motion'; 

interface StoreSelectorProps {
  stores: Store[];
  selectedStoreId: number | null;
  onSelect: (storeId: number) => void;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({
  stores,
  selectedStoreId,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedStore = stores.find(store => store.id === selectedStoreId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (storeId: number) => {
    onSelect(storeId);
    setIsOpen(false);
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
      >
        <FaStore className="text-gray-600" />
        <span className="font-semibold text-gray-800">
          {selectedStore ? selectedStore.name : 'Choose Store'}
        </span>
        <FaChevronDown 
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-30 right-0 mt-2 w-72 bg-white rounded-lg shadow-xl overflow-hidden"
        >
          <ul className="max-h-60 overflow-y-auto">
            {stores.map(store => (
              <li
                key={store.id}
                onClick={() => handleSelect(store.id)}
                className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-100 ${
                  store.id === selectedStoreId ? 'bg-gray-100' : ''
                }`}
              >
                <FaStore className="text-red-500" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{store.name}</p>
                  <p className="text-xs text-gray-500 truncate">{store.address}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};