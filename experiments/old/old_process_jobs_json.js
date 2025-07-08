import fs from "fs";
import path from "path";

const filterJobData = (inputFilename) => {
  const fieldsToKeep = [
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

  try {
    // Read the input file
    const inputPath = path.join(process.cwd(), inputFilename);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`File not found: ${inputFilename}`);
    }

    console.log(`Reading data from: ${inputFilename}`);
    const rawData = fs.readFileSync(inputPath, "utf8");
    const jobData = JSON.parse(rawData);

    // Check if the file has the expected structure
    if (!jobData.jobs || !Array.isArray(jobData.jobs)) {
      throw new Error("Invalid file format: expected jobs array not found");
    }

    console.log(`Processing ${jobData.jobs.length} jobs...`);

    // Filter each job to only include specified fields
    const filteredJobs = jobData.jobs.map((job) => {
      const filteredJob = {};

      fieldsToKeep.forEach((field) => {
        if (job.hasOwnProperty(field)) {
          filteredJob[field] = job[field];
        } else {
          filteredJob[field] = null; // Set to null if field doesn't exist
        }
      });

      return filteredJob;
    });

    // Create filtered result with updated metadata
    const filteredResult = {
      search_metadata: {
        ...jobData.search_metadata,
        filtered_date: new Date().toISOString(),
        filtered_fields: fieldsToKeep,
        total_filtered_jobs: filteredJobs.length,
      },
      jobs: filteredJobs,
    };

    // Generate output filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFilename = `filtered_jobs_${timestamp}.json`;
    const outputPath = path.join(process.cwd(), outputFilename);

    // Save filtered data
    fs.writeFileSync(
      outputPath,
      JSON.stringify(filteredResult, null, 2),
      "utf8"
    );

    console.log(`\nFiltered data saved to: ${outputFilename}`);
    console.log(`Full path: ${outputPath}`);

    // Display summary
    console.log("\n--- Filtering Summary ---");
    console.log(`Original jobs: ${jobData.jobs.length}`);
    console.log(`Filtered jobs: ${filteredJobs.length}`);
    console.log(`Fields kept: ${fieldsToKeep.length}`);

    console.log("\n--- Fields included ---");
    fieldsToKeep.forEach((field, index) => {
      console.log(`${index + 1}. ${field}`);
    });

    // Show sample of first job to verify filtering
    if (filteredJobs.length > 0) {
      console.log("\n--- Sample filtered job (first result) ---");
      console.log(JSON.stringify(filteredJobs[0], null, 2));
    }

    return filteredResult;
  } catch (error) {
    console.error("Error filtering job data:", error.message);

    // Save error to file
    const errorResult = {
      error: true,
      timestamp: new Date().toISOString(),
      message: error.message,
      input_file: inputFilename,
    };

    const errorFilename = `filter_error_${new Date()
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

// Function to find the most recent job search file automatically
const findLatestJobFile = () => {
  const files = fs.readdirSync(process.cwd());
  const jobFiles = files.filter(
    (file) => file.startsWith("jobs_") && file.endsWith(".json")
  );

  if (jobFiles.length === 0) {
    return null;
  }

  // Sort by filename (which includes timestamp) to get the latest
  jobFiles.sort().reverse();
  return jobFiles[0];
};

// Main execution
const main = () => {
  // Get filename from command line argument or find latest file
  const inputFilename = process.argv[2];

  if (inputFilename) {
    console.log(`Using specified file: ${inputFilename}`);
    filterJobData(inputFilename);
  } else {
    const latestFile = findLatestJobFile();
    if (latestFile) {
      console.log(`No file specified, using latest found: ${latestFile}`);
      filterJobData(latestFile);
    } else {
      console.error(
        "No job data file found. Please run the job search script first or specify a filename."
      );
      console.log("\nUsage:");
      console.log(
        "  node filter-jobs.js                           # Uses latest job file automatically"
      );
      console.log(
        "  node filter-jobs.js your-job-file.json       # Uses specified file"
      );
    }
  }
};

// Run the script
main();
