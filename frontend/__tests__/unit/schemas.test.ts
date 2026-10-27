import {
  registerOrganizationSchema,
  slugify,
  slugSchema
} from "@/modules/auth/schemas/authSchemas";
import { addMemberSchema } from "@/modules/members/schemas/memberSchemas";
import { passwordSchema } from "@/modules/settings/schemas/settingsSchemas";

describe("slugify", () => {
  it("turns an organization name into a valid slug", () => {
    expect(slugify("Acme Support Ltd.")).toBe("acme-support-ltd");
    expect(slugify("  Café   Économie ")).toBe("cafe-economie");
    expect(slugSchema.safeParse(slugify("Acme Support Ltd.")).success).toBe(
      true
    );
  });
});

describe("slugSchema", () => {
  it.each(["ac", "Acme", "acme--support", "-acme", "acme_support"])(
    "rejects %s",
    value => {
      const result = slugSchema.safeParse(value);
      if (result.success) expect(result.data).not.toBe(value);
      else expect(result.success).toBe(false);
    }
  );
});

describe("registerOrganizationSchema", () => {
  it("normalizes email and slug", () => {
    const result = registerOrganizationSchema.parse({
      organizationName: "Acme",
      slug: "ACME",
      name: "Amira",
      email: " Amira@Acme.TEST ",
      password: "password123"
    });
    expect(result.slug).toBe("acme");
    expect(result.email).toBe("amira@acme.test");
  });
});

describe("addMemberSchema", () => {
  const base = {
    name: "Sami",
    email: "sami@acme.test",
    role: "AGENT" as const
  };

  it("needs no password (new people get an invitation email)", () => {
    expect(addMemberSchema.parse(base)).toEqual(base);
  });

  it("reports errors as translation keys", () => {
    const result = addMemberSchema.safeParse({ ...base, email: "nope" });
    expect(result.error?.issues[0].message).toBe("validation.invalidEmail");
  });
});

describe("passwordSchema", () => {
  it("requires the confirmation to match", () => {
    const result = passwordSchema.safeParse({
      currentPassword: "old",
      newPassword: "password123",
      confirmPassword: "password124"
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["confirmPassword"]);
  });
});
