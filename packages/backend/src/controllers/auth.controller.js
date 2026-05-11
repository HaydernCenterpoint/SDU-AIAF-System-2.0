import { successResponse } from '../utils/response.js';

export function createAuthController({ authService }) {
  return {
    async register(req, res) {
      const result = await authService.register(req.body);
      return successResponse(res, {
        statusCode: 201,
        message: 'Đăng ký thành công',
        data: result,
      });
    },

    async login(req, res) {
      const result = await authService.login(req.body);
      return successResponse(res, {
        message: 'Đăng nhập thành công',
        data: result,
      });
    },

    async logout(req, res) {
      await authService.logout(req.body);
      return successResponse(res, { message: 'Đăng xuất thành công', data: null });
    },

    async refreshToken(req, res) {
      const result = await authService.refreshToken(req.body);
      return successResponse(res, {
        message: 'Làm mới token thành công',
        data: result,
      });
    },

    async forgotPassword(req, res) {
      const result = await authService.forgotPassword(req.body);
      return successResponse(res, {
        message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi',
        data: result.resetToken ? { resetToken: result.resetToken } : null,
      });
    },

    async resetPassword(req, res) {
      await authService.resetPassword(req.body);
      return successResponse(res, { message: 'Đặt lại mật khẩu thành công', data: null });
    },

    async changePassword(req, res) {
      await authService.changePassword(req.user.id, req.body);
      return successResponse(res, { message: 'Đổi mật khẩu thành công', data: null });
    },
  };
}
