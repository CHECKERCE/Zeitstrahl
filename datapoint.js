hoverColor = "rgb(0, 255, 255)";

class datapoint {
    date = null;
    title = "";
    description = "";
    heat = 0;

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
            this.sizeGoal = 20;
        } else {
            this.sizeGoal = 10;
        }
    }

    update() {
        this.size += (this.sizeGoal - this.size) * 0.1;
    }
}