'use client';

import { useEffect, useState } from 'react';
import { BrandMark } from '@/components/BrandMark';
import { useAuthStore } from '@/hooks/useAuthStore';
import { schoolConfigs } from '@/lib/school-config';
import { readSchoolDisplayName } from '@/lib/school-session';
import type { SchoolSlug } from '@/lib/school-site';

type AuthFrameProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  asideTitle?: string;
  asideText?: string;
  school?: SchoolSlug;
};

function getAssistantSlogans(school: SchoolSlug) {
  if (school === 'ntd') {
    return [
      'Mot khong gian noi bo gon gang cho lich hoc, tai lieu, cong dong va thong bao THPT.',
      'Dang nhap de tiep tuc xem lich hoc, tai lieu on tap va nhac nho trong portal Nguyen Thi Due.',
      'Portal THPT giup hoc sinh, giao vien va ban giam hieu giu thong tin trong mot nhan hieu rieng.',
      'Tai khoan cua ban ket noi lich hoc, tai lieu va trao doi cong dong theo dung truong.',
    ];
  }

  return [
    'Mot khong gian hoc tap gon gang cho lich hoc, tai lieu, bai tap va cau hoi voi tro ly AI Sao Do.',
    'Dang nhap de tiep tuc hoc tap, xem lich hom nay va hoi nhanh nhung dieu ban can chuan bi.',
    'Tro ly Sao Do giup ban to chuc ngay hoc ro rang hon ma khong lam mat su tap trung.',
    'Tai khoan cua ban ket noi lich hoc, tai lieu va hoi thoai AI trong mot noi tin cay.',
  ];
}

export function AuthFrame({
  title,
  subtitle,
  children,
  asideTitle,
  asideText,
  school = 'sdu',
}: AuthFrameProps) {
  const { user, token, isAuthenticated, fetchMe } = useAuthStore();
  const [storedName, setStoredName] = useState('');
  const [slogan, setSlogan] = useState(getAssistantSlogans(school)[0]);
  const schoolConfig = schoolConfigs[school];

  useEffect(() => {
    const slogans = getAssistantSlogans(school);
    setStoredName(readSchoolDisplayName(school));
    setSlogan(slogans[Math.floor(Math.random() * slogans.length)]);
  }, [school]);

  useEffect(() => {
    if (token && !isAuthenticated && !user) {
      fetchMe(school);
    }
  }, [token, isAuthenticated, user, fetchMe, school]);

  useEffect(() => {
    if (user?.fullName) {
      setStoredName(user.fullName);
    }
  }, [user?.fullName]);

  const displayName = user?.fullName || storedName || 'ban';
  const asideHeading = asideTitle ?? `Xin chao, ${displayName}`;
  const asideDescription = asideText ?? slogan;

  return (
    <main className="academic-page grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_minmax(420px,1.1fr)]">
      <section className="hidden border-r border-border bg-white px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <BrandMark size="md" school={school} />

        <div className="max-w-xl">
          <p className="academic-section-eyebrow">{schoolConfig.name}</p>
          <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-[-0.055em] text-text">{asideHeading}</h1>
          <p className="mt-5 max-w-lg text-lg font-semibold leading-8 text-text-sub">{asideDescription}</p>
        </div>

        <address className="academic-card-quiet p-4 text-sm font-semibold not-italic leading-6 text-text-sub">
          {school === 'ntd'
            ? 'THPT Nguyen Thi Due - cong noi bo danh cho hoc sinh, giao vien THPT, hoc sinh truyen thong va ban giam hieu.'
            : 'Cong dang nhap rieng cho giang vien va sinh vien Truong Dai hoc Sao Do.'}
        </address>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark size="lg" school={school} />
          </div>
          <div className="academic-card p-6 sm:p-8">
            <div className="mb-6">
              <p className="academic-section-eyebrow">{school === 'ntd' ? 'Tai khoan noi bo THPT' : 'Tai khoan sinh vien'}</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-text">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-sub">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
