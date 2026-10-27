"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

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

import { useOrganization, useUpdateOrganization } from "../hooks/useSettings";
import {
  organizationSchema,
  type OrganizationValues
} from "../schemas/settingsSchemas";

export default function OrganizationSettings() {
  const t = useTranslations();
  const { orgId, orgName } = useOrgContext();
  const organization = useOrganization(orgId);
  const update = useUpdateOrganization(orgId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<OrganizationValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { name: orgName }
  });

  useEffect(() => {
    if (organization.data) reset({ name: organization.data.name });
  }, [organization.data, reset]);

  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <PageHeader
        title={t("settings.orgTitle")}
        description={t("settings.orgDescription")}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.general")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            onSubmit={handleSubmit(values => update.mutate(values))}
            className='space-y-4'
          >
            <Field
              label={t("settings.orgName")}
              htmlFor='org-name'
              error={errors.name?.message}
            >
              <Input id='org-name' {...register("name")} />
            </Field>
            <div className='flex justify-end'>
              <Button type='submit' disabled={!isDirty || update.isPending}>
                {update.isPending && <Spinner className='text-current' />}
                {t("common.saveChanges")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.signupTitle")}</CardTitle>
          <CardDescription>{t("settings.signupDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <code className='bg-muted rounded-lg px-3 py-2 font-mono text-sm'>
            {organization.data?.slug ?? "…"}
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
