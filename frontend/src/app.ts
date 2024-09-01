import * as d3 from 'd3';
import 'htmx.org';

interface AssetAllocation {
	asset: string;
	value: number;
}

interface PortfolioPerformance {
	date: Date;
	value: number;
}

interface AssetReturn {
	asset: string;
	return: number;
}

function createPieChart(data: AssetAllocation[]) {
	const width = 450;
	const height = 450;
	const margin = 40;

	const radius = Math.min(width, height) / 2 - margin;

	const svg = d3.select("#pie-chart")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", `translate(${width / 2},${height / 2})`);

	const color = d3.scaleOrdinal<string>()
		.domain(data.map(d => d.asset))
		.range(d3.schemeDark2);

	const pie = d3.pie<AssetAllocation>().value(d => d.value);

	const arc = d3.arc<d3.PieArcDatum<AssetAllocation>>()
		.innerRadius(0)
		.outerRadius(radius);

	const arcs = svg.selectAll("arc")
		.data(pie(data))
		.enter()
		.append("g");

	arcs.append("path")
		.attr("d", arc)
		.attr("fill", d => color(d.data.asset));

	arcs.append("text")
		.attr("transform", d => `translate(${arc.centroid(d)})`)
		.attr("text-anchor", "middle")
		.text(d => d.data.asset);

	// Add a legend
	const legend = svg.append("g")
		.attr("transform", `translate(${width / 2},${height + margin / 2})`);

	legend.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", color("Stocks"));

	legend.append("text")
		.attr("x", 15)
		.attr("y", 5)
		.text("Stocks");
}

function createLineChart(data: PortfolioPerformance[]) {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 1500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date) as [Date, Date])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) as number])
        .range([height, 0]);

    const lineArea = d3.area<PortfolioPerformance>()
        .x(d => x(d.date))
        .y0(height)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX)
        .defined(d => !isNaN(d.value));

    let gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "line-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "steelblue")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "white")
        .attr("stop-opacity", 1);

    svg.append("path")
        .datum(data)
        .attr("fill", "url(#line-gradient)")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
	.attr("stroke-linejoin", "round")
        .attr("d", lineArea)
        .on("mouseover", function (d) {
            d3.select(this)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5);
        });

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));
}

function createBarChart(data: AssetReturn[]) {
	const margin = { top: 20, right: 20, bottom: 30, left: 40 };
	const width = 600 - margin.left - margin.right;
	const height = 400 - margin.top - margin.bottom;

	const svg = d3.select("#bar-chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	const x = d3.scaleBand()
		.range([0, width])
		.padding(0.1);

	const y = d3.scaleLinear()
		.range([height, 0]);

	x.domain(data.map(d => d.asset));
	y.domain([0, d3.max(data, d => d.return) as number]);

	svg.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", d => x(d.asset) as number)
		.attr("width", x.bandwidth())
		.attr("y", d => y(d.return))
		.attr("height", d => height - y(d.return));

	svg.append("g")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x));

	svg.append("g")
		.call(d3.axisLeft(y));
}

interface Position {
	asset: string;
	type: string;
	baseMargin: number;
	dateOpened: Date;
	stopLoss: number | null;
	takeProfit: number | null;
	leverage: number | null;
	dateClosed: Date | null;
	performance: number;
	brokerUrl: string;
}

function populatePositionsTable(data: Position[]) {
	const tbody = d3.select('#positions tbody');

	tbody.selectAll('tr')
		.data(data)
		.enter()
		.append('tr')
		.html(d => `
            <td>${d.asset}</td>
            <td>${d.type}</td>
            <td>${d.baseMargin}</td>
            <td>${d.dateOpened.toLocaleDateString()}</td>
            <td>${d.stopLoss !== null ? d.stopLoss : 'N/A'}</td>
            <td>${d.takeProfit !== null ? d.takeProfit : 'N/A'}</td>
            <td>${d.leverage !== null ? d.leverage : 'N/A'}</td>
            <td>${d.dateClosed !== null ? d.dateClosed.toLocaleDateString() : 'Open'}</td>
            <td>${d.performance.toFixed(2)}%</td>
            <td><a href="${d.brokerUrl}" target="_blank">View</a></td>
        `);
}

function setupThemeSwitch() {
	const themeSwitch = document.getElementById('theme-switch');
	const body = document.body;

	if (themeSwitch) {
		themeSwitch.addEventListener('click', () => {
			body.classList.toggle('light-mode');
			body.classList.toggle('dark-mode');
		});
	}
}

// Sample data
const assetAllocation: AssetAllocation[] = [
	{ asset: "Stocks", value: 50 },
	{ asset: "Bonds", value: 30 },
	{ asset: "Real Estate", value: 15 },
	{ asset: "Cash", value: 5 }
];

const portfolioPerformance: PortfolioPerformance[] = [
	{ date: new Date("2023-01-01"), value: 100000 },
	{ date: new Date("2023-02-01"), value: 102000 },
	{ date: new Date("2023-03-01"), value: 105000 },
	{ date: new Date("2023-04-01"), value: 103000 },
	{ date: new Date("2023-05-01"), value: 106000 }
];

const assetReturns: AssetReturn[] = [
	{ asset: "Stocks", return: 7.5 },
	{ asset: "Bonds", return: 3.2 },
	{ asset: "Real Estate", return: 5.8 },
	{ asset: "Cash", return: 1.1 }
];

const samplePositions: Position[] = [
	{
		asset: "AAPL",
		type: "Stock",
		baseMargin: 1000,
		dateOpened: new Date("2023-01-15"),
		stopLoss: 135,
		takeProfit: 180,
		leverage: null,
		dateClosed: null,
		performance: 12.5,
		brokerUrl: "https://example-broker.com/AAPL"
	},
	{
		asset: "BTC/USD",
		type: "Crypto",
		baseMargin: 5000,
		dateOpened: new Date("2023-03-01"),
		stopLoss: 25000,
		takeProfit: 40000,
		leverage: 2,
		dateClosed: new Date("2023-06-15"),
		performance: -5.2,
		brokerUrl: "https://example-crypto-exchange.com/BTC-USD"
	},
	// Add more sample positions as needed
];



// Create charts when the page loads
window.addEventListener('load', () => {
	createPieChart(assetAllocation);
	createLineChart(portfolioPerformance);
	createBarChart(assetReturns);

	populatePositionsTable(samplePositions);
	setupThemeSwitch();

	// Set initial theme
	document.body.classList.add('light-mode');
});
