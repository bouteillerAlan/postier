package ui

import (
	"fmt"
	"strings"
)

// ASCII art logo
const logoASCII = `    ___       ___       ___       ___       ___       ___       ___   
   /\  \     /\  \     /\  \     /\  \     /\  \     /\  \     /\  \  
  /::\  \   /::\  \   /::\  \    \:\  \   _\:\  \   /::\  \   /::\  \ 
 /::\:\__\ /:/\:\__\ /\:\:\__\   /::\__\ /\/::\__\ /::\:\__\ /::\:\__\
 \/\::/  / \:\/:/  / \:\:\/__/  /:/\/__/ \::/\/__/ \:\:\/  / \;:::/  /
    \/__/   \::/  /   \::/  /   \/__/     \:\__\    \:\/  /   |:\/__/ 
             \/__/     \/__/               \/__/     \/__/     \|__|  `

// HexToRGB converts hex color string to RGB values
func HexToRGB(hex string) (r, g, b int) {
	hex = strings.TrimPrefix(hex, "#")
	fmt.Sscanf(hex, "%02x%02x%02x", &r, &g, &b)
	return r, g, b
}

// GetGradientLogo returns the ASCII art logo with a color gradient
func GetGradientLogo() string {
	// Define the colors for our gradient
	colors := []string{"#EFCF4A", "#D95525", "#CC3B2C", "#9D2C44", "#6F364F"}
	
	lines := strings.Split(logoASCII, "\n")
	var result strings.Builder
	
	for _, line := range lines {
		if len(line) == 0 {
			result.WriteString("\n")
			continue
		}
		
		chars := []rune(line)
		segments := len(chars) / len(colors)
		if segments < 1 {
			segments = 1
		}
		
		for i, char := range chars {
			colorIndex := i / segments
			if colorIndex >= len(colors) {
				colorIndex = len(colors) - 1
			}
			
			hexColor := colors[colorIndex]
			r, g, b := HexToRGB(hexColor)
			
			// Use 256-color ANSI escape sequence directly for true color support
			result.WriteString(fmt.Sprintf("\x1b[38;2;%d;%d;%dm%c\x1b[0m", r, g, b, char))
		}
		result.WriteString("\n")
	}
	
	return result.String()
}
