import { useState } from "react";
import { useRef } from "react";
export default function Home() {
  const [image, setImage] = useState(null);
  const [base64StringImage, setBase64StringImage] = useState(null);
  const [errorMessage, setErrorMesage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFileInput, setShowFileInput] = useState(true);
  const inputRef = useRef(null);

  const uploadFileToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
    }
  };

  const handleSubmit = async () => {
    const body = new FormData();
    body.append("file", image);

    if (!image) {
      setErrorMesage("Please upload image.");
      return;
    }

    inputRef.current.value = null;

    try {
      setErrorMesage("");
      setLoading(true);

      const SERVER_URL =
        process.env.NEXT_PUBLIC_SERVER_URL;

      const response = await fetch(`${SERVER_URL}/upload`, {
        headers: {
          Accept: "application/json",
        },
        method: "POST",
        body,
      });

      const parsedResponse = await response.json();

      if (response.status === 400) {
        setErrorMesage(`${parsedResponse.message}`);
        setLoading(false);
        return;
      }
      if (response.status === 500) {
        setErrorMesage("Internal server error.");
        setLoading(false);
        return;
      }

      const base64String = parsedResponse.image.split("'")[1];
      setShowFileInput(false);
      setBase64StringImage(base64String);
      setLoading(false);
    } catch (err) {
      setErrorMesage(
        "OOPS ! Something went wrong. Please try again after some time."
      );
      setLoading(false);
    }
  };

  const downlodImage = (filename) => {
    const linksrc = `data:image/png;base64,${base64StringImage}`;
    const fullFilename = filename + ".png";
    const downloadLink = document.createElement("a");

    downloadLink.href = linksrc;
    downloadLink.download = fullFilename;
    downloadLink.click();
  };

  const resetAllState = () => {
    setImage(null);
    setBase64StringImage(null);
    setErrorMesage(null);
    setLoading(false);
    setShowFileInput(true);
  };

  const handleDownload = (e) => {
    e.preventDefault();
    const filename = image.name.split(".")[0];
    downlodImage(filename);
    resetAllState();
  };

  const handleCancel = (e) => {
    e.preventDefault();
    resetAllState();
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex-col w-10/12  p-[3%] md:w-8/12 lg:w-6/12 rounded-lg bg-slate-100  items-center justify-center space-y-5">
        <div className={`${showFileInput ? "block" : "hidden"}`}>
          <h1>Select image</h1>
          <input
            className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-2"
            id="file_input"
            type="file"
            name="file"
            ref={inputRef}
            disabled={loading ? true : false}
            onClick={() => setErrorMesage("")}
            onChange={uploadFileToClient}
          ></input>
        </div>

        {errorMessage && <p className="text-red-600">{errorMessage}</p>}

        {base64StringImage && (
          <div className="w-full h-[200px] flex justify-center border-dotted border-[2px] rounded-md border-blue-300 ">
            <img
              src={`data:image/png;base64,${base64StringImage}`}
              className=" object-contain max-w-full max-h-full"
            />
          </div>
        )}

        <div className="flex items-center justify-between space-x-3">
          {!base64StringImage && (
            <button
              type="button"
              disabled={loading ? true : false}
              className="w-full text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
              onClick={handleSubmit}
            >
              {loading ? "loading..." : "submit"}
            </button>
          )}
          {base64StringImage && (
            <>
              <button
                type="button"
                className="w-full text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                onClick={handleDownload}
              >
                Download
              </button>
              <button
                type="button"
                className="w-full text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
