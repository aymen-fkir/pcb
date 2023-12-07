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

function fetch_db(querry,callback){
    create_connection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        else{
            connection.query(querry, (insertErr, results) => {
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
            console.log("DONE");
            res.send(ress);
        }
    });
});

app.post("/signin", (req, res) => {
    const form = req.body;
    const querry = "SELECT * FROM users where email = '"+ form.email_signin +"' and password = '"+form.password_signin+"'"; 
    fetch_db(querry, (err, ress) => {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log("DONE");
            res.send(ress);
        }
    });
});

app.listen(port, () => {
    console.log(`listen on port ${port}`);
});
