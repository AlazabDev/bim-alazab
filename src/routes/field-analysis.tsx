import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Sparkles, Image as ImageIcon, AlertTriangle, CheckCircle2, Loader2, Bell } from "lucide-react";
import { fieldImages } from "@/lib/mock-data";

export const Route = createFileRoute("/field-analysis")({
  head: () => ({ meta: [{ title: "تحليل الموقع AI — bim.alazab.com" }] }),
  component: FieldAnalysis,
});

function FieldAnalysis() {
  return (
    <AppShell>
      <PageHeader
        title="تحليل الصور الميدانية بالذكاء الاصطناعي"
        description="رفع الصور، تحليلها ومقارنتها بالتصميم المعتمد، وكشف الانحرافات تلقائيًا"
        actions={<Button><Upload className="ms-1 h-4 w-4" /> رفع صور ميدانية</Button>}
      />

      {/* Upload zone */}
      <Card className="mb-4 p-6">
        <div className="grid place-items-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary"><ImageIcon className="h-7 w-7" /></div>
          <div className="mt-3 font-semibold">اسحب صور الموقع هنا أو اختر مجلدًا</div>
          <div className="text-xs text-muted-foreground">يتم تحليل الصور تلقائيًا ومقارنتها بالنموذج المعتمد</div>
          <div className="mt-3 flex gap-2"><Button>اختر صور</Button><Button variant="outline">رفع من الكاميرا</Button></div>
        </div>
      </Card>

      {/* Pipeline */}
      <Card className="mb-4 p-6">
        <h3 className="mb-4 font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> خط أنابيب التحليل</h3>
        <div className="grid gap-3 md:grid-cols-5">
          {[
            { t: "التقاط الصور", d: "من الموقع", icon: ImageIcon },
            { t: "الرفع للنظام", d: "تشفير وتخزين", icon: Upload },
            { t: "تحليل AI", d: "مقارنة بالتصميم", icon: Sparkles },
            { t: "تحليل النتائج", d: "كشف الانحرافات", icon: AlertTriangle },
            { t: "إشعار وتحديث", d: "تلقائي للمدير", icon: Bell },
          ].map((s, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary"><s.icon className="h-4 w-4" /></div>
              <div className="mt-2 text-sm font-semibold">{i + 1}. {s.t}</div>
              <div className="text-xs text-muted-foreground">{s.d}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Results grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fieldImages.map((img) => (
          <Card key={img.id} className="overflow-hidden p-0">
            <div className="relative aspect-video bg-gradient-to-br from-muted to-accent">
              <div className="absolute inset-0 grid place-items-center text-muted-foreground"><ImageIcon className="h-10 w-10" /></div>
              <Badge className={`absolute right-2 top-2 ${
                img.status === "conform" ? "bg-success text-success-foreground" :
                img.status === "deviation" ? "bg-destructive text-destructive-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {img.status === "conform" ? <><CheckCircle2 className="ms-1 h-3 w-3" /> مطابق</> :
                 img.status === "deviation" ? <><AlertTriangle className="ms-1 h-3 w-3" /> انحراف</> :
                 <><Loader2 className="ms-1 h-3 w-3 animate-spin" /> قيد التحليل</>}
              </Badge>
              <div className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-0.5 text-[10px] font-mono">{img.location}</div>
            </div>
            <div className="p-4">
              <div className="font-semibold">{img.title}</div>
              <div className="text-xs text-muted-foreground">{img.uploadedAt}</div>
              {img.status !== "analyzing" && (
                <>
                  <div className="mt-3 flex items-center justify-between text-sm"><span>نسبة المطابقة</span><span className={`font-bold ${img.conformity > 90 ? "text-success" : "text-warning"}`}>{img.conformity}%</span></div>
                  <Progress value={img.conformity} className="mt-1 h-1.5" />
                  <div className="mt-3 flex items-center justify-between text-sm"><span>عدد الانحرافات</span><span className={`font-bold ${img.deviations > 0 ? "text-destructive" : "text-success"}`}>{img.deviations}</span></div>
                  {img.notes && <div className="mt-3 rounded-md bg-warning/10 p-2 text-xs text-warning-foreground border border-warning/30">{img.notes}</div>}
                </>
              )}
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="flex-1">عرض التحليل</Button>
                <Button size="sm" variant="outline">مقارنة</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
