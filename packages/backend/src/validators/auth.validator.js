import { z } from 'zod';
import { ACCOUNT_TYPE_VALUES } from '../account-types.js';

const passwordSchema = z
  .string({ message: 'Mật khẩu là bắt buộc' })
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Za-z]/, 'Mật khẩu phải có chữ cái')
  .regex(/[0-9]/, 'Mật khẩu phải có số');

export const registerSchema = z.object({
  email: z.string({ message: 'Email là bắt buộc' }).email('Email không đúng định dạng'),
  password: passwordSchema,
  fullName: z.string({ message: 'Họ tên là bắt buộc' }).min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  studentCode: z.string().min(2, 'Mã định danh không hợp lệ').optional(),
  accountType: z.enum(ACCOUNT_TYPE_VALUES, { message: 'Loại tài khoản không hợp lệ' }),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ').optional(),
  major: z.string().min(2, 'Thông tin khoa/lớp không hợp lệ').optional(),
}).superRefine((value, ctx) => {
  if (value.accountType !== 'guest_public' && !value.studentCode?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['studentCode'],
      message: 'Mã định danh là bắt buộc',
    });
  }
});

export const loginSchema = z.object({
  email: z.string({ message: 'Email là bắt buộc' }).email('Email không đúng định dạng'),
  password: z.string({ message: 'Mật khẩu là bắt buộc' }).min(1, 'Mật khẩu là bắt buộc'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(10).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string({ message: 'Refresh token là bắt buộc' }).min(10, 'Refresh token không hợp lệ'),
});

export const forgotPasswordSchema = z.object({
  email: z.string({ message: 'Email là bắt buộc' }).email('Email không đúng định dạng'),
});

export const resetPasswordSchema = z.object({
  token: z.string({ message: 'Token là bắt buộc' }).min(10, 'Token không hợp lệ'),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  oldPassword: z.string({ message: 'Mật khẩu cũ là bắt buộc' }).min(1, 'Mật khẩu cũ là bắt buộc'),
  newPassword: passwordSchema,
});
