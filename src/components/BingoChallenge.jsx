import { useMemo, useState } from 'react';

const bingoItems = [
  'Quelqu’un lance un “santé” spontané',
  'Un duo karaoké improbable se crée',
  'Une personne danse sans musique',
  'On fait une photo de groupe réussie',
  'Quelqu’un raconte une anecdote gênante',
  'Un morceau des années 2000 passe',
  'Quelqu’un réclame encore une chanson',
  'Une blague nulle fait rire tout le monde',
  'Quelqu’un perd son gobelet',
  'Un chant collectif démarre',
  'Un surnom bizarre apparaît',
  'Quelqu’un improvise un mini défi',
];

function BingoChallenge() {
  const [checkedItems, setCheckedItems] = useState([]);

  const toggleItem = (item) => {
    setCheckedItems((previous) =>
      previous.includes(item) ? previous.filter((value) => value !== item) : [...previous, item],
    );
  };

  const completedCount = checkedItems.length;
  const message = useMemo(() => {
    if (completedCount >= 9) {
      return 'Bingo validé, soirée légendaire 🏆';
    }
    if (completedCount >= 5) {
      return 'Vous êtes chauds, continuez 🔥';
    }
    return 'Cochez les cases au fil de la soirée.';
  }, [completedCount]);

  return (
    <article className="card">
      <h2>Bingo de la soirée + défis 🎯</h2>
      <p className="section-help">
        Coche chaque case quand le moment arrive. Objectif: en valider un max ensemble.
      </p>
      <p className="bingo-progress">
        {completedCount}/{bingoItems.length} cases cochées · <strong>{message}</strong>
      </p>

      <div className="bingo-grid">
        {bingoItems.map((item) => {
          const isChecked = checkedItems.includes(item);
          return (
            <button
              key={item}
              type="button"
              className={`bingo-item ${isChecked ? 'checked' : ''}`}
              onClick={() => toggleItem(item)}
            >
              <span>{isChecked ? '✅' : '⬜'}</span>
              <span>{item}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

export default BingoChallenge;
