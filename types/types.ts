export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
};

export interface ClassInfo {
  id: number;
  courseName: string;
  courseCode: string;
  year: string;
  semester: string;
  batch: string;
  department: string;
  academicYear: string;
  facultyName: string;
  indicators: string[];
  students: number;
}

export interface PerformanceIndicator {
  id: number;
  name: string;
  description: string;
}

export interface Student {
  id: number;
  name: string;
  sapId: string;
  rollNumber: string;
}

export interface Mark {
  indicatorId: string; // e.g., "indicator-1"
  value: number | null; // null for empty fields
}

export interface Experiment {
  id: number;
  name: string; // e.g., "Experiment 1"
  marks: Mark[]; // Marks for each performance indicator
  total: number | null; // Experiment total (sum of marks)
}

export interface StudentMarks {
  studentId: number;
  experiments: Experiment[];
  grandTotal: number | null; // Average of experiment totals
}
