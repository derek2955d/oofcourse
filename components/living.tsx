import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  CalendarDays,
  House,
  ShoppingBag,
  MapPin,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { type LivingGuide } from "@/lib/living";
import { upcomingEvents } from "@/lib/living-server";
import { loadTaxonomy } from "@/lib/taxonomy-server";
import type { Locale } from "@/lib/catalog";
import { activeEditorialActivities } from "@/lib/editorial-activities";
import { EditorialActivityCards } from "./editorial-activities";

export function LivingGuideCard({
  guide,
  locale,
  read,
}: {
  guide: LivingGuide;
  locale: Locale;
  read: string;
}) {
  const Icon =
    guide.topic === "housing"
      ? House
      : guide.topic === "marketplace"
        ? ShoppingBag
        : BookOpen;
  return (
    <article className={`living-guide-card living-topic-${guide.topic}`}>
      <Link href={`/living/${guide.slug}`} className="living-guide-link">
        <div className="living-guide-art" aria-hidden="true">
          <span className="living-art-orbit" />
          <Icon size={40} strokeWidth={1.5} />
          <span className="living-art-spark">+</span>
        </div>
        <div className="living-guide-body">
          <span className="living-guide-tag">{guide.tag[locale]}</span>
          <h3>{guide.title[locale]}</h3>
          <p>{guide.summary[locale]}</p>
          <span className="text-link">
            {read}
            <ArrowRight size={15} />
          </span>
        </div>
      </Link>
    </article>
  );
}

export async function LivingEvents({
  homepage = false,
  nearby = false,
}: { homepage?: boolean; nearby?: boolean } = {}) {
  const t = await getTranslations("living");
  const locale = (await getLocale()) as Locale;
  const [events, taxonomy] = await Promise.all([
    upcomingEvents(nearby),
    loadTaxonomy(),
  ]);
  return (
    <section
      className="living-events"
      id="events"
      aria-labelledby="living-events-heading"
    >
      <div className="living-section-heading">
        <div>
          {!homepage && <p className="eyebrow">{t("upcoming")}</p>}
          <h2 id="living-events-heading">
            {t(
              nearby
                ? "nearbyHeading"
                : homepage
                  ? "homeEventsHeading"
                  : "events",
            )}
          </h2>
          {!homepage && <p>{t("eventsIntro")}</p>}
        </div>
        <Link
          href="/community?state=NY&subcategory=events"
          className="text-link"
        >
          {t("viewEvents")}
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <EditorialActivityCards
        locale={locale}
        limit={homepage && !nearby ? 3 : undefined}
        label={(await getTranslations("editorialActivity"))("label")}
        view={t("viewEvent")}
      />
      {!!events.items.length && (
        <div className="living-upcoming" aria-label={t("communityEvents")}>
          {events.items.map((event) => (
            <article key={event.id}>
              <div className="living-event-date">
                <CalendarDays size={21} aria-hidden="true" />
                <time dateTime={event.day}>
                  {new Intl.DateTimeFormat(
                    locale === "zh" ? "zh-CN" : "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      timeZone: "America/New_York",
                    },
                  ).format(new Date(`${event.day}T12:00:00Z`))}
                </time>
              </div>
              <h3>
                <Link href={`/community/${event.id}`}>{event.title}</Link>
              </h3>
              <p>
                <MapPin size={14} aria-hidden="true" />
                {taxonomy.locations.find(([id]) => id === event.location)?.[
                  locale === "zh" ? 2 : 1
                ] || event.location}
              </p>
              <Link href={`/community/${event.id}`} className="text-link">
                {t("viewEvent")}
                <ArrowUpRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      )}
      {events.error ? (
        <p role="alert" className="living-event-empty">
          {t("eventError")}
        </p>
      ) : (
        !events.items.length &&
        !activeEditorialActivities().length && (
          <p className="living-event-empty">{t("noEvents")}</p>
        )
      )}
    </section>
  );
}
