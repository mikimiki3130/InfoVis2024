class LineChart {
    constructor(){
        this.data = [
            {x:0, y:100},
            {x:40, y:5},
            {x:120, y:80},
            {x:150, y:30},
            {x:200, y:50}
        ];
        this.width = 512;
        this.height = 128;
        this.chart = null;    // SVGグループを保存
        this.xscale = null;   // xscale
        this.yscale = null;   // yscale
        this.xaxisGroup = null;
        this.yaxisGroup = null;

        this.margin = { top: 10, right: 10, bottom: 20, left: 60 };

        this.svg = null; 
        this.line = null; 
    }
    
    init() {
        this.svg = d3.select('#drawing_line')
            .attr('width', this.width)
            .attr('height', this.height);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        const innerWidth = this.width - this.margin.left - this.margin.right;
        const innerHeight = this.height - this.margin.top - this.margin.bottom;

        // Initialize axis scales
        this.xscale = d3.scaleLinear().range([0, innerWidth]);
        this.yscale = d3.scaleLinear().range([innerHeight, 0]);

        // Initialize line generator
        this.line = d3.line()
            .x(d => this.xscale(d.x))
            .y(d => this.yscale(d.y));

        // Draw the axis groups
        this.xaxisGroup = this.chart.append('g')
            .attr('transform', `translate(0, ${innerHeight})`);

        this.yaxisGroup = this.chart.append('g');

        this.update();
        this.render();
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

const line = new LineChart();
line.init();