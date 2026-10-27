import { activeNavPath, NAV_ITEMS } from "@/shared/constants/navigation";

describe("activeNavPath", () => {
  it("highlights the most specific matching item", () => {
    expect(
      activeNavPath("/acme/customer/tickets/new", "acme", NAV_ITEMS.CUSTOMER)
    ).toBe("customer/tickets/new");
    expect(
      activeNavPath("/acme/customer/tickets/123", "acme", NAV_ITEMS.CUSTOMER)
    ).toBe("customer/tickets");
  });

  it("keeps the dashboard for the role root only", () => {
    expect(activeNavPath("/acme/admin", "acme", NAV_ITEMS.ADMIN)).toBe("admin");
    expect(activeNavPath("/acme/admin/members", "acme", NAV_ITEMS.ADMIN)).toBe(
      "admin/members"
    );
  });

  it("does not match a prefix that is not a full segment", () => {
    expect(activeNavPath("/acme/admin/ticketsx", "acme", NAV_ITEMS.ADMIN)).toBe(
      "admin"
    );
  });
});
