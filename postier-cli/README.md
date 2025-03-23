# Postier CLI

Postier is a powerful command-line HTTP client tool that allows you to execute various HTTP requests (GET, POST, PUT, DELETE, HEAD, OPTIONS, PATCH) via HTTPS, HTTP, IPv4, or IPv6.

## Features

- Support for all major HTTP methods: GET, POST, PUT, DELETE, HEAD, OPTIONS, PATCH
- Support for HTTPS, HTTP, IPv4, and IPv6
- Custom headers and query parameters via JSON text or file
- Request body in various formats: JSON, text, form data, JavaScript, HTML, XML
- Detailed response information: status code, headers, body, size, and timing
- Interactive progress bars showing real-time request phases
- Detailed timing metrics for each phase of the request
- Automatic history tracking with unique IDs
- Ability to replay previous requests by ID
- Color-coded output for better readability

## Installation

### From source

```bash
# Clone the repository
git clone https://github.com/bouteillerAlan/postier.git
cd postier

# Build the binary
go build -o postier main.go

# Optional: Move to a directory in your PATH
move postier.exe C:\path\to\bin\
```

## Usage

### Basic commands

```bash
# Make a GET request
postier get https://api.example.com/data

# Make a POST request with JSON body
postier post https://api.example.com/users -b '{"name":"John","email":"john@example.com"}' -t json

# Make a PUT request with headers
postier put https://api.example.com/users/123 -H '{"Authorization":"Bearer token123"}' -b '{"name":"John Updated"}'

# Make a DELETE request
postier delete https://api.example.com/users/123

# View request history
postier history
```

### Command options

All HTTP commands (get, post, put, delete, head, options, patch) support the following options:

```
-H, --headers string     HTTP headers as JSON text or @file.json for file input
-q, --query string       Query parameters as JSON text or @file.json for file input
-b, --body string        Request body as text or @file for file input
-t, --body-type string   Body type: json, text, form, js, html, xml, none (default "json")
-o, --output string      Output file to write response to
-v, --verbose            Enable verbose output
-p, --progress           Show interactive progress bars during request (default true)
```

### Examples

#### Use a JSON file for headers or query parameters

```bash
# Create a headers.json file
echo '{"Authorization":"Bearer token123","Accept":"application/json"}' > headers.json

# Use the file for headers
postier get https://api.example.com/data -H @headers.json
```

#### Send a form data request

```bash
postier post https://api.example.com/form -t form -b "name=John&email=john@example.com"
```

#### Save response to a file

```bash
postier get https://api.example.com/large-data -o response.json
```

#### Use IPv6

```bash
postier get http://[2001:db8::1]:8080/data
```

## Interactive Progress Display

Postier features interactive progress bars that show the real-time status of each phase of your HTTP request:

- DNS Lookup: Resolving domain name to IP address
- TCP Connection: Establishing connection with the server
- TLS Handshake: Negotiating secure connection (HTTPS only)
- Server Processing: Time spent waiting for the server to process the request
- Content Transfer: Downloading the response body

This feature is enabled by default. To disable it, use the `--progress=false` flag:

```bash
postier get https://api.example.com/data --progress=false
```

After the request completes, you'll also see detailed timing metrics for each phase.

## History

Postier automatically saves the history of all your requests in:

```
C:\Users\<username>\AppData\Local\com.postier.app\history.txt
```

Use the `history` command to view your request history:

```bash
postier history
```

### Replaying requests from history

Each request in the history has a unique ID that can be used to replay it. To replay a request, use the `replay` command followed by the ID:

```bash
postier replay abc123def456
```

The replay command supports the same flags as the regular HTTP commands, allowing you to override parts of the original request:

```bash
# Replay a request but change the body
postier replay abc123def456 -b '{"name":"New Name"}'

# Replay a request with verbose output
postier replay abc123def456 -v
