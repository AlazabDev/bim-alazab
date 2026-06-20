import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Database, UserCheck, FileCheck2, Mail } from "lucide-react";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "الثقة والخصوصية — bim.alazab.com" },
      { name: "description", content: "كيف نحمي بياناتك ومشاريعك على منصة Alazab BIM: الأمان، الخصوصية، صلاحيات الوصول، والامتثال." },
      { property: "og:title", content: "الثقة والخصوصية — Alazab BIM" },
      { property: "og:description", content: "ضوابط الأمان، الخصوصية، وصلاحيات الوصول على منصة Alazab BIM." },
    ],
  }),
  component: TrustPage,
});

const sections = [
  {
    icon: Lock,
    title: "تشفير البيانات",
    body: "يتم نقل جميع البيانات عبر HTTPS/TLS. الملفات والمستندات تُخزَّن في Supabase Storage مع تشفير at-rest على مستوى البنية التحتية.",
  },
  {
    icon: UserCheck,
    title: "صلاحيات الوصول (RLS)",
    body: "نطبّق Row Level Security على كل الجداول. الوصول للمشاريع والملفات يعتمد على عضوية المستخدم في المشروع (project_members) ودوره (admin/owner/editor/viewer).",
  },
  {
    icon: Database,
    title: "عزل بيانات العملاء",
    body: "بيانات العملاء (الإيميل، الهاتف، الملاحظات) محجوبة عن أي مستخدم خارج المشاريع المرتبطة بالعميل، وإدارتها مقصورة على الأدمن فقط.",
  },
  {
    icon: FileCheck2,
    title: "سجل النشاط والتدقيق",
    body: "كل عمليات الرفع والاعتماد والتعديل تُسجَّل في activities مع الزمن والمستخدم لضمان قابلية التدقيق.",
  },
  {
    icon: Shield,
    title: "المصادقة وكلمات المرور",
    body: "نستخدم Supabase Auth مع جلسات JWT آمنة. نوصي بتفعيل خاصية Leaked Password Protection من لوحة Supabase لمنع كلمات المرور المسرّبة.",
  },
  {
    icon: Mail,
    title: "التواصل والإبلاغ عن ثغرات",
    body: "للإبلاغ عن مشكلة أمنية تواصل على security@alazab.com وسنرد خلال 48 ساعة عمل.",
  },
];

function TrustPage() {
  return (
    <AppShell>
      <PageHeader
        title="الثقة والأمان والخصوصية"
        description="نظرة عامة على الضوابط التي تحمي بياناتك ومشاريعك على منصة Alazab BIM"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="text-base font-semibold">{title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-4 p-5 text-sm text-muted-foreground">
        <p>
          هذه الصفحة تصف ضوابط أمان وخصوصية مطبَّقة داخل التطبيق ولا تمثّل شهادة امتثال
          مستقلة. سياسات الخصوصية وشروط الاستخدام الكاملة متاحة عند الطلب من فريق Alazab.
        </p>
      </Card>
    </AppShell>
  );
}
