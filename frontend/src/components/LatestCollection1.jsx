import axios from "axios";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";

const CategoryShowcase = ({ category, title }) => {
  const { navigate } = useContext(ShopContext);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [investmentProducts, setInvestmentProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log(`🎬 CategoryShowcase component rendered for ${category}`);

  // Test if component is mounting
  useEffect(() => {
    console.log(`🎉 Component ${category} mounted!`);
  }, [category]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch investment products from backend
  useEffect(() => {
    const fetchInvestmentProducts = async () => {
      try {
        console.log(`🔍 Fetching products for ${category}...`);
        setIsLoading(true);

        // Use env backend URL with localhost fallback
        const backendUrl =
          import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
        console.log(`🔗 Using backend URL: ${backendUrl}`);

        const fullUrl = `${backendUrl}/api/investment-product/list`;
        console.log(`📡 Making request to: ${fullUrl}`);

        const response = await axios.get(fullUrl);

        console.log(`📡 API Response for ${category}:`, response.data);
        console.log(`📡 Response status:`, response.status);
        console.log(`📡 Response success:`, response.data.success);
        console.log(`📡 Products array:`, response.data.products);
        console.log(`📡 Products length:`, response.data.products?.length);

        if (response.data.success && response.data.products) {
          setInvestmentProducts(response.data.products);
          console.log(
            `✅ Products loaded for ${category}:`,
            response.data.products.length
          );
        } else {
          console.log(`❌ API returned success: false or no products`);
        }
      } catch (error) {
        console.error(`❌ Error fetching products for ${category}:`, error);
        console.error(`❌ Error details:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } finally {
        setIsLoading(false);
        console.log(`🏁 Fetch completed, isLoading set to false`);
      }
    };

    fetchInvestmentProducts();
  }, [category]);

  // Filter products by category
  useEffect(() => {
    if (investmentProducts.length === 0) return;

    console.log(
      `🎯 Filtering ${category} products from ${investmentProducts.length} total products`
    );

    const filtered = investmentProducts.filter((item) => {
      const itemCategory = item.category?.toLowerCase() || "";
      const targetCategory = category.toLowerCase();

      console.log(
        `🔍 Checking: ${item.productTitle} (${item.category}) against ${category}`
      );

      // Exact match (case-insensitive)
      return itemCategory === targetCategory;
    });

    console.log(
      `🎯 Found ${filtered.length} products for ${category}:`,
      filtered
    );
    setCategoryProducts(filtered);
  }, [investmentProducts, category]);

  const handleImageClick = (product) => {
    // Scroll to top before opening new content
    window.scrollTo(0, 0);

    if (product.youtubeLink) {
      let youtubeUrl = product.youtubeLink;

      // Handle different YouTube link formats
      if (youtubeUrl.includes("youtube.com/watch?v=")) {
        window.open(youtubeUrl, "_blank");
      } else if (youtubeUrl.includes("youtu.be/")) {
        window.open(youtubeUrl, "_blank");
      } else if (youtubeUrl.includes("youtube.com/")) {
        window.open(youtubeUrl, "_blank");
      } else if (youtubeUrl.startsWith("http")) {
        window.open(youtubeUrl, "_blank");
      } else {
        // Try to construct a proper YouTube URL
        const videoId = youtubeUrl
          .replace("youtube.com/watch?v=", "")
          .replace("youtu.be/", "");
        if (videoId && videoId.length > 5) {
          window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
        } else {
          alert("Invalid YouTube link format. Please check the link.");
        }
      }
    } else if (product.videoFile) {
      window.open(product.videoFile, "_blank");
    } else {
      alert("No video content available for this product.");
    }
  };

  const getYouTubeEmbedUrl = (raw) => {
    if (!raw) return null;
    let videoId = null;
    try {
      const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      if (url.hostname.includes("youtu.be")) {
        videoId = url.pathname.replace("/", "");
      } else if (url.searchParams.get("v")) {
        videoId = url.searchParams.get("v");
      } else if (url.pathname.includes("/shorts/")) {
        videoId = url.pathname.split("/shorts/")[1];
      }
    } catch (_) {
      // Fallback simple parsing
      if (raw.includes("youtu.be/")) videoId = raw.split("youtu.be/")[1];
      if (raw.includes("watch?v=")) videoId = raw.split("watch?v=")[1];
    }
    if (!videoId) return null;
    const id = videoId.split("&")[0];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${id}`;
  };

  const getYouTubeWatchUrl = (raw) => {
    if (!raw) return null;
    let embed = getYouTubeEmbedUrl(raw);
    if (!embed) return null;
    const id = embed.split("/embed/")[1]?.split("?")[0];
    if (!id) return null;
    return `https://www.youtube.com/watch?v=${id}`;
  };

  const ProductCard = ({
    product,
    className = "",
    showTitle = true,
    isScrolling = false,
    isVertical = false,
    isRightSide = false,
  }) => (
    <motion.div
      className={`relative overflow-hidden bg-black group ${className}`}
      initial={isScrolling ? { opacity: 0, y: 20 } : {}}
      animate={isScrolling ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={isRightSide ? { aspectRatio: "5/2" } : {}}
      onClick={() => handleImageClick(product)}
    >
      <div className="relative w-full h-full group">
        <img
          src={
            product?.coverImage ||
            product?.image ||
            "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt={product?.productTitle || product?.name || "Product"}
          className={`w-full h-full transition-transform duration-700 group-hover:scale-110 cursor-pointer ${
            isVertical || isRightSide ? "object-cover" : "object-contain"
          }`}
          onClick={() => handleImageClick(product)}
        />

        {/* Click-through overlay to ensure navigation */}
        {getYouTubeWatchUrl(product.youtubeLink) && (
          <a
            href={getYouTubeWatchUrl(product.youtubeLink)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-20"
            aria-label="Open on YouTube"
          />
        )}

        {/* Category Chip */}
        {product?.category && (
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] rounded-full bg-white/10 text-white border border-white/20 backdrop-blur">
              {product.category}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Content Overlay */}
        {showTitle && product && (
          <motion.div
            className={`absolute bottom-0 left-0 right-0 ${
              isVertical || isRightSide ? "p-1.5 sm:p-2" : "p-2 sm:p-3"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3
              className={`uppercase tracking-wider leading-tight mb-0.5 text-white font-bold ${
                isVertical || isRightSide
                  ? "text-[8px] sm:text-[10px]"
                  : "text-[10px] sm:text-xs"
              }`}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: "800",
              }}
            >
              {product.productTitle || product.name}
            </h3>
            <div
              className={`flex items-center gap-1 ${
                isVertical || isRightSide
                  ? "text-[7px] sm:text-[8px]"
                  : "text-[8px] sm:text-[10px]"
              }`}
            >
              <span className="text-gray-400 font-semibold">
                {product.artistName || product.category || "N/A"}
              </span>
              {product.youtubeLink && (
                <span className="text-red-400 font-semibold flex items-center gap-0.5">
                  <svg
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.5 6.2s-.2-1.6-.8-2.3c-.8-.8-1.7-.8-2.1-.9C17.8 2.8 12 2.8 12 2.8h0s-5.8 0-8.6.3c-.4 0-1.3.1-2.1.9-.6.7-.8 2.3-.8 2.3S0 8.1 0 10v1.9c0 1.9.2 3.8.2 3.8s.2 1.6.8 2.3c.8.8 1.8.8 2.3.9 1.7.2 7.2.3 8.7.3 0 0 5.8 0 8.6-.3.4 0 1.3-.1 2.1-.9.6-.7.8-2.3.8-2.3s.2-1.9.2-3.8V10c0-1.9-.2-3.8-.2-3.8zM9.6 13.8V7.9l6.1 3-6.1 2.9z" />
                  </svg>
                  Watch
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  // Video-only card for right-side slider with YouTube thumbnails
  const ProductVideoCard = ({ product, className = "", isYouTubeThumbnail = false }) => (
    <motion.div
      className={`relative overflow-hidden bg-black group ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={isYouTubeThumbnail ? { aspectRatio: "16/9" } : { aspectRatio: "5/2" }}
      onClick={() => handleImageClick(product)}
    >
      <div className="relative w-full h-full group">
       
        {/* Show YouTube thumbnail or video */}
        {isYouTubeThumbnail && getYouTubeWatchUrl(product.youtubeLink) ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${getYouTubeEmbedUrl(product.youtubeLink).split('/embed/')[1]?.split('?')[0]}/maxresdefault.jpg`}
              alt={product?.productTitle || "YouTube Thumbnail"}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to lower quality if maxresdefault not available
                e.target.src = `https://img.youtube.com/vi/${getYouTubeEmbedUrl(product.youtubeLink).split('/embed/')[1]?.split('?')[0]}/hqdefault.jpg`;
              }}
            />
          
          </>
        ) : getYouTubeEmbedUrl(product.youtubeLink) ? (
          <iframe
            src={getYouTubeEmbedUrl(product.youtubeLink)}
            title={product.productTitle || "Video"}
            className="w-full h-full object-cover pointer-events-none"
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : product?.videoFile ? (
          <video
            src={product.videoFile}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img
            src={
              product?.coverImage ||
              product?.image ||
              "https://via.placeholder.com/400x300?text=No+Image"
            }
            alt={product?.productTitle || product?.name || "Product"}
            className="w-full h-full object-cover"
          />
        )}

        {/* Click-through overlay to ensure navigation */}
        {(getYouTubeWatchUrl(product.youtubeLink) || product.videoFile) && (
          <a
            href={getYouTubeWatchUrl(product.youtubeLink) || product.videoFile}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-20"
            aria-label="Open video"
          />
        )}

        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Title + YouTube badge */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1 text-[8px] sm:text-[10px] text-white">
            <span className="font-semibold truncate max-w-[70%]">
              {product.productTitle || product.name}
            </span>
            {product.youtubeLink && (
              <span className="text-red-400 font-semibold flex items-center gap-0.5">
                <svg
                  className="w-2 h-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.5 6.2s-.2-1.6-.8-2.3c-.8-.8-1.7-.8-2.1-.9C17.8 2.8 12 2.8 12 2.8h0s-5.8 0-8.6.3c-.4 0-1.3.1-2.1.9-.6.7-.8 2.3-.8 2.3S0 8.1 0 10v1.9c0 1.9.2 3.8.2 3.8s.2 1.6.8 2.3c.8.8 1.8.8 2.3.9 1.7.2 7.2.3 8.7.3 0 0 5.8 0 8.6-.3.4 0 1.3-.1 2.1-.9.6-.7.8-2.3.8-2.3s.2-1.9.2-3.8V10c0-1.9-.2-3.8-.2-3.8zM9.6 13.8V7.9l6.1 3-6.1 2.9z" />
                </svg>
                Watch
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="w-full py-1 sm:py-4">
        <motion.div
          className="mb-3 sm:mb-6 px-2 sm:px-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2
            className="text-lg sm:text-2xl md:text-3xl lg:text-4xl uppercase tracking-widest text-white mb-1 sm:mb-4"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "800",
            }}
          >
            {title}
          </h2>
        </motion.div>

        <div className="w-full flex items-center justify-center rounded-lg shadow-2xl border border-black mx-0.5 sm:mx-0 p-4 sm:p-8">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-2 sm:mb-4"></div>
            <p className="text-sm sm:text-lg">Loading {title} products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (categoryProducts.length === 0) {
    return (
      <div className="w-full py-1 sm:py-4">
        {/* Category Title */}
        <motion.div
          className="mb-3 sm:mb-6 px-2 sm:px-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2
            className="text-lg sm:text-2xl md:text-3xl lg:text-4xl uppercase tracking-widest text-white mb-1 sm:mb-4"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "800",
            }}
          >
            {title}
          </h2>
        </motion.div>

        <div
          className="w-full flex items-center justify-center rounded-lg shadow-2xl border border-black mx-0.5 sm:mx-0 p-4 sm:p-8"
          style={{
            aspectRatio: isMobile ? "1/1.2" : "5/2",
            background: "rgba(0, 0, 0, 0.9)",
          }}
        >
          <p
            className="text-white text-xs sm:text-lg"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "800" }}
          >
            No {title} products available
          </p>
        </div>
      </div>
    );
  }

  // Helper function to get width class for commercial items
  const getCommercialWidth = (count) => {
    if (count <= 6) {
      return `w-1/${count}`;
    }
    return 'w-1/6';
  };

  // Dynamic layout logic based on number of products
  const totalProducts = categoryProducts.length;
  let leftProducts = [];
  let rightProducts = [];
  let layoutType = '';
  let itemWidthClass = '';

  // Special handling for Commercial category
  if (category === 'Commercial') {
    if (totalProducts === 2) {
      // 2 commercial items: both on left side with heading and description on right
      leftProducts = categoryProducts;
      rightProducts = [];
      layoutType = 'commercial-2-items';
    } else {
      // Other commercial item counts: show all in a row
      leftProducts = categoryProducts;
      rightProducts = [];
      layoutType = 'commercial-row';
      itemWidthClass = getCommercialWidth(leftProducts.length);
    }
  } else if (totalProducts === 1) {
    // 1 item: show it centered
    leftProducts = categoryProducts.slice(0, 1);
    rightProducts = [];
    layoutType = '1-item';
  } else if (totalProducts === 2) {
    // 2 items: 1 on left, 1 on right
    leftProducts = categoryProducts.slice(0, 1);
    rightProducts = categoryProducts.slice(1);
    layoutType = '2-items';
  } else if (totalProducts === 3) {
    // 3 items: all 3 in a row
    leftProducts = categoryProducts.slice(0, 3);
    rightProducts = [];
    layoutType = '3-items-row';
  } else if (totalProducts === 4) {
    // 4 items: 2 on left, 2 on right
    leftProducts = categoryProducts.slice(0, 2);
    rightProducts = categoryProducts.slice(2);
    layoutType = '4-items';
  } else {
    // 5+ items: 2 on left, scrolling right with video content
    leftProducts = categoryProducts.slice(0, 2);
    rightProducts = categoryProducts
      .slice(2)
      .filter((p) => !!p.youtubeLink || !!p.videoFile);
    layoutType = '5-plus-items';
  }

  return (
    <div className="w-full py-1 sm:py-4 lg:px-5">
      {/* Category Title with View All Button */}
      <motion.div
        className="mb-3 sm:mb-6 flex justify-between items-center px-2 sm:px-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2
          className="text-lg sm:text-2xl md:text-3xl lg:text-4xl uppercase tracking-widest text-white mb-1 sm:mb-4"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "800",
          }}
        >
          {title}
        </h2>
        <button
          onClick={() => {
            window.scrollTo(0, 0);
            navigate("/Photo");
          }}
          className="text-white hover:text-gray-300 transition-colors duration-300 group"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "600",
          }}
        >
          <span className="text-xs sm:text-sm uppercase tracking-wider border-b border-transparent group-hover:border-white transition-all duration-300">
            View All
          </span>
        </button>
      </motion.div>

      {/* Main Content */}
      <div
        className="w-full overflow-hidden relative rounded-lg shadow-2xl border border-black mx-0.5 sm:mx-0 my-0"
        style={{
          aspectRatio: isMobile ? "5/5" : "5/2",
          background: "rgba(0, 0, 0, 0.9)",
        }}
      >
        {/* Desktop Layout */}
        {!isMobile ? (
          <div className="flex h-full">
            {/* Dynamic Left Side */}
            <div
              className={[
                'h-full flex',
                layoutType === '3-items-row' ? 'w-full' : 
                layoutType === '2-items' ? 'w-full' : 
                layoutType === '1-item' ? 'w-full' : 
                layoutType === 'commercial-row' ? 'w-full' : 
                layoutType === 'commercial-2-items' ? 'w-1/2' : 'w-1/2'
              ].join(' ')}
            >
              {leftProducts.map((product, index) => {
                const itemWidth = layoutType === '3-items-row' ? 'w-1/3' : 
                                 layoutType === '2-items' ? 'w-1/2' : 
                                 layoutType === '1-item' ? 'w-full' : 
                                 layoutType === 'commercial-row' ? itemWidthClass : 
                                 layoutType === 'commercial-2-items' ? 'w-1/2' : 'w-1/2';
                
                return (
                  <div 
                    key={`left-${index}`} 
                    className={['h-full', itemWidth].join(' ')}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="w-full h-full"
                    >
                      <ProductCard
                        product={product}
                        className="w-full h-full"
                        showTitle={true}
                        isVertical={true}
                      />
                    </motion.div>
                  </div>
                );
            })}
            </div>

            {/* Dynamic Right Side */}
            {layoutType !== '1-item' && layoutType !== '2-items' && layoutType !== '3-items-row' && layoutType !== 'commercial-row' && layoutType !== 'commercial-2-items' && (
              <div className="w-1/2 h-full overflow-hidden flex flex-col p-0 gap-0">
                {layoutType === '5-plus-items' ? (
                  // Scrolling layout for 5+ items
                  rightProducts.length > 0 ? (
                    <motion.div
                      className="flex flex-col gap-0"
                      animate={{
                        y: ["0%", "-50%"], // Same as mobile pattern - simple infinite loop
                      }}
                      transition={{
                        duration: 15, // Same duration for all sections (Music, Film, Commercial) to ensure synchronized scroll speed
                        ease: "linear", // Same as mobile - simple linear easing
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                    >
                      {rightProducts
                        .concat(rightProducts)
                        .map((product, index) => (
                          <div
                            key={`scroll-${index}`}
                            className="flex-shrink-0 mb-0"
                          >
                            <ProductVideoCard
                              product={product}
                              className="w-full"
                              isYouTubeThumbnail={true}
                            />
                          </div>
                        ))}
                    </motion.div>
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: "rgba(0, 0, 0, 0.8)",
                      }}
                    >
                      <p
                        className="text-white text-xs sm:text-sm text-center px-4"
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: "600",
                        }}
                      >
                        More {title} coming soon...
                      </p>
                    </div>
                  )
                ) : (
                  // Static layout for 3 and 4 items
                  <div className="h-full flex">
                    {rightProducts.map((product, index) => (
                      <div 
                        key={`right-${index}`} 
                        className={`h-full ${layoutType === '3-items' ? 'w-full' : 'w-1/2'}`}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: (leftProducts.length + index) * 0.1 }}
                          className="w-full h-full"
                        >
                          <ProductCard
                            product={product}
                            className="w-full h-full"
                            showTitle={true}
                            isVertical={true}
                          />
                        </motion.div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Commercial 2-Items Special Right Side */}
            {layoutType === 'commercial-2-items' && (
              <div className="w-1/2 h-full overflow-hidden flex flex-col justify-center p-10 bg-black bg-opacity-80 relative">
                <h2 
                  className="text-white text-2xl font-bold mb-4 z-10 relative"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: "700",
                  }}
                >
                  COMMERCIAL
                </h2>
                <div className="h-[calc(100%-3rem)] overflow-hidden relative">
                  <motion.div 
                    className="text-white text-sm leading-relaxed space-y-2 absolute w-full"
                    animate={{
                      y: [0, '-50%']
                    }}
                    transition={{
                      duration: 15, // Same duration for all sections (Music, Film, Commercial) to ensure synchronized scroll speed
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <p>Discover premium commercial properties designed for business excellence.</p>
                    <p>Our curated selection features strategic locations with maximum visibility.</p>
                    <p>Invest in spaces that drive growth and opportunity.</p>
                    <p>From retail storefronts to office complexes, find your perfect business venue.</p>
                    <p>Each property offers unique advantages for your commercial success.</p>
                    <p>Built with modern infrastructure and sustainable design principles.</p>
                    <p>Access high-traffic areas with proven market performance.</p>
                    <p>Flexible spaces adaptable to various business requirements.</p>
                    <p>Professional management ensures optimal property maintenance.</p>
                    <p>Transform your business vision into reality with our commercial portfolio.</p>
                    {/* Duplicate content for seamless looping */}
                    <p>Discover premium commercial properties designed for business excellence.</p>
                    <p>Our curated selection features strategic locations with maximum visibility.</p>
                    <p>Invest in spaces that drive growth and opportunity.</p>
                    <p>From retail storefronts to office complexes, find your perfect business venue.</p>
                    <p>Each property offers unique advantages for your commercial success.</p>
                    <p>Built with modern infrastructure and sustainable design principles.</p>
                    <p>Access high-traffic areas with proven market performance.</p>
                    <p>Flexible spaces adaptable to various business requirements.</p>
                    <p>Professional management ensures optimal property maintenance.</p>
                    <p>Transform your business vision into reality with our commercial portfolio.</p>
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Mobile Layout - Optimized 2 photos with smooth infinite scroll */
          <div className="flex flex-col h-full">
            {/* Upper Part - 2 Photos */}
            <div className="w-full h-1/2 flex">
              {categoryProducts.slice(0, 2).map((product, index) => (
                <div key={`mobile-upper-${index}`} className="w-1/2 h-full">
                  <ProductCard
                    product={product}
                    className="w-full h-full"
                    showTitle={false}
                    isVertical={true}
                  />
                </div>
              ))}
            </div>
            
            {/* Lower Part - Smooth Infinite Loop */}
            <div className="w-full h-2/3 overflow-hidden flex flex-col p-1 gap-1">
              {categoryProducts.length > 2 ? (
                <motion.div
                  animate={{ y: ["0%", "-50%"] }}
                  transition={{
                    duration: 12, // Same duration for all sections (Music, Film, Commercial) to ensure synchronized scroll speed
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                  className="flex flex-col"
                >
                  {categoryProducts
                    .slice(2)
                    .concat(categoryProducts.slice(2))
                    .map((product, index) => (
                      <div
                        key={`mobile-loop-${index}`}
                        className="flex-shrink-0"
                      >
                        <ProductVideoCard
                          product={product}
                          className="w-full"
                          isYouTubeThumbnail={true}
                          showTitle={false}
                        />
                      </div>
                    ))}
                </motion.div>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center rounded"
                  style={{
                    background: "rgba(0, 0, 0, 0.7)",
                  }}
                >
                  <p
                    className="text-white text-xs text-center px-3 py-2"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: "500",
                    }}
                  >
                    More {title} coming soon...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 sm:gap-2">
          {categoryProducts.slice(0, layoutType === '1-item' ? 1 : layoutType === '2-items' ? 2 : layoutType === '3-items' ? 3 : layoutType === '4-items' ? 4 : layoutType === 'commercial-row' ? Math.min(categoryProducts.length, 6) : layoutType === 'commercial-2-items' ? 2 : 2).map((_, index) => (
            <motion.div
              key={index}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white opacity-70"
              whileHover={{ scale: 1.3, opacity: 1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const VerticalSplitShowcase = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-black py-0">
      {/* Desktop Main Title */}
      {!isMobile && (
        <motion.div
          className="relative z-20 text-center pt-8 pb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-4xl text-white mb-0"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "400",
              letterSpacing: "0.1em",
            }}
          ></h1>
        </motion.div>
      )}

      {/* Content Container */}
      <div className="relative z-10 px-6 sm:px-2 pb-0 sm:pb-6 space-y-6 sm:space-y-16">
        {/* Music Section */}
        <div className="w-full mobile-section-tight">
          <CategoryShowcase category="Music" title="MUSIC" />
        </div>

        {/* Film Section */}
        <div className="w-full mobile-section-tight">
          <CategoryShowcase category="Film" title="FILM" />
        </div>

        {/* Commercial Section */}
        <div className="w-full mobile-last-section">
          <CategoryShowcase category="Commercial" title="COMMERCIAL" />
        </div>
      </div>
    </div>
  );
};

export default VerticalSplitShowcase;