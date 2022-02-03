import { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import hamburgerIcon from "../assets/hamburger.png";
import exitIcon from "../assets/exit.png";
import AuthContext from "../context/AuthContext";

const Nav = () => {
    const [mobileTabOpen, setMobileTabOpen] = useState(false);
    const [location, setLocation] = useState(0);

    let { user, logoutUser } = useContext(AuthContext);

    const routes = [
        {
            path: "/",
            name: "Home",
        },
        {
            path: "/portfolio",
            name: "My Portfolio",
        },
        {
            path: "/stock",
            name: "Stock",
        },
    ];

    // Toggles the mobile menu overlay
    const toggleMobileMenu = () => {
        setMobileTabOpen(!mobileTabOpen);
    };

    //Manages the back button functionality, so if a user has the mobile menu
    //open and goes back the menu is closed and updated correctly
    const routelocation = useLocation();
    if (routelocation.pathname !== location) {
        setLocation(routelocation.pathname);
        setMobileTabOpen(false);
    }

    return (
        <div>
            <div className="nav-container">
                <img
                    src={mobileTabOpen ? exitIcon : hamburgerIcon}
                    alt={mobileTabOpen ? "close menu" : "open menu"}
                    onClick={toggleMobileMenu}
                    className="mobile-nav-button"
                ></img>
                <nav hidden={!mobileTabOpen} data-visible={mobileTabOpen}>
                    {routes.map((route) => {
                        return (
                            <Link
                                key={route.path}
                                className={
                                    location === route.path ? "nav-item-selected" : "nav-item"
                                }
                                to={route.path}
                            >
                                {route.name}
                            </Link>
                        );
                    })}
                    {user ? (
                        <div>
                            <h4 className="nav-item-selected">{user.first_name}</h4>
                            <button onClick={logoutUser}>Logout</button>
                        </div>
                    ) : (
                        <div>
                            <Link className="nav-item" to={"/login"}>
                                Login
                            </Link>
                            <Link className="nav-item" to={"/signup"}>
                                SignUp
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
            {/* Close nav button */}
            <div
                onClick={toggleMobileMenu}
                className="close-nav"
                hidden={!mobileTabOpen}
                data-visible={mobileTabOpen}
            ></div>
        </div>
    );
};

export default Nav;
