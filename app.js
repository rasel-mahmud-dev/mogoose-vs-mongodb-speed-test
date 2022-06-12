const { MongoClient } = require("mongodb");
const http = require("http")
const fs = require("fs");
const mongoose = require('mongoose');

require("dotenv").config({})

const URI = process.env.MONGO_DB_URI


const server = http.createServer(async (req, res)=>{
	
	if(req.url === "/api/mongoose"){
		let start = new Date()
		getProductsWithMongoose((data)=>{
			res.write(JSON.stringify({time: new Date() - start, data: data}))
			res.end()
		})
		
	} else if(req.url === "/api/mongodb"){
		let start = new Date()
		getProducts((data)=>{
			res.write(JSON.stringify({time: new Date() - start, data: data}))
			res.end()
		})
	} else{
		let html = fs.readFileSync("index.html")
		res.setHeader("Content-Type", "text/html")
		res.write(html)
		res.end()
	}

})

mongoose.connect(URI).then(r => {
	console.log("mongoose connected.")
});


server.listen(1001)


async function getProducts(cb){
	let client = new MongoClient(URI);
	try {
		// Connect the client to the server
		await client.connect();
		
		// Establish and verify connection
		let db = client.db("digital-store")
		let COl =  db.collection("products")
		
		let a = await db.command( { serverStatus: 1, latchAnalysis: 1 } )
		console.log(a.connections.current)
		
		let cursor = COl.find()
		let products = []
		await cursor.forEach(prod=>{
			products.push(prod)
		})
		cb(products)
		await client.close();

		
	} catch (ex) {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
}


let Product = mongoose.model('Product', new mongoose.Schema({
	title: String,
	cover_photo: String,
	brand_id: mongoose.Schema.Types.ObjectId,
	category_id: mongoose.Schema.Types.ObjectId,
	discount: Number,
	price: Number,
	qty: Number,
	sold: Number,
	updated_at: Date,
	views: Number
}));

async function getProductsWithMongoose(cb){
	try {
		let p = await Product.find({})
		cb(p)
	}catch (ex){
		console.log(ex)
	}
}


