import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AppException } from '../response/app-exception';
import { Codes } from '../response/codes';

// Tạm thời kiểm theo tên role. Bước sau thay bằng PermissionGuard đọc bảng
// api_endpoints / permissions_endpoints để đúng yêu cầu "Dynamic RBAC".
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!required?.length) return true;
    const user = ctx.switchToHttp().getRequest().user;
    if (user && required.includes(user.role)) return true;
    throw new AppException(required.includes('admin') ? Codes.ADMIN_REQUIRED : Codes.DOCTOR_REQUIRED);
  }
}
