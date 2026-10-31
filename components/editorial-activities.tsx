import Image from "next/image";
import { CalendarDays, ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  recentEditorialActivities,
  activityDateValue,
  type EditorialActivity,
} from "@/lib/editorial-activities";
import type { Locale } from "@/lib/catalog";
export function EditorialActivityCards({
  locale,
  label,
  view,
  items,
  limit,
}: {
  locale: Locale;
  label: string;
  view: string;
  items?: readonly EditorialActivity[];
  limit?: number;
}) {
  const activities = (items || recentEditorialActivities()).slice(0, limit);
  if (!activities.length) return null;
  return (
    <div className="editorial-activity-cards" aria-label={label}>
      {activities.map((activity) => (
        <article className="editorial-activity-card" key={activity.slug}>
          <Link
            href={`/activities/${activity.slug}`}
            className="editorial-art-link"
            aria-label={`${activity.title[locale]} — ${locale === "zh" ? "主题插画" : "Editorial illustration"}`}
          >
            <Image
              src={
                "image" in activity
                  ? `/illustrations/${activity.image}.svg`
                  : activity.slug.includes("halloween")
                    ? "/illustrations/parade.svg"
                    : "/illustrations/cinema.svg"
              }
              alt=""
              width={600}
              height={400}
              sizes="(max-width: 760px) 100vw, (max-width: 1000px) 200px, 260px"
            />
            <span>
              {locale === "zh" ? "主题插画" : "Editorial illustration"}
            </span>
          </Link>
          <div className="editorial-activity-body">
            <div className="editorial-activity-label">
              <CalendarDays size={17} aria-hidden="true" />
              <span className="sr-only">{label}</span>
              <time dateTime={activity.startsAt}>
                {new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  timeZone: "America/New_York",
                }).format(activityDateValue(activity.startsAt))}
              </time>
              {activity.startsAt.slice(0, 10) !== activity.day && (
                <>
                  <span aria-hidden="true">–</span>
                  <time dateTime={activity.day}>
                    {new Intl.DateTimeFormat(
                      locale === "zh" ? "zh-CN" : "en-US",
                      {
                        ...(activity.day.slice(0, 4) !==
                        activity.startsAt.slice(0, 4)
                          ? { year: "numeric" as const }
                          : {}),
                        month: "short",
                        day: "numeric",
                        timeZone: "America/New_York",
                      },
                    ).format(activityDateValue(activity.day))}
                  </time>
                </>
              )}
            </div>
            <h3>
              <Link href={`/activities/${activity.slug}`}>
                {activity.title[locale]}
              </Link>
            </h3>
            <p>{activity.summary[locale]}</p>
            <p className="editorial-activity-place">
              <MapPin size={14} aria-hidden="true" />
              {activity.place[locale]}
            </p>
            <Link href={`/activities/${activity.slug}`} className="text-link">
              {view}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
