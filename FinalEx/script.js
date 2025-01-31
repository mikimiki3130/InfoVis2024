const targetRegions = [
    "広島県", "岡山県", "山口県", "島根県", "鳥取県",  
    "兵庫県", "京都府", "大阪府", "滋賀県", "奈良県", "和歌山県" 
];

// 地点データ（緯度・経度）
const locations = [
    { name: "Hiroshima", lat: 34.3853, lon: 132.4553 },
    { name: "Matsue", lat: 35.4676, lon: 133.0505 },
    { name: "Fukuyama", lat: 34.4858, lon: 133.3623 },
    { name: "Okayama", lat: 34.6551, lon: 133.9195 },
    { name: "Tottori", lat: 35.5011, lon: 134.2351 },
    { name: "Yonego", lat: 35.4283, lon: 133.3314 },
    { name: "Hamada", lat: 34.8997, lon: 132.0806 },
    { name: "Yamaguchi", lat: 34.1859, lon: 131.4714 },
    { name: "Kure", lat: 34.2320, lon: 132.5656 },
    { name: "Himeji", lat: 34.8151, lon: 134.6853 },
    { name: "Kobe", lat: 34.6901, lon: 135.1955 },
    { name: "Sumoto", lat: 34.3428, lon: 134.8950 },
    { name: "Toyo-oka", lat: 35.5400, lon: 134.8208 },
    { name: "Kyoto", lat: 35.0116, lon: 135.7681 },
    { name: "Maizuru", lat: 35.4499, lon: 135.3330 },
    { name: "Osaka", lat: 34.6937, lon: 135.5023 },
    { name: "Shionomisaki", lat: 33.4378, lon: 135.7630 },
    { name: "Wakayama", lat: 34.2260, lon: 135.1675 },
    { name: "Nara", lat: 34.6851, lon: 135.8048 },
    { name: "Hikone", lat: 35.2740, lon: 136.2590 }
];

// 棒グラフ描画用のクラス
class LineChart { 
    constructor(parsedData) { 
        this.loc1 = null; 
        this.loc2 = null; 
        this.parsedData = parsedData; 
        this.width = 600; 
        this.height = 400; 
        this.margin = { top: 20, right: 30, bottom: 50, left: 50 }; 
        this.chart = null; 
        this.xscale = null; 
        this.yscale = null; 
        this.xaxisGroup = null; 
        this.yaxisGroup = null; 
        this.svg = null; 
        this.line = null; 

        this.selectedLocations = []; 
        this.selectedVariable = null; 
    } 

    init() { 
        this.svg = d3.select('#chart') 
            .attr('width', this.width) 
            .attr('height', this.height); 

        const innerWidth = this.width - this.margin.left - this.margin.right; 
        const innerHeight = this.height - this.margin.top - this.margin.bottom; 

        // SVG グループを作成 
        this.chart = this.svg.append('g') 
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`); 

        // 軸スケールの初期化 
        this.xscale = d3.scaleLinear().range([0, innerWidth]); 
        this.yscale = d3.scaleLinear().range([innerHeight, 0]); 

        // 線生成器の初期化 
        this.line = d3.line() 
            .x(d => this.xscale(d.month)) 
            .y(d => this.yscale(d.value)); 

        // 軸グループの作成 
        this.xaxisGroup = this.chart.append('g') 
            .attr('transform', `translate(0, ${innerHeight})`); 

        this.yaxisGroup = this.chart.append('g'); 
    } 

    update(loc1, loc2, selectedVariable) { 
        this.loc1 = loc1; 
        this.loc2 = loc2; 
        this.selectedVariable = selectedVariable;

        // 月ごとのデータをフィルタリング 
        const data1 = this.parsedData[this.loc1].filter(d => d.variable === selectedVariable); 
        const data2 = this.parsedData[this.loc2].filter(d => d.variable === selectedVariable); 

        // スケールのドメインを更新 
        this.xscale.domain([1, 12]); // 1〜12月 
        const yMin = d3.min([{ value: 0 }, ...data1, ...data2], d => d.value); 
        const yMax = d3.max([...data1, ...data2], d => d.value) + 2; 
        this.yscale.domain([yMin, yMax]); 

        console.log("ymin:", yMin, " ymax:", yMax); 

        // 軸の更新 
        const xaxis = d3.axisBottom(this.xscale).ticks(12); 
        const yaxis = d3.axisLeft(this.yscale); 

        // 軸をリセット（削除してから再描画） 
        this.xaxisGroup.selectAll("*").remove(); // x軸のリセット 
        this.yaxisGroup.selectAll("*").remove(); // y軸のリセット 

        // 描画をリセット（既存の線や点を削除） 
        this.chart.selectAll("path").remove();  // 既存の線を削除 
        this.chart.selectAll("circle").remove();  // 既存の点を削除 

        // タイトルと凡例のリセット
        this.svg.selectAll("text.title").remove();  // タイトルの削除
        this.svg.selectAll("g.legend").remove();  // 凡例の削除
        this.svg.selectAll("text.x-axis-label").remove(); // x軸ラベル削除
        this.svg.selectAll("text.y-axis-label").remove(); // y軸ラベル削除

        this.xaxisGroup.call(xaxis); 
        this.yaxisGroup.call(yaxis); 

        this.render(data1, data2); 
        this.addTitleAndLegend();  // タイトルと凡例を追加
        this.addAxisLabels();  // 軸ラベルを追加
    } 

    render(data1, data2) { 
        // 折れ線の描画 
        this.chart.append('path') 
            .datum(data1) 
            .attr('d', this.line) 
            .attr('stroke', 'blue') 
            .attr('fill', 'none') 
            .attr('stroke-width', 2); 

        this.chart.append('path') 
            .datum(data2) 
            .attr('d', this.line) 
            .attr('stroke', 'red') 
            .attr('fill', 'none') 
            .attr('stroke-width', 2); 
    } 

    selectLocation(name) { 
        if (this.selectedLocations.includes(name)) { 
            this.selectedLocations = this.selectedLocations.filter(d => d !== name); 
        } else { 
            if (this.selectedLocations.length >= 2) this.selectedLocations.shift(); 
            this.selectedLocations.push(name); 
        } 
        
        d3.select("#selected-locations").text(this.selectedLocations.join(" / ")); 
        
        if (this.selectedLocations.length === 2) { 
            if(this.selectedVariable == null)  
                this.update(this.selectedLocations[0], this.selectedLocations[1], "temperature"); 
            else  
                this.update(this.selectedLocations[0], this.selectedLocations[1], this.selectedVariable); 
        } 
    } 

    getSelectedLocations(){ 
        return this.selectedLocations; 
    } 

    addTitleAndLegend() {
        const innerWidth = this.width - this.margin.left - this.margin.right;
        const innerHeight = this.height - this.margin.top - this.margin.bottom;

        // タイトルの追加
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.margin.top / 2 + 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("class", "title")
            .text(`Monthly Data for ${this.selectedVariable}`);

        // 凡例の追加
        const legend = this.chart.append("g")
            .attr("transform", `translate(${innerWidth - 120}, 20)`)
            .attr("class", "legend");

        legend.append("rect")
            .attr("y", 10)
            .attr("width", 20)
            .attr("height", 3)
            .attr("fill", "blue");
        legend.append("text")
            .attr("x", 25)
            .attr("y", 15)
            .attr("font-size", "12px")
            .text(this.loc1);

        legend.append("rect")
            .attr("y", 40)
            .attr("width", 20)
            .attr("height", 3)
            .attr("fill", "red");
        legend.append("text")
            .attr("x", 25)
            .attr("y", 45)
            .attr("font-size", "12px")
            .text(this.loc2);
    }

    addAxisLabels() {
        const innerWidth = this.width - this.margin.left - this.margin.right;
        const innerHeight = this.height - this.margin.top - this.margin.bottom;

        // x軸ラベルの追加
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", innerHeight + this.margin.bottom - 5)
            .attr("text-anchor", "middle")
            .attr("class", "x-axis-label")
            .attr("font-size", "12px")
            .text("Month");

        // y軸ラベルの追加
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight / 2)
            .attr("y", this.margin.left - 40)
            .attr("text-anchor", "middle")
            .attr("class", "y-axis-label")
            .attr("font-size", "12px")
            .text(this.selectedVariable);
    }
}

// CSVデータのロード
let parsedData = {};
d3.text("https://mikimiki3130.github.io/InfoVis2024/FinalEx/data.csv").then(function (rawText) {
    let rows = d3.csvParseRows(rawText);
    const headers = rows[0];
    const variables = rows[1];

    // 変数リストを作成（重複を排除）
    variableList = [...new Set(variables.slice(1))];  // 最初の列（month列）は除外

    // index.htmlに変数リストを表示
    const variableSelect = d3.select("#variable-select");
    variableSelect.selectAll("option")
        .data(variableList)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d);

    // データを解析
    rows.slice(2).forEach(row => {
        let month = +row[0];
        if (isNaN(month)) return;

        for (let i = 1; i < headers.length; i++) {
            let region = headers[i];
            let variable = variables[i];
            let value = +row[i];

            if (isNaN(value)) continue;
            if (!parsedData[region]) parsedData[region] = [];
            parsedData[region].push({ month, variable, value });
        }
    });

    console.log("データロード完了:", parsedData);
});

const chart = new LineChart(parsedData);
chart.init(); 

// 地図の描画
d3.json("https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson").then(function (japan) {
    const width = 600, height = 400;
    const svg = d3.select("#map").append("svg").attr("width", width).attr("height", height);
    const projection = d3.geoMercator().center([133, 35]).scale(3000).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    // 中国・近畿地方のみフィルタリング
    const filteredFeatures = japan.features.filter(d => targetRegions.includes(d.properties.nam_ja));

    // 地図描画
    svg.selectAll("path")
        .data(filteredFeatures)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "#333")
        .attr("fill", "#ccc");

    // 地点マーカーを追加
    const markers = svg.selectAll("circle")
        .data(locations)
        .enter().append("circle")
        .attr("cx", d => projection([d.lon, d.lat])[0])
        .attr("cy", d => projection([d.lon, d.lat])[1])
        .attr("r", 5)
        .attr("fill", "blue")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("click", function (event, d) {
            chart.selectLocation(d.name);
            updateMarkers();  // 色を更新
        });

    function updateMarkers() {
        markers.attr("fill", d => chart.getSelectedLocations().includes(d.name) ? "red" : "blue");
    }

    console.log("中国地方・近畿地方の地図ロード完了");
});

// 変数選択時にグラフを更新
d3.select("#variable-select").on("change", function () {
    const selectedVariable = this.value;
    if (chart.getSelectedLocations().length === 2) {
        chart.update(chart.getSelectedLocations()[0], chart.getSelectedLocations()[1], selectedVariable);
    }
});

