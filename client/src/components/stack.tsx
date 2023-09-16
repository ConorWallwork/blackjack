import { ChipCounts } from "../functions/chips";
import { ChipValue } from "../routes/seat";
import Chip from "./chip";
import "./stack.css";

function Stack(args: {
  chipCounts: ChipCounts;
  clickable: boolean;
  onClick?: (value: ChipValue) => void;
}) {
  return Object.keys(args.chipCounts).map((chipValue) => {
    const chipList = [];
    const numChips = args.chipCounts[
      parseInt(chipValue) as ChipValue
    ] as number;
    for (let index = 0; index < numChips; index++) {
      chipList.push(
        <div
          className="chip-wrapper"
          style={{
            position: "absolute",
            left: `${0 + index * 2}px`,
            top: "0px",
          }}
        >
          <Chip
            value={parseInt(chipValue) as ChipValue}
            clickable={args.clickable}
            onClick={() =>
              args.onClick
                ? args.onClick(parseInt(chipValue) as ChipValue)
                : undefined
            }
          ></Chip>
        </div>
      );
    }
    return <div className="chip-stack-wrapper">{chipList}</div>;
  });
}

export default Stack;
