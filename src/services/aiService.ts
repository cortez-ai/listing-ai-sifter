import { Preferences } from "@/contexts/AppContext";

export const analyzeJobListings = async (
  jobListings: string,
  preferences: Preferences
): Promise<string> => {
  // Get the API key fresh each time the function is called
  const OPENAI_API_KEY = localStorage.getItem("openai_api_key");

  if (!OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key not found. Please add your API key in the preferences."
    );
  }

  const interestsText =
    preferences.interested.length > 0
      ? preferences.interested.join(", ")
      : "No specific interests defined";

  const dislikesText =
    preferences.notInterested.length > 0
      ? preferences.notInterested.join(", ")
      : "No specific dislikes defined";

  const prompt = `You are a job filtering assistant. I will provide you with job listings and my preferences.

MY INTERESTS: ${interestsText}
MY DISLIKES (BLACKLIST - EXCLUDE THESE): ${dislikesText}

IMPORTANT FILTERING RULES:
- Only include jobs that match my interests
- EXCLUDE any job that contains elements from my dislikes list, even if it partially matches my interests
- The dislikes list is a BLACKLIST - any job mentioning these should be completely filtered out
- Count the total jobs received, jobs kept, and jobs filtered out

RESPONSE FORMAT:
First, provide these statistics:
- Jobs received: [number]
- Jobs kept: [number] 
- Jobs filtered out: [number]

Then, determine if the input contains JOB TITLES or JOB DESCRIPTIONS:

If these are JOB TITLES:
1. Filter the titles keeping only those that match my interests and avoid my dislikes
2. Return only the filtered titles in a bullet list
3. Start with "List of Titles Detected:" and then list the matching titles

If these are JOB DESCRIPTIONS:
1. Filter the descriptions keeping only those that match my interests and avoid my dislikes
2. For each relevant description, provide a title, with a line break after it.
3. Add a brief summary (2-3 sentences)
3. Add 1-2 bullet points explaining why it's a good match for me
4. Add a link to the job listing. If you find more than one url for a listing, add 3 at most.
4. Start with "List of Descriptions Detected:" followed by the summaries

Then, at the end of the response, include a short summary explaining why some jobs where filtered out. Do not mention a
reason if it was not actually used to fiter out a position. Choose 1-2 positions that where filtered out to give as example.

If you're unsure if it's titles or descriptions, make your best guess based on the length and content.

Here are the job listings to analyze:
${jobListings}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // suggestions: gpt-4o-mini gpt-4o o3 gpt-4.1
        model: "gpt-4.1",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response from AI service.";
  } catch (error) {
    console.error("AI analysis failed:", error);
    throw new Error(
      `Failed to analyze job listings: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Function to set API key
export const setOpenAIApiKey = (apiKey: string) => {
  localStorage.setItem("openai_api_key", apiKey);
};

// Function to check if API key exists
export const hasOpenAIApiKey = (): boolean => {
  return !!localStorage.getItem("openai_api_key");
};

// Function to get API key
export const getOpenAIApiKey = (): string | null => {
  return localStorage.getItem("openai_api_key");
};
