"use client";

import { AlertTriangle, Trash2, UserPlus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import EmptyState from "@/shared/components/EmptyState";
import PageHeader from "@/shared/components/PageHeader";
import Pagination from "@/shared/components/Pagination";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input, Select } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { Table, TBody, TD, TH, THead, TR } from "@/shared/components/ui/table";
import { useFormatters } from "@/shared/hooks/useFormatters";
import { useOrgContext } from "@/shared/hooks/useOrgContext";
import { Role } from "@/types/role.types";

import { useMemberMutations } from "../hooks/useMemberMutations";
import { useMembers } from "../hooks/useMemberQueries";
import type { Member, MemberFilters } from "../types/member.types";
import AddMemberForm from "./AddMemberForm";

const SEARCH_DEBOUNCE_MS = 300;

export default function MembersRoot() {
  const t = useTranslations();
  const { formatDateTime } = useFormatters();
  const { orgId, user } = useOrgContext();
  const [filters, setFilters] = useState<MemberFilters>({ page: 1 });
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const members = useMembers(orgId, filters);
  const { updateRole, remove } = useMemberMutations(orgId);

  // One request per pause in typing, not per keystroke.
  useEffect(() => {
    const timer = setTimeout(
      () =>
        setFilters(current =>
          (current.search ?? "") === search.trim()
            ? current
            : { ...current, page: 1, search: search.trim() || undefined }
        ),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [search]);

  const handleRemove = (member: Member) => {
    if (
      window.confirm(t("members.removeConfirm", { name: member.user.name }))
    ) {
      remove.mutate(member.id);
    }
  };

  return (
    <>
      <PageHeader
        title={t("members.title")}
        description={t("members.description")}
        actions={
          !adding && (
            <Button onClick={() => setAdding(true)}>
              <UserPlus /> {t("members.add")}
            </Button>
          )
        }
      />

      {adding && (
        <AddMemberForm orgId={orgId} onDone={() => setAdding(false)} />
      )}

      <Card>
        <div className='flex flex-wrap gap-3 border-b p-4'>
          <Input
            type='search'
            aria-label={t("members.searchLabel")}
            placeholder={t("members.searchPlaceholder")}
            className='min-w-52 flex-1'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select
            aria-label={t("members.roleFilter")}
            className='w-auto'
            value={filters.role ?? ""}
            onChange={e =>
              setFilters({
                ...filters,
                page: 1,
                role: (e.target.value || undefined) as Role | undefined
              })
            }
          >
            <option value=''>{t("members.allRoles")}</option>
            {Object.values(Role).map(role => (
              <option key={role} value={role}>
                {t(`roles.${role}`)}
              </option>
            ))}
          </Select>
        </div>

        {members.isPending ? (
          <div className='flex justify-center py-16'>
            <Spinner />
          </div>
        ) : members.isError ? (
          <EmptyState
            icon={AlertTriangle}
            title={t("members.loadError")}
            description={members.error.message}
          />
        ) : members.data.data.length === 0 ? (
          <EmptyState icon={Users} title={t("members.empty")} />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>{t("members.columnMember")}</TH>
                  <TH>{t("members.columnRole")}</TH>
                  <TH>{t("members.columnJoined")}</TH>
                  <TH className='text-right'>
                    <span className='sr-only'>{t("common.actions")}</span>
                  </TH>
                </tr>
              </THead>
              <TBody>
                {members.data.data.map(member => {
                  const isMe = member.user.id === user.id;
                  return (
                    <TR key={member.id}>
                      <TD>
                        <p className='font-medium'>
                          {member.user.name}
                          {isMe && (
                            <span className='text-muted-foreground ml-2 text-xs'>
                              ({t("common.you")})
                            </span>
                          )}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {member.user.email}
                        </p>
                      </TD>
                      <TD>
                        <Select
                          aria-label={t("members.roleOf", {
                            name: member.user.name
                          })}
                          className='h-9 w-40'
                          value={member.role}
                          disabled={isMe || updateRole.isPending}
                          onChange={e =>
                            updateRole.mutate({
                              membershipId: member.id,
                              role: e.target.value as Role
                            })
                          }
                        >
                          {Object.values(Role).map(role => (
                            <option key={role} value={role}>
                              {t(`roles.${role}`)}
                            </option>
                          ))}
                        </Select>
                      </TD>
                      <TD className='text-muted-foreground'>
                        {formatDateTime(member.createdAt)}
                      </TD>
                      <TD className='text-right'>
                        {!isMe && (
                          <Button
                            variant='ghost'
                            size='icon'
                            aria-label={t("members.remove", {
                              name: member.user.name
                            })}
                            className='text-danger hover:bg-danger-soft'
                            disabled={remove.isPending}
                            onClick={() => handleRemove(member)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
            <Pagination
              page={filters.page}
              totalPages={members.data.meta.totalPages}
              onPageChange={page => setFilters({ ...filters, page })}
            />
          </>
        )}
      </Card>
    </>
  );
}
