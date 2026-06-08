import baseApi from "@/lib/api/baseApi";
import {
  AuthSuccessResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  GuestSessionResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordMutationArg,
  ResetPasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UploadProfilePictureResponse,
  UserRegistrationBase,
  UserResponse,
  AcceptInviteRequest,
} from "@/types/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<UserResponse, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    signIn: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    signUp: builder.mutation<AuthSuccessResponse, UserRegistrationBase>({
      query: (body) => ({
        url: "/users/student",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    createGuestSession: builder.mutation<GuestSessionResponse, void>({
      query: () => ({
        url: "/users/guest-session",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    verifyEmail: builder.mutation<
      AuthSuccessResponse,
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),

    resendCode: builder.mutation<AuthSuccessResponse, { email: string }>({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),

    forgetPassword: builder.mutation<AuthSuccessResponse, { email: string }>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<AuthSuccessResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordMutationArg
    >({
      query: ({ password, token }) => ({
        url: `/auth/reset-password?${token}`,
        method: "POST",
        body: {
          password: password,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

    // Update Profile (Name/Email)
    updateProfile: builder.mutation<
      UpdateProfileResponse,
      UpdateProfileRequest
    >({
      query: (body) => ({
        url: "/users/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // Update User Profile Info (Generic)
    updateUserProfile: builder.mutation<UserResponse, any>({
      query: (body) => ({
        url: "/users/update-profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // Upload Profile Picture
    uploadProfilePicture: builder.mutation<
      UploadProfilePictureResponse,
      FormData
    >({
      query: (formData) => ({
        url: "/users/profile/picture",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    // Change Password
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "PUT",
        body,
      }),
    }),
    
    acceptInvite: builder.mutation<AuthSuccessResponse, AcceptInviteRequest>({
      query: (body) => ({
        url: "/invite/accept",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),



  }),
  overrideExisting: true,
});

export const {
  useGetMeQuery,
  useSignInMutation,
  useSignUpMutation,
  useCreateGuestSessionMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendCodeMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useUpdateUserProfileMutation,
  useUploadProfilePictureMutation,
  useAcceptInviteMutation,
} = authApi;
