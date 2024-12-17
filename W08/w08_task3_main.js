class PieChart {
    constructor(csvUrl) {
        this.csvUrl = csvUrl; 
        this.data = [];       

        this.width = 256;
        this.height = 256; 
        this.radius = Math.min(this.width, this.height) / 2;

        this.svg = null; 
        this.pie = null; 
        this.arc = null; 
    }

    init() {
        d3.csv(this.csvUrl, d => ({
            quantity: +d.quantity, 
            label: d.label,
            color: d.color
        }), (error, data) => {
            if (error) {
                console.error("Error occured: ", error);
                return;
            }

            this.data = data; // データを保存

            // SVGの設定
            this.svg = d3.select('#drawing_pie')
                .attr('width', this.width)
                .attr('height', this.height)
                .append('g')
                .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

            this.update(); 
            this.render(); 
        });
    }

    update() {
        this.pie = d3.pie()
            .value(d => d.quantity);

        this.arc = d3.arc()
            .innerRadius(this.radius / 2) 
            .outerRadius(this.radius);
    }

    render() {
        // 円グラフの描画
        const arcs = this.svg.selectAll('path')
            .data(this.pie(this.data))
            .enter()
            .append('path')
            .attr('d', this.arc)
            .attr('fill', (d, i) => d.data.color)
            .attr('stroke', 'white')
            .style('stroke-width', '2px');

        // ラベルの表示（オプション）
        this.svg.selectAll('text')
            .data(this.pie(this.data))
            .enter()
            .append('text')
            .attr('transform', d => `translate(${this.arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text(d => d.data.label);
    }
}

const pie = new PieChart("https://mikimiki3130.github.io/InfoVis2024/W04/w04_task2.csv");
pie.init();
