/** Stable Unsplash CDN URLs (photo-* IDs verified on images.unsplash.com). */
export function unsplashPhoto(photoPath: string, width = 1200): string {
  return `https://images.unsplash.com/${photoPath}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=80`;
}
