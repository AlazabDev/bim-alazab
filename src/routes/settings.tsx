import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings as SettingsIcon, Bell, Lock, Globe, Palette, Shield, Trash2, Save } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — bim.alazab.com" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [language, setLanguage] = useState("ar");
  const [theme, setTheme] = useState("system");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const handlePasswordChange = async () => {
    if (password.length < 8) return toast.error("كلمة المرور قصيرة جدًا");
    if (password !== confirmPassword) return toast.error("كلمتا المرور غير متطابقتين");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return toast.error("فشل تغيير كلمة المرور", { description: error.message });
    toast.success("تم تغيير كلمة المرور بنجاح");
    setPassword(""); setConfirmPassword("");
  };

  return (
    <AppShell>
      <PageHeader title="الإعدادات" description="إدارة تفضيلات حسابك والإشعارات والأمان" />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-4">
          <TabsTrigger value="general"><SettingsIcon className="ms-1 h-4 w-4" /> عام</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="ms-1 h-4 w-4" /> الإشعارات</TabsTrigger>
          <TabsTrigger value="security"><Lock className="ms-1 h-4 w-4" /> الأمان</TabsTrigger>
          <TabsTrigger value="danger"><Shield className="ms-1 h-4 w-4" /> الخطر</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">التفضيلات العامة</h3></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>اللغة</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Palette className="h-3.5 w-3.5" /> المظهر</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">فاتح</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                    <SelectItem value="system">حسب النظام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المنطقة الزمنية</Label>
                <Select defaultValue="riyadh">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riyadh">الرياض (GMT+3)</SelectItem>
                    <SelectItem value="dubai">دبي (GMT+4)</SelectItem>
                    <SelectItem value="cairo">القاهرة (GMT+2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تنسيق التاريخ</Label>
                <Select defaultValue="dmy">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex justify-end"><Button><Save className="ms-1 h-4 w-4" /> حفظ التغييرات</Button></div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">تفضيلات الإشعارات</h3></div>
            <div className="space-y-4">
              {[
                { id: "email", label: "إشعارات البريد الإلكتروني", desc: "استلام تنبيهات عبر البريد", value: emailNotif, set: setEmailNotif },
                { id: "push", label: "الإشعارات الفورية", desc: "إشعارات المتصفح في الوقت الفعلي", value: pushNotif, set: setPushNotif },
                { id: "digest", label: "الملخص الأسبوعي", desc: "تقرير أسبوعي عن النشاط والمستجدات", value: weeklyDigest, set: setWeeklyDigest },
              ].map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <div className="font-semibold">{s.label}</div>
                    <div className="text-sm text-muted-foreground">{s.desc}</div>
                  </div>
                  <Switch checked={s.value} onCheckedChange={s.set} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">تغيير كلمة المرور</h3></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>كلمة المرور الجديدة</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <div className="space-y-2"><Label>تأكيد كلمة المرور</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
              </div>
              <div className="mt-4 flex justify-end"><Button onClick={handlePasswordChange}>تحديث كلمة المرور</Button></div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2"><h3 className="text-lg font-bold">المصادقة الثنائية</h3><Badge variant="secondary">قريبًا</Badge></div>
                  <div className="mt-1 text-sm text-muted-foreground">أضف طبقة حماية إضافية لحسابك عبر تطبيق المصادقة.</div>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} disabled />
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="mb-2 text-lg font-bold">الجلسات النشطة</h3>
              <div className="text-sm text-muted-foreground">البريد: <span className="font-medium text-foreground">{user?.email}</span></div>
              <div className="mt-3"><Button variant="outline" onClick={() => supabase.auth.signOut()}>تسجيل الخروج من جميع الأجهزة</Button></div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-destructive/40 p-6">
            <div className="mb-4 flex items-center gap-2"><Trash2 className="h-5 w-5 text-destructive" /><h3 className="text-lg font-bold text-destructive">منطقة الخطر</h3></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div>
                  <div className="font-semibold">حذف الحساب</div>
                  <div className="text-sm text-muted-foreground">سيتم حذف جميع بياناتك بشكل دائم. لا يمكن التراجع.</div>
                </div>
                <Button variant="destructive">حذف الحساب</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
