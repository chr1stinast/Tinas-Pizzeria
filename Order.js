class Order {
    // order class that stores information for each order:
    // - order number/info
    // - topping station
    // - baking station
    // - cutting station
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
}