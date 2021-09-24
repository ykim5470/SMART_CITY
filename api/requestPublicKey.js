const axios = require("axios");

exports.requestPublicKey = async function () {
  try {
    return axios
      .get({
        uri: `${OAUTHURL}/security/publickey`,
      })
      .then((result) => {
        return result.publickey;
      });
  } catch (err) {
    console.log(err);
  }
};
