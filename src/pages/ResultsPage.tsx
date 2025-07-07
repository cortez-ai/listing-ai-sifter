
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AnalysisResults {
  originalInput: string;
  filteredResults: string;
  timestamp: number;
}

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('analysisResults');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResults(parsed);
      } catch (error) {
        console.error('Failed to parse results:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Filtered Results</h1>
        </div>

        {/* Original Input (Collapsible) */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <Collapsible open={showOriginal} onOpenChange={setShowOriginal}>
            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-750 transition-colors">
              <span className="text-white font-medium">Original Input</span>
              {showOriginal ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 pt-0">
                <div className="bg-gray-900 rounded p-4 max-h-60 overflow-y-auto">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                    {results.originalInput}
                  </pre>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Filtered Results */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Filtered Job Listings</h2>
          <div className="bg-gray-900 rounded p-4">
            <div className="text-gray-100 whitespace-pre-wrap">
              {results.filteredResults}
            </div>
          </div>
        </div>

        {/* Analysis Info */}
        <div className="text-center text-gray-400 text-sm">
          Analysis completed at {new Date(results.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
