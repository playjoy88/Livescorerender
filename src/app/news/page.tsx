'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getNewsFromDatabase } from '@/services/newsService';
import { NewsArticle } from '@/types/news';

export default function NewsPage({
  params: _params,
  searchParams: _searchParams
}: {
  params: Record<string, never>;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newsCategory, setNewsCategory] = useState<'all' | 'thai' | 'international'>('all');

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get news from our database
        let newsData: NewsArticle[] = [];
        
        if (newsCategory === 'all') {
          newsData = await getNewsFromDatabase();
        } else {
          newsData = await getNewsFromDatabase(newsCategory);
        }
        
        if (newsData && newsData.length > 0) {
          setNews(newsData);
        } else {
          // Fallback to sample news if no data in database
          setNews(getSampleNews());
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล โปรดลองอีกครั้ง');
        setNews(getSampleNews());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, [newsCategory]);

  // Format date to Thai format
  const formatDateToThai = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Sample news data for development and demonstration
  const getSampleNews = (): NewsArticle[] => {
    // Thai football news
    const thaiNews: NewsArticle[] = [
      {
        id: 'th1',
        title: 'เกียรติศักดิ์ เสนาเมือง เข้ารับตำแหน่งเฮดโค้ชทีมชาติไทยชุดใหญ่อีกครั้ง',
        content: 'สมาคมกีฬาฟุตบอลแห่งประเทศไทยฯ ประกาศแต่งตั้ง "ซิโก้" เกียรติศักดิ์ เสนาเมือง อดีตกองหน้าทีมชาติไทย กลับมารับตำแหน่งหัวหน้าผู้ฝึกสอนทีมชาติไทยชุดใหญ่อีกครั้ง',
        image: 'https://i.imgur.com/KEFZ8Qd.jpg',
        publishedAt: '2025-05-01T09:30:00Z',
        source: 'ไทยรัฐ',
        tags: ['ทีมชาติไทย', 'เกียรติศักดิ์ เสนาเมือง'],
        category: 'thai'
      },
      {
        id: 'th2',
        title: 'บุรีรัมย์คว้าแชมป์ไทยลีกสมัยที่ 9 สร้างสถิติใหม่',
        content: 'บุรีรัมย์ ยูไนเต็ด สร้างประวัติศาสตร์คว้าแชมป์ไทยลีกสมัยที่ 9 ได้สำเร็จ หลังเปิดบ้านเอาชนะ การท่าเรือ เอฟซี 3-0 ในนัดสุดท้ายของฤดูกาล',
        image: 'https://i.imgur.com/ZJSckuL.jpg',
        publishedAt: '2025-04-29T21:45:00Z',
        source: 'สยามกีฬา',
        tags: ['ไทยลีก', 'บุรีรัมย์ ยูไนเต็ด'],
        category: 'thai'
      },
      {
        id: 'th3',
        title: 'ธีรศิลป์ แดงดา ประกาศอำลาทีมชาติไทยหลังจบเอเชียนคัพ',
        content: 'ธีรศิลป์ แดงดา กองหน้าทีมชาติไทย และเมืองทอง ยูไนเต็ด ประกาศอำลาทีมชาติไทยอย่างเป็นทางการ หลังจบการแข่งขันเอเชียนคัพ 2025',
        image: 'https://i.imgur.com/rBcVzkf.jpg',
        publishedAt: '2025-04-28T14:20:00Z',
        source: 'ไทยรัฐ',
        tags: ['ทีมชาติไทย', 'ธีรศิลป์ แดงดา'],
        category: 'thai'
      }
    ];
    
    // International football news
    const internationalNews: NewsArticle[] = [
      {
        id: 'int1',
        title: 'เรอัล มาดริด คว้าแชมป์แชมเปียนส์ลีกสมัยที่ 15',
        content: 'เรอัล มาดริด เอาชนะ ดอร์ทมุนด์ 2-0 ในรอบชิงชนะเลิศแชมเปียนส์ลีก 2024/25 ที่สนามเวมบลีย์ ประเทศอังกฤษ',
        image: 'https://i.imgur.com/xjQhvjS.jpg',
        publishedAt: '2025-05-01T23:45:00Z',
        source: 'กีฬาสยาม',
        tags: ['แชมเปียนส์ลีก', 'เรอัล มาดริด'],
        category: 'international'
      },
      {
        id: 'int2',
        title: 'แมนเชสเตอร์ ซิตี้ คว้าแชมป์พรีเมียร์ลีก 5 สมัยติด',
        content: 'แมนเชสเตอร์ ซิตี้ สร้างประวัติศาสตร์คว้าแชมป์พรีเมียร์ลีก 5 สมัยติดต่อกัน หลังเอาชนะ เวสต์แฮม 3-1 ในนัดสุดท้ายของฤดูกาล',
        image: 'https://i.imgur.com/Pex2Z8M.jpg',
        publishedAt: '2025-04-26T18:30:00Z',
        source: 'สยามกีฬา',
        tags: ['พรีเมียร์ลีก', 'แมนเชสเตอร์ ซิตี้'],
        category: 'international'
      },
      {
        id: 'int3',
        title: 'ลีโอเนล เมสซี่ คว้าบัลลงดอร์สมัยที่ 9',
        content: 'ลีโอเนล เมสซี่ คว้ารางวัลบัลลงดอร์สมัยที่ 9 ของเขา หลังพานำอาร์เจนตินาคว้าแชมป์โคปา อเมริกา 2024',
        image: 'https://i.imgur.com/5z8QTPx.jpg',
        publishedAt: '2025-04-29T21:30:00Z',
        source: 'ฟรองซ์ ฟุตบอล',
        tags: ['บัลลงดอร์', 'ลีโอเนล เมสซี่'],
        category: 'international'
      }
    ];
    
    return [...thaiNews, ...internationalNews];
  };
  
  // Filter news by category
  const filteredNews = newsCategory === 'all' 
    ? news 
    : news.filter(article => article.category === newsCategory);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Page header and category filter */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
                ข่าวสารฟุตบอล
              </h1>
              <p className="text-text-light mt-2">
                อัพเดทข่าวสารล่าสุดในวงการฟุตบอลทั้งในประเทศและต่างประเทศ
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 bg-bg-light p-2 rounded-lg shadow-sm">
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    newsCategory === 'all' ? 'bg-primary-color text-white' : 'bg-white'
                  }`}
                  onClick={() => setNewsCategory('all')}
                >
                  ทั้งหมด
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    newsCategory === 'thai' ? 'bg-primary-color text-white' : 'bg-white'
                  }`}
                  onClick={() => setNewsCategory('thai')}
                >
                  ข่าวไทย
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    newsCategory === 'international' ? 'bg-primary-color text-white' : 'bg-white'
                  }`}
                  onClick={() => setNewsCategory('international')}
                >
                  ข่าวต่างประเทศ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 bg-bg-light rounded-lg shadow-md">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
              <p className="mt-4 text-text-light">กำลังโหลดข่าวสาร...</p>
            </div>
          ) : filteredNews.length > 0 ? (
            <>
              {/* Featured news - first article */}
              <div className="bg-bg-light rounded-lg shadow-md overflow-hidden mb-8">
                <div className="md:flex">
                  <div className="md:w-2/5">
                    <img 
                      src={filteredNews[0].image || 'https://placehold.co/600x400?text=ข่าวกีฬา'} 
                      alt={filteredNews[0].title}
                      className="w-full h-64 md:h-full object-cover" 
                    />
                  </div>
                  <div className="md:w-3/5 p-6">
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-text-light">{formatDateToThai(filteredNews[0].publishedAt)}</span>
                      {filteredNews[0].source && (
                        <span className="text-sm text-text-light ml-2">• {filteredNews[0].source}</span>
                      )}
                      {filteredNews[0].category && (
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                          filteredNews[0].category === 'thai' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {filteredNews[0].category === 'thai' ? 'ข่าวไทย' : 'ข่าวต่างประเทศ'}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mb-4">{filteredNews[0].title}</h2>
                    <p className="mb-4 text-text-light">{filteredNews[0].content}</p>
                    <button className="bg-primary-color text-white px-4 py-2 rounded-lg">อ่านต่อ</button>
                  </div>
                </div>
              </div>

              {/* News grid - remaining articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.slice(1).map(article => (
                  <div key={article.id} className="bg-bg-light rounded-lg shadow-md overflow-hidden">
                    <img 
                      src={article.image || 'https://placehold.co/600x400?text=ข่าวกีฬา'} 
                      alt={article.title}
                      className="w-full h-48 object-cover" 
                    />
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-text-light">{formatDateToThai(article.publishedAt)}</span>
                        {article.source && (
                          <span className="text-sm text-text-light ml-2">• {article.source}</span>
                        )}
                        {article.category && (
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                            article.category === 'thai' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {article.category === 'thai' ? 'ข่าวไทย' : 'ข่าวต่างประเทศ'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold mb-2">{article.title}</h3>
                      <p className="text-text-light text-sm mb-4">{article.content}</p>
                      <button className="text-primary-color hover:underline text-sm font-medium">
                        อ่านเพิ่มเติม →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-bg-light rounded-lg shadow-md">
              <p className="text-text-light">ไม่พบข่าวในหมวดหมู่ที่เลือก</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
