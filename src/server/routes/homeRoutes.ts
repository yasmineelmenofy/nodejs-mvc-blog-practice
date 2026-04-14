import express from "express";
import { deserialize } from "v8";
const router = express.Router();
import { Post } from "../models/post";
//Routes

router.get('', async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    let perPage = 10;
    let page = parseInt(req.query.page as string) || 1;

    const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    // Count is deprecated - please use countDocuments
    // const count = await Post.count();
    const count = await Post.countDocuments({});
    const nextPage = page + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', { 
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/'
    });

  } catch (error) {
    console.log(error);
  }

});


// function insertPostData (){
//      Post.insertMany([
//       {
//         title: "Building APIs with Node.js",
//         body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js."
//       },
//       {
//         title: "Deployment of Node.js applications",
//         body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments."
//       },
//       {
//         title: "Authentication and Authorization in Node.js",
//         body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//       },
//       {
//         title: "Understand how to work with MongoDB and Mongoose",
//         body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//       },
//       {
//         title: "Build real-time, event-driven applications in Node.js",
//         body: "Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//       },
//       {
//         title: "Discover how to use Express.js",
//         body: "Discover how to use Express.js, a popular Node.js web framework, to build scalable web applications."
//       },
//       {
//         title: "Asynchronous Programming with Node.js",
//         body: "Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations."
//       },
//       {
//         title: "Learn the basics of Node.js and its architecture",
//         body: "Understand how Node.js works internally and why it is widely used in backend development."
//       },
//       {
//         title: "Node.js Limiting Network Traffic",
//         body: "Learn techniques to limit and control network traffic in Node.js applications."
//       },
//       {
//         title: "Learn Morgan - HTTP Request Logger",
//         body: "Learn how to use Morgan middleware to log HTTP requests in your Node.js applications."
//       }
//     ]);

//     console.log("✅ Posts seeded successfully");
//   } 
// insertPostData(); 

router.get("/about", (req, res) => {
  res.render("about");
});

export default router;
