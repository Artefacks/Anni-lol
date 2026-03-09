import { useEffect, useState } from 'react';
import { getTableRows, submitToTable, TABLES } from '../lib/api';

function InformationPanel() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [hostingNames, setHostingNames] = useState([]);

  useEffect(() => {
    const rows = getTableRows(TABLES.HOSTING);
    setHostingNames(rows.map((row) => row.author).filter(Boolean));
  }, []);

  const handleHostingSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!name.trim()) {
      setStatus({ type: 'error', message: 'Merci de mettre ton nom/prénom.' });
      return;
    }

    setLoading(true);
    try {
      await submitToTable(TABLES.HOSTING, { author: name.trim(), needsHosting: true });
      setHostingNames((prev) => [name.trim(), ...prev]);
      setName('');
      setStatus({ type: 'success', message: 'C’est noté pour dormir sur place.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card info-panel">
      <h2>Infos pratiques 📍</h2>
      <ul className="info-list">
        <li>
          <strong>Lieu</strong>
          <p>Cabane de la Chouette, Delémont.</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Cabane+de+la+Chouette+Del%C3%A9mont"
            target="_blank"
            rel="noreferrer"
          >
            Ouvrir la localisation sur Google Maps
          </a>
        </li>
        <li>
          <strong>Programme</strong>
          <p>Si beau: dès 16h pétanque + grillades. Sinon: rendez-vous vers 20h.</p>
        </li>
        <li>
          <strong>Trajet gare</strong>
          <p>Quelqu’un peut venir te chercher à la gare si tu avertis à l’avance.</p>
        </li>
        <li>
          <strong>Après-soirée</strong>
          <p>Le soir, il y a aussi la Trash Night au SAS pour celles et ceux qui veulent.</p>
        </li>
        <li>
          <strong>Si tu dois dormir sur place</strong>
          <p>Ajoute juste ton nom/prénom ici.</p>
          <form onSubmit={handleHostingSubmit} className="form">
            <input value={name} onChange={(event) => setName(event.target.value)} />
            <button type="submit" disabled={loading}>
              {loading ? 'Envoi...' : 'Je dois dormir sur place'}
            </button>
            {status.message && <p className={`status ${status.type}`}>{status.message}</p>}
          </form>
          {hostingNames.length > 0 && (
            <p className="muted">Demandes reçues: {hostingNames.join(', ')}</p>
          )}
        </li>
      </ul>
    </article>
  );
}

export default InformationPanel;
