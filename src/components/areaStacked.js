import React, { useState } from "react";
import { LinearGradient } from "@visx/gradient";
import { scaleTime, scaleLinear } from "@visx/scale";
import { timeFormat, timeParse } from "d3-time-format";
import "../App.css";
import GridRows from "@visx/grid/lib/grids/GridRows";
import GridColumns from "@visx/grid/lib/grids/GridColumns";
import AxisBottom from "@visx/axis/lib/axis/AxisBottom";
import AxisLeft from "@visx/axis/lib/axis/AxisLeft";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import Bar from "@visx/shape/lib/shapes/Bar";
import AreaStack from "@visx/shape/lib/shapes/AreaStack";
import { curveLinear, curveMonotoneX, curveStep } from "d3-shape";
import Line from "@visx/shape/lib/shapes/Line";
import { localPoint } from "@visx/event";
import RadialGradient from "@visx/gradient/lib/gradients/RadialGradient";
import { PatternWaves } from "@visx/pattern";
import { GlyphCircle } from "@visx/glyph";

//Format and get data
const getDate = timeParse("%Y-%m-%d");
const tooltipDateFormat = timeFormat("%b %d, %y");
const x = (d) => getDate(d.date);

function AreaStackedGraph({
    seriesData,
    width,
    height,
    colors,
    darkMode,
    holdings = [],
    holdingSymbols = false,
    stockPage = false,
}) {
    const [tooltip, setTooltip] = useState(50);
    const [hideTooltip, setHideTooltip] = useState(true);

    // Graph bounds
    const margin = { top: 20, bottom: 40, left: 60, right: 20 };
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    const getColor = (index) => colors[index % colors.length];
    //Checks to see if there is valid data otherwise dont display graph
    if (seriesData.length === 0) {
        return <h2>Loading</h2>;
    }

    const keys = Object.keys(seriesData[0]).filter((k) => k !== "date");
    const keysLen = Object.keys(keys).length;

    const y = (d) => {
        let total = 0.0;
        for (var i in [...Array(keysLen).keys()]) {
            total += parseFloat(d[keys[i]]);
        }
        return total;
    };

    const toolTipHandler = (event) => {
        setHideTooltip(false);
        const adjusted = {};
        const data =
            seriesData[
                Math.floor(seriesData.length * (1 - (localPoint(event).x - margin.left) / xMax))
            ];
        const index = Math.round(
            seriesData.length * (1 - (localPoint(event).x - margin.left) / xMax)
        );
        let total = 0.0;
        for (const stock in keys.reverse()) {
            try {
                adjusted[keys[stock]] = total += parseFloat(data[keys[stock]]);
            } catch (e) {
                setHideTooltip(true);
            }
        }
        setTooltip({
            x: localPoint(event).x - margin.left || 0,
            y: localPoint(event).y - margin.top || 0,
            len: seriesData.length,
            pos: (localPoint(event).x - margin.left) / xMax,
            index: index,
            data: data,
            adjusted: adjusted,
        });
    };

    const calculateColor = (index) => {
        if (
            parseFloat(seriesData[0][keys[index]]) <
            parseFloat(seriesData[seriesData.length - 1][keys[index]])
        ) {
            return "url(#red)";
        }
        return "url(#green)";
    };

    const onPath = (index) => {
        return (
            (yScale(tooltip.adjusted[keys[index]]) < tooltip.y &&
                yScale(tooltip.adjusted[keys[index + 1]]) > tooltip.y) ||
            (index === keysLen - 1 && yScale(tooltip.adjusted[keys[index]]) < tooltip.y)
        );
    };

    const pointMax = Math.max(...seriesData.map(y));
    const pointMin = Math.min(...seriesData.map(y));
    const pointDif = (pointMax - pointMin) * 0.1; //10% of the difference between the max and the min value

    const xScale = scaleTime({
        range: [0, xMax],
        domain: [Math.min(...seriesData.map(x)), Math.max(...seriesData.map(x))],
        round: true,
    });

    const yScale = scaleLinear({
        range: [yMax, 0],
        domain: [0, pointMax + pointDif],
    });

    // const getHoldingYPos = ({holdingIndex, itemIndex}) => {
    //     console.log(keys[holdingIndex], itemIndex)
    // }

    return (
        <svg width={width} height={height}>
            <RadialGradient id={"radial"} from="#212529" to="#212529" r="80%" />
            <PatternWaves
                id={"waves"}
                height={10}
                width={10}
                fill="transparent"
                stroke="white"
                strokeWidth={2}
            />
            <LinearGradient id="green" to="#11998e" from="#38ef7d" fromOffset={0.5} />
            <LinearGradient id="red" from="#ff4f4f" to="#db3c30" fromOffset={0.5} />
            <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill={darkMode ? "url(#radial)" : "transparent"}
                rx={14}
            />
            <Group top={margin.top} left={margin.left}>
                <GridRows
                    scale={yScale}
                    width={xMax}
                    strokeDasharray="2,3"
                    stroke={darkMode ? "white" : "black"}
                    strokeOpacity={0.3}
                    pointerEvents="none"
                />
                <GridColumns
                    scale={xScale}
                    height={yMax}
                    strokeDasharray="2,3"
                    stroke={darkMode ? "white" : "black"}
                    strokeOpacity={0.3}
                    pointerEvents="none"
                />
                <AxisBottom //Bottom
                    tickLabelProps={() => ({
                        fill: "black",
                        fontSize: 14,
                        textAnchor: "middle",
                    })}
                    top={yMax}
                    orientation={"bottom"}
                    scale={xScale}
                    numTicks={6}
                />
                <AxisLeft //Left
                    tickLabelProps={() => ({
                        fill: "black",
                        fontSize: 13,
                        textAnchor: "end",
                    })}
                    scale={yScale}
                    orientation={"left"}
                    label={"Price (USD)"}
                    labelOffset={margin.right + 25}
                    hideTicks={true}
                    numTicks={10}
                />
                <AreaStack
                    top={margin.top}
                    keys={keys}
                    data={seriesData}
                    x={(d) => xScale(x(d.data))}
                    y0={yMax}
                    y1={(d) => yScale(d[1])}
                    order={"reverse"}
                    curve={curveLinear}
                >
                    {({ stacks, path }) =>
                        stacks.map((stack, index) => {
                            return (
                                <g key={`series-${stack.key}`}>
                                    <path
                                        d={path(stack)}
                                        fill={stockPage ? calculateColor(index) : getColor(index)}
                                        opacity={1}
                                    />
                                </g>
                            );
                        })
                    }
                </AreaStack>
                <Bar
                    x={0}
                    y={0}
                    width={xMax}
                    height={yMax}
                    fill="transparent"
                    rx={14}
                    onTouchMove={toolTipHandler}
                    onMouseMove={toolTipHandler}
                    onMouseLeave={() => setHideTooltip(true)}
                />
                {
                    //Loops over holdings and displays a + or - if buy or sell
                    holdings.map((holding) => {
                        // if (holdingSymbols) {
                        //     return (
                        //         <g>
                        //             {holding.holdings.map((item) => {
                        //                 return (
                        //                     <g>
                        //                         <GlyphCircle
                        //                             left={xScale(getDate(item.purchaseDate))}
                        //                             top={yMax}
                        //                             fill={
                        //                                 item.quantity > 0
                        //                                     ? "url(#green)"
                        //                                     : "url(#red)"
                        //                             }
                        //                             style={{ stroke: "black", strokeWidth: 1 }}
                        //                             size={100}
                        //                         />
                        //                         <g hidden={true}>
                        //                             <rect
                        //                                 x={xScale(getDate(item.purchaseDate)) - 50}
                        //                                 y={yMax - 200}
                        //                                 width={100}
                        //                                 height={100}
                        //                             />
                        //                         </g>
                        //                     </g>
                        //                 );
                        //             })}
                        //         </g>
                        //     );
                        // }
                    })
                }
                {
                    <g hidden={hideTooltip}>
                        <Line
                            from={{ x: tooltip.x, y: 0 }}
                            to={{ x: tooltip.x, y: yMax }}
                            stroke={darkMode ? "white" : "black"}
                            strokeWidth={2}
                            pointerEvents="none"
                            strokeDasharray="5,2"
                        />
                        {keys.map((stock, index) => {
                            if (tooltip.data !== undefined && onPath(index)) {
                                return (
                                    <g key={stock}>
                                        {/*Inner color and white outline*/}
                                        <circle
                                            cx={tooltip.x}
                                            cy={yScale(tooltip.adjusted[stock])}
                                            // cy={yScale(tooltip.data[stock])}
                                            r={4}
                                            fill={
                                                stockPage ? calculateColor(index) : getColor(index)
                                            }
                                            // fill={colors[index]}
                                            stroke={"white"}
                                            strokeWidth={1}
                                            pointerEvents="none"
                                        />
                                        {/*Dark outline*/}
                                        <circle
                                            cx={tooltip.x}
                                            cy={yScale(tooltip.adjusted[stock])}
                                            // cy={yScale(tooltip.data[stock])}
                                            r={6}
                                            key={Math.random()}
                                            fill={"transparent"}
                                            // fill={colors[index]}
                                            stroke={"#282b2e"}
                                            strokeWidth={3}
                                            pointerEvents="none"
                                        />
                                        <rect
                                            x={tooltip.x - 90 < 0 ? tooltip.x + 30 : tooltip.x - 95}
                                            y={tooltip.y - 20}
                                            width={75}
                                            height={40}
                                            // fill={"black"}
                                            stroke={"black"}
                                            strokeWidth={1}
                                            fill={keysLen === 1 ? "black" : colors[index]}
                                            opacity={0.8}
                                            rx={4}
                                        />
                                        <Text
                                            style={{ fontWeight: 400, fontSize: 14 }}
                                            x={tooltip.x - 90 < 0 ? tooltip.x + 35 : tooltip.x - 90}
                                            y={tooltip.y}
                                            width={75}
                                            textAnchor="start"
                                            verticalAnchor="middle"
                                            fill={"white"}
                                        >
                                            {stock +
                                                " $" +
                                                parseFloat(tooltip.data[stock])
                                                    .toFixed(2)
                                                    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}
                                        </Text>
                                    </g>
                                );
                            }
                        })}
                        <rect
                            x={
                                tooltip.x + 90 > xMax
                                    ? tooltip.x - 85
                                    : tooltip.x - 30 < 0
                                    ? tooltip.x - 15
                                    : tooltip.x - 45
                            }
                            y={yMax + 5}
                            width={90}
                            height={30}
                            stroke={darkMode ? "white" : "black"}
                            strokeWidth={1}
                            fill={darkMode ? "black" : "white"}
                            opacity={1}
                            rx={4}
                        />
                        <Text
                            style={{ fontWeight: 700 }}
                            x={
                                tooltip.x + 90 > xMax
                                    ? tooltip.x - 40
                                    : tooltip.x - 30 < 0
                                    ? tooltip.x + 30
                                    : tooltip.x
                            }
                            y={yMax + margin.top + 5}
                            width={90}
                            textAnchor="middle"
                            fill={darkMode ? "white" : "black"}
                            verticalAnchor="end"
                        >
                            {tooltipDateFormat(xScale.invert(tooltip.x))}
                        </Text>
                    </g>
                }
            </Group>
        </svg>
    );
}

export default AreaStackedGraph;
