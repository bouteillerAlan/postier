package ui

import (
	"fmt"
	"math"
	"os"
	"strings"
	"time"

	"github.com/schollz/progressbar/v3"
)

// ProgressState represents the current progress of an HTTP request
type ProgressState struct {
	DNSStarted            bool
	DNSCompleted          bool
	ConnectStarted        bool
	ConnectCompleted      bool
	TLSStarted            bool
	TLSCompleted          bool
	RequestSent           bool
	ResponseStarted       bool
	ResponseCompleted     bool
	DNSDuration           time.Duration
	ConnectDuration       time.Duration
	TLSDuration           time.Duration
	ServerProcessDuration time.Duration
	TransferDuration      time.Duration
	StartTime             time.Time
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
	Bar          *progressbar.ProgressBar
	PhaseColors  map[string]string
	PhaseWidths  map[string]int64
	StartTimes   map[string]time.Time
	State        ProgressState
	TotalWidth   int64
	CustomRender func(state ProgressState) string
	RealtimeBars bool
	firstDisplay bool
}

// Constants for progress bar
const (
	TotalBarWidth = 250
	MsPerBlock    = 20 * time.Millisecond
)

// NewProgressDisplay creates a new progress display
func NewProgressDisplay(enabled bool) *ProgressDisplay {
	phaseColors := map[string]string{
		"dns":      "\033[38;5;39m",  // Blue
		"connect":  "\033[38;5;48m",  // Blue-green
		"tls":      "\033[38;5;118m", // Green
		"server":   "\033[38;5;226m", // Yellow
		"transfer": "\033[38;5;208m", // Orange
	}

	return &ProgressDisplay{
		Enabled:      enabled,
		UpdateChan:   make(chan ProgressUpdate),
		CompleteChan: make(chan bool),
		PhaseColors:  phaseColors,
		PhaseWidths:  make(map[string]int64),
		StartTimes:   make(map[string]time.Time),
		State:        ProgressState{StartTime: time.Now()},
		TotalWidth:   TotalBarWidth,
		RealtimeBars: true,
		firstDisplay: true,
	}
}

// Start begins the progress display
func (pd *ProgressDisplay) Start() {
	if !pd.Enabled {
		return
	}

	pd.Bar = progressbar.NewOptions(100,
		progressbar.OptionSetDescription("HTTP Request Progress"),
		progressbar.OptionSetWidth(60),
		progressbar.OptionShowBytes(false),
		progressbar.OptionSetPredictTime(false),
		progressbar.OptionShowCount(),
		progressbar.OptionUseANSICodes(true),
		progressbar.OptionEnableColorCodes(true),
		progressbar.OptionSetWriter(os.Stdout),
		progressbar.OptionSetRenderBlankState(true),
		progressbar.OptionSetTheme(progressbar.Theme{
			BarStart: "|",
			BarEnd:   "|",
		}),
		progressbar.OptionFullWidth(),
	)

	go pd.monitor()
}

// getCurrentPhaseDescription returns the current active phase description
func (pd *ProgressDisplay) getCurrentPhaseDescription() string {
	phases := []struct {
		state    bool
		desc     string
		colorKey string
	}{
		{pd.State.ResponseCompleted, "Complete", "transfer"},
		{pd.State.ResponseStarted, "Content Transfer", "transfer"},
		{pd.State.RequestSent, "Server Processing", "server"},
		{pd.State.TLSStarted, "TLS Handshake", "tls"},
		{pd.State.ConnectStarted, "TCP Connection", "connect"},
		{pd.State.DNSStarted, "DNS Lookup", "dns"},
	}

	for _, phase := range phases {
		if phase.state {
			return fmt.Sprintf("[%s]%-17s\033[0m", pd.PhaseColors[phase.colorKey], phase.desc)
		}
	}
	return "[Waiting...]"
}

// renderProgressBar custom renders the progress bar with colored segments
func (pd *ProgressDisplay) renderProgressBar() string {
	var sb strings.Builder
	sb.WriteString("[")

	total := int64(0)
	phases := []string{"dns", "connect", "tls", "server", "transfer"}

	for _, phase := range phases {
		if width, exists := pd.PhaseWidths[phase]; exists && width > 0 {
			color := pd.PhaseColors[phase]
			segment := strings.Repeat("█", int(width))
			sb.WriteString(fmt.Sprintf("%s%s\033[0m", color, segment))
			total += width
		}
	}

	if total < pd.TotalWidth {
		sb.WriteString(strings.Repeat(" ", int(pd.TotalWidth-total)))
	}

	sb.WriteString("]")
	return sb.String()
}

// monitor handles progress updates
func (pd *ProgressDisplay) monitor() {
	updateBar := func() {
		desc := pd.getCurrentPhaseDescription()
		pd.Bar.Describe(desc)

		totalDuration := time.Since(pd.State.StartTime).Milliseconds()
		if totalDuration == 0 {
			totalDuration = 1
		}

		updatePhaseWidths(pd, totalDuration)
		displayRealtimeBars(pd)
		pd.Bar.Set(calculateTotalPercent(pd))
	}

	for {
		select {
		case update := <-pd.UpdateChan:
			pd.handleUpdate(update)
			updateBar()
		case <-pd.CompleteChan:
			clearRealtimeBars(pd)
			pd.completeAll()
			return
		case <-time.After(10 * time.Millisecond):
			updateBar()
		}
	}
}

// updatePhaseWidths updates the widths of each phase based on their durations
func updatePhaseWidths(pd *ProgressDisplay, totalDuration int64) {
	if pd.State.DNSCompleted {
		pd.PhaseWidths["dns"] = pd.State.DNSDuration.Milliseconds() * pd.TotalWidth / totalDuration
	}
	if pd.State.ConnectCompleted {
		pd.PhaseWidths["connect"] = pd.State.ConnectDuration.Milliseconds() * pd.TotalWidth / totalDuration
	}
	if pd.State.TLSCompleted {
		pd.PhaseWidths["tls"] = pd.State.TLSDuration.Milliseconds() * pd.TotalWidth / totalDuration
	}
	if pd.State.ResponseStarted {
		pd.PhaseWidths["server"] = pd.State.ServerProcessDuration.Milliseconds() * pd.TotalWidth / totalDuration
	}
	if pd.State.ResponseCompleted {
		pd.PhaseWidths["transfer"] = pd.State.TransferDuration.Milliseconds() * pd.TotalWidth / totalDuration
	}
}

// displayRealtimeBars displays real-time progress bars if enabled
func displayRealtimeBars(pd *ProgressDisplay) {
	if !pd.RealtimeBars {
		return
	}

	clearPreviousLines(pd)
	cumulativeDuration := time.Duration(0)
	phases := []struct {
		started    bool
		completed  bool
		colorKey   string
		desc       string
		durationFn func() time.Duration
	}{
		{pd.State.DNSStarted, pd.State.DNSCompleted, "dns", "DNS Lookup", func() time.Duration {
			if pd.State.DNSCompleted {
				return pd.State.DNSDuration
			}
			return time.Since(pd.StartTimes["dns"])
		}},
		{pd.State.ConnectStarted, pd.State.ConnectCompleted, "connect", "TCP Connection", func() time.Duration {
			if pd.State.ConnectCompleted {
				return pd.State.ConnectDuration
			}
			return time.Since(pd.StartTimes["connect"])
		}},
		{pd.State.TLSStarted, pd.State.TLSCompleted, "tls", "TLS Handshake", func() time.Duration {
			if pd.State.TLSCompleted {
				return pd.State.TLSDuration
			}
			return time.Since(pd.StartTimes["tls"])
		}},
		{pd.State.RequestSent, pd.State.ResponseStarted, "server", "Server Process", func() time.Duration {
			if pd.State.ResponseStarted {
				return pd.State.ServerProcessDuration
			}
			return time.Since(pd.StartTimes["server"])
		}},
		{pd.State.ResponseStarted, pd.State.ResponseCompleted, "transfer", "Content Transfer", func() time.Duration {
			if pd.State.ResponseCompleted {
				return pd.State.TransferDuration
			}
			return time.Since(pd.StartTimes["transfer"])
		}},
	}

	for _, phase := range phases {
		if phase.started {
			duration := phase.durationFn()
			blocks := int(math.Ceil(float64(duration) / float64(MsPerBlock)))
			if blocks < 1 {
				blocks = 1
			}
			prevBlocks := int(math.Ceil(float64(cumulativeDuration) / float64(MsPerBlock)))
			fmt.Fprintf(os.Stdout, "  %s%s\033[0m:           %12s %s%s%s█%s\033[0m\n",
				pd.PhaseColors[phase.colorKey], phase.desc, duration,
				"\033[38;5;240m", strings.Repeat(" ", prevBlocks),
				pd.PhaseColors[phase.colorKey], strings.Repeat("█", blocks-1))
			if phase.completed {
				cumulativeDuration += duration
			}
		}
	}
}

// clearPreviousLines clears the previous lines in the terminal
func clearPreviousLines(pd *ProgressDisplay) {
	if !pd.firstDisplay {
		activeLines := countActiveLines(pd)
		for i := 0; i < activeLines; i++ {
			fmt.Fprint(os.Stdout, "\033[A\033[2K")
		}
	} else {
		pd.firstDisplay = false
	}
}

// countActiveLines counts the number of active lines for real-time display
func countActiveLines(pd *ProgressDisplay) int {
	activeLines := 0
	if pd.State.DNSStarted {
		activeLines++
	}
	if pd.State.ConnectStarted {
		activeLines++
	}
	if pd.State.TLSStarted {
		activeLines++
	}
	if pd.State.RequestSent {
		activeLines++
	}
	if pd.State.ResponseStarted {
		activeLines++
	}
	return activeLines
}

// clearRealtimeBars clears the real-time progress bars from the terminal display
func clearRealtimeBars(pd *ProgressDisplay) {
	if pd.RealtimeBars {
		activeLines := countActiveLines(pd)
		for i := 0; i < activeLines; i++ {
			fmt.Fprint(os.Stdout, "\033[A\033[2K")
		}
	}
}

// calculateTotalPercent calculates the total progress percentage
func calculateTotalPercent(pd *ProgressDisplay) int {
	totalPercent := 0
	if pd.State.ResponseCompleted {
		totalPercent = 100
	} else if pd.State.ResponseStarted {
		totalPercent = 80 + int((time.Since(pd.StartTimes["transfer"]).Seconds()/5)*20)
		if totalPercent > 95 {
			totalPercent = 95
		}
	} else if pd.State.RequestSent {
		totalPercent = 60 + int((time.Since(pd.StartTimes["server"]).Seconds()/5)*20)
		if totalPercent > 80 {
			totalPercent = 80
		}
	} else if pd.State.TLSStarted {
		totalPercent = 40
		if pd.State.TLSCompleted {
			totalPercent = 60
		}
	} else if pd.State.ConnectStarted {
		totalPercent = 20
		if pd.State.ConnectCompleted {
			totalPercent = 40
		}
	} else if pd.State.DNSStarted {
		totalPercent = 10
		if pd.State.DNSCompleted {
			totalPercent = 20
		}
	}
	return totalPercent
}

// handleUpdate processes a progress update
func (pd *ProgressDisplay) handleUpdate(update ProgressUpdate) {
	switch update.Phase {
	case "dns_start":
		pd.StartTimes["dns"] = time.Now()
		pd.State.DNSStarted = true
	case "dns_complete":
		pd.State.DNSCompleted = true
		pd.State.DNSDuration = update.Duration
	case "connect_start":
		pd.StartTimes["connect"] = time.Now()
		pd.State.ConnectStarted = true
	case "connect_complete":
		pd.State.ConnectCompleted = true
		pd.State.ConnectDuration = update.Duration
	case "tls_start":
		pd.StartTimes["tls"] = time.Now()
		pd.State.TLSStarted = true
	case "tls_complete":
		pd.State.TLSCompleted = true
		pd.State.TLSDuration = update.Duration
	case "request_sent":
		pd.State.RequestSent = true
		pd.StartTimes["server"] = time.Now()
	case "response_first_byte":
		pd.State.ResponseStarted = true
		pd.State.ServerProcessDuration = update.Duration
		pd.StartTimes["transfer"] = time.Now()
	case "response_complete":
		pd.State.ResponseCompleted = true
		pd.State.TransferDuration = update.Duration
	}
}

// completeAll completes the progress display
func (pd *ProgressDisplay) completeAll() {
	pd.Bar.Finish()
	fmt.Fprintln(os.Stdout, "\nHTTP Request Timings:")

	totalDuration := pd.State.DNSDuration + pd.State.ConnectDuration + pd.State.TLSDuration + pd.State.ServerProcessDuration + pd.State.TransferDuration

	if totalDuration == 0 {
		totalDuration = time.Millisecond
	}

	printPhaseSummary(pd, "DNS Lookup", pd.State.DNSDuration, "dns")
	printPhaseSummary(pd, "TCP Connection", pd.State.ConnectDuration, "connect")
	printPhaseSummary(pd, "TLS Handshake", pd.State.TLSDuration, "tls")
	printPhaseSummary(pd, "Server Process", pd.State.ServerProcessDuration, "server")
	printPhaseSummary(pd, "Content Transfer", pd.State.TransferDuration, "transfer")

	fmt.Fprintf(os.Stdout, "  %sTotal Duration\033[0m:      %12s\n",
		"\033[1;36m", totalDuration)
}

// printPhaseSummary prints the summary for each phase
func printPhaseSummary(pd *ProgressDisplay, desc string, duration time.Duration, colorKey string) {
	if duration > 0 {
		blocks := int(math.Ceil(float64(duration) / float64(MsPerBlock)))
		if blocks < 1 {
			blocks = 1
		}
		prevBlocks := int(math.Ceil(float64(pd.getPreviousDuration(colorKey)) / float64(MsPerBlock)))
		fmt.Fprintf(os.Stdout, "  %s%s\033[0m:           %12s %s%s%s\u2588%s\033[0m\n",
			pd.PhaseColors[colorKey], desc, duration,
			"\033[38;5;240m", strings.Repeat(" ", prevBlocks),
			pd.PhaseColors[colorKey], strings.Repeat("\u2588", blocks-1))
	}
}

// getPreviousDuration calculates the cumulative duration of previous phases
func (pd *ProgressDisplay) getPreviousDuration(currentPhase string) time.Duration {
	var cumulativeDuration time.Duration
	phases := []struct {
		key      string
		duration time.Duration
	}{
		{"dns", pd.State.DNSDuration},
		{"connect", pd.State.ConnectDuration},
		{"tls", pd.State.TLSDuration},
		{"server", pd.State.ServerProcessDuration},
		{"transfer", pd.State.TransferDuration},
	}

	for _, phase := range phases {
		if phase.key == currentPhase {
			break
		}
		cumulativeDuration += phase.duration
	}
	return cumulativeDuration
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

	if pd.RealtimeBars {
		clearPreviousLines(pd)
		displayPhase(pd, phase, state, duration)
	}
}

// displayPhase displays the current phase
func displayPhase(pd *ProgressDisplay, phase, state string, duration time.Duration) {
	phases := map[string]struct {
		desc       string
		colorKey   string
		condition  func() bool
		durationFn func() time.Duration
	}{
		"dns":      {"DNS Lookup", "dns", func() bool { return state == "complete" }, func() time.Duration { return duration }},
		"connect":  {"TCP Connection", "connect", func() bool { return state == "complete" }, func() time.Duration { return duration }},
		"tls":      {"TLS Handshake", "tls", func() bool { return state == "complete" }, func() time.Duration { return duration }},
		"server":   {"Server Process", "server", func() bool { return state == "response_first_byte" }, func() time.Duration { return duration }},
		"transfer": {"Content Transfer", "transfer", func() bool { return state == "response_complete" }, func() time.Duration { return duration }},
	}

	if phaseInfo, exists := phases[phase]; exists && phaseInfo.condition() {
		blocks := int(math.Ceil(float64(phaseInfo.durationFn()) / float64(MsPerBlock)))
		if blocks < 1 {
			blocks = 1
		}
		prevDuration := pd.getPreviousDuration(phaseInfo.colorKey)
		prevBlocks := int(math.Ceil(float64(prevDuration) / float64(MsPerBlock)))
		fmt.Fprintf(os.Stdout, "  %s%s\033[0m:           %12s %s%s%s\u2588%s\033[0m\r",
			pd.PhaseColors[phaseInfo.colorKey], phaseInfo.desc, phaseInfo.durationFn(),
			"\033[38;5;240m", strings.Repeat(" ", prevBlocks),
			pd.PhaseColors[phaseInfo.colorKey], strings.Repeat("\u2588", blocks-1))
	}
}

// Complete signals that the progress display is complete
func (pd *ProgressDisplay) Complete() {
	if !pd.Enabled {
		return
	}

	pd.CompleteChan <- true
}
