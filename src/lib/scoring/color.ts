import { areTonesAdjacent, classifyColor, hueDiff, type ColorInfo } from '../color';
import { CATEGORY_SLOT, type ClothingItem, type ScoreReason, type Slot } from '../../types';
import {
  ACCENT_POINTS,
  COLOR_COUNT_POINTS,
  HUE_COMPLEMENT_RANGE,
  HUE_POINTS,
  HUE_SIMILAR_MAX_DIFF,
  SMALL_AREA_SLOTS,
  TONE_POINTS,
} from './constants';

type Part = { slot: Slot; info: ColorInfo };

const COUNT_SLOTS: Slot[] = ['top', 'bottom', 'onepiece', 'outer', 'shoes'];

const minus = (message: string, points: number): ScoreReason => ({
  type: 'minus',
  message,
  points: -points,
});
const plus = (message: string, points: number): ScoreReason => ({ type: 'plus', message, points });

export function scoreColor(items: ClothingItem[]): { score: number; reasons: ScoreReason[] } {
  const parts: Part[] = items.map((item) => ({
    slot: CATEGORY_SLOT[item.category],
    info: classifyColor(item.mainColor),
  }));
  const counted = parts.filter((p) => COUNT_SLOTS.includes(p.slot));
  // 差し色・色相・トーンはベースカラー／ニュートラルを除いた有彩色で見る
  const chromatic = counted.filter((p) => p.info.kind === 'chromatic');
  const reasons: ScoreReason[] = [];
  let score = 0;

  // 色数 (15)
  const groupCount = new Set(counted.map((p) => p.info.group)).size;
  const countPts =
    groupCount <= 3
      ? COLOR_COUNT_POINTS.max
      : groupCount === 4
        ? COLOR_COUNT_POINTS.four
        : COLOR_COUNT_POINTS.fivePlus;
  score += countPts;
  if (countPts < COLOR_COUNT_POINTS.max) {
    reasons.push(
      minus(
        `色が${groupCount}色使われています（−${COLOR_COUNT_POINTS.max - countPts}）。どれか1つを白・黒・グレーに変えるとまとまります`,
        COLOR_COUNT_POINTS.max - countPts,
      ),
    );
  } else {
    reasons.push(plus(`色数が${groupCount}色以内で、すっきりまとまっています`, countPts));
  }

  // トーン統一 (10)
  const tones = [...new Set(chromatic.map((p) => p.info.tone!))];
  let tonePts: number;
  if (tones.length === 0) tonePts = TONE_POINTS.noChromatic;
  else if (tones.length === 1) tonePts = TONE_POINTS.same;
  else if (tones.every((a, i) => tones.slice(i + 1).every((b) => areTonesAdjacent(a, b))))
    tonePts = TONE_POINTS.adjacent;
  else tonePts = TONE_POINTS.scattered;
  score += tonePts;
  if (tonePts < TONE_POINTS.same) {
    reasons.push(
      minus(
        `色のトーン（明るさ・鮮やかさ）がそろっていません（−${TONE_POINTS.same - tonePts}）。くすみ系か明るい系など、トーンを揃えると上品に見えます`,
        TONE_POINTS.same - tonePts,
      ),
    );
  } else if (tones.length === 1) {
    reasons.push(plus('色のトーンが揃っています', tonePts));
  }

  // 色相の関係 (10)
  let huePts: number = HUE_POINTS.oneOrLess;
  let hueMsg: string | null = null;
  if (chromatic.length > 1) {
    const pairs: [Part, Part][] = [];
    for (let i = 0; i < chromatic.length; i++)
      for (let j = i + 1; j < chromatic.length; j++) pairs.push([chromatic[i], chromatic[j]]);
    const diffs = pairs.map(([a, b]) => ({
      a,
      b,
      d: hueDiff(a.info.hsl.h, b.info.hsl.h),
    }));
    const isSmall = (p: Part) => (SMALL_AREA_SLOTS as readonly Slot[]).includes(p.slot);
    const complements = diffs.filter(
      ({ d }) => d >= HUE_COMPLEMENT_RANGE[0] && d <= HUE_COMPLEMENT_RANGE[1],
    );
    if (diffs.every(({ d }) => d <= HUE_SIMILAR_MAX_DIFF)) {
      huePts = HUE_POINTS.similar;
    } else if (complements.length > 0) {
      const bothLarge = complements.some(({ a, b }) => !isSmall(a) && !isSmall(b));
      huePts = bothLarge ? HUE_POINTS.complementLargeArea : HUE_POINTS.complementSmallArea;
      if (bothLarge)
        hueMsg = `反対色どうしが大きな面積で並んでいます（−${HUE_POINTS.similar - huePts}）。片方を靴や小物に回すか、白・黒・グレーでつなぐとなじみます`;
    } else {
      huePts = HUE_POINTS.other;
      hueMsg = `色相がばらけています（−${HUE_POINTS.similar - huePts}）。同系色でそろえると統一感が出ます`;
    }
  }
  score += huePts;
  if (hueMsg) reasons.push(minus(hueMsg, HUE_POINTS.similar - huePts));
  else if (huePts === HUE_POINTS.similar && chromatic.length > 1)
    reasons.push(plus('同系色（または反対色の差し色）で色相の関係が良好です', huePts));

  // 差し色 (5)  ※アクセサリーも対象
  const vividCount = parts.filter(
    (p) => p.info.kind === 'chromatic' && p.info.tone === 'vivid',
  ).length;
  const accentPts =
    vividCount <= 1
      ? ACCENT_POINTS.zeroOrOne
      : vividCount === 2
        ? ACCENT_POINTS.two
        : ACCENT_POINTS.threePlus;
  score += accentPts;
  if (accentPts < ACCENT_POINTS.zeroOrOne) {
    reasons.push(
      minus(
        `鮮やかな色が${vividCount}個あり主役が競合しています（−${ACCENT_POINTS.zeroOrOne - accentPts}）。鮮やかな色は1点に絞りましょう`,
        ACCENT_POINTS.zeroOrOne - accentPts,
      ),
    );
  }

  return { score, reasons };
}
