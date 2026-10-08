import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../response/app-exception';
import { Codes } from '../response/codes';

export const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'];
    if (!header?.startsWith('Bearer ')) throw new AppException(Codes.NOT_AUTHENTICATED);
    const token = header.slice(7);

    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch (e: any) {
      throw new AppException(e?.name === 'TokenExpiredError' ? Codes.TOKEN_EXPIRED : Codes.TOKEN_INVALID);
    }

    const black = await this.prisma.tokenBlacklist.findUnique({ where: { tokenHash: hashToken(token) } });
    if (black) throw new AppException(Codes.TOKEN_INVALID);

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
    if (!user) throw new AppException(Codes.USER_NOT_FOUND);
    if (!user.isActive) throw new AppException(Codes.ACCOUNT_DISABLED);

    req.user = { id: user.id, role: user.role.name, token, tokenExp: payload.exp };
    return true;
  }
}
