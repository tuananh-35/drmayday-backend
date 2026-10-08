import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/response/app-exception';
import { Codes } from '../../common/response/codes';
import { hashToken } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/decorators/roles.decorator';
import {
  ChangePasswordDto, CreateStaffDto, ForgotPasswordDto, LoginDto, LogoutDto, ResetPasswordDto, SignupDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private publicUser(u: { id: number; fullName: string; phone: string; role: { name: string } }) {
    return { id: u.id, full_name: u.fullName, phone: u.phone, role: u.role.name };
  }

  async signup(dto: SignupDto) {
    if (await this.prisma.user.findUnique({ where: { phone: dto.phone } }))
      throw new AppException(Codes.PHONE_EXISTS);
    const role = await this.prisma.role.findUnique({ where: { name: 'patient' } });
    if (!role) throw new Error('Role "patient" chưa được seed');

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.full_name,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, 10),
        roleId: role.id,
        patient: { create: { yearOfBirth: dto.year_of_birth, gender: dto.gender as any } },
        notificationSetting: { create: {} },
      },
      include: { role: true },
    });
    return this.publicUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone }, include: { role: true } });
    if (!user) throw new AppException(Codes.USER_NOT_FOUND);
    if (!user.isActive) throw new AppException(Codes.ACCOUNT_DISABLED);
    if (!(await bcrypt.compare(dto.password, user.passwordHash))) throw new AppException(Codes.PASSWORD_INCORRECT);
    const token = await this.jwt.signAsync({ sub: user.id, role: user.role.name });
    return { token, user: this.publicUser(user) };
  }

  private async blacklist(auth: AuthUser) {
    await this.prisma.tokenBlacklist.upsert({
      where: { tokenHash: hashToken(auth.token) },
      create: { tokenHash: hashToken(auth.token), userId: auth.id, expiresAt: new Date(auth.tokenExp * 1000) },
      update: {},
    });
  }

  async logout(auth: AuthUser, dto: LogoutDto) {
    await this.blacklist(auth);
    await this.prisma.userFcmToken.deleteMany({
      where: { userId: auth.id, ...(dto.fcm_token ? { fcmToken: dto.fcm_token } : {}) },
    });
    return null;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new AppException(Codes.USER_NOT_FOUND);
    const otp = String(randomInt(100000, 1000000));
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: await bcrypt.hash(otp, 8), resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000) },
    });
    // TODO: gửi SMS thật (eSMS, Twilio...). Dev: in ra console.
    this.logger.warn(`[DEV] OTP cho ${dto.phone}: ${otp}`);
    return null;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new AppException(Codes.USER_NOT_FOUND);
    const ok = user.resetToken && user.resetTokenExpiry && user.resetTokenExpiry > new Date()
      && (await bcrypt.compare(dto.otp, user.resetToken));
    if (!ok) throw new AppException(Codes.OTP_INVALID);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(dto.new_password, 10), resetToken: null, resetTokenExpiry: null },
    });
    return null;
  }

  async changePassword(auth: AuthUser, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirm_password) throw new AppException(Codes.INVALID_VALUE);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: auth.id } });
    if (!(await bcrypt.compare(dto.oldPassword, user.passwordHash)))
      throw new AppException(Codes.OLD_PASSWORD_INCORRECT);
    await this.prisma.user.update({
      where: { id: auth.id },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 10) },
    });
    await this.blacklist(auth); // vô hiệu hoá token hiện tại, buộc đăng nhập lại
    return null;
  }

  async createStaff(dto: CreateStaffDto) {
    if (await this.prisma.user.findUnique({ where: { phone: dto.phone } }))
      throw new AppException(Codes.PHONE_EXISTS);
    if (!(await this.prisma.role.findUnique({ where: { id: dto.role_id } }))) throw new AppException(Codes.INVALID_VALUE);

    // Kiểm tra phân cấp: room thuộc department, department thuộc branch
    if (dto.room_id) {
      const room = await this.prisma.room.findUnique({ where: { id: dto.room_id } });
      if (!room || (dto.department_id && room.departmentId !== dto.department_id))
        throw new AppException(Codes.INVALID_VALUE);
    }
    if (dto.department_id) {
      const dept = await this.prisma.department.findUnique({ where: { id: dto.department_id } });
      if (!dept || (dto.branch_id && dept.branchId !== dto.branch_id)) throw new AppException(Codes.INVALID_VALUE);
    }

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.full_name,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, 10),
        roleId: dto.role_id,
        staff: { create: { branchId: dto.branch_id, departmentId: dto.department_id, roomId: dto.room_id } },
        notificationSetting: { create: {} },
      },
      include: { role: true },
    });
    return this.publicUser(user);
  }
}
