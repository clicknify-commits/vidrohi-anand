export interface JobListing {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  experience: string;
  applyLink: string;
  postedDate: string;
}

interface RawJob {
  id: number;
  job_title?: string;
  title?: string;
  company?: string;
  location?: string;
  experience?: string;
  apply_link?: string;
  posted_date?: string;
}

export async function getLatestJobs(limit = 5): Promise<JobListing[] | null> {
  const key = process.env.INDIAN_JOBS_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://jobs.indianapi.in/jobs", {
      headers: { "x-api-key": key },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RawJob[];
    if (!Array.isArray(data)) return null;

    return data.slice(0, limit).map((job) => ({
      id: job.id,
      jobTitle: job.job_title || job.title || "",
      company: job.company ?? "",
      location: job.location ?? "",
      experience: job.experience ?? "",
      applyLink: job.apply_link ?? "",
      postedDate: job.posted_date ?? "",
    }));
  } catch {
    return null;
  }
}
