["^ ","~:resource-id",["~:shadow.build.classpath/resource","goog/structs/prioritypool.js"],"~:js","goog.provide(\"goog.structs.PriorityPool\");\ngoog.require(\"goog.structs.Pool\");\ngoog.require(\"goog.structs.PriorityQueue\");\ngoog.structs.PriorityPool = function(opt_minCount, opt_maxCount) {\n  this.delayTimeout_ = undefined;\n  this.requestQueue_ = new goog.structs.PriorityQueue;\n  goog.structs.Pool.call(this, opt_minCount, opt_maxCount);\n};\ngoog.inherits(goog.structs.PriorityPool, goog.structs.Pool);\ngoog.structs.PriorityPool.DEFAULT_PRIORITY_ = 100;\ngoog.structs.PriorityPool.prototype.setDelay = function(delay) {\n  goog.structs.PriorityPool.base(this, \"setDelay\", delay);\n  if (this.lastAccess == null) {\n    return;\n  }\n  goog.global.clearTimeout(this.delayTimeout_);\n  this.delayTimeout_ = goog.global.setTimeout(goog.bind(this.handleQueueRequests_, this), this.delay + this.lastAccess - goog.now());\n  this.handleQueueRequests_();\n};\ngoog.structs.PriorityPool.prototype.getObject = function(opt_callback, opt_priority) {\n  if (!opt_callback) {\n    var result = goog.structs.PriorityPool.base(this, \"getObject\");\n    if (result && this.delay) {\n      this.delayTimeout_ = goog.global.setTimeout(goog.bind(this.handleQueueRequests_, this), this.delay);\n    }\n    return result;\n  }\n  var priority = opt_priority !== undefined ? opt_priority : goog.structs.PriorityPool.DEFAULT_PRIORITY_;\n  this.requestQueue_.enqueue(priority, opt_callback);\n  this.handleQueueRequests_();\n  return undefined;\n};\ngoog.structs.PriorityPool.prototype.handleQueueRequests_ = function() {\n  var requestQueue = this.requestQueue_;\n  while (requestQueue.getCount() > 0) {\n    var obj = this.getObject();\n    if (!obj) {\n      return;\n    } else {\n      var requestCallback = requestQueue.dequeue();\n      requestCallback.apply(this, [obj]);\n    }\n  }\n};\ngoog.structs.PriorityPool.prototype.addFreeObject = function(obj) {\n  goog.structs.PriorityPool.superClass_.addFreeObject.call(this, obj);\n  this.handleQueueRequests_();\n};\ngoog.structs.PriorityPool.prototype.adjustForMinMax = function() {\n  goog.structs.PriorityPool.superClass_.adjustForMinMax.call(this);\n  this.handleQueueRequests_();\n};\ngoog.structs.PriorityPool.prototype.disposeInternal = function() {\n  goog.structs.PriorityPool.superClass_.disposeInternal.call(this);\n  goog.global.clearTimeout(this.delayTimeout_);\n  this.requestQueue_.clear();\n  this.requestQueue_ = null;\n};\n","~:source","// Copyright 2006 The Closure Library Authors. All Rights Reserved.\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//      http://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS-IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\n\n/**\n * @fileoverview Datastructure: Priority Pool.\n *\n *\n * An extending of Pool that handles queueing and prioritization.\n */\n\n\ngoog.provide('goog.structs.PriorityPool');\n\ngoog.require('goog.structs.Pool');\ngoog.require('goog.structs.PriorityQueue');\n\n\n\n/**\n * A generic pool class. If min is greater than max, an error is thrown.\n * @param {number=} opt_minCount Min. number of objects (Default: 0).\n * @param {number=} opt_maxCount Max. number of objects (Default: 10).\n * @constructor\n * @extends {goog.structs.Pool<VALUE>}\n * @template VALUE\n */\ngoog.structs.PriorityPool = function(opt_minCount, opt_maxCount) {\n  /**\n   * The key for the most recent timeout created.\n   * @private {number|undefined}\n   */\n  this.delayTimeout_ = undefined;\n\n  /**\n   * Queue of requests for pool objects.\n   * @private {goog.structs.PriorityQueue<VALUE>}\n   */\n  this.requestQueue_ = new goog.structs.PriorityQueue();\n\n  // Must break convention of putting the super-class's constructor first. This\n  // is because the super-class constructor calls adjustForMinMax, which this\n  // class overrides. In this class's implementation, it assumes that there\n  // is a requestQueue_, and will error if not present.\n  goog.structs.Pool.call(this, opt_minCount, opt_maxCount);\n};\ngoog.inherits(goog.structs.PriorityPool, goog.structs.Pool);\n\n\n/**\n * Default priority for pool objects requests.\n * @type {number}\n * @private\n */\ngoog.structs.PriorityPool.DEFAULT_PRIORITY_ = 100;\n\n\n/** @override */\ngoog.structs.PriorityPool.prototype.setDelay = function(delay) {\n  goog.structs.PriorityPool.base(this, 'setDelay', delay);\n\n  // If the pool hasn't been accessed yet, no need to do anything.\n  if (this.lastAccess == null) {\n    return;\n  }\n\n  goog.global.clearTimeout(this.delayTimeout_);\n  this.delayTimeout_ = goog.global.setTimeout(\n      goog.bind(this.handleQueueRequests_, this),\n      this.delay + this.lastAccess - goog.now());\n\n  // Handle all requests.\n  this.handleQueueRequests_();\n};\n\n\n/**\n * Get a new object from the the pool, if there is one available, otherwise\n * return undefined.\n * @param {Function=} opt_callback The function to callback when an object is\n *     available. This could be immediately. If this is not present, then an\n *     object is immediately returned if available, or undefined if not.\n * @param {number=} opt_priority The priority of the request. A smaller value\n *     means a higher priority.\n * @return {VALUE|undefined} The new object from the pool if there is one\n *     available and a callback is not given. Otherwise, undefined.\n * @override\n */\ngoog.structs.PriorityPool.prototype.getObject = function(\n    opt_callback, opt_priority) {\n  if (!opt_callback) {\n    var result = goog.structs.PriorityPool.base(this, 'getObject');\n    if (result && this.delay) {\n      this.delayTimeout_ = goog.global.setTimeout(\n          goog.bind(this.handleQueueRequests_, this), this.delay);\n    }\n    return result;\n  }\n\n  var priority = (opt_priority !== undefined) ?\n      opt_priority :\n      goog.structs.PriorityPool.DEFAULT_PRIORITY_;\n  this.requestQueue_.enqueue(priority, opt_callback);\n\n  // Handle all requests.\n  this.handleQueueRequests_();\n\n  return undefined;\n};\n\n\n/**\n * Handles the request queue. Tries to fires off as many queued requests as\n * possible.\n * @private\n */\ngoog.structs.PriorityPool.prototype.handleQueueRequests_ = function() {\n  var requestQueue = this.requestQueue_;\n  while (requestQueue.getCount() > 0) {\n    var obj = this.getObject();\n\n    if (!obj) {\n      return;\n    } else {\n      var requestCallback = requestQueue.dequeue();\n      requestCallback.apply(this, [obj]);\n    }\n  }\n};\n\n\n/**\n * Adds an object to the collection of objects that are free. If the object can\n * not be added, then it is disposed.\n *\n * NOTE: This method does not remove the object from the in use collection.\n *\n * @param {VALUE} obj The object to add to the collection of free objects.\n * @override\n */\ngoog.structs.PriorityPool.prototype.addFreeObject = function(obj) {\n  goog.structs.PriorityPool.superClass_.addFreeObject.call(this, obj);\n\n  // Handle all requests.\n  this.handleQueueRequests_();\n};\n\n\n/**\n * Adjusts the objects held in the pool to be within the min/max constraints.\n *\n * NOTE: It is possible that the number of objects in the pool will still be\n * greater than the maximum count of objects allowed. This will be the case\n * if no more free objects can be disposed of to get below the minimum count\n * (i.e., all objects are in use).\n * @override\n */\ngoog.structs.PriorityPool.prototype.adjustForMinMax = function() {\n  goog.structs.PriorityPool.superClass_.adjustForMinMax.call(this);\n\n  // Handle all requests.\n  this.handleQueueRequests_();\n};\n\n\n/** @override */\ngoog.structs.PriorityPool.prototype.disposeInternal = function() {\n  goog.structs.PriorityPool.superClass_.disposeInternal.call(this);\n  goog.global.clearTimeout(this.delayTimeout_);\n  this.requestQueue_.clear();\n  this.requestQueue_ = null;\n};\n","~:compiled-at",1705144116250,"~:source-map-json","{\n\"version\":3,\n\"file\":\"goog.structs.prioritypool.js\",\n\"lineCount\":59,\n\"mappings\":\"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\",\n\"sources\":[\"goog/structs/prioritypool.js\"],\n\"sourcesContent\":[\"// Copyright 2006 The Closure Library Authors. All Rights Reserved.\\n//\\n// Licensed under the Apache License, Version 2.0 (the \\\"License\\\");\\n// you may not use this file except in compliance with the License.\\n// You may obtain a copy of the License at\\n//\\n//      http://www.apache.org/licenses/LICENSE-2.0\\n//\\n// Unless required by applicable law or agreed to in writing, software\\n// distributed under the License is distributed on an \\\"AS-IS\\\" BASIS,\\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\\n// See the License for the specific language governing permissions and\\n// limitations under the License.\\n\\n/**\\n * @fileoverview Datastructure: Priority Pool.\\n *\\n *\\n * An extending of Pool that handles queueing and prioritization.\\n */\\n\\n\\ngoog.provide('goog.structs.PriorityPool');\\n\\ngoog.require('goog.structs.Pool');\\ngoog.require('goog.structs.PriorityQueue');\\n\\n\\n\\n/**\\n * A generic pool class. If min is greater than max, an error is thrown.\\n * @param {number=} opt_minCount Min. number of objects (Default: 0).\\n * @param {number=} opt_maxCount Max. number of objects (Default: 10).\\n * @constructor\\n * @extends {goog.structs.Pool<VALUE>}\\n * @template VALUE\\n */\\ngoog.structs.PriorityPool = function(opt_minCount, opt_maxCount) {\\n  /**\\n   * The key for the most recent timeout created.\\n   * @private {number|undefined}\\n   */\\n  this.delayTimeout_ = undefined;\\n\\n  /**\\n   * Queue of requests for pool objects.\\n   * @private {goog.structs.PriorityQueue<VALUE>}\\n   */\\n  this.requestQueue_ = new goog.structs.PriorityQueue();\\n\\n  // Must break convention of putting the super-class's constructor first. This\\n  // is because the super-class constructor calls adjustForMinMax, which this\\n  // class overrides. In this class's implementation, it assumes that there\\n  // is a requestQueue_, and will error if not present.\\n  goog.structs.Pool.call(this, opt_minCount, opt_maxCount);\\n};\\ngoog.inherits(goog.structs.PriorityPool, goog.structs.Pool);\\n\\n\\n/**\\n * Default priority for pool objects requests.\\n * @type {number}\\n * @private\\n */\\ngoog.structs.PriorityPool.DEFAULT_PRIORITY_ = 100;\\n\\n\\n/** @override */\\ngoog.structs.PriorityPool.prototype.setDelay = function(delay) {\\n  goog.structs.PriorityPool.base(this, 'setDelay', delay);\\n\\n  // If the pool hasn't been accessed yet, no need to do anything.\\n  if (this.lastAccess == null) {\\n    return;\\n  }\\n\\n  goog.global.clearTimeout(this.delayTimeout_);\\n  this.delayTimeout_ = goog.global.setTimeout(\\n      goog.bind(this.handleQueueRequests_, this),\\n      this.delay + this.lastAccess - goog.now());\\n\\n  // Handle all requests.\\n  this.handleQueueRequests_();\\n};\\n\\n\\n/**\\n * Get a new object from the the pool, if there is one available, otherwise\\n * return undefined.\\n * @param {Function=} opt_callback The function to callback when an object is\\n *     available. This could be immediately. If this is not present, then an\\n *     object is immediately returned if available, or undefined if not.\\n * @param {number=} opt_priority The priority of the request. A smaller value\\n *     means a higher priority.\\n * @return {VALUE|undefined} The new object from the pool if there is one\\n *     available and a callback is not given. Otherwise, undefined.\\n * @override\\n */\\ngoog.structs.PriorityPool.prototype.getObject = function(\\n    opt_callback, opt_priority) {\\n  if (!opt_callback) {\\n    var result = goog.structs.PriorityPool.base(this, 'getObject');\\n    if (result && this.delay) {\\n      this.delayTimeout_ = goog.global.setTimeout(\\n          goog.bind(this.handleQueueRequests_, this), this.delay);\\n    }\\n    return result;\\n  }\\n\\n  var priority = (opt_priority !== undefined) ?\\n      opt_priority :\\n      goog.structs.PriorityPool.DEFAULT_PRIORITY_;\\n  this.requestQueue_.enqueue(priority, opt_callback);\\n\\n  // Handle all requests.\\n  this.handleQueueRequests_();\\n\\n  return undefined;\\n};\\n\\n\\n/**\\n * Handles the request queue. Tries to fires off as many queued requests as\\n * possible.\\n * @private\\n */\\ngoog.structs.PriorityPool.prototype.handleQueueRequests_ = function() {\\n  var requestQueue = this.requestQueue_;\\n  while (requestQueue.getCount() > 0) {\\n    var obj = this.getObject();\\n\\n    if (!obj) {\\n      return;\\n    } else {\\n      var requestCallback = requestQueue.dequeue();\\n      requestCallback.apply(this, [obj]);\\n    }\\n  }\\n};\\n\\n\\n/**\\n * Adds an object to the collection of objects that are free. If the object can\\n * not be added, then it is disposed.\\n *\\n * NOTE: This method does not remove the object from the in use collection.\\n *\\n * @param {VALUE} obj The object to add to the collection of free objects.\\n * @override\\n */\\ngoog.structs.PriorityPool.prototype.addFreeObject = function(obj) {\\n  goog.structs.PriorityPool.superClass_.addFreeObject.call(this, obj);\\n\\n  // Handle all requests.\\n  this.handleQueueRequests_();\\n};\\n\\n\\n/**\\n * Adjusts the objects held in the pool to be within the min/max constraints.\\n *\\n * NOTE: It is possible that the number of objects in the pool will still be\\n * greater than the maximum count of objects allowed. This will be the case\\n * if no more free objects can be disposed of to get below the minimum count\\n * (i.e., all objects are in use).\\n * @override\\n */\\ngoog.structs.PriorityPool.prototype.adjustForMinMax = function() {\\n  goog.structs.PriorityPool.superClass_.adjustForMinMax.call(this);\\n\\n  // Handle all requests.\\n  this.handleQueueRequests_();\\n};\\n\\n\\n/** @override */\\ngoog.structs.PriorityPool.prototype.disposeInternal = function() {\\n  goog.structs.PriorityPool.superClass_.disposeInternal.call(this);\\n  goog.global.clearTimeout(this.delayTimeout_);\\n  this.requestQueue_.clear();\\n  this.requestQueue_ = null;\\n};\\n\"],\n\"names\":[\"goog\",\"provide\",\"require\",\"structs\",\"PriorityPool\",\"goog.structs.PriorityPool\",\"opt_minCount\",\"opt_maxCount\",\"delayTimeout_\",\"undefined\",\"requestQueue_\",\"PriorityQueue\",\"Pool\",\"call\",\"inherits\",\"DEFAULT_PRIORITY_\",\"prototype\",\"setDelay\",\"goog.structs.PriorityPool.prototype.setDelay\",\"delay\",\"base\",\"lastAccess\",\"global\",\"clearTimeout\",\"setTimeout\",\"bind\",\"handleQueueRequests_\",\"now\",\"getObject\",\"goog.structs.PriorityPool.prototype.getObject\",\"opt_callback\",\"opt_priority\",\"result\",\"priority\",\"enqueue\",\"goog.structs.PriorityPool.prototype.handleQueueRequests_\",\"requestQueue\",\"getCount\",\"obj\",\"requestCallback\",\"dequeue\",\"apply\",\"addFreeObject\",\"goog.structs.PriorityPool.prototype.addFreeObject\",\"superClass_\",\"adjustForMinMax\",\"goog.structs.PriorityPool.prototype.adjustForMinMax\",\"disposeInternal\",\"goog.structs.PriorityPool.prototype.disposeInternal\",\"clear\"]\n}\n"]