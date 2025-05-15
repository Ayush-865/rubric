"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { pdf } from "@react-pdf/renderer";
import { AssessmentForm } from "../_components/AssessmentForm";
import { Loader2 } from "lucide-react";

export default function DownloadRubricPage({
  params,
}: {
  params: { id: string };
}) {
  const [sapId, setSapId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const classId = params.id; // Get the class ID from URL parameters

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSapId(e.target.value);
  };

  const handleFetchData = async () => {
    try {
      if (!sapId || sapId.length < 5) {
        toast.error("Please enter a valid SAP ID");
        return;
      }

      setLoading(true);
      // Include the class ID in the API request
      const response = await fetch(
        `/api/generate-pdf?sapId=${sapId}&classId=${classId}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch student data");
      }

      const result = await response.json();
      
      // Log the marks data structure to understand it better
      console.log('Marks data:', result.data?.marks);
      console.log('Experiments:', result.data?.marks?.experiments);
      console.log('Indicators:', result.data?.class?.indicators);

      if (result.data) {
        // Extract data from API response
        const studentData = {
          name: result.data.student.name,
          sapId: result.data.student.sapId,
          rollNo: result.data.student.rollNo,
          batch: result.data.student.batch,
        };

        const classData = {
          courseName: result.data.class.courseName,
          courseCode: result.data.class.courseCode,
          academicYear: result.data.class.academicYear,
          year: result.data.class.year,
          semester: result.data.class.semester,
          department: result.data.class.department,
          facultyName: result.data.class.facultyName,
          indicators: result.data.class.indicators,
        };

        const totalMarks = result.data.marks?.totalMarks || null;
        const experiments = result.data.marks?.experiments || {};
        const experimentTotals = result.data.marks?.experimentTotals || {};

        // Create blob URL for the PDF with data passed as props
        const blob = await pdf(
          <AssessmentForm
            studentData={studentData}
            classData={classData}
            totalMarks={totalMarks}
            experiments={experiments}
            experimentTotals={experimentTotals}
          />
        ).toBlob();

        const url = URL.createObjectURL(blob);

        // Create a link and trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = `rubric-${sapId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Rubric download started!");
      }
    } catch (error: any) {
      console.error("Download failed", error);
      toast.error(
        error.message || "Failed to download rubric. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-4.6rem)] gradient-background">
      <div className="bg-black bg-opacity-75 text-white p-8 rounded-xl shadow-lg flex flex-col gap-4 w-full max-w-md">
        <h1 className="text-xl text-center mb-2">Download Assessment Form</h1>
        <input
          name="sapId"
          type="text"
          value={sapId}
          onChange={handleChange}
          placeholder="Enter SAP ID"
          className="font-roboto w-full p-3 bg-gray-800 border-2 border-gray-600 rounded-md placeholder-gray-400 focus:bg-gray-700 focus:border-gray-500 outline-none"
        />
        <button
          onClick={handleFetchData}
          disabled={loading}
          className="font-roboto mt-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-md hover:bg-gray-800 hover:-translate-y-1 transition flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              LOADING...
            </>
          ) : (
            "DOWNLOAD RUBRIC"
          )}
        </button>
      </div>
    </div>
  );
}
