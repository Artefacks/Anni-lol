import { useMemo, useState } from 'react';
import QuizForm from './components/QuizForm';
import PlaylistForm from './components/PlaylistForm';
import KaraokeForm from './components/KaraokeForm';
import InformationPanel from './components/InformationPanel';

function App() {
  const [selectedContribution, setSelectedContribution] = useState('playlist');

  const selectedForm = useMemo(() => {
    if (selectedContribution === 'information') {
      return <InformationPanel />;
    }
    if (selectedContribution === 'quiz') {
      return <QuizForm />;
    }
    if (selectedContribution === 'karaoke') {
      return <KaraokeForm />;
    }
    return <PlaylistForm />;
  }, [selectedContribution]);

  return (
    <div className="party-page">
      <header className="hero">
        <p className="hero-eyebrow">Samedi 14 mars · Delémont</p>
        <h1>Anniversaire à la Cabane de la Chouette ✨</h1>
      </header>

      <section className="card">
        <div className="choice-grid">
          <button
            type="button"
            className={`choice-card ${selectedContribution === 'playlist' ? 'active' : ''}`}
            onClick={() => setSelectedContribution('playlist')}
          >
            🎵 Ajouter à la playlist
          </button>
          <button
            type="button"
            className={`choice-card ${selectedContribution === 'karaoke' ? 'active' : ''}`}
            onClick={() => setSelectedContribution('karaoke')}
          >
            🎤 Proposer un karaoké
          </button>
          <button
            type="button"
            className={`choice-card ${selectedContribution === 'quiz' ? 'active' : ''}`}
            onClick={() => setSelectedContribution('quiz')}
          >
            🧠 Ajouter une question quiz
          </button>
          <button
            type="button"
            className={`choice-card ${selectedContribution === 'information' ? 'active' : ''}`}
            onClick={() => setSelectedContribution('information')}
          >
            ℹ️ Informations
          </button>
        </div>
        <div className="selected-form">{selectedForm}</div>
      </section>
    </div>
  );
}

export default App;
