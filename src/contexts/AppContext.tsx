
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Preferences {
  interested: string[];
  notInterested: string[];
}

interface AppContextType {
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
  addInterest: (interest: string) => void;
  removeInterest: (index: number) => void;
  addExclusion: (exclusion: string) => void;
  removeExclusion: (index: number) => void;
  hasPreferences: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'job-filter-preferences';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferencesState] = useState<Preferences>({
    interested: [],
    notInterested: []
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferencesState(parsed);
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const setPreferences = (newPreferences: Preferences) => {
    setPreferencesState(newPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
  };

  const addInterest = (interest: string) => {
    const newPreferences = {
      ...preferences,
      interested: [...preferences.interested, interest]
    };
    setPreferences(newPreferences);
  };

  const removeInterest = (index: number) => {
    const newPreferences = {
      ...preferences,
      interested: preferences.interested.filter((_, i) => i !== index)
    };
    setPreferences(newPreferences);
  };

  const addExclusion = (exclusion: string) => {
    const newPreferences = {
      ...preferences,
      notInterested: [...preferences.notInterested, exclusion]
    };
    setPreferences(newPreferences);
  };

  const removeExclusion = (index: number) => {
    const newPreferences = {
      ...preferences,
      notInterested: preferences.notInterested.filter((_, i) => i !== index)
    };
    setPreferences(newPreferences);
  };

  const hasPreferences = preferences.interested.length > 0 || preferences.notInterested.length > 0;

  return (
    <AppContext.Provider value={{
      preferences,
      setPreferences,
      addInterest,
      removeInterest,
      addExclusion,
      removeExclusion,
      hasPreferences
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
