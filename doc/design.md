# 「きらきら・ビーズ・コピー」Web プロトタイプ 設計書

## 1. システム全体構成

### 1.1 技術スタック

* フロントエンド

  * React 18（関数コンポーネント＋hooks）
  * TypeScript 5 系
  * Vite
* スタイル

  * CSS Modules またはプレーン CSS（どちらかに統一）
* デプロイ

  * GitHub Pages（`gh-pages` ブランチ or GitHub Actions 利用）

### 1.2 ビルドとデプロイ

* ビルド成果物：Vite による `dist/` 出力
* GitHub Pages 用設定例：

  * `vite.config.ts` の `base` にリポジトリ名を設定（例：`/kira-kira-beads/`）
  * `main` ブランチから CI（GitHub Actions）でビルドし、`gh-pages` ブランチに `dist` の中身をデプロイ

---

## 2. アーキテクチャ設計

### 2.1 全体構造の方針

* SPA（Single Page Application）
* 画面遷移は行わず、1ページ内でフェーズ（`idle` / `showing` / `reproduce` / `result`）を切り替える
  * Round1〜3 の 3 ラウンド制で進行し、Round3 後に合計ポイント発表ビューを挟んで再スタートする
* 状態管理は React の `useReducer` を用いてトップレベルで一元管理
* ドメインロジック（問題生成・採点）は UI コンポーネントから切り離し、純粋関数として別モジュール化

### 2.2 ディレクトリ構成（例）

```text
src/
  main.tsx               // エントリポイント
  App.tsx                // アプリケーションルート

  components/
    GameBoard/
      GameBoard.tsx
      GameBoard.css
    Slot/
      Slot.tsx
      Slot.css
    Bead/
      Bead.tsx
      Bead.css
    BeadStock/
      BeadStock.tsx
      BeadStock.css
    ResultView/
      ResultView.tsx
      ResultView.css
    RoundSummary/
      RoundSummary.tsx
      RoundSummary.css
    Controls/
      Controls.tsx
      Controls.css
    PhaseIndicator/
      PhaseIndicator.tsx
      PhaseIndicator.css
    RoundStatus/
      RoundStatus.tsx
      RoundStatus.css

  domain/
    gameTypes.ts         // 型定義（Color, Shape, Size, Bead, Slot, Problem 等）
    difficulty.ts        // 難易度設定（DifficultyConfig）
    problemGenerator.ts  // 問題生成ロジック
    scoreCalculator.ts   // 採点・スコアリングロジック

  state/
    gameReducer.ts       // GameState と reducer
    gameActions.ts       // Action 定義

  styles/
    global.css           // 全体スタイル（リセット、共通フォント等）

  config/
    githubPages.ts       // basePath などデプロイ関連設定（必要に応じて）
```

※「1つのファイルに1つのクラス」のルールに合わせ、

* 各 UI コンポーネントを 1 ファイル 1 コンポーネント
* 各ドメインモジュールを 1 ファイル 1 責務
  で設計する。

---

## 3. ドメイン設計

### 3.1 型設計

`src/domain/gameTypes.ts`

```ts
export type Color = 'red' | 'orange' | 'yellow' | 'sky' | 'blue';
export type Shape = 'circle' | 'rounded-rect' | 'diamond';
export type Size  = 'small' | 'large';

export type BeadId = string;

export type Bead = {
  id: BeadId;
  color: Color;
  shape: Shape;
  size: Size;
};

export type SlotIndex = number;

export type Slot = {
  index: SlotIndex;  // 0〜(numSlots - 1)
  bead: Bead | null;
};

export type ProblemId = string;

export type Problem = {
  id: ProblemId;
  slots: Slot[];
};

export type Difficulty = 'easy' | 'normal'; // デフォルトは 'normal'

export type ResultRank = 'perfect' | 'good' | 'ok' | 'try';

export type GamePhase = 'idle' | 'showing' | 'reproduce' | 'result';

export type RoundNumber = 1 | 2 | 3;
export const MAX_ROUNDS = 3 as const;
```

### 3.2 難易度設定

`src/domain/difficulty.ts`

* SRP に従い、難易度ごとの定数・設定のみを持つ。

```ts
import { Color, Shape, Size, Difficulty } from './gameTypes';

export type DifficultyConfig = {
  numSlots: number;
  numBeadsInProblem: number;
  showDurationMs: number;
  colors: Color[];
  shapes: Shape[];
  sizes: Size[];
};

const easyConfig: DifficultyConfig = {
  numSlots: 5,
  numBeadsInProblem: 3,
  showDurationMs: 700,
  colors: ['red', 'yellow', 'sky'],
  shapes: ['circle'],
  sizes: ['small'],
};

const normalConfig: DifficultyConfig = {
  numSlots: 5,
  numBeadsInProblem: 5,
  showDurationMs: 500,
  colors: ['red', 'orange', 'yellow', 'sky', 'blue'],
  shapes: ['circle', 'rounded-rect', 'diamond'],
  sizes: ['small', 'large'],
};

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  return difficulty === 'easy' ? easyConfig : normalConfig;
}
```

### 3.3 問題生成ロジック

`src/domain/problemGenerator.ts`

* 入力：`DifficultyConfig`
* 出力：`Problem`
* ランダム処理はこのモジュールに集約（DRY）。

責務：

* スロット生成（空）
* ランダムな index 選択
* ランダムな属性選択

### 3.4 採点・スコアリングロジック

`src/domain/scoreCalculator.ts`

責務：

* `Problem` と `Slot[]`（ユーザーの回答）から 0〜100 点を計算
* ランク判定
* 各スロットごとの位置スコア・属性スコアの算出（ResultView 用）

```ts
import { Problem, Slot, ResultRank } from './gameTypes';

export type ScoreResult = {
  score: number;                // 0〜100
  rank: ResultRank;
  positionScores: number[];     // スロットごと 0〜1
  attributeScores: number[];    // スロットごと 0〜1
};
```

設計上のポイント：

* 性能的にも軽量な線形計算のみ
* UI に依存せず純粋関数としてテスト容易に保つ（SRP）
* 合計ポイントは `score` をラウンドごとに集計して `totalScore`（最大 300）として管理する。`scoreCalculator` は 1 ラウンド分のみを責務とする。
* 難易度別パラメータ：

  * Easy: (w_pos=0.4, w_attr=0.6), diversityFactor=1
  * Normal: (w_pos=0.25, w_attr=0.75), diversityFactor=0.6〜1（ユニークビーズ種類のカバレッジと S_attr で補正）

* 位置スコアは「同じスロットに正解と同一属性のビーズがあるか」を判定（属性が全部一致しない場合は 0）。
* 属性スコアは色・形・サイズの一致度を平均。
* diversityFactor 計算（Normal 用）：

  ```txt
  U_problem = 正解のユニークビーズ種類数（色・形・サイズ組み合わせ）
  U_answer  = 回答のユニークビーズ種類数
  coverage  = min(1, U_answer / U_problem)
  diversityFactor = 0.6 + 0.4 * coverage * S_attr
  ```

  同じビーズ 1 種で埋めてもスコアが 60% まで圧縮される（属性一致率が低いほど factor が下がる）。

---

## 4. 状態管理設計

### 4.1 GameState と Reducer

`src/state/gameReducer.ts`

```ts
import { GamePhase, Difficulty, Problem, Slot, ResultRank, RoundNumber } from '../domain/gameTypes';

export type GameState = {
  phase: GamePhase;
  difficulty: Difficulty;
  currentProblem: Problem | null;
  currentPlacement: Slot[];
  score: number | null;
  rank: ResultRank | null;
  // ラウンド管理
  currentRound: RoundNumber;   // 1〜3
  roundScores: number[];       // 各ラウンドのスコア履歴
  totalScore: number;          // roundScores の合計
  showTotalSummary: boolean;   // Round3 後の合計ポイント発表表示フラグ
};

```

`src/state/gameActions.ts`

```ts
import { Difficulty, Problem, Slot, GamePhase } from '../domain/gameTypes';
import { ScoreResult } from '../domain/scoreCalculator';

export type GameAction =
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'SET_PROBLEM'; problem: Problem }
  | { type: 'RESET_PLACEMENT'; slots: Slot[] }
  | { type: 'UPDATE_SLOT'; slotIndex: number; bead: Slot['bead'] }
  | { type: 'SET_SCORE'; scoreResult: ScoreResult } // reducer 内で roundScores / totalScore も更新
  | { type: 'ADVANCE_ROUND' }                        // currentRound を +1（上限 MAX_ROUNDS）
  | { type: 'RESET_ROUNDS' }                         // currentRound=1, roundScores=[], totalScore=0, showTotalSummary=false
  | { type: 'SET_TOTAL_SUMMARY_VISIBLE'; visible: boolean }
  | { type: 'RESET_GAME' }; // 必要なら
```

`gameReducer` は `GameState` の更新のみを責務とし、問題生成・採点呼び出しは `App.tsx` 側に置くことで SRP を維持する。

### 4.2 状態遷移

* `App` 内で以下のハンドラを実装：

1. `startProblem`

  * 難易度設定取得
  * （セッション開始時）`SET_TOTAL_SUMMARY_VISIBLE(false)` にして合計発表ビューを閉じる
  * 問題生成
  * `SET_PROBLEM`, `RESET_PLACEMENT`, `SET_PHASE('showing')`
  * タイマーで `showDurationMs` 後に `SET_PHASE('reproduce')`

2. `placeBead(slotIndex, bead)`

   * `UPDATE_SLOT`（`currentPlacement` の該当 index を更新）

3. `clearBead(slotIndex)`

   * `UPDATE_SLOT`（`bead: null`）

4. `finishReproduceAndScore`

  * 採点ロジック呼び出し
  * `SET_SCORE`（score, rank, per-slot スコア）しつつ `roundScores` / `totalScore` を更新
  * `SET_PHASE('result')`

5. `goNextFromResult`

  * Round1 / Round2：`ADVANCE_ROUND` → `RESET_PLACEMENT` → `SET_PHASE('idle')` → 次の `startProblem`
  * Round3：`SET_TOTAL_SUMMARY_VISIBLE(true)`（`showTotalSummary` 表示）、`SET_PHASE('idle')` で操作をロック
  * NEXT 押下時に `RESET_PLACEMENT` を呼んで、次の問題の提示前に入力をクリアする

6. `restartFromSummary`

  * 合計ポイント発表ビュー上のボタンで呼ばれる
  * `RESET_ROUNDS` → `RESET_PLACEMENT` → `SET_PHASE('idle')`

---

## 5. コンポーネント設計

### 5.1 コンポーネント階層

* `App`

* `RoundStatus`（隣に難易度切替ボタンを配置）
* `GameBoard`
* `ResultView`（phase === 'result' のときのみ）
* `RoundSummary`（Round3 後に showTotalSummary が true のときのみ）
* `BeadStock`
* `Controls`

### 5.2 App.tsx

責務：

* `useReducer` による `GameState` 管理
* ドメインロジック（問題生成・採点）の呼び出し
* ラウンド進行（Round1〜3）と合計ポイント発表の制御
* 子コンポーネントへの props 渡し

設計ポイント：

* 画面レイアウトも `App` で組み立てる（上段／中段／下段の配置）
* SRP を維持するため、描画ロジックは子コンポーネントに委譲
* `reproduce` 以外では「ビーズをえらんでね」（ストック内）のビーズのみ非活性表現（半透明・カーソル変更）にする。問題表示・答え合わせ用のビーズは常に活性表示。

### 5.3 GameBoard

`src/components/GameBoard/GameBoard.tsx`

責務：

* 上段のスロット列を表示
* `phase` に応じて表示内容を切り替える

仕様：

* `phase === 'showing'` のとき：`currentProblem.slots` のビーズを表示
* `phase === 'reproduce'` のとき：`currentPlacement` のビーズを表示
* ドラッグ＆ドロップ／クリックによる配置・削除を扱う

props：

* `phase: GamePhase`
* `problem: Problem | null`
* `placement: Slot[]`
* `onSlotDrop(slotIndex: number, bead: Bead): void`
* `onSlotClear(slotIndex: number): void`

### 5.4 Slot

`src/components/Slot/Slot.tsx`

責務：

* 1 マス分の枠とビーズ表示
* 状態に応じた枠色（特に `ResultView` 内使用時）

props（利用箇所に応じて２モードを統一）：

* `slot: Slot`
* `onDrop?: (bead: Bead) => void`
* `onClick?: () => void`
* `borderColor?: 'default' | 'green' | 'yellow' | 'red'`（結果表示時の枠色）

### 5.5 Bead

`src/components/Bead/Bead.tsx`

責務：

* ビーズの視覚的な描画のみ
* 色・形・サイズを CSS クラスにマッピング

props：

* `bead: Bead`
* `draggable?: boolean`
* `onDragStart?`
* `onClick?`

### 5.6 BeadStock

`src/components/BeadStock/BeadStock.tsx`

責務：

* ストックに並ぶビーズ一覧の表示
* ドラッグ開始イベントの起点

props：

* `beads: Bead[]`
* `onBeadDragStart(bead: Bead): void`
* （代替操作を入れる場合）`onBeadSelect?(bead: Bead): void`

### 5.7 ResultView

`src/components/ResultView/ResultView.tsx`

責務：

* `result` フェーズ専用の比較表示とスコア表示、次へボタン

props：

* `problem: Problem`
* `placement: Slot[]`
* `score: number`
* `rank: ResultRank`
* `positionScores: number[]`
* `attributeScores: number[]`
* `currentRound: RoundNumber`
* `maxRound: number`（常に 3）
* `onNext(): void`

主要表示内容：

* 左：正解スロット列（`Slot` コンポーネントを利用）
* 右：ユーザースロット列
* 各スロット毎に `borderColor` を設定（緑／黄／赤）
* 中央：スコア数値とランクアイコン
* 下：BTN_NEXT（Round3 では「合計をみる」などのラベルに変更してもよい）

### 5.8 Controls

`src/components/Controls/Controls.tsx`

責務：

* 再生ボタン・回答ボタン・リセットボタン・難易度切替ボタンの表示とイベント発火

props：

* `phase: GamePhase`
* `difficulty: Difficulty`
* `onStart(): void`
* `onOk(): void`
* `onReset(): void`
* `onToggleDifficulty(): void`

設計ポイント：

* ボタン活性ルールを UI レベルで一元管理する

| ボタン          | idle | showing | reproduce | result | 合計発表表示中 |
| -------------- | ---- | ------- | --------- | ------ | -------------- |
| 再生（PLAY）     | 有効 | 無効    | 無効      | 無効   | 無効           |
| 回答（ANSWER）   | 無効 | 無効    | 有効      | 無効   | 無効           |
| リセット         | 有効 | 無効    | 有効      | 無効   | 無効           |
| 難易度切替       | 有効 | 無効    | 無効      | 無効   | 無効           |
| つぎへ（NEXT）   | 非表示 | 非表示  | 非表示    | 有効   | 無効（合計発表が優先） |
| もう一度あそぶ   | 非表示 | 非表示  | 非表示    | 非表示 | 有効           |

補足：

* `result` 中は再生ボタンを無効にし、同ラウンドの問題再提示を防ぐ。
* Round3 結果後は合計発表ビューを表示し、再生／難易度切替は無効、リスタート専用ボタンのみ有効にする。
* OK ボタンは `reproduce` でのみ有効。ビーズ未配置時は UI で無効化してもよい。

### 5.9 PhaseIndicator

`src/components/PhaseIndicator/PhaseIndicator.tsx`

責務：

* 現在のフェーズをアイコンで表示
* `idle`：再生アイコン
* `showing`：目アイコン
* `reproduce`：手アイコン
* `result`：星アイコン

props：

* `phase: GamePhase`

---

### 5.10 RoundStatus

`src/components/RoundStatus/RoundStatus.tsx`

責務：

* 現在のラウンド進行状況（例：`Round 2 / 3`）を表示
* 難易度切替ボタンと横並びに配置し、セッションの残数を明示

props：

* `currentRound: RoundNumber`
* `maxRound: number`（3）

---

### 5.11 RoundSummary

`src/components/RoundSummary/RoundSummary.tsx`

責務：

* 3 ラウンド終了後の合計ポイントを大きく表示するビュー
* 各ラウンドの獲得点リストと、合計（最大 300 点）を視覚的に強調

props：

* `roundScores: number[]`
* `totalScore: number`
* `onRestart(): void`（Round1 へ戻す）

表示：

* 合計ポイントを中央に大きく表示し、背景色やエフェクトで強調
* Round1〜3 のスコアをサブリスト表示（任意）
* 「もう一度遊ぶ」ボタンで `onRestart` を呼び、ラウンド状態をリセット

## 6. スタイル設計

* `global.css` でベースフォント・背景色・リセット等を定義
* 各コンポーネントは対応する CSS ファイル内でスタイル定義し、クラス名はコンポーネント名をプレフィックスに付与

  * 例：`.GameBoard-root`, `.Slot-frame`, `.Bead-circle-small` など
* レイアウトは Flexbox で上下 3 分割を実現
* レスポンシブ対応（768px 未満）：

  * スロットやビーズのサイズを縮小し、比較ビューは 1 カラム表示に切替。
  * ストックを複数列から自動フィットに変更。
  * ボタンは幅100%を許容してタップ領域を確保。
  * フォントサイズと余白を微縮小（0.85〜0.9倍相当）で視認性を維持。
* トーン＆マナー：

  * UIテキストはひらがな中心（漢字・英語は避けるが、外来語はカタカナ表記—例: ビーズ・ドラッグ・タップ）。
  * 子ども向けにやさしい色調（ライトテーマ基調、性別ニュートラルなパレット）と丸みのある角を採用。
  * メッセージは短く前向きな声がけで統一。
* アニメーション方針：

  * ビーズのホバー／フォーカスで回転・拡縮・色変化は行わない（形や状態が変わったと誤解しないようにする）。
  * 必要に応じてフェードなどの穏やかなトランジションのみ許容。

---

## 7. コーディングルール適用方針

要求されたルールに対する設計への落とし込み：

1. **DRY 原則**

   * 型定義は `gameTypes.ts` に集約
   * 難易度設定は `difficulty.ts` に集約
   * 問題生成・採点ロジックは `domain` 配下でモジュールごとに完結させ、コンポーネント側で重複実装しない。

2. **単一責任の原則**

   * 1 コンポーネント＝1つの明確な UI 役割（`ResultView` は結果表示のみなど）
   * `problemGenerator` は問題生成のみ、`scoreCalculator` はスコア計算のみ。

3. **命名**

   * 目的が明確なクラス名・関数名・変数名を採用

     * 例：`startProblem`, `finishReproduceAndScore`, `getDifficultyConfig` など

4. **コードのシンプルさ**

   * ネストを深くしない（早期 return を積極利用）
   * 巨大関数は分割する
   * UI ロジックとドメインロジックを分離し、見通しを良くする。

5. **1 ファイル 1 クラス（1 コンポーネント）**

   * 各コンポーネント・各ドメインモジュールを専用ディレクトリ／専用ファイルに分離
   * 型定義ファイルも 1 つの責務に限定（ゲームドメイン型のみ）。

6. **コメントは必要最低限**

   * 自明でないビジネスルール部分（スコア計算式など）にのみ短いコメント
   * それ以外は命名と構造で可読性を確保

---

## 8. テスト方針（概要）

* 単体テスト対象：

  * `problemGenerator`（問題生成の正当性・ビーズ数など）
  * `scoreCalculator`（典型ケースのスコア・ランクが仕様通りか）
* テストフレームワーク（任意）：

  * Jest + React Testing Library（導入する場合）
* 優先度：

  * ドメインロジック（問題生成・採点）はテスト優先
  * UI は手動テスト中心（フェーズ遷移・D&D 操作の確認）
