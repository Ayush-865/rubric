"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Mock data structure based on original class page
interface StudentData {
  id: string;
  name: string;
  rollNo: string;
  experiments: { [key: string]: { [key: string]: number | null } };
  experimentTotals: { [key: string]: number | null };
  totalMarks: number | null;
}

interface ClassInfo {
  id: string;
  name: string;
  code: string;
  facultyName: string;
  department: string;
  batch: string;
  year: string;
  semester: string;
  academicYear: string;
  performanceIndicators: string[];
}

const SharePage = ({ params }: { params: { id: string } }) => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("student");

  const [classInfo, setClassInfo] = useState<ClassInfo>({
    id: params.id,
    name: "Web Development",
    code: "CS301",
    facultyName: "Dr. John Doe",
    department: "Computer Science and Engineering (Data Science)",
    batch: "A",
    year: "T. Y. B. Tech",
    semester: "V",
    academicYear: "2024-2025",
    performanceIndicators: [
      "Knowledge",
      "Describe",
      "Demonstration",
      "Strategy (Analyse & / or Evaluate)",
      "Interpret / Develop",
    ],
  });

  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulating an API call to fetch student data
    // In a real application, this would be an API call to your backend
    setTimeout(() => {
      if (!studentId) {
        setError("Invalid student ID");
        setLoading(false);
        return;
      }

      // Mock student data retrieval
      // This would normally come from your API/database
      const mockStudent: StudentData = {
        id: studentId,
        name: "John Smith",
        rollNo: "CS123",
        experiments: {
          Exp1: {
            Knowledge: 4,
            Describe: 3,
            Demonstration: 5,
            "Strategy (Analyse & / or Evaluate)": 4,
            "Interpret / Develop": 3,
          },
          Exp2: {
            Knowledge: 5,
            Describe: 4,
            Demonstration: 4,
            "Strategy (Analyse & / or Evaluate)": 3,
            "Interpret / Develop": 4,
          },
          // Add more experiment data as needed
        },
        experimentTotals: {
          Exp1: 19,
          Exp2: 20,
          // Add more totals as needed
        },
        totalMarks: 19.5,
      };

      setStudentData(mockStudent);
      setLoading(false);
    }, 1000);
  }, [studentId]);

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen text-gray-100 p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full inline-block mb-4"></div>
          <p className="text-gray-400">Loading your marks...</p>
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="bg-gray-950 min-h-screen text-gray-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto text-center p-8 bg-gray-900 rounded-xl border border-red-900/30">
          <BookOpen className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            {error ||
              "Unable to load student marks. The link may be invalid or expired."}
          </p>
          <Button
            asChild
            variant="outline"
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get experiment names dynamically
  const experimentNames = Object.keys(studentData.experimentTotals);

  return (
    <div className="bg-gray-950 min-h-screen text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Class Info */}
        <div className="bg-gradient-to-r from-blue-900/30 to-gray-900 rounded-xl p-4 sm:p-6 mb-6 border border-blue-900/20 shadow-lg">
          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-400 mr-2" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {classInfo.name}
                <span className="text-blue-400 ml-2">({classInfo.code})</span>
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-end">
              <div>
                <div className="text-gray-400 flex flex-wrap items-center gap-2">
                  <Badge className="bg-blue-900/40 text-xs">
                    {classInfo.year}
                  </Badge>
                  <span className="text-sm">{classInfo.semester} Sem</span>
                  <Badge className="bg-gray-800 text-xs">
                    {classInfo.academicYear}
                  </Badge>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-white">
                  {studentData.name}
                  <span className="ml-2 text-blue-400 text-sm">
                    ({studentData.rollNo})
                  </span>
                </h2>
              </div>
              <div className="text-center">
                <div className="bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-900/30">
                  <div className="text-gray-400 text-xs mb-1">
                    OVERALL SCORE
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {studentData.totalMarks !== null
                      ? studentData.totalMarks.toFixed(2)
                      : "—"}
                    <span className="text-sm text-gray-400">/25</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Experiments Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">
            Experiment Scores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experimentNames.map((expName) => {
              const expTotal = studentData.experimentTotals[expName];
              return (
                <Card
                  key={expName}
                  className="bg-gray-900 border-gray-800 text-white overflow-hidden"
                >
                  <CardHeader className="bg-gray-800/50 pb-3">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{expName}</span>
                      <Badge
                        className={`${
                          expTotal !== null && expTotal >= 20
                            ? "bg-green-900/40 text-green-400"
                            : expTotal !== null && expTotal >= 15
                            ? "bg-blue-900/40 text-blue-400"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {expTotal !== null ? expTotal : "—"}/25
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {classInfo.performanceIndicators.map((indicator) => {
                        const score =
                          studentData.experiments[expName]?.[indicator] ?? null;
                        return (
                          <li
                            key={indicator}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-400 truncate max-w-[70%]">
                              {indicator}
                            </span>
                            <span className="font-medium">
                              {score !== null ? score : "—"}/5
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
