import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../../common/decorators/roles.decorator';

export class UpdateProfileDto {
  @IsOptional() @IsString() full_name?: string;
  @IsOptional() @IsInt() @Min(1900) @Max(new Date().getFullYear()) year_of_birth?: number;
  @IsOptional() @IsIn(['male', 'female', 'other']) gender?: string;
  @IsOptional() @IsString() occupation?: string;
  @IsOptional() @IsString() ethnicity?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() ward?: string;
  @IsOptional() @IsString() address_detail?: string;
  @IsOptional() @IsString() insurance_number?: string;
  @IsOptional() @IsString() relative_name?: string;
  @IsOptional() @IsString() relative_phone?: string;
}

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private prisma: PrismaService) {}

  private async load(id: number) {
    const u = await this.prisma.user.findUniqueOrThrow({ where: { id }, include: { patient: true, role: true } });
    const p = u.patient;
    return {
      id: u.id, full_name: u.fullName, phone: u.phone, email: u.email, role: u.role.name,
      year_of_birth: p?.yearOfBirth ?? null, gender: p?.gender ?? null, occupation: p?.occupation ?? null,
      ethnicity: p?.ethnicity ?? null, province: p?.province ?? null, district: p?.district ?? null,
      ward: p?.ward ?? null, address_detail: p?.addressDetail ?? null,
      insurance_number: p?.insuranceNumber ?? null, relative_name: p?.relativeName ?? null,
      relative_phone: p?.relativePhone ?? null,
    };
  }

  @Get() get(@CurrentUser() u: AuthUser) { return this.load(u.id); }

  @Put()
  async update(@CurrentUser() u: AuthUser, @Body() dto: UpdateProfileDto) {
    const { full_name, ...rest } = dto;
    await this.prisma.$transaction(async (tx) => {
      if (full_name) await tx.user.update({ where: { id: u.id }, data: { fullName: full_name } });
      const data = {
        yearOfBirth: rest.year_of_birth, gender: rest.gender as any, occupation: rest.occupation,
        ethnicity: rest.ethnicity, province: rest.province, district: rest.district, ward: rest.ward,
        addressDetail: rest.address_detail, insuranceNumber: rest.insurance_number,
        relativeName: rest.relative_name, relativePhone: rest.relative_phone,
      };
      if (Object.values(data).some((v) => v !== undefined))
        await tx.patient.update({ where: { userId: u.id }, data });
    });
    return this.load(u.id);
  }
}
