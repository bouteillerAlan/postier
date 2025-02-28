# Postier - A Modern HTTP Client

Postier is a cross-platform HTTP client built with Tauri, React, and TypeScript, designed to be a lightweight and fast alternative to Postman. It provides a modern, intuitive interface for making HTTP requests and viewing responses.

## Features

- **HTTP Request Support**
  - Supports GET, POST, PUT, DELETE, and PATCH methods
  - URL input with method selection
  - Request body editor (JSON)
  - Headers management (coming soon)
  - Request history (coming soon)

- **Response Handling**
  - Real-time response display
  - Syntax-highlighted JSON formatting
  - Response headers viewer
  - HTTP status code display
  - Error handling with clear error messages

- **User Interface**
  - Modern, clean design using Radix UI
  - Dark/Light mode support (coming soon)
  - Loading states with animated spinner
  - Tabbed interface for request/response data
  - Responsive layout

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Desktop Framework**: Tauri
- **UI Components**: Radix UI
- **HTTP Client**: Axios
- **Syntax Highlighting**: react-syntax-highlighter

## Project Structure

```
src/
├── components/
│   ├── LoadingSpinner.tsx    # Loading animation component
│   ├── RequestPanel.tsx      # HTTP request form component
│   └── ResponsePanel.tsx     # Response display component
├── App.tsx                   # Main application component
└── App.css                   # Global styles
```

## Component Documentation

### App.tsx
The main application component that manages the application state and coordinates between request and response components.

**State Management:**
- `response`: Stores the Axios response object
- `error`: Stores any error that occurs during the request
- `isLoading`: Tracks the loading state during requests

### RequestPanel.tsx
Handles the request configuration UI and form submission.

**Props:**
- `onRequest`: Callback function that receives the request configuration

**Features:**
- Method selection dropdown
- URL input field
- Request body editor (disabled for GET requests)
- Submit button to send requests

### ResponsePanel.tsx
Displays the HTTP response or error messages.

**Props:**
- `response`: The Axios response object
- `error`: Any error object from failed requests
- `isLoading`: Boolean indicating if a request is in progress

**Features:**
- Loading spinner during requests
- Error message display
- Response status code display
- Tabbed interface for response body and headers
- Syntax-highlighted JSON formatting

### LoadingSpinner.tsx
A reusable loading indicator component.

**Features:**
- CSS-based spinning animation
- Centered layout
- Loading text display

## Styling

The application uses CSS variables from Radix UI Themes for consistent styling:
- `--gray-1` through `--gray-5`: Background and border colors
- `--accent-9`: Accent color for interactive elements
- `--red-2`, `--red-6`: Error state colors

## Getting Started

### Local Development

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm tauri dev
```

### Docker Development

Prerequisites:
- Docker and Docker Compose installed

To start development with Docker:

```bash
docker compose up
```

This will:
- Build the Docker container with all necessary dependencies
- Start the development server automatically
- Mount your local code for live editing
- Preserve node_modules and Rust build artifacts in Docker volumes

The application will be available at `http://localhost:1420` and will hot-reload when you make changes to the code.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Code of conduct, license, authors, changelog, contributing

See the following file :
- [code of conduct](CODE_OF_CONDUCT.md)
- [license](LICENSE)
- [authors](AUTHORS)
- [contributing](CONTRIBUTING.md)
- [changelog](CHANGELOG)
- [security](SECURITY.md)

## Want to support my work?

- [Give me a tipson Github](https://github.com/sponsors/bouteillerAlan) or [on Ko-fi](https://ko-fi.com/a2n00)
- Give a star on github
- Or just participate to the developement :D

### Thanks !
