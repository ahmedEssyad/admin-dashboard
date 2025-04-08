/**
 * Optimizes event handlers with debouncing
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (fn, delay = 100) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Optimizes rendering with throttling
 * @param {Function} fn - The function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (fn, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Schedules non-urgent tasks during browser idle time
 * @param {Function} callback - Function to execute
 */
export const scheduleIdleTask = (callback) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback);
  } else {
    return setTimeout(() => callback(), 1);
  }
};

/**
 * Breaks long tasks into smaller ones using setTimeout
 * @param {Array} items - Items to process
 * @param {Function} processFn - Function to process each item
 * @param {Function} completeFn - Function to call when done
 * @param {number} chunkSize - Number of items per chunk
 */
export const processInChunks = (items, processFn, completeFn, chunkSize = 5) => {
  let index = 0;
  
  function processNextChunk() {
    const start = index;
    const end = Math.min(start + chunkSize, items.length);
    
    for (let i = start; i < end; i++) {
      processFn(items[i], i);
    }
    
    index = end;
    
    if (index < items.length) {
      setTimeout(processNextChunk, 0);
    } else if (completeFn) {
      completeFn();
    }
  }
  
  processNextChunk();
};
