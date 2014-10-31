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
      "<div id='{{id}}' class='airplay_device {{class}}'>" +
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

    $('.airplay_device').draggable();
  };

  var playing = {};

  $(".airplay_drop").droppable({
    drop: function( event, ui ) {
      var receiver_id = ui.draggable.attr('id');
      playing[receiver_id] = {};
      playing[receiver_id].name = ui.draggable.find('label').html() + ".local";
      playing[receiver_id].multiplexer = ui.draggable.hasClass('multiplexer');
      console.log(playing)
      check_for_stream();
    },
    out : function(event, ui) {
      var receiver_id = ui.draggable.attr('id');
      delete playing[receiver_id];
      console.log(playing)
      check_for_stream();
    }
  });

  var check_for_stream = function() {
    var keys = Object.keys(playing);
    var multi_counter = 0;
    if (keys.length > 1) {
      keys.forEach(function(key) {
        if (playing[key].multiplexer)
          multi_counter++;
      });
      if (multi_counter === 1) {
        console.log('can stream')
        $('#stream').show();
      } else {
        console.log('can NOT stream')
        $('#stream').hide();
      }
    } else {
      console.log('can NOT stream')
      $('#stream').hide();
    }
  }

  $('#stream').click(function(e) {
    var stream_button = e.target;
    $.get("/stream", playing, function(data) {
      if(data)
        $(e.target).attr('disabled', 'disabled');
    });
  });

  setInterval(function() {
    $.get('/airplay_devices', function(data) {
      addAirplayDevices(data, false);
    })
  }, 2000)
});
