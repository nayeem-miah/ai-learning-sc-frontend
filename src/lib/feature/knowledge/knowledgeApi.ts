import baseApi from "@/lib/api/baseApi";

export interface KnowledgeFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeFileUploadResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: KnowledgeFile;
}

export interface GetKnowledgeFilesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: KnowledgeFile[];
}

export const knowledgeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadKnowledgeFile: builder.mutation<KnowledgeFileUploadResponse, FormData>({
      query: (body) => ({
        url: "/knowledge-files",
        method: "POST",
        body,
      }),
      invalidatesTags: ["KnowledgeFile"],
    }),
    getKnowledgeFiles: builder.query<GetKnowledgeFilesResponse, void>({
      query: () => ({
        url: "/knowledge-files",
        method: "GET",
      }),
      providesTags: ["KnowledgeFile"],
    }),
    deleteKnowledgeFile: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/knowledge-files/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["KnowledgeFile"],
    }),
  }),
});

export const { 
  useUploadKnowledgeFileMutation, 
  useGetKnowledgeFilesQuery,
  useDeleteKnowledgeFileMutation 
} = knowledgeApi;
