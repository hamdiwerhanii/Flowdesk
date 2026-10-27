import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/api/api.client";
import { authApi } from "@/api/auth.api";
import { useRouter } from "@/navigation";

import type {
  ForgotPasswordValues,
  LoginValues,
  RegisterOrganizationValues,
  RegisterValues
} from "../schemas/authSchemas";
import useAuthStore from "../store/authStore";
import type { AuthUser } from "../types/auth.types";

type Message = { message: string };

/** After login, "/" lets the proxy pick the right organization and role. */
function useEnterApp() {
  const setUser = useAuthStore(s => s.setUser);
  const router = useRouter();
  return (user: AuthUser) => {
    setUser(user);
    router.replace("/");
  };
}

export function useLogin() {
  const enterApp = useEnterApp();
  return useMutation<AuthUser, ApiError, LoginValues>({
    mutationFn: authApi.login,
    onSuccess: enterApp
  });
}

export function useRegisterOrganization() {
  const enterApp = useEnterApp();
  return useMutation<AuthUser, ApiError, RegisterOrganizationValues>({
    mutationFn: authApi.registerOrganization,
    onSuccess: enterApp
  });
}

export function useRegister() {
  return useMutation<Message, ApiError, RegisterValues>({
    mutationFn: authApi.register
  });
}

export function useForgotPassword() {
  return useMutation<Message, ApiError, ForgotPasswordValues>({
    mutationFn: authApi.forgotPassword
  });
}

export function useResetPassword() {
  return useMutation<Message, ApiError, { token: string; password: string }>({
    mutationFn: authApi.resetPassword
  });
}
