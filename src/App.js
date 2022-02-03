import "./App.css";
import { Routes, Route } from "react-router-dom";

//Component Imports
import Nav from "./components/navBar";
// import AreaStackedGraph from './components/areaStacked';

//Page Imports
import LandingPage from "./pages/landingPage";
import PortfolioPage from "./pages/portfolioPage";
import StockPage from "./pages/stockPage";
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/signUpPage";
import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <div className="App">
            <AuthProvider>
                <header>
                    <Nav></Nav>
                </header>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="/stock" element={<StockPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                </Routes>
            </AuthProvider>
        </div>
    );
}

export default App;
