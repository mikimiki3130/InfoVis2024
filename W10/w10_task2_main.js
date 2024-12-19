d3.csv("https://mikimiki3130.github.io/InfoVis2024/W04/w04_task1.csv")

    .then( data => {
        data.forEach( d => { d.x = +d.x; d.y = +d.y; });

        var config = {
            parent: '#drawing_scatter',
            width: 256,
            height: 256,
            margin: {top:20, right:10, bottom:20, left:25}
        };

        const scatter_plot = new ScatterPlot( config, data );
        scatter_plot.init();
    })
    .catch( error => {
        console.log( error );
    });

class ScatterPlot {

    constructor( config, data ) {
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top:10, right:10, bottom:10, left:10}
        }
        this.data = data;

        this.selectedData = null;
    }

    init() {
        let self = this;

        self.svg = d3.select( self.config.parent )
            .attr('width', self.config.width)
            .attr('height', self.config.height);

        self.chart = self.svg.append('g')
            .attr('transform', `translate(${self.config.margin.left}, ${self.config.margin.top})`);

        self.inner_width = self.config.width - self.config.margin.left - self.config.margin.right;
        self.inner_height = self.config.height - self.config.margin.top - self.config.margin.bottom;

        self.xscale = d3.scaleLinear()
            .range( [0, self.inner_width] );

        self.yscale = d3.scaleLinear()
            .range( [0, self.inner_height] );

        self.xaxis = d3.axisBottom( self.xscale )
            .ticks(6);

        self.yaxis = d3.axisLeft( self.yscale )
            .ticks(6);

        self.xaxis_group = self.chart.append('g')
            .attr('transform', `translate(0, ${self.inner_height})`);
        
        self.yaxis_group = self.chart.append('g')
            .attr('transform', `translate(0, 0)`);
        
        // グラフタイトル
        self.svg.append('text')
            .attr('x', self.config.width / 2)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Scatter Plot (click data point!)');

        this.update();
    }

    update() {
        let self = this;
        const x_margin = 10, y_margin = 10;

        const xmin = d3.min(self.data, d => d.x) - x_margin;
        const xmax = d3.max(self.data, d => d.x) + x_margin;
        self.xscale.domain([xmin, xmax]);

        const ymin = d3.min(self.data, d => d.y) - y_margin;
        const ymax = d3.max(self.data, d => d.y) + y_margin;
        self.yscale.domain([ymin, ymax]);

        self.render();
    }

    render() {
        let self = this;

        const circles = self.chart.selectAll("circle")
            .data(self.data);

        circles.enter()
            .append("circle")
            .merge(circles)
            .attr("cx", d => self.xscale(d.x))
            .attr("cy", d => self.yscale(d.y))
            .attr("r", d => d.r)
            .attr("fill", d => self.selectedData === d ? 'red' : 'steelblue') // 選択されたデータを赤色で表示
            .on('click', function (e, d) {
                self.selectedData = self.selectedData === d ? null : d; // 同じデータを再クリックすると解除
                self.render(); // 再描画
            });

        circles.exit().remove();

        self.chart.selectAll("circle")
            .on('mouseover', (e,d) => {
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .html(`<div class="tooltip-label">Position</div>(${d.x}, ${d.y})`);
            })
            .on('mousemove', (e) => {
                const padding = 10;
                d3.select('#tooltip')
                    .style('left', (e.pageX + padding) + 'px')
                    .style('top', (e.pageY + padding) + 'px');
            })
            .on('mouseleave', () => {
                d3.select('#tooltip')
                    .style('opacity', 0);
            });
        
        // 軸を描画
        self.xaxis_group.call(self.xaxis);
        self.yaxis_group.call(self.yaxis);
    }
}
