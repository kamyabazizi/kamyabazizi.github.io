// Add your javascript here
// Don't forget to add it into respective layouts where this js file is needed

$(document).ready(function() {
  AOS.init( {
    // uncomment below for on-scroll animations to played only once
    // once: true  
  }); // initialize animate on scroll library
});

// Smooth scroll for links with hashes
$('a.smooth-scroll')
.click(function(event) {
  // On-page links
  if (
    location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
    && 
    location.hostname == this.hostname
  ) {
    // Figure out element to scroll to
    var target = $(this.hash);
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
      // Only prevent default if animation is actually gonna happen
      event.preventDefault();
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 1000, function() {
        // Callback after animation
        // Must change focus!
        var $target = $(target);
        $target.focus();
        if ($target.is(":focus")) { // Checking if the target was focused
          return false;
        } else {
          $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
          $target.focus(); // Set focus again
        };
      });
    }
  }
});

// Load my latest Pinterest pins into the Photography tab.
// The pins are written to data/pinterest.json by a GitHub Actions workflow
// (see .github/workflows/pinterest-sync.yml) so they stay up to date.
(function() {
  var $container = $('#pinterest-pins');
  if (!$container.length) {
    return;
  }
  $.getJSON('data/pinterest.json')
    .done(function(data) {
      var pins = data && data.pins;
      if (!pins || !pins.length) {
        return;
      }
      var html = '';
      $.each(pins, function(i, pin) {
        if (!pin || !pin.url) {
          return;
        }
        html += '' +
          '<div class="col-md-3 col-sm-6 mb-4">' +
            '<div class="cc-porfolio-image img-raised" data-aos="fade-up" data-aos-anchor-placement="top-bottom">' +
              '<a href="' + pin.url + '" target="_blank" rel="noopener">' +
                '<figure class="cc-effect">' +
                  '<img class="pinterest-pin-img" src="' + pin.image + '" alt="Pinterest pin" loading="lazy"/>' +
                  '<figcaption>' +
                    '<div class="h4">Pinterest</div>' +
                    '<p>View Pin</p>' +
                  '</figcaption>' +
                '</figure>' +
              '</a>' +
            '</div>' +
          '</div>';
      });
      $container.html(html);
      if (window.AOS) {
        AOS.refresh();
      }
    })
    .fail(function() {
      $container.html(
        '<div class="col-12 text-center">' +
          '<p>Could not load pins right now. Please try again later.</p>' +
          '<a class="btn btn-primary" href="https://www.pinterest.com/kamyabazizi/" target="_blank" rel="noopener">Visit my Pinterest</a>' +
        '</div>'
      );
    });
})();
