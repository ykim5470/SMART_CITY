const base64 = require("base-64");
const axios = require("axios");

exports.requestRefreshToken = async function (req, res, refresh_token) {
  try {
    const credentialsGrant = CLIENT_ID + ":" + CLIENT_SECRET;
    var encode = base64.encode(credentialsGrant);
    console.log("encode : "+encode)
    // console.log(refresh_token)
    axios({
      method: "post",
      headers: {
        Authorization: "Basic " + encode,
      },
      url: OAUTHURL + "/oauth2.0/token",
      data: {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      },
    }).then((result) => {
      console.log("---------재발급시작!!!-----------");

      const access_token = result.data.access_token;
      const expires_in = result.data.expires_in;
      const refresh_expires_in = result.data.expires_in;

      const tokenArr = [access_token, expires_in, refresh_expires_in];

      res.cookie("token", access_token, {
        httpOnly: true,
        maxAge: 1728000000, //access_token 유효기간 20일(1000ms==1s), 60 * 60 * 24 * 20d * 1000ms
      });
      return tokenArr;
    });
  } catch (err) {
    console.log(err);
  }
};
