package cmd

import (
	"fmt"

	"github.com/bouteillerAlan/postier/history"
	"github.com/bouteillerAlan/postier/http"
	"github.com/spf13/cobra"
)

// Initialize replay command
func init() {
	var replayCmd = &cobra.Command{
		Use:   "replay [id]",
		Short: "Replay a request from history by ID",
		Long:  "Replay a previously executed HTTP request from history using its unique ID",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			// Get the request ID
			id := args[0]

			// Retrieve the history entry
			entry, err := history.GetHistoryEntryByID(id)
			if err != nil {
				return err
			}

			fmt.Printf("Replaying %s request to %s\n\n", entry.Method, entry.URL)

			// Get command flags to allow overriding parts of the original request
			headers, _ := cmd.Flags().GetString("headers")
			query, _ := cmd.Flags().GetString("query")
			body, _ := cmd.Flags().GetString("body")
			bodyType, _ := cmd.Flags().GetString("body-type")
			outputFile, _ := cmd.Flags().GetString("output")
			verbose, _ := cmd.Flags().GetBool("verbose")
			showProgress, _ := cmd.Flags().GetBool("progress")

			// Use original values from history if not overridden
			if headers == "" {
				headers = entry.Headers
			}
			if query == "" {
				query = entry.Query
			}
			if body == "" {
				body = entry.Body
			}
			if bodyType == "json" && entry.BodyType != "" {
				// Only override if default value not changed
				bodyType = entry.BodyType
			}

			// Send HTTP request
			resp, err := http.SendRequest(entry.Method, entry.URL, headers, query, body, bodyType, showProgress)
			if err != nil {
				return err
			}

			// Add the replayed request to history
			err = history.AddToHistory(entry.Method, entry.URL, resp.StatusCode, resp.Time, resp.ContentLength, headers, query, body, bodyType)
			if err != nil && verbose {
				fmt.Printf("Warning: Failed to add replayed request to history: %s\n", err)
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
		},
	}

	// Add replay command to root command
	RootCmd.AddCommand(replayCmd)
}
