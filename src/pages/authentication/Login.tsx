import React from 'react';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';

import logo from '../../assets/img/logo.png';
import charactersImage from '../../assets/img/LoginBg.png';


const discordLogoUrl = 'https://static.vecteezy.com/system/resources/previews/023/741/147/non_2x/discord-logo-icon-social-media-icon-free-png.png';
const googleLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png';
const facebookLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png';

// Login Header
const Header: React.FC = () => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.2 }}
      className="absolute top-0 left-0 w-full flex justify-between items-center p-6 md:p-10 z-20"
    >
      <div className="flex items-center space-x-3">
        <img src={logo} alt="Chicken Kitchen Logo" className="h-16" />
        <span className="text-red-500 font-bold text-2xl md:text-3xl">Chicken Kitchen</span>
      </div>
      <button 
        className="bg-[#e88b8b] text-white font-bold py-2 px-6 rounded-full transition-colors hover:bg-[#d47373]"
      >
        EXPLORE
      </button>
    </motion.header>
  );
};

// Login box
const LoginBox: React.FC = () => {
  return (
    <div className="inline-flex items-center bg-[#f7eaea] rounded-full p-1 cursor-pointer">
      <span className="px-8 py-2 font-bold text-[#c58d8d]">Login now</span>
    </div>
  );
};

// Hero
const Hero: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }} 
      className="flex flex-col items-center text-center pb-3 px-4 mt-12 max-w-[70%] md:max-w-[60%] mx-auto"
    >
      <div className="text-2xl md:text-4xl font-bold text-red-500">
        <h1>COUNT YOUR SALORIES</h1>
        <h1>SAVOR YOUR TASTE</h1>
      </div>

      <div className="mt-4 h-24 mb-0"> 
        <TypeAnimation
          sequence={[1000, 'Explore a diverse and flavorful menu or customize your own meal by selecting each ingredient to match your preference', 2000, '']}
          wrapper="p"
          cursor={true}
          repeat={Infinity}
          className="text-gray-500 text-base md:text-lg"
        />
      </div>
      
      <div>
        <LoginBox />
      </div>

      <div className="flex justify-center space-x-6 mt-6">
        <img src={discordLogoUrl} alt="Discord Logo" className="w-12 h-12 rounded-full object-cover shadow-md cursor-pointer hover:scale-105 transition-transform duration-200" />
        <img src={googleLogoUrl} alt="Google Logo" className="w-12 h-12 rounded-full object-cover shadow-md cursor-pointer hover:scale-105 transition-transform duration-200" />
        <img src={facebookLogoUrl} alt="Facebook Logo" className="w-12 h-12 rounded-full object-cover shadow-md cursor-pointer hover:scale-105 transition-transform duration-200" />
      </div>
    </motion.div>
  );
};

// Char Img
const Characters: React.FC = () => {
  return (
    <div className="text-center -mt-16"> 
      <motion.img 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }} 
        src={charactersImage} 
        alt="Chicken Kitchen Characters" 
        className="max-w-[80%] h-auto inline-block max-h-[90%]" 
      />
    </div>
  );
};

function Login() {
  return (
    <div className="bg-white h-screen relative overflow-hidden">
      <Header />
      <div className="max-w-6xl mx-auto h-full flex flex-col pt-24 md:pt-28">
        <main className="flex-1 flex flex-col justify-center items-center relative z-10">
          <Hero />
        </main>
        <Characters />
      </div>
    </div>
  );
}

export default Login;