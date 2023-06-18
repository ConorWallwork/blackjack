import "./card.css";
import FaceDownCardSVG from "../assets/face-down-card.svg";

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

export default Card;

export function FaceDownCard() {
  return (
    <>
      <img
        src={FaceDownCardSVG}
        style={{ width: "40mm", height: "56mm" }}
      ></img>
    </>
  );
}

const suitToUnicode: Record<Suit, string> = {
  S: String.fromCodePoint(parseInt("9824", 10)),
  C: String.fromCodePoint(parseInt("9827", 10)),
  D: String.fromCodePoint(parseInt("9830", 10)),
  H: String.fromCodePoint(parseInt("9829", 10)),
};

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
