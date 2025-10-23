import {useState, useRef, useEffect} from 'react';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import { FaPlay, FaShippingFast, FaShoppingBag } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import TodayEmblaCarousel from '@/modules/Homepage/TodayEmblaCarousel';
import { dailyMenuService, type DailyMenuItem} from '@/services/dailyMenuService';
import { menuItemsService, type MenuItem } from '@/services/menuItemsService';
import { storeService, type Store } from '@/services/storeService';
import { StoreSelector } from '@/modules/Homepage/storeSelector'; 

import SaladBowl from '../../assets/img/HeroImg.png';


function Homepage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [allStores, setAllStores] = useState<Store[]>([]);
  const [allDailyMenus, setAllDailyMenus] = useState<DailyMenuItem[]>([]);
  
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const [currentDailyMenu, setCurrentDailyMenu] = useState<DailyMenuItem | null>(null);
  const [todayFullMenuItems, setTodayFullMenuItems] = useState<MenuItem[]>([]);

  const todayMenuRef = useRef<HTMLElement | null>(null);

// Load stores & all daily menu
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [stores, dailyMenus] = await Promise.all([
          storeService.getAllStores(),
          dailyMenuService.getAllDailyMenus() 
        ]);

        setAllStores(stores);
        setAllDailyMenus(dailyMenus);

        if (stores.length > 0) {
          setSelectedStoreId(stores[0].id);
        } else {
          setLoading(false); 
        }
        console.log('Fetched initial data:', { stores, dailyMenus });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch initial data');
        setLoading(false); 
      }
    };

    fetchGlobalData();
  }, []); 

  // Load detailed menu for selected store (using summary list to locate today's id)
  useEffect(() => {
    if (!selectedStoreId || allDailyMenus.length === 0) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    (async () => {
      try {
        setLoading(true);
        // First find summary by date only
        const summary = allDailyMenus.find((m) => (m.menuDate || '').split('T')[0] === todayStr);
        if (!summary) {
          setCurrentDailyMenu(null);
          setLoading(false);
          return;
        }
        // Then load detailed record (has storeList and items)
        const detailed = await dailyMenuService.getDailyMenuById(summary.id);
        if (!detailed) {
          setCurrentDailyMenu(null);
          setLoading(false);
          return;
        }
        //ensure store exists in detailed.storeList if provided
        const hasStore = !selectedStoreId
          ? true
          : !!(detailed && Array.isArray(detailed.storeList) && detailed.storeList.some((s) => s.storeId === selectedStoreId));
        setCurrentDailyMenu(hasStore ? detailed : null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load today\'s menu');
        setCurrentDailyMenu(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [allDailyMenus, selectedStoreId]); 

  useEffect(() => {
    const fetchMenuItemDetails = async () => {
      if (!currentDailyMenu) {
        setTodayFullMenuItems([]);
        setLoading(false); 
        return;
      }
      
      setLoading(true); 
      
      try {
        const itemIds = (currentDailyMenu.itemList || []).map(item => item.menuItemId);
        if (itemIds.length === 0) {
           setTodayFullMenuItems([]);
           setLoading(false);
           return;
        }
        
        const fetchPromises = itemIds.map(id => menuItemsService.getMenuItemById(id));
        const fullMenuItems = await Promise.all(fetchPromises);

        setTodayFullMenuItems(fullMenuItems);
        
      } catch (err: any) {
        setError(err.message || 'Failed to fetch menu item details');
      } finally {
        setLoading(false); 
      }
    };

    fetchMenuItemDetails();
  }, [currentDailyMenu]); 

  if (loading) {
    return <div>Loading menu...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

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
      <section className="font-sans bg-white h-screen flex items-center p-8">
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
      <section ref={todayMenuRef} className="bg-white py-20 flex items-center justify-center">
        <div className="relative w-full max-w-[1300px]">

         <div className="flex justify-end px-4 md:px-0 mb-1">
            <Link 
              to="/menu" 
              className="text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              View more
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-16 px-4 md:px-0">
            <div className="flex items-center gap-4">
              <div className="w-2 h-16 bg-red-600"></div>
              <div>
                <h2 className="text-4xl font-bold text-red-600">Today Menu</h2>
                <p className="text-gray-500 mt-2">Discover our most loved, crafted for taste and health.</p>
              </div>
            </div>
            
            <StoreSelector 
              stores={allStores}
              selectedStoreId={selectedStoreId}
              onSelect={setSelectedStoreId}
            />
          </div>
  
          <div className="mx-12 relative">
            {loading ? (
              <div className="text-center py-20">Loading menu...</div>
            ) : error ? (
              <div className="text-center py-20 text-red-500">Error: {error}</div>
            ) : todayFullMenuItems.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                No menu items available for this store today.
              </div>
            ) : (
              <TodayEmblaCarousel items={todayFullMenuItems} />
            )}
          </div>
        </div>
      </section>

    {/* Get Started*/}
    <section className="bg-white py-24 px-8">
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
              to="/custom" 
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
