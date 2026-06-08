import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "@/types/auth";
import Cookies from "js-cookie";

interface UserState {
    user: UserProfile | null;
    accessToken: string | null;
    refreshToken: string | null;
}

const initialState: UserState = {
    user: null,
    accessToken: typeof window !== "undefined" ? localStorage.getItem("accessToken") : null,
    refreshToken: typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                user: UserProfile;
                accessToken: string;
                refreshToken?: string;
            }>
        ) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken ?? null;

            if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", action.payload.accessToken);
                Cookies.set("token", action.payload.accessToken, { expires: 7, path: '/' });
                if (action.payload.refreshToken) {
                    localStorage.setItem("refreshToken", action.payload.refreshToken);
                }
            }
        },

        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;

            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user_role");
                Cookies.remove("token", { path: '/' });
                Cookies.remove("user_role", { path: '/' });
            }
        },
    },
});

export const { setCredentials, logout } = userSlice.actions;
export default userSlice.reducer;
