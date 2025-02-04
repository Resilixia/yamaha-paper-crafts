var WindowEvent;
(function(n) {
    n[n.Load = "load"] = "Load";
    n[n.BeforeUnload = "beforeunload"] = "BeforeUnload";
    n[n.Abort = "abort"] = "Abort";
    n[n.Error = "error"] = "Error"
})(WindowEvent || (WindowEvent = {}));
var AjaxTiming = function() {
        function n(n, t, i, r) {
            var u = this;
            this.getPerformanceTimings = function(n) {
                u.connect = n.connectEnd - n.connectStart;
                u.dns = n.domainLookupEnd - n.domainLookupStart;
                u.duration = n.duration;
                u.load = n.responseEnd - n.responseStart;
                u.wait = n.responseStart - n.requestStart;
                u.start = n.startTime;
                u.redirect = n.redirectEnd - n.redirectStart;
                n.secureConnectionStart && (u.ssl = n.connectEnd - n.secureConnectionStart)
            };
            this.url = n;
            this.method = t;
            this.isAsync = i;
            this.open = r
        }
        return n
    }(),
    ProfilerJsError = function() {
        function n(n, t, i) {
            this.count = 0;
            this.message = n;
            this.url = t;
            this.lineNumber = i
        }
        return n.createText = function(n, t, i) {
            return [n, t, i].join(":")
        }, n.prototype.getText = function() {
            return n.createText(this.message, this.url, this.lineNumber)
        }, n
    }(),
    ProfilerEventManager = function() {
        function n() {
            this.events = [];
            this.hasAttachEvent = !!window.attachEvent
        }
        return n.prototype.add = function(n, t, i) {
            this.events.push({
                type: n,
                target: t,
                func: i
            });
            this.hasAttachEvent ? t.attachEvent("on" + n, i) : t.addEventListener(n, i, !1)
        }, n.prototype.clear = function() {
            for (var n, t = 0, i = this.events; t < i.length; t++) n = i[t], this.hasAttachEvent ? n.target.detachEvent(n.type, n.func) : n.target.removeEventListener(n.type, n.func, !1);
            this.events = []
        }, n
    }(),
    RProfiler = function() {
        function n() {
            function s(n) {
                var t = n.target || n.srcElement;
                return t.nodeType == 3 && (t = t.parentNode), u("N/A", t.src || t.URL, -1), !1
            }
            var n = this,
                u, f, t, i, e;
            this.restUrl = "g.3gl.net/jp/400/v3.0.0/M";
            this.startTime = (new Date).getTime();
            this.version = 2;
            this.info = {};
            this.hasInsight = !1;
            this.data = {
                start: this.startTime,
                jsCount: 0,
                jsErrors: [],
                loadTime: -1,
                loadFired: !1,
                ajax: []
            };
            this.eventManager = new ProfilerEventManager;
            this.startAjaxCapture = function() {
                var i = XMLHttpRequest.prototype,
                    o = i.open,
                    s = i.send,
                    r = [],
                    u = {},
                    e = n.data.ajax,
                    h = 25,
                    f = typeof performance == "object" && typeof window.performance.now == "function" && typeof window.performance.getEntriesByType == "function",
                    t;
                f && typeof window.performance.setResourceTimingBufferSize == "function" && window.performance.setResourceTimingBufferSize(300);
                t = function() {
                    return f ? window.performance.now() : (new Date).getTime()
                };
                i.open = function(n, i, u, f, e) {
                    u === void 0 && (u = !0);
                    this.rpIndex = r.length;
                    r.push(new AjaxTiming(i, n, u, t()));
                    o.call(this, n, i, u, f, e)
                };
                i.send = function(n) {
                    var i = this,
                        c = this.onreadystatechange,
                        o;
                    (this.onreadystatechange = function(n) {
                        var o = r[i.rpIndex],
                            l, s;
                        if (o) {
                            l = i.readyState;
                            switch (l) {
                                case 1:
                                    o.connectionEstablished = t();
                                    break;
                                case 2:
                                    o.requestReceived = t();
                                    break;
                                case 3:
                                    o.processingTime = t();
                                    break;
                                case 4:
                                    o.complete = t();
                                    s = !!(i.response && i.response != null && i.response != undefined);
                                    switch (i.responseType) {
                                        case "text":
                                        case "":
                                            typeof i.responseText == "string" && (o.responseSize = i.responseText.length);
                                            break;
                                        case "json":
                                            s && typeof i.response.toString == "function" && (o.responseSize = i.response.toString().length);
                                            break;
                                        case "arraybuffer":
                                            s && typeof i.response.byteLength == "number" && (o.responseSize = i.response.byteLength);
                                            break;
                                        case "blob":
                                            s && typeof i.response.size == "number" && (o.responseSize = i.response.size)
                                    }(function(n) {
                                        setTimeout(function() {
                                            var r, s, h, c, o;
                                            if (f) {
                                                var i = n.url,
                                                    t = [],
                                                    l = performance.getEntriesByType("resource");
                                                for (r = 0, s = l; r < s.length; r++) h = s[r], h.name == i && t.push(h);
                                                if (e.push(n), t.length != 0) {
                                                    if (u[i] || (u[i] = []), t.length == 1) {
                                                        n.getPerformanceTimings(t[0]);
                                                        u[i].push(0);
                                                        return
                                                    }
                                                    c = u[i];
                                                    for (o in t)
                                                        if (c.indexOf(o) == -1) {
                                                            n.getPerformanceTimings(t[o]);
                                                            c.push(o);
                                                            return
                                                        }
                                                    n.getPerformanceTimings(t[0])
                                                }
                                            }
                                        }, h)
                                    })(o, e)
                            }
                            typeof c == "function" && c.call(i, n)
                        }
                    }, o = r[this.rpIndex], o) && (n && !isNaN(n.length) && (o.sendSize = n.length), o.send = t(), s.call(this, n))
                }
            };
            this.recordPageLoad = function() {
                n.data.loadTime = (new Date).getTime();
                n.data.loadFired = !0
            };
            this.addError = function(t, i, r) {
                var s, f, u, e, o;
                for (n.data.jsCount++, s = ProfilerJsError.createText(t, i, r), f = n.data.jsErrors, u = 0, e = f; u < e.length; u++)
                    if (o = e[u], o.getText() == s) {
                        o.count++;
                        return
                    }
                f.push(new ProfilerJsError(t, i, r))
            };
            this.addInfo = function(t, i, r) {
                if (!n.isNullOrEmpty(t)) {
                    if (n.isNullOrEmpty(r)) n.info[t] = i;
                    else {
                        if (n.isNullOrEmpty(i)) return;
                        n.isNullOrEmpty(n.info[t]) && (n.info[t] = {});
                        n.info[t][i] = r
                    }
                    n.hasInsight = !0
                }
            };
            this.clearInfo = function() {
                n.info = {};
                n.hasInsight = !1
            };
            this.getInfo = function() {
                return n.hasInsight ? n.info : null
            };
            this.eventManager.add(WindowEvent.Load, window, this.recordPageLoad);
            u = this.addError;
            this.startAjaxCapture();
            window.opera ? this.eventManager.add(WindowEvent.Error, document, s) : "onerror" in window && (f = window.onerror, window.onerror = function(n, t, i) {
                return (u(n, t, i), !!f) ? f(n, t, i) : !1
            });
            !window.__cpCdnPath || (this.restUrl = window.__cpCdnPath.trim());
            t = document.createElement("iframe");
            i = t.style;
            i.position = "absolute";
            i.top = "-10000px";
            i.left = "-1000px";
            e = document.getElementsByTagName("script")[0];
            e.parentNode.insertBefore(t, e);
            var o = t.contentWindow.document.open("text/html", "replace"),
                h = window.location.protocol + "//",
                r = '<body onload="';
            r += "function s(u){var d=document,s=d.createElement('script');s.type='text/javascript';s.src=u;d.body.appendChild(s);}";
            r += "s('" + h + this.restUrl + "');";
            r += '"><\/body>';
            o.write(r);
            o.close()
        }
        return n.prototype.isNullOrEmpty = function(n) {
            if (n === undefined || n === null) return !0;
            if (typeof n == "string") {
                var t = n;
                return t.trim().length == 0
            }
            return !1
        }, n.prototype.dispatchCustomEvent = function(n) {
            (function(n) {
                function t(n, t) {
                    t = t || {
                        bubbles: !1,
                        cancelable: !1,
                        detail: undefined
                    };
                    var i = document.createEvent("CustomEvent");
                    return i.initCustomEvent(n, t.bubbles, t.cancelable, t.detail), i
                }
                if (typeof n.CustomEvent == "function") return !1;
                t.prototype = Event.prototype;
                n.CustomEvent = t
            })(window);
            var t = new CustomEvent(n);
            window.dispatchEvent(t)
        }, n
    }(),
    profiler = new RProfiler;
window.RProfiler = profiler;
window.WindowEvent = WindowEvent;
profiler.dispatchCustomEvent("GlimpseLoaded");