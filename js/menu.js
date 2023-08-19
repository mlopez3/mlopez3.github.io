let menuItems = [
    {
        id: 'reset',
        label: 'Reset'
    },
    {
        id: 'all_maps',
        label: 'Show All Mappings'
    },
    {
        id: 'left_maps',
        label: 'Show Left Adjoint'
    },
    {
        id: 'right_maps',
        label: 'Show Right Adjoint'
    }
]

function handleMenuClick(e,d){
    action('setSelectedIndicator', d.id);
}

function updateMenu() {
    d3.select('#controls .menu .items')
    .selectAll('.item')
    .data(menuItems)
    .join('div')
    .classed('item', true)
    .classed('selected', function(d) {
    return state.selectedIndicator === d.id;
    })
    .text(function(d) {
    return d.label;
    })
    .on('click', handleMenuClick);
    }