// import { usernameAndPassword } from "@/utils/schema";
import { signinFunc } from "@/utils/signin";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  config: "edge",
};

export default async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("body: ", req.body);
    const { passwd, username } = req.body;
    await signinFunc({ passwd, username });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
}
