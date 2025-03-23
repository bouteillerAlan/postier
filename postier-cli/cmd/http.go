package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/bouteillerAlan/postier/history"
	"github.com/bouteillerAlan/postier/http"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

// Common function to handle HTTP requests for all methods
func handleRequest(cmd *cobra.Command, args []string, method string) error {
	if len(args) < 1 {
		return fmt.Errorf("URL is required")
	}
	targetURL := args[0]

	// Get command flags
	headers, _ := cmd.Flags().GetString("headers")
	query, _ := cmd.Flags().GetString("query")
	body, _ := cmd.Flags().GetString("body")
	bodyType, _ := cmd.Flags().GetString("body-type")
	outputFile, _ := cmd.Flags().GetString("output")
	verbose, _ := cmd.Flags().GetBool("verbose")
	showProgress, _ := cmd.Flags().GetBool("progress")

	// Send HTTP request
	resp, err := http.SendRequest(method, targetURL, headers, query, body, bodyType, showProgress)
	if err != nil {
		return err
	}

	// Add to history
	err = history.AddToHistory(method, targetURL, resp.StatusCode, resp.Time, resp.ContentLength, headers, query, body, bodyType)
	if err != nil && verbose {
		fmt.Fprintf(os.Stderr, "Warning: Failed to add to history: %s\n", err)
	}

	// Process response
	printResponse(resp, verbose)

	// Save response to file if requested
	if outputFile != "" {
		if err := saveResponseToFile(resp, outputFile); err != nil {
			return fmt.Errorf("failed to save response to file: %w", err)
		}
	}

	return nil
}

// Print the HTTP response to the console
func printResponse(resp *http.Response, verbose bool) {
	// Print status code with color based on status
	statusColor := color.New(color.Bold)
	switch {
	case resp.StatusCode >= 200 && resp.StatusCode < 300:
		statusColor.Add(color.FgGreen)
	case resp.StatusCode >= 300 && resp.StatusCode < 400:
		statusColor.Add(color.FgCyan)
	case resp.StatusCode >= 400 && resp.StatusCode < 500:
		statusColor.Add(color.FgYellow)
	default:
		statusColor.Add(color.FgRed)
	}

	// Print status and summary
	fmt.Printf("HTTP Status: ")
	statusColor.Printf("%d\n", resp.StatusCode)
	fmt.Printf("Response Time: %s\n", resp.Time)
	fmt.Printf("Response Size: %d bytes\n", resp.ContentLength)

	// Print detailed timing information
	if resp.Timings != nil {
		fmt.Println("\nDetailed Timings:")
		timingHeaders := color.New(color.FgHiBlue, color.Bold)
		timingHeaders.Println("Phase                  Duration")
		timingHeaders.Println("-----                  --------")
		fmt.Printf("DNS Lookup:            %s\n", resp.Timings.DNSLookup)
		fmt.Printf("TCP Connection:        %s\n", resp.Timings.TCPConnection)
		if resp.Timings.TLSHandshake > 0 {
			fmt.Printf("TLS Handshake:         %s\n", resp.Timings.TLSHandshake)
		}
		fmt.Printf("Server Processing:     %s\n", resp.Timings.ServerTime)
		fmt.Printf("Content Transfer:      %s\n", resp.Timings.Transfer)
		fmt.Printf("Total:                 %s\n", resp.Timings.Total)
	}

	// Print headers if verbose
	if verbose {
		fmt.Println("\nResponse Headers:")
		for key, value := range resp.Headers {
			fmt.Printf("%s: %s\n", key, value)
		}
	} else {
		// Print content type in non-verbose mode
		if contentType, ok := resp.Headers["Content-Type"]; ok {
			fmt.Printf("Content-Type: %s\n", contentType)
		}
	}

	// Print response body
	fmt.Println("\nResponse Body:")
	// Try to pretty print JSON
	if strings.Contains(resp.Headers["Content-Type"], "application/json") {
		var jsonData interface{}
		if err := json.Unmarshal([]byte(resp.Body), &jsonData); err == nil {
			jsonStr, err := json.MarshalIndent(jsonData, "", "  ")
			if err == nil {
				fmt.Println(string(jsonStr))
				return
			}
		}
	}
	// If not JSON or failed to parse, print as-is
	fmt.Println(resp.Body)
}

// Save response to a file
func saveResponseToFile(resp *http.Response, filename string) error {
	// Create output file
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	// Write response body to file
	_, err = file.WriteString(resp.Body)
	return err
}

// Initialize HTTP method commands
func init() {
	// GET command
	var getCmd = &cobra.Command{
		Use:   "get [url]",
		Short: "Send a GET request",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return handleRequest(cmd, args, "GET")
		},
	}

	// POST command
	var postCmd = &cobra.Command{
		Use:   "post [url]",
		Short: "Send a POST request",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return handleRequest(cmd, args, "POST")
		},
	}

	// PUT command
	var putCmd = &cobra.Command{
		Use:   "put [url]",
		Short: "Send a PUT request",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return handleRequest(cmd, args, "PUT")
		},
	}

	// DELETE command
	var deleteCmd = &cobra.Command{
		Use:   "delete [url]",
		Short: "Send a DELETE request",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return handleRequest(cmd, args, "DELETE")
		},
	}

	// HEAD command
	var headCmd = &cobra.Command{
		Use:   "head [url]",
		Short: "Send a HEAD request",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return handleRequest(cmd, args, "HEAD")
		},
	}

	// OPTIONS command
	var optionsCmd = &cobra.Command{
		Use:   "options [url]",
		Short: "Send an OPTIONS request",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return handleRequest(cmd, args, "OPTIONS")
		},
	}

	// PATCH command
	var patchCmd = &cobra.Command{
		Use:   "patch [url]",
		Short: "Send a PATCH request",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return handleRequest(cmd, args, "PATCH")
		},
	}

	// Add all HTTP commands to root command
	RootCmd.AddCommand(getCmd)
	RootCmd.AddCommand(postCmd)
	RootCmd.AddCommand(putCmd)
	RootCmd.AddCommand(deleteCmd)
	RootCmd.AddCommand(headCmd)
	RootCmd.AddCommand(optionsCmd)
	RootCmd.AddCommand(patchCmd)
}
