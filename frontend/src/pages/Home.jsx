import React, { useEffect } from "react";
import Hero from "../components/Hero";
import LatestCollection1 from "../components/LatestCollection1";
import AboutPreview from "../components/AboutPreview";
import NewsletterBox from "../components/NewsletterBox";
import Services from "../pages/Services"

const Home = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <div className="  ">
        <Hero />
      </div>
      
      <div className="py-10 ">
        <LatestCollection1 />
      </div>
      
< Services />
        <AboutPreview />
      
      

        
      
    </div>
  );
};

export default Home;
