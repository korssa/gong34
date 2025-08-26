export type AppStore = "google-play" | "app-store";

export type AppStatus = "published" | "in-review" | "development";

export interface AppItem {
  id: string;
  name: string;
  developer: string;
  description: string;
  iconUrl: string;
  screenshotUrls: string[];
  store: AppStore;
  status: AppStatus;
  rating: number;
  downloads: string;
  views: number;
  likes: number;
  uploadDate: string;
  tags?: string[];
  storeUrl?: string;
  version?: string;
  size?: string;
  category?: string;
}

export interface AppFormData {
  name: string;
  developer: string;
  description: string;
  store: AppStore;
  status: AppStatus;
  tags: string;
  rating: number;
  downloads: string;
  version: string;
  size: string;
  category: string;
  storeUrl: string;
}

export type FilterType = "all" | "latest" | "featured" | "events";

export interface FilterOptions {
  type: FilterType;
  searchQuery?: string;
}

// App Story와 News를 위한 새로운 타입들
export type ContentType = "app-story" | "news";

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  author: string;
  publishDate: string;
  type: ContentType;
  imageUrl?: string;
  tags?: string[];
  isPublished: boolean;
  views: number;
}

export interface ContentFormData {
  title: string;
  content: string;
  author: string;
  type: ContentType;
  tags: string;
  isPublished: boolean;
}
