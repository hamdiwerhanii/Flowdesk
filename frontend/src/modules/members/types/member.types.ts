import type { PublicUser } from "@/types/api.types";
import type { Role } from "@/types/role.types";

export type Member = {
  id: string;
  role: Role;
  status: "PENDING" | "ACTIVE" | "REJECTED";
  createdAt: string;
  user: PublicUser;
};

export type MemberFilters = {
  page: number;
  role?: Role;
  search?: string;
};

export type CreateMemberInput = {
  email: string;
  name: string;
  role: Role;
};
