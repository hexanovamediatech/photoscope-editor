
(function($) {
    "use strict";

    $(document).ready(function () {
        /* Initialize gauci plugin */
        $('#gauci').gauci({
            baseURL: "./", // The url of the main directory. For example; "http://www.mysite.com/gauci-js/"

            //////////////////////* CANVAS SETTINGS *//////////////////////
            fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif", // Should be a web safe font
            fontSize: 60, // Default font size
            fontWeight: 'normal', // e.g. bold, normal, 400, 600, 800
            fontStyle: 'normal', // Possible values: "", "normal", "italic" or "oblique".
            canvasColor: 'transparent', // Canvas background color
            fill: '#000', // Default text color
            stroke: '#fff', // Default stroke color
            strokeWidth: 0, // Default stroke width
            textBackgroundColor: 'rgba(255,255,255,0)', // Default text background color
            textAlign: 'left', // Possible values: "", "left", "center" or "right". 
            lineHeight: 1.2, // Default line height.
            borderColor: '#000', // Color of controlling borders of an object (when it's active).
            borderDashArray: [4, 4], // Array specifying dash pattern of an object's borders (hasBorder must be true).
            borderOpacityWhenMoving: 0.5, // Opacity of object's controlling borders when object is active and moving.
            borderScaleFactor: 2, // Scale factor of object's controlling borders bigger number will make a thicker border border is 1, so this is basically a border thickness since there is no way to change the border itself.
            editingBorderColor: 'rgba(0,0,0,0.5)', // Editing object border color.
            cornerColor: '#fff', // Color of controlling corners of an object (when it's active).
            cornerSize: 12, // Size of object's controlling corners (in pixels).
            cornerStrokeColor: '#000', // Color of controlling corners of an object (when it's active and transparentCorners false).
            cornerStyle: 'circle', // Specify style of control, 'rect' or 'circle'.
            transparentCorners: false, // When true, object's controlling corners are rendered as transparent inside (i.e. stroke instead of fill).
            cursorColor: '#000', // Cursor color (Free drawing)
            cursorWidth: 2, // Cursor width (Free drawing)
            enableGLFiltering: true, // set false if you experience issues on image filters.
            textureSize: 4096, // Required for enableGLFiltering
            watermark: false, // true or false
            watermarkText: 'https://gauci.website/', // The watermark text
            watermarkFontFamily: 'Georgia, serif', // Should be a web safe font
            watermarkFontStyle: 'normal', // Possible values: "", "normal", "italic" or "oblique".
            watermarkFontColor: '#000', // Watermark font color
            watermarkFontSize: 40, // Watermark font size (integer only)
            watermarkFontWeight: 'bold', // e.g. bold, normal, 400, 600, 800
            watermarkBackgroundColor: '#FFF', // Watermark background color
            watermarkLocation: 'bottom-right', // Possible values: "bottom-right", "bottom-left", "top-left" and "top-right".

            //////////////////////* CUSTOM FUNCTIONS *//////////////////////
            customFunctions: function(selector, canvas, lazyLoadInstance) {
                /**
                 * @see http://fabricjs.com/fabric-intro-part-1#canvas
                 * You may need to update "lazyLoadInstance" if you are going to populate items of a grid with ajax. 
                 * lazyLoadInstance.update();
                 * @see https://github.com/verlok/vanilla-lazyload
                 */

                /* Template - Add to Favorite */
                selector.find('.template-grid').on('click','.template-favorite button.star',function(){
                    var button = $(this);
                    var templateid = button.data('templateid');
                    
                    /* Do what you want */
                    
                    toastr.success("To make 'saving functions' work, you should have a database on your server and integrate it to gauci using a server-side language. See Documentation -> Integration.", "Info");
                    // toastr.error("Error!", "Lorem ipsum dolor");
                });

                /* Frame - Add to Favorite */
                selector.find('.gauci-frames-grid').on('click','.frame-favorite button.star',function(){
                    var button = $(this);
                    var frameid = button.data('frameid');
                    
                    /* Do what you want */

                    toastr.success("To make 'saving functions' work, you should have a database on your server and integrate it to gauci using a server-side language. See Documentation -> Integration.", "Info");
                    // toastr.error("Error!", "Lorem ipsum dolor");
                });

                /* Element - Add to Favorite */
                selector.find('.gauci-grid').on('click','.element-favorite button.star',function(){
                    var button = $(this);
                    var elementid = button.data('elementid');
                    
                    /* Do what you want */

                    toastr.success("To make 'saving functions' work, you should have a database on your server and integrate it to gauci using a server-side language. See Documentation -> Integration.", "Info");
                    // toastr.error("Error!", "Lorem ipsum dolor");
                });

                /* Delete Template From Library */
                selector.find('.gauci-template-list').on('click','.gauci-template-delete',function(){
                    var answer = window.confirm("Are you sure you want to delete the template permanently?");
                    if (answer) {
                        var target = $(this).data('target');
                        $(this).parent().parent().remove();

                        /* Do what you want */

                        toastr.success("To make 'saving functions' work, you should have a database on your server and integrate it to gauci using a server-side language. See Documentation -> Integration.", "Info");
                        // toastr.error("Error!", "Lorem ipsum dolor");
                    }
                });

                /* Upload Image To Media Library */
                selector.find('#gauci-library-upload-img').on('change', function (e) {
                    var file_data = this.files[0];

                    /* Do what you want */

                    toastr.success("To make 'saving functions' work, you should have a database on your server and integrate it to gauci using a server-side language. See Documentation -> Integration.", "Info");
                    // toastr.error("Error!", "Lorem ipsum dolor");
                });

                /* Delete Image From Media Library */
                selector.find('.media-library-grid').on('click','.gauci-library-delete',function(){
                    var answer = window.confirm("Are you sure you want to delete the image permanently?");
                    if (answer) {
                        var target = $(this).data('target');
                        $(this).parent().remove();

                        /* Do what you want */

                        toastr.success("Deleted!", "Lorem ipsum dolor");
                        // toastr.error("Error!", "Lorem ipsum dolor");
                    }
                });

                /* Upload SVG To Media Library */
                selector.find('#gauci-svg-library-upload-img').on('change', function (e) {
                    var file_data = this.files[0];

                    /* Do what you want */

                    toastr.success("To make 'saving functions' work, you should have a database on your server and integrate it to gauci using a server-side language. See Documentation -> Integration.", "Info");
                    // toastr.error("Error!", "Lorem ipsum dolor");
                });

                /* Delete SVG From Media Library */
                selector.find('.svg-library-grid').on('click','.gauci-svg-library-delete',function(){
                    var answer = window.confirm("Are you sure you want to delete the image permanently?");
                    if (answer) {
                        var target = $(this).data('target');
                        $(this).parent().remove();

                        /* Do what you want */

                        toastr.success("Deleted!", "Lorem ipsum dolor");
                        // toastr.error("Error!", "Lorem ipsum dolor");
                    }
                });

                // Save preferences
                selector.find('#gauci-preferences-save').on('click', function() {
                    var button = $(this);
                    var settings = {};
                    var keys = [];
                    var values = [];
                    selector.find('#gauci-preferences .preference').each(function(index, value) {
                        keys.push($(this).attr('id'));
                        values.push($(this).val());
                    });

                    for (let i = 0; i < keys.length; i++) {
                        settings[keys[i]] = values[i];
                    }

                    var preferences = JSON.stringify(settings);

                    /* Do what you want */

                    toastr.success("To make 'saving functions' work, you should have a database on your server and integrate it to gauci using a server-side language. See Documentation -> Integration.", "Info");
                    // toastr.error("Error!", "Lorem ipsum dolor");

                });
            },

            //////////////////////* SAVE TEMPLATE *//////////////////////
            saveTemplate: function(selector, template) {
                /**
                 * var template is JSON string
                 * @see http://fabricjs.com/docs/fabric.Canvas.html#toDataURL
                 */

                // var name = selector.find('#gauci-json-save-name').val();
                
                console.log(template);

                /* Do what you want */

                toastr.success("To make 'saving functions' work, you should have a database on your server and integrate it to gauci using a server-side language. See Documentation -> Integration.", "Info");
                // toastr.error("Error!", "Lorem ipsum dolor");
            },

            //////////////////////* SAVE IMAGE *//////////////////////
            saveImage: function(selector, imgData) {
                var name = selector.find('#gauci-save-img-name').val();
                var quality = parseFloat(selector.find('#gauci-save-img-quality').val());
                var format = selector.find('#gauci-save-img-format').val();

                if (format == 'svg') {
                    // var imgData is raw svg code
                    console.log(imgData);

                    /* Do what you want */
                } else {
                    /**
                     * var imgData is DataURL
                     * @see https://flaviocopes.com/data-urls/
                     * @see http://fabricjs.com/docs/fabric.Canvas.html#toDataURL
                     */
                    console.log(imgData);

                    /* Do what you want */
                }

                toastr.success("To make 'saving functions' work, you should have a database on your server and integrate it to gauci using a server-side language. See Documentation -> Integration.", "Info");
                // toastr.error("Error!", "Lorem ipsum dolor");
            }
        });

       
        $("#gauci-bg-color").on("change", function() {
            var backgroundColor = $(this).val();
            $('#gauci-canvas').css('background-color', backgroundColor);
            // Additional code for your canvas functionality if needed
        });

        $('.gauci-icon-menu-btn').hover(
            function() { // Hover in
                $(this).find('.gauci-hover-img').show();
                $(this).find('.gauci-normal-state-img').hide();
            },
            function() { // Hover out
                $(this).find('.gauci-hover-img').hide();
                $(this).find('.gauci-normal-state-img').show();
            }
        );   
        
    });

    $(document).ready(function() {
        // Click event handler for the custom shape container
        $('#gauci-shape-select').trigger('click');

    });

   

})(jQuery);

