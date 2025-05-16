import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// News article interface
interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image?: string;
  publishedAt: string;
  source?: string;
  tags?: string[];
  category?: 'thai' | 'international';
}

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setNews(getSampleNews());
    setIsLoading(false);
  }, []);

  // Format date to Thai format
  const formatDateToThai = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-color"></div>
          <p className="mt-2 text-sm text-text-light">กำลังโหลดข่าว...</p>
        </div>
      ) : news.length > 0 ? (
        <>
          {/* Show 3 latest news items */}
          {news.slice(0, 3).map((article) => (
            <div key={article.id} className="border-b border-border-color pb-4 last:border-0">
              <Link href={`/news/${article.id}`} className="group">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 bg-gray-200 rounded overflow-hidden w-16 h-16">
                    <img 
                      src={article.image || 'https://placehold.co/60x60?text=NEWS'} 
                      alt={article.title}
                      className="w-16 h-16 object-cover transition group-hover:scale-105" 
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium group-hover:text-primary-color">
                      {article.title.length > 60 
                        ? article.title.substring(0, 60) + '...' 
                        : article.title}
                    </h4>
                    <div className="mt-1 flex items-center text-xs text-text-light">
                      <span>{formatDateToThai(article.publishedAt)}</span>
                      {article.source && (
                        <span className="ml-2">• {article.source}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-text-light">ไม่พบข่าวสารในขณะนี้</p>
        </div>
      )}
      
      <Link href="/news" className="inline-block mt-2 text-primary-color hover:underline text-sm font-medium">
        ดูข่าวทั้งหมด
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
};

export default NewsFeed;
