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
    $('.ui-icon-open.left').show();
    $('.ui-icon-open.right').show();
    uiIsDisabled = false;
}

function disableUI() {
    hideUI();
    $('.ui-icon-open.left').hide();
    $('.ui-icon-open.right').hide();
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
    $('.ui-icon-open.left').toggle();
    optionsIsShown = !optionsIsShown;
}

function toggleKeyMap(){
    $('.ui-keymap').toggle();
    $('.ui-icon-open.right').toggle();
    keymapIsShown = !keymapIsShown;
}

function showOptions(){
    $('.ui-options').show();
    $('.ui-icon-open.left').hide();
    optionsIsShown = true;
}

function showKeymap(){
    $('.ui-keymap').show();
    $('.ui-icon-open.right').hide();
    keymapIsShown = true;
}

function hideOptions(){
    $('.ui-options').hide();
    $('.ui-icon-open.left').show();
    optionsIsShown = false;
}

function hideKeymap(){
    $('.ui-keymap').hide();
    $('.ui-icon-open.right').show();
    keymapIsShown = false;
}