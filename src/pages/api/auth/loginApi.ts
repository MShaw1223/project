import { signinFunc } from "@/utils/index/signin";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  config: "edge",
};

export default async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      console.log(req.body);
      const username = req.body.username;
      const passwd = req.body.passwd;
      console.log("in login handler");
      console.log("user", username);
      console.log("password", passwd);
      const result = await signinFunc(username, passwd);
      if (result === true) {
        res.status(200);
      }
    } else {
      throw new Error("Wrong method");
    }
  } catch (error) {
    console.error("Failed to sign in, error: ", error);
    res.status(500);
  }
}
