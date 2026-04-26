export const generateToken = (user, statusCode, message, res) => {
  const token = user.generateToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,

      // 🔥 FIX START
      secure: false, // ❌ पहले true था
      sameSite: "lax", // ❌ पहले none था
      // 🔥 FIX END

      path: "/",
    })
    .json({ success: true, user, message, token });
};
