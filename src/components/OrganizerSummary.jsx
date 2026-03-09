import { useCallback, useEffect, useState } from 'react';
import { getTableRows, TABLES } from '../lib/api';

function OrganizerSummary() {
  const [rows, setRows] = useState([]);

  const refresh = useCallback(() => {
    setRows(getTableRows(TABLES.HOSTING));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const peopleNeedingHosting = rows.filter((row) => row.needsHosting);

  return (
    <section className="card">
      <div className="summary-head">
        <h2>Récap organisateur: hébergement</h2>
        <button type="button" className="secondary-button" onClick={refresh}>
          Actualiser
        </button>
      </div>

      <p className="summary-count">
        Personnes à héberger: <strong>{peopleNeedingHosting.length}</strong>
      </p>

      {peopleNeedingHosting.length === 0 ? (
        <p className="muted">Aucune demande d’hébergement pour le moment.</p>
      ) : (
        <ul className="summary-list">
          {peopleNeedingHosting.map((person) => (
            <li key={person.id}>
              <strong>{person.author}</strong> · {person.nights} nuit(s)
              {person.constraints ? ` · ${person.constraints}` : ''}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default OrganizerSummary;
