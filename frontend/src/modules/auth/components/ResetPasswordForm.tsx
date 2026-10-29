"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LinkIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Link } from "@/navigation";
import { Button } from "@/shared/components/Button";
import Field from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Spinner } from "@/shared/components/Spinner";

import { useResetPassword } from "../hooks/useAuthMutations";
import {
  resetPasswordSchema,
  type ResetPasswordValues
} from "../schemas/authSchemas";
import AuthCard from "./AuthCard";
import FormError from "./FormError";

export default function ResetPasswordForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isInvite = searchParams.get("invite") === "1";
  const reset = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const loginLink = (
    <Button asChild className='w-full'>
      <Link href='/login'>{t("login")}</Link>
    </Button>
  );

  if (!token) {
    return (
      <AuthCard
        title={t("missingTokenTitle")}
        subtitle={t("missingTokenBody")}
        footer={
          <Link
            href='/forgot-password'
            className='text-primary font-medium hover:underline'
          >
            {t("requestNewLink")}
          </Link>
        }
      >
        <LinkIcon
          className='text-muted-foreground mx-auto size-8'
          aria-hidden
        />
      </AuthCard>
    );
  }

  if (reset.isSuccess) {
    return (
      <AuthCard
        title={t("passwordSavedTitle")}
        subtitle={t("passwordSavedBody")}
      >
        <div className='space-y-4 text-center'>
          <CheckCircle2
            className='mx-auto size-8 text-emerald-600'
            aria-hidden
          />
          {loginLink}
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t(isInvite ? "inviteTitle" : "resetTitle")}
      subtitle={t(isInvite ? "inviteSubtitle" : "resetSubtitle")}
      footer={
        !isInvite && (
          <Link
            href='/forgot-password'
            className='text-primary font-medium hover:underline'
          >
            {t("requestNewLink")}
          </Link>
        )
      }
    >
      <form
        noValidate
        onSubmit={handleSubmit(({ password }) =>
          reset.mutate({ token, password })
        )}
        className='space-y-4'
      >
        <FormError message={reset.error?.message} />
        <Field
          label={t("newPassword")}
          htmlFor='password'
          error={errors.password?.message}
        >
          <Input
            id='password'
            type='password'
            autoComplete='new-password'
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>
        <Field
          label={t("confirmPassword")}
          htmlFor='confirmPassword'
          error={errors.confirmPassword?.message}
        >
          <Input
            id='confirmPassword'
            type='password'
            autoComplete='new-password'
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>
        <Button type='submit' className='w-full' disabled={reset.isPending}>
          {reset.isPending && <Spinner className='text-current' />}
          {t("savePassword")}
        </Button>
      </form>
    </AuthCard>
  );
}
