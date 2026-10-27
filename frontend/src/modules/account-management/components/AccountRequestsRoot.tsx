"use client";

import { AlertTriangle, Check, UserCheck, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import EmptyState from "@/shared/components/EmptyState";
import PageHeader from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Select } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { useFormatters } from "@/shared/hooks/useFormatters";
import { useOrgContext } from "@/shared/hooks/useOrgContext";
import { Role } from "@/types/role.types";

import {
  useAccountDecisions,
  usePendingAccounts
} from "../hooks/useAccountRequests";

export default function AccountRequestsRoot() {
  const t = useTranslations();
  const { timeAgo } = useFormatters();
  const { orgId, orgSlug } = useOrgContext();
  const pending = usePendingAccounts(orgId);
  const { approve, reject } = useAccountDecisions(orgId);
  /** Role chosen per request before approving (defaults to customer). */
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const busy = approve.isPending || reject.isPending;

  return (
    <>
      <PageHeader
        title={t("accounts.title")}
        description={t("accounts.description", { slug: orgSlug })}
      />
      <Card>
        {pending.isPending ? (
          <div className='flex justify-center py-16'>
            <Spinner />
          </div>
        ) : pending.isError ? (
          <EmptyState
            icon={AlertTriangle}
            title={t("accounts.loadError")}
            description={pending.error.message}
          />
        ) : pending.data.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title={t("accounts.emptyTitle")}
            description={t("accounts.emptyBody")}
          />
        ) : (
          <ul className='divide-y'>
            {pending.data.map(request => (
              <li
                key={request.id}
                className='flex flex-wrap items-center gap-4 p-4'
              >
                <div className='min-w-48 flex-1'>
                  <p className='font-medium'>{request.user.name}</p>
                  <p className='text-muted-foreground text-sm'>
                    {t("accounts.requested", {
                      email: request.user.email,
                      time: timeAgo(request.createdAt)
                    })}
                  </p>
                </div>
                <Select
                  aria-label={t("accounts.roleFor", {
                    name: request.user.name
                  })}
                  className='h-9 w-40'
                  value={roles[request.id] ?? Role.CUSTOMER}
                  onChange={e =>
                    setRoles({ ...roles, [request.id]: e.target.value as Role })
                  }
                >
                  {Object.values(Role).map(role => (
                    <option key={role} value={role}>
                      {t(`roles.${role}`)}
                    </option>
                  ))}
                </Select>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    disabled={busy}
                    onClick={() =>
                      approve.mutate({
                        membershipId: request.id,
                        role: roles[request.id] ?? Role.CUSTOMER
                      })
                    }
                  >
                    <Check /> {t("accounts.approve")}
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={busy}
                    onClick={() => reject.mutate(request.id)}
                  >
                    <X /> {t("accounts.reject")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
