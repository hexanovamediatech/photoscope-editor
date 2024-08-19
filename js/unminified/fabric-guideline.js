function initAligningGuidelines(canvas) {
    var guideSize = 1;
    var guideColor = '#4affff';
    if ($('#ruler-guide-size').length) {
        guideSize = parseInt($('#ruler-guide-size').val());
    }
    if ($('#ruler-guide-color').length) {
        guideColor = $('#ruler-guide-color').val();
    }

    var ctx = canvas.getSelectionContext(),
        aligningLineOffset = 5,
        aligningLineMargin = 4,
        aligningLineWidth = guideSize,
        aligningLineColor = guideColor,
        viewportTransform,
        zoom = 1;

    function drawVerticalLine(coords) {
        drawLine(
            coords.x + 0.5,
            coords.y1 > coords.y2 ? coords.y2 : coords.y1,
            coords.x + 0.5,
            coords.y2 > coords.y1 ? coords.y2 : coords.y1);
    }

    function drawHorizontalLine(coords) {
        drawLine(
            coords.x1 > coords.x2 ? coords.x2 : coords.x1,
            coords.y + 0.5,
            coords.x2 > coords.x1 ? coords.x2 : coords.x1,
            coords.y + 0.5);
    }

    function drawLine(x1, y1, x2, y2) {
        ctx.save();
        ctx.lineWidth = aligningLineWidth;
        ctx.strokeStyle = aligningLineColor;
        ctx.beginPath();
        ctx.moveTo(((x1 + viewportTransform[4]) * zoom), ((y1 + viewportTransform[5]) * zoom));
        ctx.lineTo(((x2 + viewportTransform[4]) * zoom), ((y2 + viewportTransform[5]) * zoom));
        ctx.stroke();
        ctx.restore();
    }

    function isInRange(value1, value2) {
        value1 = Math.round(value1);
        value2 = Math.round(value2);
        for (var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
            if (i === value2) {
                return true;
            }
        }
        return false;
    }
    
    function getNewlineCos(angle, Hypotenuse) {
			var radians = Math.cos(angle * Math.PI / 180);
      var result =  (Hypotenuse*radians);
        return result;
    }

    var verticalLines = [],
        horizontalLines = [];

    canvas.on('mouse:down', function () {
        viewportTransform = canvas.viewportTransform;
        zoom = canvas.getZoom();
    });

    canvas.on('object:moving', function (e) {

        var activeObject = e.target,
            canvasObjects = canvas.getObjects(),
            activeObjectCenter = activeObject.getCenterPoint(),
            activeObjectLeft = activeObjectCenter.x,
            activeObjectTop = activeObjectCenter.y,
            activeObjectBoundingRect = activeObject.getBoundingRect(),
            activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3],
            activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0],
            horizontalInTheRange = false,
            verticalInTheRange = false,
            transform = canvas._currentTransform;

        if (!transform) return;

        for (var i = canvasObjects.length; i--;) {

            if (canvasObjects[i] === activeObject) continue;

            var objectCenter = canvasObjects[i].getCenterPoint(),
                objectLeft = objectCenter.x,
                objectTop = objectCenter.y,
                objectBoundingRect = canvasObjects[i].getBoundingRect(),
                objectHeight = objectBoundingRect.height / viewportTransform[3],
                objectWidth = objectBoundingRect.width / viewportTransform[0],
                posTop = 0,
                posLeft = 0,
                snapLeft = false,
                snapRight = false,
                snapTop = false,
                snapBottom = false,
                snapHorizontal = false,
                snapVertical = false;

            if (isInRange(objectLeft, activeObjectLeft)) {
            	if (verticalInTheRange) return;
              verticalLines.push({
                    x: objectLeft,
                    y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                });

                posLeft = objectLeft;
                snapHorizontal = true;
                verticalInTheRange = true;
            }

            if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
								if (verticalInTheRange) return;
                verticalLines.push({
                    x: objectLeft - objectWidth / 2,
                    y1: (objectTop - objectHeight / 2 < activeObjectTop - activeObjectHeight / 2) ? (objectTop - objectHeight / 2) : (activeObjectTop - activeObjectHeight / 2),
                    y2: (activeObjectTop + activeObjectHeight / 2 > objectTop + objectHeight / 2) ? (activeObjectTop + activeObjectHeight / 2) : (objectTop + objectHeight / 2)
                });

                posLeft = (objectLeft - objectWidth / 2 + activeObjectWidth / 2);
                snapLeft = true;
                verticalInTheRange = true;
            }

            if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
                if (verticalInTheRange) return;
                verticalLines.push({
                    x: objectLeft + objectWidth / 2,
                    y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                });
                posLeft = (objectLeft + objectWidth / 2 - activeObjectWidth / 2)
                snapRight = true;
                verticalInTheRange = true;
            }

            if (isInRange(objectTop, activeObjectTop)) {
            	if (horizontalInTheRange) return;
							horizontalLines.push({
                    y: objectTop,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                posTop = objectTop;
                snapVertical = true;
                horizontalInTheRange = true;
            }

            if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
                if (horizontalInTheRange) return;
                horizontalLines.push({
                    y: objectTop - objectHeight / 2,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                posTop = (objectTop - objectHeight / 2 + activeObjectHeight / 2);
                snapTop = true;
                horizontalInTheRange = true;
            }

            if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
                if (horizontalInTheRange) return;
                horizontalLines.push({
                    y: objectTop + objectHeight / 2,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                posTop = (objectTop + objectHeight / 2 - activeObjectHeight / 2);
                snapBottom = true;
                horizontalInTheRange = true;
            }

            if (snapLeft || snapRight || snapTop || snapBottom || snapHorizontal || snapVertical) {
                if (snapHorizontal || snapLeft || snapRight) {
                    posTop = activeObjectTop;
                }
                if (snapVertical || snapTop || snapBottom) {
                    posLeft = activeObjectLeft;
                }

                if (snapHorizontal && snapVertical) {
                    activeObject.setPositionByOrigin(new fabric.Point(objectLeft, objectTop), 'center', 'center');
                } else {

                    if (snapLeft) posLeft = (objectLeft - objectWidth / 2 + activeObjectWidth / 2);
                    if (snapRight) posLeft = (objectLeft + objectWidth / 2 - activeObjectWidth / 2);
                    if (snapTop) posTop = (objectTop - objectHeight / 2 + activeObjectHeight / 2);
                    if (snapBottom) posTop = (objectTop + objectHeight / 2 - activeObjectHeight / 2);
                    if (snapHorizontal) posLeft = objectLeft;
                    if (snapVertical) posTop = objectTop;

                    activeObject.setPositionByOrigin(new fabric.Point(posLeft, posTop), 'center', 'center');
                }

            }
        }

        if (!horizontalInTheRange) {
            horizontalLines.length = 0;
        }

        if (!verticalInTheRange) {
            verticalLines.length = 0;
        }
    });

    canvas.on('before:render', function () {
        if (canvas.contextTop !== null) {
            canvas.clearContext(canvas.contextTop);
        }
    });

    canvas.on('after:render', function () {
        for (var i = verticalLines.length; i--;) {
            drawVerticalLine(verticalLines[i]);
        }
        for (var i = horizontalLines.length; i--;) {
            drawHorizontalLine(horizontalLines[i]);
        }

        verticalLines.length = horizontalLines.length = 0;

    });

    canvas.on('mouse:up', function () {
        verticalLines.length = horizontalLines.length = 0;
        for (var jj = canvas._objects.length; jj--;) {
            canvas._objects[jj].set('newWidth', 0);
            canvas._objects[jj].set('compareWith', 9999);

        }
        canvas.requestRenderAll();
    });
}
