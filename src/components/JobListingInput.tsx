import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { hasOpenAIApiKey } from "@/services/aiService";
import { AlertCircle, Loader2, Settings } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PreferencesModal } from "./PreferencesModal";

interface JobListingInputProps {
  onAnalyze: (jobListings: string) => void;
  isAnalyzing: boolean;
}

export const JobListingInput: React.FC<JobListingInputProps> = ({
  onAnalyze,
  isAnalyzing,
}) => {
  const { hasPreferences } = useApp();
  const [jobListings, setJobListings] = useState("");
  const [showPreferences, setShowPreferences] = useState(false);
  const navigate = useNavigate();
  const hasApiKey = hasOpenAIApiKey();

  const handleAnalyze = () => {
    if (jobListings.trim()) {
      onAnalyze(jobListings);
    }
  };

  const canAnalyze =
    jobListings.trim() && hasPreferences && hasApiKey && !isAnalyzing;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with preferences button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Job Listing Filter
          </h1>
          {!hasPreferences && (
            <p className="text-gray-400 text-sm">
              Configure your preferences to start filtering job listings
            </p>
          )}
          {!hasApiKey && (
            <p className="text-amber-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              OpenAI API key required for AI analysis
            </p>
          )}
        </div>
        <Button
          onClick={() => setShowPreferences(true)}
          variant="outline"
          className="border-teal-600 text-teal-500 hover:bg-teal-600 hover:text-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </Button>
      </div>

      {/* Job listings input */}
      <div className="space-y-4">
        <div>
          <label className="text-white text-sm font-medium mb-2 block">
            Paste Job Listings
          </label>
          <Textarea
            value={jobListings}
            onChange={(e) => setJobListings(e.target.value)}
            placeholder="Paste your job listings here... The AI will automatically detect whether these are job titles or full descriptions and filter them based on your preferences."
            className="min-h-[300px] bg-neutral-800 border-gray-600 text-white placeholder:text-gray-400 resize-none"
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-medium disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            "Analyze Job Listings with AI"
          )}
        </Button>

        {!hasPreferences && (
          <p className="text-center text-gray-400 text-sm">
            Please set up your preferences before analyzing job listings
          </p>
        )}

        {!hasApiKey && (
          <p className="text-center text-amber-400 text-sm">
            Please add your OpenAI API key in preferences to enable AI analysis
          </p>
        )}
      </div>

      <PreferencesModal
        open={showPreferences}
        onOpenChange={setShowPreferences}
      />
    </div>
  );
};
