"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function DownloadRubricPage() {
  const [sapId, setSapId] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSapId(e.target.value);
  };

  const handleDownload = async () => {
    try {
      if (!sapId || sapId.length < 5) {
        toast.error("Please enter a valid SAP ID");
        return;
      }

      const downloadUrl = `/api/generate-pdf?sapId=${sapId}`;

      // Create a temporary link and click it to download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `rubric-${sapId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Rubric download started!");
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Failed to download rubric. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-4.6rem)] gradient-background">
      <div className="bg-black bg-opacity-75 text-white p-8 rounded-xl shadow-lg flex flex-col gap-4 w-full max-w-md">
        <input
          name="sapId"
          type="text"
          value={sapId}
          onChange={handleChange}
          placeholder="Enter SAP ID"
          className="font-roboto w-full p-3 bg-gray-800 border-2 border-gray-600 rounded-md placeholder-gray-400 focus:bg-gray-700 focus:border-gray-500 outline-none"
        />
        <button
          onClick={handleDownload}
          className="font-roboto mt-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-md hover:bg-gray-800 hover:-translate-y-1 transition"
        >
          DOWNLOAD RUBRIC
        </button>
      </div>
    </div>
  );
}
