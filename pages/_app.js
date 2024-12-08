import '@/styles/globals.css';
import { FpjsProvider, FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';

export default function App({ Component, pageProps }) {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: "iCdgQbPm5pEzzgz6olsm",
        endpoint: [
          "https://botcheck.co/s60QLi5vS8SRBTDw/RruuxpLhWeFDHE5m",
          FingerprintJSPro.defaultEndpoint
        ],
        scriptUrlPattern: [
          "https://botcheck.co/s60QLi5vS8SRBTDw/MLmW5prvHHtg1xKA?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>",
          FingerprintJSPro.defaultScriptUrlPattern
        ]
      }}
    >
      <Component {...pageProps} />
    </FpjsProvider>
  );
}
