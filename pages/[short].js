// pages/[short].js
import React, { useState, useEffect } from "react";
import Script from "next/script";

function Short({ shortCode }) {
  const [isClient, setIsClient] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Callback function when CAPTCHA is solved
  const handleCaptchaSuccess = (token) => {
    console.log("CAPTCHA solved with token:", token);
    setCaptchaToken(token);
  };

  // Callback function when CAPTCHA fails
  const handleCaptchaError = () => {
    console.error("CAPTCHA verification failed.");
  };

  return (
    <div className="container">
      <h1>Please complete the CAPTCHA to proceed</h1>
      <form
        action="/api/verify-turnstile"
        method="POST"
        onSubmit={(e) => {
          if (!captchaToken) {
            e.preventDefault();
            alert("Please complete the CAPTCHA challenge first.");
          }
        }}
      >
        <input type="hidden" name="shortCode" value={shortCode} />
        <input type="hidden" name="cf-turnstile-response" value={captchaToken} />

        {isClient && (
          <>
            <div
              className="cf-turnstile"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              data-callback="handleCaptchaSuccess"
              data-error-callback="handleCaptchaError"
            ></div>
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              async
              defer
            />
          </>
        )}

        <button type="submit">Continue</button>
      </form>

      <Script>
        {`
          window.handleCaptchaSuccess = function(token) {
            const event = new CustomEvent('captcha-success', { detail: token });
            window.dispatchEvent(event);
          };

          window.addEventListener('captcha-success', function(event) {
            const token = event.detail;
            console.log("CAPTCHA Success: ", token);
          });
        `}
      </Script>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          text-align: center;
        }

        form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps(context) {
  const shortCode = context.params.short;
  return {
    props: {
      shortCode,
    },
  };
}

export default Short;
