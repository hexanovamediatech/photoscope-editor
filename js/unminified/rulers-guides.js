var Event = function () {
    "use strict";
    this.attach = function (evtName, element, listener, capture) {
        var evt         = '',
            useCapture  = (capture === undefined) ? true : capture,
            handler     = null;

        if (window.addEventListener === undefined) {
            evt = 'on' + evtName;
            handler = function (evt, listener) {
                element.attachEvent(evt, listener);
                return listener;
            };
        } else {
            evt = evtName;
            handler = function (evt, listener, useCapture) {
                element.addEventListener(evt, listener, useCapture);
                return listener;
            };
        }

        return handler.apply(element, [evt, function (ev) {
            var e   = ev || event,
                src = e.srcElement || e.target;

            listener(e, src);
        }, useCapture]);
    };

    this.detach = function (evtName, element, listener, capture) {
        var evt         = '',
            useCapture  = (capture === undefined) ? true : capture;

        if (window.removeEventListener === undefined) {
            evt = 'on' + evtName;
            element.detachEvent(evt, listener);
        } else {
            evt = evtName;
            element.removeEventListener(evt, listener, useCapture);
        }
    };

    this.stop = function (evt) {
        evt.cancelBubble = true;

        if (evt.stopPropagation) {
            evt.stopPropagation();
        }
    };

    this.prevent = function (evt) {
        if (evt.preventDefault) {
            evt.preventDefault();
        } else {
            evt.returnValue = false;
        }
    };
};

var Dragdrop = function (evt) {
    "use strict";
    var elem        = null,
        started     = 0,
        self        = this,
        moveHandler = null,
        doc         = document.documentElement,
        body        = document.body,
        gWidth      = (document.body.scrollWidth > document.documentElement.clientWidth)
                      ? document.body.scrollWidth
                      : document.documentElement.clientWidth,
        gHeight     = Math.max(body.scrollHeight, body.offsetHeight, doc.clientHeight, doc.scrollHeight, doc.offsetHeight),
        move        = function (e) {
            var xDiff   = e.clientX - elem.posX,
                yDiff   = e.clientY - elem.posY,
                x       = xDiff - (xDiff % elem.snap) + 'px',
                y       = yDiff - (yDiff % elem.snap) + 'px';

            if (started === 1) {
                switch (elem.mode) {
                case 0:
                    elem.style.top = y;
                    elem.style.left = x;
                    break;
                case 1:
                    elem.style.left = x;
                    break;
                case 2:
                    elem.style.top = y;
                    break;
                }

                if (elem.mode !== 2) {
                    if (xDiff <= elem.minX) {
                        elem.style.left = elem.minX + 'px';
                    }

                    if (elem.offsetLeft + elem.offsetWidth >= elem.maxX) {
                        elem.style.left = (elem.maxX - elem.offsetWidth) + 'px';
                    }
                }

                if (elem.mode !== 1) {
                    if (yDiff <= elem.minY) {
                        elem.style.top = elem.minY + 'px';
                    }

                    if (elem.offsetTop + elem.offsetHeight >= elem.maxY) {
                        elem.style.top = (elem.maxY - elem.offsetHeight) + 'px';
                    }
                }

                elem.onMove(elem);
            }
        },
        start       = function (e, src) {
            if (src.className.indexOf('draggable') !== -1) {

                evt.prevent(e);

                moveHandler = evt.attach('mousemove', document, move, true);
                started = 1;

                elem = src;
                elem.posX = e.clientX - elem.offsetLeft;
                elem.posY = e.clientY - elem.offsetTop;

                if (elem.mode === undefined) {
                    self.set(elem);
                }

                elem.onStart(elem);

                if (elem.setPointerCapture) {
                    elem.setPointerCapture('rulerPointerCapture');
                }
            }
        },
        stop        = function () {
            if (started === 1) {
                started = 0;
                elem.onStop(elem);
                evt.detach('mousemove', document, moveHandler);

                if (elem.releasePointerCapture) {
                    elem.releasePointerCapture('rulerPointerCapture');
                }
            }
        };

    evt.attach('mousedown', document, start, false);
    evt.attach('mouseup', document, stop, false);

    this.start = start;

    this.set = function (element, elemOptions) {
        var options = elemOptions       || {};

        elem = (typeof element === 'string')
                ? document.getElementById(element)
                : element;

        elem.mode           = options.mode      || 0;
        elem.minX           = options.minX      || 0;
        elem.maxX           = options.maxX      || gWidth;
        elem.minY           = options.minY      || 0;
        elem.maxY           = options.maxY      || gHeight;
        elem.snap           = options.snap      || 1;
        elem.onStart        = options.onstart   || function () {};
        elem.onMove         = options.onmove    || function () {};
        elem.onStop         = options.onstop    || function () {};

        elem.style.left     = elem.offsetLeft + 'px';
        elem.style.top      = elem.offsetTop + 'px';

        elem.unselectable   = 'on';
    };
};

var RulersGuides = function (evt, dragdrop, container) {
    'use strict';

    var doc         = document.documentElement,
        body        = document.body,
        wrapper     = null,
        hRuler      = null,
        vRuler      = null,
        menu        = null,
        xSnap       = 0,
        ySnap       = 0,
        mode        = 2,
        guides      = {},
        guidesCnt   = 0,
        gUid        = '',
        rulerStatus = 0,
        guideStatus = 1,
        vLowBound   = 0,
        vHighBound  = 0,
        hLowBound   = 0,
        hHighBound  = 0,
        menuBtn     = null,
        gInfoBlockWrapper = null,
        domElements = [],
        domDimensions = [],
        resizeTimer = null,
        snapDom     = 0,
        cssText     = '',
        Ruler       = function (type, size) {
            var ruler       = document.createElement('div'),
                i           = 0,
                span        = document.createElement('span'),
                label       = null,
                labelTxt    = null,
                spanFrag    = document.createDocumentFragment(),
                cnt         = Math.floor(size / 2);

            ruler.id = 'ruler-' + type + '';
            ruler.className = 'ruler ' + type + ' unselectable';

            for (i; i < cnt; i = i + 1) {
                span = span.cloneNode(false);

                if (i % 25 === 0) {
                    span.className = 'milestone';

                    if (i > 0) {
                        label = span.cloneNode(false);
                        label.className = 'label';

                        if (i < 50) {
                            label.className += ' l10';
                        } else if (i >= 50 && i < 500) {
                            label.className += ' l100';
                        } else if (i >= 500) {
                            label.className += ' l1000';
                        }

                        labelTxt = document.createTextNode(i * 2);
                        label.appendChild(labelTxt);
                        span.appendChild(label);
                    }

                    span.className = 'milestone';
                } else if (i % 5 === 0) {
                    span.className = 'major';
                } else {
                    span.className = '';
                    span.removeAttribute('class');
                }

                spanFrag.appendChild(span);
            }

            ruler.appendChild(spanFrag);

            return ruler;
        },
        getWindowSize = function () {
            if (container !== undefined) {
                var w = Math.max(
                        container.scrollWidth,
                        container.offsetWidth,
                        container.clientWidth,
                        container.scrollWidth,
                        container.offsetWidth
                    ) + 615,
                    h = Math.max(
                        container.scrollHeight,
                        container.offsetHeight,
                        container.clientHeight,
                        container.scrollHeight,
                        container.offsetHeight
                    );
            } else {
                var w = Math.max(
                        body.scrollWidth,
                        body.offsetWidth,
                        doc.clientWidth,
                        doc.scrollWidth,
                        doc.offsetWidth
                    ),
                    h = Math.max(
                        body.scrollHeight,
                        body.offsetHeight,
                        doc.clientHeight,
                        doc.scrollHeight,
                        doc.offsetHeight
                    );
            }

            return [w, h];
        },
        getScrollPos = function () {
            if (container !== undefined) {
                var t = container.scrollTop,
                    l = container.scrollLeft;
            } else {
                var t = Math.max(doc.scrollTop, body.scrollTop),
                    l = Math.max(doc.scrollLeft, body.scrollLeft);
            }

            return [t, l];
        },
        removeInboundGuide = function (guide, gUid, e) {
            
            var scrollPos = getScrollPos();

            if (e !== undefined) {
                var x = e.clientX;
                var y = e.clientY;
            }

            if (
                rulerStatus === 1 && guideStatus === 1 && (
                    (guide.className === 'guide h draggable' && guide.offsetTop < hHighBound - hLowBound + scrollPos[0]) ||
                    (guide.className === 'guide v draggable' && guide.offsetLeft < vHighBound - vLowBound + scrollPos[1]) ||
                    y > hLowBound && y < hHighBound ||
                    x > vLowBound && x < vHighBound
                )
            ) {

                if (guide.className.indexOf('guide') === -1) {
                    gUid = 'guide-' + (guidesCnt - 1);
                    guide = guides[gUid];
                }
                
            }
        
        },
        removeInboundGuides = function () {
            var i;

            for (i in guides) {
                if (guides.hasOwnProperty(i)) {
                    removeInboundGuide(guides[i], i);
                }
            }
        },
        toggleGuides = function () {
            var i;

            guideStatus = 1 - guideStatus;

            for (i in guides) {
                if (guides.hasOwnProperty(i)) {
                    guides[i].style.display = (guideStatus === 1)
                        ? 'block'
                        : 'none';
                }
            }

            if (guideStatus === 1) {
                wrapper.style.display = 'block';
            }
        },
        toggleRulers = function () {
            rulerStatus = 1 - rulerStatus;
            var zoomIn = document.getElementById('gauci-img-zoom-in');
            var zoomOut = document.getElementById('gauci-img-zoom-out');

            if (rulerStatus === 1) {
                zoomOut.click();
                vRuler.style.display = 'block';
                hRuler.style.display = 'block';
                wrapper.style.display = 'block';
                document.getElementById('gauci-ruler-icon').classList.remove("closed");
                removeInboundGuides();
            } else {
                zoomIn.click();
                document.getElementById('gauci-ruler-icon').classList.add("closed");
                vRuler.style.display = 'none';
                hRuler.style.display = 'none';
            }
        },
        deleteGuides = function () {
            var i;

            if (guidesCnt > 0) {
                for (i in guides) {
                    if (guides.hasOwnProperty(i)) {
                        wrapper.removeChild(guides[i]);
                        delete guides[i];
                        guidesCnt = guidesCnt - 1;
                    }
                }

                gInfoBlockWrapper.style.display = 'none';
            }
        },
        calculateDomDimensions = function () {
            var x = [],
                y = [],
                dm = [],
                i = 0,
                len = domElements.length,
                findDimensions = function (elem) {
                    var t = 0,
                        l = 0,
                        w = elem.offsetWidth,
                        h = elem.offsetHeight;

                    while (elem) {
                        l += (elem.offsetLeft - elem.scrollLeft + elem.clientLeft);
                        t += (elem.offsetTop - elem.scrollTop + elem.clientTop);
                        elem = elem.offsetParent;
                    }

                    return [l, t, l + w, t + h];
                },
                getUnique = function (arr) {
                    var u = {}, a = [], idx = 0, arrLen = arr.length;

                    for (idx; idx < arrLen; idx = idx + 1) {
                        if (u.hasOwnProperty(arr[idx]) === false) {
                            a.push(arr[idx]);
                            u[arr[idx]] = 1;
                        }
                    }

                    return a;
                };

            for (i; i < len; i = i + 1) {
                dm = findDimensions(domElements[i]);

                x.push(dm[0]);
                x.push(dm[2]);

                y.push(dm[1]);
                y.push(dm[3]);
            }

            x = getUnique(x).sort(function (a, b) {
                return a - b;
            });

            y = getUnique(y).sort(function (a, b) {
                return a - b;
            });

            return [x, y];
        },
        Menu = function () {
            var menuList = null,
                status   = 0,
                toggles = {},
                menuItemsList  = [{
                    'text': gauciParams.hideRulers,
                    'alias': 'rulers'
                }, {
                    'text': gauciParams.hideGuides,
                    'alias': 'guides'
                }, {
                    'text': gauciParams.clearAllGuides,
                    'alias': 'clear'
                }],
                i = 0;

            this.render = function () {
                menuBtn = document.createElement('div');
                menuBtn.className = 'menu-btn';
                menuBtn.innerHTML = '<span class="material-icons">square_foot</span>';

                menuList = document.createElement('ul');
                menuList.className = 'rg-menu';

                var menuItems = document.createDocumentFragment(),
                    li = document.createElement('li'),
                    liLink = document.createElement('a'),
                    liDesc = document.createElement('span'),
                    liDescTxt = document.createTextNode('');

                liLink.href = 'javascript:';
                liDesc.className = 'desc';

                for (i; i < menuItemsList.length; i = i + 1) {
                    li = li.cloneNode(false);
                    liLink = liLink.cloneNode(false);
                    liDesc = liDesc.cloneNode(false);
                    liDescTxt = liDescTxt.cloneNode(false);

                    liDescTxt.nodeValue = menuItemsList[i].text;

                    liDesc.appendChild(liDescTxt);

                    liLink.appendChild(liDesc);

                    li.appendChild(liLink);

                    menuItems.appendChild(li);

                    toggles[menuItemsList[i].alias] = {
                        obj: liLink,
                        txt: liDescTxt
                    };
                }

                evt.attach('mousedown', toggles.rulers.obj, function () {
                    toggleRulers();
                    menu.close();
                });

                evt.attach('mousedown', toggles.guides.obj, function () {
                    toggleGuides();
                    menu.close();
                });

                evt.attach('mousedown', toggles.clear.obj, function () {
                    toggles.guides.txt.nodeValue = gauciParams.hideGuides;
                    guideStatus = 1;
                    deleteGuides();
                    menu.close();
                });

                menuList.appendChild(menuItems);

                document.getElementById('gauci-ruler-icon').appendChild(menuBtn);
                document.getElementById('gauci-ruler-icon').appendChild(menuList);

                evt.attach('mousedown', menuBtn, function () {
                    toggles.rulers.txt.nodeValue = (rulerStatus === 1)
                        ? gauciParams.hideRulers
                        : gauciParams.showRulers;

                    if (guidesCnt > 0) {
                        toggles.guides.obj.className = '';
                        toggles.clear.obj.className = '';

                        toggles.guides.txt.nodeValue = (guideStatus === 1)
                            ? gauciParams.hideGuides
                            : gauciParams.showGuides;
                    } else {
                        toggles.guides.obj.className = 'disabled';
                        toggles.clear.obj.className = 'disabled';
                    }

                    menuList.style.display = (status === 0) ? 'inline-block' : 'none';

                    status = 1 - status;
                });
            };

            this.render();

            this.close = function () {
                if (menuList !== null) {
                    menuList.style.display = 'none';
                    status = 0;
                }
            };
        },
        prepare     = function () {
            var style = document.createElement('style'),
                size = getWindowSize(),
                elements = document.getElementsByTagName('*'),
                len = elements.length,
                i = 0;

            for (i; i < len; i = i + 1) {
                domElements.push(elements[i]);
            }

            style.setAttribute('type', 'text/css');

            if (style.styleSheet) {
                style.styleSheet.cssText = cssText;
            } else {
                style.appendChild(document.createTextNode(cssText));
            }

            body.appendChild(style);

            setTimeout(function () {
                hRuler = new Ruler('h', 3000);
                vRuler = new Ruler('v', 7000);

                wrapper = document.createElement('div');
                gInfoBlockWrapper = wrapper.cloneNode(false);

                wrapper.className = 'rg-overlay';
                gInfoBlockWrapper.className = 'info-block-wrapper';

                wrapper.style.width = (size[0]) + 'px';
                wrapper.style.height = (size[1]) + 'px';

                wrapper.appendChild(hRuler);
                wrapper.appendChild(vRuler);
                wrapper.appendChild(gInfoBlockWrapper);

                container.appendChild(wrapper);

                domDimensions = calculateDomDimensions();

                menu = new Menu();
            }, 10);
        };

    prepare();

    this.status = 1;

    this.disable = function () {
        if (vRuler !== null) {
            deleteGuides();

            vRuler.style.display = 'none';
            hRuler.style.display = 'none';
            wrapper.style.display = 'none';
            menuBtn.style.display = 'none';
        }

        rulerStatus = 0;
        this.status = 0;
    };

    this.enable = function () {
        if (vRuler !== null) {
            vRuler.style.display = 'block';
            hRuler.style.display = 'block';
            wrapper.style.display = 'block';
            menuBtn.style.display = 'block';
        }

        rulerStatus = 1;
        this.status = 1;
    };

    evt.attach('mousedown', document, function (e, src) {
        if (document.querySelector('#ruler-h').contains(e.target) || document.querySelector('#ruler-v').contains(e.target)) {

        var x               = e.clientX,
            y               = e.clientY,
            guide           = null,
            guideInfo       = null,
            guideInfoText   = null,
            scrollPos       = getScrollPos(),
            snap            = 0;

        if (src.className.indexOf('menu-btn') === -1) {
            menu.close();
        }

        if (vLowBound === 0) {
            vLowBound = container.offsetLeft;
            vHighBound = vRuler.offsetWidth + vLowBound;
            hLowBound = container.offsetTop;
            hHighBound = hRuler.offsetHeight + hLowBound;
        }

        if (
            (
                (x > vLowBound && x < vHighBound) ||
                (y > hLowBound && y < hHighBound)
            ) && rulerStatus === 1
        ) {
            guide = document.createElement('div');
            guideInfo = guide.cloneNode(false);
            guideInfoText = document.createTextNode('');

            gUid = 'guide-' + guidesCnt;

            guideInfo.className = 'info';

            guideInfo.appendChild(guideInfoText);
            guide.appendChild(guideInfo);

            if (y > hLowBound && y < hHighBound) {
                guide.className = 'guide h draggable';
                guide.style.top = (e.clientY - container.offsetTop) + 'px';
                guideInfo.style.left = (x + scrollPos[1] + 10) + 'px';
                guide.type = 'h';
                snap = ySnap;
                mode = 2;
            } else if (x > vLowBound && x < vHighBound) {
                guide.className = 'guide v draggable';
                guide.style.left = (x - container.offsetLeft) + 'px';
                guideInfo.style.top = ((y + scrollPos[0]) - 35) + 'px';
                guide.type = 'v';
                snap = xSnap;
                mode = 1;
            }

            guide.id = gUid;
            guide.info = guideInfo;
            guide.text = guideInfoText;
            guide.x    = 0;
            guide.y    = 0;

            guides[gUid] = guide;

            wrapper.appendChild(guide);
            
            dragdrop.set(guide, {
                mode: mode,
                onstart: function (elem) {
                    var text = (elem.mode === 1)
                            ? parseInt(elem.style.left, 10) + 2
                            : parseInt(elem.style.top, 10) + 2;

                    elem.text.nodeValue = text - 41;

                    if (elem.over !== undefined) {
                        evt.detach('mouseover', elem, elem.over);
                        evt.detach('mouseout', elem, elem.out);
                    }
                },
                onmove: function (elem) {
                    var text    = '',
                        pos     = 0,
                        dims    = [],
                        len     = 0,
                        i       = 0;

                    pos = (elem.mode === 1) ? elem.style.left : elem.style.top;
                    pos = parseInt(pos, 10);

                    if (snapDom === 1) {
                        dims = domDimensions[elem.mode - 1];

                        for (i, len = dims.length; i < len; i = i + 1) {
                            if (pos <= dims[i]) {
                                pos = dims[i];
                                break;
                            }
                        }
                    }

                    text = pos;

                    if (elem.mode === 1) {
                        elem.style.left = (pos - 2) + 'px';
                        elem.x = pos;
                    } else {
                        elem.style.top = (pos - 2) + 'px';
                        elem.y = pos;
                    }

                    elem.text.nodeValue = text - 41;
                },
                onstop: function (elem) {
                    elem.over = evt.attach('mouseover', elem, function (e, src) {
                        if (src.className === 'guide v draggable') {
                            elem.info.style.top = ((e.clientY + scrollPos[0]) - 35) + 'px';
                        } else if (src.className === 'guide h draggable') {
                            elem.info.style.left = (e.clientX + scrollPos[1] + 10) + 'px';
                        }

                        elem.info.style.display = 'block';
                    });

                    elem.out = evt.attach('mouseout', elem, function () {
                        elem.info.style.display = 'none';
                    });
                },
                snap: snap
            });

            dragdrop.start(e, guide);

            guidesCnt = guidesCnt + 1;
        
        }
        } else {
            return;
        }
    });

    evt.attach('mouseup', document, function (e, src) {
        removeInboundGuide(src, src.id, e);
    });

    evt.attach('resize', window, function () {
        var size = getWindowSize();

        wrapper.style.width = size[0] + 'px';
        wrapper.style.height = size[1] + 'px';

        if (resizeTimer !== null) {
            window.clearTimeout(resizeTimer);
        }

        if (snapDom === 1) {
            resizeTimer = window.setTimeout(function () {
                domDimensions = calculateDomDimensions();
            }, 100);
        }
    });
};