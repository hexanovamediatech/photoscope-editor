/*jshint esversion: 9, undef: false, unused: false */
/*
 * Plugin Name: hexa
 * Plugin URI: https://hexa.website/js-version/
 * Version: 1.9.1
 * Description: hexa - Javascript Image Editor
 * Author URI: http://codecanyon.net/user/egemenerd
 * License: http://codecanyon.com/licenses
 * Author: ThemeMasters
 */
(function ($) {
  "use strict";
  $.fn.hexa = function (options) {
    var selector = $(this);
    var windowWidth = document.body.clientWidth;
    // Default settings
    var settings = $.extend(
      {
        baseURL: "./",
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        fontSize: 60,
        fontWeight: "normal",
        fontStyle: "normal",
        canvasColor: "transparent",
        fill: "#000",
        stroke: "#fff",
        strokeWidth: 0,
        textBackgroundColor: "rgba(255,255,255,0)",
        textAlign: "left",
        lineHeight: 1.2,
        borderColor: "#000",
        borderDashArray: [4, 4],
        borderOpacityWhenMoving: 0.5,
        borderScaleFactor: 2,
        editingBorderColor: "rgba(0,0,0,0.5)",
        cornerColor: "#fff",
        cornerSize: 12,
        cornerStrokeColor: "#000",
        cornerStyle: "circle",
        transparentCorners: false,
        cursorColor: "#000",
        cursorWidth: 2,
        enableGLFiltering: true,
        textureSize: 4096,
        watermark: false,
        watermarkText: "hexa.website",
        watermarkFontFamily: "Georgia, serif",
        watermarkFontStyle: "normal",
        watermarkFontColor: "#000",
        watermarkFontSize: 40,
        watermarkFontWeight: "bold",
        watermarkBackgroundColor: "#FFF",
        watermarkLocation: "bottom-right",
        customFunctions: function () {},
        saveTemplate: function () {},
        saveImage: function () {},
      },
      options
    );
    // Define Variables
    var c = "",
      // db = new Localbase('hexa'),
      mode = "none",
      img = "",
      imgurl = "",
      originalWidth = "",
      originalHeight = "",
      rotate = 0,
      scaleX = 1,
      scaleY = 1,
      originX = "left",
      originY = "top",
      canvas = "",
      filters = [],
      clipPath = "",
      overlay = "",
      brush = "",
      brushShadow = "",
      duotoneFilter = "",
      timeOut = 0,
      mmediaLibraryMode = "add-to-canvas",
      shapeTypes = [
        "circle",
        "square",
        "rectangle",
        "triangle",
        "ellipse",
        "trapezoid",
        "octagon",
        "pentagon",
        "emerald",
        "star",
      ],
      resizableShapeTypes = ["square", "rectangle", "triangle"],
      webSafeFonts = [
        [
          "Helvetica Neue",
          "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        ],
        ["Impact", "Impact, Charcoal, sans-serif"],
        ["Georgia", "Georgia, serif"],
        [
          "Palatino Linotype",
          "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
        ],
        ["Times New Roman", "'Times New Roman', Times, serif"],
        ["Arial", "Arial, Helvetica, sans-serif"],
        ["Arial Black", "'Arial Black', Gadget, sans-serif"],
        ["Comic Sans", "'Comic Sans MS', cursive, sans-serif"],
        ["Lucida Sans", "'Lucida Sans Unicode', 'Lucida Grande', sans-serif"],
        ["Tahoma", "Tahoma, Geneva, sans-serif"],
        ["Trebuchet", "'Trebuchet MS', Helvetica, sans-serif"],
        ["Verdana", "Verdana, Geneva, sans-serif"],
        ["Courier New", "'Courier New', Courier, monospace"],
        ["Lucida Console", "'Lucida Console', Monaco, monospace"],
      ];
    /* Initialize Plugins */
    selector.find(".crop-custom").css("display", "none");
    /* Load Material Icons */
    var materialIcons = new FontFaceObserver("Material Icons");
    materialIcons
      .load(null, 10000)
      .then(function () {
        $("#hexa").find("#hexa-main-loader").fadeOut(200);
      })
      .catch(function (e) {
        console.log(e);
        $("#hexa").find("#hexa-main-loader").hide();
      });
    /* LazyLoad */
    var lazyLoadInstance = new LazyLoad({
      callback_error: (img) => {
        img.setAttribute("src", settings.baseURL + "assets/placeholder.png");
        $(img).parent().css("min-height", "auto");
        $(img).parent().find(".hexa-img-loader").remove();
      },
      callback_loaded: (img) => {
        $(img).parent().css("min-height", "auto");
        $(img).parent().find(".hexa-img-loader").remove();
      },
    });
    // Populate Websafe Fonts
    for (var i = 0; i < webSafeFonts.length; i++) {
      selector
        .find("#websafe-fonts")
        .append(
          $('<option class="websafe-font"></option>')
            .attr("value", webSafeFonts[i][1])
            .text(webSafeFonts[i][0])
            .attr("data-font", webSafeFonts[i][1])
            .text(webSafeFonts[i][0])
        );
    }
    // Populate Google Fonts
    $.getJSON(settings.baseURL + "json/google-fonts.json", function (fonts) {
      for (var i = 0; i < fonts.items.length; i++) {
        selector
          .find("#google-fonts")
          .append(
            $('<option class="google-font"></option>')
              .attr("value", fonts.items[i].family)
              .text(fonts.items[i].family)
              .attr("data-font", fonts.items[i].family)
              .text(fonts.items[i].family)
          );
      }
    });

    // Populate Material Icons
    $.getJSON(settings.baseURL + "json/material-icons.json", function (fonts) {
      for (var i = 0; i < fonts.categories.length; i++) {
        var item = fonts.categories[i];
        for (var ii = 0; ii < item.icons.length; ii++) {
          var url =
            settings.baseURL +
            "files/icons/" +
            item.icons[ii].group_id +
            "/" +
            item.icons[ii].ligature;
          selector
            .find("#hexa-icons .hexa-grid")
            .append(
              '<div class="hexa-element add-element" data-elsource="' +
                url +
                '" data-loader="no" title="' +
                item.icons[ii].name +
                '">' +
                '<span class="material-icons">' +
                item.icons[ii].ligature +
                "</div>"
            );
        }
      }
    });
    // Select2
    selector.find(".hexa-select.hexa-select2").select2({
      theme: "dark",
      width: "100%",
      templateSelection: select2format,
      templateResult: select2format,
      allowHtml: true,
    });
    // Spectrum Colorpicker
    selector.find(".hexa-colorpicker.disallow-empty").spectrum({
      allowEmpty: false,
      showInitial: true,
      hideAfterPaletteSelect: true,
    });
    selector.find(".hexa-colorpicker.allow-empty").spectrum({
      allowEmpty: true,
      showInitial: false,
      hideAfterPaletteSelect: true,
    });
    // Toastr
    toastr.options.closeButton = true;
    toastr.options.positionClass = "toast-bottom-right";
    toastr.options.progressBar = true;
    toastr.options.newestOnTop = false;
    toastr.options.showEasing = "swing";
    toastr.options.hideEasing = "linear";
    toastr.options.closeEasing = "linear";
    // UI Draggable
    selector.find("#hexa-canvas-wrap").draggable({
      disabled: true,
    });
    // Pagination
    function setPagination(target) {
      var items = target.find(">*");
      var num = items.length;
      var perPage = parseInt(target.data("perpage"));
      if (num > perPage) {
        items.slice(perPage).hide();
        var paginationDiv =
          '<div id="' +
          target.attr("id") +
          "-pagination" +
          '" class="hexa-pagination"></div>';
        target.after(paginationDiv);
        selector.find("#" + target.attr("id") + "-pagination").pagination({
          items: num,
          itemsOnPage: perPage,
          prevText: '<span class="material-icons">navigate_before</span>',
          nextText: '<span class="material-icons">navigate_next</span>',
          displayedPages: 3,
          onPageClick: function (pageNumber, event) {
            if (typeof event !== "undefined") {
              event.preventDefault();
            }
            var showFrom = perPage * (pageNumber - 1);
            var showTo = showFrom + perPage;
            items.hide().slice(showFrom, showTo).show();
          },
        });
        selector
          .find("#" + target.attr("id") + "-pagination")
          .pagination("selectPage", 1);
      }
    }
    selector.find(".paginated").each(function () {
      setPagination($(this));
    });
    // Dataurl to blob
    function dataURLtoBlob(dataurl) {
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {
        type: mime,
      });
    }
    // Convert to data url
    function convertToDataURL(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.send();
    }
    /* Open Panel */
    function openPanel() {
      selector.removeClass("panel-closed");
      selector.find(".hexa-icon-menu-btn").removeClass("active");
      selector.find("#hexa-icon-menu").removeClass("closed");
      selector.find("#hexa-toggle-left").removeClass("closed");
      selector
        .find("#hexa-toggle-left")
        .find(".material-icons")
        .html("chevron_left");
      selector.find("#hexa-icon-panel").show();
    }
    /* Close Panel */
    function closePanel() {
      selector.addClass("panel-closed");
      selector.find(".hexa-icon-menu-btn").removeClass("active");
      selector.find("#hexa-icon-menu").addClass("closed");
      selector.find("#hexa-toggle-left").addClass("closed");
      selector
        .find("#hexa-toggle-left")
        .find(".material-icons")
        .html("chevron_right");
      selector.find("#hexa-icon-panel").hide();
    }
    $(document).ready(function () {
      closePanel();
    });
    /* Left Panel Toggle */
    selector.find("#hexa-toggle-left").on("click", function () {
      if ($(this).hasClass("closed")) {
        openPanel();
      } else {
        closePanel();
      }
    });
    /* Right Panel Toggle */
    selector.find("#hexa-toggle-right").on("click", function () {
      if ($(this).hasClass("closed")) {
        selector.removeClass("layers-closed");
        $(this).removeClass("closed");
        $(this).find(".material-icons").html("chevron_right");
        selector.find("#hexa-right-col").show();
      } else {
        selector.addClass("layers-closed");
        $(this).addClass("closed");
        $(this).find(".material-icons").html("chevron_left");
        selector.find("#hexa-right-col").hide();
      }
    });
    selector.find(".hexa-toggle-right").on("click", function (e) {
      e.preventDefault();
      selector.find("#hexa-toggle-right").trigger("click");
    });
    /* Close panels if needed */
    if (windowWidth <= 1200) {
      selector.find("#hexa-toggle-right").trigger("click");
      selector.find("#hexa-toggle-left").trigger("click");
    }
    /* Icon Button */
    selector.find(".hexa-icon-menu-btn").on("click", function () {
      if ($(this).data("target")) {
        if ($(this).hasClass("active")) {
          closePanel();
        } else {
          openPanel();
          $(this).addClass("active");
          selector.find(".hexa-icon-panel-content").addClass("panel-hide");
          selector.find($(this).data("target")).removeClass("panel-hide");
        }
      }
      if ($(this).attr("id") == "hexa-btn-elements") {
        selector.find("#hexa-all-elements-open").trigger("click");
      }
    });
    /* Dropdown Menu */
    selector.find(".hexa-dropdown-wrap").on("click", function () {
      if ($(this).hasClass("opened")) {
        $(this).removeClass("opened");
        $(this).find(".hexa-dropdown").hide();
      } else {
        $(this).addClass("opened");
        $(this).find(".hexa-dropdown").show();
      }
    });

    selector.find(".hexa-accordion-mask").on("click", function () {
      if ($(this).hasClass("opened")) {
        $(this).removeClass("opened");
      } else {
        $(this).addClass("opened");
      }
    });
    $("#hexa-accordion-maskbutton").on("click", function () {
      var arrowIcon = $(this).find(".arrow");
      arrowIcon.toggleClass("arrow-down arrow-up");
      if (arrowIcon.hasClass("arrow-up")) {
        arrowIcon.text("keyboard_arrow_up");
        $("#hexa-mydiv").addClass("active");
      } else {
        arrowIcon.text("keyboard_arrow_down");
        $("#hexa-mydiv").removeClass("active");
      }
    });
    /* Accordion */
    selector
      .find(".hexa-icon-panel-content ul.hexa-accordion > li > a")
      .on("click", function (e) {
        e.preventDefault();
        var parent = $(this).parent().parent();
        if ($(this).parent().hasClass("opened")) {
          parent.find("li").removeClass("opened");
        } else {
          parent.find("li").removeClass("opened");
          $(this).parent().addClass("opened");
        }
      });
    /* Lock/Unlock Button */
    selector.find(".hexa-lock-unlock").on("click", function () {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        $(this).find(".material-icons").html("lock_open");
      } else {
        $(this).addClass("active");
        $(this).find(".material-icons").html("lock");
      }
    });
    /* Rangeslider */
    selector.find(".hexa-slider").on("input", function () {
      var wrapper = $(this).parent().parent();
      wrapper.find(".slider-label span").html($(this).val());
      selector.find("span.tm-count-zoom").html($(this).val());
    });
    /* Toggle conditional fields */
    selector.find('input[type="checkbox"]').on("change", function () {
      if ($(this).data("conditional")) {
        if ($(this).is(":checked")) {
          selector.find($(this).data("conditional")).removeClass("d-none");
        } else {
          selector.find($(this).data("conditional")).addClass("d-none");
        }
      }
    });
    /* Tabs */
    selector.find(".hexa-tabs-menu li").on("click", function () {
      var target = $(this).data("target");
      var wrapper = $(this).parent().parent();
      wrapper.find("> .hexa-tab").removeClass("active");
      $(target).addClass("active");
      wrapper.find("> .hexa-tabs-menu li").removeClass("active");
      $(this).addClass("active");
    });
    /* Numeric validation */
    selector
      .find('input[type="number"],.numeric-field')
      .bind("input paste keyup keydown", function () {
        this.value = this.value
          .replace(/(?!^-)[^0-9.]/g, "")
          .replace(/(\..*)\./g, "$1");
        if ($(this).data("max") && this.value > $(this).data("max")) {
          this.value = $(this).data("max");
        }
        if ($(this).data("min") && this.value < $(this).data("min")) {
          this.value = $(this).data("min");
        }
      });
    // Click event handler for the "Fit" button
    selector.find("#hexa-fit-container").on("click", function () {
      adjustZoom();
      fixZoomOut();
    });
    /* Numeric Plus */
    selector.find(".hexa-counter .counter-plus").on("click", function () {
      var input = $(this).parent().find("input.hexa-form-field");
      var val = parseInt(input.val()) + parseInt(input.data("step"));
      if (input.data("max") && val > input.data("max")) {
        val = input.data("max");
      }
      if (input.data("min") && val < input.data("min")) {
        val = input.data("min");
      }
      if (val < 0) {
        val = 0;
      }
      input.val(val);
      if ($(this).attr("id") == "hexa-img-zoom-in") {
        adjustZoom(val);
      }
    });
    /* Numeric Minus */
    selector.find(".hexa-counter .counter-minus").on("click", function () {
      var input = $(this).parent().find("input.hexa-form-field");
      var val = parseInt(input.val()) - parseInt(input.data("step"));
      if (input.data("max") && val > input.data("max")) {
        val = input.data("max");
      }
      if (input.data("min") && val < input.data("min")) {
        val = input.data("min");
      }
      if (val < 0) {
        val = 0;
      }
      input.val(val);
      if ($(this).attr("id") == "hexa-img-zoom-out") {
        adjustZoom(val);
      }
    });
    /* Deselect Active Object */
    selector.find(".hexa-wrap").on("click", function (e) {
      var target = e.target["id"];
      if (target != "" && target == "hexa-content") {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    });
    // Set Fabric Settings
    fabric.enableGLFiltering = settings.enableGLFiltering;
    fabric.textureSize = parseInt(settings.textureSize);
    fabric.Object.prototype.borderColor = settings.borderColor;
    fabric.Object.prototype.borderDashArray = settings.borderDashArray;
    fabric.Object.prototype.borderOpacityWhenMoving =
      settings.borderOpacityWhenMoving;
    fabric.Object.prototype.borderScaleFactor = settings.borderScaleFactor;
    fabric.Object.prototype.editingBorderColor = settings.editingBorderColor;
    fabric.Object.prototype.cornerColor = settings.cornerColor;
    fabric.Object.prototype.cornerSize = settings.cornerSize;
    fabric.Object.prototype.cornerStrokeColor = settings.cornerStrokeColor;
    fabric.Object.prototype.cornerStyle = settings.cornerStyle;
    fabric.Object.prototype.transparentCorners = settings.transparentCorners;
    fabric.Object.prototype.cursorColor = settings.cursorColor;
    fabric.Object.prototype.cursorWidth = settings.cursorWidth;
    fabric.Object.prototype.strokeUniform = true;
    fabric.Group.prototype.padding = 0;
    fabric.Object.prototype.erasable = false;
    // Delete object control
    var deleteIcon =
      "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='tm_delete_btn' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='512px' height='512px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='256' cy='256' r='256'/%3E%3Cg%3E%3Crect x='120.001' y='239.987' transform='matrix(-0.7071 -0.7071 0.7071 -0.7071 256.0091 618.0168)' style='fill:%23FFFFFF;' width='271.997' height='32'/%3E%3Crect x='240' y='119.989' transform='matrix(-0.7071 -0.7071 0.7071 -0.7071 256.0091 618.0168)' style='fill:%23FFFFFF;' width='32' height='271.997'/%3E%3C/g%3E%3C/svg%3E";
    var deleteimg = document.createElement("img");
    deleteimg.src = deleteIcon;

    function deleteObject(eventData, transform) {
      var target = transform.target;
      if (target.type === "activeSelection") {
        $.each(target._objects, function (index, val) {
          var item = selector.find("#hexa-layers #" + val.id);
          item.find("a.delete-layer").trigger("click");
        });
        canvas.discardActiveObject();
      } else {
        var item = selector.find("#hexa-layers #" + target.id);
        item.find("a.delete-layer").trigger("click");
      }
    }

    function renderDeleteIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(deleteimg, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    function addDeleteIcon(obj) {
      obj.controls.deleteControl = new fabric.Control({
        x: 0,
        y: 0.5,
        offsetY: 22,
        offsetX: 14,
        cursorStyle: "pointer",
        mouseUpHandler: deleteObject,
        render: renderDeleteIcon,
        cornerSize: 24,
      });
    }
    // Clone object control
    var cloneIcon =
      "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='tm_add_btn' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='512px' height='512px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Ccircle style='fill:%23009688;' cx='256' cy='256' r='256'/%3E%3Cg%3E%3Crect x='240' y='120' style='fill:%23FFFFFF;' width='32' height='272'/%3E%3Crect x='120' y='240' style='fill:%23FFFFFF;' width='272' height='32'/%3E%3C/g%3E%3C/svg%3E";
    var cloneimg = document.createElement("img");
    cloneimg.src = cloneIcon;

    function cloneObject(eventData, transform) {
      var target = transform.target;
      if (target.type === "activeSelection") {
        toastr.warning(hexaParams.noDuplicate, hexaParams.warning);
      } else {
        var item = selector.find("#hexa-layers #" + target.id);
        item.find("a.duplicate-layer").trigger("click");
      }
    }

    function renderCloneIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(cloneimg, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    function addCloneIcon(obj) {
      obj.controls.cloneControl = new fabric.Control({
        x: 0,
        y: 0.5,
        offsetY: 22,
        offsetX: -14,
        cursorStyle: "pointer",
        mouseUpHandler: cloneObject,
        render: renderCloneIcon,
        cornerSize: 24,
      });
    }
    // Custom Image Filters
    fabric.Image.filters.Shift = fabric.util.createClass(
      fabric.Image.filters.ColorMatrix,
      {
        type: "Shift",
        matrix: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        mainParameter: false,
        colorsOnly: true,
      }
    );
    // selecting user defined color
    selector.find("#hexa-bg-color").on("change", function () {
      var bgColor = $(this).val();
      setCanvasColor(bgColor);
    });
    selector.find("#color-remover").on("click", function () {
      canvas.backgroundColor = "transparent";
      canvas.renderAll();
    });

    function setCanvasColor(color) {
      canvas.backgroundColor = color;
      canvas.renderAll();
    }
    var colorContainers = document.querySelectorAll("#color-box");
    colorContainers.forEach(function (container) {
      container.addEventListener("click", function () {
        var selectedColor =
          getComputedStyle(container).getPropertyValue("background-color");
        setCanvasColor(selectedColor);
      });
    });
    /* Create Canvas */
    c = selector.find("#hexa-canvas")[0];
    canvas = new fabric.Canvas(c, { preserveObjectStacking: true });
    canvas.backgroundColor = settings.canvasColor;
    /* Set File Name */
    function setFileName(fileName, fileExtention) {
      if (fileName == "") {
        fileName = new Date().getTime();
      }
      if (fileExtention == "") {
        fileExtention = "jpeg";
      } else if (fileExtention == "jpg") {
        fileExtention = "jpeg";
      }
      selector.find(".hexa-file-name").val(fileName);
      selector.find(".hexa-file-name").data("default", fileName);
      selector.find("#hexa-save-img-format").val(fileExtention);
      selector.find("#hexa-save-img-format").trigger("change");
    }
    /* Init */
    function init(getMode) {
      rotate = 0;
      selector.find("#hexa-canvas-loader").css("display", "flex");
      selector
        .find("#hexa-canvas-wrap, .hexa-content-bar")
        .css("visibility", "visible");
      mode = getMode;
      if (canvas.backgroundImage) {
        filters = canvas.backgroundImage.filters;
      }
      // Temp Canvas
      if (mode == "canvas") {
        selector.find("#hexa-canvas-color").trigger("change");
        var newCanvas = document.createElement("canvas");
        var canvas2 = new fabric.Canvas(newCanvas, {
          preserveObjectStacking: true,
        });
        var canvas2Width = parseInt(selector.find("#hexa-canvas-width").val());
        var canvas2Height = parseInt(
          selector.find("#hexa-canvas-height").val()
        );
        if (canvas2Width == "") {
          canvas2Width = 800;
        }
        if (canvas2Height == "") {
          canvas2Height = 800;
        }
        canvas2.setWidth(canvas2Width);
        canvas2.setHeight(canvas2Height);
        canvas2.backgroundColor = "transparent";
        var imgData = canvas2.toDataURL({
          format: "png",
          enableRetinaScaling: false,
        });
        var blob = dataURLtoBlob(imgData);
        var newurl = URL.createObjectURL(blob);
        selector.find("#hexa-canvas-img").attr("src", newurl);
        canvas2.dispose();
      }
      // Canvas Init
      selector.find("#hexa-canvas-img-wrap").imagesLoaded(function () {
        img = selector.find("#hexa-canvas-img")[0];
        imgurl = selector.find("#hexa-canvas-img").attr("src");
        originalWidth = img.width;
        originalHeight = img.height;
        // Display image dimentions
        setDimentions(img);
        canvas.setDimensions({
          width: originalWidth,
          height: originalHeight,
        });
        fabric.Image.fromURL(imgurl, function (img) {
          canvas.setBackgroundImage(
            img,
            canvas.renderAll.bind(canvas),
            {
              objectType: "BG",
              mode: mode,
              scaleX: scaleX,
              scaleY: scaleY,
              selectable: false,
              lockMovementX: true,
              lockMovementY: true,
              lockRotation: true,
              erasable: true,
            },
            {
              crossOrigin: "anonymous",
            }
          );
        });
        adjustZoom();
        modeCheck();
        setTimeout(function () {
          reset();
          addToHistory(
            '<span class="material-icons">flag</span>' + hexaParams.started
          );
        }, 100);
        selector.find("#hexa-canvas-loader").hide();
      });
    }
    // Open the editor with a default image if exists
    if (selector.find("#hexa-canvas-img").attr("src") != "") {
      mode = "image";
      var fileName = selector.find("#hexa-canvas-img").data("filename");
      var fileExtention = selector
        .find("#hexa-canvas-img")
        .attr("src")
        .match(/\.[0-9a-z]+$/i)[0]
        .replace(/\./g, "");
      setFileName(fileName, fileExtention);
      init(mode);
    }
    modeCheck();
    // Open the editor with a default template if exists
    if (selector.find("#hexa-canvas-img").data("template") != "") {
      var fileName = selector.find("#hexa-canvas-img").data("filename");
      selector.find("#hexa-canvas-loader").css("display", "flex");
      selector
        .find("#hexa-canvas-wrap, .hexa-content-bar")
        .css("visibility", "visible");
      selector.find(".hexa-modal").hide();
      var objects = canvas.getObjects();
      objects
        .filter((element) => element.objectType != "BG")
        .forEach((element) => canvas.remove(element));
      selector.find("#hexa-layers li").remove();
      checkLayers();
      $.getJSON(
        selector.find("#hexa-canvas-img").data("template"),
        function (json) {
          loadJSON(json);
          setTimeout(function () {
            addToHistory(
              '<span class="material-icons">flag</span>' + hexaParams.started
            );
            setFileName(fileName, "");
          }, 100);
        }
      )
        .fail(function (jqxhr, textStatus, error) {
          toastr.error("Request Failed: " + error, hexaParams.error);
        })
        .always(function () {
          selector.find("#hexa-canvas-loader").hide();
        });
    }
    /* Reset */
    function reset() {
      // Vars
      rotate = 0;
      scaleX = 1;
      scaleY = 1;
      originX = "left";
      originY = "top";
      if (
        typeof canvas.overlayImage !== "undefined" &&
        canvas.overlayImage !== null
      ) {
        canvas.overlayImage = null;
      }
      if (!selector.find("#keep-data").is(":checked")) {
        canvas.backgroundImage.filters = [];
        selector.find("#hexa-adjust .conditional-settings").addClass("d-none");
        selector.find("#hexa-brightness").prop("checked", false);
        selector.find("#brightness").val(0);
        selector.find("#hexa-contrast").prop("checked", false);
        selector.find("#contrast").val(0);
        selector.find("#hexa-saturation").prop("checked", false);
        selector.find("#saturation").val(0);
        selector.find("#hexa-hue").prop("checked", false);
        selector.find("#hue").val(0);
        selector
          .find("#hexa-filters input[type=checkbox]")
          .prop("checked", false);
        selector.find("#hexa-gamma").prop("checked", false);
        selector.find("#gamma-red").val(1);
        selector.find("#gamma-green").val(1);
        selector.find("#gamma-blue").val(1);
        selector.find("#hexa-blend-color").prop("checked", false);
        selector.find("#blend-color-mode").val("add");
        selector.find("#blend-color-color").spectrum("set", "#ffffff");
        selector.find("#blend-color-alpha").val(0.5);
        selector
          .find("#blend-color-alpha")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(0.5);
        selector.find("#hexa-duotone-color").prop("checked", false);
        selector.find("#duotone-light-color").spectrum("set", "green");
        selector.find("#duotone-dark-color").spectrum("set", "blue");
        selector.find("#hexa-swap-colors").prop("checked", false);
        selector.find("#hexa-blur").prop("checked", false);
        selector.find("#blur").val(0);
        selector.find("#hexa-noise").prop("checked", false);
        selector.find("#noise").val(0);
        selector.find("#hexa-pixelate").prop("checked", false);
        selector.find("#pixelate").val(1);
        var objects = canvas.getObjects();
        objects
          .filter((element) => element.objectType != "BG")
          .forEach((element) => canvas.remove(element));
        selector.find("#hexa-layers li").remove();
        checkLayers();
      } else {
        canvas.backgroundImage.filters = filters;
        canvas.backgroundImage.applyFilters();
      }
      canvas.fire("selection:cleared");
      canvas.requestRenderAll();
    }
    /* Adjust Filter Controls */
    function adjustFilterControls(filters) {
      // Reset
      selector.find("#hexa-brightness").prop("checked", false);
      selector.find("#hexa-contrast").prop("checked", false);
      selector.find("#hexa-saturation").prop("checked", false);
      selector.find("#hexa-hue").prop("checked", false);
      selector.find("#grayscale").prop("checked", false);
      selector.find("#sepia").prop("checked", false);
      selector.find("#brownie").prop("checked", false);
      selector.find("#blackwhite").prop("checked", false);
      selector.find("#vintage").prop("checked", false);
      selector.find("#kodachrome").prop("checked", false);
      selector.find("#polaroid").prop("checked", false);
      selector.find("#technicolor").prop("checked", false);
      selector.find("#invert").prop("checked", false);
      selector.find("#sharpen").prop("checked", false);
      selector.find("#emboss").prop("checked", false);
      selector.find("#hexa-gamma").prop("checked", false);
      selector.find("#hexa-blend-color").prop("checked", false);
      selector.find("#hexa-duotone-color").prop("checked", false);
      selector.find("#hexa-blur").prop("checked", false);
      selector.find("#hexa-noise").prop("checked", false);
      selector.find("#hexa-pixelate").prop("checked", false);
      // Get Values
      if (filters.length !== 0) {
        $.each(filters, function (index, val) {
          if (val.type == "Brightness") {
            selector.find("#hexa-brightness").prop("checked", true);
            selector.find("#brightness").val(val.brightness);
            selector
              .find("#brightness")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.brightness);
          } else if (val.type == "Contrast") {
            selector.find("#hexa-contrast").prop("checked", true);
            selector.find("#contrast").val(val.brightness);
            selector
              .find("#contrast")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.contrast);
          } else if (val.type == "Saturation") {
            selector.find("#hexa-saturation").prop("checked", true);
            selector.find("#saturation").val(val.brightness);
            selector
              .find("#saturation")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.saturation);
          } else if (val.type == "HueRotation") {
            selector.find("#hexa-hue").prop("checked", true);
            selector.find("#hue").val(val.rotation);
            selector
              .find("#hue")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.rotation);
          } else if (val.type == "Grayscale") {
            selector.find("#grayscale").prop("checked", true);
          } else if (val.type == "Sepia") {
            selector.find("#sepia").prop("checked", true);
          } else if (val.type == "Brownie") {
            selector.find("#brownie").prop("checked", true);
          } else if (val.type == "BlackWhite") {
            selector.find("#blackwhite").prop("checked", true);
          } else if (val.type == "Vintage") {
            selector.find("#vintage").prop("checked", true);
          } else if (val.type == "Kodachrome") {
            selector.find("#kodachrome").prop("checked", true);
          } else if (val.type == "Polaroid") {
            selector.find("#polaroid").prop("checked", true);
          } else if (val.type == "Technicolor") {
            selector.find("#technicolor").prop("checked", true);
          } else if (val.type == "Invert") {
            selector.find("#invert").prop("checked", true);
          } else if (val.type == "Convolute") {
            if (val.matrix == "[0,-1,0,-1,5,-1,0,-1,0]") {
              selector.find("#sharpen").prop("checked", true);
            } else if (val.matrix == "[1,1,1,1,0.7,-1,-1,-1,-1]") {
              selector.find("#emboss").prop("checked", true);
            } else if (val.matrix == "[-1,0,1,-2,0,2,-1,0,1]") {
              selector.find("#sobelX").prop("checked", true);
            } else if (val.matrix == "[-1,-2,-1,0,0,0,1,2,1]") {
              selector.find("#sobelY").prop("checked", true);
            }
          } else if (val.type == "Gamma") {
            selector.find("#hexa-gamma").prop("checked", true);
            selector.find("#gamma-red").val(val.gamma[0]);
            selector
              .find("#gamma-red")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.gamma[0]);
            selector.find("#gamma-green").val(val.gamma[1]);
            selector
              .find("#gamma-green")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.gamma[1]);
            selector.find("#gamma-blue").val(val.gamma[2]);
            selector
              .find("#gamma-blue")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.gamma[2]);
          } else if (val.type == "BlendColor") {
            selector.find("#hexa-blend-color").prop("checked", true);
            selector.find("#blend-color-mode").val(val.mode);
            selector.find("#blend-color-color").val(val.color);
            selector.find("#blend-color-alpha").val(val.alpha);
            selector
              .find("#blend-color-alpha")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.alpha);
          } else if (val.type == "Composed") {
            selector.find("#hexa-duotone-color").prop("checked", true);
            selector.find("#duotone-light-color").val(val.subFilters[1].color);
            selector.find("#duotone-dark-color").val(val.subFilters[2].color);
          } else if (val.type == "Blur") {
            selector.find("#hexa-blur").prop("checked", true);
            selector.find("#blur").val(val.blur);
            selector
              .find("#blur")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.blur);
          } else if (val.type == "Noise") {
            selector.find("#hexa-noise").prop("checked", true);
            selector.find("#noise").val(val.noise);
            selector
              .find("#noise")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.noise);
          } else if (val.type == "Pixelate") {
            selector.find("#hexa-pixelate").prop("checked", true);
            selector.find("#pixelate").val(val.blocksize);
            selector
              .find("#pixelate")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.blocksize);
          }
        });
      }
      selector.find("#hexa-brightness").trigger("change");
      selector.find("#hexa-contrast").trigger("change");
      selector.find("#hexa-saturation").trigger("change");
      selector.find("#hexa-hue").trigger("change");
      selector.find("#hexa-gamma").trigger("change");
      selector.find("#hexa-blend-color").trigger("change");
      selector.find("#hexa-blur").trigger("change");
      selector.find("#hexa-noise").trigger("change");
      selector.find("#hexa-pixelate").trigger("change");
    }
    /* Adjust Mode */
    function modeCheck() {
      if (mode == "none") {
        selector
          .find("#hexa-icon-menu, #hexa-icon-panel, #hexa-ruler-icon")
          .css("pointer-events", "none");
        selector.find(".hexa-keep, #modal-add-new .hexa-modal-close").hide();
        selector.find("#modal-add-new").show();
        selector.find("#hexa-save").prop("disabled", true);
      } else {
        selector
          .find("#hexa-canvas-wrap, .hexa-content-bar")
          .css("visibility", "visible");
        selector
          .find("#hexa-icon-menu, #hexa-icon-panel, #hexa-ruler-icon")
          .css("pointer-events", "auto");
        selector.find(".hexa-keep, #modal-add-new .hexa-modal-close").show();
        selector.find("#modal-add-new").hide();
        selector.find("#hexa-save").prop("disabled", false);
      }
      if (mode == "canvas") {
        selector.find(".hide-on-canvas-mode").hide();
      } else {
        selector.find(".hide-on-canvas-mode").show();
      }
    }
    /* MODAL */
    /* Modal Open */
    selector.find(".hexa-modal-open").on("click", function (e) {
      e.preventDefault();
      var target = $(this).data("target");
      selector.find(".hexa-modal").hide();
      selector.find(target).show();
    });
    /* Modal Close */
    selector.find(".hexa-modal-close").on("click", function (e) {
      e.preventDefault();
      var target = $(this).data("target");
      selector.find(target).hide();
    });
    /* Upload Image */
    selector.find("#hexa-image-upload").on("change", function () {
      selector.find(".hexa-modal").hide();
      selector
        .find("#hexa-canvas-wrap, .hexa-content-bar")
        .css("visibility", "visible");
      var reader = new FileReader();
      reader.onload = function (ev) {
        selector.find("#hexa-canvas-img").attr("src", reader.result);
        init("image");
      };
      reader.readAsDataURL(this.files[0]);
      var fileName = this.files[0].name.replace(/\.[^/.]+$/, "");
      var fileExtention = this.files[0].name
        .match(/\.[0-9a-z]+$/i)[0]
        .replace(/\./g, "");
      setFileName(fileName, fileExtention);
    });
    /* Empty Canvas */
    selector.find("#hexa-canvas-create").on("click", function () {
      setFileName(new Date().getTime(), "");
      init("canvas");
    });
    /* TEMPLATE LIBRARY */
    /* Template Search */
    selector.find("#hexa-template-search").on("click", function () {
      var category = selector.find("#hexa-templates-menu").val();
      var input = $(this).parent().find("input");
      selector.find("#hexa-all-templates-noimg").addClass("d-none");
      selector.find("#hexa-templates-grid .grid-item").each(function () {
        $(this).attr("data-keyword", $(this).data("keyword").toLowerCase());
      });
      if ($(this).hasClass("cancel")) {
        selector.find("#hexa-templates-menu").val("all").change();
        selector
          .find("#hexa-templates-menu")
          .parent()
          .find("span.select2-container")
          .css("opacity", 1);
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#hexa-templates-grid .grid-item").show();
        if (selector.find("#hexa-templates-grid-pagination").length) {
          selector.find("#hexa-templates-grid-pagination").pagination("redraw");
          selector
            .find("#hexa-templates-grid-pagination")
            .pagination("selectPage", 1);
        }
        input.prop("disabled", false);
        selector.find("#hexa-templates-menu").prop("disabled", false);
      } else {
        selector
          .find("#hexa-templates-menu")
          .parent()
          .find("span.select2-container")
          .css("opacity", 0.5);
        $(this).addClass("cancel");
        $(this).find(".material-icons").html("close");
        $(this).removeClass("primary");
        $(this).addClass("danger");
        var searchTerm = input.val().toLowerCase().replace(/\s/g, " ");
        if ((searchTerm == "" || searchTerm.length < 1) && category == "all") {
          selector.find("#hexa-templates-grid .grid-item").show();
          if (selector.find("#hexa-templates-grid-pagination").length) {
            selector
              .find("#hexa-templates-grid-pagination")
              .pagination("redraw");
            selector
              .find("#hexa-templates-grid-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#hexa-templates-grid-pagination").length) {
            selector
              .find("#hexa-templates-grid-pagination")
              .pagination("destroy");
          }
          if (category == "all") {
            if (searchTerm != "" || searchTerm.length > 1) {
              selector
                .find("#hexa-templates-grid .grid-item")
                .hide()
                .filter('[data-keyword*="' + searchTerm + '"]')
                .show();
            }
          } else {
            if (searchTerm != "" || searchTerm.length > 1) {
              selector
                .find("#hexa-templates-grid .grid-item")
                .hide()
                .filter('[data-keyword*="' + searchTerm + '"]')
                .filter('[data-category*="' + category + '"]')
                .show();
            } else {
              selector
                .find("#hexa-templates-grid .grid-item")
                .hide()
                .filter('[data-category*="' + category + '"]')
                .show();
            }
          }
          if (
            selector.find("#hexa-templates-grid .grid-item:visible").length ===
            0
          ) {
            selector.find("#hexa-all-templates-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
        selector.find("#hexa-templates-menu").prop("disabled", true);
      }
    });

    // Function to show the modal and get the user's choice (public or private)
function showPublicPrivateModal() {
    return new Promise((resolve, reject) => {
      // Show the modal
      $("#templates-public-private-modal").show();

      // Handle public button click
      $("#saveAsPublic").on("click", function () {
        resolve(true);  // Return 'true' for public
        $("#templates-public-private-modal").hide(); // Hide the modal after selection
      });

      // Handle private button click
      $("#saveAsPrivate").on("click", function () {
        resolve(false); // Return 'false' for private
        $("#templates-public-private-modal").hide(); // Hide the modal after selection
      });
    });
  }

  // Main function for handling the save process
  selector.find("#hexa-json-save").on("click", function () {
    // First, check if the user is logged in and email is verified
    $.ajax({
      url: "https://backend.toddlerneeds.com/api/v1/protected-route",
      type: "GET",
      xhrFields: {
        withCredentials: true, // Include credentials for backend token validation
      },
      error: function (xhr, status, error) {
        toastr.error("Please log in to save any template.", "Login Required");
        console.log("User is not logged in.");
        return;
      },
      success: function (response) {
        if (!response.role) {
          toastr.error("Please log in to save any template.", "Login Required");
          console.log("User is not logged in.");
          return;
        }

        if (!response.isVerified) {
          toastr.error("Please verify your email to save any template.", "Email Verification Required");
          console.log("Email is not verified.");
          return;
        }

        console.log("User is logged in and email is verified.");

        // Show the public/private modal and wait for user selection
        showPublicPrivateModal().then(function (isPublic) {
          // Proceed with saving the template based on the user's selection (isPublic)
          console.log("User selected: ", isPublic ? "Public" : "Private");

          // Convert the canvas to a JSON object, including specific properties
          var json = canvas.toJSON([
            "objectType", "gradientFill", "roundedCorners", "mode", "selectable", "lockMovementX", "lockMovementY",
            "lockRotation", "crossOrigin", "layerName", "customId"
          ]);

          var objects = canvas.getObjects();
          var filteredObjects = objects.filter(function (obj) {
            return obj.customId !== "layoutImage"; // Filter out layoutImage
          });

          // Temporarily hide objects that are not filtered
          canvas.getObjects().forEach(function (obj) {
            if (!filteredObjects.includes(obj)) {
              obj.visible = false;
            }
          });

          // Generate image URL with only visible (filtered) objects
          var canvasImageUrl = canvas.toDataURL({
            format: "png",
            multiplier: 2,
          });

          // Restore visibility of all objects
          canvas.getObjects().forEach(function (obj) {
            obj.visible = true;
          });

          convertToDataURL(json.backgroundImage.src, function (dataUrl) {
            json.backgroundImage.src = dataUrl; // Update the background image source in the JSON

            var template = JSON.stringify(json);
            var blob = new Blob([template], { type: "application/json" });

            var timestamp = new Date().getTime();
            var uniqueFileName = "template_" + timestamp + ".json";
            var formData = new FormData();
            formData.append("files", blob, uniqueFileName);

            var imageBlob = dataURLtoBlob(canvasImageUrl); // Convert the data URL to a Blob
            var imageFileName = "template_image_" + timestamp + ".png";
            formData.append("files", imageBlob, imageFileName);

            $.ajax({
              url: "https://backend.toddlerneeds.com/api/v1/user/media/upload",
              type: "POST",
              data: formData,
              processData: false,
              contentType: false,
              success: function (response) {
                var imageUrl = "";
                var jsonUrl = "";
                response.urls.forEach(function (url) {
                  if (url.endsWith(".json")) {
                    jsonUrl = url;
                  } else if (url.endsWith(".png") || url.endsWith(".jpeg") || url.endsWith(".jpg")) {
                    imageUrl = url;
                  }
                });

                const urlParams = new URLSearchParams(window.location.search);
                const modelName = urlParams.get("name");

                var key = Math.random().toString(36).substr(2, 9);
                var name = selector.find("#hexa-json-save-name").val();

                var data = {
                  key: key,
                  src: jsonUrl,
                  imageUrl: imageUrl,
                  name: name,
                  type: modelName,
                  isPublic: isPublic, // Pass the user's choice (public or private)
                };

                // Upload the data object to the new API
                uploadData(data)
                  .then(() => {
                    toastr.success("Data uploaded successfully!", "Success");
                  })
                  .catch((error) => {
                    toastr.error(error.message, "Error");
                  });
              },
              error: function (xhr, status, error) {
                toastr.error(error, "Error");
              },
            });
          });
        });
      },
    });
  });

    // selector.find("#hexa-json-save").on("click", function () {
    //     // First, check if the user is logged in and email is verified
    //     $.ajax({
    //       url: "https://backend.toddlerneeds.com/api/v1/protected-route",
    //       type: "GET",
    //       xhrFields: {
    //         withCredentials: true, // Include credentials for backend token validation
    //       },
    //       error: function (xhr, status, error) {
    //         // If the API call fails, it means the user is not logged in
    //         toastr.error("Please log in to save any template.", "Login Required");
    //         console.log("User is not logged in.");
    //         return;
    //       },
    //       success: function (response) {
    //         // If the user is not logged in
    //         if (!response.role) {
    //           toastr.error("Please log in to save any template.", "Login Required");
    //           console.log("User is not logged in.");
    //           return;
    //         }

    //         // If the user's email is not verified
    //         if (!response.isVerified) {
    //           toastr.error("Please verify your email to save any template.", "Email Verification Required");
    //           console.log("Email is not verified.");
    //           return;
    //         }

    //         // Proceed with saving the template if user is logged in and email is verified
    //         console.log("User is logged in and email is verified.");

    //         // Convert the canvas to a JSON object, including specific properties
    //         var json = canvas.toJSON([
    //           "objectType",
    //           "gradientFill",
    //           "roundedCorners",
    //           "mode",
    //           "selectable",
    //           "lockMovementX",
    //           "lockMovementY",
    //           "lockRotation",
    //           "crossOrigin",
    //           "layerName",
    //           "customId",
    //         ]);

    //         var objects = canvas.getObjects();
    //         var filteredObjects = objects.filter(function (obj) {
    //           return obj.customId !== "layoutImage"; // Filter out layoutImage
    //         });

    //         // Temporarily hide objects that are not filtered
    //         canvas.getObjects().forEach(function (obj) {
    //           if (!filteredObjects.includes(obj)) {
    //             obj.visible = false;
    //           }
    //         });

    //         // Generate image URL with only visible (filtered) objects
    //         var canvasImageUrl = canvas.toDataURL({
    //           format: "png",
    //           multiplier: 2,
    //         });

    //         // Restore visibility of all objects
    //         canvas.getObjects().forEach(function (obj) {
    //           obj.visible = true;
    //         });

    //         convertToDataURL(json.backgroundImage.src, function (dataUrl) {
    //           json.backgroundImage.src = dataUrl; // Update the background image source in the JSON

    //           var template = JSON.stringify(json);

    //           var blob = new Blob([template], { type: "application/json" });

    //           var timestamp = new Date().getTime();
    //           var uniqueFileName = "template_" + timestamp + ".json";
    //           var formData = new FormData();
    //           formData.append("files", blob, uniqueFileName);

    //           var imageBlob = dataURLtoBlob(canvasImageUrl); // Convert the data URL to a Blob
    //           var imageFileName = "template_image_" + timestamp + ".png";
    //           formData.append("files", imageBlob, imageFileName);

    //           $.ajax({
    //             url: "https://backend.toddlerneeds.com/api/v1/user/media/upload",
    //             type: "POST",
    //             data: formData,
    //             processData: false,
    //             contentType: false,
    //             success: function (response) {
    //               var imageUrl = "";
    //               var jsonUrl = "";
    //               response.urls.forEach(function (url) {
    //                 if (url.endsWith(".json")) {
    //                   jsonUrl = url;
    //                 } else if (
    //                   url.endsWith(".png") ||
    //                   url.endsWith(".jpeg") ||
    //                   url.endsWith(".jpg")
    //                 ) {
    //                   imageUrl = url;
    //                 }
    //               });
    //               const urlParams = new URLSearchParams(window.location.search);
    //               const modelName = urlParams.get("name");

    //               var key = Math.random().toString(36).substr(2, 9);
    //               var name = selector.find("#hexa-json-save-name").val();

    //               var data = {
    //                 key: key,
    //                 src: jsonUrl,
    //                 imageUrl: imageUrl,
    //                 name: name,
    //                 type: modelName,
    //               };

    //               // Upload the data object to the new API
    //               uploadData(data)
    //                 .then(() => {
    //                   // Display a success message using toastr after successful upload
    //                   toastr.success("Data uploaded successfully!", "Success");
    //                 })
    //                 .catch((error) => {
    //                   // Display an error message using toastr if uploading fails
    //                   toastr.error(error.message, "Error");
    //                 });
    //             },
    //             error: function (xhr, status, error) {
    //               // Display an error message using toastr if the API call fails
    //               toastr.error(error, "Error");
    //             },
    //           });
    //         });
    //       },
    //     });
    //   });


    function uploadData(data) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: "https://backend.toddlerneeds.com/api/v1/user/file-data/upload",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(data),
          xhrFields: {
            withCredentials: true,
          },
          success: function (response) {
            resolve(response);
          },
          error: function (xhr, status, error) {
            reject(error);
          },
        });
      });
    }

    $(document).on("click", "#hexa-new", function () {
      fetchAndDisplayTemplates();
    });

    function deleteTemplate(key) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `https://backend.toddlerneeds.com/api/v1/user/delete/${key}`,
          type: "DELETE",
          success: function (response) {
            resolve(response);
          },
          error: function (xhr, status, error) {
            reject(error);
          },
        });
      });
    }

    function fetchAndDisplayTemplates() {
      const url = window.location.href;
      // let type = "";

      // if (url.includes("p3-type1.html")) {
      //   type = "p3-type1";
      // } else if (url.includes("p2-type1.html")) {
      //   type = "p2-type1";
      // }
      const urlParams = new URLSearchParams(window.location.search);
      const modelName = urlParams.get("name");
      getAllSavedData()
        .then((assets) => {
          const templatesContainer = $("#hexa-my-templates");
          templatesContainer.empty(); // Clear existing content

          if (assets.length === 0) {
            templatesContainer.html(
              '<div class="notice notice-info">No templates found.</div>'
            );
          } else {
            assets.forEach((asset) => {
              if (asset.type === modelName) {
                const jsonblob = new Blob([asset.src], { type: "text/plain" });
                const jsonurl = URL.createObjectURL(jsonblob);

                const listItem = $("<li>").attr("data-keyword", asset.name);

                listItem.html(`
                      <div>${asset.name}</div>
                      <div>
                          <button type="button" class="hexa-btn primary hexa-select-template" data-json="${asset.src}">
                              <span class="material-icons">check</span>Select
                          </button>
                          <button type="button" class="hexa-btn danger hexa-template-delete" data-target="${asset.key}">
                              <span class="material-icons">clear</span>Delete
                          </button>
                      </div>
                  `);

                templatesContainer.append(listItem);
              }
            });
          }
        })
        .catch((error) => {
          toastr.error(error.message, "Error retrieving assets");
        });
    }

    function getAllSavedData() {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: "https://backend.toddlerneeds.com/api/v1/user/get/all",
          type: "GET",
          contentType: "application/json",
          success: function (response) {
            resolve(response.data);
          },
          error: function (xhr, status, error) {
            reject(error);
          },
        });
      });
    }

    // Example usage of deleteData function

    $(document).on("click", ".hexa-template-delete", function () {
      var assetKey = $(this).data("target");

      // Function to handle the template deletion
      deleteTemplate(assetKey);
    });

    function deleteAssetFromIndexedDB(dbName, storeName, key) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = (event) => {
          reject(event.target.error);
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(storeName, "readwrite");
          const store = transaction.objectStore(storeName);

          const deleteRequest = store.delete(key);

          deleteRequest.onsuccess = () => {
            resolve();
          };

          deleteRequest.onerror = (event) => {
            reject(event.target.error);
          };

          transaction.oncomplete = () => {
            db.close();
          };
        };
      });
    }

    /* Download Template */
    selector.find("#hexa-json-download").on("click", function () {
      var name = selector.find("#hexa-json-download-name").val();
      var json = canvas.toJSON([
        "objectType",
        "gradientFill",
        "roundedCorders",
        "mode",
        "selectable",
        "lockMovementX",
        "lockMovementY",
        "lockRotation",
        "crossOrigin",
        "layerName",
      ]);
      convertToDataURL(json.backgroundImage.src, function (dataUrl) {
        json.backgroundImage.src = dataUrl;
        var json2 = JSON.stringify(json);
        var a = document.createElement("a");
        var file = new Blob([json2], {
          type: "text/plain",
        });
        a.href = URL.createObjectURL(file);
        a.download = name + ".json";
        a.click();
        selector.find(".hexa-modal").hide();
      });
    });
    /* Load JSON */
    function loadJSON(json) {
      console.log("this is the json", json.objects);
      selector.find("#hexa-canvas-loader").css("display", "flex");
      rotate = json.backgroundImage.angle;
      scaleX = json.backgroundImage.scaleX;
      scaleY = json.backgroundImage.scaleY;
      originX = json.backgroundImage.originX;
      originY = json.backgroundImage.originY;
      canvas.clear();
      selector.find("#hexa-layers li").remove();
      mode = json.backgroundImage.mode;
      var blob = dataURLtoBlob(json.backgroundImage.src);
      imgurl = URL.createObjectURL(blob);
      selector.find("#hexa-canvas-img").attr("src", imgurl);
      originalWidth = json.backgroundImage.width;
      originalHeight = json.backgroundImage.height;
      var dimentions = {
        width: originalWidth,
        height: originalHeight,
      };

      var filteredObjects = [];
      var clipmaskObjects = [];

      json.objects.forEach((obj) => {
        if (obj.customId === "clipmask") {
          clipmaskObjects.push(obj);
          document.getElementById("done-masking-img").style.display = "block";
        } else {
          filteredObjects.push(obj);
        }
      });
      var clipmaskData = {
        image: null,
        path: null,
      };

      clipmaskObjects.forEach((obj) => {
        if (obj.type === "image") {
          clipmaskData.image = obj;
        } else if (obj.type === "path") {
          clipmaskData.path = obj;
        }
      });

      json.objects = filteredObjects;

      for (var i = 0; i < json.objects.length; i++) {
        if (json.objects[i].objectType == "textbox") {
          json.objects[i].fontFamily = json.objects[i].fontFamily + "-hexa";
        }
      }

      canvas.loadFromJSON(
        json,
        function () {
          var objects = canvas.getObjects();
          var textboxes = objects.filter(
            (element) => element.objectType == "textbox"
          );
          loadTemplateFonts(textboxes);
          checkLayers();
          selector
            .find("#hexa-canvas-color")
            .spectrum("set", canvas.backgroundColor);
          selector
            .find("#custom-image-background")
            .spectrum("set", canvas.backgroundColor);
          img = selector.find("#hexa-canvas-img")[0];
          canvas.requestRenderAll();
          selector.find("#hexa-canvas-loader").hide();
          if (clipmaskData.image != null && clipmaskData.path != null) {
            applyTemplateClipMask(clipmaskData.image, clipmaskData.path);
          }
        },
        function () {},
        {
          crossOrigin: "anonymous",
        }
      );
      setFileName(new Date().getTime(), "");
      setDimentions(dimentions);
      adjustZoom();
      modeCheck();
      canvas.fire("selection:cleared");
      setTimeout(function () {
        selector.find("#hexa-layers > li").removeClass("active");
        if (json.backgroundImage) {
          adjustFilterControls(json.backgroundImage["filters"]);
        }
        if (json.overlayImage) {
          selector.find("#hexa-overlay-wrap").show();
          selector
            .find("#hexa-overlay-preview")
            .attr("src", json.overlayImage.src);
        } else {
          selector.find("#hexa-overlay-wrap").hide();
          selector.find("#hexa-overlay-preview").attr("src", "");
        }
      }, 100);
    }

    /* Load Template Fonts */
    function loadTemplateFonts(objects) {
      if (objects.length !== 0) {
        $.each(objects, function (index, val) {
          var font = val.fontFamily.replace("-hexa", "");
          val.fontFamily = settings.fontFamily;
          var loadFonts = "yes";
          if (font == "") {
            loadFonts = "no";
          } else {
            for (var i = 0; i < webSafeFonts.length; i++) {
              if (webSafeFonts[i][1] == font) {
                loadFonts = "no";
                break;
              }
            }
          }
          if (loadFonts == "yes") {
            WebFont.load({
              google: {
                families: [
                  font + ":regular,bold",
                  font + ":italic,regular,bold",
                ],
              },
            });
            var fontNormal = new FontFaceObserver(font, {
              weight: "normal",
              style: "normal",
            });
            var fontBold = new FontFaceObserver(font, {
              weight: "bold",
              style: "normal",
            });
            var fontNormalItalic = new FontFaceObserver(font, {
              weight: "normal",
              style: "italic",
            });
            var fontBoldItalic = new FontFaceObserver(font, {
              weight: "bold",
              style: "italic",
            });
            Promise.all([
              fontNormal.load(null, 5000),
              fontBold.load(null, 5000),
              fontNormalItalic.load(null, 5000),
              fontBoldItalic.load(null, 5000),
            ])
              .then(function () {
                val.set("fontFamily", font);
                canvas.requestRenderAll();
              })
              .catch(function (e) {
                console.log(e);
              });
          } else {
            val.set("fontFamily", font);
            canvas.requestRenderAll();
          }
        });
      }
    }
    /* Upload Template */
    selector.find("#hexa-json-upload").on("change", function (e) {
      selector
        .find("#hexa-canvas-wrap, .hexa-content-bar")
        .css("visibility", "visible");
      selector.find("#hexa-canvas-loader").css("display", "flex");
      var reader = new FileReader();
      var json = "";
      reader.onload = function (ev) {
        json = JSON.parse(reader.result);

        loadJSON(json);
        selector.find("#hexa-canvas-loader").hide();
        setTimeout(function () {
          addToHistory(
            '<span class="material-icons">flag</span>' + hexaParams.started
          );
        }, 100);
      };
      reader.readAsText(e.target.files[0]);
      selector.find(".hexa-modal").hide();
    });
    /* Add Template */
    selector
      .find(".template-selection")
      .on("click", ".hexa-select-template", function () {
        selector
          .find("#hexa-canvas-wrap, .hexa-content-bar")
          .css("visibility", "visible");
        selector.find(".hexa-modal").hide();
        selector.find("#hexa-canvas-loader").css("display", "flex");
        var objects = canvas.getObjects();
        objects
          .filter((element) => element.objectType != "BG")
          .forEach((element) => canvas.remove(element));
        selector.find("#hexa-layers li").remove();
        checkLayers();
        $.getJSON($(this).data("json"), function (json) {
          loadJSON(json);
          setTimeout(function () {
            addToHistory(
              '<span class="material-icons">flag</span>' + hexaParams.started
            );
          }, 100);
        })
          .fail(function (jqxhr, textStatus, error) {
            toastr.error("Request Failed: " + error, hexaParams.error);
          })
          .always(function () {
            selector.find("#hexa-canvas-loader").hide();
          });
      });
    /* Search My Templates */
    selector.find("#hexa-my-templates-search").on("click", function () {
      var input = $(this).parent().find("input");
      selector.find("#hexa-my-templates-noimg").addClass("d-none");
      selector.find("#hexa-my-templates li").each(function () {
        $(this).attr("data-keyword", $(this).data("keyword").toLowerCase());
      });
      if (input.val() == "") {
        return;
      }
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#hexa-my-templates li").show();
        if (selector.find("#hexa-my-templates-pagination").length) {
          selector.find("#hexa-my-templates-pagination").pagination("redraw");
          selector
            .find("#hexa-my-templates-pagination")
            .pagination("selectPage", 1);
        }
        input.prop("disabled", false);
      } else {
        $(this).addClass("cancel");
        $(this).find(".material-icons").html("close");
        $(this).removeClass("primary");
        $(this).addClass("danger");
        var searchTerm = input.val().toLowerCase().replace(/\s/g, " ");
        console.log(searchTerm);
        if (searchTerm == "" || searchTerm.length < 1) {
          selector.find("#hexa-my-templates li").show();
          if (selector.find("#hexa-my-templates-pagination").length) {
            selector.find("#hexa-my-templates-pagination").pagination("redraw");
            selector
              .find("#hexa-my-templates-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#hexa-my-templates-pagination").length) {
            selector
              .find("#hexa-my-templates-pagination")
              .pagination("destroy");
          }
          selector
            .find("#hexa-my-templates li")
            .hide()
            .filter('[data-keyword*="' + searchTerm + '"]')
            .show();
          if (selector.find("#hexa-my-templates li:visible").length === 0) {
            selector.find("#hexa-my-templates-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
      }
    });
    /* Watermark */
    function add_watermark() {
      if (settings.watermark) {
        var location = settings.watermarkLocation;
        var scaledFontSize =
          (originalWidth * settings.watermarkFontSize) / 1400;
        var watermark = new fabric.Textbox(" " + settings.watermarkText + " ", {
          objectType: "watermark",
          gradientFill: "none",
          fontSize: scaledFontSize,
          fontFamily: settings.watermarkFontFamily,
          fontWeight: settings.watermarkFontWeight,
          fontStyle: settings.watermarkFontStyle,
          lineHeight: 1,
          fill: settings.watermarkFontColor,
          textBackgroundColor: settings.watermarkBackgroundColor,
          width: getScaledSize()[0],
          left: 0,
        });
        canvas.add(watermark);
        if (location == "bottom-right") {
          watermark.textAlign = "right";
          watermark.top = getScaledSize()[1] - watermark.height;
        } else if (location == "bottom-left") {
          watermark.textAlign = "left";
          watermark.top = getScaledSize()[1] - watermark.height;
        } else if (location == "top-right") {
          watermark.textAlign = "right";
          watermark.top = 0;
        } else if (location == "top-left") {
          watermark.textAlign = "left";
          watermark.top = 0;
        }
        watermark.moveTo(999);
      }
    }

    function remove_watermark() {
      if (settings.watermark) {
        objects = canvas.getObjects();
        objects
          .filter((element) => element.objectType === "watermark")
          .forEach((element) => canvas.remove(element));
      }
    }
    /* Download Image */
    selector.find("#hexa-download").on("click", function () {
      var name = selector.find("#hexa-download-name").val();
      var quality = parseFloat(selector.find("#hexa-download-quality").val());
      var format = selector.find("#hexa-download-format").val();
      var link = document.createElement("a");
      add_watermark();
      canvas.setZoom(1);
      selector.find("#hexa-img-zoom").val(100);
      var zoomWidth = originalHeight;
      var zoomHeight = originalWidth;
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        zoomWidth = originalWidth;
        zoomHeight = originalHeight;
      }
      canvas.setWidth(zoomWidth);
      canvas.setHeight(zoomHeight);
      var blob = "";
      if (format == "svg") {
        var svgData = canvas.toSVG({
          suppressPreamble: false,
          width: originalWidth,
          height: originalHeight,
        });
        var texts = canvas
          .getObjects()
          .filter((element) => element.objectType == "textbox");
        var def = '<defs><style type="text/css"><![CDATA[';
        var fonts = [];
        var objurl = "";
        $.each(texts, function (index, value) {
          var font = value.fontFamily;
          var loadFonts = "yes";
          for (var i = 0; i < webSafeFonts.length; i++) {
            if (webSafeFonts[i][1] == font) {
              loadFonts = "no";
              break;
            }
          }
          if (loadFonts == "yes") {
            if (!fonts.includes(font)) {
              fonts.push(font);
            }
          }
        });
        if (fonts.length > 0) {
          $.each(fonts, function (index, value) {
            var isLastElement = index == fonts.length - 1;
            var slug = value.replace(/ /g, "+");
            $.ajax({
              url:
                "https://fonts.googleapis.com/css?family=" +
                slug +
                ":italic,regular,bold",
              type: "GET",
              dataType: "text",
              crossDomain: true,
              success: function (cssText) {
                def = def + cssText;
                setTimeout(function () {
                  if (isLastElement) {
                    svgData = svgData.replace("<defs>", def + "]]></style>");
                    blob = new Blob([svgData], {
                      type: "image/svg+xml;charset=utf-8",
                    });
                    objurl = URL.createObjectURL(blob);
                    link.download = name + "." + format;
                    link.href = objurl;
                    link.click();
                  }
                }, 500);
              },
              error: function (jqXHR, error, errorThrown) {
                if (jqXHR.status && jqXHR.status == 400) {
                  toastr.error(jqXHR.responseText, hexaParams.error);
                } else {
                  toastr.error(hexaParams.wrong, hexaParams.error);
                }
              },
            });
          });
        } else {
          blob = new Blob([svgData], {
            type: "image/svg+xml;charset=utf-8",
          });
          objurl = URL.createObjectURL(blob);
          link.download = name + "." + format;
          link.href = objurl;
          link.click();
        }
      } else {
        var imgData = canvas.toDataURL({
          format: format,
          quality: quality,
          enableRetinaScaling: false,
        });
        if (format != "webp") {
          imgData = changeDpiDataUrl(
            imgData,
            selector.find("#hexa-download-img-dpi").val()
          );
        }
        blob = dataURLtoBlob(imgData);
        objurl = URL.createObjectURL(blob);
        link.download = name + "." + format;
        link.href = objurl;
        link.click();
      }
      remove_watermark();
      adjustZoom();
      canvas.requestRenderAll();
      selector.find(".hexa-modal").hide();
    });
    /* Download File Format Select */
    selector.find("#hexa-download-format").on("change", function () {
      if ($(this).val() == "png" || $(this).val() == "svg") {
        selector.find("#hexa-download-quality").prop("disabled", true);
      } else {
        selector.find("#hexa-download-quality").prop("disabled", false);
      }
    });
    /* Save File Format Select */
    selector.find("#hexa-save-img-format").on("change", function () {
      if ($(this).val() == "png" || $(this).val() == "svg") {
        selector.find("#hexa-save-img-quality").prop("disabled", true);
      } else {
        selector.find("#hexa-save-img-quality").prop("disabled", false);
      }
    });
    /* BLANK CANVAS */
    selector.find("#hexa-canvas-size-select").on("change", function () {
      var val = $(this).val();
      if (val == "custom") {
        selector.find("#hexa-canvas-width").prop("disabled", false);
        selector.find("#hexa-canvas-height").prop("disabled", false);
      } else {
        selector.find("#hexa-canvas-width").prop("disabled", true);
        selector.find("#hexa-canvas-height").prop("disabled", true);
      }
      selector
        .find("#hexa-canvas-width")
        .val($(this).find(":selected").data("width"));
      selector
        .find("#hexa-canvas-height")
        .val($(this).find(":selected").data("height"));
    });
    // Canvas Background
    selector.find("#hexa-canvas-color").on("change", function () {
      var val = $(this).val();
      selector.find("#custom-image-background").spectrum("set", val);
      if (val == "") {
        canvas.backgroundColor = "transparent";
        canvas.requestRenderAll();
      } else {
        canvas.backgroundColor = val;
        canvas.requestRenderAll();
      }
    });
    /* MEDIA LIBRARY */
    selector.find("#hexa-media-library").on("click", function () {
      mmediaLibraryMode = "add-to-canvas";
    });
    selector.find("#hexa-img-media-library").on("click", function () {
      mmediaLibraryMode = "add-as-object";
    });
    selector.find("#hexa-img-replace-media-library").on("click", function () {
      mmediaLibraryMode = "replace-image";
    });
    selector.find("#hexa-overlay-img-media-library").on("click", function () {
      mmediaLibraryMode = "overlay-image";
    });
    /* Select Image */
    selector
      .find("#modal-media-library")
      .on(
        "click",
        ".media-library-grid>.hexa-masonry-item>.hexa-masonry-item-inner",
        function () {
          selector.find("#hexa-canvas-loader").css("display", "flex");
          selector.find("#hexa-canvas-wrap").css("visibility", "visible");
          var fullImg = $(this).find("img").data("full");
          var tempImg = new Image();
          if (mmediaLibraryMode == "add-to-canvas") {
            var fullImgCheck = fullImg.substring(0, fullImg.indexOf("?"));
            var fileName = $(this).find("img").data("filename");
            var fileExtention = "";
            if (fullImgCheck != "") {
              fileExtention = fullImgCheck
                .match(/\.[0-9a-z]+$/i)[0]
                .replace(/\./g, "");
            } else {
              fileExtention = fullImg
                .match(/\.[0-9a-z]+$/i)[0]
                .replace(/\./g, "");
            }
            setFileName(fileName, fileExtention);
            convertToDataURL(fullImg, function (dataUrl) {
              tempImg.src = dataUrl;
              tempImg.onload = function () {
                selector.find("#hexa-canvas-img").attr("src", dataUrl);
                init("image");
              };
            });
          } else if (mmediaLibraryMode == "add-as-object") {
            convertToDataURL(fullImg, function (dataUrl) {
              tempImg.src = dataUrl;
              tempImg.onload = function () {
                var image = new fabric.Image(tempImg, {
                  objectType: "image",
                  roundedCorders: 0,
                  stroke: "#fff",
                  strokeWidth: 0,
                  top: getScaledSize()[1] / 2,
                  left: getScaledSize()[0] / 2,
                  originX: "center",
                  originY: "center",
                });
                canvas.add(image);
                image.scaleToWidth(getScaledSize()[0] / 2);
                if (image.isPartiallyOnScreen()) {
                  image.scaleToHeight(getScaledSize()[1] / 2);
                }
                canvas.setActiveObject(image);
                canvas.requestRenderAll();
                selector.find("#hexa-canvas-loader").hide();
                canvas.fire("hexa:history", {
                  type: "image",
                  text: hexaParams.added,
                });
              };
            });
          } else if (mmediaLibraryMode == "replace-image") {
            convertToDataURL(fullImg, function (dataUrl) {
              tempImg.src = dataUrl;
              tempImg.onload = function () {
                canvas.getActiveObject().setSrc(dataUrl);
                canvas.requestRenderAll();
                selector.find("#hexa-canvas-loader").hide();
                canvas.fire("hexa:history", {
                  type: "image",
                  text: hexaParams.replaced,
                });
              };
            });
          } else if (mmediaLibraryMode == "overlay-image") {
            fabric.Image.fromURL(fullImg, function (img) {
              img.set({
                scaleX: getScaledSize()[0] / img.width,
                scaleY: getScaledSize()[1] / img.height,
                objectCaching: false,
                originX: "left",
                originY: "top",
                selectable: false,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                erasable: true,
              });
              canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
              selector.find("#hexa-overlay-wrap").show();
              selector.find("#hexa-overlay-preview").attr("src", fullImg);
              setTimeout(function () {
                selector.find("#hexa-canvas-loader").hide();
              }, 500);
            });
          }
          selector.find("#modal-media-library").hide();
        }
      );
    /* Search My Images */
    selector.find("#hexa-library-my-search").on("click", function () {
      var input = $(this).parent().find("input");
      selector.find("#hexa-library-my-noimg").addClass("d-none");
      if (input.val() == "") {
        return;
      }
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#hexa-library-my .hexa-masonry-item").show();
        if (selector.find("#hexa-library-my-pagination").length) {
          selector.find("#hexa-library-my-pagination").pagination("redraw");
          selector
            .find("#hexa-library-my-pagination")
            .pagination("selectPage", 1);
        }
        input.prop("disabled", false);
      } else {
        $(this).addClass("cancel");
        $(this).find(".material-icons").html("close");
        $(this).removeClass("primary");
        $(this).addClass("danger");
        var searchTerm = input.val().toLowerCase().replace(/\s/g, " ");
        if (searchTerm == "" || searchTerm.length < 1) {
          selector.find("#hexa-library-my .hexa-masonry-item").show();
          if (selector.find("#hexa-library-my-pagination").length) {
            selector.find("#hexa-library-my-pagination").pagination("redraw");
            selector
              .find("#hexa-library-my-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#hexa-library-my-pagination").length) {
            selector.find("#hexa-library-my-pagination").pagination("destroy");
          }
          selector
            .find("#hexa-library-my .hexa-masonry-item")
            .hide()
            .filter('[data-keyword*="' + searchTerm + '"]')
            .show();
          if (
            selector.find("#hexa-library-my .hexa-masonry-item:visible")
              .length === 0
          ) {
            selector.find("#hexa-library-my-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
      }
    });
    /* Search All Images */
    selector.find("#hexa-library-all-search").on("click", function () {
      var input = $(this).parent().find("input");
      selector.find("#hexa-library-all-noimg").addClass("d-none");
      if (input.val() == "") {
        return;
      }
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#hexa-library-all .hexa-masonry-item").show();
        if (selector.find("#hexa-library-all-pagination").length) {
          selector.find("#hexa-library-all-pagination").pagination("redraw");
          selector
            .find("#hexa-library-all-pagination")
            .pagination("selectPage", 1);
        }
        input.prop("disabled", false);
      } else {
        $(this).addClass("cancel");
        $(this).find(".material-icons").html("close");
        $(this).removeClass("primary");
        $(this).addClass("danger");
        var searchTerm = input.val().toLowerCase().replace(/\s/g, " ");
        if (searchTerm == "" || searchTerm.length < 1) {
          selector.find("#hexa-library-all .hexa-masonry-item").show();
          if (selector.find("#hexa-library-all-pagination").length) {
            selector.find("#hexa-library-all-pagination").pagination("redraw");
            selector
              .find("#hexa-library-all-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#hexa-library-all-pagination").length) {
            selector.find("#hexa-library-all-pagination").pagination("destroy");
          }
          selector
            .find("#hexa-library-all .hexa-masonry-item")
            .hide()
            .filter('[data-keyword*="' + searchTerm + '"]')
            .show();
          if (
            selector.find("#hexa-library-all .hexa-masonry-item:visible")
              .length === 0
          ) {
            selector.find("#hexa-library-all-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
      }
    });
    /* Save Image */
    selector.find("#hexa-save-img").on("click", function () {
      var quality = parseFloat(selector.find("#hexa-save-img-quality").val());
      var format = selector.find("#hexa-save-img-format").val();
      var imgData = "";
      add_watermark();
      canvas.setZoom(1);
      selector.find("#hexa-img-zoom").val(100);
      var zoomWidth = originalHeight;
      var zoomHeight = originalWidth;
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        zoomWidth = originalWidth;
        zoomHeight = originalHeight;
      }
      canvas.setWidth(zoomWidth);
      canvas.setHeight(zoomHeight);
      if (format == "svg") {
        imgData = canvas.toSVG({
          suppressPreamble: false,
          width: originalWidth,
          height: originalHeight,
        });
        var texts = canvas
          .getObjects()
          .filter((element) => element.objectType == "textbox");
        var def = '<defs><style type="text/css"><![CDATA[';
        var fonts = [];
        $.each(texts, function (index, value) {
          var font = value.fontFamily;
          var loadFonts = "yes";
          for (var i = 0; i < webSafeFonts.length; i++) {
            if (webSafeFonts[i][1] == font) {
              loadFonts = "no";
              break;
            }
          }
          if (loadFonts == "yes") {
            if (!fonts.includes(font)) {
              fonts.push(font);
            }
          }
        });
        if (fonts.length > 0) {
          $.each(fonts, function (index, value) {
            var isLastElement = index == fonts.length - 1;
            var slug = value.replace(/ /g, "+");
            $.ajax({
              url:
                "https://fonts.googleapis.com/css?family=" +
                slug +
                ":italic,regular,bold",
              type: "GET",
              dataType: "text",
              crossDomain: true,
              success: function (cssText) {
                def = def + cssText;
                setTimeout(function () {
                  if (isLastElement) {
                    imgData = imgData.replace("<defs>", def + "]]></style>");
                  }
                }, 500);
              },
              error: function (jqXHR, error, errorThrown) {
                if (jqXHR.status && jqXHR.status == 400) {
                  toastr.error(jqXHR.responseText, hexaParams.error);
                } else {
                  toastr.error(hexaParams.wrong, hexaParams.error);
                }
              },
            });
          });
        }
      } else {
        // http://fabricjs.com/docs/fabric.Canvas.html#toDataURL
        imgData = canvas.toDataURL({
          format: format,
          quality: quality,
          enableRetinaScaling: false,
        });
        if (format != "webp") {
          imgData = changeDpiDataUrl(
            imgData,
            selector.find("#hexa-download-img-dpi").val()
          );
        }
      }
      settings.saveImage.call(this, selector, imgData);
      selector.find(".hexa-modal").hide();
      remove_watermark();
      adjustZoom();
      canvas.requestRenderAll();
    });
    /* SVG LIBRARY */
    /* Select SVG */
    selector
      .find(".svg-library-grid")
      .on("click", ">.hexa-masonry-item>.hexa-masonry-item-inner", function () {
        var fullSVG = $(this).find("img").data("full");
        fabric.loadSVGFromURL(
          fullSVG,
          function (objects, options) {
            var svg = fabric.util.groupSVGElements(objects, options);
            svg.set("originX", "center");
            svg.set("originY", "center");
            svg.set("left", getScaledSize()[0] / 2);
            svg.set("top", getScaledSize()[1] / 2);
            svg.set("objectType", "customSVG");
            svg.scaleToWidth(getScaledSize()[0] / 2);
            svg.scaleToHeight(getScaledSize()[1] / 2);
            canvas.add(svg);
            canvas.setActiveObject(svg);
            canvas.requestRenderAll();
          },
          function () {},
          {
            crossOrigin: "anonymous",
          }
        );
        selector.find("#modal-svg-library").hide();
      });
    /* Search My SVGs */
    selector.find("#hexa-svg-library-my-search").on("click", function () {
      var input = $(this).parent().find("input");
      selector.find("#hexa-svg-library-my-noimg").addClass("d-none");
      if (input.val() == "") {
        return;
      }
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#hexa-svg-library-my .hexa-masonry-item").show();
        if (selector.find("#hexa-svg-library-my-pagination").length) {
          selector.find("#hexa-svg-library-my-pagination").pagination("redraw");
          selector
            .find("#hexa-svg-library-my-pagination")
            .pagination("selectPage", 1);
        }
        input.prop("disabled", false);
      } else {
        $(this).addClass("cancel");
        $(this).find(".material-icons").html("close");
        $(this).removeClass("primary");
        $(this).addClass("danger");
        var searchTerm = input.val().toLowerCase().replace(/\s/g, " ");
        if (searchTerm == "" || searchTerm.length < 1) {
          selector.find("#hexa-svg-library-my .hexa-masonry-item").show();
          if (selector.find("#hexa-svg-library-my-pagination").length) {
            selector
              .find("#hexa-svg-library-my-pagination")
              .pagination("redraw");
            selector
              .find("#hexa-svg-library-my-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#hexa-svg-library-my-pagination").length) {
            selector
              .find("#hexa-svg-library-my-pagination")
              .pagination("destroy");
          }
          selector
            .find("#hexa-svg-library-my .hexa-masonry-item")
            .hide()
            .filter('[data-keyword*="' + searchTerm + '"]')
            .show();
          if (
            selector.find("#hexa-svg-library-my .hexa-masonry-item:visible")
              .length === 0
          ) {
            selector.find("#hexa-svg-library-my-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
      }
    });
    /* Search All SVGs */
    selector.find("#hexa-svg-library-all-search").on("click", function () {
      var input = $(this).parent().find("input");
      selector.find("#hexa-library-all-noimg").addClass("d-none");
      if (input.val() == "") {
        return;
      }
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#hexa-svg-library-all .hexa-masonry-item").show();
        if (selector.find("#hexa-svg-library-all-pagination").length) {
          selector
            .find("#hexa-svg-library-all-pagination")
            .pagination("redraw");
          selector
            .find("#hexa-svg-library-all-pagination")
            .pagination("selectPage", 1);
        }
        input.prop("disabled", false);
      } else {
        $(this).addClass("cancel");
        $(this).find(".material-icons").html("close");
        $(this).removeClass("primary");
        $(this).addClass("danger");
        var searchTerm = input.val().toLowerCase().replace(/\s/g, " ");
        if (searchTerm == "" || searchTerm.length < 1) {
          selector.find("#hexa-svg-library-all .hexa-masonry-item").show();
          if (selector.find("#hexa-svg-library-all-pagination").length) {
            selector
              .find("#hexa-svg-library-all-pagination")
              .pagination("redraw");
            selector
              .find("#hexa-svg-library-all-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#hexa-svg-library-all-pagination").length) {
            selector
              .find("#hexa-svg-library-all-pagination")
              .pagination("destroy");
          }
          selector
            .find("#hexa-svg-library-all .hexa-masonry-item")
            .hide()
            .filter('[data-keyword*="' + searchTerm + '"]')
            .show();
          if (
            selector.find("#hexa-svg-library-all .hexa-masonry-item:visible")
              .length === 0
          ) {
            selector.find("#hexa-svg-library-all-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
      }
    });
    /* HISTORY */
    function objectName(type) {
      var layerName = hexaParams.object;
      var layerIcon = "category";
      if (type == null) {
        layerName = hexaParams.object;
        layerIcon = "category";
      } else if (type == "textbox") {
        layerName = hexaParams.text;
        layerIcon = "title";
      } else if (type == "drawing") {
        layerName = hexaParams.freeDrawing;
        layerIcon = "brush";
      } else if (type == "frame") {
        layerName = hexaParams.frame;
        layerIcon = "wallpaper";
      } else if (type == "image") {
        layerName = hexaParams.image;
        layerIcon = "image";
      } else if (type == "circle") {
        layerName = hexaParams.circle;
      } else if (type == "square") {
        layerName = hexaParams.square;
      } else if (type == "rectangle") {
        layerName = hexaParams.rectangle;
      } else if (type == "triangle") {
        layerName = hexaParams.triangle;
      } else if (type == "ellipse") {
        layerName = hexaParams.ellipse;
      } else if (type == "trapezoid") {
        layerName = hexaParams.trapezoid;
      } else if (type == "pentagon") {
        layerName = hexaParams.pentagon;
      } else if (type == "octagon") {
        layerName = hexaParams.octagon;
      } else if (type == "emerald") {
        layerName = hexaParams.emerald;
      } else if (type == "star") {
        layerName = hexaParams.star;
      } else if (type == "element") {
        layerName = hexaParams.element;
        layerIcon = "star";
      } else if (type == "BG") {
        layerName = hexaParams.bg;
        layerIcon = "image";
      } else if (type == "customSVG") {
        layerName = hexaParams.customSvg;
      } else if (type == "qrCode") {
        layerName = hexaParams.qrCode;
        layerIcon = "qr_code";
      }
      return (
        '<span class="material-icons">' + layerIcon + "</span>" + layerName
      );
    }
    // Add to history
    function addToHistory(action) {
      var list = selector.find("#hexa-history-list");
      var today = new Date();
      var time =
        String(today.getHours()).padStart(2, "0") +
        ":" +
        String(today.getMinutes()).padStart(2, "0") +
        ":" +
        String(today.getSeconds()).padStart(2, "0");
      var json = canvas.toJSON([
        "objectType",
        "gradientFill",
        "roundedCorders",
        "mode",
        "selectable",
        "lockMovementX",
        "lockMovementY",
        "lockRotation",
        "crossOrigin",
        "layerName",
      ]);
      selector.find("#hexa-history").prop("disabled", false);
      list.find("li").removeClass("active");
      list.prepend(
        '<li class="active"><div class="info">' +
          action +
          '<span class="time">' +
          time +
          '</span></div><div><button type="button" class="hexa-btn primary"><span class="material-icons">restore</span>Restore</button><button type="button" class="hexa-btn danger"><span class="material-icons">clear</span>Delete</button><script type="text/json">' +
          JSON.stringify(json) +
          "</script></div></li>"
      );
      var count = list.find("li").length;
      var limit = list.data("max");
      if (count > limit) {
        list.find("li").last().remove();
      }
      selector.find("#hexa-history-count").html(list.find("li").length);
      var undo = list.find("li.active").next("li");
      var redo = list.find("li.active").prev("li");
      if (undo.length) {
        selector.find("#hexa-undo").prop("disabled", false);
      } else {
        selector.find("#hexa-undo").prop("disabled", true);
      }
      if (redo.length) {
        selector.find("#hexa-redo").prop("disabled", false);
      } else {
        selector.find("#hexa-redo").prop("disabled", true);
      }
    }
    // Undo
    // selector.find("#hexa-undo").on("click", function() {
    // 	var target = selector.find("#hexa-history-list li.active").next("li");
    // if (target.length) {
    // 	target.find(".hexa-btn.primary").trigger("click");
    // 	selector.find("#hexa-redo").prop("disabled", false);
    // } else {
    // 	selector.find("#hexa-undo").prop("disabled", true);
    // }
    // });
    selector.find("#hexa-undo").on("click", function () {
      var historyList = selector.find("#hexa-history-list");
      var activeListItem = historyList.find("li.active");

      if (activeListItem.length) {
        var target = activeListItem.next("li");

        if (target.length) {
          var lastAction = getLastAction(target);

          // Now you have information about the last action

          // Trigger other actions based on the lastAction if needed
          if (lastAction.json.objects.length > 0) {
            console.log(lastAction.json.objects.length > 0);
            target.find(".hexa-btn.primary").trigger("click");
            selector.find("#hexa-redo").prop("disabled", false);
          }
        } else {
          selector.find("#hexa-undo").prop("disabled", true);
        }
      }
    });

    // Function to get the last action from a history list item
    function getLastAction(historyItem) {
      var actionInfo = {
        action: historyItem.find(".info").text(),
        time: historyItem.find(".time").text(),
        json: JSON.parse(historyItem.find("script[type='text/json']").text()),
      };

      return actionInfo;
    }

    // Redo
    selector.find("#hexa-redo").on("click", function () {
      var target = selector.find("#hexa-history-list li.active").prev("li");
      if (target.length) {
        target.find(".hexa-btn.primary").trigger("click");
        selector.find("#hexa-undo").prop("disabled", false);
      } else {
        selector.find("#hexa-redo").prop("disabled", true);
      }
    });
    // Delete history
    selector
      .find("#hexa-history-list")
      .on("click", ".hexa-btn.danger", function () {
        $(this).parent().parent().remove();
        if (!$("#hexa-history-list li").length) {
          selector.find("#hexa-history").prop("disabled", true);
          selector.find("#hexa-undo").prop("disabled", true);
          selector.find("#hexa-redo").prop("disabled", true);
          selector.find(".hexa-modal").hide();
        }
      });
    // Restore history
    selector
      .find("#hexa-history-list")
      .on("click", ".hexa-btn.primary", function () {
        selector.find("#hexa-history-list li").removeClass("active");
        $(this).parent().parent().addClass("active");
        var undo = selector.find("#hexa-history-list li.active").next("li");
        var redo = selector.find("#hexa-history-list li.active").prev("li");
        if (undo.length) {
          selector.find("#hexa-undo").prop("disabled", false);
        } else {
          selector.find("#hexa-undo").prop("disabled", true);
        }
        if (redo.length) {
          selector.find("#hexa-redo").prop("disabled", false);
        } else {
          selector.find("#hexa-redo").prop("disabled", true);
        }
        var json = JSON.parse($(this).parent().find("script").html());
        selector.find(".hexa-modal").hide();
        convertToDataURL(json.backgroundImage.src, function (dataUrl) {
          json.backgroundImage.src = dataUrl;
          loadJSON(json);
          selector.find("#hexa-canvas-loader").hide();
        });
      });

    selector.find("#openEditor").on("click", function () {
      var $mainContainer = selector.find("#mini-editor-main-cont");
      var $buttonContainer = selector.find("#webg-buttons-container");

      // Remove the 'personalise-page-active' class from the main container
      $mainContainer.removeClass("personalise-page-active");
      // Add the 'personalise-page-inactive' class to the main container
      $mainContainer.addClass("personalise-page-inactive");

      // Remove the 'toggle-2d-3d-cont' class from the button container
      $buttonContainer.removeClass("toggle-2d-3d-cont");

      var editedCanvasJson = window.editedCanvasJson;
      var originalCanvasJson = window.originalCanvasJson;

      if (editedCanvasJson && originalCanvasJson) {
        var originalCanvasObject = originalCanvasJson;
        var editedCanvasObject = editedCanvasJson;

        // Iterate over the objects in canvasObject to update their properties
        editedCanvasObject.objects.forEach((obj, index) => {
          if (originalCanvasObject.objects[index]) {
            var originalObj = originalCanvasObject.objects[index];

            // Copy the values for top, left, scaleX, and scaleY from originalObj
            obj.top = originalObj.top;
            obj.left = originalObj.left;
            obj.scaleX = originalObj.scaleX;
            obj.scaleY = originalObj.scaleY;

            // Iterate over properties of the originalObj and add missing ones to obj
            for (var key in originalObj) {
              if (originalObj.hasOwnProperty(key) && !obj.hasOwnProperty(key)) {
                obj[key] = originalObj[key];
              }
            }
          }
        });

        // Load the updated JSON into your editor or canvas
        loadJSON(editedCanvasObject);
      } else {
        console.log("No saved canvas JSON found in localStorage.");
      }
    });
    selector.find("#editInEditorpBtn").on("click", function () {
      var $mainContainer = selector.find("#mini-editor-main-cont");
      var $buttonContainer = selector.find("#webg-buttons-container");

      // Remove the 'personalise-page-active' class from the main container
      $mainContainer.removeClass("personalise-page-active");
      // Add the 'personalise-page-inactive' class to the main container
      $mainContainer.addClass("personalise-page-inactive");

      // Remove the 'toggle-2d-3d-cont' class from the button container
      $buttonContainer.removeClass("toggle-2d-3d-cont");
      var editedCanvasJson = window.editedCanvasJson;
      var originalCanvasJson = window.originalCanvasJson;

      if (editedCanvasJson && originalCanvasJson) {
        var originalCanvasObject = originalCanvasJson;
        var editedCanvasObject = editedCanvasJson;

        // Iterate over the objects in canvasObject to update their properties
        editedCanvasObject.objects.forEach((obj, index) => {
          if (originalCanvasObject.objects[index]) {
            var originalObj = originalCanvasObject.objects[index];

            // Copy the values for top, left, scaleX, and scaleY from originalObj
            obj.top = originalObj.top;
            obj.left = originalObj.left;
            obj.scaleX = originalObj.scaleX;
            obj.scaleY = originalObj.scaleY;

            // Iterate over properties of the originalObj and add missing ones to obj
            for (var key in originalObj) {
              if (originalObj.hasOwnProperty(key) && !obj.hasOwnProperty(key)) {
                obj[key] = originalObj[key];
              }
            }
          }
        });

        // Load the updated JSON into your editor or canvas
        loadJSON(editedCanvasObject);
      } else {
        console.log("No saved canvas JSON found in localStorage.");
      }
    });
    /**Disable Right Click */
    // 	$(document).on('contextmenu', function(event) {
    // 		event.preventDefault();
    // 	  });
    // $(document).keydown(function (event) {
    //     if (event.keyCode == 123) {
    //         return false;
    //     }
    //     else if ((event.ctrlKey && event.shiftKey && event.keyCode == 73) || (event.ctrlKey && event.shiftKey && event.keyCode == 74)) {
    //         return false;
    //     }
    // });

    /* Clear history */
    selector.find("#hexa-clear-history").on("click", function () {
      var answer = window.confirm(hexaParams.question1);
      if (answer) {
        selector.find("#hexa-history-list li").remove();
        selector.find("#hexa-history").prop("disabled", true);
        selector.find("#hexa-undo").prop("disabled", true);
        selector.find("#hexa-redo").prop("disabled", true);
        selector.find(".hexa-modal").hide();
      }
    });
    /* EVENTS */
    canvas.on("hexa:history", function (e) {
      addToHistory(objectName(e.type) + " " + e.text);
    });
    var isObjectMoving = false;
    canvas.on("mouse:up", function (e) {
      var obj = e.target;
      if (obj !== null) {
        var objType = obj.objectType;
        if (isObjectMoving) {
          addToHistory(objectName(objType) + " " + hexaParams.moved);
        }
      }
      if (
        typeof canvas.overlayImage !== "undefined" &&
        canvas.overlayImage !== null
      ) {
        canvas.overlayImage.set("opacity", 1);
      }
    });
    canvas.on("object:moving", function (e) {
      isObjectMoving = true;
      if (
        typeof canvas.overlayImage !== "undefined" &&
        canvas.overlayImage !== null
      ) {
        canvas.overlayImage.set("opacity", 0.7);
      }
      var tempW = originalHeight;
      var tempH = originalWidth;
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        tempW = originalWidth;
        tempH = originalHeight;
      }
      var obj = e.target;
      var objWidth = obj.getScaledWidth();
      var objHeight = obj.getScaledHeight();
      if (obj.isPartiallyOnScreen() && obj.objectType == "clipPath") {
        // top - left
        if (obj.top < 0 && obj.left < 0) {
          obj.top = 0;
          obj.left = 0;
          obj.lockMovementX = true;
          obj.lockMovementY = true;
        }
        // top - right
        else if (obj.top < 0 && objWidth + obj.left > tempW) {
          obj.top = 0;
          obj.left = tempW - objWidth;
          obj.lockMovementX = true;
          obj.lockMovementY = true;
        }
        // bottom - left
        else if (objHeight + obj.top > tempH && obj.left < 0) {
          obj.top = tempH - objHeight;
          obj.left = 0;
          obj.lockMovementX = true;
          obj.lockMovementY = true;
        }
        // bottom - right
        else if (objHeight + obj.top > tempH && objWidth + obj.left > tempW) {
          obj.top = tempH - objHeight;
          obj.left = tempW - objWidth;
          obj.lockMovementX = true;
          obj.lockMovementY = true;
        }
        // top
        else if (obj.top < 0) {
          obj.top = 0;
          obj.lockMovementY = true;
        }
        // left
        else if (obj.left < 0) {
          obj.left = 0;
          obj.lockMovementX = true;
        }
        // right
        else if (objWidth + obj.left > tempW) {
          obj.left = tempW - objWidth;
          obj.lockMovementX = true;
        }
        // bottom
        else if (objHeight + obj.top > tempH) {
          obj.top = tempH - objHeight;
          obj.lockMovementY = true;
        }
        obj.setCoords();
      }
    });
    canvas.on("object:scaling", function (e) {
      var tempW = originalHeight;
      var tempH = originalWidth;
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        tempW = originalWidth;
        tempH = originalHeight;
      }
      var obj = e.target;
      var objWidth = obj.getScaledWidth();
      var objHeight = obj.getScaledHeight();
      if (obj.isPartiallyOnScreen() && obj.objectType == "clipPath") {
        // Max Width
        if (objWidth >= tempW) {
          obj.set({
            scaleX: tempW / obj.width,
          });
          obj.lockScalingX = true;
        }
        // Max Height
        if (objHeight >= tempH) {
          obj.set({
            scaleY: tempH / obj.height,
          });
          obj.lockScalingY = true;
        }
        // top
        if (obj.top < 0) {
          obj.top = 0;
          obj.lockScalingX = true;
          obj.lockScalingY = true;
          obj.setCoords();
        }
        // left
        if (obj.left < 0) {
          obj.left = 0;
          obj.lockScalingX = true;
          obj.lockScalingY = true;
          obj.setCoords();
        }
        // right
        if (objWidth + obj.left > tempW) {
          obj.left = tempW - objWidth;
          obj.lockScalingX = true;
          obj.lockScalingY = true;
          obj.setCoords();
        }
        // bottom
        if (objHeight + obj.top > tempH) {
          obj.top = tempH - objHeight;
          obj.lockScalingX = true;
          obj.lockScalingY = true;
          obj.setCoords();
        }
      }
    });
    canvas.on("object:added", function (e) {
      var obj = e.target;
      if (
        obj.objectType != "clipPath" &&
        obj.objectType != "drawing" &&
        obj.objectType != "watermark"
      ) {
        if (canvas.isDrawingMode === true) {
          obj.set("objectType", "drawing");
          obj.set("selectable", false);
          obj.set("lockMovementX", true);
          obj.set("lockMovementY", true);
          obj.set("lockRotation", true);
        } else {
          var order = canvas.getObjects().indexOf(obj);
          var output = "";
          var layerName = "Object";
          var layerIcon = "category";
          var visibility = "layer-visible";
          var visibilityTag = "visibility";
          var lock = "layer-unlocked";
          var lockTag = "lock_open";
          if (obj.visible == false) {
            visibility = "layer-hidden";
            visibilityTag = "visibility_off";
          }
          if (obj.selectable == false) {
            lock = "layer-locked";
            lockTag = "lock";
          }
          obj.set("id", new Date().getTime());
          selector.find("#hexa-layers > li").removeClass("active");
          if (obj.objectType == "textbox") {
            layerName = obj.text;
            layerIcon = "title";
          } else if (obj.objectType == "drawing") {
            layerName = hexaParams.freeDrawing;
            layerIcon = "brush";
          } else if (obj.objectType == "frame") {
            layerName = hexaParams.frame;
            layerIcon = "wallpaper";
          } else if (obj.objectType == "image") {
            layerName = hexaParams.image;
            layerIcon = "image";
          } else if (obj.objectType == "circle") {
            layerName = hexaParams.circle;
          } else if (obj.objectType == "square") {
            layerName = hexaParams.square;
          } else if (obj.objectType == "rectangle") {
            layerName = hexaParams.rectangle;
          } else if (obj.objectType == "triangle") {
            layerName = hexaParams.triangle;
          } else if (obj.objectType == "ellipse") {
            layerName = hexaParams.ellipse;
          } else if (obj.objectType == "trapezoid") {
            layerName = hexaParams.trapezoid;
          } else if (obj.objectType == "pentagon") {
            layerName = hexaParams.pentagon;
          } else if (obj.objectType == "octagon") {
            layerName = hexaParams.octagon;
          } else if (obj.objectType == "emerald") {
            layerName = hexaParams.emerald;
          } else if (obj.objectType == "star") {
            layerName = hexaParams.star;
          } else if (obj.objectType == "element") {
            layerName = hexaParams.element;
            layerIcon = "star";
          } else if (obj.objectType == "customSVG") {
            layerName = hexaParams.customSvg;
          } else if (obj.objectType == "qrCode") {
            layerName = hexaParams.qrCode;
            layerIcon = "qr_code";
          }
          if ("layerName" in obj) {
            layerName = obj.layerName;
          }
          output =
            '<li id="' +
            obj.id +
            '" data-type="' +
            obj.objectType +
            '" class="layer-' +
            obj.objectType +
            ' active" data-sort="' +
            order +
            '"><span class="material-icons">' +
            layerIcon +
            '</span><input class="layer-name" autocomplete="off" value="' +
            layerName +
            '" /><span class="material-icons layer-settings">settings</span><div class="layer-icons"><a class="material-icons lock-layer ' +
            lock +
            '" title="' +
            hexaParams.lockunlock +
            '">' +
            lockTag +
            '</a><a class="material-icons text-success duplicate-layer" title="' +
            hexaParams.duplicate +
            '">content_copy</a><a class="material-icons layer-visibility ' +
            visibility +
            '" title="' +
            hexaParams.showhide +
            '">' +
            visibilityTag +
            '</a><a class="material-icons text-danger delete-layer" title="' +
            hexaParams.delete +
            '">clear</a></div></li>';
          selector.find("#hexa-layers").prepend(output);
          deleteLayerEvent(obj.id);
          cloneLayerEvent(obj.id);
          visibilityLayerEvent(obj.id);
          lockLayerEvent(obj.id);
          clickLayerEvent(obj.id);
          layerNameEvent(obj.id);
          selector.find("#hexa-layers").sortable("refresh");
          checkLayers();
          addDeleteIcon(obj);
          addCloneIcon(obj);
        }
      }
    });
    canvas.on("object:modified", function (e) {
      var obj = e.target;
      if (obj.objectType == "textbox" && obj.id) {
        selector
          .find("#hexa-layers #" + obj.id + " .layer-name")
          .html(obj.text);
        selector
          .find("#text-rotate")
          .val(parseInt(canvas.getActiveObject().angle));
        selector
          .find("#text-rotate")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(parseInt(canvas.getActiveObject().angle));
      }
      if (obj.objectType == "image" && obj.id) {
        selector
          .find("#img-rotate")
          .val(parseInt(canvas.getActiveObject().angle));
        selector
          .find("#img-rotate")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(parseInt(canvas.getActiveObject().angle));
      }
      if (obj.objectType == "element" && obj.id) {
        selector
          .find("#element-rotate")
          .val(parseInt(canvas.getActiveObject().angle));
        selector
          .find("#element-rotate")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(parseInt(canvas.getActiveObject().angle));
      }
      if (obj.objectType == "customSVG" && obj.id) {
        selector
          .find("#customsvg-rotate")
          .val(parseInt(canvas.getActiveObject().angle));
        selector
          .find("#customsvg-rotate")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(parseInt(canvas.getActiveObject().angle));
      }
      if (shapeTypes.includes(obj.objectType) && obj.id) {
        selector
          .find("#shape-rotate")
          .val(parseInt(canvas.getActiveObject().angle));
        selector
          .find("#shape-rotate")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(parseInt(canvas.getActiveObject().angle));
      }
      if (obj.objectType == "clipPath") {
        obj.lockScalingX = false;
        obj.lockScalingY = false;
        obj.lockMovementX = false;
        obj.lockMovementY = false;
      }
    });
    canvas.on("erasing:end", function () {
      addToHistory(
        '<span class="material-icons">brush</span>' + hexaParams.erased
      );
    });
    /* Horizontal Align Center */
    selector.find(".hexa-horizontal-center").on("click", function () {
      var obj = canvas.getActiveObject();
      obj.set("originX", "center");
      obj.set("left", getScaledSize()[0] / 2);
      canvas.requestRenderAll();
    });
    /* Vertical Align Center */
    selector.find(".hexa-vertical-center").on("click", function () {
      var obj = canvas.getActiveObject();
      obj.set("originY", "center");
      obj.set("top", getScaledSize()[1] / 2);
      canvas.requestRenderAll();
    });
    // Selection Events
    canvas.on("selection:created", function (e) {
      var obj = e.selected;
      layerToggle(obj);
    });
    canvas.on("selection:updated", function (e) {
      var obj = e.selected;
      layerToggle(obj);
      selector.find("#hexa-font-family").trigger("change");
    });
    canvas.on("selection:cleared", function () {
      selector.find("#hexa-text-settings").hide();
      selector.find("#hexa-image-settings").hide();
      selector.find("#hexa-shape-settings").hide();
      selector.find("#hexa-custom-element-options").hide();
      selector.find("#hexa-custom-element-options-info").show();
      selector.find("#hexa-custom-svg-options").hide();
      selector.find("#hexa-layers > li").removeClass("active");
    });
    /* Layers */
    selector
      .find("#hexa-layers")
      .sortable({
        placeholder: "layer-placeholder",
        axis: "y",
        update: function (e, ui) {
          var objects = canvas.getObjects();
          $("#hexa-layers li").each(function (index, value) {
            $(this).attr("data-sort", index + 1);
            objects
              .filter((element) => element.id == value.id)
              .forEach((element) => element.moveTo(-(index + 1)));
          });
          canvas.requestRenderAll();
        },
        create: function (e, ui) {
          checkLayers();
        },
      })
      .disableSelection();
    /* Settings toggle */
    selector.find("#hexa-layers").on("click", ".layer-settings", function () {
      var layerSettings = $(this).next();
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        layerSettings.hide();
      } else {
        selector.find("#hexa-layers .layer-icons").hide();
        selector.find("#hexa-layers .layer-settings").removeClass("active");
        $(this).addClass("active");
        layerSettings.show();
      }
    });
    /* Delete Layer Event */
    function deleteLayerEvent(id) {
      var item = selector.find("#hexa-layers #" + id);
      item.find("a.delete-layer").on("click", function (e) {
        e.preventDefault();
        canvas.fire("hexa:history", {
          type: item.data("type"),
          text: hexaParams.removed,
        });
        var objects = canvas.getObjects();
        objects
          .filter((element) => element.id == id)
          .forEach((element) => canvas.remove(element));
        item.remove();
        canvas.requestRenderAll();
        selector.find("#hexa-layers").sortable("refresh");
        checkLayers();
      });
    }
    /* Clone Layer Event */
    function cloneLayerEvent(id) {
      var item = selector.find("#hexa-layers #" + id);
      item.find("a.duplicate-layer").on("click", function (e) {
        e.preventDefault();
        var objects = canvas.getObjects();
        objects
          .filter((element) => element.id == id)
          .forEach((element) =>
            element.clone(function (cloned) {
              cloned.set("id", new Date().getTime());
              cloned.set("objectType", element.objectType);
              canvas.add(cloned);
              canvas.setActiveObject(cloned);
            })
          );
        canvas.requestRenderAll();
        selector.find("#hexa-layers").sortable("refresh");
        canvas.fire("hexa:history", {
          type: item.data("type"),
          text: hexaParams.added,
        });
      });
    }
    /* Visibility Layer Event */
    function visibilityLayerEvent(id) {
      var item = selector.find("#hexa-layers #" + id);
      item.find("a.layer-visibility").on("click", function (e) {
        e.preventDefault();
        var objects = canvas.getObjects();
        if ($(this).hasClass("layer-visible")) {
          $(this).removeClass("layer-visible");
          $(this).addClass("layer-hidden");
          $(this).html("visibility_off");
          objects
            .filter((element) => element.id == id)
            .forEach((element) => element.set("visible", false));
        } else if ($(this).hasClass("layer-hidden")) {
          $(this).removeClass("layer-hidden");
          $(this).addClass("layer-visible");
          $(this).html("visibility");
          objects
            .filter((element) => element.id == id)
            .forEach((element) => element.set("visible", true));
        }
        canvas.requestRenderAll();
      });
    }
    /* Lock/Unlock Layer Event */
    function lockLayerEvent(id) {
      var item = selector.find("#hexa-layers #" + id);
      item.find("a.lock-layer").on("click", function (e) {
        e.preventDefault();
        var obj = canvas.getActiveObject();
        if ($(this).hasClass("layer-unlocked")) {
          $(this).removeClass("layer-unlocked");
          $(this).addClass("layer-locked");
          $(this).html("lock");
          obj.set({
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            selectable: false,
          });
        } else if ($(this).hasClass("layer-locked")) {
          $(this).removeClass("layer-locked");
          $(this).addClass("layer-unlocked");
          $(this).html("lock_open");
          obj.set({
            lockMovementX: false,
            lockMovementY: false,
            lockRotation: false,
            selectable: true,
          });
        }
        canvas.requestRenderAll();
      });
    }
    /* Layer Click Event */
    function clickLayerEvent(id) {
      var item = selector.find("#hexa-layers #" + id);
      item.on("click", function (e) {
        var objects = canvas.getObjects();
        var id = $(this).attr("id");
        objects
          .filter((element) => element.id == id)
          .forEach((element) => canvas.setActiveObject(element));
        selector.find("#hexa-layers > li").removeClass("active");
        $(this).addClass("active");
        canvas.requestRenderAll();
      });
    }
    /* Layer Name Event */
    function layerNameEvent(id) {
      var item = selector.find("#hexa-layers #" + id);
      item.find(".layer-name").on("change", function (e) {
        var objects = canvas.getObjects();
        var id = $(this).parent("li").attr("id");
        objects
          .filter((element) => element.id == id)
          .forEach((element) =>
            element.set({
              layerName: $(this).val(),
            })
          );
      });
    }
    /* Layer Click Event */
    function checkLayers() {
      if (!selector.find("#hexa-layers li").length) {
        selector.find("#hexa-no-layer").show();
        selector.find("#hexa-layer-delete-wrap").css("visibility", "hidden");
      } else {
        selector.find("#hexa-no-layer").hide();
        selector.find("#hexa-layer-delete-wrap").css("visibility", "visible");
      }
    }
    /* Layer Toggle */
    function layerToggle(obj) {
      selector.find("#hexa-layers li").removeClass("active");
      if (obj.length >= 2) {
        for (var i = 0; i < obj.length; i++) {
          selector.find("#hexa-layers #" + obj[i].id).addClass("active");
        }
      } else {
        obj = obj[0];
        if (obj.objectType) {
          // Textbox
          if (obj.objectType == "textbox") {
            selector.find("#hexa-text-settings").show();
            setTextSettings(obj);
            if (!selector.find("#hexa-btn-text").hasClass("active")) {
              selector.find("#hexa-btn-text").trigger("click");
            }
            selector.find("#hexa-font-family").trigger("change");
          } else {
            selector.find("#hexa-text-settings").hide();
          }
          // Image
          if (obj.objectType == "image") {
            selector.find("#hexa-image-settings").show();
            setImageSettings(obj);
            if (!selector.find("#hexa-btn-image").hasClass("active")) {
              selector.find("#hexa-btn-image").trigger("click");
              selector.find("#hexa-img-mode").trigger("click");
            }
          } else {
            selector.find("#hexa-image-settings").hide();
          }
          // Frames
          if (obj.objectType == "frame") {
            if (!selector.find("#hexa-btn-frames").hasClass("active")) {
              selector.find("#hexa-btn-frames").trigger("click");
            }
          }
          // Elements
          if (obj.objectType == "element") {
            selector.find("#hexa-custom-element-options").show();
            selector.find("#hexa-custom-element-options-info").hide();
            setElementSettings(obj);
            if (!selector.find("#hexa-btn-elements").hasClass("active")) {
              selector.find("#hexa-btn-elements").trigger("click");
            }
            selector.find("#hexa-custom-element-open").trigger("click");
          } else {
            selector.find("#hexa-custom-element-options").hide();
            selector.find("#hexa-custom-element-options-info").show();
          }
          // Custom SVG
          if (obj.objectType == "customSVG") {
            selector.find("#hexa-custom-svg-options").show();
            setCustomSVGSettings(obj);
            if (!selector.find("#hexa-btn-icons").hasClass("active")) {
              selector.find("#hexa-btn-icons").trigger("click");
            }
            selector.find("#hexa-custom-svg-open").trigger("click");
          } else {
            selector.find("#hexa-custom-svg-options").hide();
          }
          // Shapes
          if (shapeTypes.includes(obj.objectType)) {
            if (resizableShapeTypes.includes(obj.objectType)) {
              selector.find("#shape-custom-width-wrap").show();
            } else {
              selector.find("#shape-custom-width-wrap").hide();
            }
            selector.find("#hexa-shape-settings").show();
            setShapeSettings(obj);
            if (!selector.find("#hexa-btn-shapes").hasClass("active")) {
              selector.find("#hexa-btn-shapes").trigger("click");
            }
          } else {
            selector.find("#hexa-shape-settings").hide();
          }
          if (obj.id) {
            selector.find("#hexa-layers #" + obj.id).addClass("active");
          }
        } else {
          $.each(obj, function (index, val) {
            selector.find("#hexa-layers #" + val.id).addClass("active");
          });
        }
      }
    }
    /* Layer Delete */
    selector.find("#hexa-layer-delete").on("click", function () {
      var answer = window.confirm(hexaParams.question2);
      if (answer) {
        var type = selector.find("#hexa-layer-select").val();
        var objects = canvas.getObjects();
        if (type == "all") {
          objects.forEach((element) => canvas.remove(element));
          selector.find("#hexa-layers > li").remove();
        } else {
          objects
            .filter((element) => element.objectType == type)
            .forEach((element) => canvas.remove(element));
          selector.find("#hexa-layers > li.layer-" + type).remove();
        }
        canvas.requestRenderAll();
        selector.find("#hexa-layers").sortable("refresh");
        checkLayers();
      }
    });
    /* Set Background Image */
    function setBackgroundImage() {
      fabric.Image.fromURL(imgurl, function (img) {
        canvas.setBackgroundImage(
          img,
          canvas.renderAll.bind(canvas),
          {
            objectType: "BG",
            mode: mode,
            top: 0,
            left: 0,
            scaleX: scaleX,
            scaleY: scaleY,
            selectable: false,
            angle: rotate,
            originX: originX,
            originY: originY,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            erasable: true,
          },
          {
            crossOrigin: "anonymous",
          }
        );
      });
    }
    /* Adjust Zoom */
    function adjustZoom(zoom) {
      var zoomWidth = originalHeight;
      var zoomHeight = originalWidth;
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        zoomWidth = originalWidth;
        zoomHeight = originalHeight;
      }
      if (zoom) {
        zoom = zoom / 100;
        canvas.setZoom(zoom);
      } else {
        var currentZoom = selector.find("#hexa-img-zoom").val();
        var requiredRatio = 100;
        var ratio = 1;
        var ratio2 = 0;
        if (
          zoomWidth < selector.find("#hexa-content").width() &&
          zoomHeight < selector.find("#hexa-content").height()
        ) {
          canvas.setZoom(1);
          selector.find("#hexa-img-zoom").val(100);
        } else {
          if (zoomWidth > selector.find("#hexa-content").width()) {
            ratio = (selector.find("#hexa-content").width() - 60) / zoomWidth;
            requiredRatio = ratio.toFixed(2) * 100;
            if (currentZoom > requiredRatio) {
              canvas.setZoom(ratio.toFixed(2));
              selector.find("#hexa-img-zoom").val(ratio.toFixed(2) * 100);
              ratio2 = ratio.toFixed(2);
            }
          }
          if (zoomHeight > selector.find("#hexa-content").height()) {
            ratio = selector.find("#hexa-content").height() / zoomHeight;
            requiredRatio = ratio.toFixed(2) * 100;
            if (currentZoom > requiredRatio) {
              if (ratio2 === 0 || ratio2 > ratio.toFixed(2)) {
                canvas.setZoom(ratio.toFixed(2));
                selector.find("#hexa-img-zoom").val(ratio.toFixed(2) * 100);
              }
            }
          }
        }
      }
      canvas.setWidth(zoomWidth * canvas.getZoom());
      canvas.setHeight(zoomHeight * canvas.getZoom());
      if (canvas.isDrawingMode === true) {
        if (selector.find("#hexa-erase-btn").hasClass("active")) {
          selector.find("#eraser-width").trigger("input");
        }
        if (selector.find("#hexa-draw-btn").hasClass("active")) {
          selector.find("#brush-width").trigger("input");
        }
      }
    }
    function fixZoomOut() {
      var containerWidth = selector.find("#hexa-content").width();
      var containerHeight = selector.find("#hexa-content").height();

      var zoomWidth = originalHeight;
      var zoomHeight = originalWidth;

      if (rotate == 0 || rotate == 180 || rotate == -180) {
        zoomWidth = originalWidth;
        zoomHeight = originalHeight;
      }

      var scaleX = containerWidth / zoomWidth;
      var scaleY = containerHeight / zoomHeight;

      var minScale = Math.min(scaleX, scaleY);

      canvas.setZoom(minScale);
      selector.find("#hexa-img-zoom").val(minScale * 100);

      canvas.setWidth(zoomWidth * canvas.getZoom());
      canvas.setHeight(zoomHeight * canvas.getZoom());

      // Additional logic for drawing mode adjustments
      if (canvas.isDrawingMode === true) {
        if (selector.find("#hexa-erase-btn").hasClass("active")) {
          selector.find("#eraser-width").trigger("input");
        }
        if (selector.find("#hexa-draw-btn").hasClass("active")) {
          selector.find("#brush-width").trigger("input");
        }
      }
    }

    /* Pan */
    selector.find("#hexa-img-drag").on("click", function () {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        selector.find("#hexa-canvas-overlay").hide();
        selector.find("#hexa-canvas-wrap").draggable("disable");
      } else {
        $(this).addClass("active");
        selector.find("#hexa-canvas-overlay").show();
        selector.find("#hexa-canvas-wrap").draggable("enable");
      }
    });
    /* Zoom */
    selector
      .find(".hexa-counter input.hexa-form-field")
      .on("input", function () {
        var val = parseInt($(this).val());
        adjustZoom(val);
      });
    /* Resize Input Update */
    var setDimentions = function (e) {
      selector.find("#hexa-resize-width").val(Math.round(e.width));
      selector.find("#hexa-resize-height").val(Math.round(e.height));
      selector.find("#hexa-img-width").html(Math.round(e.width));
      selector.find("#hexa-img-height").html(Math.round(e.height));
      selector.find("#hexa-crop-width").val(Math.round(e.width / 2));
      selector.find("#hexa-crop-height").val(Math.round(e.height / 2));
      selector.find("#hexa-resize-width").data("size", Math.round(e.width));
      selector.find("#hexa-resize-height").data("size", Math.round(e.height));
      if (mode == "image") {
        selector.find("#hexa-crop-width").data("max", Math.round(e.width));
        selector.find("#hexa-crop-height").data("max", Math.round(e.height));
      }
    };
    /* CROP */
    function updateImage() {
      var objects = canvas.getObjects();
      objects
        .filter((element) => element.objectType != "BG")
        .forEach((element) => element.set("visible", false));
      canvas.backgroundColor = "transparent";
      var imgData = canvas.toDataURL({
        format: "png",
        enableRetinaScaling: false,
      });
      var blob = dataURLtoBlob(imgData);
      imgurl = URL.createObjectURL(blob);
      selector.find("#hexa-canvas-img").attr("src", imgurl);
      canvas.backgroundColor = selector.find("#custom-image-background").val();
      objects
        .filter((element) => element.objectType != "BG")
        .forEach((element) => element.set("visible", true));
    }

    function setClipPath() {
      var objects = canvas.getObjects();
      clipPath.moveTo(9999);
      canvas.setActiveObject(clipPath);
      selector.find("#hexa-crop-btns").removeClass("disabled");
      selector
        .find(
          ".hexa-icon-panel-content ul.hexa-accordion > li, #hexa-icon-menu, #hexa-top-bar, #hexa-right-col"
        )
        .css("pointer-events", "none");
      selector
        .find(".hexa-icon-panel-content ul.hexa-accordion > li.accordion-crop")
        .css("pointer-events", "auto");
      objects
        .filter(
          (element) =>
            element.objectType != "clipPath" && element.objectType != "BG"
        )
        .forEach((element) => element.set("selectable", false));
    }
    /* Crop Style Select */
    selector.find("#hexa-crop-style").on("change", function () {
      if ($(this).val() != "") {
        $(this).select2("enable", false);
      }
      // Freeform
      if ($(this).val() == "freeform") {
        clipPath = new fabric.Rect({
          fill: "rgba(156, 39, 176, 0.3)",
          width: originalWidth / 2,
          height: originalHeight / 2,
          excludeFromExport: true,
          objectType: "clipPath",
        });
        clipPath.controls = {
          ...fabric.Rect.prototype.controls,
          mtr: new fabric.Control({
            visible: false,
          }),
        };
        canvas.add(clipPath);
        setClipPath();
      }
      // Custom
      else if ($(this).val() == "custom") {
        selector.find(".crop-custom").css("display", "flex");
        var width = parseInt(selector.find("#hexa-crop-width").val());
        var height = parseInt(selector.find("#hexa-crop-height").val());
        clipPath = new fabric.Rect({
          fill: "rgba(156, 39, 176, 0.3)",
          width: width,
          height: height,
          excludeFromExport: true,
          objectType: "clipPath",
        });
        clipPath.controls = {
          ...fabric.Rect.prototype.controls,
          mtr: new fabric.Control({
            visible: false,
          }),
          ml: new fabric.Control({
            visible: false,
          }),
          mb: new fabric.Control({
            visible: false,
          }),
          mr: new fabric.Control({
            visible: false,
          }),
          mt: new fabric.Control({
            visible: false,
          }),
          tl: new fabric.Control({
            visible: false,
          }),
          bl: new fabric.Control({
            visible: false,
          }),
          tr: new fabric.Control({
            visible: false,
          }),
          br: new fabric.Control({
            visible: false,
          }),
        };
        canvas.add(clipPath);
        setClipPath();
      }
      // Square
      else if ($(this).val() == "square") {
        var squaresize = originalHeight / 2;
        if (originalWidth >= originalHeight) {
          squaresize = originalWidth / 2;
        }
        clipPath = new fabric.Rect({
          fill: "rgba(156, 39, 176, 0.3)",
          width: squaresize,
          height: squaresize,
          excludeFromExport: true,
          objectType: "clipPath",
        });
        clipPath.controls = {
          ...fabric.Rect.prototype.controls,
          mtr: new fabric.Control({
            visible: false,
          }),
          ml: new fabric.Control({
            visible: false,
          }),
          mb: new fabric.Control({
            visible: false,
          }),
          mr: new fabric.Control({
            visible: false,
          }),
          mt: new fabric.Control({
            visible: false,
          }),
        };
        canvas.add(clipPath);
        setClipPath();
      }
      // Original
      else if ($(this).val() == "original") {
        clipPath = new fabric.Rect({
          fill: "rgba(156, 39, 176, 0.3)",
          width: originalWidth / 2,
          height: originalHeight / 2,
          excludeFromExport: true,
          objectType: "clipPath",
        });
        clipPath.controls = {
          ...fabric.Rect.prototype.controls,
          mtr: new fabric.Control({
            visible: false,
          }),
          ml: new fabric.Control({
            visible: false,
          }),
          mb: new fabric.Control({
            visible: false,
          }),
          mr: new fabric.Control({
            visible: false,
          }),
          mt: new fabric.Control({
            visible: false,
          }),
        };
        canvas.add(clipPath);
        setClipPath();
      } else {
        var objects = canvas.getObjects();
        objects
          .filter(
            (element) =>
              element.objectType != "clipPath" &&
              element.objectType != "BG" &&
              element.objectType != "drawing"
          )
          .forEach((element) => element.set("selectable", true));
        selector.find(".crop-custom").css("display", "none");
        selector.find("#hexa-crop-btns").addClass("disabled");
        selector
          .find(
            ".hexa-icon-panel-content ul.hexa-accordion > li, #hexa-icon-menu, #hexa-top-bar, #hexa-right-col"
          )
          .css("pointer-events", "auto");
      }
    });
    /* Crop Cancel Button */
    selector.find("#hexa-crop-cancel").on("click", function () {
      selector.find("#hexa-crop-btns").addClass("disabled");
      selector.find("#hexa-crop-style").select2("enable");
      selector.find("#hexa-crop-style").val("");
      selector.find("#hexa-crop-style").trigger("change");
      canvas.remove(overlay);
      canvas.remove(clipPath);
    });
    /* Crop Apply Button */
    selector.find("#hexa-crop-apply").on("click", function () {
      var answer = window.confirm(hexaParams.question3);
      if (answer) {
        selector.find("#hexa-crop-btns").addClass("disabled");
        selector.find("#hexa-crop-style").select2("enable");
        selector.find("#hexa-crop-style").val("");
        selector.find("#hexa-crop-style").trigger("change");
        canvas.setZoom(1);
        selector.find("#hexa-img-zoom").val(100);
        var clipPos = clipPath.getBoundingRect();
        canvas.setWidth(clipPos.width - 1);
        canvas.setHeight(clipPos.height - 1);
        canvas.backgroundImage.set({
          top: -clipPos.top,
          left: -clipPos.left,
        });
        canvas.remove(overlay);
        canvas.remove(clipPath);
        updateImage();
        // Wait for the placeholder image fully load
        selector.find("#hexa-canvas-img-wrap").imagesLoaded(function () {
          originalWidth = canvas.width;
          originalHeight = canvas.height;
          rotate = 0;
          originX = "left";
          originY = "top";
          scaleX = 1;
          scaleY = 1;
          setBackgroundImage();
          setDimentions(canvas);
          adjustZoom();
          canvas.requestRenderAll();
          setTimeout(function () {
            canvas.fire("hexa:history", {
              type: "BG",
              text: hexaParams.cropped,
            });
          }, 500);
        });
      }
    });
    /* Crop Width Input */
    selector.find("#hexa-crop-width").bind("input paste", function () {
      if (selector.find("#hexa-crop-lock").hasClass("active")) {
        var width = $(this).data("max");
        var height = selector.find("#hexa-crop-height").data("max");
        var ratio = width / height;
        selector.find("#hexa-crop-height").val(Math.round(this.value / ratio));
      }
      clipPath.set("width", parseInt($(this).val()));
      clipPath.set(
        "height",
        parseInt(selector.find("#hexa-crop-height").val())
      );
      canvas.requestRenderAll();
    });
    /* Crop Height Input */
    selector.find("#hexa-crop-height").bind("input paste", function () {
      if (selector.find("#hexa-crop-lock").hasClass("active")) {
        var height = $(this).data("max");
        var width = selector.find("#hexa-crop-width").data("max");
        var ratio = height / width;
        selector.find("#hexa-crop-width").val(Math.round(this.value / ratio));
      }
      clipPath.set("height", parseInt($(this).val()));
      clipPath.set("width", parseInt(selector.find("#hexa-crop-width").val()));
      canvas.requestRenderAll();
    });
    /* Resize Canvas */
    function resizeCanvas() {
      var inputWidth = parseInt(selector.find("#hexa-resize-width").val());
      var inputHeight = parseInt(selector.find("#hexa-resize-height").val());
      originalWidth = inputWidth;
      originalHeight = inputHeight;
      canvas.setZoom(1);
      selector.find("#hexa-img-zoom").val(100);
      canvas.setWidth(inputWidth);
      canvas.setHeight(inputHeight);
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        scaleX = canvas.width / selector.find("#hexa-canvas-img")[0].width;
        scaleY = canvas.height / selector.find("#hexa-canvas-img")[0].height;
      } else {
        scaleX = canvas.height / selector.find("#hexa-canvas-img")[0].width;
        scaleY = canvas.width / selector.find("#hexa-canvas-img")[0].height;
      }
      canvas.backgroundImage.set({
        scaleX: scaleX,
        scaleY: scaleY,
      });
      canvas.discardActiveObject();
      var sel = new fabric.ActiveSelection(canvas.getObjects(), {
        canvas: canvas,
      });
      canvas.setActiveObject(sel);
      canvas.requestRenderAll();
      var group = canvas.getActiveObject();
      group.set({
        top: group.top * scaleY,
        left: group.left * scaleX,
        scaleX: scaleX,
        scaleY: scaleY,
      });
      updateImage();
      // Wait for the placeholder image fully load
      selector.find("#hexa-canvas-img-wrap").imagesLoaded(function () {
        canvas.discardActiveObject();
        originalWidth = canvas.width;
        originalHeight = canvas.height;
        rotate = 0;
        originX = "left";
        originY = "top";
        scaleX = 1;
        scaleY = 1;
        setBackgroundImage();
        setDimentions(canvas);
        adjustZoom();
        canvas.requestRenderAll();
        setTimeout(function () {
          canvas.fire("hexa:history", {
            type: "BG",
            text: hexaParams.resized,
          });
        }, 500);
      });
    }
    /* Resize Canvas Button */
    selector.find("#hexa-resize-apply").on("click", function () {
      var answer = window.confirm(hexaParams.question4);
      if (answer) {
        resizeCanvas();
      }
    });
    /* Resize Width Input */
    selector.find("#hexa-resize-width").bind("input paste", function () {
      if (selector.find("#hexa-resize-lock").hasClass("active")) {
        var width = $(this).data("size");
        var height = selector.find("#hexa-resize-height").data("size");
        var ratio = width / height;
        selector
          .find("#hexa-resize-height")
          .val(Math.round(this.value / ratio));
      }
    });
    /* Resize Height Input */
    selector.find("#hexa-resize-height").bind("input paste", function () {
      if (selector.find("#hexa-resize-lock").hasClass("active")) {
        var height = $(this).data("size");
        var width = selector.find("#hexa-resize-width").data("size");
        var ratio = height / width;
        selector.find("#hexa-resize-width").val(Math.round(this.value / ratio));
      }
    });
    /* Rotate Canvas */
    function rotateCanvas(direction) {
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        canvas.setDimensions({
          width: originalHeight,
          height: originalWidth,
        });
        scaleX = canvas.height / img.width;
        scaleY = canvas.width / img.height;
      } else {
        canvas.setDimensions({
          width: originalWidth,
          height: originalHeight,
        });
        scaleX = canvas.width / img.width;
        scaleY = canvas.height / img.height;
      }
      if (direction == "right") {
        if (rotate == 0) {
          rotate = 90;
          originX = "left";
          originY = "bottom";
        } else if (rotate == 90) {
          rotate = 180;
          originX = "right";
          originY = "bottom";
        } else if (rotate == 180) {
          rotate = 270;
          originX = "right";
          originY = "top";
        } else if (rotate == 270) {
          rotate = 0;
          originX = "left";
          originY = "top";
        } else if (rotate == -90) {
          rotate = 0;
          originX = "left";
          originY = "top";
        } else if (rotate == -180) {
          rotate = -90;
          originX = "right";
          originY = "top";
        } else if (rotate == -270) {
          rotate = -180;
          originX = "right";
          originY = "bottom";
        }
      } else if (direction == "left") {
        if (rotate == 0) {
          rotate = -90;
          originX = "right";
          originY = "top";
        } else if (rotate == -90) {
          rotate = -180;
          originX = "right";
          originY = "bottom";
        } else if (rotate == -180) {
          rotate = -270;
          originX = "left";
          originY = "bottom";
        } else if (rotate == -270) {
          rotate = 0;
          originX = "left";
          originY = "top";
        } else if (rotate == 90) {
          rotate = 0;
          originX = "left";
          originY = "top";
        } else if (rotate == 180) {
          rotate = 90;
          originX = "left";
          originY = "bottom";
        } else if (rotate == 270) {
          rotate = 180;
          originX = "right";
          originY = "bottom";
        }
      }
      canvas.backgroundImage.set({
        scaleX: scaleX,
        scaleY: scaleY,
        angle: rotate,
        originX: originX,
        originY: originY,
      });
      var tempRect = new fabric.Rect({
        radius: 50,
        fill: "transparent",
        stroke: "transparent",
        strokeWidth: 0,
        objectType: "clipPath",
        width: canvas.height,
        height: canvas.width,
        gradientFill: "none",
        top: 0,
        left: 0,
        originX: "left",
        originY: "top",
      });
      canvas.add(tempRect);
      canvas.discardActiveObject();
      var sel = new fabric.ActiveSelection(canvas.getObjects(), {
        canvas: canvas,
      });
      canvas.setActiveObject(sel);
      var group = canvas.getActiveObject();
      if (direction == "right") {
        group.set({
          angle: 90,
          originX: "left",
          originY: "bottom",
        });
      } else if (direction == "left") {
        group.set({
          angle: -90,
          originX: "right",
          originY: "top",
        });
      }
      canvas.remove(tempRect);
      canvas.discardActiveObject();
      setDimentions(canvas);
      adjustZoom();
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "BG",
        text: hexaParams.rotated,
      });
    }
    /* Rotate Right */
    selector.find("#hexa-rotate-right").on("click", function () {
      rotateCanvas("right");
    });
    /* Rotate Left */
    selector.find("#hexa-rotate-left").on("click", function () {
      rotateCanvas("left");
    });
    /* Flip X */
    selector.find("#hexa-flip-horizontal").on("click", function () {
      canvas.backgroundImage.toggle("flipX");
      var tempRect = new fabric.Rect({
        radius: 50,
        fill: "transparent",
        stroke: "transparent",
        strokeWidth: 0,
        objectType: "clipPath",
        width: getScaledSize()[0],
        height: getScaledSize()[1],
        gradientFill: "none",
        top: 0,
        left: 0,
        originX: "left",
        originY: "top",
      });
      canvas.add(tempRect);
      canvas.discardActiveObject();
      var sel = new fabric.ActiveSelection(canvas.getObjects(), {
        canvas: canvas,
      });
      canvas.setActiveObject(sel);
      var group = canvas.getActiveObject();
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        group.toggle("flipX");
      } else {
        group.toggle("flipY");
      }
      canvas.remove(tempRect);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "BG",
        text: hexaParams.flipped,
      });
    });
    /* Flip Y */
    selector.find("#hexa-flip-vertical").on("click", function () {
      canvas.backgroundImage.toggle("flipY");
      var tempRect = new fabric.Rect({
        radius: 50,
        fill: "transparent",
        stroke: "transparent",
        strokeWidth: 0,
        objectType: "clipPath",
        width: getScaledSize()[0],
        height: getScaledSize()[1],
        gradientFill: "none",
        top: 0,
        left: 0,
        originX: "left",
        originY: "top",
      });
      canvas.add(tempRect);
      canvas.discardActiveObject();
      var sel = new fabric.ActiveSelection(canvas.getObjects(), {
        canvas: canvas,
      });
      canvas.setActiveObject(sel);
      var group = canvas.getActiveObject();
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        group.toggle("flipY");
      } else {
        group.toggle("flipX");
      }
      canvas.remove(tempRect);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "BG",
        text: hexaParams.flipped,
      });
    });
    /* Brightness Toggle */
    selector.find("#hexa-brightness").on("change", function () {
      if ($(this).is(":checked")) {
        canvas.backgroundImage.filters.push(
          new fabric.Image.filters.Brightness()
        );
      } else {
        selector.find("#brightness").val(0);
        selector
          .find("#brightness")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(0);
        canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
          (element) => element.type != "Brightness"
        );
        canvas.backgroundImage.applyFilters();
      }
      canvas.requestRenderAll();
    });
    /* Brightness */
    selector.find("#brightness").on("input", function () {
      canvas.backgroundImage.filters
        .filter((element) => element.type == "Brightness")
        .forEach((element) => (element.brightness = parseFloat(this.value)));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    selector.find("#brightness").on("change", function (e) {
      if (e.originalEvent) {
        addToHistory(hexaParams.bg + " " + hexaParams.edited);
      }
    });
    /* Contrast Toggle */
    selector.find("#hexa-contrast").on("change", function () {
      if ($(this).is(":checked")) {
        canvas.backgroundImage.filters.push(
          new fabric.Image.filters.Contrast()
        );
      } else {
        selector.find("#contrast").val(0);
        selector
          .find("#contrast")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(0);
        canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
          (element) => element.type != "Contrast"
        );
        canvas.backgroundImage.applyFilters();
      }
      canvas.requestRenderAll();
    });
    /* Contrast */
    selector.find("#contrast").on("input", function () {
      canvas.backgroundImage.filters
        .filter((element) => element.type == "Contrast")
        .forEach((element) => (element.contrast = parseFloat(this.value)));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    selector.find("#contrast").on("change", function (e) {
      if (e.originalEvent) {
        addToHistory(hexaParams.bg + " " + hexaParams.edited);
      }
    });
    /* Saturation Toggle */
    selector.find("#hexa-saturation").on("change", function () {
      if ($(this).is(":checked")) {
        canvas.backgroundImage.filters.push(
          new fabric.Image.filters.Saturation()
        );
      } else {
        selector.find("#saturation").val(0);
        selector
          .find("#saturation")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(0);
        canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
          (element) => element.type != "Saturation"
        );
        canvas.backgroundImage.applyFilters();
      }
      canvas.requestRenderAll();
    });
    /* Saturation */
    selector.find("#saturation").on("input", function () {
      canvas.backgroundImage.filters
        .filter((element) => element.type == "Saturation")
        .forEach((element) => (element.saturation = parseFloat(this.value)));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    selector.find("#saturation").on("change", function (e) {
      if (e.originalEvent) {
        addToHistory(hexaParams.bg + " " + hexaParams.edited);
      }
    });
    /* Hue Toggle */
    selector.find("#hexa-hue").on("change", function () {
      if ($(this).is(":checked")) {
        canvas.backgroundImage.filters.push(
          new fabric.Image.filters.HueRotation()
        );
      } else {
        selector.find("#hue").val(0);
        selector
          .find("#hue")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(0);
        canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
          (element) => element.type != "HueRotation"
        );
        canvas.backgroundImage.applyFilters();
      }
      canvas.requestRenderAll();
    });
    /* Hue */
    selector.find("#hue").on("input", function () {
      canvas.backgroundImage.filters
        .filter((element) => element.type == "HueRotation")
        .forEach((element) => (element.rotation = parseFloat(this.value)));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    selector.find("#hue").on("change", function (e) {
      if (e.originalEvent) {
        addToHistory(hexaParams.bg + " " + hexaParams.edited);
      }
    });
    /* Filters */
    selector
      .find("#hexa-filters input[type=checkbox]")
      .on("change", function (e) {
        if ($(this).is(":checked")) {
          if ($(this).attr("id") == "grayscale") {
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Grayscale()
            );
          } else if ($(this).attr("id") == "sepia") {
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Sepia()
            );
          } else if ($(this).attr("id") == "blackwhite") {
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.BlackWhite()
            );
          } else if ($(this).attr("id") == "brownie") {
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Brownie()
            );
          } else if ($(this).attr("id") == "vintage") {
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Vintage()
            );
          } else if ($(this).attr("id") == "kodachrome") {
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Kodachrome()
            );
          } else if ($(this).attr("id") == "technicolor") {
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Technicolor()
            );
          } else if ($(this).attr("id") == "polaroid") {
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Polaroid()
            );
          } else if ($(this).attr("id") == "shift") {
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Shift()
            );
          } else if ($(this).attr("id") == "invert") {
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Invert()
            );
          } else if ($(this).attr("id") == "sharpen") {
            selector.find("#emboss").prop("checked", false);
            selector.find("#sobelX").prop("checked", false);
            selector.find("#sobelY").prop("checked", false);
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Convolute"
              );
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Convolute({
                matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
              })
            );
          } else if ($(this).attr("id") == "emboss") {
            selector.find("#sharpen").prop("checked", false);
            selector.find("#sobelX").prop("checked", false);
            selector.find("#sobelY").prop("checked", false);
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Convolute"
              );
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Convolute({
                matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1],
              })
            );
          } else if ($(this).attr("id") == "sobelX") {
            selector.find("#emboss").prop("checked", false);
            selector.find("#sharpen").prop("checked", false);
            selector.find("#sobelY").prop("checked", false);
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Convolute"
              );
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Convolute({
                matrix: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
              })
            );
          } else if ($(this).attr("id") == "sobelY") {
            selector.find("#emboss").prop("checked", false);
            selector.find("#sharpen").prop("checked", false);
            selector.find("#sobelX").prop("checked", false);
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Convolute"
              );
            canvas.backgroundImage.filters.push(
              new fabric.Image.filters.Convolute({
                matrix: [-1, -2, -1, 0, 0, 0, 1, 2, 1],
              })
            );
          }
        } else {
          if ($(this).attr("id") == "grayscale") {
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Grayscale"
              );
          } else if ($(this).attr("id") == "sepia") {
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Sepia"
              );
          } else if ($(this).attr("id") == "blackwhite") {
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "BlackWhite"
              );
          } else if ($(this).attr("id") == "brownie") {
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Brownie"
              );
          } else if ($(this).attr("id") == "vintage") {
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Vintage"
              );
          } else if ($(this).attr("id") == "kodachrome") {
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Kodachrome"
              );
          } else if ($(this).attr("id") == "technicolor") {
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Technicolor"
              );
          } else if ($(this).attr("id") == "polaroid") {
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Polaroid"
              );
          } else if ($(this).attr("id") == "shift") {
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Shift"
              );
          } else if ($(this).attr("id") == "invert") {
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Invert"
              );
          } else if ($(this).attr("id") == "sharpen") {
            selector.find("#emboss").prop("checked", false);
            selector.find("#sobelX").prop("checked", false);
            selector.find("#sobelY").prop("checked", false);
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Convolute"
              );
          } else if ($(this).attr("id") == "emboss") {
            selector.find("#sharpen").prop("checked", false);
            selector.find("#sobelX").prop("checked", false);
            selector.find("#sobelY").prop("checked", false);
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Convolute"
              );
          } else if ($(this).attr("id") == "sobelX") {
            selector.find("#emboss").prop("checked", false);
            selector.find("#sharpen").prop("checked", false);
            selector.find("#sobelY").prop("checked", false);
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Convolute"
              );
          } else if ($(this).attr("id") == "sobelY") {
            selector.find("#emboss").prop("checked", false);
            selector.find("#sharpen").prop("checked", false);
            selector.find("#sobelX").prop("checked", false);
            canvas.backgroundImage.filters =
              canvas.backgroundImage.filters.filter(
                (element) => element.type != "Convolute"
              );
          }
        }
        canvas.backgroundImage.applyFilters();
        canvas.requestRenderAll();
        if (e.originalEvent) {
          addToHistory(hexaParams.bg + " " + hexaParams.edited);
        }
      });
    /** Images Filters */
    selector.find(".grid-items").on("click", function (e) {
      // var selected = $(this).find(':selected').val();
      var selected = $(this).attr("value");
      var obj = canvas.getActiveObject();
      if (selected == "greyscale") {
        console.log("grayscale selected");
        obj.filters[0] = new fabric.Image.filters.Grayscale();
      } else if (selected == "sepia") {
        obj.filters[0] = new fabric.Image.filters.Sepia();
      } else if (selected == "blackwhite") {
        obj.filters[0] = new fabric.Image.filters.BlackWhite();
      } else if (selected == "brownie") {
        obj.filters[0] = new fabric.Image.filters.Brownie();
      } else if (selected == "vintage") {
        obj.filters[0] = new fabric.Image.filters.Vintage();
      } else if (selected == "kodachrome") {
        obj.filters[0] = new fabric.Image.filters.Kodachrome();
      } else if (selected == "technicolor") {
        obj.filters[0] = new fabric.Image.filters.Technicolor();
      } else if (selected == "polaroid") {
        obj.filters[0] = new fabric.Image.filters.Polaroid();
      } else if (selected == "shift") {
        obj.filters[0] = new fabric.Image.filters.Shift();
      } else if (selected == "invert") {
        obj.filters[0] = new fabric.Image.filters.Invert();
      } else if (selected == "contrast") {
        obj.filters[0] = new fabric.Image.filters.Contrast({
          contrast: 0.4,
        });
      } else if (selected == "brightness") {
        obj.filters[0] = new fabric.Image.filters.Brightness({
          brightness: 0.3,
        });
      } else if (selected == "pixelate") {
        obj.filters[0] = new fabric.Image.filters.Pixelate({
          blocksize: 8,
        });
      } else if (selected == "blur") {
        obj.filters[0] = new fabric.Image.filters.Blur({
          blur: 2,
        });
      } else if (selected == "sharpen") {
        obj.filters[0] = new fabric.Image.filters.Convolute({
          matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
        });
      } else if (selected == "emboss") {
        obj.filters[0] = new fabric.Image.filters.Convolute({
          matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1],
        });
      } else if (selected == "removeColor") {
        obj.filters[0] = new fabric.Image.filters.RemoveColor({
          threshold: 0.2,
          distance: 0.5,
        });
      } else if (selected == "vibrance") {
        obj.filters[0] = new fabric.Image.filters.Vibrance({
          vibrance: 1.5,
        });
      } else if (selected == "blendColor") {
        obj.filters[0] = new fabric.Image.filters.BlendColor({
          color: "#00ff00",
          mode: "multiply",
        });
      } else if (selected == "blendImage") {
        // var blendColorOption = 'assets/3d/76_leather texture-seamless.jpg';
        obj.filters[0] = new fabric.Image.filters.BlendColor({
          image: "#fff",
          mode: "multiply",
          alpha: 0.2,
        });
      } else if (selected == "hueRotate") {
        obj.filters[0] = new fabric.Image.filters.HueRotation({
          rotation: 0.5,
        });
      } else if (selected == "resize") {
        // obj.filters[0] = new fabric.Image.filters.Resize({
        // 	scaleX: 1.5,
        // 	scaleY: 1.5
        // });
        var pixelateFilter = new fabric.Image.filters.Pixelate({
          blocksize: 10,
        });

        var contrastFilter = new fabric.Image.filters.Contrast({
          contrast: 0.5,
        });

        obj.filters = [pixelateFilter, contrastFilter];
      } else if (selected == "saturation") {
        obj.filters[0] = new fabric.Image.filters.Saturation({
          saturation: 1.5,
        });
      } else if (selected == "gamma") {
        obj.filters[0] = new fabric.Image.filters.Gamma({
          gamma: [1.5, 1.5, 1.5],
        });
      } else if (selected == "sobelX") {
        obj.filters[0] = new fabric.Image.filters.Convolute({
          matrix: [1, 0, -1, 2, 0, -2, 1, 0, -1],
        });
      } else if (selected == "sobelY") {
        obj.filters[0] = new fabric.Image.filters.Convolute({
          matrix: [1, 2, 1, 0, 0, 0, -1, -2, -1],
        });
      } else if (selected == "noise") {
        obj.filters[0] = new fabric.Image.filters.Noise({
          noise: 100,
        });
      } else if (selected == "radialBlur") {
        obj.filters[0] = new fabric.Image.filters.Blur({
          blur: 0.5,
        });
      } else if (selected == "oilPainting") {
        obj.filters[0] = new fabric.Image.filters.Blur({
          blur: 0.1,
        });

        obj.filters[1] = new fabric.Image.filters.Brightness({
          brightness: 0.1,
        });
      } else if (selected == "colorMatrix") {
        obj.filters[0] = new fabric.Image.filters.ColorMatrix({
          matrix: [2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0],
        });
      } else {
        obj.filters = [];
      }
      obj.applyFilters();
      canvas.requestRenderAll();
    });

    selector.find(".grid-container").hide();
    selector.find("#hexa-image-filter-name").css({
      cursor: "pointer",
      border: "1px solid #ccc",
      padding: "5px",
      "text-align": "center",
    });

    selector.find("#hexa-image-filter-name").on("click", function () {
      selector.find(".grid-container").toggle();

      let arrowIcon = $(this).find(".arrow");
      arrowIcon.toggleClass("arrow-down arrow-up");
      if (arrowIcon.hasClass("arrow-up")) {
        arrowIcon.text("keyboard_arrow_up");
        $("#img-filter-container-id").addClass("active");
      } else {
        arrowIcon.text("keyboard_arrow_down");
        $("#img-filter-container-id").removeClass("active");
      }
      var obj = canvas.getActiveObject();
      obj.applyFilters();

      setTimeout(function () {
        // Get the filtered image URL
        var filteredImageURL = obj.toDataURL("image/png");
        console.log("Filtered Image URL:", filteredImageURL);
      }, 100);
    });

    /* Gamma Toggle */
    selector.find("#hexa-gamma").on("change", function () {
      if ($(this).is(":checked")) {
        canvas.backgroundImage.filters.push(new fabric.Image.filters.Gamma());
      } else {
        selector.find("#gamma-red").val(1);
        selector
          .find("#gamma-red")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(1);
        selector.find("#gamma-green").val(1);
        selector
          .find("#gamma-green")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(1);
        selector.find("#gamma-blue").val(1);
        selector
          .find("#gamma-blue")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(1);
        canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
          (element) => element.type != "Gamma"
        );
        canvas.backgroundImage.applyFilters();
      }
      canvas.requestRenderAll();
    });
    /* Gamma Settings */
    selector.find("#hexa-gamma-settings input").on("input", function () {
      var v1 = parseFloat($("#gamma-red").val());
      var v2 = parseFloat($("#gamma-green").val());
      var v3 = parseFloat($("#gamma-blue").val());
      var gammaArray = [v1, v2, v3];
      canvas.backgroundImage.filters
        .filter((element) => element.type == "Gamma")
        .forEach((element) => (element.gamma = gammaArray));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    selector.find("#hexa-gamma-settings input").on("change", function (e) {
      if (e.originalEvent) {
        addToHistory(hexaParams.bg + " " + hexaParams.edited);
      }
    });
    /* Blur Toggle */
    selector.find("#hexa-blur").on("change", function () {
      if ($(this).is(":checked")) {
        canvas.backgroundImage.filters.push(new fabric.Image.filters.Blur());
      } else {
        selector.find("#blur").val(0);
        selector
          .find("#blur")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(0);
        canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
          (element) => element.type != "Blur"
        );
        canvas.backgroundImage.applyFilters();
      }
      canvas.requestRenderAll();
    });
    /* Blur */
    selector.find("#blur").on("change", function (e) {
      canvas.backgroundImage.filters
        .filter((element) => element.type == "Blur")
        .forEach((element) => (element.blur = parseFloat(this.value)));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
      if (e.originalEvent) {
        addToHistory(hexaParams.bg + " " + hexaParams.edited);
      }
    });
    /* Noise Toggle */
    selector.find("#hexa-noise").on("change", function () {
      if ($(this).is(":checked")) {
        canvas.backgroundImage.filters.push(new fabric.Image.filters.Noise());
      } else {
        selector.find("#noise").val(0);
        selector
          .find("#noise")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(0);
        canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
          (element) => element.type != "Noise"
        );
        canvas.backgroundImage.applyFilters();
      }
      canvas.requestRenderAll();
    });
    /* Noise */
    selector.find("#noise").on("input", function () {
      canvas.backgroundImage.filters
        .filter((element) => element.type == "Noise")
        .forEach((element) => (element.noise = parseInt(this.value, 10)));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    selector.find("#noise").on("change", function (e) {
      if (e.originalEvent) {
        addToHistory(hexaParams.bg + " " + hexaParams.edited);
      }
    });
    /* Pixelate Toggle */
    selector.find("#hexa-pixelate").on("change", function () {
      if ($(this).is(":checked")) {
        canvas.backgroundImage.filters.push(
          new fabric.Image.filters.Pixelate()
        );
      } else {
        selector.find("#pixelate").val(1);
        selector
          .find("#pixelate")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(1);
        canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
          (element) => element.type != "Pixelate"
        );
        canvas.backgroundImage.applyFilters();
      }
      canvas.requestRenderAll();
    });
    /* Pixelate */
    selector.find("#pixelate").on("change", function (e) {
      canvas.backgroundImage.filters
        .filter((element) => element.type == "Pixelate")
        .forEach((element) => (element.blocksize = parseInt(this.value, 10)));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
      if (e.originalEvent) {
        addToHistory(hexaParams.bg + " " + hexaParams.edited);
      }
    });
    /* Blend Color Toggle */
    selector.find("#hexa-blend-color").on("change", function () {
      if ($(this).is(":checked")) {
        var mode = selector.find("#blend-color-mode").val();
        var color = selector.find("#blend-color-color").val();
        var alpha = parseFloat(selector.find("#blend-color-alpha").val());
        canvas.backgroundImage.filters.push(
          new fabric.Image.filters.BlendColor()
        );
        canvas.backgroundImage.filters
          .filter((element) => element.type == "BlendColor")
          .forEach(
            (element) => (element.mode = mode),
            (element) => (element.color = color),
            (element) => (element.alpha = parseFloat(alpha))
          );
      } else {
        selector.find("#blend-color-mode").val("add");
        selector.find("#blend-color-color").spectrum("set", "#ffffff");
        selector.find("#blend-color-alpha").val(0.5);
        selector
          .find("#blend-color-alpha")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(0.5);
        canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
          (element) => element.type != "BlendColor"
        );
      }
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    /* Blend Mode */
    selector.find("#blend-color-mode").on("change", function () {
      canvas.backgroundImage.filters
        .filter((element) => element.type == "BlendColor")
        .forEach((element) => (element.mode = this.value));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    /* Blend Color */
    selector.find("#blend-color-color").on("change", function () {
      canvas.backgroundImage.filters
        .filter((element) => element.type == "BlendColor")
        .forEach((element) => (element.color = this.value));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    /* Blend Alpha */
    selector.find("#blend-color-alpha").on("input", function () {
      canvas.backgroundImage.filters
        .filter((element) => element.type == "BlendColor")
        .forEach((element) => (element.alpha = parseFloat(this.value)));
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    /* Duotone Toggle */
    selector.find("#hexa-duotone-color").on("change", function () {
      if ($(this).is(":checked")) {
        duotoneFilter = new fabric.Image.filters.Composed({
          subFilters: [
            new fabric.Image.filters.Grayscale({
              mode: "luminosity",
            }), // make it black and white
            new fabric.Image.filters.BlendColor({
              color: selector.find("#duotone-light-color").val(),
            }), // apply light color
            new fabric.Image.filters.BlendColor({
              color: selector.find("#duotone-dark-color").val(),
              mode: "lighten",
            }), // apply a darker color
          ],
        });
        canvas.backgroundImage.filters.push(duotoneFilter);
      } else {
        selector.find("#duotone-light-color").spectrum("set", "green");
        selector.find("#duotone-dark-color").spectrum("set", "blue");
        canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
          (element) => element.type != "Composed"
        );
      }
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    /* Duotone Light Color */
    selector.find("#duotone-light-color").on("change", function () {
      canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
        (element) => element.type != "Composed"
      );
      canvas.backgroundImage.filters.push(duotoneFilter);
      duotoneFilter.subFilters[1].color = $(this).val();
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    /* Duotone Dark Color */
    selector.find("#duotone-dark-color").on("change", function () {
      canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
        (element) => element.type != "Composed"
      );
      canvas.backgroundImage.filters.push(duotoneFilter);
      duotoneFilter.subFilters[2].color = $(this).val();
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
    });
    /* Swap Colors Apply */
    selector.find("#hexa-swap-apply").on("click", function () {
      var swapColors = new fabric.Image.filters.SwapColor({
        colorSource: selector.find("#color-source").val(),
        colorDestination: selector.find("#color-destination").val(),
      });
      canvas.backgroundImage.filters.push(swapColors);
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
      $(this).prop("disabled", true);
      selector.find("#hexa-swap-remove").prop("disabled", false);
    });
    /* Swap Colors Remove */
    selector.find("#hexa-swap-remove").on("click", function () {
      canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
        (element) => element.type != "SwapColor"
      );
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
      $(this).prop("disabled", true);
      selector.find("#hexa-swap-apply").prop("disabled", false);
    });
    /* Swap Colors Toggle */
    selector.find("#hexa-swap-colors").on("change", function () {
      if (!$(this).is(":checked")) {
        selector.find("#hexa-swap-remove").trigger("click");
      }
    });
    /* Shadow Fields */
    var shadowFields = ["text", "image", "shape", "element"];
    $.each(shadowFields, function (index, value) {
      selector.find("#hexa-" + value + "-shadow").on("change", function () {
        var shadow = new fabric.Shadow({
          color: selector.find("#" + value + "-shadow-color").val(),
          blur: selector.find("#" + value + "-shadow-blur").val(),
          offsetX: selector.find("#" + value + "-shadow-offset-x").val(),
          offsetY: selector.find("#" + value + "-shadow-offset-y").val(),
        });
        if ($(this).is(":checked")) {
          canvas.getActiveObject().shadow = shadow;
        } else {
          canvas.getActiveObject().shadow = null;
        }
        canvas.requestRenderAll();
      });
      selector.find("#" + value + "-shadow-color").bind("change", function () {
        canvas.getActiveObject().shadow.color = $(this).val();
        canvas.requestRenderAll();
      });
      selector
        .find("#" + value + "-shadow-settings input[type=number]")
        .bind("input paste keyup keydown", function () {
          var val = $(this).val();
          if ($(this).attr("id") == value + "-shadow-blur") {
            canvas.getActiveObject().shadow.blur = parseInt(val);
          } else if ($(this).attr("id") == value + "-shadow-offset-x") {
            canvas.getActiveObject().shadow.offsetX = parseInt(val);
          } else if ($(this).attr("id") == value + "-shadow-offset-y") {
            canvas.getActiveObject().shadow.offsetY = parseInt(val);
          }
          canvas.requestRenderAll();
        });
    });
    /* Gradient Fields */
    function updateGradient(value) {
      var obj = canvas.getActiveObject();
      var i = 0;
      obj.set(
        "gradientFill",
        selector.find("#hexa-" + value + "-gradient").val()
      );
      var colorStops = "";
      if (
        selector.find("#" + value + "-gradient-color-3").val() == "" &&
        selector.find("#" + value + "-gradient-color-4").val() == ""
      ) {
        colorStops = [
          {
            offset: 0,
            color: selector.find("#" + value + "-gradient-color-1").val(),
          },
          {
            offset: 1,
            color: selector.find("#" + value + "-gradient-color-2").val(),
          },
        ];
      } else if (
        selector.find("#" + value + "-gradient-color-3").val() != "" &&
        selector.find("#" + value + "-gradient-color-4").val() == ""
      ) {
        colorStops = [
          {
            offset: 0,
            color: selector.find("#" + value + "-gradient-color-1").val(),
          },
          {
            offset: 0.5,
            color: selector.find("#" + value + "-gradient-color-2").val(),
          },
          {
            offset: 1,
            color: selector.find("#" + value + "-gradient-color-3").val(),
          },
        ];
      } else if (
        selector.find("#" + value + "-gradient-color-1").val() != "" &&
        selector.find("#" + value + "-gradient-color-2").val() != "" &&
        selector.find("#" + value + "-gradient-color-3").val() != "" &&
        selector.find("#" + value + "-gradient-color-4").val() != ""
      ) {
        colorStops = [
          {
            offset: 0,
            color: selector.find("#" + value + "-gradient-color-1").val(),
          },
          {
            offset: 0.25,
            color: selector.find("#" + value + "-gradient-color-2").val(),
          },
          {
            offset: 0.75,
            color: selector.find("#" + value + "-gradient-color-3").val(),
          },
          {
            offset: 1,
            color: selector.find("#" + value + "-gradient-color-4").val(),
          },
        ];
      }
      if (selector.find("#hexa-" + value + "-gradient").val() == "vertical") {
        selector.find("#" + value + "-gradient-settings").show();
        selector.find("#" + value + "-fill-color").hide();
        obj.set(
          "fill",
          new fabric.Gradient({
            type: "linear",
            gradientUnits: "percentage",
            coords: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            colorStops: colorStops,
          })
        );
        if (obj.objectType == "element") {
          if (obj._objects) {
            for (i = 0; i < obj._objects.length; i++) {
              if (obj._objects[i].fill != "") {
                obj._objects[i].set({
                  fill: new fabric.Gradient({
                    type: "linear",
                    gradientUnits: "percentage",
                    coords: {
                      x1: 0,
                      y1: 0,
                      x2: 0,
                      y2: 1,
                    },
                    colorStops: colorStops,
                  }),
                });
              }
            }
          }
        }
      } else if (
        selector.find("#hexa-" + value + "-gradient").val() == "horizontal"
      ) {
        selector.find("#" + value + "-gradient-settings").show();
        selector.find("#" + value + "-fill-color").hide();
        obj.set(
          "fill",
          new fabric.Gradient({
            type: "linear",
            gradientUnits: "percentage",
            coords: {
              x1: 0,
              y1: 0,
              x2: 1,
              y2: 0,
            },
            colorStops: colorStops,
          })
        );
        if (obj.objectType == "element") {
          if (obj._objects) {
            for (i = 0; i < obj._objects.length; i++) {
              if (obj._objects[i].fill != "") {
                obj._objects[i].set({
                  fill: new fabric.Gradient({
                    type: "linear",
                    gradientUnits: "percentage",
                    coords: {
                      x1: 0,
                      y1: 0,
                      x2: 1,
                      y2: 0,
                    },
                    colorStops: colorStops,
                  }),
                });
              }
            }
          }
        }
      } else {
        selector.find("#" + value + "-gradient-settings").hide();
        selector.find("#" + value + "-fill-color").show();
        obj.set("fill", selector.find("#hexa-" + value + "-color").val());
        if (obj.objectType == "element") {
          if (obj._objects) {
            for (i = 0; i < obj._objects.length; i++) {
              if (obj._objects[i].fill != "") {
                obj._objects[i].set(
                  "fill",
                  selector.find("#hexa-" + value + "-color").val()
                );
              }
            }
          }
        }
      }
      canvas.requestRenderAll();
    }
    var gradientFields = ["text", "shape", "element"];
    $.each(gradientFields, function (index, value) {
      selector.find("#hexa-" + value + "-gradient").on("change", function () {
        updateGradient(value);
      });
      selector
        .find("#" + value + "-gradient-color-1")
        .on("change", function () {
          updateGradient(value);
        });
      selector
        .find("#" + value + "-gradient-color-2")
        .on("change", function () {
          updateGradient(value);
        });
      selector
        .find("#" + value + "-gradient-color-3")
        .on("change", function () {
          updateGradient(value);
        });
      selector
        .find("#" + value + "-gradient-color-4")
        .on("change", function () {
          updateGradient(value);
        });
    });
    /* Get Scaled Size */
    function getScaledSize() {
      var width = canvas.backgroundImage.getScaledHeight();
      var height = canvas.backgroundImage.getScaledWidth();
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        width = canvas.backgroundImage.getScaledWidth();
        height = canvas.backgroundImage.getScaledHeight();
      }
      return [width, height];
    }
    /* Add Text */
    selector.find("#hexa-add-text").on("click", function () {
      var text = new fabric.Textbox(hexaParams.textbox, {
        objectType: "textbox",
        gradientFill: "none",
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        fontWeight: settings.fontWeight,
        fontStyle: settings.fontStyle,
        lineHeight: settings.lineHeight,
        fill: settings.fill,
        stroke: settings.stroke,
        strokeWidth: settings.strokeWidth,
        textBackgroundColor: settings.textBackgroundColor,
        textAlign: settings.textAlign,
        width: getScaledSize()[0] / 2,
        top: getScaledSize()[1] / 2,
        left: getScaledSize()[0] / 2,
        originX: "center",
        originY: "center",
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.fire("hexa:history", {
        type: "textbox",
        text: hexaParams.added,
      });
    });
    /* Set Text Settings */
    function setTextSettings(text) {
      selector.find("#hexa-text-input").val(text.text);
      selector.find("#hexa-font-family").val(text.fontFamily);
      selector.find("#hexa-font-family").trigger("change");
      if (text.gradientFill == "none") {
        selector.find("#hexa-text-gradient").val("none");
        selector.find("#hexa-text-color").spectrum("set", text.fill);
      } else if (text.gradientFill == "vertical") {
        selector.find("#hexa-text-gradient").val("vertical");
        if (text.fill.colorStops.length == 4) {
          selector
            .find("#text-gradient-color-1")
            .spectrum("set", text.fill.colorStops[0].color);
          selector
            .find("#text-gradient-color-2")
            .spectrum("set", text.fill.colorStops[1].color);
          selector
            .find("#text-gradient-color-3")
            .spectrum("set", text.fill.colorStops[2].color);
          selector
            .find("#text-gradient-color-4")
            .spectrum("set", text.fill.colorStops[3].color);
        } else if (text.fill.colorStops.length == 3) {
          selector
            .find("#text-gradient-color-1")
            .spectrum("set", text.fill.colorStops[0].color);
          selector
            .find("#text-gradient-color-2")
            .spectrum("set", text.fill.colorStops[1].color);
          selector
            .find("#text-gradient-color-3")
            .spectrum("set", text.fill.colorStops[2].color);
          selector.find("#text-gradient-color-4").spectrum("set", "");
        } else if (text.fill.colorStops.length == 2) {
          selector
            .find("#text-gradient-color-1")
            .spectrum("set", text.fill.colorStops[0].color);
          selector
            .find("#text-gradient-color-2")
            .spectrum("set", text.fill.colorStops[1].color);
          selector.find("#text-gradient-color-3").spectrum("set", "");
          selector.find("#text-gradient-color-4").spectrum("set", "");
        }
      } else if (text.gradientFill == "horizontal") {
        selector.find("#hexa-text-gradient").val("horizontal");
        if (text.fill.colorStops.length == 4) {
          selector
            .find("#text-gradient-color-1")
            .spectrum("set", text.fill.colorStops[0].color);
          selector
            .find("#text-gradient-color-2")
            .spectrum("set", text.fill.colorStops[1].color);
          selector
            .find("#text-gradient-color-3")
            .spectrum("set", text.fill.colorStops[2].color);
          selector
            .find("#text-gradient-color-4")
            .spectrum("set", text.fill.colorStops[3].color);
        } else if (text.fill.colorStops.length == 3) {
          selector
            .find("#text-gradient-color-1")
            .spectrum("set", text.fill.colorStops[0].color);
          selector
            .find("#text-gradient-color-2")
            .spectrum("set", text.fill.colorStops[1].color);
          selector
            .find("#text-gradient-color-3")
            .spectrum("set", text.fill.colorStops[2].color);
          selector.find("#text-gradient-color-4").spectrum("set", "");
        } else if (text.fill.colorStops.length == 2) {
          selector
            .find("#text-gradient-color-1")
            .spectrum("set", text.fill.colorStops[0].color);
          selector
            .find("#text-gradient-color-2")
            .spectrum("set", text.fill.colorStops[1].color);
          selector.find("#text-gradient-color-3").spectrum("set", "");
          selector.find("#text-gradient-color-4").spectrum("set", "");
        }
      }
      selector.find("#hexa-text-gradient").trigger("change");
      if (text.fontWeight == "bold") {
        selector.find("#format-bold").addClass("active");
      } else {
        selector.find("#format-bold").removeClass("active");
      }
      if (text.fontStyle == "italic") {
        selector.find("#format-italic").addClass("active");
      } else {
        selector.find("#format-italic").removeClass("active");
      }
      if (text.underline == true) {
        selector.find("#format-underline").addClass("active");
      } else {
        selector.find("#format-underline").removeClass("active");
      }
      if (text.textAlign == "left") {
        selector.find(".format-align").removeClass("active");
        selector.find("#format-align-left").addClass("active");
      }
      if (text.textAlign == "right") {
        selector.find(".format-align").removeClass("active");
        selector.find("#format-align-right").addClass("active");
      }
      if (text.textAlign == "center") {
        selector.find(".format-align").removeClass("active");
        selector.find("#format-align-center").addClass("active");
      }
      if (text.textAlign == "justify") {
        selector.find(".format-align").removeClass("active");
        selector.find("#format-align-justify").addClass("active");
      }
      selector.find("#hexa-font-size").val(text.fontSize);
      selector.find("#hexa-outline-size").val(text.strokeWidth);
      selector.find("#hexa-line-height").val(text.lineHeight);
      selector.find("#hexa-letter-spacing").val(text.charSpacing);
      selector.find("#hexa-outline-color").spectrum("set", text.stroke);
      selector
        .find("#hexa-text-background")
        .spectrum("set", text.textBackgroundColor);
      if (text.shadow == null) {
        selector.find("#hexa-text-shadow").prop("checked", false);
      } else {
        selector.find("#hexa-text-shadow").prop("checked", true);
        selector.find("#text-shadow-color").spectrum("set", text.shadow.color);
        selector.find("#text-shadow-blur").val(text.shadow.blur);
        selector.find("#text-shadow-offset-x").val(text.shadow.offsetX);
        selector.find("#text-shadow-offset-y").val(text.shadow.offsetY);
      }
      selector.find("#hexa-text-shadow").trigger("change");
      if (text.flipX == true) {
        selector.find("#text-flip-x").addClass("active");
      } else {
        selector.find("#text-flip-x").removeClass("active");
      }
      if (text.flipY == true) {
        selector.find("#text-flip-y").addClass("active");
      } else {
        selector.find("#text-flip-y").removeClass("active");
      }
      selector.find("#text-skew-x").val(text.skewX);
      selector
        .find("#text-skew-x")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(text.skewX);
      selector.find("#text-skew-y").val(text.skewY);
      selector
        .find("#text-skew-y")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(text.skewY);
      selector.find("#text-rotate").val(parseInt(text.angle));
      selector
        .find("#text-rotate")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(parseInt(text.angle));
    }
    /* Text Input */
    selector.find("#hexa-text-input").bind("input paste", function () {
      canvas.getActiveObject().set("text", $(this).val());
      selector
        .find("#hexa-layers #" + canvas.getActiveObject().id + " .layer-name")
        .html(canvas.getActiveObject().text);
      canvas.requestRenderAll();
    });
    selector.find("#hexa-text-input").bind("focusout", function () {
      canvas.fire("hexa:history", {
        type: "textbox",
        text: hexaParams.edited,
      });
    });
    /* Font Family */
    selector.find("#hexa-font-family").on("change", function () {
      var font = $(this).val();
      var loadFonts = "yes";
      for (var i = 0; i < webSafeFonts.length; i++) {
        if (webSafeFonts[i][1] == font) {
          loadFonts = "no";
          break;
        }
      }
      if (loadFonts == "yes") {
        WebFont.load({
          google: {
            families: [font + ":regular,bold", font + ":italic,regular,bold"],
          },
        });
        var fontNormal = new FontFaceObserver(font, {
          weight: "normal",
          style: "normal",
        });
        var fontBold = new FontFaceObserver(font, {
          weight: "bold",
          style: "normal",
        });
        var fontNormalItalic = new FontFaceObserver(font, {
          weight: "normal",
          style: "italic",
        });
        var fontBoldItalic = new FontFaceObserver(font, {
          weight: "bold",
          style: "italic",
        });
        Promise.all([
          fontNormal.load(null, 5000),
          fontBold.load(null, 5000),
          fontNormalItalic.load(null, 5000),
          fontBoldItalic.load(null, 5000),
        ])
          .then(function () {
            canvas.getActiveObject().set("fontFamily", font);
            canvas.requestRenderAll();
            canvas.fire("hexa:history", {
              type: "textbox",
              text: hexaParams.edited,
            });
          })
          .catch(function (e) {
            console.log(e);
          });
      } else {
        canvas.getActiveObject().set("fontFamily", font);
        canvas.requestRenderAll();
      }
    });
    // Font Preview
    var loadedFonts = [];
    var fontTimeOut = 0;
    selector.find("#hexa-font-family").on("select2:open", function () {
      selector.find("#select2-hexa-font-family-results").scroll(function () {
        $(this)
          .find("li:last-child")
          .find("ul li")
          .each(function () {
            var item = $(this);
            if (
              item.is(":in-viewport( 0, #select2-hexa-font-family-results)")
            ) {
              if (!loadedFonts.includes(item.attr("id"))) {
                WebFont.load({
                  google: {
                    families: [item.find(".select2-item").html()],
                  },
                  inactive: function () {
                    WebFont.load({
                      custom: {
                        families: [item.find(".select2-item").html()],
                        urls: [
                          "https://fonts.googleapis.com/css?family=" +
                            item.find(".select2-item").html() +
                            "&text=abc",
                        ],
                      },
                      active: function () {
                        console.log("active");
                      },
                    });
                  },
                });
                loadedFonts.push(item.attr("id"));
              }
            }
          });
      });
      selector.on(
        "keypress",
        ".select2-search .select2-search__field",
        function (e) {
          window.clearTimeout(fontTimeOut);
          fontTimeOut = setTimeout(function () {
            selector
              .find("#select2-hexa-font-family-results")
              .trigger("scroll");
          }, 500);
        }
      );
    });
    /* Text Format Buttons */
    selector
      .find("#hexa-text-format-btns > .hexa-btn")
      .on("click", function () {
        if ($(this).attr("id") == "format-uppercase") {
          var text = selector.find("#hexa-text-input").val();
          if (text === text.toUpperCase()) {
            text = text.toLowerCase();
          } else {
            text = text.toUpperCase();
          }
          selector.find("#hexa-text-input").val(text);
          selector.find("#hexa-text-input").trigger("input");
        }
        if ($(this).hasClass("active")) {
          if ($(this).attr("id") == "format-bold") {
            canvas.getActiveObject().set("fontWeight", "normal");
            $(this).removeClass("active");
          }
          if ($(this).attr("id") == "format-italic") {
            canvas.getActiveObject().set("fontStyle", "normal");
            $(this).removeClass("active");
          }
          if ($(this).attr("id") == "format-underlined") {
            canvas.getActiveObject().set("underline", false);
            $(this).removeClass("active");
          }
        } else {
          if ($(this).attr("id") == "format-bold") {
            canvas.getActiveObject().set("fontWeight", "bold");
          }
          if ($(this).attr("id") == "format-italic") {
            canvas.getActiveObject().set("fontStyle", "italic");
          }
          if ($(this).attr("id") == "format-underlined") {
            canvas.getActiveObject().set("underline", true);
          }
          if ($(this).attr("id") == "format-align-left") {
            canvas.getActiveObject().set("textAlign", "left");
          }
          if ($(this).attr("id") == "format-align-right") {
            canvas.getActiveObject().set("textAlign", "right");
          }
          if ($(this).attr("id") == "format-align-center") {
            canvas.getActiveObject().set("textAlign", "center");
          }
          if ($(this).attr("id") == "format-align-justify") {
            canvas.getActiveObject().set("textAlign", "justify");
          }
          selector.find(".format-align").removeClass("active");
          if ($(this).attr("id") != "format-uppercase") {
            $(this).addClass("active");
          }
        }
        canvas.requestRenderAll();
        canvas.fire("hexa:history", {
          type: "textbox",
          text: hexaParams.edited,
        });
      });
    /* Text Numeric Fields */
    selector
      .find("#hexa-text-settings input[type=number]")
      .bind("input paste keyup keydown", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "hexa-font-size") {
          canvas.getActiveObject().set("fontSize", parseInt(val));
        } else if ($(this).attr("id") == "hexa-outline-size") {
          canvas.getActiveObject().set("strokeWidth", parseInt(val));
        } else if ($(this).attr("id") == "hexa-line-height") {
          canvas.getActiveObject().set("lineHeight", parseFloat(val));
        } else if ($(this).attr("id") == "hexa-letter-spacing") {
          canvas.getActiveObject().set("charSpacing", parseInt(val));
        }
        canvas.requestRenderAll();
      });
    selector
      .find("#hexa-text-settings input[type=number]")
      .bind("input", function () {
        window.clearTimeout(timeOut);
        timeOut = setTimeout(function () {
          canvas.fire("hexa:history", {
            type: "textbox",
            text: hexaParams.edited,
          });
        }, 500);
      });
    /* Text Color Fields */
    selector
      .find("#hexa-text-settings .hexa-colorpicker")
      .bind("change", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "hexa-text-color") {
          canvas.getActiveObject().set("fill", val);
        } else if ($(this).attr("id") == "hexa-outline-color") {
          canvas.getActiveObject().set("stroke", val);
        } else if ($(this).attr("id") == "hexa-text-background") {
          canvas.getActiveObject().set("textBackgroundColor", val);
        }
        canvas.requestRenderAll();
        canvas.fire("hexa:history", {
          type: "textbox",
          text: hexaParams.edited,
        });
      });
    /* Text Flip Buttons */
    selector.find("#hexa-text-flip-btns > .hexa-btn").on("click", function () {
      if ($(this).hasClass("active")) {
        if ($(this).attr("id") == "text-flip-x") {
          canvas.getActiveObject().set("flipX", false);
        } else if ($(this).attr("id") == "text-flip-y") {
          canvas.getActiveObject().set("flipY", false);
        }
        $(this).removeClass("active");
      } else {
        if ($(this).attr("id") == "text-flip-x") {
          canvas.getActiveObject().set("flipX", true);
        } else if ($(this).attr("id") == "text-flip-y") {
          canvas.getActiveObject().set("flipY", true);
        }
        $(this).addClass("active");
      }
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "textbox",
        text: hexaParams.edited,
      });
    });
    /* Text Skew, Rotate, Opacity */
    selector
      .find("#hexa-text-settings input[type=range]")
      .bind("input click", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "text-skew-x") {
          canvas.getActiveObject().set("skewX", parseInt(val));
        } else if ($(this).attr("id") == "text-skew-y") {
          canvas.getActiveObject().set("skewY", parseInt(val));
        } else if ($(this).attr("id") == "text-rotate") {
          canvas.getActiveObject().set("angle", parseInt(val));
        } else if ($(this).attr("id") == "text-opacity") {
          canvas.getActiveObject().set("opacity", parseFloat(val));
        }
        canvas.requestRenderAll();
      });
    selector
      .find("#hexa-text-settings input[type=range]")
      .bind("change", function () {
        canvas.fire("hexa:history", {
          type: "textbox",
          text: hexaParams.edited,
        });
      });
    /* Select2 icon support */
    function select2format(icon) {
      var originalOption = icon.element;
      if ($(originalOption).data("icon")) {
        return $(
          '<div class="select2-item"><span class="material-icons">' +
            $(originalOption).data("icon") +
            "</span>" +
            icon.text +
            "</div>"
        );
      } else if ($(originalOption).data("font")) {
        return $(
          '<div class="select2-item" style="font-family:' +
            $(originalOption).data("font") +
            '">' +
            icon.text +
            "</div>"
        );
      } else {
        return $('<div class="select2-item">' + icon.text + "</div>");
      }
    }
    /* Set Image Settings */
    function setImageSettings(img) {
      selector.find("#img-border-radius").val(img.roundedCorders);
      selector
        .find("#img-border-radius")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(img.roundedCorders);
      if (img.shadow == null) {
        selector.find("#hexa-image-shadow").prop("checked", false);
      } else {
        selector.find("#hexa-image-shadow").prop("checked", true);
        selector.find("#image-shadow-color").spectrum("set", img.shadow.color);
        selector.find("#image-shadow-blur").val(img.shadow.blur);
        selector.find("#image-shadow-offset-x").val(img.shadow.offsetX);
        selector.find("#image-shadow-offset-y").val(img.shadow.offsetY);
      }
      selector.find("#hexa-image-shadow").trigger("change");
      selector.find("#img-border-width").val(img.strokeWidth);
      selector.find("#img-border-color").spectrum("set", img.stroke);
      selector.find("#img-opacity").val(img.opacity);
      selector
        .find("#img-opacity")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(img.opacity);
      selector.find("#img-skew-x").val(img.skewX);
      selector
        .find("#img-skew-x")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(img.skewX);
      selector.find("#img-skew-y").val(img.skewY);
      selector
        .find("#img-skew-y")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(img.skewY);
      selector.find("#img-rotate").val(parseInt(img.angle));
      selector
        .find("#img-rotate")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(parseInt(img.angle));
    }
    /* Upload Image */
    // selector.find("#hexa-img-upload").on("change", function(e) {
    // 	var reader = new FileReader();
    // 	reader.onload = function(event) {
    // 		var imgObj = new Image();
    // 		convertToDataURL(event.target.result, function(dataUrl) {
    // 			imgObj.src = dataUrl;
    // 			imgObj.onload = function() {
    // 				var image = new fabric.Image(imgObj);
    // 				image.set({
    // 					objectType: "image",
    // 					roundedCorders: 0,
    // 					stroke: "#fff",
    // 					strokeWidth: 0,
    // 					top: getScaledSize()[1] / 2,
    // 					left: getScaledSize()[0] / 2,
    // 					originX: "center",
    // 					originY: "center",
    // 				});
    // 				canvas.add(image);
    // 				image.scaleToWidth(getScaledSize()[0] / 2);
    // 				if (image.isPartiallyOnScreen()) {
    // 					image.scaleToHeight(getScaledSize()[1] / 2);
    // 				}
    // 				canvas.setActiveObject(image);
    // 				canvas.requestRenderAll();
    // 			};
    // 		});
    // 	};
    // 	reader.readAsDataURL(e.target.files[0]);
    // 	canvas.fire("hexa:history", {
    // 		type: "image",
    // 		text: hexaParams.added,
    // 	});
    // });

    // function AddingFilter(imgObj){

    // 	var filteredImage = new fabric.Image(imgObj);
    // 	filteredImage.filters.push(new fabric.Image.filters.Polaroid());
    // 	filteredImage.applyFilters();
    // 	var filteredImageUrl = filteredImage.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image0").attr("src", filteredImageUrl);

    // 	var filteredImage2 = new fabric.Image(imgObj);
    // 	filteredImage2.filters.push(new fabric.Image.filters.BlackWhite());
    // 	filteredImage2.applyFilters();
    // 	var filteredImageUrl2 = filteredImage2.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image3").attr("src", filteredImageUrl2);

    // 	var filteredImage3 = new fabric.Image(imgObj);
    // 	filteredImage3.filters.push(new fabric.Image.filters.Sepia());
    // 	filteredImage3.applyFilters();
    // 	var filteredImageUrl3 = filteredImage3.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image2").attr("src", filteredImageUrl3);

    // 	var filteredImage4 = new fabric.Image(imgObj);
    // 	filteredImage4.filters.push(new fabric.Image.filters.Grayscale());
    // 	filteredImage4.applyFilters();
    // 	var filteredImageUrl4 = filteredImage4.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image1").attr("src", filteredImageUrl4);

    // 	var filteredImage5 = new fabric.Image(imgObj);
    // 	filteredImage5.filters.push(new fabric.Image.filters.Brownie());
    // 	filteredImage5.applyFilters();
    // 	var filteredImageUrl5 = filteredImage5.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image4").attr("src", filteredImageUrl5);

    // 	var filteredImage6 = new fabric.Image(imgObj);
    // 	filteredImage6.filters.push(new fabric.Image.filters.Vintage());
    // 	filteredImage6.applyFilters();
    // 	var filteredImageUrl6 = filteredImage6.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image5").attr("src", filteredImageUrl6);

    // 	var filteredImage7 = new fabric.Image(imgObj);
    // 	filteredImage7.filters.push(new fabric.Image.filters.Kodachrome());
    // 	filteredImage7.applyFilters();
    // 	var filteredImageUrl7 = filteredImage7.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image6").attr("src", filteredImageUrl7);

    // 	var filteredImage8 = new fabric.Image(imgObj);
    // 	filteredImage8.filters.push(new fabric.Image.filters.Technicolor());
    // 	filteredImage8.applyFilters();
    // 	var filteredImageUrl8 = filteredImage8.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image7").attr("src", filteredImageUrl8);

    // 	var filteredImage8 = new fabric.Image(imgObj);
    // 	filteredImage8.filters.push(new fabric.Image.filters.Shift());
    // 	filteredImage8.applyFilters();
    // 	var filteredImageUrl8 = filteredImage8.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image8").attr("src", filteredImageUrl8);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Invert());
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image9").attr("src", filteredImageUrl9);

    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Contrast());
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image10").attr("src", filteredImageUrl9);

    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Brightness());
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image11").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Pixelate({
    // 		blocksize: 8
    // 	}));
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image12").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Blur({
    // 		blur: 2
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image13").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Blur({
    // 		blur: .5
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image14").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Convolute({
    // 		matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0]
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image15").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Convolute({
    // 		matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1]
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image16").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.RemoveColor({
    // 		threshold: 0.2,
    // 		distance: 0.5
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image17").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Vibrance({
    // 		vibrance: 1.5
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image18").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.BlendColor({
    // 		color: '#00ff00',
    // 		mode: 'multiply'
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image19").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.BlendColor({
    // 		image: "#fff",
    // 		mode: 'multiply',
    // 		alpha: 0.2
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image20").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.HueRotation({
    // 		rotation: 0.5
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image21").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Resize({
    // 		scaleX: 1.5,
    // 		scaleY: 1.5
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image22").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Saturation({
    // 		saturation: 1.5
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image23").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Gamma({
    // 		gamma: [1.5, 1.5, 1.5]
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image24").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Convolute({
    // 		matrix: [ 1, 0, -1, 2, 0, -2, 1, 0, -1 ]
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image25").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Convolute({
    // 		matrix: [ 1, 2, 1, 0, 0, 0, -1, -2, -1 ]
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image26").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Noise({
    // 		noise: 100
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image27").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.Blur({
    // 		blur: .1
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image28").attr("src", filteredImageUrl9);
    // 	var filteredImage9 = new fabric.Image(imgObj);
    // 	filteredImage9.filters.push(new fabric.Image.filters.ColorMatrix({
    // 		matrix: [2, 0, 0, 0, 0,
    // 				 0, 2, 0, 0, 0,
    // 				 0, 0, 2, 0, 0,
    // 				 0, 0, 0, 2, 0],
    // 	}))
    // 	filteredImage9.applyFilters();
    // 	var filteredImageUrl9 = filteredImage9.toDataURL({
    // 		format: 'png',
    // 		multiplier: 2,
    // 	});
    // 	$("#image29").attr("src", filteredImageUrl9);
    // }
    var filterImageUrl;
    selector.find("#hexa-img-upload").on("change", function (e) {
      // console.log('uploaded')
      var reader = new FileReader();
      reader.onload = function (event) {
        var imgObj = new Image();
        convertToDataURL(event.target.result, function (dataUrl) {
          imgObj.src = dataUrl;
          imgObj.onload = function () {
            var image = new fabric.Image(imgObj);

            image.set({
              objectType: "image",
              roundedCorners: 0,
              stroke: "#fff",
              strokeWidth: 0,
              top: getScaledSize()[1] / 2,
              left: getScaledSize()[0] / 2,
              originX: "center",
              originY: "center",
            });
            var scaleFactor = Math.min(
              (canvas.getWidth() / image.width) * 2,
              (canvas.getHeight() / image.height) * 2
            );

            image.scaleToWidth(image.width * scaleFactor);
            image.scaleToHeight(image.height * scaleFactor);

            /** Filter Thumbnail */

            canvas.add(image);
            canvas.setActiveObject(image);
            canvas.requestRenderAll();
            // AddingFilter(imgObj)
            // filterImageUrl = imgObj;

            // Clear the file input value to allow re-uploading the same image
            selector.find("#hexa-img-upload").val("");
          };
        });
      };
      reader.readAsDataURL(e.target.files[0]);
      canvas.fire("hexa:history", {
        type: "image",
        text: hexaParams.added,
      });
    });
    /* Upload Overlay Image */
    selector.find("#hexa-overlay-img-upload").on("change", function (e) {
      if ($(this).val() == "") {
        return;
      }
      selector.find("#hexa-canvas-loader").css("display", "flex");
      var reader = new FileReader();
      reader.onload = function (event) {
        fabric.Image.fromURL(event.target.result, function (img) {
          img.set({
            scaleX: getScaledSize()[0] / img.width,
            scaleY: getScaledSize()[1] / img.height,
            objectCaching: false,
            originX: "left",
            originY: "top",
            selectable: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            erasable: true,
          });
          canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
          selector.find("#hexa-overlay-wrap").show();
          selector
            .find("#hexa-overlay-preview")
            .attr("src", event.target.result);
          setTimeout(function () {
            selector.find("#hexa-canvas-loader").hide();
          }, 500);
        });
      };
      reader.readAsDataURL(e.target.files[0]);
      canvas.fire("hexa:history", {
        type: "image",
        text: hexaParams.added,
      });
    });
    /* Delete Overlay Image */
    selector.find("#hexa-overlay-delete").on("click", function () {
      if (
        typeof canvas.overlayImage !== "undefined" &&
        canvas.overlayImage !== null
      ) {
        canvas.overlayImage = null;
        selector.find("#hexa-overlay-wrap").hide();
        selector.find("#hexa-overlay-preview").attr("src", "");
        canvas.requestRenderAll();
      }
    });

    function toggleDeleteDropdown(event) {
      dropdownOptions.toggleClass("show");
      event.stopPropagation();
    }

    function handleOptionClick(event) {
      event.stopPropagation();
      var selectedValue = $(event.target).data("value");
      console.log("Clicked on option:", selectedValue);
      //   $(document).on('click', function (event) {
      // $('.dropdown-options').removeClass('show');
      // });
    }
    var dropdown = $("#hexa-canvas-shape-container .custom-dropdown");
    var dropdownOptions = dropdown.find(".dropdown-options");
    dropdown.on("click", function (event) {
      toggleDeleteDropdown(event);
    });
    dropdownOptions.find("[data-value]").on("click", function (event) {
      handleOptionClick(event);
    });
    $(document).on("click", function (event) {
      if (!$(event.target).closest(".custom-dropdown").length) {
        dropdownOptions.removeClass("show");
      }
    });
    /** Adding layout */

    $(document).ready(function () {
      setTimeout(function () {
        AddingImage();
        console.log("image is adding");
      }, 400);
    });

    var preservedImage;
    var layoutSource = null; // Renamed from imgUrl

    // Fetch image data from the API
    async function fetchImageData() {
      try {
        const response = await fetch(
          "https://backend.toddlerneeds.com/api/v1/product/all"
        );
        const data = await response.json();

        // Get the 'name' query parameter from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get("name");
        console.log("name from query param is", name);

        // Find the image URL based on the product name
        const product = data.products.find((item) => item.name === name);
        if (product && product.imageUrl) {
          layoutSource = product.imageUrl; // Set the image URL dynamically
          console.log("Image URL from API: ", layoutSource);
        } else {
          console.error("Image not found for the specified name.");
        }
      } catch (error) {
        console.error("Error fetching image data:", error);
      }
    }

    async function AddingImage() {
      console.log("adding image");

      // Fetch image data first
      await fetchImageData();

      // Proceed only if layoutSource is available
      if (layoutSource) {
        console.log("png image filepath ", layoutSource);

        // Delay the execution by 2 seconds (2000 milliseconds)
        setTimeout(() => {
          fabric.Image.fromURL(layoutSource, function (img) {
            img.set({
              selectable: false,
              evented: false,
              hasControls: false,
              customId: "layoutImage",
              isPreservedObject: true,
            });

            // Apply specific scaling if name is 'p3-type1'
            const urlParams = new URLSearchParams(window.location.search);
            const name = urlParams.get("name");
            if (name === "p3-type1") {
              img.scaleX = 2;
              img.scaleY = 2;
            }

            preservedImage = img;
            canvas.add(img);
            canvas.renderAll();
            onlyDeleteLayerEvent(img.id);
          });
        }, 1000); // 2 seconds delay
      } else {
        console.error("No layout source found. Image loading skipped.");
      }
    }

    /*Toggel Border Tools*/

    selector.find("#hexa-border-tools").on("click", function () {
      selector.find("#hexa-border-tools-toggle").toggle();
      var arrowIcon = $(this).find(".arrow");
      arrowIcon.toggleClass("arrow-down arrow-up");
      if (arrowIcon.hasClass("arrow-up")) {
        arrowIcon.text("keyboard_arrow_up");
        $("#hexa-border-tools-wrap").addClass("active");
      } else {
        arrowIcon.text("keyboard_arrow_down");
        $("#hexa-border-tools-wrap").removeClass("active");
      }
    });

    /*Toggel Framing Tools*/

    selector.find("#hexa-framing").on("click", function () {
      selector.find("#hexa-framing-toggle").toggle();
    });
    /** Toggle Farming arrow */
    $("#hexa-framing").on("click", function () {
      var arrowIcon = $(this).find(".arrow");
      arrowIcon.toggleClass("arrow-down arrow-up");
      if (arrowIcon.hasClass("arrow-up")) {
        arrowIcon.text("keyboard_arrow_up");
        $("#hexa-framing-wrapper").addClass("active");
      } else {
        arrowIcon.text("keyboard_arrow_down");
        $("#hexa-framing-wrapper").removeClass("active");
      }
    });

    /** Toggle Active container */
    // $("#hexa-mydiv").click(function() {
    // 	$(this).toggleClass("active");
    //   });

    /* Image Mask */
    var activeImage;
    var selectionRect;
    var selectioncircle;
    var selectiontriangle;
    var svgPathString;
    var shape;
    var selectionSvg;
    var isAdded = false;
    selector.find(".hexa-mask-shape-select-option").on("click", function (e) {
      var selected = $(this).data("value");
      isAdded = true;
      activeMaskButton();
      if (selected == "custom") {
        selector.find("#hexa-img-radius-settings").removeClass("d-none");
      } else {
        selector.find("#hexa-img-radius-settings").addClass("d-none");
        selector.find("#img-border-radius").val("0");
        selector
          .find("#img-border-radius")
          .parent()
          .parent()
          .find("label span")
          .html("0");
      }
      var obj = canvas.getActiveObject();
      var mask = null;
      var left = -(obj.width / 2);
      var top = -(obj.width / 2);
      var radius = obj.width / 2;
      if (obj.width > obj.height) {
        left = -(obj.height / 2);
        top = -(obj.height / 2);
        radius = obj.height / 2;
      }
      obj.clipPath = null;
      canvas.requestRenderAll();
      if (selected == "circle") {
        shape = "circle";
        activeImage = obj;
        obj.set({
          top: 0,
          left: 0,
          originX: "left",
          originY: "top",
        });
        selectioncircle = new fabric.Circle({
          fill: "rgba(0,0,0,0.3)",
          originX: "left",
          originY: "top",
          stroke: "black",
          opacity: 1,
          radius: 150,
          hasRotatingPoint: false,
          transparentCorners: false,
          cornerColor: "white",
          cornerStrokeColor: "black",
          borderColor: "black",
          cornerSize: 12,
          padding: 0,
          cornerStyle: "circle",
          borderDashArray: [5, 5],
          borderScaleFactor: 1.3,
        });
        canvas.add(selectioncircle);
        canvas.setActiveObject(selectioncircle);
        canvas.renderAll();
      } else if (selected == "triangle") {
        shape = "triangle";
        activeImage = obj;
        obj.set({
          top: 0,
          left: 0,
          originX: "left",
          originY: "top",
        });
        selectiontriangle = new fabric.Triangle({
          fill: "rgba(0,0,0,0.3)",
          originX: "left",
          originY: "top",
          stroke: "black",
          opacity: 1,
          width: radius,
          height: radius,
          hasRotatingPoint: false,
          transparentCorners: false,
          cornerColor: "white",
          cornerStrokeColor: "black",
          borderColor: "black",
          cornerSize: 12,
          padding: 0,
          cornerStyle: "circle",
          borderDashArray: [5, 5],
          borderScaleFactor: 1.3,
        });

        canvas.add(selectiontriangle);
        canvas.setActiveObject(selectiontriangle);
        canvas.renderAll();
      } else if (selected == "rectangle") {
        shape = "rectangle";
        activeImage = obj;
        obj.set({
          top: 0,
          left: 0,
          originX: "left",
          originY: "top",
        });
        selectionRect = new fabric.Rect({
          fill: "rgba(0,0,0,0.3)",
          originX: "left",
          originY: "top",
          stroke: "black",
          opacity: 1,
          width: obj.width,
          height: obj.height,
          hasRotatingPoint: false,
          transparentCorners: false,
          cornerColor: "white",
          cornerStrokeColor: "black",
          borderColor: "black",
          cornerSize: 12,
          padding: 0,
          cornerStyle: "circle",
          borderDashArray: [5, 5],
          borderScaleFactor: 1.3,
        });
        selectionRect.scaleToWidth(300);
        canvas.add(selectionRect);
        canvas.setActiveObject(selectionRect); // Set the selection rectangle as the active object
        canvas.renderAll();
        // canvas.renderAll();
      } else if (selected == "square") {
        shape = "rectangle";
        activeImage = obj;
        obj.set({
          top: 0,
          left: 0,
          originX: "left",
          originY: "top",
        });
        selectionRect = new fabric.Rect({
          fill: "rgba(0,0,0,0.3)",
          originX: "left",
          originY: "top",
          stroke: "black",
          opacity: 1,
          width: 300,
          height: 300,
          hasRotatingPoint: false,
          transparentCorners: false,
          cornerColor: "white",
          cornerStrokeColor: "black",
          borderColor: "black",
          cornerSize: 12,
          padding: 0,
          cornerStyle: "circle",
          borderDashArray: [5, 5],
          borderScaleFactor: 1.3,
        });
        selectionRect.scaleToWidth(300);
        canvas.add(selectionRect);
        canvas.setActiveObject(selectionRect);
        canvas.renderAll();
      } else if (selected == "other") {
        shape = "other";
        activeImage = obj;

        // obj.set({
        //   top: 0,
        //   left: 0,
        //   originX: "left",
        //   originY: "top",
        // });

        var svgFileUrl = $(this).find("img.lazy").data("src");
        // console.log(svgFileUrl);
        var regex = /\/([^\/]+)\/[^\/]+\.svg$/; // Regular expression to match "abstract-shapes" from the URL
        var matches = svgFileUrl.match(regex);
        var shapeName = matches[1];
        var scaleX, scaleY;
        $.ajax({
          url: svgFileUrl,
          method: "GET",
          dataType: "xml",
          async: false,
          success: function (svgContent) {
            var pathElement = $(svgContent).find("path");
            svgPathString = pathElement.attr("d");
            var pathPoints = fabric.util.parsePath(svgPathString);
            scaleX = 3;
            scaleY = 3;
            if (shapeName == "geometric-shapes") {
              if (svgFileUrl == "files/elements/geometric-shapes/1.svg") {
                scaleX = 30;
                scaleY = 30;
              } else if (
                svgFileUrl == "files/elements/geometric-shapes/square.svg"
              ) {
                scaleX = 5;
                scaleY = 5;
              } else if (
                svgFileUrl == "files/elements/geometric-shapes/circle.svg"
              ) {
                scaleX = 5;
                scaleY = 5;
                svgPathString =
                  "M110,50 A50,50 0 1,1 10,50 A50,50 0 1,1 110,50 Z";
              } else {
                scaleX = 10;
                scaleY = 10;
              }
            } else if (shapeName == "Numbers") {
              scaleX = 1;
              scaleY = 1;
            } else if (shapeName == "alphabets") {
              scaleX = 1;
              scaleY = 1;
            } else if (shapeName == "people") {
              scaleX = 1;
              scaleY = 1;
            } else if (shapeName == "gifts") {
              scaleX = 4;
              scaleY = 4;
            } else if (shapeName == "animals") {
              scaleX = 18;
              scaleY = 18;
            } else if (shapeName == "weapons") {
              scaleX = 2;
              scaleY = 2;
            } else if (shapeName == "trees") {
              scaleX = 4;
              scaleY = 4;
            } else if (shapeName == "clouds") {
              scaleX = 16;
              scaleY = 16;
            } else if (shapeName == "speech-bubbles") {
              scaleX = 2;
              scaleY = 2;
            } else if (shapeName == "shape-badges") {
              scaleX = 2;
              scaleY = 2;
            } else if (shapeName == "ink-brush-strokes") {
              scaleX = 4;
              scaleY = 4;
            }
          },
          error: function (error) {
            console.error("Error fetching SVG file:", error);
          },
        });
        var scaleFactor = 3;
        selectionSvg = new fabric.Path(svgPathString, {
          fill: "rgba(255,0,0,0.5)",
          originX: "left",
          originY: "top",
          stroke: "rgba(0,0,0,0.3)",
          opacity: 1,
          hasRotatingPoint: false,
          transparentCorners: false,
          cornerColor: "white",
          cornerStrokeColor: "black",
          borderColor: "black",
          cornerSize: 12,
          padding: 0,
          cornerStyle: "circle",
          borderDashArray: [5, 5],
          borderScaleFactor: 1.3,
          top: 300,
          left: 300,
          // scaleX: scaleFactor,
          // scaleY: scaleFactor,
          scaleX: scaleX,
          scaleY: scaleY,
        });
        addClipMask(selectionSvg.path, activeImage);
        // canvas.add(selectionSvg);
        // canvas.setActiveObject(selectionSvg);
        // canvas.renderAll();
      }
      // setTimeout(function () {
      //   // obj.clipPath = mask;
      //   canvas.requestRenderAll();
      //   addToHistory(
      //     objectName("image") +
      //     " " +
      //     hexaParams.mask +
      //     " " +
      //     hexaParams.added
      //   );
      // }, 100);
    });

    function onlyDeleteLayerEvent(id) {
      var item = selector.find("#hexa-layers #" + id);
      item.remove();
      selector.find("#hexa-layers").sortable("refresh");
      checkLayers();
    }

    function setLayerSort(id, sortIndex) {
      var item = selector.find("#hexa-layers #" + id);
      item.attr("data-sort", sortIndex);
      selector.find("#hexa-layers").sortable("refresh");
      checkLayers();
    }

    var transferedImageArr;
    var transfaredImage;
    function crop(event) {
      if (!transferedImageArr) {
        transferedImageArr = [];
      }
      if (shape === "rectangle") {
        const rectVariables = {
          left: selectionRect.left,
          top: selectionRect.top,
          width: selectionRect.getScaledWidth(),
          height: selectionRect.getScaledHeight(),
          absolutePositioned: true,
        };
        let rect = new fabric.Rect(rectVariables);
        var selectionRectId = selectionRect.id;

        canvas.remove(selectionRect);
        var cropped = new Image();
        const cropperVariables = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
        cropped.src = activeImage.toDataURL(cropperVariables);

        cropped.onload = function () {
          canvas.remove(activeImage);
          let image = new fabric.Image(cropped);
          image.left = rect.left;
          image.top = rect.top;
          transfaredImage = image.height;
          console.log(transfaredImage);
          canvas.add(image);
          image.setCoords();
          canvas.renderAll();

          transferedImageArr.push({
            imageData: image,
            activeImageData: activeImage,
            layId: selectionRect.id,
          });
          console.log(transferedImageArr);
          onlyDeleteLayerEvent(activeImage.id);
          onlyDeleteLayerEvent(selectionRectId);
        };
      } else if (shape === "circle") {
        const circleVariables = {
          left: selectioncircle.left,
          top: selectioncircle.top,
          radius: selectioncircle.getScaledWidth() / 2,
          absolutePositioned: true,
        };
        var selectioncircleId = selectioncircle.id;
        let circle = new fabric.Circle(circleVariables);
        activeImage.clipPath = circle;
        canvas.remove(selectioncircle);
        var cropped = new Image();
        const cropperVariables = {
          left: circle.left,
          top: circle.top,
          width: circle.radius * 2,
          height: circle.radius * 2,
        };
        cropped.src = activeImage.toDataURL(cropperVariables);
        cropped.onload = function () {
          canvas.remove(activeImage);
          let image = new fabric.Image(cropped);
          image.left = cropperVariables.left;
          image.top = cropperVariables.top;
          transfaredImage = image.height;
          canvas.add(image);
          image.setCoords();
          canvas.renderAll();
          activeImage.clipPath = null;
          transferedImageArr.push({
            imageData: image,
            activeImageData: activeImage,
            layId: selectioncircle.id,
          });
          onlyDeleteLayerEvent(activeImage.id);
          onlyDeleteLayerEvent(selectioncircleId);
          console.log(transferedImageArr);
        };
      } else if (shape === "triangle") {
        const triangleVariables = {
          left: selectiontriangle.left,
          top: selectiontriangle.top,
          width: selectiontriangle.getScaledWidth(),
          height: selectiontriangle.getScaledHeight(),
          absolutePositioned: true,
        };
        var selectiontriangleId = selectiontriangle.id;
        let triangleClipPath = new fabric.Triangle(triangleVariables);

        activeImage.clipPath = triangleClipPath;
        canvas.remove(selectiontriangle);
        // canvas.add(triangleClipPath)
        var cropped = new Image();
        const cropperVariables = {
          left: triangleClipPath.left,
          top: triangleClipPath.top,
          width: triangleClipPath.width,
          height: triangleClipPath.height,
        };
        cropped.src = activeImage.toDataURL(cropperVariables);
        cropped.onload = function () {
          canvas.remove(activeImage);
          let image = new fabric.Image(cropped);
          image.left = cropperVariables.left;
          image.top = cropperVariables.top;
          transfaredImage = image.cacheKey;
          canvas.add(image);
          image.setCoords();
          canvas.renderAll();
          activeImage.clipPath = null;
          transferedImageArr.push({
            imageData: image,
            activeImageData: activeImage,
            layId: selectiontriangle.id,
          });
          onlyDeleteLayerEvent(activeImage.id);
          onlyDeleteLayerEvent(selectiontriangleId);

          console.log(transferedImageArr);
        };
      } else if (shape === "square") {
      } else if (shape === "other") {
        console.log(selectionSvg);
        const newPath = selectionSvg.path;
        console.log(newPath);
        let svgMaterial = new fabric.Path(newPath, {
          left: selectionSvg.left,
          top: selectionSvg.top,
          width: selectionSvg.getScaledWidth(),
          height: selectionSvg.getScaledHeight(),
          absolutePositioned: true,
          originX: selectionSvg.originX,
          originY: selectionSvg.originY,
          scaleX: selectionSvg.scaleX,
          scaleY: selectionSvg.scaleY,
        });
        var selectionSvgId = selectionSvg.id;
        console.log(svgMaterial.getBoundingRect());
        activeImage.clipPath = svgMaterial;
        const boundingRect = svgMaterial.getBoundingRect();
        const updatedWidth = boundingRect.width;
        const updatedHeight = boundingRect.height;
        const adjustedLeft = boundingRect.left;
        const adjustedTop = boundingRect.top;
        canvas.remove(selectionSvg);
        var cropped = new Image();
        const cropperVariables = {
          left: adjustedLeft,
          top: adjustedTop,
          width: updatedWidth,
          height: updatedHeight,
          path: svgMaterial.path,
          scaleX: svgMaterial.scaleX,
          scaleY: svgMaterial.scaleY,
          originX: svgMaterial.originX,
          originY: svgMaterial.originY,
        };

        cropped.src = activeImage.toDataURL(cropperVariables);
        cropped.onload = function () {
          canvas.remove(activeImage);
          let image = new fabric.Image(cropped);
          image.left = cropperVariables.left;
          image.top = cropperVariables.top;
          image.height = cropperVariables.height;
          image.width = cropperVariables.width;
          canvas.add(image);
          image.setCoords();
          canvas.renderAll();
          activeImage.clipPath = null;
          transferedImageArr.push({
            imageData: image,
            activeImageData: activeImage,
            layId: selectionSvg.id,
          });
          onlyDeleteLayerEvent(activeImage.id);
          onlyDeleteLayerEvent(selectionSvgId);
        };
      }
    }

    function addClipMask(path, activeObject) {
      var uniqueId = "clipmask";
      if (activeObject) {
        activeObject.customId = uniqueId;
        var shell = new fabric.Path(path, {
          fill: "",
          // stroke: 'blue',
          strokeWidth: 5,
          scaleX: 3,
          scaleY: 3,
          lockScalingX: false,
          lockScalingY: false,
          lockSkewingX: true,
          lockSkewingY: true,
          originX: "center",
          originY: "center",
          top: activeObject.top,
          left: activeObject.left,
        });
        var clipPath = new fabric.Path(path, {
          absolutePositioned: true,
          originX: "center",
          originY: "center",
          scaleX: 3,
          scaleY: 3,
          top: activeObject.top,
          left: activeObject.left,
        });

        shell.customId = uniqueId;

        activeObject.clipPath = clipPath;
        activeObject.setCoords();

        shell.on("moving", ({ e, transform, pointer }) => {
          clipPath.setPositionByOrigin(
            shell.getCenterPoint(),
            "center",
            "center"
          );
          activeObject.set("dirty", true);
          shell.bringToFront();
        });

        shell.on("rotating", () => {
          clipPath.set({ angle: shell.angle });
          activeObject.set("dirty", true);
          shell.bringToFront();
        });

        shell.on("scaling", () => {
          clipPath.scale(shell.scaleX, shell.scaleY);
          clipPath.set({ top: shell.top, left: shell.left }); // Update the position of the clipPath
          activeObject.set("dirty", true);
          shell.bringToFront();
        });
        canvas.add(shell);
        canvas.setActiveObject(activeObject);
        // isChangeble = true;
        document.getElementById("done-masking-img").style.display = "block";
        document.getElementById("replace-image-btn").style.display = "block";
        document.getElementById("edit-masking-button").style.display = "none";
      } else {
        alert("Please select an image object on the canvas first.");
      }
    }

    function applyTemplateClipMask(activeObject, newShell) {
      let path = newShell.path;

      if (activeObject && newShell) {
        const url = activeObject.src;

        fabric.Image.fromURL(url, function (img) {
          img.set({
            left: activeObject.left,
            top: activeObject.top,
            scaleX: activeObject.scaleX,
            scaleY: activeObject.scaleY,
            originX: activeObject.originX,
            originY: activeObject.originY,
          });

          // Add image to canvas
          canvas.add(img);

          // Create and configure shell (path)
          const shell = new fabric.Path(path, {
            fill: "",
            // stroke: 'blue',
            strokeWidth: 5,
            scaleX: newShell.scaleX,
            scaleY: newShell.scaleY,
            lockScalingX: false,
            lockScalingY: false,
            lockSkewingX: true,
            lockSkewingY: true,
            originX: "center",
            originY: "center",
            top: activeObject.top,
            left: activeObject.left,
          });

          // Create and configure clipPath (path)
          const clipPath = new fabric.Path(path, {
            absolutePositioned: true,
            originX: "center",
            originY: "center",
            scaleX: shell.scaleX,
            scaleY: shell.scaleY,
            top: activeObject.top,
            left: activeObject.left,
          });

          img.clipPath = clipPath;
          img.setCoords();
          canvas.renderAll();

          // Event handlers for shell (path)
          shell.on("moving", () => {
            clipPath.setPositionByOrigin(
              shell.getCenterPoint(),
              "center",
              "center"
            );
            img.set("dirty", true);
            shell.bringToFront();
            canvas.requestRenderAll(); // Force canvas update
          });

          shell.on("rotating", () => {
            clipPath.set({ angle: shell.angle });
            img.set("dirty", true);
            shell.bringToFront();
            canvas.requestRenderAll(); // Force canvas update
          });

          shell.on("scaling", () => {
            clipPath.scale(shell.scaleX, shell.scaleY);
            clipPath.set({ top: shell.top, left: shell.left });
            img.set("dirty", true);
            shell.bringToFront();
            canvas.requestRenderAll(); // Force canvas update
          });

          // Add shell to canvas
          canvas.add(shell);
          canvas.setActiveObject(img);
          isChangeble = true;
        });
      } else {
        alert("Both activeObject and shell must be provided.");
      }
    }

    function groupImageAndClipPath(image, clipPath) {
      const clipPathOutline = new fabric.Path(clipPath.path, {
        fill: "rgba(0,0,0,0)",
        scaleX: clipPath.scaleX / image.scaleX,
        scaleY: clipPath.scaleY / image.scaleY,
        originX: clipPath.originX,
        originY: clipPath.originY,
        left: clipPath.left,
        top: clipPath.top,
        angle: clipPath.angle,
      });
      image.clipPath = clipPathOutline;
      const group = new fabric.Group([image, clipPathOutline], {
        left: image.left,
        top: image.top,
        originX: "center",
        originY: "center",
        lockScalingFlip: true,
        hasControls: false,
        hasBorders: false,
      });

      group.customId = "clipGroup";

      image.clipPath = clipPathOutline;

      canvas.add(group);
      group.setCoords();
      canvas.setActiveObject(group);
      canvas.renderAll();
      return group;
    }

    function updateReplaceButtonState() {
      const activeObject = canvas.getActiveObject();
      console.log("this is active now", activeObject);
      const replaceButton = document.getElementById("replace-image-btn");
      const editButton = document.getElementById("edit-masking-button"); // Assuming 'edit-button' is the ID of the edit button

      if (activeObject && activeObject.type === "image") {
        replaceButton.disabled = false;
        replaceButton.style.backgroundColor = "#00a3ff";
      } else if (
        activeObject &&
        activeObject.type === "group" &&
        activeObject.customId === "clipGroup"
      ) {
        editButton.style.display = "block";
      } else {
        replaceButton.disabled = true;
        replaceButton.style.backgroundColor = "#A2A2A2";
      }
    }

    canvas.on("selection:created", updateReplaceButtonState);
    canvas.on("selection:updated", updateReplaceButtonState);
    canvas.on("selection:cleared", updateReplaceButtonState);
    canvas.on("object:moving", () => {
      updateReplaceButtonState();
    });
    canvas.on("mouse:down", function (event) {
      updateReplaceButtonState();
    });
    // Initialize button state when the page loads
    updateReplaceButtonState();

    function ungroupImageAndClipPath() {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.customId === "clipGroup") {
        document.getElementById("done-masking-img").style.display = "block";
        document.getElementById("replace-image-btn").style.display = "block";
        document.getElementById("edit-masking-button").style.display = "none";

        const objects = activeObject.getObjects();
        const image = objects.find((obj) => obj.type === "image");
        const clipPathOutline = objects.find((obj) => obj.type === "path");

        const groupScaleX = activeObject.scaleX;
        const groupScaleY = activeObject.scaleY;
        const groupLeft = activeObject.left;
        const groupTop = activeObject.top;
        const groupAngle = activeObject.angle;

        let imageUrl = image._element.src;
        let path = clipPathOutline.path;

        console.log(
          "clipPathoutline",
          clipPathOutline.left,
          clipPathOutline.top,
          clipPathOutline.scaleX,
          clipPathOutline.scaleY
        );
        console.log("image", image.left, image.top, image.scaleX, image.scaleY);

        fabric.Image.fromURL(imageUrl, function (img) {
          img.set({
            left: groupLeft + image.left * groupScaleX,
            top: groupTop + image.top * groupScaleY,
            scaleX: image.scaleX * groupScaleX,
            scaleY: image.scaleY * groupScaleY,
            originX: image.originX,
            originY: image.originY,
            angle: groupAngle + image.angle,
            customId: "clipmask",
          });
          img.setCoords();
          canvas.add(img);

          const shell = new fabric.Path(path, {
            fill: "",
            strokeWidth: 5,
            scaleX: clipPathOutline.scaleX * groupScaleX * image.scaleX,
            scaleY: clipPathOutline.scaleY * groupScaleY * image.scaleY,
            lockScalingX: false,
            lockScalingY: false,
            lockSkewingX: true,
            lockSkewingY: true,
            originX: clipPathOutline.originX,
            originY: clipPathOutline.originY,
            top: groupTop + clipPathOutline.top * groupScaleY,
            left: groupLeft + clipPathOutline.left * groupScaleX,
            angle: groupAngle + clipPathOutline.angle,
            customId: "clipmask",
          });

          const clipPath = new fabric.Path(path, {
            absolutePositioned: true,
            originX: "center",
            originY: "center",
            scaleX: shell.scaleX / groupScaleX,
            scaleY: shell.scaleY / groupScaleY,
            top: shell.top,
            left: shell.left,
            customId: "clipmask",
          });

          img.clipPath = clipPath;
          img.setCoords();
          canvas.renderAll();

          shell.on("moving", () => {
            clipPath.setPositionByOrigin(
              shell.getCenterPoint(),
              "center",
              "center"
            );
            img.set("dirty", true);
            shell.bringToFront();
            canvas.requestRenderAll(); // Force canvas update
          });

          shell.on("rotating", () => {
            clipPath.set({ angle: shell.angle });
            img.set("dirty", true);
            shell.bringToFront();
            canvas.requestRenderAll(); // Force canvas update
          });

          shell.on("scaling", () => {
            clipPath.scale(
              shell.scaleX / groupScaleX,
              shell.scaleY / groupScaleY
            );
            clipPath.set({ top: shell.top, left: shell.left });
            img.set("dirty", true);
            shell.bringToFront();
            canvas.requestRenderAll(); // Force canvas update
          });

          canvas.add(shell);
          canvas.setActiveObject(img);
        });

        onlyDeleteLayerEvent(activeObject.id);
        canvas.remove(activeObject);
        canvas.renderAll();
      }
    }

    selector.find("#edit-masking-button").on("click", function () {
      ungroupImageAndClipPath();
    });

    document
      .getElementById("done-masking-img")
      .addEventListener("click", function () {
        const activeObject = canvas.getActiveObject();
        console.log("active obj is", activeObject);

        if (activeObject) {
          this.style.display = "none";
          document.getElementById("edit-masking-button").style.display =
            "block";
          document.getElementById("replace-image-btn").style.display = "none";

          if (activeObject.type === "image" && activeObject.clipPath) {
            const clipPath = activeObject.clipPath;
            const image = new fabric.Image(activeObject._element, {
              left: activeObject.left,
              top: activeObject.top,
              scaleX: activeObject.scaleX,
              scaleY: activeObject.scaleY,
              originX: activeObject.originX,
              originY: activeObject.originY,
            });

            // Remove the old active object
            canvas.remove(activeObject);

            canvas.remove(image);
            onlyDeleteLayerEvent(activeObject.id);
            onlyDeleteLayerEvent(image.id);

            // Group image and clip path
            groupImageAndClipPath(image, clipPath);
          } else if (
            activeObject.type === "path" &&
            activeObject.customId === "clipmask"
          ) {
            const image = canvas
              .getObjects("image")
              .find((img) => img.customId === activeObject.customId);
            if (image) {
              canvas.remove(image);
              onlyDeleteLayerEvent(image.id);
              groupImageAndClipPath(image, image.clipPath);
            } else {
              alert("Associated image not found for the selected clip path.");
            }
          } else {
            alert(
              "Please select an image object or a clip path on the canvas first."
            );
            console.log(canvas.getActiveObject());
          }
        } else {
          alert("No object selected on the canvas.");
        }
      });

    document
      .getElementById("replace-image-btn")
      .addEventListener("click", function () {
        document.getElementById("image-input").click();
      });

    document.getElementById("image-input").onchange = function () {
      var activeObject = canvas.getActiveObject();
      if (activeObject) {
        var file = this.files[0];
        console.log("this is the uploaded file", file);
        var reader = new FileReader();
        reader.onload = function (event) {
          var imageData = event.target.result;
          fabric.Image.fromURL(imageData, function (img) {
            img.set({
              left: activeObject.left,
              top: activeObject.top,
              scaleX: activeObject.scaleX,
              scaleY: activeObject.scaleY,
              originX: activeObject.originX,
              originY: activeObject.originX,
              clipPath: activeObject.clipPath,
              objectCaching: false,
              customId: "clipmask",
            });
            canvas.remove(activeObject);
            onlyDeleteLayerEvent(activeObject.id);
            canvas.add(img);
            setLayerSort(img.id, 3);

            // canvas.setActiveObject(img);
          });
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select an image object on the canvas first.");
      }
    };

    var maskButton = selector.find(
      "#hexa-maskbutton, #hexa-maskbutton-outsied"
    );
    maskButton.on("click", function () {
      isAdded = false;
      // crop();
    });
    function activeMaskButton() {
      maskButton.prop("disabled", !isAdded);
    }
    canvas.on("object:modified", activeMaskButton);
    canvas.on("selection:created", activeMaskButton);
    canvas.on("selection:cleared", activeMaskButton);
    const unmaskButton = selector.find("#hexa-unmask");
    unmaskButton.on("click", function () {
      const activeImage = canvas.getActiveObject();
      if (activeImage) {
        if (transferedImageArr) {
          for (let i = 0; i < transferedImageArr.length; i++) {
            const imageData = transferedImageArr[i].imageData;
            const revImage = transferedImageArr[i].activeImageData;
            const layerId = transferedImageArr[i].layId;
            if (imageData.id == activeImage.id) {
              transferedImageArr.splice(i, 1);
              canvas.add(revImage);
              canvas.remove(imageData);
              onlyDeleteLayerEvent(imageData.id);
              canvas.renderAll();
            }
          }
        }
      }
      activeUnmaskButton();
    });

    function activeUnmaskButton() {
      var hasData = transferedImageArr && transferedImageArr.length > 0;
      if (hasData) {
        unmaskButton.prop("disabled", false);
      } else {
        unmaskButton.prop("disabled", true);
      }
    }

    canvas.on("object:modified", activeUnmaskButton);
    canvas.on("selection:created", activeUnmaskButton);
    canvas.on("selection:cleared", activeUnmaskButton);

    canvas.on("mouse:down", function () {
      activeUnmaskButton();
    });

    // Trigger when any object is added to the canvas
    canvas.on("object:added", function () {
      activeUnmaskButton();
    });

    // Trigger when any object is selected
    canvas.on("object:selected", function () {
      activeUnmaskButton();
    });

    // Your addMask function (similar to the one you provided earlier)
    function addMask(canvas, points) {
      if (points) {
        const selectedObject = canvas.getActiveObject();
        const { width, height, scaleY, scaleX, top, left } = selectedObject;

        // Create a polygon mask based on the specified points
        const svgMask = new fabric.Polygon(points, {
          originX: "center",
          originY: "center",
          strokeWidth: 0,
          layersType: "shape",
          left: 0,
          top: 0,
          strokeLineJoin: "bevel",
        });

        // Scale and position the mask
        svgMask.scaleToWidth(scaleX * width);
        svgMask.scaleToHeight(scaleY * height);

        // Create a new image object
        const img = new fabric.Image(selectedObject._originalElement, {
          originX: "center",
          originY: "center",
          flipX: false,
          flipY: false,
          layersType: "image",
          imageFilters: selectedObject.imageFilters,
          filters: selectedObject.filters,
        });

        // Scale and position the image
        img.scaleToWidth(scaleX * width);
        img.scaleToHeight(scaleY * height);
        img.applyFilters();
        img.setCoords();

        // Create a group with the image and mask
        const group = new fabric.Group([img], {
          clipPath: svgMask,
          layout: "clip-path",
          top,
          left,
        });

        // Scale the group
        group.scaleToWidth(scaleX * width);
        group.scaleToHeight(scaleY * height);

        // Remove the original selected object and add the group to the canvas
        canvas.remove(selectedObject);
        canvas.add(group).setActiveObject(group).renderAll();
      }
    }

    /* Image Flip X */
    selector.find("#img-flip-horizontal").on("click", function () {
      canvas.getActiveObject().toggle("flipX");
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "image",
        text: hexaParams.edited,
      });
    });
    /* Image Flip Y */
    selector.find("#img-flip-vertical").on("click", function () {
      canvas.getActiveObject().toggle("flipY");
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "image",
        text: hexaParams.edited,
      });
    });
    /* Rounded Corners */
    var roundedCorners = (fabricObject, cornerRadius) =>
      new fabric.Rect({
        width: fabricObject.width,
        height: fabricObject.height,
        rx: cornerRadius / fabricObject.scaleX,
        ry: cornerRadius / fabricObject.scaleY,
        left: -fabricObject.width / 2,
        top: -fabricObject.height / 2,
      });
    /* Image Border Radius */
    selector.find("#img-border-radius").on("input", function () {
      canvas
        .getActiveObject()
        .set(
          "clipPath",
          roundedCorners(canvas.getActiveObject(), parseInt($(this).val()))
        );
      canvas.getActiveObject().set("roundedCorders", parseInt($(this).val()));
      canvas.requestRenderAll();
    });
    selector.find("#img-border-radius").bind("change", function () {
      canvas.fire("hexa:history", {
        type: "image",
        text: hexaParams.edited,
      });
    });
    /* Image Border Color */
    selector.find("#img-border-color").bind("change", function () {
      canvas.getActiveObject().set("stroke", $(this).val());
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "image",
        text: hexaParams.edited,
      });
    });
    /* Image Border Width */
    selector
      .find("#hexa-image-settings input[type=number]")
      .on("input paste", function () {
        var val = parseInt($(this).val());
        if ($(this).attr("id") == "img-border-width") {
          canvas.getActiveObject().set("strokeWidth", val);
        }
        canvas.requestRenderAll();
      });
    selector
      .find("#hexa-image-settings input[type=number]")
      .bind("input", function () {
        window.clearTimeout(timeOut);
        timeOut = setTimeout(function () {
          canvas.fire("hexa:history", {
            type: "image",
            text: hexaParams.edited,
          });
        }, 500);
      });
    /* Image Skew, Rotate, Opacity */
    selector
      .find("#hexa-image-settings input[type=range]")
      .bind("input click", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "img-skew-x") {
          canvas.getActiveObject().set("skewX", parseInt(val));
        } else if ($(this).attr("id") == "img-skew-y") {
          canvas.getActiveObject().set("skewY", parseInt(val));
        } else if ($(this).attr("id") == "img-rotate") {
          canvas.getActiveObject().set("angle", parseInt(val));
        } else if ($(this).attr("id") == "img-opacity") {
          canvas.getActiveObject().set("opacity", parseFloat(val));
        }
        canvas.requestRenderAll();
      });
    selector
      .find("#hexa-image-settings input[type=range]")
      .bind("change", function () {
        canvas.fire("hexa:history", {
          type: "image",
          text: hexaParams.edited,
        });
      });
    /* Set Shape Settings */
    function setShapeSettings(shape) {
      selector.find("#shape-outline-width").val(shape.strokeWidth);
      if (shape.gradientFill == "none") {
        selector.find("#hexa-shape-gradient").val("none");
        selector.find("#hexa-shape-color").spectrum("set", shape.fill);
      } else if (shape.gradientFill == "vertical") {
        selector.find("#hexa-shape-gradient").val("vertical");
        if (shape.fill.colorStops.length == 4) {
          selector
            .find("#shape-gradient-color-1")
            .spectrum("set", shape.fill.colorStops[0].color);
          selector
            .find("#shape-gradient-color-2")
            .spectrum("set", shape.fill.colorStops[1].color);
          selector
            .find("#shape-gradient-color-3")
            .spectrum("set", shape.fill.colorStops[2].color);
          selector
            .find("#shape-gradient-color-4")
            .spectrum("set", shape.fill.colorStops[3].color);
        } else if (shape.fill.colorStops.length == 3) {
          selector
            .find("#shape-gradient-color-1")
            .spectrum("set", shape.fill.colorStops[0].color);
          selector
            .find("#shape-gradient-color-2")
            .spectrum("set", shape.fill.colorStops[1].color);
          selector
            .find("#shape-gradient-color-3")
            .spectrum("set", shape.fill.colorStops[2].color);
          selector.find("#shape-gradient-color-4").spectrum("set", "");
        } else if (shape.fill.colorStops.length == 2) {
          selector
            .find("#shape-gradient-color-1")
            .spectrum("set", shape.fill.colorStops[0].color);
          selector
            .find("#shape-gradient-color-2")
            .spectrum("set", shape.fill.colorStops[1].color);
          selector.find("#shape-gradient-color-3").spectrum("set", "");
          selector.find("#shape-gradient-color-4").spectrum("set", "");
        }
      } else if (shape.gradientFill == "horizontal") {
        selector.find("#hexa-shape-gradient").val("horizontal");
        if (shape.fill.colorStops.length == 4) {
          selector
            .find("#shape-gradient-color-1")
            .spectrum("set", shape.fill.colorStops[0].color);
          selector
            .find("#shape-gradient-color-2")
            .spectrum("set", shape.fill.colorStops[1].color);
          selector
            .find("#shape-gradient-color-3")
            .spectrum("set", shape.fill.colorStops[2].color);
          selector
            .find("#shape-gradient-color-4")
            .spectrum("set", shape.fill.colorStops[3].color);
        } else if (shape.fill.colorStops.length == 3) {
          selector
            .find("#shape-gradient-color-1")
            .spectrum("set", shape.fill.colorStops[0].color);
          selector
            .find("#shape-gradient-color-2")
            .spectrum("set", shape.fill.colorStops[1].color);
          selector
            .find("#shape-gradient-color-3")
            .spectrum("set", shape.fill.colorStops[2].color);
          selector.find("#shape-gradient-color-4").spectrum("set", "");
        } else if (shape.fill.colorStops.length == 2) {
          selector
            .find("#shape-gradient-color-1")
            .spectrum("set", shape.fill.colorStops[0].color);
          selector
            .find("#shape-gradient-color-2")
            .spectrum("set", shape.fill.colorStops[1].color);
          selector.find("#shape-gradient-color-3").spectrum("set", "");
          selector.find("#shape-gradient-color-4").spectrum("set", "");
        }
      }
      selector.find("#hexa-shape-gradient").trigger("change");
      selector.find("#shape-outline-color").spectrum("set", shape.stroke);
      if (shape.shadow == null) {
        selector.find("#hexa-shape-shadow").prop("checked", false);
      } else {
        selector.find("#hexa-shape-shadow").prop("checked", true);
        selector
          .find("#shape-shadow-color")
          .spectrum("set", shape.shadow.color);
        selector.find("#shape-shadow-blur").val(shape.shadow.blur);
        selector.find("#shape-shadow-offset-x").val(shape.shadow.offsetX);
        selector.find("#shape-shadow-offset-y").val(shape.shadow.offsetY);
      }
      selector.find("#hexa-shape-shadow").trigger("change");
      selector.find("#shape-opacity").val(shape.opacity);
      selector
        .find("#shape-opacity")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(shape.opacity);
      selector.find("#shape-skew-x").val(shape.skewX);
      selector
        .find("#shape-skew-x")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(shape.skewX);
      selector.find("#shape-skew-y").val(shape.skewX);
      selector
        .find("#shape-skew-y")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(shape.skewY);
      selector.find("#shape-rotate").val(parseInt(shape.angle));
      selector
        .find("#shape-rotate")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(parseInt(shape.angle));
      selector.find("#shape-custom-width").val("");
      selector.find("#shape-custom-height").val("");
    }
    /* Select Shape */
    selector.find("#hexa-shape-select").on("change", function () {
      var val = $(this).val();
      if (val == "none" || val == "custom") {
        selector.find("#hexa-shape-add").prop("disabled", true);
      } else {
        selector.find("#hexa-shape-add").prop("disabled", false);
      }
    });
    /* Add Shape */
    selector.find(".hexa-option").on("click", function () {
      var val = $(this).data("value");
      var shape = "";
      var polygon = "";
      if (val == "circle") {
        shape = new fabric.Circle({
          radius: 50,
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 0,
          objectType: "circle",
          width: 100,
          height: 100,
          gradientFill: "none",
          top: getScaledSize()[1] / 2,
          left: getScaledSize()[0] / 2,
          originX: "center",
          originY: "center",
        });
        shape.controls = {
          ...fabric.Rect.prototype.controls,
          ml: new fabric.Control({
            visible: false,
          }),
          mb: new fabric.Control({
            visible: false,
          }),
          mr: new fabric.Control({
            visible: false,
          }),
          mt: new fabric.Control({
            visible: false,
          }),
        };
      } else if (val == "ellipse") {
        shape = new fabric.Ellipse({
          rx: 75,
          ry: 50,
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 0,
          objectType: "ellipse",
          width: 100,
          height: 100,
          gradientFill: "none",
          top: getScaledSize()[1] / 2,
          left: getScaledSize()[0] / 2,
          originX: "center",
          originY: "center",
        });
      } else if (val == "square") {
        shape = new fabric.Rect({
          radius: 50,
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 0,
          objectType: "square",
          width: 100,
          height: 100,
          gradientFill: "none",
          top: getScaledSize()[1] / 2,
          left: getScaledSize()[0] / 2,
          originX: "center",
          originY: "center",
        });
        shape.controls = {
          ...fabric.Rect.prototype.controls,
          ml: new fabric.Control({
            visible: false,
          }),
          mb: new fabric.Control({
            visible: false,
          }),
          mr: new fabric.Control({
            visible: false,
          }),
          mt: new fabric.Control({
            visible: false,
          }),
        };
      } else if (val == "rectangle") {
        shape = new fabric.Rect({
          radius: 50,
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 0,
          objectType: "rectangle",
          width: 200,
          height: 150,
          gradientFill: "none",
          top: getScaledSize()[1] / 2,
          left: getScaledSize()[0] / 2,
          originX: "center",
          originY: "center",
        });
      } else if (val == "triangle") {
        shape = new fabric.Triangle({
          radius: 50,
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 0,
          objectType: "triangle",
          width: 100,
          height: 100,
          gradientFill: "none",
          top: getScaledSize()[1] / 2,
          left: getScaledSize()[0] / 2,
          originX: "center",
          originY: "center",
        });
      } else if (val == "trapezoid") {
        polygon = [
          {
            x: -100,
            y: -50,
          },
          {
            x: 100,
            y: -50,
          },
          {
            x: 150,
            y: 50,
          },
          {
            x: -150,
            y: 50,
          },
        ];
        shape = new fabric.Polygon(polygon, {
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 0,
          objectType: "trapezoid",
          width: 100,
          height: 100,
          gradientFill: "none",
          top: getScaledSize()[1] / 2,
          left: getScaledSize()[0] / 2,
          originX: "center",
          originY: "center",
        });
      } else if (val == "pentagon") {
        polygon = [
          {
            x: 26,
            y: 86,
          },
          {
            x: 11.2,
            y: 40.4,
          },
          {
            x: 50,
            y: 12.2,
          },
          {
            x: 88.8,
            y: 40.4,
          },
          {
            x: 74,
            y: 86,
          },
        ];
        shape = new fabric.Polygon(polygon, {
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 0,
          objectType: "pentagon",
          width: 100,
          height: 100,
          gradientFill: "none",
          top: getScaledSize()[1] / 2,
          left: getScaledSize()[0] / 2,
          originX: "center",
          originY: "center",
        });
      } else if (val == "octagon") {
        polygon = [
          {
            x: 34.2,
            y: 87.4,
          },
          {
            x: 12.3,
            y: 65.5,
          },
          {
            x: 12.3,
            y: 34.5,
          },
          {
            x: 34.2,
            y: 12.6,
          },
          {
            x: 65.2,
            y: 12.6,
          },
          {
            x: 87.1,
            y: 34.5,
          },
          {
            x: 87.1,
            y: 65.5,
          },
          {
            x: 65.2,
            y: 87.4,
          },
        ];
        shape = new fabric.Polygon(polygon, {
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 0,
          objectType: "octagon",
          width: 100,
          height: 100,
          gradientFill: "none",
          top: getScaledSize()[1] / 2,
          left: getScaledSize()[0] / 2,
          originX: "center",
          originY: "center",
        });
      } else if (val == "emerald") {
        polygon = [
          {
            x: 850,
            y: 75,
          },
          {
            x: 958,
            y: 137.5,
          },
          {
            x: 958,
            y: 262.5,
          },
          {
            x: 850,
            y: 325,
          },
          {
            x: 742,
            y: 262.5,
          },
          {
            x: 742,
            y: 137.5,
          },
        ];
        shape = new fabric.Polygon(polygon, {
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 0,
          objectType: "emerald",
          width: 100,
          height: 100,
          gradientFill: "none",
          top: getScaledSize()[1] / 2,
          left: getScaledSize()[0] / 2,
          originX: "center",
          originY: "center",
        });
      } else if (val == "star") {
        polygon = [
          {
            x: 350,
            y: 75,
          },
          {
            x: 380,
            y: 160,
          },
          {
            x: 470,
            y: 160,
          },
          {
            x: 400,
            y: 215,
          },
          {
            x: 423,
            y: 301,
          },
          {
            x: 350,
            y: 250,
          },
          {
            x: 277,
            y: 301,
          },
          {
            x: 303,
            y: 215,
          },
          {
            x: 231,
            y: 161,
          },
          {
            x: 321,
            y: 161,
          },
        ];
        shape = new fabric.Polygon(polygon, {
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 0,
          objectType: "star",
          width: 100,
          height: 100,
          gradientFill: "none",
          top: getScaledSize()[1] / 2,
          left: getScaledSize()[0] / 2,
          originX: "center",
          originY: "center",
        });
      }
      canvas.add(shape);
      shape.scaleToWidth(getScaledSize()[0] / 6);
      if (shape.isPartiallyOnScreen()) {
        shape.scaleToHeight(getScaledSize()[1] / 6);
      }
      canvas.setActiveObject(shape);
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: val,
        text: hexaParams.added,
      });
    });
    /* Shape Color Fields */
    selector
      .find("#hexa-shape-settings .hexa-colorpicker")
      .bind("change", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "hexa-shape-color") {
          canvas.getActiveObject().set("fill", val);
        } else if ($(this).attr("id") == "shape-outline-color") {
          canvas.getActiveObject().set("stroke", val);
        }
        canvas.requestRenderAll();
        canvas.fire("hexa:history", {
          type: canvas.getActiveObject().objectType,
          text: hexaParams.edited,
        });
      });
    /* Shape Skew, Rotate, Opacity */
    selector
      .find("#hexa-shape-settings input[type=range]")
      .bind("input click", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "shape-skew-x") {
          canvas.getActiveObject().set("skewX", parseInt(val));
        } else if ($(this).attr("id") == "shape-skew-y") {
          canvas.getActiveObject().set("skewY", parseInt(val));
        } else if ($(this).attr("id") == "shape-rotate") {
          canvas.getActiveObject().set("angle", parseInt(val));
        } else if ($(this).attr("id") == "shape-opacity") {
          canvas.getActiveObject().set("opacity", parseFloat(val));
        }
        canvas.requestRenderAll();
      });
    selector
      .find("#hexa-shape-settings input[type=range]")
      .bind("change", function () {
        canvas.fire("hexa:history", {
          type: canvas.getActiveObject().objectType,
          text: hexaParams.edited,
        });
      });
    /* Shape Numeric Fields */
    selector
      .find("#hexa-shape-settings input[type=number]")
      .bind("input paste", function () {
        var val = parseInt($(this).val());
        if ($(this).attr("id") == "shape-outline-width") {
          canvas.getActiveObject().set("strokeWidth", val);
        } else if ($(this).attr("id") == "shape-custom-width") {
          canvas.getActiveObject().set("width", val);
          canvas.getActiveObject().set("scaleX", 1);
        } else if ($(this).attr("id") == "shape-custom-height") {
          canvas.getActiveObject().set("height", val);
          canvas.getActiveObject().set("scaleY", 1);
        }
        canvas.requestRenderAll();
      });
    selector
      .find("#hexa-shape-settings input[type=number]")
      .bind("input", function () {
        window.clearTimeout(timeOut);
        timeOut = setTimeout(function () {
          canvas.fire("hexa:history", {
            type: canvas.getActiveObject().objectType,
            text: hexaParams.edited,
          });
        }, 500);
      });
    /* Shape Aspect Ratio Width Input */
    selector.find("#shape-custom-width").bind("input paste", function () {
      if (selector.find("#hexa-shape-ratio-lock").hasClass("active")) {
        var width = parseInt($(this).val());
        var ratioW = parseInt(selector.find("#hexa-shape-ratio-w").val());
        var ratioH = parseInt(selector.find("#hexa-shape-ratio-h").val());
        var height = (width * ratioH) / ratioW;
        selector.find("#shape-custom-height").val(Math.round(height));
        canvas.getActiveObject().set("height", height);
        canvas.getActiveObject().set("scaleY", 1);
      }
    });
    /* Shape Aspect Ratio Height Input */
    selector.find("#shape-custom-height").bind("input paste", function () {
      if (selector.find("#hexa-shape-ratio-lock").hasClass("active")) {
        var height = $(this).val();
        var ratioW = parseInt(selector.find("#hexa-shape-ratio-w").val());
        var ratioH = parseInt(selector.find("#hexa-shape-ratio-h").val());
        var width = (height * ratioW) / ratioH;
        selector.find("#shape-custom-width").val(Math.round(width));
        canvas.getActiveObject().set("width", width);
        canvas.getActiveObject().set("scaleX", 1);
      }
    });
    /* FRAMES */
    /* Filter frames */
    var filterframes = function (searchTerm) {
      selector
        .find("#hexa-frames-wrap li")
        .hide()
        .filter('[data-keyword*="' + searchTerm + '"]')
        .show();
    };
    /* Search frame Input */
    selector.find("#hexa-frame-search").on("keyup input", function () {
      selector.find("#hexa-noframes").hide();
      var searchTerm = $(this).val().toLowerCase().replace(/\s/g, " ");
      if (searchTerm == "" || searchTerm.length < 1) {
        selector.find("#hexa-frames-wrap li").show();
        selector.find("#hexa-frame-search-icon").html("search");
        selector.find("#hexa-frame-search-icon").removeClass("cancel");
      } else {
        selector.find("#hexa-frame-search-icon").html("clear");
        selector.find("#hexa-frame-search-icon").addClass("cancel");
        filterframes(searchTerm);
        if (selector.find("#hexa-frames-wrap li:visible").length === 0) {
          selector.find("#hexa-noframes").show();
        }
      }
    });
    /* Search frame Icon */
    selector.find("#hexa-frame-search-icon").on("click", function () {
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).html("search");
        selector.find("#hexa-frame-search").val("");
        selector.find("#hexa-frames-wrap li").show();
        selector.find("#hexa-noframes").hide();
      }
    });
    /* Add frame */
    selector
      .find(".hexa-frames-grid")
      .on("click", ".hexa-frame img", function () {
        selector.find("#hexa-canvas-loader").css("display", "flex");
        var frame = $(this).parent().parent();
        var svgUrl = frame.data("elsource");
        selector.find(".hexa-frames-grid .hexa-frame").removeClass("active");
        frame.addClass("active");
        fabric.loadSVGFromURL(
          svgUrl,
          function (objects, options) {
            var svg = fabric.util.groupSVGElements(objects, options);
            var svgWidth = svg.width;
            var svgHeight = svg.height;
            svg.set("originX", "center");
            svg.set("originY", "center");
            svg.set("left", getScaledSize()[0] / 2);
            svg.set("top", getScaledSize()[1] / 2);
            svg.set("scaleX", (getScaledSize()[0] + 2) / svgWidth);
            svg.set("scaleY", (getScaledSize()[1] + 2) / svgHeight);
            svg.set("objectType", "frame");
            canvas.add(svg);
            canvas.setActiveObject(svg);
            canvas.requestRenderAll();
            selector.find("#hexa-canvas-loader").hide();
          },
          function () {},
          {
            crossOrigin: "anonymous",
          }
        );
        canvas.fire("hexa:history", {
          type: "frame",
          text: hexaParams.added,
        });
      });
    /* Frame color */
    selector.find("#hexa-frame-color").bind("change", function () {
      var val = $(this).val();
      var objects = canvas
        .getObjects()
        .filter((element) => element.objectType == "frame");
      $.each(objects, function (index, value) {
        if (value.fill != "") {
          value.set("fill", val);
        }
        if (value._objects) {
          for (var i = 0; i < value._objects.length; i++) {
            if (value._objects[i].fill != "") {
              value._objects[i].set({
                fill: val,
              });
            }
          }
        }
      });
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "frame",
        text: hexaParams.edited,
      });
    });
    /* Rotate Frame */
    function rotateFrame(direction) {
      var objects = canvas
        .getObjects()
        .filter((element) => element.objectType == "frame");
      $.each(objects, function (index, svg) {
        var svgRotate = svg.angle;
        var svgWidth = svg.width;
        var svgHeight = svg.height;
        var width = getScaledSize()[0];
        var height = getScaledSize()[1];
        if (svgRotate == 0 || svgRotate == 180 || svgRotate == -180) {
          width = getScaledSize()[1];
          height = getScaledSize()[0];
        }
        if (direction == "right") {
          if (svgRotate == 0) {
            svgRotate = 90;
          } else if (svgRotate == 90) {
            svgRotate = 180;
          } else if (svgRotate == 180) {
            svgRotate = 270;
          } else if (svgRotate == 270) {
            svgRotate = 0;
          } else if (svgRotate == -90) {
            svgRotate = 0;
          } else if (svgRotate == -180) {
            svgRotate = -90;
          } else if (svgRotate == -270) {
            svgRotate = -180;
          }
        } else if (direction == "left") {
          if (svgRotate == 0) {
            svgRotate = -90;
          } else if (svgRotate == -90) {
            svgRotate = -180;
          } else if (svgRotate == -180) {
            svgRotate = -270;
          } else if (svgRotate == -270) {
            svgRotate = 0;
          } else if (svgRotate == 90) {
            svgRotate = 0;
          } else if (svgRotate == 180) {
            svgRotate = 90;
          } else if (svgRotate == 270) {
            svgRotate = 180;
          }
        }
        svg.set("left", getScaledSize()[0] / 2);
        svg.set("top", getScaledSize()[1] / 2);
        svg.set("scaleX", width / svgWidth);
        svg.set("scaleY", height / svgHeight);
        svg.set("angle", svgRotate);
      });
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "frame",
        text: hexaParams.edited,
      });
    }
    /* Frame Rotate Right */
    selector.find("#hexa-rotate-right-frame").on("click", function () {
      rotateFrame("right");
    });
    /* Frame Rotate Left */
    selector.find("#hexa-rotate-left-frame").on("click", function () {
      rotateFrame("left");
    });
    /* Frame Flip X */
    selector.find("#hexa-flip-horizontal-frame").on("click", function () {
      var objects = canvas
        .getObjects()
        .filter((element) => element.objectType == "frame");
      $.each(objects, function (index, value) {
        value.toggle("flipX");
      });
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "frame",
        text: hexaParams.edited,
      });
    });
    /* Frame Flip Y */
    selector.find("#hexa-flip-vertical-frame").on("click", function () {
      var objects = canvas
        .getObjects()
        .filter((element) => element.objectType == "frame");
      $.each(objects, function (index, value) {
        value.toggle("flipY");
      });
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "frame",
        text: hexaParams.edited,
      });
    });
    /* ELEMENTS */
    /* Filter elements */
    var filterElements = function (searchTerm) {
      selector
        .find("#hexa-elements-wrap li")
        .hide()
        .filter('[data-keyword*="' + searchTerm + '"]')
        .show();
    };
    /* Search Element Input */
    selector.find("#hexa-element-search").on("keyup input", function () {
      selector.find("#hexa-noelements").hide();
      var searchTerm = $(this).val().toLowerCase().replace(/\s/g, " ");
      if (searchTerm == "" || searchTerm.length < 1) {
        selector.find("#hexa-elements-wrap li").show();
        selector.find("#hexa-element-search-icon").html("search");
        selector.find("#hexa-element-search-icon").removeClass("cancel");
      } else {
        selector.find("#hexa-element-search-icon").html("clear");
        selector.find("#hexa-element-search-icon").addClass("cancel");
        filterElements(searchTerm);
        if (selector.find("#hexa-elements-wrap li:visible").length === 0) {
          selector.find("#hexa-noelements").show();
        }
      }
    });
    /* Search Element Icon */
    selector.find("#hexa-element-search-icon").on("click", function () {
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).html("search");
        selector.find("#hexa-element-search").val("");
        selector.find("#hexa-elements-wrap li").show();
        selector.find("#hexa-noelements").hide();
      }
    });
    /* Add Element */
    selector
      .find(".hexa-elements-grid")
      .on("click", ".hexa-element > *:first-child", function () {
        var element = $(this).parent();
        var svgUrl = element.data("elsource");
        if (element.parent().attr("id") == "hexa-icons-grid") {
          var iconStyle = selector.find("#hexa-icon-style").val();
          svgUrl = element.data("elsource") + "/" + iconStyle + "/24px.svg";
          console.log(svgUrl);
        }
        var loader = element.data("loader");
        if (loader == "yes") {
          selector.find("#hexa-canvas-loader").css("display", "flex");
        }
        selector
          .find(".hexa-elements-grid .hexa-element")
          .removeClass("active");
        element.addClass("active");
        fabric.loadSVGFromURL(
          svgUrl,
          function (objects, options) {
            var svg = fabric.util.groupSVGElements(objects, options);
            svg.set("originX", "center");
            svg.set("originY", "center");
            svg.set("left", getScaledSize()[0] / 2);
            svg.set("top", getScaledSize()[1] / 2);
            svg.set("objectType", "element");
            svg.set("gradientFill", "none");
            canvas.add(svg);
            svg.scaleToWidth(getScaledSize()[0] / 8);
            if (svg.isPartiallyOnScreen()) {
              svg.scaleToHeight(getScaledSize()[1] / 8);
            }
            canvas.setActiveObject(svg);
            canvas.requestRenderAll();
            if (loader == "yes") {
              selector.find("#hexa-canvas-loader").hide();
            }
          },
          function () {},
          {
            crossOrigin: "anonymous",
          }
        );
        canvas.fire("hexa:history", {
          type: "element",
          text: hexaParams.added,
        });
      });
    /* Set Element Settings */
    function setElementSettings(obj) {
      if (obj.gradientFill == "none") {
        selector.find("#hexa-element-gradient").val("none");
        selector.find("#hexa-element-color").spectrum("set", obj.fill);
      } else if (obj.gradientFill == "vertical") {
        selector.find("#hexa-element-gradient").val("vertical");
        if (obj.fill.colorStops.length == 4) {
          selector
            .find("#element-gradient-color-1")
            .spectrum("set", obj.fill.colorStops[0].color);
          selector
            .find("#element-gradient-color-2")
            .spectrum("set", obj.fill.colorStops[1].color);
          selector
            .find("#element-gradient-color-3")
            .spectrum("set", obj.fill.colorStops[2].color);
          selector
            .find("#element-gradient-color-4")
            .spectrum("set", obj.fill.colorStops[3].color);
        } else if (obj.fill.colorStops.length == 3) {
          selector
            .find("#element-gradient-color-1")
            .spectrum("set", obj.fill.colorStops[0].color);
          selector
            .find("#element-gradient-color-2")
            .spectrum("set", obj.fill.colorStops[1].color);
          selector
            .find("#element-gradient-color-3")
            .spectrum("set", obj.fill.colorStops[2].color);
          selector.find("#element-gradient-color-4").spectrum("set", "");
        } else if (obj.fill.colorStops.length == 2) {
          selector
            .find("#element-gradient-color-1")
            .spectrum("set", obj.fill.colorStops[0].color);
          selector
            .find("#element-gradient-color-2")
            .spectrum("set", obj.fill.colorStops[1].color);
          selector.find("#element-gradient-color-3").spectrum("set", "");
          selector.find("#element-gradient-color-4").spectrum("set", "");
        }
      } else if (obj.gradientFill == "horizontal") {
        selector.find("#hexa-element-gradient").val("horizontal");
        if (obj.fill.colorStops.length == 4) {
          selector
            .find("#element-gradient-color-1")
            .spectrum("set", obj.fill.colorStops[0].color);
          selector
            .find("#element-gradient-color-2")
            .spectrum("set", obj.fill.colorStops[1].color);
          selector
            .find("#element-gradient-color-3")
            .spectrum("set", obj.fill.colorStops[2].color);
          selector
            .find("#element-gradient-color-4")
            .spectrum("set", obj.fill.colorStops[3].color);
        } else if (obj.fill.colorStops.length == 3) {
          selector
            .find("#element-gradient-color-1")
            .spectrum("set", obj.fill.colorStops[0].color);
          selector
            .find("#element-gradient-color-2")
            .spectrum("set", obj.fill.colorStops[1].color);
          selector
            .find("#element-gradient-color-3")
            .spectrum("set", obj.fill.colorStops[2].color);
          selector.find("#element-gradient-color-4").spectrum("set", "");
        } else if (obj.fill.colorStops.length == 2) {
          selector
            .find("#element-gradient-color-1")
            .spectrum("set", obj.fill.colorStops[0].color);
          selector
            .find("#element-gradient-color-2")
            .spectrum("set", obj.fill.colorStops[1].color);
          selector.find("#element-gradient-color-3").spectrum("set", "");
          selector.find("#element-gradient-color-4").spectrum("set", "");
        }
      }
      selector.find("#hexa-element-gradient").trigger("change");
      selector.find("#element-opacity").val(obj.opacity);
      selector
        .find("#element-opacity")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(obj.opacity);
      selector.find("#element-skew-x").val(obj.skewX);
      selector
        .find("#element-skew-x")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(obj.skewX);
      selector.find("#element-skew-y").val(obj.skewX);
      selector
        .find("#element-skew-y")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(obj.skewY);
      selector.find("#element-rotate").val(parseInt(obj.angle));
      selector
        .find("#element-rotate")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(parseInt(obj.angle));
      if (obj.shadow == null) {
        selector.find("#hexa-element-shadow").prop("checked", false);
      } else {
        selector.find("#hexa-element-shadow").prop("checked", true);
        selector
          .find("#element-shadow-color")
          .spectrum("set", obj.shadow.color);
        selector.find("#element-shadow-blur").val(obj.shadow.blur);
        selector.find("#element-shadow-offset-x").val(obj.shadow.offsetX);
        selector.find("#element-shadow-offset-y").val(obj.shadow.offsetY);
      }
      selector.find("#hexa-element-shadow").trigger("change");
    }
    /* Upload Custom Element */
    selector.find("#hexa-element-upload").on("change", function (e) {
      var reader = new FileReader();
      var svgImg = "";
      reader.onload = function (ev) {
        svgImg = reader.result;
        fabric.loadSVGFromURL(
          svgImg,
          function (objects, options) {
            var svg = fabric.util.groupSVGElements(objects, options);
            svg.set("originX", "center");
            svg.set("originY", "center");
            svg.set("left", getScaledSize()[0] / 2);
            svg.set("top", getScaledSize()[1] / 2);
            svg.set("objectType", "customSVG");
            svg.scaleToWidth(getScaledSize()[0] / 2);
            svg.scaleToHeight(getScaledSize()[1] / 2);
            canvas.add(svg);
            canvas.setActiveObject(svg);
            canvas.requestRenderAll();
          },
          function () {},
          {
            crossOrigin: "anonymous",
          }
        );
      };
      reader.readAsDataURL(this.files[0]);
      canvas.fire("hexa:history", {
        type: "element",
        text: hexaParams.added,
      });
    });
    /* Custom element color */
    selector.find("#hexa-element-color").bind("change", function () {
      var val = $(this).val();
      var obj = canvas.getActiveObject();
      if (obj.fill != "") {
        obj.set("fill", val);
      }
      if (obj._objects) {
        for (var i = 0; i < obj._objects.length; i++) {
          if (obj._objects[i].fill != "") {
            obj._objects[i].set({
              fill: val,
            });
          }
        }
      }
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "element",
        text: hexaParams.edited,
      });
    });
    /* Custom Element Flip X */
    selector.find("#element-flip-horizontal").on("click", function () {
      canvas.getActiveObject().toggle("flipX");
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "element",
        text: hexaParams.edited,
      });
    });
    /* Custom Element Flip Y */
    selector.find("#element-flip-vertical").on("click", function () {
      canvas.getActiveObject().toggle("flipY");
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "element",
        text: hexaParams.edited,
      });
    });
    /* Custom Element Skew, Rotate, Opacity */
    selector
      .find("#hexa-custom-element-options input[type=range]")
      .bind("input click", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "element-skew-x") {
          canvas.getActiveObject().set("skewX", parseInt(val));
        } else if ($(this).attr("id") == "element-skew-y") {
          canvas.getActiveObject().set("skewY", parseInt(val));
        } else if ($(this).attr("id") == "element-rotate") {
          canvas.getActiveObject().set("angle", parseInt(val));
        } else if ($(this).attr("id") == "element-opacity") {
          canvas.getActiveObject().set("opacity", parseFloat(val));
        }
        canvas.requestRenderAll();
      });
    selector
      .find("#hexa-custom-element-options input[type=range]")
      .bind("change", function () {
        canvas.fire("hexa:history", {
          type: "element",
          text: hexaParams.edited,
        });
      });
    /* Set custom SVG Settings */
    function setCustomSVGSettings(obj) {
      selector.find("#customsvg-opacity").val(obj.opacity);
      selector
        .find("#customsvg-opacity")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(obj.opacity);
      selector.find("#customsvg-skew-x").val(obj.skewX);
      selector
        .find("#customsvg-skew-x")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(obj.skewX);
      selector.find("#customsvg-skew-y").val(obj.skewY);
      selector
        .find("#customsvg-skew-y")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(obj.skewY);
      selector.find("#customsvg-rotate").val(parseInt(obj.angle));
      selector
        .find("#customsvg-rotate")
        .parent()
        .parent()
        .find(".slider-label span")
        .html(parseInt(obj.angle));
    }
    /* Custom Element Flip X */
    selector.find("#customsvg-flip-horizontal").on("click", function () {
      canvas.getActiveObject().toggle("flipX");
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "customSVG",
        text: hexaParams.edited,
      });
    });
    /* Custom Element Flip Y */
    selector.find("#customsvg-flip-vertical").on("click", function () {
      canvas.getActiveObject().toggle("flipY");
      canvas.requestRenderAll();
      canvas.fire("hexa:history", {
        type: "customSVG",
        text: hexaParams.edited,
      });
    });
    /* Custom Element Skew, Rotate, Opacity */
    selector
      .find("#hexa-custom-svg-options input[type=range]")
      .bind("input click", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "customsvg-skew-x") {
          canvas.getActiveObject().set("skewX", parseInt(val));
        } else if ($(this).attr("id") == "customsvg-skew-y") {
          canvas.getActiveObject().set("skewY", parseInt(val));
        } else if ($(this).attr("id") == "customsvg-rotate") {
          canvas.getActiveObject().set("angle", parseInt(val));
        } else if ($(this).attr("id") == "customsvg-opacity") {
          canvas.getActiveObject().set("opacity", parseFloat(val));
        }
        canvas.requestRenderAll();
      });
    selector
      .find("#hexa-custom-svg-options input[type=range]")
      .bind("change", function () {
        canvas.fire("hexa:history", {
          type: "customSVG",
          text: hexaParams.edited,
        });
      });
    /* ICON LIBRARY */
    /* Filter icons */
    var filterIcons = function (searchTerm) {
      selector
        .find("#hexa-icons-grid .hexa-element")
        .css("display", "none")
        .filter('[title*="' + searchTerm + '"]')
        .css("display", "flex");
    };
    /* Search Icon Input */
    selector.find("#hexa-icon-search").on("keyup input", function () {
      selector.find("#hexa-noicons").hide();
      var searchTerm = $(this).val().toLowerCase().replace(/\s/g, " ");
      if (searchTerm == "" || searchTerm.length < 1) {
        selector.find("#hexa-icons-grid .hexa-element").css("display", "flex");
        selector.find("#hexa-icon-search-icon").html("search");
        selector.find("#hexa-icon-search-icon").removeClass("cancel");
      } else {
        selector.find("#hexa-icon-search-icon").html("clear");
        selector.find("#hexa-icon-search-icon").addClass("cancel");
        filterIcons(searchTerm);
        if (
          selector.find("#hexa-icons-grid .hexa-element:visible").length === 0
        ) {
          selector.find("#hexa-noicons").show();
        }
      }
    });
    /* Search Icon */
    selector.find("#hexa-icon-search-icon").on("click", function () {
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).html("search");
        selector.find("#hexa-icon-search").val("");
        selector.find("#hexa-icons-grid .hexa-element").css("display", "flex");
        selector.find("#hexa-noicons").hide();
      }
    });
    /* QR CODE */
    selector.find("#hexa-generate-qr-code").on("click", function () {
      var qrcode = kjua({
        text: selector.find("#hexa-qrcode-text").val(),
        render: "svg",
        size: 300,
        fill: selector.find("#hexa-qrcode-fill").val(),
        back: selector.find("#hexa-qrcode-back").val(),
        rounded: selector.find("#hexa-qrcode-rounded").val(),
        mode: "label", // modes: 'plain', 'label' or 'image'
        label: selector.find("#hexa-qrcode-label").val(),
        fontname: "sans",
        fontcolor: selector.find("#hexa-qrcode-label-color").val(),
        mSize: selector.find("#hexa-qrcode-label-size").val(),
        mPosX: selector.find("#hexa-qrcode-label-position-x").val(),
        mPosY: selector.find("#hexa-qrcode-label-position-y").val(),
      });
      var top = getScaledSize()[1] / 2;
      var left = getScaledSize()[0] / 2;
      var print_a = canvas
        .getObjects()
        .filter((element) => element.objectType == "printarea")[0];
      if (print_a) {
        top = print_a.top;
        left = print_a.left;
      }
      var serializer = new XMLSerializer();
      var svgStr = serializer.serializeToString(qrcode);
      fabric.loadSVGFromString(svgStr, function (objects, options) {
        var svg = fabric.util.groupSVGElements(objects, options);
        svg.set("originX", "center");
        svg.set("originY", "center");
        svg.set("left", left);
        svg.set("top", top);
        svg.set("objectType", "qrCode");
        svg.set("gradientFill", "none");
        svg.controls = {
          ...fabric.Rect.prototype.controls,
          ml: new fabric.Control({
            visible: false,
          }),
          mb: new fabric.Control({
            visible: false,
          }),
          mr: new fabric.Control({
            visible: false,
          }),
          mt: new fabric.Control({
            visible: false,
          }),
        };
        canvas.add(svg);
        if (print_a) {
          svg.scaleToWidth(print_a.width * 0.5 * canvas.getZoom());
        } else {
          svg.scaleToWidth(getScaledSize()[0] / 8);
          if (svg.isPartiallyOnScreen()) {
            svg.scaleToHeight(getScaledSize()[1] / 8);
          }
        }
        canvas.setActiveObject(svg);
        canvas.requestRenderAll();
      });
    });
    /* QR CODE Preview */
    function qrcodePreview() {
      var qrcode = kjua({
        text: selector.find("#hexa-qrcode-text").val(),
        render: "svg",
        size: 300,
        fill: selector.find("#hexa-qrcode-fill").val(),
        back: selector.find("#hexa-qrcode-back").val(),
        rounded: selector.find("#hexa-qrcode-rounded").val(),
        mode: "label", // modes: 'plain', 'label' or 'image'
        label: selector.find("#hexa-qrcode-label").val(),
        fontname: "sans",
        fontcolor: selector.find("#hexa-qrcode-label-color").val(),
        mSize: selector.find("#hexa-qrcode-label-size").val(),
        mPosX: selector.find("#hexa-qrcode-label-position-x").val(),
        mPosY: selector.find("#hexa-qrcode-label-position-y").val(),
      });
      return qrcode;
    }
    selector.find("#qrcode-preview").html(qrcodePreview());
    /* Update Preview */
    selector
      .find('#hexa-qrcode-settings input[type="text"]')
      .on("input", function () {
        var qrcode = qrcodePreview();
        selector.find("#qrcode-preview").html(qrcode);
      });
    selector
      .find("#hexa-qrcode-settings .hexa-colorpicker")
      .bind("change", function () {
        var qrcode = qrcodePreview();
        selector.find("#qrcode-preview").html(qrcode);
      });
    selector
      .find("#hexa-qrcode-settings input[type=range]")
      .bind("input click", function () {
        var qrcode = qrcodePreview();
        selector.find("#qrcode-preview").html(qrcode);
      });
    /* BRUSHES */
    /* Draw Cursor */
    function drawCursor(brushSize, brushColor) {
      $("#tm-cursor-1").remove();
      selector.find("#hexa-canvas-wrap").tmpointer({
        id: 1,
        native_cursor: "enable",
        cursorSize: brushSize,
        cursorColor: brushColor,
      });
    }
    // Draw Mode Button
    selector.find("#hexa-draw-btn").on("click", function () {
      if ($(this).hasClass("active")) {
        selector.find("#hexa-draw-undo").prop("disabled", true);
        selector.find("#hexa-draw-undo").removeClass("active");
        $("#tm-cursor-1").remove();
        selector.find("#hexa-draw-settings").hide();
        selector
          .find(
            "#hexa-top-bar, #hexa-right-col, #hexa-icon-menu, #hexa-toggle-left, #hexa-toggle-right"
          )
          .css("pointer-events", "auto");
        $(this).removeClass("active");
        canvas.isDrawingMode = false;
        $(this).html(
          '<span class="material-icons">edit</span>' + hexaParams.startDrawing
        );
      } else {
        selector.find("#hexa-draw-undo").prop("disabled", false);
        selector.find("#hexa-draw-settings").show();
        selector
          .find(
            "#hexa-top-bar, #hexa-right-col, #hexa-icon-menu, #hexa-toggle-left, #hexa-toggle-right"
          )
          .css("pointer-events", "none");
        $(this).addClass("active");
        selector.find("#hexa-brush-select").trigger("change");
        canvas.isDrawingMode = true;
        $(this).html(
          '<span class="material-icons">close</span>' + hexaParams.stopDrawing
        );
      }
    });
    // Brush Type Select
    selector.find("#hexa-brush-select").on("change", function () {
      var val = $(this).val();
      if (val == "erase") {
        $("#hexa-brush-tip").hide();
        $("#hexa-eraser-tip").show();
      } else {
        $("#hexa-brush-tip").show();
        $("#hexa-eraser-tip").hide();
      }
      if (val == "pencil") {
        var pencilBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush = pencilBrush;
      } else if (val == "circle") {
        var circleBrush = new fabric.CircleBrush(canvas);
        canvas.freeDrawingBrush = circleBrush;
      } else if (val == "spray") {
        var sprayBrush = new fabric.SprayBrush(canvas);
        canvas.freeDrawingBrush = sprayBrush;
      } else if (val == "hline") {
        var hlineBrush = new fabric.PatternBrush(canvas);
        canvas.freeDrawingBrush = hlineBrush;
        hlineBrush.getPatternSrc = function () {
          var patternWidth = parseInt(
            selector.find("#brush-pattern-width").val()
          );
          var patternWidth2 = patternWidth / 2;
          var patternCanvas = fabric.document.createElement("canvas");
          patternCanvas.width = patternCanvas.height = patternWidth;
          var ctx = patternCanvas.getContext("2d");
          ctx.strokeStyle = selector.find("#brush-color").val();
          ctx.lineWidth = patternWidth2;
          ctx.beginPath();
          ctx.moveTo(patternWidth2, 0);
          ctx.lineTo(patternWidth2, patternWidth);
          ctx.closePath();
          ctx.stroke();
          return patternCanvas;
        };
      } else if (val == "vline") {
        var vlineBrush = new fabric.PatternBrush(canvas);
        canvas.freeDrawingBrush = vlineBrush;
        vlineBrush.getPatternSrc = function () {
          var patternWidth = parseInt(
            selector.find("#brush-pattern-width").val()
          );
          var patternWidth2 = patternWidth / 2;
          var patternCanvas = fabric.document.createElement("canvas");
          patternCanvas.width = patternCanvas.height = patternWidth;
          var ctx = patternCanvas.getContext("2d");
          ctx.strokeStyle = selector.find("#brush-color").val();
          ctx.lineWidth = patternWidth2;
          ctx.beginPath();
          ctx.moveTo(0, patternWidth2);
          ctx.lineTo(patternWidth, patternWidth2);
          ctx.closePath();
          ctx.stroke();
          return patternCanvas;
        };
      } else if (val == "square") {
        var squareBrush = new fabric.PatternBrush(canvas);
        canvas.freeDrawingBrush = squareBrush;
        squareBrush.getPatternSrc = function () {
          var squareWidth = parseInt(
              selector.find("#brush-pattern-width").val()
            ),
            squareDistance = parseInt(
              selector.find("#brush-pattern-distance").val()
            );
          var patternCanvas = fabric.document.createElement("canvas");
          patternCanvas.width = patternCanvas.height =
            squareWidth + squareDistance;
          var ctx = patternCanvas.getContext("2d");
          ctx.fillStyle = selector.find("#brush-color").val();
          ctx.fillRect(0, 0, squareWidth, squareWidth);
          return patternCanvas;
        };
      } else if (val == "erase") {
        var eraseBrush = new fabric.EraserBrush(canvas);
        canvas.freeDrawingBrush = eraseBrush;
      }
      brush = canvas.freeDrawingBrush;
      if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
      }
      brush.width = parseInt(selector.find("#brush-width").val());
      if (val == "erase") {
        selector.find("#not-erase-brush").hide();
        brush.shadow = null;
        brush.color = "#E91E63";
      } else {
        canvas.freeDrawingBrush.inverted = false;
        selector.find("#hexa-draw-undo").removeClass("active");
        selector.find("#not-erase-brush").show();
        brush.color = selector.find("#brush-color").val();
      }
      if (selector.find("#hexa-brush-shadow").is(":checked")) {
        brush.shadow = brushShadow;
      } else {
        brush.shadow = null;
      }
      drawCursor(brush.width * canvas.getZoom(), brush.color);
      if (val == "hline" || val == "vline" || val == "square") {
        selector.find("#hexa-brush-pattern-width").css("display", "flex");
      } else {
        selector.find("#hexa-brush-pattern-width").css("display", "none");
      }
      if (val == "square") {
        selector.find("#hexa-brush-pattern-distance").css("display", "flex");
      } else {
        selector.find("#hexa-brush-pattern-distance").css("display", "none");
      }
    });
    /* Draw Shadow */
    selector.find("#hexa-brush-shadow").on("change", function () {
      brushShadow = new fabric.Shadow({
        color: selector.find("#brush-shadow-color").val(),
        blur: selector.find("#brush-shadow-width").val(),
        offsetX: selector.find("#brush-shadow-shadow-offset-x").val(),
        offsetY: selector.find("#brush-shadow-shadow-offset-y").val(),
      });
      if ($(this).is(":checked")) {
        brush.shadow = brushShadow;
      } else {
        brush.shadow = null;
      }
    });
    /* Draw Numeric Fields */
    selector
      .find("#hexa-draw-settings input[type=number]")
      .bind("input paste keyup keydown", function () {
        if ($(this).attr("id") == "brush-width") {
          brush.width = parseInt($(this).val());
          drawCursor(brush.width * canvas.getZoom(), brush.color);
        } else if ($(this).attr("id") == "brush-shadow-shadow-offset-x") {
          brushShadow.offsetX = parseInt($(this).val());
        } else if ($(this).attr("id") == "brush-shadow-shadow-offset-y") {
          brushShadow.offsetY = parseInt($(this).val());
        } else if ($(this).attr("id") == "brush-shadow-width") {
          brushShadow.blur = parseInt($(this).val());
        } else if ($(this).attr("id") == "brush-pattern-width") {
          selector.find("#hexa-brush-select").trigger("change");
        } else if ($(this).attr("id") == "brush-pattern-distance") {
          selector.find("#hexa-brush-select").trigger("change");
        }
      });
    /* Draw Color Fields */
    selector
      .find("#hexa-draw-settings .hexa-colorpicker")
      .bind("change", function () {
        if ($(this).attr("id") == "brush-color") {
          brush.color = $(this).val();
          drawCursor(brush.width * canvas.getZoom(), brush.color);
          selector.find("#hexa-brush-select").trigger("change");
        } else if ($(this).attr("id") == "brush-shadow-color") {
          brushShadow.color = $(this).val();
        }
      });
    /* Undo Draw */
    selector.find("#hexa-draw-undo").on("click", function () {
      if (selector.find("#hexa-brush-select").val() == "erase") {
        if (canvas.backgroundImage) {
          if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            canvas.freeDrawingBrush.inverted = false;
          } else {
            $(this).addClass("active");
            canvas.freeDrawingBrush.inverted = true;
          }
        }
      } else {
        var objects = canvas.getObjects();
        var drawings = objects.filter(
          (element) => element.objectType == "drawing"
        );
        var lastElement = drawings.slice(-1)[0];
        canvas.remove(lastElement);
        canvas.requestRenderAll();
      }
    });
    /* KEYBOARD EVENTS */
    document.onkeydown = function (e) {
      var item = canvas.getActiveObject();
      switch (e.keyCode) {
        case 38 /* Up arrow */:
          if (item) {
            item.top -= 1;
            canvas.requestRenderAll();
          }
          break;
        case 40 /* Down arrow  */:
          if (item) {
            item.top += 1;
            canvas.requestRenderAll();
          }
          break;
        case 37 /* Left arrow  */:
          if (item) {
            item.left -= 1;
            canvas.requestRenderAll();
          }
          break;
        case 39 /* Right arrow  */:
          if (item) {
            item.left += 1;
            canvas.requestRenderAll();
          }
          break;
      }
    };
    /* SETTINGS */
    // CSS Theme Select
    selector.find("#custom-theme").on("change", function () {
      var val = $(this).val();
      var link = settings.baseURL + "css/" + val + ".css";
      $("#hexa-theme-link").attr("href", link);
    });
    // Font Size
    selector.find("#custom-font-size").on("input", function () {
      $("html").css("font-size", $(this).val() + "px");
    });
    // Canvas Background
    selector.find("#custom-background").on("change", function () {
      var val = $(this).val();
      if (val != "") {
        selector.find("#hexa-content").css("background-color", val);
      }
    });
    // Image Background
    selector.find("#custom-image-background").on("change", function () {
      var val = $(this).val();
      selector.find("#hexa-canvas-color").spectrum("set", val);
      if (val == "") {
        canvas.backgroundColor = "transparent";
        canvas.requestRenderAll();
      } else {
        canvas.backgroundColor = val;
        canvas.requestRenderAll();
      }
    });
    // Ruler guide color
    selector.find("#ruler-guide-color").on("change", function () {
      var val = $(this).val();
      if (val != "") {
        selector.find(".guide.h, .guide.v").css("border-color", val);
        initAligningGuidelines(canvas);
      }
    });
    // Ruler guide size
    selector.find("#ruler-guide-size").on("input", function () {
      var val = $(this).val();
      selector.find(".guide.h, .guide.v").css("border-width", val + "px");
      initAligningGuidelines(canvas);
    });
    /* Init Aligning Guidelines */
    initAligningGuidelines(canvas);
    /* Resize Events */
    $(window).on("resize", function () {
      adjustZoom();
    });
    selector.find(".two-d").on("click", function () {
      selector.find(".two-d").addClass("active");
      selector.find(".thr-d").removeClass("active");
      selector
        .find(".td-interactive-btn-container-main-contianer")
        .removeClass("interactive-btn-alignment");
      selector.find(".web-thr-d-main-container").removeClass("display-unity");
      selector.find("#hexa-canvas").removeClass("hide-canvas");
      selector.find("#hexa").removeClass("hide-canva");
    });
    selector.find(".thr-d").on("click", function () {
      selector.find(".thr-d").addClass("active");
      selector.find(".two-d").removeClass("active");
      selector
        .find(".td-interactive-btn-container-main-contianer")
        .addClass("interactive-btn-alignment");
      selector.find(".web-thr-d-main-container").addClass("display-unity");
      selector.find("#hexa-canvas").addClass("hide-canvas");
      selector.find("#hexa").addClass("hide-canva");
      canvas.renderAll();
      // updateCanvasState()
      var name = "tester";
      var quality = 1;
      var format = "jpeg";
      var objurl = "";
      var link = document.createElement("a");
      add_watermark();
      canvas.setZoom(1);
      selector.find("#hexa-img-zoom").val(100);
      var zoomWidth = originalHeight;
      var zoomHeight = originalWidth;
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        zoomWidth = originalWidth;
        zoomHeight = originalHeight;
      }
      canvas.setWidth(zoomWidth);
      canvas.setHeight(zoomHeight);
      var blob = "";

      canvas.getObjects().forEach(function (obj) {
        console.log("object:", obj);
        if (obj.customId === "layoutImage") {
          obj.visible = false;
        }
      });
      var imgData = canvas.toDataURL({
        format: format,
        quality: quality,
        enableRetinaScaling: false,
      });
      canvas.getObjects().forEach(function (obj) {
        if (obj.customId === "layoutImage") {
          obj.visible = true;
        }
      });
      console.log(imgData);
      if (format != "webp") {
        imgData = changeDpiDataUrl(
          imgData,
          selector.find("#hexa-download-img-dpi").val()
        );
      }
      blob = dataURLtoBlob(imgData);
      objurl = URL.createObjectURL(blob);
      console.log("object url", objurl);
      if (objurl) {
        var event = new CustomEvent("variableReady", {
          detail: {
            data: objurl,
          },
        });
        document.dispatchEvent(event);
      }
      link.download = name + "." + format;
      link.href = objurl;
      // link.click();
      remove_watermark();
      adjustZoom();
      canvas.requestRenderAll();
    });
    //////////////////////* CUSTOM FUNCTIONS *//////////////////////
    settings.customFunctions.call(this, selector, canvas, lazyLoadInstance);
  };
})(jQuery);
