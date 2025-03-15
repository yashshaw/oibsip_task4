const express = require('express');
const bcrypt = require('bcrypt');
const collection = require("./config");

/////// creating the express, recreating the express app like(app2) is not a good practice
const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended:false }));

////// making express app render the ejs file properly without glitch
app.set("view engine", 'ejs');

//// static
app.use(express.static("public"))


/////routing
app.get("/", (req, res) =>{
    res.render("login");
});
app.get("/login", (req, res) =>{
    res.render("login");
});

app.get("/signup", (req, res) =>{
    res.render("signup");
});

///////////signing up/////////////
app.post("/signup", async(req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password
    }

    const existingUser = await collection.findOne({name: data.name});

    if(existingUser){
        return res.render("signup", { error: "Username already taken. Please choose a different one." });
    }
    else{
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashPassword; // replacing with hashed passWD
        const userData = await collection.create(data);
        console.log(userData);
        return res.render("login", { message:"The user has been registered successfully, proceed with login. "});
    }    
});

////////////////////////Login /////////////////////////////
app.post("/login", async (req, res) => {
    try{
        const existingUser = await collection.findOne({name: req.body.username });
        if(!existingUser){
           return res.render("login", { error: "Could not find username if your an unregistered user then sign up first."  });
        }
        const isPasswordCorrect = await bcrypt.compare(req.body.password, existingUser.password);

        if(isPasswordCorrect){
           return res.render("home", { username:`${req.body.username}`});
        }else{
           return res.send("Wrong Password");
        }
    }catch(error){
        console.error("Login Error:", error);
        res.send("Wrong details");
    }
});

//////setting server active 
const port = 3000;
app.listen(port, ()=> {
    console.log(`server is running at port ${port}`)
});