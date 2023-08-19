let state = {
    selectedIndicator: 'reset'
};

function action(type, param){
    switch(type){
        case 'setSelectedIndicator':
            state.selectedIndicator = param;
            break;
    }
    update();
}