import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-zinc-900 to-black"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={fadeIn}
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              variants={fadeIn}
            >
              Zero Knowledge <span className="text-blue-500">Bug Directory</span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300 mb-8"
              variants={fadeIn}
            >
              The comprehensive platform for tracking, analyzing, and sharing zero-knowledge proof vulnerabilities. Enhance your security knowledge and protect your ZK implementations.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeIn}
            >
              <Link to="/sign-up">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-300 w-full sm:w-auto">
                  Get Started
                </button>
              </Link>
              <Link to="/sign-in">
                <button className="px-8 py-3 bg-transparent hover:bg-zinc-800 text-white border border-zinc-700 rounded-lg font-medium transition duration-300 w-full sm:w-auto">
                  Sign In
                </button>
              </Link>
            </motion.div>
          </div>
          <motion.div
            className="md:w-1/2 flex justify-center"
            variants={fadeIn}
          >
            <img
              src="/img/logozk3.png"
              alt="ZKBD Platform"
              className="w-full max-w-md shadow-2xl rounded-lg border border-zinc-800"
            />
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
