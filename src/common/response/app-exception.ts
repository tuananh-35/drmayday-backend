import { HttpException } from '@nestjs/common';
import { CodeDef } from './codes';

export class AppException extends HttpException {
  constructor(public readonly def: CodeDef, message?: string) {
    super({ code: def.code, message: message ?? def.message, data: null }, def.http);
  }
}
