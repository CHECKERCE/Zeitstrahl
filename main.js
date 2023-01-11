mouse = {
    x: 0,
    y: 0,
    down: false,
    scroll : 0
}

keys = [];

window.addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
});

window.addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
});

window.addEventListener('wheel', function(e) {
    mouse.scroll = e.deltaY;
});

window.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mousedown', function(e) {
    mouse.down = true;
});

window.addEventListener('mouseup', function(e) {
    mouse.down = false;
});

zeitstrahl = document.getElementById('zeitstrahl');

x = 0;
y = 0;

akerX = 0;
ankerY = 0;

lastFrameMouseDown = false;

scale = 1;

function update() {
    //move the timeline with the mouse
    if (mouse.down) {
        if (!lastFrameMouseDown) {
            ankerX = mouse.x - x;
            ankerY = mouse.y - y;
        }
        x = mouse.x - ankerX;
        y = mouse.y - ankerY;
        lastFrameMouseDown = true;
    } else {
        lastFrameMouseDown = false;
    }

    zeitstrahlAnker = zeitstrahl.getBoundingClientRect();

    mouseOnZeitstrahlX = mouse.x - zeitstrahlAnker.left;
    mouseOnZeitstrahlY = mouse.y - zeitstrahlAnker.top;

    scale += -mouse.scroll / 1000;
    if (scale < 0.1) {
        scale = 0.1;
    }

    zeitstrahlAnker = zeitstrahl.getBoundingClientRect();
    mouseOnZeitstrahlXNew = mouse.x - zeitstrahlAnker.left;
    mouseOnZeitstrahlYNew = mouse.y - zeitstrahlAnker.top;

    x += mouseOnZeitstrahlX - mouseOnZeitstrahlXNew;
    y += mouseOnZeitstrahlY - mouseOnZeitstrahlYNew;


    //reset scroll
    mouse.scroll = 0;
    

    zeitstrahl.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
}

setInterval(update, 1000 / 60);