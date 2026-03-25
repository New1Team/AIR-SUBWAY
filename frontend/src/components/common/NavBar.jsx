import { useNavigate, useLocation } from "react-router";
import "@assets/navbar.css";

const NavBar = ({ showSubway = true, showAirport = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goHome = () => {
    navigate("/");
  };

  const goSubway = () => {
    navigate("/subway");
  };

  const goAirport = () => {
    window.location.href = "http://localhost:8501";
  };

  return (
    <header className="nav-bar">
      <div className="nav-left" onClick={goHome}>
        <h1 className="nav-logo">PORTFOLIO</h1>
      </div>

      <div className="nav-right">
        <button
          className={`nav-button ${location.pathname === "/" ? "active" : ""}`}
          onClick={goHome}
        >
          Home
        </button>

        {showSubway && (
          <button
            className={`nav-button ${
              location.pathname === "/subway" ? "active" : ""
            }`}
            onClick={goSubway}
          >
            지하철 분석
          </button>
        )}

        {showAirport && (
          <button className="nav-button primary" onClick={goAirport}>
            항공 데이터
          </button>
        )}
      </div>
    </header>
  );
};

export default NavBar;