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

xVelocity = 0;

lastMousePosition = {x: 0, y: 0};

akerX = 0;
ankerY = 0;

lastFrameMouseDown = false;

scale = 1;
scaleGoal = 1;

minScale = 1;
maxScale = 1000;

dataPointSize = 10;
verticalLineSize = 20;

fontSize_title = 20;
fontSize_year = 20;
fontSize_month = 15;
fontSize_day = 10;

colors = {
    datapoint: 'red',
    verticalLine: 'black',
    title: 'black',
    year: 'black',
    month: 'black',
    day: 'black'
}

months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

titleElement = document.getElementById('title');
descriptionElement = document.getElementById('description');

const snapDistance = 30;

lastFrameScale = scale;

function update() {
    if(Math.abs(lastFrameMouseDown - mouse.down) > 0.5) {
        xVelocity = mouse.x - lastMousePosition.x;
    }

    //slow down the velocity
    xVelocity *= 0.9;

    //update x by the velocity
    x += xVelocity;

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
        scaleGoal -= mouse.scroll / 1000;
        if (scaleGoal < minScale) {
            scaleGoal = minScale;
        }
        if (scaleGoal > maxScale) {
            scaleGoal = maxScale;
        }
    }

    //smoothly zoom the timeline
    scaleDiff = scaleGoal - scale;
    if (Math.abs(scaleDiff) < 0.01) {scaleDiff = 0.01 * Math.sign(scaleDiff);}
    scale += scaleDiff / 10;
    if (Math.abs(scaleGoal - scale) < 0.001) {scale = scaleGoal;}

    mouse.scroll = 0;
    lastMousePosition.x = mouse.x;
    lastMousePosition.y = mouse.y;
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

    //calculate difference between the first and last date
    let firstDate = dates[0].date;
    //substract 1 year from the first date to make sure the first datapoint is not on the edge of the timeline
    firstDate = new Date(firstDate.getFullYear() - 1, firstDate.getMonth(), firstDate.getDate());
    let lastDate = dates[dates.length - 1].date;
    // add one year to the last date to make sure the last datapoint is not on the edge of the timeline
    lastDate = new Date(lastDate.getFullYear() + 1, lastDate.getMonth(), lastDate.getDate());
    let difference = lastDate - firstDate;


    //apply the scale by dividing the difference by the scale. also translate the timeline so the mouse is still over the same point
    difference /= scale;

    //draw vertical lines for each year
    let year = dates[0].date.getFullYear();
    let positionPercentage = 0;
    let yOffset = 0;
    while (year <= lastDate.getFullYear()){
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

    //if the scale is large enough, draw vertical lines for each month also draw the month if the scale is large enough
    if (scale > 5) {
        let month = 0;
        while (month < 12 * (dates[dates.length - 1].date.getFullYear() - dates[0].date.getFullYear())) {
            //dont draw a line for the first month of the year
            if (month % 12 != 0) {
                positionPercentage = (new Date(dates[0].date.getFullYear(), month, 1) - firstDate) / difference;
                ctx.beginPath();
                ctx.moveTo(canvas.width * positionPercentage + x, canvas.height / 2 - verticalLineSize / 2);
                ctx.lineTo(canvas.width * positionPercentage + x, canvas.height / 2 + verticalLineSize / 2);
                ctx.stroke();

                //draw the month
                if (scale > 10) {
                    ctx.font = fontSize_month + "px Arial";
                    yOffset = verticalLineSize / 2 + fontSize_month + 5;
                    ctx.fillStyle = colors.month;
                    ctx.fillText(months[month % 12], canvas.width * positionPercentage + x - ((fontSize_month / 5) * months[month % 12].length), canvas.height / 2 + yOffset);
                }
            }
            month++;
        }
    }

    //if the scale is large enough, draw vertical lines for each day, keep in mind that each month has a different amount of days also draw the day if the scale is large enough
    if (scale > 50) {
        let month = 0;
        while (month < 12 * (dates[dates.length - 1].date.getFullYear() - dates[0].date.getFullYear())) {
            let daysInMonth = new Date(dates[0].date.getFullYear(), month + 1, 0).getDate();
            let day = 0;
            console.log(daysInMonth);
            while (day < daysInMonth) {
                //dont draw a line for the first day of the month
                if (day != 0) {
                    //add one day to the date so the line is drawn at the end of the day
                    positionPercentage = (new Date(dates[0].date.getFullYear(), month, day + 1) - firstDate) / difference;
                    ctx.beginPath();
                    ctx.moveTo(canvas.width * positionPercentage + x, canvas.height / 2 - verticalLineSize / 4);
                    ctx.lineTo(canvas.width * positionPercentage + x, canvas.height / 2 + verticalLineSize / 4);
                    ctx.stroke();

                    //draw the day
                    if (scale > 100) {
                        ctx.font = fontSize_day + "px Arial";
                        yOffset = verticalLineSize / 4 + fontSize_day;
                        ctx.fillStyle = colors.day;
                        ctx.fillText(day + 1, canvas.width * positionPercentage + x - ((fontSize_day / 5) * (day + 1).toString().length), canvas.height / 2 + yOffset);   
                    }
                }
                day++;
            }
            month++;
        }    
    }



    //draw each datapoint on the timeline based on its date
    for (let i = 0; i < dates.length; i++) {
        //idk why but the position of the datapoint is always drawn one month too far to the right, so i subtract one month from the date
        newDate = new Date(dates[i].date.getFullYear(), dates[i].date.getMonth() - 1, dates[i].date.getDate());
        positionPercentage = (newDate - firstDate) / difference;
        ctx.beginPath();
        ctx.arc(canvas.width * positionPercentage + x, canvas.height / 2, dataPointSize, 0, 2 * Math.PI);
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
        //idk why but the position of the datapoint is always drawn one month too far to the right, so i subtract one month from the date
        newDate = new Date(dates[i].date.getFullYear(), dates[i].date.getMonth() - 1, dates[i].date.getDate());
        positionPercentage = (newDate - firstDate) / difference;
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

    lastFrameScale = scale;
    window.requestAnimationFrame(draw);
}

setInterval(update, 1000 / 60);
draw();