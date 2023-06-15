import "./card.css";

export type Suit = "S" | "C" | "D" | "H";

function Card(args: { value: number | string; suit: Suit }) {
  return (
    <>
      <div className="playing-card">
        <div className="top-left">
          <div className="value" style={{ color: suitGetColor(args.suit) }}>
            {args.value}
          </div>
          <Suit suit={args.suit}></Suit>
        </div>
        <div className="bottom-right">
          <div className="value" style={{ color: suitGetColor(args.suit) }}>
            {args.value}
          </div>{" "}
          <Suit suit={args.suit}></Suit>
        </div>
      </div>
    </>
  );
}

const suitToUnicode: Record<Suit, string> = {
  S: String.fromCodePoint(parseInt("9824", 10)),
  C: String.fromCodePoint(parseInt("9827", 10)),
  D: String.fromCodePoint(parseInt("9830", 10)),
  H: String.fromCodePoint(parseInt("9829", 10)),
};

export default Card;

function Suit(args: { suit: Suit }) {
  return (
    <div className="suit" style={{ color: suitGetColor(args.suit) }}>
      {suitToUnicode[args.suit]}
    </div>
  );
}

function suitGetColor(suit: Suit) {
  return ["D", "H"].includes(suit) ? "red" : "black";
}
