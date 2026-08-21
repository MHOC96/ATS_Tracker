"use client";

import type { UseFormReturn } from "react-hook-form";
import { jobTypeRequiresHiringPeriod } from "@/packages/shared/schemas/job-types";
import {
  JOB_TYPE_OPTIONS,
  type JobFormValues,
} from "@/lib/validation/job-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type JobTypeFieldsProps = {
  form: UseFormReturn<JobFormValues>;
};

export function JobTypeFields({ form }: JobTypeFieldsProps) {
  const jobType = form.watch("jobType");
  const showHiringPeriod = jobTypeRequiresHiringPeriod(jobType);

  return (
    <>
      <div className="space-y-2">
        <Label>Job type</Label>
        <Select
          value={jobType}
          onValueChange={(value) => {
            if (!value) return;
            form.setValue("jobType", value as JobFormValues["jobType"]);
            if (value === "FULL_TIME") {
              form.setValue("hiringPeriodStart", "");
              form.setValue("hiringPeriodEnd", "");
            }
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

      {showHiringPeriod && (
        <>
          <div className="space-y-2">
            <Label htmlFor="hiringPeriodStart">Hiring period start</Label>
            <Input
              id="hiringPeriodStart"
              type="date"
              {...form.register("hiringPeriodStart")}
            />
            {form.formState.errors.hiringPeriodStart && (
              <p className="text-sm text-destructive">
                {form.formState.errors.hiringPeriodStart.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hiringPeriodEnd">Hiring period end</Label>
            <Input
              id="hiringPeriodEnd"
              type="date"
              {...form.register("hiringPeriodEnd")}
            />
            {form.formState.errors.hiringPeriodEnd && (
              <p className="text-sm text-destructive">
                {form.formState.errors.hiringPeriodEnd.message}
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
