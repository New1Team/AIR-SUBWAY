import streamlit as st
from components.navbar import render_navbar
from components.style_loader import load_css

st.set_page_config(
    page_title="항공 데이터 분석",
    page_icon="🛫",
    layout="wide",
)

load_css("common.css")
render_navbar(active="airport")

st.markdown(
    """
    <div class="hero-wrap">
        <div class="hero-badge">PORTFOLIO</div>
        <h1 class="hero-title">항공사 운항 리스크와 노선 전략 인사이트</h1>
        <p class="hero-desc">
            항공 노선, 지연 리스크, 우회 패턴, 취소율 데이터를 바탕으로<br>
            운항 안정성과 전략 포인트를 한 화면에서 확인하는 Streamlit 프로젝트입니다.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="kpi-row">
        <div class="kpi-box">
            <div class="kpi-label">분석 주제</div>
            <div class="kpi-value">4개</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-label">핵심 관점</div>
            <div class="kpi-value">리스크</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-label">활용 기술</div>
            <div class="kpi-value">Streamlit</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-label">데이터 저장소</div>
            <div class="kpi-value">MariaDB</div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown('<div class="section-title">분석 구성</div>', unsafe_allow_html=True)

st.markdown(
    """
    <div class="main-grid">
        <div class="main-card">
            <div class="main-card-title">🛫 취항 노선 분석</div>
            <div class="main-card-desc">
                공항 분포와 취항 공항 수를 통해 항공사별 네트워크 범위를 확인합니다.
            </div>
        </div>
        <div class="main-card">
            <div class="main-card-title">⚠ 지연 리스크 분석</div>
            <div class="main-card-desc">
                지연을 단계별로 나누어 항공사별 위험도와 대응 우선순위를 비교합니다.
            </div>
        </div>
        <div class="main-card">
            <div class="main-card-title">🚥 우회 노선 분석</div>
            <div class="main-card-desc">
                우회 발생 패턴을 연도·월 기준으로 분석해 반복되는 운영 이슈를 확인합니다.
            </div>
        </div>
        <div class="main-card">
            <div class="main-card-title">❌ 취소율 분석</div>
            <div class="main-card-desc">
                월별·요일별 취소 패턴과 항공사별 취소 규모를 비교합니다.
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)