import { GamificationProvider } from './hooks/useGamification';
import { Web3Provider } from './hooks/useWeb3';
import Wizard from './components/Wizard/Wizard';

function App() {
  return (
    <GamificationProvider>
      <Web3Provider>
        <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
          <Wizard />
        </div>
      </Web3Provider>
    </GamificationProvider>
  );
}

export default App;
