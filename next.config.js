const withImages = require("next-images");
const withFonts = require("next-fonts");

module.exports = withImages(
  withFonts({
    webpack(config, options) {
      return config;
    },
    env: {
      API_URL: process.env.NODE_ENV === "production" ? "http://localhost/api" : "http://localhost:3000/api"
    }
  })
);
