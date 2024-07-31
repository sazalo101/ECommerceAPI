import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Principal "mo:base/Principal";

actor ECommerceAPI {
    type ProductId = Nat;
    type UserId = Text;
    type OrderId = Nat;
    type ApiKey = Text;

    type Product = {
        id: ProductId;
        name: Text;
        price: Nat;
        inventory: Nat;
    };

    type User = {
        id: UserId;
        name: Text;
        balance: Nat;
        apiKey: ApiKey;
    };

    type Order = {
        id: OrderId;
        userId: UserId;
        productId: ProductId;
        quantity: Nat;
        status: Text;
    };

    type Error = {
        #NotFound;
        #InsufficientFunds;
        #InsufficientInventory;
        #Unauthorized;
    };

    private var nextProductId : Nat = 0;
    private var nextOrderId : Nat = 0;
    private let products = HashMap.HashMap<ProductId, Product>(0, Nat.equal, Hash.hash);
    private let users = HashMap.HashMap<UserId, User>(0, Text.equal, Text.hash);
    private let orders = HashMap.HashMap<OrderId, Order>(0, Nat.equal, Hash.hash);
    private let apiKeys = HashMap.HashMap<ApiKey, UserId>(0, Text.equal, Text.hash);
    private let productLinks = HashMap.HashMap<Text, ProductId>(0, Text.equal, Text.hash);

    private var seed : Nat = 123456789;
    private func random() : Nat {
        seed := (seed * 1103515245 + 12345) % (2**32);
        seed
    };

    private func generateApiKey() : ApiKey {
        let timestamp = Int.abs(Time.now());
        let randomPart = random();
        Text.concat(Nat.toText(timestamp), Nat.toText(randomPart))
    };

    private func validateApiKey(key: ApiKey) : Bool {
        Option.isSome(apiKeys.get(key))
    };

    private func generateProductLink(productId: ProductId) : Text {
        let timestamp = Int.abs(Time.now());
        let randomPart = random();
        Text.concat("product-", Text.concat(Nat.toText(productId), Text.concat("-", Text.concat(Nat.toText(timestamp), Nat.toText(randomPart)))))
    };

    public func createUser(id: UserId, name: Text) : async ApiKey {
        let apiKey = generateApiKey();
        let user : User = {
            id = id;
            name = name;
            balance = 0;
            apiKey = apiKey;
        };
        users.put(id, user);
        apiKeys.put(apiKey, id);
        apiKey
    };

    public func addProduct(apiKey: ApiKey, name: Text, price: Nat, inventory: Nat) : async Result.Result<Text, Error> {
        if (not validateApiKey(apiKey)) {
            return #err(#Unauthorized);
        };
        let id = nextProductId;
        nextProductId += 1;
        let product : Product = {
            id = id;
            name = name;
            price = price;
            inventory = inventory;
        };
        products.put(id, product);
        let productLink = generateProductLink(id);
        productLinks.put(productLink, id);
        #ok(productLink)
    };

    public query func getProduct(apiKey: ApiKey, id: ProductId) : async Result.Result<Product, Error> {
        if (not validateApiKey(apiKey)) {
            return #err(#Unauthorized);
        };
        switch (products.get(id)) {
            case (null) { #err(#NotFound) };
            case (?product) { #ok(product) };
        }
    };

    public query func getProductByLink(apiKey: ApiKey, link: Text) : async Result.Result<Product, Error> {
        if (not validateApiKey(apiKey)) {
            return #err(#Unauthorized);
        };
        switch (productLinks.get(link)) {
            case (null) { #err(#NotFound) };
            case (?productId) {
                switch (products.get(productId)) {
                    case (null) { #err(#NotFound) };
                    case (?product) { #ok(product) };
                }
            };
        }
    };

    public func addUserBalance(apiKey: ApiKey, userId: UserId, amount: Nat) : async Result.Result<(), Error> {
        if (not validateApiKey(apiKey)) {
            return #err(#Unauthorized);
        };
        switch (users.get(userId)) {
            case (null) { #err(#NotFound) };
            case (?user) {
                let updatedUser : User = {
                    id = user.id;
                    name = user.name;
                    balance = user.balance + amount;
                    apiKey = user.apiKey;
                };
                users.put(userId, updatedUser);
                #ok(())
            };
        }
    };

    public func createOrder(apiKey: ApiKey, userId: UserId, productId: ProductId, quantity: Nat) : async Result.Result<OrderId, Error> {
        if (not validateApiKey(apiKey)) {
            return #err(#Unauthorized);
        };
        switch (users.get(userId), products.get(productId)) {
            case (?user, ?product) {
                if (product.inventory < quantity) {
                    return #err(#InsufficientInventory);
                };
                if (user.balance < product.price * quantity) {
                    return #err(#InsufficientFunds);
                };
                let orderId = nextOrderId;
                nextOrderId += 1;
                let order : Order = {
                    id = orderId;
                    userId = userId;
                    productId = productId;
                    quantity = quantity;
                    status = "Pending";
                };
                orders.put(orderId, order);

                let updatedProduct : Product = {
                    id = product.id;
                    name = product.name;
                    price = product.price;
                    inventory = product.inventory - quantity;
                };
                products.put(productId, updatedProduct);

                let updatedUser : User = {
                    id = user.id;
                    name = user.name;
                    balance = user.balance - (product.price * quantity);
                    apiKey = user.apiKey;
                };
                users.put(userId, updatedUser);

                #ok(orderId)
            };
            case _ { #err(#NotFound) };
        }
    };

    public query func getOrder(apiKey: ApiKey, id: OrderId) : async Result.Result<Order, Error> {
        if (not validateApiKey(apiKey)) {
            return #err(#Unauthorized);
        };
        switch (orders.get(id)) {
            case (null) { #err(#NotFound) };
            case (?order) { #ok(order) };
        }
    };

    public query func listProducts(apiKey: ApiKey, start: Nat, limit: Nat) : async Result.Result<[Product], Error> {
        if (not validateApiKey(apiKey)) {
            return #err(#Unauthorized);
        };
        let productArray = Iter.toArray(products.vals());
        let size = productArray.size();
        let end = if (start + limit > size) { size } else { start + limit };
        #ok(Array.subArray(productArray, start, end - start))
    };

    public query func getProductLink(apiKey: ApiKey, productId: ProductId) : async Result.Result<Text, Error> {
        if (not validateApiKey(apiKey)) {
            return #err(#Unauthorized);
        };
        switch (products.get(productId)) {
            case (null) { #err(#NotFound) };
            case (?product) {
                for ((link, id) in productLinks.entries()) {
                    if (id == productId) {
                        return #ok(link);
                    };
                };
                #err(#NotFound)
            };
        }
    };

    public query func getUserBalance(apiKey: ApiKey, userId: UserId) : async Result.Result<Nat, Error> {
        if (not validateApiKey(apiKey)) {
            return #err(#Unauthorized);
        };
        switch (users.get(userId)) {
            case (null) { #err(#NotFound) };
            case (?user) { #ok(user.balance) };
        }
    };
}
