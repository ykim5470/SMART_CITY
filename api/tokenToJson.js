const base64 = require("base-64");
// const { resolve } = require("path");

exports.tokenToJson = async function (req, res) {
  return new Promise((resolve, reject) => {
    try {
      const token = req.cookies.token;

      let tokenBase64 = token.split(".")[1];
      let tokenStr = base64.decode(tokenBase64); // 복호화
      let tokenToJson = JSON.parse(tokenStr);
      resolve(tokenToJson);
    } catch (error) {
      console.log(error);
      res.redirect("/");
    }
  });
};
