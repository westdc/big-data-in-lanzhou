# A Markdown Editor

WYSIWYG

更新:[ringring](https://github.com/tulayang/ringring)模块现在重写了amarkdown编辑器的核心事件处理,如果需要编写自定义的markdown编辑器,可以使用[ringring](https://github.com/tulayang/ringring).

###依赖模块

 * [CodeMirror](https://github.com/tulayang/CodeMirror) 编辑代码高亮
 * [marked](https://github.com/chjj/marked)  html解析器
 * [highlight](https://github.com/isagalaev/highlight.js)  html代码高亮
 * [hogan](https://github.com/twitter/hogan.js) 前端模板引擎

###如何使用

在`index.html`中很好的标明了需要引入的css、js文件，以及如何调用AMD.make()构造器。


**导入css文件**

```js
<link type="text/css" rel="stylesheet" href="css/font-awesome/css/font-awesome.css"/>
<link type="text/css" rel="stylesheet" href="css/codemirror.css"/>
<link type="text/css" rel="stylesheet" href="css/highlight/xcode.css"/>
<link type="text/css" rel="stylesheet" href="css/amd.css"/>
<link type="text/css" rel="stylesheet" href="css/markdown.css"/>
```

**导入js文件**

```js
<script src="js/codemirror/lib/codemirror.js"></script>
<script src="js/codemirror/mode/markdown/markdown.js"></script>
<script src="js/amd.js"></script>
<script src="js/amd.hogan.js"></script>
<script src="js/amd.template.js"></script>
<script src="js/amd.marked.js"></script>
<script src="js/amd.highlight.js"></script>
<script src="js/amd.make.js"></script>
```

**调用构造器**

```js
AMD.make('#amd-editor', {
    amdBack: '/',
    amdPubMethod: 'post',
    amdPubAction: '/',
    amdSaveAction: '/',
    amdUploadImgAction: '/image',
    amdInitText: '',
    amdInitTitle: '',
    titleName: 'title',
    textName: 'text'
});
```

**服务器添加图片存储路由, 类似这样的程序**

```js
// 收到图片上传请求
// 保存图片
// 返回保存后图片的路径
```

###AMD.make构造器参数

 * amdUploadImgAction  上传图片的服务器路径
 * amdPubAction  发布按钮点击，文章内容提交的服务器路径
 * titleName  发布标题name值
 * textName  发布内容name值

到目前为止，**a markdown editor**的收尾做的有些仓促。未来还打算增加**mini版本的css**，编辑和预览放入一个控件位置以及增加前端图片格式预判断等。 
还未制作的完毕的部分：上传图片URL直接输入，未来更新。

*[see DEMO]// 已下线*
