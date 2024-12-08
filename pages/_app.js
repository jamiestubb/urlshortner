import '@/styles/globals.css';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Install uuid: `npm install uuid`

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Generate a unique request ID for each page load
    const requestId = uuidv4();
    console.log("Generated Request ID:", requestId);

    if (typeof window !== 'undefined') {
      fetch("https://your-api-id.amazonaws.com/dev/fingerprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Error from Lambda:", data.error);
            return;
          }

          const sessionInfo = {
            requestId,
            visitorId: data.visitorId,
          };

          console.log("Session Info from Lambda:", sessionInfo);

          // Optionally store in localStorage or pass to subsequent logic
          localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo));
        })
        .catch((error) => {
          console.error("Error communicating with Lambda:", error);
        });
    }
  }, []);

  return <Component {...pageProps} />;
}
