import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { Post } from "../models/post";
import { User } from "../models/user";
import { ApiError } from "../utils/apiErrors";
import { AuthRequest } from "../middleware/auth.middleware";

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET as string;

export const getAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    res.render("admin/index", { locals, layout: adminLayout });
  } catch (err) {
    next(err);
  }
};

export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return next(new ApiError(401, "Invalid credentials"));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return next(new ApiError(401, "Invalid credentials"));

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
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
  } catch (err) {
    next(err);
  }
};

export const getAddPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    res.render("admin/add-post", {
      locals,
      layout: adminLayout,
    });
  } catch (err) {
    next(err);
  }
};

export const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await Post.create({
      title: req.body.title,
      body: req.body.body,
    });

    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

export const getEditPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "Edit your blog post",
    };

    const data = await Post.findById(req.params.id);
    if (!data) return next(new ApiError(404, "Post not found"));

    res.render("admin/edit-post", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (err) {
    next(err);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return next(new ApiError(403, "Forbidden"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User Created", user });
  } catch (err: any) {
    if (err.code === 11000) {
      return next(new ApiError(409, "User already in use"));
    }
    next(err);
  }
};

export const deletePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) return next(new ApiError(400, "Invalid ID"));

    await Post.deleteOne({ _id: id });
    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect("/");
};
