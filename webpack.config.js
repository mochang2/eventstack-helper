const path = require('path');
const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // VS Code 확장 프로그램은 Node.js 환경에서 실행됩니다
  mode: 'production',
  entry: './src/extension.ts', // 진입점
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // vscode 모듈은 외부에서 제공되므로 번들에 포함하지 않습니다
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    // @vue/compiler-sfc가 사용하지 않는 선택적 템플릿 엔진 의존성들을 무시
    new webpack.IgnorePlugin({
      checkResource(resource, context) {
        // 선택적 템플릿 엔진 모듈들을 무시
        const optionalDeps = [
          'tinyliquid', 'liquid-node', 'jade', 'then-jade', 'dust', 'dustjs-helpers', 
          'dustjs-linkedin', 'swig', 'swig-templates', 'razor-tmpl', 'pug', 'then-pug', 
          'qejs', 'nunjucks', 'arc-templates', 'velocityjs', 'atpl', 'liquor', 'twig', 
          'ejs', 'eco', 'jazz', 'jqtpl', 'hamljs', 'hamlet', 'whiskers', 'haml-coffee', 
          'hogan.js', 'templayed', 'handlebars', 'underscore', 'lodash', 'walrus', 
          'mustache', 'just', 'ect', 'mote', 'toffee', 'dot', 'bracket-template', 
          'ractive', 'htmling', 'babel-core', 'plates', 'react-dom', 'react', 'vash', 
          'slm', 'marko', 'teacup', 'coffee-script', 'squirrelly', 'twing'
        ];
        
        // 모듈 이름만 확인 (경로 제거)
        const moduleName = resource.split('/')[0].split('\\')[0];
        return optionalDeps.includes(moduleName);
      }
    })
  ],
  devtool: false, // 소스맵 비활성화 (용량 절약)
  infrastructureLogging: {
    level: "error" // 로그 레벨 설정
  }
};

module.exports = config;

