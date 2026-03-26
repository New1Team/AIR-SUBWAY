
Navbar.jsx 의 props
const NavBar = ({ showSubway = true, showAirport = true }) => {...}

loading-overlay.jsx 의 props
const LoadingOverlay = ({ show }) =>

ScrollToTop.jsx 의 props
const ScrollToTop = () =>



KpiCard.jsx 의 props
const KpiCard = ({ title, columns = 'kpi-2col', items = [], fmt }) => {

    Props이름   데이터타입  기본값                        역할
    title       String   없음          Kpi카드의 상단 제목 (예: "오늘의 방문자 수")
    columns     String   'kpi-2col'         '레이아웃 스타일을 결정하는 CSS 클래스명
    itemsArray[]카드 안에 표시할 데이터들의 배열 (가장 핵심!)fmtFunction없음숫자를 세자리 콤마 등으로 변환해주는 함수



