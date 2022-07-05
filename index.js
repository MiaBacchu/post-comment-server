const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId=require('mongodb').ObjectId;
const fileUpload = require('express-fileupload')
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m0n59.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const database = client.db("authentication");
    const userCollection = database.collection("users");
    const postCollection = database.collection("posts");

    //post registered users
    app.post('/registration', async (req,res)=>{
        const result = await userCollection.insertOne(req.body);
       res.send(result)
    })

    //get registered users
    app.get('/users', async (req,res)=>{
        const cursor = userCollection.find({});
        const result = await cursor.toArray();
        res.send(result)
    });

    //get loggedIn user
    app.get('/user/:email', async (req,res)=>{
        const email = req.params.email;
        const user = await userCollection.findOne({email:email});
        res.send(user)
    });

    //post users status

    app.post('/post-status', async (req,res)=>{
        const name =req.body.name;
        const title =req.body.title;
        const description =req.body.description;
        const encodedPic = req.files.image.data.toLocaleString('base64');
        const image = Buffer.from(encodedPic,'base64');
        const result = await postCollection.insertOne({name, title, description, image, comments:[]});
        res.json(result);
    });

    //get users status

    app.get('/status', async (req,res)=>{
        const cursor = postCollection.find({});
        const result = await cursor.toArray();
        res.send(result)
    });

    //update api for comments
    app.put('/comments/:id', async (req,res)=>{
        const id= req.params.id;
        const query= {_id:ObjectId(id)};
        const newComments = req.body;
        const result= postCollection.updateOne(query,{$push:{comments:newComments}});
        res.json(result)
      })

  }
  finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('running on my crud server')
})
app.listen(port, ()=>{
    console.log('listening on',port)
});