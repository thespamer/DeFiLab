import Wizard from './components/Wizard/Wizard';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
      <Wizard />
    </div>
  );
}

export default App;
