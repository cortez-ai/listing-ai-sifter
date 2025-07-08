import fs from "fs";
import path from "path";

const FILE_SAVE_PATH = "./results";

const searchJobs = async () => {
  const baseUrl =
    "https://linkedin-job-search-api.p.rapidapi.com/active-jb-24h";

  // Build query parameters
  const params = new URLSearchParams({
    offset: "0",
    limit: "20",
    title_filter:
      "full stack developer OR fullstack developer OR full-stack developer",
    location_filter: "European Union OR Netherlands OR Europe",
    // type_filter: "FULL_TIME",
    description_type: "text",
    order: "desc",
  });

  const url = `${baseUrl}?${params.toString()}`;

  const headers = {
    "x-rapidapi-key": "",
    "x-rapidapi-host": "linkedin-job-search-api.p.rapidapi.com",
  };

  try {
    console.log(
      "Searching for full stack development jobs in EU/Netherlands..."
    );

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

    // Create a structured result object
    const searchResult = {
      search_metadata: {
        query: "Full Stack Developer jobs in EU/Netherlands",
        search_date: new Date().toISOString(),
        total_results: jobs.length,
        filters: {
          title:
            "full stack developer OR fullstack developer OR full-stack developer",
          location: "European Union OR Netherlands OR Europe",
          job_type: "FULL_TIME",
          limit: 20,
        },
      },
      jobs: jobs,
    };

    // Generate filename with timestamp
    if (!fs.existsSync(path.join(process.cwd(), FILE_SAVE_PATH))) {
      fs.mkdirSync(path.join(process.cwd(), FILE_SAVE_PATH), {
        recursive: true,
      });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `jobs_full_data_${timestamp}.json`;
    const filepath = path.join(process.cwd(), FILE_SAVE_PATH, filename);

    // Save to JSON file
    fs.writeFileSync(filepath, JSON.stringify(searchResult, null, 2), "utf8");

    console.log(`\nResults saved to: ${filename}`);
    console.log(`Full path: ${filepath}`);

    // Display summary in console
    console.log("\n--- Job Summary ---");
    jobs.forEach((job, index) => {
      console.log(
        `${index + 1}. ${job.title} at ${job.company} (${job.location})`
      );
    });

    return searchResult;
  } catch (error) {
    console.error("Error fetching jobs:", error.message);

    // Save error to file as well
    const errorResult = {
      error: true,
      timestamp: new Date().toISOString(),
      message: error.message,
      details: error.stack || "No additional details",
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

// Run the search
searchJobs();
