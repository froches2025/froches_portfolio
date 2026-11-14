import { describe, expect, it } from "vitest";
import { env, parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("accepts the production https URL", () => {
    expect(parseEnv({ NEXT_PUBLIC_SITE_URL: "https://froches.tech" })).toEqual({
      NEXT_PUBLIC_SITE_URL: "https://froches.tech",
    });
  });

  it("accepts the local http URL used in development and CI", () => {
    expect(
      parseEnv({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" })
        .NEXT_PUBLIC_SITE_URL,
    ).toBe("http://localhost:3000");
  });

  it("rejects a missing value and names the variable", () => {
    expect(() => parseEnv({})).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("rejects an empty value", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "" })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });

  it("rejects a value that is not a URL", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "froches.tech" })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });

  it("rejects a URL that is not http or https", () => {
    expect(() =>
      parseEnv({ NEXT_PUBLIC_SITE_URL: "ftp://froches.tech" }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});

describe("env", () => {
  it("is parsed from process.env at import", () => {
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });
});
