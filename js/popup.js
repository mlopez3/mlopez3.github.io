let popup = Popup();

function popupTemplate(d){
    let html = '';
    html += '<h2>' + getSetString(d) + '</h2>';
    return html
}

function handleMouseover(e,d){
    popup.point(this)
        .html(popupTemplate(d))
        .draw();
    let index = d;
    d3.selectAll('g.map')
        .filter(function(d){
            return d[0] == index || d[1] == index
        })
        .classed('hidden', false)
}

function handleMouseout(){
    popup.hide();

    d3.selectAll('g.map')
        .classed('hidden', true)
}