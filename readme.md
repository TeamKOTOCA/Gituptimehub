# Gituptimehub
<p align="center">
  <img src="https://img.shields.io/github/license/TeamKOTOCA/GitUptimeHub?style=for-the-badge">  <img src="https://img.shields.io/github/stars/TeamKOTOCA/GitUptimeHub?style=for-the-badge">  <img src="https://img.shields.io/github/forks/TeamKOTOCA/GitUptimeHub?style=for-the-badge">  <img src="https://img.shields.io/github/issues/TeamKOTOCA/GitUptimeHub?style=for-the-badge"></p>

<p align="center">使用スタック</p>
<p align="center">
  <img src="https://github.com/TeamKOTOCA/GitUptimeHub/actions/workflows/monitor.yml/badge.svg" alt="Build Status?style=for-the-badge">  <img src="https://img.shields.io/github/deployments/TeamKOTOCA/GitUptimeHub/github-pages?label=GitHub%20Pages&logo=github?style=for-the-badge" alt="Pages Deployment">  <img src="https://img.shields.io/node/v/gh-badges?label=Node.js&logo=node.js&logoColor=white?style=for-the-badge" alt="Node Version"></p>

GituptimehubはGitHub Actions を利用したセルフホスト型の監視システムです。
類似ソフトの[upptime](https://upptime.js.org/)の仕組みを参考にしつつ、より軽量で柔軟な構成を目的として実装されています。
GitHub Actions上で定期的に疎通確認を行い、その結果をGitHub上に記録・可視化することで外部の監視サービスに依存せず、GitHub だけで完結する、障害に強い構成となっています。
(GitHub関連のサービスにのみ依存します。)

## 特徴
* GitHub Actions のみで動作（常駐サーバー不要）
* HTTP / HTTPS エンドポイントの疎通監視
* 定期実行（cron）および手動実行に対応
* 様々なStatusAPIに対応
* GitHub 上に履歴を保存・管理
* upptime より構成が単純で、改造しやすい(setting.jsonを編集するためのページがあります)

## 仕組み概要
1. GitHub Actions が cron で起動
2. 指定されたエンドポイントにリクエストを送信又は各サービスのstatusAPIを叩く
3. レスポンス結果（成功 / 失敗、ステータスコードなど）やAPIの戻り値を記録4. 結果をリポジトリ内に保存（JSON)
4. resultブランチに溜まっているチェック結果をもとに実際にステータスページを作成

## 対応してる外部API
- Discord status API
- OpenAI status API
- CloudFlare status API
- GitHub status API
- Render status API
- Dropbox status API
- Notion status API
- X Developer Platform Status API
- 要求があれば他にも追加します


## 設定方法
### 1. リポジトリを作成
このリポジトリを fork または clone します。
### 2. 監視対象を設定
`setting.json` に監視対象を定義します。ファイルを直に編集してもいいですが、編集ツールとして[準備中](https://example.com)を使用すれば楽に使えます。
### 3. GitHub Actions を有効化
Actions が有効になっていれば、特別な操作は不要です。必要に応じて `.github/workflows/monitor.yml` の cron を調整してください。
### 実行方法
* **自動実行**  cron により５分毎(に設定してますが多分一時間に一、二回程度)に実行されます。
## 制限事項
* リアルタイム監視ではありません
* 高頻度（数分以下）の監視には不向きです
* コードの安全性は担保できません
## ライセンス
このソフトウェアはMITライセンスに基づきます。比較的自由なライセンスですが、なるべくページフッターのリンクは剥がさないようお願いします。
## 補足
このプロジェクトは **商用監視サービスの代替を目的としたものではありません**。
個人サーバーや内部サービスの簡易監視用途を想定しています

# TODO
- [x] チェックとresultへの保存
- [x] 実際に表示するページを作る
- [ ] Documentを作る
- [ ]  Webhook送信機能を作る
- [x] setting.jsonジェネレーター
- [ ] GCPに対応させる
- [ ] AWSに対応させる
- [x] GitHubに対応させる
- [x] Renderに対応させる
- [ ] その他諸々に対応させる
