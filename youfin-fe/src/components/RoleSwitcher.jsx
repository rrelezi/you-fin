import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const RoleSwitcher = () => {
  const { userRole, switchUserRole } = useAuth();

  return (
    <div className="fixed bottom-20 right-4 z-[1000] bg-[#1A1A1A] border border-[#333] rounded-lg shadow-lg p-3">
      <h4 className="text-xs font-medium text-[#FFDE59] mb-2">Developer Mode: Role Switcher</h4>
      <div className="flex gap-2">
        <button
          onClick={() => switchUserRole('parent')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            userRole === 'parent'
              ? 'bg-[#FFDE59] text-black'
              : 'bg-[#333] text-white hover:bg-[#444]'
          }`}
        >
          Parent
        </button>
        <button
          onClick={() => switchUserRole('youth')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            userRole === 'youth'
              ? 'bg-[#FFDE59] text-black'
              : 'bg-[#333] text-white hover:bg-[#444]'
          }`}
        >
          Youth
        </button>
      </div>
    </div>
  );
};

export default RoleSwitcher;