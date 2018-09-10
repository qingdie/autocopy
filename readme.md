# autocopy.js


## Setup

First, include the script located on the `dist` folder 

```html
<script src="dist/autocopy.min.js"></script>
```
直接写下面的代码，打开网页就自动复制到剪切板，苹果手机需要点击一下屏幕任何位置，微信浏览器里面安卓和苹果直接自动复制，不需要任何操作
```js
clipboard.copy('hello', function(r) {
    console.log(r ? 'fail' : 'success！');
});
```
## License

[MIT License](http://zenorocha.mit-license.org/) © Zeno Rocha
