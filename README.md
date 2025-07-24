# PointCloud Slide ユーザーガイド

このリポジトリは、ウェブブラウザで実行できるプレゼンテーションシステムです。以下では、プレゼンを自分のPCで表示する方法と、スライド内容を変更する手順を説明します。

## 主な特徴

- YAML 形式でスライドを定義でき、テンプレートを基に手軽に編集可能
- highlight.js によるコードハイライト表示
- three.js を用いた点群データの3D描画機能
- MathJax を利用した数式表示のサポート
- スピーカーノート表示とタイマー計測機能
- ダーク/アカデミック/フォレスト/オーシャンの4種類のテーマ切り替え
- ボタン一つで全スライドを PDF として保存
- レーザーポインタやフルスクリーン表示など発表支援ツール

## 必要なもの

- Python 3（簡易サーバーを起動するために使用します）
- Node.js と npm（TypeScript をビルドするために使用します）
- 最新のウェブブラウザ（Google Chrome、Firefox など）
- Docker（Python環境を用意しなくても実行できます）

## プレゼンを表示する手順

1. このリポジトリの内容を任意のフォルダに展開します。
2. ターミナル（コマンドプロンプト）でそのフォルダに移動し、依存関係をインストールしてビルドします。

   ```bash
   npm ci
   npm run build
   ```

3. サーバーを起動するには次のいずれかを実行してください。

   - 簡易サーバーを直接起動する場合

     ```bash
     python3 -m http.server 8000
     ```

   - 同梱の `serve.py` を使用してブラウザを自動的に開く場合

     ```bash
     python3 serve.py [--port 任意のポート番号]
     `serve.py` は指定ポートが利用できない場合、自動的に空いているポートを使用します。
     ```

4. サーバー起動後、ターミナルに表示された URL (例: `http://localhost:8000/index.html`) にアクセスするとプレゼンテーションが表示されます。

> **補足:** `index.html` から `slides.yaml` を取得する際、ブラウザのセキュリティ制限によりファイルを直接開く（`file:///`）だけでは動作しません。必ず上記のようにローカルサーバーを起動してください。

## Docker で実行する

Docker を利用してサーバーを起動することもできます。Dockerfile には Node.js でのビルド処理が含まれているため、追加の操作は必要ありません。以下のコマンドを順に実行してください。

```bash
docker build -t pointcloud-slide .
docker run --rm -p 8000:8000 pointcloud-slide
```

変更をリアルタイムで反映させながら編集したい場合は、ホストのフォルダをコンテナにマウントします。

```bash
docker run --rm -p 8000:8000 -v $(pwd):/app pointcloud-slide
```

その後、`http://localhost:8000/index.html` をブラウザで開くとプレゼンテーションが表示されます。


## スライド内容の変更方法

スライドのデータは `slides.yaml` に記述されています。テキストエディタでこのファイルを編集することで、スライドのタイトルやリスト項目、画像などを変更できます。

```yaml
editableSlides:
  - type: title
    title: "Deconstructing a Web-Based Presentation"
    author: "A deep dive into modern web technologies"
    date: "July 23, 2025"
```

- `editableSlides` セクション内に表示したいスライドを順番に記述します。
- 以前存在した `fixedSlides` セクションは廃止され、すべてのスライドを `editableSlides` に記述します。
- スライドの種類（`type`）によって利用できるプロパティが異なります。
- `defaultFooterText` を指定すると、各スライドで `footerText` を書かなくても共通のフッターを表示できます。

### ブラウザで YAML を編集する

サーバー起動後に `editor.html` を開くと、GUI でスライドファイルを編集できます。`Import` ボタンで既存の YAML を読み込み、`Add Slide` でスライドを追加します。各スライドを選択すると右側に編集フォームが表示され、`Download YAML` で保存できます。

### 独自の YAML ファイルを使用する

`Slide/` ディレクトリにプレゼン用の YAML ファイルを置くと、`.gitignore` により Git の管理対象外となります。読み込むファイルは `yaml` クエリパラメータで指定できます。

```bash
http://localhost:8000/index.html?yaml=Slide/my_presentation.yaml
```

パラメータを省略した場合は既定の `slides.yaml` が読み込まれます。

### `data/` ディレクトリにメディアを置く

リポジトリ直下に `data/` ディレクトリを作成しておくと、画像・動画・点群などの
メディアファイルを配置できます。`data/` は `.gitignore` により Git の管理対象外
となるため、大きなファイルを気にせず保存できます。

スライドからこれらのファイルを参照する場合は、各スライドで次のプロパティを指定
します。

```yaml
- type: image
  imageSrc: "data/example.png"

- type: video
  videoSrc: "data/movie.mp4"

- type: pointCloud
  pointCloudSrc: "data/points.txt"
  # 色付きの点群データは自動的に認識されます
```

パスは `index.html` からの相対パスで記述してください。

### YAML の検証

スライドファイルを編集したあとは、JSON Schema に基づく検証を行うことができます。

```bash
python tools/validate_slides.py slides.yaml
```

初回は `pip install jsonschema PyYAML` を実行して依存パッケージをインストールしてください。

## スライドテンプレートの利用方法

本リポジトリには `slides_template.yaml` を同梱しています。新しいプレゼンテーションを作成する際はこのファイルをコピーし、内容を編集して `slides.yaml` として保存してください。

### 利用できる型一覧

| type | 主なプロパティ | 説明 |
|------|----------------|------|
| `title` | `title`, `author`, `date`, `notes` | タイトルスライド |
| `list` | `header`, `title`, `content`, `footerText` | 箇条書きのスライド。`content` 配下に `text` などを記入します |
| `code` | `header`, `title`, `language`, `code` | ソースコードを表示します |
| `pointCloud` | `header`, `title`, `points`, `pointCloudSrc`, `fileInputId`, `useVertexColors` | 点群データを three.js で描画します |
| `image` | `header`, `title`, `imageSrc`, `fileInputId` | 画像の表示用スライド |
| `video` | `header`, `title`, `videoId`, `videoSrc`, `fileInputId` | YouTube もしくはローカル動画を再生します |
| `end` | `title` | 終了画面 |

各型のプロパティは必要に応じて追加できます。詳しくは `slides_template.yaml` のコメントを参考にしてください。

### 型定義ファイル

スライドデータの構造を厳密に扱いたい場合は、TypeScript 用の `slideTypes.ts` と
JSON スキーマ `slides.schema.json` を利用できます。IDE の補完や検証に役立ちます。

### ローカルファイルの利用

`image`、`video`、`pointCloud` の各スライドでは `fileInputId` プロパティを指定することで、
スライド表示時にローカルファイルを読み込むことができます。指定した ID は自動生成される
`<input type="file">` 要素の ID として使用され、スライドを開くとファイル選択ダイアログが
表示されます。

```yaml
- type: image
  title: "ローカル画像の表示"
  fileInputId: "local-image"

- type: video
  title: "ローカル動画の再生"
  fileInputId: "local-video"    # videoId を省略します

- type: pointCloud
  title: "ローカル点群"
  fileInputId: "local-point-cloud"
```

動画の場合は `videoId` を省略し、`fileInputId` のみを指定してください。点群ファイルは
`x y z` や `x,y,z` など空白またはカンマ区切りで `r,g,b` を含めることもできるテキスト（CSV 等）を読み込みます。
色値は 0-1 または 0-255 のどちらでも構いません。
ファイルを選択すると、その内容がすぐにスライドへ反映されます。

### `slides.yaml` の詳細

`slides.yaml` は以下のようなトップレベル構造を持ちます。

```yaml
defaultFooterText: "発表者名"
fontScale: 1.25
editableSlides:
  - type: title
    # 以降に各スライドを記述
```

- **defaultFooterText**: 各スライドの `footerText` が省略されたときに表示する共通のフッター文字列。
- **fontScale**: 1 を基準とした文字サイズの倍率。数値を大きくすると全体の文字が大きくなります。
- **editableSlides**: スライドオブジェクトの配列。順番に表示されます。

#### スライド共通プロパティ

- **type**: スライドの種類 (`title`, `list`, `code`, `image`, `video`, `pointCloud`, `end` のいずれか)。
- **header**: 任意のセクション見出し。
- **title**: スライドタイトル。
- **footerText**: 個別のフッター文字列。未指定なら `defaultFooterText` が使用されます。
- **notes**: 発表者用ノート。`Notes` ボタンで確認できます。
- **fileInputId**: ローカルファイルを読み込むスライドで使用する入力要素の ID。
- **zoomable**: 画像やコード等をクリックで拡大表示する場合に `true` を指定。

#### タイプ別の追加プロパティ

**title**
- `author`: 発表者名
- `date`: 日付

**list**
- `ordered`: `true` で番号付きリスト、`false` でドットの箇条書き (省略時は `true`)
- `content`: リスト項目の配列。要素は文字列、または以下を含むオブジェクトを指定できます。
  - `text`: 表示する文字列
  - `fragment`: `true` にすると項目を順に表示
  - `jumpTo`: クリックしたときに移動するスライド番号
- `content` は必須で、項目がない場合でも空の配列 `[]` を指定してください。

**code**
- `subTitle`: コードに付随する小見出し
- `text`: 説明文
- `language`: シンタックスハイライト用の言語名
- `code`: 表示するソースコード
- `zoomable`: コードブロックを拡大可能にするか

**image**
- `imageSrc`: 画像ファイルのパス
- `caption`: 画像の説明文
- `math`: 数式を表示したい場合に使用
- `fileInputId`: ローカル画像を読み込むための ID
- `zoomable`: 画像を拡大表示するか

**video**
- `videoId`: YouTube の動画 ID
- `fileInputId`: ローカル動画を読み込むための ID
- `caption`: 動画の説明文
- `zoomable`: 動画を拡大表示するか

**pointCloud**
- `points`: 乱数で生成する点の数（`fileInputId` がない場合に使用）
- `fileInputId`: ローカルの点群ファイルを読み込む ID
- `pointCloudSrc`: 点群データを含むテキストファイルのパス
- `useVertexColors`: `true` を指定すると強制的にカラー表示を行います。省略しても r,g,b 値があれば自動的に判定します (値は 0-1 または 0-255 を想定)
- `caption`: 点群の説明文
- `zoomable`: 点群表示を拡大するか

**end**
- 特別なプロパティはありません。`title` のみを指定します。

変更を保存したら、ブラウザをリロードすることで更新後のスライドを確認できます。

## フォントサイズの調整

全体の文字サイズは `style.css` で定義されている `--font-scale` 変数、または
`slides.yaml` の `fontScale` プロパティで調整できます。デフォルトでは `1.25` が
指定されており、数値を変更することでお好みの大きさに変更可能です。

```css
:root {
    --font-scale: 1.25; /* 例: 1.5 にするとさらに大きく表示されます */
}
```

`slides.yaml` に記述する場合は次のようにします。

```yaml
fontScale: 1.25  # 例: 1.5 にすると文字が大きく表示されます
```

変更後にブラウザをリロードすると反映されます。

## テーマの切り替え

画面下部の **Theme** ボタンをクリックするごとに、スライドの配色テーマが順番に切り替わります。
初期状態のダークテーマに加え、アカデミック・フォレスト・オーシャンの計4種類から選択可能です。
シンタックスハイライトもテーマに合わせて自動で変更されます。

## スライドをPDFで保存

プレゼン表示中にナビゲーションの **PDF** ボタンをクリックすると、すべてのスライドを1つの PDF ファイルとしてダウンロードできます。キーボードの `P` キーでも同じ操作が可能です。

> **Note:** PDF 生成には `html2canvas` を利用しているため、インターネット上の画像やフォントを使用する場合は CORS 設定が必要です。PDF が真っ白になるときは、外部リソースへのアクセスを確認してください。

## 開発環境の構築

本リポジトリは Vite と TypeScript を使用して構築されています。コードを変更しながら確認したい場合は次の手順で開発サーバーを起動します。

```bash
npm install        # 初回のみ依存パッケージを取得
npm run dev        # http://localhost:5173/ で自動リロード付きサーバーが起動
```

配布用のファイルを生成するには以下を実行してください。

```bash
npm run build
```

`dist/` フォルダに `bundle.js` が出力されます。ビルド後は通常の静的サーバーで `index.html` を開くことができます。

## リポジトリ構成

| ファイル | 役割 |
| -------- | ---- |
| `index.html` | スライド表示用のメイン HTML |
| `main.js` | スライドの読み込みや操作を司る JavaScript |
| `editor.html` | YAML 編集用の GUI |
| `editor.js` | `editor.html` 用のスクリプト |
| `style.css` | テーマやレイアウトを定義するスタイルシート |
| `slides.yaml` | サンプルのスライドデータ |
| `slides_template.yaml` | 新しいプレゼン作成用のテンプレート |
| `serve.py` | ローカルサーバー起動用の補助スクリプト |
| `Dockerfile` | Docker イメージ作成用の設定 |
| `tools/validate_slides.py` | YAML をスキーマで検証するツール |

## Windows向け実行ファイルの作成

Python がインストールされていない環境でも `serve.py` を実行できるよう、
PyInstaller を利用して単一の実行ファイルを作成できます。

1. 依存パッケージをインストールします。

```bash
pip install -r requirements.txt
```

2. ビルドスクリプトを実行します。

```bash
python tools/build_exe.py
```

`dist/serve.exe` (Linux では `dist/serve`) が生成されます。
起動するとサーバーが立ち上がり、自動でブラウザが開きます。



## ライセンス

このリポジトリのコンテンツはパブリックドメインとします。

