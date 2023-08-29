
import './App.css';
import Background from './background/Background';
import Home from './home/Home';
import Resume from './resume/Resume';

function App() {
  return (
    <section>
      <Background />
      <section style={{ opacity: 0.7 }}>
        <Home />
        <Resume />
      </section>
    </section>
  );
}

export default App;
