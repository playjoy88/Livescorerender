# Playjoy Livescore

แอปพลิเคชันผลบอลสดแบบเรียลไทม์สำหรับลีกฟุตบอลชั้นนำทั่วโลก

## คุณสมบัติ

- แสดงผลบอลสดแบบเรียลไทม์
- ระบบค้นหาและกรองการแข่งขัน
- รายละเอียดการแข่งขันพร้อมสถิติ
- รองรับการแสดงผลทั้งบนคอมพิวเตอร์และอุปกรณ์พกพา
- รองรับภาษาไทยทั้งระบบ
- มืดและสว่างโหมด (Dark/Light mode)

## เทคโนโลยีที่ใช้

- Next.js 15.3
- React 19
- TypeScript
- Tailwind CSS 4
- API-Football (RapidAPI)

## การติดตั้ง

1. โคลนโปรเจคนี้
```bash
git clone https://github.com/yourusername/playjoy-livescore.git
cd playjoy-livescore
```

2. ติดตั้งแพคเกจที่จำเป็น
```bash
npm install
```

3. สร้างไฟล์ .env.local สำหรับตั้งค่า API (ไฟล์นี้สร้างไว้แล้ว)
```
API_URL=https://api-football-v1.p.rapidapi.com/v3
API_KEY=your_api_key_here
```

4. รันแอปพลิเคชันในโหมดพัฒนา
```bash
npm run dev
```

5. เปิดเบราว์เซอร์และเข้าถึงแอปพลิเคชันได้ที่ http://localhost:3000

## โครงสร้างโปรเจค

```
src/
├── app/                  # Next.js App Router
│   ├── live/             # หน้าผลบอลสด 
│   ├── match/[id]/       # หน้ารายละเอียดการแข่งขัน
│   ├── globals.css       # สไตล์ CSS ทั้งหมด
│   ├── layout.tsx        # เลย์เอาต์หลักของแอป
│   └── page.tsx          # หน้าแรก
├── components/           # React Components
│   ├── Footer.tsx        # ส่วนท้ายเว็บไซต์
│   ├── Layout.tsx        # เลย์เอาต์ที่ใช้ร่วมกันในหน้าต่างๆ
│   ├── MatchCard.tsx     # คอมโพเนนต์แสดงการแข่งขัน
│   └── Navbar.tsx        # เมนูนำทาง
└── services/             # Services และการเชื่อมต่อ API
    └── api.ts            # บริการเชื่อมต่อ API ฟุตบอล
```

## API

โปรเจคนี้ใช้ API-Football จาก RapidAPI สำหรับข้อมูลฟุตบอลทั้งหมด หากต้องการใช้งานจริง คุณจะต้องลงทะเบียนและรับ API key จาก:
https://rapidapi.com/api-sports/api/api-football/

## การปรับแต่ง

- แก้ไขสีหลักได้ที่ไฟล์ `src/app/globals.css`
- เปลี่ยนฟอนต์ได้ที่ไฟล์ `src/app/layout.tsx`
- เพิ่ม/แก้ไขลีกได้ที่ไฟล์ `src/services/api.ts`

## หมายเหตุ

- ในเวอร์ชั่นปัจจุบัน ใช้ข้อมูลตัวอย่างแทนการเรียก API จริง
- แอปพลิเคชันนี้ออกแบบเพื่อการสาธิตเท่านั้น ไม่ได้เชื่อมต่อกับ API จริง

## ภาพตัวอย่าง

![หน้าแรก](https://example.com/home.png)
![ผลบอลสด](https://example.com/live.png)
![รายละเอียดการแข่งขัน](https://example.com/detail.png)
