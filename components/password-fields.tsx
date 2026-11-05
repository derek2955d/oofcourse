import React from "react";

export function PasswordFields({
  requireCurrent,
  pending = false,
  labels,
}: {
  requireCurrent: boolean;
  pending?: boolean;
  labels: { current: string; next: string; confirm: string; hint: string };
}) {
  return (
    <>
      <p className="small-note">{labels.hint}</p>
      {requireCurrent && (
        <label className="field">
          {labels.current}
          <input
            name="current_password"
            type="password"
            autoComplete="current-password"
            minLength={1}
            maxLength={128}
            required
            disabled={pending}
          />
        </label>
      )}
      <label className="field">
        {labels.next}
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          disabled={pending}
        />
      </label>
      <label className="field">
        {labels.confirm}
        <input
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          disabled={pending}
        />
      </label>
    </>
  );
}
