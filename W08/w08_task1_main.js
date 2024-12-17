class BarChart {
    constructor(csvUrl){
        this.csvUrl = csvUrl; // URL
        this.data = [];       // data
        this.chart = null;    // SVGグループを保存
        this.xscale = null;   // xscale
        this.yscale = null;   // yscale
        this.margin = { top: 10, right: 10, bottom: 20, left: 60 };
        this.width = 512;
        this.height = 128;     
    }
    
    
    init() {
        // データのロードを待ってから
        d3.csv(this.csvUrl, d => ({
            quantity: +d.quantity, // 数値に変換
            label: d.label,
            color: d.color
        }), (error, data) => {
            if (error) {
                console.error("Error occured: ", error);
                return;
            }
            
            this.data = data; // データを保存
            // SVGの設定
            this.svg = d3.select('#drawing_bar')
                .attr('width', this.width)
                .attr('height', this.height);

            this.chart = this.svg.append('g')
                .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

            const innerWidth = this.width - this.margin.left - this.margin.right;
            const innerHeight = this.height - this.margin.top - this.margin.bottom;

            // Initialize axis scales
            this.xscale = d3.scaleLinear()
                .range([0, innerWidth]);

            this.yscale = d3.scaleBand()
                .range([0, innerHeight])
                .paddingInner(0.1);

            // Draw the axis
            this.xaxisGroup = this.chart.append('g')
                .attr('transform', `translate(0, ${innerHeight})`);

            this.yaxisGroup = this.chart.append('g');

            this.update();    // スケールや軸を更新
            this.render();    // グラフを描画
        });
    }

    // データに基づいて更新
    update() {
        const maxQuantity = d3.max(this.data, d => d.quantity);

        this.xscale.domain([0, maxQuantity]);
        this.yscale.domain(this.data.map(d => d.label));

        const xaxis = d3.axisBottom(this.xscale).ticks(5).tickSizeOuter(0);
        const yaxis = d3.axisLeft(this.yscale).tickSizeOuter(0);

        // 軸を更新
        this.xaxisGroup.call(xaxis);
        this.yaxisGroup.call(yaxis);
    }

    // 描画
    render() {
        const bars = this.chart.selectAll("rect").data(this.data);

        console.log(this.data)

        // 新しいデータを追加
        bars.enter()
            .append("rect")
            .merge(bars) // 既存データを更新
            .attr("fill", d => d.color)
            .attr("x", 0)
            .attr("y", d => this.yscale(d.label))
            .attr("width", d => this.xscale(d.quantity))
            .attr("height", this.yscale.bandwidth());

        // 古いデータを削除
        bars.exit().remove();
    }
}

const bar = new BarChart(csvUrl= "https://mikimiki3130.github.io/InfoVis2024/W04/w04_task2.csv");
bar.init();

// d3.csv("https://mikimiki3130.github.io/InfoVis2024/W04/w04_task2.csv", function(d) {
//     return {
//         quantity: +d.quantity, // 数値に変換
//         label: d.label,
//         color: d.color
//     };
// }, function(error, data) {
//     if (error) throw error;

//     var width = 512;
//     var height = 128;
//     var margin = {top:10, right:10, bottom:20, left:60};

//     var svg = d3.select('#drawing_bar')
//         .attr('width', width)
//         .attr('height', height);
    
//     var chart = svg.append('g')
//         .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
//     const inner_width = width - margin.left - margin.right;
//     const inner_height = height - margin.top - margin.bottom;
    
//     // Initialize axis scales
//     const xscale = d3.scaleLinear()
//           .domain([0, d3.max(data, d => d.quantity)])
//           .range([0, inner_width]);
    
//     console.log("log:", data.map(d => d.quantity))

//     console.log("log:", d3.max(data, d => d.quantity))

//     const yscale = d3.scaleBand()
//           .domain(data.map(d => d.label))
//           .range([0, inner_height])
//           .paddingInner(0.1);
    
//     // Initialize axes
//     const xaxis = d3.axisBottom( xscale )
//           .ticks(5)
//           .tickSizeOuter(0);
    
//     const yaxis = d3.axisLeft( yscale )
//           .tickSizeOuter(0);
    
//     // Draw the axis
//     const xaxis_group = chart.append('g')
//           .attr('transform', `translate(0, ${inner_height})`)
//           .call( xaxis );
    
//     const yaxis_group = chart.append('g')
//           .call( yaxis );
    
//     // Draw bars
//     chart.selectAll("rect").data(data).enter()
//         .append("rect")
//         .attr("fill", d => d.color)
//         .attr("x", 0)
//         .attr("y", d => yscale(d.label))
//         .attr("width", d => xscale(d.quantity))
//         .attr("height", yscale.bandwidth());
// });

