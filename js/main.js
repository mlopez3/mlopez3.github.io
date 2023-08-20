let lattice1;
let lattice2;
let lat1_len;
let left_adj;
let right_adj;

var config = {
    bottom: 650
}

function getNeighborhood(d){
    let shift = lat1_len;
    let src = lattice2;
    if( d < lat1_len){
        shift = 0;
        src = lattice1
    }
    let item = [d - shift];
    let lower = src.lattice[d - shift][1];
    let upper = src.lattice[d - shift][2];
    return lower.concat(upper, item)
}

function handleCircleClick(e,d){
    let shift = lat1_len;
    let elem = d3.select('#lattice2')
    if (d < lat1_len){
        shift = 0;
        elem = d3.select('#lattice1')
    }
    let index = d - shift;
    elem.selectAll('.circles, .link')
        .classed('opaque', false)

    elem.selectAll('.circles')
        .filter(function(d){
            return ( !getNeighborhood(d).includes(index))
        })
        .classed('opaque', true);

    elem.selectAll('.link')
        .filter(function(d){
            return !( index == d.source || index == d.target)
        })
        .classed('opaque', true);
}

function getGenerators(){
    // return generators for both lattices in a list
    let gens = [];
    let gen = ' ';
    for(let i = 0; i < lattice1.generators.length; i++){
        let set = '{';
        if (lattice1.generators.length == 0){
            set = '{}';
        } else {
            for(let j = 0; j < lattice1.generators[i].length; j++){
                set += lattice1.values[lattice1.generators[i][j]] + ',\ '
                if( j + 1 == lattice1.generators[i].length){
                    set = set.slice(0,-2);
                }
            }
        }
        gen += set + '} ';
    }
    gens.push(gen)
    gen = ''
    for(let i = 0; i < lattice2.generators.length; i++){
        let set = '{';
        if (lattice2.generators.length == 0){
            set = '{}';
        } else {
            for(let j = 0; j < lattice2.generators[i].length; j++){
                set += lattice2.values[lattice2.generators[i][j]] + ',\ '
                if( j + 1 == lattice2.generators[i].length){
                    set = set.slice(0,-2);
                }
            }
        }
        gen += set + '} ';
    }
    gens.push(gen)
    return gens
}

function getSetString(d){
    // d is the index of the node
    let src = lattice2;
    let shift = lat1_len;
    if ( d < lat1_len){
        src = lattice1;
        shift = 0;
    }
    let set_indices = src.lattice[d - shift][0];
    let set_str = '{';
    if(set_indices.length == 0){
        set_str += ','
    }
    for(let i = 0; i < set_indices.length; i++){
        set_str += src.values[set_indices[i]] + ',';
    }
    return set_str.slice(0,-1) + "}"
}

function getTranslation(transform) {
    // Code from stack exchange
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttributeNS(null, "transform", transform);
    var matrix = g.transform.baseVal.consolidate().matrix;
    return [matrix.e, matrix.f];
  }


function getPositions(s, t, lat_num){
    // s and t are the indices of the nodes
    let positions = [];
    let elem;
    let shift = 0;
    if(lat_num == 1){
        elem = d3.select('#nodes1');
    } else{
        elem = d3.select('#nodes2');
        shift = lat1_len;
    }
    elem.selectAll('g.circles')
        .filter(function(d){
            return (d - shift == s || d - shift == t)
        })
        .each(function(d){
            let trans = getTranslation(d3.select(this).attr("transform"));
            let parent_trans = getTranslation(d3.select(this.parentNode).attr("transform"));
            let pos = {};
            pos.x = trans[0] + parent_trans[0];
            pos.y = trans[1] + parent_trans[1];
            positions.push(pos);
        })
    return positions;
}

function getNodePosition(index){
    let elem;
    let pos = {};
    if (index < lat1_len){
        elem = d3.select('#nodes1');
    } else{
        elem = d3.select('#nodes2');
    }
    elem.selectAll('g.circles')
        .filter(function(d){
            return d == index
        })
        .each(function(d){
            let elem_trans = getTranslation(elem.attr("transform"));
            let parent_trans = getTranslation(d3.select(this.parentNode).attr('transform'))
            let circle_trans = getTranslation(d3.select(this).attr("transform"));
            pos.x = elem_trans[0] + circle_trans[0] + parent_trans[0];
            pos.y = elem_trans[1] + circle_trans[1] + parent_trans[1];
        })
    return pos
}

function initializeMap(d){
    let g = d3.select(this);
    g.classed('map', true);
    g.classed('hidden', true);
    let parent_id = d3.select(this.parentNode).attr('id');
    let indices;
    let label;
    if (parent_id == 'maps1'){
        indices =[d[0], d[1] + lat1_len];
        label = 'left_map';
    } else{
        indices =[d[0] + lat1_len, d[1]];
        label = 'right_map'
    }
    let src = getNodePosition(indices[0]);
    let tgt = getNodePosition(indices[1]);
    let coords = {
        'x' : [ src.x, tgt.x ],
        'y' : [ src.y, tgt.y ]
    };
    var line = d3.line()
                .curve(d3.curveBasis)
                .x( function(d) { return coords.x[d] } )
                .y( function(d) { return coords.y[d] } );

    var indexies = d3.range( coords.x.length );
    g.append('path')
        .datum(indexies)
        .join('path')
        .attr('d', line)
        .attr('class', label)
    
    g.datum(indices)
        .enter()
}

function initializeEdge(d){
    let g = d3.select(this);
    g.classed('link', true);
    let lat_num = 2;
    if( d3.select(this.parentNode).attr('id') == 'edges1'){
        lat_num = 1;
    }
    let src = d.source;
    let tgt = d.target;
    let positions = getPositions(src, tgt, lat_num);
    var data = [
        {
            x : [
                    positions[0].x,
                    positions[0].x - 1.5,
                    positions[1].x - 1.5,
                    positions[1].x
                ],
            y : [
                    positions[0].y, 
                    positions[0].y - (positions[0].y - positions[1].y) / 6,
                    positions[0].y - 5*(positions[0].y - positions[1].y) /6,
                    positions[1].y
                ]
        },
        {
            x : [
                    positions[0].x, 
                    positions[0].x + 1.5, 
                    positions[1].x  + 1.5, 
                    positions[1].x
                ],
            y : [
                    positions[0].y,
                    positions[0].y - (positions[0].y - positions[1].y) /6,
                    positions[0].y - 5*(positions[0].y - positions[1].y) /6,
                    positions[1].y
                ]   
        }
    ]
    var indexies = d3.range( data[0].x.length );
    var area = d3.area()
                .curve(d3.curveMonotoneY)
                .x0( function(d) { return data[1].x[d] } )
                .x1( function(d) { return data[0].x[d] } )
                .y0( function(d) { return data[1].y[d] } )
                .y1(  function(d) { return data[1].y[d] } );

    g.append('path')
        .datum(indexies)
        .join('path')
        .attr('class', 'area')
        .attr('d', area) 
}

function addCircles(d, i){
    let circles = d3.select(this);
    let radii = [10,6]

    circles.selectAll('circle')
        .data(radii)
        .join('circle')
        .each(function(d){
            d3.select(this).attr('r', d);
            if (d == 10){
                d3.select(this).classed('outer', true)
            } else{
                d3.select(this).classed('inner', true)
            }
        })
}

function initializeNodes(d, i){
    // this group has unshifted data stored
    let g = d3.select(this)
    let offset;
    if (d.length % 2 == 0){
        offset = -(d.length/2 * 50 - 25);
    } else{
        offset = -( (d.length - 1)/2 *50);
    }
    g.attr('transform', 'translate(' + offset + ',' + (config.bottom - i * 100) + ')')

    let shift = 0;
    if( d3.select(this.parentNode).attr('id') == 'nodes2'){
        shift = lat1_len;
    }

    let data = [];
    for(i=0; i < d.length; i++){
        data.push(shift + d[i]);
    }
    console.log(data)
    //subgroup circle has shifted indices stored
    g.selectAll('g')
        .data(data)
        .join('g')
        .attr('class', 'circles')
        .attr('transform',function(d, i){
            return 'translate(' + i * 50 + ',0)'
        })
        .each(addCircles)
        .on('mouseover', handleMouseover)
        .on('mouseout', handleMouseout)
        .on('click', handleCircleClick)
}

function initialize() {
    d3.select('#nodes1')
        .selectAll('g')
        .data(lattice1.layers)
        .join('g')
        .each(initializeNodes)

    d3.select('#edges1')
        .selectAll('g')
        .data(lattice1.links)
        .join('g')
        .each(initializeEdge)

    d3.select('#nodes2')
        .selectAll('g')
        .data(lattice2.layers)
        .join('g')
        .each(initializeNodes)

    d3.select('#edges2')
        .selectAll('g')
        .data(lattice2.links)
        .join('g')
        .each(initializeEdge)

    d3.select('#maps1')
        .selectAll('g')
        .data(left_adj)
        .join('g')
        .each(initializeMap)

    d3.select('#maps2')
        .selectAll('g')
        .data(right_adj)
        .join('g')
        .each(initializeMap)
    
    updateMenu();
}

function getDescription(){
    d3.select('#description')
    .text( 'The lattice on the left is generated by the sets:' + getGenerators()[0] 
    + '. The lattice on the right is generated by the sets: ' + getGenerators()[1] )
}

function update(){
    updateNodes();
    updateEdges();
    updateMaps();
    updateMenu();
}

function updateNodes(){
    if (state.selectedIndicator === 'reset'){
        d3.selectAll('g.circles')
        .classed("opaque", false)
    }
}

function updateEdges(){
    if (state.selectedIndicator === 'reset'){
        d3.selectAll('g.link')
        .classed("opaque", false)
    }
}

function updateMaps(){
    if (state.selectedIndicator === 'all_maps'){
        d3.selectAll('g.map')
            .classed("hidden", false)
    }
    if (state.selectedIndicator === 'left_maps'){
        d3.select('#maps1')
            .selectAll('g.map')
            .classed("hidden", false)
        d3.select('#maps2')
            .selectAll('g.map')
            .classed("hidden", true)
    }
    if (state.selectedIndicator === 'right_maps'){
        d3.select('#maps2')
            .selectAll('g.map')
            .classed("hidden", false)
        d3.select('#maps1')
            .selectAll('g.map')
            .classed("hidden", true)
    }
    if (state.selectedIndicator === 'reset'){
        d3.selectAll('g.map')
            .classed("hidden", true)
    }
}

function dataIsReady(json) {
    lattice1 = json.lat1;
    lattice2 = json.lat2;
    lat1_len = (lattice1.lattice).length;
    left_adj = json.left_adj
    right_adj = json.right_adj
    initialize();
}


d3.json('data/rel.json')
    .then(dataIsReady)
    .then(getDescription);





