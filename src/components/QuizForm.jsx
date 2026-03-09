import { useState } from 'react';
import { submitToTable, TABLES } from '../lib/api';

const initialState = {
  author: '',
  question: '',
  answerA: '',
  answerB: '',
  answerC: '',
  answerD: '',
  correctAnswer: 'A',
};

function QuizForm() {
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

    if (Object.values(form).some((value) => value.trim?.() === '')) {
      setStatus({ type: 'error', message: 'Merci de remplir tous les champs du quiz.' });
      return;
    }

    setLoading(true);
    try {
      await submitToTable(TABLES.QUIZ, form);
      setForm(initialState);
      setStatus({ type: 'success', message: 'Question de quiz enregistrée.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card">
      <h2>Question pour le quiz 🧩</h2>
      <p className="section-help">
        Le principe: tu proposes 1 question avec 4 réponses, puis tu sélectionnes la bonne
        réponse. On utilisera ces questions pendant la soirée.
      </p>
      <form onSubmit={onSubmit} className="form">
        <label>
          Nom / Prénom
          <input name="author" value={form.author} onChange={onChange} />
        </label>
        <label>
          Question
          <textarea name="question" value={form.question} onChange={onChange} />
        </label>
        <label>
          Réponse A
          <input name="answerA" value={form.answerA} onChange={onChange} />
        </label>
        <label>
          Réponse B
          <input name="answerB" value={form.answerB} onChange={onChange} />
        </label>
        <label>
          Réponse C
          <input name="answerC" value={form.answerC} onChange={onChange} />
        </label>
        <label>
          Réponse D
          <input name="answerD" value={form.answerD} onChange={onChange} />
        </label>
        <label>
          Bonne réponse
          <select name="correctAnswer" value={form.correctAnswer} onChange={onChange}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Envoi...' : 'Ajouter la question'}
        </button>
        {status.message && <p className={`status ${status.type}`}>{status.message}</p>}
      </form>
    </article>
  );
}

export default QuizForm;
