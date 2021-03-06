const express = require('express');
const app = express();
const {pool} = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require('express-session');
const flash = require("express-flash")
const PORT = process.env.PORT || 5000;
const passport = require("passport");

const initializePassport = require("./passportConfig");

initializePassport(passport);


app.set('view engine', 'ejs');

app.use(express.urlencoded({extended : false}));

app.use(session({
        secret: 'secret',

        resave: false,

        saveUninitialized: false,
    }));
app.use(flash());
app.use('/public', express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res)=> {
    res.render("index");
});

app.get('/forum/posts', (req, res)=> {
    pool.query(
        `SELECT * FROM posts`,(err, results)=>{
            if(err){
                errors.push({message:"Senha ou email incorretos"});
            } else{
                var len = results.rows.length
                var postRawData = results.rows
                console.log(len)
                res.render('posts', {posts: postRawData, len: len})
            }
        })
})

app.get('/forum/posts/:id', function(req, res){

    postId = req.params.id

    pool.query(`SELECT * FROM ratings WHERE uid = $1`, [postId], async (err, results)=>{
        if(err){
            throw err;
        } else{
            console.log(results.rows)
        }
    })

    pool.query(
        `SELECT * FROM posts WHERE id = $1`, [postId], (err, results)=>{
            if(err){
                errors.push({message:"Senha ou email incorretos"});
            } else{
                var len = results.rows.length
                var postRawData = results.rows
                console.log(len)
                res.render('post', {posts: postRawData, len: len})
            }
        })
})

app.get('/forum/new',checkNotAuthenticated, (req, res) => {
    res.render('newpost.ejs', {user: req.user.name})
})

app.get("/users/login",checkAuthenticated,(req,res)=>{
    res.render("login");
});

app.get("/users/alter",checkNotAuthenticated,(req,res)=>{
    res.render("alter", {user: req.user.name});
});

app.get("/users/register",checkAuthenticated,(req,res)=>{
    res.render("register");
});

app.get("/users/dashboard",checkNotAuthenticated,(req,res)=>{
    res.render("dashboard", {user: req.user.name});
});

app.get("/users/delete",checkNotAuthenticated,(req,res)=>{
    res.render("delete", {user: req.user.name});
});

app.get('/users/logout',(req,res)=>{
    req.logOut();
    req.flash('success_msg', "Você saiu");
    res.redirect('/users/login')
})

app.get('/forum/posts/:id/rate', checkNotAuthenticated, (req, res) => {
    postId = req.params.id
    res.render('rate', {user: req.user.name, pid: postId})
})

app.post('/forum/posts/:id/rate', (req, res) => {
    var newRating = Number(req.body.rating)
    postId = req.params.id

    pool.query(`INSERT INTO ratings (uid, ratingnum)
    VALUES($1, $2)
    `, [postId, newRating], (err, results) => {
        if(err){
            throw err;
        } else{
            res.redirect('/forum/posts/' + postId)
        }
    
    pool.query(`SELECT * FROM ratings WHERE uid = $1`, [postId], (err, results)=>{
        if(err){
            throw err;
        } else{
            //console.log(results.rows[0])

            var temp = {};
                var obj = null;
                for(var i=0; i < results.rows.length; i++) {
                obj=results.rows[i];

                if(!temp[obj.key]) {
                    temp[obj.key] = obj;
                } else {
                    temp[obj.key].ratingnum += obj.ratingnum;
                }
                }
                var result = [];
                for (var prop in temp)
                    result.push(temp[prop]);

            var finalRating = result[0].ratingnum/results.rows.length

            console.log(finalRating)

            pool.query(
                `SELECT * FROM posts WHERE id = $1`, [postId], async (err, results)=>{
                    if(err){
                        console.log(err);
                    } else{
                        pool.query('UPDATE posts SET rating=$1 WHERE id=$2', [finalRating, postId], (err) =>{
                            if(err){
                                console.log(err)
                            }
                        })
                    }
                })

        }
    })
    })

    // pool.query(`SELECT * FROM ratings WHERE uid = $1`, [postId], async (err, results)=>{
    //     if(err){
    //         throw err;
    //     } else{
    //         console.log(results.rows.uid)
    //     }
    // })
})

app.post('/forum/new', (req,res) => {
    let {puser, name, spoiler} = req.body;
    console.log(puser, name, spoiler)

    let baseRating = 5

    let baseUnique = 2

    pool.query(
        `INSERT INTO posts (puser, name, spoiler, rating, unq)
        VALUES($1,$2,$3,$4,$5)
        RETURNING id`, [puser, name, spoiler, baseRating, baseUnique],(err,results)=>{
            if (err){
                throw err;
            } else{
                console.log(results.row);
                res.redirect('/forum/posts')
            }
        }
    );
})

app.post('/users/delete',async (req,res)=>{
    let {email, password} = req.body;
    console.log({
        email,
        password
    });

    let errors = [];

        let hashPassword = await bcrypt.hash(password, 10);
        console.log(hashPassword);
        pool.query(
            `SELECT * FROM users
            WHERE email = $1 AND password = $2`,[email, hashPassword],(err, results)=>{
                if(err){
                    errors.push({message:"Senha ou email incorretos"});
                }else{
                    console.log(results.rows);
                    if(!email || !password){
                        errors.push({message: "Por favor entre todos os campos"});
                    }
                    if(results.rows.length>0){
                        res.render("delete",{errors});
                    }
                    else{
                        pool.query(
                            `DELETE FROM users
                            WHERE email = $1` ,
                            [email],(err,results)=>{
                                if (err){
                                    throw err;
                                    console.log(err);
                                }
                                req.logOut();
                                req.flash('success_msg', "Você deletou sua conta com sucesso");
                                res.redirect('/users/login')
                        }
                        );
                    }
                }
            }
        );
})
app.post('/users/alter',async (req,res)=>{
    let {email, password, password2, password3} = req.body;
    console.log({
        email,
        password,
        password2,
        password3
    });

    let errors = [];

        let hashPassword = await bcrypt.hash(password, 10);
        let NewHashPassword = await bcrypt.hash(password2, 10); 
        console.log(hashPassword);
        pool.query(
            `SELECT * FROM users
            WHERE email = $1 AND password = $2`,[email, hashPassword],(err, results)=>{
                if(err){
                    errors.push({message:"Senha ou email incorretos"});
                }else{
                    console.log(results.rows);
                    if(!email || !password|| !password2 ||password3){
                        errors.push({message: "Por favor preencha todos os campos"});
                    }
                    if(results.rows.length>0){
                        res.render("delete",{errors});
                    }
                    else{
                        pool.query(
                            `UPDATE users
                            SET password = $1
                            WHERE email = $2` ,
                            [NewHashPassword,email],(err,results)=>{
                                if (err){
                                    throw err;
                                }
                                console.log(results.row);
                                req.flash('success_msg', "Você mudou sua senha com sucesso");
                                res.redirect('/users/dashboard')
                        }
                        );
                    }
                }
            }
        );
})

app.post('/users/register', async (req,res)=>{
    let {name, email, password, password2} = req.body;
    console.log({
        name,
        email,
        password,
        password2
    });
    let errors = [];
    if(!name || !email || !password || !password2){
        errors.push({message: "Por favor entre todos os campos"});
    }
    if(password.length<8){
        errors.push({message: "A senha deve ser de ao menos 8 caracteres"});
    }
    if(password!=password2){
        errors.push({message: "As senhas devem ser iguais"});
    }
    if(errors.length>0){
        res.render('register', {errors});
    }else{
        let hashPassword = await bcrypt.hash(password, 10);
        console.log(hashPassword);
        pool.query(
            `SELECT * FROM users
            WHERE email = $1`,[email],(err, results)=>{
                if(err){
                    throw err;
                }else{
                    console.log(results.rows);
                    if(results.rows.length>0){
                        errors.push({message:"Email já registrado"});
                        res.render("register",{errors});
                    }else{
                        pool.query(
                            `INSERT INTO users (name, email, password)
                            VALUES($1,$2,$3)
                            RETURNING id,password` ,
                            [name,email,hashPassword],(err,results)=>{
                                if (err){
                                    throw err;
                                }
                                console.log(results.row);
                                req.flash("success_msg","Você está registrado com sucesso. Por favor faça login");
                                res.redirect("/users/login");
                            }
                        );
                    }
                }
            }
        );
    }
});

app.post('/users/login',passport.authenticate('local',{
    successRedirect:"/users/dashboard",
    failureRedirect:"/users/login",
    failureFlash: true
}));

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect("/users/dashboard");
    }
    next();
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/users/login");
}
app.listen(PORT, ()=>{
    console.log(`Servidor rodando na porta ${PORT}`);
});
