# 创建项目
### 配置环境变量
&emsp;&emsp;通过在package.json里的scripts配置项中添加--mode xxx来选择不同环境

&emsp;&emsp;在项目根目录中新建.env, .env.production, .env.analyz等文件

&emsp;&emsp;只有以 VUE_APP_ 开头的变量会被 webpack.DefinePlugin 静态嵌入到客户端侧的包中，代码中可以通过process.env.VUE_APP_BASE_API访问

&emsp;&emsp;NODE_ENV 和 BASE_URL 是两个特殊变量，在代码中始终可用

.env serve默认的环境变量
```
NODE_ENV = 'development'
VUE_APP_BASE_API = 'https://demo.cn/api'
```

.env.production build默认的环境变量
```
NODE_ENV = 'production'

VUE_APP_BASE_API = 'https://demo.com/api'
VUE_APP_SRC = 'https://staven.oss-cn-hangzhou.aliyuncs.com/demo'

ACCESS_KEY_ID = ''
ACCESS_KEY_SECRET = ''
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven'
PREFIX = 'demo'
```

.env.analyz 用于webpack-bundle-analyzer打包分析
```
NODE_ENV = 'production'
IS_ANALYZ = 'analyz'

VUE_APP_BASE_API = 'https://demo.com/api'
VUE_APP_SRC = 'https://staven.oss-cn-hangzhou.aliyuncs.com/demo'

ACCESS_KEY_ID = ''
ACCESS_KEY_SECRET = ''
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven'
PREFIX = 'demo'
```
&emsp;&emsp;修改package.json
```
"scripts": {
  "serve": "vue-cli-service serve",
  "build": "vue-cli-service build",
  "analyz": "vue-cli-service build --mode analyz",
  "lint": "vue-cli-service lint"
}
```

# 配置vue.config.js
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

# 配置proxy跨域
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

### 修复HMR(热更新)失效
```$xslt
module.exports = {
    chainWebpack: config => {
        // 修复HMR
        config.resolve.symlinks(true);
    }
}
```

### [修复Lazy loading routes Error： Cyclic dependency](https://github.com/vuejs/vue-cli/issues/1669)
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
        
### 添加别名
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
### 添加打包分析
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
### 配置externals
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

### 去掉console.log
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
##### 方法二：使用babel-plugin-transform-remove-console插件
```$xslt
npm i --save-dev babel-plugin-transform-remove-console
```
在babel.config.js中配置
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

### 开启gzip压缩
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
&emsp;&emsp;还可以开启比gzip体验更好的Zopfli压缩详见[https://webpack.js.org/plugins/compression-webpack-plugin](https://webpack.js.org/plugins/compression-webpack-plugin)
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

### 为sass提供全局样式，以及全局变量
&emsp;&emsp;可以通过在main.js中Vue.prototype.$src = process.env.VUE_APP_SRC;挂载环境变量中的配置信息，然后在js中使用$src访问。

&emsp;&emsp;css中可以使用注入sass变量访问环境变量中的配置信息
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
在scss中引用
```$xslt
.home {
    background: url($src + '/images/500.png');
}
```

# 添加IE兼容
```$xslt
npm i --save @babel/polyfill
```
&emsp;&emsp;在main.js中添加
```$xslt
import '@babel/polyfill';
```
配置babel.config.js
```$xslt
const plugins = [];

module.exports = {
  presets: [["@vue/app",{"useBuiltIns": "entry"}]],
  plugins: plugins
};

```

### 配置文件上传OSS
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
                        enableLog: true,
                        ignoreError: false,
                        deleteMode: false,
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

# 完整配置
* 安装依赖
```$xslt
npm i --save-dev compression-webpack-plugin babel-plugin-transform-remove-console  @gfx/zopfli brotli-webpack-plugin
```
* 环境配置
.env
```
NODE_ENV = 'development'
VUE_APP_BASE_API = 'https://demo.cn/api'
```

.env.production
```
NODE_ENV = 'production'

VUE_APP_BASE_API = 'https://demo.com/api'
VUE_APP_SRC = 'https://staven.oss-cn-hangzhou.aliyuncs.com/demo'

ACCESS_KEY_ID = ''
ACCESS_KEY_SECRET = ''
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven'
PREFIX = 'demo'
```

.env.analyz
```
NODE_ENV = 'production'
IS_ANALYZ = 'analyz'

VUE_APP_BASE_API = 'https://demo.com/api'
VUE_APP_SRC = 'https://staven.oss-cn-hangzhou.aliyuncs.com/demo'

ACCESS_KEY_ID = ''
ACCESS_KEY_SECRET = ''
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven'
PREFIX = 'demo'
```
* package.json 
```$xslt
"scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "analyz": "vue-cli-service build --mode analyz",
    "lint": "vue-cli-service lint"
}
```
* babel.config.js
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
* vue.config.js
````$xslt
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
// const zopfli = require("@gfx/zopfli");
// const BrotliPlugin = require("brotli-webpack-plugin");
const AliOssPlugin = require('webpack-oss');

const path = require('path');
const resolve = (dir) => path.join(__dirname, dir);
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

module.exports = {
    baseUrl: IS_PROD ? process.env.VUE_APP_SRC || '/' : './', // 默认'/'，部署应用包时的基本 URL
    outputDir: process.env.outputDir || 'dist', // 'dist', 生产环境构建文件的目录
    assetsDir: '',  // 相对于outputDir的静态资源(js、css、img、fonts)目录
    lintOnSave: false,
    runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
    productionSourceMap: false,  // 生产环境的 source map

    configureWebpack: config => {
        // cdn引用时配置externals
        // config.externals = {
        //     'vue': 'Vue',
        //     'element-ui': 'ELEMENT',
        //     'vue-router': 'VueRouter',
        //     'vuex': 'Vuex',
        //     'axios': 'axios'
        // }

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
            plugins.push(
                new CompressionWebpackPlugin({
                    filename: '[path].gz[query]',
                    algorithm: 'gzip',
                    test: productionGzipExtensions,
                    threshold: 10240,
                    minRatio: 0.8
                })
            );
            
            // 上传文件到oss
            // if (process.env.ACCESS_KEY_ID || process.env.ACCESS_KEY_SECRET || process.env.REGION || process.env.BUCKET || process.env.PREFIX) {
            //     plugins.push(
            //         new AliOssPlugin({
            //             accessKeyId: process.env.ACCESS_KEY_ID,
            //             accessKeySecret: process.env.ACCESS_KEY_SECRET,
            //             region: process.env.REGION, 
            //             bucket: process.env.BUCKET,
            //             prefix: process.env.PREFIX,    
            //             exclude: /.*\.html$/, 
            //             enableLog: true,
            //             ignoreError: false,
            //             deleteMode: false,
            //             deleteAll: false
            //         })
            //     );
            // }

            // Zopfli压缩，需要响应VC库 https://webpack.js.org/plugins/compression-webpack-plugin/
            // plugins.push(
            //     new CompressionWebpackPlugin({
            //         algorithm(input, compressionOptions, callback) {
            //             return zopfli.gzip(input, compressionOptions, callback);
            //         },
            //         compressionOptions: {
            //             numiterations: 15
            //         },
            //         minRatio: 0.99,
            //         test: productionGzipExtensions
            //     })
            // );
            // plugins.push(
            //     new BrotliPlugin({
            //         test: productionGzipExtensions,
            //         minRatio: 0.99
            //     })
            // );
            config.plugins = [
                ...config.plugins,
                ...plugins
            ];
        }
    },
    chainWebpack: config => {
        // 修复HMR
        config.resolve.symlinks(true);

        // 修复Lazy loading routes Error： Cyclic dependency  [https://github.com/vuejs/vue-cli/issues/1669]
        config.plugin('html').tap(args => {
            args[0].chunksSortMode = 'none';
            return args;
        });

        // 添加别名
        config.resolve.alias
            .set('@', resolve('src'))
            .set('assets', resolve('src/assets'))
            .set('components', resolve('src/components'))
            .set('layout', resolve('src/layout'))
            .set('base', resolve('src/base'))
            .set('static', resolve('src/static'));

        // 打包分析
        if (process.env.IS_ANALYZ) {
            config.plugin('webpack-report')
                .use(BundleAnalyzerPlugin, [{
                    analyzerMode: 'static',
                }]);
        }

        // 多页面配置，为js添加hash
        // config.output.chunkFilename(`js/[name].[chunkhash:8].js`)

        // 修改图片输出路径
        // config.module
        //   .rule('images')
        //   .test(/\.(png|jpe?g|gif|ico)(\?.*)?$/)
        //   .use('url-loader')
        //   .loader('url-loader')
        //   .options({
        //       name: path.join('../assets/', 'img/[name].[ext]')
        //   })

    },
    css: {
        modules: false,
        extract: IS_PROD,
        // 为css后缀添加hash
        // extract: {
        //  filename: 'css/[name].[hash:8].css',
        //  chunkFilename: 'css/[name].[hash:8].css'
        //}，
        sourceMap: false,
        loaderOptions: {
            sass: {
                // 向全局sass样式传入共享的全局变量
                // data: `@import "~assets/scss/variables.scss";$src: "${process.env.VUE_APP_SRC}";`
                data: `$src: "${process.env.VUE_APP_SRC}";`
            },
            // px转换为rem
            // postcss: {
            //   plugins: [
            //     require('postcss-pxtorem')({
            //       rootValue : 1, // 换算的基数
            //       selectorBlackList  : ['weui', 'el'], // 忽略转换正则匹配项
            //       propList   : ['*']
            //     })
            //   ]
            // }
        }
    },
    pluginOptions: {
        // 安装vue-cli-plugin-style-resources-loader插件
        // 添加全局样式global.scss
        // "style-resources-loader": {
        //   preProcessor: "scss",
        //   patterns: [
        //     resolve(__dirname, "./src/scss/scss/variables.scss")
        //   ]
        // }
    },
    parallel: require('os').cpus().length > 1,
    pwa: {},
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
};
````