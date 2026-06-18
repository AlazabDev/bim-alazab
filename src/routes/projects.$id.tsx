import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, MapPin, Calendar, Users, FileStack, MessageSquare, Share2, Download,
  Upload, CheckCircle2, Clock, XCircle, FileText, Box, Image as ImageIcon, FileBarChart,
  Folder, History, Send, AlertTriangle, Sparkles
} from "lucide-react";
import { projects, statusMeta, files, fileCategoryLabel, approvals, activity, fieldImages, issues } from "@/lib/mock-data";

export const Route = createFileRoute("/projects/$id")({
  head: ({ params }) => {
    const p = projects.find((x) => x.id === params.id);
    return { meta: [{ title: `${p?.name ?? "مشروع"} — bim.alazab.com` }] };
  },
  component: ProjectDetail,
});

const fileIcons = { bim: Box, drawings: FileText, site_photos: ImageIcon, reports: FileBarChart, documents: Folder } as const;
const fileStatusTone = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-warning/15 text-warning-foreground border border-warning/30",
  approved: "bg-success/15 text-success border border-success/30",
  rejected: "bg-destructive/15 text-destructive border border-destructive/30",
} as const;
const fileStatusLabel = { draft: "مسودة", in_review: "قيد المراجعة", approved: "معتمد", rejected: "مرفوض" } as const;

function ProjectDetail() {
  const { project: p } = Route.useLoaderData();
  const meta = statusMeta[p.status];
  return (
    <AppShell>
      <PageHeader
        title={p.name}
        description={`${p.code} • ${p.client} • ${p.location}`}
        badge={<StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>}
        actions={
          <>
            <Button variant="outline" asChild><Link to="/projects"><ArrowRight className="ms-1 h-4 w-4" /> العودة</Link></Button>
            <Button variant="outline"><Share2 className="ms-1 h-4 w-4" /> مشاركة الفريق</Button>
            <Button><CheckCircle2 className="ms-1 h-4 w-4" /> إصدار نهائي</Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">نسبة الإنجاز</div>
          <div className="mt-1 text-3xl font-bold">{p.progress}%</div>
          <Progress value={p.progress} className="mt-3 h-1.5" />
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">نسبة المطابقة (AI)</div>
          <div className="mt-1 text-3xl font-bold text-success">{p.conformity}%</div>
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3" /> تحليل تلقائي للموقع</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">الملفات</div>
          <div className="mt-1 text-3xl font-bold">{p.filesCount}</div>
          <div className="mt-3 text-xs text-muted-foreground">عبر 5 تصنيفات</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">قضايا مفتوحة</div>
          <div className="mt-1 text-3xl font-bold text-destructive">{p.issuesOpen}</div>
          <div className="mt-3 text-xs text-muted-foreground">تتطلب المتابعة</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="w-full overflow-x-auto md:w-auto">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="files">الملفات</TabsTrigger>
          <TabsTrigger value="versions">الإصدارات</TabsTrigger>
          <TabsTrigger value="approvals">الموافقات</TabsTrigger>
          <TabsTrigger value="ai">تحليل AI</TabsTrigger>
          <TabsTrigger value="issues">القضايا</TabsTrigger>
          <TabsTrigger value="team">الفريق</TabsTrigger>
          <TabsTrigger value="activity">النشاط</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <h3 className="mb-3 font-semibold">وصف المشروع</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info icon={MapPin} label="الموقع" value={p.location} />
              <Info icon={Users} label="مدير المشروع" value={p.manager} />
              <Info icon={Calendar} label="تاريخ البدء" value={p.startDate} />
              <Info icon={Calendar} label="تاريخ التسليم" value={p.dueDate} />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">مسار الموافقة</h3>
            <ApprovalStepper />
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <Card className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(fileCategoryLabel) as (keyof typeof fileCategoryLabel)[]).map((k) => (
                  <Badge key={k} variant="secondary" className="cursor-pointer">{fileCategoryLabel[k]}</Badge>
                ))}
              </div>
              <Button><Upload className="ms-1 h-4 w-4" /> رفع ملف</Button>
            </div>

            <div className="mb-6 grid place-items-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="mt-3 font-semibold">اسحب وأفلت الملفات هنا أو انقر للاستعراض</div>
              <div className="text-xs text-muted-foreground">يدعم: RVT, IFC, DWG, PDF, JPG, PNG حتى 500MB</div>
              <Button variant="outline" className="mt-3">اختر ملفات</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-right text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">الملف</th>
                    <th className="px-4 py-3 font-medium">التصنيف</th>
                    <th className="px-4 py-3 font-medium">الإصدار</th>
                    <th className="px-4 py-3 font-medium">الحجم</th>
                    <th className="px-4 py-3 font-medium">رفعه</th>
                    <th className="px-4 py-3 font-medium">الحالة</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => {
                    const Icon = fileIcons[f.category];
                    return (
                      <tr key={f.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><span className="font-medium">{f.name}</span></div></td>
                        <td className="px-4 py-3 text-muted-foreground">{fileCategoryLabel[f.category]}</td>
                        <td className="px-4 py-3"><Badge variant="outline">{f.version}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{f.size}</td>
                        <td className="px-4 py-3 text-muted-foreground"><div>{f.uploadedBy}</div><div className="text-xs">{f.uploadedAt}</div></td>
                        <td className="px-4 py-3"><StatusBadge tone={fileStatusTone[f.status]}>{fileStatusLabel[f.status]}</StatusBadge></td>
                        <td className="px-4 py-3"><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">سجل الإصدارات — Architecture_Model.rvt</h3>
            <ol className="relative space-y-5 border-r-2 border-dashed border-border pr-5">
              {[
                { v: "v4.2", who: "م. سارة الحربي", when: "اليوم 11:24", note: "تحديث الواجهات الزجاجية + إصلاح تعارضات MEP", tag: "current" },
                { v: "v4.1", who: "م. سارة الحربي", when: "أمس", note: "إضافة تفاصيل التشطيبات", tag: "previous" },
                { v: "v4.0", who: "م. خالد الفهد", when: "قبل أسبوع", note: "اعتماد جهة الإشراف", tag: "approved" },
                { v: "v3.5", who: "م. سارة الحربي", when: "قبل أسبوعين", note: "تعديلات على الطابق الأرضي", tag: "old" },
              ].map((r) => (
                <li key={r.v} className="relative">
                  <span className={`absolute -right-[27px] top-1 h-4 w-4 rounded-full border-2 border-background ${r.tag === "current" ? "bg-primary" : r.tag === "approved" ? "bg-success" : "bg-muted-foreground"}`} />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{r.v}</Badge>
                    {r.tag === "current" && <Badge className="bg-primary/15 text-primary border-primary/30" variant="outline">الإصدار الحالي</Badge>}
                    {r.tag === "approved" && <Badge className="bg-success/15 text-success border-success/30" variant="outline">معتمد</Badge>}
                    <span className="text-sm text-muted-foreground">{r.who} • {r.when}</span>
                  </div>
                  <p className="mt-1 text-sm">{r.note}</p>
                  <div className="mt-2 flex gap-2"><Button size="sm" variant="outline"><Download className="ms-1 h-3.5 w-3.5" /> تنزيل</Button><Button size="sm" variant="ghost">مقارنة</Button></div>
                </li>
              ))}
            </ol>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2"><h3 className="mb-4 font-semibold">مسار الموافقة الجماعية</h3><ApprovalStepper expanded /></Card>
          <Card className="p-6">
            <h3 className="mb-3 font-semibold">إضافة تعليق</h3>
            <Textarea placeholder="اكتب تعليقك أو ملاحظتك..." rows={5} />
            <div className="mt-3 flex gap-2"><Button className="flex-1"><Send className="ms-1 h-4 w-4" /> إرسال</Button><Button variant="outline">حفظ كمسودة</Button></div>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> نتائج تحليل الذكاء الاصطناعي</h3>
                <p className="text-xs text-muted-foreground">مقارنة الصور الميدانية مع التصميم المعتمد</p>
              </div>
              <Button asChild variant="outline"><Link to="/field-analysis">المركز الكامل</Link></Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {fieldImages.map((img) => (
                <div key={img.id} className="overflow-hidden rounded-lg border border-border">
                  <div className="relative aspect-video bg-gradient-to-br from-muted to-accent">
                    <div className="absolute inset-0 grid place-items-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
                  </div>
                  <div className="p-3">
                    <div className="truncate text-sm font-semibold">{img.title}</div>
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-muted-foreground">انحرافات</span>
                      <span className={img.deviations > 0 ? "text-destructive font-semibold" : "text-success font-semibold"}>{img.deviations}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="mt-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">القضايا والملاحظات</h3><Button>قضية جديدة</Button></div>
            <div className="space-y-3">
              {issues.filter(i => i.project === p.name).map((i) => (
                <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-border p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{i.code}</Badge>
                      <span className="font-medium">{i.title}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">المسؤول: {i.assignee} • {i.createdAt}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={i.priority === "critical" || i.priority === "high" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-warning/15 text-warning-foreground border-warning/30"} variant="outline">
                      {i.priority === "critical" ? "حرج" : i.priority === "high" ? "عالي" : i.priority === "medium" ? "متوسط" : "منخفض"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">أعضاء المشروع</h3>
              <div className="flex gap-2">
                <Input placeholder="بريد العضو لإرساله دعوة" className="w-72" />
                <Button>دعوة</Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {p.team.map((m) => (
                <div key={m.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Avatar><AvatarFallback className="bg-primary text-primary-foreground text-xs">{m.name.split(" ").slice(-1)[0].slice(0, 2)}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1"><div className="truncate font-medium">{m.name}</div><div className="text-xs text-muted-foreground">{m.role}</div></div>
                  <Button size="sm" variant="ghost"><MessageSquare className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">سجل النشاط</h3>
            <ol className="relative space-y-4 border-r border-dashed border-border pr-4">
              {activity.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -right-[21px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                  <div className="text-sm"><span className="font-medium">{a.user}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.target}</span></div>
                  <div className="text-[11px] text-muted-foreground">{a.time}</div>
                </li>
              ))}
            </ol>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-medium">{value}</div></div>
    </div>
  );
}

function ApprovalStepper({ expanded = false }: { expanded?: boolean }) {
  return (
    <ol className="space-y-3">
      {approvals.map((a, i) => {
        const Icon = a.status === "approved" ? CheckCircle2 : a.status === "rejected" ? XCircle : Clock;
        const tone = a.status === "approved" ? "text-success bg-success/10 border-success/30" :
                     a.status === "rejected" ? "text-destructive bg-destructive/10 border-destructive/30" :
                     a.status === "pending" ? "text-warning bg-warning/10 border-warning/30" :
                     "text-muted-foreground bg-muted border-border";
        return (
          <li key={i} className={`flex gap-3 rounded-lg border p-3 ${tone}`}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{a.step}</div>
              <div className="text-xs opacity-80">{a.role} — {a.user}</div>
              {expanded && a.comment && <div className="mt-2 rounded-md bg-background/60 p-2 text-xs text-foreground">{a.comment}</div>}
              {a.date && <div className="mt-1 text-[11px] opacity-70">{a.date}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
