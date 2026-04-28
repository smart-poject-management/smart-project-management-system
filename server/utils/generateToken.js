const COOKIE_EXPIRE_DAYS = Number.parseInt(process.env.COOKIE_EXPIRE, 10) || 7;

export const getTokenCookieOptions = () => {
  const maxAge = COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000;

  return {
    expires: new Date(Date.now() + maxAge),
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };
};

export const generateToken = (user, statusCode, message, res) => {
  const token = user.generateToken();

  res
    .status(statusCode)
    .cookie("token", token, getTokenCookieOptions())
    .json({ success: true, user, message, token });
};
