class datapoint {
    date = null;
    title = "";
    description = "";
    position = "top";
    heat = 0;

    constructor(date, title, description, heat) {
        if(date != null)
            this.date = date;
            else console.log("Date is null");
        if(title != null)
            this.title = title;
        if(description != null)
            this.description = description;
        if(heat != null)
            this.heat = heat;
    }
}