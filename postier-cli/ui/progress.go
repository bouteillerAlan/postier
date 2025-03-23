package ui

import (
	"fmt"
	"os"
	"time"

	"github.com/schollz/progressbar/v3"
)

// ProgressState represents the current progress of a HTTP request
type ProgressState struct {
	DNSStarted          bool
	DNSCompleted        bool
	ConnectStarted      bool
	ConnectCompleted    bool
	TLSStarted          bool
	TLSCompleted        bool
	RequestSent         bool
	ResponseStarted     bool
	ResponseCompleted   bool
	DNSDuration         time.Duration
	ConnectDuration     time.Duration
	TLSDuration         time.Duration
	ServerProcessDuration time.Duration
	TransferDuration    time.Duration
}

// ProgressUpdate is a channel message for progress updates
type ProgressUpdate struct {
	Phase    string
	State    string
	Duration time.Duration
}

// ProgressDisplay manages the interactive display of request progress
type ProgressDisplay struct {
	Enabled      bool
	UpdateChan   chan ProgressUpdate
	CompleteChan chan bool
	Bars         map[string]*progressbar.ProgressBar
	StartTimes   map[string]time.Time
	State        ProgressState
}

// NewProgressDisplay creates a new progress display
func NewProgressDisplay(enabled bool) *ProgressDisplay {
	return &ProgressDisplay{
		Enabled:      enabled,
		UpdateChan:   make(chan ProgressUpdate, 10),
		CompleteChan: make(chan bool),
		Bars:         make(map[string]*progressbar.ProgressBar),
		StartTimes:   make(map[string]time.Time),
		State:        ProgressState{},
	}
}

// Start begins the progress display
func (pd *ProgressDisplay) Start() {
	if !pd.Enabled {
		return
	}

	// Make sure we start with fresh lines for each progress bar
	fmt.Fprintln(os.Stderr, "")

	// Create progress bars with vertical layout
	pd.Bars["dns"] = createProgressBar("DNS Lookup")
	pd.Bars["connect"] = createProgressBar("TCP Connection")
	pd.Bars["tls"] = createProgressBar("TLS Handshake")
	pd.Bars["server"] = createProgressBar("Server Processing")
	pd.Bars["transfer"] = createProgressBar("Content Transfer")

	// Start monitoring progress updates
	go pd.monitor()
}

// createProgressBar creates a styled progress bar
func createProgressBar(description string) *progressbar.ProgressBar {
	width := 30 // Width of the progress bar
	return progressbar.NewOptions(100,
		progressbar.OptionSetDescription(fmt.Sprintf("%-20s", description)),
		progressbar.OptionSetWidth(width),
		progressbar.OptionShowBytes(false),
		progressbar.OptionSetPredictTime(false),
		progressbar.OptionShowCount(),
		progressbar.OptionSpinnerType(14),
		progressbar.OptionUseANSICodes(true),
		progressbar.OptionEnableColorCodes(true),
		progressbar.OptionSetWriter(os.Stderr),
		progressbar.OptionSetRenderBlankState(true),
		progressbar.OptionOnCompletion(func() { fmt.Fprintf(os.Stderr, "\n") }),
	)
}

// monitor handles progress updates
func (pd *ProgressDisplay) monitor() {
	for {
		select {
		case update := <-pd.UpdateChan:
			pd.handleUpdate(update)
		case <-pd.CompleteChan:
			// Complete any unfinished bars
			pd.completeAll()
			return
		}
	}
}

// handleUpdate processes a progress update
func (pd *ProgressDisplay) handleUpdate(update ProgressUpdate) {
	switch update.Phase {
	case "dns_start":
		pd.StartTimes["dns"] = time.Now()
		pd.State.DNSStarted = true
		pd.Bars["dns"].ChangeMax(100)
		pd.Bars["dns"].Set(10) // Show some initial progress
	
	case "dns_complete":
		pd.State.DNSCompleted = true
		pd.State.DNSDuration = update.Duration
		pd.Bars["dns"].Set(100) // Complete
	
	case "connect_start":
		pd.StartTimes["connect"] = time.Now()
		pd.State.ConnectStarted = true
		pd.Bars["connect"].ChangeMax(100)
		pd.Bars["connect"].Set(10)
	
	case "connect_complete":
		pd.State.ConnectCompleted = true
		pd.State.ConnectDuration = update.Duration
		pd.Bars["connect"].Set(100) // Complete
	
	case "tls_start":
		pd.StartTimes["tls"] = time.Now()
		pd.State.TLSStarted = true
		pd.Bars["tls"].ChangeMax(100)
		pd.Bars["tls"].Set(10)
	
	case "tls_complete":
		pd.State.TLSCompleted = true
		pd.State.TLSDuration = update.Duration
		pd.Bars["tls"].Set(100) // Complete
	
	case "request_sent":
		pd.State.RequestSent = true
		pd.StartTimes["server"] = time.Now()
		pd.Bars["server"].ChangeMax(100)
		pd.Bars["server"].Set(10)
	
	case "response_first_byte":
		pd.State.ResponseStarted = true
		pd.State.ServerProcessDuration = update.Duration
		pd.Bars["server"].Set(100) // Complete server processing
		
		// Start transfer bar
		pd.StartTimes["transfer"] = time.Now()
		pd.Bars["transfer"].ChangeMax(100)
		pd.Bars["transfer"].Set(10)
	
	case "response_complete":
		pd.State.ResponseCompleted = true
		pd.State.TransferDuration = update.Duration
		pd.Bars["transfer"].Set(100) // Complete
	}

	// Simulate progress for active bars
	pd.updateActiveBars()
}

// updateActiveBars updates the progress of active bars
func (pd *ProgressDisplay) updateActiveBars() {
	for phase, startTime := range pd.StartTimes {
		bar, exists := pd.Bars[phase]
		if !exists {
			continue
		}

		// Only update bars that haven't completed
		isComplete := false
		switch phase {
		case "dns":
			isComplete = pd.State.DNSCompleted
		case "connect":
			isComplete = pd.State.ConnectCompleted
		case "tls":
			isComplete = pd.State.TLSCompleted
		case "server":
			isComplete = pd.State.ResponseStarted
		case "transfer":
			isComplete = pd.State.ResponseCompleted
		}

		if !isComplete {
			// Increase progress based on elapsed time (simulate progress)
			elapsed := time.Since(startTime)
			// Calculate a progress percentage that increases non-linearly
			// but never reaches 100% until complete
			percentageFloat := 30 + (70 * (1 - 1/(1+float64(elapsed)/float64(time.Second))))
			if percentageFloat > 95 {
				percentageFloat = 95 // Cap at 95% until explicitly completed
			}
			bar.Set(int(percentageFloat))
		}
	}
}

// completeAll completes all progress bars
func (pd *ProgressDisplay) completeAll() {
	// Add a bit of delay to let users see the final state
	time.Sleep(100 * time.Millisecond)

	// Complete any unfinished bars
	for _, bar := range pd.Bars {
		bar.Finish()
	}

	// Add a summary of durations
	fmt.Fprintln(os.Stderr, "\nHTTP Request Timings:")
	if pd.State.DNSCompleted {
		fmt.Fprintf(os.Stderr, "  DNS Lookup:       %s\n", pd.State.DNSDuration)
	}
	if pd.State.ConnectCompleted {
		fmt.Fprintf(os.Stderr, "  TCP Connection:   %s\n", pd.State.ConnectDuration)
	}
	if pd.State.TLSCompleted {
		fmt.Fprintf(os.Stderr, "  TLS Handshake:    %s\n", pd.State.TLSDuration)
	}
	if pd.State.ResponseStarted {
		fmt.Fprintf(os.Stderr, "  Server Process:   %s\n", pd.State.ServerProcessDuration)
	}
	if pd.State.ResponseCompleted {
		fmt.Fprintf(os.Stderr, "  Content Transfer: %s\n", pd.State.TransferDuration)
	}

	// Add a final newline
	fmt.Fprintln(os.Stderr, "")
}

// Update sends a progress update
func (pd *ProgressDisplay) Update(phase, state string, duration time.Duration) {
	if !pd.Enabled {
		return
	}

	pd.UpdateChan <- ProgressUpdate{
		Phase:    phase,
		State:    state,
		Duration: duration,
	}
}

// Complete signals that the progress display is complete
func (pd *ProgressDisplay) Complete() {
	if !pd.Enabled {
		return
	}

	pd.CompleteChan <- true
}
