export type Bindings = {
  GITHUB_TOKEN: string
  KV: KVNamespace
  GITHUB_TOKEN_CHATWISE?: string
}

export const getGitHubToken = (env: Bindings, asset: string) => {
  if (asset.includes('chatwise') && env.GITHUB_TOKEN_CHATWISE) {
    return env.GITHUB_TOKEN_CHATWISE
  }
  return env.GITHUB_TOKEN
}
