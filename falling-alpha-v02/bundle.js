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
},{"./controller/controller":1,"./game-state":13,"./model/model":18,"./preloader":21,"./view/view":30}],15:[function(require,module,exports){
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
                var x = (Math.random() * 7);
                var y = (Math.random() * 15);
                npc.start(x, y);
            }
            // TODO: Move this elsewhere:
            {
                var x = (Math.random() * 7);
                var y = (Math.random() * 15);
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
},{"./view/standee/standee-animation-texture-base":26}],22:[function(require,module,exports){
"use strict";
var ASPECT_RATIO = 16 / 9;
var CameraWrapper = (function () {
    function CameraWrapper() {
        this.camera = new THREE.PerspectiveCamera(60, ASPECT_RATIO, 0.1, 1000);
    }
    CameraWrapper.prototype.updateRendererSize = function (renderer) {
        var windowAspectRatio = window.innerWidth / window.innerHeight;
        var width, height;
        if (windowAspectRatio > ASPECT_RATIO) {
            // Too wide; scale off of window height.
            width = Math.floor(window.innerHeight * ASPECT_RATIO);
            height = window.innerHeight;
        }
        else if (windowAspectRatio <= ASPECT_RATIO) {
            // Too narrow or just right; scale off of window width.
            width = window.innerWidth;
            height = Math.floor(window.innerWidth / ASPECT_RATIO);
        }
        renderer.setSize(width, height);
        // Should be no need to update aspect ratio because it should be constant.
        // this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    };
    CameraWrapper.prototype.setPosition = function (x, y, z) {
        this.camera.position.set(x, y, z);
    };
    CameraWrapper.prototype.lookAt = function (vec3) {
        this.camera.lookAt(vec3);
    };
    return CameraWrapper;
}());
exports.cameraWrapper = new CameraWrapper();
},{}],23:[function(require,module,exports){
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
    // TODO: Move this into a loader
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
exports.Building = Building;
},{}],24:[function(require,module,exports){
"use strict";
var building_1 = require('./building');
// TODO: Only the 3rd floor from the top and below are visible. Also, see board.ts.
exports.FLOOR_COUNT = 17;
exports.PANEL_COUNT_PER_FLOOR = 10;
var ACTIVE_SHAPE_LIGHT_COUNT = 4;
var EmissiveIntensity = (function () {
    function EmissiveIntensity() {
    }
    return EmissiveIntensity;
}());
var LightingGrid = (function () {
    function LightingGrid() {
        this.group = new THREE.Object3D();
        this.panelGroup = new THREE.Object3D();
        this.building = new building_1.Building();
        this.panels = [];
        for (var floorIdx = 0; floorIdx < exports.FLOOR_COUNT; floorIdx++) {
            this.panels[floorIdx] = [];
            for (var panelIdx = 0; panelIdx < exports.PANEL_COUNT_PER_FLOOR; panelIdx++) {
                var geometry = new THREE.BoxGeometry(0.6, 0.6, 0.1); // TODO: clone() ?
                var material = new THREE.MeshLambertMaterial();
                var panel = new THREE.Mesh(geometry, material);
                panel.visible = false;
                var x = panelIdx;
                var y = floorIdx + 1; // Offset up 1 because ground is y = 0.
                var z = 0;
                panel.position.set(x, y, z);
                this.panels[floorIdx][panelIdx] = panel;
            }
        }
        this.pointLights = [];
        for (var count = 0; count < ACTIVE_SHAPE_LIGHT_COUNT; count++) {
            var pointLight = new THREE.PointLight(0xff00ff, 2, 1.5);
            // // These two lines are for debugging:
            // let sphere = new THREE.SphereGeometry( 0.1, 16, 8 );
            // pointLight.add( new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0xffffff})));
            var geometry = new THREE.BoxGeometry(0.6, 0.6, 0.1);
            var material = new THREE.MeshPhongMaterial({ color: 0xffffff });
            var glass = new THREE.Mesh(geometry, material);
            glass.position.setZ(-0.33); // Should be on same level as regular cells.
            pointLight.add(glass);
            pointLight.position.set(-100, -100, 0.33); // Just get it out of the way for now
            this.pointLights.push(pointLight);
        }
        this.currentPointLightIdx = 0;
        this.pulseTween = null;
        this.pulseTweenElapsed = 0;
        this.emissiveIntensity = new EmissiveIntensity();
    }
    LightingGrid.prototype.start = function () {
        this.group.add(this.building.group);
        this.group.add(this.panelGroup);
        this.building.start();
        for (var _i = 0, _a = this.panels; _i < _a.length; _i++) {
            var floor = _a[_i];
            for (var _b = 0, floor_1 = floor; _b < floor_1.length; _b++) {
                var panel = floor_1[_b];
                this.panelGroup.add(panel);
            }
        }
        for (var _c = 0, _d = this.pointLights; _c < _d.length; _c++) {
            var pointLight = _d[_c];
            this.panelGroup.add(pointLight);
        }
        // Transform to fit against building.
        this.panelGroup.position.set(1.9, 3.8, -1.55);
        this.panelGroup.scale.set(0.7, 1.0, 1);
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
    LightingGrid.prototype.switchRoomOff = function (floorIdx, panelIdx) {
        var panel = this.panels[floorIdx][panelIdx];
        panel.visible = false;
    };
    LightingGrid.prototype.switchRoomOn = function (floorIdx, panelIdx, color) {
        var panel = this.panels[floorIdx][panelIdx];
        panel.visible = true;
        panel.material.emissive.setHex(color);
    };
    LightingGrid.prototype.sendActiveShapeLightTo = function (floorIdx, panelIdx, color) {
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
        if (this.currentPointLightIdx >= ACTIVE_SHAPE_LIGHT_COUNT) {
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
exports.LightingGrid = LightingGrid;
},{"./building":23}],25:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var lighting_grid_1 = require('./lighting-grid');
var Switchboard = (function () {
    function Switchboard(lightingGrid) {
        this.lightingGrid = lightingGrid;
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
            if (offsetFloorIdx >= lighting_grid_1.FLOOR_COUNT) {
                continue; // Skip obstructed floors
            }
            var offsetPanelIdx = panelIdx + offset.x;
            this.lightingGrid.sendActiveShapeLightTo(offsetFloorIdx, offsetPanelIdx, color);
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
        if (event.cell.getColor() === 0 /* Empty */) {
            this.lightingGrid.switchRoomOff(floorIdx, panelIdx);
        }
        else {
            var color = this.convertColor(event.cell.getColor());
            this.lightingGrid.switchRoomOn(floorIdx, panelIdx, color);
        }
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
exports.Switchboard = Switchboard;
},{"../../event/event-bus":8,"./lighting-grid":24}],26:[function(require,module,exports){
"use strict";
// Dimensions of the entire spritesheet:
exports.SPRITESHEET_WIDTH = 256;
exports.SPRITESHEET_HEIGHT = 512;
// Dimensions of one frame within the spritesheet:
exports.FRAME_WIDTH = 48;
exports.FRAME_HEIGHT = 72;
var TOTAL_DIFFERENT_TEXTURES = 3;
var StandeeAnimationTextureWrapper = (function () {
    function StandeeAnimationTextureWrapper(texture) {
        this.texture = texture;
    }
    return StandeeAnimationTextureWrapper;
}());
exports.StandeeAnimationTextureWrapper = StandeeAnimationTextureWrapper;
var StandeeAnimationTextureBase = (function () {
    function StandeeAnimationTextureBase() {
        this.textures = [];
        this.loadedCount = 0;
        this.currentTextureIdx = 0;
    }
    StandeeAnimationTextureBase.prototype.preload = function (callback) {
        var _this = this;
        var textureLoadedHandler = function (texture) {
            // Have it show only one frame at a time:
            texture.repeat.set(exports.FRAME_WIDTH / exports.SPRITESHEET_WIDTH, exports.FRAME_HEIGHT / exports.SPRITESHEET_HEIGHT);
            _this.textures.push(texture);
            _this.loadedCount++;
            if (_this.loadedCount >= TOTAL_DIFFERENT_TEXTURES) {
                callback();
            }
        };
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load('fall-student.png', textureLoadedHandler);
        textureLoader.load('fall-student2.png', textureLoadedHandler);
        textureLoader.load('fall-student3.png', textureLoadedHandler);
    };
    StandeeAnimationTextureBase.prototype.newInstance = function () {
        var idx = this.getNextTextureIdx();
        var texture = this.textures[idx].clone(); // Cloning textures in the version of ThreeJS that I am currently using will duplicate them :(
        return new StandeeAnimationTextureWrapper(texture);
    };
    StandeeAnimationTextureBase.prototype.getNextTextureIdx = function () {
        this.currentTextureIdx++;
        if (this.currentTextureIdx >= TOTAL_DIFFERENT_TEXTURES) {
            this.currentTextureIdx = 0;
        }
        return this.currentTextureIdx;
    };
    return StandeeAnimationTextureBase;
}());
exports.standeeAnimationTextureBase = new StandeeAnimationTextureBase();
},{}],27:[function(require,module,exports){
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
},{"../../event/event-bus":8,"./standee":29}],28:[function(require,module,exports){
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
var StandeeAnimation = (function () {
    function StandeeAnimation(type, next) {
        this.type = type;
        if (next) {
            this.next = next;
        }
        else {
            this.next = type;
        }
        this.frames = [];
        this.delays = [];
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
        var material = new THREE.SpriteMaterial({ map: this.textureWrapper.texture, color: 0x999999 });
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(1, 1.5); // Adjust aspect ratio for 48 x 72 size frames. 
        this.group.add(this.sprite);
        // Initialize default animation to standing facing down:
        this.currentAnimation = createStandDown();
    }
    StandeeSpriteWrapper.prototype.start = function () {
        // TODO: Set this elsewhere
    };
    StandeeSpriteWrapper.prototype.step = function (elapsed) {
        this.stepCurrentFrame(elapsed);
    };
    /**
     * Only switches if the given animation is different from the current one.
     */
    StandeeSpriteWrapper.prototype.switchAnimation = function (type) {
        var animation = determineAnimation(type);
        if (this.currentAnimation.type !== animation.type) {
            this.currentAnimation = animation;
        }
    };
    StandeeSpriteWrapper.prototype.stepCurrentFrame = function (elapsed) {
        if (this.currentAnimation == null) {
            return;
        }
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
        case 0 /* StandUp */:
            animation = createStandUp();
            break;
        case 4 /* WalkUp */:
            animation = createWalkUp();
            break;
        case 1 /* StandDown */:
            animation = createStandDown();
            break;
        case 5 /* WalkDown */:
            animation = createWalkDown();
            break;
        case 2 /* StandLeft */:
            animation = createStandLeft();
            break;
        case 6 /* WalkLeft */:
            animation = createWalkLeft();
            break;
        case 3 /* StandRight */:
            animation = createStandRight();
            break;
        case 7 /* WalkRight */:
            animation = createWalkRight();
            break;
        case 8 /* CheerUp */:
            animation = createCheerUp();
            break;
        case 9 /* PanicUp */:
            animation = createPanicUp();
            break;
        case 10 /* PanicDown */:
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
    var animation = new StandeeAnimation(0 /* StandUp */);
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
    var animation = new StandeeAnimation(4 /* WalkUp */);
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
    var animation = new StandeeAnimation(1 /* StandDown */);
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
    var animation = new StandeeAnimation(5 /* WalkDown */);
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
    var animation = new StandeeAnimation(2 /* StandLeft */);
    animation.push(standLeftFrame1);
    return animation;
}
// Walking Left
var walkLeftFrame1 = new StandeeAnimationFrame(1, 1);
var walkLeftFrame2 = new StandeeAnimationFrame(1, 0);
var walkLeftFrame3 = new StandeeAnimationFrame(1, 1);
var walkLeftFrame4 = new StandeeAnimationFrame(1, 2);
function createWalkLeft() {
    var animation = new StandeeAnimation(6 /* WalkLeft */);
    animation.push(walkLeftFrame1);
    animation.push(walkLeftFrame2);
    animation.push(walkLeftFrame3);
    animation.push(walkLeftFrame4);
    return animation;
}
// Standing Right
var standRightFrame1 = new StandeeAnimationFrame(1, 4);
function createStandRight() {
    var animation = new StandeeAnimation(3 /* StandRight */);
    animation.push(standRightFrame1);
    return animation;
}
// Walking Right
var walkRightFrame1 = new StandeeAnimationFrame(1, 4);
var walkRightFrame2 = new StandeeAnimationFrame(2, 4);
var walkRightFrame3 = new StandeeAnimationFrame(1, 4);
var walkRightFrame4 = new StandeeAnimationFrame(0, 4);
function createWalkRight() {
    var animation = new StandeeAnimation(7 /* WalkRight */);
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
    var animation = new StandeeAnimation(8 /* CheerUp */);
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
    var animation = new StandeeAnimation(9 /* PanicUp */);
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
    var animation = new StandeeAnimation(10 /* PanicDown */);
    animation.push(panicDownFrame1);
    animation.push(panicDownFrame2);
    animation.push(panicDownFrame3);
    animation.push(panicDownFrame4);
    return animation;
}
},{"./standee-animation-texture-base":26}],29:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var standee_movement_ended_event_1 = require('../../event/standee-movement-ended-event');
var standee_sprite_wrapper_1 = require('./standee-sprite-wrapper');
var camera_wrapper_1 = require('../camera-wrapper');
var Standee = (function () {
    function Standee(npcId) {
        this.npcId = npcId;
        this.group = new THREE.Object3D();
        this.spriteWrapper = new standee_sprite_wrapper_1.StandeeSpriteWrapper();
        this.group.add(this.spriteWrapper.group);
        this.walkTweenElapsed = 0;
        this.walkTween = null;
        this.facing = new THREE.Vector3();
    }
    Standee.prototype.start = function () {
        this.group.position.set(-200, 0, -200);
    };
    Standee.prototype.step = function (elapsed) {
        this.stepWalk(elapsed);
        this.ensureCorrectAnimation();
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
        // Update direction this standee will be facing when walking.
        this.facing.setX(x - this.group.position.x);
        this.facing.setZ(z - this.group.position.z);
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
    Standee.prototype.ensureCorrectAnimation = function () {
        // let target = this.group.position.clone();
        // target.setY(target.y + 0.5);
        // cameraWrapper.camera.lookAt(target);
        // Angle between two vectors: http://stackoverflow.com/a/21484228
        var worldDirection = camera_wrapper_1.cameraWrapper.camera.getWorldDirection();
        var angle = Math.atan2(this.facing.z, this.facing.x) - Math.atan2(worldDirection.z, worldDirection.x);
        if (angle < 0)
            angle += 2 * Math.PI;
        angle *= (180 / Math.PI); // It's my party and I'll use degrees if I want to.
        if (this.walkTween != null) {
            if (angle < 60 || angle >= 300) {
                this.spriteWrapper.switchAnimation(4 /* WalkUp */);
            }
            else if (angle >= 60 && angle < 120) {
                this.spriteWrapper.switchAnimation(7 /* WalkRight */);
            }
            else if (angle >= 120 && angle < 240) {
                this.spriteWrapper.switchAnimation(5 /* WalkDown */);
            }
            else if (angle >= 240 && angle < 300) {
                this.spriteWrapper.switchAnimation(6 /* WalkLeft */);
            }
        }
        else {
            if (angle < 60 || angle >= 300) {
                this.spriteWrapper.switchAnimation(0 /* StandUp */);
            }
            else if (angle >= 60 && angle < 120) {
                this.spriteWrapper.switchAnimation(3 /* StandRight */);
            }
            else if (angle >= 120 && angle < 240) {
                this.spriteWrapper.switchAnimation(1 /* StandDown */);
            }
            else if (angle >= 240 && angle < 300) {
                this.spriteWrapper.switchAnimation(2 /* StandLeft */);
            }
        }
    };
    return Standee;
}());
exports.Standee = Standee;
},{"../../event/event-bus":8,"../../event/standee-movement-ended-event":12,"../camera-wrapper":22,"./standee-sprite-wrapper":28}],30:[function(require,module,exports){
"use strict";
var camera_wrapper_1 = require('./camera-wrapper');
var world_1 = require('./world/world');
var lighting_grid_1 = require('./lighting/lighting-grid');
var switchboard_1 = require('./lighting/switchboard');
var standee_manager_1 = require('./standee/standee-manager');
var View = (function () {
    function View() {
        this.scene = new THREE.Scene();
        this.canvas = document.getElementById('canvas');
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
        this.playerGrid = new lighting_grid_1.LightingGrid();
        this.playerSwitchboard = new switchboard_1.Switchboard(this.playerGrid);
        this.aiGrid = new lighting_grid_1.LightingGrid();
        this.aiSwitchboard = new switchboard_1.Switchboard(this.aiGrid);
    }
    View.prototype.start = function () {
        this.playerGrid.start();
        this.playerSwitchboard.start();
        this.aiGrid.start();
        this.aiSwitchboard.start();
        this.doStart();
        world_1.world.start();
        standee_manager_1.standeeManager.start();
        // The canvas should have been hidden until setup is complete.
        this.canvas.style.display = 'inline';
    };
    View.prototype.step = function (elapsed) {
        world_1.world.step(elapsed);
        this.playerSwitchboard.step(elapsed);
        this.playerGrid.step(elapsed);
        this.aiGrid.step(elapsed);
        this.playerSwitchboard.step(elapsed);
        standee_manager_1.standeeManager.step(elapsed);
        this.renderer.render(this.scene, camera_wrapper_1.cameraWrapper.camera);
    };
    View.prototype.doStart = function () {
        var _this = this;
        this.scene.add(world_1.world.group);
        this.scene.add(standee_manager_1.standeeManager.group);
        this.scene.add(this.playerGrid.group);
        this.scene.add(this.aiGrid.group);
        this.aiGrid.group.position.setX(10);
        // TODO: Temporary for debugging?
        // this.scene.add(new THREE.AmbientLight(0x404040));
        // TODO: Temporary
        var spotLight = new THREE.SpotLight(0xbbbbff);
        spotLight.position.set(-3, 0.75, 15);
        spotLight.target = this.playerGrid.group;
        this.scene.add(spotLight);
        camera_wrapper_1.cameraWrapper.setPosition(-3, 0.75, 15); // More or less eye-level with the NPCs.
        camera_wrapper_1.cameraWrapper.lookAt(new THREE.Vector3(3, 8, 1));
        camera_wrapper_1.cameraWrapper.updateRendererSize(this.renderer);
        window.addEventListener('resize', function () {
            camera_wrapper_1.cameraWrapper.updateRendererSize(_this.renderer);
        });
    };
    return View;
}());
exports.view = new View();
},{"./camera-wrapper":22,"./lighting/lighting-grid":24,"./lighting/switchboard":25,"./standee/standee-manager":27,"./world/world":33}],31:[function(require,module,exports){
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
},{}],32:[function(require,module,exports){
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
},{}],33:[function(require,module,exports){
"use strict";
var sky_1 = require('./sky');
var ground_1 = require('./ground');
var World = (function () {
    function World() {
        this.group = new THREE.Object3D();
    }
    World.prototype.start = function () {
        this.group.add(sky_1.sky.group);
        this.group.add(ground_1.ground.group);
        sky_1.sky.start();
        ground_1.ground.start();
    };
    World.prototype.step = function (elapsed) {
        sky_1.sky.step(elapsed);
        ground_1.ground.step(elapsed);
    };
    return World;
}());
exports.world = new World();
},{"./ground":31,"./sky":32}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2NvbnRyb2xsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2lucHV0LnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL2NlbGwudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vcGxheWVyLW1vdmVtZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9hY3RpdmUtc2hhcGUtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9jZWxsLWNoYW5nZS1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2V2ZW50LWJ1cy50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy1tb3ZlbWVudC1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvbnBjLXBsYWNlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9nYW1lLXN0YXRlLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL2JvYXJkLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvc2hhcGUtZmFjdG9yeS50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL3NoYXBlLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbW9kZWwudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvbnBjLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvbnBjLnRzIiwic3JjL3NjcmlwdHMvcHJlbG9hZGVyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9jYW1lcmEtd3JhcHBlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvYnVpbGRpbmcudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2xpZ2h0aW5nLWdyaWQudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL3N3aXRjaGJvYXJkLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUtYW5pbWF0aW9uLXRleHR1cmUtYmFzZS50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1zcHJpdGUtd3JhcHBlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLnRzIiwic3JjL3NjcmlwdHMvdmlldy92aWV3LnRzIiwic3JjL3NjcmlwdHMvdmlldy93b3JsZC9ncm91bmQudHMiLCJzcmMvc2NyaXB0cy92aWV3L3dvcmxkL3NreS50cyIsInNyYy9zY3JpcHRzL3ZpZXcvd29ybGQvd29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUEsc0JBQXlCLFNBQVMsQ0FBQyxDQUFBO0FBQ25DLDBCQUF1QixvQkFBb0IsQ0FBQyxDQUFBO0FBQzVDLGdDQUE2QiwyQkFBMkIsQ0FBQyxDQUFBO0FBQ3pELHNDQUFrQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRW5FLDZIQUE2SDtBQUU3SDtJQUFBO0lBMkJBLENBQUM7SUF6QkcsMEJBQUssR0FBTDtRQUNJLGFBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQseUJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsRUFBRSxDQUFDLENBQUMsYUFBSyxDQUFDLGtCQUFrQixDQUFDLFVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxvQkFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLDJDQUFtQixDQUFDLGdDQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsYUFBSyxDQUFDLGtCQUFr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Q1ksYUFBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtpbnB1dCwgS2V5fSBmcm9tICcuL2lucHV0JztcclxuaW1wb3J0IHtldmVudEJ1c30gZnJvbSAnLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50JztcclxuXHJcbi8vIFRPRE86IEhlcmUgZGV0ZXJtaW5lIGlmIHBsYXllciBpcyBob2xkaW5nIGRvd24gb25lIG9mIHRoZSBhcnJvdyBrZXlzOyBpZiBzbywgZmlyZSByYXBpZCBldmVudHMgYWZ0ZXIgKFRCRCkgYW1vdW50IG9mIHRpbWUuXHJcblxyXG5jbGFzcyBDb250cm9sbGVyIHtcclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBpbnB1dC5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuVXApKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUm90YXRlQ2xvY2t3aXNlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5MZWZ0KSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkxlZnQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LlJpZ2h0KSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LlJpZ2h0KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5Eb3duKSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkRvd24pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LlNwYWNlKSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkRyb3ApKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcigpOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uLy4uLy4uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0L2xpYi9saWIuZXM2LmQudHMnLz5cclxuXHJcbmV4cG9ydCBjb25zdCBlbnVtIEtleSB7XHJcbiAgICBMZWZ0LFxyXG4gICAgVXAsXHJcbiAgICBEb3duLFxyXG4gICAgUmlnaHQsXHJcbiAgICBTcGFjZSxcclxuICAgIFBhdXNlLFxyXG4gICAgT3RoZXJcclxufVxyXG5cclxuY29uc3QgZW51bSBTdGF0ZSB7XHJcbiAgICBEb3duLFxyXG4gICAgVXAsXHJcbiAgICBIYW5kbGluZ1xyXG59XHJcblxyXG5jbGFzcyBJbnB1dCB7XHJcbiAgICBwcml2YXRlIGtleVN0YXRlOiBNYXA8S2V5LFN0YXRlPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmtleVN0YXRlID0gbmV3IE1hcDxLZXksU3RhdGU+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFRvU3RhdGUoZXZlbnQsIFN0YXRlLkRvd24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50VG9TdGF0ZShldmVudCwgU3RhdGUuVXApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGlmIGdpdmVuIGtleSBpcyAnRG93bicuXHJcbiAgICAgKi9cclxuICAgIGlzRG93bihrZXk6IEtleSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmtleVN0YXRlLmdldChrZXkpID09PSBTdGF0ZS5Eb3duO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGlmIGdpdmVuIGtleSBpcyAnZG93bicuIEFsc28gc2V0cyB0aGUga2V5IGZyb20gJ0Rvd24nIHRvICdIYW5kbGluZycuXHJcbiAgICAgKi9cclxuICAgIGlzRG93bkFuZFVuaGFuZGxlZChrZXk6IEtleSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzRG93bihrZXkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMua2V5U3RhdGUuc2V0KGtleSwgU3RhdGUuSGFuZGxpbmcpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIFRPRE86IFRoaXMgd2Fzbid0IHNldCBpbiBtYXppbmc7IG5lZWQgdG8gc2VlIHdoeS5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGlmIGFueSBrZXkgaXMgJ2Rvd24nLiBBbHNvIHNldCBhbGwgJ0Rvd24nIGtleXMgdG8gJ0hhbmRsaW5nJy5cclxuICAgICAqL1xyXG4gICAgaXNBbnlLZXlEb3duQW5kVW5oYW5kbGVkKCkge1xyXG4gICAgICAgIGxldCBhbnlLZXlEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5rZXlTdGF0ZS5mb3JFYWNoKChzdGF0ZTogU3RhdGUsIGtleTogS2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gU3RhdGUuRG93bikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBTdGF0ZS5IYW5kbGluZyk7XHJcbiAgICAgICAgICAgICAgICBhbnlLZXlEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBhbnlLZXlEb3duO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZXZlbnRUb1N0YXRlKGV2ZW50OiBLZXlib2FyZEV2ZW50LCBzdGF0ZTogU3RhdGUpIHtcclxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERpcmVjdGlvbmFscyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDY1OiAvLyAnYSdcclxuICAgICAgICAgICAgY2FzZSAzNzogLy8gbGVmdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuTGVmdCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDg3OiAvLyAndydcclxuICAgICAgICAgICAgY2FzZSAzODogLy8gdXBcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlVwLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpIC0gY29tbWVudGVkIGZvciBpZiB0aGUgdXNlciB3YW50cyB0byBjbWQrdyBvciBjdHJsK3dcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY4OiAvLyAnZCdcclxuICAgICAgICAgICAgY2FzZSAzOTogLy8gcmlnaHRcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlJpZ2h0LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODM6IC8vICdzJ1xyXG4gICAgICAgICAgICBjYXNlIDQwOiAvLyBkb3duXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5Eb3duLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzI6IC8vIHNwYWNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5TcGFjZSwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gUGF1c2UgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgODA6IC8vICdwJ1xyXG4gICAgICAgICAgICBjYXNlIDI3OiAvLyBlc2NcclxuICAgICAgICAgICAgY2FzZSAxMzogLy8gZW50ZXIga2V5XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5QYXVzZSwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gVE9ETzogTWF5YmUgYWRkIGEgZGVidWcga2V5IGhlcmUgKCdmJylcclxuXHJcbiAgICAgICAgICAgIC8vIElnbm9yZSBjZXJ0YWluIGtleXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDgyOiAgICAvLyAncidcclxuICAgICAgICAgICAgY2FzZSAxODogICAgLy8gYWx0XHJcbiAgICAgICAgICAgIGNhc2UgMjI0OiAgIC8vIGFwcGxlIGNvbW1hbmQgKGZpcmVmb3gpXHJcbiAgICAgICAgICAgIGNhc2UgMTc6ICAgIC8vIGFwcGxlIGNvbW1hbmQgKG9wZXJhKVxyXG4gICAgICAgICAgICBjYXNlIDkxOiAgICAvLyBhcHBsZSBjb21tYW5kLCBsZWZ0IChzYWZhcmkvY2hyb21lKVxyXG4gICAgICAgICAgICBjYXNlIDkzOiAgICAvLyBhcHBsZSBjb21tYW5kLCByaWdodCAoc2FmYXJpL2Nocm9tZSlcclxuICAgICAgICAgICAgY2FzZSA4NDogICAgLy8gJ3QnIChpLmUuLCBvcGVuIGEgbmV3IHRhYilcclxuICAgICAgICAgICAgY2FzZSA3ODogICAgLy8gJ24nIChpLmUuLCBvcGVuIGEgbmV3IHdpbmRvdylcclxuICAgICAgICAgICAgY2FzZSAyMTk6ICAgLy8gbGVmdCBicmFja2V0c1xyXG4gICAgICAgICAgICBjYXNlIDIyMTogICAvLyByaWdodCBicmFja2V0c1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IHNvbWUgdW53YW50ZWQgYmVoYXZpb3JzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSAxOTE6ICAgLy8gZm9yd2FyZCBzbGFzaCAocGFnZSBmaW5kKVxyXG4gICAgICAgICAgICBjYXNlIDk6ICAgICAvLyB0YWIgKGNhbiBsb3NlIGZvY3VzKVxyXG4gICAgICAgICAgICBjYXNlIDE2OiAgICAvLyBzaGlmdFxyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy8gQWxsIG90aGVyIGtleXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5PdGhlciwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0U3RhdGUoa2V5OiBLZXksIHN0YXRlOiBTdGF0ZSkge1xyXG4gICAgICAgIC8vIEFsd2F5cyBzZXQgJ3VwJ1xyXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gU3RhdGUuVXApIHtcclxuICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBzdGF0ZSk7XHJcbiAgICAgICAgLy8gT25seSBzZXQgJ2Rvd24nIGlmIGl0IGlzIG5vdCBhbHJlYWR5IGhhbmRsZWRcclxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmtleVN0YXRlLmdldChrZXkpICE9PSBTdGF0ZS5IYW5kbGluZykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBpbnB1dCA9IG5ldyBJbnB1dCgpOyIsImltcG9ydCB7Q29sb3J9IGZyb20gJy4vY29sb3InO1xyXG5cclxuZXhwb3J0IGNsYXNzIENlbGwge1xyXG4gICAgcHJpdmF0ZSBjb2xvcjogQ29sb3I7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IENvbG9yLkVtcHR5O1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbG9yKGNvbG9yOiBDb2xvcikge1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2xvcigpOiBDb2xvciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3I7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPZmZzZXQgY2FsY3VsYXRlZCBmcm9tIHRvcC1sZWZ0IGNvcm5lciBiZWluZyAwLCAwLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENlbGxPZmZzZXQge1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gUGxheWVyTW92ZW1lbnQge1xyXG4gICAgTm9uZSxcclxuICAgIExlZnQsXHJcbiAgICBSaWdodCxcclxuICAgIERvd24sXHJcbiAgICBEcm9wLFxyXG4gICAgUm90YXRlQ2xvY2t3aXNlLFxyXG4gICAgUm90YXRlQ291bnRlckNsb2Nrd2lzZVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi4vbW9kZWwvYm9hcmQvc2hhcGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgc2hhcGU6IFNoYXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNoYXBlOiBTaGFwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1NoYXBlfSBmcm9tICcuLi9tb2RlbC9ib2FyZC9zaGFwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQWN0aXZlU2hhcGVFbmRlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgc2hhcGU6IFNoYXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNoYXBlOiBTaGFwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vZG9tYWluL2NvbG9yJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDZWxsQ2hhbmdlRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuICAgIHJlYWRvbmx5IGNlbGw6IENlbGw7XHJcbiAgICByZWFkb25seSByb3c6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IGNvbDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNlbGw6IENlbGwsIHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5jZWxsID0gY2VsbDtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdztcclxuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQ2VsbENoYW5nZUV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImV4cG9ydCBlbnVtIEV2ZW50VHlwZSB7XHJcbiAgICBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGUsXHJcbiAgICBBY3RpdmVTaGFwZUVuZGVkRXZlbnRUeXBlLFxyXG4gICAgQ2VsbENoYW5nZUV2ZW50VHlwZSxcclxuICAgIE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZSxcclxuICAgIE5wY1BsYWNlZEV2ZW50VHlwZSxcclxuICAgIE5wY1N0YXRlQ2hhZ2VkRXZlbnRUeXBlLFxyXG4gICAgUGxheWVyTW92ZW1lbnRFdmVudFR5cGUsXHJcbiAgICBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZVxyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBhYnN0cmFjdCBnZXRUeXBlKCk6RXZlbnRUeXBlXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnRIYW5kbGVyPFQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50PiB7XHJcbiAgICAoZXZlbnQ6IFQpOnZvaWQ7XHJcbn1cclxuXHJcbmNsYXNzIEV2ZW50QnVzIHtcclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZXJzQnlUeXBlOk1hcDxFdmVudFR5cGUsIEV2ZW50SGFuZGxlcjxBYnN0cmFjdEV2ZW50PltdPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmhhbmRsZXJzQnlUeXBlID0gbmV3IE1hcDxFdmVudFR5cGUsIEV2ZW50SGFuZGxlcjxBYnN0cmFjdEV2ZW50PltdPigpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZ2lzdGVyKHR5cGU6RXZlbnRUeXBlLCBoYW5kbGVyOkV2ZW50SGFuZGxlcjxBYnN0cmFjdEV2ZW50Pikge1xyXG4gICAgICAgIGlmICghdHlwZSkge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBzb21ldGhpbmdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghaGFuZGxlcikge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBzb21ldGhpbmdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBoYW5kbGVyczpFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXSA9IHRoaXMuaGFuZGxlcnNCeVR5cGUuZ2V0KHR5cGUpO1xyXG4gICAgICAgIGlmIChoYW5kbGVycyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlcnNCeVR5cGUuc2V0KHR5cGUsIGhhbmRsZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogUmV0dXJuIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgY2FsbGVkIHRvIHVucmVnaXN0ZXIgdGhlIGhhbmRsZXJcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gVE9ETzogdW5yZWdpc3RlcigpLiBBbmQgcmVtb3ZlIHRoZSBtYXAga2V5IGlmIHplcm8gaGFuZGxlcnMgbGVmdCBmb3IgaXQuXHJcbiAgICBcclxuICAgIC8vIFRPRE86IFByZXZlbnQgaW5maW5pdGUgZmlyZSgpP1xyXG4gICAgZmlyZShldmVudDpBYnN0cmFjdEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5oYW5kbGVyc0J5VHlwZS5nZXQoZXZlbnQuZ2V0VHlwZSgpKTtcclxuICAgICAgICBpZiAoaGFuZGxlcnMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBoYW5kbGVyIG9mIGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZXZlbnRCdXMgPSBuZXcgRXZlbnRCdXMoKTsiLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtOcGNTdGF0ZX0gZnJvbSAnLi4vZG9tYWluL25wYy1zdGF0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjUGxhY2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgc3RhdGU6IE5wY1N0YXRlO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyXHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgc3RhdGU6IE5wY1N0YXRlLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLk5wY1BsYWNlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBsYXllck1vdmVtZW50RXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBtb3ZlbWVudDogUGxheWVyTW92ZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IobW92ZW1lbnQ6IFBsYXllck1vdmVtZW50KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm1vdmVtZW50ID0gbW92ZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLlBsYXllck1vdmVtZW50RXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHo6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgZW51bSBHYW1lU3RhdGVUeXBlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUgc3RhdGUgcmlnaHQgd2hlbiBKYXZhU2NyaXB0IHN0YXJ0cyBydW5uaW5nLiBJbmNsdWRlcyBwcmVsb2FkaW5nLlxyXG4gICAgICovXHJcbiAgICBJbml0aWFsaXppbmcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZnRlciBwcmVsb2FkIGlzIGNvbXBsZXRlIGFuZCBiZWZvcmUgbWFraW5nIG9iamVjdCBzdGFydCgpIGNhbGxzLlxyXG4gICAgICovXHJcbiAgICBTdGFydGluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgYWZ0ZXIgaW5pdGlhbCBvYmplY3RzIHN0YXJ0KCkgYW5kIGxpa2VseSB3aGVyZSB0aGUgZ2FtZSBpcyB3YWl0aW5nIG9uIHRoZSBwbGF5ZXIncyBmaXJzdCBpbnB1dC5cclxuICAgICAqL1xyXG4gICAgU3RhcnRlZCxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgdGhlIG1haW4gZ2FtZSBsb29wIG9mIGNvbnRyb2xsaW5nIHBpZWNlcy5cclxuICAgICAqL1xyXG4gICAgUGxheWluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuZCBvZiBnYW1lLCBzY29yZSBpcyBzaG93aW5nLCBub3RoaW5nIGxlZnQgdG8gZG8uXHJcbiAgICAgKi9cclxuICAgIEVuZGVkXHJcbn1cclxuXHJcbmNsYXNzIEdhbWVTdGF0ZSB7XHJcbiAgICBwcml2YXRlIGN1cnJlbnQ6IEdhbWVTdGF0ZVR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gR2FtZVN0YXRlVHlwZS5Jbml0aWFsaXppbmc7IC8vIERlZmF1bHQgc3RhdGUuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudCgpOiBHYW1lU3RhdGVUeXBlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHNldEN1cnJlbnQoY3VycmVudDogR2FtZVN0YXRlVHlwZSkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IGN1cnJlbnQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGdhbWVTdGF0ZSA9IG5ldyBHYW1lU3RhdGUoKTsiLCJpbXBvcnQge3ByZWxvYWRlcn0gZnJvbSAnLi9wcmVsb2FkZXInO1xyXG5pbXBvcnQge21vZGVsfSBmcm9tICcuL21vZGVsL21vZGVsJztcclxuaW1wb3J0IHt2aWV3fSBmcm9tICcuL3ZpZXcvdmlldyc7XHJcbmltcG9ydCB7Y29udHJvbGxlcn0gZnJvbSAnLi9jb250cm9sbGVyL2NvbnRyb2xsZXInO1xyXG5pbXBvcnQge0dhbWVTdGF0ZVR5cGUsIGdhbWVTdGF0ZX0gZnJvbSAnLi9nYW1lLXN0YXRlJztcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgZ2FtZVN0YXRlLnNldEN1cnJlbnQoR2FtZVN0YXRlVHlwZS5Jbml0aWFsaXppbmcpO1xyXG4gICAgcHJlbG9hZGVyLnByZWxvYWQobWFpbik7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gbWFpbigpIHtcclxuXHJcbiAgICAvLyBTdGFydHVwIGluIHJldmVyc2UgTVZDIG9yZGVyIHRvIGVuc3VyZSB0aGF0IGV2ZW50IGJ1cyBoYW5kbGVycyBpbiB0aGVcclxuICAgIC8vIGNvbnRyb2xsZXIgYW5kIHZpZXcgcmVjZWl2ZSAoYW55KSBzdGFydCBldmVudHMgZnJvbSBtb2RlbC5zdGFydCgpLlxyXG4gICAgY29udHJvbGxlci5zdGFydCgpO1xyXG4gICAgdmlldy5zdGFydCgpO1xyXG4gICAgbW9kZWwuc3RhcnQoKTtcclxuICAgIFxyXG4gICAgZ2FtZVN0YXRlLnNldEN1cnJlbnQoR2FtZVN0YXRlVHlwZS5TdGFydGVkKTtcclxuXHJcbiAgICBsZXQgc3RlcCA9ICgpID0+IHtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7XHJcblxyXG4gICAgICAgIGxldCBlbGFwc2VkID0gY2FsY3VsYXRlRWxhcHNlZCgpO1xyXG4gICAgICAgIGNvbnRyb2xsZXIuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB2aWV3LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgbW9kZWwuc3RlcChlbGFwc2VkKTtcclxuICAgIH07XHJcbiAgICBzdGVwKCk7XHJcbn1cclxuXHJcbmxldCBsYXN0U3RlcCA9IERhdGUubm93KCk7XHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZUVsYXBzZWQoKSB7XHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gbGFzdFN0ZXA7XHJcbiAgICBpZiAoZWxhcHNlZCA+IDEwMCkge1xyXG4gICAgICAgIGVsYXBzZWQgPSAxMDA7IC8vIGVuZm9yY2Ugc3BlZWQgbGltaXRcclxuICAgIH1cclxuICAgIGxhc3RTdGVwID0gbm93O1xyXG4gICAgcmV0dXJuIGVsYXBzZWQ7XHJcbn0iLCJpbXBvcnQge1NoYXBlfSBmcm9tICcuL3NoYXBlJztcclxuaW1wb3J0IHtDZWxsfSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7c2hhcGVGYWN0b3J5fSBmcm9tICcuL3NoYXBlLWZhY3RvcnknO1xyXG5pbXBvcnQge2V2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGxDaGFuZ2VFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvY2VsbC1jaGFuZ2UtZXZlbnQnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9hY3RpdmUtc2hhcGUtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVFbmRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9hY3RpdmUtc2hhcGUtZW5kZWQtZXZlbnQnO1xyXG5cclxuY29uc3QgTUFYX1JPV1MgPSAxOTsgLy8gVG9wIDIgcm93cyBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuIEFsc28sIHNlZSBsaWdodGluZy1ncmlkLnRzLlxyXG5jb25zdCBNQVhfQ09MUyA9IDEwO1xyXG5jb25zdCBURU1QX0RFTEFZX01TID0gNTAwO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJvYXJkIHtcclxuICAgIHByaXZhdGUgY3VycmVudFNoYXBlOiBTaGFwZTtcclxuXHJcbiAgICBwcml2YXRlIG1hdHJpeDogQ2VsbFtdW107XHJcbiAgICBwcml2YXRlIG1zVGlsbEdyYXZpdHlUaWNrOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLm1hdHJpeCA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IE1BWF9ST1dTOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFtyb3dJZHhdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IFRFTVBfREVMQVlfTVM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayAtPSBlbGFwc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLm1zVGlsbEdyYXZpdHlUaWNrIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IFRFTVBfREVMQVlfTVM7XHJcbiAgICAgICAgICAgIHRoaXMuc3RlcE5vdygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgZ2l2ZXMgaGlnaCBsZXZlbCB2aWV3IG9mIHRoZSBtYWluIGdhbWUgbG9vcC5cclxuICAgICAqL1xyXG4gICAgc3RlcE5vdygpIHtcclxuICAgICAgICBpZiAodGhpcy50cnlHcmF2aXR5KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlU2hhcGVEb3duKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVFbmRlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29udmVydFNoYXBlVG9DZWxscygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tGb3JHYW1lT3ZlcigpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBGaXJlIGdhbWUgbG9zZSBldmVudFxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVBbnlGaWxsZWRMaW5lcygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tGb3JHYW1lV2luKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBGaXJlIGdhbWUgd2luIGV2ZW50XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRTaGFwZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGJlZ2luTmV3R2FtZSgpIHtcclxuICAgICAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5zZXRSYW5kb21XaGl0ZUxpZ2h0cygpO1xyXG4gICAgICAgIHRoaXMuc3RhcnRTaGFwZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZUxlZnQoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZUxlZnQoKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVSaWdodCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZVJpZ2h0KCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVSaWdodCgpO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZUxlZnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVEb3duKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVEb3duKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCkge1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICB9IHdoaWxlICghdGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLnJvdGF0ZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUucm90YXRlQ291bnRlckNsb2Nrd2lzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2xlYXIoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2VsbENvbG9yKHJvd0lkeCwgY29sSWR4LCBDb2xvci5FbXB0eSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRSYW5kb21XaGl0ZUxpZ2h0cygpIHtcclxuICAgICAgICAvLyAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS83MjI4MzIyXHJcbiAgICAgICAgLy8gZnVuY3Rpb24gcmFuZG9tSW50RnJvbUludGVydmFsKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKihtYXggLSBtaW4gKyAxKSArIG1pbik7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGVscGVyIG1ldGhvZCB0byBjaGFuZ2UgYSBzaW5nbGUgY2VsbCBjb2xvcidzIGFuZCBub3RpZnkgc3Vic2NyaWJlcnMgYXQgdGhlIHNhbWUgdGltZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGFuZ2VDZWxsQ29sb3Iocm93SWR4OiBudW1iZXIsIGNvbElkeDogbnVtYmVyLCBjb2xvcjogQ29sb3IpIHtcclxuICAgICAgICAvLyBUT0RPOiBNYXliZSBib3VuZHMgY2hlY2sgaGVyZS5cclxuICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICBjZWxsLnNldENvbG9yKGNvbG9yKTtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBDZWxsQ2hhbmdlRXZlbnQoY2VsbCwgcm93SWR4LCBjb2xJZHgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXJ0U2hhcGUoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUgPSBzaGFwZUZhY3RvcnkubmV4dFNoYXBlKCk7XHJcbiAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHRyeUdyYXZpdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGNhbk1vdmVEb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIGNhbk1vdmVEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gY2FuTW92ZURvd247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlbmRlZCBmb3IgY2hlY2tpbmcgb2YgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnRcclxuICAgICAqIHNoYXBlIGhhcyBhbnkgb3ZlcmxhcCB3aXRoIGV4aXN0aW5nIGNlbGxzIHRoYXQgaGF2ZSBjb2xvci5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjb2xsaXNpb25EZXRlY3RlZCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgY29sbGlzaW9uID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiB0aGlzLmN1cnJlbnRTaGFwZS5nZXRPZmZzZXRzKCkpIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IG9mZnNldC55ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Um93KCk7XHJcbiAgICAgICAgICAgIGxldCBjb2wgPSBvZmZzZXQueCArIHRoaXMuY3VycmVudFNoYXBlLmdldENvbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvdyA8IDAgfHwgcm93ID49IHRoaXMubWF0cml4Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sIDwgMCB8fCBjb2wgPj0gdGhpcy5tYXRyaXhbcm93XS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubWF0cml4W3Jvd11bY29sXS5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29sbGlzaW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29udmVydFNoYXBlVG9DZWxscygpIHtcclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2YgdGhpcy5jdXJyZW50U2hhcGUuZ2V0T2Zmc2V0cygpKSB7XHJcbiAgICAgICAgICAgIGxldCByb3dJZHggPSBvZmZzZXQueSArIHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpO1xyXG4gICAgICAgICAgICBsZXQgY29sSWR4ID0gb2Zmc2V0LnggKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3dJZHggPCAwIHx8IHJvd0lkeCA+PSB0aGlzLm1hdHJpeC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sSWR4IDwgMCB8fCBjb2xJZHggPj0gdGhpcy5tYXRyaXhbcm93SWR4XS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgdGhpcy5jdXJyZW50U2hhcGUuY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrRm9yR2FtZU92ZXIoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBUT0RPOiBEbyBpdFxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQW55RmlsbGVkTGluZXMoKSB7XHJcbiAgICAgICAgbGV0IGhpZ2hlc3RMaW5lRmlsbGVkID0gMDsgLy8gXCJoaWdoZXN0XCIgYXMgaW4gdGhlIGhpZ2hlc3QgaW4gdGhlIGFycmF5LCB3aGljaCBpcyB0aGUgbG93ZXN0IHZpc3VhbGx5IHRvIHRoZSBwbGF5ZXIuXHJcblxyXG4gICAgICAgIC8vIFRyYXZlcnNlIGJhY2t3YXJkcyB0byBwcmV2ZW50IHJvdyBpbmRleCBmcm9tIGJlY29taW5nIG91dCBvZiBzeW5jIHdoZW4gcmVtb3Zpbmcgcm93cy5cclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSB0aGlzLm1hdHJpeC5sZW5ndGggLSAxOyByb3dJZHggPj0gMDsgcm93SWR4LS0pIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGxldCBmaWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjZWxsIG9mIHJvdykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZmlsbGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocm93SWR4ID4gaGlnaGVzdExpbmVGaWxsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBoaWdoZXN0TGluZUZpbGxlZCA9IHJvd0lkeDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQW5kQ29sbGFwc2Uocm93SWR4KTtcclxuICAgICAgICAgICAgICAgIHJvd0lkeCA9IHJvd0lkeCArIDE7IC8vIFRoaXMgaXMgYSByZWFsbHksIHJlYWxseSBzaGFreSB3b3JrYXJvdW5kLiBJdCBwcmV2ZW50cyB0aGUgbmV4dCByb3cgZnJvbSBnZXR0aW5nIHNraXBwZWQgb3ZlciBvbiBuZXh0IGxvb3AuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5vdGlmeSBmb3IgYWxsIGNlbGxzIGZyb20gMCB0byB0aGUgaGlnaGVzdExpbmVGaWxsZWQsIHdoaWNoIGNvdWxkIGJlIDAgaWYgbm8gcm93cyB3ZXJlIGZpbGxlZC5cclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPD0gaGlnaGVzdExpbmVGaWxsZWQ7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBDZWxsQ2hhbmdlRXZlbnQoY2VsbCwgcm93SWR4LCBjb2xJZHgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgcmVtb3ZlcyB0aGUgb2xkIHJvdyBhbmQgcHV0cyBhIG5ldyByb3cgaW4gaXRzIHBsYWNlIGF0IHBvc2l0aW9uIDAsIHdoaWNoIGlzIHRoZSBoaWdoZXN0IHZpc3VhbGx5IHRvIHRoZSBwbGF5ZXIuXHJcbiAgICAgKiBEZWxlZ2F0ZXMgY2VsbCBub3RpZmljYXRpb24gdG8gdGhlIGNhbGxpbmcgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlbW92ZUFuZENvbGxhcHNlKHJvd0lkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5tYXRyaXguc3BsaWNlKHJvd0lkeCwgMSk7XHJcbiAgICAgICAgdGhpcy5tYXRyaXguc3BsaWNlKDAsIDAsIFtdKTtcclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXhbMF1bY29sSWR4XSA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tGb3JHYW1lV2luKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gVE9ETzogRG8gaXRcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpIHtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCh0aGlzLmN1cnJlbnRTaGFwZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmlyZUFjdGl2ZVNoYXBlRW5kZWRFdmVudCgpIHtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBBY3RpdmVTaGFwZUVuZGVkRXZlbnQodGhpcy5jdXJyZW50U2hhcGUpKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgYm9hcmQgPSBuZXcgQm9hcmQoKTsiLCJpbXBvcnQge1NoYXBlfSBmcm9tICcuL3NoYXBlJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuXHJcbmNsYXNzIFNoYXBlSSBleHRlbmRzIFNoYXBlIHtcclxuICAgIHNwYXduQ29sdW1uID0gMztcclxuICAgIGNvbG9yID0gQ29sb3IuQ3lhbjtcclxuICAgIHZhbHVlc1BlclJvdyA9IDQ7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlSiBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuQmx1ZTtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdO1xyXG59XHJcblxyXG5jbGFzcyBTaGFwZUwgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLk9yYW5nZTtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAxLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlTyBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuWWVsbG93O1xyXG4gICAgdmFsdWVzUGVyUm93ID0gNDtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVTIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5HcmVlbjtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAxLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlVCBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuUHVycGxlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVaIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5SZWQ7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZUZhY3Rvcnkge1xyXG4gICAgcHJpdmF0ZSBiYWc6IFNoYXBlW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5yZWZpbGxCYWcoKTtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0U2hhcGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYmFnLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVmaWxsQmFnKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmJhZy5wb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlZmlsbEJhZygpIHtcclxuICAgICAgICB0aGlzLmJhZyA9IFtcclxuICAgICAgICAgICAgbmV3IFNoYXBlSSgpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVKKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZUwoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlTygpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVTKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZVQoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlWigpXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgLy8gRmlzaGVyLVlhdGVzIFNodWZmbGUsIGJhc2VkIG9uOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNDUwOTc2XHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMuYmFnLmxlbmd0aFxyXG4gICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgICAgICAgd2hpbGUgKDAgIT09IGlkeCkge1xyXG4gICAgICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cclxuICAgICAgICAgICAgbGV0IHJuZElkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGlkeCk7XHJcbiAgICAgICAgICAgIGlkeCAtPSAxO1xyXG4gICAgICAgICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICAgICAgICAgIGxldCB0ZW1wVmFsID0gdGhpcy5iYWdbaWR4XTtcclxuICAgICAgICAgICAgdGhpcy5iYWdbaWR4XSA9IHRoaXMuYmFnW3JuZElkeF07XHJcbiAgICAgICAgICAgIHRoaXMuYmFnW3JuZElkeF0gPSB0ZW1wVmFsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTtcclxuIiwiaW1wb3J0IHtDZWxsT2Zmc2V0fSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcblxyXG5jb25zdCBTUEFXTl9DT0wgPSAzOyAvLyBMZWZ0IHNpZGUgb2YgbWF0cml4IHNob3VsZCBjb3JyZXNwb25kIHRvIHRoaXMuXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2hhcGUge1xyXG4gICAgYWJzdHJhY3QgcmVhZG9ubHkgY29sb3I6IENvbG9yO1xyXG4gICAgYWJzdHJhY3QgcmVhZG9ubHkgdmFsdWVzUGVyUm93OiBudW1iZXI7XHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgbWF0cmljZXM6IFJlYWRvbmx5QXJyYXk8UmVhZG9ubHlBcnJheTxudW1iZXI+PjtcclxuXHJcbiAgICBwcml2YXRlIGN1cnJlbnRNYXRyaXhJbmRleDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByb3c6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY29sOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggPSAwOyAvLyBUT0RPOiBFbnN1cmUgcG9zaXRpb24gMCBpcyB0aGUgc3Bhd24gcG9zaXRpb25cclxuICAgICAgICB0aGlzLnJvdyA9IDA7XHJcbiAgICAgICAgdGhpcy5jb2wgPSBTUEFXTl9DT0w7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUxlZnQoKSB7XHJcbiAgICAgICAgdGhpcy5jb2wtLTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlUmlnaHQoKSB7XHJcbiAgICAgICAgdGhpcy5jb2wrKztcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVXAoKSB7XHJcbiAgICAgICAgdGhpcy5yb3ctLTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICB0aGlzLnJvdysrO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUNvdW50ZXJDbG9ja3dpc2UoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggLT0gMTtcclxuICAgICAgICB0aGlzLmVuc3VyZUFycmF5Qm91bmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQ2xvY2t3aXNlKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ICs9IDE7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVBcnJheUJvdW5kcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvdygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3c7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3dDb3VudCgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMuZ2V0Q3VycmVudE1hdHJpeCgpLmxlbmd0aCAvIHRoaXMudmFsdWVzUGVyUm93KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRPZmZzZXRzKCk6IENlbGxPZmZzZXRbXSB7XHJcbiAgICAgICAgbGV0IG1hdHJpeCA9IHRoaXMuZ2V0Q3VycmVudE1hdHJpeCgpO1xyXG4gICAgICAgIGxldCBvZmZzZXRzOiBDZWxsT2Zmc2V0W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBtYXRyaXgubGVuZ3RoOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXRyaXhbaWR4XTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGlkeCAlIHRoaXMudmFsdWVzUGVyUm93O1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKGlkeCAvIHRoaXMudmFsdWVzUGVyUm93KTtcclxuICAgICAgICAgICAgICAgIGxldCBvZmZzZXQgPSBuZXcgQ2VsbE9mZnNldCh4LCB5KTtcclxuICAgICAgICAgICAgICAgIG9mZnNldHMucHVzaChvZmZzZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvZmZzZXRzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q3VycmVudE1hdHJpeCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXRyaWNlc1t0aGlzLmN1cnJlbnRNYXRyaXhJbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbnN1cmVBcnJheUJvdW5kcygpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50TWF0cml4SW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID0gdGhpcy5tYXRyaWNlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50TWF0cml4SW5kZXggPj0gdGhpcy5tYXRyaWNlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7Ym9hcmR9IGZyb20gJy4vYm9hcmQvYm9hcmQnO1xyXG5pbXBvcnQge25wY01hbmFnZXJ9IGZyb20gJy4vbnBjL25wYy1tYW5hZ2VyJztcclxuaW1wb3J0IHtldmVudEJ1cywgRXZlbnRUeXBlfSBmcm9tICcuLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5cclxuY2xhc3MgTW9kZWwge1xyXG4gICAgXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuUGxheWVyTW92ZW1lbnRFdmVudFR5cGUsIChldmVudDogUGxheWVyTW92ZW1lbnRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVBsYXllck1vdmVtZW50KGV2ZW50Lm1vdmVtZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYm9hcmQuc3RhcnQoKTtcclxuICAgICAgICBucGNNYW5hZ2VyLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIGJvYXJkLmJlZ2luTmV3R2FtZSgpOyAvLyBUT0RPOiBJbnN0ZWFkLCBzdGFydCBnYW1lIHdoZW4gcGxheWVyIGhpdHMgYSBrZXkgZmlyc3QuXHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBib2FyZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIG5wY01hbmFnZXIuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVBsYXllck1vdmVtZW50KG1vdmVtZW50OiBQbGF5ZXJNb3ZlbWVudCkge1xyXG4gICAgICAgIHN3aXRjaCAobW92ZW1lbnQpIHtcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlTGVmdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVSaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuRG93bjpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZURvd24oKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LkRyb3A6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5zdGVwTm93KCk7IC8vIHByZXZlbnQgYW55IG90aGVyIGtleXN0cm9rZXMgdGlsbCBuZXh0IHRpY2tcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LlJvdGF0ZUNsb2Nrd2lzZTpcclxuICAgICAgICAgICAgICAgIGJvYXJkLnJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmhhbmRsZWQgbW92ZW1lbnQnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgbW9kZWwgPSBuZXcgTW9kZWwoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5pbXBvcnQge05wY30gZnJvbSAnLi9ucGMnXHJcbmltcG9ydCB7TnBjU3RhdGV9IGZyb20gJy4uLy4uL2RvbWFpbi9ucGMtc3RhdGUnO1xyXG5pbXBvcnQge2V2ZW50QnVzLCBFdmVudFR5cGV9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvc3RhbmRlZS1tb3ZlbWVudC1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5cclxuLy8gU3RhcnRpbmcgcG9zaXRpb24gY291bnRzIHVzZWQgaW4gaW5pdGlhbGl6YXRpb24uXHJcbmNvbnN0IFRPVEFMX05QQ1MgPSAyMDtcclxuXHJcbmNsYXNzIE5wY01hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgbnBjczogTWFwPG51bWJlciwgTnBjPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm5wY3MgPSBuZXcgTWFwPG51bWJlciwgTnBjPigpO1xyXG4gICAgICAgIGZvciAobGV0IG5wY0lkeCA9IDA7IG5wY0lkeCA8IFRPVEFMX05QQ1M7IG5wY0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBucGMgPSBuZXcgTnBjKCk7XHJcbiAgICAgICAgICAgIHRoaXMubnBjcy5zZXQobnBjLmlkLCBucGMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGUsIChldmVudDogU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm5wY3MuZm9yRWFjaCgobnBjOiBOcGMpID0+IHtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSAoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSAoTWF0aC5yYW5kb20oKSAqIDE1KTtcclxuICAgICAgICAgICAgICAgIG5wYy5zdGFydCh4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogTW92ZSB0aGlzIGVsc2V3aGVyZTpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSAoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSAoTWF0aC5yYW5kb20oKSAqIDE1KTtcclxuICAgICAgICAgICAgICAgIG5wYy5iZWdpbldhbGtpbmdUbyh4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ucGNzLmZvckVhY2goKG5wYzogTnBjKSA9PiB7XHJcbiAgICAgICAgICAgIG5wYy5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChldmVudDogU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBucGMgPSB0aGlzLm5wY3MuZ2V0KGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBpZiAobnBjICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICBsZXQgeSA9IGV2ZW50Lno7XHJcbiAgICAgICAgICAgIG5wYy51cGRhdGVQb3NpdGlvbih4LCB5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IG5wY01hbmFnZXIgPSBuZXcgTnBjTWFuYWdlcigpOyIsImltcG9ydCB7RXZlbnRUeXBlLCBldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtOcGNQbGFjZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLXBsYWNlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1tb3ZlbWVudC1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNTdGF0ZX0gZnJvbSAnLi4vLi4vZG9tYWluL25wYy1zdGF0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjIHtcclxuICAgIHJlYWRvbmx5IGlkOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0ZTogTnBjU3RhdGU7XHJcbiAgICBwcml2YXRlIHRpbWVJblN0YXRlOiBudW1iZXI7XHJcblxyXG4gICAgLy8gXCJMYXN0XCIgYXMgaW4gdGhlIGxhc3Qga25vd24gY29vcmRpbmF0ZSwgYmVjYXVzZSBpdCBjb3VsZCBiZSBjdXJyZW50bHkgaW4tbW90aW9uLlxyXG4gICAgcHJpdmF0ZSB4bGFzdDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB5bGFzdDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUik7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBOcGNTdGF0ZS5JZGxlO1xyXG4gICAgICAgIHRoaXMudGltZUluU3RhdGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnhsYXN0ID0gMDtcclxuICAgICAgICB0aGlzLnlsYXN0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueGxhc3QgPSB4O1xyXG4gICAgICAgIHRoaXMueWxhc3QgPSB5O1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IE5wY1BsYWNlZEV2ZW50KHRoaXMuaWQsIHRoaXMuc3RhdGUsIHgsIHkpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCBieSB0aGUgTlBDIG1hbmFnZXIgcmF0aGVyIHRoYW4gdHJhY2tzIHRoYXQgcmVmZXJlbmNlIHRoZW0uXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy50aW1lSW5TdGF0ZSArPSBlbGFwc2VkO1xyXG4gICAgfVxyXG5cclxuICAgIHRyYW5zaXRpb25UbyhzdGF0ZTogTnBjU3RhdGUpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy50aW1lSW5TdGF0ZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgYmVnaW5XYWxraW5nVG8oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCh0aGlzLmlkLCB4LCB5KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaWduaWZpZXMgdGhlIGVuZCBvZiBhIHdhbGsuXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy54bGFzdCA9IHg7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9IHk7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVG8oTnBjU3RhdGUuSWRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U3RhdGUoKTogTnBjU3RhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2V9IGZyb20gJy4vdmlldy9zdGFuZGVlL3N0YW5kZWUtYW5pbWF0aW9uLXRleHR1cmUtYmFzZSc7XHJcblxyXG5jbGFzcyBQcmVsb2FkZXIge1xyXG4gICAgXHJcbiAgICBwcmVsb2FkKGNhbGxiYWNrOiAoKSA9PiBhbnkpIHtcclxuICAgICAgICBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UucHJlbG9hZChjYWxsYmFjayk7XHJcbiAgICAgICAgLy8gVE9ETzogR29pbmcgdG8gaGF2ZSBhIHBhcmFsbGVsaXNtIG1lY2hhbmlzbSBhZnRlciBhZGRpbmcgbW9yZSB0byB0aGlzLlxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBwcmVsb2FkZXIgPSBuZXcgUHJlbG9hZGVyKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuY29uc3QgQVNQRUNUX1JBVElPID0gMTYvOTtcclxuXHJcbmNsYXNzIENhbWVyYVdyYXBwZXIge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBjYW1lcmE6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg2MCwgQVNQRUNUX1JBVElPLCAwLjEsIDEwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVJlbmRlcmVyU2l6ZShyZW5kZXJlcjogYW55KSB7XHJcbiAgICAgICAgbGV0IHdpbmRvd0FzcGVjdFJhdGlvID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgbGV0IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyO1xyXG4gICAgICAgIGlmICh3aW5kb3dBc3BlY3RSYXRpbyA+IEFTUEVDVF9SQVRJTykge1xyXG4gICAgICAgICAgICAvLyBUb28gd2lkZTsgc2NhbGUgb2ZmIG9mIHdpbmRvdyBoZWlnaHQuXHJcbiAgICAgICAgICAgIHdpZHRoID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJIZWlnaHQgKiBBU1BFQ1RfUkFUSU8pO1xyXG4gICAgICAgICAgICBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3dBc3BlY3RSYXRpbyA8PSBBU1BFQ1RfUkFUSU8pIHtcclxuICAgICAgICAgICAgLy8gVG9vIG5hcnJvdyBvciBqdXN0IHJpZ2h0OyBzY2FsZSBvZmYgb2Ygd2luZG93IHdpZHRoLlxyXG4gICAgICAgICAgICB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lcldpZHRoIC8gQVNQRUNUX1JBVElPKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbmRlcmVyLnNldFNpemUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgLy8gU2hvdWxkIGJlIG5vIG5lZWQgdG8gdXBkYXRlIGFzcGVjdCByYXRpbyBiZWNhdXNlIGl0IHNob3VsZCBiZSBjb25zdGFudC5cclxuICAgICAgICAvLyB0aGlzLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICBsb29rQXQodmVjMzogYW55KSB7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KHZlYzMpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBjYW1lcmFXcmFwcGVyID0gbmV3IENhbWVyYVdyYXBwZXIoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgQnVpbGRpbmcge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzbGFiOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBvbGQgcGxhaW4gY3ViZS5cclxuICAgICAgICAvLyBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMTEsIDIwLCAxMCk7XHJcbiAgICAgICAgLy8gbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiAweGZmZmZmZn0pO1xyXG4gICAgICAgIC8vIHRoaXMuc2xhYiA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgLy8gdGhpcy5zbGFiLnBvc2l0aW9uLnNldCg0LjUsIDEwLCAtNS44KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBNb3ZlIHRoaXMgaW50byBhIGxvYWRlclxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgbGV0IG10bExvYWRlciA9IG5ldyBUSFJFRS5NVExMb2FkZXIoKTtcclxuICAgICAgICBtdGxMb2FkZXIuc2V0UGF0aCgnJyk7XHJcbiAgICAgICAgbXRsTG9hZGVyLmxvYWQoJ2dyZWVuLWJ1aWxkaW5nLm10bCcsIChtYXRlcmlhbHM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBtYXRlcmlhbHMucHJlbG9hZCgpO1xyXG4gICAgICAgICAgICBsZXQgb2JqTG9hZGVyID0gbmV3IFRIUkVFLk9CSkxvYWRlcigpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIuc2V0TWF0ZXJpYWxzKG1hdGVyaWFscyk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5zZXRQYXRoKCcnKTtcclxuICAgICAgICAgICAgb2JqTG9hZGVyLmxvYWQoJ2dyZWVuLWJ1aWxkaW5nLm9iaicsIChvYmo6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgb2JqLnNjYWxlLnNldFNjYWxhcigwLjI1KTtcclxuICAgICAgICAgICAgICAgIG9iai5wb3NpdGlvbi5zZXQoNSwgLTAuMDEsIDApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cC5hZGQob2JqKTtcclxuICAgICAgICAgICAgfSwgKCkgPT4geyB9LCAoKSA9PiB7IGNvbnNvbGUubG9nKCdlcnJvciB3aGlsZSBsb2FkaW5nIDooJykgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5pbXBvcnQge0J1aWxkaW5nfSBmcm9tICcuL2J1aWxkaW5nJztcclxuXHJcbi8vIFRPRE86IE9ubHkgdGhlIDNyZCBmbG9vciBmcm9tIHRoZSB0b3AgYW5kIGJlbG93IGFyZSB2aXNpYmxlLiBBbHNvLCBzZWUgYm9hcmQudHMuXHJcbmV4cG9ydCBjb25zdCBGTE9PUl9DT1VOVCA9IDE3O1xyXG5leHBvcnQgY29uc3QgUEFORUxfQ09VTlRfUEVSX0ZMT09SID0gMTA7XHJcblxyXG5jb25zdCBBQ1RJVkVfU0hBUEVfTElHSFRfQ09VTlQgPSA0O1xyXG5cclxuY2xhc3MgRW1pc3NpdmVJbnRlbnNpdHkge1xyXG4gICAgdmFsdWU6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpZ2h0aW5nR3JpZCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICBwcml2YXRlIHBhbmVsR3JvdXA6IGFueTtcclxuICAgIHByaXZhdGUgYnVpbGRpbmc6IEJ1aWxkaW5nO1xyXG5cclxuICAgIHByaXZhdGUgcGFuZWxzOiBhbnlbXVtdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHBvaW50TGlnaHRzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgY3VycmVudFBvaW50TGlnaHRJZHg6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHB1bHNlVHdlZW46IGFueTtcclxuICAgIHByaXZhdGUgcHVsc2VUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZW1pc3NpdmVJbnRlbnNpdHk6IEVtaXNzaXZlSW50ZW5zaXR5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLmJ1aWxkaW5nID0gbmV3IEJ1aWxkaW5nKCk7XHJcblxyXG4gICAgICAgIHRoaXMucGFuZWxzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZmxvb3JJZHggPSAwOyBmbG9vcklkeCA8IEZMT09SX0NPVU5UOyBmbG9vcklkeCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFuZWxzW2Zsb29ySWR4XSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbElkeCA9IDA7IHBhbmVsSWR4IDwgUEFORUxfQ09VTlRfUEVSX0ZMT09SOyBwYW5lbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMC42LCAwLjYsIDAuMSk7IC8vIFRPRE86IGNsb25lKCkgP1xyXG4gICAgICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoKTtcclxuICAgICAgICAgICAgICAgIGxldCBwYW5lbCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBwYW5lbElkeDtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gZmxvb3JJZHggKyAxOyAvLyBPZmZzZXQgdXAgMSBiZWNhdXNlIGdyb3VuZCBpcyB5ID0gMC5cclxuICAgICAgICAgICAgICAgIGxldCB6ID0gMDtcclxuICAgICAgICAgICAgICAgIHBhbmVsLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhbmVsc1tmbG9vcklkeF1bcGFuZWxJZHhdID0gcGFuZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRMaWdodHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBjb3VudCA9IDA7IGNvdW50IDwgQUNUSVZFX1NIQVBFX0xJR0hUX0NPVU5UOyBjb3VudCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwb2ludExpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmZjAwZmYsIDIsIDEuNSk7XHJcbi8vIC8vIFRoZXNlIHR3byBsaW5lcyBhcmUgZm9yIGRlYnVnZ2luZzpcclxuLy8gbGV0IHNwaGVyZSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSggMC4xLCAxNiwgOCApO1xyXG4vLyBwb2ludExpZ2h0LmFkZCggbmV3IFRIUkVFLk1lc2goc3BoZXJlLCBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiAweGZmZmZmZn0pKSk7XHJcbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgwLjYsIDAuNiwgMC4xKTtcclxuICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtjb2xvcjogMHhmZmZmZmZ9KTtcclxuICAgICAgICAgICAgbGV0IGdsYXNzID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICAgICAgZ2xhc3MucG9zaXRpb24uc2V0WigtMC4zMyk7IC8vIFNob3VsZCBiZSBvbiBzYW1lIGxldmVsIGFzIHJlZ3VsYXIgY2VsbHMuXHJcbiAgICAgICAgICAgIHBvaW50TGlnaHQuYWRkKGdsYXNzKTtcclxuXHJcbiAgICAgICAgICAgIHBvaW50TGlnaHQucG9zaXRpb24uc2V0KC0xMDAsIC0xMDAsIDAuMzMpOyAvLyBKdXN0IGdldCBpdCBvdXQgb2YgdGhlIHdheSBmb3Igbm93XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRMaWdodHMucHVzaChwb2ludExpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UG9pbnRMaWdodElkeCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMucHVsc2VUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5lbWlzc2l2ZUludGVuc2l0eSA9IG5ldyBFbWlzc2l2ZUludGVuc2l0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuYnVpbGRpbmcuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMucGFuZWxHcm91cCk7XHJcbiAgICAgICAgdGhpcy5idWlsZGluZy5zdGFydCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBmbG9vciBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiBmbG9vcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYW5lbEdyb3VwLmFkZChwYW5lbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBvaW50TGlnaHQgb2YgdGhpcy5wb2ludExpZ2h0cykge1xyXG4gICAgICAgICAgICB0aGlzLnBhbmVsR3JvdXAuYWRkKHBvaW50TGlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRvIGZpdCBhZ2FpbnN0IGJ1aWxkaW5nLlxyXG4gICAgICAgIHRoaXMucGFuZWxHcm91cC5wb3NpdGlvbi5zZXQoMS45LCAzLjgsIC0xLjU1KTtcclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAuc2NhbGUuc2V0KDAuNywgMS4wLCAxKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBjZWxscyBhcHBlYXIgdG8gcHVsc2UuXHJcbiAgICAgICAgdGhpcy5lbWlzc2l2ZUludGVuc2l0eS52YWx1ZSA9IDAuMzM7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkpXHJcbiAgICAgICAgICAgIC50byh7dmFsdWU6IDEuMH0sIDc1MClcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuU2ludXNvaWRhbC5Jbk91dClcclxuICAgICAgICAgICAgLnlveW8odHJ1ZSlcclxuICAgICAgICAgICAgLnJlcGVhdChJbmZpbml0eSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMucHVsc2VUd2VlbkVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwUHVsc2UoZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoUm9vbU9mZihmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHBhbmVsID0gdGhpcy5wYW5lbHNbZmxvb3JJZHhdW3BhbmVsSWR4XTtcclxuICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoUm9vbU9uKGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIsIGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcGFuZWwgPSB0aGlzLnBhbmVsc1tmbG9vcklkeF1bcGFuZWxJZHhdO1xyXG4gICAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlLnNldEhleChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZEFjdGl2ZVNoYXBlTGlnaHRUbyhmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyLCBjb2xvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHBvaW50TGlnaHQgPSB0aGlzLmdldE5leHRQb2ludExpZ2h0KCk7XHJcbiAgICAgICAgcG9pbnRMaWdodC5jb2xvci5zZXRIZXgoY29sb3IpO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHBhbmVsSWR4O1xyXG4gICAgICAgIGxldCB5ID0gZmxvb3JJZHggKyAxOyAvLyBPZmZzZXQgdXAgMSBiZWNhdXNlIGdyb3VuZCBpcyB5ID0gMC5cclxuICAgICAgICBsZXQgeiA9IDAuMzM7XHJcbiAgICAgICAgcG9pbnRMaWdodC5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXROZXh0UG9pbnRMaWdodCgpIHtcclxuICAgICAgICBsZXQgcG9pbnRMaWdodCA9IHRoaXMucG9pbnRMaWdodHNbdGhpcy5jdXJyZW50UG9pbnRMaWdodElkeF07XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UG9pbnRMaWdodElkeCsrO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQb2ludExpZ2h0SWR4ID49IEFDVElWRV9TSEFQRV9MSUdIVF9DT1VOVCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQb2ludExpZ2h0SWR4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBvaW50TGlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwUHVsc2UoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucHVsc2VUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHVsc2VUd2VlbkVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy5wdWxzZVR3ZWVuLnVwZGF0ZSh0aGlzLnB1bHNlVHdlZW5FbGFwc2VkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgZmxvb3Igb2YgdGhpcy5wYW5lbHMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFuZWwgb2YgZmxvb3IpIHtcclxuICAgICAgICAgICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlSW50ZW5zaXR5ID0gdGhpcy5lbWlzc2l2ZUludGVuc2l0eS52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtDZWxsQ2hhbmdlRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2NlbGwtY2hhbmdlLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlRW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWVuZGVkLWV2ZW50JztcclxuaW1wb3J0IHtMaWdodGluZ0dyaWQsIEZMT09SX0NPVU5ULCBQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4vbGlnaHRpbmctZ3JpZCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7Q2VsbE9mZnNldH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN3aXRjaGJvYXJkIHtcclxuXHJcbiAgICBwcml2YXRlIGxpZ2h0aW5nR3JpZDogTGlnaHRpbmdHcmlkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGxpZ2h0aW5nR3JpZDogTGlnaHRpbmdHcmlkKSB7XHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQgPSBsaWdodGluZ0dyaWQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGUsIChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5BY3RpdmVTaGFwZUVuZGVkRXZlbnRUeXBlLCAoZXZlbnQ6IEFjdGl2ZVNoYXBlRW5kZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGl2ZVNoYXBlRW5kZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkNlbGxDaGFuZ2VFdmVudFR5cGUsIChldmVudDogQ2VsbENoYW5nZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2VsbENoYW5nZUV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgZmxvb3JJZHggPSB0aGlzLmNvbnZlcnRSb3dUb0Zsb29yKGV2ZW50LnNoYXBlLmdldFJvdygpKTtcclxuICAgICAgICBsZXQgcGFuZWxJZHggPSBldmVudC5zaGFwZS5nZXRDb2woKTtcclxuICAgICAgICBsZXQgY29sb3IgPSB0aGlzLmNvbnZlcnRDb2xvcihldmVudC5zaGFwZS5jb2xvcik7XHJcblxyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiBldmVudC5zaGFwZS5nZXRPZmZzZXRzKCkpIHtcclxuICAgICAgICAgICAgbGV0IG9mZnNldEZsb29ySWR4ID0gZmxvb3JJZHggLSBvZmZzZXQueTtcclxuICAgICAgICAgICAgaWYgKG9mZnNldEZsb29ySWR4ID49IEZMT09SX0NPVU5UKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gU2tpcCBvYnN0cnVjdGVkIGZsb29yc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXRQYW5lbElkeCA9IHBhbmVsSWR4ICsgb2Zmc2V0Lng7XHJcbiAgICAgICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnNlbmRBY3RpdmVTaGFwZUxpZ2h0VG8ob2Zmc2V0Rmxvb3JJZHgsIG9mZnNldFBhbmVsSWR4LCBjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQWN0aXZlU2hhcGVFbmRlZEV2ZW50KGV2ZW50OiBBY3RpdmVTaGFwZUVuZGVkRXZlbnQpIHtcclxuICAgICAgICAvLyBUT0RPOiBNYXliZSBzZXQgc29tZSBzb3J0IG9mIGFuaW1hdGlvbiBpbiBtb3Rpb25cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNlbGxDaGFuZ2VFdmVudChldmVudDogQ2VsbENoYW5nZUV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGZsb29ySWR4ID0gdGhpcy5jb252ZXJ0Um93VG9GbG9vcihldmVudC5yb3cpO1xyXG4gICAgICAgIGlmIChmbG9vcklkeCA+PSBGTE9PUl9DT1VOVCkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIFNraXAgb2JzdHJ1Y3RlZCBmbG9vcnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwYW5lbElkeCA9IGV2ZW50LmNvbDtcclxuICAgICAgICBpZiAoZXZlbnQuY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zd2l0Y2hSb29tT2ZmKGZsb29ySWR4LCBwYW5lbElkeCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IGNvbG9yID0gdGhpcy5jb252ZXJ0Q29sb3IoZXZlbnQuY2VsbC5nZXRDb2xvcigpKTtcclxuICAgICAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc3dpdGNoUm9vbU9uKGZsb29ySWR4LCBwYW5lbElkeCwgY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgY2VsbCByb3cvY29sIGNvb3JkaW5hdGVzIHRvIGZsb29yL3BhbmVsIGNvb3JkaW5hdGVzLlxyXG4gICAgICogQWNjb3VudCBmb3IgdGhlIHR3byBmbG9vcnMgdGhhdCBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuICg/KVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbnZlcnRSb3dUb0Zsb29yKHJvdzogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHRoaW5nID0gKEZMT09SX0NPVU5UIC0gcm93KSArIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29udmVydENvbG9yKGNvbG9yOiBDb2xvcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBudW1iZXI7XHJcbiAgICAgICAgc3dpdGNoIChjb2xvcikge1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkN5YW46XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4MDBmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuWWVsbG93OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGZmZmYwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLlB1cnBsZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHg4MDAwODA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5HcmVlbjpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgwMDgwMDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5SZWQ6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmYwMDAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuQmx1ZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgwMDAwZmY7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5PcmFuZ2U6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZhNTAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuV2hpdGU6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vIERlZmF1bHQgb3IgbWlzc2luZyBjYXNlIGlzIGJsYWNrLlxyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkVtcHR5OlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDAwMDAwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG4vLyBEaW1lbnNpb25zIG9mIHRoZSBlbnRpcmUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVTSEVFVF9XSURUSCAgID0gMjU2O1xyXG5leHBvcnQgY29uc3QgU1BSSVRFU0hFRVRfSEVJR0hUICA9IDUxMjtcclxuXHJcbi8vIERpbWVuc2lvbnMgb2Ygb25lIGZyYW1lIHdpdGhpbiB0aGUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9XSURUSCAgID0gNDg7XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9IRUlHSFQgID0gNzI7XHJcblxyXG5jb25zdCBUT1RBTF9ESUZGRVJFTlRfVEVYVFVSRVMgPSAzO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlciB7XHJcblxyXG4gICAgcmVhZG9ubHkgdGV4dHVyZTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRleHR1cmU6IGFueSkge1xyXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZSB7XHJcblxyXG4gICAgcHJpdmF0ZSB0ZXh0dXJlczogYW55W107XHJcbiAgICBwcml2YXRlIGxvYWRlZENvdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRUZXh0dXJlSWR4OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMubG9hZGVkQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoY2FsbGJhY2s6ICgpID0+IGFueSkge1xyXG4gICAgICAgIGxldCB0ZXh0dXJlTG9hZGVkSGFuZGxlciA9ICh0ZXh0dXJlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgLy8gSGF2ZSBpdCBzaG93IG9ubHkgb25lIGZyYW1lIGF0IGEgdGltZTpcclxuICAgICAgICAgICAgdGV4dHVyZS5yZXBlYXQuc2V0KFxyXG4gICAgICAgICAgICAgICAgRlJBTUVfV0lEVEggIC8gU1BSSVRFU0hFRVRfV0lEVEgsXHJcbiAgICAgICAgICAgICAgICBGUkFNRV9IRUlHSFQgLyBTUFJJVEVTSEVFVF9IRUlHSFRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlcy5wdXNoKHRleHR1cmUpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRlZENvdW50Kys7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxvYWRlZENvdW50ID49IFRPVEFMX0RJRkZFUkVOVF9URVhUVVJFUykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRleHR1cmVMb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgICAgIHRleHR1cmVMb2FkZXIubG9hZCgnZmFsbC1zdHVkZW50LnBuZycsIHRleHR1cmVMb2FkZWRIYW5kbGVyKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudDIucG5nJywgdGV4dHVyZUxvYWRlZEhhbmRsZXIpO1xyXG4gICAgICAgIHRleHR1cmVMb2FkZXIubG9hZCgnZmFsbC1zdHVkZW50My5wbmcnLCB0ZXh0dXJlTG9hZGVkSGFuZGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgbmV3SW5zdGFuY2UoKTogU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyIHtcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5nZXROZXh0VGV4dHVyZUlkeCgpO1xyXG4gICAgICAgIGxldCB0ZXh0dXJlID0gdGhpcy50ZXh0dXJlc1tpZHhdLmNsb25lKCk7IC8vIENsb25pbmcgdGV4dHVyZXMgaW4gdGhlIHZlcnNpb24gb2YgVGhyZWVKUyB0aGF0IEkgYW0gY3VycmVudGx5IHVzaW5nIHdpbGwgZHVwbGljYXRlIHRoZW0gOihcclxuICAgICAgICByZXR1cm4gbmV3IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcih0ZXh0dXJlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRUZXh0dXJlSWR4KCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHgrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50VGV4dHVyZUlkeCA+PSBUT1RBTF9ESUZGRVJFTlRfVEVYVFVSRVMpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGV4dHVyZUlkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRUZXh0dXJlSWR4O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UgPSBuZXcgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtTdGFuZGVlfSBmcm9tICcuL3N0YW5kZWUnO1xyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY01vdmVtZW50Q2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudCc7XHJcblxyXG5jb25zdCBZX09GRlNFVCA9IDAuNzU7IC8vIFNldHMgdGhlaXIgZmVldCBvbiB0aGUgZ3JvdW5kIHBsYW5lLlxyXG5cclxuY2xhc3MgU3RhbmRlZU1hbmFnZXIge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFuZGVlczogTWFwPG51bWJlciwgU3RhbmRlZT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YW5kZWVzID0gbmV3IE1hcDxudW1iZXIsIFN0YW5kZWU+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXRZKFlfT0ZGU0VUKTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY1BsYWNlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNQbGFjZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY1BsYWNlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RhbmRlZXMuZm9yRWFjaCgoc3RhbmRlZTogU3RhbmRlZSkgPT4ge1xyXG4gICAgICAgICAgICBzdGFuZGVlLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOcGNQbGFjZWRFdmVudChldmVudDogTnBjUGxhY2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IG5ldyBTdGFuZGVlKGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBzdGFuZGVlLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQoc3RhbmRlZS5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5zdGFuZGVlcy5zZXQoc3RhbmRlZS5ucGNJZCwgc3RhbmRlZSk7XHJcblxyXG4gICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Jbml0aWFsUG9zaXRpb24oc3RhbmRlZSwgeCwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtb3ZlVG9Jbml0aWFsUG9zaXRpb24oc3RhbmRlZTogU3RhbmRlZSwgeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICAvLyBUT0RPOiBVc2UgZXZlbnQueCwgZXZlbnQueSB3aXRoIHNjYWxpbmcgdG8gZGV0ZXJtaW5lIGRlc3RpbmF0aW9uXHJcbiAgICAgICAgc3RhbmRlZS5tb3ZlVG8oeCx6KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBzdGFuZGVlID0gdGhpcy5zdGFuZGVlcy5nZXQoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIGlmIChzdGFuZGVlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgICAgIHN0YW5kZWUud2Fsa1RvKHgsIHosIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc3RhbmRlZU1hbmFnZXIgPSBuZXcgU3RhbmRlZU1hbmFnZXIoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5kZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgU1BSSVRFU0hFRVRfV0lEVEgsXHJcbiAgICBTUFJJVEVTSEVFVF9IRUlHSFQsXHJcbiAgICBGUkFNRV9XSURUSCxcclxuICAgIEZSQU1FX0hFSUdIVCxcclxuICAgIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcixcclxuICAgIHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZX1cclxuZnJvbSAnLi9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UnO1xyXG5cclxuY29uc3QgU1RBTkRBUkRfREVMQVkgPSAyMjU7XHJcbmNvbnN0IFdBTEtfVVBfT1JfRE9XTl9ERUxBWSA9IE1hdGguZmxvb3IoU1RBTkRBUkRfREVMQVkgKiAoMi8zKSk7IC8vIEJlY2F1c2UgdXAvZG93biB3YWxrIGN5Y2xlcyBoYXZlIG1vcmUgZnJhbWVzLiBcclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb25GcmFtZSB7XHJcblxyXG4gICAgcmVhZG9ubHkgcm93OiBudW1iZXI7XHJcbiAgICByZWFkb25seSBjb2w6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb3c6IG51bWJlciwgY29sOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdzsgXHJcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBlbnVtIFN0YW5kZWVBbmltYXRpb25UeXBlIHtcclxuICAgIFN0YW5kVXAsXHJcbiAgICBTdGFuZERvd24sXHJcbiAgICBTdGFuZExlZnQsXHJcbiAgICBTdGFuZFJpZ2h0LFxyXG4gICAgV2Fsa1VwLFxyXG4gICAgV2Fsa0Rvd24sXHJcbiAgICBXYWxrTGVmdCxcclxuICAgIFdhbGtSaWdodCxcclxuICAgIENoZWVyVXAsXHJcbiAgICBQYW5pY1VwLFxyXG4gICAgUGFuaWNEb3duXHJcbn1cclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgXHJcbiAgICByZWFkb25seSB0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZTtcclxuICAgIHJlYWRvbmx5IG5leHQ6IFN0YW5kZWVBbmltYXRpb25UeXBlOyAvLyBQcm9iYWJseSBub3QgZ29pbmcgdG8gYmUgdXNlZCBmb3IgdGhpcyBnYW1lXHJcblxyXG4gICAgcmVhZG9ubHkgZnJhbWVzOiBTdGFuZGVlQW5pbWF0aW9uRnJhbWVbXTtcclxuICAgIHJlYWRvbmx5IGRlbGF5czogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIGN1cnJlbnRGcmFtZUlkeDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50RnJhbWVUaW1lRWxhcHNlZDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgZmluaXNoZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IodHlwZTogU3RhbmRlZUFuaW1hdGlvblR5cGUsIG5leHQ/OiBTdGFuZGVlQW5pbWF0aW9uVHlwZSkge1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgaWYgKG5leHQpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0ID0gbmV4dDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5leHQgPSB0eXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlbGF5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZyYW1lSWR4ID0gMDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1c2goZnJhbWU6IFN0YW5kZWVBbmltYXRpb25GcmFtZSwgZGVsYXkgPSBTVEFOREFSRF9ERUxBWSkge1xyXG4gICAgICAgIHRoaXMuZnJhbWVzLnB1c2goZnJhbWUpO1xyXG4gICAgICAgIHRoaXMuZGVsYXlzLnB1c2goZGVsYXkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID49IHRoaXMuZGVsYXlzW3RoaXMuY3VycmVudEZyYW1lSWR4XSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHgrKztcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEZyYW1lSWR4ID49IHRoaXMuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHggPSAwOyAvLyBTaG91bGRuJ3QgYmUgdXNlZCBhbnltb3JlLCBidXQgcHJldmVudCBvdXQtb2YtYm91bmRzIGFueXdheS5cclxuICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzRmluaXNoZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudEZyYW1lKCk6IFN0YW5kZWVBbmltYXRpb25GcmFtZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJhbWVzW3RoaXMuY3VycmVudEZyYW1lSWR4XTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVTcHJpdGVXcmFwcGVyIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuICAgIHByaXZhdGUgc3ByaXRlOiBhbnk7XHJcbiAgICBwcml2YXRlIHRleHR1cmVXcmFwcGVyOiBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50QW5pbWF0aW9uOiBTdGFuZGVlQW5pbWF0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUaHJlZUpTIG9iamVjdHM6IFxyXG4gICAgICAgIHRoaXMudGV4dHVyZVdyYXBwZXIgPSBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UubmV3SW5zdGFuY2UoKTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU3ByaXRlTWF0ZXJpYWwoe21hcDogdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlLCBjb2xvcjogMHg5OTk5OTl9KTtcclxuICAgICAgICB0aGlzLnNwcml0ZSA9IG5ldyBUSFJFRS5TcHJpdGUobWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnNjYWxlLnNldCgxLCAxLjUpOyAvLyBBZGp1c3QgYXNwZWN0IHJhdGlvIGZvciA0OCB4IDcyIHNpemUgZnJhbWVzLiBcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLnNwcml0ZSk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgZGVmYXVsdCBhbmltYXRpb24gdG8gc3RhbmRpbmcgZmFjaW5nIGRvd246XHJcbiAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gY3JlYXRlU3RhbmREb3duKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy8gVE9ETzogU2V0IHRoaXMgZWxzZXdoZXJlXHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0ZXBDdXJyZW50RnJhbWUoZWxhcHNlZCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogT25seSBzd2l0Y2hlcyBpZiB0aGUgZ2l2ZW4gYW5pbWF0aW9uIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBjdXJyZW50IG9uZS5cclxuICAgICAqL1xyXG4gICAgc3dpdGNoQW5pbWF0aW9uKHR5cGU6IFN0YW5kZWVBbmltYXRpb25UeXBlKSB7XHJcbiAgICAgICAgbGV0IGFuaW1hdGlvbiA9IGRldGVybWluZUFuaW1hdGlvbih0eXBlKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uLnR5cGUgIT09IGFuaW1hdGlvbi50eXBlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcclxuICAgICAgICB9IFxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcEN1cnJlbnRGcmFtZShlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFuaW1hdGlvbi5pc0ZpbmlzaGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gZGV0ZXJtaW5lQW5pbWF0aW9uKHRoaXMuY3VycmVudEFuaW1hdGlvbi5uZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZyYW1lID0gdGhpcy5jdXJyZW50QW5pbWF0aW9uLmdldEN1cnJlbnRGcmFtZSgpO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGZyYW1lIGNvb3JkaW5hdGVzIHRvIHRleHR1cmUgY29vcmRpbmF0ZXMgYW5kIHNldCB0aGUgY3VycmVudCBvbmVcclxuICAgICAgICBsZXQgeHBjdCA9IChmcmFtZS5jb2wgKiBGUkFNRV9XSURUSCkgLyBTUFJJVEVTSEVFVF9XSURUSDtcclxuICAgICAgICBsZXQgeXBjdCA9ICgoKFNQUklURVNIRUVUX0hFSUdIVCAvIEZSQU1FX0hFSUdIVCkgLSAxIC0gZnJhbWUucm93KSAqIEZSQU1FX0hFSUdIVCkgLyBTUFJJVEVTSEVFVF9IRUlHSFQ7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlLm9mZnNldC5zZXQoeHBjdCwgeXBjdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRldGVybWluZUFuaW1hdGlvbih0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZSk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbjogU3RhbmRlZUFuaW1hdGlvbjtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlU3RhbmRVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZERvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrRG93bjpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVXYWxrTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kUmlnaHQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtSaWdodCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLkNoZWVyVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZUNoZWVyVXAoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFVwXHJcbmxldCBzdGFuZFVwRnJhbWUxICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFVwRnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgVXBcclxubGV0IHdhbGtVcEZyYW1lMSAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgd2Fsa1VwRnJhbWUyICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMSk7XHJcbmxldCB3YWxrVXBGcmFtZTMgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAyKTtcclxubGV0IHdhbGtVcEZyYW1lNCAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDMpO1xyXG5sZXQgd2Fsa1VwRnJhbWU1ICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMyk7XHJcbmxldCB3YWxrVXBGcmFtZTYgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg1LCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXApO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUyLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUzLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU1LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU2LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gU3RhbmRpbmcgRG93blxyXG5sZXQgc3RhbmREb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZERvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHN0YW5kRG93bkZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIERvd25cclxubGV0IHdhbGtEb3duRnJhbWUxICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDApO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTIgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMSk7XHJcbmxldCB3YWxrRG93bkZyYW1lMyAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAyKTtcclxubGV0IHdhbGtEb3duRnJhbWU0ICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDMpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTUgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMyk7XHJcbmxldCB3YWxrRG93bkZyYW1lNiAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtEb3duKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTIsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lMywgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTUsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lNiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIExlZnRcclxubGV0IHN0YW5kTGVmdEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDEpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU3RhbmRMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kTGVmdCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZExlZnRGcmFtZTEpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gV2Fsa2luZyBMZWZ0XHJcbmxldCB3YWxrTGVmdEZyYW1lMSAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAxKTtcclxubGV0IHdhbGtMZWZ0RnJhbWUyICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDApO1xyXG5sZXQgd2Fsa0xlZnRGcmFtZTMgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMSk7XHJcbmxldCB3YWxrTGVmdEZyYW1lNCAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAyKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0KTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFJpZ2h0XHJcbmxldCBzdGFuZFJpZ2h0RnJhbWUxICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kUmlnaHQoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFJpZ2h0RnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgUmlnaHRcclxubGV0IHdhbGtSaWdodEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDQpO1xyXG5sZXQgd2Fsa1JpZ2h0RnJhbWUyICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgNCk7XHJcbmxldCB3YWxrUmlnaHRGcmFtZTMgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxubGV0IHdhbGtSaWdodEZyYW1lNCAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDQpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlV2Fsa1JpZ2h0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtSaWdodEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gQ2hlZXIgVXBcclxubGV0IGNoZWVyVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgY2hlZXJVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMCk7XHJcbmxldCBjaGVlclVwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAxKTtcclxubGV0IGNoZWVyVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDApO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2hlZXJVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5DaGVlclVwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goY2hlZXJVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgVXBcclxubGV0IHBhbmljVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgcGFuaWNVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMik7XHJcbmxldCBwYW5pY1VwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAwKTtcclxubGV0IHBhbmljVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDIpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGFuaWNVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgRG93blxyXG5sZXQgcGFuaWNEb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcbmxldCBwYW5pY0Rvd25GcmFtZTIgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAxKTtcclxubGV0IHBhbmljRG93bkZyYW1lMyAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDIpO1xyXG5sZXQgcGFuaWNEb3duRnJhbWU0ICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMSk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQYW5pY0Rvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNEb3duRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvc3RhbmRlZS1tb3ZlbWVudC1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7U3RhbmRlZVNwcml0ZVdyYXBwZXIsIFN0YW5kZWVBbmltYXRpb25UeXBlfSBmcm9tICcuL3N0YW5kZWUtc3ByaXRlLXdyYXBwZXInO1xyXG5pbXBvcnQge2NhbWVyYVdyYXBwZXJ9IGZyb20gJy4uL2NhbWVyYS13cmFwcGVyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlIHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICByZWFkb25seSBzcHJpdGVXcmFwcGVyOiBTdGFuZGVlU3ByaXRlV3JhcHBlcjtcclxuXHJcbiAgICBwcml2YXRlIHdhbGtUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgd2Fsa1R3ZWVuOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBmYWNpbmc6IGFueTsgLy8gRmFjZXMgaW4gdGhlIHZlY3RvciBvZiB3aGljaCB3YXkgdGhlIE5QQyBpcyB3YWxraW5nLCB3YXMgd2Fsa2luZyBiZWZvcmUgc3RvcHBpbmcsIG9yIHdhcyBzZXQgdG8uXHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlciA9IG5ldyBTdGFuZGVlU3ByaXRlV3JhcHBlcigpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuc3ByaXRlV3JhcHBlci5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmZhY2luZyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoLTIwMCwgMCwgLTIwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0ZXBXYWxrKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQ29ycmVjdEFuaW1hdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEltbWVkaWF0ZWx5IHNldCBzdGFuZGVlIG9uIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBtb3ZlVG8oeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCh4LCAwLCB6KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBzdGFuZGVlIGluIG1vdGlvbiB0b3dhcmRzIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICogU3BlZWQgZGltZW5zaW9uIGlzIDEgdW5pdC9zZWMuXHJcbiAgICAgKi9cclxuICAgIHdhbGtUbyh4OiBudW1iZXIsIHo6IG51bWJlciwgc3BlZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3cgbG9uZyBpdCB3b3VsZCB0YWtlLCBnaXZlbiB0aGUgc3BlZWQgcmVxdWVzdGVkLlxyXG4gICAgICAgIGxldCB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMyh4LCAwLCB6KS5zdWIodGhpcy5ncm91cC5wb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gdmVjdG9yLmxlbmd0aCgpO1xyXG4gICAgICAgIGxldCB0aW1lID0gKGRpc3RhbmNlIC8gc3BlZWQpICogMTAwMDtcclxuXHJcbiAgICAgICAgLy8gRGVsZWdhdGUgdG8gdHdlZW4uanMuIFBhc3MgaW4gY2xvc3VyZXMgYXMgY2FsbGJhY2tzIGJlY2F1c2Ugb3RoZXJ3aXNlICd0aGlzJyB3aWxsIHJlZmVyXHJcbiAgICAgICAgLy8gdG8gdGhlIHBvc2l0aW9uIG9iamVjdCwgd2hlbiBleGVjdXRpbmcgc3RvcFdhbGsoKS5cclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZ3JvdXAucG9zaXRpb24pXHJcbiAgICAgICAgICAgIC50byh7eDogeCwgejogen0sIHRpbWUpXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IHsgdGhpcy5zdG9wV2FsaygpOyB9KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy53YWxrVHdlZW5FbGFwc2VkKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBVcGRhdGUgZGlyZWN0aW9uIHRoaXMgc3RhbmRlZSB3aWxsIGJlIGZhY2luZyB3aGVuIHdhbGtpbmcuXHJcbiAgICAgICAgdGhpcy5mYWNpbmcuc2V0WCh4IC0gdGhpcy5ncm91cC5wb3NpdGlvbi54KTtcclxuICAgICAgICB0aGlzLmZhY2luZy5zZXRaKHogLSB0aGlzLmdyb3VwLnBvc2l0aW9uLnopO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcFdhbGsoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2Fsa1R3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMud2Fsa1R3ZWVuLnVwZGF0ZSh0aGlzLndhbGtUd2VlbkVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0b3BXYWxrKCkge1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoXHJcbiAgICAgICAgICAgIHRoaXMubnBjSWQsXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi56KVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbnN1cmVDb3JyZWN0QW5pbWF0aW9uKCkge1xyXG4gICAgICAgIC8vIGxldCB0YXJnZXQgPSB0aGlzLmdyb3VwLnBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgLy8gdGFyZ2V0LnNldFkodGFyZ2V0LnkgKyAwLjUpO1xyXG4gICAgICAgIC8vIGNhbWVyYVdyYXBwZXIuY2FtZXJhLmxvb2tBdCh0YXJnZXQpO1xyXG5cclxuICAgICAgICAvLyBBbmdsZSBiZXR3ZWVuIHR3byB2ZWN0b3JzOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTQ4NDIyOFxyXG4gICAgICAgIGxldCB3b3JsZERpcmVjdGlvbiA9IGNhbWVyYVdyYXBwZXIuY2FtZXJhLmdldFdvcmxkRGlyZWN0aW9uKCk7XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0aGlzLmZhY2luZy56LCB0aGlzLmZhY2luZy54KSAtIE1hdGguYXRhbjIod29ybGREaXJlY3Rpb24ueiwgd29ybGREaXJlY3Rpb24ueCk7XHJcbiAgICAgICAgaWYgKGFuZ2xlIDwgMCkgYW5nbGUgKz0gMiAqIE1hdGguUEk7XHJcbiAgICAgICAgYW5nbGUgKj0gKDE4MC9NYXRoLlBJKTsgLy8gSXQncyBteSBwYXJ0eSBhbmQgSSdsbCB1c2UgZGVncmVlcyBpZiBJIHdhbnQgdG8uXHJcblxyXG4gICAgICAgIGlmICh0aGlzLndhbGtUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmdsZSA8IDYwIHx8IGFuZ2xlID49IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDYwICYmIGFuZ2xlIDwgMTIwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gMTIwICYmIGFuZ2xlIDwgMjQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSAyNDAgJiYgYW5nbGUgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0xlZnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGFuZ2xlIDwgNjAgfHwgYW5nbGUgPj0gMzAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kVXApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDYwICYmIGFuZ2xlIDwgMTIwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDEyMCAmJiBhbmdsZSA8IDI0MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZERvd24pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDI0MCAmJiBhbmdsZSA8IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtjYW1lcmFXcmFwcGVyfSBmcm9tICcuL2NhbWVyYS13cmFwcGVyJztcclxuaW1wb3J0IHt3b3JsZH0gZnJvbSAnLi93b3JsZC93b3JsZCc7XHJcbmltcG9ydCB7TGlnaHRpbmdHcmlkfSBmcm9tICcuL2xpZ2h0aW5nL2xpZ2h0aW5nLWdyaWQnO1xyXG5pbXBvcnQge1N3aXRjaGJvYXJkfSBmcm9tICcuL2xpZ2h0aW5nL3N3aXRjaGJvYXJkJztcclxuaW1wb3J0IHtzdGFuZGVlTWFuYWdlcn0gZnJvbSAnLi9zdGFuZGVlL3N0YW5kZWUtbWFuYWdlcic7XHJcblxyXG5jbGFzcyBWaWV3IHtcclxuXHJcbiAgICBwcml2YXRlIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBwcml2YXRlIHNjZW5lOiBhbnk7XHJcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBwbGF5ZXJHcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIHBsYXllclN3aXRjaGJvYXJkOiBTd2l0Y2hib2FyZDtcclxuICAgIHByaXZhdGUgYWlHcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIGFpU3dpdGNoYm9hcmQ6IFN3aXRjaGJvYXJkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YW50aWFsaWFzOiB0cnVlLCBjYW52YXM6IHRoaXMuY2FudmFzfSk7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWVyR3JpZCA9IG5ldyBMaWdodGluZ0dyaWQoKTtcclxuICAgICAgICB0aGlzLnBsYXllclN3aXRjaGJvYXJkID0gbmV3IFN3aXRjaGJvYXJkKHRoaXMucGxheWVyR3JpZCk7XHJcbiAgICAgICAgdGhpcy5haUdyaWQgPSBuZXcgTGlnaHRpbmdHcmlkKCk7XHJcbiAgICAgICAgdGhpcy5haVN3aXRjaGJvYXJkID0gbmV3IFN3aXRjaGJvYXJkKHRoaXMuYWlHcmlkKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLnBsYXllckdyaWQuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLnBsYXllclN3aXRjaGJvYXJkLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5haUdyaWQuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmFpU3dpdGNoYm9hcmQuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb1N0YXJ0KCk7XHJcblxyXG4gICAgICAgIHdvcmxkLnN0YXJ0KCk7XHJcbiAgICAgICAgc3RhbmRlZU1hbmFnZXIuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGNhbnZhcyBzaG91bGQgaGF2ZSBiZWVuIGhpZGRlbiB1bnRpbCBzZXR1cCBpcyBjb21wbGV0ZS5cclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB3b3JsZC5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllclN3aXRjaGJvYXJkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJHcmlkLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWlHcmlkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJTd2l0Y2hib2FyZC5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICBzdGFuZGVlTWFuYWdlci5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCBjYW1lcmFXcmFwcGVyLmNhbWVyYSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkb1N0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHdvcmxkLmdyb3VwKTtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZChzdGFuZGVlTWFuYWdlci5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMucGxheWVyR3JpZC5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMuYWlHcmlkLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmFpR3JpZC5ncm91cC5wb3NpdGlvbi5zZXRYKDEwKTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogVGVtcG9yYXJ5IGZvciBkZWJ1Z2dpbmc/XHJcbiAgICAgICAgLy8gdGhpcy5zY2VuZS5hZGQobmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDQwNDA0MCkpO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBUZW1wb3JhcnlcclxuICAgICAgICBsZXQgc3BvdExpZ2h0ID0gbmV3IFRIUkVFLlNwb3RMaWdodCgweGJiYmJmZik7XHJcbiAgICAgICAgc3BvdExpZ2h0LnBvc2l0aW9uLnNldCgtMywgMC43NSwgMTUpO1xyXG4gICAgICAgIHNwb3RMaWdodC50YXJnZXQgPSB0aGlzLnBsYXllckdyaWQuZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoc3BvdExpZ2h0KTtcclxuXHJcbiAgICAgICAgY2FtZXJhV3JhcHBlci5zZXRQb3NpdGlvbigtMywgMC43NSwgMTUpOyAvLyBNb3JlIG9yIGxlc3MgZXllLWxldmVsIHdpdGggdGhlIE5QQ3MuXHJcbiAgICAgICAgY2FtZXJhV3JhcHBlci5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMywgOCwgMSkpO1xyXG5cclxuICAgICAgICBjYW1lcmFXcmFwcGVyLnVwZGF0ZVJlbmRlcmVyU2l6ZSh0aGlzLnJlbmRlcmVyKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjYW1lcmFXcmFwcGVyLnVwZGF0ZVJlbmRlcmVyU2l6ZSh0aGlzLnJlbmRlcmVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgdmlldyA9IG5ldyBWaWV3KCk7XHJcbiIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmNsYXNzIEdyb3VuZCB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIGdyYXNzOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgzMDAsIDMwMCk7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2VtaXNzaXZlOiAweDAyMWQwMywgZW1pc3NpdmVJbnRlbnNpdHk6IDEuMH0pO1xyXG4gICAgICAgIHRoaXMuZ3Jhc3MgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMuZ3Jhc3Mucm90YXRpb24ueCA9IChNYXRoLlBJICogMykgLyAyO1xyXG4gICAgICAgIHRoaXMuZ3Jhc3MucG9zaXRpb24uc2V0KDAsIDAsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuZ3Jhc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZ3JvdW5kID0gbmV3IEdyb3VuZCgpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmNvbnN0IFNUQVJUX1pfQU5HTEUgPSAtKE1hdGguUEkgLyAzMCk7XHJcbmNvbnN0IEVORF9aX0FOR0xFICAgPSAgIE1hdGguUEkgLyAzMDtcclxuY29uc3QgUk9UQVRJT05fU1BFRUQgPSAwLjAwMDE7XHJcblxyXG5jbGFzcyBTa3kge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBkb21lOiBhbnk7XHJcbiAgICBwcml2YXRlIHJkejogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDUwLCAzMiwgMzIpOyAvLyBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMTUwLCAxNTAsIDE1MCk7XHJcbiAgICAgICAgbGV0IHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmdlbmVyYXRlVGV4dHVyZSgpKTtcclxuICAgICAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe21hcDogdGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWV9KTtcclxuICAgICAgICB0aGlzLmRvbWUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMuZG9tZS5tYXRlcmlhbC5zaWRlID0gVEhSRUUuQmFja1NpZGU7XHJcbiAgICAgICAgdGhpcy5kb21lLnBvc2l0aW9uLnNldCgxMCwgMTAsIDApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuZG9tZSk7XHJcblxyXG4gICAgICAgIHRoaXMucmR6ID0gLVJPVEFUSU9OX1NQRUVEO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZG9tZS5yb3RhdGlvbi5zZXQoMCwgMCwgU1RBUlRfWl9BTkdMRSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmRvbWUucm90YXRpb24uc2V0KDAsIDAsIHRoaXMuZG9tZS5yb3RhdGlvbi56ICsgdGhpcy5yZHopO1xyXG4gICAgICAgIGlmICh0aGlzLmRvbWUucm90YXRpb24ueiA+PSBFTkRfWl9BTkdMRSkge1xyXG4gICAgICAgICAgICB0aGlzLnJkeiA9IC1ST1RBVElPTl9TUEVFRDtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZG9tZS5yb3RhdGlvbi56IDw9IFNUQVJUX1pfQU5HTEUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZHogPSBST1RBVElPTl9TUEVFRDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlZCBvbjogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTk5OTI1MDVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVRleHR1cmUoKTogYW55IHtcclxuICAgICAgICBsZXQgc2l6ZSA9IDUxMjtcclxuICAgICAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gc2l6ZTtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gc2l6ZTtcclxuICAgICAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgY3R4LnJlY3QoMCwgMCwgc2l6ZSwgc2l6ZSk7XHJcbiAgICAgICAgbGV0IGdyYWRpZW50ID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHNpemUpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjAwLCAnIzAwMDAwMCcpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjQwLCAnIzEzMWM0NScpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjc1LCAnI2ZmOTU0NCcpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjg1LCAnIzEzMWM0NScpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLjAwLCAnIzEzMWM0NScpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBncmFkaWVudDtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgIHJldHVybiBjYW52YXM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHNreSA9IG5ldyBTa3koKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge3NreX0gZnJvbSAnLi9za3knO1xyXG5pbXBvcnQge2dyb3VuZH0gZnJvbSAnLi9ncm91bmQnO1xyXG5cclxuY2xhc3MgV29ybGQge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZChza3kuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKGdyb3VuZC5ncm91cCk7XHJcblxyXG4gICAgICAgIHNreS5zdGFydCgpO1xyXG4gICAgICAgIGdyb3VuZC5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgc2t5LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgZ3JvdW5kLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHdvcmxkID0gbmV3IFdvcmxkKCk7Il19
