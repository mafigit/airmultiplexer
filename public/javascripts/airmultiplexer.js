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
      //TODO: resize field

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
        //TODO: resize field
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

    var stream_state = $(e.target).attr('data-stream_state');

    if(stream_state === 'stop') {
      $.get("/stream", playing, function(data) {
        if(data) {
          $(e.target).attr('disabled', 'disabled');
          restart_fetching_airplay_devices(10000, true);
          $(e.target).attr('data-stream_state', 'play');
          $(e.target).text('Stop Stream');
          $(e.target).removeAttr('disabled');
          console.log('start stream')
        }
      });
    } else {
      $.get("/stop_stream", function(data) {
        if(data) {
          $(e.target).attr('data-stream_state', 'stop');
          $(e.target).text('Start Stream');
          console.log('stop stream')
        }
      });
    }
  });

  var elem = document.querySelector('.volume_slider');
  var init = new Powerange(elem, {
    start: 50,
    callback: function() {
    }
  });

  $('.volume_slider').change(function(e) {
    console.log($(e.target).val())
  });

  $('body').delegate('.airplay_device','mousedown', function(e) {
    var device = $(e.target).parent();
    $('.volume_label').text(device.find('label').text());
  });

  var fetching_airplay_devices;
  var restart_fetching_airplay_devices = function(interval, kill) {
    clearInterval(fetching_airplay_devices)

    if(!kill) {
      fetching_airplay_devices = setInterval(function() {
        $.get('/airplay_devices', function(data) {
          addAirplayDevices(data, false);
        })
      }, interval)
    }
  }
  restart_fetching_airplay_devices(2000, false)
});
