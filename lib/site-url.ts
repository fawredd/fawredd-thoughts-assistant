const localSiteUrl = "http://localhost:3000";

export function getSiteUrl(): URL {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredSiteUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL must be set to the canonical production origin.",
      );
    }

    return new URL(localSiteUrl);
  }

  let siteUrl: URL;
  try {
    siteUrl = new URL(configuredSiteUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute URL.");
  }

  if (
    (siteUrl.protocol !== "https:" &&
      !(siteUrl.protocol === "http:" && siteUrl.hostname === "localhost")) ||
    siteUrl.pathname !== "/" ||
    siteUrl.search ||
    siteUrl.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an HTTPS origin without a path, query, or hash.",
    );
  }

  return new URL(siteUrl.origin);
}
