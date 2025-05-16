# พลัดจอยไลฟ์สกอร์ - คำแนะนำการใช้งานแอดมิน

## การแก้ไขปัญหาการเข้าถึงฐานข้อมูล Supabase

เราได้แก้ไขปัญหาการเข้าถึง Row Level Security (RLS) ใน Supabase โดยการใช้ Service Role Key เพื่อให้แอดมินสามารถจัดการข้อมูลได้อย่างเต็มที่

### การเปลี่ยนแปลงที่สำคัญ

1. เพิ่ม `supabaseAdmin` client ที่ใช้ service role key จาก `.env.local` เพื่อข้ามการตรวจสอบ RLS
2. สร้าง API endpoint `/api/admin/supabase` สำหรับการจัดการฐานข้อมูลที่ปลอดภัย
3. สร้าง `adminService.ts` เพื่อให้ใช้งานกับหน้าแอดมินได้อย่างสะดวก

## วิธีการใช้งานการจัดการโฆษณา

### การเพิ่มโฆษณาใหม่

1. ไปที่หน้า `/admin/advertisements`
2. คลิกที่ปุ่ม "เพิ่มโฆษณาใหม่"
3. กรอกข้อมูลโฆษณาในฟอร์ม
4. อัปโหลดรูปภาพโฆษณา - ระบบจะอัปโหลดไปยัง Vercel Blob Storage
5. คลิกที่ปุ่ม "สร้างโฆษณา" เพื่อบันทึก

ระบบจะใช้ service role key เพื่อข้าม RLS และบันทึกข้อมูลลงในตาราง `advertisements`

### การแก้ไขโฆษณา

1. ไปที่หน้า `/admin/advertisements`
2. คลิกที่ปุ่ม "แก้ไข" ที่อยู่ในแถวของโฆษณาที่ต้องการแก้ไข
3. แก้ไขข้อมูลที่ต้องการ
4. คลิกที่ปุ่ม "บันทึกการแก้ไข" เพื่อบันทึกการเปลี่ยนแปลง

### การลบโฆษณา

1. ไปที่หน้า `/admin/advertisements`
2. คลิกที่ปุ่ม "ลบ" ที่อยู่ในแถวของโฆษณาที่ต้องการลบ
3. ยืนยันการลบในหน้าต่างที่ปรากฏ

## การตั้งค่าโลโก้

1. ไปที่หน้า `/admin/logo-settings`
2. อัปโหลดไฟล์โลโก้ใหม่หรือแก้ไขการตั้งค่าที่มีอยู่
3. กำหนดความกว้าง ความสูง และข้อความ alt
4. คลิก "บันทึกการตั้งค่า"

ระบบจะบันทึกข้อมูลการตั้งค่าลงในตาราง `site_settings` ในฐานข้อมูล Supabase

## การแก้ไขปัญหาทั่วไป

### ถ้าเกิดข้อผิดพลาด "Invalid API key"

ตรวจสอบให้แน่ใจว่าไฟล์ `.env.local` มี Service Role Key ที่ถูกต้อง:

```
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByYW50cnd5cHFjcXh2bXZwdWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjI5ODQxNSwiZXhwIjoyMDYxODc0NDE1fQ.3utsTV8srvZhSXsWF4-d9Q753Wc5gcZKvTggA91T5dw"
```

### ถ้าเกิดข้อผิดพลาด "violates row-level security policy for table"

เราได้เพิ่ม Service Role Key แล้ว แต่ถ้ายังพบปัญหา:

1. ตรวจสอบให้แน่ใจว่าคุณใช้ `supabaseAdmin` แทน `supabase` ใน service ที่เกี่ยวข้อง
2. ตรวจสอบว่าตาราง Supabase มีการตั้งค่า RLS ที่ถูกต้อง
3. รันคำสั่ง redeployment เพื่ออัปเดตการตั้งค่า

### ถ้าไม่สามารถอัปโหลดไฟล์ได้

1. ตรวจสอบ Blob Storage token ใน `.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_8qeOQfV8TiBAypBc_cEmeUT5Af4VqnDRzX2QfWfotgFZyd4"
   ```
2. ใช้ `<img>` element ธรรมดาแทน Next.js Image component เพื่อหลีกเลี่ยงข้อจำกัดของ Vercel Image Optimization

## API ใหม่สำหรับการจัดการข้อมูล

ระบบได้เพิ่ม API endpoint ใหม่สำหรับการจัดการข้อมูลฐานข้อมูล:

### `/api/admin/supabase`

ใช้สำหรับการจัดการข้อมูลโดยข้าม RLS ในตาราง Supabase

**ตัวอย่างการใช้งาน:**

```javascript
// การเพิ่มข้อมูลใหม่
const response = await fetch('/api/admin/supabase', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-token'
  },
  body: JSON.stringify({
    operation: 'insert',
    table: 'advertisements',
    data: {
      name: 'โฆษณาใหม่',
      position: 'hero',
      size: 'large',
      image_url: 'https://example.com/ad.jpg',
      url: 'https://example.com',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  })
});
```

หรือใช้ service ที่เราสร้างไว้แล้ว:

```javascript
import { createAdvertisement } from '@/services/adminService';

// ใช้งานใน component
const handleSubmit = async () => {
  const result = await createAdvertisement({
    name: 'โฆษณาใหม่',
    position: 'hero',
    size: 'large',
    image_url: 'https://example.com/ad.jpg',
    url: 'https://example.com',
    status: 'active',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
  
  if (result.success) {
    // ดำเนินการหลังจากบันทึกสำเร็จ
  } else {
    // แสดงข้อผิดพลาด
    console.error(result.error);
  }
};
```

## สรุปการปรับปรุง

1. แก้ไขปัญหา RLS โดยการใช้ Service Role Key
2. สร้าง Admin API endpoint เพื่อความปลอดภัย
3. แก้ไขปัญหาการอัปโหลดไฟล์และการจัดเก็บข้อมูล
4. ปรับปรุงการจัดการ site settings เพื่อใช้งานได้อย่างราบรื่น

ระบบควรสามารถใช้งานได้อย่างเต็มประสิทธิภาพแล้ว ถ้ามีปัญหาเพิ่มเติม กรุณาตรวจสอบ console log เพื่อดูข้อผิดพลาดที่เกิดขึ้น
