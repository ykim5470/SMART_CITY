const axios = require("axios");

exports.requestPublicKey = async function () {
  try {
    return axios
      ({
        method: 'get',
        url: `${OAUTHURL}/security/publickey`,
      })
      .then((result) => {
        return result.data.publickey;
      });
  } catch (err) {
    console.log(err);
  }
};
