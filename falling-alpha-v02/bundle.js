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
var TOTAL_NPCS = 1000;
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
var SPRITESHEET_WIDTH = 256;
var SPRITESHEET_HEIGHT = 512;
// Dimensions of one frame within the spritesheet:
var FRAME_WIDTH = 48;
var FRAME_HEIGHT = 72;
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
            _this.texture.repeat.set(FRAME_WIDTH / SPRITESHEET_WIDTH, FRAME_HEIGHT / SPRITESHEET_HEIGHT);
            // Set the default frame to the upper-left corner
            // TODO: Necessary? Might remove this after animations get defined.
            _this.texture.offset.set((0 * (SPRITESHEET_WIDTH - FRAME_WIDTH)) / SPRITESHEET_WIDTH, (1 * (SPRITESHEET_HEIGHT - FRAME_HEIGHT)) / SPRITESHEET_HEIGHT);
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
var standee_animation_texture_base_1 = require('./standee-animation-texture-base');
var StandeeAnimation = (function () {
    function StandeeAnimation() {
        this.group = new THREE.Object3D();
        this.textureWrapper = standee_animation_texture_base_1.standeeAnimationTextureBase.newInstance();
        var material = new THREE.SpriteMaterial({ map: this.textureWrapper.texture });
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(1, 1.5); // Adjust aspect ratio for 48 x 72 size frames. 
        this.group.add(this.sprite);
    }
    StandeeAnimation.prototype.start = function () {
        this.sprite.material.color.set(0xaaaaaa); // TODO: Set this elsewhere
    };
    StandeeAnimation.prototype.step = function (elapsed) {
        //
    };
    return StandeeAnimation;
}());
exports.StandeeAnimation = StandeeAnimation;
},{"./standee-animation-texture-base":24}],26:[function(require,module,exports){
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
},{"../../event/event-bus":8,"./standee":27}],27:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var standee_movement_ended_event_1 = require('../../event/standee-movement-ended-event');
var standee_animation_1 = require('./standee-animation');
var Standee = (function () {
    function Standee(npcId) {
        this.npcId = npcId;
        this.group = new THREE.Object3D();
        this.animation = new standee_animation_1.StandeeAnimation();
        this.group.add(this.animation.group);
        this.walkTweenElapsed = 0;
        this.walkTween = null;
    }
    Standee.prototype.start = function () {
        this.group.position.set(-200, 0, -200);
    };
    Standee.prototype.step = function (elapsed) {
        this.stepWalk(elapsed);
        this.animation.step(elapsed);
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
},{"../../event/event-bus":8,"../../event/standee-movement-ended-event":12,"./standee-animation":25}],28:[function(require,module,exports){
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
},{"./lighting/lighting-grid":22,"./lighting/switchboard":23,"./standee/standee-manager":26,"./world/world":32}],29:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2NvbnRyb2xsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2lucHV0LnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL2NlbGwudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vcGxheWVyLW1vdmVtZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9hY3RpdmUtc2hhcGUtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9jZWxsLWNoYW5nZS1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2V2ZW50LWJ1cy50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy1tb3ZlbWVudC1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvbnBjLXBsYWNlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9nYW1lLXN0YXRlLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL2JvYXJkLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvc2hhcGUtZmFjdG9yeS50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL3NoYXBlLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbW9kZWwudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvbnBjLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvbnBjLnRzIiwic3JjL3NjcmlwdHMvcHJlbG9hZGVyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9saWdodGluZy1ncmlkLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9zd2l0Y2hib2FyZC50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1hbmltYXRpb24udHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1tYW5hZ2VyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUudHMiLCJzcmMvc2NyaXB0cy92aWV3L3ZpZXcudHMiLCJzcmMvc2NyaXB0cy92aWV3L3dvcmxkL2J1aWxkaW5nLnRzIiwic3JjL3NjcmlwdHMvdmlldy93b3JsZC9ncm91bmQudHMiLCJzcmMvc2NyaXB0cy92aWV3L3dvcmxkL3NreS50cyIsInNyYy9zY3JpcHRzL3ZpZXcvd29ybGQvd29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUEsc0JBQXlCLFNBQVMsQ0FBQyxDQUFBO0FBQ25DLDBCQUF1QixvQkFBb0IsQ0FBQyxDQUFBO0FBQzVDLGdDQUE2QiwyQkFBMkIsQ0FBQyxDQUFBO0FBQ3pELHNDQUFrQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRW5FLDZIQUE2SDtBQUU3SDtJQUFBO0lBMkJBLENBQUM7SUF6QkcsMEJBQUssR0FBTDtRQUNJLGFBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQseUJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsRUFBRSxDQUFDLENBQUMsYUFBSyxDQUFDLGtCQUFrQixDQUFDLFVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxvQkFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLDJDQUFtQixDQUFDLGdDQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsYUFBSyxDQUFDLGtCQUFrQixDQUFDLFlBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxvQkFBUSxD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QixtQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixlQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFDTCxZQUFDO0FBQUQsQ0F2QkEsQUF1QkMsSUFBQTtBQUNZLGFBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7aW5wdXQsIEtleX0gZnJvbSAnLi9pbnB1dCc7XHJcbmltcG9ydCB7ZXZlbnRCdXN9IGZyb20gJy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50RXZlbnR9IGZyb20gJy4uL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudCc7XHJcblxyXG4vLyBUT0RPOiBIZXJlIGRldGVybWluZSBpZiBwbGF5ZXIgaXMgaG9sZGluZyBkb3duIG9uZSBvZiB0aGUgYXJyb3cga2V5czsgaWYgc28sIGZpcmUgcmFwaWQgZXZlbnRzIGFmdGVyIChUQkQpIGFtb3VudCBvZiB0aW1lLlxyXG5cclxuY2xhc3MgQ29udHJvbGxlciB7XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgaW5wdXQuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LlVwKSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LlJvdGF0ZUNsb2Nrd2lzZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuTGVmdCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5MZWZ0KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5SaWdodCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5SaWdodCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuRG93bikpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Eb3duKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5TcGFjZSkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Ecm9wKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBjb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5leHBvcnQgY29uc3QgZW51bSBLZXkge1xyXG4gICAgTGVmdCxcclxuICAgIFVwLFxyXG4gICAgRG93bixcclxuICAgIFJpZ2h0LFxyXG4gICAgU3BhY2UsXHJcbiAgICBQYXVzZSxcclxuICAgIE90aGVyXHJcbn1cclxuXHJcbmNvbnN0IGVudW0gU3RhdGUge1xyXG4gICAgRG93bixcclxuICAgIFVwLFxyXG4gICAgSGFuZGxpbmdcclxufVxyXG5cclxuY2xhc3MgSW5wdXQge1xyXG4gICAgcHJpdmF0ZSBrZXlTdGF0ZTogTWFwPEtleSxTdGF0ZT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5rZXlTdGF0ZSA9IG5ldyBNYXA8S2V5LFN0YXRlPigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRUb1N0YXRlKGV2ZW50LCBTdGF0ZS5Eb3duKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFRvU3RhdGUoZXZlbnQsIFN0YXRlLlVwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBpZiBnaXZlbiBrZXkgaXMgJ0Rvd24nLlxyXG4gICAgICovXHJcbiAgICBpc0Rvd24oa2V5OiBLZXkpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5rZXlTdGF0ZS5nZXQoa2V5KSA9PT0gU3RhdGUuRG93bjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBpZiBnaXZlbiBrZXkgaXMgJ2Rvd24nLiBBbHNvIHNldHMgdGhlIGtleSBmcm9tICdEb3duJyB0byAnSGFuZGxpbmcnLlxyXG4gICAgICovXHJcbiAgICBpc0Rvd25BbmRVbmhhbmRsZWQoa2V5OiBLZXkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0Rvd24oa2V5KSkge1xyXG4gICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIFN0YXRlLkhhbmRsaW5nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBUT0RPOiBUaGlzIHdhc24ndCBzZXQgaW4gbWF6aW5nOyBuZWVkIHRvIHNlZSB3aHkuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBpZiBhbnkga2V5IGlzICdkb3duJy4gQWxzbyBzZXQgYWxsICdEb3duJyBrZXlzIHRvICdIYW5kbGluZycuXHJcbiAgICAgKi9cclxuICAgIGlzQW55S2V5RG93bkFuZFVuaGFuZGxlZCgpIHtcclxuICAgICAgICBsZXQgYW55S2V5RG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMua2V5U3RhdGUuZm9yRWFjaCgoc3RhdGU6IFN0YXRlLCBrZXk6IEtleSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IFN0YXRlLkRvd24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5U3RhdGUuc2V0KGtleSwgU3RhdGUuSGFuZGxpbmcpO1xyXG4gICAgICAgICAgICAgICAgYW55S2V5RG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gYW55S2V5RG93bjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGV2ZW50VG9TdGF0ZShldmVudDogS2V5Ym9hcmRFdmVudCwgc3RhdGU6IFN0YXRlKSB7XHJcbiAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEaXJlY3Rpb25hbHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA2NTogLy8gJ2EnXHJcbiAgICAgICAgICAgIGNhc2UgMzc6IC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LkxlZnQsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4NzogLy8gJ3cnXHJcbiAgICAgICAgICAgIGNhc2UgMzg6IC8vIHVwXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5VcCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKSAtIGNvbW1lbnRlZCBmb3IgaWYgdGhlIHVzZXIgd2FudHMgdG8gY21kK3cgb3IgY3RybCt3XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2ODogLy8gJ2QnXHJcbiAgICAgICAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5SaWdodCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDgzOiAvLyAncydcclxuICAgICAgICAgICAgY2FzZSA0MDogLy8gZG93blxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuRG93biwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDMyOiAvLyBzcGFjZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuU3BhY2UsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFBhdXNlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDgwOiAvLyAncCdcclxuICAgICAgICAgICAgY2FzZSAyNzogLy8gZXNjXHJcbiAgICAgICAgICAgIGNhc2UgMTM6IC8vIGVudGVyIGtleVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuUGF1c2UsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFRPRE86IE1heWJlIGFkZCBhIGRlYnVnIGtleSBoZXJlICgnZicpXHJcblxyXG4gICAgICAgICAgICAvLyBJZ25vcmUgY2VydGFpbiBrZXlzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA4MjogICAgLy8gJ3InXHJcbiAgICAgICAgICAgIGNhc2UgMTg6ICAgIC8vIGFsdFxyXG4gICAgICAgICAgICBjYXNlIDIyNDogICAvLyBhcHBsZSBjb21tYW5kIChmaXJlZm94KVxyXG4gICAgICAgICAgICBjYXNlIDE3OiAgICAvLyBhcHBsZSBjb21tYW5kIChvcGVyYSlcclxuICAgICAgICAgICAgY2FzZSA5MTogICAgLy8gYXBwbGUgY29tbWFuZCwgbGVmdCAoc2FmYXJpL2Nocm9tZSlcclxuICAgICAgICAgICAgY2FzZSA5MzogICAgLy8gYXBwbGUgY29tbWFuZCwgcmlnaHQgKHNhZmFyaS9jaHJvbWUpXHJcbiAgICAgICAgICAgIGNhc2UgODQ6ICAgIC8vICd0JyAoaS5lLiwgb3BlbiBhIG5ldyB0YWIpXHJcbiAgICAgICAgICAgIGNhc2UgNzg6ICAgIC8vICduJyAoaS5lLiwgb3BlbiBhIG5ldyB3aW5kb3cpXHJcbiAgICAgICAgICAgIGNhc2UgMjE5OiAgIC8vIGxlZnQgYnJhY2tldHNcclxuICAgICAgICAgICAgY2FzZSAyMjE6ICAgLy8gcmlnaHQgYnJhY2tldHNcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gUHJldmVudCBzb21lIHVud2FudGVkIGJlaGF2aW9ycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgMTkxOiAgIC8vIGZvcndhcmQgc2xhc2ggKHBhZ2UgZmluZClcclxuICAgICAgICAgICAgY2FzZSA5OiAgICAgLy8gdGFiIChjYW4gbG9zZSBmb2N1cylcclxuICAgICAgICAgICAgY2FzZSAxNjogICAgLy8gc2hpZnRcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIEFsbCBvdGhlciBrZXlzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuT3RoZXIsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFN0YXRlKGtleTogS2V5LCBzdGF0ZTogU3RhdGUpIHtcclxuICAgICAgICAvLyBBbHdheXMgc2V0ICd1cCdcclxuICAgICAgICBpZiAoc3RhdGUgPT09IFN0YXRlLlVwKSB7XHJcbiAgICAgICAgICAgIHRoaXMua2V5U3RhdGUuc2V0KGtleSwgc3RhdGUpO1xyXG4gICAgICAgIC8vIE9ubHkgc2V0ICdkb3duJyBpZiBpdCBpcyBub3QgYWxyZWFkeSBoYW5kbGVkXHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gU3RhdGUuRG93bikge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5rZXlTdGF0ZS5nZXQoa2V5KSAhPT0gU3RhdGUuSGFuZGxpbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5U3RhdGUuc2V0KGtleSwgc3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgaW5wdXQgPSBuZXcgSW5wdXQoKTsiLCJpbXBvcnQge0NvbG9yfSBmcm9tICcuL2NvbG9yJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDZWxsIHtcclxuICAgIHByaXZhdGUgY29sb3I6IENvbG9yO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBDb2xvci5FbXB0eTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xvcihjb2xvcjogQ29sb3IpIHtcclxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sb3IoKTogQ29sb3Ige1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogT2Zmc2V0IGNhbGN1bGF0ZWQgZnJvbSB0b3AtbGVmdCBjb3JuZXIgYmVpbmcgMCwgMC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDZWxsT2Zmc2V0IHtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxufSIsImV4cG9ydCBlbnVtIFBsYXllck1vdmVtZW50IHtcclxuICAgIE5vbmUsXHJcbiAgICBMZWZ0LFxyXG4gICAgUmlnaHQsXHJcbiAgICBEb3duLFxyXG4gICAgRHJvcCxcclxuICAgIFJvdGF0ZUNsb2Nrd2lzZSxcclxuICAgIFJvdGF0ZUNvdW50ZXJDbG9ja3dpc2VcclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U2hhcGV9IGZyb20gJy4uL21vZGVsL2JvYXJkL3NoYXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHNoYXBlOiBTaGFwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzaGFwZTogU2hhcGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi4vbW9kZWwvYm9hcmQvc2hhcGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFjdGl2ZVNoYXBlRW5kZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHNoYXBlOiBTaGFwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzaGFwZTogU2hhcGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtDZWxsfSBmcm9tICcuLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uL2RvbWFpbi9jb2xvcic7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2VsbENoYW5nZUV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcbiAgICByZWFkb25seSBjZWxsOiBDZWxsO1xyXG4gICAgcmVhZG9ubHkgcm93OiBudW1iZXI7XHJcbiAgICByZWFkb25seSBjb2w6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjZWxsOiBDZWxsLCByb3c6IG51bWJlciwgY29sOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuY2VsbCA9IGNlbGw7XHJcbiAgICAgICAgdGhpcy5yb3cgPSByb3c7XHJcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkNlbGxDaGFuZ2VFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZW51bSBFdmVudFR5cGUge1xyXG4gICAgQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlLFxyXG4gICAgQWN0aXZlU2hhcGVFbmRlZEV2ZW50VHlwZSxcclxuICAgIENlbGxDaGFuZ2VFdmVudFR5cGUsXHJcbiAgICBOcGNNb3ZlbWVudENoYW5nZWRFdmVudFR5cGUsXHJcbiAgICBOcGNQbGFjZWRFdmVudFR5cGUsXHJcbiAgICBOcGNTdGF0ZUNoYWdlZEV2ZW50VHlwZSxcclxuICAgIFBsYXllck1vdmVtZW50RXZlbnRUeXBlLFxyXG4gICAgU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGVcclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic3RyYWN0RXZlbnQge1xyXG4gICAgYWJzdHJhY3QgZ2V0VHlwZSgpOkV2ZW50VHlwZVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50SGFuZGxlcjxUIGV4dGVuZHMgQWJzdHJhY3RFdmVudD4ge1xyXG4gICAgKGV2ZW50OiBUKTp2b2lkO1xyXG59XHJcblxyXG5jbGFzcyBFdmVudEJ1cyB7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVyc0J5VHlwZTpNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVyc0J5VHlwZSA9IG5ldyBNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT4oKTtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3Rlcih0eXBlOkV2ZW50VHlwZSwgaGFuZGxlcjpFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD4pIHtcclxuICAgICAgICBpZiAoIXR5cGUpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaGFuZGxlcnM6RXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+W10gPSB0aGlzLmhhbmRsZXJzQnlUeXBlLmdldCh0eXBlKTtcclxuICAgICAgICBpZiAoaGFuZGxlcnMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZXJzQnlUeXBlLnNldCh0eXBlLCBoYW5kbGVycyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFJldHVybiBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGNhbGxlZCB0byB1bnJlZ2lzdGVyIHRoZSBoYW5kbGVyXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFRPRE86IHVucmVnaXN0ZXIoKS4gQW5kIHJlbW92ZSB0aGUgbWFwIGtleSBpZiB6ZXJvIGhhbmRsZXJzIGxlZnQgZm9yIGl0LlxyXG4gICAgXHJcbiAgICAvLyBUT0RPOiBQcmV2ZW50IGluZmluaXRlIGZpcmUoKT9cclxuICAgIGZpcmUoZXZlbnQ6QWJzdHJhY3RFdmVudCkge1xyXG4gICAgICAgIGxldCBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnNCeVR5cGUuZ2V0KGV2ZW50LmdldFR5cGUoKSk7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiBoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGV2ZW50QnVzID0gbmV3IEV2ZW50QnVzKCk7IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLk5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjU3RhdGV9IGZyb20gJy4uL2RvbWFpbi9ucGMtc3RhdGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wY1BsYWNlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHN0YXRlOiBOcGNTdGF0ZTtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlclxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIsIHN0YXRlOiBOcGNTdGF0ZSwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5OcGNQbGFjZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXJNb3ZlbWVudEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbW92ZW1lbnQ6IFBsYXllck1vdmVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vdmVtZW50OiBQbGF5ZXJNb3ZlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudCA9IG1vdmVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5QbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB6OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueiA9IHo7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLlN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGNvbnN0IGVudW0gR2FtZVN0YXRlVHlwZSB7XHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgdGhlIHN0YXRlIHJpZ2h0IHdoZW4gSmF2YVNjcmlwdCBzdGFydHMgcnVubmluZy4gSW5jbHVkZXMgcHJlbG9hZGluZy5cclxuICAgICAqL1xyXG4gICAgSW5pdGlhbGl6aW5nLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWZ0ZXIgcHJlbG9hZCBpcyBjb21wbGV0ZSBhbmQgYmVmb3JlIG1ha2luZyBvYmplY3Qgc3RhcnQoKSBjYWxscy5cclxuICAgICAqL1xyXG4gICAgU3RhcnRpbmcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGlzIGFmdGVyIGluaXRpYWwgb2JqZWN0cyBzdGFydCgpIGFuZCBsaWtlbHkgd2hlcmUgdGhlIGdhbWUgaXMgd2FpdGluZyBvbiB0aGUgcGxheWVyJ3MgZmlyc3QgaW5wdXQuXHJcbiAgICAgKi9cclxuICAgIFN0YXJ0ZWQsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBtYWluIGdhbWUgbG9vcCBvZiBjb250cm9sbGluZyBwaWVjZXMuXHJcbiAgICAgKi9cclxuICAgIFBsYXlpbmcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmQgb2YgZ2FtZSwgc2NvcmUgaXMgc2hvd2luZywgbm90aGluZyBsZWZ0IHRvIGRvLlxyXG4gICAgICovXHJcbiAgICBFbmRlZFxyXG59XHJcblxyXG5jbGFzcyBHYW1lU3RhdGUge1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50OiBHYW1lU3RhdGVUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IEdhbWVTdGF0ZVR5cGUuSW5pdGlhbGl6aW5nOyAvLyBEZWZhdWx0IHN0YXRlLlxyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnQoKTogR2FtZVN0YXRlVHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDdXJyZW50KGN1cnJlbnQ6IEdhbWVTdGF0ZVR5cGUpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBjdXJyZW50O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBnYW1lU3RhdGUgPSBuZXcgR2FtZVN0YXRlKCk7IiwiaW1wb3J0IHtwcmVsb2FkZXJ9IGZyb20gJy4vcHJlbG9hZGVyJztcclxuaW1wb3J0IHttb2RlbH0gZnJvbSAnLi9tb2RlbC9tb2RlbCc7XHJcbmltcG9ydCB7dmlld30gZnJvbSAnLi92aWV3L3ZpZXcnO1xyXG5pbXBvcnQge2NvbnRyb2xsZXJ9IGZyb20gJy4vY29udHJvbGxlci9jb250cm9sbGVyJztcclxuaW1wb3J0IHtHYW1lU3RhdGVUeXBlLCBnYW1lU3RhdGV9IGZyb20gJy4vZ2FtZS1zdGF0ZSc7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgIGdhbWVTdGF0ZS5zZXRDdXJyZW50KEdhbWVTdGF0ZVR5cGUuSW5pdGlhbGl6aW5nKTtcclxuICAgIHByZWxvYWRlci5wcmVsb2FkKG1haW4pO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIG1haW4oKSB7XHJcblxyXG4gICAgLy8gU3RhcnR1cCBpbiByZXZlcnNlIE1WQyBvcmRlciB0byBlbnN1cmUgdGhhdCBldmVudCBidXMgaGFuZGxlcnMgaW4gdGhlXHJcbiAgICAvLyBjb250cm9sbGVyIGFuZCB2aWV3IHJlY2VpdmUgKGFueSkgc3RhcnQgZXZlbnRzIGZyb20gbW9kZWwuc3RhcnQoKS5cclxuICAgIGNvbnRyb2xsZXIuc3RhcnQoKTtcclxuICAgIHZpZXcuc3RhcnQoKTtcclxuICAgIG1vZGVsLnN0YXJ0KCk7XHJcbiAgICBcclxuICAgIGdhbWVTdGF0ZS5zZXRDdXJyZW50KEdhbWVTdGF0ZVR5cGUuU3RhcnRlZCk7XHJcblxyXG4gICAgbGV0IHN0ZXAgPSAoKSA9PiB7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApO1xyXG5cclxuICAgICAgICBsZXQgZWxhcHNlZCA9IGNhbGN1bGF0ZUVsYXBzZWQoKTtcclxuICAgICAgICBjb250cm9sbGVyLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdmlldy5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIG1vZGVsLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9O1xyXG4gICAgc3RlcCgpO1xyXG59XHJcblxyXG5sZXQgbGFzdFN0ZXAgPSBEYXRlLm5vdygpO1xyXG5mdW5jdGlvbiBjYWxjdWxhdGVFbGFwc2VkKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIGxhc3RTdGVwO1xyXG4gICAgaWYgKGVsYXBzZWQgPiAxMDApIHtcclxuICAgICAgICBlbGFwc2VkID0gMTAwOyAvLyBlbmZvcmNlIHNwZWVkIGxpbWl0XHJcbiAgICB9XHJcbiAgICBsYXN0U3RlcCA9IG5vdztcclxuICAgIHJldHVybiBlbGFwc2VkO1xyXG59IiwiaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi9zaGFwZSc7XHJcbmltcG9ydCB7Q2VsbH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5pbXBvcnQge3NoYXBlRmFjdG9yeX0gZnJvbSAnLi9zaGFwZS1mYWN0b3J5JztcclxuaW1wb3J0IHtldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtDZWxsQ2hhbmdlRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2NlbGwtY2hhbmdlLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlRW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWVuZGVkLWV2ZW50JztcclxuXHJcbmNvbnN0IE1BWF9ST1dTID0gMTk7IC8vIFRvcCAyIHJvd3MgYXJlIG9ic3RydWN0ZWQgZnJvbSB2aWV3LiBBbHNvLCBzZWUgbGlnaHRpbmctZ3JpZC50cy5cclxuY29uc3QgTUFYX0NPTFMgPSAxMDtcclxuY29uc3QgVEVNUF9ERUxBWV9NUyA9IDUwMDtcclxuXHJcbmV4cG9ydCBjbGFzcyBCb2FyZCB7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRTaGFwZTogU2hhcGU7XHJcblxyXG4gICAgcHJpdmF0ZSBtYXRyaXg6IENlbGxbXVtdO1xyXG4gICAgcHJpdmF0ZSBtc1RpbGxHcmF2aXR5VGljazogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5tYXRyaXggPSBbXTtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCBNQVhfUk9XUzsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXhbcm93SWR4XSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XSA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPSBURU1QX0RFTEFZX01TO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgLT0gZWxhcHNlZDtcclxuICAgICAgICBpZiAodGhpcy5tc1RpbGxHcmF2aXR5VGljayA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPSBURU1QX0RFTEFZX01TO1xyXG4gICAgICAgICAgICB0aGlzLnN0ZXBOb3coKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGdpdmVzIGhpZ2ggbGV2ZWwgdmlldyBvZiB0aGUgbWFpbiBnYW1lIGxvb3AuXHJcbiAgICAgKi9cclxuICAgIHN0ZXBOb3coKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudHJ5R3Jhdml0eSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZVNoYXBlRG93bigpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlRW5kZWRFdmVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnZlcnRTaGFwZVRvQ2VsbHMoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrRm9yR2FtZU92ZXIoKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogRmlyZSBnYW1lIGxvc2UgZXZlbnRcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQW55RmlsbGVkTGluZXMoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrRm9yR2FtZVdpbigpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogRmlyZSBnYW1lIHdpbiBldmVudFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0U2hhcGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBiZWdpbk5ld0dhbWUoKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuc2V0UmFuZG9tV2hpdGVMaWdodHMoKTtcclxuICAgICAgICB0aGlzLnN0YXJ0U2hhcGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVMZWZ0KCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlUmlnaHQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVSaWdodCgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlUmlnaHQoKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlRG93bigpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlRG93bigpO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVVwKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlRG93bkFsbFRoZVdheSgpIHtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVEb3duKCk7XHJcbiAgICAgICAgfSB3aGlsZSAoIXRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVVwKCk7XHJcbiAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVTaGFwZUNsb2Nrd2lzZSgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5yb3RhdGVDbG9ja3dpc2UoKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLnJvdGF0ZUNvdW50ZXJDbG9ja3dpc2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNsZWFyKCkge1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgQ29sb3IuRW1wdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0UmFuZG9tV2hpdGVMaWdodHMoKSB7XHJcbiAgICAgICAgLy8gLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNzIyODMyMlxyXG4gICAgICAgIC8vIGZ1bmN0aW9uIHJhbmRvbUludEZyb21JbnRlcnZhbChtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoobWF4IC0gbWluICsgMSkgKyBtaW4pO1xyXG4gICAgICAgIC8vIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciBtZXRob2QgdG8gY2hhbmdlIGEgc2luZ2xlIGNlbGwgY29sb3IncyBhbmQgbm90aWZ5IHN1YnNjcmliZXJzIGF0IHRoZSBzYW1lIHRpbWUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2hhbmdlQ2VsbENvbG9yKHJvd0lkeDogbnVtYmVyLCBjb2xJZHg6IG51bWJlciwgY29sb3I6IENvbG9yKSB7XHJcbiAgICAgICAgLy8gVE9ETzogTWF5YmUgYm91bmRzIGNoZWNrIGhlcmUuXHJcbiAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgY2VsbC5zZXRDb2xvcihjb2xvcik7XHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgQ2VsbENoYW5nZUV2ZW50KGNlbGwsIHJvd0lkeCwgY29sSWR4KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFydFNoYXBlKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlID0gc2hhcGVGYWN0b3J5Lm5leHRTaGFwZSgpO1xyXG4gICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB0cnlHcmF2aXR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjYW5Nb3ZlRG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVEb3duKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICBjYW5Nb3ZlRG93biA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNhbk1vdmVEb3duO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZW5kZWQgZm9yIGNoZWNraW5nIG9mIHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBjdXJyZW50XHJcbiAgICAgKiBzaGFwZSBoYXMgYW55IG92ZXJsYXAgd2l0aCBleGlzdGluZyBjZWxscyB0aGF0IGhhdmUgY29sb3IuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY29sbGlzaW9uRGV0ZWN0ZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGNvbGxpc2lvbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2YgdGhpcy5jdXJyZW50U2hhcGUuZ2V0T2Zmc2V0cygpKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSBvZmZzZXQueSArIHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpO1xyXG4gICAgICAgICAgICBsZXQgY29sID0gb2Zmc2V0LnggKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3cgPCAwIHx8IHJvdyA+PSB0aGlzLm1hdHJpeC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbCA8IDAgfHwgY29sID49IHRoaXMubWF0cml4W3Jvd10ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hdHJpeFtyb3ddW2NvbF0uZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbGxpc2lvbjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbnZlcnRTaGFwZVRvQ2VsbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIHRoaXMuY3VycmVudFNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgcm93SWR4ID0gb2Zmc2V0LnkgKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICAgICAgbGV0IGNvbElkeCA9IG9mZnNldC54ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm93SWR4IDwgMCB8fCByb3dJZHggPj0gdGhpcy5tYXRyaXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbElkeCA8IDAgfHwgY29sSWR4ID49IHRoaXMubWF0cml4W3Jvd0lkeF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDZWxsQ29sb3Iocm93SWR4LCBjb2xJZHgsIHRoaXMuY3VycmVudFNoYXBlLmNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGVja0ZvckdhbWVPdmVyKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gVE9ETzogRG8gaXRcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUFueUZpbGxlZExpbmVzKCkge1xyXG4gICAgICAgIGxldCBoaWdoZXN0TGluZUZpbGxlZCA9IDA7IC8vIFwiaGlnaGVzdFwiIGFzIGluIHRoZSBoaWdoZXN0IGluIHRoZSBhcnJheSwgd2hpY2ggaXMgdGhlIGxvd2VzdCB2aXN1YWxseSB0byB0aGUgcGxheWVyLlxyXG5cclxuICAgICAgICAvLyBUcmF2ZXJzZSBiYWNrd2FyZHMgdG8gcHJldmVudCByb3cgaW5kZXggZnJvbSBiZWNvbWluZyBvdXQgb2Ygc3luYyB3aGVuIHJlbW92aW5nIHJvd3MuXHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMTsgcm93SWR4ID49IDA7IHJvd0lkeC0tKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBsZXQgZmlsbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2VsbCBvZiByb3cpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjZWxsLmdldENvbG9yKCkgPT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZpbGxlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvd0lkeCA+IGhpZ2hlc3RMaW5lRmlsbGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGlnaGVzdExpbmVGaWxsZWQgPSByb3dJZHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUFuZENvbGxhcHNlKHJvd0lkeCk7XHJcbiAgICAgICAgICAgICAgICByb3dJZHggPSByb3dJZHggKyAxOyAvLyBUaGlzIGlzIGEgcmVhbGx5LCByZWFsbHkgc2hha3kgd29ya2Fyb3VuZC4gSXQgcHJldmVudHMgdGhlIG5leHQgcm93IGZyb20gZ2V0dGluZyBza2lwcGVkIG92ZXIgb24gbmV4dCBsb29wLlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBOb3RpZnkgZm9yIGFsbCBjZWxscyBmcm9tIDAgdG8gdGhlIGhpZ2hlc3RMaW5lRmlsbGVkLCB3aGljaCBjb3VsZCBiZSAwIGlmIG5vIHJvd3Mgd2VyZSBmaWxsZWQuXHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDw9IGhpZ2hlc3RMaW5lRmlsbGVkOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgQ2VsbENoYW5nZUV2ZW50KGNlbGwsIHJvd0lkeCwgY29sSWR4KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIHJlbW92ZXMgdGhlIG9sZCByb3cgYW5kIHB1dHMgYSBuZXcgcm93IGluIGl0cyBwbGFjZSBhdCBwb3NpdGlvbiAwLCB3aGljaCBpcyB0aGUgaGlnaGVzdCB2aXN1YWxseSB0byB0aGUgcGxheWVyLlxyXG4gICAgICogRGVsZWdhdGVzIGNlbGwgbm90aWZpY2F0aW9uIHRvIHRoZSBjYWxsaW5nIG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByZW1vdmVBbmRDb2xsYXBzZShyb3dJZHg6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubWF0cml4LnNwbGljZShyb3dJZHgsIDEpO1xyXG4gICAgICAgIHRoaXMubWF0cml4LnNwbGljZSgwLCAwLCBbXSk7XHJcbiAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4WzBdW2NvbElkeF0gPSBuZXcgQ2VsbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrRm9yR2FtZVdpbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIFRPRE86IERvIGl0XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQodGhpcy5jdXJyZW50U2hhcGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZpcmVBY3RpdmVTaGFwZUVuZGVkRXZlbnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgQWN0aXZlU2hhcGVFbmRlZEV2ZW50KHRoaXMuY3VycmVudFNoYXBlKSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGJvYXJkID0gbmV3IEJvYXJkKCk7IiwiaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi9zaGFwZSc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcblxyXG5jbGFzcyBTaGFwZUkgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBzcGF3bkNvbHVtbiA9IDM7XHJcbiAgICBjb2xvciA9IENvbG9yLkN5YW47XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSA0O1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZUogZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkJsdWU7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxufVxyXG5cclxuY2xhc3MgU2hhcGVMIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5PcmFuZ2U7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAxLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMSwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZU8gZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLlllbGxvdztcclxuICAgIHZhbHVlc1BlclJvdyA9IDQ7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlUyBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuR3JlZW47XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMSwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZVQgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLlB1cnBsZTtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlWiBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuUmVkO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMCwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVGYWN0b3J5IHtcclxuICAgIHByaXZhdGUgYmFnOiBTaGFwZVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMucmVmaWxsQmFnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFNoYXBlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmJhZy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlZmlsbEJhZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5iYWcucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWZpbGxCYWcoKSB7XHJcbiAgICAgICAgdGhpcy5iYWcgPSBbXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZUkoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlSigpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVMKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZU8oKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlUygpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVUKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZVooKVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIC8vIEZpc2hlci1ZYXRlcyBTaHVmZmxlLCBiYXNlZCBvbjogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjQ1MDk3NlxyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLmJhZy5sZW5ndGhcclxuICAgICAgICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxyXG4gICAgICAgIHdoaWxlICgwICE9PSBpZHgpIHtcclxuICAgICAgICAgICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXHJcbiAgICAgICAgICAgIGxldCBybmRJZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpZHgpO1xyXG4gICAgICAgICAgICBpZHggLT0gMTtcclxuICAgICAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxyXG4gICAgICAgICAgICBsZXQgdGVtcFZhbCA9IHRoaXMuYmFnW2lkeF07XHJcbiAgICAgICAgICAgIHRoaXMuYmFnW2lkeF0gPSB0aGlzLmJhZ1tybmRJZHhdO1xyXG4gICAgICAgICAgICB0aGlzLmJhZ1tybmRJZHhdID0gdGVtcFZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzaGFwZUZhY3RvcnkgPSBuZXcgU2hhcGVGYWN0b3J5KCk7XHJcbiIsImltcG9ydCB7Q2VsbE9mZnNldH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5cclxuY29uc3QgU1BBV05fQ09MID0gMzsgLy8gTGVmdCBzaWRlIG9mIG1hdHJpeCBzaG91bGQgY29ycmVzcG9uZCB0byB0aGlzLlxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNoYXBlIHtcclxuICAgIGFic3RyYWN0IHJlYWRvbmx5IGNvbG9yOiBDb2xvcjtcclxuICAgIGFic3RyYWN0IHJlYWRvbmx5IHZhbHVlc1BlclJvdzogbnVtYmVyO1xyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IG1hdHJpY2VzOiBSZWFkb25seUFycmF5PFJlYWRvbmx5QXJyYXk8bnVtYmVyPj47XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50TWF0cml4SW5kZXg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcm93OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGNvbDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID0gMDsgLy8gVE9ETzogRW5zdXJlIHBvc2l0aW9uIDAgaXMgdGhlIHNwYXduIHBvc2l0aW9uXHJcbiAgICAgICAgdGhpcy5yb3cgPSAwO1xyXG4gICAgICAgIHRoaXMuY29sID0gU1BBV05fQ09MO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgIHRoaXMuY29sLS07XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVJpZ2h0KCkge1xyXG4gICAgICAgIHRoaXMuY29sKys7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVVwKCkge1xyXG4gICAgICAgIHRoaXMucm93LS07XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZURvd24oKSB7XHJcbiAgICAgICAgdGhpcy5yb3crKztcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVDb3VudGVyQ2xvY2t3aXNlKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4IC09IDE7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVBcnJheUJvdW5kcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUNsb2Nrd2lzZSgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCArPSAxO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQXJyYXlCb3VuZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3coKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm93O1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb2w7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um93Q291bnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmdldEN1cnJlbnRNYXRyaXgoKS5sZW5ndGggLyB0aGlzLnZhbHVlc1BlclJvdyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0T2Zmc2V0cygpOiBDZWxsT2Zmc2V0W10ge1xyXG4gICAgICAgIGxldCBtYXRyaXggPSB0aGlzLmdldEN1cnJlbnRNYXRyaXgoKTtcclxuICAgICAgICBsZXQgb2Zmc2V0czogQ2VsbE9mZnNldFtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgbWF0cml4Lmxlbmd0aDsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWF0cml4W2lkeF07XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBpZHggJSB0aGlzLnZhbHVlc1BlclJvdztcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihpZHggLyB0aGlzLnZhbHVlc1BlclJvdyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0ID0gbmV3IENlbGxPZmZzZXQoeCwgeSk7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXRzLnB1c2gob2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2Zmc2V0cztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEN1cnJlbnRNYXRyaXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0cmljZXNbdGhpcy5jdXJyZW50TWF0cml4SW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZW5zdXJlQXJyYXlCb3VuZHMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudE1hdHJpeEluZGV4IDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IHRoaXMubWF0cmljZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID49IHRoaXMubWF0cmljZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge2JvYXJkfSBmcm9tICcuL2JvYXJkL2JvYXJkJztcclxuaW1wb3J0IHtucGNNYW5hZ2VyfSBmcm9tICcuL25wYy9ucGMtbWFuYWdlcic7XHJcbmltcG9ydCB7ZXZlbnRCdXMsIEV2ZW50VHlwZX0gZnJvbSAnLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50JztcclxuXHJcbmNsYXNzIE1vZGVsIHtcclxuICAgIFxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlBsYXllck1vdmVtZW50RXZlbnRUeXBlLCAoZXZlbnQ6IFBsYXllck1vdmVtZW50RXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVQbGF5ZXJNb3ZlbWVudChldmVudC5tb3ZlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGJvYXJkLnN0YXJ0KCk7XHJcbiAgICAgICAgbnBjTWFuYWdlci5zdGFydCgpO1xyXG5cclxuICAgICAgICBib2FyZC5iZWdpbk5ld0dhbWUoKTsgLy8gVE9ETzogSW5zdGVhZCwgc3RhcnQgZ2FtZSB3aGVuIHBsYXllciBoaXRzIGEga2V5IGZpcnN0LlxyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgYm9hcmQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBucGNNYW5hZ2VyLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVQbGF5ZXJNb3ZlbWVudChtb3ZlbWVudDogUGxheWVyTW92ZW1lbnQpIHtcclxuICAgICAgICBzd2l0Y2ggKG1vdmVtZW50KSB7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuTGVmdDpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZUxlZnQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlUmlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LkRvd246XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVEb3duKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Ecm9wOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlRG93bkFsbFRoZVdheSgpO1xyXG4gICAgICAgICAgICAgICAgYm9hcmQuc3RlcE5vdygpOyAvLyBwcmV2ZW50IGFueSBvdGhlciBrZXlzdHJva2VzIHRpbGwgbmV4dCB0aWNrXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Sb3RhdGVDbG9ja3dpc2U6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5yb3RhdGVTaGFwZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5oYW5kbGVkIG1vdmVtZW50Jyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IG1vZGVsID0gbmV3IE1vZGVsKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuaW1wb3J0IHtOcGN9IGZyb20gJy4vbnBjJ1xyXG5pbXBvcnQge05wY1N0YXRlfSBmcm9tICcuLi8uLi9kb21haW4vbnBjLXN0YXRlJztcclxuaW1wb3J0IHtldmVudEJ1cywgRXZlbnRUeXBlfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1N0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY1BsYWNlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtcGxhY2VkLWV2ZW50JztcclxuXHJcbi8vIFN0YXJ0aW5nIHBvc2l0aW9uIGNvdW50cyB1c2VkIGluIGluaXRpYWxpemF0aW9uLlxyXG5jb25zdCBUT1RBTF9OUENTID0gMTAwMDtcclxuXHJcbmNsYXNzIE5wY01hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgbnBjczogTWFwPG51bWJlciwgTnBjPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm5wY3MgPSBuZXcgTWFwPG51bWJlciwgTnBjPigpO1xyXG4gICAgICAgIGZvciAobGV0IG5wY0lkeCA9IDA7IG5wY0lkeCA8IFRPVEFMX05QQ1M7IG5wY0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBucGMgPSBuZXcgTnBjKCk7XHJcbiAgICAgICAgICAgIHRoaXMubnBjcy5zZXQobnBjLmlkLCBucGMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGUsIChldmVudDogU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm5wY3MuZm9yRWFjaCgobnBjOiBOcGMpID0+IHtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSAoTWF0aC5yYW5kb20oKSAqIDIwKSAtIDU7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IChNYXRoLnJhbmRvbSgpICogMjApICsgNTtcclxuICAgICAgICAgICAgICAgIG5wYy5zdGFydCh4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogTW92ZSB0aGlzIGVsc2V3aGVyZTpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSAoTWF0aC5yYW5kb20oKSAqIDIwKSAtIDU7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IChNYXRoLnJhbmRvbSgpICogMjApICsgNTtcclxuICAgICAgICAgICAgICAgIG5wYy5iZWdpbldhbGtpbmdUbyh4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ucGNzLmZvckVhY2goKG5wYzogTnBjKSA9PiB7XHJcbiAgICAgICAgICAgIG5wYy5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChldmVudDogU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBucGMgPSB0aGlzLm5wY3MuZ2V0KGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBpZiAobnBjICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICBsZXQgeSA9IGV2ZW50Lno7XHJcbiAgICAgICAgICAgIG5wYy51cGRhdGVQb3NpdGlvbih4LCB5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IG5wY01hbmFnZXIgPSBuZXcgTnBjTWFuYWdlcigpOyIsImltcG9ydCB7RXZlbnRUeXBlLCBldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtOcGNQbGFjZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLXBsYWNlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1tb3ZlbWVudC1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNTdGF0ZX0gZnJvbSAnLi4vLi4vZG9tYWluL25wYy1zdGF0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjIHtcclxuICAgIHJlYWRvbmx5IGlkOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0ZTogTnBjU3RhdGU7XHJcbiAgICBwcml2YXRlIHRpbWVJblN0YXRlOiBudW1iZXI7XHJcblxyXG4gICAgLy8gXCJMYXN0XCIgYXMgaW4gdGhlIGxhc3Qga25vd24gY29vcmRpbmF0ZSwgYmVjYXVzZSBpdCBjb3VsZCBiZSBjdXJyZW50bHkgaW4tbW90aW9uLlxyXG4gICAgcHJpdmF0ZSB4bGFzdDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB5bGFzdDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUik7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBOcGNTdGF0ZS5JZGxlO1xyXG4gICAgICAgIHRoaXMudGltZUluU3RhdGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnhsYXN0ID0gMDtcclxuICAgICAgICB0aGlzLnlsYXN0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueGxhc3QgPSB4O1xyXG4gICAgICAgIHRoaXMueWxhc3QgPSB5O1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IE5wY1BsYWNlZEV2ZW50KHRoaXMuaWQsIHRoaXMuc3RhdGUsIHgsIHkpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCBieSB0aGUgTlBDIG1hbmFnZXIgcmF0aGVyIHRoYW4gdHJhY2tzIHRoYXQgcmVmZXJlbmNlIHRoZW0uXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy50aW1lSW5TdGF0ZSArPSBlbGFwc2VkO1xyXG4gICAgfVxyXG5cclxuICAgIHRyYW5zaXRpb25UbyhzdGF0ZTogTnBjU3RhdGUpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy50aW1lSW5TdGF0ZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgYmVnaW5XYWxraW5nVG8oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCh0aGlzLmlkLCB4LCB5KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaWduaWZpZXMgdGhlIGVuZCBvZiBhIHdhbGsuXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy54bGFzdCA9IHg7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9IHk7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVG8oTnBjU3RhdGUuSWRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U3RhdGUoKTogTnBjU3RhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2V9IGZyb20gJy4vdmlldy9zdGFuZGVlL3N0YW5kZWUtYW5pbWF0aW9uLXRleHR1cmUtYmFzZSc7XHJcblxyXG5jbGFzcyBQcmVsb2FkZXIge1xyXG4gICAgXHJcbiAgICBwcmVsb2FkKGNhbGxiYWNrOiAoKSA9PiBhbnkpIHtcclxuICAgICAgICBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UucHJlbG9hZChjYWxsYmFjayk7XHJcbiAgICAgICAgLy8gVE9ETzogR29pbmcgdG8gaGF2ZSBhIHBhcmFsbGVsaXNtIG1lY2hhbmlzbSBhZnRlciBhZGRpbmcgbW9yZSB0byB0aGlzLlxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBwcmVsb2FkZXIgPSBuZXcgUHJlbG9hZGVyKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG4vLyBUT0RPOiBPbmx5IHRoZSAzcmQgZmxvb3IgZnJvbSB0aGUgdG9wIGFuZCBiZWxvdyBhcmUgdmlzaWJsZS4gQWxzbywgc2VlIGJvYXJkLnRzLlxyXG5leHBvcnQgY29uc3QgRkxPT1JfQ09VTlQgPSAxNztcclxuZXhwb3J0IGNvbnN0IFBBTkVMX0NPVU5UX1BFUl9GTE9PUiA9IDEwO1xyXG5cclxuY29uc3QgUE9JTlRfTElHSFRfQ09VTlQgPSA0O1xyXG5cclxuY2xhc3MgRW1pc3NpdmVJbnRlbnNpdHkge1xyXG4gICAgdmFsdWU6IG51bWJlcjtcclxufVxyXG5cclxuY2xhc3MgTGlnaHRpbmdHcmlkIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBwYW5lbHM6IGFueVtdW107XHJcbiAgICBwcml2YXRlIHBvaW50TGlnaHRzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgY3VycmVudFBvaW50TGlnaHRJZHg6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHB1bHNlVHdlZW46IGFueTtcclxuICAgIHByaXZhdGUgcHVsc2VUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZW1pc3NpdmVJbnRlbnNpdHk6IEVtaXNzaXZlSW50ZW5zaXR5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYW5lbHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBmbG9vcklkeCA9IDA7IGZsb29ySWR4IDwgRkxPT1JfQ09VTlQ7IGZsb29ySWR4KyspIHtcclxuICAgICAgICAgICAgdGhpcy5wYW5lbHNbZmxvb3JJZHhdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhbmVsSWR4ID0gMDsgcGFuZWxJZHggPCBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7IHBhbmVsSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgwLjYsIDAuNiwgMC4xKTsgLy8gVE9ETzogY2xvbmUoKSA/XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe2NvbG9yOiAweGYyZTlkOH0pO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhbmVsID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IHBhbmVsSWR4O1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBmbG9vcklkeCArIDE7IC8vIE9mZnNldCB1cCAxIGJlY2F1c2UgZ3JvdW5kIGlzIHkgPSAwLlxyXG4gICAgICAgICAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgICAgICAgICAgcGFuZWwucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFuZWxzW2Zsb29ySWR4XVtwYW5lbElkeF0gPSBwYW5lbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb2ludExpZ2h0cyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGNvdW50ID0gMDsgY291bnQgPCBQT0lOVF9MSUdIVF9DT1VOVDsgY291bnQrKykge1xyXG4gICAgICAgICAgICBsZXQgcG9pbnRMaWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmYwMGZmLCAxLjc1LCAxLjI1KTtcclxuLy8gVGhlc2UgdHdvIGxpbmVzIGFyZSBmb3IgZGVidWdnaW5nOlxyXG4vLyBsZXQgc3BoZXJlID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KCAwLjEsIDE2LCA4ICk7XHJcbi8vIHBvaW50TGlnaHQuYWRkKCBuZXcgVEhSRUUuTWVzaChzcGhlcmUsIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IDB4ZmZmZmZmfSkpKTtcclxuICAgICAgICAgICAgcG9pbnRMaWdodC5wb3NpdGlvbi5zZXQoLTEwMCwgLTEwMCwgMC4zMyk7IC8vIEp1c3QgZ2V0IGl0IG91dCBvZiB0aGUgd2F5IGZvciBub3dcclxuICAgICAgICAgICAgdGhpcy5wb2ludExpZ2h0cy5wdXNoKHBvaW50TGlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UG9pbnRMaWdodElkeCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMucHVsc2VUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5lbWlzc2l2ZUludGVuc2l0eSA9IG5ldyBFbWlzc2l2ZUludGVuc2l0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0byBmaXQgYWdhaW5zdCBidWlsZGluZy5cclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCgxLjksIDMuOCwgLTEuNTUpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuc2NhbGUuc2V0KDAuNywgMS4wLCAxKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgZmxvb3Igb2YgdGhpcy5wYW5lbHMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFuZWwgb2YgZmxvb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXAuYWRkKHBhbmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgcG9pbnRMaWdodCBvZiB0aGlzLnBvaW50TGlnaHRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAuYWRkKHBvaW50TGlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTWFrZSBjZWxscyBhcHBlYXIgdG8gcHVsc2UuXHJcbiAgICAgICAgdGhpcy5lbWlzc2l2ZUludGVuc2l0eS52YWx1ZSA9IDAuMzM7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkpXHJcbiAgICAgICAgICAgIC50byh7dmFsdWU6IDEuMH0sIDc1MClcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuU2ludXNvaWRhbC5Jbk91dClcclxuICAgICAgICAgICAgLnlveW8odHJ1ZSlcclxuICAgICAgICAgICAgLnJlcGVhdChJbmZpbml0eSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMucHVsc2VUd2VlbkVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwUHVsc2UoZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoUm9vbUxpZ2h0KGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIsIGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcGFuZWwgPSB0aGlzLnBhbmVsc1tmbG9vcklkeF1bcGFuZWxJZHhdO1xyXG4gICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlLnNldEhleChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZFBvaW50TGlnaHRUbyhmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyLCBjb2xvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHBvaW50TGlnaHQgPSB0aGlzLmdldE5leHRQb2ludExpZ2h0KCk7XHJcbiAgICAgICAgcG9pbnRMaWdodC5jb2xvci5zZXRIZXgoY29sb3IpO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHBhbmVsSWR4O1xyXG4gICAgICAgIGxldCB5ID0gZmxvb3JJZHggKyAxOyAvLyBPZmZzZXQgdXAgMSBiZWNhdXNlIGdyb3VuZCBpcyB5ID0gMC5cclxuICAgICAgICBsZXQgeiA9IDAuMzM7XHJcbiAgICAgICAgcG9pbnRMaWdodC5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXROZXh0UG9pbnRMaWdodCgpIHtcclxuICAgICAgICBsZXQgcG9pbnRMaWdodCA9IHRoaXMucG9pbnRMaWdodHNbdGhpcy5jdXJyZW50UG9pbnRMaWdodElkeF07XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UG9pbnRMaWdodElkeCsrO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQb2ludExpZ2h0SWR4ID49IFBPSU5UX0xJR0hUX0NPVU5UKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBvaW50TGlnaHRJZHggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9pbnRMaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBQdWxzZShlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5wdWxzZVR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLnB1bHNlVHdlZW4udXBkYXRlKHRoaXMucHVsc2VUd2VlbkVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBmbG9vciBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiBmbG9vcikge1xyXG4gICAgICAgICAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmVJbnRlbnNpdHkgPSB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBsaWdodGluZ0dyaWQgPSBuZXcgTGlnaHRpbmdHcmlkKCk7IiwiaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGxDaGFuZ2VFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvY2VsbC1jaGFuZ2UtZXZlbnQnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9hY3RpdmUtc2hhcGUtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVFbmRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9hY3RpdmUtc2hhcGUtZW5kZWQtZXZlbnQnO1xyXG5pbXBvcnQge2xpZ2h0aW5nR3JpZCwgRkxPT1JfQ09VTlQsIFBBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi9saWdodGluZy1ncmlkJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtDZWxsT2Zmc2V0fSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcblxyXG5jbGFzcyBTd2l0Y2hib2FyZCB7XHJcbiAgICBcclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGUsIChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5BY3RpdmVTaGFwZUVuZGVkRXZlbnRUeXBlLCAoZXZlbnQ6IEFjdGl2ZVNoYXBlRW5kZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGl2ZVNoYXBlRW5kZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkNlbGxDaGFuZ2VFdmVudFR5cGUsIChldmVudDogQ2VsbENoYW5nZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2VsbENoYW5nZUV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGlnaHRpbmdHcmlkLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGZsb29ySWR4ID0gdGhpcy5jb252ZXJ0Um93VG9GbG9vcihldmVudC5zaGFwZS5nZXRSb3coKSk7XHJcbiAgICAgICAgbGV0IHBhbmVsSWR4ID0gZXZlbnQuc2hhcGUuZ2V0Q29sKCk7XHJcbiAgICAgICAgbGV0IGNvbG9yID0gdGhpcy5jb252ZXJ0Q29sb3IoZXZlbnQuc2hhcGUuY29sb3IpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2YgZXZlbnQuc2hhcGUuZ2V0T2Zmc2V0cygpKSB7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXRGbG9vcklkeCA9IGZsb29ySWR4IC0gb2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIC8vIGlmIChvZmZzZXRGbG9vcklkeCA+PSBGTE9PUl9DT1VOVCkge1xyXG4gICAgICAgICAgICAgICAgLy8gY29udGludWU7IC8vIFNraXAgb2JzdHJ1Y3RlZCBmbG9vcnNcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0UGFuZWxJZHggPSBwYW5lbElkeCArIG9mZnNldC54O1xyXG4gICAgICAgICAgICBsaWdodGluZ0dyaWQuc2VuZFBvaW50TGlnaHRUbyhvZmZzZXRGbG9vcklkeCwgb2Zmc2V0UGFuZWxJZHgsIGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBY3RpdmVTaGFwZUVuZGVkRXZlbnQoZXZlbnQ6IEFjdGl2ZVNoYXBlRW5kZWRFdmVudCkge1xyXG4gICAgICAgIC8vIFRPRE86IE1heWJlIHNldCBzb21lIHNvcnQgb2YgYW5pbWF0aW9uIGluIG1vdGlvblxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2VsbENoYW5nZUV2ZW50KGV2ZW50OiBDZWxsQ2hhbmdlRXZlbnQpIHtcclxuICAgICAgICBsZXQgZmxvb3JJZHggPSB0aGlzLmNvbnZlcnRSb3dUb0Zsb29yKGV2ZW50LnJvdyk7XHJcbiAgICAgICAgaWYgKGZsb29ySWR4ID49IEZMT09SX0NPVU5UKSB7XHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gU2tpcCBvYnN0cnVjdGVkIGZsb29yc1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHBhbmVsSWR4ID0gZXZlbnQuY29sO1xyXG4gICAgICAgIGxldCBjb2xvciA9IHRoaXMuY29udmVydENvbG9yKGV2ZW50LmNlbGwuZ2V0Q29sb3IoKSk7XHJcbiAgICAgICAgbGlnaHRpbmdHcmlkLnN3aXRjaFJvb21MaWdodChmbG9vcklkeCwgcGFuZWxJZHgsIGNvbG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgY2VsbCByb3cvY29sIGNvb3JkaW5hdGVzIHRvIGZsb29yL3BhbmVsIGNvb3JkaW5hdGVzLlxyXG4gICAgICogQWNjb3VudCBmb3IgdGhlIHR3byBmbG9vcnMgdGhhdCBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuICg/KVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbnZlcnRSb3dUb0Zsb29yKHJvdzogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHRoaW5nID0gKEZMT09SX0NPVU5UIC0gcm93KSArIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29udmVydENvbG9yKGNvbG9yOiBDb2xvcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBudW1iZXI7XHJcbiAgICAgICAgc3dpdGNoIChjb2xvcikge1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkN5YW46XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4MDBmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuWWVsbG93OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGZmZmYwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLlB1cnBsZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHg4MDAwODA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5HcmVlbjpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgwMDgwMDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5SZWQ6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmYwMDAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuQmx1ZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgwMDAwZmY7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5PcmFuZ2U6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZhNTAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuV2hpdGU6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vIERlZmF1bHQgb3IgbWlzc2luZyBjYXNlIGlzIGJsYWNrLlxyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkVtcHR5OlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDAwMDAwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHN3aXRjaGJvYXJkID0gbmV3IFN3aXRjaGJvYXJkKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuLy8gRGltZW5zaW9ucyBvZiB0aGUgZW50aXJlIHNwcml0ZXNoZWV0OlxyXG5jb25zdCBTUFJJVEVTSEVFVF9XSURUSCAgID0gMjU2O1xyXG5jb25zdCBTUFJJVEVTSEVFVF9IRUlHSFQgID0gNTEyO1xyXG5cclxuLy8gRGltZW5zaW9ucyBvZiBvbmUgZnJhbWUgd2l0aGluIHRoZSBzcHJpdGVzaGVldDpcclxuY29uc3QgRlJBTUVfV0lEVEggICA9IDQ4O1xyXG5jb25zdCBGUkFNRV9IRUlHSFQgID0gNzI7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyIHtcclxuXHJcbiAgICByZWFkb25seSB0ZXh0dXJlOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IodGV4dHVyZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlIHtcclxuXHJcbiAgICBwcml2YXRlIHRleHR1cmU6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnRleHR1cmUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoY2FsbGJhY2s6ICgpID0+IGFueSkge1xyXG4gICAgICAgIGxldCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudC5wbmcnLCAodGV4dHVyZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGxvd3MgZm9yIHRleHR1cmUgZmxpcHBpbmcsIHdoZW4gbmVjZXNzYXJ5LlxyXG4gICAgICAgICAgICAvLyBOT1RFOiBUbyBkbyBzbywgc2V0IHJlcGVhdC54ICo9IC0xIGFuZCBvZmZzZXQueCAqPSAtMS5cclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlLndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XHJcblxyXG4gICAgICAgICAgICAvLyBIYXZlIGl0IHNob3cgb25seSBvbmUgZnJhbWUgYXQgYSB0aW1lOlxyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmUucmVwZWF0LnNldChcclxuICAgICAgICAgICAgICAgIEZSQU1FX1dJRFRIICAvIFNQUklURVNIRUVUX1dJRFRILFxyXG4gICAgICAgICAgICAgICAgRlJBTUVfSEVJR0hUIC8gU1BSSVRFU0hFRVRfSEVJR0hUXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgdGhlIGRlZmF1bHQgZnJhbWUgdG8gdGhlIHVwcGVyLWxlZnQgY29ybmVyXHJcbiAgICAgICAgICAgIC8vIFRPRE86IE5lY2Vzc2FyeT8gTWlnaHQgcmVtb3ZlIHRoaXMgYWZ0ZXIgYW5pbWF0aW9ucyBnZXQgZGVmaW5lZC5cclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlLm9mZnNldC5zZXQoXHJcbiAgICAgICAgICAgICAgICAoMCAqIChTUFJJVEVTSEVFVF9XSURUSCAgLSBGUkFNRV9XSURUSCApKSAvIFNQUklURVNIRUVUX1dJRFRILFxyXG4gICAgICAgICAgICAgICAgKDEgKiAoU1BSSVRFU0hFRVRfSEVJR0hUIC0gRlJBTUVfSEVJR0hUKSkgLyBTUFJJVEVTSEVFVF9IRUlHSFRcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmV3SW5zdGFuY2UoKTogU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyIHtcclxuICAgICAgICAvLyByZXR1cm4gdGhpcy50ZXh0dXJlLmNsb25lKCk7IC8vIFRoaXMgaXMgdGhlIGJhbmUgb2YgbXkgZXhpc3RlbmNlLlxyXG4gICAgICAgIGxldCB0ZXh0dXJlID0gdGhpcy50ZXh0dXJlLmNsb25lKCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXIodGV4dHVyZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dHVyZSh0ZXh0dXJlOiBhbnkpIHtcclxuICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UgPSBuZXcgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXIsIHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZX0gZnJvbSAnLi9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgc3ByaXRlOiBhbnk7XHJcbiAgICBwcml2YXRlIHRleHR1cmVXcmFwcGVyOiBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICB0aGlzLnRleHR1cmVXcmFwcGVyID0gc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlLm5ld0luc3RhbmNlKCk7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLlNwcml0ZU1hdGVyaWFsKHttYXA6IHRoaXMudGV4dHVyZVdyYXBwZXIudGV4dHVyZX0pO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZSA9IG5ldyBUSFJFRS5TcHJpdGUobWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnNjYWxlLnNldCgxLCAxLjUpOyAvLyBBZGp1c3QgYXNwZWN0IHJhdGlvIGZvciA0OCB4IDcyIHNpemUgZnJhbWVzLiBcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLnNwcml0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUubWF0ZXJpYWwuY29sb3Iuc2V0KDB4YWFhYWFhKTsgLy8gVE9ETzogU2V0IHRoaXMgZWxzZXdoZXJlXHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtTdGFuZGVlfSBmcm9tICcuL3N0YW5kZWUnO1xyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY01vdmVtZW50Q2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudCc7XHJcblxyXG5jb25zdCBZX09GRlNFVCA9IDAuNzU7IC8vIFNldHMgdGhlaXIgZmVldCBvbiB0aGUgZ3JvdW5kIHBsYW5lLlxyXG5cclxuY2xhc3MgU3RhbmRlZU1hbmFnZXIge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFuZGVlczogTWFwPG51bWJlciwgU3RhbmRlZT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YW5kZWVzID0gbmV3IE1hcDxudW1iZXIsIFN0YW5kZWU+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXRZKFlfT0ZGU0VUKTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY1BsYWNlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNQbGFjZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY1BsYWNlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RhbmRlZXMuZm9yRWFjaCgoc3RhbmRlZTogU3RhbmRlZSkgPT4ge1xyXG4gICAgICAgICAgICBzdGFuZGVlLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOcGNQbGFjZWRFdmVudChldmVudDogTnBjUGxhY2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IG5ldyBTdGFuZGVlKGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBzdGFuZGVlLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQoc3RhbmRlZS5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5zdGFuZGVlcy5zZXQoc3RhbmRlZS5ucGNJZCwgc3RhbmRlZSk7XHJcblxyXG4gICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Jbml0aWFsUG9zaXRpb24oc3RhbmRlZSwgeCwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtb3ZlVG9Jbml0aWFsUG9zaXRpb24oc3RhbmRlZTogU3RhbmRlZSwgeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICAvLyBUT0RPOiBVc2UgZXZlbnQueCwgZXZlbnQueSB3aXRoIHNjYWxpbmcgdG8gZGV0ZXJtaW5lIGRlc3RpbmF0aW9uXHJcbiAgICAgICAgc3RhbmRlZS5tb3ZlVG8oeCx6KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBzdGFuZGVlID0gdGhpcy5zdGFuZGVlcy5nZXQoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIGlmIChzdGFuZGVlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgICAgIHN0YW5kZWUud2Fsa1RvKHgsIHosIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc3RhbmRlZU1hbmFnZXIgPSBuZXcgU3RhbmRlZU1hbmFnZXIoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcbmRlY2xhcmUgY29uc3QgVFdFRU46IGFueTtcclxuXHJcbmltcG9ydCB7RXZlbnRUeXBlLCBldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9zdGFuZGVlLW1vdmVtZW50LWVuZGVkLWV2ZW50JztcclxuaW1wb3J0IHtTdGFuZGVlQW5pbWF0aW9ufSBmcm9tICcuL3N0YW5kZWUtYW5pbWF0aW9uJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlIHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICByZWFkb25seSBhbmltYXRpb246IFN0YW5kZWVBbmltYXRpb247XHJcblxyXG4gICAgcHJpdmF0ZSB3YWxrVHdlZW5FbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHdhbGtUd2VlbjogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5hbmltYXRpb24uZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCgtMjAwLCAwLCAtMjAwKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RlcFdhbGsoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbW1lZGlhdGVseSBzZXQgc3RhbmRlZSBvbiBnaXZlbiBwb3NpdGlvbi5cclxuICAgICAqL1xyXG4gICAgbW92ZVRvKHg6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoeCwgMCwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgc3RhbmRlZSBpbiBtb3Rpb24gdG93YXJkcyBnaXZlbiBwb3NpdGlvbi5cclxuICAgICAqIFNwZWVkIGRpbWVuc2lvbiBpcyAxIHVuaXQvc2VjLlxyXG4gICAgICovXHJcbiAgICB3YWxrVG8oeDogbnVtYmVyLCB6OiBudW1iZXIsIHNwZWVkOiBudW1iZXIpIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG93IGxvbmcgaXQgd291bGQgdGFrZSwgZ2l2ZW4gdGhlIHNwZWVkIHJlcXVlc3RlZC5cclxuICAgICAgICBsZXQgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoeCwgMCwgeikuc3ViKHRoaXMuZ3JvdXAucG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IHZlY3Rvci5sZW5ndGgoKTtcclxuICAgICAgICBsZXQgdGltZSA9IChkaXN0YW5jZSAvIHNwZWVkKSAqIDEwMDA7XHJcblxyXG4gICAgICAgIC8vIERlbGVnYXRlIHRvIHR3ZWVuLmpzLiBQYXNzIGluIGNsb3N1cmVzIGFzIGNhbGxiYWNrcyBiZWNhdXNlIG90aGVyd2lzZSAndGhpcycgd2lsbCByZWZlclxyXG4gICAgICAgIC8vIHRvIHRoZSBwb3NpdGlvbiBvYmplY3QsIHdoZW4gZXhlY3V0aW5nIHN0b3BXYWxrKCkuXHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLndhbGtUd2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmdyb3VwLnBvc2l0aW9uKVxyXG4gICAgICAgICAgICAudG8oe3g6IHgsIHo6IHp9LCB0aW1lKVxyXG4gICAgICAgICAgICAub25Db21wbGV0ZSgoKSA9PiB7IHRoaXMuc3RvcFdhbGsoKTsgfSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwV2FsayhlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy53YWxrVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy53YWxrVHdlZW4udXBkYXRlKHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RvcFdhbGsoKSB7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLndhbGtUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChcclxuICAgICAgICAgICAgdGhpcy5ucGNJZCxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnopXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7d29ybGR9IGZyb20gJy4vd29ybGQvd29ybGQnO1xyXG5pbXBvcnQge2xpZ2h0aW5nR3JpZH0gZnJvbSAnLi9saWdodGluZy9saWdodGluZy1ncmlkJztcclxuaW1wb3J0IHtzd2l0Y2hib2FyZH0gZnJvbSAnLi9saWdodGluZy9zd2l0Y2hib2FyZCc7XHJcbmltcG9ydCB7c3RhbmRlZU1hbmFnZXJ9IGZyb20gJy4vc3RhbmRlZS9zdGFuZGVlLW1hbmFnZXInO1xyXG5cclxuY2xhc3MgVmlldyB7XHJcblxyXG4gICAgcHJpdmF0ZSBzY2VuZTogYW55O1xyXG4gICAgcHJpdmF0ZSBjYW1lcmE6IGFueTtcclxuICAgIHByaXZhdGUgcmVuZGVyZXI6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHNwcml0ZTogYW55O1xyXG4gICAgcHJpdmF0ZSB0ZXh0dXJlOiBhbnk7XHJcbiAgICBwcml2YXRlIHJvdzogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjb2w6IG51bWJlcjtcclxuICAgIHByaXZhdGUgdHRsOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDYwLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMC4xLCAxMDAwKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FudGlhbGlhczogdHJ1ZX0pO1xyXG4gICAgICAgIC8vIHRoaXMucmVuZGVyZXIuc29ydE9iamVjdHMgPSBmYWxzZTsgLy8gRklYTUU6IEknbSBub3Qgc3VyZSB3aHkgSSdtIGFibGUgdG8gY29tbWVudCB0aGlzIG91dCBub3cuLi5cclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmRvU3RhcnQoKTtcclxuXHJcbiAgICAgICAgd29ybGQuc3RhcnQoKTtcclxuICAgICAgICBsaWdodGluZ0dyaWQuc3RhcnQoKTtcclxuICAgICAgICBzd2l0Y2hib2FyZC5zdGFydCgpO1xyXG4gICAgICAgIHN0YW5kZWVNYW5hZ2VyLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB3b3JsZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIGxpZ2h0aW5nR3JpZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHN3aXRjaGJvYXJkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgc3RhbmRlZU1hbmFnZXIuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgLy8gRklYTUU6IEknbSBub3QgcmVhbGx5IHN1cmUgd2h5IGl0IGlzIHNvcnRpbmcgdGhlc2UgY29ycmVjdGx5IHdpdGhvdXQgdGhpczpcclxuICAgICAgICAvLyBmb3IgKGxldCBvYmogb2Ygc3RhbmRlZU1hbmFnZXIuZ3JvdXAuY2hpbGRyZW4pIHtcclxuICAgICAgICAvLyAgICAgbGV0IGRpc3RhbmNlID0gdGhpcy5jYW1lcmEucG9zaXRpb24uZGlzdGFuY2VUbyhvYmoucG9zaXRpb24pO1xyXG4gICAgICAgIC8vICAgICBvYmoucmVuZGVyT3JkZXIgPSBkaXN0YW5jZSAqIC0xO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnR0bCAtPSBlbGFwc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLnR0bCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHRsID0gMjUwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jb2wrKztcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29sID49IDMpIHsgLy8gMyBpbWFnZXMgKyAyIGJsYW5rIHBhZGRpbmdcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMucm93Kys7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yb3cgPj0gNSkgeyAvLyA1IGltYWdlcyArIDIgYmxhbmsgcGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm93ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVXNpbmcgcGl4ZWxzOlxyXG4gICAgICAgICAgICBsZXQgeCA9IDQ4ICogdGhpcy5jb2w7XHJcbiAgICAgICAgICAgIGxldCB5ID0gNTEyIC0gKCh0aGlzLnJvdyArIDEpICogNzIpO1xyXG4gICAgICAgICAgICBsZXQgeHBjdCA9IHggLyAyNTY7XHJcbiAgICAgICAgICAgIGxldCB5cGN0ID0geSAvIDUxMjtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlLm9mZnNldC5zZXQoeHBjdCwgeXBjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkb1N0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHdvcmxkLmdyb3VwKTtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZChzdGFuZGVlTWFuYWdlci5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQobGlnaHRpbmdHcmlkLmdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogVGVtcG9yYXJ5IGZvciBkZWJ1Z2dpbmc/XHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQobmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDQwNDA0MCkpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5zZXQoLTMsIDAuNzUsIDE1KTsgLy8gQSBsaXR0bGUgaGlnaGVyIHRoYW4gZXllLWxldmVsIHdpdGggdGhlIE5QQ3MuXHJcbiAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDQsIDksIDApKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHJpdmF0ZSB0ZXh0dXJlTGVha05vdGVzKCkge1xyXG4gICAgLy8gICAgIGxldCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgIC8vICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudC5wbmcnLCAoKSA9PiB7XHJcbiAgICAvLyAgICAgICAgIC8vIHRoaXMudGV4dHVyZS53cmFwUyA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nOyAvLyBBbGxvd3MgZm9yIHRleHR1cmUgZmxpcHBpbmcsIHdoZW4gbmVjZXNzYXJ5LlxyXG4gICAgLy8gICAgICAgICB0aGlzLnRleHR1cmUucmVwZWF0LnNldCg0OC8yNTYsIDcyLzUxMik7IFxyXG4gICAgLy8gICAgICAgICAvLyB0aGlzLnRleHR1cmUub2Zmc2V0LnNldCgwICsgMC81LCAxIC0gMS83KTtcclxuXHJcbiAgICAvLyAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TcHJpdGVNYXRlcmlhbCh7bWFwOiB0aGlzLnRleHR1cmV9KTsgLy8gRklYTUU6IFdoeSBpc24ndCBkZXB0aFdyaXRlID0gdHJ1ZSBuZWVkZWQgYW55bW9yZT9cclxuICAgIC8vICAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgVEhSRUUuU3ByaXRlKG1hdGVyaWFsKTtcclxuICAgIC8vICAgICAgICAgdGhpcy5zcHJpdGUuc2NhbGUuc2V0KDUsIDcsIDEpOyAvLyBBZGp1c3RlZCBmb3Igc3ByaXRlc2hlZXQgcm93cyA9IDcsIGNvbHMgPSA1LlxyXG4gICAgLy8gICAgICAgICB0aGlzLnNwcml0ZS5wb3NpdGlvbi5zZXQoNSwgNi43NSwgMyk7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMuc3ByaXRlKTtcclxuXHJcbiAgICAvLyAgICAgICAgIHRoaXMucm93ID0gMDtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb2wgPSAwO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnR0bCA9IDEwMDtcclxuXHJcbiAgICAvLyAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwMDsgaSsrKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAvLyBsZXQgY2xvbmVkVGV4dHVyZSA9IHRoaXMudGV4dHVyZTtcclxuXHJcbiAgICAvLyAgICAgICAgICAgICAvLyBsZXQgY2xvbmVkVGV4dHVyZSA9IHRoaXMudGV4dHVyZS5jbG9uZSgpO1xyXG4gICAgLy8gICAgICAgICAgICAgLy8gY2xvbmVkVGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgLy8gICAgICAgICAgICAgbGV0IGNsb25lZFRleHR1cmUgPSB0aGlzLnRleHR1cmUuY2xvbmUoKTtcclxuICAgIC8vICAgICAgICAgICAgIGNsb25lZFRleHR1cmUuX193ZWJnbFRleHR1cmUgPSB0aGlzLnRleHR1cmUuX193ZWJnbFRleHR1cmU7XHJcbiAgICAvLyAgICAgICAgICAgICBjbG9uZWRUZXh0dXJlLl9fd2ViZ2xJbml0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgXHJcbiAgICAvLyAgICAgICAgICAgICBjbG9uZWRUZXh0dXJlLndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XHJcbiAgICAvLyAgICAgICAgICAgICBjbG9uZWRUZXh0dXJlLndyYXBUID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XHJcbiAgICAvLyAgICAgICAgICAgICBjbG9uZWRUZXh0dXJlLnJlcGVhdC5zZXQoMC41ICsgTWF0aC5yYW5kb20oKSwgMC41ICsgTWF0aC5yYW5kb20oKSk7XHJcbiAgICAvLyAgICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMSwgMSwgMSk7XHJcbiAgICAvLyAgICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIG1hcDogY2xvbmVkVGV4dHVyZSxcclxuICAgIC8vICAgICAgICAgICAgICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXHJcbiAgICAvLyAgICAgICAgICAgICB9KTtcclxuICAgIC8vICAgICAgICAgICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIC8vICAgICAgICAgICAgIG1lc2gucG9zaXRpb24ueCA9IE1hdGgucmFuZG9tKCkgKiAyMCAtIDU7IFxyXG4gICAgLy8gICAgICAgICAgICAgbWVzaC5wb3NpdGlvbi55ID0gTWF0aC5yYW5kb20oKSAqIDIwIC0gNTsgXHJcbiAgICAvLyAgICAgICAgICAgICBtZXNoLnBvc2l0aW9uLnogPSBNYXRoLnJhbmRvbSgpICogMjAgLSA1OyBcclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKG1lc2gpO1xyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCJUZXh0dXJlIGNvdW50OiBcIiArIHRoaXMucmVuZGVyZXIuaW5mby5tZW1vcnkudGV4dHVyZXMpO1xyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHZpZXcgPSBuZXcgVmlldygpO1xyXG4iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jbGFzcyBCdWlsZGluZyB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHNsYWI6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIG9sZCBwbGFpbiBjdWJlLlxyXG4gICAgICAgIC8vIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgxMSwgMjAsIDEwKTtcclxuICAgICAgICAvLyBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IDB4ZmZmZmZmfSk7XHJcbiAgICAgICAgLy8gdGhpcy5zbGFiID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICAvLyB0aGlzLnNsYWIucG9zaXRpb24uc2V0KDQuNSwgMTAsIC01LjgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGxldCBtdGxMb2FkZXIgPSBuZXcgVEhSRUUuTVRMTG9hZGVyKCk7XHJcbiAgICAgICAgbXRsTG9hZGVyLnNldFBhdGgoJycpO1xyXG4gICAgICAgIG10bExvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5tdGwnLCAobWF0ZXJpYWxzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgbWF0ZXJpYWxzLnByZWxvYWQoKTtcclxuICAgICAgICAgICAgbGV0IG9iakxvYWRlciA9IG5ldyBUSFJFRS5PQkpMb2FkZXIoKTtcclxuICAgICAgICAgICAgb2JqTG9hZGVyLnNldE1hdGVyaWFscyhtYXRlcmlhbHMpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIuc2V0UGF0aCgnJyk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5vYmonLCAob2JqOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIG9iai5zY2FsZS5zZXRTY2FsYXIoMC4yNSk7XHJcbiAgICAgICAgICAgICAgICBvYmoucG9zaXRpb24uc2V0KDUsIC0wLjAxLCAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXAuYWRkKG9iaik7XHJcbiAgICAgICAgICAgIH0sICgpID0+IHsgfSwgKCkgPT4geyBjb25zb2xlLmxvZygnZXJyb3Igd2hpbGUgbG9hZGluZyA6KCcpIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgYnVpbGRpbmcgPSBuZXcgQnVpbGRpbmcoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBncmFzczogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMzAwLCAzMDApO1xyXG4gICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtlbWlzc2l2ZTogMHgwMjFkMDMsIGVtaXNzaXZlSW50ZW5zaXR5OiAxLjB9KTtcclxuICAgICAgICB0aGlzLmdyYXNzID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLmdyYXNzLnJvdGF0aW9uLnggPSAoTWF0aC5QSSAqIDMpIC8gMjtcclxuICAgICAgICB0aGlzLmdyYXNzLnBvc2l0aW9uLnNldCgwLCAwLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmdyYXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGdyb3VuZCA9IG5ldyBHcm91bmQoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jb25zdCBTVEFSVF9aX0FOR0xFID0gLShNYXRoLlBJIC8gMzApO1xyXG5jb25zdCBFTkRfWl9BTkdMRSAgID0gICBNYXRoLlBJIC8gMzA7XHJcbmNvbnN0IFJPVEFUSU9OX1NQRUVEID0gMC4wMDAxO1xyXG5cclxuY2xhc3MgU2t5IHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgZG9tZTogYW55O1xyXG4gICAgcHJpdmF0ZSByZHo6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSg1MCwgMzIsIDMyKTsgLy8gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDE1MCwgMTUwLCAxNTApO1xyXG4gICAgICAgIGxldCB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5nZW5lcmF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHttYXA6IHRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlfSk7XHJcbiAgICAgICAgdGhpcy5kb21lID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLmRvbWUubWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkJhY2tTaWRlO1xyXG4gICAgICAgIHRoaXMuZG9tZS5wb3NpdGlvbi5zZXQoMTAsIDEwLCAwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmRvbWUpO1xyXG5cclxuICAgICAgICB0aGlzLnJkeiA9IC1ST1RBVElPTl9TUEVFRDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmRvbWUucm90YXRpb24uc2V0KDAsIDAsIFNUQVJUX1pfQU5HTEUpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5kb21lLnJvdGF0aW9uLnNldCgwLCAwLCB0aGlzLmRvbWUucm90YXRpb24ueiArIHRoaXMucmR6KTtcclxuICAgICAgICBpZiAodGhpcy5kb21lLnJvdGF0aW9uLnogPj0gRU5EX1pfQU5HTEUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZHogPSAtUk9UQVRJT05fU1BFRUQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRvbWUucm90YXRpb24ueiA8PSBTVEFSVF9aX0FOR0xFKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmR6ID0gUk9UQVRJT05fU1BFRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZWQgb246IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE5OTkyNTA1XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2VuZXJhdGVUZXh0dXJlKCk6IGFueSB7XHJcbiAgICAgICAgbGV0IHNpemUgPSA1MTI7XHJcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHNpemU7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHNpemU7XHJcbiAgICAgICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIGN0eC5yZWN0KDAsIDAsIHNpemUsIHNpemUpO1xyXG4gICAgICAgIGxldCBncmFkaWVudCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCBzaXplKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC4wMCwgJyMwMDAwMDAnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC40MCwgJyMxMzFjNDUnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC43NSwgJyNmZjk1NDQnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC44NSwgJyMxMzFjNDUnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMS4wMCwgJyMxMzFjNDUnKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZ3JhZGllbnQ7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICByZXR1cm4gY2FudmFzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBza3kgPSBuZXcgU2t5KCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtza3l9IGZyb20gJy4vc2t5JztcclxuaW1wb3J0IHtidWlsZGluZ30gZnJvbSAnLi9idWlsZGluZyc7XHJcbmltcG9ydCB7Z3JvdW5kfSBmcm9tICcuL2dyb3VuZCc7XHJcblxyXG5jbGFzcyBXb3JsZCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHNreS5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQoYnVpbGRpbmcuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKGdyb3VuZC5ncm91cCk7XHJcblxyXG4gICAgICAgIHNreS5zdGFydCgpO1xyXG4gICAgICAgIGJ1aWxkaW5nLnN0YXJ0KCk7XHJcbiAgICAgICAgZ3JvdW5kLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBza3kuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBidWlsZGluZy5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIGdyb3VuZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCB3b3JsZCA9IG5ldyBXb3JsZCgpOyJdfQ==
