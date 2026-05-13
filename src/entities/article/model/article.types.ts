export interface ArticleSummary {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
}
