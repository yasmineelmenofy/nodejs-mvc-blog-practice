import express from "express";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import cookieParser from "cookie-parser";
import expressLayout from "express-ejs-layouts";
import homeRoutes from "./server/routes/homeRoutes";
import { connectDB } from "./server/config/db";
import adminRoutes from "./server/routes/adminRoutes";
import methodOverride from "method-override";


const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(methodOverride("_method"));

// Templating Engine
app.use(expressLayout);
app.set("layout", "layouts/main");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/", homeRoutes);
app.use("/", adminRoutes);


app.get("/", (req, res) => {
  res.send("Hello from homepage");
});

app.listen(port, () => {
  console.log(`I am listening on port ${port}`);
});
