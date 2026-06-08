import baseApi from "@/lib/api/baseApi";
import {
  IGetStudentProgressPayload,
  IGetStudentProgressResponse,
} from "@/types/student/progress";

const progressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentProgress: builder.query<
      IGetStudentProgressResponse,
      IGetStudentProgressPayload
    >({
      query: () => ({
        url: "/dashboard/student/progress",
        method: "GET",
      }),
      providesTags: ["Progress"],
    }),
  }),
});

export const { useGetStudentProgressQuery } = progressApi;

// import baseApi from "@/lib/api/baseApi";
// import {
//   IGetStudentProgressPayload,
//   IGetStudentProgressResponse,
// } from "@/types/student/progress";

// const progressApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getStudentProgress: builder.query<
//       IGetStudentProgressResponse,
//       IGetStudentProgressPayload | void
//     >({
//       queryFn: async () => {
//         return {
//           data: {
//             statusCode: 200,
//             success: true,
//             message: "Student progress data fetched successfully",
//             data: {
//               overallMastery: 78,
//               modulesComplete: {
//                 completed: 3,
//                 total: 6,
//               },
//               timeSpent: {
//                 totalHoursThisWeek: 26,
//                 averagePerDay: 4,
//                 chartData: [
//                   { day: "Mon", hours: 4 },
//                   { day: "Tue", hours: 5 },
//                   { day: "Wed", hours: 1 },
//                   { day: "Thu", hours: 6 },
//                   { day: "Fri", hours: 5 },
//                   { day: "Sat", hours: 2 },
//                   { day: "Sun", hours: 3 },
//                 ],
//               },
//               masteryByCourse: [
//                 {
//                   courseName:
//                     "Exploring Bangla Language and Literature for Grade 10",
//                   mastery: 72,
//                   masteryRequired: 80,
//                 },
//                 {
//                   courseName:
//                     "Foundations of Python Programming for High School Students",
//                   mastery: 64,
//                   masteryRequired: 70,
//                 },
//                 {
//                   courseName: "Advanced Mathematics for Secondary Level",
//                   mastery: 86,
//                   masteryRequired: 75,
//                 },
//               ],
//               recentImprovements: [
//                 {
//                   courseName: "Mathematics",
//                   moduleName: "Module 1",
//                   quizName: "Quiz 2",
//                   improvement: 12,
//                   description: "Improved by 12% after 1st Re-test",
//                 },
//                 {
//                   courseName: "Mathematics",
//                   moduleName: "Module 2",
//                   quizName: "Quiz 1",
//                   improvement: 8,
//                   description: "Improved by 8% after 2nd Re-test",
//                 },
//                 {
//                   courseName: "Python Programming",
//                   moduleName: "Module 3",
//                   quizName: "Quiz 4",
//                   improvement: 15,
//                   description: "Improved by 15% after practice session",
//                 },
//               ],
//             },
//           },
//         };
//       },
//       providesTags: ["Progress"],
//     }),
//   }),
// });

// export const { useGetStudentProgressQuery } = progressApi;
