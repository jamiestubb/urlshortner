// pages/[short].js
import React, { useEffect, useRef } from "react";
import Script from "next/script";

function Short({ shortCode }) {
  const formRef = useRef(null);

  useEffect(() => {
    console.log("Short code in useEffect:", shortCode);

    // Callback when CAPTCHA is solved
    window.handleCaptchaSuccess = function (token) {
      console.log("CAPTCHA solved with token:", token);

      // Add the token to the hidden input field
      const captchaInput = formRef.current.querySelector(
        "input[name='cf-turnstile-response']"
      );
      if (captchaInput) {
        captchaInput.value = token;
      } else {
        const newInput = document.createElement("input");
        newInput.type = "hidden";
        newInput.name = "cf-turnstile-response";
        newInput.value = token;
        formRef.current.appendChild(newInput);
      }

      // Automatically submit the form
      console.log("Submitting form with shortCode and token.");
      formRef.current.submit();
    };
  }, [shortCode]);

  return (
    <div className="container">
      <h1>Please complete the CAPTCHA to proceed</h1>
      <form ref={formRef} action="/api/verify-turnstile" method="POST">
        {/* Hidden input for shortCode */}
        <input type="hidden" name="shortCode" value={shortCode} />

        {/* CAPTCHA Widget */}
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-callback="handleCaptchaSuccess"
        ></div>
      </form>

      {/* Load the Turnstile script */}
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

  console.log("getServerSideProps - shortCode:", shortCode);

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
