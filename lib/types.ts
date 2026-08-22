export type ProfileRole = "admin" | "editor" | "reporter";
export type ArticleStatus =
  | "draft"
  | "in_review"
  | "scheduled"
  | "published"
  | "archived";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  role: ProfileRole;
  created_at: string;
}

export interface Category {
  id: string;
  name_hi: string;
  name_en: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ArticleImage {
  id: string;
  article_id: string;
  position: number;
  storage_path: string;
  thumbnail_path: string;
  card_path: string;
  original_path: string | null;
  width: number | null;
  height: number | null;
  alt_text: string;
  caption: string | null;
  credit: string | null;
  focal_x: number;
  focal_y: number;
  created_at: string;
}

export interface Article {
  id: string;
  headline: string;
  dek: string | null;
  slug: string;
  body: Record<string, unknown>;
  category_id: string;
  city_tag: string | null;
  status: ArticleStatus;
  author_id: string | null;
  guest_author_name: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  is_breaking: boolean;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  og_image_id: string | null;
  robots_index: boolean;
}

export interface ArticleWithRelations extends Article {
  category: Category;
  images: ArticleImage[];
  tags: Tag[];
}

export interface ArticleListItem extends Article {
  category: Pick<Category, "id" | "name_hi" | "slug">;
}
