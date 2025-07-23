# PointCloud Slide ユーザーガイド

このリポジトリは、ウェブブラウザで実行できるプレゼンテーションシステムです。以下では、プレゼンを自分のPCで表示する方法と、スライド内容を変更する手順を説明します。

## 必要なもの

- Python 3（簡易サーバーを起動するために使用します）
- 最新のウェブブラウザ（Google Chrome、Firefox など）
- Docker（Python環境を用意しなくても実行できます）

## プレゼンを表示する手順

1. このリポジトリの内容を任意のフォルダに展開します。
2. ターミナル（コマンドプロンプト）でそのフォルダに移動します。
   サーバーを起動するには次のいずれかを実行してください。

   - 簡易サーバーを直接起動する場合

     ```bash
     python3 -m http.server 8000
     ```

   - 同梱の `serve.py` を使用してブラウザを自動的に開く場合

     ```bash
     python3 serve.py [--port 任意のポート番号]
     `serve.py` は指定ポートが利用できない場合、自動的に空いているポートを使用します。
     ```

3. サーバー起動後、ターミナルに表示された URL (例: `http://localhost:8000/index.html`) にアクセスするとプレゼンテーションが表示されます。

> **補足:** `index.html` から `slides.yaml` を取得する際、ブラウザのセキュリティ制限によりファイルを直接開く（`file:///`）だけでは動作しません。必ず上記のようにローカルサーバーを起動してください。

## Docker で実行する

Docker を利用してサーバーを起動することもできます。以下のコマンドを順に実行してください。

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
- `fixedSlides` セクションはテンプレートとして固定されており、通常は変更不要です。
- スライドの種類（`type`）によって利用できるプロパティが異なります。

## スライドテンプレートの利用方法

本リポジトリには `slides_template.yaml` を同梱しています。新しいプレゼンテーションを作成する際はこのファイルをコピーし、内容を編集して `slides.yaml` として保存してください。

### 利用できる型一覧

| type | 主なプロパティ | 説明 |
|------|----------------|------|
| `title` | `title`, `author`, `date`, `notes` | タイトルスライド |
| `list` | `header`, `title`, `content`, `footerText` | 箇条書きのスライド。`content` 配下に `text` などを記入します |
| `code` | `header`, `title`, `language`, `code`, `zoomable` | ソースコードを表示します |
| `pointCloud` | `header`, `title`, `points`, `fileInputId`, `zoomable` | 点群データを three.js で描画します |
| `image` | `header`, `title`, `imageSrc`, `fileInputId`, `zoomable` | 画像の表示用スライド |
| `video` | `header`, `title`, `videoId`, `fileInputId`, `zoomable` | YouTube もしくはローカル動画を再生します |
| `end` | `title` | 終了画面 |

各型のプロパティは必要に応じて追加できます。詳しくは `slides_template.yaml` のコメントを参考にしてください。

変更を保存したら、ブラウザをリロードすることで更新後のスライドを確認できます。

## フォントサイズの調整

全体の文字サイズは `style.css` で定義されている `--font-scale` 変数で調整できます。
デフォルトでは `1.25` が指定されており、数値を変更することでお好みの大きさに変更可能です。

```css
:root {
    --font-scale: 1.25; /* 例: 1.5 にするとさらに大きく表示されます */
}
```

変更後にブラウザをリロードすると反映されます。

## ライセンス

このリポジトリのコンテンツはパブリックドメインとします。

