import { serverBaseUrl } from "./environments/environment";

export async function createSeat(nickname: string): Promise<string> {
  const url = `${serverBaseUrl}/seat/new?nickname=${nickname}`;
  const response = await fetch(url, { method: "POST" });
  const id = await response.json();
  return id;
}
