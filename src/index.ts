import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { downloadGitHubAsset } from './lib/download-github-asset'
import github, { Arch } from './providers/github'
import { getLatestRelease } from './lib/get-latest-release'
import type { Bindings } from './lib/bindings'

const app = new Hono<{
  Bindings: Bindings
}>()

app.use('/*', cors())

app.use(async (c, next) => {
  console.log(c.req.method, c.req.url)
  await next()
})

app.all('/github/:username/:reponame/latest', async (c) => {
  const param = c.req.param()
  const release = await getLatestRelease(c.env, param.username, param.reponame)
  if (!release) return c.notFound()
  return c.json(release)
})

app.get('/check/:username/:reponame/:platform/:arch/:version', (c) => {
  console.log('checking updates', c.req.url)
  const url = new URL(c.req.url)
  const params = c.req.param()
  return github({
    ...params,
    bindings: c.env,
    arch: params.arch as Arch,
    rootUrl: `${url.protocol}//${url.host}`,
  })
})

app.get('/github/download-asset', (c) => {
  const asset = c.req.query('asset')
  const filename = c.req.query('filename')
  if (!asset || !filename) return c.notFound()
  return downloadGitHubAsset(c.env, asset, filename)
})

export default app
