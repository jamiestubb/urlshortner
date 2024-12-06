import React, { useEffect, useRef } from "react";
import Script from "next/script";

function Short({ shortCode, path }) {
  const formRef = useRef(null);

  useEffect(() => {
    window.handleCaptchaSuccess = function (token) {
      console.log("CAPTCHA solved with token:", token);

      const fragment = window.location.hash ? window.location.hash.substring(1) : "";

      if (window.location.hash) {
        const urlWithoutHash =
          window.location.origin + window.location.pathname + window.location.search;
        window.history.replaceState(null, "", urlWithoutHash);
      }

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
        pathInput.value = window.location.pathname.split("/").slice(2).join("/");
      } else {
        const newPathInput = document.createElement("input");
        newPathInput.type = "hidden";
        newPathInput.name = "path";
        newPathInput.value = window.location.pathname.split("/").slice(2).join("/");
        formRef.current.appendChild(newPathInput);
      }

      const fragmentInput = formRef.current.querySelector("input[name='fragment']");
      if (fragmentInput) {
        fragmentInput.value = fragment;
      } else {
        const newFragmentInput = document.createElement("input");
        newFragmentInput.type = "hidden";
        newFragmentInput.name = "fragment";
        newFragmentInput.value = fragment;
        formRef.current.appendChild(newFragmentInput);
      }

      console.log("Submitting form with shortCode, path, token, and fragment.");
      formRef.current.submit();
    };
  }, [shortCode]);

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
