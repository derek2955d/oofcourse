import { Information } from "@/components/information";
import { getLocale } from "@/lib/i18n/server";
import { infoContent } from "@/lib/i18n/content";
import { metadata } from "@/lib/seo";
export async function generateMetadata() {
  const c = infoContent("terms", await getLocale());
  return metadata(c.title, c.intro, "/terms");
}
export default async function Page() {
  const c = infoContent("terms", await getLocale());
  return (
    <Information eyebrow="OofCourse" title={c.title}>
      <p>{c.intro}</p>
      {c.sections.map((s) => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          <p>{s.text}</p>
        </section>
      ))}
    </Information>
  );
}
