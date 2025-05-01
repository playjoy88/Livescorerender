import React from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="bg-bg-light shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-primary-color text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
              <span className="text-accent-color">Play</span>joy
            </h1>
            <span className="ml-2 text-sm text-text-light">Livescore</span>
          </div>
          
          {/* Main Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-foreground hover:text-primary-color font-medium transition-colors">
              หน้าหลัก
            </Link>
            <Link href="/live" className="text-foreground hover:text-primary-color font-medium transition-colors">
              ผลบอลสด
            </Link>
            <Link href="/fixtures" className="text-foreground hover:text-primary-color font-medium transition-colors">
              ตารางแข่งขัน
            </Link>
            <Link href="/standings" className="text-foreground hover:text-primary-color font-medium transition-colors">
              ตารางคะแนน
            </Link>
            <Link href="/predictions" className="text-foreground hover:text-primary-color font-medium transition-colors">
              ทำนายผล
            </Link>
            <Link href="/news" className="text-foreground hover:text-primary-color font-medium transition-colors">
              ข่าวสาร
            </Link>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button 
              className="bg-primary-color text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-color transition-colors"
              style={{ fontFamily: 'var(--font-prompt)' }}
            >
              เข้าสู่ระบบ
            </button>
            <button 
              onClick={toggleTheme}
              className="text-foreground hover:text-accent-color p-2 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
