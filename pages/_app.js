import '@/styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Ensure the script runs only on the client side
    if (typeof window !== 'undefined') {
      // Dynamically create the FingerprintJS script tag
      const script = document.createElement('script');
      script.src = 'https://botcheck.co/s60QLi5vS8SRBTDw/MLmW5prvHHtg1xKA?apiKey=iCdgQbPm5pEzzgz6olsm';
      script.async = true;
      script.onload = () => {
        // Once the script is loaded, initialize FingerprintJS
        const FingerprintJS = window.FingerprintJS;
        if (FingerprintJS) {
          FingerprintJS.load({
            endpoint: [
              "https://botcheck.co/s60QLi5vS8SRBTDw/RruuxpLhWeFDHE5m",
              FingerprintJS.defaultEndpoint,
            ],
          })
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
