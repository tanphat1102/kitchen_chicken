import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react'; 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { y: "-50px", opacity: 0 },
  visible: { y: "0", opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { y: "50px", opacity: 0 },
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-transparent bg-opacity-50 z-50 flex justify-center items-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose} 
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl p-8 relative w-full max-w-md"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};