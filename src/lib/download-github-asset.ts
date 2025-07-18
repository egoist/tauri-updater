import { notFound } from './response'
import { Bindings } from './bindings'
import { USER_AGENT } from './constants'

export async function fetchGitHubAsset(bindings: Bindings, asset: string) {
  const headers = {
    Accept: 'application/octet-stream',
    Authorization: `token ${bindings.GITHUB_TOKEN}`,
    'user-agent': USER_AGENT,
  }
  console.log('headers', JSON.stringify(headers, null, 2))
  const response = await fetch(asset, {
    headers,
  })
  return response
}

export async function downloadGitHubAsset(
  bindings: Bindings,
  asset: string,
  filename: string
): Promise<Response> {
  const response = await fetchGitHubAsset(bindings, asset)
  if (!response.ok) {
    console.error(`failed to fetch ${asset}`, await response.text())
    return notFound()
  }
  const headers = new Headers(response.headers)
  // use custom filename if provided
  headers.set('Content-Disposition', `attachment; filename="${filename}"`)
  return new Response(response.body, {
    headers,
  })
}
