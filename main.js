canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

mouse = {
    x: 0,
    y: 0,
    down: false,
    scroll: 0
}

keys = [];

window.addEventListener('keydown', function (e) {
    keys[e.keyCode] = true;
});

window.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
});

window.addEventListener('wheel', function (e) {
    mouse.scroll = e.deltaY;
});

window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mousedown', function (e) {
    mouse.down = true;
});

window.addEventListener('mouseup', function (e) {
    mouse.down = false;
});

lastMousePosition = { x: 0, y: 0 };

anchor = null;

lastFrameMouseDown = false;

dataPointSizeNormal = 10;
dataPointSizeHover = 15;
dataPointSizeClick = 20;
dataPointSizeGoal = dataPointSizeNormal;
dataPointSize = dataPointSizeNormal;

hoverIndex = -1;
dataPointClicking = false;
hoverLock = false;

verticalLineSize = 20;

fontSize_title = 20;
fontSize_year = 20;
fontSize_month = 15;
fontSize_day = 10;

colors = {
    datapoint: 'red',
    datapointHover: 'cyan',
    horizontalLine: 'white',
    title: 'white',
    year: 'white',
    month: 'white',
    day: 'white'
}

strokeWidth = {
    horizontalLine: 2,
    verticalLine: 1
}

months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

dateElement = document.getElementById('date');
titleElement = document.getElementById('title');
descriptionElement = document.getElementById('description');

dates = [];

dates.push(new datapoint(new Date(2001, 4, 12), 'test1', 'test1'));
dates.push(new datapoint(new Date(2002, 9, 12), 'Julian', 'An diesem tag wurde Julian geboren'));
dates.push(new datapoint(new Date(2008, 9, 12), '| laaaaangerrrr Titelllll |', 'und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. und auch eine ganz lange beschreibung. ', "bottom"));
dates.push(new datapoint(new Date(2020, 1, 1), 'deine mom', 'tolle beschreibung alla'));
dates.push(new datapoint(new Date(2022, 2, 10), 'letztes datum', 'dies ist das letzte test datum'));

//calculate difference between the first and last date
let firstDate = dates[0].date;
//substract 1 year from the first date to make sure the first datapoint is not on the edge of the timeline
firstDate = new Date(firstDate.getFullYear() - 1, firstDate.getMonth(), firstDate.getDate());
let lastDate = dates[dates.length - 1].date;
// add one year to the last date to make sure the last datapoint is not on the edge of the timeline
lastDate = new Date(lastDate.getFullYear() + 1, lastDate.getMonth(), lastDate.getDate());

firstDateGoal = firstDate;
lastDateGoal = lastDate;

let dateRange = lastDate - firstDate;

const minZoom = 20000 * 60 * 60 * 24 * 365;
const maxZoom = 100 * 60 * 60 * 24 * 365;
function update() {
    dateRange = lastDate - firstDate;

    //move the timeline with the mouse
    if (mouse.down) {
        if (!lastFrameMouseDown) {
            //set the anchor to the date where the mouse was clicked
            anchor = new Date(firstDate.getTime() + (lastMousePosition.x / canvas.width) * (lastDate - firstDate));
        }
        //calculate the difference between the anchor and the current mouse position
        let difference = new Date(firstDate.getTime() + (mouse.x / canvas.width) * (lastDate - firstDate)) - anchor;
        //apply the difference to the first and last date
        firstDateGoal = new Date(firstDate.getTime() - difference);
        lastDateGoal = new Date(lastDate.getTime() - difference);
        lastFrameMouseDown = true;
    } else {
        lastFrameMouseDown = false;
    }

    //zoom in and out with the keyboard
    if (keys[187]) {
        mouse.scroll = -100;
    }
    if (keys[189]) {
        mouse.scroll = 100;
    }

    //move the timeline with the arrow keys
    if (keys[37]) {
        let difference = lastDate - firstDate;
        firstDateGoal = new Date(firstDate.getTime() - difference * 0.1);
        lastDateGoal = new Date(lastDate.getTime() - difference * 0.1);
    }
    if (keys[39]) {
        let difference = lastDate - firstDate;
        firstDateGoal = new Date(firstDate.getTime() + difference * 0.1);
        lastDateGoal = new Date(lastDate.getTime() + difference * 0.1);
    }

    //zoom in and out with the mouse wheel
    if (mouse.scroll != 0) {
        let difference = lastDate - firstDate;
        if (!(difference > minZoom && mouse.scroll > 0) && !(difference < maxZoom && mouse.scroll < 0)) {
            let newDifference = difference * (1 + mouse.scroll / 1000);
            let newPositionPercentage = (mouse.x / canvas.width);
            firstDateGoal = new Date(firstDate.getTime() + (difference - newDifference) * newPositionPercentage);
            lastDateGoal = new Date(lastDate.getTime() - (difference - newDifference) * (1 - newPositionPercentage));
        }
    }

    //move the timeline towards the goal
    let differenceFirstDate = firstDateGoal - firstDate;
    let differenceLastDate = lastDateGoal - lastDate;
    firstDate = new Date(firstDate.getTime() + differenceFirstDate / 10);
    lastDate = new Date(lastDate.getTime() + differenceLastDate / 10);

    //move dataPointSize towards the goal
    let differenceDataPointSize = dataPointSizeGoal - dataPointSize;
    dataPointSize = dataPointSize + differenceDataPointSize / 10;

    // if the mouse is over a datapoint, draw it's description and title on the top of the screen
    d = null;
    hovering = false;
    for (let i = 0; i < dates.length; i++) {
        //idk why but the position of the datapoint is always drawn one month too far to the right, so i subtract one month from the date
        newDate = new Date(dates[i].date.getFullYear(), dates[i].date.getMonth() - 1, dates[i].date.getDate());
        positionPercentage = (newDate - firstDate) / dateRange;
        xPos = canvas.width * positionPercentage;
        if (mouse.x > xPos - dataPointSize &&
            mouse.x < xPos + dataPointSize &&
            mouse.y > canvas.height / 2 - dataPointSize &&
            mouse.y < canvas.height / 2 + dataPointSize) {
            hovering = true;
            if (i != hoverIndex) {
                hoverIndex = i;
                hoverLock = false;
            }
            if(mouse.down){
               hoverLock = true;
               dataPointClicking = true;
            } else 
                dataPointClicking = false;

        }
    }

    if (!hovering && mouse.down)
        hoverLock = false;

    d = dates[hoverIndex];
    dateElement.innerHTML = d == null ? "" : d.date.getDate() + " " + months[d.date.getMonth()] + " " + d.date.getFullYear();
    descriptionElement.innerHTML = d == null ? "" : d.description;
    titleElement.innerHTML = d == null ? "" : d.title;

    dataPointSizeGoal = hovering ? dataPointSizeHover : dataPointSizeNormal;
    if (dataPointClicking)
        dataPointSizeGoal = dataPointSizeClick;

    if (!hovering && !hoverLock) {
        hoverIndex = -1;
    }


    mouse.scroll = 0;
    lastMousePosition.x = mouse.x;
    lastMousePosition.y = mouse.y;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw timeline between datapoints
    for (let i = -1; i <= dates.length - 1; i++) {
        lineDistance = 5;
        let positionPercentage1 = 0
        let positionPercentage2 = canvas.width;
        
        if (i >= 0) {
            //idk why but the position of the datapoint is always drawn one month too far to the right, so i subtract one month from the date
            newDate = new Date(dates[i].date.getFullYear(), dates[i].date.getMonth() - 1, dates[i].date.getDate());
            positionPercentage1 = (newDate - firstDate) / (lastDate - firstDate);
        }
        if (i <= dates.length - 2) {
            //same as above
            newDate2 = new Date(dates[i + 1].date.getFullYear(), dates[i + 1].date.getMonth() - 1, dates[i + 1].date.getDate());
            positionPercentage2 = (newDate2 - firstDate) / (lastDate - firstDate);
        }
        
        pSize1 = hoverIndex == i ? dataPointSize : dataPointSizeNormal;
        pSize2 = hoverIndex == i + 1 ? dataPointSize : dataPointSizeNormal;

        if (i == -1) {
            pSize1 = -10;
        }

        ctx.beginPath();
        ctx.moveTo((canvas.width * positionPercentage1) + pSize1 + lineDistance, canvas.height / 2);
        ctx.lineTo((canvas.width * positionPercentage2) - pSize2 - lineDistance, canvas.height / 2);
        ctx.strokeStyle = colors.timeline;
        ctx.lineWidth = strokeWidth.horizontalLine;
        ctx.stroke();

        //draw quater circles around the datapoint
        ctx.beginPath();
        ctx.arc(canvas.width * positionPercentage2, canvas.height / 2, pSize2 + lineDistance, Math.PI / 2, Math.PI);
        ctx.strokeStyle = colors.timeline;
        ctx.lineWidth = strokeWidth.horizontalLine;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(canvas.width * positionPercentage2, canvas.height / 2, pSize2 + lineDistance, Math.PI * 3 / 2, 0);
        ctx.strokeStyle = colors.timeline;
        ctx.lineWidth = strokeWidth.horizontalLine;
        ctx.stroke();

    }

    //draw vertical lines for each year
    let year = firstDate.getFullYear();
    let positionPercentage = 0;
    let yOffset = 0;
    while (year <= lastDate.getFullYear()) {
        positionPercentage = (new Date(year, 0, 1) - firstDate) / dateRange;
        ctx.beginPath();
        ctx.moveTo(canvas.width * positionPercentage, canvas.height / 2 - verticalLineSize);
        ctx.lineTo(canvas.width * positionPercentage, canvas.height / 2 + verticalLineSize);
        ctx.strokeStyle = colors.year;
        ctx.lineWidth = strokeWidth.verticalLine;
        ctx.stroke();

        //draw the year
        ctx.font = fontSize_year + "px Arial";
        yOffset = verticalLineSize + fontSize_year;
        ctx.fillStyle = colors.year;
        ctx.fillText(year, canvas.width * positionPercentage - ((fontSize_year / 5) * year.toString().length), canvas.height / 2 + yOffset);

        year++;
    }

    //if the scale is large enough, draw vertical lines for each month also draw the month if the scale is large enough
    if (dateRange < 6000 * 60 * 60 * 24 * 30 * 12) {
        let month = 0;
        while (month < 12 * (lastDate.getFullYear() - firstDate.getFullYear() + 1)) {
            //dont draw a line for the first month of the year
            if (month % 12 != 0) {
                positionPercentage = (new Date(firstDate.getFullYear(), month, 1) - firstDate) / dateRange;
                ctx.beginPath();
                ctx.moveTo(canvas.width * positionPercentage, canvas.height / 2 - verticalLineSize / 2);
                ctx.lineTo(canvas.width * positionPercentage, canvas.height / 2 + verticalLineSize / 2);
                ctx.lineWidth = strokeWidth.verticalLine;
                ctx.stroke();

                //draw the month
                if (dateRange < 5000 * 60 * 60 * 24 * 30 * 3) {
                    ctx.font = fontSize_month + "px Arial";
                    yOffset = verticalLineSize / 2 + fontSize_month + 5;
                    ctx.fillStyle = colors.month;
                    ctx.fillText(months[month % 12], canvas.width * positionPercentage - ((fontSize_month / 5) * months[month % 12].length), canvas.height / 2 + yOffset);
                }
            }
            month++;
        }
    }

    //if the scale is large enough, draw vertical lines for each day, keep in mind that each month has a different amount of days also draw the day if the scale is large enough
    if (dateRange < 2000 * 60 * 60 * 24 * 30 * 3) {
        let month = 0;
        while (month < 12 * (dates[dates.length - 1].date.getFullYear() - dates[0].date.getFullYear())) {
            let daysInMonth = new Date(dates[0].date.getFullYear(), month + 1, 0).getDate();
            let day = 0;
            while (day < daysInMonth) {
                //dont draw a line for the first day of the month
                if (day != 0) {
                    //add one day to the date so the line is drawn at the end of the day
                    positionPercentage = (new Date(dates[0].date.getFullYear(), month, day + 1) - firstDate) / dateRange;
                    ctx.beginPath();
                    ctx.moveTo(canvas.width * positionPercentage, canvas.height / 2 - verticalLineSize / 4);
                    ctx.lineTo(canvas.width * positionPercentage, canvas.height / 2 + verticalLineSize / 4);
                    ctx.lineWidth = strokeWidth.verticalLine;
                    ctx.stroke();

                    //draw the day
                    if (dateRange < 1000 * 60 * 60 * 24 * 30 * 3) {
                        ctx.font = fontSize_day + "px Arial";
                        yOffset = verticalLineSize / 4 + fontSize_day;
                        ctx.fillStyle = colors.day;
                        ctx.fillText(day + 1, canvas.width * positionPercentage - ((fontSize_day / 5) * (day + 1).toString().length), canvas.height / 2 + yOffset);
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
        positionPercentage = (newDate - firstDate) / dateRange;
        ctx.beginPath();
        pSize = hoverIndex == i ? dataPointSize : dataPointSizeNormal;
        ctx.arc(canvas.width * positionPercentage, canvas.height / 2, pSize, 0, 2 * Math.PI);
        ctx.fillStyle = i == hoverIndex ? colors.datapointHover : colors.datapoint;
        ctx.fill();

        //draw the title of the datapoint
        ctx.font = fontSize_title + "px Arial";
        yOffset = dates[i].position == "top" ? -20 - verticalLineSize / 2 : 20 + verticalLineSize + fontSize_title / 2 + fontSize_year / 2 + 10;
        ctx.fillStyle = colors.title;
        ctx.fillText(dates[i].title, canvas.width * positionPercentage - ((fontSize_title / 5) * dates[i].title.length), canvas.height / 2 + yOffset);
    }
    window.requestAnimationFrame(draw);
}

setInterval(update, 1000 / 60);
draw();