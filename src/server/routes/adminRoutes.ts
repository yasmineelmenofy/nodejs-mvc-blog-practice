import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { Post } from "../models/post";
import { User } from "../models/user";

const router = express.Router();

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET as string;

/**
 * Extend Request to include userId
 */
interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Auth Middleware
 */
const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * GET /admin
 * Login Page
 */
router.get("/admin", async (req: Request, res: Response) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.error(error);
  }
});

/**
 * POST /admin
 * Login
 */
router.post("/admin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
  }
});

/**
 * GET /dashboard
 */
router.get(
  "/dashboard",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const locals = {
        title: "Dashboard",
        description: "Simple Blog created with NodeJs, Express & MongoDb.",
      };

      const data = await Post.find();

      res.render("admin/dashboard", {
        locals,
        data,
        layout: adminLayout,
      });
    } catch (error) {
      console.error(error);
    }
  },
);

/**
 * GET /add-post
 */
router.get(
  "/add-post",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const locals = {
        title: "Add Post",
        description: "Simple Blog created with NodeJs, Express & MongoDb.",
      };

      res.render("admin/add-post", {
        locals,
        layout: adminLayout,
      });
    } catch (error) {
      console.error(error);
    }
  },
);

/**
 * POST /add-post
 */
router.post(
  "/add-post",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });

      await Post.create(newPost);

      res.redirect("/dashboard");
    } catch (error) {
      console.error(error);
    }
  },
);

/**
 * GET /edit-post/:id
 */
router.get(
  "/edit-post/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const locals = {
        title: "Edit Post",
        description: "Edit your blog post",
      };

      const data = await Post.findById(req.params.id);

      res.render("admin/edit-post", {
        locals,
        data,
        layout: adminLayout,
      });
    } catch (error) {
      console.error(error);
    }
  },
);

/**
 * PUT /edit-post/:id
 */
router.put(
  "/edit-post/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now(),
      });

      res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
      console.error(error);
    }
  },
);

/**
 * POST /register
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({
        username,
        password: hashedPassword,
      });

      res.status(201).json({ message: "User Created", user });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(409).json({ message: "User already in use" });
      }

      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.error(error);
  }
});

/**
 * DELETE /delete-post/:id
 */
router.delete(
  "/delete-post/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await Post.deleteOne({ _id: id });
      res.redirect("/dashboard");
    } catch (error) {
      console.error(error);
    }
  },
);

/**
 * GET /logout
 */
router.get("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect("/");
});

export default router;
