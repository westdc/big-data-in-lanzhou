; (function (mod) {
    if (typeof exports === 'object' && typeof module === 'object') { // CommonJS
        mod(require('./pie.js'), 
            require('../codemirror/lib/codemirror.js'),
            require('../highlight-8.1.0.min.js'), 
            require('../marked-0.3.2.min.js'));
    } else if (typeof define === "function" && define.amd) { // AMD
        define(['./pie.js', 
                '../codemirror/lib/codemirror.js', 
                '../highlight-8.1.0.min.js', 
                '../marked-0.3.2.min.js'], mod);
    } else { // Plain browser env
        mod(PIE, CodeMirror, HLJS, MARKED);
    }
})(function (PIE, CodeMirror, HLJS, MARKED) {
    'use strict';

    function validate(vds, val, val2) {
        for (var i = 0, len = vds.length; i < len; i++) {
            if (!vds[i].handler(val, val2)) {
                return vds[i].message;
            }
        }
        return '';
    }

    function notEmpty(val) {
        return typeof val === 'string' && !(/^\s*$/.test(val));
    }

    validate.link = [
    {
        message: '需要输入一个超级链接',
        handler: notEmpty
    }];

    validate.des = [
    {
        message: '需要输入描述',
        handler: notEmpty
    }];

    validate.url = [
    {
        message: '需要输入url',
        handler: notEmpty
    }];

    validate.number = [
    {
        message: '输入值必须是数字',
        handler: function (val) {
            return /^\d{1,}$/.test(val);
        }
    }];

    validate.notEmpty = [
    {
        message: '需要输入值',
        handler: notEmpty
    }];

    // strs name must string
    // strs name count be pattern
    function replaceStr(text, strs) {
        for (var name in strs) {
            text = text.replace(name, strs[name]);
        }
        return text;
    }

    // 选区起始点
    function getPos(head, anchor) {
        var start, end;
        if ((head.line > anchor.line) ||
            ((head.line === anchor.line) && (head.ch > anchor.ch))) {
            start = anchor;
            end = head;
        } else {
            start = head;
            end = anchor;
        }
        return { start: start, end: end };
    }

    function createCodeArea (doc, pos, options) {
        var base = {};

        base.defaultAt = options.defaultAt;
        base.defaultFill = options.defaultFill;
        base.text = doc.getRange(pos.start, pos.end);
        base.spos = {
            start: {
                ch: pos.start.ch,
                line: pos.start.line
            },
            end: {
                ch: pos.end.ch,
                line: pos.end.line
            }
        };
        base.rpos = {
            start: {
                ch: pos.start.ch,
                line: pos.start.line + options.allLineNums
            },
            end: {
                ch: pos.end.ch,
                line: pos.end.line + options.allLineNums
            }
        };
        base.nLineNums = 0;
        base.lineNums = pos.end.line - pos.start.line + 1;
        base.endLineLen = doc.getLine(pos.end.line).length;
        base.prevText = doc.getRange({ ch: 0, line: pos.start.line }, pos.start);
        base.nextText = doc.getRange(pos.end, { ch: base.endLineLen, line: pos.end.line });
        base.prevLineText = doc.getLine(pos.start.line - 1);
        base.nextLineText = doc.getLine(pos.end.line + 1);

        return base;
    }

    // 格式化空白文本区域
    // 换算换行数
    // 移动游标
    function formatWhite (ca) {
        ca.nLineNums -= ca.lineNums - 1;
        ca.text = ca.defaultFill;
        ca.rpos.start.ch = ca.defaultAt;
        ca.rpos.end.ch = ca.defaultFill.length;
        ca.rpos.end.line = ca.rpos.start.line;
    }

    // 格式化非空白单行文本区域
    // 替换首部标志符(如果有的话)
    // 添加首部标志符(如果没有的话)
    function formatSingleLine (ca, pattern, mark) {
        if (pattern.test(ca.text)) {
            ca.text = ca.text.replace(pattern, '');
            ca.rpos.start.ch = 0;
            ca.rpos.end.ch = ca.text.length;
        } else {
            ca.text = mark + ca.text;
            ca.rpos.start.ch = mark.length;
            ca.rpos.end.ch = ca.text.length;
        }
    }

    // 格式化非空白多行文本区域
    // 对每一行使用格式化函数
    function formatMultiLines (ca, f) {
        var texts = ca.text.split('\n');
        texts = texts.map(f);
        ca.text = texts.join('\n');
        ca.rpos.start.ch = 0;
        ca.rpos.end.ch = texts[texts.length - 1].length;
    }

    var white = /^\s*$/;

    // 调整起始行游标新选区
    function adjustLine (ca) {
        if (white.test(ca.prevText)) {
            if (typeof ca.prevLineText === 'string' && !(white.test(ca.prevLineText))) {
                ca.rpos.start.line++;
                ca.rpos.end.line++;
                ca.nLineNums++;
                ca.text = '\n' + ca.text;
            }
        } else {
            ca.rpos.start.line += 2;
            ca.rpos.end.line += 2;
            ca.nLineNums += 2;
            ca.text = '\n\n' + ca.text;
        }

        if (white.test(ca.nextText)) {
            if (typeof ca.nextLineText === 'string' && !white.test(ca.nextLineText)) {
                ca.nLineNums++;
                ca.text = ca.text + '\n';
        }
        } else {
            ca.nLineNums += 2;
            ca.text = ca.text + '\n\n';
        }
    }

    // 重新调整游标位置
    function moveSelection (ca, cm) {
        if (white.test(ca.prevText)) {
            ca.rpos.start.ch = ca.spos.start.ch = 0;
            ca.prevText = '';
        }

        if (white.test(ca.nextText)) {
            ca.rpos.end.ch = ca.spos.end.ch = ca.endLineLen;
            ca.nextText = '';
        }

        cm.addSelection(ca.spos.start, ca.spos.end);
        ca.text = cm.getDoc().getRange(ca.spos.start, ca.spos.end);
    }

    // 重新调整single游标位置
    function moveInblockSelection (ca, cm) {
        ca.rpos.start.ch = ca.spos.start.ch = 0;
        ca.prevText = '';
        ca.rpos.end.ch = ca.spos.end.ch = ca.endLineLen;
        ca.nextText = '';
        cm.addSelection(ca.spos.start, ca.spos.end);
        ca.text = cm.getDoc().getRange(ca.spos.start, ca.spos.end);
    }

    // 重新调整引用游标位置
    function moveBQSelection (ca, cm) {
        if (white.test(ca.prevText) || /^\s{0,3}>\s*$/.test(ca.prevText)) {
            ca.rpos.start.ch = ca.spos.start.ch = 0;
            ca.prevText = '';
        }

        if (white.test(ca.nextText)) {
            ca.rpos.end.ch = ca.spos.end.ch = ca.endLineLen;
            ca.nextText = '';
        }

        cm.addSelection(ca.spos.start, ca.spos.end);
        ca.text = cm.getDoc().getRange(ca.spos.start, ca.spos.end);
    }

    function insert (cm, f) {
        var doc = cm.getDoc();
        var selections = cm.getDoc().listSelections();
        var allLineNums = 0;
        var poses = [];
        var texts = [];
        var result;

        selections.forEach(function (selection, i) {
            result = f(getPos(selection.head, selection.anchor), allLineNums);
            allLineNums += result.nLineNums;
            texts.push(result.text);
            poses.push(result.rpos);
        });

        doc.replaceSelections(texts, 'around');
        doc.setSelections(poses);
        cm.focus();
    }

    function insertBlockquote (cm) {
        function formatBlockquote (ca) {
            // 2. 格式化文本
            if (white.test(ca.text)) {
                // 选区内容是：空白 | 空值
                // 转为单行
                formatWhite(ca);
            } else if (ca.spos.start.line === ca.spos.end.line) {
                // 选取内容是：非空白 & 非空值 & 单行
                formatSingleLine(ca, /^\s{0,3}>\s*/, '> ');
            } else {
                // 选取内容是：非空白 & 非空值 & 多行
                formatMultiLines(ca, function (t) {
                    if (/^\s*$/.test(t)) {
                        return t;
                    }
                    if (/^\s{0,3}>\s*/.test(t)) {
                        return t.replace(/^\s{0,3}>\s*/, '');
                    }
                    return '> ' + t;
                });
            }
        }

        var doc = cm.getDoc();
        insert(cm, function (pos, allLineNums) {
            var ca = createCodeArea(doc, pos, {
                defaultFill: '> Blockquote',
                defaultAt: 2,
                allLineNums: allLineNums
            });

            // 重调游标
            // 起始行前文本内容：空白 | 空值 | 空白>空白, 游标移动到0
            // 结束行后文本内容：空白 | 空值, 游标移动到max
            // 更新移动后的选区
            moveBQSelection(ca, cm);
            formatBlockquote(ca);
            adjustLine(ca);

            return {
                nLineNums: ca.nLineNums,
                rpos: { anchor: ca.rpos.start, head: ca.rpos.end },
                text: ca.text
            };
        });
    }

    function insertCode(cm) {
        function formatCode (ca) {
            if (white.test(ca.text)) {
                // 选区内容是：空白 | 空值
                // 转为单行
                formatWhite(ca);
            } 
            ca.text = '```\n' + ca.text + '\n```';
            ca.rpos.start.ch = ca.defaultAt;
            ca.rpos.end.ch = ca.defaultFill.length;
            ca.rpos.start.line++;
            ca.rpos.end.line++;
            ca.nLineNums += 2;
        }

        var doc = cm.getDoc();
        insert(cm, function (pos, allLineNums) {
            var ca = createCodeArea(doc, pos, {
                defaultFill: 'Code here',
                defaultAt: 0,
                allLineNums: allLineNums
            });

            moveSelection(ca, cm);
            formatCode(ca);
            adjustLine(ca);

            return {
                nLineNums: ca.nLineNums,
                rpos: { anchor: ca.rpos.start, head: ca.rpos.end },
                text: ca.text
            };
        });
    }

    // insert inblock
    // 起始点向前查找到0位置, 结束点向后查找到行末位置
    // 重新调整为新的选区
    // start: startLine, 0
    // end  : endLine, max
    // 获取新选区内容
    // 计算新选区内的行数\n => ns
    // 去除新选区内容前后空白符 => trim()
    // 1. 新选区内容为空白
    //    选取内容重设为"# Heading"
    // 2. 新选区内容为非空白
    //    多空白符转换为" " => /\s+/
    //    格式化, 并设置标识符位置:
    //    a. ^\s*#\s*#\s*#\s*#\s*->^x, m = 0
    //    a. ^\s*#\s*#\s*#\s*->^#### x, m = 5
    //    a. ^\s*#\s*#\s*->^### x, m = 4
    //    a. ^\s*#\s*->^## x, m = 3
    //    a. ^# x, m = 2
    // 替换选区
    // 设置选区: start: startLine - ns, m; end: startLine - ns, 新选区长度; 
    function insertInblock(cm, defaultFill, at, markf) {
        function formatInblock (ca) {
            ca.text = ca.text.trim().replace(/\s+/g, ' ');
            ca.nLineNums -= ca.lineNums - 1;
            ca.rpos.end.line = ca.rpos.start.line;

            if (white.test(ca.text)) {
                ca.text = ca.defaultFill;
                ca.rpos.start.ch = ca.defaultAt; 
                ca.rpos.end.ch = ca.text.length;
            } else {
                var mark = markf(ca.text);
                ca.text = mark.text;
                ca.rpos.start.ch = mark.at;
                ca.rpos.end.ch = ca.text.length;
            } 
        }

        var doc = cm.getDoc();
        insert(cm, function (pos, allLineNums) {
            var doc = cm.getDoc();
            var ca = createCodeArea(doc, pos, {
                defaultFill: defaultFill,
                defaultAt: at,
                allLineNums: allLineNums
            });

            moveInblockSelection(ca, cm);
            formatInblock(ca);
            adjustLine(ca);

            return {
                nLineNums: ca.nLineNums,
                rpos: { anchor: ca.rpos.start, head: ca.rpos.end },
                text: ca.text
            };
        });
    }

    function insertHeader(cm) {
        var HEADER = '# Heading';

        function replace(text) {
            if (/^\s*#\s*#\s*#\s*#\s*/.test(text)) {
                return {
                    text: text.replace(/^\s*#\s*#\s*#\s*#\s*/, ''),
                    at: 0
                };
            } else if (/^\s*#\s*#\s*#\s*/.test(text)) {
                return {
                    text: text.replace(/^\s*#\s*#\s*#\s*/, '#### '),
                    at: 5
                };
            } else if (/^\s*#\s*#\s*/.test(text)) {
                return {
                    text: text.replace(/^\s*#\s*#\s*/, '### '),
                    at: 4
                };
            } else if (/^\s*#\s*/.test(text)) {
                return {
                    text: text.replace(/^\s*#\s*/, '## '),
                    at: 3
                };
            } else {
                return {
                    text: '# ' + text,
                    at: 2
                };
            }
        }

        insertInblock(cm, HEADER, 2, replace);
    }

    function insertUItem(cm) {
        var ITEM = '* Item';

        function replace(text) {
            if (/^\s*\*\s+/.test(text)) {
                return {
                    text: text.replace(/^\s*\*\s+/, ''),
                    at: 0
                };
            } else {
                return {
                    text: '* ' + text,
                    at: 2
                };
            }
        }

        insertInblock(cm, ITEM, 2, replace);
    }

    function insertLine(cm) { 
        function formatLine (ca) {
            ca.text = ca.defaultFill;
            ca.nLineNums -= ca.lineNums - 1;
            ca.rpos.end.line = ca.rpos.start.line;
            ca.rpos.start.ch = ca.text.length; 
            ca.rpos.end.ch = ca.text.length;
        }

        var doc = cm.getDoc();
        insert(cm, function (pos, allLineNums) {
            var doc = cm.getDoc();
            var ca = createCodeArea(doc, pos, {
                defaultFill: '----------',
                defaultAt: 0,
                allLineNums: allLineNums
            });

            moveSelection (ca, cm);
            formatLine(ca);
            adjustLine(ca);

            return {
                nLineNums: ca.nLineNums,
                rpos: { anchor: ca.rpos.start, head: ca.rpos.end },
                text: ca.text
            };
        });
    }

    // 起点所在行内前m个字符
    function getPt(lineText, start, m) {
        var c, result = '';
        for (var i = 1; i <= m; i++) {
            var c = lineText.charAt(start.ch - i);
            result += (typeof c === 'string' ? c : '');
        }
        return result;
    }

    // 起点所在行内后m个字符
    function getNt(lineText, end, m) {
        var c, result = '';
        for (var i = 0; i < m; i++) {
            var c = lineText.charAt(end.ch + i);
            result += (typeof c === 'string' ? c : '');
        }
        return result;
    }

    // mark: ** *
    // des: String
    function insertEm(cm, mark, des) {
        var markLen = mark.length;
        var doc = cm.getDoc();

        function formatEm (ca, pt, nt) {
            ca.text = ca.text.trim().replace(/\s+/g, ' ');
            ca.nLineNums -= ca.lineNums - 1;
            ca.rpos.start.line = ca.rpos.end.line;

            if (!(pt === mark && nt === mark)) {
                ca.text = mark + ((ca.text.length === 0) ? des : ca.text) + mark;
                ca.rpos.start.ch += markLen;
                ca.rpos.end.ch = ca.rpos.start.ch + ca.text.length - 2 * markLen;
            } else {
                ca.rpos.start.ch -= markLen;
                ca.rpos.end.ch = ca.rpos.start.ch + ca.text.length;
            }
        }

        function moveEmSelection (ca, cm, pt, nt) {
            if (pt === mark && nt === mark) {
                ca.spos.start.ch -= markLen;
                ca.spos.end.ch += markLen;
                cm.addSelection(ca.spos.start, ca.spos.end);
            } 
        }

        insert(cm, function (pos, allLineNums) {
            var ca = createCodeArea(doc, pos, {
                defaultFill: mark + des + mark,
                defaultAt: markLen,
                allLineNums: allLineNums
            });
            var pt = getPt(doc.getLine(pos.start.line), pos.start, markLen);
            var nt = getNt(doc.getLine(pos.end.line), pos.end, markLen);

            formatEm(ca, pt, nt);
            moveEmSelection(ca, cm, pt, nt);

            return {
                nLineNums: ca.nLineNums,
                rpos: { anchor: ca.rpos.start, head: ca.rpos.end },
                text: ca.text
            };
        });
    }

    function insertImg(cm, src, alt, width, height, align) {
        var cmdoc = cm.getDoc();
        // '![{{alt}}]({{src}})'
        var IMG = '<img width="{{width}}" height="{{height}}" class="{{align}}" src="{{src}}" alt="{{alt}}" />';
        var content = replaceStr(IMG, {
            '{{src}}': src,
            '{{alt}}': alt,
            '{{width}}': width,
            '{{height}}': height,
            '{{align}}': align
        });
        cmdoc.replaceSelection(content, 'end');
        cm.focus();
    }

    function insertLink(cm, href, des) {
        var cmdoc = cm.getDoc();
        var LINK = '[{{des}}]({{href}})';
        var content = replaceStr(LINK, {
            '{{des}}': des,
            '{{href}}': href
        });
        // 'around' | 'start' | 'end'
        cmdoc.replaceSelection(content, 'end');
        cm.focus();
    }

    function makeClose(elem, container, shade, f) {
        function close() {
            container.style.display = 'none';
            shade.style.display = 'none';

            if (typeof f === 'function') { f(); }
        }

        elem.addEventListener('click', function () {
            close();
        }, false);

        document.addEventListener('keyup', function (e) {
            if (PIE.style(shade).display === 'block' && PIE.style(container).display === 'block' && e.keyCode === 27) {
                close();
            }
        }, false);
    }

    function makeLink(elems, f) {
        var showButton = elems.showButton,
            linkInput = elems.linkInput,
            desInput = elems.desInput,
            addButton = elems.addButton,
            closeButton = elems.closeButton,
            container = elems.container,
            shade = elems.shade;

        showButton.addEventListener('click', function () {
            container.style.display = 'block';
            shade.style.display = 'block';
        }, false);

        addButton.addEventListener('click', function () {
            var link = linkInput.value,
                des = desInput.value,
                linkMsg = validate(validate.link, link),
                desMsg = validate(validate.des, des),
                pass = true;

            if (linkMsg !== '') {
                pass = false;
                PIE.addClass(linkInput, 'amd-invalid');
            }
            if (desMsg !== '') {
                pass = false;
                PIE.addClass(desInput, 'amd-invalid');
            }
            if (!pass) {
                return;
            }

            shade.style.display = 'none';
            container.style.display = 'none';
            linkInput.value = '';
            desInput.value = '';
            f.call(null, link, des);
        }, false);

        linkInput.addEventListener('focus', function () {
            PIE.removeClass(linkInput, 'amd-invalid');
        }, false);

        desInput.addEventListener('focus', function () {
            PIE.removeClass(desInput, 'amd-invalid');
        }, false);

        document.addEventListener('keyup', function (e) {
            if (PIE.style(shade).display === 'block' && PIE.style(container).display === 'block' && e.keyCode === 13) {
                addButton.click();
            }
        }, false);

        makeClose(closeButton, container, shade, function () {
            PIE.removeClass(linkInput, 'amd-invalid');
            PIE.removeClass(desInput, 'amd-invalid');
        });
    }

    function makeImg(elems, action, f) {
        var showButton = elems.showButton,
            urlInput = elems.urlInput,
            altInput = elems.altInput,
            widthInput = elems.widthInput,
            heightInput = elems.heightInput,
            alignInput = elems.alignInput,
            alignInputLinks = Array.prototype.slice.call(alignInput.querySelectorAll('a'), 0),
            view = elems.view,
            viewContent = view.querySelector('.amd-view-content'),
            addButton = elems.addButton,
            closeButton = elems.closeButton,
            container = elems.container,
            shade = elems.shade,
            uploadForm = view.querySelector('form'),
            uploadFile = view.querySelector('input[type=file]'),
            action = action, //view.getAttribute('data-action'),
            beChange = false,
            beLoading = false,
            aligns = ['amd-left', 'amd-center', 'amd-right'],
            align = aligns['1'];

        function activeAlign (pos) {
            alignInputLinks.forEach(function (item, i) { 
                PIE.removeClass(item, 'amd-active');
            });
            PIE.addClass(alignInputLinks[pos], 'amd-active');
            align = aligns[pos];
        }

        // 当取消和添加后, 清空内容, 回复初始值
        function clear() {
            shade.style.display = 'none';
            container.style.display = 'none';
            urlInput.disabled = false;
            urlInput.value = '';
            widthInput.value = '';
            heightInput.value = '';
            activeAlign(1);
            PIE.removeClass(urlInput, 'amd-invalid');
            altInput.value = '';
            viewContent.style.backgroundImage = '';
            beChange = false;
            beLoading = false;
        }

        alignInput.addEventListener('click', function (e) {
            var target = e.target; 
            for (var i = 0, len = alignInputLinks.length; i < len; i ++) {
                if (alignInputLinks[i].contains(target)) {
                    activeAlign(i);
                    break;
                }
            }
        }, false);

        showButton.addEventListener('click', function () {
            container.style.display = 'block';
            shade.style.display = 'block';
        }, false);

        addButton.addEventListener('click', function () {
            var src = urlInput.value,
                alt = altInput.value,
                width = parseInt(widthInput.value),
                height = parseInt(heightInput.value),
                urlMsg = validate(validate.url, src),
                pass = true;

            if (urlMsg !== '') {
                pass = false;
                PIE.addClass(urlInput, 'amd-invalid');
            }
            if (PIE.hasClass(urlInput, 'amd-invalid')) {
                return;
            }


            f(src, 
              alt === '' ? 'screenshot' : alt, 
              (!isNaN(width) && width > 0) ? width : '', 
              (!isNaN(height) && height >= 0) ? height : '', 
              align);

            clear();
        }, false);

        document.addEventListener('keyup', function (e) {
            if (PIE.style(shade).display === 'block' && PIE.style(container).display === 'block' && e.keyCode === 13) {
                addButton.click();
            }
        }, false);

        urlInput.addEventListener('focus', function () {
            PIE.removeClass(urlInput, 'amd-invalid');
        }, false);

        urlInput.addEventListener('keyup', function () {
            viewContent.style.backgroundImage = 'url(' + urlInput.value + ')';
            viewContent.style.backgroundSize = 'auto 200px';
        }, false);

        makeClose(closeButton, container, shade, function () {
            // 清空设置
            clear();
        });

        viewContent.addEventListener('click', function () {
            // 正在加载时, 不允许再次添加图片
            if (beLoading) {
                return;
            }
            // 用户添加图片
            uploadFile.click();
        }, false);

        uploadFile.addEventListener('change', function () {
            // 正在替换
            beChange = true;
            // 正在加载
            beLoading = true;
            // 锁定URL输入框
            urlInput.disabled = true;
            // 加载动画
            viewContent.style.backgroundSize = '100px 100px';
            viewContent.style.backgroundImage = 'url(/img/loading.gif)';
            PIE.post(new XMLHttpRequest(), action, new FormData(uploadForm), function (data) {
                // 如果用户中止，则不设置图片
                if (beChange) {
                    // 替换完成
                    beChange = false;
                    // 加载完成
                    beLoading = false;
                    //上传文件类型错误
                    if (data === 'UPLOAD_TYPE_ERROR') {
                        urlInput.value = '图片文件必须是 JPG | JPEG | PNG | GIF 类型.';
                        PIE.addClass(urlInput, 'amd-invalid');
                        viewContent.style.backgroundImage = '';
                        return;
                    }
                    urlInput.disabled = false;
                    // URL输入框设置
                    urlInput.value = data;
                    viewContent.style.backgroundImage = 'url(' + data + ')';
                    viewContent.style.backgroundSize = 'auto 200px';
                }
            });
        }, false);
    }

    function encode(name, value) {
        return encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }

    function makeSave(cm, elems, options, f) {
        var saveButton = elems.saveButton,
            saveButtonSave = elems.saveButtonSave,
            saveButtonSpinner = elems.saveButtonSpinner,
            title = elems.title,
            codeMirror = elems.codeMirror,
            data = encode(options.titleName, options.titleValue) + '&' +
                   encode(options.textName, options.textValue),
            saving = false;

        saveButton.addEventListener('click', function () {
            if (saving) { return; }

            var titleMsg = validate(validate.notEmpty, title.value),
                textMsg = validate(validate.notEmpty, cm.getDoc().getValue()),
                pass = true;
            if (titleMsg !== '') {
                pass = false;
                PIE.addClass(title, 'amd-invalid');
            }
            if (textMsg !== '') {
                pass = false;
                PIE.addClass(codeMirror, 'amd-invalid');
            }
            if (!pass) {
                return;
            }

            PIE.addClass(saveButton, 'saving');
            saveButtonSave.style.display = 'none';
            saveButtonSpinner.style.display = 'inline-block';
            saving = true;
            PIE.post(new XMLHttpRequest(), options.action, data, function (resText) {
                if (resText !== 'SAVE_OK') {
                    return;
                }
                PIE.removeClass(saveButton, 'saving');
                saving = false;
                saveButtonSave.style.display = 'inline-block';
                saveButtonSpinner.style.display = 'none';
            });
        }, false);
    }

    // options: {
    //     initData
    //     pubAction
    //     titleName
    //     textName
    // }
    PIE.makeAMarkdown = function (parent, options) { 
        parent.innerHTML = PIE.unit["amd"].render({
            amdBack            : options.admBack || '/',
            amdPubMethod       : options.amdPubMethod || 'post',
            amdPubAction       : options.amdPubAction || '/',
            amdSaveAction      : options.amdSaveAction || '/',
            amdUploadImgAction : options.amdUploadImgAction || '/',
            amdInitText        : options.amdInitText || '',
            amdInitTitle       : options.amdInitTitle || ''
        }); 
        // '.amd'
        var AMarkDown = parent.querySelector('.amd'),
            pubForm = AMarkDown.querySelector('.amd-pub'),
            title = AMarkDown.querySelector('.amd-pub .amd-input-title input'),
            textarea = AMarkDown.querySelector('.amd-pub > textarea'),
            preview = AMarkDown.querySelector('.amd-preview'),
            linkButton = AMarkDown.querySelector('.amd-edit-btn-link'),
            imgButton = AMarkDown.querySelector('.amd-edit-btn-img'),
            lineButton = AMarkDown.querySelector('.amd-edit-btn-line'),
            headerButton = AMarkDown.querySelector('.amd-edit-btn-header'),
            strongButton = AMarkDown.querySelector('.amd-edit-btn-strong'),
            italicButton = AMarkDown.querySelector('.amd-edit-btn-italic'),
            uitemButton = AMarkDown.querySelector('.amd-edit-btn-ul'),
            codeButton = AMarkDown.querySelector('.amd-edit-btn-code'),
            blockquoteButton = AMarkDown.querySelector('.amd-edit-btn-blockquote'),
            editSaveButton = AMarkDown.querySelector('.amd-edit-btn-save'),
            shade = AMarkDown.querySelector('.amd-shade'),
            addLinkContainer = AMarkDown.querySelector('.amd-panel-link'),
            addLinkButton = AMarkDown.querySelector('.amd-panel-link .amd-btn-ok'),
            addLinkInput = AMarkDown.querySelector('.amd-panel-link .amd-input-link input[type=text]'),
            addLinkDesInput = AMarkDown.querySelector('.amd-panel-link .amd-input-des input[type=text]'),
            addLinkMsgSpan = AMarkDown.querySelector('.amd-panel-link .amd-input-link .amd-input-msg'),
            addLinkDesMsgSpan = AMarkDown.querySelector('.amd-panel-link .amd-input-des .amd-input-msg'),
            addLinkCloseButton = AMarkDown.querySelector('.amd-panel-link .amd-btn-close'),
            addImgContainer = AMarkDown.querySelector('.amd-panel-img'),
            addImgButton = AMarkDown.querySelector('.amd-panel-img .amd-btn-ok'),
            addImgView = AMarkDown.querySelector('.amd-panel-img .amd-view'),
            addImgURLInput = AMarkDown.querySelector('.amd-panel-img .amd-input-url input[type=text]'),
            addImgAltInput = AMarkDown.querySelector('.amd-panel-img .amd-input-alt input[type=text]'),
            addImgWidthInput = AMarkDown.querySelector('.amd-panel-img .amd-input-width input[type=text]'),
            addImgHeightInput = AMarkDown.querySelector('.amd-panel-img .amd-input-height input[type=text]'),            
            addImgAlignInput = AMarkDown.querySelector('.amd-panel-img .amd-input-align .amd-input-align-body'),
            addImgURLMsgSpan = AMarkDown.querySelector('.amd-panel-img .amd-input-url .amd-input-msg'),
            addImgCloseButton = AMarkDown.querySelector('.amd-panel-img .amd-btn-close'),
            saveButton = AMarkDown.querySelector('.amd-edit-btn-save'),
            saveButtonSave = saveButton.querySelector('.fa-save'),
            saveButtonSpinner = saveButton.querySelector('.fa-spinner'),
            arrowLeftButton = AMarkDown.querySelector('.amd-arrow-left'),
            arrowRightButton = AMarkDown.querySelector('.amd-arrow-right'),
            leftCol = AMarkDown.querySelector('.amd-col:first-child'),
            rightCol = AMarkDown.querySelector('.amd-col:last-child'),
            initData = AMarkDown.getAttribute('data-init-data'),

            cm = CodeMirror.fromTextArea(textarea, {
                styleActiveLine: true, //line选择是是否加亮
                lineNumbers: true,  //是否显示行数
                lineWrapping: true  //是否自动换行
            }),

            codeMirror = AMarkDown.querySelector('.amd-pub .CodeMirror'),
            codeMirrorText = codeMirror.querySelector('textarea');

        //pubForm.action = options.pubAction;
        //title.name     = options.titleName;
        //textarea.name  = options.textName;

        // 配置marked解析器
        MARKED.setOptions({
            highlight: function (code) {
                return HLJS.highlightAuto(code).value;
            },
            breaks: true,
            sanitize: false
        });

        cm.on('change', function (cm, change) {
            MARKED(cm.getDoc().getValue(), function (err, html) {
                preview.innerHTML = html;
            });
        });

        pubForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var titleMsg = validate(validate.notEmpty, title.value),
                textMsg = validate(validate.notEmpty, cm.getDoc().getValue()),
                pass = true;
            if (titleMsg !== '') {
                pass = false;
                PIE.addClass(title, 'amd-invalid');
            }
            if (textMsg !== '') {
                pass = false;
                PIE.addClass(codeMirror, 'amd-invalid');
            }
            if (!pass) {
                return;
            }
            pubForm.submit();
        }, false);

        title.addEventListener('focus', function () {
            PIE.removeClass(title, 'amd-invalid');
        }, false);

        codeMirrorText.addEventListener('focus', function () {
            PIE.removeClass(codeMirror, 'amd-invalid');
        }, false);

        arrowLeftButton.addEventListener('click', function () {
            var width = AMarkDown.clientWidth;
            var lleft = parseInt(PIE.style(leftCol).left) / width;
            var rleft = parseInt(PIE.style(rightCol).left) / width;

            if (width < 880) {
                if (lleft === -1 && rleft === 0) {
                    leftCol.style.left = '0';
                    leftCol.style.width = '100%';
                    rightCol.style.left = '100%';
                    rightCol.style.width = '100%';
                }
            } else {
                if (lleft >= -0.5 && rleft === 0) {
                    leftCol.style.left = '0';
                    leftCol.style.width = '50%';
                    rightCol.style.left = '50%';
                    rightCol.style.width = '50%';
                } else if (lleft === 0 && rleft <= 0.5) {
                    leftCol.style.left = '0';
                    leftCol.style.width = '100%';
                    rightCol.style.left = '100%';
                    rightCol.style.width = '50%';
                }
            }
        }, false);

        arrowRightButton.addEventListener('click', function () {
            var width = AMarkDown.clientWidth;
            var lleft = parseInt(PIE.style(leftCol).left) / width;
            var rleft = parseInt(PIE.style(rightCol).left) / width;

            if (width < 880) {
                if (lleft === 0 && rleft === 1) {
                    leftCol.style.left = '-100%';
                    leftCol.style.width = '100%';
                    rightCol.style.left = '0';
                    rightCol.style.width = '100%';
                }
            } else {
                if (lleft === 0 && rleft === 1) {
                    leftCol.style.left = '0';
                    leftCol.style.width = '50%';
                    rightCol.style.left = '50%';
                    rightCol.style.width = '50%';
                } else if (lleft === 0 && rleft <= 0.5) {
                    leftCol.style.left = '-50%';
                    leftCol.style.width = '50%';
                    rightCol.style.left = '0';
                    rightCol.style.width = '100%';
                }
            }
        }, false);

        var resizef = PIE.process(function () {
            var width = AMarkDown.clientWidth;

            if (width < 880) {
                leftCol.style.left = '0';
                leftCol.style.width = '100%';
                rightCol.style.left = '100%';
                rightCol.style.width = '100%';
            } else {
                leftCol.style.left = '0';
                leftCol.style.width = '50%';
                rightCol.style.left = '50%';
                rightCol.style.width = '50%';
            }
        }, 100);

        window.addEventListener('resize', resizef, false);

        lineButton.addEventListener('click', function () {
            insertLine(cm);
        }, false);

        headerButton.addEventListener('click', function () {
            insertHeader(cm);
        }, false);

        uitemButton.addEventListener('click', function () {
            insertUItem(cm);
        }, false);

        strongButton.addEventListener('click', function () {
            insertEm(cm, '**', 'strong text');
        }, false);

        italicButton.addEventListener('click', function () {
            insertEm(cm, '*', 'italic text');
        }, false);

        blockquoteButton.addEventListener('click', function () {
            insertBlockquote(cm);
        }, false);

        codeButton.addEventListener('click', function () {
            insertCode(cm);
        }, false);

        makeLink({
            showButton: linkButton,
            linkInput: addLinkInput,
            desInput: addLinkDesInput,
            addButton: addLinkButton,
            closeButton: addLinkCloseButton,
            container: addLinkContainer,
            shade: shade
        }, function (link, des) {
            insertLink(cm, link, des);
        });

        makeImg({
            showButton: imgButton,
            urlInput: addImgURLInput,
            altInput: addImgAltInput,
            widthInput: addImgWidthInput,
            heightInput: addImgHeightInput,
            alignInput: addImgAlignInput,
            view: addImgView,
            addButton: addImgButton,
            closeButton: addImgCloseButton,
            container: addImgContainer,
            shade: shade
        }, addImgView.getAttribute('data-action'), function (src, alt, width, height, align) {
            insertImg(cm, src, alt, width, height, align);
        });

        makeSave(cm, {
            saveButton: saveButton,
            saveButtonSave: saveButtonSave,
            saveButtonSpinner: saveButtonSpinner,
            title: title,
            codeMirror: codeMirror
        }, {
            titleName: title.name,
            titleValue: title.value,
            textName: textarea.name,
            textValue: textarea.value,
            action: editSaveButton.getAttribute('data-action')
        });

        cm.getDoc().setValue(initData);
    };
});


