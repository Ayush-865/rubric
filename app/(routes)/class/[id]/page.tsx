"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Users,
  BookOpen,
  PlusCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Share from "./_components/Share";
import { toast } from "react-hot-toast";

// Constants
const MAX_INDICATOR_MARKS = 5; // Each indicator can have max 5 marks
const NUM_INDICATORS = 5; // Number of performance indicators
const MAX_EXPERIMENT_MARKS = 25; // Maximum marks per experiment (5 indicators × 5 marks)
// Dynamic experiment count based on class

interface Student {
  id: string;
  name: string;
  rollNo: string;
  experiments: { [key: string]: { [key: string]: number | null } };
  experimentTotals: { [key: string]: number | null };
  totalMarks: number | null;
}

interface ClassInfo {
  id: string;
  courseName: string;
  courseCode: string;
  facultyName: string;
  department: string;
  batch: string;
  year: string;
  semester: string;
  academicYear: string;
  indicators: string[];
  students: Array<{
    _id: string;
    name: string;
    sapId: string;
    rollNo: string;
    batch: string;
  }>;
}

// Add interface for mark data from API
interface MarkData {
  studentId: string;
  experiments: { [key: string]: { [key: string]: number } };
  experimentTotals: { [key: string]: number };
  totalMarks: number | null;
}

const ClassDetailPage = ({ params }: { params: { id: string } }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Updated class info state with correct structure
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);

  // Determine number of experiments dynamically - can be changed based on your data source
  const [numExperiments, setNumExperiments] = useState(10);

  const [students, setStudents] = useState<Student[]>([]);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [editingCell, setEditingCell] = useState<{
    studentId: string;
    field: string;
    indicator?: string;
  } | null>(null);
  const [currentValue, setCurrentValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch class data from API
  useEffect(() => {
    const fetchClassData = async () => {
      setIsLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(
          `/api/classes/${params.id}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch class data");
        }

        const data = await response.json();
        setClassInfo(data);
      } catch (err: any) {
        console.error("Error fetching class data:", err);
        setError(err.message || "Failed to load class data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
  }, [params.id]);

  // Generate empty student data function
  const generateEmptyStudents = useCallback(
    (count: number) => {
      if (!classInfo) return [];

      // Use real student data instead of generating fake data
      return classInfo.students
        .map((student) => {
          const experiments: {
            [key: string]: { [key: string]: number | null };
          } = {};
          const experimentTotals: { [key: string]: number | null } = {};

          // Create empty experiment scores for each indicator
          for (let j = 1; j <= numExperiments; j++) {
            const expName = `Exp${j}`;
            experiments[expName] = {};

            // For each performance indicator
            if (classInfo.indicators) {
              classInfo.indicators.forEach((indicator) => {
                experiments[expName][indicator] = null;
              });
            }

            experimentTotals[expName] = null;
          }

          return {
            id: student._id,
            name: student.name,
            rollNo: student.rollNo,
            experiments,
            experimentTotals,
            totalMarks: null,
          };
        })
        .sort((a, b) => a.rollNo.localeCompare(b.rollNo));
    },
    [classInfo, numExperiments]
  );

  // Generate student data once class info is loaded and fetch existing marks
  useEffect(() => {
    if (classInfo) {
      // First generate empty student data with default structure
      const generatedStudents = generateEmptyStudents(
        classInfo.students.length
      );
      setStudents(generatedStudents);
      setFilteredStudents(generatedStudents);

      // Then fetch any saved marks from the database
      const fetchMarks = async () => {
        try {
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("token")
              : null;
          const response = await fetch(`/api/marks?classId=${classInfo.id}`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (!response.ok) {
            console.error("Failed to fetch marks:", await response.json());
            return;
          }

          const marksData: MarkData[] = await response.json();

          if (marksData && marksData.length > 0) {
            // Create a map for quick lookup of marks by student ID
            const marksMap = new Map();
            marksData.forEach((mark) => {
              marksMap.set(mark.studentId, mark);
            });

            // Update student data with saved marks
            const updatedStudents = generatedStudents.map((student) => {
              const savedMark = marksMap.get(student.id);

              if (!savedMark) return student;

              // Deep clone the student object
              const updatedStudent = { ...student };

              // Transform map data back to our format
              // Handle experiments data
              if (savedMark.experiments) {
                for (const [expKey, indicators] of Object.entries(
                  savedMark.experiments
                )) {
                  if (!updatedStudent.experiments[expKey]) {
                    updatedStudent.experiments[expKey] = {};
                  }

                  for (const [indicator, value] of Object.entries(
                    indicators as Record<string, number>
                  )) {
                    updatedStudent.experiments[expKey][indicator] = value;
                  }
                }
              }

              // Handle experiment totals
              if (savedMark.experimentTotals) {
                for (const [expKey, value] of Object.entries(
                  savedMark.experimentTotals
                )) {
                  updatedStudent.experimentTotals[expKey] = value as number;
                }
              }

              // Handle total marks
              if (
                savedMark.totalMarks !== undefined &&
                savedMark.totalMarks !== null
              ) {
                updatedStudent.totalMarks = savedMark.totalMarks;
              }

              return updatedStudent;
            });

            setStudents(updatedStudents);
            setFilteredStudents(updatedStudents);
          }
        } catch (error) {
          console.error("Error fetching marks:", error);
        }
      };

      fetchMarks();
    }
  }, [classInfo, generateEmptyStudents]);

  // Filter students based on search term and filter selection
  useEffect(() => {
    if (!students.length) return;

    const filtered = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

      if (selectedFilter === "all") return matchesSearch;
      if (selectedFilter === "incomplete") {
        return (
          matchesSearch &&
          (student.totalMarks === null || student.totalMarks === 0)
        );
      }
      if (selectedFilter === "complete") {
        return (
          matchesSearch && student.totalMarks !== null && student.totalMarks > 0
        );
      }
      if (selectedFilter === "highest") {
        // Find students with highest marks (excluding null)
        const validMarks = students
          .map((s) => s.totalMarks)
          .filter((mark) => mark !== null) as number[];

        const highestMarkValue =
          validMarks.length > 0 ? Math.max(...validMarks) : null;
        return (
          matchesSearch &&
          student.totalMarks === highestMarkValue &&
          student.totalMarks !== null
        );
      }
      if (selectedFilter === "lowest") {
        // Find students with lowest marks (excluding null/0)
        const nonZeroMarks = students
          .map((s) => s.totalMarks)
          .filter((mark) => mark !== null && mark > 0) as number[];

        const lowestMarkValue =
          nonZeroMarks.length > 0 ? Math.min(...nonZeroMarks) : null;
        return (
          matchesSearch &&
          student.totalMarks === lowestMarkValue &&
          student.totalMarks !== null
        );
      }

      return matchesSearch;
    });

    setFilteredStudents(filtered);
  }, [searchTerm, selectedFilter, students]);

  // Focus on input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  // Handle click outside to exit edit mode
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        saveCurrentValue();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingCell, currentValue]);

  const toggleExpandStudent = (studentId: string) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(studentId);
    }
  };

  // Helper function to validate mark value
  const validateMark = (
    value: string,
    isIndicator: boolean,
    isGrandTotal: boolean = false
  ): number | null => {
    // If value is empty, return null
    if (value.trim() === "") return null;

    const num = parseFloat(value);
    if (isNaN(num)) return null;

    const max = isIndicator ? MAX_INDICATOR_MARKS : MAX_EXPERIMENT_MARKS;
    if (num < 0) return 0;
    if (num > max) return max;

    // Round appropriately based on type
    if (!isGrandTotal) {
      return Math.round(num); // Integer for performance indicators and experiment totals
    } else {
      return Math.round(num * 100) / 100; // Round to 2 decimal places for grand total
    }
  };

  // Start editing a cell
  const startEdit = (studentId: string, field: string, indicator?: string) => {
    // Don't allow editing of total marks row for indicators
    if (field === "totalMarks" && indicator) return;

    // Auto-expand the student row when editing
    if (expandedStudent !== studentId) {
      setExpandedStudent(studentId);
    }

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    let initialValue: number | null = null;

    if (field.startsWith("Exp")) {
      if (indicator) {
        // Editing an indicator value
        initialValue = student.experiments[field][indicator] || null;
      } else {
        // Editing experiment total
        initialValue = student.experimentTotals[field] || null;
      }
    } else if (field === "totalMarks") {
      // Editing grand total
      initialValue = student.totalMarks || null;
    }

    setEditingCell({ studentId, field, indicator });
    setCurrentValue(initialValue !== null ? initialValue.toString() : "");
  };

  // Calculate values to match target sum while keeping existing values as much as possible
  const calculateDistribution = (
    existingValues: (number | null)[],
    targetSum: number,
    maxValuePerItem: number,
    addVariation: boolean = false
  ): number[] => {
    const values = [...existingValues].map((v) => (v === null ? 0 : v));
    const count = values.length;

    // Count how many fixed values we have
    const fixedValues = values.filter((v) => v !== 0);
    const fixedSum = fixedValues.reduce((sum, val) => sum + val, 0);
    const remainingItems = count - fixedValues.length;

    // Target sum must be a whole number for experiment totals
    const roundedTargetSum = Math.round(targetSum);

    // If we need to adjust existing values (when it's mathematically impossible)
    if (remainingItems === 0 || fixedSum > roundedTargetSum) {
      // We need to adjust existing values with minimum changes
      // Sort by how far they are from mean
      const idealAverage = roundedTargetSum / count;
      let sortedIndices = values
        .map((val, idx) => ({ idx, val }))
        .sort(
          (a, b) =>
            Math.abs(a.val - idealAverage) - Math.abs(b.val - idealAverage)
        );

      let remaining = roundedTargetSum;
      const result = Array(count).fill(0);

      for (let i = 0; i < count; i++) {
        const { idx } = sortedIndices[i];

        if (i === count - 1) {
          // Last item gets whatever is left
          result[idx] = Math.min(Math.max(0, remaining), maxValuePerItem);
        } else {
          // Distribute evenly with slight preference to keep values close to original
          const value = Math.min(
            Math.max(0, Math.round(roundedTargetSum / count)),
            maxValuePerItem
          );
          result[idx] = value;
          remaining -= value;
        }
      }

      return result;
    } else {
      // We can keep existing values and distribute remainder
      let remainingSum = roundedTargetSum - fixedSum;

      // If we don't need variation, or there's only one item to distribute to
      if (!addVariation || remainingItems <= 1) {
        // Calculate base value per item (integer division)
        const baseValue = Math.floor(remainingSum / remainingItems);
        // Calculate how many items need an extra +1 to reach the exact sum
        const extraCount = remainingSum - baseValue * remainingItems;

        let extraAdded = 0;

        return values.map((val) => {
          if (val !== 0) return val; // Keep existing value

          // For empty values, assign base value + potentially add an extra 1
          const needsExtra = extraAdded < extraCount;
          if (needsExtra) extraAdded++;

          return Math.min(baseValue + (needsExtra ? 1 : 0), maxValuePerItem);
        });
      }

      // With variation - we'll use an exact algorithm to ensure the sum
      // First distribute evenly (base values) to get integer distribution
      const baseValue = Math.floor(remainingSum / remainingItems);
      const extraCount = remainingSum - baseValue * remainingItems;

      // Identify empty slots that need values
      const emptyIndices = values
        .map((val, idx) => (val === 0 ? idx : -1))
        .filter((idx) => idx !== -1);

      // Create result array with base values
      const result = [...values];

      // First assign base values to all empty slots
      emptyIndices.forEach((idx) => {
        result[idx] = baseValue;
      });

      // Distribute the "extra" 1's needed to reach exact sum
      for (let i = 0; i < extraCount; i++) {
        if (i < emptyIndices.length) {
          result[emptyIndices[i]] += 1;
        }
      }

      // Now we have an exact distribution that sums to the target
      // Add variation while maintaining the exact sum
      if (emptyIndices.length > 1) {
        const variationAmount = 2; // Fixed +/-2 variation

        // Apply variation in pairs to maintain sum
        for (let i = 0; i < Math.floor(emptyIndices.length / 2); i++) {
          const idx1 = emptyIndices[i * 2];
          const idx2 = emptyIndices[i * 2 + 1];

          // Random variation between 1 and variationAmount
          const variation = Math.floor(Math.random() * variationAmount) + 1;

          // Add to one, subtract from another to maintain sum
          if (
            result[idx1] + variation <= maxValuePerItem &&
            result[idx2] - variation >= 0
          ) {
            result[idx1] += variation;
            result[idx2] -= variation;
          } else if (
            result[idx1] - variation >= 0 &&
            result[idx2] + variation <= maxValuePerItem
          ) {
            result[idx1] -= variation;
            result[idx2] += variation;
          }
        }
      }

      return result;
    }
  };

  // Update indicators based on experiment total
  const updateIndicatorsFromExperimentTotal = (
    student: Student,
    experimentName: string,
    newTotal: number | null
  ) => {
    if (newTotal === null) return student;

    const updatedStudent = { ...student };
    const currentIndicators = classInfo!.indicators.map(
      (ind) => updatedStudent.experiments[experimentName][ind]
    );

    // Calculate new indicator values
    const newIndicatorValues = calculateDistribution(
      currentIndicators,
      newTotal,
      MAX_INDICATOR_MARKS
    );

    // Update experiment indicator values
    classInfo!.indicators.forEach((indicator, idx) => {
      updatedStudent.experiments[experimentName][indicator] =
        newIndicatorValues[idx];
    });

    return updatedStudent;
  };

  // Update experiment totals based on grand total
  const updateExperimentsFromGrandTotal = (
    student: Student,
    newGrandTotal: number | null
  ) => {
    if (newGrandTotal === null) return student;

    let updatedStudent = { ...student };
    const experimentNames = Array.from(
      { length: numExperiments },
      (_, i) => `Exp${i + 1}`
    );
    const currentTotals = experimentNames.map(
      (exp) => updatedStudent.experimentTotals[exp]
    );

    // Calculate new experiment totals with variation
    // Target total is the grand total multiplied by number of experiments
    const targetTotal = newGrandTotal * numExperiments;
    const newExperimentTotals = calculateDistribution(
      currentTotals,
      targetTotal,
      MAX_EXPERIMENT_MARKS,
      true // Add variation to the distribution
    );

    // Verify the total matches what we expect
    const actualTotal = newExperimentTotals.reduce((sum, val) => sum + val, 0);
    const actualAverage = actualTotal / numExperiments;

    // Update experiment totals and indicators
    experimentNames.forEach((exp, idx) => {
      const newExpTotal = newExperimentTotals[idx];
      updatedStudent.experimentTotals[exp] = newExpTotal;

      // Now update indicators for this experiment
      updatedStudent = updateIndicatorsFromExperimentTotal(
        updatedStudent,
        exp,
        newExpTotal
      );
    });

    // Make sure total marks is exactly what the user intended
    updatedStudent.totalMarks = newGrandTotal;

    return updatedStudent;
  };

  // Handle input change during editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setCurrentValue(value);
  };
  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      saveCurrentValue();
    } else if (e.key === "Escape") {
      e.preventDefault(); // Prevent default behavior
      setEditingCell(null);
      setExpandedStudent(null); // Contract row when Escape is pressed
    } else if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault(); // Prevent scroll and default behavior
      // Use setTimeout to ensure React's event handling is complete
      setTimeout(() => navigateCell(e.key), 0);
    }
  };

  // Navigate between cells with arrow keys
  const navigateCell = (direction: string) => {
    if (!editingCell) return;

    const { studentId: currentStudentId, field, indicator } = editingCell;
    const studentIndex = students.findIndex((s) => s.id === currentStudentId);

    let nextStudentId = currentStudentId;
    let nextField = field;
    let nextIndicator = indicator;

    const isExperimentTotal = field.startsWith("total_");
    const isGrandTotal = field === "grandTotal";
    const isIndicatorRow = !!indicator;

    // Extract experiment ID if it's an indicator or experiment total
    const experimentId = isIndicatorRow
      ? field
      : isExperimentTotal
      ? field.replace("total_", "")
      : "";

    switch (direction) {
      case "ArrowLeft":
        if (isGrandTotal) {
          // Move from grand total to last experiment total
          const lastExpName = `Exp${numExperiments}`;
          nextField = `total_${lastExpName}`;
        } else if (isExperimentTotal) {
          const currentExpNumber = parseInt(field.replace("total_Exp", ""));
          if (currentExpNumber > 1) {
            // Move to previous experiment total
            nextField = `total_Exp${currentExpNumber - 1}`;
          }
        } else if (isIndicatorRow) {
          // Can't navigate left from indicator rows
        } else {
          const currentExpNumber = parseInt(field.replace("Exp", ""));
          if (currentExpNumber > 1) {
            // Move to previous experiment
            nextField = `Exp${currentExpNumber - 1}`;
          }
        }
        break;

      case "ArrowRight":
        if (isGrandTotal) {
          // Can't navigate right from grand total
        } else if (isExperimentTotal) {
          const currentExpNumber = parseInt(field.replace("total_Exp", ""));
          if (currentExpNumber < numExperiments) {
            // Move to next experiment total
            nextField = `total_Exp${currentExpNumber + 1}`;
          } else {
            // Move from last experiment total to grand total
            nextField = "grandTotal";
          }
        } else if (isIndicatorRow) {
          // Can't navigate right from indicator rows
        } else {
          const currentExpNumber = parseInt(field.replace("Exp", ""));
          if (currentExpNumber < numExperiments) {
            // Move to next experiment
            nextField = `Exp${currentExpNumber + 1}`;
          } else {
            // Move to grand total
            nextField = "grandTotal";
          }
        }
        break;

      case "ArrowUp":
        if (isIndicatorRow) {
          const indicatorIdx = classInfo!.indicators.indexOf(indicator!);
          if (indicatorIdx > 0) {
            // Move to previous indicator in the same experiment
            nextIndicator = classInfo!.indicators[indicatorIdx - 1];
          } else {
            // Move to the experiment row
            nextIndicator = undefined;
          }
        } else if (studentIndex > 0) {
          // Move to previous student
          nextStudentId = students[studentIndex - 1].id;
        }
        break;

      case "ArrowDown":
        if (isIndicatorRow) {
          const indicatorIdx = classInfo!.indicators.indexOf(indicator!);
          if (indicatorIdx < classInfo!.indicators.length - 1) {
            // Move to next indicator in the same experiment
            nextIndicator = classInfo!.indicators[indicatorIdx + 1];
          } else if (studentIndex < students.length - 1) {
            // Move to next student's experiment row
            nextStudentId = students[studentIndex + 1].id;
            nextIndicator = undefined;
          }
        } else if (studentIndex < students.length - 1) {
          // Move to next student
          nextStudentId = students[studentIndex + 1].id;
        }
        break;

      case "Enter":
        if (!isIndicatorRow) {
          // Expand to show indicators
          nextIndicator = classInfo!.indicators[0];
        } else {
          const indicatorIdx = classInfo!.indicators.indexOf(indicator!);
          if (indicatorIdx < classInfo!.indicators.length - 1) {
            // Move to next indicator
            nextIndicator = classInfo!.indicators[indicatorIdx + 1];
          } else {
            // Move to next student
            if (studentIndex < students.length - 1) {
              nextStudentId = students[studentIndex + 1].id;
              nextIndicator = undefined;
            }
          }
        }
        break;
    } // Store editing cell information before clearing it
    const savedEditingCell = { ...editingCell };
    const currentValueToSave = currentValue;

    // Temporarily disable editing to prevent UI flicker
    setEditingCell(null);

    // Execute save operation and then navigate to next cell
    Promise.resolve().then(() => {
      // Save the current value with the saved cell reference
      if (currentValueToSave !== "") {
        saveCurrentValue(savedEditingCell, currentValueToSave);
      }

      // After a short delay, move to the next cell to prevent race conditions
      setTimeout(() => {
        // Only navigate if we have valid next values
        if (nextStudentId && nextField) {
          startEdit(nextStudentId, nextField, nextIndicator);
        }
      }, 50);
    });
  }; // Save current value and exit edit mode
  const saveCurrentValue = async (
    cellToSave = editingCell,
    valueToSave = currentValue
  ) => {
    if (!cellToSave || !classInfo) return;

    const { studentId, field, indicator } = cellToSave;

    // Find student to update
    const studentIndex = students.findIndex((s) => s.id === studentId);
    if (studentIndex === -1) {
      setEditingCell(null);
      return;
    }
    // Use the passed value or currentValue state
    const valueToUpdate = valueToSave || currentValue; // Validate input
    const isIndicator = Boolean(indicator);
    const isGrandTotal = field === "totalMarks";
    const validatedValue = validateMark(
      valueToUpdate,
      isIndicator,
      isGrandTotal
    );
    let updatedStudent = { ...students[studentIndex] };

    // Update student data based on what's being edited
    if (field.startsWith("Exp")) {
      const expName = field;

      if (indicator) {
        // Updating a specific indicator
        updatedStudent.experiments[expName][indicator] = validatedValue;

        // Recalculate experiment total
        const indicatorValues = classInfo!.indicators.map(
          (ind) => updatedStudent.experiments[expName][ind] || 0
        );
        const expTotal = Math.round(
          indicatorValues.reduce((sum, val) => sum + val, 0)
        );
        updatedStudent.experimentTotals[expName] = expTotal;
      } else {
        // Updating experiment total directly
        updatedStudent.experimentTotals[expName] = validatedValue;

        // Auto-distribute to indicators if needed
        if (validatedValue !== null) {
          updatedStudent = updateIndicatorsFromExperimentTotal(
            updatedStudent,
            expName,
            validatedValue
          );
        }
      }

      // Recalculate grand total based on experiment totals
      const experimentTotals = Object.values(
        updatedStudent.experimentTotals
      ).filter((val) => val !== null) as number[];
      const grandTotal =
        experimentTotals.length > 0
          ? experimentTotals.reduce((sum, val) => sum + val, 0) /
            experimentTotals.length
          : null;
      updatedStudent.totalMarks = grandTotal;
    } else if (field === "totalMarks") {
      // Updating grand total directly
      updatedStudent.totalMarks = validatedValue;

      // Auto-distribute to experiments and indicators
      if (validatedValue !== null) {
        updatedStudent = updateExperimentsFromGrandTotal(
          updatedStudent,
          validatedValue
        );
      }
    }

    // Update student in the local state
    const updatedStudents = [...students];
    updatedStudents[studentIndex] = updatedStudent;
    setStudents(updatedStudents);

    // Save to database
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch("/api/marks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          classId: classInfo.id,
          studentId,
          marks: {
            experiments: updatedStudent.experiments,
            experimentTotals: updatedStudent.experimentTotals,
            totalMarks: updatedStudent.totalMarks,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to save marks:", errorData);
        // toast.error("Failed to save marks to the database");
      }
    } catch (error) {
      console.error("Error saving marks:", error);
      // toast.error("Network error while saving marks");
    }

    // Exit edit mode
    setEditingCell(null);
  };

  const experimentColumns = Array.from(
    { length: numExperiments },
    (_, i) => `Exp${i + 1}`
  );

  // Render editable cell
  const renderEditableCell = (
    studentId: string,
    field: string,
    value: number | null,
    indicator?: string,
    isTotal: boolean = false
  ) => {
    const isEditing =
      editingCell?.studentId === studentId &&
      editingCell?.field === field &&
      editingCell?.indicator === indicator;

    // Special styling for different cell types
    const emptyCellStyle = "text-gray-500 italic";
    const cellBaseStyle =
      "px-2 sm:px-4 py-1.5 sm:py-3 text-center cursor-pointer text-xs sm:text-sm";
    const totalCellStyle = isTotal ? "bg-blue-900/20 font-bold" : "";
    const editingCellStyle = "p-0";

    // Set fixed widths by field type
    const cellWidth = field === "totalMarks" ? "60px sm:80px" : "60px sm:80px";
    const cellStyle = {
      width: "60px",
      minWidth: "60px",
      maxWidth: "60px",
      "@media (min-width: 640px)": {
        width: "80px",
        minWidth: "80px",
        maxWidth: "80px",
      },
    };

    // Format displayed value
    let displayValue = "—";
    if (value !== null) {
      if (field === "totalMarks") {
        displayValue = value.toFixed(2); // Show 2 decimal places for grand total
      } else {
        displayValue = Math.round(value).toString(); // Integer for indicators and experiment totals
      }
    }

    if (isEditing) {
      return (
        <td
          className={`${cellBaseStyle} ${editingCellStyle}`}
          style={cellStyle}
        >
          {" "}
          <Input
            ref={inputRef}
            type="text"
            value={currentValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            // Use onBlur without immediate redirect to prevent losing focus issues
            onBlur={() => setTimeout(() => saveCurrentValue(), 10)}
            className="h-7 sm:h-10 text-center bg-blue-900/20 border-blue-600 focus-visible:ring-blue-500 w-full rounded-none text-xs sm:text-sm"
            style={{
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              padding: "0.25rem 0.5rem",
            }}
          />
        </td>
      );
    }

    return (
      <td
        className={`${cellBaseStyle} ${
          value === null ? emptyCellStyle : ""
        } ${totalCellStyle}`}
        onClick={(e) => {
          e.stopPropagation();
          startEdit(studentId, field, indicator);
        }}
        style={cellStyle}
      >
        {displayValue}
      </td>
    );
  };

  // Render appropriate UI based on loading/error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-blue-300">Loading class data...</p>
        </div>
      </div>
    );
  }

  if (error || !classInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center max-w-md p-6 bg-gray-900 rounded-lg border border-red-900">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">
            Failed to Load Class
          </h2>
          <p className="text-gray-400 mb-4">{error || "Class not found"}</p>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="default"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen text-gray-100 p-2 sm:p-4 md:p-6 font-roboto">
      {/* Class Info Header */}
      <div className="mb-4 sm:mb-8">
        <div className="bg-gradient-to-r from-blue-900/30 to-gray-900 rounded-xl p-3 sm:p-6 mb-4 sm:mb-6 border border-blue-900/20 shadow-lg">
          <div className="flex flex-col justify-between items-start mb-4 sm:mb-6 gap-3">
            <div className="w-full flex justify-between items-start">
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {classInfo.courseName}
                    <span className="text-blue-400 ml-2">
                      ({classInfo.courseCode})
                    </span>
                  </h1>
                </div>
                <div className="text-gray-400 mt-2 flex flex-wrap items-center gap-2">
                  <span className="flex items-center">
                    <Badge className="bg-blue-900/40 mr-1 text-xs">
                      {classInfo.year}
                    </Badge>
                    <span className="text-sm">{classInfo.semester} Sem</span>
                  </span>
                  <span className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1 text-blue-400" />
                    <span className="text-sm">Batch {classInfo.batch}</span>
                  </span>
                  <span className="flex items-center">
                    <Badge className="bg-gray-800 text-xs">
                      {classInfo.academicYear}
                    </Badge>
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Share
                  classId={params.id}
                  students={students.map((s) => ({
                    id: s.id,
                    name: s.name,
                    rollNo: s.rollNo,
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Faculty & Department Info */}
            <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4 border border-gray-800/50">
              <div className="flex items-start">
                <div className="p-1.5 sm:p-2 rounded-full bg-blue-900/30 mr-2 sm:mr-3">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Faculty & Department
                  </h3>
                  <p className="text-xs sm:text-sm text-white font-medium">
                    {classInfo.facultyName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                    {classInfo.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Students Stats */}
            <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4 border border-gray-800/50">
              <div className="flex items-start">
                <div className="p-1.5 sm:p-2 rounded-full bg-blue-900/30 mr-2 sm:mr-3">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Course Information
                  </h3>
                  <div className="flex gap-3 sm:gap-4">
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-white">
                        {classInfo.students.length}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Students
                      </p>
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-white">
                        {numExperiments}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Experiments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4 border border-gray-800/50 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start">
                <div className="p-1.5 sm:p-2 rounded-full bg-blue-900/30 mr-2 sm:mr-3">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300" />
                </div>
                <div className="w-full">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center">
                    Performance Indicators
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400 ml-1 mt-0.5" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-800 border-gray-700 text-gray-200 max-w-sm text-xs">
                          <p>
                            Each indicator is scored out of 5 marks. Each
                            experiment has 5 indicators for a total of 25 marks.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {classInfo.indicators.map((indicator, index) => (
                      <Badge
                        key={index}
                        className="bg-blue-900/40 text-blue-300 hover:bg-blue-900/60 text-[10px] sm:text-xs py-0.5 sm:py-1"
                      >
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6 bg-gray-900/40 p-3 sm:p-4 rounded-lg border border-gray-800/50">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
            <Input
              placeholder="Search by name or roll number..."
              className="pl-8 sm:pl-10 py-1 h-8 sm:h-10 text-xs sm:text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-10 text-xs sm:text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-600">
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <SelectValue placeholder="Filter Students" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm">
                <SelectItem
                  value="all"
                  className="hover:bg-blue-900/50 hover:text-blue-300"
                >
                  All Students
                </SelectItem>
                <SelectItem
                  value="incomplete"
                  className="hover:bg-blue-900/50 hover:text-blue-300"
                >
                  Incomplete Grades
                </SelectItem>
                <SelectItem
                  value="complete"
                  className="hover:bg-blue-900/50 hover:text-blue-300"
                >
                  Completed Grades
                </SelectItem>
                <SelectItem
                  value="highest"
                  className="hover:bg-blue-900/50 hover:text-blue-300"
                >
                  Highest Marks
                </SelectItem>
                <SelectItem
                  value="lowest"
                  className="hover:bg-blue-900/50 hover:text-blue-300"
                >
                  Lowest Marks
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Container with Mobile Optimization */}
      <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-800">
        {/* Mobile Table View Instructions */}
        <div className="block sm:hidden bg-gray-900 p-2 border-b border-gray-800 text-center">
          <p className="text-[10px] text-gray-400 flex items-center justify-center">
            <AlertCircle className="h-3 w-3 mr-1 text-blue-400" />
            Swipe horizontally to view all experiments
          </p>
        </div>

        {/* Responsive Table */}
        <div
          className="w-full overflow-x-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="text-[10px] sm:text-xs text-gray-400 uppercase bg-gray-900 sticky top-0 z-10">
              <tr className="border-b border-gray-800">
                <th className="px-2 sm:px-4 py-2 sm:py-3 sticky left-0 bg-gray-900 min-w-[120px] sm:min-w-[200px]">
                  Name
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 sticky left-[120px] sm:left-[200px] bg-gray-900 min-w-[80px] sm:min-w-[120px]">
                  Roll No
                </th>
                {Array.from({ length: numExperiments }, (_, i) => (
                  <th
                    key={`Exp${i + 1}`}
                    className="px-3 sm:px-6 py-2 sm:py-3 text-center min-w-[60px] sm:min-w-[80px]"
                  >
                    Exp{i + 1}
                  </th>
                ))}
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-center bg-blue-900/20 min-w-[60px] sm:min-w-[80px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <React.Fragment key={student.id}>
                  {/* Main Row */}
                  <tr
                    className={`border-b border-gray-800 hover:bg-gray-800/50 ${
                      expandedStudent === student.id ? "bg-blue-900/5" : ""
                    }`}
                    onClick={() => toggleExpandStudent(student.id)}
                  >
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-white sticky left-0 bg-gray-950 hover:bg-gray-800/90 z-10 flex items-center text-xs sm:text-sm">
                      {expandedStudent === student.id ? (
                        <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      )}
                      <span className="truncate max-w-[80px] sm:max-w-[160px]">
                        {student.name}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 sticky left-[120px] sm:left-[200px] bg-gray-950 hover:bg-gray-800/90 z-10 text-xs">
                      {student.rollNo}
                    </td>

                    {/* Experiment Total Cells */}
                    {experimentColumns.map((exp) =>
                      renderEditableCell(
                        student.id,
                        exp,
                        student.experimentTotals[exp]
                      )
                    )}

                    {/* Grand Total Cell */}
                    {renderEditableCell(
                      student.id,
                      "totalMarks",
                      student.totalMarks,
                      undefined,
                      true
                    )}
                  </tr>

                  {/* Expanded Indicator Rows */}
                  {expandedStudent === student.id && (
                    <>
                      {classInfo.indicators.map((indicator) => (
                        <tr
                          key={`${student.id}-${indicator}`}
                          className="bg-gray-900/40 border-b border-gray-800/50 text-[10px] sm:text-xs"
                        >
                          <td className="pl-6 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 sticky left-0 bg-gray-900/40 z-10">
                            <span className="text-blue-300 truncate">
                              {indicator}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-1.5 sm:py-2 sticky left-[120px] sm:left-[200px] bg-gray-900/40 z-10"></td>

                          {/* Indicator Values for Each Experiment */}
                          {experimentColumns.map((exp) =>
                            renderEditableCell(
                              student.id,
                              exp,
                              student.experiments[exp][indicator],
                              indicator
                            )
                          )}

                          {/* Empty cell in Total column */}
                          <td className="px-3 sm:px-6 py-1.5 sm:py-2 text-center bg-blue-900/10"></td>
                        </tr>
                      ))}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Results Message */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-8 sm:py-16 bg-gray-900/20 rounded-lg mt-4">
          <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-gray-600 mx-auto mb-2 sm:mb-3" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-300">
            No Students Found
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassDetailPage;
