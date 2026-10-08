import { IsDefined, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min, MinLength } from 'class-validator';

const VN_PHONE = /^(0|\+84)\d{9}$/;

export class SignupDto {
  @IsDefined() @IsNotEmpty() @IsString() full_name!: string;
  @IsDefined() @IsNotEmpty() @IsString() @Matches(VN_PHONE) phone!: string;
  @IsDefined() @IsNotEmpty() @IsString() @MinLength(6) password!: string;
  @IsOptional() @IsInt() @Min(1900) @Max(new Date().getFullYear()) year_of_birth?: number;
  @IsOptional() @IsIn(['male', 'female', 'other']) gender?: string;
}

export class LoginDto {
  @IsDefined() @IsNotEmpty() @IsString() @Matches(VN_PHONE) phone!: string;
  @IsDefined() @IsNotEmpty() @IsString() password!: string;
}

export class LogoutDto {
  @IsOptional() @IsString() fcm_token?: string;
}

export class ForgotPasswordDto {
  @IsDefined() @IsNotEmpty() @IsString() @Matches(VN_PHONE) phone!: string;
}

// Bước "tiếp theo" sau forgot-password (slide chưa mô tả, mình bổ sung)
export class ResetPasswordDto {
  @IsDefined() @IsNotEmpty() @IsString() @Matches(VN_PHONE) phone!: string;
  @IsDefined() @IsNotEmpty() @IsString() otp!: string;
  @IsDefined() @IsNotEmpty() @IsString() @MinLength(6) new_password!: string;
}

export class ChangePasswordDto {
  @IsDefined() @IsNotEmpty() @IsString() oldPassword!: string;
  @IsDefined() @IsNotEmpty() @IsString() @MinLength(6) newPassword!: string;
  @IsDefined() @IsNotEmpty() @IsString() confirm_password!: string;
}

export class CreateStaffDto {
  @IsDefined() @IsNotEmpty() @IsString() full_name!: string;
  @IsDefined() @IsNotEmpty() @IsString() @Matches(VN_PHONE) phone!: string;
  @IsDefined() @IsNotEmpty() @IsString() @MinLength(6) password!: string;
  @IsDefined() @IsInt() role_id!: number;
  @IsOptional() @IsInt() branch_id?: number;
  @IsOptional() @IsInt() department_id?: number;
  @IsOptional() @IsInt() room_id?: number;
}
