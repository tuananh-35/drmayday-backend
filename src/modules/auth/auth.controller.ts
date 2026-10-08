import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto, CreateStaffDto, ForgotPasswordDto, LoginDto, LogoutDto, ResetPasswordDto, SignupDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthUser, CurrentUser, Roles } from '../../common/decorators/roles.decorator';
import { created } from '../../common/response/response.interceptor';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) { return created(await this.auth.signup(dto)); }

  @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() u: AuthUser, @Body() dto: LogoutDto) { return this.auth.logout(u, dto); }

  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) { return this.auth.forgotPassword(dto); }

  @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  @Put('change-password')
  change(@CurrentUser() u: AuthUser, @Body() dto: ChangePasswordDto) { return this.auth.changePassword(u, dto); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')
  @Post('admin/create-staff')
  async createStaff(@Body() dto: CreateStaffDto) { return created(await this.auth.createStaff(dto)); }
}
