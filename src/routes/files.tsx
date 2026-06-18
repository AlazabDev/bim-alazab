import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Search, FileText, Box, Image as ImageIcon, FileBarChart, Folder } from "lucide-react";
import { files, fileCategoryLabel, projects } from "@/lib/mock-data";

export const Route = createFileRoute("/files")({
  head: () => ({ meta: [{ title: "الملفات والمستندات — bim.alazab.com" }] }),
  component: FilesPage,
});

const icons = { bim: Box, drawings: FileText, site_photos: ImageIcon, reports: FileBarChart, documents: Folder } as const;
const tone = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-warning/15 text-warning-foreground border border-warning/30",
  approved: "bg-success/15 text-success border border-success/30",
  rejected: "bg-destructive/15 text-destructive border border-destructive/30",
} as const;
const label = { draft: "مسودة", in_review: "قيد المراجعة", approved: "معتمد", rejected: "مرفوض" } as const;

function FilesPage() {
  return (
    <AppShell>
      <PageHeader
        title="مكتبة الملفات والمستندات"
        description="جميع ملفات BIM والمخططات والتقارير عبر مشاريعك"
        actions={<Button><Upload className="ms-1 h-4 w-4" /> رفع ملفات</Button>}
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="بحث باسم الملف..." className="pr-9" />
          </div>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">الكل</TabsTrigger>
              {(Object.keys(fileCategoryLabel) as (keyof typeof fileCategoryLabel)[]).map((k) => (
                <TabsTrigger key={k} value={k}>{fileCategoryLabel[k]}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-right text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">الملف</th>
                <th className="px-4 py-3 font-medium">المشروع</th>
                <th className="px-4 py-3 font-medium">التصنيف</th>
                <th className="px-4 py-3 font-medium">الإصدار</th>
                <th className="px-4 py-3 font-medium">الحجم</th>
                <th className="px-4 py-3 font-medium">رفعه</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {files.map((f, idx) => {
                const Icon = icons[f.category];
                const project = projects[idx % projects.length];
                return (
                  <tr key={f.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><span className="font-medium">{f.name}</span></div></td>
                    <td className="px-4 py-3"><Link to="/projects/$id" params={{ id: project.id }} className="text-primary hover:underline">{project.name}</Link></td>
                    <td className="px-4 py-3 text-muted-foreground">{fileCategoryLabel[f.category]}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{f.version}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{f.size}</td>
                    <td className="px-4 py-3 text-muted-foreground"><div>{f.uploadedBy}</div><div className="text-xs">{f.uploadedAt}</div></td>
                    <td className="px-4 py-3"><StatusBadge tone={tone[f.status]}>{label[f.status]}</StatusBadge></td>
                    <td className="px-4 py-3"><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
