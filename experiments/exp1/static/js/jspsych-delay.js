// Generated by CoffeeScript 1.12.3
jsPsych.plugins['delay'] = (function() {
  var plugin;
  plugin = {
    trial: function(display_element, trial_config) {
      var $timer, complete, duration, hours, minutes, seconds, start, tick;
      display_element.empty();
      trial_config = jsPsych.pluginAPI.evaluateFunctionParameters(trial_config);
      duration = trial_config.duration;
      display_element.append(markdown("# Break\n\nYou were randomly chosen to take a " + duration + " minute break.\n\nFeel free to do whatever you'd like until the timer completes.\nBut, please try to resume the HIT as soon as possible after the\ntimer is finished.\n\nIf you're not sure what to do, you could watch a\n[cat video](https://www.youtube.com/watch?v=IytNBm8WA1c&index=1&list=PL8B03F998924DA45B&t=2s) \non youtube."));
      $timer = $('<div>', {
        "class": 'timer'
      }).appendTo(display_element);
      start = getTime();
      seconds = 0;
      minutes = duration % 60;
      hours = Math.floor(duration / 60);
      complete = function() {
        var $container;
        $container = $('<div>', {
          "class": 'center-content'
        }).appendTo(display_element);
        return $container.append($('<button>').addClass('btn btn-primary btn-lg').text('Continue').click((function() {
          display_element.empty();
          return jsPsych.finishTrial({
            rt: (getTime()) - start
          });
        })));
      };
      tick = function() {
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              complete();
              return;
            }
          }
        }
        console.log('here');
        $timer.html((hours ? (hours > 9 ? hours : '0' + hours) : '00') + ':' + (minutes ? (minutes > 9 ? minutes : '0' + minutes) : '00') + ':' + (seconds > 9 ? seconds : '0' + seconds));
        return setTimeout(tick, 1000);
      };
      return tick();
    }
  };
  return plugin;
})();
