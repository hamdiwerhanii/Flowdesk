"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Link } from "@/navigation";
import { Button } from "@/shared/components/Button";
import Field from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Spinner } from "@/shared/components/Spinner";

import { useRegisterOrganization } from "../hooks/useAuthMutations";
import {
  registerOrganizationSchema,
  type RegisterOrganizationValues,
  slugify
} from "../schemas/authSchemas";
import AuthCard from "./AuthCard";
import FormError from "./FormError";

export default function RegisterOrganizationForm() {
  const t = useTranslations("auth");
  const signup = useRegisterOrganization();
  const {
    register,
    handleSubmit,
    setValue,
    getFieldState,
    formState: { errors }
  } = useForm<RegisterOrganizationValues>({
    resolver: zodResolver(registerOrganizationSchema)
  });

  const organizationName = register("organizationName", {
    onChange: event => {
      if (!getFieldState("slug").isDirty) {
        setValue("slug", slugify(event.target.value));
      }
    }
  });

  return (
    <AuthCard
      title={t("registerOrgTitle")}
      subtitle={t("registerOrgSubtitle")}
      footer={
        <p>
          {t("haveAccount")}{" "}
          <Link
            href='/login'
            className='text-primary font-medium hover:underline'
          >
            {t("login")}
          </Link>
        </p>
      }
    >
      <form
        noValidate
        onSubmit={handleSubmit(values => signup.mutate(values))}
        className='space-y-4'
      >
        <FormError message={signup.error?.message} />
        <Field
          label={t("organizationName")}
          htmlFor='organizationName'
          error={errors.organizationName?.message}
        >
          <Input
            id='organizationName'
            autoComplete='organization'
            aria-invalid={!!errors.organizationName}
            {...organizationName}
          />
        </Field>
        <Field
          label={t("slug")}
          htmlFor='slug'
          hint={t("slugHint")}
          error={errors.slug?.message}
        >
          <Input id='slug' aria-invalid={!!errors.slug} {...register("slug")} />
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
          {t("registerOrg")}
        </Button>
      </form>
    </AuthCard>
  );
}
