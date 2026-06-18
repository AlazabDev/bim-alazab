import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Building2, Mail, Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "تسجيل الدخول — bim.alazab.com" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  // sign-in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // sign-up extras
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("تم تسجيل الدخول");
    navigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("تم إنشاء الحساب — تحقق من بريدك إن طُلب التأكيد");
    navigate({ to: "/dashboard" });
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  const handleReset = async () => {
    if (!email) return toast.error("أدخل بريدك أولًا");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("أُرسل رابط إعادة التعيين إلى بريدك");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2" dir="rtl">
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
          <p className="text-sidebar-foreground/70">إدارة الملفات، الموافقات، تحليل الموقع بالذكاء الاصطناعي، ولوحات قيادة تنفيذية في مكان واحد.</p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[["+1,200", "مشروع"], ["97%", "المطابقة"], ["24/7", "مراقبة AI"]].map(([v, l]) => (
              <div key={l} className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3 text-center">
                <div className="text-xl font-bold">{v}</div>
                <div className="text-[11px] text-sidebar-foreground/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-sidebar-foreground/50">© 2026 مجموعة العزب — جميع الحقوق محفوظة</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md p-8 shadow-elevated">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground lg:hidden"><Building2 className="h-6 w-6" /></div>
            <h1 className="text-2xl font-bold">مرحبًا بك في bim.alazab.com</h1>
            <p className="mt-1 text-sm text-muted-foreground">سجّل الدخول أو أنشئ حسابًا جديدًا</p>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">حساب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-5">
              <form onSubmit={handleSignIn} className="space-y-4">
                <EmailField email={email} setEmail={setEmail} />
                <PasswordField password={password} setPassword={setPassword} show={showPwd} setShow={setShowPwd} />
                <div className="flex justify-end">
                  <button type="button" onClick={handleReset} className="text-xs text-primary hover:underline">نسيت كلمة المرور؟</button>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "جاري الدخول..." : "تسجيل الدخول"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pr-9" required placeholder="م. خالد الفهد" />
                  </div>
                </div>
                <EmailField email={email} setEmail={setEmail} />
                <PasswordField password={password} setPassword={setPassword} show={showPwd} setShow={setShowPwd} hint="6 أحرف على الأقل" />
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "جاري الإنشاء..." : "إنشاء الحساب"}</Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">أو</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
            <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            متابعة بواسطة Google
          </Button>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            بالمتابعة فأنت توافق على <Link to="/auth" className="hover:underline">شروط الاستخدام</Link> وسياسة الخصوصية.
          </p>
        </Card>
      </div>
    </div>
  );
}

function EmailField({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="email">البريد الإلكتروني</Label>
      <div className="relative">
        <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-9" required placeholder="name@alazab.com" />
      </div>
    </div>
  );
}

function PasswordField({ password, setPassword, show, setShow, hint }: { password: string; setPassword: (v: string) => void; show: boolean; setShow: (v: boolean) => void; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="password">كلمة المرور</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="px-9" required minLength={6} />
        <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
