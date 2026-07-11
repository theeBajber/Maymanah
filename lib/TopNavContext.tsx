"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type TopNavContextType = {
  content: ReactNode;
  setContent: (content: ReactNode) => void;
};

const TopNavContext = createContext<TopNavContextType>({
  content: null,
  setContent: () => {},
});

export function TopNavProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null);
  return (
    <TopNavContext.Provider value={{ content, setContent }}>
      {children}
    </TopNavContext.Provider>
  );
}

export function useTopNavContent() {
  return useContext(TopNavContext);
}
