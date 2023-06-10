import blackJackLogo from "../assets/black-jack.svg";
import "./App.css";
import { useState } from "react";
import { Form } from "react-router-dom";

function App() {
  const [newClicked, setNewClicked] = useState(false);

  function handleNewClicked() {
    setNewClicked(true);
  }

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={blackJackLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div className="nav">
        {!newClicked ? (
          <button className="nav-button" onClick={() => handleNewClicked()}>
            NEW
          </button>
        ) : (
          <>
            <Form method="POST" id="new-seat-form">
              <div className="new-container">
                <button type="submit" className="nav-button">
                  TAKE SEAT
                </button>
                <input
                  placeholder="Nickname"
                  type="text"
                  name="nickname"
                ></input>
              </div>
            </Form>
          </>
        )}
        <button className="nav-button">LEADERBOARD</button>
      </div>
    </>
  );
}

export default App;
