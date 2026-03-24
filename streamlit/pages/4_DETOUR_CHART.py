import streamlit as st
import mariadb
import pandas as pd
from components.navbar import render_navbar
from components.style_loader import load_css

conn_params = {
    "user": "root",
    "password": "1234",
    "host": "192.168.0.201",
    "database": "db_to_air",
    "port": int(3306),
}


@st.cache_data
def get_data():
    """데이터베이스에서 우회 분석 데이터를 가져옵니다."""
    try:
        conn = mariadb.connect(**conn_params)
        cursor = conn.cursor()
        query = """
        SELECT
            d.`년도`,
            d.`월`,
            d.`일`,
            d.`요일`,
            d.`항공사코드`,
            d.`항공편번호`,
            d.`출발공항코드`,
            d.`도착지공항코드`,
            d.`비행거리`
        FROM `항공우회분석` AS d
        ORDER BY d.`년도`, d.`월`
        """
        cursor.execute(query)
        data = cursor.fetchall()
        df = pd.DataFrame(
            data,
            columns=[
                "년도",
                "월",
                "일",
                "요일",
                "항공사코드",
                "항공편번호",
                "출발공항코드",
                "도착지공항코드",
                "비행거리",
            ],
        )
        cursor.close()
        conn.close()

        df["년도"] = pd.to_numeric(df["년도"], errors="coerce")
        df["월"] = pd.to_numeric(df["월"], errors="coerce")
        df["비행거리"] = pd.to_numeric(df["비행거리"], errors="coerce")
        return df

    except mariadb.Error as e:
        st.error(f"데이터베이스 연결 오류: {e}")
        st.info("DB 연결 정보와 테이블 상태를 확인하세요.")
        return pd.DataFrame()


st.set_page_config(
    page_title="우회 분석",
    page_icon="🛫",
    layout="wide",
)

load_css("common.css", "detour.css")
render_navbar(active="airport")

st.markdown(
    """
    <div class="hero-wrap">
        <div class="hero-badge">PORTFOLIO</div>
        <h1 class="hero-title">항공사별 우회 분석</h1>
        <p class="hero-desc">
            항공사별 우회 발생 추이를 연도와 월 기준으로 분석합니다.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

df = get_data()

if not df.empty:
    df = df.dropna(subset=["비행거리", "월", "년도"])

if df is not None and not df.empty:
    st.success("데이터베이스 연결 및 데이터 로드 성공")

    st.markdown('<div class="section-title">조회 조건 설정</div>', unsafe_allow_html=True)

    col1, col2 = st.columns(2)

    with col1:
        options = ["전체"] + sorted(df["항공사코드"].dropna().unique().tolist())
        selected_airline = st.selectbox(
            label="항공사를 선택하세요",
            options=options,
            index=0,
        )

    with col2:
        year_options = sorted(df["년도"].dropna().astype(int).unique().tolist())
        selected_year = st.selectbox(
            "분석할 년도를 선택하세요",
            options=year_options,
        )

    st.markdown("</div>", unsafe_allow_html=True)

    year_df = df[df["년도"] == selected_year]
    chart_df = year_df if selected_airline == "전체" else year_df[year_df["항공사코드"] == selected_airline]

    detour_count = chart_df.groupby("월").size().reset_index(name="우회횟수")
    total_detours = int(detour_count["우회횟수"].sum()) if not detour_count.empty else 0
    monthly_avg = detour_count["우회횟수"].mean() if not detour_count.empty else 0

    st.header(f"{selected_year}년 {selected_airline} 우회 데이터")

    m1, m2 = st.columns(2)
    with m1:
        st.metric("총 우회 횟수", f"{total_detours:,}건")
    with m2:
        st.metric("월평균 우회 횟수", f"{monthly_avg:.1f}건")

    st.divider()

    st.subheader("월별 우회 횟수")
    detour_data = chart_df.groupby("월").size()
    st.bar_chart(detour_data, use_container_width=True)

    with st.expander("상세 데이터 보기"):
        st.dataframe(chart_df, use_container_width=True)

else:
    st.warning("데이터를 불러오지 못했습니다.")