/*import Array "mo:base/Array";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

actor Shop {
    // Types
    type ProductId = Nat;
    type Product = {
        id: ProductId;
        name: Text;
        description: Text;
        price: Nat;
        inventory: Nat;
    };

    type OrderId = Nat;
    type Order = {
        id: OrderId;
        buyer: Principal;
        products: [(ProductId, Nat)];
        total: Nat;
        status: OrderStatus;
    };

    type OrderStatus = {
        #pending;
        #paid;
        #shipped;
        #delivered;
        #cancelled;
    };

    // State
    private stable var nextProductId: ProductId = 0;
    private stable var nextOrderId: OrderId = 0;
    private var products = HashMap.HashMap<ProductId, Product>(0, Nat.equal, Hash.hash);
    private var orders = HashMap.HashMap<OrderId, Order>(0, Nat.equal, Hash.hash);

    // Product Management
    public func addProduct(name: Text, description: Text, price: Nat, inventory: Nat) : async ProductId {
        let id = nextProductId;
        nextProductId += 1;
        let product: Product = {
            id;
            name;
            description;
            price;
            inventory;
        };
        products.put(id, product);
        id
    };

    public query func getProduct(id: ProductId) : async ?Product {
        products.get(id)
    };

    public func updateProduct(id: ProductId, name: Text, description: Text, price: Nat, inventory: Nat) : async Bool {
        switch (products.get(id)) {
            case null { false };
            case (?existingProduct) {
                let updatedProduct: Product = {
                    id;
                    name;
                    description;
                    price;
                    inventory;
                };
                products.put(id, updatedProduct);
                true
            };
        }
    };

    // Order Management
    public shared(msg) func createOrder(productIds: [ProductId]) : async ?OrderId {
        var total = 0;
        var orderProducts : [(ProductId, Nat)] = [];

        for (productId in productIds.vals()) {
            switch (products.get(productId)) {
                case null { return null; };
                case (?product) {
                    if (product.inventory == 0) { return null; };
                    total += product.price;
                    orderProducts := Array.append(orderProducts, [(productId, 1)]);
                };
            };
        };

        let orderId = nextOrderId;
        nextOrderId += 1;
        let order: Order = {
            id = orderId;
            buyer = msg.caller;
            products = orderProducts;
            total;
            status = #pending;
        };
        orders.put(orderId, order);
        ?orderId
    };

    public query func getOrder(id: OrderId) : async ?Order {
        orders.get(id)
    };

    public func updateOrderStatus(id: OrderId, newStatus: OrderStatus) : async Bool {
        switch (orders.get(id)) {
            case null { false };
            case (?existingOrder) {
                let updatedOrder: Order = {
                    id = existingOrder.id;
                    buyer = existingOrder.buyer;
                    products = existingOrder.products;
                    total = existingOrder.total;
                    status = newStatus;
                };
                orders.put(id, updatedOrder);
                true
            };
        }
    };

    // Query functions
    public query func getAllProducts() : async [Product] {
        Iter.toArray(products.vals())
    };

    public query func getUserOrders(user: Principal) : async [Order] {
        Iter.toArray(
            Iter.filter(orders.vals(), func (order: Order) : Bool {
                order.buyer == user
            })
        )
    };
}*/