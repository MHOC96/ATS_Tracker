"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCandidate } from "@/lib/candidates/actions";
import { applicationStatusSchema } from "@/packages/shared/schemas";
import type { z } from "zod";

type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CandidateEditFormProps = {
  applicationId: string;
  initialFullName: string;
  initialEmail: string | null;
  initialPhone: string | null;
  initialLocation: string | null;
  initialStatus: string;
  canEdit: boolean;
};

const statusOptions = applicationStatusSchema.options.map((value) => ({
  value,
  label: value.replace(/_/g, " "),
}));

export function CandidateEditForm({
  applicationId,
  initialFullName,
  initialEmail,
  initialPhone,
  initialLocation,
  initialStatus,
  canEdit,
}: CandidateEditFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [location, setLocation] = useState(initialLocation ?? "");
  const [status, setStatus] = useState<ApplicationStatus>(
    initialStatus as ApplicationStatus
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!canEdit) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await updateCandidate({
      applicationId,
      fullName,
      email,
      phone,
      location,
      status,
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit candidate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Application status</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                if (value) setStatus(value as ApplicationStatus);
              }}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
