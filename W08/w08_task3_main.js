class PieChart {
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

    update() {
        // Update scales' domains
        this.xscale.domain([0, d3.max(this.data, d => d.x)]);
        this.yscale.domain([0, d3.max(this.data, d => d.y)]);

        // Update axes
        const xaxis = d3.axisBottom(this.xscale).ticks(5);
        const yaxis = d3.axisLeft(this.yscale).ticks(5);

        this.xaxisGroup.call(xaxis);
        this.yaxisGroup.call(yaxis);
    }

    // 描画
    render() {
        this.chart.append('path')
            .datum(this.data)
            .attr('d', this.line)
            .attr('stroke', 'black')
            .attr('fill', 'none');

        // Draw the points
        this.chart.selectAll('circle')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('cx', d => this.xscale(d.x))
            .attr('cy', d => this.yscale(d.y))
            .attr('r', 3)
            .attr('fill', 'black');           

    }
}

const bar = new BarChart();
bar.init();