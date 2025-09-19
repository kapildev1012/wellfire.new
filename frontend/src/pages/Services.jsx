import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const [products, setProducts] = useState({
    mediaproduction: [],
    lineproductionservices: [],
    governmentsubsidyguidance: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  const services = [
    {
      title: "MEDIA PRODUCTION",
      subtitle: "Excellence Award for Creative Vision",
      description: "We create original films, series, and digital media that spark ideas, inspire audiences, and push creative boundaries.",
      target: "Media Production",
      category: "mediaproduction",
      defaultImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2059&q=80"
    },
    {
      title: "LINE PRODUCTION SERVICES",
      subtitle: "International Recognition for Global Support", 
      description: "Beyond our own projects, we offer line production services to filmmakers, studios, and production houses worldwide.",
      target: "Line Production Services",
      category: "lineproductionservices",
      defaultImage: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2050&q=80"
    },
    {
      title: "GOVERNMENT SUBSIDY GUIDANCE",
      subtitle: "Industry Award for Financial Innovation",
      description: "When producing internationally, we help you access government subsidies and incentives in foreign lands.",
      target: "Government Subsidy Guidance", 
      category: "governmentsubsidyguidance",
      defaultImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
        const response = await axios.get(`${backendUrl}/api/investment-product/list`);
        
        if (response.data.success && response.data.products) {
          const allProducts = response.data.products;
          
          const groupedProducts = {
            mediaproduction: allProducts.filter((item) => 
              item.category?.toLowerCase() === "media production"
            ),
            lineproductionservices: allProducts.filter((item) => 
              item.category?.toLowerCase() === "line production services"
            ),
            governmentsubsidyguidance: allProducts.filter((item) => 
              item.category?.toLowerCase() === "government subsidy guidance"
            ),
          };

          setProducts(groupedProducts);
          
          // Set default selected product for current slide
          const currentProducts = groupedProducts[services[0].category];
          if (currentProducts && currentProducts.length > 0) {
            setSelectedProduct(currentProducts[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Update selected product when slide changes
  useEffect(() => {
    const currentProducts = products[services[currentSlide].category] || [];
    if (currentProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(currentProducts[0]);
    } else if (currentProducts.length === 0) {
      setSelectedProduct(null);
    }
  }, [currentSlide, products, selectedProduct]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isLoading) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          const newSlide = (prev + 1) % services.length;
          const newProducts = products[services[newSlide].category] || [];
          if (newProducts.length > 0) {
            setSelectedProduct(newProducts[0]);
          }
          return newSlide;
        });
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isLoading, services.length, products]);

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const newSlide = (prev + 1) % services.length;
      const newProducts = products[services[newSlide].category] || [];
      if (newProducts.length > 0) {
        setSelectedProduct(newProducts[0]);
      }
      return newSlide;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const newSlide = (prev - 1 + services.length) % services.length;
      const newProducts = products[services[newSlide].category] || [];
      if (newProducts.length > 0) {
        setSelectedProduct(newProducts[0]);
      }
      return newSlide;
    });
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleProductClick = (product) => {
    window.scrollTo(0, 0);
    navigate(`/photo#${services[currentSlide].target}`, { state: { product } });
  };

  if (isLoading) {
    return (
      <section className="relative w-full h-screen bg-black flex items-center justify-center mobile-full-width">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-sm md:text-xl font-light tracking-[0.2em] animate-pulse hardware-accelerated"
        >
          LOADING...
        </motion.div>
      </section>
    );
  }

  const currentProducts = products[services[currentSlide].category] || [];
  const backgroundImage = selectedProduct?.coverImage || selectedProduct?.image || services[currentSlide].defaultImage;

  // Calculate dynamic height based on number of products
  const calculateDynamicHeight = () => {
    const productCount = currentProducts.length;
    
    if (productCount === 0) {
      return 'min-h-screen lg:h-screen'; // Default height for no products
    }
    
    if (productCount <= 3) {
      return 'min-h-screen lg:h-screen'; // Standard height for 1-3 products
    }
    
    if (productCount <= 6) {
      return 'min-h-[120vh] lg:min-h-screen'; // Slightly taller for 4-6 products
    }
    
    // For 7+ products, calculate height based on product count
    const extraHeight = Math.min((productCount - 6) * 10, 40); // Add up to 40vh extra
    return `min-h-[${120 + extraHeight}vh] lg:min-h-screen`;
  };

  const dynamicHeight = calculateDynamicHeight();

  return (
    <section className={`relative md:left-25 w-full ${dynamicHeight} bg-black overflow-hidden services-page mobile-full-width`}>
      {/* Fullscreen Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentSlide}-${selectedProduct?._id}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Enhanced Design */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 md:left-6 xl:left-10 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 xl:w-16 xl:h-16 rounded-full border-2 border-white/20 bg-black/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 group shadow-lg hover:shadow-2xl hover:scale-110 touch-target"
        aria-label="Previous service"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 xl:w-7 xl:h-7 group-hover:scale-110 transition-transform duration-200 -ml-0.5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 md:right-6 xl:right-10 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 xl:w-16 xl:h-16 rounded-full border-2 border-white/20 bg-black/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 group shadow-lg hover:shadow-2xl hover:scale-110 touch-target"
        aria-label="Next service"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 xl:w-7 xl:h-7 group-hover:scale-110 transition-transform duration-200 ml-0.5" />
      </button>

      {/* Main Content */}
      <div className={`relative z-10 ${currentProducts.length > 6 ? 'min-h-[30vh]' : 'min-h-[30vh]'} lg:h-full flex flex-col lg:flex-row px-4 sm:px-6 md:px-8 lg:px-16 xl:px-32 2xl:px-32 services-content mobile-padding`}>
        
        {/* Content Section */}
        <div className="w-full lg:w-3/5 h-auto lg:h-full flex flex-col justify-between py-2 sm:py-4 md:py-6 lg:py-12 services-content-section">
          {/* Header */}
          <div className="flex justify-between items-start mb-2 sm:mb-4 lg:mb-0 services-header">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block"
            >
              <h1 className="text-xs sm:text-sm md:text-lg xl:text-2xl font-bold text-white tracking-[0.15em] sm:tracking-[0.2em] mb-2 md:mb-4 hardware-accelerated">
                WELLFIRE STUDIO
              </h1>
              <p className="text-white/60 text-xs md:text-sm font-light tracking-[0.1em] sm:tracking-[0.15em] hardware-accelerated">
                CREATIVE SERVICES
              </p>
            </motion.div>

            {/* Social Icons */}
            <motion.div
              className="flex gap-2 md:gap-3 xl:gap-4 hidden lg:flex"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <a href="https://www.instagram.com/thewellfiremedianetwork" className="text-white/60 hover:text-white transition-colors touch-target" aria-label="Instagram">
                <div className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 border border-white/30 flex items-center justify-center text-xs font-light tracking-wide">IG</div>
              </a>
              <a href="https://www.youtube.com/@TheWellfirestudios" className="text-white/60 hover:text-white transition-colors touch-target" aria-label="YouTube">
                <div className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 border border-white/30 flex items-center justify-center text-xs font-light tracking-wide">YT</div>
              </a>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white mb-2 sm:mb-4 md:mb-6 tracking-wide leading-tight hardware-accelerated"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {services[currentSlide].title}
                </motion.h2>
                
                <motion.p
                  className="text-white/90 text-sm sm:text-base md:text-lg xl:text-lg font-light leading-relaxed mb-4 sm:mb-6 md:mb-8 max-w-lg mobile-text-wrap"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {services[currentSlide].description}
                </motion.p>

                {/* Mobile GET STARTED Button */}
                <motion.div
                  className="flex lg:hidden justify-center mb-4"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate('/contact');
                    }}
                    className="bg-white text-black px-6 sm:px-8 md:px-10 py-4 text-base sm:text-lg md:text-xl font-medium tracking-wide hover:bg-white/90 transition-colors flex items-center justify-center gap-3 group touch-target-lg btn-primary hardware-accelerated shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    GET STARTED
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>

                <motion.div
                  className="hidden lg:flex flex-col sm:flex-row gap-3 md:gap-4"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate('/contact');
                    }}
                    className="bg-white text-black px-4 sm:px-6 xl:px-8 py-2.5 sm:py-3 text-sm hover:text-black md:text-base font-medium tracking-wide hover:bg-white/90 transition-colors flex items-center justify-center gap-2 group touch-target btn-primary hardware-accelerated"
                  >
                    GET STARTED
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {selectedProduct && (
                    <button
                      onClick={() => handleProductClick(selectedProduct)}
                      className="border border-white/40 text-white px-4 sm:px-6 xl:px-8 py-2.5 sm:py-3 text-sm md:text-base font-light tracking-wide hover:bg-white hover:text-black transition-all duration-300 touch-target hardware-accelerated"
                    >
                      VIEW PROJECT
                    </button>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6 mt-2 sm:mt-4 lg:mt-0 services-bottom-info">
          

            <motion.div
              className="flex items-center gap-4 sm:gap-6 md:gap-8 hidden sm:flex"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <div className="text-white/70 text-sm sm:text-base tracking-wide hardware-accelerated font-medium">
                {currentProducts.length} {currentProducts.length === 1 ? 'PROJECT' : 'PROJECTS'}
              </div>
              
              <div className="text-white font-semibold text-base sm:text-lg xl:text-xl tracking-wide hardware-accelerated">
                {String(currentSlide + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 border-2 border-white/40 bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 touch-target shadow-lg hover:shadow-xl transform hover:scale-110"
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? <Pause className="w-3 h-3 sm:w-3 sm:h-3 xl:w-4 xl:h-4" /> : <Play className="w-3 h-3 sm:w-3 sm:h-3 xl:w-4 xl:h-4 ml-0.5" />}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Product Showcase Section */}
        <div className="w-full lg:w-3/5 h-auto lg:h-full flex items-center justify-center lg:justify-end py-2 sm:py-4 lg:py-0 lg:pr-8 xl:pr-16 2xl:pr-24 services-showcase">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8 }}
                className="space-y-3 sm:space-y-4 md:space-y-5"
              >
                {currentProducts.length > 0 ? (
                  <>
                    {/* Main selected product */}
                    <motion.div
                      className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group shadow-lg"
                      onClick={() => selectedProduct && handleProductClick(selectedProduct)}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={selectedProduct?.coverImage || selectedProduct?.image || services[currentSlide].defaultImage}
                        alt={selectedProduct?.title || selectedProduct?.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 xl:w-16 xl:h-16 border-2 border-white rounded-full flex items-center justify-center backdrop-blur-sm bg-white/20 shadow-lg">
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 xl:w-6 xl:h-6 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      
                      {selectedProduct && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 sm:p-4 xl:p-5">
                          <h3 className="text-white font-semibold text-sm sm:text-base mb-2 mobile-text-wrap">
                            {selectedProduct.title || selectedProduct.name}
                          </h3>
                          <p className="text-white/80 text-sm line-clamp-2 mobile-text-wrap">
                            {selectedProduct.description}
                          </p>
                        </div>
                      )}
                    </motion.div>

                    {/* Product thumbnails */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                      {currentProducts.slice(0, 6).map((product, index) => (
                        <motion.div
                          key={product._id}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 touch-target shadow-md ${
                            selectedProduct?._id === product._id 
                              ? 'border-white scale-105' 
                              : 'border-transparent hover:border-white/50'
                          }`}
                          onClick={() => handleProductSelect(product)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                          <img
                            src={product.coverImage || product.image || services[currentSlide].defaultImage}
                            alt={product.title || product.name}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>

                    {currentProducts.length > 6 && (
                      <motion.div
                        className="text-center pt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                      >
                        <span className="text-white/60 text-xs sm:text-sm font-light tracking-wide">
                          +{currentProducts.length - 6} MORE PROJECTS
                        </span>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <motion.div
                    className="text-center py-4 sm:py-8 xl:py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-white text-lg sm:text-xl">
                      No projects available in this category
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 md:gap-4 z-30 hidden sm:flex">
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              const newProducts = products[services[index].category] || [];
              if (newProducts.length > 0) {
                setSelectedProduct(newProducts[0]);
              }
            }}
            className={`h-1 transition-all duration-500 touch-target ${
              index === currentSlide ? 'bg-white w-8 sm:w-12 md:w-16' : 'bg-white/30 w-4 sm:w-6 md:w-8'
            }`}
            aria-label={`Go to service ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .services-page {
            width: 100vw !important;
            margin-left: -50vw !important;
            left: 50% !important;
            position: relative !important;
            overflow: hidden !important;
          }
          .services-content {
            padding: 1rem !important;
          }
          .services-content-section {
            padding: 1.5rem 1rem !important;
          }
          .services-header {
            margin-bottom: 1.5rem !important;
          }
          .services-showcase {
            padding: 1rem !important;
          }
          .services-bottom-info {
            margin-top: 1rem !important;
            gap: 1rem !important;
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Services;