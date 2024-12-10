const express=require("express")
const path=require("path")
const {open}=require("sqlite")
const sqlite3=require("sqlite3")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

const app=express()
app.use(express.json())
let db;

const secret_key="MY_KEY"

const initializeDbAndServer=async ()=>{
    try {
        db=await open ({
            filename:path.join(__dirname,'librarymanagement.db'),
            driver:sqlite3.Database,
        })
        app.listen(3000,()=>{
            console.log('server running on http://localhost:3000/')
        })
    } catch (e) {
        console.log(`Db error is ${e.message}`)
        process.exit(1)
    }
}

initializeDbAndServer()

db.initializeDbAndServer(()=>{
    db.run(`
        create table users (id integer primary key autoincrement,
        email text unique,
        password text,
        is_Admin boolean,
        )
        `);
        db.run(`
           create table books(
           id integer primary key autoincrement,
           title text,
           author text,
           unique_id text unique,
           ) 
            `);

    db.run(`
        
        create table borrow_req(
        id integer primary key autoincrement,
        user_id integer,
        book_id integer,
        start_date text,
        end_date text,
        status text default "pending",
        foreign key(user_id) references users(id),
        foreign key(book_id) references books(id),
        )`)  ;      
});

const authenticationToken=(request,response,next)=>{
    const token=request.headers["authorization"];
    if (!token) return response.status(401).send("Access Denied");
    jwt.verify(token,MY_KEY,(error)=>{
        if (error) {
            return response.status(403);
            response.send("Invalid Token");
        }
    })
};


//user registration
app.post("/register",async(req,res)=>{
    const {email,password}=req.body;
    const hashedPassword=await bcrypt.hash(password,15);
    db.run(`
       insert into users (email,password) values('${email}','${hashedPassword}'),`,
       [email,password||0],
       function (err) {
          if (err) {
            return res.status(400).send(err.message)
           }
       }
       
    
    )
});

app.post("/login",(req,res)=>{
    const {email,password}=req.body;
    db.get(`select * from users where email=email`),
    function (err) {
        if (!user) return res.status(400).send("Invalid user");
    }
    const validPassword= bcrypt.compare(password,user.password);
    if (!validPassword) return res.status(400).send("Invalid password");
});

//add book

app.post("/admin/book",authenticationToken,(req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send("Acess denied");
    const {title,author,unique_id}=req.body;
    db.run(`insert into books (title,author,unique_id) values ('${title}','${author}','${uniqueId}')`,[title,author,unique_id],

        function (err) {
            if (err) {
                return res.status(400).send(err.message)
               }
           }
           
    )
})

//books list

app.get("/books",authenticationToken,(req,res)=>{
    db.all(`select * from books`,[],(err,rows)=>{
        if (err) {
            return res.status(400).send(err.message)
           }
           res.json(rows);   
    })
});


//approve/deny borrow req

app.patch("/admin/borrow_requests/:id",authenticationToken,(req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send("Acces denied");
    const {status}=req.body;
    db.run(`update borrow_requests set status='${status}' where id='${id}`,
        [status,req.params.id],
        function (err) {
            if (err) return res.status(400).send("status updated")
        }
    )
});

//get books req
app.get("/admin/borrow_requests",authenticationToken,(req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send("Acces denied");
    db.all(`select borrow_requsts.id,users.email,books.title,borrow_requests.start_date,borrow_requests.end_date,borrow_requests.status
        from borrow_requests inner join uers on users.id=borrow_requests.user_id
        inner join books on books.id=borrow_requests.book_id`),
        function (error) {if (error) {
            return res.status(400).send(error)
        }
    }
    
})
