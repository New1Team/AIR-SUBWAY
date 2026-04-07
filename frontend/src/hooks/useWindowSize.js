import { useState, useEffect } from 'react';

// 윈도우 크기를 실시간으로 반환하는 커스텀 훅
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 리사이즈 이벤트 등록
    window.addEventListener('resize', handleResize);

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

export default useWindowSize;