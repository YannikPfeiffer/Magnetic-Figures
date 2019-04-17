let optionsIsShown = false;
let keymapIsShown = false;
let uiIsDisabled = false;

window.addEventListener('keydown', function (e) {
    if (!uiIsDisabled) {
        if (e.code === "ShiftLeft") {
            if (optionsIsShown || keymapIsShown) {
                hideUI();
            } else {
                showUI();
            }
        } else if (e.code === "KeyO") {
            toggleOptions();
        } else if (e.code === "KeyK") {
            toggleKeyMap();
        }
    }
    if (e.code === "KeyH") {
        if (uiIsDisabled) {
            enableUI();
        } else {
            disableUI();
        }
    }
});

function enableUI() {
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

function showUI() {
    showOptions();
    showKeymap();
}

function hideUI() {
    hideOptions();
    hideKeymap();
}

function toggleOptions() {
    $('.ui-options').toggle();
    $('.icon-open.left').toggle();
    optionsIsShown = !optionsIsShown;
}

function toggleKeyMap() {
    $('.ui-keymap').toggle();
    $('.icon-open.right').toggle();
    keymapIsShown = !keymapIsShown;
}

function showOptions() {
    $('.ui-options').show();
    $('.icon-open.left').hide();
    optionsIsShown = true;
}

function showKeymap() {
    $('.ui-keymap').show();
    $('.icon-open.right').hide();
    keymapIsShown = true;
}

function hideOptions() {
    $('.ui-options').hide();
    $('.icon-open.left').show();
    optionsIsShown = false;
}

function hideKeymap() {
    $('.ui-keymap').hide();
    $('.icon-open.right').show();
    keymapIsShown = false;
}

function calculateG(x, reverse = false) {
    const vorzeichen = x < 0 ? -1 : 1;
    if (!reverse) {
        return vorzeichen * (1 / 25 * Math.pow(x, 2));
    } else {
        return vorzeichen * Math.sqrt(x * vorzeichen * 25);
    }
}

function updateGravitationRange() {
    gravitationRange.val(calculateG(G, true));
    gravitationRangeValue.text(G.toFixed(1));
}

//===============================================================================
//                              Slider-Setup
//===============================================================================

let gravitationRange = $("#gravitationRange");
let gravitationRangeValue = $("#gravitationRange-value");

updateGravitationRange();

gravitationRange.on("slide click", () => {
    G = calculateG(gravitationRange.val());
    updateGravitationRange();
});

let gridRange = $("#gridRange");
let gridRangeValue = $("#gridRange-value");

gridRangeValue.text(gridRange.val());

gridRange.on("slide, click", () => {
    gridRangeValue.text(gridRange.val());
    gridSettings.gridIterations = parseInt(gridRange.val());
});

let lineWidthRange = $("#lineWidthRange");
let lineWidthRangeValue = $("#lineWidthRange-value");

lineWidthRange.val(particleSettings.lineWidth);
lineWidthRangeValue.text(particleSettings.lineWidth);

lineWidthRange.on("slide click", () => {
    lineWidthRangeValue.text(lineWidthRange.val());
    particleSettings.lineWidth = parseInt(lineWidthRange.val());
});

let opacityRange = $("#opacityRange");
let opacityRangeValue = $("#opacityRange-value");

opacityRange.val(particleOpacity);
opacityRangeValue.text(opacityRange.val());

opacityRange.on("click slide", () => {
    opacityRangeValue.text(opacityRange.val());
    particleOpacity = parseFloat(opacityRange.val());
});

let spreadRange = $("#spreadRange");
let spreadRangeValue = $("#spreadRange-value");

spreadRange.val(cannonSettings.spread);
spreadRangeValue.text(spreadRange.val());

spreadRange.on("slide click", () => {
    spreadRangeValue.text(spreadRange.val());
    cannonSettings.spread = parseInt(spreadRange.val());
});

//===============================================================================
//                              Checkbox-Setup
//===============================================================================

let pathCheckbox = $("#pathCheckbox");

pathCheckbox.prop("checked", globalSettings.tracePath);

pathCheckbox.on("click", () => {
    globalSettings.tracePath = !globalSettings.tracePath;
});

let rainbowCheckbox = $("#rainbowCheckbox");

rainbowCheckbox.prop("checked", particleSettings.rainbowMode);

rainbowCheckbox.on("click", () => {
    particleSettings.rainbowMode = !particleSettings.rainbowMode;
});

//===============================================================================
//                              NumberInput-Setup
//===============================================================================

let deployCountInput = $("#deployCount-input");

deployCountInput.val(particleSettings.deployCount);

deployCountInput.on("change", () => {
    particleSettings.deployCount = deployCountInput.val();
});
