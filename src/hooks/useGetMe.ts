import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useRouter, usePathname } from "next/navigation";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { setCredentials } from "@/lib/slice/user/userSlice";
import { UserProfile } from "@/types/auth";

export const useGetMe = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const router = useRouter();
  // const pathname = usePathname();
  const { user, accessToken } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  const decodeJwt = (token: string): UserProfile | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.id ?? payload.guestId ?? "",
        email: payload.email ?? "guest@example.com",
        role: payload.role ?? "GUEST",
        name: payload.name ?? payload.email?.split("@")[0] ?? "Guest",
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (user && accessToken) {
      setIsLoading(false);
      return;
    }

    const localToken = localStorage.getItem("accessToken");
    if (localToken) {
      const decoded = decodeJwt(localToken);
      if (decoded) {
        dispatch(setCredentials({ user: decoded, accessToken: localToken }));
        setIsLoading(false);
        return;
      } else {
        localStorage.removeItem("accessToken");
      }
    }

    setIsLoading(false);
  }, [user, accessToken, dispatch]);

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!accessToken,
  };
};
