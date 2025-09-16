import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/hiremebuddy-logo.png';

interface LaunchScreenProps {
  onComplete: () => void;
}

const LaunchScreen = ({ onComplete }: LaunchScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: "HireMeBuddy",
      subtitle: "Connect • Create • Collaborate",
      description: "Connecting Namibian skilled professionals with opportunities"
    },
    {
      title: "Find Skills",
      subtitle: "Discover Talent",
      description: "Browse verified service providers across Namibia"
    },
    {
      title: "Build Trust",
      subtitle: "Secure Platform",
      description: "Safe, verified, and reliable connections"
    }
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 65); // ~6.5 seconds total

    const timers = [
      // Logo animation phase (2 seconds)
      setTimeout(() => setCurrentStep(1), 2000),
      // Second step (1.5 seconds)
      setTimeout(() => setCurrentStep(2), 3500),
      // Third step (1.5 seconds)
      setTimeout(() => setCurrentStep(3), 5000),
      // Complete animation
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(onComplete, 800);
      }, 6500)
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  if (isComplete) {
    return (
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-teal"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 50, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-4 h-4 bg-white rounded-full"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-gradient-teal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-24 h-24 bg-white rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Main Content */}
        <motion.div
          key={`step-${currentStep}`}
          className="flex flex-col items-center justify-center text-center px-8 relative z-10"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Logo Container */}
          <motion.div
            className="mb-8 relative"
            initial={{ scale: 0.3, rotate: -10 }}
            animate={{ scale: currentStep === 0 ? 1 : 0.8, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <motion.div
              className="absolute inset-0 bg-white rounded-full blur-xl opacity-30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.img
              src={logo}
              alt="HireMeBuddy"
              className={`relative z-10 ${
                currentStep === 0 ? 'w-32 h-32' : 'w-24 h-24'
              }`}
              animate={{
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Text Content */}
          <motion.div
            className="text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl font-bold mb-2"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.3)",
                  "0 0 30px rgba(255,255,255,0.5)",
                  "0 0 20px rgba(255,255,255,0.3)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {currentStep === 0 ? 'HireMeBuddy' : steps[currentStep - 1]?.title}
            </motion.h1>
            <motion.p
              className="text-xl opacity-90 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.5 }}
            >
              {currentStep === 0 ? 'Connect • Create • Collaborate' : steps[currentStep - 1]?.subtitle}
            </motion.p>
            <motion.p
              className="text-lg opacity-80 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.7 }}
            >
              {currentStep === 0
                ? 'Connecting Namibian skilled professionals with opportunities'
                : steps[currentStep - 1]?.description
              }
            </motion.p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Dots */}
      <motion.div
        className="absolute bottom-16 flex space-x-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="w-3 h-3 rounded-full bg-white"
            animate={{
              opacity: currentStep === index ? 1 : 0.3,
              scale: currentStep === index ? 1 : 0.75
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-8 w-64 h-1 bg-white/20 rounded-full overflow-hidden"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <motion.div
          className="h-full bg-white rounded-full origin-left"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default LaunchScreen;