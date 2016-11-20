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
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.RotateClockwise, 0 /* Human */));
        }
        if (input_1.input.isDownAndUnhandled(0 /* Left */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Left, 0 /* Human */));
        }
        if (input_1.input.isDownAndUnhandled(3 /* Right */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Right, 0 /* Human */));
        }
        if (input_1.input.isDownAndUnhandled(2 /* Down */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Down, 0 /* Human */));
        }
        if (input_1.input.isDownAndUnhandled(4 /* Space */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Drop, 0 /* Human */));
        }
    };
    return Controller;
}());
exports.controller = new Controller();
},{"../domain/player-movement":4,"../event/event-bus":8,"../event/player-movement-event":12,"./input":2}],2:[function(require,module,exports){
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
    function ActiveShapeChangedEvent(shape, playerType, starting) {
        _super.call(this);
        this.shape = shape;
        this.playerType = playerType;
        this.starting = starting;
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
var BoardFilledEvent = (function (_super) {
    __extends(BoardFilledEvent, _super);
    function BoardFilledEvent(playerType) {
        _super.call(this);
        this.playerType = playerType;
    }
    BoardFilledEvent.prototype.getType = function () {
        return event_bus_1.EventType.BoardFilledEventType;
    };
    return BoardFilledEvent;
}(event_bus_1.AbstractEvent));
exports.BoardFilledEvent = BoardFilledEvent;
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
    function CellChangeEvent(cell, row, col, playerType) {
        _super.call(this);
        this.cell = cell;
        this.row = row;
        this.col = col;
        this.playerType = playerType;
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
    EventType[EventType["BoardFilledEventType"] = 2] = "BoardFilledEventType";
    EventType[EventType["CellChangeEventType"] = 3] = "CellChangeEventType";
    EventType[EventType["HpChangedEventType"] = 4] = "HpChangedEventType";
    EventType[EventType["NpcMovementChangedEventType"] = 5] = "NpcMovementChangedEventType";
    EventType[EventType["NpcPlacedEventType"] = 6] = "NpcPlacedEventType";
    EventType[EventType["NpcStateChagedEventType"] = 7] = "NpcStateChagedEventType";
    EventType[EventType["PlayerMovementEventType"] = 8] = "PlayerMovementEventType";
    EventType[EventType["RowsFilledEventType"] = 9] = "RowsFilledEventType";
    EventType[EventType["StandeeMovementEndedEventType"] = 10] = "StandeeMovementEndedEventType";
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
exports.EventBus = EventBus;
exports.eventBus = new EventBus();
exports.deadEventBus = new EventBus(); // Used by AI.
},{}],9:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var HpChangedEvent = (function (_super) {
    __extends(HpChangedEvent, _super);
    function HpChangedEvent(hp, playerType) {
        _super.call(this);
        this.hp = hp;
        this.playerType = playerType;
    }
    HpChangedEvent.prototype.getType = function () {
        return event_bus_1.EventType.HpChangedEventType;
    };
    return HpChangedEvent;
}(event_bus_1.AbstractEvent));
exports.HpChangedEvent = HpChangedEvent;
},{"./event-bus":8}],10:[function(require,module,exports){
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
},{"./event-bus":8}],11:[function(require,module,exports){
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
},{"./event-bus":8}],12:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var PlayerMovementEvent = (function (_super) {
    __extends(PlayerMovementEvent, _super);
    function PlayerMovementEvent(movement, playerType) {
        _super.call(this);
        this.movement = movement;
        this.playerType = playerType;
    }
    PlayerMovementEvent.prototype.getType = function () {
        return event_bus_1.EventType.PlayerMovementEventType;
    };
    return PlayerMovementEvent;
}(event_bus_1.AbstractEvent));
exports.PlayerMovementEvent = PlayerMovementEvent;
},{"./event-bus":8}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var RowsFilledEvent = (function (_super) {
    __extends(RowsFilledEvent, _super);
    function RowsFilledEvent(totalFilled, playerType) {
        _super.call(this);
        this.totalFilled = totalFilled;
        this.playerType = playerType;
    }
    RowsFilledEvent.prototype.getType = function () {
        return event_bus_1.EventType.RowsFilledEventType;
    };
    return RowsFilledEvent;
}(event_bus_1.AbstractEvent));
exports.RowsFilledEvent = RowsFilledEvent;
},{"./event-bus":8}],14:[function(require,module,exports){
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
},{"./event-bus":8}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
},{"./controller/controller":1,"./game-state":15,"./model/model":21,"./preloader":24,"./view/view":34}],17:[function(require,module,exports){
"use strict";
var board_1 = require('../board/board');
var TIME_BETWEEN_MOVES = 250;
var TIME_MAX_DEVIATION = 100;
var Ai = (function () {
    function Ai(realBoard) {
        this.realBoard = realBoard;
        this.timeUntilNextMove = TIME_BETWEEN_MOVES;
        this.targetRotation = 0;
        this.currentRotation = 0;
        this.targetColIdx = 0;
        this.moveCompleted = false;
    }
    Ai.prototype.start = function () {
        //
    };
    Ai.prototype.step = function (elapsed) {
        this.timeUntilNextMove -= elapsed;
        if (this.timeUntilNextMove <= 0) {
            this.timeUntilNextMove = TIME_BETWEEN_MOVES;
            this.advanceTowardsTarget();
        }
    };
    /**
     * This method provides a high-level view of the AI's thought process.
     */
    Ai.prototype.strategize = function () {
        var zombie = this.realBoard.cloneZombie();
        // Iterate through all possible rotations and columns
        var bestFitness = Number.MIN_SAFE_INTEGER;
        var bestRotation = 0;
        var bestColIdx = 0;
        for (var rotation = 0; rotation < 4; rotation++) {
            while (zombie.moveShapeLeft())
                ;
            for (var idx = 0; idx < board_1.MAX_COLS; idx++) {
                zombie.moveShapeDownAllTheWay();
                zombie.convertShapeToCells();
                var fitness = this.calculateFitness(zombie);
                // console.log('fitness: ' + fitness + ', rotation: ' + rotation + ', col: ' + colIdx);
                if (fitness > bestFitness) {
                    bestFitness = fitness;
                    bestRotation = rotation;
                    bestColIdx = zombie.getCurrentShapeColIdx(); // Use this rather than idx in case it was off because of whatever reason (obstruction, wall, etc...)
                }
                zombie.undoConvertShapeToCells();
                zombie.moveToTop();
                var canMoveRight = zombie.moveShapeRight();
                if (canMoveRight === false) {
                    break;
                }
            }
            zombie.rotateShapeClockwise();
        }
        // console.log('bestFitness: %f, %d, %d', bestFitness, bestRotation, bestColIdx);
        // Finally, set the values that will let the AI advance towards the target.
        this.targetRotation = bestRotation;
        this.currentRotation = 0;
        this.targetColIdx = bestColIdx;
        this.moveCompleted = false;
    };
    /**
     * Based on https://codemyroad.wordpress.com/2013/04/14/tetris-ai-the-near-perfect-player/
     */
    Ai.prototype.calculateFitness = function (zombie) {
        var aggregateHeight = zombie.calculateAggregateHeight();
        var completeLines = zombie.calculateCompleteLines();
        var holes = zombie.calculateHoles();
        var bumpiness = zombie.calculateBumpiness();
        var fitness = (-0.510066 * aggregateHeight)
            + (0.760666 * completeLines)
            + (-0.35663 * holes)
            + (-0.184483 * bumpiness);
        return fitness;
    };
    Ai.prototype.advanceTowardsTarget = function () {
        if (this.moveCompleted === true) {
            return;
        }
        if (this.currentRotation === this.targetRotation && this.realBoard.getCurrentShapeColIdx() === this.targetColIdx) {
            // TODO: Drop shape should be on a timer or something.
            this.realBoard.moveShapeDownAllTheWay();
            this.currentRotation = 0;
            this.targetColIdx = 0;
            this.moveCompleted = true;
        }
        else {
            if (this.currentRotation < this.targetRotation) {
                this.realBoard.rotateShapeClockwise();
                this.currentRotation++;
            }
            if (this.realBoard.getCurrentShapeColIdx() < this.targetColIdx) {
                this.realBoard.moveShapeRight();
            }
            else if (this.realBoard.getCurrentShapeColIdx() > this.targetColIdx) {
                this.realBoard.moveShapeLeft();
            }
        }
    };
    // private performNewMovement() {
    // let matrix = this.visual.matrix;
    // let shape = this.visual.currentShape;
    // let rand = Math.floor(Math.random() * 5);
    // if (rand === 0) {
    //     eventBus.fire(new PlayerMovementEvent(PlayerMovement.RotateClockwise, PlayerType.Ai));
    // } else if (rand === 1) {
    //     eventBus.fire(new PlayerMovementEvent(PlayerMovement.Left, PlayerType.Ai));
    // } else if (rand === 2) {
    //     eventBus.fire(new PlayerMovementEvent(PlayerMovement.Right, PlayerType.Ai));
    // } else if (rand === 3) {
    //     eventBus.fire(new PlayerMovementEvent(PlayerMovement.Down, PlayerType.Ai));
    // } else if (rand === 4) {
    //     let dropChance = Math.floor(Math.random() * 100); // Is this called Monte-Carlo?
    //     if (dropChance < 10) {
    //         eventBus.fire(new PlayerMovementEvent(PlayerMovement.Drop, PlayerType.Ai));
    //     } else {
    //         // Do nothing this round; maybe considered a hesitation.
    //     }
    // } else {
    //     console.log('should not get here');
    // }
    // }
    Ai.prototype.calculateTimeUntilNextMove = function () {
        return Math.floor(TIME_BETWEEN_MOVES + ((Math.random() * TIME_MAX_DEVIATION) - (TIME_MAX_DEVIATION / 2)));
    };
    return Ai;
}());
exports.Ai = Ai;
},{"../board/board":18}],18:[function(require,module,exports){
"use strict";
var cell_1 = require('../../domain/cell');
var shape_factory_1 = require('./shape-factory');
var event_bus_1 = require('../../event/event-bus');
var cell_change_event_1 = require('../../event/cell-change-event');
var rows_filled_event_1 = require('../../event/rows-filled-event');
var active_shape_changed_event_1 = require('../../event/active-shape-changed-event');
var board_filled_event_1 = require('../../event/board-filled-event');
var MAX_ROWS = 19; // Top 2 rows are obstructed from view. Also, see lighting-grid.ts.
exports.MAX_COLS = 10;
var Board = (function () {
    function Board(playerType, shapeFactory, eventBus) {
        this.playerType = playerType;
        this.shapeFactory = shapeFactory;
        this.eventBus = eventBus;
        this.currentShape = null;
        this.matrix = [];
        for (var rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
            this.matrix[rowIdx] = [];
            for (var colIdx = 0; colIdx < exports.MAX_COLS; colIdx++) {
                this.matrix[rowIdx][colIdx] = new cell_1.Cell();
            }
        }
        this.shapeFactory = new shape_factory_1.ShapeFactory();
    }
    Board.prototype.start = function () {
        this.clear();
    };
    /**
     * This gives a high level view of the main game loop.
     * This shouldn't be called by the AI.
     */
    Board.prototype.step = function () {
        if (this.tryGravity()) {
            this.moveShapeDown();
        }
        else {
            this.convertShapeToCells();
            if (this.isBoardFull()) {
                this.signalFullBoard();
                this.resetBoard();
            }
            else {
                this.handleAnyFilledLines();
                this.startShape(false);
            }
        }
    };
    Board.prototype.resetBoard = function () {
        this.clear();
        this.startShape(true);
    };
    /**
     * Used by the AI.
     */
    Board.prototype.getCurrentShapeColIdx = function () {
        return this.currentShape.getCol();
    };
    Board.prototype.moveShapeLeft = function () {
        var success;
        this.currentShape.moveLeft();
        if (this.collisionDetected()) {
            this.currentShape.moveRight();
            success = false;
        }
        else {
            this.fireActiveShapeChangedEvent();
            success = true;
        }
        return success;
    };
    Board.prototype.moveShapeRight = function () {
        var success;
        this.currentShape.moveRight();
        if (this.collisionDetected()) {
            this.currentShape.moveLeft();
            success = false;
        }
        else {
            this.fireActiveShapeChangedEvent();
            success = true;
        }
        return success;
    };
    Board.prototype.moveShapeDown = function () {
        var success;
        this.currentShape.moveDown();
        if (this.collisionDetected()) {
            this.currentShape.moveUp();
            success = false;
        }
        else {
            this.fireActiveShapeChangedEvent();
            success = true;
        }
        return success;
    };
    Board.prototype.moveShapeDownAllTheWay = function () {
        do {
            this.currentShape.moveDown();
        } while (!this.collisionDetected());
        this.currentShape.moveUp();
        this.fireActiveShapeChangedEvent();
    };
    /**
     * Used by the AI.
     */
    Board.prototype.moveToTop = function () {
        this.currentShape.moveToTop();
    };
    Board.prototype.rotateShapeClockwise = function () {
        var success;
        this.currentShape.rotateClockwise();
        if (this.collisionDetected()) {
            this.currentShape.rotateCounterClockwise();
            success = false;
        }
        else {
            this.fireActiveShapeChangedEvent();
            success = true;
        }
        return success;
    };
    Board.prototype.addJunkRows = function (numberOfRowsToAdd) {
        // Clear rows at the top to make room at the bottom.
        this.matrix.splice(0, numberOfRowsToAdd);
        // Add junk rows at the bottom.
        for (var idx = 0; idx < numberOfRowsToAdd; idx++) {
            // Set the row to completely filled.
            var row = [];
            for (var colIdx = 0; colIdx < exports.MAX_COLS; colIdx++) {
                var cell_2 = new cell_1.Cell();
                cell_2.setColor(8 /* White */);
                row.push(cell_2);
            }
            // Punch one hole in a random cell between the end cells.
            var holeIdx = Math.floor(Math.random() * (row.length - 2)) + 1;
            var cell = row[holeIdx];
            cell.setColor(0 /* Empty */);
            this.matrix.push(row);
        }
        // Notify for all cells because entire board has changed.
        // TODO: Move to own method?
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                this.eventBus.fire(new cell_change_event_1.CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
            }
        }
    };
    // getMatrixWithCurrentShapeAdded(): boolean[][] {
    //     let copy = [];
    //     for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
    //         let row = this.matrix[rowIdx];
    //         let rowCopy = [];
    //         for (let colIdx = 0; colIdx < row.length; colIdx++) {
    //             rowCopy.push(row[colIdx].getColor() !== Color.Empty);
    //         }
    //         copy.push(rowCopy);
    //     }
    //     return copy;
    // }
    /**
     * Very hacky method just so the AI has a temp copy of the board to experiment with.
     */
    Board.prototype.cloneZombie = function () {
        var copy = new Board(this.playerType, shape_factory_1.deadShapeFactory, event_bus_1.deadEventBus);
        // Copy the current shape and the matrix. Shouldn't need anything else.
        copy.currentShape = this.currentShape.cloneSimple();
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                copy.matrix[rowIdx][colIdx].setColor(row[colIdx].getColor());
            }
        }
        return copy;
    };
    /**
     * Used by the AI.
     */
    Board.prototype.calculateAggregateHeight = function () {
        var colHeights = this.calculateColumnHeights();
        return colHeights.reduce(function (a, b) { return a + b; });
    };
    /**
     * Used by the AI.
     */
    Board.prototype.calculateCompleteLines = function () {
        var completeLines = 0;
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            var row = this.matrix[rowIdx];
            var count = 0;
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                if (row[colIdx].getColor() !== 0 /* Empty */) {
                    count++;
                }
            }
            if (count >= row.length) {
                completeLines++;
            }
        }
        return completeLines;
    };
    /**
     * Used by the AI.
     * Determines holes by scanning each column, highest floor to lowest floor, and
     * seeing how many times it switches from colored to empty (but not the other way around).
     */
    Board.prototype.calculateHoles = function () {
        var totalHoles = 0;
        for (var colIdx = 0; colIdx < exports.MAX_COLS; colIdx++) {
            var holes = 0;
            var previousCellWasEmpty = true;
            for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                if (previousCellWasEmpty === false) {
                    if (cell.getColor() === 0 /* Empty */) {
                        holes++;
                        previousCellWasEmpty = true;
                    }
                    else {
                        previousCellWasEmpty = false;
                    }
                }
                else {
                    if (cell.getColor() === 0 /* Empty */) {
                        previousCellWasEmpty = true;
                    }
                    else {
                        previousCellWasEmpty = false;
                    }
                }
            }
            totalHoles += holes;
        }
        return totalHoles;
    };
    /**
     * Used by the AI.
     */
    Board.prototype.calculateBumpiness = function () {
        var bumpiness = 0;
        var colHeights = this.calculateColumnHeights();
        for (var idx = 0; idx < colHeights.length - 2; idx++) {
            var val1 = colHeights[idx];
            var val2 = colHeights[idx + 1];
            bumpiness += Math.abs(val1 - val2);
        }
        return bumpiness;
    };
    Board.prototype.calculateColumnHeights = function () {
        var colHeights = [];
        for (var colIdx = 0; colIdx < exports.MAX_COLS; colIdx++) {
            colHeights.push(0);
        }
        for (var colIdx = 0; colIdx < exports.MAX_COLS; colIdx++) {
            var highest = 0;
            for (var rowIdx = MAX_ROWS - 1; rowIdx >= 0; rowIdx--) {
                var cell = this.matrix[rowIdx][colIdx];
                if (cell.getColor() !== 0 /* Empty */) {
                    highest = MAX_ROWS - rowIdx;
                }
            }
            colHeights[colIdx] = highest;
        }
        return colHeights;
    };
    /**
     * The only reason this is not private is so the AI can experiment with it.
     * Work here should able to be be undone by undoConvertShapeToCells.
     */
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
    /**
     * Used by the AI. Should undo convertShapeToCells().
     */
    Board.prototype.undoConvertShapeToCells = function () {
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
            this.changeCellColor(rowIdx, colIdx, 0 /* Empty */);
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
    /**
     * Helper method to change a single cell color's and notify subscribers at the same time.
     */
    Board.prototype.changeCellColor = function (rowIdx, colIdx, color) {
        // TODO: Maybe bounds check here.
        var cell = this.matrix[rowIdx][colIdx];
        cell.setColor(color);
        this.eventBus.fire(new cell_change_event_1.CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
    };
    Board.prototype.startShape = function (forceBagRefill) {
        this.currentShape = this.shapeFactory.nextShape(forceBagRefill);
        this.fireActiveShapeChangedEvent(true);
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
    /**
     * It is considered full if the two obscured rows at the top have colored cells in them.
     */
    Board.prototype.isBoardFull = function () {
        for (var rowIdx = 0; rowIdx < 2; rowIdx++) {
            for (var colIdx = 0; colIdx < exports.MAX_COLS; colIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                if (cell.getColor() !== 0 /* Empty */) {
                    return true;
                }
            }
        }
        return false;
    };
    Board.prototype.signalFullBoard = function () {
        this.eventBus.fire(new board_filled_event_1.BoardFilledEvent(this.playerType));
    };
    Board.prototype.handleAnyFilledLines = function () {
        var highestLineFilled = 0; // "highest" as in the highest in the array, which is the lowest visually to the player.
        // Traverse backwards to prevent row index from becoming out of sync when removing rows.
        var totalFilled = 0;
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
                totalFilled++;
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
                this.eventBus.fire(new cell_change_event_1.CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
            }
        }
        if (totalFilled > 0) {
            this.eventBus.fire(new rows_filled_event_1.RowsFilledEvent(totalFilled, this.playerType));
        }
    };
    /**
     * This removes the old row and puts a new row in its place at position 0, which is the highest visually to the player.
     * Delegates cell notification to the calling method.
     */
    Board.prototype.removeAndCollapse = function (rowIdx) {
        this.matrix.splice(rowIdx, 1);
        this.matrix.splice(0, 0, []);
        for (var colIdx = 0; colIdx < exports.MAX_COLS; colIdx++) {
            this.matrix[0][colIdx] = new cell_1.Cell();
        }
    };
    Board.prototype.fireActiveShapeChangedEvent = function (starting) {
        if (starting === void 0) { starting = false; }
        this.eventBus.fire(new active_shape_changed_event_1.ActiveShapeChangedEvent(this.currentShape, this.playerType, starting));
    };
    return Board;
}());
exports.Board = Board;
},{"../../domain/cell":3,"../../event/active-shape-changed-event":5,"../../event/board-filled-event":6,"../../event/cell-change-event":7,"../../event/event-bus":8,"../../event/rows-filled-event":13,"./shape-factory":19}],19:[function(require,module,exports){
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
    ShapeI.prototype.getInstance = function () {
        return new ShapeI();
    };
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
    ShapeJ.prototype.getInstance = function () {
        return new ShapeJ();
    };
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
    ShapeL.prototype.getInstance = function () {
        return new ShapeL();
    };
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
    ShapeO.prototype.getInstance = function () {
        return new ShapeO();
    };
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
    ShapeS.prototype.getInstance = function () {
        return new ShapeS();
    };
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
    ShapeT.prototype.getInstance = function () {
        return new ShapeT();
    };
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
    ShapeZ.prototype.getInstance = function () {
        return new ShapeZ();
    };
    return ShapeZ;
}(shape_1.Shape));
var ShapeFactory = (function () {
    function ShapeFactory() {
        this.refillBag(true);
    }
    ShapeFactory.prototype.nextShape = function (forceBagRefill) {
        if (this.bag.length <= 0 || forceBagRefill === true) {
            this.refillBag(forceBagRefill);
        }
        return this.bag.pop();
    };
    ShapeFactory.prototype.refillBag = function (startingPiecesOnly) {
        this.bag = [
            new ShapeI(),
            new ShapeJ(),
            new ShapeL(),
            new ShapeT(),
        ];
        if (startingPiecesOnly === false) {
            this.bag.push(new ShapeO(), new ShapeS(), new ShapeZ());
        }
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
exports.ShapeFactory = ShapeFactory;
exports.deadShapeFactory = new ShapeFactory(); // Used by AI.
},{"./shape":20}],20:[function(require,module,exports){
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
    /**
     * Used by the AI.
     */
    Shape.prototype.moveToTop = function () {
        this.row = 0;
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
    /**
     * Hacky method used by the AI.
     * "Simple" as in doesn't matter what the current row/col/matrix is.
     */
    Shape.prototype.cloneSimple = function () {
        // Get an instance of the concrete class. Rest of values are irrelevant.
        return this.getInstance();
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
},{"../../domain/cell":3}],21:[function(require,module,exports){
"use strict";
var board_1 = require('./board/board');
var ai_1 = require('./ai/ai');
var npc_manager_1 = require('./npc/npc-manager');
var event_bus_1 = require('../event/event-bus');
var player_movement_1 = require('../domain/player-movement');
var hp_changed_event_1 = require('../event/hp-changed-event');
var shape_factory_1 = require('./board/shape-factory');
var MAX_HP = board_1.MAX_COLS; // HP corresponds to the number of long windows on the second floor of the physical building.
var TEMP_DELAY_MS = 500;
var Model = (function () {
    function Model() {
        var humanShapeFactory = new shape_factory_1.ShapeFactory();
        this.humanBoard = new board_1.Board(0 /* Human */, humanShapeFactory, event_bus_1.eventBus);
        this.humanHitPoints = MAX_HP;
        var aiShapeFactory = new shape_factory_1.ShapeFactory();
        this.aiBoard = new board_1.Board(1 /* Ai */, aiShapeFactory, event_bus_1.eventBus);
        this.aiHitPoints = MAX_HP;
        this.ai = new ai_1.Ai(this.aiBoard);
        this.msTillGravityTick = TEMP_DELAY_MS;
    }
    Model.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.PlayerMovementEventType, function (event) {
            _this.handlePlayerMovement(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.RowsFilledEventType, function (event) {
            _this.handleRowsFilledEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.BoardFilledEventType, function (event) {
            _this.handleBoardFilledEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.ActiveShapeChangedEventType, function (event) {
            _this.handleActiveShapeChangedEvent(event);
        });
        this.humanBoard.start();
        this.aiBoard.start();
        this.ai.start();
        npc_manager_1.npcManager.start();
        // TODO: Instead, start game when player hits a key first.
        this.humanBoard.resetBoard();
        this.aiBoard.resetBoard();
    };
    Model.prototype.step = function (elapsed) {
        this.stepBoards(elapsed);
        this.ai.step(elapsed);
        npc_manager_1.npcManager.step(elapsed);
    };
    Model.prototype.stepBoards = function (elapsed) {
        this.msTillGravityTick -= elapsed;
        if (this.msTillGravityTick <= 0) {
            this.msTillGravityTick = TEMP_DELAY_MS;
            this.humanBoard.step();
            this.aiBoard.step();
        }
    };
    Model.prototype.handlePlayerMovement = function (event) {
        var board = this.determineBoardFor(event.playerType);
        switch (event.movement) {
            case player_movement_1.PlayerMovement.Left:
                board.moveShapeLeft();
                break;
            case player_movement_1.PlayerMovement.Right:
                board.moveShapeRight();
                break;
            case player_movement_1.PlayerMovement.Down:
                board.moveShapeDown();
                break;
            case player_movement_1.PlayerMovement.Drop:
                board.moveShapeDownAllTheWay();
                board.step(); // prevent any other keystrokes till next tick
                break;
            case player_movement_1.PlayerMovement.RotateClockwise:
                board.rotateShapeClockwise();
                break;
            default:
                console.log('unhandled movement');
                break;
        }
    };
    /**
     * Transfer the filled rows to be junk rows on the opposite player's board.
     */
    Model.prototype.handleRowsFilledEvent = function (event) {
        var board = this.determineBoardForOppositeOf(event.playerType);
        board.addJunkRows(event.totalFilled);
    };
    /**
     * Returns the human's board if given the human's type, or AI's board if given the AI.
     */
    Model.prototype.determineBoardFor = function (playerType) {
        if (playerType === 0 /* Human */) {
            return this.humanBoard;
        }
        else {
            return this.aiBoard;
        }
    };
    /**
     * If this method is given "Human", it will return the AI's board, and vice versa.
     */
    Model.prototype.determineBoardForOppositeOf = function (playerType) {
        if (playerType === 0 /* Human */) {
            return this.aiBoard;
        }
        else {
            return this.humanBoard;
        }
    };
    Model.prototype.handleBoardFilledEvent = function (event) {
        var hp;
        if (event.playerType === 0 /* Human */) {
            hp = (this.humanHitPoints -= 1);
        }
        else {
            hp = (this.aiHitPoints -= 1);
        }
        event_bus_1.eventBus.fire(new hp_changed_event_1.HpChangedEvent(hp, event.playerType));
        // TODO: See if one of the players has run out of HP.
    };
    Model.prototype.handleActiveShapeChangedEvent = function (event) {
        if (event.starting === true && event.playerType === 1 /* Ai */) {
            this.ai.strategize();
        }
        else {
        }
    };
    return Model;
}());
exports.model = new Model();
},{"../domain/player-movement":4,"../event/event-bus":8,"../event/hp-changed-event":9,"./ai/ai":17,"./board/board":18,"./board/shape-factory":19,"./npc/npc-manager":22}],22:[function(require,module,exports){
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
},{"../../event/event-bus":8,"./npc":23}],23:[function(require,module,exports){
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
},{"../../event/event-bus":8,"../../event/npc-movement-changed-event":10,"../../event/npc-placed-event":11}],24:[function(require,module,exports){
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
},{"./view/standee/standee-animation-texture-base":30}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
"use strict";
var lighting_grid_1 = require('./lighting-grid');
var HpPanels = (function () {
    function HpPanels() {
        this.group = new THREE.Object3D();
        this.panels = [];
        for (var idx = 0; idx < lighting_grid_1.PANEL_COUNT_PER_FLOOR; idx++) {
            var geometry = new THREE.PlaneGeometry(0.6, 0.6);
            var material = new THREE.MeshPhongMaterial();
            var panel = new THREE.Mesh(geometry, material);
            var x = idx;
            var y = 0;
            var z = 0;
            panel.position.set(x, y, z);
            panel.visible = false;
            // TODO: Make this pulse at all?
            panel.material.emissive.setHex(0xffffff);
            panel.material.emissiveIntensity = 0.25;
            this.panels.push(panel);
        }
    }
    HpPanels.prototype.start = function (hpOrientation) {
        this.hpOrientation = hpOrientation;
        for (var _i = 0, _a = this.panels; _i < _a.length; _i++) {
            var panel = _a[_i];
            this.group.add(panel);
        }
        // Transform to fit against building.
        this.group.position.set(1.85, 3.55, -1.5);
        this.group.scale.set(0.7, 1.9, 1);
        this.updateHp(lighting_grid_1.PANEL_COUNT_PER_FLOOR);
    };
    HpPanels.prototype.step = function (elapsed) {
        //
    };
    /**
     * HP bar can go from right-to-left or left-to-right, like a fighting game HP bar.
     */
    HpPanels.prototype.updateHp = function (hp) {
        if (hp > lighting_grid_1.PANEL_COUNT_PER_FLOOR) {
            hp = lighting_grid_1.PANEL_COUNT_PER_FLOOR;
        }
        for (var idx = 0; idx < this.panels.length; idx++) {
            var panel = this.panels[idx];
            if (this.hpOrientation === 0 /* DecreasesRightToLeft */) {
                if (idx < hp) {
                    panel.visible = true;
                }
                else {
                    panel.visible = false;
                }
            }
            else {
                if (idx >= lighting_grid_1.PANEL_COUNT_PER_FLOOR - hp) {
                    panel.visible = true;
                }
                else {
                    panel.visible = false;
                }
            }
        }
        // TODO: Handle update to HP = full as different from HP < full.
    };
    return HpPanels;
}());
exports.HpPanels = HpPanels;
},{"./lighting-grid":28}],28:[function(require,module,exports){
"use strict";
var building_1 = require('./building');
var hp_panels_1 = require('./hp-panels');
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
        this.hpPanels = new hp_panels_1.HpPanels();
        this.panels = [];
        for (var floorIdx = 0; floorIdx < exports.FLOOR_COUNT; floorIdx++) {
            this.panels[floorIdx] = [];
            for (var panelIdx = 0; panelIdx < exports.PANEL_COUNT_PER_FLOOR; panelIdx++) {
                var geometry = new THREE.BoxGeometry(0.6, 0.6, 0.1); // TODO: clone() ?
                var material = new THREE.MeshPhongMaterial();
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
    LightingGrid.prototype.start = function (hpOrientation) {
        this.group.add(this.building.group);
        this.group.add(this.hpPanels.group);
        this.group.add(this.panelGroup);
        this.building.start();
        this.hpPanels.start(hpOrientation);
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
        this.emissiveIntensity.value = 0.25;
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
        this.hpPanels.step(elapsed);
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
        // Do not light if higher than the highest *visible* floor.
        if (floorIdx >= exports.FLOOR_COUNT) {
            pointLight.visible = false;
        }
        else {
            pointLight.visible = true;
        }
        var x = panelIdx;
        var y = floorIdx + 1; // Offset up 1 because ground is y = 0.
        var z = 0.33;
        pointLight.position.set(x, y, z);
    };
    LightingGrid.prototype.updateHp = function (hp) {
        this.hpPanels.updateHp(hp);
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
},{"./building":26,"./hp-panels":27}],29:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var lighting_grid_1 = require('./lighting-grid');
var Switchboard = (function () {
    function Switchboard(lightingGrid, playerType) {
        this.lightingGrid = lightingGrid;
        this.playerType = playerType;
    }
    Switchboard.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.ActiveShapeChangedEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.handleActiveShapeChangedEvent(event);
            }
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.CellChangeEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.handleCellChangeEvent(event);
            }
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.HpChangedEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.handleHpChangedEvent(event);
            }
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
            var offsetPanelIdx = panelIdx + offset.x;
            this.lightingGrid.sendActiveShapeLightTo(offsetFloorIdx, offsetPanelIdx, color);
        }
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
    Switchboard.prototype.handleHpChangedEvent = function (event) {
        this.lightingGrid.updateHp(event.hp);
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
},{"../../event/event-bus":8,"./lighting-grid":28}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
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
},{"../../event/event-bus":8,"./standee":33}],32:[function(require,module,exports){
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
        var material = new THREE.SpriteMaterial({ map: this.textureWrapper.texture });
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
        this.adjustLighting(elapsed);
        this.stepAnimation(elapsed);
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
    StandeeSpriteWrapper.prototype.adjustLighting = function (elapsed) {
        // TODO: Not yet sure if I'll need to use the elapsed variable here.
        this.sprite.material.color.set(0xaaaaaa);
    };
    StandeeSpriteWrapper.prototype.stepAnimation = function (elapsed) {
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
},{"./standee-animation-texture-base":30}],33:[function(require,module,exports){
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
},{"../../event/event-bus":8,"../../event/standee-movement-ended-event":14,"../camera-wrapper":25,"./standee-sprite-wrapper":32}],34:[function(require,module,exports){
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
        this.humanGrid = new lighting_grid_1.LightingGrid();
        this.humanSwitchboard = new switchboard_1.Switchboard(this.humanGrid, 0 /* Human */);
        this.aiGrid = new lighting_grid_1.LightingGrid();
        this.aiSwitchboard = new switchboard_1.Switchboard(this.aiGrid, 1 /* Ai */);
    }
    View.prototype.start = function () {
        this.humanGrid.start(0 /* DecreasesRightToLeft */);
        this.humanSwitchboard.start();
        this.aiGrid.start(1 /* DecreasesLeftToRight */);
        this.aiSwitchboard.start();
        this.doStart();
        world_1.world.start();
        standee_manager_1.standeeManager.start();
        // The canvas should have been hidden until setup is complete.
        this.canvas.style.display = 'inline';
    };
    View.prototype.step = function (elapsed) {
        world_1.world.step(elapsed);
        this.humanSwitchboard.step(elapsed);
        this.humanGrid.step(elapsed);
        this.aiGrid.step(elapsed);
        this.humanSwitchboard.step(elapsed);
        standee_manager_1.standeeManager.step(elapsed);
        this.renderer.render(this.scene, camera_wrapper_1.cameraWrapper.camera);
    };
    View.prototype.doStart = function () {
        var _this = this;
        this.scene.add(world_1.world.group);
        this.scene.add(standee_manager_1.standeeManager.group);
        this.scene.add(this.humanGrid.group);
        this.scene.add(this.aiGrid.group);
        this.aiGrid.group.position.setX(11);
        this.aiGrid.group.position.setZ(1);
        this.aiGrid.group.rotation.y = -Math.PI / 4;
        // TODO: Temporary for debugging?
        // this.scene.add(new THREE.AmbientLight(0x404040));
        // TODO: Temporary
        var spotLight = new THREE.SpotLight(0xbbbbff);
        spotLight.position.set(-3, 0.75, 15);
        spotLight.target = this.aiGrid.group;
        this.scene.add(spotLight);
        camera_wrapper_1.cameraWrapper.setPosition(-3, 0.75, 15); // More or less eye-level with the NPCs.
        camera_wrapper_1.cameraWrapper.lookAt(new THREE.Vector3(5, 8, 2));
        camera_wrapper_1.cameraWrapper.updateRendererSize(this.renderer);
        window.addEventListener('resize', function () {
            camera_wrapper_1.cameraWrapper.updateRendererSize(_this.renderer);
        });
    };
    return View;
}());
exports.view = new View();
},{"./camera-wrapper":25,"./lighting/lighting-grid":28,"./lighting/switchboard":29,"./standee/standee-manager":31,"./world/world":37}],35:[function(require,module,exports){
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
},{}],36:[function(require,module,exports){
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
},{}],37:[function(require,module,exports){
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
},{"./ground":35,"./sky":36}]},{},[16])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2NvbnRyb2xsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2lucHV0LnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL2NlbGwudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vcGxheWVyLW1vdmVtZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ib2FyZC1maWxsZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9jZWxsLWNoYW5nZS1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2V2ZW50LWJ1cy50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9yb3dzLWZpbGxlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9nYW1lLXN0YXRlLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyIsInNyYy9zY3JpcHRzL21vZGVsL2FpL2FpLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvYm9hcmQudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ib2FyZC9zaGFwZS1mYWN0b3J5LnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvc2hhcGUudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9tb2RlbC50cyIsInNyYy9zY3JpcHRzL21vZGVsL25wYy9ucGMtbWFuYWdlci50cyIsInNyYy9zY3JpcHRzL21vZGVsL25wYy9ucGMudHMiLCJzcmMvc2NyaXB0cy9wcmVsb2FkZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L2NhbWVyYS13cmFwcGVyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9idWlsZGluZy50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvaHAtcGFuZWxzLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9saWdodGluZy1ncmlkLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9zd2l0Y2hib2FyZC50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1tYW5hZ2VyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUtc3ByaXRlLXdyYXBwZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS50cyIsInNyYy9zY3JpcHRzL3ZpZXcvdmlldy50cyIsInNyYy9zY3JpcHRzL3ZpZXcvd29ybGQvZ3JvdW5kLnRzIiwic3JjL3NjcmlwdHMvdmlldy93b3JsZC9za3kudHMiLCJzcmMvc2NyaXB0cy92aWV3L3dvcmxkL3dvcmxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLHNCQUF5QixTQUFTLENBQUMsQ0FBQTtBQUNuQywwQkFBdUIsb0JBQW9CLENBQUMsQ0FBQTtBQUM1QyxnQ0FBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUV6RCxzQ0FBa0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUVuRSw2SEFBNkg7QUFFN0g7SUFBQTtJQTJCQSxDQUFDO0lBekJHLDBCQUFLLEdBQUw7UUFDSSxhQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELHlCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLEVBQUUsQ0FBQyxDQUFDLGFBQUssQ0FBQyxrQkFBa0IsQ0FBQyxVQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQ0FBbUIsQ0FBQyxnQ0FBYyxDQUFDLGVBQWUsRUFBRSxhQUFnQixDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsYUFBSyxDQUFDLGtCQUFrQixDQUFDLFlBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxvQkFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLDJDQUFtQixDQUFDLGdDQUFjLENBQUMsSUFBSSxFQUFFLGFBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxhQUFLLENBQUMsa0JBQWtCLENBQUMsYUFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLG9CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksMkNBQW1CLENBQUMsZ0NBQWMsQ0FBQyxLQUFLLEVBQUUsYUFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLGFBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQ0FBbUIsQ0FBQyxnQ0FBYyxDQUFDLElBQUksRUFBRSxhQUFnQixDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsYUFBSyxDQUFDLGtCQUFrQixDQUFDLGFBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxvQkFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLDJDQUFtQixDQUFDLGdDQUFjLENBQUMsSUFBSSxFQUFFLGFBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7SUFDTCxDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQTNCQSxBQTJCQyxJQUFBO0FBQ1ksa0JBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOztBQ3BDM0MseUVBQXlFOztBQWtCekU7SUFHSTtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQWEsQ0FBQztJQUN6QyxDQUFDO0lBRUQscUJBQUssR0FBTDtRQUFBLGlCQU9DO1FBTkcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFDLEtBQUs7WUFDckMsS0FBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsWUFBVSxDQUFDLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSztZQUNuQyxLQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxVQUFRLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7T0FFRztJQUNILHNCQUFNLEdBQU4sVUFBTyxHQUFRO1FBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFlBQVUsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxrQ0FBa0IsR0FBbEIsVUFBbUIsR0FBUTtRQUN2QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsZ0JBQWMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLG9EQUFvRDtRQUN0RSxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsd0NBQXdCLEdBQXhCO1FBQUEsaUJBU0M7UUFSRyxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFZLEVBQUUsR0FBUTtZQUN6QyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssWUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDdkIsS0FBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLGdCQUFjLENBQUMsQ0FBQztnQkFDdkMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN0QixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFFTyw0QkFBWSxHQUFwQixVQUFxQixLQUFvQixFQUFFLEtBQVk7UUFDbkQsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFFcEIsa0VBQWtFO1lBQ2xFLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTTtZQUNmLEtBQUssRUFBRTtnQkFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0IsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN2QixLQUFLLENBQUM7WUFDVixLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU07WUFDZixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzdCLDhFQUE4RTtnQkFDOUUsS0FBSyxDQUFDO1lBQ1YsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNO1lBQ2YsS0FBSyxFQUFFO2dCQUNILElBQUksQ0FBQyxRQUFRLENBQUMsYUFBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNoQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQztZQUNWLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTTtZQUNmLEtBQUssRUFBRTtnQkFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0IsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN2QixLQUFLLENBQUM7WUFDVixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdkIsS0FBSyxDQUFDO1lBRVYsa0VBQWtFO1lBQ2xFLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTTtZQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTTtZQUNmLEtBQUssRUFBRTtnQkFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDaEMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN2QixLQUFLLENBQUM7WUFFVix5Q0FBeUM7WUFFekMsa0VBQWtFO1lBQ2xFLEtBQUssRUFBRSxDQUFDLENBQUksTUFBTTtZQUNsQixLQUFLLEVBQUUsQ0FBQyxDQUFJLE1BQU07WUFDbEIsS0FBSyxHQUFHLENBQUMsQ0FBRywwQkFBMEI7WUFDdEMsS0FBSyxFQUFFLENBQUMsQ0FBSSx3QkFBd0I7WUFDcEMsS0FBSyxFQUFFLENBQUMsQ0FBSSxzQ0FBc0M7WUFDbEQsS0FBSyxFQUFFLENBQUMsQ0FBSSx1Q0FBdUM7WUFDbkQsS0FBSyxFQUFFLENBQUMsQ0FBSSw2QkFBNkI7WUFDekMsS0FBSyxFQUFFLENBQUMsQ0FBSSxnQ0FBZ0M7WUFDNUMsS0FBSyxHQUFHLENBQUMsQ0FBRyxnQkFBZ0I7WUFDNUIsS0FBSyxHQUFHO2dCQUNKLEtBQUssQ0FBQztZQUVWLGtFQUFrRTtZQUNsRSxLQUFLLEdBQUcsQ0FBQyxDQUFHLDRCQUE0QjtZQUN4QyxLQUFLLENBQUMsQ0FBQyxDQUFLLHVCQUF1QjtZQUNuQyxLQUFLLEVBQUU7Z0JBQ0gsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN2QixLQUFLLENBQUM7WUFFVixrRUFBa0U7WUFDbEU7Z0JBQ0ksSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLEtBQUssQ0FBQztRQUNkLENBQUM7SUFDTCxDQUFDO0lBRU8sd0JBQVEsR0FBaEIsVUFBaUIsR0FBUSxFQUFFLEtBQVk7UUFDbkMsa0JBQWtCO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxVQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVsQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxZQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLGdCQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbEMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0wsWUFBQztBQUFELENBOUhBLEFBOEhDLElBQUE7QUFFWSxhQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7O0FDaEpqQztJQUdJO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxhQUFXLENBQUM7SUFDN0IsQ0FBQztJQUVELHVCQUFRLEdBQVIsVUFBUyxLQUFZO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCx1QkFBUSxHQUFSO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUNMLFdBQUM7QUFBRCxDQWRBLEFBY0MsSUFBQTtBQWRZLFlBQUksT0FjaEIsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFJSSxvQkFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FSQSxBQVFDLElBQUE7QUFSWSxrQkFBVSxhQVF0QixDQUFBOzs7QUM3QkQsV0FBWSxjQUFjO0lBQ3RCLG1EQUFJLENBQUE7SUFDSixtREFBSSxDQUFBO0lBQ0oscURBQUssQ0FBQTtJQUNMLG1EQUFJLENBQUE7SUFDSixtREFBSSxDQUFBO0lBQ0oseUVBQWUsQ0FBQTtJQUNmLHVGQUFzQixDQUFBO0FBQzFCLENBQUMsRUFSVyxzQkFBYyxLQUFkLHNCQUFjLFFBUXpCO0FBUkQsSUFBWSxjQUFjLEdBQWQsc0JBUVgsQ0FBQTs7Ozs7Ozs7QUNSRCwwQkFBdUMsYUFBYSxDQUFDLENBQUE7QUFJckQ7SUFBNkMsMkNBQWE7SUFNdEQsaUNBQVksS0FBWSxFQUFFLFVBQXNCLEVBQUUsUUFBaUI7UUFDL0QsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFFRCx5Q0FBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsMkJBQTJCLENBQUM7SUFDakQsQ0FBQztJQUNMLDhCQUFDO0FBQUQsQ0FoQkEsQUFnQkMsQ0FoQjRDLHlCQUFhLEdBZ0J6RDtBQWhCWSwrQkFBdUIsMEJBZ0JuQyxDQUFBOzs7Ozs7OztBQ3BCRCwwQkFBdUMsYUFBYSxDQUFDLENBQUE7QUFHckQ7SUFBc0Msb0NBQWE7SUFJL0MsMEJBQVksVUFBc0I7UUFDOUIsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxrQ0FBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsb0JBQW9CLENBQUM7SUFDMUMsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0FaQSxBQVlDLENBWnFDLHlCQUFhLEdBWWxEO0FBWlksd0JBQWdCLG1CQVk1QixDQUFBOzs7Ozs7OztBQ2ZELDBCQUF1QyxhQUFhLENBQUMsQ0FBQTtBQUtyRDtJQUFxQyxtQ0FBYTtJQU05Qyx5QkFBWSxJQUFVLEVBQUUsR0FBVyxFQUFFLEdBQVcsRUFBRSxVQUFzQjtRQUNwRSxpQkFBTyxDQUFDO1FBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxpQ0FBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsbUJBQW1CLENBQUM7SUFDekMsQ0FBQztJQUNMLHNCQUFDO0FBQUQsQ0FqQkEsQUFpQkMsQ0FqQm9DLHlCQUFhLEdBaUJqRDtBQWpCWSx1QkFBZSxrQkFpQjNCLENBQUE7OztBQ3RCRCxXQUFZLFNBQVM7SUFDakIsdUZBQTJCLENBQUE7SUFDM0IsbUZBQXlCLENBQUE7SUFDekIseUVBQW9CLENBQUE7SUFDcEIsdUVBQW1CLENBQUE7SUFDbkIscUVBQWtCLENBQUE7SUFDbEIsdUZBQTJCLENBQUE7SUFDM0IscUVBQWtCLENBQUE7SUFDbEIsK0VBQXVCLENBQUE7SUFDdkIsK0VBQXVCLENBQUE7SUFDdkIsdUVBQW1CLENBQUE7SUFDbkIsNEZBQTZCLENBQUE7QUFDakMsQ0FBQyxFQVpXLGlCQUFTLEtBQVQsaUJBQVMsUUFZcEI7QUFaRCxJQUFZLFNBQVMsR0FBVCxpQkFZWCxDQUFBO0FBRUQ7SUFBQTtJQUVBLENBQUM7SUFBRCxvQkFBQztBQUFELENBRkEsQUFFQyxJQUFBO0FBRnFCLHFCQUFhLGdCQUVsQyxDQUFBO0FBTUQ7SUFJSTtRQUNJLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQTRDLENBQUM7SUFDOUUsQ0FBQztJQUVELDJCQUFRLEdBQVIsVUFBUyxJQUFjLEVBQUUsT0FBbUM7UUFDeEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRVosQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUVmLENBQUM7UUFFRCxJQUFJLFFBQVEsR0FBaUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0UsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekIsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2Qix1RUFBdUU7SUFDM0UsQ0FBQztJQUVELDJFQUEyRTtJQUUzRSxpQ0FBaUM7SUFDakMsdUJBQUksR0FBSixVQUFLLEtBQW1CO1FBQ3BCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLEdBQUcsQ0FBQyxDQUFnQixVQUFRLEVBQVIscUJBQVEsRUFBUixzQkFBUSxFQUFSLElBQVEsQ0FBQztnQkFBeEIsSUFBSSxPQUFPLGlCQUFBO2dCQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsQjtRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0wsZUFBQztBQUFELENBdENBLEFBc0NDLElBQUE7QUF0Q1ksZ0JBQVEsV0FzQ3BCLENBQUE7QUFDWSxnQkFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7QUFDMUIsb0JBQVksR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUMsY0FBYzs7Ozs7Ozs7QUM5RDFELDBCQUF1QyxhQUFhLENBQUMsQ0FBQTtBQUdyRDtJQUFvQyxrQ0FBYTtJQUs3Qyx3QkFBWSxFQUFVLEVBQUUsVUFBc0I7UUFDMUMsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUVELGdDQUFPLEdBQVA7UUFDSSxNQUFNLENBQUMscUJBQVMsQ0FBQyxrQkFBa0IsQ0FBQztJQUN4QyxDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQWRBLEFBY0MsQ0FkbUMseUJBQWEsR0FjaEQ7QUFkWSxzQkFBYyxpQkFjMUIsQ0FBQTs7Ozs7Ozs7QUNqQkQsMEJBQXVDLGFBQWEsQ0FBQyxDQUFBO0FBRXJEO0lBQTZDLDJDQUFhO0lBTXRELGlDQUFZLEtBQWEsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUMzQyxpQkFBTyxDQUFDO1FBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRCx5Q0FBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsMkJBQTJCLENBQUM7SUFDakQsQ0FBQztJQUNMLDhCQUFDO0FBQUQsQ0FoQkEsQUFnQkMsQ0FoQjRDLHlCQUFhLEdBZ0J6RDtBQWhCWSwrQkFBdUIsMEJBZ0JuQyxDQUFBOzs7Ozs7OztBQ2xCRCwwQkFBdUMsYUFBYSxDQUFDLENBQUE7QUFHckQ7SUFBb0Msa0NBQWE7SUFPN0Msd0JBQVksS0FBYSxFQUFFLEtBQWUsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUM1RCxpQkFBTyxDQUFDO1FBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRCxnQ0FBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsa0JBQWtCLENBQUM7SUFDeEMsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FsQkEsQUFrQkMsQ0FsQm1DLHlCQUFhLEdBa0JoRDtBQWxCWSxzQkFBYyxpQkFrQjFCLENBQUE7Ozs7Ozs7O0FDckJELDBCQUF1QyxhQUFhLENBQUMsQ0FBQTtBQUlyRDtJQUF5Qyx1Q0FBYTtJQUtsRCw2QkFBWSxRQUF3QixFQUFFLFVBQXNCO1FBQ3hELGlCQUFPLENBQUM7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUNqQyxDQUFDO0lBRUQscUNBQU8sR0FBUDtRQUNJLE1BQU0sQ0FBQyxxQkFBUyxDQUFDLHVCQUF1QixDQUFDO0lBQzdDLENBQUM7SUFDTCwwQkFBQztBQUFELENBZEEsQUFjQyxDQWR3Qyx5QkFBYSxHQWNyRDtBQWRZLDJCQUFtQixzQkFjL0IsQ0FBQTs7Ozs7Ozs7QUNsQkQsMEJBQXVDLGFBQWEsQ0FBQyxDQUFBO0FBR3JEO0lBQXFDLG1DQUFhO0lBSzlDLHlCQUFZLFdBQW1CLEVBQUUsVUFBc0I7UUFDbkQsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxpQ0FBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsbUJBQW1CLENBQUM7SUFDekMsQ0FBQztJQUNMLHNCQUFDO0FBQUQsQ0FkQSxBQWNDLENBZG9DLHlCQUFhLEdBY2pEO0FBZFksdUJBQWUsa0JBYzNCLENBQUE7Ozs7Ozs7O0FDakJELDBCQUF1QyxhQUFhLENBQUMsQ0FBQTtBQUVyRDtJQUErQyw2Q0FBYTtJQU14RCxtQ0FBWSxLQUFhLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDM0MsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDO0lBRUQsMkNBQU8sR0FBUDtRQUNJLE1BQU0sQ0FBQyxxQkFBUyxDQUFDLDZCQUE2QixDQUFDO0lBQ25ELENBQUM7SUFDTCxnQ0FBQztBQUFELENBaEJBLEFBZ0JDLENBaEI4Qyx5QkFBYSxHQWdCM0Q7QUFoQlksaUNBQXlCLDRCQWdCckMsQ0FBQTs7O0FDU0Q7SUFHSTtRQUNJLElBQUksQ0FBQyxPQUFPLEdBQUcsb0JBQTBCLENBQUMsQ0FBQyxpQkFBaUI7SUFDaEUsQ0FBQztJQUVELDhCQUFVLEdBQVY7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQsOEJBQVUsR0FBVixVQUFXLE9BQXNCO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFDTCxnQkFBQztBQUFELENBZEEsQUFjQyxJQUFBO0FBQ1ksaUJBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDOzs7QUMxQ3pDLDBCQUF3QixhQUFhLENBQUMsQ0FBQTtBQUN0QyxzQkFBb0IsZUFBZSxDQUFDLENBQUE7QUFDcEMscUJBQW1CLGFBQWEsQ0FBQyxDQUFBO0FBQ2pDLDJCQUF5Qix5QkFBeUIsQ0FBQyxDQUFBO0FBQ25ELDJCQUF1QyxjQUFjLENBQUMsQ0FBQTtBQUV0RCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsVUFBQyxLQUFVO0lBQ3JELHNCQUFTLENBQUMsVUFBVSxDQUFDLG9CQUEwQixDQUFDLENBQUM7SUFDakQscUJBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsQ0FBQyxDQUFDLENBQUM7QUFFSDtJQUVJLHdFQUF3RTtJQUN4RSxxRUFBcUU7SUFDckUsdUJBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuQixXQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDYixhQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFFZCxzQkFBUyxDQUFDLFVBQVUsQ0FBQyxlQUFxQixDQUFDLENBQUM7SUFFNUMsSUFBSSxJQUFJLEdBQUc7UUFDUCxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU1QixJQUFJLE9BQU8sR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2pDLHVCQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLFdBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkIsYUFBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixDQUFDLENBQUM7SUFDRixJQUFJLEVBQUUsQ0FBQztBQUNYLENBQUM7QUFFRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUI7SUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDckIsSUFBSSxPQUFPLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQztJQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQixPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsc0JBQXNCO0lBQ3pDLENBQUM7SUFDRCxRQUFRLEdBQUcsR0FBRyxDQUFDO0lBQ2YsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUNuQixDQUFDOzs7QUN4Q0Qsc0JBQXVCLGdCQUFnQixDQUFDLENBQUE7QUFReEMsSUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7QUFDL0IsSUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7QUF5Qi9CO0lBWUksWUFBWSxTQUFvQjtRQUM1QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsa0JBQWtCLENBQUM7UUFFNUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7SUFDL0IsQ0FBQztJQUVELGtCQUFLLEdBQUw7UUFDSSxFQUFFO0lBQ04sQ0FBQztJQUVELGlCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxPQUFPLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDO1lBQzVDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ2hDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCx1QkFBVSxHQUFWO1FBQ0ksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUUxQyxxREFBcUQ7UUFDckQsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBQzFDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsR0FBRyxDQUFDLENBQUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQztZQUM5QyxPQUFNLE1BQU0sQ0FBQyxhQUFhLEVBQUU7Z0JBQUMsQ0FBQztZQUU5QixHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLGdCQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0JBQ2hDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUU3QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzVDLHVGQUF1RjtnQkFDdkYsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQ3hCLFdBQVcsR0FBRyxPQUFPLENBQUM7b0JBQ3RCLFlBQVksR0FBRyxRQUFRLENBQUM7b0JBQ3hCLFVBQVUsR0FBRyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLHFHQUFxRztnQkFDdEosQ0FBQztnQkFFRCxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNuQixJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzNDLEVBQUUsQ0FBQyxDQUFDLFlBQVksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN6QixLQUFLLENBQUM7Z0JBQ1YsQ0FBQztZQUNMLENBQUM7WUFDRCxNQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsaUZBQWlGO1FBRWpGLDJFQUEyRTtRQUMzRSxJQUFJLENBQUMsY0FBYyxHQUFHLFlBQVksQ0FBQztRQUNuQyxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQztRQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDSyw2QkFBZ0IsR0FBeEIsVUFBeUIsTUFBbUI7UUFDeEMsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDeEQsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDcEQsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3BDLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzVDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFDO2NBQzdCLENBQUUsUUFBUSxHQUFHLGFBQWEsQ0FBQztjQUMzQixDQUFDLENBQUMsT0FBTyxHQUFJLEtBQUssQ0FBQztjQUNuQixDQUFDLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVPLGlDQUFvQixHQUE1QjtRQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUM7UUFDWCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsS0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUMvRyxzREFBc0Q7WUFDdEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzlCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzNCLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQzdELElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDcEMsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BFLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbkMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsaUNBQWlDO0lBQzdCLG1DQUFtQztJQUNuQyx3Q0FBd0M7SUFFeEMsNENBQTRDO0lBRTVDLG9CQUFvQjtJQUNwQiw2RkFBNkY7SUFDN0YsMkJBQTJCO0lBQzNCLGtGQUFrRjtJQUNsRiwyQkFBMkI7SUFDM0IsbUZBQW1GO0lBQ25GLDJCQUEyQjtJQUMzQixrRkFBa0Y7SUFDbEYsMkJBQTJCO0lBQzNCLHVGQUF1RjtJQUN2Riw2QkFBNkI7SUFDN0Isc0ZBQXNGO0lBQ3RGLGVBQWU7SUFDZixtRUFBbUU7SUFDbkUsUUFBUTtJQUNSLFdBQVc7SUFDWCwwQ0FBMEM7SUFDMUMsSUFBSTtJQUNSLElBQUk7SUFFSSx1Q0FBMEIsR0FBbEM7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUcsQ0FBQztJQUNMLFNBQUM7QUFBRCxDQWxKQSxBQWtKQyxJQUFBO0FBbEpZLFVBQUUsS0FrSmQsQ0FBQTs7O0FDcExELHFCQUFtQixtQkFBbUIsQ0FBQyxDQUFBO0FBR3ZDLDhCQUE2QyxpQkFBaUIsQ0FBQyxDQUFBO0FBQy9ELDBCQUFxQyx1QkFBdUIsQ0FBQyxDQUFBO0FBQzdELGtDQUE4QiwrQkFBK0IsQ0FBQyxDQUFBO0FBQzlELGtDQUE4QiwrQkFBK0IsQ0FBQyxDQUFBO0FBQzlELDJDQUFzQyx3Q0FBd0MsQ0FBQyxDQUFBO0FBQy9FLG1DQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRWhFLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDLG1FQUFtRTtBQUMzRSxnQkFBUSxHQUFHLEVBQUUsQ0FBQztBQUUzQjtJQVFJLGVBQVksVUFBc0IsRUFBRSxZQUEwQixFQUFFLFFBQWtCO1FBQzlFLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBRXpCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDekIsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxnQkFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxXQUFJLEVBQUUsQ0FBQztZQUM3QyxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSw0QkFBWSxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVELHFCQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7T0FHRztJQUNILG9CQUFJLEdBQUo7UUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUMzQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN0QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsMEJBQVUsR0FBVjtRQUNJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gscUNBQXFCLEdBQXJCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVELDZCQUFhLEdBQWI7UUFDSSxJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM5QixPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ25DLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDbkIsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELDhCQUFjLEdBQWQ7UUFDSSxJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM5QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM3QixPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ25DLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDbkIsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELDZCQUFhLEdBQWI7UUFDSSxJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMzQixPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ25DLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDbkIsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELHNDQUFzQixHQUF0QjtRQUNJLEdBQUcsQ0FBQztZQUNBLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7UUFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCx5QkFBUyxHQUFUO1FBQ0ksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRUQsb0NBQW9CLEdBQXBCO1FBQ0ksSUFBSSxPQUFnQixDQUFDO1FBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDcEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxZQUFZLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUMzQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ25DLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDbkIsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELDJCQUFXLEdBQVgsVUFBWSxpQkFBeUI7UUFDakMsb0RBQW9EO1FBQ3BELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRXpDLCtCQUErQjtRQUMvQixHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDL0Msb0NBQW9DO1lBQ3BDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQztZQUNyQixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLGdCQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxNQUFJLEdBQUcsSUFBSSxXQUFJLEVBQUUsQ0FBQztnQkFDdEIsTUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFXLENBQUMsQ0FBQztnQkFDM0IsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFJLENBQUMsQ0FBQztZQUNuQixDQUFDO1lBRUQseURBQXlEO1lBQ3pELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvRCxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFXLENBQUMsQ0FBQztZQUUzQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRUQseURBQXlEO1FBQ3pELDRCQUE0QjtRQUM1QixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDekQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDakQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBZSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ25GLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVELGtEQUFrRDtJQUNsRCxxQkFBcUI7SUFDckIsb0VBQW9FO0lBQ3BFLHlDQUF5QztJQUN6Qyw0QkFBNEI7SUFDNUIsZ0VBQWdFO0lBQ2hFLG9FQUFvRTtJQUNwRSxZQUFZO0lBQ1osOEJBQThCO0lBQzlCLFFBQVE7SUFDUixtQkFBbUI7SUFDbkIsSUFBSTtJQUVKOztPQUVHO0lBQ0gsMkJBQVcsR0FBWDtRQUNJLElBQUksSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsZ0NBQWdCLEVBQUUsd0JBQVksQ0FBQyxDQUFDO1FBRXRFLHVFQUF1RTtRQUN2RSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEQsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ3pELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUIsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7O09BRUc7SUFDSCx3Q0FBd0IsR0FBeEI7UUFDSSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUMvQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQU8sTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxzQ0FBc0IsR0FBdEI7UUFDSSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFFdEIsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ3pELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ2pELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxhQUFXLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxLQUFLLEVBQUUsQ0FBQztnQkFDWixDQUFDO1lBQ0wsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsYUFBYSxFQUFFLENBQUM7WUFDcEIsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLENBQUMsYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsOEJBQWMsR0FBZDtRQUNJLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLGdCQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUMvQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxJQUFJLG9CQUFvQixHQUFHLElBQUksQ0FBQztZQUNoQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ3pELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLEVBQUUsQ0FBQyxDQUFDLG9CQUFvQixLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxhQUFXLENBQUMsQ0FBQyxDQUFDO3dCQUNsQyxLQUFLLEVBQUUsQ0FBQzt3QkFDUixvQkFBb0IsR0FBRyxJQUFJLENBQUM7b0JBQ2hDLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ0osb0JBQW9CLEdBQUcsS0FBSyxDQUFDO29CQUNqQyxDQUFDO2dCQUNMLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLGFBQVcsQ0FBQyxDQUFDLENBQUM7d0JBQ2xDLG9CQUFvQixHQUFHLElBQUksQ0FBQztvQkFDaEMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixvQkFBb0IsR0FBRyxLQUFLLENBQUM7b0JBQ2pDLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7WUFDRCxVQUFVLElBQUksS0FBSyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNILGtDQUFrQixHQUFsQjtRQUNJLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUMvQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDbkQsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsU0FBUyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTyxzQ0FBc0IsR0FBOUI7UUFDSSxJQUFJLFVBQVUsR0FBYSxFQUFFLENBQUM7UUFDOUIsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxnQkFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDL0MsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBRUQsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxnQkFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDL0MsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLFFBQVEsR0FBRyxDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUNwRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssYUFBVyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsT0FBTyxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUM7Z0JBQ2hDLENBQUM7WUFDTCxDQUFDO1lBQ0QsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUNqQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsbUNBQW1CLEdBQW5CO1FBQ0ksR0FBRyxDQUFDLENBQWUsVUFBOEIsRUFBOUIsS0FBQSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxFQUE5QixjQUE4QixFQUE5QixJQUE4QixDQUFDO1lBQTdDLElBQUksTUFBTSxTQUFBO1lBQ1gsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ25ELElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVuRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLFFBQVEsQ0FBQztZQUNiLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELFFBQVEsQ0FBQztZQUNiLENBQUM7WUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNqRTtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILHVDQUF1QixHQUF2QjtRQUNJLEdBQUcsQ0FBQyxDQUFlLFVBQThCLEVBQTlCLEtBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsRUFBOUIsY0FBOEIsRUFBOUIsSUFBOEIsQ0FBQztZQUE3QyxJQUFJLE1BQU0sU0FBQTtZQUNYLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFbkQsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxRQUFRLENBQUM7WUFDYixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxRQUFRLENBQUM7WUFDYixDQUFDO1lBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQVcsQ0FBQyxDQUFDO1NBQ3JEO0lBQ0wsQ0FBQztJQUVPLHFCQUFLLEdBQWI7UUFDSSxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDekQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDakQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQVcsQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ssK0JBQWUsR0FBdkIsVUFBd0IsTUFBYyxFQUFFLE1BQWMsRUFBRSxLQUFZO1FBQ2hFLGlDQUFpQztRQUNqQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBZSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFTywwQkFBVSxHQUFsQixVQUFtQixjQUF1QjtRQUN0QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU8sMEJBQVUsR0FBbEI7UUFDSSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFFdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDO1FBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUUzQixNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7O09BR0c7SUFDSyxpQ0FBaUIsR0FBekI7UUFDSSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFFdEIsR0FBRyxDQUFDLENBQWUsVUFBOEIsRUFBOUIsS0FBQSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxFQUE5QixjQUE4QixFQUE5QixJQUE4QixDQUFDO1lBQTdDLElBQUksTUFBTSxTQUFBO1lBQ1gsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2hELElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVoRCxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLGFBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLENBQUM7U0FDSjtRQUVELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssMkJBQVcsR0FBbkI7UUFDSSxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ3hDLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsZ0JBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssYUFBVyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU8sK0JBQWUsR0FBdkI7UUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLHFDQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFTyxvQ0FBb0IsR0FBNUI7UUFDSSxJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDLHdGQUF3RjtRQUVuSCx3RkFBd0Y7UUFDeEYsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDOUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbEIsR0FBRyxDQUFDLENBQWEsVUFBRyxFQUFILFdBQUcsRUFBSCxpQkFBRyxFQUFILElBQUcsQ0FBQztnQkFBaEIsSUFBSSxJQUFJLFlBQUE7Z0JBQ1QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLGFBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQ2xDLE1BQU0sR0FBRyxLQUFLLENBQUM7b0JBQ2YsS0FBSyxDQUFDO2dCQUNWLENBQUM7YUFDSjtZQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQztvQkFDN0IsaUJBQWlCLEdBQUcsTUFBTSxDQUFDO2dCQUMvQixDQUFDO2dCQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyw4R0FBOEc7WUFDdkksQ0FBQztRQUNMLENBQUM7UUFFRCxpR0FBaUc7UUFDakcsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sSUFBSSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ3pELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUIsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ2pELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQWUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNuRixDQUFDO1FBQ0wsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDMUUsQ0FBQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSyxpQ0FBaUIsR0FBekIsVUFBMEIsTUFBYztRQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLGdCQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksV0FBSSxFQUFFLENBQUM7UUFDeEMsQ0FBQztJQUNMLENBQUM7SUFFTywyQ0FBMkIsR0FBbkMsVUFBb0MsUUFBYztRQUFkLHdCQUFjLEdBQWQsZ0JBQWM7UUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxvREFBdUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBQ0wsWUFBQztBQUFELENBbGRBLEFBa2RDLElBQUE7QUFsZFksYUFBSyxRQWtkakIsQ0FBQTs7Ozs7Ozs7QUNoZUQsc0JBQW9CLFNBQVMsQ0FBQyxDQUFBO0FBRzlCO0lBQXFCLDBCQUFLO0lBQTFCO1FBQXFCLDhCQUFLO1FBQ3RCLFVBQUssR0FBRyxZQUFVLENBQUM7UUFDbkIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFDakIsYUFBUSxHQUFHO1lBQ1A7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNiO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNiO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNiO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNiO1NBQ0osQ0FBQTtJQUtMLENBQUM7SUFIRyw0QkFBVyxHQUFYO1FBQ0ksTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQWpDQSxBQWlDQyxDQWpDb0IsYUFBSyxHQWlDekI7QUFFRDtJQUFxQiwwQkFBSztJQUExQjtRQUFxQiw4QkFBSztRQUN0QixVQUFLLEdBQUcsWUFBVSxDQUFDO1FBQ25CLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLGFBQVEsR0FBRztZQUNQO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7WUFDRDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtZQUNEO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7U0FDSixDQUFDO0lBS04sQ0FBQztJQUhHLDRCQUFXLEdBQVg7UUFDSSxNQUFNLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0wsYUFBQztBQUFELENBN0JBLEFBNkJDLENBN0JvQixhQUFLLEdBNkJ6QjtBQUVEO0lBQXFCLDBCQUFLO0lBQTFCO1FBQXFCLDhCQUFLO1FBQ3RCLFVBQUssR0FBRyxjQUFZLENBQUM7UUFDckIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFDakIsYUFBUSxHQUFHO1lBQ1A7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtZQUNEO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7WUFDRDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtTQUNKLENBQUE7SUFLTCxDQUFDO0lBSEcsNEJBQVcsR0FBWDtRQUNJLE1BQU0sQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0E3QkEsQUE2QkMsQ0E3Qm9CLGFBQUssR0E2QnpCO0FBRUQ7SUFBcUIsMEJBQUs7SUFBMUI7UUFBcUIsOEJBQUs7UUFDdEIsVUFBSyxHQUFHLGNBQVksQ0FBQztRQUNyQixpQkFBWSxHQUFHLENBQUMsQ0FBQztRQUNqQixhQUFRLEdBQUc7WUFDUDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNiO1NBQ0osQ0FBQTtJQUtMLENBQUM7SUFIRyw0QkFBVyxHQUFYO1FBQ0ksTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQWRBLEFBY0MsQ0Fkb0IsYUFBSyxHQWN6QjtBQUVEO0lBQXFCLDBCQUFLO0lBQTFCO1FBQXFCLDhCQUFLO1FBQ3RCLFVBQUssR0FBRyxhQUFXLENBQUM7UUFDcEIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFDakIsYUFBUSxHQUFHO1lBQ1A7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtZQUNEO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7WUFDRDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtTQUNKLENBQUE7SUFLTCxDQUFDO0lBSEcsNEJBQVcsR0FBWDtRQUNJLE1BQU0sQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0E3QkEsQUE2QkMsQ0E3Qm9CLGFBQUssR0E2QnpCO0FBRUQ7SUFBcUIsMEJBQUs7SUFBMUI7UUFBcUIsOEJBQUs7UUFDdEIsVUFBSyxHQUFHLGNBQVksQ0FBQztRQUNyQixpQkFBWSxHQUFHLENBQUMsQ0FBQztRQUNqQixhQUFRLEdBQUc7WUFDUDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtZQUNEO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7WUFDRDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1NBQ0osQ0FBQTtJQUtMLENBQUM7SUFIRyw0QkFBVyxHQUFYO1FBQ0ksTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQTdCQSxBQTZCQyxDQTdCb0IsYUFBSyxHQTZCekI7QUFFRDtJQUFxQiwwQkFBSztJQUExQjtRQUFxQiw4QkFBSztRQUN0QixVQUFLLEdBQUcsV0FBUyxDQUFDO1FBQ2xCLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLGFBQVEsR0FBRztZQUNQO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7WUFDRDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtZQUNEO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7U0FDSixDQUFBO0lBS0wsQ0FBQztJQUhHLDRCQUFXLEdBQVg7UUFDSSxNQUFNLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0wsYUFBQztBQUFELENBN0JBLEFBNkJDLENBN0JvQixhQUFLLEdBNkJ6QjtBQUVEO0lBR0k7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxnQ0FBUyxHQUFULFVBQVUsY0FBdUI7UUFDN0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLGNBQWMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTyxnQ0FBUyxHQUFqQixVQUFrQixrQkFBMkI7UUFDekMsSUFBSSxDQUFDLEdBQUcsR0FBRztZQUNQLElBQUksTUFBTSxFQUFFO1lBQ1osSUFBSSxNQUFNLEVBQUU7WUFDWixJQUFJLE1BQU0sRUFBRTtZQUNaLElBQUksTUFBTSxFQUFFO1NBQ2YsQ0FBQztRQUVGLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQ1QsSUFBSSxNQUFNLEVBQUUsRUFDWixJQUFJLE1BQU0sRUFBRSxFQUNaLElBQUksTUFBTSxFQUFFLENBQ2YsQ0FBQztRQUNOLENBQUM7UUFFRCxxRUFBcUU7UUFDckUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUE7UUFDekIsNENBQTRDO1FBQzVDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ2YsOEJBQThCO1lBQzlCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzdDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDVCx3Q0FBd0M7WUFDeEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUM7UUFDL0IsQ0FBQztJQUNMLENBQUM7SUFDTCxtQkFBQztBQUFELENBM0NBLEFBMkNDLElBQUE7QUEzQ1ksb0JBQVksZUEyQ3hCLENBQUE7QUFDWSx3QkFBZ0IsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDLENBQUMsY0FBYzs7O0FDN1BsRSxxQkFBeUIsbUJBQW1CLENBQUMsQ0FBQTtBQUc3QyxJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxpREFBaUQ7QUFFdEU7SUFXSTtRQUNJLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxnREFBZ0Q7UUFDN0UsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDYixJQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQztJQUN6QixDQUFDO0lBRUQsd0JBQVEsR0FBUjtRQUNJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCx5QkFBUyxHQUFUO1FBQ0ksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUVELHNCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDZixDQUFDO0lBRUQsd0JBQVEsR0FBUjtRQUNJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRDs7T0FFRztJQUNILHlCQUFTLEdBQVQ7UUFDSSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBRUQsc0NBQXNCLEdBQXRCO1FBQ0ksSUFBSSxDQUFDLGtCQUFrQixJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsK0JBQWUsR0FBZjtRQUNJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELHNCQUFNLEdBQU47UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNwQixDQUFDO0lBRUQsc0JBQU0sR0FBTjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3BCLENBQUM7SUFFRCwyQkFBVyxHQUFYO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsMEJBQVUsR0FBVjtRQUNJLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3JDLElBQUksT0FBTyxHQUFpQixFQUFFLENBQUM7UUFDL0IsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDM0MsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNkLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzVDLElBQUksTUFBTSxHQUFHLElBQUksaUJBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekIsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7O09BR0c7SUFDSCwyQkFBVyxHQUFYO1FBQ0ksd0VBQXdFO1FBQ3hFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVPLGdDQUFnQixHQUF4QjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTyxpQ0FBaUIsR0FBekI7UUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7SUFDTCxDQUFDO0lBQ0wsWUFBQztBQUFELENBakdBLEFBaUdDLElBQUE7QUFqR3FCLGFBQUssUUFpRzFCLENBQUE7OztBQ3RHRCxzQkFBOEIsZUFBZSxDQUFDLENBQUE7QUFDOUMsbUJBQWlCLFNBQVMsQ0FBQyxDQUFBO0FBQzNCLDRCQUF5QixtQkFBbUIsQ0FBQyxDQUFBO0FBQzdDLDBCQUFrQyxvQkFBb0IsQ0FBQyxDQUFBO0FBRXZELGdDQUE2QiwyQkFBMkIsQ0FBQyxDQUFBO0FBS3pELGlDQUE2QiwyQkFBMkIsQ0FBQyxDQUFBO0FBQ3pELDhCQUEyQix1QkFBdUIsQ0FBQyxDQUFBO0FBRW5ELElBQU0sTUFBTSxHQUFHLGdCQUFRLENBQUMsQ0FBQyw2RkFBNkY7QUFDdEgsSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDO0FBRTFCO0lBV0k7UUFDSSxJQUFJLGlCQUFpQixHQUFHLElBQUksNEJBQVksRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxhQUFLLENBQUMsYUFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxvQkFBUSxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7UUFFN0IsSUFBSSxjQUFjLEdBQUcsSUFBSSw0QkFBWSxFQUFFLENBQUM7UUFDeEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGFBQUssQ0FBQyxVQUFhLEVBQUUsY0FBYyxFQUFFLG9CQUFRLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztRQUUxQixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksT0FBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUvQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsYUFBYSxDQUFDO0lBQzNDLENBQUM7SUFFRCxxQkFBSyxHQUFMO1FBQUEsaUJBeUJDO1FBeEJHLG9CQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFTLENBQUMsdUJBQXVCLEVBQUUsVUFBQyxLQUEwQjtZQUM1RSxLQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7UUFFSCxvQkFBUSxDQUFDLFFBQVEsQ0FBQyxxQkFBUyxDQUFDLG1CQUFtQixFQUFFLFVBQUMsS0FBc0I7WUFDcEUsS0FBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBRUgsb0JBQVEsQ0FBQyxRQUFRLENBQUMscUJBQVMsQ0FBQyxvQkFBb0IsRUFBRSxVQUFDLEtBQXVCO1lBQ3RFLEtBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztRQUVILG9CQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFTLENBQUMsMkJBQTJCLEVBQUUsVUFBQyxLQUE4QjtZQUNwRixLQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQix3QkFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRW5CLDBEQUEwRDtRQUMxRCxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVELG9CQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsd0JBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVPLDBCQUFVLEdBQWxCLFVBQW1CLE9BQWU7UUFDOUIsSUFBSSxDQUFDLGlCQUFpQixJQUFJLE9BQU8sQ0FBQztRQUNsQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsYUFBYSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQUVPLG9DQUFvQixHQUE1QixVQUE2QixLQUEwQjtRQUNuRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXJELE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLEtBQUssZ0NBQWMsQ0FBQyxJQUFJO2dCQUNwQixLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3RCLEtBQUssQ0FBQztZQUNWLEtBQUssZ0NBQWMsQ0FBQyxLQUFLO2dCQUNyQixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQztZQUNWLEtBQUssZ0NBQWMsQ0FBQyxJQUFJO2dCQUNwQixLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3RCLEtBQUssQ0FBQztZQUNWLEtBQUssZ0NBQWMsQ0FBQyxJQUFJO2dCQUNwQixLQUFLLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDL0IsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsOENBQThDO2dCQUM1RCxLQUFLLENBQUM7WUFDVixLQUFLLGdDQUFjLENBQUMsZUFBZTtnQkFDL0IsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzdCLEtBQUssQ0FBQztZQUNWO2dCQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDbEMsS0FBSyxDQUFDO1FBQ2QsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLHFDQUFxQixHQUE3QixVQUE4QixLQUFzQjtRQUNoRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9ELEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNLLGlDQUFpQixHQUF6QixVQUEwQixVQUFzQjtRQUM1QyxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssYUFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLDJDQUEyQixHQUFuQyxVQUFvQyxVQUFzQjtRQUN0RCxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssYUFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0IsQ0FBQztJQUNMLENBQUM7SUFFTyxzQ0FBc0IsR0FBOUIsVUFBK0IsS0FBdUI7UUFDbEQsSUFBSSxFQUFVLENBQUM7UUFDZixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxLQUFLLGFBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ0Qsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQ0FBYyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUV4RCxxREFBcUQ7SUFDekQsQ0FBQztJQUVPLDZDQUE2QixHQUFyQyxVQUFzQyxLQUE4QjtRQUNoRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLFVBQWEsQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7UUFFUixDQUFDO0lBQ0wsQ0FBQztJQUNMLFlBQUM7QUFBRCxDQTlJQSxBQThJQyxJQUFBO0FBQ1ksYUFBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7O0FDL0pqQyw0RUFBNEU7O0FBRTVFLG9CQUFrQixPQUNsQixDQUFDLENBRHdCO0FBRXpCLDBCQUFrQyx1QkFBdUIsQ0FBQyxDQUFBO0FBSTFELG1EQUFtRDtBQUNuRCxJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFFdEI7SUFJSTtRQUNJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztRQUNuQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFVBQVUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ2pELElBQUksR0FBRyxHQUFHLElBQUksU0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFDO0lBQ0wsQ0FBQztJQUVELDBCQUFLLEdBQUw7UUFBQSxpQkFtQkM7UUFsQkcsb0JBQVEsQ0FBQyxRQUFRLENBQUMscUJBQVMsQ0FBQyw2QkFBNkIsRUFBRSxVQUFDLEtBQWdDO1lBQ3hGLEtBQUksQ0FBQywrQkFBK0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBUTtZQUN2QixDQUFDO2dCQUNHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDN0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEIsQ0FBQztZQUVELDZCQUE2QjtZQUM3QixDQUFDO2dCQUNHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDN0IsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELHlCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBUTtZQUN2QixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLG9EQUErQixHQUF2QyxVQUF3QyxLQUFnQztRQUNwRSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDZCxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEIsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0IsQ0FBQztJQUNMLENBQUM7SUFDTCxpQkFBQztBQUFELENBL0NBLEFBK0NDLElBQUE7QUFDWSxrQkFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7OztBQzNEM0MsMEJBQWtDLHVCQUF1QixDQUFDLENBQUE7QUFDMUQsaUNBQTZCLDhCQUE4QixDQUFDLENBQUE7QUFDNUQsMkNBQXNDLHdDQUF3QyxDQUFDLENBQUE7QUFHL0U7SUFVSTtRQUNJLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFhLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFFckIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBRUQsbUJBQUssR0FBTCxVQUFNLENBQVMsRUFBRSxDQUFTO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixvQkFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLGlDQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRDs7T0FFRztJQUNILGtCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLElBQUksQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDO0lBQ2hDLENBQUM7SUFFRCwwQkFBWSxHQUFaLFVBQWEsS0FBZTtRQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsNEJBQWMsR0FBZCxVQUFlLENBQVMsRUFBRSxDQUFTO1FBQy9CLG9CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksb0RBQXVCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQ7O09BRUc7SUFDSCw0QkFBYyxHQUFkLFVBQWUsQ0FBUyxFQUFFLENBQVM7UUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBYSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELHNCQUFRLEdBQVI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBQ0wsVUFBQztBQUFELENBdERBLEFBc0RDLElBQUE7QUF0RFksV0FBRyxNQXNEZixDQUFBOzs7QUMzREQsK0NBQTBDLCtDQUErQyxDQUFDLENBQUE7QUFFMUY7SUFBQTtJQU1BLENBQUM7SUFKRywyQkFBTyxHQUFQLFVBQVEsUUFBbUI7UUFDdkIsNERBQTJCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLHlFQUF5RTtJQUM3RSxDQUFDO0lBQ0wsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQUNZLGlCQUFTLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQzs7O0FDUHpDLElBQU0sWUFBWSxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUM7QUFFMUI7SUFJSTtRQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELDBDQUFrQixHQUFsQixVQUFtQixRQUFhO1FBQzVCLElBQUksaUJBQWlCLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQy9ELElBQUksS0FBYSxFQUFFLE1BQWMsQ0FBQztRQUNsQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ25DLHdDQUF3QztZQUN4QyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDO1lBQ3RELE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsaUJBQWlCLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQztZQUMzQyx1REFBdUQ7WUFDdkQsS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDMUIsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEMsMEVBQTBFO1FBQzFFLCtEQUErRDtRQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDekMsQ0FBQztJQUVELG1DQUFXLEdBQVgsVUFBWSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELDhCQUFNLEdBQU4sVUFBTyxJQUFTO1FBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNMLG9CQUFDO0FBQUQsQ0FsQ0EsQUFrQ0MsSUFBQTtBQUNZLHFCQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQzs7O0FDckNqRDtJQU1JO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVsQyw4QkFBOEI7UUFDOUIsb0RBQW9EO1FBQ3BELG1FQUFtRTtRQUNuRSxrREFBa0Q7UUFDbEQseUNBQXlDO0lBQzdDLENBQUM7SUFFRCxnQ0FBZ0M7SUFDaEMsd0JBQUssR0FBTDtRQUFBLGlCQWNDO1FBYkcsSUFBSSxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFVBQUMsU0FBYztZQUNoRCxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEIsSUFBSSxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdEMsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RCLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsVUFBQyxHQUFRO2dCQUMxQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixLQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QixDQUFDLEVBQUUsY0FBUSxDQUFDLEVBQUUsY0FBUSxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCx1QkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixFQUFFO0lBQ04sQ0FBQztJQUNMLGVBQUM7QUFBRCxDQXBDQSxBQW9DQyxJQUFBO0FBcENZLGdCQUFRLFdBb0NwQixDQUFBOzs7QUNwQ0QsOEJBQW9DLGlCQUFpQixDQUFDLENBQUE7QUFHdEQ7SUFPSTtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxxQ0FBcUIsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQ25ELElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDakQsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM3QyxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNWLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUIsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFFdEIsZ0NBQWdDO1lBQ2hDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztZQUV4QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0wsQ0FBQztJQUVELHdCQUFLLEdBQUwsVUFBTSxhQUE0QjtRQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUVuQyxHQUFHLENBQUMsQ0FBYyxVQUFXLEVBQVgsS0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLGNBQVcsRUFBWCxJQUFXLENBQUM7WUFBekIsSUFBSSxLQUFLLFNBQUE7WUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QjtRQUVELHFDQUFxQztRQUNyQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWxDLElBQUksQ0FBQyxRQUFRLENBQUMscUNBQXFCLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsdUJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsRUFBRTtJQUNOLENBQUM7SUFFRDs7T0FFRztJQUNILDJCQUFRLEdBQVIsVUFBUyxFQUFVO1FBQ2YsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLHFDQUFxQixDQUFDLENBQUMsQ0FBQztZQUM3QixFQUFFLEdBQUcscUNBQXFCLENBQUM7UUFDL0IsQ0FBQztRQUVELEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUNoRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssNEJBQWtDLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDWCxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDekIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFDMUIsQ0FBQztZQUNMLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUkscUNBQXFCLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDcEMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQzFCLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVELGdFQUFnRTtJQUNwRSxDQUFDO0lBQ0wsZUFBQztBQUFELENBMUVBLEFBMEVDLElBQUE7QUExRVksZ0JBQVEsV0EwRXBCLENBQUE7OztBQzVFRCx5QkFBdUIsWUFBWSxDQUFDLENBQUE7QUFDcEMsMEJBQXVCLGFBQWEsQ0FBQyxDQUFBO0FBR3JDLG1GQUFtRjtBQUN0RSxtQkFBVyxHQUFHLEVBQUUsQ0FBQztBQUNqQiw2QkFBcUIsR0FBRyxFQUFFLENBQUM7QUFFeEMsSUFBTSx3QkFBd0IsR0FBRyxDQUFDLENBQUM7QUFFbkM7SUFBQTtJQUVBLENBQUM7SUFBRCx3QkFBQztBQUFELENBRkEsQUFFQyxJQUFBO0FBRUQ7SUFnQkk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFRLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksb0JBQVEsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsbUJBQVcsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDO1lBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzNCLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsNkJBQXFCLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQztnQkFDbEUsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxrQkFBa0I7Z0JBQ3ZFLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQzdDLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUV0QixJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyx1Q0FBdUM7Z0JBQzdELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDVixLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUM1QyxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsd0JBQXdCLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUM1RCxJQUFJLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNwRSx3Q0FBd0M7WUFDeEMsdURBQXVEO1lBQ3ZELDJGQUEyRjtZQUMvRSxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNwRCxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQzlELElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0MsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLDRDQUE0QztZQUN4RSxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXRCLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMscUNBQXFDO1lBQ2hGLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1FBRTlCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBRUQsNEJBQUssR0FBTCxVQUFNLGFBQTRCO1FBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVuQyxHQUFHLENBQUMsQ0FBYyxVQUFXLEVBQVgsS0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLGNBQVcsRUFBWCxJQUFXLENBQUM7WUFBekIsSUFBSSxLQUFLLFNBQUE7WUFDVixHQUFHLENBQUMsQ0FBYyxVQUFLLEVBQUwsZUFBSyxFQUFMLG1CQUFLLEVBQUwsSUFBSyxDQUFDO2dCQUFuQixJQUFJLEtBQUssY0FBQTtnQkFDVixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QjtTQUNKO1FBRUQsR0FBRyxDQUFDLENBQW1CLFVBQWdCLEVBQWhCLEtBQUEsSUFBSSxDQUFDLFdBQVcsRUFBaEIsY0FBZ0IsRUFBaEIsSUFBZ0IsQ0FBQztZQUFuQyxJQUFJLFVBQVUsU0FBQTtZQUNmLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ25DO1FBRUQscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFdkMsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO2FBQ3BELEVBQUUsQ0FBQyxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUMsRUFBRSxHQUFHLENBQUM7YUFDckIsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQzthQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ1YsTUFBTSxDQUFDLFFBQVEsQ0FBQzthQUNoQixLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELDJCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELG9DQUFhLEdBQWIsVUFBYyxRQUFnQixFQUFFLFFBQWdCO1FBQzVDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVELG1DQUFZLEdBQVosVUFBYSxRQUFnQixFQUFFLFFBQWdCLEVBQUUsS0FBYTtRQUMxRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsNkNBQXNCLEdBQXRCLFVBQXVCLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxLQUFhO1FBQ3BFLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRS9CLDJEQUEyRDtRQUMzRCxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksbUJBQVcsQ0FBQyxDQUFDLENBQUM7WUFDMUIsVUFBVSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDL0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osVUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDOUIsQ0FBQztRQUVELElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUNqQixJQUFJLENBQUMsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsdUNBQXVDO1FBQzdELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNiLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELCtCQUFRLEdBQVIsVUFBUyxFQUFVO1FBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVPLHdDQUFpQixHQUF6QjtRQUNJLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixJQUFJLHdCQUF3QixDQUFDLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFFTyxnQ0FBUyxHQUFqQixVQUFrQixPQUFlO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxHQUFHLENBQUMsQ0FBYyxVQUFXLEVBQVgsS0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLGNBQVcsRUFBWCxJQUFXLENBQUM7WUFBekIsSUFBSSxLQUFLLFNBQUE7WUFDVixHQUFHLENBQUMsQ0FBYyxVQUFLLEVBQUwsZUFBSyxFQUFMLG1CQUFLLEVBQUwsSUFBSyxDQUFDO2dCQUFuQixJQUFJLEtBQUssY0FBQTtnQkFDVixLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7YUFDbkU7U0FDSjtJQUNMLENBQUM7SUFDTCxtQkFBQztBQUFELENBekpBLEFBeUpDLElBQUE7QUF6Slksb0JBQVksZUF5SnhCLENBQUE7OztBQzFLRCwwQkFBa0MsdUJBQXVCLENBQUMsQ0FBQTtBQUkxRCw4QkFBK0QsaUJBQWlCLENBQUMsQ0FBQTtBQUtqRjtJQUtJLHFCQUFZLFlBQTBCLEVBQUUsVUFBc0I7UUFDMUQsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUVELDJCQUFLLEdBQUw7UUFBQSxpQkFrQkM7UUFqQkcsb0JBQVEsQ0FBQyxRQUFRLENBQUMscUJBQVMsQ0FBQywyQkFBMkIsRUFBRSxVQUFDLEtBQThCO1lBQ3BGLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLEtBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxvQkFBUSxDQUFDLFFBQVEsQ0FBQyxxQkFBUyxDQUFDLG1CQUFtQixFQUFFLFVBQUMsS0FBc0I7WUFDcEUsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDdkMsS0FBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILG9CQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFTLENBQUMsa0JBQWtCLEVBQUUsVUFBQyxLQUFxQjtZQUNsRSxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxLQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELDBCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLEVBQUU7SUFDTixDQUFDO0lBRU8sbURBQTZCLEdBQXJDLFVBQXNDLEtBQThCO1FBQ2hFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDNUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNwQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFakQsR0FBRyxDQUFDLENBQWUsVUFBd0IsRUFBeEIsS0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUF4QixjQUF3QixFQUF4QixJQUF3QixDQUFDO1lBQXZDLElBQUksTUFBTSxTQUFBO1lBQ1gsSUFBSSxjQUFjLEdBQUcsUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxjQUFjLEdBQUcsUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ25GO0lBQ0wsQ0FBQztJQUVPLDJDQUFxQixHQUE3QixVQUE4QixLQUFzQjtRQUNoRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSwyQkFBVyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsQ0FBQyx5QkFBeUI7UUFDckMsQ0FBQztRQUVELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxhQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlELENBQUM7SUFDTCxDQUFDO0lBRU8sMENBQW9CLEdBQTVCLFVBQTZCLEtBQXFCO1FBQzlDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssdUNBQWlCLEdBQXpCLFVBQTBCLEdBQVc7UUFDakMsSUFBSSxLQUFLLEdBQUcsQ0FBQywyQkFBVyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTyxrQ0FBWSxHQUFwQixVQUFxQixLQUFZO1FBQzdCLElBQUksS0FBYSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDWixLQUFLLFlBQVU7Z0JBQ1gsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDakIsS0FBSyxDQUFDO1lBQ1YsS0FBSyxjQUFZO2dCQUNiLEtBQUssR0FBRyxRQUFRLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLEtBQUssY0FBWTtnQkFDYixLQUFLLEdBQUcsUUFBUSxDQUFDO2dCQUNqQixLQUFLLENBQUM7WUFDVixLQUFLLGFBQVc7Z0JBQ1osS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDakIsS0FBSyxDQUFDO1lBQ1YsS0FBSyxXQUFTO2dCQUNWLEtBQUssR0FBRyxRQUFRLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLEtBQUssWUFBVTtnQkFDWCxLQUFLLEdBQUcsUUFBUSxDQUFDO2dCQUNqQixLQUFLLENBQUM7WUFDVixLQUFLLGNBQVk7Z0JBQ2IsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDakIsS0FBSyxDQUFDO1lBQ1YsS0FBSyxhQUFXO2dCQUNaLEtBQUssR0FBRyxRQUFRLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLG9DQUFvQztZQUNwQyxLQUFLLGFBQVcsQ0FBQztZQUNqQjtnQkFDSSxLQUFLLEdBQUcsUUFBUSxDQUFDO2dCQUNqQixLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0wsa0JBQUM7QUFBRCxDQTdHQSxBQTZHQyxJQUFBO0FBN0dZLG1CQUFXLGNBNkd2QixDQUFBOzs7QUNwSEQsd0NBQXdDO0FBQzNCLHlCQUFpQixHQUFLLEdBQUcsQ0FBQztBQUMxQiwwQkFBa0IsR0FBSSxHQUFHLENBQUM7QUFFdkMsa0RBQWtEO0FBQ3JDLG1CQUFXLEdBQUssRUFBRSxDQUFDO0FBQ25CLG9CQUFZLEdBQUksRUFBRSxDQUFDO0FBRWhDLElBQU0sd0JBQXdCLEdBQUcsQ0FBQyxDQUFDO0FBRW5DO0lBSUksd0NBQVksT0FBWTtRQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBQ0wscUNBQUM7QUFBRCxDQVBBLEFBT0MsSUFBQTtBQVBZLHNDQUE4QixpQ0FPMUMsQ0FBQTtBQUVEO0lBTUk7UUFDSSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCw2Q0FBTyxHQUFQLFVBQVEsUUFBbUI7UUFBM0IsaUJBa0JDO1FBakJHLElBQUksb0JBQW9CLEdBQUcsVUFBQyxPQUFZO1lBQ3BDLHlDQUF5QztZQUN6QyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDZCxtQkFBVyxHQUFJLHlCQUFpQixFQUNoQyxvQkFBWSxHQUFHLDBCQUFrQixDQUNwQyxDQUFDO1lBQ0YsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUIsS0FBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxXQUFXLElBQUksd0JBQXdCLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxRQUFRLEVBQUUsQ0FBQztZQUNmLENBQUM7UUFDTCxDQUFDLENBQUE7UUFFRCxJQUFJLGFBQWEsR0FBRyxJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM5QyxhQUFhLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDN0QsYUFBYSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQzlELGFBQWEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsaURBQVcsR0FBWDtRQUNJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ25DLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyw4RkFBOEY7UUFDeEksTUFBTSxDQUFDLElBQUksOEJBQThCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVPLHVEQUFpQixHQUF6QjtRQUNJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztJQUNsQyxDQUFDO0lBQ0wsa0NBQUM7QUFBRCxDQTdDQSxBQTZDQyxJQUFBO0FBQ1ksbUNBQTJCLEdBQUcsSUFBSSwyQkFBMkIsRUFBRSxDQUFDOzs7QUNqRTdFLHdCQUFzQixXQUFXLENBQUMsQ0FBQTtBQUNsQywwQkFBa0MsdUJBQXVCLENBQUMsQ0FBQTtBQUkxRCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyx1Q0FBdUM7QUFFOUQ7SUFNSTtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztJQUMvQyxDQUFDO0lBRUQsOEJBQUssR0FBTDtRQUFBLGlCQVVDO1FBVEcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRW5DLG9CQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFTLENBQUMsa0JBQWtCLEVBQUUsVUFBQyxLQUFxQjtZQUNsRSxLQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7UUFFSCxvQkFBUSxDQUFDLFFBQVEsQ0FBQyxxQkFBUyxDQUFDLDJCQUEyQixFQUFFLFVBQUMsS0FBOEI7WUFDcEYsS0FBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELDZCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBZ0I7WUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyw2Q0FBb0IsR0FBNUIsVUFBNkIsS0FBcUI7UUFDOUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFMUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTyw4Q0FBcUIsR0FBN0IsVUFBOEIsT0FBZ0IsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUNoRSxtRUFBbUU7UUFDbkUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVPLHNEQUE2QixHQUFyQyxVQUFzQyxLQUE4QjtRQUNoRSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0MsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoQixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0wsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0F0REEsQUFzREMsSUFBQTtBQUNZLHNCQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQzs7QUNoRW5ELDRFQUE0RTs7QUFJNUUsK0NBT0ssa0NBQWtDLENBQUMsQ0FBQTtBQUV4QyxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUM7QUFDM0IsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaURBQWlEO0FBRW5IO0lBS0ksK0JBQVksR0FBVyxFQUFFLEdBQVc7UUFDaEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBQ0wsNEJBQUM7QUFBRCxDQVRBLEFBU0MsSUFBQTtBQWdCRDtJQVlJLDBCQUFZLElBQTBCLEVBQUUsSUFBMkI7UUFDL0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUM7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO1FBRWpDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFRCwrQkFBSSxHQUFKLFVBQUssS0FBNEIsRUFBRSxLQUFzQjtRQUF0QixxQkFBc0IsR0FBdEIsc0JBQXNCO1FBQ3JELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCwrQkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixJQUFJLENBQUMsdUJBQXVCLElBQUksT0FBTyxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLHVCQUF1QixHQUFHLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUMsK0RBQStEO2dCQUN6RixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUN6QixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxxQ0FBVSxHQUFWO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELDBDQUFlLEdBQWY7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0FwREEsQUFvREMsSUFBQTtBQUVEO0lBUUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWxDLCtCQUErQjtRQUMvQixJQUFJLENBQUMsY0FBYyxHQUFHLDREQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2hFLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLGdEQUFnRDtRQUMvRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFNUIsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRUQsb0NBQUssR0FBTDtRQUNJLDJCQUEyQjtJQUMvQixDQUFDO0lBRUQsbUNBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNILDhDQUFlLEdBQWYsVUFBZ0IsSUFBMEI7UUFDdEMsSUFBSSxTQUFTLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1FBQ3RDLENBQUM7SUFDTCxDQUFDO0lBRU8sNkNBQWMsR0FBdEIsVUFBdUIsT0FBZTtRQUNsQyxvRUFBb0U7UUFDcEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU8sNENBQWEsR0FBckIsVUFBc0IsT0FBZTtRQUNqQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUM7UUFDWCxDQUFDO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUNELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUVwRCwyRUFBMkU7UUFDM0UsSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLDRDQUFXLENBQUMsR0FBRyxrREFBaUIsQ0FBQztRQUN6RCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxtREFBa0IsR0FBRyw2Q0FBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyw2Q0FBWSxDQUFDLEdBQUcsbURBQWtCLENBQUM7UUFDdkcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUNMLDJCQUFDO0FBQUQsQ0E5REEsQUE4REMsSUFBQTtBQTlEWSw0QkFBb0IsdUJBOERoQyxDQUFBO0FBRUQsNEJBQTRCLElBQTBCO0lBQ2xELElBQUksU0FBMkIsQ0FBQztJQUNoQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ1gsS0FBSyxlQUE0QjtZQUM3QixTQUFTLEdBQUcsYUFBYSxFQUFFLENBQUM7WUFDNUIsS0FBSyxDQUFDO1FBQ1YsS0FBSyxjQUEyQjtZQUM1QixTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUM7WUFDM0IsS0FBSyxDQUFDO1FBQ1YsS0FBSyxpQkFBOEI7WUFDL0IsU0FBUyxHQUFHLGVBQWUsRUFBRSxDQUFDO1lBQzlCLEtBQUssQ0FBQztRQUNWLEtBQUssZ0JBQTZCO1lBQzlCLFNBQVMsR0FBRyxjQUFjLEVBQUUsQ0FBQztZQUM3QixLQUFLLENBQUM7UUFDVixLQUFLLGlCQUE4QjtZQUMvQixTQUFTLEdBQUcsZUFBZSxFQUFFLENBQUM7WUFDOUIsS0FBSyxDQUFDO1FBQ1YsS0FBSyxnQkFBNkI7WUFDOUIsU0FBUyxHQUFHLGNBQWMsRUFBRSxDQUFDO1lBQzdCLEtBQUssQ0FBQztRQUNWLEtBQUssa0JBQStCO1lBQ2hDLFNBQVMsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1lBQy9CLEtBQUssQ0FBQztRQUNWLEtBQUssaUJBQThCO1lBQy9CLFNBQVMsR0FBRyxlQUFlLEVBQUUsQ0FBQztZQUM5QixLQUFLLENBQUM7UUFDVixLQUFLLGVBQTRCO1lBQzdCLFNBQVMsR0FBRyxhQUFhLEVBQUUsQ0FBQztZQUM1QixLQUFLLENBQUM7UUFDVixLQUFLLGVBQTRCO1lBQzdCLFNBQVMsR0FBRyxhQUFhLEVBQUUsQ0FBQztZQUM1QixLQUFLLENBQUM7UUFDVixLQUFLLGtCQUE4QjtZQUMvQixTQUFTLEdBQUcsZUFBZSxFQUFFLENBQUM7WUFDOUIsS0FBSyxDQUFDO1FBQ1Y7WUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDckIsQ0FBQztBQUVELGNBQWM7QUFDZCxJQUFJLGFBQWEsR0FBUyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUxRDtJQUNJLElBQUksU0FBUyxHQUFHLElBQUksZ0JBQWdCLENBQUMsZUFBNEIsQ0FBQyxDQUFDO0lBQ25FLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUIsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsYUFBYTtBQUNiLElBQUksWUFBWSxHQUFVLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksWUFBWSxHQUFVLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksWUFBWSxHQUFVLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksWUFBWSxHQUFVLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksWUFBWSxHQUFVLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksWUFBWSxHQUFVLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFEO0lBQ0ksSUFBSSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxjQUEyQixDQUFDLENBQUM7SUFDbEUsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUNwRCxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3BELFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDcEQsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUNwRCxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3BELFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDcEQsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsZ0JBQWdCO0FBQ2hCLElBQUksZUFBZSxHQUFPLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFEO0lBQ0ksSUFBSSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxpQkFBOEIsQ0FBQyxDQUFDO0lBQ3JFLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDaEMsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsZUFBZTtBQUNmLElBQUksY0FBYyxHQUFRLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksY0FBYyxHQUFRLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksY0FBYyxHQUFRLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksY0FBYyxHQUFRLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksY0FBYyxHQUFRLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksY0FBYyxHQUFRLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFEO0lBQ0ksSUFBSSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxnQkFBNkIsQ0FBQyxDQUFDO0lBQ3BFLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDdEQsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUN0RCxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3RELFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDdEQsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUN0RCxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDckIsQ0FBQztBQUVELGdCQUFnQjtBQUNoQixJQUFJLGVBQWUsR0FBTyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUxRDtJQUNJLElBQUksU0FBUyxHQUFHLElBQUksZ0JBQWdCLENBQUMsaUJBQThCLENBQUMsQ0FBQztJQUNyRSxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDckIsQ0FBQztBQUVELGVBQWU7QUFDZixJQUFJLGNBQWMsR0FBUSxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGNBQWMsR0FBUSxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGNBQWMsR0FBUSxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGNBQWMsR0FBUSxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUxRDtJQUNJLElBQUksU0FBUyxHQUFHLElBQUksZ0JBQWdCLENBQUMsZ0JBQTZCLENBQUMsQ0FBQztJQUNwRSxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQy9CLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDL0IsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMvQixTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQy9CLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDckIsQ0FBQztBQUVELGlCQUFpQjtBQUNqQixJQUFJLGdCQUFnQixHQUFNLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFEO0lBQ0ksSUFBSSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxrQkFBK0IsQ0FBQyxDQUFDO0lBQ3RFLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNqQyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxnQkFBZ0I7QUFDaEIsSUFBSSxlQUFlLEdBQU8sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxlQUFlLEdBQU8sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxlQUFlLEdBQU8sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxlQUFlLEdBQU8sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFMUQ7SUFDSSxJQUFJLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLGlCQUE4QixDQUFDLENBQUM7SUFDckUsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNoQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDaEMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNoQyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxXQUFXO0FBQ1gsSUFBSSxhQUFhLEdBQVMsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxhQUFhLEdBQVMsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxhQUFhLEdBQVMsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxhQUFhLEdBQVMsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFMUQ7SUFDSSxJQUFJLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLGVBQTRCLENBQUMsQ0FBQztJQUNuRSxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlCLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUIsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDckIsQ0FBQztBQUVELFdBQVc7QUFDWCxJQUFJLGFBQWEsR0FBUyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGFBQWEsR0FBUyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGFBQWEsR0FBUyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGFBQWEsR0FBUyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUxRDtJQUNJLElBQUksU0FBUyxHQUFHLElBQUksZ0JBQWdCLENBQUMsZUFBNEIsQ0FBQyxDQUFDO0lBQ25FLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUIsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlCLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUIsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsYUFBYTtBQUNiLElBQUksZUFBZSxHQUFPLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksZUFBZSxHQUFPLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksZUFBZSxHQUFPLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksZUFBZSxHQUFPLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFEO0lBQ0ksSUFBSSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxrQkFBOEIsQ0FBQyxDQUFDO0lBQ3JFLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDaEMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNoQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDaEMsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDOzs7QUN6VkQsMEJBQWtDLHVCQUF1QixDQUFDLENBQUE7QUFDMUQsNkNBQXdDLDBDQUEwQyxDQUFDLENBQUE7QUFDbkYsdUNBQXlELDBCQUEwQixDQUFDLENBQUE7QUFDcEYsK0JBQTRCLG1CQUFtQixDQUFDLENBQUE7QUFFaEQ7SUFZSSxpQkFBWSxLQUFhO1FBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLDZDQUFvQixFQUFFLENBQUM7UUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV6QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBRXRCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVELHVCQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELHNCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFFOUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsd0JBQU0sR0FBTixVQUFPLENBQVMsRUFBRSxDQUFTO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7O09BR0c7SUFDSCx3QkFBTSxHQUFOLFVBQU8sQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFhO1FBQTFDLGlCQWlCQztRQWhCRywrREFBK0Q7UUFDL0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakUsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQy9CLElBQUksSUFBSSxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztRQUVyQywwRkFBMEY7UUFDMUYscURBQXFEO1FBQ3JELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7YUFDaEQsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsSUFBSSxDQUFDO2FBQ3RCLFVBQVUsQ0FBQyxjQUFRLEtBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN0QyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFbEMsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVPLDBCQUFRLEdBQWhCLFVBQWlCLE9BQWU7UUFDNUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNMLENBQUM7SUFFTywwQkFBUSxHQUFoQjtRQUNJLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFFdEIsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSx3REFBeUIsQ0FDdkMsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUN6QixDQUFDO0lBQ04sQ0FBQztJQUVPLHdDQUFzQixHQUE5QjtRQUNJLDRDQUE0QztRQUM1QywrQkFBK0I7UUFDL0IsdUNBQXVDO1FBRXZDLGlFQUFpRTtRQUNqRSxJQUFJLGNBQWMsR0FBRyw4QkFBYSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RHLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFBQyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLG1EQUFtRDtRQUUzRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsY0FBMkIsQ0FBQyxDQUFDO1lBQ3BFLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsaUJBQThCLENBQUMsQ0FBQztZQUN2RSxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLGdCQUE2QixDQUFDLENBQUM7WUFDdEUsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksR0FBRyxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxnQkFBNkIsQ0FBQyxDQUFDO1lBQ3RFLENBQUM7UUFDTCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxlQUE0QixDQUFDLENBQUM7WUFDckUsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxrQkFBK0IsQ0FBQyxDQUFDO1lBQ3hFLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsaUJBQThCLENBQUMsQ0FBQztZQUN2RSxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLGlCQUE4QixDQUFDLENBQUM7WUFDdkUsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0wsY0FBQztBQUFELENBckhBLEFBcUhDLElBQUE7QUFySFksZUFBTyxVQXFIbkIsQ0FBQTs7O0FDM0hELCtCQUE0QixrQkFBa0IsQ0FBQyxDQUFBO0FBQy9DLHNCQUFvQixlQUFlLENBQUMsQ0FBQTtBQUNwQyw4QkFBMkIsMEJBQTBCLENBQUMsQ0FBQTtBQUN0RCw0QkFBMEIsd0JBQXdCLENBQUMsQ0FBQTtBQUNuRCxnQ0FBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUl6RDtJQVdJO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUvQixJQUFJLENBQUMsTUFBTSxHQUF1QixRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFaEYsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLDRCQUFZLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSx5QkFBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsYUFBZ0IsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSw0QkFBWSxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHlCQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFhLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsb0JBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLDRCQUFrQyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUFrQyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUzQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFZixhQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZCxnQ0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXZCLDhEQUE4RDtRQUM5RCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxtQkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixhQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXBCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVwQyxnQ0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU3QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLDhCQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVPLHNCQUFPLEdBQWY7UUFBQSxpQkEyQkM7UUExQkcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGdDQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFNUMsaUNBQWlDO1FBQ2pDLG9EQUFvRDtRQUVwRCxrQkFBa0I7UUFDbEIsSUFBSSxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTFCLDhCQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLHdDQUF3QztRQUNqRiw4QkFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWpELDhCQUFhLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7WUFDOUIsOEJBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0wsV0FBQztBQUFELENBaEZBLEFBZ0ZDLElBQUE7QUFDWSxZQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzs7O0FDekYvQjtJQU1JO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVsQyxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsc0JBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQscUJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsRUFBRTtJQUNOLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0F2QkEsQUF1QkMsSUFBQTtBQUNZLGNBQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDOzs7QUN4Qm5DLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLElBQU0sV0FBVyxHQUFPLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3JDLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQztBQUU5QjtJQU9JO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVsQyxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLHdDQUF3QztRQUM3RixJQUFJLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7UUFDeEQsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDM0IsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQztJQUMvQixDQUFDO0lBRUQsbUJBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxrQkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUM7UUFDL0IsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsR0FBRyxHQUFHLGNBQWMsQ0FBQztRQUM5QixDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ssNkJBQWUsR0FBdkI7UUFDSSxJQUFJLElBQUksR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzQixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkQsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkMsR0FBRyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDekIsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1gsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ0wsVUFBQztBQUFELENBdkRBLEFBdURDLElBQUE7QUFDWSxXQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7O0FDNUQ3QixvQkFBa0IsT0FBTyxDQUFDLENBQUE7QUFDMUIsdUJBQXFCLFVBQVUsQ0FBQyxDQUFBO0FBRWhDO0lBSUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFFRCxxQkFBSyxHQUFMO1FBQ0ksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU3QixTQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWixlQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVELG9CQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLFNBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEIsZUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBQ0wsWUFBQztBQUFELENBcEJBLEFBb0JDLElBQUE7QUFDWSxhQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge2lucHV0LCBLZXl9IGZyb20gJy4vaW5wdXQnO1xyXG5pbXBvcnQge2V2ZW50QnVzfSBmcm9tICcuLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50RXZlbnR9IGZyb20gJy4uL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudCc7XHJcblxyXG4vLyBUT0RPOiBIZXJlIGRldGVybWluZSBpZiBwbGF5ZXIgaXMgaG9sZGluZyBkb3duIG9uZSBvZiB0aGUgYXJyb3cga2V5czsgaWYgc28sIGZpcmUgcmFwaWQgZXZlbnRzIGFmdGVyIChUQkQpIGFtb3VudCBvZiB0aW1lLlxyXG5cclxuY2xhc3MgQ29udHJvbGxlciB7XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgaW5wdXQuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LlVwKSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LlJvdGF0ZUNsb2Nrd2lzZSwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuTGVmdCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5MZWZ0LCBQbGF5ZXJUeXBlLkh1bWFuKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5SaWdodCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5SaWdodCwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuRG93bikpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Eb3duLCBQbGF5ZXJUeXBlLkh1bWFuKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5TcGFjZSkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Ecm9wLCBQbGF5ZXJUeXBlLkh1bWFuKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBjb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5leHBvcnQgY29uc3QgZW51bSBLZXkge1xyXG4gICAgTGVmdCxcclxuICAgIFVwLFxyXG4gICAgRG93bixcclxuICAgIFJpZ2h0LFxyXG4gICAgU3BhY2UsXHJcbiAgICBQYXVzZSxcclxuICAgIE90aGVyXHJcbn1cclxuXHJcbmNvbnN0IGVudW0gU3RhdGUge1xyXG4gICAgRG93bixcclxuICAgIFVwLFxyXG4gICAgSGFuZGxpbmdcclxufVxyXG5cclxuY2xhc3MgSW5wdXQge1xyXG4gICAgcHJpdmF0ZSBrZXlTdGF0ZTogTWFwPEtleSxTdGF0ZT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5rZXlTdGF0ZSA9IG5ldyBNYXA8S2V5LFN0YXRlPigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRUb1N0YXRlKGV2ZW50LCBTdGF0ZS5Eb3duKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFRvU3RhdGUoZXZlbnQsIFN0YXRlLlVwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBpZiBnaXZlbiBrZXkgaXMgJ0Rvd24nLlxyXG4gICAgICovXHJcbiAgICBpc0Rvd24oa2V5OiBLZXkpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5rZXlTdGF0ZS5nZXQoa2V5KSA9PT0gU3RhdGUuRG93bjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBpZiBnaXZlbiBrZXkgaXMgJ2Rvd24nLiBBbHNvIHNldHMgdGhlIGtleSBmcm9tICdEb3duJyB0byAnSGFuZGxpbmcnLlxyXG4gICAgICovXHJcbiAgICBpc0Rvd25BbmRVbmhhbmRsZWQoa2V5OiBLZXkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0Rvd24oa2V5KSkge1xyXG4gICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIFN0YXRlLkhhbmRsaW5nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBUT0RPOiBUaGlzIHdhc24ndCBzZXQgaW4gbWF6aW5nOyBuZWVkIHRvIHNlZSB3aHkuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBpZiBhbnkga2V5IGlzICdkb3duJy4gQWxzbyBzZXQgYWxsICdEb3duJyBrZXlzIHRvICdIYW5kbGluZycuXHJcbiAgICAgKi9cclxuICAgIGlzQW55S2V5RG93bkFuZFVuaGFuZGxlZCgpIHtcclxuICAgICAgICBsZXQgYW55S2V5RG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMua2V5U3RhdGUuZm9yRWFjaCgoc3RhdGU6IFN0YXRlLCBrZXk6IEtleSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IFN0YXRlLkRvd24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5U3RhdGUuc2V0KGtleSwgU3RhdGUuSGFuZGxpbmcpO1xyXG4gICAgICAgICAgICAgICAgYW55S2V5RG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gYW55S2V5RG93bjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGV2ZW50VG9TdGF0ZShldmVudDogS2V5Ym9hcmRFdmVudCwgc3RhdGU6IFN0YXRlKSB7XHJcbiAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEaXJlY3Rpb25hbHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA2NTogLy8gJ2EnXHJcbiAgICAgICAgICAgIGNhc2UgMzc6IC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LkxlZnQsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4NzogLy8gJ3cnXHJcbiAgICAgICAgICAgIGNhc2UgMzg6IC8vIHVwXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5VcCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKSAtIGNvbW1lbnRlZCBmb3IgaWYgdGhlIHVzZXIgd2FudHMgdG8gY21kK3cgb3IgY3RybCt3XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2ODogLy8gJ2QnXHJcbiAgICAgICAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5SaWdodCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDgzOiAvLyAncydcclxuICAgICAgICAgICAgY2FzZSA0MDogLy8gZG93blxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuRG93biwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDMyOiAvLyBzcGFjZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuU3BhY2UsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFBhdXNlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDgwOiAvLyAncCdcclxuICAgICAgICAgICAgY2FzZSAyNzogLy8gZXNjXHJcbiAgICAgICAgICAgIGNhc2UgMTM6IC8vIGVudGVyIGtleVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuUGF1c2UsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFRPRE86IE1heWJlIGFkZCBhIGRlYnVnIGtleSBoZXJlICgnZicpXHJcblxyXG4gICAgICAgICAgICAvLyBJZ25vcmUgY2VydGFpbiBrZXlzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA4MjogICAgLy8gJ3InXHJcbiAgICAgICAgICAgIGNhc2UgMTg6ICAgIC8vIGFsdFxyXG4gICAgICAgICAgICBjYXNlIDIyNDogICAvLyBhcHBsZSBjb21tYW5kIChmaXJlZm94KVxyXG4gICAgICAgICAgICBjYXNlIDE3OiAgICAvLyBhcHBsZSBjb21tYW5kIChvcGVyYSlcclxuICAgICAgICAgICAgY2FzZSA5MTogICAgLy8gYXBwbGUgY29tbWFuZCwgbGVmdCAoc2FmYXJpL2Nocm9tZSlcclxuICAgICAgICAgICAgY2FzZSA5MzogICAgLy8gYXBwbGUgY29tbWFuZCwgcmlnaHQgKHNhZmFyaS9jaHJvbWUpXHJcbiAgICAgICAgICAgIGNhc2UgODQ6ICAgIC8vICd0JyAoaS5lLiwgb3BlbiBhIG5ldyB0YWIpXHJcbiAgICAgICAgICAgIGNhc2UgNzg6ICAgIC8vICduJyAoaS5lLiwgb3BlbiBhIG5ldyB3aW5kb3cpXHJcbiAgICAgICAgICAgIGNhc2UgMjE5OiAgIC8vIGxlZnQgYnJhY2tldHNcclxuICAgICAgICAgICAgY2FzZSAyMjE6ICAgLy8gcmlnaHQgYnJhY2tldHNcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gUHJldmVudCBzb21lIHVud2FudGVkIGJlaGF2aW9ycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgMTkxOiAgIC8vIGZvcndhcmQgc2xhc2ggKHBhZ2UgZmluZClcclxuICAgICAgICAgICAgY2FzZSA5OiAgICAgLy8gdGFiIChjYW4gbG9zZSBmb2N1cylcclxuICAgICAgICAgICAgY2FzZSAxNjogICAgLy8gc2hpZnRcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIEFsbCBvdGhlciBrZXlzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuT3RoZXIsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFN0YXRlKGtleTogS2V5LCBzdGF0ZTogU3RhdGUpIHtcclxuICAgICAgICAvLyBBbHdheXMgc2V0ICd1cCdcclxuICAgICAgICBpZiAoc3RhdGUgPT09IFN0YXRlLlVwKSB7XHJcbiAgICAgICAgICAgIHRoaXMua2V5U3RhdGUuc2V0KGtleSwgc3RhdGUpO1xyXG4gICAgICAgIC8vIE9ubHkgc2V0ICdkb3duJyBpZiBpdCBpcyBub3QgYWxyZWFkeSBoYW5kbGVkXHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gU3RhdGUuRG93bikge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5rZXlTdGF0ZS5nZXQoa2V5KSAhPT0gU3RhdGUuSGFuZGxpbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5U3RhdGUuc2V0KGtleSwgc3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgaW5wdXQgPSBuZXcgSW5wdXQoKTsiLCJpbXBvcnQge0NvbG9yfSBmcm9tICcuL2NvbG9yJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDZWxsIHtcclxuICAgIHByaXZhdGUgY29sb3I6IENvbG9yO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBDb2xvci5FbXB0eTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xvcihjb2xvcjogQ29sb3IpIHtcclxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sb3IoKTogQ29sb3Ige1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogT2Zmc2V0IGNhbGN1bGF0ZWQgZnJvbSB0b3AtbGVmdCBjb3JuZXIgYmVpbmcgMCwgMC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDZWxsT2Zmc2V0IHtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxufSIsImV4cG9ydCBlbnVtIFBsYXllck1vdmVtZW50IHtcclxuICAgIE5vbmUsXHJcbiAgICBMZWZ0LFxyXG4gICAgUmlnaHQsXHJcbiAgICBEb3duLFxyXG4gICAgRHJvcCxcclxuICAgIFJvdGF0ZUNsb2Nrd2lzZSxcclxuICAgIFJvdGF0ZUNvdW50ZXJDbG9ja3dpc2VcclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U2hhcGV9IGZyb20gJy4uL21vZGVsL2JvYXJkL3NoYXBlJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgc2hhcGU6IFNoYXBlO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuICAgIHJlYWRvbmx5IHN0YXJ0aW5nOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNoYXBlOiBTaGFwZSwgcGxheWVyVHlwZTogUGxheWVyVHlwZSwgc3RhcnRpbmc6IGJvb2xlYW4pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgICAgIHRoaXMuc3RhcnRpbmcgPSBzdGFydGluZztcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJvYXJkRmlsbGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkJvYXJkRmlsbGVkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtDZWxsfSBmcm9tICcuLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDZWxsQ2hhbmdlRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuICAgIHJlYWRvbmx5IGNlbGw6IENlbGw7XHJcbiAgICByZWFkb25seSByb3c6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IGNvbDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjZWxsOiBDZWxsLCByb3c6IG51bWJlciwgY29sOiBudW1iZXIsIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuY2VsbCA9IGNlbGw7XHJcbiAgICAgICAgdGhpcy5yb3cgPSByb3c7XHJcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQ2VsbENoYW5nZUV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImV4cG9ydCBlbnVtIEV2ZW50VHlwZSB7XHJcbiAgICBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGUsXHJcbiAgICBBY3RpdmVTaGFwZUVuZGVkRXZlbnRUeXBlLFxyXG4gICAgQm9hcmRGaWxsZWRFdmVudFR5cGUsXHJcbiAgICBDZWxsQ2hhbmdlRXZlbnRUeXBlLFxyXG4gICAgSHBDaGFuZ2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjUGxhY2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjU3RhdGVDaGFnZWRFdmVudFR5cGUsXHJcbiAgICBQbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZSxcclxuICAgIFJvd3NGaWxsZWRFdmVudFR5cGUsXHJcbiAgICBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZVxyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBhYnN0cmFjdCBnZXRUeXBlKCk6RXZlbnRUeXBlXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnRIYW5kbGVyPFQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50PiB7XHJcbiAgICAoZXZlbnQ6IFQpOnZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudEJ1cyB7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVyc0J5VHlwZTpNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVyc0J5VHlwZSA9IG5ldyBNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT4oKTtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3Rlcih0eXBlOkV2ZW50VHlwZSwgaGFuZGxlcjpFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD4pIHtcclxuICAgICAgICBpZiAoIXR5cGUpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaGFuZGxlcnM6RXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+W10gPSB0aGlzLmhhbmRsZXJzQnlUeXBlLmdldCh0eXBlKTtcclxuICAgICAgICBpZiAoaGFuZGxlcnMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZXJzQnlUeXBlLnNldCh0eXBlLCBoYW5kbGVycyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFJldHVybiBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGNhbGxlZCB0byB1bnJlZ2lzdGVyIHRoZSBoYW5kbGVyXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFRPRE86IHVucmVnaXN0ZXIoKS4gQW5kIHJlbW92ZSB0aGUgbWFwIGtleSBpZiB6ZXJvIGhhbmRsZXJzIGxlZnQgZm9yIGl0LlxyXG4gICAgXHJcbiAgICAvLyBUT0RPOiBQcmV2ZW50IGluZmluaXRlIGZpcmUoKT9cclxuICAgIGZpcmUoZXZlbnQ6QWJzdHJhY3RFdmVudCkge1xyXG4gICAgICAgIGxldCBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnNCeVR5cGUuZ2V0KGV2ZW50LmdldFR5cGUoKSk7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiBoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGV2ZW50QnVzID0gbmV3IEV2ZW50QnVzKCk7XHJcbmV4cG9ydCBjb25zdCBkZWFkRXZlbnRCdXMgPSBuZXcgRXZlbnRCdXMoKTsgLy8gVXNlZCBieSBBSS5cclxuIiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEhwQ2hhbmdlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgaHA6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoaHA6IG51bWJlciwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ocCA9IGhwO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkhwQ2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5OcGNNb3ZlbWVudENoYW5nZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge05wY1N0YXRlfSBmcm9tICcuLi9kb21haW4vbnBjLXN0YXRlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGNQbGFjZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBzdGF0ZTogTnBjU3RhdGU7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXJcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCBzdGF0ZTogTnBjU3RhdGUsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuTnBjUGxhY2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXJNb3ZlbWVudEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbW92ZW1lbnQ6IFBsYXllck1vdmVtZW50O1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb3ZlbWVudDogUGxheWVyTW92ZW1lbnQsIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnQgPSBtb3ZlbWVudDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5QbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBSb3dzRmlsbGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgdG90YWxGaWxsZWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IodG90YWxGaWxsZWQ6IG51bWJlciwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy50b3RhbEZpbGxlZCA9IHRvdGFsRmlsbGVkO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLlJvd3NGaWxsZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgejogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIsIHg6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnogPSB6O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5TdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImV4cG9ydCBjb25zdCBlbnVtIEdhbWVTdGF0ZVR5cGUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBzdGF0ZSByaWdodCB3aGVuIEphdmFTY3JpcHQgc3RhcnRzIHJ1bm5pbmcuIEluY2x1ZGVzIHByZWxvYWRpbmcuXHJcbiAgICAgKi9cclxuICAgIEluaXRpYWxpemluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFmdGVyIHByZWxvYWQgaXMgY29tcGxldGUgYW5kIGJlZm9yZSBtYWtpbmcgb2JqZWN0IHN0YXJ0KCkgY2FsbHMuXHJcbiAgICAgKi9cclxuICAgIFN0YXJ0aW5nLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyBhZnRlciBpbml0aWFsIG9iamVjdHMgc3RhcnQoKSBhbmQgbGlrZWx5IHdoZXJlIHRoZSBnYW1lIGlzIHdhaXRpbmcgb24gdGhlIHBsYXllcidzIGZpcnN0IGlucHV0LlxyXG4gICAgICovXHJcbiAgICBTdGFydGVkLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUgbWFpbiBnYW1lIGxvb3Agb2YgY29udHJvbGxpbmcgcGllY2VzLlxyXG4gICAgICovXHJcbiAgICBQbGF5aW5nLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5kIG9mIGdhbWUsIHNjb3JlIGlzIHNob3dpbmcsIG5vdGhpbmcgbGVmdCB0byBkby5cclxuICAgICAqL1xyXG4gICAgRW5kZWRcclxufVxyXG5cclxuY2xhc3MgR2FtZVN0YXRlIHtcclxuICAgIHByaXZhdGUgY3VycmVudDogR2FtZVN0YXRlVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBHYW1lU3RhdGVUeXBlLkluaXRpYWxpemluZzsgLy8gRGVmYXVsdCBzdGF0ZS5cclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50KCk6IEdhbWVTdGF0ZVR5cGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q3VycmVudChjdXJyZW50OiBHYW1lU3RhdGVUeXBlKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gY3VycmVudDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZ2FtZVN0YXRlID0gbmV3IEdhbWVTdGF0ZSgpOyIsImltcG9ydCB7cHJlbG9hZGVyfSBmcm9tICcuL3ByZWxvYWRlcic7XHJcbmltcG9ydCB7bW9kZWx9IGZyb20gJy4vbW9kZWwvbW9kZWwnO1xyXG5pbXBvcnQge3ZpZXd9IGZyb20gJy4vdmlldy92aWV3JztcclxuaW1wb3J0IHtjb250cm9sbGVyfSBmcm9tICcuL2NvbnRyb2xsZXIvY29udHJvbGxlcic7XHJcbmltcG9ydCB7R2FtZVN0YXRlVHlwZSwgZ2FtZVN0YXRlfSBmcm9tICcuL2dhbWUtc3RhdGUnO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIChldmVudDogYW55KSA9PiB7XHJcbiAgICBnYW1lU3RhdGUuc2V0Q3VycmVudChHYW1lU3RhdGVUeXBlLkluaXRpYWxpemluZyk7XHJcbiAgICBwcmVsb2FkZXIucHJlbG9hZChtYWluKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBtYWluKCkge1xyXG5cclxuICAgIC8vIFN0YXJ0dXAgaW4gcmV2ZXJzZSBNVkMgb3JkZXIgdG8gZW5zdXJlIHRoYXQgZXZlbnQgYnVzIGhhbmRsZXJzIGluIHRoZVxyXG4gICAgLy8gY29udHJvbGxlciBhbmQgdmlldyByZWNlaXZlIChhbnkpIHN0YXJ0IGV2ZW50cyBmcm9tIG1vZGVsLnN0YXJ0KCkuXHJcbiAgICBjb250cm9sbGVyLnN0YXJ0KCk7XHJcbiAgICB2aWV3LnN0YXJ0KCk7XHJcbiAgICBtb2RlbC5zdGFydCgpO1xyXG4gICAgXHJcbiAgICBnYW1lU3RhdGUuc2V0Q3VycmVudChHYW1lU3RhdGVUeXBlLlN0YXJ0ZWQpO1xyXG5cclxuICAgIGxldCBzdGVwID0gKCkgPT4ge1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcclxuXHJcbiAgICAgICAgbGV0IGVsYXBzZWQgPSBjYWxjdWxhdGVFbGFwc2VkKCk7XHJcbiAgICAgICAgY29udHJvbGxlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHZpZXcuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBtb2RlbC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfTtcclxuICAgIHN0ZXAoKTtcclxufVxyXG5cclxubGV0IGxhc3RTdGVwID0gRGF0ZS5ub3coKTtcclxuZnVuY3Rpb24gY2FsY3VsYXRlRWxhcHNlZCgpIHtcclxuICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSBsYXN0U3RlcDtcclxuICAgIGlmIChlbGFwc2VkID4gMTAwKSB7XHJcbiAgICAgICAgZWxhcHNlZCA9IDEwMDsgLy8gZW5mb3JjZSBzcGVlZCBsaW1pdFxyXG4gICAgfVxyXG4gICAgbGFzdFN0ZXAgPSBub3c7XHJcbiAgICByZXR1cm4gZWxhcHNlZDtcclxufSIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4uL2JvYXJkL3NoYXBlJztcclxuaW1wb3J0IHtNQVhfQ09MU30gZnJvbSAnLi4vYm9hcmQvYm9hcmQnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtldmVudEJ1cywgRXZlbnRUeXBlfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50RXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudCc7XHJcblxyXG5jb25zdCBUSU1FX0JFVFdFRU5fTU9WRVMgPSAyNTA7XHJcbmNvbnN0IFRJTUVfTUFYX0RFVklBVElPTiA9IDEwMDtcclxuXHJcbmludGVyZmFjZSBab21iaWVCb2FyZCB7XHJcbiAgICAvLyBXYXlzIHRvIGludGVyYWN0IHdpdGggaXQuXHJcbiAgICBtb3ZlU2hhcGVMZWZ0KCk6IGJvb2xlYW47XHJcbiAgICBtb3ZlU2hhcGVSaWdodCgpOiBib29sZWFuO1xyXG4gICAgbW92ZVNoYXBlRG93bigpOiBib29sZWFuO1xyXG4gICAgbW92ZVNoYXBlRG93bkFsbFRoZVdheSgpOiB2b2lkO1xyXG4gICAgbW92ZVRvVG9wKCk6IHZvaWQ7XHJcbiAgICByb3RhdGVTaGFwZUNsb2Nrd2lzZSgpOiBib29sZWFuO1xyXG4gICAgY29udmVydFNoYXBlVG9DZWxscygpOiB2b2lkO1xyXG4gICAgdW5kb0NvbnZlcnRTaGFwZVRvQ2VsbHMoKTogdm9pZDtcclxuXHJcbiAgICAvLyBXYXlzIHRvIGRlcml2ZSBpbmZvcm1hdGlvbiBmcm9tIGl0LlxyXG4gICAgZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCk6IG51bWJlcjtcclxuICAgIGNhbGN1bGF0ZUFnZ3JlZ2F0ZUhlaWdodCgpOiBudW1iZXI7XHJcbiAgICBjYWxjdWxhdGVDb21wbGV0ZUxpbmVzKCk6IG51bWJlcjtcclxuICAgIGNhbGN1bGF0ZUhvbGVzKCk6IG51bWJlcjtcclxuICAgIGNhbGN1bGF0ZUJ1bXBpbmVzcygpOiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBSZWFsQm9hcmQgZXh0ZW5kcyBab21iaWVCb2FyZCB7XHJcbiAgICBjbG9uZVpvbWJpZSgpOiBab21iaWVCb2FyZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEFpIHtcclxuXHJcbiAgICBwcml2YXRlIHJlYWxCb2FyZDogUmVhbEJvYXJkO1xyXG4gICAgcHJpdmF0ZSB0aW1lVW50aWxOZXh0TW92ZTogbnVtYmVyO1xyXG5cclxuICAgIC8vIDAgPSBubyByb3RhdGlvbiwgMSA9IG9uZSByb3RhdGlvbiwgMiA9IHR3byByb3RhdGlvbnMsIDMgPSB0aHJlZSByb3RhdGlvbnMuXHJcbiAgICBwcml2YXRlIHRhcmdldFJvdGF0aW9uOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRSb3RhdGlvbjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB0YXJnZXRDb2xJZHg6IG51bWJlcjtcclxuICAgIC8vIFByZXZlbnQgQUkgZnJvbSBkb2luZyBhbnl0aGluZyB3aGlsZSB0aGUgcGllY2UgaXMgd2FpdGluZyB0byBcImxvY2tcIiBpbnRvIHRoZSBtYXRyaXguXHJcbiAgICBwcml2YXRlIG1vdmVDb21wbGV0ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IocmVhbEJvYXJkOiBSZWFsQm9hcmQpIHtcclxuICAgICAgICB0aGlzLnJlYWxCb2FyZCA9IHJlYWxCb2FyZDtcclxuICAgICAgICB0aGlzLnRpbWVVbnRpbE5leHRNb3ZlID0gVElNRV9CRVRXRUVOX01PVkVTO1xyXG5cclxuICAgICAgICB0aGlzLnRhcmdldFJvdGF0aW9uID0gMDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy50YXJnZXRDb2xJZHggPSAwO1xyXG4gICAgICAgIHRoaXMubW92ZUNvbXBsZXRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnRpbWVVbnRpbE5leHRNb3ZlIC09IGVsYXBzZWQ7XHJcbiAgICAgICAgaWYgKHRoaXMudGltZVVudGlsTmV4dE1vdmUgPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVVbnRpbE5leHRNb3ZlID0gVElNRV9CRVRXRUVOX01PVkVTO1xyXG4gICAgICAgICAgICB0aGlzLmFkdmFuY2VUb3dhcmRzVGFyZ2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBtZXRob2QgcHJvdmlkZXMgYSBoaWdoLWxldmVsIHZpZXcgb2YgdGhlIEFJJ3MgdGhvdWdodCBwcm9jZXNzLlxyXG4gICAgICovXHJcbiAgICBzdHJhdGVnaXplKCkge1xyXG4gICAgICAgIGxldCB6b21iaWUgPSB0aGlzLnJlYWxCb2FyZC5jbG9uZVpvbWJpZSgpO1xyXG5cclxuICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggYWxsIHBvc3NpYmxlIHJvdGF0aW9ucyBhbmQgY29sdW1uc1xyXG4gICAgICAgIGxldCBiZXN0Rml0bmVzcyA9IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSO1xyXG4gICAgICAgIGxldCBiZXN0Um90YXRpb24gPSAwO1xyXG4gICAgICAgIGxldCBiZXN0Q29sSWR4ID0gMDtcclxuICAgICAgICBmb3IgKGxldCByb3RhdGlvbiA9IDA7IHJvdGF0aW9uIDwgNDsgcm90YXRpb24rKykge1xyXG4gICAgICAgICAgICB3aGlsZSh6b21iaWUubW92ZVNoYXBlTGVmdCgpKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IE1BWF9DT0xTOyBpZHgrKykge1xyXG4gICAgICAgICAgICAgICAgem9tYmllLm1vdmVTaGFwZURvd25BbGxUaGVXYXkoKTtcclxuICAgICAgICAgICAgICAgIHpvbWJpZS5jb252ZXJ0U2hhcGVUb0NlbGxzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGZpdG5lc3MgPSB0aGlzLmNhbGN1bGF0ZUZpdG5lc3Moem9tYmllKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdmaXRuZXNzOiAnICsgZml0bmVzcyArICcsIHJvdGF0aW9uOiAnICsgcm90YXRpb24gKyAnLCBjb2w6ICcgKyBjb2xJZHgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpdG5lc3MgPiBiZXN0Rml0bmVzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RGaXRuZXNzID0gZml0bmVzcztcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Um90YXRpb24gPSByb3RhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Q29sSWR4ID0gem9tYmllLmdldEN1cnJlbnRTaGFwZUNvbElkeCgpOyAvLyBVc2UgdGhpcyByYXRoZXIgdGhhbiBpZHggaW4gY2FzZSBpdCB3YXMgb2ZmIGJlY2F1c2Ugb2Ygd2hhdGV2ZXIgcmVhc29uIChvYnN0cnVjdGlvbiwgd2FsbCwgZXRjLi4uKVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHpvbWJpZS51bmRvQ29udmVydFNoYXBlVG9DZWxscygpO1xyXG4gICAgICAgICAgICAgICAgem9tYmllLm1vdmVUb1RvcCgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNhbk1vdmVSaWdodCA9IHpvbWJpZS5tb3ZlU2hhcGVSaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbk1vdmVSaWdodCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB6b21iaWUucm90YXRlU2hhcGVDbG9ja3dpc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2Jlc3RGaXRuZXNzOiAlZiwgJWQsICVkJywgYmVzdEZpdG5lc3MsIGJlc3RSb3RhdGlvbiwgYmVzdENvbElkeCk7XHJcblxyXG4gICAgICAgIC8vIEZpbmFsbHksIHNldCB0aGUgdmFsdWVzIHRoYXQgd2lsbCBsZXQgdGhlIEFJIGFkdmFuY2UgdG93YXJkcyB0aGUgdGFyZ2V0LlxyXG4gICAgICAgIHRoaXMudGFyZ2V0Um90YXRpb24gPSBiZXN0Um90YXRpb247XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um90YXRpb24gPSAwO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0Q29sSWR4ID0gYmVzdENvbElkeDtcclxuICAgICAgICB0aGlzLm1vdmVDb21wbGV0ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJhc2VkIG9uIGh0dHBzOi8vY29kZW15cm9hZC53b3JkcHJlc3MuY29tLzIwMTMvMDQvMTQvdGV0cmlzLWFpLXRoZS1uZWFyLXBlcmZlY3QtcGxheWVyL1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZUZpdG5lc3Moem9tYmllOiBab21iaWVCb2FyZCkge1xyXG4gICAgICAgIGxldCBhZ2dyZWdhdGVIZWlnaHQgPSB6b21iaWUuY2FsY3VsYXRlQWdncmVnYXRlSGVpZ2h0KCk7XHJcbiAgICAgICAgbGV0IGNvbXBsZXRlTGluZXMgPSB6b21iaWUuY2FsY3VsYXRlQ29tcGxldGVMaW5lcygpO1xyXG4gICAgICAgIGxldCBob2xlcyA9IHpvbWJpZS5jYWxjdWxhdGVIb2xlcygpO1xyXG4gICAgICAgIGxldCBidW1waW5lc3MgPSB6b21iaWUuY2FsY3VsYXRlQnVtcGluZXNzKCk7XHJcbiAgICAgICAgbGV0IGZpdG5lc3MgPSAoLTAuNTEwMDY2ICogYWdncmVnYXRlSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgICsgKCAwLjc2MDY2NiAqIGNvbXBsZXRlTGluZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgKyAoLTAuMzU2NjMgICogaG9sZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgKyAoLTAuMTg0NDgzICogYnVtcGluZXNzKTtcclxuICAgICAgICByZXR1cm4gZml0bmVzcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkdmFuY2VUb3dhcmRzVGFyZ2V0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLm1vdmVDb21wbGV0ZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdGF0aW9uID09PSB0aGlzLnRhcmdldFJvdGF0aW9uICYmIHRoaXMucmVhbEJvYXJkLmdldEN1cnJlbnRTaGFwZUNvbElkeCgpID09PSB0aGlzLnRhcmdldENvbElkeCkge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBEcm9wIHNoYXBlIHNob3VsZCBiZSBvbiBhIHRpbWVyIG9yIHNvbWV0aGluZy5cclxuICAgICAgICAgICAgdGhpcy5yZWFsQm9hcmQubW92ZVNoYXBlRG93bkFsbFRoZVdheSgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Q29sSWR4ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ29tcGxldGVkID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50Um90YXRpb24gPCB0aGlzLnRhcmdldFJvdGF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5yb3RhdGVTaGFwZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Um90YXRpb24rKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucmVhbEJvYXJkLmdldEN1cnJlbnRTaGFwZUNvbElkeCgpIDwgdGhpcy50YXJnZXRDb2xJZHgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhbEJvYXJkLm1vdmVTaGFwZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5yZWFsQm9hcmQuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCkgPiB0aGlzLnRhcmdldENvbElkeCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFsQm9hcmQubW92ZVNoYXBlTGVmdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHByaXZhdGUgcGVyZm9ybU5ld01vdmVtZW50KCkge1xyXG4gICAgICAgIC8vIGxldCBtYXRyaXggPSB0aGlzLnZpc3VhbC5tYXRyaXg7XHJcbiAgICAgICAgLy8gbGV0IHNoYXBlID0gdGhpcy52aXN1YWwuY3VycmVudFNoYXBlO1xyXG5cclxuICAgICAgICAvLyBsZXQgcmFuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUpO1xyXG5cclxuICAgICAgICAvLyBpZiAocmFuZCA9PT0gMCkge1xyXG4gICAgICAgIC8vICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LlJvdGF0ZUNsb2Nrd2lzZSwgUGxheWVyVHlwZS5BaSkpO1xyXG4gICAgICAgIC8vIH0gZWxzZSBpZiAocmFuZCA9PT0gMSkge1xyXG4gICAgICAgIC8vICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkxlZnQsIFBsYXllclR5cGUuQWkpKTtcclxuICAgICAgICAvLyB9IGVsc2UgaWYgKHJhbmQgPT09IDIpIHtcclxuICAgICAgICAvLyAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5SaWdodCwgUGxheWVyVHlwZS5BaSkpO1xyXG4gICAgICAgIC8vIH0gZWxzZSBpZiAocmFuZCA9PT0gMykge1xyXG4gICAgICAgIC8vICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkRvd24sIFBsYXllclR5cGUuQWkpKTtcclxuICAgICAgICAvLyB9IGVsc2UgaWYgKHJhbmQgPT09IDQpIHtcclxuICAgICAgICAvLyAgICAgbGV0IGRyb3BDaGFuY2UgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApOyAvLyBJcyB0aGlzIGNhbGxlZCBNb250ZS1DYXJsbz9cclxuICAgICAgICAvLyAgICAgaWYgKGRyb3BDaGFuY2UgPCAxMCkge1xyXG4gICAgICAgIC8vICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Ecm9wLCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gICAgICAgICAvLyBEbyBub3RoaW5nIHRoaXMgcm91bmQ7IG1heWJlIGNvbnNpZGVyZWQgYSBoZXNpdGF0aW9uLlxyXG4gICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ3Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgICAgICAvLyB9XHJcbiAgICAvLyB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVUaW1lVW50aWxOZXh0TW92ZSgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihUSU1FX0JFVFdFRU5fTU9WRVMgKyAoKE1hdGgucmFuZG9tKCkgKiBUSU1FX01BWF9ERVZJQVRJT04pIC0gKFRJTUVfTUFYX0RFVklBVElPTiAvIDIpKSk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge1NoYXBlfSBmcm9tICcuL3NoYXBlJztcclxuaW1wb3J0IHtDZWxsfSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtTaGFwZUZhY3RvcnksIGRlYWRTaGFwZUZhY3Rvcnl9IGZyb20gJy4vc2hhcGUtZmFjdG9yeSc7XHJcbmltcG9ydCB7RXZlbnRCdXMsIGRlYWRFdmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtDZWxsQ2hhbmdlRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2NlbGwtY2hhbmdlLWV2ZW50JztcclxuaW1wb3J0IHtSb3dzRmlsbGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3Jvd3MtZmlsbGVkLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge0JvYXJkRmlsbGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2JvYXJkLWZpbGxlZC1ldmVudCc7XHJcblxyXG5jb25zdCBNQVhfUk9XUyA9IDE5OyAvLyBUb3AgMiByb3dzIGFyZSBvYnN0cnVjdGVkIGZyb20gdmlldy4gQWxzbywgc2VlIGxpZ2h0aW5nLWdyaWQudHMuXHJcbmV4cG9ydCBjb25zdCBNQVhfQ09MUyA9IDEwO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJvYXJkIHtcclxuICAgIHByaXZhdGUgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuICAgIHByaXZhdGUgc2hhcGVGYWN0b3J5OiBTaGFwZUZhY3Rvcnk7XHJcbiAgICBwcml2YXRlIGV2ZW50QnVzOiBFdmVudEJ1cztcclxuXHJcbiAgICBjdXJyZW50U2hhcGU6IFNoYXBlO1xyXG4gICAgcmVhZG9ubHkgbWF0cml4OiBDZWxsW11bXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlLCBzaGFwZUZhY3Rvcnk6IFNoYXBlRmFjdG9yeSwgZXZlbnRCdXM6IEV2ZW50QnVzKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgICAgICB0aGlzLnNoYXBlRmFjdG9yeSA9IHNoYXBlRmFjdG9yeTtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzID0gZXZlbnRCdXM7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1hdHJpeCA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IE1BWF9ST1dTOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFtyb3dJZHhdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zaGFwZUZhY3RvcnkgPSBuZXcgU2hhcGVGYWN0b3J5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBnaXZlcyBhIGhpZ2ggbGV2ZWwgdmlldyBvZiB0aGUgbWFpbiBnYW1lIGxvb3AuXHJcbiAgICAgKiBUaGlzIHNob3VsZG4ndCBiZSBjYWxsZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBzdGVwKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnRyeUdyYXZpdHkoKSkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVTaGFwZURvd24oKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnZlcnRTaGFwZVRvQ2VsbHMoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNCb2FyZEZ1bGwoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaWduYWxGdWxsQm9hcmQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVzZXRCb2FyZCgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVBbnlGaWxsZWRMaW5lcygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydFNoYXBlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldEJvYXJkKCkge1xyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnN0YXJ0U2hhcGUodHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNoYXBlLmdldENvbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZUxlZnQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZUxlZnQoKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVSaWdodCgpO1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZVJpZ2h0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzdWNjZXNzOiBib29sZWFuO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVSaWdodCgpO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZUxlZnQoKTtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVEb3duKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzdWNjZXNzOiBib29sZWFuO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVEb3duKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCkge1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICB9IHdoaWxlICghdGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIG1vdmVUb1RvcCgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVG9Ub3AoKTsgXHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlU2hhcGVDbG9ja3dpc2UoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUucm90YXRlQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5yb3RhdGVDb3VudGVyQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkSnVua1Jvd3MobnVtYmVyT2ZSb3dzVG9BZGQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIENsZWFyIHJvd3MgYXQgdGhlIHRvcCB0byBtYWtlIHJvb20gYXQgdGhlIGJvdHRvbS5cclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2UoMCwgbnVtYmVyT2ZSb3dzVG9BZGQpO1xyXG5cclxuICAgICAgICAvLyBBZGQganVuayByb3dzIGF0IHRoZSBib3R0b20uXHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgbnVtYmVyT2ZSb3dzVG9BZGQ7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgcm93IHRvIGNvbXBsZXRlbHkgZmlsbGVkLlxyXG4gICAgICAgICAgICBsZXQgcm93OiBDZWxsW10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgICAgICAgICBjZWxsLnNldENvbG9yKENvbG9yLldoaXRlKTtcclxuICAgICAgICAgICAgICAgIHJvdy5wdXNoKGNlbGwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQdW5jaCBvbmUgaG9sZSBpbiBhIHJhbmRvbSBjZWxsIGJldHdlZW4gdGhlIGVuZCBjZWxscy5cclxuICAgICAgICAgICAgbGV0IGhvbGVJZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAocm93Lmxlbmd0aCAtIDIpKSArIDE7XHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gcm93W2hvbGVJZHhdO1xyXG4gICAgICAgICAgICBjZWxsLnNldENvbG9yKENvbG9yLkVtcHR5KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4LnB1c2gocm93KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gTm90aWZ5IGZvciBhbGwgY2VsbHMgYmVjYXVzZSBlbnRpcmUgYm9hcmQgaGFzIGNoYW5nZWQuXHJcbiAgICAgICAgLy8gVE9ETzogTW92ZSB0byBvd24gbWV0aG9kP1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgQ2VsbENoYW5nZUV2ZW50KGNlbGwsIHJvd0lkeCwgY29sSWR4LCB0aGlzLnBsYXllclR5cGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBnZXRNYXRyaXhXaXRoQ3VycmVudFNoYXBlQWRkZWQoKTogYm9vbGVhbltdW10ge1xyXG4gICAgLy8gICAgIGxldCBjb3B5ID0gW107XHJcbiAgICAvLyAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgLy8gICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgIC8vICAgICAgICAgbGV0IHJvd0NvcHkgPSBbXTtcclxuICAgIC8vICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgIC8vICAgICAgICAgICAgIHJvd0NvcHkucHVzaChyb3dbY29sSWR4XS5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSk7XHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgY29weS5wdXNoKHJvd0NvcHkpO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgICByZXR1cm4gY29weTtcclxuICAgIC8vIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFZlcnkgaGFja3kgbWV0aG9kIGp1c3Qgc28gdGhlIEFJIGhhcyBhIHRlbXAgY29weSBvZiB0aGUgYm9hcmQgdG8gZXhwZXJpbWVudCB3aXRoLlxyXG4gICAgICovXHJcbiAgICBjbG9uZVpvbWJpZSgpOiBCb2FyZCB7XHJcbiAgICAgICAgbGV0IGNvcHkgPSBuZXcgQm9hcmQodGhpcy5wbGF5ZXJUeXBlLCBkZWFkU2hhcGVGYWN0b3J5LCBkZWFkRXZlbnRCdXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENvcHkgdGhlIGN1cnJlbnQgc2hhcGUgYW5kIHRoZSBtYXRyaXguIFNob3VsZG4ndCBuZWVkIGFueXRoaW5nIGVsc2UuXHJcbiAgICAgICAgY29weS5jdXJyZW50U2hhcGUgPSB0aGlzLmN1cnJlbnRTaGFwZS5jbG9uZVNpbXBsZSgpO1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb3B5Lm1hdHJpeFtyb3dJZHhdW2NvbElkeF0uc2V0Q29sb3Iocm93W2NvbElkeF0uZ2V0Q29sb3IoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb3B5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZUFnZ3JlZ2F0ZUhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBjb2xIZWlnaHRzID0gdGhpcy5jYWxjdWxhdGVDb2x1bW5IZWlnaHRzKCk7XHJcbiAgICAgICAgcmV0dXJuIGNvbEhlaWdodHMucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhICsgYjsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQ29tcGxldGVMaW5lcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBjb21wbGV0ZUxpbmVzID0gMDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChyb3dbY29sSWR4XS5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvdW50ID49IHJvdy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlTGluZXMrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlTGluZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqIERldGVybWluZXMgaG9sZXMgYnkgc2Nhbm5pbmcgZWFjaCBjb2x1bW4sIGhpZ2hlc3QgZmxvb3IgdG8gbG93ZXN0IGZsb29yLCBhbmRcclxuICAgICAqIHNlZWluZyBob3cgbWFueSB0aW1lcyBpdCBzd2l0Y2hlcyBmcm9tIGNvbG9yZWQgdG8gZW1wdHkgKGJ1dCBub3QgdGhlIG90aGVyIHdheSBhcm91bmQpLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVIb2xlcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB0b3RhbEhvbGVzID0gMDtcclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IGhvbGVzID0gMDtcclxuICAgICAgICAgICAgbGV0IHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNDZWxsV2FzRW1wdHkgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG9sZXMrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NlbGxXYXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG90YWxIb2xlcyArPSBob2xlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRvdGFsSG9sZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQnVtcGluZXNzKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGJ1bXBpbmVzcyA9IDA7XHJcbiAgICAgICAgbGV0IGNvbEhlaWdodHMgPSB0aGlzLmNhbGN1bGF0ZUNvbHVtbkhlaWdodHMoKTtcclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBjb2xIZWlnaHRzLmxlbmd0aCAtIDI7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWwxID0gY29sSGVpZ2h0c1tpZHhdO1xyXG4gICAgICAgICAgICBsZXQgdmFsMiA9IGNvbEhlaWdodHNbaWR4ICsgMV07XHJcbiAgICAgICAgICAgIGJ1bXBpbmVzcyArPSBNYXRoLmFicyh2YWwxIC0gdmFsMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBidW1waW5lc3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVDb2x1bW5IZWlnaHRzKCk6IG51bWJlcltdIHtcclxuICAgICAgICBsZXQgY29sSGVpZ2h0czogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgY29sSGVpZ2h0cy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBoaWdoZXN0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gTUFYX1JPV1MgLSAxOyByb3dJZHggPj0gMDsgcm93SWR4LS0pIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBoaWdoZXN0ID0gTUFYX1JPV1MgLSByb3dJZHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29sSGVpZ2h0c1tjb2xJZHhdID0gaGlnaGVzdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbEhlaWdodHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgb25seSByZWFzb24gdGhpcyBpcyBub3QgcHJpdmF0ZSBpcyBzbyB0aGUgQUkgY2FuIGV4cGVyaW1lbnQgd2l0aCBpdC5cclxuICAgICAqIFdvcmsgaGVyZSBzaG91bGQgYWJsZSB0byBiZSBiZSB1bmRvbmUgYnkgdW5kb0NvbnZlcnRTaGFwZVRvQ2VsbHMuXHJcbiAgICAgKi9cclxuICAgIGNvbnZlcnRTaGFwZVRvQ2VsbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIHRoaXMuY3VycmVudFNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgcm93SWR4ID0gb2Zmc2V0LnkgKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICAgICAgbGV0IGNvbElkeCA9IG9mZnNldC54ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm93SWR4IDwgMCB8fCByb3dJZHggPj0gdGhpcy5tYXRyaXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbElkeCA8IDAgfHwgY29sSWR4ID49IHRoaXMubWF0cml4W3Jvd0lkeF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDZWxsQ29sb3Iocm93SWR4LCBjb2xJZHgsIHRoaXMuY3VycmVudFNoYXBlLmNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS4gU2hvdWxkIHVuZG8gY29udmVydFNoYXBlVG9DZWxscygpLlxyXG4gICAgICovXHJcbiAgICB1bmRvQ29udmVydFNoYXBlVG9DZWxscygpIHtcclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2YgdGhpcy5jdXJyZW50U2hhcGUuZ2V0T2Zmc2V0cygpKSB7XHJcbiAgICAgICAgICAgIGxldCByb3dJZHggPSBvZmZzZXQueSArIHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpO1xyXG4gICAgICAgICAgICBsZXQgY29sSWR4ID0gb2Zmc2V0LnggKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3dJZHggPCAwIHx8IHJvd0lkeCA+PSB0aGlzLm1hdHJpeC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sSWR4IDwgMCB8fCBjb2xJZHggPj0gdGhpcy5tYXRyaXhbcm93SWR4XS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgQ29sb3IuRW1wdHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNsZWFyKCkge1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgQ29sb3IuRW1wdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGVscGVyIG1ldGhvZCB0byBjaGFuZ2UgYSBzaW5nbGUgY2VsbCBjb2xvcidzIGFuZCBub3RpZnkgc3Vic2NyaWJlcnMgYXQgdGhlIHNhbWUgdGltZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGFuZ2VDZWxsQ29sb3Iocm93SWR4OiBudW1iZXIsIGNvbElkeDogbnVtYmVyLCBjb2xvcjogQ29sb3IpIHtcclxuICAgICAgICAvLyBUT0RPOiBNYXliZSBib3VuZHMgY2hlY2sgaGVyZS5cclxuICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICBjZWxsLnNldENvbG9yKGNvbG9yKTtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCwgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFydFNoYXBlKGZvcmNlQmFnUmVmaWxsOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUgPSB0aGlzLnNoYXBlRmFjdG9yeS5uZXh0U2hhcGUoZm9yY2VCYWdSZWZpbGwpO1xyXG4gICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdHJ5R3Jhdml0eSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgY2FuTW92ZURvd24gPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlRG93bigpO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgY2FuTW92ZURvd24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVVwKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBjYW5Nb3ZlRG93bjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVuZGVkIGZvciBjaGVja2luZyBvZiB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgY3VycmVudFxyXG4gICAgICogc2hhcGUgaGFzIGFueSBvdmVybGFwIHdpdGggZXhpc3RpbmcgY2VsbHMgdGhhdCBoYXZlIGNvbG9yLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbGxpc2lvbkRldGVjdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjb2xsaXNpb24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIHRoaXMuY3VycmVudFNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gb2Zmc2V0LnkgKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICAgICAgbGV0IGNvbCA9IG9mZnNldC54ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm93IDwgMCB8fCByb3cgPj0gdGhpcy5tYXRyaXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb2wgPCAwIHx8IGNvbCA+PSB0aGlzLm1hdHJpeFtyb3ddLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXRyaXhbcm93XVtjb2xdLmdldENvbG9yKCkgIT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb2xsaXNpb247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJdCBpcyBjb25zaWRlcmVkIGZ1bGwgaWYgdGhlIHR3byBvYnNjdXJlZCByb3dzIGF0IHRoZSB0b3AgaGF2ZSBjb2xvcmVkIGNlbGxzIGluIHRoZW0uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaXNCb2FyZEZ1bGwoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgMjsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICAgICAgICAgIGlmIChjZWxsLmdldENvbG9yKCkgIT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNpZ25hbEZ1bGxCb2FyZCgpIHtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IEJvYXJkRmlsbGVkRXZlbnQodGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBbnlGaWxsZWRMaW5lcygpIHtcclxuICAgICAgICBsZXQgaGlnaGVzdExpbmVGaWxsZWQgPSAwOyAvLyBcImhpZ2hlc3RcIiBhcyBpbiB0aGUgaGlnaGVzdCBpbiB0aGUgYXJyYXksIHdoaWNoIGlzIHRoZSBsb3dlc3QgdmlzdWFsbHkgdG8gdGhlIHBsYXllci5cclxuXHJcbiAgICAgICAgLy8gVHJhdmVyc2UgYmFja3dhcmRzIHRvIHByZXZlbnQgcm93IGluZGV4IGZyb20gYmVjb21pbmcgb3V0IG9mIHN5bmMgd2hlbiByZW1vdmluZyByb3dzLlxyXG4gICAgICAgIGxldCB0b3RhbEZpbGxlZCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMTsgcm93SWR4ID49IDA7IHJvd0lkeC0tKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBsZXQgZmlsbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2VsbCBvZiByb3cpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjZWxsLmdldENvbG9yKCkgPT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZpbGxlZCkge1xyXG4gICAgICAgICAgICAgICAgdG90YWxGaWxsZWQrKztcclxuICAgICAgICAgICAgICAgIGlmIChyb3dJZHggPiBoaWdoZXN0TGluZUZpbGxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hlc3RMaW5lRmlsbGVkID0gcm93SWR4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBbmRDb2xsYXBzZShyb3dJZHgpO1xyXG4gICAgICAgICAgICAgICAgcm93SWR4ID0gcm93SWR4ICsgMTsgLy8gVGhpcyBpcyBhIHJlYWxseSwgcmVhbGx5IHNoYWt5IHdvcmthcm91bmQuIEl0IHByZXZlbnRzIHRoZSBuZXh0IHJvdyBmcm9tIGdldHRpbmcgc2tpcHBlZCBvdmVyIG9uIG5leHQgbG9vcC5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm90aWZ5IGZvciBhbGwgY2VsbHMgZnJvbSAwIHRvIHRoZSBoaWdoZXN0TGluZUZpbGxlZCwgd2hpY2ggY291bGQgYmUgMCBpZiBubyByb3dzIHdlcmUgZmlsbGVkLlxyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8PSBoaWdoZXN0TGluZUZpbGxlZDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgQ2VsbENoYW5nZUV2ZW50KGNlbGwsIHJvd0lkeCwgY29sSWR4LCB0aGlzLnBsYXllclR5cGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRvdGFsRmlsbGVkID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IFJvd3NGaWxsZWRFdmVudCh0b3RhbEZpbGxlZCwgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyByZW1vdmVzIHRoZSBvbGQgcm93IGFuZCBwdXRzIGEgbmV3IHJvdyBpbiBpdHMgcGxhY2UgYXQgcG9zaXRpb24gMCwgd2hpY2ggaXMgdGhlIGhpZ2hlc3QgdmlzdWFsbHkgdG8gdGhlIHBsYXllci5cclxuICAgICAqIERlbGVnYXRlcyBjZWxsIG5vdGlmaWNhdGlvbiB0byB0aGUgY2FsbGluZyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVtb3ZlQW5kQ29sbGFwc2Uocm93SWR4OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2Uocm93SWR4LCAxKTtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2UoMCwgMCwgW10pO1xyXG4gICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFswXVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoc3RhcnRpbmc9ZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KHRoaXMuY3VycmVudFNoYXBlLCB0aGlzLnBsYXllclR5cGUsIHN0YXJ0aW5nKSk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge1NoYXBlfSBmcm9tICcuL3NoYXBlJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuXHJcbmNsYXNzIFNoYXBlSSBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuQ3lhbjtcclxuICAgIHZhbHVlc1BlclJvdyA9IDQ7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVJIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlSSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZUogZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkJsdWU7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZUoge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVKKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlTCBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuT3JhbmdlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMSxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDEsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZUwge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVMKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlTyBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuWWVsbG93O1xyXG4gICAgdmFsdWVzUGVyUm93ID0gNDtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZU8ge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVPKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlUyBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuR3JlZW47XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMSwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlUyB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVMoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVUIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5QdXJwbGU7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlVCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVQoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVaIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5SZWQ7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlWiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVooKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNoYXBlRmFjdG9yeSB7XHJcbiAgICBwcml2YXRlIGJhZzogU2hhcGVbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnJlZmlsbEJhZyh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0U2hhcGUoZm9yY2VCYWdSZWZpbGw6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5iYWcubGVuZ3RoIDw9IDAgfHwgZm9yY2VCYWdSZWZpbGwgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZpbGxCYWcoZm9yY2VCYWdSZWZpbGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5iYWcucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWZpbGxCYWcoc3RhcnRpbmdQaWVjZXNPbmx5OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5iYWcgPSBbXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZUkoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlSigpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVMKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZVQoKSxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBpZiAoc3RhcnRpbmdQaWVjZXNPbmx5ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLmJhZy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgbmV3IFNoYXBlTygpLFxyXG4gICAgICAgICAgICAgICAgbmV3IFNoYXBlUygpLFxyXG4gICAgICAgICAgICAgICAgbmV3IFNoYXBlWigpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBGaXNoZXItWWF0ZXMgU2h1ZmZsZSwgYmFzZWQgb246IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI0NTA5NzZcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5iYWcubGVuZ3RoXHJcbiAgICAgICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cclxuICAgICAgICB3aGlsZSAoMCAhPT0gaWR4KSB7XHJcbiAgICAgICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgICAgICAgICBsZXQgcm5kSWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaWR4KTtcclxuICAgICAgICAgICAgaWR4IC09IDE7XHJcbiAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICAgICAgbGV0IHRlbXBWYWwgPSB0aGlzLmJhZ1tpZHhdO1xyXG4gICAgICAgICAgICB0aGlzLmJhZ1tpZHhdID0gdGhpcy5iYWdbcm5kSWR4XTtcclxuICAgICAgICAgICAgdGhpcy5iYWdbcm5kSWR4XSA9IHRlbXBWYWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBkZWFkU2hhcGVGYWN0b3J5ID0gbmV3IFNoYXBlRmFjdG9yeSgpOyAvLyBVc2VkIGJ5IEFJLiIsImltcG9ydCB7Q2VsbE9mZnNldH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5cclxuY29uc3QgU1BBV05fQ09MID0gMzsgLy8gTGVmdCBzaWRlIG9mIG1hdHJpeCBzaG91bGQgY29ycmVzcG9uZCB0byB0aGlzLlxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNoYXBlIHtcclxuICAgIGFic3RyYWN0IHJlYWRvbmx5IGNvbG9yOiBDb2xvcjtcclxuICAgIGFic3RyYWN0IHJlYWRvbmx5IHZhbHVlc1BlclJvdzogbnVtYmVyO1xyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBtYXRyaWNlczogUmVhZG9ubHlBcnJheTxSZWFkb25seUFycmF5PG51bWJlcj4+O1xyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGdldEluc3RhbmNlKCk6IFNoYXBlO1xyXG5cclxuICAgIHByaXZhdGUgY3VycmVudE1hdHJpeEluZGV4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJvdzogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjb2w6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IDA7IC8vIFRPRE86IEVuc3VyZSBwb3NpdGlvbiAwIGlzIHRoZSBzcGF3biBwb3NpdGlvblxyXG4gICAgICAgIHRoaXMucm93ID0gMDtcclxuICAgICAgICB0aGlzLmNvbCA9IFNQQVdOX0NPTDtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlTGVmdCgpIHtcclxuICAgICAgICB0aGlzLmNvbC0tO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICB0aGlzLmNvbCsrO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICB0aGlzLnJvdy0tO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVEb3duKCkge1xyXG4gICAgICAgIHRoaXMucm93Kys7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgbW92ZVRvVG9wKCkge1xyXG4gICAgICAgIHRoaXMucm93ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVDb3VudGVyQ2xvY2t3aXNlKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4IC09IDE7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVBcnJheUJvdW5kcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUNsb2Nrd2lzZSgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCArPSAxO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQXJyYXlCb3VuZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3coKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm93O1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb2w7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um93Q291bnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmdldEN1cnJlbnRNYXRyaXgoKS5sZW5ndGggLyB0aGlzLnZhbHVlc1BlclJvdyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0T2Zmc2V0cygpOiBDZWxsT2Zmc2V0W10ge1xyXG4gICAgICAgIGxldCBtYXRyaXggPSB0aGlzLmdldEN1cnJlbnRNYXRyaXgoKTtcclxuICAgICAgICBsZXQgb2Zmc2V0czogQ2VsbE9mZnNldFtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgbWF0cml4Lmxlbmd0aDsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWF0cml4W2lkeF07XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBpZHggJSB0aGlzLnZhbHVlc1BlclJvdztcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihpZHggLyB0aGlzLnZhbHVlc1BlclJvdyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0ID0gbmV3IENlbGxPZmZzZXQoeCwgeSk7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXRzLnB1c2gob2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2Zmc2V0cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhY2t5IG1ldGhvZCB1c2VkIGJ5IHRoZSBBSS5cclxuICAgICAqIFwiU2ltcGxlXCIgYXMgaW4gZG9lc24ndCBtYXR0ZXIgd2hhdCB0aGUgY3VycmVudCByb3cvY29sL21hdHJpeCBpcy5cclxuICAgICAqL1xyXG4gICAgY2xvbmVTaW1wbGUoKTogU2hhcGUge1xyXG4gICAgICAgIC8vIEdldCBhbiBpbnN0YW5jZSBvZiB0aGUgY29uY3JldGUgY2xhc3MuIFJlc3Qgb2YgdmFsdWVzIGFyZSBpcnJlbGV2YW50LlxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEluc3RhbmNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50TWF0cml4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hdHJpY2VzW3RoaXMuY3VycmVudE1hdHJpeEluZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVuc3VyZUFycmF5Qm91bmRzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggPSB0aGlzLm1hdHJpY2VzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA+PSB0aGlzLm1hdHJpY2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtNQVhfQ09MUywgQm9hcmR9IGZyb20gJy4vYm9hcmQvYm9hcmQnO1xyXG5pbXBvcnQge0FpfSBmcm9tICcuL2FpL2FpJztcclxuaW1wb3J0IHtucGNNYW5hZ2VyfSBmcm9tICcuL25wYy9ucGMtbWFuYWdlcic7XHJcbmltcG9ydCB7ZXZlbnRCdXMsIEV2ZW50VHlwZX0gZnJvbSAnLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9hY3RpdmUtc2hhcGUtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7Um93c0ZpbGxlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9yb3dzLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7Qm9hcmRGaWxsZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvYm9hcmQtZmlsbGVkLWV2ZW50JztcclxuaW1wb3J0IHtIcENoYW5nZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvaHAtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7U2hhcGVGYWN0b3J5fSBmcm9tICcuL2JvYXJkL3NoYXBlLWZhY3RvcnknO1xyXG5cclxuY29uc3QgTUFYX0hQID0gTUFYX0NPTFM7IC8vIEhQIGNvcnJlc3BvbmRzIHRvIHRoZSBudW1iZXIgb2YgbG9uZyB3aW5kb3dzIG9uIHRoZSBzZWNvbmQgZmxvb3Igb2YgdGhlIHBoeXNpY2FsIGJ1aWxkaW5nLlxyXG5jb25zdCBURU1QX0RFTEFZX01TID0gNTAwO1xyXG5cclxuY2xhc3MgTW9kZWwge1xyXG4gICAgcHJpdmF0ZSBodW1hbkJvYXJkOiBCb2FyZDtcclxuICAgIHByaXZhdGUgaHVtYW5IaXRQb2ludHM6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGFpQm9hcmQ6IEJvYXJkO1xyXG4gICAgcHJpdmF0ZSBhaUhpdFBvaW50czogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgYWk6IEFpO1xyXG5cclxuICAgIHByaXZhdGUgbXNUaWxsR3Jhdml0eVRpY2s6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBsZXQgaHVtYW5TaGFwZUZhY3RvcnkgPSBuZXcgU2hhcGVGYWN0b3J5KCk7XHJcbiAgICAgICAgdGhpcy5odW1hbkJvYXJkID0gbmV3IEJvYXJkKFBsYXllclR5cGUuSHVtYW4sIGh1bWFuU2hhcGVGYWN0b3J5LCBldmVudEJ1cyk7XHJcbiAgICAgICAgdGhpcy5odW1hbkhpdFBvaW50cyA9IE1BWF9IUDtcclxuXHJcbiAgICAgICAgbGV0IGFpU2hhcGVGYWN0b3J5ID0gbmV3IFNoYXBlRmFjdG9yeSgpO1xyXG4gICAgICAgIHRoaXMuYWlCb2FyZCA9IG5ldyBCb2FyZChQbGF5ZXJUeXBlLkFpLCBhaVNoYXBlRmFjdG9yeSwgZXZlbnRCdXMpO1xyXG4gICAgICAgIHRoaXMuYWlIaXRQb2ludHMgPSBNQVhfSFA7XHJcblxyXG4gICAgICAgIHRoaXMuYWkgPSBuZXcgQWkodGhpcy5haUJvYXJkKTtcclxuXHJcbiAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IFRFTVBfREVMQVlfTVM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlBsYXllck1vdmVtZW50RXZlbnRUeXBlLCAoZXZlbnQ6IFBsYXllck1vdmVtZW50RXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVQbGF5ZXJNb3ZlbWVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5Sb3dzRmlsbGVkRXZlbnRUeXBlLCAoZXZlbnQ6IFJvd3NGaWxsZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVJvd3NGaWxsZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5Cb2FyZEZpbGxlZEV2ZW50VHlwZSwgKGV2ZW50OiBCb2FyZEZpbGxlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQm9hcmRGaWxsZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGUsIChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaHVtYW5Cb2FyZC5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuYWlCb2FyZC5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuYWkuc3RhcnQoKTtcclxuICAgICAgICBucGNNYW5hZ2VyLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IEluc3RlYWQsIHN0YXJ0IGdhbWUgd2hlbiBwbGF5ZXIgaGl0cyBhIGtleSBmaXJzdC5cclxuICAgICAgICB0aGlzLmh1bWFuQm9hcmQucmVzZXRCb2FyZCgpO1xyXG4gICAgICAgIHRoaXMuYWlCb2FyZC5yZXNldEJvYXJkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0ZXBCb2FyZHMoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5haS5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIG5wY01hbmFnZXIuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBCb2FyZHMoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayAtPSBlbGFwc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLm1zVGlsbEdyYXZpdHlUaWNrIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IFRFTVBfREVMQVlfTVM7XHJcbiAgICAgICAgICAgIHRoaXMuaHVtYW5Cb2FyZC5zdGVwKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWlCb2FyZC5zdGVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlUGxheWVyTW92ZW1lbnQoZXZlbnQ6IFBsYXllck1vdmVtZW50RXZlbnQpIHtcclxuICAgICAgICBsZXQgYm9hcmQgPSB0aGlzLmRldGVybWluZUJvYXJkRm9yKGV2ZW50LnBsYXllclR5cGUpO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKGV2ZW50Lm1vdmVtZW50KSB7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuTGVmdDpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZUxlZnQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlUmlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LkRvd246XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVEb3duKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Ecm9wOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlRG93bkFsbFRoZVdheSgpO1xyXG4gICAgICAgICAgICAgICAgYm9hcmQuc3RlcCgpOyAvLyBwcmV2ZW50IGFueSBvdGhlciBrZXlzdHJva2VzIHRpbGwgbmV4dCB0aWNrXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Sb3RhdGVDbG9ja3dpc2U6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5yb3RhdGVTaGFwZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5oYW5kbGVkIG1vdmVtZW50Jyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2ZlciB0aGUgZmlsbGVkIHJvd3MgdG8gYmUganVuayByb3dzIG9uIHRoZSBvcHBvc2l0ZSBwbGF5ZXIncyBib2FyZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBoYW5kbGVSb3dzRmlsbGVkRXZlbnQoZXZlbnQ6IFJvd3NGaWxsZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBib2FyZCA9IHRoaXMuZGV0ZXJtaW5lQm9hcmRGb3JPcHBvc2l0ZU9mKGV2ZW50LnBsYXllclR5cGUpO1xyXG4gICAgICAgIGJvYXJkLmFkZEp1bmtSb3dzKGV2ZW50LnRvdGFsRmlsbGVkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGh1bWFuJ3MgYm9hcmQgaWYgZ2l2ZW4gdGhlIGh1bWFuJ3MgdHlwZSwgb3IgQUkncyBib2FyZCBpZiBnaXZlbiB0aGUgQUkuIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRldGVybWluZUJvYXJkRm9yKHBsYXllclR5cGU6IFBsYXllclR5cGUpOiBCb2FyZCB7XHJcbiAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHVtYW5Cb2FyZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5haUJvYXJkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIHRoaXMgbWV0aG9kIGlzIGdpdmVuIFwiSHVtYW5cIiwgaXQgd2lsbCByZXR1cm4gdGhlIEFJJ3MgYm9hcmQsIGFuZCB2aWNlIHZlcnNhLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRldGVybWluZUJvYXJkRm9yT3Bwb3NpdGVPZihwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKTogQm9hcmQge1xyXG4gICAgICAgIGlmIChwbGF5ZXJUeXBlID09PSBQbGF5ZXJUeXBlLkh1bWFuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFpQm9hcmQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHVtYW5Cb2FyZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVCb2FyZEZpbGxlZEV2ZW50KGV2ZW50OiBCb2FyZEZpbGxlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGhwOiBudW1iZXI7XHJcbiAgICAgICAgaWYgKGV2ZW50LnBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgaHAgPSAodGhpcy5odW1hbkhpdFBvaW50cyAtPSAxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBocCA9ICh0aGlzLmFpSGl0UG9pbnRzIC09IDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBIcENoYW5nZWRFdmVudChocCwgZXZlbnQucGxheWVyVHlwZSkpO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBTZWUgaWYgb25lIG9mIHRoZSBwbGF5ZXJzIGhhcyBydW4gb3V0IG9mIEhQLlxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LnN0YXJ0aW5nID09PSB0cnVlICYmIGV2ZW50LnBsYXllclR5cGUgPT09IFBsYXllclR5cGUuQWkpIHtcclxuICAgICAgICAgICAgdGhpcy5haS5zdHJhdGVnaXplKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gTm90aGluZyBjdXJyZW50bHkgZm9yIHRoZSBodW1hbidzIGJvYXJkIHRvIGJlIGRvaW5nIGF0IHRoaXMgdGltZS5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IG1vZGVsID0gbmV3IE1vZGVsKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuaW1wb3J0IHtOcGN9IGZyb20gJy4vbnBjJ1xyXG5pbXBvcnQge05wY1N0YXRlfSBmcm9tICcuLi8uLi9kb21haW4vbnBjLXN0YXRlJztcclxuaW1wb3J0IHtldmVudEJ1cywgRXZlbnRUeXBlfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1N0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY1BsYWNlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtcGxhY2VkLWV2ZW50JztcclxuXHJcbi8vIFN0YXJ0aW5nIHBvc2l0aW9uIGNvdW50cyB1c2VkIGluIGluaXRpYWxpemF0aW9uLlxyXG5jb25zdCBUT1RBTF9OUENTID0gMjA7XHJcblxyXG5jbGFzcyBOcGNNYW5hZ2VyIHtcclxuXHJcbiAgICBwcml2YXRlIG5wY3M6IE1hcDxudW1iZXIsIE5wYz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ucGNzID0gbmV3IE1hcDxudW1iZXIsIE5wYz4oKTtcclxuICAgICAgICBmb3IgKGxldCBucGNJZHggPSAwOyBucGNJZHggPCBUT1RBTF9OUENTOyBucGNJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgbnBjID0gbmV3IE5wYygpO1xyXG4gICAgICAgICAgICB0aGlzLm5wY3Muc2V0KG5wYy5pZCwgbnBjKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnRUeXBlLCAoZXZlbnQ6IFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5ucGNzLmZvckVhY2goKG5wYzogTnBjKSA9PiB7XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gKE1hdGgucmFuZG9tKCkgKiA3KTtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gKE1hdGgucmFuZG9tKCkgKiAxNSk7XHJcbiAgICAgICAgICAgICAgICBucGMuc3RhcnQoeCwgeSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IE1vdmUgdGhpcyBlbHNld2hlcmU6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gKE1hdGgucmFuZG9tKCkgKiA3KTtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gKE1hdGgucmFuZG9tKCkgKiAxNSk7XHJcbiAgICAgICAgICAgICAgICBucGMuYmVnaW5XYWxraW5nVG8oeCwgeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubnBjcy5mb3JFYWNoKChucGM6IE5wYykgPT4ge1xyXG4gICAgICAgICAgICBucGMuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoZXZlbnQ6IFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgbnBjID0gdGhpcy5ucGNzLmdldChldmVudC5ucGNJZCk7XHJcbiAgICAgICAgaWYgKG5wYyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICAgICAgbGV0IHkgPSBldmVudC56O1xyXG4gICAgICAgICAgICBucGMudXBkYXRlUG9zaXRpb24oeCwgeSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBucGNNYW5hZ2VyID0gbmV3IE5wY01hbmFnZXIoKTsiLCJpbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY01vdmVtZW50Q2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjU3RhdGV9IGZyb20gJy4uLy4uL2RvbWFpbi9ucGMtc3RhdGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wYyB7XHJcbiAgICByZWFkb25seSBpZDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGU6IE5wY1N0YXRlO1xyXG4gICAgcHJpdmF0ZSB0aW1lSW5TdGF0ZTogbnVtYmVyO1xyXG5cclxuICAgIC8vIFwiTGFzdFwiIGFzIGluIHRoZSBsYXN0IGtub3duIGNvb3JkaW5hdGUsIGJlY2F1c2UgaXQgY291bGQgYmUgY3VycmVudGx5IGluLW1vdGlvbi5cclxuICAgIHByaXZhdGUgeGxhc3Q6IG51bWJlcjtcclxuICAgIHByaXZhdGUgeWxhc3Q6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmlkID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0gTnBjU3RhdGUuSWRsZTtcclxuICAgICAgICB0aGlzLnRpbWVJblN0YXRlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy54bGFzdCA9IDA7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnhsYXN0ID0geDtcclxuICAgICAgICB0aGlzLnlsYXN0ID0geTtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBOcGNQbGFjZWRFdmVudCh0aGlzLmlkLCB0aGlzLnN0YXRlLCB4LCB5KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIHNob3VsZCBiZSBjYWxsZWQgYnkgdGhlIE5QQyBtYW5hZ2VyIHJhdGhlciB0aGFuIHRyYWNrcyB0aGF0IHJlZmVyZW5jZSB0aGVtLlxyXG4gICAgICovXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMudGltZUluU3RhdGUgKz0gZWxhcHNlZDtcclxuICAgIH1cclxuXHJcbiAgICB0cmFuc2l0aW9uVG8oc3RhdGU6IE5wY1N0YXRlKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMudGltZUluU3RhdGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGJlZ2luV2Fsa2luZ1RvKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQodGhpcy5pZCwgeCwgeSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2lnbmlmaWVzIHRoZSBlbmQgb2YgYSB3YWxrLlxyXG4gICAgICovXHJcbiAgICB1cGRhdGVQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueGxhc3QgPSB4O1xyXG4gICAgICAgIHRoaXMueWxhc3QgPSB5O1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvblRvKE5wY1N0YXRlLklkbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXRlKCk6IE5wY1N0YXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7c3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlfSBmcm9tICcuL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UnO1xyXG5cclxuY2xhc3MgUHJlbG9hZGVyIHtcclxuICAgIFxyXG4gICAgcHJlbG9hZChjYWxsYmFjazogKCkgPT4gYW55KSB7XHJcbiAgICAgICAgc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlLnByZWxvYWQoY2FsbGJhY2spO1xyXG4gICAgICAgIC8vIFRPRE86IEdvaW5nIHRvIGhhdmUgYSBwYXJhbGxlbGlzbSBtZWNoYW5pc20gYWZ0ZXIgYWRkaW5nIG1vcmUgdG8gdGhpcy5cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgcHJlbG9hZGVyID0gbmV3IFByZWxvYWRlcigpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmNvbnN0IEFTUEVDVF9SQVRJTyA9IDE2Lzk7XHJcblxyXG5jbGFzcyBDYW1lcmFXcmFwcGVyIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgY2FtZXJhOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNjAsIEFTUEVDVF9SQVRJTywgMC4xLCAxMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVSZW5kZXJlclNpemUocmVuZGVyZXI6IGFueSkge1xyXG4gICAgICAgIGxldCB3aW5kb3dBc3BlY3RSYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIGxldCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcjtcclxuICAgICAgICBpZiAod2luZG93QXNwZWN0UmF0aW8gPiBBU1BFQ1RfUkFUSU8pIHtcclxuICAgICAgICAgICAgLy8gVG9vIHdpZGU7IHNjYWxlIG9mZiBvZiB3aW5kb3cgaGVpZ2h0LlxyXG4gICAgICAgICAgICB3aWR0aCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVySGVpZ2h0ICogQVNQRUNUX1JBVElPKTtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93QXNwZWN0UmF0aW8gPD0gQVNQRUNUX1JBVElPKSB7XHJcbiAgICAgICAgICAgIC8vIFRvbyBuYXJyb3cgb3IganVzdCByaWdodDsgc2NhbGUgb2ZmIG9mIHdpbmRvdyB3aWR0aC5cclxuICAgICAgICAgICAgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJXaWR0aCAvIEFTUEVDVF9SQVRJTyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIC8vIFNob3VsZCBiZSBubyBuZWVkIHRvIHVwZGF0ZSBhc3BlY3QgcmF0aW8gYmVjYXVzZSBpdCBzaG91bGQgYmUgY29uc3RhbnQuXHJcbiAgICAgICAgLy8gdGhpcy5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgbG9va0F0KHZlYzM6IGFueSkge1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tBdCh2ZWMzKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgY2FtZXJhV3JhcHBlciA9IG5ldyBDYW1lcmFXcmFwcGVyKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1aWxkaW5nIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgc2xhYjogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgb2xkIHBsYWluIGN1YmUuXHJcbiAgICAgICAgLy8gbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDExLCAyMCwgMTApO1xyXG4gICAgICAgIC8vIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtjb2xvcjogMHhmZmZmZmZ9KTtcclxuICAgICAgICAvLyB0aGlzLnNsYWIgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIC8vIHRoaXMuc2xhYi5wb3NpdGlvbi5zZXQoNC41LCAxMCwgLTUuOCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogTW92ZSB0aGlzIGludG8gYSBsb2FkZXJcclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGxldCBtdGxMb2FkZXIgPSBuZXcgVEhSRUUuTVRMTG9hZGVyKCk7XHJcbiAgICAgICAgbXRsTG9hZGVyLnNldFBhdGgoJycpO1xyXG4gICAgICAgIG10bExvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5tdGwnLCAobWF0ZXJpYWxzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgbWF0ZXJpYWxzLnByZWxvYWQoKTtcclxuICAgICAgICAgICAgbGV0IG9iakxvYWRlciA9IG5ldyBUSFJFRS5PQkpMb2FkZXIoKTtcclxuICAgICAgICAgICAgb2JqTG9hZGVyLnNldE1hdGVyaWFscyhtYXRlcmlhbHMpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIuc2V0UGF0aCgnJyk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5vYmonLCAob2JqOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIG9iai5zY2FsZS5zZXRTY2FsYXIoMC4yNSk7XHJcbiAgICAgICAgICAgICAgICBvYmoucG9zaXRpb24uc2V0KDUsIC0wLjAxLCAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXAuYWRkKG9iaik7XHJcbiAgICAgICAgICAgIH0sICgpID0+IHsgfSwgKCkgPT4geyBjb25zb2xlLmxvZygnZXJyb3Igd2hpbGUgbG9hZGluZyA6KCcpIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuL2xpZ2h0aW5nLWdyaWQnO1xyXG5pbXBvcnQge0hwT3JpZW50YXRpb259IGZyb20gJy4uL2hwLW9yaWVudGF0aW9uJztcclxuXHJcbmV4cG9ydCBjbGFzcyBIcFBhbmVscyB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHBhbmVsczogYW55W107XHJcbiAgICBwcml2YXRlIGhwT3JpZW50YXRpb246IEhwT3JpZW50YXRpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGFuZWxzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgUEFORUxfQ09VTlRfUEVSX0ZMT09SOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgwLjYsIDAuNik7XHJcbiAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCgpO1xyXG4gICAgICAgICAgICBsZXQgcGFuZWwgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBsZXQgeCA9IGlkeDtcclxuICAgICAgICAgICAgbGV0IHkgPSAwO1xyXG4gICAgICAgICAgICBsZXQgeiA9IDA7XHJcbiAgICAgICAgICAgIHBhbmVsLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogTWFrZSB0aGlzIHB1bHNlIGF0IGFsbD9cclxuICAgICAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KDB4ZmZmZmZmKTtcclxuICAgICAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmVJbnRlbnNpdHkgPSAwLjI1O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wYW5lbHMucHVzaChwYW5lbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KGhwT3JpZW50YXRpb246IEhwT3JpZW50YXRpb24pIHtcclxuICAgICAgICB0aGlzLmhwT3JpZW50YXRpb24gPSBocE9yaWVudGF0aW9uO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLmFkZChwYW5lbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gdG8gZml0IGFnYWluc3QgYnVpbGRpbmcuXHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoMS44NSwgMy41NSwgLTEuNSk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5zY2FsZS5zZXQoMC43LCAxLjksIDEpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUhwKFBBTkVMX0NPVU5UX1BFUl9GTE9PUik7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSFAgYmFyIGNhbiBnbyBmcm9tIHJpZ2h0LXRvLWxlZnQgb3IgbGVmdC10by1yaWdodCwgbGlrZSBhIGZpZ2h0aW5nIGdhbWUgSFAgYmFyLlxyXG4gICAgICovXHJcbiAgICB1cGRhdGVIcChocDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGhwID4gUEFORUxfQ09VTlRfUEVSX0ZMT09SKSB7XHJcbiAgICAgICAgICAgIGhwID0gUEFORUxfQ09VTlRfUEVSX0ZMT09SO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgdGhpcy5wYW5lbHMubGVuZ3RoOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcGFuZWwgPSB0aGlzLnBhbmVsc1tpZHhdO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ocE9yaWVudGF0aW9uID09PSBIcE9yaWVudGF0aW9uLkRlY3JlYXNlc1JpZ2h0VG9MZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaWR4IDwgaHApIHtcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkeCA+PSBQQU5FTF9DT1VOVF9QRVJfRkxPT1IgLSBocCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE86IEhhbmRsZSB1cGRhdGUgdG8gSFAgPSBmdWxsIGFzIGRpZmZlcmVudCBmcm9tIEhQIDwgZnVsbC5cclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuZGVjbGFyZSBjb25zdCBUV0VFTjogYW55O1xyXG5cclxuaW1wb3J0IHtCdWlsZGluZ30gZnJvbSAnLi9idWlsZGluZyc7XHJcbmltcG9ydCB7SHBQYW5lbHN9IGZyb20gJy4vaHAtcGFuZWxzJztcclxuaW1wb3J0IHtIcE9yaWVudGF0aW9ufSBmcm9tICcuLi9ocC1vcmllbnRhdGlvbic7XHJcblxyXG4vLyBUT0RPOiBPbmx5IHRoZSAzcmQgZmxvb3IgZnJvbSB0aGUgdG9wIGFuZCBiZWxvdyBhcmUgdmlzaWJsZS4gQWxzbywgc2VlIGJvYXJkLnRzLlxyXG5leHBvcnQgY29uc3QgRkxPT1JfQ09VTlQgPSAxNztcclxuZXhwb3J0IGNvbnN0IFBBTkVMX0NPVU5UX1BFUl9GTE9PUiA9IDEwO1xyXG5cclxuY29uc3QgQUNUSVZFX1NIQVBFX0xJR0hUX0NPVU5UID0gNDtcclxuXHJcbmNsYXNzIEVtaXNzaXZlSW50ZW5zaXR5IHtcclxuICAgIHZhbHVlOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaWdodGluZ0dyaWQge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG4gICAgcHJpdmF0ZSBwYW5lbEdyb3VwOiBhbnk7XHJcbiAgICBwcml2YXRlIGJ1aWxkaW5nOiBCdWlsZGluZztcclxuICAgIHByaXZhdGUgaHBQYW5lbHM6IEhwUGFuZWxzO1xyXG5cclxuICAgIHByaXZhdGUgcGFuZWxzOiBhbnlbXVtdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHBvaW50TGlnaHRzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgY3VycmVudFBvaW50TGlnaHRJZHg6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHB1bHNlVHdlZW46IGFueTtcclxuICAgIHByaXZhdGUgcHVsc2VUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZW1pc3NpdmVJbnRlbnNpdHk6IEVtaXNzaXZlSW50ZW5zaXR5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLmJ1aWxkaW5nID0gbmV3IEJ1aWxkaW5nKCk7XHJcbiAgICAgICAgdGhpcy5ocFBhbmVscyA9IG5ldyBIcFBhbmVscygpO1xyXG5cclxuICAgICAgICB0aGlzLnBhbmVscyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGZsb29ySWR4ID0gMDsgZmxvb3JJZHggPCBGTE9PUl9DT1VOVDsgZmxvb3JJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBhbmVsc1tmbG9vcklkeF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFuZWxJZHggPSAwOyBwYW5lbElkeCA8IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjsgcGFuZWxJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDAuNiwgMC42LCAwLjEpOyAvLyBUT0RPOiBjbG9uZSgpID9cclxuICAgICAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhbmVsID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IHBhbmVsSWR4O1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBmbG9vcklkeCArIDE7IC8vIE9mZnNldCB1cCAxIGJlY2F1c2UgZ3JvdW5kIGlzIHkgPSAwLlxyXG4gICAgICAgICAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgICAgICAgICAgcGFuZWwucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFuZWxzW2Zsb29ySWR4XVtwYW5lbElkeF0gPSBwYW5lbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb2ludExpZ2h0cyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGNvdW50ID0gMDsgY291bnQgPCBBQ1RJVkVfU0hBUEVfTElHSFRfQ09VTlQ7IGNvdW50KyspIHtcclxuICAgICAgICAgICAgbGV0IHBvaW50TGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmMDBmZiwgMiwgMS41KTtcclxuLy8gLy8gVGhlc2UgdHdvIGxpbmVzIGFyZSBmb3IgZGVidWdnaW5nOlxyXG4vLyBsZXQgc3BoZXJlID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KCAwLjEsIDE2LCA4ICk7XHJcbi8vIHBvaW50TGlnaHQuYWRkKCBuZXcgVEhSRUUuTWVzaChzcGhlcmUsIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IDB4ZmZmZmZmfSkpKTtcclxuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDAuNiwgMC42LCAwLjEpO1xyXG4gICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe2NvbG9yOiAweGZmZmZmZn0pO1xyXG4gICAgICAgICAgICBsZXQgZ2xhc3MgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBnbGFzcy5wb3NpdGlvbi5zZXRaKC0wLjMzKTsgLy8gU2hvdWxkIGJlIG9uIHNhbWUgbGV2ZWwgYXMgcmVndWxhciBjZWxscy5cclxuICAgICAgICAgICAgcG9pbnRMaWdodC5hZGQoZ2xhc3MpO1xyXG5cclxuICAgICAgICAgICAgcG9pbnRMaWdodC5wb3NpdGlvbi5zZXQoLTEwMCwgLTEwMCwgMC4zMyk7IC8vIEp1c3QgZ2V0IGl0IG91dCBvZiB0aGUgd2F5IGZvciBub3dcclxuICAgICAgICAgICAgdGhpcy5wb2ludExpZ2h0cy5wdXNoKHBvaW50TGlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnJlbnRQb2ludExpZ2h0SWR4ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuID0gbnVsbDtcclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5ID0gbmV3IEVtaXNzaXZlSW50ZW5zaXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoaHBPcmllbnRhdGlvbjogSHBPcmllbnRhdGlvbikge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuYnVpbGRpbmcuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuaHBQYW5lbHMuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMucGFuZWxHcm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRpbmcuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmhwUGFuZWxzLnN0YXJ0KGhwT3JpZW50YXRpb24pO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBmbG9vciBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiBmbG9vcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYW5lbEdyb3VwLmFkZChwYW5lbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBvaW50TGlnaHQgb2YgdGhpcy5wb2ludExpZ2h0cykge1xyXG4gICAgICAgICAgICB0aGlzLnBhbmVsR3JvdXAuYWRkKHBvaW50TGlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRvIGZpdCBhZ2FpbnN0IGJ1aWxkaW5nLlxyXG4gICAgICAgIHRoaXMucGFuZWxHcm91cC5wb3NpdGlvbi5zZXQoMS45LCAzLjgsIC0xLjU1KTtcclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAuc2NhbGUuc2V0KDAuNywgMS4wLCAxKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBjZWxscyBhcHBlYXIgdG8gcHVsc2UuXHJcbiAgICAgICAgdGhpcy5lbWlzc2l2ZUludGVuc2l0eS52YWx1ZSA9IDAuMjU7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkpXHJcbiAgICAgICAgICAgIC50byh7dmFsdWU6IDEuMH0sIDc1MClcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuU2ludXNvaWRhbC5Jbk91dClcclxuICAgICAgICAgICAgLnlveW8odHJ1ZSlcclxuICAgICAgICAgICAgLnJlcGVhdChJbmZpbml0eSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMucHVsc2VUd2VlbkVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwUHVsc2UoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5ocFBhbmVscy5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaFJvb21PZmYoZmxvb3JJZHg6IG51bWJlciwgcGFuZWxJZHg6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBwYW5lbCA9IHRoaXMucGFuZWxzW2Zsb29ySWR4XVtwYW5lbElkeF07XHJcbiAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaFJvb21PbihmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyLCBjb2xvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHBhbmVsID0gdGhpcy5wYW5lbHNbZmxvb3JJZHhdW3BhbmVsSWR4XTtcclxuICAgICAgICBwYW5lbC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICBwYW5lbC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoY29sb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbmRBY3RpdmVTaGFwZUxpZ2h0VG8oZmxvb3JJZHg6IG51bWJlciwgcGFuZWxJZHg6IG51bWJlciwgY29sb3I6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBwb2ludExpZ2h0ID0gdGhpcy5nZXROZXh0UG9pbnRMaWdodCgpO1xyXG4gICAgICAgIHBvaW50TGlnaHQuY29sb3Iuc2V0SGV4KGNvbG9yKTtcclxuXHJcbiAgICAgICAgLy8gRG8gbm90IGxpZ2h0IGlmIGhpZ2hlciB0aGFuIHRoZSBoaWdoZXN0ICp2aXNpYmxlKiBmbG9vci5cclxuICAgICAgICBpZiAoZmxvb3JJZHggPj0gRkxPT1JfQ09VTlQpIHtcclxuICAgICAgICAgICAgcG9pbnRMaWdodC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcG9pbnRMaWdodC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB4ID0gcGFuZWxJZHg7XHJcbiAgICAgICAgbGV0IHkgPSBmbG9vcklkeCArIDE7IC8vIE9mZnNldCB1cCAxIGJlY2F1c2UgZ3JvdW5kIGlzIHkgPSAwLlxyXG4gICAgICAgIGxldCB6ID0gMC4zMztcclxuICAgICAgICBwb2ludExpZ2h0LnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVIcChocDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ocFBhbmVscy51cGRhdGVIcChocCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXROZXh0UG9pbnRMaWdodCgpIHtcclxuICAgICAgICBsZXQgcG9pbnRMaWdodCA9IHRoaXMucG9pbnRMaWdodHNbdGhpcy5jdXJyZW50UG9pbnRMaWdodElkeF07XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UG9pbnRMaWdodElkeCsrO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQb2ludExpZ2h0SWR4ID49IEFDVElWRV9TSEFQRV9MSUdIVF9DT1VOVCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQb2ludExpZ2h0SWR4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBvaW50TGlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwUHVsc2UoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucHVsc2VUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHVsc2VUd2VlbkVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy5wdWxzZVR3ZWVuLnVwZGF0ZSh0aGlzLnB1bHNlVHdlZW5FbGFwc2VkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgZmxvb3Igb2YgdGhpcy5wYW5lbHMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFuZWwgb2YgZmxvb3IpIHtcclxuICAgICAgICAgICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlSW50ZW5zaXR5ID0gdGhpcy5lbWlzc2l2ZUludGVuc2l0eS52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtDZWxsQ2hhbmdlRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2NlbGwtY2hhbmdlLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge0hwQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ocC1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtMaWdodGluZ0dyaWQsIEZMT09SX0NPVU5ULCBQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4vbGlnaHRpbmctZ3JpZCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7Q2VsbE9mZnNldH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uLy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgU3dpdGNoYm9hcmQge1xyXG5cclxuICAgIHByaXZhdGUgbGlnaHRpbmdHcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IobGlnaHRpbmdHcmlkOiBMaWdodGluZ0dyaWQsIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZCA9IGxpZ2h0aW5nR3JpZDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5DZWxsQ2hhbmdlRXZlbnRUeXBlLCAoZXZlbnQ6IENlbGxDaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUNlbGxDaGFuZ2VFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkhwQ2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBIcENoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUhwQ2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KGV2ZW50OiBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBmbG9vcklkeCA9IHRoaXMuY29udmVydFJvd1RvRmxvb3IoZXZlbnQuc2hhcGUuZ2V0Um93KCkpO1xyXG4gICAgICAgIGxldCBwYW5lbElkeCA9IGV2ZW50LnNoYXBlLmdldENvbCgpO1xyXG4gICAgICAgIGxldCBjb2xvciA9IHRoaXMuY29udmVydENvbG9yKGV2ZW50LnNoYXBlLmNvbG9yKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIGV2ZW50LnNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0Rmxvb3JJZHggPSBmbG9vcklkeCAtIG9mZnNldC55O1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0UGFuZWxJZHggPSBwYW5lbElkeCArIG9mZnNldC54O1xyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zZW5kQWN0aXZlU2hhcGVMaWdodFRvKG9mZnNldEZsb29ySWR4LCBvZmZzZXRQYW5lbElkeCwgY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNlbGxDaGFuZ2VFdmVudChldmVudDogQ2VsbENoYW5nZUV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGZsb29ySWR4ID0gdGhpcy5jb252ZXJ0Um93VG9GbG9vcihldmVudC5yb3cpO1xyXG4gICAgICAgIGlmIChmbG9vcklkeCA+PSBGTE9PUl9DT1VOVCkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIFNraXAgb2JzdHJ1Y3RlZCBmbG9vcnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwYW5lbElkeCA9IGV2ZW50LmNvbDtcclxuICAgICAgICBpZiAoZXZlbnQuY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zd2l0Y2hSb29tT2ZmKGZsb29ySWR4LCBwYW5lbElkeCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IGNvbG9yID0gdGhpcy5jb252ZXJ0Q29sb3IoZXZlbnQuY2VsbC5nZXRDb2xvcigpKTtcclxuICAgICAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc3dpdGNoUm9vbU9uKGZsb29ySWR4LCBwYW5lbElkeCwgY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUhwQ2hhbmdlZEV2ZW50KGV2ZW50OiBIcENoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnVwZGF0ZUhwKGV2ZW50LmhwKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgY2VsbCByb3cvY29sIGNvb3JkaW5hdGVzIHRvIGZsb29yL3BhbmVsIGNvb3JkaW5hdGVzLlxyXG4gICAgICogQWNjb3VudCBmb3IgdGhlIHR3byBmbG9vcnMgdGhhdCBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuICg/KVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbnZlcnRSb3dUb0Zsb29yKHJvdzogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHRoaW5nID0gKEZMT09SX0NPVU5UIC0gcm93KSArIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29udmVydENvbG9yKGNvbG9yOiBDb2xvcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBudW1iZXI7XHJcbiAgICAgICAgc3dpdGNoIChjb2xvcikge1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkN5YW46XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4MDBmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuWWVsbG93OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGZmZmYwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLlB1cnBsZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHg4MDAwODA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5HcmVlbjpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgwMDgwMDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5SZWQ6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmYwMDAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuQmx1ZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgwMDAwZmY7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5PcmFuZ2U6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZhNTAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuV2hpdGU6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vIERlZmF1bHQgb3IgbWlzc2luZyBjYXNlIGlzIGJsYWNrLlxyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkVtcHR5OlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDAwMDAwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG4vLyBEaW1lbnNpb25zIG9mIHRoZSBlbnRpcmUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVTSEVFVF9XSURUSCAgID0gMjU2O1xyXG5leHBvcnQgY29uc3QgU1BSSVRFU0hFRVRfSEVJR0hUICA9IDUxMjtcclxuXHJcbi8vIERpbWVuc2lvbnMgb2Ygb25lIGZyYW1lIHdpdGhpbiB0aGUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9XSURUSCAgID0gNDg7XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9IRUlHSFQgID0gNzI7XHJcblxyXG5jb25zdCBUT1RBTF9ESUZGRVJFTlRfVEVYVFVSRVMgPSAzO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlciB7XHJcblxyXG4gICAgcmVhZG9ubHkgdGV4dHVyZTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRleHR1cmU6IGFueSkge1xyXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZSB7XHJcblxyXG4gICAgcHJpdmF0ZSB0ZXh0dXJlczogYW55W107XHJcbiAgICBwcml2YXRlIGxvYWRlZENvdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRUZXh0dXJlSWR4OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMubG9hZGVkQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoY2FsbGJhY2s6ICgpID0+IGFueSkge1xyXG4gICAgICAgIGxldCB0ZXh0dXJlTG9hZGVkSGFuZGxlciA9ICh0ZXh0dXJlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgLy8gSGF2ZSBpdCBzaG93IG9ubHkgb25lIGZyYW1lIGF0IGEgdGltZTpcclxuICAgICAgICAgICAgdGV4dHVyZS5yZXBlYXQuc2V0KFxyXG4gICAgICAgICAgICAgICAgRlJBTUVfV0lEVEggIC8gU1BSSVRFU0hFRVRfV0lEVEgsXHJcbiAgICAgICAgICAgICAgICBGUkFNRV9IRUlHSFQgLyBTUFJJVEVTSEVFVF9IRUlHSFRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlcy5wdXNoKHRleHR1cmUpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRlZENvdW50Kys7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxvYWRlZENvdW50ID49IFRPVEFMX0RJRkZFUkVOVF9URVhUVVJFUykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRleHR1cmVMb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgICAgIHRleHR1cmVMb2FkZXIubG9hZCgnZmFsbC1zdHVkZW50LnBuZycsIHRleHR1cmVMb2FkZWRIYW5kbGVyKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudDIucG5nJywgdGV4dHVyZUxvYWRlZEhhbmRsZXIpO1xyXG4gICAgICAgIHRleHR1cmVMb2FkZXIubG9hZCgnZmFsbC1zdHVkZW50My5wbmcnLCB0ZXh0dXJlTG9hZGVkSGFuZGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgbmV3SW5zdGFuY2UoKTogU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyIHtcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5nZXROZXh0VGV4dHVyZUlkeCgpO1xyXG4gICAgICAgIGxldCB0ZXh0dXJlID0gdGhpcy50ZXh0dXJlc1tpZHhdLmNsb25lKCk7IC8vIENsb25pbmcgdGV4dHVyZXMgaW4gdGhlIHZlcnNpb24gb2YgVGhyZWVKUyB0aGF0IEkgYW0gY3VycmVudGx5IHVzaW5nIHdpbGwgZHVwbGljYXRlIHRoZW0gOihcclxuICAgICAgICByZXR1cm4gbmV3IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcih0ZXh0dXJlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRUZXh0dXJlSWR4KCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHgrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50VGV4dHVyZUlkeCA+PSBUT1RBTF9ESUZGRVJFTlRfVEVYVFVSRVMpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGV4dHVyZUlkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRUZXh0dXJlSWR4O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UgPSBuZXcgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtTdGFuZGVlfSBmcm9tICcuL3N0YW5kZWUnO1xyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY01vdmVtZW50Q2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudCc7XHJcblxyXG5jb25zdCBZX09GRlNFVCA9IDAuNzU7IC8vIFNldHMgdGhlaXIgZmVldCBvbiB0aGUgZ3JvdW5kIHBsYW5lLlxyXG5cclxuY2xhc3MgU3RhbmRlZU1hbmFnZXIge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFuZGVlczogTWFwPG51bWJlciwgU3RhbmRlZT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YW5kZWVzID0gbmV3IE1hcDxudW1iZXIsIFN0YW5kZWU+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXRZKFlfT0ZGU0VUKTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY1BsYWNlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNQbGFjZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY1BsYWNlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RhbmRlZXMuZm9yRWFjaCgoc3RhbmRlZTogU3RhbmRlZSkgPT4ge1xyXG4gICAgICAgICAgICBzdGFuZGVlLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOcGNQbGFjZWRFdmVudChldmVudDogTnBjUGxhY2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IG5ldyBTdGFuZGVlKGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBzdGFuZGVlLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQoc3RhbmRlZS5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5zdGFuZGVlcy5zZXQoc3RhbmRlZS5ucGNJZCwgc3RhbmRlZSk7XHJcblxyXG4gICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Jbml0aWFsUG9zaXRpb24oc3RhbmRlZSwgeCwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtb3ZlVG9Jbml0aWFsUG9zaXRpb24oc3RhbmRlZTogU3RhbmRlZSwgeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICAvLyBUT0RPOiBVc2UgZXZlbnQueCwgZXZlbnQueSB3aXRoIHNjYWxpbmcgdG8gZGV0ZXJtaW5lIGRlc3RpbmF0aW9uXHJcbiAgICAgICAgc3RhbmRlZS5tb3ZlVG8oeCx6KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBzdGFuZGVlID0gdGhpcy5zdGFuZGVlcy5nZXQoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIGlmIChzdGFuZGVlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgICAgIHN0YW5kZWUud2Fsa1RvKHgsIHosIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc3RhbmRlZU1hbmFnZXIgPSBuZXcgU3RhbmRlZU1hbmFnZXIoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5kZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgU1BSSVRFU0hFRVRfV0lEVEgsXHJcbiAgICBTUFJJVEVTSEVFVF9IRUlHSFQsXHJcbiAgICBGUkFNRV9XSURUSCxcclxuICAgIEZSQU1FX0hFSUdIVCxcclxuICAgIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcixcclxuICAgIHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZX1cclxuZnJvbSAnLi9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UnO1xyXG5cclxuY29uc3QgU1RBTkRBUkRfREVMQVkgPSAyMjU7XHJcbmNvbnN0IFdBTEtfVVBfT1JfRE9XTl9ERUxBWSA9IE1hdGguZmxvb3IoU1RBTkRBUkRfREVMQVkgKiAoMi8zKSk7IC8vIEJlY2F1c2UgdXAvZG93biB3YWxrIGN5Y2xlcyBoYXZlIG1vcmUgZnJhbWVzLiBcclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb25GcmFtZSB7XHJcblxyXG4gICAgcmVhZG9ubHkgcm93OiBudW1iZXI7XHJcbiAgICByZWFkb25seSBjb2w6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb3c6IG51bWJlciwgY29sOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdzsgXHJcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBlbnVtIFN0YW5kZWVBbmltYXRpb25UeXBlIHtcclxuICAgIFN0YW5kVXAsXHJcbiAgICBTdGFuZERvd24sXHJcbiAgICBTdGFuZExlZnQsXHJcbiAgICBTdGFuZFJpZ2h0LFxyXG4gICAgV2Fsa1VwLFxyXG4gICAgV2Fsa0Rvd24sXHJcbiAgICBXYWxrTGVmdCxcclxuICAgIFdhbGtSaWdodCxcclxuICAgIENoZWVyVXAsXHJcbiAgICBQYW5pY1VwLFxyXG4gICAgUGFuaWNEb3duXHJcbn1cclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgXHJcbiAgICByZWFkb25seSB0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZTtcclxuICAgIHJlYWRvbmx5IG5leHQ6IFN0YW5kZWVBbmltYXRpb25UeXBlOyAvLyBQcm9iYWJseSBub3QgZ29pbmcgdG8gYmUgdXNlZCBmb3IgdGhpcyBnYW1lXHJcblxyXG4gICAgcmVhZG9ubHkgZnJhbWVzOiBTdGFuZGVlQW5pbWF0aW9uRnJhbWVbXTtcclxuICAgIHJlYWRvbmx5IGRlbGF5czogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIGN1cnJlbnRGcmFtZUlkeDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50RnJhbWVUaW1lRWxhcHNlZDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgZmluaXNoZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IodHlwZTogU3RhbmRlZUFuaW1hdGlvblR5cGUsIG5leHQ/OiBTdGFuZGVlQW5pbWF0aW9uVHlwZSkge1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgaWYgKG5leHQpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0ID0gbmV4dDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5leHQgPSB0eXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlbGF5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZyYW1lSWR4ID0gMDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1c2goZnJhbWU6IFN0YW5kZWVBbmltYXRpb25GcmFtZSwgZGVsYXkgPSBTVEFOREFSRF9ERUxBWSkge1xyXG4gICAgICAgIHRoaXMuZnJhbWVzLnB1c2goZnJhbWUpO1xyXG4gICAgICAgIHRoaXMuZGVsYXlzLnB1c2goZGVsYXkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID49IHRoaXMuZGVsYXlzW3RoaXMuY3VycmVudEZyYW1lSWR4XSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHgrKztcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEZyYW1lSWR4ID49IHRoaXMuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHggPSAwOyAvLyBTaG91bGRuJ3QgYmUgdXNlZCBhbnltb3JlLCBidXQgcHJldmVudCBvdXQtb2YtYm91bmRzIGFueXdheS5cclxuICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzRmluaXNoZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudEZyYW1lKCk6IFN0YW5kZWVBbmltYXRpb25GcmFtZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJhbWVzW3RoaXMuY3VycmVudEZyYW1lSWR4XTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVTcHJpdGVXcmFwcGVyIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuICAgIHByaXZhdGUgc3ByaXRlOiBhbnk7XHJcbiAgICBwcml2YXRlIHRleHR1cmVXcmFwcGVyOiBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50QW5pbWF0aW9uOiBTdGFuZGVlQW5pbWF0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUaHJlZUpTIG9iamVjdHM6IFxyXG4gICAgICAgIHRoaXMudGV4dHVyZVdyYXBwZXIgPSBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UubmV3SW5zdGFuY2UoKTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU3ByaXRlTWF0ZXJpYWwoe21hcDogdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlfSk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgVEhSRUUuU3ByaXRlKG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5zY2FsZS5zZXQoMSwgMS41KTsgLy8gQWRqdXN0IGFzcGVjdCByYXRpbyBmb3IgNDggeCA3MiBzaXplIGZyYW1lcy4gXHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5zcHJpdGUpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIGRlZmF1bHQgYW5pbWF0aW9uIHRvIHN0YW5kaW5nIGZhY2luZyBkb3duOlxyXG4gICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kRG93bigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vIFRPRE86IFNldCB0aGlzIGVsc2V3aGVyZVxyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5hZGp1c3RMaWdodGluZyhlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLnN0ZXBBbmltYXRpb24oZWxhcHNlZCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogT25seSBzd2l0Y2hlcyBpZiB0aGUgZ2l2ZW4gYW5pbWF0aW9uIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBjdXJyZW50IG9uZS5cclxuICAgICAqL1xyXG4gICAgc3dpdGNoQW5pbWF0aW9uKHR5cGU6IFN0YW5kZWVBbmltYXRpb25UeXBlKSB7XHJcbiAgICAgICAgbGV0IGFuaW1hdGlvbiA9IGRldGVybWluZUFuaW1hdGlvbih0eXBlKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uLnR5cGUgIT09IGFuaW1hdGlvbi50eXBlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcclxuICAgICAgICB9IFxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRqdXN0TGlnaHRpbmcoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gVE9ETzogTm90IHlldCBzdXJlIGlmIEknbGwgbmVlZCB0byB1c2UgdGhlIGVsYXBzZWQgdmFyaWFibGUgaGVyZS5cclxuICAgICAgICB0aGlzLnNwcml0ZS5tYXRlcmlhbC5jb2xvci5zZXQoMHhhYWFhYWEpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcEFuaW1hdGlvbihlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFuaW1hdGlvbi5pc0ZpbmlzaGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gZGV0ZXJtaW5lQW5pbWF0aW9uKHRoaXMuY3VycmVudEFuaW1hdGlvbi5uZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZyYW1lID0gdGhpcy5jdXJyZW50QW5pbWF0aW9uLmdldEN1cnJlbnRGcmFtZSgpO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGZyYW1lIGNvb3JkaW5hdGVzIHRvIHRleHR1cmUgY29vcmRpbmF0ZXMgYW5kIHNldCB0aGUgY3VycmVudCBvbmVcclxuICAgICAgICBsZXQgeHBjdCA9IChmcmFtZS5jb2wgKiBGUkFNRV9XSURUSCkgLyBTUFJJVEVTSEVFVF9XSURUSDtcclxuICAgICAgICBsZXQgeXBjdCA9ICgoKFNQUklURVNIRUVUX0hFSUdIVCAvIEZSQU1FX0hFSUdIVCkgLSAxIC0gZnJhbWUucm93KSAqIEZSQU1FX0hFSUdIVCkgLyBTUFJJVEVTSEVFVF9IRUlHSFQ7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlLm9mZnNldC5zZXQoeHBjdCwgeXBjdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRldGVybWluZUFuaW1hdGlvbih0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZSk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbjogU3RhbmRlZUFuaW1hdGlvbjtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlU3RhbmRVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZERvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrRG93bjpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVXYWxrTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kUmlnaHQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtSaWdodCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLkNoZWVyVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZUNoZWVyVXAoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFVwXHJcbmxldCBzdGFuZFVwRnJhbWUxICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFVwRnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgVXBcclxubGV0IHdhbGtVcEZyYW1lMSAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgd2Fsa1VwRnJhbWUyICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMSk7XHJcbmxldCB3YWxrVXBGcmFtZTMgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAyKTtcclxubGV0IHdhbGtVcEZyYW1lNCAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDMpO1xyXG5sZXQgd2Fsa1VwRnJhbWU1ICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMyk7XHJcbmxldCB3YWxrVXBGcmFtZTYgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg1LCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXApO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUyLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUzLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU1LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU2LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gU3RhbmRpbmcgRG93blxyXG5sZXQgc3RhbmREb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZERvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHN0YW5kRG93bkZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIERvd25cclxubGV0IHdhbGtEb3duRnJhbWUxICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDApO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTIgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMSk7XHJcbmxldCB3YWxrRG93bkZyYW1lMyAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAyKTtcclxubGV0IHdhbGtEb3duRnJhbWU0ICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDMpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTUgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMyk7XHJcbmxldCB3YWxrRG93bkZyYW1lNiAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtEb3duKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTIsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lMywgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTUsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lNiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIExlZnRcclxubGV0IHN0YW5kTGVmdEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDEpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU3RhbmRMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kTGVmdCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZExlZnRGcmFtZTEpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gV2Fsa2luZyBMZWZ0XHJcbmxldCB3YWxrTGVmdEZyYW1lMSAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAxKTtcclxubGV0IHdhbGtMZWZ0RnJhbWUyICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDApO1xyXG5sZXQgd2Fsa0xlZnRGcmFtZTMgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMSk7XHJcbmxldCB3YWxrTGVmdEZyYW1lNCAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAyKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0KTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFJpZ2h0XHJcbmxldCBzdGFuZFJpZ2h0RnJhbWUxICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kUmlnaHQoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFJpZ2h0RnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgUmlnaHRcclxubGV0IHdhbGtSaWdodEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDQpO1xyXG5sZXQgd2Fsa1JpZ2h0RnJhbWUyICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgNCk7XHJcbmxldCB3YWxrUmlnaHRGcmFtZTMgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxubGV0IHdhbGtSaWdodEZyYW1lNCAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDQpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlV2Fsa1JpZ2h0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtSaWdodEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gQ2hlZXIgVXBcclxubGV0IGNoZWVyVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgY2hlZXJVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMCk7XHJcbmxldCBjaGVlclVwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAxKTtcclxubGV0IGNoZWVyVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDApO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2hlZXJVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5DaGVlclVwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goY2hlZXJVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgVXBcclxubGV0IHBhbmljVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgcGFuaWNVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMik7XHJcbmxldCBwYW5pY1VwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAwKTtcclxubGV0IHBhbmljVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDIpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGFuaWNVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgRG93blxyXG5sZXQgcGFuaWNEb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcbmxldCBwYW5pY0Rvd25GcmFtZTIgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAxKTtcclxubGV0IHBhbmljRG93bkZyYW1lMyAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDIpO1xyXG5sZXQgcGFuaWNEb3duRnJhbWU0ICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMSk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQYW5pY0Rvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNEb3duRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvc3RhbmRlZS1tb3ZlbWVudC1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7U3RhbmRlZVNwcml0ZVdyYXBwZXIsIFN0YW5kZWVBbmltYXRpb25UeXBlfSBmcm9tICcuL3N0YW5kZWUtc3ByaXRlLXdyYXBwZXInO1xyXG5pbXBvcnQge2NhbWVyYVdyYXBwZXJ9IGZyb20gJy4uL2NhbWVyYS13cmFwcGVyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlIHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICByZWFkb25seSBzcHJpdGVXcmFwcGVyOiBTdGFuZGVlU3ByaXRlV3JhcHBlcjtcclxuXHJcbiAgICBwcml2YXRlIHdhbGtUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgd2Fsa1R3ZWVuOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBmYWNpbmc6IGFueTsgLy8gRmFjZXMgaW4gdGhlIHZlY3RvciBvZiB3aGljaCB3YXkgdGhlIE5QQyBpcyB3YWxraW5nLCB3YXMgd2Fsa2luZyBiZWZvcmUgc3RvcHBpbmcsIG9yIHdhcyBzZXQgdG8uXHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlciA9IG5ldyBTdGFuZGVlU3ByaXRlV3JhcHBlcigpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuc3ByaXRlV3JhcHBlci5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmZhY2luZyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoLTIwMCwgMCwgLTIwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0ZXBXYWxrKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQ29ycmVjdEFuaW1hdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEltbWVkaWF0ZWx5IHNldCBzdGFuZGVlIG9uIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBtb3ZlVG8oeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCh4LCAwLCB6KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBzdGFuZGVlIGluIG1vdGlvbiB0b3dhcmRzIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICogU3BlZWQgZGltZW5zaW9uIGlzIDEgdW5pdC9zZWMuXHJcbiAgICAgKi9cclxuICAgIHdhbGtUbyh4OiBudW1iZXIsIHo6IG51bWJlciwgc3BlZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3cgbG9uZyBpdCB3b3VsZCB0YWtlLCBnaXZlbiB0aGUgc3BlZWQgcmVxdWVzdGVkLlxyXG4gICAgICAgIGxldCB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMyh4LCAwLCB6KS5zdWIodGhpcy5ncm91cC5wb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gdmVjdG9yLmxlbmd0aCgpO1xyXG4gICAgICAgIGxldCB0aW1lID0gKGRpc3RhbmNlIC8gc3BlZWQpICogMTAwMDtcclxuXHJcbiAgICAgICAgLy8gRGVsZWdhdGUgdG8gdHdlZW4uanMuIFBhc3MgaW4gY2xvc3VyZXMgYXMgY2FsbGJhY2tzIGJlY2F1c2Ugb3RoZXJ3aXNlICd0aGlzJyB3aWxsIHJlZmVyXHJcbiAgICAgICAgLy8gdG8gdGhlIHBvc2l0aW9uIG9iamVjdCwgd2hlbiBleGVjdXRpbmcgc3RvcFdhbGsoKS5cclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZ3JvdXAucG9zaXRpb24pXHJcbiAgICAgICAgICAgIC50byh7eDogeCwgejogen0sIHRpbWUpXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IHsgdGhpcy5zdG9wV2FsaygpOyB9KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy53YWxrVHdlZW5FbGFwc2VkKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBVcGRhdGUgZGlyZWN0aW9uIHRoaXMgc3RhbmRlZSB3aWxsIGJlIGZhY2luZyB3aGVuIHdhbGtpbmcuXHJcbiAgICAgICAgdGhpcy5mYWNpbmcuc2V0WCh4IC0gdGhpcy5ncm91cC5wb3NpdGlvbi54KTtcclxuICAgICAgICB0aGlzLmZhY2luZy5zZXRaKHogLSB0aGlzLmdyb3VwLnBvc2l0aW9uLnopO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcFdhbGsoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2Fsa1R3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMud2Fsa1R3ZWVuLnVwZGF0ZSh0aGlzLndhbGtUd2VlbkVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0b3BXYWxrKCkge1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoXHJcbiAgICAgICAgICAgIHRoaXMubnBjSWQsXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi56KVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbnN1cmVDb3JyZWN0QW5pbWF0aW9uKCkge1xyXG4gICAgICAgIC8vIGxldCB0YXJnZXQgPSB0aGlzLmdyb3VwLnBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgLy8gdGFyZ2V0LnNldFkodGFyZ2V0LnkgKyAwLjUpO1xyXG4gICAgICAgIC8vIGNhbWVyYVdyYXBwZXIuY2FtZXJhLmxvb2tBdCh0YXJnZXQpO1xyXG5cclxuICAgICAgICAvLyBBbmdsZSBiZXR3ZWVuIHR3byB2ZWN0b3JzOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTQ4NDIyOFxyXG4gICAgICAgIGxldCB3b3JsZERpcmVjdGlvbiA9IGNhbWVyYVdyYXBwZXIuY2FtZXJhLmdldFdvcmxkRGlyZWN0aW9uKCk7XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0aGlzLmZhY2luZy56LCB0aGlzLmZhY2luZy54KSAtIE1hdGguYXRhbjIod29ybGREaXJlY3Rpb24ueiwgd29ybGREaXJlY3Rpb24ueCk7XHJcbiAgICAgICAgaWYgKGFuZ2xlIDwgMCkgYW5nbGUgKz0gMiAqIE1hdGguUEk7XHJcbiAgICAgICAgYW5nbGUgKj0gKDE4MC9NYXRoLlBJKTsgLy8gSXQncyBteSBwYXJ0eSBhbmQgSSdsbCB1c2UgZGVncmVlcyBpZiBJIHdhbnQgdG8uXHJcblxyXG4gICAgICAgIGlmICh0aGlzLndhbGtUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmdsZSA8IDYwIHx8IGFuZ2xlID49IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDYwICYmIGFuZ2xlIDwgMTIwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gMTIwICYmIGFuZ2xlIDwgMjQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSAyNDAgJiYgYW5nbGUgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0xlZnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGFuZ2xlIDwgNjAgfHwgYW5nbGUgPj0gMzAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kVXApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDYwICYmIGFuZ2xlIDwgMTIwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDEyMCAmJiBhbmdsZSA8IDI0MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZERvd24pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDI0MCAmJiBhbmdsZSA8IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtjYW1lcmFXcmFwcGVyfSBmcm9tICcuL2NhbWVyYS13cmFwcGVyJztcclxuaW1wb3J0IHt3b3JsZH0gZnJvbSAnLi93b3JsZC93b3JsZCc7XHJcbmltcG9ydCB7TGlnaHRpbmdHcmlkfSBmcm9tICcuL2xpZ2h0aW5nL2xpZ2h0aW5nLWdyaWQnO1xyXG5pbXBvcnQge1N3aXRjaGJvYXJkfSBmcm9tICcuL2xpZ2h0aW5nL3N3aXRjaGJvYXJkJztcclxuaW1wb3J0IHtzdGFuZGVlTWFuYWdlcn0gZnJvbSAnLi9zdGFuZGVlL3N0YW5kZWUtbWFuYWdlcic7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtIcE9yaWVudGF0aW9ufSBmcm9tICcuL2hwLW9yaWVudGF0aW9uJztcclxuXHJcbmNsYXNzIFZpZXcge1xyXG5cclxuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIHByaXZhdGUgc2NlbmU6IGFueTtcclxuICAgIHByaXZhdGUgcmVuZGVyZXI6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIGh1bWFuR3JpZDogTGlnaHRpbmdHcmlkO1xyXG4gICAgcHJpdmF0ZSBodW1hblN3aXRjaGJvYXJkOiBTd2l0Y2hib2FyZDtcclxuICAgIHByaXZhdGUgYWlHcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIGFpU3dpdGNoYm9hcmQ6IFN3aXRjaGJvYXJkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YW50aWFsaWFzOiB0cnVlLCBjYW52YXM6IHRoaXMuY2FudmFzfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaHVtYW5HcmlkID0gbmV3IExpZ2h0aW5nR3JpZCgpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5Td2l0Y2hib2FyZCA9IG5ldyBTd2l0Y2hib2FyZCh0aGlzLmh1bWFuR3JpZCwgUGxheWVyVHlwZS5IdW1hbik7XHJcbiAgICAgICAgdGhpcy5haUdyaWQgPSBuZXcgTGlnaHRpbmdHcmlkKCk7XHJcbiAgICAgICAgdGhpcy5haVN3aXRjaGJvYXJkID0gbmV3IFN3aXRjaGJvYXJkKHRoaXMuYWlHcmlkLCBQbGF5ZXJUeXBlLkFpKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmh1bWFuR3JpZC5zdGFydChIcE9yaWVudGF0aW9uLkRlY3JlYXNlc1JpZ2h0VG9MZWZ0KTtcclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmFpR3JpZC5zdGFydChIcE9yaWVudGF0aW9uLkRlY3JlYXNlc0xlZnRUb1JpZ2h0KTtcclxuICAgICAgICB0aGlzLmFpU3dpdGNoYm9hcmQuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb1N0YXJ0KCk7XHJcblxyXG4gICAgICAgIHdvcmxkLnN0YXJ0KCk7XHJcbiAgICAgICAgc3RhbmRlZU1hbmFnZXIuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGNhbnZhcyBzaG91bGQgaGF2ZSBiZWVuIGhpZGRlbiB1bnRpbCBzZXR1cCBpcyBjb21wbGV0ZS5cclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB3b3JsZC5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmh1bWFuR3JpZC5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmFpR3JpZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5Td2l0Y2hib2FyZC5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICBzdGFuZGVlTWFuYWdlci5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCBjYW1lcmFXcmFwcGVyLmNhbWVyYSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkb1N0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHdvcmxkLmdyb3VwKTtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZChzdGFuZGVlTWFuYWdlci5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMuaHVtYW5HcmlkLmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5haUdyaWQuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLmdyb3VwLnBvc2l0aW9uLnNldFgoMTEpO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLmdyb3VwLnBvc2l0aW9uLnNldFooMSk7XHJcbiAgICAgICAgdGhpcy5haUdyaWQuZ3JvdXAucm90YXRpb24ueSA9IC1NYXRoLlBJIC8gNDtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogVGVtcG9yYXJ5IGZvciBkZWJ1Z2dpbmc/XHJcbiAgICAgICAgLy8gdGhpcy5zY2VuZS5hZGQobmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDQwNDA0MCkpO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBUZW1wb3JhcnlcclxuICAgICAgICBsZXQgc3BvdExpZ2h0ID0gbmV3IFRIUkVFLlNwb3RMaWdodCgweGJiYmJmZik7XHJcbiAgICAgICAgc3BvdExpZ2h0LnBvc2l0aW9uLnNldCgtMywgMC43NSwgMTUpO1xyXG4gICAgICAgIHNwb3RMaWdodC50YXJnZXQgPSB0aGlzLmFpR3JpZC5ncm91cDtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZChzcG90TGlnaHQpO1xyXG5cclxuICAgICAgICBjYW1lcmFXcmFwcGVyLnNldFBvc2l0aW9uKC0zLCAwLjc1LCAxNSk7IC8vIE1vcmUgb3IgbGVzcyBleWUtbGV2ZWwgd2l0aCB0aGUgTlBDcy5cclxuICAgICAgICBjYW1lcmFXcmFwcGVyLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMyg1LCA4LCAyKSk7XHJcblxyXG4gICAgICAgIGNhbWVyYVdyYXBwZXIudXBkYXRlUmVuZGVyZXJTaXplKHRoaXMucmVuZGVyZXIpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbWVyYVdyYXBwZXIudXBkYXRlUmVuZGVyZXJTaXplKHRoaXMucmVuZGVyZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCB2aWV3ID0gbmV3IFZpZXcoKTtcclxuIiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgZ3Jhc3M6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDMwMCwgMzAwKTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7ZW1pc3NpdmU6IDB4MDIxZDAzLCBlbWlzc2l2ZUludGVuc2l0eTogMS4wfSk7XHJcbiAgICAgICAgdGhpcy5ncmFzcyA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgdGhpcy5ncmFzcy5yb3RhdGlvbi54ID0gKE1hdGguUEkgKiAzKSAvIDI7XHJcbiAgICAgICAgdGhpcy5ncmFzcy5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5ncmFzcyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBncm91bmQgPSBuZXcgR3JvdW5kKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuY29uc3QgU1RBUlRfWl9BTkdMRSA9IC0oTWF0aC5QSSAvIDMwKTtcclxuY29uc3QgRU5EX1pfQU5HTEUgICA9ICAgTWF0aC5QSSAvIDMwO1xyXG5jb25zdCBST1RBVElPTl9TUEVFRCA9IDAuMDAwMTtcclxuXHJcbmNsYXNzIFNreSB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIGRvbWU6IGFueTtcclxuICAgIHByaXZhdGUgcmR6OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoNTAsIDMyLCAzMik7IC8vIG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgxNTAsIDE1MCwgMTUwKTtcclxuICAgICAgICBsZXQgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuZ2VuZXJhdGVUZXh0dXJlKCkpO1xyXG4gICAgICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7bWFwOiB0ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZX0pO1xyXG4gICAgICAgIHRoaXMuZG9tZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgdGhpcy5kb21lLm1hdGVyaWFsLnNpZGUgPSBUSFJFRS5CYWNrU2lkZTtcclxuICAgICAgICB0aGlzLmRvbWUucG9zaXRpb24uc2V0KDEwLCAxMCwgMCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5kb21lKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZHogPSAtUk9UQVRJT05fU1BFRUQ7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5kb21lLnJvdGF0aW9uLnNldCgwLCAwLCBTVEFSVF9aX0FOR0xFKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuZG9tZS5yb3RhdGlvbi5zZXQoMCwgMCwgdGhpcy5kb21lLnJvdGF0aW9uLnogKyB0aGlzLnJkeik7XHJcbiAgICAgICAgaWYgKHRoaXMuZG9tZS5yb3RhdGlvbi56ID49IEVORF9aX0FOR0xFKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmR6ID0gLVJPVEFUSU9OX1NQRUVEO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5kb21lLnJvdGF0aW9uLnogPD0gU1RBUlRfWl9BTkdMRSkge1xyXG4gICAgICAgICAgICB0aGlzLnJkeiA9IFJPVEFUSU9OX1NQRUVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJhc2VkIG9uOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xOTk5MjUwNVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdlbmVyYXRlVGV4dHVyZSgpOiBhbnkge1xyXG4gICAgICAgIGxldCBzaXplID0gNTEyO1xyXG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICBjYW52YXMud2lkdGggPSBzaXplO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBzaXplO1xyXG4gICAgICAgIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICBjdHgucmVjdCgwLCAwLCBzaXplLCBzaXplKTtcclxuICAgICAgICBsZXQgZ3JhZGllbnQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgc2l6ZSk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuMDAsICcjMDAwMDAwJyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuNDAsICcjMTMxYzQ1Jyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuNzUsICcjZmY5NTQ0Jyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuODUsICcjMTMxYzQ1Jyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEuMDAsICcjMTMxYzQ1Jyk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgcmV0dXJuIGNhbnZhcztcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc2t5ID0gbmV3IFNreSgpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7c2t5fSBmcm9tICcuL3NreSc7XHJcbmltcG9ydCB7Z3JvdW5kfSBmcm9tICcuL2dyb3VuZCc7XHJcblxyXG5jbGFzcyBXb3JsZCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHNreS5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQoZ3JvdW5kLmdyb3VwKTtcclxuXHJcbiAgICAgICAgc2t5LnN0YXJ0KCk7XHJcbiAgICAgICAgZ3JvdW5kLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBza3kuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBncm91bmQuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgd29ybGQgPSBuZXcgV29ybGQoKTsiXX0=
