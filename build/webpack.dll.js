const path = require('path')
const webpack = require('webpack')
module.exports = {
  mode: 'production',
  entry: {
    vendor: ['lodash'],
    react: ['react', 'react-dom'],
  },
  //将上面的第三方库打包成一个vendor文件，放在dll目录下，
  //并通过library生成一个库，并将这个库以变量[name]的形式暴露出去
  output: {
    filename: '[name].dll.js',
    path: path.resolve(__dirname, '../dll'),
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      //对[name]进行分析（也就是上上面library生成的库），生成的文件放在../dll/[name].manifest.json这个文件里面
      path: path.resolve(__dirname, '../dll/[name].manifest.json')
    })
  ]
}