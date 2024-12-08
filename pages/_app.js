import '@/styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize FingerprintJS when the app loads
    const fpPromise = import('https://botcheck.co/s60QLi5vS8SRBTDw/MLmW5prvHHtg1xKA?apiKey=iCdgQbPm5pEzzgz6olsm')
      .then(FingerprintJS =>
        FingerprintJS.load({
          endpoint: [
            "https://botcheck.co/s60QLi5vS8SRBTDw/RruuxpLhWeFDHE5m",
            FingerprintJS.defaultEndpoint,
          ],
        })
      );

    fpPromise
      .then(fp => fp.get())
      .then(result => {
        const visitorId = result.visitorId;
        console.log("FingerprintJS visitorId:", visitorId);

        // Optionally store the visitorId in localStorage or pass it globally
        localStorage.setItem('visitorId', visitorId);
      })
      .catch(error => {
        console.error("Error initializing FingerprintJS:", error);
      });
  }, []); // Run only once when the app loads

  return <Component {...pageProps} />;
}
