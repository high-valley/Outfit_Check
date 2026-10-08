import * as Clipboard from 'expo-clipboard';
import { useRef, useState } from 'react';
import { Platform, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { PrimaryButton } from '../../src/components/Chip';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors } from '../../src/theme';
import { createBackup, parseBackup } from '../../src/lib/backup';
import { confirmAsync } from '../../src/lib/confirm';
import { useStore } from '../../src/store';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={styles.section}>
      <Text style={styles.h}>{title}</Text>
      {children}
    </Card>
  );
}
const Row = ({ children }: { children: React.ReactNode }) => <View style={styles.row}>{children}</View>;

export default function Settings() {
  const items = useStore((s) => s.items);
  const outfits = useStore((s) => s.outfits);
  const importData = useStore((s) => s.importData);
  const clearAll = useStore((s) => s.clearAll);
  const addSample = useStore((s) => s.addSampleItems);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const scroller = useRef<ScrollView>(null);
  // 結果メッセージは画面上部に出るので、出たら先頭へ戻す
  const show = (ok: boolean, text: string) => {
    setMsg({ ok, text });
    scroller.current?.scrollTo({ y: 0, animated: true });
  };
  const ok = (t: string) => show(true, t);
  const ng = (t: string) => show(false, t);

  const json = () => JSON.stringify(createBackup(items, outfits), null, 2);
  const stamp = () => new Date().toISOString().slice(0, 10);

  const copy = async () => {
    await Clipboard.setStringAsync(json());
    ok(`バックアップをコピーしました（服${items.length}点・コーデ${outfits.length}件）。メモなどに貼り付けて保管してください`);
  };
  const saveFile = async () => {
    if (Platform.OS === 'web') {
      const blob = new Blob([json()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `outfit-check-backup-${stamp()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
      ok('バックアップファイルを保存しました（ダウンロード / ファイルに入ります）');
    } else {
      await Share.share({ message: json(), title: `outfit-check-backup-${stamp()}` });
    }
  };
  const pasteFromClipboard = async () => setText(await Clipboard.getStringAsync());
  const pickFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
      const f = input.files?.[0];
      if (f) setText(await f.text());
    };
    input.click();
  };

  const restore = async () => {
    const r = parseBackup(text);
    if (!r.ok) return ng(r.error);
    const { items: i, outfits: o } = r.backup;
    const go = await confirmAsync('バックアップから復元', `服${i.length}点・コーデ${o.length}件を取り込みます。同じ服・コーデは上書きされ、ほかのデータは残ります。`, '復元する');
    if (!go) return;
    await importData(i, o);
    setText('');
    ok(`復元しました（服${i.length}点・コーデ${o.length}件${r.skipped ? `、読み込めない${r.skipped}件はスキップ` : ''}）`);
  };

  const wipe = async () => {
    const go = await confirmAsync('すべてのデータを削除', `服${items.length}点・コーデ${outfits.length}件をすべて削除します。先にバックアップを取ることをおすすめします。元に戻せません。`, 'すべて削除');
    if (!go) return;
    await clearAll();
    ok('すべてのデータを削除しました');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
    <ScreenHeader title="設定" subtitle="バックアップとデータ管理" />
    <ScrollView ref={scroller} contentContainerStyle={styles.wrap}>
      <Text style={styles.count}>登録: 服 {items.filter((i) => i.isOwned).length}点 / お試し {items.filter((i) => !i.isOwned).length}点 / コーデ {outfits.length}件</Text>
      {msg && <Text style={[styles.msg, msg.ok ? styles.msgOk : styles.msgNg]}>{msg.text}</Text>}

      <Section title="バックアップ">
        <Text style={styles.note}>データはこの端末（ブラウザ）の中だけに保存されています。機種変更やデータ消去に備えて、ときどきバックアップしてください。</Text>
        <Row>
          <PrimaryButton label="コピーする" onPress={copy} />
          <PrimaryButton label={Platform.OS === 'web' ? 'ファイルに保存' : '共有・保存'} variant="secondary" onPress={saveFile} />
        </Row>
      </Section>

      <Section title="復元">
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="バックアップの内容をここに貼り付け"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <Row>
          <PrimaryButton label="貼り付け" variant="secondary" onPress={pasteFromClipboard} />
          {Platform.OS === 'web' && <PrimaryButton label="ファイルを選ぶ" variant="secondary" onPress={pickFile} />}
        </Row>
        <Row>
          <PrimaryButton label="復元する" onPress={restore} disabled={!text.trim()} />
        </Row>
      </Section>

      <Section title="データ管理">
        <Row>
          <PrimaryButton label="サンプルの服を追加" variant="secondary" onPress={addSample} />
        </Row>
        <Row>
          <PrimaryButton label="すべてのデータを削除" variant="danger" onPress={wipe} disabled={items.length + outfits.length === 0} />
        </Row>
      </Section>
      <Text style={styles.foot}>クラウド同期（アカウント作成）は今後のバージョンで追加予定です。</Text>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  count: { fontSize: 13, color: '#374151', marginBottom: 6 },
  section: { gap: 10 },
  h: { fontSize: 16, fontWeight: '800', color: '#111827' },
  note: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  row: { flexDirection: 'row', gap: 10 },
  input: { minHeight: 110, maxHeight: 200, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 16, textAlignVertical: 'top' },
  msg: { fontSize: 13, lineHeight: 19, padding: 10, borderRadius: 10 },
  msgOk: { backgroundColor: colors.greenSoft, color: '#166534' },
  msgNg: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  foot: { marginTop: 24, fontSize: 11, color: '#9CA3AF' },
});
