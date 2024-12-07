import { FpjsProvider, FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: "iCdgQbPm5pEzzgz6olsm",
        endpoint: [
          "https://metrics.botcheck.co",
          FingerprintJSPro.defaultEndpoint
        ],
        scriptUrlPattern: [
          "https://metrics.botcheck.co/web/v<version>/<apiKey>/loader_v<loaderVersion>.js",
          FingerprintJSPro.defaultScriptUrlPattern
        ]
      }}
    >
      <Component {...pageProps} />
    </FpjsProvider>
  );
}
