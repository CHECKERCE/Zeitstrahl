canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

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

minScale = 1;
maxScale = 10;

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

    if (x < -canvas.width * scale) {x = -canvas.width * scale;}
    if (x > canvas.width * scale) {x = canvas.width * scale;}
    if (y < -canvas.height * scale) {y = -canvas.height * scale;}
    if (y > canvas.height * scale) {y = canvas.height * scale;}

    //zoom the timeline with the mouse wheel
    if (mouse.scroll != 0) {
        scale -= mouse.scroll / 1000;
        if (scale < minScale) {
            scale = minScale;
        }
        if (scale > maxScale) {
            scale = maxScale;
        }
    }

    //todo: correct position after zooming
    


    zeitstrahl.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
    mouse.scroll = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw the timeline image
    ctx.drawImage(zeitstrahl, x, y, canvas.width * scale, (canvas.width / 2.687) * scale);
    window.requestAnimationFrame(draw);
}

setInterval(update, 1000 / 60);
draw();