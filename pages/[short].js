// pages/[short].js
import React, { useState } from "react";

function Short({ shortCode }) {
  const [error, setError] = useState("");

  return (
    <div className="container">
      <h1>Please complete the CAPTCHA to proceed</h1>
      {error && <p className="error">{error}</p>}
      <form
        action="/api/verify-turnstile"
        method="POST"
        onSubmit={(e) => {
          // Optional: prevent default and handle submission via AJAX for better UX
          // e.preventDefault();
          // Handle submission with fetch and set error state if needed
        }}
      >
        <input type="hidden" name="shortCode" value={shortCode} />
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        ></div>
        <button type="submit">Continue</button>
      </form>
      <script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      ></script>
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
