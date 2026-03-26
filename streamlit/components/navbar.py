import streamlit as st


def render_navbar(active: str = "airport"):
    home_class = "custom-nav-btn active" if active == "home" else "custom-nav-btn"
    subway_class = "custom-nav-btn active" if active == "subway" else "custom-nav-btn"
    airport_class = "custom-nav-btn primary" if active == "airport" else "custom-nav-btn"

    st.markdown(
        f"""
        <div class="custom-top-nav">
            <div class="custom-top-nav-left">PORTFOLIO</div>
            <div class="custom-top-nav-right">
                <a class="{home_class}" href="/" target="_self">Home</a>
                <a class="{subway_class}" href="/subway" target="_self">지하철 분석</a>
                <a class="{airport_class}" href="/streamlit/" target="_self">항공 데이터</a>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
