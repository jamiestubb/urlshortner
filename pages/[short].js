// pages/[short].js
import React, { useEffect, useRef } from "react";
import Script from "next/script";

function Short({ shortCode }) {
  const formRef = useRef(null); // Reference to the form element

  // Callback when CAPTCHA is solved
  const handleCaptchaSuccess = (token) => {
    console.log("CAPTCHA solved with token:", token);

    // Add the token to the hidden input field
    const captchaInput = formRef.current.querySelector("input[name='cf-turnstile-response']");
    if (captchaInput) {
      captchaInput.value = token;
    }

    // Automatically submit the form
    formRef.current.submit();
  };

  // Callback when CAPTCHA encounters an error
  const handleCaptchaError = () => {
    console.error("CAPTCHA verification failed.");
  };

  return (
    <div className="container">
      <h1>Please complete the CAPTCHA to proceed</h1>
      <form
        ref={formRef}
        action="/api/verify-turnstile"
        method="POST"
      >
        {/* Hidden inputs for shortCode and CAPTCHA token */}
        <input type="hidden" name="shortCode" value={shortCode} />
        <input type="hidden" name="cf-turnstile-response" value="" />

        {/* CAPTCHA Widget */}
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-callback="handleCaptchaSuccess"
          data-error-callback="handleCaptchaError"
        ></div>
      </form>

      {/* Load the Turnstile script */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />

      {/* Define CAPTCHA callbacks */}
      <Script>
        {`
          window.handleCaptchaSuccess = function(token) {
            const form = document.querySelector("form");
            const input = form.querySelector("input[name='cf-turnstile-response']");
            if (input) {
              input.value = token;
            }
            form.submit();
          };

          window.handleCaptchaError = function() {
            console.error("CAPTCHA verification failed.");
          };
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

  if (!shortCode) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      shortCode,
    },
  };
}

export default Short;
