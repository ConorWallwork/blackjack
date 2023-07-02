import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { endSeat, hitSeat, sitSeat, startSeat } from "../services/seats";
import { getSuit, getValue, total } from "../functions/total";
import "./seat.css";
import Card from "../components/card";
import { MdExitToApp } from "@react-icons/all-files/md/MdExitToApp";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import Deck from "../components/deck";
import { ThemeProvider, createTheme } from "@mui/material";
import { chips } from "../functions/chips";
import Chip from "../components/chip";
import InfoDialog from "../components/info-dialog";

export enum Stages {
  PreBet = "pre_bet",
  PreDeal = "pre_deal",
  PlayerTurn = "player_turn",
  DealerTurn = "dealer_turn",
  RoundEnd = "round_end",
}

export type ISeat = {
  nickname: string;
  stack: number;
  id: string;
  round?: IRound;
};

export type IRound = {
  playerHand?: number[];
  dealerHand?: number[];
  stage: Stages;
  bet: number | null;
};

export type ChipValue = 5 | 10 | 50 | 100 | 500 | 1000 | 5000 | 10000;

export const ChipColorMap: Record<ChipValue, string> = {
  5: "red",
  10: "orange",
  50: "blue",
  100: "green",
  500: "yellow",
  1000: "purple",
  5000: "gold",
  10000: "cyan",
};

export default function Seat() {
  const navigate = useNavigate();

  /** Get the value of seat on page load and initialise the state
   * with those values
   */
  const { seat } = useLoaderData() as { seat: ISeat };
  const [stack, setStack] = useState<number>(seat.stack);
  const [playerHand, setPlayerHand] = useState<number[]>(
    seat.round?.playerHand ?? []
  );
  const [dealerHand, setDealerHand] = useState<number[]>(
    seat.round?.dealerHand ?? []
  );
  const [stage, setStage] = useState(seat.round?.stage ?? Stages.PreBet);
  const [bet, setBet] = useState<number>(seat.round?.bet ?? 0);
  const [_result, setResult] = useState<string | null>(null);
  _result;
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const handleClickInfo = () => {
    setInfoDialogOpen(true);
  };

  const handleCloseInfo = () => {
    setInfoDialogOpen(false);
  };

  const handleClickChip = (chipValue: ChipValue) => {
    setBet(bet + chipValue);
    setStack(stack - chipValue);
  };

  const playerHandView = playerHand.map((card, index) => {
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

  const dealerHandView = dealerHand.map((card, index) => {
    const cardValue = getValue(card);
    const cardSuit = getSuit(card);
    return (
      <div
        className="card-wrapper"
        style={{
          position: "absolute",
          left: `${0 + index * 30}px`,
          bottom: "0px",
        }}
      >
        <Card value={cardValue} suit={cardSuit}></Card>
      </div>
    );
  });

  const stackChipCounts = chips(stack);

  const stackView = Object.keys(stackChipCounts).map((chipValue) => {
    const chipList = [];
    const numChips = stackChipCounts[
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
          <Chip value={parseInt(chipValue) as ChipValue}></Chip>
        </div>
      );
    }
    return <div className="chip-stack-wrapper">{chipList}</div>;
  });

  const betChipCounts = chips(bet);

  const betView = Object.keys(betChipCounts).map((chipValue) => {
    const chipList = [];
    const numChips = betChipCounts[parseInt(chipValue) as ChipValue] as number;
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
          <Chip value={parseInt(chipValue) as ChipValue}></Chip>
        </div>
      );
    }
    return <div className="chip-stack-wrapper">{chipList}</div>;
  });

  const clickableChipsView = Object.keys(ChipColorMap).map((chipValue) => {
    const intValue = parseInt(chipValue);
    return (
      <div
        className="clickable-chip"
        style={{
          visibility: intValue <= stack ? "visible" : "hidden",
        }}
      >
        <Chip
          value={intValue as ChipValue}
          clickable={true}
          onClick={() => {
            handleClickChip(intValue as ChipValue);
          }}
        ></Chip>
      </div>
    );
  });

  async function handlePlaceBet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStage(Stages.PreDeal);
    const startingHands = await startSeat(bet, seat.id);
    setPlayerHand(startingHands.playerHand);
    setDealerHand(startingHands.dealerHand);
  }

  function handleDeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStage(Stages.PlayerTurn);
  }

  async function handleHit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const card = await hitSeat(seat.id);
    const newPlayerHand = [...playerHand, card];
    setPlayerHand(newPlayerHand);
    if (total(newPlayerHand) > 21) {
      setStage(Stages.RoundEnd);
      setBet(0);
    }
  }

  async function handleSit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await sitSeat(seat.id);
    setStage(Stages.DealerTurn);
  }

  async function handleEnd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dealerCards = await endSeat(seat.id);
    const newDealerHand = [...dealerHand, ...dealerCards];
    setDealerHand(newDealerHand);
    const playerTotal = total(playerHand);
    const dealerTotal = total(newDealerHand);

    if (dealerTotal > 21 || playerTotal > dealerTotal) {
      setStack(stack + 2 * bet);
      setBet(0);
      setResult("WIN");
    } else if (dealerTotal > playerTotal) {
      setBet(0);
      setResult("LOSS");
    } else {
      // draw
      setStack(bet);
      setBet(0);
      setResult("DRAW");
    }
    setStage(Stages.RoundEnd);
  }

  async function handleNew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPlayerHand([]);
    setDealerHand([]);
    setBet(0);
    setResult(null);
    setStage(Stages.PreBet);
  }

  function renderActionButton(stage: string) {
    switch (stage) {
      case Stages.PreBet:
        return (
          <PlaceBetButton
            handlePlaceBet={handlePlaceBet}
            bet={bet}
          ></PlaceBetButton>
        );
      case Stages.PreDeal:
        return <DealButton handleDeal={handleDeal}></DealButton>;
      case Stages.PlayerTurn:
        return (
          <PlayerTurnButtons
            handleHit={handleHit}
            handleSit={handleSit}
          ></PlayerTurnButtons>
        );
      case Stages.DealerTurn:
        return <DealerTurnButton handleEnd={handleEnd}></DealerTurnButton>;
      case Stages.RoundEnd:
        return <NewRoundButton handleNew={handleNew}></NewRoundButton>;
    }
  }

  const theme = createTheme({
    palette: {
      primary: {
        main: "#45a445",
      },
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <div className="table">
          <div className="dealer-side">
            <div className="deck-container">
              <Deck></Deck>
            </div>
          </div>
          <div className="dealer-felt">
            <div className="dealer-cards">
              {[Stages.PreBet, Stages.PreDeal].includes(stage)
                ? ""
                : dealerHandView}
            </div>
          </div>
          <div className="player-felt">
            <div className="bet-outer">
              <div className="stack-grid">{betView}</div>
            </div>
            <div className="player-cards-outer">
              <div className="player-cards-inner">
                {[Stages.PreBet, Stages.PreDeal].includes(stage)
                  ? ""
                  : playerHandView}
              </div>
            </div>
          </div>
          <div className="player-side">
            <div className="seat-actions-section">
              <div className="seat-info">
                <div className="seat-info-header">
                  <div className="seat-info-header-buttons">
                    <MdExitToApp
                      onClick={() => navigate("/")}
                      className="exit-button header-button"
                    ></MdExitToApp>
                    <MdInfoOutline
                      onClick={handleClickInfo}
                      className="info-button header-button"
                    ></MdInfoOutline>
                  </div>
                  <div className="nickname-container">
                    {" "}
                    <div>{seat.nickname}</div>
                  </div>
                </div>
                <div className="action-buttons-container">
                  {}
                  {stack === 0 && stage === Stages.RoundEnd ? (
                    <></>
                  ) : (
                    renderActionButton(stage)
                  )}
                </div>
              </div>
              {stage === Stages.PreBet ? (
                <div className="clickable-chips">{clickableChipsView}</div>
              ) : (
                <></>
              )}
            </div>
            <div className="stack-section">
              <div className="stack-grid">{stackView}</div>
            </div>
          </div>
        </div>
        <InfoDialog
          open={infoDialogOpen}
          handleClose={handleCloseInfo}
        ></InfoDialog>
      </ThemeProvider>
    </>
  );
}

function PlaceBetButton(args: {
  handlePlaceBet: React.FormEventHandler<HTMLFormElement>;
  bet: number;
}) {
  return (
    <>
      <form method="post" onSubmit={args.handlePlaceBet}>
        <div className="bet-form-container">
          <button
            type="submit"
            className="action-button"
            disabled={args.bet === 0}
            style={args.bet === 0 ? { cursor: "default" } : {}}
          >
            PLACE BET
          </button>
        </div>
      </form>
    </>
  );
}

function DealButton(args: {
  handleDeal: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <>
      <form method="post" onSubmit={args.handleDeal}>
        <button type="submit" className="action-button">
          DEAL
        </button>
      </form>
    </>
  );
}

function PlayerTurnButtons(args: {
  handleHit: React.FormEventHandler<HTMLFormElement>;
  handleSit: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <>
      <div className="player-turn-buttons-container">
        <form method="post" onSubmit={args.handleHit}>
          <button type="submit" className="action-button">
            HIT
          </button>
        </form>
        <form method="post" onSubmit={args.handleSit}>
          <button type="submit" className="action-button">
            SIT
          </button>
        </form>
      </div>
    </>
  );
}

function DealerTurnButton(args: {
  handleEnd: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <>
      <form method="post" onSubmit={args.handleEnd}>
        <button type="submit" className="action-button">
          FINISH
        </button>
      </form>
    </>
  );
}

function NewRoundButton(args: {
  handleNew: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <>
      <form method="post" onSubmit={args.handleNew}>
        <button type="submit" className="action-button">
          NEW ROUND
        </button>
      </form>
    </>
  );
}
