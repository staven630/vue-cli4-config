# vue-cli3 全面配置(持续更新)

### 其他系列

★ [Nuxt.js 全面配置](https://github.com/staven630/nuxt-config)

<span id="top">目录</span>

- [√ 配置多环境变量](#env)
- [√ 配置基础 vue.config.js](#base)
- [√ 配置 proxy 跨域](#proxy)
- [√ 修复 HMR(热更新)失效](#hmr)
- [√ 修复 Lazy loading routes Error： Cyclic dependency](#lazyloading)
- [√ 添加别名alias](#alias)
- [√ 压缩图片](#compressimage)
- [√ 自动生成雪碧图](#spritesmith)
- [√ 去除多余无效的 css](#removecss)
- [√ 添加打包分析](#analyze)
- [√ 配置 externals 引入cdn资源](#externals)
- [√ 去掉 console.log](#log)
- [√ 利用splitChunks单独打包第三方模块](#splitchunks)
- [√ 开启 gzip 压缩](#gzip)
- [√ 为 sass 提供全局样式，以及全局变量](#globalscss)
- [√ 为 stylus 提供全局变量](#globalstylus)
- [√ 预渲染prerender-spa-plugin](#prerender)
- [√ 添加 IE 兼容](#ie)
- [√ 文件上传 ali oss](#alioss)
- [√ 完整依赖](#allconfig)

### <span id="env">✅ 配置多环境变量</span>
&emsp;&emsp;通过在package.json里的 scripts 配置项中添加--mode xxx 来选择不同环境

&emsp;&emsp;只有以 VUE_APP 开头的变量会被 webpack.DefinePlugin 静态嵌入到客户端侧的包中，代码中可以通过 process.env.VUE_APP_BASE_API 访问

&emsp;&emsp;NODE_ENV 和 BASE_URL 是两个特殊变量，在代码中始终可用

##### 配置
&emsp;&emsp;在项目根目录中新建.env, .env.production, .env.analyz等文件

* .env

&emsp;&emsp;serve 默认的本地开发环境配置

```javascript
NODE_ENV = 'development'
BASE_URL = './'
VUE_APP_PUBLIC_PATH = './'
VUE_APP_API = 'https://test.staven630.com/api'
```

* .env.production
  
&emsp;&emsp;build 默认的环境配置


```javascript
NODE_ENV = 'production'
BASE_URL = 'https://prod.staven630.com/'
VUE_APP_PUBLIC_PATH = 'https://prod.oss.com/staven-blog'
VUE_APP_API = 'https://prod.staven630.com/api'

ACCESS_KEY_ID = 'xxxxxxxxxxxxx'
ACCESS_KEY_SECRET = 'xxxxxxxxxxxxx'
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven-prod'
PREFIX = 'staven-blog'
```

* .env.analyz
  
&emsp;&emsp;自定义build环境配置

```javascript
NODE_ENV = 'production'
BASE_URL = 'https://prod.staven630.com/'
VUE_APP_PUBLIC_PATH = 'https://prod.oss.com/staven-blog'
VUE_APP_API = 'https://prod.staven630.com/api'

ACCESS_KEY_ID = 'xxxxxxxxxxxxx'
ACCESS_KEY_SECRET = 'xxxxxxxxxxxxx'
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven-prod'
PREFIX = 'staven-blog'

IS_ANALYZE = true
```

&emsp;&emsp;修改 package.json

```javascript
"scripts": {
  "serve": "vue-cli-service serve",
  "build": "vue-cli-service build",
  "analyz": "vue-cli-service build --mode analyze",
  "lint": "vue-cli-service lint"
}
```

##### 使用环境变量

```javascript
<template>
  <div class="home">
    <!-- template中使用环境变量 -->
    {{ api }}
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    return {
      api: process.env.VUE_APP_API
    };
  },
  mounted() {
    // js代码中使用环境变量
    console.log("BASE_URL", process.env.BASE_URL);
    console.log("VUE_APP_API", process.env.VUE_APP_API);
  }
};
</script>
```

[▲ 回顶部](#top)

### <span id="base">✅ 配置基础 vue.config.js</span>

```javascript
const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);

module.exports = {
  publicPath: IS_PROD ? process.env.VUE_APP_PUBLIC_PATH : "./", // 默认'/'，部署应用包时的基本 URL
  // outputDir: process.env.outputDir || 'dist', // 'dist', 生产环境构建文件的目录
  // assetsDir: "", // 相对于outputDir的静态资源(js、css、img、fonts)目录
  lintOnSave: false,
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: !IS_PROD, // 生产环境的 source map
  parallel: require("os").cpus().length > 1,
  pwa: {}
};
```

[▲ 回顶部](#top)

### <span id="proxy">✅ 配置proxy代理解决跨域问题</span>
&emsp;&emsp;假设mock接口为https://www.easy-mock.com/mock/5bc75b55dc36971c160cad1b/sheets/1
```javascript
module.exports = {
  devServer: {
    // overlay: { // 让浏览器 overlay 同时显示警告和错误
    //   warnings: true,
    //   errors: true
    // },
    // open: false, // 是否打开浏览器
    // host: "localhost",
    // port: "8080", // 代理断就
    // https: false,
    // hotOnly: false, // 热更新
    proxy: {
      "/api": {
        target:
          "https://www.easy-mock.com/mock/5bc75b55dc36971c160cad1b/sheets", // 目标代理接口地址
        secure: false,
        changeOrigin: true, // 开启代理，在本地创建一个虚拟服务端
        // ws: true, // 是否启用websockets
        pathRewrite: {
          "^/api": "/"
        }
      }
    }
  }
};
```
&emsp;&emsp;访问
```javascript
<script>
import axios from "axios";
export default {
  mounted() {
    axios.get("/api/1").then(res => {
      console.log(res);
    });
  }
};
</script>
```

[▲ 回顶部](#top)

### <span id="hmr">✅ 修复 HMR(热更新)失效</span>
```javascript
module.exports = {
    chainWebpack: config => {
        // 修复HMR
        config.resolve.symlinks(true);
    }
}
```

[▲ 回顶部](#top)

### <span id="lazyloading">✅ 修复 Lazy loading routes Error： Cyclic dependency</span> [https://github.com/vuejs/vue-cli/issues/1669](https://github.com/vuejs/vue-cli/issues/1669)

```javascript
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

### <span id="alias">✅ 添加别名alias</span>

```javascript
const path =  require('path');
const resolve = (dir) => path.join(__dirname, dir);
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);

module.exports = {
    chainWebpack: config => {
        // 添加别名
        config.resolve.alias
          .set('vue$', 'vue/dist/vue.esm.js')
          .set('@', resolve('src'))
          .set('@assets', resolve('src/assets'))
          .set('@scss', resolve('src/assets/scss'))
          .set('@components', resolve('src/components'))
          .set('@plugins', resolve('src/plugins'))
          .set('@views', resolve('src/views'))
          .set('@router', resolve('src/router'))
          .set('@store', resolve('src/store'))
          .set('@layouts', resolve('src/layouts'))
          .set('@static', resolve('src/static'));
    }
}
```

[▲ 回顶部](#top)

### <span id="compressimage">✅ 压缩图片</span>

```javascript
npm i -D image-webpack-loader
```

```javascript
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

### <span id="spritesmith">✅ 自动生成雪碧图</span>
&emsp;&emsp;默认src/assets/icons中存放需要生成雪碧图的png文件。首次运行npm run serve/build会生成雪碧图，并在跟目录生成icons.json文件。再次运行命令时，会对比icons目录内文件与icons.json的匹配关系，确定是否需要再次执行webpack-spritesmith插件。
```javascript
npm i -D webpack-spritesmith
```

```javascript
const SpritesmithPlugin = require('webpack-spritesmith')
const path = require('path')
const fs = require('fs')

let has_sprite = true

try {
  let result = fs.readFileSync(path.resolve(__dirname, './icons.json'), 'utf8')
  result = JSON.parse(result)
  const files = fs.readdirSync(path.resolve(__dirname, './src/assets/icons'))
  if (files && files.length) {
    has_sprite = files.some(item => {
      let filename = item.toLocaleLowerCase().replace(/_/g, '-')
      return !result[filename]
    })
      ? true
      : false
  } else {
    has_sprite = false
  }
} catch (error) {}

// 雪碧图样式处理模板
const SpritesmithTemplate = function(data) {
  // pc
  let icons = {}
  let tpl = `.ico { 
  display: inline-block; 
  background-image: url(${data.sprites[0].image}); 
  background-size: ${data.spritesheet.width}px ${data.spritesheet.height}px; 
}`

  data.sprites.forEach(sprite => {
    const name = '' + sprite.name.toLocaleLowerCase().replace(/_/g, '-')
    icons[`${name}.png`] = true
    tpl = `${tpl} 
.ico-${name}{
  width: ${sprite.width}px; 
  height: ${sprite.height}px; 
  background-position: ${sprite.offset_x}px ${sprite.offset_y}px;
}
`
  })

  fs.writeFile(
    path.resolve(__dirname, './icons.json'),
    JSON.stringify(icons, null, 2),
    (err, data) => {}
  )

  return tpl
}

module.exports = {
  configureWebpack: config => {
    const plugins = []
    if (has_sprite) {
      plugins.push(
        new SpritesmithPlugin({
          src: {
            cwd: path.resolve(__dirname, './src/assets/icons/'), // 图标根路径
            glob: '**/*.png' // 匹配任意 png 图标
          },
          target: {
            image: path.resolve(__dirname, './src/assets/images/sprites.png'), // 生成雪碧图目标路径与名称
            // 设置生成CSS背景及其定位的文件或方式
            css: [
              [
                path.resolve(__dirname, './src/assets/scss/sprites.scss'),
                {
                  format: 'function_based_template'
                }
              ]
            ]
          },
          customTemplates: {
            function_based_template: SpritesmithTemplate
          },
          apiOptions: {
            cssImageRef: '../images/sprites.png' // css文件中引用雪碧图的相对位置路径配置
          },
          spritesmithOptions: {
            padding: 2
          }
        })
      )
    }
    config.plugins = [...config.plugins, ...plugins]
  }
}
```

[▲ 回顶部](#top)

### <span id="removecss">✅ 去除多余无效的 css</span>

- 方案一：@fullhuman/postcss-purgecss

```javascript
npm i -D postcss-import @fullhuman/postcss-purgecss
```

&emsp;&emsp;更新 postcss.config.js

```javascript
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
              return validSection..match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
            }
          },
          extensions: ['html', 'vue']
        }
      ],
      whitelist: ['html', 'body'],
      whitelistPatterns: [/el-.*/, /-(leave|enter|appear)(|-(to|from|active))$/, /^(?!cursor-move).+-move$/, /^router-link(|-exact)-active$/],
      whitelistPatternsChildren: [/^token/, /^pre/, /^code/]
    })
  )
}
module.exports = {
  plugins: [...plugins, autoprefixer]
}
```

- 方案二：purgecss-webpack-plugin

```javascript
npm i -D glob-all purgecss-webpack-plugin
```

```javascript
const path = require("path");
const glob = require("glob-all");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const resolve = dir => path.join(__dirname, dir);
const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);

module.exports = {
  configureWebpack: config => {
    const plugins = [];
    if (IS_PROD) {
      plugins.push(
        new PurgecssPlugin({
          paths: glob.sync([resolve("./**/*.vue")]),
          extractors: [
            {
              extractor: class Extractor {
                static extract(content) {
                  const validSection = content.replace(
                    /<style([\s\S]*?)<\/style>+/gim,
                    ""
                  );
                  return validSection..match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
                }
              },
              extensions: ["html", "vue"]
            }
          ],
          whitelist: ["html", "body"],
          whitelistPatterns: [/el-.*/, /-(leave|enter|appear)(|-(to|from|active))$/, /^(?!cursor-move).+-move$/, /^router-link(|-exact)-active$/],
          whitelistPatternsChildren: [/^token/, /^pre/, /^code/]
        })
      );
    }
    config.plugins = [...config.plugins, ...plugins];
  }
};
```

[▲ 回顶部](#top)

### <span id="analyze">✅ 添加打包分析</span>

```javascript
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
&emsp;&emsp;需要添加.env.analyz文件
```javascript
NODE_ENV = 'production'
IS_ANALYZE = true
```
&emsp;&emsp;package.json的scripts中添加
```javascript
"analyz": "vue-cli-service build --mode analyze"
```
执行
```javascript
npm run analyz
```
 
[▲ 回顶部](#top)

### <span id="externals">✅ 配置externals引入cdn资源</span>

&emsp;&emsp;防止将某些 import 的包(package)打包到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖

```javascript
module.exports = {
  configureWebpack: config => {
    config.externals = {
      vue: 'Vue',
      'element-ui': 'ELEMENT',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
      axios: 'axios'
    }
  },
  chainWebpack: config => {
    const cdn = {
      // 访问https://unpkg.com/element-ui/lib/theme-chalk/index.css获取最新版本
      css: ['//unpkg.com/element-ui@2.10.1/lib/theme-chalk/index.css'],
      js: [
        '//unpkg.com/vue@2.6.10/dist/vue.min.js', // 访问https://unpkg.com/vue/dist/vue.min.js获取最新版本
        '//unpkg.com/vue-router@3.0.6/dist/vue-router.min.js',
        '//unpkg.com/vuex@3.1.1/dist/vuex.min.js',
        '//unpkg.com/axios@0.19.0/dist/axios.min.js',
        '//unpkg.com/element-ui@2.10.1/lib/index.js'
      ] 
    };

    // html中添加cdn
    config.plugin('html').tap(args => {
      args[0].cdn = cdn
      return args
    })
  }
}
```
&emsp;&emsp;在html中添加
```
<!-- 使用CDN的CSS文件 -->
<% for (var i in htmlWebpackPlugin.options.cdn &&
htmlWebpackPlugin.options.cdn.css) { %>
<link rel="stylesheet" href="<%= htmlWebpackPlugin.options.cdn.css[i] %>" />
<% } %>

<!-- 使用CDN的JS文件 -->
<% for (var i in htmlWebpackPlugin.options.cdn &&
htmlWebpackPlugin.options.cdn.js) { %>
<script
  type="text/javascript"
  src="<%= htmlWebpackPlugin.options.cdn.js[i] %>"
></script>
<% } %>
```

[▲ 回顶部](#top)

### <span id="log">✅ 去掉 console.log</span>
##### 方法一：使用 babel-plugin-transform-remove-console 插件

```javascript
npm i --D babel-plugin-transform-remove-console
```

在 babel.config.js 中配置

```
const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);

const plugins = [];
if (IS_PROD) {
  plugins.push("transform-remove-console");
}

module.exports = {
  presets: ["@vue/app", { useBuiltIns: "entry" }],
  plugins
};
```

##### 方法二：

```javascript
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
&emsp;&emsp;如果使用uglifyjs-webpack-plugin会报错，可能存在node_modules中有些依赖需要babel转译。

&emsp;&emsp;而vue-cli的[transpileDependencies](https://cli.vuejs.org/zh/config/#transpiledependencies)配置默认为[], babel-loader 会忽略所有 node_modules 中的文件。如果你想要通过 Babel 显式转译一个依赖，可以在这个选项中列出来。配置需要转译的第三方库。


[▲ 回顶部](#top)

### <span id="splitchunks">利用splitChunks单独打包第三方模块</span> 
```
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

module.exports = {
  configureWebpack: config => {
    if (IS_PROD) {
      config.optimization = {
        splitChunks: {
          cacheGroups: {
            libs: {
              name: 'chunk-libs',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              chunks: 'initial'
            },
            elementUI: {
              name: 'chunk-elementUI',
              priority: 20,
              test: /[\\/]node_modules[\\/]element-ui[\\/]/,
              chunks: 'all'
            }
          }
        }
      }
    }
  },
  chainWebpack: config => {
    if (IS_PROD) {
      config.optimization.delete('splitChunks')
    }
    return config
  }
}
```

[▲ 回顶部](#top)
### <span id="gzip">✅ 开启gzip压缩</span>

```javascript
npm i --D compression-webpack-plugin
```

```javascript
const CompressionWebpackPlugin = require("compression-webpack-plugin");

const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

module.exports = {
  configureWebpack: config => {
    const plugins = [];
    if (IS_PROD) {
      plugins.push(
        new CompressionWebpackPlugin({
          filename: "[path].gz[query]",
          algorithm: "gzip",
          test: productionGzipExtensions,
          threshold: 10240,
          minRatio: 0.8
        })
      );
    }
    config.plugins = [...config.plugins, ...plugins];
  }
};
```

&emsp;&emsp;还可以开启比 gzip 体验更好的 Zopfli 压缩详见[https://webpack.js.org/plugins/compression-webpack-plugin](https://webpack.js.org/plugins/compression-webpack-plugin)

```javascript
npm i --save-dev @gfx/zopfli brotli-webpack-plugin
```

```javascript
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const zopfli = require("@gfx/zopfli");
const BrotliPlugin = require("brotli-webpack-plugin");

const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

module.exports = {
  configureWebpack: config => {
    const plugins = [];
    if (IS_PROD) {
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
    }
    config.plugins = [...config.plugins, ...plugins];
  }
};
```

[▲ 回顶部](#top)

### <span id="globalscss">✅ 为 sass 提供全局样式，以及全局变量</span>

&emsp;&emsp;可以通过在 main.js 中 Vue.prototype.$src = process.env.VUE_APP_PUBLIC_PATH;挂载环境变量中的配置信息，然后在js中使用$src 访问。

&emsp;&emsp;css 中可以使用注入 sass 变量访问环境变量中的配置信息

```javascript
module.exports = {
  css: {
    modules: false,
    extract: IS_PROD,
    sourceMap: false,
    loaderOptions: {
      sass: {
        // 向全局sass样式传入共享的全局变量
        data: `
          @import "@scss/config.scss";
          @import "@scss/variables.scss";
          @import "@scss/mixins.scss";
          @import "@scss/utils.scss";
          $src: "${process.env.VUE_APP_OSS_SRC}";
          `
      }
    }
  }
}
```

在 scss 中引用

```javascript
.home {
    background: url($src + '/images/500.png');
}
```

[▲ 回顶部](#top)

### <span id="globalstylus">✅ 为 stylus 提供全局变量</span>

```
npm i -D style-resources-loader
```

```javascript
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

### <span id="prerender">预渲染prerender-spa-plugin</span>
```
npm i -D prerender-spa-plugin
```

```
const PrerenderSpaPlugin = require('prerender-spa-plugin')
const path = require('path')
const resolve = dir => path.join(__dirname, dir)
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

module.exports = {
  configureWebpack: config => {
    const plugins = []
    if (IS_PROD) {
      plugins.push(
        new PrerenderSpaPlugin({
          staticDir: resolve('dist'),
          routes: ['/'],
          postProcess(ctx) {
            ctx.route = ctx.originalRoute
            ctx.html = ctx.html
              .split(/>[\s]+</gim)
              .join('><')
            if (ctx.route.endsWith('.html')) {
              ctx.outputPath = path.join(
                __dirname,
                'dist',
                ctx.route
              )
            }
            return ctx
          },
          minify: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            decodeEntities: true,
            keepClosingSlash: true,
            sortAttributes: true
          },
          renderer: new PrerenderSpaPlugin.PuppeteerRenderer({
            // 需要注入一个值，这样就可以检测页面当前是否是预渲染的
            inject: {},
            headless: false,
            // 视图组件是在API请求获取所有必要数据后呈现的，因此我们在dom中存在“data view”属性后创建页面快照
            renderAfterDocumentEvent: 'render-event'
          })
        })
      )
    }
    config.plugins = [...config.plugins, ...plugins]
  } 
}
```
&emsp;&emsp;mounted()中添加document.dispatchEvent(new Event('render-event'))
```
new Vue({
  router,
  store,
  render: (h) => h(App),
  mounted() {
    document.dispatchEvent(new Event('render-event'))
  }
}).$mount('#app')
```

[▲ 回顶部](#top)

### <span id="ie">✅ 添加IE兼容</span>

```javascript
npm i --save @babel/polyfill
```

&emsp;&emsp;在 main.js 中添加

```javascript
import '@babel/polyfill';
```

配置 babel.config.js

```javascript
const plugins = [];

module.exports = {
  presets: [["@vue/app",{"useBuiltIns": "entry"}]],
  plugins: plugins
};

```

[▲ 回顶部](#top)

### <span id="alioss">✅ 文件上传 ali oss</span>

&emsp;&emsp;开启文件上传 ali oss，需要将 publicPath 改成 ali oss 资源 url 前缀,也就是修改 VUE_APP_PUBLIC_PATH

```javascript
npm i -D webpack-oss
```

```javascript
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

### <span id="allconfig">✅ 完整配置</span>
```javascript
const path = require("path");
// const glob = require("glob-all");
// const PurgecssPlugin = require("purgecss-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
// const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
// const CompressionWebpackPlugin = require("compression-webpack-plugin");
// const PrerenderSpaPlugin = require("prerender-spa-plugin");
// const AliOssPlugin = require("webpack-oss");
const resolve = dir => path.join(__dirname, dir);
const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);
// const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

// const addStylusResource = rule => {
//   rule
//     .use("style-resouce")
//     .loader("style-resources-loader")
//     .options({
//       patterns: [resolve("src/assets/stylus/variable.styl")]
//     });
// };

module.exports = {
  publicPath: IS_PROD ? process.env.VUE_APP_PUBLIC_PATH : "./", // 默认'/'，部署应用包时的基本 URL
  // outputDir: process.env.outputDir || 'dist', // 'dist', 生产环境构建文件的目录
  // assetsDir: "", // 相对于outputDir的静态资源(js、css、img、fonts)目录
  configureWebpack: config => {
    const plugins = [];

    if (IS_PROD) {
      // 去除多余css
      // plugins.push(
      //   new PurgecssPlugin({
      //     paths: glob.sync([resolve("./**/*.vue")]),
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
      //   plugins.push(
      //     new UglifyJsPlugin({
      //       uglifyOptions: {
      //         compress: {
      //           warnings: false,
      //           drop_console: true,
      //           drop_debugger: false,
      //           pure_funcs: ["console.log"] //移除console
      //         }
      //       },
      //       sourceMap: false,
      //       parallel: true
      //     })
      //   );
      // 利用splitChunks单独打包第三方模块
      // config.optimization = {
      //   splitChunks: {
      //     cacheGroups: {
      //       libs: {
      //         name: "chunk-libs",
      //         test: /[\\/]node_modules[\\/]/,
      //         priority: 10,
      //         chunks: "initial"
      //       },
      //       elementUI: {
      //         name: "chunk-elementUI",
      //         priority: 20,
      //         test: /[\\/]node_modules[\\/]element-ui[\\/]/,
      //         chunks: "all"
      //       }
      //     }
      //   }
      // };
      // gzip
      // plugins.push(
      //   new CompressionWebpackPlugin({
      //     filename: "[path].gz[query]",
      //     algorithm: "gzip",
      //     test: productionGzipExtensions,
      //     threshold: 10240,
      //     minRatio: 0.8
      //   })
      // );
      // 预加载
      //   plugins.push(
      //     new PrerenderSpaPlugin({
      //       staticDir: resolve("dist"),
      //       routes: ["/"],
      //       postProcess(ctx) {
      //         ctx.route = ctx.originalRoute;
      //         ctx.html = ctx.html.split(/>[\s]+</gim).join("><");
      //         if (ctx.route.endsWith(".html")) {
      //           ctx.outputPath = path.join(__dirname, "dist", ctx.route);
      //         }
      //         return ctx;
      //       },
      //       minify: {
      //         collapseBooleanAttributes: true,
      //         collapseWhitespace: true,
      //         decodeEntities: true,
      //         keepClosingSlash: true,
      //         sortAttributes: true
      //       },
      //       renderer: new PrerenderSpaPlugin.PuppeteerRenderer({
      //         // 需要注入一个值，这样就可以检测页面当前是否是预渲染的
      //         inject: {},
      //         headless: false,
      //         // 视图组件是在API请求获取所有必要数据后呈现的，因此我们在dom中存在“data view”属性后创建页面快照
      //         renderAfterDocumentEvent: "render-event"
      //       })
      //     })
      //   );
      // oss
      // plugins.push(
      //   new AliOssPlugin({
      //     accessKeyId: process.env.ACCESS_KEY_ID,
      //     accessKeySecret: process.env.ACCESS_KEY_SECRET,
      //     region: process.env.REGION,
      //     bucket: process.env.BUCKET,
      //     prefix: process.env.PREFIX,
      //     exclude: /.*\.html$/,
      //     deleteAll: false
      //   })
      // );
    }
    config.externals = {
      vue: "Vue",
      "element-ui": "ELEMENT",
      "vue-router": "VueRouter",
      vuex: "Vuex",
      axios: "axios"
    };
    config.plugins = [...config.plugins, ...plugins];
  },
  chainWebpack: config => {
    // 修复HMR
    config.resolve.symlinks(true);

    const cdn = {
      // 访问https://unpkg.com/element-ui/lib/theme-chalk/index.css获取最新版本
      css: ["//unpkg.com/element-ui@2.10.1/lib/theme-chalk/index.css"],
      js: [
        "//unpkg.com/vue@2.6.10/dist/vue.min.js", // 访问https://unpkg.com/vue/dist/vue.min.js获取最新版本
        "//unpkg.com/vue-router@3.0.6/dist/vue-router.min.js",
        "//unpkg.com/vuex@3.1.1/dist/vuex.min.js",
        "//unpkg.com/axios@0.19.0/dist/axios.min.js",
        "//unpkg.com/element-ui@2.10.1/lib/index.js"
      ]
    };

    config.plugin("html").tap(args => {
      // 修复 Lazy loading routes Error
      args[0].chunksSortMode = "none";
      // html中添加cdn
      // args[0].cdn = cdn;
      return args;
    });

    // 添加别名
    config.resolve.alias
      .set("vue$", "vue/dist/vue.esm.js")
      .set("@", resolve("src"))
      .set("@assets", resolve("src/assets"))
      .set("@scss", resolve("src/assets/scss"))
      .set("@components", resolve("src/components"))
      .set("@plugins", resolve("src/plugins"))
      .set("@views", resolve("src/views"))
      .set("@router", resolve("src/router"))
      .set("@store", resolve("src/store"))
      .set("@layouts", resolve("src/layouts"))
      .set("@static", resolve("src/static"));

    // 压缩图片
    // config.module
    //   .rule("images")
    //   .use("image-webpack-loader")
    //   .loader("image-webpack-loader")
    //   .options({
    //     mozjpeg: { progressive: true, quality: 65 },
    //     optipng: { enabled: false },
    //     pngquant: { quality: "65-90", speed: 4 },
    //     gifsicle: { interlaced: false },
    //     webp: { quality: 75 }
    //   });

    // const types = ["vue-modules", "vue", "normal-modules", "normal"];
    // types.forEach(type =>
    //   addStylusResource(config.module.rule("stylus").oneOf(type))
    // );

    // 打包分析
    if (process.env.IS_ANALYZ) {
      config.plugin("webpack-report").use(BundleAnalyzerPlugin, [
        {
          analyzerMode: "static"
        }
      ]);
    }
    if (IS_PROD) {
      // config.optimization.delete("splitChunks");
    }
    return config;
  },
  css: {
    modules: false,
    extract: IS_PROD,
    sourceMap: false,
    loaderOptions: {
      sass: {
        // 向全局sass样式传入共享的全局变量
        data: `@import "~assets/scss/variables.scss";$src: "${
          process.env.VUE_APP_PUBLIC_PATH
        }";`
      }
    }
  },
  transpileDependencies: [],
  lintOnSave: false,
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: !IS_PROD, // 生产环境的 source map
  parallel: require("os").cpus().length > 1,
  pwa: {},
  devServer: {
    // overlay: { // 让浏览器 overlay 同时显示警告和错误
    //   warnings: true,
    //   errors: true
    // },
    // open: false, // 是否打开浏览器
    // host: "localhost",
    // port: "8080", // 代理断就
    // https: false,
    // hotOnly: false, // 热更新
    proxy: {
      "/api": {
        target:
          "https://www.easy-mock.com/mock/5bc75b55dc36971c160cad1b/sheets", // 目标代理接口地址
        secure: false,
        changeOrigin: true, // 开启代理，在本地创建一个虚拟服务端
        // ws: true, // 是否启用websockets
        pathRewrite: {
          "^/api": "/"
        }
      }
    }
  }
};
```
