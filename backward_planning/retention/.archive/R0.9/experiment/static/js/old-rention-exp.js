// Generated by CoffeeScript 2.2.2
/*
experiment.coffee
Fred Callaway

Demonstrates the jsych-mdp plugin

*/
var DIRECTIONS, M, N_TEST, N_TRAIN, N_TRIALS, SCORE, STRUCTURE, TEST_IDX, TEST_TRIALS, THRESHOLDS, TRAIN_TRIALS, TRIALS, calculateBonus, createStartButton, delay, initializeExperiment, isIE, loadTimeout, psiturk, train;

// coffeelint: disable=max_line_length, indentation

// Globals.
psiturk = new PsiTurk(uniqueId, adServerLoc, mode);

isIE = false || !!document.documentMode;

TRIALS = void 0;

THRESHOLDS = void 0;

DIRECTIONS = ["down", "right", "up", "left"];

TEST_TRIALS = void 0;

TRAIN_TRIALS = void 0;

TEST_IDX = void 0;

N_TEST = 6;

N_TRAIN = 10;

N_TRIALS = 16;

SCORE = 0;

STRUCTURE = void 0;

calculateBonus = void 0;

train = void 0;

/* 
TODO
- define trial_i
- object-level PRs
- demo
*/
// if 'hidden' in document
//   document.addEventListener("visibilitychange", onchange);
// else if 'mozHidden' in document
//   document.addEventListener("mozvisibilitychange", onchange);
// else if 'webkitHidden' in document
//   document.addEventListener("webkitvisibilitychange", onchange);
// else if 'msHidden' in document
// document.addEventListener("msvisibilitychange", onchange);
if (DEBUG) {
  0;
}

// N_TEST = 1
// N_TRAIN = 1
// N_TRIALS = 2
// because the order of arguments of setTimeout is awful.
delay = function(time, func) {
  return setTimeout(func, time);
};

// $(window).resize -> checkWindowSize 920, 720, $('#jspsych-target')
// $(window).resize()
if (isIE) {
  $('#jspsych-target').hide();
  $('#IE_error').show();
} else {
  // $(document).ready ->
  // document.getElementById("IE_error").style.display = "block"
  $(window).on('load', function() {});
  // Load data and test connection to server.
  M = function() {
    return $('#failLoad').show();
  };
  loadTimeout = delay(12000, slowLoad);
  psiturk.preloadImages(['static/images/example1.png', 'static/images/example2.png', 'static/images/example3.png', 'static/images/money.png', 'static/images/plane.png', 'static/images/spider.png']);
}

delay(300, function() {
  var ERROR, condition_nr;
  if (SHOW_PARTICIPANT_DATA) {
    TRIALS = loadJson(`static/json/data/1B.0/stimuli/${COST_LEVEL}_cost.json`);
  } else {
    TRIALS = loadJson(`static/json/rewards_${PARAMS.info_cost.toFixed(2)}.json`);
    STRUCTURE = loadJson("static/json/structure.json");
    THRESHOLDS = loadJson(`static/json/thresholds_${COST_LEVEL}_cost.json`);
    console.log('STRUCTURE', STRUCTURE);
    console.log('TRIALS', TRIALS);
  }
  condition_nr = condition % nrConditions;
  // PARAMS=
  //   PR_type: conditions.PRType[condition_nr]
  //   feedback: conditions.PRType[condition_nr] != "none"
  //   info_cost: conditions.infoCost[condition_nr]
  //   message:  conditions.messageType[condition_nr]
  //   frequencyOfFB: conditions.frequencyOfFB[condition_nr]
  //   condition: condition_nr
  //   start_time: new Date

  //idx = _.shuffle (_.range N_TRIALS)
  //train_idx = idx[...N_TRAIN]
  //TEST_IDX = idx[N_TRAIN...]    
  //TRAIN_TRIALS = (TRIALS[i] for i in train_idx)
  //TEST_TRIALS = (TRIALS[i] for i in TEST_IDX)
  TRAIN_TRIALS = _.shuffle(TRIALS.train);
  TEST_TRIALS = _.shuffle(TRIALS.test);
  if (DEBUG) {
    TRAIN_TRIALS = TRIALS;
  }
  psiturk.recordUnstructuredData('params', PARAMS);
  psiturk.recordUnstructuredData('experiment_nr', experiment_nr);
  psiturk.recordUnstructuredData('condition_nr', condition_nr);
  if (DEBUG || DEMO) {
    return createStartButton();
  } else {
    console.log('Testing saveData');
    ERROR = null;
    return psiturk.saveData({
      error: function() {
        console.log('ERROR saving data.');
        return ERROR = true;
      },
      success: function() {
        console.log('Data saved to psiturk server.');
        clearTimeout(loadTimeout);
        return delay(500, createStartButton);
      }
    });
  }
});

createStartButton = function() {
  if (DEBUG) {
    initializeExperiment();
    return;
  }
  document.getElementById("loader").style.display = "none";
  document.getElementById("successLoad").style.display = "block";
  document.getElementById("failLoad").style.display = "none";
  return $('#load-btn').click(initializeExperiment);
};

initializeExperiment = function() {
  var Block, MDPBlock, QuizLoop, TextBlock, ask_email, check_code, check_returning, debug_slide, experiment_timeline, finish, instruct_loop, instructions, msgType, ppl, prompt_resubmit, quiz, reprompt, retention_instruction, save_data, test, text;
  $('#jspsych-target').html('');
  console.log('INITIALIZE EXPERIMENT');
  msgType = (function() {
    switch (PARAMS.message) {
      case 'none':
        return '_noMsg';
      case 'simple':
        return '_simpleMsg';
      default:
        return '';
    }
  })();
  //  ======================== #
  //  ========= TEXT ========= #
  //  ======================== #

  // These functions will be executed by the jspsych plugin that
  // they are passed to. String interpolation will use the values
  // of global variables defined in this file at the time the function
  // is called.
  text = {
    debug: function() {
      if (DEBUG) {
        return "`DEBUG`";
      } else {
        return '';
      }
    },
    return_window: function() {
      var cutoff, tomorrow;
      cutoff = new Date(RETURN_TIME.getTime() + 1000 * 60 * 60 * PARAMS.delay_window);
      tomorrow = RETURN_TIME.getDate() > (new Date).getDate() ? 'tomorrow' : '';
      return `<b>${tomorrow}\nbetween ${format_time(RETURN_TIME)}\nand ${format_time(cutoff)}</b>`;
    },
    feedback: function() {
      if (STAGE2) {
        return [];
      }
      if (PARAMS.PR_type !== "none") {
        if (PARAMS.PR_type === "objectLevel") {
          return [markdown(`# Instructions\n\n<b>You will receive feedback about your planning. This feedback\nwill help you learn how to make better decisions.</b> After each\nflight, if you did not make the best move, a feedback message\nwill apear. This message will tell you whether you flew along\nthe best route given your current location, and what the best\nmove would have been.\n\nThis feedback will be presented after each of the first\n${N_TRAIN} rounds; during the final ${N_TEST} rounds,\nno feedback will be presented.\n\nIn the example below, the best move was not taken. As a result,\nthere is a 15 second timeout penalty.<b> The duration of the\ntimeout penalty is proportional to how poor of a move you made:\n</b> the more money you could have earned, the longer the delay.\n<b> If you perform optimally, no feedback will be shown and you\ncan proceed immediately.</b> \n\n${img('task_images/Slide5.png')}`)];
        } else if (PARAMS.PR_type === "demonstration") {
          return [markdown(`# Instructions\n\n<b> In the first ${N_TRAIN} rounds, an expert will demonstrate\noptimal flight planning.</b> In the remaining ${N_TEST} rounds,\nyou will make your own choices.`)];
        } else if (PARAMS.message === "simple") {
          return [markdown(`# Instructions\n\n<b>You will receive feedback about your planning. This feedback will\nhelp you learn how to make better decisions.</b> After each flight, if\nyou did not plan optimally, a feedback message will apear.\n\nIn the example below, there is a 26 second timeout penalty.\n<b>The duration of the timeout penalty is proportional to how\npoorly you planned your route:</b> the more money you could have\nearned from observing more/less values and/or choosing a better\nroute, the longer the delay. <b>If you perform optimally, no\nfeedback will be shown and you can proceed immediately.</b> The\nexample message here is not necessarily representative of the\nfeedback you'll receive.\n\nThis feedback will be presented after each of the first\n${N_TRAIN} rounds; during the final ${N_TEST} rounds,\nno feedback will be presented.\n\n${img('task_images/Slide4_simple.png')}`)];
        } else {
          return [markdown(`# Instructions\n\n<b>You will receive feedback about your planning. This feedback will\nhelp you learn how to make better decisions.</b> After each flight, if\nyou did not plan optimally, a feedback message will apear. This message\nwill tell you two things:\n\n1. Whether you observed too few relevant values or if you observed\n   irrelevant values (values of locations that you can't fly to).\n2. Whether you flew along the best route given your current location and\n   the information you had about the values of other locations.\n\nThis feedback will be presented after each of the first\n${N_TRAIN} rounds; during the final ${N_TEST} rounds,\nno feedback will be presented.\n\nIn the example below, there is a 6 second timeout penalty. If\nyou observed too few relevant values, the message would say,\n"You should have gathered more information!"; if you observed\ntoo many values, it would say "You should have gathered less\ninformation!". <b>The duration of the timeout penalty is\nproportional to how poorly you planned your route:</b> the more\nmoney you could have earned from observing more/less values\nand/or choosing a better route, the longer the delay. <b>If you\nperform optimally, no feedback will be shown and you can proceed\nimmediately.</b> The example message here is not necessarily\nrepresentative of the feedback you'll receive.\n\n${img('task_images/Slide4_neutral2.png')}`)];
        }
      } else if (PARAMS.message === "full") {
        return [markdown(`# Instructions\n\n<b>You will receive feedback about your planning. This feedback\nwill help you learn how to make better decisions.</b> After each\nflight a feedback message will apear. This message will tell you\ntwo things:\n\n1. Whether you observed too few relevant values or if you observed\n   irrelevant values (values of locations that you can't fly to).\n2. Whether you flew along the best route given your current location and\n   the information you had about the values of other locations.\n\nThis feedback will be presented after each of the first\n${N_TRAIN} rounds; during the final ${N_TEST} rounds,\nno feedback will be presented.\n\nIf you observe too few relevant values, the message will say,\n"You should have gathered more information!"; if you observe too\nmany values, it will say "You should have gathered less\ninformation!"; and the image below shows the message you will\nsee when you collected the right information but used it\nincorrectly.\n\n${img('task_images/Slide4_neutral.png')}`)];
      } else {
        return [];
      }
    },
    constantDelay: function() {
      if (PARAMS.PR_type !== "none") {
        return "";
      } else {
        return "<b>Note:</b> there will be short delays after taking some flights.";
      }
    }
  };
  // ================================= #
  // ========= BLOCK CLASSES ========= #
  // ================================= #
  Block = class Block {
    constructor(config) {
      _.extend(this, config);
      this._block = this; // allows trial to access its containing block for tracking state
      if (this._init != null) {
        this._init();
      }
    }

  };
  TextBlock = (function() {
    class TextBlock extends Block {};

    TextBlock.prototype.type = 'text';

    TextBlock.prototype.cont_key = ['space'];

    return TextBlock;

  }).call(this);
  QuizLoop = class QuizLoop extends Block {
    loop_function(data) {
      var c, j, len, ref;
      console.log('data', data);
      ref = data[data.length].correct;
      for (j = 0, len = ref.length; j < len; j++) {
        c = ref[j];
        if (!c) {
          return true;
        }
      }
      return false;
    }

  };
  MDPBlock = (function() {
    class MDPBlock extends Block {
      _init() {
        _.extend(this, STRUCTURE);
        return this.trialCount = 0;
      }

    };

    MDPBlock.prototype.type = 'mouselab-mdp';

    return MDPBlock;

  }).call(this);
  //  ============================== #
  //  ========= EXPERIMENT ========= #
  //  ============================== #
  debug_slide = new Block({
    type: 'html',
    url: 'test.html'
  });
  check_code = new Block({
    type: 'secret-code',
    code: 'elephant'
  });
  check_returning = (function() {
    var i, return_time, stage1, worker_id;
    console.log('worker', uniqueId);
    worker_id = uniqueId.split(':')[0];
    stage1 = (loadJson('static/json/stage1.json'))[worker_id];
    if (stage1 != null) {
      console.log('stage1.return_time', stage1.return_time);
      return_time = new Date(stage1.return_time);
      console.log('return_time', return_time);
      if (getTime() > return_time) {
        // Redefine test trials to match breakdown established in stage 1.
        TEST_TRIALS = (function() {
          var j, len, ref, results;
          ref = stage1.test_idx;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            i = ref[j];
            results.push(TRIALS[i]);
          }
          return results;
        })();
        SCORE += stage1.score;
        return new Block({
          type: 'button-response',
          is_html: true,
          choices: ['Continue'],
          button_html: '<button id="return-continue" class="btn btn-primary btn-lg">%choice%</button>',
          stimulus: function() {
            return markdown(`# Welcome back\n\nThanks for returning to complete Stage 2! Your current bonus is\n**$${calculateBonus().toFixed(2)}**. In this stage you'll have ${N_TEST} rounds to\nincrease your bonus.\n\nBefore you begin, you will review the instructions and take another\nquiz.`);
          }
        });
      } else {
        return new Block({
          type: 'text',
          cont_key: [null],
          text: function() {
            return markdown(`# Stage 2 not ready yet\n\nYou need to wait ${PARAMS.delay_hours} hours after completing Stage 1 before\nyou can begin Stage 2. You can begin the HIT at\n${format_time(return_time)} on ${format_date(return_time)}`);
          }
        });
      }
    } else {
      // **If you return the HIT, you may not be able to take it again later.**
      // Please leave the HIT open until it is time for you to complete Stage 2.
      return new Block({
        type: 'text',
        cont_key: [null],
        text: function() {
          return markdown("# Stage 1 not completed\n\nWe can't find you in our database. This is the second part of a two-part\nexperiment. If you did not complete the first stage, please\nreturn this HIT. If you did complete Stage 1, please email\ncocosci.turk@gmail.com to report the error.");
        }
      });
    }
  })();
  retention_instruction = new Block({
    type: 'button-response',
    is_html: true,
    choices: ['Continue'],
    button_html: '<button class="btn btn-primary btn-lg">%choice%</button>',
    stimulus: function() {
      return markdown(`# You are beginning a two-part experiment\n\nThis experiment has two stages which you will complete in separate HITs.\nThe total base payment for both hits is $1.75, plus a **performance-dependent\nbonus** of up to $3.50 ($2.50 is a typical bonus).\n\nStage 1 takes about 15 minutes, and you will receive $0.75 when you\ncomplete it. You will complete Stage 2 in a second HIT.\nYou can begin the second HIT ${text.return_window()}.\nIf you do not begin the HIT within this time frame, you will not receive the\nsecond base payment or any bonus.\n\nUpon completing Stage 2, you will receive $1.00 plus your bonus of\nup to $3.50.<br>**By completing both stages, you can make up to\n$5.25**.\n\n<div class="alert alert-warning">\n  Only continue if you can complete the second (~10 minute) HIT which\n  which will be available ${text.return_window()}.\n</div>`);
    }
  });
  instructions = new Block({
    type: "instructions",
    pages: [markdown(`# Instructions ${text.debug()}\n\nIn this game, you are in charge of flying an aircraft. As shown below,\nyou will begin in the central location. The arrows show which actions\nare available in each location. Note that once you have made a move you\ncannot go back; you can only move forward along the arrows. There are\neight possible final destinations labelled 1-8 in the image below. On\nyour way there, you will visit two intermediate locations. <b>Every\nlocation you visit will add or subtract money to your account</b>, and\nyour task is to earn as much money as possible. <b>To find out how much\nmoney you earn or lose in a location, you have to click on it.</b>\n\nYou can uncover the value of as many or as few locations as you wish before the first flight.\nBut <b>once you move the airplane to a new location, you can no longer collect any additional information.</b>\n\n${img('task_images/Slide1.png')}\n\nTo navigate the airplane, use the arrows (the example above is non-interactive).\nClick "Next" to proceed.`), markdown(`# Instructions\n\nYou will play the game for ${N_TRIALS} rounds. The value of\nevery location will change from each round to the next. At the\nbegining of each round, the value of every location will be hidden,\nand you will only discover the value of the locations you click on.\nThe example below shows the value of every location, just to give you\nan example of values you could see if you clicked on every location.\n<b>Every time you click a circle to observe its value, you pay a fee\nof ${fmtMoney(PARAMS.info_cost)}.</b>\n\n${img('task_images/Slide2_' + COST_LEVEL + '.png')}\n\nEach time you move to a\nlocation, your profit will be adjusted. If you move to a location with\na hidden value, your profit will still be adjusted according to the\nvalue of that location. ${text.constantDelay()}`)].concat((text.feedback()).concat([markdown(`# Instructions\n\nThere are two more important things to understand:\n1. You must spend at least ${MIN_TIME} seconds on each round. A countdown timer\n   will show you how much more time you must spend on the round. You\n   won’t be able to proceed to the next round before the countdown has\n   finished, but you can take as much time as you like afterwards.\n2. </b>You will earn <u>real money</u> for your flights.</b>\n   Specifically, for every $1 you earn in the game, we will add 1\n   cent to your bonus. Please note that each and every one of the\n   ${N_TRIALS} rounds counts towards your bonus.\n\n${img('task_images/Slide3.png')}\n\n You may proceed to take an entry quiz, or go back to review the instructions.`)])),
    show_clickable_nav: true
  });
  quiz = new Block({
    preamble: function() {
      return markdown("# Quiz");
    },
    type: 'survey-multi-choice', // note: I've edited this jspysch file
    questions: ["True or false: The hidden values will change each time I start a new round.", "How much does it cost to observe each hidden value?", "How many hidden values am I allowed to observe in each round?", "How is your bonus determined?"].concat(((!STAGE2) & PARAMS.PR_type !== "none" & PARAMS.PR_type !== "demonstration" ? ["What does the feedback teach you?"] : [])),
    options: [['True', 'False'], ['$0.01', '$0.05', '$0.10', '$0.25', '$1.00', '$1.25', '$1.50', '$2.50', '$2.95', '$3.50', '$3.95', '$4.00', '$10.00'], ['At most 1', 'At most 5', 'At most 10', 'At most 15', 'As many or as few as I wish'], ['1% of my best score on any round', '1 cent for every $1 I earn in each round', '10% of my best score on any round', '10% of my score on a random round']].concat((STAGE2 ? [] : PARAMS.PR_type === "objectLevel" ? [['Whether I chose the move that was best.', 'The length of the delay is based on how much more money I could have earned.', 'All of the above.']] : PARAMS.PR_type !== "none" ? [['Whether I observed the rewards of relevant locations.', 'Whether I chose the move that was best according to the information I had.', 'The length of the delay is based on how much more money I could have earned by planning and deciding better.', 'All of the above.']] : [])),
    required: [true, true, true, true, true],
    correct: ['True', fmtMoney(PARAMS.info_cost), 'As many or as few as I wish', '1 cent for every $1 I earn in each round', 'All of the above.'],
    on_mistake: function(data) {
      return alert("You got at least one question wrong. We'll send you back to the\ninstructions and then you can try again.");
    }
  });
  instruct_loop = new Block({
    timeline: [instructions, quiz],
    loop_function: function(data) {
      var c, j, len, ref;
      ref = data[1].correct;
      for (j = 0, len = ref.length; j < len; j++) {
        c = ref[j];
        if (!c) {
          return true; // try again
        }
      }
      psiturk.finishInstructions();
      psiturk.saveData();
      return false;
    }
  });
  // for t in BLOCKS.standard
  //   _.extend t, t.stim.env
  //   t.pseudo = t.stim.pseudo
  train = new MDPBlock({
    leftMessage: function() {
      return `Round: ${TRIAL_INDEX}/${N_TRAIN}`;
    },
    demonstrate: PARAMS.PR_type === "demonstration",
    timeline: TRAIN_TRIALS
  });
  console.log('train', train);
  test = new Block({
    leftMessage: function() {
      if (STAGE2) {
        return `Round: ${TRIAL_INDEX}/${N_TEST}`;
      } else {
        return `Round: ${TRIAL_INDEX - N_TRAIN}/${N_TEST}`;
      }
    },
    timeline: (function() {
      var tl;
      tl = [];
      if (PARAMS.feedback && !STAGE2) {
        tl.push(new TextBlock({
          text: markdown("# No more feedback\n\nYou are now entering a block without feedback. There will be no\nmessages and no delays regardless of what you do, but your\nperformance still affects your bonus.\n\nPress **space** to continue.")
        }));
      }
      if (PARAMS.PR_type === "demonstration") {
        tl.push(new TextBlock({
          text: markdown("# Your turn\n\nThis was the last demonstration from your teacher. Now it is your\nturn to decide which locations to inspect and where to fly to.\n\nPress **space** to continue.")
        }));
      }
      tl.push(new MDPBlock({
        feedback: false,
        timeline: TEST_TRIALS
      }));
      return tl;
    })()
  });
  console.log('test', test);
  ask_email = new Block({
    type: 'survey-text',
    preamble: function() {
      return markdown(`# You've completed Stage 1\n\nSo far, you've earned a bonus of **$${calculateBonus().toFixed(2)}**.\nYou will receive this bonus, along with the additional bonus you earn \nin Stage 2 when you complete the second HIT. If you don't complete\nthe second HIT, you will give up the bonus you have earned.\n\nThe HIT for Stage 2 will have the title "Part 2 of two-part decision-making experiment"\nRemember, you must begin the HIT ${text.return_window()}.\n**Note:** The official base pay on mTurk will be $0.01;\nyou'll receive the $1 base pay for Stage 2 as part of your bonus \n(in addition to the bonus you earn).`);
    },
    questions: ['If you would like a reminder email, you can optionally enter it here.'],
    button: 'Submit HIT'
  });
  if (STAGE1) {
    finish = new Block({
      type: 'button-response',
      stimulus: function() {
        return markdown(`# You've completed Stage 1\n\nRemember to come back ${text.return_window()} to complete Stage 2.\nThe HIT will be titled "Part 2 of two-part decision-making\nexperiment". **Note:** The official base pay on mTurk will be $0.01;\nyou'll receive the $1 base pay for Stage 2 as part of your bonus \n(in addition to the bonus you earn).\n\nSo far, you've earned a bonus of **$${calculateBonus().toFixed(2)}**.\nYou will receive this bonus, along with the additional bonus you earn \nin Stage 2 when you complete the second HIT. If you don't complete\nthe second HIT, you give up the bonus you have already earned.`);
      },
      is_html: true,
      choices: ['Submit HIT'],
      button_html: '<button class="btn btn-primary btn-lg">%choice%</button>'
    });
  } else {
    finish = new Block({
      type: 'survey-text',
      preamble: function() {
        return markdown(`# You've completed the HIT\n\nThanks for participating. We hope you had fun! Based on your\nperformance, you will be awarded a bonus of\n**$${calculateBonus().toFixed(2)}**.\n\nPlease briefly answer the questions below before you submit the HIT.`);
      },
      questions: ['How did you go about planning the route of the airplane?', 'Did you learn anything about how to plan better?', 'How old are you?', 'Which gender do you identify with?'],
      rows: [4, 4, 1, 1],
      button: 'Submit HIT'
    });
  }
  ppl = new Block({
    type: 'webppl',
    code: 'globalStore.display_element.html(JSON.stringify(flip()))'
  });
  if (DEBUG) {
    // train
    // test
    // check_returning
    // check_code
    experiment_timeline = [train, test, finish];
  } else {
    // ppl
    experiment_timeline = (function() {
      var tl;
      tl = [];
      if (STAGE1) {
        tl.push(retention_instruction);
      }
      if (STAGE2) {
        tl.push(check_returning);
      }
      tl.push(instruct_loop);
      if (!STAGE2) {
        tl.push(train);
      }
      if (!STAGE1) {
        tl.push(test);
      }
      if (STAGE1) {
        tl.push(ask_email);
      } else {
        tl.push(finish);
      }
      return tl;
    })();
  }
  // ================================================ #
  // ========= START AND END THE EXPERIMENT ========= #
  // ================================================ #
  calculateBonus = function(final = false) {
    var bonus;
    // data = jsPsych.data.getTrialsOfType 'mouselab-mdp'
    // score = sum (_.pluck data, 'score')
    // console.log 'score', score
    bonus = (Math.max(0, SCORE)) * PARAMS.bonus_rate;
    bonus = (Math.round(bonus * 100)) / 100; // round to nearest cent
    return bonus;
  };
  // # bonus is the score on a random trial.
  // BONUS = undefined
  // calculateBonus = ->
  //   if BONUS?
  //     return BONUS
  //   data = jsPsych.data.getTrialsOfType 'mouselab-mdp'
  //   BONUS = 0.05 * Math.max 0, (_.sample data).score
  //   psiturk.recordUnstructuredData 'final_bonus', BONUS
  //   return BONUS
  reprompt = null;
  save_data = function() {
    return psiturk.saveData({
      success: function() {
        console.log('Data saved to psiturk server.');
        if (reprompt != null) {
          window.clearInterval(reprompt);
        }
        return psiturk.computeBonus('compute_bonus', psiturk.completeHIT);
      },
      error: prompt_resubmit
    });
  };
  prompt_resubmit = function() {
    $('#jspsych-target').html("<h1>Oops!</h1>\n<p>\nSomething went wrong submitting your HIT.\nThis might happen if you lose your internet connection.\nPress the button to resubmit.\n</p>\n<button id=\"resubmit\">Resubmit</button>");
    return $('#resubmit').click(function() {
      $('#jspsych-target').html('Trying to resubmit...');
      reprompt = window.setTimeout(prompt_resubmit, 10000);
      return save_data();
    });
  };
  return jsPsych.init({
    display_element: $('#jspsych-target'),
    timeline: experiment_timeline,
    // show_progress_bar: true
    on_finish: function() {
      var completion_data;
      completion_data = {
        score: SCORE,
        bonus: calculateBonus(),
        return_time: typeof RETURN_TIME !== "undefined" && RETURN_TIME !== null ? RETURN_TIME.getTime() : void 0,
        test_idx: TEST_IDX
      };
      if (DEBUG) {
        jsPsych.data.displayData();
        return console.log('completion_data', completion_data);
      } else {
        psiturk.recordUnstructuredData('completed', completion_data);
        return save_data();
      }
    },
    on_data_update: function(data) {
      console.log('data', data);
      return psiturk.recordTrialData(data);
    }
  });
};
