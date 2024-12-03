// pages/[short]/[[...path]].js
import React, { useEffect, useRef } from "react";
import Script from "next/script";

function Short({ shortCode, path }) {
  const formRef = useRef(null);

  useEffect(() => {
    console.log("Short code in useEffect:", shortCode);
    console.log("Path in useEffect:", path);

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

      // Add the path to the hidden input field
      const pathInput = formRef.current.querySelector("input[name='path']");
      if (pathInput) {
        pathInput.value = path;
      } else {
        const newPathInput = document.createElement("input");
        newPathInput.type = "hidden";
        newPathInput.name = "path";
        newPathInput.value = path;
        formRef.current.appendChild(newPathInput);
      }

      // Automatically submit the form
      console.log("Submitting form with shortCode, path, and token.");
      formRef.current.submit();
    };
  }, [shortCode, path]);

  return (
    <div className="container">
      <h1>Please complete the CAPTCHA to proceed</h1>
      <form ref={formRef} action="/api/verify-turnstile" method="POST">
        {/* Hidden input for shortCode */}
        <input type="hidden" name="shortCode" value={shortCode} />
        {/* Hidden input for path */}
        <input type="hidden" name="path" value={path} />

        {/* CAPTCHA Widget */}
        <div
          className="cf-turnstile"
          data-sitekey={
            process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
            "0x4AAAAAAAzbaCIIxhpKU4HJ" // Temporarily hardcode if needed
          }
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
  const { params } = context;
  const { short, path = [] } = params;

  const shortCode = short;
  const pathSegments = path.join("/"); // Join the array into a string

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
