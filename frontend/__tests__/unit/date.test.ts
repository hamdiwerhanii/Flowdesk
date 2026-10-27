import { timeAgo } from "@/lib/date";

describe("timeAgo", () => {
  const now = new Date("2026-10-22T12:00:00Z").getTime();

  it("formats recent and older dates in English", () => {
    expect(timeAgo("2026-10-22T11:59:50Z", "en", now)).toBe("now");
    expect(timeAgo("2026-10-22T11:55:00Z", "en", now)).toBe("5 minutes ago");
    expect(timeAgo("2026-10-22T09:00:00Z", "en", now)).toBe("3 hours ago");
    expect(timeAgo("2026-10-21T12:00:00Z", "en", now)).toBe("yesterday");
    expect(timeAgo("2026-10-08T12:00:00Z", "en", now)).toBe("2 weeks ago");
  });

  it("follows the locale", () => {
    expect(timeAgo("2026-10-22T09:00:00Z", "fr", now)).toBe("il y a 3 heures");
    expect(timeAgo("2026-10-21T12:00:00Z", "fr", now)).toBe("hier");
  });
});
