import fs from "fs";
import path from "path";

const FILE_SAVE_PATH = "./results";

// Configuration
const FIELDS_TO_KEEP = [
  "title",
  "organization",
  "employment_type",
  "url",
  "external_apply_url",
  "countries_derived",
  "locations_derived",
  "linkedin_org_slogan",
  "linkedin_org_description",
  "seniority",
  "description_text",
];

// Pure function to search jobs - only fetches data
const searchJobs = async () => {
  const baseUrl =
    "https://linkedin-job-search-api.p.rapidapi.com/active-jb-24h";

  const params = new URLSearchParams({
    offset: "0",
    limit: "20",
    title_filter:
      "full stack developer OR fullstack developer OR full-stack developer",
    location_filter: "European Union OR Netherlands OR Europe OR Portugal",
    description_type: "text",
    order: "desc",
  });

  const url = `${baseUrl}?${params.toString()}`;

  const headers = {
    "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
    "x-rapidapi-host": "linkedin-job-search-api.p.rapidapi.com",
  };

  console.log("Searching for full stack development jobs in EU/Netherlands...");

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} - ${response.statusText}`
    );
  }

  const jobs = await response.json();
  console.log(`Found ${jobs.length} jobs`);

  return jobs;
};

// Function to filter job data to only include specified fields
const filterJobs = (jobs, fieldsToKeep = FIELDS_TO_KEEP) => {
  return jobs.map((job) => {
    const filteredJob = {};
    fieldsToKeep.forEach((field) => {
      filteredJob[field] = job.hasOwnProperty(field) ? job[field] : null;
    });
    return filteredJob;
  });
};

// Function to save job data to disk (both full and filtered versions)
const saveJobData = (jobs, searchMetadata = null) => {
  try {
    // Ensure results directory exists
    if (!fs.existsSync(FILE_SAVE_PATH)) {
      fs.mkdirSync(FILE_SAVE_PATH, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Create metadata for the search
    const metadata = searchMetadata || {
      query: "Full Stack Developer jobs in EU/Netherlands",
      search_date: new Date().toISOString(),
      total_results: jobs.length,
      filters: {
        title:
          "full stack developer OR fullstack developer OR full-stack developer",
        location: "European Union OR Netherlands OR Europe",
        limit: 20,
      },
    };

    // Full data structure
    const fullResult = {
      search_metadata: metadata,
      jobs: jobs,
    };

    // Filtered data structure
    const filteredJobs = filterJobs(jobs);
    const filteredResult = {
      search_metadata: {
        ...metadata,
        filtered_date: new Date().toISOString(),
        filtered_fields: FIELDS_TO_KEEP,
        total_filtered_jobs: filteredJobs.length,
      },
      jobs: filteredJobs,
    };

    // Save full data
    const fullFilename = `jobs_full_data_${timestamp}.json`;
    const fullFilepath = path.join(process.cwd(), FILE_SAVE_PATH, fullFilename);
    fs.writeFileSync(fullFilepath, JSON.stringify(fullResult, null, 2), "utf8");

    // Save filtered data
    const filteredFilename = `jobs_filtered_data_${timestamp}.json`;
    const filteredFilepath = path.join(
      process.cwd(),
      FILE_SAVE_PATH,
      filteredFilename
    );
    fs.writeFileSync(
      filteredFilepath,
      JSON.stringify(filteredResult, null, 2),
      "utf8"
    );

    console.log(`\nResults saved:`);
    console.log(`Full data: ${fullFilename}`);
    console.log(`Filtered data: ${filteredFilename}`);
    console.log(`Save location: ${FILE_SAVE_PATH}`);

    return {
      fullData: fullResult,
      filteredData: filteredResult,
      files: {
        full: fullFilepath,
        filtered: filteredFilepath,
      },
    };
  } catch (error) {
    console.error("Error saving job data:", error.message);

    // Save error to file
    const errorResult = {
      error: true,
      timestamp: new Date().toISOString(),
      message: error.message,
      details: error.stack || "No additional details",
    };

    const errorFilename = `job_save_error_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;
    const errorPath = path.join(process.cwd(), FILE_SAVE_PATH, errorFilename);
    fs.writeFileSync(errorPath, JSON.stringify(errorResult, null, 2), "utf8");
    console.log(`Error details saved to: ${errorFilename}`);

    throw error;
  }
};

// Function to display job summary in console
const displayJobSummary = (jobs) => {
  console.log("\n--- Job Summary ---");
  jobs.forEach((job, index) => {
    const company = job.organization || job.company || "Unknown Company";
    const location =
      job.locations_derived?.[0] || job.location || "Unknown Location";
    console.log(`${index + 1}. ${job.title} at ${company} (${location})`);
  });
};

// Main execution function
const main = async () => {
  try {
    // Step 1: Search for jobs
    const jobs = await searchJobs();

    // Step 2: Display summary
    displayJobSummary(jobs);

    // Step 3: Save both full and filtered data
    const savedData = saveJobData(jobs);

    console.log("\n--- Processing Complete ---");
    console.log(`Total jobs processed: ${jobs.length}`);
    console.log(`Fields in filtered version: ${FIELDS_TO_KEEP.length}`);

    return savedData;
  } catch (error) {
    console.error("Error in main execution:", error.message);

    // Save error to file
    const errorResult = {
      error: true,
      timestamp: new Date().toISOString(),
      message: error.message,
      stage: "main_execution",
    };

    const errorFilename = `job_search_error_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;
    fs.writeFileSync(
      errorFilename,
      JSON.stringify(errorResult, null, 2),
      "utf8"
    );
    console.log(`Error details saved to: ${errorFilename}`);
  }
};

// Export functions for potential reuse
// export { displayJobSummary, filterJobs, saveJobData, searchJobs };

// Check if this file is being run directly
// const isMainModule =
//   process.argv[1] &&
//   path.resolve(process.argv[1]) ===
//     path.resolve(new URL(import.meta.url).pathname);

// if (isMainModule) {
main();
// }
// console.log("script loaded");
