(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var input_1 = require('./input');
var event_bus_1 = require('../event/event-bus');
var player_movement_1 = require('../domain/player-movement');
var player_movement_event_1 = require('../event/player-movement-event');
// TODO: Here determine if player is holding down one of the arrow keys; if so, fire rapid events after (TBD) amount of time.
var Controller = (function () {
    function Controller() {
    }
    Controller.prototype.start = function () {
        input_1.input.start();
    };
    Controller.prototype.step = function (elapsed) {
        if (input_1.input.isDownAndUnhandled(1 /* Up */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.RotateClockwise));
        }
        if (input_1.input.isDownAndUnhandled(0 /* Left */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Left));
        }
        if (input_1.input.isDownAndUnhandled(3 /* Right */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Right));
        }
        if (input_1.input.isDownAndUnhandled(2 /* Down */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Down));
        }
        if (input_1.input.isDownAndUnhandled(4 /* Space */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Drop));
        }
    };
    return Controller;
}());
exports.controller = new Controller();
},{"../domain/player-movement":4,"../event/event-bus":8,"../event/player-movement-event":11,"./input":2}],2:[function(require,module,exports){
/// <reference path='../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var Input = (function () {
    function Input() {
        this.keyState = new Map();
    }
    Input.prototype.start = function () {
        var _this = this;
        window.addEventListener('keydown', function (event) {
            _this.eventToState(event, 0 /* Down */);
        });
        window.addEventListener('keyup', function (event) {
            _this.eventToState(event, 1 /* Up */);
        });
    };
    /**
     * Return if given key is 'Down'.
     */
    Input.prototype.isDown = function (key) {
        return this.keyState.get(key) === 0 /* Down */;
    };
    /**
     * Return if given key is 'down'. Also sets the key from 'Down' to 'Handling'.
     */
    Input.prototype.isDownAndUnhandled = function (key) {
        if (this.isDown(key)) {
            this.keyState.set(key, 2 /* Handling */);
            return true;
        }
        else {
            return false; // TODO: This wasn't set in mazing; need to see why.
        }
    };
    /**
     * Returns if any key is 'down'. Also set all 'Down' keys to 'Handling'.
     */
    Input.prototype.isAnyKeyDownAndUnhandled = function () {
        var _this = this;
        var anyKeyDown = false;
        this.keyState.forEach(function (state, key) {
            if (state === 0 /* Down */) {
                _this.keyState.set(key, 2 /* Handling */);
                anyKeyDown = true;
            }
        });
        return anyKeyDown;
    };
    Input.prototype.eventToState = function (event, state) {
        switch (event.keyCode) {
            // Directionals --------------------------------------------------
            case 65: // 'a'
            case 37:
                this.setState(0 /* Left */, state);
                event.preventDefault();
                break;
            case 87: // 'w'
            case 38:
                this.setState(1 /* Up */, state);
                // event.preventDefault() - commented for if the user wants to cmd+w or ctrl+w
                break;
            case 68: // 'd'
            case 39:
                this.setState(3 /* Right */, state);
                event.preventDefault();
                break;
            case 83: // 's'
            case 40:
                this.setState(2 /* Down */, state);
                event.preventDefault();
                break;
            case 32:
                this.setState(4 /* Space */, state);
                event.preventDefault();
                break;
            // Pause ---------------------------------------------------------
            case 80: // 'p'
            case 27: // esc
            case 13:
                this.setState(5 /* Pause */, state);
                event.preventDefault();
                break;
            // TODO: Maybe add a debug key here ('f')
            // Ignore certain keys -------------------------------------------
            case 82: // 'r'
            case 18: // alt
            case 224: // apple command (firefox)
            case 17: // apple command (opera)
            case 91: // apple command, left (safari/chrome)
            case 93: // apple command, right (safari/chrome)
            case 84: // 't' (i.e., open a new tab)
            case 78: // 'n' (i.e., open a new window)
            case 219: // left brackets
            case 221:
                break;
            // Prevent some unwanted behaviors -------------------------------
            case 191: // forward slash (page find)
            case 9: // tab (can lose focus)
            case 16:
                event.preventDefault();
                break;
            // All other keys ------------------------------------------------
            default:
                this.setState(6 /* Other */, state);
                break;
        }
    };
    Input.prototype.setState = function (key, state) {
        // Always set 'up'
        if (state === 1 /* Up */) {
            this.keyState.set(key, state);
        }
        else if (state === 0 /* Down */) {
            if (this.keyState.get(key) !== 2 /* Handling */) {
                this.keyState.set(key, state);
            }
        }
    };
    return Input;
}());
exports.input = new Input();
},{}],3:[function(require,module,exports){
"use strict";
var Cell = (function () {
    function Cell() {
        this.color = 0 /* Empty */;
    }
    Cell.prototype.setColor = function (color) {
        this.color = color;
    };
    Cell.prototype.getColor = function () {
        return this.color;
    };
    return Cell;
}());
exports.Cell = Cell;
/**
 * Offset calculated from top-left corner being 0, 0.
 */
var CellOffset = (function () {
    function CellOffset(x, y) {
        this.x = x;
        this.y = y;
    }
    return CellOffset;
}());
exports.CellOffset = CellOffset;
},{}],4:[function(require,module,exports){
"use strict";
(function (PlayerMovement) {
    PlayerMovement[PlayerMovement["None"] = 0] = "None";
    PlayerMovement[PlayerMovement["Left"] = 1] = "Left";
    PlayerMovement[PlayerMovement["Right"] = 2] = "Right";
    PlayerMovement[PlayerMovement["Down"] = 3] = "Down";
    PlayerMovement[PlayerMovement["Drop"] = 4] = "Drop";
    PlayerMovement[PlayerMovement["RotateClockwise"] = 5] = "RotateClockwise";
    PlayerMovement[PlayerMovement["RotateCounterClockwise"] = 6] = "RotateCounterClockwise";
})(exports.PlayerMovement || (exports.PlayerMovement = {}));
var PlayerMovement = exports.PlayerMovement;
},{}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var ActiveShapeChangedEvent = (function (_super) {
    __extends(ActiveShapeChangedEvent, _super);
    function ActiveShapeChangedEvent(shape) {
        _super.call(this);
        this.shape = shape;
    }
    ActiveShapeChangedEvent.prototype.getType = function () {
        return event_bus_1.EventType.ActiveShapeChangedEventType;
    };
    return ActiveShapeChangedEvent;
}(event_bus_1.AbstractEvent));
exports.ActiveShapeChangedEvent = ActiveShapeChangedEvent;
},{"./event-bus":8}],6:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var ActiveShapeEndedEvent = (function (_super) {
    __extends(ActiveShapeEndedEvent, _super);
    function ActiveShapeEndedEvent(shape) {
        _super.call(this);
        this.shape = shape;
    }
    ActiveShapeEndedEvent.prototype.getType = function () {
        return event_bus_1.EventType.ActiveShapeChangedEventType;
    };
    return ActiveShapeEndedEvent;
}(event_bus_1.AbstractEvent));
exports.ActiveShapeEndedEvent = ActiveShapeEndedEvent;
},{"./event-bus":8}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var CellChangeEvent = (function (_super) {
    __extends(CellChangeEvent, _super);
    function CellChangeEvent(cell, row, col) {
        _super.call(this);
        this.cell = cell;
        this.row = row;
        this.col = col;
    }
    CellChangeEvent.prototype.getType = function () {
        return event_bus_1.EventType.CellChangeEventType;
    };
    return CellChangeEvent;
}(event_bus_1.AbstractEvent));
exports.CellChangeEvent = CellChangeEvent;
},{"./event-bus":8}],8:[function(require,module,exports){
"use strict";
(function (EventType) {
    EventType[EventType["ActiveShapeChangedEventType"] = 0] = "ActiveShapeChangedEventType";
    EventType[EventType["ActiveShapeEndedEventType"] = 1] = "ActiveShapeEndedEventType";
    EventType[EventType["CellChangeEventType"] = 2] = "CellChangeEventType";
    EventType[EventType["NpcMovementChangedEventType"] = 3] = "NpcMovementChangedEventType";
    EventType[EventType["NpcPlacedEventType"] = 4] = "NpcPlacedEventType";
    EventType[EventType["NpcStateChagedEventType"] = 5] = "NpcStateChagedEventType";
    EventType[EventType["PlayerMovementEventType"] = 6] = "PlayerMovementEventType";
    EventType[EventType["StandeeMovementEndedEventType"] = 7] = "StandeeMovementEndedEventType";
})(exports.EventType || (exports.EventType = {}));
var EventType = exports.EventType;
var AbstractEvent = (function () {
    function AbstractEvent() {
    }
    return AbstractEvent;
}());
exports.AbstractEvent = AbstractEvent;
var EventBus = (function () {
    function EventBus() {
        this.handlersByType = new Map();
    }
    EventBus.prototype.register = function (type, handler) {
        if (!type) {
        }
        if (!handler) {
        }
        var handlers = this.handlersByType.get(type);
        if (handlers === undefined) {
            handlers = [];
            this.handlersByType.set(type, handlers);
        }
        handlers.push(handler);
        // TODO: Return a function that can be called to unregister the handler
    };
    // TODO: unregister(). And remove the map key if zero handlers left for it.
    // TODO: Prevent infinite fire()?
    EventBus.prototype.fire = function (event) {
        var handlers = this.handlersByType.get(event.getType());
        if (handlers !== undefined) {
            for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                var handler = handlers_1[_i];
                handler(event);
            }
        }
    };
    return EventBus;
}());
exports.eventBus = new EventBus();
},{}],9:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var NpcMovementChangedEvent = (function (_super) {
    __extends(NpcMovementChangedEvent, _super);
    function NpcMovementChangedEvent(npcId, x, y) {
        _super.call(this);
        this.npcId = npcId;
        this.x = x;
        this.y = y;
    }
    NpcMovementChangedEvent.prototype.getType = function () {
        return event_bus_1.EventType.NpcMovementChangedEventType;
    };
    return NpcMovementChangedEvent;
}(event_bus_1.AbstractEvent));
exports.NpcMovementChangedEvent = NpcMovementChangedEvent;
},{"./event-bus":8}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var NpcPlacedEvent = (function (_super) {
    __extends(NpcPlacedEvent, _super);
    function NpcPlacedEvent(npcId, state, x, y) {
        _super.call(this);
        this.npcId = npcId;
        this.state = state;
        this.x = x;
        this.y = y;
    }
    NpcPlacedEvent.prototype.getType = function () {
        return event_bus_1.EventType.NpcPlacedEventType;
    };
    return NpcPlacedEvent;
}(event_bus_1.AbstractEvent));
exports.NpcPlacedEvent = NpcPlacedEvent;
},{"./event-bus":8}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var PlayerMovementEvent = (function (_super) {
    __extends(PlayerMovementEvent, _super);
    function PlayerMovementEvent(movement) {
        _super.call(this);
        this.movement = movement;
    }
    PlayerMovementEvent.prototype.getType = function () {
        return event_bus_1.EventType.PlayerMovementEventType;
    };
    return PlayerMovementEvent;
}(event_bus_1.AbstractEvent));
exports.PlayerMovementEvent = PlayerMovementEvent;
},{"./event-bus":8}],12:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var StandeeMovementEndedEvent = (function (_super) {
    __extends(StandeeMovementEndedEvent, _super);
    function StandeeMovementEndedEvent(npcId, x, z) {
        _super.call(this);
        this.npcId = npcId;
        this.x = x;
        this.z = z;
    }
    StandeeMovementEndedEvent.prototype.getType = function () {
        return event_bus_1.EventType.StandeeMovementEndedEventType;
    };
    return StandeeMovementEndedEvent;
}(event_bus_1.AbstractEvent));
exports.StandeeMovementEndedEvent = StandeeMovementEndedEvent;
},{"./event-bus":8}],13:[function(require,module,exports){
"use strict";
var GameState = (function () {
    function GameState() {
        this.current = 0 /* Initializing */; // Default state.
    }
    GameState.prototype.getCurrent = function () {
        return this.current;
    };
    GameState.prototype.setCurrent = function (current) {
        this.current = current;
    };
    return GameState;
}());
exports.gameState = new GameState();
},{}],14:[function(require,module,exports){
"use strict";
var preloader_1 = require('./preloader');
var model_1 = require('./model/model');
var view_1 = require('./view/view');
var controller_1 = require('./controller/controller');
var game_state_1 = require('./game-state');
document.addEventListener('DOMContentLoaded', function (event) {
    game_state_1.gameState.setCurrent(0 /* Initializing */);
    preloader_1.preloader.preload(main);
});
function main() {
    // Startup in reverse MVC order to ensure that event bus handlers in the
    // controller and view receive (any) start events from model.start().
    controller_1.controller.start();
    view_1.view.start();
    model_1.model.start();
    game_state_1.gameState.setCurrent(2 /* Started */);
    var step = function () {
        requestAnimationFrame(step);
        var elapsed = calculateElapsed();
        controller_1.controller.step(elapsed);
        view_1.view.step(elapsed);
        model_1.model.step(elapsed);
    };
    step();
}
var lastStep = Date.now();
function calculateElapsed() {
    var now = Date.now();
    var elapsed = now - lastStep;
    if (elapsed > 100) {
        elapsed = 100; // enforce speed limit
    }
    lastStep = now;
    return elapsed;
}
},{"./controller/controller":1,"./game-state":13,"./model/model":18,"./preloader":21,"./view/view":28}],15:[function(require,module,exports){
"use strict";
var cell_1 = require('../../domain/cell');
var shape_factory_1 = require('./shape-factory');
var event_bus_1 = require('../../event/event-bus');
var cell_change_event_1 = require('../../event/cell-change-event');
var active_shape_changed_event_1 = require('../../event/active-shape-changed-event');
var active_shape_ended_event_1 = require('../../event/active-shape-ended-event');
var MAX_ROWS = 19; // Top 2 rows are obstructed from view. Also, see lighting-grid.ts.
var MAX_COLS = 10;
var TEMP_DELAY_MS = 500;
var Board = (function () {
    function Board() {
        this.currentShape = null;
        this.matrix = [];
        for (var rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
            this.matrix[rowIdx] = [];
            for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                this.matrix[rowIdx][colIdx] = new cell_1.Cell();
            }
        }
        this.msTillGravityTick = TEMP_DELAY_MS;
    }
    Board.prototype.start = function () {
        this.clear();
    };
    Board.prototype.step = function (elapsed) {
        this.msTillGravityTick -= elapsed;
        if (this.msTillGravityTick <= 0) {
            this.msTillGravityTick = TEMP_DELAY_MS;
            this.stepNow();
        }
    };
    /**
     * This gives high level view of the main game loop.
     */
    Board.prototype.stepNow = function () {
        if (this.tryGravity()) {
            this.moveShapeDown();
        }
        else {
            this.fireActiveShapeEndedEvent();
            this.convertShapeToCells();
            if (this.checkForGameOver()) {
            }
            else {
                this.handleAnyFilledLines();
                if (this.checkForGameWin()) {
                }
                else {
                    this.startShape();
                }
            }
        }
    };
    Board.prototype.beginNewGame = function () {
        this.clear();
        this.setRandomWhiteLights();
        this.startShape();
    };
    Board.prototype.moveShapeLeft = function () {
        this.currentShape.moveLeft();
        if (this.collisionDetected()) {
            this.currentShape.moveRight();
        }
        else {
            this.fireActiveShapeChangedEvent();
        }
    };
    Board.prototype.moveShapeRight = function () {
        this.currentShape.moveRight();
        if (this.collisionDetected()) {
            this.currentShape.moveLeft();
        }
        else {
            this.fireActiveShapeChangedEvent();
        }
    };
    Board.prototype.moveShapeDown = function () {
        this.currentShape.moveDown();
        if (this.collisionDetected()) {
            this.currentShape.moveUp();
        }
        else {
            this.fireActiveShapeChangedEvent();
        }
    };
    Board.prototype.moveShapeDownAllTheWay = function () {
        do {
            this.currentShape.moveDown();
        } while (!this.collisionDetected());
        this.currentShape.moveUp();
        this.fireActiveShapeChangedEvent();
    };
    Board.prototype.rotateShapeClockwise = function () {
        this.currentShape.rotateClockwise();
        if (this.collisionDetected()) {
            this.currentShape.rotateCounterClockwise();
        }
        else {
            this.fireActiveShapeChangedEvent();
        }
    };
    Board.prototype.clear = function () {
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                this.changeCellColor(rowIdx, colIdx, 0 /* Empty */);
            }
        }
    };
    Board.prototype.setRandomWhiteLights = function () {
        // // http://stackoverflow.com/a/7228322
        // function randomIntFromInterval(min: number, max: number) {
        //     return Math.floor(Math.random()*(max - min + 1) + min);
        // }
    };
    /**
     * Helper method to change a single cell color's and notify subscribers at the same time.
     */
    Board.prototype.changeCellColor = function (rowIdx, colIdx, color) {
        // TODO: Maybe bounds check here.
        var cell = this.matrix[rowIdx][colIdx];
        cell.setColor(color);
        event_bus_1.eventBus.fire(new cell_change_event_1.CellChangeEvent(cell, rowIdx, colIdx));
    };
    Board.prototype.startShape = function () {
        this.currentShape = shape_factory_1.shapeFactory.nextShape();
        this.fireActiveShapeChangedEvent();
    };
    Board.prototype.tryGravity = function () {
        var canMoveDown = true;
        this.currentShape.moveDown();
        if (this.collisionDetected()) {
            canMoveDown = false;
        }
        this.currentShape.moveUp();
        return canMoveDown;
    };
    /**
     * Intended for checking of the current position of the current
     * shape has any overlap with existing cells that have color.
     */
    Board.prototype.collisionDetected = function () {
        var collision = false;
        for (var _i = 0, _a = this.currentShape.getOffsets(); _i < _a.length; _i++) {
            var offset = _a[_i];
            var row = offset.y + this.currentShape.getRow();
            var col = offset.x + this.currentShape.getCol();
            if (row < 0 || row >= this.matrix.length) {
                collision = true;
                break;
            }
            if (col < 0 || col >= this.matrix[row].length) {
                collision = true;
                break;
            }
            if (this.matrix[row][col].getColor() !== 0 /* Empty */) {
                collision = true;
                break;
            }
        }
        return collision;
    };
    Board.prototype.convertShapeToCells = function () {
        for (var _i = 0, _a = this.currentShape.getOffsets(); _i < _a.length; _i++) {
            var offset = _a[_i];
            var rowIdx = offset.y + this.currentShape.getRow();
            var colIdx = offset.x + this.currentShape.getCol();
            if (rowIdx < 0 || rowIdx >= this.matrix.length) {
                continue;
            }
            if (colIdx < 0 || colIdx >= this.matrix[rowIdx].length) {
                continue;
            }
            this.changeCellColor(rowIdx, colIdx, this.currentShape.color);
        }
    };
    Board.prototype.checkForGameOver = function () {
        return false; // TODO: Do it
    };
    Board.prototype.handleAnyFilledLines = function () {
        var highestLineFilled = 0; // "highest" as in the highest in the array, which is the lowest visually to the player.
        // Traverse backwards to prevent row index from becoming out of sync when removing rows.
        for (var rowIdx = this.matrix.length - 1; rowIdx >= 0; rowIdx--) {
            var row = this.matrix[rowIdx];
            var filled = true;
            for (var _i = 0, row_1 = row; _i < row_1.length; _i++) {
                var cell = row_1[_i];
                if (cell.getColor() === 0 /* Empty */) {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                if (rowIdx > highestLineFilled) {
                    highestLineFilled = rowIdx;
                }
                this.removeAndCollapse(rowIdx);
                rowIdx = rowIdx + 1; // This is a really, really shaky workaround. It prevents the next row from getting skipped over on next loop.
            }
        }
        // Notify for all cells from 0 to the highestLineFilled, which could be 0 if no rows were filled.
        for (var rowIdx = 0; rowIdx <= highestLineFilled; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                event_bus_1.eventBus.fire(new cell_change_event_1.CellChangeEvent(cell, rowIdx, colIdx));
            }
        }
    };
    /**
     * This removes the old row and puts a new row in its place at position 0, which is the highest visually to the player.
     * Delegates cell notification to the calling method.
     */
    Board.prototype.removeAndCollapse = function (rowIdx) {
        this.matrix.splice(rowIdx, 1);
        this.matrix.splice(0, 0, []);
        for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            this.matrix[0][colIdx] = new cell_1.Cell();
        }
    };
    Board.prototype.checkForGameWin = function () {
        return false; // TODO: Do it
    };
    Board.prototype.fireActiveShapeChangedEvent = function () {
        event_bus_1.eventBus.fire(new active_shape_changed_event_1.ActiveShapeChangedEvent(this.currentShape));
    };
    Board.prototype.fireActiveShapeEndedEvent = function () {
        event_bus_1.eventBus.fire(new active_shape_ended_event_1.ActiveShapeEndedEvent(this.currentShape));
    };
    return Board;
}());
exports.Board = Board;
exports.board = new Board();
},{"../../domain/cell":3,"../../event/active-shape-changed-event":5,"../../event/active-shape-ended-event":6,"../../event/cell-change-event":7,"../../event/event-bus":8,"./shape-factory":16}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var shape_1 = require('./shape');
var ShapeI = (function (_super) {
    __extends(ShapeI, _super);
    function ShapeI() {
        _super.apply(this, arguments);
        this.spawnColumn = 3;
        this.color = 1 /* Cyan */;
        this.valuesPerRow = 4;
        this.matrices = [
            [
                0, 0, 0, 0,
                1, 1, 1, 1,
                0, 0, 0, 0,
                0, 0, 0, 0
            ],
            [
                0, 0, 1, 0,
                0, 0, 1, 0,
                0, 0, 1, 0,
                0, 0, 1, 0
            ],
            [
                0, 0, 0, 0,
                0, 0, 0, 0,
                1, 1, 1, 1,
                0, 0, 0, 0
            ],
            [
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0
            ]
        ];
    }
    return ShapeI;
}(shape_1.Shape));
var ShapeJ = (function (_super) {
    __extends(ShapeJ, _super);
    function ShapeJ() {
        _super.apply(this, arguments);
        this.color = 6 /* Blue */;
        this.valuesPerRow = 3;
        this.matrices = [
            [
                1, 0, 0,
                1, 1, 1,
                0, 0, 0
            ],
            [
                0, 1, 1,
                0, 1, 0,
                0, 1, 0
            ],
            [
                0, 0, 0,
                1, 1, 1,
                0, 0, 1
            ],
            [
                0, 1, 0,
                0, 1, 0,
                1, 1, 0
            ]
        ];
    }
    return ShapeJ;
}(shape_1.Shape));
var ShapeL = (function (_super) {
    __extends(ShapeL, _super);
    function ShapeL() {
        _super.apply(this, arguments);
        this.color = 7 /* Orange */;
        this.valuesPerRow = 3;
        this.matrices = [
            [
                0, 0, 1,
                1, 1, 1,
                0, 0, 0
            ],
            [
                0, 1, 0,
                0, 1, 0,
                0, 1, 1
            ],
            [
                0, 0, 0,
                1, 1, 1,
                1, 0, 0
            ],
            [
                1, 1, 0,
                0, 1, 0,
                0, 1, 0
            ]
        ];
    }
    return ShapeL;
}(shape_1.Shape));
var ShapeO = (function (_super) {
    __extends(ShapeO, _super);
    function ShapeO() {
        _super.apply(this, arguments);
        this.color = 2 /* Yellow */;
        this.valuesPerRow = 4;
        this.matrices = [
            [
                0, 1, 1, 0,
                0, 1, 1, 0,
                0, 0, 0, 0
            ]
        ];
    }
    return ShapeO;
}(shape_1.Shape));
var ShapeS = (function (_super) {
    __extends(ShapeS, _super);
    function ShapeS() {
        _super.apply(this, arguments);
        this.color = 4 /* Green */;
        this.valuesPerRow = 3;
        this.matrices = [
            [
                0, 1, 1,
                1, 1, 0,
                0, 0, 0
            ],
            [
                0, 1, 0,
                0, 1, 1,
                0, 0, 1
            ],
            [
                0, 0, 0,
                0, 1, 1,
                1, 1, 0
            ],
            [
                1, 0, 0,
                1, 1, 0,
                0, 1, 0
            ]
        ];
    }
    return ShapeS;
}(shape_1.Shape));
var ShapeT = (function (_super) {
    __extends(ShapeT, _super);
    function ShapeT() {
        _super.apply(this, arguments);
        this.color = 3 /* Purple */;
        this.valuesPerRow = 3;
        this.matrices = [
            [
                0, 1, 0,
                1, 1, 1,
                0, 0, 0
            ],
            [
                0, 1, 0,
                0, 1, 1,
                0, 1, 0
            ],
            [
                0, 0, 0,
                1, 1, 1,
                0, 1, 0
            ],
            [
                0, 1, 0,
                1, 1, 0,
                0, 1, 0
            ]
        ];
    }
    return ShapeT;
}(shape_1.Shape));
var ShapeZ = (function (_super) {
    __extends(ShapeZ, _super);
    function ShapeZ() {
        _super.apply(this, arguments);
        this.color = 5 /* Red */;
        this.valuesPerRow = 3;
        this.matrices = [
            [
                1, 1, 0,
                0, 1, 1,
                0, 0, 0
            ],
            [
                0, 0, 1,
                0, 1, 1,
                0, 1, 0
            ],
            [
                0, 0, 0,
                1, 1, 0,
                0, 1, 1
            ],
            [
                0, 1, 0,
                1, 1, 0,
                1, 0, 0
            ]
        ];
    }
    return ShapeZ;
}(shape_1.Shape));
var ShapeFactory = (function () {
    function ShapeFactory() {
        this.refillBag();
    }
    ShapeFactory.prototype.nextShape = function () {
        if (this.bag.length <= 0) {
            this.refillBag();
        }
        return this.bag.pop();
    };
    ShapeFactory.prototype.refillBag = function () {
        this.bag = [
            new ShapeI(),
            new ShapeJ(),
            new ShapeL(),
            new ShapeO(),
            new ShapeS(),
            new ShapeT(),
            new ShapeZ()
        ];
        // Fisher-Yates Shuffle, based on: http://stackoverflow.com/a/2450976
        var idx = this.bag.length;
        // While there remain elements to shuffle...
        while (0 !== idx) {
            // Pick a remaining element...
            var rndIdx = Math.floor(Math.random() * idx);
            idx -= 1;
            // And swap it with the current element.
            var tempVal = this.bag[idx];
            this.bag[idx] = this.bag[rndIdx];
            this.bag[rndIdx] = tempVal;
        }
    };
    return ShapeFactory;
}());
exports.shapeFactory = new ShapeFactory();
},{"./shape":17}],17:[function(require,module,exports){
"use strict";
var cell_1 = require('../../domain/cell');
var SPAWN_COL = 3; // Left side of matrix should correspond to this.
var Shape = (function () {
    function Shape() {
        this.currentMatrixIndex = 0; // TODO: Ensure position 0 is the spawn position
        this.row = 0;
        this.col = SPAWN_COL;
    }
    Shape.prototype.moveLeft = function () {
        this.col--;
    };
    Shape.prototype.moveRight = function () {
        this.col++;
    };
    Shape.prototype.moveUp = function () {
        this.row--;
    };
    Shape.prototype.moveDown = function () {
        this.row++;
    };
    Shape.prototype.rotateCounterClockwise = function () {
        this.currentMatrixIndex -= 1;
        this.ensureArrayBounds();
    };
    Shape.prototype.rotateClockwise = function () {
        this.currentMatrixIndex += 1;
        this.ensureArrayBounds();
    };
    Shape.prototype.getRow = function () {
        return this.row;
    };
    Shape.prototype.getCol = function () {
        return this.col;
    };
    Shape.prototype.getRowCount = function () {
        return Math.ceil(this.getCurrentMatrix().length / this.valuesPerRow);
    };
    Shape.prototype.getOffsets = function () {
        var matrix = this.getCurrentMatrix();
        var offsets = [];
        for (var idx = 0; idx < matrix.length; idx++) {
            var value = matrix[idx];
            if (value === 1) {
                var x = idx % this.valuesPerRow;
                var y = Math.floor(idx / this.valuesPerRow);
                var offset = new cell_1.CellOffset(x, y);
                offsets.push(offset);
            }
        }
        return offsets;
    };
    Shape.prototype.getCurrentMatrix = function () {
        return this.matrices[this.currentMatrixIndex];
    };
    Shape.prototype.ensureArrayBounds = function () {
        if (this.currentMatrixIndex < 0) {
            this.currentMatrixIndex = this.matrices.length - 1;
        }
        else if (this.currentMatrixIndex >= this.matrices.length) {
            this.currentMatrixIndex = 0;
        }
    };
    return Shape;
}());
exports.Shape = Shape;
},{"../../domain/cell":3}],18:[function(require,module,exports){
"use strict";
var board_1 = require('./board/board');
var npc_manager_1 = require('./npc/npc-manager');
var event_bus_1 = require('../event/event-bus');
var player_movement_1 = require('../domain/player-movement');
var Model = (function () {
    function Model() {
    }
    Model.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.PlayerMovementEventType, function (event) {
            _this.handlePlayerMovement(event.movement);
        });
        board_1.board.start();
        npc_manager_1.npcManager.start();
        board_1.board.beginNewGame(); // TODO: Instead, start game when player hits a key first.
    };
    Model.prototype.step = function (elapsed) {
        board_1.board.step(elapsed);
        npc_manager_1.npcManager.step(elapsed);
    };
    Model.prototype.handlePlayerMovement = function (movement) {
        switch (movement) {
            case player_movement_1.PlayerMovement.Left:
                board_1.board.moveShapeLeft();
                break;
            case player_movement_1.PlayerMovement.Right:
                board_1.board.moveShapeRight();
                break;
            case player_movement_1.PlayerMovement.Down:
                board_1.board.moveShapeDown();
                break;
            case player_movement_1.PlayerMovement.Drop:
                board_1.board.moveShapeDownAllTheWay();
                board_1.board.stepNow(); // prevent any other keystrokes till next tick
                break;
            case player_movement_1.PlayerMovement.RotateClockwise:
                board_1.board.rotateShapeClockwise();
                break;
            default:
                console.log('unhandled movement');
                break;
        }
    };
    return Model;
}());
exports.model = new Model();
},{"../domain/player-movement":4,"../event/event-bus":8,"./board/board":15,"./npc/npc-manager":19}],19:[function(require,module,exports){
/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var npc_1 = require('./npc');
var event_bus_1 = require('../../event/event-bus');
// Starting position counts used in initialization.
var TOTAL_NPCS = 20;
var NpcManager = (function () {
    function NpcManager() {
        this.npcs = new Map();
        for (var npcIdx = 0; npcIdx < TOTAL_NPCS; npcIdx++) {
            var npc = new npc_1.Npc();
            this.npcs.set(npc.id, npc);
        }
    }
    NpcManager.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.StandeeMovementEndedEventType, function (event) {
            _this.handleStandeeMovementEndedEvent(event);
        });
        this.npcs.forEach(function (npc) {
            {
                var x = (Math.random() * 20) - 5;
                var y = (Math.random() * 20) + 5;
                npc.start(x, y);
            }
            // TODO: Move this elsewhere:
            {
                var x = (Math.random() * 20) - 5;
                var y = (Math.random() * 20) + 5;
                npc.beginWalkingTo(x, y);
            }
        });
    };
    NpcManager.prototype.step = function (elapsed) {
        this.npcs.forEach(function (npc) {
            npc.step(elapsed);
        });
    };
    NpcManager.prototype.handleStandeeMovementEndedEvent = function (event) {
        var npc = this.npcs.get(event.npcId);
        if (npc != null) {
            var x = event.x;
            var y = event.z;
            npc.updatePosition(x, y);
        }
    };
    return NpcManager;
}());
exports.npcManager = new NpcManager();
},{"../../event/event-bus":8,"./npc":20}],20:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var npc_placed_event_1 = require('../../event/npc-placed-event');
var npc_movement_changed_event_1 = require('../../event/npc-movement-changed-event');
var Npc = (function () {
    function Npc() {
        this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.state = 1 /* Idle */;
        this.timeInState = 0;
        this.xlast = 0;
        this.ylast = 0;
    }
    Npc.prototype.start = function (x, y) {
        this.xlast = x;
        this.ylast = y;
        event_bus_1.eventBus.fire(new npc_placed_event_1.NpcPlacedEvent(this.id, this.state, x, y));
    };
    /**
     * This should be called by the NPC manager rather than tracks that reference them.
     */
    Npc.prototype.step = function (elapsed) {
        this.timeInState += elapsed;
    };
    Npc.prototype.transitionTo = function (state) {
        this.state = state;
        this.timeInState = 0;
    };
    Npc.prototype.beginWalkingTo = function (x, y) {
        event_bus_1.eventBus.fire(new npc_movement_changed_event_1.NpcMovementChangedEvent(this.id, x, y));
    };
    /**
     * Signifies the end of a walk.
     */
    Npc.prototype.updatePosition = function (x, y) {
        this.xlast = x;
        this.ylast = y;
        this.transitionTo(1 /* Idle */);
    };
    Npc.prototype.getState = function () {
        return this.state;
    };
    return Npc;
}());
exports.Npc = Npc;
},{"../../event/event-bus":8,"../../event/npc-movement-changed-event":9,"../../event/npc-placed-event":10}],21:[function(require,module,exports){
"use strict";
var standee_animation_texture_base_1 = require('./view/standee/standee-animation-texture-base');
var Preloader = (function () {
    function Preloader() {
    }
    Preloader.prototype.preload = function (callback) {
        standee_animation_texture_base_1.standeeAnimationTextureBase.preload(callback);
        // TODO: Going to have a parallelism mechanism after adding more to this.
    };
    return Preloader;
}());
exports.preloader = new Preloader();
},{"./view/standee/standee-animation-texture-base":24}],22:[function(require,module,exports){
"use strict";
// TODO: Only the 3rd floor from the top and below are visible. Also, see board.ts.
exports.FLOOR_COUNT = 17;
exports.PANEL_COUNT_PER_FLOOR = 10;
var POINT_LIGHT_COUNT = 4;
var EmissiveIntensity = (function () {
    function EmissiveIntensity() {
    }
    return EmissiveIntensity;
}());
var LightingGrid = (function () {
    function LightingGrid() {
        this.group = new THREE.Object3D();
        this.panels = [];
        for (var floorIdx = 0; floorIdx < exports.FLOOR_COUNT; floorIdx++) {
            this.panels[floorIdx] = [];
            for (var panelIdx = 0; panelIdx < exports.PANEL_COUNT_PER_FLOOR; panelIdx++) {
                var geometry = new THREE.BoxGeometry(0.6, 0.6, 0.1); // TODO: clone() ?
                var material = new THREE.MeshPhongMaterial({ color: 0xf2e9d8 });
                var panel = new THREE.Mesh(geometry, material);
                var x = panelIdx;
                var y = floorIdx + 1; // Offset up 1 because ground is y = 0.
                var z = 0;
                panel.position.set(x, y, z);
                this.panels[floorIdx][panelIdx] = panel;
            }
        }
        this.pointLights = [];
        for (var count = 0; count < POINT_LIGHT_COUNT; count++) {
            var pointLight = new THREE.PointLight(0xff00ff, 1.75, 1.25);
            // These two lines are for debugging:
            // let sphere = new THREE.SphereGeometry( 0.1, 16, 8 );
            // pointLight.add( new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0xffffff})));
            pointLight.position.set(-100, -100, 0.33); // Just get it out of the way for now
            this.pointLights.push(pointLight);
        }
        this.currentPointLightIdx = 0;
        this.pulseTween = null;
        this.pulseTweenElapsed = 0;
        this.emissiveIntensity = new EmissiveIntensity();
    }
    LightingGrid.prototype.start = function () {
        // Transform to fit against building.
        this.group.position.set(1.9, 3.8, -1.55);
        this.group.scale.set(0.7, 1.0, 1);
        for (var _i = 0, _a = this.panels; _i < _a.length; _i++) {
            var floor = _a[_i];
            for (var _b = 0, floor_1 = floor; _b < floor_1.length; _b++) {
                var panel = floor_1[_b];
                this.group.add(panel);
            }
        }
        for (var _c = 0, _d = this.pointLights; _c < _d.length; _c++) {
            var pointLight = _d[_c];
            this.group.add(pointLight);
        }
        // Make cells appear to pulse.
        this.emissiveIntensity.value = 0.33;
        this.pulseTweenElapsed = 0;
        this.pulseTween = new TWEEN.Tween(this.emissiveIntensity)
            .to({ value: 1.0 }, 750)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .repeat(Infinity)
            .start(this.pulseTweenElapsed);
    };
    LightingGrid.prototype.step = function (elapsed) {
        this.stepPulse(elapsed);
    };
    LightingGrid.prototype.switchRoomLight = function (floorIdx, panelIdx, color) {
        var panel = this.panels[floorIdx][panelIdx];
        panel.material.emissive.setHex(color);
    };
    LightingGrid.prototype.sendPointLightTo = function (floorIdx, panelIdx, color) {
        var pointLight = this.getNextPointLight();
        pointLight.color.setHex(color);
        var x = panelIdx;
        var y = floorIdx + 1; // Offset up 1 because ground is y = 0.
        var z = 0.33;
        pointLight.position.set(x, y, z);
    };
    LightingGrid.prototype.getNextPointLight = function () {
        var pointLight = this.pointLights[this.currentPointLightIdx];
        this.currentPointLightIdx++;
        if (this.currentPointLightIdx >= POINT_LIGHT_COUNT) {
            this.currentPointLightIdx = 0;
        }
        return pointLight;
    };
    LightingGrid.prototype.stepPulse = function (elapsed) {
        if (this.pulseTween != null) {
            this.pulseTweenElapsed += elapsed;
            this.pulseTween.update(this.pulseTweenElapsed);
        }
        for (var _i = 0, _a = this.panels; _i < _a.length; _i++) {
            var floor = _a[_i];
            for (var _b = 0, floor_2 = floor; _b < floor_2.length; _b++) {
                var panel = floor_2[_b];
                panel.material.emissiveIntensity = this.emissiveIntensity.value;
            }
        }
    };
    return LightingGrid;
}());
exports.lightingGrid = new LightingGrid();
},{}],23:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var lighting_grid_1 = require('./lighting-grid');
var Switchboard = (function () {
    function Switchboard() {
    }
    Switchboard.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.ActiveShapeChangedEventType, function (event) {
            _this.handleActiveShapeChangedEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.ActiveShapeEndedEventType, function (event) {
            _this.handleActiveShapeEndedEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.CellChangeEventType, function (event) {
            _this.handleCellChangeEvent(event);
        });
        lighting_grid_1.lightingGrid.start();
    };
    Switchboard.prototype.step = function (elapsed) {
        //
    };
    Switchboard.prototype.handleActiveShapeChangedEvent = function (event) {
        var floorIdx = this.convertRowToFloor(event.shape.getRow());
        var panelIdx = event.shape.getCol();
        var color = this.convertColor(event.shape.color);
        for (var _i = 0, _a = event.shape.getOffsets(); _i < _a.length; _i++) {
            var offset = _a[_i];
            var offsetFloorIdx = floorIdx - offset.y;
            // if (offsetFloorIdx >= FLOOR_COUNT) {
            // continue; // Skip obstructed floors
            // }
            var offsetPanelIdx = panelIdx + offset.x;
            lighting_grid_1.lightingGrid.sendPointLightTo(offsetFloorIdx, offsetPanelIdx, color);
        }
    };
    Switchboard.prototype.handleActiveShapeEndedEvent = function (event) {
        // TODO: Maybe set some sort of animation in motion
    };
    Switchboard.prototype.handleCellChangeEvent = function (event) {
        var floorIdx = this.convertRowToFloor(event.row);
        if (floorIdx >= lighting_grid_1.FLOOR_COUNT) {
            return; // Skip obstructed floors
        }
        var panelIdx = event.col;
        var color = this.convertColor(event.cell.getColor());
        lighting_grid_1.lightingGrid.switchRoomLight(floorIdx, panelIdx, color);
    };
    /**
     * Convert cell row/col coordinates to floor/panel coordinates.
     * Account for the two floors that are obstructed from view. (?)
     */
    Switchboard.prototype.convertRowToFloor = function (row) {
        var thing = (lighting_grid_1.FLOOR_COUNT - row) + 1;
        return thing;
    };
    Switchboard.prototype.convertColor = function (color) {
        var value;
        switch (color) {
            case 1 /* Cyan */:
                value = 0x00ffff;
                break;
            case 2 /* Yellow */:
                value = 0xffff00;
                break;
            case 3 /* Purple */:
                value = 0x800080;
                break;
            case 4 /* Green */:
                value = 0x008000;
                break;
            case 5 /* Red */:
                value = 0xff0000;
                break;
            case 6 /* Blue */:
                value = 0x0000ff;
                break;
            case 7 /* Orange */:
                value = 0xffa500;
                break;
            case 8 /* White */:
                value = 0xffffff;
                break;
            // Default or missing case is black.
            case 0 /* Empty */:
            default:
                value = 0x000000;
                break;
        }
        return value;
    };
    return Switchboard;
}());
exports.switchboard = new Switchboard();
},{"../../event/event-bus":8,"./lighting-grid":22}],24:[function(require,module,exports){
"use strict";
// Dimensions of the entire spritesheet:
exports.SPRITESHEET_WIDTH = 256;
exports.SPRITESHEET_HEIGHT = 512;
// Dimensions of one frame within the spritesheet:
exports.FRAME_WIDTH = 48;
exports.FRAME_HEIGHT = 72;
var StandeeAnimationTextureWrapper = (function () {
    function StandeeAnimationTextureWrapper(texture) {
        this.texture = texture;
    }
    return StandeeAnimationTextureWrapper;
}());
exports.StandeeAnimationTextureWrapper = StandeeAnimationTextureWrapper;
var StandeeAnimationTextureBase = (function () {
    function StandeeAnimationTextureBase() {
        this.texture = null;
    }
    StandeeAnimationTextureBase.prototype.preload = function (callback) {
        var _this = this;
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load('fall-student.png', function (texture) {
            _this.texture = texture;
            // Allows for texture flipping, when necessary.
            // NOTE: To do so, set repeat.x *= -1 and offset.x *= -1.
            _this.texture.wrapS = THREE.RepeatWrapping;
            // Have it show only one frame at a time:
            _this.texture.repeat.set(exports.FRAME_WIDTH / exports.SPRITESHEET_WIDTH, exports.FRAME_HEIGHT / exports.SPRITESHEET_HEIGHT);
            callback();
        });
    };
    StandeeAnimationTextureBase.prototype.newInstance = function () {
        // return this.texture.clone(); // This is the bane of my existence.
        var texture = this.texture.clone();
        return new StandeeAnimationTextureWrapper(texture);
    };
    StandeeAnimationTextureBase.prototype.setTexture = function (texture) {
        this.texture = texture;
    };
    return StandeeAnimationTextureBase;
}());
exports.standeeAnimationTextureBase = new StandeeAnimationTextureBase();
},{}],25:[function(require,module,exports){
"use strict";
var standee_1 = require('./standee');
var event_bus_1 = require('../../event/event-bus');
var Y_OFFSET = 0.75; // Sets their feet on the ground plane.
var StandeeManager = (function () {
    function StandeeManager() {
        this.group = new THREE.Object3D();
        this.standees = new Map();
    }
    StandeeManager.prototype.start = function () {
        var _this = this;
        this.group.position.setY(Y_OFFSET);
        event_bus_1.eventBus.register(event_bus_1.EventType.NpcPlacedEventType, function (event) {
            _this.handleNpcPlacedEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.NpcMovementChangedEventType, function (event) {
            _this.handleNpcMovementChangedEvent(event);
        });
    };
    StandeeManager.prototype.step = function (elapsed) {
        this.standees.forEach(function (standee) {
            standee.step(elapsed);
        });
    };
    StandeeManager.prototype.handleNpcPlacedEvent = function (event) {
        var standee = new standee_1.Standee(event.npcId);
        standee.start();
        this.group.add(standee.group);
        this.standees.set(standee.npcId, standee);
        var x = event.x;
        var z = event.y;
        this.moveToInitialPosition(standee, x, z);
    };
    StandeeManager.prototype.moveToInitialPosition = function (standee, x, z) {
        // TODO: Use event.x, event.y with scaling to determine destination
        standee.moveTo(x, z);
    };
    StandeeManager.prototype.handleNpcMovementChangedEvent = function (event) {
        var standee = this.standees.get(event.npcId);
        if (standee != null) {
            var x = event.x;
            var z = event.y;
            standee.walkTo(x, z, 1);
        }
    };
    return StandeeManager;
}());
exports.standeeManager = new StandeeManager();
},{"../../event/event-bus":8,"./standee":27}],26:[function(require,module,exports){
/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var standee_animation_texture_base_1 = require('./standee-animation-texture-base');
var STANDARD_DELAY = 225;
var WALK_UP_OR_DOWN_DELAY = Math.floor(STANDARD_DELAY * (2 / 3)); // Because up/down walk cycles have more frames. 
var StandeeAnimationFrame = (function () {
    function StandeeAnimationFrame(row, col) {
        this.row = row;
        this.col = col;
    }
    return StandeeAnimationFrame;
}());
var StandeeAnimationType;
(function (StandeeAnimationType) {
    StandeeAnimationType[StandeeAnimationType["StandUp"] = 0] = "StandUp";
    StandeeAnimationType[StandeeAnimationType["StandDown"] = 1] = "StandDown";
    StandeeAnimationType[StandeeAnimationType["StandLeft"] = 2] = "StandLeft";
    StandeeAnimationType[StandeeAnimationType["StandRight"] = 3] = "StandRight";
    StandeeAnimationType[StandeeAnimationType["WalkUp"] = 4] = "WalkUp";
    StandeeAnimationType[StandeeAnimationType["WalkDown"] = 5] = "WalkDown";
    StandeeAnimationType[StandeeAnimationType["WalkLeft"] = 6] = "WalkLeft";
    StandeeAnimationType[StandeeAnimationType["WalkRight"] = 7] = "WalkRight";
    StandeeAnimationType[StandeeAnimationType["CheerUp"] = 8] = "CheerUp";
    StandeeAnimationType[StandeeAnimationType["PanicUp"] = 9] = "PanicUp";
    StandeeAnimationType[StandeeAnimationType["PanicDown"] = 10] = "PanicDown";
})(StandeeAnimationType || (StandeeAnimationType = {}));
var StandeeAnimation = (function () {
    function StandeeAnimation(next) {
        this.frames = [];
        this.delays = [];
        this.next = next;
        this.currentFrameIdx = 0;
        this.currentFrameTimeElapsed = 0;
        this.finished = false;
    }
    StandeeAnimation.prototype.push = function (frame, delay) {
        if (delay === void 0) { delay = STANDARD_DELAY; }
        this.frames.push(frame);
        this.delays.push(delay);
    };
    StandeeAnimation.prototype.step = function (elapsed) {
        this.currentFrameTimeElapsed += elapsed;
        if (this.currentFrameTimeElapsed >= this.delays[this.currentFrameIdx]) {
            this.currentFrameTimeElapsed = 0;
            this.currentFrameIdx++;
            if (this.currentFrameIdx >= this.frames.length) {
                this.currentFrameIdx = 0; // Shouldn't be used anymore, but prevent out-of-bounds anyway.
                this.finished = true;
            }
        }
    };
    StandeeAnimation.prototype.isFinished = function () {
        return this.finished;
    };
    StandeeAnimation.prototype.getCurrentFrame = function () {
        return this.frames[this.currentFrameIdx];
    };
    return StandeeAnimation;
}());
var StandeeSpriteWrapper = (function () {
    function StandeeSpriteWrapper() {
        this.group = new THREE.Object3D();
        // Initialize ThreeJS objects: 
        this.textureWrapper = standee_animation_texture_base_1.standeeAnimationTextureBase.newInstance();
        var material = new THREE.SpriteMaterial({ map: this.textureWrapper.texture });
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(1, 1.5); // Adjust aspect ratio for 48 x 72 size frames. 
        this.group.add(this.sprite);
        // Initialize default animation to standing facing down:
        this.currentAnimation = createWalkRight();
    }
    StandeeSpriteWrapper.prototype.start = function () {
        this.sprite.material.color.set(0xaaaaaa); // TODO: Set this elsewhere
    };
    StandeeSpriteWrapper.prototype.step = function (elapsed) {
        this.stepCurrentFrame(elapsed);
    };
    StandeeSpriteWrapper.prototype.stepCurrentFrame = function (elapsed) {
        this.currentAnimation.step(elapsed);
        if (this.currentAnimation.isFinished()) {
            this.currentAnimation = determineAnimation(this.currentAnimation.next);
        }
        var frame = this.currentAnimation.getCurrentFrame();
        // Convert frame coordinates to texture coordinates and set the current one
        var xpct = (frame.col * standee_animation_texture_base_1.FRAME_WIDTH) / standee_animation_texture_base_1.SPRITESHEET_WIDTH;
        var ypct = (((standee_animation_texture_base_1.SPRITESHEET_HEIGHT / standee_animation_texture_base_1.FRAME_HEIGHT) - 1 - frame.row) * standee_animation_texture_base_1.FRAME_HEIGHT) / standee_animation_texture_base_1.SPRITESHEET_HEIGHT;
        this.textureWrapper.texture.offset.set(xpct, ypct);
    };
    return StandeeSpriteWrapper;
}());
exports.StandeeSpriteWrapper = StandeeSpriteWrapper;
function determineAnimation(type) {
    var animation;
    switch (type) {
        case StandeeAnimationType.StandUp:
            animation = createStandUp();
            break;
        case StandeeAnimationType.WalkUp:
            animation = createWalkUp();
            break;
        case StandeeAnimationType.StandDown:
            animation = createStandDown();
            break;
        case StandeeAnimationType.WalkDown:
            animation = createWalkDown();
            break;
        case StandeeAnimationType.StandLeft:
            animation = createStandLeft();
            break;
        case StandeeAnimationType.WalkLeft:
            animation = createWalkLeft();
            break;
        case StandeeAnimationType.StandRight:
            animation = createStandRight();
            break;
        case StandeeAnimationType.WalkRight:
            animation = createWalkRight();
            break;
        case StandeeAnimationType.CheerUp:
            animation = createCheerUp();
            break;
        case StandeeAnimationType.PanicUp:
            animation = createPanicUp();
            break;
        case StandeeAnimationType.PanicDown:
            animation = createPanicDown();
            break;
        default:
            console.log('Should not get here');
    }
    return animation;
}
// Standing Up
var standUpFrame1 = new StandeeAnimationFrame(2, 0);
function createStandUp() {
    var animation = new StandeeAnimation(StandeeAnimationType.StandUp);
    animation.push(standUpFrame1);
    return animation;
}
// Walking Up
var walkUpFrame1 = new StandeeAnimationFrame(2, 0);
var walkUpFrame2 = new StandeeAnimationFrame(2, 1);
var walkUpFrame3 = new StandeeAnimationFrame(2, 2);
var walkUpFrame4 = new StandeeAnimationFrame(3, 3);
var walkUpFrame5 = new StandeeAnimationFrame(4, 3);
var walkUpFrame6 = new StandeeAnimationFrame(5, 3);
function createWalkUp() {
    var animation = new StandeeAnimation(StandeeAnimationType.WalkUp);
    animation.push(walkUpFrame1, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame2, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame3, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame4, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame5, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame6, WALK_UP_OR_DOWN_DELAY);
    return animation;
}
// Standing Down
var standDownFrame1 = new StandeeAnimationFrame(0, 0);
function createStandDown() {
    var animation = new StandeeAnimation(StandeeAnimationType.StandDown);
    animation.push(standDownFrame1);
    return animation;
}
// Walking Down
var walkDownFrame1 = new StandeeAnimationFrame(0, 0);
var walkDownFrame2 = new StandeeAnimationFrame(0, 1);
var walkDownFrame3 = new StandeeAnimationFrame(0, 2);
var walkDownFrame4 = new StandeeAnimationFrame(0, 3);
var walkDownFrame5 = new StandeeAnimationFrame(1, 3);
var walkDownFrame6 = new StandeeAnimationFrame(2, 3);
function createWalkDown() {
    var animation = new StandeeAnimation(StandeeAnimationType.WalkDown);
    animation.push(walkDownFrame1, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame2, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame3, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame4, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame5, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame6, WALK_UP_OR_DOWN_DELAY);
    return animation;
}
// Standing Left
var standLeftFrame1 = new StandeeAnimationFrame(1, 1);
function createStandLeft() {
    var animation = new StandeeAnimation(StandeeAnimationType.StandLeft);
    animation.push(standLeftFrame1);
    return animation;
}
// Walking Left
var walkLeftFrame1 = new StandeeAnimationFrame(1, 1);
var walkLeftFrame2 = new StandeeAnimationFrame(1, 0);
var walkLeftFrame3 = new StandeeAnimationFrame(1, 1);
var walkLeftFrame4 = new StandeeAnimationFrame(1, 2);
function createWalkLeft() {
    var animation = new StandeeAnimation(StandeeAnimationType.WalkLeft);
    animation.push(walkLeftFrame1);
    animation.push(walkLeftFrame2);
    animation.push(walkLeftFrame3);
    animation.push(walkLeftFrame4);
    return animation;
}
// Standing Right
var standRightFrame1 = new StandeeAnimationFrame(1, 4);
function createStandRight() {
    var animation = new StandeeAnimation(StandeeAnimationType.StandRight);
    animation.push(standRightFrame1);
    return animation;
}
// Walking Right
var walkRightFrame1 = new StandeeAnimationFrame(1, 4);
var walkRightFrame2 = new StandeeAnimationFrame(2, 4);
var walkRightFrame3 = new StandeeAnimationFrame(1, 4);
var walkRightFrame4 = new StandeeAnimationFrame(0, 4);
function createWalkRight() {
    var animation = new StandeeAnimation(StandeeAnimationType.WalkRight);
    animation.push(walkRightFrame1);
    animation.push(walkRightFrame2);
    animation.push(walkRightFrame3);
    animation.push(walkRightFrame4);
    return animation;
}
// Cheer Up
var cheerUpFrame1 = new StandeeAnimationFrame(2, 0);
var cheerUpFrame2 = new StandeeAnimationFrame(3, 0);
var cheerUpFrame3 = new StandeeAnimationFrame(3, 1);
var cheerUpFrame4 = new StandeeAnimationFrame(3, 0);
function createCheerUp() {
    var animation = new StandeeAnimation(StandeeAnimationType.CheerUp);
    animation.push(cheerUpFrame1);
    animation.push(cheerUpFrame2);
    animation.push(cheerUpFrame3);
    animation.push(cheerUpFrame4);
    return animation;
}
// Panic Up
var panicUpFrame1 = new StandeeAnimationFrame(2, 0);
var panicUpFrame2 = new StandeeAnimationFrame(3, 2);
var panicUpFrame3 = new StandeeAnimationFrame(4, 0);
var panicUpFrame4 = new StandeeAnimationFrame(3, 2);
function createPanicUp() {
    var animation = new StandeeAnimation(StandeeAnimationType.PanicUp);
    animation.push(panicUpFrame1);
    animation.push(panicUpFrame2);
    animation.push(panicUpFrame3);
    animation.push(panicUpFrame4);
    return animation;
}
// Panic Down
var panicDownFrame1 = new StandeeAnimationFrame(0, 0);
var panicDownFrame2 = new StandeeAnimationFrame(4, 1);
var panicDownFrame3 = new StandeeAnimationFrame(4, 2);
var panicDownFrame4 = new StandeeAnimationFrame(4, 1);
function createPanicDown() {
    var animation = new StandeeAnimation(StandeeAnimationType.PanicDown);
    animation.push(panicDownFrame1);
    animation.push(panicDownFrame2);
    animation.push(panicDownFrame3);
    animation.push(panicDownFrame4);
    return animation;
}
},{"./standee-animation-texture-base":24}],27:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var standee_movement_ended_event_1 = require('../../event/standee-movement-ended-event');
var standee_sprite_wrapper_1 = require('./standee-sprite-wrapper');
var Standee = (function () {
    function Standee(npcId) {
        this.npcId = npcId;
        this.group = new THREE.Object3D();
        this.spriteWrapper = new standee_sprite_wrapper_1.StandeeSpriteWrapper();
        this.group.add(this.spriteWrapper.group);
        this.walkTweenElapsed = 0;
        this.walkTween = null;
    }
    Standee.prototype.start = function () {
        this.group.position.set(-200, 0, -200);
    };
    Standee.prototype.step = function (elapsed) {
        this.stepWalk(elapsed);
        this.spriteWrapper.step(elapsed);
    };
    /**
     * Immediately set standee on given position.
     */
    Standee.prototype.moveTo = function (x, z) {
        this.group.position.set(x, 0, z);
    };
    /**
     * Set standee in motion towards given position.
     * Speed dimension is 1 unit/sec.
     */
    Standee.prototype.walkTo = function (x, z, speed) {
        var _this = this;
        // Calculate how long it would take, given the speed requested.
        var vector = new THREE.Vector3(x, 0, z).sub(this.group.position);
        var distance = vector.length();
        var time = (distance / speed) * 1000;
        // Delegate to tween.js. Pass in closures as callbacks because otherwise 'this' will refer
        // to the position object, when executing stopWalk().
        this.walkTweenElapsed = 0;
        this.walkTween = new TWEEN.Tween(this.group.position)
            .to({ x: x, z: z }, time)
            .onComplete(function () { _this.stopWalk(); })
            .start(this.walkTweenElapsed);
    };
    Standee.prototype.stepWalk = function (elapsed) {
        if (this.walkTween != null) {
            this.walkTweenElapsed += elapsed;
            this.walkTween.update(this.walkTweenElapsed);
        }
    };
    Standee.prototype.stopWalk = function () {
        this.walkTweenElapsed = 0;
        this.walkTween = null;
        event_bus_1.eventBus.fire(new standee_movement_ended_event_1.StandeeMovementEndedEvent(this.npcId, this.group.position.x, this.group.position.z));
    };
    return Standee;
}());
exports.Standee = Standee;
},{"../../event/event-bus":8,"../../event/standee-movement-ended-event":12,"./standee-sprite-wrapper":26}],28:[function(require,module,exports){
"use strict";
var world_1 = require('./world/world');
var lighting_grid_1 = require('./lighting/lighting-grid');
var switchboard_1 = require('./lighting/switchboard');
var standee_manager_1 = require('./standee/standee-manager');
var View = (function () {
    function View() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        // this.renderer.sortObjects = false; // FIXME: I'm not sure why I'm able to comment this out now...
    }
    View.prototype.start = function () {
        this.doStart();
        world_1.world.start();
        lighting_grid_1.lightingGrid.start();
        switchboard_1.switchboard.start();
        standee_manager_1.standeeManager.start();
    };
    View.prototype.step = function (elapsed) {
        world_1.world.step(elapsed);
        lighting_grid_1.lightingGrid.step(elapsed);
        switchboard_1.switchboard.step(elapsed);
        standee_manager_1.standeeManager.step(elapsed);
        // FIXME: I'm not really sure why it is sorting these correctly without this:
        // for (let obj of standeeManager.group.children) {
        //     let distance = this.camera.position.distanceTo(obj.position);
        //     obj.renderOrder = distance * -1;
        // }
        this.ttl -= elapsed;
        if (this.ttl <= 0) {
            this.ttl = 250;
            this.col++;
            if (this.col >= 3) {
                this.col = 0;
                this.row++;
                if (this.row >= 5) {
                    this.row = 0;
                }
            }
            // Using pixels:
            var x = 48 * this.col;
            var y = 512 - ((this.row + 1) * 72);
            var xpct = x / 256;
            var ypct = y / 512;
            this.texture.offset.set(xpct, ypct);
        }
        this.renderer.render(this.scene, this.camera);
    };
    View.prototype.doStart = function () {
        var _this = this;
        this.scene.add(world_1.world.group);
        this.scene.add(standee_manager_1.standeeManager.group);
        this.scene.add(lighting_grid_1.lightingGrid.group);
        // TODO: Temporary for debugging?
        this.scene.add(new THREE.AmbientLight(0x404040));
        this.camera.position.set(-3, 0.75, 15); // A little higher than eye-level with the NPCs.
        this.camera.lookAt(new THREE.Vector3(4, 9, 0));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', function () {
            _this.renderer.setSize(window.innerWidth, window.innerHeight);
            _this.camera.aspect = window.innerWidth / window.innerHeight;
            _this.camera.updateProjectionMatrix();
        });
    };
    return View;
}());
exports.view = new View();
},{"./lighting/lighting-grid":22,"./lighting/switchboard":23,"./standee/standee-manager":25,"./world/world":32}],29:[function(require,module,exports){
"use strict";
var Building = (function () {
    function Building() {
        this.group = new THREE.Object3D();
        // This is the old plain cube.
        // let geometry = new THREE.BoxGeometry(11, 20, 10);
        // let material = new THREE.MeshLambertMaterial({color: 0xffffff});
        // this.slab = new THREE.Mesh(geometry, material);
        // this.slab.position.set(4.5, 10, -5.8);
    }
    Building.prototype.start = function () {
        var _this = this;
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('');
        mtlLoader.load('green-building.mtl', function (materials) {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('');
            objLoader.load('green-building.obj', function (obj) {
                obj.scale.setScalar(0.25);
                obj.position.set(5, -0.01, 0);
                _this.group.add(obj);
            }, function () { }, function () { console.log('error while loading :('); });
        });
    };
    Building.prototype.step = function (elapsed) {
        //
    };
    return Building;
}());
exports.building = new Building();
},{}],30:[function(require,module,exports){
"use strict";
var Ground = (function () {
    function Ground() {
        this.group = new THREE.Object3D();
        var geometry = new THREE.PlaneGeometry(300, 300);
        var material = new THREE.MeshLambertMaterial({ emissive: 0x021d03, emissiveIntensity: 1.0 });
        this.grass = new THREE.Mesh(geometry, material);
        this.grass.rotation.x = (Math.PI * 3) / 2;
        this.grass.position.set(0, 0, 0);
    }
    Ground.prototype.start = function () {
        this.group.add(this.grass);
    };
    Ground.prototype.step = function (elapsed) {
        //
    };
    return Ground;
}());
exports.ground = new Ground();
},{}],31:[function(require,module,exports){
"use strict";
var START_Z_ANGLE = -(Math.PI / 30);
var END_Z_ANGLE = Math.PI / 30;
var ROTATION_SPEED = 0.0001;
var Sky = (function () {
    function Sky() {
        this.group = new THREE.Object3D();
        var geometry = new THREE.SphereGeometry(50, 32, 32); // new THREE.BoxGeometry(150, 150, 150);
        var texture = new THREE.Texture(this.generateTexture());
        texture.needsUpdate = true;
        var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        this.dome = new THREE.Mesh(geometry, material);
        this.dome.material.side = THREE.BackSide;
        this.dome.position.set(10, 10, 0);
        this.group.add(this.dome);
        this.rdz = -ROTATION_SPEED;
    }
    Sky.prototype.start = function () {
        this.dome.rotation.set(0, 0, START_Z_ANGLE);
    };
    Sky.prototype.step = function (elapsed) {
        this.dome.rotation.set(0, 0, this.dome.rotation.z + this.rdz);
        if (this.dome.rotation.z >= END_Z_ANGLE) {
            this.rdz = -ROTATION_SPEED;
        }
        else if (this.dome.rotation.z <= START_Z_ANGLE) {
            this.rdz = ROTATION_SPEED;
        }
    };
    /**
     * Based on: http://stackoverflow.com/a/19992505
     */
    Sky.prototype.generateTexture = function () {
        var size = 512;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        ctx.rect(0, 0, size, size);
        var gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0.00, '#000000');
        gradient.addColorStop(0.40, '#131c45');
        gradient.addColorStop(0.75, '#ff9544');
        gradient.addColorStop(0.85, '#131c45');
        gradient.addColorStop(1.00, '#131c45');
        ctx.fillStyle = gradient;
        ctx.fill();
        return canvas;
    };
    return Sky;
}());
exports.sky = new Sky();
},{}],32:[function(require,module,exports){
"use strict";
var sky_1 = require('./sky');
var building_1 = require('./building');
var ground_1 = require('./ground');
var World = (function () {
    function World() {
        this.group = new THREE.Object3D();
    }
    World.prototype.start = function () {
        this.group.add(sky_1.sky.group);
        this.group.add(building_1.building.group);
        this.group.add(ground_1.ground.group);
        sky_1.sky.start();
        building_1.building.start();
        ground_1.ground.start();
    };
    World.prototype.step = function (elapsed) {
        sky_1.sky.step(elapsed);
        building_1.building.step(elapsed);
        ground_1.ground.step(elapsed);
    };
    return World;
}());
exports.world = new World();
},{"./building":29,"./ground":30,"./sky":31}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2NvbnRyb2xsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2lucHV0LnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL2NlbGwudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vcGxheWVyLW1vdmVtZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9hY3RpdmUtc2hhcGUtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9jZWxsLWNoYW5nZS1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2V2ZW50LWJ1cy50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy1tb3ZlbWVudC1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvbnBjLXBsYWNlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9nYW1lLXN0YXRlLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL2JvYXJkLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvc2hhcGUtZmFjdG9yeS50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL3NoYXBlLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbW9kZWwudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvbnBjLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvbnBjLnRzIiwic3JjL3NjcmlwdHMvcHJlbG9hZGVyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9saWdodGluZy1ncmlkLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9zd2l0Y2hib2FyZC50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1tYW5hZ2VyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUtc3ByaXRlLXdyYXBwZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS50cyIsInNyYy9zY3JpcHRzL3ZpZXcvdmlldy50cyIsInNyYy9zY3JpcHRzL3ZpZXcvd29ybGQvYnVpbGRpbmcudHMiLCJzcmMvc2NyaXB0cy92aWV3L3dvcmxkL2dyb3VuZC50cyIsInNyYy9zY3JpcHRzL3ZpZXcvd29ybGQvc2t5LnRzIiwic3JjL3NjcmlwdHMvdmlldy93b3JsZC93b3JsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxzQkFBeUIsU0FBUyxDQUFDLENBQUE7QUFDbkMsMEJBQXVCLG9CQUFvQixDQUFDLENBQUE7QUFDNUMsZ0NBQTZCLDJCQUEyQixDQUFDLENBQUE7QUFDekQsc0NBQWtDLGdDQUFnQyxDQUFDLENBQUE7QUFFbkUsNkhBQTZIO0FBRTdIO0lBQUE7SUEyQkEsQ0FBQztJQXpCRywwQkFBSyxHQUFMO1FBQ0ksYUFBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCx5QkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixFQUFFLENBQUMsQ0FBQyxhQUFLLENBQUMsa0JBQWtCLENBQUMsVUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLG9CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksMkNBQW1CLENBQUMsZ0NBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxhQUFLLENBQUMsa0JBQWtCLENBQUMsWUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLG9C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Q0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQixlQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVELG9CQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLFNBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEIsbUJBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkIsZUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBQ0wsWUFBQztBQUFELENBdkJBLEFBdUJDLElBQUE7QUFDWSxhQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge2lucHV0LCBLZXl9IGZyb20gJy4vaW5wdXQnO1xyXG5pbXBvcnQge2V2ZW50QnVzfSBmcm9tICcuLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5cclxuLy8gVE9ETzogSGVyZSBkZXRlcm1pbmUgaWYgcGxheWVyIGlzIGhvbGRpbmcgZG93biBvbmUgb2YgdGhlIGFycm93IGtleXM7IGlmIHNvLCBmaXJlIHJhcGlkIGV2ZW50cyBhZnRlciAoVEJEKSBhbW91bnQgb2YgdGltZS5cclxuXHJcbmNsYXNzIENvbnRyb2xsZXIge1xyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGlucHV0LnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5VcCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Sb3RhdGVDbG9ja3dpc2UpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkxlZnQpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuTGVmdCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuUmlnaHQpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUmlnaHQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkRvd24pKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRG93bikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuU3BhY2UpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRHJvcCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuZXhwb3J0IGNvbnN0IGVudW0gS2V5IHtcclxuICAgIExlZnQsXHJcbiAgICBVcCxcclxuICAgIERvd24sXHJcbiAgICBSaWdodCxcclxuICAgIFNwYWNlLFxyXG4gICAgUGF1c2UsXHJcbiAgICBPdGhlclxyXG59XHJcblxyXG5jb25zdCBlbnVtIFN0YXRlIHtcclxuICAgIERvd24sXHJcbiAgICBVcCxcclxuICAgIEhhbmRsaW5nXHJcbn1cclxuXHJcbmNsYXNzIElucHV0IHtcclxuICAgIHByaXZhdGUga2V5U3RhdGU6IE1hcDxLZXksU3RhdGU+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMua2V5U3RhdGUgPSBuZXcgTWFwPEtleSxTdGF0ZT4oKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50VG9TdGF0ZShldmVudCwgU3RhdGUuRG93bik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRUb1N0YXRlKGV2ZW50LCBTdGF0ZS5VcCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gaWYgZ2l2ZW4ga2V5IGlzICdEb3duJy5cclxuICAgICAqL1xyXG4gICAgaXNEb3duKGtleTogS2V5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5U3RhdGUuZ2V0KGtleSkgPT09IFN0YXRlLkRvd247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gaWYgZ2l2ZW4ga2V5IGlzICdkb3duJy4gQWxzbyBzZXRzIHRoZSBrZXkgZnJvbSAnRG93bicgdG8gJ0hhbmRsaW5nJy5cclxuICAgICAqL1xyXG4gICAgaXNEb3duQW5kVW5oYW5kbGVkKGtleTogS2V5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNEb3duKGtleSkpIHtcclxuICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBTdGF0ZS5IYW5kbGluZyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gVE9ETzogVGhpcyB3YXNuJ3Qgc2V0IGluIG1hemluZzsgbmVlZCB0byBzZWUgd2h5LlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgaWYgYW55IGtleSBpcyAnZG93bicuIEFsc28gc2V0IGFsbCAnRG93bicga2V5cyB0byAnSGFuZGxpbmcnLlxyXG4gICAgICovXHJcbiAgICBpc0FueUtleURvd25BbmRVbmhhbmRsZWQoKSB7XHJcbiAgICAgICAgbGV0IGFueUtleURvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmtleVN0YXRlLmZvckVhY2goKHN0YXRlOiBTdGF0ZSwga2V5OiBLZXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIFN0YXRlLkhhbmRsaW5nKTtcclxuICAgICAgICAgICAgICAgIGFueUtleURvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFueUtleURvd247XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudFRvU3RhdGUoZXZlbnQ6IEtleWJvYXJkRXZlbnQsIHN0YXRlOiBTdGF0ZSkge1xyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG5cclxuICAgICAgICAgICAgLy8gRGlyZWN0aW9uYWxzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vICdhJ1xyXG4gICAgICAgICAgICBjYXNlIDM3OiAvLyBsZWZ0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5MZWZ0LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODc6IC8vICd3J1xyXG4gICAgICAgICAgICBjYXNlIDM4OiAvLyB1cFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuVXAsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCkgLSBjb21tZW50ZWQgZm9yIGlmIHRoZSB1c2VyIHdhbnRzIHRvIGNtZCt3IG9yIGN0cmwrd1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vICdkJ1xyXG4gICAgICAgICAgICBjYXNlIDM5OiAvLyByaWdodFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuUmlnaHQsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4MzogLy8gJ3MnXHJcbiAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd25cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LkRvd24sIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzMjogLy8gc3BhY2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlNwYWNlLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBQYXVzZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA4MDogLy8gJ3AnXHJcbiAgICAgICAgICAgIGNhc2UgMjc6IC8vIGVzY1xyXG4gICAgICAgICAgICBjYXNlIDEzOiAvLyBlbnRlciBrZXlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlBhdXNlLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBUT0RPOiBNYXliZSBhZGQgYSBkZWJ1ZyBrZXkgaGVyZSAoJ2YnKVxyXG5cclxuICAgICAgICAgICAgLy8gSWdub3JlIGNlcnRhaW4ga2V5cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgODI6ICAgIC8vICdyJ1xyXG4gICAgICAgICAgICBjYXNlIDE4OiAgICAvLyBhbHRcclxuICAgICAgICAgICAgY2FzZSAyMjQ6ICAgLy8gYXBwbGUgY29tbWFuZCAoZmlyZWZveClcclxuICAgICAgICAgICAgY2FzZSAxNzogICAgLy8gYXBwbGUgY29tbWFuZCAob3BlcmEpXHJcbiAgICAgICAgICAgIGNhc2UgOTE6ICAgIC8vIGFwcGxlIGNvbW1hbmQsIGxlZnQgKHNhZmFyaS9jaHJvbWUpXHJcbiAgICAgICAgICAgIGNhc2UgOTM6ICAgIC8vIGFwcGxlIGNvbW1hbmQsIHJpZ2h0IChzYWZhcmkvY2hyb21lKVxyXG4gICAgICAgICAgICBjYXNlIDg0OiAgICAvLyAndCcgKGkuZS4sIG9wZW4gYSBuZXcgdGFiKVxyXG4gICAgICAgICAgICBjYXNlIDc4OiAgICAvLyAnbicgKGkuZS4sIG9wZW4gYSBuZXcgd2luZG93KVxyXG4gICAgICAgICAgICBjYXNlIDIxOTogICAvLyBsZWZ0IGJyYWNrZXRzXHJcbiAgICAgICAgICAgIGNhc2UgMjIxOiAgIC8vIHJpZ2h0IGJyYWNrZXRzXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgc29tZSB1bndhbnRlZCBiZWhhdmlvcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDE5MTogICAvLyBmb3J3YXJkIHNsYXNoIChwYWdlIGZpbmQpXHJcbiAgICAgICAgICAgIGNhc2UgOTogICAgIC8vIHRhYiAoY2FuIGxvc2UgZm9jdXMpXHJcbiAgICAgICAgICAgIGNhc2UgMTY6ICAgIC8vIHNoaWZ0XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGwgb3RoZXIga2V5cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5Lk90aGVyLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRTdGF0ZShrZXk6IEtleSwgc3RhdGU6IFN0YXRlKSB7XHJcbiAgICAgICAgLy8gQWx3YXlzIHNldCAndXAnXHJcbiAgICAgICAgaWYgKHN0YXRlID09PSBTdGF0ZS5VcCkge1xyXG4gICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIHN0YXRlKTtcclxuICAgICAgICAvLyBPbmx5IHNldCAnZG93bicgaWYgaXQgaXMgbm90IGFscmVhZHkgaGFuZGxlZFxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFN0YXRlLkRvd24pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMua2V5U3RhdGUuZ2V0KGtleSkgIT09IFN0YXRlLkhhbmRsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIHN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGlucHV0ID0gbmV3IElucHV0KCk7IiwiaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi9jb2xvcic7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2VsbCB7XHJcbiAgICBwcml2YXRlIGNvbG9yOiBDb2xvcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNvbG9yID0gQ29sb3IuRW1wdHk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29sb3IoY29sb3I6IENvbG9yKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbG9yKCk6IENvbG9yIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb2xvcjtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE9mZnNldCBjYWxjdWxhdGVkIGZyb20gdG9wLWxlZnQgY29ybmVyIGJlaW5nIDAsIDAuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2VsbE9mZnNldCB7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZW51bSBQbGF5ZXJNb3ZlbWVudCB7XHJcbiAgICBOb25lLFxyXG4gICAgTGVmdCxcclxuICAgIFJpZ2h0LFxyXG4gICAgRG93bixcclxuICAgIERyb3AsXHJcbiAgICBSb3RhdGVDbG9ja3dpc2UsXHJcbiAgICBSb3RhdGVDb3VudGVyQ2xvY2t3aXNlXHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1NoYXBlfSBmcm9tICcuLi9tb2RlbC9ib2FyZC9zaGFwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBzaGFwZTogU2hhcGU7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2hhcGU6IFNoYXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnNoYXBlID0gc2hhcGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U2hhcGV9IGZyb20gJy4uL21vZGVsL2JvYXJkL3NoYXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBY3RpdmVTaGFwZUVuZGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBzaGFwZTogU2hhcGU7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2hhcGU6IFNoYXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnNoYXBlID0gc2hhcGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7Q2VsbH0gZnJvbSAnLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi9kb21haW4vY29sb3InO1xyXG5cclxuZXhwb3J0IGNsYXNzIENlbGxDaGFuZ2VFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG4gICAgcmVhZG9ubHkgY2VsbDogQ2VsbDtcclxuICAgIHJlYWRvbmx5IHJvdzogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgY29sOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY2VsbDogQ2VsbCwgcm93OiBudW1iZXIsIGNvbDogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmNlbGwgPSBjZWxsO1xyXG4gICAgICAgIHRoaXMucm93ID0gcm93O1xyXG4gICAgICAgIHRoaXMuY29sID0gY29sO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5DZWxsQ2hhbmdlRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gRXZlbnRUeXBlIHtcclxuICAgIEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSxcclxuICAgIEFjdGl2ZVNoYXBlRW5kZWRFdmVudFR5cGUsXHJcbiAgICBDZWxsQ2hhbmdlRXZlbnRUeXBlLFxyXG4gICAgTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjUGxhY2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjU3RhdGVDaGFnZWRFdmVudFR5cGUsXHJcbiAgICBQbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZSxcclxuICAgIFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnRUeXBlXHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBYnN0cmFjdEV2ZW50IHtcclxuICAgIGFic3RyYWN0IGdldFR5cGUoKTpFdmVudFR5cGVcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFdmVudEhhbmRsZXI8VCBleHRlbmRzIEFic3RyYWN0RXZlbnQ+IHtcclxuICAgIChldmVudDogVCk6dm9pZDtcclxufVxyXG5cclxuY2xhc3MgRXZlbnRCdXMge1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlcnNCeVR5cGU6TWFwPEV2ZW50VHlwZSwgRXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+W10+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlcnNCeVR5cGUgPSBuZXcgTWFwPEV2ZW50VHlwZSwgRXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+W10+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVnaXN0ZXIodHlwZTpFdmVudFR5cGUsIGhhbmRsZXI6RXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+KSB7XHJcbiAgICAgICAgaWYgKCF0eXBlKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHNvbWV0aGluZ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFoYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHNvbWV0aGluZ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGhhbmRsZXJzOkV2ZW50SGFuZGxlcjxBYnN0cmFjdEV2ZW50PltdID0gdGhpcy5oYW5kbGVyc0J5VHlwZS5nZXQodHlwZSk7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVyc0J5VHlwZS5zZXQodHlwZSwgaGFuZGxlcnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBoYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBSZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGNhbiBiZSBjYWxsZWQgdG8gdW5yZWdpc3RlciB0aGUgaGFuZGxlclxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBUT0RPOiB1bnJlZ2lzdGVyKCkuIEFuZCByZW1vdmUgdGhlIG1hcCBrZXkgaWYgemVybyBoYW5kbGVycyBsZWZ0IGZvciBpdC5cclxuICAgIFxyXG4gICAgLy8gVE9ETzogUHJldmVudCBpbmZpbml0ZSBmaXJlKCk/XHJcbiAgICBmaXJlKGV2ZW50OkFic3RyYWN0RXZlbnQpIHtcclxuICAgICAgICBsZXQgaGFuZGxlcnMgPSB0aGlzLmhhbmRsZXJzQnlUeXBlLmdldChldmVudC5nZXRUeXBlKCkpO1xyXG4gICAgICAgIGlmIChoYW5kbGVycyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBldmVudEJ1cyA9IG5ldyBFdmVudEJ1cygpOyIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5OcGNNb3ZlbWVudENoYW5nZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge05wY1N0YXRlfSBmcm9tICcuLi9kb21haW4vbnBjLXN0YXRlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGNQbGFjZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBzdGF0ZTogTnBjU3RhdGU7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXJcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCBzdGF0ZTogTnBjU3RhdGUsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuTnBjUGxhY2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyTW92ZW1lbnRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG1vdmVtZW50OiBQbGF5ZXJNb3ZlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb3ZlbWVudDogUGxheWVyTW92ZW1lbnQpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnQgPSBtb3ZlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuUGxheWVyTW92ZW1lbnRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgejogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIsIHg6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnogPSB6O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5TdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImV4cG9ydCBjb25zdCBlbnVtIEdhbWVTdGF0ZVR5cGUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBzdGF0ZSByaWdodCB3aGVuIEphdmFTY3JpcHQgc3RhcnRzIHJ1bm5pbmcuIEluY2x1ZGVzIHByZWxvYWRpbmcuXHJcbiAgICAgKi9cclxuICAgIEluaXRpYWxpemluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFmdGVyIHByZWxvYWQgaXMgY29tcGxldGUgYW5kIGJlZm9yZSBtYWtpbmcgb2JqZWN0IHN0YXJ0KCkgY2FsbHMuXHJcbiAgICAgKi9cclxuICAgIFN0YXJ0aW5nLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyBhZnRlciBpbml0aWFsIG9iamVjdHMgc3RhcnQoKSBhbmQgbGlrZWx5IHdoZXJlIHRoZSBnYW1lIGlzIHdhaXRpbmcgb24gdGhlIHBsYXllcidzIGZpcnN0IGlucHV0LlxyXG4gICAgICovXHJcbiAgICBTdGFydGVkLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUgbWFpbiBnYW1lIGxvb3Agb2YgY29udHJvbGxpbmcgcGllY2VzLlxyXG4gICAgICovXHJcbiAgICBQbGF5aW5nLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5kIG9mIGdhbWUsIHNjb3JlIGlzIHNob3dpbmcsIG5vdGhpbmcgbGVmdCB0byBkby5cclxuICAgICAqL1xyXG4gICAgRW5kZWRcclxufVxyXG5cclxuY2xhc3MgR2FtZVN0YXRlIHtcclxuICAgIHByaXZhdGUgY3VycmVudDogR2FtZVN0YXRlVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBHYW1lU3RhdGVUeXBlLkluaXRpYWxpemluZzsgLy8gRGVmYXVsdCBzdGF0ZS5cclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50KCk6IEdhbWVTdGF0ZVR5cGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q3VycmVudChjdXJyZW50OiBHYW1lU3RhdGVUeXBlKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gY3VycmVudDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZ2FtZVN0YXRlID0gbmV3IEdhbWVTdGF0ZSgpOyIsImltcG9ydCB7cHJlbG9hZGVyfSBmcm9tICcuL3ByZWxvYWRlcic7XHJcbmltcG9ydCB7bW9kZWx9IGZyb20gJy4vbW9kZWwvbW9kZWwnO1xyXG5pbXBvcnQge3ZpZXd9IGZyb20gJy4vdmlldy92aWV3JztcclxuaW1wb3J0IHtjb250cm9sbGVyfSBmcm9tICcuL2NvbnRyb2xsZXIvY29udHJvbGxlcic7XHJcbmltcG9ydCB7R2FtZVN0YXRlVHlwZSwgZ2FtZVN0YXRlfSBmcm9tICcuL2dhbWUtc3RhdGUnO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIChldmVudDogYW55KSA9PiB7XHJcbiAgICBnYW1lU3RhdGUuc2V0Q3VycmVudChHYW1lU3RhdGVUeXBlLkluaXRpYWxpemluZyk7XHJcbiAgICBwcmVsb2FkZXIucHJlbG9hZChtYWluKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBtYWluKCkge1xyXG5cclxuICAgIC8vIFN0YXJ0dXAgaW4gcmV2ZXJzZSBNVkMgb3JkZXIgdG8gZW5zdXJlIHRoYXQgZXZlbnQgYnVzIGhhbmRsZXJzIGluIHRoZVxyXG4gICAgLy8gY29udHJvbGxlciBhbmQgdmlldyByZWNlaXZlIChhbnkpIHN0YXJ0IGV2ZW50cyBmcm9tIG1vZGVsLnN0YXJ0KCkuXHJcbiAgICBjb250cm9sbGVyLnN0YXJ0KCk7XHJcbiAgICB2aWV3LnN0YXJ0KCk7XHJcbiAgICBtb2RlbC5zdGFydCgpO1xyXG4gICAgXHJcbiAgICBnYW1lU3RhdGUuc2V0Q3VycmVudChHYW1lU3RhdGVUeXBlLlN0YXJ0ZWQpO1xyXG5cclxuICAgIGxldCBzdGVwID0gKCkgPT4ge1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcclxuXHJcbiAgICAgICAgbGV0IGVsYXBzZWQgPSBjYWxjdWxhdGVFbGFwc2VkKCk7XHJcbiAgICAgICAgY29udHJvbGxlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHZpZXcuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBtb2RlbC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfTtcclxuICAgIHN0ZXAoKTtcclxufVxyXG5cclxubGV0IGxhc3RTdGVwID0gRGF0ZS5ub3coKTtcclxuZnVuY3Rpb24gY2FsY3VsYXRlRWxhcHNlZCgpIHtcclxuICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSBsYXN0U3RlcDtcclxuICAgIGlmIChlbGFwc2VkID4gMTAwKSB7XHJcbiAgICAgICAgZWxhcHNlZCA9IDEwMDsgLy8gZW5mb3JjZSBzcGVlZCBsaW1pdFxyXG4gICAgfVxyXG4gICAgbGFzdFN0ZXAgPSBub3c7XHJcbiAgICByZXR1cm4gZWxhcHNlZDtcclxufSIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4vc2hhcGUnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtzaGFwZUZhY3Rvcnl9IGZyb20gJy4vc2hhcGUtZmFjdG9yeSc7XHJcbmltcG9ydCB7ZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7Q2VsbENoYW5nZUV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9jZWxsLWNoYW5nZS1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUVuZGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1lbmRlZC1ldmVudCc7XHJcblxyXG5jb25zdCBNQVhfUk9XUyA9IDE5OyAvLyBUb3AgMiByb3dzIGFyZSBvYnN0cnVjdGVkIGZyb20gdmlldy4gQWxzbywgc2VlIGxpZ2h0aW5nLWdyaWQudHMuXHJcbmNvbnN0IE1BWF9DT0xTID0gMTA7XHJcbmNvbnN0IFRFTVBfREVMQVlfTVMgPSA1MDA7XHJcblxyXG5leHBvcnQgY2xhc3MgQm9hcmQge1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50U2hhcGU6IFNoYXBlO1xyXG5cclxuICAgIHByaXZhdGUgbWF0cml4OiBDZWxsW11bXTtcclxuICAgIHByaXZhdGUgbXNUaWxsR3Jhdml0eVRpY2s6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZSA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMubWF0cml4ID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgTUFYX1JPV1M7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4W3Jvd0lkeF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF0gPSBuZXcgQ2VsbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1zVGlsbEdyYXZpdHlUaWNrID0gVEVNUF9ERUxBWV9NUztcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm1zVGlsbEdyYXZpdHlUaWNrIC09IGVsYXBzZWQ7XHJcbiAgICAgICAgaWYgKHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLm1zVGlsbEdyYXZpdHlUaWNrID0gVEVNUF9ERUxBWV9NUztcclxuICAgICAgICAgICAgdGhpcy5zdGVwTm93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBnaXZlcyBoaWdoIGxldmVsIHZpZXcgb2YgdGhlIG1haW4gZ2FtZSBsb29wLlxyXG4gICAgICovXHJcbiAgICBzdGVwTm93KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnRyeUdyYXZpdHkoKSkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVTaGFwZURvd24oKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUVuZGVkRXZlbnQoKTtcclxuICAgICAgICAgICAgdGhpcy5jb252ZXJ0U2hhcGVUb0NlbGxzKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja0ZvckdhbWVPdmVyKCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IEZpcmUgZ2FtZSBsb3NlIGV2ZW50XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUFueUZpbGxlZExpbmVzKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0ZvckdhbWVXaW4oKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IEZpcmUgZ2FtZSB3aW4gZXZlbnRcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydFNoYXBlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYmVnaW5OZXdHYW1lKCkge1xyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnNldFJhbmRvbVdoaXRlTGlnaHRzKCk7XHJcbiAgICAgICAgdGhpcy5zdGFydFNoYXBlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlTGVmdCgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlTGVmdCgpO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlUmlnaHQoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlTGVmdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZURvd24oKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZURvd25BbGxUaGVXYXkoKSB7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlRG93bigpO1xyXG4gICAgICAgIH0gd2hpbGUgKCF0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlU2hhcGVDbG9ja3dpc2UoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUucm90YXRlQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5yb3RhdGVDb3VudGVyQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjbGVhcigpIHtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VDZWxsQ29sb3Iocm93SWR4LCBjb2xJZHgsIENvbG9yLkVtcHR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFJhbmRvbVdoaXRlTGlnaHRzKCkge1xyXG4gICAgICAgIC8vIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzcyMjgzMjJcclxuICAgICAgICAvLyBmdW5jdGlvbiByYW5kb21JbnRGcm9tSW50ZXJ2YWwobWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqKG1heCAtIG1pbiArIDEpICsgbWluKTtcclxuICAgICAgICAvLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRvIGNoYW5nZSBhIHNpbmdsZSBjZWxsIGNvbG9yJ3MgYW5kIG5vdGlmeSBzdWJzY3JpYmVycyBhdCB0aGUgc2FtZSB0aW1lLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNoYW5nZUNlbGxDb2xvcihyb3dJZHg6IG51bWJlciwgY29sSWR4OiBudW1iZXIsIGNvbG9yOiBDb2xvcikge1xyXG4gICAgICAgIC8vIFRPRE86IE1heWJlIGJvdW5kcyBjaGVjayBoZXJlLlxyXG4gICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgIGNlbGwuc2V0Q29sb3IoY29sb3IpO1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhcnRTaGFwZSgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZSA9IHNoYXBlRmFjdG9yeS5uZXh0U2hhcGUoKTtcclxuICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdHJ5R3Jhdml0eSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgY2FuTW92ZURvd24gPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlRG93bigpO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgY2FuTW92ZURvd24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVVwKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBjYW5Nb3ZlRG93bjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVuZGVkIGZvciBjaGVja2luZyBvZiB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgY3VycmVudFxyXG4gICAgICogc2hhcGUgaGFzIGFueSBvdmVybGFwIHdpdGggZXhpc3RpbmcgY2VsbHMgdGhhdCBoYXZlIGNvbG9yLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbGxpc2lvbkRldGVjdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjb2xsaXNpb24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIHRoaXMuY3VycmVudFNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gb2Zmc2V0LnkgKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICAgICAgbGV0IGNvbCA9IG9mZnNldC54ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm93IDwgMCB8fCByb3cgPj0gdGhpcy5tYXRyaXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb2wgPCAwIHx8IGNvbCA+PSB0aGlzLm1hdHJpeFtyb3ddLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXRyaXhbcm93XVtjb2xdLmdldENvbG9yKCkgIT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb2xsaXNpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb252ZXJ0U2hhcGVUb0NlbGxzKCkge1xyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiB0aGlzLmN1cnJlbnRTaGFwZS5nZXRPZmZzZXRzKCkpIHtcclxuICAgICAgICAgICAgbGV0IHJvd0lkeCA9IG9mZnNldC55ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Um93KCk7XHJcbiAgICAgICAgICAgIGxldCBjb2xJZHggPSBvZmZzZXQueCArIHRoaXMuY3VycmVudFNoYXBlLmdldENvbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvd0lkeCA8IDAgfHwgcm93SWR4ID49IHRoaXMubWF0cml4Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb2xJZHggPCAwIHx8IGNvbElkeCA+PSB0aGlzLm1hdHJpeFtyb3dJZHhdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2VsbENvbG9yKHJvd0lkeCwgY29sSWR4LCB0aGlzLmN1cnJlbnRTaGFwZS5jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tGb3JHYW1lT3ZlcigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIFRPRE86IERvIGl0XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBbnlGaWxsZWRMaW5lcygpIHtcclxuICAgICAgICBsZXQgaGlnaGVzdExpbmVGaWxsZWQgPSAwOyAvLyBcImhpZ2hlc3RcIiBhcyBpbiB0aGUgaGlnaGVzdCBpbiB0aGUgYXJyYXksIHdoaWNoIGlzIHRoZSBsb3dlc3QgdmlzdWFsbHkgdG8gdGhlIHBsYXllci5cclxuXHJcbiAgICAgICAgLy8gVHJhdmVyc2UgYmFja3dhcmRzIHRvIHByZXZlbnQgcm93IGluZGV4IGZyb20gYmVjb21pbmcgb3V0IG9mIHN5bmMgd2hlbiByZW1vdmluZyByb3dzLlxyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IHRoaXMubWF0cml4Lmxlbmd0aCAtIDE7IHJvd0lkeCA+PSAwOyByb3dJZHgtLSkge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgbGV0IGZpbGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNlbGwgb2Ygcm93KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChmaWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyb3dJZHggPiBoaWdoZXN0TGluZUZpbGxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hlc3RMaW5lRmlsbGVkID0gcm93SWR4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBbmRDb2xsYXBzZShyb3dJZHgpO1xyXG4gICAgICAgICAgICAgICAgcm93SWR4ID0gcm93SWR4ICsgMTsgLy8gVGhpcyBpcyBhIHJlYWxseSwgcmVhbGx5IHNoYWt5IHdvcmthcm91bmQuIEl0IHByZXZlbnRzIHRoZSBuZXh0IHJvdyBmcm9tIGdldHRpbmcgc2tpcHBlZCBvdmVyIG9uIG5leHQgbG9vcC5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm90aWZ5IGZvciBhbGwgY2VsbHMgZnJvbSAwIHRvIHRoZSBoaWdoZXN0TGluZUZpbGxlZCwgd2hpY2ggY291bGQgYmUgMCBpZiBubyByb3dzIHdlcmUgZmlsbGVkLlxyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8PSBoaWdoZXN0TGluZUZpbGxlZDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyByZW1vdmVzIHRoZSBvbGQgcm93IGFuZCBwdXRzIGEgbmV3IHJvdyBpbiBpdHMgcGxhY2UgYXQgcG9zaXRpb24gMCwgd2hpY2ggaXMgdGhlIGhpZ2hlc3QgdmlzdWFsbHkgdG8gdGhlIHBsYXllci5cclxuICAgICAqIERlbGVnYXRlcyBjZWxsIG5vdGlmaWNhdGlvbiB0byB0aGUgY2FsbGluZyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVtb3ZlQW5kQ29sbGFwc2Uocm93SWR4OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2Uocm93SWR4LCAxKTtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2UoMCwgMCwgW10pO1xyXG4gICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFswXVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGVja0ZvckdhbWVXaW4oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBUT0RPOiBEbyBpdFxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KHRoaXMuY3VycmVudFNoYXBlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaXJlQWN0aXZlU2hhcGVFbmRlZEV2ZW50KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEFjdGl2ZVNoYXBlRW5kZWRFdmVudCh0aGlzLmN1cnJlbnRTaGFwZSkpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBib2FyZCA9IG5ldyBCb2FyZCgpOyIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4vc2hhcGUnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5cclxuY2xhc3MgU2hhcGVJIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgc3Bhd25Db2x1bW4gPSAzO1xyXG4gICAgY29sb3IgPSBDb2xvci5DeWFuO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gNDtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVKIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5CbHVlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlTCBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuT3JhbmdlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMSxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDEsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVPIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5ZZWxsb3c7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSA0O1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZVMgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkdyZWVuO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVUIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5QdXJwbGU7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZVogZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLlJlZDtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlRmFjdG9yeSB7XHJcbiAgICBwcml2YXRlIGJhZzogU2hhcGVbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnJlZmlsbEJhZygpO1xyXG4gICAgfVxyXG5cclxuICAgIG5leHRTaGFwZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5iYWcubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZpbGxCYWcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFnLnBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVmaWxsQmFnKCkge1xyXG4gICAgICAgIHRoaXMuYmFnID0gW1xyXG4gICAgICAgICAgICBuZXcgU2hhcGVJKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZUooKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlTCgpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVPKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZVMoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlVCgpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVaKClcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICAvLyBGaXNoZXItWWF0ZXMgU2h1ZmZsZSwgYmFzZWQgb246IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI0NTA5NzZcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5iYWcubGVuZ3RoXHJcbiAgICAgICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cclxuICAgICAgICB3aGlsZSAoMCAhPT0gaWR4KSB7XHJcbiAgICAgICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgICAgICAgICBsZXQgcm5kSWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaWR4KTtcclxuICAgICAgICAgICAgaWR4IC09IDE7XHJcbiAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICAgICAgbGV0IHRlbXBWYWwgPSB0aGlzLmJhZ1tpZHhdO1xyXG4gICAgICAgICAgICB0aGlzLmJhZ1tpZHhdID0gdGhpcy5iYWdbcm5kSWR4XTtcclxuICAgICAgICAgICAgdGhpcy5iYWdbcm5kSWR4XSA9IHRlbXBWYWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2hhcGVGYWN0b3J5ID0gbmV3IFNoYXBlRmFjdG9yeSgpO1xyXG4iLCJpbXBvcnQge0NlbGxPZmZzZXR9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuXHJcbmNvbnN0IFNQQVdOX0NPTCA9IDM7IC8vIExlZnQgc2lkZSBvZiBtYXRyaXggc2hvdWxkIGNvcnJlc3BvbmQgdG8gdGhpcy5cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTaGFwZSB7XHJcbiAgICBhYnN0cmFjdCByZWFkb25seSBjb2xvcjogQ29sb3I7XHJcbiAgICBhYnN0cmFjdCByZWFkb25seSB2YWx1ZXNQZXJSb3c6IG51bWJlcjtcclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBtYXRyaWNlczogUmVhZG9ubHlBcnJheTxSZWFkb25seUFycmF5PG51bWJlcj4+O1xyXG5cclxuICAgIHByaXZhdGUgY3VycmVudE1hdHJpeEluZGV4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJvdzogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjb2w6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IDA7IC8vIFRPRE86IEVuc3VyZSBwb3NpdGlvbiAwIGlzIHRoZSBzcGF3biBwb3NpdGlvblxyXG4gICAgICAgIHRoaXMucm93ID0gMDtcclxuICAgICAgICB0aGlzLmNvbCA9IFNQQVdOX0NPTDtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlTGVmdCgpIHtcclxuICAgICAgICB0aGlzLmNvbC0tO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICB0aGlzLmNvbCsrO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICB0aGlzLnJvdy0tO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVEb3duKCkge1xyXG4gICAgICAgIHRoaXMucm93Kys7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQ291bnRlckNsb2Nrd2lzZSgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCAtPSAxO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQXJyYXlCb3VuZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVDbG9ja3dpc2UoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggKz0gMTtcclxuICAgICAgICB0aGlzLmVuc3VyZUFycmF5Qm91bmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um93KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvdztcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2woKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvd0NvdW50KCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy5nZXRDdXJyZW50TWF0cml4KCkubGVuZ3RoIC8gdGhpcy52YWx1ZXNQZXJSb3cpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE9mZnNldHMoKTogQ2VsbE9mZnNldFtdIHtcclxuICAgICAgICBsZXQgbWF0cml4ID0gdGhpcy5nZXRDdXJyZW50TWF0cml4KCk7XHJcbiAgICAgICAgbGV0IG9mZnNldHM6IENlbGxPZmZzZXRbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IG1hdHJpeC5sZW5ndGg7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG1hdHJpeFtpZHhdO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gaWR4ICUgdGhpcy52YWx1ZXNQZXJSb3c7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IE1hdGguZmxvb3IoaWR4IC8gdGhpcy52YWx1ZXNQZXJSb3cpO1xyXG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IG5ldyBDZWxsT2Zmc2V0KHgsIHkpO1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0cy5wdXNoKG9mZnNldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9mZnNldHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50TWF0cml4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hdHJpY2VzW3RoaXMuY3VycmVudE1hdHJpeEluZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVuc3VyZUFycmF5Qm91bmRzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggPSB0aGlzLm1hdHJpY2VzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA+PSB0aGlzLm1hdHJpY2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtib2FyZH0gZnJvbSAnLi9ib2FyZC9ib2FyZCc7XHJcbmltcG9ydCB7bnBjTWFuYWdlcn0gZnJvbSAnLi9ucGMvbnBjLW1hbmFnZXInO1xyXG5pbXBvcnQge2V2ZW50QnVzLCBFdmVudFR5cGV9IGZyb20gJy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50RXZlbnR9IGZyb20gJy4uL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudCc7XHJcblxyXG5jbGFzcyBNb2RlbCB7XHJcbiAgICBcclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5QbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZSwgKGV2ZW50OiBQbGF5ZXJNb3ZlbWVudEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUGxheWVyTW92ZW1lbnQoZXZlbnQubW92ZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBib2FyZC5zdGFydCgpO1xyXG4gICAgICAgIG5wY01hbmFnZXIuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgYm9hcmQuYmVnaW5OZXdHYW1lKCk7IC8vIFRPRE86IEluc3RlYWQsIHN0YXJ0IGdhbWUgd2hlbiBwbGF5ZXIgaGl0cyBhIGtleSBmaXJzdC5cclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGJvYXJkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgbnBjTWFuYWdlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlUGxheWVyTW92ZW1lbnQobW92ZW1lbnQ6IFBsYXllck1vdmVtZW50KSB7XHJcbiAgICAgICAgc3dpdGNoIChtb3ZlbWVudCkge1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LkxlZnQ6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5SaWdodDpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Eb3duOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlRG93bigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuRHJvcDpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZURvd25BbGxUaGVXYXkoKTtcclxuICAgICAgICAgICAgICAgIGJvYXJkLnN0ZXBOb3coKTsgLy8gcHJldmVudCBhbnkgb3RoZXIga2V5c3Ryb2tlcyB0aWxsIG5leHQgdGlja1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuUm90YXRlQ2xvY2t3aXNlOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQucm90YXRlU2hhcGVDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VuaGFuZGxlZCBtb3ZlbWVudCcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBtb2RlbCA9IG5ldyBNb2RlbCgpOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0L2xpYi9saWIuZXM2LmQudHMnLz5cclxuXHJcbmltcG9ydCB7TnBjfSBmcm9tICcuL25wYydcclxuaW1wb3J0IHtOcGNTdGF0ZX0gZnJvbSAnLi4vLi4vZG9tYWluL25wYy1zdGF0ZSc7XHJcbmltcG9ydCB7ZXZlbnRCdXMsIEV2ZW50VHlwZX0gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9zdGFuZGVlLW1vdmVtZW50LWVuZGVkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNQbGFjZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLXBsYWNlZC1ldmVudCc7XHJcblxyXG4vLyBTdGFydGluZyBwb3NpdGlvbiBjb3VudHMgdXNlZCBpbiBpbml0aWFsaXphdGlvbi5cclxuY29uc3QgVE9UQUxfTlBDUyA9IDIwO1xyXG5cclxuY2xhc3MgTnBjTWFuYWdlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBucGNzOiBNYXA8bnVtYmVyLCBOcGM+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubnBjcyA9IG5ldyBNYXA8bnVtYmVyLCBOcGM+KCk7XHJcbiAgICAgICAgZm9yIChsZXQgbnBjSWR4ID0gMDsgbnBjSWR4IDwgVE9UQUxfTlBDUzsgbnBjSWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IG5wYyA9IG5ldyBOcGMoKTtcclxuICAgICAgICAgICAgdGhpcy5ucGNzLnNldChucGMuaWQsIG5wYyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5TdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZSwgKGV2ZW50OiBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubnBjcy5mb3JFYWNoKChucGM6IE5wYykgPT4ge1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IChNYXRoLnJhbmRvbSgpICogMjApIC0gNTtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gKE1hdGgucmFuZG9tKCkgKiAyMCkgKyA1O1xyXG4gICAgICAgICAgICAgICAgbnBjLnN0YXJ0KHgsIHkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiBNb3ZlIHRoaXMgZWxzZXdoZXJlOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IChNYXRoLnJhbmRvbSgpICogMjApIC0gNTtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gKE1hdGgucmFuZG9tKCkgKiAyMCkgKyA1O1xyXG4gICAgICAgICAgICAgICAgbnBjLmJlZ2luV2Fsa2luZ1RvKHgsIHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm5wY3MuZm9yRWFjaCgobnBjOiBOcGMpID0+IHtcclxuICAgICAgICAgICAgbnBjLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KGV2ZW50OiBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IG5wYyA9IHRoaXMubnBjcy5nZXQoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIGlmIChucGMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgeCA9IGV2ZW50Lng7XHJcbiAgICAgICAgICAgIGxldCB5ID0gZXZlbnQuejtcclxuICAgICAgICAgICAgbnBjLnVwZGF0ZVBvc2l0aW9uKHgsIHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgbnBjTWFuYWdlciA9IG5ldyBOcGNNYW5hZ2VyKCk7IiwiaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge05wY1BsYWNlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtcGxhY2VkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNNb3ZlbWVudENoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLW1vdmVtZW50LWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY1N0YXRlfSBmcm9tICcuLi8uLi9kb21haW4vbnBjLXN0YXRlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGMge1xyXG4gICAgcmVhZG9ubHkgaWQ6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRlOiBOcGNTdGF0ZTtcclxuICAgIHByaXZhdGUgdGltZUluU3RhdGU6IG51bWJlcjtcclxuXHJcbiAgICAvLyBcIkxhc3RcIiBhcyBpbiB0aGUgbGFzdCBrbm93biBjb29yZGluYXRlLCBiZWNhdXNlIGl0IGNvdWxkIGJlIGN1cnJlbnRseSBpbi1tb3Rpb24uXHJcbiAgICBwcml2YXRlIHhsYXN0OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHlsYXN0OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IE5wY1N0YXRlLklkbGU7XHJcbiAgICAgICAgdGhpcy50aW1lSW5TdGF0ZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMueGxhc3QgPSAwO1xyXG4gICAgICAgIHRoaXMueWxhc3QgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy54bGFzdCA9IHg7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9IHk7XHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgTnBjUGxhY2VkRXZlbnQodGhpcy5pZCwgdGhpcy5zdGF0ZSwgeCwgeSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIGJ5IHRoZSBOUEMgbWFuYWdlciByYXRoZXIgdGhhbiB0cmFja3MgdGhhdCByZWZlcmVuY2UgdGhlbS5cclxuICAgICAqL1xyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnRpbWVJblN0YXRlICs9IGVsYXBzZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgdHJhbnNpdGlvblRvKHN0YXRlOiBOcGNTdGF0ZSkge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLnRpbWVJblN0YXRlID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBiZWdpbldhbGtpbmdUbyh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KHRoaXMuaWQsIHgsIHkpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNpZ25pZmllcyB0aGUgZW5kIG9mIGEgd2Fsay5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlUG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnhsYXN0ID0geDtcclxuICAgICAgICB0aGlzLnlsYXN0ID0geTtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25UbyhOcGNTdGF0ZS5JZGxlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRTdGF0ZSgpOiBOcGNTdGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge3N0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZX0gZnJvbSAnLi92aWV3L3N0YW5kZWUvc3RhbmRlZS1hbmltYXRpb24tdGV4dHVyZS1iYXNlJztcclxuXHJcbmNsYXNzIFByZWxvYWRlciB7XHJcbiAgICBcclxuICAgIHByZWxvYWQoY2FsbGJhY2s6ICgpID0+IGFueSkge1xyXG4gICAgICAgIHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZS5wcmVsb2FkKGNhbGxiYWNrKTtcclxuICAgICAgICAvLyBUT0RPOiBHb2luZyB0byBoYXZlIGEgcGFyYWxsZWxpc20gbWVjaGFuaXNtIGFmdGVyIGFkZGluZyBtb3JlIHRvIHRoaXMuXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHByZWxvYWRlciA9IG5ldyBQcmVsb2FkZXIoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcbmRlY2xhcmUgY29uc3QgVFdFRU46IGFueTtcclxuXHJcbi8vIFRPRE86IE9ubHkgdGhlIDNyZCBmbG9vciBmcm9tIHRoZSB0b3AgYW5kIGJlbG93IGFyZSB2aXNpYmxlLiBBbHNvLCBzZWUgYm9hcmQudHMuXHJcbmV4cG9ydCBjb25zdCBGTE9PUl9DT1VOVCA9IDE3O1xyXG5leHBvcnQgY29uc3QgUEFORUxfQ09VTlRfUEVSX0ZMT09SID0gMTA7XHJcblxyXG5jb25zdCBQT0lOVF9MSUdIVF9DT1VOVCA9IDQ7XHJcblxyXG5jbGFzcyBFbWlzc2l2ZUludGVuc2l0eSB7XHJcbiAgICB2YWx1ZTogbnVtYmVyO1xyXG59XHJcblxyXG5jbGFzcyBMaWdodGluZ0dyaWQge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHBhbmVsczogYW55W11bXTtcclxuICAgIHByaXZhdGUgcG9pbnRMaWdodHM6IGFueVtdO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50UG9pbnRMaWdodElkeDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgcHVsc2VUd2VlbjogYW55O1xyXG4gICAgcHJpdmF0ZSBwdWxzZVR3ZWVuRWxhcHNlZDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBlbWlzc2l2ZUludGVuc2l0eTogRW1pc3NpdmVJbnRlbnNpdHk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICB0aGlzLnBhbmVscyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGZsb29ySWR4ID0gMDsgZmxvb3JJZHggPCBGTE9PUl9DT1VOVDsgZmxvb3JJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBhbmVsc1tmbG9vcklkeF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFuZWxJZHggPSAwOyBwYW5lbElkeCA8IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjsgcGFuZWxJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDAuNiwgMC42LCAwLjEpOyAvLyBUT0RPOiBjbG9uZSgpID9cclxuICAgICAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7Y29sb3I6IDB4ZjJlOWQ4fSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFuZWwgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB4ID0gcGFuZWxJZHg7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IGZsb29ySWR4ICsgMTsgLy8gT2Zmc2V0IHVwIDEgYmVjYXVzZSBncm91bmQgaXMgeSA9IDAuXHJcbiAgICAgICAgICAgICAgICBsZXQgeiA9IDA7XHJcbiAgICAgICAgICAgICAgICBwYW5lbC5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYW5lbHNbZmxvb3JJZHhdW3BhbmVsSWR4XSA9IHBhbmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvaW50TGlnaHRzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgY291bnQgPSAwOyBjb3VudCA8IFBPSU5UX0xJR0hUX0NPVU5UOyBjb3VudCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwb2ludExpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmZjAwZmYsIDEuNzUsIDEuMjUpO1xyXG4vLyBUaGVzZSB0d28gbGluZXMgYXJlIGZvciBkZWJ1Z2dpbmc6XHJcbi8vIGxldCBzcGhlcmUgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoIDAuMSwgMTYsIDggKTtcclxuLy8gcG9pbnRMaWdodC5hZGQoIG5ldyBUSFJFRS5NZXNoKHNwaGVyZSwgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtjb2xvcjogMHhmZmZmZmZ9KSkpO1xyXG4gICAgICAgICAgICBwb2ludExpZ2h0LnBvc2l0aW9uLnNldCgtMTAwLCAtMTAwLCAwLjMzKTsgLy8gSnVzdCBnZXQgaXQgb3V0IG9mIHRoZSB3YXkgZm9yIG5vd1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50TGlnaHRzLnB1c2gocG9pbnRMaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRQb2ludExpZ2h0SWR4ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuID0gbnVsbDtcclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5ID0gbmV3IEVtaXNzaXZlSW50ZW5zaXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRvIGZpdCBhZ2FpbnN0IGJ1aWxkaW5nLlxyXG4gICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24uc2V0KDEuOSwgMy44LCAtMS41NSk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5zY2FsZS5zZXQoMC43LCAxLjAsIDEpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBmbG9vciBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiBmbG9vcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cC5hZGQocGFuZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBwb2ludExpZ2h0IG9mIHRoaXMucG9pbnRMaWdodHMpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5hZGQocG9pbnRMaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNYWtlIGNlbGxzIGFwcGVhciB0byBwdWxzZS5cclxuICAgICAgICB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5LnZhbHVlID0gMC4zMztcclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5lbWlzc2l2ZUludGVuc2l0eSlcclxuICAgICAgICAgICAgLnRvKHt2YWx1ZTogMS4wfSwgNzUwKVxyXG4gICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5TaW51c29pZGFsLkluT3V0KVxyXG4gICAgICAgICAgICAueW95byh0cnVlKVxyXG4gICAgICAgICAgICAucmVwZWF0KEluZmluaXR5KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0ZXBQdWxzZShlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICBzd2l0Y2hSb29tTGlnaHQoZmxvb3JJZHg6IG51bWJlciwgcGFuZWxJZHg6IG51bWJlciwgY29sb3I6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBwYW5lbCA9IHRoaXMucGFuZWxzW2Zsb29ySWR4XVtwYW5lbElkeF07XHJcbiAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KGNvbG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBzZW5kUG9pbnRMaWdodFRvKGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIsIGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcG9pbnRMaWdodCA9IHRoaXMuZ2V0TmV4dFBvaW50TGlnaHQoKTtcclxuICAgICAgICBwb2ludExpZ2h0LmNvbG9yLnNldEhleChjb2xvcik7XHJcblxyXG4gICAgICAgIGxldCB4ID0gcGFuZWxJZHg7XHJcbiAgICAgICAgbGV0IHkgPSBmbG9vcklkeCArIDE7IC8vIE9mZnNldCB1cCAxIGJlY2F1c2UgZ3JvdW5kIGlzIHkgPSAwLlxyXG4gICAgICAgIGxldCB6ID0gMC4zMztcclxuICAgICAgICBwb2ludExpZ2h0LnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRQb2ludExpZ2h0KCkge1xyXG4gICAgICAgIGxldCBwb2ludExpZ2h0ID0gdGhpcy5wb2ludExpZ2h0c1t0aGlzLmN1cnJlbnRQb2ludExpZ2h0SWR4XTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQb2ludExpZ2h0SWR4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBvaW50TGlnaHRJZHggPj0gUE9JTlRfTElHSFRfQ09VTlQpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UG9pbnRMaWdodElkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwb2ludExpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcFB1bHNlKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLnB1bHNlVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLnB1bHNlVHdlZW5FbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMucHVsc2VUd2Vlbi51cGRhdGUodGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGZsb29yIG9mIHRoaXMucGFuZWxzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhbmVsIG9mIGZsb29yKSB7XHJcbiAgICAgICAgICAgICAgICBwYW5lbC5tYXRlcmlhbC5lbWlzc2l2ZUludGVuc2l0eSA9IHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkudmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGxpZ2h0aW5nR3JpZCA9IG5ldyBMaWdodGluZ0dyaWQoKTsiLCJpbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7Q2VsbENoYW5nZUV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9jZWxsLWNoYW5nZS1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUVuZGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7bGlnaHRpbmdHcmlkLCBGTE9PUl9DT1VOVCwgUEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuL2xpZ2h0aW5nLWdyaWQnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5pbXBvcnQge0NlbGxPZmZzZXR9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuXHJcbmNsYXNzIFN3aXRjaGJvYXJkIHtcclxuICAgIFxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkFjdGl2ZVNoYXBlRW5kZWRFdmVudFR5cGUsIChldmVudDogQWN0aXZlU2hhcGVFbmRlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aXZlU2hhcGVFbmRlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQ2VsbENoYW5nZUV2ZW50VHlwZSwgKGV2ZW50OiBDZWxsQ2hhbmdlRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDZWxsQ2hhbmdlRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsaWdodGluZ0dyaWQuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgZmxvb3JJZHggPSB0aGlzLmNvbnZlcnRSb3dUb0Zsb29yKGV2ZW50LnNoYXBlLmdldFJvdygpKTtcclxuICAgICAgICBsZXQgcGFuZWxJZHggPSBldmVudC5zaGFwZS5nZXRDb2woKTtcclxuICAgICAgICBsZXQgY29sb3IgPSB0aGlzLmNvbnZlcnRDb2xvcihldmVudC5zaGFwZS5jb2xvcik7XHJcblxyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiBldmVudC5zaGFwZS5nZXRPZmZzZXRzKCkpIHtcclxuICAgICAgICAgICAgbGV0IG9mZnNldEZsb29ySWR4ID0gZmxvb3JJZHggLSBvZmZzZXQueTtcclxuICAgICAgICAgICAgLy8gaWYgKG9mZnNldEZsb29ySWR4ID49IEZMT09SX0NPVU5UKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb250aW51ZTsgLy8gU2tpcCBvYnN0cnVjdGVkIGZsb29yc1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXRQYW5lbElkeCA9IHBhbmVsSWR4ICsgb2Zmc2V0Lng7XHJcbiAgICAgICAgICAgIGxpZ2h0aW5nR3JpZC5zZW5kUG9pbnRMaWdodFRvKG9mZnNldEZsb29ySWR4LCBvZmZzZXRQYW5lbElkeCwgY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUFjdGl2ZVNoYXBlRW5kZWRFdmVudChldmVudDogQWN0aXZlU2hhcGVFbmRlZEV2ZW50KSB7XHJcbiAgICAgICAgLy8gVE9ETzogTWF5YmUgc2V0IHNvbWUgc29ydCBvZiBhbmltYXRpb24gaW4gbW90aW9uXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDZWxsQ2hhbmdlRXZlbnQoZXZlbnQ6IENlbGxDaGFuZ2VFdmVudCkge1xyXG4gICAgICAgIGxldCBmbG9vcklkeCA9IHRoaXMuY29udmVydFJvd1RvRmxvb3IoZXZlbnQucm93KTtcclxuICAgICAgICBpZiAoZmxvb3JJZHggPj0gRkxPT1JfQ09VTlQpIHtcclxuICAgICAgICAgICAgcmV0dXJuOyAvLyBTa2lwIG9ic3RydWN0ZWQgZmxvb3JzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcGFuZWxJZHggPSBldmVudC5jb2w7XHJcbiAgICAgICAgbGV0IGNvbG9yID0gdGhpcy5jb252ZXJ0Q29sb3IoZXZlbnQuY2VsbC5nZXRDb2xvcigpKTtcclxuICAgICAgICBsaWdodGluZ0dyaWQuc3dpdGNoUm9vbUxpZ2h0KGZsb29ySWR4LCBwYW5lbElkeCwgY29sb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBjZWxsIHJvdy9jb2wgY29vcmRpbmF0ZXMgdG8gZmxvb3IvcGFuZWwgY29vcmRpbmF0ZXMuXHJcbiAgICAgKiBBY2NvdW50IGZvciB0aGUgdHdvIGZsb29ycyB0aGF0IGFyZSBvYnN0cnVjdGVkIGZyb20gdmlldy4gKD8pXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY29udmVydFJvd1RvRmxvb3Iocm93OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgdGhpbmcgPSAoRkxPT1JfQ09VTlQgLSByb3cpICsgMTtcclxuICAgICAgICByZXR1cm4gdGhpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb252ZXJ0Q29sb3IoY29sb3I6IENvbG9yKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgdmFsdWU6IG51bWJlcjtcclxuICAgICAgICBzd2l0Y2ggKGNvbG9yKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuQ3lhbjpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgwMGZmZmY7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5ZZWxsb3c6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZmZjAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuUHVycGxlOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDgwMDA4MDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkdyZWVuOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDAwODAwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLlJlZDpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhmZjAwMDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5CbHVlOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDAwMDBmZjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLk9yYW5nZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhmZmE1MDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5XaGl0ZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhmZmZmZmY7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLy8gRGVmYXVsdCBvciBtaXNzaW5nIGNhc2UgaXMgYmxhY2suXHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuRW1wdHk6XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4MDAwMDAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc3dpdGNoYm9hcmQgPSBuZXcgU3dpdGNoYm9hcmQoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG4vLyBEaW1lbnNpb25zIG9mIHRoZSBlbnRpcmUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVTSEVFVF9XSURUSCAgID0gMjU2O1xyXG5leHBvcnQgY29uc3QgU1BSSVRFU0hFRVRfSEVJR0hUICA9IDUxMjtcclxuXHJcbi8vIERpbWVuc2lvbnMgb2Ygb25lIGZyYW1lIHdpdGhpbiB0aGUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9XSURUSCAgID0gNDg7XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9IRUlHSFQgID0gNzI7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyIHtcclxuXHJcbiAgICByZWFkb25seSB0ZXh0dXJlOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IodGV4dHVyZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlIHtcclxuXHJcbiAgICBwcml2YXRlIHRleHR1cmU6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnRleHR1cmUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoY2FsbGJhY2s6ICgpID0+IGFueSkge1xyXG4gICAgICAgIGxldCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudC5wbmcnLCAodGV4dHVyZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGxvd3MgZm9yIHRleHR1cmUgZmxpcHBpbmcsIHdoZW4gbmVjZXNzYXJ5LlxyXG4gICAgICAgICAgICAvLyBOT1RFOiBUbyBkbyBzbywgc2V0IHJlcGVhdC54ICo9IC0xIGFuZCBvZmZzZXQueCAqPSAtMS5cclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlLndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XHJcblxyXG4gICAgICAgICAgICAvLyBIYXZlIGl0IHNob3cgb25seSBvbmUgZnJhbWUgYXQgYSB0aW1lOlxyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmUucmVwZWF0LnNldChcclxuICAgICAgICAgICAgICAgIEZSQU1FX1dJRFRIICAvIFNQUklURVNIRUVUX1dJRFRILFxyXG4gICAgICAgICAgICAgICAgRlJBTUVfSEVJR0hUIC8gU1BSSVRFU0hFRVRfSEVJR0hUXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG5ld0luc3RhbmNlKCk6IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlciB7XHJcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMudGV4dHVyZS5jbG9uZSgpOyAvLyBUaGlzIGlzIHRoZSBiYW5lIG9mIG15IGV4aXN0ZW5jZS5cclxuICAgICAgICBsZXQgdGV4dHVyZSA9IHRoaXMudGV4dHVyZS5jbG9uZSgpO1xyXG4gICAgICAgIHJldHVybiBuZXcgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyKHRleHR1cmUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHR1cmUodGV4dHVyZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlID0gbmV3IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZSgpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7U3RhbmRlZX0gZnJvbSAnLi9zdGFuZGVlJztcclxuaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge05wY1BsYWNlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtcGxhY2VkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNNb3ZlbWVudENoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLW1vdmVtZW50LWNoYW5nZWQtZXZlbnQnO1xyXG5cclxuY29uc3QgWV9PRkZTRVQgPSAwLjc1OyAvLyBTZXRzIHRoZWlyIGZlZXQgb24gdGhlIGdyb3VuZCBwbGFuZS5cclxuXHJcbmNsYXNzIFN0YW5kZWVNYW5hZ2VyIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgc3RhbmRlZXM6IE1hcDxudW1iZXIsIFN0YW5kZWU+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGFuZGVlcyA9IG5ldyBNYXA8bnVtYmVyLCBTdGFuZGVlPigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24uc2V0WShZX09GRlNFVCk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5OcGNQbGFjZWRFdmVudFR5cGUsIChldmVudDogTnBjUGxhY2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVOcGNQbGFjZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5OcGNNb3ZlbWVudENoYW5nZWRFdmVudFR5cGUsIChldmVudDogTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVOcGNNb3ZlbWVudENoYW5nZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0YW5kZWVzLmZvckVhY2goKHN0YW5kZWU6IFN0YW5kZWUpID0+IHtcclxuICAgICAgICAgICAgc3RhbmRlZS5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlTnBjUGxhY2VkRXZlbnQoZXZlbnQ6IE5wY1BsYWNlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IHN0YW5kZWUgPSBuZXcgU3RhbmRlZShldmVudC5ucGNJZCk7XHJcbiAgICAgICAgc3RhbmRlZS5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHN0YW5kZWUuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuc3RhbmRlZXMuc2V0KHN0YW5kZWUubnBjSWQsIHN0YW5kZWUpO1xyXG5cclxuICAgICAgICBsZXQgeCA9IGV2ZW50Lng7XHJcbiAgICAgICAgbGV0IHogPSBldmVudC55O1xyXG4gICAgICAgIHRoaXMubW92ZVRvSW5pdGlhbFBvc2l0aW9uKHN0YW5kZWUsIHgsIHopO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbW92ZVRvSW5pdGlhbFBvc2l0aW9uKHN0YW5kZWU6IFN0YW5kZWUsIHg6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gVE9ETzogVXNlIGV2ZW50LngsIGV2ZW50Lnkgd2l0aCBzY2FsaW5nIHRvIGRldGVybWluZSBkZXN0aW5hdGlvblxyXG4gICAgICAgIHN0YW5kZWUubW92ZVRvKHgseik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOcGNNb3ZlbWVudENoYW5nZWRFdmVudChldmVudDogTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IHRoaXMuc3RhbmRlZXMuZ2V0KGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBpZiAoc3RhbmRlZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICAgICAgbGV0IHogPSBldmVudC55O1xyXG4gICAgICAgICAgICBzdGFuZGVlLndhbGtUbyh4LCB6LCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHN0YW5kZWVNYW5hZ2VyID0gbmV3IFN0YW5kZWVNYW5hZ2VyKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtcclxuICAgIFNQUklURVNIRUVUX1dJRFRILFxyXG4gICAgU1BSSVRFU0hFRVRfSEVJR0hULFxyXG4gICAgRlJBTUVfV0lEVEgsXHJcbiAgICBGUkFNRV9IRUlHSFQsXHJcbiAgICBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXIsXHJcbiAgICBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2V9XHJcbmZyb20gJy4vc3RhbmRlZS1hbmltYXRpb24tdGV4dHVyZS1iYXNlJztcclxuXHJcbmNvbnN0IFNUQU5EQVJEX0RFTEFZID0gMjI1O1xyXG5jb25zdCBXQUxLX1VQX09SX0RPV05fREVMQVkgPSBNYXRoLmZsb29yKFNUQU5EQVJEX0RFTEFZICogKDIvMykpOyAvLyBCZWNhdXNlIHVwL2Rvd24gd2FsayBjeWNsZXMgaGF2ZSBtb3JlIGZyYW1lcy4gXHJcblxyXG5jbGFzcyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUge1xyXG5cclxuICAgIHJlYWRvbmx5IHJvdzogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgY29sOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3Iocm93OiBudW1iZXIsIGNvbDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5yb3cgPSByb3c7IFxyXG4gICAgICAgIHRoaXMuY29sID0gY29sO1xyXG4gICAgfVxyXG59XHJcblxyXG5lbnVtIFN0YW5kZWVBbmltYXRpb25UeXBlIHtcclxuICAgIFN0YW5kVXAsXHJcbiAgICBTdGFuZERvd24sXHJcbiAgICBTdGFuZExlZnQsXHJcbiAgICBTdGFuZFJpZ2h0LFxyXG4gICAgV2Fsa1VwLFxyXG4gICAgV2Fsa0Rvd24sXHJcbiAgICBXYWxrTGVmdCxcclxuICAgIFdhbGtSaWdodCxcclxuICAgIENoZWVyVXAsXHJcbiAgICBQYW5pY1VwLFxyXG4gICAgUGFuaWNEb3duXHJcbn1cclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBmcmFtZXM6IFN0YW5kZWVBbmltYXRpb25GcmFtZVtdO1xyXG4gICAgcmVhZG9ubHkgZGVsYXlzOiBudW1iZXJbXTtcclxuICAgIHJlYWRvbmx5IG5leHQ6IFN0YW5kZWVBbmltYXRpb25UeXBlO1xyXG5cclxuICAgIHByaXZhdGUgY3VycmVudEZyYW1lSWR4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBmaW5pc2hlZDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihuZXh0OiBTdGFuZGVlQW5pbWF0aW9uVHlwZSkge1xyXG4gICAgICAgIHRoaXMuZnJhbWVzID0gW107XHJcbiAgICAgICAgdGhpcy5kZWxheXMgPSBbXTtcclxuICAgICAgICB0aGlzLm5leHQgPSBuZXh0O1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZUlkeCA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZmluaXNoZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdXNoKGZyYW1lOiBTdGFuZGVlQW5pbWF0aW9uRnJhbWUsIGRlbGF5ID0gU1RBTkRBUkRfREVMQVkpIHtcclxuICAgICAgICB0aGlzLmZyYW1lcy5wdXNoKGZyYW1lKTtcclxuICAgICAgICB0aGlzLmRlbGF5cy5wdXNoKGRlbGF5KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZyYW1lVGltZUVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCA+PSB0aGlzLmRlbGF5c1t0aGlzLmN1cnJlbnRGcmFtZUlkeF0pIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEZyYW1lSWR4Kys7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRGcmFtZUlkeCA+PSB0aGlzLmZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEZyYW1lSWR4ID0gMDsgLy8gU2hvdWxkbid0IGJlIHVzZWQgYW55bW9yZSwgYnV0IHByZXZlbnQgb3V0LW9mLWJvdW5kcyBhbnl3YXkuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmlzaGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc0ZpbmlzaGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnRGcmFtZSgpOiBTdGFuZGVlQW5pbWF0aW9uRnJhbWUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZyYW1lc1t0aGlzLmN1cnJlbnRGcmFtZUlkeF07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlU3ByaXRlV3JhcHBlciB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICBwcml2YXRlIHNwcml0ZTogYW55O1xyXG4gICAgcHJpdmF0ZSB0ZXh0dXJlV3JhcHBlcjogU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyO1xyXG5cclxuICAgIHByaXZhdGUgY3VycmVudEFuaW1hdGlvbjogU3RhbmRlZUFuaW1hdGlvbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgVGhyZWVKUyBvYmplY3RzOiBcclxuICAgICAgICB0aGlzLnRleHR1cmVXcmFwcGVyID0gc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlLm5ld0luc3RhbmNlKCk7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLlNwcml0ZU1hdGVyaWFsKHttYXA6IHRoaXMudGV4dHVyZVdyYXBwZXIudGV4dHVyZX0pO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IFRIUkVFLlNwcml0ZShtYXRlcmlhbCk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuc2NhbGUuc2V0KDEsIDEuNSk7IC8vIEFkanVzdCBhc3BlY3QgcmF0aW8gZm9yIDQ4IHggNzIgc2l6ZSBmcmFtZXMuIFxyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuc3ByaXRlKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBkZWZhdWx0IGFuaW1hdGlvbiB0byBzdGFuZGluZyBmYWNpbmcgZG93bjpcclxuICAgICAgICB0aGlzLmN1cnJlbnRBbmltYXRpb24gPSBjcmVhdGVXYWxrUmlnaHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS5tYXRlcmlhbC5jb2xvci5zZXQoMHhhYWFhYWEpOyAvLyBUT0RPOiBTZXQgdGhpcyBlbHNld2hlcmVcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RlcEN1cnJlbnRGcmFtZShlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBDdXJyZW50RnJhbWUoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFuaW1hdGlvbi5pc0ZpbmlzaGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gZGV0ZXJtaW5lQW5pbWF0aW9uKHRoaXMuY3VycmVudEFuaW1hdGlvbi5uZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZyYW1lID0gdGhpcy5jdXJyZW50QW5pbWF0aW9uLmdldEN1cnJlbnRGcmFtZSgpO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGZyYW1lIGNvb3JkaW5hdGVzIHRvIHRleHR1cmUgY29vcmRpbmF0ZXMgYW5kIHNldCB0aGUgY3VycmVudCBvbmVcclxuICAgICAgICBsZXQgeHBjdCA9IChmcmFtZS5jb2wgKiBGUkFNRV9XSURUSCkgLyBTUFJJVEVTSEVFVF9XSURUSDtcclxuICAgICAgICBsZXQgeXBjdCA9ICgoKFNQUklURVNIRUVUX0hFSUdIVCAvIEZSQU1FX0hFSUdIVCkgLSAxIC0gZnJhbWUucm93KSAqIEZSQU1FX0hFSUdIVCkgLyBTUFJJVEVTSEVFVF9IRUlHSFQ7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlLm9mZnNldC5zZXQoeHBjdCwgeXBjdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRldGVybWluZUFuaW1hdGlvbih0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZSk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbjogU3RhbmRlZUFuaW1hdGlvbjtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlU3RhbmRVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZERvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrRG93bjpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVXYWxrTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kUmlnaHQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtSaWdodCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLkNoZWVyVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZUNoZWVyVXAoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFVwXHJcbmxldCBzdGFuZFVwRnJhbWUxICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFVwRnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgVXBcclxubGV0IHdhbGtVcEZyYW1lMSAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgd2Fsa1VwRnJhbWUyICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMSk7XHJcbmxldCB3YWxrVXBGcmFtZTMgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAyKTtcclxubGV0IHdhbGtVcEZyYW1lNCAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDMpO1xyXG5sZXQgd2Fsa1VwRnJhbWU1ICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMyk7XHJcbmxldCB3YWxrVXBGcmFtZTYgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg1LCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXApO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUyLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUzLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU1LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU2LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gU3RhbmRpbmcgRG93blxyXG5sZXQgc3RhbmREb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZERvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHN0YW5kRG93bkZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIERvd25cclxubGV0IHdhbGtEb3duRnJhbWUxICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDApO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTIgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMSk7XHJcbmxldCB3YWxrRG93bkZyYW1lMyAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAyKTtcclxubGV0IHdhbGtEb3duRnJhbWU0ICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDMpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTUgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMyk7XHJcbmxldCB3YWxrRG93bkZyYW1lNiAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtEb3duKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTIsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lMywgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTUsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lNiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIExlZnRcclxubGV0IHN0YW5kTGVmdEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDEpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU3RhbmRMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kTGVmdCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZExlZnRGcmFtZTEpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gV2Fsa2luZyBMZWZ0XHJcbmxldCB3YWxrTGVmdEZyYW1lMSAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAxKTtcclxubGV0IHdhbGtMZWZ0RnJhbWUyICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDApO1xyXG5sZXQgd2Fsa0xlZnRGcmFtZTMgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMSk7XHJcbmxldCB3YWxrTGVmdEZyYW1lNCAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAyKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0KTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFJpZ2h0XHJcbmxldCBzdGFuZFJpZ2h0RnJhbWUxICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kUmlnaHQoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFJpZ2h0RnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgUmlnaHRcclxubGV0IHdhbGtSaWdodEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDQpO1xyXG5sZXQgd2Fsa1JpZ2h0RnJhbWUyICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgNCk7XHJcbmxldCB3YWxrUmlnaHRGcmFtZTMgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxubGV0IHdhbGtSaWdodEZyYW1lNCAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDQpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlV2Fsa1JpZ2h0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtSaWdodEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gQ2hlZXIgVXBcclxubGV0IGNoZWVyVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgY2hlZXJVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMCk7XHJcbmxldCBjaGVlclVwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAxKTtcclxubGV0IGNoZWVyVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDApO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2hlZXJVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5DaGVlclVwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goY2hlZXJVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgVXBcclxubGV0IHBhbmljVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgcGFuaWNVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMik7XHJcbmxldCBwYW5pY1VwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAwKTtcclxubGV0IHBhbmljVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDIpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGFuaWNVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgRG93blxyXG5sZXQgcGFuaWNEb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcbmxldCBwYW5pY0Rvd25GcmFtZTIgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAxKTtcclxubGV0IHBhbmljRG93bkZyYW1lMyAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDIpO1xyXG5sZXQgcGFuaWNEb3duRnJhbWU0ICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMSk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQYW5pY0Rvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNEb3duRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvc3RhbmRlZS1tb3ZlbWVudC1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7U3RhbmRlZVNwcml0ZVdyYXBwZXJ9IGZyb20gJy4vc3RhbmRlZS1zcHJpdGUtd3JhcHBlcic7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZSB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG4gICAgcmVhZG9ubHkgc3ByaXRlV3JhcHBlcjogU3RhbmRlZVNwcml0ZVdyYXBwZXI7XHJcblxyXG4gICAgcHJpdmF0ZSB3YWxrVHdlZW5FbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHdhbGtUd2VlbjogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIgPSBuZXcgU3RhbmRlZVNwcml0ZVdyYXBwZXIoKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLnNwcml0ZVdyYXBwZXIuZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCgtMjAwLCAwLCAtMjAwKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RlcFdhbGsoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW1tZWRpYXRlbHkgc2V0IHN0YW5kZWUgb24gZ2l2ZW4gcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIG1vdmVUbyh4OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24uc2V0KHgsIDAsIHopO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHN0YW5kZWUgaW4gbW90aW9uIHRvd2FyZHMgZ2l2ZW4gcG9zaXRpb24uXHJcbiAgICAgKiBTcGVlZCBkaW1lbnNpb24gaXMgMSB1bml0L3NlYy5cclxuICAgICAqL1xyXG4gICAgd2Fsa1RvKHg6IG51bWJlciwgejogbnVtYmVyLCBzcGVlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdyBsb25nIGl0IHdvdWxkIHRha2UsIGdpdmVuIHRoZSBzcGVlZCByZXF1ZXN0ZWQuXHJcbiAgICAgICAgbGV0IHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKHgsIDAsIHopLnN1Yih0aGlzLmdyb3VwLnBvc2l0aW9uKTtcclxuICAgICAgICBsZXQgZGlzdGFuY2UgPSB2ZWN0b3IubGVuZ3RoKCk7XHJcbiAgICAgICAgbGV0IHRpbWUgPSAoZGlzdGFuY2UgLyBzcGVlZCkgKiAxMDAwO1xyXG5cclxuICAgICAgICAvLyBEZWxlZ2F0ZSB0byB0d2Vlbi5qcy4gUGFzcyBpbiBjbG9zdXJlcyBhcyBjYWxsYmFja3MgYmVjYXVzZSBvdGhlcndpc2UgJ3RoaXMnIHdpbGwgcmVmZXJcclxuICAgICAgICAvLyB0byB0aGUgcG9zaXRpb24gb2JqZWN0LCB3aGVuIGV4ZWN1dGluZyBzdG9wV2FsaygpLlxyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5ncm91cC5wb3NpdGlvbilcclxuICAgICAgICAgICAgLnRvKHt4OiB4LCB6OiB6fSwgdGltZSlcclxuICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4geyB0aGlzLnN0b3BXYWxrKCk7IH0pXHJcbiAgICAgICAgICAgIC5zdGFydCh0aGlzLndhbGtUd2VlbkVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcFdhbGsoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2Fsa1R3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMud2Fsa1R3ZWVuLnVwZGF0ZSh0aGlzLndhbGtUd2VlbkVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0b3BXYWxrKCkge1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoXHJcbiAgICAgICAgICAgIHRoaXMubnBjSWQsXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi56KVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge3dvcmxkfSBmcm9tICcuL3dvcmxkL3dvcmxkJztcclxuaW1wb3J0IHtsaWdodGluZ0dyaWR9IGZyb20gJy4vbGlnaHRpbmcvbGlnaHRpbmctZ3JpZCc7XHJcbmltcG9ydCB7c3dpdGNoYm9hcmR9IGZyb20gJy4vbGlnaHRpbmcvc3dpdGNoYm9hcmQnO1xyXG5pbXBvcnQge3N0YW5kZWVNYW5hZ2VyfSBmcm9tICcuL3N0YW5kZWUvc3RhbmRlZS1tYW5hZ2VyJztcclxuXHJcbmNsYXNzIFZpZXcge1xyXG5cclxuICAgIHByaXZhdGUgc2NlbmU6IGFueTtcclxuICAgIHByaXZhdGUgY2FtZXJhOiBhbnk7XHJcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzcHJpdGU6IGFueTtcclxuICAgIHByaXZhdGUgdGV4dHVyZTogYW55O1xyXG4gICAgcHJpdmF0ZSByb3c6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY29sOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHR0bDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg2MCwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDAuMSwgMTAwMCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWV9KTtcclxuICAgICAgICAvLyB0aGlzLnJlbmRlcmVyLnNvcnRPYmplY3RzID0gZmFsc2U7IC8vIEZJWE1FOiBJJ20gbm90IHN1cmUgd2h5IEknbSBhYmxlIHRvIGNvbW1lbnQgdGhpcyBvdXQgbm93Li4uXHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5kb1N0YXJ0KCk7XHJcblxyXG4gICAgICAgIHdvcmxkLnN0YXJ0KCk7XHJcbiAgICAgICAgbGlnaHRpbmdHcmlkLnN0YXJ0KCk7XHJcbiAgICAgICAgc3dpdGNoYm9hcmQuc3RhcnQoKTtcclxuICAgICAgICBzdGFuZGVlTWFuYWdlci5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgd29ybGQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBsaWdodGluZ0dyaWQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBzd2l0Y2hib2FyZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHN0YW5kZWVNYW5hZ2VyLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIC8vIEZJWE1FOiBJJ20gbm90IHJlYWxseSBzdXJlIHdoeSBpdCBpcyBzb3J0aW5nIHRoZXNlIGNvcnJlY3RseSB3aXRob3V0IHRoaXM6XHJcbiAgICAgICAgLy8gZm9yIChsZXQgb2JqIG9mIHN0YW5kZWVNYW5hZ2VyLmdyb3VwLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgLy8gICAgIGxldCBkaXN0YW5jZSA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uLmRpc3RhbmNlVG8ob2JqLnBvc2l0aW9uKTtcclxuICAgICAgICAvLyAgICAgb2JqLnJlbmRlck9yZGVyID0gZGlzdGFuY2UgKiAtMTtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50dGwgLT0gZWxhcHNlZDtcclxuICAgICAgICBpZiAodGhpcy50dGwgPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnR0bCA9IDI1MDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY29sKys7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbCA+PSAzKSB7IC8vIDMgaW1hZ2VzICsgMiBibGFuayBwYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvdysrO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucm93ID49IDUpIHsgLy8gNSBpbWFnZXMgKyAyIGJsYW5rIHBhZGRpbmdcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdyA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFVzaW5nIHBpeGVsczpcclxuICAgICAgICAgICAgbGV0IHggPSA0OCAqIHRoaXMuY29sO1xyXG4gICAgICAgICAgICBsZXQgeSA9IDUxMiAtICgodGhpcy5yb3cgKyAxKSAqIDcyKTtcclxuICAgICAgICAgICAgbGV0IHhwY3QgPSB4IC8gMjU2O1xyXG4gICAgICAgICAgICBsZXQgeXBjdCA9IHkgLyA1MTI7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZS5vZmZzZXQuc2V0KHhwY3QsIHlwY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9TdGFydCgpIHtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZCh3b3JsZC5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoc3RhbmRlZU1hbmFnZXIuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKGxpZ2h0aW5nR3JpZC5ncm91cCk7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFRlbXBvcmFyeSBmb3IgZGVidWdnaW5nP1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHg0MDQwNDApKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24uc2V0KC0zLCAwLjc1LCAxNSk7IC8vIEEgbGl0dGxlIGhpZ2hlciB0aGFuIGV5ZS1sZXZlbCB3aXRoIHRoZSBOUENzLlxyXG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMyg0LCA5LCAwKSk7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXJlci5kb21FbGVtZW50KTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHByaXZhdGUgdGV4dHVyZUxlYWtOb3RlcygpIHtcclxuICAgIC8vICAgICBsZXQgdGV4dHVyZUxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XHJcbiAgICAvLyAgICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZUxvYWRlci5sb2FkKCdmYWxsLXN0dWRlbnQucG5nJywgKCkgPT4ge1xyXG4gICAgLy8gICAgICAgICAvLyB0aGlzLnRleHR1cmUud3JhcFMgPSBUSFJFRS5SZXBlYXRXcmFwcGluZzsgLy8gQWxsb3dzIGZvciB0ZXh0dXJlIGZsaXBwaW5nLCB3aGVuIG5lY2Vzc2FyeS5cclxuICAgIC8vICAgICAgICAgdGhpcy50ZXh0dXJlLnJlcGVhdC5zZXQoNDgvMjU2LCA3Mi81MTIpOyBcclxuICAgIC8vICAgICAgICAgLy8gdGhpcy50ZXh0dXJlLm9mZnNldC5zZXQoMCArIDAvNSwgMSAtIDEvNyk7XHJcblxyXG4gICAgLy8gICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU3ByaXRlTWF0ZXJpYWwoe21hcDogdGhpcy50ZXh0dXJlfSk7IC8vIEZJWE1FOiBXaHkgaXNuJ3QgZGVwdGhXcml0ZSA9IHRydWUgbmVlZGVkIGFueW1vcmU/XHJcbiAgICAvLyAgICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IFRIUkVFLlNwcml0ZShtYXRlcmlhbCk7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuc3ByaXRlLnNjYWxlLnNldCg1LCA3LCAxKTsgLy8gQWRqdXN0ZWQgZm9yIHNwcml0ZXNoZWV0IHJvd3MgPSA3LCBjb2xzID0gNS5cclxuICAgIC8vICAgICAgICAgdGhpcy5zcHJpdGUucG9zaXRpb24uc2V0KDUsIDYuNzUsIDMpO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnNwcml0ZSk7XHJcblxyXG4gICAgLy8gICAgICAgICB0aGlzLnJvdyA9IDA7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29sID0gMDtcclxuICAgIC8vICAgICAgICAgdGhpcy50dGwgPSAxMDA7XHJcblxyXG4gICAgLy8gICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDA7IGkrKykge1xyXG4gICAgLy8gICAgICAgICAgICAgLy8gbGV0IGNsb25lZFRleHR1cmUgPSB0aGlzLnRleHR1cmU7XHJcblxyXG4gICAgLy8gICAgICAgICAgICAgLy8gbGV0IGNsb25lZFRleHR1cmUgPSB0aGlzLnRleHR1cmUuY2xvbmUoKTtcclxuICAgIC8vICAgICAgICAgICAgIC8vIGNsb25lZFRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgIC8vICAgICAgICAgICAgIGxldCBjbG9uZWRUZXh0dXJlID0gdGhpcy50ZXh0dXJlLmNsb25lKCk7XHJcbiAgICAvLyAgICAgICAgICAgICBjbG9uZWRUZXh0dXJlLl9fd2ViZ2xUZXh0dXJlID0gdGhpcy50ZXh0dXJlLl9fd2ViZ2xUZXh0dXJlO1xyXG4gICAgLy8gICAgICAgICAgICAgY2xvbmVkVGV4dHVyZS5fX3dlYmdsSW5pdCA9IHRydWU7XHJcbiAgICAgICAgICAgIFxyXG4gICAgLy8gICAgICAgICAgICAgY2xvbmVkVGV4dHVyZS53cmFwUyA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xyXG4gICAgLy8gICAgICAgICAgICAgY2xvbmVkVGV4dHVyZS53cmFwVCA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xyXG4gICAgLy8gICAgICAgICAgICAgY2xvbmVkVGV4dHVyZS5yZXBlYXQuc2V0KDAuNSArIE1hdGgucmFuZG9tKCksIDAuNSArIE1hdGgucmFuZG9tKCkpO1xyXG4gICAgLy8gICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDEsIDEsIDEpO1xyXG4gICAgLy8gICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcclxuICAgIC8vICAgICAgICAgICAgICAgICBtYXA6IGNsb25lZFRleHR1cmUsXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxyXG4gICAgLy8gICAgICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgICAgICAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAvLyAgICAgICAgICAgICBtZXNoLnBvc2l0aW9uLnggPSBNYXRoLnJhbmRvbSgpICogMjAgLSA1OyBcclxuICAgIC8vICAgICAgICAgICAgIG1lc2gucG9zaXRpb24ueSA9IE1hdGgucmFuZG9tKCkgKiAyMCAtIDU7IFxyXG4gICAgLy8gICAgICAgICAgICAgbWVzaC5wb3NpdGlvbi56ID0gTWF0aC5yYW5kb20oKSAqIDIwIC0gNTsgXHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLnNjZW5lLmFkZChtZXNoKTtcclxuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGV4dHVyZSBjb3VudDogXCIgKyB0aGlzLnJlbmRlcmVyLmluZm8ubWVtb3J5LnRleHR1cmVzKTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy8gfVxyXG59XHJcbmV4cG9ydCBjb25zdCB2aWV3ID0gbmV3IFZpZXcoKTtcclxuIiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuY2xhc3MgQnVpbGRpbmcge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzbGFiOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBvbGQgcGxhaW4gY3ViZS5cclxuICAgICAgICAvLyBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMTEsIDIwLCAxMCk7XHJcbiAgICAgICAgLy8gbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiAweGZmZmZmZn0pO1xyXG4gICAgICAgIC8vIHRoaXMuc2xhYiA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgLy8gdGhpcy5zbGFiLnBvc2l0aW9uLnNldCg0LjUsIDEwLCAtNS44KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBsZXQgbXRsTG9hZGVyID0gbmV3IFRIUkVFLk1UTExvYWRlcigpO1xyXG4gICAgICAgIG10bExvYWRlci5zZXRQYXRoKCcnKTtcclxuICAgICAgICBtdGxMb2FkZXIubG9hZCgnZ3JlZW4tYnVpbGRpbmcubXRsJywgKG1hdGVyaWFsczogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIG1hdGVyaWFscy5wcmVsb2FkKCk7XHJcbiAgICAgICAgICAgIGxldCBvYmpMb2FkZXIgPSBuZXcgVEhSRUUuT0JKTG9hZGVyKCk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5zZXRNYXRlcmlhbHMobWF0ZXJpYWxzKTtcclxuICAgICAgICAgICAgb2JqTG9hZGVyLnNldFBhdGgoJycpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIubG9hZCgnZ3JlZW4tYnVpbGRpbmcub2JqJywgKG9iajogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBvYmouc2NhbGUuc2V0U2NhbGFyKDAuMjUpO1xyXG4gICAgICAgICAgICAgICAgb2JqLnBvc2l0aW9uLnNldCg1LCAtMC4wMSwgMCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwLmFkZChvYmopO1xyXG4gICAgICAgICAgICB9LCAoKSA9PiB7IH0sICgpID0+IHsgY29uc29sZS5sb2coJ2Vycm9yIHdoaWxlIGxvYWRpbmcgOignKSB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGJ1aWxkaW5nID0gbmV3IEJ1aWxkaW5nKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgZ3Jhc3M6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDMwMCwgMzAwKTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7ZW1pc3NpdmU6IDB4MDIxZDAzLCBlbWlzc2l2ZUludGVuc2l0eTogMS4wfSk7XHJcbiAgICAgICAgdGhpcy5ncmFzcyA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgdGhpcy5ncmFzcy5yb3RhdGlvbi54ID0gKE1hdGguUEkgKiAzKSAvIDI7XHJcbiAgICAgICAgdGhpcy5ncmFzcy5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5ncmFzcyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBncm91bmQgPSBuZXcgR3JvdW5kKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuY29uc3QgU1RBUlRfWl9BTkdMRSA9IC0oTWF0aC5QSSAvIDMwKTtcclxuY29uc3QgRU5EX1pfQU5HTEUgICA9ICAgTWF0aC5QSSAvIDMwO1xyXG5jb25zdCBST1RBVElPTl9TUEVFRCA9IDAuMDAwMTtcclxuXHJcbmNsYXNzIFNreSB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIGRvbWU6IGFueTtcclxuICAgIHByaXZhdGUgcmR6OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoNTAsIDMyLCAzMik7IC8vIG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgxNTAsIDE1MCwgMTUwKTtcclxuICAgICAgICBsZXQgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuZ2VuZXJhdGVUZXh0dXJlKCkpO1xyXG4gICAgICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7bWFwOiB0ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZX0pO1xyXG4gICAgICAgIHRoaXMuZG9tZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgdGhpcy5kb21lLm1hdGVyaWFsLnNpZGUgPSBUSFJFRS5CYWNrU2lkZTtcclxuICAgICAgICB0aGlzLmRvbWUucG9zaXRpb24uc2V0KDEwLCAxMCwgMCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5kb21lKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZHogPSAtUk9UQVRJT05fU1BFRUQ7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5kb21lLnJvdGF0aW9uLnNldCgwLCAwLCBTVEFSVF9aX0FOR0xFKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuZG9tZS5yb3RhdGlvbi5zZXQoMCwgMCwgdGhpcy5kb21lLnJvdGF0aW9uLnogKyB0aGlzLnJkeik7XHJcbiAgICAgICAgaWYgKHRoaXMuZG9tZS5yb3RhdGlvbi56ID49IEVORF9aX0FOR0xFKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmR6ID0gLVJPVEFUSU9OX1NQRUVEO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5kb21lLnJvdGF0aW9uLnogPD0gU1RBUlRfWl9BTkdMRSkge1xyXG4gICAgICAgICAgICB0aGlzLnJkeiA9IFJPVEFUSU9OX1NQRUVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJhc2VkIG9uOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xOTk5MjUwNVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdlbmVyYXRlVGV4dHVyZSgpOiBhbnkge1xyXG4gICAgICAgIGxldCBzaXplID0gNTEyO1xyXG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICBjYW52YXMud2lkdGggPSBzaXplO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBzaXplO1xyXG4gICAgICAgIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICBjdHgucmVjdCgwLCAwLCBzaXplLCBzaXplKTtcclxuICAgICAgICBsZXQgZ3JhZGllbnQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgc2l6ZSk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuMDAsICcjMDAwMDAwJyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuNDAsICcjMTMxYzQ1Jyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuNzUsICcjZmY5NTQ0Jyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuODUsICcjMTMxYzQ1Jyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEuMDAsICcjMTMxYzQ1Jyk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgcmV0dXJuIGNhbnZhcztcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc2t5ID0gbmV3IFNreSgpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7c2t5fSBmcm9tICcuL3NreSc7XHJcbmltcG9ydCB7YnVpbGRpbmd9IGZyb20gJy4vYnVpbGRpbmcnO1xyXG5pbXBvcnQge2dyb3VuZH0gZnJvbSAnLi9ncm91bmQnO1xyXG5cclxuY2xhc3MgV29ybGQge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZChza3kuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKGJ1aWxkaW5nLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZChncm91bmQuZ3JvdXApO1xyXG5cclxuICAgICAgICBza3kuc3RhcnQoKTtcclxuICAgICAgICBidWlsZGluZy5zdGFydCgpO1xyXG4gICAgICAgIGdyb3VuZC5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgc2t5LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgYnVpbGRpbmcuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBncm91bmQuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgd29ybGQgPSBuZXcgV29ybGQoKTsiXX0=
