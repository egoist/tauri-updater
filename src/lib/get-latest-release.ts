import { Bindings } from './bindings'
import { USER_AGENT } from './constants'

export const getLatestRelease = async (
  bindings: Bindings,
  username: string,
  reponame: string
) => {
  const url = `https://api.github.com/repos/${username}/${reponame}/releases/latest`
  console.log('getting latest release', url)
  // Headers
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.preview',
    // chrome
    'user-agent': USER_AGENT,
  }

  // Add github token if provided
  if (bindings.GITHUB_TOKEN && bindings.GITHUB_TOKEN.length > 0) {
    headers.Authorization = `token ${bindings.GITHUB_TOKEN}`
  }

  // Get JSON from github
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
  })

  if (!response.ok) return null

  return response.json()
}
