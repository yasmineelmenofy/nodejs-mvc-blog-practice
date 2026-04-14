import express from "express";
import { deserialize } from "v8";
const router = express.Router();

//Routes

router.get("/", (req, res) => {
    const locals = {
        title: "NodeJs Blog",
        description:"simple blog "
    }
  res.render("index",{locals});
});

router.get("/about", (req, res) => {
  res.render("about");
});

export default router;
