import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserCircle2, Mail, Phone, Briefcase, Save, Camera } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "الملف الشخصي — bim.alazab.com" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, roles, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone((profile as any).phone || "");
      setJobTitle((profile as any).job_title || "");
      setBio((profile as any).bio || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const initials = (fullName || user?.email || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const roleLabel = roles.includes("admin") ? "مسؤول النظام" : roles.includes("owner") ? "مالك" : roles.includes("editor") ? "محرر" : "مشاهد";

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar_url: avatarUrl } as any)
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error("فشل حفظ البيانات", { description: error.message });
    toast.success("تم حفظ الملف الشخصي");
    refreshProfile?.();
  };

  return (
    <AppShell>
      <PageHeader title="الملف الشخصي" description="إدارة معلوماتك الشخصية وصورتك الرمزية" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-28 w-28 ring-4 ring-primary/10">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 left-0 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-elevated hover:bg-primary/90">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 text-lg font-bold">{fullName || "مستخدم"}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <Badge className="mt-2" variant="secondary">{roleLabel}</Badge>
            <Separator className="my-4" />
            <div className="w-full space-y-2 text-right text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">عضو منذ</span><span>{user?.created_at ? new Date(user.created_at).toLocaleDateString("ar") : "—"}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">آخر تسجيل دخول</span><span>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("ar") : "—"}</span></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">المعلومات الشخصية</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>الاسم الكامل</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> البريد الإلكتروني</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> رقم الهاتف</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 ..." />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> المسمى الوظيفي</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="مهندس BIM" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>رابط الصورة الرمزية</Label>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." dir="ltr" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>نبذة عنك</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="اكتب نبذة قصيرة..." rows={4} />
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex justify-end gap-2">
            <Button variant="outline">إلغاء</Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="ms-1 h-4 w-4" /> {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
