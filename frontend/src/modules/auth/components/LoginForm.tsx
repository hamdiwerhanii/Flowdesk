"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Link } from "@/navigation";
import { Button } from "@/shared/components/Button";
import Field from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Spinner } from "@/shared/components/Spinner";

import { useLogin } from "../hooks/useAuthMutations";
import { loginSchema, type LoginValues } from "../schemas/authSchemas";
import AuthCard from "./AuthCard";
import FormError from "./FormError";

export default function LoginForm() {
  const t = useTranslations("auth");
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  return (
    <AuthCard
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      footer={
        <>
          <p>
            {t("noAccount")}{" "}
            <Link
              href='/register'
              className='text-primary font-medium hover:underline'
            >
              {t("createCustomerAccount")}
            </Link>
          </p>
          <p>
            {t("newCompany")}{" "}
            <Link
              href='/register-organization'
              className='text-primary font-medium hover:underline'
            >
              {t("createOrganization")}
            </Link>
          </p>
        </>
      }
    >
      <form
        noValidate
        onSubmit={handleSubmit(values => login.mutate(values))}
        className='space-y-4'
      >
        <FormError message={login.error?.message} />
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
            autoComplete='current-password'
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>
        <div className='-mt-2 flex justify-end'>
          <Link
            href='/forgot-password'
            className='text-primary text-xs font-medium hover:underline'
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <Button type='submit' className='w-full' disabled={login.isPending}>
          {login.isPending && <Spinner className='text-current' />}
          {t("login")}
        </Button>
      </form>
    </AuthCard>
  );
}
