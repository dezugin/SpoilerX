const {pool} = require("./dbConfig");

var spoiler = 'Postagem 3'
var name = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Massa tincidunt dui ut ornare lectus. Hac habitasse platea dictumst vestibulum. Sollicitudin nibh sit amet commodo nulla facilisi nullam vehicula ipsum. Faucibus purus in massa tempor nec. Eleifend quam adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus.'
var rating = 2
var puser = 'Anonymous'
var unique = 1

function seedDB(w, x, y, z, q){
    pool.query(
        `INSERT INTO posts (name, spoiler, rating, puser, unq)
        VALUES($1,$2,$3,$4,$5)
        RETURNING id`,
        [w, x, y, z, q],(err,results)=>{
            if (err){
                throw err;
            }
            else{
                return results.rows
            }
        }
    );
}

seedDB(spoiler, name, rating, puser, unique)