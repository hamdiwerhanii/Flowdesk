import type { PublicUser } from "@/types/apiTypes";
import type { Role } from "@/types/roleTypes";

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
