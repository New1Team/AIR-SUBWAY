from pathlib import Path
import streamlit as st

def load_css(*css_files):
    base_dir = Path(__file__).resolve().parent.parent / "styles"
    css_text = ""

    for css_file in css_files:
        css_path = base_dir / css_file
        if css_path.exists():
            css_text += css_path.read_text(encoding="utf-8") + "\n"

    if css_text:
        st.markdown(f"<style>{css_text}</style>", unsafe_allow_html=True)