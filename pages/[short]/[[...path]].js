import React, { useEffect, useRef } from "react";
import Script from "next/script";

function Short({ shortCode, path }) {
  const formRef = useRef(null);

  useEffect(() => {
    const initializeFingerprintPro = async () => {
      const fpPromise = import('@fingerprintjs/fingerprintjs-pro')
        .then((FingerprintJS) =>
          FingerprintJS.load({ apiKey: process.env.NEXT_PUBLIC_FINGERPRINTJS_PUBLIC_KEY || 'iCdgQbPm5pEzzgz6olsm' })
        );

      try {
        const fp = await fpPromise;
        const result = await fp.get();

        // Log the IDs to the browser console
        console.log("Fingerprint Pro initialized:");
        console.log("Visitor ID:", result.visitorId);
        console.log("Request ID:", result.requestId);

        // Optionally add the IDs to the form (if needed in the backend)
        const visitorInput = formRef.current.querySelector(
          "input[name='visitorId']"
        );
        if (visitorInput) {
          visitorInput.value = result.visitorId;
        } else {
          const newVisitorInput = document.createElement("input");
          newVisitorInput.type = "hidden";
          newVisitorInput.name = "visitorId";
          newVisitorInput.value = result.visitorId;
          formRef.current.appendChild(newVisitorInput);
        }

        const requestInput = formRef.current.querySelector(
          "input[name='requestId']"
        );
        if (requestInput) {
          requestInput.value = result.requestId;
        } else {
          const newRequestInput = document.createElement("input");
          newRequestInput.type = "hidden";
          newRequestInput.name = "requestId";
          newRequestInput.value = result.requestId;
          formRef.current.appendChild(newRequestInput);
        }
      } catch (error) {
        console.error("Fingerprint Pro initialization failed:", error);
      }
    };

    initializeFingerprintPro();

    // Callback when CAPTCHA is solved
    window.handleCaptchaSuccess = function (token) {
      console.log("CAPTCHA solved with token:", token);

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

      console.log("Submitting form with shortCode, path, and token.");
      formRef.current.submit();
    };
  }, [shortCode, path]);

  return (
    <div className="container">
      <h1>
        Complete the security check before continuing. This step verifies that
        you are <u><a href="https://developers.cloudflare.com/bots/">not a bot</a></u>, which helps to protect your account and prevent spam.
      </h1>
      <form ref={formRef} action="/api/verify-turnstile" method="POST">
        <input type="hidden" name="shortCode" value={shortCode} />
        <input type="hidden" name="path" value={path} />

        <div
          className="cf-turnstile"
          data-sitekey={
            process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
            "0x4AAAAAAAzbaCIIxhpKU4HJ"
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
