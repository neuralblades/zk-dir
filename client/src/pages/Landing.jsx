import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Check if URL has filter parameters
    const urlParams = new URLSearchParams(location.search);
    const hasFilterParams = ['protocol', 'severity', 'sort', 'protocolType', 'difficulty', 'tags'].some(
      param => urlParams.has(param)
    );

    // If user is logged in and URL has filter parameters, redirect to home with filters
    if (currentUser && hasFilterParams) {
      navigate(`/home${location.search}`, { replace: true });
    }
  }, [location.search, currentUser, navigate]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      {/* Hero Section */}
      <motion.section
        className="pt-60 md:pt-80 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-zinc-900 to-black"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={fadeIn}
      >
        <div className="container mx-auto flex flex-col items-center">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-7xl text-center font-bold mb-6 leading-tight"
              variants={fadeIn}
            >
              Zero Knowledge <span className="text-zinc-500">Bug Directory</span>
            </motion.h1>
            <motion.p
              className="text-lg md:text-3xl text-center text-zinc-400 mb-8 max-w-4xl mx-auto"
              variants={fadeIn}
            >
              The comprehensive platform for tracking, analyzing, and sharing zero-knowledge proof vulnerabilities. Enhance your security knowledge and protect your ZK implementations.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeIn}
            >
              <Link to="/sign-up">
                <button className="px-10 py-4 bg-zinc-100 hover:bg-zinc-300 text-black rounded-lg font-bold transition duration-300 w-full sm:w-auto">
                  Get Started
                </button>
              </Link>
              <Link to="/sign-in">
                <button className="px-10 py-4 bg-transparent hover:bg-zinc-800 text-white border border-zinc-700 rounded-lg font-bold transition duration-300 w-full sm:w-auto">
                  Sign In
                </button>
              </Link>
            </motion.div>
        </div>
      </motion.section>
    </div>
  );
}