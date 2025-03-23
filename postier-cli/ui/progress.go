package ui

import (
	"fmt"
	"math"
	"os"
	"strings"
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
	StartTime           time.Time
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
}

// NewProgressDisplay creates a new progress display
func NewProgressDisplay(enabled bool) *ProgressDisplay {
	// Initialize with an empty progressbar, will be customized in Start
	// Define global color palette
	phaseColors := map[string]string{
		"dns":      "\033[38;5;39m",  // Bleu
		"connect":  "\033[38;5;48m",  // Vert-bleu
		"tls":      "\033[38;5;118m", // Vert
		"server":   "\033[38;5;226m", // Jaune
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
		TotalWidth:   100, // La largeur totale de la barre
		RealtimeBars: true, // Activer par défaut l'affichage en temps réel
	}
}

// Start begins the progress display
func (pd *ProgressDisplay) Start() {
	if !pd.Enabled {
		return
	}

	// Créer une barre de progression unique
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
			BarStart:  "|",
			BarEnd:    "|",
		}),
		progressbar.OptionFullWidth(),
	)

	// Start monitoring progress updates
	go pd.monitor()
}

// getCurrentPhaseDescription returns the current active phase description
func (pd *ProgressDisplay) getCurrentPhaseDescription() string {
	var current string = "Waiting..."
	var color string = "\033[0m"

	if pd.State.ResponseCompleted {
		current = "Complete"
		color = pd.PhaseColors["transfer"]
	} else if pd.State.ResponseStarted {
		current = "Content Transfer"
		color = pd.PhaseColors["transfer"]
	} else if pd.State.RequestSent {
		current = "Server Processing"
		color = pd.PhaseColors["server"]
	} else if pd.State.TLSStarted {
		current = "TLS Handshake"
		color = pd.PhaseColors["tls"]
	} else if pd.State.ConnectStarted {
		current = "TCP Connection"
		color = pd.PhaseColors["connect"]
	} else if pd.State.DNSStarted {
		current = "DNS Lookup"
		color = pd.PhaseColors["dns"]
	}

	return fmt.Sprintf("[%s]%-17s\033[0m", color, current)
}

// renderProgressBar custom renders the progress bar with colored segments
func (pd *ProgressDisplay) renderProgressBar() string {
	var sb strings.Builder

	// Afficher un segment pour chaque phase
	sb.WriteString("[")
	
	total := int64(0)
	phases := []string{"dns", "connect", "tls", "server", "transfer"}
	
	for _, phase := range phases {
		width, exists := pd.PhaseWidths[phase]
		if !exists || width == 0 {
			continue
		}
		
		color := pd.PhaseColors[phase]
		segment := strings.Repeat("█", int(width)) // Utiliser le caractère bloc complet
		sb.WriteString(fmt.Sprintf("%s%s\033[0m", color, segment))
		total += width
	}
	
	// Ajouter des espaces pour compléter la barre
	if total < pd.TotalWidth {
		sb.WriteString(strings.Repeat(" ", int(pd.TotalWidth-total)))
	}
	
	sb.WriteString("]")
	return sb.String()
}

// monitor handles progress updates
func (pd *ProgressDisplay) monitor() {
	updateBar := func() {
		// Mettre à jour la description de la barre avec la phase actuelle
		desc := pd.getCurrentPhaseDescription()
		pd.Bar.Describe(desc)

		// Calculer la durée totale actuelle
		totalDuration := time.Since(pd.State.StartTime).Milliseconds()
		if totalDuration == 0 {
			totalDuration = 1 // Éviter la division par zéro
		}
		
		// Mettre à jour les largeurs de segment en fonction des durées
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
		
		// Afficher les barres en temps réel si activé
		if pd.RealtimeBars {
			// Chaque bloc représente 20ms
			msPerBlock := time.Duration(20 * time.Millisecond)
			
			// Du00e9terminer combien de lignes nous allons afficher pour pouvoir les effacer ensuite
			activeLines := 0
			if pd.State.DNSStarted { activeLines++ }
			if pd.State.ConnectStarted { activeLines++ }
			if pd.State.TLSStarted { activeLines++ }
			if pd.State.RequestSent { activeLines++ }
			if pd.State.ResponseStarted { activeLines++ }
			
			// Effacer les lignes pru00e9cu00e9dentes - \033[A monte d'une ligne, \033[2K efface la ligne
			for i := 0; i < activeLines; i++ {
				fmt.Fprint(os.Stdout, "\033[A\033[2K")
			}
			
			// Variable pour garder la trace des duru00e9es cumulatives
			var cumulativeDuration time.Duration = 0
            
			// Affichage en cours pour DNS si du00e9marru00e9 mais pas terminu00e9
			if pd.State.DNSStarted {
				var dnsDuration time.Duration
				if pd.State.DNSCompleted {
					dnsDuration = pd.State.DNSDuration
				} else {
					dnsDuration = time.Since(pd.StartTimes["dns"])
				}
				
				dnsBlocks := int(math.Ceil(float64(dnsDuration) / float64(msPerBlock)))
				if dnsBlocks < 1 {
					dnsBlocks = 1
				}
				
				fmt.Fprintf(os.Stdout, "  %sDNS Lookup\033[0m:           %12s %s█%s\033[0m\n", 
					pd.PhaseColors["dns"],
					dnsDuration, 
					pd.PhaseColors["dns"],
					strings.Repeat("█", dnsBlocks-1))
				
				if pd.State.DNSCompleted {
					cumulativeDuration += dnsDuration
				}
			}
			
			// Affichage en cours pour Connect si du00e9marru00e9
			if pd.State.ConnectStarted {
				var connectDuration time.Duration
				if pd.State.ConnectCompleted {
					connectDuration = pd.State.ConnectDuration
				} else {
					connectDuration = time.Since(pd.StartTimes["connect"])
				}
				
				connectBlocks := int(math.Ceil(float64(connectDuration) / float64(msPerBlock)))
				if connectBlocks < 1 {
					connectBlocks = 1
				}
				
				prevBlocks := int(math.Ceil(float64(cumulativeDuration) / float64(msPerBlock)))
                
				fmt.Fprintf(os.Stdout, "  %sTCP Connection\033[0m:       %12s %s%s%s█%s\033[0m\n", 
					pd.PhaseColors["connect"],
					connectDuration,
					"\033[38;5;240m", // Couleur grise pour les phases pru00e9cu00e9dentes
					strings.Repeat(" ", prevBlocks),
					pd.PhaseColors["connect"],
					strings.Repeat("█", connectBlocks-1))
                
				if pd.State.ConnectCompleted {
					cumulativeDuration += connectDuration
				}
			}
            
			// Affichage en cours pour TLS si du00e9marru00e9
			if pd.State.TLSStarted {
				var tlsDuration time.Duration
				if pd.State.TLSCompleted {
					tlsDuration = pd.State.TLSDuration
				} else {
					tlsDuration = time.Since(pd.StartTimes["tls"])
				}
				
				tlsBlocks := int(math.Ceil(float64(tlsDuration) / float64(msPerBlock)))
				if tlsBlocks < 1 {
					tlsBlocks = 1
				}
                
				prevBlocks := int(math.Ceil(float64(cumulativeDuration) / float64(msPerBlock)))
                
				fmt.Fprintf(os.Stdout, "  %sTLS Handshake\033[0m:        %12s %s%s%s█%s\033[0m\n", 
					pd.PhaseColors["tls"],
					tlsDuration,
					"\033[38;5;240m", // Couleur grise pour les phases pru00e9cu00e9dentes
					strings.Repeat(" ", prevBlocks),
					pd.PhaseColors["tls"],
					strings.Repeat("█", tlsBlocks-1))
                
				if pd.State.TLSCompleted {
					cumulativeDuration += tlsDuration
				}
			}
            
			// Affichage en cours pour Server si du00e9marru00e9
			if pd.State.RequestSent {
				var serverDuration time.Duration
				if pd.State.ResponseStarted {
					serverDuration = pd.State.ServerProcessDuration
				} else {
					serverDuration = time.Since(pd.StartTimes["server"])
				}
				
				serverBlocks := int(math.Ceil(float64(serverDuration) / float64(msPerBlock)))
				if serverBlocks < 1 {
					serverBlocks = 1
				}
                
				prevBlocks := int(math.Ceil(float64(cumulativeDuration) / float64(msPerBlock)))
                
				fmt.Fprintf(os.Stdout, "  %sServer Process\033[0m:       %12s %s%s%s█%s\033[0m\n", 
					pd.PhaseColors["server"],
					serverDuration,
					"\033[38;5;240m", // Couleur grise pour les phases pru00e9cu00e9dentes
					strings.Repeat(" ", prevBlocks),
					pd.PhaseColors["server"],
					strings.Repeat("█", serverBlocks-1))
                
				if pd.State.ResponseStarted {
					cumulativeDuration += serverDuration
				}
			}
            
			// Affichage en cours pour Transfer si du00e9marru00e9
			if pd.State.ResponseStarted {
				var transferDuration time.Duration
				if pd.State.ResponseCompleted {
					transferDuration = pd.State.TransferDuration
				} else {
					transferDuration = time.Since(pd.StartTimes["transfer"])
				}
				
				transferBlocks := int(math.Ceil(float64(transferDuration) / float64(msPerBlock)))
				if transferBlocks < 1 {
					transferBlocks = 1
				}
                
				prevBlocks := int(math.Ceil(float64(cumulativeDuration) / float64(msPerBlock)))
                
				fmt.Fprintf(os.Stdout, "  %sContent Transfer\033[0m:     %12s %s%s%s█%s\033[0m\n", 
					pd.PhaseColors["transfer"],
					transferDuration,
					"\033[38;5;240m", // Couleur grise pour les phases pru00e9cu00e9dentes
					strings.Repeat(" ", prevBlocks),
					pd.PhaseColors["transfer"],
					strings.Repeat("█", transferBlocks-1))
			}
		}
		
		// Calculer le pourcentage de progression total
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
		
		pd.Bar.Set(totalPercent)
	}

	for {
		select {
		case update := <-pd.UpdateChan:
			pd.handleUpdate(update)
			updateBar()
		case <-pd.CompleteChan:
			// Complete the progress display
			pd.completeAll()
			return
		case <-time.After(10 * time.Millisecond):
			// Update periodically for smooth animation
			updateBar()
		}
	}
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
	// Set progress to 100%
	pd.Bar.Finish()

	// Add a summary of durations
	fmt.Fprintln(os.Stdout, "\nHTTP Request Timings:")
	
	totalDuration := pd.State.DNSDuration + pd.State.ConnectDuration + 
		pd.State.TLSDuration + pd.State.ServerProcessDuration + pd.State.TransferDuration
	
	if totalDuration == 0 {
		totalDuration = time.Millisecond // Éviter la division par zéro
	}
	
	// Chaque bloc représente 20ms
	msPerBlock := time.Duration(20 * time.Millisecond)

	// Garder la trace des durées cumulées précédentes pour l'effet waterfall
	var cumulativeDuration time.Duration = 0
	
	if pd.State.DNSCompleted {
		// Calculer le nombre de blocs (1 bloc = 20ms)
		dnsBlocks := int(math.Ceil(float64(pd.State.DNSDuration) / float64(msPerBlock)))
		if dnsBlocks < 1 {
			dnsBlocks = 1
		}
		
		// DNS est la première phase, pas de phases précédentes
		fmt.Fprintf(os.Stdout, "  %sDNS Lookup\033[0m:           %12s %s█%s\033[0m\n", 
			pd.PhaseColors["dns"],
			pd.State.DNSDuration, 
			pd.PhaseColors["dns"],
			strings.Repeat("█", dnsBlocks-1))

		cumulativeDuration += pd.State.DNSDuration
	}
	
	if pd.State.ConnectCompleted {
		// Calculer le nombre de blocs (1 bloc = 20ms)
		connectBlocks := int(math.Ceil(float64(pd.State.ConnectDuration) / float64(msPerBlock)))
		if connectBlocks < 1 {
			connectBlocks = 1
		}
		
		// Calculer le nombre de blocs pour les phases précédentes
		prevBlocks := int(math.Ceil(float64(cumulativeDuration) / float64(msPerBlock)))
		
		fmt.Fprintf(os.Stdout, "  %sTCP Connection\033[0m:       %12s %s%s%s█%s\033[0m\n", 
			pd.PhaseColors["connect"],
			pd.State.ConnectDuration,
			"\033[38;5;240m", // Couleur grise pour les phases précédentes
			strings.Repeat(" ", prevBlocks),
			pd.PhaseColors["connect"],
			strings.Repeat("█", connectBlocks-1))

		cumulativeDuration += pd.State.ConnectDuration
	}
	
	if pd.State.TLSCompleted {
		// Calculer le nombre de blocs (1 bloc = 20ms)
		tlsBlocks := int(math.Ceil(float64(pd.State.TLSDuration) / float64(msPerBlock)))
		if tlsBlocks < 1 {
			tlsBlocks = 1
		}
		
		// Calculer le nombre de blocs pour les phases précédentes
		prevBlocks := int(math.Ceil(float64(cumulativeDuration) / float64(msPerBlock)))
		
		fmt.Fprintf(os.Stdout, "  %sTLS Handshake\033[0m:        %12s %s%s%s█%s\033[0m\n", 
			pd.PhaseColors["tls"],
			pd.State.TLSDuration,
			"\033[38;5;240m", // Couleur grise pour les phases précédentes
			strings.Repeat(" ", prevBlocks),
			pd.PhaseColors["tls"],
			strings.Repeat("█", tlsBlocks-1))

		cumulativeDuration += pd.State.TLSDuration
	}
	
	if pd.State.ResponseStarted {
		// Calculer le nombre de blocs (1 bloc = 20ms)
		serverBlocks := int(math.Ceil(float64(pd.State.ServerProcessDuration) / float64(msPerBlock)))
		if serverBlocks < 1 {
			serverBlocks = 1
		}
		
		// Calculer le nombre de blocs pour les phases précédentes
		prevBlocks := int(math.Ceil(float64(cumulativeDuration) / float64(msPerBlock)))
		
		fmt.Fprintf(os.Stdout, "  %sServer Process\033[0m:       %12s %s%s%s█%s\033[0m\n", 
			pd.PhaseColors["server"],
			pd.State.ServerProcessDuration,
			"\033[38;5;240m", // Couleur grise pour les phases précédentes
			strings.Repeat(" ", prevBlocks),
			pd.PhaseColors["server"],
			strings.Repeat("█", serverBlocks-1))

		cumulativeDuration += pd.State.ServerProcessDuration
	}
	
	if pd.State.ResponseCompleted {
		// Calculer le nombre de blocs (1 bloc = 20ms)
		transferBlocks := int(math.Ceil(float64(pd.State.TransferDuration) / float64(msPerBlock)))
		if transferBlocks < 1 {
			transferBlocks = 1
		}
		
		// Calculer le nombre de blocs pour les phases précédentes
		prevBlocks := int(math.Ceil(float64(cumulativeDuration) / float64(msPerBlock)))
		
		fmt.Fprintf(os.Stdout, "  %sContent Transfer\033[0m:     %12s %s%s%s\u2588%s\033[0m\n", 
			pd.PhaseColors["transfer"],
			pd.State.TransferDuration,
			"\033[38;5;240m", // Couleur grise pour les phases précédentes
			strings.Repeat(" ", prevBlocks),
			pd.PhaseColors["transfer"],
			strings.Repeat("\u2588", transferBlocks-1))
	}
	
	// Afficher la durée totale
	fmt.Fprintf(os.Stdout, "  \033[37mTotal Duration\033[0m:        %12s\n", totalDuration)

	// Add a final newline and synchronization point
	fmt.Fprintln(os.Stdout, "")
	// Force flush Stdout to ensure all timing info is displayed before HTTP status
	time.Sleep(100 * time.Millisecond)
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

	// Afficher les barres en temps réel si activé
	if pd.RealtimeBars {
		// Chaque bloc représente 20ms
		msPerBlock := time.Duration(20 * time.Millisecond)
		
		// Du00e9terminer combien de lignes nous allons afficher pour pouvoir les effacer ensuite
		activeLines := 0
		if pd.State.DNSStarted { activeLines++ }
		if pd.State.ConnectStarted { activeLines++ }
		if pd.State.TLSStarted { activeLines++ }
		if pd.State.RequestSent { activeLines++ }
		if pd.State.ResponseStarted { activeLines++ }
		
		// Effacer les lignes pru00e9cu00e9dentes - \033[A monte d'une ligne, \033[2K efface la ligne
		for i := 0; i < activeLines; i++ {
			fmt.Fprint(os.Stdout, "\033[A\033[2K")
		}
		
		// Afficher la phase courrante
		switch phase {
		case "dns":
			if state == "complete" {
				dnsBlocks := int(math.Ceil(float64(duration) / float64(msPerBlock)))
				if dnsBlocks < 1 {
					dnsBlocks = 1
				}
				fmt.Fprintf(os.Stdout, "  %sDNS Lookup\033[0m:           %12s %s\u2588%s\033[0m\r", 
					pd.PhaseColors["dns"],
					duration, 
					pd.PhaseColors["dns"],
					strings.Repeat("\u2588", dnsBlocks-1))
			}
		case "connect":
			if state == "complete" {
				// Calculer les blocs pour la phase DNS pru00e9cu00e9dente
				var prevDuration time.Duration = 0
				if pd.State.DNSCompleted {
					prevDuration = pd.State.DNSDuration
				}
				prevBlocks := int(math.Ceil(float64(prevDuration) / float64(msPerBlock)))
				
				// Calculer les blocs pour la phase courrante
				connectBlocks := int(math.Ceil(float64(duration) / float64(msPerBlock)))
				if connectBlocks < 1 {
					connectBlocks = 1
				}
				
				fmt.Fprintf(os.Stdout, "  %sTCP Connection\033[0m:       %12s %s%s%s\u2588%s\033[0m\r", 
					pd.PhaseColors["connect"],
					duration,
					"\033[38;5;240m", // Couleur grise pour les phases pru00e9cu00e9dentes
					strings.Repeat(" ", prevBlocks),
					pd.PhaseColors["connect"],
					strings.Repeat("\u2588", connectBlocks-1))
			}
		case "tls":
			if state == "complete" {
				// Calculer les blocs pour les phases pru00e9cu00e9dentes
				var prevDuration time.Duration = 0
				if pd.State.DNSCompleted {
					prevDuration += pd.State.DNSDuration
				}
				if pd.State.ConnectCompleted {
					prevDuration += pd.State.ConnectDuration
				}
				prevBlocks := int(math.Ceil(float64(prevDuration) / float64(msPerBlock)))
				
				// Calculer les blocs pour la phase courrante
				tlsBlocks := int(math.Ceil(float64(duration) / float64(msPerBlock)))
				if tlsBlocks < 1 {
					tlsBlocks = 1
				}
				
				fmt.Fprintf(os.Stdout, "  %sTLS Handshake\033[0m:        %12s %s%s%s\u2588%s\033[0m\r", 
					pd.PhaseColors["tls"],
					duration,
					"\033[38;5;240m", // Couleur grise pour les phases pru00e9cu00e9dentes
					strings.Repeat(" ", prevBlocks),
					pd.PhaseColors["tls"],
					strings.Repeat("\u2588", tlsBlocks-1))
			}
		case "server":
			if state == "response_first_byte" {
				// Calculer les blocs pour les phases pru00e9cu00e9dentes
				var prevDuration time.Duration = 0
				if pd.State.DNSCompleted {
					prevDuration += pd.State.DNSDuration
				}
				if pd.State.ConnectCompleted {
					prevDuration += pd.State.ConnectDuration
				}
				if pd.State.TLSCompleted {
					prevDuration += pd.State.TLSDuration
				}
				prevBlocks := int(math.Ceil(float64(prevDuration) / float64(msPerBlock)))
				
				// Calculer les blocs pour la phase courrante
				serverBlocks := int(math.Ceil(float64(duration) / float64(msPerBlock)))
				if serverBlocks < 1 {
					serverBlocks = 1
				}
				
				fmt.Fprintf(os.Stdout, "  %sServer Process\033[0m:       %12s %s%s%s\u2588%s\033[0m\r", 
					pd.PhaseColors["server"],
					duration,
					"\033[38;5;240m", // Couleur grise pour les phases pru00e9cu00e9dentes
					strings.Repeat(" ", prevBlocks),
					pd.PhaseColors["server"],
					strings.Repeat("\u2588", serverBlocks-1))
			}
		case "transfer":
			if state == "response_complete" {
				// Calculer les blocs pour les phases pru00e9cu00e9dentes
				var prevDuration time.Duration = 0
				if pd.State.DNSCompleted {
					prevDuration += pd.State.DNSDuration
				}
				if pd.State.ConnectCompleted {
					prevDuration += pd.State.ConnectDuration
				}
				if pd.State.TLSCompleted {
					prevDuration += pd.State.TLSDuration
				}
				if pd.State.ResponseStarted {
					prevDuration += pd.State.ServerProcessDuration
				}
				prevBlocks := int(math.Ceil(float64(prevDuration) / float64(msPerBlock)))
				
				// Calculer les blocs pour la phase courrante
				transferBlocks := int(math.Ceil(float64(duration) / float64(msPerBlock)))
				if transferBlocks < 1 {
					transferBlocks = 1
				}
				
				fmt.Fprintf(os.Stdout, "  %sContent Transfer\033[0m:     %12s %s%s%s\u2588%s\033[0m\r", 
					pd.PhaseColors["transfer"],
					duration,
					"\033[38;5;240m", // Couleur grise pour les phases pru00e9cu00e9dentes
					strings.Repeat(" ", prevBlocks),
					pd.PhaseColors["transfer"],
					strings.Repeat("\u2588", transferBlocks-1))
			}
		}
	}
}

// Complete signals that the progress display is complete
func (pd *ProgressDisplay) Complete() {
	if !pd.Enabled {
		return
	}

	pd.CompleteChan <- true
}
