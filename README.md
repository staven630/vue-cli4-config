# vue-cli3 全面配置(持续更新)

### 其他系列

★ [Nuxt.js 全面配置](https://github.com/staven630/nuxt-config)

<span id="top">目录</span>

- [√ 配置多环境变量](#env)
- [√ 配置基础 vue.config.js](#base)
- [√ 配置 proxy 跨域](#proxy)
- [√ 修复 HMR(热更新)失效](#hmr)
- [√ 修复 Lazy loading routes Error： Cyclic dependency](#lazyloading)
- [√ 添加别名](#alias)
- [√ 压缩图片](#compressimage)
- [√ 去除多余无效的 css](#removecss)
- [√ 添加打包分析](#analyze)
- [√ 配置 externals](#externals)
- [√ 去掉 console.log](#log)
- [√ 开启 gzip 压缩](#gzip)
- [√ 为 sass 提供全局样式，以及全局变量](#globalscss)
- [√ 为 stylus 提供全局变量](#globalstylus)
- [√ 添加 IE 兼容](#ie)
- [√ 文件上传 ali oss](#alioss)
- [√ 完整依赖](#allconfig)

### <span id="env">☞ 配置多环境变量</span>

&emsp;&emsp;通过在 package.json 里的 scripts 配置项中添加--mode xxx 来选择不同环境

&emsp;&emsp;在项目根目录中新建.env, .env.production, .env.analyz 等文件

&emsp;&emsp;只有以 VUE_APP 开头的变量会被 webpack.DefinePlugin 静态嵌入到客户端侧的包中，代码中可以通过 process.env.VUE_APP_BASE_API 访问

&emsp;&emsp;NODE_ENV 和 BASE_URL 是两个特殊变量，在代码中始终可用

##### .env serve 默认的环境变量

```
NODE_ENV = 'development'
VUE_APP_BASE_API = 'https://demo.cn/api'
```

##### .env.production build 默认的环境变量

&emsp;&emsp;如果开启 ali oss,VUE_APP_SRC 配置为 ali oss 资源 url 前缀，如：'https://staven.oss-cn-hangzhou.aliyuncs.com/demo'

```
NODE_ENV = 'production'

VUE_APP_BASE_API = 'https://demo.com/api'
VUE_APP_SRC = '/'

ACCESS_KEY_ID = ''
ACCESS_KEY_SECRET = ''
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven'
PREFIX = 'demo'
```

##### .env.analyz 用于 webpack-bundle-analyzer 打包分析

&emsp;&emsp;如果开启 ali oss,VUE_APP_SRC 配置为 ali oss 资源 url 前缀，如：'https://staven.oss-cn-hangzhou.aliyuncs.com/demo'

```
NODE_ENV = 'production'
IS_ANALYZ = 'analyz'

VUE_APP_BASE_API = 'https://demo.com/api'
VUE_APP_SRC = '/'

ACCESS_KEY_ID = ''
ACCESS_KEY_SECRET = ''
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven'
PREFIX = 'demo'
```

&emsp;&emsp;修改 package.json

```
"scripts": {
  "serve": "vue-cli-service serve",
  "build": "vue-cli-service build",
  "analyz": "vue-cli-service build --mode analyz",
  "lint": "vue-cli-service lint"
}
```

[▲ 回顶部](#top)

### <span id="base">☞ 配置基础 vue.config.js</span>

```
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);

module.exports = {
  baseUrl: './', // 默认'/'，部署应用包时的基本 URL
  outputDir: process.env.outputDir || 'dist', // 'dist', 生产环境构建文件的目录
  assetsDir: '',  // 相对于outputDir的静态资源(js、css、img、fonts)目录
  lintOnSave: false,
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: false,  // 生产环境的 source map
  parallel: require('os').cpus().length > 1,
  pwa: {}
};
```

[▲ 回顶部](#top)

### <span id="proxy">☞ 配置 proxy 跨域</span>

```$xslt
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);
module.exports = {
    devServer: {
        // overlay: {
        //   warnings: true,
        //   errors: true
        // },
        open: IS_PROD,
        host: '0.0.0.0',
        port: 8000,
        https: false,
        hotOnly: false,
        proxy: {
          '/api': {
            target: process.env.VUE_APP_BASE_API || 'http://127.0.0.1:8080',
            changeOrigin: true
          }
        }
    }
}
```

[▲ 回顶部](#top)

### <span id="hmr">☞ 修复 HMR(热更新)失效</span>

```$xslt
module.exports = {
    chainWebpack: config => {
        // 修复HMR
        config.resolve.symlinks(true);
    }
}
```

[▲ 回顶部](#top)

### <span id="lazyloading">☞ 修复 Lazy loading routes Error： Cyclic dependency</span> [https://github.com/vuejs/vue-cli/issues/1669](https://github.com/vuejs/vue-cli/issues/1669)

```$xslt
module.exports = {
    chainWebpack: config => {
        config.plugin('html').tap(args => {
            args[0].chunksSortMode = 'none';
            return args;
        });
    }
}
```

[▲ 回顶部](#top)

### <span id="alias">☞ 添加别名</span>

```$xslt
const path =  require('path');
const resolve = (dir) => path.join(__dirname, dir);
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);

module.exports = {
    chainWebpack: config => {
        // 添加别名
        config.resolve.alias
          .set('@', resolve('src'))
          .set('assets', resolve('src/assets'))
          .set('components', resolve('src/components'))
          .set('layout', resolve('src/layout'))
          .set('base', resolve('src/base'))
          .set('static', resolve('src/static'));
    }
}
```

[▲ 回顶部](#top)

### <span id="compressimage">☞ 压缩图片</span>

```
npm i -D image-webpack-loader
```

```
module.exports = {
  chainWebpack: config => {
    config.module
      .rule("images")
      .use("image-webpack-loader")
      .loader("image-webpack-loader")
      .options({
        mozjpeg: { progressive: true, quality: 65 },
        optipng: { enabled: false },
        pngquant: { quality: "65-90", speed: 4 },
        gifsicle: { interlaced: false },
        webp: { quality: 75 }
      });
  }
}
```

[▲ 回顶部](#top)

### <span id="removecss">☞ 去除多余无效的 css</span>

- 方案一：@fullhuman/postcss-purgecss

```
npm i -D postcss-import @fullhuman/postcss-purgecss
```

&emsp;&emsp;更新 postcss.config.js

```
const autoprefixer = require('autoprefixer')
const postcssImport = require('postcss-import')
const purgecss = require('@fullhuman/postcss-purgecss')
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)
let plugins = []
if (IS_PROD) {
  plugins.push(postcssImport)
  plugins.push(
    purgecss({
      content: [
        './layouts/**/*.vue',
        './components/**/*.vue',
        './pages/**/*.vue'
      ],
      extractors: [
        {
          extractor: class Extractor {
            static extract(content) {
              const validSection = content.replace(
                /<style([\s\S]*?)<\/style>+/gim,
                ''
              )
              return validSection.match(/[A-Za-z0-9-_:/]+/g) || []
            }
          },
          extensions: ['html', 'vue']
        }
      ],
      whitelist: ['html', 'body'],
      whitelistPatterns: [/el-.*/],
      whitelistPatternsChildren: [/^token/, /^pre/, /^code/]
    })
  )
}
module.exports = {
  plugins: [...plugins, autoprefixer]
}
```

- 方案二：purgecss-webpack-plugin

```
npm i --save-dev glob-all purgecss-webpack-plugin
```

```
const path = require('path')
const glob = require('glob-all')
const PurgecssPlugin = require('purgecss-webpack-plugin')
const resolve = dir => path.resolve(__dirname, dir)
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

module.exports = {
  configureWebpack: config => {
    if (IS_PROD) {
      const plugins = []
      plugins.push(
        new PurgecssPlugin({
          paths: glob.sync([resolve('./**/*.vue')]),
          extractors: [
            {
              extractor: class Extractor {
                static extract(content) {
                  const validSection = content.replace(
                    /<style([\s\S]*?)<\/style>+/gim,
                    ''
                  )
                  return validSection.match(/[A-Za-z0-9-_:/]+/g) || []
                }
              },
              extensions: ['html', 'vue']
            }
          ],
          whitelist: ['html', 'body'],
          whitelistPatterns: [/el-.*/],
          whitelistPatternsChildren: [/^token/, /^pre/, /^code/]
        })
      )
      config.plugins = [...config.plugins, ...plugins]
    }
  }
}
```

[▲ 回顶部](#top)

### <span id="analyze">☞ 添加打包分析</span>

```$xslt
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    chainWebpack: config => {
        // 打包分析
        if (process.env.IS_ANALYZ) {
          config.plugin('webpack-report')
            .use(BundleAnalyzerPlugin, [{
              analyzerMode: 'static',
            }]);
        }
    }
}
```

[▲ 回顶部](#top)

### <span id="externals">☞ 配置 externals</span>

&emsp;&emsp;防止将某些 import 的包(package)打包到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖

```$xslt

module.exports = {
    configureWebpack: config => {
        config.externals = {
          'vue': 'Vue',
          'element-ui': 'ELEMENT',
          'vue-router': 'VueRouter',
          'vuex': 'Vuex',
          'axios': 'axios'
        }
    }
}
```

[▲ 回顶部](#top)

### <span id="log">☞ 去掉 console.log</span>

##### 方法一：

```$xslt
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    configureWebpack: config => {
        if (IS_PROD) {
            const plugins = [];
            plugins.push(
                new UglifyJsPlugin({
                    uglifyOptions: {
                        compress: {
                            warnings: false,
                            drop_console: true,
                            drop_debugger: false,
                            pure_funcs: ['console.log']//移除console
                        }
                    },
                    sourceMap: false,
                    parallel: true
                })
            );
            config.plugins = [
                ...config.plugins,
                ...plugins
            ];
        }
    }
}
```

##### 方法二：使用 babel-plugin-transform-remove-console 插件

```$xslt
npm i --save-dev babel-plugin-transform-remove-console
```

在 babel.config.js 中配置

```
const plugins = [];
if(['production', 'prod'].includes(process.env.NODE_ENV)) {
  plugins.push("transform-remove-console")
}

module.exports = {
  presets: [["@vue/app",{"useBuiltIns": "entry"}]],
  plugins: plugins
};

```

[▲ 回顶部](#top)

### <span id="gzip">☞ 开启 gzip 压缩</span>

```$xslt
npm i --save-dev compression-webpack-plugin
```

```$xslt
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

module.exports = {
    configureWebpack: config => {
        if (IS_PROD) {
            const plugins = [];
            plugins.push(
                new CompressionWebpackPlugin({
                    filename: '[path].gz[query]',
                    algorithm: 'gzip',
                    test: productionGzipExtensions,
                    threshold: 10240,
                    minRatio: 0.8
                })
            );
            config.plugins = [
                ...config.plugins,
                ...plugins
            ];
        }
    }
}
```

&emsp;&emsp;还可以开启比 gzip 体验更好的 Zopfli 压缩详见[https://webpack.js.org/plugins/compression-webpack-plugin](https://webpack.js.org/plugins/compression-webpack-plugin)

```$xslt
npm i --save-dev @gfx/zopfli brotli-webpack-plugin
```

```$xslt
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const zopfli = require("@gfx/zopfli");
const BrotliPlugin = require("brotli-webpack-plugin");
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

module.exports = {
    configureWebpack: config => {
        if (IS_PROD) {
            const plugins = [];
            plugins.push(
                new CompressionWebpackPlugin({
                    algorithm(input, compressionOptions, callback) {
                      return zopfli.gzip(input, compressionOptions, callback);
                    },
                    compressionOptions: {
                      numiterations: 15
                    },
                    minRatio: 0.99,
                    test: productionGzipExtensions
                })
            );
            plugins.push(
                new BrotliPlugin({
                    test: productionGzipExtensions,
                    minRatio: 0.99
                })
            );
            config.plugins = [
                ...config.plugins,
                ...plugins
            ];
        }
    }
}
```

[▲ 回顶部](#top)

### <span id="globalscss">☞ 为 sass 提供全局样式，以及全局变量</span>

&emsp;&emsp;可以通过在 main.js 中 Vue.prototype.$src = process.env.VUE_APP_SRC;挂载环境变量中的配置信息，然后在js中使用$src 访问。

&emsp;&emsp;css 中可以使用注入 sass 变量访问环境变量中的配置信息

```$xslt
module.exports = {
    css: {
        modules: false,
        extract: IS_PROD,
        sourceMap: false,
        loaderOptions: {
          sass: {
            // 向全局sass样式传入共享的全局变量
            data: `@import "~assets/scss/variables.scss";$src: "${process.env.VUE_APP_SRC}";`
          }
        }
    }
}
```

在 scss 中引用

```$xslt
.home {
    background: url($src + '/images/500.png');
}
```

[▲ 回顶部](#top)

### <span id="globalstylus">☞ 为 stylus 提供全局变量</span>

```
npm i -D style-resources-loader
```

```$xslt
const path = require('path')
const resolve = dir => path.resolve(__dirname, dir)
const addStylusResource = rule => {
  rule
    .use('style-resouce')
    .loader('style-resources-loader')
    .options({
      patterns: [resolve('src/assets/stylus/variable.styl')]
    })
}
module.exports = {
  chainWebpack: config => {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type =>
      addStylusResource(config.module.rule('stylus').oneOf(type))
    )
  }
}
```

[▲ 回顶部](#top)

### <span id="ie">☞ 添加 IE 兼容</span>

```$xslt
npm i --save @babel/polyfill
```

&emsp;&emsp;在 main.js 中添加

```$xslt
import '@babel/polyfill';
```

配置 babel.config.js

```$xslt
const plugins = [];

module.exports = {
  presets: [["@vue/app",{"useBuiltIns": "entry"}]],
  plugins: plugins
};

```

[▲ 回顶部](#top)

### <span id="alioss">☞ 文件上传 ali oss</span>

&emsp;&emsp;开启文件上传 ali oss，需要将 baseUrl 改成 ali oss 资源 url 前缀,也就是修改 VUE_APP_SRC

```$xslt
npm i --save-dev webpack-oss
```

```$xslt
const AliOssPlugin = require('webpack-oss');

module.exports = {
    configureWebpack: config => {
        if (IS_PROD) {
            const plugins = [];
            // 上传文件到oss
            if (process.env.ACCESS_KEY_ID || process.env.ACCESS_KEY_SECRET || process.env.REGION || process.env.BUCKET || process.env.PREFIX) {
                plugins.push(
                    new AliOssPlugin({
                        accessKeyId: process.env.ACCESS_KEY_ID,
                        accessKeySecret: process.env.ACCESS_KEY_SECRET,
                        region: process.env.REGION,
                        bucket: process.env.BUCKET,
                        prefix: process.env.PREFIX,
                        exclude: /.*\.html$/,
                        deleteAll: false
                    })
                );
            }
            config.plugins = [
                ...config.plugins,
                ...plugins
            ];
        }
    }
}
```

[▲ 回顶部](#top)

### <span id="allconfig">☞ 完整配置</span>

- 安装依赖

```$xslt
npm i -D compression-webpack-plugin babel-plugin-transform-remove-console style-resources-loader
```

&emsp;&emsp;其他依赖(@gfx/zopfli、brotli-webpack-plugin、webpack-oss、glob-all、purgecss-webpack-plugin、postcss-import、@fullhuman/postcss-purgecss、image-webpack-loader)根据需求选择安装

- 环境配置

.env

```
NODE_ENV = 'development'
VUE_APP_BASE_API = 'https://demo.cn/api'
```

.env.production

&emsp;&emsp;如果开启 ali oss,VUE_APP_SRC 配置为 ali oss 资源 url 前缀，如：'https://staven.oss-cn-hangzhou.aliyuncs.com/demo'

```
NODE_ENV = 'production'

VUE_APP_BASE_API = 'https://demo.com/api'
VUE_APP_SRC = '/'

ACCESS_KEY_ID = ''
ACCESS_KEY_SECRET = ''
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven'
PREFIX = 'demo'
```

.env.analyz

&emsp;&emsp;如果开启 ali oss,VUE_APP_SRC 配置为 ali oss 资源 url 前缀，如：'https://staven.oss-cn-hangzhou.aliyuncs.com/demo'

```
NODE_ENV = 'production'
IS_ANALYZ = 'analyz'

VUE_APP_BASE_API = 'https://demo.com/api'
VUE_APP_SRC = VUE_APP_SRC = '/'

ACCESS_KEY_ID = ''
ACCESS_KEY_SECRET = ''
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven'
PREFIX = 'demo'
```

- package.json

```$xslt
"scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "analyz": "vue-cli-service build --mode analyz",
    "lint": "vue-cli-service lint"
}
```

- babel.config.js

```$xslt
const plugins = [];
// if(['production', 'prod'].includes(process.env.NODE_ENV)) {
//   plugins.push("transform-remove-console")
// }

module.exports = {
  presets: [["@vue/app",{"useBuiltIns": "entry"}]],
  plugins: plugins
};
```

- postcss.config.js

```
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
  //         extensions: ["vue"],
  //         whitelistPatterns: [/el-.*/]
  //       }
  //     ]
  //   })
  // );
}

module.exports = {
  plugins: [...plugins, autoprefixer]
};
```

- vue.config.js

```
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
// const zopfli = require("@gfx/zopfli");
// const BrotliPlugin = require("brotli-webpack-plugin");
// const AliOssPlugin = require('webpack-oss')

const path = require('path')
// const PurgecssPlugin = require('purgecss-webpack-plugin')
// const glob = require('glob-all')

const resolve = dir => path.join(__dirname, dir)
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i

// 添加stylus规则
// const addStylusResource = rule => {
// rule
// .use('style-resouce')
// .loader('style-resources-loader')
// .options({
// patterns: [resolve('src/assets/stylus/variable.styl')]
// })
// }

module.exports = {
  baseUrl: IS_PROD ? process.env.VUE_APP_SRC || '/' : './', // 默认'/'，部署应用包时的基本 URL
  outputDir: process.env.outputDir || 'dist', // 'dist', 生产环境构建文件的目录
  assetsDir: '', // 相对于outputDir的静态资源(js、css、img、fonts)目录
  lintOnSave: false,
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: false, // 生产环境的 source map

  configureWebpack: config => {
    // cdn引用时配置externals
    // config.externals = {
    // 'vue': 'Vue',
    // 'element-ui': 'ELEMENT',
    // 'vue-router': 'VueRouter',
    // 'vuex': 'Vuex',
    // 'axios': 'axios'
    // }

    if (IS_PROD) {
      const plugins = []

      // 去除多余css
      // plugins.push(
      // new PurgecssPlugin({
      // paths: glob.sync([path.join(__dirname, "./**/*.vue")]),
      // extractors: [
      // {
      // extractor: class Extractor {
      // static extract(content) {
      // const validSection = content.replace(
      // /<style([\s\S]*?)<\/style>+/gim,
      // ""
      // );
      // return validSection.match(/[A-Za-z0-9-_:/]+/g) || [];
      // }
      // },
      // extensions: ['html', 'vue']
      // }
      // ],
      // whitelist: ["html", "body"],
      // whitelistPatterns: [/el-.*/],
      // whitelistPatternsChildren: [/^token/, /^pre/, /^code/]
      // })
      // );

      plugins.push(
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              warnings: false,
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ['console.log'] //移除console
            }
          },
          sourceMap: false,
          parallel: true
        })
      )
      plugins.push(
        new CompressionWebpackPlugin({
          filename: '[path].gz[query]',
          algorithm: 'gzip',
          test: productionGzipExtensions,
          threshold: 10240,
          minRatio: 0.8
        })
      )

      // 上传文件到oss
      //if (process.env.ACCESS_KEY_ID || process.env.ACCESS_KEY_SECRET || process.env.REGION || process.env.BUCKET || process.env.PREFIX) {
      // plugins.push(
      // new AliOssPlugin({
      // accessKeyId: process.env.ACCESS_KEY_ID,
      // accessKeySecret: process.env.ACCESS_KEY_SECRET,
      // region: process.env.REGION,
      // bucket: process.env.BUCKET,
      // prefix: process.env.PREFIX,
      // exclude: /.*\.html$/,
      // deleteAll: false
      // })
      // );
      //}

      // Zopfli压缩，需要响应VC库 https://webpack.js.org/plugins/compression-webpack-plugin/
      // plugins.push(
      // new CompressionWebpackPlugin({
      // algorithm(input, compressionOptions, callback) {
      // return zopfli.gzip(input, compressionOptions, callback);
      // },
      // compressionOptions: {
      // numiterations: 15
      // },
      // minRatio: 0.99,
      // test: productionGzipExtensions
      // })
      // );
      // plugins.push(
      // new BrotliPlugin({
      // test: productionGzipExtensions,
      // minRatio: 0.99
      // })
      // );
      config.plugins = [...config.plugins, ...plugins]
    }
  },
  chainWebpack: config => {
    // 修复HMR
    config.resolve.symlinks(true)

    // 修复Lazy loading routes Error： Cyclic dependency [https://github.com/vuejs/vue-cli/issues/1669]
    config.plugin('html').tap(args => {
      args[0].chunksSortMode = 'none'
      return args
    })

    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('layout', resolve('src/layout'))
      .set('base', resolve('src/base'))
      .set('static', resolve('src/static'))

    // 打包分析
    if (process.env.IS_ANALYZ) {
      config.plugin('webpack-report').use(BundleAnalyzerPlugin, [
        {
          analyzerMode: 'static'
        }
      ])
    }

    // 压缩图片
    // config.module
    // .rule("images")
    // .use("image-webpack-loader")
    // .loader("image-webpack-loader")
    // .options({
    // mozjpeg: { progressive: true, quality: 65 },
    // optipng: { enabled: false },
    // pngquant: { quality: "65-90", speed: 4 },
    // gifsicle: { interlaced: false },
    // webp: { quality: 75 }
    // });

    // stylus
    // const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    // types.forEach(type =>
    // addStylusResource(config.module.rule('stylus').oneOf(type))
    // )

    // 多页面配置，为js添加hash
    // config.output.chunkFilename(`js/[name].[chunkhash:8].js`)

    // 修改图片输出路径
    // config.module
    // .rule('images')
    // .test(/\.(png|jpe?g|gif|ico)(\?.*)?$/)
    // .use('url-loader')
    // .loader('url-loader')
    // .options({
    // name: path.join('../assets/', 'img/[name].[ext]')
    // })
  },
  css: {
    modules: false,
    extract: IS_PROD,
    // 为css后缀添加hash
    // extract: {
    // filename: 'css/[name].[hash:8].css',
    // chunkFilename: 'css/[name].[hash:8].css'
    //}，
    sourceMap: false,
    loaderOptions: {
      sass: {
        // 向全局sass样式传入共享的全局变量
        // data: `@import "~assets/scss/variables.scss";$src: "${process.env.VUE_APP_SRC}";`
        data: `$src: "${process.env.VUE_APP_SRC}";`
      }
      // px转换为rem
      // postcss: {
      // plugins: [
      // require('postcss-pxtorem')({
      // rootValue : 1, // 换算的基数
      // selectorBlackList : ['weui', 'el'], // 忽略转换正则匹配项
      // propList : ['*']
      // })
      // ]
      // }
    }
  },
  pluginOptions: {
    // 安装vue-cli-plugin-style-resources-loader插件
    // 添加全局样式global.scss
    // "style-resources-loader": {
    // preProcessor: "scss",
    // patterns: [
    // resolve(__dirname, "./src/scss/scss/variables.scss")
    // ]
    // }
  },
  parallel: require('os').cpus().length > 1,
  pwa: {},
  devServer: {
    // overlay: {
    // warnings: true,
    // errors: true
    // },
    open: IS_PROD,
    host: '0.0.0.0',
    port: 8000,
    https: false,
    hotOnly: false,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_BASE_API || 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  }
}
```
