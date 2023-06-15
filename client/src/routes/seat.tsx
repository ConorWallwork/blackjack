import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { endSeat, hitSeat, sitSeat, startSeat } from "../services/seats";
import { getSuit, getValue, total } from "../functions/total";
import "./seat.css";
import Card from "../components/card";

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
  stage: string;
  bet: number | null;
};

export default function Seat() {
  const { seat } = useLoaderData() as { seat: ISeat };
  const [stack, setStack] = useState<number>(seat.stack);
  seat.stack = stack;
  const [playerHand, setPlayerHand] = useState<number[]>([]);
  const [dealerHand, setDealerHand] = useState<number[]>([]);
  const [stage, setStage] = useState("pre_bet");
  const [bet, setBet] = useState<number>(0);
  const [result, setResult] = useState<string | null>(null);

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

  function handlePlaceBet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      bet: { value: string };
    };

    const bet = parseInt(target.bet.value);

    setBet(bet);
    setStage(Stages.PreDeal);
  }

  async function handleDeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const startingHands = await startSeat(bet, seat.id);
    setPlayerHand(startingHands.playerHand);
    setDealerHand(startingHands.dealerHand);
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

  return (
    <>
      <div className="table">
        <div className="dealer-side"></div>
        <div className="dealer-felt">
          <div className="dealer-cards">{dealerHandView}</div>
        </div>
        <div className="player-felt">
          <div className="player-cards-outer">
            <div className="player-cards-inner">{playerHandView}</div>
          </div>
        </div>
        <div className="player-side">
          <div className="seat-info">
            <h2>{seat.nickname}</h2>
            <h2>{seat.stack}</h2>
            {renderActionButton(stage)}
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
      <form method="post" onSubmit={args.handleHit}>
        <button type="submit">HIT</button>
      </form>
      <form method="post" onSubmit={args.handleSit}>
        <button type="submit">SIT</button>
      </form>
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
