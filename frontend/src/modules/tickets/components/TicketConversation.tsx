"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Spinner } from "@/shared/components/Spinner";
import { useFormatters } from "@/shared/hooks/useFormatters";
import type { Ticket } from "@/types/ticketTypes";

import { useTicketComments } from "../hooks/useTicketQueries";
import CommentForm from "./CommentForm";

type MessageProps = {
  author: string;
  date: string;
  body: string;
  internal?: boolean;
  highlight?: boolean;
};

function Message({ author, date, body, internal, highlight }: MessageProps) {
  const t = useTranslations("tickets");
  const { timeAgo, formatDateTime } = useFormatters();
  return (
    <article
      className={cn(
        "bg-card rounded-xl border p-4",
        internal && "border-amber-300 bg-amber-50/60",
        highlight && "border-primary/30"
      )}
    >
      <header className='mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm'>
        <span className='font-medium'>{author}</span>
        <time
          dateTime={date}
          title={formatDateTime(date)}
          className='text-muted-foreground'
        >
          {timeAgo(date)}
        </time>
        {internal && (
          <span className='inline-flex items-center gap-1 text-xs font-medium text-amber-700'>
            <Lock className='size-3' aria-hidden /> {t("internalNote")}
          </span>
        )}
      </header>
      <p className='text-sm leading-relaxed whitespace-pre-wrap'>{body}</p>
    </article>
  );
}

type TicketConversationProps = {
  orgId: string;
  ticket: Ticket;
  isStaff: boolean;
};

export default function TicketConversation({
  orgId,
  ticket,
  isStaff
}: TicketConversationProps) {
  const t = useTranslations("tickets");
  const comments = useTicketComments(orgId, ticket.id);

  return (
    <section aria-label={t("conversation")} className='space-y-4'>
      <Message
        author={ticket.requester.name}
        date={ticket.createdAt}
        body={ticket.description}
        highlight
      />
      {comments.isPending ? (
        <div className='flex justify-center py-6'>
          <Spinner />
        </div>
      ) : comments.isError ? (
        <p className='text-danger text-sm'>{t("repliesError")}</p>
      ) : (
        comments.data.map(comment => (
          <Message
            key={comment.id}
            author={comment.author.name}
            date={comment.createdAt}
            body={comment.body}
            internal={comment.isInternal}
          />
        ))
      )}
      <CommentForm orgId={orgId} ticketId={ticket.id} isStaff={isStaff} />
    </section>
  );
}
