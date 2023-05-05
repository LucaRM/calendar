var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const {MongoClient, ServerApiVersion} = require("mongodb");
const uri =
    "mongodb+srv://lmalato:6WaeVE8YNl8tm21c@cluster0.w1umnql.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";

var index = require("./routes/index");
const api = require("./routes/api/index");

var app = express();

const client = new MongoClient(uri);

async function run() {
    console.log("Connecting to MongoDB...");
    try {
        // Connect the client to the server	(optional starting in v4.7)
        console.log("Inside try");
        await client.connect();
        console.log("Connected successfully to server");
        // Send a ping to confirm a successful connection
        await client.db("appointment").command({ping: 1});
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } catch (err) {
        console.log(err);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

//Adds connection to database using mongoose
//for <dbuser>:replace with your username, <dbpassword>: replace with your password.

//<DATABASE_URL>: replace with database url, example:ds234562.mlab.com:17283
// mongoose.connect(
//     "mongodb://lmalato:6WaeVE8YNl8tm21c@cluster0.w1umnql.mongodb.net/?retryWrites=true&w=majority",
//     {
//         useMongoClient: true,
//     }
// );

//This enabled CORS, Cross-origin resource sharing (CORS) is a mechanism that allows restricted resources (e.g. fonts)
//on a web page to be requested from another domain outside the domain from which the first resource was served

app.all("/*", function (req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    // Set custom headers for CORS
    res.header(
        "Access-Control-Allow-Headers",
        "Content-type,Accept,X-Access-Token,X-Key"
    );
    if (req.method == "OPTIONS") {
        res.status(200).end();
    } else {
        next();
    }
});
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);
app.use("/api", api);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
