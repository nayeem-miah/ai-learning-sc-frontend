"use client";

import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Award, Plus, X, Edit3, Save, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useGetClassesQuery, useCreateClassMutation, useDeleteClassMutation } from '@/lib/feature/courses/coursesApi';
import { toast } from 'sonner';

// Dummy data for classes
const initialClasses = [
  { id: 1, level: "Grade 9", studentCount: 28 },
  { id: 2, level: "Grade 10", studentCount: 28 },
  { id: 3, level: "Grade 11", studentCount: 28 },
  { id: 4, level: "Grade 12", studentCount: 28 }
];

// Dummy data for grading system
const initialGradingSystem = [
  { id: 1, grade: "A+", range: "97-100", color: "#22C55E" },
  { id: 2, grade: "A", range: "93-96", color: "#22C55E" },
  { id: 3, grade: "A-", range: "90-92", color: "#22C55E" },
  { id: 4, grade: "B+", range: "87-89", color: "#3B82F6" },
  { id: 5, grade: "B", range: "83-86", color: "#3B82F6" },
  { id: 6, grade: "B-", range: "80-82", color: "#3B82F6" },
  { id: 7, grade: "C+", range: "77-79", color: "#D4AF37" },
  { id: 8, grade: "C", range: "73-76", color: "#D4AF37" },
  { id: 9, grade: "C-", range: "70-72", color: "#D4AF37" },
  { id: 10, grade: "D+", range: "67-69", color: "#F97316" },
  { id: 11, grade: "D", range: "63-66", color: "#F97316" },
  { id: 12, grade: "D-", range: "60-62", color: "#F97316" },
  { id: 13, grade: "F (Fail)", range: "59 and below", color: "#EF4444" }
];

export default function ManageClassesPage() {
  const { data: classesData, isLoading: isClassesLoading } = useGetClassesQuery();
  const [createClass, { isLoading: isCreatingClass }] = useCreateClassMutation();
  const [deleteClass, { isLoading: isDeletingClass }] = useDeleteClassMutation();
  
  const [gradingSystem, setGradingSystem] = useState(initialGradingSystem);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassLevel, setNewClassLevel] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedGradingSystem, setEditedGradingSystem] = useState(initialGradingSystem);
  const [mounted, setMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  const classes = classesData?.data || [];

  useEffect(() => {
    setMounted(true);
    setGradingSystem(initialGradingSystem);
  }, []);

  const handleAddClass = async () => {
    let formattedLevel = newClassLevel.trim();
    if (formattedLevel !== "") {
      // If it's just a number, prefix with "Grade "
      if (/^\d+$/.test(formattedLevel)) {
        formattedLevel = `Grade ${formattedLevel}`;
      } else {
        // Capitalize "grade" if present, or capitalize first letter
        if (formattedLevel.toLowerCase().startsWith("grade ")) {
          formattedLevel = "Grade " + formattedLevel.slice(6).trim();
        } else {
          formattedLevel = formattedLevel.charAt(0).toUpperCase() + formattedLevel.slice(1);
        }
      }

      try {
        await createClass({ gradeLevel: formattedLevel }).unwrap();
        toast.success("Class created successfully");
        setNewClassLevel("");
        setIsAddClassModalOpen(false);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to create class");
      }
    }
  };

  const handleDeleteClick = (id: string) => {
    setClassToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (classToDelete) {
      try {
        await deleteClass(classToDelete).unwrap();
        toast.success("Class removed successfully");
        setDeleteModalOpen(false);
        setClassToDelete(null);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to remove class");
      }
    }
  };


  const toggleEditing = () => {
    if (isEditing) {
      setGradingSystem([...editedGradingSystem]);
      setIsEditing(false);
    } else {
      setEditedGradingSystem([...gradingSystem]);
      setIsEditing(true);
    }
  };

  const handleGradeChange = (id: number, field: 'grade' | 'range', value: string) => {
    setEditedGradingSystem(
      editedGradingSystem.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const totalStudents = classes.reduce((sum, c) => sum + (c.studentsCount || 0), 0);

  return (
    <div className={`min-h-screen text-white transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <header className="bg-[#121212] border border-gray-800 rounded-xl py-6 px-6 mb-8 hover:border-gray-700 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#D4AF37]">Manage Classes & Grades</h1>
              <p className="text-gray-400 text-sm mt-0.5">Configure classes and grading system</p>
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-8">
        {/* All Classes Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-lg font-bold text-white">All Classes</h2>
              <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded-full ml-1">
                {isClassesLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : classes.length}
              </span>
            </div>
            <button
              onClick={() => setIsAddClassModalOpen(true)}
              className="bg-[#D4AF37] text-black font-medium px-4 py-2 rounded-lg hover:bg-[#c4a02f] transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-[#D4AF37]/20 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          </div>

          <div className="space-y-3">
            {isClassesLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#D4AF37]" />
                <p>Loading classes...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                <Users className="w-8 h-8 mb-4 opacity-20" />
                <p>No classes found. Add your first class!</p>
              </div>
            ) : (
              classes.map((cls, idx) => (
                <div
                  key={cls.id}
                  className="bg-[#121212] border rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-700 border-gray-800"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* <button
                        onClick={() => toggleClassSelection(cls.id)}
                        className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-200 ${selectedClasses.includes(cls.id)
                          ? "bg-[#D4AF37] border-[#D4AF37]"
                          : "border-gray-600 hover:border-gray-400"
                          }`}
                      >
                        {selectedClasses.includes(cls.id) && (
                          <svg className="w-3 h-3 text-black" viewBox="0 0 12 12"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                        )}
                      </button> */}
                      <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                        <span className="text-[#D4AF37] text-sm font-bold">{cls.gradeLevel.replace("Grade ", "G")}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{cls.gradeLevel}</h3>
                        <p className="text-gray-400 text-sm">{cls.studentsCount || 0} students</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteClick(cls.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Grading System Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-lg font-bold text-white">Grading System</h2>
            </div>
            <button
              onClick={toggleEditing}
              className={`font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2 active:scale-[0.98] ${isEditing
                ? 'bg-[#D4AF37] text-black hover:bg-[#c4a02f] hover:shadow-lg hover:shadow-[#D4AF37]/20'
                : 'bg-[#1a1a1a] border border-gray-800 text-[#D4AF37] hover:bg-[#222] hover:border-gray-700'
                }`}
            >
              {isEditing ? (
                <><Save className="w-4 h-4" /> Save Changes</>
              ) : (
                <><Edit3 className="w-4 h-4" /> Edit Grades</>
              )}
            </button>
          </div>

          <div className="bg-[#121212] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-800 bg-[#0f0f0f]">
              <div className="font-medium text-[#D4AF37] text-xs uppercase tracking-wider">Grade</div>
              <div className="font-medium text-[#D4AF37] text-xs uppercase tracking-wider">Range</div>
              <div className="font-medium text-[#D4AF37] text-xs uppercase tracking-wider">Visual</div>
              <div className="font-medium text-[#D4AF37] text-xs uppercase tracking-wider">Status</div>
            </div>

            <div className="divide-y divide-gray-800/50">
              {(isEditing ? editedGradingSystem : gradingSystem).map((grade, idx) => (
                <div
                  key={grade.id}
                  className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-[#1a1a1a] transition-colors"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={grade.grade}
                      onChange={(e) => handleGradeChange(grade.id, 'grade', e.target.value)}
                      className="bg-[#222] border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: grade.color }} />
                      <span className="font-bold text-white">{grade.grade}</span>
                    </div>
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      value={grade.range}
                      onChange={(e) => handleGradeChange(grade.id, 'range', e.target.value)}
                      className="bg-[#222] border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                    />
                  ) : (
                    <div className="text-gray-300 text-sm">{grade.range}</div>
                  )}

                  {/* Visual bar */}
                  <div>
                    <div className="h-1.5 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          backgroundColor: grade.color,
                          width: `${Math.max(10, (14 - grade.id) / 13 * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <span
                      className="text-[10px] font-medium px-2 py-1 rounded-full border"
                      style={{
                        color: grade.color,
                        borderColor: `${grade.color}30`,
                        backgroundColor: `${grade.color}10`
                      }}
                    >
                      {grade.id <= 3 ? "Excellent" : grade.id <= 6 ? "Good" : grade.id <= 9 ? "Average" : grade.id <= 12 ? "Below Avg" : "Failing"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Add New Class Modal */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#D4AF37]/10 rounded-lg">
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Add New Class</h3>
                </div>
                <button onClick={() => setIsAddClassModalOpen(false)} className="p-2 hover:bg-[#222] rounded-lg transition-colors text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Class Level</label>
                <input
                  type="text"
                  value={newClassLevel}
                  onChange={(e) => setNewClassLevel(e.target.value)}
                  placeholder="e.g., Grade 9"
                  className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-[#222] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClass}
                  disabled={newClassLevel.trim() === "" || isCreatingClass}
                  className="px-5 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#c4a02f] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium hover:shadow-lg hover:shadow-[#D4AF37]/20 flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {isCreatingClass ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Class"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        variant="delete"
        title="Remove Class"
        description="Are you sure you want to remove this class? This will disconnect all students currently assigned to this level."
      />
    </div>
  );
}