d3.csv("https://mikimiki3130.github.io/InfoVis2024/W04/w04_task1.csv")

    .then( data => {
        data.forEach( d => { d.x = +d.x; d.y = +d.y; });

        var config = {
            parent: '#drawing_region', // html内で同IDを持つ場所に描く
            title: "Scatter Plot",
            xlabel: "xlabel",
            ylabel: "ylabel",
            width: 512,
            height: 512,
            margin: {top:40, right:40, bottom:40, left:40}
        };

        const scatter_plot = new ScatterPlot( config, data );
        scatter_plot.update();
    })
    .catch( error => {
        console.log( error );
    });

class ScatterPlot {

    constructor( config, data ) {
        this.config = {
            parent: config.parent,
            title: config.title || "Chart Title",
            xlabel: config.xlabel || "X label",
            ylabel: config.ylabel || "Y label",
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top:10, right:10, bottom:10, left:10}
        }
        this.data = data;
        this.init();
    }

    init() {
        let self = this;

        self.svg = d3.select( self.config.parent )
            .attr('width', self.config.width)
            .attr('height', self.config.height);

        self.chart = self.svg.append('g')
            .attr('transform', `translate(${self.config.margin.left}, ${self.config.margin.top})`);

        self.title = self.svg.append("text")
            .attr("x", (self.config.width / 2))             
            .attr("y", (self.config.margin.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .text(self.config.title);
        
        self.xlabel = self.svg.append("text")
            .attr("x", (self.config.width / 2))             
            .attr("y", (self.config.height))
            .attr("text-anchor", "middle")  
            .style("font-size", "14px") 
            .text(self.config.xlabel);

        self.ylabel = self.svg.append("text")
            //-90° rotate（cos(θ-π/2) = -sinθ, sin(θ-π/2) = cosθ）
            .attr("x", (-self.config.height / 2)) // .attr("y", (self.config.height / 2))
            .attr("y", (self.config.margin.left / 4)) // .attr("x", (self.config.margin.left / 4)) 
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-size", "14px") 
            .text(self.config.ylabel);

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
    }

    update() {
        let self = this;

        const xmin = d3.min( self.data, d => d.x );
        const xmax = d3.max( self.data, d => d.x );
        self.xscale.domain( [0, xmax] );

        const ymin = d3.min( self.data, d => d.y );
        const ymax = d3.max( self.data, d => d.y );
        self.yscale.domain( [ymax, 0] );

        self.render();
    }

    render() {
        let self = this;

        self.chart.selectAll("circle")
            .data(self.data)
            .enter()
            .append("circle")
            .attr("cx", d => self.xscale( d.x ) )
            .attr("cy", d => self.yscale( d.y ) )
            .attr("r", d => d.r );

        self.xaxis_group
            .call( self.xaxis );

        self.yaxis_group
            .call( self.yaxis );
    }
}
