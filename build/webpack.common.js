//webpack 性能优化
//1.跟上技术的迭代（node,npm,yarn）
//2.在尽可能少的模块上应用loader（合理使用exclude,include）
//3.plugin尽可能精简并确保可靠性
//4.resolve 参数合理配置
//5.使用DIIPlugin提高打包速度
//（核心就是i.build下新建webpack.dll.js用来把第三方模块单独打包，
//ii.并通过addAssetHtmlWebpackPlugin插件引入到index.html里面，
//iii.webpack.DllReferencePlugin会在第二次及以后的打包时，先去看看dll目录下对应的文件里面是否有第三方模块的映射，
//有的话就不用去node_modules里面再去找再打包了）
//6.控制包文件大小
//比如tree-shaking,split-chunks
//7.tread-loader，happypack多进程打包
//parallel-webpack多页面并行打包
//8.合理使用sourceMap
//9.结合stats分析打包结果
//10.开发环境内存编译，比如开发环境 webapck-dev-server打包时不会生成dist目录，会直接把打包文件放在main.js里面，放在内存肯定会比放在硬盘存取快
//11.开发环境无用插件剔除
const path = require('path');
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const addAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')
const webpack = require('webpack');

const plugins = [
	new HtmlWebpackPlugin({
		template: 'src/index.html'
	}),
	new CleanWebpackPlugin(['dist'], {
		root: path.resolve(__dirname, '../')
	}),
];

const files = fs.readdirSync(path.resolve(__dirname, '../dll'))
files.forEach(file => {
	if (/.*\.dll.js/.test(file)) {
		//addAssetHtmlWebpackPlugin，在html里面加静态文件，
		//这里面是为了把第三方库生成的dll文件引入
		plugins.push(
			new addAssetHtmlWebpackPlugin({
				filepath: path.resolve(__dirname, '../dll', file)
			}),
		)
	}
	if (/.*\.manifest.json/.test(file)) {
		//DllReferencePlugin就是一个DLL引用插件，
		//当我们的文件里面引用第三方模块时，会先去../ dll / vendor.manifest.js找对应模块的映射关系
		//要是在这里找不到才去node_modules里面找
		plugins.push(
			new webpack.DllReferencePlugin({
				manifest: path.resolve(__dirname, '../dll', file)
			})
		)
	}
})
module.exports = {
	entry: {
		main: './src/index.js',
	},
	resolve: {
		//这里也不要写很多，不然耗费时间查找，其他文件比如css就自己写全就行了
		extensions: ['.js', '.jsx'],
		// alias: {
		// 	child: path.resolve(__dirname, '../src/a/b/c/child')
		// }
	},
	module: {
		rules: [{
			test: /\.jsx?$/,
			include: path.resolve(__dirname, '../src'),
			use: [{
				loader: 'babel-loader'
			}]
		}, {
			test: /\.(jpg|png|gif)$/,
			use: {
				loader: 'url-loader',
				options: {
					name: '[name]_[hash].[ext]',
					outputPath: 'images/',
					limit: 10240
				}
			}
		}, {
			test: /\.(eot|ttf|svg)$/,
			use: {
				loader: 'file-loader'
			}
		}]
	},
	plugins,
	optimization: {
		runtimeChunk: {
			name: 'runtime'
		},
		usedExports: true,
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					priority: -10,
					name: 'vendors',
				}
			}
		}
	},
	performance: false,
	output: {
		path: path.resolve(__dirname, '../dist')
	}
}