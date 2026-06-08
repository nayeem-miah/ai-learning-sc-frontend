import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const AI_BASE_URL = process.env.NEXT_PUBLIC_AUDIO_BASE_URL || "http://204.197.173.4:8003/api/v1";

export interface CourseAssistantPayload {
  id: string;
  question: string;
  thread_id?: string;
}

export interface CourseAssistantResponse {
  success: boolean;
  message: string;
  data: {
    thread_id: string;
    answer: string;
    is_new_thread: boolean;
  };
}

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AI_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", token);
      }
      return headers;
    },
  }),
  tagTypes: ["Assistant"],
  endpoints: (builder) => ({
    courseAssistantChat: builder.mutation<CourseAssistantResponse, CourseAssistantPayload>({
      query: (body) => ({
        url: "/course-assistant/chat",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCourseAssistantChatMutation } = aiApi;
export default aiApi;
