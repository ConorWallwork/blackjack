import { redirect } from "react-router-dom";
import { serverBaseUrl } from "../environments/environment";
import { ISeat } from "../routes/seat";

export async function createSeat(nickname: string): Promise<string> {
  const url = `${serverBaseUrl}/seat/new?nickname=${nickname}`;
  const response = await fetch(url, { method: "POST", mode: "cors" });
  const id = (await response.json()).id;
  return id;
}

export async function startSeat(
  bet: number,
  id: string
): Promise<{ playerHand: number[]; dealerHand: number[] }> {
  const url = `${serverBaseUrl}/seat/${id}/start?bet=${bet}`;
  const response = await fetch(url, { method: "POST" });
  const { player_hand, dealer_hand } = await response.json();
  return { playerHand: player_hand, dealerHand: dealer_hand };
}

export async function hitSeat(id: string): Promise<number> {
  const url = `${serverBaseUrl}/seat/${id}/hit`;
  const response = await fetch(url, { method: "POST" });
  const { card } = await response.json();
  return card;
}

export async function sitSeat(id: string): Promise<void> {
  const url = `${serverBaseUrl}/seat/${id}/sit`;
  await fetch(url, { method: "POST" });
  return; // sit has no return type
}

export async function getSeat(id: string): Promise<ISeat> {
  const url = `${serverBaseUrl}/seat/${id}`;
  const response = await fetch(url, { method: "GET" });
  const seatDTO = await response.json();

  return {
    ...seatDTO,
    round: {
      ...seatDTO.round,
      playerHand: seatDTO.round?.player_hand,
      dealerHand: seatDTO.round?.dealer_hand,
    },
  };
}

export async function endSeat(id: string): Promise<number[]> {
  const url = `${serverBaseUrl}/seat/${id}/end`;
  const response = await fetch(url, { method: "POST" });
  const { dealer_cards } = await response.json();
  return dealer_cards;
}

export async function createSeatAction(event: {
  request: Request;
}): Promise<Response> {
  const formData = await event.request.formData();
  const nickname = formData.get("nickname");
  if (!nickname) throw new Error("You must specify a nickname");
  const id = await createSeat(nickname.toString());
  return redirect(`seat/${id}`);
}

export async function getSeatLoader(event: { params: { seatId: string } }) {
  const seat = await getSeat(event.params.seatId);
  return { seat };
}
