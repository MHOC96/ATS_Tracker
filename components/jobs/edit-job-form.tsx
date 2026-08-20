"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { updateJob } from "@/lib/jobs/actions";
import { generateJobDescription } from "@/lib/jobs/generate-actions";
import type { JobEditData } from "@/lib/jobs/queries";
import {
  JOB_TYPE_OPTIONS,
  updateJobSchema,
} from "@/lib/validation/job-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { z } from "zod";

type FormValues = z.infer<typeof updateJobSchema>;

type EditJobFormProps = {
  job: JobEditData;
};

export function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [generatingJd, setGeneratingJd] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(updateJobSchema),
    defaultValues: {
      jobId: job.id,
      title: job.title,
      jobType: job.jobType as FormValues["jobType"],
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      requiredSkillsText: job.requiredSkillsText,
      preferredSkillsText: job.preferredSkillsText,
      scoringName: job.scoringName,
      scoringDescription: job.scoringDescription,
      criteria: job.criteria,
      aiGeneratedJd: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "criteria",
  });

  const weightTotal = useMemo(() => {
    const criteria = form.watch("criteria");
    return criteria
      .filter((c) => c.criteriaType === "WEIGHT")
      .reduce((sum, c) => sum + Number(c.weight || 0), 0);
  }, [form.watch("criteria")]);

  async function onSubmit(values: FormValues) {
    setError(null);
    const result = await updateJob(values);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/admin/jobs/${result.data.jobId}`);
    router.refresh();
  }

  async function onGenerateJd() {
    const title = form.getValues("title").trim();
    if (!title) {
      setError("Enter a job title before generating a description");
      return;
    }

    setGeneratingJd(true);
    setError(null);

    const result = await generateJobDescription({
      title,
      jobType: form.getValues("jobType"),
      requiredSkillsText: form.getValues("requiredSkillsText"),
      preferredSkillsText: form.getValues("preferredSkillsText"),
    });

    if (!result.success) {
      setError(result.error);
      setGeneratingJd(false);
      return;
    }

    form.setValue("description", result.data.description);
    form.setValue("responsibilities", result.data.responsibilities);
    form.setValue("requirements", result.data.requirements);
    form.setValue("requiredSkillsText", result.data.requiredSkills.join(", "));
    form.setValue("preferredSkillsText", result.data.preferredSkills.join(", "));
    form.setValue("aiGeneratedJd", true);
    setGeneratingJd(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Slug <span className="font-mono">{job.slug}</span> stays fixed after publish
        so Drive folders remain linked.
      </p>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <CardTitle className="font-mono text-lg font-normal">Job details</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerateJd}
            disabled={generatingJd}
          >
            <Sparkles className="size-4" />
            {generatingJd ? "Generating…" : "Regenerate with AI"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Job title</Label>
            <Input id="title" {...form.register("title")} />
          </div>

          <div className="space-y-2">
            <Label>Job type</Label>
            <Select
              value={form.watch("jobType")}
              onValueChange={(value) => {
                if (value) form.setValue("jobType", value as FormValues["jobType"]);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...form.register("description")} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="responsibilities">Responsibilities</Label>
            <Textarea id="responsibilities" rows={3} {...form.register("responsibilities")} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea id="requirements" rows={3} {...form.register("requirements")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredSkillsText">Required skills</Label>
            <Input id="requiredSkillsText" {...form.register("requiredSkillsText")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredSkillsText">Preferred skills</Label>
            <Input id="preferredSkillsText" {...form.register("preferredSkillsText")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-mono text-lg font-normal">Scoring model</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Weights must total 100% — current: {weightTotal}%
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                name: "",
                weight: 0,
                criteriaType: "WEIGHT",
                isMandatory: false,
              })
            }
          >
            <Plus className="size-4" />
            Add criterion
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scoringName">Model name</Label>
              <Input id="scoringName" {...form.register("scoringName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scoringDescription">Description</Label>
              <Input id="scoringDescription" {...form.register("scoringDescription")} />
            </div>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-12"
            >
              <div className="space-y-2 sm:col-span-4">
                <Label>Name</Label>
                <Input {...form.register(`criteria.${index}.name`)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Weight %</Label>
                <Input type="number" {...form.register(`criteria.${index}.weight`)} />
              </div>
              <div className="space-y-2 sm:col-span-3">
                <Label>Type</Label>
                <Select
                  value={form.watch(`criteria.${index}.criteriaType`)}
                  onValueChange={(value) =>
                    form.setValue(
                      `criteria.${index}.criteriaType`,
                      value as FormValues["criteria"][number]["criteriaType"]
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEIGHT">Weight</SelectItem>
                    <SelectItem value="MINIMUM">Minimum</SelectItem>
                    <SelectItem value="MANDATORY">Mandatory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end sm:col-span-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
