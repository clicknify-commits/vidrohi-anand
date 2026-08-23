import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getLatestJobs } from "@/lib/jobs/indianapi";
import { Reveal } from "./reveal";

export async function JobsWidget() {
  const jobs = await getLatestJobs(5);
  if (!jobs || jobs.length === 0) return null;

  return (
    <Reveal>
      <section className="space-y-3 rounded-md border bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <Briefcase className="size-4 text-brand" />
          <h2 className="font-heading text-base font-bold">नौकरियां</h2>
        </div>
        <div className="divide-y">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group block py-2 first:pt-0"
            >
              <p className="text-sm leading-snug font-medium group-hover:text-brand">{job.jobTitle}</p>
              <p className="truncate text-xs text-muted-foreground">
                {job.company}
                {job.location ? ` · ${job.location}` : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
