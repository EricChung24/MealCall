import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'MealCall｜今天吃什麼', description: '家庭餐點與冰箱庫存看板' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-Hant"><body>{children}</body></html>; }
