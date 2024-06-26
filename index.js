const port = 4000;
const express = require("express")
const app = express();
const mongoose = require("mongoose")
const jwt = require ("jsonwebtoken")
const multer = require("multer")
const cors = require("cors")
const path = require("path");

app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://kunalasolanki36:N7lrmjHbeGSxgnNy@e-commerce.dqxseei.mongodb.net/e-commerce")



//end point (api)
app.get("/",(req,res)=>{        
    res.send("Express App is Running")
})

// Image storage 
 const storage = multer.diskStorage(
    {
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
 })

 const upload = multer({storage:storage})

// end point for images 
app.use('/images',express.static('upload/images'))
app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema Creation 
const Product = mongoose.model("Product",{
    id:{
        type: String,
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required: true
    },
    category:{
        type:String,
        required: true
    },
    new_price:{
        type:Number,
        required:true
    },
    old_price:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:Date.now,
    },
    avilabe:{
        type:Boolean,
        default:true
    }
})

//add product 
app.post('/addproduct',async (req,res)=>{
    let products = await Product.find({})
    let id;
    if(products.length>0)
        {
            let last_product_array = products.slice(-1)
            let last_product = last_product_array[0]
            id = last_product.id+1;
        }
        else{
            id=1
        }

    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    })
    console.log(product);
    await product.save()
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name
    })
})


//api for remove product
app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id})
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

// Creating API for GETTING all Product
app.get('/allproduct',async(req,res)=>{
    let products = await Product.find({})
    console.log("All Product Fetched");
    res.send(products)
})
 
//Schema creating for User model
const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//User login endpoint
app.post('/signup',async(req,res)=>{

    let check = await Users.findOne({email:req.body.email});
    if (check){
        return res.status(400).json({success:false,errors:"Existing user found with same email id"})
    }
    let cart = {}
    for (let i = 0; i < 300; i++) {
        cart[i]=0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();
    // tokens

    const data = {
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token}) 
})

// api for userlogin 
app.post('/login',async(req,res)=>{
    let user = await Users.findOne({email:req.body.email}) 
    if(user){
        const passcompare = req.body.password === user.password;
        if(passcompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token})
        }
        else{
            res.json({
                success:false,
                errors:"wrong password"
            })
        }
    }
    else{
        res.json({
            success:false,
            errors:"Wrong email id"
        })
    }
})

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on Port"+port);
    }
    else
    {
        console.log("Error: "+error);
    }
})
