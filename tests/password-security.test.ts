import test from "node:test";
import assert from "node:assert/strict";
import {
  passwordChangeInput,
  hasRecentRecoveryAuthentication,
  verifiedPasswordUpdate,
  passwordUpdateError,
} from "../lib/password-security";

const input = {
  current_password: "old-private-test",
  password: "new-private-password",
  confirm_password: "new-private-password",
};

test("password updates require matching confirmation and a different sufficiently long password", () => {
  assert.equal(passwordChangeInput.safeParse(input).success, true);
  for (const invalid of [
    { ...input, confirm_password: "different-private" },
    { ...input, password: "short", confirm_password: "short" },
    {
      ...input,
      password: input.current_password,
      confirm_password: input.current_password,
    },
    { ...input, confirm_password: undefined },
    { ...input, current_password: "a".repeat(129) },
  ])
    assert.equal(passwordChangeInput.safeParse(invalid).success, false);
  const parsed = passwordChangeInput.parse({
    ...input,
    recoveryVerified: true,
    user_id: "other-user",
  });
  assert.equal("recoveryVerified" in parsed, false);
  assert.equal("user_id" in parsed, false);
});

test("recent recovery proof is bound to verified JWT identity, expiry, AMR type and timestamp", () => {
  const now = 10000;
  const valid = {
    sub: "member",
    exp: now + 3600,
    amr: [{ method: "otp", timestamp: now - 10 }],
  };
  assert.equal(hasRecentRecoveryAuthentication(valid, "member", now), true);
  assert.equal(
    hasRecentRecoveryAuthentication(
      { ...valid, amr: [{ method: "recovery", timestamp: now - 600 }] },
      "member",
      now,
    ),
    true,
  );
  for (const invalid of [
    { ...valid, sub: "other-member" },
    { ...valid, exp: now },
    { ...valid, amr: [{ method: "otp", timestamp: now - 601 }] },
    { ...valid, amr: [{ method: "otp", timestamp: now + 1 }] },
    { ...valid, amr: [{ method: "password", timestamp: now }] },
    { ...valid, amr: ["otp"] },
    { ...valid, amr: [{ method: "otp" }] },
    { sub: "member", recoveryVerified: true },
    null,
  ])
    assert.equal(
      hasRecentRecoveryAuthentication(invalid, "member", now),
      false,
    );
});

test("missing, incorrect or another member's current password never reaches password mutation", async () => {
  for (const [password, identity] of [
    ["", null],
    [input.current_password, null],
    [input.current_password, "other-member"],
  ] as const) {
    let mutations = 0;
    const result = await verifiedPasswordUpdate(
      { ...input, current_password: password },
      {
        userId: "member",
        recentRecovery: false,
        verifyCurrent: async () => identity,
        update: async () => {
          mutations++;
          return {};
        },
      },
    );
    assert.ok(result.error);
    assert.equal(mutations, 0);
  }
});

test("normal password changes verify the same identity before updating", async () => {
  const calls: string[] = [];
  const result = await verifiedPasswordUpdate(input, {
    userId: "member",
    recentRecovery: false,
    verifyCurrent: async (value) => {
      assert.equal(value, input.current_password);
      calls.push("verify");
      return "member";
    },
    update: async (value) => {
      assert.equal(value, input.password);
      calls.push("update");
      return {};
    },
  });
  assert.deepEqual(result, {});
  assert.deepEqual(calls, ["verify", "update"]);
});

test("only trusted recent recovery proof bypasses the old password and provider update errors remain errors", async () => {
  let verified = false;
  const result = await verifiedPasswordUpdate(
    { ...input, current_password: "" },
    {
      userId: "member",
      recentRecovery: true,
      verifyCurrent: async () => {
        verified = true;
        return null;
      },
      update: async () => ({ error: "passwordSecurity.updateFailed" }),
    },
  );
  assert.equal(verified, false);
  assert.equal(result.error, "passwordSecurity.updateFailed");
  const wrongEntered = await verifiedPasswordUpdate(input, {
    userId: "member",
    recentRecovery: true,
    verifyCurrent: async () => null,
    update: async () => {
      throw new Error(
        "An explicitly entered wrong password must not be ignored",
      );
    },
  });
  assert.equal(wrongEntered.error, "passwordSecurity.currentInvalid");
  const noIdentity = await verifiedPasswordUpdate(input, {
    userId: "",
    recentRecovery: true,
    verifyCurrent: async () => "member",
    update: async () => {
      throw new Error("Must not mutate without a member");
    },
  });
  assert.equal(noIdentity.error, "authRequired");
});

test("provider password errors map to safe actionable messages without echoing details", () => {
  assert.equal(
    passwordUpdateError("current_password_required"),
    "passwordSecurity.currentRequired",
  );
  assert.equal(
    passwordUpdateError("current_password_mismatch"),
    "passwordSecurity.currentInvalid",
  );
  assert.equal(
    passwordUpdateError("same_password"),
    "passwordSecurity.different",
  );
  assert.equal(passwordUpdateError("weak_password"), "passwordSecurity.weak");
  assert.equal(
    passwordUpdateError("unknown-provider-detail"),
    "passwordSecurity.updateFailed",
  );
});
