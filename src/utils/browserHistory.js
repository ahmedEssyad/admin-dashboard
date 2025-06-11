/**
 * Note: React Router v6 no longer exports a history object directly.
 * Instead, we use the navigate function from useNavigate hook in components.
 * This file provides a basic compatibility layer for code that expects a history object.
 * 
 * For components, use the useNavigate hook from react-router-dom directly:
 * const navigate = useNavigate();
 * navigate('/path');
 */

// This is a simple utility that can be imported in non-component files
// that need to perform navigation
let navigateFunction = null;

// This can be set from a component that has access to the navigate function
export const setNavigate = (navigate) => {
  navigateFunction = navigate;
};

// This can be used in any file to navigate
const browserHistory = {
  push: (path) => {
    if (navigateFunction) {
      navigateFunction(path);
    } else {
      console.warn('Navigate function not set in browserHistory');
      // Fallback to window.location if navigate is not available
      window.location.href = path;
    }
  },
  replace: (path) => {
    if (navigateFunction) {
      navigateFunction(path, { replace: true });
    } else {
      console.warn('Navigate function not set in browserHistory');
      // Fallback to window.location if navigate is not available
      window.location.replace(path);
    }
  }
};

export default browserHistory;