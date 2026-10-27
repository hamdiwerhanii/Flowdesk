import {
  decodeSession,
  homePath,
  parseOrgRolePath,
  pickDefaultRole,
  type SessionRole
} from "@/lib/routing";

const roles: SessionRole[] = [
  { orgId: "2", orgSlug: "zeta", orgName: "Zeta", role: "AGENT" },
  { orgId: "1", orgSlug: "acme", orgName: "Acme", role: "CUSTOMER" }
];

const base64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const token = async (expiresInSeconds: number, payload: object = { roles }) => {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = { sub: "u1", email: "a@b.c", name: "A", exp, ...payload };
  return `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url(body)}.signature`;
};

describe("decodeSession", () => {
  it("returns the payload of a valid token", async () => {
    const session = decodeSession(await token(900));
    expect(session?.roles).toEqual(roles);
  });

  it("treats expired or nearly expired tokens as missing", async () => {
    expect(decodeSession(await token(-60))).toBeNull();
    expect(decodeSession(await token(5))).toBeNull();
  });

  it("rejects garbage and tokens without roles", async () => {
    expect(decodeSession(undefined)).toBeNull();
    expect(decodeSession("not-a-jwt")).toBeNull();
    expect(decodeSession(await token(900, { roles: "ADMIN" }))).toBeNull();
  });
});

describe("parseOrgRolePath", () => {
  it("extracts organization and role segment", () => {
    expect(parseOrgRolePath("/acme/agent/tickets/42")).toEqual({
      orgSlug: "acme",
      segment: "agent"
    });
  });

  it("ignores paths that are not role areas", () => {
    expect(parseOrgRolePath("/acme")).toBeNull();
    expect(parseOrgRolePath("/acme/settings")).toBeNull();
    expect(parseOrgRolePath("/")).toBeNull();
  });
});

describe("pickDefaultRole / homePath", () => {
  it("prefers the remembered organization", () => {
    expect(pickDefaultRole(roles, "zeta").orgSlug).toBe("zeta");
  });

  it("falls back to the first organization by name", () => {
    expect(pickDefaultRole(roles, "unknown").orgSlug).toBe("acme");
    expect(pickDefaultRole(roles).orgSlug).toBe("acme");
  });

  it("builds the role home path", () => {
    expect(homePath("en", roles[0])).toBe("/en/zeta/agent");
  });
});
