import { dateKey } from './suggest';
import type { Outfit } from '../types';

export type DayCell = { date: Date; key: string } | null;

/** 月曜ではなく日曜始まりの月カレンダー（週ごとの配列。月外の日は null） */
export function buildMonthGrid(year: number, month: number): DayCell[][] {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const cells: DayCell[] = Array(first.getDay()).fill(null);
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    cells.push({ date, key: dateKey(date) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** 日付(YYYY-MM-DD) → その日に着たコーデ */
export function wornByDate(outfits: Outfit[]): Map<string, Outfit[]> {
  const map = new Map<string, Outfit[]>();
  for (const o of outfits)
    for (const d of new Set(o.wornDates)) map.set(d, [...(map.get(d) ?? []), o]);
  return map;
}

export function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}
