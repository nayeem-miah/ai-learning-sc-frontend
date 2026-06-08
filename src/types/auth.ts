export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role?: string;
  photo?: string | null;
};

export type AuthSuccessResponse = {
  success: boolean;
  message: string;
};

export type UserRegistrationBase = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gradeLevel?: string;
  role?: string;
  token?: string;
  subject?: string; // ← added
};

export type AcceptInviteRequest = {
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  subjectsType: string[];
};

export type UserResponse = {
  success: boolean;
  message?: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string | null;
    role: "ADMIN" | "TEACHER" | "STUDENT" | string;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    studentProfile?: {
      id?: string;
      userId?: string;
      gradeLevel?: string;
      photo?: string;
      currentLevel?: string;
      goals?: string;
      interests?: string[];
      learningPreferences?: string[];
      createdAt?: string;
      updatedAt?: string;
    };
  };
};

export type LoginRequest = {
  email: string;
  password: string;
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  profilePicture?: string;
  status?: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface LoginResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  data: {
    result: LoginResult;
  };
}

export type GuestSessionResponse = {
  success: boolean;
  message: string;
  data: {
    guestToken: string;
  };
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

export type ResetPasswordMutationArg = {
  userId?: string;
  password: string;
  token: string;
};

export type UpdateProfileRequest = {
  name: string;
  email: string;
};

export type UpdateProfileResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
  };
};

export type UploadProfilePictureResponse = {
  success: boolean;
  message: string;
  data: {
    photo: string;
  };
};

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResponse = {
  success: boolean;
  message: string;
};