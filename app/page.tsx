"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FilePlus,
  Loader2,
  Plus,
  Users,
  School,
  Calendar,
  User,
  ClipboardList,
  BookOpenCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateClass from "@/components/CreateClass";
import { ClassInfo } from "../types/types";

const Dashboard = () => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [classes, setClasses] = useState<ClassInfo[]>([]); // Fetch classes dynamically
  const [hasClasses, setHasClasses] = React.useState(true); // Toggle to demonstrate empty state

  // Fetch classes from the backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch("/api/classes", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          throw new Error("Failed to fetch classes");
        }
        const data = await res.json();
        setClasses(data);
        setHasClasses(data.length > 0);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setHasClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleViewClass = (classId: string) => {
    router.push(`/class/${classId}`);
  };

  return (
    <div className="min-h-[calc(100vh-4.6rem)] bg-gray-950 text-gray-100 flex flex-col">
      <main className="flex-1 container mx-auto py-4 sm:py-8 px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-roboto text-blue-200">
            My Classes
          </h1>
          <Button
            onClick={() => setOpen(true)}
            className="bg-blue-700 hover:bg-blue-600 font-roboto flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus size={18} />
            Create Class
          </Button>
        </div>

        {/* Class Cards Grid or Empty State */}
        {hasClasses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {classes.map((classItem) => (
              <Card
                key={classItem.id}
                className="bg-gray-900 border-blue-900 hover:border-blue-700 transition-all duration-300 overflow-hidden group"
              >
                <div className="h-2 bg-blue-700 w-full"></div>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-roboto text-white group-hover:text-blue-300 transition-colors">
                        {classItem.courseName}
                      </CardTitle>
                      <CardDescription className="font-roboto text-gray-400">
                        {classItem.courseCode} • {classItem.batch}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-blue-900/40 text-blue-300 border-blue-800 font-roboto"
                    >
                      Sem {classItem.semester}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="flex justify-between text-sm font-roboto text-gray-300">
                    <div className="flex items-center gap-2">
                      <School size={16} className="text-gray-400" />
                      <span>{classItem.year}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{classItem.academicYear}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-roboto text-gray-300">
                    <User size={16} className="text-gray-400" />
                    <span>{classItem.facultyName}</span>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-medium font-roboto text-gray-300 mb-2">
                      Performance Indicators:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {classItem.indicators.map((indicator, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-gray-800 text-gray-300 border-gray-700 font-roboto text-xs"
                        >
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-800 pt-4">
                  <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-roboto">
                      <Users size={16} className="text-blue-400" />
                      <span className="text-gray-300">
                        {classItem.students} Students
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 font-roboto"
                      onClick={() => handleViewClass(String(classItem.id))}
                    >
                      View Class
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // Empty state when no classes are available
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-dashed border-gray-700 bg-gray-900/50">
            <div className="bg-blue-900/20 p-4 rounded-full mb-4">
              <BookOpenCheck size={48} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-200 font-roboto mb-2">
              No Classes Created Yet
            </h2>
            <p className="text-gray-400 font-roboto max-w-md mb-6">
              Create your first class by clicking the "Create Class" button
              above to get started.
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="bg-blue-700 hover:bg-blue-600 font-roboto flex items-center gap-2"
            >
              <Plus size={18} />
              Create Your First Class
            </Button>
          </div>
        )}

        {/* Create Class Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <CreateClass />
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;
