import streamlit as st
import pandas as pd
import mariadb
from db import getConn
from components.navbar import render_navbar
from components.style_loader import load_css


@st.cache_data
def get_all_airlines():
    try:
        conn = getConn()
        cursor = conn.cursor()
        query = """
        SELECT DISTINCT `항공사코드`
        FROM `항공취소분석`
        ORDER BY `항공사코드`
        """
        cursor.execute(query)
        airlines = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return airlines
    except Exception as e:
        st.error(f"항공사 목록 로드 실패: {e}")
        return []


@st.cache_data
def get_airline_stats(year):
    try:
        conn = getConn()
        query = f"""
        SELECT `항공사코드`, COUNT(*) AS cnt
        FROM `항공취소분석`
        WHERE `년도` = {year}
        GROUP BY `항공사코드`
        ORDER BY cnt DESC
        """
        df_all = pd.read_sql(query, conn)
        conn.close()
        return df_all
    except Exception as e:
        st.error(f"통계 로드 실패: {e}")
        return pd.DataFrame()


@st.cache_data
def load_cancellation_data(year, airline):
    try:
        conn = getConn()
        query = f"""
        SELECT `년도`, `월`, `일`, `요일`, `항공사코드`, `항공편번호`, `출발공항코드`
        FROM `항공취소분석`
        WHERE `년도` = {year}
          AND `항공사코드` = '{airline}'
        """
        df = pd.read_sql(query, conn)
        conn.close()
        return df
    except Exception as e:
        st.error(f"데이터 로드 실패: {e}")
        return pd.DataFrame()


st.set_page_config(page_title="취소 분석", layout="wide")

load_css("common.css", "cancel.css")
render_navbar(active="airport")

st.markdown(
    """
    <div class="hero-wrap">
        <div class="hero-badge">PORTFOLIO</div>
        <h1 class="hero-title">취소 트렌드 분석</h1>
        <p class="hero-desc">
            항공사별 취소 현황을 비교하고,
            월별·요일별 취소 패턴을 분석합니다.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)
st.markdown('<div class="section-title">조회 조건 설정</div>',
            unsafe_allow_html=True)

airline_list = get_all_airlines()

col_sel1, col_sel2 = st.columns(2)

with col_sel1:
    selected_year = st.selectbox("년도 선택", [1987, 1988, 1989], index=2)

with col_sel2:
    selected_airline = st.selectbox("항공사 코드 선택", options=airline_list)

st.markdown("</div>", unsafe_allow_html=True)

all_stats = get_airline_stats(selected_year)
data = load_cancellation_data(selected_year, selected_airline)

if not all_stats.empty:
    st.subheader(f"{selected_year}년 전체 항공사 취소 현황")

    total_market_cancelled = all_stats["cnt"].sum()
    market_avg = all_stats["cnt"].mean()

    m_col1, m_col2 = st.columns(2)

    with m_col1:
        st.metric("전체 항공사 총 취소", f"{total_market_cancelled:,}건")

    with m_col2:
        st.metric("전체 항공사 평균 취소", f"{market_avg:.1f}건")

    st.divider()

if not data.empty and not all_stats.empty:
    my_cancel_count = len(data)
    my_monthly_avg = my_cancel_count / data["월"].nunique()
    avg_cancel_count = all_stats["cnt"].mean()

    try:
        rank = all_stats[all_stats["항공사코드"] == selected_airline].index[0] + 1
        total_airlines = len(all_stats)
    except IndexError:
        rank = "-"
        total_airlines = len(all_stats)

    st.header(f"{selected_year}년 {selected_airline} 취소 데이터 분석")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric("선택 항공사 취소 건수", f"{my_cancel_count:,}건")

    with col2:
        st.metric("월평균 취소 건수", f"{my_monthly_avg:.1f}건")

    with col3:
        st.metric("취소 횟수 순위", f"{rank}위 / {total_airlines}개")

    st.divider()

    col_chart1, col_chart2 = st.columns(2)

    with col_chart1:
        st.subheader("월별 취소 건수")
        st.bar_chart(data.groupby("월").size())

    with col_chart2:
        st.subheader("요일별 취소 건수")
        st.bar_chart(data.groupby("요일").size())

    with st.expander("상세 데이터 보기"):
        st.dataframe(data, use_container_width=True)

else:
    st.warning("데이터를 불러올 수 없습니다.")
