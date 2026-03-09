import { useState } from 'react';
import { submitToTable, TABLES } from '../lib/api';

const initialState = {
  author: '',
  song: '',
  withWhom: '',
  note: '',
};

function KaraokeForm() {
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

    if (!form.author.trim() || !form.song.trim() || !form.withWhom.trim()) {
      setStatus({
        type: 'error',
        message: 'Nom, chanson et partenaire karaoké sont obligatoires.',
      });
      return;
    }

    setLoading(true);
    try {
      await submitToTable(TABLES.KARAOKE, form);
      setForm(initialState);
      setStatus({ type: 'success', message: 'Chanson karaoké ajoutée.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card">
      <h2>Karaoké</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Nom / Prénom
          <input name="author" value={form.author} onChange={onChange} />
        </label>
        <label>
          Chanson que tu veux chanter
          <input name="song" value={form.song} onChange={onChange} />
        </label>
        <label>
          Avec qui ?
          <input name="withWhom" value={form.withWhom} onChange={onChange} />
        </label>
        <label>
          Note optionnelle
          <textarea name="note" value={form.note} onChange={onChange} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Envoi...' : 'Ajouter au karaoké'}
        </button>
        {status.message && <p className={`status ${status.type}`}>{status.message}</p>}
      </form>
    </article>
  );
}

export default KaraokeForm;
