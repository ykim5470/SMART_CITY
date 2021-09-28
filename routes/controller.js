exports.userController = () => {
  try {
    return (req, res, next) => {
      console.log(req.session);
      if (req.session.userInfo.type != "adminSystem") {
        res.status(401);
        console.log("Only allowed for admin");
        return res.send("Only Admin can access this content");
      }
      next();
    };
  } catch (err) {
    console.log(err);
  }
};
