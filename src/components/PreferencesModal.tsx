
import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';

interface PreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ open, onOpenChange }) => {
  const { preferences, addInterest, removeInterest, addExclusion, removeExclusion } = useApp();
  const [newInterest, setNewInterest] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Configure Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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
                    <span className="text-white text-sm">{interest}</span>
                    <Button
                      onClick={() => removeInterest(index)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
                    <span className="text-white text-sm">{exclusion}</span>
                    <Button
                      onClick={() => removeExclusion(index)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
