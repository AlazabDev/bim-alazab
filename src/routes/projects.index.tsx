import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Grid3x3, List as ListIcon, MapPin, Calendar, FileStack, Loader2, FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects, statusMeta, type ProjectStatus } from "@/lib/projects-api";

export const Route = createFileRoute("/projects/")({
  head: () => ({ meta: [{ title: "المشاريع — bim.alazab.com" }] }),
  component: ProjectsList,
});

function ProjectsList() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (q && !`${p.name} ${p.code} ${p.clients?.name ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [projects, q, statusFilter]);

  const inProgress = projects.filter((p) => p.status === "in_progress").length;

  return (
    <AppShell>
      <PageHeader
        title="المشاريع"
        description={`${projects.length} مشروع — ${inProgress} قيد التنفيذ`}
        actions={<Button asChild><Link to="/projects/new"><Plus className="ms-1 h-4 w-4" /> مشروع جديد</Link></Button>}
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث باسم المشروع أو الكود أو العميل..." className="pr-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="in_review">قيد المراجعة</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              <SelectItem value="approved">معتمد</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="grid"><Grid3x3 className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="list"><ListIcon className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid h-60 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="grid place-items-center gap-3 p-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-muted"><FolderOpen className="h-7 w-7 text-muted-foreground" /></div>
          <div>
            <h3 className="font-semibold">لا توجد مشاريع</h3>
            <p className="text-sm text-muted-foreground">ابدأ بإنشاء أول مشروع لك.</p>
          </div>
          <Button asChild><Link to="/projects/new"><Plus className="ms-1 h-4 w-4" /> مشروع جديد</Link></Button>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const meta = statusMeta[p.status];
            return (
              <Link key={p.id} to="/projects/$id" params={{ id: p.id }}>
                <Card className="overflow-hidden p-0 transition hover:shadow-elevated">
                  <div className="relative h-32 bg-gradient-primary p-4">
                    <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                    <div className="absolute bottom-3 right-4 left-4 text-primary-foreground">
                      <div className="text-xs opacity-80">{p.code}</div>
                      <div className="truncate text-lg font-bold">{p.name}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {p.location ?? "—"}</div>
                      <div className="flex items-center gap-1.5"><FileStack className="h-3.5 w-3.5" /> {p.clients?.name ?? "بدون عميل"}</div>
                      <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {p.due_date ?? "—"}</div>
                    </div>
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs"><span>الإنجاز</span><span className="font-semibold">{p.progress}%</span></div>
                      <Progress value={p.progress} className="h-1.5" />
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                      <span className="text-muted-foreground">المطابقة</span>
                      <span className="text-success font-semibold">{p.conformity}%</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-right text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">المشروع</th>
                  <th className="px-4 py-3 font-medium">العميل</th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                  <th className="px-4 py-3 font-medium">الإنجاز</th>
                  <th className="px-4 py-3 font-medium">المطابقة</th>
                  <th className="px-4 py-3 font-medium">التسليم</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const meta = statusMeta[p.status];
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3"><Link to="/projects/$id" params={{ id: p.id }} className="font-medium hover:text-primary">{p.name}</Link><div className="text-xs text-muted-foreground">{p.code}</div></td>
                      <td className="px-4 py-3">{p.clients?.name ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge tone={meta.tone}>{meta.label}</StatusBadge></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><Progress value={p.progress} className="h-1.5 w-24" /><span className="text-xs">{p.progress}%</span></div></td>
                      <td className="px-4 py-3 text-success font-semibold">{p.conformity}%</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.due_date ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
