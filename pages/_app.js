import '@/styles/globals.css';
import { FpjsProvider, FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';

export default function App({ Component, pageProps }) {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: "iCdgQbPm5pEzzgz6olsm",
        endpoint: [
          "https://botcheck.co/UXkHBdBoWSMpV4HM/CsFgNtjQmkY3RpK8",
          FingerprintJSPro.defaultEndpoint
        ],
        scriptUrlPattern: [
          "https://botcheck.co/UXkHBdBoWSMpV4HM/Cpkc0YJv5LceleCQ?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>",
          FingerprintJSPro.defaultScriptUrlPattern
        ]
      }}
    >
      <Component {...pageProps} />
    </FpjsProvider>
  );
}
