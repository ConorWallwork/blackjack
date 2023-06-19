import { FaceDownCard } from "./card";
import "./deck.css";

function Deck() {
  /** To give the appearance of a deck, stack 4 cards on top of one another with
   * a slight offset
   */
  const numCards = 4;
  const offset = 2;

  const deck = [];

  for (let index = 0; index < numCards; index++) {
    deck.push(
      <div
        className="card-wrapper"
        style={{
          position: "absolute",
          left: `${0 + index * offset}px`,
          bottom: "0px",
        }}
      >
        <FaceDownCard></FaceDownCard>
      </div>
    );
  }
  return <div className="deck-wrapper">{deck}</div>;
}

export default Deck;
