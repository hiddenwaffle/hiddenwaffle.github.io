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
},{"../domain/player-movement":5,"../event/event-bus":9,"../event/player-movement-event":14,"./input":2}],2:[function(require,module,exports){
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
exports.PANEL_COUNT_PER_FLOOR = 10;
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{"./event-bus":9}],7:[function(require,module,exports){
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
},{"./event-bus":9}],8:[function(require,module,exports){
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
},{"./event-bus":9}],9:[function(require,module,exports){
"use strict";
(function (EventType) {
    EventType[EventType["ActiveShapeChangedEventType"] = 0] = "ActiveShapeChangedEventType";
    EventType[EventType["ActiveShapeEndedEventType"] = 1] = "ActiveShapeEndedEventType";
    EventType[EventType["BoardFilledEventType"] = 2] = "BoardFilledEventType";
    EventType[EventType["CellChangeEventType"] = 3] = "CellChangeEventType";
    EventType[EventType["FallingSequencerEventType"] = 4] = "FallingSequencerEventType";
    EventType[EventType["HpChangedEventType"] = 5] = "HpChangedEventType";
    EventType[EventType["NpcMovementChangedEventType"] = 6] = "NpcMovementChangedEventType";
    EventType[EventType["NpcPlacedEventType"] = 7] = "NpcPlacedEventType";
    EventType[EventType["NpcStateChagedEventType"] = 8] = "NpcStateChagedEventType";
    EventType[EventType["PlayerMovementEventType"] = 9] = "PlayerMovementEventType";
    EventType[EventType["RowsClearAnimationCompletedEventType"] = 10] = "RowsClearAnimationCompletedEventType";
    EventType[EventType["RowsFilledEventType"] = 11] = "RowsFilledEventType";
    EventType[EventType["StandeeMovementEndedEventType"] = 12] = "StandeeMovementEndedEventType";
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
},{}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var FallingSequencerEvent = (function (_super) {
    __extends(FallingSequencerEvent, _super);
    function FallingSequencerEvent(playerType) {
        _super.call(this);
        this.playerType = playerType;
    }
    FallingSequencerEvent.prototype.getType = function () {
        return event_bus_1.EventType.FallingSequencerEventType;
    };
    return FallingSequencerEvent;
}(event_bus_1.AbstractEvent));
exports.FallingSequencerEvent = FallingSequencerEvent;
},{"./event-bus":9}],11:[function(require,module,exports){
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
},{"./event-bus":9}],12:[function(require,module,exports){
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
},{"./event-bus":9}],13:[function(require,module,exports){
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
},{"./event-bus":9}],14:[function(require,module,exports){
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
},{"./event-bus":9}],15:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var RowsClearAnimationCompletedEvent = (function (_super) {
    __extends(RowsClearAnimationCompletedEvent, _super);
    function RowsClearAnimationCompletedEvent(playerType) {
        _super.call(this);
        this.playerType = playerType;
    }
    RowsClearAnimationCompletedEvent.prototype.getType = function () {
        return event_bus_1.EventType.RowsClearAnimationCompletedEventType;
    };
    return RowsClearAnimationCompletedEvent;
}(event_bus_1.AbstractEvent));
exports.RowsClearAnimationCompletedEvent = RowsClearAnimationCompletedEvent;
},{"./event-bus":9}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var RowsFilledEvent = (function (_super) {
    __extends(RowsFilledEvent, _super);
    function RowsFilledEvent(filledRowIdxs, playerType) {
        _super.call(this);
        this.filledRowIdxs = filledRowIdxs.slice(0);
        this.playerType = playerType;
    }
    RowsFilledEvent.prototype.getType = function () {
        return event_bus_1.EventType.RowsFilledEventType;
    };
    return RowsFilledEvent;
}(event_bus_1.AbstractEvent));
exports.RowsFilledEvent = RowsFilledEvent;
},{"./event-bus":9}],17:[function(require,module,exports){
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
},{"./event-bus":9}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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
},{"./controller/controller":1,"./game-state":18,"./model/model":25,"./preloader":28,"./view/view":39}],20:[function(require,module,exports){
"use strict";
var constants_1 = require('../../domain/constants');
var MAX_COLS = constants_1.PANEL_COUNT_PER_FLOOR;
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
            for (var idx = 0; idx < MAX_COLS; idx++) {
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
},{"../../domain/constants":4}],21:[function(require,module,exports){
"use strict";
var cell_1 = require('../../domain/cell');
var constants_1 = require('../../domain/constants');
var shape_factory_1 = require('./shape-factory');
var event_bus_1 = require('../../event/event-bus');
var cell_change_event_1 = require('../../event/cell-change-event');
var rows_filled_event_1 = require('../../event/rows-filled-event');
var active_shape_changed_event_1 = require('../../event/active-shape-changed-event');
var board_filled_event_1 = require('../../event/board-filled-event');
var MAX_ROWS = 19; // Top 2 rows are obstructed from view. Also, see lighting-grid.ts.
var MAX_COLS = constants_1.PANEL_COUNT_PER_FLOOR;
var TEMP_DELAY_MS = 500;
var Board = (function () {
    function Board(playerType, shapeFactory, eventBus) {
        this.playerType = playerType;
        this.shapeFactory = shapeFactory;
        this.eventBus = eventBus;
        this.boardState = 0 /* Paused */;
        this.msTillGravityTick = TEMP_DELAY_MS;
        this.currentShape = null;
        this.matrix = [];
        for (var rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
            this.matrix[rowIdx] = [];
            for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                this.matrix[rowIdx][colIdx] = new cell_1.Cell();
            }
        }
        if (playerType === 0 /* Human */) {
            this.junkRowHoleColumn = 0;
        }
        else {
            this.junkRowHoleColumn = MAX_COLS - 1;
        }
        this.junkRowHoleDirection = 1;
        this.junkRowColor1 = 8 /* White */;
        this.junkRowColor2 = 8 /* White */;
        this.junkRowColorIdx = 0;
    }
    Board.prototype.resetAndPlay = function () {
        this.clear();
        this.boardState = 1 /* InPlay */;
        this.startShape(true);
    };
    /**
     * This gives a high level view of the main game loop.
     * This shouldn't be called by the AI.
     */
    Board.prototype.step = function (elapsed) {
        if (this.boardState === 0 /* Paused */) {
            // This is here just to ensure that the method to runs immediately after unpausing.
            this.msTillGravityTick = 0;
        }
        else {
            this.msTillGravityTick -= elapsed;
            if (this.msTillGravityTick <= 0) {
                this.msTillGravityTick = TEMP_DELAY_MS;
                if (this.tryGravity()) {
                    this.moveShapeDown();
                }
                else {
                    this.handleEndOfCurrentPieceTasks();
                }
            }
        }
    };
    /**
     * Call this once a shape is known to be in its final resting position.
     */
    Board.prototype.handleEndOfCurrentPieceTasks = function () {
        this.convertShapeToCells();
        if (this.handleFullBoard()) {
        }
        else {
            if (this.handleAnyFilledLinesPart1()) {
            }
            else {
                this.startShape(false);
            }
        }
    };
    /**
     * Used by the AI.
     */
    Board.prototype.getCurrentShapeColIdx = function () {
        return this.currentShape.getCol();
    };
    Board.prototype.moveShapeLeft = function () {
        var success;
        if (this.boardState === 1 /* InPlay */) {
            this.currentShape.moveLeft();
            if (this.collisionDetected()) {
                this.currentShape.moveRight();
                success = false;
            }
            else {
                this.fireActiveShapeChangedEvent();
                success = true;
            }
        }
        else {
            success = false;
        }
        return success;
    };
    Board.prototype.moveShapeRight = function () {
        var success;
        if (this.boardState === 1 /* InPlay */) {
            this.currentShape.moveRight();
            if (this.collisionDetected()) {
                this.currentShape.moveLeft();
                success = false;
            }
            else {
                this.fireActiveShapeChangedEvent();
                success = true;
            }
        }
        else {
            success = false;
        }
        return success;
    };
    Board.prototype.moveShapeDown = function () {
        var success;
        if (this.boardState === 1 /* InPlay */) {
            this.currentShape.moveDown();
            if (this.collisionDetected()) {
                this.currentShape.moveUp();
                success = false;
            }
            else {
                this.fireActiveShapeChangedEvent();
                success = true;
            }
        }
        else {
            success = false;
        }
        return success;
    };
    Board.prototype.moveShapeDownAllTheWay = function () {
        var success;
        if (this.boardState === 1 /* InPlay */) {
            do {
                this.currentShape.moveDown();
            } while (!this.collisionDetected()); // TODO: Add upper bound.
            this.currentShape.moveUp();
            this.fireActiveShapeChangedEvent();
            success = true;
        }
        else {
            success = false;
        }
        return success;
    };
    /**
     * Used by the AI.
     */
    Board.prototype.moveToTop = function () {
        this.currentShape.moveToTop();
    };
    Board.prototype.rotateShapeClockwise = function () {
        var success;
        if (this.boardState === 1 /* InPlay */) {
            this.currentShape.rotateClockwise();
            if (this.collisionDetected()) {
                this.currentShape.rotateCounterClockwise();
                success = false;
            }
            else {
                this.fireActiveShapeChangedEvent();
                success = true;
            }
        }
        else {
            success = false;
        }
        return success;
    };
    Board.prototype.addJunkRows = function (numberOfRowsToAdd) {
        // Clear rows at the top to make room at the bottom.
        this.matrix.splice(0, numberOfRowsToAdd);
        // Add junk rows at the bottom.
        for (var idx = 0; idx < numberOfRowsToAdd; idx++) {
            // Set the row to completely filled.
            var color = this.getNextJunkRowColor();
            var row = [];
            for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                var cell_2 = new cell_1.Cell();
                cell_2.setColor(color);
                row.push(cell_2);
            }
            // Punch a hole in the line.
            var cell = row[this.junkRowHoleColumn];
            cell.setColor(0 /* Empty */);
            // Prepare for the next junk row line.
            this.junkRowHoleColumn += this.junkRowHoleDirection;
            if (this.junkRowHoleColumn < 0) {
                this.junkRowHoleColumn = 1;
                this.junkRowHoleDirection *= -1; // Flips the direction
            }
            else if (this.junkRowHoleColumn >= MAX_COLS) {
                this.junkRowHoleColumn = MAX_COLS - 2;
                this.junkRowHoleDirection *= -1; // Flips the direction
            }
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
    /**
     * Very hacky method just so the AI has a temp copy of the board to experiment with.
     */
    Board.prototype.cloneZombie = function () {
        var copy = new Board(this.playerType, shape_factory_1.deadShapeFactory, event_bus_1.deadEventBus);
        // Allow the AI to move and rotate the current shape
        copy.boardState = 1 /* InPlay */;
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
     * Used by the FallingSequencer.
     */
    Board.prototype.calculateHighestColumn = function () {
        var colHeights = this.calculateColumnHeights();
        return colHeights.reduce(function (a, b) { return a > b ? a : b; });
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
        for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
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
        for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            colHeights.push(0);
        }
        for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
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
        _a = this.getRandomColors(), this.junkRowColor1 = _a[0], this.junkRowColor2 = _a[1];
        var _a;
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
    Board.prototype.handleFullBoard = function () {
        var full = this.isBoardFull();
        if (full) {
            this.boardState = 0 /* Paused */; // Standby until sequence is finished.
            this.eventBus.fire(new board_filled_event_1.BoardFilledEvent(this.playerType));
            full = true;
        }
        return full;
    };
    /**
     * It is considered full if the two obscured rows at the top have colored cells in them.
     */
    Board.prototype.isBoardFull = function () {
        for (var rowIdx = 0; rowIdx < 2; rowIdx++) {
            for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                if (cell.getColor() !== 0 /* Empty */) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Handle filled lines method 1 of 2, before animation.
     */
    Board.prototype.handleAnyFilledLinesPart1 = function () {
        var filledRowIdxs = this.determineFilledRowIdxs();
        if (filledRowIdxs.length > 0) {
            this.eventBus.fire(new rows_filled_event_1.RowsFilledEvent(filledRowIdxs, this.playerType));
            this.boardState = 0 /* Paused */; // Standby until animation is finished.
        }
        else {
        }
        return filledRowIdxs.length > 0;
    };
    /**
     * Handle filled lines method 2 of 2, after animation.
     * This is public so that the Model can call it.
     */
    Board.prototype.handleAnyFilledLinesPart2 = function () {
        // Have to check this again because there is a slight chance that rows shifted during the animation.
        var filledRowIdxs = this.determineFilledRowIdxs();
        // Remove the filled rows.
        // I think this only works because determineFilledRowIdxs() returns an array sorted ascending from 0.
        // If it wasn't sorted then it could end up skipping rows.
        for (var _i = 0, filledRowIdxs_1 = filledRowIdxs; _i < filledRowIdxs_1.length; _i++) {
            var filledRowIdx = filledRowIdxs_1[_i];
            this.removeAndCollapse(filledRowIdx);
        }
        // Have to send cell change notifications because removeAndCollapse() does not.
        this.notifyAllCells();
        // Animation was finished and board was updated, so resume play.
        this.boardState = 1 /* InPlay */;
        this.startShape(false);
    };
    /**
     * Removes only the bottom row.
     */
    Board.prototype.removeBottomLine = function () {
        this.removeAndCollapse(MAX_ROWS - 1);
        // Have to send cell change notifications because removeAndCollapse() does not.
        this.notifyAllCells();
    };
    Board.prototype.notifyAllCells = function () {
        for (var rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                this.eventBus.fire(new cell_change_event_1.CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
            }
        }
    };
    /**
     * Returns a list of numbers, ascending, that correspond to filled rows.
     */
    Board.prototype.determineFilledRowIdxs = function () {
        var filledRowIdxs = [];
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
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
                filledRowIdxs.push(rowIdx);
            }
        }
        return filledRowIdxs;
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
    Board.prototype.fireActiveShapeChangedEvent = function (starting) {
        if (starting === void 0) { starting = false; }
        this.eventBus.fire(new active_shape_changed_event_1.ActiveShapeChangedEvent(this.currentShape, this.playerType, starting));
    };
    Board.prototype.getNextJunkRowColor = function () {
        var color;
        if (this.junkRowColorIdx <= 0) {
            color = this.junkRowColor1;
            this.junkRowColorIdx = 1;
        }
        else if (this.junkRowColorIdx >= 1) {
            color = this.junkRowColor2;
            this.junkRowColorIdx = 0;
        }
        return color;
    };
    Board.prototype.getRandomColors = function () {
        // Select two colors that are not equal to each other.
        var rand1 = Math.floor(Math.random() * 7);
        var rand2 = Math.floor(Math.random() * 7);
        if (rand1 === rand2) {
            rand2++;
            if (rand2 > 6) {
                rand2 = 0;
            }
        }
        return [this.colorByNumber(rand1), this.colorByNumber(rand2)];
    };
    Board.prototype.colorByNumber = function (value) {
        var color;
        switch (value) {
            case 0:
                color = 1 /* Cyan */;
                break;
            case 1:
                color = 2 /* Yellow */;
                break;
            case 2:
                color = 3 /* Purple */;
                break;
            case 3:
                color = 4 /* Green */;
                break;
            case 4:
                color = 5 /* Red */;
                break;
            case 5:
                color = 6 /* Blue */;
                break;
            case 6:
                color = 7 /* Orange */;
                break;
            default:
                color = 8 /* White */; // Shouldn't get here
        }
        return color;
    };
    return Board;
}());
exports.Board = Board;
},{"../../domain/cell":3,"../../domain/constants":4,"../../event/active-shape-changed-event":6,"../../event/board-filled-event":7,"../../event/cell-change-event":8,"../../event/event-bus":9,"../../event/rows-filled-event":16,"./shape-factory":23}],22:[function(require,module,exports){
"use strict";
var FALL_TIME_MS = 1250;
var FallGuide = (function () {
    function FallGuide() {
    }
    return FallGuide;
}());
var FallingSequencer = (function () {
    function FallingSequencer(board) {
        this.board = board;
        this.fallTween = null;
        this.fallGuide = new FallGuide();
    }
    FallingSequencer.prototype.resetAndPlay = function (callback) {
        var _this = this;
        this.fallGuide.lastHeight = this.fallGuide.tweenedHeight = this.board.calculateHighestColumn();
        this.fallGuide.elapsed = 0;
        this.fallTween = new TWEEN.Tween(this.fallGuide)
            .to({ tweenedHeight: 0 }, FALL_TIME_MS)
            .easing(TWEEN.Easing.Linear.None) // Surprisingly, linear is the one that looks most "right".
            .onComplete(function () {
            _this.fallTween = null;
            _this.board.resetAndPlay();
            callback();
        })
            .start(this.fallGuide.elapsed);
    };
    /**
     * Doing this in two parts because onComplete() can set the tween to null.
     */
    FallingSequencer.prototype.step = function (elapsed) {
        if (this.fallTween != null) {
            this.fallGuide.elapsed += elapsed;
            this.fallTween.update(this.fallGuide.elapsed);
        }
        if (this.fallTween != null) {
            var newHeight = Math.ceil(this.fallGuide.tweenedHeight);
            if (this.fallGuide.lastHeight > newHeight) {
                var diff = this.fallGuide.lastHeight - newHeight;
                for (var idx = 0; idx < diff; idx++) {
                    this.board.removeBottomLine();
                }
                this.fallGuide.lastHeight = newHeight;
            }
        }
    };
    return FallingSequencer;
}());
exports.FallingSequencer = FallingSequencer;
},{}],23:[function(require,module,exports){
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
        this.startingEligible = true;
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
        this.startingEligible = true;
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
        this.startingEligible = true;
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
        this.startingEligible = false;
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
        this.startingEligible = false;
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
        this.startingEligible = true;
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
        this.startingEligible = false;
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
        return this.bag.pop(); // Get from end of array.
    };
    ShapeFactory.prototype.refillBag = function (startingPieceAsFirst) {
        this.bag = [
            new ShapeI(),
            new ShapeJ(),
            new ShapeL(),
            new ShapeT(),
            new ShapeO(),
            new ShapeS(),
            new ShapeZ()
        ];
        {
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
        }
        // Only certain shapes can be dropped onto what could be a blank or almost-blank grid.
        if (startingPieceAsFirst === true) {
            var lastIdx = this.bag.length - 1;
            if (this.bag[lastIdx].startingEligible === true) {
            }
            else {
                for (var idx = 0; idx < lastIdx; idx++) {
                    if (this.bag[idx].startingEligible === true) {
                        var tempVal = this.bag[lastIdx];
                        this.bag[lastIdx] = this.bag[idx];
                        this.bag[idx] = tempVal;
                        break;
                    }
                }
            }
        }
    };
    return ShapeFactory;
}());
exports.ShapeFactory = ShapeFactory;
exports.deadShapeFactory = new ShapeFactory(); // Used by AI.
},{"./shape":24}],24:[function(require,module,exports){
"use strict";
var cell_1 = require('../../domain/cell');
var SPAWN_COL = 3; // Left side of matrix should correspond to this.
var Shape = (function () {
    function Shape() {
        this.currentMatrixIndex = 0; // TODO: Ensure position 0 is the spawn position
        this.row = 0;
        this.col = SPAWN_COL;
        this.startingEligible = false;
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
},{"../../domain/cell":3}],25:[function(require,module,exports){
"use strict";
var board_1 = require('./board/board');
var ai_1 = require('./ai/ai');
var npc_manager_1 = require('./npc/npc-manager');
var event_bus_1 = require('../event/event-bus');
var player_movement_1 = require('../domain/player-movement');
var constants_1 = require('../domain/constants');
var hp_changed_event_1 = require('../event/hp-changed-event');
var shape_factory_1 = require('./board/shape-factory');
var falling_sequencer_1 = require('./board/falling-sequencer');
var falling_sequencer_event_1 = require('../event/falling-sequencer-event');
var MAX_HP = constants_1.PANEL_COUNT_PER_FLOOR; // HP corresponds to the number of long windows on the second floor of the physical building.
var Model = (function () {
    function Model() {
        var humanShapeFactory = new shape_factory_1.ShapeFactory();
        this.humanBoard = new board_1.Board(0 /* Human */, humanShapeFactory, event_bus_1.eventBus);
        this.humanFallingSequencer = new falling_sequencer_1.FallingSequencer(this.humanBoard);
        this.humanHitPoints = MAX_HP;
        var aiShapeFactory = new shape_factory_1.ShapeFactory();
        this.aiBoard = new board_1.Board(1 /* Ai */, aiShapeFactory, event_bus_1.eventBus);
        this.aiFallingSequencer = new falling_sequencer_1.FallingSequencer(this.aiBoard);
        this.aiHitPoints = MAX_HP;
        this.ai = new ai_1.Ai(this.aiBoard);
    }
    Model.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.PlayerMovementEventType, function (event) {
            _this.handlePlayerMovement(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.RowsFilledEventType, function (event) {
            _this.handleRowsFilledEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.RowsClearAnimationCompletedEventType, function (event) {
            _this.handleRowClearAnimationCompletedEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.BoardFilledEventType, function (event) {
            _this.handleBoardFilledEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.ActiveShapeChangedEventType, function (event) {
            _this.handleActiveShapeChangedEvent(event);
        });
        this.ai.start();
        npc_manager_1.npcManager.start();
        // TODO: Instead of here, start game when player hits a key first.
        this.humanBoard.resetAndPlay();
        this.aiBoard.resetAndPlay();
    };
    Model.prototype.step = function (elapsed) {
        this.humanBoard.step(elapsed);
        this.humanFallingSequencer.step(elapsed);
        this.aiBoard.step(elapsed);
        this.aiFallingSequencer.step(elapsed);
        this.ai.step(elapsed);
        npc_manager_1.npcManager.step(elapsed);
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
                if (board.moveShapeDownAllTheWay()) {
                    board.handleEndOfCurrentPieceTasks(); // Prevents any other keystrokes affecting the shape after it hits the bottom.
                }
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
        board.addJunkRows(event.filledRowIdxs.length);
    };
    Model.prototype.handleRowClearAnimationCompletedEvent = function (event) {
        var board = this.determineBoardFor(event.playerType);
        board.handleAnyFilledLinesPart2();
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
        var board;
        var fallingSequencer;
        var hp;
        if (event.playerType === 0 /* Human */) {
            board = this.humanBoard;
            fallingSequencer = this.humanFallingSequencer;
            hp = (this.humanHitPoints -= 1);
        }
        else {
            board = this.aiBoard;
            fallingSequencer = this.aiFallingSequencer;
            hp = (this.aiHitPoints -= 1);
        }
        event_bus_1.eventBus.fire(new hp_changed_event_1.HpChangedEvent(hp, event.playerType));
        // TODO: See if one of the players has run out of HP, somewhere if not here.
        event_bus_1.eventBus.fire(new falling_sequencer_event_1.FallingSequencerEvent(event.playerType));
        fallingSequencer.resetAndPlay(function () {
            // TODO: I don't know, maybe nothing.
        });
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
},{"../domain/constants":4,"../domain/player-movement":5,"../event/event-bus":9,"../event/falling-sequencer-event":10,"../event/hp-changed-event":11,"./ai/ai":20,"./board/board":21,"./board/falling-sequencer":22,"./board/shape-factory":23,"./npc/npc-manager":26}],26:[function(require,module,exports){
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
            {
                var x = event.x;
                var y = event.z;
                npc.updatePosition(x, y);
            }
            {
                var x = (Math.random() * 7);
                var y = (Math.random() * 15);
                npc.beginWalkingTo(x, y);
            }
        }
    };
    return NpcManager;
}());
exports.npcManager = new NpcManager();
},{"../../event/event-bus":9,"./npc":27}],27:[function(require,module,exports){
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
},{"../../event/event-bus":9,"../../event/npc-movement-changed-event":12,"../../event/npc-placed-event":13}],28:[function(require,module,exports){
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
},{"./view/standee/standee-animation-texture-base":35}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
"use strict";
var constants_1 = require('../../domain/constants');
var MAX_CURTAIN_COUNT = 4;
var CURTAIN_WIDTH = constants_1.PANEL_COUNT_PER_FLOOR;
var CURTAIN_MOVE_TIME = 400;
var CurtainVertexPosition = (function () {
    function CurtainVertexPosition() {
        this.x = 0;
        this.elapsed = 0;
    }
    return CurtainVertexPosition;
}());
/**
 * I might have some of these backwards...
 */
(function (CurtainDirection) {
    CurtainDirection[CurtainDirection["OpenLeftToRight"] = 0] = "OpenLeftToRight";
    CurtainDirection[CurtainDirection["OpenRightToLeft"] = 1] = "OpenRightToLeft";
    CurtainDirection[CurtainDirection["CloseLeftToRight"] = 2] = "CloseLeftToRight";
    CurtainDirection[CurtainDirection["CloseRightToLeft"] = 3] = "CloseRightToLeft";
})(exports.CurtainDirection || (exports.CurtainDirection = {}));
var CurtainDirection = exports.CurtainDirection;
/**
 * Some notes on vertices within each curtain mesh without modifications:
 * Vertices 1 and 3 should rest at x = -CURTAIN_WIDTH / 2 (house left)
 * Vertices 0 and 2 should rest at x =  CURTAIN_WIDTH / 2 (house right)
 *
 * Example statements:
 * console.log('vertices 1 and 3 x: ' + curtain.geometry.vertices[1].x, curtain.geometry.vertices[3].x);
 * console.log('vertices 0 and 2 x: ' + curtain.geometry.vertices[0].x, curtain.geometry.vertices[2].x);
 * console.log('---');
 */
var Curtain = (function () {
    function Curtain() {
        this.group = new THREE.Object3D();
        this.curtains = [];
        for (var idx = 0; idx < MAX_CURTAIN_COUNT; idx++) {
            var geometry = new THREE.PlaneGeometry(CURTAIN_WIDTH, 1);
            var material = new THREE.MeshPhongMaterial({ color: 0x101030 }); // Midnight Blue
            var curtain = new THREE.Mesh(geometry, material);
            this.curtains.push(curtain);
        }
        this.curtainVertexPosition = new CurtainVertexPosition();
        this.curtainTween = null;
    }
    Curtain.prototype.start = function () {
        for (var _i = 0, _a = this.curtains; _i < _a.length; _i++) {
            var curtain = _a[_i];
            this.group.add(curtain);
        }
        // Transform group to fit against building.
        this.group.position.set(5.0, 4.75, -1.451);
        this.group.scale.set(0.7, 1.0, 1);
        this.group.visible = false;
    };
    Curtain.prototype.step = function (elapsed) {
        if (this.curtainTween != null) {
            this.curtainVertexPosition.elapsed += elapsed;
            this.curtainTween.update(this.curtainVertexPosition.elapsed);
        }
    };
    Curtain.prototype.startAnimation = function (floorIdxs, direction, callback) {
        var _this = this;
        // Prevent multiple animations at the same time.
        if (this.curtainTween != null) {
            return;
        }
        this.dropCurtain(floorIdxs);
        var xend;
        if (direction === CurtainDirection.CloseLeftToRight || direction === CurtainDirection.OpenLeftToRight) {
            this.curtainVertexPosition.x = CURTAIN_WIDTH / 2;
            xend = -CURTAIN_WIDTH / 2;
        }
        else if (direction === CurtainDirection.CloseRightToLeft || direction === CurtainDirection.OpenRightToLeft) {
            this.curtainVertexPosition.x = -CURTAIN_WIDTH / 2;
            xend = CURTAIN_WIDTH / 2;
        }
        this.curtainVertexPosition.elapsed = 0;
        this.curtainTween = new TWEEN.Tween(this.curtainVertexPosition)
            .to({ x: xend }, CURTAIN_MOVE_TIME)
            .easing(TWEEN.Easing.Quartic.InOut)
            .onUpdate(function () {
            // See note at top about why idx1 and idx2 are what they are.
            var idx1, idx2;
            if (direction === CurtainDirection.CloseRightToLeft || direction === CurtainDirection.OpenLeftToRight) {
                idx1 = 0;
                idx2 = 2;
            }
            else if (direction === CurtainDirection.CloseLeftToRight || direction === CurtainDirection.OpenRightToLeft) {
                idx1 = 1;
                idx2 = 3;
            }
            for (var _i = 0, _a = _this.curtains; _i < _a.length; _i++) {
                var curtain = _a[_i];
                curtain.geometry.vertices[idx1].x = _this.curtainVertexPosition.x;
                curtain.geometry.vertices[idx2].x = _this.curtainVertexPosition.x;
                curtain.geometry.verticesNeedUpdate = true;
            }
        })
            .onComplete(function () { _this.completeAnimation(callback); })
            .start(this.curtainVertexPosition.elapsed);
    };
    /**
     * Make the requested number of curtains visible.
     * Position them on the requested floors.
     */
    Curtain.prototype.dropCurtain = function (floorIdxs) {
        for (var _i = 0, _a = this.curtains; _i < _a.length; _i++) {
            var curtain = _a[_i];
            curtain.visible = false;
        }
        for (var idx = 0; idx < floorIdxs.length; idx++) {
            var floorIdx = floorIdxs[idx];
            var curtain = this.curtains[idx];
            curtain.position.set(0, floorIdx, 0);
            // See note at top about why these are where they are.
            curtain.geometry.vertices[0].x = -CURTAIN_WIDTH / 2;
            curtain.geometry.vertices[1].x = CURTAIN_WIDTH / 2;
            curtain.geometry.vertices[2].x = -CURTAIN_WIDTH / 2;
            curtain.geometry.vertices[3].x = CURTAIN_WIDTH / 2;
            curtain.geometry.verticesNeedUpdate = true;
            curtain.visible = true;
        }
        this.group.visible = true;
    };
    Curtain.prototype.completeAnimation = function (callback) {
        this.group.visible = false;
        this.curtainTween = null;
        if (callback) {
            callback();
        }
    };
    return Curtain;
}());
exports.Curtain = Curtain;
},{"../../domain/constants":4}],32:[function(require,module,exports){
"use strict";
var constants_1 = require('../../domain/constants');
var HpPanels = (function () {
    function HpPanels(hpOrientation) {
        this.group = new THREE.Object3D();
        this.panels = [];
        for (var idx = 0; idx < constants_1.PANEL_COUNT_PER_FLOOR; idx++) {
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
        this.hpOrientation = hpOrientation;
    }
    HpPanels.prototype.start = function () {
        for (var _i = 0, _a = this.panels; _i < _a.length; _i++) {
            var panel = _a[_i];
            this.group.add(panel);
        }
        // Transform to fit against building.
        this.group.position.set(1.85, 3.55, -1.5);
        this.group.scale.set(0.7, 1.9, 1);
        this.updateHp(constants_1.PANEL_COUNT_PER_FLOOR);
    };
    HpPanels.prototype.step = function (elapsed) {
        //
    };
    /**
     * HP bar can go from right-to-left or left-to-right, like a fighting game HP bar.
     */
    HpPanels.prototype.updateHp = function (hp) {
        if (hp > constants_1.PANEL_COUNT_PER_FLOOR) {
            hp = constants_1.PANEL_COUNT_PER_FLOOR;
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
                if (idx >= constants_1.PANEL_COUNT_PER_FLOOR - hp) {
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
},{"../../domain/constants":4}],33:[function(require,module,exports){
"use strict";
var building_1 = require('./building');
var curtain_1 = require('./curtain');
var hp_panels_1 = require('./hp-panels');
var curtain_2 = require('./curtain');
var constants_1 = require('../../domain/constants');
// TODO: Only the 3rd floor from the top and below are visible. Also, see board.ts.
exports.FLOOR_COUNT = 17;
var ACTIVE_SHAPE_LIGHT_COUNT = 4;
var PANEL_SIZE = 0.7;
var EmissiveIntensity = (function () {
    function EmissiveIntensity() {
    }
    return EmissiveIntensity;
}());
var LightingGrid = (function () {
    function LightingGrid(hpOrientation, rowClearDirection) {
        this.group = new THREE.Object3D();
        this.panelGroup = new THREE.Object3D();
        this.building = new building_1.Building();
        this.rowClearDirection = rowClearDirection;
        this.rowClearCurtain = new curtain_1.Curtain();
        this.junkRowCurtain = new curtain_1.Curtain();
        this.hpPanels = new hp_panels_1.HpPanels(hpOrientation);
        this.panels = [];
        for (var floorIdx = 0; floorIdx < exports.FLOOR_COUNT; floorIdx++) {
            this.panels[floorIdx] = [];
            for (var panelIdx = 0; panelIdx < constants_1.PANEL_COUNT_PER_FLOOR; panelIdx++) {
                var geometry = new THREE.PlaneGeometry(PANEL_SIZE, PANEL_SIZE); // TODO: clone() ?
                var material = new THREE.MeshPhongMaterial({ emissiveIntensity: 1.0 });
                var panel = new THREE.Mesh(geometry, material);
                panel.visible = false;
                var x = panelIdx;
                var y = floorIdx + 1; // Offset up 1 because ground is y = 0.
                var z = 0;
                panel.position.set(x, y, z);
                this.panels[floorIdx][panelIdx] = panel;
            }
        }
        this.shapeLights = [];
        for (var count = 0; count < ACTIVE_SHAPE_LIGHT_COUNT; count++) {
            var geometry = new THREE.PlaneGeometry(PANEL_SIZE, PANEL_SIZE);
            var material = new THREE.MeshPhongMaterial({ emissiveIntensity: 1.0 });
            var shapeLight = new THREE.Mesh(geometry, material);
            this.shapeLights.push(shapeLight);
        }
        this.currentShapeLightIdx = 0;
        this.highlighter = new THREE.PointLight(0xff00ff, 3.5, 3);
        this.pulseTween = null;
        this.pulseTweenElapsed = 0;
        this.emissiveIntensity = new EmissiveIntensity();
    }
    LightingGrid.prototype.start = function () {
        this.group.add(this.building.group);
        this.group.add(this.rowClearCurtain.group);
        this.group.add(this.junkRowCurtain.group);
        this.group.add(this.hpPanels.group);
        this.group.add(this.panelGroup);
        this.building.start();
        this.rowClearCurtain.start();
        this.junkRowCurtain.start();
        this.hpPanels.start();
        for (var _i = 0, _a = this.panels; _i < _a.length; _i++) {
            var floor = _a[_i];
            for (var _b = 0, floor_1 = floor; _b < floor_1.length; _b++) {
                var panel = floor_1[_b];
                this.panelGroup.add(panel);
            }
        }
        for (var _c = 0, _d = this.shapeLights; _c < _d.length; _c++) {
            var shapeLight = _d[_c];
            this.panelGroup.add(shapeLight);
        }
        this.panelGroup.add(this.highlighter);
        // Transform to fit against building.
        this.panelGroup.position.set(1.85, 3.8, -1.55);
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
        this.rowClearCurtain.step(elapsed);
        this.junkRowCurtain.step(elapsed);
        this.hpPanels.step(elapsed);
    };
    LightingGrid.prototype.switchRoomOff = function (floorIdx, panelIdx) {
        var panel = this.panels[floorIdx][panelIdx];
        panel.visible = false;
    };
    LightingGrid.prototype.switchRoomOn = function (floorIdx, panelIdx, color) {
        var panel = this.panels[floorIdx][panelIdx];
        panel.visible = true;
        panel.material.color.setHex(color);
        panel.material.emissive.setHex(color);
    };
    LightingGrid.prototype.sendActiveShapeLightTo = function (floorIdx, panelIdx, color) {
        var shapeLight = this.getNextShapeLight();
        shapeLight.material.color.setHex(color);
        shapeLight.material.emissive.setHex(color);
        // Do not light if higher than the highest *visible* floor.
        if (floorIdx >= exports.FLOOR_COUNT) {
            shapeLight.visible = false;
        }
        else {
            shapeLight.visible = true;
        }
        var x = panelIdx;
        var y = floorIdx + 1; // Offset up 1 because ground is y = 0.
        var z = 0;
        shapeLight.position.set(x, y, z);
    };
    LightingGrid.prototype.getActiveShapeLightPosition = function () {
        return this.highlighter.position;
    };
    LightingGrid.prototype.sendHighlighterTo = function (floorIdx, panelIdx, color) {
        // Do not light if higher than the highest *visible* floor.
        if (floorIdx >= exports.FLOOR_COUNT) {
            this.highlighter.visible = false;
        }
        else {
            this.highlighter.visible = true;
            this.highlighter.color.setHex(color);
        }
        var x = panelIdx;
        var y = floorIdx + 1; // Offset up 1 because ground is y = 0.
        var z = 0;
        this.highlighter.position.set(x, y, z);
    };
    LightingGrid.prototype.updateHp = function (hp) {
        this.hpPanels.updateHp(hp);
    };
    LightingGrid.prototype.startRowClearingAnimation = function (floorIdxs, callback) {
        var curtainDirection;
        if (this.rowClearDirection === 0 /* LeftToRight */) {
            curtainDirection = curtain_2.CurtainDirection.OpenLeftToRight;
        }
        else {
            curtainDirection = curtain_2.CurtainDirection.OpenRightToLeft;
        }
        this.rowClearCurtain.startAnimation(floorIdxs, curtainDirection, callback);
    };
    LightingGrid.prototype.startJunkRowCurtainAnimation = function (floorCount) {
        if (floorCount > 4) {
            floorCount = 4;
        }
        else if (floorCount < 0) {
            floorCount = 0;
        }
        var floorIdxs = [0, 1, 2, 3].slice(0, floorCount);
        var curtainDirection;
        if (this.rowClearDirection === 0 /* LeftToRight */) {
            curtainDirection = curtain_2.CurtainDirection.CloseRightToLeft;
        }
        else {
            curtainDirection = curtain_2.CurtainDirection.CloseLeftToRight;
        }
        this.junkRowCurtain.startAnimation(floorIdxs, curtainDirection);
    };
    LightingGrid.prototype.hideShapeLightsAndHighlighter = function () {
        for (var _i = 0, _a = this.shapeLights; _i < _a.length; _i++) {
            var shapeLight = _a[_i];
            shapeLight.visible = false;
        }
        this.highlighter.visible = false;
    };
    LightingGrid.prototype.getNextShapeLight = function () {
        var shapeLight = this.shapeLights[this.currentShapeLightIdx];
        this.currentShapeLightIdx++;
        if (this.currentShapeLightIdx >= ACTIVE_SHAPE_LIGHT_COUNT) {
            this.currentShapeLightIdx = 0;
        }
        return shapeLight;
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
},{"../../domain/constants":4,"./building":30,"./curtain":31,"./hp-panels":32}],34:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var rows_clear_animation_completed_event_1 = require('../../event/rows-clear-animation-completed-event');
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
        event_bus_1.eventBus.register(event_bus_1.EventType.RowsFilledEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.animateRowClearing(event.filledRowIdxs);
            }
            else {
                _this.animateJunkRowAdding(event.filledRowIdxs.length);
            }
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.HpChangedEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.handleHpChangedEvent(event);
            }
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.FallingSequencerEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.handleFallingSequencerEvent(event);
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
        var yTotalOffset = 0;
        var xTotalOffset = 0;
        var offsets = event.shape.getOffsets();
        for (var _i = 0, offsets_1 = offsets; _i < offsets_1.length; _i++) {
            var offset = offsets_1[_i];
            var offsetFloorIdx = floorIdx - offset.y;
            var offsetPanelIdx = panelIdx + offset.x;
            this.lightingGrid.sendActiveShapeLightTo(offsetFloorIdx, offsetPanelIdx, color);
            yTotalOffset += offset.y;
            xTotalOffset += offset.x;
        }
        var yoff = (yTotalOffset / offsets.length) - 2;
        var xoff = xTotalOffset / offsets.length;
        this.lightingGrid.sendHighlighterTo(floorIdx + yoff, panelIdx + xoff, color);
        if (this.playerType === 0 /* Human */) {
            var activeShapeLightPosition = this.lightingGrid.getActiveShapeLightPosition();
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
    Switchboard.prototype.animateRowClearing = function (filledRowIdxs) {
        var _this = this;
        var floorIdxs = [];
        for (var _i = 0, filledRowIdxs_1 = filledRowIdxs; _i < filledRowIdxs_1.length; _i++) {
            var filledRowIdx = filledRowIdxs_1[_i];
            var floorIdx = this.convertRowToFloor(filledRowIdx);
            floorIdxs.push(floorIdx);
        }
        this.lightingGrid.startRowClearingAnimation(floorIdxs, function () {
            event_bus_1.eventBus.fire(new rows_clear_animation_completed_event_1.RowsClearAnimationCompletedEvent(_this.playerType));
        });
    };
    /**
     * Remember that the junk rows have already been added on the board.
     *
     * Do not need to fire an event at the end of this animation because the board
     * does not need to listen for it (it listens for the clearing animation instead).
    */
    Switchboard.prototype.animateJunkRowAdding = function (junkRowCount) {
        this.lightingGrid.startJunkRowCurtainAnimation(junkRowCount);
    };
    Switchboard.prototype.handleHpChangedEvent = function (event) {
        this.lightingGrid.updateHp(event.hp);
    };
    Switchboard.prototype.handleFallingSequencerEvent = function (event) {
        this.lightingGrid.hideShapeLightsAndHighlighter();
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
                value = 0x33cccc;
                break;
            case 2 /* Yellow */:
                value = 0xffff55;
                break;
            case 3 /* Purple */:
                value = 0xa020a0;
                break;
            case 4 /* Green */:
                value = 0x20a020;
                break;
            case 5 /* Red */:
                value = 0xff3333;
                break;
            case 6 /* Blue */:
                value = 0x4444cc;
                break;
            case 7 /* Orange */:
                value = 0xeed530;
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
},{"../../event/event-bus":9,"../../event/rows-clear-animation-completed-event":15,"./lighting-grid":33}],35:[function(require,module,exports){
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
},{}],36:[function(require,module,exports){
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
},{"../../event/event-bus":9,"./standee":38}],37:[function(require,module,exports){
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
},{"./standee-animation-texture-base":35}],38:[function(require,module,exports){
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
},{"../../event/event-bus":9,"../../event/standee-movement-ended-event":17,"../camera-wrapper":29,"./standee-sprite-wrapper":37}],39:[function(require,module,exports){
"use strict";
var camera_wrapper_1 = require('./camera-wrapper');
var sky_1 = require('./world/sky');
var ground_1 = require('./world/ground');
var lighting_grid_1 = require('./lighting/lighting-grid');
var switchboard_1 = require('./lighting/switchboard');
var standee_manager_1 = require('./standee/standee-manager');
var View = (function () {
    function View() {
        this.canvas = document.getElementById('canvas');
        this.skyScene = new THREE.Scene();
        this.leftScene = new THREE.Scene();
        this.rightScene = new THREE.Scene();
        this.groundScene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
        this.renderer.autoClear = false;
        this.humanGrid = new lighting_grid_1.LightingGrid(0 /* DecreasesRightToLeft */, 1 /* RightToLeft */);
        this.humanSwitchboard = new switchboard_1.Switchboard(this.humanGrid, 0 /* Human */);
        this.aiGrid = new lighting_grid_1.LightingGrid(1 /* DecreasesLeftToRight */, 0 /* LeftToRight */);
        this.aiSwitchboard = new switchboard_1.Switchboard(this.aiGrid, 1 /* Ai */);
    }
    View.prototype.start = function () {
        this.humanGrid.start();
        this.humanSwitchboard.start();
        this.aiGrid.start();
        this.aiSwitchboard.start();
        this.doStart();
        sky_1.sky.start();
        ground_1.ground.start();
        standee_manager_1.standeeManager.start();
        // The canvas should have been hidden until setup is complete.
        this.canvas.style.display = 'inline';
    };
    View.prototype.step = function (elapsed) {
        sky_1.sky.step(elapsed);
        ground_1.ground.step(elapsed);
        this.humanSwitchboard.step(elapsed);
        this.humanGrid.step(elapsed);
        this.aiGrid.step(elapsed);
        this.humanSwitchboard.step(elapsed);
        standee_manager_1.standeeManager.step(elapsed);
        this.renderer.clear();
        this.renderer.render(this.skyScene, camera_wrapper_1.cameraWrapper.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.leftScene, camera_wrapper_1.cameraWrapper.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.rightScene, camera_wrapper_1.cameraWrapper.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.groundScene, camera_wrapper_1.cameraWrapper.camera);
    };
    View.prototype.doStart = function () {
        var _this = this;
        this.skyScene.add(sky_1.sky.group);
        this.groundScene.add(ground_1.ground.group);
        this.groundScene.add(standee_manager_1.standeeManager.group);
        this.leftScene.add(this.humanGrid.group);
        this.rightScene.add(this.aiGrid.group);
        this.aiGrid.group.position.setX(11);
        this.aiGrid.group.position.setZ(1);
        this.aiGrid.group.rotation.y = -Math.PI / 4;
        // TODO: Temporary for debugging?
        // this.scene.add(new THREE.AmbientLight(0x404040));
        // TODO: Temporary?
        var spotLightColor = 0x9999ee;
        var leftSpotLight = new THREE.SpotLight(spotLightColor);
        leftSpotLight.position.set(-3, 0.75, 20);
        leftSpotLight.target = this.aiGrid.group;
        this.leftScene.add(leftSpotLight);
        var rightSpotLight = new THREE.SpotLight(spotLightColor);
        rightSpotLight.position.set(0, 0.75, 20);
        rightSpotLight.target = this.aiGrid.group;
        this.rightScene.add(rightSpotLight);
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
},{"./camera-wrapper":29,"./lighting/lighting-grid":33,"./lighting/switchboard":34,"./standee/standee-manager":36,"./world/ground":40,"./world/sky":41}],40:[function(require,module,exports){
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
},{}],41:[function(require,module,exports){
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
},{}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2NvbnRyb2xsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2lucHV0LnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL2NlbGwudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vY29uc3RhbnRzLnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL3BsYXllci1tb3ZlbWVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvYm9hcmQtZmlsbGVkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvY2VsbC1jaGFuZ2UtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ldmVudC1idXMudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9mYWxsaW5nLXNlcXVlbmNlci1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9yb3dzLWNsZWFyLWFuaW1hdGlvbi1jb21wbGV0ZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9yb3dzLWZpbGxlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9nYW1lLXN0YXRlLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyIsInNyYy9zY3JpcHRzL21vZGVsL2FpL2FpLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvYm9hcmQudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ib2FyZC9mYWxsaW5nLXNlcXVlbmNlci50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL3NoYXBlLWZhY3RvcnkudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ib2FyZC9zaGFwZS50cyIsInNyYy9zY3JpcHRzL21vZGVsL21vZGVsLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbnBjL25wYy1tYW5hZ2VyLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbnBjL25wYy50cyIsInNyYy9zY3JpcHRzL3ByZWxvYWRlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvY2FtZXJhLXdyYXBwZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2J1aWxkaW5nLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9jdXJ0YWluLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9ocC1wYW5lbHMudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2xpZ2h0aW5nLWdyaWQudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL3N3aXRjaGJvYXJkLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUtYW5pbWF0aW9uLXRleHR1cmUtYmFzZS50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1zcHJpdGUtd3JhcHBlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLnRzIiwic3JjL3NjcmlwdHMvdmlldy92aWV3LnRzIiwic3JjL3NjcmlwdHMvdmlldy93b3JsZC9ncm91bmQudHMiLCJzcmMvc2NyaXB0cy92aWV3L3dvcmxkL3NreS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxzQkFBeUIsU0FBUyxDQUFDLENBQUE7QUFDbkMsMEJBQXVCLG9CQUFvQixDQUFDLENBQUE7QUFDNUMsZ0NBQTZCLDJCQUEyQixDQUFDLENBQUE7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QUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNMLFVBQUM7QUFBRCxDQXZEQSxBQXVEQyxJQUFBO0FBQ1ksV0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtpbnB1dCwgS2V5fSBmcm9tICcuL2lucHV0JztcclxuaW1wb3J0IHtldmVudEJ1c30gZnJvbSAnLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5cclxuLy8gVE9ETzogSGVyZSBkZXRlcm1pbmUgaWYgcGxheWVyIGlzIGhvbGRpbmcgZG93biBvbmUgb2YgdGhlIGFycm93IGtleXM7IGlmIHNvLCBmaXJlIHJhcGlkIGV2ZW50cyBhZnRlciAoVEJEKSBhbW91bnQgb2YgdGltZS5cclxuXHJcbmNsYXNzIENvbnRyb2xsZXIge1xyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGlucHV0LnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5VcCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Sb3RhdGVDbG9ja3dpc2UsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkxlZnQpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuTGVmdCwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuUmlnaHQpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUmlnaHQsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkRvd24pKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRG93biwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuU3BhY2UpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRHJvcCwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuZXhwb3J0IGNvbnN0IGVudW0gS2V5IHtcclxuICAgIExlZnQsXHJcbiAgICBVcCxcclxuICAgIERvd24sXHJcbiAgICBSaWdodCxcclxuICAgIFNwYWNlLFxyXG4gICAgUGF1c2UsXHJcbiAgICBPdGhlclxyXG59XHJcblxyXG5jb25zdCBlbnVtIFN0YXRlIHtcclxuICAgIERvd24sXHJcbiAgICBVcCxcclxuICAgIEhhbmRsaW5nXHJcbn1cclxuXHJcbmNsYXNzIElucHV0IHtcclxuICAgIHByaXZhdGUga2V5U3RhdGU6IE1hcDxLZXksU3RhdGU+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMua2V5U3RhdGUgPSBuZXcgTWFwPEtleSxTdGF0ZT4oKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50VG9TdGF0ZShldmVudCwgU3RhdGUuRG93bik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRUb1N0YXRlKGV2ZW50LCBTdGF0ZS5VcCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gaWYgZ2l2ZW4ga2V5IGlzICdEb3duJy5cclxuICAgICAqL1xyXG4gICAgaXNEb3duKGtleTogS2V5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5U3RhdGUuZ2V0KGtleSkgPT09IFN0YXRlLkRvd247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gaWYgZ2l2ZW4ga2V5IGlzICdkb3duJy4gQWxzbyBzZXRzIHRoZSBrZXkgZnJvbSAnRG93bicgdG8gJ0hhbmRsaW5nJy5cclxuICAgICAqL1xyXG4gICAgaXNEb3duQW5kVW5oYW5kbGVkKGtleTogS2V5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNEb3duKGtleSkpIHtcclxuICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBTdGF0ZS5IYW5kbGluZyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gVE9ETzogVGhpcyB3YXNuJ3Qgc2V0IGluIG1hemluZzsgbmVlZCB0byBzZWUgd2h5LlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgaWYgYW55IGtleSBpcyAnZG93bicuIEFsc28gc2V0IGFsbCAnRG93bicga2V5cyB0byAnSGFuZGxpbmcnLlxyXG4gICAgICovXHJcbiAgICBpc0FueUtleURvd25BbmRVbmhhbmRsZWQoKSB7XHJcbiAgICAgICAgbGV0IGFueUtleURvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmtleVN0YXRlLmZvckVhY2goKHN0YXRlOiBTdGF0ZSwga2V5OiBLZXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIFN0YXRlLkhhbmRsaW5nKTtcclxuICAgICAgICAgICAgICAgIGFueUtleURvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFueUtleURvd247XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudFRvU3RhdGUoZXZlbnQ6IEtleWJvYXJkRXZlbnQsIHN0YXRlOiBTdGF0ZSkge1xyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG5cclxuICAgICAgICAgICAgLy8gRGlyZWN0aW9uYWxzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vICdhJ1xyXG4gICAgICAgICAgICBjYXNlIDM3OiAvLyBsZWZ0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5MZWZ0LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODc6IC8vICd3J1xyXG4gICAgICAgICAgICBjYXNlIDM4OiAvLyB1cFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuVXAsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCkgLSBjb21tZW50ZWQgZm9yIGlmIHRoZSB1c2VyIHdhbnRzIHRvIGNtZCt3IG9yIGN0cmwrd1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vICdkJ1xyXG4gICAgICAgICAgICBjYXNlIDM5OiAvLyByaWdodFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuUmlnaHQsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4MzogLy8gJ3MnXHJcbiAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd25cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LkRvd24sIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzMjogLy8gc3BhY2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlNwYWNlLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBQYXVzZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA4MDogLy8gJ3AnXHJcbiAgICAgICAgICAgIGNhc2UgMjc6IC8vIGVzY1xyXG4gICAgICAgICAgICBjYXNlIDEzOiAvLyBlbnRlciBrZXlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlBhdXNlLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBUT0RPOiBNYXliZSBhZGQgYSBkZWJ1ZyBrZXkgaGVyZSAoJ2YnKVxyXG5cclxuICAgICAgICAgICAgLy8gSWdub3JlIGNlcnRhaW4ga2V5cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgODI6ICAgIC8vICdyJ1xyXG4gICAgICAgICAgICBjYXNlIDE4OiAgICAvLyBhbHRcclxuICAgICAgICAgICAgY2FzZSAyMjQ6ICAgLy8gYXBwbGUgY29tbWFuZCAoZmlyZWZveClcclxuICAgICAgICAgICAgY2FzZSAxNzogICAgLy8gYXBwbGUgY29tbWFuZCAob3BlcmEpXHJcbiAgICAgICAgICAgIGNhc2UgOTE6ICAgIC8vIGFwcGxlIGNvbW1hbmQsIGxlZnQgKHNhZmFyaS9jaHJvbWUpXHJcbiAgICAgICAgICAgIGNhc2UgOTM6ICAgIC8vIGFwcGxlIGNvbW1hbmQsIHJpZ2h0IChzYWZhcmkvY2hyb21lKVxyXG4gICAgICAgICAgICBjYXNlIDg0OiAgICAvLyAndCcgKGkuZS4sIG9wZW4gYSBuZXcgdGFiKVxyXG4gICAgICAgICAgICBjYXNlIDc4OiAgICAvLyAnbicgKGkuZS4sIG9wZW4gYSBuZXcgd2luZG93KVxyXG4gICAgICAgICAgICBjYXNlIDIxOTogICAvLyBsZWZ0IGJyYWNrZXRzXHJcbiAgICAgICAgICAgIGNhc2UgMjIxOiAgIC8vIHJpZ2h0IGJyYWNrZXRzXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgc29tZSB1bndhbnRlZCBiZWhhdmlvcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDE5MTogICAvLyBmb3J3YXJkIHNsYXNoIChwYWdlIGZpbmQpXHJcbiAgICAgICAgICAgIGNhc2UgOTogICAgIC8vIHRhYiAoY2FuIGxvc2UgZm9jdXMpXHJcbiAgICAgICAgICAgIGNhc2UgMTY6ICAgIC8vIHNoaWZ0XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGwgb3RoZXIga2V5cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5Lk90aGVyLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRTdGF0ZShrZXk6IEtleSwgc3RhdGU6IFN0YXRlKSB7XHJcbiAgICAgICAgLy8gQWx3YXlzIHNldCAndXAnXHJcbiAgICAgICAgaWYgKHN0YXRlID09PSBTdGF0ZS5VcCkge1xyXG4gICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIHN0YXRlKTtcclxuICAgICAgICAvLyBPbmx5IHNldCAnZG93bicgaWYgaXQgaXMgbm90IGFscmVhZHkgaGFuZGxlZFxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFN0YXRlLkRvd24pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMua2V5U3RhdGUuZ2V0KGtleSkgIT09IFN0YXRlLkhhbmRsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIHN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGlucHV0ID0gbmV3IElucHV0KCk7IiwiaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi9jb2xvcic7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2VsbCB7XHJcbiAgICBwcml2YXRlIGNvbG9yOiBDb2xvcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNvbG9yID0gQ29sb3IuRW1wdHk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29sb3IoY29sb3I6IENvbG9yKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbG9yKCk6IENvbG9yIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb2xvcjtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE9mZnNldCBjYWxjdWxhdGVkIGZyb20gdG9wLWxlZnQgY29ybmVyIGJlaW5nIDAsIDAuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2VsbE9mZnNldCB7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgUEFORUxfQ09VTlRfUEVSX0ZMT09SID0gMTA7IiwiZXhwb3J0IGVudW0gUGxheWVyTW92ZW1lbnQge1xyXG4gICAgTm9uZSxcclxuICAgIExlZnQsXHJcbiAgICBSaWdodCxcclxuICAgIERvd24sXHJcbiAgICBEcm9wLFxyXG4gICAgUm90YXRlQ2xvY2t3aXNlLFxyXG4gICAgUm90YXRlQ291bnRlckNsb2Nrd2lzZVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi4vbW9kZWwvYm9hcmQvc2hhcGUnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBzaGFwZTogU2hhcGU7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG4gICAgcmVhZG9ubHkgc3RhcnRpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2hhcGU6IFNoYXBlLCBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlLCBzdGFydGluZzogYm9vbGVhbikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5zdGFydGluZyA9IHN0YXJ0aW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQm9hcmRGaWxsZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQm9hcmRGaWxsZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENlbGxDaGFuZ2VFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG4gICAgcmVhZG9ubHkgY2VsbDogQ2VsbDtcclxuICAgIHJlYWRvbmx5IHJvdzogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgY29sOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNlbGw6IENlbGwsIHJvdzogbnVtYmVyLCBjb2w6IG51bWJlciwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5jZWxsID0gY2VsbDtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdztcclxuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5DZWxsQ2hhbmdlRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gRXZlbnRUeXBlIHtcclxuICAgIEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSxcclxuICAgIEFjdGl2ZVNoYXBlRW5kZWRFdmVudFR5cGUsXHJcbiAgICBCb2FyZEZpbGxlZEV2ZW50VHlwZSxcclxuICAgIENlbGxDaGFuZ2VFdmVudFR5cGUsXHJcbiAgICBGYWxsaW5nU2VxdWVuY2VyRXZlbnRUeXBlLFxyXG4gICAgSHBDaGFuZ2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjUGxhY2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjU3RhdGVDaGFnZWRFdmVudFR5cGUsXHJcbiAgICBQbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZSxcclxuICAgIFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50VHlwZSxcclxuICAgIFJvd3NGaWxsZWRFdmVudFR5cGUsXHJcbiAgICBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZVxyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBhYnN0cmFjdCBnZXRUeXBlKCk6RXZlbnRUeXBlXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnRIYW5kbGVyPFQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50PiB7XHJcbiAgICAoZXZlbnQ6IFQpOnZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudEJ1cyB7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVyc0J5VHlwZTpNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVyc0J5VHlwZSA9IG5ldyBNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT4oKTtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3Rlcih0eXBlOkV2ZW50VHlwZSwgaGFuZGxlcjpFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD4pIHtcclxuICAgICAgICBpZiAoIXR5cGUpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaGFuZGxlcnM6RXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+W10gPSB0aGlzLmhhbmRsZXJzQnlUeXBlLmdldCh0eXBlKTtcclxuICAgICAgICBpZiAoaGFuZGxlcnMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZXJzQnlUeXBlLnNldCh0eXBlLCBoYW5kbGVycyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFJldHVybiBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGNhbGxlZCB0byB1bnJlZ2lzdGVyIHRoZSBoYW5kbGVyXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFRPRE86IHVucmVnaXN0ZXIoKS4gQW5kIHJlbW92ZSB0aGUgbWFwIGtleSBpZiB6ZXJvIGhhbmRsZXJzIGxlZnQgZm9yIGl0LlxyXG4gICAgXHJcbiAgICAvLyBUT0RPOiBQcmV2ZW50IGluZmluaXRlIGZpcmUoKT9cclxuICAgIGZpcmUoZXZlbnQ6QWJzdHJhY3RFdmVudCkge1xyXG4gICAgICAgIGxldCBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnNCeVR5cGUuZ2V0KGV2ZW50LmdldFR5cGUoKSk7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiBoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGV2ZW50QnVzID0gbmV3IEV2ZW50QnVzKCk7XHJcbmV4cG9ydCBjb25zdCBkZWFkRXZlbnRCdXMgPSBuZXcgRXZlbnRCdXMoKTsgLy8gVXNlZCBieSBBSS5cclxuIiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhbGxpbmdTZXF1ZW5jZXJFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuRmFsbGluZ1NlcXVlbmNlckV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBIcENoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IGhwOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhwOiBudW1iZXIsIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuaHAgPSBocDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5IcENoYW5nZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtOcGNTdGF0ZX0gZnJvbSAnLi4vZG9tYWluL25wYy1zdGF0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjUGxhY2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgc3RhdGU6IE5wY1N0YXRlO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyXHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgc3RhdGU6IE5wY1N0YXRlLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLk5wY1BsYWNlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyTW92ZW1lbnRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG1vdmVtZW50OiBQbGF5ZXJNb3ZlbWVudDtcclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IobW92ZW1lbnQ6IFBsYXllck1vdmVtZW50LCBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm1vdmVtZW50ID0gbW92ZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuUGxheWVyTW92ZW1lbnRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5Sb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUm93c0ZpbGxlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGZpbGxlZFJvd0lkeHM6IG51bWJlcltdO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihmaWxsZWRSb3dJZHhzOiBudW1iZXJbXSwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5maWxsZWRSb3dJZHhzID0gZmlsbGVkUm93SWR4cy5zbGljZSgwKTtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5Sb3dzRmlsbGVkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHo6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgZW51bSBHYW1lU3RhdGVUeXBlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUgc3RhdGUgcmlnaHQgd2hlbiBKYXZhU2NyaXB0IHN0YXJ0cyBydW5uaW5nLiBJbmNsdWRlcyBwcmVsb2FkaW5nLlxyXG4gICAgICovXHJcbiAgICBJbml0aWFsaXppbmcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZnRlciBwcmVsb2FkIGlzIGNvbXBsZXRlIGFuZCBiZWZvcmUgbWFraW5nIG9iamVjdCBzdGFydCgpIGNhbGxzLlxyXG4gICAgICovXHJcbiAgICBTdGFydGluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgYWZ0ZXIgaW5pdGlhbCBvYmplY3RzIHN0YXJ0KCkgYW5kIGxpa2VseSB3aGVyZSB0aGUgZ2FtZSBpcyB3YWl0aW5nIG9uIHRoZSBwbGF5ZXIncyBmaXJzdCBpbnB1dC5cclxuICAgICAqL1xyXG4gICAgU3RhcnRlZCxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgdGhlIG1haW4gZ2FtZSBsb29wIG9mIGNvbnRyb2xsaW5nIHBpZWNlcy5cclxuICAgICAqL1xyXG4gICAgUGxheWluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuZCBvZiBnYW1lLCBzY29yZSBpcyBzaG93aW5nLCBub3RoaW5nIGxlZnQgdG8gZG8uXHJcbiAgICAgKi9cclxuICAgIEVuZGVkXHJcbn1cclxuXHJcbmNsYXNzIEdhbWVTdGF0ZSB7XHJcbiAgICBwcml2YXRlIGN1cnJlbnQ6IEdhbWVTdGF0ZVR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gR2FtZVN0YXRlVHlwZS5Jbml0aWFsaXppbmc7IC8vIERlZmF1bHQgc3RhdGUuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudCgpOiBHYW1lU3RhdGVUeXBlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHNldEN1cnJlbnQoY3VycmVudDogR2FtZVN0YXRlVHlwZSkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IGN1cnJlbnQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGdhbWVTdGF0ZSA9IG5ldyBHYW1lU3RhdGUoKTsiLCJpbXBvcnQge3ByZWxvYWRlcn0gZnJvbSAnLi9wcmVsb2FkZXInO1xyXG5pbXBvcnQge21vZGVsfSBmcm9tICcuL21vZGVsL21vZGVsJztcclxuaW1wb3J0IHt2aWV3fSBmcm9tICcuL3ZpZXcvdmlldyc7XHJcbmltcG9ydCB7Y29udHJvbGxlcn0gZnJvbSAnLi9jb250cm9sbGVyL2NvbnRyb2xsZXInO1xyXG5pbXBvcnQge0dhbWVTdGF0ZVR5cGUsIGdhbWVTdGF0ZX0gZnJvbSAnLi9nYW1lLXN0YXRlJztcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgZ2FtZVN0YXRlLnNldEN1cnJlbnQoR2FtZVN0YXRlVHlwZS5Jbml0aWFsaXppbmcpO1xyXG4gICAgcHJlbG9hZGVyLnByZWxvYWQobWFpbik7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gbWFpbigpIHtcclxuXHJcbiAgICAvLyBTdGFydHVwIGluIHJldmVyc2UgTVZDIG9yZGVyIHRvIGVuc3VyZSB0aGF0IGV2ZW50IGJ1cyBoYW5kbGVycyBpbiB0aGVcclxuICAgIC8vIGNvbnRyb2xsZXIgYW5kIHZpZXcgcmVjZWl2ZSAoYW55KSBzdGFydCBldmVudHMgZnJvbSBtb2RlbC5zdGFydCgpLlxyXG4gICAgY29udHJvbGxlci5zdGFydCgpO1xyXG4gICAgdmlldy5zdGFydCgpO1xyXG4gICAgbW9kZWwuc3RhcnQoKTtcclxuICAgIFxyXG4gICAgZ2FtZVN0YXRlLnNldEN1cnJlbnQoR2FtZVN0YXRlVHlwZS5TdGFydGVkKTtcclxuXHJcbiAgICBsZXQgc3RlcCA9ICgpID0+IHtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7XHJcblxyXG4gICAgICAgIGxldCBlbGFwc2VkID0gY2FsY3VsYXRlRWxhcHNlZCgpO1xyXG4gICAgICAgIGNvbnRyb2xsZXIuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB2aWV3LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgbW9kZWwuc3RlcChlbGFwc2VkKTtcclxuICAgIH07XHJcbiAgICBzdGVwKCk7XHJcbn1cclxuXHJcbmxldCBsYXN0U3RlcCA9IERhdGUubm93KCk7XHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZUVsYXBzZWQoKSB7XHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gbGFzdFN0ZXA7XHJcbiAgICBpZiAoZWxhcHNlZCA+IDEwMCkge1xyXG4gICAgICAgIGVsYXBzZWQgPSAxMDA7IC8vIGVuZm9yY2Ugc3BlZWQgbGltaXRcclxuICAgIH1cclxuICAgIGxhc3RTdGVwID0gbm93O1xyXG4gICAgcmV0dXJuIGVsYXBzZWQ7XHJcbn0iLCJpbXBvcnQge1NoYXBlfSBmcm9tICcuLi9ib2FyZC9zaGFwZSc7XHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuaW1wb3J0IHtDZWxsfSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7ZXZlbnRCdXMsIEV2ZW50VHlwZX0gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5cclxuY29uc3QgTUFYX0NPTFMgPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7XHJcbmNvbnN0IFRJTUVfQkVUV0VFTl9NT1ZFUyA9IDI1MDtcclxuY29uc3QgVElNRV9NQVhfREVWSUFUSU9OID0gMTAwO1xyXG5cclxuaW50ZXJmYWNlIFpvbWJpZUJvYXJkIHtcclxuICAgIC8vIFdheXMgdG8gaW50ZXJhY3Qgd2l0aCBpdC5cclxuICAgIG1vdmVTaGFwZUxlZnQoKTogYm9vbGVhbjtcclxuICAgIG1vdmVTaGFwZVJpZ2h0KCk6IGJvb2xlYW47XHJcbiAgICBtb3ZlU2hhcGVEb3duKCk6IGJvb2xlYW47XHJcbiAgICBtb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk6IHZvaWQ7XHJcbiAgICBtb3ZlVG9Ub3AoKTogdm9pZDtcclxuICAgIHJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk6IGJvb2xlYW47XHJcbiAgICBjb252ZXJ0U2hhcGVUb0NlbGxzKCk6IHZvaWQ7XHJcbiAgICB1bmRvQ29udmVydFNoYXBlVG9DZWxscygpOiB2b2lkO1xyXG5cclxuICAgIC8vIFdheXMgdG8gZGVyaXZlIGluZm9ybWF0aW9uIGZyb20gaXQuXHJcbiAgICBnZXRDdXJyZW50U2hhcGVDb2xJZHgoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlQWdncmVnYXRlSGVpZ2h0KCk6IG51bWJlcjtcclxuICAgIGNhbGN1bGF0ZUNvbXBsZXRlTGluZXMoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlSG9sZXMoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlQnVtcGluZXNzKCk6IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIFJlYWxCb2FyZCBleHRlbmRzIFpvbWJpZUJvYXJkIHtcclxuICAgIGNsb25lWm9tYmllKCk6IFpvbWJpZUJvYXJkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQWkge1xyXG5cclxuICAgIHByaXZhdGUgcmVhbEJvYXJkOiBSZWFsQm9hcmQ7XHJcbiAgICBwcml2YXRlIHRpbWVVbnRpbE5leHRNb3ZlOiBudW1iZXI7XHJcblxyXG4gICAgLy8gMCA9IG5vIHJvdGF0aW9uLCAxID0gb25lIHJvdGF0aW9uLCAyID0gdHdvIHJvdGF0aW9ucywgMyA9IHRocmVlIHJvdGF0aW9ucy5cclxuICAgIHByaXZhdGUgdGFyZ2V0Um90YXRpb246IG51bWJlcjtcclxuICAgIHByaXZhdGUgY3VycmVudFJvdGF0aW9uOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHRhcmdldENvbElkeDogbnVtYmVyO1xyXG4gICAgLy8gUHJldmVudCBBSSBmcm9tIGRvaW5nIGFueXRoaW5nIHdoaWxlIHRoZSBwaWVjZSBpcyB3YWl0aW5nIHRvIFwibG9ja1wiIGludG8gdGhlIG1hdHJpeC5cclxuICAgIHByaXZhdGUgbW92ZUNvbXBsZXRlZDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZWFsQm9hcmQ6IFJlYWxCb2FyZCkge1xyXG4gICAgICAgIHRoaXMucmVhbEJvYXJkID0gcmVhbEJvYXJkO1xyXG4gICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgPSBUSU1FX0JFVFdFRU5fTU9WRVM7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0Um90YXRpb24gPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gMDtcclxuICAgICAgICB0aGlzLnRhcmdldENvbElkeCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ29tcGxldGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgLT0gZWxhcHNlZDtcclxuICAgICAgICBpZiAodGhpcy50aW1lVW50aWxOZXh0TW92ZSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgPSBUSU1FX0JFVFdFRU5fTU9WRVM7XHJcbiAgICAgICAgICAgIHRoaXMuYWR2YW5jZVRvd2FyZHNUYXJnZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBwcm92aWRlcyBhIGhpZ2gtbGV2ZWwgdmlldyBvZiB0aGUgQUkncyB0aG91Z2h0IHByb2Nlc3MuXHJcbiAgICAgKi9cclxuICAgIHN0cmF0ZWdpemUoKSB7XHJcbiAgICAgICAgbGV0IHpvbWJpZSA9IHRoaXMucmVhbEJvYXJkLmNsb25lWm9tYmllKCk7XHJcblxyXG4gICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBhbGwgcG9zc2libGUgcm90YXRpb25zIGFuZCBjb2x1bW5zXHJcbiAgICAgICAgbGV0IGJlc3RGaXRuZXNzID0gTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVI7XHJcbiAgICAgICAgbGV0IGJlc3RSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgbGV0IGJlc3RDb2xJZHggPSAwO1xyXG4gICAgICAgIGZvciAobGV0IHJvdGF0aW9uID0gMDsgcm90YXRpb24gPCA0OyByb3RhdGlvbisrKSB7XHJcbiAgICAgICAgICAgIHdoaWxlKHpvbWJpZS5tb3ZlU2hhcGVMZWZ0KCkpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgTUFYX0NPTFM7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICB6b21iaWUubW92ZVNoYXBlRG93bkFsbFRoZVdheSgpO1xyXG4gICAgICAgICAgICAgICAgem9tYmllLmNvbnZlcnRTaGFwZVRvQ2VsbHMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZml0bmVzcyA9IHRoaXMuY2FsY3VsYXRlRml0bmVzcyh6b21iaWUpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZpdG5lc3M6ICcgKyBmaXRuZXNzICsgJywgcm90YXRpb246ICcgKyByb3RhdGlvbiArICcsIGNvbDogJyArIGNvbElkeCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZml0bmVzcyA+IGJlc3RGaXRuZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdEZpdG5lc3MgPSBmaXRuZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RSb3RhdGlvbiA9IHJvdGF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RDb2xJZHggPSB6b21iaWUuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCk7IC8vIFVzZSB0aGlzIHJhdGhlciB0aGFuIGlkeCBpbiBjYXNlIGl0IHdhcyBvZmYgYmVjYXVzZSBvZiB3aGF0ZXZlciByZWFzb24gKG9ic3RydWN0aW9uLCB3YWxsLCBldGMuLi4pXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgem9tYmllLnVuZG9Db252ZXJ0U2hhcGVUb0NlbGxzKCk7XHJcbiAgICAgICAgICAgICAgICB6b21iaWUubW92ZVRvVG9wKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2FuTW92ZVJpZ2h0ID0gem9tYmllLm1vdmVTaGFwZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FuTW92ZVJpZ2h0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHpvbWJpZS5yb3RhdGVTaGFwZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnYmVzdEZpdG5lc3M6ICVmLCAlZCwgJWQnLCBiZXN0Rml0bmVzcywgYmVzdFJvdGF0aW9uLCBiZXN0Q29sSWR4KTtcclxuXHJcbiAgICAgICAgLy8gRmluYWxseSwgc2V0IHRoZSB2YWx1ZXMgdGhhdCB3aWxsIGxldCB0aGUgQUkgYWR2YW5jZSB0b3dhcmRzIHRoZSB0YXJnZXQuXHJcbiAgICAgICAgdGhpcy50YXJnZXRSb3RhdGlvbiA9IGJlc3RSb3RhdGlvbjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy50YXJnZXRDb2xJZHggPSBiZXN0Q29sSWR4O1xyXG4gICAgICAgIHRoaXMubW92ZUNvbXBsZXRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZWQgb24gaHR0cHM6Ly9jb2RlbXlyb2FkLndvcmRwcmVzcy5jb20vMjAxMy8wNC8xNC90ZXRyaXMtYWktdGhlLW5lYXItcGVyZmVjdC1wbGF5ZXIvXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlRml0bmVzcyh6b21iaWU6IFpvbWJpZUJvYXJkKSB7XHJcbiAgICAgICAgbGV0IGFnZ3JlZ2F0ZUhlaWdodCA9IHpvbWJpZS5jYWxjdWxhdGVBZ2dyZWdhdGVIZWlnaHQoKTtcclxuICAgICAgICBsZXQgY29tcGxldGVMaW5lcyA9IHpvbWJpZS5jYWxjdWxhdGVDb21wbGV0ZUxpbmVzKCk7XHJcbiAgICAgICAgbGV0IGhvbGVzID0gem9tYmllLmNhbGN1bGF0ZUhvbGVzKCk7XHJcbiAgICAgICAgbGV0IGJ1bXBpbmVzcyA9IHpvbWJpZS5jYWxjdWxhdGVCdW1waW5lc3MoKTtcclxuICAgICAgICBsZXQgZml0bmVzcyA9ICgtMC41MTAwNjYgKiBhZ2dyZWdhdGVIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgKyAoIDAuNzYwNjY2ICogY29tcGxldGVMaW5lcylcclxuICAgICAgICAgICAgICAgICAgICArICgtMC4zNTY2MyAgKiBob2xlcylcclxuICAgICAgICAgICAgICAgICAgICArICgtMC4xODQ0ODMgKiBidW1waW5lc3MpO1xyXG4gICAgICAgIHJldHVybiBmaXRuZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWR2YW5jZVRvd2FyZHNUYXJnZXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubW92ZUNvbXBsZXRlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um90YXRpb24gPT09IHRoaXMudGFyZ2V0Um90YXRpb24gJiYgdGhpcy5yZWFsQm9hcmQuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCkgPT09IHRoaXMudGFyZ2V0Q29sSWR4KSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IERyb3Agc2hhcGUgc2hvdWxkIGJlIG9uIGEgdGltZXIgb3Igc29tZXRoaW5nLlxyXG4gICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5tb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXRDb2xJZHggPSAwO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDb21wbGV0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3RhdGlvbiA8IHRoaXMudGFyZ2V0Um90YXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhbEJvYXJkLnJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbisrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5yZWFsQm9hcmQuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCkgPCB0aGlzLnRhcmdldENvbElkeCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFsQm9hcmQubW92ZVNoYXBlUmlnaHQoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlYWxCb2FyZC5nZXRDdXJyZW50U2hhcGVDb2xJZHgoKSA+IHRoaXMudGFyZ2V0Q29sSWR4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5tb3ZlU2hhcGVMZWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHJpdmF0ZSBwZXJmb3JtTmV3TW92ZW1lbnQoKSB7XHJcbiAgICAgICAgLy8gbGV0IG1hdHJpeCA9IHRoaXMudmlzdWFsLm1hdHJpeDtcclxuICAgICAgICAvLyBsZXQgc2hhcGUgPSB0aGlzLnZpc3VhbC5jdXJyZW50U2hhcGU7XHJcblxyXG4gICAgICAgIC8vIGxldCByYW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNSk7XHJcblxyXG4gICAgICAgIC8vIGlmIChyYW5kID09PSAwKSB7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUm90YXRlQ2xvY2t3aXNlLCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChyYW5kID09PSAxKSB7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuTGVmdCwgUGxheWVyVHlwZS5BaSkpO1xyXG4gICAgICAgIC8vIH0gZWxzZSBpZiAocmFuZCA9PT0gMikge1xyXG4gICAgICAgIC8vICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LlJpZ2h0LCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChyYW5kID09PSAzKSB7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRG93biwgUGxheWVyVHlwZS5BaSkpO1xyXG4gICAgICAgIC8vIH0gZWxzZSBpZiAocmFuZCA9PT0gNCkge1xyXG4gICAgICAgIC8vICAgICBsZXQgZHJvcENoYW5jZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCk7IC8vIElzIHRoaXMgY2FsbGVkIE1vbnRlLUNhcmxvP1xyXG4gICAgICAgIC8vICAgICBpZiAoZHJvcENoYW5jZSA8IDEwKSB7XHJcbiAgICAgICAgLy8gICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkRyb3AsIFBsYXllclR5cGUuQWkpKTtcclxuICAgICAgICAvLyAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgICAgIC8vIERvIG5vdGhpbmcgdGhpcyByb3VuZDsgbWF5YmUgY29uc2lkZXJlZCBhIGhlc2l0YXRpb24uXHJcbiAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnc2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgICAgIC8vIH1cclxuICAgIC8vIH1cclxuXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVRpbWVVbnRpbE5leHRNb3ZlKCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKFRJTUVfQkVUV0VFTl9NT1ZFUyArICgoTWF0aC5yYW5kb20oKSAqIFRJTUVfTUFYX0RFVklBVElPTikgLSAoVElNRV9NQVhfREVWSUFUSU9OIC8gMikpKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4vc2hhcGUnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7U2hhcGVGYWN0b3J5LCBkZWFkU2hhcGVGYWN0b3J5fSBmcm9tICcuL3NoYXBlLWZhY3RvcnknO1xyXG5pbXBvcnQge0V2ZW50QnVzLCBkZWFkRXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7Q2VsbENoYW5nZUV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9jZWxsLWNoYW5nZS1ldmVudCc7XHJcbmltcG9ydCB7Um93c0ZpbGxlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9yb3dzLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtCb2FyZEZpbGxlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ib2FyZC1maWxsZWQtZXZlbnQnO1xyXG5cclxuY29uc3QgTUFYX1JPV1MgPSAxOTsgLy8gVG9wIDIgcm93cyBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuIEFsc28sIHNlZSBsaWdodGluZy1ncmlkLnRzLlxyXG5jb25zdCBNQVhfQ09MUyA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjtcclxuY29uc3QgVEVNUF9ERUxBWV9NUyA9IDUwMDtcclxuXHJcbmNvbnN0IGVudW0gQm9hcmRTdGF0ZSB7XHJcbiAgICBQYXVzZWQsXHJcbiAgICBJblBsYXlcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvYXJkIHtcclxuICAgIHByaXZhdGUgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuICAgIHByaXZhdGUgc2hhcGVGYWN0b3J5OiBTaGFwZUZhY3Rvcnk7XHJcbiAgICBwcml2YXRlIGV2ZW50QnVzOiBFdmVudEJ1cztcclxuXHJcbiAgICBwcml2YXRlIGJvYXJkU3RhdGU6IEJvYXJkU3RhdGU7XHJcbiAgICBwcml2YXRlIG1zVGlsbEdyYXZpdHlUaWNrOiBudW1iZXI7XHJcblxyXG4gICAgY3VycmVudFNoYXBlOiBTaGFwZTtcclxuICAgIHJlYWRvbmx5IG1hdHJpeDogQ2VsbFtdW107XHJcblxyXG4gICAgcHJpdmF0ZSBqdW5rUm93SG9sZUNvbHVtbjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBqdW5rUm93SG9sZURpcmVjdGlvbjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBqdW5rUm93Q29sb3IxOiBDb2xvcjtcclxuICAgIHByaXZhdGUganVua1Jvd0NvbG9yMjogQ29sb3I7XHJcbiAgICBwcml2YXRlIGp1bmtSb3dDb2xvcklkeDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBsYXllclR5cGU6IFBsYXllclR5cGUsIHNoYXBlRmFjdG9yeTogU2hhcGVGYWN0b3J5LCBldmVudEJ1czogRXZlbnRCdXMpIHtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgICAgIHRoaXMuc2hhcGVGYWN0b3J5ID0gc2hhcGVGYWN0b3J5O1xyXG4gICAgICAgIHRoaXMuZXZlbnRCdXMgPSBldmVudEJ1cztcclxuXHJcbiAgICAgICAgdGhpcy5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5QYXVzZWQ7XHJcbiAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IFRFTVBfREVMQVlfTVM7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1hdHJpeCA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IE1BWF9ST1dTOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFtyb3dJZHhdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZUNvbHVtbiA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZUNvbHVtbiA9IE1BWF9DT0xTIC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbiA9IDE7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q29sb3IxID0gQ29sb3IuV2hpdGU7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q29sb3IyID0gQ29sb3IuV2hpdGU7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q29sb3JJZHggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0QW5kUGxheSgpIHtcclxuICAgICAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5JblBsYXk7XHJcbiAgICAgICAgdGhpcy5zdGFydFNoYXBlKHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBnaXZlcyBhIGhpZ2ggbGV2ZWwgdmlldyBvZiB0aGUgbWFpbiBnYW1lIGxvb3AuXHJcbiAgICAgKiBUaGlzIHNob3VsZG4ndCBiZSBjYWxsZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdGUgPT09IEJvYXJkU3RhdGUuUGF1c2VkKSB7XHJcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgaGVyZSBqdXN0IHRvIGVuc3VyZSB0aGF0IHRoZSBtZXRob2QgdG8gcnVucyBpbW1lZGlhdGVseSBhZnRlciB1bnBhdXNpbmcuXHJcbiAgICAgICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgLT0gZWxhcHNlZDtcclxuICAgICAgICAgICAgaWYgKHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IFRFTVBfREVMQVlfTVM7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50cnlHcmF2aXR5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVTaGFwZURvd24oKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVFbmRPZkN1cnJlbnRQaWVjZVRhc2tzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsIHRoaXMgb25jZSBhIHNoYXBlIGlzIGtub3duIHRvIGJlIGluIGl0cyBmaW5hbCByZXN0aW5nIHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBoYW5kbGVFbmRPZkN1cnJlbnRQaWVjZVRhc2tzKCkge1xyXG4gICAgICAgIHRoaXMuY29udmVydFNoYXBlVG9DZWxscygpO1xyXG4gICAgICAgIGlmICh0aGlzLmhhbmRsZUZ1bGxCb2FyZCgpKSB7XHJcbiAgICAgICAgICAgIC8vIEJvYXJkIGlzIGZ1bGwgLS0gc3RhcnRpbmcgYSBuZXcgc2hhcGUgd2FzIGRlbGVnYXRlZCB0byBsYXRlciBieSBoYW5kbGVGdWxsQm9hcmQoKS5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQxKCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoZXJlIHdlcmUgZmlsbGVkIGxpbmVzIC0tIHN0YXJ0aW5nIGEgbmV3IHNoYXBlIHdhcyBkZWxlZ2F0ZWQgdG8gbGF0ZXIgYnkgaGFuZGxlQW55RmlsbGVkTGluZXNQYXJ0MSgpLlxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydFNoYXBlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBnZXRDdXJyZW50U2hhcGVDb2xJZHgoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlTGVmdCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLkluUGxheSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlTGVmdCgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlUmlnaHQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlUmlnaHQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5JblBsYXkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZURvd24oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5JblBsYXkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVVwKCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZURvd25BbGxUaGVXYXkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5JblBsYXkpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSk7IC8vIFRPRE86IEFkZCB1cHBlciBib3VuZC5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVVwKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgbW92ZVRvVG9wKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVUb1RvcCgpOyBcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVTaGFwZUNsb2Nrd2lzZSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLkluUGxheSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5yb3RhdGVDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUucm90YXRlQ291bnRlckNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBhZGRKdW5rUm93cyhudW1iZXJPZlJvd3NUb0FkZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gQ2xlYXIgcm93cyBhdCB0aGUgdG9wIHRvIG1ha2Ugcm9vbSBhdCB0aGUgYm90dG9tLlxyXG4gICAgICAgIHRoaXMubWF0cml4LnNwbGljZSgwLCBudW1iZXJPZlJvd3NUb0FkZCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBqdW5rIHJvd3MgYXQgdGhlIGJvdHRvbS5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBudW1iZXJPZlJvd3NUb0FkZDsgaWR4KyspIHtcclxuICAgICAgICAgICAgLy8gU2V0IHRoZSByb3cgdG8gY29tcGxldGVseSBmaWxsZWQuXHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IHRoaXMuZ2V0TmV4dEp1bmtSb3dDb2xvcigpO1xyXG4gICAgICAgICAgICBsZXQgcm93OiBDZWxsW10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgICAgICAgICBjZWxsLnNldENvbG9yKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIHJvdy5wdXNoKGNlbGwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQdW5jaCBhIGhvbGUgaW4gdGhlIGxpbmUuXHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gcm93W3RoaXMuanVua1Jvd0hvbGVDb2x1bW5dO1xyXG4gICAgICAgICAgICBjZWxsLnNldENvbG9yKENvbG9yLkVtcHR5KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBhcmUgZm9yIHRoZSBuZXh0IGp1bmsgcm93IGxpbmUuXHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gKz0gdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbjtcclxuICAgICAgICAgICAgaWYgKHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVEaXJlY3Rpb24gKj0gLTE7IC8vIEZsaXBzIHRoZSBkaXJlY3Rpb25cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID49IE1BWF9DT0xTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gTUFYX0NPTFMgLSAyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbiAqPSAtMTsgLy8gRmxpcHMgdGhlIGRpcmVjdGlvblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeC5wdXNoKHJvdyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE5vdGlmeSBmb3IgYWxsIGNlbGxzIGJlY2F1c2UgZW50aXJlIGJvYXJkIGhhcyBjaGFuZ2VkLlxyXG4gICAgICAgIC8vIFRPRE86IE1vdmUgdG8gb3duIG1ldGhvZD9cclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCwgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBWZXJ5IGhhY2t5IG1ldGhvZCBqdXN0IHNvIHRoZSBBSSBoYXMgYSB0ZW1wIGNvcHkgb2YgdGhlIGJvYXJkIHRvIGV4cGVyaW1lbnQgd2l0aC5cclxuICAgICAqL1xyXG4gICAgY2xvbmVab21iaWUoKTogQm9hcmQge1xyXG4gICAgICAgIGxldCBjb3B5ID0gbmV3IEJvYXJkKHRoaXMucGxheWVyVHlwZSwgZGVhZFNoYXBlRmFjdG9yeSwgZGVhZEV2ZW50QnVzKTtcclxuXHJcbiAgICAgICAgLy8gQWxsb3cgdGhlIEFJIHRvIG1vdmUgYW5kIHJvdGF0ZSB0aGUgY3VycmVudCBzaGFwZVxyXG4gICAgICAgIGNvcHkuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuSW5QbGF5O1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENvcHkgdGhlIGN1cnJlbnQgc2hhcGUgYW5kIHRoZSBtYXRyaXguIFNob3VsZG4ndCBuZWVkIGFueXRoaW5nIGVsc2UuXHJcbiAgICAgICAgY29weS5jdXJyZW50U2hhcGUgPSB0aGlzLmN1cnJlbnRTaGFwZS5jbG9uZVNpbXBsZSgpO1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb3B5Lm1hdHJpeFtyb3dJZHhdW2NvbElkeF0uc2V0Q29sb3Iocm93W2NvbElkeF0uZ2V0Q29sb3IoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb3B5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZUFnZ3JlZ2F0ZUhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBjb2xIZWlnaHRzID0gdGhpcy5jYWxjdWxhdGVDb2x1bW5IZWlnaHRzKCk7XHJcbiAgICAgICAgcmV0dXJuIGNvbEhlaWdodHMucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhICsgYjsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBGYWxsaW5nU2VxdWVuY2VyLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVIaWdoZXN0Q29sdW1uKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGNvbEhlaWdodHMgPSB0aGlzLmNhbGN1bGF0ZUNvbHVtbkhlaWdodHMoKTtcclxuICAgICAgICByZXR1cm4gY29sSGVpZ2h0cy5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEgPiBiID8gYSA6IGI7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZUNvbXBsZXRlTGluZXMoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgY29tcGxldGVMaW5lcyA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocm93W2NvbElkeF0uZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb3VudCA+PSByb3cubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZUxpbmVzKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb21wbGV0ZUxpbmVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKiBEZXRlcm1pbmVzIGhvbGVzIGJ5IHNjYW5uaW5nIGVhY2ggY29sdW1uLCBoaWdoZXN0IGZsb29yIHRvIGxvd2VzdCBmbG9vciwgYW5kXHJcbiAgICAgKiBzZWVpbmcgaG93IG1hbnkgdGltZXMgaXQgc3dpdGNoZXMgZnJvbSBjb2xvcmVkIHRvIGVtcHR5IChidXQgbm90IHRoZSBvdGhlciB3YXkgYXJvdW5kKS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlSG9sZXMoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgdG90YWxIb2xlcyA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBob2xlcyA9IDA7XHJcbiAgICAgICAgICAgIGxldCBwcmV2aW91c0NlbGxXYXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzQ2VsbFdhc0VtcHR5ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjZWxsLmdldENvbG9yKCkgPT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvbGVzKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NlbGxXYXNFbXB0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvdGFsSG9sZXMgKz0gaG9sZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0b3RhbEhvbGVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZUJ1bXBpbmVzcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBidW1waW5lc3MgPSAwO1xyXG4gICAgICAgIGxldCBjb2xIZWlnaHRzID0gdGhpcy5jYWxjdWxhdGVDb2x1bW5IZWlnaHRzKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgY29sSGVpZ2h0cy5sZW5ndGggLSAyOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgdmFsMSA9IGNvbEhlaWdodHNbaWR4XTtcclxuICAgICAgICAgICAgbGV0IHZhbDIgPSBjb2xIZWlnaHRzW2lkeCArIDFdO1xyXG4gICAgICAgICAgICBidW1waW5lc3MgKz0gTWF0aC5hYnModmFsMSAtIHZhbDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYnVtcGluZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlQ29sdW1uSGVpZ2h0cygpOiBudW1iZXJbXSB7XHJcbiAgICAgICAgbGV0IGNvbEhlaWdodHM6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgIGNvbEhlaWdodHMucHVzaCgwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgaGlnaGVzdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvd0lkeCA9IE1BWF9ST1dTIC0gMTsgcm93SWR4ID49IDA7IHJvd0lkeC0tKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICAgICAgICAgIGlmIChjZWxsLmdldENvbG9yKCkgIT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGlnaGVzdCA9IE1BWF9ST1dTIC0gcm93SWR4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbEhlaWdodHNbY29sSWR4XSA9IGhpZ2hlc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xIZWlnaHRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG9ubHkgcmVhc29uIHRoaXMgaXMgbm90IHByaXZhdGUgaXMgc28gdGhlIEFJIGNhbiBleHBlcmltZW50IHdpdGggaXQuXHJcbiAgICAgKiBXb3JrIGhlcmUgc2hvdWxkIGFibGUgdG8gYmUgYmUgdW5kb25lIGJ5IHVuZG9Db252ZXJ0U2hhcGVUb0NlbGxzLlxyXG4gICAgICovXHJcbiAgICBjb252ZXJ0U2hhcGVUb0NlbGxzKCkge1xyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiB0aGlzLmN1cnJlbnRTaGFwZS5nZXRPZmZzZXRzKCkpIHtcclxuICAgICAgICAgICAgbGV0IHJvd0lkeCA9IG9mZnNldC55ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Um93KCk7XHJcbiAgICAgICAgICAgIGxldCBjb2xJZHggPSBvZmZzZXQueCArIHRoaXMuY3VycmVudFNoYXBlLmdldENvbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvd0lkeCA8IDAgfHwgcm93SWR4ID49IHRoaXMubWF0cml4Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb2xJZHggPCAwIHx8IGNvbElkeCA+PSB0aGlzLm1hdHJpeFtyb3dJZHhdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2VsbENvbG9yKHJvd0lkeCwgY29sSWR4LCB0aGlzLmN1cnJlbnRTaGFwZS5jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuIFNob3VsZCB1bmRvIGNvbnZlcnRTaGFwZVRvQ2VsbHMoKS5cclxuICAgICAqL1xyXG4gICAgdW5kb0NvbnZlcnRTaGFwZVRvQ2VsbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIHRoaXMuY3VycmVudFNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgcm93SWR4ID0gb2Zmc2V0LnkgKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICAgICAgbGV0IGNvbElkeCA9IG9mZnNldC54ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm93SWR4IDwgMCB8fCByb3dJZHggPj0gdGhpcy5tYXRyaXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbElkeCA8IDAgfHwgY29sSWR4ID49IHRoaXMubWF0cml4W3Jvd0lkeF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDZWxsQ29sb3Iocm93SWR4LCBjb2xJZHgsIENvbG9yLkVtcHR5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjbGVhcigpIHtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VDZWxsQ29sb3Iocm93SWR4LCBjb2xJZHgsIENvbG9yLkVtcHR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgW3RoaXMuanVua1Jvd0NvbG9yMSwgdGhpcy5qdW5rUm93Q29sb3IyXSA9IHRoaXMuZ2V0UmFuZG9tQ29sb3JzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRvIGNoYW5nZSBhIHNpbmdsZSBjZWxsIGNvbG9yJ3MgYW5kIG5vdGlmeSBzdWJzY3JpYmVycyBhdCB0aGUgc2FtZSB0aW1lLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNoYW5nZUNlbGxDb2xvcihyb3dJZHg6IG51bWJlciwgY29sSWR4OiBudW1iZXIsIGNvbG9yOiBDb2xvcikge1xyXG4gICAgICAgIC8vIFRPRE86IE1heWJlIGJvdW5kcyBjaGVjayBoZXJlLlxyXG4gICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgIGNlbGwuc2V0Q29sb3IoY29sb3IpO1xyXG4gICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgQ2VsbENoYW5nZUV2ZW50KGNlbGwsIHJvd0lkeCwgY29sSWR4LCB0aGlzLnBsYXllclR5cGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXJ0U2hhcGUoZm9yY2VCYWdSZWZpbGw6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZSA9IHRoaXMuc2hhcGVGYWN0b3J5Lm5leHRTaGFwZShmb3JjZUJhZ1JlZmlsbCk7XHJcbiAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQodHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB0cnlHcmF2aXR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjYW5Nb3ZlRG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVEb3duKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICBjYW5Nb3ZlRG93biA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNhbk1vdmVEb3duO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZW5kZWQgZm9yIGNoZWNraW5nIG9mIHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBjdXJyZW50XHJcbiAgICAgKiBzaGFwZSBoYXMgYW55IG92ZXJsYXAgd2l0aCBleGlzdGluZyBjZWxscyB0aGF0IGhhdmUgY29sb3IuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY29sbGlzaW9uRGV0ZWN0ZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGNvbGxpc2lvbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2YgdGhpcy5jdXJyZW50U2hhcGUuZ2V0T2Zmc2V0cygpKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSBvZmZzZXQueSArIHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpO1xyXG4gICAgICAgICAgICBsZXQgY29sID0gb2Zmc2V0LnggKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3cgPCAwIHx8IHJvdyA+PSB0aGlzLm1hdHJpeC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbCA8IDAgfHwgY29sID49IHRoaXMubWF0cml4W3Jvd10ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hdHJpeFtyb3ddW2NvbF0uZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbGxpc2lvbjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUZ1bGxCb2FyZCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZnVsbCA9IHRoaXMuaXNCb2FyZEZ1bGwoKTtcclxuICAgICAgICBpZiAoZnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU3RhdGUgPSBCb2FyZFN0YXRlLlBhdXNlZDsgLy8gU3RhbmRieSB1bnRpbCBzZXF1ZW5jZSBpcyBmaW5pc2hlZC5cclxuICAgICAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBCb2FyZEZpbGxlZEV2ZW50KHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgICAgICAgICBmdWxsID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZ1bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJdCBpcyBjb25zaWRlcmVkIGZ1bGwgaWYgdGhlIHR3byBvYnNjdXJlZCByb3dzIGF0IHRoZSB0b3AgaGF2ZSBjb2xvcmVkIGNlbGxzIGluIHRoZW0uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaXNCb2FyZEZ1bGwoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgMjsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICAgICAgICAgIGlmIChjZWxsLmdldENvbG9yKCkgIT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIGZpbGxlZCBsaW5lcyBtZXRob2QgMSBvZiAyLCBiZWZvcmUgYW5pbWF0aW9uLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGhhbmRsZUFueUZpbGxlZExpbmVzUGFydDEoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGZpbGxlZFJvd0lkeHMgPSB0aGlzLmRldGVybWluZUZpbGxlZFJvd0lkeHMoKTtcclxuICAgICAgICBpZiAoZmlsbGVkUm93SWR4cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgUm93c0ZpbGxlZEV2ZW50KGZpbGxlZFJvd0lkeHMsIHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU3RhdGUgPSBCb2FyZFN0YXRlLlBhdXNlZDsgLy8gU3RhbmRieSB1bnRpbCBhbmltYXRpb24gaXMgZmluaXNoZWQuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gRG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBpZiB0aGVyZSBhcmUgbm8gZmlsbGVkIGxpbmVzLlxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmlsbGVkUm93SWR4cy5sZW5ndGggPiAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIGZpbGxlZCBsaW5lcyBtZXRob2QgMiBvZiAyLCBhZnRlciBhbmltYXRpb24uXHJcbiAgICAgKiBUaGlzIGlzIHB1YmxpYyBzbyB0aGF0IHRoZSBNb2RlbCBjYW4gY2FsbCBpdC5cclxuICAgICAqL1xyXG4gICAgaGFuZGxlQW55RmlsbGVkTGluZXNQYXJ0MigpIHtcclxuICAgICAgICAvLyBIYXZlIHRvIGNoZWNrIHRoaXMgYWdhaW4gYmVjYXVzZSB0aGVyZSBpcyBhIHNsaWdodCBjaGFuY2UgdGhhdCByb3dzIHNoaWZ0ZWQgZHVyaW5nIHRoZSBhbmltYXRpb24uXHJcbiAgICAgICAgbGV0IGZpbGxlZFJvd0lkeHMgPSB0aGlzLmRldGVybWluZUZpbGxlZFJvd0lkeHMoKTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBmaWxsZWQgcm93cy5cclxuICAgICAgICAvLyBJIHRoaW5rIHRoaXMgb25seSB3b3JrcyBiZWNhdXNlIGRldGVybWluZUZpbGxlZFJvd0lkeHMoKSByZXR1cm5zIGFuIGFycmF5IHNvcnRlZCBhc2NlbmRpbmcgZnJvbSAwLlxyXG4gICAgICAgIC8vIElmIGl0IHdhc24ndCBzb3J0ZWQgdGhlbiBpdCBjb3VsZCBlbmQgdXAgc2tpcHBpbmcgcm93cy5cclxuICAgICAgICBmb3IgKGxldCBmaWxsZWRSb3dJZHggb2YgZmlsbGVkUm93SWR4cykge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUFuZENvbGxhcHNlKGZpbGxlZFJvd0lkeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBIYXZlIHRvIHNlbmQgY2VsbCBjaGFuZ2Ugbm90aWZpY2F0aW9ucyBiZWNhdXNlIHJlbW92ZUFuZENvbGxhcHNlKCkgZG9lcyBub3QuXHJcbiAgICAgICAgdGhpcy5ub3RpZnlBbGxDZWxscygpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRpb24gd2FzIGZpbmlzaGVkIGFuZCBib2FyZCB3YXMgdXBkYXRlZCwgc28gcmVzdW1lIHBsYXkuXHJcbiAgICAgICAgdGhpcy5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5JblBsYXk7XHJcbiAgICAgICAgdGhpcy5zdGFydFNoYXBlKGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgb25seSB0aGUgYm90dG9tIHJvdy5cclxuICAgICAqL1xyXG4gICAgcmVtb3ZlQm90dG9tTGluZSgpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUFuZENvbGxhcHNlKE1BWF9ST1dTIC0gMSk7XHJcblxyXG4gICAgICAgIC8vIEhhdmUgdG8gc2VuZCBjZWxsIGNoYW5nZSBub3RpZmljYXRpb25zIGJlY2F1c2UgcmVtb3ZlQW5kQ29sbGFwc2UoKSBkb2VzIG5vdC5cclxuICAgICAgICB0aGlzLm5vdGlmeUFsbENlbGxzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBub3RpZnlBbGxDZWxscygpIHtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCBNQVhfUk9XUzsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgQ2VsbENoYW5nZUV2ZW50KGNlbGwsIHJvd0lkeCwgY29sSWR4LCB0aGlzLnBsYXllclR5cGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBsaXN0IG9mIG51bWJlcnMsIGFzY2VuZGluZywgdGhhdCBjb3JyZXNwb25kIHRvIGZpbGxlZCByb3dzLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRldGVybWluZUZpbGxlZFJvd0lkeHMoKTogbnVtYmVyW10ge1xyXG4gICAgICAgIGxldCBmaWxsZWRSb3dJZHhzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGxldCBmaWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjZWxsIG9mIHJvdykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZmlsbGVkKSB7XHJcbiAgICAgICAgICAgICAgICBmaWxsZWRSb3dJZHhzLnB1c2gocm93SWR4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmlsbGVkUm93SWR4cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgcmVtb3ZlcyB0aGUgb2xkIHJvdyBhbmQgcHV0cyBhIG5ldyByb3cgaW4gaXRzIHBsYWNlIGF0IHBvc2l0aW9uIDAsIHdoaWNoIGlzIHRoZSBoaWdoZXN0IHZpc3VhbGx5IHRvIHRoZSBwbGF5ZXIuXHJcbiAgICAgKiBEZWxlZ2F0ZXMgY2VsbCBub3RpZmljYXRpb24gdG8gdGhlIGNhbGxpbmcgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlbW92ZUFuZENvbGxhcHNlKHJvd0lkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5tYXRyaXguc3BsaWNlKHJvd0lkeCwgMSk7XHJcbiAgICAgICAgdGhpcy5tYXRyaXguc3BsaWNlKDAsIDAsIFtdKTtcclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXhbMF1bY29sSWR4XSA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KHN0YXJ0aW5nPWZhbHNlKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCh0aGlzLmN1cnJlbnRTaGFwZSwgdGhpcy5wbGF5ZXJUeXBlLCBzdGFydGluZykpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TmV4dEp1bmtSb3dDb2xvcigpOiBDb2xvciB7XHJcbiAgICAgICAgbGV0IGNvbG9yOiBDb2xvcjtcclxuICAgICAgICBpZiAodGhpcy5qdW5rUm93Q29sb3JJZHggPD0gMCkge1xyXG4gICAgICAgICAgICBjb2xvciA9IHRoaXMuanVua1Jvd0NvbG9yMTtcclxuICAgICAgICAgICAgdGhpcy5qdW5rUm93Q29sb3JJZHggPSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5qdW5rUm93Q29sb3JJZHggPj0gMSkge1xyXG4gICAgICAgICAgICBjb2xvciA9IHRoaXMuanVua1Jvd0NvbG9yMjtcclxuICAgICAgICAgICAgdGhpcy5qdW5rUm93Q29sb3JJZHggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRSYW5kb21Db2xvcnMoKTogW0NvbG9yLCBDb2xvcl0ge1xyXG5cclxuICAgICAgICAvLyBTZWxlY3QgdHdvIGNvbG9ycyB0aGF0IGFyZSBub3QgZXF1YWwgdG8gZWFjaCBvdGhlci5cclxuICAgICAgICBsZXQgcmFuZDEgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA3KTtcclxuICAgICAgICBsZXQgcmFuZDIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA3KTtcclxuICAgICAgICBpZiAocmFuZDEgPT09IHJhbmQyKSB7XHJcbiAgICAgICAgICAgIHJhbmQyKys7XHJcbiAgICAgICAgICAgIGlmIChyYW5kMiA+IDYpIHtcclxuICAgICAgICAgICAgICAgIHJhbmQyID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW3RoaXMuY29sb3JCeU51bWJlcihyYW5kMSksIHRoaXMuY29sb3JCeU51bWJlcihyYW5kMildO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGNvbG9yQnlOdW1iZXIodmFsdWU6IG51bWJlcik6IENvbG9yIHtcclxuICAgICAgICBsZXQgY29sb3I6IENvbG9yO1xyXG4gICAgICAgIHN3aXRjaCh2YWx1ZSkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLkN5YW47XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5ZZWxsb3c7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5QdXJwbGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5HcmVlbjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLlJlZDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLkJsdWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5PcmFuZ2U7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuV2hpdGU7IC8vIFNob3VsZG4ndCBnZXQgaGVyZVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5jb25zdCBGQUxMX1RJTUVfTVMgPSAxMjUwO1xyXG5cclxuaW50ZXJmYWNlIEZhbGxpbmdCb2FyZCB7XHJcbiAgICBjYWxjdWxhdGVIaWdoZXN0Q29sdW1uKCk6IG51bWJlcjtcclxuICAgIHJlbW92ZUJvdHRvbUxpbmUoKTogdm9pZDtcclxuICAgIHJlc2V0QW5kUGxheSgpOiB2b2lkXHJcbn1cclxuXHJcbmNsYXNzIEZhbGxHdWlkZSB7XHJcbiAgICBsYXN0SGVpZ2h0OiBudW1iZXI7XHJcbiAgICB0d2VlbmVkSGVpZ2h0OiBudW1iZXI7XHJcbiAgICBlbGFwc2VkOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGYWxsaW5nU2VxdWVuY2VyIHtcclxuXHJcbiAgICBwcml2YXRlIGJvYXJkOiBGYWxsaW5nQm9hcmQ7XHJcbiAgICBwcml2YXRlIGZhbGxUd2VlbjogYW55O1xyXG4gICAgcHJpdmF0ZSBmYWxsVHdlZW5FbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGZhbGxHdWlkZTogRmFsbEd1aWRlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGJvYXJkOiBGYWxsaW5nQm9hcmQpIHtcclxuICAgICAgICB0aGlzLmJvYXJkID0gYm9hcmQ7XHJcbiAgICAgICAgdGhpcy5mYWxsVHdlZW4gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZmFsbEd1aWRlID0gbmV3IEZhbGxHdWlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0QW5kUGxheShjYWxsYmFjazogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMuZmFsbEd1aWRlLmxhc3RIZWlnaHQgPSB0aGlzLmZhbGxHdWlkZS50d2VlbmVkSGVpZ2h0ID0gdGhpcy5ib2FyZC5jYWxjdWxhdGVIaWdoZXN0Q29sdW1uKCk7XHJcbiAgICAgICAgdGhpcy5mYWxsR3VpZGUuZWxhcHNlZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZmFsbFR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZmFsbEd1aWRlKVxyXG4gICAgICAgICAgICAudG8oe3R3ZWVuZWRIZWlnaHQ6IDB9LCBGQUxMX1RJTUVfTVMpXHJcbiAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLkxpbmVhci5Ob25lKSAvLyBTdXJwcmlzaW5nbHksIGxpbmVhciBpcyB0aGUgb25lIHRoYXQgbG9va3MgbW9zdCBcInJpZ2h0XCIuXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmFsbFR3ZWVuID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucmVzZXRBbmRQbGF5KCk7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy5mYWxsR3VpZGUuZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEb2luZyB0aGlzIGluIHR3byBwYXJ0cyBiZWNhdXNlIG9uQ29tcGxldGUoKSBjYW4gc2V0IHRoZSB0d2VlbiB0byBudWxsLlxyXG4gICAgICovXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmZhbGxUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmFsbEd1aWRlLmVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy5mYWxsVHdlZW4udXBkYXRlKHRoaXMuZmFsbEd1aWRlLmVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZmFsbFR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IG5ld0hlaWdodCA9IE1hdGguY2VpbCh0aGlzLmZhbGxHdWlkZS50d2VlbmVkSGVpZ2h0KTtcclxuICAgICAgICAgICAgaWYgICh0aGlzLmZhbGxHdWlkZS5sYXN0SGVpZ2h0ID4gbmV3SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlmZiA9IHRoaXMuZmFsbEd1aWRlLmxhc3RIZWlnaHQgLSBuZXdIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBkaWZmOyBpZHgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucmVtb3ZlQm90dG9tTGluZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5mYWxsR3VpZGUubGFzdEhlaWdodCA9IG5ld0hlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4vc2hhcGUnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5cclxuY2xhc3MgU2hhcGVJIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5DeWFuO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gNDtcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSB0cnVlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlSSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZUkoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVKIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5CbHVlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSB0cnVlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZUoge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVKKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlTCBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuT3JhbmdlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSB0cnVlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAxLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMSwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlTCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZUwoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVPIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5ZZWxsb3c7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSA0O1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IGZhbHNlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlTyB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZU8oKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVTIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5HcmVlbjtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gZmFsc2U7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAxLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVTIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlUygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZVQgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLlB1cnBsZTtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gdHJ1ZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZVQge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVUKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlWiBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuUmVkO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSBmYWxzZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMCwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZVoge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVaKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTaGFwZUZhY3Rvcnkge1xyXG4gICAgcHJpdmF0ZSBiYWc6IFNoYXBlW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5yZWZpbGxCYWcodHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFNoYXBlKGZvcmNlQmFnUmVmaWxsOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYmFnLmxlbmd0aCA8PSAwIHx8IGZvcmNlQmFnUmVmaWxsID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVmaWxsQmFnKGZvcmNlQmFnUmVmaWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFnLnBvcCgpOyAvLyBHZXQgZnJvbSBlbmQgb2YgYXJyYXkuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWZpbGxCYWcoc3RhcnRpbmdQaWVjZUFzRmlyc3Q6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmJhZyA9IFtcclxuICAgICAgICAgICAgbmV3IFNoYXBlSSgpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVKKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZUwoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlVCgpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVPKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZVMoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlWigpXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBGaXNoZXItWWF0ZXMgU2h1ZmZsZSwgYmFzZWQgb246IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI0NTA5NzZcclxuICAgICAgICAgICAgbGV0IGlkeCA9IHRoaXMuYmFnLmxlbmd0aFxyXG4gICAgICAgICAgICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxyXG4gICAgICAgICAgICB3aGlsZSAoMCAhPT0gaWR4KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cclxuICAgICAgICAgICAgICAgIGxldCBybmRJZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpZHgpO1xyXG4gICAgICAgICAgICAgICAgaWR4IC09IDE7XHJcbiAgICAgICAgICAgICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcFZhbCA9IHRoaXMuYmFnW2lkeF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhZ1tpZHhdID0gdGhpcy5iYWdbcm5kSWR4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFnW3JuZElkeF0gPSB0ZW1wVmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPbmx5IGNlcnRhaW4gc2hhcGVzIGNhbiBiZSBkcm9wcGVkIG9udG8gd2hhdCBjb3VsZCBiZSBhIGJsYW5rIG9yIGFsbW9zdC1ibGFuayBncmlkLlxyXG4gICAgICAgIGlmIChzdGFydGluZ1BpZWNlQXNGaXJzdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBsZXQgbGFzdElkeCA9IHRoaXMuYmFnLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJhZ1tsYXN0SWR4XS5zdGFydGluZ0VsaWdpYmxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEbyBub3QgbmVlZCB0byBkbyBhbnl0aGluZy5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGxhc3RJZHg7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYmFnW2lkeF0uc3RhcnRpbmdFbGlnaWJsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcFZhbCA9IHRoaXMuYmFnW2xhc3RJZHhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhZ1tsYXN0SWR4XSA9IHRoaXMuYmFnW2lkeF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmFnW2lkeF0gPSB0ZW1wVmFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGRlYWRTaGFwZUZhY3RvcnkgPSBuZXcgU2hhcGVGYWN0b3J5KCk7IC8vIFVzZWQgYnkgQUkuIiwiaW1wb3J0IHtDZWxsT2Zmc2V0fSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcblxyXG5jb25zdCBTUEFXTl9DT0wgPSAzOyAvLyBMZWZ0IHNpZGUgb2YgbWF0cml4IHNob3VsZCBjb3JyZXNwb25kIHRvIHRoaXMuXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2hhcGUge1xyXG4gICAgYWJzdHJhY3QgcmVhZG9ubHkgY29sb3I6IENvbG9yO1xyXG4gICAgYWJzdHJhY3QgcmVhZG9ubHkgdmFsdWVzUGVyUm93OiBudW1iZXI7XHJcbiAgICBhYnN0cmFjdCByZWFkb25seSBzdGFydGluZ0VsaWdpYmxlOiBib29sZWFuO1xyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBtYXRyaWNlczogUmVhZG9ubHlBcnJheTxSZWFkb25seUFycmF5PG51bWJlcj4+O1xyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGdldEluc3RhbmNlKCk6IFNoYXBlO1xyXG5cclxuICAgIHByaXZhdGUgY3VycmVudE1hdHJpeEluZGV4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJvdzogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjb2w6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IDA7IC8vIFRPRE86IEVuc3VyZSBwb3NpdGlvbiAwIGlzIHRoZSBzcGF3biBwb3NpdGlvblxyXG4gICAgICAgIHRoaXMucm93ID0gMDtcclxuICAgICAgICB0aGlzLmNvbCA9IFNQQVdOX0NPTDtcclxuICAgICAgICB0aGlzLnN0YXJ0aW5nRWxpZ2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlTGVmdCgpIHtcclxuICAgICAgICB0aGlzLmNvbC0tO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICB0aGlzLmNvbCsrO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICB0aGlzLnJvdy0tO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVEb3duKCkge1xyXG4gICAgICAgIHRoaXMucm93Kys7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgbW92ZVRvVG9wKCkge1xyXG4gICAgICAgIHRoaXMucm93ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVDb3VudGVyQ2xvY2t3aXNlKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4IC09IDE7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVBcnJheUJvdW5kcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUNsb2Nrd2lzZSgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCArPSAxO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQXJyYXlCb3VuZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3coKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm93O1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb2w7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um93Q291bnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmdldEN1cnJlbnRNYXRyaXgoKS5sZW5ndGggLyB0aGlzLnZhbHVlc1BlclJvdyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0T2Zmc2V0cygpOiBDZWxsT2Zmc2V0W10ge1xyXG4gICAgICAgIGxldCBtYXRyaXggPSB0aGlzLmdldEN1cnJlbnRNYXRyaXgoKTtcclxuICAgICAgICBsZXQgb2Zmc2V0czogQ2VsbE9mZnNldFtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgbWF0cml4Lmxlbmd0aDsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWF0cml4W2lkeF07XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBpZHggJSB0aGlzLnZhbHVlc1BlclJvdztcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihpZHggLyB0aGlzLnZhbHVlc1BlclJvdyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0ID0gbmV3IENlbGxPZmZzZXQoeCwgeSk7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXRzLnB1c2gob2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2Zmc2V0cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhY2t5IG1ldGhvZCB1c2VkIGJ5IHRoZSBBSS5cclxuICAgICAqIFwiU2ltcGxlXCIgYXMgaW4gZG9lc24ndCBtYXR0ZXIgd2hhdCB0aGUgY3VycmVudCByb3cvY29sL21hdHJpeCBpcy5cclxuICAgICAqL1xyXG4gICAgY2xvbmVTaW1wbGUoKTogU2hhcGUge1xyXG4gICAgICAgIC8vIEdldCBhbiBpbnN0YW5jZSBvZiB0aGUgY29uY3JldGUgY2xhc3MuIFJlc3Qgb2YgdmFsdWVzIGFyZSBpcnJlbGV2YW50LlxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEluc3RhbmNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50TWF0cml4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hdHJpY2VzW3RoaXMuY3VycmVudE1hdHJpeEluZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVuc3VyZUFycmF5Qm91bmRzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggPSB0aGlzLm1hdHJpY2VzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA+PSB0aGlzLm1hdHJpY2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtCb2FyZH0gZnJvbSAnLi9ib2FyZC9ib2FyZCc7XHJcbmltcG9ydCB7QWl9IGZyb20gJy4vYWkvYWknO1xyXG5pbXBvcnQge25wY01hbmFnZXJ9IGZyb20gJy4vbnBjL25wYy1tYW5hZ2VyJztcclxuaW1wb3J0IHtldmVudEJ1cywgRXZlbnRUeXBlfSBmcm9tICcuLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NGaWxsZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcm93cy1maWxsZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9yb3dzLWNsZWFyLWFuaW1hdGlvbi1jb21wbGV0ZWQtZXZlbnQnO1xyXG5pbXBvcnQge0JvYXJkRmlsbGVkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2JvYXJkLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7SHBDaGFuZ2VkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1NoYXBlRmFjdG9yeX0gZnJvbSAnLi9ib2FyZC9zaGFwZS1mYWN0b3J5JztcclxuaW1wb3J0IHtGYWxsaW5nU2VxdWVuY2VyfSBmcm9tICcuL2JvYXJkL2ZhbGxpbmctc2VxdWVuY2VyJztcclxuaW1wb3J0IHtGYWxsaW5nU2VxdWVuY2VyRXZlbnR9IGZyb20gJy4uL2V2ZW50L2ZhbGxpbmctc2VxdWVuY2VyLWV2ZW50JztcclxuXHJcbmNvbnN0IE1BWF9IUCA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjsgLy8gSFAgY29ycmVzcG9uZHMgdG8gdGhlIG51bWJlciBvZiBsb25nIHdpbmRvd3Mgb24gdGhlIHNlY29uZCBmbG9vciBvZiB0aGUgcGh5c2ljYWwgYnVpbGRpbmcuXHJcblxyXG5jbGFzcyBNb2RlbCB7XHJcbiAgICBwcml2YXRlIGh1bWFuQm9hcmQ6IEJvYXJkO1xyXG4gICAgcHJpdmF0ZSBodW1hbkZhbGxpbmdTZXF1ZW5jZXI6IEZhbGxpbmdTZXF1ZW5jZXI7XHJcbiAgICBwcml2YXRlIGh1bWFuSGl0UG9pbnRzOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBhaUJvYXJkOiBCb2FyZDtcclxuICAgIHByaXZhdGUgYWlGYWxsaW5nU2VxdWVuY2VyOiBGYWxsaW5nU2VxdWVuY2VyO1xyXG4gICAgcHJpdmF0ZSBhaUhpdFBvaW50czogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgYWk6IEFpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGxldCBodW1hblNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTtcclxuICAgICAgICB0aGlzLmh1bWFuQm9hcmQgPSBuZXcgQm9hcmQoUGxheWVyVHlwZS5IdW1hbiwgaHVtYW5TaGFwZUZhY3RvcnksIGV2ZW50QnVzKTtcclxuICAgICAgICB0aGlzLmh1bWFuRmFsbGluZ1NlcXVlbmNlciA9IG5ldyBGYWxsaW5nU2VxdWVuY2VyKHRoaXMuaHVtYW5Cb2FyZCk7XHJcbiAgICAgICAgdGhpcy5odW1hbkhpdFBvaW50cyA9IE1BWF9IUDtcclxuXHJcbiAgICAgICAgbGV0IGFpU2hhcGVGYWN0b3J5ID0gbmV3IFNoYXBlRmFjdG9yeSgpO1xyXG4gICAgICAgIHRoaXMuYWlCb2FyZCA9IG5ldyBCb2FyZChQbGF5ZXJUeXBlLkFpLCBhaVNoYXBlRmFjdG9yeSwgZXZlbnRCdXMpO1xyXG4gICAgICAgIHRoaXMuYWlGYWxsaW5nU2VxdWVuY2VyID0gbmV3IEZhbGxpbmdTZXF1ZW5jZXIodGhpcy5haUJvYXJkKTtcclxuICAgICAgICB0aGlzLmFpSGl0UG9pbnRzID0gTUFYX0hQO1xyXG5cclxuICAgICAgICB0aGlzLmFpID0gbmV3IEFpKHRoaXMuYWlCb2FyZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlBsYXllck1vdmVtZW50RXZlbnRUeXBlLCAoZXZlbnQ6IFBsYXllck1vdmVtZW50RXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVQbGF5ZXJNb3ZlbWVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5Sb3dzRmlsbGVkRXZlbnRUeXBlLCAoZXZlbnQ6IFJvd3NGaWxsZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVJvd3NGaWxsZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5Sb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudFR5cGUsIChldmVudDogUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVSb3dDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkJvYXJkRmlsbGVkRXZlbnRUeXBlLCAoZXZlbnQ6IEJvYXJkRmlsbGVkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVCb2FyZEZpbGxlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmFpLnN0YXJ0KCk7XHJcbiAgICAgICAgbnBjTWFuYWdlci5zdGFydCgpO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBJbnN0ZWFkIG9mIGhlcmUsIHN0YXJ0IGdhbWUgd2hlbiBwbGF5ZXIgaGl0cyBhIGtleSBmaXJzdC5cclxuICAgICAgICB0aGlzLmh1bWFuQm9hcmQucmVzZXRBbmRQbGF5KCk7XHJcbiAgICAgICAgdGhpcy5haUJvYXJkLnJlc2V0QW5kUGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5odW1hbkJvYXJkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5odW1hbkZhbGxpbmdTZXF1ZW5jZXIuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5haUJvYXJkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5haUZhbGxpbmdTZXF1ZW5jZXIuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5haS5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICBucGNNYW5hZ2VyLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVQbGF5ZXJNb3ZlbWVudChldmVudDogUGxheWVyTW92ZW1lbnRFdmVudCkge1xyXG4gICAgICAgIGxldCBib2FyZCA9IHRoaXMuZGV0ZXJtaW5lQm9hcmRGb3IoZXZlbnQucGxheWVyVHlwZSk7XHJcblxyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQubW92ZW1lbnQpIHtcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlTGVmdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVSaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuRG93bjpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZURvd24oKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LkRyb3A6XHJcbiAgICAgICAgICAgICAgICBpZiAoYm9hcmQubW92ZVNoYXBlRG93bkFsbFRoZVdheSgpKSB7ICAgICAgIC8vIENoZWNrIHRoYXQgd2UgYXJlIGluIGEgcG9zaXRpb24gdG8gbW92ZSB0aGUgc2hhcGUgZG93biBiZWZvcmUgZXhlY3V0aW5nIHRoZSBuZXh0IGxpbmUuIFxyXG4gICAgICAgICAgICAgICAgICAgIGJvYXJkLmhhbmRsZUVuZE9mQ3VycmVudFBpZWNlVGFza3MoKTsgICAvLyBQcmV2ZW50cyBhbnkgb3RoZXIga2V5c3Ryb2tlcyBhZmZlY3RpbmcgdGhlIHNoYXBlIGFmdGVyIGl0IGhpdHMgdGhlIGJvdHRvbS5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LlJvdGF0ZUNsb2Nrd2lzZTpcclxuICAgICAgICAgICAgICAgIGJvYXJkLnJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmhhbmRsZWQgbW92ZW1lbnQnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zZmVyIHRoZSBmaWxsZWQgcm93cyB0byBiZSBqdW5rIHJvd3Mgb24gdGhlIG9wcG9zaXRlIHBsYXllcidzIGJvYXJkLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGhhbmRsZVJvd3NGaWxsZWRFdmVudChldmVudDogUm93c0ZpbGxlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGJvYXJkID0gdGhpcy5kZXRlcm1pbmVCb2FyZEZvck9wcG9zaXRlT2YoZXZlbnQucGxheWVyVHlwZSk7XHJcbiAgICAgICAgYm9hcmQuYWRkSnVua1Jvd3MoZXZlbnQuZmlsbGVkUm93SWR4cy5sZW5ndGgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlUm93Q2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudChldmVudDogUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgYm9hcmQgPSB0aGlzLmRldGVybWluZUJvYXJkRm9yKGV2ZW50LnBsYXllclR5cGUpO1xyXG4gICAgICAgIGJvYXJkLmhhbmRsZUFueUZpbGxlZExpbmVzUGFydDIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGh1bWFuJ3MgYm9hcmQgaWYgZ2l2ZW4gdGhlIGh1bWFuJ3MgdHlwZSwgb3IgQUkncyBib2FyZCBpZiBnaXZlbiB0aGUgQUkuIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRldGVybWluZUJvYXJkRm9yKHBsYXllclR5cGU6IFBsYXllclR5cGUpOiBCb2FyZCB7XHJcbiAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHVtYW5Cb2FyZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5haUJvYXJkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIHRoaXMgbWV0aG9kIGlzIGdpdmVuIFwiSHVtYW5cIiwgaXQgd2lsbCByZXR1cm4gdGhlIEFJJ3MgYm9hcmQsIGFuZCB2aWNlIHZlcnNhLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRldGVybWluZUJvYXJkRm9yT3Bwb3NpdGVPZihwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKTogQm9hcmQge1xyXG4gICAgICAgIGlmIChwbGF5ZXJUeXBlID09PSBQbGF5ZXJUeXBlLkh1bWFuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFpQm9hcmQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHVtYW5Cb2FyZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVCb2FyZEZpbGxlZEV2ZW50KGV2ZW50OiBCb2FyZEZpbGxlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGJvYXJkOiBCb2FyZDtcclxuICAgICAgICBsZXQgZmFsbGluZ1NlcXVlbmNlcjogRmFsbGluZ1NlcXVlbmNlcjtcclxuICAgICAgICBsZXQgaHA6IG51bWJlcjtcclxuXHJcbiAgICAgICAgaWYgKGV2ZW50LnBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgYm9hcmQgPSB0aGlzLmh1bWFuQm9hcmQ7XHJcbiAgICAgICAgICAgIGZhbGxpbmdTZXF1ZW5jZXIgPSB0aGlzLmh1bWFuRmFsbGluZ1NlcXVlbmNlcjtcclxuICAgICAgICAgICAgaHAgPSAodGhpcy5odW1hbkhpdFBvaW50cyAtPSAxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBib2FyZCA9IHRoaXMuYWlCb2FyZDtcclxuICAgICAgICAgICAgZmFsbGluZ1NlcXVlbmNlciA9IHRoaXMuYWlGYWxsaW5nU2VxdWVuY2VyO1xyXG4gICAgICAgICAgICBocCA9ICh0aGlzLmFpSGl0UG9pbnRzIC09IDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgSHBDaGFuZ2VkRXZlbnQoaHAsIGV2ZW50LnBsYXllclR5cGUpKTtcclxuICAgICAgICAvLyBUT0RPOiBTZWUgaWYgb25lIG9mIHRoZSBwbGF5ZXJzIGhhcyBydW4gb3V0IG9mIEhQLCBzb21ld2hlcmUgaWYgbm90IGhlcmUuXHJcblxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEZhbGxpbmdTZXF1ZW5jZXJFdmVudChldmVudC5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgZmFsbGluZ1NlcXVlbmNlci5yZXNldEFuZFBsYXkoKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBJIGRvbid0IGtub3csIG1heWJlIG5vdGhpbmcuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQuc3RhcnRpbmcgPT09IHRydWUgJiYgZXZlbnQucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5BaSkge1xyXG4gICAgICAgICAgICB0aGlzLmFpLnN0cmF0ZWdpemUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBOb3RoaW5nIGN1cnJlbnRseSBmb3IgdGhlIGh1bWFuJ3MgYm9hcmQgdG8gYmUgZG9pbmcgYXQgdGhpcyB0aW1lLlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgbW9kZWwgPSBuZXcgTW9kZWwoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5pbXBvcnQge05wY30gZnJvbSAnLi9ucGMnXHJcbmltcG9ydCB7TnBjU3RhdGV9IGZyb20gJy4uLy4uL2RvbWFpbi9ucGMtc3RhdGUnO1xyXG5pbXBvcnQge2V2ZW50QnVzLCBFdmVudFR5cGV9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvc3RhbmRlZS1tb3ZlbWVudC1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5cclxuLy8gU3RhcnRpbmcgcG9zaXRpb24gY291bnRzIHVzZWQgaW4gaW5pdGlhbGl6YXRpb24uXHJcbmNvbnN0IFRPVEFMX05QQ1MgPSAyMDtcclxuXHJcbmNsYXNzIE5wY01hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgbnBjczogTWFwPG51bWJlciwgTnBjPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm5wY3MgPSBuZXcgTWFwPG51bWJlciwgTnBjPigpO1xyXG4gICAgICAgIGZvciAobGV0IG5wY0lkeCA9IDA7IG5wY0lkeCA8IFRPVEFMX05QQ1M7IG5wY0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBucGMgPSBuZXcgTnBjKCk7XHJcbiAgICAgICAgICAgIHRoaXMubnBjcy5zZXQobnBjLmlkLCBucGMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGUsIChldmVudDogU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm5wY3MuZm9yRWFjaCgobnBjOiBOcGMpID0+IHtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSAoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSAoTWF0aC5yYW5kb20oKSAqIDE1KTtcclxuICAgICAgICAgICAgICAgIG5wYy5zdGFydCh4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogTW92ZSB0aGlzIGVsc2V3aGVyZTpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSAoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSAoTWF0aC5yYW5kb20oKSAqIDE1KTtcclxuICAgICAgICAgICAgICAgIG5wYy5iZWdpbldhbGtpbmdUbyh4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ucGNzLmZvckVhY2goKG5wYzogTnBjKSA9PiB7XHJcbiAgICAgICAgICAgIG5wYy5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChldmVudDogU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBucGMgPSB0aGlzLm5wY3MuZ2V0KGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBpZiAobnBjICE9IG51bGwpIHtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBldmVudC56O1xyXG4gICAgICAgICAgICAgICAgbnBjLnVwZGF0ZVBvc2l0aW9uKHgsIHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IChNYXRoLnJhbmRvbSgpICogNyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IChNYXRoLnJhbmRvbSgpICogMTUpO1xyXG4gICAgICAgICAgICAgICAgbnBjLmJlZ2luV2Fsa2luZ1RvKHgsIHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBucGNNYW5hZ2VyID0gbmV3IE5wY01hbmFnZXIoKTsiLCJpbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY01vdmVtZW50Q2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjU3RhdGV9IGZyb20gJy4uLy4uL2RvbWFpbi9ucGMtc3RhdGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wYyB7XHJcbiAgICByZWFkb25seSBpZDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGU6IE5wY1N0YXRlO1xyXG4gICAgcHJpdmF0ZSB0aW1lSW5TdGF0ZTogbnVtYmVyO1xyXG5cclxuICAgIC8vIFwiTGFzdFwiIGFzIGluIHRoZSBsYXN0IGtub3duIGNvb3JkaW5hdGUsIGJlY2F1c2UgaXQgY291bGQgYmUgY3VycmVudGx5IGluLW1vdGlvbi5cclxuICAgIHByaXZhdGUgeGxhc3Q6IG51bWJlcjtcclxuICAgIHByaXZhdGUgeWxhc3Q6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmlkID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0gTnBjU3RhdGUuSWRsZTtcclxuICAgICAgICB0aGlzLnRpbWVJblN0YXRlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy54bGFzdCA9IDA7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnhsYXN0ID0geDtcclxuICAgICAgICB0aGlzLnlsYXN0ID0geTtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBOcGNQbGFjZWRFdmVudCh0aGlzLmlkLCB0aGlzLnN0YXRlLCB4LCB5KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIHNob3VsZCBiZSBjYWxsZWQgYnkgdGhlIE5QQyBtYW5hZ2VyIHJhdGhlciB0aGFuIHRyYWNrcyB0aGF0IHJlZmVyZW5jZSB0aGVtLlxyXG4gICAgICovXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMudGltZUluU3RhdGUgKz0gZWxhcHNlZDtcclxuICAgIH1cclxuXHJcbiAgICB0cmFuc2l0aW9uVG8oc3RhdGU6IE5wY1N0YXRlKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMudGltZUluU3RhdGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGJlZ2luV2Fsa2luZ1RvKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQodGhpcy5pZCwgeCwgeSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2lnbmlmaWVzIHRoZSBlbmQgb2YgYSB3YWxrLlxyXG4gICAgICovXHJcbiAgICB1cGRhdGVQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueGxhc3QgPSB4O1xyXG4gICAgICAgIHRoaXMueWxhc3QgPSB5O1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvblRvKE5wY1N0YXRlLklkbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXRlKCk6IE5wY1N0YXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7c3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlfSBmcm9tICcuL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UnO1xyXG5cclxuY2xhc3MgUHJlbG9hZGVyIHtcclxuICAgIFxyXG4gICAgcHJlbG9hZChjYWxsYmFjazogKCkgPT4gYW55KSB7XHJcbiAgICAgICAgc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlLnByZWxvYWQoY2FsbGJhY2spO1xyXG4gICAgICAgIC8vIFRPRE86IEdvaW5nIHRvIGhhdmUgYSBwYXJhbGxlbGlzbSBtZWNoYW5pc20gYWZ0ZXIgYWRkaW5nIG1vcmUgdG8gdGhpcy5cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgcHJlbG9hZGVyID0gbmV3IFByZWxvYWRlcigpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmNvbnN0IEFTUEVDVF9SQVRJTyA9IDE2Lzk7XHJcblxyXG5jbGFzcyBDYW1lcmFXcmFwcGVyIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgY2FtZXJhOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNjAsIEFTUEVDVF9SQVRJTywgMC4xLCAxMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVSZW5kZXJlclNpemUocmVuZGVyZXI6IGFueSkge1xyXG4gICAgICAgIGxldCB3aW5kb3dBc3BlY3RSYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIGxldCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcjtcclxuICAgICAgICBpZiAod2luZG93QXNwZWN0UmF0aW8gPiBBU1BFQ1RfUkFUSU8pIHtcclxuICAgICAgICAgICAgLy8gVG9vIHdpZGU7IHNjYWxlIG9mZiBvZiB3aW5kb3cgaGVpZ2h0LlxyXG4gICAgICAgICAgICB3aWR0aCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVySGVpZ2h0ICogQVNQRUNUX1JBVElPKTtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93QXNwZWN0UmF0aW8gPD0gQVNQRUNUX1JBVElPKSB7XHJcbiAgICAgICAgICAgIC8vIFRvbyBuYXJyb3cgb3IganVzdCByaWdodDsgc2NhbGUgb2ZmIG9mIHdpbmRvdyB3aWR0aC5cclxuICAgICAgICAgICAgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJXaWR0aCAvIEFTUEVDVF9SQVRJTyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIC8vIFNob3VsZCBiZSBubyBuZWVkIHRvIHVwZGF0ZSBhc3BlY3QgcmF0aW8gYmVjYXVzZSBpdCBzaG91bGQgYmUgY29uc3RhbnQuXHJcbiAgICAgICAgLy8gdGhpcy5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgbG9va0F0KHZlYzM6IGFueSkge1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tBdCh2ZWMzKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgY2FtZXJhV3JhcHBlciA9IG5ldyBDYW1lcmFXcmFwcGVyKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1aWxkaW5nIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgc2xhYjogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgb2xkIHBsYWluIGN1YmUuXHJcbiAgICAgICAgLy8gbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDExLCAyMCwgMTApO1xyXG4gICAgICAgIC8vIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtjb2xvcjogMHhmZmZmZmZ9KTtcclxuICAgICAgICAvLyB0aGlzLnNsYWIgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIC8vIHRoaXMuc2xhYi5wb3NpdGlvbi5zZXQoNC41LCAxMCwgLTUuOCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogTW92ZSB0aGlzIGludG8gYSBsb2FkZXJcclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGxldCBtdGxMb2FkZXIgPSBuZXcgVEhSRUUuTVRMTG9hZGVyKCk7XHJcbiAgICAgICAgbXRsTG9hZGVyLnNldFBhdGgoJycpO1xyXG4gICAgICAgIG10bExvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5tdGwnLCAobWF0ZXJpYWxzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgbWF0ZXJpYWxzLnByZWxvYWQoKTtcclxuICAgICAgICAgICAgbGV0IG9iakxvYWRlciA9IG5ldyBUSFJFRS5PQkpMb2FkZXIoKTtcclxuICAgICAgICAgICAgb2JqTG9hZGVyLnNldE1hdGVyaWFscyhtYXRlcmlhbHMpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIuc2V0UGF0aCgnJyk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5vYmonLCAob2JqOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIG9iai5zY2FsZS5zZXRTY2FsYXIoMC4yNSk7XHJcbiAgICAgICAgICAgICAgICBvYmoucG9zaXRpb24uc2V0KDUsIC0wLjAxLCAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXAuYWRkKG9iaik7XHJcbiAgICAgICAgICAgIH0sICgpID0+IHsgfSwgKCkgPT4geyBjb25zb2xlLmxvZygnZXJyb3Igd2hpbGUgbG9hZGluZyA6KCcpIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuZGVjbGFyZSBjb25zdCBUV0VFTjogYW55O1xyXG5cclxuaW1wb3J0IHtQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb25zdGFudHMnO1xyXG5cclxuY29uc3QgTUFYX0NVUlRBSU5fQ09VTlQgPSA0O1xyXG5jb25zdCBDVVJUQUlOX1dJRFRIID0gUEFORUxfQ09VTlRfUEVSX0ZMT09SO1xyXG5jb25zdCBDVVJUQUlOX01PVkVfVElNRSA9IDQwMDtcclxuXHJcbmNsYXNzIEN1cnRhaW5WZXJ0ZXhQb3NpdGlvbiB7XHJcbiAgICB4ID0gMDtcclxuICAgIGVsYXBzZWQgPSAwO1xyXG59XHJcblxyXG4vKipcclxuICogSSBtaWdodCBoYXZlIHNvbWUgb2YgdGhlc2UgYmFja3dhcmRzLi4uXHJcbiAqL1xyXG5leHBvcnQgZW51bSBDdXJ0YWluRGlyZWN0aW9uIHtcclxuICAgIE9wZW5MZWZ0VG9SaWdodCxcclxuICAgIE9wZW5SaWdodFRvTGVmdCxcclxuICAgIENsb3NlTGVmdFRvUmlnaHQsXHJcbiAgICBDbG9zZVJpZ2h0VG9MZWZ0XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTb21lIG5vdGVzIG9uIHZlcnRpY2VzIHdpdGhpbiBlYWNoIGN1cnRhaW4gbWVzaCB3aXRob3V0IG1vZGlmaWNhdGlvbnM6XHJcbiAqIFZlcnRpY2VzIDEgYW5kIDMgc2hvdWxkIHJlc3QgYXQgeCA9IC1DVVJUQUlOX1dJRFRIIC8gMiAoaG91c2UgbGVmdClcclxuICogVmVydGljZXMgMCBhbmQgMiBzaG91bGQgcmVzdCBhdCB4ID0gIENVUlRBSU5fV0lEVEggLyAyIChob3VzZSByaWdodClcclxuICogXHJcbiAqIEV4YW1wbGUgc3RhdGVtZW50czpcclxuICogY29uc29sZS5sb2coJ3ZlcnRpY2VzIDEgYW5kIDMgeDogJyArIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMV0ueCwgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1szXS54KTtcclxuICogY29uc29sZS5sb2coJ3ZlcnRpY2VzIDAgYW5kIDIgeDogJyArIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMF0ueCwgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1syXS54KTtcclxuICogY29uc29sZS5sb2coJy0tLScpO1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEN1cnRhaW4ge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICByZWFkb25seSBjdXJ0YWluczogYW55W107XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJ0YWluVmVydGV4UG9zaXRpb246IEN1cnRhaW5WZXJ0ZXhQb3NpdGlvbjtcclxuICAgIHByaXZhdGUgY3VydGFpblR3ZWVuOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIHRoaXMuY3VydGFpbnMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgTUFYX0NVUlRBSU5fQ09VTlQ7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KENVUlRBSU5fV0lEVEgsIDEpO1xyXG4gICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe2NvbG9yOiAweDEwMTAzMH0pOyAvLyBNaWRuaWdodCBCbHVlXHJcbiAgICAgICAgICAgIGxldCBjdXJ0YWluID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWlucy5wdXNoKGN1cnRhaW4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24gPSBuZXcgQ3VydGFpblZlcnRleFBvc2l0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5jdXJ0YWluVHdlZW4gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IGN1cnRhaW4gb2YgdGhpcy5jdXJ0YWlucykge1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLmFkZChjdXJ0YWluKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybSBncm91cCB0byBmaXQgYWdhaW5zdCBidWlsZGluZy5cclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCg1LjAsIDQuNzUsIC0xLjQ1MSk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5zY2FsZS5zZXQoMC43LCAxLjAsIDEpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnRhaW5Ud2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLmVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluVHdlZW4udXBkYXRlKHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLmVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGFydEFuaW1hdGlvbihmbG9vcklkeHM6IG51bWJlcltdLCBkaXJlY3Rpb246IEN1cnRhaW5EaXJlY3Rpb24sIGNhbGxiYWNrPzogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIC8vIFByZXZlbnQgbXVsdGlwbGUgYW5pbWF0aW9ucyBhdCB0aGUgc2FtZSB0aW1lLlxyXG4gICAgICAgIGlmICh0aGlzLmN1cnRhaW5Ud2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZHJvcEN1cnRhaW4oZmxvb3JJZHhzKTtcclxuXHJcbiAgICAgICAgbGV0IHhlbmQ6IG51bWJlcjtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlTGVmdFRvUmlnaHQgfHwgZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5MZWZ0VG9SaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54ID0gQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgICAgIHhlbmQgPSAtQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uQ2xvc2VSaWdodFRvTGVmdCB8fCBkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uT3BlblJpZ2h0VG9MZWZ0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLnggPSAtQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgICAgIHhlbmQgPSAgQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLmVsYXBzZWQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnRhaW5Ud2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbilcclxuICAgICAgICAgICAgLnRvKHt4OiB4ZW5kfSwgQ1VSVEFJTl9NT1ZFX1RJTUUpXHJcbiAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLlF1YXJ0aWMuSW5PdXQpXHJcbiAgICAgICAgICAgIC5vblVwZGF0ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBTZWUgbm90ZSBhdCB0b3AgYWJvdXQgd2h5IGlkeDEgYW5kIGlkeDIgYXJlIHdoYXQgdGhleSBhcmUuXHJcbiAgICAgICAgICAgICAgICBsZXQgaWR4MTogbnVtYmVyLCBpZHgyOiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlUmlnaHRUb0xlZnQgfHwgZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5MZWZ0VG9SaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDEgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDIgPSAyO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uQ2xvc2VMZWZ0VG9SaWdodCB8fCBkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uT3BlblJpZ2h0VG9MZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4MSA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4MiA9IDM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjdXJ0YWluIG9mIHRoaXMuY3VydGFpbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzW2lkeDFdLnggPSB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54O1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbaWR4Ml0ueCA9IHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAub25Db21wbGV0ZSgoKSA9PiB7IHRoaXMuY29tcGxldGVBbmltYXRpb24oY2FsbGJhY2spOyB9KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24uZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlIHRoZSByZXF1ZXN0ZWQgbnVtYmVyIG9mIGN1cnRhaW5zIHZpc2libGUuXHJcbiAgICAgKiBQb3NpdGlvbiB0aGVtIG9uIHRoZSByZXF1ZXN0ZWQgZmxvb3JzLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRyb3BDdXJ0YWluKGZsb29ySWR4czogbnVtYmVyW10pIHtcclxuICAgICAgICBmb3IgKGxldCBjdXJ0YWluIG9mIHRoaXMuY3VydGFpbnMpIHtcclxuICAgICAgICAgICAgY3VydGFpbi52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBmbG9vcklkeHMubGVuZ3RoOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgZmxvb3JJZHggPSBmbG9vcklkeHNbaWR4XTtcclxuICAgICAgICAgICAgbGV0IGN1cnRhaW4gPSB0aGlzLmN1cnRhaW5zW2lkeF07XHJcblxyXG4gICAgICAgICAgICBjdXJ0YWluLnBvc2l0aW9uLnNldCgwLCBmbG9vcklkeCwgMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTZWUgbm90ZSBhdCB0b3AgYWJvdXQgd2h5IHRoZXNlIGFyZSB3aGVyZSB0aGV5IGFyZS5cclxuICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1swXS54ID0gLUNVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzFdLnggPSAgQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMl0ueCA9IC1DVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1szXS54ID0gIENVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjdXJ0YWluLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbXBsZXRlQW5pbWF0aW9uKGNhbGxiYWNrPzogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY3VydGFpblR3ZWVuID0gbnVsbDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7SHBPcmllbnRhdGlvbn0gZnJvbSAnLi4vLi4vZG9tYWluL2hwLW9yaWVudGF0aW9uJztcclxuXHJcbmV4cG9ydCBjbGFzcyBIcFBhbmVscyB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHBhbmVsczogYW55W107XHJcbiAgICBwcml2YXRlIGhwT3JpZW50YXRpb246IEhwT3JpZW50YXRpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IoaHBPcmllbnRhdGlvbjogSHBPcmllbnRhdGlvbikge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBhbmVscyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMC42LCAwLjYpO1xyXG4gICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoKTtcclxuICAgICAgICAgICAgbGV0IHBhbmVsID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICAgICAgbGV0IHggPSBpZHg7XHJcbiAgICAgICAgICAgIGxldCB5ID0gMDtcclxuICAgICAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgICAgICBwYW5lbC5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcbiAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IE1ha2UgdGhpcyBwdWxzZSBhdCBhbGw/XHJcbiAgICAgICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlLnNldEhleCgweGZmZmZmZik7XHJcbiAgICAgICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlSW50ZW5zaXR5ID0gMC4yNTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLnB1c2gocGFuZWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ocE9yaWVudGF0aW9uID0gaHBPcmllbnRhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLmFkZChwYW5lbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gdG8gZml0IGFnYWluc3QgYnVpbGRpbmcuXHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoMS44NSwgMy41NSwgLTEuNSk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5zY2FsZS5zZXQoMC43LCAxLjksIDEpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUhwKFBBTkVMX0NPVU5UX1BFUl9GTE9PUik7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSFAgYmFyIGNhbiBnbyBmcm9tIHJpZ2h0LXRvLWxlZnQgb3IgbGVmdC10by1yaWdodCwgbGlrZSBhIGZpZ2h0aW5nIGdhbWUgSFAgYmFyLlxyXG4gICAgICovXHJcbiAgICB1cGRhdGVIcChocDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGhwID4gUEFORUxfQ09VTlRfUEVSX0ZMT09SKSB7XHJcbiAgICAgICAgICAgIGhwID0gUEFORUxfQ09VTlRfUEVSX0ZMT09SO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgdGhpcy5wYW5lbHMubGVuZ3RoOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcGFuZWwgPSB0aGlzLnBhbmVsc1tpZHhdO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ocE9yaWVudGF0aW9uID09PSBIcE9yaWVudGF0aW9uLkRlY3JlYXNlc1JpZ2h0VG9MZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaWR4IDwgaHApIHtcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkeCA+PSBQQU5FTF9DT1VOVF9QRVJfRkxPT1IgLSBocCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE86IEhhbmRsZSB1cGRhdGUgdG8gSFAgPSBmdWxsIGFzIGRpZmZlcmVudCBmcm9tIEhQIDwgZnVsbC5cclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuZGVjbGFyZSBjb25zdCBUV0VFTjogYW55O1xyXG5cclxuaW1wb3J0IHtCdWlsZGluZ30gZnJvbSAnLi9idWlsZGluZyc7XHJcbmltcG9ydCB7Q3VydGFpbn0gZnJvbSAnLi9jdXJ0YWluJztcclxuaW1wb3J0IHtIcFBhbmVsc30gZnJvbSAnLi9ocC1wYW5lbHMnO1xyXG5pbXBvcnQge0hwT3JpZW50YXRpb259IGZyb20gJy4uLy4uL2RvbWFpbi9ocC1vcmllbnRhdGlvbic7XHJcbmltcG9ydCB7Um93Q2xlYXJEaXJlY3Rpb259IGZyb20gJy4uLy4uL2RvbWFpbi9yb3ctY2xlYXItZGlyZWN0aW9uJztcclxuaW1wb3J0IHtDdXJ0YWluRGlyZWN0aW9ufSBmcm9tICcuL2N1cnRhaW4nO1xyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcblxyXG4vLyBUT0RPOiBPbmx5IHRoZSAzcmQgZmxvb3IgZnJvbSB0aGUgdG9wIGFuZCBiZWxvdyBhcmUgdmlzaWJsZS4gQWxzbywgc2VlIGJvYXJkLnRzLlxyXG5leHBvcnQgY29uc3QgRkxPT1JfQ09VTlQgPSAxNztcclxuXHJcbmNvbnN0IEFDVElWRV9TSEFQRV9MSUdIVF9DT1VOVCA9IDQ7XHJcbmNvbnN0IFBBTkVMX1NJWkUgPSAwLjc7XHJcblxyXG5jbGFzcyBFbWlzc2l2ZUludGVuc2l0eSB7XHJcbiAgICB2YWx1ZTogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGlnaHRpbmdHcmlkIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHBhbmVsR3JvdXA6IGFueTtcclxuICAgIHByaXZhdGUgYnVpbGRpbmc6IEJ1aWxkaW5nO1xyXG5cclxuICAgIHByaXZhdGUgcm93Q2xlYXJEaXJlY3Rpb246IFJvd0NsZWFyRGlyZWN0aW9uXHJcbiAgICBwcml2YXRlIHJvd0NsZWFyQ3VydGFpbjogQ3VydGFpbjtcclxuICAgIHByaXZhdGUganVua1Jvd0N1cnRhaW46IEN1cnRhaW47XHJcbiAgICBcclxuICAgIHByaXZhdGUgaHBQYW5lbHM6IEhwUGFuZWxzO1xyXG5cclxuICAgIHByaXZhdGUgcGFuZWxzOiBhbnlbXVtdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHNoYXBlTGlnaHRzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgY3VycmVudFNoYXBlTGlnaHRJZHg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgaGlnaGxpZ2h0ZXI6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHB1bHNlVHdlZW46IGFueTtcclxuICAgIHByaXZhdGUgcHVsc2VUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZW1pc3NpdmVJbnRlbnNpdHk6IEVtaXNzaXZlSW50ZW5zaXR5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhwT3JpZW50YXRpb246IEhwT3JpZW50YXRpb24sIHJvd0NsZWFyRGlyZWN0aW9uOiBSb3dDbGVhckRpcmVjdGlvbikge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYW5lbEdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcbiAgICAgICAgdGhpcy5idWlsZGluZyA9IG5ldyBCdWlsZGluZygpO1xyXG5cclxuICAgICAgICB0aGlzLnJvd0NsZWFyRGlyZWN0aW9uID0gcm93Q2xlYXJEaXJlY3Rpb247XHJcbiAgICAgICAgdGhpcy5yb3dDbGVhckN1cnRhaW4gPSBuZXcgQ3VydGFpbigpO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0N1cnRhaW4gPSBuZXcgQ3VydGFpbigpO1xyXG5cclxuICAgICAgICB0aGlzLmhwUGFuZWxzID0gbmV3IEhwUGFuZWxzKGhwT3JpZW50YXRpb24pO1xyXG5cclxuICAgICAgICB0aGlzLnBhbmVscyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGZsb29ySWR4ID0gMDsgZmxvb3JJZHggPCBGTE9PUl9DT1VOVDsgZmxvb3JJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBhbmVsc1tmbG9vcklkeF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFuZWxJZHggPSAwOyBwYW5lbElkeCA8IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjsgcGFuZWxJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoUEFORUxfU0laRSwgUEFORUxfU0laRSk7IC8vIFRPRE86IGNsb25lKCkgP1xyXG4gICAgICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtlbWlzc2l2ZUludGVuc2l0eTogMS4wfSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFuZWwgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB4ID0gcGFuZWxJZHg7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IGZsb29ySWR4ICsgMTsgLy8gT2Zmc2V0IHVwIDEgYmVjYXVzZSBncm91bmQgaXMgeSA9IDAuXHJcbiAgICAgICAgICAgICAgICBsZXQgeiA9IDA7XHJcbiAgICAgICAgICAgICAgICBwYW5lbC5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYW5lbHNbZmxvb3JJZHhdW3BhbmVsSWR4XSA9IHBhbmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNoYXBlTGlnaHRzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgY291bnQgPSAwOyBjb3VudCA8IEFDVElWRV9TSEFQRV9MSUdIVF9DT1VOVDsgY291bnQrKykge1xyXG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShQQU5FTF9TSVpFLCBQQU5FTF9TSVpFKTtcclxuICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtlbWlzc2l2ZUludGVuc2l0eTogMS4wfSk7XHJcbiAgICAgICAgICAgIGxldCBzaGFwZUxpZ2h0ID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICAgICAgdGhpcy5zaGFwZUxpZ2h0cy5wdXNoKHNoYXBlTGlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZUxpZ2h0SWR4ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRlciA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmYwMGZmLCAzLjUsIDMpO1xyXG5cclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW4gPSBudWxsO1xyXG4gICAgICAgIHRoaXMucHVsc2VUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkgPSBuZXcgRW1pc3NpdmVJbnRlbnNpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmJ1aWxkaW5nLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLnJvd0NsZWFyQ3VydGFpbi5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5qdW5rUm93Q3VydGFpbi5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5ocFBhbmVscy5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5wYW5lbEdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZGluZy5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMucm93Q2xlYXJDdXJ0YWluLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q3VydGFpbi5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuaHBQYW5lbHMuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgZmxvb3Igb2YgdGhpcy5wYW5lbHMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFuZWwgb2YgZmxvb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFuZWxHcm91cC5hZGQocGFuZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBzaGFwZUxpZ2h0IG9mIHRoaXMuc2hhcGVMaWdodHMpIHtcclxuICAgICAgICAgICAgdGhpcy5wYW5lbEdyb3VwLmFkZChzaGFwZUxpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGFuZWxHcm91cC5hZGQodGhpcy5oaWdobGlnaHRlcik7XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0byBmaXQgYWdhaW5zdCBidWlsZGluZy5cclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAucG9zaXRpb24uc2V0KDEuODUsIDMuOCwgLTEuNTUpO1xyXG4gICAgICAgIHRoaXMucGFuZWxHcm91cC5zY2FsZS5zZXQoMC43LCAxLjAsIDEpO1xyXG5cclxuICAgICAgICAvLyBNYWtlIGNlbGxzIGFwcGVhciB0byBwdWxzZS5cclxuICAgICAgICB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5LnZhbHVlID0gMC4zMztcclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5lbWlzc2l2ZUludGVuc2l0eSlcclxuICAgICAgICAgICAgLnRvKHt2YWx1ZTogMS4wfSwgNzUwKVxyXG4gICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5TaW51c29pZGFsLkluT3V0KVxyXG4gICAgICAgICAgICAueW95byh0cnVlKVxyXG4gICAgICAgICAgICAucmVwZWF0KEluZmluaXR5KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0ZXBQdWxzZShlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLnJvd0NsZWFyQ3VydGFpbi5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0N1cnRhaW4uc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmhwUGFuZWxzLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoUm9vbU9mZihmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHBhbmVsID0gdGhpcy5wYW5lbHNbZmxvb3JJZHhdW3BhbmVsSWR4XTtcclxuICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoUm9vbU9uKGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIsIGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcGFuZWwgPSB0aGlzLnBhbmVsc1tmbG9vcklkeF1bcGFuZWxJZHhdO1xyXG4gICAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHBhbmVsLm1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvcik7XHJcbiAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KGNvbG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBzZW5kQWN0aXZlU2hhcGVMaWdodFRvKGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIsIGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgc2hhcGVMaWdodCA9IHRoaXMuZ2V0TmV4dFNoYXBlTGlnaHQoKTtcclxuICAgICAgICBzaGFwZUxpZ2h0Lm1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvcik7XHJcbiAgICAgICAgc2hhcGVMaWdodC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoY29sb3IpO1xyXG5cclxuICAgICAgICAvLyBEbyBub3QgbGlnaHQgaWYgaGlnaGVyIHRoYW4gdGhlIGhpZ2hlc3QgKnZpc2libGUqIGZsb29yLlxyXG4gICAgICAgIGlmIChmbG9vcklkeCA+PSBGTE9PUl9DT1VOVCkge1xyXG4gICAgICAgICAgICBzaGFwZUxpZ2h0LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzaGFwZUxpZ2h0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHggPSBwYW5lbElkeDtcclxuICAgICAgICBsZXQgeSA9IGZsb29ySWR4ICsgMTsgLy8gT2Zmc2V0IHVwIDEgYmVjYXVzZSBncm91bmQgaXMgeSA9IDAuXHJcbiAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgIHNoYXBlTGlnaHQucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFjdGl2ZVNoYXBlTGlnaHRQb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oaWdobGlnaHRlci5wb3NpdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBzZW5kSGlnaGxpZ2h0ZXJUbyhmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyLCBjb2xvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gRG8gbm90IGxpZ2h0IGlmIGhpZ2hlciB0aGFuIHRoZSBoaWdoZXN0ICp2aXNpYmxlKiBmbG9vci5cclxuICAgICAgICBpZiAoZmxvb3JJZHggPj0gRkxPT1JfQ09VTlQpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlci52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlci52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlci5jb2xvci5zZXRIZXgoY29sb3IpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHggPSBwYW5lbElkeDtcclxuICAgICAgICBsZXQgeSA9IGZsb29ySWR4ICsgMTsgLy8gT2Zmc2V0IHVwIDEgYmVjYXVzZSBncm91bmQgaXMgeSA9IDAuXHJcbiAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUhwKGhwOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmhwUGFuZWxzLnVwZGF0ZUhwKGhwKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydFJvd0NsZWFyaW5nQW5pbWF0aW9uKGZsb29ySWR4czogbnVtYmVyW10sIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgbGV0IGN1cnRhaW5EaXJlY3Rpb246IEN1cnRhaW5EaXJlY3Rpb247XHJcbiAgICAgICAgaWYgKHRoaXMucm93Q2xlYXJEaXJlY3Rpb24gPT09IFJvd0NsZWFyRGlyZWN0aW9uLkxlZnRUb1JpZ2h0KSB7XHJcbiAgICAgICAgICAgIGN1cnRhaW5EaXJlY3Rpb24gPSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5MZWZ0VG9SaWdodDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJ0YWluRGlyZWN0aW9uID0gQ3VydGFpbkRpcmVjdGlvbi5PcGVuUmlnaHRUb0xlZnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJvd0NsZWFyQ3VydGFpbi5zdGFydEFuaW1hdGlvbihmbG9vcklkeHMsIGN1cnRhaW5EaXJlY3Rpb24sIGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydEp1bmtSb3dDdXJ0YWluQW5pbWF0aW9uKGZsb29yQ291bnQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChmbG9vckNvdW50ID4gNCkge1xyXG4gICAgICAgICAgICBmbG9vckNvdW50ID0gNDtcclxuICAgICAgICB9IGVsc2UgaWYgKGZsb29yQ291bnQgPCAwKSB7XHJcbiAgICAgICAgICAgIGZsb29yQ291bnQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZmxvb3JJZHhzID0gWzAsIDEsIDIsIDNdLnNsaWNlKDAsIGZsb29yQ291bnQpO1xyXG5cclxuICAgICAgICBsZXQgY3VydGFpbkRpcmVjdGlvbjogQ3VydGFpbkRpcmVjdGlvbjtcclxuICAgICAgICBpZiAodGhpcy5yb3dDbGVhckRpcmVjdGlvbiA9PT0gUm93Q2xlYXJEaXJlY3Rpb24uTGVmdFRvUmlnaHQpIHtcclxuICAgICAgICAgICAgY3VydGFpbkRpcmVjdGlvbiA9IEN1cnRhaW5EaXJlY3Rpb24uQ2xvc2VSaWdodFRvTGVmdDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJ0YWluRGlyZWN0aW9uID0gQ3VydGFpbkRpcmVjdGlvbi5DbG9zZUxlZnRUb1JpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q3VydGFpbi5zdGFydEFuaW1hdGlvbihmbG9vcklkeHMsIGN1cnRhaW5EaXJlY3Rpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGVTaGFwZUxpZ2h0c0FuZEhpZ2hsaWdodGVyKCkge1xyXG4gICAgICAgIGZvciAobGV0IHNoYXBlTGlnaHQgb2YgdGhpcy5zaGFwZUxpZ2h0cykge1xyXG4gICAgICAgICAgICBzaGFwZUxpZ2h0LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRlci52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXROZXh0U2hhcGVMaWdodCgpIHtcclxuICAgICAgICBsZXQgc2hhcGVMaWdodCA9IHRoaXMuc2hhcGVMaWdodHNbdGhpcy5jdXJyZW50U2hhcGVMaWdodElkeF07XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGVMaWdodElkeCsrO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTaGFwZUxpZ2h0SWR4ID49IEFDVElWRV9TSEFQRV9MSUdIVF9DT1VOVCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZUxpZ2h0SWR4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNoYXBlTGlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwUHVsc2UoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucHVsc2VUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHVsc2VUd2VlbkVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy5wdWxzZVR3ZWVuLnVwZGF0ZSh0aGlzLnB1bHNlVHdlZW5FbGFwc2VkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgZmxvb3Igb2YgdGhpcy5wYW5lbHMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFuZWwgb2YgZmxvb3IpIHtcclxuICAgICAgICAgICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlSW50ZW5zaXR5ID0gdGhpcy5lbWlzc2l2ZUludGVuc2l0eS52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtDZWxsQ2hhbmdlRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2NlbGwtY2hhbmdlLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge0hwQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ocC1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtSb3dzRmlsbGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3Jvd3MtZmlsbGVkLWV2ZW50JztcclxuaW1wb3J0IHtSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvcm93cy1jbGVhci1hbmltYXRpb24tY29tcGxldGVkLWV2ZW50JztcclxuaW1wb3J0IHtGYWxsaW5nU2VxdWVuY2VyRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2ZhbGxpbmctc2VxdWVuY2VyLWV2ZW50JztcclxuaW1wb3J0IHtMaWdodGluZ0dyaWQsIEZMT09SX0NPVU5UfSBmcm9tICcuL2xpZ2h0aW5nLWdyaWQnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5pbXBvcnQge0NlbGxPZmZzZXR9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN3aXRjaGJvYXJkIHtcclxuXHJcbiAgICBwcml2YXRlIGxpZ2h0aW5nR3JpZDogTGlnaHRpbmdHcmlkO1xyXG4gICAgcHJpdmF0ZSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGxpZ2h0aW5nR3JpZDogTGlnaHRpbmdHcmlkLCBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQgPSBsaWdodGluZ0dyaWQ7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQ2VsbENoYW5nZUV2ZW50VHlwZSwgKGV2ZW50OiBDZWxsQ2hhbmdlRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PT0gZXZlbnQucGxheWVyVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVDZWxsQ2hhbmdlRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5Sb3dzRmlsbGVkRXZlbnRUeXBlLCAoZXZlbnQ6IFJvd3NGaWxsZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVSb3dDbGVhcmluZyhldmVudC5maWxsZWRSb3dJZHhzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZUp1bmtSb3dBZGRpbmcoZXZlbnQuZmlsbGVkUm93SWR4cy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5IcENoYW5nZWRFdmVudFR5cGUsIChldmVudDogSHBDaGFuZ2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PT0gZXZlbnQucGxheWVyVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVIcENoYW5nZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkZhbGxpbmdTZXF1ZW5jZXJFdmVudFR5cGUsIChldmVudDogRmFsbGluZ1NlcXVlbmNlckV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRmFsbGluZ1NlcXVlbmNlckV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KGV2ZW50OiBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBmbG9vcklkeCA9IHRoaXMuY29udmVydFJvd1RvRmxvb3IoZXZlbnQuc2hhcGUuZ2V0Um93KCkpO1xyXG4gICAgICAgIGxldCBwYW5lbElkeCA9IGV2ZW50LnNoYXBlLmdldENvbCgpO1xyXG4gICAgICAgIGxldCBjb2xvciA9IHRoaXMuY29udmVydENvbG9yKGV2ZW50LnNoYXBlLmNvbG9yKTtcclxuXHJcbiAgICAgICAgbGV0IHlUb3RhbE9mZnNldCA9IDA7XHJcbiAgICAgICAgbGV0IHhUb3RhbE9mZnNldCA9IDA7XHJcbiAgICAgICAgbGV0IG9mZnNldHMgPSBldmVudC5zaGFwZS5nZXRPZmZzZXRzKCk7XHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIG9mZnNldHMpIHtcclxuICAgICAgICAgICAgbGV0IG9mZnNldEZsb29ySWR4ID0gZmxvb3JJZHggLSBvZmZzZXQueTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldFBhbmVsSWR4ID0gcGFuZWxJZHggKyBvZmZzZXQueDtcclxuICAgICAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc2VuZEFjdGl2ZVNoYXBlTGlnaHRUbyhvZmZzZXRGbG9vcklkeCwgb2Zmc2V0UGFuZWxJZHgsIGNvbG9yKTtcclxuXHJcbiAgICAgICAgICAgIHlUb3RhbE9mZnNldCArPSBvZmZzZXQueTtcclxuICAgICAgICAgICAgeFRvdGFsT2Zmc2V0ICs9IG9mZnNldC54O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHlvZmYgPSAoeVRvdGFsT2Zmc2V0IC8gb2Zmc2V0cy5sZW5ndGgpIC0gMjtcclxuICAgICAgICBsZXQgeG9mZiA9IHhUb3RhbE9mZnNldCAvIG9mZnNldHMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnNlbmRIaWdobGlnaHRlclRvKGZsb29ySWR4ICsgeW9mZiwgcGFuZWxJZHggKyB4b2ZmLCBjb2xvcik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgbGV0IGFjdGl2ZVNoYXBlTGlnaHRQb3NpdGlvbiA9IHRoaXMubGlnaHRpbmdHcmlkLmdldEFjdGl2ZVNoYXBlTGlnaHRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBIYXZlIHRoZSBjYW1lcmEgbG9vayBhdCB0aGlzP1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNlbGxDaGFuZ2VFdmVudChldmVudDogQ2VsbENoYW5nZUV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGZsb29ySWR4ID0gdGhpcy5jb252ZXJ0Um93VG9GbG9vcihldmVudC5yb3cpO1xyXG4gICAgICAgIGlmIChmbG9vcklkeCA+PSBGTE9PUl9DT1VOVCkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIFNraXAgb2JzdHJ1Y3RlZCBmbG9vcnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwYW5lbElkeCA9IGV2ZW50LmNvbDtcclxuICAgICAgICBpZiAoZXZlbnQuY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zd2l0Y2hSb29tT2ZmKGZsb29ySWR4LCBwYW5lbElkeCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IGNvbG9yID0gdGhpcy5jb252ZXJ0Q29sb3IoZXZlbnQuY2VsbC5nZXRDb2xvcigpKTtcclxuICAgICAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc3dpdGNoUm9vbU9uKGZsb29ySWR4LCBwYW5lbElkeCwgY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFuaW1hdGVSb3dDbGVhcmluZyhmaWxsZWRSb3dJZHhzOiBudW1iZXJbXSkge1xyXG4gICAgICAgIGxldCBmbG9vcklkeHM6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZmlsbGVkUm93SWR4IG9mIGZpbGxlZFJvd0lkeHMpIHtcclxuICAgICAgICAgICAgbGV0IGZsb29ySWR4ID0gdGhpcy5jb252ZXJ0Um93VG9GbG9vcihmaWxsZWRSb3dJZHgpO1xyXG4gICAgICAgICAgICBmbG9vcklkeHMucHVzaChmbG9vcklkeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zdGFydFJvd0NsZWFyaW5nQW5pbWF0aW9uKGZsb29ySWR4cywgKCkgPT4ge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudCh0aGlzLnBsYXllclR5cGUpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbWVtYmVyIHRoYXQgdGhlIGp1bmsgcm93cyBoYXZlIGFscmVhZHkgYmVlbiBhZGRlZCBvbiB0aGUgYm9hcmQuXHJcbiAgICAgKiBcclxuICAgICAqIERvIG5vdCBuZWVkIHRvIGZpcmUgYW4gZXZlbnQgYXQgdGhlIGVuZCBvZiB0aGlzIGFuaW1hdGlvbiBiZWNhdXNlIHRoZSBib2FyZFxyXG4gICAgICogZG9lcyBub3QgbmVlZCB0byBsaXN0ZW4gZm9yIGl0IChpdCBsaXN0ZW5zIGZvciB0aGUgY2xlYXJpbmcgYW5pbWF0aW9uIGluc3RlYWQpLlxyXG4gICAgKi9cclxuICAgIHByaXZhdGUgYW5pbWF0ZUp1bmtSb3dBZGRpbmcoanVua1Jvd0NvdW50OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zdGFydEp1bmtSb3dDdXJ0YWluQW5pbWF0aW9uKGp1bmtSb3dDb3VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVIcENoYW5nZWRFdmVudChldmVudDogSHBDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC51cGRhdGVIcChldmVudC5ocCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVGYWxsaW5nU2VxdWVuY2VyRXZlbnQoZXZlbnQ6IEZhbGxpbmdTZXF1ZW5jZXJFdmVudCl7XHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuaGlkZVNoYXBlTGlnaHRzQW5kSGlnaGxpZ2h0ZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgY2VsbCByb3cvY29sIGNvb3JkaW5hdGVzIHRvIGZsb29yL3BhbmVsIGNvb3JkaW5hdGVzLlxyXG4gICAgICogQWNjb3VudCBmb3IgdGhlIHR3byBmbG9vcnMgdGhhdCBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuICg/KVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbnZlcnRSb3dUb0Zsb29yKHJvdzogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHRoaW5nID0gKEZMT09SX0NPVU5UIC0gcm93KSArIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29udmVydENvbG9yKGNvbG9yOiBDb2xvcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBudW1iZXI7XHJcbiAgICAgICAgc3dpdGNoIChjb2xvcikge1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkN5YW46XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4MzNjY2NjO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuWWVsbG93OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGZmZmY1NTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLlB1cnBsZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhhMDIwYTA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5HcmVlbjpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgyMGEwMjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5SZWQ6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmYzMzMzO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuQmx1ZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHg0NDQ0Y2M7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5PcmFuZ2U6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZWVkNTMwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuV2hpdGU6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vIERlZmF1bHQgb3IgbWlzc2luZyBjYXNlIGlzIGJsYWNrLlxyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkVtcHR5OlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDAwMDAwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG4vLyBEaW1lbnNpb25zIG9mIHRoZSBlbnRpcmUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVTSEVFVF9XSURUSCAgID0gMjU2O1xyXG5leHBvcnQgY29uc3QgU1BSSVRFU0hFRVRfSEVJR0hUICA9IDUxMjtcclxuXHJcbi8vIERpbWVuc2lvbnMgb2Ygb25lIGZyYW1lIHdpdGhpbiB0aGUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9XSURUSCAgID0gNDg7XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9IRUlHSFQgID0gNzI7XHJcblxyXG5jb25zdCBUT1RBTF9ESUZGRVJFTlRfVEVYVFVSRVMgPSAzO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlciB7XHJcblxyXG4gICAgcmVhZG9ubHkgdGV4dHVyZTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRleHR1cmU6IGFueSkge1xyXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZSB7XHJcblxyXG4gICAgcHJpdmF0ZSB0ZXh0dXJlczogYW55W107XHJcbiAgICBwcml2YXRlIGxvYWRlZENvdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRUZXh0dXJlSWR4OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMubG9hZGVkQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoY2FsbGJhY2s6ICgpID0+IGFueSkge1xyXG4gICAgICAgIGxldCB0ZXh0dXJlTG9hZGVkSGFuZGxlciA9ICh0ZXh0dXJlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgLy8gSGF2ZSBpdCBzaG93IG9ubHkgb25lIGZyYW1lIGF0IGEgdGltZTpcclxuICAgICAgICAgICAgdGV4dHVyZS5yZXBlYXQuc2V0KFxyXG4gICAgICAgICAgICAgICAgRlJBTUVfV0lEVEggIC8gU1BSSVRFU0hFRVRfV0lEVEgsXHJcbiAgICAgICAgICAgICAgICBGUkFNRV9IRUlHSFQgLyBTUFJJVEVTSEVFVF9IRUlHSFRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlcy5wdXNoKHRleHR1cmUpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRlZENvdW50Kys7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxvYWRlZENvdW50ID49IFRPVEFMX0RJRkZFUkVOVF9URVhUVVJFUykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRleHR1cmVMb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgICAgIHRleHR1cmVMb2FkZXIubG9hZCgnZmFsbC1zdHVkZW50LnBuZycsIHRleHR1cmVMb2FkZWRIYW5kbGVyKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudDIucG5nJywgdGV4dHVyZUxvYWRlZEhhbmRsZXIpO1xyXG4gICAgICAgIHRleHR1cmVMb2FkZXIubG9hZCgnZmFsbC1zdHVkZW50My5wbmcnLCB0ZXh0dXJlTG9hZGVkSGFuZGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgbmV3SW5zdGFuY2UoKTogU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyIHtcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5nZXROZXh0VGV4dHVyZUlkeCgpO1xyXG4gICAgICAgIGxldCB0ZXh0dXJlID0gdGhpcy50ZXh0dXJlc1tpZHhdLmNsb25lKCk7IC8vIENsb25pbmcgdGV4dHVyZXMgaW4gdGhlIHZlcnNpb24gb2YgVGhyZWVKUyB0aGF0IEkgYW0gY3VycmVudGx5IHVzaW5nIHdpbGwgZHVwbGljYXRlIHRoZW0gOihcclxuICAgICAgICByZXR1cm4gbmV3IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcih0ZXh0dXJlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRUZXh0dXJlSWR4KCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHgrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50VGV4dHVyZUlkeCA+PSBUT1RBTF9ESUZGRVJFTlRfVEVYVFVSRVMpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGV4dHVyZUlkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRUZXh0dXJlSWR4O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UgPSBuZXcgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtTdGFuZGVlfSBmcm9tICcuL3N0YW5kZWUnO1xyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY01vdmVtZW50Q2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudCc7XHJcblxyXG5jb25zdCBZX09GRlNFVCA9IDAuNzU7IC8vIFNldHMgdGhlaXIgZmVldCBvbiB0aGUgZ3JvdW5kIHBsYW5lLlxyXG5cclxuY2xhc3MgU3RhbmRlZU1hbmFnZXIge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFuZGVlczogTWFwPG51bWJlciwgU3RhbmRlZT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YW5kZWVzID0gbmV3IE1hcDxudW1iZXIsIFN0YW5kZWU+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXRZKFlfT0ZGU0VUKTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY1BsYWNlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNQbGFjZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY1BsYWNlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RhbmRlZXMuZm9yRWFjaCgoc3RhbmRlZTogU3RhbmRlZSkgPT4ge1xyXG4gICAgICAgICAgICBzdGFuZGVlLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOcGNQbGFjZWRFdmVudChldmVudDogTnBjUGxhY2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IG5ldyBTdGFuZGVlKGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBzdGFuZGVlLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQoc3RhbmRlZS5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5zdGFuZGVlcy5zZXQoc3RhbmRlZS5ucGNJZCwgc3RhbmRlZSk7XHJcblxyXG4gICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Jbml0aWFsUG9zaXRpb24oc3RhbmRlZSwgeCwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtb3ZlVG9Jbml0aWFsUG9zaXRpb24oc3RhbmRlZTogU3RhbmRlZSwgeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICAvLyBUT0RPOiBVc2UgZXZlbnQueCwgZXZlbnQueSB3aXRoIHNjYWxpbmcgdG8gZGV0ZXJtaW5lIGRlc3RpbmF0aW9uXHJcbiAgICAgICAgc3RhbmRlZS5tb3ZlVG8oeCx6KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBzdGFuZGVlID0gdGhpcy5zdGFuZGVlcy5nZXQoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIGlmIChzdGFuZGVlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgICAgIHN0YW5kZWUud2Fsa1RvKHgsIHosIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc3RhbmRlZU1hbmFnZXIgPSBuZXcgU3RhbmRlZU1hbmFnZXIoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5kZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgU1BSSVRFU0hFRVRfV0lEVEgsXHJcbiAgICBTUFJJVEVTSEVFVF9IRUlHSFQsXHJcbiAgICBGUkFNRV9XSURUSCxcclxuICAgIEZSQU1FX0hFSUdIVCxcclxuICAgIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcixcclxuICAgIHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZX1cclxuZnJvbSAnLi9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UnO1xyXG5cclxuY29uc3QgU1RBTkRBUkRfREVMQVkgPSAyMjU7XHJcbmNvbnN0IFdBTEtfVVBfT1JfRE9XTl9ERUxBWSA9IE1hdGguZmxvb3IoU1RBTkRBUkRfREVMQVkgKiAoMi8zKSk7IC8vIEJlY2F1c2UgdXAvZG93biB3YWxrIGN5Y2xlcyBoYXZlIG1vcmUgZnJhbWVzLiBcclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb25GcmFtZSB7XHJcblxyXG4gICAgcmVhZG9ubHkgcm93OiBudW1iZXI7XHJcbiAgICByZWFkb25seSBjb2w6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb3c6IG51bWJlciwgY29sOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdzsgXHJcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBlbnVtIFN0YW5kZWVBbmltYXRpb25UeXBlIHtcclxuICAgIFN0YW5kVXAsXHJcbiAgICBTdGFuZERvd24sXHJcbiAgICBTdGFuZExlZnQsXHJcbiAgICBTdGFuZFJpZ2h0LFxyXG4gICAgV2Fsa1VwLFxyXG4gICAgV2Fsa0Rvd24sXHJcbiAgICBXYWxrTGVmdCxcclxuICAgIFdhbGtSaWdodCxcclxuICAgIENoZWVyVXAsXHJcbiAgICBQYW5pY1VwLFxyXG4gICAgUGFuaWNEb3duXHJcbn1cclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgXHJcbiAgICByZWFkb25seSB0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZTtcclxuICAgIHJlYWRvbmx5IG5leHQ6IFN0YW5kZWVBbmltYXRpb25UeXBlOyAvLyBQcm9iYWJseSBub3QgZ29pbmcgdG8gYmUgdXNlZCBmb3IgdGhpcyBnYW1lXHJcblxyXG4gICAgcmVhZG9ubHkgZnJhbWVzOiBTdGFuZGVlQW5pbWF0aW9uRnJhbWVbXTtcclxuICAgIHJlYWRvbmx5IGRlbGF5czogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIGN1cnJlbnRGcmFtZUlkeDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50RnJhbWVUaW1lRWxhcHNlZDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgZmluaXNoZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IodHlwZTogU3RhbmRlZUFuaW1hdGlvblR5cGUsIG5leHQ/OiBTdGFuZGVlQW5pbWF0aW9uVHlwZSkge1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgaWYgKG5leHQpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0ID0gbmV4dDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5leHQgPSB0eXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlbGF5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZyYW1lSWR4ID0gMDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1c2goZnJhbWU6IFN0YW5kZWVBbmltYXRpb25GcmFtZSwgZGVsYXkgPSBTVEFOREFSRF9ERUxBWSkge1xyXG4gICAgICAgIHRoaXMuZnJhbWVzLnB1c2goZnJhbWUpO1xyXG4gICAgICAgIHRoaXMuZGVsYXlzLnB1c2goZGVsYXkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID49IHRoaXMuZGVsYXlzW3RoaXMuY3VycmVudEZyYW1lSWR4XSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHgrKztcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEZyYW1lSWR4ID49IHRoaXMuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHggPSAwOyAvLyBTaG91bGRuJ3QgYmUgdXNlZCBhbnltb3JlLCBidXQgcHJldmVudCBvdXQtb2YtYm91bmRzIGFueXdheS5cclxuICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzRmluaXNoZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudEZyYW1lKCk6IFN0YW5kZWVBbmltYXRpb25GcmFtZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJhbWVzW3RoaXMuY3VycmVudEZyYW1lSWR4XTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVTcHJpdGVXcmFwcGVyIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuICAgIHByaXZhdGUgc3ByaXRlOiBhbnk7XHJcbiAgICBwcml2YXRlIHRleHR1cmVXcmFwcGVyOiBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50QW5pbWF0aW9uOiBTdGFuZGVlQW5pbWF0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUaHJlZUpTIG9iamVjdHM6IFxyXG4gICAgICAgIHRoaXMudGV4dHVyZVdyYXBwZXIgPSBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UubmV3SW5zdGFuY2UoKTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU3ByaXRlTWF0ZXJpYWwoe21hcDogdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlfSk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgVEhSRUUuU3ByaXRlKG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5zY2FsZS5zZXQoMSwgMS41KTsgLy8gQWRqdXN0IGFzcGVjdCByYXRpbyBmb3IgNDggeCA3MiBzaXplIGZyYW1lcy4gXHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5zcHJpdGUpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIGRlZmF1bHQgYW5pbWF0aW9uIHRvIHN0YW5kaW5nIGZhY2luZyBkb3duOlxyXG4gICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kRG93bigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vIFRPRE86IFNldCB0aGlzIGVsc2V3aGVyZVxyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5hZGp1c3RMaWdodGluZyhlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLnN0ZXBBbmltYXRpb24oZWxhcHNlZCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogT25seSBzd2l0Y2hlcyBpZiB0aGUgZ2l2ZW4gYW5pbWF0aW9uIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBjdXJyZW50IG9uZS5cclxuICAgICAqL1xyXG4gICAgc3dpdGNoQW5pbWF0aW9uKHR5cGU6IFN0YW5kZWVBbmltYXRpb25UeXBlKSB7XHJcbiAgICAgICAgbGV0IGFuaW1hdGlvbiA9IGRldGVybWluZUFuaW1hdGlvbih0eXBlKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uLnR5cGUgIT09IGFuaW1hdGlvbi50eXBlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcclxuICAgICAgICB9IFxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRqdXN0TGlnaHRpbmcoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gVE9ETzogTm90IHlldCBzdXJlIGlmIEknbGwgbmVlZCB0byB1c2UgdGhlIGVsYXBzZWQgdmFyaWFibGUgaGVyZS5cclxuICAgICAgICB0aGlzLnNwcml0ZS5tYXRlcmlhbC5jb2xvci5zZXQoMHhhYWFhYWEpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcEFuaW1hdGlvbihlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFuaW1hdGlvbi5pc0ZpbmlzaGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gZGV0ZXJtaW5lQW5pbWF0aW9uKHRoaXMuY3VycmVudEFuaW1hdGlvbi5uZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZyYW1lID0gdGhpcy5jdXJyZW50QW5pbWF0aW9uLmdldEN1cnJlbnRGcmFtZSgpO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGZyYW1lIGNvb3JkaW5hdGVzIHRvIHRleHR1cmUgY29vcmRpbmF0ZXMgYW5kIHNldCB0aGUgY3VycmVudCBvbmVcclxuICAgICAgICBsZXQgeHBjdCA9IChmcmFtZS5jb2wgKiBGUkFNRV9XSURUSCkgLyBTUFJJVEVTSEVFVF9XSURUSDtcclxuICAgICAgICBsZXQgeXBjdCA9ICgoKFNQUklURVNIRUVUX0hFSUdIVCAvIEZSQU1FX0hFSUdIVCkgLSAxIC0gZnJhbWUucm93KSAqIEZSQU1FX0hFSUdIVCkgLyBTUFJJVEVTSEVFVF9IRUlHSFQ7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlLm9mZnNldC5zZXQoeHBjdCwgeXBjdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRldGVybWluZUFuaW1hdGlvbih0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZSk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbjogU3RhbmRlZUFuaW1hdGlvbjtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlU3RhbmRVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZERvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrRG93bjpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVXYWxrTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kUmlnaHQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtSaWdodCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLkNoZWVyVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZUNoZWVyVXAoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFVwXHJcbmxldCBzdGFuZFVwRnJhbWUxICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFVwRnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgVXBcclxubGV0IHdhbGtVcEZyYW1lMSAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgd2Fsa1VwRnJhbWUyICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMSk7XHJcbmxldCB3YWxrVXBGcmFtZTMgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAyKTtcclxubGV0IHdhbGtVcEZyYW1lNCAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDMpO1xyXG5sZXQgd2Fsa1VwRnJhbWU1ICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMyk7XHJcbmxldCB3YWxrVXBGcmFtZTYgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg1LCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXApO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUyLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUzLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU1LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU2LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gU3RhbmRpbmcgRG93blxyXG5sZXQgc3RhbmREb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZERvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHN0YW5kRG93bkZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIERvd25cclxubGV0IHdhbGtEb3duRnJhbWUxICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDApO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTIgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMSk7XHJcbmxldCB3YWxrRG93bkZyYW1lMyAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAyKTtcclxubGV0IHdhbGtEb3duRnJhbWU0ICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDMpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTUgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMyk7XHJcbmxldCB3YWxrRG93bkZyYW1lNiAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtEb3duKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTIsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lMywgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTUsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lNiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIExlZnRcclxubGV0IHN0YW5kTGVmdEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDEpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU3RhbmRMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kTGVmdCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZExlZnRGcmFtZTEpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gV2Fsa2luZyBMZWZ0XHJcbmxldCB3YWxrTGVmdEZyYW1lMSAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAxKTtcclxubGV0IHdhbGtMZWZ0RnJhbWUyICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDApO1xyXG5sZXQgd2Fsa0xlZnRGcmFtZTMgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMSk7XHJcbmxldCB3YWxrTGVmdEZyYW1lNCAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAyKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0KTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFJpZ2h0XHJcbmxldCBzdGFuZFJpZ2h0RnJhbWUxICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kUmlnaHQoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFJpZ2h0RnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgUmlnaHRcclxubGV0IHdhbGtSaWdodEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDQpO1xyXG5sZXQgd2Fsa1JpZ2h0RnJhbWUyICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgNCk7XHJcbmxldCB3YWxrUmlnaHRGcmFtZTMgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxubGV0IHdhbGtSaWdodEZyYW1lNCAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDQpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlV2Fsa1JpZ2h0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtSaWdodEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gQ2hlZXIgVXBcclxubGV0IGNoZWVyVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgY2hlZXJVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMCk7XHJcbmxldCBjaGVlclVwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAxKTtcclxubGV0IGNoZWVyVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDApO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2hlZXJVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5DaGVlclVwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goY2hlZXJVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgVXBcclxubGV0IHBhbmljVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgcGFuaWNVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMik7XHJcbmxldCBwYW5pY1VwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAwKTtcclxubGV0IHBhbmljVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDIpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGFuaWNVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgRG93blxyXG5sZXQgcGFuaWNEb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcbmxldCBwYW5pY0Rvd25GcmFtZTIgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAxKTtcclxubGV0IHBhbmljRG93bkZyYW1lMyAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDIpO1xyXG5sZXQgcGFuaWNEb3duRnJhbWU0ICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMSk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQYW5pY0Rvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNEb3duRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvc3RhbmRlZS1tb3ZlbWVudC1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7U3RhbmRlZVNwcml0ZVdyYXBwZXIsIFN0YW5kZWVBbmltYXRpb25UeXBlfSBmcm9tICcuL3N0YW5kZWUtc3ByaXRlLXdyYXBwZXInO1xyXG5pbXBvcnQge2NhbWVyYVdyYXBwZXJ9IGZyb20gJy4uL2NhbWVyYS13cmFwcGVyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlIHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICByZWFkb25seSBzcHJpdGVXcmFwcGVyOiBTdGFuZGVlU3ByaXRlV3JhcHBlcjtcclxuXHJcbiAgICBwcml2YXRlIHdhbGtUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgd2Fsa1R3ZWVuOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBmYWNpbmc6IGFueTsgLy8gRmFjZXMgaW4gdGhlIHZlY3RvciBvZiB3aGljaCB3YXkgdGhlIE5QQyBpcyB3YWxraW5nLCB3YXMgd2Fsa2luZyBiZWZvcmUgc3RvcHBpbmcsIG9yIHdhcyBzZXQgdG8uXHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlciA9IG5ldyBTdGFuZGVlU3ByaXRlV3JhcHBlcigpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuc3ByaXRlV3JhcHBlci5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmZhY2luZyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoLTIwMCwgMCwgLTIwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0ZXBXYWxrKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQ29ycmVjdEFuaW1hdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEltbWVkaWF0ZWx5IHNldCBzdGFuZGVlIG9uIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBtb3ZlVG8oeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCh4LCAwLCB6KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBzdGFuZGVlIGluIG1vdGlvbiB0b3dhcmRzIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICogU3BlZWQgZGltZW5zaW9uIGlzIDEgdW5pdC9zZWMuXHJcbiAgICAgKi9cclxuICAgIHdhbGtUbyh4OiBudW1iZXIsIHo6IG51bWJlciwgc3BlZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3cgbG9uZyBpdCB3b3VsZCB0YWtlLCBnaXZlbiB0aGUgc3BlZWQgcmVxdWVzdGVkLlxyXG4gICAgICAgIGxldCB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMyh4LCAwLCB6KS5zdWIodGhpcy5ncm91cC5wb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gdmVjdG9yLmxlbmd0aCgpO1xyXG4gICAgICAgIGxldCB0aW1lID0gKGRpc3RhbmNlIC8gc3BlZWQpICogMTAwMDtcclxuXHJcbiAgICAgICAgLy8gRGVsZWdhdGUgdG8gdHdlZW4uanMuIFBhc3MgaW4gY2xvc3VyZXMgYXMgY2FsbGJhY2tzIGJlY2F1c2Ugb3RoZXJ3aXNlICd0aGlzJyB3aWxsIHJlZmVyXHJcbiAgICAgICAgLy8gdG8gdGhlIHBvc2l0aW9uIG9iamVjdCwgd2hlbiBleGVjdXRpbmcgc3RvcFdhbGsoKS5cclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZ3JvdXAucG9zaXRpb24pXHJcbiAgICAgICAgICAgIC50byh7eDogeCwgejogen0sIHRpbWUpXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IHsgdGhpcy5zdG9wV2FsaygpOyB9KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy53YWxrVHdlZW5FbGFwc2VkKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBVcGRhdGUgZGlyZWN0aW9uIHRoaXMgc3RhbmRlZSB3aWxsIGJlIGZhY2luZyB3aGVuIHdhbGtpbmcuXHJcbiAgICAgICAgdGhpcy5mYWNpbmcuc2V0WCh4IC0gdGhpcy5ncm91cC5wb3NpdGlvbi54KTtcclxuICAgICAgICB0aGlzLmZhY2luZy5zZXRaKHogLSB0aGlzLmdyb3VwLnBvc2l0aW9uLnopO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcFdhbGsoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2Fsa1R3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMud2Fsa1R3ZWVuLnVwZGF0ZSh0aGlzLndhbGtUd2VlbkVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0b3BXYWxrKCkge1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoXHJcbiAgICAgICAgICAgIHRoaXMubnBjSWQsXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi56KVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbnN1cmVDb3JyZWN0QW5pbWF0aW9uKCkge1xyXG4gICAgICAgIC8vIGxldCB0YXJnZXQgPSB0aGlzLmdyb3VwLnBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgLy8gdGFyZ2V0LnNldFkodGFyZ2V0LnkgKyAwLjUpO1xyXG4gICAgICAgIC8vIGNhbWVyYVdyYXBwZXIuY2FtZXJhLmxvb2tBdCh0YXJnZXQpO1xyXG5cclxuICAgICAgICAvLyBBbmdsZSBiZXR3ZWVuIHR3byB2ZWN0b3JzOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTQ4NDIyOFxyXG4gICAgICAgIGxldCB3b3JsZERpcmVjdGlvbiA9IGNhbWVyYVdyYXBwZXIuY2FtZXJhLmdldFdvcmxkRGlyZWN0aW9uKCk7XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0aGlzLmZhY2luZy56LCB0aGlzLmZhY2luZy54KSAtIE1hdGguYXRhbjIod29ybGREaXJlY3Rpb24ueiwgd29ybGREaXJlY3Rpb24ueCk7XHJcbiAgICAgICAgaWYgKGFuZ2xlIDwgMCkgYW5nbGUgKz0gMiAqIE1hdGguUEk7XHJcbiAgICAgICAgYW5nbGUgKj0gKDE4MC9NYXRoLlBJKTsgLy8gSXQncyBteSBwYXJ0eSBhbmQgSSdsbCB1c2UgZGVncmVlcyBpZiBJIHdhbnQgdG8uXHJcblxyXG4gICAgICAgIGlmICh0aGlzLndhbGtUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmdsZSA8IDYwIHx8IGFuZ2xlID49IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDYwICYmIGFuZ2xlIDwgMTIwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gMTIwICYmIGFuZ2xlIDwgMjQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSAyNDAgJiYgYW5nbGUgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0xlZnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGFuZ2xlIDwgNjAgfHwgYW5nbGUgPj0gMzAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kVXApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDYwICYmIGFuZ2xlIDwgMTIwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDEyMCAmJiBhbmdsZSA8IDI0MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZERvd24pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDI0MCAmJiBhbmdsZSA8IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtjYW1lcmFXcmFwcGVyfSBmcm9tICcuL2NhbWVyYS13cmFwcGVyJztcclxuaW1wb3J0IHtza3l9IGZyb20gJy4vd29ybGQvc2t5JztcclxuaW1wb3J0IHtncm91bmR9IGZyb20gJy4vd29ybGQvZ3JvdW5kJztcclxuaW1wb3J0IHtMaWdodGluZ0dyaWR9IGZyb20gJy4vbGlnaHRpbmcvbGlnaHRpbmctZ3JpZCc7XHJcbmltcG9ydCB7U3dpdGNoYm9hcmR9IGZyb20gJy4vbGlnaHRpbmcvc3dpdGNoYm9hcmQnO1xyXG5pbXBvcnQge3N0YW5kZWVNYW5hZ2VyfSBmcm9tICcuL3N0YW5kZWUvc3RhbmRlZS1tYW5hZ2VyJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge0hwT3JpZW50YXRpb259IGZyb20gJy4uL2RvbWFpbi9ocC1vcmllbnRhdGlvbic7XHJcbmltcG9ydCB7Um93Q2xlYXJEaXJlY3Rpb259IGZyb20gJy4uL2RvbWFpbi9yb3ctY2xlYXItZGlyZWN0aW9uJztcclxuXHJcbmNsYXNzIFZpZXcge1xyXG5cclxuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuXHJcbiAgICBwcml2YXRlIHNreVNjZW5lOiBhbnk7XHJcbiAgICBwcml2YXRlIGxlZnRTY2VuZTogYW55O1xyXG4gICAgcHJpdmF0ZSByaWdodFNjZW5lOiBhbnk7XHJcbiAgICBwcml2YXRlIGdyb3VuZFNjZW5lOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogYW55O1xyXG5cclxuICAgIHByaXZhdGUgaHVtYW5HcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIGh1bWFuU3dpdGNoYm9hcmQ6IFN3aXRjaGJvYXJkO1xyXG4gICAgcHJpdmF0ZSBhaUdyaWQ6IExpZ2h0aW5nR3JpZDtcclxuICAgIHByaXZhdGUgYWlTd2l0Y2hib2FyZDogU3dpdGNoYm9hcmQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcclxuXHJcbiAgICAgICAgdGhpcy5za3lTY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gICAgICAgIHRoaXMubGVmdFNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgICAgICAgdGhpcy5yaWdodFNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgICAgICAgdGhpcy5ncm91bmRTY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FudGlhbGlhczogdHJ1ZSwgY2FudmFzOiB0aGlzLmNhbnZhc30pO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuYXV0b0NsZWFyID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaHVtYW5HcmlkID0gbmV3IExpZ2h0aW5nR3JpZChIcE9yaWVudGF0aW9uLkRlY3JlYXNlc1JpZ2h0VG9MZWZ0LCBSb3dDbGVhckRpcmVjdGlvbi5SaWdodFRvTGVmdCk7XHJcbiAgICAgICAgdGhpcy5odW1hblN3aXRjaGJvYXJkID0gbmV3IFN3aXRjaGJvYXJkKHRoaXMuaHVtYW5HcmlkLCBQbGF5ZXJUeXBlLkh1bWFuKTtcclxuICAgICAgICB0aGlzLmFpR3JpZCA9IG5ldyBMaWdodGluZ0dyaWQoSHBPcmllbnRhdGlvbi5EZWNyZWFzZXNMZWZ0VG9SaWdodCwgUm93Q2xlYXJEaXJlY3Rpb24uTGVmdFRvUmlnaHQpO1xyXG4gICAgICAgIHRoaXMuYWlTd2l0Y2hib2FyZCA9IG5ldyBTd2l0Y2hib2FyZCh0aGlzLmFpR3JpZCwgUGxheWVyVHlwZS5BaSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5odW1hbkdyaWQuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmFpR3JpZC5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuYWlTd2l0Y2hib2FyZC5zdGFydCgpO1xyXG5cclxuICAgICAgICB0aGlzLmRvU3RhcnQoKTtcclxuXHJcbiAgICAgICAgc2t5LnN0YXJ0KCk7XHJcbiAgICAgICAgZ3JvdW5kLnN0YXJ0KCk7XHJcbiAgICAgICAgc3RhbmRlZU1hbmFnZXIuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGNhbnZhcyBzaG91bGQgaGF2ZSBiZWVuIGhpZGRlbiB1bnRpbCBzZXR1cCBpcyBjb21wbGV0ZS5cclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBza3kuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBncm91bmQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5odW1hblN3aXRjaGJvYXJkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5odW1hbkdyaWQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5haUdyaWQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgc3RhbmRlZU1hbmFnZXIuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2t5U2NlbmUsIGNhbWVyYVdyYXBwZXIuY2FtZXJhKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmNsZWFyRGVwdGgoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLmxlZnRTY2VuZSwgY2FtZXJhV3JhcHBlci5jYW1lcmEpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuY2xlYXJEZXB0aCgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMucmlnaHRTY2VuZSwgY2FtZXJhV3JhcHBlci5jYW1lcmEpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuY2xlYXJEZXB0aCgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuZ3JvdW5kU2NlbmUsIGNhbWVyYVdyYXBwZXIuY2FtZXJhKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvU3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5za3lTY2VuZS5hZGQoc2t5Lmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91bmRTY2VuZS5hZGQoZ3JvdW5kLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmdyb3VuZFNjZW5lLmFkZChzdGFuZGVlTWFuYWdlci5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMubGVmdFNjZW5lLmFkZCh0aGlzLmh1bWFuR3JpZC5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMucmlnaHRTY2VuZS5hZGQodGhpcy5haUdyaWQuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLmdyb3VwLnBvc2l0aW9uLnNldFgoMTEpO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLmdyb3VwLnBvc2l0aW9uLnNldFooMSk7XHJcbiAgICAgICAgdGhpcy5haUdyaWQuZ3JvdXAucm90YXRpb24ueSA9IC1NYXRoLlBJIC8gNDtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogVGVtcG9yYXJ5IGZvciBkZWJ1Z2dpbmc/XHJcbiAgICAgICAgLy8gdGhpcy5zY2VuZS5hZGQobmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDQwNDA0MCkpO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBUZW1wb3Jhcnk/XHJcbiAgICAgICAgbGV0IHNwb3RMaWdodENvbG9yID0gMHg5OTk5ZWU7XHJcbiAgICAgICAgbGV0IGxlZnRTcG90TGlnaHQgPSBuZXcgVEhSRUUuU3BvdExpZ2h0KHNwb3RMaWdodENvbG9yKTtcclxuICAgICAgICBsZWZ0U3BvdExpZ2h0LnBvc2l0aW9uLnNldCgtMywgMC43NSwgMjApO1xyXG4gICAgICAgIGxlZnRTcG90TGlnaHQudGFyZ2V0ID0gdGhpcy5haUdyaWQuZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5sZWZ0U2NlbmUuYWRkKGxlZnRTcG90TGlnaHQpO1xyXG4gICAgICAgIGxldCByaWdodFNwb3RMaWdodCA9IG5ldyBUSFJFRS5TcG90TGlnaHQoc3BvdExpZ2h0Q29sb3IpO1xyXG4gICAgICAgIHJpZ2h0U3BvdExpZ2h0LnBvc2l0aW9uLnNldCgwLCAwLjc1LCAyMCk7XHJcbiAgICAgICAgcmlnaHRTcG90TGlnaHQudGFyZ2V0ID0gdGhpcy5haUdyaWQuZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5yaWdodFNjZW5lLmFkZChyaWdodFNwb3RMaWdodCk7XHJcblxyXG4gICAgICAgIGNhbWVyYVdyYXBwZXIuc2V0UG9zaXRpb24oLTMsIDAuNzUsIDE1KTsgLy8gTW9yZSBvciBsZXNzIGV5ZS1sZXZlbCB3aXRoIHRoZSBOUENzLlxyXG4gICAgICAgIGNhbWVyYVdyYXBwZXIubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDUsIDgsIDIpKTtcclxuXHJcbiAgICAgICAgY2FtZXJhV3JhcHBlci51cGRhdGVSZW5kZXJlclNpemUodGhpcy5yZW5kZXJlcik7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgY2FtZXJhV3JhcHBlci51cGRhdGVSZW5kZXJlclNpemUodGhpcy5yZW5kZXJlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHZpZXcgPSBuZXcgVmlldygpO1xyXG4iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBncmFzczogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMzAwLCAzMDApO1xyXG4gICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtlbWlzc2l2ZTogMHgwMjFkMDMsIGVtaXNzaXZlSW50ZW5zaXR5OiAxLjB9KTtcclxuICAgICAgICB0aGlzLmdyYXNzID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLmdyYXNzLnJvdGF0aW9uLnggPSAoTWF0aC5QSSAqIDMpIC8gMjtcclxuICAgICAgICB0aGlzLmdyYXNzLnBvc2l0aW9uLnNldCgwLCAwLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmdyYXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGdyb3VuZCA9IG5ldyBHcm91bmQoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jb25zdCBTVEFSVF9aX0FOR0xFID0gLShNYXRoLlBJIC8gMzApO1xyXG5jb25zdCBFTkRfWl9BTkdMRSAgID0gICBNYXRoLlBJIC8gMzA7XHJcbmNvbnN0IFJPVEFUSU9OX1NQRUVEID0gMC4wMDAxO1xyXG5cclxuY2xhc3MgU2t5IHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgZG9tZTogYW55O1xyXG4gICAgcHJpdmF0ZSByZHo6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSg1MCwgMzIsIDMyKTsgLy8gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDE1MCwgMTUwLCAxNTApO1xyXG4gICAgICAgIGxldCB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5nZW5lcmF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHttYXA6IHRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlfSk7XHJcbiAgICAgICAgdGhpcy5kb21lID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLmRvbWUubWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkJhY2tTaWRlO1xyXG4gICAgICAgIHRoaXMuZG9tZS5wb3NpdGlvbi5zZXQoMTAsIDEwLCAwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmRvbWUpO1xyXG5cclxuICAgICAgICB0aGlzLnJkeiA9IC1ST1RBVElPTl9TUEVFRDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmRvbWUucm90YXRpb24uc2V0KDAsIDAsIFNUQVJUX1pfQU5HTEUpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5kb21lLnJvdGF0aW9uLnNldCgwLCAwLCB0aGlzLmRvbWUucm90YXRpb24ueiArIHRoaXMucmR6KTtcclxuICAgICAgICBpZiAodGhpcy5kb21lLnJvdGF0aW9uLnogPj0gRU5EX1pfQU5HTEUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZHogPSAtUk9UQVRJT05fU1BFRUQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRvbWUucm90YXRpb24ueiA8PSBTVEFSVF9aX0FOR0xFKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmR6ID0gUk9UQVRJT05fU1BFRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZWQgb246IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE5OTkyNTA1XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2VuZXJhdGVUZXh0dXJlKCk6IGFueSB7XHJcbiAgICAgICAgbGV0IHNpemUgPSA1MTI7XHJcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHNpemU7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHNpemU7XHJcbiAgICAgICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIGN0eC5yZWN0KDAsIDAsIHNpemUsIHNpemUpO1xyXG4gICAgICAgIGxldCBncmFkaWVudCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCBzaXplKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC4wMCwgJyMwMDAwMDAnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC40MCwgJyMxMzFjNDUnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC43NSwgJyNmZjk1NDQnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC44NSwgJyMxMzFjNDUnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMS4wMCwgJyMxMzFjNDUnKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZ3JhZGllbnQ7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICByZXR1cm4gY2FudmFzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBza3kgPSBuZXcgU2t5KCk7Il19
