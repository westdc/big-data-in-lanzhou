(function (mod) {
    if (typeof exports === 'object' && typeof module === 'object') { // CommonJS
        module.exports = mod();
    } else if (typeof define === 'function' && define.amd) { // AMD
        return define([], mod);
    } else { // Plain browser env
        this.PIE = mod();
    }
})(function () {
    "use strict";

    var exports = {};
    var modes = {};

    modes.html = function (data) {
        var content = document.getElementById(data.id);
        content.innerHTML = data.content;
        return content;
    };

    modes.insert = function (data) {
        var content = document.getElementById(data.id);
        content.insertAdjacentHTML(data.pos, data.content);
        return content;
    };

    modes.render = function (data) {
        return PIPE.modes.html(JSON.parse(data));
    };

    exports.on = function (data) {
        return modes[(data.mode || 'html')].call(null, JSON.parse(decodeURIComponent(data)));
    };

    exports.hasClass = function (elem, name) { 
        var pattern = new RegExp('(?:^' + name + '$)|(?: ' + name + ' )|(?: ' + name + '$)|(?: ' + name + ' )');
        return pattern.test(elem.className);
    };

    function addClass(elem, name) {
        if (!exports.hasClass(elem, name)) {
            return elem.className + ' ' + name;
        }
        return elem.className;
    }

    exports.addClass = function (elem, names) {
        if (typeof names === 'string') {
            elem.className = addClass(elem, names);
            return;
        }
        if (names instanceof Array) {
            names.forEach(function (name) {
                elem.className += addClass(elem, name);
            });
        }
    };

    exports.removeClass = function (elem, names) {
        var className = elem.className;
        if (typeof names === 'string') {
            if (exports.hasClass(elem, names)) {
                elem.className = className.replace(names, '').replace(/\s+/g, ' ');
            }
            return;
        }
        if (names instanceof Array) {
            names.forEach(function (name) {
                if (exports.hasClass(elem, name)) {
                    className = className.replace(name, '');
                }
            });
            elem.className = className.replace(/\s+/g, ' ');
        }
    };

    exports.style = function (elem) {
        return elem.currentStyle || document.defaultView.getComputedStyle(elem, null);
    };

    exports.process = function (f, time) {
        var id = null;
        return function () {
            clearTimeout(id);
            id = setTimeout(function () {
                f();
                id = null;
            }, time);
        };
    };

    function ajax(http, method, url, data, f) {
        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                if (http.status >= 200 && http.status < 300 || http.status === 304) {
                    if (typeof f === 'function') {
                        f.call(null, http.responseText);
                    }
                }
            }
        };
        http.open(method, url, true);
        http.send(data);
    };

    exports.ajax = ajax;

    exports.get = function (http, url, f) {
        ajax(http, 'get', url, null, f);
    };

    exports.post = function (http, url, data, f) {
        ajax(http, 'post', url, data, f);
    };

    return exports;
});



