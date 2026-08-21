"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { createJobDraft, publishJob } from "@/lib/jobs/actions";
import { generateJobDescription } from "@/lib/jobs/generate-actions";
import {
  createJobFormSchema,
} from "@/lib/validation/job-form";
import { JobTypeFields } from "@/components/jobs/job-type-fields";
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

type FormValues = z.infer<typeof createJobFormSchema>;

const defaultCriteria: FormValues["criteria"] = [
  {
    name: "Technical Skills",
    weight: 40,
    criteriaType: "WEIGHT",
    isMandatory: false,
  },
  {
    name: "Experience",
    weight: 30,
    criteriaType: "WEIGHT",
    isMandatory: false,
  },
  {
    name: "Education",
    weight: 20,
    criteriaType: "WEIGHT",
    isMandatory: false,
  },
  {
    name: "Communication",
    weight: 10,
    criteriaType: "WEIGHT",
    isMandatory: false,
  },
];

export function CreateJobForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [generatingJd, setGeneratingJd] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      title: "",
      jobType: "FULL_TIME",
      hiringPeriodStart: "",
      hiringPeriodEnd: "",
      description: "",
      responsibilities: "",
      requirements: "",
      requiredSkillsText: "",
      preferredSkillsText: "",
      scoringName: "Default Scoring Model",
      scoringDescription: "",
      criteria: defaultCriteria,
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

  async function onSaveDraft(values: FormValues) {
    setError(null);
    const result = await createJobDraft(values);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setCreatedJobId(result.data.jobId);
    router.push(`/admin/jobs/${result.data.jobId}`);
    router.refresh();
  }

  async function onPublishDraft() {
    if (!createdJobId) return;
    setError(null);
    const result = await publishJob({ jobId: createdJobId });

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
    form.setValue(
      "requiredSkillsText",
      result.data.requiredSkills.join(", ")
    );
    form.setValue(
      "preferredSkillsText",
      result.data.preferredSkills.join(", ")
    );
    form.setValue("aiGeneratedJd", true);
    setGeneratingJd(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSaveDraft)} className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle>Job details</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
            onClick={onGenerateJd}
            disabled={generatingJd}
          >
            <Sparkles className="size-4" />
            {generatingJd ? "Generating…" : "Generate with AI"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Job title</Label>
            <Input id="title" {...form.register("title")} placeholder="AI Engineer" />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <JobTypeFields form={form} />

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
            <Label htmlFor="requiredSkillsText">Required skills (comma-separated)</Label>
            <Input id="requiredSkillsText" {...form.register("requiredSkillsText")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredSkillsText">Preferred skills (comma-separated)</Label>
            <Input id="preferredSkillsText" {...form.register("preferredSkillsText")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Scoring model</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Weights must total 100% — current: {weightTotal}%
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
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
            <div key={field.id} className="grid gap-3 rounded-md border border-border p-4 md:grid-cols-12">
              <div className="space-y-2 md:col-span-4">
                <Label>Name</Label>
                <Input {...form.register(`criteria.${index}.name`)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Weight %</Label>
                <Input type="number" {...form.register(`criteria.${index}.weight`)} />
              </div>
              <div className="space-y-2 md:col-span-3">
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
              <div className="flex items-end justify-end md:col-span-3">
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

          {form.formState.errors.criteria && (
            <p className="text-sm text-destructive">
              {form.formState.errors.criteria.message ??
                form.formState.errors.criteria.root?.message}
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save draft"}
        </Button>
        {createdJobId && (
          <Button type="button" variant="outline" onClick={onPublishDraft}>
            Publish job
          </Button>
        )}
      </div>
    </form>
  );
}
