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
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchClients } from "@/lib/projects-api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";

type ProjectStatus = Database["public"]["Enums"]["project_status"];

export const Route = createFileRoute("/projects/new")({
  head: () => ({ meta: [{ title: "مشروع جديد — bim.alazab.com" }] }),
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: fetchClients });

  const [form, setForm] = useState({
    name: "",
    code: "",
    client_id: "",
    description: "",
    location: "",
    status: "draft" as ProjectStatus,
    start_date: "",
    due_date: "",
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const code = form.code || `ALZ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: form.name,
        code,
        client_id: form.client_id || null,
        description: form.description || null,
        location: form.location || null,
        status: form.status,
        start_date: form.start_date || null,
        due_date: form.due_date || null,
        manager_id: user.id,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (!error && data) {
      // add creator as owner member
      await supabase.from("project_members").insert({
        project_id: data.id,
        user_id: user.id,
        project_role: "owner",
      });
      await supabase.from("activities").insert({
        project_id: data.id,
        user_id: user.id,
        action_type: "create",
        description: `أنشأ المشروع "${form.name}"`,
      });
    }

    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("تم إنشاء المشروع بنجاح");
    qc.invalidateQueries({ queryKey: ["projects"] });
    navigate({ to: "/projects/$id", params: { id: data!.id } });
  };

  return (
    <AppShell>
      <PageHeader
        title="إنشاء مشروع جديد"
        description="حدد البيانات الأساسية للمشروع"
        actions={<Button variant="ghost" asChild><Link to="/projects"><ArrowRight className="ms-1 h-4 w-4" /> العودة</Link></Button>}
      />

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-semibold"><Building2 className="h-4 w-4 text-primary" /> البيانات الأساسية</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>اسم المشروع *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="مثال: برج العزب التجاري" required />
              </div>
              <div>
                <Label>كود المشروع</Label>
                <Input value={form.code} onChange={(e) => update("code", e.target.value)} placeholder="ALZ-2026-XXX (تلقائي إن تُرك فارغًا)" />
              </div>
              <div>
                <Label>العميل</Label>
                <Select value={form.client_id} onValueChange={(v) => update("client_id", v)}>
                  <SelectTrigger><SelectValue placeholder="اختر عميلاً..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>الوصف</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="وصف موجز للنطاق والأهداف..." />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> الموقع والحالة</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>الموقع</Label>
                <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="الرياض - حي الملقا" />
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v as ProjectStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="in_review">قيد المراجعة</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="approved">معتمد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-semibold"><Calendar className="h-4 w-4 text-primary" /> الجدول الزمني</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>تاريخ البدء</Label><Input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} /></div>
              <div><Label>تاريخ التسليم</Label><Input type="date" value={form.due_date} onChange={(e) => update("due_date", e.target.value)} /></div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-semibold"><Users className="h-4 w-4 text-primary" /> ملاحظة</div>
            <p className="text-sm text-muted-foreground">
              ستُضاف تلقائيًا كمالك للمشروع. يمكنك إضافة باقي الأعضاء من صفحة "الأعضاء والصلاحيات" بعد الإنشاء.
            </p>
          </Card>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" asChild><Link to="/projects">إلغاء</Link></Button>
            <Button type="submit" className="flex-1" disabled={busy}>{busy ? "جاري الإنشاء..." : "إنشاء المشروع"}</Button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
