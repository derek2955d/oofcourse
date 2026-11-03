import test from "node:test";
import assert from "node:assert/strict";
import { listingInput, optionalPriceValue } from "../lib/validation";

const announcement = {
  category: "community",
  subcategory: "announcements",
  location: "nyc",
  title: "Private price validation fixture",
  description:
    "A synthetic unit-test fixture only, never saved or published to a service.",
  details: { topic: "Validation fixture" },
};

test("an unspecified announcement price remains unknown, while explicit zero remains free", () => {
  for (const value of [null, undefined, "", "  "]) {
    const parsed = listingInput.parse({
      ...announcement,
      price: optionalPriceValue(value),
    });
    assert.equal(parsed.price, null);
  }
  for (const value of [0, "0"]) {
    assert.equal(
      listingInput.parse({ ...announcement, price: optionalPriceValue(value) })
        .price,
      0,
    );
  }
  assert.equal(
    listingInput.parse({ ...announcement, price: optionalPriceValue("19.95") })
      .price,
    19.95,
  );
});

test("blank price handling does not bypass required prices or accept malformed price values", () => {
  const marketplace = {
    ...announcement,
    category: "marketplace",
    subcategory: "furniture",
    details: { condition: "good", pickup: "Unit fixture" },
  };
  assert.equal(
    listingInput.safeParse({ ...marketplace, price: optionalPriceValue(null) })
      .success,
    false,
  );
  assert.equal(
    listingInput.safeParse({ ...marketplace, price: optionalPriceValue("0") })
      .success,
    true,
  );
  for (const value of [false, [], {}, "not a price", -1, Infinity]) {
    assert.equal(
      listingInput.safeParse({
        ...announcement,
        price: optionalPriceValue(value),
      }).success,
      false,
    );
  }
});
