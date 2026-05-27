import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-brand-bg">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-brand-light bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-ink">管理画面ログイン</h1>
          <p className="mb-8 text-sm text-ink-soft">
            パスワードを入力して管理画面にアクセスしてください。
            <span className="mt-2 block text-xs text-ink-mute">
              ※ <code className="text-ink-soft">ADMIN_PASSWORD=</code>{" "}
              は入力不要です。値だけ入力してください。
            </span>
          </p>
          <Suspense fallback={<div className="text-sm text-slate-500">読み込み中...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
