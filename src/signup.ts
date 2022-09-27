import { send2fa } from "@snek-functions/email";
import { fn, url } from "./factory";

const signup = fn<
  {
    email: string;
    password: string;
    details: { firstName: string; lastName: string };
  },
  void
>(
  async (args, _, { res }) => {
    const { newAccessToken } = await import("./internal/token/factory.js");
    const scope = {
      res1: ["read", "write"],
      res2: ["read", "write"],
    };

    const { accessToken } = newAccessToken({
      subject: "0",
      data: args,
      scope,
      durration: "30d",
    });

    const emailRes = await send2fa.execute({
      email: args.email,
      subject: "Confirm your Registration at PhotonQ",
      link: `${url.replace("/graphql", "/submit")}?token=${accessToken}`,
      firstName: args.details.firstName,
      lastName: args.details.lastName,
    });

    if (emailRes.errors.length > 0) {
      throw new Error(emailRes.errors[0].message);
    }
  },
  {
    name: "signup",
    decorators: [],
  }
);

export default signup;
