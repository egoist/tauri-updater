export enum AVAILABLE_PLATFORMS {
  MacOS = 'darwin',
  Windows = 'windows',
  Linux = 'linux',
}

export function validatePlatform(platform: string): string | undefined {
  switch (platform) {
    case AVAILABLE_PLATFORMS.MacOS:
    case AVAILABLE_PLATFORMS.Windows:
    case AVAILABLE_PLATFORMS.Linux:
      return platform
  }
}
