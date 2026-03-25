import { Routes, Route } from "react-router-dom";
import Home from "@pages/home";
import Card from "@pages/Card";
import NavBar from "@components/common/NavBar";
import ScrollToTop from "@components/common/ScrollToTop";
import NotFound from "@pages/NotFound";
import "./App.css";

const SubwayPage = () => {
  return (
    <div>
      <Card />
    </div>
  );
};

function App() {
  return (
    <>
      <NavBar />
      <ScrollToTop />

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subway" element={<SubwayPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;