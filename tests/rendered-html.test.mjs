import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the fridge decision assistant", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>冰箱今天吃什么｜冰箱决策助手<\/title>/);
  assert.match(html, /先救这把/);
  assert.match(html, /今天推荐/);
  assert.match(html, /快速入库/);
  assert.match(html, /购物清单/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
});

test("includes the physical openable fridge interaction", async () => {
  const source = await readFile(new URL("../app/FridgeDemo.tsx", import.meta.url), "utf8");
  assert.match(source, /可打开的冰箱/);
  assert.match(source, /打开.*区，.*样食材/);
  assert.match(source, /点门板或把手，打开看看/);
  assert.match(source, /fridge-compartment/);
  assert.match(source, /aria-expanded=\{open\}/);
});

test("quick add supports Chinese household categories and custom ingredients", async () => {
  const source = await readFile(new URL("../app/FridgeDemo.tsx", import.meta.url), "utf8");
  assert.match(source, /先选食材类别/);
  assert.match(source, /蔬菜.*肉禽.*蛋奶.*水产.*豆制品.*主食速冻/s);
  assert.match(source, /再选具体食材/);
  assert.match(source, /自己添加/);
  assert.match(source, /自定义食材名称/);
  assert.match(source, /确认到期日/);
});
