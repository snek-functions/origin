import { authenticate } from "@snek-functions/authentication";
import { send } from "@snek-functions/email";

import { fn } from "./factory";

// Keeps track of the failed login attempts for each user <userId, attempts>
const failedLoginAttempts = new Map<string, number>();

const handleLoginAttempts = async (alias: string, loginSuccess: boolean) => {
  const attempts = failedLoginAttempts.get(alias) || 0;

  console.log(`User ${alias} has ${attempts} failed login attempts`);

  if (loginSuccess) {
    failedLoginAttempts.delete(alias);

    return
  }

  failedLoginAttempts.set(alias, attempts + 1);

  if (attempts > 10) {
    const { userGet, usersUpdate } = await import("@snek-functions/iam");

    const user = await userGet({ alias });

    await usersUpdate({
      userId: user.userId,
      isActive: false,
    });

    const { newToken } = await import("./internal/token/factory.js");

    const { token } = newToken(
      {
        subject: user.userId,
        payload: {
          scope: null,
        },

        durration: "100y",
      },
      "user_reactivate"
    );

    await send({
      email: user.email,
      subject: "Your account has been locked",
      msg: `Your account has been locked due to too many failed login attempts. Please click the link below to unlock your account.

${process.env.SNEK_FUNCTIONS_URL}/submit?token=${token}`,
    });

    throw new Error("Blocked. Too many login attempts");
  }


};

const login = fn<{ username: string; password: string }, void>(
  async (args, _, { req, res }) => {
    console.log(`User ${args.username} is attempting to login`);
    const { newUserDataToken } = await import("./helper/newUserDataToken.js");
    const { setAuthentication } = await import("./helper/auth.js");
    const { setUserCookie } = await import("./helper/user.js");

    const { data, errors } = await authenticate.execute(args);

    const isSuccessful = data && errors.length === 0

    await handleLoginAttempts(args.username, isSuccessful);

    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    if (data) {
      setAuthentication(data.user_id, res);

      const userDataToken = await newUserDataToken(data.user_id);

      setUserCookie(req, res, userDataToken);
    }
  },
  {
    name: "login",
    decorators: [],
  }
);

export default login;
