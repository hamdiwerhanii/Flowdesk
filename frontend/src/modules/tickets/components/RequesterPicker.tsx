"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, useEffect, useState } from "react";

import { useMembers } from "@/modules/members/hooks/useMemberQueries";
import { Input, Select } from "@/shared/components/Input";
import { Role } from "@/types/roleTypes";

type RequesterPickerProps = {
  orgId: string;
  selectProps: ComponentProps<"select">;
};

const SEARCH_DEBOUNCE_MS = 300;

export default function RequesterPicker({
  orgId,
  selectProps
}: RequesterPickerProps) {
  const t = useTranslations("tickets.form");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(search.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [search]);

  const customers = useMembers(orgId, {
    page: 1,
    role: Role.CUSTOMER,
    search: debounced || undefined
  });
  const options = customers.data?.data ?? [];

  return (
    <div className='space-y-2'>
      <div className='relative'>
        <Search
          className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2'
          aria-hidden
        />
        <Input
          type='search'
          aria-label={t("requesterSearch")}
          placeholder={t("requesterSearch")}
          className='pl-9'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <Select disabled={customers.isPending} {...selectProps}>
        <option value=''>
          {options.length || customers.isPending
            ? t("requesterPlaceholder")
            : t("requesterNoResults")}
        </option>
        {options.map(member => (
          <option key={member.user.id} value={member.user.id}>
            {member.user.name} · {member.user.email}
          </option>
        ))}
      </Select>
    </div>
  );
}
