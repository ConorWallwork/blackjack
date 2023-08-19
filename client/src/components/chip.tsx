import { ChipColorMap, ChipValue } from "../routes/seat";
import "./chip.css";

function Chip(args: {
  value: ChipValue;
  clickable?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className="chip"
      style={{
        backgroundColor: ChipColorMap[args.value],
        cursor: args.clickable ? "pointer" : "default",
      }}
      onClick={args.onClick}
    >
      <span className="chip-value-text">{args.value}</span>
    </div>
  );
}

export default Chip;
