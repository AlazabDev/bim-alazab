import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ArchiveExplorer } from "@/components/archive-explorer";
import { FolderTree } from "lucide-react";

export const Route = createFileRoute("/archive")({
  head: () => ({ meta: [
    { title: "الأرشيف — bim.alazab.com" },
    { name: "description", content: "أرشيف موحّد بمنهجية BIM لكل مشاريع العزب: مرحلة → تخصص → نوع → إصدار." },
  ] }),
  component: ArchivePage,
});

function ArchivePage() {
  return (
    <AppShell>
      <PageHeader
        title="الأرشيف الموحّد"
        description="مركز واحد لكل السجلات — الملفات، الاعتمادات، RFI، المعتمدات، القضايا، الأدلة الفنية، وتحليلات الذكاء الاصطناعي. مرتَّب على منهج BIM: المشروع ← المرحلة ← التخصص ← النوع ← الإصدار."
      />
      <div className="mt-4">
        <ArchiveExplorer />
      </div>
    </AppShell>
  );
}
