const autoprefixer = require("autoprefixer");
// const postcssImport = require("postcss-import");
// const purgecss = require("@fullhuman/postcss-purgecss");

const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);
let plugins = [];

if (IS_PROD) {
  // plugins.push(postcssImport);
  // plugins.push(
  //   purgecss({
  //     content: ["./src/**/*.vue"],
  //     extractors: [
  //       {
  //         extractor: class Extractor {
  //           static extract(content) {
  //             const validSection = content.replace(
  //               /<style([\s\S]*?)<\/style>+/gim,
  //               ""
  //             );
  //             return validSection.match(/[A-Za-z0-9-_:/]+/g) || [];
  //           }
  //         },
  //         extensions: ["vue"]
  //       }
  //     ]
  //   })
  // );
}

module.exports = {
  plugins: [...plugins, autoprefixer]
};
