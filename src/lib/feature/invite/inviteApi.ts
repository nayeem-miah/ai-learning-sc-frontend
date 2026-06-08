import baseApi from "@/lib/api/baseApi";

export const inviteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendInvite: builder.mutation<any, { email: string; isAdmin: boolean }>({
      query: (body) => ({
        url: "/invite/send",
        method: "POST",
        body,
      }),
    }),
    getTeamMembers: builder.query<any, void>({
      query: () => ({
        url: "/users/admin-teacher-list",
        method: "GET",
      }),
      providesTags: ["Team"],
    }),
    removeTeamMember: builder.mutation<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Team"],
    }),
    updateUserRole: builder.mutation<any, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Team"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useSendInviteMutation,
  useGetTeamMembersQuery,
  useRemoveTeamMemberMutation,
  useUpdateUserRoleMutation,
} = inviteApi;
