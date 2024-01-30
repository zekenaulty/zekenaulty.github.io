// themes.ts
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    // ... other color overrides
  };
}

export const darklyTheme: Theme = {
  colors: {
    primary: '#007BFF',
    secondary: '#6C757D',
    // ... other color overrides
  },
};

export const flatlyTheme: Theme = {
  colors: {
    primary: '#007BFF',
    secondary: '#6C757D',
    // ... other color overrides
  },
};

// Add an empty export statement to make it a module
export {};
