// pages/[short].js
import React, { useState, useEffect } from "react";
import Script from "next/script";

function Short({ shortCode }) {
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container">
      <h1>Please complete the CAPTCHA to proceed</h1>
      {error && <p className="error">{error}</p>}
      <form action="/api/verify-turnstile" method="POST">
        <input type="hidden" name="shortCode" value={shortCode} />
        {isClient && (
          <>
            <div
              className="cf-turnstile"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
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
