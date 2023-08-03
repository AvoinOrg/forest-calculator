const withImages = require("next-images");
const withFonts = require("next-fonts");

module.exports = withImages(
  withFonts({
    webpack(config, options) {
      return config;
    },
    env: {
      NEXT_PUBLIC_API_URL:
        process.env.NODE_ENV === "dev"
        ? "http://localhost:3000/api"
        : process.env.NEXT_PUBLIC_API_URL + "/api"
    }
  })
);
