# 「きらきら・ビーズ・コピー」Web プロトタイプ 仕様書

---

## 1. 概要

### 1.1 システム概要

* タイトル：きらきら・ビーズ・コピー Web プロトタイプ
* バージョン：v0.1
* プラットフォーム：

  * クライアント：macOS 上の Google Chrome 最新版
  * 実行：ブラウザ上 Single Page Application
* ゲーム構成：3 ラウンド制（3 ラウンド合計ポイントを最後に発表）
* 技術スタック（想定）：

  * React 18
  * TypeScript 5 系
  * Vite
  * CSS（CSS Modules もしくはプレーン CSS）

### 1.2 目的

* コアゲームループの検証
  「ビーズ提示 → 消える → 再現 → 採点 → 復習 → 次の問題」の一連の流れが自然か確認する。
* 視覚イメージ記憶を促す UI/UX の検証。
* 誤答時の「正解との比較」「どこが間違っているかの可視化」が、有効なフィードバックになっているか検証する。
* 0〜100 点のスコアリングが、ユーザーにとって「どれくらい近かったか」の感覚として理解しやすいか検証する。

---

## 2. ターゲット・利用シーン

### 2.1 想定ユーザー

* 5〜10 歳程度の子ども（実テストでは大人も可）
* 教室・家庭での短時間の知育ミニゲームとして利用されることを想定
* UI テキストはひらがなを基本としつつ、外来語はカタカナ表記（ビーズ／ドラッグ／タップなど）。漢字・英語は極力避ける。
* メッセージトーンはやさしく前向きにし、男女問わず親しみやすい表現と配色にする
* 全体のカラーテイストはライトテーマ基調とし、明るく柔らかい色使いにする

### 2.2 利用シーン

* PC ブラウザでのデモ・プレイテスト
* ゲーム企画／UI 仕様の検証

---

## 3. 用語定義

* **スロット（Slot）**
  ビーズを 1 個だけ配置できる枠。横一列に並ぶ。
* **ビーズ（Bead）**
  色・形・サイズを持つ図形オブジェクト。ストックまたはスロットに表示される。
* **ストック（Stock）**
  プレイヤーがビーズを取り出すエリア。
* **問題（Problem）**
  正解のスロット状態を持つ 1 問分のデータ。
* **ラウンド（Round）**
  1 ゲームセッションを構成する単位。全 3 ラウンド固定で、各ラウンドのスコアを合計して発表する。
* **フェーズ（GamePhase）**
  ゲームの進行状態。`idle` / `showing` / `reproduce` / `result`。

---

## 4. 画面仕様

### 4.1 レイアウト概要（単一画面）

画面は縦方向に 3 分割を基本とする。

1. 上段：**問題エリア**

   * 横一列のスロット（5 マス）
   * フェーズにより内容が変化
2. 中段：**状態／結果エリア**

   * `idle` / `showing` / `reproduce`：

     * 現在フェーズを示すアイコン（目／手など）
   * `result`：

     * 正解パターンとユーザー回答の比較表示
     * スコア表示
3. 下段：**ビーズストックエリア**

   * ビーズ候補の一覧

その他 UI 要素：

* 右上：回答ボタン（ANSWER アイコン）
* 左上：リセットボタン
* ラウンド表示の隣：難易度切替ボタン（★アイコン）
* `result` フェーズ時：画面下部中央に「つぎへ」ボタン
* `reproduce` 以外のフェーズでは「ビーズをえらんでね」内のストックビーズだけを非活性表現にする（半透明・カーソル変更など）。問題提示や答え合わせで表示するビーズは常に活性表示のまま。
* ドラッグ元（ストック）のビーズ配置は PC / スマホの両レイアウトで同じ行列数を維持し、色・形ごとに規則的な並びを崩さない。
* ドラッグ元ビーズは各マス内で上下左右中央揃えにする。ビーズサイズが異なっても整列が崩れないようにする。

#### 4.1.1 レスポンシブ（スマートフォン）要件

* ビューポート幅 768px 未満をモバイルレイアウトとする。
* スロットサイズは縮小し、横スクロールなしで 5 マスが収まるようにする。
* グリッド → 縦積み：

  * 中段／下段は縦方向に積む。
  * 比較ビュー（result）は 1 列表示（正解→回答の順）。
* フォントサイズ、余白を 0.85〜0.9 倍程度にスケール。
* ボタンは横幅 100% のブロック配置を基本にし、タップ領域を確保。
* ストックのグリッド幅を自動フィットにし、2〜3列で折り返す。

### 4.2 UI 要素一覧

| ID           | 要素名      | 種別       | 説明                             |
| ------------ | -------- | -------- | ------------------------------ |
| SLOT_ROW     | スロット列    | コンテナ     | 横一列のスロット 5 個                   |
| SLOT         | スロット     | コンポーネント  | ビーズ 1 個 or 空を表示                |
| COMPARE_AREA | 比較エリア    | コンテナ     | 正解／ユーザー回答を並べて表示                |
| BEAD_STOCK   | ビーズストック  | コンテナ     | ビーズ候補群                         |
| BEAD         | ビーズ      | コンポーネント  | 色・形・サイズを持つ図形                   |
| BTN_ANSWER   | 回答ボタン    | ボタン      | 採点処理実行                         |
| BTN_RESET    | リセットボタン  | ボタン      | プレイヤー配置の全クリア                   |
| BTN_LEVEL    | 難易度切替ボタン | ボタン      | EASY / NORMAL のトグル             |
| BTN_NEXT     | つぎへボタン   | ボタン      | `result` → `idle` 遷移を行い次の問題へ進む |
| RESULT_SCORE | スコア表示    | ラベル／アイコン | 0〜100 点の数値＋バー／円グラフなど視覚表示       |
| ROUND_STATUS | ラウンド表示   | ラベル       | 現在のラウンド（1/3, 2/3, 3/3）を表示           |
| TOTAL_SUMMARY | 合計ポイント発表 | ビュー       | Round3 後に 3 ラウンド合計ポイントを大きく表示する |

---

## 5. ゲーム進行仕様

### 5.1 フェーズ定義

```ts
type GamePhase = 'idle' | 'showing' | 'reproduce' | 'result';
```

* `idle`：待機状態（次の問題の開始前）
* `showing`：正解パターンを一括表示
* `reproduce`：プレイヤーが再現操作を行う
* `result`：採点結果と比較表示、スコア確認フェーズ

### 5.2 フェーズ遷移

| 現フェーズ     | トリガー                 | 次フェーズ     |
| --------- | -------------------- | --------- |
| idle      | 「再生ボタン」クリック          | showing   |
| showing   | 提示時間経過               | reproduce |
| reproduce | 回答ボタン（BTN_ANSWER）クリック    | result    |
| result    | つぎへボタン（BTN_NEXT）クリック | idle      |

* `result` フェーズでは、**ユーザーが BTN_NEXT を押すまで次に進まない**。
* Round3 では BTN_NEXT 押下後に合計ポイント発表ビューを挟む（フェーズ自体は `result`/`idle` のどちらかで管理してもよい）。

### 5.3 ラウンド管理（3 ラウンド制）

* 1 セッション = 3 ラウンド（Round1〜3）で固定。
* `currentRound`（1〜3）と `roundScores`（各ラウンドのスコア）を状態に保持。
* Round1 / Round2：`result` で BTN_NEXT 押下 → `idle` → 次ラウンドの `showing` を開始。
* Round3：`result` で BTN_NEXT 押下 → 合計ポイント発表ビュー（TOTAL_SUMMARY）を表示。
  * 合計ポイントは 3 ラウンドのスコア合計（最大 300 点）を大きく目立つスタイルで表示。
  * 確認用ボタン押下でラウンドをリセット（`currentRound` を 1、`roundScores` を空に）し、`idle` で待機。

### 5.3 時間パラメータ

* 提示時間（`showing` フェーズ）：

  * EASY：700ms
  * NORMAL：500ms
* フェードアウトアニメーション：200ms
* `result` フェーズの表示は、**時間制限なし**（BTN_NEXT 押下まで）

---

## 6. 難易度仕様（デフォルト: NORMAL）

### 6.1 難易度種別

```ts
type Difficulty = 'easy' | 'normal';
```

### 6.2 難易度パラメータ

```ts
type DifficultyConfig = {
  numSlots: number;           // スロット数
  numBeadsInProblem: number;  // 実際にビーズが置かれるスロット数
  showDurationMs: number;     // 提示時間
  colors: Color[];
  shapes: Shape[];
  sizes: Size[];
};
```

#### EASY 設定

* `numSlots`: 5
* `numBeadsInProblem`: 3
* `showDurationMs`: 700
* `colors`: ['red', 'yellow', 'sky']
* `shapes`: ['circle']
* `sizes`: ['small']

#### NORMAL 設定

* `numSlots`: 5
* `numBeadsInProblem`: 5
* `showDurationMs`: 500
* `colors`: ['red', 'orange', 'yellow', 'sky', 'blue']
* `shapes`: ['circle', 'rounded-rect', 'diamond']
* `sizes`: ['small', 'large']

### 6.3 難易度切替（初期難易度は NORMAL）

* 右下の BTN_LEVEL をクリックすると EASY / NORMAL をトグル（初期は NORMAL）。
* 切替時：

  * 現在進行中の問題・配置は破棄。
  * フェーズを `idle` に戻す。
  * 次の「再生」から新設定に基づく問題を生成。

---

## 7. データ仕様

### 7.1 型定義（TypeScript）

```ts
type Color = 'red' | 'orange' | 'yellow' | 'sky' | 'blue';
type Shape = 'circle' | 'rounded-rect' | 'diamond';
type Size  = 'small' | 'large';

type Bead = {
  id: string;      // 一意ID (UUID等)
  color: Color;
  shape: Shape;
  size: Size;
};

type Slot = {
  index: number;   // 0〜(numSlots-1)
  bead: Bead | null;
};

type Problem = {
  id: string;
  slots: Slot[];   // length === numSlots
};

type ResultType = 'perfect' | 'good' | 'ok' | 'try';

type GamePhase = 'idle' | 'showing' | 'reproduce' | 'result';

type GameState = {
  phase: GamePhase;
  difficulty: Difficulty;
  currentProblem: Problem | null;
  currentPlacement: Slot[];   // プレイヤー側スロット
  score: number | null;       // 0〜100（結果フェーズのみ有効）
  rank: ResultType | null;    // ランク（PERFECT/GOOD/OK/TRY）
  currentRound: number;       // 1〜3（Round3 終了で発表ビューへ）
  roundScores: number[];      // 各ラウンドの獲得点（長さ最大 3）
  totalScore: number;         // 3 ラウンド合計（発表ビュー用）
  showTotalSummary: boolean;  // Round3 後の合計ポイント発表ビュー表示フラグ
};
```

---

## 8. 問題生成仕様

### 8.1 入力

* `DifficultyConfig`

### 8.2 出力

* `Problem`

### 8.3 アルゴリズム

1. `numSlots` 個の空スロット配列を生成（`bead: null`）。
2. `numBeadsInProblem` 回ループ：

   * `bead` がまだ入っていないスロット index をランダムに選択。
   * `colors`, `shapes`, `sizes` からそれぞれランダムに 1 つ選択して `Bead` を生成。
   * 選択した index のスロットに `bead` を設定。
3. 残りのスロットは `bead: null` のまま。
4. `id` を付与して `Problem` として返却。

---

## 9. 採点・スコアリング仕様（0〜100 点）

### 9.1 概要

* ユーザーの回答が「どれくらい正解に近いか」を 0〜100 点で評価する。

* 評価要素：

  1. 位置の一致度：ビーズが正解位置と比べてどれくらい離れているか
  2. 色の一致
  3. 形の一致
  4. サイズの一致

* 位置スコアと属性スコアを 0〜1 の値で計算し、線形結合して 0〜100 点に変換する。

### 9.2 スコアモデル

総合スコア `totalScore` は難易度ごとの重みと多様性ペナルティを考慮して算出する：

[
\text{totalScore} = 100 \times \text{diversityFactor} \times \left( w_{\text{pos}} \cdot S_{\text{pos}} + w_{\text{attr}} \cdot S_{\text{attr}} \right)
]

* `w_pos`, `w_attr` は難易度により異なる（後述）。
* `diversityFactor` は NORMAL でのみ適用し、単一ビーズを全マスに置く回答を減点する。
* ( S_{\text{pos}}, S_{\text{attr}} \in [0,1] )

### 9.3 位置スコア (S_{\text{pos}})

「正解スロットに対して **正しい種類のビーズが同じ位置にあるか**」を評価する。

1. 各スロット i（0〜4）について位置スコア ( s_i^{pos} ) を定義。

   * 正解スロット i にビーズあり：

     * ユーザー側スロット i にもビーズあり、かつ **色・形・サイズがすべて一致**：
       → ( s_i^{pos} = 1 )
     * 上記以外（空／一部不一致）：
       → ( s_i^{pos} = 0 )

   * 正解スロット i が空：

     * ユーザー側も空：
       → ( s_i^{pos} = 1 )
     * ユーザー側にビーズあり：
       → ( s_i^{pos} = 0 )

2. 全スロットで平均：

[
S_{\text{pos}} = \frac{1}{\text{numSlots}} \sum_{i=0}^{\text{numSlots}-1} s_i^{pos}
]

### 9.4 属性スコア (S_{\text{attr}})

各スロット i に対し、色・形・サイズの一致度を評価する。

1. 各スロット i で属性スコア ( s_i^{attr} ) を定義：

   * 正解・ユーザーともにビーズあり：

     * 色一致：( c_i = 1 ) / 不一致：0
     * 形一致：( sh_i = 1 ) / 不一致：0
     * サイズ一致：( sz_i = 1 ) / 不一致：0

     [
     s_i^{attr} = \frac{c_i + sh_i + sz_i}{3}
     ]

   * 正解が空・ユーザーも空：

     * 「何も置かなかった」完全一致とみなし
       → ( s_i^{attr} = 1 )

   * 片方のみビーズあり：
     → ( s_i^{attr} = 0 )

2. 全スロットで平均：

[
S_{\text{attr}} = \frac{1}{\text{numSlots}} \sum_{i=0}^{\text{numSlots}-1} s_i^{attr}
]

### 9.5 ランク判定

整数スコアに丸めた後、ランクを次のように定義する。

* 90〜100：`perfect`
* 70〜89：`good`
* 40〜69：`ok`
* 0〜39 ：`try`

UI 表示はアイコン（★数など）で表現する。

### 9.6 難易度別パラメータと多様性ペナルティ

NORMAL で「全スロット同じビーズを置くだけで点が取れる」課題を防ぐため、難易度別に重みとペナルティを変える。

* **Easy**

  * ( w_{\text{pos}} = 0.4 ), ( w_{\text{attr}} = 0.6 )
  * diversityFactor = 1（ペナルティなし）

* **Normal**

  * ( w_{\text{pos}} = 0.25 ), ( w_{\text{attr}} = 0.75 ) — 属性一致を重視
  * diversityFactor：プレイヤー回答のビーズ種類の多さ **と属性一致率** で減点

    1. 問題側のユニークビーズ種類数（色・形・サイズの組合せ）を `U_problem` とする。
    2. 回答側のユニークビーズ種類数を `U_answer` とする。
    3. カバレッジ率 ( coverage = min(1, U_answer / U_problem) )
    4. diversityFactor = 0.6 + 0.4 × coverage × S_attr（最低 0.6 まで減衰）

    * 同じビーズ 1 種のみを全マスに置くと coverage が低くなり、かつ属性一致率が低ければ factor は 0.6 付近まで圧縮される。
    * 正解と同数の種類を使い、属性一致率が高ければペナルティは解消される（factor 最大 1）。

### 9.6 関数インターフェース（例）

```ts
type ScoreResult = {
  score: number;      // 0〜100
  rank: ResultType;   // 'perfect' | 'good' | 'ok' | 'try'
  perSlotPositionScore: number[]; // 各スロットごとの位置スコア
  perSlotAttrScore: number[];     // 各スロットごとの属性スコア
};

function calcScore(problem: Problem, placement: Slot[]): ScoreResult {
  // 実装は上記仕様に準拠
}
```

---

## 10. 結果表示・復習仕様

### 10.1 比較ビュー構成

`result` フェーズでは、中段に以下を左右並列で表示する。

* 左側：正解パターン

  * ラベル：お手本アイコン
  * スロット列（5 マス）に正解のビーズ配置を表示

* 右側：ユーザー回答

  * ラベル：ユーザーアイコン
  * スロット列（5 マス）にユーザー配置を表示

両者のスロットは縦方向で揃え、インデックス i ごとに「正解 vs 自分」が一目で比較できる。

### 10.2 間違いの可視化

各スロット i について、以下のルールで枠色を変える。

* 完全一致：

  * 位置一致 ＋ 属性（色・形・サイズ）すべて一致
  * 枠線色：薄い緑
* 部分一致：

  * 位置一致 ＋ 属性の一部一致（いずれかが異なる）
  * 枠線色：黄色
* 不一致：

  * 位置不一致、またはビーズ有無が異なる
  * 枠線色：赤

必要に応じて、ビーズの上に小さなマーク（×や！）を配置してもよい。

### 10.3 スコア表示

比較ビューの近くに総合スコアを表示する。

* `score`（0〜100）を大きく表示。
* その下／横にランクに応じたアイコン（★数など）を表示。
* 任意で、「位置」「色」「形」「サイズ」のサブバー（ミニ進捗バー）を表示してもよい（必須ではない）。

### 10.4 「つぎへ」ボタン

* `result` フェーズのみ表示するボタン。
* クリック時：

  * フェーズを `idle` に変更。
  * 新しい `Problem` を生成する準備を行う。
  * スロット配置をリセットする。

結果画面は BTN_NEXT が押されるまで表示され続ける。
自動で次の問題へ進行するタイマーは設けない。

### 10.5 3 ラウンド合計ポイント発表ビュー

* Round3 の `result` で BTN_NEXT 押下後に遷移する専用ビューを用意。
* 表示内容：

  * **3 ラウンド合計ポイント（最大 300 点）** を画面中央で大きく表示（色面やエフェクトで強調）。
  * 任意で各ラウンドのスコア一覧（Round1〜3）を並べて表示。
* ユーザーが確認ボタンを押すと、`currentRound` を 1、`roundScores` と `totalScore` をリセットし、`idle` に戻る。

---

## 11. 操作仕様

### 11.1 マウス操作

* ビーズ配置（ドラッグ＆ドロップ）：

  * ストックのビーズを `mousedown` → スロット上まで `mousemove` → `mouseup` で配置。
* ビーズ削除：

  * スロット上のビーズをクリックすると、そのスロットの `bead` を `null` に戻す。
* 回答：

  * BTN_ANSWER をクリックすると採点処理を行い、`result` へ遷移。
* リセット：

  * BTN_RESET をクリックすると `currentPlacement` のすべてのスロットを `bead: null` に戻す。
* 難易度切替：

  * BTN_LEVEL をクリックすると難易度をトグルし、`idle` に戻す。
* 次へ：

  * Round1 / Round2：BTN_NEXT をクリックすると `result` → `idle` に遷移し、次ラウンドの準備を行う。
  * Round3：BTN_NEXT をクリックすると合計ポイント発表ビューへ遷移。確認後に `idle`（Round1）へ戻る。
  * 「つぎへ」押下時に配置エリアの入力状態をクリアし、次の問題を記憶しやすくする。

### 11.2 キーボード操作

* 特にサポートしない。

### 11.3 ボタン状態管理（有効／無効）

フェーズやラウンド進行状況に応じて各ボタンの活性を制御する。

| ボタン          | idle | showing | reproduce | result | 合計発表表示中 |
| -------------- | ---- | ------- | --------- | ------ | -------------- |
| 再生（PLAY）     | 有効 | 無効    | 無効      | 無効   | 無効           |
| 回答（ANSWER）   | 無効 | 無効    | 有効      | 無効   | 無効           |
| リセット         | 有効 | 無効    | 有効      | 無効   | 無効           |
| 難易度切替       | 有効 | 無効    | 無効      | 無効   | 無効           |
| つぎへ（NEXT）   | 非表示 | 非表示  | 非表示    | 有効   | 無効（合計発表が優先） |
| もう一度あそぶ   | 非表示 | 非表示  | 非表示    | 非表示 | 有効           |

補足:

* `result` 中は、同ラウンドの問題を再生できない。必ず NEXT で次ラウンドへ進む。
* Round3 結果後は合計発表ビューを表示し、NEXT ではなく「もう一度あそぶ」ボタンのみ有効とする。
* OK ボタンは `reproduce` でのみ有効。ビーズ未配置時は UI 側で無効化してもよい。

---

## 12. コンポーネント構成（React）

### 12.1 `<App />`

* 役割：

  * `GameState` 管理
  * フェーズ管理・問題生成・採点処理の呼び出し
* 主な状態：

  * `gameState: GameState`
* 主な処理：

  * `startProblem()`
  * `finishReproduceAndScore()`
  * `goNextFromResult()`
  * `toggleDifficulty()`

### 12.2 `<GameBoard />`

* 役割：

  * 上段スロット列表示（`showing` / `reproduce` 中）
* props：

  * `phase: GamePhase`
  * `problem: Problem | null`
  * `placement: Slot[]`
  * `onSlotDrop: (slotIndex: number, bead: Bead) => void`
  * `onSlotClear: (slotIndex: number) => void`

### 12.3 `<ResultView />`

* 役割：

  * `result` フェーズ専用の比較ビュー＋スコア表示
* props：

  * `problem: Problem`
  * `placement: Slot[]`
  * `score: number`
  * `rank: ResultType`
  * （任意）`perSlotPositionScore: number[]`
  * （任意）`perSlotAttrScore: number[]`
  * `onNext: () => void`（BTN_NEXT ハンドラ）

内部で「正解スロット列」「ユーザースロット列」「枠色」を描画。

### 12.4 `<RoundSummary />`（合計ポイント発表）

* 役割：

  * 3 ラウンド終了後の合計ポイントを大きく表示するビュー
* props：

  * `roundScores: number[]`（長さ最大 3）
  * `totalScore: number`（0〜300）
  * `onRestart: () => void`（Round1 へ戻すハンドラ）

合計ポイントを目立つビジュアルで表示し、各ラウンドの得点を任意でリスト表示する。

### 12.5 `<BeadStock />`, `<Slot />`, `<Bead />`, `<Controls />`

* `<Controls />` は BTN_ANSWER / BTN_RESET / BTN_LEVEL の表示・制御を担当する。

---

## 13. アニメーション仕様（抜粋）

* 提示フェーズ：

  * `showing` 開始時：正解ビーズを一括表示（opacity = 1）。
  * 終了直前 200ms：opacity を 1 → 0 に CSS transition。
* 配置時エフェクト：

  * スロットに置かれた瞬間、scale 1 → 1.1 → 1（100〜150ms）。
* 結果フェーズ：

  * 枠線色の変更（緑／黄／赤）を CSS で表現。
  * 必要に応じて、スコア表示時に軽いフェードイン。
* ビーズのホバー／フォーカス時の回転トランジションは禁止（形が変わったと誤認するため）。同様に拡縮や色変更のアニメーションも禁止し、静的な表示を維持する。

---

## 14. ログ出力（任意）

* デバッグ目的で、以下を `console.log` 出力してもよい：

  * 難易度
  * フェーズ遷移
  * 採点結果（score / rank）
  * 各スロットの位置・属性スコア

---

本仕様書 をベースに、React + TypeScript による実装を行う。
