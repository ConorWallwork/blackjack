import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import Paper from "@mui/material/Paper";

import { useLoaderData, useNavigate } from "react-router-dom";
import "./leaderboard.css";
import { MdExitToApp } from "@react-icons/all-files/md/MdExitToApp";

export interface ILeaderboardSeat {
  id: string;
  nickname: string;
  stack: number;
  num_rounds: number;
}

const theme = createTheme({
  components: {
    // Name of the component
    MuiTableCell: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          padding: "1px",
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
        },
      },
    },
  },
});
export default function Leaderboard() {
  const { leaderboard } = useLoaderData() as {
    leaderboard: ILeaderboardSeat[];
  };
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <div className="main-container">
        <div className="exit-container">
          <MdExitToApp
            onClick={() => navigate("/")}
            className="exit-button"
          ></MdExitToApp>
        </div>
        <div className="outer-table-container">
          <TableContainer component={Paper}>
            <Table aria-label="Leaderboard">
              <TableHead>
                <TableRow>
                  <TableCell>Nickname</TableCell>
                  <TableCell>Rounds</TableCell>
                  <TableCell>Stack</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((leaderboardSeat) => (
                  <TableRow key={leaderboardSeat.id}>
                    <TableCell>{leaderboardSeat.nickname}</TableCell>
                    <TableCell>{leaderboardSeat.num_rounds}</TableCell>
                    <TableCell>{leaderboardSeat.stack}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </ThemeProvider>
  );
}
