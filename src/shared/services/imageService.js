/**
 * Optimizes image URLs by specifying size parameters
 * @param {string} url - Original image URL
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (url, width, height) => {
  if (!url) return `https://via.placeholder.com/${width}x${height}?text=Image`;
  
  // If using Cloudinary
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
  }
  
  // If using your own API
  if (url.startsWith('/uploads/')) {
    return `${url}?w=${width}&h=${height}`;
  }
  
  return url;
};

// Preload critical images
export const preloadHeroImage = (imageUrl) => {
  if (!imageUrl) return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = imageUrl;
  link.type = 'image/webp'; // Ajout du type pour les images webp
  link.crossOrigin = 'anonymous'; // Ajout pour les images provenant de domaines externes
  
  document.head.appendChild(link);
};
