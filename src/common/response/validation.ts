import { ValidationError } from 'class-validator';
import { AppException } from './app-exception';
import { Codes } from './codes';

// Chuyển lỗi class-validator sang mã nghiệp vụ 2001/2002/2003/2004.
export function validationExceptionFactory(errors: ValidationError[]) {
  const all = flatten(errors);
  const has = (keys: string[], prop?: string) =>
    all.some((e) => (!prop || e.property === prop) && e.constraints && keys.some((k) => k in e.constraints!));

  if (has(['isNotEmpty', 'isDefined'])) {
    const p = all.find((e) => e.constraints && ('isNotEmpty' in e.constraints || 'isDefined' in e.constraints))?.property;
    return new AppException(Codes.MISSING_PARAM, `Missing required parameter: ${p}`);
  }
  if (has(['matches'], 'phone')) return new AppException(Codes.INVALID_PHONE);
  if (has(['isInt', 'isString', 'isNumber'])) return new AppException(Codes.INVALID_TYPE);
  return new AppException(Codes.INVALID_VALUE);
}

function flatten(errors: ValidationError[]): ValidationError[] {
  return errors.flatMap((e) => [e, ...(e.children ? flatten(e.children) : [])]);
}
