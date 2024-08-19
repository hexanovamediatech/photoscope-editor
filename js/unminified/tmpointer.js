(function($) {
    "use strict"; 
    $.fn.tmpointer = function (options) {    
        var selector = $(this); 
        // Default settings
        var settings = $.extend({
            id: 1,
            icon: 'disable',
            click_anim: 'none',
            image: 'disable',
            cursor_class: 'tm-cursor tm-pointer-simple',
            node_class: 'tm-node tm-pointer-simple',
            cursor: 'enable',
            node: 'enable',
            cursor_velocity: 1,
            node_velocity: 0.1,
            native_cursor: 'disable',
            elements_to_hover: ['a'],
            cursor_class_hover: 'tm-expand',
            node_class_hover: 'tm-expand',
            hide_mode: 'disable',
            hide_timing: 3000
        }, options);

        // Create the elements

        if (settings.cursor === 'enable') {
            if (settings.icon !== 'disable') {
                $('body').append('<div id="tm-cursor-' + settings.id + '" class="' + settings.cursor_class + '"><i class="' + settings.icon + '"></i></div>');
            } else if (settings.image !== 'disable') {
                $('body').append('<div id="tm-cursor-' + settings.id + '" class="' + settings.cursor_class + '"><img src="' + settings.image + '" /></div>');
            } else {
                $('body').append('<div id="tm-cursor-' + settings.id + '" class="' + settings.cursor_class + '"></div>');
            }
        }

        if (settings.node === 'enable') {
            $('body').append('<div id="tm-node-' + settings.id + '" class="' + settings.node_class + '"></div>');
        }

        if (!selector.is('body')) {
            selector.addClass('tm-pointer-wrapper');
        }

        var node, cursor;
        var timer;
        var request;
        var playing = false;
        var cursor_mouseX = 0;
        var cursor_mouseY = 0;
        var node_mouseX = 0;
        var node_mouseY = 0;
        var cursor_xp = 0;
        var cursor_yp = 0;
        var node_xp = 0;
        var node_yp = 0;

        /////////////////////////////

        // markups selectors, set cursor, get cursor / node w/h / 2

        /////////////////////////////

        cursor = $('body').find('#tm-cursor-' + settings.id);
        node = $('body').find('#tm-node-' + settings.id);

        if (settings.cursor === 'enable') {
            // get cursor / node w/h / 2
            var cursor_width = cursor.width() / 2;
            var cursor_height = cursor.width() / 2;
        }

        if (settings.node === 'enable') {
            var node_width = node.width() / 2;
            var node_height = node.width() / 2;
        }

        // set css for cursor
        if (settings.native_cursor == 'disable') {
            selector.addClass('tm-cursor-none');
        }

        /////////////////////////////

        // remove elements on touch devices since there is no need to use custom cursor

        /////////////////////////////

        function destroy() {
            cursor.remove();
            node.remove();
            selector.removeClass('tm-cursor-none');
        }

        if ('ontouchstart' in window) {
            destroy();
        }

        /////////////////////////////

        // mouse stop moving

        /////////////////////////////

        function mouseStopped() {
            // if mouse stop moving remove class moving 
            // it will hide the circle with opacity transition 

            playing = false;
        }

        /////////////////////////////

        // mousemove, mouseenter, mouseleave, mousedown

        /////////////////////////////

        $('body').on('mousemove', function(e) {
            // if mouse start moving add class moving
            // it will show the circle with opacity transition 
            playing = true;

            if (settings.cursor === 'enable') {
                // get the mouse position minus 3px to center the circle
                cursor_mouseX = e.clientX - cursor_width;
                cursor_mouseY = e.clientY - cursor_height;
            }
            if (settings.node === 'enable') {
                // get the mouse position minus 6px to center the node
                node_mouseX = e.clientX - node_width;
                node_mouseY = e.clientY - node_height;
            }

            if (settings.hide_mode === 'enable') {
                hide_cursor();
            }

            if (selector.is('body')) {
                $('body').find('.tm-pointer-wrapper').on('mouseenter', function() {
                    cursor.css('visibility','hidden');
                    node.css('visibility','hidden');
                });
                $('body').find('.tm-pointer-wrapper').on('mouseleave', function() {
                    cursor.css('visibility','visible');
                    node.css('visibility','visible');
                });
            }

            function hide_cursor() {
                clearTimeout(timer);
                timer = setTimeout(mouseStopped, settings.hide_timing);
            }
        });

        if (selector.is('body')) {
            selector.one('mousemove', function() {
                cursor.css('visibility','visible');
                node.css('visibility','visible');
            });

            // Disable on WP admin bar
            $('#wpadminbar').on('mouseenter', function() {
                cursor.css('visibility','hidden');
                node.css('visibility','hidden');
                cursor.removeClass(settings.cursor_class_hover);
                node.removeClass(settings.node_class_hover);
            });
            $('#wpadminbar').on('mouseleave', function() {
                cursor.css('visibility','visible');
                node.css('visibility','visible');
                cursor.removeClass(settings.cursor_class_hover);
                node.removeClass(settings.node_class_hover);
            });
        } else {
            selector.on('mouseenter', function() {
                cursor.css('visibility','visible');
                node.css('visibility','visible');
            });
            selector.on('mouseleave', function() {
                cursor.css('visibility','hidden');
                node.css('visibility','hidden');
            });
        }

        if (settings.click_anim === 'dark' || settings.click_anim === 'light') {
            selector.on('mousedown', function(e) {
                var left = e.clientX;
                var top = e.clientY;
                $(this).append('<div class="tm-click tm-click-'+settings.click_anim+'" style="top:'+top+'px;left:'+left+'px;"></div>');
                setTimeout(function(){
                    $(this).find('.tm-click:first-of-type').remove();
                },1000);
            });
        }

        if (settings.elements_to_hover !== 'disable' && $.isArray(settings.elements_to_hover)) {
            $.each( settings.elements_to_hover, function(i, val) {
                selector.find(val).on('mouseenter', function(e) {
                    if (settings.cursor === 'enable' && cursor.css('visibility') == 'visible' && settings.cursor_class_hover !== 'disable') {
                        cursor.addClass(settings.cursor_class_hover);
                    }
                    if (settings.node === 'enable' && node.css('visibility') == 'visible' && settings.node_class_hover !== 'disable') {
                        node.addClass(settings.node_class_hover);
                    }
                });
                selector.find(val).on('mouseleave', function(e) {
                    if (settings.cursor === 'enable' && cursor.css('visibility') == 'visible' && cursor.hasClass(settings.cursor_class_hover)) {
                        cursor.removeClass(settings.cursor_class_hover);
                    }
                    if (settings.node === 'enable' && node.css('visibility') == 'visible' && node.hasClass(settings.node_class_hover)) {
                        node.removeClass(settings.node_class_hover);
                    }   
                });
            });
        }

        /////////////////////////////

        // render

        /////////////////////////////

        function render() {

            if (playing === true) {

                if (settings.cursor === 'enable') {
                    cursor.addClass('moving');
                    // change 12 to alter damping higher is slower
                    cursor_xp += ((cursor_mouseX - cursor_xp) * settings.cursor_velocity);
                    cursor_yp += ((cursor_mouseY - cursor_yp) * settings.cursor_velocity);

                    cursor.css({
                        left: cursor_xp + 'px',
                        top: cursor_yp + 'px'
                    });
                }
                if (settings.node === 'enable') {
                    node.addClass('moving');

                    node_xp += ((node_mouseX - node_xp) * settings.node_velocity);
                    node_yp += ((node_mouseY - node_yp) * settings.node_velocity);

                    node.css({
                        left: node_xp + 'px',
                        top: node_yp + 'px'
                    }); //
                }

            } else {

                if (settings.cursor === 'enable') {
                    cursor.removeClass('moving');
                }
                if (settings.node === 'enable') {
                    node.removeClass('moving');
                }

                cancelAnimationFrame(request);

            }

            request = requestAnimationFrame(render);
        }

        request = requestAnimationFrame(render);
        

        /////////////////////////////

        // helpers

        /////////////////////////////

        window.requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

    };

})(jQuery);