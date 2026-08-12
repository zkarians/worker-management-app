"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="modern-light"
      enableSystem={false}
      themes={["classic", "modern-light"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
