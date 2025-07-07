
import React, { useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { PreferencesModal } from './PreferencesModal';
import { useNavigate } from 'react-router-dom';

interface JobListingInputProps {
  onAnalyze: (jobListings: string) => void;
  isAnalyzing: boolean;
}

export const JobListingInput: React.FC<JobListingInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const { hasPreferences } = useApp();
  const [jobListings, setJobListings] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (jobListings.trim()) {
      onAnalyze(jobListings);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with preferences button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Job Listing Filter</h1>
          {!hasPreferences && (
            <p className="text-gray-400 text-sm">
              Configure your preferences to start filtering job listings
            </p>
          )}
        </div>
        <Button
          onClick={() => setShowPreferences(true)}
          variant="outline"
          className="border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white"
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
            className="min-h-[300px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 resize-none"
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!jobListings.trim() || !hasPreferences || isAnalyzing}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-medium disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Job Listings'
          )}
        </Button>

        {!hasPreferences && (
          <p className="text-center text-gray-400 text-sm">
            Please set up your preferences before analyzing job listings
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
