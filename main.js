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

dataPointSize = 10;
verticalLineSize = 20;

fontSize_title = 20;
fontSize_year = 20;

colors = {
    datapoint: 'red',
    verticalLine: 'black',
    title: 'black',
    year: 'black'
}

titleElement = document.getElementById('title');
descriptionElement = document.getElementById('description');

const snapDistance = 30;
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

    //smoothly snap the timeline back to the center
    if (! mouse.down) {
    if (Math.abs(x) < snapDistance) {x *= 0.9;}
    if (Math.abs(y) < snapDistance) {y *= 0.9;}

    if (Math.abs(x) < 1) {x = 0;}
    if (Math.abs(y) < 1) {y = 0;}
    }

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

    //todo: correct the position of the timeline when zooming so that the mouse is still over the same point

    mouse.scroll = 0;
}

dates = [];


dates.push( new datapoint(new Date(2001, 4, 12), 'test1', 'test1'));
dates.push( new datapoint(new Date(2002, 9, 12), 'Julian', 'An diesem tag wurde Julian geboren'));
dates.push( new datapoint(new Date(2008, 9, 12), '| laaaaangerrrr Titelllll |', 'An diesem tag war das datum 12.09.2008', "bottom")); 
dates.push( new datapoint(new Date(2020, 1, 1), 'deine mom', 'tolle beschreibung alla'));
dates.push( new datapoint(new Date(2022, 2, 10), 'letztes datum', 'dies ist das letzte test datum'));

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw the timeline image

    //draw timeline
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    //draw datapoints
    //calculate difference between the first and last date
    let firstDate = dates[0].date - 20000000000;    //subtract 20000000000 to make sure the first datapoint is not on the edge of the timeline
    let lastDate = dates[dates.length - 1].date - -20000000000; //add 20000000000 for the same reason. double minus to make it positive. + doesnt work bc javascript is stupid and doesnt know how to add numbers and strings :/
    let difference = lastDate - firstDate;

    //draw vertical lines for each year
    let year = dates[0].date.getFullYear();
    let positionPercentage = 0;
    let yOffset = 0;
    while (year <= dates[dates.length - 1].date.getFullYear()) {
        positionPercentage = (new Date(year, 0, 1) - firstDate) / difference;
        ctx.beginPath();
        ctx.moveTo(canvas.width * positionPercentage + x, canvas.height / 2 - verticalLineSize);
        ctx.lineTo(canvas.width * positionPercentage + x, canvas.height / 2 + verticalLineSize);
        ctx.stroke();
        
        //draw the year
        ctx.font = fontSize_year + "px Arial";
        yOffset = verticalLineSize + fontSize_year;
        ctx.fillStyle = colors.year;
        ctx.fillText(year, canvas.width * positionPercentage + x - ((fontSize_year / 5) * year.toString().length), canvas.height / 2 + yOffset);

        year++;
    }


    //draw each datapoint on the timeline based on its date
    for (let i = 0; i < dates.length; i++) {
        positionPercentage = (dates[i].date - firstDate) / difference;
        ctx.beginPath();
        ctx.arc(canvas.width * positionPercentage + x - dataPointSize / 2, canvas.height / 2, dataPointSize, 0, 2 * Math.PI);
        ctx.fillStyle = colors.datapoint;
        ctx.fill();

        //draw the title of the datapoint
        ctx.font = fontSize_title + "px Arial";
        yOffset = dates[i].position == "top" ? -20 - verticalLineSize / 2: 20 + verticalLineSize + fontSize_title / 2 + fontSize_year / 2 + 10;
        ctx.fillStyle = colors.title;
        ctx.fillText(dates[i].title, canvas.width * positionPercentage + x - ((fontSize_title / 5) * dates[i].title.length), canvas.height / 2 + yOffset);
    }
    
    // if the mouse is over a datapoint, draw it's description and title on the top of the screen
    d = null;
    for (let i = 0; i < dates.length; i++) {
        positionPercentage = (dates[i].date - firstDate) / difference;
        xPos = canvas.width * positionPercentage + x;
        if (mouse.x > xPos - dataPointSize && 
            mouse.x < xPos + dataPointSize && 
            mouse.y > canvas.height / 2 - dataPointSize && 
            mouse.y < canvas.height / 2 + dataPointSize) {
           d = dates[i];
        }
    }
    descriptionElement.innerHTML = d == null ? "" : d.description;
    titleElement.innerHTML = d == null ? "" : d.title;
    
    window.requestAnimationFrame(draw);
}

setInterval(update, 1000 / 60);
draw();