import '@/styles/globals.css';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Install uuid: `npm install uuid`

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Generate a unique request ID for each page load
    const requestId = uuidv4();
    console.log("Generated Request ID:", requestId);

    if (typeof window !== 'undefined') {
      // Load FingerprintJS for visitor ID
      const fpScript = document.createElement('script');
      fpScript.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js'; // FingerprintJS CDN
      fpScript.async = true;

      // Load BotD for bot detection
      const botdScript = document.createElement('script');
      botdScript.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/botd@3'; // BotD CDN
      botdScript.async = true;

      botdScript.onload = () => {
        console.log("BotD script loaded successfully.");

        if (window.BotD) {
          console.log("Initializing BotD...");
          const botd = window.BotD.load();

          botd
            .detect()
            .then(botResult => {
              console.log("BotD Result:", botResult);

              // Store BotD result in localStorage
              localStorage.setItem('botDetection', JSON.stringify(botResult));

              // Load FingerprintJS visitor ID after BotD
              fpScript.onload = () => {
                console.log("FingerprintJS script loaded successfully.");

                if (window.FingerprintJS) {
                  console.log("Initializing FingerprintJS...");
                  window.FingerprintJS.load()
                    .then(fp => fp.get())
                    .then(fpResult => {
                      const visitorId = fpResult.visitorId;
                      console.log("FingerprintJS visitorId:", visitorId);

                      // Combine all values
                      const sessionInfo = {
                        requestId,
                        visitorId,
                        botDetection: botResult,
                      };

                      console.log("Session Info:", sessionInfo);

                      // Store session info in localStorage
                      localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo));
                    })
                    .catch(error => {
                      console.error("Error initializing FingerprintJS:", error);
                    });
                } else {
                  console.error("FingerprintJS not found on window object");
                }
              };

              document.body.appendChild(fpScript);
            })
            .catch(error => {
              console.error("Error detecting bot:", error);
            });
        } else {
          console.error("BotD not found on window object");
        }
      };

      botdScript.onerror = () => {
        console.error("Failed to load BotD script.");
      };

      document.body.appendChild(botdScript);
    }
  }, []); // Run only once when the app loads

  return <Component {...pageProps} />;
}
