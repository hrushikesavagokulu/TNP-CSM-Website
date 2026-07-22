import { createContext, useContext, useState, useCallback } from 'react';

const LightboxContext = createContext(null);

export function LightboxProvider({ children }) {
  const [isOpen, setIsOpen]                   = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [currentAltText, setCurrentAltText]   = useState('');

  const openLightbox = useCallback((imageUrl, altText = '') => {
    if (!imageUrl) return;
    setCurrentImageUrl(imageUrl);
    setCurrentAltText(altText || 'Enlarged Image');
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    setCurrentImageUrl('');
    setCurrentAltText('');
  }, []);

  return (
    <LightboxContext.Provider
      value={{
        isOpen,
        currentImageUrl,
        currentAltText,
        openLightbox,
        closeLightbox,
      }}
    >
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const context = useContext(LightboxContext);
  if (!context) {
    // Return graceful fallback if used outside provider
    return {
      isOpen: false,
      currentImageUrl: '',
      currentAltText: '',
      openLightbox: () => {},
      closeLightbox: () => {},
    };
  }
  return context;
}
