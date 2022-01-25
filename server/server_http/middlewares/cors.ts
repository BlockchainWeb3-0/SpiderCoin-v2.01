import { Request, Response, NextFunction } from "express";

const cors = (req: Request, res: Response, next: NextFunction) => {
  console.log("Through cors Middleware");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  //res.header("Access-Control-Allow-Credentials", "http://localhost:3000");
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
      // "XMLHttpRequest"
  );
  next();
};

export default (cors)