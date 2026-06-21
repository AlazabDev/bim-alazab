import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { IssueDetail } from "./issues.$id";

export const Route = createFileRoute("/rfis/$id")({
  head: ({ params }) => ({ meta: [{ title: `RFI ${params.id} — bim.alazab.com` }] }),
  component: () => {
    const { id } = Route.useParams();
    return <IssueDetail id={id} kind="rfi" />;
  },
  notFoundComponent: () => (
    <AppShell><PageHeader title="غير موجود" description="الـ RFI المطلوب غير موجود." actions={<Button asChild variant="outline"><Link to="/rfis"><ArrowRight className="ms-1 h-4 w-4" /> RFIs</Link></Button>} /></AppShell>
  ),
});
