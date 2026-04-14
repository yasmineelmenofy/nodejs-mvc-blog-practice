import express, { Request, Response } from "express";
import { deserialize } from "v8";
const router = express.Router();
import { Post } from "../models/post";
//Routes

router.get("", async (req: Request, res: Response) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    let perPage: number = 10;

    let page: number = 1;
    if (typeof req.query.page === "string") {
      const parsed = parseInt(req.query.page);
      page = parsed > 0 ? parsed : 1;
    }

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    const count: number = await Post.countDocuments({});
    const nextPage: number = page + 1;
    const hasNextPage: boolean = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/",
    });
  } catch (error: unknown) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.get("/post/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    let slug: string = req.params.id;

    const data = await Post.findById({ _id: slug });

    if (!data) {
      return res.status(404).send("Post not found");
    }

    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    res.render("post", {
      locals,
      data,
      currentRoute: `/post/${slug}`,
    });
  } catch (error: unknown) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.post("/search", async (req: Request, res: Response) => {
  try {
    const locals = {
      title: "Seach",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    let searchTerm: string = req.body.searchTerm || "";

    const searchNoSpecialChar: string = searchTerm.replace(
      /[^a-zA-Z0-9 ]/g,
      "",
    );

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    res.render("search", {
      data,
      locals,
      currentRoute: "/",
    });
    console.log("searchTerm:", searchTerm);
    console.log("data:", data);
  } catch (error: unknown) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.get("/about", (req: Request, res: Response) => {
  res.render("about");
});

export default router;
