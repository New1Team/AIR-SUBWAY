from db import get_data
import streamlit as st
import pandas as pd
import altair as alt
from components.navbar import render_navbar
from components.style_loader import load_css

st.set_page_config(page_title="Risk Chart", layout="wide")

load_css("common.css", "risk_chart.css")

render_navbar(active="airport")

# -----------------------------
# 데이터 로드
# -----------------------------
sql = """
SELECT *
FROM risk_level
"""
cols = ['년도', '월', '항공사코드', '항공사명', '전체비행수', 'risk1_경미', 'risk2_보통', 'risk3_위험']
df = get_data(sql, cols)

if df.empty:
    st.warning("데이터를 불러오지 못했습니다.")
    st.stop()

# -----------------------------
# 전처리
# -----------------------------
num_cols = ['년도', '월', '전체비행수', 'risk1_경미', 'risk2_보통', 'risk3_위험']
for col in num_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')

df['항공사코드'] = df['항공사코드'].astype(str).str.strip()
df['항공사명'] = df['항공사명'].astype(str).str.strip()
df = df.dropna(subset=['년도', '항공사명']).copy()

years = sorted(df['년도'].dropna().astype(int).unique().tolist())

# -----------------------------
# 제목
# -----------------------------
st.markdown(
    """
    <div class="hero-wrap">
        <div class="hero-badge">PORTFOLIO</div>
        <h1 class="hero-title">지연 리스크 분석</h1>
        <p class="hero-desc">
            연도별 항공사 지연 리스크를 분석하고
            위험도를 비교합니다.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

# -----------------------------
# 상단 요약
# -----------------------------
st.markdown("""
<div class="hero-box">
    <div class="hero-title">핵심 요약</div>
    <div class="hero-grid">
        <div class="hero-chip">
            <div class="hero-chip-title">1단계</div>
            <div class="hero-chip-value">30분 이하<br>경미 지연</div>
        </div>
        <div class="hero-chip">
            <div class="hero-chip-title">2단계</div>
            <div class="hero-chip-value">30분 초과 ~ 3시간 미만<br>중간 지연</div>
        </div>
        <div class="hero-chip">
            <div class="hero-chip-title">3단계</div>
            <div class="hero-chip-value">3시간 이상<br>고위험 지연</div>
        </div>
        <div class="hero-chip">
            <div class="hero-chip-title">분석 기준</div>
            <div class="hero-chip-value">선택 연도 기준<br>항공사별 리스크 비교</div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)



# -----------------------------
# 연도 선택
# -----------------------------
col_filter1, col_filter2 = st.columns([1, 5])
with col_filter1:
    selected_year = st.selectbox("연도 선택", options=years, index=0)

year_df = df[df['년도'].astype(int) == int(selected_year)].copy()

# -----------------------------
# 연도별 항공사 집계
# -----------------------------
year_summary = (
    year_df.groupby(['항공사코드', '항공사명'], as_index=False)[['전체비행수', 'risk1_경미', 'risk2_보통', 'risk3_위험']]
    .sum()
    .sort_values('항공사명')
    .reset_index(drop=True)
)

year_summary['전체지연횟수'] = (
    year_summary['risk1_경미'] +
    year_summary['risk2_보통'] +
    year_summary['risk3_위험']
)

# -----------------------------
# 3단계 기준 위험 등급 계산
# 상위 30% = 위험 / 상위 30~60% = 경고 / 나머지 = 안전
# -----------------------------
risk_rank_df = year_summary[['항공사명', 'risk3_위험']].copy()
risk_rank_df = risk_rank_df.sort_values(['risk3_위험', '항공사명'], ascending=[False, True]).reset_index(drop=True)
risk_rank_df['risk3_rank'] = risk_rank_df.index + 1
risk_rank_df['백분위'] = risk_rank_df['risk3_rank'] / len(risk_rank_df)

def classify_risk(p):
    if p <= 0.30:
        return '위험'
    elif p <= 0.60:
        return '경고'
    else:
        return '안전'

risk_rank_df['위험등급'] = risk_rank_df['백분위'].apply(classify_risk)

year_summary = year_summary.merge(
    risk_rank_df[['항공사명', 'risk3_rank', '백분위', '위험등급']],
    on='항공사명',
    how='left'
)

danger_cnt = int((year_summary['위험등급'] == '위험').sum())
warning_cnt = int((year_summary['위험등급'] == '경고').sum())
safe_cnt = int((year_summary['위험등급'] == '안전').sum())

# -----------------------------
# 메인 그래프
# -----------------------------
line_df = year_summary.rename(columns={
    'risk1_경미': '30분 이하',
    'risk2_보통': '3시간 미만',
    'risk3_위험': '3시간 이상'
})

st.subheader(f"{selected_year}년 항공사별 지연 리스크 현황")
st.markdown(
    '<div class="small-help">선택한 연도 기준으로 항공사별 리스크 단계 횟수를 비교합니다.</div>',
    unsafe_allow_html=True
)

total_group_cnt = danger_cnt + warning_cnt + safe_cnt

danger_pct = (danger_cnt / total_group_cnt * 100) if total_group_cnt else 0
warning_pct = (warning_cnt / total_group_cnt * 100) if total_group_cnt else 0
safe_pct = (safe_cnt / total_group_cnt * 100) if total_group_cnt else 0


st.line_chart(
    data=line_df,
    x="항공사명",
    y=['30분 이하', '3시간 미만', '3시간 이상'],
    x_label='항공사',
    y_label='지연 횟수',
    color=["#1f77b4", "#0bcfd6", "#582ca0"],
    width="stretch",
    height=420,
    use_container_width=True
)


# -----------------------------
# 전체 요약 카드
# -----------------------------
st.subheader("전체 단계별 요약")

total_sum = year_summary['전체지연횟수'].sum()
avg_sum = year_summary['전체지연횟수'].mean()

max_total_row = year_summary.loc[year_summary['전체지연횟수'].idxmax()]
min_total_row = year_summary.loc[year_summary['전체지연횟수'].idxmin()]

sum_c1, sum_c2, sum_c3 = st.columns(3)

with sum_c1:
    st.markdown(f"""
    <div class="summary-box">
        <div class="summary-title">전체 지연 횟수</div>
        <div class="summary-main">{int(total_sum):,}회</div>
        <div class="summary-sub">선택 연도 전체 합계</div>
    </div>
    """, unsafe_allow_html=True)

with sum_c2:
    st.markdown(f"""
    <div class="summary-box">
        <div class="summary-title">평균 지연 횟수</div>
        <div class="summary-main">{avg_sum:,.1f}회</div>
        <div class="summary-sub">항공사당 평균 지연 횟수</div>
    </div>
    """, unsafe_allow_html=True)

with sum_c3:
    st.markdown(f"""
    <div class="summary-box">
        <div class="summary-title">최대 / 최소 항공사</div>
        <div class="summary-main ellipsis-2" title="최대: {max_total_row['항공사명']} / 최소: {min_total_row['항공사명']}">
            최대: {max_total_row['항공사명']}<br>최소: {min_total_row['항공사명']}
        </div>
        <div class="summary-sub">
            최대 {int(max_total_row['전체지연횟수']):,}회<br>
            최소 {int(min_total_row['전체지연횟수']):,}회
        </div>
    </div>
    """, unsafe_allow_html=True)

# -----------------------------
# 리스크 단계별 카드
# -----------------------------
st.markdown("### 리스크 단계별 요약")

risk_cols = [
    ('risk1_경미', '1단계'),
    ('risk2_보통', '2단계'),
    ('risk3_위험', '3단계')
]

detail_c1, detail_c2, detail_c3 = st.columns(3)

for box_col, (col_name, label) in zip([detail_c1, detail_c2, detail_c3], risk_cols):
    max_row = year_summary.loc[year_summary[col_name].idxmax()]
    min_row = year_summary.loc[year_summary[col_name].idxmin()]
    avg_val = year_summary[col_name].mean()

    box_col.markdown(f"""
    <div class="summary-box">
        <div class="summary-title">{label}</div>
        <div class="summary-main">평균 {avg_val:,.1f}회</div>
        <div class="summary-sub">
            <span class="ellipsis-2" title="최다 {max_row['항공사명']} {int(max_row[col_name]):,}회">
                최다 <b>{max_row['항공사명']}</b> {int(max_row[col_name]):,}회
            </span><br>
            <span class="ellipsis-2" title="최소 {min_row['항공사명']} {int(min_row[col_name]):,}회">
                최소 <b>{min_row['항공사명']}</b> {int(min_row[col_name]):,}회
            </span>
        </div>
    </div>
    """, unsafe_allow_html=True)


st.markdown(f"""
            
### 
### 3 단계 지연 대응 위험 전체 요약
<div class="risk-top-grid">
    <div class="risk-top-card risk-top-danger">
        <div class="risk-top-title">위험군</div>
        <div class="risk-top-main">{danger_cnt}개 · {danger_pct:.1f}%</div>
        <div class="risk-top-sub">3단계 지연이 상위 30% 이상인 항공사 항공사</div>
    </div>
    <div class="risk-top-card risk-top-warning">
        <div class="risk-top-title">경고군</div>
        <div class="risk-top-main">{warning_cnt}개 · {warning_pct:.1f}%</div>
        <div class="risk-top-sub">3단계 지연이 상위 30~60%인 항공사</div>
    </div>
    <div class="risk-top-card risk-top-safe">
        <div class="risk-top-title">안전군</div>
        <div class="risk-top-main">{safe_cnt}개 · {safe_pct:.1f}%</div>
        <div class="risk-top-sub">3단계 지연이 하위 40%인 항공사</div>
    </div>
</div>
""", unsafe_allow_html=True)

# -----------------------------
# 항공사 선택 상세
# -----------------------------
st.divider()
st.subheader("선택 항공사 상세")

airline_names = sorted(year_summary['항공사명'].dropna().unique().tolist())

select_col1, select_col2 = st.columns([1, 5])
with select_col1:
    selected_airline = st.selectbox("항공사 선택", options=airline_names, index=0)

selected_row = year_summary[year_summary['항공사명'] == selected_airline].iloc[0]
total_airlines = len(year_summary)

def get_rank(df_rank, col_name, airline_name):
    ranked = df_rank[['항공사명', col_name]].sort_values([col_name, '항공사명'], ascending=[False, True]).reset_index(drop=True)
    ranked['순위'] = ranked.index + 1
    return int(ranked.loc[ranked['항공사명'] == airline_name, '순위'].iloc[0])

rank1 = get_rank(year_summary, 'risk1_경미', selected_airline)
rank2 = get_rank(year_summary, 'risk2_보통', selected_airline)
rank3 = get_rank(year_summary, 'risk3_위험', selected_airline)

risk_level = selected_row['위험등급']
risk_rank = int(selected_row['risk3_rank'])
risk_percentile = float(selected_row['백분위']) * 100

if risk_level == '위험':
    grade_color = '#dc2626'
    grade_border = '2px solid #dc2626'
elif risk_level == '경고':
    grade_color = '#d97706'
    grade_border = '2px solid #d97706'
else:
    grade_color = '#16a34a'
    grade_border = '2px solid #16a34a'

st.markdown(f"""
<div class="risk-grade-box" style="border:{grade_border};">
    <div class="summary-title">지연 대응 위험 등급</div>
    <div class="summary-main" style="color:{grade_color};">{risk_level}</div>
    <div class="summary-sub">
        3단계 지연 기준 {risk_rank}위 / {total_airlines}<br>
        상대 위치 상위 {risk_percentile:.1f}%
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown(
    f"""
    <div class="analysis-box">
        <b>{selected_year}년 {selected_airline}</b>
    </div>
    """,
    unsafe_allow_html=True
)

card1, card2, card3 = st.columns(3)

card1.markdown(f"""
<div class="rank-box">
    <div class="rank-title">1단계</div>
    <div class="rank-value">{int(selected_row['risk1_경미']):,}회</div>
    <div class="rank-sub">{rank1}등 / {total_airlines}</div>
</div>
""", unsafe_allow_html=True)

card2.markdown(f"""
<div class="rank-box">
    <div class="rank-title">2단계</div>
    <div class="rank-value">{int(selected_row['risk2_보통']):,}회</div>
    <div class="rank-sub">{rank2}등 / {total_airlines}</div>
</div>
""", unsafe_allow_html=True)

card3.markdown(f"""
<div class="rank-box">
    <div class="rank-title">3단계</div>
    <div class="rank-value">{int(selected_row['risk3_위험']):,}회</div>
    <div class="rank-sub">{rank3}등 / {total_airlines}</div>
</div>
""", unsafe_allow_html=True)

# -----------------------------
# 선택 항공사 차트
# -----------------------------
detail_df = pd.DataFrame({
    '리스크단계': ['1단계', '2단계', '3단계'],
    '횟수': [
        int(selected_row['risk1_경미']),
        int(selected_row['risk2_보통']),
        int(selected_row['risk3_위험'])
    ]
})

detail_chart = (
    alt.Chart(detail_df)
    .mark_bar(size=60)
    .encode(
        x=alt.X('리스크단계:N', title=None, sort=['1단계', '2단계', '3단계']),
        y=alt.Y('횟수:Q', title='횟수'),
        color=alt.Color(
            '리스크단계:N',
            scale=alt.Scale(
                domain=['1단계', '2단계', '3단계'],
                range=['#1f77b4', '#0bcfd6', '#582ca0']
            ),
            legend=None
        ),
        tooltip=[
            alt.Tooltip('리스크단계:N', title='단계'),
            alt.Tooltip('횟수:Q', title='횟수', format=',')
        ]
    )
    .properties(
        height=340,
        title=f"{selected_airline} 단계별 횟수"
    )
)

st.altair_chart(detail_chart, use_container_width=True)