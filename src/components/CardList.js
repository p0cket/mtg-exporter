function CardList({ cards }) {
  return (
    <div>
      <h2>Cards in Set</h2>
      <ul>
        {cards.map(card => (
          <li key={card.id}>{card.name}</li>
        ))}
      </ul>
    </div>
  );
}
 export default CardList