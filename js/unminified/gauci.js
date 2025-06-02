/*jshint esversion: 9, undef: false, unused: false */
/*
 * Plugin Name: gauci
 * Plugin URI: https://gauci.website/js-version/
 * Version: 1.9.1
 * Description: gauci - Javascript Image Editor
 * Author URI: http://codecanyon.net/user/egemenerd
 * License: http://codecanyon.com/licenses
 * Author: ThemeMasters
 */
(function ($) {
  "use strict";
  $.fn.gauci = function (options) {
    var selector = $(this);
    var windowWidth = document.body.clientWidth;
    const baseUrl = CONFIG.BASE_URL;
    const adminUrl = CONFIG.ADMIN_URL;
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
        watermarkText: "gauci.website",
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
      // db = new Localbase('gauci'),
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
        $("#gauci").find("#gauci-main-loader").fadeOut(200);
      })
      .catch(function (e) {
        console.log(e);
        $("#gauci").find("#gauci-main-loader").hide();
      });
    /* LazyLoad */
    var lazyLoadInstance = new LazyLoad({
      callback_error: (img) => {
        img.setAttribute("src", settings.baseURL + "assets/placeholder.png");
        $(img).parent().css("min-height", "auto");
        $(img).parent().find(".gauci-img-loader").remove();
      },
      callback_loaded: (img) => {
        $(img).parent().css("min-height", "auto");
        $(img).parent().find(".gauci-img-loader").remove();
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
            .find("#gauci-icons .gauci-grid")
            .append(
              '<div class="gauci-element add-element" data-elsource="' +
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
    selector.find(".gauci-select.gauci-select2").select2({
      theme: "dark",
      width: "100%",
      templateSelection: select2format,
      templateResult: select2format,
      allowHtml: true,
    });
    // Spectrum Colorpicker
    selector.find(".gauci-colorpicker.disallow-empty").spectrum({
      allowEmpty: false,
      showInitial: true,
      hideAfterPaletteSelect: true,
    });
    selector.find(".gauci-colorpicker.allow-empty").spectrum({
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
    selector.find("#gauci-canvas-wrap").draggable({
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
          '" class="gauci-pagination"></div>';
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
      selector.find(".gauci-icon-menu-btn").removeClass("active");
      selector.find("#gauci-icon-menu").removeClass("closed");
      selector.find("#gauci-toggle-left").removeClass("closed");
      selector
        .find("#gauci-toggle-left")
        .find(".material-icons")
        .html("chevron_left");
      selector.find("#gauci-icon-panel").show();
    }
    /* Close Panel */
    function closePanel() {
      selector.addClass("panel-closed");
      selector.find(".gauci-icon-menu-btn").removeClass("active");
      selector.find("#gauci-icon-menu").addClass("closed");
      selector.find("#gauci-toggle-left").addClass("closed");
      selector
        .find("#gauci-toggle-left")
        .find(".material-icons")
        .html("chevron_right");
      selector.find("#gauci-icon-panel").hide();
    }
    $(document).ready(function () {
      closePanel();
    });
    /* Left Panel Toggle */
    selector.find("#gauci-toggle-left").on("click", function () {
      if ($(this).hasClass("closed")) {
        openPanel();
      } else {
        closePanel();
      }
    });
    /* Right Panel Toggle */
    selector.find("#gauci-toggle-right").on("click", function () {
      if ($(this).hasClass("closed")) {
        selector.removeClass("layers-closed");
        $(this).removeClass("closed");
        $(this).find(".material-icons").html("chevron_right");
        selector.find("#gauci-right-col").show();
      } else {
        selector.addClass("layers-closed");
        $(this).addClass("closed");
        $(this).find(".material-icons").html("chevron_left");
        selector.find("#gauci-right-col").hide();
      }
    });
    selector.find(".gauci-toggle-right").on("click", function (e) {
      e.preventDefault();
      selector.find("#gauci-toggle-right").trigger("click");
    });
    /* Close panels if needed */
    if (windowWidth <= 1200) {
      selector.find("#gauci-toggle-right").trigger("click");
      selector.find("#gauci-toggle-left").trigger("click");
    }
    /* Icon Button */
    selector.find(".gauci-icon-menu-btn").on("click", function () {
      if ($(this).data("target")) {
        if ($(this).hasClass("active")) {
          closePanel();
        } else {
          openPanel();
          $(this).addClass("active");
          selector.find(".gauci-icon-panel-content").addClass("panel-hide");
          selector.find($(this).data("target")).removeClass("panel-hide");
        }
      }
      if ($(this).attr("id") == "gauci-btn-elements") {
        selector.find("#gauci-all-elements-open").trigger("click");
      }
    });
    /* Dropdown Menu */
    selector.find(".gauci-dropdown-wrap").on("click", function () {
      if ($(this).hasClass("opened")) {
        $(this).removeClass("opened");
        $(this).find(".gauci-dropdown").hide();
      } else {
        $(this).addClass("opened");
        $(this).find(".gauci-dropdown").show();
      }
    });

    selector.find(".gauci-accordion-mask").on("click", function () {
      if ($(this).hasClass("opened")) {
        $(this).removeClass("opened");
      } else {
        $(this).addClass("opened");
      }
    });
    $("#gauci-accordion-maskbutton").on("click", function () {
      var arrowIcon = $(this).find(".arrow");
      arrowIcon.toggleClass("arrow-down arrow-up");
      if (arrowIcon.hasClass("arrow-up")) {
        arrowIcon.text("keyboard_arrow_up");
        $("#gauci-mydiv").addClass("active");
      } else {
        arrowIcon.text("keyboard_arrow_down");
        $("#gauci-mydiv").removeClass("active");
      }
    });
    /* Accordion */
    selector
      .find(".gauci-icon-panel-content ul.gauci-accordion > li > a")
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
    selector.find(".gauci-lock-unlock").on("click", function () {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        $(this).find(".material-icons").html("lock_open");
      } else {
        $(this).addClass("active");
        $(this).find(".material-icons").html("lock");
      }
    });
    /* Rangeslider */
    selector.find(".gauci-slider").on("input", function () {
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
    selector.find(".gauci-tabs-menu li").on("click", function () {
      var target = $(this).data("target");
      var wrapper = $(this).parent().parent();
      wrapper.find("> .gauci-tab").removeClass("active");
      $(target).addClass("active");
      wrapper.find("> .gauci-tabs-menu li").removeClass("active");
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
    selector.find("#gauci-fit-container").on("click", function () {
      adjustZoom();
      fixZoomOut();
      centerCanvas();
    });
    /* Numeric Plus */
    selector.find(".gauci-counter .counter-plus").on("click", function () {
      var input = $(this).parent().find("input.gauci-form-field");
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
      if ($(this).attr("id") == "gauci-img-zoom-in") {
        adjustZoom(val);
      }
    });
    /* Numeric Minus */
    selector.find(".gauci-counter .counter-minus").on("click", function () {
      var input = $(this).parent().find("input.gauci-form-field");
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
      if ($(this).attr("id") == "gauci-img-zoom-out") {
        adjustZoom(val);
      }
    });
    /* Deselect Active Object */
    selector.find(".gauci-wrap").on("click", function (e) {
      var target = e.target["id"];
      if (target != "" && target == "gauci-content") {
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
          var item = selector.find("#gauci-layers #" + val.id);
          item.find("a.delete-layer").trigger("click");
        });
        canvas.discardActiveObject();
      } else {
        var item = selector.find("#gauci-layers #" + target.id);
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
        toastr.warning(gauciParams.noDuplicate, gauciParams.warning);
      } else {
        var item = selector.find("#gauci-layers #" + target.id);
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
    selector.find("#gauci-bg-color").on("change", function () {
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
    c = selector.find("#gauci-canvas")[0];
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
      selector.find(".gauci-file-name").val(fileName);
      selector.find(".gauci-file-name").data("default", fileName);
      selector.find("#gauci-save-img-format").val(fileExtention);
      selector.find("#gauci-save-img-format").trigger("change");
    }
    /* Init */
    function init(getMode) {
      rotate = 0;
      selector.find("#gauci-canvas-loader").css("display", "flex");
      selector
        .find("#gauci-canvas-wrap, .gauci-content-bar")
        .css("visibility", "visible");
      mode = getMode;
      if (canvas.backgroundImage) {
        filters = canvas.backgroundImage.filters;
      }
      // Temp Canvas
      if (mode == "canvas") {
        selector.find("#gauci-canvas-color").trigger("change");
        var newCanvas = document.createElement("canvas");
        var canvas2 = new fabric.Canvas(newCanvas, {
          preserveObjectStacking: true,
        });
        var canvas2Width = parseInt(selector.find("#gauci-canvas-width").val());
        var canvas2Height = parseInt(
          selector.find("#gauci-canvas-height").val()
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
        selector.find("#gauci-canvas-img").attr("src", newurl);
        canvas2.dispose();
      }
      // Canvas Init
      selector.find("#gauci-canvas-img-wrap").imagesLoaded(function () {
        img = selector.find("#gauci-canvas-img")[0];
        imgurl = selector.find("#gauci-canvas-img").attr("src");
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
            '<span class="material-icons">flag</span>' + gauciParams.started
          );
        }, 100);
        selector.find("#gauci-canvas-loader").hide();
      });
    }
    // Open the editor with a default image if exists
    if (selector.find("#gauci-canvas-img").attr("src") != "") {
      mode = "image";
      var fileName = selector.find("#gauci-canvas-img").data("filename");
      var fileExtention = selector
        .find("#gauci-canvas-img")
        .attr("src")
        .match(/\.[0-9a-z]+$/i)[0]
        .replace(/\./g, "");
      setFileName(fileName, fileExtention);
      init(mode);
    }
    modeCheck();
    // Open the editor with a default template if exists
    if (selector.find("#gauci-canvas-img").data("template") != "") {
      var fileName = selector.find("#gauci-canvas-img").data("filename");
      selector.find("#gauci-canvas-loader").css("display", "flex");
      selector
        .find("#gauci-canvas-wrap, .gauci-content-bar")
        .css("visibility", "visible");
      selector.find(".gauci-modal").hide();
      var objects = canvas.getObjects();
      objects
        .filter((element) => element.objectType != "BG")
        .forEach((element) => canvas.remove(element));
      selector.find("#gauci-layers li").remove();
      checkLayers();
      $.getJSON(
        selector.find("#gauci-canvas-img").data("template"),
        function (json) {
          loadJSON(json);
          setTimeout(function () {
            addToHistory(
              '<span class="material-icons">flag</span>' + gauciParams.started
            );
            setFileName(fileName, "");
          }, 100);
        }
      )
        .fail(function (jqxhr, textStatus, error) {
          toastr.error("Request Failed: " + error, gauciParams.error);
        })
        .always(function () {
          selector.find("#gauci-canvas-loader").hide();
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
        selector.find("#gauci-adjust .conditional-settings").addClass("d-none");
        selector.find("#gauci-brightness").prop("checked", false);
        selector.find("#brightness").val(0);
        selector.find("#gauci-contrast").prop("checked", false);
        selector.find("#contrast").val(0);
        selector.find("#gauci-saturation").prop("checked", false);
        selector.find("#saturation").val(0);
        selector.find("#gauci-hue").prop("checked", false);
        selector.find("#hue").val(0);
        selector
          .find("#gauci-filters input[type=checkbox]")
          .prop("checked", false);
        selector.find("#gauci-gamma").prop("checked", false);
        selector.find("#gamma-red").val(1);
        selector.find("#gamma-green").val(1);
        selector.find("#gamma-blue").val(1);
        selector.find("#gauci-blend-color").prop("checked", false);
        selector.find("#blend-color-mode").val("add");
        selector.find("#blend-color-color").spectrum("set", "#ffffff");
        selector.find("#blend-color-alpha").val(0.5);
        selector
          .find("#blend-color-alpha")
          .parent()
          .parent()
          .find(".slider-label span")
          .html(0.5);
        selector.find("#gauci-duotone-color").prop("checked", false);
        selector.find("#duotone-light-color").spectrum("set", "green");
        selector.find("#duotone-dark-color").spectrum("set", "blue");
        selector.find("#gauci-swap-colors").prop("checked", false);
        selector.find("#gauci-blur").prop("checked", false);
        selector.find("#blur").val(0);
        selector.find("#gauci-noise").prop("checked", false);
        selector.find("#noise").val(0);
        selector.find("#gauci-pixelate").prop("checked", false);
        selector.find("#pixelate").val(1);
        var objects = canvas.getObjects();
        objects
          .filter((element) => element.objectType != "BG")
          .forEach((element) => canvas.remove(element));
        selector.find("#gauci-layers li").remove();
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
      selector.find("#gauci-brightness").prop("checked", false);
      selector.find("#gauci-contrast").prop("checked", false);
      selector.find("#gauci-saturation").prop("checked", false);
      selector.find("#gauci-hue").prop("checked", false);
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
      selector.find("#gauci-gamma").prop("checked", false);
      selector.find("#gauci-blend-color").prop("checked", false);
      selector.find("#gauci-duotone-color").prop("checked", false);
      selector.find("#gauci-blur").prop("checked", false);
      selector.find("#gauci-noise").prop("checked", false);
      selector.find("#gauci-pixelate").prop("checked", false);
      // Get Values
      if (filters.length !== 0) {
        $.each(filters, function (index, val) {
          if (val.type == "Brightness") {
            selector.find("#gauci-brightness").prop("checked", true);
            selector.find("#brightness").val(val.brightness);
            selector
              .find("#brightness")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.brightness);
          } else if (val.type == "Contrast") {
            selector.find("#gauci-contrast").prop("checked", true);
            selector.find("#contrast").val(val.brightness);
            selector
              .find("#contrast")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.contrast);
          } else if (val.type == "Saturation") {
            selector.find("#gauci-saturation").prop("checked", true);
            selector.find("#saturation").val(val.brightness);
            selector
              .find("#saturation")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.saturation);
          } else if (val.type == "HueRotation") {
            selector.find("#gauci-hue").prop("checked", true);
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
            selector.find("#gauci-gamma").prop("checked", true);
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
            selector.find("#gauci-blend-color").prop("checked", true);
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
            selector.find("#gauci-duotone-color").prop("checked", true);
            selector.find("#duotone-light-color").val(val.subFilters[1].color);
            selector.find("#duotone-dark-color").val(val.subFilters[2].color);
          } else if (val.type == "Blur") {
            selector.find("#gauci-blur").prop("checked", true);
            selector.find("#blur").val(val.blur);
            selector
              .find("#blur")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.blur);
          } else if (val.type == "Noise") {
            selector.find("#gauci-noise").prop("checked", true);
            selector.find("#noise").val(val.noise);
            selector
              .find("#noise")
              .parent()
              .parent()
              .find(".slider-label span")
              .html(val.noise);
          } else if (val.type == "Pixelate") {
            selector.find("#gauci-pixelate").prop("checked", true);
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
      selector.find("#gauci-brightness").trigger("change");
      selector.find("#gauci-contrast").trigger("change");
      selector.find("#gauci-saturation").trigger("change");
      selector.find("#gauci-hue").trigger("change");
      selector.find("#gauci-gamma").trigger("change");
      selector.find("#gauci-blend-color").trigger("change");
      selector.find("#gauci-blur").trigger("change");
      selector.find("#gauci-noise").trigger("change");
      selector.find("#gauci-pixelate").trigger("change");
    }
    /* Adjust Mode */
    function modeCheck() {
      if (mode == "none") {
        selector
          .find("#gauci-icon-menu, #gauci-icon-panel, #gauci-ruler-icon")
          .css("pointer-events", "none");
        selector.find(".gauci-keep, #modal-add-new .gauci-modal-close").hide();
        selector.find("#modal-add-new").show();
        selector.find("#gauci-save").prop("disabled", true);
      } else {
        selector
          .find("#gauci-canvas-wrap, .gauci-content-bar")
          .css("visibility", "visible");
        selector
          .find("#gauci-icon-menu, #gauci-icon-panel, #gauci-ruler-icon")
          .css("pointer-events", "auto");
        selector.find(".gauci-keep, #modal-add-new .gauci-modal-close").show();
        selector.find("#modal-add-new").hide();
        selector.find("#gauci-save").prop("disabled", false);
      }
      if (mode == "canvas") {
        selector.find(".hide-on-canvas-mode").hide();
      } else {
        selector.find(".hide-on-canvas-mode").show();
      }
    }
    /* MODAL */
    // /* Modal Open */
    // selector.find(".gauci-modal-open").on("click", function (e) {
    //   e.preventDefault();
    //   var target = $(this).data("target");
    //   selector.find(".gauci-modal").hide();
    //   selector.find(target).show();
    // });

    /* Modal Open */
    selector.find(".gauci-modal-open").on("click", function (e) {
      e.preventDefault();

      var clickedElement = $(this); // Store reference to the clicked element

      // First, check if the user is logged in and email is verified
      $.ajax({
        url: `${baseUrl}/api/v1/protected-route`,
        type: "GET",
        xhrFields: {
          withCredentials: true, // Include credentials for backend token validation
        },
        error: function (xhr, status, error) {
          // If the API call fails, it means the user is not logged in
          //   toastr.error("Please log in to proceed.", "Login Required");
          Swal.fire({
            title: "Login Required",
            text: "Please log in to proceed.",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "OK",
            allowOutsideClick: true,
            allowEscapeKey: true,
          });

          console.log("User is not logged in.");
          return;
        },
        success: function (response) {
          // If the user is not logged in
          if (!response.role) {
            // toastr.error("Please log in to proceed.", "Login Required");
            Swal.fire({
              title: "Login Required",
              text: "Please log in to proceed.",
              icon: "warning",
              showConfirmButton: true,
              confirmButtonText: "OK",
              allowOutsideClick: true,
              allowEscapeKey: true,
            });
            console.log("User is not logged in.");
            return;
          }

          // If the user's email is not verified
          if (!response.isVerified) {
            // toastr.error(
            //   "Please verify your email to proceed.",
            //   "Email Verification Required"
            // );
            Swal.fire({
              title: "Email Verification Required",
              text: "Please verify your email to proceed.",
              icon: "warning",
              showConfirmButton: true,
              confirmButtonText: "OK",
              allowOutsideClick: true,
              allowEscapeKey: true,
            });
            console.log("Email is not verified.");
            return;
          }

          // If the user is logged in and email is verified, proceed to open the modal
          console.log("User is logged in and email is verified.");

          var target = clickedElement.data("target"); // Use the stored clicked element reference
          selector.find(".gauci-modal").hide(); // Hide any open modals
          selector.find(target).show(); // Show the target modal
        },
      });
    });

    /* Modal Close */
    selector.find(".gauci-modal-close").on("click", function (e) {
      e.preventDefault();
      var target = $(this).data("target");
      selector.find(target).hide();
    });
    /* Upload Image */
    selector.find("#gauci-image-upload").on("change", function () {
      selector.find(".gauci-modal").hide();
      selector
        .find("#gauci-canvas-wrap, .gauci-content-bar")
        .css("visibility", "visible");
      var reader = new FileReader();
      reader.onload = function (ev) {
        selector.find("#gauci-canvas-img").attr("src", reader.result);
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
    selector.find("#gauci-canvas-create").on("click", function () {
      setFileName(new Date().getTime(), "");
      init("canvas");
    });
    /* TEMPLATE LIBRARY */
    /* Template Search */
    selector.find("#gauci-template-search").on("click", function () {
      var category = selector.find("#gauci-templates-menu").val();
      var input = $(this).parent().find("input");
      selector.find("#gauci-all-templates-noimg").addClass("d-none");
      selector.find("#gauci-templates-grid .grid-item").each(function () {
        $(this).attr("data-keyword", $(this).data("keyword").toLowerCase());
      });
      if ($(this).hasClass("cancel")) {
        selector.find("#gauci-templates-menu").val("all").change();
        selector
          .find("#gauci-templates-menu")
          .parent()
          .find("span.select2-container")
          .css("opacity", 1);
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#gauci-templates-grid .grid-item").show();
        if (selector.find("#gauci-templates-grid-pagination").length) {
          selector
            .find("#gauci-templates-grid-pagination")
            .pagination("redraw");
          selector
            .find("#gauci-templates-grid-pagination")
            .pagination("selectPage", 1);
        }
        input.prop("disabled", false);
        selector.find("#gauci-templates-menu").prop("disabled", false);
      } else {
        selector
          .find("#gauci-templates-menu")
          .parent()
          .find("span.select2-container")
          .css("opacity", 0.5);
        $(this).addClass("cancel");
        $(this).find(".material-icons").html("close");
        $(this).removeClass("primary");
        $(this).addClass("danger");
        var searchTerm = input.val().toLowerCase().replace(/\s/g, " ");
        if ((searchTerm == "" || searchTerm.length < 1) && category == "all") {
          selector.find("#gauci-templates-grid .grid-item").show();
          if (selector.find("#gauci-templates-grid-pagination").length) {
            selector
              .find("#gauci-templates-grid-pagination")
              .pagination("redraw");
            selector
              .find("#gauci-templates-grid-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#gauci-templates-grid-pagination").length) {
            selector
              .find("#gauci-templates-grid-pagination")
              .pagination("destroy");
          }
          if (category == "all") {
            if (searchTerm != "" || searchTerm.length > 1) {
              selector
                .find("#gauci-templates-grid .grid-item")
                .hide()
                .filter('[data-keyword*="' + searchTerm + '"]')
                .show();
            }
          } else {
            if (searchTerm != "" || searchTerm.length > 1) {
              selector
                .find("#gauci-templates-grid .grid-item")
                .hide()
                .filter('[data-keyword*="' + searchTerm + '"]')
                .filter('[data-category*="' + category + '"]')
                .show();
            } else {
              selector
                .find("#gauci-templates-grid .grid-item")
                .hide()
                .filter('[data-category*="' + category + '"]')
                .show();
            }
          }
          if (
            selector.find("#gauci-templates-grid .grid-item:visible").length ===
            0
          ) {
            selector.find("#gauci-all-templates-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
        selector.find("#gauci-templates-menu").prop("disabled", true);
      }
    });
    // Show Public/Private modal before saving template
    function showPublicPrivateModal() {
      return new Promise((resolve, reject) => {
        // Show the modal
        $("#templates-public-private-modal").show();

        // Handle public button click
        $("#saveAsPublic").on("click", function () {
          resolve(true); // Return 'true' for public
          // Close the modal after saving
          selector.find(".gauci-modal").hide();
          $("#templates-public-private-modal").hide();

          // Show SweetAlert for saving progress
          Swal.fire({
            title: "Please wait",
            text: "Your template is being saved...",
            icon: "info",
            allowOutsideClick: true,
            showCloseButton: true,
            confirmButtonText: "OK",
            allowEscapeKey: true,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
        });

        // Handle private button click
        $("#saveAsPrivate").on("click", function () {
          resolve(false); // Return 'false' for private
          // Close the modal after saving
          selector.find(".gauci-modal").hide();
          $("#templates-public-private-modal").hide();

          Swal.fire({
            title: "Please wait",
            text: "Your template is being saved...",
            icon: "info",
            allowOutsideClick: true,
            showCloseButton: true,
            confirmButtonText: "OK",
            allowEscapeKey: true,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
        });
      });
    }

    // selector.find("#gauci-json-save").on("click", function () {
    //   // Show public/private modal before proceeding
    //   showPublicPrivateModal().then((isPublic) => {
    //     // Proceed with saving the template based on user's choice

    //     // Convert the canvas to a JSON object, including specific properties
    //     var json = canvas.toJSON([
    //       "objectType",
    //       "gradientFill",
    //       "roundedCorners",
    //       "mode",
    //       "selectable",
    //       "lockMovementX",
    //       "lockMovementY",
    //       "lockRotation",
    //       "crossOrigin",
    //       "layerName",
    //       "customId",
    //     ]);

    //     var objects = canvas.getObjects();
    //     var filteredObjects = objects.filter(function (obj) {
    //       return obj.customId !== "layoutImage"; // Filter out layoutImage
    //     });

    //     // Temporarily hide objects that are not filtered
    //     canvas.getObjects().forEach(function (obj) {
    //       if (!filteredObjects.includes(obj)) {
    //         obj.visible = false;
    //       }
    //     });

    //     // Generate image URL with only visible (filtered) objects
    //     var canvasImageUrl = canvas.toDataURL({
    //       format: "png",
    //       multiplier: 2,
    //     });

    //     // Restore visibility of all objects
    //     canvas.getObjects().forEach(function (obj) {
    //       obj.visible = true;
    //     });

    //     convertToDataURL(json.backgroundImage.src, function (dataUrl) {
    //       json.backgroundImage.src = dataUrl; // Update the background image source in the JSON

    //       var template = JSON.stringify(json);
    //       console.log(json);

    //       var blob = new Blob([template], { type: "application/json" });

    //       var timestamp = new Date().getTime();
    //       var uniqueFileName = "template_" + timestamp + ".json";
    //       var formData = new FormData();
    //       formData.append("files", blob, uniqueFileName);

    //       var imageBlob = dataURLtoBlob(canvasImageUrl); // Convert the data URL to a Blob
    //       var imageFileName = "template_image_" + timestamp + ".png";
    //       formData.append("files", imageBlob, imageFileName);
    //       console.log(formData);
    //       $.ajax({
    //         url: `${baseUrl}/api/v1/user/media/upload`,
    //         type: "POST",
    //         data: formData,
    //         processData: false,
    //         contentType: false,
    //         success: function (response) {
    //           var imageUrl = "";
    //           var jsonUrl = "";
    //           response.urls.forEach(function (url) {
    //             console.log(url);
    //             if (url.endsWith(".json")) {
    //               jsonUrl = url;
    //             } else if (
    //               url.endsWith(".png") ||
    //               url.endsWith(".jpeg") ||
    //               url.endsWith(".jpg")
    //             ) {
    //               imageUrl = url;
    //             }
    //           });
    //           const urlParams = new URLSearchParams(window.location.search);
    //           const modelName = urlParams.get("name");

    //           var key = Math.random().toString(36).substr(2, 9);
    //           var name = selector.find("#gauci-json-save-name").val();

    //           var data = {
    //             key: key,
    //             src: jsonUrl,
    //             imageUrl: imageUrl,
    //             name: name,
    //             type: modelName,
    //             isPublic: isPublic, // Add public/private selection to data
    //           };

    //           //   let isSaving = true;
    //           //   if (isSaving) {
    //           //     toastr.info("Please wait, the template is being saved", "Saving...");
    //           //   }
    //           // Upload the data object to the new API
    //           uploadData(data)
    //             .then(() => {
    //               // isSaving = false;
    //               // Display a success message using toastr after successful upload
    //               //   toastr.success("Data uploaded successfully!", "Success");
    //               Swal.fire({
    //                 title: "Success",
    //                 text: "Data uploaded successfully!",
    //                 icon: "success",
    //               });
    //               Swal.close();
    //               // Close the modal after saving
    //               selector.find(".gauci-modal").hide();
    //             })
    //             .catch((error) => {
    //               // Display an error message using toastr if uploading fails
    //               toastr.error(error.message, "Error");
    //               const message =
    //                 error.message ||
    //                 "Something went wrong uploading, try again!";
    //               Swal.fire({
    //                 icon: "error",
    //                 title: "failed",
    //                 text: message,
    //               });
    //             });
    //         },
    //         error: function (xhr, status, error) {
    //           // Display an error message using toastr if the API call fails
    //           //   toastr.error(error, "Error");
    //           const message =
    //             error.message ||
    //             error ||
    //             "Something went wrong uploading, try again!";
    //           Swal.fire({
    //             icon: "error",
    //             title: "failed",
    //             text: message,
    //           });
    //         },
    //       });
    //     });
    //   });
    // });

    selector.find("#gauci-json-save").on("click", function () {
      saveCanvasState(activeTabId);
      console.log(mainPart);

      showPublicPrivateModal().then(async (isPublic) => {
        // const output = Object.keys(tabCanvasStates).map((key) => ({
        //   part: key,
        //   jsonData: JSON.parse(tabCanvasStates[key]),
        // }));
        // let output = Object.keys(tabCanvasStates).map((key) => {
        //   const jsonData = JSON.parse(tabCanvasStates[key]);

        //   // Safely update objects inside jsonData
        //   jsonData.objects = jsonData.objects.map((obj) => {
        //     if (obj.type === "image" && obj.clipPath) {
        //       return {
        //         ...obj,
        //         customId: "clipmask",
        //       };
        //     }
        //     return obj;
        //   });

        //   return {
        //     part: key,
        //     jsonData: jsonData,
        //   };
        // });
        let output = Object.keys(tabCanvasStates).map((key) => {
          const jsonData = JSON.parse(tabCanvasStates[key]);

          // Safely update objects inside jsonData
          jsonData.objects = jsonData.objects.map((obj) => {
            let updatedObj = { ...obj };

            // If obj.type is "image" and it has a clipPath, set customId
            if (obj.type === "image" && obj.clipPath) {
              updatedObj.customId = "clipmask";
            }

            // If crossOrigin exists (even if null), set it to "anonymous"
            if ("crossOrigin" in obj) {
              updatedObj.crossOrigin = "anonymous";
            }

            return updatedObj;
          });

          return {
            part: key,
            jsonData: jsonData,
          };
        });

        console.log(output);

        let selectedItem =
          output.find((item) => item.part === mainPart) || output[0]; // fallback if mainPart not found
        console.log(selectedItem);

        // 🎨 Step 2: Convert selected jsonData to image blob
        let imageUrl = "";
        const tempCanvas = new fabric.Canvas(null, {
          width: 2048,
          height: 2048,
        });

        tempCanvas.loadFromJSON(selectedItem.jsonData, async () => {
          const objects = tempCanvas.getObjects();
          const firstObject = objects[0];

          // // Remove the first object from the canvas
          if (
            firstObject &&
            firstObject.type === "image" &&
            firstObject.getSrc &&
            firstObject.getSrc().startsWith("http") &&
            !firstObject.clipPath
          ) {
            tempCanvas.remove(firstObject);
          }

          // const corsImages = [];
          // console.log(objects);
          // // Hide external images to avoid CORS issues
          // objects.forEach((obj) => {
          //   if (obj.type === "image" && obj.src && obj.src.startsWith("http")) {
          //     corsImages.push(obj);
          //     obj.visible = false;
          //   }
          // });

          tempCanvas.renderAll();

          try {
            const base64Image = tempCanvas.toDataURL({
              format: "jpeg",
              quality: 1.0,
            });
            console.log(base64Image);
            const blob = dataURLtoBlob(base64Image);
            const formData = new FormData();
            const timestamp = new Date().getTime();
            const imageFileName = `preview_${timestamp}.jpg`;
            formData.append("files", blob, imageFileName);

            const response = await $.ajax({
              url: `${baseUrl}/api/v1/user/media/upload`,
              type: "POST",
              data: formData,
              processData: false,
              contentType: false,
            });

            const previewUrl = response.urls.find(
              (url) =>
                url.endsWith(".png") ||
                url.endsWith(".jpg") ||
                url.endsWith(".jpeg")
            );

            if (previewUrl) {
              imageUrl = previewUrl;
            }
          } catch (err) {
            console.error("Error uploading preview image:", err);
          }

          // 🔁 Step 3: Cleanup
          // corsImages.forEach((obj) => (obj.visible = true));
          tempCanvas.insertAt(firstObject, 0);

          // Render the canvas to show all objects again
          tempCanvas.renderAll();
          tempCanvas.clear();
          tempCanvas.dispose();

          const updatedJsonArray = [];

          for (const item of output) {
            const objects = item.jsonData.objects || [];

            for (const obj of objects) {
              if (
                obj.type === "image" &&
                obj.src &&
                obj.src.startsWith("data:image")
              ) {
                const imageBlob = dataURLtoBlob(obj.src);
                const timestamp = new Date().getTime();
                const imageFileName = `image_${timestamp}_${Math.random()
                  .toString(36)
                  .substr(2, 5)}.png`;

                const formData = new FormData();
                formData.append("files", imageBlob, imageFileName);

                try {
                  const response = await $.ajax({
                    url: `${baseUrl}/api/v1/user/media/upload`,
                    type: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                  });

                  const uploadedUrl = response.urls.find(
                    (url) =>
                      url.endsWith(".png") ||
                      url.endsWith(".jpg") ||
                      url.endsWith(".jpeg")
                  );

                  if (uploadedUrl) {
                    obj.src = uploadedUrl;
                  }
                } catch (error) {
                  console.error("Error uploading image blob:", error);
                  Swal.fire({
                    icon: "error",
                    title: "Upload Failed",
                    text: "One or more images could not be uploaded.",
                  });
                  return;
                }
              }
            }

            updatedJsonArray.push({
              part: item.part,
              jsonData: item.jsonData,
            });
          }

          const originalFormat = {};
          updatedJsonArray.forEach((item) => {
            originalFormat[item.part] = JSON.stringify(item.jsonData);
          });
          console.log(originalFormat);

          // 🔍 Step 1: Get specific object for image preview generation

          // 📤 Step 4: Prepare data and call final upload API
          const key = Math.random().toString(36).substr(2, 9);
          const name = selector.find("#gauci-json-save-name").val();
          const urlParams = new URLSearchParams(window.location.search);
          const modelName = urlParams.get("name");
          const modelId = urlParams.get("id");
          const data = {
            key: key,
            src: originalFormat,
            imageUrl: imageUrl, // ✅ set preview image URL
            name: name,
            type: modelName,
            modelId: modelId,
            isPublic: isPublic,
          };

          // uploadData(data)
          //   .then(() => {
          //     Swal.fire({
          //       title: "Success",
          //       text: "Template uploaded successfully!",
          //       icon: "success",
          //     });
          //     Swal.close();
          //     selector.find(".gauci-modal").hide();
          //   })
          //   .catch((error) => {
          //     const message =
          //       error.message || "Something went wrong during upload.";
          //     toastr.error(message, "Error");
          //     Swal.fire({
          //       icon: "error",
          //       title: "Upload Failed",
          //       text: message,
          //     });
          //   });
          uploadData(data)
            .then(() => {
              Swal.fire({
                title: "Success",
                text: "Template uploaded successfully!",
                icon: "success",
                confirmButtonText: "OK", // <-- this sets the button text
              }).then(() => {
                // After user clicks OK, close modal
                selector.find(".gauci-modal").hide();
              });
            })
            .catch((error) => {
              const message =
                error.message || "Something went wrong during upload.";
              toastr.error(message, "Error");
              Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text: message,
              });
            });
        });
      });
    });

    function uploadData(data) {
      console.log(data);
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `${baseUrl}/api/v1/user/file-data/upload`,
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

    $(document).on("click", "#gauci-new", function () {
      fetchAndDisplayTemplates();
    });

    function deleteTemplate(key) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `${baseUrl}/api/v1/user/delete/${key}`,
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

    // function fetchAndDisplayTemplates() {
    //   const url = window.location.href;
    //   const urlParams = new URLSearchParams(window.location.search);
    //   const modelName = urlParams.get("name");

    //   // Fetch the user email first
    //   getUserEmail()
    //     .then((userEmail) => {
    //       // After getting the user email, fetch all saved templates
    //       return getAllSavedData(userEmail);
    //     })
    //     .then((assets) => {
    //       console.log("all the templates in library:", assets);
    //       const templatesContainer = $("#gauci-my-templates");
    //       templatesContainer.empty(); // Clear existing content

    //       // Filter templates for the specific model type
    //       const filteredAssets = assets.filter(
    //         (asset) => asset.type === modelName
    //       );
    //       if (filteredAssets.length === 0) {
    //         // If no templates found for the model type, show a message
    //         templatesContainer.html(
    //           `<div class="notice notice-info">No templates found for model: ${modelName}.</div>`
    //         );
    //       }
    //       if (assets.length === 0) {
    //         templatesContainer.html(
    //           '<div class="notice notice-info">No templates found.</div>'
    //         );
    //       } else {
    //         assets.forEach((asset) => {
    //           if (asset.type === modelName) {
    //             const jsonblob = new Blob([asset.src], { type: "text/plain" });
    //             const jsonurl = URL.createObjectURL(jsonblob);

    //             const listItem = $("<li>").attr("data-keyword", asset.name);

    //             listItem.html(`
    //                     <div>${asset.name}</div>
    //                     <div>
    //                         <button type="button" class="gauci-btn primary gauci-select-template" data-json='${JSON.stringify(
    //                           asset.src
    //                         )}">
    //                             <span class="material-icons">check</span>Select
    //                         </button>
    //                         <button type="button" class="gauci-btn danger gauci-template-delete" data-target="${
    //                           asset.key
    //                         }">
    //                             <span class="material-icons">clear</span>Delete
    //                         </button>
    //                     </div>
    //                 `);

    //             templatesContainer.append(listItem);
    //           }
    //         });
    //       }
    //     })
    //     .catch((error) => {
    //       // toastr.error(error.message, "Error retrieving assets");
    //       console.log(error.message, "Error retrieving assets");
    //     });
    // }
    function fetchAndDisplayTemplates() {
      const urlParams = new URLSearchParams(window.location.search);
      const modelName = urlParams.get("name");

      // Initialize global store if not exists
      if (!window.assetSrcStore) {
        window.assetSrcStore = {};
      }

      // Fetch the user email first
      getUserEmail()
        .then((userEmail) => {
          // After getting the user email, fetch all saved templates
          return getAllSavedData(userEmail);
        })
        .then((assets) => {
          console.log("All templates in library:", assets);
          const templatesContainer = $("#gauci-my-templates");
          templatesContainer.empty(); // Clear existing content

          const filteredAssets = assets.filter(
            (asset) => asset.type === modelName
          );

          if (filteredAssets.length === 0) {
            templatesContainer.html(
              `<div class="notice notice-info">No templates found for model: ${modelName}.</div>`
            );
            return;
          }

          filteredAssets.forEach((asset) => {
            const uniqueId = `template-${asset.key}`;

            // Store the src in memory
            window.assetSrcStore[uniqueId] = asset.src;

            const listItem = $("<li>").attr("data-keyword", asset.name);

            listItem.html(`
          <div>${asset.name}</div>
          <div>
            <button 
              type="button" 
              class="gauci-btn primary gauci-select-template" 
              data-id="${uniqueId}">
              <span class="material-icons">check</span>Select
            </button>
            <button 
              type="button" 
              class="gauci-btn danger gauci-template-delete" 
              data-target="${asset.key}">
              <span class="material-icons">clear</span>Delete
            </button>
          </div>
        `);

            templatesContainer.append(listItem);
          });
        })
        .catch((error) => {
          console.log("Error retrieving assets:", error.message);
        });
    }

    // Function to fetch the user email
    // function getUserEmail() {
    //   return new Promise((resolve, reject) => {
    //     $.ajax({
    //       url: "https://backend.toddlerneeds.com/api/v1/user/profile",
    //       type: "GET",
    //       contentType: "application/json",
    //       xhrFields: {
    //         withCredentials: true,
    //       },
    //       success: function (response) {

    //         // resolve(response.email);
    //         resolve(response);
    //       },
    //       error: function (xhr, status, error) {
    //         reject(error);
    //       },
    //     });
    //   });
    // }
    let email;
    let username;
    function getUserEmail() {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `${baseUrl}/api/v1/user/profile`,
          type: "GET",
          contentType: "application/json",
          xhrFields: {
            withCredentials: true,
          },
          success: function (response) {
            // Assuming response contains username and email properties
            // const { username, email, isAdmin } = response;
            console.log(response);
            // username = username;
            // email = email;
            resolve(response);
            // resolve({ username, email, isAdmin });
          },
          error: function (xhr, status, error) {
            reject(error);
          },
        });
      });
    }

    // Function to fetch all saved templates and filter them
    function getAllSavedData(userEmail) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `${baseUrl}/api/v1/user/get/all/templates`,
          type: "GET",
          contentType: "application/json",
          success: function (response) {
            // Filter the templates: public or created by the user (even if private)
            const filteredTemplates = response.data.filter(
              (template) =>
                template.isPublic || template.createdBy === userEmail
            );
            console.log("filteredTemplates: ", filteredTemplates);
            resolve(filteredTemplates);
          },
          error: function (xhr, status, error) {
            reject(error);
          },
        });
      });
    }

    // function fetchAndDisplayTemplates() {
    //   const url = window.location.href;
    //   // let type = "";

    //   // if (url.includes("p3-type1.html")) {
    //   //   type = "p3-type1";
    //   // } else if (url.includes("p2-type1.html")) {
    //   //   type = "p2-type1";
    //   // }
    //   const urlParams = new URLSearchParams(window.location.search);
    //   const modelName = urlParams.get("name");
    //   getAllSavedData()
    //     .then((assets) => {
    //       const templatesContainer = $("#gauci-my-templates");
    //       templatesContainer.empty(); // Clear existing content

    //       if (assets.length === 0) {
    //         templatesContainer.html(
    //           '<div class="notice notice-info">No templates found.</div>'
    //         );
    //       } else {
    //         assets.forEach((asset) => {
    //           if (asset.type === modelName) {
    //             const jsonblob = new Blob([asset.src], { type: "text/plain" });
    //             const jsonurl = URL.createObjectURL(jsonblob);

    //             const listItem = $("<li>").attr("data-keyword", asset.name);

    //             listItem.html(`
    //                   <div>${asset.name}</div>
    //                   <div>
    //                       <button type="button" class="gauci-btn primary gauci-select-template" data-json="${asset.src}">
    //                           <span class="material-icons">check</span>Select
    //                       </button>
    //                       <button type="button" class="gauci-btn danger gauci-template-delete" data-target="${asset.key}">
    //                           <span class="material-icons">clear</span>Delete
    //                       </button>
    //                   </div>
    //               `);

    //             templatesContainer.append(listItem);
    //           }
    //         });
    //       }
    //     })
    //     .catch((error) => {
    //       toastr.error(error.message, "Error retrieving assets");
    //     });
    // }

    // function getAllSavedData() {
    //   return new Promise((resolve, reject) => {
    //     $.ajax({
    //       url: "https://backend.toddlerneeds.com/api/v1/user/get/all",
    //       type: "GET",
    //       contentType: "application/json",
    //       success: function (response) {
    //         resolve(response.data);
    //       },
    //       error: function (xhr, status, error) {
    //         reject(error);
    //       },
    //     });
    //   });
    // }

    // Example usage of deleteData function

    $(document).on("click", ".gauci-template-delete", function () {
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
    selector.find("#gauci-json-download").on("click", function () {
      var name = selector.find("#gauci-json-download-name").val();
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
        selector.find(".gauci-modal").hide();
      });
    });
    /* Load JSON */
    function loadJSON(json) {
      console.log("this is the json", json.objects);
      selector.find("#gauci-canvas-loader").css("display", "flex");
      rotate = json.backgroundImage.angle;
      scaleX = json.backgroundImage.scaleX;
      scaleY = json.backgroundImage.scaleY;
      originX = json.backgroundImage.originX;
      originY = json.backgroundImage.originY;
      canvas.clear();
      selector.find("#gauci-layers li").remove();
      mode = json.backgroundImage.mode;
      var blob = dataURLtoBlob(json.backgroundImage.src);
      imgurl = URL.createObjectURL(blob);
      selector.find("#gauci-canvas-img").attr("src", imgurl);
      originalWidth = json.backgroundImage.width;
      originalHeight = json.backgroundImage.height;
      var dimentions = {
        width: originalWidth,
        height: originalHeight,
      };

      for (var i = 0; i < json.objects.length; i++) {
        if (json.objects[i].objectType == "textbox") {
          json.objects[i].fontFamily = json.objects[i].fontFamily + "-gauci";
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
            .find("#gauci-canvas-color")
            .spectrum("set", canvas.backgroundColor);
          selector
            .find("#custom-image-background")
            .spectrum("set", canvas.backgroundColor);
          img = selector.find("#gauci-canvas-img")[0];
          canvas.requestRenderAll();
          selector.find("#gauci-canvas-loader").hide();
          objects.forEach((obj) => {
            if (obj.customId === "clipmask") {
              console.log("Found clipmask object. Removing...");
              canvas.remove(obj);
              onlyDeleteLayerEvent(obj.id);
              canvas.requestRenderAll();
              document.getElementById("done-masking-img").style.display =
                "block";
              document.getElementById("replace-image-btn").style.display =
                "block";
              applyTemplateClipMask(obj);
            }
            if (obj.customId === "layoutImage") {
              // console.log("Found layoutImage object:", obj);
              console.log("ths is t", obj);
              onlyDeleteLayerEvent(obj.id);
              canvas.requestRenderAll();
            }
          });
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
        selector.find("#gauci-layers > li").removeClass("active");
        if (json.backgroundImage) {
          adjustFilterControls(json.backgroundImage["filters"]);
        }
        if (json.overlayImage) {
          selector.find("#gauci-overlay-wrap").show();
          selector
            .find("#gauci-overlay-preview")
            .attr("src", json.overlayImage.src);
        } else {
          selector.find("#gauci-overlay-wrap").hide();
          selector.find("#gauci-overlay-preview").attr("src", "");
        }
      }, 100);
    }

    /* Load Template Fonts */
    function loadTemplateFonts(objects) {
      if (objects.length !== 0) {
        $.each(objects, function (index, val) {
          var font = val.fontFamily.replace("-gauci", "");
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
    selector.find("#gauci-json-upload").on("change", function (e) {
      selector
        .find("#gauci-canvas-wrap, .gauci-content-bar")
        .css("visibility", "visible");
      selector.find("#gauci-canvas-loader").css("display", "flex");
      var reader = new FileReader();
      var json = "";
      reader.onload = function (ev) {
        json = JSON.parse(reader.result);

        loadJSON(json);
        selector.find("#gauci-canvas-loader").hide();
        setTimeout(function () {
          addToHistory(
            '<span class="material-icons">flag</span>' + gauciParams.started
          );
        }, 100);
      };
      reader.readAsText(e.target.files[0]);
      selector.find(".gauci-modal").hide();
    });
    /* Add Template */
    // selector
    //   .find(".template-selection")
    //   .on("click", ".gauci-select-template", function () {
    //     selector
    //       .find("#gauci-canvas-wrap, .gauci-content-bar")
    //       .css("visibility", "visible");
    //     selector.find(".gauci-modal").hide();
    //     selector.find("#gauci-canvas-loader").css("display", "flex");
    //     var objects = canvas.getObjects();
    //     objects
    //       .filter((element) => element.objectType != "BG")
    //       .forEach((element) => canvas.remove(element));
    //     selector.find("#gauci-layers li").remove();
    //     checkLayers();
    //     $.getJSON($(this).data("json"), function (json) {
    //       console.log("this is the editedCanvasobject 2", json);
    //       loadJSON(json);
    //       setTimeout(function () {
    //         addToHistory(
    //           '<span class="material-icons">flag</span>' + gauciParams.started
    //         );
    //       }, 100);
    //     })
    //       .fail(function (jqxhr, textStatus, error) {
    //         toastr.error("Request Failed: " + error, gauciParams.error);
    //       })
    //       .always(function () {
    //         selector.find("#gauci-canvas-loader").hide();
    //       });
    //   });

    // selector
    //   .find(".template-selection")
    //   .on("click", ".gauci-select-template", function () {
    //     selector
    //       .find("#gauci-canvas-wrap, .gauci-content-bar")
    //       .css("visibility", "visible");
    //     selector.find(".gauci-modal").hide();
    //     selector.find("#gauci-canvas-loader").css("display", "flex");
    //     var objects = canvas.getObjects();
    //     objects
    //       .filter((element) => element.objectType != "BG")
    //       .forEach((element) => canvas.remove(element));
    //     selector.find("#gauci-layers li").remove();
    //     checkLayers();
    //     $.getJSON($(this).data("json"), function (json) {
    //       console.log("this is the editedCanvasobject 2", json);
    //       // loadJSON(json);
    //       // setTimeout(function () {
    //       //   addToHistory(
    //       //     '<span class="material-icons">flag</span>' + gauciParams.started
    //       //   );
    //       // }, 100);
    //     })
    //       .fail(function (jqxhr, textStatus, error) {
    //         toastr.error("Request Failed: " + error, gauciParams.error);
    //       })
    //       .always(function () {
    //         selector.find("#gauci-canvas-loader").hide();
    //       });
    //   });

    // selector
    //   .find(".template-selection")
    //   .on("click", ".gauci-select-template", function () {
    //     const jsonData = $(this).data("json");
    //     try {
    //       const prettyJson = JSON.stringify(jsonData, null, 2); // indented, readable format
    //       console.log(prettyJson);
    //     } catch (e) {
    //       console.error("Invalid JSON data:", e);
    //     }

    //     // console.log(jsonData);
    //     // const output = Object.keys(jsonData).map((key) => ({
    //     //   part: key,
    //     //   jsonData: JSON.parse(jsonData[key]),
    //     // }));
    // console.log(output);
    // tabCanvasStates = {};
    // tabCanvasStates = jsonData;
    // allCanvasTabState = jsonData;
    // console.log(activeTabId);
    // loadCanvasState(activeTabId);
    // tabCanvasStates = jsonData;
    // loadCanvasState(activeTabId);
    //   });

    //   selector
    // .find(".template-selection")
    // .on("click", ".gauci-select-template", function () {
    //   selector
    //     .find("#gauci-canvas-wrap, .gauci-content-bar")
    //     .css("visibility", "visible");
    //   selector.find(".gauci-modal").hide();
    //   selector.find("#gauci-canvas-loader").css("display", "flex");
    //   var objects = canvas.getObjects();
    //   objects
    //     .filter((element) => element.objectType != "BG")
    //     .forEach((element) => canvas.remove(element));
    //   selector.find("#gauci-layers li").remove();
    //   checkLayers();
    //   $.getJSON($(this).data("json"), function (json) {
    //     console.log("this is the editedCanvasobject 2", json);
    //     loadJSON(json);
    //     setTimeout(function () {
    //       addToHistory(
    //         '<span class="material-icons">flag</span>' + gauciParams.started
    //       );
    //     }, 100);
    //   })
    //     .fail(function (jqxhr, textStatus, error) {
    //       toastr.error("Request Failed: " + error, gauciParams.error);
    //     })
    //     .always(function () {
    //       selector.find("#gauci-canvas-loader").hide();
    //     });
    // });

    selector
      .find(".template-selection")
      .on("click", ".gauci-select-template", function () {
        selector
          .find("#gauci-canvas-wrap, .gauci-content-bar")
          .css("visibility", "visible");
        selector.find(".gauci-modal").hide();
        selector.find("#gauci-canvas-loader").css("display", "flex");

        // var objects = canvas.getObjects();
        // objects
        //   .filter((element) => element.objectType != "BG")
        //   .forEach((element) => canvas.remove(element));
        selector.find("#gauci-layers li").remove();
        checkLayers();

        // ✅ Get the template data from memory
        const id = $(this).data("id");
        const jsonData = window.assetSrcStore[id];

        if (!jsonData) {
          toastr.error("No template data found.", gauciParams.error);
          selector.find("#gauci-canvas-loader").hide();
          return;
        }

        try {
          if (jsonData) {
            console.log("✅ srcData (raw):", jsonData);
            // console.log(output);
            tabCanvasStates = {};
            tabCanvasStates = jsonData;
            allCanvasTabState = jsonData;
            console.log(activeTabId);
            loadCanvasState(activeTabId);
            // tabCanvasStates = jsonData;
            // loadCanvasState(activeTabId);
          } else {
            console.warn("⚠️ No data found for ID:", id);
          }

          setTimeout(function () {
            addToHistory(
              '<span class="material-icons">flag</span>' + gauciParams.started
            );
          }, 100);
        } catch (e) {
          console.error("Error parsing canvas data:", e);
          toastr.error("Failed to load template data.", gauciParams.error);
        } finally {
          selector.find("#gauci-canvas-loader").hide();
        }
      });

    // $(document).on("click", ".gauci-select-template", function () {
    //   const id = $(this).data("id");
    //   const jsonData = window.assetSrcStore[id];

    //   if (jsonData) {
    //     console.log("✅ srcData (raw):", jsonData);
    //     // console.log(output);
    //     tabCanvasStates = {};
    //     tabCanvasStates = jsonData;
    //     allCanvasTabState = jsonData;
    //     console.log(activeTabId);
    //     loadCanvasState(activeTabId);
    //     tabCanvasStates = jsonData;
    //     loadCanvasState(activeTabId);
    //   } else {
    //     console.warn("⚠️ No data found for ID:", id);
    //   }
    // });

    /* Search My Templates */
    selector.find("#gauci-my-templates-search").on("click", function () {
      var input = $(this).parent().find("input");
      selector.find("#gauci-my-templates-noimg").addClass("d-none");
      selector.find("#gauci-my-templates li").each(function () {
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
        selector.find("#gauci-my-templates li").show();
        if (selector.find("#gauci-my-templates-pagination").length) {
          selector.find("#gauci-my-templates-pagination").pagination("redraw");
          selector
            .find("#gauci-my-templates-pagination")
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
          selector.find("#gauci-my-templates li").show();
          if (selector.find("#gauci-my-templates-pagination").length) {
            selector
              .find("#gauci-my-templates-pagination")
              .pagination("redraw");
            selector
              .find("#gauci-my-templates-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#gauci-my-templates-pagination").length) {
            selector
              .find("#gauci-my-templates-pagination")
              .pagination("destroy");
          }
          selector
            .find("#gauci-my-templates li")
            .hide()
            .filter('[data-keyword*="' + searchTerm + '"]')
            .show();
          if (selector.find("#gauci-my-templates li:visible").length === 0) {
            selector.find("#gauci-my-templates-noimg").removeClass("d-none");
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
    selector.find("#gauci-download").on("click", function () {
      var name = selector.find("#gauci-download-name").val();
      var quality = parseFloat(selector.find("#gauci-download-quality").val());
      var format = selector.find("#gauci-download-format").val();
      var link = document.createElement("a");
      add_watermark();
      canvas.setZoom(1);
      selector.find("#gauci-img-zoom").val(100);
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
                  toastr.error(jqXHR.responseText, gauciParams.error);
                } else {
                  toastr.error(gauciParams.wrong, gauciParams.error);
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
            selector.find("#gauci-download-img-dpi").val()
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
      selector.find(".gauci-modal").hide();
    });
    /* Download File Format Select */
    selector.find("#gauci-download-format").on("change", function () {
      if ($(this).val() == "png" || $(this).val() == "svg") {
        selector.find("#gauci-download-quality").prop("disabled", true);
      } else {
        selector.find("#gauci-download-quality").prop("disabled", false);
      }
    });
    /* Save File Format Select */
    selector.find("#gauci-save-img-format").on("change", function () {
      if ($(this).val() == "png" || $(this).val() == "svg") {
        selector.find("#gauci-save-img-quality").prop("disabled", true);
      } else {
        selector.find("#gauci-save-img-quality").prop("disabled", false);
      }
    });
    /* BLANK CANVAS */
    selector.find("#gauci-canvas-size-select").on("change", function () {
      var val = $(this).val();
      if (val == "custom") {
        selector.find("#gauci-canvas-width").prop("disabled", false);
        selector.find("#gauci-canvas-height").prop("disabled", false);
      } else {
        selector.find("#gauci-canvas-width").prop("disabled", true);
        selector.find("#gauci-canvas-height").prop("disabled", true);
      }
      selector
        .find("#gauci-canvas-width")
        .val($(this).find(":selected").data("width"));
      selector
        .find("#gauci-canvas-height")
        .val($(this).find(":selected").data("height"));
    });
    // Canvas Background
    selector.find("#gauci-canvas-color").on("change", function () {
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
    selector.find("#gauci-media-library").on("click", function () {
      mmediaLibraryMode = "add-to-canvas";
    });
    selector.find("#gauci-img-media-library").on("click", function () {
      mmediaLibraryMode = "add-as-object";
    });
    selector.find("#gauci-img-replace-media-library").on("click", function () {
      mmediaLibraryMode = "replace-image";
    });
    selector.find("#gauci-overlay-img-media-library").on("click", function () {
      mmediaLibraryMode = "overlay-image";
    });
    /* Select Image */
    selector
      .find("#modal-media-library")
      .on(
        "click",
        ".media-library-grid>.gauci-masonry-item>.gauci-masonry-item-inner",
        function () {
          selector.find("#gauci-canvas-loader").css("display", "flex");
          selector.find("#gauci-canvas-wrap").css("visibility", "visible");
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
                selector.find("#gauci-canvas-img").attr("src", dataUrl);
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
                selector.find("#gauci-canvas-loader").hide();
                canvas.fire("gauci:history", {
                  type: "image",
                  text: gauciParams.added,
                });
              };
            });
          } else if (mmediaLibraryMode == "replace-image") {
            convertToDataURL(fullImg, function (dataUrl) {
              tempImg.src = dataUrl;
              tempImg.onload = function () {
                canvas.getActiveObject().setSrc(dataUrl);
                canvas.requestRenderAll();
                selector.find("#gauci-canvas-loader").hide();
                canvas.fire("gauci:history", {
                  type: "image",
                  text: gauciParams.replaced,
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
              selector.find("#gauci-overlay-wrap").show();
              selector.find("#gauci-overlay-preview").attr("src", fullImg);
              setTimeout(function () {
                selector.find("#gauci-canvas-loader").hide();
              }, 500);
            });
          }
          selector.find("#modal-media-library").hide();
        }
      );
    /* Search My Images */
    selector.find("#gauci-library-my-search").on("click", function () {
      var input = $(this).parent().find("input");
      selector.find("#gauci-library-my-noimg").addClass("d-none");
      if (input.val() == "") {
        return;
      }
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#gauci-library-my .gauci-masonry-item").show();
        if (selector.find("#gauci-library-my-pagination").length) {
          selector.find("#gauci-library-my-pagination").pagination("redraw");
          selector
            .find("#gauci-library-my-pagination")
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
          selector.find("#gauci-library-my .gauci-masonry-item").show();
          if (selector.find("#gauci-library-my-pagination").length) {
            selector.find("#gauci-library-my-pagination").pagination("redraw");
            selector
              .find("#gauci-library-my-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#gauci-library-my-pagination").length) {
            selector.find("#gauci-library-my-pagination").pagination("destroy");
          }
          selector
            .find("#gauci-library-my .gauci-masonry-item")
            .hide()
            .filter('[data-keyword*="' + searchTerm + '"]')
            .show();
          if (
            selector.find("#gauci-library-my .gauci-masonry-item:visible")
              .length === 0
          ) {
            selector.find("#gauci-library-my-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
      }
    });
    /* Search All Images */
    selector.find("#gauci-library-all-search").on("click", function () {
      var input = $(this).parent().find("input");
      selector.find("#gauci-library-all-noimg").addClass("d-none");
      if (input.val() == "") {
        return;
      }
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#gauci-library-all .gauci-masonry-item").show();
        if (selector.find("#gauci-library-all-pagination").length) {
          selector.find("#gauci-library-all-pagination").pagination("redraw");
          selector
            .find("#gauci-library-all-pagination")
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
          selector.find("#gauci-library-all .gauci-masonry-item").show();
          if (selector.find("#gauci-library-all-pagination").length) {
            selector.find("#gauci-library-all-pagination").pagination("redraw");
            selector
              .find("#gauci-library-all-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#gauci-library-all-pagination").length) {
            selector
              .find("#gauci-library-all-pagination")
              .pagination("destroy");
          }
          selector
            .find("#gauci-library-all .gauci-masonry-item")
            .hide()
            .filter('[data-keyword*="' + searchTerm + '"]')
            .show();
          if (
            selector.find("#gauci-library-all .gauci-masonry-item:visible")
              .length === 0
          ) {
            selector.find("#gauci-library-all-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
      }
    });
    /* Save Image */
    selector.find("#gauci-save-img").on("click", function () {
      var quality = parseFloat(selector.find("#gauci-save-img-quality").val());
      var format = selector.find("#gauci-save-img-format").val();
      var imgData = "";
      add_watermark();
      canvas.setZoom(1);
      selector.find("#gauci-img-zoom").val(100);
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
                  toastr.error(jqXHR.responseText, gauciParams.error);
                } else {
                  toastr.error(gauciParams.wrong, gauciParams.error);
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
            selector.find("#gauci-download-img-dpi").val()
          );
        }
      }
      settings.saveImage.call(this, selector, imgData);
      selector.find(".gauci-modal").hide();
      remove_watermark();
      adjustZoom();
      canvas.requestRenderAll();
    });
    /* SVG LIBRARY */
    /* Select SVG */
    selector
      .find(".svg-library-grid")
      .on(
        "click",
        ">.gauci-masonry-item>.gauci-masonry-item-inner",
        function () {
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
        }
      );
    /* Search My SVGs */
    selector.find("#gauci-svg-library-my-search").on("click", function () {
      var input = $(this).parent().find("input");
      selector.find("#gauci-svg-library-my-noimg").addClass("d-none");
      if (input.val() == "") {
        return;
      }
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#gauci-svg-library-my .gauci-masonry-item").show();
        if (selector.find("#gauci-svg-library-my-pagination").length) {
          selector
            .find("#gauci-svg-library-my-pagination")
            .pagination("redraw");
          selector
            .find("#gauci-svg-library-my-pagination")
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
          selector.find("#gauci-svg-library-my .gauci-masonry-item").show();
          if (selector.find("#gauci-svg-library-my-pagination").length) {
            selector
              .find("#gauci-svg-library-my-pagination")
              .pagination("redraw");
            selector
              .find("#gauci-svg-library-my-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#gauci-svg-library-my-pagination").length) {
            selector
              .find("#gauci-svg-library-my-pagination")
              .pagination("destroy");
          }
          selector
            .find("#gauci-svg-library-my .gauci-masonry-item")
            .hide()
            .filter('[data-keyword*="' + searchTerm + '"]')
            .show();
          if (
            selector.find("#gauci-svg-library-my .gauci-masonry-item:visible")
              .length === 0
          ) {
            selector.find("#gauci-svg-library-my-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
      }
    });
    /* Search All SVGs */
    selector.find("#gauci-svg-library-all-search").on("click", function () {
      var input = $(this).parent().find("input");
      selector.find("#gauci-library-all-noimg").addClass("d-none");
      if (input.val() == "") {
        return;
      }
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).find(".material-icons").html("search");
        $(this).removeClass("danger");
        $(this).addClass("primary");
        input.val("");
        selector.find("#gauci-svg-library-all .gauci-masonry-item").show();
        if (selector.find("#gauci-svg-library-all-pagination").length) {
          selector
            .find("#gauci-svg-library-all-pagination")
            .pagination("redraw");
          selector
            .find("#gauci-svg-library-all-pagination")
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
          selector.find("#gauci-svg-library-all .gauci-masonry-item").show();
          if (selector.find("#gauci-svg-library-all-pagination").length) {
            selector
              .find("#gauci-svg-library-all-pagination")
              .pagination("redraw");
            selector
              .find("#gauci-svg-library-all-pagination")
              .pagination("selectPage", 1);
          }
        } else {
          if (selector.find("#gauci-svg-library-all-pagination").length) {
            selector
              .find("#gauci-svg-library-all-pagination")
              .pagination("destroy");
          }
          selector
            .find("#gauci-svg-library-all .gauci-masonry-item")
            .hide()
            .filter('[data-keyword*="' + searchTerm + '"]')
            .show();
          if (
            selector.find("#gauci-svg-library-all .gauci-masonry-item:visible")
              .length === 0
          ) {
            selector.find("#gauci-svg-library-all-noimg").removeClass("d-none");
          }
        }
        input.prop("disabled", true);
      }
    });
    /* HISTORY */
    function objectName(type) {
      var layerName = gauciParams.object;
      var layerIcon = "category";
      if (type == null) {
        layerName = gauciParams.object;
        layerIcon = "category";
      } else if (type == "textbox") {
        layerName = gauciParams.text;
        layerIcon = "title";
      } else if (type == "drawing") {
        layerName = gauciParams.freeDrawing;
        layerIcon = "brush";
      } else if (type == "frame") {
        layerName = gauciParams.frame;
        layerIcon = "wallpaper";
      } else if (type == "image") {
        layerName = gauciParams.image;
        layerIcon = "image";
      } else if (type == "circle") {
        layerName = gauciParams.circle;
      } else if (type == "square") {
        layerName = gauciParams.square;
      } else if (type == "rectangle") {
        layerName = gauciParams.rectangle;
      } else if (type == "triangle") {
        layerName = gauciParams.triangle;
      } else if (type == "ellipse") {
        layerName = gauciParams.ellipse;
      } else if (type == "trapezoid") {
        layerName = gauciParams.trapezoid;
      } else if (type == "pentagon") {
        layerName = gauciParams.pentagon;
      } else if (type == "octagon") {
        layerName = gauciParams.octagon;
      } else if (type == "emerald") {
        layerName = gauciParams.emerald;
      } else if (type == "star") {
        layerName = gauciParams.star;
      } else if (type == "element") {
        layerName = gauciParams.element;
        layerIcon = "star";
      } else if (type == "BG") {
        layerName = gauciParams.bg;
        layerIcon = "image";
      } else if (type == "customSVG") {
        layerName = gauciParams.customSvg;
      } else if (type == "qrCode") {
        layerName = gauciParams.qrCode;
        layerIcon = "qr_code";
      }
      return (
        '<span class="material-icons">' + layerIcon + "</span>" + layerName
      );
    }
    // Add to history
    function addToHistory(action) {
      var list = selector.find("#gauci-history-list");
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
      selector.find("#gauci-history").prop("disabled", false);
      list.find("li").removeClass("active");
      list.prepend(
        '<li class="active"><div class="info">' +
          action +
          '<span class="time">' +
          time +
          '</span></div><div><button type="button" class="gauci-btn primary"><span class="material-icons">restore</span>Restore</button><button type="button" class="gauci-btn danger"><span class="material-icons">clear</span>Delete</button><script type="text/json">' +
          JSON.stringify(json) +
          "</script></div></li>"
      );
      var count = list.find("li").length;
      var limit = list.data("max");
      if (count > limit) {
        list.find("li").last().remove();
      }
      selector.find("#gauci-history-count").html(list.find("li").length);
      var undo = list.find("li.active").next("li");
      var redo = list.find("li.active").prev("li");
      if (undo.length) {
        selector.find("#gauci-undo").prop("disabled", false);
      } else {
        selector.find("#gauci-undo").prop("disabled", true);
      }
      if (redo.length) {
        selector.find("#gauci-redo").prop("disabled", false);
      } else {
        selector.find("#gauci-redo").prop("disabled", true);
      }
    }
    // Undo
    // selector.find("#gauci-undo").on("click", function() {
    // 	var target = selector.find("#gauci-history-list li.active").next("li");
    // if (target.length) {
    // 	target.find(".gauci-btn.primary").trigger("click");
    // 	selector.find("#gauci-redo").prop("disabled", false);
    // } else {
    // 	selector.find("#gauci-undo").prop("disabled", true);
    // }
    // });
    selector.find("#gauci-undo").on("click", function () {
      var historyList = selector.find("#gauci-history-list");
      var activeListItem = historyList.find("li.active");

      if (activeListItem.length) {
        var target = activeListItem.next("li");

        if (target.length) {
          var lastAction = getLastAction(target);

          // Now you have information about the last action

          // Trigger other actions based on the lastAction if needed
          if (lastAction.json.objects.length > 0) {
            console.log(lastAction.json.objects.length > 0);
            target.find(".gauci-btn.primary").trigger("click");
            selector.find("#gauci-redo").prop("disabled", false);
          }
        } else {
          selector.find("#gauci-undo").prop("disabled", true);
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
    selector.find("#gauci-redo").on("click", function () {
      var target = selector.find("#gauci-history-list li.active").prev("li");
      if (target.length) {
        target.find(".gauci-btn.primary").trigger("click");
        selector.find("#gauci-undo").prop("disabled", false);
      } else {
        selector.find("#gauci-redo").prop("disabled", true);
      }
    });
    // Delete history
    selector
      .find("#gauci-history-list")
      .on("click", ".gauci-btn.danger", function () {
        $(this).parent().parent().remove();
        if (!$("#gauci-history-list li").length) {
          selector.find("#gauci-history").prop("disabled", true);
          selector.find("#gauci-undo").prop("disabled", true);
          selector.find("#gauci-redo").prop("disabled", true);
          selector.find(".gauci-modal").hide();
        }
      });
    // Restore history
    selector
      .find("#gauci-history-list")
      .on("click", ".gauci-btn.primary", function () {
        selector.find("#gauci-history-list li").removeClass("active");
        $(this).parent().parent().addClass("active");
        var undo = selector.find("#gauci-history-list li.active").next("li");
        var redo = selector.find("#gauci-history-list li.active").prev("li");
        if (undo.length) {
          selector.find("#gauci-undo").prop("disabled", false);
        } else {
          selector.find("#gauci-undo").prop("disabled", true);
        }
        if (redo.length) {
          selector.find("#gauci-redo").prop("disabled", false);
        } else {
          selector.find("#gauci-redo").prop("disabled", true);
        }
        var json = JSON.parse($(this).parent().find("script").html());
        selector.find(".gauci-modal").hide();
        convertToDataURL(json.backgroundImage.src, function (dataUrl) {
          json.backgroundImage.src = dataUrl;
          loadJSON(json);
          selector.find("#gauci-canvas-loader").hide();
        });
      });

    // selector.find("#openEditor").on("click", function () {
    //   var $mainContainer = selector.find("#mini-editor-main-cont");
    //   var $buttonContainer = selector.find("#webg-buttons-container");

    //   // Remove the 'personalise-page-active' class from the main container
    //   $mainContainer.removeClass("personalise-page-active");
    //   // Add the 'personalise-page-inactive' class to the main container
    //   $mainContainer.addClass("personalise-page-inactive");

    //   // Remove the 'toggle-2d-3d-cont' class from the button container
    //   $buttonContainer.removeClass("toggle-2d-3d-cont");

    //   var editedCanvasJson = window.editedCanvasJson;
    //   var originalCanvasJson = window.originalCanvasJson;
    //   console.log(editedCanvasJson);
    //   if (editedCanvasJson && originalCanvasJson) {
    //     var originalCanvasObject = originalCanvasJson;
    //     var editedCanvasObject = editedCanvasJson;

    //     // Iterate over the objects in canvasObject to update their properties
    //     editedCanvasObject.objects.forEach((obj, index) => {
    //       if (originalCanvasObject.objects[index]) {
    //         var originalObj = originalCanvasObject.objects[index];

    //         // Copy the values for top, left, scaleX, and scaleY from originalObj
    //         obj.top = originalObj.top;
    //         obj.left = originalObj.left;
    //         obj.scaleX = originalObj.scaleX;
    //         obj.scaleY = originalObj.scaleY;

    //         // Iterate over properties of the originalObj and add missing ones to obj
    //         for (var key in originalObj) {
    //           if (originalObj.hasOwnProperty(key) && !obj.hasOwnProperty(key)) {
    //             obj[key] = originalObj[key];
    //           }
    //         }
    //       }
    //     });
    //     console.log(editedCanvasObject);
    //     console.log(originalCanvasObject);

    //     // Load the updated JSON into your editor or canvas
    //     loadJSON(originalCanvasObject);
    //     // loadJSON(editedCanvasObject);
    //   } else {
    //     console.log("No saved canvas JSON found in localStorage.");
    //   }
    // });
    // selector.find("#openEditor").on("click", function () {
    //   var $mainContainer = selector.find("#mini-editor-main-cont");
    //   var $buttonContainer = selector.find("#webg-buttons-container");

    //   // Remove the 'personalise-page-active' class from the main container
    //   $mainContainer.removeClass("personalise-page-active");
    //   // Add the 'personalise-page-inactive' class to the main container
    //   $mainContainer.addClass("personalise-page-inactive");

    //   // Remove the 'toggle-2d-3d-cont' class from the button container
    //   $buttonContainer.removeClass("toggle-2d-3d-cont");

    //   var editedCanvasJson = window.editedCanvasJson;
    //   var originalCanvasJson = window.originalCanvasJson;
    //   console.log(editedCanvasJson);

    //   if (editedCanvasJson && originalCanvasJson) {
    //     var originalCanvasObject = originalCanvasJson;
    //     var editedCanvasObject = editedCanvasJson;

    //     // Iterate over the objects in editedCanvasObject to update properties in originalCanvasObject
    //     editedCanvasObject.objects.forEach((editedObj, index) => {
    //       if (originalCanvasObject.objects[index]) {
    //         var originalObj = originalCanvasObject.objects[index];

    //         // Copy the values for top, left, scaleX, and scaleY from originalObj
    //         // editedObj.top = originalObj.top;
    //         // editedObj.left = originalObj.left;
    //         // editedObj.scaleX = originalObj.scaleX;
    //         // editedObj.scaleY = originalObj.scaleY;

    //         // Iterate over properties of the originalObj and add missing ones to editedObj
    //         for (var key in originalObj) {
    //           if (
    //             originalObj.hasOwnProperty(key) &&
    //             !editedObj.hasOwnProperty(key)
    //           ) {
    //             editedObj[key] = originalObj[key];
    //           }
    //         }

    //         // If the object type is 'textbox', copy the 'text' key from editedObj to originalObj
    //         if (editedObj.type === "textbox") {
    //           originalObj.text = editedObj.text;
    //         }
    //         if (
    //           editedObj.type === "image" &&
    //           !editedObj.src.startsWith("http")
    //         ) {
    //           originalObj.top = editedObj.top * 4.6;
    //           originalObj.left = editedObj.left * 4.6;
    //           originalObj.scaleY = editedObj.scaleX * 4.6;
    //           originalObj.scaleX = editedObj.scaleY * 4.6;
    //         }
    //       }
    //     });

    //     console.log(editedCanvasObject);
    //     console.log(originalCanvasObject);

    //     // Load the updated original canvas JSON into your editor or canvas
    //     loadJSON(originalCanvasObject);
    //   } else {
    //     console.log("No saved canvas JSON found in localStorage.");
    //   }
    // });

    // selector.find("#editInEditorpBtn").on("click", function () {
    //   var $mainContainer = selector.find("#mini-editor-main-cont");
    //   var $buttonContainer = selector.find("#webg-buttons-container");

    //   // Remove the 'personalise-page-active' class from the main container
    //   $mainContainer.removeClass("personalise-page-active");
    //   // Add the 'personalise-page-inactive' class to the main container
    //   $mainContainer.addClass("personalise-page-inactive");

    //   // Remove the 'toggle-2d-3d-cont' class from the button container
    //   $buttonContainer.removeClass("toggle-2d-3d-cont");
    //   var editedCanvasJson = window.editedCanvasJson;
    //   var originalCanvasJson = window.originalCanvasJson;
    //   console.log(editedCanvasJson);
    //   if (editedCanvasJson && originalCanvasJson) {
    //     var originalCanvasObject = originalCanvasJson;
    //     var editedCanvasObject = editedCanvasJson;

    //     // Iterate over the objects in canvasObject to update their properties
    //     editedCanvasObject.objects.forEach((obj, index) => {
    //       if (originalCanvasObject.objects[index]) {
    //         var originalObj = originalCanvasObject.objects[index];

    //         // Copy the values for top, left, scaleX, and scaleY from originalObj
    //         obj.top = originalObj.top;
    //         obj.left = originalObj.left;
    //         obj.scaleX = originalObj.scaleX;
    //         obj.scaleY = originalObj.scaleY;

    //         // Iterate over properties of the originalObj and add missing ones to obj
    //         for (var key in originalObj) {
    //           if (originalObj.hasOwnProperty(key) && !obj.hasOwnProperty(key)) {
    //             obj[key] = originalObj[key];
    //           }
    //         }
    //       }
    //     });

    //     // Load the updated JSON into your editor or canvas
    //     console.log("this is the editedCanvasobject 1", originalCanvasObject);
    //     // loadJSON(originalCanvasObject);
    //     loadJSON(editedCanvasObject);
    //   } else {
    //     console.log("No saved canvas JSON found in localStorage.");
    //   }
    // });
    // selector.find("#editInEditorpBtn").on("click", function () {
    //   var $mainContainer = selector.find("#mini-editor-main-cont");
    //   var $buttonContainer = selector.find("#webg-buttons-container");

    //   // Remove the 'personalise-page-active' class from the main container
    //   $mainContainer.removeClass("personalise-page-active");
    //   // Add the 'personalise-page-inactive' class to the main container
    //   $mainContainer.addClass("personalise-page-inactive");

    //   // Remove the 'toggle-2d-3d-cont' class from the button container
    //   $buttonContainer.removeClass("toggle-2d-3d-cont");

    //   var editedCanvasJson = window.editedCanvasJson;
    //   var originalCanvasJson = window.originalCanvasJson;
    //   console.log(editedCanvasJson);

    //   if (editedCanvasJson && originalCanvasJson) {
    //     var originalCanvasObject = originalCanvasJson;
    //     var editedCanvasObject = editedCanvasJson;

    //     // Iterate over the objects in editedCanvasObject to update properties in originalCanvasObject
    //     editedCanvasObject.objects.forEach((editedObj, index) => {
    //       if (originalCanvasObject.objects[index]) {
    //         var originalObj = originalCanvasObject.objects[index];

    //         // Copy the values for top, left, scaleX, and scaleY from originalObj
    //         // editedObj.top = originalObj.top;
    //         // editedObj.left = originalObj.left;
    //         // editedObj.scaleX = originalObj.scaleX;
    //         // editedObj.scaleY = originalObj.scaleY;

    //         // Iterate over properties of the originalObj and add missing ones to editedObj
    //         for (var key in originalObj) {
    //           if (
    //             originalObj.hasOwnProperty(key) &&
    //             !editedObj.hasOwnProperty(key)
    //           ) {
    //             editedObj[key] = originalObj[key];
    //           }
    //         }

    //         // If the object type is 'textbox', copy the 'text' key from editedObj to originalObj
    //         if (editedObj.type === "textbox") {
    //           originalObj.text = editedObj.text;
    //         }
    //         if (
    //           editedObj.type === "image" &&
    //           !editedObj.src.startsWith("http")
    //         ) {
    //           originalObj.top = editedObj.top * 4.6;
    //           originalObj.left = editedObj.left * 4.6;
    //           originalObj.scaleY = editedObj.scaleX * 4.6;
    //           originalObj.scaleX = editedObj.scaleY * 4.6;
    //         }
    //       }
    //     });

    //     console.log(editedCanvasObject);
    //     console.log(originalCanvasObject);

    //     // Load the updated original canvas JSON into your editor or canvas
    //     loadJSON(originalCanvasObject);
    //   } else {
    //     console.log("No saved canvas JSON found in localStorage.");
    //   }
    // });
    // selector.find("#go-back-mini").on("click", function () {
    //   var $mainContainer = selector.find("#mini-editor-main-cont");
    //   var $buttonContainer = selector.find("#webg-buttons-container");

    //   // Remove the 'personalise-page-active' class from the main container
    //   // $mainContainer.removeClass("personalise-page-active");
    //   // // Add the 'personalise-page-inactive' class to the main container
    //   // $mainContainer.addClass("personalise-page-inactive");
    //   // $buttonContainer.removeClass("toggle-2d-3d-cont");
    //   $mainContainer.addClass("personalise-page-active");
    //   // Add the 'personalise-page-inactive' class to the main container
    //   $mainContainer.removeClass("personalise-page-inactive");
    //   $buttonContainer.addClass("toggle-2d-3d-cont");
    //   canvas.clear();
    // });
    selector.find("#go-back-mini").on("click", function () {
      location.reload();
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
      // var originalCanvasJson = window.originalCanvasJson;
      console.log(editedCanvasJson);
      var selectedOrginalFormat = window.selectedOriginalJsonPart;
      var orginalDataFormat = window.originalFormat;

      var editedArrayFormat = Object.keys(orginalDataFormat).map((key) => ({
        part: key,
        jsonData: JSON.parse(orginalDataFormat[key]),
      }));
      var newObject = {
        part: selectedOrginalFormat.part,
        jsonData: editedCanvasJson,
      };

      console.log(newObject);
      console.log(editedArrayFormat);
      // Step 1: Filter original object by part
      var originalMatched = editedArrayFormat.find(
        (obj) => obj.part === newObject.part
      );

      if (originalMatched) {
        var originalObjects = originalMatched.jsonData.objects || [];
        var modifiedObjects = newObject.jsonData.objects || [];

        // Step 2: Fill missing data in modified objects from original
        modifiedObjects.forEach((modObj, index) => {
          let origObj = originalObjects[index];
          if (origObj) {
            for (let key in origObj) {
              if (!(key in modObj)) {
                modObj[key] = origObj[key];
              }
            }
          }

          // ✅ Step 3: Convert crossOrigin: null → "anonymous"
          if (modObj.crossOrigin === null) {
            modObj.crossOrigin = "anonymous";
          }

          if (modObj.scaleX !== undefined) modObj.scaleX *= 4.55;
          if (modObj.scaleY !== undefined) modObj.scaleY *= 4.55;
          if (modObj.left !== undefined) modObj.left *= 4.55;
          if (modObj.top !== undefined) modObj.top *= 4.55;

          // ✅ Step 4: Handle clipPath if present
          if (modObj.clipPath) {
            let clip = modObj.clipPath;
            if (clip.scaleX !== undefined) clip.scaleX *= 4.55;
            if (clip.scaleY !== undefined) clip.scaleY *= 4.55;
            if (clip.left !== undefined) clip.left *= 4.55;
            if (clip.top !== undefined) clip.top *= 4.55;
          }
        });

        // Step 4: Assign updated objects back to jsonData
        newObject.jsonData.objects = modifiedObjects;
      }

      // Final result
      console.log(newObject);
      var updatedArrayFormat = editedArrayFormat.map((obj) => {
        if (obj.part === newObject.part) {
          return newObject; // Replace with modified object
        }
        return obj; // Keep as is
      });

      console.log(updatedArrayFormat);
      const originalFormat = {};
      updatedArrayFormat.forEach((item) => {
        originalFormat[item.part] = JSON.stringify(item.jsonData);
      });
      console.log(originalFormat);

      console.log(tabCanvasStates);
      console.log(activeTabId);
      console.log(preservedImage);
      console.log(layoutSource);
      tabCanvasStates = originalFormat;
      allCanvasTabState = originalFormat;
      loadCanvasState(activeTabId);
      console.log(allCanvasTabState);
      console.log(mainPart);
      //      let tabCanvasStates = {}; // To store canvas JSON state for each tab
      // let activeTabId = null; // To track the currently active tab
      // let preservedImage = null; // To manage the layout image
      // let layoutSource = null; // URL of the current layout image
      // let allCanvasTabState = {};
      // let mainPart = null;
      // console.log(selectedOrginalFormat);
      // console.log(orginalDataFormat);
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
      // var originalCanvasJson = window.originalCanvasJson;
      console.log(editedCanvasJson);
      if (editedCanvasJson) {
        var selectedOrginalFormat = window.selectedOriginalJsonPart;
        var orginalDataFormat = window.originalFormat;

        var editedArrayFormat = Object.keys(orginalDataFormat).map((key) => ({
          part: key,
          jsonData: JSON.parse(orginalDataFormat[key]),
        }));
        var newObject = {
          part: selectedOrginalFormat.part,
          jsonData: editedCanvasJson,
        };

        console.log(newObject);
        console.log(editedArrayFormat);
        // Step 1: Filter original object by part
        var originalMatched = editedArrayFormat.find(
          (obj) => obj.part === newObject.part
        );

        if (originalMatched) {
          var originalObjects = originalMatched.jsonData.objects || [];
          var modifiedObjects = newObject.jsonData.objects || [];

          // Step 2: Fill missing data in modified objects from original
          modifiedObjects.forEach((modObj, index) => {
            let origObj = originalObjects[index];
            if (origObj) {
              for (let key in origObj) {
                if (!(key in modObj)) {
                  modObj[key] = origObj[key];
                }
              }
            }

            // ✅ Step 3: Convert crossOrigin: null → "anonymous"
            if (modObj.crossOrigin === null) {
              modObj.crossOrigin = "anonymous";
            }

            if (modObj.scaleX !== undefined) modObj.scaleX *= 4.55;
            if (modObj.scaleY !== undefined) modObj.scaleY *= 4.55;
            if (modObj.left !== undefined) modObj.left *= 4.55;
            if (modObj.top !== undefined) modObj.top *= 4.55;

            // ✅ Step 4: Handle clipPath if present
            if (modObj.clipPath) {
              let clip = modObj.clipPath;
              if (clip.scaleX !== undefined) clip.scaleX *= 4.55;
              if (clip.scaleY !== undefined) clip.scaleY *= 4.55;
              if (clip.left !== undefined) clip.left *= 4.55;
              if (clip.top !== undefined) clip.top *= 4.55;
            }
          });

          // Step 4: Assign updated objects back to jsonData
          newObject.jsonData.objects = modifiedObjects;
        }

        // Final result
        console.log(newObject);
        var updatedArrayFormat = editedArrayFormat.map((obj) => {
          if (obj.part === newObject.part) {
            return newObject; // Replace with modified object
          }
          return obj; // Keep as is
        });

        console.log(updatedArrayFormat);
        const originalFormat = {};
        updatedArrayFormat.forEach((item) => {
          originalFormat[item.part] = JSON.stringify(item.jsonData);
        });
        console.log(originalFormat);

        console.log(tabCanvasStates);
        console.log(activeTabId);
        console.log(preservedImage);
        console.log(layoutSource);
        tabCanvasStates = originalFormat;
        allCanvasTabState = originalFormat;
        loadCanvasState(activeTabId);
        console.log(allCanvasTabState);
        console.log(mainPart);
      }
      //  else {
      //   fetchImageData();
      // }
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
    selector.find("#gauci-clear-history").on("click", function () {
      var answer = window.confirm(gauciParams.question1);
      if (answer) {
        selector.find("#gauci-history-list li").remove();
        selector.find("#gauci-history").prop("disabled", true);
        selector.find("#gauci-undo").prop("disabled", true);
        selector.find("#gauci-redo").prop("disabled", true);
        selector.find(".gauci-modal").hide();
      }
    });
    /* EVENTS */
    canvas.on("gauci:history", function (e) {
      addToHistory(objectName(e.type) + " " + e.text);
    });
    var isObjectMoving = false;
    canvas.on("mouse:up", function (e) {
      var obj = e.target;
      if (obj !== null) {
        var objType = obj.objectType;
        if (isObjectMoving) {
          addToHistory(objectName(objType) + " " + gauciParams.moved);
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
    // canvas.on("object:added", function (e) {
    //   console.log(canvas.getObjects());
    //   var obj = e.target;
    //   console.log(obj, "Layers checking");
    //   if (
    //     obj.objectType != "clipPath" &&
    //     obj.objectType != "drawing" &&
    //     obj.objectType != "watermark"
    //   ) {
    //     if (canvas.isDrawingMode === true) {
    //       obj.set("objectType", "drawing");
    //       obj.set("selectable", false);
    //       obj.set("lockMovementX", true);
    //       obj.set("lockMovementY", true);
    //       obj.set("lockRotation", true);
    //     } else {
    //       var order = canvas.getObjects().indexOf(obj);
    //       var output = "";
    //       var layerName = "Object";
    //       var layerIcon = "category";
    //       var visibility = "layer-visible";
    //       var visibilityTag = "visibility";
    //       var lock = "layer-unlocked";
    //       var lockTag = "lock_open";
    //       if (obj.visible == false) {
    //         visibility = "layer-hidden";
    //         visibilityTag = "visibility_off";
    //       }
    //       if (obj.selectable == false) {
    //         lock = "layer-locked";
    //         lockTag = "lock";
    //       }
    //       obj.set("id", new Date().getTime());
    //       selector.find("#gauci-layers > li").removeClass("active");
    //       if (obj.objectType == "textbox") {
    //         layerName = obj.text;
    //         layerIcon = "title";
    //       } else if (obj.objectType == "drawing") {
    //         layerName = gauciParams.freeDrawing;
    //         layerIcon = "brush";
    //       } else if (obj.objectType == "frame") {
    //         layerName = gauciParams.frame;
    //         layerIcon = "wallpaper";
    //       } else if (obj.objectType == "image") {
    //         layerName = gauciParams.image;
    //         layerIcon = "image";
    //       } else if (obj.objectType == "circle") {
    //         layerName = gauciParams.circle;
    //       } else if (obj.objectType == "square") {
    //         layerName = gauciParams.square;
    //       } else if (obj.objectType == "rectangle") {
    //         layerName = gauciParams.rectangle;
    //       } else if (obj.objectType == "triangle") {
    //         layerName = gauciParams.triangle;
    //       } else if (obj.objectType == "ellipse") {
    //         layerName = gauciParams.ellipse;
    //       } else if (obj.objectType == "trapezoid") {
    //         layerName = gauciParams.trapezoid;
    //       } else if (obj.objectType == "pentagon") {
    //         layerName = gauciParams.pentagon;
    //       } else if (obj.objectType == "octagon") {
    //         layerName = gauciParams.octagon;
    //       } else if (obj.objectType == "emerald") {
    //         layerName = gauciParams.emerald;
    //       } else if (obj.objectType == "star") {
    //         layerName = gauciParams.star;
    //       } else if (obj.objectType == "element") {
    //         layerName = gauciParams.element;
    //         layerIcon = "star";
    //       } else if (obj.objectType == "customSVG") {
    //         layerName = gauciParams.customSvg;
    //       } else if (obj.objectType == "qrCode") {
    //         layerName = gauciParams.qrCode;
    //         layerIcon = "qr_code";
    //       }
    //       if ("layerName" in obj) {
    //         layerName = obj.layerName;
    //       }
    //       output =
    //         '<li id="' +
    //         obj.id +
    //         '" data-type="' +
    //         obj.objectType +
    //         '" class="layer-' +
    //         obj.objectType +
    //         ' active" data-sort="' +
    //         order +
    //         '"><span class="material-icons">' +
    //         layerIcon +
    //         '</span><input class="layer-name" autocomplete="off" value="' +
    //         layerName +
    //         '" /><span class="material-icons layer-settings">settings</span><div class="layer-icons"><a class="material-icons lock-layer ' +
    //         lock +
    //         '" title="' +
    //         gauciParams.lockunlock +
    //         '">' +
    //         lockTag +
    //         '</a><a class="material-icons text-success duplicate-layer" title="' +
    //         gauciParams.duplicate +
    //         '">content_copy</a><a class="material-icons layer-visibility ' +
    //         visibility +
    //         '" title="' +
    //         gauciParams.showhide +
    //         '">' +
    //         visibilityTag +
    //         '</a><a class="material-icons text-danger delete-layer" title="' +
    //         gauciParams.delete +
    //         '">clear</a></div></li>';
    //       selector.find("#gauci-layers").prepend(output);

    //       deleteLayerEvent(obj.id);
    //       cloneLayerEvent(obj.id);
    //       visibilityLayerEvent(obj.id);
    //       lockLayerEvent(obj.id);
    //       clickLayerEvent(obj.id);
    //       layerNameEvent(obj.id);
    //       selector.find("#gauci-layers").sortable("refresh");
    //       checkLayers();
    //       addDeleteIcon(obj);
    //       addCloneIcon(obj);
    //     }
    //   }
    // });
    canvas.on("object:added", function (e) {
      console.log(canvas.getObjects());
      const obj = e.target;
      // console.log(obj, "Layers checking");

      if (
        obj.objectType !== "clipPath" &&
        obj.objectType !== "drawing" &&
        obj.objectType !== "watermark"
      ) {
        if (canvas.isDrawingMode === true) {
          obj.set("objectType", "drawing");
          obj.set("selectable", false);
          obj.set("lockMovementX", true);
          obj.set("lockMovementY", true);
          obj.set("lockRotation", true);
          console.log("object is not active");
        } else {
          // Clear previous layers before adding new ones
          selector.find("#gauci-layers").empty();
          console.log(canvas.getObjects());
          canvas
            .getObjects()
            .slice(1)
            .forEach((canvasObj, index) => {
              console.log("object goes here");
              console.log(canvasObj);
              let output = "";
              let layerName = "Object";
              let layerIcon = "category";
              let visibility = "layer-visible";
              let visibilityTag = "visibility";
              let lock = "layer-unlocked";
              let lockTag = "lock_open";

              if (canvasObj.visible === false) {
                visibility = "layer-hidden";
                visibilityTag = "visibility_off";
              }
              if (canvasObj.selectable === false) {
                lock = "layer-locked";
                lockTag = "lock";
              }

              canvasObj.set("id", new Date().getTime() + index); // Ensure unique ID

              if (canvasObj.objectType === "textbox") {
                console.log("text goes here");
                layerName = canvasObj.text;
                layerIcon = "title";
              } else if (canvasObj.objectType === "drawing") {
                layerName = gauciParams.freeDrawing;
                layerIcon = "brush";
              } else if (canvasObj.objectType === "frame") {
                layerName = gauciParams.frame;
                layerIcon = "wallpaper";
              } else if (canvasObj.objectType === "image") {
                layerName = gauciParams.image;
                layerIcon = "image";
              } else if (canvasObj.objectType === "circle") {
                layerName = gauciParams.circle;
              } else if (canvasObj.objectType === "square") {
                layerName = gauciParams.square;
              } else if (canvasObj.objectType === "rectangle") {
                layerName = gauciParams.rectangle;
              } else if (canvasObj.objectType === "triangle") {
                layerName = gauciParams.triangle;
              } else if (canvasObj.objectType === "ellipse") {
                layerName = gauciParams.ellipse;
              } else if (canvasObj.objectType === "trapezoid") {
                layerName = gauciParams.trapezoid;
              } else if (canvasObj.objectType === "pentagon") {
                layerName = gauciParams.pentagon;
              } else if (canvasObj.objectType === "octagon") {
                layerName = gauciParams.octagon;
              } else if (canvasObj.objectType === "emerald") {
                layerName = gauciParams.emerald;
              } else if (canvasObj.objectType === "star") {
                layerName = gauciParams.star;
              } else if (canvasObj.objectType === "element") {
                layerName = gauciParams.element;
                layerIcon = "star";
              } else if (canvasObj.objectType === "customSVG") {
                layerName = gauciParams.customSvg;
              } else if (canvasObj.objectType === "qrCode") {
                layerName = gauciParams.qrCode;
                layerIcon = "qr_code";
              }
              if (canvasObj.type === "textbox") {
                layerName = canvasObj.text;
                layerIcon = "title";
              } else if (canvasObj.type === "rect") {
                layerName = gauciParams.rectangle;
              } else if (canvasObj.type === "circle") {
                layerName = gauciParams.circle;
              } else if (canvasObj.type === "triangle") {
                layerName = gauciParams.triangle;
              } else if (canvasObj.type === "path") {
                layerName = gauciParams.element;
                layerIcon = "star";
              } else if (canvasObj.type === "group") {
                layerName = gauciParams.element;
                layerIcon = "star";
              } else if (canvasObj.type === "image") {
                layerName = gauciParams.image;
                layerIcon = "image";
              }

              if ("layerName" in canvasObj) {
                layerName = canvasObj.layerName;
              }

              output =
                '<li id="' +
                canvasObj.id +
                '" data-type="' +
                canvasObj.objectType +
                '" class="layer-' +
                canvasObj.objectType +
                ' active" data-sort="' +
                index +
                '"><span class="material-icons">' +
                layerIcon +
                '</span><input class="layer-name" autocomplete="off" value="' +
                layerName +
                '" /><span class="material-icons layer-settings">settings</span><div class="layer-icons"><a class="material-icons lock-layer ' +
                lock +
                '" title="' +
                gauciParams.lockunlock +
                '">' +
                lockTag +
                '</a><a class="material-icons text-success duplicate-layer" title="' +
                gauciParams.duplicate +
                '">content_copy</a><a class="material-icons layer-visibility ' +
                visibility +
                '" title="' +
                gauciParams.showhide +
                '">' +
                visibilityTag +
                '</a><a class="material-icons text-danger delete-layer" title="' +
                gauciParams.delete +
                '">clear</a></div></li>';

              selector.find("#gauci-layers").prepend(output);

              deleteLayerEvent(canvasObj.id);
              cloneLayerEvent(canvasObj.id);
              visibilityLayerEvent(canvasObj.id);
              lockLayerEvent(canvasObj.id);
              clickLayerEvent(canvasObj.id);
              layerNameEvent(canvasObj.id);
              addDeleteIcon(obj);
              addCloneIcon(obj);
            });

          selector.find("#gauci-layers").sortable("refresh");
          checkLayers();
        }
      }
    });

    canvas.on("object:modified", function (e) {
      var obj = e.target;
      if (obj.objectType == "textbox" && obj.id) {
        selector
          .find("#gauci-layers #" + obj.id + " .layer-name")
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
        '<span class="material-icons">brush</span>' + gauciParams.erased
      );
    });
    /* Horizontal Align Center */
    selector.find(".gauci-horizontal-center").on("click", function () {
      var obj = canvas.getActiveObject();
      obj.set("originX", "center");
      obj.set("left", getScaledSize()[0] / 2);
      canvas.requestRenderAll();
    });
    /* Vertical Align Center */
    selector.find(".gauci-vertical-center").on("click", function () {
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
      selector.find("#gauci-font-family").trigger("change");
    });
    canvas.on("selection:cleared", function () {
      selector.find("#gauci-text-settings").hide();
      selector.find("#gauci-image-settings").hide();
      selector.find("#gauci-shape-settings").hide();
      selector.find("#gauci-custom-element-options").hide();
      selector.find("#gauci-custom-element-options-info").show();
      selector.find("#gauci-custom-svg-options").hide();
      selector.find("#gauci-layers > li").removeClass("active");
    });
    /* Layers */
    selector
      .find("#gauci-layers")
      .sortable({
        placeholder: "layer-placeholder",
        axis: "y",
        update: function (e, ui) {
          var objects = canvas.getObjects();
          console.log(objects, "Objects data");
          $("#gauci-layers li").each(function (index, value) {
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
    selector.find("#gauci-layers").on("click", ".layer-settings", function () {
      var layerSettings = $(this).next();
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        layerSettings.hide();
      } else {
        selector.find("#gauci-layers .layer-icons").hide();
        selector.find("#gauci-layers .layer-settings").removeClass("active");
        $(this).addClass("active");
        layerSettings.show();
      }
    });
    /* Delete Layer Event */
    function deleteLayerEvent(id) {
      var item = selector.find("#gauci-layers #" + id);
      item.find("a.delete-layer").on("click", function (e) {
        e.preventDefault();
        canvas.fire("gauci:history", {
          type: item.data("type"),
          text: gauciParams.removed,
        });
        var objects = canvas.getObjects();
        objects
          .filter((element) => element.id == id)
          .forEach((element) => {
            if (element.clipPath) {
              // Hide the "done" and "replace image" buttons only for the object with the clip mask
              document.getElementById("done-masking-img").style.display =
                "none";
              document.getElementById("replace-image-btn").style.display =
                "none";
              document.getElementById("edit-masking-button").style.display =
                "none";
            }

            canvas.remove(element);
          });

        item.remove();
        canvas.requestRenderAll();
        selector.find("#gauci-layers").sortable("refresh");
        checkLayers();
      });
    }
    /* Clone Layer Event */
    function cloneLayerEvent(id) {
      var item = selector.find("#gauci-layers #" + id);
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
        selector.find("#gauci-layers").sortable("refresh");
        canvas.fire("gauci:history", {
          type: item.data("type"),
          text: gauciParams.added,
        });
      });
    }
    /* Visibility Layer Event */
    function visibilityLayerEvent(id) {
      var item = selector.find("#gauci-layers #" + id);
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
      var item = selector.find("#gauci-layers #" + id);
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
      var item = selector.find("#gauci-layers #" + id);
      item.on("click", function (e) {
        var objects = canvas.getObjects();
        var id = $(this).attr("id");
        objects
          .filter((element) => element.id == id)
          .forEach((element) => canvas.setActiveObject(element));
        selector.find("#gauci-layers > li").removeClass("active");
        $(this).addClass("active");
        canvas.requestRenderAll();
      });
    }
    /* Layer Name Event */
    function layerNameEvent(id) {
      var item = selector.find("#gauci-layers #" + id);
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
      if (!selector.find("#gauci-layers li").length) {
        selector.find("#gauci-no-layer").show();
        selector.find("#gauci-layer-delete-wrap").css("visibility", "hidden");
      } else {
        selector.find("#gauci-no-layer").hide();
        selector.find("#gauci-layer-delete-wrap").css("visibility", "visible");
      }
    }
    /* Layer Toggle */
    function layerToggle(obj) {
      selector.find("#gauci-layers li").removeClass("active");
      if (obj.length >= 2) {
        for (var i = 0; i < obj.length; i++) {
          selector.find("#gauci-layers #" + obj[i].id).addClass("active");
        }
      } else {
        obj = obj[0];
        if (obj.objectType) {
          // Textbox
          if (obj.objectType == "textbox") {
            selector.find("#gauci-text-settings").show();
            setTextSettings(obj);
            if (!selector.find("#gauci-btn-text").hasClass("active")) {
              selector.find("#gauci-btn-text").trigger("click");
            }
            selector.find("#gauci-font-family").trigger("change");
          } else {
            selector.find("#gauci-text-settings").hide();
          }
          // Image
          if (obj.objectType == "image") {
            selector.find("#gauci-image-settings").show();
            setImageSettings(obj);
            if (!selector.find("#gauci-btn-image").hasClass("active")) {
              selector.find("#gauci-btn-image").trigger("click");
              selector.find("#gauci-img-mode").trigger("click");
            }
          } else {
            selector.find("#gauci-image-settings").hide();
          }
          // Frames
          if (obj.objectType == "frame") {
            if (!selector.find("#gauci-btn-frames").hasClass("active")) {
              selector.find("#gauci-btn-frames").trigger("click");
            }
          }
          // Elements
          if (obj.objectType == "element") {
            selector.find("#gauci-custom-element-options").show();
            selector.find("#gauci-custom-element-options-info").hide();
            setElementSettings(obj);
            if (!selector.find("#gauci-btn-elements").hasClass("active")) {
              selector.find("#gauci-btn-elements").trigger("click");
            }
            selector.find("#gauci-custom-element-open").trigger("click");
          } else {
            selector.find("#gauci-custom-element-options").hide();
            selector.find("#gauci-custom-element-options-info").show();
          }
          // Custom SVG
          if (obj.objectType == "customSVG") {
            selector.find("#gauci-custom-svg-options").show();
            setCustomSVGSettings(obj);
            if (!selector.find("#gauci-btn-icons").hasClass("active")) {
              selector.find("#gauci-btn-icons").trigger("click");
            }
            selector.find("#gauci-custom-svg-open").trigger("click");
          } else {
            selector.find("#gauci-custom-svg-options").hide();
          }
          // Shapes
          if (shapeTypes.includes(obj.objectType)) {
            if (resizableShapeTypes.includes(obj.objectType)) {
              selector.find("#shape-custom-width-wrap").show();
            } else {
              selector.find("#shape-custom-width-wrap").hide();
            }
            selector.find("#gauci-shape-settings").show();
            setShapeSettings(obj);
            if (!selector.find("#gauci-btn-shapes").hasClass("active")) {
              selector.find("#gauci-btn-shapes").trigger("click");
            }
          } else {
            selector.find("#gauci-shape-settings").hide();
          }
          if (obj.id) {
            selector.find("#gauci-layers #" + obj.id).addClass("active");
          }
        } else {
          $.each(obj, function (index, val) {
            selector.find("#gauci-layers #" + val.id).addClass("active");
          });
        }
      }
    }
    /* Layer Delete */
    selector.find("#gauci-layer-delete").on("click", function () {
      var answer = window.confirm(gauciParams.question2);
      if (answer) {
        var type = selector.find("#gauci-layer-select").val();
        var objects = canvas.getObjects();
        if (type == "all") {
          objects.forEach((element) => canvas.remove(element));
          selector.find("#gauci-layers > li").remove();
        } else {
          objects
            .filter((element) => element.objectType == type)
            .forEach((element) => canvas.remove(element));
          selector.find("#gauci-layers > li.layer-" + type).remove();
        }
        canvas.requestRenderAll();
        selector.find("#gauci-layers").sortable("refresh");
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
        var currentZoom = selector.find("#gauci-img-zoom").val();
        var requiredRatio = 100;
        var ratio = 1;
        var ratio2 = 0;
        if (
          zoomWidth < selector.find("#gauci-content").width() &&
          zoomHeight < selector.find("#gauci-content").height()
        ) {
          canvas.setZoom(1);
          selector.find("#gauci-img-zoom").val(100);
        } else {
          if (zoomWidth > selector.find("#gauci-content").width()) {
            ratio = (selector.find("#gauci-content").width() - 60) / zoomWidth;
            requiredRatio = ratio.toFixed(2) * 100;
            if (currentZoom > requiredRatio) {
              canvas.setZoom(ratio.toFixed(2));
              selector.find("#gauci-img-zoom").val(ratio.toFixed(2) * 100);
              ratio2 = ratio.toFixed(2);
            }
          }
          if (zoomHeight > selector.find("#gauci-content").height()) {
            ratio = selector.find("#gauci-content").height() / zoomHeight;
            requiredRatio = ratio.toFixed(2) * 100;
            if (currentZoom > requiredRatio) {
              if (ratio2 === 0 || ratio2 > ratio.toFixed(2)) {
                canvas.setZoom(ratio.toFixed(2));
                selector.find("#gauci-img-zoom").val(ratio.toFixed(2) * 100);
              }
            }
          }
        }
      }
      canvas.setWidth(zoomWidth * canvas.getZoom());
      canvas.setHeight(zoomHeight * canvas.getZoom());
      if (canvas.isDrawingMode === true) {
        if (selector.find("#gauci-erase-btn").hasClass("active")) {
          selector.find("#eraser-width").trigger("input");
        }
        if (selector.find("#gauci-draw-btn").hasClass("active")) {
          selector.find("#brush-width").trigger("input");
        }
      }
    }

    function centerCanvas() {
      // Apply centering styles to both canvases
      selector.find("#gauci-canvas-wrap").css({
        top: "50%",
        left: "25%",
        transform: "translate(-50%, -50%)",
      });
    }
    function fixZoomOut() {
      var containerWidth = selector.find("#gauci-content").width();
      var containerHeight = selector.find("#gauci-content").height();

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
      selector.find("#gauci-img-zoom").val(minScale * 100);

      canvas.setWidth(zoomWidth * canvas.getZoom());
      canvas.setHeight(zoomHeight * canvas.getZoom());

      // Additional logic for drawing mode adjustments
      if (canvas.isDrawingMode === true) {
        if (selector.find("#gauci-erase-btn").hasClass("active")) {
          selector.find("#eraser-width").trigger("input");
        }
        if (selector.find("#gauci-draw-btn").hasClass("active")) {
          selector.find("#brush-width").trigger("input");
        }
      }
    }

    /* Pan */
    selector.find("#gauci-img-drag").on("click", function () {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        selector.find("#gauci-canvas-overlay").hide();
        selector.find("#gauci-canvas-wrap").draggable("disable");
      } else {
        $(this).addClass("active");
        selector.find("#gauci-canvas-overlay").show();
        selector.find("#gauci-canvas-wrap").draggable("enable");
      }
    });
    /* Zoom */
    selector
      .find(".gauci-counter input.gauci-form-field")
      .on("input", function () {
        var val = parseInt($(this).val());
        adjustZoom(val);
      });
    /* Resize Input Update */
    var setDimentions = function (e) {
      selector.find("#gauci-resize-width").val(Math.round(e.width));
      selector.find("#gauci-resize-height").val(Math.round(e.height));
      selector.find("#gauci-img-width").html(Math.round(e.width));
      selector.find("#gauci-img-height").html(Math.round(e.height));
      selector.find("#gauci-crop-width").val(Math.round(e.width / 2));
      selector.find("#gauci-crop-height").val(Math.round(e.height / 2));
      selector.find("#gauci-resize-width").data("size", Math.round(e.width));
      selector.find("#gauci-resize-height").data("size", Math.round(e.height));
      if (mode == "image") {
        selector.find("#gauci-crop-width").data("max", Math.round(e.width));
        selector.find("#gauci-crop-height").data("max", Math.round(e.height));
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
      selector.find("#gauci-canvas-img").attr("src", imgurl);
      canvas.backgroundColor = selector.find("#custom-image-background").val();
      objects
        .filter((element) => element.objectType != "BG")
        .forEach((element) => element.set("visible", true));
    }

    function setClipPath() {
      var objects = canvas.getObjects();
      clipPath.moveTo(9999);
      canvas.setActiveObject(clipPath);
      selector.find("#gauci-crop-btns").removeClass("disabled");
      selector
        .find(
          ".gauci-icon-panel-content ul.gauci-accordion > li, #gauci-icon-menu, #gauci-top-bar, #gauci-right-col"
        )
        .css("pointer-events", "none");
      selector
        .find(
          ".gauci-icon-panel-content ul.gauci-accordion > li.accordion-crop"
        )
        .css("pointer-events", "auto");
      objects
        .filter(
          (element) =>
            element.objectType != "clipPath" && element.objectType != "BG"
        )
        .forEach((element) => element.set("selectable", false));
    }
    /* Crop Style Select */
    selector.find("#gauci-crop-style").on("change", function () {
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
        var width = parseInt(selector.find("#gauci-crop-width").val());
        var height = parseInt(selector.find("#gauci-crop-height").val());
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
        selector.find("#gauci-crop-btns").addClass("disabled");
        selector
          .find(
            ".gauci-icon-panel-content ul.gauci-accordion > li, #gauci-icon-menu, #gauci-top-bar, #gauci-right-col"
          )
          .css("pointer-events", "auto");
      }
    });
    /* Crop Cancel Button */
    selector.find("#gauci-crop-cancel").on("click", function () {
      selector.find("#gauci-crop-btns").addClass("disabled");
      selector.find("#gauci-crop-style").select2("enable");
      selector.find("#gauci-crop-style").val("");
      selector.find("#gauci-crop-style").trigger("change");
      canvas.remove(overlay);
      canvas.remove(clipPath);
    });
    /* Crop Apply Button */
    selector.find("#gauci-crop-apply").on("click", function () {
      var answer = window.confirm(gauciParams.question3);
      if (answer) {
        selector.find("#gauci-crop-btns").addClass("disabled");
        selector.find("#gauci-crop-style").select2("enable");
        selector.find("#gauci-crop-style").val("");
        selector.find("#gauci-crop-style").trigger("change");
        canvas.setZoom(1);
        selector.find("#gauci-img-zoom").val(100);
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
        selector.find("#gauci-canvas-img-wrap").imagesLoaded(function () {
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
            canvas.fire("gauci:history", {
              type: "BG",
              text: gauciParams.cropped,
            });
          }, 500);
        });
      }
    });
    /* Crop Width Input */
    selector.find("#gauci-crop-width").bind("input paste", function () {
      if (selector.find("#gauci-crop-lock").hasClass("active")) {
        var width = $(this).data("max");
        var height = selector.find("#gauci-crop-height").data("max");
        var ratio = width / height;
        selector.find("#gauci-crop-height").val(Math.round(this.value / ratio));
      }
      clipPath.set("width", parseInt($(this).val()));
      clipPath.set(
        "height",
        parseInt(selector.find("#gauci-crop-height").val())
      );
      canvas.requestRenderAll();
    });
    /* Crop Height Input */
    selector.find("#gauci-crop-height").bind("input paste", function () {
      if (selector.find("#gauci-crop-lock").hasClass("active")) {
        var height = $(this).data("max");
        var width = selector.find("#gauci-crop-width").data("max");
        var ratio = height / width;
        selector.find("#gauci-crop-width").val(Math.round(this.value / ratio));
      }
      clipPath.set("height", parseInt($(this).val()));
      clipPath.set("width", parseInt(selector.find("#gauci-crop-width").val()));
      canvas.requestRenderAll();
    });
    /* Resize Canvas */
    function resizeCanvas() {
      var inputWidth = parseInt(selector.find("#gauci-resize-width").val());
      var inputHeight = parseInt(selector.find("#gauci-resize-height").val());
      originalWidth = inputWidth;
      originalHeight = inputHeight;
      canvas.setZoom(1);
      selector.find("#gauci-img-zoom").val(100);
      canvas.setWidth(inputWidth);
      canvas.setHeight(inputHeight);
      if (rotate == 0 || rotate == 180 || rotate == -180) {
        scaleX = canvas.width / selector.find("#gauci-canvas-img")[0].width;
        scaleY = canvas.height / selector.find("#gauci-canvas-img")[0].height;
      } else {
        scaleX = canvas.height / selector.find("#gauci-canvas-img")[0].width;
        scaleY = canvas.width / selector.find("#gauci-canvas-img")[0].height;
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
      selector.find("#gauci-canvas-img-wrap").imagesLoaded(function () {
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
          canvas.fire("gauci:history", {
            type: "BG",
            text: gauciParams.resized,
          });
        }, 500);
      });
    }
    /* Resize Canvas Button */
    selector.find("#gauci-resize-apply").on("click", function () {
      var answer = window.confirm(gauciParams.question4);
      if (answer) {
        resizeCanvas();
      }
    });
    /* Resize Width Input */
    selector.find("#gauci-resize-width").bind("input paste", function () {
      if (selector.find("#gauci-resize-lock").hasClass("active")) {
        var width = $(this).data("size");
        var height = selector.find("#gauci-resize-height").data("size");
        var ratio = width / height;
        selector
          .find("#gauci-resize-height")
          .val(Math.round(this.value / ratio));
      }
    });
    /* Resize Height Input */
    selector.find("#gauci-resize-height").bind("input paste", function () {
      if (selector.find("#gauci-resize-lock").hasClass("active")) {
        var height = $(this).data("size");
        var width = selector.find("#gauci-resize-width").data("size");
        var ratio = height / width;
        selector
          .find("#gauci-resize-width")
          .val(Math.round(this.value / ratio));
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
      canvas.fire("gauci:history", {
        type: "BG",
        text: gauciParams.rotated,
      });
    }
    /* Rotate Right */
    selector.find("#gauci-rotate-right").on("click", function () {
      rotateCanvas("right");
    });
    /* Rotate Left */
    selector.find("#gauci-rotate-left").on("click", function () {
      rotateCanvas("left");
    });
    /* Flip X */
    selector.find("#gauci-flip-horizontal").on("click", function () {
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
      canvas.fire("gauci:history", {
        type: "BG",
        text: gauciParams.flipped,
      });
    });
    /* Flip Y */
    selector.find("#gauci-flip-vertical").on("click", function () {
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
      canvas.fire("gauci:history", {
        type: "BG",
        text: gauciParams.flipped,
      });
    });
    /* Brightness Toggle */
    selector.find("#gauci-brightness").on("change", function () {
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
        addToHistory(gauciParams.bg + " " + gauciParams.edited);
      }
    });
    /* Contrast Toggle */
    selector.find("#gauci-contrast").on("change", function () {
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
        addToHistory(gauciParams.bg + " " + gauciParams.edited);
      }
    });
    /* Saturation Toggle */
    selector.find("#gauci-saturation").on("change", function () {
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
        addToHistory(gauciParams.bg + " " + gauciParams.edited);
      }
    });
    /* Hue Toggle */
    selector.find("#gauci-hue").on("change", function () {
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
        addToHistory(gauciParams.bg + " " + gauciParams.edited);
      }
    });
    /* Filters */
    selector
      .find("#gauci-filters input[type=checkbox]")
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
          addToHistory(gauciParams.bg + " " + gauciParams.edited);
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
    selector.find("#gauci-image-filter-name").css({
      cursor: "pointer",
      border: "1px solid #ccc",
      padding: "5px",
      "text-align": "center",
    });

    selector.find("#gauci-image-filter-name").on("click", function () {
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
    selector.find("#gauci-gamma").on("change", function () {
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
    selector.find("#gauci-gamma-settings input").on("input", function () {
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
    selector.find("#gauci-gamma-settings input").on("change", function (e) {
      if (e.originalEvent) {
        addToHistory(gauciParams.bg + " " + gauciParams.edited);
      }
    });
    /* Blur Toggle */
    selector.find("#gauci-blur").on("change", function () {
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
        addToHistory(gauciParams.bg + " " + gauciParams.edited);
      }
    });
    /* Noise Toggle */
    selector.find("#gauci-noise").on("change", function () {
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
        addToHistory(gauciParams.bg + " " + gauciParams.edited);
      }
    });
    /* Pixelate Toggle */
    selector.find("#gauci-pixelate").on("change", function () {
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
        addToHistory(gauciParams.bg + " " + gauciParams.edited);
      }
    });
    /* Blend Color Toggle */
    selector.find("#gauci-blend-color").on("change", function () {
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
    selector.find("#gauci-duotone-color").on("change", function () {
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
    selector.find("#gauci-swap-apply").on("click", function () {
      var swapColors = new fabric.Image.filters.SwapColor({
        colorSource: selector.find("#color-source").val(),
        colorDestination: selector.find("#color-destination").val(),
      });
      canvas.backgroundImage.filters.push(swapColors);
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
      $(this).prop("disabled", true);
      selector.find("#gauci-swap-remove").prop("disabled", false);
    });
    /* Swap Colors Remove */
    selector.find("#gauci-swap-remove").on("click", function () {
      canvas.backgroundImage.filters = canvas.backgroundImage.filters.filter(
        (element) => element.type != "SwapColor"
      );
      canvas.backgroundImage.applyFilters();
      canvas.requestRenderAll();
      $(this).prop("disabled", true);
      selector.find("#gauci-swap-apply").prop("disabled", false);
    });
    /* Swap Colors Toggle */
    selector.find("#gauci-swap-colors").on("change", function () {
      if (!$(this).is(":checked")) {
        selector.find("#gauci-swap-remove").trigger("click");
      }
    });
    /* Shadow Fields */
    var shadowFields = ["text", "image", "shape", "element"];
    $.each(shadowFields, function (index, value) {
      selector.find("#gauci-" + value + "-shadow").on("change", function () {
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
        selector.find("#gauci-" + value + "-gradient").val()
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
      if (selector.find("#gauci-" + value + "-gradient").val() == "vertical") {
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
        selector.find("#gauci-" + value + "-gradient").val() == "horizontal"
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
        obj.set("fill", selector.find("#gauci-" + value + "-color").val());
        if (obj.objectType == "element") {
          if (obj._objects) {
            for (i = 0; i < obj._objects.length; i++) {
              if (obj._objects[i].fill != "") {
                obj._objects[i].set(
                  "fill",
                  selector.find("#gauci-" + value + "-color").val()
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
      selector.find("#gauci-" + value + "-gradient").on("change", function () {
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
    // function getScaledSize() {
    //   var width = canvas.backgroundImage.getScaledHeight();
    //   var height = canvas.backgroundImage.getScaledWidth();
    //   if (rotate == 0 || rotate == 180 || rotate == -180) {
    //     width = canvas.backgroundImage.getScaledWidth();
    //     height = canvas.backgroundImage.getScaledHeight();
    //   }
    //   return [width, height];
    // }
    function getScaledSize() {
      if (!canvas.backgroundImage) {
        console.error("No background image found.");
        return [2048, 2048]; // Return default values to avoid further errors
      }

      let width = canvas.backgroundImage.getScaledHeight();
      let height = canvas.backgroundImage.getScaledWidth();
      if (rotate === 0 || rotate === 180 || rotate === -180) {
        width = canvas.backgroundImage.getScaledWidth();
        height = canvas.backgroundImage.getScaledHeight();
      }
      return [width, height];
    }

    /* Add Text */
    selector.find("#gauci-add-text").on("click", function () {
      var text = new fabric.Textbox(gauciParams.textbox, {
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
      canvas.fire("gauci:history", {
        type: "textbox",
        text: gauciParams.added,
      });
    });
    /* Set Text Settings */
    function setTextSettings(text) {
      selector.find("#gauci-text-input").val(text.text);
      selector.find("#gauci-font-family").val(text.fontFamily);
      selector.find("#gauci-font-family").trigger("change");
      if (text.gradientFill == "none") {
        selector.find("#gauci-text-gradient").val("none");
        selector.find("#gauci-text-color").spectrum("set", text.fill);
      } else if (text.gradientFill == "vertical") {
        selector.find("#gauci-text-gradient").val("vertical");
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
        selector.find("#gauci-text-gradient").val("horizontal");
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
      selector.find("#gauci-text-gradient").trigger("change");
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
      selector.find("#gauci-font-size").val(text.fontSize);
      selector.find("#gauci-outline-size").val(text.strokeWidth);
      selector.find("#gauci-line-height").val(text.lineHeight);
      selector.find("#gauci-letter-spacing").val(text.charSpacing);
      selector.find("#gauci-outline-color").spectrum("set", text.stroke);
      selector
        .find("#gauci-text-background")
        .spectrum("set", text.textBackgroundColor);
      if (text.shadow == null) {
        selector.find("#gauci-text-shadow").prop("checked", false);
      } else {
        selector.find("#gauci-text-shadow").prop("checked", true);
        selector.find("#text-shadow-color").spectrum("set", text.shadow.color);
        selector.find("#text-shadow-blur").val(text.shadow.blur);
        selector.find("#text-shadow-offset-x").val(text.shadow.offsetX);
        selector.find("#text-shadow-offset-y").val(text.shadow.offsetY);
      }
      selector.find("#gauci-text-shadow").trigger("change");
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
    selector.find("#gauci-text-input").bind("input paste", function () {
      canvas.getActiveObject().set("text", $(this).val());
      selector
        .find("#gauci-layers #" + canvas.getActiveObject().id + " .layer-name")
        .html(canvas.getActiveObject().text);
      canvas.requestRenderAll();
    });
    selector.find("#gauci-text-input").bind("focusout", function () {
      canvas.fire("gauci:history", {
        type: "textbox",
        text: gauciParams.edited,
      });
    });
    /* Font Family */
    selector.find("#gauci-font-family").on("change", function () {
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
            canvas.fire("gauci:history", {
              type: "textbox",
              text: gauciParams.edited,
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
    selector.find("#gauci-font-family").on("select2:open", function () {
      selector.find("#select2-gauci-font-family-results").scroll(function () {
        $(this)
          .find("li:last-child")
          .find("ul li")
          .each(function () {
            var item = $(this);
            if (
              item.is(":in-viewport( 0, #select2-gauci-font-family-results)")
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
              .find("#select2-gauci-font-family-results")
              .trigger("scroll");
          }, 500);
        }
      );
    });
    /* Text Format Buttons */
    selector
      .find("#gauci-text-format-btns > .gauci-btn")
      .on("click", function () {
        if ($(this).attr("id") == "format-uppercase") {
          var text = selector.find("#gauci-text-input").val();
          if (text === text.toUpperCase()) {
            text = text.toLowerCase();
          } else {
            text = text.toUpperCase();
          }
          selector.find("#gauci-text-input").val(text);
          selector.find("#gauci-text-input").trigger("input");
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
        canvas.fire("gauci:history", {
          type: "textbox",
          text: gauciParams.edited,
        });
      });
    /* Text Numeric Fields */
    selector
      .find("#gauci-text-settings input[type=number]")
      .bind("input paste keyup keydown", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "gauci-font-size") {
          canvas.getActiveObject().set("fontSize", parseInt(val));
        } else if ($(this).attr("id") == "gauci-outline-size") {
          canvas.getActiveObject().set("strokeWidth", parseInt(val));
        } else if ($(this).attr("id") == "gauci-line-height") {
          canvas.getActiveObject().set("lineHeight", parseFloat(val));
        } else if ($(this).attr("id") == "gauci-letter-spacing") {
          canvas.getActiveObject().set("charSpacing", parseInt(val));
        }
        canvas.requestRenderAll();
      });
    selector
      .find("#gauci-text-settings input[type=number]")
      .bind("input", function () {
        window.clearTimeout(timeOut);
        timeOut = setTimeout(function () {
          canvas.fire("gauci:history", {
            type: "textbox",
            text: gauciParams.edited,
          });
        }, 500);
      });
    /* Text Color Fields */
    selector
      .find("#gauci-text-settings .gauci-colorpicker")
      .bind("change", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "gauci-text-color") {
          canvas.getActiveObject().set("fill", val);
        } else if ($(this).attr("id") == "gauci-outline-color") {
          canvas.getActiveObject().set("stroke", val);
        } else if ($(this).attr("id") == "gauci-text-background") {
          canvas.getActiveObject().set("textBackgroundColor", val);
        }
        canvas.requestRenderAll();
        canvas.fire("gauci:history", {
          type: "textbox",
          text: gauciParams.edited,
        });
      });
    /* Text Flip Buttons */
    selector
      .find("#gauci-text-flip-btns > .gauci-btn")
      .on("click", function () {
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
        canvas.fire("gauci:history", {
          type: "textbox",
          text: gauciParams.edited,
        });
      });
    /* Text Skew, Rotate, Opacity */
    selector
      .find("#gauci-text-settings input[type=range]")
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
      .find("#gauci-text-settings input[type=range]")
      .bind("change", function () {
        canvas.fire("gauci:history", {
          type: "textbox",
          text: gauciParams.edited,
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
        selector.find("#gauci-image-shadow").prop("checked", false);
      } else {
        selector.find("#gauci-image-shadow").prop("checked", true);
        selector.find("#image-shadow-color").spectrum("set", img.shadow.color);
        selector.find("#image-shadow-blur").val(img.shadow.blur);
        selector.find("#image-shadow-offset-x").val(img.shadow.offsetX);
        selector.find("#image-shadow-offset-y").val(img.shadow.offsetY);
      }
      selector.find("#gauci-image-shadow").trigger("change");
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
    // selector.find("#gauci-img-upload").on("change", function(e) {
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
    // 	canvas.fire("gauci:history", {
    // 		type: "image",
    // 		text: gauciParams.added,
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
    selector.find("#gauci-img-upload").on("change", function (e) {
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
            selector.find("#gauci-img-upload").val("");
          };
        });
      };
      reader.readAsDataURL(e.target.files[0]);
      canvas.fire("gauci:history", {
        type: "image",
        text: gauciParams.added,
      });
    });
    /* Upload Overlay Image */
    selector.find("#gauci-overlay-img-upload").on("change", function (e) {
      if ($(this).val() == "") {
        return;
      }
      selector.find("#gauci-canvas-loader").css("display", "flex");
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
          selector.find("#gauci-overlay-wrap").show();
          selector
            .find("#gauci-overlay-preview")
            .attr("src", event.target.result);
          setTimeout(function () {
            selector.find("#gauci-canvas-loader").hide();
          }, 500);
        });
      };
      reader.readAsDataURL(e.target.files[0]);
      canvas.fire("gauci:history", {
        type: "image",
        text: gauciParams.added,
      });
    });
    /* Delete Overlay Image */
    selector.find("#gauci-overlay-delete").on("click", function () {
      if (
        typeof canvas.overlayImage !== "undefined" &&
        canvas.overlayImage !== null
      ) {
        canvas.overlayImage = null;
        selector.find("#gauci-overlay-wrap").hide();
        selector.find("#gauci-overlay-preview").attr("src", "");
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
    var dropdown = $("#gauci-canvas-shape-container .custom-dropdown");
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

    // $(document).ready(function () {
    //   setTimeout(function () {
    //     AddingImage();
    //     console.log("image is adding");
    //   }, 400);
    // });

    // var preservedImage;
    // var layoutSource = null; // Renamed from imgUrl

    // // Fetch image data from the API
    // async function fetchImageData() {
    //   try {
    //     // const response = await fetch(`${baseUrl}/api/v1/product/all`);
    //     // const data = await response.json();
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const productId = urlParams.get("id");
    //     const response = await fetch(
    //       `${baseUrl}/api/v1/product/get/${productId}`
    //     );
    //     const data = await response.json();
    //     console.log(data);
    //     const product = data.product;

    //     if (product && product.linkedMeshImageData) {
    //       const linkedMeshImageData = product.linkedMeshImageData;

    //       // Get the tab container
    //       const tabContainer = document.querySelector(".gauci-tab-cont");

    //       // Clear any existing tabs (optional, if necessary)
    //       tabContainer.innerHTML = "";

    //       // Loop through the array to create tabs
    //       linkedMeshImageData.forEach((meshData, index) => {
    //         const tabDiv = document.createElement("div");
    //         const tabContent = document.createElement("div");

    //         tabContent.classList.add("gauci-open-page");
    //         tabContent.textContent = `${meshData.meshName || "Unnamed"}`;

    //         tabDiv.appendChild(tabContent);

    //         // Set the first tab as active by default
    //         if (index === 0) {
    //           tabDiv.classList.add("active");
    //           layoutSource = meshData.layoutUrl; // Set the initial layoutSource
    //           console.log("Initial layoutSource:", layoutSource);
    //         }

    //         // Add click event listener for each tab
    //         tabDiv.addEventListener("click", () => {
    //           // Remove "active" class from all tabs
    //           const allTabs = tabContainer.querySelectorAll("div");
    //           allTabs.forEach((t) => t.classList.remove("active"));

    //           // Add "active" class to the clicked tab
    //           tabDiv.classList.add("active");

    //           // Update layoutSource dynamically
    //           layoutSource = meshData.layoutUrl;
    //           console.log("Updated layoutSource:", layoutSource);
    //         });

    //         tabContainer.appendChild(tabDiv);
    //       });

    //       console.log("Tabs created successfully.");
    //     } else {
    //       console.error("No linkedMeshImageData found in the product.");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching image data:", error);
    //   }
    // }

    // async function AddingImage() {
    //   console.log("adding image");

    //   // Fetch image data first
    //   await fetchImageData();

    //   // Proceed only if layoutSource is available
    //   if (layoutSource) {
    //     console.log("png image filepath ", layoutSource);

    //     // Delay the execution by 2 seconds (2000 milliseconds)
    //     setTimeout(() => {
    //       fabric.Image.fromURL(layoutSource, function (img) {
    //         img.set({
    //           selectable: false,
    //           evented: false,
    //           hasControls: false,
    //           customId: "layoutImage",
    //           isPreservedObject: true,
    //         });

    //         // Apply specific scaling if name is 'p3-type1'
    //         const urlParams = new URLSearchParams(window.location.search);
    //         const name = urlParams.get("name");
    //         if (name === "p3-type1") {
    //           img.scaleX = 2;
    //           img.scaleY = 2;
    //         }

    //         preservedImage = img;
    //         canvas.add(img);
    //         canvas.renderAll();
    //         onlyDeleteLayerEvent(img.id);
    //       });
    //     }, 1000); // 2 seconds delay
    //   } else {
    //     console.error("No layout source found. Image loading skipped.");
    //   }
    // }
    // var preservedImage = null; // Declare preservedImage at the top
    // var layoutSource = null; // Renamed from imgUrl
    // async function fetchImageData() {
    //   try {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const productId = urlParams.get("id");
    //     const response = await fetch(
    //       `${baseUrl}/api/v1/product/get/${productId}`
    //     );
    //     const data = await response.json();
    //     console.log(data);
    //     const product = data.product;

    //     if (product && product.linkedMeshImageData) {
    //       const linkedMeshImageData = product.linkedMeshImageData;

    //       // Get the tab container
    //       const tabContainer = document.querySelector(".gauci-tab-cont");

    //       // Clear any existing tabs (optional, if necessary)
    //       tabContainer.innerHTML = "";

    //       // Loop through the array to create tabs
    //       linkedMeshImageData.forEach((meshData, index) => {
    //         const tabDiv = document.createElement("div");
    //         const tabContent = document.createElement("div");

    //         tabContent.classList.add("gauci-open-page");
    //         tabContent.textContent = `${meshData.meshName || "Unnamed"}`;

    //         tabDiv.appendChild(tabContent);

    //         // Set the first tab as active by default
    //         if (index === 0) {
    //           tabDiv.classList.add("active");
    //           layoutSource = meshData.layoutUrl; // Set the initial layoutSource
    //           console.log("Initial layoutSource:", layoutSource);
    //           AddingImage(); // Add the first image by default
    //         }

    //         // Add click event listener for each tab
    //         tabDiv.addEventListener("click", () => {
    //           // Remove "active" class from all tabs
    //           const allTabs = tabContainer.querySelectorAll("div");
    //           allTabs.forEach((t) => t.classList.remove("active"));

    //           // Add "active" class to the clicked tab
    //           tabDiv.classList.add("active");

    //           // Update layoutSource dynamically
    //           layoutSource = meshData.layoutUrl;
    //           // console.log("Updated layoutSource:", layoutSource);

    //           // Re-add the updated image
    //           AddingImage();
    //         });

    //         tabContainer.appendChild(tabDiv);
    //       });

    //       console.log("Tabs created successfully.");
    //     } else {
    //       console.error("No linkedMeshImageData found in the product.");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching image data:", error);
    //   }
    // }

    // async function AddingImage() {
    //   // console.log("Adding image");

    //   // Ensure layoutSource is available
    //   if (layoutSource) {
    //     // console.log("PNG image filepath:", layoutSource);

    //     // Remove the previous image from the canvas
    //     if (preservedImage) {
    //       canvas.remove(preservedImage);
    //     }

    //     // Delay the execution to allow layoutSource to be fully updated
    //     setTimeout(() => {
    //       fabric.Image.fromURL(layoutSource, function (img) {
    //         img.set({
    //           selectable: false,
    //           evented: false,
    //           hasControls: false,
    //           customId: "layoutImage",
    //           isPreservedObject: true,
    //         });

    //         // Apply specific scaling if name is 'p3-type1'
    //         const urlParams = new URLSearchParams(window.location.search);
    //         const name = urlParams.get("name");
    //         if (name === "p3-type1") {
    //           img.scaleX = 2;
    //           img.scaleY = 2;
    //         }

    //         preservedImage = img;
    //         canvas.add(img);
    //         canvas.renderAll();
    //         onlyDeleteLayerEvent(img.id);
    //       });
    //     }, 100); // Optional delay for smoother user experience
    //   } else {
    //     console.error("No layout source found. Image loading skipped.");
    //   }
    // }

    // // On document ready, fetch image data
    // $(document).ready(function () {
    //   setTimeout(function () {
    //     fetchImageData();
    //     console.log("Fetching image data and setting tabs.");
    //   }, 400);
    // });

    let tabCanvasStates = {}; // To store canvas JSON state for each tab
    let activeTabId = null; // To track the currently active tab
    let preservedImage = null; // To manage the layout image
    let layoutSource = null; // URL of the current layout image
    let allCanvasTabState = {};
    let mainPart = null;

    // Function to fetch image data and set up tabs
    async function fetchImageData() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("id");
        const response = await fetch(
          `${baseUrl}/api/v1/product/get/${productId}`
        );
        const data = await response.json();
        console.log(data);

        const product = data.product;
        console.log(product);
        mainPart = product?.mainPart?.meshName;
        console.log(mainPart);

        if (product && product.linkedMeshImageData) {
          const linkedMeshImageData = product.linkedMeshImageData;

          // Get the tab container
          const tabContainer = document.querySelector(".gauci-tab-cont");

          // Clear any existing tabs (optional, if necessary)
          tabContainer.innerHTML = "";

          // Loop through the array to create tabs
          linkedMeshImageData.forEach((meshData, index) => {
            const tabDiv = document.createElement("div");
            const tabContent = document.createElement("div");

            tabContent.classList.add("gauci-open-page");
            // tabContent.textContent = `${meshData.meshName || "Unnamed"}`;
            const fullName = meshData.meshName || "Unnamed";
            tabContent.textContent =
              fullName.slice(0, 6) + (fullName.length > 6 ? "…" : "");

            tabDiv.appendChild(tabContent);

            // Generate a unique ID for the tab
            const tabId = meshData.meshName || `tab-${index}`;

            // Initialize the state for each tab
            if (index === 0) {
              // Set the first tab as active
              tabDiv.classList.add("active");
              activeTabId = tabId;
              tabCanvasStates[tabId] = null; // Initialize with an empty state
              layoutSource = meshData.layoutUrl; // Set the initial layoutSource
              AddingImage(); // Add the first image by default
            }

            // Add click event listener for each tab
            // tabDiv.addEventListener("click", () => {
            //   const previousTabId = activeTabId;

            //   // Save the current tab's canvas state
            //   saveCanvasState(previousTabId);

            //   // Switch to the new tab
            //   activeTabId = tabId;

            //   // Clear the existing canvas
            //   canvas.clear();

            //   // Load the new tab's canvas state
            //   loadCanvasState(tabId);

            //   // Update layoutSource dynamically for the new tab
            //   layoutSource = meshData.layoutUrl;

            //   // Update the tab's "active" class
            //   const allTabs = tabContainer.querySelectorAll("div");
            //   allTabs.forEach((t) => t.classList.remove("active"));
            //   tabDiv.classList.add("active");
            // });
            // tabDiv.addEventListener("click", () => {
            //   document.querySelector("#gauci-canvas-loader").style.display =
            //     "flex"; // Show loader

            //   setTimeout(() => {
            //     saveCanvasState(activeTabId);
            //     activeTabId = tabId;
            //     canvas.clear();
            //     loadCanvasState(tabId);
            //     layoutSource = meshData.layoutUrl;

            //     tabContainer
            //       .querySelectorAll("div")
            //       .forEach((t) => t.classList.remove("active"));
            //     tabDiv.classList.add("active");

            //     document.querySelector("#gauci-canvas-loader").style.display =
            //       "none"; // Hide loader
            //   }, 1000);
            // });
            // tabDiv.addEventListener("click", () => {
            //   document.querySelector("#gauci-canvas-loader").style.display =
            //     "flex"; // Show loader immediately

            //   // Wait for next event loop tick to let loader render before heavy work starts
            //   requestAnimationFrame(() => {
            //     // Heavy operations start here
            //     saveCanvasState(activeTabId);
            //     activeTabId = tabId;
            //     canvas.clear();
            //     loadCanvasState(tabId);
            //     layoutSource = meshData.layoutUrl;

            //     tabContainer
            //       .querySelectorAll("div")
            //       .forEach((t) => t.classList.remove("active"));
            //     tabDiv.classList.add("active");

            //     // Hide loader after small delay to allow canvas to load properly
            //     setTimeout(() => {
            //       document.querySelector("#gauci-canvas-loader").style.display =
            //         "none"; // Hide loader
            //     }, 500); // can adjust based on loadCanvasState timing
            //   });
            // });
            tabDiv.addEventListener("click", () => {
              // Disable all tabs temporarily
              tabContainer.style.pointerEvents = "none";

              // Show loader
              document.querySelector("#gauci-canvas-loader").style.display =
                "flex";

              requestAnimationFrame(() => {
                saveCanvasState(activeTabId);
                activeTabId = tabId;
                canvas.clear();
                loadCanvasState(tabId);
                layoutSource = meshData.layoutUrl;

                tabContainer
                  .querySelectorAll("div")
                  .forEach((t) => t.classList.remove("active"));
                tabDiv.classList.add("active");

                // Hide loader and re-enable tab clicks after short delay
                setTimeout(() => {
                  document.querySelector("#gauci-canvas-loader").style.display =
                    "none";
                  tabContainer.style.pointerEvents = "auto"; // Re-enable clicks
                }, 500); // Adjust delay as needed
              });
            });

            tabContainer.appendChild(tabDiv);
          });

          console.log("Tabs created successfully.");
          var params = new URLSearchParams(window.location.search);
          // var name = params.get("name");
          // var id = params.get("id");
          // var templateName = params.get("templateName");
          var key = params.get("key");
          if (key) {
            loadTemplateFromUrl();
          }
        } else {
          console.error("No linkedMeshImageData found in the product.");
        }
      } catch (error) {
        console.error("Error fetching image data:", error);
      }
    }

    // Function to add the layout image to the canvas
    async function AddingImage() {
      if (layoutSource) {
        if (preservedImage) {
          canvas.remove(preservedImage);
        }

        setTimeout(() => {
          fabric.Image.fromURL(layoutSource, function (img) {
            img.set({
              selectable: false,
              evented: false,
              hasControls: false,
              customId: "layoutImage",
              isPreservedObject: true,
            });

            // Apply specific scaling if necessary
            const urlParams = new URLSearchParams(window.location.search);
            const name = urlParams.get("name");
            if (name === "p3-type1") {
              img.scaleX = 2;
              img.scaleY = 2;
            }

            preservedImage = img;
            canvas.add(img);
            canvas.renderAll();
          });
        }, 100); // Optional delay for smoother user experience
      } else {
        console.error("No layout source found. Image loading skipped.");
      }
    }

    // Save the canvas state for a given tab
    // function saveCanvasState(tabId) {
    //   if (tabId !== null && canvas) {
    //     const state = JSON.stringify(canvas.toJSON());
    //     tabCanvasStates[tabId] = state; // Store the state
    //     allCanvasTabState = tabCanvasStates;
    //     console.log(allCanvasTabState);
    //     console.log(`Saved canvas state for Tab ${tabId}`);

    //     const output = Object.keys(allCanvasTabState).map((key) => ({
    //       part: key,
    //       jsonData: JSON.parse(allCanvasTabState[key]),
    //     }));

    //     console.log(output);

    //     // const originalFormat = {};
    //     // output.forEach((item) => {
    //     //   originalFormat[item.part] = JSON.stringify(item.jsonData);
    //     // });

    //     // console.log(originalFormat);
    //   }
    // }

    function saveCanvasState(tabId) {
      if (tabId !== null && canvas) {
        const state = JSON.stringify(canvas.toJSON()); // Save the entire canvas JSON
        tabCanvasStates[tabId] = state; // Store the state
        allCanvasTabState = tabCanvasStates;
        console.log(allCanvasTabState);
        console.log(`Saved canvas state for Tab ${tabId}`);

        const output = Object.keys(allCanvasTabState).map((key) => ({
          part: key,
          jsonData: JSON.parse(allCanvasTabState[key]),
        }));

        console.log(output);

        const originalFormat = {};
        output.forEach((item) => {
          originalFormat[item.part] = JSON.stringify(item.jsonData);
        });

        console.log(originalFormat);
      }
    }

    // function loadCanvasState(tabId) {
    //   console.log("Canvas before load:", canvas);
    //   if (tabCanvasStates[tabId]) {
    //     canvas.loadFromJSON(tabCanvasStates[tabId], () => {
    //       // Render all objects on the canvas
    //       canvas.renderAll();
    //       console.log(canvas.toJSON());
    //       const allObjects = canvas.getObjects();
    //       console.log(allObjects, "All Canvas Objects");
    //       // Ensure the background image has the desired properties after loading
    //       if (canvas) {
    //         // const objects = canvas.getObjects();
    //         // console.log(objects);
    //         const targetObject = allObjects.find(
    //           (obj) => obj.type === "image" && obj.src.startsWith("http")
    //         );
    //         console.log(targetObject);

    //         if (targetObject) {
    //           // Set properties for the found object
    //           targetObject.set({
    //             selectable: false,
    //             evented: false,
    //             hasControls: false,
    //           });
    //         }

    //         const targetMaskObject = allObjects.find(
    //           (obj) => obj.type === "image" && obj.clipPath
    //         );
    //         console.log(targetMaskObject);
    //         if (targetMaskObject) {
    //           storedActiveObject = targetMaskObject;
    //           storedClipPath = targetMaskObject.clipPath;
    //           console.log(storedActiveObject);
    //           console.log(storedClipPath.top, storedClipPath.left);
    //           // addClipMask(targetMaskObject.clipPath, targetMaskObject);
    //           applyTemplateClipMask(targetMaskObject);
    //           handleMaskingDone();
    //           syncClipPathWithImage(
    //             targetMaskObject.clipPath,
    //             targetMaskObject
    //           );
    //         }

    //         canvas.renderAll();
    //         console.log(canvas.toJSON());
    //       }
    //       // console.log("Reattaching event listeners...");
    //       // logSelectedObject(canvas);
    //       console.log(`Loaded canvas state for Tab ${tabId}`);
    //       console.log(activeTabId);
    //       console.log(tabCanvasStates);
    //     });
    //   } else {
    //     AddingImage(); // Load the default layout image for the tab
    //     console.log(`No saved state for Tab ${tabId}. Starting fresh.`);
    //     // logSelectedObject(canvas);
    //   }
    // }

    // function loadCanvasState(tabId) {
    //   editButtonActive = false;
    //   console.log("Canvas before load:", canvas);
    //   console.log(editButtonActive);
    //   if (tabCanvasStates[tabId]) {
    //     canvas.loadFromJSON(tabCanvasStates[tabId], () => {
    //       // Render all objects on the canvas
    //       canvas.renderAll();
    //       console.log(canvas.toJSON());
    //       const allObjects = canvas.getObjects();
    //       console.log(allObjects, "All Canvas Objects");
    //       // Ensure the background image has the desired properties after loading
    //       if (canvas) {
    //         // const objects = canvas.getObjects();
    //         // console.log(objects);
    //         const targetObject = allObjects.find(
    //           (obj) => obj.type === "image" && obj.src.startsWith("http")
    //         );
    //         console.log(targetObject);

    //         if (targetObject) {
    //           // Set properties for the found object
    //           targetObject.set({
    //             selectable: false,
    //             evented: false,
    //             hasControls: false,
    //           });
    //         }

    //         const targetMaskObject = allObjects.find(
    //           (obj) => obj.type === "image" && obj.clipPath
    //         );
    //         console.log(targetMaskObject);
    //         if (targetMaskObject) {
    //           storedActiveObject = targetMaskObject;
    //           storedClipPath = targetMaskObject.clipPath;
    //           // console.log(storedActiveObject);
    //           // console.log(storedClipPath.top, storedClipPath.left);
    //           // // addClipMask(targetMaskObject.clipPath, targetMaskObject);
    //           // applyTemplateClipMask(targetMaskObject);
    //           // handleMaskingDone();
    //           // syncClipPathWithImage(
    //           //   targetMaskObject.clipPath,
    //           //   targetMaskObject
    //           // );
    //           //       storedActiveObject = selected;
    //           // storedClipPath = selected.clipPath;
    //           let path = targetMaskObject.clipPath.path;
    //           console.log("Stored object:", storedActiveObject);
    //           console.log(
    //             "Clip path position:",
    //             storedClipPath?.top,
    //             storedClipPath?.left
    //           );

    //           shell = new fabric.Path(path, {
    //             fill: "", // Transparent shell
    //             stroke: "black",
    //             strokeWidth: 2,
    //             scaleX: storedClipPath.scaleX,
    //             scaleY: storedClipPath.scaleY,
    //             lockScalingX: false,
    //             lockScalingY: false,
    //             lockSkewingX: true,
    //             lockSkewingY: true,
    //             originX: storedClipPath.originX,
    //             originY: storedClipPath.originY,
    //             top: storedClipPath.top,
    //             left: storedClipPath.left,
    //             selectable: true, // Make it interactive
    //           });
    //           function updateClipPathPosition() {
    //             // Update the clipPath's properties based on the shell's new position
    //             storedClipPath.set({
    //               top: shell.top,
    //               left: shell.left,
    //               angle: shell.angle,
    //               scaleX: shell.scaleX,
    //               scaleY: shell.scaleY,
    //             });

    //             // Reassign the updated clipPath to the image
    //             storedActiveObject.clipPath = storedClipPath;

    //             // Ensure canvas re-renders with changes
    //             canvas.requestRenderAll();
    //           }

    //           // Sync clipPath updates when the shell is moved, scaled, or rotated
    //           shell.on("moving", updateClipPathPosition);
    //           shell.on("scaling", updateClipPathPosition);
    //           shell.on("rotating", updateClipPathPosition);

    //           // applyTemplateClipMask(selected);

    //           handleMaskingDone();
    //           // syncClipPathWithImage(
    //           //   storedActiveObject.clipPath,
    //           //   storedActiveObject
    //           // );
    //         }

    //         canvas.renderAll();
    //         console.log(canvas.toJSON());
    //       }
    //       // console.log("Reattaching event listeners...");
    //       // logSelectedObject(canvas);
    //       console.log(`Loaded canvas state for Tab ${tabId}`);
    //       console.log(activeTabId);
    //       console.log(tabCanvasStates);
    //     });
    //   } else {
    //     AddingImage(); // Load the default layout image for the tab
    //     console.log(`No saved state for Tab ${tabId}. Starting fresh.`);
    //     // logSelectedObject(canvas);
    //   }
    // }

    // function loadCanvasState(tabId) {
    //   editButtonActive = false;

    //   if (tabCanvasStates[tabId]) {
    //     console.log(tabCanvasStates[tabId]);
    //     canvas.loadFromJSON(tabCanvasStates[tabId], () => {
    //       logSelectedObject(canvas);
    //       canvas.renderAll();
    //       console.log(canvas.toJSON());
    //       const allObjects = canvas.getObjects();
    //       // console.log(allObjects, "All Canvas Objects");

    //       if (canvas) {
    //         const targetObject = allObjects.find(
    //           (obj) => obj.type === "image" && obj.src.startsWith("http")
    //         );
    //         console.log(targetObject);

    //         if (targetObject) {
    //           targetObject.set({
    //             selectable: false,
    //             evented: false,
    //             hasControls: false,
    //           });
    //         }

    //         const targetMaskObject = allObjects.find(
    //           (obj) => obj.type === "image" && obj.clipPath
    //         );
    //         console.log(targetMaskObject);

    //         canvas.renderAll();
    //         console.log(canvas.toJSON());
    //       }
    //       console.log(`Loaded canvas state for Tab ${tabId}`);
    //       console.log(activeTabId);
    //       console.log(tabCanvasStates);
    //       logSelectedObject(canvas);
    //     });
    //   } else {
    //     AddingImage();
    //     console.log(`No saved state for Tab ${tabId}. Starting fresh.`);
    //   }

    //   console.log(
    //     "Canvas event listeners after function:",
    //     canvas.__eventListeners
    //   ); // Debug: Final check
    // }

    function loadCanvasState(tabId) {
      editButtonActive = false;

      if (tabCanvasStates[tabId]) {
        // Parse stringified JSON
        let jsonData = JSON.parse(tabCanvasStates[tabId]);

        // Modify image URLs with cache busting
        jsonData.objects.forEach((obj) => {
          if (obj.type === "image" && obj.src.startsWith("http")) {
            obj.src = `${obj.src}?t=${Date.now()}`; // Add timestamp for URLs only
          }
        });

        // Stringify modified JSON
        tabCanvasStates[tabId] = JSON.stringify(jsonData);

        console.log(tabCanvasStates[tabId]);

        // Load modified JSON into canvas
        canvas.loadFromJSON(jsonData, () => {
          logSelectedObject(canvas);
          canvas.renderAll();
          console.log(canvas.toJSON());
          const allObjects = canvas.getObjects();

          if (canvas) {
            const targetObject = allObjects.find(
              (obj) => obj.type === "image" && obj.src.startsWith("http")
            );
            console.log(targetObject);

            if (targetObject) {
              targetObject.set({
                selectable: false,
                evented: false,
                hasControls: false,
              });
            }

            const targetMaskObject = allObjects.find(
              (obj) => obj.type === "image" && obj.clipPath
            );
            console.log(targetMaskObject);

            canvas.renderAll();
            console.log(canvas.toJSON());
          }
          console.log(`Loaded canvas state for Tab ${tabId}`);
          console.log(activeTabId);
          console.log(tabCanvasStates);
          logSelectedObject(canvas);
        });
      } else {
        AddingImage();
        console.log(`No saved state for Tab ${tabId}. Starting fresh.`);
      }

      console.log(
        "Canvas event listeners after function:",
        canvas.__eventListeners
      );
    }

    // On document ready, fetch image data
    $(document).ready(function () {
      setTimeout(function () {
        fetchImageData();
        console.log("Fetching image data and setting tabs.");
      }, 400);
    });

    /*Toggel Border Tools*/

    selector.find("#gauci-border-tools").on("click", function () {
      selector.find("#gauci-border-tools-toggle").toggle();
      var arrowIcon = $(this).find(".arrow");
      arrowIcon.toggleClass("arrow-down arrow-up");
      if (arrowIcon.hasClass("arrow-up")) {
        arrowIcon.text("keyboard_arrow_up");
        $("#gauci-border-tools-wrap").addClass("active");
      } else {
        arrowIcon.text("keyboard_arrow_down");
        $("#gauci-border-tools-wrap").removeClass("active");
      }
    });

    /*Toggel Framing Tools*/

    selector.find("#gauci-framing").on("click", function () {
      selector.find("#gauci-framing-toggle").toggle();
    });
    /** Toggle Farming arrow */
    $("#gauci-framing").on("click", function () {
      var arrowIcon = $(this).find(".arrow");
      arrowIcon.toggleClass("arrow-down arrow-up");
      if (arrowIcon.hasClass("arrow-up")) {
        arrowIcon.text("keyboard_arrow_up");
        $("#gauci-framing-wrapper").addClass("active");
      } else {
        arrowIcon.text("keyboard_arrow_down");
        $("#gauci-framing-wrapper").removeClass("active");
      }
    });

    /** Toggle Active container */
    // $("#gauci-mydiv").click(function() {
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
    selector.find(".gauci-mask-shape-select-option").on("click", function (e) {
      var selected = $(this).data("value");
      isAdded = true;
      // activeMaskButton();
      if (selected == "custom") {
        selector.find("#gauci-img-radius-settings").removeClass("d-none");
      } else {
        selector.find("#gauci-img-radius-settings").addClass("d-none");
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
      //     gauciParams.mask +
      //     " " +
      //     gauciParams.added
      //   );
      // }, 100);
    });

    function onlyDeleteLayerEvent(id) {
      var item = selector.find("#gauci-layers #" + id);
      item.remove();
      selector.find("#gauci-layers").sortable("refresh");
      checkLayers();
    }

    function setLayerSort(id, sortIndex) {
      var item = selector.find("#gauci-layers #" + id);
      item.attr("data-sort", sortIndex);
      selector.find("#gauci-layers").sortable("refresh");
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

    // function logSelectedObject(canvas) {
    //   canvas.on("object:selected", function (e) {
    //     const selectedObject = e.target;
    //     console.log("User selected object:", selectedObject);
    //   });
    // }
    // logSelectedObject(canvas);

    let storedActiveObject = null;
    let storedClipPath = null;
    let clipPathOffset = { top: 0, left: 0 };
    let shell = null;
    let editButtonActive = true;

    function addClipMask(path, activeObject) {
      console.log("this is the active path and all", path, activeObject);
      editButtonActive = true;
      console.log(canvas.toJSON());
      var uniqueId = "clipmask";
      var desiredWidth = 700;
      var desiredHeight = 700;

      if (activeObject) {
        activeObject.customId = uniqueId;
        var objects = canvas.getObjects();
        console.log(objects);
        var pathObjects = objects.filter((obj) => obj.type === "path");

        // if (pathObjects.length > 1) {
        //   // Remove all but the last path object
        //   for (let i = 0; i < pathObjects.length - 1; i++) {
        //     canvas.remove(pathObjects[i]);
        //     onlyDeleteLayerEvent(pathObjects[i].id);
        //   }
        // }
        var pathObjects = objects.filter((obj) => obj.type === "path");

        // Remove all path objects from the canvas
        pathObjects.forEach((pathObj) => {
          canvas.remove(pathObj);
          onlyDeleteLayerEvent(pathObj.id);
        });

        // Calculate the bounding box for the path
        var pathObject = new fabric.Path(path);
        var boundingBox = pathObject.getBoundingRect();

        // Scale factors to normalize the path size
        var scaleX = desiredWidth / boundingBox.width;
        var scaleY = desiredHeight / boundingBox.height;
        var finalScale = Math.min(scaleX, scaleY); // Maintain aspect ratio

        // Create the clipPath object with the same scaling
        var clipPath = new fabric.Path(path, {
          absolutePositioned: true,
          originX: "center",
          originY: "center",
          scaleX: finalScale,
          scaleY: finalScale,
          top: activeObject.top,
          left: activeObject.left,
        });

        shell = new fabric.Path(path, {
          fill: "",
          strokeWidth: 5,
          scaleX: finalScale,
          scaleY: finalScale,
          lockScalingX: false,
          lockScalingY: false,
          lockSkewingX: true,
          lockSkewingY: true,
          originX: "center",
          originY: "center",
          top: activeObject.top,
          left: activeObject.left,
        });

        console.log("clippath to aand ", clipPath.top, clipPath.left);
        clipPathOffset.top = clipPath.top - activeObject.top;
        clipPathOffset.left = clipPath.left - activeObject.left;
        activeObject.clipPath = clipPath;
        activeObject.setCoords();

        // Store the activeObject and clipPath for later use when "done" is clicked
        storedActiveObject = activeObject;
        storedClipPath = clipPath;
        canvas.add(shell);
        // Add the image (with clip path) to the canvas and make it the active object
        canvas.setActiveObject(activeObject);
        canvas.renderAll();

        function updateClipPathPosition() {
          clipPath.set({
            top: shell.top + clipPathOffset.top,
            left: shell.left + clipPathOffset.left,
            angle: shell.angle,
            scaleX: shell.scaleX,
            scaleY: shell.scaleY,
          });
          clipPath.setCoords();
          canvas.renderAll();
          // console.log("clippathOffset", clipPath.top, activeObject.top);
        }

        // Attach the event handlers to sync the clipPath with the shell
        shell.on("moving", updateClipPathPosition);
        shell.on("scaling", updateClipPathPosition);
        shell.on("rotating", updateClipPathPosition);

        // Show the "done" button
        document.getElementById("done-masking-img").style.display = "block";
        document.getElementById("replace-image-btn").style.display = "block";
        document.getElementById("edit-masking-button").style.display = "none";
        // editButtonActive = false;
      } else {
        alert("Please select an image object on the canvas first.");
      }
    }

    let relativeTop;
    let relativeLeft;

    function syncClipPathWithImage(clipPath, activeObject) {
      // console.log(activeObject, "Active object of mask");
      // console.log(clipPath);
      // console.log(clipPath.top, clipPath.left);
      // console.log(activeObject.top, activeObject.left);
      // relativeTop = clipPath.top - activeObject.top;
      // relativeLeft = clipPath.left - activeObject.left;
      // applyTemplateClipMask(activeObject);
      // handleMaskingDone();
      // syncClipPathWithImage(activeObject.clipPath, activeObject);

      clipPath.set({
        originX: activeObject.originX,
        originY: activeObject.originY,
        angle: activeObject.angle,
        top: activeObject.top + relativeTop,
        left: activeObject.left + relativeLeft,
      });
      clipPath.setCoords();
      canvas.renderAll();
    }

    // function syncClipPathZoomWithImage(clipPath, activeObject) {
    //   clipPath.set({
    //     scaleX: activeObject.scaleX,
    //     scaleY: activeObject.scaleY,

    //     angle: activeObject.angle,
    //     top: activeObject.top,
    //     left: activeObject.left,
    //   });

    //   clipPath.setCoords();
    //   canvas.renderAll();
    // }
    // function syncClipPathZoomWithImage(clipPath, activeObject) {
    //   const scaleRatioX = activeObject.scaleX;
    //   const scaleRatioY = activeObject.scaleY;

    //   clipPath.set({
    //     scaleX: activeObject.originalScaleX * scaleRatioX,
    //     scaleY: clipPath.originalScaleY * scaleRatioY,
    //     left: activeObject.left,
    //     top: activeObject.top,
    //     angle: activeObject.angle,
    //   });

    //   clipPath.setCoords();
    //   canvas.renderAll();
    // }
    function storeClipPathState(activeObject) {
      const clipPath = activeObject.clipPath;

      // Save relative transform
      const invMatrix = fabric.util.invertTransform(
        activeObject.calcTransformMatrix()
      );
      const clipPathMatrix = fabric.util.multiplyTransformMatrices(
        invMatrix,
        clipPath.calcTransformMatrix()
      );

      const options = fabric.util.qrDecompose(clipPathMatrix);

      clipPath.relativeTransformData = {
        left: options.translateX,
        top: options.translateY,
        scaleX: options.scaleX,
        scaleY: options.scaleY,
        angle: options.angle,
      };
    }
    function syncShellWithClipPath(shell, clipPath) {
      if (!clipPath) return;

      shell.set({
        top: clipPath.top,
        left: clipPath.left,
        angle: clipPath.angle,
        scaleX: clipPath.scaleX,
        scaleY: clipPath.scaleY,
      });

      shell.setCoords();
    }
    function syncClipPathZoomWithImage(activeObject) {
      const clipPath = activeObject.clipPath;
      const rel = clipPath.relativeTransformData;

      if (!rel) return;

      // Apply the same relative transform on updated object
      const objectMatrix = activeObject.calcTransformMatrix();
      const relMatrix = fabric.util.composeMatrix({
        scaleX: rel.scaleX,
        scaleY: rel.scaleY,
        angle: rel.angle,
        translateX: rel.left,
        translateY: rel.top,
      });

      const finalMatrix = fabric.util.multiplyTransformMatrices(
        objectMatrix,
        relMatrix
      );

      const options = fabric.util.qrDecompose(finalMatrix);

      clipPath.set({
        scaleX: options.scaleX,
        scaleY: options.scaleY,
        angle: options.angle,
        left: options.translateX,
        top: options.translateY,
      });

      clipPath.setCoords();
      syncShellWithClipPath(shell, clipPath);
      canvas.requestRenderAll();
    }

    //   function syncClipPathzoomWithImage(clipPath, activeObject) {

    //     const imageScaleX = activeObject.scaleX;
    // const imageScaleY = activeObject.scaleY;

    // // Use uniform scale to maintain clipPath shape (circle)
    // const uniformScale = Math.min(imageScaleX, imageScaleY);

    //     const clipPathScale = (uniformScale * imageOriginalWidth) / clipPathOriginalWidth;

    // // Update clipPath properties
    // clipPath.set({
    //   scaleX: clipPathScale, // Uniform scaling for X
    //   scaleY: clipPathScale, // Uniform scaling for Y to preserve shape
    //   left: activeObject.left, // Sync position with image center
    //   top: activeObject.top,   // Sync position with image center
    //   angle: activeObject.angle, // Sync rotation
    //   dirty: true // Mark as dirty for rendering
    // });
    //     // clipPath.set({
    //     //   scaleX: activeObject.scaleX,
    //     //   scaleY: activeObject.scaleY,

    //     //   angle: activeObject.angle,
    //     //   top: activeObject.top,
    //     //   left: activeObject.left,
    //     // });
    //     activeObject.clipPath = clipPath;

    //     clipPath.setCoords();
    //     canvas.renderAll();
    //   }
    // function syncClipPathZoomWithImage(clipPath, activeObject) {
    //   const scaleRatioX = activeObject.scaleX;
    //   const scaleRatioY = activeObject.scaleY;

    //   clipPath.set({
    //     scaleX: clipPath.scaleX * scaleRatioX,
    //     scaleY: clipPath.scaleY * scaleRatioY,
    //     left: activeObject.left - clipPath.left,
    //     top: activeObject.top - clipPath.top,
    //     angle: activeObject.angle - clipPath.angle,
    //   });

    //   clipPath.setCoords();
    //   canvas.renderAll();
    // }

    function handleMaskingDone() {
      editButtonActive = false;
      canvas.remove(shell);
      if (shell) {
        onlyDeleteLayerEvent(shell?.id);
      }

      canvas.requestRenderAll();
      console.log("value is ", clipPathOffset.top, clipPathOffset.left);

      if (storedActiveObject && storedClipPath) {
        relativeTop = storedClipPath.top - storedActiveObject.top;
        relativeLeft = storedClipPath.left - storedActiveObject.left;

        // Attach the event handlers to start syncing the clipPath with the image
        storedActiveObject.on("moving", () =>
          syncClipPathWithImage(storedClipPath, storedActiveObject)
        );
        storedActiveObject.on("rotating", () =>
          syncClipPathWithImage(storedClipPath, storedActiveObject)
        );
        storedActiveObject.on("scaling", () =>
          syncClipPathWithImage(storedClipPath, storedActiveObject)
        );
        // storedActiveObject.on("scaling", () =>
        //   syncClipPathZoomWithImage(storedClipPath, storedActiveObject)
        // );
        storeClipPathState(storedActiveObject); // Once on load or clipPath attach

        storedActiveObject.on("scaling", () =>
          syncClipPathZoomWithImage(storedActiveObject)
        );
        // Optionally, hide the "done" button after syncing starts
        document.getElementById("done-masking-img").style.display = "none";
        document.getElementById("replace-image-btn").style.display = "none";
        // document.getElementById("edit-masking-button").style.display =
        //   "block";
        canvas.on("selection:cleared", function () {
          document.getElementById("edit-masking-button").style.display = "none";
        });
        // editButtonActive = false;
      } else {
        alert(
          "No active object found for syncing. Please add a clip mask first."
        );
      }
    }

    document
      .getElementById("done-masking-img")
      .addEventListener("click", handleMaskingDone);

    function applyTemplateClipMask(clipmaskObject) {
      //   console.log('Attempting to remove the object:', clipObject);
      let mainClippath = clipmaskObject.clipPath;

      // Ensure mainClippath exists and has a valid path
      if (!mainClippath || !mainClippath.path) {
        console.log("No valid clipPath found in the clipmaskObject.");
        return;
      }
      let path = mainClippath.path;

      // Define the offset values between shell and clipPath for proper syncing
      let clipPathOffset = {
        top: clipmaskObject.top - mainClippath.top,
        left: clipmaskObject.left - mainClippath.left,
      };

      if (clipmaskObject) {
        console.log("Clip mask object:", clipmaskObject);

        // Create the shell using the mainClippath path
        shell = new fabric.Path(path, {
          fill: "", // Transparent shell
          stroke: "black",
          strokeWidth: 2,
          scaleX: mainClippath.scaleX,
          scaleY: mainClippath.scaleY,
          lockScalingX: false,
          lockScalingY: false,
          lockSkewingX: true,
          lockSkewingY: true,
          originX: mainClippath.originX,
          originY: mainClippath.originY,
          top: mainClippath.top,
          left: mainClippath.left,
          selectable: true, // Make it interactive
        });

        // Store the image and its clip path globally
        storedActiveObject = clipmaskObject; // Storing the image object
        storedClipPath = mainClippath; // Storing the clip path object

        // Add shell to the canvas (image is already added to the canvas)
        canvas.add(clipmaskObject);
        canvas.add(shell);
        canvas.requestRenderAll();

        // Function to update the clip path position, scale, and angle as the shell moves
        function updateClipPathPosition() {
          // Update the clipPath's properties based on the shell's new position
          mainClippath.set({
            top: shell.top,
            left: shell.left,
            angle: shell.angle,
            scaleX: shell.scaleX,
            scaleY: shell.scaleY,
          });

          // Reassign the updated clipPath to the image
          storedActiveObject.clipPath = mainClippath;

          // Ensure canvas re-renders with changes
          canvas.requestRenderAll();
        }

        // Sync clipPath updates when the shell is moved, scaled, or rotated
        shell.on("moving", updateClipPathPosition);
        shell.on("scaling", updateClipPathPosition);
        shell.on("rotating", updateClipPathPosition);
      } else {
        console.log("There is no object.");
      }
    }

    function unlinkClipPath() {
      if (storedActiveObject && storedClipPath) {
        // Remove event listeners for moving, rotating, and scaling
        console.log(storedActiveObject);
        console.log(storedClipPath);
        storedActiveObject.off("moving");
        storedActiveObject.off("rotating");
        storedActiveObject.off("scaling");

        // Remove the clipPath from the active object
        storedActiveObject.clipPath = storedClipPath;

        // Optionally, re-add the shell for further editing
        if (shell) {
          canvas.add(shell);
        }
        shell.set({
          top: storedClipPath.top,
          left: storedClipPath.left,
          angle: storedClipPath.angle,
        });
        shell.setCoords();

        canvas.setActiveObject(storedActiveObject);
        canvas.renderAll();

        // Show the "done" button again for re-applying the clip mask
        document.getElementById("done-masking-img").style.display = "block";
        document.getElementById("replace-image-btn").style.display = "block";
        document.getElementById("edit-masking-button").style.display = "none";
        // editButtonActive = false;
      } else {
        alert("No active object found for unlinking the clip path.");
      }
    }

    document
      .getElementById("edit-masking-button")
      .addEventListener("click", function () {
        editButtonActive = true;
        unlinkClipPath();
        selector.find("#gauci-image-settings").show();
      });
    function updateReplaceButtonState(e) {
      const activeObject = canvas.getActiveObject();

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
      if (
        activeObject &&
        storedActiveObject &&
        activeObject === storedActiveObject
      ) {
        const isDoneButtonVisible =
          document.getElementById("done-masking-img").style.display !== "none";

        // Only show the edit button if the done button is NOT visible
        if (!isDoneButtonVisible) {
          selector.find("#gauci-image-settings").hide();
          document.getElementById("edit-masking-button").style.display =
            "block";
        }
      }
    }
    document.getElementById("edit-masking-button").style.display = "none";
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

    document.getElementById("image-input").onchange = function () {
      var activeObject = canvas.getActiveObject();
      if (activeObject) {
        var file = this.files[0];
        if (!file) {
          alert("No file selected.");
          return;
        }
        console.log("Selected file:", file);

        var reader = new FileReader();

        reader.onload = function (event) {
          var imageData = event.target.result;

          fabric.Image.fromURL(
            imageData,
            function (img) {
              // Get canvas dimensions
              var canvasWidth = canvas.getWidth();
              var canvasHeight = canvas.getHeight();

              // Calculate scale to fit the canvas while maintaining aspect ratio
              var scaleX = canvasWidth / img.width;
              var scaleY = canvasHeight / img.height;
              var scale = Math.min(scaleX, scaleY);

              // Apply scaling and set properties from the old image to the new one
              img.set({
                left: activeObject.left,
                top: activeObject.top,
                // scaleX: scale * activeObject.scaleX,
                // scaleY: scale * activeObject.scaleY,
                angle: activeObject.angle,
                originX: activeObject.originX,
                originY: activeObject.originY,
                clipPath: storedClipPath,
                objectCaching: false,
                customId: "clipmask",
              });
              storedActiveObject = img;
              storedClipPath = img.clipPath;

              canvas.remove(activeObject);
              onlyDeleteLayerEvent(activeObject.id);
              canvas.add(img);

              canvas.renderAll(); // Re-render the canvas to reflect changes
            },
            function (error) {
              console.error("Error loading image:", error);
              alert("Failed to load the image. Please try again.");
            }
          );
        };

        reader.onerror = function (error) {
          console.error("Error reading file:", error);
          alert("Failed to read the file. Please try again.");
        };

        reader.readAsDataURL(file);
      } else {
        alert("Please select an image object on the canvas first.");
      }
    };

    document.getElementById("replace-image-btn").onclick = function () {
      document.getElementById("image-input").click();
    };

    const unmaskButton = selector.find("#gauci-unmask");
    unmaskButton.on("click", function () {
      const activeImage = canvas.getActiveObject();

      unmaskImage();
      activeUnmaskButton();
    });

    function unmaskImage() {
      if (storedActiveObject && storedClipPath) {
        // Remove event listeners for moving, rotating, and scaling
        storedActiveObject.off("moving");
        storedActiveObject.off("rotating");
        storedActiveObject.off("scaling");

        // Remove the clipPath from the active object
        storedActiveObject.clipPath = null;

        // Optionally, re-add the shell for further editing
        // canvas.add(shell);
        // canvas.remove(storedClipPath)
        // canvas.remove(shell)

        canvas.requestRenderAll();

        // Show the "done" button again for re-applying the clip mask
        document.getElementById("done-masking-img").style.display = "none";
        document.getElementById("replace-image-btn").style.display = "none";
        document.getElementById("edit-masking-button").style.display = "none";
      } else {
        alert("No active object found for unlinking the clip path.");
      }
    }

    function activeUnmaskButton() {
      var activeObject = canvas.getActiveObject();
      if (activeObject) {
        if (activeObject.type === "group" || activeObject.clipPath) {
          unmaskButton.prop("disabled", false);
        } else {
          unmaskButton.prop("disabled", true);
        }
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

    canvas.on("object:selected", function (e) {
      const selectedObject = e.target;
      console.log("User selected object:", selectedObject);
    });

    // function logSelectedObject(canvas) {
    //   console.log(canvas);
    //   // console.log("Setting event listeners for canvas:", canvas);

    //   // Handle new selection
    //   // canvas.on("selection:created", function (e) {
    //   //   const selectedObject = e.selected[0]; // First selected object
    //   //   console.log("New object selected:", selectedObject);
    //   // });

    //   // Handle selection change (e.g., switching to another object)
    //   canvas.on("selection:updated", function (e) {
    //     const selected = e.selected[0]; // Newly selected object
    //     console.log("Selection updated, new object:", selected);
    //     console.log(editButtonActive);

    //     if (
    //       !editButtonActive &&
    //       selected.type === "image" &&
    //       selected.clipPath
    //     ) {
    //       storedActiveObject = selected;
    //       storedClipPath = selected.clipPath;
    //       let path = selected.clipPath.path;
    //       console.log("Stored object:", storedActiveObject);
    //       console.log(
    //         "Clip path position:",
    //         storedClipPath?.top,
    //         storedClipPath?.left
    //       );

    //       shell = new fabric.Path(path, {
    //         fill: "", // Transparent shell
    //         stroke: "black",
    //         strokeWidth: 2,
    //         scaleX: storedClipPath.scaleX,
    //         scaleY: storedClipPath.scaleY,
    //         lockScalingX: false,
    //         lockScalingY: false,
    //         lockSkewingX: true,
    //         lockSkewingY: true,
    //         originX: storedClipPath.originX,
    //         originY: storedClipPath.originY,
    //         top: storedClipPath.top,
    //         left: storedClipPath.left,
    //         selectable: true, // Make it interactive
    //       });
    //       function updateClipPathPosition() {
    //         // Update the clipPath's properties based on the shell's new position
    //         storedClipPath.set({
    //           top: shell.top,
    //           left: shell.left,
    //           angle: shell.angle,
    //           scaleX: shell.scaleX,
    //           scaleY: shell.scaleY,
    //         });

    //         // Reassign the updated clipPath to the image
    //         storedActiveObject.clipPath = storedClipPath;

    //         // Ensure canvas re-renders with changes
    //         canvas.requestRenderAll();
    //       }

    //       // Sync clipPath updates when the shell is moved, scaled, or rotated
    //       shell.on("moving", updateClipPathPosition);
    //       shell.on("scaling", updateClipPathPosition);
    //       shell.on("rotating", updateClipPathPosition);

    //       // applyTemplateClipMask(selected);

    //       handleMaskingDone();

    //       // syncClipPathWithImage(selected.clipPath, selected);
    //       // console.log(sl);
    //       // deleteLayerEvent(selected.id);

    //       // canvas.renderAll();
    //     }
    //   });

    //   // Optional: Handle deselection
    //   canvas.on("selection:cleared", function (e) {
    //     console.log("Selection cleared");
    //   });
    // }

    // function logSelectedObject(canvas) {
    //   console.log("Attaching event listeners to canvas:", canvas); // Debug: Check canvas instance
    //   console.log(
    //     "Canvas event listeners before attach:",
    //     canvas.__eventListeners
    //   ); // Debug: Check existing listeners

    //   canvas.on("selection:updated", function (e) {
    //     console.log("Selection:updated event fired!"); // Debug: Confirm event is firing
    //     const selected = e.selected[0]; // Newly selected object
    //     console.log("Selection updated, new object:", selected);
    //     console.log("editButtonActive:", editButtonActive);
    //     console.log("Attaching event listeners to canvas:", canvas); // Debug: Check canvas instance
    //     console.log(
    //       "Canvas event listeners before attach:",
    //       canvas.__eventListeners
    //     );

    //     if (
    //       !editButtonActive &&
    //       selected.type === "image" &&
    //       selected.clipPath
    //     ) {
    //       storedActiveObject = selected;
    //       storedClipPath = selected.clipPath;
    //       let path = selected.clipPath.path;
    //       console.log("Stored object:", storedActiveObject);
    //       console.log(
    //         "Clip path position:",
    //         storedClipPath?.top,
    //         storedClipPath?.left
    //       );

    //       shell = new fabric.Path(path, {
    //         fill: "", // Transparent shell
    //         stroke: "black",
    //         strokeWidth: 2,
    //         scaleX: storedClipPath.scaleX,
    //         scaleY: storedClipPath.scaleY,
    //         lockScalingX: false,
    //         lockScalingY: false,
    //         lockSkewingX: true,
    //         lockSkewingY: true,
    //         originX: storedClipPath.originX,
    //         originY: storedClipPath.originY,
    //         top: storedClipPath.top,
    //         left: storedClipPath.left,
    //         selectable: true, // Make it interactive
    //       });
    //       function updateClipPathPosition() {
    //         storedClipPath.set({
    //           top: shell.top,
    //           left: shell.left,
    //           angle: shell.angle,
    //           scaleX: shell.scaleX,
    //           scaleY: shell.scaleY,
    //         });
    //         storedActiveObject.clipPath = storedClipPath;
    //         canvas.requestRenderAll();
    //       }
    //       shell.on("moving", updateClipPathPosition);
    //       shell.on("scaling", updateClipPathPosition);
    //       shell.on("rotating", updateClipPathPosition);
    //       handleMaskingDone();
    //     }
    //   });

    //   canvas.on("selection:cleared", function (e) {
    //     console.log("Selection cleared");
    //   });

    //   console.log(
    //     "Canvas event listeners after attach:",
    //     canvas.__eventListeners
    //   ); // Debug: Confirm listeners attached
    // }

    function logSelectedObject(canvas) {
      // canvas.off("mouse:down");
      canvas.on("mouse:down", function (e) {
        // Debug: Confirm event is firing
        if (!e.target) {
          // canvas.selection = false; // Prevent blue rectangle
          // console.log("Empty click: Multi-selection disabled");
          // // Restore selection immediately to avoid side effects
          // setTimeout(() => {
          //   canvas.selection = true;
          // }, 0);
          return; // Exit to prevent further processing
        }

        const selected = e.target; // Newly selected object
        console.log("Selection updated, new object:", selected);

        if (
          !editButtonActive &&
          selected.type === "image" &&
          selected.clipPath
        ) {
          storedActiveObject = selected;
          storedClipPath = selected.clipPath;
          let path = selected.clipPath.path;

          shell = new fabric.Path(path, {
            fill: "", // Transparent shell
            stroke: "black",
            strokeWidth: 2,
            scaleX: storedClipPath.scaleX,
            scaleY: storedClipPath.scaleY,
            lockScalingX: false,
            lockScalingY: false,
            lockSkewingX: true,
            lockSkewingY: true,
            originX: storedClipPath.originX,
            originY: storedClipPath.originY,
            top: storedClipPath.top,
            left: storedClipPath.left,
            selectable: true, // Make it interactive
          });
          function updateClipPathPosition() {
            storedClipPath.set({
              top: shell.top,
              left: shell.left,
              angle: shell.angle,
              scaleX: shell.scaleX,
              scaleY: shell.scaleY,
            });
            storedActiveObject.clipPath = storedClipPath;
            canvas.requestRenderAll();
          }
          shell.on("moving", updateClipPathPosition);
          shell.on("scaling", updateClipPathPosition);
          shell.on("rotating", updateClipPathPosition);
          handleMaskingDone();
        }
      });
    }

    logSelectedObject(canvas);
    // canvas.on("selection:updated", function (e) {
    //   console.log("Selection:updated event fired!"); // Debug: Confirm event is firing
    //   const selected = e.selected; // Newly selected object
    //   console.log("Selection updated, new object:", selected);
    // });
    // canvas.on("selection:created", function (e) {
    //   console.log("Selection:created event fired!"); // Debug: Confirm event firing
    //   const selected = e.selected; // Newly selected objects (array)
    //   console.log("New object selected:", selected); // Target log: Prints once per selection
    // });
    // canvas.on("object:selected", function (e) {
    //   console.log("Object:selected event fired!"); // Debug: Confirm event firing
    //   const selected = e.target; // Single selected object
    //   console.log("New object selected:", selected); // Target log: Prints once per selection
    // });
    // canvas.on("mouse:down", function (e) {
    //   const selected = e.target;
    //   console.log("Object selected:", selected);

    //   // 2. Jab selected object move ho
    //   // selected.on("moving", function () {
    //   //   console.log("Object is moving...");
    //   // });
    // });
    // let hasMovedOnce = false;
    // let lastSelectedObject = null;

    // canvas.on("mouse:down", function (e) {
    //   const selected = e.target;

    //   if (selected && selected !== lastSelectedObject) {
    //     hasMovedOnce = false; // Reset move tracker
    //     lastSelectedObject = selected; // Track new selection
    //   }
    // });

    // canvas.on("object:moving", function (e) {
    //   if (!hasMovedOnce) {
    //     const selected = e.target;
    //     console.log("Moved (only once):", selected);
    //     if (selected.type === "image" && selected.clipPath) {
    //       storedActiveObject = selected;
    //       storedClipPath = selected.clipPath;
    //       let path = selected.clipPath.path;
    //       console.log("Stored object:", storedActiveObject);
    //       console.log(
    //         "Clip path position:",
    //         storedClipPath?.top,
    //         storedClipPath?.left
    //       );

    //       shell = new fabric.Path(path, {
    //         fill: "", // Transparent shell
    //         stroke: "black",
    //         strokeWidth: 2,
    //         scaleX: storedClipPath.scaleX,
    //         scaleY: storedClipPath.scaleY,
    //         lockScalingX: false,
    //         lockScalingY: false,
    //         lockSkewingX: true,
    //         lockSkewingY: true,
    //         originX: storedClipPath.originX,
    //         originY: storedClipPath.originY,
    //         top: storedClipPath.top,
    //         left: storedClipPath.left,
    //         selectable: true, // Make it interactive
    //       });
    //       function updateClipPathPosition() {
    //         // Update the clipPath's properties based on the shell's new position
    //         storedClipPath.set({
    //           top: shell.top,
    //           left: shell.left,
    //           angle: shell.angle,
    //           scaleX: shell.scaleX,
    //           scaleY: shell.scaleY,
    //         });

    //         // Reassign the updated clipPath to the image
    //         storedActiveObject.clipPath = storedClipPath;

    //         // Ensure canvas re-renders with changes
    //         canvas.requestRenderAll();
    //       }

    //       // Sync clipPath updates when the shell is moved, scaled, or rotated
    //       shell.on("moving", updateClipPathPosition);
    //       shell.on("scaling", updateClipPathPosition);
    //       shell.on("rotating", updateClipPathPosition);

    //       // applyTemplateClipMask(selected);
    //       handleMaskingDone();
    //       // syncClipPathWithImage(selected.clipPath, selected);
    //       // console.log(sl);
    //       // deleteLayerEvent(selected.id);

    //       // canvas.renderAll();
    //     }
    //     hasMovedOnce = true;
    //   }
    // });

    var maskButton = selector.find(
      "#gauci-maskbutton, #gauci-maskbutton-outsied"
    );
    maskButton.css("display", "none");

    /* Image Flip X */
    selector.find("#img-flip-horizontal").on("click", function () {
      canvas.getActiveObject().toggle("flipX");
      canvas.requestRenderAll();
      canvas.fire("gauci:history", {
        type: "image",
        text: gauciParams.edited,
      });
    });
    /* Image Flip Y */
    selector.find("#img-flip-vertical").on("click", function () {
      canvas.getActiveObject().toggle("flipY");
      canvas.requestRenderAll();
      canvas.fire("gauci:history", {
        type: "image",
        text: gauciParams.edited,
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
      canvas.fire("gauci:history", {
        type: "image",
        text: gauciParams.edited,
      });
    });
    /* Image Border Color */
    selector.find("#img-border-color").bind("change", function () {
      canvas.getActiveObject().set("stroke", $(this).val());
      canvas.requestRenderAll();
      canvas.fire("gauci:history", {
        type: "image",
        text: gauciParams.edited,
      });
    });
    /* Image Border Width */
    selector
      .find("#gauci-image-settings input[type=number]")
      .on("input paste", function () {
        var val = parseInt($(this).val());
        if ($(this).attr("id") == "img-border-width") {
          canvas.getActiveObject().set("strokeWidth", val);
        }
        canvas.requestRenderAll();
      });
    selector
      .find("#gauci-image-settings input[type=number]")
      .bind("input", function () {
        window.clearTimeout(timeOut);
        timeOut = setTimeout(function () {
          canvas.fire("gauci:history", {
            type: "image",
            text: gauciParams.edited,
          });
        }, 500);
      });
    /* Image Skew, Rotate, Opacity */
    selector
      .find("#gauci-image-settings input[type=range]")
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
      .find("#gauci-image-settings input[type=range]")
      .bind("change", function () {
        canvas.fire("gauci:history", {
          type: "image",
          text: gauciParams.edited,
        });
      });
    /* Set Shape Settings */
    function setShapeSettings(shape) {
      selector.find("#shape-outline-width").val(shape.strokeWidth);
      if (shape.gradientFill == "none") {
        selector.find("#gauci-shape-gradient").val("none");
        selector.find("#gauci-shape-color").spectrum("set", shape.fill);
      } else if (shape.gradientFill == "vertical") {
        selector.find("#gauci-shape-gradient").val("vertical");
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
        selector.find("#gauci-shape-gradient").val("horizontal");
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
      selector.find("#gauci-shape-gradient").trigger("change");
      selector.find("#shape-outline-color").spectrum("set", shape.stroke);
      if (shape.shadow == null) {
        selector.find("#gauci-shape-shadow").prop("checked", false);
      } else {
        selector.find("#gauci-shape-shadow").prop("checked", true);
        selector
          .find("#shape-shadow-color")
          .spectrum("set", shape.shadow.color);
        selector.find("#shape-shadow-blur").val(shape.shadow.blur);
        selector.find("#shape-shadow-offset-x").val(shape.shadow.offsetX);
        selector.find("#shape-shadow-offset-y").val(shape.shadow.offsetY);
      }
      selector.find("#gauci-shape-shadow").trigger("change");
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
    selector.find("#gauci-shape-select").on("change", function () {
      var val = $(this).val();
      if (val == "none" || val == "custom") {
        selector.find("#gauci-shape-add").prop("disabled", true);
      } else {
        selector.find("#gauci-shape-add").prop("disabled", false);
      }
    });
    /* Add Shape */
    selector.find(".gauci-option").on("click", function () {
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
      canvas.fire("gauci:history", {
        type: val,
        text: gauciParams.added,
      });
    });
    /* Shape Color Fields */
    selector
      .find("#gauci-shape-settings .gauci-colorpicker")
      .bind("change", function () {
        var val = $(this).val();
        if ($(this).attr("id") == "gauci-shape-color") {
          canvas.getActiveObject().set("fill", val);
        } else if ($(this).attr("id") == "shape-outline-color") {
          canvas.getActiveObject().set("stroke", val);
        }
        canvas.requestRenderAll();
        canvas.fire("gauci:history", {
          type: canvas.getActiveObject().objectType,
          text: gauciParams.edited,
        });
      });
    /* Shape Skew, Rotate, Opacity */
    selector
      .find("#gauci-shape-settings input[type=range]")
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
      .find("#gauci-shape-settings input[type=range]")
      .bind("change", function () {
        canvas.fire("gauci:history", {
          type: canvas.getActiveObject().objectType,
          text: gauciParams.edited,
        });
      });
    /* Shape Numeric Fields */
    selector
      .find("#gauci-shape-settings input[type=number]")
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
      .find("#gauci-shape-settings input[type=number]")
      .bind("input", function () {
        window.clearTimeout(timeOut);
        timeOut = setTimeout(function () {
          canvas.fire("gauci:history", {
            type: canvas.getActiveObject().objectType,
            text: gauciParams.edited,
          });
        }, 500);
      });
    /* Shape Aspect Ratio Width Input */
    selector.find("#shape-custom-width").bind("input paste", function () {
      if (selector.find("#gauci-shape-ratio-lock").hasClass("active")) {
        var width = parseInt($(this).val());
        var ratioW = parseInt(selector.find("#gauci-shape-ratio-w").val());
        var ratioH = parseInt(selector.find("#gauci-shape-ratio-h").val());
        var height = (width * ratioH) / ratioW;
        selector.find("#shape-custom-height").val(Math.round(height));
        canvas.getActiveObject().set("height", height);
        canvas.getActiveObject().set("scaleY", 1);
      }
    });
    /* Shape Aspect Ratio Height Input */
    selector.find("#shape-custom-height").bind("input paste", function () {
      if (selector.find("#gauci-shape-ratio-lock").hasClass("active")) {
        var height = $(this).val();
        var ratioW = parseInt(selector.find("#gauci-shape-ratio-w").val());
        var ratioH = parseInt(selector.find("#gauci-shape-ratio-h").val());
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
        .find("#gauci-frames-wrap li")
        .hide()
        .filter('[data-keyword*="' + searchTerm + '"]')
        .show();
    };
    /* Search frame Input */
    selector.find("#gauci-frame-search").on("keyup input", function () {
      selector.find("#gauci-noframes").hide();
      var searchTerm = $(this).val().toLowerCase().replace(/\s/g, " ");
      if (searchTerm == "" || searchTerm.length < 1) {
        selector.find("#gauci-frames-wrap li").show();
        selector.find("#gauci-frame-search-icon").html("search");
        selector.find("#gauci-frame-search-icon").removeClass("cancel");
      } else {
        selector.find("#gauci-frame-search-icon").html("clear");
        selector.find("#gauci-frame-search-icon").addClass("cancel");
        filterframes(searchTerm);
        if (selector.find("#gauci-frames-wrap li:visible").length === 0) {
          selector.find("#gauci-noframes").show();
        }
      }
    });
    /* Search frame Icon */
    selector.find("#gauci-frame-search-icon").on("click", function () {
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).html("search");
        selector.find("#gauci-frame-search").val("");
        selector.find("#gauci-frames-wrap li").show();
        selector.find("#gauci-noframes").hide();
      }
    });
    /* Add frame */
    selector
      .find(".gauci-frames-grid")
      .on("click", ".gauci-frame img", function () {
        selector.find("#gauci-canvas-loader").css("display", "flex");
        var frame = $(this).parent().parent();
        var svgUrl = frame.data("elsource");
        selector.find(".gauci-frames-grid .gauci-frame").removeClass("active");
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
            selector.find("#gauci-canvas-loader").hide();
          },
          function () {},
          {
            crossOrigin: "anonymous",
          }
        );
        canvas.fire("gauci:history", {
          type: "frame",
          text: gauciParams.added,
        });
      });
    /* Frame color */
    selector.find("#gauci-frame-color").bind("change", function () {
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
      canvas.fire("gauci:history", {
        type: "frame",
        text: gauciParams.edited,
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
      canvas.fire("gauci:history", {
        type: "frame",
        text: gauciParams.edited,
      });
    }
    /* Frame Rotate Right */
    selector.find("#gauci-rotate-right-frame").on("click", function () {
      rotateFrame("right");
    });
    /* Frame Rotate Left */
    selector.find("#gauci-rotate-left-frame").on("click", function () {
      rotateFrame("left");
    });
    /* Frame Flip X */
    selector.find("#gauci-flip-horizontal-frame").on("click", function () {
      var objects = canvas
        .getObjects()
        .filter((element) => element.objectType == "frame");
      $.each(objects, function (index, value) {
        value.toggle("flipX");
      });
      canvas.requestRenderAll();
      canvas.fire("gauci:history", {
        type: "frame",
        text: gauciParams.edited,
      });
    });
    /* Frame Flip Y */
    selector.find("#gauci-flip-vertical-frame").on("click", function () {
      var objects = canvas
        .getObjects()
        .filter((element) => element.objectType == "frame");
      $.each(objects, function (index, value) {
        value.toggle("flipY");
      });
      canvas.requestRenderAll();
      canvas.fire("gauci:history", {
        type: "frame",
        text: gauciParams.edited,
      });
    });
    /* ELEMENTS */
    /* Filter elements */
    var filterElements = function (searchTerm) {
      selector
        .find("#gauci-elements-wrap li")
        .hide()
        .filter('[data-keyword*="' + searchTerm + '"]')
        .show();
    };
    /* Search Element Input */
    selector.find("#gauci-element-search").on("keyup input", function () {
      selector.find("#gauci-noelements").hide();
      var searchTerm = $(this).val().toLowerCase().replace(/\s/g, " ");
      if (searchTerm == "" || searchTerm.length < 1) {
        selector.find("#gauci-elements-wrap li").show();
        selector.find("#gauci-element-search-icon").html("search");
        selector.find("#gauci-element-search-icon").removeClass("cancel");
      } else {
        selector.find("#gauci-element-search-icon").html("clear");
        selector.find("#gauci-element-search-icon").addClass("cancel");
        filterElements(searchTerm);
        if (selector.find("#gauci-elements-wrap li:visible").length === 0) {
          selector.find("#gauci-noelements").show();
        }
      }
    });
    /* Search Element Icon */
    selector.find("#gauci-element-search-icon").on("click", function () {
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).html("search");
        selector.find("#gauci-element-search").val("");
        selector.find("#gauci-elements-wrap li").show();
        selector.find("#gauci-noelements").hide();
      }
    });
    /* Add Element */
    selector
      .find(".gauci-elements-grid")
      .on("click", ".gauci-element > *:first-child", function () {
        var element = $(this).parent();
        var svgUrl = element.data("elsource");
        if (element.parent().attr("id") == "gauci-icons-grid") {
          var iconStyle = selector.find("#gauci-icon-style").val();
          svgUrl = element.data("elsource") + "/" + iconStyle + "/24px.svg";
          console.log(svgUrl);
        }
        var loader = element.data("loader");
        if (loader == "yes") {
          selector.find("#gauci-canvas-loader").css("display", "flex");
        }
        selector
          .find(".gauci-elements-grid .gauci-element")
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
              selector.find("#gauci-canvas-loader").hide();
            }
          },
          function () {},
          {
            crossOrigin: "anonymous",
          }
        );
        canvas.fire("gauci:history", {
          type: "element",
          text: gauciParams.added,
        });
      });
    /* Set Element Settings */
    function setElementSettings(obj) {
      if (obj.gradientFill == "none") {
        selector.find("#gauci-element-gradient").val("none");
        selector.find("#gauci-element-color").spectrum("set", obj.fill);
      } else if (obj.gradientFill == "vertical") {
        selector.find("#gauci-element-gradient").val("vertical");
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
        selector.find("#gauci-element-gradient").val("horizontal");
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
      selector.find("#gauci-element-gradient").trigger("change");
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
        selector.find("#gauci-element-shadow").prop("checked", false);
      } else {
        selector.find("#gauci-element-shadow").prop("checked", true);
        selector
          .find("#element-shadow-color")
          .spectrum("set", obj.shadow.color);
        selector.find("#element-shadow-blur").val(obj.shadow.blur);
        selector.find("#element-shadow-offset-x").val(obj.shadow.offsetX);
        selector.find("#element-shadow-offset-y").val(obj.shadow.offsetY);
      }
      selector.find("#gauci-element-shadow").trigger("change");
    }
    /* Upload Custom Element */
    selector.find("#gauci-element-upload").on("change", function (e) {
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
      canvas.fire("gauci:history", {
        type: "element",
        text: gauciParams.added,
      });
    });
    /* Custom element color */
    selector.find("#gauci-element-color").bind("change", function () {
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
      canvas.fire("gauci:history", {
        type: "element",
        text: gauciParams.edited,
      });
    });
    /* Custom Element Flip X */
    selector.find("#element-flip-horizontal").on("click", function () {
      canvas.getActiveObject().toggle("flipX");
      canvas.requestRenderAll();
      canvas.fire("gauci:history", {
        type: "element",
        text: gauciParams.edited,
      });
    });
    /* Custom Element Flip Y */
    selector.find("#element-flip-vertical").on("click", function () {
      canvas.getActiveObject().toggle("flipY");
      canvas.requestRenderAll();
      canvas.fire("gauci:history", {
        type: "element",
        text: gauciParams.edited,
      });
    });
    /* Custom Element Skew, Rotate, Opacity */
    selector
      .find("#gauci-custom-element-options input[type=range]")
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
      .find("#gauci-custom-element-options input[type=range]")
      .bind("change", function () {
        canvas.fire("gauci:history", {
          type: "element",
          text: gauciParams.edited,
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
      canvas.fire("gauci:history", {
        type: "customSVG",
        text: gauciParams.edited,
      });
    });
    /* Custom Element Flip Y */
    selector.find("#customsvg-flip-vertical").on("click", function () {
      canvas.getActiveObject().toggle("flipY");
      canvas.requestRenderAll();
      canvas.fire("gauci:history", {
        type: "customSVG",
        text: gauciParams.edited,
      });
    });
    /* Custom Element Skew, Rotate, Opacity */
    selector
      .find("#gauci-custom-svg-options input[type=range]")
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
      .find("#gauci-custom-svg-options input[type=range]")
      .bind("change", function () {
        canvas.fire("gauci:history", {
          type: "customSVG",
          text: gauciParams.edited,
        });
      });
    /* ICON LIBRARY */
    /* Filter icons */
    var filterIcons = function (searchTerm) {
      selector
        .find("#gauci-icons-grid .gauci-element")
        .css("display", "none")
        .filter('[title*="' + searchTerm + '"]')
        .css("display", "flex");
    };
    /* Search Icon Input */
    selector.find("#gauci-icon-search").on("keyup input", function () {
      selector.find("#gauci-noicons").hide();
      var searchTerm = $(this).val().toLowerCase().replace(/\s/g, " ");
      if (searchTerm == "" || searchTerm.length < 1) {
        selector
          .find("#gauci-icons-grid .gauci-element")
          .css("display", "flex");
        selector.find("#gauci-icon-search-icon").html("search");
        selector.find("#gauci-icon-search-icon").removeClass("cancel");
      } else {
        selector.find("#gauci-icon-search-icon").html("clear");
        selector.find("#gauci-icon-search-icon").addClass("cancel");
        filterIcons(searchTerm);
        if (
          selector.find("#gauci-icons-grid .gauci-element:visible").length === 0
        ) {
          selector.find("#gauci-noicons").show();
        }
      }
    });
    /* Search Icon */
    selector.find("#gauci-icon-search-icon").on("click", function () {
      if ($(this).hasClass("cancel")) {
        $(this).removeClass("cancel");
        $(this).html("search");
        selector.find("#gauci-icon-search").val("");
        selector
          .find("#gauci-icons-grid .gauci-element")
          .css("display", "flex");
        selector.find("#gauci-noicons").hide();
      }
    });
    /* QR CODE */
    selector.find("#gauci-generate-qr-code").on("click", function () {
      var qrcode = kjua({
        text: selector.find("#gauci-qrcode-text").val(),
        render: "svg",
        size: 300,
        fill: selector.find("#gauci-qrcode-fill").val(),
        back: selector.find("#gauci-qrcode-back").val(),
        rounded: selector.find("#gauci-qrcode-rounded").val(),
        mode: "label", // modes: 'plain', 'label' or 'image'
        label: selector.find("#gauci-qrcode-label").val(),
        fontname: "sans",
        fontcolor: selector.find("#gauci-qrcode-label-color").val(),
        mSize: selector.find("#gauci-qrcode-label-size").val(),
        mPosX: selector.find("#gauci-qrcode-label-position-x").val(),
        mPosY: selector.find("#gauci-qrcode-label-position-y").val(),
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
        text: selector.find("#gauci-qrcode-text").val(),
        render: "svg",
        size: 300,
        fill: selector.find("#gauci-qrcode-fill").val(),
        back: selector.find("#gauci-qrcode-back").val(),
        rounded: selector.find("#gauci-qrcode-rounded").val(),
        mode: "label", // modes: 'plain', 'label' or 'image'
        label: selector.find("#gauci-qrcode-label").val(),
        fontname: "sans",
        fontcolor: selector.find("#gauci-qrcode-label-color").val(),
        mSize: selector.find("#gauci-qrcode-label-size").val(),
        mPosX: selector.find("#gauci-qrcode-label-position-x").val(),
        mPosY: selector.find("#gauci-qrcode-label-position-y").val(),
      });
      return qrcode;
    }
    selector.find("#qrcode-preview").html(qrcodePreview());
    /* Update Preview */
    selector
      .find('#gauci-qrcode-settings input[type="text"]')
      .on("input", function () {
        var qrcode = qrcodePreview();
        selector.find("#qrcode-preview").html(qrcode);
      });
    selector
      .find("#gauci-qrcode-settings .gauci-colorpicker")
      .bind("change", function () {
        var qrcode = qrcodePreview();
        selector.find("#qrcode-preview").html(qrcode);
      });
    selector
      .find("#gauci-qrcode-settings input[type=range]")
      .bind("input click", function () {
        var qrcode = qrcodePreview();
        selector.find("#qrcode-preview").html(qrcode);
      });
    /* BRUSHES */
    /* Draw Cursor */
    function drawCursor(brushSize, brushColor) {
      $("#tm-cursor-1").remove();
      selector.find("#gauci-canvas-wrap").tmpointer({
        id: 1,
        native_cursor: "enable",
        cursorSize: brushSize,
        cursorColor: brushColor,
      });
    }
    // Draw Mode Button
    selector.find("#gauci-draw-btn").on("click", function () {
      if ($(this).hasClass("active")) {
        selector.find("#gauci-draw-undo").prop("disabled", true);
        selector.find("#gauci-draw-undo").removeClass("active");
        $("#tm-cursor-1").remove();
        selector.find("#gauci-draw-settings").hide();
        selector
          .find(
            "#gauci-top-bar, #gauci-right-col, #gauci-icon-menu, #gauci-toggle-left, #gauci-toggle-right"
          )
          .css("pointer-events", "auto");
        $(this).removeClass("active");
        canvas.isDrawingMode = false;
        $(this).html(
          '<span class="material-icons">edit</span>' + gauciParams.startDrawing
        );
      } else {
        selector.find("#gauci-draw-undo").prop("disabled", false);
        selector.find("#gauci-draw-settings").show();
        selector
          .find(
            "#gauci-top-bar, #gauci-right-col, #gauci-icon-menu, #gauci-toggle-left, #gauci-toggle-right"
          )
          .css("pointer-events", "none");
        $(this).addClass("active");
        selector.find("#gauci-brush-select").trigger("change");
        canvas.isDrawingMode = true;
        $(this).html(
          '<span class="material-icons">close</span>' + gauciParams.stopDrawing
        );
      }
    });
    // Brush Type Select
    selector.find("#gauci-brush-select").on("change", function () {
      var val = $(this).val();
      if (val == "erase") {
        $("#gauci-brush-tip").hide();
        $("#gauci-eraser-tip").show();
      } else {
        $("#gauci-brush-tip").show();
        $("#gauci-eraser-tip").hide();
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
        selector.find("#gauci-draw-undo").removeClass("active");
        selector.find("#not-erase-brush").show();
        brush.color = selector.find("#brush-color").val();
      }
      if (selector.find("#gauci-brush-shadow").is(":checked")) {
        brush.shadow = brushShadow;
      } else {
        brush.shadow = null;
      }
      drawCursor(brush.width * canvas.getZoom(), brush.color);
      if (val == "hline" || val == "vline" || val == "square") {
        selector.find("#gauci-brush-pattern-width").css("display", "flex");
      } else {
        selector.find("#gauci-brush-pattern-width").css("display", "none");
      }
      if (val == "square") {
        selector.find("#gauci-brush-pattern-distance").css("display", "flex");
      } else {
        selector.find("#gauci-brush-pattern-distance").css("display", "none");
      }
    });
    /* Draw Shadow */
    selector.find("#gauci-brush-shadow").on("change", function () {
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
      .find("#gauci-draw-settings input[type=number]")
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
          selector.find("#gauci-brush-select").trigger("change");
        } else if ($(this).attr("id") == "brush-pattern-distance") {
          selector.find("#gauci-brush-select").trigger("change");
        }
      });
    /* Draw Color Fields */
    selector
      .find("#gauci-draw-settings .gauci-colorpicker")
      .bind("change", function () {
        if ($(this).attr("id") == "brush-color") {
          brush.color = $(this).val();
          drawCursor(brush.width * canvas.getZoom(), brush.color);
          selector.find("#gauci-brush-select").trigger("change");
        } else if ($(this).attr("id") == "brush-shadow-color") {
          brushShadow.color = $(this).val();
        }
      });
    /* Undo Draw */
    selector.find("#gauci-draw-undo").on("click", function () {
      if (selector.find("#gauci-brush-select").val() == "erase") {
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
      $("#gauci-theme-link").attr("href", link);
    });
    // Font Size
    selector.find("#custom-font-size").on("input", function () {
      $("html").css("font-size", $(this).val() + "px");
    });
    // Canvas Background
    selector.find("#custom-background").on("change", function () {
      var val = $(this).val();
      if (val != "") {
        selector.find("#gauci-content").css("background-color", val);
      }
    });
    // Image Background
    selector.find("#custom-image-background").on("change", function () {
      var val = $(this).val();
      selector.find("#gauci-canvas-color").spectrum("set", val);
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
      selector.find("#gauci-canvas").removeClass("hide-canvas");
      selector.find("#gauci").removeClass("hide-canva");
    });
    // selector.find(".thr-d").on("click", function () {
    //   selector.find(".thr-d").addClass("active");
    //   selector.find(".two-d").removeClass("active");
    //   selector
    //     .find(".td-interactive-btn-container-main-contianer")
    //     .addClass("interactive-btn-alignment");
    //   selector.find(".web-thr-d-main-container").addClass("display-unity");
    //   selector.find("#gauci-canvas").addClass("hide-canvas");
    //   selector.find("#gauci").addClass("hide-canva");
    //   canvas.renderAll();
    //   // updateCanvasState()
    //   var name = "tester";
    //   var quality = 1;
    //   var format = "jpeg";
    //   var objurl = "";
    //   var link = document.createElement("a");
    //   add_watermark();
    //   canvas.setZoom(1);
    //   selector.find("#gauci-img-zoom").val(100);
    //   var zoomWidth = originalHeight;
    //   var zoomHeight = originalWidth;
    //   if (rotate == 0 || rotate == 180 || rotate == -180) {
    //     zoomWidth = originalWidth;
    //     zoomHeight = originalHeight;
    //   }
    //   canvas.setWidth(zoomWidth);
    //   canvas.setHeight(zoomHeight);
    //   var blob = "";

    //   canvas.getObjects().forEach(function (obj) {
    //     console.log("object:", obj);
    //     if (obj.customId === "layoutImage") {
    //       obj.visible = false;
    //     }
    //   });
    //   var imgData = canvas.toDataURL({
    //     format: format,
    //     quality: quality,
    //     enableRetinaScaling: false,
    //   });
    //   canvas.getObjects().forEach(function (obj) {
    //     if (obj.customId === "layoutImage") {
    //       obj.visible = true;
    //     }
    //   });
    //   console.log(imgData);
    //   // window.canvasFinalImage=imgData
    //   if (format != "webp") {
    //     imgData = changeDpiDataUrl(
    //       imgData,
    //       selector.find("#gauci-download-img-dpi").val()
    //     );
    //   }
    //   blob = dataURLtoBlob(imgData);
    //   objurl = URL.createObjectURL(blob);
    //   console.log("object url", objurl);
    //   if (objurl) {
    //     var event = new CustomEvent("variableReady", {
    //       detail: {
    //         data: objurl,
    //       },
    //     });
    //     document.dispatchEvent(event);
    //   }
    //   link.download = name + "." + format;
    //   link.href = objurl;
    //   // link.click();
    //   remove_watermark();
    //   adjustZoom();
    //   canvas.requestRenderAll();
    // });
    // const meshImageDataArray = [];
    // selector.find(".thr-d").on("click", function () {
    //   // Update classes based on user interaction
    //   selector.find(".thr-d").addClass("active");
    //   selector.find(".two-d").removeClass("active");
    //   selector
    //     .find(".td-interactive-btn-container-main-contianer")
    //     .addClass("interactive-btn-alignment");
    //   selector.find(".web-thr-d-main-container").addClass("display-unity");
    //   selector.find("#gauci-canvas").addClass("hide-canvas");
    //   selector.find("#gauci").addClass("hide-canva");
    //   // saveCanvasState(activeTabId);
    //   generateImagesFromCanvasStates();

    //   const event = new CustomEvent("thrDClicked");
    //   document.dispatchEvent(event);
    // });

    // Image generation function
    // function generateImagesFromCanvasStates() {
    //   saveCanvasState(activeTabId);
    //   // Array to store image data for each tab
    //   meshImageDataArray.length = 0;
    //   Object.keys(tabCanvasStates).forEach((tabId) => {
    //     // Create a temporary canvas with a width and height of 2048
    //     const tempCanvas = new fabric.Canvas(null, {
    //       width: 2048,
    //       height: 2048,
    //     });

    //     // Load the JSON state into the temporary canvas
    //     tempCanvas.loadFromJSON(tabCanvasStates[tabId], () => {
    //       const objects = tempCanvas.getObjects(); // Get all objects in the canvas
    //       console.log(objects);
    //       const corsImages = []; // Store references to CORS images

    //       // Identify and hide CORS images
    //       // objects.forEach((obj) => {
    //       //   if (obj.type === "image" && obj.src && obj.src.startsWith("http")) {
    //       //     corsImages.push(obj); // Keep a reference to this object
    //       //     obj.visible = false; // Hide the object
    //       //   }
    //       // });

    //       // Filter objects with type === "image" and get the first one
    //       // const imageObjects = objects.filter((obj) => obj.type === "image");

    //       // if (imageObjects.length > 0) {
    //       //   corsImages.push(imageObjects[0]); // Push only the first image object
    //       //   imageObjects[0].visible = false; // Hide the object
    //       // }

    //       // tempCanvas.renderAll(); // Render the canvas without CORS images
    //       const firstObject = objects[0];
    //       if (
    //         firstObject &&
    //         firstObject.type === "image" &&
    //         firstObject.getSrc &&
    //         firstObject.getSrc().startsWith("http") &&
    //         !firstObject.clipPath
    //       ) {
    //         tempCanvas.remove(firstObject);
    //       }
    //       tempCanvas.renderAll();

    //       // Generate the base64 image
    //       try {
    //         // const base64Image = tempCanvas.toDataURL({
    //         //   format: "png",
    //         //   quality: 1.0,
    //         // });
    //         const base64Image = tempCanvas.toDataURL({
    //           format: "jpeg", // More compressed
    //           quality: 1.0,
    //         });

    //         console.log(base64Image);

    //         // Push the data into the array
    //         meshImageDataArray.push({
    //           meshName: tabId,
    //           meshImageData: base64Image,
    //         });
    //       } catch (error) {
    //         console.error(`Error generating image for Tab ID ${tabId}:`, error);
    //       }

    //       // Restore visibility of CORS images
    //       // corsImages.forEach((obj) => {
    //       //   obj.visible = true;
    //       // });

    //       // tempCanvas.renderAll(); // Re-render the canvas with all objects
    //       // Re-insert the removed object (if any)
    //       if (firstObject) {
    //         tempCanvas.insertAt(firstObject, 0);
    //       }

    //       tempCanvas.renderAll();

    //       // Clean up the temporary canvas
    //       tempCanvas.clear();
    //       tempCanvas.dispose();

    //       if (
    //         meshImageDataArray.length === Object.keys(tabCanvasStates).length
    //       ) {
    //         // console.log("Generated Images Array:", meshImageDataArray);
    //         window.meshImageDataArray = meshImageDataArray;
    //         console.log(
    //           window.meshImageDataArray,
    //           "Window data from gauci file"
    //         );
    //       }
    //     });
    //   });
    // }
    const meshImageDataArray = [];

    // selector.find(".thr-d").on("click", function () {
    //   generateImagesFromCanvasStates(); // Just call the function, UI updates are handled inside
    // });

    // selector.find(".thr-d").on("click", function () {
    //   // Show loader using jQuery
    //   // $(".fullpage-loader").show();
    //   selector.find("#gauci-canvas-loader").css("display", "flex");

    //   // Hide loader after 2 seconds using jQuery
    //   setTimeout(() => {
    //     // $(".fullpage-loader").hide();
    //     selector.find("#gauci-canvas-loader").hide();
    //   }, 1000);

    //   // Proceed with your existing function
    //   generateImagesFromCanvasStates();
    // });
    // selector.find(".thr-d").on("click", function () {
    //   selector.find("#gauci-canvas-loader").css("display", "flex"); // Show loader

    //   requestAnimationFrame(() => {
    //     generateImagesFromCanvasStates(); // Now it runs after loader is visible
    //     selector.find("#gauci-canvas-loader").hide(); // Hide after done
    //   });
    // });
    selector.find(".thr-d").on("click", function () {
      selector.find("#gauci-canvas-loader").css("display", "flex"); // Show loader

      requestAnimationFrame(() => {
        generateImagesFromCanvasStates(); // Heavy work

        setTimeout(() => {
          selector.find("#gauci-canvas-loader").hide(); // Hide after 1 second
        }, 1000);
      });
    });

    async function generateImagesFromCanvasStates() {
      saveCanvasState(activeTabId);
      meshImageDataArray.length = 0; // Clear the array
      window.tabCanvasStates = tabCanvasStates;
      const tabIds = Object.keys(tabCanvasStates);
      const promises = tabIds.map((tabId) => {
        return new Promise((resolve, reject) => {
          // Create a temporary canvas with a width and height of 2048
          const tempCanvas = new fabric.Canvas(null, {
            width: 2048,
            height: 2048,
          });

          // Load the JSON state into the temporary canvas
          tempCanvas.loadFromJSON(tabCanvasStates[tabId], () => {
            try {
              const objects = tempCanvas.getObjects();
              console.log(`Objects for tab ${tabId}:`, objects);

              const firstObject = objects[0];
              if (
                firstObject &&
                firstObject.type === "image" &&
                firstObject.getSrc &&
                firstObject.getSrc().startsWith("http") &&
                !firstObject.clipPath
              ) {
                tempCanvas.remove(firstObject);
              }
              tempCanvas.renderAll();

              // Generate the base64 image
              const base64Image = tempCanvas.toDataURL({
                format: "jpeg",
                quality: 1.0,
              });

              console.log(`Base64 image generated for ${tabId}`);

              // Push the data into the array
              meshImageDataArray.push({
                meshName: tabId,
                meshImageData: base64Image,
              });

              if (firstObject) {
                tempCanvas.insertAt(firstObject, 0);
              }

              tempCanvas.renderAll();
              tempCanvas.clear();
              tempCanvas.dispose();

              resolve();
            } catch (error) {
              console.error(
                `Error generating image for Tab ID ${tabId}:`,
                error
              );
              reject(error);
            }
          });
        });
      });

      try {
        await Promise.all(promises);
        console.log("All images generated:", meshImageDataArray);
        window.meshImageDataArray = meshImageDataArray;

        // Move UI updates and event dispatch here
        selector.find(".thr-d").addClass("active");
        selector.find(".two-d").removeClass("active");
        selector
          .find(".td-interactive-btn-container-main-contianer")
          .addClass("interactive-btn-alignment");
        selector.find(".web-thr-d-main-container").addClass("display-unity");
        selector.find("#gauci-canvas").addClass("hide-canvas");
        selector.find("#gauci").addClass("hide-canva");

        // Dispatch the event to trigger 3D model rendering
        const event = new CustomEvent("thrDClicked");
        document.dispatchEvent(event);
      } catch (error) {
        console.error("Error processing canvas states:", error);
      }
    }

    function loadTemplateFromUrl() {
      var params = new URLSearchParams(window.location.search);
      var name = params.get("name");
      var id = params.get("id");
      // var templateName = params.get("templateName");
      var key = params.get("key");
      // console.log("This is the template params: ", name, id, templateName);

      if (!key) {
        console.error("No template name found in the URL.");
        return;
      }

      // Modify the DOM elements using jQuery
      var $mainContainer = $("#mini-editor-main-cont");
      var $buttonContainer = $("#webg-buttons-container");

      if ($mainContainer.length && $buttonContainer.length) {
        // Remove the 'personalise-page-active' class from the main container
        $mainContainer.removeClass("personalise-page-active");
        // Add the 'personalise-page-inactive' class to the main container
        $mainContainer.addClass("personalise-page-inactive");

        // Remove the 'toggle-2d-3d-cont' class from the button container
        $buttonContainer.removeClass("toggle-2d-3d-cont");
      } else {
        console.error(
          "Main container or button container not found in the DOM."
        );
      }

      // Fetch the template data using jQuery's AJAX
      $.ajax({
        url: `${baseUrl}/api/v1/user/template/${key}`,
        method: "GET",
        xhrFields: {
          withCredentials: true, // to include credentials (cookies)
        },
        success: function (data) {
          console.log("Template data:", data);

          if (data.src) {
            if (data.src) {
              console.log("✅ srcData (raw):", data.src);
              // console.log(output);
              tabCanvasStates = {};
              tabCanvasStates = data.src;
              console.log(tabCanvasStates);
              allCanvasTabState = data.src;

              console.log(activeTabId);
              console.log(allCanvasTabState);
              loadCanvasState(activeTabId);
            }
          }

          // if (data.src) {
          //   // Fetch the template JSON
          //   $.getJSON(data.src, function (jsonData) {
          //     console.log("Loaded template JSON:", jsonData);
          //     loadJSON(jsonData);
          //   }).fail(function () {
          //     console.error("Error loading template JSON");
          //   });
          // } else {
          //   console.error("No template source URL found in the API response.");
          // }

          // $(document).on('keydown', function(event) {
          //     if (event.key === 'Escape') {
          //         var targetModal = selector.find('.gauci-modal:visible');
          //         if (targetModal.length) {
          //             targetModal.hide();
          //         }
          //     }
          // });

          // selector.find(".gauci-modal-close").on("click", function (e) {
          //     e.preventDefault();
          //     var target = $(this).data("target");
          //     selector.find(target).hide();
          // });
          // if (data.src) {
          //   // Fetch the template JSON
          //   $.getJSON(data.src, function (jsonData) {
          //     console.log("Loaded template JSON:", jsonData);
          //     loadJSON(jsonData);
          //   }).fail(function () {
          //     console.error("Error loading template JSON");
          //   });
          // } else {
          //   console.error("No template source URL found in the API response.");
          // }
          // if (data.src) {
          //   // Fetch the template JSON
          //   $.getJSON(data.src, function (jsonData) {
          //     console.log("Loaded template JSON:", jsonData);
          //     loadJSON(jsonData);
          //   }).fail(function () {
          //     console.error("Error loading template JSON");
          //   });
          // } else {
          //   console.error("No template source URL found in the API response.");
          // }
          // if (data.src) {
          //   // Fetch the template JSON
          //   $.getJSON(data.src, function (jsonData) {
          //     console.log("Loaded template JSON:", jsonData);
          //     loadJSON(jsonData);
          //   }).fail(function () {
          //     console.error("Error loading template JSON");
          //   });
          // } else {
          //   console.error("No template source URL found in the API response.");
          // }
        },
        error: function (xhr, status, error) {
          console.error("Error fetching template:", status, error);
          if (xhr.status === 401) {
            Swal.fire({
              icon: "info",
              title: "Login Required",
              text: "Please log in to view this template.",
            });
          }
        },
      });
    }
    // window.onload = function () {
    //   // Push to the end of the event queue to allow async tasks to settle
    //   setTimeout(loadTemplateFromUrl, 0);
    // };

    $(document).on("keydown", function (event) {
      if (event.key === "Escape") {
        $(".gauci-modal:visible").hide();
      }
    });

    // $(document).on('keydown', function(event) {
    //     if (event.key === 'Escape') {
    //         var targetModal = selector.find('.gauci-modal:visible');
    //         if (targetModal.length) {
    //             targetModal.hide();
    //         }
    //     }
    // });

    // selector.find(".gauci-modal-close").on("click", function (e) {
    //     e.preventDefault();
    //     var target = $(this).data("target");
    //     selector.find(target).hide();
    // });

    //////////////////////* CUSTOM FUNCTIONS *//////////////////////
    settings.customFunctions.call(this, selector, canvas, lazyLoadInstance);
  };
})(jQuery);

const base_URL = CONFIG.BASE_URL;
const admin_URL = CONFIG.ADMIN_URL;

document.addEventListener("DOMContentLoaded", function () {
  const authContainer = document.querySelector(".auth-container");
  let isDropdownOpen = false;

  // Function to check the jwtToken in localStorage and show appropriate UI
  function checkAuthToken() {
    if (localStorage.getItem("jwtToken")) {
      fetchUserRole(); // If token exists, fetch user role and show logged-in UI
    } else {
      showLoggedOutUI(); // If no token, show logged-out UI immediately
    }
  }

  // Check authentication status immediately when the page loads
  checkAuthToken();

  // Listen for changes to localStorage (this works across different tabs)
  window.addEventListener("storage", function (event) {
    if (event.key === "jwtToken") {
      checkAuthToken(); // Re-check token when it is changed or removed
    }
  });

  async function fetchUserRole() {
    try {
      const response = await fetch(`${base_URL}/api/v1/protected-route`, {
        credentials: "include",
      });
      const data = await response.json();
      console.log("this is the data of protected route we got", data);
      localStorage.setItem("email", data.email);
      localStorage.setItem("username", data.username);
      localStorage.setItem("fname", data.firstname);
      localStorage.setItem("profilepic", data.profilepic);
      if (data.role) {
        const isAdmin = data.role === "admin";
        showLoggedInUI(isAdmin);
      } else {
        showLoggedOutUI();
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      showLoggedOutUI();
    }
  }

  fetchUserRole();
  document.getElementById("signupBtn").addEventListener("click", function () {
    console.log("function called");
    showSignupPopup();
  });

  // Function to show the UI when the user is logged in
  function showLoggedInUI(isAdmin) {
    // authContainer.innerHTML = `
    //     <div class="profile-container">
    //       <div class="profile-icon" id="profileIcon"></div>
    //       <div class="hex-header-dropdown" id="dropdownMenu">
    //         <ul>
    //           ${
    //             isAdmin
    //               ? `<li id="adminDashboard">Dashboard</li>`
    //               : `<li id="profile">Profile</li>`
    //           }
    //           <li id="logout">Logout</li>
    //         </ul>
    //       </div>
    //     </div>
    //   `;
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    const firstname = localStorage.getItem("fname");
    authContainer.innerHTML = `
        <div class="profile-container-min-editor">
        <div class="main-cont-profile-data" id="profileIcon">
          <div class="profile-mini-user-cont-data">
           <div class="profile-icon-min-editor" ></div>
            <div class="profile-data-cont-text">
             <p class="profile-data-username">${firstname || "Name"}</p>
             <p class="profile-data-email">${storedEmail || "gmail"}</p>
           </div>
          </div>
          <div>
          <i class="bi bi-chevron-down profile-down-arrow"> </i>
          </div>

        </div>
          <div class="hex-header-dropdown-min-editor" id="dropdownMenu">
          <i class="bi bi-caret-up-fill caret-up-icon"></i>
            <ul>
              ${
                isAdmin
                  ? `<li id="adminDashboard" class="profile-dashboard-li"><i class="bi bi-grid profile-dropdown-icon"></i>Dashboard</li>`
                  : `<li id="profile" class="profile-dashboard-li"><i class="bi bi-person profile-dropdown-icon"></i>Profile</li>`
              }
              <li id="logout" class="profile-logout-li"><i class="bi bi-box-arrow-right profile-dropdown-icon"></i>Logout</li>
            </ul>
          </div>
        </div>
      `;

    const profileIcon = document.getElementById("profileIcon");
    const dropdownMenu = document.getElementById("dropdownMenu");

    dropdownMenu.style.display = "none";

    profileIcon.addEventListener("click", function (event) {
      event.stopPropagation();
      isDropdownOpen = !isDropdownOpen;
      dropdownMenu.style.display = isDropdownOpen ? "block" : "none";
    });

    document.addEventListener("click", function () {
      if (isDropdownOpen) {
        dropdownMenu.style.display = "none";
        isDropdownOpen = false;
      }
    });

    // if (isAdmin) {
    //   document
    //     .getElementById("adminDashboard")
    //     .addEventListener("click", function () {
    //       window.location.href = "http://54.152.205.55:4000/admin-dashboard";
    //     });
    // } else {
    //   document.getElementById("profile").addEventListener("click", function () {
    //     window.location.href = "http://54.152.205.55:4000/profile";
    //   });
    // }
    if (isAdmin) {
      document
        .getElementById("adminDashboard")
        .addEventListener("click", function () {
          window.open(`${admin_URL}/admin-dashboard`, "_blank");
        });
    } else {
      document.getElementById("profile").addEventListener("click", function () {
        window.open(`${admin_URL}/profile`, "_blank");
      });
    }

    document.getElementById("logout").addEventListener("click", handleLogout);
  }

  // Function to show the UI when the user is logged out
  function showLoggedOutUI() {
    authContainer.innerHTML = `
        <div class="auth-buttons">

          <button class="button-min-editor signin-min-editor" id="signinBtn">Sign In</button>
        </div>
      `;

    // document.getElementById("signupBtn").addEventListener("click", function () {
    //   showSignupPopup();
    // });

    // document.getElementById('signupBtn').addEventListener('click', function () {
    //     window.location.href = 'http://54.152.205.55:4000/signup';
    //   });

    document.getElementById("signinBtn").addEventListener("click", function () {
      showLoginPopup();
    });
  }

  // Function to create and show the login popup
  function showLoginPopup() {
    const loginPopupOverlay = document.createElement("div");
    loginPopupOverlay.className = "login-popup-overlay";
    loginPopupOverlay.innerHTML = `
        <div class="login-popup-content">
          <div class="login-img-main-container">
            <div class="login-img-inner-container">
              <h3 class="login-img-head-container">
                Let's create something amazing work with Us.
              </h3>
              <div class="login-img-container">
                <img class="login-img" src="../../assets/custom/login-img.png" />
              </div>
            </div>
          </div>
          <div class="login-content-container">
            <div class="contents">
              <div class="container">
                <div class="row align-items-center justify-content-center">
                  <span class="close-button" id="closeLoginPopup">&times;</span>
                  <div class="login-content-inner-container">
                    <div id="signupError" class="error-message" style="display: none;">
                    <span class="error-icon">&#x26A0;</span>
                    <span class="error-text"></span>
                    </div>
                    <h3>Sign In</h3>
                    <button class="google-login-button" id="googleLoginBtn">
                      <img src="../../assets/custom/googlepng.png" alt="Google icon" /> Sign in with Google
                    </button>
                    <p>Or sign in using your email address</p>
                    <form id="loginForm">
                      <div class="loginFormContainer">
                        <div class="login-input-form-container">
                          <label>User Name</label>
                          <input type="text" id="username" placeholder="Username" required class="input-field" />
                        </div>
                        <div class="login-input-form-container">
                          <label>Password</label>
                          <input type="password" id="loginPassword" placeholder="Password" required class="input-field" />
                              <span class="toggle-password" id="togglePassword">
                               <i class="fas fa-eye" id="eyeIcon"></i>
                             </span>
                        </div>
                      </div>
                      <div class="forgot-password" id="forgotPass-cont">Forgot Password?</div>
                      <div class="sign-in-up-main-cont">
                      <button type="submit" id="loginSubmit" class="login-button sign-up-signin-btn">Sign In</button>
                      <div><p class="sign-up-main-text">Don't Have an account? <span class="sign-up-text-span" id="signupBtn">Sign Up<span></p></div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        `;

    document.body.appendChild(loginPopupOverlay);

    // Show the popup
    loginPopupOverlay.style.display = "block";

    document
      .getElementById("togglePassword")
      .addEventListener("click", function () {
        const passwordInput = document.getElementById("loginPassword");
        const eyeIcon = document.getElementById("eyeIcon");

        // Toggle the type attribute between password and text
        if (passwordInput.type === "password") {
          passwordInput.type = "text";
          eyeIcon.classList.remove("fa-eye");
          eyeIcon.classList.add("fa-eye-slash");
        } else {
          passwordInput.type = "password";
          eyeIcon.classList.remove("fa-eye-slash");
          eyeIcon.classList.add("fa-eye");
        }
      });

    // Close popup on outside click
    window.addEventListener("click", function (event) {
      if (event.target === loginPopupOverlay) {
        closeLoginPopup();
      }
    });

    // Close popup on 'X' click
    document
      .getElementById("closeLoginPopup")
      .addEventListener("click", closeLoginPopup);

    // Handle login form submission
    document
      .getElementById("loginForm")
      .addEventListener("submit", handleLogin);

    document.getElementById("signupBtn").addEventListener("click", function () {
      showSignupPopup();
      closeLoginPopup();
    });

    // Add the Google Sign-In functionality
    document.getElementById("googleLoginBtn").addEventListener("click", () => {
      window.location.href = `${base_URL}/api/v1/auth/google`;
    });

    document
      .getElementById("forgotPass-cont")
      .addEventListener("click", function () {
        window.location.href = `${admin_URL}/reset-password`;
      });
  }

  // Function to handle login logic
  async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("loginPassword").value;
    const signupErrorElement = document.getElementById("signupError");

    const url = window.location.origin;
    const parseUrl = new URL(url);
    const origin = parseUrl.hostname;

    try {
      const response = await fetch(`${base_URL}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          password,
          origin,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("this is the lgoin response", response);
        const token = response.headers.get("authorization");
        if (token) {
          localStorage.setItem("jwtToken", token);
          localStorage.setItem("isLoggedIn", true);
          //   console.log("Login successful!");
          closeLoginPopup();
          await fetchUserRole();
          const profileResponse = await fetch(
            `${base_URL}/api/v1/user/profile`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                // Optionally send the token in the Authorization header if required
                Authorization: `Bearer ${token}`,
              },
              credentials: "include", // Send cookies
            }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            // console.log("User profile data:", profileData);
            localStorage.setItem("email", profileData.email);
            localStorage.setItem("username", profileData.username);
            localStorage.setItem("fname", profileData.firstname);
            localStorage.setItem("profilepic", profileData.profilepic);
          } else {
            console.error("Failed to fetch user profile data.");
          }
        } else {
          console.error("Login successful, but no token found.");
          //   toastr.error("Login successful, but no token found.");
          // Swal.fire({
          //     icon: 'error',
          //     title: 'Please try again',
          //     text: 'Login successful, but no token found',
          //   });
          signupErrorElement.style.display = "flex";
          signupErrorElement.querySelector(".error-text").textContent =
            "Login failed. Please check your credentials!";
        }
      } else {
        console.error("Login failed. Please check your credentials.");
        // toastr.error("Login failed. Please check your credentials.");
        // Swal.fire({
        //     icon: 'error',
        //     title: 'Failed',
        //     text: 'Login failed, Please check your credentials.',
        //   });
        signupErrorElement.style.display = "flex";
        signupErrorElement.querySelector(".error-text").textContent =
          "Login failed. Please check your credentials!";
      }
    } catch (error) {
      console.error("Error during login:", error);
      //   toastr.error("Error during login:", error);
      const errResponse =
        error?.response?.data?.error ||
        error.message ||
        "Login failed. Please try again!";
      const errorMessage = errResponse.split(":")[0];
      signupErrorElement.style.display = "flex";
      signupErrorElement.querySelector(".error-text").textContent =
        errorMessage;

      // Swal.fire({
      //   icon: 'error',
      //   title: 'Login Failed',
      //   text: errorMessage,
      //   showConfirmButton: true,
      // });
    }
  }

  // Function to close the login popup
  function closeLoginPopup() {
    const loginPopup = document.querySelector(".login-popup-overlay");
    if (loginPopup) {
      loginPopup.remove();
    }
  }

  // Function to create and show the signup popup
  function showSignupPopup() {
    const signupPopupOverlay = document.createElement("div");
    signupPopupOverlay.className = "signup-popup-overlay";

    signupPopupOverlay.innerHTML = `
    <div class="login-popup-content">
      <div class="login-img-main-container">
        <div class="login-img-inner-container">
          <h3 class="login-img-head-container">
            Let's create something amazing work with Us.
          </h3>
          <div class="login-img-container">
            <img class="login-img" src="../../assets/custom/login-img.png" />
          </div>
        </div>
      </div>
      <div class="login-content-container">
        <div class="contents">
          <div class="container">
            <div class="row align-items-center justify-content-center">
              <span class="close-button" id="closeSignupPopup">&times;</span>
              <div class="login-content-inner-container">

                <div id="signupErrortwo" class="error-message" style="display: none;">
                <span class="error-icon">&#x26A0;</span>
                <span class="error-text"></span>
                </div>

                <h3>Sign Up</h3>
                <button class="google-login-button" id="googleSignupBtn">
                  <img src="../../assets/custom/googlepng.png" alt="Google icon" />  Sign Up with Google
                </button>

                <p>Or sign Up using your email address</p>
                <form id="signupForm">
                  <div class="loginFormContainer">
                    <div class="login-input-form-container">
                      <label>First Name</label>
                      <input type="text" id="firstName" placeholder="First Name" required class="input-field" />
                    </div>
                    <div class="login-input-form-container">
                      <label>Last Name</label>
                      <input type="text"  id="lastName"  placeholder="Last Name" required class="input-field" />
                    </div>
                  </div>
                  <div class="loginFormContainer">
                    <div class="login-input-form-container">
                      <label>Email</label>
                      <input type="email" id="email" placeholder="Email"  required class="input-field" />
                    </div>
                    <div class="login-input-form-container">
                      <label>Username</label>
                      <input type="text" id="username" placeholder="Username" required class="input-field" />
                    </div>
                  </div>
                   <div class="loginFormContainer">
                    <div class="login-input-form-container">
                      <label>Password</label>
                      <input type="password" id="signupPassword" placeholder="Password" required class="input-field" />

                          <span class="toggle-password" id="toggleSignupPassword">
                             <i class="fas fa-eye" id="signupEyeIcon"></i>
                          </span>
                    </div>

                  </div>
                  <div class="sign-in-up-main-cont">
                  <button type="submit" id="signupSubmit" class="login-button sign-up-signin-btn">Sign Up</button>
                  <div><p class="sign-up-main-text">Already Have an account? <span class="sign-up-text-span" id="signinBtnInSignUp">Sign in<span></p></div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    `;

    document.body.appendChild(signupPopupOverlay);

    // Show the popup
    signupPopupOverlay.style.display = "block";

    document
      .getElementById("toggleSignupPassword")
      .addEventListener("click", function () {
        const signupPasswordInput = document.getElementById("signupPassword");
        const signupEyeIcon = document.getElementById("signupEyeIcon");

        // Toggle the type attribute between password and text
        if (signupPasswordInput.type === "password") {
          signupPasswordInput.type = "text";
          signupEyeIcon.classList.remove("fa-eye");
          signupEyeIcon.classList.add("fa-eye-slash");
        } else {
          signupPasswordInput.type = "password";
          signupEyeIcon.classList.remove("fa-eye-slash");
          signupEyeIcon.classList.add("fa-eye");
        }
      });

    // Close popup on outside click
    window.addEventListener("click", function (event) {
      if (event.target === signupPopupOverlay) {
        closeSignupPopup();
      }
    });

    // Close popup on 'X' click
    document
      .getElementById("closeSignupPopup")
      .addEventListener("click", closeSignupPopup);

    // Handle signup form submission
    document
      .getElementById("signupForm")
      .addEventListener("submit", handleSignup);
    document
      .getElementById("signinBtnInSignUp")
      .addEventListener("click", function () {
        closeSignupPopup();
        // console.log("sign in pop up");
        showLoginPopup();
      });

    document.getElementById("googleSignupBtn").addEventListener("click", () => {
      window.location.href = `${base_URL}/api/v1/auth/google`;
    });
  }

  async function handleSignup(e) {
    e.preventDefault();

    const firstname = document.getElementById("firstName").value;
    const lastname = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("signupPassword").value;
    const signupErrorElement = document.getElementById("signupErrortwo");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernamePattern = /^[a-zA-Z0-9]{4,20}$/;

    if (!firstname) {
      toastr.warning("First name is required.");
      return;
    }

    if (!lastname) {
      toastr.warning("Last name is required.");
      return;
    }

    if (!emailPattern.test(email)) {
      toastr.warning("Please enter a valid email address.");
      return;
    }

    if (!usernamePattern.test(username)) {
      toastr.warning(
        "Username must be alphanumeric and between 4-20 characters."
      );
      return;
    }

    if (password.length < 6) {
      toastr.warning("Password must be at least 5 characters long.");
      return;
    }

    try {
      const response = await fetch(`${base_URL}/api/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Send as JSON
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          username,
          password,
        }),
        credentials: "include",
      });

      if (response.ok) {
        // If signup is successful
        console.log("Signup successful!");
        console.log(response);
        const token = response.headers.get("authorization");
        if (token) {
          closeSignupPopup();
          localStorage.setItem("email", email);
          localStorage.setItem("username", username);
          localStorage.setItem("fname", firstname);
          localStorage.setItem("jwtToken", token);
          localStorage.setItem("isLoggedIn", true);

          await fetchUserRole();
        }
      } else {
        // If signup fails (HTTP error status)
        const errorResponse = await response.json();
        console.log(errorResponse);
        const errorMessage =
          errorResponse?.error || "Signup failed. Please try again.";
        signupErrorElement.style.display = "flex";
        signupErrorElement.querySelector(".error-text").textContent =
          errorMessage;
      }
    } catch (error) {
      // For network errors or exceptions
      console.error("Error during signup:", error);
      const errorMessage =
        error.message || "An unexpected error occurred. Please try again.";
      signupErrorElement.style.display = "flex";
      signupErrorElement.querySelector(".error-text").textContent =
        errorMessage;
    }
  }

  // Function to close the signup popup
  function closeSignupPopup() {
    const signupPopup = document.querySelector(".signup-popup-overlay");
    if (signupPopup) {
      signupPopup.remove();
    }
  }

  // Function to handle logout action
  function handleLogout() {
    fetch(`${base_URL}/api/v1/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response) {
          console.log("Logout successful");
          localStorage.removeItem("jwtToken");
          // localStorage.removeItem("isLoggedIn");
          localStorage.setItem("isLoggedIn", false);
          //   window.location.reload();
          // const isAdmin = data.role === "admin";
          showLoggedOutUI();
        } else {
          response.json().then((data) => {
            console.error("Logout failed:", data.message || "Unknown error");
            // alert("Logout failed. Please try again.");
            // toastr.error("Logout failed. Please try again.");
            // Swal.fire({
            //     icon: 'error',
            //     title: 'Failed',
            //     text: 'Logout failed. Please try again.',
            //   });
          });
        }
      })
      .catch((error) => {
        console.error("Logout request failed:", error);
        // alert(
        //   "Logout request failed. Please check your connection and try again."
        // );
      });
  }
});
