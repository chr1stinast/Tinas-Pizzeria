class Order {
    // order class that stores information for each order
    constructor(topping, num, orderNumber) {
        this.topping = topping;
        this.num = num;
        this.orderNumber = orderNumber;
    }
    displayInfo() {
        console.log("Order #" + this.orderNumber + ": " + this.topping + " pizza with " + this.num + " on it.");
    }
}