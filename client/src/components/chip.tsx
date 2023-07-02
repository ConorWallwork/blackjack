import { ChipColorMap, ChipValue } from "../routes/seat";

function Chip(args: {
  value: ChipValue;
  clickable?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className="chip"
      style={{
        border: "dashed",
        borderRadius: "50%",
        borderColor: "white",
        backgroundColor: ChipColorMap[args.value],
        height: "50px",
        width: "50px",
        cursor: args.clickable ? "pointer" : "default",
      }}
      onClick={args.onClick}
    ></div>
  );
}

export default Chip;
