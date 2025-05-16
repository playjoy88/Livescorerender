import React from 'react';
import Link from 'next/link';
import Banner from './Banner';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-bg-light border-t border-border-color mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="col-span-1">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
              <span className="text-accent-color">Play</span>joy
              <span className="text-primary-color">Livescore</span>
            </h2>
            <p className="text-text-light text-sm mb-4">
              แหล่งรวมข้อมูลผลบอลสด อัพเดทแบบเรียลไทม์ พร้อมสถิติครบถ้วน ข่าวสารวงการฟุตบอล และบทวิเคราะห์โดยผู้เชี่ยวชาญ
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-text-light hover:text-primary-color">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-text-light hover:text-primary-color">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-light hover:text-primary-color">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="text-text-light hover:text-primary-color">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M272.1 204.2v71.1c0 1.8-1.4 3.2-3.2 3.2h-11.4c-1.1 0-2.1-.6-2.6-1.3l-32.6-44v42.2c0 1.8-1.4 3.2-3.2 3.2h-11.4c-1.8 0-3.2-1.4-3.2-3.2v-71.1c0-1.8 1.4-3.2 3.2-3.2H219c1.1 0 2.1.6 2.6 1.3l32.6 44v-42.2c0-1.8 1.4-3.2 3.2-3.2h11.4c1.8-.1 3.3 1.4 3.3 3.1zm-82-3.2h-11.4c-1.8 0-3.2 1.4-3.2 3.2v71.1c0 1.8 1.4 3.2 3.2 3.2h11.4c1.8 0 3.2-1.4 3.2-3.2v-71.1c0-1.7-1.4-3.2-3.2-3.2zm-27.5 59.6h-31.1v-56.4c0-1.8-1.4-3.2-3.2-3.2h-11.4c-1.8 0-3.2 1.4-3.2 3.2v71.1c0 .9.3 1.6.9 2.2.6.5 1.3.9 2.2.9h45.7c1.8 0 3.2-1.4 3.2-3.2v-11.4c0-1.7-1.4-3.2-3.1-3.2zM332.1 201h-45.7c-1.7 0-3.2 1.4-3.2 3.2v71.1c0 1.7 1.4 3.2 3.2 3.2h45.7c1.8 0 3.2-1.4 3.2-3.2v-11.4c0-1.8-1.4-3.2-3.2-3.2H301v-12h31.1c1.8 0 3.2-1.4 3.2-3.2V234c0-1.8-1.4-3.2-3.2-3.2H301v-12h31.1c1.8 0 3.2-1.4 3.2-3.2v-11.4c-.1-1.7-1.5-3.2-3.2-3.2zM448 113.7V399c-.1 44.8-36.8 81.1-81.7 81H81c-44.8-.1-81.1-36.9-81-81.7V113c.1-44.8 36.9-81.1 81.7-81H367c44.8.1 81.1 36.8 81 81.7zm-61.6 122.6c0-73-73.2-132.4-163.1-132.4-89.9 0-163.1 59.4-163.1 132.4 0 65.4 58 120.2 136.4 130.6 19.1 4.1 16.9 11.1 12.6 36.8-.7 4.1-3.3 16.1 14.1 8.8 17.4-7.3 93.9-55.3 128.2-94.7 23.6-26 34.9-52.3 34.9-81.5z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-md font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
              ลิงก์ด่วน
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/live" className="text-text-light hover:text-primary-color text-sm">
                  ผลบอลสด
                </Link>
              </li>
              <li>
                <Link href="/fixtures" className="text-text-light hover:text-primary-color text-sm">
                  ตารางแข่งขัน
                </Link>
              </li>
              <li>
                <Link href="/standings" className="text-text-light hover:text-primary-color text-sm">
                  ตารางคะแนน
                </Link>
              </li>
              <li>
                <Link href="/predictions" className="text-text-light hover:text-primary-color text-sm">
                  ทำนายผล
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-text-light hover:text-primary-color text-sm">
                  ข่าวสาร
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Popular Leagues */}
          <div className="col-span-1">
            <h3 className="text-md font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
              ลีกยอดนิยม
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/league/thai" className="text-text-light hover:text-primary-color text-sm">
                  ไทยลีก
                </Link>
              </li>
              <li>
                <Link href="/league/premier-league" className="text-text-light hover:text-primary-color text-sm">
                  พรีเมียร์ลีก อังกฤษ
                </Link>
              </li>
              <li>
                <Link href="/league/laliga" className="text-text-light hover:text-primary-color text-sm">
                  ลาลีกา สเปน
                </Link>
              </li>
              <li>
                <Link href="/league/serie-a" className="text-text-light hover:text-primary-color text-sm">
                  กัลโช่ เซเรีย อา
                </Link>
              </li>
              <li>
                <Link href="/league/bundesliga" className="text-text-light hover:text-primary-color text-sm">
                  บุนเดสลีกา
                </Link>
              </li>
              <li>
                <Link href="/league/champions-league" className="text-text-light hover:text-primary-color text-sm">
                  ยูฟ่า แชมเปี้ยนส์ลีก
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact & Support */}
          <div className="col-span-1">
            <h3 className="text-md font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
              ติดต่อ & สนับสนุน
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-text-light hover:text-primary-color text-sm">
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-text-light hover:text-primary-color text-sm">
                  คำถามที่พบบ่อย
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-light hover:text-primary-color text-sm">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-light hover:text-primary-color text-sm">
                  ข้อกำหนดการใช้งาน
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-light hover:text-primary-color text-sm">
                  ติดต่อเรา
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Banner */}
        <div className="my-8">
          <Banner position="footer" size="large" />
        </div>
        
        <div className="pt-8 mt-8 border-t border-border-color">
          <div className="text-center text-text-lighter text-sm">
            <p>© {currentYear} PlayjoyLivescore. สงวนลิขสิทธิ์ทั้งหมด.</p>
            <p className="mt-2">
              ข้อมูลผลการแข่งขันและสถิติทั้งหมดบนเว็บไซต์นี้เป็นกรรมสิทธิ์ของเจ้าของลิขสิทธิ์ที่เกี่ยวข้อง
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
