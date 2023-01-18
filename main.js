//#region canvas setup
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//#endregion

//#region event listeners
window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let mouse = {
    x: 0,
    y: 0,
    down: false,
    scroll: 0
}

let keys = [];

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
//#endregion

//#region variables
let lastMousePosition = { x: 0, y: 0 };

let anchor = null;

let lastFrameMouseDown = false;

let verticalLineSize = 20;
let lineDistance = 5;

fontSize_title = 20;
fontSize_year = 20;
fontSize_month = 15;
fontSize_day = 10;

const minZoom = 20000 * 60 * 60 * 24 * 365;
const maxZoom = 100 * 60 * 60 * 24 * 365;

let firstDate;
let lastDate;
let dateRange;

let minHeat;
let maxHeat;
let heatRange = 0;

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
//#endregion

//#region load data from json file
fetch('timeline.json')
    .then(response => response.json())
    .then(data => {
        //sort the data by date
        data.sort((a, b) => {
            return a.year - b.year;
        });
        //convert the data to a format that is easier to work with
        data.forEach(element => {
            dates.push(new datapoint(new Date(element.year, 0, 1), element.title, element.description, element.heat));
        });
    }).then(() => {
        init();
    });
//#endregion

function init() {
    //calculate difference between the first and last date
    firstDate = dates[0].date;
    //substract 1 year from the first date to make sure the first datapoint is not on the edge of the timeline
    firstDate = new Date(firstDate.getFullYear() - 1, firstDate.getMonth(), firstDate.getDate());
    lastDate = dates[dates.length - 1].date;
    // add one year to the last date to make sure the last datapoint is not on the edge of the timeline
    lastDate = new Date(lastDate.getFullYear() + 1, lastDate.getMonth(), lastDate.getDate());

    //calculate the range of the heat values which can be negative and positive
    minHeat = 0;
    maxHeat = 0;
    dates.forEach(element => {
        if (element.heat < minHeat) {
            minHeat = element.heat;
        }
        if (element.heat > maxHeat) {
            maxHeat = element.heat;
        }
    });
    heatRange = maxHeat - minHeat;

    //set heatNormalized for each datapoint
    dates.forEach(element => {
        element.heatNormalized = (element.heat - minHeat) / heatRange;
    });

    firstDateGoal = firstDate;
    lastDateGoal = lastDate;

    dateRange = lastDate - firstDate;

    //if dateRange is larger than the minZoom, set the first and last date to the minZoom
    if (dateRange > minZoom) {
        //middle of the timeline
        let middle = new Date(firstDate.getTime() + (lastDate - firstDate) / 2);
        //set the first and last date to the minZoom
        firstDateGoal = new Date(middle.getTime() - (minZoom / 2));
        lastDateGoal = new Date(middle.getTime() + (minZoom / 2));
    }


    setInterval(update, 1000 / 60);
    draw();
}

function update() {
    dateRange = lastDate - firstDate;

    dates.forEach(element => {
        element.update();
    });

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

    // if the mouse is over a datapoint, draw it's description and title on the top of the screen
    hoverDate = null;
    for (let i = 0; i < dates.length; i++) {
        let d = dates[i];
        //idk why but the position of the datapoint is always drawn one month too far to the right, so i subtract one month from the date
        newDate = d.date;
        positionPercentage = (newDate - firstDate) / dateRange;
        xPos = canvas.width * positionPercentage;
        if (mouse.x > xPos - d.size - lineDistance &&
            mouse.x < xPos + d.size + lineDistance &&
            mouse.y > canvas.height / 2 - d.size &&
            mouse.y < canvas.height / 2 + d.size) {

            d.hovering = true;
            hoverDate = d;
            if (mouse.down) {
                clearClicked();
                d.clicked = true;
            } else {
                c = d.clicked;
                clearClicked();
                d.clicked = c;
            }
        } else {
            d.hovering = false;
        }
    }

    dates.forEach(element => {
        if (element.clicked) {
            hoverDate = element;
        }
    });



    updateTitleDescription(hoverDate);

    mouse.scroll = 0;
    lastMousePosition.x = mouse.x;
    lastMousePosition.y = mouse.y;
}

function updateTitleDescription(d) {
    dateElement.innerHTML = d == null ? "" : d.date.getDate() + " " + months[d.date.getMonth()] + " " + d.date.getFullYear();
    descriptionElement.innerHTML = d == null ? "" : d.description;
    titleElement.innerHTML = d == null ? "" : d.title;
}

function clearClicked() {
    for (let j = 0; j < dates.length; j++) {
        dates[j].clicked = false;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTimeline();

    drawVerticalLines();

    drawDatapoints();

    window.requestAnimationFrame(draw);
}

function drawTimeline() {
    //draw the line to the first datapoint
    let d = dates[0];
    let positionPercentage = (d.date - firstDate) / (lastDate - firstDate);
    let pSize = d.size;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width * positionPercentage - pSize - lineDistance, canvas.height / 2);
    ctx.lineWidth = strokeWidth.horizontalLine;
    ctx.strokeStyle = colors.timeline;
    ctx.stroke();

    for (let i = 0; i <= dates.length - 1; i++) {
        let d = dates[i];
        let d2;
        let pSize1 = d.size
        let pSize2 = 0;
        let positionPercentage1 = (d.date - firstDate) / (lastDate - firstDate);

        if (i < dates.length - 1) {
            d2 = dates[i + 1];
            d = d2.date;
            positionPercentage2 = (d - firstDate) / (lastDate - firstDate);
            pSize2 = d2.size;
        } else {
            positionPercentage2 = 1;
        }

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
        ctx.arc(canvas.width * positionPercentage1, canvas.height / 2, pSize1 + lineDistance, Math.PI / 2, Math.PI);
        ctx.strokeStyle = colors.timeline;
        ctx.lineWidth = strokeWidth.horizontalLine;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(canvas.width * positionPercentage1, canvas.height / 2, pSize1 + lineDistance, Math.PI * 3 / 2, 0);
        ctx.strokeStyle = colors.timeline;
        ctx.lineWidth = strokeWidth.horizontalLine;
        ctx.stroke();
    }
}

function drawVerticalLines() {
    let year = firstDate.getFullYear();
    let positionPercentage = 0;
    let yOffset = 0;

    //draw vertical lines for each year
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
}

function drawDatapoints() {
    //store the positions of the titles later so we can avoid overlapping
    let titlePositions = [];

    for (let i = 0; i < dates.length; i++) {
        d = dates[i].date;
        let positionPercentage = (d - firstDate) / dateRange;
        let pSize = 0;
        pSize = dates[i].size;
        pColor = dates[i].color;

        ctx.beginPath();
        ctx.arc(canvas.width * positionPercentage, canvas.height / 2, pSize, 0, 2 * Math.PI);
        ctx.fillStyle = pColor
        ctx.fill();

        //draw the title of the datapoint
        ctx.font = fontSize_title + "px Arial";

        //alternate the position of the title so it doesnt overlap with the other titles
        let top = i % 2 == 0;

        if (top) {
            yOffset = -20 - verticalLineSize - fontSize_title / 2 - fontSize_year / 2 - 10;
        } else {
            yOffset = 20 + verticalLineSize + fontSize_title / 2 + fontSize_year / 2 + 10;
        }

        width = dates[i].title.length * fontSize_title;
        height = fontSize_title / 2;
        let x = canvas.width * positionPercentage - width / 4;
        let y = canvas.height / 2 + yOffset;

        //check if the title overlaps with another title
        for (let j = 0; j < titlePositions.length; j++) {
            let title = titlePositions[j];
            if (x + width > title.x && x < title.x + title.width && y + height > title.y && y < title.y + title.height) {
                //if the title overlaps, move it to the left or right
                if (top) {
                    y = title.y - height - 20;
                } else {
                    y = title.y + title.height + 20;
                }
            }
        }

        ctx.fillStyle = colors.title;
        ctx.fillText(dates[i].title, x, y);
        
        //add the position of the title to the array
        titlePositions.push({
            x: x,
            y: y,
            width: width,
            height: height
        });

        //draw a line from the datapoint to the title
        ctx.beginPath();
        ctx.moveTo(canvas.width * positionPercentage, canvas.height / 2 + (pSize + lineDistance) * (top ? -1 : 1));
        ctx.lineTo(canvas.width * positionPercentage, y - ((top ? -height : height) / 2));
        ctx.lineWidth = strokeWidth.timeline;
        ctx.strokeStyle = colors.timeline;
        ctx.stroke();
    }
}
