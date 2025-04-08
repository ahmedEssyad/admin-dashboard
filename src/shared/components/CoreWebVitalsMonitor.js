import { useEffect } from 'react';

/**
 * Component to monitor Core Web Vitals in development
 */
const CoreWebVitalsMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // Only measure in development
      
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`%cLCP: ${(lastEntry.startTime / 1000).toFixed(2)}s`, 
          lastEntry.startTime < 2500 ? 'color: green' : 'color: red');
      });
      
      // CLS (Cumulative Layout Shift)
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsScore = 0;
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }
        console.log(`%cCLS: ${clsScore.toFixed(3)}`, 
          clsScore < 0.1 ? 'color: green' : 'color: red');
      });
      
      // INP (Interaction to Next Paint)
      const inpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const interactions = entries.map(entry => {
          return {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          };
        });
        
        console.table(interactions);
      });
      
      // Register observers
      try {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        inpObserver.observe({ type: 'event', buffered: true });
      } catch (e) {
        console.error('Core Web Vitals monitoring not supported', e);
      }
      
      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        inpObserver.disconnect();
      };
    }
  }, []);
  
  return null; // Renders nothing
};

export default CoreWebVitalsMonitor;
