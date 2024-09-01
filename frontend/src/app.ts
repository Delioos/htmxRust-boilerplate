import * as d3 from 'd3';
import 'htmx.org';

interface DataPoint {
    x: number;
    y: number;
}

function createChart(data: DataPoint[]) {
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.x) as number])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y) as number])
        .range([height, 0]);

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 5)
        .attr("fill", "steelblue");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));
}

// HTMX event listener
document.body.addEventListener('htmx:afterSwap', function(event) {
    const result = document.getElementById('result');
    if (result && result.textContent) {
        const data: DataPoint[] = JSON.parse(result.textContent);
        createChart(data);
    }
});
