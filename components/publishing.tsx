"use client";
import { useSelectedState } from "./use-geography";
import { usStates } from "@/lib/geography";
import { useCatalogConfig } from "./catalog-provider";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  categoryKeys,
  categoryData,
  type CategoryKey,
  type Locale,
  type Listing,
} from "@/lib/catalog";
import { detailFields } from "@/lib/fields";
import { listingInput, draftInput } from "@/lib/validation";
import {
  saveListing,
  uploadListingPhoto,
  removeListingPhoto,
  reorderPhotos,
} from "@/app/actions/publishing";
import { compressPhoto } from "@/lib/images";
import { CategoryIcon } from "./icons";
type Values = z.input<typeof listingInput>;
const storageKey = "oofcourse:local-publishing:v2";
function initial(category: CategoryKey): Values {
  return {
    category,
    subcategory: categoryData[category].subtypes[0][0],
    location: "nyc",
    title: "",
    description: "",
    price: null,
    details: Object.fromEntries(
      detailFields[category].map((f) => [
        f.key,
        f.type === "number" ? 0 : f.options?.[0] || "",
      ]),
    ),
  };
}
export function PublishingWizard({
  connected,
  initialCategory = "housing",
  existing,
}: {
  connected: boolean;
  initialCategory?: CategoryKey;
  existing?: Listing;
}) {
  const { locations, locationStates, subtypes } = useCatalogConfig();
  const browseState = useSelectedState();
  const [postingState, setPostingState] = useState(
    existing ? locationStates[existing.location] || browseState : browseState,
  );
  const areaOptions = locations.filter(
    (x) => locationStates[x[0]] === postingState,
  );
  const t = useTranslations(),
    l = useLocale() as Locale;
  const [step, setStep] = useState(0),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [submitted, setSubmitted] = useState(false),
    [pending, start] = useTransition(),
    [photos, setPhotos] = useState<Listing["images"]>(existing?.images || []);
  const id = useRef(existing?.id),
    saving = useRef(false),
    blocking = useRef(false),
    inflight = useRef<Promise<Awaited<ReturnType<typeof saveListing>>> | null>(
      null,
    ),
    inputRef = useRef<HTMLInputElement>(null);
  const form = useForm<Values>({
    resolver: zodResolver(listingInput),
    defaultValues: existing
      ? {
          ...initial(existing.category),
          id: existing.id,
          category: existing.category,
          subcategory: existing.subcategory,
          location: existing.location,
          title: existing.title,
          description: existing.description,
          price: existing.price,
          details: existing.details,
        }
      : {
          ...initial(initialCategory),
          subcategory: subtypes[initialCategory][0]?.[0] || "",
          location: areaOptions.some((x) => x[0] === "nyc")
            ? "nyc"
            : areaOptions[0]?.[0] || "",
        },
  });
  const category = useWatch({ control: form.control, name: "category" });
  const formLocation = useWatch({ control: form.control, name: "location" });
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const unsub = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ ...values, id: id.current }),
          );
        } catch {
          /* Browser progress is optional; the account draft is the durable store. */
        }
        clearTimeout(timer);
        if (connected)
          timer = setTimeout(async () => {
            if (saving.current || blocking.current || submitted) return;
            saving.current = true;
            try {
              const request = saveListing(
                { ...form.getValues(), id: id.current },
                false,
              );
              inflight.current = request;
              const result = await request;
              if (result.id) {
                id.current = result.id;
                try {
                  localStorage.setItem(
                    storageKey,
                    JSON.stringify({ ...form.getValues(), id: result.id }),
                  );
                } catch {}
                setMessage("draftSaved");
              } else if (result.error) setError(result.error);
            } finally {
              saving.current = false;
              inflight.current = null;
            }
          }, 2000);
      },
    });
    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, [form, connected, submitted]);
  async function persist(submit = false) {
    if (submit) blocking.current = true;
    if (inflight.current) await inflight.current;
    saving.current = true;
    const request = saveListing(
      { ...form.getValues(), id: id.current },
      submit,
    );
    inflight.current = request;
    const result = await request;
    inflight.current = null;
    saving.current = false;
    if (result.error && submit) blocking.current = false;
    if (result.id) {
      id.current = result.id;
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...form.getValues(), id: result.id }),
        );
      } catch {}
      setMessage(result.success || "draftSaved");
      setError("");
      if (submit) {
        setSubmitted(true);
        try {
          localStorage.removeItem(storageKey);
        } catch {}
      }
      return result.id;
    }
    setError(result.error || "serverError");
    return null;
  }
  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    if (photos.length + files.length > 8) {
      setError("photoError");
      return;
    }
    start(async () => {
      const listingId = await persist(false);
      if (!listingId) return;
      const uploaded = [...photos];
      for (const file of Array.from(files)) {
        try {
          const data = new FormData();
          data.set("file", await compressPhoto(file));
          data.set("listing_id", listingId);
          const r = await uploadListingPhoto(data);
          if (r.error) {
            setError(r.error);
            break;
          }
          if (r.media) uploaded.push(r.media);
        } catch {
          setError("photoError");
          break;
        }
      }
      setPhotos(uploaded);
    });
  }
  async function move(from: number, to: number) {
    if (to < 0 || to >= photos.length || !id.current) return;
    const next = [...photos];
    next.splice(to, 0, next.splice(from, 1)[0]);
    start(async () => {
      const r = await reorderPhotos(
        id.current!,
        next.map((p) => p.id),
      );
      if (r.error) setError(r.error);
      else setPhotos(next.map((p, i) => ({ ...p, position: i })));
    });
  }
  if (submitted)
    return (
      <div className="surface centered">
        <Check size={42} color="#147B5E" />
        <h2>{t("submitted")}</h2>
        <p>{t("submissionHint")}</p>
        <Link href="/account/listings" className="button primary">
          {t("myListings")}
        </Link>
      </div>
    );
  return (
    <div className="wizard">
      <ol className="wizard-progress">
        {["chooseCategory", "fillDetails", "addPhotos", "reviewSubmit"].map(
          (key, i) => (
            <li key={key} aria-current={step === i ? "step" : undefined}>
              <span>{i + 1}</span>
              {t(key)}
            </li>
          ),
        )}
      </ol>
      <div className="surface">
        {existing?.status === "approved" && (
          <p className="notice">
            {l === "zh"
              ? "编辑后将退出公开展示，重新审核通过后恢复。"
              : "Editing removes this listing from public view until it is approved again."}
          </p>
        )}
        <p
          className="small-note"
          style={{ marginBottom: 20, color: "#64748B" }}
        >
          {t("localDraft")}
        </p>
        <div className="table-actions" style={{ marginBottom: 24 }}>
          <button
            className="button button-outline"
            onClick={() => {
              try {
                const parsed = draftInput.safeParse(
                  JSON.parse(localStorage.getItem(storageKey) || "null"),
                );
                if (parsed.success) {
                  form.reset(parsed.data);
                  setPostingState(
                    locationStates[parsed.data.location] || browseState,
                  );
                  id.current = parsed.data.id;
                  setMessage("savedSuccess");
                } else setError("validation");
              } catch {
                setError("validation");
              }
            }}
          >
            {t("restoreDraft")}
          </button>
          <button
            className="button button-outline"
            onClick={() => {
              try {
                localStorage.removeItem(storageKey);
                setMessage("savedSuccess");
              } catch {
                setError("serverError");
              }
            }}
          >
            {t("discardDraft")}
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {step === 0 ? (
            <div className="wizard-categories">
              {categoryKeys.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="wizard-category"
                  aria-pressed={category === c}
                  onClick={() => {
                    form.reset({
                      ...form.getValues(),
                      ...initial(c),
                      location: form.getValues("location"),
                      subcategory: subtypes[c][0]?.[0] || "",
                      title: form.getValues("title"),
                      description: form.getValues("description"),
                    });
                    setPhotos([]);
                    id.current = undefined;
                  }}
                >
                  <span
                    className="category-icon"
                    style={{
                      background: categoryData[c].background,
                      color: categoryData[c].color,
                    }}
                  >
                    <CategoryIcon category={c} />
                  </span>
                  {categoryData[c][l]}
                </button>
              ))}
            </div>
          ) : step === 1 ? (
            <>
              <h2 className="form-section-title">{t("fillDetails")}</h2>
              <p className="small-note" style={{ marginBottom: 20 }}>
                {t("requiredHint")}
              </p>
              <div className="form-grid">
                <label className="field form-wide">
                  {t("title")} *
                  <input maxLength={100} {...form.register("title")} />
                  {form.formState.errors.title && (
                    <small className="field-error">{t("titleInvalid")}</small>
                  )}
                </label>
                <label className="field">
                  {t("subcategory")} *
                  <select {...form.register("subcategory")}>
                    {subtypes[category].map(([s, en, zh]) => (
                      <option value={s} key={s}>
                        {l === "zh" ? zh : en}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  {t("geo.state")} *
                  <select
                    value={postingState}
                    onChange={(e) => {
                      const next = e.target.value;
                      setPostingState(next);
                      form.setValue("location", "", { shouldDirty: true });
                    }}
                  >
                    {usStates.map(([code, en, zh]) => (
                      <option key={code} value={code}>
                        {l === "zh" ? zh : en}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  {t("location")} *
                  <select {...form.register("location")} value={formLocation}>
                    <option value="">
                      {areaOptions.length ? t("location") : t("geo.noAreas")}
                    </option>
                    {areaOptions.map(([s, en, zh]) => (
                      <option value={s} key={s}>
                        {l === "zh" ? zh : en}
                      </option>
                    ))}
                  </select>
                </label>
                {category !== "jobs" && (
                  <label className="field">
                    {t("price")}
                    {["housing", "marketplace"].includes(category) ? " *" : ""}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register("price", {
                        setValueAs: (v) => (v === "" ? null : Number(v)),
                      })}
                    />
                  </label>
                )}
                {detailFields[category].map((f) => (
                  <label
                    className={`field ${f.type === "textarea" ? "form-wide" : ""}`}
                    key={`${category}-${f.key}`}
                  >
                    {t(f.key)}
                    {!f.optional ? " *" : ""}
                    {f.type === "select" ? (
                      <select {...form.register(`details.${f.key}`)}>
                        {f.options!.map((o) => (
                          <option key={o} value={o}>
                            {t(o)}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea
                        maxLength={1500}
                        {...form.register(`details.${f.key}`)}
                      />
                    ) : (
                      <input
                        type={f.type}
                        min={f.type === "number" ? 0 : undefined}
                        step={f.type === "number" ? "any" : undefined}
                        maxLength={500}
                        {...form.register(`details.${f.key}`, {
                          valueAsNumber: f.type === "number",
                        })}
                      />
                    )}
                  </label>
                ))}
                <label className="field form-wide">
                  {t("description")} *
                  <textarea
                    rows={7}
                    minLength={40}
                    maxLength={6000}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <small className="field-error">
                      {t("descriptionInvalid")}
                    </small>
                  )}
                </label>
              </div>
              <p className="notice">{t("contentSafety")}</p>
            </>
          ) : step === 2 ? (
            <>
              <h2 className="form-section-title">{t("addPhotos")}</h2>
              <div className="uploader">
                <Upload
                  size={28}
                  style={{ margin: "0 auto 12px", color: "#7B91AF" }}
                />
                <button
                  className="button button-outline"
                  type="button"
                  disabled={!connected || pending}
                  onClick={() => inputRef.current?.click()}
                >
                  {t("choosePhotos")}
                </button>
                <input
                  hidden
                  disabled={!connected || pending}
                  ref={inputRef}
                  aria-label={t("choosePhotos")}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => void addFiles(e.target.files)}
                />
                <p>{t("photoHint")}</p>
              </div>
              {!photos.length && (
                <p className="small-note" style={{ marginTop: 20 }}>
                  {t("noPhotos")}
                </p>
              )}
              <div className="photo-grid">
                {photos.map((p, i) => (
                  <div className="photo-tile" key={p.id}>
                    <Image
                      src={p.url}
                      alt={`${t("addPhotos")} ${i + 1}`}
                      width={220}
                      height={140}
                      unoptimized
                    />
                    <div className="photo-tools">
                      <button
                        type="button"
                        className="button button-outline"
                        disabled={i === 0 || pending}
                        onClick={() => void move(i, 0)}
                      >
                        {t(i === 0 ? "cover" : "setCover")}
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={t("moveEarlier")}
                        disabled={i === 0 || pending}
                        onClick={() => void move(i, i - 1)}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={t("moveLater")}
                        disabled={i === photos.length - 1 || pending}
                        onClick={() => void move(i, i + 1)}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={t("removePhoto")}
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const r = await removeListingPhoto(p.id);
                            if (r.error) setError(r.error);
                            else setPhotos(photos.filter((m) => m.id !== p.id));
                          })
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="form-section-title">{t("reviewSubmit")}</h2>
              <div className="form-preview">
                <p className="eyebrow">{categoryData[category][l]}</p>
                <h2>{form.getValues("title")}</h2>
                <p>{form.getValues("description")}</p>
                <small>{t("originalLanguage")}</small>
              </div>
              <label className="check-field">
                <input type="checkbox" name="confirmation" id="confirmation" />
                {t("reviewConsent")}
              </label>
              <p className="notice">{t("contentSafety")}</p>
            </>
          )}
        </form>
        {error && (
          <p className="notice error-notice" role="alert">
            {t(error)}
          </p>
        )}
        {message && (
          <p className="notice" role="status">
            {t(message)}
          </p>
        )}
        <div className="wizard-controls">
          <button
            className="button button-outline"
            disabled={step === 0 || pending}
            onClick={() => {
              setStep(step - 1);
              setError("");
            }}
          >
            <ArrowLeft size={16} />
            {t("back")}
          </button>
          <div>
            <button
              className="button button-outline"
              disabled={!connected || pending}
              onClick={() =>
                start(async () => {
                  await persist(false);
                })
              }
            >
              {t("saveDraft")}
            </button>
            {step < 3 ? (
              <button
                className="button primary"
                disabled={pending}
                onClick={async () => {
                  if (step === 1 && !(await form.trigger())) {
                    setError("validation");
                    return;
                  }
                  setError("");
                  setStep(step + 1);
                }}
              >
                {t("continue")}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="button primary"
                disabled={!connected || pending}
                onClick={() => {
                  if (
                    !(
                      document.getElementById(
                        "confirmation",
                      ) as HTMLInputElement
                    )?.checked
                  ) {
                    setError("validation");
                    return;
                  }
                  start(async () => {
                    await persist(true);
                  });
                }}
              >
                {t(pending ? "working" : "submitReview")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
