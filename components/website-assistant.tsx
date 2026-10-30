"use client";
import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { prepareActivity, storeActivityDraft } from "@/app/actions/assistant";
import type { AssistantDraft } from "@/lib/assistant";
export function WebsiteAssistant({
  locale,
  configured,
  locations,
  imports,
  historyAvailable,
}: {
  locale: "en" | "zh";
  configured: boolean;
  locations: { id: string; name_en: string; name_zh: string }[];
  imports: {
    listing_id: string;
    source_url: string;
    event_day: string;
    created_at: string;
  }[];
  historyAvailable: boolean;
}) {
  const zh = locale === "zh";
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<AssistantDraft>();
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState<"en" | "zh">(locale);
  const [confirmed, setConfirmed] = useState(false);
  const [id, setId] = useState("");
  const [pending, start] = useTransition();
  function reset() {
    setDraft(undefined);
    setConfirmed(false);
    setId("");
    setError("");
  }
  const errors: Record<string, string> = {
    unconfigured: zh
      ? "尚未配置 AI 服务，不能生成。"
      : "AI service is not configured.",
    validation: zh
      ? "请检查网址和资料长度。"
      : "Check the URL and source text length.",
    evidence: zh
      ? "未能提取有原文证据的活动，请补充资料。"
      : "No activity with source evidence could be extracted.",
    past: zh
      ? "提取出的活动已经过期，请换一份资料。"
      : "The extracted activity has already ended.",
    provider: zh
      ? "AI 服务未完成请求，请稍后重试。"
      : "AI request failed. Try again later.",
    save: zh
      ? "草稿未保存，请检查第 11 份迁移、管理员权限和地区。"
      : "Draft was not saved. Check migration 011, admin access and location.",
    quota: zh
      ? "生成额度已用完，或第 11 份迁移尚未配置。"
      : "Generation limit reached or migration 011 is not configured.",
  };
  return (
    <div className="surface">
      <p>
        {zh
          ? "AI 整理资料，你审核后发布。草稿不会自动上线。"
          : "AI prepares content; you review and publish. Drafts stay private."}
      </p>
      <p role="status" style={{ margin: "16px 0" }}>
        {configured
          ? zh
            ? "AI 配置已提供，实际连接将在生成时验证。"
            : "AI configuration present; connection is checked on generation."
          : zh
            ? "AI 尚未启用：需要配置服务端密钥和模型。"
            : "AI is disabled: server-side credentials and a model are required."}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          setDraft(undefined);
          setId("");
          setConfirmed(false);
          start(async () => {
            try {
              const r = await prepareActivity({ url, text });
              if (r.draft) setDraft(r.draft);
              else setError(r.error || "provider");
            } catch {
              setError("provider");
            }
          });
        }}
      >
        <label className="field">
          {zh ? "活动来源网址（HTTPS）" : "Source URL (HTTPS)"}
          <input
            type="url"
            required
            maxLength={1500}
            value={url}
            disabled={pending}
            onChange={(e) => {
              setUrl(e.target.value);
              reset();
            }}
          />
        </label>
        <label className="field">
          {zh
            ? "粘贴公开活动资料（80–16,000 字符）"
            : "Paste public event information (80–16,000 characters)"}
          <textarea
            required
            minLength={80}
            maxLength={16000}
            rows={9}
            value={text}
            disabled={pending}
            onChange={(e) => {
              setText(e.target.value);
              reset();
            }}
          />
        </label>
        <p className="muted">
          {zh
            ? "仅提交公开资料，不要粘贴个人信息。生成时资料会发送给已配置的 AI 服务。网址用于记录来源，此版本不会自动抓取网页或下载图片。"
            : "Submit public information only, with no personal data. Generation sends it to the configured AI provider. URLs record attribution; this version does not fetch websites or download images."}
        </p>
        <button className="button primary" disabled={!configured || pending}>
          {pending
            ? zh
              ? "正在处理…"
              : "Working…"
            : zh
              ? "AI 整理活动"
              : "Prepare activity"}
        </button>
      </form>
      {error && (
        <p role="alert" className="field-error">
          {errors[error] ||
            (zh
              ? "请重新登录并确认管理员权限。"
              : "Sign in again and check administrator access.")}
        </p>
      )}
      {draft && (
        <section
          style={{ marginTop: 28 }}
          aria-label={zh ? "活动草稿预览" : "Activity draft preview"}
        >
          <h3>
            {zh
              ? "草稿预览 · 待人工核实"
              : "Draft preview · Needs verification"}
          </h3>
          <p>
            {zh ? "日期原文：" : "Date evidence: "}
            {draft.dateEvidence}
          </p>
          <p>
            {zh ? "地点原文：" : "Place evidence: "}
            {draft.placeEvidence}
          </p>
          <p>
            <time dateTime={draft.date}>{draft.date}</time>
          </p>
          {draft.warnings.length > 0 && (
            <ul>
              {draft.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
          {(["en", "zh"] as const).map((l) => (
            <div
              key={l}
              lang={l === "zh" ? "zh-CN" : "en-US"}
              style={{ margin: "20px 0" }}
            >
              <h4>{draft.title[l]}</h4>
              <p style={{ whiteSpace: "pre-wrap" }}>{draft.description[l]}</p>
            </div>
          ))}
          <label className="field">
            {zh ? "保存语言" : "Draft language"}
            <select
              value={language}
              disabled={pending || !!id}
              onChange={(e) => setLanguage(e.target.value as "en" | "zh")}
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </label>
          <label className="field">
            {zh ? "活动地区" : "Event location"}
            <select
              value={location}
              disabled={pending || !!id}
              onChange={(e) => {
                setLocation(e.target.value);
                setConfirmed(false);
              }}
            >
              <option value="">
                {zh ? "请选择实际地区" : "Choose the actual location"}
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {zh ? l.name_zh : l.name_en}
                </option>
              ))}
            </select>
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={pending || !!id}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            {zh
              ? "我已核对原文日期、地点和内容，保存为私有草稿。"
              : "I checked the source date, location and content. Save as a private draft."}
          </label>
          <button
            type="button"
            className="button primary"
            disabled={pending || !confirmed || !location || !!id}
            onClick={() =>
              start(async () => {
                setError("");
                try {
                  const r = await storeActivityDraft({
                    source: { url, text },
                    draft,
                    locale: language,
                    location,
                    confirmed,
                  });
                  if (r.id) setId(r.id);
                  else setError(r.error || "save");
                } catch {
                  setError("save");
                }
              })
            }
          >
            {pending
              ? zh
                ? "保存中…"
                : "Saving…"
              : zh
                ? "保存草稿"
                : "Save draft"}
          </button>
          {id && (
            <p role="status">
              {zh
                ? "已保存（重复来源将返回原草稿）。"
                : "Saved (duplicate sources return the existing draft)."}{" "}
              <Link href={`/post?id=${id}`} className="text-link">
                {zh
                  ? "打开草稿，编辑并提交审核"
                  : "Open draft, edit and submit for review"}
              </Link>
            </p>
          )}
        </section>
      )}
      <section style={{ marginTop: 28 }}>
        <h3>{zh ? "最近保存的活动" : "Recently saved activities"}</h3>
        {!historyAvailable ? (
          <p>
            {zh
              ? "来源记录未加载，请检查第 11 份迁移。"
              : "Source history unavailable. Check migration 011."}
          </p>
        ) : !imports.length ? (
          <p>{zh ? "暂无导入记录。" : "No imports yet."}</p>
        ) : (
          <ul>
            {imports.map((item) => (
              <li key={item.listing_id}>
                <time dateTime={item.event_day}>{item.event_day}</time>
                {" · "}
                <Link href={`/post?id=${item.listing_id}`}>
                  {zh ? "打开草稿" : "Open draft"}
                </Link>
                {" · "}
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {zh ? "查看来源" : "View source"}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p style={{ marginTop: 24 }}>
        <Link className="text-link" href="/admin/listings">
          {zh ? "前往内容审核与发布" : "Review and publish content"}
        </Link>
      </p>
    </div>
  );
}
