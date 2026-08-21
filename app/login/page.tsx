import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-[20px]">ATS Admin</CardTitle>
          <CardDescription>
            Sign in to manage jobs, candidates, and recruitment workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-[13px] text-fog">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
      <p className="mt-6 linear-mono text-[11px] text-fog/80">
        © {new Date().getFullYear()} mhoc
      </p>
    </div>
  );
}
