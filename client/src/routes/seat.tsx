import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  endSeat,
  hitSeat,
  sitSeat,
  splitSeat,
  startSeat,
} from "../services/seats";
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
  playerHand?: number[] | [number[], number[]];
  dealerHand?: number[];
  stage: Stages;
  bet: number | null;
  hasSplit: boolean;
  hasDoubledDown: boolean;
  handSits: [boolean, boolean];
  handBusts: [boolean, boolean];
};

export type ChipValue = 5 | 10 | 50 | 100 | 500 | 1000 | 5000 | 10000;

export const ChipColorMap: Record<ChipValue, string> = {
  5: "red",
  10: "orange",
  50: "blue",
  100: "green",
  500: "black",
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

  const [playerHandData, setPlayerHandData] = useState<{
    playerHand: number[] | [number[], number[]];
    hasSplit: boolean;
    hasDoubledDown: boolean;
    handSits: [boolean, boolean];
    handBusts: [boolean, boolean];
    activeHand: 0 | 1;
  }>({
    playerHand: seat.round?.playerHand ?? [],
    hasSplit: !!seat.round?.hasSplit,
    hasDoubledDown: !!seat.round?.hasDoubledDown,
    handSits: seat.round?.handSits ?? [false, false],
    handBusts: seat.round?.handBusts ?? [false, false],
    activeHand: 0,
  });

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

  const leftPlayerHandView = (
    !playerHandData.hasSplit
      ? (playerHandData.playerHand as number[])
      : (playerHandData.playerHand as [number[], number[]])[0]
  ).map((card, index) => {
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

  const rightPlayerHandView = playerHandData.hasSplit ? (
    (playerHandData.playerHand as [number[], number[]])[1].map(
      (card, index) => {
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
      }
    )
  ) : (
    <></>
  );

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
    setPlayerHandData({
      ...playerHandData,
      playerHand: startingHands.playerHand,
    });
    setDealerHand(startingHands.dealerHand);
  }

  function handleDeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStage(Stages.PlayerTurn);
  }

  async function handleHit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const card = await hitSeat(
      seat.id,
      playerHandData.hasSplit ? playerHandData.activeHand : undefined
    );
    const newPlayerHandData = {
      ...playerHandData,
      handSits: [...playerHandData.handSits] as [boolean, boolean],
      handBusts: [...playerHandData.handBusts] as [boolean, boolean],
    };
    if (newPlayerHandData.hasSplit) {
      newPlayerHandData.playerHand = [
        [...(playerHandData.playerHand as [number[], number[]])[0]],
        [...(playerHandData.playerHand as [number[], number[]])[1]],
      ];
      newPlayerHandData.playerHand[newPlayerHandData.activeHand] = [
        ...newPlayerHandData.playerHand[newPlayerHandData.activeHand],
        card,
      ];
      if (
        total(newPlayerHandData.playerHand[newPlayerHandData.activeHand]) > 21
      ) {
        newPlayerHandData.handBusts[newPlayerHandData.activeHand] = true;
        setBet(bet / 2);
        newPlayerHandData.activeHand++;
      }
    } else {
      newPlayerHandData.playerHand = [
        ...(newPlayerHandData.playerHand as number[]),
        card,
      ];
    }
    setPlayerHandData(newPlayerHandData);
    if (!newPlayerHandData.hasSplit) {
      if (total(newPlayerHandData.playerHand as number[]) > 21) {
        setStage(Stages.RoundEnd);
        setBet(0);
      }
    } else {
      if (newPlayerHandData.handBusts[0] && newPlayerHandData.handBusts[1]) {
        setStage(Stages.RoundEnd);
      } else if (
        (newPlayerHandData.handBusts[0] || newPlayerHandData.handSits[0]) &&
        (newPlayerHandData.handBusts[1] || newPlayerHandData.handSits[1])
      ) {
        setStage(Stages.DealerTurn);
      }
    }
  }

  async function handleSplit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { leftCard, rightCard } = await splitSeat(seat.id);
    const newPlayerHand = {
      ...playerHandData,
      hasSplit: true,
      playerHand: [
        [(playerHandData.playerHand as number[])[0], leftCard],
        [(playerHandData.playerHand as number[])[1], rightCard],
      ] as [number[], number[]],
    };
    setPlayerHandData(newPlayerHand);
    setBet(bet * 2);
    setStack(stack - bet);
  }

  async function handleSit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await sitSeat(
      seat.id,
      playerHandData.hasSplit ? playerHandData.activeHand : undefined
    );
    if (playerHandData.hasSplit) {
      const newPlayerHand = {
        ...playerHandData,
        handSits: [...playerHandData.handSits] as [boolean, boolean],
      };
      newPlayerHand.handSits[playerHandData.activeHand] = true;
      newPlayerHand.activeHand++;
      setPlayerHandData(newPlayerHand);
      if (
        (newPlayerHand.handBusts[0] || newPlayerHand.handSits[0]) &&
        (newPlayerHand.handBusts[1] || newPlayerHand.handSits[1])
      ) {
        setStage(Stages.DealerTurn);
      }
    } else {
      setStage(Stages.DealerTurn);
    }
  }

  async function handleEnd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dealerCards = await endSeat(seat.id);
    const newDealerHand = [...dealerHand, ...dealerCards];
    setDealerHand(newDealerHand);
    if (!playerHandData.hasSplit) {
      const playerTotal = total(playerHandData.playerHand as number[]);
      const dealerTotal = total(newDealerHand);

      if (dealerTotal > 21 || playerTotal > dealerTotal) {
        setStack(stack + bet * 2);
        setBet(0);
        setResult("WIN");
      } else if (dealerTotal > playerTotal) {
        setBet(0);
        setResult("LOSS");
      } else {
        // draw
        setStack(stack + bet);
        setBet(0);
        setResult("DRAW");
      }
    } else {
      const handPayouts = [0, 0];
      for (let i = 0; i < 2; i++) {
        if (playerHandData.handBusts[i]) continue;
        const handTotal = total(playerHandData.playerHand[i] as number[]);
        const dealerTotal = total(newDealerHand);
        if (dealerTotal > 21 || handTotal > dealerTotal) {
          handPayouts[i] = bet;
        } else if (dealerTotal > handTotal) {
          handPayouts[i] = 0;
        } else {
          // draw
          handPayouts[i] = bet / 2;
        }
      }
      setBet(0);
      setStack(stack + handPayouts[0] + handPayouts[1]);
    }
    setStage(Stages.RoundEnd);
  }

  async function handleNew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPlayerHandData({
      playerHand: [],
      hasSplit: false,
      hasDoubledDown: false,
      handSits: [false, false],
      handBusts: [false, false],
      activeHand: 0,
    });
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
            handleSplit={handleSplit}
            canSplit={
              !playerHandData.hasSplit &&
              playerHandData.playerHand.length === 2 &&
              total([playerHandData.playerHand[0] as number]) ===
                total([playerHandData.playerHand[1] as number]) &&
              stack >= bet
            }
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
            <div className="player-cards-outer player-cards-left">
              <div className="player-cards-inner">
                {[Stages.PreBet, Stages.PreDeal].includes(stage)
                  ? ""
                  : leftPlayerHandView}
              </div>
            </div>
            <div className="player-cards-outer player-cards-right">
              <div className="player-cards-inner">
                {[Stages.PreBet, Stages.PreDeal].includes(stage)
                  ? ""
                  : rightPlayerHandView}
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
  handleSplit: React.FormEventHandler<HTMLFormElement>;
  canSplit: boolean;
}) {
  return (
    <>
      <div className="player-turn-buttons-container">
        <div className="player-turn-buttons-sub-container">
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
        <div className="player-turn-buttons-sub-container">
          <form method="post" onSubmit={args.handleSplit}>
            <button
              type="submit"
              className="action-button"
              disabled={!args.canSplit}
            >
              SPLIT
            </button>
          </form>
        </div>
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
