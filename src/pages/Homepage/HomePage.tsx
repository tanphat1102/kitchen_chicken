import React, {useState, useEffect, useRef} from 'react';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import { FaPlay, FaShippingFast, FaShoppingBag } from 'react-icons/fa';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import MenuItemCard from '@/modules/Homepage/menuitem-card';
import menuItemsService, { type MenuItem } from '@/services/menuItemsService';

import SaladBowl from '../../assets/img/HeroImg.png';

  const sampleMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Classic Grilled Chicken',
    categoryId: 1,
    categoryName: 'Main Courses',
    isActive: true,
    imageUrl: 'https://i.pinimg.com/564x/a2/2a/d3/a22ad39a2b8510868f051152778b87c7.jpg',
  },
  {
    id: 2,
    name: 'Spicy Buffalo Wings',
    categoryId: 2,
    categoryName: 'Appetizers',
    isActive: true,
    imageUrl: 'https://i.pinimg.com/564x/e7/0b/3e/e70b3e70d4f3b171f1b63c20202534f5.jpg',
  },
  {
    id: 3,
    name: 'Chicken Caesar Salad',
    categoryId: 3,
    categoryName: 'Salads',
    isActive: true,
    imageUrl: 'https://i.pinimg.com/564x/87/1b/30/871b30e060a809b0b144a95acb6b2b73.jpg',
  },
  {
    id: 4,
    name: 'Crispy Chicken Wrap',
    categoryId: 4,
    categoryName: 'Wraps & Sandwiches',
    isActive: true,
    imageUrl: 'https://i.pinimg.com/564x/d1/8a/a5/d18aa54eb0c33d831201389c5b252199.jpg',
  },
  {
    id: 5,
    name: 'Roasted Herb Chicken',
    categoryId: 1,
    categoryName: 'Main Courses',
    isActive: true,
    imageUrl: 'https://i.pinimg.com/564x/c7/28/99/c72899477e6869a215357a74a2b97c7e.jpg',
  },
  {
    id: 6,
    name: 'Garlic Mashed Potatoes',
    categoryId: 5,
    categoryName: 'Sides',
    isActive: true,
    imageUrl: 'https://i.pinimg.com/564x/f3/15/34/f3153406f916b080808226023315a639.jpg',
  },
];

function Homepage() {
  // const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const todayMenuRef = useRef<HTMLElement | null>(null);

  //For sample data
  const [menuItems, setMenuItems] = useState<MenuItem[]>(sampleMenuItems);
  const [loading, setLoading] = useState<boolean>(false);

  // useEffect(() => {
  //   const fetchMenu = async () => {
  //     try {
  //       const token = ""; //Fake token

  //       const items = await menuItemsService.getAllMenuItems(token || undefined);
  //       setMenuItems(items);
  //     } catch (err: any) {
  //       console.error('Error fetching menu:', err);
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchMenu();
  // }, []);

  if (loading) {
    return <div>Loading menu...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  const handleNext = () => {
    if (menuItems.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % menuItems.length);
    }
  };

  const handlePrev = () => {
    if (menuItems.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + menuItems.length) % menuItems.length);
    }
  };

  const handleScrollToMenu = () => {
    if (todayMenuRef.current) {
      todayMenuRef.current.scrollIntoView({
        behavior: 'smooth', 
        block: 'start',  
      });
    }
  };

  return (
    <>
    <Navbar />

    {/* Poster */}
      <section className="font-sans bg-[#FFF7F2] h-screen flex items-center p-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <motion.div
            className="text-left"
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.div
              className="w-16 h-2 bg-red-600 mb-4"
              initial={{ width: 0 }}
              animate={{ width: '4rem' }}
              transition={{ duration: 1, delay: 0.3 }}
            ></motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-bold leading-tight text-gray-800"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              style={{ minHeight: '130px' }}
            >
              <TypeAnimation
                sequence={[
                  'Smart Calories,',
                  1500,
                  'Eat happy.',
                  1500,
                  '', 
                ]}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
                speed={60}
                deletionSpeed={40}
                style={{
                  display: 'inline-block',
                  color: '#fb7185',
                  whiteSpace: 'pre-line',
                }}
              />
              <br />
              <span className="text-orange-400">Savor your taste.</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Discover meals that match your goals — flavorful, balanced, and easy to track.
            </motion.p>

            <motion.div
              className="mt-8 flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Explore Now
              </motion.button>

              <motion.div
                onClick={handleScrollToMenu}
                whileHover={{ rotate: 20, scale: 1.1 }}
                className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
              >
                <FaPlay />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative flex justify-center items-center"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="relative w-full max-w-lg">

              <motion.div
                className="relative w-full h-72 md:h-140 rounded-t-full overflow-hidden shadow-lg"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.5 }}
              >
                <motion.img 
                  src={SaladBowl} 
                  alt="Healthy Salad Bowl" 
                  className="w-full h-full object-cover object-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2 }}
                />
              </motion.div>

              <motion.div
                className="absolute bottom-[-20px] -left-2 z-20 bg-white p-4 rounded-lg shadow-xl flex flex-col gap-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                <div className="flex items-center gap-3">
                  <FaShippingFast className="text-orange-500 text-2xl" />
                  <div>
                    <p className="font-bold">Fast Delivery</p>
                    <p className="text-sm text-gray-500">Promise To Deliver</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaShoppingBag className="text-orange-500 text-2xl" />
                  <div>
                    <p className="font-bold">Pick Up</p>
                    <p className="text-sm text-gray-500">Pickup Delivery</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-200 rounded-full blur-2xl opacity-50 -z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              ></motion.div>
            </div>
          </motion.div>

        </div>
      </section>

    {/* Today Menu */}
      <section ref={todayMenuRef} className="bg-[#FFF7F2] py-20 flex items-center justify-center">
        <div className="relative w-full max-w-[1300px]">
        <div className="flex items-center gap-4 mb-16 px-4 md:px-0">
          <div className="w-2 h-16 bg-red-600"></div>
          <div>
            <h2 className="text-4xl font-bold text-red-600">Today Menu</h2>
            <p className="text-gray-500 mt-2">Discover our most loved, crafted for taste and health.</p>
          </div>
        </div>

        <Link 
          to="/menu" 
          className="absolute top-4 right-4 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors flex items-center gap-1"
        >
          View more
          <span aria-hidden="true">&rarr;</span>
        </Link>

      <div className="mx-12 relative">
        {menuItems.length > 4 && (
          <button 
            onClick={handlePrev}
            className="absolute -left-10 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FaChevronLeft />
          </button>
        )}

        <div className="relative bg-white rounded-[50px] shadow-lg px-8 sm:px-12 lg:px-16 py-12">
          <div className="absolute top-1/2 -translate-y-1/2 -left-7 w-14 h-28 bg-[#FFF7F2] rounded-r-full hidden md:block"></div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-7 w-14 h-28 bg-[#FFF7F2] rounded-l-full hidden md:block"></div>
          
          <div className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7"> 
              {[...menuItems, ...menuItems].slice(currentIndex, currentIndex + 4).map((item) => (
                <motion.div
                  key={item.id + currentIndex} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <MenuItemCard
                    imageUrl={item.imageUrl}
                    title={item.name}
                    description={item.categoryName}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

          {menuItems.length > 4 && (
            <button 
              onClick={handleNext}
              className="absolute -right-10 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
        </div>
      </section>

    {/* Get Started*/}
    <section className="bg-[#FFF7F2] py-24 px-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-sm font-bold text-red-500 tracking-wider">CRAFT YOUR PERFECT MEAL</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2">Get Started Today!</h2>
          <div className="w-20 h-1 bg-red-500 mt-4"></div>

          <p className="mt-6 text-lg font-semibold text-gray-700">
            Build your perfect meal, know your calories, and enjoy delicious, healthy food your way.
          </p>
          <p className="mt-4 text-gray-600">
            Tired of one-size-fits-all meal plans? At Chicken Kitchen, we put you in control. Our step-by-step builder lets you mix and match your favorite ingredients to create a dish that fits your taste and fitness goals perfectly.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/60 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <img 
                src="https://i.pinimg.com/736x/0b/62/62/0b6262777bff2b25d1b6f6dc5335fcb1.jpg" 
                alt="Custom Meal" 
                className="w-full h-40 object-cover" 
              />

              <div className="p-6">
                <h3 className="font-bold text-gray-800 text-lg">Step-by-Step Builder</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Select your base, protein, and veggies. As you build, watch the calories and macros update in real-time.
                </p>
              </div>
            </div>

            <div className="bg-white/60 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"> 
              <img 
                src="https://i.pinimg.com/1200x/c8/21/65/c821656b9931644f0c7d9750c4ad3e83.jpg" 
                alt="Order & Pickup" 
                className="w-full h-40 object-cover" 
              />

              <div className="p-6">
                <h3 className="font-bold text-gray-800 text-lg">Easy Order & Pickup</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Once your perfect meal is ready, place your order for fast delivery or convenient in-store pickup.
                </p>
              </div>
            </div>

          </div>
        </motion.div>

        <motion.div
          className="relative flex justify-center items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative w-full max-w-md aspect-square bg-yellow-300 rounded-full overflow-hidden"> 
            <img 
              src="https://i.pinimg.com/1200x/bd/3c/bb/bd3cbb0ef404f0bad98df743116ac627.jpg" 
              alt="Custom Step" 
              className="absolute inset-0 w-full h-full object-cover object-center" 
            />

            <Link 
              to="/" //Fill link sau
              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-12 bg-white text-red-600 rounded-full 
                        flex items-center justify-center font-bold text-m shadow-lg 
                        hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              aria-label="Customize your meal" 
            >
              Custom Your Meal 
            </Link>
          </div>
        </motion.div>

      </div>
    </section>

    {/* Promotion */}
    {/* Map Stores */}
    <Footer />
    </>
  );
}

export default Homepage;
