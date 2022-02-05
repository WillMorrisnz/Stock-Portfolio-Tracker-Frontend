import React from "react";

const GraphHeader = () => {
    const r = "0";
    const g = "255";
    const b = "200";

    const gradientstyle =
        "linear-gradient(0deg, rgba(" +
        r +
        "," +
        g +
        "," +
        b +
        ",0) 0%, rgba(" +
        r +
        "," +
        g +
        "," +
        b +
        ",1) 45%)";

    return (
        <div className="stock-header container" style={{ background: gradientstyle }}>
            <h2 className="stock-title">TESLA MOTORS</h2>
            <h3 className="stock-price">$923</h3>
        </div>
    );
};

export default GraphHeader;
