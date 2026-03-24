import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Maps from "./pages/Maps";
import Card from "./pages/Card";
import NotFound from "./pages/NotFound";

const SubwayPage = () => {
  return (
    <>
      <Card />
    </>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/subway" element={<SubwayPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;