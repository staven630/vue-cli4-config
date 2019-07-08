const autoprefixer = require("autoprefixer");
// const postcssImport = require("postcss-import");
// const purgecss = require("@fullhuman/postcss-purgecss");
const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);
let plugins = [];
if (IS_PROD) {
  // 去除多余css
  // plugins.push(postcssImport);
  // plugins.push(
  //   purgecss({
  //     content: [
  //       "./layouts/**/*.vue",
  //       "./components/**/*.vue",
  //       "./pages/**/*.vue"
  //     ],
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
  //         extensions: ["html", "vue"]
  //       }
  //     ],
  //     whitelist: ["html", "body"],
  //     whitelistPatterns: [/el-.*/],
  //     whitelistPatternsChildren: [/^token/, /^pre/, /^code/]
  //   })
  // );
}

module.exports = {
  plugins: [...plugins, autoprefixer]
};
