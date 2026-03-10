import { useState } from 'react';
import { submitToTable, TABLES } from '../lib/api';

const initialState = {
  title: '',
  artist: '',
  link: '',
  passageTime: '',
};

function PlaylistForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!form.title.trim() || !form.artist.trim()) {
      setStatus({
        type: 'error',
        message: 'Titre et artiste sont obligatoires pour la playlist.',
      });
      return;
    }

    setLoading(true);
    try {
      await submitToTable(TABLES.PLAYLIST, form);
      setForm(initialState);
      setStatus({ type: 'success', message: 'Son ajouté à la playlist.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card">
      <h2>Ajouter un son à la playlist</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Titre
          <input name="title" value={form.title} onChange={onChange} />
        </label>
        <label>
          Artiste
          <input name="artist" value={form.artist} onChange={onChange} />
        </label>
        <label>
          Lien (YouTube/Spotify, optionnel)
          <input name="link" value={form.link} onChange={onChange} />
        </label>
        <label>
          Choisir l’heure de passage
          <select name="passageTime" value={form.passageTime} onChange={onChange}>
            <option value="">Quand tu veux</option>
            <option value="debut">Début de soirée</option>
            <option value="milieu">Milieu de soirée</option>
            <option value="fin">Fin de soirée</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Envoi...' : 'Ajouter le son'}
        </button>
        {status.message && <p className={`status ${status.type}`}>{status.message}</p>}
      </form>
    </article>
  );
}

export default PlaylistForm;
