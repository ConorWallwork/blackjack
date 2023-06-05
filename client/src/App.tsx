import blackJackLogo from "./assets/black-jack.svg";
import "./App.css";

function App() {
  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={blackJackLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Black Jack is here</h1>
      <div className="card">
        <p>
          Coming soon: a light weight, scalabable, modern black jack solution
          built on a serverless architecture
        </p>
      </div>
    </>
  );
}

export default App;
