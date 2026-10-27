"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import Field from "@/shared/components/Field";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import { Input, Select } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { Role } from "@/types/role.types";

import { useMemberMutations } from "../hooks/useMemberMutations";
import {
  addMemberSchema,
  type AddMemberValues
} from "../schemas/memberSchemas";

type AddMemberFormProps = { orgId: string; onDone: () => void };

export default function AddMemberForm({ orgId, onDone }: AddMemberFormProps) {
  const t = useTranslations();
  const { create } = useMemberMutations(orgId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { name: "", email: "", role: Role.AGENT }
  });

  const onSubmit = handleSubmit(values =>
    create.mutate(values, {
      onSuccess: () => {
        reset();
        onDone();
      }
    })
  );

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>{t("members.form.title")}</CardTitle>
        <CardDescription>{t("members.form.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={onSubmit}
          className='grid gap-4 sm:grid-cols-3'
        >
          <Field
            label={t("members.form.name")}
            htmlFor='member-name'
            error={errors.name?.message}
          >
            <Input
              id='member-name'
              aria-invalid={!!errors.name}
              {...register("name")}
            />
          </Field>
          <Field
            label={t("members.form.email")}
            htmlFor='member-email'
            error={errors.email?.message}
          >
            <Input
              id='member-email'
              type='email'
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </Field>
          <Field label={t("members.form.role")} htmlFor='member-role'>
            <Select id='member-role' {...register("role")}>
              {Object.values(Role).map(role => (
                <option key={role} value={role}>
                  {t(`roles.${role}`)}
                </option>
              ))}
            </Select>
          </Field>
          <div className='flex justify-end gap-2 sm:col-span-3'>
            <Button type='button' variant='outline' onClick={onDone}>
              {t("common.cancel")}
            </Button>
            <Button type='submit' disabled={create.isPending}>
              {create.isPending && <Spinner className='text-current' />}
              {t("members.form.submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
