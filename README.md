# Tauri Updater Server

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

## Development

```
npm install
npm run dev
```

```
npm run deploy
```
