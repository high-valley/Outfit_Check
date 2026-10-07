# コーデスコア（仮）仕様書

> このファイルはリポジトリ直下に置き、Claude Code に実装を依頼するための仕様書です。
> 実装は「フェーズ1 → 2 → 3」の順に進め、各フェーズ完了時に動作確認とテストを行うこと。

---

## 1. アプリ概要

### 1.1 コンセプト
「手持ちの服だけで、今日のコーデを決められる」アプリ。
服を登録すると**イラスト化**され、組み合わせを選ぶと**コーデの完成度を％で判定**し、減点理由も表示する。

### 1.2 ターゲット
- 服の組み合わせに自信がない人
- 毎朝の服選びに時間がかかる人
- 手持ちの服を活かしきれていない人

### 1.3 コア体験
1. 手持ちの服を登録する（フェーズ1は手入力、フェーズ2は写真から自動）
2. 服がイラストになり、クローゼット画面に図鑑のように並ぶ
3. 着せ替え画面で組み合わせると「82%」のようにスコアと理由が出る
4. 「今日のコーデ」ボタンで、手持ち服から高スコアの組み合わせが提案される

---

## 2. 技術スタック

| 項目 | 採用技術 | 備考 |
|---|---|---|
| アプリ | React Native + Expo（TypeScript） | iOS / Android 両対応 |
| 画面遷移 | expo-router | |
| イラスト描画 | react-native-svg | 服のテンプレートSVGに色を塗る |
| ローカルDB | expo-sqlite | フェーズ1はサーバーなしで完結 |
| 状態管理 | Zustand | |
| テスト | Jest + React Native Testing Library | スコア判定は必ず単体テスト |
| バックエンド（フェーズ2〜） | Supabase（認証・Storage・Edge Functions） | |
| AI（フェーズ2〜） | Claude API（画像対応モデル） | **APIキーは必ずEdge Function側に置き、アプリに埋め込まない** |

各ライブラリは実装時点の最新安定版を使用すること。

---

## 3. フェーズ計画

### フェーズ1：MVP（AIなし・ローカル完結）
- 服の手動登録（種類・色・柄・シルエット・テイスト・季節を選択）
- テンプレートSVGによるイラスト化
- クローゼット画面
- 着せ替え画面 + コーデスコア判定（ルールベース）
- 今日のコーデ提案
- コーデの保存・着用履歴

### フェーズ2：写真から自動登録
- 写真撮影 / アルバムから選択
- 背景除去
- Claude API で服の種類・色・柄・シルエット・テイストを判定し、登録フォームに自動入力（ユーザーが修正可能）
- アカウント作成とクラウド同期（Supabase）

### フェーズ3：拡張
- 天気・気温連携による提案
- 持っていない服の「お試し」デザイン機能の強化（欲しい物リスト）
- 商品のQR / バーコード読み取り → 手持ち服との相性判定（商品データの提携先が決まり次第）

---

## 4. データモデル

### 4.1 ClothingItem（服）

| フィールド | 型 | 説明 |
|---|---|---|
| id | string (uuid) | |
| category | Category | 下記参照 |
| mainColor | string (HEX) | メインカラー |
| subColor | string (HEX) \| null | 柄の2色目など |
| pattern | Pattern | `plain` / `stripe` / `check` / `dot` / `floral` / `logo` |
| fit | Fit | `tight` / `regular` / `loose` |
| length | Length | `short` / `regular` / `long` |
| tastes | Taste[] | 1〜2個。下記参照 |
| seasons | Season[] | `spring` / `summer` / `autumn` / `winter` |
| thickness | Thickness | `thin` / `medium` / `thick` |
| photoUri | string \| null | 元写真（フェーズ2） |
| isOwned | boolean | false の場合は「お試しデザイン」の服 |
| name | string | ユーザーが付ける名前（任意） |
| createdAt | string (ISO) | |

### 4.2 Category（服の種類）と部位

| 部位 (slot) | category |
|---|---|
| top | `tshirt`, `shirt`, `knit`, `hoodie`, `sweatshirt`, `blouse` |
| bottom | `denim`, `chino`, `slacks`, `wide_pants`, `shorts`, `skirt_short`, `skirt_long` |
| onepiece | `dress`（top と bottom の両方を占める） |
| outer | `jacket`, `coat`, `cardigan`, `blouson` |
| shoes | `sneakers`, `leather_shoes`, `boots`, `sandals` |
| accessory | `bag`, `hat` |

### 4.3 Taste（テイスト）
`casual`（カジュアル）, `clean`（きれいめ）, `street`（ストリート）, `mode`（モード）, `sporty`（スポーティ）, `feminine`（フェミニン）, `natural`（ナチュラル）

### 4.4 Outfit（コーデ）

| フィールド | 型 | 説明 |
|---|---|---|
| id | string | |
| itemIds | { top?, bottom?, onepiece?, outer?, shoes?, accessory?[] } | |
| score | number | 保存時のスコア |
| wornDates | string[] | 着用日 |
| createdAt | string | |

---

## 5. イラスト化の仕様

- `assets/templates/` に category ごとのSVGテンプレートを用意する。
- テンプレートは「塗りつぶし領域（mainColor）」「サブ領域（subColor）」「線画」のレイヤーで構成する。
- pattern が `plain` 以外の場合、柄のSVGパターン（stripe / check / dot など）を重ねる。
- テイストの揃ったフラットなイラストで統一する（線は濃いグレー、影は1段階のみ）。
- 着せ替え画面では、シンプルな人型シルエットの上に 靴 → ボトム → トップ → アウター の順でレイヤーを重ねる。
- フェーズ1ではテンプレートは各 category 1種類でよい。デザインの追加は後から行う。

---

## 6. コーデスコア判定の仕様（最重要）

`src/lib/scoring/` に純粋な TypeScript 関数として実装し、UI から独立させること。

```ts
function scoreOutfit(items: ClothingItem[], context?: { season: Season }): ScoreResult

type ScoreResult = {
  total: number;            // 0〜100
  breakdown: {
    color: number;          // 0〜40
    silhouette: number;     // 0〜30
    taste: number;          // 0〜20
    season: number;         // 0〜10
  };
  reasons: { type: 'plus' | 'minus'; message: string; points: number }[];
};
```

### 6.1 色の前処理
- HEX を HSL に変換する。
- **ニュートラル色**：彩度 15% 未満（白・黒・グレー）
- **ベースカラー**：ネイビー・ベージュ・ブラウン・カーキ相当（色相と明度・彩度の範囲で判定し、定数ファイルで調整できるようにする）
- **有彩色**：上記以外
- **トーン**：有彩色を彩度・明度で `pale` / `light` / `vivid` / `dull` / `dark` に分類する
- 色数のカウント対象は top / bottom / onepiece / outer / shoes。accessory は「差し色」判定のみに使う。

### 6.2 色の相性（40点）

| ルール | 配点 | 判定 |
|---|---|---|
| 色数 | 15 | 色グループ（有彩色は色相30°単位、ニュートラルは白・グレー・黒で区別）が 3以内=15 / 4=8 / 5以上=0 |
| トーン統一 | 10 | 有彩色のトーンが同じ=10 / 隣接トーンのみ=6 / バラバラ=0 / 有彩色なし=10 |
| 色相の関係 | 10 | 同系色（差30°以内）=10 / 補色（差150〜210°）で片方が小面積（靴・小物・インナー）=10 / 補色で両方大面積=3 / その他=5 / 有彩色が1色以下=10 |
| 差し色 | 5 | vivid の有彩色が 0〜1 個=5 / 2個=2 / 3個以上=0 |

### 6.3 シルエット（30点）
top（または onepiece）と bottom の fit の組み合わせで判定する。

| top | bottom | 点数 | 理由メッセージ例 |
|---|---|---|---|
| loose | tight / regular | 30 | 上ゆったり・下すっきりでメリハリがある（Yライン） |
| tight / regular | loose | 30 | 上すっきり・下ゆったりでバランスが良い（Aライン） |
| regular | regular | 25 | 標準的なバランス |
| tight | tight | 22 | 細身でまとまっている（Iライン） |
| loose | loose | 12 | 全体がゆったりしすぎて重たく見えやすい |

追加の減点：
- outer の length が top より短い場合 −5
- onepiece の場合は onepiece 単体の fit で判定し、outer とのバランスのみ見る

### 6.4 テイストの統一（20点）
各アイテムの tastes を集計し、最も多いテイストの割合を出す。

| 条件 | 点数 |
|---|---|
| 主テイストが 80% 以上 | 20 |
| 2テイストが 約7:3 で混在（「ハズし」） | 18 |
| 2テイストが 約5:5 | 12 |
| 3テイスト以上が混在 | 5 |

相性の悪い組み合わせ（例：`sporty` × `feminine`、`mode` × `natural`）は定数の相性表で追加減点（−3）できるようにする。

### 6.5 季節（10点）
- 全アイテムが現在の季節を含む = 10
- 季節外のアイテム 1点につき −4（下限0）
- 現在の季節は端末の日付から判定（3〜5月=春、6〜8月=夏、9〜11月=秋、12〜2月=冬）

### 6.6 理由の表示
- reasons は減点の大きい順に表示する。
- 各理由は「なぜ減点か」と「どうすれば良くなるか」を短い日本語で書く。
  - 例：「色が5色使われています（−15）。どれか1つを白・黒・グレーに変えるとまとまります」
- 配点・閾値はすべて `src/lib/scoring/constants.ts` にまとめ、後から調整できるようにする。

### 6.7 単体テスト（必須）
最低限、以下のケースをテストする。
- 白T × デニム × 白スニーカー → 85%以上
- 全身黒のIライン → 80%以上
- 赤・青・黄・緑・紫の5色コーデ → 色の相性が 10点以下
- loose × loose → シルエット 12点
- 夏に厚手のコート → 季節点が減点される

---

## 7. 今日のコーデ提案

1. 手持ち服（isOwned = true）から、top×bottom（または onepiece）× shoes × outer（季節が秋冬のときのみ）の全組み合わせを生成
2. 直近3日以内に着用したアイテムを含む組み合わせを除外
3. scoreOutfit で採点し、上位3件を提示
4. 組み合わせ数が 5,000 を超える場合は、各部位からランダムに候補を絞ってから採点する
5. 「これを着る」を押すと Outfit として保存し、wornDates に今日を追加する

---

## 8. 画面一覧

| 画面 | 主な機能 |
|---|---|
| ホーム | 今日のコーデ提案（上位3件）、「これを着る」ボタン |
| クローゼット | 登録済みの服をイラストでグリッド表示。部位タブで絞り込み |
| 服の登録・編集 | フェーズ1：種類・色（カラーピッカー＋よく使う色のプリセット）・柄・シルエット・テイスト・季節を選択。入力中にイラストがリアルタイム更新される |
| 着せ替え（コーデ作成） | 人型に服を重ねて表示。部位ごとに横スワイプで服を切り替え。画面上部にスコア（%）とメーター、下部に理由一覧 |
| お試しデザイン | 持っていない服を種類と色で作り、手持ち服と組み合わせて採点（isOwned = false） |
| コーデ履歴 | 保存したコーデと着用日のカレンダー |
| 設定 | データのバックアップ（フェーズ2以降は同期） |

### UIの方針
- スコアは大きく表示し、80%以上=緑、60〜79%=黄、59%以下=赤
- 服を切り替えるたびにスコアが即時更新される（体感遅延なし）
- 片手操作を前提に、主要ボタンは画面下部に置く

---

## 9. フェーズ2：写真からの自動登録

### 9.1 流れ
1. アプリで撮影 → 画像を縮小（長辺1024px程度）
2. Supabase Storage にアップロード
3. Edge Function `analyze-clothing` を呼び出す
4. Edge Function が Claude API に画像を送り、下記JSONを返させる
5. アプリは結果を登録フォームに自動入力し、ユーザーが確認・修正して保存

### 9.2 AIに返させるJSON
```json
{
  "category": "shirt",
  "mainColor": "#F2F2F2",
  "subColor": null,
  "pattern": "plain",
  "fit": "regular",
  "length": "regular",
  "tastes": ["clean"],
  "seasons": ["spring", "autumn"],
  "thickness": "medium",
  "confidence": 0.86
}
```
- 値は必ずデータモデルの列挙値の中から選ばせる
- JSONが不正な場合は1回だけ再試行し、失敗したら手入力フォームにフォールバック
- confidence が 0.6 未満なら「確認してください」と表示

### 9.3 背景除去
- 服の写真は元画像としても保存し、クローゼットでは「イラスト / 写真」を切り替え表示できるようにする
- 背景除去の実装方法（端末内処理 or サーバー処理）はフェーズ2開始時に比較検討する

---

## 10. ディレクトリ構成（案）

```
app/                     # expo-router の画面
  (tabs)/
    index.tsx            # ホーム
    closet.tsx
    history.tsx
    settings.tsx
  item/[id].tsx          # 服の登録・編集
  outfit/new.tsx         # 着せ替え
src/
  lib/
    scoring/             # スコア判定（純粋関数）
      index.ts
      color.ts
      silhouette.ts
      taste.ts
      season.ts
      constants.ts
      __tests__/
    color/               # HEX⇔HSL変換、トーン分類
    suggest/             # 今日のコーデ提案
  db/                    # expo-sqlite のスキーマとリポジトリ
  components/
    ClothingIllustration.tsx
    Mannequin.tsx
    ScoreMeter.tsx
  store/                 # Zustand
  types/
assets/
  templates/             # 服のSVGテンプレート
  patterns/              # 柄のSVG
supabase/                # フェーズ2
  functions/analyze-clothing/
```

---

## 11. 非機能要件
- オフラインでフェーズ1の全機能が動くこと
- スコア計算は 50ms 以内
- 写真・服データは端末外に勝手に送信しない（フェーズ2の解析時は送信前に同意を得る）
- Claude APIキー・Supabaseのサービスキーはリポジトリにコミットしない（`.env` を `.gitignore` に追加）

---

## 12. Claude Code への進め方の指示
1. まず Expo プロジェクトの雛形と `src/lib/scoring` を作り、**6.7 のテストが通る状態**にする
2. 次に SVG テンプレート（各 category 1種類）と `ClothingIllustration` コンポーネント
3. DB と服の登録画面、クローゼット画面
4. 着せ替え画面とスコア表示
5. 今日のコーデ提案とホーム画面
6. 各ステップごとにコミットし、変更点を短くまとめること
7. 仕様に曖昧な点があれば、実装前に質問すること
