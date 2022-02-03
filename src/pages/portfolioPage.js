import AreaStackedGraph from "../components/areaStacked";
import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";

const PortfolioPage = () => {
    let { user } = useContext(AuthContext);

    const [portfolioValue, setPortfolioValue] = useState(0.0);

    const [stockSeriesData, setStockSeriesData] = useState([]);
    const [user_holdings_data, set_user_holdings_data] = useState([]);

    const [filteredSeriesData, setFilteredSeriesData] = useState([]);
    const [filterRange, setFilterRange] = useState(240);
    const [darkMode, setDarkMode] = useState(false);
    const toggleDarkMode = () => setDarkMode(!darkMode);

    const [normalizeYAxis, setNormalizeYAxis] = useState(true);
    const toggleNormalizeYAxis = () => setNormalizeYAxis(!normalizeYAxis);

    const [holdingSymbols, setHoldingSymbols] = useState(true);
    const toggleHoldingSymbols = () => setHoldingSymbols(!holdingSymbols);

    const [colors, set_Colors] = useState([
        "#ffc409",
        "#262d97",
        "#036ecd",
        "#9ecadd",
        "#51666e",
        "#f14702",
        "#8380b6",
        "#7DC95E",
    ]);

    useEffect(() => {
        if (user.user_id !== undefined) {
            fetchStock(user.user_id);
        }
    }, []);

    useEffect(() => {
        setFilteredSeriesData([...stockSeriesData].splice(0, filterRange));
    }, [filterRange]);

    useEffect(() => {
        calcPortfolioValue();
    }, [stockSeriesData]);

    const calcPortfolioValue = () => {
        if (stockSeriesData[0] !== undefined) {
            let total = 0.0;
            let keys = Object.keys(stockSeriesData[0]).filter((k) => k !== "date");
            for (let key in keys) {
                total += parseFloat(stockSeriesData[0][keys[key]]);
            }
            setPortfolioValue(total);
        }
    };

    //API request
    async function fetchStock(user_id) {
        const holdings_request = await fetch(`http://127.0.0.1:8000/holdings/${user_id}`, {
            method: "GET",
            headers: {
                Authorization: `JWT ${localStorage.getItem("token")}`,
            },
        });
        const holdings_data = await holdings_request.json();
        console.log("Holdings data:", holdings_data);
        set_user_holdings_data(holdings_data);

        //User holding data
        const temp = [];
        for (const holding in holdings_data) {
            temp.push(holdings_data[holding]["id"]);
        }
        const response2 = await fetch(`http://127.0.0.1:8000/getStockData/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ stock_ids: temp }),
        });
        console.log("Held Stock ID's:", temp);
        const data = await response2.json();
        const series = data[1];
        const metaData = data[0];

        const holdingsSeriesData = [];

        for (let date in series) {
            const dateData = {};
            for (let holding in holdings_data) {
                let scale = 0;
                for (let item in holdings_data[holding].holdings) {
                    if (
                        series[date]["date"] >= holdings_data[holding].holdings[item].purchaseDate
                    ) {
                        scale += parseFloat(holdings_data[holding].holdings[item].quantity);
                    }
                }
                dateData[holdings_data[holding].symbol] =
                    scale * series[date][holdings_data[holding].symbol];
            }
            dateData["date"] = series[date]["date"];
            holdingsSeriesData.push(dateData);
        }
        console.log("series Data:", holdingsSeriesData);

        setStockSeriesData(holdingsSeriesData);
        setFilteredSeriesData(holdingsSeriesData);
    }

    return (
        <main>
            <h2>Portfolio Page</h2>
            <h2>Value: {"$" + portfolioValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}</h2>
            <AreaStackedGraph
                seriesData={filteredSeriesData}
                width={1000}
                height={750}
                normalize={normalizeYAxis}
                colors={colors}
                darkMode={darkMode}
                holdings={user_holdings_data}
                holdingSymbols={holdingSymbols}
            ></AreaStackedGraph>
        </main>
    );
};

export default PortfolioPage;
