hoverColor = "rgb(0, 255, 255)";
coldColor = [0, 0, 255];
hotColor = [255, 0, 0];
datapointSize = 10;
datapointSizeHover = 20;

class datapoint {
    date = null;
    title = "";
    description = "";
    heat = 0;
    heatNormalized = 0;
    constructor(date, title, description, heat) {
        if (date != null)
            this.date = date;
        else console.log("Date is null");
        if (title != null)
            this.title = title;
        if (description != null)
            this.description = description;
        if (heat != null)
            this.heat = heat;
    }

    size = 10;
    baseSize = 10;
    sizeGoal = 10;
    clicked = false;

    _color = { r: 255, g: 0, b: 0 };
    get color() {
        if (this.hovering) {
            return hoverColor;
        } else {
            return "rgb(" + this._color.r + "," + this._color.g + "," + this._color.b + ")";
        }
    }

    set color(value) {
        this._color = value;
    }

    _hovering = false;
    get hovering() {
        return this._hovering || this.clicked;
    }

    set hovering(value) {
        this._hovering = value;
        if (value) {
            this.sizeGoal = datapointSizeHover * (this.heatNormalized + 0.4);
        } else {
            this.sizeGoal = datapointSize * (this.heatNormalized + 0.4);
        }
    }

    update() {
        this.size += (this.sizeGoal - this.size) * 0.1;
        this.color = {
            r: coldColor[0] + (hotColor[0] - coldColor[0]) * this.heatNormalized,
            g: coldColor[1] + (hotColor[1] - coldColor[1]) * this.heatNormalized,
            b: coldColor[2] + (hotColor[2] - coldColor[2]) * this.heatNormalized
        };
    }
}