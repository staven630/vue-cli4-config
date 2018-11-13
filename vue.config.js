const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
// const zopfli = require("@gfx/zopfli");
// const BrotliPlugin = require("brotli-webpack-plugin");

const path =  require('path');
const resolve = (dir) => path.join(__dirname, dir);
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

module.exports = {
  baseUrl: './', // 默认'/'，部署应用包时的基本 URL
  outputDir: process.env.outputDir || 'dist', // 'dist', 生产环境构建文件的目录
  assetsDir: '',  // 相对于outputDir的静态资源(js、css、img、fonts)目录
  lintOnSave: false,
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: false,  // 生产环境的 source map
  configureWebpack: config => {
    // config.externals = {
    //   'vue': 'Vue',
    //   'element-ui': 'ELEMENT',
    //   'vue-router': 'VueRouter',
    //   'vuex': 'Vuex',
    //   'axios': 'axios'
    // }
    
    let plugins = [];

    plugins = [
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
      }),
      new CompressionWebpackPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: productionGzipExtensions,
        threshold: 10240,
        minRatio: 0.8
      })
      // Zopfli压缩 https://webpack.js.org/plugins/compression-webpack-plugin/
      // new CompressionWebpackPlugin({
      //   algorithm(input, compressionOptions, callback) {
      //     return zopfli.gzip(input, compressionOptions, callback);
      //   },
      //   compressionOptions: {
      //     numiterations: 15
      //   },
      //   minRatio: 0.99,
      //   test: productionGzipExtensions
      // }),
      // new BrotliPlugin({
      //   test: productionGzipExtensions,
      //   minRatio: 0.99
      // })
    ]
    
    if (IS_PROD) {
      
    }

    config.plugins = [
      ...config.plugins,
      ...plugins
    ]
    

  },
  chainWebpack: config => {
    // 修复HMR
    config.resolve.symlinks(true);

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
      config.plugin('webpack-report')
        .use(BundleAnalyzerPlugin, [{
          analyzerMode: 'static',
        }]);
    }

    

    // 为js添加hash
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
        data: `@import "~assets/scss/variables.scss";$image_src: "${process.env.VUE_APP_IMAGE_PATH}";`
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
    //     path.resolve(__dirname, "./src/styles/global.scss")
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
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  }
};