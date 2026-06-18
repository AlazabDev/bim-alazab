import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Building2, Lock } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "إعادة تعيين كلمة المرور — bim.alazab.com" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("تم تحديث كلمة المرور");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6" dir="rtl">
      <Card className="w-full max-w-md p-8 shadow-elevated">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><Building2 className="h-6 w-6" /></div>
          <h1 className="text-2xl font-bold">إعادة تعيين كلمة المرور</h1>
          <p className="mt-1 text-sm text-muted-foreground">أدخل كلمة مرور جديدة لحسابك</p>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-9" required minLength={6} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "جاري الحفظ..." : "حفظ كلمة المرور"}</Button>
        </form>
      </Card>
    </div>
  );
}
