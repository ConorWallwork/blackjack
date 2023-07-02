import { serverBaseUrl } from "../environments/environment";
import { ILeaderboardSeat } from "../routes/leaderboard";

export async function getLeaderboard(): Promise<ILeaderboardSeat[]> {
  const url = `${serverBaseUrl}/leaderboard`;
  const response = await fetch(url, { method: "GET" });
  return await response.json();
}
export async function getLeaderboardLoader(event: any) {
  const leaderboard = await getLeaderboard();
  return { leaderboard };
}
