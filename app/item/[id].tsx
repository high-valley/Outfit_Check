import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomBar } from '../../src/components/BottomBar';
import { Chip, ChipRow, PrimaryButton } from '../../src/components/Chip';
import { ClothingIllustration } from '../../src/components/ClothingIllustration';
import {
  CATEGORY_LABEL, COLOR_PRESETS, FIT_LABEL, LENGTH_LABEL, PATTERN_LABEL, SEASON_LABEL, SLOT_LABEL, TASTE_LABEL, THICKNESS_LABEL,
} from '../../src/lib/labels';
import { newId } from '../../src/lib/id';
import { useStore } from '../../src/store';
import { CATEGORY_SLOT, SLOTS, type Category, type ClothingItem, type Fit, type Length, type Pattern, type Season, type Taste, type Thickness } from '../../src/types';

const HEX = /^#[0-9a-fA-F]{6}$/;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{title}</Text>
      {children}
    </View>
  );
}

function ColorPicker({ value, onChange, allowNone }: { value: string | null; onChange: (v: string | null) => void; allowNone?: boolean }) {
  const [text, setText] = useState(value ?? '');
  const set = (v: string | null) => {
    setText(v ?? '');
    onChange(v);
  };
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.swatches}>
        {allowNone && (
          <Pressable onPress={() => set(null)} style={[styles.swatch, styles.swatchNone, value === null && styles.swatchOn]} accessibilityRole="button" accessibilityLabel="なし">
            <Text style={{ fontSize: 11, color: '#6B7280' }}>なし</Text>
          </Pressable>
        )}
        {COLOR_PRESETS.map((c) => (
          <Pressable key={c} onPress={() => set(c)} style={[styles.swatch, { backgroundColor: c }, value?.toUpperCase() === c && styles.swatchOn]} accessibilityRole="button" accessibilityLabel={c} />
        ))}
      </View>
      <TextInput
        value={text}
        placeholder="#RRGGBB"
        autoCapitalize="characters"
        maxLength={7}
        onChangeText={(t) => {
          setText(t);
          if (HEX.test(t)) onChange(t.toUpperCase());
          else if (allowNone && t === '') onChange(null);
        }}
        style={styles.input}
      />
    </View>
  );
}

export default function ItemForm() {
  const { id, trial } = useLocalSearchParams<{ id: string; trial?: string }>();
  const router = useRouter();
  const existing = useStore((s) => s.items.find((i) => i.id === id));
  const saveItem = useStore((s) => s.saveItem);
  const removeItem = useStore((s) => s.removeItem);
  const isNew = id === 'new' || !existing;
  const isTrial = existing ? !existing.isOwned : trial === '1';

  const [category, setCategory] = useState<Category>(existing?.category ?? 'tshirt');
  const [mainColor, setMainColor] = useState(existing?.mainColor ?? '#FFFFFF');
  const [subColor, setSubColor] = useState<string | null>(existing?.subColor ?? null);
  const [pattern, setPattern] = useState<Pattern>(existing?.pattern ?? 'plain');
  const [fit, setFit] = useState<Fit>(existing?.fit ?? 'regular');
  const [length, setLength] = useState<Length>(existing?.length ?? 'regular');
  const [tastes, setTastes] = useState<Taste[]>(existing?.tastes ?? ['casual']);
  const [seasons, setSeasons] = useState<Season[]>(existing?.seasons ?? ['spring', 'summer', 'autumn', 'winter']);
  const [thickness, setThickness] = useState<Thickness>(existing?.thickness ?? 'medium');
  const [name, setName] = useState(existing?.name ?? '');

  const toggleTaste = (t: Taste) =>
    setTastes((cur) => (cur.includes(t) ? (cur.length > 1 ? cur.filter((x) => x !== t) : cur) : cur.length >= 2 ? [cur[1], t] : [...cur, t]));
  const toggleSeason = (s: Season) =>
    setSeasons((cur) => (cur.includes(s) ? (cur.length > 1 ? cur.filter((x) => x !== s) : cur) : [...cur, s]));

  const save = async () => {
    const item: ClothingItem = {
      id: existing?.id ?? newId(),
      category, mainColor, subColor: pattern === 'plain' && !subColor ? null : subColor, pattern, fit, length, tastes, seasons, thickness,
      photoUri: existing?.photoUri ?? null,
      isOwned: !isTrial,
      name: name.trim(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    await saveItem(item);
    router.back();
  };
  const own = async () => {
    if (!existing) return;
    await saveItem({ ...existing, isOwned: true });
    router.back();
  };
  const remove = async () => {
    if (existing) await removeItem(existing.id);
    router.back();
  };

  return (
    <View style={styles.wrap}>
      <Stack.Screen options={{ title: isTrial ? (isNew ? 'お試しデザイン' : 'お試しデザインの編集') : isNew ? '服の登録' : '服の編集' }} />
      {isTrial && <Text style={styles.trialBanner}>お試しデザイン：持っていない服を作って、手持ち服との相性を採点できます（提案には使われません）</Text>}
      <View style={styles.preview}>
        <ClothingIllustration category={category} mainColor={mainColor} subColor={subColor} pattern={pattern} width={150} height={150} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Section title="種類">
          {SLOTS.map((slot) => {
            const cats = (Object.keys(CATEGORY_SLOT) as Category[]).filter((c) => CATEGORY_SLOT[c] === slot);
            return (
              <View key={slot} style={{ marginBottom: 6 }}>
                <Text style={styles.sub}>{SLOT_LABEL[slot]}</Text>
                <ChipRow>{cats.map((c) => <Chip key={c} label={CATEGORY_LABEL[c]} selected={category === c} onPress={() => setCategory(c)} />)}</ChipRow>
              </View>
            );
          })}
        </Section>
        <Section title="メインカラー"><ColorPicker value={mainColor} onChange={(v) => v && setMainColor(v)} /></Section>
        <Section title="柄">
          <ChipRow>{(Object.keys(PATTERN_LABEL) as Pattern[]).map((p) => <Chip key={p} label={PATTERN_LABEL[p]} selected={pattern === p} onPress={() => setPattern(p)} />)}</ChipRow>
        </Section>
        <Section title="サブカラー（柄・配色の2色目）"><ColorPicker value={subColor} onChange={setSubColor} allowNone /></Section>
        <Section title="シルエット">
          <ChipRow>{(Object.keys(FIT_LABEL) as Fit[]).map((f) => <Chip key={f} label={FIT_LABEL[f]} selected={fit === f} onPress={() => setFit(f)} />)}</ChipRow>
        </Section>
        <Section title="丈">
          <ChipRow>{(Object.keys(LENGTH_LABEL) as Length[]).map((l) => <Chip key={l} label={LENGTH_LABEL[l]} selected={length === l} onPress={() => setLength(l)} />)}</ChipRow>
        </Section>
        <Section title="テイスト（1〜2つ）">
          <ChipRow>{(Object.keys(TASTE_LABEL) as Taste[]).map((t) => <Chip key={t} label={TASTE_LABEL[t]} selected={tastes.includes(t)} onPress={() => toggleTaste(t)} />)}</ChipRow>
        </Section>
        <Section title="季節">
          <ChipRow>{(Object.keys(SEASON_LABEL) as Season[]).map((s) => <Chip key={s} label={SEASON_LABEL[s]} selected={seasons.includes(s)} onPress={() => toggleSeason(s)} />)}</ChipRow>
        </Section>
        <Section title="厚さ">
          <ChipRow>{(Object.keys(THICKNESS_LABEL) as Thickness[]).map((t) => <Chip key={t} label={THICKNESS_LABEL[t]} selected={thickness === t} onPress={() => setThickness(t)} />)}</ChipRow>
        </Section>
        <Section title="名前（任意）">
          <TextInput value={name} onChangeText={setName} placeholder="例：お気に入りの白T" style={styles.input} />
        </Section>
      </ScrollView>
      <BottomBar inset>
        {!isNew && <PrimaryButton label="削除" variant="danger" onPress={remove} />}
        {!isNew && isTrial && <PrimaryButton label="手持ちに追加" variant="secondary" onPress={own} />}
        <PrimaryButton label="保存" onPress={save} />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF' },
  preview: { alignItems: 'center', paddingVertical: 8, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  trialBanner: { fontSize: 12, color: '#B45309', backgroundColor: '#FEF3C7', paddingHorizontal: 14, paddingVertical: 8 },
  section: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  sub: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#D1D5DB' },
  swatchNone: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  swatchOn: { borderWidth: 3, borderColor: '#2563EB' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
});
