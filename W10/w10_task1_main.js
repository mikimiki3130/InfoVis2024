class BarChart {
    constructor(csvUrl) {
        this.csvUrl = csvUrl; // URL
        this.data = [];       // data
        this.chart = null;    // SVGグループを保存
        this.xscale = null;   // xscale
        this.yscale = null;   // yscale
        this.margin = { top: 10, right: 10, bottom: 20, left: 60 };
        this.width = 512;
        this.height = 128;
        this.isAscending = false;
    }

    init() {
        // データのロードを待ってから
        d3.csv(this.csvUrl, d => ({
            quantity: +d.quantity, // 数値に変換
            label: d.label,
            color: d.color
        })).then(data => {
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

            // 昇順・降順ソート
            d3.select('#sort')
                .on('click', () => {
                    this.isAscending = !this.isAscending;
                    this.sortData();     // ソート
                    this.update();       // 軸を更新
                    this.render();       // グラフを再描画
                });

            // 逆順
            d3.select('#reverse')
                .on('click', () => {
                    this.data.reverse(); // データの順番を逆にする
                    this.update();       // 軸を更新
                    this.render();       // グラフを再描画
                });
            
            this.update();    // スケールや軸を更新
            this.render();    // グラフを描画
        }).catch(error => {
            console.error("Error loading CSV data:", error);
        });
    }

    // データを昇順/降順に並び替える
    sortData() {
        this.data.sort((a, b) => {
            if (this.isAscending) {
                return d3.ascending(a.quantity, b.quantity);
            } else {
                return d3.descending(a.quantity, b.quantity);
            }
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

        // 新しいデータを追加
        bars.enter()
            .append("rect")
            .merge(bars) // 既存データを更新
            .transition().duration(800)
            .attr("fill", d => d.color)
            .attr("x", 0)
            .attr("y", d => this.yscale(d.label))
            .attr("width", d => this.xscale(d.quantity))
            .attr("height", this.yscale.bandwidth());

        // 古いデータを削除
        bars.exit().remove();
    }
}

const bar = new BarChart("https://mikimiki3130.github.io/InfoVis2024/W04/w04_task2.csv");
bar.init();
