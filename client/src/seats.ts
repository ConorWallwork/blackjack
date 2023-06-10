import { redirect } from "react-router-dom";
import { serverBaseUrl } from "./environments/environment";
import { ISeat } from "./routes/seat";

export async function createSeat(nickname: string): Promise<string> {
  const url = `${serverBaseUrl}/seat/new?nickname=${nickname}`;
  const response = await fetch(url, { method: "POST", mode: "cors" });
  const id = (await response.json()).id;
  return id;
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

export async function getSeat(id: string): Promise<ISeat> {
  const url = `${serverBaseUrl}/seat/${id}`;
  const response = await fetch(url, { method: "GET" });
  const seat = await response.json();
  return seat;
}

export async function getSeatLoader(event: { params: any }) {
  const seat = await getSeat(event.params.seatId);
  return { seat };
}
