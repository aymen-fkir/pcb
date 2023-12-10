const path = require("path");
const express = require('express');
const app = express();
const fs = require("fs").promises;
const bodyParser = require('body-parser');
const mysql = require('mysql');

const Login_file = path.join(__dirname, "public", "index.html");
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



function create_connection(callback) {
    fs.readFile(path.join(__dirname, "connection.json"), 'utf8')
        .then((secret) => {
            const connection = mysql.createConnection(JSON.parse(secret));
            callback(null, connection);
        })
        .catch((error) => {
            console.error('Error reading connection file:', error.message);
            callback(error, null);
        });
}

function close_connection(connection) {
    connection.end((endErr) => {
        if (endErr) {
            console.error('Error closing connection:', endErr);
        } else {
            console.log('Connection closed');
        }
    });
}

function insert_into_db(table_name, data, callback) {
    create_connection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        else{
            connection.query('INSERT INTO ?? SET ?', [table_name, data], (insertErr, results) => {
                close_connection(connection); // Close connection regardless of query result
    
                if (insertErr) {
                    callback(insertErr, null);
                } else {
                    callback(null, results);
                }
            });

        }


    });
}




app.get("/", (req, res) => {
    res.sendFile(Login_file);
});

app.post("/signup", (req, res) => {
    const form = req.body;
    console.log(form);
    insert_into_db('users', form, (err, ress) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(ress);
        }
    });
});


app.post("/signin",async (req, res) => {
    const form = req.body;
    const querry1 = "SELECT * FROM users where email = '"+ form.email_signin +"' and password = '"+form.password_signin+"'"; 
    const querry2 = "SELECT  co,co2,nox,so2 FROM product_data ORDER BY id LIMIT 1";
    
    create_connection((error,connection)=>{
        connection.query(querry1,(error1,results1,fields1)=>{
            if (error1){
                res.status(500).send(error1);
            }
            else if(results1.length !=0){
                connection.query(querry2,(error2,results2,fields2)=>{
                    if (error2){
                        res.status(500).send(error2);
                    }
                    else{
                        const querry3 = "SELECT pm1,pm2_5,pm10 FROM product_data where refference_number = '"+results1[0].refference_number+"'"
                        connection.query(querry3,(error3,results3,fields3)=>{
                            if (error3){
                                res.status(500).send(error3);
                            }
                            else{
                                const data = {static:results2[0],chart:results3}
                                res.render("login_page",{data});
                            }
                        })
                    }
                })
            }
            else{
                res.status(401).sendFile(Login_file);
            }
        })
    })     
    
    
});

app.listen(port, () => {
    console.log(`listen on port ${port}`);
});
