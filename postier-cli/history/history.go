package history

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
	"crypto/rand"
	"encoding/hex"
)

// HistoryEntry represents a single HTTP request entry in the history
type HistoryEntry struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	Method    string    `json:"method"`
	URL       string    `json:"url"`
	Status    int       `json:"status"`
	Duration  string    `json:"duration"`
	Size      int64     `json:"size"`
	Headers   string    `json:"headers,omitempty"`   // JSON string of request headers
	Query     string    `json:"query,omitempty"`     // JSON string of query parameters
	Body      string    `json:"body,omitempty"`      // Request body content
	BodyType  string    `json:"body_type,omitempty"` // Type of the body content
}

// GenerateID generates a random unique ID for history entries
func GenerateID() (string, error) {
	bytes := make([]byte, 8) // 16 characters in hex
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// GetHistoryFilePath returns the path to the history file
func GetHistoryFilePath() (string, error) {
	// Get AppData directory
	appDataDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("failed to get AppData directory: %w", err)
	}

	// Create application directory if it doesn't exist
	appDir := filepath.Join(appDataDir, "com.postier.app")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create application directory: %w", err)
	}

	// Return path to history file
	return filepath.Join(appDir, "history.txt"), nil
}

// AddToHistory adds a new entry to the history file
func AddToHistory(method, url string, status int, duration time.Duration, size int64, headers, query, body, bodyType string) error {
	historyFilePath, err := GetHistoryFilePath()
	if err != nil {
		return err
	}

	// Create new history entry
	id, err := GenerateID()
	if err != nil {
		return err
	}
	entry := HistoryEntry{
		ID:        id,
		Timestamp: time.Now(),
		Method:    method,
		URL:       url,
		Status:    status,
		Duration:  duration.String(),
		Size:      size,
		Headers:   headers,
		Query:     query,
		Body:      body,
		BodyType:  bodyType,
	}

	// Marshal entry to JSON
	entryJSON, err := json.Marshal(entry)
	if err != nil {
		return fmt.Errorf("failed to marshal history entry: %w", err)
	}

	// Open history file in append mode, create if doesn't exist
	file, err := os.OpenFile(historyFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("failed to open history file: %w", err)
	}
	defer file.Close()

	// Append entry to history file
	if _, err := file.WriteString(string(entryJSON) + "\n"); err != nil {
		return fmt.Errorf("failed to write to history file: %w", err)
	}

	return nil
}

// GetHistory returns all entries from the history file
func GetHistory() ([]HistoryEntry, error) {
	historyFilePath, err := GetHistoryFilePath()
	if err != nil {
		return nil, err
	}

	// Check if history file exists
	if _, err := os.Stat(historyFilePath); os.IsNotExist(err) {
		// History file doesn't exist yet, return empty slice
		return []HistoryEntry{}, nil
	}

	// Read history file
	file, err := os.Open(historyFilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open history file: %w", err)
	}
	defer file.Close()

	// Parse history entries line by line
	var entries []HistoryEntry
	decoder := json.NewDecoder(file)
	for decoder.More() {
		var entry HistoryEntry
		if err := decoder.Decode(&entry); err != nil {
			// Skip invalid entries
			continue
		}
		entries = append(entries, entry)
	}

	return entries, nil
}

// GetHistoryEntryByID retrieves a specific history entry by its ID
func GetHistoryEntryByID(id string) (*HistoryEntry, error) {
	entries, err := GetHistory()
	if err != nil {
		return nil, err
	}

	for _, entry := range entries {
		if entry.ID == id {
			return &entry, nil
		}
	}

	return nil, fmt.Errorf("history entry with ID '%s' not found", id)
}
