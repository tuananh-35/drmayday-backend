# DrMayDay Backend (NestJS + Prisma + PostgreSQL)

## Chạy lần đầu
```bash
docker compose up -d            # PostgreSQL :5432, MinIO :9000 (console :9001)
cp .env.example .env            # đổi JWT_SECRET
npm install
npx prisma migrate dev --name init
npx prisma db seed              # role, admin, khoa/phòng, template mề đay mẫu
npm run start:dev
```
- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/docs
- Admin mẫu: `0900000000` / `Admin@123`

## Đã có
`POST /auth/signup | login | logout | forgot-password | reset-password`,
`PUT /auth/change-password`, `POST /auth/admin/create-staff`, `GET|PUT /profile`.
Schema Prisma đủ 32 bảng, response `{ code, message, data }`, blacklist token khi logout/đổi mật khẩu.

## Cần đối chiếu với tài liệu
1. Dạng envelope response và mã lỗi đánh dấu `(?)` trong `src/common/response/codes.ts`
   (sheet "DANH SÁCH MÃ RESPONSE").
2. Tên trường request/response (slide chỉ có ảnh).
3. `users.role_id` được đặt ở bảng `users` (slide ghi cả ở `staffs`).

## Việc tiếp theo
facilities -> roles/permissions/users admin -> templates -> medical-records -> media (MinIO)
-> lesions -> uas7 -> prescriptions/labs -> notifications (FCM) -> PermissionGuard động.
