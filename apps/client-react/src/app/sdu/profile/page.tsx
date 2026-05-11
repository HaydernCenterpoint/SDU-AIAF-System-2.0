import { ProfessionalProfilePage } from '@/sites/sdu/ProfessionalProfile';

export const metadata = {
  title: 'Hồ sơ sinh viên - Đại học Sao Đỏ',
};

export default function ProfileRoute() {
  return <ProfessionalProfilePage school="sdu" />;
}
