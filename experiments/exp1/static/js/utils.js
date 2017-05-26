// Generated by CoffeeScript 1.12.3
var assert, check, checkObj, checkWindowSize, converter, deepLoadJson, deepMap, getTime, loadJson, mapObject, markdown, mean, reformatTrial, zip,
  slice = [].slice;

converter = new showdown.Converter();

markdown = function(txt) {
  return converter.makeHtml(txt);
};

getTime = function() {
  return (new Date).getTime();
};

reformatTrial = function(old) {
  var trial;
  trial = {
    trialID: old.trial_i,
    graph: null,
    initialState: old.initial
  };
  return trial;
};

loadJson = function(file) {
  var result;
  result = $.ajax({
    dataType: 'json',
    url: file,
    async: false
  });
  return result.responseJSON;
};

zip = function() {
  var rows;
  rows = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  return rows[0].map(function(_, c) {
    return rows.map(function(row) {
      return row[c];
    });
  });
};

check = function(name, val) {
  if (val === void 0) {
    throw new Error(name + "is undefined");
  }
  return val;
};

mean = function(xs) {
  return (xs.reduce((function(acc, x) {
    return acc + x;
  }))) / xs.length;
};

checkObj = function(obj, keys) {
  var i, k, len;
  if (keys == null) {
    keys = Object.keys(obj);
  }
  for (i = 0, len = keys.length; i < len; i++) {
    k = keys[i];
    if (obj[k] === void 0) {
      console.log('Bad Object: ', obj);
      throw new Error(k + " is undefined");
    }
  }
  return obj;
};

assert = function(val) {
  if (!val) {
    throw new Error('Assertion Error');
  }
  return val;
};

checkWindowSize = function(width, height, display) {
  var maxHeight, win_width;
  win_width = $(window).width();
  maxHeight = $(window).height();
  if ($(window).width() < width || $(window).height() < height) {
    display.hide();
    return $('#window_error').show();
  } else {
    $('#window_error').hide();
    return display.show();
  }
};

mapObject = function(obj, fn) {
  return Object.keys(obj).reduce(function(res, key) {
    res[key] = fn(obj[key]);
    return res;
  }, {});
};

deepMap = function(obj, fn) {
  var deepMapper;
  deepMapper = function(val) {
    if (typeof val === 'object') {
      return deepMap(val, fn);
    } else {
      return fn(val);
    }
  };
  if (Array.isArray(obj)) {
    return obj.map(deepMapper);
  }
  if (typeof obj === 'object') {
    return mapObject(obj, deepMapper);
  } else {
    return obj;
  }
};

deepLoadJson = function(file) {
  var replaceFileName;
  replaceFileName = function(f) {
    var o;
    if (typeof f === 'string' && f.endsWith('.json')) {
      o = loadJson(f);
      o._json = f;
      return o;
    } else {
      return f;
    }
  };
  return deepMap(loadJson(file), replaceFileName);
};
