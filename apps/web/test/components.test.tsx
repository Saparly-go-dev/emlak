import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { messages } from "../src/messages";
import { I18nProvider, translate, LanguageSelect } from "../src/i18n";
import { PropertyCard, Field } from "../src/components/ui";
import type { Property } from "@mekan/contracts";
test("all interface messages have three translations", () => {
  for (const [key, value] of Object.entries(messages)) {
    assert.equal(value.length, 3, key);
    assert.ok(
      value.every((text) => text.trim().length > 0),
      key,
    );
  }
  assert.equal(translate("properties", "ru"), "Недвижимость");
  assert.equal(translate("properties", "en"), "Properties");
  assert.equal(translate("properties", "tk"), "Emläkler");
});
test("property card renders safely with localized details", () => {
  const property: Property = {
    id: 1,
    version: 1,
    createdBy: 1,
    createdAt: "",
    updatedAt: "",
    title: "<script>alert(1)</script>",
    address: "Aşgabat",
    district: "Aşgabat",
    type: "apartment",
    dealType: "sale",
    currency: "TMT",
    rentPeriod: "month",
    price: 500000,
    area: 100,
    rooms: 3,
    notes: "",
    owner: "",
    phone: "",
    status: "available",
  };
  const html = renderToStaticMarkup(
    <I18nProvider>
      <PropertyCard property={property} onOpen={() => {}} />
    </I18nProvider>,
  );
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("Иллюстрация категории"));
  assert.ok(html.includes("TMT"));
});
test("language selector and form fields expose accessible names", () => {
  const html = renderToStaticMarkup(
    <I18nProvider>
      <LanguageSelect />
      <Field label="Email" name="email" type="email" required error />
    </I18nProvider>,
  );
  for (const language of ["Русский", "English", "Türkmençe"])
    assert.ok(html.includes(language));
  assert.ok(html.includes('aria-invalid="true"'));
  assert.ok(html.includes('type="email"'));
  assert.ok(html.includes("Проверьте значение поля."));
});
