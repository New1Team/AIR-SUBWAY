import { useMemo, useState } from "react";
import useMapMarkers from "@hooks/useMapMarkers";
import SubwayMap from "@components/maps/SubwayMap";
import "@assets/Maps.css";
import { api } from "@utils/network";
import "@assets/Dropdown.css";

const Maps = ({ year = 2021 }) => {
  const [map, setMap] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [currCategory, setCurrCategory] = useState("전체");
  const [search, setSearch] = useState("")
  const [zoomLevel, setZoomLevel] = useState(8);
  const [searchResult, setSearchResult] = useState(null);

  const markers = useMapMarkers(year, currCategory);

  const [center, setCenter] = useState({ lat: 37.5547, lng: 126.9707 });

  const avgData = useMemo(() => {
    if (!markers.length) {
      return {
        home: 0,
        work: 0,
        culture: 0,
      };
    }

    const sum = markers.reduce(
      (acc, cur) => {
        acc.home += Number(cur.homeRatio) || 0;
        acc.work += Number(cur.workRatio) || 0;
        acc.culture += Number(cur.cultureRatio) || 0;
        return acc;
      },
      { home: 0, work: 0, culture: 0 }
    );

    return {
      home: sum.home / markers.length,
      work: sum.work / markers.length,
      culture: sum.culture / markers.length,
    };
  }, [markers]);


  // ====================================
  //  검색창 이벤트 함수
  // ====================================
  const submitEvent = (e) => {
    e.preventDefault()

    if (search) {
      const params = { "search": search }
      api.post("/data/map", params)
        .then(res => {
          if (res.data.status) {
            const target_data = res.data.data
            // 해당하는 역만 표출
            // 역 호버 고정
            // 센터 해당 위경도로 변경
            setCenter({ lat: target_data.위도, lng: target_data.경도 })
            setZoomLevel(4)

            setSearchResult({
              id: `search-${target.대표역번호}`,
              title: target.역명,
              lat: Number(target.위도),
              lng: Number(target.경도),
              category: target.기본_분류,
              strategy: target.광고_집행_전략,
              homeRatio: target.주거_비중,
              workRatio: target.산업_비중,
              cultureRatio: target.문화_비중
            });

            setSearch("")
          }
        })
    }
  }
  // ====================================
  //  카테고리 선택 & 검색 동시 실행 막기
  // ====================================

  const catecoryChange = (category) => {
    setSearchResult(null)
    setCurrCategory(category)
  }
  const displayMarkers = searchResult ? [searchResult] : markers

  // ====================================
  //  호선별 검색용 드롭다운 컴포넌트
  // ====================================

  const Dropdown = ({ options, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [select, setSelct] = useState('호선별 보기')

    const toggle = () => {
      setIsOpen(!isOpen)
    }
    const clickEvent = option => {
      setSelct(option)
      setIsOpen(false)
      onSelect(option)
    }
    return (
      <div className="dropdown-container">
        <button type="button" className="dropdown-label" onClick={toggle}>
          {select}<span>{isOpen ? "▲" : "▼"}</span>
        </button>
        {isOpen && (
          <ul className="dropdown-list">
            {options.map((option) => (
              <li key={option} className="dropdown-item" onClick={() => clickEvent(option)}>
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }


  return (
    <div className="maps-page">
      <div className="map-card">
        <div className="map-header">
          <div className="map-category-buttons">
            {["전체", "주거지", "산업지", "문화권"].map((category) => (
              <button
                key={category}
                className={`map-category-btn ${currCategory === category ? "active" : ""
                  }`}
                onClick={() => { catecoryChange(category); }}
              >
                {category}
              </button>
            ))}
            {/* 검색창 영역 */}
            <form onSubmit={submitEvent} className="map-search-form">
              <input className="map-search-input" type="text" name="search" id="search"
                value={search} onChange={e => setSearch(e.target.value)} placeholder="역 이름을 검색하세요" />
              <button type="submit" className="inner-search-btn">검색</button>
            </form>
            {/* 호선별 보기 */}
            <Dropdown />
          </div>
        </div>

        <SubwayMap
          map={map}
          setMap={setMap}
          center={center}
          zoomLevel={zoomLevel}
          markers={displayMarkers}
          hoveredMarkerId={hoveredMarkerId}
          setHoveredMarkerId={setHoveredMarkerId}
          avgData={avgData}
        />


        {/* 지도 아래 한줄 중복되어 있어서 일단 주석처리함 */}

        {/* <div className="analysis-info-box">
          <div className="analysis-info-title">분석 지표</div>
          <div className="analysis-info-desc">
            역별 전체 이용 패턴 대비 성격별 100% 환산 상대적 점유 비중
          </div>

          <div className="analysis-legend">
            <div className="legend-row">
              <span className="dot focus" />
              집중지역
            </div>
            <div className="legend-row">
              <span className="dot dominant" />
              우세지역
            </div>
            <div className="legend-row">
              <span className="dot mixed" />
              복합지역
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Maps;