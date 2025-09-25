import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/hiremebuddy-logo.png';

interface LaunchScreenProps {
  onComplete: () => void;
}

const LaunchScreen = ({ onComplete }: LaunchScreenProps) => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Complete animation after 3 seconds
    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  if (isComplete) {
    return (
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={logo}
          alt="HireMeBuddy Logo"
          className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 object-contain"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Only HireMeBuddy Logo */}
      <motion.img
        src={logo}
        alt="HireMeBuddy Logo"
        className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 object-contain"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default LaunchScreen;