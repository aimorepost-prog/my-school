"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          <Link
            href="/admin"
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            管理画面
          </Link>
          <Link
            href="/admin/contacts"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            お問い合わせ
          </Link>
        </div>
        <a
          href="/admin/logout"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ログアウト
        </a>
      </div>
    </div>
  );
}
