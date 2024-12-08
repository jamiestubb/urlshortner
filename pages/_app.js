import '@/styles/globals.css';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Install uuid: `npm install uuid`

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Generate a unique request ID for each page load
    const requestId = uuidv4();
    console.log("Generated Request ID:", requestId);

    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js'; // Use browser-compatible version
      script.async = true;

      script.onload = () => {
        if (window.FingerprintJS) {
          window.FingerprintJS.load()
            .then(fp => fp.get())
            .then(result => {
              const visitorId = result.visitorId;
              console.log("FingerprintJS visitorId:", visitorId);

              // Combine visitorId with requestId
              const sessionInfo = {
                requestId,
                visitorId,
              };

              console.log("Session Info:", sessionInfo);

              // Optionally store in localStorage or send to your API
              localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo));
            })
            .catch(error => {
              console.error("Error initializing FingerprintJS:", error);
            });
        } else {
          console.error("FingerprintJS not found on window object");
        }
      };

      document.body.appendChild(script);
    }
  }, []); // Run only once when the app loads

  return <Component {...pageProps} />;
}
