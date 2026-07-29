import './globals.css';
import type { Metadata } from 'next';
import { AuthNav } from '../src/components/auth/AuthNav';
export const metadata: Metadata = { title: 'MealCall｜今天吃什麼', description: '家庭餐點與冰箱庫存看板' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-Hant"><body><nav className="global-nav"><a href="/">今日看板</a><a href="/inventory">庫存管理</a><a href="/admin">成員／權限</a><a href="/admin">管理員後台</a></nav><AuthNav />{children}</body></html>; }
