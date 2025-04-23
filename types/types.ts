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
