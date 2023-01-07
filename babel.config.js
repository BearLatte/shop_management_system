// 项目发布阶段需要用到的 babel 插件
const productionPlugins = ['transform-remove-console']
if (process.env.NODE_ENV === 'production') {
  productionPlugins.push()
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布产品时候的插件数组
    ...productionPlugins,
    // 路由懒加载插件
    '@babel/plugin-syntax-dynamic-import'
  ]
}
