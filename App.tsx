import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);

  return (
    <div className="antialiased text-gray-100 bg-[#050505] min-h-screen selection:bg-white/20 selection:text-white">
      <AnimatePresence mode="wait">
        {!userRole ? (
          <AuthScreen key="auth" onSuccess={(role) => setUserRole(role)} />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-screen flex items-center justify-center"
          >
            <Dashboard role={userRole} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;