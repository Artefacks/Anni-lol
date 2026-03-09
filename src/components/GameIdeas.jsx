function GameIdeas() {
  const ideas = [
    {
      title: 'Blind test feu de camp',
      details: '15 secondes d’intro par son, bonus si on trouve aussi l’artiste.',
    },
    {
      title: 'Quiz anecdotes',
      details: 'Questions perso sur les souvenirs, en équipes de 3-4.',
    },
    {
      title: 'Loup-garou version express',
      details: 'Parties courtes de 10-15 minutes pour garder du rythme.',
    },
    {
      title: 'Histoire au coin du feu',
      details: 'Chacun ajoute une phrase, les imprévus rendent l’histoire mythique.',
    },
    {
      title: 'Chasse aux objets en extérieur',
      details: 'Seulement si la météo suit: lampe torche et mini défis dans la forêt.',
    },
  ];

  return (
    <section className="card">
      <h2>Idées de jeux bonus</h2>
      <ul className="games-list">
        {ideas.map((idea) => (
          <li key={idea.title}>
            <strong>{idea.title}</strong>
            <p>{idea.details}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default GameIdeas;
