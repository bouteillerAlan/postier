# Postier - A Modern HTTP Client

Postier is a cross-platform HTTP client built with Tauri, React, and TypeScript, designed to be a lightweight and fast alternative to Postman and equivalent. It provides a modern, intuitive interface for making HTTP requests and viewing responses.

## Features

- **HTTP Request Support**
  - Supports GET, POST, PUT, DELETE, HEAD, OPTIONS and PATCH methods
  - URL input with method selection
  - Request body editor (formats: form-data, raw as text or javascript or JSON or HTML or XML, none)
  - Headers managements
  - Request history

- **Response Handling**
  - Real-time response display
  - Response in raw or preview or pretty
  - If the response is view in "pretty" you have syntax-highlighted in JSON, XML, HTML or Text
  - Response headers viewer
  - HTTP status code display
  - Error handling with clear error messages

## Development

### Prerequisites

- Node.js (v18.17.0 or higher)
- pnpm
- Rust (for Tauri)

### Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm tauri dev
```

### Building for Production

```bash
pnpm tauri build
```

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Desktop Framework**: Tauri
- **UI Components**: Radix UI
- **HTTP Client**: Axios
- **Syntax Highlighting**: react-syntax-highlighter
