import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"] & {
  clients: { name: string } | null;
};
export type ProjectStatus = Database["public"]["Enums"]["project_status"];

export const statusMeta: Record<ProjectStatus, { label: string; tone: string }> = {
  draft:       { label: "مسودة",        tone: "bg-muted text-muted-foreground border-border" },
  in_review:   { label: "قيد المراجعة",  tone: "bg-warning/15 text-warning border-warning/30" },
  in_progress: { label: "قيد التنفيذ",   tone: "bg-primary/15 text-primary border-primary/30" },
  approved:    { label: "معتمد",        tone: "bg-success/15 text-success border-success/30" },
  completed:   { label: "مكتمل",        tone: "bg-success/15 text-success border-success/30" },
  rejected:    { label: "مرفوض",        tone: "bg-destructive/15 text-destructive border-destructive/30" },
};

export async function fetchProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function fetchProject(id: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(name, contact_email, location)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, location")
    .order("name");
  if (error) throw error;
  return data ?? [];
}
