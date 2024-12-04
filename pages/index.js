// pages/index.js
import React from "react";
import Link from "next/link";
import isURL from "validator/lib/isURL";
import axios from "axios";

function Home() {
  const [isValidURL, setIsValidURL] = React.useState(true);
  const [urlInput, setUrlInput] = React.useState("");
  const [countInput, setCountInput] = React.useState(1);
  const [generatedUrls, setGeneratedUrls] = React.useState([]);

  async function submitUrl(longUrl, count) {
    try {
      console.log("Submitting URL:", longUrl, "Count:", count);
      const response = await axios.post("/api/shorten", { longUrl, count });
      console.log("Response from /api/shorten:", response.data);
      return response.data.urls;
    } catch (error) {
      console.error("Error submitting URL:", error);
      return null;
    }
  }

  function downloadTxt(urls) {
    const hostname = window.location.origin;
    const content = urls.map((u) => `${hostname}/${u.short}`).join("\n");
    const txtContent = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    const link = document.createElement("a");
    link.setAttribute("href", txtContent);
    link.setAttribute("download", "shortened_urls.txt");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  }

  return (
    <main className="grid place-items-center h-screen">
      <div className="bg-cyan-900 w-full grid place-content-center py-20">
        <div>
          <h1 className="text-center text-4xl text-white">URL Shortener</h1>
          <div></div>
          <div className="w w-96">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isURL(urlInput)) {
                  setIsValidURL(true);
                  const urls = await submitUrl(urlInput, countInput);
                  if (urls) {
                    setGeneratedUrls(urls);
                  }
                } else {
                  setIsValidURL(false);
                }
              }}
            >
              <div className="relative mt-4">
                <input
                  type="text"
                  name="search"
                  placeholder="Enter link here"
                  id="search"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className={`block w-full rounded-md border-0 py-3 px-3 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset outline-none focus:ring-cyan-600 ${
                    !isValidURL && "focus:ring-red-600 ring-red-600"
                  } `}
                />
                <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                  <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
                    Enter
                  </kbd>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="count" className="text-white">
                  Number of URLs to generate:
                </label>
                <input
                  type="number"
                  name="count"
                  id="count"
                  min="1"
                  value={countInput}
                  onChange={(e) => setCountInput(e.target.value)}
                  className="block w-full rounded-md border-0 py-3 px-3 mt-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset outline-none focus:ring-cyan-600"
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full bg-cyan-600 text-white py-2 rounded-md hover:bg-cyan-700"
              >
                Shorten URL(s)
              </button>
            </form>
            {generatedUrls.length === 1 && (
              <div className="flex gap-4 mt-6 p-5 rounded-md border border-cyan-500 bg-cyan-50 items-center">
                <p className="line-clamp-1">{generatedUrls[0].long}</p>
                <p className="text-cyan-700">
                  <Link href={`/${generatedUrls[0].short}`}>
                    {window.location.origin}/{generatedUrls[0].short}
                  </Link>
                </p>
              </div>
            )}
            {generatedUrls.length > 1 && (
              <div className="mt-6">
                <p className="text-white">
                  Successfully generated {generatedUrls.length} URLs.
                </p>
                <button
                  onClick={() => downloadTxt(generatedUrls)}
                  className="mt-4 w-full bg-cyan-600 text-white py-2 rounded-md hover:bg-cyan-700"
                >
                  Download TXT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
