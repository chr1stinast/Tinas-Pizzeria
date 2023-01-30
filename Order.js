class Order {
    // order class that stores information for each order:
    // - order number/info
    // - topping station
    // - baking station
    // - cutting station (?)
    // - score for respective stations
    // aspects of orders: the order itself and the data that the player produces (product?)
    constructor(type, amount, time, orderNum) {
        this.type = type;
        this.amount = amount;
        this.time = time;
        this.orderNum = orderNum;
    }
    displayInfo() {
        console.log("Order #" + this.orderNum + ": " + this.type + " pizza with " + this.amount + " " + this.type + "s on it.");
    }
    calculateScore() {
        // takes player input; if the amount and type of toppings are equal and the time didnt run out, your score will be higher->otherwise lower(figure out math equation for scoring)
    }
    // take this score and transfer it to entire player progress type thing hich stores data from each order and not just one order
    // difficulties: checking to see if the topping was placed in a certain area and having that affect score too
}