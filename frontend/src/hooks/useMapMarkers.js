import { useEffect, useState } from "react";
import { api } from "../utils/network.js";

export default function useMapMarkers(year, category) {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!year) {
      setMarkers([]);
      return;
    }

    const fetchMapData = async () => {
      try {
        const res = await api.get("/data/map", {
          params: { year, category },
        });

        const mapData = Array.isArray(res.data?.data) ? res.data.data : [];

        const formatted = mapData
          .map((item, index) => ({
            id: `station-${index}`,
            title: item["역명"] || "",
            lat: Number(item["위도"]),
            lng: Number(item["경도"]),
            category: item["기본_분류"] || "",
            strategy: item["광고_집행_전략"] || "",
            homeRatio: Number(item["주거_비중"]) || 0,
            workRatio: Number(item["산업_비중"]) || 0,
            cultureRatio: Number(item["문화_비중"]) || 0,
          }))
          .filter(
            (item) =>
              Number.isFinite(item.lat) &&
              Number.isFinite(item.lng) &&
              item.title
          );

        setMarkers(formatted);
      } catch (error) {
        console.error("지도 데이터 조회 실패:", error);
        setMarkers([]);
      }
    };

    fetchMapData();
  }, [year, category]);

  return markers;
}