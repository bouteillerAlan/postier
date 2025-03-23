package cmd

import (
	"github.com/bouteillerAlan/postier/ui"
	"github.com/spf13/cobra"
)

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   "postier",
	Short: "A CLI HTTP client tool",
	Long: ui.GetGradientLogo() + `
Postier is a command-line HTTP client tool that allows you to execute
various HTTP requests (GET, POST, PUT, DELETE, HEAD, OPTIONS, PATCH) via
HTTPS, HTTP, IPv4, or IPv6.

You can provide query parameters and headers via JSON file or text,
and body content via file or text in various formats including JSON, text,
form data, JavaScript, HTML, XML.`,
}

func init() {
	// Add global flags here if needed
	RootCmd.PersistentFlags().StringP("headers", "H", "", "HTTP headers as JSON text or @file.json for file input")
	RootCmd.PersistentFlags().StringP("query", "q", "", "Query parameters as JSON text or @file.json for file input")
	RootCmd.PersistentFlags().StringP("body", "b", "", "Request body as text or @file for file input")
	RootCmd.PersistentFlags().StringP("body-type", "t", "json", "Body type: json, text, form, js, html, xml, none")
	RootCmd.PersistentFlags().StringP("output", "o", "", "Output file to write response to")
	RootCmd.PersistentFlags().BoolP("verbose", "v", false, "Enable verbose output")
	RootCmd.PersistentFlags().BoolP("progress", "p", true, "Show interactive progress bars during request")
}
