import baseApi from "@/lib/api/baseApi";

export interface CourseSetupPayload {
  course_name: string;
  subject: string;
  target_grade_level: string;
  course_length: string;
  semester_count: number;
  diagnostic_test_before_course: boolean;
  retesting_allowed: boolean;
  retesting_count: number;
  quizzes_per_module: number;
  midterm_examination: boolean;
  final_examination: boolean;
  total_quiz_questions: number;
  mastery_requirement: number;
  total_modules: number;
  estimated_duration_min_per_class: number;
  knowledge_bases?: string[];
  user_instration?: string;
}

export interface QuizQuestion {
  id: string;
  questionId: string;
  originalQuestionId: string;
  uniqueSessionId: string;
  moduleId: string;
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  createdAt: string;
}

export interface VoiceData {
  voice_id: string;
  generated_at: string;
  audio_url: string;
  duration_seconds: number;
  status: string;
}

export interface StudyTopic {
  topic_name: string;
  topic_wise_study_data: {
    summary: string;
    detailed_explanation: string;
  };
}

export interface Module {
  id: string;
  uniqueSessionId: string;
  moduleNumber: number;
  moduleTitle: string;
  introduction: string;
  studyTopics: StudyTopic[];
  voiceData: VoiceData;
  quizQuestions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
  isCompleted?: boolean;
  quizScore?: number;
  lessonProgresses?: any[];
}

export interface Course {
  id: string;
  uniqueSessionId: string;
  uniqueUserId: string;
  courseName: string;
  generatedCourseName: string;
  description: string | null;
  subject: string;
  targetGradeLevel: string;
  courseLength: string;
  courseType: string | null;
  isPublished: boolean;
  startDate: string | null;
  startTime: string | null;
  endTime: string | null;
  semesterCount: number;
  diagnosticTestBeforeCourse: boolean;
  retestingAllowed: boolean;
  retestingCount: number;
  quizzesPerModule: number;
  midtermExamination: boolean;
  finalExamination: boolean;
  totalQuizQuestions: number;
  masteryRequirement: number;
  totalModules: number;
  estimatedDurationMinPerClass: number;
  createdAt: string;
  updatedAt: string;
  teacherId: string | null;
  hasMidterm: boolean;
  hasFinal: boolean;
  classId: string;
  user: {
    userId: string;
    isActive: boolean;
  };
  class: {
    id: string;
    gradeLevel: string;
    status: string;
    totalStudents: number;
    createdAt: string;
    updatedAt: string;
  };
  modules: Module[];
  quizzes: QuizQuestion[];
}

export interface GetCoursesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Course[];
}

export interface GetDashboardResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalStudents: number;
    recentCourses: Course[];
  };
}

export interface StudentManagementData {
  summary: {
    totalStudents: number;
    engaged: number;
    noActivity: number;
    attendanceRate: number;
  };
  students: {
    id: string;
    name: string;
    studentId: string;
    class: string;
    mastery: number;
    profilePicture: string;
  }[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface GetStudentManagementResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: StudentManagementData;
}

export interface SingleStudentManagementData {
  studentInfo: {
    id: string;
    name: string;
    studentId: string;
    grade: string;
    profilePicture: string;
  };
  summaryStats: {
    enrolledCourses: number;
    avgProgress: number;
    avgMastery: number;
    attendanceRate: number;
  };
  enrolledCourses: {
    id: string;
    courseName: string;
    progress: number;
    mastery: number;
    modulesCompleted: number;
    modulesTotal: number;
    lessonsCompleted: number;
    lessonsTotal: number;
    modules: {
      id: string;
      moduleNumber: number;
      moduleTitle: string;
      isCompleted: boolean;
      quizScore: number;
      totalLessons: number;
      quizHistory: {
        questionId: string;
        questionText: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        selectedAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
      }[];
      teacherFeedback: string;
    }[];
  }[];
}

export interface GetSingleStudentManagementResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: SingleStudentManagementData;
}

export interface ClassData {
  id: string;
  gradeLevel: string;
  studentsCount: number;
  createdAt: string;
}

export interface GetClassesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ClassData[];
}

export interface SingleStudentManagementData {
  studentInfo: {
    id: string;
    name: string;
    studentId: string;
    grade: string;
    profilePicture: string;
  };
  summaryStats: {
    enrolledCourses: number;
    avgProgress: number;
    avgMastery: number;
    attendanceRate: number;
  };
  enrolledCourses: {
    id: string;
    courseName: string;
    progress: number;
    mastery: number;
    modulesCompleted: number;
    modulesTotal: number;
    lessonsCompleted: number;
    lessonsTotal: number;
    modules: {
      id: string;
      moduleNumber: number;
      moduleTitle: string;
      isCompleted: boolean;
      quizScore: number;
      totalLessons: number;
      quizHistory: {
        questionId: string;
        questionText: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        selectedAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
      }[];
      teacherFeedback: string;
    }[];
  }[];
}

export interface GetSingleStudentManagementResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: SingleStudentManagementData;
}


export interface GetCourseResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Course;
}

export interface UpdateCoursePayload {
  id: string;
  courseName?: string;
  subject?: string;
  description?: string;
  isPublished?: boolean;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  teacherId?: string;
}

export interface TeacherCourseDetails extends Course {
  enrollments: { studentId: string }[];
  overallProgress: number;
  overallMastery: number;
  stats: {
    masteryRequirement: number;
    averageMastery: number;
    totalStudents: number;
    modulesTotal: number;
    lessonsTotal: number;
    assessmentsTotal: number;
    courseLength: string;
  };
}

export interface GetTeacherCourseDetailsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: TeacherCourseDetails;
}

export interface StudentCourseDetails extends Course {
  overallProgress: number;
  overallMastery: number;
  stats: {
    masteryRequirement: number;
    averageMastery: number;
    modulesTotal: number;
    modulesCompleted: number;
    lessonsTotal: number;
    lessonsCompleted: number;
    assessmentsTotal: number;
    assessmentsCompleted: number;
    courseLength: string;
  };
  nextModule: any | null;
}

export interface GetStudentCourseDetailsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: StudentCourseDetails;
}

export interface TeacherDashboardSummary {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  recentCourses: Course[];
  nextClass?: {
    courseId: string;
    courseName: string;
    subject: string;
    moduleId: string;
    moduleTitle: string;
    moduleNumber: number;
    startTime: string;
    endTime: string;
    absoluteStart: string;
    type: string;
  };
  nextClasses?: Course[];
}

export interface GetTeacherDashboardSummaryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: TeacherDashboardSummary;
}

export interface AddFeedbackPayload {
  studentId: string;
  courseId: string;
  moduleId: string;
  content: string;
}


export const coursesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllCourses: builder.query<GetCoursesResponse, void>({
      query: () => ({
        url: "/course/all",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    getCourseById: builder.query<GetCourseResponse, string>({
      query: (id) => ({
        url: `/course/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
    setupCourse: builder.mutation<any, CourseSetupPayload>({
      query: (body) => ({
        url: "/course/setup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Course"],
    }),
    updateCourse: builder.mutation<GetCourseResponse, UpdateCoursePayload>({
      query: ({ id, ...body }) => ({
        url: `/course/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Course",
        { type: "Course", id },
      ],
    }),
    deleteCourse: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/course/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Optimistic update for getAllCourses
        const patchResult = dispatch(
          coursesApi.util.updateQueryData(
            "getAllCourses",
            undefined,
            (draft) => {
              if (draft?.data) {
                draft.data = draft.data.filter((course) => course.id !== id);
              }
            },
          ),
        );

        // Optimistic update for getDashboardStats
        const dashPatchResult = dispatch(
          coursesApi.util.updateQueryData(
            "getDashboardStats",
            undefined,
            (draft) => {
              if (draft?.data) {
                // Find the course to see if it was published or draft
                const deletedCourse = draft.data.recentCourses?.find(
                  (c) => c.id === id,
                );

                // Decrement total count
                draft.data.totalCourses = Math.max(
                  0,
                  draft.data.totalCourses - 1,
                );

                if (deletedCourse) {
                  if (deletedCourse.isPublished) {
                    draft.data.publishedCourses = Math.max(
                      0,
                      draft.data.publishedCourses - 1,
                    );
                  } else {
                    draft.data.draftCourses = Math.max(
                      0,
                      draft.data.draftCourses - 1,
                    );
                  }
                }

                // Remove from recent courses
                draft.data.recentCourses = draft.data.recentCourses?.filter(
                  (course) => course.id !== id,
                );
              }
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          dashPatchResult.undo();
        }
      },
      invalidatesTags: ["Course"],
    }),
    getTeachers: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => ({
        url: "/users/teachers",
        method: "GET",
      }),
    }),
    removeTeacher: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/course/remove-teacher/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        "Course",
        { type: "Course", id },
      ],
    }),
    getDashboardStats: builder.query<GetDashboardResponse, void>({
      query: () => ({
        url: "/dashboard",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    getStudentManagement: builder.query<
      GetStudentManagementResponse,
      {
        page?: number;
        limit?: number;
        searchTerm?: string;
        sortBy?: string;
        sortOrder?: string;
        classId?: string;
        courseId?: string;
      }
    >({
      query: (params) => ({
        url: "/users/student-management",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),
    getSingleStudentManagement: builder.query<
      GetSingleStudentManagementResponse,
      string
    >({
      query: (id) => ({
        url: `/users/student-management/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    getStudentPublishedCourses: builder.query<GetCoursesResponse, void>({
      query: () => ({
        url: "/course/student/my-published-courses",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    getTeacherPublishedCourses: builder.query<GetCoursesResponse, void>({
      query: () => ({
        url: "/course/teacher/my-published-courses",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    getTeacherCourseDetails: builder.query<
      GetTeacherCourseDetailsResponse,
      string
    >({
      query: (id) => ({
        url: `/course/teacher/course-details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
    getStudentCourseDetails: builder.query<
      GetStudentCourseDetailsResponse,
      string
    >({
      query: (id) => ({
        url: `/course/student/course-details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
    getTeacherDashboardSummary: builder.query<
      GetTeacherDashboardSummaryResponse,
      void
    >({
      query: () => ({
        url: "/dashboard/teacher/summery",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    addFeedback: builder.mutation<
      { success: boolean; message: string; data: any },
      AddFeedbackPayload
    >({
      query: (body) => ({
        url: "/feedbacks",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: "User", id: studentId },
      ],
    }),
    completeLesson: builder.mutation<
      { success: boolean; message: string; data: any },
      { lessonId: string }
    >({
      query: (body) => ({
        url: "/course/student/complete-lesson",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Class"],
    }),
    submitQuiz: builder.mutation<
      { success: boolean; message: string; data: any },
      {
        unique_user_id: string;
        unique_session_id: string;
        module_id: string;
        answers: {
          question_id: string;
          selected_answer: string;
        }[];
      }
    >({
      query: (body) => ({
        url: "/quiz/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Course"],
    }),
    getClasses: builder.query<GetClassesResponse, void>({
      query: () => ({
        url: "/class",
        method: "GET",
      }),
      providesTags: ["Class"],
    }),
    createClass: builder.mutation<any, { gradeLevel: string }>({
      query: (body) => ({
        url: "/class",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Class"],
    }),
    deleteClass: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/class/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Class"],
    }),
  }),
});

export const {
  useGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useLazyGetCourseByIdQuery,
  useUpdateCourseMutation,
  useSetupCourseMutation,
  useDeleteCourseMutation,
  useGetTeachersQuery,
  useRemoveTeacherMutation,
  useGetTeacherPublishedCoursesQuery,
  useGetStudentPublishedCoursesQuery,
  useGetTeacherCourseDetailsQuery,
  useGetStudentCourseDetailsQuery,
  useGetTeacherDashboardSummaryQuery,
  useGetDashboardStatsQuery,
  useGetStudentManagementQuery,
  useGetSingleStudentManagementQuery,
  useGetClassesQuery,
  useCreateClassMutation,
  useDeleteClassMutation,
  useAddFeedbackMutation,
  useCompleteLessonMutation,
  useSubmitQuizMutation,
} = coursesApi;
