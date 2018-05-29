var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var table = new Table({ head: ['id', 'product_name', 'price', 'stock_quantity'], style: { head: [], border: [], 'padding-left': 1, 'padding-right': 1 } })

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon_DB"
});



connection.connect(function (err) {
    if (err) throw err;
})

firstQuestion();

function firstQuestion() {
    inquirer.prompt([/* Pass your questions in here */
        {
            type: 'list',
            name: 'option',
            message: 'What would you like to do?',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
        }

    ]).then(function (res) {

        switch (res.option) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory":
                viewLow();
                break;

            case "Add to Inventory":
                addInventory();
                break;

            case "Add New Product":
                addProduct();
                break;
        }
    });

}

function viewProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].id, res[i].product_name, res[i].price, res[i].stock_quantity]);
        }
        console.log(table.toString());

    });

    connection.end();
};

function viewLow() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity <= 5) {
                table.push([res[i].id, res[i].product_name, res[i].price, res[i].stock_quantity]);
            }        
        }
        console.log(table.toString());
    });
    connection.end();
}

function addInventory() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'select',
            message: 'which item would you like to restock?'
        },
        {
            type: 'input',
            name: 'amount',
            message: 'how much do you need?'
        }

    ]).then(function (res) {

        console.log(res.amount);
        var stockAmount = parseInt(res.amount);
        var stockSelect = res.select


        connection.query("SELECT * FROM products WHERE id='" + stockSelect + "'", function (err, res) {
            if (err) throw err;
            var stockCompare = parseInt(res[0].stock_quantity);
            var totalAmount = stockCompare + stockAmount;

            console.log(totalAmount);


            connection.query(

                "UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: totalAmount
                        // (original stock var minus user input)
                    },
                    {
                        id: stockSelect//needs to target specific item
                    }
                ],
                function (err, res) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Stock has been updated!")
                }

            )
            connection.end();
        });
    });
}

function addProduct() {

    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Item name?'
        },
        {
            type: 'input',
            name: 'department',
            message: 'Department?'
        },
        {
            type: 'input',
            name: 'price',
            message: 'Price?'
        },
        {
            type: 'input',
            name: 'stock',
            message: 'Amount?'
        }

    ]).then(function (res) {

        connection.query(
            "INSERT INTO products SET ?",
            {
            product_name: res.name,
            department_name: res.department,
            price: parseFloat(res.price),
            stock_quantity: parseInt(res.stock)
            },
            function(err, res) {
            console.log(res.affectedRows + " product inserted!\n");   
            }
        );
        connection.end();
    });
}