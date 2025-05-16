# คู่มือการสร้างฐานข้อมูล Playjoy Livescore ใน Supabase

คู่มือนี้แนะนำขั้นตอนการสร้างและตั้งค่าฐานข้อมูลทั้งหมดสำหรับ Playjoy Livescore ใน Supabase รวมถึงตารางที่จำเป็นสำหรับการจัดการผู้ใช้, ข้อมูลฟุตบอล, การพยากรณ์ผลการแข่งขัน, และระบบโฆษณา

## ขั้นตอนการสร้างฐานข้อมูลใน Supabase

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
   - ตรวจสอบข้อมูลและแก้ไขหากจำเป็น

4. **ดำเนินการ Query**
   - คลิกปุ่ม "Run" หรือกด Ctrl+Enter (Cmd+Enter สำหรับ Mac) เพื่อดำเนินการสคริปต์

5. **ตรวจสอบผลลัพธ์**
   - หลังจากรันสคริปต์ ตรวจสอบว่ามีข้อความแสดงความสำเร็จหรือไม่
   - หากมีข้อผิดพลาด ให้แก้ไขตามข้อความที่แสดงและลองใหม่อีกครั้ง

## โครงสร้างฐานข้อมูล

ฐานข้อมูล Playjoy Livescore ประกอบด้วยกลุ่มตารางดังต่อไปนี้:

### 1. ตารางจัดการผู้ใช้งาน (User Management)

#### ตาราง `user_profiles`
เก็บข้อมูลโปรไฟล์ของผู้ใช้ เชื่อมต่อกับระบบ Authentication ของ Supabase

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะของผู้ใช้ (เชื่อมกับ auth.users) |
| username | VARCHAR(50) | ชื่อผู้ใช้ (ไม่ซ้ำกัน) |
| display_name | VARCHAR(100) | ชื่อที่แสดงในแอปพลิเคชัน |
| avatar_url | TEXT | URL รูปโปรไฟล์ |
| thai_league_fan | BOOLEAN | แฟนบอลไทยลีกหรือไม่ |
| notification_settings | JSONB | การตั้งค่าการแจ้งเตือน |
| created_at | TIMESTAMP | วันที่สร้างโปรไฟล์ |
| updated_at | TIMESTAMP | วันที่อัปเดตล่าสุด |

#### ตาราง `user_favorites`
เก็บข้อมูลรายการโปรดของผู้ใช้ (ทีม, การแข่งขัน, ลีก)

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะ |
| user_id | UUID | รหัสผู้ใช้ |
| favorite_type | VARCHAR(20) | ประเภท (match, team, league) |
| entity_id | VARCHAR(100) | รหัสของทีม, การแข่งขัน, หรือลีก |
| created_at | TIMESTAMP | วันที่เพิ่มรายการโปรด |

### 2. ตารางข้อมูลฟุตบอล (Football Data Cache)

#### ตาราง `teams`
เก็บข้อมูลทีมฟุตบอลจาก API

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | VARCHAR(50) | รหัสทีมจาก API |
| name | VARCHAR(100) | ชื่อทีมภาษาอังกฤษ |
| name_th | VARCHAR(100) | ชื่อทีมภาษาไทย |
| country | VARCHAR(50) | ประเทศที่ทีมสังกัด |
| logo_url | TEXT | URL โลโก้ทีม |
| data | JSONB | ข้อมูลทั้งหมดจาก API |
| last_updated | TIMESTAMP | วันที่อัปเดตข้อมูลล่าสุด |

#### ตาราง `leagues`
เก็บข้อมูลลีกฟุตบอลจาก API

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | VARCHAR(50) | รหัสลีกจาก API |
| name | VARCHAR(100) | ชื่อลีกภาษาอังกฤษ |
| name_th | VARCHAR(100) | ชื่อลีกภาษาไทย |
| country | VARCHAR(50) | ประเทศที่ลีกจัดการแข่งขัน |
| logo_url | TEXT | URL โลโก้ลีก |
| season | INTEGER | ฤดูกาลปัจจุบัน |
| is_current | BOOLEAN | เป็นฤดูกาลปัจจุบันหรือไม่ |
| display_order | INTEGER | ลำดับการแสดงผล (น้อย = สำคัญกว่า) |
| data | JSONB | ข้อมูลทั้งหมดจาก API |
| last_updated | TIMESTAMP | วันที่อัปเดตข้อมูลล่าสุด |

#### ตาราง `matches`
เก็บข้อมูลการแข่งขันฟุตบอลจาก API

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | VARCHAR(50) | รหัสการแข่งขันจาก API |
| league_id | VARCHAR(50) | รหัสลีก |
| home_team_id | VARCHAR(50) | รหัสทีมเจ้าบ้าน |
| away_team_id | VARCHAR(50) | รหัสทีมเยือน |
| match_date | TIMESTAMP | วันและเวลาแข่งขัน |
| status | VARCHAR(20) | สถานะการแข่งขัน (LIVE, FINISHED, SCHEDULED) |
| home_score | INTEGER | คะแนนทีมเจ้าบ้าน |
| away_score | INTEGER | คะแนนทีมเยือน |
| events | JSONB | เหตุการณ์ในการแข่งขัน (ประตู, ใบเหลือง, เปลี่ยนตัว) |
| statistics | JSONB | สถิติการแข่งขัน |
| lineups | JSONB | รายชื่อผู้เล่นในการแข่งขัน |
| data | JSONB | ข้อมูลทั้งหมดจาก API |
| last_updated | TIMESTAMP | วันที่อัปเดตข้อมูลล่าสุด |

### 3. ระบบพยากรณ์ผลการแข่งขัน (Prediction System)

#### ตาราง `ai_models`
เก็บข้อมูลโมเดล AI ที่ใช้พยากรณ์ผลการแข่งขัน

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะของโมเดล |
| name | VARCHAR(100) | ชื่อโมเดล |
| code | VARCHAR(50) | รหัสสำหรับอ้างอิงในโค้ด |
| description | TEXT | คำอธิบายโมเดล |
| is_active | BOOLEAN | สถานะการใช้งานโมเดล |
| accuracy_overall | DECIMAL(5,2) | ความแม่นยำโดยรวม (%) |
| accuracy_last_week | DECIMAL(5,2) | ความแม่นยำในสัปดาห์ล่าสุด (%) |
| created_at | TIMESTAMP | วันที่สร้างโมเดล |
| updated_at | TIMESTAMP | วันที่อัปเดตล่าสุด |

#### ตาราง `match_predictions`
เก็บข้อมูลการพยากรณ์ผลการแข่งขัน

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะของการพยากรณ์ |
| match_id | VARCHAR(50) | รหัสการแข่งขัน |
| ai_model_id | UUID | รหัสโมเดล AI (null = ผู้ใช้พยากรณ์เอง) |
| user_id | UUID | รหัสผู้ใช้ (null = AI พยากรณ์) |
| prediction_type | VARCHAR(20) | ประเภทการพยากรณ์ (win_draw_loss, exact_score) |
| home_score | INTEGER | คะแนนที่พยากรณ์สำหรับทีมเจ้าบ้าน |
| away_score | INTEGER | คะแนนที่พยากรณ์สำหรับทีมเยือน |
| home_win_probability | DECIMAL(5,2) | ความน่าจะเป็นที่ทีมเจ้าบ้านจะชนะ (%) |
| draw_probability | DECIMAL(5,2) | ความน่าจะเป็นที่จะเสมอกัน (%) |
| away_win_probability | DECIMAL(5,2) | ความน่าจะเป็นที่ทีมเยือนจะชนะ (%) |
| confidence_level | INTEGER | ระดับความเชื่อมั่น (1-5) |
| result | VARCHAR(20) | ผลลัพธ์ (correct, incorrect, partial, pending) |
| points_earned | INTEGER | คะแนนที่ได้รับ |
| created_at | TIMESTAMP | วันที่สร้างการพยากรณ์ |

#### ตาราง `prediction_contests`
เก็บข้อมูลการแข่งขันพยากรณ์ผลฟุตบอล

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะของการแข่งขัน |
| name | VARCHAR(100) | ชื่อการแข่งขัน |
| description | TEXT | คำอธิบายการแข่งขัน |
| start_date | TIMESTAMP | วันที่เริ่มต้นการแข่งขัน |
| end_date | TIMESTAMP | วันที่สิ้นสุดการแข่งขัน |
| status | VARCHAR(20) | สถานะการแข่งขัน |
| rules | JSONB | กฎการแข่งขัน |
| prizes | TEXT | รางวัลสำหรับผู้ชนะ |
| created_at | TIMESTAMP | วันที่สร้างการแข่งขัน |
| updated_at | TIMESTAMP | วันที่อัปเดตล่าสุด |

#### ตาราง `contest_entries` และ `contest_matches`
เก็บข้อมูลการเข้าร่วมการแข่งขันพยากรณ์ผลและการแข่งขันที่เกี่ยวข้อง

### 4. ระบบโฆษณา (Advertisements System)

#### ตาราง `advertisements`
เก็บข้อมูลโฆษณาที่แสดงในแอปพลิเคชัน

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะของโฆษณา |
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

#### ตาราง `ad_analytics`
เก็บข้อมูลวิเคราะห์รายวันของโฆษณา

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะ |
| ad_id | UUID | รหัสโฆษณา |
| date | DATE | วันที่ |
| impressions | INTEGER | จำนวนการแสดงผล |
| clicks | INTEGER | จำนวนคลิก |
| ctr | DECIMAL(5,2) | อัตราการคลิก (%) |
| revenue | DECIMAL(10,2) | รายได้ |
| created_at | TIMESTAMP | วันที่สร้าง |
| updated_at | TIMESTAMP | วันที่อัปเดตล่าสุด |

### 5. ระบบข่าวและเนื้อหา (News and Content)

#### ตาราง `news_articles`
เก็บข้อมูลบทความข่าวฟุตบอล

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะของบทความข่าว |
| title | VARCHAR(200) | หัวข้อข่าว |
| slug | VARCHAR(200) | URL-friendly slug |
| content | TEXT | เนื้อหาข่าว |
| summary | TEXT | สรุปข่าว |
| featured_image_url | TEXT | URL รูปหน้าปกข่าว |
| author | VARCHAR(100) | ผู้เขียน |
| published_at | TIMESTAMP | วันที่เผยแพร่ |
| status | VARCHAR(20) | สถานะบทความ (draft, published, archived) |
| tags | TEXT[] | แท็กหัวข้อ |
| related_team_ids | TEXT[] | รหัสทีมที่เกี่ยวข้อง |
| related_league_ids | TEXT[] | รหัสลีกที่เกี่ยวข้อง |
| created_at | TIMESTAMP | วันที่สร้างบทความ |
| updated_at | TIMESTAMP | วันที่อัปเดตล่าสุด |

### 6. ตารางสนับสนุนและการวิเคราะห์ (Support Tables)

#### ตาราง `user_activity_log`
เก็บข้อมูลกิจกรรมของผู้ใช้สำหรับการวิเคราะห์

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะ |
| user_id | UUID | รหัสผู้ใช้ |
| activity_type | VARCHAR(50) | ประเภทกิจกรรม |
| entity_type | VARCHAR(50) | ประเภทเอนทิตี้ |
| entity_id | VARCHAR(100) | รหัสเอนทิตี้ |
| data | JSONB | ข้อมูลเพิ่มเติม |
| created_at | TIMESTAMP | วันที่บันทึกกิจกรรม |

#### ตาราง `api_cache`
เก็บข้อมูล Cache ของ API เพื่อลดการเรียกใช้ API

| ฟิลด์ | ประเภทข้อมูล | คำอธิบาย |
|------|---------|-----------|
| id | UUID | รหัสเฉพาะ |
| endpoint | VARCHAR(255) | URL Endpoint ของ API |
| params | JSONB | พารามิเตอร์ที่ใช้เรียก API |
| response | JSONB | ข้อมูลที่ได้จาก API |
| last_updated | TIMESTAMP | วันที่อัปเดตข้อมูลล่าสุด |
| expires_at | TIMESTAMP | วันที่ข้อมูลหมดอายุ |

## นโยบายความปลอดภัย (Row-Level Security)

สคริปต์ได้ตั้งค่านโยบายความปลอดภัยระดับแถว (RLS) สำหรับตารางต่างๆ ดังนี้:

1. **ตาราง user_profiles**
   - ผู้ใช้ทุกคนสามารถดูโปรไฟล์ของทุกคนได้
   - ผู้ใช้สามารถแก้ไขโปรไฟล์ของตนเองเท่านั้น

2. **ตาราง user_favorites**
   - ผู้ใช้สามารถจัดการรายการโปรดของตนเองเท่านั้น

3. **ตาราง advertisements**
   - ผู้ใช้ที่ลงชื่อเข้าใช้สามารถดำเนินการทั้งหมดกับโฆษณา
   - ผู้ใช้ทั่วไปสามารถอ่านข้อมูลโฆษณาได้เท่านั้น

## การเชื่อมต่อกับ Supabase จากแอปพลิเคชัน

ในการเชื่อมต่อกับ Supabase จากแอปพลิเคชัน ให้ใช้ Supabase Client ด้วยค่า URL และ API Key ที่กำหนดไว้ในไฟล์ `.env.local`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## ตัวอย่างการใช้งาน Supabase Client กับตารางต่างๆ

### ดึงข้อมูลโฆษณาที่กำลังใช้งานอยู่

```javascript
const getActiveAds = async (position) => {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('status', 'active')
    .eq('position', position)
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString());
    
  if (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
  
  return data;
};
```

### เพิ่มการพยากรณ์ผลการแข่งขันโดยผู้ใช้

```javascript
const addUserPrediction = async (userId, matchId, homeScore, awayScore) => {
  const { data, error } = await supabase
    .from('match_predictions')
    .insert({
      user_id: userId,
      match_id: matchId,
      prediction_type: 'exact_score',
      home_score: homeScore,
      away_score: awayScore,
      result: 'pending'
    })
    .select();
    
  if (error) {
    console.error('Error adding prediction:', error);
    return null;
  }
  
  return data;
};
```

### ดึงข้อมูลการแข่งขันที่กำลังถ่ายทอดสด

```javascript
const getLiveMatches = async () => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:home_team_id(name, name_th, logo_url),
      away_team:away_team_id(name, name_th, logo_url),
      league:league_id(name, name_th, logo_url)
    `)
    .eq('status', 'LIVE');
    
  if (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
  
  return data;
};
```

### บันทึกกิจกรรมของผู้ใช้

```javascript
const logUserActivity = async (userId, activityType, entityType, entityId, data = {}) => {
  const { error } = await supabase
    .from('user_activity_log')
    .insert({
      user_id: userId,
      activity_type: activityType,
      entity_type: entityType,
      entity_id: entityId,
      data: data
    });
    
  if (error) {
    console.error('Error logging user activity:', error);
  }
};
```

## สรุป

การใช้ Supabase เป็นฐานข้อมูลสำหรับ Playjoy Livescore ช่วยให้สามารถจัดการข้อมูลต่างๆ ได้อย่างมีประสิทธิภาพ ด้วยความสามารถในการควบคุมความปลอดภัยระดับแถว (RLS) และการใช้งานร่วมกับระบบ Authentication ของ Supabase ทำให้สามารถสร้างแอปพลิเคชันที่มีความปลอดภัยและตอบสนองความต้องการของผู้ใช้ได้เป็นอย่างดี
