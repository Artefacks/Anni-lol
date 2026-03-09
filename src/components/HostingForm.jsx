import { useState } from 'react';
import { submitToTable, TABLES } from '../lib/api';

const initialState = {
  author: '',
  needsHosting: 'yes',
  nights: '1',
  constraints: '',
};

function HostingForm() {
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

    if (!form.author.trim()) {
      setStatus({ type: 'error', message: 'Merci de renseigner ton nom/prénom.' });
      return;
    }

    setLoading(true);
    try {
      await submitToTable(TABLES.HOSTING, {
        ...form,
        nights: Number(form.nights),
        needsHosting: form.needsHosting === 'yes',
      });
      setForm(initialState);
      setStatus({ type: 'success', message: 'Besoin d’hébergement enregistré.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card">
      <h2>Hébergement (important)</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Nom / Prénom
          <input name="author" value={form.author} onChange={onChange} />
        </label>

        <label>
          Besoin d’être hébergé ?
          <select name="needsHosting" value={form.needsHosting} onChange={onChange}>
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </label>

        <label>
          Nombre de nuits
          <select name="nights" value={form.nights} onChange={onChange}>
            <option value="1">1 nuit</option>
            <option value="2">2 nuits</option>
            <option value="3">3 nuits</option>
          </select>
        </label>

        <label>
          Contraintes / infos utiles (optionnel)
          <textarea
            name="constraints"
            value={form.constraints}
            onChange={onChange}
            placeholder="Ex: arrivée tardive, besoin de couverture..."
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer ma réponse'}
        </button>
        {status.message && <p className={`status ${status.type}`}>{status.message}</p>}
      </form>
    </article>
  );
}

export default HostingForm;
