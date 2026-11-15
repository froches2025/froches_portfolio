// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

const secret = "test-cron-secret-0123456789abcdef0123";

describe("isAuthorizedCronRequest", () => {
  it("accepts the right bearer token", () => {
    expect(isAuthorizedCronRequest(`Bearer ${secret}`, secret)).toBe(true);
  });

  it("rejects a wrong token of the same length", () => {
    const wrong = secret.replace(/.$/, "x");
    expect(isAuthorizedCronRequest(`Bearer ${wrong}`, secret)).toBe(false);
  });

  it("rejects a token of a different length", () => {
    expect(isAuthorizedCronRequest(`Bearer ${secret}extra`, secret)).toBe(
      false,
    );
    expect(isAuthorizedCronRequest("Bearer x", secret)).toBe(false);
  });

  it("rejects a missing header", () => {
    expect(isAuthorizedCronRequest(null, secret)).toBe(false);
  });

  it("rejects the secret without the Bearer prefix", () => {
    expect(isAuthorizedCronRequest(secret, secret)).toBe(false);
    expect(isAuthorizedCronRequest(`bearer ${secret}`, secret)).toBe(false);
  });

  it("rejects everything when the secret is empty", () => {
    expect(isAuthorizedCronRequest("Bearer ", "")).toBe(false);
  });
});
