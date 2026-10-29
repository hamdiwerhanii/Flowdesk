"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { useStaffMembers } from "@/modules/members/hooks/useMemberQueries";
import { useRouter } from "@/navigation";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";
import Field from "@/shared/components/Field";
import { Input, Select, Textarea } from "@/shared/components/Input";
import PageHeader from "@/shared/components/PageHeader";
import { Spinner } from "@/shared/components/Spinner";
import { useOrgContext } from "@/shared/hooks/useOrgContext";
import { TicketPriority } from "@/types/ticketTypes";

import { PRIORITY_ORDER } from "../consts/ticketOptions";
import { useCreateTicket } from "../hooks/useTicketMutations";
import {
  newTicketSchema,
  staffTicketSchema,
  type TicketFormValues
} from "../schemas/ticketSchemas";
import { ticketPath, ticketsPath } from "../utils/ticketPaths";
import RequesterPicker from "./RequesterPicker";

export default function NewTicketForm() {
  const t = useTranslations();
  const { orgId, orgSlug, orgName, role, isStaff } = useOrgContext();
  const createTicket = useCreateTicket(orgId);
  const staff = useStaffMembers(orgId, isStaff);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TicketFormValues>({
    resolver: zodResolver(isStaff ? staffTicketSchema : newTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: TicketPriority.MEDIUM,
      requesterId: "",
      assigneeId: ""
    }
  });

  const onSubmit = handleSubmit(({ requesterId, assigneeId, ...ticket }) =>
    createTicket.mutate(
      isStaff
        ? { ...ticket, requesterId, assigneeId: assigneeId || undefined }
        : ticket,
      {
        onSuccess: created => router.push(ticketPath(orgSlug, role, created.id))
      }
    )
  );

  return (
    <div className='mx-auto max-w-2xl'>
      <PageHeader
        title={t("tickets.form.title")}
        description={
          isStaff
            ? t("tickets.form.staffDescription")
            : t("tickets.form.customerDescription", { org: orgName })
        }
      />
      <Card>
        <CardContent className='pt-5'>
          <form noValidate onSubmit={onSubmit} className='space-y-5'>
            {isStaff && (
              <div className='grid gap-5 sm:grid-cols-2'>
                <Field
                  label={t("tickets.form.requester")}
                  htmlFor='requesterId'
                  error={errors.requesterId?.message}
                >
                  <RequesterPicker
                    orgId={orgId}
                    selectProps={{
                      id: "requesterId",
                      "aria-invalid": !!errors.requesterId,
                      ...register("requesterId")
                    }}
                  />
                </Field>
                <Field label={t("tickets.form.assignee")} htmlFor='assigneeId'>
                  <Select id='assigneeId' {...register("assigneeId")}>
                    <option value=''>{t("tickets.unassigned")}</option>
                    {staff.data?.map(member => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            )}
            <Field
              label={t("tickets.form.subject")}
              htmlFor='subject'
              error={errors.subject?.message}
            >
              <Input
                id='subject'
                placeholder={t("tickets.form.subjectPlaceholder")}
                aria-invalid={!!errors.subject}
                {...register("subject")}
              />
            </Field>
            <Field label={t("tickets.form.priority")} htmlFor='priority'>
              <Select id='priority' {...register("priority")}>
                {PRIORITY_ORDER.map(priority => (
                  <option key={priority} value={priority}>
                    {t(`ticketPriority.${priority}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={t("tickets.form.description")}
              htmlFor='description'
              hint={t("tickets.form.descriptionHint")}
              error={errors.description?.message}
            >
              <Textarea
                id='description'
                rows={7}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
            </Field>
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push(ticketsPath(orgSlug, role))}
              >
                {t("common.cancel")}
              </Button>
              <Button type='submit' disabled={createTicket.isPending}>
                {createTicket.isPending && <Spinner className='text-current' />}
                {t("tickets.form.submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
