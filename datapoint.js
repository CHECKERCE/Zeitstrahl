class datapoint {
    date = null;
    title = "";
    description = "";
    position = "top";

    constructor(date, title, description, position) {
        this.date = date;
        if(title != null)
            this.title = title;
        if(description != null)
            this.description = description;
        if (position != null) {
            if (position == "bottom" || position == "top") {
                this.position = position;
            } else {
                console.log("Error: position must be 'top' or 'bottom', not '" + position + "'");
            }
        }
    }
}