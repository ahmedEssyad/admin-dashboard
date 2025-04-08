/**
 * Simple in-memory cache for API responses
 */
class ApiCache {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  /**
   * Get cached data if available and not expired
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null
   */
  get(key) {
    if (!this.cache.has(key)) return null;
    
    const { data, timestamp } = this.cache.get(key);
    const now = Date.now();
    
    if (now - timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return data;
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear the entire cache or a specific key
   * @param {string} [key] - Optional key to clear
   */
  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// Singleton instance
const apiCache = new ApiCache();

export default apiCache;
