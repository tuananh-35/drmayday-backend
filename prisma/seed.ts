import { PrismaClient, QuestionType, FilledBy } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // --- Roles (phân cấp qua parent_role_id) ---
  const admin = await prisma.role.upsert({ where: { name: 'admin' }, update: {}, create: { name: 'admin', description: 'Quản trị hệ thống' } });
  const doctor = await prisma.role.upsert({ where: { name: 'doctor' }, update: {}, create: { name: 'doctor', description: 'Bác sĩ' } });
  await prisma.role.upsert({ where: { name: 'nurse' }, update: {}, create: { name: 'nurse', description: 'Điều dưỡng', parentRoleId: doctor.id } });
  await prisma.role.upsert({ where: { name: 'patient' }, update: {}, create: { name: 'patient', description: 'Bệnh nhân' } });

  // --- Permissions mẫu ---
  for (const code of ['manage_users', 'manage_roles', 'manage_facilities', 'manage_templates', 'view_medical_records', 'write_prescriptions']) {
    const p = await prisma.permission.upsert({ where: { code }, update: {}, create: { code } });
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: admin.id, permissionId: p.id } }, update: {},
      create: { roleId: admin.id, permissionId: p.id },
    });
  }

  // --- Hạ tầng mẫu ---
  const branch = (await prisma.branch.findFirst()) ?? (await prisma.branch.create({ data: { name: 'Cơ sở Hà Nội' } }));
  const dept = (await prisma.department.findFirst()) ?? (await prisma.department.create({ data: { name: 'Khoa Da liễu', branchId: branch.id } }));
  if (!(await prisma.room.findFirst())) await prisma.room.create({ data: { name: 'Phòng khám 101', departmentId: dept.id } });

  // --- Tài khoản admin ---
  await prisma.user.upsert({
    where: { phone: '0900000000' }, update: {},
    create: {
      fullName: 'Quản trị viên', phone: '0900000000', roleId: admin.id,
      passwordHash: await bcrypt.hash('Admin@123', 10),
      staff: { create: {} }, notificationSetting: { create: {} },
    },
  });

  // --- Template mẫu cho mề đay (có câu hỏi rẽ nhánh) ---
  if (!(await prisma.template.findUnique({ where: { codeTemplate: 'TMPL_URT' } }))) {
    await prisma.template.create({
      data: {
        codeTemplate: 'TMPL_URT', name: 'Phiếu khám mề đay mạn tính', description: 'Mẫu mặc định',
        sections: {
          create: [
            { title: 'Triệu chứng', orderIndex: 1, filledBy: FilledBy.patient },
            { title: 'Nhận định của bác sĩ', orderIndex: 2, filledBy: FilledBy.doctor },
          ],
        },
      },
    });
    const sec1 = await prisma.templateSection.findFirstOrThrow({ where: { template: { codeTemplate: 'TMPL_URT' }, orderIndex: 1 } });
    const sec2 = await prisma.templateSection.findFirstOrThrow({ where: { template: { codeTemplate: 'TMPL_URT' }, orderIndex: 2 } });

    const q1 = await prisma.question.create({
      data: {
        sectionId: sec1.id, content: 'Bạn có nổi sẩn ngứa trong 6 tuần qua không?', typeQuestion: QuestionType.radio, isRequired: true, orderIndex: 1,
        options: { create: [{ label: 'Có', value: 'yes', orderIndex: 1 }, { label: 'Không', value: 'no', orderIndex: 2 }] },
      },
    });
    await prisma.question.create({
      data: {
        sectionId: sec1.id, parentQuestionId: q1.id, content: 'Chụp ảnh vùng da bị tổn thương',
        typeQuestion: QuestionType.image_upload, orderIndex: 2,
        showIfAnswer: { question_id: q1.id, equals: 'yes' }, // hiện khi câu cha trả lời "yes"
      },
    });
    await prisma.question.create({
      data: { sectionId: sec1.id, content: 'Mô tả thêm về triệu chứng', typeQuestion: QuestionType.textarea, orderIndex: 3 },
    });
    await prisma.question.create({
      data: { sectionId: sec2.id, content: 'Chẩn đoán sơ bộ', typeQuestion: QuestionType.text, orderIndex: 1 },
    });
  }
  console.log('Seed xong. Admin: 0900000000 / Admin@123');
}

main().finally(() => prisma.$disconnect());
