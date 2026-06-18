import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle2, AlertTriangle, Info, Mail } from "lucide-react";
import { notifications, type Notification } from "@/lib/mock-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "الإشعارات — bim.alazab.com" }] }),
  component: NotificationsPage,
});

const typeMeta: Record<Notification["type"], { icon: any; tone: string }> = {
  info: { icon: Info, tone: "text-info bg-info/10" },
  success: { icon: CheckCircle2, tone: "text-success bg-success/10" },
  warning: { icon: AlertTriangle, tone: "text-warning bg-warning/10" },
  danger: { icon: AlertTriangle, tone: "text-destructive bg-destructive/10" },
};

function NotificationsPage() {
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <AppShell>
      <PageHeader
        title="مركز التنبيهات"
        description={`${unread} إشعار غير مقروء`}
        actions={<><Button variant="outline"><Mail className="ms-1 h-4 w-4" /> إعدادات البريد</Button><Button variant="outline">تعليم الكل كمقروء</Button></>}
      />
      <Tabs defaultValue="all" className="mb-4">
        <TabsList>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="unread">غير مقروء <Badge variant="secondary" className="ms-2">{unread}</Badge></TabsTrigger>
          <TabsTrigger value="files">الملفات</TabsTrigger>
          <TabsTrigger value="approvals">الموافقات</TabsTrigger>
          <TabsTrigger value="ai">تنبيهات AI</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card>
        <ul className="divide-y divide-border">
          {notifications.map((n) => {
            const m = typeMeta[n.type];
            const Icon = m.icon;
            return (
              <li key={n.id} className={`flex items-start gap-3 p-4 ${!n.read ? "bg-primary/[0.03]" : ""}`}>
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${m.tone}`}><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{n.title}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <div className="text-sm text-muted-foreground">{n.body}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{n.time}</div>
                </div>
                <Button size="sm" variant="ghost">عرض</Button>
              </li>
            );
          })}
        </ul>
      </Card>
    </AppShell>
  );
}
