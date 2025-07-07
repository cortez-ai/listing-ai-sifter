
import React, { useState } from 'react';
import { JobListingInput } from '@/components/JobListingInput';
import { analyzeJobListings } from '@/services/aiService';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

export const MainPage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { preferences } = useApp();

  const handleAnalyze = async (jobListings: string) => {
    setIsAnalyzing(true);
    
    try {
      const results = await analyzeJobListings(jobListings, preferences);
      
      // Store results in sessionStorage for the results page
      sessionStorage.setItem('analysisResults', JSON.stringify({
        originalInput: jobListings,
        filteredResults: results,
        timestamp: Date.now()
      }));
      
      navigate('/results');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze job listings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <JobListingInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
    </div>
  );
};
