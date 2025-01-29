// main関数
d3.csv("https://mikimiki3130.github.io/InfoVis2024/FinalEx/data.csv").then(function(data) {
    let parsedData = {};
    const headers = Object.keys(data[0]);

    // 地域ごとのデータを取得
    let locations = {};
    for (let i = 1; i < headers.length; i++) {
        let region = headers[i - 1]; // 地域名
        let variable = headers[i]; // 気象データ
        if (!locations[region]) locations[region] = [];
        locations[region].push(variable);
    }

    // データ変換
    data.forEach(row => {
        let month = +row["Empty"];
        for (let region in locations) {
            locations[region].forEach(variable => {
                let key = region.trim();
                if (!parsedData[key]) parsedData[key] = [];
                parsedData[key].push({
                    month: month,
                    variable: variable,
                    value: +row[variable]
                });
            });
        }
    });

    // 地点リストを生成
    const locationNames = Object.keys(parsedData);
    const select1 = d3.select("#location1");
    const select2 = d3.select("#location2");

    locationNames.forEach(loc => {
        select1.append("option").text(loc).attr("value", loc);
        select2.append("option").text(loc).attr("value", loc);
    });

    // グラフ描画
    d3.select("#compare").on("click", function() {
        let loc1 = select1.property("value");
        let loc2 = select2.property("value");

        if (loc1 && loc2) {
            drawChart(loc1, loc2, parsedData);
        }
    });
});

// グラフ描画関数
function drawChart(loc1, loc2, data) {
    d3.select("#chart").selectAll("*").remove(); // クリア

    const svg = d3.select("#chart"),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // X軸 & Y軸のスケール
    const xScale = d3.scaleLinear()
        .domain([1, 12])
        .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max([...data[loc1], ...data[loc2]], d => d.value)])
        .range([chartHeight, 0]);

    // 軸を描画
    g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(xScale).ticks(12));
    g.append("g").call(d3.axisLeft(yScale));

    // 折れ線グラフを描画
    const line = d3.line()
        .x(d => xScale(d.month))
        .y(d => yScale(d.value));

    g.append("path")
        .datum(data[loc1].filter(d => d.variable === "temp"))
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", line);

    g.append("path")
        .datum(data[loc2].filter(d => d.variable === "temp"))
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);

    // ラベル
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("月");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .text("気温 (°C)");

    // 凡例
    svg.append("circle").attr("cx", 480).attr("cy", 20).attr("r", 6).style("fill", "blue");
    svg.append("circle").attr("cx", 480).attr("cy", 40).attr("r", 6).style("fill", "red");
    svg.append("text").attr("x", 500).attr("y", 25).text(loc1).style("font-size", "12px").attr("alignment-baseline", "middle");
    svg.append("text").attr("x", 500).attr("y", 45).text(loc2).style("font-size", "12px").attr("alignment-baseline", "middle");
}
