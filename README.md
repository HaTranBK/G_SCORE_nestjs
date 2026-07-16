# G-Score Backend — NestJS API

Đây là **backend API** cho hệ thống G-Score — một ứng dụng tra cứu và thống kê điểm thi THPT Quốc gia 2024.  
Được xây dựng bằng **NestJS**, **PostgreSQL** (qua Prisma ORM) và **Redis** để cache kết quả thống kê.

---

## Tech Stack

| Thành phần   | Công nghệ                    |
|--------------|------------------------------|
| Framework    | NestJS 11 (TypeScript)       |
| Database     | PostgreSQL 15 + Prisma ORM 7 |
| Cache        | Redis 7 (ioredis)            |
| Validation   | class-validator, class-transformer |
| Deployment   | Docker, Fly.io               |

---

## Kiến trúc Module

```
src/
├── modules/
│   ├── students/      # Tra cứu điểm theo số báo danh
│   ├── reports/       # Thống kê phân phối điểm theo môn + caching Redis
│   ├── dashboard/     # Top 10 thí sinh khối A (Toán + Lý + Hóa)
│   ├── prisma/        # PrismaService (database connection)
│   └── redis/         # RedisService (cache connection)
└── common/            # Utilities dùng chung
```

### API Endpoints

| Method | Endpoint                         | Mô tả                                      |
|--------|----------------------------------|--------------------------------------------|
| `GET`  | `/students/:sbd`                 | Tra cứu điểm theo số báo danh              |
| `GET`  | `/reports/score-distribution`    | Thống kê 4 mức điểm theo từng môn (cached) |
| `POST` | `/reports/clear-cache`           | Xoá cache Redis thủ công                  |
| `GET`  | `/dashboard/top-students?limit=` | Top N thí sinh khối A (mặc định 10)        |

---

## Yêu cầu môi trường

- **Node.js** >= 20
- **Docker & Docker Compose** (để chạy PostgreSQL + Redis local)
- **npm** >= 10

---

## Chạy Local (Development)

### 1. Clone & cài dependencies

```bash
git clone <repo-url>
cd G_SCORE_nestjs
npm install
```

### 2. Khởi động PostgreSQL & Redis qua Docker

```bash
docker-compose up -d
```

Lệnh này sẽ khởi chạy:
- **PostgreSQL** tại `localhost:5445` (database: `gscore`)
- **Redis** tại `localhost:6380`

### 3. Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc (hoặc copy từ ví dụ):

```env
DATABASE_URL="postgresql://gscore_user:gscore_pass@localhost:5445/gscore?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6380
```

### 4. Migrate database & Seed dữ liệu

```bash
# Chạy migrations
npx prisma migrate deploy

# Seed dữ liệu từ file CSV (diem_thi_thpt_2024.csv)
npm run prisma:seed
```

> **Lưu ý:** File CSV phải nằm tại `data/diem_thi_thpt_2024.csv`

### 5. Khởi động server

```bash
# Chế độ development (hot-reload)
npm run start:dev

# Chế độ production
npm run start:prod
```

Server mặc định chạy tại: **http://localhost:8000**

---

## Database Schema

Model `StudentScore` (bảng `student_scores`):

| Cột            | Kiểu      | Mô tả                      |
|----------------|-----------|----------------------------|
| `sbd`          | String PK | Số báo danh                |
| `toan`         | Float?    | Điểm Toán                  |
| `ngu_van`      | Float?    | Điểm Ngữ Văn               |
| `ngoai_ngu`    | Float?    | Điểm Ngoại Ngữ             |
| `vat_li`       | Float?    | Điểm Vật Lý                |
| `hoa_hoc`      | Float?    | Điểm Hóa Học               |
| `sinh_hoc`     | Float?    | Điểm Sinh Học              |
| `lich_su`      | Float?    | Điểm Lịch Sử              |
| `dia_li`       | Float?    | Điểm Địa Lý                |
| `gdcd`         | Float?    | Điểm GDCD                  |
| `ma_ngoai_ngu` | String?   | Mã ngoại ngữ (N1, N2, ...) |

---

## Chạy Tests

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## Docker

Build và chạy toàn bộ ứng dụng bằng Docker:

```bash
# Build image
docker build -t g-score-backend .

# Chạy container (cần DATABASE_URL và REDIS_URL từ environment)
docker run -p 8000:8000 \
  -e DATABASE_URL="..." \
  -e REDIS_HOST="..." \
  g-score-backend
```

---

## Deploy lên Fly.io

Ứng dụng được cấu hình sẵn để deploy lên [Fly.io](https://fly.io):

```bash
# Lần đầu tiên
fly launch

# Deploy
fly deploy

# Xem logs
fly logs
```

**Cấu hình Fly.io** (`fly.toml`):
- App name: `g-score-backend`
- Region: Singapore (`sin`)
- Port: `8000`
- RAM: 512MB, 1 shared CPU

> Cần set secrets trên Fly.io:
> ```bash
> fly secrets set DATABASE_URL="postgresql://..."
> fly secrets set REDIS_HOST="..."
> fly secrets set REDIS_PORT="6379"
> fly secrets set ALLOWED_ORIGINS="https://g-score-frontend.fly.dev"
> ```

---

## CORS

Mặc định chỉ cho phép `http://localhost:3000`. Để thêm origin, set biến môi trường:

```env
ALLOWED_ORIGINS=https://g-score-frontend.fly.dev,https://my-domain.com
```

---

## License

UNLICENSED — Dự án nội bộ / học tập.
