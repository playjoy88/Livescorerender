import { supabase, supabaseAdmin } from './supabaseClient';
import { NewsArticle } from '@/types/news';
import { translateText } from './translationService';

// Base URL for football news APIs
const FOOTBALL_NEWS_API_URL = 'https://newsapi.org/v2/everything';
const THAI_NEWS_API_URL = 'https://thaipbs.or.th/api/news';
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'your-news-api-key';

/**
 * Fetches international football news from NewsAPI.org
 */
export const fetchInternationalNews = async (): Promise<NewsArticle[]> => {
  try {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    
    const fromDate = twoDaysAgo.toISOString().split('T')[0];
    
    const response = await fetch(
      `${FOOTBALL_NEWS_API_URL}?q=football OR soccer&language=en&from=${fromDate}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`,
      { next: { revalidate: 43200 } } // Revalidate every 12 hours
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch international news: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('Invalid response format from News API:', data);
      return [];
    }
    
    // Transform API response to our NewsArticle format
    const articles: NewsArticle[] = await Promise.all(
      data.articles.slice(0, 20).map(async (article: any) => {
        // Translate title and content to Thai
        const translatedTitle = await translateText(article.title, 'en', 'th');
        const translatedContent = await translateText(article.description || article.content, 'en', 'th');
        
        return {
          id: `int_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          title: translatedTitle,
          originalTitle: article.title,
          content: translatedContent,
          originalContent: article.description || article.content,
          summary: translatedContent.substring(0, 150) + '...',
          image: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source.name,
          url: article.url,
          category: 'international',
          slug: createSlug(translatedTitle),
          tags: ['football', 'soccer', 'international']
        };
      })
    );
    
    return articles;
  } catch (error) {
    console.error('Error fetching international news:', error);
    return [];
  }
};

/**
 * Fetches Thai football news
 * This is a placeholder function - in production, you would integrate with a real Thai news API
 */
export const fetchThaiNews = async (): Promise<NewsArticle[]> => {
  try {
    // For a real implementation, you would call a Thai news API
    // For demonstration, we'll use a sample set
    
    const thaiNewsItems: NewsArticle[] = [
      {
        id: `th_${Date.now()}_1`,
        title: 'เกียรติศักดิ์ เสนาเมือง เข้ารับตำแหน่งเฮดโค้ชทีมชาติไทยชุดใหญ่อีกครั้ง',
        content: 'สมาคมกีฬาฟุตบอลแห่งประเทศไทยฯ ประกาศแต่งตั้ง "ซิโก้" เกียรติศักดิ์ เสนาเมือง อดีตกองหน้าทีมชาติไทย กลับมารับตำแหน่งหัวหน้าผู้ฝึกสอนทีมชาติไทยชุดใหญ่อีกครั้ง',
        summary: 'สมาคมกีฬาฟุตบอลแห่งประเทศไทยฯ ประกาศแต่งตั้ง "ซิโก้" เกียรติศักดิ์ เสนาเมือง...',
        image: 'https://i.imgur.com/KEFZ8Qd.jpg',
        publishedAt: new Date().toISOString(),
        source: 'ไทยรัฐ',
        url: 'https://www.thairath.co.th/sport',
        category: 'thai',
        slug: 'kiattisuk-senamuang-coach-thai-national-team',
        tags: ['ทีมชาติไทย', 'เกียรติศักดิ์ เสนาเมือง']
      },
      {
        id: `th_${Date.now()}_2`,
        title: 'บุรีรัมย์คว้าแชมป์ไทยลีกสมัยที่ 9 สร้างสถิติใหม่',
        content: 'บุรีรัมย์ ยูไนเต็ด สร้างประวัติศาสตร์คว้าแชมป์ไทยลีกสมัยที่ 9 ได้สำเร็จ หลังเปิดบ้านเอาชนะ การท่าเรือ เอฟซี 3-0 ในนัดสุดท้ายของฤดูกาล',
        summary: 'บุรีรัมย์ ยูไนเต็ด สร้างประวัติศาสตร์คว้าแชมป์ไทยลีกสมัยที่ 9 ได้สำเร็จ...',
        image: 'https://i.imgur.com/ZJSckuL.jpg',
        publishedAt: new Date().toISOString(),
        source: 'สยามกีฬา',
        url: 'https://www.siamsport.co.th',
        category: 'thai',
        slug: 'buriram-united-ninth-thai-league-championship',
        tags: ['ไทยลีก', 'บุรีรัมย์ ยูไนเต็ด']
      },
      {
        id: `th_${Date.now()}_3`,
        title: 'ธีรศิลป์ แดงดา ประกาศอำลาทีมชาติไทยหลังจบเอเชียนคัพ',
        content: 'ธีรศิลป์ แดงดา กองหน้าทีมชาติไทย และเมืองทอง ยูไนเต็ด ประกาศอำลาทีมชาติไทยอย่างเป็นทางการ หลังจบการแข่งขันเอเชียนคัพ 2025',
        summary: 'ธีรศิลป์ แดงดา กองหน้าทีมชาติไทย และเมืองทอง ยูไนเต็ด ประกาศอำลาทีมชาติไทย...',
        image: 'https://i.imgur.com/rBcVzkf.jpg',
        publishedAt: new Date().toISOString(),
        source: 'ไทยรัฐ',
        url: 'https://www.thairath.co.th/sport',
        category: 'thai',
        slug: 'teerasil-dangda-retirement-thai-national-team',
        tags: ['ทีมชาติไทย', 'ธีรศิลป์ แดงดา']
      }
    ];
    
    return thaiNewsItems;
  } catch (error) {
    console.error('Error fetching Thai news:', error);
    return [];
  }
};

/**
 * Saves news articles to the database
 */
export const saveNewsToDatabase = async (articles: NewsArticle[]): Promise<void> => {
  try {
    if (!articles || articles.length === 0) {
      console.log('No articles to save');
      return;
    }
    
    console.log(`Saving ${articles.length} news articles to database`);
    
    // Format articles for the database
    const dbArticles = articles.map(article => ({
      title: article.title,
      original_title: article.originalTitle || null,
      content: article.content,
      original_content: article.originalContent || null,
      summary: article.summary || article.content.substring(0, 150) + '...',
      featured_image_url: article.image || null,
      source: article.source || 'Unknown',
      published_at: article.publishedAt,
      url: article.url || null,
      status: 'published',
      slug: article.slug || createSlug(article.title),
      category: article.category,
      tags: article.tags || []
    }));
    
    // Use supabaseAdmin to avoid RLS issues
    const { data, error } = await supabaseAdmin
      .from('news_articles')
      .upsert(dbArticles, {
        onConflict: 'slug',
        ignoreDuplicates: false
      });
    
    if (error) {
      throw error;
    }
    
    console.log(`Successfully saved news articles to database`);
  } catch (error) {
    console.error('Error saving news to database:', error);
    throw error;
  }
};

/**
 * Retrieves news articles from the database
 */
export const getNewsFromDatabase = async (
  category?: 'thai' | 'international',
  limit: number = 20
): Promise<NewsArticle[]> => {
  try {
    let query = supabase
      .from('news_articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Convert database format to NewsArticle format
    const articles: NewsArticle[] = data.map(item => ({
      id: item.id,
      title: item.title,
      originalTitle: item.original_title || undefined,
      content: item.content,
      originalContent: item.original_content || undefined,
      summary: item.summary,
      image: item.featured_image_url,
      publishedAt: item.published_at,
      source: item.source,
      url: item.url || undefined,
      category: item.category,
      slug: item.slug,
      tags: item.tags
    }));
    
    return articles;
  } catch (error) {
    console.error('Error getting news from database:', error);
    return [];
  }
};

/**
 * Get a single news article by its slug
 */
export const getNewsArticleBySlug = async (slug: string): Promise<NewsArticle | null> => {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Convert to NewsArticle format
    const article: NewsArticle = {
      id: data.id,
      title: data.title,
      originalTitle: data.original_title || undefined,
      content: data.content,
      originalContent: data.original_content || undefined,
      summary: data.summary,
      image: data.featured_image_url,
      publishedAt: data.published_at,
      source: data.source,
      url: data.url || undefined,
      category: data.category,
      slug: data.slug,
      tags: data.tags
    };
    
    return article;
  } catch (error) {
    console.error(`Error fetching news article with slug "${slug}":`, error);
    return null;
  }
};

/**
 * Create a slug from a title
 */
export const createSlug = (title: string): string => {
  // For Thai language, we need to handle non-Latin characters
  // This is a simple conversion that works for demo purposes
  // In production, you might want to use a more robust solution
  
  // Remove special characters, convert spaces to dashes, and make lowercase
  return title
    .toLowerCase()
    .replace(/[^\w\sก-๙]/g, '') // Keep Thai characters
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100); // Limit length
};

/**
 * Fetch and save all news
 * This function can be called by a CRON job every 12 hours
 */
export const syncAllNews = async (): Promise<void> => {
  try {
    console.log('Starting news synchronization...');
    
    // Fetch international news and translate them
    const internationalNews = await fetchInternationalNews();
    console.log(`Fetched ${internationalNews.length} international news articles`);
    
    // Fetch Thai news
    const thaiNews = await fetchThaiNews();
    console.log(`Fetched ${thaiNews.length} Thai news articles`);
    
    // Combine all news
    const allNews = [...internationalNews, ...thaiNews];
    
    // Save to database
    await saveNewsToDatabase(allNews);
    
    console.log('News synchronization completed successfully');
  } catch (error) {
    console.error('Error in syncAllNews:', error);
    throw error;
  }
};
