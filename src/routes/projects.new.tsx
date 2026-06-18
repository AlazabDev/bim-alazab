import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Building2, MapPin, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects/new")({
  head: () => ({ meta: [{ title: "مشروع جديد — bim.alazab.com" }] }),
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <PageHeader
        title="إنشاء مشروع جديد"
        description="حدد البيانات الأساسية والفريق ومواعيد التسليم"
        actions={<Button variant="ghost" asChild><Link to="/projects"><ArrowRight className="ms-1 h-4 w-4" /> العودة</Link></Button>}
      />

      <form
        onSubmit={(e) => { e.preventDefault(); toast.success("تم إنشاء المشروع بنجاح"); setTimeout(() => navigate({ to: "/projects" }), 600); }}
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-semibold"><Building2 className="h-4 w-4 text-primary" /> البيانات الأساسية</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Label>اسم المشروع</Label><Input placeholder="مثال: برج العزب التجاري" required /></div>
              <div><Label>كود المشروع</Label><Input placeholder="ALZ-2026-XXX" /></div>
              <div><Label>العميل</Label><Input placeholder="اسم الجهة المالكة" /></div>
              <div className="md:col-span-2"><Label>الوصف</Label><Textarea rows={4} placeholder="وصف موجز للنطاق والأهداف الرئيسية..." /></div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> الموقع والتصنيف</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>المدينة</Label><Input placeholder="الرياض" /></div>
              <div><Label>الحي / المنطقة</Label><Input placeholder="حي الملقا" /></div>
              <div>
                <Label>نوع المشروع</Label>
                <Select defaultValue="commercial">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">تجاري</SelectItem>
                    <SelectItem value="residential">سكني</SelectItem>
                    <SelectItem value="health">صحي</SelectItem>
                    <SelectItem value="education">تعليمي</SelectItem>
                    <SelectItem value="industrial">صناعي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>المرحلة الحالية</Label>
                <Select defaultValue="design">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">تخطيط</SelectItem>
                    <SelectItem value="design">تصميم</SelectItem>
                    <SelectItem value="execution">تنفيذ</SelectItem>
                    <SelectItem value="handover">تسليم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-semibold"><Calendar className="h-4 w-4 text-primary" /> الجدول الزمني</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>تاريخ البدء</Label><Input type="date" /></div>
              <div><Label>تاريخ التسليم</Label><Input type="date" /></div>
              <div><Label>الميزانية التقديرية</Label><Input placeholder="بالريال السعودي" /></div>
              <div><Label>العملة</Label><Select defaultValue="sar"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sar">ريال سعودي</SelectItem><SelectItem value="usd">دولار</SelectItem></SelectContent></Select></div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-semibold"><Users className="h-4 w-4 text-primary" /> الفريق</div>
            <div className="space-y-3">
              <div><Label>مدير المشروع</Label><Select><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger><SelectContent><SelectItem value="khaled">م. خالد الفهد</SelectItem><SelectItem value="mona">م. منى الزهراني</SelectItem></SelectContent></Select></div>
              <div><Label>مهندس التصميم</Label><Select><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger><SelectContent><SelectItem value="sara">م. سارة الحربي</SelectItem></SelectContent></Select></div>
              <div><Label>جهة الإشراف</Label><Select><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger><SelectContent><SelectItem value="yaser">م. ياسر القحطاني</SelectItem></SelectContent></Select></div>
              <div><Label>المالك / الممثل</Label><Select><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger><SelectContent><SelectItem value="abdullah">أ. عبدالله العزب</SelectItem></SelectContent></Select></div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-3 font-semibold">إعدادات إضافية</div>
            <div className="space-y-3 text-sm">
              <label className="flex items-start gap-2"><input type="checkbox" defaultChecked className="mt-1" /> تفعيل تحليل الصور الميدانية بالذكاء الاصطناعي</label>
              <label className="flex items-start gap-2"><input type="checkbox" defaultChecked className="mt-1" /> تفعيل وحدة Issues / RFIs / Submittals</label>
              <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" /> إنشاء قوالب موافقة افتراضية</label>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" asChild><Link to="/projects">إلغاء</Link></Button>
            <Button type="submit" className="flex-1">إنشاء المشروع</Button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
