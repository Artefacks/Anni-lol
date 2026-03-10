import { useEffect, useMemo, useState } from 'react';
import { fetchTableRows, submitToTable, TABLES } from '../lib/api';

const BAC_OPTIONS = ['0.00 - 0.30 g/l', '0.31 - 0.60 g/l', '0.61 - 0.90 g/l', '0.91+ g/l'];
const END_OPTIONS = ['00:30', '01:00', '01:30', '02:00 ou plus'];
const WEATHER_OPTIONS = ['Beau temps', 'Mauvais temps'];
const YES_NO_OPTIONS = ['Oui', 'Non'];
const REFRESH_MS = 8000;

function normalizeAuthor(author) {
  return String(author ?? '').trim().toLowerCase();
}

function GamblingPanel() {
  const [author, setAuthor] = useState('');
  const [rows, setRows] = useState([]);
  const [pendingVote, setPendingVote] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const loadRows = async () => {
    const data = await fetchTableRows(TABLES.GAMBLING);
    setRows(data);
  };

  useEffect(() => {
    loadRows();
    const timer = window.setInterval(loadRows, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  const normalizedRows = useMemo(
    () =>
      rows.map((row) => ({
        author: row.author ?? '',
        betType: row.bet_type ?? row.betType,
        prediction: row.prediction,
        createdAt: row.created_at ?? row.createdAt ?? '',
      })),
    [rows],
  );

  const effectiveRows = useMemo(() => {
    const votesByUserAndBet = new Map();

    normalizedRows.forEach((row) => {
      const key = `${normalizeAuthor(row.author)}::${row.betType}`;
      const previous = votesByUserAndBet.get(key);
      if (!previous) {
        votesByUserAndBet.set(key, row);
        return;
      }

      const previousDate = new Date(previous.createdAt).getTime();
      const currentDate = new Date(row.createdAt).getTime();
      if (Number.isNaN(previousDate) || currentDate >= previousDate) {
        votesByUserAndBet.set(key, row);
      }
    });

    return [...votesByUserAndBet.values()];
  }, [normalizedRows]);

  const countBy = (betType, prediction) =>
    effectiveRows.filter((row) => row.betType === betType && row.prediction === prediction).length;

  const currentAuthorKey = normalizeAuthor(author);
  const currentVoteByBetType = useMemo(() => {
    const map = new Map();
    if (!currentAuthorKey) {
      return map;
    }

    effectiveRows.forEach((row) => {
      if (normalizeAuthor(row.author) === currentAuthorKey) {
        map.set(row.betType, row.prediction);
      }
    });
    return map;
  }, [effectiveRows, currentAuthorKey]);

  const onQuickBet = (betType, prediction) => {
    setStatus({ type: '', message: '' });
    setPendingVote({ betType, prediction });
  };

  const onConfirmVote = async () => {
    if (!pendingVote) {
      setStatus({ type: 'error', message: 'Choisis d’abord une ligne de pari.' });
      return;
    }

    if (!author.trim()) {
      setStatus({ type: 'error', message: 'Mets ton nom/prénom pour valider le vote.' });
      return;
    }

    const currentPrediction = currentVoteByBetType.get(pendingVote.betType);
    if (currentPrediction === pendingVote.prediction) {
      setStatus({ type: 'success', message: 'Tu as déjà ce vote actif.' });
      setPendingVote(null);
      return;
    }

    setLoading(true);
    try {
      await submitToTable(TABLES.GAMBLING, {
        author: author.trim(),
        betType: pendingVote.betType,
        prediction: pendingVote.prediction,
      });
      setStatus({ type: 'success', message: 'Vote enregistré et mis à jour 🎯' });
      setPendingVote(null);
      await loadRows();
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const betTypeLabel = {
    mael_bac_23h: "Niveau d’alcoolémie de Mael à 23h",
    party_end_time: 'Heure de fin de la soirée',
    weather: 'Météo du samedi',
    roof_visit: 'Quelqu’un monte sur le toit ?',
    marc_dry_march: 'Marc recommence un Dry March ?',
  };

  return (
    <article className="card">
      <h2>Gambling 🎲</h2>
      <p className="section-help">
        Clique sur une ligne pour parier. Les compteurs se mettent à jour en live.
      </p>

      <div className="bet-block">
        <h3>Niveau d’alcoolémie de Mael à 23h</h3>
        <p className="current-vote">
          Ton vote actuel:{' '}
          <strong>{currentVoteByBetType.get('mael_bac_23h') ?? 'pas encore voté'}</strong>
        </p>
        <div className="bet-lines">
          {BAC_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`bet-line ${
                currentVoteByBetType.get('mael_bac_23h') === option ? 'selected' : ''
              } ${
                pendingVote?.betType === 'mael_bac_23h' && pendingVote?.prediction === option
                  ? 'pending-selected'
                  : ''
              }`}
              disabled={loading}
              onClick={() => onQuickBet('mael_bac_23h', option)}
            >
              <span>{option}</span>
              <strong>{countBy('mael_bac_23h', option)} pari(s)</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="bet-block">
        <h3>Heure de fin de la soirée</h3>
        <p className="current-vote">
          Ton vote actuel:{' '}
          <strong>{currentVoteByBetType.get('party_end_time') ?? 'pas encore voté'}</strong>
        </p>
        <div className="bet-lines">
          {END_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`bet-line ${
                currentVoteByBetType.get('party_end_time') === option ? 'selected' : ''
              } ${
                pendingVote?.betType === 'party_end_time' && pendingVote?.prediction === option
                  ? 'pending-selected'
                  : ''
              }`}
              disabled={loading}
              onClick={() => onQuickBet('party_end_time', option)}
            >
              <span>{option}</span>
              <strong>{countBy('party_end_time', option)} pari(s)</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="bet-block">
        <h3>Météo du samedi</h3>
        <p className="current-vote">
          Ton vote actuel: <strong>{currentVoteByBetType.get('weather') ?? 'pas encore voté'}</strong>
        </p>
        <div className="bet-lines">
          {WEATHER_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`bet-line ${
                currentVoteByBetType.get('weather') === option ? 'selected' : ''
              } ${
                pendingVote?.betType === 'weather' && pendingVote?.prediction === option
                  ? 'pending-selected'
                  : ''
              }`}
              disabled={loading}
              onClick={() => onQuickBet('weather', option)}
            >
              <span>{option}</span>
              <strong>{countBy('weather', option)} pari(s)</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="bet-block">
        <h3>Quelqu’un monte sur le toit ?</h3>
        <p className="current-vote">
          Ton vote actuel: <strong>{currentVoteByBetType.get('roof_visit') ?? 'pas encore voté'}</strong>
        </p>
        <div className="bet-lines">
          {YES_NO_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`bet-line ${
                currentVoteByBetType.get('roof_visit') === option ? 'selected' : ''
              } ${
                pendingVote?.betType === 'roof_visit' && pendingVote?.prediction === option
                  ? 'pending-selected'
                  : ''
              }`}
              disabled={loading}
              onClick={() => onQuickBet('roof_visit', option)}
            >
              <span>{option}</span>
              <strong>{countBy('roof_visit', option)} pari(s)</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="bet-block">
        <h3>Marc recommence un Dry March ?</h3>
        <p className="current-vote">
          Ton vote actuel:{' '}
          <strong>{currentVoteByBetType.get('marc_dry_march') ?? 'pas encore voté'}</strong>
        </p>
        <div className="bet-lines">
          {YES_NO_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`bet-line ${
                currentVoteByBetType.get('marc_dry_march') === option ? 'selected' : ''
              } ${
                pendingVote?.betType === 'marc_dry_march' && pendingVote?.prediction === option
                  ? 'pending-selected'
                  : ''
              }`}
              disabled={loading}
              onClick={() => onQuickBet('marc_dry_march', option)}
            >
              <span>{option}</span>
              <strong>{countBy('marc_dry_march', option)} pari(s)</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="bet-block confirm-vote">
        <h3>Valider ton vote</h3>
        {pendingVote ? (
          <p className="current-vote">
            Sélection: <strong>{betTypeLabel[pendingVote.betType]}</strong> ·{' '}
            <strong>{pendingVote.prediction}</strong>
          </p>
        ) : (
          <p className="current-vote">Clique d’abord une option de pari.</p>
        )}
        <div className="form">
          <label>
            Nom / Prénom
            <input value={author} onChange={(event) => setAuthor(event.target.value)} />
          </label>
          <button type="button" disabled={loading || !pendingVote} onClick={onConfirmVote}>
            {loading ? 'Envoi...' : 'Valider mon vote'}
          </button>
        </div>
      </div>

      {status.message && (
        <div className="bet-block">
          <p className={`status ${status.type}`}>{status.message}</p>
        </div>
      )}
    </article>
  );
}

export default GamblingPanel;
