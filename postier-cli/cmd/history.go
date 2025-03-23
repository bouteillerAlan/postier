package cmd

import (
	"fmt"
	"strings"
	"time"

	"github.com/bouteillerAlan/postier/history"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

// Initialize history command
func init() {
	var historyCmd = &cobra.Command{
		Use:   "history",
		Short: "View request history",
		Long:  "View the history of HTTP requests made with Postier",
		RunE: func(cmd *cobra.Command, args []string) error {
			// Get history entries
			entries, err := history.GetHistory()
			if err != nil {
				return fmt.Errorf("failed to get history: %w", err)
			}

			// Check if history is empty
			if len(entries) == 0 {
				fmt.Println("No request history found.")
				return nil
			}

			// Print history entries
			fmt.Printf("Request History (%d entries):\n\n", len(entries))
			fmt.Printf("%-16s %-25s %-7s %-50s %-5s %-10s %-10s\n", "ID", "TIMESTAMP", "METHOD", "URL", "STATUS", "DURATION", "SIZE")
			fmt.Println(strings.Repeat("-", 130))

			// Setup colors
			methodColors := map[string]*color.Color{
				"GET":     color.New(color.FgBlue),
				"POST":    color.New(color.FgGreen),
				"PUT":     color.New(color.FgYellow),
				"DELETE":  color.New(color.FgRed),
				"HEAD":    color.New(color.FgCyan),
				"OPTIONS": color.New(color.FgMagenta),
				"PATCH":   color.New(color.FgHiYellow),
			}

			statusColor := func(status int) *color.Color {
				switch {
				case status >= 200 && status < 300:
					return color.New(color.FgGreen)
				case status >= 300 && status < 400:
					return color.New(color.FgCyan)
				case status >= 400 && status < 500:
					return color.New(color.FgYellow)
				default:
					return color.New(color.FgRed)
				}
			}

			// Print entries from newest to oldest
			for i := len(entries) - 1; i >= 0; i-- {
				entry := entries[i]
				
				// Format URL to limit length
			url := entry.URL
			if len(url) > 50 {
				url = url[:47] + "..."
			}

				// Format timestamp
				timestamp := entry.Timestamp.Format(time.RFC3339)

				// Print with colors
				fmt.Printf("%-16s ", entry.ID)
				fmt.Printf("%-25s ", timestamp)
				methodColor := methodColors[entry.Method]
				if methodColor == nil {
					methodColor = color.New(color.Reset)
				}
				methodColor.Printf("%-7s ", entry.Method)
				fmt.Printf("%-50s ", url)
				statusColor(entry.Status).Printf("%-5d ", entry.Status)
				fmt.Printf("%-10s ", entry.Duration)
				fmt.Printf("%-10d\n", entry.Size)
			}

			// Print path to history file
			historyPath, _ := history.GetHistoryFilePath()
			fmt.Printf("\nHistory file: %s\n", historyPath)

			return nil
		},
	}

	// Add history command to root command
	RootCmd.AddCommand(historyCmd)
}
