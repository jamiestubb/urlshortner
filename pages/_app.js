import '@/styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Ensure the script runs only on the client side
    if (typeof window !== 'undefined') {
      // Dynamically create the FingerprintJS script tag
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js'; // Use browser-compatible version
      script.async = true;
      script.onload = () => {
        // Once the script is loaded, initialize FingerprintJS
        if (window.FingerprintJS) {
          window.FingerprintJS.load()
            .then(fp => fp.get())
            .then(result => {
              const visitorId = result.visitorId;
              console.log("FingerprintJS visitorId:", visitorId);

              // Optionally store the visitorId in localStorage or elsewhere
              localStorage.setItem('visitorId', visitorId);
            })
            .catch(error => {
              console.error("Error initializing FingerprintJS:", error);
            });
        } else {
          console.error("FingerprintJS not found on window object");
        }
      };

      // Append the script to the document
      document.body.appendChild(script);
    }
  }, []); // Run only once when the app loads

  return <Component {...pageProps} />;
}
