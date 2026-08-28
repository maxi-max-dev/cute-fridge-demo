"use client";

import { useEffect, useMemo, useState } from "react";

type Storage = "冷藏" | "冷冻";
type Tab = "today" | "fridge" | "recipes" | "shopping";

type Ingredient = {
  id: number;
  name: string;
  emoji: string;
  qty: number;
  unit: string;
  days: number;
  storage: Storage;
  addedAt: string;
};

type Recipe = {
  id: number;
  name: string;
  emoji: string;
  time: number;
  difficulty: "简单" | "容易" | "进阶";
  ingredients: string[];
  main: string[];
  steps: string[];
  color: string;
};

const initialInventory: Ingredient[] = [
  { id: 1, name: "青菜", emoji: "🥬", qty: 1, unit: "把", days: 1, storage: "冷藏", addedAt: "今天 08:20" },
  { id: 2, name: "番茄", emoji: "🍅", qty: 3, unit: "个", days: 2, storage: "冷藏", addedAt: "昨天 19:10" },
  { id: 3, name: "蘑菇", emoji: "🍄", qty: 5, unit: "朵", days: 3, storage: "冷藏", addedAt: "昨天 19:12" },
  { id: 4, name: "豆腐", emoji: "◻️", qty: 1, unit: "盒", days: 4, storage: "冷藏", addedAt: "8月26日" },
  { id: 5, name: "酸奶", emoji: "🥛", qty: 2, unit: "杯", days: 5, storage: "冷藏", addedAt: "8月25日" },
  { id: 6, name: "鸡蛋", emoji: "🥚", qty: 6, unit: "枚", days: 8, storage: "冷藏", addedAt: "8月24日" },
  { id: 7, name: "洋葱", emoji: "🧅", qty: 2, unit: "个", days: 12, storage: "冷藏", addedAt: "8月23日" },
  { id: 8, name: "牛肉", emoji: "🥩", qty: 2, unit: "份", days: 18, storage: "冷冻", addedAt: "8月20日" },
  { id: 9, name: "虾仁", emoji: "🍤", qty: 1, unit: "袋", days: 24, storage: "冷冻", addedAt: "8月18日" },
  { id: 10, name: "水饺", emoji: "🥟", qty: 1, unit: "袋", days: 38, storage: "冷冻", addedAt: "8月10日" },
];

const recipes: Recipe[] = [
  { id: 1, name: "牛肉炒青菜", emoji: "🥘", time: 18, difficulty: "容易", ingredients: ["牛肉", "青菜", "蒜"], main: ["牛肉", "青菜"], steps: ["牛肉解冻后切片，少许盐腌 5 分钟", "热锅炒香蒜末，下牛肉快速翻炒", "加入青菜，大火翻炒 2 分钟即可"], color: "#E9F2CF" },
  { id: 2, name: "番茄炒鸡蛋", emoji: "🍳", time: 12, difficulty: "简单", ingredients: ["番茄", "鸡蛋", "小葱"], main: ["番茄", "鸡蛋"], steps: ["番茄切块，鸡蛋打散", "先将鸡蛋炒至蓬松盛出", "炒软番茄，倒回鸡蛋，撒小葱"], color: "#FFE0C0" },
  { id: 3, name: "香煎蘑菇豆腐", emoji: "🍲", time: 15, difficulty: "简单", ingredients: ["蘑菇", "豆腐"], main: ["蘑菇", "豆腐"], steps: ["豆腐切厚片，吸干表面水分", "小火煎至两面金黄", "加入蘑菇和一勺生抽，焖 3 分钟"], color: "#F1E1C5" },
  { id: 4, name: "番茄虾仁烩饭", emoji: "🍛", time: 25, difficulty: "容易", ingredients: ["番茄", "虾仁", "米饭"], main: ["番茄", "虾仁"], steps: ["虾仁解冻，番茄切丁", "炒出番茄汁后加入虾仁", "倒入米饭翻炒均匀"], color: "#FFD8CC" },
  { id: 5, name: "洋葱牛肉盖饭", emoji: "🍚", time: 22, difficulty: "容易", ingredients: ["洋葱", "牛肉", "米饭", "生抽"], main: ["洋葱", "牛肉"], steps: ["洋葱切丝，牛肉解冻切片", "炒软洋葱后加入牛肉", "调味后盖在热米饭上"], color: "#F1D8BC" },
  { id: 6, name: "酸奶水果碗", emoji: "🥣", time: 5, difficulty: "简单", ingredients: ["酸奶", "香蕉"], main: ["酸奶"], steps: ["酸奶倒入碗中", "香蕉切片铺在表面", "有坚果的话可以撒一小把"], color: "#E7E6FA" },
];

const quickItems = [
  { name: "番茄", emoji: "🍅", unit: "个", chilled: 5, frozen: 30 },
  { name: "鸡蛋", emoji: "🥚", unit: "枚", chilled: 14, frozen: 30 },
  { name: "青菜", emoji: "🥬", unit: "把", chilled: 3, frozen: 14 },
  { name: "牛肉", emoji: "🥩", unit: "份", chilled: 2, frozen: 30 },
  { name: "豆腐", emoji: "◻️", unit: "盒", chilled: 5, frozen: 20 },
  { name: "蘑菇", emoji: "🍄", unit: "盒", chilled: 5, frozen: 21 },
];

const tabLabels: Record<Tab, string> = {
  today: "今天",
  fridge: "我的冰箱",
  recipes: "菜谱",
  shopping: "购物清单",
};

function inventoryStatus(days: number) {
  if (days <= 2) return { tone: "danger", label: days <= 0 ? "今天到期" : `剩 ${days} 天` };
  if (days <= 5) return { tone: "warning", label: `剩 ${days} 天` };
  return { tone: "safe", label: `剩 ${days} 天` };
}

function missingFor(recipe: Recipe, inventory: Ingredient[]) {
  const names = new Set(inventory.filter((item) => item.qty > 0).map((item) => item.name));
  return recipe.ingredients.filter((name) => !names.has(name));
}

function scoreRecipe(recipe: Recipe, inventory: Ingredient[]) {
  const names = new Set(inventory.filter((item) => item.qty > 0).map((item) => item.name));
  const missing = missingFor(recipe, inventory).length;
  const mainReady = recipe.main.every((name) => names.has(name));
  const expiring = inventory.filter((item) => item.days <= 3 && recipe.ingredients.includes(item.name)).length;
  return expiring * 8 + (mainReady ? 7 : 0) + (missing === 0 ? 5 : missing <= 2 ? 3 - missing : -5);
}

function recipeReason(recipe: Recipe, inventory: Ingredient[]) {
  const urgent = inventory.find((item) => item.days <= 3 && recipe.ingredients.includes(item.name));
  const missing = missingFor(recipe, inventory);
  if (urgent && missing.length === 0) return `先用掉只剩 ${urgent.days} 天的${urgent.name}，食材全齐`;
  if (urgent) return `先用掉只剩 ${urgent.days} 天的${urgent.name}，主料已齐`;
  if (missing.length === 0) return "食材全齐，现在就能开火";
  return `主料齐全，只需补 ${missing.length} 样`;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [inventory, setInventory] = useState<Ingredient[]>(initialInventory);
  const [fridgeZone, setFridgeZone] = useState<Storage | null>(null);
  const [recommendationIndex, setRecommendationIndex] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shopping, setShopping] = useState<string[]>([]);
  const [quickOpen, setQuickOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [consumed, setConsumed] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [quickChoice, setQuickChoice] = useState(quickItems[0]);
  const [quickStorage, setQuickStorage] = useState<Storage>("冷藏");
  const [quickDays, setQuickDays] = useState(quickItems[0].chilled);
  const [addedCount, setAddedCount] = useState(0);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const rankedRecipes = useMemo(
    () => [...recipes].sort((a, b) => scoreRecipe(b, inventory) - scoreRecipe(a, inventory)),
    [inventory],
  );
  const recommended = rankedRecipes[recommendationIndex % rankedRecipes.length];
  const urgent = inventory.filter((item) => item.days <= 3).sort((a, b) => a.days - b.days);
  const readyRecipes = recipes.filter((recipe) => missingFor(recipe, inventory).length === 0);
  const almostRecipes = recipes.filter((recipe) => {
    const count = missingFor(recipe, inventory).length;
    return count >= 1 && count <= 2;
  });
  const cleanupRecipes = [...recipes]
    .filter((recipe) => inventory.some((item) => item.days <= 3 && recipe.ingredients.includes(item.name)))
    .sort((a, b) => scoreRecipe(b, inventory) - scoreRecipe(a, inventory));

  function showToast(message: string) {
    setToast(message);
  }

  function openRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setCompletionOpen(false);
  }

  function addShopping(items: string[]) {
    const newItems = items.filter((item) => !shopping.includes(item));
    setShopping((current) => Array.from(new Set([...current, ...items])));
    showToast(newItems.length ? `已加入 ${newItems.join("、")}` : "购物清单里已经有啦");
  }

  function beginCooking(recipe: Recipe) {
    const available = recipe.ingredients.filter((name) => inventory.some((item) => item.name === name && item.qty > 0));
    setConsumed(available);
    setSelectedRecipe(recipe);
    setCompletionOpen(true);
  }

  function finishCooking() {
    setInventory((current) => current
      .map((item) => consumed.includes(item.name) ? { ...item, qty: item.qty - 1 } : item)
      .filter((item) => item.qty > 0));
    setCompletionOpen(false);
    setSelectedRecipe(null);
    setRecommendationIndex(0);
    showToast("库存已更新，开饭啦！");
  }

  function chooseQuick(item: typeof quickItems[number]) {
    setQuickChoice(item);
    setQuickDays(quickStorage === "冷藏" ? item.chilled : item.frozen);
  }

  function changeStorage(storage: Storage) {
    setQuickStorage(storage);
    setQuickDays(storage === "冷藏" ? quickChoice.chilled : quickChoice.frozen);
  }

  function addQuickItem() {
    const now = new Date();
    const time = `今天 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setInventory((current) => {
      const same = current.find((item) => item.name === quickChoice.name && item.storage === quickStorage);
      if (same) return current.map((item) => item.id === same.id ? { ...item, qty: item.qty + 1, days: quickDays, addedAt: time } : item);
      return [...current, { id: Date.now(), name: quickChoice.name, emoji: quickChoice.emoji, qty: 1, unit: quickChoice.unit, days: quickDays, storage: quickStorage, addedAt: time }];
    });
    setAddedCount((count) => count + 1);
    showToast(`${quickChoice.name}已放进${quickStorage}区`);
  }

  function navigate(next: Tab) {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="phone-frame" aria-label="冰箱今天吃什么 Demo">
        <header className="topbar">
          <button className="brand" onClick={() => navigate("today")} aria-label="返回今天首页">
            <span className="brand-mark">冰</span>
            <span><strong>冰箱今天吃什么</strong><small>{tabLabels[tab]}</small></span>
          </button>
          <button className="round-action" onClick={() => navigate("shopping")} aria-label={`购物清单，${shopping.length} 项`}>
            🧺
            {shopping.length > 0 && <span className="badge">{shopping.length}</span>}
          </button>
        </header>

        <div className="screen" key={tab}>
          {tab === "today" && (
            <TodayView
              urgent={urgent}
              readyCount={readyRecipes.length}
              inventoryCount={inventory.reduce((sum, item) => sum + item.qty, 0)}
              recommended={recommended}
              missing={missingFor(recommended, inventory)}
              reason={recipeReason(recommended, inventory)}
              onSwap={() => { setRecommendationIndex((index) => (index + 1) % rankedRecipes.length); showToast("换好啦，按临期与缺料重新挑选"); }}
              onOpen={() => openRecipe(recommended)}
              onFridge={() => navigate("fridge")}
              onRecipes={() => navigate("recipes")}
            />
          )}

          {tab === "fridge" && (
            <FridgeView
              inventory={inventory}
              zone={fridgeZone}
              setZone={setFridgeZone}
              onQuick={() => setQuickOpen(true)}
            />
          )}

          {tab === "recipes" && (
            <RecipesView
              inventory={inventory}
              ready={readyRecipes}
              almost={almostRecipes}
              cleanup={cleanupRecipes}
              onOpen={openRecipe}
            />
          )}

          {tab === "shopping" && (
            <ShoppingView shopping={shopping} setShopping={setShopping} onRecipes={() => navigate("recipes")} />
          )}
        </div>

        <nav className="bottom-nav" aria-label="主要导航">
          <NavButton active={tab === "today"} icon="⌂" label="今天" onClick={() => navigate("today")} />
          <NavButton active={tab === "fridge"} icon="▦" label="冰箱" onClick={() => navigate("fridge")} />
          <button className="add-main" onClick={() => setQuickOpen(true)} aria-label="快速入库"><span>＋</span><small>入库</small></button>
          <NavButton active={tab === "recipes"} icon="♨" label="菜谱" onClick={() => navigate("recipes")} />
          <NavButton active={tab === "shopping"} icon="✓" label="清单" onClick={() => navigate("shopping")} />
        </nav>
      </section>

      {selectedRecipe && !completionOpen && (
        <RecipeSheet
          recipe={selectedRecipe}
          inventory={inventory}
          onClose={() => setSelectedRecipe(null)}
          onAdd={addShopping}
          onCook={() => beginCooking(selectedRecipe)}
        />
      )}

      {completionOpen && selectedRecipe && (
        <CompletionSheet
          recipe={selectedRecipe}
          inventory={inventory}
          consumed={consumed}
          setConsumed={setConsumed}
          onClose={() => setCompletionOpen(false)}
          onFinish={finishCooking}
        />
      )}

      {quickOpen && (
        <QuickAddSheet
          choice={quickChoice}
          storage={quickStorage}
          days={quickDays}
          addedCount={addedCount}
          onChoose={chooseQuick}
          onStorage={changeStorage}
          onDays={setQuickDays}
          onAdd={addQuickItem}
          onClose={() => { setQuickOpen(false); setAddedCount(0); }}
        />
      )}

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}

function TodayView({ urgent, readyCount, inventoryCount, recommended, missing, reason, onSwap, onOpen, onFridge, onRecipes }: {
  urgent: Ingredient[]; readyCount: number; inventoryCount: number; recommended: Recipe; missing: string[]; reason: string;
  onSwap: () => void; onOpen: () => void; onFridge: () => void; onRecipes: () => void;
}) {
  return (
    <div className="view today-view">
      <div className="date-line"><span>8月28日 · 周五</span><span className="weather">布里斯班 22°</span></div>
      <section className="greeting">
        <div>
          <p className="eyebrow">晚饭不用猜</p>
          <h1>先救这把<br /><em>小青菜</em></h1>
          <p>它只剩 1 天，今晚安排刚刚好。</p>
        </div>
        <button className="sticker-hero" onClick={onFridge} aria-label="查看临期食材">
          <span className="spark spark-a">✦</span><span className="hero-veg">🥬</span><span className="spark spark-b">·</span>
          <b>救救我</b>
        </button>
      </section>

      <section className="quick-summary" aria-label="今日冰箱概览">
        <button onClick={onFridge}><strong>{urgent.length}</strong><span>样快过期</span><i className="red-dot" /></button>
        <div className="summary-rule" />
        <button onClick={onRecipes}><strong>{readyCount}</strong><span>道马上能做</span></button>
        <div className="summary-rule" />
        <button onClick={onFridge}><strong>{inventoryCount}</strong><span>件食材在家</span></button>
      </section>

      <div className="section-title">
        <div><span className="pin-dot" /><h2>今天推荐</h2></div>
        <button className="text-button" onClick={onSwap}>↻ 换一道</button>
      </div>

      <article className="recommend-card">
        <div className="recipe-art" style={{ background: recommended.color }}>
          <span className="plate-shadow" /><span className="dish-emoji">{recommended.emoji}</span>
          <span className="tape">今日签</span>
          <span className="reason-pill">✨ {reason}</span>
        </div>
        <div className="recommend-content">
          <div className="recipe-heading"><div><h3>{recommended.name}</h3><p>{recommended.time} 分钟 · {recommended.difficulty}</p></div><span className="match">{missing.length === 0 ? "食材全齐" : `只缺 ${missing.length} 样`}</span></div>
          <div className="ingredient-row">
            {recommended.ingredients.map((name) => <span key={name} className={missing.includes(name) ? "is-missing" : "is-ready"}>{missing.includes(name) ? "＋" : "✓"} {name}</span>)}
          </div>
          <button className="primary-button" onClick={onOpen}>看看怎么做 <span>→</span></button>
        </div>
      </article>

      <section className="urgent-list">
        <div className="section-title compact"><div><span className="pin-dot tomato" /><h2>抓紧吃掉</h2></div><button className="text-button" onClick={onFridge}>看冰箱 →</button></div>
        <div className="urgent-strip">
          {urgent.slice(0, 3).map((item) => (
            <button key={item.id} className="urgent-item" onClick={onRecipes}>
              <span className="mini-sticker">{item.emoji}</span><span><strong>{item.name}</strong><small>{item.qty}{item.unit}</small></span><b>{item.days === 1 ? "明天到期" : `剩${item.days}天`}</b>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function FridgeView({ inventory, zone, setZone, onQuick }: { inventory: Ingredient[]; zone: Storage | null; setZone: (zone: Storage | null) => void; onQuick: () => void }) {
  const chilled = inventory.filter((item) => item.storage === "冷藏").sort((a, b) => a.days - b.days);
  const frozen = inventory.filter((item) => item.storage === "冷冻").sort((a, b) => a.days - b.days);
  const totalCount = inventory.reduce((sum, item) => sum + item.qty, 0);

  function toggleZone(next: Storage) {
    setZone(zone === next ? null : next);
  }

  return (
    <div className="view fridge-view">
      <div className="view-intro"><div><p className="eyebrow">家里现有</p><h1>我的冰箱</h1><p>{totalCount} 件食材。拉开门，看看今天先吃什么。</p></div><button className="mini-add" onClick={onQuick}>＋ 快速入库</button></div>

      <div className={`physical-fridge ${zone ? "door-is-open" : ""}`} aria-label="可打开的冰箱">
        <div className="fridge-crown">
          <span className="fridge-maker">MORI</span>
          <i className="power-light" />
        </div>

        <FridgeCompartment
          storage="冷藏"
          items={chilled}
          open={zone === "冷藏"}
          onToggle={() => toggleZone("冷藏")}
        />

        <div className="fridge-divider"><span /></div>

        <FridgeCompartment
          storage="冷冻"
          items={frozen}
          open={zone === "冷冻"}
          onToggle={() => toggleZone("冷冻")}
        />

        <div className="fridge-feet"><i /><i /></div>
      </div>

      <p className="fridge-instruction">
        <span>{zone ? "↩" : "☝"}</span>
        {zone ? `${zone}门已打开，点“关门”或拉开另一扇门` : "点门板或把手，打开看看"}
      </p>
      <div className="legend"><span><i className="safe" />新鲜</span><span><i className="warning" />尽快吃</span><span><i className="danger" />快过期</span></div>
    </div>
  );
}

function FridgeCompartment({ storage, items, open, onToggle }: { storage: Storage; items: Ingredient[]; open: boolean; onToggle: () => void }) {
  const urgentCount = items.filter((item) => item.days <= 3).length;
  const isChilled = storage === "冷藏";

  return (
    <section className={`fridge-compartment ${isChilled ? "chilled-compartment" : "frozen-compartment"} ${open ? "is-open" : ""}`} aria-label={`${storage}区`}>
      <div className="fridge-interior">
        <div className="interior-heading">
          <span><i>{isChilled ? "❄" : "✣"}</i><strong>{storage}区</strong><small>{items.length} 样</small></span>
          <button onClick={onToggle} aria-label={`关闭${storage}区`}>关门 ×</button>
        </div>
        {isChilled && <span className="interior-light" />}
        <div className="interior-food-grid">
          {items.map((item) => {
            const status = inventoryStatus(item.days);
            return (
              <article className={`shelf-food ${status.tone}`} key={item.id}>
                <span className="shelf-food-emoji">{item.emoji}</span>
                <strong>{item.name}</strong>
                <small>{item.qty}{item.unit}</small>
                <b>{status.label}</b>
              </article>
            );
          })}
        </div>
        <div className="glass-shelves"><i /><i />{isChilled && <i />}</div>
        {!items.length && <div className="empty-compartment"><span>🧊</span><p>这里空出来了</p></div>}
      </div>

      <button className="fridge-door" onClick={onToggle} aria-expanded={open} aria-label={`${open ? "关闭" : "打开"}${storage}区，${items.length}样食材`}>
        <span className="door-sheen" />
        <span className="door-copy">
          <small>{isChilled ? "FRESH" : "FREEZER"}</small>
          <strong>{storage}区</strong>
          <i>{items.length} 样食材</i>
        </span>
        {isChilled ? (
          <>
            <span className="door-magnet magnet-tomato">🍅</span>
            <span className="door-magnet magnet-egg">🥚</span>
            <span className="door-note"><b>{urgentCount || "✓"}</b><small>{urgentCount ? "样要先吃" : "状态很好"}</small></span>
          </>
        ) : (
          <span className="freezer-snow">✦ <i>❄</i> ·</span>
        )}
        <span className="fridge-handle"><i /><b>拉开</b></span>
      </button>
    </section>
  );
}

function RecipesView({ inventory, ready, almost, cleanup, onOpen }: { inventory: Ingredient[]; ready: Recipe[]; almost: Recipe[]; cleanup: Recipe[]; onOpen: (recipe: Recipe) => void }) {
  const [filter, setFilter] = useState<"ready" | "almost" | "cleanup">("ready");
  const groups = { ready, almost, cleanup };
  const list = groups[filter];
  return (
    <div className="view recipes-view">
      <div className="view-intro"><div><p className="eyebrow">按冰箱来做</p><h1>今晚菜单</h1><p>不用翻库存，能不能做一眼看懂。</p></div><span className="book-sticker">🍳<i>MENU</i></span></div>
      <div className="recipe-filters" role="tablist" aria-label="菜谱分类">
        <button className={filter === "ready" ? "active" : ""} onClick={() => setFilter("ready")}><span>马上能做</span><b>{ready.length}</b></button>
        <button className={filter === "almost" ? "active" : ""} onClick={() => setFilter("almost")}><span>只缺1–2样</span><b>{almost.length}</b></button>
        <button className={filter === "cleanup" ? "active" : ""} onClick={() => setFilter("cleanup")}><span>优先清理临期</span><b>{cleanup.length}</b></button>
      </div>
      <div className="recipe-list">
        {list.map((recipe, index) => {
          const missing = missingFor(recipe, inventory);
          const available = recipe.ingredients.filter((name) => !missing.includes(name));
          return (
            <button className="recipe-list-card" onClick={() => onOpen(recipe)} key={recipe.id}>
              <span className="list-art" style={{ background: recipe.color }}><i>{recipe.emoji}</i>{index === 0 && filter === "cleanup" && <b>先吃我</b>}</span>
              <span className="list-copy">
                <span className="list-heading"><strong>{recipe.name}</strong><i>→</i></span>
                <span className="meta-line">⏱ {recipe.time} 分钟 · {recipe.difficulty}</span>
                <span className="availability"><em className="have">已有 {available.length} 样</em>{missing.length > 0 ? <em className="lack">缺 {missing.join("、")}</em> : <em className="complete">食材全齐</em>}</span>
              </span>
            </button>
          );
        })}
        {list.length === 0 && <div className="empty-state"><span>🍽️</span><h3>这一栏暂时空着</h3><p>补几样食材，就会有新菜出现。</p></div>}
      </div>
    </div>
  );
}

function ShoppingView({ shopping, setShopping, onRecipes }: { shopping: string[]; setShopping: React.Dispatch<React.SetStateAction<string[]>>; onRecipes: () => void }) {
  const [checked, setChecked] = useState<string[]>([]);
  function toggle(item: string) { setChecked((current) => current.includes(item) ? current.filter((name) => name !== item) : [...current, item]); }
  function clearBought() { setShopping((current) => current.filter((item) => !checked.includes(item))); setChecked([]); }
  return (
    <div className="view shopping-view">
      <div className="view-intro"><div><p className="eyebrow">顺路买一点</p><h1>购物清单</h1><p>{shopping.length ? `还要买 ${shopping.length} 样，买齐就能多做几道菜。` : "缺料会从菜谱一键来到这里。"}</p></div><span className="bag-sticker">🧺</span></div>
      {shopping.length > 0 ? (
        <>
          <div className="paper-list">
            <div className="paper-tape" />
            {shopping.map((item) => <button key={item} className={checked.includes(item) ? "checked" : ""} onClick={() => toggle(item)}><span className="check-circle">{checked.includes(item) ? "✓" : ""}</span><strong>{item}</strong><small>{checked.includes(item) ? "已买到" : "待购买"}</small></button>)}
          </div>
          <button className="primary-button shopping-clear" disabled={!checked.length} onClick={clearBought}>{checked.length ? `移除已买到的 ${checked.length} 样` : "先勾选已买到的食材"}</button>
        </>
      ) : (
        <div className="empty-state large"><span>📝</span><h3>清单还是空的</h3><p>去看看“只缺 1–2 样”的菜谱，缺料可以一键加入。</p><button className="primary-button" onClick={onRecipes}>去看菜谱 <span>→</span></button></div>
      )}
    </div>
  );
}

function RecipeSheet({ recipe, inventory, onClose, onAdd, onCook }: { recipe: Recipe; inventory: Ingredient[]; onClose: () => void; onAdd: (items: string[]) => void; onCook: () => void }) {
  const missing = missingFor(recipe, inventory);
  return (
    <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="sheet recipe-sheet" role="dialog" aria-modal="true" aria-labelledby="recipe-title">
        <div className="sheet-handle" />
        <button className="close-button" onClick={onClose} aria-label="关闭">×</button>
        <div className="detail-hero" style={{ background: recipe.color }}><span>{recipe.emoji}</span><i>今晚就吃这个</i></div>
        <div className="detail-copy">
          <p className="eyebrow">{recipe.time} 分钟 · {recipe.difficulty}</p>
          <h2 id="recipe-title">{recipe.name}</h2>
          <div className="detail-ingredients">
            {recipe.ingredients.map((name) => <span key={name} className={missing.includes(name) ? "missing" : "ready"}>{missing.includes(name) ? "＋" : "✓"}<b>{name}</b><small>{missing.includes(name) ? "缺少" : "家里有"}</small></span>)}
          </div>
          {missing.length > 0 && <button className="outline-button" onClick={() => onAdd(missing)}>🧺 把缺料加入购物清单</button>}
          <ol className="steps">{recipe.steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>
          <button className="primary-button cook-button" onClick={onCook}>{missing.length ? "就做这道（缺料可跳过）" : "开始做这道菜"} <span>→</span></button>
        </div>
      </section>
    </div>
  );
}

function CompletionSheet({ recipe, inventory, consumed, setConsumed, onClose, onFinish }: { recipe: Recipe; inventory: Ingredient[]; consumed: string[]; setConsumed: React.Dispatch<React.SetStateAction<string[]>>; onClose: () => void; onFinish: () => void }) {
  const available = recipe.ingredients.filter((name) => inventory.some((item) => item.name === name));
  return (
    <div className="overlay">
      <section className="sheet completion-sheet" role="dialog" aria-modal="true" aria-labelledby="completion-title">
        <div className="sheet-handle" /><button className="close-button" onClick={onClose} aria-label="返回">←</button>
        <div className="finish-sticker">😋<span>光盘！</span></div>
        <p className="eyebrow">做完了</p><h2 id="completion-title">确认用掉的食材</h2><p className="sheet-lead">勾选后会各扣除 1 份，库存马上更新。</p>
        <div className="consume-list">
          {available.map((name) => {
            const item = inventory.find((food) => food.name === name)!;
            const active = consumed.includes(name);
            return <button key={name} className={active ? "active" : ""} onClick={() => setConsumed((current) => active ? current.filter((food) => food !== name) : [...current, name])}><span>{item.emoji}</span><strong>{name}</strong><small>现有 {item.qty}{item.unit}</small><i>{active ? "✓" : ""}</i></button>;
          })}
        </div>
        <button className="primary-button" disabled={!consumed.length} onClick={onFinish}>确认消耗 {consumed.length} 样食材</button>
      </section>
    </div>
  );
}

function QuickAddSheet({ choice, storage, days, addedCount, onChoose, onStorage, onDays, onAdd, onClose }: {
  choice: typeof quickItems[number]; storage: Storage; days: number; addedCount: number;
  onChoose: (item: typeof quickItems[number]) => void; onStorage: (storage: Storage) => void; onDays: (days: number) => void; onAdd: () => void; onClose: () => void;
}) {
  const expiry = new Date(); expiry.setDate(expiry.getDate() + days);
  const expiryText = `${expiry.getMonth() + 1}月${expiry.getDate()}日`;
  return (
    <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="sheet quick-sheet" role="dialog" aria-modal="true" aria-labelledby="quick-title">
        <div className="sheet-handle" /><button className="close-button" onClick={onClose} aria-label="关闭">×</button>
        <p className="eyebrow">不用填表</p><h2 id="quick-title">快速放进冰箱</h2><p className="sheet-lead">现在入库 · 可连续添加，默认日期随分区自动估算。</p>
        <div className="quick-grid">
          {quickItems.map((item) => <button key={item.name} className={choice.name === item.name ? "active" : ""} onClick={() => onChoose(item)}><span>{item.emoji}</span><b>{item.name}</b>{choice.name === item.name && <i>✓</i>}</button>)}
        </div>
        <div className="field-label"><span>放在哪里</span><small>参考保鲜期会跟着变</small></div>
        <div className="storage-switch">
          {(["冷藏", "冷冻"] as Storage[]).map((item) => <button key={item} className={storage === item ? "active" : ""} onClick={() => onStorage(item)}>{item === "冷藏" ? "❄" : "✣"} {item}区</button>)}
        </div>
        <div className="date-editor">
          <span><small>参考到期日</small><strong>{expiryText}</strong></span>
          <label><span>保鲜</span><input type="number" min="1" max="90" value={days} onChange={(event) => onDays(Math.max(1, Number(event.target.value)))} aria-label="保鲜天数" /><b>天</b></label>
        </div>
        <button className="primary-button" onClick={onAdd}>＋ 加入 {choice.name}{addedCount > 0 && <em>（本次已加 {addedCount} 件）</em>}</button>
        <button className="done-link" onClick={onClose}>完成入库</button>
      </section>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick} aria-current={active ? "page" : undefined}><span>{icon}</span><small>{label}</small></button>;
}
