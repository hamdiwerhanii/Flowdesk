"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Link } from "@/navigation";
import { Button } from "@/shared/components/Button";
import Field from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Spinner } from "@/shared/components/Spinner";

import { useRegister } from "../hooks/useAuthMutations";
import { registerSchema, type RegisterValues } from "../schemas/authSchemas";
import AuthCard from "./AuthCard";
import FormError from "./FormError";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const signup = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const footer = (
    <p>
      {t("haveAccount")}{" "}
      <Link href='/login' className='text-primary font-medium hover:underline'>
        {t("login")}
      </Link>
    </p>
  );

  if (signup.isSuccess) {
    return (
      <AuthCard
        title={t("pendingTitle")}
        subtitle={t("pendingBody")}
        footer={footer}
      >
        <div className='flex flex-col items-center gap-2 text-center'>
          <CheckCircle2 className='size-8 text-emerald-600' aria-hidden />
          <p className='text-sm'>{signup.data.message}</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("registerTitle")}
      subtitle={t("registerSubtitle")}
      footer={footer}
    >
      <form
        noValidate
        onSubmit={handleSubmit(values => signup.mutate(values))}
        className='space-y-4'
      >
        <FormError message={signup.error?.message} />
        <Field
          label={t("orgSlug")}
          htmlFor='orgSlug'
          hint={t("orgSlugHint")}
          error={errors.orgSlug?.message}
        >
          <Input
            id='orgSlug'
            aria-invalid={!!errors.orgSlug}
            {...register("orgSlug")}
          />
        </Field>
        <Field label={t("name")} htmlFor='name' error={errors.name?.message}>
          <Input
            id='name'
            autoComplete='name'
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>
        <Field label={t("email")} htmlFor='email' error={errors.email?.message}>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>
        <Field
          label={t("password")}
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
        <Button type='submit' className='w-full' disabled={signup.isPending}>
          {signup.isPending && <Spinner className='text-current' />}
          {t("register")}
        </Button>
      </form>
    </AuthCard>
  );
}
