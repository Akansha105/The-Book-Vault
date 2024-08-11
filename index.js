import express from "express"
import bodyParser from "body-parser"
import axios from "axios"
import pg from "pg"
import env from 'dotenv'

const app=express()
const port=3000
env.config()

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})
db.connect();

app.set('view engine',"ejs")
const link = 'https://covers.openlibrary.org/b/isbn/';

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))

app.get("/",(req,res)=>{
    res.render("index.ejs")
})

app.get("/add",(req,res)=>{
  res.render("add.ejs")
})

app.post("/submit",async(req,res)=>{
  const data=req.body;
  console.log(data);
  try{
  const img = await axios.get(link+data.isbn+"-M.jpg")
  console.log("yes")
  console.log(img.config.url);
  await db.query(
    'INSERT INTO card (isbn,title,date,rate,note,image) VALUES ($1,$2,$3,$4,$5,$6)',
    [data.isbn, data.title, data.date, data.rate, data.note, img.config.url]
  )  
  res.redirect("/view");
  }
  catch(err){
    console.log(err)
  }
})

app.get("/view", async(req,res)=>{
  try{
    const cards = await db.query("SELECT * FROM card");
    res.render("view.ejs",{cards: cards.rows}
    )
  }
  catch(error){
    console.log("error");
  }
})


app.get("/rate", async(req,res)=>{
  try {
    const cards = await db.query('SELECT * FROM card ORDER BY rate ASC')
    res.render('view.ejs', { cards: cards.rows })
  } catch (error) {
    console.log('error')
  }
})

app.get('/date', async (req, res) => {
  try {
    const cards = await db.query('SELECT * FROM card ORDER BY date ASC')
    res.render('view.ejs', { cards: cards.rows })
  } catch (error) {
    console.log('error')
  }
})

app.listen(port,()=>{
    console.log(`Listening to port ${port}`)
})