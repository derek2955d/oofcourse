"use client";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Listing, CategoryKey } from "@/lib/catalog";
import { categoryData } from "@/lib/catalog";
import { CategoryIcon } from "./icons";
export function ImageGallery({
  images,
  title,
  category,
  preview = false,
}: {
  images: Listing["images"];
  title: string;
  category: CategoryKey;
  preview?: boolean;
}) {
  const [current, setCurrent] = useState(0),
    t = useTranslations();
  return (
    <>
      <div
        className="gallery"
        style={{ background: categoryData[category].background }}
      >
        {images.length ? (
          <Image
            src={images[current]?.url || images[0].url}
            alt={images[current]?.alt || title}
            fill
            sizes="(max-width:760px) 90vw, 60vw"
            unoptimized
          />
        ) : (
          <div
            className="preview-art"
            style={{ color: categoryData[category].color }}
          >
            <CategoryIcon category={category} size={120} />
          </div>
        )}
        <span className="gallery-caption">
          {preview
            ? t("previewGallery")
            : images.length
              ? `${current + 1} / ${images.length}`
              : t("noPhotos")}
        </span>
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((m, i) => (
            <button
              key={m.id}
              aria-label={`${i + 1}: ${m.alt || title}`}
              aria-pressed={current === i}
              onClick={() => setCurrent(i)}
            >
              <Image src={m.url} alt="" width={90} height={65} unoptimized />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
