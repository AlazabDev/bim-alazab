import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, Mail, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "تسجيل الدخول — bim.alazab.com" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <div className="grid min-h-screen lg:grid-cols-2" dir="rtl">
      {/* Brand panel */}
      <div className="relative hidden bg-gradient-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary"><Building2 className="h-6 w-6 text-primary-foreground" /></div>
          <div>
            <div className="text-lg font-bold">bim.alazab.com</div>
            <div className="text-xs text-sidebar-foreground/60">منصة BIM متكاملة</div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold leading-tight">منصة رقمية متكاملة لإدارة مشاريع البناء والـ BIM</h2>
          <p className="text-sidebar-foreground/70">
            إدارة الملفات، الموافقات الجماعية، تحليل الموقع بالذكاء الاصطناعي،
            ولوحات قيادة تنفيذية في مكان واحد.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[["+1,200", "مشروع نشط"], ["97%", "نسبة المطابقة"], ["24/7", "مراقبة AI"]].map(([v, l]) => (
              <div key={l} className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3 text-center">
                <div className="text-xl font-bold">{v}</div>
                <div className="text-[11px] text-sidebar-foreground/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-sidebar-foreground/50">© 2026 مجموعة العزب — جميع الحقوق محفوظة</div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md p-8 shadow-elevated">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground lg:hidden"><Building2 className="h-6 w-6" /></div>
            <h1 className="text-2xl font-bold">مرحبًا بعودتك</h1>
            <p className="mt-1 text-sm text-muted-foreground">سجّل الدخول للوصول إلى مشاريعك</p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => navigate({ to: "/dashboard" }), 600); }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" defaultValue="khaled@alazab.com" className="pr-9" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
                <a href="#" className="text-xs text-primary hover:underline">نسيت كلمة المرور؟</a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" defaultValue="••••••••" className="px-9" required />
                <Eye className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="text-sm font-normal">تذكرني على هذا الجهاز</Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              ليس لديك حساب؟ <Link to="/login" className="text-primary hover:underline">تواصل مع مدير النظام</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
