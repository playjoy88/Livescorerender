# คู่มือการสร้างตาราง Advertisements ใน Supabase

คู่มือนี้จะแนะนำขั้นตอนการสร้างและตั้งค่าตาราง advertisements ใน Supabase สำหรับใช้กับระบบจัดการโฆษณาของแอปพลิเคชัน

## ขั้นตอนการสร้างตารางใน Supabase

1. **เข้าสู่แผงควบคุม Supabase**
   - เปิดเบราว์เซอร์และไปที่ [https://app.supabase.io](https://app.supabase.io)
   - ลงชื่อเข้าใช้บัญชีของคุณ
   - เลือกโปรเจค `prantrwypqcqxvmvpulj` หรือโปรเจคที่คุณต้องการใช้งาน

2. **เปิด SQL Editor**
   - จากเมนูด้านซ้าย คลิกที่ "SQL Editor"
   - คลิก "New Query" เพื่อสร้างการค้นหา SQL ใหม่

3. **นำเข้า SQL Script**
   - คัดลอกเนื้อหาทั้งหมดจากไฟล์ `supabase-init.sql` ในโปรเจคของคุณ
   - วางลงในช่อง SQL Editor
   - ตรวจสอบข้อมูลและแก้ไขหากจำเป็น (เช่น ข้อมูลตัวอย่าง)

4. **ดำเนินการ Query**
   - คลิกปุ่ม "Run" หรือกด Ctrl+Enter (Cmd+Enter สำหรับ Mac) เพื่อดำเนินการสคริปต์

5. **ตรวจสอบผลลัพธ์**
   - หลังจากรันสคริปต์ ตรวจสอบว่ามีข้อความแสดงความสำเร็จหรือไม่
   - หากมีข้อผิดพลาด ให้แก้ไขตามข้อความที่แสดงและลองใหม่อีกครั้ง

## โครงสร้างของตาราง advertisements

ตาราง `advertisements` ประกอบด้วยฟิลด์ต่างๆ ดังนี้:

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะของโฆษณา (Primary Key) |
| name | VARCHAR(255) | ชื่อของโฆษณา |
| position | VARCHAR(50) | ตำแหน่งแสดงผล (hero, sidebar, in-feed, ฯลฯ) |
| size | VARCHAR(50) | ขนาดของโฆษณา (small, medium, large) |
| image_url | TEXT | URL ของรูปภาพโฆษณา |
| url | TEXT | URL ปลายทางเมื่อคลิกที่โฆษณา |
| status | VARCHAR(50) | สถานะของโฆษณา (active, paused, scheduled, ended) |
| start_date | TIMESTAMP | วันที่และเวลาเริ่มต้นแสดงโฆษณา |
| end_date | TIMESTAMP | วันที่และเวลาสิ้นสุดการแสดงโฆษณา |
| impressions | INTEGER | จำนวนการแสดงผล |
| clicks | INTEGER | จำนวนคลิก |
| ctr | DECIMAL(5,2) | อัตราการคลิก (Click-Through Rate) |
| revenue | DECIMAL(10,2) | รายได้จากโฆษณา |
| created_at | TIMESTAMP | วันที่และเวลาที่สร้างข้อมูล |
| updated_at | TIMESTAMP | วันที่และเวลาที่อัปเดตข้อมูลล่าสุด |

## นโยบายความปลอดภัยที่ตั้งค่าไว้

สคริปต์ได้ตั้งค่านโยบายความปลอดภัยระดับแถว (Row-Level Security) ดังนี้:

1. **Allow all operations for authenticated users**
   - ผู้ใช้ที่ลงชื่อเข้าใช้สามารถดำเนินการทั้งหมด (เพิ่ม, อ่าน, แก้ไข, ลบ) กับข้อมูลในตาราง

2. **Allow public read access**
   - ผู้ใช้ทั่วไปที่ไม่ได้ลงชื่อเข้าใช้สามารถอ่านข้อมูลได้เท่านั้น ไม่สามารถแก้ไขหรือลบข้อมูลได้

## การอัปเดต updated_at โดยอัตโนมัติ

สคริปต์ได้สร้าง trigger ที่จะอัปเดตค่า `updated_at` โดยอัตโนมัติทุกครั้งที่มีการแก้ไขข้อมูลในตาราง

## การเชื่อมต่อกับ Supabase จากแอปพลิเคชัน

ในการเชื่อมต่อกับ Supabase จากแอปพลิเคชัน ให้ใช้ Supabase Client ด้วยค่า URL และ API Key ที่กำหนดไว้ในไฟล์ `.env.local`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## คำสั่ง SQL พื้นฐานสำหรับจัดการข้อมูล

### ดึงข้อมูลโฆษณาทั้งหมด

```sql
SELECT * FROM public.advertisements;
```

### ดึงข้อมูลโฆษณาที่กำลังใช้งานอยู่

```sql
SELECT * 
FROM public.advertisements 
WHERE status = 'active' 
  AND start_date <= NOW() 
  AND end_date >= NOW();
```

### เพิ่มข้อมูลโฆษณาใหม่

```sql
INSERT INTO public.advertisements (
  name, position, size, image_url, url, status, 
  start_date, end_date
) VALUES (
  'New Advertisement', 
  'sidebar', 
  'medium', 
  'https://storage.example.com/ads/new-ad.jpg', 
  'https://example.com/landing-page', 
  'active', 
  NOW(), 
  NOW() + INTERVAL '30 days'
);
```

### อัปเดตข้อมูลโฆษณา

```sql
UPDATE public.advertisements 
SET 
  name = 'Updated Ad Name',
  status = 'paused',
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000000';
```

### ลบข้อมูลโฆษณา

```sql
DELETE FROM public.advertisements 
WHERE id = '00000000-0000-0000-0000-000000000000';
