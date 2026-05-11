import { SchoolPortalLoginPage } from '@/components/SchoolPortalLoginPage';

export const metadata = {
  title: 'Đăng nhập THPT Nguyễn Thị Duệ',
};

export default function NtdLoginRoute() {
  return <SchoolPortalLoginPage mode="login" school="ntd" />;
}
