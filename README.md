# Tauri Updater Server

## Introduction

This server fetch release assets from GitHub Releases, for example:

![chatkit release](https://cdn.jsdelivr.net/gh/egoist-bot/images@main/uPic/WoNBsT.png)

## Deploy

Run `npm run deploy` to deploy on Cloudflare Workers.

### Private Repo

Please configure `GITHUB_TOKEN` when you are using a private repo to store assets:

```
wrangler secrets put GITHUB_TOKEN
```

## Configure

Update the [endpoint](https://tauri.app/v1/guides/distribution/updater#tauri-configuration) in `tauri.config.json` to:

```
https://ENDPOINT/check/GITHUB_USERNAME/GITHUB_REPO/{{target}}/{{arch}}/{{current_version}}
```

- Replace `ENDPOINT` with your Cloudflare Worker domain.
- Replace `GITHUB_USERNAME` and `GITHUB_REPO` to the one you uploaded your release assets to.

## Assets Naming Pattern

- macOS: ends with `.app.tar.gz`
- Windows: ends with `.msi.zip` or `.nsis.zip`
- Linux: ends with `AppImage.tar.gz`

## Development

```
npm install
npm run dev
```

```
npm run deploy
```
