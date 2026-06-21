import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Download, FileText, Box, Image as ImageIcon, FileBarChart, Folder, User2, Calendar, HardDrive } from "lucide-react";
import { files, fileCategoryLabel } from "@/lib/mock-data";

const fileIcons = { bim: Box, drawings: FileText, site_photos: ImageIcon, reports: FileBarChart, documents: Folder } as const;
const statusTone = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-warning/15 text-warning-foreground border border-warning/30",
  approved: "bg-success/15 text-success border border-success/30",
  rejected: "bg-destructive/15 text-destructive border border-destructive/30",
} as const;
const statusLabel = { draft: "مسودة", in_review: "قيد المراجعة", approved: "معتمد", rejected: "مرفوض" } as const;

export const Route = createFileRoute("/files/$id")({
  head: ({ params }) => ({ meta: [{ title: `ملف ${params.id} — bim.alazab.com` }] }),
  component: FileDetail,
  notFoundComponent: () => (
    <AppShell><PageHeader title="غير موجود" description="الملف المطلوب غير موجود." actions={<Button asChild variant="outline"><Link to="/files"><ArrowRight className="ms-1 h-4 w-4" /> الملفات</Link></Button>} /></AppShell>
  ),
});

function FileDetail() {
  const { id } = Route.useParams();
  const f = files.find((x) => x.id === id);
  if (!f) throw notFound();
  const Icon = fileIcons[f.category];
  return (
    <AppShell>
      <PageHeader
        title={f.name}
        description={`${fileCategoryLabel[f.category]} • الإصدار ${f.version}`}
        badge={<StatusBadge tone={statusTone[f.status]}>{statusLabel[f.status]}</StatusBadge>}
        actions={
          <>
            <Button asChild variant="outline"><Link to="/files"><ArrowRight className="ms-1 h-4 w-4" /> العودة</Link></Button>
            <Button><Download className="ms-1 h-4 w-4" /> تنزيل</Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="grid place-items-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12">
            <Icon className="h-16 w-16 text-primary/60" />
            <div className="mt-3 text-sm font-semibold">{f.name}</div>
            <div className="text-xs text-muted-foreground">{f.size}</div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info icon={User2} label="رفعه" value={f.uploadedBy} />
            <Info icon={Calendar} label="تاريخ الرفع" value={f.uploadedAt} />
            <Info icon={HardDrive} label="الحجم" value={f.size} />
            <Info icon={FileText} label="الإصدار" value={f.version} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">سجل الإصدارات</h3>
          <ol className="space-y-3 text-sm">
            {[f.version, "v" + (Number.parseFloat(f.version.replace("v", "")) - 0.1).toFixed(1), "v1.0"].map((v, i) => (
              <li key={v + i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <Badge variant={i === 0 ? "default" : "outline"}>{v}</Badge>
                <span className="text-xs text-muted-foreground">{i === 0 ? "الحالي" : i === 1 ? "السابق" : "أصلي"}</span>
                <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
              </li>
            ))}
          </ol>
        </Card>
      </div>
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
