import { FpjsProvider, FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: "iCdgQbPm5pEzzgz6olsm",
        endpoint: [
          "https://www.botcheck.co",
          FingerprintJSPro.defaultEndpoint
        ],
        scriptUrlPattern: [
          "https://www.botcheck.co/web/v<version>/<apiKey>/loader_v<loaderVersion>.js",
          FingerprintJSPro.defaultScriptUrlPattern
        ]
      }}
    >
      <Component {...pageProps} />
    </FpjsProvider>
  );
}
