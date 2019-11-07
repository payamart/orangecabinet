! function() {
    function initTest() {
        options.keyboardSupport && addEvent("keydown", keydown)
    }

    function init() {
        if (!initDone && document.body) {
            initDone = !0;
            var body = document.body,
                html = document.documentElement,
                windowHeight = window.innerHeight,
                scrollHeight = body.scrollHeight;
            if (root = document.compatMode.indexOf("CSS") >= 0 ? html : body, activeElement = body, initTest(), top != self) isFrame = !0;
            else if (scrollHeight > windowHeight && (body.offsetHeight <= windowHeight || html.offsetHeight <= windowHeight)) {
                var fullPageElem = document.createElement("div");
                fullPageElem.style.cssText = "position:absolute; z-index:-10000; top:0; left:0; right:0; height:" + root.scrollHeight + "px", document.body.appendChild(fullPageElem);
                var pendingRefresh;
                refreshSize = function() {
                    pendingRefresh || (pendingRefresh = setTimeout(function() {
                        isExcluded || (fullPageElem.style.height = "0", fullPageElem.style.height = root.scrollHeight + "px", pendingRefresh = null)
                    }, 500))
                }, setTimeout(refreshSize, 10), addEvent("resize", refreshSize);
                var config = {
                    attributes: !0,
                    childList: !0,
                    characterData: !1
                };
                if (observer = new MutationObserver(refreshSize), observer.observe(body, config), root.offsetHeight <= windowHeight) {
                    var clearfix = document.createElement("div");
                    clearfix.style.clear = "both", body.appendChild(clearfix)
                }
            }
            options.fixedBackground || isExcluded || (body.style.backgroundAttachment = "scroll", html.style.backgroundAttachment = "scroll")
        }
    }

    function cleanup() {
        observer && observer.disconnect(), removeEvent(wheelEvent, wheel), removeEvent("mousedown", mousedown), removeEvent("keydown", keydown), removeEvent("resize", refreshSize), removeEvent("load", init)
    }

    function scrollArray(elem, left, top) {
        if (directionCheck(left, top), 1 != options.accelerationMax) {
            var now = Date.now(),
                elapsed = now - lastScroll;
            if (elapsed < options.accelerationDelta) {
                var factor = (1 + 50 / elapsed) / 2;
                factor > 1 && (factor = Math.min(factor, options.accelerationMax), left *= factor, top *= factor)
            }
            lastScroll = Date.now()
        }
        if (que.push({
                x: left,
                y: top,
                lastX: 0 > left ? .99 : -.99,
                lastY: 0 > top ? .99 : -.99,
                start: Date.now()
            }), !pending) {
            var scrollWindow = elem === document.body,
                step = function(time) {
                    for (var now = Date.now(), scrollX = 0, scrollY = 0, i = 0; i < que.length; i++) {
                        var item = que[i],
                            elapsed = now - item.start,
                            finished = elapsed >= options.animationTime,
                            position = finished ? 1 : elapsed / options.animationTime;
                        options.pulseAlgorithm && (position = pulse(position));
                        var x = item.x * position - item.lastX >> 0,
                            y = item.y * position - item.lastY >> 0;
                        scrollX += x, scrollY += y, item.lastX += x, item.lastY += y, finished && (que.splice(i, 1), i--)
                    }
                    scrollWindow ? window.scrollBy(scrollX, scrollY) : (scrollX && (elem.scrollLeft += scrollX), scrollY && (elem.scrollTop += scrollY)), left || top || (que = []), que.length ? requestFrame(step, elem, 1e3 / options.frameRate + 1) : pending = !1
                };
            requestFrame(step, elem, 0), pending = !0
        }
    }

    function wheel(event) {
        initDone || init();
        var target = event.target,
            overflowing = overflowingAncestor(target);
        if (!overflowing || event.defaultPrevented || event.ctrlKey) return !0;
        if (isNodeName(activeElement, "embed") || isNodeName(target, "embed") && /\.pdf/i.test(target.src) || isNodeName(activeElement, "object")) return !0;
        var deltaX = -event.wheelDeltaX || event.deltaX || 0,
            deltaY = -event.wheelDeltaY || event.deltaY || 0;
        return isMac && (options.touchpadSupport = !1, event.wheelDeltaX && isDivisible(event.wheelDeltaX, 120) && (deltaX = -120 * (event.wheelDeltaX / Math.abs(event.wheelDeltaX))), event.wheelDeltaY && isDivisible(event.wheelDeltaY, 120) && (deltaY = -120 * (event.wheelDeltaY / Math.abs(event.wheelDeltaY)))), deltaX || deltaY || (deltaY = -event.wheelDelta || 0), 1 === event.deltaMode && (deltaX *= 40, deltaY *= 40), !options.touchpadSupport && isTouchpad(deltaY) ? !0 : (Math.abs(deltaX) > 1.2 && (deltaX *= options.stepSize / 120), Math.abs(deltaY) > 1.2 && (deltaY *= options.stepSize / 120), scrollArray(overflowing, deltaX, deltaY), event.preventDefault(), void scheduleClearCache())
    }

    function keydown(event) {
        var target = event.target,
            modifier = event.ctrlKey || event.altKey || event.metaKey || event.shiftKey && event.keyCode !== key.spacebar;
        document.body.contains(activeElement) || (activeElement = document.activeElement);
        var inputNodeNames = /^(textarea|select|embed|object)$/i,
            buttonTypes = /^(button|submit|radio|checkbox|file|color|image)$/i;
        if (inputNodeNames.test(target.nodeName) || isNodeName(target, "input") && !buttonTypes.test(target.type) || isNodeName(activeElement, "video") || isInsideYoutubeVideo(event) || target.isContentEditable || event.defaultPrevented || modifier) return !0;
        if ((isNodeName(target, "button") || isNodeName(target, "input") && buttonTypes.test(target.type)) && event.keyCode === key.spacebar) return !0;
        var shift, x = 0,
            y = 0,
            elem = overflowingAncestor(activeElement),
            clientHeight = elem.clientHeight;
        switch (elem == document.body && (clientHeight = window.innerHeight), event.keyCode) {
            case key.up:
                y = -options.arrowScroll;
                break;
            case key.down:
                y = options.arrowScroll;
                break;
            case key.spacebar:
                shift = event.shiftKey ? 1 : -1, y = -shift * clientHeight * .9;
                break;
            case key.pageup:
                y = .9 * -clientHeight;
                break;
            case key.pagedown:
                y = .9 * clientHeight;
                break;
            case key.home:
                y = -elem.scrollTop;
                break;
            case key.end:
                var damt = elem.scrollHeight - elem.scrollTop - clientHeight;
                y = damt > 0 ? damt + 10 : 0;
                break;
            case key.left:
                x = -options.arrowScroll;
                break;
            case key.right:
                x = options.arrowScroll;
                break;
            default:
                return !0
        }
        scrollArray(elem, x, y), event.preventDefault(), scheduleClearCache()
    }

    function mousedown(event) {
        activeElement = event.target
    }

    function scheduleClearCache() {
        clearTimeout(clearCacheTimer), clearCacheTimer = setInterval(function() {
            cache = {}
        }, 1e3)
    }

    function setCache(elems, overflowing) {
        for (var i = elems.length; i--;) cache[uniqueID(elems[i])] = overflowing;
        return overflowing
    }

    function overflowingAncestor(el) {
        var elems = [],
            body = document.body,
            rootScrollHeight = root.scrollHeight;
        do {
            var cached = cache[uniqueID(el)];
            if (cached) return setCache(elems, cached);
            if (elems.push(el), rootScrollHeight === el.scrollHeight) {
                var topOverflowsNotHidden = overflowNotHidden(root) && overflowNotHidden(body),
                    isOverflowCSS = topOverflowsNotHidden || overflowAutoOrScroll(root);
                if (isFrame && isContentOverflowing(root) || !isFrame && isOverflowCSS) return setCache(elems, getScrollRoot())
            } else if (isContentOverflowing(el) && overflowAutoOrScroll(el)) return setCache(elems, el)
        } while (el = el.parentElement)
    }

    function isContentOverflowing(el) {
        return el.clientHeight + 10 < el.scrollHeight
    }

    function overflowNotHidden(el) {
        var overflow = getComputedStyle(el, "").getPropertyValue("overflow-y");
        return "hidden" !== overflow
    }

    function overflowAutoOrScroll(el) {
        var overflow = getComputedStyle(el, "").getPropertyValue("overflow-y");
        return "scroll" === overflow || "auto" === overflow
    }

    function addEvent(type, fn) {
        window.addEventListener(type, fn, !1)
    }

    function removeEvent(type, fn) {
        window.removeEventListener(type, fn, !1)
    }

    function isNodeName(el, tag) {
        return (el.nodeName || "").toLowerCase() === tag.toLowerCase()
    }

    function directionCheck(x, y) {
        x = x > 0 ? 1 : -1, y = y > 0 ? 1 : -1, direction.x === x && direction.y === y || (direction.x = x, direction.y = y, que = [], lastScroll = 0)
    }

    function isTouchpad(deltaY) {
        return deltaY ? (deltaBuffer.length || (deltaBuffer = [deltaY, deltaY, deltaY]), deltaY = Math.abs(deltaY), deltaBuffer.push(deltaY), deltaBuffer.shift(), clearTimeout(deltaBufferTimer), deltaBufferTimer = setTimeout(function() {
            window.localStorage && (localStorage.SS_deltaBuffer = deltaBuffer.join(","))
        }, 1e3), !allDeltasDivisableBy(120) && !allDeltasDivisableBy(100)) : void 0
    }

    function isDivisible(n, divisor) {
        return Math.floor(n / divisor) == n / divisor
    }

    function allDeltasDivisableBy(divisor) {
        return isDivisible(deltaBuffer[0], divisor) && isDivisible(deltaBuffer[1], divisor) && isDivisible(deltaBuffer[2], divisor)
    }

    function isInsideYoutubeVideo(event) {
        var elem = event.target,
            isControl = !1;
        if (-1 != document.URL.indexOf("www.youtube.com/watch"))
            do
                if (isControl = elem.classList && elem.classList.contains("html5-video-controls")) break;
        while (elem = elem.parentNode);
        return isControl
    }

    function pulse_(x) {
        var val, start, expx;
        return x *= options.pulseScale, 1 > x ? val = x - (1 - Math.exp(-x)) : (start = Math.exp(-1), x -= 1, expx = 1 - Math.exp(-x), val = start + expx * (1 - start)), val * options.pulseNormalize
    }

    function pulse(x) {
        return x >= 1 ? 1 : 0 >= x ? 0 : (1 == options.pulseNormalize && (options.pulseNormalize /= pulse_(1)), pulse_(x))
    }

    function SmoothScroll(optionsToSet) {
        for (var key in optionsToSet) defaultOptions.hasOwnProperty(key) && (options[key] = optionsToSet[key])
    }
    var activeElement, observer, refreshSize, clearCacheTimer, deltaBufferTimer, defaultOptions = {
            frameRate: 70,
            animationTime: 500,
            stepSize: 55,
            pulseAlgorithm: !0,
            pulseScale: 4,
            pulseNormalize: 1,
            accelerationDelta: 50,
            accelerationMax: 3,
            keyboardSupport: !0,
            arrowScroll: 50,
            touchpadSupport: !0,
            fixedBackground: !0,
            excluded: ""
        },
        options = defaultOptions,
        isExcluded = !1,
        isFrame = !1,
        direction = {
            x: 0,
            y: 0
        },
        initDone = !1,
        root = document.documentElement,
        deltaBuffer = [],
        isMac = /^Mac/.test(navigator.platform),
        key = {
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            spacebar: 32,
            pageup: 33,
            pagedown: 34,
            end: 35,
            home: 36
        },
        que = [],
        pending = !1,
        lastScroll = Date.now(),
        uniqueID = function() {
            var i = 0;
            return function(el) {
                return el.uniqueID || (el.uniqueID = i++)
            }
        }(),
        cache = {};
    window.localStorage && localStorage.SS_deltaBuffer && (deltaBuffer = localStorage.SS_deltaBuffer.split(","));
    var wheelEvent, requestFrame = function() {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback, element, delay) {
                window.setTimeout(callback, delay || 1e3 / 60)
            }
        }(),
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
        getScrollRoot = function() {
            var SCROLL_ROOT;
            return function() {
                if (!SCROLL_ROOT) {
                    var dummy = document.createElement("div");
                    dummy.style.cssText = "height:10000px;width:1px;", document.body.appendChild(dummy);
                    var bodyScrollTop = document.body.scrollTop;
                    document.documentElement.scrollTop;
                    window.scrollBy(0, 3), SCROLL_ROOT = document.body.scrollTop != bodyScrollTop ? document.body : document.documentElement, window.scrollBy(0, -3), document.body.removeChild(dummy)
                }
                return SCROLL_ROOT
            }
        }(),
        userAgent = window.navigator.userAgent,
        isIE = /Trident/.test(userAgent),
        isEdge = /Edge/.test(userAgent),
        isIE = /Trident/.test(userAgent),
        isChrome = /chrome/i.test(userAgent) && !isEdge,
        isMobile = (/safari/i.test(userAgent) && !isEdge, /mobile/i.test(userAgent)),
        isIEWin7 = /Windows NT 6.1/i.test(userAgent) && /rv:11/i.test(userAgent),
        isEnabledForBrowser = (isChrome || isIEWin7 || isIE || isEdge) && !isMobile;
    "onwheel" in document.createElement("div") ? wheelEvent = "wheel" : "onmousewheel" in document.createElement("div") && (wheelEvent = "mousewheel"), wheelEvent && isEnabledForBrowser && (addEvent(wheelEvent, wheel), addEvent("mousedown", mousedown), addEvent("load", init)), SmoothScroll.destroy = cleanup, window.SmoothScrollOptions && SmoothScroll(window.SmoothScrollOptions), "function" == typeof define && define.amd ? define(function() {
        return SmoothScroll
    }) : "object" == typeof exports ? module.exports = SmoothScroll : window.SmoothScroll = SmoothScroll
}();