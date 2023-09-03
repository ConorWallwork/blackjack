import { getSuit, getValue } from "../functions/total";
import Card from "./card";
import "./hand.css";

/** Must be placed in a relatively positioned container */
/** Could-do: parameterise spread direction, ie 'left' or 'right' */
function Hand(args: { cards: number[] }) {
  return args.cards.map((card, index) => {
    const cardValue = getValue(card);
    const cardSuit = getSuit(card);
    return (
      <div
        className="card-wrapper"
        style={{ position: "absolute", left: `${0 + index * 30}px` }}
      >
        <Card value={cardValue} suit={cardSuit}></Card>
      </div>
    );
  });
}
export default Hand;
