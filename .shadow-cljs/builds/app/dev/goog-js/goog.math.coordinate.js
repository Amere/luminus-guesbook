["^ ","~:resource-id",["~:shadow.build.classpath/resource","goog/math/coordinate.js"],"~:js","goog.provide(\"goog.math.Coordinate\");\ngoog.require(\"goog.math\");\ngoog.math.Coordinate = function(opt_x, opt_y) {\n  this.x = opt_x !== undefined ? opt_x : 0;\n  this.y = opt_y !== undefined ? opt_y : 0;\n};\ngoog.math.Coordinate.prototype.clone = function() {\n  return new goog.math.Coordinate(this.x, this.y);\n};\nif (goog.DEBUG) {\n  goog.math.Coordinate.prototype.toString = function() {\n    return \"(\" + this.x + \", \" + this.y + \")\";\n  };\n}\ngoog.math.Coordinate.prototype.equals = function(other) {\n  return other instanceof goog.math.Coordinate && goog.math.Coordinate.equals(this, other);\n};\ngoog.math.Coordinate.equals = function(a, b) {\n  if (a == b) {\n    return true;\n  }\n  if (!a || !b) {\n    return false;\n  }\n  return a.x == b.x && a.y == b.y;\n};\ngoog.math.Coordinate.distance = function(a, b) {\n  var dx = a.x - b.x;\n  var dy = a.y - b.y;\n  return Math.sqrt(dx * dx + dy * dy);\n};\ngoog.math.Coordinate.magnitude = function(a) {\n  return Math.sqrt(a.x * a.x + a.y * a.y);\n};\ngoog.math.Coordinate.azimuth = function(a) {\n  return goog.math.angle(0, 0, a.x, a.y);\n};\ngoog.math.Coordinate.squaredDistance = function(a, b) {\n  var dx = a.x - b.x;\n  var dy = a.y - b.y;\n  return dx * dx + dy * dy;\n};\ngoog.math.Coordinate.difference = function(a, b) {\n  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);\n};\ngoog.math.Coordinate.sum = function(a, b) {\n  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);\n};\ngoog.math.Coordinate.prototype.ceil = function() {\n  this.x = Math.ceil(this.x);\n  this.y = Math.ceil(this.y);\n  return this;\n};\ngoog.math.Coordinate.prototype.floor = function() {\n  this.x = Math.floor(this.x);\n  this.y = Math.floor(this.y);\n  return this;\n};\ngoog.math.Coordinate.prototype.round = function() {\n  this.x = Math.round(this.x);\n  this.y = Math.round(this.y);\n  return this;\n};\ngoog.math.Coordinate.prototype.translate = function(tx, opt_ty) {\n  if (tx instanceof goog.math.Coordinate) {\n    this.x += tx.x;\n    this.y += tx.y;\n  } else {\n    this.x += Number(tx);\n    if (typeof opt_ty === \"number\") {\n      this.y += opt_ty;\n    }\n  }\n  return this;\n};\ngoog.math.Coordinate.prototype.scale = function(sx, opt_sy) {\n  var sy = typeof opt_sy === \"number\" ? opt_sy : sx;\n  this.x *= sx;\n  this.y *= sy;\n  return this;\n};\ngoog.math.Coordinate.prototype.rotateRadians = function(radians, opt_center) {\n  var center = opt_center || new goog.math.Coordinate(0, 0);\n  var x = this.x;\n  var y = this.y;\n  var cos = Math.cos(radians);\n  var sin = Math.sin(radians);\n  this.x = (x - center.x) * cos - (y - center.y) * sin + center.x;\n  this.y = (x - center.x) * sin + (y - center.y) * cos + center.y;\n};\ngoog.math.Coordinate.prototype.rotateDegrees = function(degrees, opt_center) {\n  this.rotateRadians(goog.math.toRadians(degrees), opt_center);\n};\n","~:source","// Copyright 2006 The Closure Library Authors. All Rights Reserved.\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//      http://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS-IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\n\n/**\n * @fileoverview A utility class for representing two-dimensional positions.\n */\n\n\ngoog.provide('goog.math.Coordinate');\n\ngoog.require('goog.math');\n\n\n\n/**\n * Class for representing coordinates and positions.\n * @param {number=} opt_x Left, defaults to 0.\n * @param {number=} opt_y Top, defaults to 0.\n * @struct\n * @constructor\n */\ngoog.math.Coordinate = function(opt_x, opt_y) {\n  /**\n   * X-value\n   * @type {number}\n   */\n  this.x = (opt_x !== undefined) ? opt_x : 0;\n\n  /**\n   * Y-value\n   * @type {number}\n   */\n  this.y = (opt_y !== undefined) ? opt_y : 0;\n};\n\n\n/**\n * Returns a new copy of the coordinate.\n * @return {!goog.math.Coordinate} A clone of this coordinate.\n */\ngoog.math.Coordinate.prototype.clone = function() {\n  return new goog.math.Coordinate(this.x, this.y);\n};\n\n\nif (goog.DEBUG) {\n  /**\n   * Returns a nice string representing the coordinate.\n   * @return {string} In the form (50, 73).\n   * @override\n   */\n  goog.math.Coordinate.prototype.toString = function() {\n    return '(' + this.x + ', ' + this.y + ')';\n  };\n}\n\n\n/**\n * Returns whether the specified value is equal to this coordinate.\n * @param {*} other Some other value.\n * @return {boolean} Whether the specified value is equal to this coordinate.\n */\ngoog.math.Coordinate.prototype.equals = function(other) {\n  return other instanceof goog.math.Coordinate &&\n      goog.math.Coordinate.equals(this, other);\n};\n\n\n/**\n * Compares coordinates for equality.\n * @param {goog.math.Coordinate} a A Coordinate.\n * @param {goog.math.Coordinate} b A Coordinate.\n * @return {boolean} True iff the coordinates are equal, or if both are null.\n */\ngoog.math.Coordinate.equals = function(a, b) {\n  if (a == b) {\n    return true;\n  }\n  if (!a || !b) {\n    return false;\n  }\n  return a.x == b.x && a.y == b.y;\n};\n\n\n/**\n * Returns the distance between two coordinates.\n * @param {!goog.math.Coordinate} a A Coordinate.\n * @param {!goog.math.Coordinate} b A Coordinate.\n * @return {number} The distance between `a` and `b`.\n */\ngoog.math.Coordinate.distance = function(a, b) {\n  var dx = a.x - b.x;\n  var dy = a.y - b.y;\n  return Math.sqrt(dx * dx + dy * dy);\n};\n\n\n/**\n * Returns the magnitude of a coordinate.\n * @param {!goog.math.Coordinate} a A Coordinate.\n * @return {number} The distance between the origin and `a`.\n */\ngoog.math.Coordinate.magnitude = function(a) {\n  return Math.sqrt(a.x * a.x + a.y * a.y);\n};\n\n\n/**\n * Returns the angle from the origin to a coordinate.\n * @param {!goog.math.Coordinate} a A Coordinate.\n * @return {number} The angle, in degrees, clockwise from the positive X\n *     axis to `a`.\n */\ngoog.math.Coordinate.azimuth = function(a) {\n  return goog.math.angle(0, 0, a.x, a.y);\n};\n\n\n/**\n * Returns the squared distance between two coordinates. Squared distances can\n * be used for comparisons when the actual value is not required.\n *\n * Performance note: eliminating the square root is an optimization often used\n * in lower-level languages, but the speed difference is not nearly as\n * pronounced in JavaScript (only a few percent.)\n *\n * @param {!goog.math.Coordinate} a A Coordinate.\n * @param {!goog.math.Coordinate} b A Coordinate.\n * @return {number} The squared distance between `a` and `b`.\n */\ngoog.math.Coordinate.squaredDistance = function(a, b) {\n  var dx = a.x - b.x;\n  var dy = a.y - b.y;\n  return dx * dx + dy * dy;\n};\n\n\n/**\n * Returns the difference between two coordinates as a new\n * goog.math.Coordinate.\n * @param {!goog.math.Coordinate} a A Coordinate.\n * @param {!goog.math.Coordinate} b A Coordinate.\n * @return {!goog.math.Coordinate} A Coordinate representing the difference\n *     between `a` and `b`.\n */\ngoog.math.Coordinate.difference = function(a, b) {\n  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);\n};\n\n\n/**\n * Returns the sum of two coordinates as a new goog.math.Coordinate.\n * @param {!goog.math.Coordinate} a A Coordinate.\n * @param {!goog.math.Coordinate} b A Coordinate.\n * @return {!goog.math.Coordinate} A Coordinate representing the sum of the two\n *     coordinates.\n */\ngoog.math.Coordinate.sum = function(a, b) {\n  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);\n};\n\n\n/**\n * Rounds the x and y fields to the next larger integer values.\n * @return {!goog.math.Coordinate} This coordinate with ceil'd fields.\n */\ngoog.math.Coordinate.prototype.ceil = function() {\n  this.x = Math.ceil(this.x);\n  this.y = Math.ceil(this.y);\n  return this;\n};\n\n\n/**\n * Rounds the x and y fields to the next smaller integer values.\n * @return {!goog.math.Coordinate} This coordinate with floored fields.\n */\ngoog.math.Coordinate.prototype.floor = function() {\n  this.x = Math.floor(this.x);\n  this.y = Math.floor(this.y);\n  return this;\n};\n\n\n/**\n * Rounds the x and y fields to the nearest integer values.\n * @return {!goog.math.Coordinate} This coordinate with rounded fields.\n */\ngoog.math.Coordinate.prototype.round = function() {\n  this.x = Math.round(this.x);\n  this.y = Math.round(this.y);\n  return this;\n};\n\n\n/**\n * Translates this box by the given offsets. If a `goog.math.Coordinate`\n * is given, then the x and y values are translated by the coordinate's x and y.\n * Otherwise, x and y are translated by `tx` and `opt_ty`\n * respectively.\n * @param {number|goog.math.Coordinate} tx The value to translate x by or the\n *     the coordinate to translate this coordinate by.\n * @param {number=} opt_ty The value to translate y by.\n * @return {!goog.math.Coordinate} This coordinate after translating.\n */\ngoog.math.Coordinate.prototype.translate = function(tx, opt_ty) {\n  if (tx instanceof goog.math.Coordinate) {\n    this.x += tx.x;\n    this.y += tx.y;\n  } else {\n    this.x += Number(tx);\n    if (typeof opt_ty === 'number') {\n      this.y += opt_ty;\n    }\n  }\n  return this;\n};\n\n\n/**\n * Scales this coordinate by the given scale factors. The x and y values are\n * scaled by `sx` and `opt_sy` respectively.  If `opt_sy`\n * is not given, then `sx` is used for both x and y.\n * @param {number} sx The scale factor to use for the x dimension.\n * @param {number=} opt_sy The scale factor to use for the y dimension.\n * @return {!goog.math.Coordinate} This coordinate after scaling.\n */\ngoog.math.Coordinate.prototype.scale = function(sx, opt_sy) {\n  var sy = (typeof opt_sy === 'number') ? opt_sy : sx;\n  this.x *= sx;\n  this.y *= sy;\n  return this;\n};\n\n\n/**\n * Rotates this coordinate clockwise about the origin (or, optionally, the given\n * center) by the given angle, in radians.\n * @param {number} radians The angle by which to rotate this coordinate\n *     clockwise about the given center, in radians.\n * @param {!goog.math.Coordinate=} opt_center The center of rotation. Defaults\n *     to (0, 0) if not given.\n */\ngoog.math.Coordinate.prototype.rotateRadians = function(radians, opt_center) {\n  var center = opt_center || new goog.math.Coordinate(0, 0);\n\n  var x = this.x;\n  var y = this.y;\n  var cos = Math.cos(radians);\n  var sin = Math.sin(radians);\n\n  this.x = (x - center.x) * cos - (y - center.y) * sin + center.x;\n  this.y = (x - center.x) * sin + (y - center.y) * cos + center.y;\n};\n\n\n/**\n * Rotates this coordinate clockwise about the origin (or, optionally, the given\n * center) by the given angle, in degrees.\n * @param {number} degrees The angle by which to rotate this coordinate\n *     clockwise about the given center, in degrees.\n * @param {!goog.math.Coordinate=} opt_center The center of rotation. Defaults\n *     to (0, 0) if not given.\n */\ngoog.math.Coordinate.prototype.rotateDegrees = function(degrees, opt_center) {\n  this.rotateRadians(goog.math.toRadians(degrees), opt_center);\n};\n","~:compiled-at",1705142709826,"~:source-map-json","{\n\"version\":3,\n\"file\":\"goog.math.coordinate.js\",\n\"lineCount\":94,\n\"mappings\":\"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\",\n\"sources\":[\"goog/math/coordinate.js\"],\n\"sourcesContent\":[\"// Copyright 2006 The Closure Library Authors. All Rights Reserved.\\n//\\n// Licensed under the Apache License, Version 2.0 (the \\\"License\\\");\\n// you may not use this file except in compliance with the License.\\n// You may obtain a copy of the License at\\n//\\n//      http://www.apache.org/licenses/LICENSE-2.0\\n//\\n// Unless required by applicable law or agreed to in writing, software\\n// distributed under the License is distributed on an \\\"AS-IS\\\" BASIS,\\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\\n// See the License for the specific language governing permissions and\\n// limitations under the License.\\n\\n/**\\n * @fileoverview A utility class for representing two-dimensional positions.\\n */\\n\\n\\ngoog.provide('goog.math.Coordinate');\\n\\ngoog.require('goog.math');\\n\\n\\n\\n/**\\n * Class for representing coordinates and positions.\\n * @param {number=} opt_x Left, defaults to 0.\\n * @param {number=} opt_y Top, defaults to 0.\\n * @struct\\n * @constructor\\n */\\ngoog.math.Coordinate = function(opt_x, opt_y) {\\n  /**\\n   * X-value\\n   * @type {number}\\n   */\\n  this.x = (opt_x !== undefined) ? opt_x : 0;\\n\\n  /**\\n   * Y-value\\n   * @type {number}\\n   */\\n  this.y = (opt_y !== undefined) ? opt_y : 0;\\n};\\n\\n\\n/**\\n * Returns a new copy of the coordinate.\\n * @return {!goog.math.Coordinate} A clone of this coordinate.\\n */\\ngoog.math.Coordinate.prototype.clone = function() {\\n  return new goog.math.Coordinate(this.x, this.y);\\n};\\n\\n\\nif (goog.DEBUG) {\\n  /**\\n   * Returns a nice string representing the coordinate.\\n   * @return {string} In the form (50, 73).\\n   * @override\\n   */\\n  goog.math.Coordinate.prototype.toString = function() {\\n    return '(' + this.x + ', ' + this.y + ')';\\n  };\\n}\\n\\n\\n/**\\n * Returns whether the specified value is equal to this coordinate.\\n * @param {*} other Some other value.\\n * @return {boolean} Whether the specified value is equal to this coordinate.\\n */\\ngoog.math.Coordinate.prototype.equals = function(other) {\\n  return other instanceof goog.math.Coordinate &&\\n      goog.math.Coordinate.equals(this, other);\\n};\\n\\n\\n/**\\n * Compares coordinates for equality.\\n * @param {goog.math.Coordinate} a A Coordinate.\\n * @param {goog.math.Coordinate} b A Coordinate.\\n * @return {boolean} True iff the coordinates are equal, or if both are null.\\n */\\ngoog.math.Coordinate.equals = function(a, b) {\\n  if (a == b) {\\n    return true;\\n  }\\n  if (!a || !b) {\\n    return false;\\n  }\\n  return a.x == b.x && a.y == b.y;\\n};\\n\\n\\n/**\\n * Returns the distance between two coordinates.\\n * @param {!goog.math.Coordinate} a A Coordinate.\\n * @param {!goog.math.Coordinate} b A Coordinate.\\n * @return {number} The distance between `a` and `b`.\\n */\\ngoog.math.Coordinate.distance = function(a, b) {\\n  var dx = a.x - b.x;\\n  var dy = a.y - b.y;\\n  return Math.sqrt(dx * dx + dy * dy);\\n};\\n\\n\\n/**\\n * Returns the magnitude of a coordinate.\\n * @param {!goog.math.Coordinate} a A Coordinate.\\n * @return {number} The distance between the origin and `a`.\\n */\\ngoog.math.Coordinate.magnitude = function(a) {\\n  return Math.sqrt(a.x * a.x + a.y * a.y);\\n};\\n\\n\\n/**\\n * Returns the angle from the origin to a coordinate.\\n * @param {!goog.math.Coordinate} a A Coordinate.\\n * @return {number} The angle, in degrees, clockwise from the positive X\\n *     axis to `a`.\\n */\\ngoog.math.Coordinate.azimuth = function(a) {\\n  return goog.math.angle(0, 0, a.x, a.y);\\n};\\n\\n\\n/**\\n * Returns the squared distance between two coordinates. Squared distances can\\n * be used for comparisons when the actual value is not required.\\n *\\n * Performance note: eliminating the square root is an optimization often used\\n * in lower-level languages, but the speed difference is not nearly as\\n * pronounced in JavaScript (only a few percent.)\\n *\\n * @param {!goog.math.Coordinate} a A Coordinate.\\n * @param {!goog.math.Coordinate} b A Coordinate.\\n * @return {number} The squared distance between `a` and `b`.\\n */\\ngoog.math.Coordinate.squaredDistance = function(a, b) {\\n  var dx = a.x - b.x;\\n  var dy = a.y - b.y;\\n  return dx * dx + dy * dy;\\n};\\n\\n\\n/**\\n * Returns the difference between two coordinates as a new\\n * goog.math.Coordinate.\\n * @param {!goog.math.Coordinate} a A Coordinate.\\n * @param {!goog.math.Coordinate} b A Coordinate.\\n * @return {!goog.math.Coordinate} A Coordinate representing the difference\\n *     between `a` and `b`.\\n */\\ngoog.math.Coordinate.difference = function(a, b) {\\n  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);\\n};\\n\\n\\n/**\\n * Returns the sum of two coordinates as a new goog.math.Coordinate.\\n * @param {!goog.math.Coordinate} a A Coordinate.\\n * @param {!goog.math.Coordinate} b A Coordinate.\\n * @return {!goog.math.Coordinate} A Coordinate representing the sum of the two\\n *     coordinates.\\n */\\ngoog.math.Coordinate.sum = function(a, b) {\\n  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);\\n};\\n\\n\\n/**\\n * Rounds the x and y fields to the next larger integer values.\\n * @return {!goog.math.Coordinate} This coordinate with ceil'd fields.\\n */\\ngoog.math.Coordinate.prototype.ceil = function() {\\n  this.x = Math.ceil(this.x);\\n  this.y = Math.ceil(this.y);\\n  return this;\\n};\\n\\n\\n/**\\n * Rounds the x and y fields to the next smaller integer values.\\n * @return {!goog.math.Coordinate} This coordinate with floored fields.\\n */\\ngoog.math.Coordinate.prototype.floor = function() {\\n  this.x = Math.floor(this.x);\\n  this.y = Math.floor(this.y);\\n  return this;\\n};\\n\\n\\n/**\\n * Rounds the x and y fields to the nearest integer values.\\n * @return {!goog.math.Coordinate} This coordinate with rounded fields.\\n */\\ngoog.math.Coordinate.prototype.round = function() {\\n  this.x = Math.round(this.x);\\n  this.y = Math.round(this.y);\\n  return this;\\n};\\n\\n\\n/**\\n * Translates this box by the given offsets. If a `goog.math.Coordinate`\\n * is given, then the x and y values are translated by the coordinate's x and y.\\n * Otherwise, x and y are translated by `tx` and `opt_ty`\\n * respectively.\\n * @param {number|goog.math.Coordinate} tx The value to translate x by or the\\n *     the coordinate to translate this coordinate by.\\n * @param {number=} opt_ty The value to translate y by.\\n * @return {!goog.math.Coordinate} This coordinate after translating.\\n */\\ngoog.math.Coordinate.prototype.translate = function(tx, opt_ty) {\\n  if (tx instanceof goog.math.Coordinate) {\\n    this.x += tx.x;\\n    this.y += tx.y;\\n  } else {\\n    this.x += Number(tx);\\n    if (typeof opt_ty === 'number') {\\n      this.y += opt_ty;\\n    }\\n  }\\n  return this;\\n};\\n\\n\\n/**\\n * Scales this coordinate by the given scale factors. The x and y values are\\n * scaled by `sx` and `opt_sy` respectively.  If `opt_sy`\\n * is not given, then `sx` is used for both x and y.\\n * @param {number} sx The scale factor to use for the x dimension.\\n * @param {number=} opt_sy The scale factor to use for the y dimension.\\n * @return {!goog.math.Coordinate} This coordinate after scaling.\\n */\\ngoog.math.Coordinate.prototype.scale = function(sx, opt_sy) {\\n  var sy = (typeof opt_sy === 'number') ? opt_sy : sx;\\n  this.x *= sx;\\n  this.y *= sy;\\n  return this;\\n};\\n\\n\\n/**\\n * Rotates this coordinate clockwise about the origin (or, optionally, the given\\n * center) by the given angle, in radians.\\n * @param {number} radians The angle by which to rotate this coordinate\\n *     clockwise about the given center, in radians.\\n * @param {!goog.math.Coordinate=} opt_center The center of rotation. Defaults\\n *     to (0, 0) if not given.\\n */\\ngoog.math.Coordinate.prototype.rotateRadians = function(radians, opt_center) {\\n  var center = opt_center || new goog.math.Coordinate(0, 0);\\n\\n  var x = this.x;\\n  var y = this.y;\\n  var cos = Math.cos(radians);\\n  var sin = Math.sin(radians);\\n\\n  this.x = (x - center.x) * cos - (y - center.y) * sin + center.x;\\n  this.y = (x - center.x) * sin + (y - center.y) * cos + center.y;\\n};\\n\\n\\n/**\\n * Rotates this coordinate clockwise about the origin (or, optionally, the given\\n * center) by the given angle, in degrees.\\n * @param {number} degrees The angle by which to rotate this coordinate\\n *     clockwise about the given center, in degrees.\\n * @param {!goog.math.Coordinate=} opt_center The center of rotation. Defaults\\n *     to (0, 0) if not given.\\n */\\ngoog.math.Coordinate.prototype.rotateDegrees = function(degrees, opt_center) {\\n  this.rotateRadians(goog.math.toRadians(degrees), opt_center);\\n};\\n\"],\n\"names\":[\"goog\",\"provide\",\"require\",\"math\",\"Coordinate\",\"goog.math.Coordinate\",\"opt_x\",\"opt_y\",\"x\",\"undefined\",\"y\",\"prototype\",\"clone\",\"goog.math.Coordinate.prototype.clone\",\"DEBUG\",\"toString\",\"goog.math.Coordinate.prototype.toString\",\"equals\",\"goog.math.Coordinate.prototype.equals\",\"other\",\"goog.math.Coordinate.equals\",\"a\",\"b\",\"distance\",\"goog.math.Coordinate.distance\",\"dx\",\"dy\",\"Math\",\"sqrt\",\"magnitude\",\"goog.math.Coordinate.magnitude\",\"azimuth\",\"goog.math.Coordinate.azimuth\",\"angle\",\"squaredDistance\",\"goog.math.Coordinate.squaredDistance\",\"difference\",\"goog.math.Coordinate.difference\",\"sum\",\"goog.math.Coordinate.sum\",\"ceil\",\"goog.math.Coordinate.prototype.ceil\",\"floor\",\"goog.math.Coordinate.prototype.floor\",\"round\",\"goog.math.Coordinate.prototype.round\",\"translate\",\"goog.math.Coordinate.prototype.translate\",\"tx\",\"opt_ty\",\"Number\",\"scale\",\"goog.math.Coordinate.prototype.scale\",\"sx\",\"opt_sy\",\"sy\",\"rotateRadians\",\"goog.math.Coordinate.prototype.rotateRadians\",\"radians\",\"opt_center\",\"center\",\"cos\",\"sin\",\"rotateDegrees\",\"goog.math.Coordinate.prototype.rotateDegrees\",\"degrees\",\"toRadians\"]\n}\n"]