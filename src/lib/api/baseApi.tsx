import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", token);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery,
  tagTypes: [
    "User",
    "Plan",
    "Payment",
    "Story",
    "Analytis",
    "Course",
    "Team",
    "Class",
    "Progress",
    "KnowledgeFile",
  ],
  endpoints: () => ({}),
});

export default baseApi;
