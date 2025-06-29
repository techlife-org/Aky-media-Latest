// timer
document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM fully loaded and parsed");
  
  // Verify that elements exist
  console.log(document.getElementById("days"));   
  console.log(document.getElementById("hours"));  
  console.log(document.getElementById("minutes")); 

  // Set the countdown date (2 days, 8 hours, 40 minutes from now)
  const countdownDate = new Date().getTime() + (2 * 24 * 60 * 60 * 1000) + (8 * 60 * 60 * 1000) + (40 * 60 * 1000);

  // Update the countdown every second
  const countdownFunction = setInterval(() => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      // Calculate time left
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      // Display the result
      document.getElementById("days").innerHTML = String(days).padStart(2, '0');
      document.getElementById("hours").innerHTML = String(hours).padStart(2, '0');
      document.getElementById("minutes").innerHTML = String(minutes).padStart(2, '0');

      // If the countdown is finished
      if (distance < 0) {
          clearInterval(countdownFunction);
          document.getElementById("days").innerHTML = "00";
          document.getElementById("hours").innerHTML = "00";
          document.getElementById("minutes").innerHTML = "00";
      }
  }, 1000);
});


$(document).ready(function(){

 // popup
  $('.popup-image').magnificPopup({
    type: 'image'
  });

  $('.popup-video').magnificPopup({
  type: 'iframe'
  });

 
   
  $('.po-ab-counter-box').on('mouseenter', function () {
    $(this).addClass('active').parent().siblings().find('.po-ab-counter-box').removeClass('active');
  });


  $('.po-single-team-4-iner').on('mouseenter', function () {
    $(this).addClass('active').parent().siblings().find('.po-single-team-4-iner').removeClass('active');
  });
  
  $('.po-service-list-item').on('mouseenter', function () {
    $(this).addClass('active').parent().siblings().find('.po-service-list-item').removeClass('active');
  });







  // counter up
  $('.counter').counterUp({
    delay: 10,
    time: 1000
});





// testimonial slider 01
$('.slider-for').slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  fade: true,
  asNavFor: '.slider-nav'
});
$('.slider-nav').slick({
  slidesToShow: 3,
  slidesToScroll: 1,
  vertical:true,
  asNavFor: '.slider-for',
  dots: false,
  focusOnSelect: true,
  verticalSwiping:true,
  arrows:false,
  responsive: [
  {
      breakpoint: 992,
      settings: {
        vertical: false,
      }
  },
  {
    breakpoint: 768,
    settings: {
      vertical: false,
    }
  },
  {
    breakpoint: 580,
    settings: {
      vertical: false,
      slidesToShow: 3,
    }
  },
  {
    breakpoint: 380,
    settings: {
      vertical: false,
      slidesToShow: 2,
    }
  }
  ]
});



  // history slider (Home -02)
  $('.po-history-slide-1').slick({
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
    dots: false,
    infinite: true,
    fade: true,
    asNavFor: '.po-history-nav'
  });

  $('.po-history-nav').slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    infinite: true,
    focusOnSelect: true,
    asNavFor: '.po-history-slide-1',
    prevArrow:'<span class="priv_arrow"><i class="fa-regular fa-arrow-right"></i></span>',
    nextArrow:'<span class="next_arrow"><i class="fa-regular fa-arrow-left"></i></span>',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: false,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
 });


   // Testimonail (Home -02)
   $('.po-testimonial-2').slick({
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
    dots: false,
    infinite: true,
    fade: true,
    asNavFor: '.po-testimonial-nav-2'
  });

  $('.po-testimonial-nav-2').slick({
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
    infinite: true,
    focusOnSelect: true,
    asNavFor: '.po-testimonial-2',
    prevArrow:'<span class="priv_arrow"><i class="fa-regular fa-arrow-right"></i></span>',
    nextArrow:'<span class="next_arrow"><i class="fa-regular fa-arrow-left"></i></span>',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]

 });

//  Task Slider home 03
$('.po-task-3').slick({
  dots: false,
  arrows: true,
  infinite: true,
  speed: 300,
  slidesToShow: 4,
  slidesToScroll: 1,
  prevArrow:'<span class="priv_arrow3"><i class="fa-regular fa-arrow-right"></i></span>',
  nextArrow:'<span class="next_arrow3"><i class="fa-regular fa-arrow-left"></i></span>',
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 3,
        infinite: true,
        dots: false,
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
});

   // Testimonail (Home -03)
   $('.slider-for-3').slick({
    //autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: '.slider-nav-3',
    active: true,
  });
  $('.slider-nav-3').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true, 
    asNavFor: '.slider-for-3',
  });
 
  $('a[data-slide]').click(function(e) {
    e.preventDefault();
    var slideno = $(this).data('slide');
    $('.slider-nav-3').slick('slickGoTo', slideno - 1);
  });



  // brand logo 4
  $('.po-brands').slick({
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 4,
    arrow:false,
    slidesToScroll: 1,
    prevArrow:'<span class="priv_arrow4"><i class="fa-regular fa-arrow-right"></i></span>',
    nextArrow:'<span class="next_arrow4"><i class="fa-regular fa-arrow-left"></i></span>',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: false
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });

    // stiky menu
    $(window).on('scroll',function(){
      var scroll = $ (window).scrollTop();
      if(scroll < 1){
        $(".stiky").removeClass("scroll-header");
      }else{
        $(".stiky").addClass("scroll-header");
      }
    }); 
    
    
    // preloader 
    $(window).on('load', function() {
      $("#loading").fadeOut(500);
    });

    // preloader 2
    $(window).on('load', function() {
      $("#loading2").fadeOut(500);
    });

    // preloader 2
    $(window).on('load', function() {
      $("#loading3").fadeOut(500);
    });

    // preloader 2
    $(window).on('load', function() {
      $("#loading4").fadeOut(500);
    });


  // aos
  AOS.init();
  AOS.init({disable: 'mobile'});





    // page-progress
    var progressPath = document.querySelector(".progress-wrap path");
    var pathLength = progressPath.getTotalLength();
    progressPath.style.transition = progressPath.style.WebkitTransition =
      "none";
    progressPath.style.strokeDasharray = pathLength + " " + pathLength;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = progressPath.style.WebkitTransition =
      "stroke-dashoffset 10ms linear";
    var updateProgress = function () {
      var scroll = $(window).scrollTop();
      var height = $(document).height() - $(window).height();
      var progress = pathLength - (scroll * pathLength) / height;
      progressPath.style.strokeDashoffset = progress;
    };
    updateProgress();
    $(window).scroll(updateProgress);
    var offset = 50;
    var duration = 550;
    jQuery(window).on("scroll", function () {
      if (jQuery(this).scrollTop() > offset) {
        jQuery(".progress-wrap").addClass("active-progress");
      } else {
        jQuery(".progress-wrap").removeClass("active-progress");
      }
    });
    jQuery(".progress-wrap").on("click", function (event) {
      event.preventDefault();
      jQuery("html, body").animate({ scrollTop: 0 }, duration);
      return false;
    });


  if ($("#header").length > 0) {
    $(window).on("scroll", function (event) {
      var scroll = $(window).scrollTop();
      if (scroll < 1) {
        $("#header").removeClass("sticky");
      } else {
        $("#header").addClass("sticky");
      }
    });
  }



// preloader 







// Remove active class from all thumbnail slides
$('.slider-nav-thumbnails .slick-slide').removeClass('slick-active');

// Set active class to first thumbnail slides
$('.slider-nav-thumbnails .slick-slide').eq(0).addClass('slick-active');

// On before slide change match active thumbnail to current slide
$('.slider').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
  var mySlideNumber = nextSlide;
  $('.slider-nav-thumbnails .slick-slide').removeClass('slick-active');
  $('.slider-nav-thumbnails .slick-slide').eq(mySlideNumber).addClass('slick-active');
});







});


