"use client";
import React from "react";
import { ChevronLeft, ChevronRight, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { PerformanceIndicator } from "../types/types";




const CreateClass = () => {
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;
  const [selectedIndicators, setSelectedIndicators] = React.useState<string[]>(
    []
  );
  const handleSubmit = async () => {
    try {
      // Collect form data
      const classData = {
        courseName: (document.getElementById("courseName") as HTMLInputElement)?.value,
        courseCode: (document.getElementById("courseCode") as HTMLInputElement)?.value,
        year: document.querySelector("#year .select-value")?.textContent,
        semester: document.querySelector("#semester .select-value")?.textContent,
        batch: (document.getElementById("batch") as HTMLInputElement)?.value,
        department: document.querySelector("#department .select-value")?.textContent,
        academicYear: (document.getElementById("academicYear") as HTMLInputElement)?.value,
        facultyName: (document.getElementById("facultyName") as HTMLInputElement)?.value,
        indicators: selectedIndicators, // Use the selected indicators from state
      };
  
      // Validate required fields
      if (
        !classData.courseName ||
        !classData.courseCode ||
        !classData.year ||
        !classData.semester ||
        !classData.batch ||
        !classData.department ||
        !classData.academicYear ||
        !classData.facultyName ||
        classData.indicators.length !== 5
      ) {
        alert("Please fill in all required fields and select exactly 5 indicators.");
        return;
      }
  
      // Send data to the backend API
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      });
  
      if (response.ok) {
        alert("Class created successfully!");
        // Optionally, close the dialog or reset the form
      } else {
        const errorData = await response.json();
        alert(`Failed to create class: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating class:", error);
      alert("An error occurred while creating the class. Please try again.");
    }
  };

  // Department list in alphabetical order
  const departments = [
    "Artificial Intelligence (AI) and Data Science",
    "Artificial Intelligence and Machine Learning",
    "Computer Engineering",
    "Computer Science and Engineering (Data Science)",
    "Computer Science and Engineering (IOT and Cyber Security with Block Chain Technology)",
    "Electronics and Telecommunication Engg",
    "Information Technology",
    "Mechanical Engineering",
  ];

  const [csvFile, setCsvFile] = React.useState<File | null>(null);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    setCsvFile(e.target.files[0]);
  }
};

const handleUploadCSV = async () => {
  if (!csvFile) {
    alert("Please select a CSV file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", csvFile);

  try {
    const response = await fetch("/api/students", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Students uploaded successfully!");
    } else {
      const errorData = await response.json();
      alert(`Failed to upload students: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Error uploading CSV:", error);
    alert("An error occurred while uploading the CSV. Please try again.");
  }
};

  // Performance indicators
  const performanceIndicators: PerformanceIndicator[] = [
    {
      id: 1,
      name: "Knowledge",
      description: "Factual / Conceptual / Procedural / Metacognitive",
    },
    {
      id: 2,
      name: "Describe",
      description: "Factual / Conceptual / Procedural / Metacognitive",
    },
    {
      id: 3,
      name: "Demonstration",
      description: "Factual / Conceptual / Procedural / Metacognitive",
    },
    {
      id: 4,
      name: "Strategy (Analyse & / or Evaluate)",
      description: "Factual / Conceptual / Procedural / Metacognitive",
    },
    {
      id: 5,
      name: "Interpret / Develop",
      description: "Factual / Conceptual / Procedural / Metacognitive",
    },
    {
      id: 6,
      name: "Attitude towards learning",
      description:
        "Receiving, attending, responding, valuing, organizing, characterization by value",
    },
    {
      id: 7,
      name: "Non-verbal communication skills / Behaviour or Behavioural skills",
      description:
        "Motor skills, hand-eye coordination, gross body movements, finely coordinated body movements, speech behaviours",
    },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Class Information";
      case 2:
        return "Performance Indicators";
      case 3:
        return "Add Students";
      default:
        return "";
    }
  };

  const toggleIndicator = (value: string) => {
    if (selectedIndicators.includes(value)) {
      // Remove the indicator if it's already selected
      setSelectedIndicators(
        selectedIndicators.filter((item) => item !== value)
      );
    } else if (selectedIndicators.length < 5) {
      // Add indicator if we haven't reached the limit of 5
      setSelectedIndicators([...selectedIndicators, value]);
    }
  };

  return (
    <DialogContent className="bg-gray-900 text-gray-100 border-blue-900 font-roboto max-w-lg sm:max-w-2xl overflow-hidden mx-4 sm:mx-auto">
      <DialogHeader className="pb-2">
        <DialogTitle className="text-lg sm:text-xl text-blue-200 font-roboto">
          {getStepTitle()}
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-400 font-roboto">
          {step === 1 && "Enter the basic details about your class."}
          {step === 2 &&
            "Select 5 performance indicators that will be used to evaluate students."}
          {step === 3 && "Upload a CSV file with student information."}
        </DialogDescription>
      </DialogHeader>

      {/* Progress Bar */}
      <div className="mt-2 mb-4">
        <Progress value={(step / totalSteps) * 100} className="h-2 bg-gray-800">
          <div className="h-full bg-[#3b82f6] rounded-full"></div>
        </Progress>
        <div className="flex justify-between mt-1 text-xs text-blue-300 font-roboto">
          <span className={step === 1 ? "text-blue-400 font-medium" : ""}>
            Class Info
          </span>
          <span className={step === 2 ? "text-blue-400 font-medium" : ""}>
            Performance Indicators
          </span>
          <span className={step === 3 ? "text-blue-400 font-medium" : ""}>
            Students
          </span>
        </div>
      </div>

      {/* Step 1: Class Information */}
      {step === 1 && (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseName" className="text-gray-300">
                Course Name
              </Label>
              <Input
                id="courseName"
                placeholder="e.g. Web Development"
                className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCode" className="text-gray-300">
                Course Code
              </Label>
              <Input
                id="courseCode"
                placeholder="e.g. CS301"
                className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-gray-300">
                Year
              </Label>
              <Select>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white font-roboto">
                  <SelectItem
                    value="F. Y. B. Tech"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    F. Y. B. Tech
                  </SelectItem>
                  <SelectItem
                    value="S. Y. B. Tech"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    S. Y. B. Tech
                  </SelectItem>
                  <SelectItem
                    value="T. Y. B. Tech"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    T. Y. B. Tech
                  </SelectItem>
                  <SelectItem
                    value="B. Tech"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    B. Tech
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester" className="text-gray-300">
                Semester
              </Label>
              <Select>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white font-roboto">
                  <SelectItem
                    value="I"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    I
                  </SelectItem>
                  <SelectItem
                    value="II"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    II
                  </SelectItem>
                  <SelectItem
                    value="III"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    III
                  </SelectItem>
                  <SelectItem
                    value="IV"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    IV
                  </SelectItem>
                  <SelectItem
                    value="V"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    V
                  </SelectItem>
                  <SelectItem
                    value="VI"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    VI
                  </SelectItem>
                  <SelectItem
                    value="VII"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    VII
                  </SelectItem>
                  <SelectItem
                    value="VIII"
                    className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                  >
                    VIII
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch" className="text-gray-300">
                Batch
              </Label>
              <Input
                id="batch"
                placeholder="e.g. A"
                className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-300">
                Department
              </Label>
              <Select>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto bg-gray-800 border-gray-700 text-white font-roboto">
                  {departments.map((dept) => (
                    <SelectItem
                      key={dept}
                      value={dept}
                      className="hover:bg-blue-900/50 hover:text-blue-300 focus:bg-blue-900/50 focus:text-blue-300"
                    >
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear" className="text-gray-300">
                Academic Year
              </Label>

              <InputOTP maxLength={9} className="font-roboto text-white">
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600 caret-white selection:bg-blue-900/30"
                  />
                  <InputOTPSlot
                    index={1}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600 caret-white selection:bg-blue-900/30"
                  />
                  <InputOTPSlot
                    index={2}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600 caret-white selection:bg-blue-900/30"
                  />
                  <InputOTPSlot
                    index={3}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600 caret-white selection:bg-blue-900/30"
                  />
                </InputOTPGroup>
                <InputOTPSeparator className="text-gray-400 mx-0" />
                <InputOTPGroup>
                  <InputOTPSlot
                    index={4}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600 caret-white selection:bg-blue-900/30"
                  />
                  <InputOTPSlot
                    index={5}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600 caret-white selection:bg-blue-900/30"
                  />
                  <InputOTPSlot
                    index={6}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600 caret-white selection:bg-blue-900/30"
                  />
                  <InputOTPSlot
                    index={7}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600 caret-white selection:bg-blue-900/30"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="space-y-2">
              <Label htmlFor="facultyName" className="text-gray-300">
                Faculty Name
              </Label>
              <Input
                id="facultyName"
                placeholder="e.g. Dr. John Doe"
                className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Performance Indicators */}
      {step === 2 && (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          <p className="text-sm text-blue-300 font-roboto bg-blue-900/20 p-3 rounded border border-blue-900/50">
            Please select exactly 5 performance indicators that will be used to
            evaluate students in this course. Selected:{" "}
            {selectedIndicators.length}/5
          </p>

          <div className="grid grid-cols-1 gap-4">
            {performanceIndicators.map((indicator) => {
              const indicatorId = `indicator-${indicator.id}`;
              const isSelected = selectedIndicators.includes(indicatorId);
              const isDisabled = !isSelected && selectedIndicators.length >= 5;

              return (
                <div
                  key={indicator.id}
                  className={`flex items-start space-x-3 p-3 rounded-md hover:bg-gray-800/50 transition-colors ${
                    isSelected ? "bg-blue-900/20 border border-blue-800/50" : ""
                  }`}
                  onClick={() => !isDisabled && toggleIndicator(indicatorId)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border ${
                      isSelected
                        ? "bg-blue-600 border-blue-400 text-white flex items-center justify-center"
                        : "border-gray-600"
                    } ${isDisabled ? "opacity-50" : "cursor-pointer"}`}
                  >
                    {isSelected && <Check size={12} />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-200 font-roboto cursor-pointer">
                      {indicator.name}
                    </div>
                    <p className="text-xs text-gray-400 font-roboto mt-1">
                      {indicator.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Add Students */}
      {step === 3 && (
  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center space-y-4">
      <div className="mx-auto bg-blue-900/30 rounded-full p-3 w-14 h-14 flex items-center justify-center">
        <Upload className="h-6 w-6 text-blue-300" />
      </div>
      <div>
        <h3 className="font-medium text-lg text-gray-200 font-roboto">
          Upload Student CSV
        </h3>
        <p className="text-sm text-gray-400 font-roboto mt-1">
          CSV should include Name, SAP ID, and Roll Number for each student
        </p>
      </div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        id="csvUpload"
      />
      <label
        htmlFor="csvUpload"
        className="cursor-pointer border-blue-800 bg-blue-900/30 text-blue-300 hover:bg-blue-900/30 hover:text-blue-300 font-roboto px-4 py-2 rounded-md"
      >
        Choose CSV File
      </label>
      {csvFile && (
        <p className="text-sm text-gray-400 font-roboto mt-2">
          Selected File: {csvFile.name}
        </p>
      )}
      <Button
        variant="outline"
        className="border-blue-800 bg-blue-900/30 text-blue-300 hover:bg-blue-900/30 hover:text-blue-300 font-roboto"
        onClick={handleUploadCSV}
      >
        Upload CSV
      </Button>
    </div>
  </div>
)}

      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 border-t border-gray-800 pt-4 mt-4">
        <div>
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handlePrev}
              className="border-gray-700 bg-gray-800 text-blue-300 hover:bg-gray-800 hover:text-blue-300 font-roboto w-full sm:w-auto"
            >
              <ChevronLeft size={16} className="mr-2" />
              Previous
            </Button>
          )}
        </div>
        <div className="w-full sm:w-auto">
          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              className="bg-blue-700 hover:bg-blue-600 font-roboto w-full sm:w-auto"
            >
              Next
              <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
            className="bg-blue-700 hover:bg-blue-600 font-roboto w-full sm:w-auto"
            onClick={handleSubmit} // Call the handleSubmit function
          >
            Create Class
          </Button>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateClass;
