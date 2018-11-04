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
    var touchready = function(cb) {
        var ac = "ontouchend" in document ? 'touchend' : "onpointerdown" in document ? 'pointerup' : "onmspointerdown" in document ? 'MSPointerUp' : 'click';
        var der = _delegate(document, null, ac, function() {
            cb(function() {
                der.destroy();
            });
        });
    }
    var wxcopy = function(e, cb, times) {
        times = times || 1;
        if (times > 3) return cb('fail');
        var uagen = navigator.userAgent.toLowerCase();
        if (/micromessenger/i.test(uagen)) {
            wxready(function() {
                selectE(e);
                var r = ecopy();
                if (!r) return cb();
                wxcopy(e, cb, ++times);
            });
        } else {
            cb('nowx');
        }
    }
    var touchcopy = function(e, cb) {
        var times = 0;
        touchready(function(rcb) {
            selectE(e);
            var r = ecopy();
            if (!r) {
                rcb();
                return cb();
            }
            if (++times > 3) {
                rcb();
                return cb('fail');
            }
        });
    }
    this.copy = function(text, cb) {
        var e = creatFakeElem(text);
        selectE(e);
        var r = ecopy();
        if (!r) return cb();
        wxcopy(e, function(r) {
            if (!r) return cb();
            touchcopy(e, cb);
        });
    }
})();