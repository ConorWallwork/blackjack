import blackJackLogo from "./assets/black-jack.svg";
import "./App.css";
import { useState } from "react";
import { Link } from "react-router-dom";

function App() {
  const [newClicked, setNewClicked] = useState(false);

  function handleNewClicked(clicked: boolean) {
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
        <div className="new-container">
          <button
            className="nav-button"
            onClick={() => handleNewClicked(newClicked)}
          >
            {!newClicked ? "NEW" : <Link to={"seat/1"}>TAKE SEAT</Link>}
          </button>
          <input type="text" hidden={!newClicked}></input>
        </div>
        <button className="nav-button">LEADERBOARD</button>
      </div>
    </>
  );
}

export default App;
