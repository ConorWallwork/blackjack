import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  endSeat,
  hitSeat,
  sitSeat,
  splitSeat,
  startSeat,
} from "../services/seats";
import { total } from "../functions/total";
import "./seat.css";
import { MdExitToApp } from "@react-icons/all-files/md/MdExitToApp";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import Deck from "../components/deck";
import { ThemeProvider, createTheme } from "@mui/material";
import { chips } from "../functions/chips";
import Chip from "../components/chip";
import InfoDialog from "../components/info-dialog";
import Hand from "../components/hand";
import Stack from "../components/stack";

export enum Stages {
  PreBet = "pre_bet",
  PreDeal = "pre_deal",
  PlayerTurn = "player_turn",
  DealerTurn = "dealer_turn",
  RoundEnd = "round_end",
}

export type Seat = {
  nickname: string;
  stack: number;
  id: string;
  round?: Round;
};

export type Round = {
  playerHand?: number[] | [number[], number[]];
  dealerHand?: number[];
  stage: Stages;
  bet: number | null;
  hasSplit: boolean;
  hasDoubledDown: boolean;
  handSits: [boolean, boolean];
  handBusts: [boolean, boolean];
};
export type Result = "WIN" | "LOSS" | "DRAW" | "UNFINISHED";

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
  const { seat } = useLoaderData() as { seat: Seat };
  const [stack, setStack] = useState<number>(seat.stack);

  const [playerHandData, setPlayerHandData] = useState<{
    playerHand: number[] | [number[], number[]];
    hasSplit: boolean;
    hasDoubledDown: boolean;
    handSits: [boolean, boolean];
    handBusts: [boolean, boolean];
    handResults: [Result, Result];
    activeHand: 0 | 1;
  }>({
    playerHand: seat.round?.playerHand ?? [],
    hasSplit: !!seat.round?.hasSplit,
    hasDoubledDown: !!seat.round?.hasDoubledDown,
    handSits: seat.round?.handSits ?? [false, false],
    handBusts: seat.round?.handBusts ?? [false, false],
    handResults: ["UNFINISHED", "UNFINISHED"],
    activeHand: 0,
  });

  const [dealerHand, setDealerHand] = useState<number[]>(
    seat.round?.dealerHand ?? []
  );
  const [stage, setStage] = useState(seat.round?.stage ?? Stages.PreBet);
  const [bet, setBet] = useState<number>(seat.round?.bet ?? 0);
  const [result, setResult] = useState<Result>("UNFINISHED");
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const handleClickInfo = () => {
    setInfoDialogOpen(true);
  };

  const handleCloseInfo = () => {
    setInfoDialogOpen(false);
  };

  const leftPlayerHandView = Hand({
    cards: !playerHandData.hasSplit
      ? (playerHandData.playerHand as number[])
      : (playerHandData.playerHand as [number[], number[]])[0],
  });

  const rightPlayerHandView = playerHandData.hasSplit ? (
    Hand({ cards: (playerHandData.playerHand as [number[], number[]])[1] })
  ) : (
    <></>
  );
  const dealerHandView = Hand({ cards: dealerHand });

  // Value of bet is always initial value. Calculate the current/visible value
  let visibleBet = bet;
  if (playerHandData.hasSplit) {
    visibleBet *= 2;
    for (let i = 0; i++; i < 2) {
      // Any result other than unfinished means that cash is out of the visible bet stack
      visibleBet += playerHandData.handResults[i] === "UNFINISHED" ? 0 : -bet;
    }
  } else {
    visibleBet = result === "UNFINISHED" ? bet : 0;
  }
  const betChipCounts = chips(visibleBet);
  const betView = Stack({
    chipCounts: betChipCounts,
    clickable: stage === Stages.PreBet,
    onClick:
      stage === Stages.PreBet
        ? (chipValue: ChipValue) => setBet(bet - chipValue)
        : undefined,
  });

  const visibleStack = stack - visibleBet;
  const mainStackChipCounts = chips(visibleStack);
  const mainStackView = Stack({
    chipCounts: mainStackChipCounts,
    clickable: false,
  });

  const handleClickChip = (chipValue: ChipValue) => {
    setBet(bet + chipValue);
  };

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
        setStack(stack - bet);
        newPlayerHandData.handResults = [...playerHandData.handResults];
        newPlayerHandData.handResults[newPlayerHandData.activeHand] = "LOSS";
        newPlayerHandData.activeHand++;
      }
    } else {
      newPlayerHandData.playerHand = [
        ...(newPlayerHandData.playerHand as number[]),
        card,
      ];
    }
    if (!newPlayerHandData.hasSplit) {
      if (total(newPlayerHandData.playerHand as number[]) > 21) {
        setStage(Stages.RoundEnd);
        setResult("LOSS");
        setStack(stack - bet);
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
    setPlayerHandData(newPlayerHandData);
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
        setStack(stack + bet);
        setResult("WIN");
      } else if (dealerTotal > playerTotal) {
        setStack(stack - bet);
        setResult("LOSS");
      } else {
        // draw
        setResult("DRAW");
      }
    } else {
      const handPayouts = [0, 0];
      const handResults: [Result, Result] = ["UNFINISHED", "UNFINISHED"];
      for (let i = 0; i < 2; i++) {
        if (playerHandData.handBusts[i]) {
          handResults[i] = "LOSS";
          continue;
        }
        const handTotal = total(playerHandData.playerHand[i] as number[]);
        const dealerTotal = total(newDealerHand);
        if (dealerTotal > 21 || handTotal > dealerTotal) {
          handPayouts[i] = bet;
          handResults[i] = "WIN";
        } else if (dealerTotal > handTotal) {
          handPayouts[i] = -bet;
          handResults[i] = "LOSS";
        } else {
          // draw
          handPayouts[i] = 0;
          handResults[i] = "DRAW";
        }
      }
      setStack(stack + handPayouts[0] + handPayouts[1]);
      setPlayerHandData({
        ...playerHandData,
        handResults,
      });
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
      handResults: ["UNFINISHED", "UNFINISHED"],
      activeHand: 0,
    });
    setDealerHand([]);
    setBet(0);
    setResult("UNFINISHED");
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
              stack >= 2 * bet
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
        <div className="body">
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
                <div className="stack-grid">{mainStackView}</div>
              </div>
            </div>
          </div>
          <div className="footer">
            STACK: {visibleStack} &emsp; BET: {visibleBet}
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
