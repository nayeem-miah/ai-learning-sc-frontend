import baseApi from "@/lib/api/baseApi";

export interface AttendanceRecord {
    date: string;
    status: string;
    courseName: string;
}

export interface AttendanceSummary {
    present: number;
    late: number;
    absent: number;
    total: number;
    attendanceRate: number;
}

export interface StudentAttendanceData {
    summary: AttendanceSummary;
    calendar: AttendanceRecord[];
}

export interface GetStudentAttendanceResponse {
    message: string;
    data: StudentAttendanceData;
}

export interface JoinedStudent {
    id: string;
    attendanceId: string;
    studentId: string;
    joinTime: string;
    status: string;
    student: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        profilePicture: string | null;
    };
}

export interface GetJoinedStudentsResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data: JoinedStudent[];
}

export const attendanceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStudentAttendance: builder.query<GetStudentAttendanceResponse, string | void>({
            query: (courseId) => ({
                url: courseId ? `/attendance/student/all?courseId=${courseId}` : "/attendance/student/all",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        joinAttendance: builder.mutation<{ success: boolean; message: string; data: any }, { courseId: string; moduleId: string }>({
            query: (body) => ({
                url: "/attendance/join",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),
        startAttendance: builder.mutation<{ success: boolean; message: string; data: any }, { courseId: string; moduleId: string }>({
            query: (body) => ({
                url: "/attendance/start",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),
        getJoinedStudents: builder.query<GetJoinedStudentsResponse, string>({
            query: (attendanceId) => ({
                url: `/attendance/joined-students/${attendanceId}`,
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        markJoinedPresent: builder.mutation<{ success: boolean; message: string; data: any }, string>({
            query: (attendanceId) => ({
                url: `/attendance/mark-joined-present/${attendanceId}`,
                method: "PATCH",
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const { 
    useGetStudentAttendanceQuery,
    useJoinAttendanceMutation,
    useStartAttendanceMutation,
    useGetJoinedStudentsQuery,
    useMarkJoinedPresentMutation,
} = attendanceApi;
