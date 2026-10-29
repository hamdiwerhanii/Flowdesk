"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/Button";
import { Textarea } from "@/shared/components/Input";
import { Spinner } from "@/shared/components/Spinner";

import { useAddComment } from "../hooks/useTicketMutations";
import { commentSchema, type CommentValues } from "../schemas/ticketSchemas";

type CommentFormProps = {
  orgId: string;
  ticketId: string;
  isStaff: boolean;
};

export default function CommentForm({
  orgId,
  ticketId,
  isStaff
}: CommentFormProps) {
  const t = useTranslations();
  const addComment = useAddComment(orgId, ticketId);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "", isInternal: false }
  });
  const isInternal = useWatch({ control, name: "isInternal" });

  const submit = handleSubmit(values =>
    addComment.mutate(values, {
      onSuccess: () => reset({ body: "", isInternal: values.isInternal })
    })
  );

  return (
    <form
      noValidate
      onSubmit={submit}
      className={cn(
        "bg-card space-y-3 rounded-xl border p-4",
        isInternal && "border-amber-300 bg-amber-50/60"
      )}
    >
      <label htmlFor='comment' className='sr-only'>
        {t("tickets.replyLabel")}
      </label>
      <Textarea
        id='comment'
        placeholder={t(
          isInternal ? "tickets.notePlaceholder" : "tickets.replyPlaceholder"
        )}
        aria-invalid={!!errors.body}
        onKeyDown={event => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey))
            void submit();
        }}
        {...register("body")}
      />
      {errors.body?.message && (
        <p role='alert' className='text-danger text-xs'>
          {t(errors.body.message)}
        </p>
      )}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        {isStaff ? (
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              className='size-4 accent-amber-600'
              {...register("isInternal")}
            />
            {t("tickets.internalNote")}
          </label>
        ) : (
          <span className='text-muted-foreground text-xs'>
            {t("tickets.sendShortcut")}
          </span>
        )}
        <Button type='submit' disabled={addComment.isPending}>
          {addComment.isPending ? (
            <Spinner className='text-current' />
          ) : (
            <Send />
          )}
          {t(isInternal ? "tickets.addNote" : "tickets.sendReply")}
        </Button>
      </div>
    </form>
  );
}
