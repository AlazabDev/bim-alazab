import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, CheckCircle2, FileCheck2, FileQuestion, FileStack, FolderKanban, ImageIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Alazab BIM — مركز معلومات المشروع" }] }),
  component: HomePage,
});

const modules = [
  { title: "إدارة المشاريع", description: "كود المشروع، العميل، الفرع، الحالة، ونسبة التقدم.", icon: FolderKanban },
  { title: "الملفات والإصدارات", description: "رسومات، صور، مستندات، نماذج، وإصدارات قابلة للتتبع.", icon: FileStack },
  { title: "الموافقات", description: "مسار واضح من الرفع إلى المراجعة ثم الاعتماد أو الرفض.", icon: CheckCircle2 },
  { title: "RFI و Submittals", description: "استفسارات فنية ومعتمدات مرتبطة بالمشروع والملفات.", icon: FileQuestion },
];

const evidence = ["HVAC", "Lighting", "Plumbing", "Site Photos", "As-Built", "O&M"];

function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground" dir="rtl">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary)/15,transparent_35%),radial-gradient(circle_at_bottom_right,var(--color-accent)/10,transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              مركز BIM لإدارة معلومات المشروع
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Alazab BIM
              <span className="block text-primary">منصة تشغيل وتسليم معلومات المشروع</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              طبقة إدارة رقمية تجمع المشاريع، الملفات، الإصدارات، الاعتمادات، الملاحظات، RFI، Submittals، والتقارير الفنية في مسار واحد قابل للمراجعة والتسليم.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="font-bold">
                <Link to="/dashboard">فتح لوحة القيادة <ArrowLeft className="mr-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold">
                <Link to="/auth">تسجيل الدخول</Link>
              </Button>
            </div>
          </div>

          <Card className="relative p-5 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">BIM Command Layer</h2>
                <p className="text-xs text-muted-foreground">Project information flow</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-3">
              {["Project", "Discipline", "File / Record", "Revision", "Status", "Decision"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-xl border border-border bg-card/80 p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{step}</div>
                    <div className="text-xs text-muted-foreground">مسار حوكمة قابل للتتبع داخل المشروع</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">الوحدات الأساسية</h2>
            <p className="mt-1 text-sm text-muted-foreground">بداية منظمة لمركز إدارة BIM داخل العزب.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((item) => (
            <Card key={item.title} className="p-5 transition hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 lg:px-8">
        <Card className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
              <ImageIcon className="h-4 w-4" />
              Technical Evidence
            </div>
            <h2 className="text-2xl font-black">طبقة الأدلة الفنية</h2>
            <p className="mt-3 leading-8 text-muted-foreground">
              كل تقرير أو صورة أو اعتماد يتحول إلى سجل مرتبط بالمشروع والتخصص والحالة. هذه الطبقة هي الأساس العملي لربط التكييف والإضاءة والسباكة بمسار BIM.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {evidence.map((item) => (
              <div key={item} className="rounded-xl border border-border bg-muted/30 p-4 text-center font-bold">
                <FileCheck2 className="mx-auto mb-2 h-5 w-5 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
