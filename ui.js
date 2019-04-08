let optionsIsShown = false;
let keymapIsShown = false;
let uiIsDisabled = false;

window.addEventListener('keydown', function (e) {
    if(!uiIsDisabled){
        if (e.code === "ShiftLeft") {
            if (optionsIsShown || keymapIsShown){
                hideUI();
            } else {
                showUI();
            }
        }
        else if (e.code === "KeyO") {
            toggleOptions();
        }
        else if(e.code === "KeyK"){
            toggleKeyMap();
        }
    }
    if(e.code === "KeyH"){
        if (uiIsDisabled){
            enableUI();
        } else {
            disableUI();
        }
    }
});

function enableUI(){
    $('.icon-open.left').show();
    $('.icon-open.right').show();
    uiIsDisabled = false;
}

function disableUI() {
    hideUI();
    $('.icon-open.left').hide();
    $('.icon-open.right').hide();
    uiIsDisabled = true;
}

function showUI(){
    showOptions();
    showKeymap();
}

function hideUI(){
    hideOptions();
    hideKeymap();
}

function toggleOptions(){
    $('.ui-options').toggle();
    $('.icon-open.left').toggle();
    optionsIsShown = !optionsIsShown;
}

function toggleKeyMap(){
    $('.ui-keymap').toggle();
    $('.icon-open.right').toggle();
    keymapIsShown = !keymapIsShown;
}

function showOptions(){
    $('.ui-options').show();
    $('.icon-open.left').hide();
    optionsIsShown = true;
}

function showKeymap(){
    $('.ui-keymap').show();
    $('.icon-open.right').hide();
    keymapIsShown = true;
}

function hideOptions(){
    $('.ui-options').hide();
    $('.icon-open.left').show();
    optionsIsShown = false;
}

function hideKeymap(){
    $('.ui-keymap').hide();
    $('.icon-open.right').show();
    keymapIsShown = false;
}

function calculateG(x) {
    return 1 / 50 * Math.pow(x, 3);
}

//===============================================================================
//                              Slider-Setup
//===============================================================================

let gravitationRange = $("#gravitationRange");
let gravitationRangeValue = $("#gravitationRange-value");


gravitationRange.on("slide click" , () =>  {
    gravitationRangeValue.text(calculateG(gravitationRange.val()));
    G = calculateG(gravitationRange.val());
});

let slider2 = $("#slider-2");
let sliderValue2 = $("#slider-2-value");

slider2.slider();
slider2.slider('setValue', gridIterations);
sliderValue2.text(slider2.slider('getValue'));

slider2.on("slide", function(slideEvt) {
    sliderValue2.text(slideEvt.value);
    gridIterations = slideEvt.value;
});