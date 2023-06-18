import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { endSeat, hitSeat, sitSeat, startSeat } from "../services/seats";
import { getSuit, getValue, total } from "../functions/total";
import "./seat.css";
import Card from "../components/card";
import { MdExitToApp } from "@react-icons/all-files/md/MdExitToApp";
import Deck from "../components/deck";

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

export default function Seat() {
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

  async function handlePlaceBet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      bet: { value: string };
    };

    const bet = parseInt(target.bet.value);

    setBet(bet);
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
      setStack(stack - bet);
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
      setStack(stack + bet);
      setResult("WIN");
    } else {
      setStack(stack - bet);
      setResult("LOSS");
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
          <PlaceBetButton handlePlaceBet={handlePlaceBet}></PlaceBetButton>
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

  const navigate = useNavigate();

  return (
    <>
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
          <div className="player-cards-outer">
            <div className="player-cards-inner">
              {[Stages.PreBet, Stages.PreDeal].includes(stage)
                ? ""
                : playerHandView}
            </div>
          </div>
        </div>
        <div className="player-side">
          <div className="seat-info">
            <div className="exit-container">
              <MdExitToApp
                onClick={() => navigate("/")}
                className="exit-button"
              ></MdExitToApp>
            </div>
            <h2>{seat.nickname}</h2>
            <h2>{stack}</h2>
            {stack === 0 ? <></> : renderActionButton(stage)}
          </div>
        </div>
      </div>
    </>
  );
}

function PlaceBetButton(args: {
  handlePlaceBet: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <>
      <form method="post" onSubmit={args.handlePlaceBet}>
        <input name="bet" type="number" defaultValue={0}></input>
        <button type="submit">PLACE BET</button>
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
        <button type="submit">DEAL</button>
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
          <button type="submit">HIT</button>
        </form>
        <form method="post" onSubmit={args.handleSit}>
          <button type="submit">SIT</button>
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
        <button type="submit">FINISH</button>
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
        <button type="submit">NEW ROUND</button>
      </form>
    </>
  );
}
