import { HttpStatus } from '@nestjs/common';

// Mã nghiệp vụ lấy từ slide. Các mã đánh dấu (?) là suy đoán,
// hãy đối chiếu với sheet "DANH SÁCH MÃ RESPONSE" rồi sửa lại.
export const Codes = {
  OK: { code: 1000, message: 'OK', http: HttpStatus.OK },
  CREATED: { code: 1001, message: 'Created successfully', http: HttpStatus.CREATED },

  MISSING_PARAM: { code: 2001, message: 'Missing required parameter', http: HttpStatus.BAD_REQUEST },
  INVALID_TYPE: { code: 2002, message: 'Invalid parameter type', http: HttpStatus.BAD_REQUEST },
  INVALID_VALUE: { code: 2003, message: 'Invalid parameter value', http: HttpStatus.BAD_REQUEST },
  INVALID_PHONE: { code: 2004, message: 'Invalid phone number format', http: HttpStatus.BAD_REQUEST },

  TOKEN_INVALID: { code: 3001, message: 'Token invalid', http: HttpStatus.UNAUTHORIZED }, // (?)
  TOKEN_EXPIRED: { code: 3002, message: 'Token expired', http: HttpStatus.UNAUTHORIZED }, // (?)
  NOT_AUTHENTICATED: { code: 3003, message: 'User not authenticated', http: HttpStatus.UNAUTHORIZED },
  PHONE_EXISTS: { code: 3006, message: 'User phone already exists', http: HttpStatus.CONFLICT },
  USER_NOT_FOUND: { code: 3007, message: 'User account not found', http: HttpStatus.NOT_FOUND },
  PASSWORD_INCORRECT: { code: 3008, message: 'Password incorrect', http: HttpStatus.UNAUTHORIZED },
  OLD_PASSWORD_INCORRECT: { code: 3009, message: 'Old password incorrect', http: HttpStatus.BAD_REQUEST },
  ACCOUNT_DISABLED: { code: 3010, message: 'User account disabled', http: HttpStatus.FORBIDDEN }, // (?)
  OTP_INVALID: { code: 3011, message: 'Reset code invalid or expired', http: HttpStatus.BAD_REQUEST }, // (?)

  ADMIN_REQUIRED: { code: 3102, message: 'Admin role required', http: HttpStatus.FORBIDDEN },
  DOCTOR_REQUIRED: { code: 3103, message: 'Doctor role required', http: HttpStatus.FORBIDDEN },
  DOCTOR_NOT_ASSIGNED: { code: 3105, message: 'Doctor not assigned to this record', http: HttpStatus.FORBIDDEN },
  CROSS_USER_ACCESS: { code: 3106, message: "Cannot access another user's data", http: HttpStatus.FORBIDDEN },
} as const;

export type CodeDef = (typeof Codes)[keyof typeof Codes];
