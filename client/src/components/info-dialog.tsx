import { Dialog } from "@mui/material";
import { ChipColorMap, ChipValue } from "../routes/seat";
import Chip from "./chip";

function InfoDialog(args: { handleClose: () => void; open: boolean }) {
  const chipValues = Object.keys(ChipColorMap).map((chipValueString) =>
    parseInt(chipValueString)
  );

  const chipsLegend = chipValues.map((chipValue) => {
    return (
      <div
        className="legend-item"
        style={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: "grey",
          padding: "1em",
          justifyContent: "start",
          alignItems: "center",
          gap: "1em",
          color: "white",
        }}
      >
        <Chip value={chipValue as ChipValue}></Chip>
        <span>{chipValue}</span>
      </div>
    );
  });

  return (
    <Dialog onClose={args.handleClose} open={args.open}>
      {chipsLegend}
    </Dialog>
  );
}

export default InfoDialog;
