package http

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptrace"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/bouteillerAlan/postier/ui"
)

// Response represents a formatted HTTP response
type Response struct {
	StatusCode    int               `json:"status_code"`
	Headers       map[string]string `json:"headers"`
	Body          string            `json:"body"`
	ContentLength int64             `json:"content_length"`
	Time          time.Duration     `json:"time"`
	Timings       *HTTPTimings      `json:"timings,omitempty"`
}

// HTTPTimings represents detailed timing information for an HTTP request
type HTTPTimings struct {
	DNSLookup     time.Duration `json:"dns_lookup"`      // DNS lookup time
	TCPConnection time.Duration `json:"tcp_connection"` // TCP connection establishment time
	TLSHandshake  time.Duration `json:"tls_handshake"`  // TLS handshake time (for HTTPS)
	ServerTime    time.Duration `json:"server_time"`    // Time between sending request and receiving first byte of response
	Transfer      time.Duration `json:"transfer"`       // Time to download the response body
	Total         time.Duration `json:"total"`          // Total request time
}

// FormatHeaders converts http.Header to a map[string]string
func FormatHeaders(headers http.Header) map[string]string {
	result := make(map[string]string)
	for key, values := range headers {
		result[key] = strings.Join(values, "; ")
	}
	return result
}

// ParseHeaders parses headers from JSON text or a JSON file
func ParseHeaders(headersInput string) (http.Header, error) {
	headers := make(http.Header)
	if headersInput == "" {
		return headers, nil
	}

	var headersMap map[string]string
	var err error

	// Check if input is a file reference
	if strings.HasPrefix(headersInput, "@") {
		headersMap, err = parseJSONFile(headersInput[1:])
	} else {
		headersMap, err = parseJSONString(headersInput)
	}

	if err != nil {
		return nil, err
	}

	for key, value := range headersMap {
		headers.Set(key, value)
	}

	return headers, nil
}

// ParseQuery parses query parameters from JSON text or a JSON file
func ParseQuery(queryInput string) (url.Values, error) {
	queryValues := url.Values{}
	if queryInput == "" {
		return queryValues, nil
	}

	var queryMap map[string]string
	var err error

	// Check if input is a file reference
	if strings.HasPrefix(queryInput, "@") {
		queryMap, err = parseJSONFile(queryInput[1:])
	} else {
		queryMap, err = parseJSONString(queryInput)
	}

	if err != nil {
		return nil, err
	}

	for key, value := range queryMap {
		queryValues.Set(key, value)
	}

	return queryValues, nil
}

// ParseBody prepares the request body and content type based on input and body type
func ParseBody(bodyInput, bodyType string) (io.Reader, string, error) {
	if bodyInput == "" || bodyType == "none" {
		return nil, "", nil
	}

	// Read from file if input starts with @
	var bodyContent []byte
	var err error
	if strings.HasPrefix(bodyInput, "@") {
		bodyContent, err = os.ReadFile(bodyInput[1:])
		if err != nil {
			return nil, "", fmt.Errorf("failed to read body file: %w", err)
		}
	} else {
		bodyContent = []byte(bodyInput)
	}

	contentType := ""
	switch bodyType {
	case "json":
		contentType = "application/json"
		// Validate JSON
		var js interface{}
		if err := json.Unmarshal(bodyContent, &js); err != nil {
			return nil, "", fmt.Errorf("invalid JSON body: %w", err)
		}
	case "text":
		contentType = "text/plain"
	case "form":
		contentType = "application/x-www-form-urlencoded"
	case "js":
		contentType = "application/javascript"
	case "html":
		contentType = "text/html"
	case "xml":
		contentType = "application/xml"
	default:
		return nil, "", fmt.Errorf("unsupported body type: %s", bodyType)
	}

	return bytes.NewBuffer(bodyContent), contentType, nil
}

// SendRequest sends an HTTP request and returns a formatted response
func SendRequest(method, targetURL, headersInput, queryInput, bodyInput, bodyType string, showProgress bool) (*Response, error) {
	// Initialize progress display
	progress := ui.NewProgressDisplay(showProgress)
	progress.Start()
	defer progress.Complete()

	// Parse headers
	headers, err := ParseHeaders(headersInput)
	if err != nil {
		return nil, fmt.Errorf("header parsing error: %w", err)
	}

	// Parse query parameters
	queryValues, err := ParseQuery(queryInput)
	if err != nil {
		return nil, fmt.Errorf("query parsing error: %w", err)
	}

	// Parse URL and add query parameters
	parsedURL, err := url.Parse(targetURL)
	if err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}

	// Add query parameters to URL
	if len(queryValues) > 0 {
		q := parsedURL.Query()
		for key, values := range queryValues {
			for _, value := range values {
				q.Add(key, value)
			}
		}
		parsedURL.RawQuery = q.Encode()
	}

	// Parse body
	body, contentType, err := ParseBody(bodyInput, bodyType)
	if err != nil {
		return nil, fmt.Errorf("body parsing error: %w", err)
	}

	// Create request
	req, err := http.NewRequest(method, parsedURL.String(), body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Add headers
	for key, values := range headers {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// Set content type if provided
	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}

	// Create a context with a cancel function
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Create a transport with a TLS config that skips verification
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}

	// Create a client with the transport
	client := &http.Client{Transport: transport}

	// Initialize timing variables
	timings := &HTTPTimings{}
	var dnsStart, connectStart, tlsStart, firstByteStart time.Time

	// Create a trace context
	trace := &httptrace.ClientTrace{
		DNSStart: func(info httptrace.DNSStartInfo) {
			dnsStart = time.Now()
			progress.Update("dns_start", "started", 0)
		},
		DNSDone: func(info httptrace.DNSDoneInfo) {
			if !dnsStart.IsZero() {
				timings.DNSLookup = time.Since(dnsStart)
				progress.Update("dns_complete", "completed", timings.DNSLookup)
			}
		},
		ConnectStart: func(network, addr string) {
			connectStart = time.Now()
			progress.Update("connect_start", "started", 0)
		},
		ConnectDone: func(network, addr string, err error) {
			if !connectStart.IsZero() {
				timings.TCPConnection = time.Since(connectStart)
				progress.Update("connect_complete", "completed", timings.TCPConnection)
			}
		},
		TLSHandshakeStart: func() {
			tlsStart = time.Now()
			progress.Update("tls_start", "started", 0)
		},
		TLSHandshakeDone: func(state tls.ConnectionState, err error) {
			if !tlsStart.IsZero() {
				timings.TLSHandshake = time.Since(tlsStart)
				progress.Update("tls_complete", "completed", timings.TLSHandshake)
			}
		},
		WroteRequest: func(info httptrace.WroteRequestInfo) {
			progress.Update("request_sent", "completed", 0)
		},
		GotFirstResponseByte: func() {
			if firstByteStart.IsZero() {
				firstByteStart = time.Now()
			}
			if !connectStart.IsZero() {
				timings.ServerTime = firstByteStart.Sub(connectStart)
				if timings.TLSHandshake > 0 {
					// Subtract TLS handshake time to get actual server processing time
					timings.ServerTime -= timings.TLSHandshake
				}
				progress.Update("response_first_byte", "completed", timings.ServerTime)
			}
		},
	}

	// Add the trace to the request context
	ctx = httptrace.WithClientTrace(ctx, trace)

	// Send request and measure time
	startTime := time.Now()
	resp, err := client.Do(req.WithContext(ctx))
	timings.Total = time.Since(startTime)

	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	downloadStart := time.Now()
	respBody, err := io.ReadAll(resp.Body)
	timings.Transfer = time.Since(downloadStart)
	progress.Update("response_complete", "completed", timings.Transfer)

	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Format response
	formattedResp := &Response{
		StatusCode:    resp.StatusCode,
		Headers:       FormatHeaders(resp.Header),
		Body:          string(respBody),
		ContentLength: resp.ContentLength,
		Time:          time.Since(startTime),
		Timings:       timings,
	}

	return formattedResp, nil
}

// Helper functions to parse JSON from string or file
func parseJSONString(jsonStr string) (map[string]string, error) {
	result := make(map[string]string)
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		return nil, fmt.Errorf("invalid JSON: %w", err)
	}
	return result, nil
}

func parseJSONFile(filename string) (map[string]string, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read file %s: %w", filename, err)
	}
	return parseJSONString(string(data))
}
