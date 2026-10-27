"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import useAuthStore from "@/modules/auth/store/authStore";
import { useRouter } from "@/navigation";
import Field from "@/shared/components/Field";
import PageHeader from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { useOrgContext } from "@/shared/hooks/useOrgContext";

import { useChangePassword, useUpdateProfile } from "../hooks/useSettings";
import {
  passwordSchema,
  type PasswordValues,
  profileSchema,
  type ProfileValues
} from "../schemas/settingsSchemas";

export default function ProfileSettings() {
  const t = useTranslations();
  const { user } = useOrgContext();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const logout = useAuthStore(s => s.logout);
  const queryClient = useQueryClient();
  const router = useRouter();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name }
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
  });

  const onPasswordSubmit = passwordForm.handleSubmit(
    ({ currentPassword, newPassword }) =>
      changePassword.mutate(
        { currentPassword, newPassword },
        {
          onSuccess: async () => {
            toast.success(t("toasts.passwordChanged"));
            await logout();
            queryClient.clear();
            router.replace("/login");
          }
        }
      )
  );

  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <PageHeader title={t("settings.profileTitle")} description={user.email} />

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.nameTitle")}</CardTitle>
          <CardDescription>{t("settings.nameDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            onSubmit={profileForm.handleSubmit(values =>
              updateProfile.mutate(values)
            )}
            className='flex flex-wrap items-start gap-3'
          >
            <div className='min-w-60 flex-1'>
              <Field
                label={t("settings.fullName")}
                htmlFor='profile-name'
                error={profileForm.formState.errors.name?.message}
              >
                <Input id='profile-name' {...profileForm.register("name")} />
              </Field>
            </div>
            <Button
              type='submit'
              className='mt-7'
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending && <Spinner className='text-current' />}
              {t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.passwordTitle")}</CardTitle>
          <CardDescription>{t("settings.passwordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={onPasswordSubmit} className='space-y-4'>
            <Field
              label={t("settings.currentPassword")}
              htmlFor='current-password'
              error={
                passwordForm.formState.errors.currentPassword?.message ??
                changePassword.error?.message
              }
            >
              <Input
                id='current-password'
                type='password'
                autoComplete='current-password'
                {...passwordForm.register("currentPassword")}
              />
            </Field>
            <div className='grid gap-4 sm:grid-cols-2'>
              <Field
                label={t("settings.newPassword")}
                htmlFor='new-password'
                error={passwordForm.formState.errors.newPassword?.message}
              >
                <Input
                  id='new-password'
                  type='password'
                  autoComplete='new-password'
                  {...passwordForm.register("newPassword")}
                />
              </Field>
              <Field
                label={t("settings.confirmPassword")}
                htmlFor='confirm-password'
                error={passwordForm.formState.errors.confirmPassword?.message}
              >
                <Input
                  id='confirm-password'
                  type='password'
                  autoComplete='new-password'
                  {...passwordForm.register("confirmPassword")}
                />
              </Field>
            </div>
            <div className='flex justify-end'>
              <Button type='submit' disabled={changePassword.isPending}>
                {changePassword.isPending && (
                  <Spinner className='text-current' />
                )}
                {t("settings.changePassword")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
