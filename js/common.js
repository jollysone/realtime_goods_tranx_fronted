const _DEBUG = window.location.href.indexOf('qizhit.com') < 0 && window.location.href.indexOf('neusoft.site') < 0;

const _CONFIG = {
    api: _DEBUG ? 'http://be.socket-shop.lab/' : 'http://be.socket-shop.demo.qizhit.com/',
    websocket: _DEBUG ? 'ws://127.0.0.1:8123' : 'ws://be.socket-shop.demo.qizhit.com:8123',
};

const _APP_TYPES = {
    DOCTOR: 4,
    HOSPITAL: 5,
    HOSPITAL_PANEL: 6,
};

const _USER_ROLES = {
    DOCTOR: 3,
    HOSPITAL: 2,
};

const uEditorConfig = {
    toolbars: [
        [
            'fullscreen', 'source', '|',
            'undo', 'redo', '|',
            'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'pasteplain', '|',
            'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', '|',
            'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
            'paragraph', 'fontfamily', 'fontsize', '|',
            'indent', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
            'touppercase', 'tolowercase', '|',
            'link', 'unlink', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
            /* 'simpleupload', */ 'insertimage', 'map', 'gmap', 'pagebreak', 'template', '|',
            'horizontal', 'date', 'time', 'spechars', '|',
            'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', '|',
            'searchreplace', 'drafts', 'help',
        ],
    ],
    initialFrameHeight: 200,
    serverUrl: _CONFIG.api + 'ueditor/main',
};

<!-- lang: js -->
/**
 * 替换所有匹配exp的字符串为指定字符串
 * @param exp 被替换部分的正则
 * @param newStr 替换成的字符串
 */
String.prototype.replaceAll = function (exp, newStr) {
    return this.replace(new RegExp(exp, "gm"), newStr);
};

/**
 * 原型：字符串格式化
 * @param {Object} args 格式化参数列表
 */
String.prototype.format = function (args) {
    var result = this;
    if (arguments.length < 1) {
        return result;
    }

    var data = arguments; // 如果模板参数是数组
    if (arguments.length == 1 && typeof (args) == "object") {
        // 如果模板参数是对象
        data = args;
    }
    for (var key in data) {
        var value = data[key];
        //      console.log("key:"+key+" value:"+value);
        if (value == undefined) {
            value = '- -';
        }
        if (undefined != value) {
            result = result.replaceAll("\\{" + key + "\\}", value);
        }
    }
    return result;
}

/**
 * 原型：Date类型格式化，形如"2016-01-02 03:04:05"
 */
Date.prototype.format = function (format) {
    /*
     * eg:format="yyyy-MM-dd hh:mm:ss";
     */
    var o = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day
        "h+": this.getHours(), // hour
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
        "S": this.getMilliseconds()
        // millisecond
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 -
            RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

/**
 * 原型：Date 星期
 */
Date.prototype.weekCn = function () {
    return '星期' + ['日', '一', '二', '三', '四', '五', '六'][this.getDay()];
};

/**
 * 请求API(依赖vue-resource)
 * @param method string
 * @param action string
 * @param data {Object}
 * @param onResult {Object}
 */
function _api(method, action, data, onResult) {
    let onProgress = null;

    if (arguments.length >= 6) {
        onProgress = arguments[5];
    }

    let url = _CONFIG.api + action;
    console.log(method + ': ' + url);
    console.log(JSON.stringify(data));

    let res = {
        success: false,
        error_code: -1,
        message: '无法连接服务器'
    };

    let p = null;
    let token = _getStorageStr('token');
    let headers = {};
    if (token) {
        headers = {
            'Auth-Token': token
        };
    }
    if (['post', 'put', 'patch'].indexOf(method) >= 0) {
        p = Vue.http[method](url, data, {
            progress: onProgress,
            headers: headers
        });
    } else {
        if (method === 'get') {
            url = url + '?' + _beautify(data);
            console.log(url);
        }

        p = Vue.http[method](url, {
            body: data,
            progress: onProgress,
            headers: headers
        });
    }

    p.then(function (response) {
        console.log('[OK ] ' + method + ' ' + url);
        // console.log('OK:', JSON.stringify(response.body));
        onResult(response.body);
    }, function (response) {
        console.log('[Err]' + method + ' ' + url);
        if (response.status === 422) {
            onResult(response.body);
        } else {
            onResult(res);
        }
    });
}

/**
 * 以键值对的方式保存字符串或对象
 * @param {String} key 键名
 * @param {Object} content 要保存的字符串或对象
 */
function _save(key, content) {
    if (typeof (content) == "object") {
        typeof (plus) != 'undefined' ? plus.storage.setItem(key, JSON.stringify(content)) : localStorage.setItem(key, JSON.stringify(content));
    } else {
        typeof (plus) != 'undefined' ? plus.storage.setItem(key, content) : localStorage.setItem(key, content);
    }
}

/**
 * 获取保存的字符串
 * @param {String} key 键名
 */
function _getStorageStr(key, defaultValue) {
    if (!defaultValue) {
        defaultValue = null;
    }
    var res = typeof (plus) != 'undefined' ? plus.storage.getItem(key) : localStorage.getItem(key);
    return res === null ? defaultValue : res;
}

/**
 * 获取保存的对象
 * @param {String} key 键名
 */
function _getStorageObj(key, defaultValue) {
    if (!defaultValue) {
        defaultValue = null;
    }
    let res = JSON.parse(typeof (plus) != 'undefined' ? plus.storage.getItem(key) : localStorage.getItem(key));
    return res ? res : defaultValue;
}

/**
 * 移除本地保存的键值对
 * @param {String} key 键名
 */
function _remove(key) {
    typeof (plus) != 'undefined' ? plus.storage.removeItem(key) : localStorage.removeItem(key);
}

/**
 * 合并Object
 * @param {Object} destination
 * @param {Object} source
 */
function _mergeObject(destination, source) {
    for (var i in source) {
        if (typeof (source[i]) != 'undefined') {
            destination[i] = source[i];
        }
    }
    return destination;
}

/**
 * 将以base64的图片url数据转换为Blob
 * @param urlData
 * 用url方式表示的base64图片数据
 */
function _convertBase64UrlToBlob(urlData) {

    var bytes = window.atob(urlData.split(',')[1]); //去掉url的头，并转换为byte

    //处理异常,将ascii码小于0的转换为大于0
    var ab = new ArrayBuffer(bytes.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }

    return new Blob([ab], {
        type: 'image/png'
    });
}

function _beautify(data) {
    let res = '';
    for (let i in data) {
        res += (res.length == 0 ? '' : '&') + i + '=' + data[i];
    }
    return res;
}

function _relocation(href) {
    window.location.href = href;
}

function _logout() {
    _remove('token');
    _remove('user');
    _relocation('./login.html');
}

function _getUrlVars() {
    let vars = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function _getUrlParam(parameter, defaultValue) {
    let urlparameter = defaultValue;
    if (window.location.href.indexOf(parameter) > -1) {
        urlparameter = _getUrlVars()[parameter];
    }
    return decodeURI(urlparameter);
}