import { scoreOutfit, seasonOf } from '../scoring';
import { CATEGORY_SLOT, type ClothingItem, type Outfit, type Season } from '../../types';

export type Suggestion = {
  items: ClothingItem[];
  /** 保存用（Outfit.itemIds と同じ形） */
  itemIds: Outfit['itemIds'];
  score: number;
};

export const MAX_COMBINATIONS = 5000;
export const RECENT_DAYS = 3;
export const SUGGEST_COUNT = 3;

/** ローカル日付の YYYY-MM-DD */
export function dateKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 直近 RECENT_DAYS 日以内（今日を含む）に着用したアイテムの id */
export function recentlyWornItemIds(outfits: Outfit[], today: Date): Set<string> {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - RECENT_DAYS);
  const fromKey = dateKey(from);
  const ids = new Set<string>();
  for (const o of outfits) {
    if (!o.wornDates.some((d) => d >= fromKey)) continue;
    const { top, bottom, onepiece, outer, shoes, accessory } = o.itemIds;
    [top, bottom, onepiece, outer, shoes, ...(accessory ?? [])].forEach((id) => id && ids.add(id));
  }
  return ids;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 組み合わせ総数が上限を超えるとき、各部位の候補をランダムに間引く */
function limitCandidates(
  groups: ClothingItem[][],
  rng: () => number,
  /** 間引きから守る候補（お試しの服を含む組み合わせ）。守るものが残るよう、先にそれ以外を捨てる */
  protect: (c: ClothingItem) => boolean = () => false,
): ClothingItem[][] {
  const cur = groups.map((g) => [...g]);
  const product = () => cur.reduce((n, g) => n * Math.max(1, g.length), 1);
  while (product() > MAX_COMBINATIONS) {
    let widest = 0;
    cur.forEach((g, i) => {
      if (g.length > cur[widest].length) widest = i;
    });
    const g = shuffle(cur[widest], rng);
    const dropAt = g.findIndex((c) => !protect(c));
    g.splice(dropAt === -1 ? g.length - 1 : dropAt, 1);
    cur[widest] = g;
  }
  return cur;
}

/** 組み合わせの「主役」：トップス・ボトムス・ワンピースと、お試しの服 */
function keyIds(items: ClothingItem[]): string[] {
  return items
    .filter((i) => ['top', 'bottom', 'onepiece'].includes(CATEGORY_SLOT[i.category]) || !i.isOwned)
    .map((i) => i.id);
}

/**
 * 似た候補ばかり並ばないよう、上位から順に「前の候補と主役が被らないもの」を選ぶ。
 * 足りなければ基準をゆるめる（①主役が被らない → ②上下の組が違う → ③何でもよい）
 */
export function pickDiverse<T extends { items: ClothingItem[] }>(sorted: T[], limit: number): T[] {
  const chosen: T[] = [];
  const bodyKey = (c: T) =>
    c.items
      .filter((i) => ['top', 'bottom', 'onepiece'].includes(CATEGORY_SLOT[i.category]))
      .map((i) => i.id)
      .sort()
      .join('+');
  const rules: ((c: T) => boolean)[] = [
    (c) => chosen.every((o) => !keyIds(o.items).some((id) => keyIds(c.items).includes(id))),
    (c) => chosen.every((o) => bodyKey(o) !== bodyKey(c)),
    () => true,
  ];
  for (const ok of rules) {
    for (const c of sorted) {
      if (chosen.length >= limit) return chosen;
      if (!chosen.includes(c) && ok(c)) chosen.push(c);
    }
  }
  return chosen;
}

export function suggestOutfits(
  items: ClothingItem[],
  outfits: Outfit[],
  opts: {
    today?: Date;
    season?: Season;
    rng?: () => number;
    limit?: number;
    /** 'only': お試しデザインを少なくとも1つ含む組み合わせだけを提案する（手持ちだけの提案には使わない） */
    trial?: 'exclude' | 'only';
  } = {},
): Suggestion[] {
  const today = opts.today ?? new Date();
  const season = opts.season ?? seasonOf(today);
  const rng = opts.rng ?? Math.random;
  const limit = opts.limit ?? SUGGEST_COUNT;

  const worn = recentlyWornItemIds(outfits, today);
  const trialOnly = opts.trial === 'only';
  // お試しは「今日着る」ものではないので、直近着用の除外は手持ちの服にだけ適用する
  const usable = items.filter((i) => (i.isOwned ? !worn.has(i.id) : trialOnly));
  const by = (slot: string) => usable.filter((i) => CATEGORY_SLOT[i.category] === slot);
  const tops = by('top');
  const bottoms = by('bottom');
  const onepieces = by('onepiece');
  const outers = by('outer');
  const shoes = by('shoes');
  const cold = season === 'autumn' || season === 'winter';

  // 上下セット（top×bottom）とワンピースを「ボディ」として扱う
  const bodies: ClothingItem[][] = [
    ...tops.flatMap((t) => bottoms.map((b) => [t, b])),
    ...onepieces.map((o) => [o]),
  ];
  const bodyIdx = bodies.map((_, i) => i);
  const dims: ClothingItem[][] = [];
  const kinds: ('body' | 'shoes' | 'outer')[] = [];
  // ボディは [t,b] の組を index で扱うため、一度ダミー配列に置き換えて間引く
  const bodyProxies = bodyIdx.map((i) => ({ id: String(i), isOwned: bodies[i].every((b) => b.isOwned) }) as ClothingItem);
  dims.push(bodyProxies);
  kinds.push('body');
  if (shoes.length) {
    dims.push(shoes);
    kinds.push('shoes');
  }
  if (cold && outers.length) {
    dims.push(outers);
    kinds.push('outer');
  }
  if (bodies.length === 0) return [];

  const limited = limitCandidates(dims, rng, trialOnly ? (c) => !c.isOwned : undefined);
  let combos: ClothingItem[][] = [[]];
  limited.forEach((group, d) => {
    const next: ClothingItem[][] = [];
    for (const c of combos)
      for (const g of group) {
        const add = kinds[d] === 'body' ? bodies[Number(g.id)] : [g];
        next.push([...c, ...add]);
      }
    combos = next;
  });

  const candidates = trialOnly ? combos.filter((c) => c.some((i) => !i.isOwned)) : combos;
  // 同点は乱数で並べ替える（比較のたびに乱数を引くと順序が不安定になるため、先に1回だけ引く）
  const scored = candidates.map((c) => ({ items: c, score: scoreOutfit(c, { season }).total, tie: rng() }));
  scored.sort((a, b) => b.score - a.score || a.tie - b.tie);
  return pickDiverse(scored, limit).map(({ items: its, score }) => ({
    items: its,
    score,
    itemIds: toItemIds(its),
  }));
}

export function toItemIds(items: ClothingItem[]): Outfit['itemIds'] {
  const ids: Outfit['itemIds'] = {};
  const acc: string[] = [];
  for (const i of items) {
    const slot = CATEGORY_SLOT[i.category];
    if (slot === 'accessory') acc.push(i.id);
    else ids[slot] = i.id;
  }
  if (acc.length) ids.accessory = acc;
  return ids;
}
