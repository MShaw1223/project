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
    const { password, user } = req.body;
    const credentials = {
      passwd: password,
      username: user,
    }
    const success = await signinFunc(credentials);
    if (success === true) {
      res.status(200).json({ success: true });
    } else {
      throw new Error("signinFunc returned false");
    }
  } catch (error) {
    res.status(500).json({ error });
  }
}
