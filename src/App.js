import './App.css';
import { Routes, Route } from "react-router-dom";

//Component Imports
import Nav from './components/navBar';
// import AreaStackedGraph from './components/areaStacked';

//Page Imports
import LandingPage from './pages/landingPage';
import PortfolioPage from './pages/portfolioPage';
import StockPage from './pages/stockPage';

function App() {
  return (
    <div className="App">
      <header>
        <Nav></Nav>
      </header>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/stock" element={<StockPage />} />
      </Routes>
    </div>
  );
}

export default App;
