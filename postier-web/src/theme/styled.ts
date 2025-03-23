import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --yellow: #EFCF4A;
    --orange: #D95525;
    --red: #CC3B2C;
    --pink: #9D2C44;
    --purple: #6F364F;

    --background: #242424;
    --foreground: #FFFFFF;
    --card: #101113;
    --card-foreground: #FFFFFF;
    --subtle: #1F2128;
    --muted: rgba(255, 255, 255, 0.5);
    --border: rgba(255, 255, 255, 0.1);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--background);
    color: var(--foreground);
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;
