import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });
const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'School Portal Gateway',
  description: 'Cổng chọn trường và đăng nhập vào website riêng của từng đơn vị.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} ${playfair.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
