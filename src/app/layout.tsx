import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { useTranslation } from '@/app/i18n';
import { fallbackLng } from './settings';
import { auth } from "@/app/api/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: { lng?: string } }): Promise<Metadata> {
  const lng = params?.lng || fallbackLng;
  const { t } = await useTranslation(lng, 'common');
  return {
    title: t('home'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { lng?: string };
}) {
  const lng = params?.lng || fallbackLng;
  const { t } = await useTranslation(lng, 'common');
  const user = await auth();
  
  const links = [
    { href: `/${lng}`, text: t('home') },
    { href: `/${lng}/categories`, text: t('categories') },
    { href: `/${lng}/products`, text: t('product_list') },
    { href: `/${lng}/cart`, text: t('cart') }
  ];

  return (
    <html lang={lng}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-white shadow">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href={`/${lng}`} className="text-xl font-bold">
                {t('home')}
              </Link>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-4">
                  {links.map((link) => (
                    <Link key={link.href} href={link.href} className="hover:text-gray-600">
                      {link.text}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center space-x-4 ml-4 border-l pl-4">
                  {user ? (
                    <>
                      <span className="text-gray-600">{user.name}</span>
                      {user.role === 'ADMIN' && (
                        <Link href={`/${lng}/admin`} className="text-blue-600 hover:text-blue-700">
                          {t('admin_dashboard')}
                        </Link>
                      )}
                      <Link href={`/${lng}/orders`} className="hover:text-gray-600">
                        {t('my_orders')}
                      </Link>
                      <Link href={`/${lng}/logout`} className="text-red-600 hover:text-red-700">
                        {t('logout')}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={`/${lng}/login`} className="text-blue-600 hover:text-blue-700">
                        {t('login')}
                      </Link>
                      <Link href={`/${lng}/register`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        {t('register')}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
