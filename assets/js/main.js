
$(function(){

    $(window).on('load', function () {
        $('.page-loader').delay('500').fadeOut(1000);
    });

    $(document).ready(function() {

        $(document).on('click', '.icon-menu', function() {
            $('.responsive-sidebar-menu').addClass('active');
        });
        $(document).on('click', '.responsive-sidebar-menu .overlay', function() {
            $('.responsive-sidebar-menu').removeClass('active');
        });

        $(document).on('click', '.menu li .scroll-to', function() {
            $('.responsive-sidebar-menu').removeClass('active');
        })


        $(document).on('click', ".color-boxed a", function() {
            $(".color-boxed a").removeClass("clr-active");
            $(this).addClass("clr-active");
        });
        
        $(document).on('click', ".global-color .setting-toggle", function() {
            $(".global-color").addClass("active");
        });

        $(document).on('click', ".global-color .inner .overlay, .global-color .inner .global-color-option .close-settings", function() {
            $(".global-color").removeClass("active");
        });

    });

    $(window).scroll(function() {
            
        var windscroll = $(window).scrollTop();
        if (windscroll >= 0) {
            $('.page-section').each(function(i) {
                if ($(this).position().top <= windscroll - -1) {
                    $('.scroll-nav .scroll-to.active').removeClass('active');
                    $('.scroll-nav .scroll-to').eq(i).addClass('active');
                    $('.scroll-nav-responsive a.active').removeClass('active');
                    $('.scroll-nav-responsive a').eq(i).addClass('active');
                }
            });

        } else {

            $('.scroll-nav .scroll-to.active').removeClass('active');
            $('.scroll-nav .scroll-to:first').addClass('active');
            $('.scroll-nav-responsive a.active').removeClass('active');
            $('.scroll-nav-responsive a:first').addClass('active');
        }

        if (windscroll >= 0) {
            $('.scroll-to-page').each(function(i) {

                var wscrolldecress = windscroll + 1;
                // console.log(wscrolldecress);
                if ($(this).position().top <= wscrolldecress - 0) {
                    $('.scroll-nav .scroll-to.active').removeClass('active');
                    $('.scroll-nav .scroll-to').eq(i).addClass('active');
                    $('.scroll-nav-responsive a.active').removeClass('active');
                    $('.scroll-nav-responsive a').eq(i).addClass('active');
                }
            });

        } else {
            $('.scroll-nav .scroll-to.active').removeClass('active');
            $('.scroll-nav .scroll-to:first').addClass('active');
            $('.scroll-nav-responsive a.active').removeClass('active');
            $('.scroll-nav-responsive a:first').addClass('active');
        }

    }).scroll();







    if ($('.testimonial-slider').length) {
        var testimonial = $('.testimonial-slider').owlCarousel({
            items: 1,
            margin: 30,
            stagePadding: 0,
            smartSpeed: 450,
            autoHeight: true,
            loop: false,
            nav: false,
            dots: false,
            onInitialized  : counter, //When the plugin has initialized.
            onTranslated : counter //When the translation of the stage has finished.
        });

        $('.testimonial-nav .next').on('click', function() {
            testimonial.trigger('next.owl.carousel');
        })
        $('.testimonial-nav .prev').on('click', function() {
            testimonial.trigger('prev.owl.carousel', [300]);
        })


        function counter(event) {
            var element   = event.target;         // DOM element, in this example .owl-carousel
            var items     = event.item.count;     // Number of items
            var item      = event.item.index + 1;     // Position of the current item
        
        // it loop is true then reset counter from 1
        if(item > items) {
                item = item - items
        }
        $('#testimonial-slide-count').html("<span class='left'>"+item+"</span> / "+items)
        }
    }

    // function remove_is_active() {
    //     $(".menu .scroll-to").removeClass("active");
    // }

    // gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // var container = document.querySelector("#smooth-content");

    // var height;
    // function setHeight() {
    //     height = container.clientHeight;


    //     document.body.style.height = height + "px";
    // }
    // ScrollTrigger.addEventListener("refreshInit", setHeight);

    // gsap.to(container, {
    //     y: () => -(height - document.documentElement.clientHeight),
    //     ease: "none",
    //     scrollTrigger: {
    //         trigger: container,
    //         start: "top top",
    //         end: "bottom bottom",
    //         scrub: 1,
    //         invalidateOnRefresh: true,
    //     }
    // });

    window.addEventListener('scroll', {
        scroll_animations,
    });


    // Array.prototype.slice.call(document.querySelectorAll(".page-section")).forEach(function (e, t) {
    //     ScrollTrigger.create({
    //         trigger: e,
    //         id: t + 1,
    //         start: "top center",
    //         end: function () {
    //             return "+=".concat(e.clientHeight - 30);
    //         },
    //         toggleActions: "play reverse none reverse",
    //         toggleClass: { targets: e, className: "active" },
    //         onToggle: function () {
    //             $(".menu .scroll-to").removeClass("active"), "" != e.id && $('.menu .scroll-to[href*="#' + e.id + '"]').addClass("active");
    //         },
    //     });
    // });

    // document.querySelectorAll('.scroll-to').forEach((e) => {
    //     const target = e.getAttribute('href');
    //     const targetEl = document.querySelector(target);
    //     // const targetRect = targetEl.getBoundingClientRect();


    //     var offset = gsap.getProperty("#smooth-content", "y");
    //     var position = jQuery(target).get(0).getBoundingClientRect().top - offset;
    

    //     e.addEventListener('click', (e) => {
    //         e.preventDefault();

    //         gsap.to(window, {
    //             scrollTo: position,
    //             ease: "power4",
    //             duration: 0.1,
    //             onToggle: function () {
    //                 console.log('toggle');
    //                 remove_is_active();
    //                 if (targetEl.id != "") $('.menu .scroll-to[href*="#' + targetEl.id + '"]').addClass("active");
    //             },
    //             onLeaveBack: function () {
    //                 console.log('leave back');
    //                 remove_is_active();
    //                 if (targetEl.id != "") $('.menu .scroll-to[href*="#' + targetEl.id + '"]').addClass("active");
    //             },
    //             onLeave: function () {
    //                 console.log('leave');
    //                 remove_is_active();
    //                 if (targetEl.id != "") $('.menu .scroll-to[href*="#' + targetEl.id + '"]').addClass("active");
    //             },
    //             overwrite: !0,
    //         });
    //     });

        
    
    // });

});



// ========== PARTICLES.JS INIT ==========
if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
    particlesJS('particles-js', {
        particles: {
            number: { value: 60, density: { enable: true, value_area: 900 } },
            color: { value: '#28e98c' },
            shape: { type: 'circle' },
            opacity: { value: 0.15, random: true, anim: { enable: true, speed: 0.4, opacity_min: 0.05, sync: false } },
            size: { value: 2, random: true, anim: { enable: true, speed: 1.5, size_min: 0.5, sync: false } },
            line_linked: { enable: true, distance: 150, color: '#28e98c', opacity: 0.06, width: 1 },
            move: { enable: true, speed: 0.6, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: false }, onclick: { enable: false }, resize: true }
        },
        retina_detect: true
    });
}

// ========== CUSTOM CURSOR ==========
(function(){
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    if (!dot || !outline) return;
    if (window.innerWidth <= 767) return;

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    function animateOutline() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        outline.style.left = outlineX + 'px';
        outline.style.top = outlineY + 'px';
        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    document.querySelectorAll('a, button, .tech-badge, .skill-tag, .service-item, .portfolio-item, .theme-btn, .icon-menu').forEach(function(el) {
        el.addEventListener('mouseenter', function() { outline.classList.add('hover'); });
        el.addEventListener('mouseleave', function() { outline.classList.remove('hover'); });
    });
})();

function scroll_animations() {
    // var allow_on_mobile = !0;
    // if (typeof config_scroll_animation_on_mobile !== "undefined") allow_on_mobile = config_scroll_animation_on_mobile;
    // if (allow_on_mobile == !1 && is_mobile_device) return;
    var defaults = {
        duration: 1.2,
        ease: "power4.out",
        animation: "fade_from_bottom",
        once: !1,
    };
    gsap.utils.toArray(".scroll-animation").forEach(function (box) {
        var gsap_obj = {};
        var settings = {
            // ease: box.dataset.animationEase || defaults.ease,
            duration: box.dataset.animationDuration || defaults.duration,
        };
        var animations = {
            fade_from_bottom: {
                y: 180,
                opacity: 0,
            },
            fade_from_top: {
                y: -180,
                opacity: 0,
            },
            fade_from_left: {
                x: -180,
                opacity: 0,
            },
            fade_from_right: {
                x: 180,
                opacity: 0,
            },
            fade_in: {
                opacity: 0,
            },
            rotate_up: {
                y: 180,
                rotation: 10,
                opacity: 0,
            },
        };
        var scroll_trigger = {
            scrollTrigger: {
                trigger: box,
                once: defaults.once,
                start: "top bottom+=20%",
                // start: "top bottom+=5%",
                toggleActions: "play none none reverse",
                markers: !1,
            },
        };
        jQuery.extend(gsap_obj, settings);
        jQuery.extend(gsap_obj, animations[box.dataset.animation || defaults.animation]);
        jQuery.extend(gsap_obj, scroll_trigger);
        gsap.from(box, gsap_obj);
    });
}
scroll_animations();