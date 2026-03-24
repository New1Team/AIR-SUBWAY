import { useNavigate } from "react-router";
import "@assets/home.css";

const Home = () => {
  const navigate = useNavigate();

  const goSubwayPage = () => {
    navigate("/subway");
  };

  const goAirPage = () => {
    window.open("http://localhost:8501", "_blank");
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <p className="home-badge">PORTFOLIO</p>
        <h1 className="home-title">데이터 분석 프로젝트 포트폴리오</h1>
        <p className="home-desc">
          React, FastAPI, Streamlit 기반으로 제작한
          <br />
          지하철 분석 / 항공 데이터 분석 프로젝트를 모아둔 메인 페이지입니다.
        </p>
      </section>

      <section className="project-section">
        <div className="project-card">
          <div className="project-tag">PROJECT 01</div>
          <h2 className="project-title">서울 지하철 분석 대시보드</h2>
          <p className="project-desc">
            역별 이용 패턴과 성격 분류를 기반으로
            광고 집행 전략을 시각화한 React + FastAPI 프로젝트
          </p>

          <div className="tech-list">
            <span>React</span>
            <span>FastAPI</span>
            <span>MariaDB</span>
          </div>

          <button className="project-button primary" onClick={goSubwayPage}>
            프로젝트 보기
          </button>
        </div>

        <div className="project-card">
          <div className="project-tag">PROJECT 02</div>
          <h2 className="project-title">항공 데이터 분석 리포트</h2>
          <p className="project-desc">
            공항 지도, 결항, 우회, 리스크 차트를 바탕으로
            항공 운항 데이터를 분석한 Streamlit 프로젝트
          </p>

          <div className="tech-list">
            <span>Python</span>
            <span>Streamlit</span>
            <span>Pandas</span>
          </div>

          <button className="project-button secondary" onClick={goAirPage}>
            프로젝트 보기
          </button>
        </div>
      </section>

      <section className="summary-section">
        <div className="summary-box">
          <h3>구성</h3>
          <p>지하철 분석 웹 서비스 + 항공 데이터 분석 앱</p>
        </div>

        <div className="summary-box">
          <h3>목적</h3>
          <p>분석 결과를 포트폴리오 형식으로 한 화면에서 소개</p>
        </div>

        <div className="summary-box">
          <h3>실행 방식</h3>
          <p>React 메인 진입점에서 각 프로젝트로 이동</p>
        </div>
      </section>
    </div>
  );
};

export default Home;