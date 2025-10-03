"use client";

import ViewToggle from "./ViewToggle";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ViewToggle />
      {children}
    </>
  );
}
