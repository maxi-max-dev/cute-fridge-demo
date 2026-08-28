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
  assert.match(source, /自己定制/);
  assert.match(source, /自定义食材名称/);
  assert.match(source, /确认到期日/);
});

test("supports fruit, lamb, custom visuals, and swipe-to-discard expired food", async () => {
  const source = await readFile(new URL("../app/FridgeDemo.tsx", import.meta.url), "utf8");
  assert.match(source, /category: "水果", name: "苹果"/);
  assert.match(source, /category: "肉禽", name: "羊肉"/);
  assert.match(source, /拍照或从相册选择/);
  assert.match(source, /食材图标/);
  assert.match(source, /已过期.*天/);
  assert.match(source, /SwipeFoodCard/);
  assert.match(source, /左滑，或拖动整张卡片/);
  assert.match(source, /setInventory\(\(current\) => current\.filter/);
});

test("supports dragging a whole food card into the bottom-right trash corner", async () => {
  const source = await readFile(new URL("../app/FridgeDemo.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /corner-trash/);
  assert.match(source, /food-drag-ghost/);
  assert.match(source, /createPortal/);
  assert.match(source, /拖动整张卡片到右下角/);
  assert.match(source, /isOverTrash/);
  assert.match(source, /window\.addEventListener\("pointermove"/);
  assert.match(source, /onDragEnd\(item, upEvent\.clientX, upEvent\.clientY\)/);
  assert.match(styles, /\.corner-trash/);
  assert.match(styles, /position: fixed/);
  assert.match(styles, /\.corner-trash\.drop-hot/);
});

test("loads current weather from IP geolocation with a visible fallback", async () => {
  const source = await readFile(new URL("../app/FridgeDemo.tsx", import.meta.url), "utf8");
  assert.match(source, /https:\/\/ipwho\.is\//);
  assert.match(source, /https:\/\/api\.open-meteo\.com\/v1\/forecast/);
  assert.match(source, /current.*temperature_2m,weather_code/);
  assert.match(source, /根据当前网络 IP 粗定位/);
  assert.match(source, /天气待更新/);
});
