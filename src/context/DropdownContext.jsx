import React, { createContext, useState, useContext } from 'react';

const DropdownContext = createContext();

export function DropdownProvider({ children }) {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const openDropdown = (id) => {
    setOpenDropdownId(id);
  };

  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  return (
    <DropdownContext.Provider value={{ openDropdownId, openDropdown, closeDropdown }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown debe usarse dentro de un DropdownProvider');
  }
  return context;
} 