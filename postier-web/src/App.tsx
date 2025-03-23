import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'

// Import our global styles
import { GlobalStyles } from './theme/styled'

// Import components
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import TechStack from './components/TechStack'
import Download from './components/Download'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <GlobalStyles />
      <Theme>
        <Navbar />
        <main>
          <Hero />
          <Features />
          <TechStack />
          <Download />
        </main>
        <Footer />
      </Theme>
    </>
  )
}

export default App
