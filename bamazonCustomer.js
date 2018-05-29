var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var table = new Table({head: ['id', 'product_name','price'], style: {head:[], border:[], 'padding-left':1, 'padding-right': 1 }})

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

var itemArray = [];
var itemChoice;
var quantityChange;
var stockCompare;

connection.connect(function(err){
    if(err) throw err;
    afterConnection();

})

function afterConnection() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++){
          itemArray.push(res[i].id);
           table.push([res[i].id, res[i].product_name,res[i].price]);
        }
      console.log(table.toString());

    questions();
    });
  }


  function questions() {
      inquirer.prompt([/* Pass your questions in here */
        {
            type: 'input',
            name: 'choice',
            message: 'What would you like to purchase?',
        },
        {
            type:'input',
            name:'amount',
            message: 'Please indicate amount'
        }  
           
       ]).then(function(res){

        itemChoice = res.choice
        quantityChange = res.amount

        connection.query("SELECT * FROM products WHERE id='" + itemChoice + "'", function(err, res) {
            if (err) throw err;
            stockCompare = res[0].stock_quantity;

            if (res[0].stock_quantity < quantityChange) {
                console.log("Insufficent Quantity! Please Try Again!")
                questions();
            } else {
                updateStock();
                connection.end();
            }
          });

       });
  
  }

function updateStock() {
    var stockRemain = stockCompare - quantityChange;
    connection.query(

        "UPDATE products SET ? WHERE ?",
            [
                {
                    stock_quantity: stockRemain
                    // (original stock var minus user input)
                },
                {
                    id: itemChoice//needs to target specific item
                }
            ],
            function(err, res) {
                if(err){
                    console.log(err);
                }
                console.log("Thank You For Your Purchase!!!")
            }
            
        )

};