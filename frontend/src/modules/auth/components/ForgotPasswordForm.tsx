"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Link } from "@/navigation";
import Field from "@/shared/components/Field";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";

import { useForgotPassword } from "../hooks/useAuthMutations";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues
} from "../schemas/authSchemas";
import AuthCard from "./AuthCard";
import FormError from "./FormError";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const footer = (
    <Link href='/login' className='text-primary font-medium hover:underline'>
      {t("backToLogin")}
    </Link>
  );

  if (forgot.isSuccess) {
    return (
      <AuthCard
        title={t("checkInboxTitle")}
        subtitle={t("checkInboxBody", { email: getValues("email") })}
        footer={footer}
      >
        <MailCheck className='text-primary mx-auto size-8' aria-hidden />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("forgotTitle")}
      subtitle={t("forgotSubtitle")}
      footer={footer}
    >
      <form
        noValidate
        onSubmit={handleSubmit(values => forgot.mutate(values))}
        className='space-y-4'
      >
        <FormError message={forgot.error?.message} />
        <Field label={t("email")} htmlFor='email' error={errors.email?.message}>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>
        <Button type='submit' className='w-full' disabled={forgot.isPending}>
          {forgot.isPending && <Spinner className='text-current' />}
          {t("sendResetLink")}
        </Button>
      </form>
    </AuthCard>
  );
}
