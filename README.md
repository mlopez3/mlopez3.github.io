# mlopez3.github.io

<head>
    <title>Title</title>
    <script src="https://d3js.org/d3-selection.v1.min.js"></script>
    <script src="https://d3js.org/d3-interpolate.v1.min.js"></script>
    <script src="https://d3js.org/d3-scale.v2.min.js"></script>
    <script src="https://d3js.org/d3-array.v1.min.js"></script>
    <style>
        .bar-chart {
            border: solid 1px gray;
            position: relative;
            width: 800px;
        }
        .bar {
            height: 20px;
            left: 100px;
            background-color: orange;
            position: absolute;
            text-align: right;
            padding: 0 5px;
            font-family: sans-serif;
            font-size: 9pt;
        }
    </style>
</head>
<body>

<script>

    const distances = [
        {name: "Mercury", distance: 0.387},
        {name: "Venus", distance: 0.723},
        {name: "Earth", distance: 1},
        {name: "Mars", distance: 1.52},
        {name: "Jupiter", distance: 5.2},
        {name: "Saturn", distance: 9.54},
        {name: "Uranus", distance: 19.2},
        {name: "Neptune", distance: 30.1},
        {name: "Ceres", distance: 2.765},
        {name: "Pluto", distance: 39.481},
        {name: "Eris", distance: 67.67},
        {name: "Haumea", distance: 43},
        {name: "Makemake", distance: 45.346}
    ];

    const barScale = d3.scaleLinear()
                       .domain([0, d3.max(distances, d => d.distance)])
                       .range([0, 600]);

    distances.sort((a,b) => d3.ascending(a.distance, b.distance));

    d3.select("body")
        .append("div").attr("class", "bar-chart")
        .style("height", distances.length * 21 + "px")
        .selectAll("div").data(distances)
        .enter().append("div")
        .attr("class", "bar")
        .style("top", (d,i) => i * 21 + "px")
        .style("width", d => barScale(d.distance) + "px")
        .text(d => d.distance); // insert text with distance in <div>

  // notice you dont add rects or svgs
</script>
</body>
</html>
