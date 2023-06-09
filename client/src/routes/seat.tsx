export type ISeat = {
  nickname: string;
  stack: number;
  id: string;
  round?: IRound;
};

export type IRound = {
  id: number;
  player_hand?: number[];
  dealer_hand?: number[];
  deck: number[];
  stage: string;
  bet: number;
};

export default function Seat() {
  const seat: ISeat = {
    nickname: "Foo",
    stack: 200,
    id: "lqwejibf3452piqjwnef",
    round: {
      id: 42,
      deck: [0, 1, 2, 3],
      stage: "pre_deal",
      bet: 100,
    },
  };

  return (
    <div id="contact">
      <div>
        <h1>{seat.nickname} </h1>
        <h2>{seat.stack}</h2>
        <h2>{seat.id}</h2>

        {seat.round && <Round seat={seat}></Round>}
      </div>
    </div>
  );
}

function Round({ seat }: { seat: ISeat }) {
  const round = seat.round;
  return (
    <div>
      ID: {round?.id}, DECK: {round?.deck}, STAGE: {round?.stage}, BET:{" "}
      {round?.bet}
    </div>
  );
}
