// Safe to call from client or server - only needs the public project URL.
export function publicImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/article-images/${path}`;
}
