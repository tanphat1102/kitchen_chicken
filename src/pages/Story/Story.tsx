import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Award, 
  Heart,
  Sparkles,
  Salad,
  Zap,
  Star,
  Drumstick,
  Beef,
  Apple,
  Wheat,
  Droplet
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

const nutritionComponents = [
  {
    icon: Drumstick,
    name: 'Protein',
    color: 'from-red-500 to-red-600',
    description: 'Essential for Building Muscle',
    details: 'High-quality protein sources like chicken breast, fish, and lean meats help build and repair muscle tissue. Our meals provide 30-40g of protein per serving, perfect for maintaining a healthy, active lifestyle.',
    benefits: ['Muscle Growth', 'Tissue Repair', 'Sustained Energy', 'Immune Support']
  },
  {
    icon: Wheat,
    name: 'Carbohydrates',
    color: 'from-amber-500 to-amber-600',
    description: 'Your Primary Energy Source',
    details: 'Complex carbs from whole grains, sweet potatoes, and vegetables provide sustained energy throughout your day. We focus on nutrient-dense carbs that fuel your body without the crash.',
    benefits: ['Sustained Energy', 'Brain Function', 'Athletic Performance', 'Fiber Rich']
  },
  {
    icon: Droplet,
    name: 'Healthy Fats',
    color: 'from-yellow-500 to-yellow-600',
    description: 'Essential for Overall Health',
    details: 'Healthy fats from avocado, olive oil, and nuts support hormone production, brain health, and nutrient absorption. Our meals include the right balance of omega-3 and omega-6 fatty acids.',
    benefits: ['Heart Health', 'Hormone Balance', 'Vitamin Absorption', 'Brain Function']
  },
  {
    icon: Apple,
    name: 'Vitamins & Minerals',
    color: 'from-green-500 to-green-600',
    description: 'Micronutrients for Optimal Health',
    details: 'Fresh vegetables and fruits provide essential vitamins, minerals, and antioxidants. Every meal includes a colorful variety of produce to ensure you get a full spectrum of nutrients.',
    benefits: ['Immune Support', 'Antioxidants', 'Cell Protection', 'Optimal Function']
  }
];

const storyImages = [
  {
    url: 'https://i.pinimg.com/564x/63/2f/ca/632fcaa4b902dd9313497d80a2a1a967.jpg',
    alt: 'Our Kitchen',
    caption: 'Fresh Ingredients, Crafted Daily'
  },
  {
    url: 'https://i.pinimg.com/564x/0b/62/62/0b6262777bff2b25d1b6f6dc5335fcb1.jpg',
    alt: 'Delicious Food',
    caption: 'Made with Love and Passion'
  },
  {
    url: 'https://i.pinimg.com/564x/47/77/eb/4777ebf6890884e4221566960f5de522.jpg',
    alt: 'Happy Customers',
    caption: 'Serving Happiness Since Day One'
  },
  {
    url: 'https://i.pinimg.com/564x/d1/58/20/d1582084c5e124aef9b788410cefff1f.jpg',
    alt: 'Our Team',
    caption: 'A Team That Cares'
  }
];

const Story: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'center'
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeNutrient, setActiveNutrient] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Auto-rotate nutrition components
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNutrient((prev) => (prev + 1) % nutritionComponents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Continuous rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1) % 360);
    }, 50); // Update every 50ms for smooth rotation
    return () => clearInterval(interval);
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section with Slider */}
      <section className="relative w-full bg-white mt-20">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {storyImages.map((image, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Image on the left */}
                    <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Caption on the right */}
                    <div className="flex flex-col justify-center px-4">
                      <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                        {image.caption}
                      </h2>
                      <p className="text-xl text-gray-600 leading-relaxed">
                        {image.alt === 'Our Kitchen' && 
                          "We carefully select the finest ingredients daily to ensure every dish meets our high standards of quality and freshness."}
                        {image.alt === 'Delicious Food' && 
                          "Every meal is prepared with passion and dedication by our talented team of chefs who truly care about what they create."}
                        {image.alt === 'Happy Customers' && 
                          "Our mission has always been to bring joy and satisfaction to every customer through exceptional food and service."}
                        {image.alt === 'Our Team' && 
                          "Behind every great meal is a team that genuinely cares about your experience and satisfaction."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-800 rounded-full p-3 transition-all shadow-xl border border-gray-200 z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-800 rounded-full p-3 transition-all shadow-xl border border-gray-200 z-10"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-2 justify-center mt-8">
            {storyImages.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-3 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'bg-red-500 w-8'
                    : 'bg-gray-300 w-3 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Story Content */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        {/* Our Story */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
            Our Story
          </h1>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-6 leading-relaxed">
              Welcome to <span className="text-red-500 font-semibold">Chicken Kitchen</span>, where passion meets flavor! 
              Our journey began with a simple belief: everyone deserves delicious, nutritious meals made exactly the way they want them.
            </p>
            <p className="mb-6 leading-relaxed">
              We're not just another restaurant - we're your culinary partner. Whether you're a fitness enthusiast tracking every macro, 
              a food lover exploring new tastes, or someone who simply knows what they like, Chicken Kitchen puts you in control. 
              Our innovative platform lets you craft your perfect meal, choosing from premium ingredients and customizing every detail.
            </p>
            <p className="mb-6 leading-relaxed">
              But we understand that sometimes you just want a quick, delicious meal without the fuss. That's why we also offer 
              carefully curated menu options, designed by our chefs to deliver the perfect balance of taste and nutrition.
            </p>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To empower everyone to master their meals and conquer their goals, one delicious bite at a time.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Quality First</h3>
            <p className="text-gray-600">
              We source only the freshest, highest-quality ingredients to ensure every meal exceeds your expectations.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Customer Focused</h3>
            <p className="text-gray-600">
              Your satisfaction is our success. We're here to serve you the food you love, exactly how you want it.
            </p>
          </div>
        </div>

        {/* What Makes Us Special */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-10 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            What Makes Us Special
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Total Customization</h4>
                <p className="text-gray-600">
                  Build your meal from scratch. Choose your protein, sides, sauces, and more. You're the chef here!
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Salad className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Nutritional Transparency</h4>
                <p className="text-gray-600">
                  See complete nutritional information for every ingredient. Make informed choices that align with your goals.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Fast & Fresh</h4>
                <p className="text-gray-600">
                  We prepare your custom order fresh when you order it. Quality without the wait.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Expert Crafted Options</h4>
                <p className="text-gray-600">
                  Not sure what to choose? Try our chef-designed menu items, perfected for maximum flavor.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            Balanced Nutrition in Every Meal
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative flex items-center justify-center">
              <div className="relative w-96 h-96">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-red-100 to-orange-100 rounded-full opacity-30 blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl z-10 backdrop-blur-sm border-4 border-white/30">
                  <div className="text-white text-center">
                    <p className="text-lg font-bold tracking-wide">Perfect</p>
                    <p className="text-sm font-medium opacity-90">Balance</p>
                  </div>
                </div>

                {/* Orbit path - dashed circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border-2 border-dashed border-gray-200 rounded-full"></div>

                {/* Orbiting nutrition components */}
                {nutritionComponents.map((component, index) => {
                  const angle = (index * 360) / nutritionComponents.length + rotationAngle;
                  const radius = 140;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  const isActive = index === activeNutrient;

                  return (
                    <div
                      key={component.name}
                      className="absolute top-1/2 left-1/2 cursor-pointer group"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${isActive ? 1.15 : 1})`,
                        transition: 'transform 0.05s linear, scale 0.3s ease-in-out',
                        zIndex: isActive ? 20 : 10
                      }}
                      onClick={() => setActiveNutrient(index)}
                    >
                      {isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${component.color} rounded-full blur-xl opacity-60 animate-pulse`}></div>
                      )}
                      
                      <div
                        className={`relative w-24 h-24 bg-gradient-to-br ${component.color} rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-4 ${
                          isActive 
                            ? 'border-white shadow-[0_0_30px_rgba(0,0,0,0.3)]' 
                            : 'border-white/50 group-hover:border-white/80 group-hover:scale-110'
                        }`}
                      >
                        <div className="absolute inset-2 bg-white/20 rounded-full backdrop-blur-sm"></div>
                        
                        <div
                          style={{
                            transform: `rotate(-${rotationAngle}deg)`,
                            transition: 'transform 0.05s linear'
                          }}
                          className="flex items-center justify-center"
                        >
                          <component.icon 
                            className="text-white relative z-10 drop-shadow-lg" 
                            size={isActive ? 40 : 32} 
                            strokeWidth={2.5}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side - Information */}
            <div className="space-y-6">
              <div className="transition-all duration-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${nutritionComponents[activeNutrient].color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    {React.createElement(nutritionComponents[activeNutrient].icon, {
                      className: "text-white",
                      size: 32
                    })}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800">
                      {nutritionComponents[activeNutrient].name}
                    </h3>
                    <p className="text-red-500 font-semibold">
                      {nutritionComponents[activeNutrient].description}
                    </p>
                  </div>
                </div>

                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  {nutritionComponents[activeNutrient].details}
                </p>

                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Key Benefits:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {nutritionComponents[activeNutrient].benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation dots */}
                <div className="flex gap-2 mt-6">
                  {nutritionComponents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveNutrient(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === activeNutrient
                          ? 'bg-red-500 w-8'
                          : 'bg-gray-300 w-2 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of satisfied customers who've discovered the joy of personalized, delicious meals. 
              Our expert chefs are ready to craft your perfect meal experience.
            </p>
            <div className="flex gap-4 flex-wrap">
              <a 
                href="/custom-order"
                className="px-8 py-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-lg inline-block"
              >
                Build Your Meal
              </a>
              <a 
                href="/menu"
                className="px-8 py-4 bg-white text-red-500 font-semibold rounded-lg border-2 border-red-500 hover:bg-red-50 transition-colors shadow-lg inline-block"
              >
                View Our Menu
              </a>
            </div>
          </div>

          {/* Right side - Chef Image with Circle Background */}
          <div className="relative flex items-center justify-center">
            {/* Large red circle background */}
            <div className="absolute w-96 h-96 bg-gradient-to-br from-red-100 to-orange-100 rounded-full opacity-40 blur-2xl"></div>
            
            {/* Main circle background */}
            <div className="absolute w-80 h-80 bg-gradient-to-br from-red-200/60 to-orange-200/60 rounded-full"></div>
            
            {/* Chef Image */}
            <div className="relative z-10">
              <img
                src="https://i.pinimg.com/736x/d2/35/47/d2354797cfb995122e8bf0248cb1fd76.jpg"
                alt="Professional Chef"
                className="w-96 h-96 object-cover rounded-full shadow-2xl border-8 border-white"
              />
            </div>
            
            {/* Decorative small circles */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-red-300/40 rounded-full blur-md"></div>
            <div className="absolute bottom-10 left-10 w-16 h-16 bg-orange-300/40 rounded-full blur-md"></div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Story;
