
import React, { useState } from 'react';
import { X, Plus, Trash2, Copy, ClipboardPaste, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { setOpenAIApiKey, hasOpenAIApiKey } from '@/services/aiService';

interface PreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ open, onOpenChange }) => {
  const { preferences, addInterest, removeInterest, addExclusion, removeExclusion, setPreferences } = useApp();
  const [newInterest, setNewInterest] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      addInterest(newInterest.trim());
      setNewInterest('');
    }
  };

  const handleAddExclusion = () => {
    if (newExclusion.trim()) {
      addExclusion(newExclusion.trim());
      setNewExclusion('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `"${text}" has been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyAllPreferences = async () => {
    const allPreferences = [
      ...preferences.interested.map(pref => `Interested: ${pref}`),
      ...preferences.notInterested.map(pref => `Not Interested: ${pref}`)
    ];
    
    const formattedPreferences = allPreferences.join('\n\n');
    await copyToClipboard(formattedPreferences);
  };

  const handleBulkPaste = () => {
    if (!bulkInput.trim()) return;

    const lines = bulkInput.split('\n').map(line => line.trim()).filter(line => line);
    const newInterested: string[] = [];
    const newNotInterested: string[] = [];

    lines.forEach(line => {
      if (line.toLowerCase().startsWith('interested:')) {
        const preference = line.substring(11).trim();
        if (preference) newInterested.push(preference);
      } else if (line.toLowerCase().startsWith('not interested:')) {
        const preference = line.substring(15).trim();
        if (preference) newNotInterested.push(preference);
      } else if (line) {
        // Default to interested if no prefix
        newInterested.push(line);
      }
    });

    setPreferences({
      interested: [...preferences.interested, ...newInterested],
      notInterested: [...preferences.notInterested, ...newNotInterested]
    });

    setBulkInput('');
    setShowBulkInput(false);
    
    toast({
      title: "Preferences added",
      description: `Added ${newInterested.length} interested and ${newNotInterested.length} not interested preferences.`,
    });
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setOpenAIApiKey(apiKey.trim());
      setApiKey('');
      setShowApiKeyInput(false);
      toast({
        title: "API Key Saved",
        description: "OpenAI API key has been saved successfully.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Configure Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* API Key Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white text-sm font-medium">
                OpenAI API Key
              </Label>
              <div className="flex items-center gap-2">
                {hasOpenAIApiKey() && (
                  <span className="text-xs text-green-400">✓ Configured</span>
                )}
                <Button
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {hasOpenAIApiKey() ? 'Update' : 'Add'} Key
                </Button>
              </div>
            </div>
            {showApiKeyInput && (
              <div className="space-y-2">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveApiKey}
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Save Key
                  </Button>
                  <Button
                    onClick={() => {
                      setApiKey('');
                      setShowApiKeyInput(false);
                    }}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowBulkInput(!showBulkInput)}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <ClipboardPaste className="h-4 w-4 mr-2" />
              Bulk Add
            </Button>
            <Button
              onClick={copyAllPreferences}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>

          {/* Bulk Input */}
          {showBulkInput && (
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">
                Bulk Add Preferences
              </Label>
              <Textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Paste preferences here. Use 'Interested: term' or 'Not Interested: term' format, or just enter terms (defaults to interested). Separate with empty lines."
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkPaste}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Add Preferences
                </Button>
                <Button
                  onClick={() => {
                    setBulkInput('');
                    setShowBulkInput(false);
                  }}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Interested Section */}
          <div>
            <Label className="text-white text-sm font-medium mb-2 block">
              Interested In
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleAddInterest)}
                  placeholder="e.g., React, Remote work, Senior"
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={handleAddInterest}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {preferences.interested.map((interest, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded">
                    <span className="text-white text-sm flex-1">{interest}</span>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => copyToClipboard(interest)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-teal-400"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => removeInterest(index)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Not Interested Section */}
          <div>
            <Label className="text-white text-sm font-medium mb-2 block">
              Not Interested In
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleAddExclusion)}
                  placeholder="e.g., PHP, On-site only, Junior"
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={handleAddExclusion}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {preferences.notInterested.map((exclusion, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded">
                    <span className="text-white text-sm flex-1">{exclusion}</span>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => copyToClipboard(exclusion)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-teal-400"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => removeExclusion(index)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
