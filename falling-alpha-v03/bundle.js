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
},{"../domain/player-movement":5,"../event/event-bus":9,"../event/player-movement-event":13,"./input":2}],2:[function(require,module,exports){
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
    EventType[EventType["HpChangedEventType"] = 4] = "HpChangedEventType";
    EventType[EventType["NpcMovementChangedEventType"] = 5] = "NpcMovementChangedEventType";
    EventType[EventType["NpcPlacedEventType"] = 6] = "NpcPlacedEventType";
    EventType[EventType["NpcStateChagedEventType"] = 7] = "NpcStateChagedEventType";
    EventType[EventType["PlayerMovementEventType"] = 8] = "PlayerMovementEventType";
    EventType[EventType["RowsClearAnimationCompletedEventType"] = 9] = "RowsClearAnimationCompletedEventType";
    EventType[EventType["RowsFilledEventType"] = 10] = "RowsFilledEventType";
    EventType[EventType["StandeeMovementEndedEventType"] = 11] = "StandeeMovementEndedEventType";
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
},{"./event-bus":9}],11:[function(require,module,exports){
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
},{"./event-bus":9}],12:[function(require,module,exports){
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
},{"./event-bus":9}],13:[function(require,module,exports){
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
},{"./event-bus":9}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var RowsClearAnimationCompletedEvent = (function (_super) {
    __extends(RowsClearAnimationCompletedEvent, _super);
    function RowsClearAnimationCompletedEvent(filledRowIdxs, playerType) {
        _super.call(this);
        this.filledRowIdxs = filledRowIdxs.slice(0);
        this.playerType = playerType;
    }
    RowsClearAnimationCompletedEvent.prototype.getType = function () {
        return event_bus_1.EventType.RowsClearAnimationCompletedEventType;
    };
    return RowsClearAnimationCompletedEvent;
}(event_bus_1.AbstractEvent));
exports.RowsClearAnimationCompletedEvent = RowsClearAnimationCompletedEvent;
},{"./event-bus":9}],15:[function(require,module,exports){
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
},{"./event-bus":9}],16:[function(require,module,exports){
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
},{"./event-bus":9}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{"./controller/controller":1,"./game-state":17,"./model/model":23,"./preloader":26,"./view/view":37}],19:[function(require,module,exports){
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
},{"../../domain/constants":4}],20:[function(require,module,exports){
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
    Board.prototype.start = function () {
        this.clear();
        this.boardState = 1 /* InPlay */; // TODO: Move this elsewhere once defined.
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
        if (this.isBoardFull()) {
            this.signalFullBoard();
            this.resetBoard();
        }
        else {
            if (this.handleAnyFilledLinesPart1()) {
            }
            else {
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
    Board.prototype.signalFullBoard = function () {
        this.eventBus.fire(new board_filled_event_1.BoardFilledEvent(this.playerType));
    };
    /**
     * Handle filled lines method 1 of 2, before animation.
     */
    Board.prototype.handleAnyFilledLinesPart1 = function () {
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
    Board.prototype.handleAnyFilledLinesPart2 = function (filledRowIdxs) {
        // Remove the rows
        var totalFilled = filledRowIdxs.length;
        for (var idx = 0; idx < filledRowIdxs.length; idx++) {
            this.removeAndCollapse(filledRowIdxs[idx]);
        }
        // Notify all cells
        // TODO: Break out into own method?
        for (var rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                this.eventBus.fire(new cell_change_event_1.CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
            }
        }
        // Animation was finished and board was updated, so resume play.
        this.boardState = 1 /* InPlay */;
        this.startShape(false);
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
},{"../../domain/cell":3,"../../domain/constants":4,"../../event/active-shape-changed-event":6,"../../event/board-filled-event":7,"../../event/cell-change-event":8,"../../event/event-bus":9,"../../event/rows-filled-event":15,"./shape-factory":21}],21:[function(require,module,exports){
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
},{"./shape":22}],22:[function(require,module,exports){
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
},{"../../domain/cell":3}],23:[function(require,module,exports){
"use strict";
var board_1 = require('./board/board');
var ai_1 = require('./ai/ai');
var npc_manager_1 = require('./npc/npc-manager');
var event_bus_1 = require('../event/event-bus');
var player_movement_1 = require('../domain/player-movement');
var constants_1 = require('../domain/constants');
var hp_changed_event_1 = require('../event/hp-changed-event');
var shape_factory_1 = require('./board/shape-factory');
var MAX_HP = constants_1.PANEL_COUNT_PER_FLOOR; // HP corresponds to the number of long windows on the second floor of the physical building.
var Model = (function () {
    function Model() {
        var humanShapeFactory = new shape_factory_1.ShapeFactory();
        this.humanBoard = new board_1.Board(0 /* Human */, humanShapeFactory, event_bus_1.eventBus);
        this.humanHitPoints = MAX_HP;
        var aiShapeFactory = new shape_factory_1.ShapeFactory();
        this.aiBoard = new board_1.Board(1 /* Ai */, aiShapeFactory, event_bus_1.eventBus);
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
        this.humanBoard.start();
        this.aiBoard.start();
        this.ai.start();
        npc_manager_1.npcManager.start();
        // TODO: Instead, start game when player hits a key first.
        this.humanBoard.resetBoard();
        this.aiBoard.resetBoard();
    };
    Model.prototype.step = function (elapsed) {
        this.humanBoard.step(elapsed);
        this.aiBoard.step(elapsed);
        this.stepBoards(elapsed);
        this.ai.step(elapsed);
        npc_manager_1.npcManager.step(elapsed);
    };
    Model.prototype.stepBoards = function (elapsed) {
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
                board.handleEndOfCurrentPieceTasks(); // Prevents any other keystrokes affecting the shape after it hits the bottom.
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
        board.handleAnyFilledLinesPart2(event.filledRowIdxs);
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
},{"../domain/constants":4,"../domain/player-movement":5,"../event/event-bus":9,"../event/hp-changed-event":10,"./ai/ai":19,"./board/board":20,"./board/shape-factory":21,"./npc/npc-manager":24}],24:[function(require,module,exports){
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
},{"../../event/event-bus":9,"./npc":25}],25:[function(require,module,exports){
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
},{"../../event/event-bus":9,"../../event/npc-movement-changed-event":11,"../../event/npc-placed-event":12}],26:[function(require,module,exports){
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
},{"./view/standee/standee-animation-texture-base":33}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
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
},{"../../domain/constants":4}],30:[function(require,module,exports){
"use strict";
var constants_1 = require('../../domain/constants');
var CURTAIN_WIDTH = constants_1.PANEL_COUNT_PER_FLOOR;
var CurtainVertexPosition = (function () {
    function CurtainVertexPosition() {
        this.x = 0;
        this.elapsed = 0;
    }
    return CurtainVertexPosition;
}());
/**
 * Some notes on vertices within the mesh without modifications:
 * Vertices 1 and 3 should have x = -CURTAIN_WIDTH / 2
 * Vertices 0 and 2 should have x =  CURTAIN_WIDTH / 2
 *
 * Example statements:
 * console.log('vertices 1 and 3 x: ' + this.curtain.geometry.vertices[1].x, this.curtain.geometry.vertices[3].x);
 * console.log('vertices 0 and 2 x: ' + this.curtain.geometry.vertices[0].x, this.curtain.geometry.vertices[2].x);
 * console.log('---');
 */
var JunkRowCurtain = (function () {
    function JunkRowCurtain(rowClearDirection) {
        this.group = new THREE.Object3D();
        this.rowClearDirection = rowClearDirection;
        var geometry = new THREE.PlaneGeometry(CURTAIN_WIDTH, 1);
        var material = new THREE.MeshPhongMaterial({ color: 0x101030 }); // Midnight Blue
        this.curtain = new THREE.Mesh(geometry, material);
        this.curtainVertexPosition = new CurtainVertexPosition();
        this.pullCurtainTween = null;
    }
    JunkRowCurtain.prototype.start = function () {
        this.group.add(this.curtain);
        // Transform group to fit against building.
        this.group.position.set(5.0, 4.75, -1.451);
        this.group.scale.set(0.7, 1.0, 1);
        this.curtain.visible = false;
    };
    JunkRowCurtain.prototype.step = function (elapsed) {
        if (this.pullCurtainTween != null) {
            this.curtainVertexPosition.elapsed += elapsed;
            this.pullCurtainTween.update(this.curtainVertexPosition.elapsed);
        }
    };
    JunkRowCurtain.prototype.startAnimation = function (rowCount) {
        var _this = this;
        // Prevent multiple animations at the same time.
        if (this.pullCurtainTween != null) {
            return;
        }
        this.dropCurtain(rowCount);
        var xend;
        if (this.rowClearDirection === 0 /* LeftToRight */) {
            this.curtainVertexPosition.x = -CURTAIN_WIDTH / 2;
            xend = CURTAIN_WIDTH / 2;
        }
        else {
            this.curtainVertexPosition.x = CURTAIN_WIDTH / 2;
            xend = -CURTAIN_WIDTH / 2;
        }
        this.curtainVertexPosition.elapsed = 0;
        this.pullCurtainTween = new TWEEN.Tween(this.curtainVertexPosition)
            .to({ x: xend }, 333)
            .easing(TWEEN.Easing.Quartic.InOut)
            .onUpdate(function () {
            var idx1, idx2;
            if (_this.rowClearDirection === 0 /* LeftToRight */) {
                idx1 = 0;
                idx2 = 2;
            }
            else {
                idx1 = 1;
                idx2 = 3;
            }
            _this.curtain.geometry.vertices[idx1].x = _this.curtainVertexPosition.x;
            _this.curtain.geometry.vertices[idx2].x = _this.curtainVertexPosition.x;
            _this.curtain.geometry.verticesNeedUpdate = true;
        })
            .onComplete(function () { _this.completeAnimation(); })
            .start(this.curtainVertexPosition.elapsed);
    };
    /**
     * Position and scale the curtain so that it covers X floors at the bottom.
     */
    JunkRowCurtain.prototype.dropCurtain = function (rowCount) {
        // See note at top about why these are where they are.
        this.curtain.geometry.vertices[0].x = -CURTAIN_WIDTH / 2;
        this.curtain.geometry.vertices[1].x = CURTAIN_WIDTH / 2;
        this.curtain.geometry.vertices[2].x = -CURTAIN_WIDTH / 2;
        this.curtain.geometry.vertices[3].x = CURTAIN_WIDTH / 2;
        this.curtain.geometry.verticesNeedUpdate = true;
        if (rowCount === 1) {
            this.curtain.position.set(0, 0, 0);
            this.curtain.scale.set(1, 1, 1);
        }
        else if (rowCount === 2) {
            this.curtain.position.set(0, 0.5, 0);
            this.curtain.scale.set(1, 2, 1);
        }
        else if (rowCount === 3) {
            this.curtain.position.set(0, 1, 0);
            this.curtain.scale.set(1, 3, 1);
        }
        else if (rowCount === 4) {
            this.curtain.position.set(0, 1.5, 0);
            this.curtain.scale.set(1, 4, 1);
        }
        this.curtain.visible = true;
    };
    JunkRowCurtain.prototype.completeAnimation = function () {
        this.curtain.visible = false;
        this.pullCurtainTween = null;
    };
    return JunkRowCurtain;
}());
exports.JunkRowCurtain = JunkRowCurtain;
},{"../../domain/constants":4}],31:[function(require,module,exports){
"use strict";
var building_1 = require('./building');
var junk_row_curtain_1 = require('./junk-row-curtain');
var hp_panels_1 = require('./hp-panels');
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
        this.junkRowCurtain = new junk_row_curtain_1.JunkRowCurtain(rowClearDirection);
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
        this.group.add(this.junkRowCurtain.group);
        this.group.add(this.hpPanels.group);
        this.group.add(this.panelGroup);
        this.building.start();
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
    LightingGrid.prototype.startJunkRowCurtainAnimation = function (rowCount) {
        this.junkRowCurtain.startAnimation(rowCount);
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
},{"../../domain/constants":4,"./building":28,"./hp-panels":29,"./junk-row-curtain":30}],32:[function(require,module,exports){
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
        // TODO: Do it
        setTimeout(function () {
            event_bus_1.eventBus.fire(new rows_clear_animation_completed_event_1.RowsClearAnimationCompletedEvent(filledRowIdxs, _this.playerType));
        }, 1); // TODO: Actually do the animation.
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
},{"../../event/event-bus":9,"../../event/rows-clear-animation-completed-event":14,"./lighting-grid":31}],33:[function(require,module,exports){
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
},{}],34:[function(require,module,exports){
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
},{"../../event/event-bus":9,"./standee":36}],35:[function(require,module,exports){
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
},{"./standee-animation-texture-base":33}],36:[function(require,module,exports){
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
},{"../../event/event-bus":9,"../../event/standee-movement-ended-event":16,"../camera-wrapper":27,"./standee-sprite-wrapper":35}],37:[function(require,module,exports){
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
},{"./camera-wrapper":27,"./lighting/lighting-grid":31,"./lighting/switchboard":32,"./standee/standee-manager":34,"./world/ground":38,"./world/sky":39}],38:[function(require,module,exports){
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
},{}],39:[function(require,module,exports){
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
},{}]},{},[18])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2NvbnRyb2xsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2lucHV0LnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL2NlbGwudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vY29uc3RhbnRzLnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL3BsYXllci1tb3ZlbWVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvYm9hcmQtZmlsbGVkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvY2VsbC1jaGFuZ2UtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ldmVudC1idXMudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ocC1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvbnBjLW1vdmVtZW50LWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ucGMtcGxhY2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvcm93cy1jbGVhci1hbmltYXRpb24tY29tcGxldGVkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvcm93cy1maWxsZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9zdGFuZGVlLW1vdmVtZW50LWVuZGVkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZ2FtZS1zdGF0ZS50cyIsInNyYy9zY3JpcHRzL21haW4udHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9haS9haS50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL2JvYXJkLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvc2hhcGUtZmFjdG9yeS50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL3NoYXBlLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbW9kZWwudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvbnBjLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvbnBjLnRzIiwic3JjL3NjcmlwdHMvcHJlbG9hZGVyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9jYW1lcmEtd3JhcHBlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvYnVpbGRpbmcudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2hwLXBhbmVscy50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvanVuay1yb3ctY3VydGFpbi50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvbGlnaHRpbmctZ3JpZC50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvc3dpdGNoYm9hcmQudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1hbmltYXRpb24tdGV4dHVyZS1iYXNlLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUtbWFuYWdlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLXNwcml0ZS13cmFwcGVyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUudHMiLCJzcmMvc2NyaXB0cy92aWV3L3ZpZXcudHMiLCJzcmMvc2NyaXB0cy92aWV3L3dvcmxkL2dyb3VuZC50cyIsInNyYy9zY3JpcHRzL3ZpZXcvd29ybGQvc2t5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLHNCQUF5QixTQUFTLENBQUMsQ0FBQTtBQUNuQywwQkFBdUIsb0JBQW9CLENBQUMsQ0FBQTtBQUM1QyxnQ0FBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUV6RCxzQ0FBa0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUVuRSw2SEFBNkg7QUFFN0g7SUFBQTtJQTJCQSxDQUFDO0lBekJHLDBCQUFLLEdBQUw7UUFD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biBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtpbnB1dCwgS2V5fSBmcm9tICcuL2lucHV0JztcclxuaW1wb3J0IHtldmVudEJ1c30gZnJvbSAnLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5cclxuLy8gVE9ETzogSGVyZSBkZXRlcm1pbmUgaWYgcGxheWVyIGlzIGhvbGRpbmcgZG93biBvbmUgb2YgdGhlIGFycm93IGtleXM7IGlmIHNvLCBmaXJlIHJhcGlkIGV2ZW50cyBhZnRlciAoVEJEKSBhbW91bnQgb2YgdGltZS5cclxuXHJcbmNsYXNzIENvbnRyb2xsZXIge1xyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGlucHV0LnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5VcCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Sb3RhdGVDbG9ja3dpc2UsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkxlZnQpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuTGVmdCwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuUmlnaHQpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUmlnaHQsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkRvd24pKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRG93biwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuU3BhY2UpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRHJvcCwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuZXhwb3J0IGNvbnN0IGVudW0gS2V5IHtcclxuICAgIExlZnQsXHJcbiAgICBVcCxcclxuICAgIERvd24sXHJcbiAgICBSaWdodCxcclxuICAgIFNwYWNlLFxyXG4gICAgUGF1c2UsXHJcbiAgICBPdGhlclxyXG59XHJcblxyXG5jb25zdCBlbnVtIFN0YXRlIHtcclxuICAgIERvd24sXHJcbiAgICBVcCxcclxuICAgIEhhbmRsaW5nXHJcbn1cclxuXHJcbmNsYXNzIElucHV0IHtcclxuICAgIHByaXZhdGUga2V5U3RhdGU6IE1hcDxLZXksU3RhdGU+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMua2V5U3RhdGUgPSBuZXcgTWFwPEtleSxTdGF0ZT4oKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50VG9TdGF0ZShldmVudCwgU3RhdGUuRG93bik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRUb1N0YXRlKGV2ZW50LCBTdGF0ZS5VcCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gaWYgZ2l2ZW4ga2V5IGlzICdEb3duJy5cclxuICAgICAqL1xyXG4gICAgaXNEb3duKGtleTogS2V5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5U3RhdGUuZ2V0KGtleSkgPT09IFN0YXRlLkRvd247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gaWYgZ2l2ZW4ga2V5IGlzICdkb3duJy4gQWxzbyBzZXRzIHRoZSBrZXkgZnJvbSAnRG93bicgdG8gJ0hhbmRsaW5nJy5cclxuICAgICAqL1xyXG4gICAgaXNEb3duQW5kVW5oYW5kbGVkKGtleTogS2V5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNEb3duKGtleSkpIHtcclxuICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBTdGF0ZS5IYW5kbGluZyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gVE9ETzogVGhpcyB3YXNuJ3Qgc2V0IGluIG1hemluZzsgbmVlZCB0byBzZWUgd2h5LlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgaWYgYW55IGtleSBpcyAnZG93bicuIEFsc28gc2V0IGFsbCAnRG93bicga2V5cyB0byAnSGFuZGxpbmcnLlxyXG4gICAgICovXHJcbiAgICBpc0FueUtleURvd25BbmRVbmhhbmRsZWQoKSB7XHJcbiAgICAgICAgbGV0IGFueUtleURvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmtleVN0YXRlLmZvckVhY2goKHN0YXRlOiBTdGF0ZSwga2V5OiBLZXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIFN0YXRlLkhhbmRsaW5nKTtcclxuICAgICAgICAgICAgICAgIGFueUtleURvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFueUtleURvd247XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudFRvU3RhdGUoZXZlbnQ6IEtleWJvYXJkRXZlbnQsIHN0YXRlOiBTdGF0ZSkge1xyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG5cclxuICAgICAgICAgICAgLy8gRGlyZWN0aW9uYWxzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vICdhJ1xyXG4gICAgICAgICAgICBjYXNlIDM3OiAvLyBsZWZ0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5MZWZ0LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODc6IC8vICd3J1xyXG4gICAgICAgICAgICBjYXNlIDM4OiAvLyB1cFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuVXAsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCkgLSBjb21tZW50ZWQgZm9yIGlmIHRoZSB1c2VyIHdhbnRzIHRvIGNtZCt3IG9yIGN0cmwrd1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vICdkJ1xyXG4gICAgICAgICAgICBjYXNlIDM5OiAvLyByaWdodFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuUmlnaHQsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4MzogLy8gJ3MnXHJcbiAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd25cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LkRvd24sIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzMjogLy8gc3BhY2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlNwYWNlLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBQYXVzZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA4MDogLy8gJ3AnXHJcbiAgICAgICAgICAgIGNhc2UgMjc6IC8vIGVzY1xyXG4gICAgICAgICAgICBjYXNlIDEzOiAvLyBlbnRlciBrZXlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlBhdXNlLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBUT0RPOiBNYXliZSBhZGQgYSBkZWJ1ZyBrZXkgaGVyZSAoJ2YnKVxyXG5cclxuICAgICAgICAgICAgLy8gSWdub3JlIGNlcnRhaW4ga2V5cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgODI6ICAgIC8vICdyJ1xyXG4gICAgICAgICAgICBjYXNlIDE4OiAgICAvLyBhbHRcclxuICAgICAgICAgICAgY2FzZSAyMjQ6ICAgLy8gYXBwbGUgY29tbWFuZCAoZmlyZWZveClcclxuICAgICAgICAgICAgY2FzZSAxNzogICAgLy8gYXBwbGUgY29tbWFuZCAob3BlcmEpXHJcbiAgICAgICAgICAgIGNhc2UgOTE6ICAgIC8vIGFwcGxlIGNvbW1hbmQsIGxlZnQgKHNhZmFyaS9jaHJvbWUpXHJcbiAgICAgICAgICAgIGNhc2UgOTM6ICAgIC8vIGFwcGxlIGNvbW1hbmQsIHJpZ2h0IChzYWZhcmkvY2hyb21lKVxyXG4gICAgICAgICAgICBjYXNlIDg0OiAgICAvLyAndCcgKGkuZS4sIG9wZW4gYSBuZXcgdGFiKVxyXG4gICAgICAgICAgICBjYXNlIDc4OiAgICAvLyAnbicgKGkuZS4sIG9wZW4gYSBuZXcgd2luZG93KVxyXG4gICAgICAgICAgICBjYXNlIDIxOTogICAvLyBsZWZ0IGJyYWNrZXRzXHJcbiAgICAgICAgICAgIGNhc2UgMjIxOiAgIC8vIHJpZ2h0IGJyYWNrZXRzXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgc29tZSB1bndhbnRlZCBiZWhhdmlvcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDE5MTogICAvLyBmb3J3YXJkIHNsYXNoIChwYWdlIGZpbmQpXHJcbiAgICAgICAgICAgIGNhc2UgOTogICAgIC8vIHRhYiAoY2FuIGxvc2UgZm9jdXMpXHJcbiAgICAgICAgICAgIGNhc2UgMTY6ICAgIC8vIHNoaWZ0XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGwgb3RoZXIga2V5cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5Lk90aGVyLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRTdGF0ZShrZXk6IEtleSwgc3RhdGU6IFN0YXRlKSB7XHJcbiAgICAgICAgLy8gQWx3YXlzIHNldCAndXAnXHJcbiAgICAgICAgaWYgKHN0YXRlID09PSBTdGF0ZS5VcCkge1xyXG4gICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIHN0YXRlKTtcclxuICAgICAgICAvLyBPbmx5IHNldCAnZG93bicgaWYgaXQgaXMgbm90IGFscmVhZHkgaGFuZGxlZFxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFN0YXRlLkRvd24pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMua2V5U3RhdGUuZ2V0KGtleSkgIT09IFN0YXRlLkhhbmRsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIHN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGlucHV0ID0gbmV3IElucHV0KCk7IiwiaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi9jb2xvcic7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2VsbCB7XHJcbiAgICBwcml2YXRlIGNvbG9yOiBDb2xvcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNvbG9yID0gQ29sb3IuRW1wdHk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29sb3IoY29sb3I6IENvbG9yKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbG9yKCk6IENvbG9yIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb2xvcjtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE9mZnNldCBjYWxjdWxhdGVkIGZyb20gdG9wLWxlZnQgY29ybmVyIGJlaW5nIDAsIDAuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2VsbE9mZnNldCB7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgUEFORUxfQ09VTlRfUEVSX0ZMT09SID0gMTA7IiwiZXhwb3J0IGVudW0gUGxheWVyTW92ZW1lbnQge1xyXG4gICAgTm9uZSxcclxuICAgIExlZnQsXHJcbiAgICBSaWdodCxcclxuICAgIERvd24sXHJcbiAgICBEcm9wLFxyXG4gICAgUm90YXRlQ2xvY2t3aXNlLFxyXG4gICAgUm90YXRlQ291bnRlckNsb2Nrd2lzZVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi4vbW9kZWwvYm9hcmQvc2hhcGUnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBzaGFwZTogU2hhcGU7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG4gICAgcmVhZG9ubHkgc3RhcnRpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2hhcGU6IFNoYXBlLCBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlLCBzdGFydGluZzogYm9vbGVhbikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5zdGFydGluZyA9IHN0YXJ0aW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQm9hcmRGaWxsZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQm9hcmRGaWxsZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENlbGxDaGFuZ2VFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG4gICAgcmVhZG9ubHkgY2VsbDogQ2VsbDtcclxuICAgIHJlYWRvbmx5IHJvdzogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgY29sOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNlbGw6IENlbGwsIHJvdzogbnVtYmVyLCBjb2w6IG51bWJlciwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5jZWxsID0gY2VsbDtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdztcclxuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5DZWxsQ2hhbmdlRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gRXZlbnRUeXBlIHtcclxuICAgIEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSxcclxuICAgIEFjdGl2ZVNoYXBlRW5kZWRFdmVudFR5cGUsXHJcbiAgICBCb2FyZEZpbGxlZEV2ZW50VHlwZSxcclxuICAgIENlbGxDaGFuZ2VFdmVudFR5cGUsXHJcbiAgICBIcENoYW5nZWRFdmVudFR5cGUsXHJcbiAgICBOcGNNb3ZlbWVudENoYW5nZWRFdmVudFR5cGUsXHJcbiAgICBOcGNQbGFjZWRFdmVudFR5cGUsXHJcbiAgICBOcGNTdGF0ZUNoYWdlZEV2ZW50VHlwZSxcclxuICAgIFBsYXllck1vdmVtZW50RXZlbnRUeXBlLFxyXG4gICAgUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnRUeXBlLFxyXG4gICAgUm93c0ZpbGxlZEV2ZW50VHlwZSxcclxuICAgIFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnRUeXBlXHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBYnN0cmFjdEV2ZW50IHtcclxuICAgIGFic3RyYWN0IGdldFR5cGUoKTpFdmVudFR5cGVcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFdmVudEhhbmRsZXI8VCBleHRlbmRzIEFic3RyYWN0RXZlbnQ+IHtcclxuICAgIChldmVudDogVCk6dm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEV2ZW50QnVzIHtcclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZXJzQnlUeXBlOk1hcDxFdmVudFR5cGUsIEV2ZW50SGFuZGxlcjxBYnN0cmFjdEV2ZW50PltdPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmhhbmRsZXJzQnlUeXBlID0gbmV3IE1hcDxFdmVudFR5cGUsIEV2ZW50SGFuZGxlcjxBYnN0cmFjdEV2ZW50PltdPigpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZ2lzdGVyKHR5cGU6RXZlbnRUeXBlLCBoYW5kbGVyOkV2ZW50SGFuZGxlcjxBYnN0cmFjdEV2ZW50Pikge1xyXG4gICAgICAgIGlmICghdHlwZSkge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBzb21ldGhpbmdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghaGFuZGxlcikge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBzb21ldGhpbmdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBoYW5kbGVyczpFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXSA9IHRoaXMuaGFuZGxlcnNCeVR5cGUuZ2V0KHR5cGUpO1xyXG4gICAgICAgIGlmIChoYW5kbGVycyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlcnNCeVR5cGUuc2V0KHR5cGUsIGhhbmRsZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogUmV0dXJuIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgY2FsbGVkIHRvIHVucmVnaXN0ZXIgdGhlIGhhbmRsZXJcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gVE9ETzogdW5yZWdpc3RlcigpLiBBbmQgcmVtb3ZlIHRoZSBtYXAga2V5IGlmIHplcm8gaGFuZGxlcnMgbGVmdCBmb3IgaXQuXHJcbiAgICBcclxuICAgIC8vIFRPRE86IFByZXZlbnQgaW5maW5pdGUgZmlyZSgpP1xyXG4gICAgZmlyZShldmVudDpBYnN0cmFjdEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5oYW5kbGVyc0J5VHlwZS5nZXQoZXZlbnQuZ2V0VHlwZSgpKTtcclxuICAgICAgICBpZiAoaGFuZGxlcnMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBoYW5kbGVyIG9mIGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZXZlbnRCdXMgPSBuZXcgRXZlbnRCdXMoKTtcclxuZXhwb3J0IGNvbnN0IGRlYWRFdmVudEJ1cyA9IG5ldyBFdmVudEJ1cygpOyAvLyBVc2VkIGJ5IEFJLlxyXG4iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgSHBDaGFuZ2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBocDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihocDogbnVtYmVyLCBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmhwID0gaHA7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuSHBDaGFuZ2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLk5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjU3RhdGV9IGZyb20gJy4uL2RvbWFpbi9ucGMtc3RhdGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wY1BsYWNlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHN0YXRlOiBOcGNTdGF0ZTtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlclxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIsIHN0YXRlOiBOcGNTdGF0ZSwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5OcGNQbGFjZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBsYXllck1vdmVtZW50RXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBtb3ZlbWVudDogUGxheWVyTW92ZW1lbnQ7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vdmVtZW50OiBQbGF5ZXJNb3ZlbWVudCwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudCA9IG1vdmVtZW50O1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLlBsYXllck1vdmVtZW50RXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGZpbGxlZFJvd0lkeHM6IG51bWJlcltdO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihmaWxsZWRSb3dJZHhzOiBudW1iZXJbXSwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5maWxsZWRSb3dJZHhzID0gZmlsbGVkUm93SWR4cy5zbGljZSgwKTtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5Sb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUm93c0ZpbGxlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGZpbGxlZFJvd0lkeHM6IG51bWJlcltdO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihmaWxsZWRSb3dJZHhzOiBudW1iZXJbXSwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5maWxsZWRSb3dJZHhzID0gZmlsbGVkUm93SWR4cy5zbGljZSgwKTtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5Sb3dzRmlsbGVkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHo6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgZW51bSBHYW1lU3RhdGVUeXBlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUgc3RhdGUgcmlnaHQgd2hlbiBKYXZhU2NyaXB0IHN0YXJ0cyBydW5uaW5nLiBJbmNsdWRlcyBwcmVsb2FkaW5nLlxyXG4gICAgICovXHJcbiAgICBJbml0aWFsaXppbmcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZnRlciBwcmVsb2FkIGlzIGNvbXBsZXRlIGFuZCBiZWZvcmUgbWFraW5nIG9iamVjdCBzdGFydCgpIGNhbGxzLlxyXG4gICAgICovXHJcbiAgICBTdGFydGluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgYWZ0ZXIgaW5pdGlhbCBvYmplY3RzIHN0YXJ0KCkgYW5kIGxpa2VseSB3aGVyZSB0aGUgZ2FtZSBpcyB3YWl0aW5nIG9uIHRoZSBwbGF5ZXIncyBmaXJzdCBpbnB1dC5cclxuICAgICAqL1xyXG4gICAgU3RhcnRlZCxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgdGhlIG1haW4gZ2FtZSBsb29wIG9mIGNvbnRyb2xsaW5nIHBpZWNlcy5cclxuICAgICAqL1xyXG4gICAgUGxheWluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuZCBvZiBnYW1lLCBzY29yZSBpcyBzaG93aW5nLCBub3RoaW5nIGxlZnQgdG8gZG8uXHJcbiAgICAgKi9cclxuICAgIEVuZGVkXHJcbn1cclxuXHJcbmNsYXNzIEdhbWVTdGF0ZSB7XHJcbiAgICBwcml2YXRlIGN1cnJlbnQ6IEdhbWVTdGF0ZVR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gR2FtZVN0YXRlVHlwZS5Jbml0aWFsaXppbmc7IC8vIERlZmF1bHQgc3RhdGUuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudCgpOiBHYW1lU3RhdGVUeXBlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHNldEN1cnJlbnQoY3VycmVudDogR2FtZVN0YXRlVHlwZSkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IGN1cnJlbnQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGdhbWVTdGF0ZSA9IG5ldyBHYW1lU3RhdGUoKTsiLCJpbXBvcnQge3ByZWxvYWRlcn0gZnJvbSAnLi9wcmVsb2FkZXInO1xyXG5pbXBvcnQge21vZGVsfSBmcm9tICcuL21vZGVsL21vZGVsJztcclxuaW1wb3J0IHt2aWV3fSBmcm9tICcuL3ZpZXcvdmlldyc7XHJcbmltcG9ydCB7Y29udHJvbGxlcn0gZnJvbSAnLi9jb250cm9sbGVyL2NvbnRyb2xsZXInO1xyXG5pbXBvcnQge0dhbWVTdGF0ZVR5cGUsIGdhbWVTdGF0ZX0gZnJvbSAnLi9nYW1lLXN0YXRlJztcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgZ2FtZVN0YXRlLnNldEN1cnJlbnQoR2FtZVN0YXRlVHlwZS5Jbml0aWFsaXppbmcpO1xyXG4gICAgcHJlbG9hZGVyLnByZWxvYWQobWFpbik7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gbWFpbigpIHtcclxuXHJcbiAgICAvLyBTdGFydHVwIGluIHJldmVyc2UgTVZDIG9yZGVyIHRvIGVuc3VyZSB0aGF0IGV2ZW50IGJ1cyBoYW5kbGVycyBpbiB0aGVcclxuICAgIC8vIGNvbnRyb2xsZXIgYW5kIHZpZXcgcmVjZWl2ZSAoYW55KSBzdGFydCBldmVudHMgZnJvbSBtb2RlbC5zdGFydCgpLlxyXG4gICAgY29udHJvbGxlci5zdGFydCgpO1xyXG4gICAgdmlldy5zdGFydCgpO1xyXG4gICAgbW9kZWwuc3RhcnQoKTtcclxuICAgIFxyXG4gICAgZ2FtZVN0YXRlLnNldEN1cnJlbnQoR2FtZVN0YXRlVHlwZS5TdGFydGVkKTtcclxuXHJcbiAgICBsZXQgc3RlcCA9ICgpID0+IHtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7XHJcblxyXG4gICAgICAgIGxldCBlbGFwc2VkID0gY2FsY3VsYXRlRWxhcHNlZCgpO1xyXG4gICAgICAgIGNvbnRyb2xsZXIuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB2aWV3LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgbW9kZWwuc3RlcChlbGFwc2VkKTtcclxuICAgIH07XHJcbiAgICBzdGVwKCk7XHJcbn1cclxuXHJcbmxldCBsYXN0U3RlcCA9IERhdGUubm93KCk7XHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZUVsYXBzZWQoKSB7XHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gbGFzdFN0ZXA7XHJcbiAgICBpZiAoZWxhcHNlZCA+IDEwMCkge1xyXG4gICAgICAgIGVsYXBzZWQgPSAxMDA7IC8vIGVuZm9yY2Ugc3BlZWQgbGltaXRcclxuICAgIH1cclxuICAgIGxhc3RTdGVwID0gbm93O1xyXG4gICAgcmV0dXJuIGVsYXBzZWQ7XHJcbn0iLCJpbXBvcnQge1NoYXBlfSBmcm9tICcuLi9ib2FyZC9zaGFwZSc7XHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuaW1wb3J0IHtDZWxsfSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7ZXZlbnRCdXMsIEV2ZW50VHlwZX0gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5cclxuY29uc3QgTUFYX0NPTFMgPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7XHJcbmNvbnN0IFRJTUVfQkVUV0VFTl9NT1ZFUyA9IDI1MDtcclxuY29uc3QgVElNRV9NQVhfREVWSUFUSU9OID0gMTAwO1xyXG5cclxuaW50ZXJmYWNlIFpvbWJpZUJvYXJkIHtcclxuICAgIC8vIFdheXMgdG8gaW50ZXJhY3Qgd2l0aCBpdC5cclxuICAgIG1vdmVTaGFwZUxlZnQoKTogYm9vbGVhbjtcclxuICAgIG1vdmVTaGFwZVJpZ2h0KCk6IGJvb2xlYW47XHJcbiAgICBtb3ZlU2hhcGVEb3duKCk6IGJvb2xlYW47XHJcbiAgICBtb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk6IHZvaWQ7XHJcbiAgICBtb3ZlVG9Ub3AoKTogdm9pZDtcclxuICAgIHJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk6IGJvb2xlYW47XHJcbiAgICBjb252ZXJ0U2hhcGVUb0NlbGxzKCk6IHZvaWQ7XHJcbiAgICB1bmRvQ29udmVydFNoYXBlVG9DZWxscygpOiB2b2lkO1xyXG5cclxuICAgIC8vIFdheXMgdG8gZGVyaXZlIGluZm9ybWF0aW9uIGZyb20gaXQuXHJcbiAgICBnZXRDdXJyZW50U2hhcGVDb2xJZHgoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlQWdncmVnYXRlSGVpZ2h0KCk6IG51bWJlcjtcclxuICAgIGNhbGN1bGF0ZUNvbXBsZXRlTGluZXMoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlSG9sZXMoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlQnVtcGluZXNzKCk6IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIFJlYWxCb2FyZCBleHRlbmRzIFpvbWJpZUJvYXJkIHtcclxuICAgIGNsb25lWm9tYmllKCk6IFpvbWJpZUJvYXJkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQWkge1xyXG5cclxuICAgIHByaXZhdGUgcmVhbEJvYXJkOiBSZWFsQm9hcmQ7XHJcbiAgICBwcml2YXRlIHRpbWVVbnRpbE5leHRNb3ZlOiBudW1iZXI7XHJcblxyXG4gICAgLy8gMCA9IG5vIHJvdGF0aW9uLCAxID0gb25lIHJvdGF0aW9uLCAyID0gdHdvIHJvdGF0aW9ucywgMyA9IHRocmVlIHJvdGF0aW9ucy5cclxuICAgIHByaXZhdGUgdGFyZ2V0Um90YXRpb246IG51bWJlcjtcclxuICAgIHByaXZhdGUgY3VycmVudFJvdGF0aW9uOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHRhcmdldENvbElkeDogbnVtYmVyO1xyXG4gICAgLy8gUHJldmVudCBBSSBmcm9tIGRvaW5nIGFueXRoaW5nIHdoaWxlIHRoZSBwaWVjZSBpcyB3YWl0aW5nIHRvIFwibG9ja1wiIGludG8gdGhlIG1hdHJpeC5cclxuICAgIHByaXZhdGUgbW92ZUNvbXBsZXRlZDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZWFsQm9hcmQ6IFJlYWxCb2FyZCkge1xyXG4gICAgICAgIHRoaXMucmVhbEJvYXJkID0gcmVhbEJvYXJkO1xyXG4gICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgPSBUSU1FX0JFVFdFRU5fTU9WRVM7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0Um90YXRpb24gPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gMDtcclxuICAgICAgICB0aGlzLnRhcmdldENvbElkeCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ29tcGxldGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgLT0gZWxhcHNlZDtcclxuICAgICAgICBpZiAodGhpcy50aW1lVW50aWxOZXh0TW92ZSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgPSBUSU1FX0JFVFdFRU5fTU9WRVM7XHJcbiAgICAgICAgICAgIHRoaXMuYWR2YW5jZVRvd2FyZHNUYXJnZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBwcm92aWRlcyBhIGhpZ2gtbGV2ZWwgdmlldyBvZiB0aGUgQUkncyB0aG91Z2h0IHByb2Nlc3MuXHJcbiAgICAgKi9cclxuICAgIHN0cmF0ZWdpemUoKSB7XHJcbiAgICAgICAgbGV0IHpvbWJpZSA9IHRoaXMucmVhbEJvYXJkLmNsb25lWm9tYmllKCk7XHJcblxyXG4gICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBhbGwgcG9zc2libGUgcm90YXRpb25zIGFuZCBjb2x1bW5zXHJcbiAgICAgICAgbGV0IGJlc3RGaXRuZXNzID0gTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVI7XHJcbiAgICAgICAgbGV0IGJlc3RSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgbGV0IGJlc3RDb2xJZHggPSAwO1xyXG4gICAgICAgIGZvciAobGV0IHJvdGF0aW9uID0gMDsgcm90YXRpb24gPCA0OyByb3RhdGlvbisrKSB7XHJcbiAgICAgICAgICAgIHdoaWxlKHpvbWJpZS5tb3ZlU2hhcGVMZWZ0KCkpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgTUFYX0NPTFM7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICB6b21iaWUubW92ZVNoYXBlRG93bkFsbFRoZVdheSgpO1xyXG4gICAgICAgICAgICAgICAgem9tYmllLmNvbnZlcnRTaGFwZVRvQ2VsbHMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZml0bmVzcyA9IHRoaXMuY2FsY3VsYXRlRml0bmVzcyh6b21iaWUpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZpdG5lc3M6ICcgKyBmaXRuZXNzICsgJywgcm90YXRpb246ICcgKyByb3RhdGlvbiArICcsIGNvbDogJyArIGNvbElkeCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZml0bmVzcyA+IGJlc3RGaXRuZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdEZpdG5lc3MgPSBmaXRuZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RSb3RhdGlvbiA9IHJvdGF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RDb2xJZHggPSB6b21iaWUuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCk7IC8vIFVzZSB0aGlzIHJhdGhlciB0aGFuIGlkeCBpbiBjYXNlIGl0IHdhcyBvZmYgYmVjYXVzZSBvZiB3aGF0ZXZlciByZWFzb24gKG9ic3RydWN0aW9uLCB3YWxsLCBldGMuLi4pXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgem9tYmllLnVuZG9Db252ZXJ0U2hhcGVUb0NlbGxzKCk7XHJcbiAgICAgICAgICAgICAgICB6b21iaWUubW92ZVRvVG9wKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2FuTW92ZVJpZ2h0ID0gem9tYmllLm1vdmVTaGFwZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FuTW92ZVJpZ2h0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHpvbWJpZS5yb3RhdGVTaGFwZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnYmVzdEZpdG5lc3M6ICVmLCAlZCwgJWQnLCBiZXN0Rml0bmVzcywgYmVzdFJvdGF0aW9uLCBiZXN0Q29sSWR4KTtcclxuXHJcbiAgICAgICAgLy8gRmluYWxseSwgc2V0IHRoZSB2YWx1ZXMgdGhhdCB3aWxsIGxldCB0aGUgQUkgYWR2YW5jZSB0b3dhcmRzIHRoZSB0YXJnZXQuXHJcbiAgICAgICAgdGhpcy50YXJnZXRSb3RhdGlvbiA9IGJlc3RSb3RhdGlvbjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy50YXJnZXRDb2xJZHggPSBiZXN0Q29sSWR4O1xyXG4gICAgICAgIHRoaXMubW92ZUNvbXBsZXRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZWQgb24gaHR0cHM6Ly9jb2RlbXlyb2FkLndvcmRwcmVzcy5jb20vMjAxMy8wNC8xNC90ZXRyaXMtYWktdGhlLW5lYXItcGVyZmVjdC1wbGF5ZXIvXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlRml0bmVzcyh6b21iaWU6IFpvbWJpZUJvYXJkKSB7XHJcbiAgICAgICAgbGV0IGFnZ3JlZ2F0ZUhlaWdodCA9IHpvbWJpZS5jYWxjdWxhdGVBZ2dyZWdhdGVIZWlnaHQoKTtcclxuICAgICAgICBsZXQgY29tcGxldGVMaW5lcyA9IHpvbWJpZS5jYWxjdWxhdGVDb21wbGV0ZUxpbmVzKCk7XHJcbiAgICAgICAgbGV0IGhvbGVzID0gem9tYmllLmNhbGN1bGF0ZUhvbGVzKCk7XHJcbiAgICAgICAgbGV0IGJ1bXBpbmVzcyA9IHpvbWJpZS5jYWxjdWxhdGVCdW1waW5lc3MoKTtcclxuICAgICAgICBsZXQgZml0bmVzcyA9ICgtMC41MTAwNjYgKiBhZ2dyZWdhdGVIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgKyAoIDAuNzYwNjY2ICogY29tcGxldGVMaW5lcylcclxuICAgICAgICAgICAgICAgICAgICArICgtMC4zNTY2MyAgKiBob2xlcylcclxuICAgICAgICAgICAgICAgICAgICArICgtMC4xODQ0ODMgKiBidW1waW5lc3MpO1xyXG4gICAgICAgIHJldHVybiBmaXRuZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWR2YW5jZVRvd2FyZHNUYXJnZXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubW92ZUNvbXBsZXRlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um90YXRpb24gPT09IHRoaXMudGFyZ2V0Um90YXRpb24gJiYgdGhpcy5yZWFsQm9hcmQuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCkgPT09IHRoaXMudGFyZ2V0Q29sSWR4KSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IERyb3Agc2hhcGUgc2hvdWxkIGJlIG9uIGEgdGltZXIgb3Igc29tZXRoaW5nLlxyXG4gICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5tb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXRDb2xJZHggPSAwO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDb21wbGV0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3RhdGlvbiA8IHRoaXMudGFyZ2V0Um90YXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhbEJvYXJkLnJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbisrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5yZWFsQm9hcmQuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCkgPCB0aGlzLnRhcmdldENvbElkeCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFsQm9hcmQubW92ZVNoYXBlUmlnaHQoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlYWxCb2FyZC5nZXRDdXJyZW50U2hhcGVDb2xJZHgoKSA+IHRoaXMudGFyZ2V0Q29sSWR4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5tb3ZlU2hhcGVMZWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHJpdmF0ZSBwZXJmb3JtTmV3TW92ZW1lbnQoKSB7XHJcbiAgICAgICAgLy8gbGV0IG1hdHJpeCA9IHRoaXMudmlzdWFsLm1hdHJpeDtcclxuICAgICAgICAvLyBsZXQgc2hhcGUgPSB0aGlzLnZpc3VhbC5jdXJyZW50U2hhcGU7XHJcblxyXG4gICAgICAgIC8vIGxldCByYW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNSk7XHJcblxyXG4gICAgICAgIC8vIGlmIChyYW5kID09PSAwKSB7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUm90YXRlQ2xvY2t3aXNlLCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChyYW5kID09PSAxKSB7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuTGVmdCwgUGxheWVyVHlwZS5BaSkpO1xyXG4gICAgICAgIC8vIH0gZWxzZSBpZiAocmFuZCA9PT0gMikge1xyXG4gICAgICAgIC8vICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LlJpZ2h0LCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChyYW5kID09PSAzKSB7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRG93biwgUGxheWVyVHlwZS5BaSkpO1xyXG4gICAgICAgIC8vIH0gZWxzZSBpZiAocmFuZCA9PT0gNCkge1xyXG4gICAgICAgIC8vICAgICBsZXQgZHJvcENoYW5jZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCk7IC8vIElzIHRoaXMgY2FsbGVkIE1vbnRlLUNhcmxvP1xyXG4gICAgICAgIC8vICAgICBpZiAoZHJvcENoYW5jZSA8IDEwKSB7XHJcbiAgICAgICAgLy8gICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkRyb3AsIFBsYXllclR5cGUuQWkpKTtcclxuICAgICAgICAvLyAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgICAgIC8vIERvIG5vdGhpbmcgdGhpcyByb3VuZDsgbWF5YmUgY29uc2lkZXJlZCBhIGhlc2l0YXRpb24uXHJcbiAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnc2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgICAgIC8vIH1cclxuICAgIC8vIH1cclxuXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVRpbWVVbnRpbE5leHRNb3ZlKCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKFRJTUVfQkVUV0VFTl9NT1ZFUyArICgoTWF0aC5yYW5kb20oKSAqIFRJTUVfTUFYX0RFVklBVElPTikgLSAoVElNRV9NQVhfREVWSUFUSU9OIC8gMikpKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4vc2hhcGUnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7U2hhcGVGYWN0b3J5LCBkZWFkU2hhcGVGYWN0b3J5fSBmcm9tICcuL3NoYXBlLWZhY3RvcnknO1xyXG5pbXBvcnQge0V2ZW50QnVzLCBkZWFkRXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7Q2VsbENoYW5nZUV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9jZWxsLWNoYW5nZS1ldmVudCc7XHJcbmltcG9ydCB7Um93c0ZpbGxlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9yb3dzLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtCb2FyZEZpbGxlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ib2FyZC1maWxsZWQtZXZlbnQnO1xyXG5cclxuY29uc3QgTUFYX1JPV1MgPSAxOTsgLy8gVG9wIDIgcm93cyBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuIEFsc28sIHNlZSBsaWdodGluZy1ncmlkLnRzLlxyXG5jb25zdCBNQVhfQ09MUyA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjtcclxuY29uc3QgVEVNUF9ERUxBWV9NUyA9IDUwMDtcclxuXHJcbmNvbnN0IGVudW0gQm9hcmRTdGF0ZSB7XHJcbiAgICBQYXVzZWQsXHJcbiAgICBJblBsYXlcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvYXJkIHtcclxuICAgIHByaXZhdGUgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuICAgIHByaXZhdGUgc2hhcGVGYWN0b3J5OiBTaGFwZUZhY3Rvcnk7XHJcbiAgICBwcml2YXRlIGV2ZW50QnVzOiBFdmVudEJ1cztcclxuXHJcbiAgICBwcml2YXRlIGJvYXJkU3RhdGU6IEJvYXJkU3RhdGU7XHJcbiAgICBwcml2YXRlIG1zVGlsbEdyYXZpdHlUaWNrOiBudW1iZXI7XHJcblxyXG4gICAgY3VycmVudFNoYXBlOiBTaGFwZTtcclxuICAgIHJlYWRvbmx5IG1hdHJpeDogQ2VsbFtdW107XHJcblxyXG4gICAgcHJpdmF0ZSBqdW5rUm93SG9sZUNvbHVtbjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBqdW5rUm93SG9sZURpcmVjdGlvbjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBqdW5rUm93Q29sb3IxOiBDb2xvcjtcclxuICAgIHByaXZhdGUganVua1Jvd0NvbG9yMjogQ29sb3I7XHJcbiAgICBwcml2YXRlIGp1bmtSb3dDb2xvcklkeDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBsYXllclR5cGU6IFBsYXllclR5cGUsIHNoYXBlRmFjdG9yeTogU2hhcGVGYWN0b3J5LCBldmVudEJ1czogRXZlbnRCdXMpIHtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgICAgIHRoaXMuc2hhcGVGYWN0b3J5ID0gc2hhcGVGYWN0b3J5O1xyXG4gICAgICAgIHRoaXMuZXZlbnRCdXMgPSBldmVudEJ1cztcclxuXHJcbiAgICAgICAgdGhpcy5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5QYXVzZWQ7XHJcbiAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IFRFTVBfREVMQVlfTVM7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1hdHJpeCA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IE1BWF9ST1dTOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFtyb3dJZHhdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZUNvbHVtbiA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZUNvbHVtbiA9IE1BWF9DT0xTIC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbiA9IDE7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q29sb3IxID0gQ29sb3IuV2hpdGU7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q29sb3IyID0gQ29sb3IuV2hpdGU7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q29sb3JJZHggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmJvYXJkU3RhdGUgPSBCb2FyZFN0YXRlLkluUGxheTsgLy8gVE9ETzogTW92ZSB0aGlzIGVsc2V3aGVyZSBvbmNlIGRlZmluZWQuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGdpdmVzIGEgaGlnaCBsZXZlbCB2aWV3IG9mIHRoZSBtYWluIGdhbWUgbG9vcC5cclxuICAgICAqIFRoaXMgc2hvdWxkbid0IGJlIGNhbGxlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5QYXVzZWQpIHtcclxuICAgICAgICAgICAgLy8gVGhpcyBpcyBoZXJlIGp1c3QgdG8gZW5zdXJlIHRoYXQgdGhlIG1ldGhvZCB0byBydW5zIGltbWVkaWF0ZWx5IGFmdGVyIHVucGF1c2luZy5cclxuICAgICAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayAtPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tc1RpbGxHcmF2aXR5VGljayA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1zVGlsbEdyYXZpdHlUaWNrID0gVEVNUF9ERUxBWV9NUztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyeUdyYXZpdHkoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZVNoYXBlRG93bigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUVuZE9mQ3VycmVudFBpZWNlVGFza3MoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGwgdGhpcyBvbmNlIGEgc2hhcGUgaXMga25vd24gdG8gYmUgaW4gaXRzIGZpbmFsIHJlc3RpbmcgcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIGhhbmRsZUVuZE9mQ3VycmVudFBpZWNlVGFza3MoKSB7XHJcbiAgICAgICAgdGhpcy5jb252ZXJ0U2hhcGVUb0NlbGxzKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNCb2FyZEZ1bGwoKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNpZ25hbEZ1bGxCb2FyZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0Qm9hcmQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQxKCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoZXJlIHdlcmUgZmlsbGVkIGxpbmVzLCBkbyBub3Qgc3RhcnQgYSBuZXcgc2hhcGUgaW1tZWRpYXRlbHkuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0U2hhcGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0Qm9hcmQoKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuc3RhcnRTaGFwZSh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBnZXRDdXJyZW50U2hhcGVDb2xJZHgoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlTGVmdCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlTGVmdCgpO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlUmlnaHQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlTGVmdCgpO1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZURvd24oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZURvd25BbGxUaGVXYXkoKSB7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlRG93bigpO1xyXG4gICAgICAgIH0gd2hpbGUgKCF0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgbW92ZVRvVG9wKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVUb1RvcCgpOyBcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVTaGFwZUNsb2Nrd2lzZSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5yb3RhdGVDbG9ja3dpc2UoKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLnJvdGF0ZUNvdW50ZXJDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBhZGRKdW5rUm93cyhudW1iZXJPZlJvd3NUb0FkZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gQ2xlYXIgcm93cyBhdCB0aGUgdG9wIHRvIG1ha2Ugcm9vbSBhdCB0aGUgYm90dG9tLlxyXG4gICAgICAgIHRoaXMubWF0cml4LnNwbGljZSgwLCBudW1iZXJPZlJvd3NUb0FkZCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBqdW5rIHJvd3MgYXQgdGhlIGJvdHRvbS5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBudW1iZXJPZlJvd3NUb0FkZDsgaWR4KyspIHtcclxuICAgICAgICAgICAgLy8gU2V0IHRoZSByb3cgdG8gY29tcGxldGVseSBmaWxsZWQuXHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IHRoaXMuZ2V0TmV4dEp1bmtSb3dDb2xvcigpO1xyXG4gICAgICAgICAgICBsZXQgcm93OiBDZWxsW10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgICAgICAgICBjZWxsLnNldENvbG9yKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIHJvdy5wdXNoKGNlbGwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQdW5jaCBhIGhvbGUgaW4gdGhlIGxpbmUuXHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gcm93W3RoaXMuanVua1Jvd0hvbGVDb2x1bW5dO1xyXG4gICAgICAgICAgICBjZWxsLnNldENvbG9yKENvbG9yLkVtcHR5KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBhcmUgZm9yIHRoZSBuZXh0IGp1bmsgcm93IGxpbmUuXHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gKz0gdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbjtcclxuICAgICAgICAgICAgaWYgKHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVEaXJlY3Rpb24gKj0gLTE7IC8vIEZsaXBzIHRoZSBkaXJlY3Rpb25cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID49IE1BWF9DT0xTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gTUFYX0NPTFMgLSAyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbiAqPSAtMTsgLy8gRmxpcHMgdGhlIGRpcmVjdGlvblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeC5wdXNoKHJvdyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE5vdGlmeSBmb3IgYWxsIGNlbGxzIGJlY2F1c2UgZW50aXJlIGJvYXJkIGhhcyBjaGFuZ2VkLlxyXG4gICAgICAgIC8vIFRPRE86IE1vdmUgdG8gb3duIG1ldGhvZD9cclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCwgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2V0TWF0cml4V2l0aEN1cnJlbnRTaGFwZUFkZGVkKCk6IGJvb2xlYW5bXVtdIHtcclxuICAgIC8vICAgICBsZXQgY29weSA9IFtdO1xyXG4gICAgLy8gICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgIC8vICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAvLyAgICAgICAgIGxldCByb3dDb3B5ID0gW107XHJcbiAgICAvLyAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAvLyAgICAgICAgICAgICByb3dDb3B5LnB1c2gocm93W2NvbElkeF0uZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpO1xyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgIGNvcHkucHVzaChyb3dDb3B5KTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyAgICAgcmV0dXJuIGNvcHk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBWZXJ5IGhhY2t5IG1ldGhvZCBqdXN0IHNvIHRoZSBBSSBoYXMgYSB0ZW1wIGNvcHkgb2YgdGhlIGJvYXJkIHRvIGV4cGVyaW1lbnQgd2l0aC5cclxuICAgICAqL1xyXG4gICAgY2xvbmVab21iaWUoKTogQm9hcmQge1xyXG4gICAgICAgIGxldCBjb3B5ID0gbmV3IEJvYXJkKHRoaXMucGxheWVyVHlwZSwgZGVhZFNoYXBlRmFjdG9yeSwgZGVhZEV2ZW50QnVzKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBDb3B5IHRoZSBjdXJyZW50IHNoYXBlIGFuZCB0aGUgbWF0cml4LiBTaG91bGRuJ3QgbmVlZCBhbnl0aGluZyBlbHNlLlxyXG4gICAgICAgIGNvcHkuY3VycmVudFNoYXBlID0gdGhpcy5jdXJyZW50U2hhcGUuY2xvbmVTaW1wbGUoKTtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgY29weS5tYXRyaXhbcm93SWR4XVtjb2xJZHhdLnNldENvbG9yKHJvd1tjb2xJZHhdLmdldENvbG9yKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29weTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVBZ2dyZWdhdGVIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgY29sSGVpZ2h0cyA9IHRoaXMuY2FsY3VsYXRlQ29sdW1uSGVpZ2h0cygpO1xyXG4gICAgICAgIHJldHVybiBjb2xIZWlnaHRzLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYSArIGI7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZUNvbXBsZXRlTGluZXMoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgY29tcGxldGVMaW5lcyA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocm93W2NvbElkeF0uZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb3VudCA+PSByb3cubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZUxpbmVzKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb21wbGV0ZUxpbmVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKiBEZXRlcm1pbmVzIGhvbGVzIGJ5IHNjYW5uaW5nIGVhY2ggY29sdW1uLCBoaWdoZXN0IGZsb29yIHRvIGxvd2VzdCBmbG9vciwgYW5kXHJcbiAgICAgKiBzZWVpbmcgaG93IG1hbnkgdGltZXMgaXQgc3dpdGNoZXMgZnJvbSBjb2xvcmVkIHRvIGVtcHR5IChidXQgbm90IHRoZSBvdGhlciB3YXkgYXJvdW5kKS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlSG9sZXMoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgdG90YWxIb2xlcyA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBob2xlcyA9IDA7XHJcbiAgICAgICAgICAgIGxldCBwcmV2aW91c0NlbGxXYXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzQ2VsbFdhc0VtcHR5ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjZWxsLmdldENvbG9yKCkgPT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvbGVzKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NlbGxXYXNFbXB0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvdGFsSG9sZXMgKz0gaG9sZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0b3RhbEhvbGVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZUJ1bXBpbmVzcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBidW1waW5lc3MgPSAwO1xyXG4gICAgICAgIGxldCBjb2xIZWlnaHRzID0gdGhpcy5jYWxjdWxhdGVDb2x1bW5IZWlnaHRzKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgY29sSGVpZ2h0cy5sZW5ndGggLSAyOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgdmFsMSA9IGNvbEhlaWdodHNbaWR4XTtcclxuICAgICAgICAgICAgbGV0IHZhbDIgPSBjb2xIZWlnaHRzW2lkeCArIDFdO1xyXG4gICAgICAgICAgICBidW1waW5lc3MgKz0gTWF0aC5hYnModmFsMSAtIHZhbDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYnVtcGluZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlQ29sdW1uSGVpZ2h0cygpOiBudW1iZXJbXSB7XHJcbiAgICAgICAgbGV0IGNvbEhlaWdodHM6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgIGNvbEhlaWdodHMucHVzaCgwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgaGlnaGVzdCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvd0lkeCA9IE1BWF9ST1dTIC0gMTsgcm93SWR4ID49IDA7IHJvd0lkeC0tKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICAgICAgICAgIGlmIChjZWxsLmdldENvbG9yKCkgIT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGlnaGVzdCA9IE1BWF9ST1dTIC0gcm93SWR4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbEhlaWdodHNbY29sSWR4XSA9IGhpZ2hlc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xIZWlnaHRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG9ubHkgcmVhc29uIHRoaXMgaXMgbm90IHByaXZhdGUgaXMgc28gdGhlIEFJIGNhbiBleHBlcmltZW50IHdpdGggaXQuXHJcbiAgICAgKiBXb3JrIGhlcmUgc2hvdWxkIGFibGUgdG8gYmUgYmUgdW5kb25lIGJ5IHVuZG9Db252ZXJ0U2hhcGVUb0NlbGxzLlxyXG4gICAgICovXHJcbiAgICBjb252ZXJ0U2hhcGVUb0NlbGxzKCkge1xyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiB0aGlzLmN1cnJlbnRTaGFwZS5nZXRPZmZzZXRzKCkpIHtcclxuICAgICAgICAgICAgbGV0IHJvd0lkeCA9IG9mZnNldC55ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Um93KCk7XHJcbiAgICAgICAgICAgIGxldCBjb2xJZHggPSBvZmZzZXQueCArIHRoaXMuY3VycmVudFNoYXBlLmdldENvbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvd0lkeCA8IDAgfHwgcm93SWR4ID49IHRoaXMubWF0cml4Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb2xJZHggPCAwIHx8IGNvbElkeCA+PSB0aGlzLm1hdHJpeFtyb3dJZHhdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2VsbENvbG9yKHJvd0lkeCwgY29sSWR4LCB0aGlzLmN1cnJlbnRTaGFwZS5jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuIFNob3VsZCB1bmRvIGNvbnZlcnRTaGFwZVRvQ2VsbHMoKS5cclxuICAgICAqL1xyXG4gICAgdW5kb0NvbnZlcnRTaGFwZVRvQ2VsbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIHRoaXMuY3VycmVudFNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgcm93SWR4ID0gb2Zmc2V0LnkgKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICAgICAgbGV0IGNvbElkeCA9IG9mZnNldC54ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm93SWR4IDwgMCB8fCByb3dJZHggPj0gdGhpcy5tYXRyaXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbElkeCA8IDAgfHwgY29sSWR4ID49IHRoaXMubWF0cml4W3Jvd0lkeF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDZWxsQ29sb3Iocm93SWR4LCBjb2xJZHgsIENvbG9yLkVtcHR5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjbGVhcigpIHtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VDZWxsQ29sb3Iocm93SWR4LCBjb2xJZHgsIENvbG9yLkVtcHR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgW3RoaXMuanVua1Jvd0NvbG9yMSwgdGhpcy5qdW5rUm93Q29sb3IyXSA9IHRoaXMuZ2V0UmFuZG9tQ29sb3JzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRvIGNoYW5nZSBhIHNpbmdsZSBjZWxsIGNvbG9yJ3MgYW5kIG5vdGlmeSBzdWJzY3JpYmVycyBhdCB0aGUgc2FtZSB0aW1lLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNoYW5nZUNlbGxDb2xvcihyb3dJZHg6IG51bWJlciwgY29sSWR4OiBudW1iZXIsIGNvbG9yOiBDb2xvcikge1xyXG4gICAgICAgIC8vIFRPRE86IE1heWJlIGJvdW5kcyBjaGVjayBoZXJlLlxyXG4gICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgIGNlbGwuc2V0Q29sb3IoY29sb3IpO1xyXG4gICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgQ2VsbENoYW5nZUV2ZW50KGNlbGwsIHJvd0lkeCwgY29sSWR4LCB0aGlzLnBsYXllclR5cGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXJ0U2hhcGUoZm9yY2VCYWdSZWZpbGw6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZSA9IHRoaXMuc2hhcGVGYWN0b3J5Lm5leHRTaGFwZShmb3JjZUJhZ1JlZmlsbCk7XHJcbiAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQodHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB0cnlHcmF2aXR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjYW5Nb3ZlRG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVEb3duKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICBjYW5Nb3ZlRG93biA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNhbk1vdmVEb3duO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZW5kZWQgZm9yIGNoZWNraW5nIG9mIHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBjdXJyZW50XHJcbiAgICAgKiBzaGFwZSBoYXMgYW55IG92ZXJsYXAgd2l0aCBleGlzdGluZyBjZWxscyB0aGF0IGhhdmUgY29sb3IuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY29sbGlzaW9uRGV0ZWN0ZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGNvbGxpc2lvbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2YgdGhpcy5jdXJyZW50U2hhcGUuZ2V0T2Zmc2V0cygpKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSBvZmZzZXQueSArIHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpO1xyXG4gICAgICAgICAgICBsZXQgY29sID0gb2Zmc2V0LnggKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3cgPCAwIHx8IHJvdyA+PSB0aGlzLm1hdHJpeC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbCA8IDAgfHwgY29sID49IHRoaXMubWF0cml4W3Jvd10ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hdHJpeFtyb3ddW2NvbF0uZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbGxpc2lvbjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEl0IGlzIGNvbnNpZGVyZWQgZnVsbCBpZiB0aGUgdHdvIG9ic2N1cmVkIHJvd3MgYXQgdGhlIHRvcCBoYXZlIGNvbG9yZWQgY2VsbHMgaW4gdGhlbS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBpc0JvYXJkRnVsbCgpOiBib29sZWFuIHtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCAyOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2lnbmFsRnVsbEJvYXJkKCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgQm9hcmRGaWxsZWRFdmVudCh0aGlzLnBsYXllclR5cGUpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBmaWxsZWQgbGluZXMgbWV0aG9kIDEgb2YgMiwgYmVmb3JlIGFuaW1hdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBoYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQxKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBmaWxsZWRSb3dJZHhzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGxldCBmaWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjZWxsIG9mIHJvdykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZmlsbGVkKSB7XHJcbiAgICAgICAgICAgICAgICBmaWxsZWRSb3dJZHhzLnB1c2gocm93SWR4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZpbGxlZFJvd0lkeHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IFJvd3NGaWxsZWRFdmVudChmaWxsZWRSb3dJZHhzLCB0aGlzLnBsYXllclR5cGUpKTtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5QYXVzZWQ7IC8vIFN0YW5kYnkgdW50aWwgYW5pbWF0aW9uIGlzIGZpbmlzaGVkLlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIERvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgaWYgdGhlcmUgYXJlIG5vIGZpbGxlZCBsaW5lcy5cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGZpbGxlZFJvd0lkeHMubGVuZ3RoID4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBmaWxsZWQgbGluZXMgbWV0aG9kIDIgb2YgMiwgYWZ0ZXIgYW5pbWF0aW9uLlxyXG4gICAgICogVGhpcyBpcyBwdWJsaWMgc28gdGhhdCB0aGUgTW9kZWwgY2FuIGNhbGwgaXQuXHJcbiAgICAgKi9cclxuICAgIGhhbmRsZUFueUZpbGxlZExpbmVzUGFydDIoZmlsbGVkUm93SWR4czogbnVtYmVyW10pIHtcclxuICAgICAgICAvLyBSZW1vdmUgdGhlIHJvd3NcclxuICAgICAgICBsZXQgdG90YWxGaWxsZWQgPSBmaWxsZWRSb3dJZHhzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBmaWxsZWRSb3dJZHhzLmxlbmd0aDsgaWR4KyspIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVBbmRDb2xsYXBzZShmaWxsZWRSb3dJZHhzW2lkeF0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm90aWZ5IGFsbCBjZWxsc1xyXG4gICAgICAgIC8vIFRPRE86IEJyZWFrIG91dCBpbnRvIG93biBtZXRob2Q/XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgTUFYX1JPV1M7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCwgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGlvbiB3YXMgZmluaXNoZWQgYW5kIGJvYXJkIHdhcyB1cGRhdGVkLCBzbyByZXN1bWUgcGxheS5cclxuICAgICAgICB0aGlzLmJvYXJkU3RhdGUgPSBCb2FyZFN0YXRlLkluUGxheTtcclxuICAgICAgICB0aGlzLnN0YXJ0U2hhcGUoZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyByZW1vdmVzIHRoZSBvbGQgcm93IGFuZCBwdXRzIGEgbmV3IHJvdyBpbiBpdHMgcGxhY2UgYXQgcG9zaXRpb24gMCwgd2hpY2ggaXMgdGhlIGhpZ2hlc3QgdmlzdWFsbHkgdG8gdGhlIHBsYXllci5cclxuICAgICAqIERlbGVnYXRlcyBjZWxsIG5vdGlmaWNhdGlvbiB0byB0aGUgY2FsbGluZyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVtb3ZlQW5kQ29sbGFwc2Uocm93SWR4OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2Uocm93SWR4LCAxKTtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2UoMCwgMCwgW10pO1xyXG4gICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFswXVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoc3RhcnRpbmc9ZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KHRoaXMuY3VycmVudFNoYXBlLCB0aGlzLnBsYXllclR5cGUsIHN0YXJ0aW5nKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXROZXh0SnVua1Jvd0NvbG9yKCk6IENvbG9yIHtcclxuICAgICAgICBsZXQgY29sb3I6IENvbG9yO1xyXG4gICAgICAgIGlmICh0aGlzLmp1bmtSb3dDb2xvcklkeCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gdGhpcy5qdW5rUm93Q29sb3IxO1xyXG4gICAgICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcklkeCA9IDE7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmp1bmtSb3dDb2xvcklkeCA+PSAxKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gdGhpcy5qdW5rUm93Q29sb3IyO1xyXG4gICAgICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcklkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFJhbmRvbUNvbG9ycygpOiBbQ29sb3IsIENvbG9yXSB7XHJcblxyXG4gICAgICAgIC8vIFNlbGVjdCB0d28gY29sb3JzIHRoYXQgYXJlIG5vdCBlcXVhbCB0byBlYWNoIG90aGVyLlxyXG4gICAgICAgIGxldCByYW5kMSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgIGxldCByYW5kMiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgIGlmIChyYW5kMSA9PT0gcmFuZDIpIHtcclxuICAgICAgICAgICAgcmFuZDIrKztcclxuICAgICAgICAgICAgaWYgKHJhbmQyID4gNikge1xyXG4gICAgICAgICAgICAgICAgcmFuZDIgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbdGhpcy5jb2xvckJ5TnVtYmVyKHJhbmQxKSwgdGhpcy5jb2xvckJ5TnVtYmVyKHJhbmQyKV07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgY29sb3JCeU51bWJlcih2YWx1ZTogbnVtYmVyKTogQ29sb3Ige1xyXG4gICAgICAgIGxldCBjb2xvcjogQ29sb3I7XHJcbiAgICAgICAgc3dpdGNoKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuQ3lhbjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLlllbGxvdztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLlB1cnBsZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLkdyZWVuO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuUmVkO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuQmx1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLk9yYW5nZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5XaGl0ZTsgLy8gU2hvdWxkbid0IGdldCBoZXJlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgIH1cclxufSIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4vc2hhcGUnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5cclxuY2xhc3MgU2hhcGVJIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5DeWFuO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gNDtcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSB0cnVlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlSSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZUkoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVKIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5CbHVlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSB0cnVlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZUoge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVKKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlTCBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuT3JhbmdlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSB0cnVlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAxLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMSwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlTCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZUwoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVPIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5ZZWxsb3c7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSA0O1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IGZhbHNlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlTyB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZU8oKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVTIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5HcmVlbjtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gZmFsc2U7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAxLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVTIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlUygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZVQgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLlB1cnBsZTtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gdHJ1ZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZVQge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVUKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlWiBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuUmVkO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSBmYWxzZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMCwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZVoge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVaKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTaGFwZUZhY3Rvcnkge1xyXG4gICAgcHJpdmF0ZSBiYWc6IFNoYXBlW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5yZWZpbGxCYWcodHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFNoYXBlKGZvcmNlQmFnUmVmaWxsOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYmFnLmxlbmd0aCA8PSAwIHx8IGZvcmNlQmFnUmVmaWxsID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVmaWxsQmFnKGZvcmNlQmFnUmVmaWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFnLnBvcCgpOyAvLyBHZXQgZnJvbSBlbmQgb2YgYXJyYXkuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWZpbGxCYWcoc3RhcnRpbmdQaWVjZUFzRmlyc3Q6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmJhZyA9IFtcclxuICAgICAgICAgICAgbmV3IFNoYXBlSSgpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVKKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZUwoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlVCgpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVPKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZVMoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlWigpXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBGaXNoZXItWWF0ZXMgU2h1ZmZsZSwgYmFzZWQgb246IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI0NTA5NzZcclxuICAgICAgICAgICAgbGV0IGlkeCA9IHRoaXMuYmFnLmxlbmd0aFxyXG4gICAgICAgICAgICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxyXG4gICAgICAgICAgICB3aGlsZSAoMCAhPT0gaWR4KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cclxuICAgICAgICAgICAgICAgIGxldCBybmRJZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpZHgpO1xyXG4gICAgICAgICAgICAgICAgaWR4IC09IDE7XHJcbiAgICAgICAgICAgICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcFZhbCA9IHRoaXMuYmFnW2lkeF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhZ1tpZHhdID0gdGhpcy5iYWdbcm5kSWR4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFnW3JuZElkeF0gPSB0ZW1wVmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPbmx5IGNlcnRhaW4gc2hhcGVzIGNhbiBiZSBkcm9wcGVkIG9udG8gd2hhdCBjb3VsZCBiZSBhIGJsYW5rIG9yIGFsbW9zdC1ibGFuayBncmlkLlxyXG4gICAgICAgIGlmIChzdGFydGluZ1BpZWNlQXNGaXJzdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBsZXQgbGFzdElkeCA9IHRoaXMuYmFnLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJhZ1tsYXN0SWR4XS5zdGFydGluZ0VsaWdpYmxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEbyBub3QgbmVlZCB0byBkbyBhbnl0aGluZy5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGxhc3RJZHg7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYmFnW2lkeF0uc3RhcnRpbmdFbGlnaWJsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcFZhbCA9IHRoaXMuYmFnW2xhc3RJZHhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhZ1tsYXN0SWR4XSA9IHRoaXMuYmFnW2lkeF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmFnW2lkeF0gPSB0ZW1wVmFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGRlYWRTaGFwZUZhY3RvcnkgPSBuZXcgU2hhcGVGYWN0b3J5KCk7IC8vIFVzZWQgYnkgQUkuIiwiaW1wb3J0IHtDZWxsT2Zmc2V0fSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcblxyXG5jb25zdCBTUEFXTl9DT0wgPSAzOyAvLyBMZWZ0IHNpZGUgb2YgbWF0cml4IHNob3VsZCBjb3JyZXNwb25kIHRvIHRoaXMuXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2hhcGUge1xyXG4gICAgYWJzdHJhY3QgcmVhZG9ubHkgY29sb3I6IENvbG9yO1xyXG4gICAgYWJzdHJhY3QgcmVhZG9ubHkgdmFsdWVzUGVyUm93OiBudW1iZXI7XHJcbiAgICBhYnN0cmFjdCByZWFkb25seSBzdGFydGluZ0VsaWdpYmxlOiBib29sZWFuO1xyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBtYXRyaWNlczogUmVhZG9ubHlBcnJheTxSZWFkb25seUFycmF5PG51bWJlcj4+O1xyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGdldEluc3RhbmNlKCk6IFNoYXBlO1xyXG5cclxuICAgIHByaXZhdGUgY3VycmVudE1hdHJpeEluZGV4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJvdzogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjb2w6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IDA7IC8vIFRPRE86IEVuc3VyZSBwb3NpdGlvbiAwIGlzIHRoZSBzcGF3biBwb3NpdGlvblxyXG4gICAgICAgIHRoaXMucm93ID0gMDtcclxuICAgICAgICB0aGlzLmNvbCA9IFNQQVdOX0NPTDtcclxuICAgICAgICB0aGlzLnN0YXJ0aW5nRWxpZ2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlTGVmdCgpIHtcclxuICAgICAgICB0aGlzLmNvbC0tO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICB0aGlzLmNvbCsrO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICB0aGlzLnJvdy0tO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVEb3duKCkge1xyXG4gICAgICAgIHRoaXMucm93Kys7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgbW92ZVRvVG9wKCkge1xyXG4gICAgICAgIHRoaXMucm93ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVDb3VudGVyQ2xvY2t3aXNlKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4IC09IDE7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVBcnJheUJvdW5kcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUNsb2Nrd2lzZSgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCArPSAxO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQXJyYXlCb3VuZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3coKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm93O1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb2w7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um93Q291bnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmdldEN1cnJlbnRNYXRyaXgoKS5sZW5ndGggLyB0aGlzLnZhbHVlc1BlclJvdyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0T2Zmc2V0cygpOiBDZWxsT2Zmc2V0W10ge1xyXG4gICAgICAgIGxldCBtYXRyaXggPSB0aGlzLmdldEN1cnJlbnRNYXRyaXgoKTtcclxuICAgICAgICBsZXQgb2Zmc2V0czogQ2VsbE9mZnNldFtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgbWF0cml4Lmxlbmd0aDsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWF0cml4W2lkeF07XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBpZHggJSB0aGlzLnZhbHVlc1BlclJvdztcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihpZHggLyB0aGlzLnZhbHVlc1BlclJvdyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0ID0gbmV3IENlbGxPZmZzZXQoeCwgeSk7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXRzLnB1c2gob2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2Zmc2V0cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhY2t5IG1ldGhvZCB1c2VkIGJ5IHRoZSBBSS5cclxuICAgICAqIFwiU2ltcGxlXCIgYXMgaW4gZG9lc24ndCBtYXR0ZXIgd2hhdCB0aGUgY3VycmVudCByb3cvY29sL21hdHJpeCBpcy5cclxuICAgICAqL1xyXG4gICAgY2xvbmVTaW1wbGUoKTogU2hhcGUge1xyXG4gICAgICAgIC8vIEdldCBhbiBpbnN0YW5jZSBvZiB0aGUgY29uY3JldGUgY2xhc3MuIFJlc3Qgb2YgdmFsdWVzIGFyZSBpcnJlbGV2YW50LlxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEluc3RhbmNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50TWF0cml4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hdHJpY2VzW3RoaXMuY3VycmVudE1hdHJpeEluZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVuc3VyZUFycmF5Qm91bmRzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggPSB0aGlzLm1hdHJpY2VzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA+PSB0aGlzLm1hdHJpY2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtCb2FyZH0gZnJvbSAnLi9ib2FyZC9ib2FyZCc7XHJcbmltcG9ydCB7QWl9IGZyb20gJy4vYWkvYWknO1xyXG5pbXBvcnQge25wY01hbmFnZXJ9IGZyb20gJy4vbnBjL25wYy1tYW5hZ2VyJztcclxuaW1wb3J0IHtldmVudEJ1cywgRXZlbnRUeXBlfSBmcm9tICcuLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NGaWxsZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcm93cy1maWxsZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9yb3dzLWNsZWFyLWFuaW1hdGlvbi1jb21wbGV0ZWQtZXZlbnQnO1xyXG5pbXBvcnQge0JvYXJkRmlsbGVkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2JvYXJkLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7SHBDaGFuZ2VkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1NoYXBlRmFjdG9yeX0gZnJvbSAnLi9ib2FyZC9zaGFwZS1mYWN0b3J5JztcclxuXHJcbmNvbnN0IE1BWF9IUCA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjsgLy8gSFAgY29ycmVzcG9uZHMgdG8gdGhlIG51bWJlciBvZiBsb25nIHdpbmRvd3Mgb24gdGhlIHNlY29uZCBmbG9vciBvZiB0aGUgcGh5c2ljYWwgYnVpbGRpbmcuXHJcblxyXG5jbGFzcyBNb2RlbCB7XHJcbiAgICBwcml2YXRlIGh1bWFuQm9hcmQ6IEJvYXJkO1xyXG4gICAgcHJpdmF0ZSBodW1hbkhpdFBvaW50czogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgYWlCb2FyZDogQm9hcmQ7XHJcbiAgICBwcml2YXRlIGFpSGl0UG9pbnRzOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBhaTogQWk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgbGV0IGh1bWFuU2hhcGVGYWN0b3J5ID0gbmV3IFNoYXBlRmFjdG9yeSgpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5Cb2FyZCA9IG5ldyBCb2FyZChQbGF5ZXJUeXBlLkh1bWFuLCBodW1hblNoYXBlRmFjdG9yeSwgZXZlbnRCdXMpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5IaXRQb2ludHMgPSBNQVhfSFA7XHJcblxyXG4gICAgICAgIGxldCBhaVNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTtcclxuICAgICAgICB0aGlzLmFpQm9hcmQgPSBuZXcgQm9hcmQoUGxheWVyVHlwZS5BaSwgYWlTaGFwZUZhY3RvcnksIGV2ZW50QnVzKTtcclxuICAgICAgICB0aGlzLmFpSGl0UG9pbnRzID0gTUFYX0hQO1xyXG5cclxuICAgICAgICB0aGlzLmFpID0gbmV3IEFpKHRoaXMuYWlCb2FyZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlBsYXllck1vdmVtZW50RXZlbnRUeXBlLCAoZXZlbnQ6IFBsYXllck1vdmVtZW50RXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVQbGF5ZXJNb3ZlbWVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5Sb3dzRmlsbGVkRXZlbnRUeXBlLCAoZXZlbnQ6IFJvd3NGaWxsZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVJvd3NGaWxsZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5Sb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudFR5cGUsIChldmVudDogUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVSb3dDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkJvYXJkRmlsbGVkRXZlbnRUeXBlLCAoZXZlbnQ6IEJvYXJkRmlsbGVkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVCb2FyZEZpbGxlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5odW1hbkJvYXJkLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5haUJvYXJkLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5haS5zdGFydCgpO1xyXG4gICAgICAgIG5wY01hbmFnZXIuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogSW5zdGVhZCwgc3RhcnQgZ2FtZSB3aGVuIHBsYXllciBoaXRzIGEga2V5IGZpcnN0LlxyXG4gICAgICAgIHRoaXMuaHVtYW5Cb2FyZC5yZXNldEJvYXJkKCk7XHJcbiAgICAgICAgdGhpcy5haUJvYXJkLnJlc2V0Qm9hcmQoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuaHVtYW5Cb2FyZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuYWlCb2FyZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuc3RlcEJvYXJkcyhlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmFpLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgbnBjTWFuYWdlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcEJvYXJkcyhlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVBsYXllck1vdmVtZW50KGV2ZW50OiBQbGF5ZXJNb3ZlbWVudEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGJvYXJkID0gdGhpcy5kZXRlcm1pbmVCb2FyZEZvcihldmVudC5wbGF5ZXJUeXBlKTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChldmVudC5tb3ZlbWVudCkge1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LkxlZnQ6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5SaWdodDpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Eb3duOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlRG93bigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuRHJvcDpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZURvd25BbGxUaGVXYXkoKTtcclxuICAgICAgICAgICAgICAgIGJvYXJkLmhhbmRsZUVuZE9mQ3VycmVudFBpZWNlVGFza3MoKTsgLy8gUHJldmVudHMgYW55IG90aGVyIGtleXN0cm9rZXMgYWZmZWN0aW5nIHRoZSBzaGFwZSBhZnRlciBpdCBoaXRzIHRoZSBib3R0b20uXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Sb3RhdGVDbG9ja3dpc2U6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5yb3RhdGVTaGFwZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5oYW5kbGVkIG1vdmVtZW50Jyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2ZlciB0aGUgZmlsbGVkIHJvd3MgdG8gYmUganVuayByb3dzIG9uIHRoZSBvcHBvc2l0ZSBwbGF5ZXIncyBib2FyZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBoYW5kbGVSb3dzRmlsbGVkRXZlbnQoZXZlbnQ6IFJvd3NGaWxsZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBib2FyZCA9IHRoaXMuZGV0ZXJtaW5lQm9hcmRGb3JPcHBvc2l0ZU9mKGV2ZW50LnBsYXllclR5cGUpO1xyXG4gICAgICAgIGJvYXJkLmFkZEp1bmtSb3dzKGV2ZW50LmZpbGxlZFJvd0lkeHMubGVuZ3RoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVJvd0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQoZXZlbnQ6IFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGJvYXJkID0gdGhpcy5kZXRlcm1pbmVCb2FyZEZvcihldmVudC5wbGF5ZXJUeXBlKTtcclxuICAgICAgICBib2FyZC5oYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQyKGV2ZW50LmZpbGxlZFJvd0lkeHMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaHVtYW4ncyBib2FyZCBpZiBnaXZlbiB0aGUgaHVtYW4ncyB0eXBlLCBvciBBSSdzIGJvYXJkIGlmIGdpdmVuIHRoZSBBSS4gXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lQm9hcmRGb3IocGxheWVyVHlwZTogUGxheWVyVHlwZSk6IEJvYXJkIHtcclxuICAgICAgICBpZiAocGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5odW1hbkJvYXJkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFpQm9hcmQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgdGhpcyBtZXRob2QgaXMgZ2l2ZW4gXCJIdW1hblwiLCBpdCB3aWxsIHJldHVybiB0aGUgQUkncyBib2FyZCwgYW5kIHZpY2UgdmVyc2EuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lQm9hcmRGb3JPcHBvc2l0ZU9mKHBsYXllclR5cGU6IFBsYXllclR5cGUpOiBCb2FyZCB7XHJcbiAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWlCb2FyZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5odW1hbkJvYXJkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUJvYXJkRmlsbGVkRXZlbnQoZXZlbnQ6IEJvYXJkRmlsbGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgaHA6IG51bWJlcjtcclxuICAgICAgICBpZiAoZXZlbnQucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICBocCA9ICh0aGlzLmh1bWFuSGl0UG9pbnRzIC09IDEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhwID0gKHRoaXMuYWlIaXRQb2ludHMgLT0gMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEhwQ2hhbmdlZEV2ZW50KGhwLCBldmVudC5wbGF5ZXJUeXBlKSk7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFNlZSBpZiBvbmUgb2YgdGhlIHBsYXllcnMgaGFzIHJ1biBvdXQgb2YgSFAuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQuc3RhcnRpbmcgPT09IHRydWUgJiYgZXZlbnQucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5BaSkge1xyXG4gICAgICAgICAgICB0aGlzLmFpLnN0cmF0ZWdpemUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBOb3RoaW5nIGN1cnJlbnRseSBmb3IgdGhlIGh1bWFuJ3MgYm9hcmQgdG8gYmUgZG9pbmcgYXQgdGhpcyB0aW1lLlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgbW9kZWwgPSBuZXcgTW9kZWwoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5pbXBvcnQge05wY30gZnJvbSAnLi9ucGMnXHJcbmltcG9ydCB7TnBjU3RhdGV9IGZyb20gJy4uLy4uL2RvbWFpbi9ucGMtc3RhdGUnO1xyXG5pbXBvcnQge2V2ZW50QnVzLCBFdmVudFR5cGV9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvc3RhbmRlZS1tb3ZlbWVudC1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5cclxuLy8gU3RhcnRpbmcgcG9zaXRpb24gY291bnRzIHVzZWQgaW4gaW5pdGlhbGl6YXRpb24uXHJcbmNvbnN0IFRPVEFMX05QQ1MgPSAyMDtcclxuXHJcbmNsYXNzIE5wY01hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgbnBjczogTWFwPG51bWJlciwgTnBjPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm5wY3MgPSBuZXcgTWFwPG51bWJlciwgTnBjPigpO1xyXG4gICAgICAgIGZvciAobGV0IG5wY0lkeCA9IDA7IG5wY0lkeCA8IFRPVEFMX05QQ1M7IG5wY0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBucGMgPSBuZXcgTnBjKCk7XHJcbiAgICAgICAgICAgIHRoaXMubnBjcy5zZXQobnBjLmlkLCBucGMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGUsIChldmVudDogU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm5wY3MuZm9yRWFjaCgobnBjOiBOcGMpID0+IHtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSAoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSAoTWF0aC5yYW5kb20oKSAqIDE1KTtcclxuICAgICAgICAgICAgICAgIG5wYy5zdGFydCh4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogTW92ZSB0aGlzIGVsc2V3aGVyZTpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSAoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSAoTWF0aC5yYW5kb20oKSAqIDE1KTtcclxuICAgICAgICAgICAgICAgIG5wYy5iZWdpbldhbGtpbmdUbyh4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ucGNzLmZvckVhY2goKG5wYzogTnBjKSA9PiB7XHJcbiAgICAgICAgICAgIG5wYy5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChldmVudDogU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBucGMgPSB0aGlzLm5wY3MuZ2V0KGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBpZiAobnBjICE9IG51bGwpIHtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBldmVudC56O1xyXG4gICAgICAgICAgICAgICAgbnBjLnVwZGF0ZVBvc2l0aW9uKHgsIHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IChNYXRoLnJhbmRvbSgpICogNyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IChNYXRoLnJhbmRvbSgpICogMTUpO1xyXG4gICAgICAgICAgICAgICAgbnBjLmJlZ2luV2Fsa2luZ1RvKHgsIHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBucGNNYW5hZ2VyID0gbmV3IE5wY01hbmFnZXIoKTsiLCJpbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY01vdmVtZW50Q2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjU3RhdGV9IGZyb20gJy4uLy4uL2RvbWFpbi9ucGMtc3RhdGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wYyB7XHJcbiAgICByZWFkb25seSBpZDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGU6IE5wY1N0YXRlO1xyXG4gICAgcHJpdmF0ZSB0aW1lSW5TdGF0ZTogbnVtYmVyO1xyXG5cclxuICAgIC8vIFwiTGFzdFwiIGFzIGluIHRoZSBsYXN0IGtub3duIGNvb3JkaW5hdGUsIGJlY2F1c2UgaXQgY291bGQgYmUgY3VycmVudGx5IGluLW1vdGlvbi5cclxuICAgIHByaXZhdGUgeGxhc3Q6IG51bWJlcjtcclxuICAgIHByaXZhdGUgeWxhc3Q6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmlkID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0gTnBjU3RhdGUuSWRsZTtcclxuICAgICAgICB0aGlzLnRpbWVJblN0YXRlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy54bGFzdCA9IDA7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnhsYXN0ID0geDtcclxuICAgICAgICB0aGlzLnlsYXN0ID0geTtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBOcGNQbGFjZWRFdmVudCh0aGlzLmlkLCB0aGlzLnN0YXRlLCB4LCB5KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIHNob3VsZCBiZSBjYWxsZWQgYnkgdGhlIE5QQyBtYW5hZ2VyIHJhdGhlciB0aGFuIHRyYWNrcyB0aGF0IHJlZmVyZW5jZSB0aGVtLlxyXG4gICAgICovXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMudGltZUluU3RhdGUgKz0gZWxhcHNlZDtcclxuICAgIH1cclxuXHJcbiAgICB0cmFuc2l0aW9uVG8oc3RhdGU6IE5wY1N0YXRlKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMudGltZUluU3RhdGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGJlZ2luV2Fsa2luZ1RvKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQodGhpcy5pZCwgeCwgeSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2lnbmlmaWVzIHRoZSBlbmQgb2YgYSB3YWxrLlxyXG4gICAgICovXHJcbiAgICB1cGRhdGVQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueGxhc3QgPSB4O1xyXG4gICAgICAgIHRoaXMueWxhc3QgPSB5O1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvblRvKE5wY1N0YXRlLklkbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXRlKCk6IE5wY1N0YXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7c3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlfSBmcm9tICcuL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UnO1xyXG5cclxuY2xhc3MgUHJlbG9hZGVyIHtcclxuICAgIFxyXG4gICAgcHJlbG9hZChjYWxsYmFjazogKCkgPT4gYW55KSB7XHJcbiAgICAgICAgc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlLnByZWxvYWQoY2FsbGJhY2spO1xyXG4gICAgICAgIC8vIFRPRE86IEdvaW5nIHRvIGhhdmUgYSBwYXJhbGxlbGlzbSBtZWNoYW5pc20gYWZ0ZXIgYWRkaW5nIG1vcmUgdG8gdGhpcy5cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgcHJlbG9hZGVyID0gbmV3IFByZWxvYWRlcigpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmNvbnN0IEFTUEVDVF9SQVRJTyA9IDE2Lzk7XHJcblxyXG5jbGFzcyBDYW1lcmFXcmFwcGVyIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgY2FtZXJhOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNjAsIEFTUEVDVF9SQVRJTywgMC4xLCAxMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVSZW5kZXJlclNpemUocmVuZGVyZXI6IGFueSkge1xyXG4gICAgICAgIGxldCB3aW5kb3dBc3BlY3RSYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIGxldCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcjtcclxuICAgICAgICBpZiAod2luZG93QXNwZWN0UmF0aW8gPiBBU1BFQ1RfUkFUSU8pIHtcclxuICAgICAgICAgICAgLy8gVG9vIHdpZGU7IHNjYWxlIG9mZiBvZiB3aW5kb3cgaGVpZ2h0LlxyXG4gICAgICAgICAgICB3aWR0aCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVySGVpZ2h0ICogQVNQRUNUX1JBVElPKTtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93QXNwZWN0UmF0aW8gPD0gQVNQRUNUX1JBVElPKSB7XHJcbiAgICAgICAgICAgIC8vIFRvbyBuYXJyb3cgb3IganVzdCByaWdodDsgc2NhbGUgb2ZmIG9mIHdpbmRvdyB3aWR0aC5cclxuICAgICAgICAgICAgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJXaWR0aCAvIEFTUEVDVF9SQVRJTyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIC8vIFNob3VsZCBiZSBubyBuZWVkIHRvIHVwZGF0ZSBhc3BlY3QgcmF0aW8gYmVjYXVzZSBpdCBzaG91bGQgYmUgY29uc3RhbnQuXHJcbiAgICAgICAgLy8gdGhpcy5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgbG9va0F0KHZlYzM6IGFueSkge1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tBdCh2ZWMzKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgY2FtZXJhV3JhcHBlciA9IG5ldyBDYW1lcmFXcmFwcGVyKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1aWxkaW5nIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgc2xhYjogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgb2xkIHBsYWluIGN1YmUuXHJcbiAgICAgICAgLy8gbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDExLCAyMCwgMTApO1xyXG4gICAgICAgIC8vIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtjb2xvcjogMHhmZmZmZmZ9KTtcclxuICAgICAgICAvLyB0aGlzLnNsYWIgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIC8vIHRoaXMuc2xhYi5wb3NpdGlvbi5zZXQoNC41LCAxMCwgLTUuOCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogTW92ZSB0aGlzIGludG8gYSBsb2FkZXJcclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGxldCBtdGxMb2FkZXIgPSBuZXcgVEhSRUUuTVRMTG9hZGVyKCk7XHJcbiAgICAgICAgbXRsTG9hZGVyLnNldFBhdGgoJycpO1xyXG4gICAgICAgIG10bExvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5tdGwnLCAobWF0ZXJpYWxzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgbWF0ZXJpYWxzLnByZWxvYWQoKTtcclxuICAgICAgICAgICAgbGV0IG9iakxvYWRlciA9IG5ldyBUSFJFRS5PQkpMb2FkZXIoKTtcclxuICAgICAgICAgICAgb2JqTG9hZGVyLnNldE1hdGVyaWFscyhtYXRlcmlhbHMpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIuc2V0UGF0aCgnJyk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5vYmonLCAob2JqOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIG9iai5zY2FsZS5zZXRTY2FsYXIoMC4yNSk7XHJcbiAgICAgICAgICAgICAgICBvYmoucG9zaXRpb24uc2V0KDUsIC0wLjAxLCAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXAuYWRkKG9iaik7XHJcbiAgICAgICAgICAgIH0sICgpID0+IHsgfSwgKCkgPT4geyBjb25zb2xlLmxvZygnZXJyb3Igd2hpbGUgbG9hZGluZyA6KCcpIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuaW1wb3J0IHtIcE9yaWVudGF0aW9ufSBmcm9tICcuLi8uLi9kb21haW4vaHAtb3JpZW50YXRpb24nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEhwUGFuZWxzIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgcGFuZWxzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgaHBPcmllbnRhdGlvbjogSHBPcmllbnRhdGlvbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihocE9yaWVudGF0aW9uOiBIcE9yaWVudGF0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGFuZWxzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgUEFORUxfQ09VTlRfUEVSX0ZMT09SOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgwLjYsIDAuNik7XHJcbiAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCgpO1xyXG4gICAgICAgICAgICBsZXQgcGFuZWwgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBsZXQgeCA9IGlkeDtcclxuICAgICAgICAgICAgbGV0IHkgPSAwO1xyXG4gICAgICAgICAgICBsZXQgeiA9IDA7XHJcbiAgICAgICAgICAgIHBhbmVsLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogTWFrZSB0aGlzIHB1bHNlIGF0IGFsbD9cclxuICAgICAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KDB4ZmZmZmZmKTtcclxuICAgICAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmVJbnRlbnNpdHkgPSAwLjI1O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wYW5lbHMucHVzaChwYW5lbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmhwT3JpZW50YXRpb24gPSBocE9yaWVudGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IHBhbmVsIG9mIHRoaXMucGFuZWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAuYWRkKHBhbmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0byBmaXQgYWdhaW5zdCBidWlsZGluZy5cclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCgxLjg1LCAzLjU1LCAtMS41KTtcclxuICAgICAgICB0aGlzLmdyb3VwLnNjYWxlLnNldCgwLjcsIDEuOSwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlSHAoUEFORUxfQ09VTlRfUEVSX0ZMT09SKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIUCBiYXIgY2FuIGdvIGZyb20gcmlnaHQtdG8tbGVmdCBvciBsZWZ0LXRvLXJpZ2h0LCBsaWtlIGEgZmlnaHRpbmcgZ2FtZSBIUCBiYXIuXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUhwKGhwOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoaHAgPiBQQU5FTF9DT1VOVF9QRVJfRkxPT1IpIHtcclxuICAgICAgICAgICAgaHAgPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCB0aGlzLnBhbmVscy5sZW5ndGg7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYW5lbCA9IHRoaXMucGFuZWxzW2lkeF07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhwT3JpZW50YXRpb24gPT09IEhwT3JpZW50YXRpb24uRGVjcmVhc2VzUmlnaHRUb0xlZnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpZHggPCBocCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaWR4ID49IFBBTkVMX0NPVU5UX1BFUl9GTE9PUiAtIGhwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVE9ETzogSGFuZGxlIHVwZGF0ZSB0byBIUCA9IGZ1bGwgYXMgZGlmZmVyZW50IGZyb20gSFAgPCBmdWxsLlxyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7Um93Q2xlYXJEaXJlY3Rpb259IGZyb20gJy4uLy4uL2RvbWFpbi9yb3ctY2xlYXItZGlyZWN0aW9uJztcclxuXHJcbmNvbnN0IENVUlRBSU5fV0lEVEggPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7XHJcblxyXG5jbGFzcyBDdXJ0YWluVmVydGV4UG9zaXRpb24ge1xyXG4gICAgeCA9IDA7XHJcbiAgICBlbGFwc2VkID0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNvbWUgbm90ZXMgb24gdmVydGljZXMgd2l0aGluIHRoZSBtZXNoIHdpdGhvdXQgbW9kaWZpY2F0aW9uczpcclxuICogVmVydGljZXMgMSBhbmQgMyBzaG91bGQgaGF2ZSB4ID0gLUNVUlRBSU5fV0lEVEggLyAyXHJcbiAqIFZlcnRpY2VzIDAgYW5kIDIgc2hvdWxkIGhhdmUgeCA9ICBDVVJUQUlOX1dJRFRIIC8gMlxyXG4gKiBcclxuICogRXhhbXBsZSBzdGF0ZW1lbnRzOlxyXG4gKiBjb25zb2xlLmxvZygndmVydGljZXMgMSBhbmQgMyB4OiAnICsgdGhpcy5jdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzFdLngsIHRoaXMuY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1szXS54KTtcclxuICogY29uc29sZS5sb2coJ3ZlcnRpY2VzIDAgYW5kIDIgeDogJyArIHRoaXMuY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1swXS54LCB0aGlzLmN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMl0ueCk7XHJcbiAqIGNvbnNvbGUubG9nKCctLS0nKTtcclxuICovXHJcbmV4cG9ydCBjbGFzcyBKdW5rUm93Q3VydGFpbiB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJvd0NsZWFyRGlyZWN0aW9uOiBSb3dDbGVhckRpcmVjdGlvbjtcclxuXHJcbiAgICBwcml2YXRlIGN1cnRhaW46IGFueTtcclxuICAgIHByaXZhdGUgY3VydGFpblZlcnRleFBvc2l0aW9uOiBDdXJ0YWluVmVydGV4UG9zaXRpb247XHJcbiAgICBwcml2YXRlIHB1bGxDdXJ0YWluVHdlZW46IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb3dDbGVhckRpcmVjdGlvbjogUm93Q2xlYXJEaXJlY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIHRoaXMucm93Q2xlYXJEaXJlY3Rpb24gPSByb3dDbGVhckRpcmVjdGlvbjtcclxuXHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoQ1VSVEFJTl9XSURUSCwgMSk7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtjb2xvcjogMHgxMDEwMzB9KTsgLy8gTWlkbmlnaHQgQmx1ZVxyXG4gICAgICAgIHRoaXMuY3VydGFpbiA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uID0gbmV3IEN1cnRhaW5WZXJ0ZXhQb3NpdGlvbigpO1xyXG4gICAgICAgIHRoaXMucHVsbEN1cnRhaW5Ud2VlbiA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5jdXJ0YWluKTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIGdyb3VwIHRvIGZpdCBhZ2FpbnN0IGJ1aWxkaW5nLlxyXG4gICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24uc2V0KDUuMCwgNC43NSwgLTEuNDUxKTtcclxuICAgICAgICB0aGlzLmdyb3VwLnNjYWxlLnNldCgwLjcsIDEuMCwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMuY3VydGFpbi52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5wdWxsQ3VydGFpblR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24uZWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLnB1bGxDdXJ0YWluVHdlZW4udXBkYXRlKHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLmVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGFydEFuaW1hdGlvbihyb3dDb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gUHJldmVudCBtdWx0aXBsZSBhbmltYXRpb25zIGF0IHRoZSBzYW1lIHRpbWUuXHJcbiAgICAgICAgaWYgKHRoaXMucHVsbEN1cnRhaW5Ud2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZHJvcEN1cnRhaW4ocm93Q291bnQpO1xyXG5cclxuICAgICAgICBsZXQgeGVuZDogbnVtYmVyO1xyXG4gICAgICAgIGlmICh0aGlzLnJvd0NsZWFyRGlyZWN0aW9uID09PSBSb3dDbGVhckRpcmVjdGlvbi5MZWZ0VG9SaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54ID0gLUNVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICB4ZW5kID0gQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24ueCA9ICBDVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICAgICAgeGVuZCA9IC1DVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24uZWxhcHNlZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMucHVsbEN1cnRhaW5Ud2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbilcclxuICAgICAgICAgICAgLnRvKHt4OiB4ZW5kfSwgMzMzKVxyXG4gICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5RdWFydGljLkluT3V0KVxyXG4gICAgICAgICAgICAub25VcGRhdGUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkeDE6IG51bWJlciwgaWR4MjogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucm93Q2xlYXJEaXJlY3Rpb24gPT09IFJvd0NsZWFyRGlyZWN0aW9uLkxlZnRUb1JpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4MSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4MiA9IDI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDEgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDIgPSAzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzW2lkeDFdLnggPSB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzW2lkeDJdLnggPSB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IHsgdGhpcy5jb21wbGV0ZUFuaW1hdGlvbigpOyB9KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24uZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQb3NpdGlvbiBhbmQgc2NhbGUgdGhlIGN1cnRhaW4gc28gdGhhdCBpdCBjb3ZlcnMgWCBmbG9vcnMgYXQgdGhlIGJvdHRvbS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkcm9wQ3VydGFpbihyb3dDb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gU2VlIG5vdGUgYXQgdG9wIGFib3V0IHdoeSB0aGVzZSBhcmUgd2hlcmUgdGhleSBhcmUuXHJcbiAgICAgICAgdGhpcy5jdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzBdLnggPSAtQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgdGhpcy5jdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzFdLnggPSAgQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgdGhpcy5jdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzJdLnggPSAtQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgdGhpcy5jdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzNdLnggPSAgQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgdGhpcy5jdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmIChyb3dDb3VudCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW4ucG9zaXRpb24uc2V0KDAsIDAsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW4uc2NhbGUuc2V0KDEsIDEsIDEpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm93Q291bnQgPT09IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluLnBvc2l0aW9uLnNldCgwLCAwLjUsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW4uc2NhbGUuc2V0KDEsIDIsIDEpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm93Q291bnQgPT09IDMpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluLnBvc2l0aW9uLnNldCgwLCAxLCAwKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluLnNjYWxlLnNldCgxLCAzLCAxKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJvd0NvdW50ID09PSA0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydGFpbi5wb3NpdGlvbi5zZXQoMCwgMS41LCAwKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluLnNjYWxlLnNldCgxLCA0LCAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY3VydGFpbi52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbXBsZXRlQW5pbWF0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY3VydGFpbi52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wdWxsQ3VydGFpblR3ZWVuID0gbnVsbDtcclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuZGVjbGFyZSBjb25zdCBUV0VFTjogYW55O1xyXG5cclxuaW1wb3J0IHtCdWlsZGluZ30gZnJvbSAnLi9idWlsZGluZyc7XHJcbmltcG9ydCB7SnVua1Jvd0N1cnRhaW59IGZyb20gJy4vanVuay1yb3ctY3VydGFpbic7XHJcbmltcG9ydCB7SHBQYW5lbHN9IGZyb20gJy4vaHAtcGFuZWxzJztcclxuaW1wb3J0IHtIcE9yaWVudGF0aW9ufSBmcm9tICcuLi8uLi9kb21haW4vaHAtb3JpZW50YXRpb24nO1xyXG5pbXBvcnQge1Jvd0NsZWFyRGlyZWN0aW9ufSBmcm9tICcuLi8uLi9kb21haW4vcm93LWNsZWFyLWRpcmVjdGlvbic7XHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuXHJcbi8vIFRPRE86IE9ubHkgdGhlIDNyZCBmbG9vciBmcm9tIHRoZSB0b3AgYW5kIGJlbG93IGFyZSB2aXNpYmxlLiBBbHNvLCBzZWUgYm9hcmQudHMuXHJcbmV4cG9ydCBjb25zdCBGTE9PUl9DT1VOVCA9IDE3O1xyXG5cclxuY29uc3QgQUNUSVZFX1NIQVBFX0xJR0hUX0NPVU5UID0gNDtcclxuY29uc3QgUEFORUxfU0laRSA9IDAuNztcclxuXHJcbmNsYXNzIEVtaXNzaXZlSW50ZW5zaXR5IHtcclxuICAgIHZhbHVlOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaWdodGluZ0dyaWQge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgcGFuZWxHcm91cDogYW55O1xyXG4gICAgcHJpdmF0ZSBidWlsZGluZzogQnVpbGRpbmc7XHJcbiAgICBwcml2YXRlIGp1bmtSb3dDdXJ0YWluOiBKdW5rUm93Q3VydGFpbjtcclxuICAgIHByaXZhdGUgaHBQYW5lbHM6IEhwUGFuZWxzO1xyXG5cclxuICAgIHByaXZhdGUgcGFuZWxzOiBhbnlbXVtdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHNoYXBlTGlnaHRzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgY3VycmVudFNoYXBlTGlnaHRJZHg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgaGlnaGxpZ2h0ZXI6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHB1bHNlVHdlZW46IGFueTtcclxuICAgIHByaXZhdGUgcHVsc2VUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZW1pc3NpdmVJbnRlbnNpdHk6IEVtaXNzaXZlSW50ZW5zaXR5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhwT3JpZW50YXRpb246IEhwT3JpZW50YXRpb24sIHJvd0NsZWFyRGlyZWN0aW9uOiBSb3dDbGVhckRpcmVjdGlvbikge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYW5lbEdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcbiAgICAgICAgdGhpcy5idWlsZGluZyA9IG5ldyBCdWlsZGluZygpO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0N1cnRhaW4gPSBuZXcgSnVua1Jvd0N1cnRhaW4ocm93Q2xlYXJEaXJlY3Rpb24pO1xyXG4gICAgICAgIHRoaXMuaHBQYW5lbHMgPSBuZXcgSHBQYW5lbHMoaHBPcmllbnRhdGlvbik7XHJcblxyXG4gICAgICAgIHRoaXMucGFuZWxzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZmxvb3JJZHggPSAwOyBmbG9vcklkeCA8IEZMT09SX0NPVU5UOyBmbG9vcklkeCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFuZWxzW2Zsb29ySWR4XSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbElkeCA9IDA7IHBhbmVsSWR4IDwgUEFORUxfQ09VTlRfUEVSX0ZMT09SOyBwYW5lbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShQQU5FTF9TSVpFLCBQQU5FTF9TSVpFKTsgLy8gVE9ETzogY2xvbmUoKSA/XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe2VtaXNzaXZlSW50ZW5zaXR5OiAxLjB9KTtcclxuICAgICAgICAgICAgICAgIGxldCBwYW5lbCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBwYW5lbElkeDtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gZmxvb3JJZHggKyAxOyAvLyBPZmZzZXQgdXAgMSBiZWNhdXNlIGdyb3VuZCBpcyB5ID0gMC5cclxuICAgICAgICAgICAgICAgIGxldCB6ID0gMDtcclxuICAgICAgICAgICAgICAgIHBhbmVsLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhbmVsc1tmbG9vcklkeF1bcGFuZWxJZHhdID0gcGFuZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2hhcGVMaWdodHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBjb3VudCA9IDA7IGNvdW50IDwgQUNUSVZFX1NIQVBFX0xJR0hUX0NPVU5UOyBjb3VudCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KFBBTkVMX1NJWkUsIFBBTkVMX1NJWkUpO1xyXG4gICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe2VtaXNzaXZlSW50ZW5zaXR5OiAxLjB9KTtcclxuICAgICAgICAgICAgbGV0IHNoYXBlTGlnaHQgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICB0aGlzLnNoYXBlTGlnaHRzLnB1c2goc2hhcGVMaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlTGlnaHRJZHggPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmhpZ2hsaWdodGVyID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmZjAwZmYsIDMuNSwgMyk7XHJcblxyXG4gICAgICAgIHRoaXMucHVsc2VUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5lbWlzc2l2ZUludGVuc2l0eSA9IG5ldyBFbWlzc2l2ZUludGVuc2l0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuYnVpbGRpbmcuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuanVua1Jvd0N1cnRhaW4uZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuaHBQYW5lbHMuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMucGFuZWxHcm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRpbmcuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmp1bmtSb3dDdXJ0YWluLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5ocFBhbmVscy5zdGFydCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBmbG9vciBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiBmbG9vcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYW5lbEdyb3VwLmFkZChwYW5lbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHNoYXBlTGlnaHQgb2YgdGhpcy5zaGFwZUxpZ2h0cykge1xyXG4gICAgICAgICAgICB0aGlzLnBhbmVsR3JvdXAuYWRkKHNoYXBlTGlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wYW5lbEdyb3VwLmFkZCh0aGlzLmhpZ2hsaWdodGVyKTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRvIGZpdCBhZ2FpbnN0IGJ1aWxkaW5nLlxyXG4gICAgICAgIHRoaXMucGFuZWxHcm91cC5wb3NpdGlvbi5zZXQoMS44NSwgMy44LCAtMS41NSk7XHJcbiAgICAgICAgdGhpcy5wYW5lbEdyb3VwLnNjYWxlLnNldCgwLjcsIDEuMCwgMSk7XHJcblxyXG4gICAgICAgIC8vIE1ha2UgY2VsbHMgYXBwZWFyIHRvIHB1bHNlLlxyXG4gICAgICAgIHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkudmFsdWUgPSAwLjMzO1xyXG4gICAgICAgIHRoaXMucHVsc2VUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMucHVsc2VUd2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmVtaXNzaXZlSW50ZW5zaXR5KVxyXG4gICAgICAgICAgICAudG8oe3ZhbHVlOiAxLjB9LCA3NTApXHJcbiAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLlNpbnVzb2lkYWwuSW5PdXQpXHJcbiAgICAgICAgICAgIC55b3lvKHRydWUpXHJcbiAgICAgICAgICAgIC5yZXBlYXQoSW5maW5pdHkpXHJcbiAgICAgICAgICAgIC5zdGFydCh0aGlzLnB1bHNlVHdlZW5FbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RlcFB1bHNlKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0N1cnRhaW4uc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmhwUGFuZWxzLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoUm9vbU9mZihmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHBhbmVsID0gdGhpcy5wYW5lbHNbZmxvb3JJZHhdW3BhbmVsSWR4XTtcclxuICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoUm9vbU9uKGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIsIGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcGFuZWwgPSB0aGlzLnBhbmVsc1tmbG9vcklkeF1bcGFuZWxJZHhdO1xyXG4gICAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHBhbmVsLm1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvcik7XHJcbiAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KGNvbG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBzZW5kQWN0aXZlU2hhcGVMaWdodFRvKGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIsIGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgc2hhcGVMaWdodCA9IHRoaXMuZ2V0TmV4dFNoYXBlTGlnaHQoKTtcclxuICAgICAgICBzaGFwZUxpZ2h0Lm1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvcik7XHJcbiAgICAgICAgc2hhcGVMaWdodC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoY29sb3IpO1xyXG5cclxuICAgICAgICAvLyBEbyBub3QgbGlnaHQgaWYgaGlnaGVyIHRoYW4gdGhlIGhpZ2hlc3QgKnZpc2libGUqIGZsb29yLlxyXG4gICAgICAgIGlmIChmbG9vcklkeCA+PSBGTE9PUl9DT1VOVCkge1xyXG4gICAgICAgICAgICBzaGFwZUxpZ2h0LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzaGFwZUxpZ2h0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHggPSBwYW5lbElkeDtcclxuICAgICAgICBsZXQgeSA9IGZsb29ySWR4ICsgMTsgLy8gT2Zmc2V0IHVwIDEgYmVjYXVzZSBncm91bmQgaXMgeSA9IDAuXHJcbiAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgIHNoYXBlTGlnaHQucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFjdGl2ZVNoYXBlTGlnaHRQb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oaWdobGlnaHRlci5wb3NpdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBzZW5kSGlnaGxpZ2h0ZXJUbyhmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyLCBjb2xvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gRG8gbm90IGxpZ2h0IGlmIGhpZ2hlciB0aGFuIHRoZSBoaWdoZXN0ICp2aXNpYmxlKiBmbG9vci5cclxuICAgICAgICBpZiAoZmxvb3JJZHggPj0gRkxPT1JfQ09VTlQpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlci52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlci52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlci5jb2xvci5zZXRIZXgoY29sb3IpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHggPSBwYW5lbElkeDtcclxuICAgICAgICBsZXQgeSA9IGZsb29ySWR4ICsgMTsgLy8gT2Zmc2V0IHVwIDEgYmVjYXVzZSBncm91bmQgaXMgeSA9IDAuXHJcbiAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUhwKGhwOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmhwUGFuZWxzLnVwZGF0ZUhwKGhwKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydEp1bmtSb3dDdXJ0YWluQW5pbWF0aW9uKHJvd0NvdW50OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmp1bmtSb3dDdXJ0YWluLnN0YXJ0QW5pbWF0aW9uKHJvd0NvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRTaGFwZUxpZ2h0KCkge1xyXG4gICAgICAgIGxldCBzaGFwZUxpZ2h0ID0gdGhpcy5zaGFwZUxpZ2h0c1t0aGlzLmN1cnJlbnRTaGFwZUxpZ2h0SWR4XTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZUxpZ2h0SWR4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFNoYXBlTGlnaHRJZHggPj0gQUNUSVZFX1NIQVBFX0xJR0hUX0NPVU5UKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlTGlnaHRJZHggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2hhcGVMaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBQdWxzZShlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5wdWxzZVR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLnB1bHNlVHdlZW4udXBkYXRlKHRoaXMucHVsc2VUd2VlbkVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBmbG9vciBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiBmbG9vcikge1xyXG4gICAgICAgICAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmVJbnRlbnNpdHkgPSB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGxDaGFuZ2VFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvY2VsbC1jaGFuZ2UtZXZlbnQnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9hY3RpdmUtc2hhcGUtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7SHBDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NGaWxsZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvcm93cy1maWxsZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9yb3dzLWNsZWFyLWFuaW1hdGlvbi1jb21wbGV0ZWQtZXZlbnQnO1xyXG5pbXBvcnQge0xpZ2h0aW5nR3JpZCwgRkxPT1JfQ09VTlR9IGZyb20gJy4vbGlnaHRpbmctZ3JpZCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7Q2VsbE9mZnNldH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uLy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgU3dpdGNoYm9hcmQge1xyXG5cclxuICAgIHByaXZhdGUgbGlnaHRpbmdHcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IobGlnaHRpbmdHcmlkOiBMaWdodGluZ0dyaWQsIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZCA9IGxpZ2h0aW5nR3JpZDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5DZWxsQ2hhbmdlRXZlbnRUeXBlLCAoZXZlbnQ6IENlbGxDaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUNlbGxDaGFuZ2VFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlJvd3NGaWxsZWRFdmVudFR5cGUsIChldmVudDogUm93c0ZpbGxlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZVJvd0NsZWFyaW5nKGV2ZW50LmZpbGxlZFJvd0lkeHMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlSnVua1Jvd0FkZGluZyhldmVudC5maWxsZWRSb3dJZHhzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkhwQ2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBIcENoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUhwQ2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KGV2ZW50OiBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBmbG9vcklkeCA9IHRoaXMuY29udmVydFJvd1RvRmxvb3IoZXZlbnQuc2hhcGUuZ2V0Um93KCkpO1xyXG4gICAgICAgIGxldCBwYW5lbElkeCA9IGV2ZW50LnNoYXBlLmdldENvbCgpO1xyXG4gICAgICAgIGxldCBjb2xvciA9IHRoaXMuY29udmVydENvbG9yKGV2ZW50LnNoYXBlLmNvbG9yKTtcclxuXHJcbiAgICAgICAgbGV0IHlUb3RhbE9mZnNldCA9IDA7XHJcbiAgICAgICAgbGV0IHhUb3RhbE9mZnNldCA9IDA7XHJcbiAgICAgICAgbGV0IG9mZnNldHMgPSBldmVudC5zaGFwZS5nZXRPZmZzZXRzKCk7XHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIG9mZnNldHMpIHtcclxuICAgICAgICAgICAgbGV0IG9mZnNldEZsb29ySWR4ID0gZmxvb3JJZHggLSBvZmZzZXQueTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldFBhbmVsSWR4ID0gcGFuZWxJZHggKyBvZmZzZXQueDtcclxuICAgICAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc2VuZEFjdGl2ZVNoYXBlTGlnaHRUbyhvZmZzZXRGbG9vcklkeCwgb2Zmc2V0UGFuZWxJZHgsIGNvbG9yKTtcclxuXHJcbiAgICAgICAgICAgIHlUb3RhbE9mZnNldCArPSBvZmZzZXQueTtcclxuICAgICAgICAgICAgeFRvdGFsT2Zmc2V0ICs9IG9mZnNldC54O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHlvZmYgPSAoeVRvdGFsT2Zmc2V0IC8gb2Zmc2V0cy5sZW5ndGgpIC0gMjtcclxuICAgICAgICBsZXQgeG9mZiA9IHhUb3RhbE9mZnNldCAvIG9mZnNldHMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnNlbmRIaWdobGlnaHRlclRvKGZsb29ySWR4ICsgeW9mZiwgcGFuZWxJZHggKyB4b2ZmLCBjb2xvcik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgbGV0IGFjdGl2ZVNoYXBlTGlnaHRQb3NpdGlvbiA9IHRoaXMubGlnaHRpbmdHcmlkLmdldEFjdGl2ZVNoYXBlTGlnaHRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBIYXZlIHRoZSBjYW1lcmEgbG9vayBhdCB0aGlzP1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNlbGxDaGFuZ2VFdmVudChldmVudDogQ2VsbENoYW5nZUV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGZsb29ySWR4ID0gdGhpcy5jb252ZXJ0Um93VG9GbG9vcihldmVudC5yb3cpO1xyXG4gICAgICAgIGlmIChmbG9vcklkeCA+PSBGTE9PUl9DT1VOVCkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIFNraXAgb2JzdHJ1Y3RlZCBmbG9vcnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwYW5lbElkeCA9IGV2ZW50LmNvbDtcclxuICAgICAgICBpZiAoZXZlbnQuY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zd2l0Y2hSb29tT2ZmKGZsb29ySWR4LCBwYW5lbElkeCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IGNvbG9yID0gdGhpcy5jb252ZXJ0Q29sb3IoZXZlbnQuY2VsbC5nZXRDb2xvcigpKTtcclxuICAgICAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc3dpdGNoUm9vbU9uKGZsb29ySWR4LCBwYW5lbElkeCwgY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFuaW1hdGVSb3dDbGVhcmluZyhmaWxsZWRSb3dJZHhzOiBudW1iZXJbXSkge1xyXG4gICAgICAgIC8vIFRPRE86IERvIGl0XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KGZpbGxlZFJvd0lkeHMsIHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgICAgIH0sIDEpOyAvLyBUT0RPOiBBY3R1YWxseSBkbyB0aGUgYW5pbWF0aW9uLlxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtZW1iZXIgdGhhdCB0aGUganVuayByb3dzIGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkIG9uIHRoZSBib2FyZC5cclxuICAgICAqIFxyXG4gICAgICogRG8gbm90IG5lZWQgdG8gZmlyZSBhbiBldmVudCBhdCB0aGUgZW5kIG9mIHRoaXMgYW5pbWF0aW9uIGJlY2F1c2UgdGhlIGJvYXJkXHJcbiAgICAgKiBkb2VzIG5vdCBuZWVkIHRvIGxpc3RlbiBmb3IgaXQgKGl0IGxpc3RlbnMgZm9yIHRoZSBjbGVhcmluZyBhbmltYXRpb24gaW5zdGVhZCkuXHJcbiAgICAqL1xyXG4gICAgcHJpdmF0ZSBhbmltYXRlSnVua1Jvd0FkZGluZyhqdW5rUm93Q291bnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnN0YXJ0SnVua1Jvd0N1cnRhaW5BbmltYXRpb24oanVua1Jvd0NvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUhwQ2hhbmdlZEV2ZW50KGV2ZW50OiBIcENoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnVwZGF0ZUhwKGV2ZW50LmhwKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgY2VsbCByb3cvY29sIGNvb3JkaW5hdGVzIHRvIGZsb29yL3BhbmVsIGNvb3JkaW5hdGVzLlxyXG4gICAgICogQWNjb3VudCBmb3IgdGhlIHR3byBmbG9vcnMgdGhhdCBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuICg/KVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbnZlcnRSb3dUb0Zsb29yKHJvdzogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHRoaW5nID0gKEZMT09SX0NPVU5UIC0gcm93KSArIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29udmVydENvbG9yKGNvbG9yOiBDb2xvcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBudW1iZXI7XHJcbiAgICAgICAgc3dpdGNoIChjb2xvcikge1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkN5YW46XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4MzNjY2NjO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuWWVsbG93OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGZmZmY1NTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLlB1cnBsZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhhMDIwYTA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5HcmVlbjpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgyMGEwMjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5SZWQ6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmYzMzMzO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuQmx1ZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHg0NDQ0Y2M7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5PcmFuZ2U6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZWVkNTMwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuV2hpdGU6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vIERlZmF1bHQgb3IgbWlzc2luZyBjYXNlIGlzIGJsYWNrLlxyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkVtcHR5OlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDAwMDAwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG4vLyBEaW1lbnNpb25zIG9mIHRoZSBlbnRpcmUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVTSEVFVF9XSURUSCAgID0gMjU2O1xyXG5leHBvcnQgY29uc3QgU1BSSVRFU0hFRVRfSEVJR0hUICA9IDUxMjtcclxuXHJcbi8vIERpbWVuc2lvbnMgb2Ygb25lIGZyYW1lIHdpdGhpbiB0aGUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9XSURUSCAgID0gNDg7XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9IRUlHSFQgID0gNzI7XHJcblxyXG5jb25zdCBUT1RBTF9ESUZGRVJFTlRfVEVYVFVSRVMgPSAzO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlciB7XHJcblxyXG4gICAgcmVhZG9ubHkgdGV4dHVyZTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRleHR1cmU6IGFueSkge1xyXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZSB7XHJcblxyXG4gICAgcHJpdmF0ZSB0ZXh0dXJlczogYW55W107XHJcbiAgICBwcml2YXRlIGxvYWRlZENvdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRUZXh0dXJlSWR4OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMubG9hZGVkQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoY2FsbGJhY2s6ICgpID0+IGFueSkge1xyXG4gICAgICAgIGxldCB0ZXh0dXJlTG9hZGVkSGFuZGxlciA9ICh0ZXh0dXJlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgLy8gSGF2ZSBpdCBzaG93IG9ubHkgb25lIGZyYW1lIGF0IGEgdGltZTpcclxuICAgICAgICAgICAgdGV4dHVyZS5yZXBlYXQuc2V0KFxyXG4gICAgICAgICAgICAgICAgRlJBTUVfV0lEVEggIC8gU1BSSVRFU0hFRVRfV0lEVEgsXHJcbiAgICAgICAgICAgICAgICBGUkFNRV9IRUlHSFQgLyBTUFJJVEVTSEVFVF9IRUlHSFRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlcy5wdXNoKHRleHR1cmUpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRlZENvdW50Kys7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxvYWRlZENvdW50ID49IFRPVEFMX0RJRkZFUkVOVF9URVhUVVJFUykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRleHR1cmVMb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgICAgIHRleHR1cmVMb2FkZXIubG9hZCgnZmFsbC1zdHVkZW50LnBuZycsIHRleHR1cmVMb2FkZWRIYW5kbGVyKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudDIucG5nJywgdGV4dHVyZUxvYWRlZEhhbmRsZXIpO1xyXG4gICAgICAgIHRleHR1cmVMb2FkZXIubG9hZCgnZmFsbC1zdHVkZW50My5wbmcnLCB0ZXh0dXJlTG9hZGVkSGFuZGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgbmV3SW5zdGFuY2UoKTogU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyIHtcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5nZXROZXh0VGV4dHVyZUlkeCgpO1xyXG4gICAgICAgIGxldCB0ZXh0dXJlID0gdGhpcy50ZXh0dXJlc1tpZHhdLmNsb25lKCk7IC8vIENsb25pbmcgdGV4dHVyZXMgaW4gdGhlIHZlcnNpb24gb2YgVGhyZWVKUyB0aGF0IEkgYW0gY3VycmVudGx5IHVzaW5nIHdpbGwgZHVwbGljYXRlIHRoZW0gOihcclxuICAgICAgICByZXR1cm4gbmV3IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcih0ZXh0dXJlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRUZXh0dXJlSWR4KCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHgrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50VGV4dHVyZUlkeCA+PSBUT1RBTF9ESUZGRVJFTlRfVEVYVFVSRVMpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGV4dHVyZUlkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRUZXh0dXJlSWR4O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UgPSBuZXcgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtTdGFuZGVlfSBmcm9tICcuL3N0YW5kZWUnO1xyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY01vdmVtZW50Q2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudCc7XHJcblxyXG5jb25zdCBZX09GRlNFVCA9IDAuNzU7IC8vIFNldHMgdGhlaXIgZmVldCBvbiB0aGUgZ3JvdW5kIHBsYW5lLlxyXG5cclxuY2xhc3MgU3RhbmRlZU1hbmFnZXIge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFuZGVlczogTWFwPG51bWJlciwgU3RhbmRlZT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YW5kZWVzID0gbmV3IE1hcDxudW1iZXIsIFN0YW5kZWU+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXRZKFlfT0ZGU0VUKTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY1BsYWNlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNQbGFjZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY1BsYWNlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RhbmRlZXMuZm9yRWFjaCgoc3RhbmRlZTogU3RhbmRlZSkgPT4ge1xyXG4gICAgICAgICAgICBzdGFuZGVlLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOcGNQbGFjZWRFdmVudChldmVudDogTnBjUGxhY2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IG5ldyBTdGFuZGVlKGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBzdGFuZGVlLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQoc3RhbmRlZS5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5zdGFuZGVlcy5zZXQoc3RhbmRlZS5ucGNJZCwgc3RhbmRlZSk7XHJcblxyXG4gICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Jbml0aWFsUG9zaXRpb24oc3RhbmRlZSwgeCwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtb3ZlVG9Jbml0aWFsUG9zaXRpb24oc3RhbmRlZTogU3RhbmRlZSwgeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICAvLyBUT0RPOiBVc2UgZXZlbnQueCwgZXZlbnQueSB3aXRoIHNjYWxpbmcgdG8gZGV0ZXJtaW5lIGRlc3RpbmF0aW9uXHJcbiAgICAgICAgc3RhbmRlZS5tb3ZlVG8oeCx6KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBzdGFuZGVlID0gdGhpcy5zdGFuZGVlcy5nZXQoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIGlmIChzdGFuZGVlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgICAgIHN0YW5kZWUud2Fsa1RvKHgsIHosIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc3RhbmRlZU1hbmFnZXIgPSBuZXcgU3RhbmRlZU1hbmFnZXIoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5kZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgU1BSSVRFU0hFRVRfV0lEVEgsXHJcbiAgICBTUFJJVEVTSEVFVF9IRUlHSFQsXHJcbiAgICBGUkFNRV9XSURUSCxcclxuICAgIEZSQU1FX0hFSUdIVCxcclxuICAgIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcixcclxuICAgIHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZX1cclxuZnJvbSAnLi9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UnO1xyXG5cclxuY29uc3QgU1RBTkRBUkRfREVMQVkgPSAyMjU7XHJcbmNvbnN0IFdBTEtfVVBfT1JfRE9XTl9ERUxBWSA9IE1hdGguZmxvb3IoU1RBTkRBUkRfREVMQVkgKiAoMi8zKSk7IC8vIEJlY2F1c2UgdXAvZG93biB3YWxrIGN5Y2xlcyBoYXZlIG1vcmUgZnJhbWVzLiBcclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb25GcmFtZSB7XHJcblxyXG4gICAgcmVhZG9ubHkgcm93OiBudW1iZXI7XHJcbiAgICByZWFkb25seSBjb2w6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb3c6IG51bWJlciwgY29sOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdzsgXHJcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBlbnVtIFN0YW5kZWVBbmltYXRpb25UeXBlIHtcclxuICAgIFN0YW5kVXAsXHJcbiAgICBTdGFuZERvd24sXHJcbiAgICBTdGFuZExlZnQsXHJcbiAgICBTdGFuZFJpZ2h0LFxyXG4gICAgV2Fsa1VwLFxyXG4gICAgV2Fsa0Rvd24sXHJcbiAgICBXYWxrTGVmdCxcclxuICAgIFdhbGtSaWdodCxcclxuICAgIENoZWVyVXAsXHJcbiAgICBQYW5pY1VwLFxyXG4gICAgUGFuaWNEb3duXHJcbn1cclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgXHJcbiAgICByZWFkb25seSB0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZTtcclxuICAgIHJlYWRvbmx5IG5leHQ6IFN0YW5kZWVBbmltYXRpb25UeXBlOyAvLyBQcm9iYWJseSBub3QgZ29pbmcgdG8gYmUgdXNlZCBmb3IgdGhpcyBnYW1lXHJcblxyXG4gICAgcmVhZG9ubHkgZnJhbWVzOiBTdGFuZGVlQW5pbWF0aW9uRnJhbWVbXTtcclxuICAgIHJlYWRvbmx5IGRlbGF5czogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIGN1cnJlbnRGcmFtZUlkeDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50RnJhbWVUaW1lRWxhcHNlZDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgZmluaXNoZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IodHlwZTogU3RhbmRlZUFuaW1hdGlvblR5cGUsIG5leHQ/OiBTdGFuZGVlQW5pbWF0aW9uVHlwZSkge1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgaWYgKG5leHQpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0ID0gbmV4dDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5leHQgPSB0eXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlbGF5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZyYW1lSWR4ID0gMDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1c2goZnJhbWU6IFN0YW5kZWVBbmltYXRpb25GcmFtZSwgZGVsYXkgPSBTVEFOREFSRF9ERUxBWSkge1xyXG4gICAgICAgIHRoaXMuZnJhbWVzLnB1c2goZnJhbWUpO1xyXG4gICAgICAgIHRoaXMuZGVsYXlzLnB1c2goZGVsYXkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID49IHRoaXMuZGVsYXlzW3RoaXMuY3VycmVudEZyYW1lSWR4XSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHgrKztcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEZyYW1lSWR4ID49IHRoaXMuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHggPSAwOyAvLyBTaG91bGRuJ3QgYmUgdXNlZCBhbnltb3JlLCBidXQgcHJldmVudCBvdXQtb2YtYm91bmRzIGFueXdheS5cclxuICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzRmluaXNoZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudEZyYW1lKCk6IFN0YW5kZWVBbmltYXRpb25GcmFtZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJhbWVzW3RoaXMuY3VycmVudEZyYW1lSWR4XTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVTcHJpdGVXcmFwcGVyIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuICAgIHByaXZhdGUgc3ByaXRlOiBhbnk7XHJcbiAgICBwcml2YXRlIHRleHR1cmVXcmFwcGVyOiBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50QW5pbWF0aW9uOiBTdGFuZGVlQW5pbWF0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUaHJlZUpTIG9iamVjdHM6IFxyXG4gICAgICAgIHRoaXMudGV4dHVyZVdyYXBwZXIgPSBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UubmV3SW5zdGFuY2UoKTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU3ByaXRlTWF0ZXJpYWwoe21hcDogdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlfSk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgVEhSRUUuU3ByaXRlKG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5zY2FsZS5zZXQoMSwgMS41KTsgLy8gQWRqdXN0IGFzcGVjdCByYXRpbyBmb3IgNDggeCA3MiBzaXplIGZyYW1lcy4gXHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5zcHJpdGUpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIGRlZmF1bHQgYW5pbWF0aW9uIHRvIHN0YW5kaW5nIGZhY2luZyBkb3duOlxyXG4gICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kRG93bigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vIFRPRE86IFNldCB0aGlzIGVsc2V3aGVyZVxyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5hZGp1c3RMaWdodGluZyhlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLnN0ZXBBbmltYXRpb24oZWxhcHNlZCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogT25seSBzd2l0Y2hlcyBpZiB0aGUgZ2l2ZW4gYW5pbWF0aW9uIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBjdXJyZW50IG9uZS5cclxuICAgICAqL1xyXG4gICAgc3dpdGNoQW5pbWF0aW9uKHR5cGU6IFN0YW5kZWVBbmltYXRpb25UeXBlKSB7XHJcbiAgICAgICAgbGV0IGFuaW1hdGlvbiA9IGRldGVybWluZUFuaW1hdGlvbih0eXBlKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uLnR5cGUgIT09IGFuaW1hdGlvbi50eXBlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcclxuICAgICAgICB9IFxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRqdXN0TGlnaHRpbmcoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gVE9ETzogTm90IHlldCBzdXJlIGlmIEknbGwgbmVlZCB0byB1c2UgdGhlIGVsYXBzZWQgdmFyaWFibGUgaGVyZS5cclxuICAgICAgICB0aGlzLnNwcml0ZS5tYXRlcmlhbC5jb2xvci5zZXQoMHhhYWFhYWEpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcEFuaW1hdGlvbihlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFuaW1hdGlvbi5pc0ZpbmlzaGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gZGV0ZXJtaW5lQW5pbWF0aW9uKHRoaXMuY3VycmVudEFuaW1hdGlvbi5uZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZyYW1lID0gdGhpcy5jdXJyZW50QW5pbWF0aW9uLmdldEN1cnJlbnRGcmFtZSgpO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGZyYW1lIGNvb3JkaW5hdGVzIHRvIHRleHR1cmUgY29vcmRpbmF0ZXMgYW5kIHNldCB0aGUgY3VycmVudCBvbmVcclxuICAgICAgICBsZXQgeHBjdCA9IChmcmFtZS5jb2wgKiBGUkFNRV9XSURUSCkgLyBTUFJJVEVTSEVFVF9XSURUSDtcclxuICAgICAgICBsZXQgeXBjdCA9ICgoKFNQUklURVNIRUVUX0hFSUdIVCAvIEZSQU1FX0hFSUdIVCkgLSAxIC0gZnJhbWUucm93KSAqIEZSQU1FX0hFSUdIVCkgLyBTUFJJVEVTSEVFVF9IRUlHSFQ7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlLm9mZnNldC5zZXQoeHBjdCwgeXBjdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRldGVybWluZUFuaW1hdGlvbih0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZSk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbjogU3RhbmRlZUFuaW1hdGlvbjtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlU3RhbmRVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZERvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrRG93bjpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVXYWxrTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kUmlnaHQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtSaWdodCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLkNoZWVyVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZUNoZWVyVXAoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFVwXHJcbmxldCBzdGFuZFVwRnJhbWUxICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFVwRnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgVXBcclxubGV0IHdhbGtVcEZyYW1lMSAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgd2Fsa1VwRnJhbWUyICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMSk7XHJcbmxldCB3YWxrVXBGcmFtZTMgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAyKTtcclxubGV0IHdhbGtVcEZyYW1lNCAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDMpO1xyXG5sZXQgd2Fsa1VwRnJhbWU1ICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMyk7XHJcbmxldCB3YWxrVXBGcmFtZTYgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg1LCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXApO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUyLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUzLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU1LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU2LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gU3RhbmRpbmcgRG93blxyXG5sZXQgc3RhbmREb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZERvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHN0YW5kRG93bkZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIERvd25cclxubGV0IHdhbGtEb3duRnJhbWUxICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDApO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTIgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMSk7XHJcbmxldCB3YWxrRG93bkZyYW1lMyAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAyKTtcclxubGV0IHdhbGtEb3duRnJhbWU0ICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDMpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTUgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMyk7XHJcbmxldCB3YWxrRG93bkZyYW1lNiAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtEb3duKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTIsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lMywgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTUsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lNiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIExlZnRcclxubGV0IHN0YW5kTGVmdEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDEpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU3RhbmRMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kTGVmdCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZExlZnRGcmFtZTEpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gV2Fsa2luZyBMZWZ0XHJcbmxldCB3YWxrTGVmdEZyYW1lMSAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAxKTtcclxubGV0IHdhbGtMZWZ0RnJhbWUyICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDApO1xyXG5sZXQgd2Fsa0xlZnRGcmFtZTMgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMSk7XHJcbmxldCB3YWxrTGVmdEZyYW1lNCAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAyKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0KTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFJpZ2h0XHJcbmxldCBzdGFuZFJpZ2h0RnJhbWUxICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kUmlnaHQoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFJpZ2h0RnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgUmlnaHRcclxubGV0IHdhbGtSaWdodEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDQpO1xyXG5sZXQgd2Fsa1JpZ2h0RnJhbWUyICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgNCk7XHJcbmxldCB3YWxrUmlnaHRGcmFtZTMgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxubGV0IHdhbGtSaWdodEZyYW1lNCAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDQpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlV2Fsa1JpZ2h0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtSaWdodEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gQ2hlZXIgVXBcclxubGV0IGNoZWVyVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgY2hlZXJVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMCk7XHJcbmxldCBjaGVlclVwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAxKTtcclxubGV0IGNoZWVyVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDApO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2hlZXJVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5DaGVlclVwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goY2hlZXJVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgVXBcclxubGV0IHBhbmljVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgcGFuaWNVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMik7XHJcbmxldCBwYW5pY1VwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAwKTtcclxubGV0IHBhbmljVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDIpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGFuaWNVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgRG93blxyXG5sZXQgcGFuaWNEb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcbmxldCBwYW5pY0Rvd25GcmFtZTIgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAxKTtcclxubGV0IHBhbmljRG93bkZyYW1lMyAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDIpO1xyXG5sZXQgcGFuaWNEb3duRnJhbWU0ICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMSk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQYW5pY0Rvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNEb3duRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvc3RhbmRlZS1tb3ZlbWVudC1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7U3RhbmRlZVNwcml0ZVdyYXBwZXIsIFN0YW5kZWVBbmltYXRpb25UeXBlfSBmcm9tICcuL3N0YW5kZWUtc3ByaXRlLXdyYXBwZXInO1xyXG5pbXBvcnQge2NhbWVyYVdyYXBwZXJ9IGZyb20gJy4uL2NhbWVyYS13cmFwcGVyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlIHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICByZWFkb25seSBzcHJpdGVXcmFwcGVyOiBTdGFuZGVlU3ByaXRlV3JhcHBlcjtcclxuXHJcbiAgICBwcml2YXRlIHdhbGtUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgd2Fsa1R3ZWVuOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBmYWNpbmc6IGFueTsgLy8gRmFjZXMgaW4gdGhlIHZlY3RvciBvZiB3aGljaCB3YXkgdGhlIE5QQyBpcyB3YWxraW5nLCB3YXMgd2Fsa2luZyBiZWZvcmUgc3RvcHBpbmcsIG9yIHdhcyBzZXQgdG8uXHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlciA9IG5ldyBTdGFuZGVlU3ByaXRlV3JhcHBlcigpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuc3ByaXRlV3JhcHBlci5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmZhY2luZyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoLTIwMCwgMCwgLTIwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0ZXBXYWxrKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQ29ycmVjdEFuaW1hdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEltbWVkaWF0ZWx5IHNldCBzdGFuZGVlIG9uIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBtb3ZlVG8oeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCh4LCAwLCB6KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBzdGFuZGVlIGluIG1vdGlvbiB0b3dhcmRzIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICogU3BlZWQgZGltZW5zaW9uIGlzIDEgdW5pdC9zZWMuXHJcbiAgICAgKi9cclxuICAgIHdhbGtUbyh4OiBudW1iZXIsIHo6IG51bWJlciwgc3BlZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3cgbG9uZyBpdCB3b3VsZCB0YWtlLCBnaXZlbiB0aGUgc3BlZWQgcmVxdWVzdGVkLlxyXG4gICAgICAgIGxldCB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMyh4LCAwLCB6KS5zdWIodGhpcy5ncm91cC5wb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gdmVjdG9yLmxlbmd0aCgpO1xyXG4gICAgICAgIGxldCB0aW1lID0gKGRpc3RhbmNlIC8gc3BlZWQpICogMTAwMDtcclxuXHJcbiAgICAgICAgLy8gRGVsZWdhdGUgdG8gdHdlZW4uanMuIFBhc3MgaW4gY2xvc3VyZXMgYXMgY2FsbGJhY2tzIGJlY2F1c2Ugb3RoZXJ3aXNlICd0aGlzJyB3aWxsIHJlZmVyXHJcbiAgICAgICAgLy8gdG8gdGhlIHBvc2l0aW9uIG9iamVjdCwgd2hlbiBleGVjdXRpbmcgc3RvcFdhbGsoKS5cclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZ3JvdXAucG9zaXRpb24pXHJcbiAgICAgICAgICAgIC50byh7eDogeCwgejogen0sIHRpbWUpXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IHsgdGhpcy5zdG9wV2FsaygpOyB9KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy53YWxrVHdlZW5FbGFwc2VkKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBVcGRhdGUgZGlyZWN0aW9uIHRoaXMgc3RhbmRlZSB3aWxsIGJlIGZhY2luZyB3aGVuIHdhbGtpbmcuXHJcbiAgICAgICAgdGhpcy5mYWNpbmcuc2V0WCh4IC0gdGhpcy5ncm91cC5wb3NpdGlvbi54KTtcclxuICAgICAgICB0aGlzLmZhY2luZy5zZXRaKHogLSB0aGlzLmdyb3VwLnBvc2l0aW9uLnopO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcFdhbGsoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2Fsa1R3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMud2Fsa1R3ZWVuLnVwZGF0ZSh0aGlzLndhbGtUd2VlbkVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0b3BXYWxrKCkge1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoXHJcbiAgICAgICAgICAgIHRoaXMubnBjSWQsXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi56KVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbnN1cmVDb3JyZWN0QW5pbWF0aW9uKCkge1xyXG4gICAgICAgIC8vIGxldCB0YXJnZXQgPSB0aGlzLmdyb3VwLnBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgLy8gdGFyZ2V0LnNldFkodGFyZ2V0LnkgKyAwLjUpO1xyXG4gICAgICAgIC8vIGNhbWVyYVdyYXBwZXIuY2FtZXJhLmxvb2tBdCh0YXJnZXQpO1xyXG5cclxuICAgICAgICAvLyBBbmdsZSBiZXR3ZWVuIHR3byB2ZWN0b3JzOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTQ4NDIyOFxyXG4gICAgICAgIGxldCB3b3JsZERpcmVjdGlvbiA9IGNhbWVyYVdyYXBwZXIuY2FtZXJhLmdldFdvcmxkRGlyZWN0aW9uKCk7XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0aGlzLmZhY2luZy56LCB0aGlzLmZhY2luZy54KSAtIE1hdGguYXRhbjIod29ybGREaXJlY3Rpb24ueiwgd29ybGREaXJlY3Rpb24ueCk7XHJcbiAgICAgICAgaWYgKGFuZ2xlIDwgMCkgYW5nbGUgKz0gMiAqIE1hdGguUEk7XHJcbiAgICAgICAgYW5nbGUgKj0gKDE4MC9NYXRoLlBJKTsgLy8gSXQncyBteSBwYXJ0eSBhbmQgSSdsbCB1c2UgZGVncmVlcyBpZiBJIHdhbnQgdG8uXHJcblxyXG4gICAgICAgIGlmICh0aGlzLndhbGtUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmdsZSA8IDYwIHx8IGFuZ2xlID49IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDYwICYmIGFuZ2xlIDwgMTIwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gMTIwICYmIGFuZ2xlIDwgMjQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSAyNDAgJiYgYW5nbGUgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0xlZnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGFuZ2xlIDwgNjAgfHwgYW5nbGUgPj0gMzAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kVXApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDYwICYmIGFuZ2xlIDwgMTIwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDEyMCAmJiBhbmdsZSA8IDI0MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZERvd24pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDI0MCAmJiBhbmdsZSA8IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtjYW1lcmFXcmFwcGVyfSBmcm9tICcuL2NhbWVyYS13cmFwcGVyJztcclxuaW1wb3J0IHtza3l9IGZyb20gJy4vd29ybGQvc2t5JztcclxuaW1wb3J0IHtncm91bmR9IGZyb20gJy4vd29ybGQvZ3JvdW5kJztcclxuaW1wb3J0IHtMaWdodGluZ0dyaWR9IGZyb20gJy4vbGlnaHRpbmcvbGlnaHRpbmctZ3JpZCc7XHJcbmltcG9ydCB7U3dpdGNoYm9hcmR9IGZyb20gJy4vbGlnaHRpbmcvc3dpdGNoYm9hcmQnO1xyXG5pbXBvcnQge3N0YW5kZWVNYW5hZ2VyfSBmcm9tICcuL3N0YW5kZWUvc3RhbmRlZS1tYW5hZ2VyJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge0hwT3JpZW50YXRpb259IGZyb20gJy4uL2RvbWFpbi9ocC1vcmllbnRhdGlvbic7XHJcbmltcG9ydCB7Um93Q2xlYXJEaXJlY3Rpb259IGZyb20gJy4uL2RvbWFpbi9yb3ctY2xlYXItZGlyZWN0aW9uJztcclxuXHJcbmNsYXNzIFZpZXcge1xyXG5cclxuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuXHJcbiAgICBwcml2YXRlIHNreVNjZW5lOiBhbnk7XHJcbiAgICBwcml2YXRlIGxlZnRTY2VuZTogYW55O1xyXG4gICAgcHJpdmF0ZSByaWdodFNjZW5lOiBhbnk7XHJcbiAgICBwcml2YXRlIGdyb3VuZFNjZW5lOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogYW55O1xyXG5cclxuICAgIHByaXZhdGUgaHVtYW5HcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIGh1bWFuU3dpdGNoYm9hcmQ6IFN3aXRjaGJvYXJkO1xyXG4gICAgcHJpdmF0ZSBhaUdyaWQ6IExpZ2h0aW5nR3JpZDtcclxuICAgIHByaXZhdGUgYWlTd2l0Y2hib2FyZDogU3dpdGNoYm9hcmQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcclxuXHJcbiAgICAgICAgdGhpcy5za3lTY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gICAgICAgIHRoaXMubGVmdFNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgICAgICAgdGhpcy5yaWdodFNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgICAgICAgdGhpcy5ncm91bmRTY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FudGlhbGlhczogdHJ1ZSwgY2FudmFzOiB0aGlzLmNhbnZhc30pO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuYXV0b0NsZWFyID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaHVtYW5HcmlkID0gbmV3IExpZ2h0aW5nR3JpZChIcE9yaWVudGF0aW9uLkRlY3JlYXNlc1JpZ2h0VG9MZWZ0LCBSb3dDbGVhckRpcmVjdGlvbi5SaWdodFRvTGVmdCk7XHJcbiAgICAgICAgdGhpcy5odW1hblN3aXRjaGJvYXJkID0gbmV3IFN3aXRjaGJvYXJkKHRoaXMuaHVtYW5HcmlkLCBQbGF5ZXJUeXBlLkh1bWFuKTtcclxuICAgICAgICB0aGlzLmFpR3JpZCA9IG5ldyBMaWdodGluZ0dyaWQoSHBPcmllbnRhdGlvbi5EZWNyZWFzZXNMZWZ0VG9SaWdodCwgUm93Q2xlYXJEaXJlY3Rpb24uTGVmdFRvUmlnaHQpO1xyXG4gICAgICAgIHRoaXMuYWlTd2l0Y2hib2FyZCA9IG5ldyBTd2l0Y2hib2FyZCh0aGlzLmFpR3JpZCwgUGxheWVyVHlwZS5BaSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5odW1hbkdyaWQuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmFpR3JpZC5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuYWlTd2l0Y2hib2FyZC5zdGFydCgpO1xyXG5cclxuICAgICAgICB0aGlzLmRvU3RhcnQoKTtcclxuXHJcbiAgICAgICAgc2t5LnN0YXJ0KCk7XHJcbiAgICAgICAgZ3JvdW5kLnN0YXJ0KCk7XHJcbiAgICAgICAgc3RhbmRlZU1hbmFnZXIuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGNhbnZhcyBzaG91bGQgaGF2ZSBiZWVuIGhpZGRlbiB1bnRpbCBzZXR1cCBpcyBjb21wbGV0ZS5cclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBza3kuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBncm91bmQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5odW1hblN3aXRjaGJvYXJkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5odW1hbkdyaWQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5haUdyaWQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgc3RhbmRlZU1hbmFnZXIuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2t5U2NlbmUsIGNhbWVyYVdyYXBwZXIuY2FtZXJhKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmNsZWFyRGVwdGgoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLmxlZnRTY2VuZSwgY2FtZXJhV3JhcHBlci5jYW1lcmEpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuY2xlYXJEZXB0aCgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMucmlnaHRTY2VuZSwgY2FtZXJhV3JhcHBlci5jYW1lcmEpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuY2xlYXJEZXB0aCgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuZ3JvdW5kU2NlbmUsIGNhbWVyYVdyYXBwZXIuY2FtZXJhKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvU3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5za3lTY2VuZS5hZGQoc2t5Lmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91bmRTY2VuZS5hZGQoZ3JvdW5kLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmdyb3VuZFNjZW5lLmFkZChzdGFuZGVlTWFuYWdlci5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMubGVmdFNjZW5lLmFkZCh0aGlzLmh1bWFuR3JpZC5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMucmlnaHRTY2VuZS5hZGQodGhpcy5haUdyaWQuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLmdyb3VwLnBvc2l0aW9uLnNldFgoMTEpO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLmdyb3VwLnBvc2l0aW9uLnNldFooMSk7XHJcbiAgICAgICAgdGhpcy5haUdyaWQuZ3JvdXAucm90YXRpb24ueSA9IC1NYXRoLlBJIC8gNDtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogVGVtcG9yYXJ5IGZvciBkZWJ1Z2dpbmc/XHJcbiAgICAgICAgLy8gdGhpcy5zY2VuZS5hZGQobmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDQwNDA0MCkpO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBUZW1wb3Jhcnk/XHJcbiAgICAgICAgbGV0IHNwb3RMaWdodENvbG9yID0gMHg5OTk5ZWU7XHJcbiAgICAgICAgbGV0IGxlZnRTcG90TGlnaHQgPSBuZXcgVEhSRUUuU3BvdExpZ2h0KHNwb3RMaWdodENvbG9yKTtcclxuICAgICAgICBsZWZ0U3BvdExpZ2h0LnBvc2l0aW9uLnNldCgtMywgMC43NSwgMjApO1xyXG4gICAgICAgIGxlZnRTcG90TGlnaHQudGFyZ2V0ID0gdGhpcy5haUdyaWQuZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5sZWZ0U2NlbmUuYWRkKGxlZnRTcG90TGlnaHQpO1xyXG4gICAgICAgIGxldCByaWdodFNwb3RMaWdodCA9IG5ldyBUSFJFRS5TcG90TGlnaHQoc3BvdExpZ2h0Q29sb3IpO1xyXG4gICAgICAgIHJpZ2h0U3BvdExpZ2h0LnBvc2l0aW9uLnNldCgwLCAwLjc1LCAyMCk7XHJcbiAgICAgICAgcmlnaHRTcG90TGlnaHQudGFyZ2V0ID0gdGhpcy5haUdyaWQuZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5yaWdodFNjZW5lLmFkZChyaWdodFNwb3RMaWdodCk7XHJcblxyXG4gICAgICAgIGNhbWVyYVdyYXBwZXIuc2V0UG9zaXRpb24oLTMsIDAuNzUsIDE1KTsgLy8gTW9yZSBvciBsZXNzIGV5ZS1sZXZlbCB3aXRoIHRoZSBOUENzLlxyXG4gICAgICAgIGNhbWVyYVdyYXBwZXIubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDUsIDgsIDIpKTtcclxuXHJcbiAgICAgICAgY2FtZXJhV3JhcHBlci51cGRhdGVSZW5kZXJlclNpemUodGhpcy5yZW5kZXJlcik7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgY2FtZXJhV3JhcHBlci51cGRhdGVSZW5kZXJlclNpemUodGhpcy5yZW5kZXJlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHZpZXcgPSBuZXcgVmlldygpO1xyXG4iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBncmFzczogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMzAwLCAzMDApO1xyXG4gICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtlbWlzc2l2ZTogMHgwMjFkMDMsIGVtaXNzaXZlSW50ZW5zaXR5OiAxLjB9KTtcclxuICAgICAgICB0aGlzLmdyYXNzID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLmdyYXNzLnJvdGF0aW9uLnggPSAoTWF0aC5QSSAqIDMpIC8gMjtcclxuICAgICAgICB0aGlzLmdyYXNzLnBvc2l0aW9uLnNldCgwLCAwLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmdyYXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGdyb3VuZCA9IG5ldyBHcm91bmQoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jb25zdCBTVEFSVF9aX0FOR0xFID0gLShNYXRoLlBJIC8gMzApO1xyXG5jb25zdCBFTkRfWl9BTkdMRSAgID0gICBNYXRoLlBJIC8gMzA7XHJcbmNvbnN0IFJPVEFUSU9OX1NQRUVEID0gMC4wMDAxO1xyXG5cclxuY2xhc3MgU2t5IHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgZG9tZTogYW55O1xyXG4gICAgcHJpdmF0ZSByZHo6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSg1MCwgMzIsIDMyKTsgLy8gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDE1MCwgMTUwLCAxNTApO1xyXG4gICAgICAgIGxldCB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5nZW5lcmF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHttYXA6IHRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlfSk7XHJcbiAgICAgICAgdGhpcy5kb21lID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLmRvbWUubWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkJhY2tTaWRlO1xyXG4gICAgICAgIHRoaXMuZG9tZS5wb3NpdGlvbi5zZXQoMTAsIDEwLCAwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmRvbWUpO1xyXG5cclxuICAgICAgICB0aGlzLnJkeiA9IC1ST1RBVElPTl9TUEVFRDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmRvbWUucm90YXRpb24uc2V0KDAsIDAsIFNUQVJUX1pfQU5HTEUpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5kb21lLnJvdGF0aW9uLnNldCgwLCAwLCB0aGlzLmRvbWUucm90YXRpb24ueiArIHRoaXMucmR6KTtcclxuICAgICAgICBpZiAodGhpcy5kb21lLnJvdGF0aW9uLnogPj0gRU5EX1pfQU5HTEUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZHogPSAtUk9UQVRJT05fU1BFRUQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRvbWUucm90YXRpb24ueiA8PSBTVEFSVF9aX0FOR0xFKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmR6ID0gUk9UQVRJT05fU1BFRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZWQgb246IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE5OTkyNTA1XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2VuZXJhdGVUZXh0dXJlKCk6IGFueSB7XHJcbiAgICAgICAgbGV0IHNpemUgPSA1MTI7XHJcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHNpemU7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHNpemU7XHJcbiAgICAgICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIGN0eC5yZWN0KDAsIDAsIHNpemUsIHNpemUpO1xyXG4gICAgICAgIGxldCBncmFkaWVudCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCBzaXplKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC4wMCwgJyMwMDAwMDAnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC40MCwgJyMxMzFjNDUnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC43NSwgJyNmZjk1NDQnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC44NSwgJyMxMzFjNDUnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMS4wMCwgJyMxMzFjNDUnKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZ3JhZGllbnQ7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICByZXR1cm4gY2FudmFzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBza3kgPSBuZXcgU2t5KCk7Il19
