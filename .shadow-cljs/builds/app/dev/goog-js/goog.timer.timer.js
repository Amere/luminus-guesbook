["^ ","~:resource-id",["~:shadow.build.classpath/resource","goog/timer/timer.js"],"~:js","goog.provide(\"goog.Timer\");\ngoog.require(\"goog.Promise\");\ngoog.require(\"goog.events.EventTarget\");\ngoog.Timer = function(opt_interval, opt_timerObject) {\n  goog.events.EventTarget.call(this);\n  this.interval_ = opt_interval || 1;\n  this.timerObject_ = opt_timerObject || goog.Timer.defaultTimerObject;\n  this.boundTick_ = goog.bind(this.tick_, this);\n  this.last_ = goog.now();\n};\ngoog.inherits(goog.Timer, goog.events.EventTarget);\ngoog.Timer.MAX_TIMEOUT_ = 2147483647;\ngoog.Timer.INVALID_TIMEOUT_ID_ = -1;\ngoog.Timer.prototype.enabled = false;\ngoog.Timer.defaultTimerObject = goog.global;\ngoog.Timer.intervalScale = 0.8;\ngoog.Timer.prototype.timer_ = null;\ngoog.Timer.prototype.getInterval = function() {\n  return this.interval_;\n};\ngoog.Timer.prototype.setInterval = function(interval) {\n  this.interval_ = interval;\n  if (this.timer_ && this.enabled) {\n    this.stop();\n    this.start();\n  } else {\n    if (this.timer_) {\n      this.stop();\n    }\n  }\n};\ngoog.Timer.prototype.tick_ = function() {\n  if (this.enabled) {\n    var elapsed = goog.now() - this.last_;\n    if (elapsed > 0 && elapsed < this.interval_ * goog.Timer.intervalScale) {\n      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_ - elapsed);\n      return;\n    }\n    if (this.timer_) {\n      this.timerObject_.clearTimeout(this.timer_);\n      this.timer_ = null;\n    }\n    this.dispatchTick();\n    if (this.enabled) {\n      this.stop();\n      this.start();\n    }\n  }\n};\ngoog.Timer.prototype.dispatchTick = function() {\n  this.dispatchEvent(goog.Timer.TICK);\n};\ngoog.Timer.prototype.start = function() {\n  this.enabled = true;\n  if (!this.timer_) {\n    this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);\n    this.last_ = goog.now();\n  }\n};\ngoog.Timer.prototype.stop = function() {\n  this.enabled = false;\n  if (this.timer_) {\n    this.timerObject_.clearTimeout(this.timer_);\n    this.timer_ = null;\n  }\n};\ngoog.Timer.prototype.disposeInternal = function() {\n  goog.Timer.superClass_.disposeInternal.call(this);\n  this.stop();\n  delete this.timerObject_;\n};\ngoog.Timer.TICK = \"tick\";\ngoog.Timer.callOnce = function(listener, opt_delay, opt_handler) {\n  if (goog.isFunction(listener)) {\n    if (opt_handler) {\n      listener = goog.bind(listener, opt_handler);\n    }\n  } else {\n    if (listener && typeof listener.handleEvent == \"function\") {\n      listener = goog.bind(listener.handleEvent, listener);\n    } else {\n      throw new Error(\"Invalid listener argument\");\n    }\n  }\n  if (Number(opt_delay) > goog.Timer.MAX_TIMEOUT_) {\n    return goog.Timer.INVALID_TIMEOUT_ID_;\n  } else {\n    return goog.Timer.defaultTimerObject.setTimeout(listener, opt_delay || 0);\n  }\n};\ngoog.Timer.clear = function(timerId) {\n  goog.Timer.defaultTimerObject.clearTimeout(timerId);\n};\ngoog.Timer.promise = function(delay, opt_result) {\n  var timerKey = null;\n  return (new goog.Promise(function(resolve, reject) {\n    timerKey = goog.Timer.callOnce(function() {\n      resolve(opt_result);\n    }, delay);\n    if (timerKey == goog.Timer.INVALID_TIMEOUT_ID_) {\n      reject(new Error(\"Failed to schedule timer.\"));\n    }\n  })).thenCatch(function(error) {\n    goog.Timer.clear(timerKey);\n    throw error;\n  });\n};\n","~:source","// Copyright 2006 The Closure Library Authors. All Rights Reserved.\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//      http://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS-IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\n\n/**\n * @fileoverview A timer class to which other classes and objects can listen on.\n * This is only an abstraction above `setInterval`.\n *\n * @see ../demos/timers.html\n */\n\ngoog.provide('goog.Timer');\n\ngoog.require('goog.Promise');\ngoog.require('goog.events.EventTarget');\n\n\n\n/**\n * Class for handling timing events.\n *\n * @param {number=} opt_interval Number of ms between ticks (default: 1ms).\n * @param {Object=} opt_timerObject  An object that has `setTimeout`,\n *     `setInterval`, `clearTimeout` and `clearInterval`\n *     (e.g., `window`).\n * @constructor\n * @extends {goog.events.EventTarget}\n */\ngoog.Timer = function(opt_interval, opt_timerObject) {\n  goog.events.EventTarget.call(this);\n\n  /**\n   * Number of ms between ticks\n   * @private {number}\n   */\n  this.interval_ = opt_interval || 1;\n\n  /**\n   * An object that implements `setTimeout`, `setInterval`,\n   * `clearTimeout` and `clearInterval`. We default to the window\n   * object. Changing this on {@link goog.Timer.prototype} changes the object\n   * for all timer instances which can be useful if your environment has some\n   * other implementation of timers than the `window` object.\n   * @private {{setTimeout:!Function, clearTimeout:!Function}}\n   */\n  this.timerObject_ = /** @type {{setTimeout, clearTimeout}} */ (\n      opt_timerObject || goog.Timer.defaultTimerObject);\n\n  /**\n   * Cached `tick_` bound to the object for later use in the timer.\n   * @private {Function}\n   * @const\n   */\n  this.boundTick_ = goog.bind(this.tick_, this);\n\n  /**\n   * Firefox browser often fires the timer event sooner (sometimes MUCH sooner)\n   * than the requested timeout. So we compare the time to when the event was\n   * last fired, and reschedule if appropriate. See also\n   * {@link goog.Timer.intervalScale}.\n   * @private {number}\n   */\n  this.last_ = goog.now();\n};\ngoog.inherits(goog.Timer, goog.events.EventTarget);\n\n\n/**\n * Maximum timeout value.\n *\n * Timeout values too big to fit into a signed 32-bit integer may cause overflow\n * in FF, Safari, and Chrome, resulting in the timeout being scheduled\n * immediately. It makes more sense simply not to schedule these timeouts, since\n * 24.8 days is beyond a reasonable expectation for the browser to stay open.\n *\n * @private {number}\n * @const\n */\ngoog.Timer.MAX_TIMEOUT_ = 2147483647;\n\n\n/**\n * A timer ID that cannot be returned by any known implementation of\n * `window.setTimeout`. Passing this value to `window.clearTimeout`\n * should therefore be a no-op.\n *\n * @private {number}\n * @const\n */\ngoog.Timer.INVALID_TIMEOUT_ID_ = -1;\n\n\n/**\n * Whether this timer is enabled\n * @type {boolean}\n */\ngoog.Timer.prototype.enabled = false;\n\n\n/**\n * An object that implements `setTimeout`, `setInterval`,\n * `clearTimeout` and `clearInterval`. We default to the global\n * object. Changing `goog.Timer.defaultTimerObject` changes the object for\n * all timer instances which can be useful if your environment has some other\n * implementation of timers you'd like to use.\n * @type {{setTimeout, clearTimeout}}\n */\ngoog.Timer.defaultTimerObject = goog.global;\n\n\n/**\n * Variable that controls the timer error correction. If the timer is called\n * before the requested interval times `intervalScale`, which often\n * happens on Mozilla, the timer is rescheduled.\n * @see {@link #last_}\n * @type {number}\n */\ngoog.Timer.intervalScale = 0.8;\n\n\n/**\n * Variable for storing the result of `setInterval`.\n * @private {?number}\n */\ngoog.Timer.prototype.timer_ = null;\n\n\n/**\n * Gets the interval of the timer.\n * @return {number} interval Number of ms between ticks.\n */\ngoog.Timer.prototype.getInterval = function() {\n  return this.interval_;\n};\n\n\n/**\n * Sets the interval of the timer.\n * @param {number} interval Number of ms between ticks.\n */\ngoog.Timer.prototype.setInterval = function(interval) {\n  this.interval_ = interval;\n  if (this.timer_ && this.enabled) {\n    // Stop and then start the timer to reset the interval.\n    this.stop();\n    this.start();\n  } else if (this.timer_) {\n    this.stop();\n  }\n};\n\n\n/**\n * Callback for the `setTimeout` used by the timer.\n * @private\n */\ngoog.Timer.prototype.tick_ = function() {\n  if (this.enabled) {\n    var elapsed = goog.now() - this.last_;\n    if (elapsed > 0 && elapsed < this.interval_ * goog.Timer.intervalScale) {\n      this.timer_ = this.timerObject_.setTimeout(\n          this.boundTick_, this.interval_ - elapsed);\n      return;\n    }\n\n    // Prevents setInterval from registering a duplicate timeout when called\n    // in the timer event handler.\n    if (this.timer_) {\n      this.timerObject_.clearTimeout(this.timer_);\n      this.timer_ = null;\n    }\n\n    this.dispatchTick();\n    // The timer could be stopped in the timer event handler.\n    if (this.enabled) {\n      // Stop and start to ensure there is always only one timeout even if\n      // start is called in the timer event handler.\n      this.stop();\n      this.start();\n    }\n  }\n};\n\n\n/**\n * Dispatches the TICK event. This is its own method so subclasses can override.\n */\ngoog.Timer.prototype.dispatchTick = function() {\n  this.dispatchEvent(goog.Timer.TICK);\n};\n\n\n/**\n * Starts the timer.\n */\ngoog.Timer.prototype.start = function() {\n  this.enabled = true;\n\n  // If there is no interval already registered, start it now\n  if (!this.timer_) {\n    // IMPORTANT!\n    // window.setInterval in FireFox has a bug - it fires based on\n    // absolute time, rather than on relative time. What this means\n    // is that if a computer is sleeping/hibernating for 24 hours\n    // and the timer interval was configured to fire every 1000ms,\n    // then after the PC wakes up the timer will fire, in rapid\n    // succession, 3600*24 times.\n    // This bug is described here and is already fixed, but it will\n    // take time to propagate, so for now I am switching this over\n    // to setTimeout logic.\n    //     https://bugzilla.mozilla.org/show_bug.cgi?id=376643\n    //\n    this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);\n    this.last_ = goog.now();\n  }\n};\n\n\n/**\n * Stops the timer.\n */\ngoog.Timer.prototype.stop = function() {\n  this.enabled = false;\n  if (this.timer_) {\n    this.timerObject_.clearTimeout(this.timer_);\n    this.timer_ = null;\n  }\n};\n\n\n/** @override */\ngoog.Timer.prototype.disposeInternal = function() {\n  goog.Timer.superClass_.disposeInternal.call(this);\n  this.stop();\n  delete this.timerObject_;\n};\n\n\n/**\n * Constant for the timer's event type.\n * @const\n */\ngoog.Timer.TICK = 'tick';\n\n\n/**\n * Calls the given function once, after the optional pause.\n * <p>\n * The function is always called asynchronously, even if the delay is 0. This\n * is a common trick to schedule a function to run after a batch of browser\n * event processing.\n *\n * @param {function(this:SCOPE)|{handleEvent:function()}|null} listener Function\n *     or object that has a handleEvent method.\n * @param {number=} opt_delay Milliseconds to wait; default is 0.\n * @param {SCOPE=} opt_handler Object in whose scope to call the listener.\n * @return {number} A handle to the timer ID.\n * @template SCOPE\n */\ngoog.Timer.callOnce = function(listener, opt_delay, opt_handler) {\n  if (goog.isFunction(listener)) {\n    if (opt_handler) {\n      listener = goog.bind(listener, opt_handler);\n    }\n  } else if (listener && typeof listener.handleEvent == 'function') {\n    // using typeof to prevent strict js warning\n    listener = goog.bind(listener.handleEvent, listener);\n  } else {\n    throw new Error('Invalid listener argument');\n  }\n\n  if (Number(opt_delay) > goog.Timer.MAX_TIMEOUT_) {\n    // Timeouts greater than MAX_INT return immediately due to integer\n    // overflow in many browsers.  Since MAX_INT is 24.8 days, just don't\n    // schedule anything at all.\n    return goog.Timer.INVALID_TIMEOUT_ID_;\n  } else {\n    return goog.Timer.defaultTimerObject.setTimeout(listener, opt_delay || 0);\n  }\n};\n\n\n/**\n * Clears a timeout initiated by {@link #callOnce}.\n * @param {?number} timerId A timer ID.\n */\ngoog.Timer.clear = function(timerId) {\n  goog.Timer.defaultTimerObject.clearTimeout(timerId);\n};\n\n\n/**\n * @param {number} delay Milliseconds to wait.\n * @param {(RESULT|goog.Thenable<RESULT>|Thenable)=} opt_result The value\n *     with which the promise will be resolved.\n * @return {!goog.Promise<RESULT>} A promise that will be resolved after\n *     the specified delay, unless it is canceled first.\n * @template RESULT\n */\ngoog.Timer.promise = function(delay, opt_result) {\n  var timerKey = null;\n  return new goog\n      .Promise(function(resolve, reject) {\n        timerKey =\n            goog.Timer.callOnce(function() { resolve(opt_result); }, delay);\n        if (timerKey == goog.Timer.INVALID_TIMEOUT_ID_) {\n          reject(new Error('Failed to schedule timer.'));\n        }\n      })\n      .thenCatch(function(error) {\n        // Clear the timer. The most likely reason is \"cancel\" signal.\n        goog.Timer.clear(timerKey);\n        throw error;\n      });\n};\n","~:compiled-at",1705144116233,"~:source-map-json","{\n\"version\":3,\n\"file\":\"goog.timer.timer.js\",\n\"lineCount\":108,\n\"mappings\":\"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\",\n\"sources\":[\"goog/timer/timer.js\"],\n\"sourcesContent\":[\"// Copyright 2006 The Closure Library Authors. All Rights Reserved.\\n//\\n// Licensed under the Apache License, Version 2.0 (the \\\"License\\\");\\n// you may not use this file except in compliance with the License.\\n// You may obtain a copy of the License at\\n//\\n//      http://www.apache.org/licenses/LICENSE-2.0\\n//\\n// Unless required by applicable law or agreed to in writing, software\\n// distributed under the License is distributed on an \\\"AS-IS\\\" BASIS,\\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\\n// See the License for the specific language governing permissions and\\n// limitations under the License.\\n\\n/**\\n * @fileoverview A timer class to which other classes and objects can listen on.\\n * This is only an abstraction above `setInterval`.\\n *\\n * @see ../demos/timers.html\\n */\\n\\ngoog.provide('goog.Timer');\\n\\ngoog.require('goog.Promise');\\ngoog.require('goog.events.EventTarget');\\n\\n\\n\\n/**\\n * Class for handling timing events.\\n *\\n * @param {number=} opt_interval Number of ms between ticks (default: 1ms).\\n * @param {Object=} opt_timerObject  An object that has `setTimeout`,\\n *     `setInterval`, `clearTimeout` and `clearInterval`\\n *     (e.g., `window`).\\n * @constructor\\n * @extends {goog.events.EventTarget}\\n */\\ngoog.Timer = function(opt_interval, opt_timerObject) {\\n  goog.events.EventTarget.call(this);\\n\\n  /**\\n   * Number of ms between ticks\\n   * @private {number}\\n   */\\n  this.interval_ = opt_interval || 1;\\n\\n  /**\\n   * An object that implements `setTimeout`, `setInterval`,\\n   * `clearTimeout` and `clearInterval`. We default to the window\\n   * object. Changing this on {@link goog.Timer.prototype} changes the object\\n   * for all timer instances which can be useful if your environment has some\\n   * other implementation of timers than the `window` object.\\n   * @private {{setTimeout:!Function, clearTimeout:!Function}}\\n   */\\n  this.timerObject_ = /** @type {{setTimeout, clearTimeout}} */ (\\n      opt_timerObject || goog.Timer.defaultTimerObject);\\n\\n  /**\\n   * Cached `tick_` bound to the object for later use in the timer.\\n   * @private {Function}\\n   * @const\\n   */\\n  this.boundTick_ = goog.bind(this.tick_, this);\\n\\n  /**\\n   * Firefox browser often fires the timer event sooner (sometimes MUCH sooner)\\n   * than the requested timeout. So we compare the time to when the event was\\n   * last fired, and reschedule if appropriate. See also\\n   * {@link goog.Timer.intervalScale}.\\n   * @private {number}\\n   */\\n  this.last_ = goog.now();\\n};\\ngoog.inherits(goog.Timer, goog.events.EventTarget);\\n\\n\\n/**\\n * Maximum timeout value.\\n *\\n * Timeout values too big to fit into a signed 32-bit integer may cause overflow\\n * in FF, Safari, and Chrome, resulting in the timeout being scheduled\\n * immediately. It makes more sense simply not to schedule these timeouts, since\\n * 24.8 days is beyond a reasonable expectation for the browser to stay open.\\n *\\n * @private {number}\\n * @const\\n */\\ngoog.Timer.MAX_TIMEOUT_ = 2147483647;\\n\\n\\n/**\\n * A timer ID that cannot be returned by any known implementation of\\n * `window.setTimeout`. Passing this value to `window.clearTimeout`\\n * should therefore be a no-op.\\n *\\n * @private {number}\\n * @const\\n */\\ngoog.Timer.INVALID_TIMEOUT_ID_ = -1;\\n\\n\\n/**\\n * Whether this timer is enabled\\n * @type {boolean}\\n */\\ngoog.Timer.prototype.enabled = false;\\n\\n\\n/**\\n * An object that implements `setTimeout`, `setInterval`,\\n * `clearTimeout` and `clearInterval`. We default to the global\\n * object. Changing `goog.Timer.defaultTimerObject` changes the object for\\n * all timer instances which can be useful if your environment has some other\\n * implementation of timers you'd like to use.\\n * @type {{setTimeout, clearTimeout}}\\n */\\ngoog.Timer.defaultTimerObject = goog.global;\\n\\n\\n/**\\n * Variable that controls the timer error correction. If the timer is called\\n * before the requested interval times `intervalScale`, which often\\n * happens on Mozilla, the timer is rescheduled.\\n * @see {@link #last_}\\n * @type {number}\\n */\\ngoog.Timer.intervalScale = 0.8;\\n\\n\\n/**\\n * Variable for storing the result of `setInterval`.\\n * @private {?number}\\n */\\ngoog.Timer.prototype.timer_ = null;\\n\\n\\n/**\\n * Gets the interval of the timer.\\n * @return {number} interval Number of ms between ticks.\\n */\\ngoog.Timer.prototype.getInterval = function() {\\n  return this.interval_;\\n};\\n\\n\\n/**\\n * Sets the interval of the timer.\\n * @param {number} interval Number of ms between ticks.\\n */\\ngoog.Timer.prototype.setInterval = function(interval) {\\n  this.interval_ = interval;\\n  if (this.timer_ && this.enabled) {\\n    // Stop and then start the timer to reset the interval.\\n    this.stop();\\n    this.start();\\n  } else if (this.timer_) {\\n    this.stop();\\n  }\\n};\\n\\n\\n/**\\n * Callback for the `setTimeout` used by the timer.\\n * @private\\n */\\ngoog.Timer.prototype.tick_ = function() {\\n  if (this.enabled) {\\n    var elapsed = goog.now() - this.last_;\\n    if (elapsed > 0 && elapsed < this.interval_ * goog.Timer.intervalScale) {\\n      this.timer_ = this.timerObject_.setTimeout(\\n          this.boundTick_, this.interval_ - elapsed);\\n      return;\\n    }\\n\\n    // Prevents setInterval from registering a duplicate timeout when called\\n    // in the timer event handler.\\n    if (this.timer_) {\\n      this.timerObject_.clearTimeout(this.timer_);\\n      this.timer_ = null;\\n    }\\n\\n    this.dispatchTick();\\n    // The timer could be stopped in the timer event handler.\\n    if (this.enabled) {\\n      // Stop and start to ensure there is always only one timeout even if\\n      // start is called in the timer event handler.\\n      this.stop();\\n      this.start();\\n    }\\n  }\\n};\\n\\n\\n/**\\n * Dispatches the TICK event. This is its own method so subclasses can override.\\n */\\ngoog.Timer.prototype.dispatchTick = function() {\\n  this.dispatchEvent(goog.Timer.TICK);\\n};\\n\\n\\n/**\\n * Starts the timer.\\n */\\ngoog.Timer.prototype.start = function() {\\n  this.enabled = true;\\n\\n  // If there is no interval already registered, start it now\\n  if (!this.timer_) {\\n    // IMPORTANT!\\n    // window.setInterval in FireFox has a bug - it fires based on\\n    // absolute time, rather than on relative time. What this means\\n    // is that if a computer is sleeping/hibernating for 24 hours\\n    // and the timer interval was configured to fire every 1000ms,\\n    // then after the PC wakes up the timer will fire, in rapid\\n    // succession, 3600*24 times.\\n    // This bug is described here and is already fixed, but it will\\n    // take time to propagate, so for now I am switching this over\\n    // to setTimeout logic.\\n    //     https://bugzilla.mozilla.org/show_bug.cgi?id=376643\\n    //\\n    this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);\\n    this.last_ = goog.now();\\n  }\\n};\\n\\n\\n/**\\n * Stops the timer.\\n */\\ngoog.Timer.prototype.stop = function() {\\n  this.enabled = false;\\n  if (this.timer_) {\\n    this.timerObject_.clearTimeout(this.timer_);\\n    this.timer_ = null;\\n  }\\n};\\n\\n\\n/** @override */\\ngoog.Timer.prototype.disposeInternal = function() {\\n  goog.Timer.superClass_.disposeInternal.call(this);\\n  this.stop();\\n  delete this.timerObject_;\\n};\\n\\n\\n/**\\n * Constant for the timer's event type.\\n * @const\\n */\\ngoog.Timer.TICK = 'tick';\\n\\n\\n/**\\n * Calls the given function once, after the optional pause.\\n * <p>\\n * The function is always called asynchronously, even if the delay is 0. This\\n * is a common trick to schedule a function to run after a batch of browser\\n * event processing.\\n *\\n * @param {function(this:SCOPE)|{handleEvent:function()}|null} listener Function\\n *     or object that has a handleEvent method.\\n * @param {number=} opt_delay Milliseconds to wait; default is 0.\\n * @param {SCOPE=} opt_handler Object in whose scope to call the listener.\\n * @return {number} A handle to the timer ID.\\n * @template SCOPE\\n */\\ngoog.Timer.callOnce = function(listener, opt_delay, opt_handler) {\\n  if (goog.isFunction(listener)) {\\n    if (opt_handler) {\\n      listener = goog.bind(listener, opt_handler);\\n    }\\n  } else if (listener && typeof listener.handleEvent == 'function') {\\n    // using typeof to prevent strict js warning\\n    listener = goog.bind(listener.handleEvent, listener);\\n  } else {\\n    throw new Error('Invalid listener argument');\\n  }\\n\\n  if (Number(opt_delay) > goog.Timer.MAX_TIMEOUT_) {\\n    // Timeouts greater than MAX_INT return immediately due to integer\\n    // overflow in many browsers.  Since MAX_INT is 24.8 days, just don't\\n    // schedule anything at all.\\n    return goog.Timer.INVALID_TIMEOUT_ID_;\\n  } else {\\n    return goog.Timer.defaultTimerObject.setTimeout(listener, opt_delay || 0);\\n  }\\n};\\n\\n\\n/**\\n * Clears a timeout initiated by {@link #callOnce}.\\n * @param {?number} timerId A timer ID.\\n */\\ngoog.Timer.clear = function(timerId) {\\n  goog.Timer.defaultTimerObject.clearTimeout(timerId);\\n};\\n\\n\\n/**\\n * @param {number} delay Milliseconds to wait.\\n * @param {(RESULT|goog.Thenable<RESULT>|Thenable)=} opt_result The value\\n *     with which the promise will be resolved.\\n * @return {!goog.Promise<RESULT>} A promise that will be resolved after\\n *     the specified delay, unless it is canceled first.\\n * @template RESULT\\n */\\ngoog.Timer.promise = function(delay, opt_result) {\\n  var timerKey = null;\\n  return new goog\\n      .Promise(function(resolve, reject) {\\n        timerKey =\\n            goog.Timer.callOnce(function() { resolve(opt_result); }, delay);\\n        if (timerKey == goog.Timer.INVALID_TIMEOUT_ID_) {\\n          reject(new Error('Failed to schedule timer.'));\\n        }\\n      })\\n      .thenCatch(function(error) {\\n        // Clear the timer. The most likely reason is \\\"cancel\\\" signal.\\n        goog.Timer.clear(timerKey);\\n        throw error;\\n      });\\n};\\n\"],\n\"names\":[\"goog\",\"provide\",\"require\",\"Timer\",\"goog.Timer\",\"opt_interval\",\"opt_timerObject\",\"events\",\"EventTarget\",\"call\",\"interval_\",\"timerObject_\",\"defaultTimerObject\",\"boundTick_\",\"bind\",\"tick_\",\"last_\",\"now\",\"inherits\",\"MAX_TIMEOUT_\",\"INVALID_TIMEOUT_ID_\",\"prototype\",\"enabled\",\"global\",\"intervalScale\",\"timer_\",\"getInterval\",\"goog.Timer.prototype.getInterval\",\"setInterval\",\"goog.Timer.prototype.setInterval\",\"interval\",\"stop\",\"start\",\"goog.Timer.prototype.tick_\",\"elapsed\",\"setTimeout\",\"clearTimeout\",\"dispatchTick\",\"goog.Timer.prototype.dispatchTick\",\"dispatchEvent\",\"TICK\",\"goog.Timer.prototype.start\",\"goog.Timer.prototype.stop\",\"disposeInternal\",\"goog.Timer.prototype.disposeInternal\",\"superClass_\",\"callOnce\",\"goog.Timer.callOnce\",\"listener\",\"opt_delay\",\"opt_handler\",\"isFunction\",\"handleEvent\",\"Error\",\"Number\",\"clear\",\"goog.Timer.clear\",\"timerId\",\"promise\",\"goog.Timer.promise\",\"delay\",\"opt_result\",\"timerKey\",\"Promise\",\"resolve\",\"reject\",\"thenCatch\",\"error\"]\n}\n"]