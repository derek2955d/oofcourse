import type { Listing } from "./catalog";
export function jobStructuredData(
  item: Listing,
  area: { city: string; state: string },
  locale: "en" | "zh",
  now = Date.now(),
) {
  if (
    item.category !== "jobs" ||
    item.status !== "approved" ||
    !item.published_at ||
    !item.expires_at ||
    Date.parse(item.expires_at) <= now
  )
    return null;
  const d = item.details;
  if (
    !d.company ||
    !Number.isFinite(Number(d.salary_min)) ||
    !Number.isFinite(Number(d.salary_max)) ||
    Number(d.salary_max) < Number(d.salary_min)
  )
    return null;
  const units: Record<string, string> = {
      hour: "HOUR",
      day: "DAY",
      week: "WEEK",
      month: "MONTH",
      year: "YEAR",
    },
    employment: Record<string, string> = {
      "full-time": "FULL_TIME",
      "part-time": "PART_TIME",
      internship: "INTERN",
      contract: "CONTRACTOR",
    };
  if (!units[String(d.pay_period)] || !employment[String(d.employment)])
    return null;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: item.title,
    description: item.description,
    datePosted: item.published_at,
    validThrough: item.expires_at,
    url: `https://oofcourse.com/${locale}/jobs/${item.id}`,
    hiringOrganization: { "@type": "Organization", name: String(d.company) },
    employmentType: employment[String(d.employment)],
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: area.city,
        addressRegion: area.state,
        addressCountry: "US",
      },
    },
    ...(d.workplace === "remote"
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: {
            "@type": "Country",
            name: "United States",
          },
        }
      : {}),
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: Number(d.salary_min),
        maxValue: Number(d.salary_max),
        unitText: units[String(d.pay_period)],
      },
    },
  };
}
export const safeJson = (value: unknown) =>
  JSON.stringify(value).replaceAll("<", "\\u003c");
