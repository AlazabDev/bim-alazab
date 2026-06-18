import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LifeBuoy, Search, BookOpen, MessageCircle, Mail, Video, FileQuestion, Sparkles, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "المساعدة والدعم — bim.alazab.com" }] }),
  component: HelpPage,
});

const categories = [
  { icon: BookOpen, title: "دليل البداية السريعة", desc: "تعرّف على أساسيات المنصة في 5 دقائق", color: "from-primary/20 to-primary/5" },
  { icon: Video, title: "فيديوهات تعليمية", desc: "شروحات مرئية لكل الميزات الرئيسية", color: "from-info/20 to-info/5" },
  { icon: FileQuestion, title: "الأسئلة الشائعة", desc: "إجابات لأكثر الاستفسارات تكرارًا", color: "from-warning/20 to-warning/5" },
  { icon: Sparkles, title: "ميزات الذكاء الاصطناعي", desc: "كيفية استخدام أدوات AI لتحليل المشاريع", color: "from-success/20 to-success/5" },
];

const faqs = [
  { q: "كيف يمكنني إنشاء مشروع جديد؟", a: "من القائمة الجانبية اضغط على \"مشروع جديد\" أو انتقل إلى صفحة المشاريع واضغط على زر الإضافة. املأ الاسم والكود والعميل ثم احفظ." },
  { q: "كيف أضيف أعضاء إلى المشروع؟", a: "افتح المشروع، انتقل إلى تبويب \"الأعضاء\"، ثم اضغط \"إضافة عضو\" وحدد البريد الإلكتروني والصلاحية المناسبة (مالك، محرر، مشاهد)." },
  { q: "ما هي صلاحيات الأدوار المختلفة؟", a: "المالك: تحكم كامل بما في ذلك حذف المشروع. المحرر: إضافة وتعديل المحتوى. المشاهد: قراءة فقط بدون تعديل." },
  { q: "كيف يعمل عارض النموذج ثلاثي الأبعاد؟", a: "في صفحة المشروع، انتقل إلى تبويب \"عرض ثلاثي الأبعاد\" وأضف رابط النموذج من MagicPlan أو خدمة مشابهة. يمكنك عرضه بملء الشاشة." },
  { q: "هل يمكنني تصدير التقارير؟", a: "نعم، من صفحة التحليلات اضغط \"تصدير\" لتحميل التقارير بصيغة PDF أو Excel." },
  { q: "كيف أُفعّل الإشعارات؟", a: "من الإعدادات > الإشعارات يمكنك تفعيل إشعارات البريد والإشعارات الفورية والملخص الأسبوعي." },
];

function HelpPage() {
  return (
    <AppShell>
      <PageHeader title="المساعدة والدعم" description="ابحث في قاعدة المعرفة أو تواصل مع فريق الدعم" />

      <Card className="mb-6 overflow-hidden bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent p-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-elevated"><LifeBuoy className="h-7 w-7" /></div>
          <h2 className="mb-2 text-2xl font-extrabold">كيف يمكننا مساعدتك؟</h2>
          <p className="mb-6 text-muted-foreground">ابحث في المقالات والأدلة والأسئلة الشائعة</p>
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ابحث عن سؤال أو موضوع..." className="h-12 pr-10 text-base" />
          </div>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className={`group cursor-pointer p-5 transition-all hover:shadow-elevated hover:-translate-y-0.5 bg-gradient-to-br ${c.color}`}>
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-background shadow-sm"><Icon className="h-5 w-5 text-primary" /></div>
              <div className="font-bold">{c.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">الأسئلة الشائعة</h3>
            <Badge variant="secondary">{faqs.length} سؤال</Badge>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-right">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" /><h3 className="font-bold">تواصل مباشر</h3></div>
            <p className="mb-4 text-sm text-muted-foreground">فريق الدعم متاح من السبت إلى الخميس، 9 ص - 6 م.</p>
            <Button className="w-full"><MessageCircle className="ms-1 h-4 w-4" /> بدء محادثة</Button>
          </Card>
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /><h3 className="font-bold">البريد الإلكتروني</h3></div>
            <p className="mb-3 text-sm text-muted-foreground">للاستفسارات التفصيلية والشكاوى.</p>
            <a href="mailto:support@alazab.com" className="block text-sm font-medium text-primary hover:underline">support@alazab.com</a>
          </Card>
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><h3 className="font-bold">مركز التوثيق</h3></div>
            <p className="mb-4 text-sm text-muted-foreground">مقالات تقنية مفصلة ومرجع API.</p>
            <Button variant="outline" className="w-full">زيارة التوثيق <ExternalLink className="me-1 h-3.5 w-3.5" /></Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
