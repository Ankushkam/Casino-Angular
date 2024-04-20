(function ($) {
	"use strict";

	// Header scroll class
	$(window).scroll(function () {
		if ($(this).scrollTop() > 40) {
			$('#header').addClass('header-sticky');
		} else {
			$('#header').removeClass('header-sticky');
		}
	});

	$(function () {
		$(".header-toggle").click(function (e) {
			e.preventDefault();
			$(".left_sidebar").toggleClass("open-sidebar");
		});
	});

	$(function () {
		$(".close_sidebar").click(function (e) {
			e.preventDefault();
			$(".left_sidebar").removeClass("open-sidebar");
		});
	});

	$(function () {
		$(".edit_btn .btn").click(function (e) {
			e.preventDefault();
			$(".profile_info").hide();
			$(".edit_profile").show();
		});
	});

	// Country hide
	$(function () {
		$(".select_contry").click(function (e) {
			e.preventDefault();
			$(".country_modal").show();
		});
	});
	$(function () {
		$(".c_close").click(function (e) {
			e.preventDefault();
			$(".country_modal").hide();
		});
	});
	$(function(){

		$(':input[type=number]').on('mousewheel',function(e){ $(this).blur(); });
	  
	  }); 

	// Password Input
	$(function () {
		$(".input-pwd").click(function (e) {
			e.preventDefault();
			$(this).toggleClass("show");
		});
		/* if ($(".input-pwd").hasClass("show")) {
		  $("input[type='password']").attr("type","text");
		} 
		else{
			$("#password").attr("type","password");		   
		} */
	});


	// Slick Tab Slider
	$('.bonus_slick').slick({
		nextArrow: '<div class="slick-arrow slickright"><img src="assets/img/icons/rht_icon.svg"></div>',
		prevArrow: '<div class="slick-arrow slickleft"><img src="assets/img/icons/lft_icon.svg"></div>',
		slidesToShow: 2,
		slidesToScroll: 2,
		speed: 300,
		infinite: false,
		swipe: true,
		dots: false,
		responsive: [{
			breakpoint: 575,
			settings: {
				dots: true,
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		}]
	});

})(jQuery);