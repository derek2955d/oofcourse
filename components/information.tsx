import { setRequestLocale } from "next-intl/server";
import content from "@/lib/information.json";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/catalog";
type InfoSlug = keyof typeof content;
export function infoMetadata(slug: InfoSlug) {
  return async ({ params }: { params: Promise<{ locale: Locale }> }) => {
    const { locale } = await params;
    const data = content[slug][locale];
    return pageMetadata(locale, data[0], data[1], `/${slug}`);
  };
}
export async function InfoPage({
  slug,
  params,
}: {
  slug: InfoSlug;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [title, intro, ...rest] = content[slug][locale];
  return (
    <article className="container page legal">
      <p className="eyebrow">OOFCOURSE / {slug.toUpperCase()}</p>
      <h1 className="page-title">{title}</h1>
      <p className="page-intro">{intro}</p>
      {Array.from({ length: rest.length / 2 }, (_, i) => (
        <section key={i}>
          <h2>{rest[i * 2]}</h2>
          <p>{rest[i * 2 + 1]}</p>
        </section>
      ))}
    </article>
  );
}
