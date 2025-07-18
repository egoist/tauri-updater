import semver from 'semver'
import { json, notFound, noUpdateAvailable } from '../lib/response'
import { validatePlatform, AVAILABLE_PLATFORMS } from '../lib/platforms'
import { fetchGitHubAsset } from '../lib/download-github-asset'
import { getLatestRelease } from '../lib/get-latest-release'
import { Bindings } from '../lib/bindings'

// https://github.com/tauri-apps/tauri/blob/9b793eeb68902fc6794e9dc54cfc41323ff72169/core/tauri/src/updater/core.rs#L916
export type Arch = 'i686' | 'x86_64' | 'armv7' | 'aarch64'

const hasKeywords = (str: string, keywords: string[]) =>
  keywords.some((k) => str.includes(k))

export default async function ({
  bindings,
  username,
  reponame,
  platform,
  version,
  rootUrl,
  arch,
}: {
  bindings: Bindings
  username: string
  reponame: string
  platform: string
  version: string
  rootUrl: string
  arch: Arch
}): Promise<Response> {
  // Make sure the platform is valid
  if (!platform || !validatePlatform(platform)) {
    return notFound()
  }

  // Make sure our version is semver valid
  if (!version || !semver.valid(version)) {
    return notFound()
  }

  // Headers
  const release: any = await getLatestRelease(bindings, username, reponame)

  if (!release) {
    return notFound()
  }

  console.log('found release', release)

  // Sanitize our version
  const remoteVersion = sanitizeVersion(release.tag_name.toLowerCase())

  // Make sure we found a valid version
  if (!remoteVersion || !semver.valid(remoteVersion)) {
    return notFound()
  }

  // Check if the user is running older version or not
  const shouldUpdate = semver.gt(remoteVersion, version)
  if (!shouldUpdate) {
    console.log('no update available')
    return noUpdateAvailable()
  }

  for (const asset of release.assets) {
    const { name, url: assetUrl, name: filename } = asset
    const findPlatform = checkPlatform(platform, arch, name)
    if (!findPlatform) {
      continue
    }

    // try to find signature for this asset
    const signature = await findAssetSignature(bindings, name, release.assets)

    const result = {
      name: release.tag_name,
      notes: release.body,
      pub_date: release.published_at,
      signature,
      url: `${rootUrl}/github/download-asset?${new URLSearchParams({
        asset: assetUrl,
        filename,
      }).toString()}`,
    }

    return json(result)
  }

  return notFound()
}

function sanitizeVersion(version: string): string {
  // if it start with v1.0.0 remove the `v`
  if (version.charAt(0) === 'v') {
    return version.substring(1)
  }

  return version
}

function getArch(fileName: string) {
  return fileName.includes('aarch64')
    ? 'aarch64'
    : fileName.includes('arm64')
    ? 'armv7'
    : hasKeywords(fileName, ['x64', 'amd64', 'win64'])
    ? 'x86_64'
    : hasKeywords(fileName, ['i686', 'win32', 'x32'])
    ? 'i686'
    : fileName.includes('universal')
    ? 'universal'
    : 'x86_64'
}

function checkPlatform(platform: string, arch: Arch, fileName: string) {
  const extension = extname(fileName)
  const _arch = getArch(fileName)

  // OSX we should have our .app tar.gz
  if (
    hasKeywords(fileName, ['.app', 'darwin', 'osx']) &&
    extension === 'gz' &&
    platform === AVAILABLE_PLATFORMS.MacOS
  ) {
    if (
      arch === _arch ||
      (arch === 'aarch64' && _arch === 'armv7') ||
      hasKeywords(fileName, ['universal'])
    ) {
      return 'darwin'
    }
  }

  // Windows
  if (
    hasKeywords(fileName, [
      'win64',
      'win32',
      'windows',
      '.msi',
      '.nsis',
      '.exe',
    ]) &&
    platform === AVAILABLE_PLATFORMS.Windows
  ) {
    if (_arch === arch) {
      return 'windows'
    }
  }

  // Linux app image
  if (
    fileName.includes('AppImage') &&
    extension === 'gz' &&
    platform === AVAILABLE_PLATFORMS.Linux
  ) {
    if (_arch === arch) {
      return 'linux'
    }
  }
}

function extname(filename: string) {
  return filename.split('.').pop() || ''
}

async function findAssetSignature(
  bindings: Bindings,
  fileName: string,
  assets: any[]
) {
  // check in our assets if we have a file: `fileName.sig`
  // by example fileName can be: App-1.0.0.zip
  const foundSignature = assets.find(
    (asset) => asset.name.toLowerCase() === `${fileName.toLowerCase()}.sig`
  )

  if (!foundSignature) {
    return null
  }

  const response = await fetchGitHubAsset(bindings, foundSignature.url)
  if (!response.ok) {
    console.error(
      `failed to get signature for ${fileName}: ${await response.text()}`
    )
    return null
  }
  const signature = await response.text()
  return signature
}
