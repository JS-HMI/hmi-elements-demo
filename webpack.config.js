const path = require('path');

module.exports = {
  entry: './index.js',
  //entry: './dist/jashmi.js',
  mode : 'production',
   
  module: {
    rules: [
      {
        test: /\.tsx?$/,
      }
    ]
  },
  resolve: {
    extensions: [ '.js' ]
  },
  devtool : "inline-source-map",
  	
  /*output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build/'),
    library: 'jashmi'
  },*/
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/'),
  },
  
   watchOptions: {
    poll: 1000
  }
};






