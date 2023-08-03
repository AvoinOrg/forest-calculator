const withImages = require("next-images");
const withFonts = require("next-fonts");

module.exports = withImages(
  withFonts({
    webpack(config, options) {
      return config;
    },
    env: {
      API_URL: process.env.API_URL + "/api",
    },
  })
);
