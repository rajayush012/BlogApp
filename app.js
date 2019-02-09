var bodyParser = require("body-parser"),
    methodOverride = require('method-override'),
    express    = require('express'),
    mongoose   = require('mongoose'),
    expressSanitizer = require('express-sanitizer');
    app = express();

var port = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost/restful_blog_app",{useNewUrlParser: true});
app.set("view engine","ejs");
app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "New Blog",
//     image: "https://images.pexels.com/photos/236047/pexels-photo-236047.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260",
//     body: "This is a test blog.This is a test blog.This is a test blog.This is a test blog.This is a test blog."
// });

app.get("/",(req,res)=>{
    res.redirect("/blogs");
});

app.get("/blogs",(req,res)=>{
    Blog.find({},(err,blogs)=>{
        if(err)
            console.log(err);
        else{
            res.render("index",{blogs: blogs});
        }
    });
});

app.get("/blogs/new",(req,res) => {
    res.render("new");
});

app.post("/blogs",(req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err,newBlog)=>{
        if(err){
            res.render("new");
        }else{
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id",(req,res) => {
    Blog.findById(req.params.id , (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show",{blog: foundBlog});
        }
    });
});

app.get("/blogs/:id/edit",(req,res) => {
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit",{blog:foundBlog});
        }
    });
    
});

app.put("/blogs/:id", (req,res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    Blog.findByIdAndUpdate(req.params.id, req.body.blog , (err, updatedBlog) => {
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

app.delete("/blogs/:id", (req,res)=>{
    Blog.findByIdAndRemove(req.params.id,(err)=>{
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    })
});

app.listen(port, ()=>{
    console.log("Server is up on port:"+port);
});