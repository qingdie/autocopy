var clipboard = new(function() {
    var weixinJSBridgeReady = function(cb, times) {
        times = times || 1;
        if (times > 10) return cb();
        if (!window.WeixinJSBridge) {
            setTimeout(function() {
                weixinJSBridgeReady(cb, ++times);
            }, 250 * times);
        } else {
            cb();
        }
    }
    var creatFakeElem = function(text) {
        var isRTL = document.documentElement.getAttribute('dir') == 'rtl';
        var fakeElem = document.createElement('textarea');
        fakeElem.style.fontSize = '12pt';
        fakeElem.style.border = '0';
        fakeElem.style.padding = '0';
        fakeElem.style.margin = '0';
        fakeElem.style.position = 'absolute';
        fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
        var yPosition = window.pageYOffset || document.documentElement.scrollTop;
        fakeElem.style.top = yPosition + 'px';
        fakeElem.setAttribute('readonly', '');
        fakeElem.value = text;
        document.body.appendChild(fakeElem);
        return fakeElem;
    }
    var selectE = function(element) {
        var isReadOnly = element.hasAttribute('readonly');
        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }
        var r = element.select();
        r = element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }
        return element.value;
    }
    var ecopy = function(action) {
        action = action || 'copy';
        var succeeded = 0;
        var errmsg = '复制失败！';
        try {
            succeeded = document.execCommand(action);
        } catch (err) {
            succeeded = false;
            errmsg = err;
        }
        return succeeded ? '' : errmsg;
    }
    var wxready = function(cb) {
        weixinJSBridgeReady(function() {
            window.WeixinJSBridge ? window.WeixinJSBridge.invoke("getNetworkType", {}, cb) : cb();
        });
    }
    var listener = function(element, selector, type, callback) {
        return function(e) {
            callback.call(element, e);
        }
    }
    var _delegate = function(element, selector, type, callback, useCapture) {
        var listenerFn = listener.apply(this, arguments);
        element.addEventListener(type, listenerFn, useCapture);
        return {
            destroy: function() {
                element.removeEventListener(type, listenerFn, useCapture);
            }
        }
    }
    var eready = function(cb, times) {
        var uagen = navigator.userAgent.toLowerCase();
        if (/micromessenger/i.test(uagen)) {
            wxready(cb);
        } else if (times == 1) {
            cb();
        } else {
            var ac = "ontouchend" in document ? 'touchend' : "onpointerdown" in document ? 'pointerup' : "onmspointerdown" in document ? 'MSPointerUp' : 'click';
            var der = _delegate(document, null, ac, function() {
                cb(function() {
                    der.destroy();
                });
            });
        }
    }
    this.copy = function(text, cb) {
        eready(function(rcb) {
            var e = creatFakeElem(text);
            selectE(e);
            var r = ecopy();
            if (!r) {
                document.body.removeChild(e);
                cb && cb(r);
                rcb && rcb();
            } else {
                eready(function(retcb) {
                    selectE(e);
                    var r = ecopy();
                    document.body.removeChild(e);
                    cb && cb(r);
                    retcb && retcb();
                });
            }
        }, 1);
    }
})();
clipboard.copy('啦啦啦', function(r) {
    console.log(r ? '失败' : '成功！');
    alert(r ? '失败' : '成功！');
});