import { BarLoader } from "react-spinners";
import blackJackLogo from "../assets/black-jack.svg";
import "./App.css";
import { useState } from "react";
import { Form, useNavigate, useNavigation } from "react-router-dom";
import { TextField } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#45a445",
      },
    },
  });

  const [newClicked, setNewClicked] = useState(false);
  const navigation = useNavigation();
  const navigator = useNavigate();

  function handleNewClicked() {
    setNewClicked(true);
  }

  return (
    <ThemeProvider theme={theme}>
      <>
        <div className="landing-page">
          <div>
            <a href="https://react.dev" target="_blank">
              <img
                src={blackJackLogo}
                className="logo react"
                alt="React logo"
              />
            </a>
          </div>
          {navigation.state === "loading" ||
          navigation.state === "submitting" ? (
            <BarLoader color={"#45a445"} width={360}></BarLoader>
          ) : (
            <div className="nav">
              {!newClicked ? (
                <button
                  className="nav-button"
                  onClick={() => handleNewClicked()}
                >
                  NEW
                </button>
              ) : (
                <Form method="POST" id="new-seat-form">
                  <div className="new-container">
                    <button type="submit" className="nav-button">
                      TAKE SEAT
                    </button>

                    <TextField
                      className="nav-button"
                      color="primary"
                      name="nickname"
                      required
                      id="nickname"
                      label="Nickname"
                      defaultValue=""
                    />
                  </div>
                </Form>
              )}
              <button
                className="nav-button"
                onClick={() => {
                  navigator("leaderboard");
                }}
              >
                LEADERBOARD
              </button>
            </div>
          )}
        </div>
      </>
    </ThemeProvider>
  );
}

export default App;
