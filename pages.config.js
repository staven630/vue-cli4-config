module.exports = {
  'main': {
    template: 'public/index.html',
    filename: 'index.html',
    title: '主页',
    chunks: ['chunk-vendors', 'chunk-common', 'index']
  },
  'pages/admin': {
    template: 'public/index.html',
    filename: 'admin.html',
    title: '后台管理',
    chunks: ['chunk-vendors', 'chunk-common', 'index']
  },
  'pages/mobile': {
    template: 'public/index.html',
    filename: 'mobile.html',
    title: '移动端',
    chunks: ['chunk-vendors', 'chunk-common', 'index']
  }
}