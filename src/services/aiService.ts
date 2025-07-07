
import { Preferences } from '@/contexts/AppContext';

// Mock AI service - replace with actual AI integration
export const analyzeJobListings = async (
  jobListings: string,
  preferences: Preferences
): Promise<string> => {
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simple mock filtering logic
  const lines = jobListings.split('\n').filter(line => line.trim());
  
  // Detect if input contains job titles or descriptions
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  const isJobTitles = avgLineLength < 100; // Heuristic: shorter lines are likely titles
  
  const filteredLines = lines.filter(line => {
    const lowerLine = line.toLowerCase();
    
    // Check if line contains any excluded terms
    const hasExclusion = preferences.notInterested.some(term => 
      lowerLine.includes(term.toLowerCase())
    );
    
    if (hasExclusion) return false;
    
    // Check if line contains any interested terms (only if interests are defined)
    if (preferences.interested.length > 0) {
      const hasInterest = preferences.interested.some(term => 
        lowerLine.includes(term.toLowerCase())
      );
      return hasInterest;
    }
    
    return true;
  });
  
  if (filteredLines.length === 0) {
    return "No job listings match your preferences. Try adjusting your criteria.";
  }
  
  const resultPrefix = isJobTitles 
    ? "Filtered Job Titles:\n\n" 
    : "Filtered Job Descriptions:\n\n";
    
  return resultPrefix + filteredLines.join('\n\n');
};

// TODO: Replace with actual AI service integration
// Example integration points:
// - OpenAI GPT API
// - Anthropic Claude API
// - Google Gemini API
// - Custom AI model endpoint
