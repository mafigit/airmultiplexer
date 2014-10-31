$(function() {
  var first_airplay_devices_fetch = true;
  var air_devices = [];

  //events
  $.get('/airplay_devices', function(data) {
    addAirplayDevices(data, true);
  });

  $('#add_node').click(function() {
    $.get('/add_node', function(data) {
      console.log(data);
    });
  });

  var addAirplayDevices = function(devices, first_call) {

    var airplay_device_template =
      "<div id='{{id}}' class='airplay_device'>" +
        "<img src='/images/airplay_logo.jpg'>" +
        "<label class='{{class}}'>{{title}}</label>" +
      "</div>"

    var is_multiplex = false;
    if (first_call) {
      air_devices = devices;
      var airplay_devices = devices.map(function(el) {
        if (el.match(/airmultiplex/)) {
          is_multiplex = true;
        } else {
          is_multiplex = false;
        };
        return Mustache.render(airplay_device_template,
          { title: el, id: el + "_id",
            class: is_multiplex ? 'multiplexer' : '' });
      });

      $('#airplay_devices').html(airplay_devices);

    } else {
      devices.forEach(function(el) {


        var index = air_devices.indexOf(el);
        if (index === -1) {
          if (el.match(/airmultiplex/)) {
            is_multiplex = true;
          };
          air_devices.push(el);
          $('#airplay_devices').append(Mustache.render(airplay_device_template,
            { title: el, id: el + "_id",
              class: is_multiplex ? 'multiplexer' : '' }));
        }
      });
      air_devices.forEach(function(el) {
        if (devices.indexOf(el) === -1) {
          air_devices.splice(devices.indexOf(el), 1);
          $('#' + el + "_id").remove();
        }
      });
    }
    console.log(air_devices);

    $('.airplay_device').draggable();
  };

  var addNode = function() {
  }

  setInterval(function() {
    $.get('/airplay_devices', function(data) {
      addAirplayDevices(data, false);
    })
  }, 2000)
});
