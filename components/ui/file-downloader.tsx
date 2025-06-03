"use client";

import { Button } from "./button";

export function FileDownloader() {
  const handleDownload = () => {
    fetch("/api/download", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to download file");
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "downloaded-file"; // Replace with the desired file name
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
        alert("An error occurred while downloading the file");
      });
  };

  return (
    <div className="file-downloader">
      <Button onClick={handleDownload}>Download</Button>
    </div>
  );
}