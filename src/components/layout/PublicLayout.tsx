import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MeshBackground } from './MeshBackground';
import { motion, AnimatePresence } from 'framer-motion';

const PublicLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-screen min-h-screen flex relative">
      <MeshBackground />
      <AnimatePresence mode="wait">
        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PublicLayout;
