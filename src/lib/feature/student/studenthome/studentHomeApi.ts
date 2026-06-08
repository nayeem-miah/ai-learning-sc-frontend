import baseApi from "@/lib/api/baseApi";
import {
  TGetStudentDashboardDataPayload,
  TGetStudentDashboardDataResponse,
} from "@/types/student/getStudentHome";

const studentHomeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentHomeData: builder.query<
      TGetStudentDashboardDataResponse,
      TGetStudentDashboardDataPayload
    >({
      query: () => ({
        url: "/dashboard/student/summery",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const { useGetStudentHomeDataQuery } = studentHomeApi;
