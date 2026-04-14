import express from "express";
import dotenv from "dotenv";
import path from "path";
import expressLayout from "express-ejs-layouts";
import homeRoutes from "./server/routes/homeRoutes";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static("public"));
// Templating Engine
app.use(expressLayout);
app.set("layout", "layouts/main");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/", homeRoutes);
app.get("/", (req, res) => {
  res.send("Hello from homepage");
});

app.listen(port, () => {
  console.log(`I am listening on port ${port}`);
});
