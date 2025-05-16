/**
 * News Article Types
 * 
 * These types define the structure of news articles in the application
 */

export interface NewsArticle {
  id: string;
  title: string;
  originalTitle?: string;
  content: string;
  originalContent?: string;
  summary?: string;
  image?: string;
  publishedAt: string;
  source?: string;
  url?: string;
  tags?: string[];
  category: 'thai' | 'international';
  slug?: string;
}

export interface NewsResponseItem {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsResponseItem[];
}
