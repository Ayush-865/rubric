"use client";
import React from "react";
import { ChevronLeft, ChevronRight, Upload, Check } from "lucide-react";
import { toast } from "react-hot-toast";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const CreateClass = () => {
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;
  const [selectedIndicators, setSelectedIndicators] = React.useState<string[]>(
    []
  );
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [formData, setFormData] = React.useState({
    courseName: "",
    courseCode: "",
    year: "",
    semester: "",
    batch: "",
    department: "",
    academicYear: "",
    facultyName: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    const classData = {
      courseName: formData.courseName,
      courseCode: formData.courseCode,
      year: formData.year,
      semester: formData.semester,
      batch: formData.batch,
      department: formData.department,
      academicYear: formData.academicYear,
      facultyName: formData.facultyName,
      indicators: selectedIndicators,
    };

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
      toast.error(
        "Please fill in all required fields and select exactly 5 indicators."
      );
      return;
    }

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create class");
      }

      const { classId } = await response.json();
      toast.success("Class created successfully!");

      if (csvFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", csvFile);
        uploadFormData.append("classId", classId);

        const uploadResponse = await fetch("/api/students", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Failed to upload students");
        }

        toast.success("Students uploaded successfully!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };

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

  const performanceIndicators = [
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

  const handleNext = () => step < totalSteps && setStep(step + 1);
  const handlePrev = () => step > 1 && setStep(step - 1);

  const getStepTitle = () => {
    return (
      {
        1: "Class Information",
        2: "Performance Indicators",
        3: "Add Students",
      }[step] || ""
    );
  };

  const toggleIndicator = (value: string): void => {
    if (selectedIndicators.includes(value)) {
      setSelectedIndicators(
        selectedIndicators.filter((item: string) => item !== value)
      );
    } else if (selectedIndicators.length < 5) {
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

      {step === 1 && (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseName" className="text-gray-300">
                Course Name
              </Label>
              <Input
                id="courseName"
                value={formData.courseName}
                onChange={(e) =>
                  setFormData({ ...formData, courseName: e.target.value })
                }
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
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData({ ...formData, courseCode: e.target.value })
                }
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
              <Select
                value={formData.year}
                onValueChange={(value) =>
                  setFormData({ ...formData, year: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white font-roboto">
                  <SelectItem value="F. Y. B. Tech">F. Y. B. Tech</SelectItem>
                  <SelectItem value="S. Y. B. Tech">S. Y. B. Tech</SelectItem>
                  <SelectItem value="T. Y. B. Tech">T. Y. B. Tech</SelectItem>
                  <SelectItem value="B. Tech">B. Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester" className="text-gray-300">
                Semester
              </Label>
              <Select
                value={formData.semester}
                onValueChange={(value) =>
                  setFormData({ ...formData, semester: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white font-roboto">
                  {["I", "II", "III", "IV", "V", "VI", "VII", "VIII"].map(
                    (sem) => (
                      <SelectItem key={sem} value={sem}>
                        {sem}
                      </SelectItem>
                    )
                  )}
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
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
                placeholder="e.g. A"
                className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-300">
                Department
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData({ ...formData, department: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto bg-gray-800 border-gray-700 text-white font-roboto">
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
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
              <InputOTP
                maxLength={9}
                value={formData.academicYear}
                onChange={(value) =>
                  setFormData({ ...formData, academicYear: value })
                }
                className="font-roboto text-white"
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600"
                  />
                  <InputOTPSlot
                    index={1}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600"
                  />
                  <InputOTPSlot
                    index={2}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600"
                  />
                  <InputOTPSlot
                    index={3}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600"
                  />
                </InputOTPGroup>
                <InputOTPSeparator className="text-gray-400 mx-0" />
                <InputOTPGroup>
                  <InputOTPSlot
                    index={4}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600"
                  />
                  <InputOTPSlot
                    index={5}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600"
                  />
                  <InputOTPSlot
                    index={6}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600"
                  />
                  <InputOTPSlot
                    index={7}
                    className="border-gray-700 bg-gray-800 text-white h-8 w-7 focus:ring-blue-600"
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
                value={formData.facultyName}
                onChange={(e) =>
                  setFormData({ ...formData, facultyName: e.target.value })
                }
                placeholder="e.g. Dr. John Doe"
                className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 font-roboto"
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          <p className="text-sm text-blue-300 font-roboto bg-blue-900/20 p-3 rounded border border-blue-900/50">
            Please select exactly 5 performance indicators that will be used to
            evaluate students in this course. Selected:{" "}
            {selectedIndicators.length}/5
          </p>
          <div className="grid grid-cols-1 gap-4">
            {performanceIndicators.map((indicator) => {
              const indicatorId = indicator.name;
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

      {step === 3 && (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center space-y-4">
            <div className="mx-auto bg-blue-900/30 rounded-full p-3 w-14 h-14 flex items-center justify-center">
              <Upload className="h-6 w-6 text-blue-300" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-gray-200 font-roboto">
                Upload Student CSV (Optional)
              </h3>
              <p className="text-sm text-gray-400 font-roboto mt-1">
                CSV should include Name, SAP ID, and Roll Number for each
                student
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
              <ChevronLeft size={16} className="mr-2" /> Previous
            </Button>
          )}
        </div>
        <div className="w-full sm:w-auto">
          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              className="bg-blue-700 hover:bg-blue-600 font-roboto w-full sm:w-auto"
            >
              Next <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-blue-700 hover:bg-blue-600 font-roboto w-full sm:w-auto"
              onClick={handleSubmit}
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
