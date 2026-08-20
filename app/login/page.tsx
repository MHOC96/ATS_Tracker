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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-3 py-8 sm:px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-mono text-xl font-normal">
            ATS Admin
          </CardTitle>
          <CardDescription>
            Sign in to manage jobs, candidates, and recruitment workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
