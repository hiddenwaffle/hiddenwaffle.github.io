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
        input_1.input.step(elapsed);
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
        if (input_1.input.isDownAndUnhandled(4 /* Drop */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Drop, 0 /* Human */));
        }
    };
    return Controller;
}());
exports.controller = new Controller();
},{"../domain/player-movement":5,"../event/event-bus":9,"../event/player-movement-event":14,"./input":2}],2:[function(require,module,exports){
/// <reference path='../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var KEY_REPEAT_DELAY_INITIAL = 550;
var KEY_REPEAT_DELAY_CONTINUE = 200;
var Input = (function () {
    function Input() {
        this.keyState = new Map();
        this.previousKeyCode = -1;
        this.currentKeyCode = -1;
        this.keyHeldElapsed = 0;
        this.keyHeldInitial = true;
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
     * All this does is handle if the player is holding down a key for a certain amount of time.
     * If so, determine whether or not to emulate their having pressed the key during this frame.
     */
    Input.prototype.step = function (elapsed) {
        if (this.currentKeyCode !== this.previousKeyCode) {
            this.keyHeldElapsed += elapsed;
            var updateState = void 0;
            if (this.keyHeldInitial === true && this.keyHeldElapsed >= KEY_REPEAT_DELAY_INITIAL) {
                this.keyHeldInitial = false;
                this.keyHeldElapsed = 0;
                updateState = true;
            }
            else if (this.keyHeldInitial === false && this.keyHeldElapsed >= KEY_REPEAT_DELAY_CONTINUE) {
                this.keyHeldElapsed = 0;
                updateState = true;
            }
            if (updateState === true) {
                var key = this.keyCodeToKey(this.currentKeyCode);
                this.setState(key, 0 /* Down */, true);
            }
        }
        else {
            this.keyHeldElapsed = 0;
            this.keyHeldInitial = true;
        }
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
     * TODO: Not sure if this would work in this game with the key delay capturing.
     *
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
        if (state === 0 /* Down */) {
            this.currentKeyCode = event.keyCode;
        }
        else if (state == 1 /* Up */) {
            this.currentKeyCode = -1;
            this.previousKeyCode = -1;
        }
        var key = this.keyCodeToKey(event.keyCode);
        this.keyToState(key, state, event);
    };
    Input.prototype.keyCodeToKey = function (keyCode) {
        var key = 6 /* Other */;
        switch (keyCode) {
            // Directionals --------------------------------------------------
            case 65: // 'a'
            case 37:
                key = 0 /* Left */;
                break;
            case 87: // 'w'
            case 38:
                key = 1 /* Up */;
                break;
            case 68: // 'd'
            case 39:
                key = 3 /* Right */;
                break;
            case 83: // 's'
            case 40:
                key = 2 /* Down */;
                break;
            case 32:
                key = 4 /* Drop */;
                break;
            // Pause ---------------------------------------------------------
            case 80: // 'p'
            case 27: // esc
            case 13:
                key = 5 /* Pause */;
                break;
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
                key = 7 /* Ignore */;
                break;
            // Prevent some unwanted behaviors -------------------------------
            case 191: // forward slash (page find)
            case 9: // tab (can lose focus)
            case 16:
                key = 8 /* Prevent */;
                break;
            // All other keys ------------------------------------------------
            default:
                key = 6 /* Other */;
        }
        return key;
    };
    Input.prototype.keyToState = function (key, state, event) {
        var preventDefault = false;
        switch (key) {
            case 0 /* Left */:
                this.setState(0 /* Left */, state);
                preventDefault = true;
                break;
            case 1 /* Up */:
                this.setState(1 /* Up */, state);
                // event.preventDefault() - commented for if the user wants to cmd+w or ctrl+w
                break;
            case 3 /* Right */:
                this.setState(3 /* Right */, state);
                preventDefault = true;
                break;
            case 2 /* Down */:
                this.setState(2 /* Down */, state);
                preventDefault = true;
                break;
            case 4 /* Drop */:
                this.setState(4 /* Drop */, state);
                preventDefault = true;
                break;
            case 5 /* Pause */:
                this.setState(5 /* Pause */, state);
                preventDefault = true;
                break;
            // TODO: Maybe add a debug key here ('f')
            case 7 /* Ignore */:
                break;
            case 8 /* Prevent */:
                preventDefault = true;
                break;
            case 6 /* Other */:
            default:
                this.setState(6 /* Other */, state);
                break;
        }
        if (event != null && preventDefault === true) {
            event.preventDefault();
        }
    };
    Input.prototype.setState = function (key, state, force) {
        if (force === void 0) { force = false; }
        // Always set 'up'
        if (state === 1 /* Up */) {
            this.keyState.set(key, state);
        }
        else if (state === 0 /* Down */) {
            if (this.keyState.get(key) !== 2 /* Handling */ || force === true) {
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
var sound_manager_1 = require('./sound/sound-manager');
var game_state_1 = require('./game-state');
document.addEventListener('DOMContentLoaded', function (event) {
    game_state_1.gameState.setCurrent(0 /* Initializing */);
    sound_manager_1.soundManager.attach();
    preloader_1.preloader.preload(function () {
        main();
    });
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
        sound_manager_1.soundManager.step(elapsed);
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
},{"./controller/controller":1,"./game-state":18,"./model/model":25,"./preloader":28,"./sound/sound-manager":30,"./view/view":42}],20:[function(require,module,exports){
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
        // Prevent active shape from getting buried in as many as 4 rows.
        for (var count = 0; count < 4; count++) {
            if (this.currentShape.getRow() > 0 && this.collisionDetected() === true) {
                this.currentShape.moveUp();
                this.fireActiveShapeChangedEvent();
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
var FALL_TIME_MS = 1750;
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
var building_preloader_1 = require('./view/lighting/building-preloader');
var sound_loader_1 = require('./sound/sound-loader');
// 1) Standee Textures
// 2) Building
// 3) Sound
var TOTAL_TO_PRELOAD = 3;
var Preloader = (function () {
    function Preloader() {
        this.callback = null;
        this.count = 0;
    }
    Preloader.prototype.preload = function (callback) {
        var _this = this;
        this.callback = callback;
        standee_animation_texture_base_1.standeeAnimationTextureBase.preload(function () {
            _this.checkIfFinished();
        });
        building_preloader_1.buildingPreloader.preload(function () {
            _this.checkIfFinished();
        });
        sound_loader_1.soundLoader.preload(function () {
            _this.checkIfFinished();
        });
    };
    Preloader.prototype.checkIfFinished = function () {
        this.count++;
        console.log('Preloaded ' + this.count + ' of ' + TOTAL_TO_PRELOAD);
        if (this.count >= TOTAL_TO_PRELOAD) {
            this.callback();
        }
    };
    return Preloader;
}());
exports.preloader = new Preloader();
},{"./sound/sound-loader":29,"./view/lighting/building-preloader":32,"./view/standee/standee-animation-texture-base":38}],29:[function(require,module,exports){
"use strict";
// 1) Ambience - Night
// 2) Music - Opening
var TOTAL_TO_PRELOAD = 2;
var SoundLoader = (function () {
    function SoundLoader() {
        this.preloadCompleteCallback = null;
        this.preloadCount = 0;
    }
    SoundLoader.prototype.preload = function (preloadCompleteCallback) {
        var _this = this;
        this.preloadCompleteCallback = preloadCompleteCallback;
        var ambienceNight = new Howl({
            src: ['ambience-night.m4a'],
            loop: true
        });
        ambienceNight.once('load', function () { return _this.preloadCheckIfFinished(); });
        var musicOpening = new Howl({
            src: ['music-opening.m4a'],
            loop: true
        });
        musicOpening.once('load', function () { return _this.preloadCheckIfFinished(); });
    };
    SoundLoader.prototype.preloadCheckIfFinished = function () {
        this.preloadCount++;
        if (this.preloadCount >= TOTAL_TO_PRELOAD) {
            this.preloadCompleteCallback();
        }
    };
    return SoundLoader;
}());
exports.soundLoader = new SoundLoader();
},{}],30:[function(require,module,exports){
"use strict";
var SOUND_KEY = '129083190-falling-sound';
var SoundManager = (function () {
    function SoundManager() {
        var _this = this;
        this.soundToggleElement = document.getElementById('sound-toggle');
        this.soundToggleElement.onclick = function () {
            _this.updateSoundSetting(!_this.soundToggleElement.checked);
        };
    }
    /**
     * Should occur before preloading so the player sees the right option immediately.
     */
    SoundManager.prototype.attach = function () {
        this.updateSoundSetting();
    };
    SoundManager.prototype.start = function () {
    };
    SoundManager.prototype.step = function (elapsed) {
        //
    };
    /**
     * Done off the main execution path in case the user has client-side storage turned off,
     * to prevent any sort of native exception, if those still exist these days.
     */
    SoundManager.prototype.updateSoundSetting = function (mute) {
        var _this = this;
        setTimeout(function () {
            if (mute == null) {
                var soundValue = sessionStorage.getItem(SOUND_KEY);
                mute = soundValue === 'off';
                _this.soundToggleElement.checked = !mute;
            }
            else {
                var soundValue = void 0;
                if (mute) {
                    soundValue = 'off';
                }
                else {
                    soundValue = 'on';
                }
                sessionStorage.setItem(SOUND_KEY, soundValue);
            }
            Howler.mute(mute);
        }, 1);
    };
    return SoundManager;
}());
exports.soundManager = new SoundManager();
},{}],31:[function(require,module,exports){
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
},{}],32:[function(require,module,exports){
"use strict";
var BuildingPreloader = (function () {
    function BuildingPreloader() {
        this.instances = [];
        this.instancesRequested = 0;
    }
    BuildingPreloader.prototype.preload = function (callback) {
        var _this = this;
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('');
        mtlLoader.load('green-building.mtl', function (materials) {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('');
            objLoader.load('green-building.obj', function (obj) {
                _this.instances.push(obj);
                callback();
            }, function () { }, function () { console.log('error while loading :('); });
        });
    };
    BuildingPreloader.prototype.getInstance = function () {
        var instance;
        if (this.instancesRequested === 0) {
            instance = this.instances[0];
        }
        else {
            instance = this.instances[0].clone();
            this.instances.push(instance);
        }
        this.instancesRequested++;
        return instance;
    };
    return BuildingPreloader;
}());
exports.buildingPreloader = new BuildingPreloader();
},{}],33:[function(require,module,exports){
"use strict";
var building_preloader_1 = require('./building-preloader');
var Building = (function () {
    function Building() {
        this.group = new THREE.Object3D();
    }
    Building.prototype.start = function () {
        var obj = building_preloader_1.buildingPreloader.getInstance();
        obj.scale.setScalar(0.25);
        obj.position.set(5, -0.01, 0);
        this.group.add(obj);
    };
    Building.prototype.step = function (elapsed) {
        //
    };
    return Building;
}());
exports.Building = Building;
},{"./building-preloader":32}],34:[function(require,module,exports){
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
},{"../../domain/constants":4}],35:[function(require,module,exports){
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
},{"../../domain/constants":4}],36:[function(require,module,exports){
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
},{"../../domain/constants":4,"./building":33,"./curtain":34,"./hp-panels":35}],37:[function(require,module,exports){
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
},{"../../event/event-bus":9,"../../event/rows-clear-animation-completed-event":15,"./lighting-grid":36}],38:[function(require,module,exports){
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
},{}],39:[function(require,module,exports){
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
},{"../../event/event-bus":9,"./standee":41}],40:[function(require,module,exports){
/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var camera_wrapper_1 = require('../camera-wrapper');
var standee_animation_texture_base_1 = require('./standee-animation-texture-base');
var STANDARD_DELAY = 225;
var WALK_UP_OR_DOWN_DELAY = Math.floor(STANDARD_DELAY * (2 / 3)); // Because up/down walk cycles have more frames. 
var scratchVector1 = new THREE.Vector3();
var scratchVector2 = new THREE.Vector3();
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
        // TODO: Move magic numbers into same equations as the NPC
        this.sprite.getWorldPosition(scratchVector1);
        camera_wrapper_1.cameraWrapper.camera.getWorldPosition(scratchVector2);
        var distanceSquared = scratchVector1.distanceToSquared(scratchVector2);
        var value = Math.max(0.20, 1.0 - (Math.min(1.0, distanceSquared / 225)));
        this.sprite.material.color.setRGB(value, value, value);
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
},{"../camera-wrapper":31,"./standee-animation-texture-base":38}],41:[function(require,module,exports){
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
},{"../../event/event-bus":9,"../../event/standee-movement-ended-event":17,"../camera-wrapper":31,"./standee-sprite-wrapper":40}],42:[function(require,module,exports){
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
},{"./camera-wrapper":31,"./lighting/lighting-grid":36,"./lighting/switchboard":37,"./standee/standee-manager":39,"./world/ground":43,"./world/sky":44}],43:[function(require,module,exports){
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
},{}],44:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2NvbnRyb2xsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2lucHV0LnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL2NlbGwudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vY29uc3RhbnRzLnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL3BsYXllci1tb3ZlbWVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvYm9hcmQtZmlsbGVkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvY2VsbC1jaGFuZ2UtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ldmVudC1idXMudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9mYWxsaW5nLXNlcXVlbmNlci1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9yb3dzLWNsZWFyLWFuaW1hdGlvbi1jb21wbGV0ZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9yb3dzLWZpbGxlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9nYW1lLXN0YXRlLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyIsInNyYy9zY3JpcHRzL21vZGVsL2FpL2FpLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvYm9hcmQudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ib2FyZC9mYWxsaW5nLXNlcXVlbmNlci50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL3NoYXBlLWZhY3RvcnkudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ib2FyZC9zaGFwZS50cyIsInNyYy9zY3JpcHRzL21vZGVsL21vZGVsLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbnBjL25wYy1tYW5hZ2VyLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbnBjL25wYy50cyIsInNyYy9zY3JpcHRzL3ByZWxvYWRlci50cyIsInNyYy9zY3JpcHRzL3NvdW5kL3NvdW5kLWxvYWRlci50cyIsInNyYy9zY3JpcHRzL3NvdW5kL3NvdW5kLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L2NhbWVyYS13cmFwcGVyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9idWlsZGluZy1wcmVsb2FkZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2J1aWxkaW5nLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9jdXJ0YWluLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9ocC1wYW5lbHMudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2xpZ2h0aW5nLWdyaWQudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL3N3aXRjaGJvYXJkLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUtYW5pbWF0aW9uLXRleHR1cmUtYmFzZS50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1zcHJpdGUtd3JhcHBlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLnRzIiwic3JjL3NjcmlwdHMvdmlldy92aWV3LnRzIiwic3JjL3NjcmlwdHMvdmlldy93b3JsZC9ncm91bmQudHMiLCJzcmMvc2NyaXB0cy92aWV3L3dvcmxkL3Nr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TSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNCLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RCxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN2QyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN2QyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN2QyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN2QyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN2QyxHQUFHLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUN6QixHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTCxVQUFDO0FBQUQsQ0F2REEsQUF1REMsSUFBQTtBQUNZLFdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7aW5wdXQsIEtleX0gZnJvbSAnLi9pbnB1dCc7XHJcbmltcG9ydCB7ZXZlbnRCdXN9IGZyb20gJy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50JztcclxuXHJcbi8vIFRPRE86IEhlcmUgZGV0ZXJtaW5lIGlmIHBsYXllciBpcyBob2xkaW5nIGRvd24gb25lIG9mIHRoZSBhcnJvdyBrZXlzOyBpZiBzbywgZmlyZSByYXBpZCBldmVudHMgYWZ0ZXIgKFRCRCkgYW1vdW50IG9mIHRpbWUuXHJcblxyXG5jbGFzcyBDb250cm9sbGVyIHtcclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBpbnB1dC5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaW5wdXQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuVXApKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUm90YXRlQ2xvY2t3aXNlLCBQbGF5ZXJUeXBlLkh1bWFuKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5MZWZ0KSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkxlZnQsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LlJpZ2h0KSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LlJpZ2h0LCBQbGF5ZXJUeXBlLkh1bWFuKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5Eb3duKSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkRvd24sIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkRyb3ApKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRHJvcCwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuZXhwb3J0IGNvbnN0IGVudW0gS2V5IHtcclxuICAgIExlZnQsXHJcbiAgICBVcCxcclxuICAgIERvd24sXHJcbiAgICBSaWdodCxcclxuICAgIERyb3AsXHJcbiAgICBQYXVzZSxcclxuICAgIC8vIFJlc3Qgb2YgdGhlc2UgYXJlIHNwZWNpYWwgZGlyZWN0aXZlc1xyXG4gICAgT3RoZXIsXHJcbiAgICBJZ25vcmUsXHJcbiAgICBQcmV2ZW50XHJcbn1cclxuXHJcbmNvbnN0IGVudW0gU3RhdGUge1xyXG4gICAgRG93bixcclxuICAgIFVwLFxyXG4gICAgSGFuZGxpbmdcclxufVxyXG5cclxuY29uc3QgS0VZX1JFUEVBVF9ERUxBWV9JTklUSUFMICA9IDU1MDtcclxuY29uc3QgS0VZX1JFUEVBVF9ERUxBWV9DT05USU5VRSA9IDIwMDtcclxuXHJcbmNsYXNzIElucHV0IHtcclxuICAgIHByaXZhdGUga2V5U3RhdGU6IE1hcDxLZXksU3RhdGU+O1xyXG5cclxuICAgIHByaXZhdGUgcHJldmlvdXNLZXlDb2RlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRLZXlDb2RlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGtleUhlbGRFbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGtleUhlbGRJbml0aWFsOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMua2V5U3RhdGUgPSBuZXcgTWFwPEtleSxTdGF0ZT4oKTtcclxuICAgICAgICB0aGlzLnByZXZpb3VzS2V5Q29kZSA9IC0xO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEtleUNvZGUgPSAtMTtcclxuICAgICAgICB0aGlzLmtleUhlbGRFbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLmtleUhlbGRJbml0aWFsID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50VG9TdGF0ZShldmVudCwgU3RhdGUuRG93bik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRUb1N0YXRlKGV2ZW50LCBTdGF0ZS5VcCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGwgdGhpcyBkb2VzIGlzIGhhbmRsZSBpZiB0aGUgcGxheWVyIGlzIGhvbGRpbmcgZG93biBhIGtleSBmb3IgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lLlxyXG4gICAgICogSWYgc28sIGRldGVybWluZSB3aGV0aGVyIG9yIG5vdCB0byBlbXVsYXRlIHRoZWlyIGhhdmluZyBwcmVzc2VkIHRoZSBrZXkgZHVyaW5nIHRoaXMgZnJhbWUuXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEtleUNvZGUgIT09IHRoaXMucHJldmlvdXNLZXlDb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMua2V5SGVsZEVsYXBzZWQgKz0gZWxhcHNlZDtcclxuXHJcbiAgICAgICAgICAgIGxldCB1cGRhdGVTdGF0ZTogYm9vbGVhbjtcclxuICAgICAgICAgICAgaWYgKHRoaXMua2V5SGVsZEluaXRpYWwgPT09IHRydWUgJiYgdGhpcy5rZXlIZWxkRWxhcHNlZCA+PSBLRVlfUkVQRUFUX0RFTEFZX0lOSVRJQUwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5SGVsZEluaXRpYWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5SGVsZEVsYXBzZWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlU3RhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5SGVsZEluaXRpYWwgPT09IGZhbHNlICYmIHRoaXMua2V5SGVsZEVsYXBzZWQgPj0gS0VZX1JFUEVBVF9ERUxBWV9DT05USU5VRSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlIZWxkRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVTdGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh1cGRhdGVTdGF0ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGtleSA9IHRoaXMua2V5Q29kZVRvS2V5KHRoaXMuY3VycmVudEtleUNvZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShrZXksIFN0YXRlLkRvd24sIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5rZXlIZWxkRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMua2V5SGVsZEluaXRpYWwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBpZiBnaXZlbiBrZXkgaXMgJ0Rvd24nLlxyXG4gICAgICovXHJcbiAgICBpc0Rvd24oa2V5OiBLZXkpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5rZXlTdGF0ZS5nZXQoa2V5KSA9PT0gU3RhdGUuRG93bjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBpZiBnaXZlbiBrZXkgaXMgJ2Rvd24nLiBBbHNvIHNldHMgdGhlIGtleSBmcm9tICdEb3duJyB0byAnSGFuZGxpbmcnLlxyXG4gICAgICovXHJcbiAgICBpc0Rvd25BbmRVbmhhbmRsZWQoa2V5OiBLZXkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0Rvd24oa2V5KSkge1xyXG4gICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIFN0YXRlLkhhbmRsaW5nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBUT0RPOiBUaGlzIHdhc24ndCBzZXQgaW4gbWF6aW5nOyBuZWVkIHRvIHNlZSB3aHkuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVE9ETzogTm90IHN1cmUgaWYgdGhpcyB3b3VsZCB3b3JrIGluIHRoaXMgZ2FtZSB3aXRoIHRoZSBrZXkgZGVsYXkgY2FwdHVyaW5nLlxyXG4gICAgICogXHJcbiAgICAgKiBSZXR1cm5zIGlmIGFueSBrZXkgaXMgJ2Rvd24nLiBBbHNvIHNldCBhbGwgJ0Rvd24nIGtleXMgdG8gJ0hhbmRsaW5nJy5cclxuICAgICAqL1xyXG4gICAgaXNBbnlLZXlEb3duQW5kVW5oYW5kbGVkKCkge1xyXG4gICAgICAgIGxldCBhbnlLZXlEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5rZXlTdGF0ZS5mb3JFYWNoKChzdGF0ZTogU3RhdGUsIGtleTogS2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gU3RhdGUuRG93bikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBTdGF0ZS5IYW5kbGluZyk7XHJcbiAgICAgICAgICAgICAgICBhbnlLZXlEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBhbnlLZXlEb3duO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZXZlbnRUb1N0YXRlKGV2ZW50OiBLZXlib2FyZEV2ZW50LCBzdGF0ZTogU3RhdGUpIHtcclxuICAgICAgICBpZiAoc3RhdGUgPT09IFN0YXRlLkRvd24pIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50S2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PSBTdGF0ZS5VcCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRLZXlDb2RlID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNLZXlDb2RlID0gLTE7XHJcbiAgICAgICB9XHJcblxyXG4gICAgICAgbGV0IGtleSA9IHRoaXMua2V5Q29kZVRvS2V5KGV2ZW50LmtleUNvZGUpO1xyXG4gICAgICAgdGhpcy5rZXlUb1N0YXRlKGtleSwgc3RhdGUsIGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGtleUNvZGVUb0tleShrZXlDb2RlOiBudW1iZXIpOiBLZXkge1xyXG4gICAgICAgIGxldCBrZXkgPSBLZXkuT3RoZXI7XHJcblxyXG4gICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xyXG4gICAgICAgICAgICAvLyBEaXJlY3Rpb25hbHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA2NTogLy8gJ2EnXHJcbiAgICAgICAgICAgIGNhc2UgMzc6IC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIGtleSA9IEtleS5MZWZ0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODc6IC8vICd3J1xyXG4gICAgICAgICAgICBjYXNlIDM4OiAvLyB1cFxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LlVwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vICdkJ1xyXG4gICAgICAgICAgICBjYXNlIDM5OiAvLyByaWdodFxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LlJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODM6IC8vICdzJ1xyXG4gICAgICAgICAgICBjYXNlIDQwOiAvLyBkb3duXHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuRG93bjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDMyOiAvLyBzcGFjZVxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LkRyb3A7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIFBhdXNlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDgwOiAvLyAncCdcclxuICAgICAgICAgICAgY2FzZSAyNzogLy8gZXNjXHJcbiAgICAgICAgICAgIGNhc2UgMTM6IC8vIGVudGVyIGtleVxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LlBhdXNlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gSWdub3JlIGNlcnRhaW4ga2V5cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgODI6ICAgIC8vICdyJ1xyXG4gICAgICAgICAgICBjYXNlIDE4OiAgICAvLyBhbHRcclxuICAgICAgICAgICAgY2FzZSAyMjQ6ICAgLy8gYXBwbGUgY29tbWFuZCAoZmlyZWZveClcclxuICAgICAgICAgICAgY2FzZSAxNzogICAgLy8gYXBwbGUgY29tbWFuZCAob3BlcmEpXHJcbiAgICAgICAgICAgIGNhc2UgOTE6ICAgIC8vIGFwcGxlIGNvbW1hbmQsIGxlZnQgKHNhZmFyaS9jaHJvbWUpXHJcbiAgICAgICAgICAgIGNhc2UgOTM6ICAgIC8vIGFwcGxlIGNvbW1hbmQsIHJpZ2h0IChzYWZhcmkvY2hyb21lKVxyXG4gICAgICAgICAgICBjYXNlIDg0OiAgICAvLyAndCcgKGkuZS4sIG9wZW4gYSBuZXcgdGFiKVxyXG4gICAgICAgICAgICBjYXNlIDc4OiAgICAvLyAnbicgKGkuZS4sIG9wZW4gYSBuZXcgd2luZG93KVxyXG4gICAgICAgICAgICBjYXNlIDIxOTogICAvLyBsZWZ0IGJyYWNrZXRzXHJcbiAgICAgICAgICAgIGNhc2UgMjIxOiAgIC8vIHJpZ2h0IGJyYWNrZXRzXHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuSWdub3JlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IHNvbWUgdW53YW50ZWQgYmVoYXZpb3JzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSAxOTE6ICAgLy8gZm9yd2FyZCBzbGFzaCAocGFnZSBmaW5kKVxyXG4gICAgICAgICAgICBjYXNlIDk6ICAgICAvLyB0YWIgKGNhbiBsb3NlIGZvY3VzKVxyXG4gICAgICAgICAgICBjYXNlIDE2OiAgICAvLyBzaGlmdFxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LlByZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIEFsbCBvdGhlciBrZXlzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5Lk90aGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGtleTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGtleVRvU3RhdGUoa2V5OiBLZXksIHN0YXRlOiBTdGF0ZSwgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBsZXQgcHJldmVudERlZmF1bHQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcclxuICAgICAgICAgICAgY2FzZSBLZXkuTGVmdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LkxlZnQsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5VcDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlVwLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpIC0gY29tbWVudGVkIGZvciBpZiB0aGUgdXNlciB3YW50cyB0byBjbWQrdyBvciBjdHJsK3dcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5SaWdodDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlJpZ2h0LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLZXkuRG93bjpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LkRvd24sIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5Ecm9wOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuRHJvcCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5LlBhdXNlOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuUGF1c2UsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBNYXliZSBhZGQgYSBkZWJ1ZyBrZXkgaGVyZSAoJ2YnKVxyXG4gICAgICAgICAgICBjYXNlIEtleS5JZ25vcmU6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLZXkuUHJldmVudDpcclxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5PdGhlcjpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5Lk90aGVyLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChldmVudCAhPSBudWxsICYmIHByZXZlbnREZWZhdWx0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0U3RhdGUoa2V5OiBLZXksIHN0YXRlOiBTdGF0ZSwgZm9yY2UgPSBmYWxzZSkge1xyXG4gICAgICAgIC8vIEFsd2F5cyBzZXQgJ3VwJ1xyXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gU3RhdGUuVXApIHtcclxuICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBzdGF0ZSk7XHJcbiAgICAgICAgLy8gT25seSBzZXQgJ2Rvd24nIGlmIGl0IGlzIG5vdCBhbHJlYWR5IGhhbmRsZWRcclxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmtleVN0YXRlLmdldChrZXkpICE9PSBTdGF0ZS5IYW5kbGluZyB8fCBmb3JjZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBpbnB1dCA9IG5ldyBJbnB1dCgpOyIsImltcG9ydCB7Q29sb3J9IGZyb20gJy4vY29sb3InO1xyXG5cclxuZXhwb3J0IGNsYXNzIENlbGwge1xyXG4gICAgcHJpdmF0ZSBjb2xvcjogQ29sb3I7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IENvbG9yLkVtcHR5O1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbG9yKGNvbG9yOiBDb2xvcikge1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2xvcigpOiBDb2xvciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3I7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPZmZzZXQgY2FsY3VsYXRlZCBmcm9tIHRvcC1sZWZ0IGNvcm5lciBiZWluZyAwLCAwLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENlbGxPZmZzZXQge1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGNvbnN0IFBBTkVMX0NPVU5UX1BFUl9GTE9PUiA9IDEwOyIsImV4cG9ydCBlbnVtIFBsYXllck1vdmVtZW50IHtcclxuICAgIE5vbmUsXHJcbiAgICBMZWZ0LFxyXG4gICAgUmlnaHQsXHJcbiAgICBEb3duLFxyXG4gICAgRHJvcCxcclxuICAgIFJvdGF0ZUNsb2Nrd2lzZSxcclxuICAgIFJvdGF0ZUNvdW50ZXJDbG9ja3dpc2VcclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U2hhcGV9IGZyb20gJy4uL21vZGVsL2JvYXJkL3NoYXBlJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgc2hhcGU6IFNoYXBlO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuICAgIHJlYWRvbmx5IHN0YXJ0aW5nOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNoYXBlOiBTaGFwZSwgcGxheWVyVHlwZTogUGxheWVyVHlwZSwgc3RhcnRpbmc6IGJvb2xlYW4pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgICAgIHRoaXMuc3RhcnRpbmcgPSBzdGFydGluZztcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJvYXJkRmlsbGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkJvYXJkRmlsbGVkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtDZWxsfSBmcm9tICcuLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDZWxsQ2hhbmdlRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuICAgIHJlYWRvbmx5IGNlbGw6IENlbGw7XHJcbiAgICByZWFkb25seSByb3c6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IGNvbDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjZWxsOiBDZWxsLCByb3c6IG51bWJlciwgY29sOiBudW1iZXIsIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuY2VsbCA9IGNlbGw7XHJcbiAgICAgICAgdGhpcy5yb3cgPSByb3c7XHJcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQ2VsbENoYW5nZUV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImV4cG9ydCBlbnVtIEV2ZW50VHlwZSB7XHJcbiAgICBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGUsXHJcbiAgICBBY3RpdmVTaGFwZUVuZGVkRXZlbnRUeXBlLFxyXG4gICAgQm9hcmRGaWxsZWRFdmVudFR5cGUsXHJcbiAgICBDZWxsQ2hhbmdlRXZlbnRUeXBlLFxyXG4gICAgRmFsbGluZ1NlcXVlbmNlckV2ZW50VHlwZSxcclxuICAgIEhwQ2hhbmdlZEV2ZW50VHlwZSxcclxuICAgIE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZSxcclxuICAgIE5wY1BsYWNlZEV2ZW50VHlwZSxcclxuICAgIE5wY1N0YXRlQ2hhZ2VkRXZlbnRUeXBlLFxyXG4gICAgUGxheWVyTW92ZW1lbnRFdmVudFR5cGUsXHJcbiAgICBSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudFR5cGUsXHJcbiAgICBSb3dzRmlsbGVkRXZlbnRUeXBlLFxyXG4gICAgU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGVcclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic3RyYWN0RXZlbnQge1xyXG4gICAgYWJzdHJhY3QgZ2V0VHlwZSgpOkV2ZW50VHlwZVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50SGFuZGxlcjxUIGV4dGVuZHMgQWJzdHJhY3RFdmVudD4ge1xyXG4gICAgKGV2ZW50OiBUKTp2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRXZlbnRCdXMge1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlcnNCeVR5cGU6TWFwPEV2ZW50VHlwZSwgRXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+W10+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlcnNCeVR5cGUgPSBuZXcgTWFwPEV2ZW50VHlwZSwgRXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+W10+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVnaXN0ZXIodHlwZTpFdmVudFR5cGUsIGhhbmRsZXI6RXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+KSB7XHJcbiAgICAgICAgaWYgKCF0eXBlKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHNvbWV0aGluZ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFoYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHNvbWV0aGluZ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGhhbmRsZXJzOkV2ZW50SGFuZGxlcjxBYnN0cmFjdEV2ZW50PltdID0gdGhpcy5oYW5kbGVyc0J5VHlwZS5nZXQodHlwZSk7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVyc0J5VHlwZS5zZXQodHlwZSwgaGFuZGxlcnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBoYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBSZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGNhbiBiZSBjYWxsZWQgdG8gdW5yZWdpc3RlciB0aGUgaGFuZGxlclxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBUT0RPOiB1bnJlZ2lzdGVyKCkuIEFuZCByZW1vdmUgdGhlIG1hcCBrZXkgaWYgemVybyBoYW5kbGVycyBsZWZ0IGZvciBpdC5cclxuICAgIFxyXG4gICAgLy8gVE9ETzogUHJldmVudCBpbmZpbml0ZSBmaXJlKCk/XHJcbiAgICBmaXJlKGV2ZW50OkFic3RyYWN0RXZlbnQpIHtcclxuICAgICAgICBsZXQgaGFuZGxlcnMgPSB0aGlzLmhhbmRsZXJzQnlUeXBlLmdldChldmVudC5nZXRUeXBlKCkpO1xyXG4gICAgICAgIGlmIChoYW5kbGVycyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBldmVudEJ1cyA9IG5ldyBFdmVudEJ1cygpO1xyXG5leHBvcnQgY29uc3QgZGVhZEV2ZW50QnVzID0gbmV3IEV2ZW50QnVzKCk7IC8vIFVzZWQgYnkgQUkuXHJcbiIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWxsaW5nU2VxdWVuY2VyRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkZhbGxpbmdTZXF1ZW5jZXJFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgSHBDaGFuZ2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBocDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihocDogbnVtYmVyLCBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmhwID0gaHA7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuSHBDaGFuZ2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLk5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjU3RhdGV9IGZyb20gJy4uL2RvbWFpbi9ucGMtc3RhdGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wY1BsYWNlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHN0YXRlOiBOcGNTdGF0ZTtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlclxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIsIHN0YXRlOiBOcGNTdGF0ZSwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5OcGNQbGFjZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBsYXllck1vdmVtZW50RXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBtb3ZlbWVudDogUGxheWVyTW92ZW1lbnQ7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vdmVtZW50OiBQbGF5ZXJNb3ZlbWVudCwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudCA9IG1vdmVtZW50O1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLlBsYXllck1vdmVtZW50RXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJvd3NGaWxsZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBmaWxsZWRSb3dJZHhzOiBudW1iZXJbXTtcclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZmlsbGVkUm93SWR4czogbnVtYmVyW10sIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuZmlsbGVkUm93SWR4cyA9IGZpbGxlZFJvd0lkeHMuc2xpY2UoMCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuUm93c0ZpbGxlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB6OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueiA9IHo7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLlN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGNvbnN0IGVudW0gR2FtZVN0YXRlVHlwZSB7XHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgdGhlIHN0YXRlIHJpZ2h0IHdoZW4gSmF2YVNjcmlwdCBzdGFydHMgcnVubmluZy4gSW5jbHVkZXMgcHJlbG9hZGluZy5cclxuICAgICAqL1xyXG4gICAgSW5pdGlhbGl6aW5nLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWZ0ZXIgcHJlbG9hZCBpcyBjb21wbGV0ZSBhbmQgYmVmb3JlIG1ha2luZyBvYmplY3Qgc3RhcnQoKSBjYWxscy5cclxuICAgICAqL1xyXG4gICAgU3RhcnRpbmcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGlzIGFmdGVyIGluaXRpYWwgb2JqZWN0cyBzdGFydCgpIGFuZCBsaWtlbHkgd2hlcmUgdGhlIGdhbWUgaXMgd2FpdGluZyBvbiB0aGUgcGxheWVyJ3MgZmlyc3QgaW5wdXQuXHJcbiAgICAgKi9cclxuICAgIFN0YXJ0ZWQsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBtYWluIGdhbWUgbG9vcCBvZiBjb250cm9sbGluZyBwaWVjZXMuXHJcbiAgICAgKi9cclxuICAgIFBsYXlpbmcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmQgb2YgZ2FtZSwgc2NvcmUgaXMgc2hvd2luZywgbm90aGluZyBsZWZ0IHRvIGRvLlxyXG4gICAgICovXHJcbiAgICBFbmRlZFxyXG59XHJcblxyXG5jbGFzcyBHYW1lU3RhdGUge1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50OiBHYW1lU3RhdGVUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IEdhbWVTdGF0ZVR5cGUuSW5pdGlhbGl6aW5nOyAvLyBEZWZhdWx0IHN0YXRlLlxyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnQoKTogR2FtZVN0YXRlVHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDdXJyZW50KGN1cnJlbnQ6IEdhbWVTdGF0ZVR5cGUpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBjdXJyZW50O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBnYW1lU3RhdGUgPSBuZXcgR2FtZVN0YXRlKCk7IiwiaW1wb3J0IHtwcmVsb2FkZXJ9IGZyb20gJy4vcHJlbG9hZGVyJztcclxuaW1wb3J0IHttb2RlbH0gZnJvbSAnLi9tb2RlbC9tb2RlbCc7XHJcbmltcG9ydCB7dmlld30gZnJvbSAnLi92aWV3L3ZpZXcnO1xyXG5pbXBvcnQge2NvbnRyb2xsZXJ9IGZyb20gJy4vY29udHJvbGxlci9jb250cm9sbGVyJztcclxuaW1wb3J0IHtzb3VuZE1hbmFnZXJ9IGZyb20gJy4vc291bmQvc291bmQtbWFuYWdlcic7XHJcbmltcG9ydCB7R2FtZVN0YXRlVHlwZSwgZ2FtZVN0YXRlfSBmcm9tICcuL2dhbWUtc3RhdGUnO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIChldmVudDogYW55KSA9PiB7XHJcbiAgICBnYW1lU3RhdGUuc2V0Q3VycmVudChHYW1lU3RhdGVUeXBlLkluaXRpYWxpemluZyk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYXR0YWNoKCk7XHJcbiAgICBwcmVsb2FkZXIucHJlbG9hZCgoKSA9PiB7XHJcbiAgICAgICAgbWFpbigpO1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gbWFpbigpIHtcclxuXHJcbiAgICAvLyBTdGFydHVwIGluIHJldmVyc2UgTVZDIG9yZGVyIHRvIGVuc3VyZSB0aGF0IGV2ZW50IGJ1cyBoYW5kbGVycyBpbiB0aGVcclxuICAgIC8vIGNvbnRyb2xsZXIgYW5kIHZpZXcgcmVjZWl2ZSAoYW55KSBzdGFydCBldmVudHMgZnJvbSBtb2RlbC5zdGFydCgpLlxyXG4gICAgY29udHJvbGxlci5zdGFydCgpO1xyXG4gICAgdmlldy5zdGFydCgpO1xyXG4gICAgbW9kZWwuc3RhcnQoKTtcclxuICAgIFxyXG4gICAgZ2FtZVN0YXRlLnNldEN1cnJlbnQoR2FtZVN0YXRlVHlwZS5TdGFydGVkKTtcclxuXHJcbiAgICBsZXQgc3RlcCA9ICgpID0+IHtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7XHJcblxyXG4gICAgICAgIGxldCBlbGFwc2VkID0gY2FsY3VsYXRlRWxhcHNlZCgpO1xyXG4gICAgICAgIGNvbnRyb2xsZXIuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB2aWV3LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgbW9kZWwuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBzb3VuZE1hbmFnZXIuc3RlcChlbGFwc2VkKTtcclxuICAgIH07XHJcbiAgICBzdGVwKCk7XHJcbn1cclxuXHJcbmxldCBsYXN0U3RlcCA9IERhdGUubm93KCk7XHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZUVsYXBzZWQoKSB7XHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gbGFzdFN0ZXA7XHJcbiAgICBpZiAoZWxhcHNlZCA+IDEwMCkge1xyXG4gICAgICAgIGVsYXBzZWQgPSAxMDA7IC8vIGVuZm9yY2Ugc3BlZWQgbGltaXRcclxuICAgIH1cclxuICAgIGxhc3RTdGVwID0gbm93O1xyXG4gICAgcmV0dXJuIGVsYXBzZWQ7XHJcbn0iLCJpbXBvcnQge1NoYXBlfSBmcm9tICcuLi9ib2FyZC9zaGFwZSc7XHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuaW1wb3J0IHtDZWxsfSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7ZXZlbnRCdXMsIEV2ZW50VHlwZX0gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5cclxuY29uc3QgTUFYX0NPTFMgPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7XHJcbmNvbnN0IFRJTUVfQkVUV0VFTl9NT1ZFUyA9IDI1MDtcclxuY29uc3QgVElNRV9NQVhfREVWSUFUSU9OID0gMTAwO1xyXG5cclxuaW50ZXJmYWNlIFpvbWJpZUJvYXJkIHtcclxuICAgIC8vIFdheXMgdG8gaW50ZXJhY3Qgd2l0aCBpdC5cclxuICAgIG1vdmVTaGFwZUxlZnQoKTogYm9vbGVhbjtcclxuICAgIG1vdmVTaGFwZVJpZ2h0KCk6IGJvb2xlYW47XHJcbiAgICBtb3ZlU2hhcGVEb3duKCk6IGJvb2xlYW47XHJcbiAgICBtb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk6IHZvaWQ7XHJcbiAgICBtb3ZlVG9Ub3AoKTogdm9pZDtcclxuICAgIHJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk6IGJvb2xlYW47XHJcbiAgICBjb252ZXJ0U2hhcGVUb0NlbGxzKCk6IHZvaWQ7XHJcbiAgICB1bmRvQ29udmVydFNoYXBlVG9DZWxscygpOiB2b2lkO1xyXG5cclxuICAgIC8vIFdheXMgdG8gZGVyaXZlIGluZm9ybWF0aW9uIGZyb20gaXQuXHJcbiAgICBnZXRDdXJyZW50U2hhcGVDb2xJZHgoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlQWdncmVnYXRlSGVpZ2h0KCk6IG51bWJlcjtcclxuICAgIGNhbGN1bGF0ZUNvbXBsZXRlTGluZXMoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlSG9sZXMoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlQnVtcGluZXNzKCk6IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIFJlYWxCb2FyZCBleHRlbmRzIFpvbWJpZUJvYXJkIHtcclxuICAgIGNsb25lWm9tYmllKCk6IFpvbWJpZUJvYXJkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQWkge1xyXG5cclxuICAgIHByaXZhdGUgcmVhbEJvYXJkOiBSZWFsQm9hcmQ7XHJcbiAgICBwcml2YXRlIHRpbWVVbnRpbE5leHRNb3ZlOiBudW1iZXI7XHJcblxyXG4gICAgLy8gMCA9IG5vIHJvdGF0aW9uLCAxID0gb25lIHJvdGF0aW9uLCAyID0gdHdvIHJvdGF0aW9ucywgMyA9IHRocmVlIHJvdGF0aW9ucy5cclxuICAgIHByaXZhdGUgdGFyZ2V0Um90YXRpb246IG51bWJlcjtcclxuICAgIHByaXZhdGUgY3VycmVudFJvdGF0aW9uOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHRhcmdldENvbElkeDogbnVtYmVyO1xyXG4gICAgLy8gUHJldmVudCBBSSBmcm9tIGRvaW5nIGFueXRoaW5nIHdoaWxlIHRoZSBwaWVjZSBpcyB3YWl0aW5nIHRvIFwibG9ja1wiIGludG8gdGhlIG1hdHJpeC5cclxuICAgIHByaXZhdGUgbW92ZUNvbXBsZXRlZDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZWFsQm9hcmQ6IFJlYWxCb2FyZCkge1xyXG4gICAgICAgIHRoaXMucmVhbEJvYXJkID0gcmVhbEJvYXJkO1xyXG4gICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgPSBUSU1FX0JFVFdFRU5fTU9WRVM7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0Um90YXRpb24gPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gMDtcclxuICAgICAgICB0aGlzLnRhcmdldENvbElkeCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ29tcGxldGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgLT0gZWxhcHNlZDtcclxuICAgICAgICBpZiAodGhpcy50aW1lVW50aWxOZXh0TW92ZSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgPSBUSU1FX0JFVFdFRU5fTU9WRVM7XHJcbiAgICAgICAgICAgIHRoaXMuYWR2YW5jZVRvd2FyZHNUYXJnZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBwcm92aWRlcyBhIGhpZ2gtbGV2ZWwgdmlldyBvZiB0aGUgQUkncyB0aG91Z2h0IHByb2Nlc3MuXHJcbiAgICAgKi9cclxuICAgIHN0cmF0ZWdpemUoKSB7XHJcbiAgICAgICAgbGV0IHpvbWJpZSA9IHRoaXMucmVhbEJvYXJkLmNsb25lWm9tYmllKCk7XHJcblxyXG4gICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBhbGwgcG9zc2libGUgcm90YXRpb25zIGFuZCBjb2x1bW5zXHJcbiAgICAgICAgbGV0IGJlc3RGaXRuZXNzID0gTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVI7XHJcbiAgICAgICAgbGV0IGJlc3RSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgbGV0IGJlc3RDb2xJZHggPSAwO1xyXG4gICAgICAgIGZvciAobGV0IHJvdGF0aW9uID0gMDsgcm90YXRpb24gPCA0OyByb3RhdGlvbisrKSB7XHJcbiAgICAgICAgICAgIHdoaWxlKHpvbWJpZS5tb3ZlU2hhcGVMZWZ0KCkpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgTUFYX0NPTFM7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICB6b21iaWUubW92ZVNoYXBlRG93bkFsbFRoZVdheSgpO1xyXG4gICAgICAgICAgICAgICAgem9tYmllLmNvbnZlcnRTaGFwZVRvQ2VsbHMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZml0bmVzcyA9IHRoaXMuY2FsY3VsYXRlRml0bmVzcyh6b21iaWUpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZpdG5lc3M6ICcgKyBmaXRuZXNzICsgJywgcm90YXRpb246ICcgKyByb3RhdGlvbiArICcsIGNvbDogJyArIGNvbElkeCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZml0bmVzcyA+IGJlc3RGaXRuZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdEZpdG5lc3MgPSBmaXRuZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RSb3RhdGlvbiA9IHJvdGF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RDb2xJZHggPSB6b21iaWUuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCk7IC8vIFVzZSB0aGlzIHJhdGhlciB0aGFuIGlkeCBpbiBjYXNlIGl0IHdhcyBvZmYgYmVjYXVzZSBvZiB3aGF0ZXZlciByZWFzb24gKG9ic3RydWN0aW9uLCB3YWxsLCBldGMuLi4pXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgem9tYmllLnVuZG9Db252ZXJ0U2hhcGVUb0NlbGxzKCk7XHJcbiAgICAgICAgICAgICAgICB6b21iaWUubW92ZVRvVG9wKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2FuTW92ZVJpZ2h0ID0gem9tYmllLm1vdmVTaGFwZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FuTW92ZVJpZ2h0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHpvbWJpZS5yb3RhdGVTaGFwZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnYmVzdEZpdG5lc3M6ICVmLCAlZCwgJWQnLCBiZXN0Rml0bmVzcywgYmVzdFJvdGF0aW9uLCBiZXN0Q29sSWR4KTtcclxuXHJcbiAgICAgICAgLy8gRmluYWxseSwgc2V0IHRoZSB2YWx1ZXMgdGhhdCB3aWxsIGxldCB0aGUgQUkgYWR2YW5jZSB0b3dhcmRzIHRoZSB0YXJnZXQuXHJcbiAgICAgICAgdGhpcy50YXJnZXRSb3RhdGlvbiA9IGJlc3RSb3RhdGlvbjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy50YXJnZXRDb2xJZHggPSBiZXN0Q29sSWR4O1xyXG4gICAgICAgIHRoaXMubW92ZUNvbXBsZXRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZWQgb24gaHR0cHM6Ly9jb2RlbXlyb2FkLndvcmRwcmVzcy5jb20vMjAxMy8wNC8xNC90ZXRyaXMtYWktdGhlLW5lYXItcGVyZmVjdC1wbGF5ZXIvXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlRml0bmVzcyh6b21iaWU6IFpvbWJpZUJvYXJkKSB7XHJcbiAgICAgICAgbGV0IGFnZ3JlZ2F0ZUhlaWdodCA9IHpvbWJpZS5jYWxjdWxhdGVBZ2dyZWdhdGVIZWlnaHQoKTtcclxuICAgICAgICBsZXQgY29tcGxldGVMaW5lcyA9IHpvbWJpZS5jYWxjdWxhdGVDb21wbGV0ZUxpbmVzKCk7XHJcbiAgICAgICAgbGV0IGhvbGVzID0gem9tYmllLmNhbGN1bGF0ZUhvbGVzKCk7XHJcbiAgICAgICAgbGV0IGJ1bXBpbmVzcyA9IHpvbWJpZS5jYWxjdWxhdGVCdW1waW5lc3MoKTtcclxuICAgICAgICBsZXQgZml0bmVzcyA9ICgtMC41MTAwNjYgKiBhZ2dyZWdhdGVIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgKyAoIDAuNzYwNjY2ICogY29tcGxldGVMaW5lcylcclxuICAgICAgICAgICAgICAgICAgICArICgtMC4zNTY2MyAgKiBob2xlcylcclxuICAgICAgICAgICAgICAgICAgICArICgtMC4xODQ0ODMgKiBidW1waW5lc3MpO1xyXG4gICAgICAgIHJldHVybiBmaXRuZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWR2YW5jZVRvd2FyZHNUYXJnZXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubW92ZUNvbXBsZXRlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um90YXRpb24gPT09IHRoaXMudGFyZ2V0Um90YXRpb24gJiYgdGhpcy5yZWFsQm9hcmQuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCkgPT09IHRoaXMudGFyZ2V0Q29sSWR4KSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IERyb3Agc2hhcGUgc2hvdWxkIGJlIG9uIGEgdGltZXIgb3Igc29tZXRoaW5nLlxyXG4gICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5tb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXRDb2xJZHggPSAwO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDb21wbGV0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3RhdGlvbiA8IHRoaXMudGFyZ2V0Um90YXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhbEJvYXJkLnJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbisrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5yZWFsQm9hcmQuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCkgPCB0aGlzLnRhcmdldENvbElkeCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFsQm9hcmQubW92ZVNoYXBlUmlnaHQoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlYWxCb2FyZC5nZXRDdXJyZW50U2hhcGVDb2xJZHgoKSA+IHRoaXMudGFyZ2V0Q29sSWR4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5tb3ZlU2hhcGVMZWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHJpdmF0ZSBwZXJmb3JtTmV3TW92ZW1lbnQoKSB7XHJcbiAgICAgICAgLy8gbGV0IG1hdHJpeCA9IHRoaXMudmlzdWFsLm1hdHJpeDtcclxuICAgICAgICAvLyBsZXQgc2hhcGUgPSB0aGlzLnZpc3VhbC5jdXJyZW50U2hhcGU7XHJcblxyXG4gICAgICAgIC8vIGxldCByYW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNSk7XHJcblxyXG4gICAgICAgIC8vIGlmIChyYW5kID09PSAwKSB7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUm90YXRlQ2xvY2t3aXNlLCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChyYW5kID09PSAxKSB7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuTGVmdCwgUGxheWVyVHlwZS5BaSkpO1xyXG4gICAgICAgIC8vIH0gZWxzZSBpZiAocmFuZCA9PT0gMikge1xyXG4gICAgICAgIC8vICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LlJpZ2h0LCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChyYW5kID09PSAzKSB7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRG93biwgUGxheWVyVHlwZS5BaSkpO1xyXG4gICAgICAgIC8vIH0gZWxzZSBpZiAocmFuZCA9PT0gNCkge1xyXG4gICAgICAgIC8vICAgICBsZXQgZHJvcENoYW5jZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCk7IC8vIElzIHRoaXMgY2FsbGVkIE1vbnRlLUNhcmxvP1xyXG4gICAgICAgIC8vICAgICBpZiAoZHJvcENoYW5jZSA8IDEwKSB7XHJcbiAgICAgICAgLy8gICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkRyb3AsIFBsYXllclR5cGUuQWkpKTtcclxuICAgICAgICAvLyAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgICAgIC8vIERvIG5vdGhpbmcgdGhpcyByb3VuZDsgbWF5YmUgY29uc2lkZXJlZCBhIGhlc2l0YXRpb24uXHJcbiAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnc2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgICAgIC8vIH1cclxuICAgIC8vIH1cclxuXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVRpbWVVbnRpbE5leHRNb3ZlKCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKFRJTUVfQkVUV0VFTl9NT1ZFUyArICgoTWF0aC5yYW5kb20oKSAqIFRJTUVfTUFYX0RFVklBVElPTikgLSAoVElNRV9NQVhfREVWSUFUSU9OIC8gMikpKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4vc2hhcGUnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7U2hhcGVGYWN0b3J5LCBkZWFkU2hhcGVGYWN0b3J5fSBmcm9tICcuL3NoYXBlLWZhY3RvcnknO1xyXG5pbXBvcnQge0V2ZW50QnVzLCBkZWFkRXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7Q2VsbENoYW5nZUV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9jZWxsLWNoYW5nZS1ldmVudCc7XHJcbmltcG9ydCB7Um93c0ZpbGxlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9yb3dzLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtCb2FyZEZpbGxlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ib2FyZC1maWxsZWQtZXZlbnQnO1xyXG5cclxuY29uc3QgTUFYX1JPV1MgPSAxOTsgLy8gVG9wIDIgcm93cyBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuIEFsc28sIHNlZSBsaWdodGluZy1ncmlkLnRzLlxyXG5jb25zdCBNQVhfQ09MUyA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjtcclxuY29uc3QgVEVNUF9ERUxBWV9NUyA9IDUwMDtcclxuXHJcbmNvbnN0IGVudW0gQm9hcmRTdGF0ZSB7XHJcbiAgICBQYXVzZWQsXHJcbiAgICBJblBsYXlcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvYXJkIHtcclxuICAgIHByaXZhdGUgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuICAgIHByaXZhdGUgc2hhcGVGYWN0b3J5OiBTaGFwZUZhY3Rvcnk7XHJcbiAgICBwcml2YXRlIGV2ZW50QnVzOiBFdmVudEJ1cztcclxuXHJcbiAgICBwcml2YXRlIGJvYXJkU3RhdGU6IEJvYXJkU3RhdGU7XHJcbiAgICBwcml2YXRlIG1zVGlsbEdyYXZpdHlUaWNrOiBudW1iZXI7XHJcblxyXG4gICAgY3VycmVudFNoYXBlOiBTaGFwZTtcclxuICAgIHJlYWRvbmx5IG1hdHJpeDogQ2VsbFtdW107XHJcblxyXG4gICAgcHJpdmF0ZSBqdW5rUm93SG9sZUNvbHVtbjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBqdW5rUm93SG9sZURpcmVjdGlvbjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBqdW5rUm93Q29sb3IxOiBDb2xvcjtcclxuICAgIHByaXZhdGUganVua1Jvd0NvbG9yMjogQ29sb3I7XHJcbiAgICBwcml2YXRlIGp1bmtSb3dDb2xvcklkeDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBsYXllclR5cGU6IFBsYXllclR5cGUsIHNoYXBlRmFjdG9yeTogU2hhcGVGYWN0b3J5LCBldmVudEJ1czogRXZlbnRCdXMpIHtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgICAgIHRoaXMuc2hhcGVGYWN0b3J5ID0gc2hhcGVGYWN0b3J5O1xyXG4gICAgICAgIHRoaXMuZXZlbnRCdXMgPSBldmVudEJ1cztcclxuXHJcbiAgICAgICAgdGhpcy5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5QYXVzZWQ7XHJcbiAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IFRFTVBfREVMQVlfTVM7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1hdHJpeCA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IE1BWF9ST1dTOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFtyb3dJZHhdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZUNvbHVtbiA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZUNvbHVtbiA9IE1BWF9DT0xTIC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbiA9IDE7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q29sb3IxID0gQ29sb3IuV2hpdGU7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q29sb3IyID0gQ29sb3IuV2hpdGU7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q29sb3JJZHggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0QW5kUGxheSgpIHtcclxuICAgICAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5JblBsYXk7XHJcbiAgICAgICAgdGhpcy5zdGFydFNoYXBlKHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBnaXZlcyBhIGhpZ2ggbGV2ZWwgdmlldyBvZiB0aGUgbWFpbiBnYW1lIGxvb3AuXHJcbiAgICAgKiBUaGlzIHNob3VsZG4ndCBiZSBjYWxsZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdGUgPT09IEJvYXJkU3RhdGUuUGF1c2VkKSB7XHJcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgaGVyZSBqdXN0IHRvIGVuc3VyZSB0aGF0IHRoZSBtZXRob2QgdG8gcnVucyBpbW1lZGlhdGVseSBhZnRlciB1bnBhdXNpbmcuXHJcbiAgICAgICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgLT0gZWxhcHNlZDtcclxuICAgICAgICAgICAgaWYgKHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IFRFTVBfREVMQVlfTVM7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50cnlHcmF2aXR5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVTaGFwZURvd24oKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVFbmRPZkN1cnJlbnRQaWVjZVRhc2tzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsIHRoaXMgb25jZSBhIHNoYXBlIGlzIGtub3duIHRvIGJlIGluIGl0cyBmaW5hbCByZXN0aW5nIHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBoYW5kbGVFbmRPZkN1cnJlbnRQaWVjZVRhc2tzKCkge1xyXG4gICAgICAgIHRoaXMuY29udmVydFNoYXBlVG9DZWxscygpO1xyXG4gICAgICAgIGlmICh0aGlzLmhhbmRsZUZ1bGxCb2FyZCgpKSB7XHJcbiAgICAgICAgICAgIC8vIEJvYXJkIGlzIGZ1bGwgLS0gc3RhcnRpbmcgYSBuZXcgc2hhcGUgd2FzIGRlbGVnYXRlZCB0byBsYXRlciBieSBoYW5kbGVGdWxsQm9hcmQoKS5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQxKCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoZXJlIHdlcmUgZmlsbGVkIGxpbmVzIC0tIHN0YXJ0aW5nIGEgbmV3IHNoYXBlIHdhcyBkZWxlZ2F0ZWQgdG8gbGF0ZXIgYnkgaGFuZGxlQW55RmlsbGVkTGluZXNQYXJ0MSgpLlxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydFNoYXBlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBnZXRDdXJyZW50U2hhcGVDb2xJZHgoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlTGVmdCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLkluUGxheSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlTGVmdCgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlUmlnaHQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlUmlnaHQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5JblBsYXkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZURvd24oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5JblBsYXkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVVwKCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZURvd25BbGxUaGVXYXkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5JblBsYXkpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSk7IC8vIFRPRE86IEFkZCB1cHBlciBib3VuZC5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVVwKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgbW92ZVRvVG9wKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVUb1RvcCgpOyBcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVTaGFwZUNsb2Nrd2lzZSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLkluUGxheSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5yb3RhdGVDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUucm90YXRlQ291bnRlckNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBhZGRKdW5rUm93cyhudW1iZXJPZlJvd3NUb0FkZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gQ2xlYXIgcm93cyBhdCB0aGUgdG9wIHRvIG1ha2Ugcm9vbSBhdCB0aGUgYm90dG9tLlxyXG4gICAgICAgIHRoaXMubWF0cml4LnNwbGljZSgwLCBudW1iZXJPZlJvd3NUb0FkZCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBqdW5rIHJvd3MgYXQgdGhlIGJvdHRvbS5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBudW1iZXJPZlJvd3NUb0FkZDsgaWR4KyspIHtcclxuICAgICAgICAgICAgLy8gU2V0IHRoZSByb3cgdG8gY29tcGxldGVseSBmaWxsZWQuXHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IHRoaXMuZ2V0TmV4dEp1bmtSb3dDb2xvcigpO1xyXG4gICAgICAgICAgICBsZXQgcm93OiBDZWxsW10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgICAgICAgICBjZWxsLnNldENvbG9yKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIHJvdy5wdXNoKGNlbGwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQdW5jaCBhIGhvbGUgaW4gdGhlIGxpbmUuXHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gcm93W3RoaXMuanVua1Jvd0hvbGVDb2x1bW5dO1xyXG4gICAgICAgICAgICBjZWxsLnNldENvbG9yKENvbG9yLkVtcHR5KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBhcmUgZm9yIHRoZSBuZXh0IGp1bmsgcm93IGxpbmUuXHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gKz0gdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbjtcclxuICAgICAgICAgICAgaWYgKHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVEaXJlY3Rpb24gKj0gLTE7IC8vIEZsaXBzIHRoZSBkaXJlY3Rpb25cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID49IE1BWF9DT0xTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gTUFYX0NPTFMgLSAyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbiAqPSAtMTsgLy8gRmxpcHMgdGhlIGRpcmVjdGlvblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeC5wdXNoKHJvdyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE5vdGlmeSBmb3IgYWxsIGNlbGxzIGJlY2F1c2UgZW50aXJlIGJvYXJkIGhhcyBjaGFuZ2VkLlxyXG4gICAgICAgIC8vIFRPRE86IE1vdmUgdG8gb3duIG1ldGhvZD9cclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCwgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFByZXZlbnQgYWN0aXZlIHNoYXBlIGZyb20gZ2V0dGluZyBidXJpZWQgaW4gYXMgbWFueSBhcyA0IHJvd3MuXHJcbiAgICAgICAgZm9yIChsZXQgY291bnQgPSAwOyBjb3VudCA8IDQ7IGNvdW50KyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpID4gMCAmJiB0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFZlcnkgaGFja3kgbWV0aG9kIGp1c3Qgc28gdGhlIEFJIGhhcyBhIHRlbXAgY29weSBvZiB0aGUgYm9hcmQgdG8gZXhwZXJpbWVudCB3aXRoLlxyXG4gICAgICovXHJcbiAgICBjbG9uZVpvbWJpZSgpOiBCb2FyZCB7XHJcbiAgICAgICAgbGV0IGNvcHkgPSBuZXcgQm9hcmQodGhpcy5wbGF5ZXJUeXBlLCBkZWFkU2hhcGVGYWN0b3J5LCBkZWFkRXZlbnRCdXMpO1xyXG5cclxuICAgICAgICAvLyBBbGxvdyB0aGUgQUkgdG8gbW92ZSBhbmQgcm90YXRlIHRoZSBjdXJyZW50IHNoYXBlXHJcbiAgICAgICAgY29weS5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5JblBsYXk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ29weSB0aGUgY3VycmVudCBzaGFwZSBhbmQgdGhlIG1hdHJpeC4gU2hvdWxkbid0IG5lZWQgYW55dGhpbmcgZWxzZS5cclxuICAgICAgICBjb3B5LmN1cnJlbnRTaGFwZSA9IHRoaXMuY3VycmVudFNoYXBlLmNsb25lU2ltcGxlKCk7XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGNvcHkubWF0cml4W3Jvd0lkeF1bY29sSWR4XS5zZXRDb2xvcihyb3dbY29sSWR4XS5nZXRDb2xvcigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvcHk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQWdncmVnYXRlSGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGNvbEhlaWdodHMgPSB0aGlzLmNhbGN1bGF0ZUNvbHVtbkhlaWdodHMoKTtcclxuICAgICAgICByZXR1cm4gY29sSGVpZ2h0cy5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEgKyBiOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEZhbGxpbmdTZXF1ZW5jZXIuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZUhpZ2hlc3RDb2x1bW4oKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgY29sSGVpZ2h0cyA9IHRoaXMuY2FsY3VsYXRlQ29sdW1uSGVpZ2h0cygpO1xyXG4gICAgICAgIHJldHVybiBjb2xIZWlnaHRzLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYSA+IGIgPyBhIDogYjsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQ29tcGxldGVMaW5lcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBjb21wbGV0ZUxpbmVzID0gMDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChyb3dbY29sSWR4XS5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvdW50ID49IHJvdy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlTGluZXMrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlTGluZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqIERldGVybWluZXMgaG9sZXMgYnkgc2Nhbm5pbmcgZWFjaCBjb2x1bW4sIGhpZ2hlc3QgZmxvb3IgdG8gbG93ZXN0IGZsb29yLCBhbmRcclxuICAgICAqIHNlZWluZyBob3cgbWFueSB0aW1lcyBpdCBzd2l0Y2hlcyBmcm9tIGNvbG9yZWQgdG8gZW1wdHkgKGJ1dCBub3QgdGhlIG90aGVyIHdheSBhcm91bmQpLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVIb2xlcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB0b3RhbEhvbGVzID0gMDtcclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IGhvbGVzID0gMDtcclxuICAgICAgICAgICAgbGV0IHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNDZWxsV2FzRW1wdHkgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG9sZXMrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NlbGxXYXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG90YWxIb2xlcyArPSBob2xlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRvdGFsSG9sZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQnVtcGluZXNzKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGJ1bXBpbmVzcyA9IDA7XHJcbiAgICAgICAgbGV0IGNvbEhlaWdodHMgPSB0aGlzLmNhbGN1bGF0ZUNvbHVtbkhlaWdodHMoKTtcclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBjb2xIZWlnaHRzLmxlbmd0aCAtIDI7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWwxID0gY29sSGVpZ2h0c1tpZHhdO1xyXG4gICAgICAgICAgICBsZXQgdmFsMiA9IGNvbEhlaWdodHNbaWR4ICsgMV07XHJcbiAgICAgICAgICAgIGJ1bXBpbmVzcyArPSBNYXRoLmFicyh2YWwxIC0gdmFsMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBidW1waW5lc3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVDb2x1bW5IZWlnaHRzKCk6IG51bWJlcltdIHtcclxuICAgICAgICBsZXQgY29sSGVpZ2h0czogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgY29sSGVpZ2h0cy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBoaWdoZXN0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gTUFYX1JPV1MgLSAxOyByb3dJZHggPj0gMDsgcm93SWR4LS0pIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBoaWdoZXN0ID0gTUFYX1JPV1MgLSByb3dJZHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29sSGVpZ2h0c1tjb2xJZHhdID0gaGlnaGVzdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbEhlaWdodHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgb25seSByZWFzb24gdGhpcyBpcyBub3QgcHJpdmF0ZSBpcyBzbyB0aGUgQUkgY2FuIGV4cGVyaW1lbnQgd2l0aCBpdC5cclxuICAgICAqIFdvcmsgaGVyZSBzaG91bGQgYWJsZSB0byBiZSBiZSB1bmRvbmUgYnkgdW5kb0NvbnZlcnRTaGFwZVRvQ2VsbHMuXHJcbiAgICAgKi9cclxuICAgIGNvbnZlcnRTaGFwZVRvQ2VsbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIHRoaXMuY3VycmVudFNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgcm93SWR4ID0gb2Zmc2V0LnkgKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICAgICAgbGV0IGNvbElkeCA9IG9mZnNldC54ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm93SWR4IDwgMCB8fCByb3dJZHggPj0gdGhpcy5tYXRyaXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbElkeCA8IDAgfHwgY29sSWR4ID49IHRoaXMubWF0cml4W3Jvd0lkeF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDZWxsQ29sb3Iocm93SWR4LCBjb2xJZHgsIHRoaXMuY3VycmVudFNoYXBlLmNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS4gU2hvdWxkIHVuZG8gY29udmVydFNoYXBlVG9DZWxscygpLlxyXG4gICAgICovXHJcbiAgICB1bmRvQ29udmVydFNoYXBlVG9DZWxscygpIHtcclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2YgdGhpcy5jdXJyZW50U2hhcGUuZ2V0T2Zmc2V0cygpKSB7XHJcbiAgICAgICAgICAgIGxldCByb3dJZHggPSBvZmZzZXQueSArIHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpO1xyXG4gICAgICAgICAgICBsZXQgY29sSWR4ID0gb2Zmc2V0LnggKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3dJZHggPCAwIHx8IHJvd0lkeCA+PSB0aGlzLm1hdHJpeC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sSWR4IDwgMCB8fCBjb2xJZHggPj0gdGhpcy5tYXRyaXhbcm93SWR4XS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgQ29sb3IuRW1wdHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNsZWFyKCkge1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgQ29sb3IuRW1wdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBbdGhpcy5qdW5rUm93Q29sb3IxLCB0aGlzLmp1bmtSb3dDb2xvcjJdID0gdGhpcy5nZXRSYW5kb21Db2xvcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciBtZXRob2QgdG8gY2hhbmdlIGEgc2luZ2xlIGNlbGwgY29sb3IncyBhbmQgbm90aWZ5IHN1YnNjcmliZXJzIGF0IHRoZSBzYW1lIHRpbWUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2hhbmdlQ2VsbENvbG9yKHJvd0lkeDogbnVtYmVyLCBjb2xJZHg6IG51bWJlciwgY29sb3I6IENvbG9yKSB7XHJcbiAgICAgICAgLy8gVE9ETzogTWF5YmUgYm91bmRzIGNoZWNrIGhlcmUuXHJcbiAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgY2VsbC5zZXRDb2xvcihjb2xvcik7XHJcbiAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBDZWxsQ2hhbmdlRXZlbnQoY2VsbCwgcm93SWR4LCBjb2xJZHgsIHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhcnRTaGFwZShmb3JjZUJhZ1JlZmlsbDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlID0gdGhpcy5zaGFwZUZhY3RvcnkubmV4dFNoYXBlKGZvcmNlQmFnUmVmaWxsKTtcclxuICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHRyeUdyYXZpdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGNhbk1vdmVEb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIGNhbk1vdmVEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gY2FuTW92ZURvd247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlbmRlZCBmb3IgY2hlY2tpbmcgb2YgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnRcclxuICAgICAqIHNoYXBlIGhhcyBhbnkgb3ZlcmxhcCB3aXRoIGV4aXN0aW5nIGNlbGxzIHRoYXQgaGF2ZSBjb2xvci5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjb2xsaXNpb25EZXRlY3RlZCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgY29sbGlzaW9uID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiB0aGlzLmN1cnJlbnRTaGFwZS5nZXRPZmZzZXRzKCkpIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IG9mZnNldC55ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Um93KCk7XHJcbiAgICAgICAgICAgIGxldCBjb2wgPSBvZmZzZXQueCArIHRoaXMuY3VycmVudFNoYXBlLmdldENvbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvdyA8IDAgfHwgcm93ID49IHRoaXMubWF0cml4Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sIDwgMCB8fCBjb2wgPj0gdGhpcy5tYXRyaXhbcm93XS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubWF0cml4W3Jvd11bY29sXS5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29sbGlzaW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlRnVsbEJvYXJkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBmdWxsID0gdGhpcy5pc0JvYXJkRnVsbCgpO1xyXG4gICAgICAgIGlmIChmdWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuUGF1c2VkOyAvLyBTdGFuZGJ5IHVudGlsIHNlcXVlbmNlIGlzIGZpbmlzaGVkLlxyXG4gICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IEJvYXJkRmlsbGVkRXZlbnQodGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIGZ1bGwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEl0IGlzIGNvbnNpZGVyZWQgZnVsbCBpZiB0aGUgdHdvIG9ic2N1cmVkIHJvd3MgYXQgdGhlIHRvcCBoYXZlIGNvbG9yZWQgY2VsbHMgaW4gdGhlbS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBpc0JvYXJkRnVsbCgpOiBib29sZWFuIHtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCAyOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZmlsbGVkIGxpbmVzIG1ldGhvZCAxIG9mIDIsIGJlZm9yZSBhbmltYXRpb24uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaGFuZGxlQW55RmlsbGVkTGluZXNQYXJ0MSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZmlsbGVkUm93SWR4cyA9IHRoaXMuZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpO1xyXG4gICAgICAgIGlmIChmaWxsZWRSb3dJZHhzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBSb3dzRmlsbGVkRXZlbnQoZmlsbGVkUm93SWR4cywgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuUGF1c2VkOyAvLyBTdGFuZGJ5IHVudGlsIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBEb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIGlmIHRoZXJlIGFyZSBubyBmaWxsZWQgbGluZXMuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmaWxsZWRSb3dJZHhzLmxlbmd0aCA+IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZmlsbGVkIGxpbmVzIG1ldGhvZCAyIG9mIDIsIGFmdGVyIGFuaW1hdGlvbi5cclxuICAgICAqIFRoaXMgaXMgcHVibGljIHNvIHRoYXQgdGhlIE1vZGVsIGNhbiBjYWxsIGl0LlxyXG4gICAgICovXHJcbiAgICBoYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQyKCkge1xyXG4gICAgICAgIC8vIEhhdmUgdG8gY2hlY2sgdGhpcyBhZ2FpbiBiZWNhdXNlIHRoZXJlIGlzIGEgc2xpZ2h0IGNoYW5jZSB0aGF0IHJvd3Mgc2hpZnRlZCBkdXJpbmcgdGhlIGFuaW1hdGlvbi5cclxuICAgICAgICBsZXQgZmlsbGVkUm93SWR4cyA9IHRoaXMuZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdGhlIGZpbGxlZCByb3dzLlxyXG4gICAgICAgIC8vIEkgdGhpbmsgdGhpcyBvbmx5IHdvcmtzIGJlY2F1c2UgZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpIHJldHVybnMgYW4gYXJyYXkgc29ydGVkIGFzY2VuZGluZyBmcm9tIDAuXHJcbiAgICAgICAgLy8gSWYgaXQgd2Fzbid0IHNvcnRlZCB0aGVuIGl0IGNvdWxkIGVuZCB1cCBza2lwcGluZyByb3dzLlxyXG4gICAgICAgIGZvciAobGV0IGZpbGxlZFJvd0lkeCBvZiBmaWxsZWRSb3dJZHhzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQW5kQ29sbGFwc2UoZmlsbGVkUm93SWR4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhhdmUgdG8gc2VuZCBjZWxsIGNoYW5nZSBub3RpZmljYXRpb25zIGJlY2F1c2UgcmVtb3ZlQW5kQ29sbGFwc2UoKSBkb2VzIG5vdC5cclxuICAgICAgICB0aGlzLm5vdGlmeUFsbENlbGxzKCk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGlvbiB3YXMgZmluaXNoZWQgYW5kIGJvYXJkIHdhcyB1cGRhdGVkLCBzbyByZXN1bWUgcGxheS5cclxuICAgICAgICB0aGlzLmJvYXJkU3RhdGUgPSBCb2FyZFN0YXRlLkluUGxheTtcclxuICAgICAgICB0aGlzLnN0YXJ0U2hhcGUoZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBvbmx5IHRoZSBib3R0b20gcm93LlxyXG4gICAgICovXHJcbiAgICByZW1vdmVCb3R0b21MaW5lKCkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQW5kQ29sbGFwc2UoTUFYX1JPV1MgLSAxKTtcclxuXHJcbiAgICAgICAgLy8gSGF2ZSB0byBzZW5kIGNlbGwgY2hhbmdlIG5vdGlmaWNhdGlvbnMgYmVjYXVzZSByZW1vdmVBbmRDb2xsYXBzZSgpIGRvZXMgbm90LlxyXG4gICAgICAgIHRoaXMubm90aWZ5QWxsQ2VsbHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG5vdGlmeUFsbENlbGxzKCkge1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IE1BWF9ST1dTOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBDZWxsQ2hhbmdlRXZlbnQoY2VsbCwgcm93SWR4LCBjb2xJZHgsIHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGxpc3Qgb2YgbnVtYmVycywgYXNjZW5kaW5nLCB0aGF0IGNvcnJlc3BvbmQgdG8gZmlsbGVkIHJvd3MuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpOiBudW1iZXJbXSB7XHJcbiAgICAgICAgbGV0IGZpbGxlZFJvd0lkeHM6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgbGV0IGZpbGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNlbGwgb2Ygcm93KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChmaWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIGZpbGxlZFJvd0lkeHMucHVzaChyb3dJZHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmaWxsZWRSb3dJZHhzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyByZW1vdmVzIHRoZSBvbGQgcm93IGFuZCBwdXRzIGEgbmV3IHJvdyBpbiBpdHMgcGxhY2UgYXQgcG9zaXRpb24gMCwgd2hpY2ggaXMgdGhlIGhpZ2hlc3QgdmlzdWFsbHkgdG8gdGhlIHBsYXllci5cclxuICAgICAqIERlbGVnYXRlcyBjZWxsIG5vdGlmaWNhdGlvbiB0byB0aGUgY2FsbGluZyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVtb3ZlQW5kQ29sbGFwc2Uocm93SWR4OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2Uocm93SWR4LCAxKTtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2UoMCwgMCwgW10pO1xyXG4gICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFswXVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoc3RhcnRpbmc9ZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KHRoaXMuY3VycmVudFNoYXBlLCB0aGlzLnBsYXllclR5cGUsIHN0YXJ0aW5nKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXROZXh0SnVua1Jvd0NvbG9yKCk6IENvbG9yIHtcclxuICAgICAgICBsZXQgY29sb3I6IENvbG9yO1xyXG4gICAgICAgIGlmICh0aGlzLmp1bmtSb3dDb2xvcklkeCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gdGhpcy5qdW5rUm93Q29sb3IxO1xyXG4gICAgICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcklkeCA9IDE7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmp1bmtSb3dDb2xvcklkeCA+PSAxKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gdGhpcy5qdW5rUm93Q29sb3IyO1xyXG4gICAgICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcklkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFJhbmRvbUNvbG9ycygpOiBbQ29sb3IsIENvbG9yXSB7XHJcblxyXG4gICAgICAgIC8vIFNlbGVjdCB0d28gY29sb3JzIHRoYXQgYXJlIG5vdCBlcXVhbCB0byBlYWNoIG90aGVyLlxyXG4gICAgICAgIGxldCByYW5kMSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgIGxldCByYW5kMiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgIGlmIChyYW5kMSA9PT0gcmFuZDIpIHtcclxuICAgICAgICAgICAgcmFuZDIrKztcclxuICAgICAgICAgICAgaWYgKHJhbmQyID4gNikge1xyXG4gICAgICAgICAgICAgICAgcmFuZDIgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbdGhpcy5jb2xvckJ5TnVtYmVyKHJhbmQxKSwgdGhpcy5jb2xvckJ5TnVtYmVyKHJhbmQyKV07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgY29sb3JCeU51bWJlcih2YWx1ZTogbnVtYmVyKTogQ29sb3Ige1xyXG4gICAgICAgIGxldCBjb2xvcjogQ29sb3I7XHJcbiAgICAgICAgc3dpdGNoKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuQ3lhbjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLlllbGxvdztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLlB1cnBsZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLkdyZWVuO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuUmVkO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuQmx1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLk9yYW5nZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5XaGl0ZTsgLy8gU2hvdWxkbid0IGdldCBoZXJlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVFdFRU46IGFueTtcclxuXHJcbmNvbnN0IEZBTExfVElNRV9NUyA9IDE3NTA7XHJcblxyXG5pbnRlcmZhY2UgRmFsbGluZ0JvYXJkIHtcclxuICAgIGNhbGN1bGF0ZUhpZ2hlc3RDb2x1bW4oKTogbnVtYmVyO1xyXG4gICAgcmVtb3ZlQm90dG9tTGluZSgpOiB2b2lkO1xyXG4gICAgcmVzZXRBbmRQbGF5KCk6IHZvaWRcclxufVxyXG5cclxuY2xhc3MgRmFsbEd1aWRlIHtcclxuICAgIGxhc3RIZWlnaHQ6IG51bWJlcjtcclxuICAgIHR3ZWVuZWRIZWlnaHQ6IG51bWJlcjtcclxuICAgIGVsYXBzZWQ6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZhbGxpbmdTZXF1ZW5jZXIge1xyXG5cclxuICAgIHByaXZhdGUgYm9hcmQ6IEZhbGxpbmdCb2FyZDtcclxuICAgIHByaXZhdGUgZmFsbFR3ZWVuOiBhbnk7XHJcbiAgICBwcml2YXRlIGZhbGxUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZmFsbEd1aWRlOiBGYWxsR3VpZGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoYm9hcmQ6IEZhbGxpbmdCb2FyZCkge1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSBib2FyZDtcclxuICAgICAgICB0aGlzLmZhbGxUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5mYWxsR3VpZGUgPSBuZXcgRmFsbEd1aWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRBbmRQbGF5KGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5mYWxsR3VpZGUubGFzdEhlaWdodCA9IHRoaXMuZmFsbEd1aWRlLnR3ZWVuZWRIZWlnaHQgPSB0aGlzLmJvYXJkLmNhbGN1bGF0ZUhpZ2hlc3RDb2x1bW4oKTtcclxuICAgICAgICB0aGlzLmZhbGxHdWlkZS5lbGFwc2VkID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5mYWxsVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5mYWxsR3VpZGUpXHJcbiAgICAgICAgICAgIC50byh7dHdlZW5lZEhlaWdodDogMH0sIEZBTExfVElNRV9NUylcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuTGluZWFyLk5vbmUpIC8vIFN1cnByaXNpbmdseSwgbGluZWFyIGlzIHRoZSBvbmUgdGhhdCBsb29rcyBtb3N0IFwicmlnaHRcIi5cclxuICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mYWxsVHdlZW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5yZXNldEFuZFBsYXkoKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGFydCh0aGlzLmZhbGxHdWlkZS5lbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERvaW5nIHRoaXMgaW4gdHdvIHBhcnRzIGJlY2F1c2Ugb25Db21wbGV0ZSgpIGNhbiBzZXQgdGhlIHR3ZWVuIHRvIG51bGwuXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZmFsbFR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5mYWxsR3VpZGUuZWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLmZhbGxUd2Vlbi51cGRhdGUodGhpcy5mYWxsR3VpZGUuZWxhcHNlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5mYWxsVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgbmV3SGVpZ2h0ID0gTWF0aC5jZWlsKHRoaXMuZmFsbEd1aWRlLnR3ZWVuZWRIZWlnaHQpO1xyXG4gICAgICAgICAgICBpZiAgKHRoaXMuZmFsbEd1aWRlLmxhc3RIZWlnaHQgPiBuZXdIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkaWZmID0gdGhpcy5mYWxsR3VpZGUubGFzdEhlaWdodCAtIG5ld0hlaWdodDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGRpZmY7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5yZW1vdmVCb3R0b21MaW5lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZhbGxHdWlkZS5sYXN0SGVpZ2h0ID0gbmV3SGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi9zaGFwZSc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcblxyXG5jbGFzcyBTaGFwZUkgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkN5YW47XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSA0O1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IHRydWU7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVJIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlSSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZUogZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkJsdWU7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IHRydWU7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdO1xyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlSiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZUooKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVMIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5PcmFuZ2U7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IHRydWU7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAxLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVMIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlTCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZU8gZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLlllbGxvdztcclxuICAgIHZhbHVlc1BlclJvdyA9IDQ7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gZmFsc2U7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVPIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlTygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZVMgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkdyZWVuO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSBmYWxzZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZVMge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVTKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlVCBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuUHVycGxlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSB0cnVlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlVCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVQoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVaIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5SZWQ7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IGZhbHNlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlWiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVooKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNoYXBlRmFjdG9yeSB7XHJcbiAgICBwcml2YXRlIGJhZzogU2hhcGVbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnJlZmlsbEJhZyh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0U2hhcGUoZm9yY2VCYWdSZWZpbGw6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5iYWcubGVuZ3RoIDw9IDAgfHwgZm9yY2VCYWdSZWZpbGwgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZpbGxCYWcoZm9yY2VCYWdSZWZpbGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5iYWcucG9wKCk7IC8vIEdldCBmcm9tIGVuZCBvZiBhcnJheS5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlZmlsbEJhZyhzdGFydGluZ1BpZWNlQXNGaXJzdDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuYmFnID0gW1xyXG4gICAgICAgICAgICBuZXcgU2hhcGVJKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZUooKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlTCgpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVUKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZU8oKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlUygpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVaKClcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEZpc2hlci1ZYXRlcyBTaHVmZmxlLCBiYXNlZCBvbjogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjQ1MDk3NlxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gdGhpcy5iYWcubGVuZ3RoXHJcbiAgICAgICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgICAgICAgICAgIHdoaWxlICgwICE9PSBpZHgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgICAgICAgICAgICAgbGV0IHJuZElkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGlkeCk7XHJcbiAgICAgICAgICAgICAgICBpZHggLT0gMTtcclxuICAgICAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICAgICAgICAgIGxldCB0ZW1wVmFsID0gdGhpcy5iYWdbaWR4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFnW2lkeF0gPSB0aGlzLmJhZ1tybmRJZHhdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWdbcm5kSWR4XSA9IHRlbXBWYWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE9ubHkgY2VydGFpbiBzaGFwZXMgY2FuIGJlIGRyb3BwZWQgb250byB3aGF0IGNvdWxkIGJlIGEgYmxhbmsgb3IgYWxtb3N0LWJsYW5rIGdyaWQuXHJcbiAgICAgICAgaWYgKHN0YXJ0aW5nUGllY2VBc0ZpcnN0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0SWR4ID0gdGhpcy5iYWcubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmFnW2xhc3RJZHhdLnN0YXJ0aW5nRWxpZ2libGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvIG5vdCBuZWVkIHRvIGRvIGFueXRoaW5nLlxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgbGFzdElkeDsgaWR4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5iYWdbaWR4XS5zdGFydGluZ0VsaWdpYmxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wVmFsID0gdGhpcy5iYWdbbGFzdElkeF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmFnW2xhc3RJZHhdID0gdGhpcy5iYWdbaWR4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWdbaWR4XSA9IHRlbXBWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZGVhZFNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTsgLy8gVXNlZCBieSBBSS4iLCJpbXBvcnQge0NlbGxPZmZzZXR9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuXHJcbmNvbnN0IFNQQVdOX0NPTCA9IDM7IC8vIExlZnQgc2lkZSBvZiBtYXRyaXggc2hvdWxkIGNvcnJlc3BvbmQgdG8gdGhpcy5cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTaGFwZSB7XHJcbiAgICBhYnN0cmFjdCByZWFkb25seSBjb2xvcjogQ29sb3I7XHJcbiAgICBhYnN0cmFjdCByZWFkb25seSB2YWx1ZXNQZXJSb3c6IG51bWJlcjtcclxuICAgIGFic3RyYWN0IHJlYWRvbmx5IHN0YXJ0aW5nRWxpZ2libGU6IGJvb2xlYW47XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IG1hdHJpY2VzOiBSZWFkb25seUFycmF5PFJlYWRvbmx5QXJyYXk8bnVtYmVyPj47XHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0SW5zdGFuY2UoKTogU2hhcGU7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50TWF0cml4SW5kZXg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcm93OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGNvbDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID0gMDsgLy8gVE9ETzogRW5zdXJlIHBvc2l0aW9uIDAgaXMgdGhlIHNwYXduIHBvc2l0aW9uXHJcbiAgICAgICAgdGhpcy5yb3cgPSAwO1xyXG4gICAgICAgIHRoaXMuY29sID0gU1BBV05fQ09MO1xyXG4gICAgICAgIHRoaXMuc3RhcnRpbmdFbGlnaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgIHRoaXMuY29sLS07XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVJpZ2h0KCkge1xyXG4gICAgICAgIHRoaXMuY29sKys7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVVwKCkge1xyXG4gICAgICAgIHRoaXMucm93LS07XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZURvd24oKSB7XHJcbiAgICAgICAgdGhpcy5yb3crKztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBtb3ZlVG9Ub3AoKSB7XHJcbiAgICAgICAgdGhpcy5yb3cgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUNvdW50ZXJDbG9ja3dpc2UoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggLT0gMTtcclxuICAgICAgICB0aGlzLmVuc3VyZUFycmF5Qm91bmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQ2xvY2t3aXNlKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ICs9IDE7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVBcnJheUJvdW5kcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvdygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3c7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3dDb3VudCgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMuZ2V0Q3VycmVudE1hdHJpeCgpLmxlbmd0aCAvIHRoaXMudmFsdWVzUGVyUm93KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRPZmZzZXRzKCk6IENlbGxPZmZzZXRbXSB7XHJcbiAgICAgICAgbGV0IG1hdHJpeCA9IHRoaXMuZ2V0Q3VycmVudE1hdHJpeCgpO1xyXG4gICAgICAgIGxldCBvZmZzZXRzOiBDZWxsT2Zmc2V0W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBtYXRyaXgubGVuZ3RoOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXRyaXhbaWR4XTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGlkeCAlIHRoaXMudmFsdWVzUGVyUm93O1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKGlkeCAvIHRoaXMudmFsdWVzUGVyUm93KTtcclxuICAgICAgICAgICAgICAgIGxldCBvZmZzZXQgPSBuZXcgQ2VsbE9mZnNldCh4LCB5KTtcclxuICAgICAgICAgICAgICAgIG9mZnNldHMucHVzaChvZmZzZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvZmZzZXRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFja3kgbWV0aG9kIHVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICogXCJTaW1wbGVcIiBhcyBpbiBkb2Vzbid0IG1hdHRlciB3aGF0IHRoZSBjdXJyZW50IHJvdy9jb2wvbWF0cml4IGlzLlxyXG4gICAgICovXHJcbiAgICBjbG9uZVNpbXBsZSgpOiBTaGFwZSB7XHJcbiAgICAgICAgLy8gR2V0IGFuIGluc3RhbmNlIG9mIHRoZSBjb25jcmV0ZSBjbGFzcy4gUmVzdCBvZiB2YWx1ZXMgYXJlIGlycmVsZXZhbnQuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEN1cnJlbnRNYXRyaXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0cmljZXNbdGhpcy5jdXJyZW50TWF0cml4SW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZW5zdXJlQXJyYXlCb3VuZHMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudE1hdHJpeEluZGV4IDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IHRoaXMubWF0cmljZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID49IHRoaXMubWF0cmljZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0JvYXJkfSBmcm9tICcuL2JvYXJkL2JvYXJkJztcclxuaW1wb3J0IHtBaX0gZnJvbSAnLi9haS9haSc7XHJcbmltcG9ydCB7bnBjTWFuYWdlcn0gZnJvbSAnLi9ucGMvbnBjLW1hbmFnZXInO1xyXG5pbXBvcnQge2V2ZW50QnVzLCBFdmVudFR5cGV9IGZyb20gJy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi9kb21haW4vY29uc3RhbnRzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9hY3RpdmUtc2hhcGUtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7Um93c0ZpbGxlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9yb3dzLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7Um93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnR9IGZyb20gJy4uL2V2ZW50L3Jvd3MtY2xlYXItYW5pbWF0aW9uLWNvbXBsZXRlZC1ldmVudCc7XHJcbmltcG9ydCB7Qm9hcmRGaWxsZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvYm9hcmQtZmlsbGVkLWV2ZW50JztcclxuaW1wb3J0IHtIcENoYW5nZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvaHAtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7U2hhcGVGYWN0b3J5fSBmcm9tICcuL2JvYXJkL3NoYXBlLWZhY3RvcnknO1xyXG5pbXBvcnQge0ZhbGxpbmdTZXF1ZW5jZXJ9IGZyb20gJy4vYm9hcmQvZmFsbGluZy1zZXF1ZW5jZXInO1xyXG5pbXBvcnQge0ZhbGxpbmdTZXF1ZW5jZXJFdmVudH0gZnJvbSAnLi4vZXZlbnQvZmFsbGluZy1zZXF1ZW5jZXItZXZlbnQnO1xyXG5cclxuY29uc3QgTUFYX0hQID0gUEFORUxfQ09VTlRfUEVSX0ZMT09SOyAvLyBIUCBjb3JyZXNwb25kcyB0byB0aGUgbnVtYmVyIG9mIGxvbmcgd2luZG93cyBvbiB0aGUgc2Vjb25kIGZsb29yIG9mIHRoZSBwaHlzaWNhbCBidWlsZGluZy5cclxuXHJcbmNsYXNzIE1vZGVsIHtcclxuICAgIHByaXZhdGUgaHVtYW5Cb2FyZDogQm9hcmQ7XHJcbiAgICBwcml2YXRlIGh1bWFuRmFsbGluZ1NlcXVlbmNlcjogRmFsbGluZ1NlcXVlbmNlcjtcclxuICAgIHByaXZhdGUgaHVtYW5IaXRQb2ludHM6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGFpQm9hcmQ6IEJvYXJkO1xyXG4gICAgcHJpdmF0ZSBhaUZhbGxpbmdTZXF1ZW5jZXI6IEZhbGxpbmdTZXF1ZW5jZXI7XHJcbiAgICBwcml2YXRlIGFpSGl0UG9pbnRzOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBhaTogQWk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgbGV0IGh1bWFuU2hhcGVGYWN0b3J5ID0gbmV3IFNoYXBlRmFjdG9yeSgpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5Cb2FyZCA9IG5ldyBCb2FyZChQbGF5ZXJUeXBlLkh1bWFuLCBodW1hblNoYXBlRmFjdG9yeSwgZXZlbnRCdXMpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5GYWxsaW5nU2VxdWVuY2VyID0gbmV3IEZhbGxpbmdTZXF1ZW5jZXIodGhpcy5odW1hbkJvYXJkKTtcclxuICAgICAgICB0aGlzLmh1bWFuSGl0UG9pbnRzID0gTUFYX0hQO1xyXG5cclxuICAgICAgICBsZXQgYWlTaGFwZUZhY3RvcnkgPSBuZXcgU2hhcGVGYWN0b3J5KCk7XHJcbiAgICAgICAgdGhpcy5haUJvYXJkID0gbmV3IEJvYXJkKFBsYXllclR5cGUuQWksIGFpU2hhcGVGYWN0b3J5LCBldmVudEJ1cyk7XHJcbiAgICAgICAgdGhpcy5haUZhbGxpbmdTZXF1ZW5jZXIgPSBuZXcgRmFsbGluZ1NlcXVlbmNlcih0aGlzLmFpQm9hcmQpO1xyXG4gICAgICAgIHRoaXMuYWlIaXRQb2ludHMgPSBNQVhfSFA7XHJcblxyXG4gICAgICAgIHRoaXMuYWkgPSBuZXcgQWkodGhpcy5haUJvYXJkKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuUGxheWVyTW92ZW1lbnRFdmVudFR5cGUsIChldmVudDogUGxheWVyTW92ZW1lbnRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVBsYXllck1vdmVtZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlJvd3NGaWxsZWRFdmVudFR5cGUsIChldmVudDogUm93c0ZpbGxlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUm93c0ZpbGxlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50VHlwZSwgKGV2ZW50OiBSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVJvd0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQm9hcmRGaWxsZWRFdmVudFR5cGUsIChldmVudDogQm9hcmRGaWxsZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUJvYXJkRmlsbGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYWkuc3RhcnQoKTtcclxuICAgICAgICBucGNNYW5hZ2VyLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IEluc3RlYWQgb2YgaGVyZSwgc3RhcnQgZ2FtZSB3aGVuIHBsYXllciBoaXRzIGEga2V5IGZpcnN0LlxyXG4gICAgICAgIHRoaXMuaHVtYW5Cb2FyZC5yZXNldEFuZFBsYXkoKTtcclxuICAgICAgICB0aGlzLmFpQm9hcmQucmVzZXRBbmRQbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmh1bWFuQm9hcmQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmh1bWFuRmFsbGluZ1NlcXVlbmNlci5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmFpQm9hcmQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmFpRmFsbGluZ1NlcXVlbmNlci5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmFpLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIG5wY01hbmFnZXIuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVBsYXllck1vdmVtZW50KGV2ZW50OiBQbGF5ZXJNb3ZlbWVudEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGJvYXJkID0gdGhpcy5kZXRlcm1pbmVCb2FyZEZvcihldmVudC5wbGF5ZXJUeXBlKTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChldmVudC5tb3ZlbWVudCkge1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LkxlZnQ6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5SaWdodDpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Eb3duOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlRG93bigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuRHJvcDpcclxuICAgICAgICAgICAgICAgIGlmIChib2FyZC5tb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCkpIHsgICAgICAgLy8gQ2hlY2sgdGhhdCB3ZSBhcmUgaW4gYSBwb3NpdGlvbiB0byBtb3ZlIHRoZSBzaGFwZSBkb3duIGJlZm9yZSBleGVjdXRpbmcgdGhlIG5leHQgbGluZS4gXHJcbiAgICAgICAgICAgICAgICAgICAgYm9hcmQuaGFuZGxlRW5kT2ZDdXJyZW50UGllY2VUYXNrcygpOyAgIC8vIFByZXZlbnRzIGFueSBvdGhlciBrZXlzdHJva2VzIGFmZmVjdGluZyB0aGUgc2hhcGUgYWZ0ZXIgaXQgaGl0cyB0aGUgYm90dG9tLlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuUm90YXRlQ2xvY2t3aXNlOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQucm90YXRlU2hhcGVDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VuaGFuZGxlZCBtb3ZlbWVudCcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNmZXIgdGhlIGZpbGxlZCByb3dzIHRvIGJlIGp1bmsgcm93cyBvbiB0aGUgb3Bwb3NpdGUgcGxheWVyJ3MgYm9hcmQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaGFuZGxlUm93c0ZpbGxlZEV2ZW50KGV2ZW50OiBSb3dzRmlsbGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgYm9hcmQgPSB0aGlzLmRldGVybWluZUJvYXJkRm9yT3Bwb3NpdGVPZihldmVudC5wbGF5ZXJUeXBlKTtcclxuICAgICAgICBib2FyZC5hZGRKdW5rUm93cyhldmVudC5maWxsZWRSb3dJZHhzLmxlbmd0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVSb3dDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KGV2ZW50OiBSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBib2FyZCA9IHRoaXMuZGV0ZXJtaW5lQm9hcmRGb3IoZXZlbnQucGxheWVyVHlwZSk7XHJcbiAgICAgICAgYm9hcmQuaGFuZGxlQW55RmlsbGVkTGluZXNQYXJ0MigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaHVtYW4ncyBib2FyZCBpZiBnaXZlbiB0aGUgaHVtYW4ncyB0eXBlLCBvciBBSSdzIGJvYXJkIGlmIGdpdmVuIHRoZSBBSS4gXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lQm9hcmRGb3IocGxheWVyVHlwZTogUGxheWVyVHlwZSk6IEJvYXJkIHtcclxuICAgICAgICBpZiAocGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5odW1hbkJvYXJkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFpQm9hcmQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgdGhpcyBtZXRob2QgaXMgZ2l2ZW4gXCJIdW1hblwiLCBpdCB3aWxsIHJldHVybiB0aGUgQUkncyBib2FyZCwgYW5kIHZpY2UgdmVyc2EuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lQm9hcmRGb3JPcHBvc2l0ZU9mKHBsYXllclR5cGU6IFBsYXllclR5cGUpOiBCb2FyZCB7XHJcbiAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWlCb2FyZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5odW1hbkJvYXJkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUJvYXJkRmlsbGVkRXZlbnQoZXZlbnQ6IEJvYXJkRmlsbGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgYm9hcmQ6IEJvYXJkO1xyXG4gICAgICAgIGxldCBmYWxsaW5nU2VxdWVuY2VyOiBGYWxsaW5nU2VxdWVuY2VyO1xyXG4gICAgICAgIGxldCBocDogbnVtYmVyO1xyXG5cclxuICAgICAgICBpZiAoZXZlbnQucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICBib2FyZCA9IHRoaXMuaHVtYW5Cb2FyZDtcclxuICAgICAgICAgICAgZmFsbGluZ1NlcXVlbmNlciA9IHRoaXMuaHVtYW5GYWxsaW5nU2VxdWVuY2VyO1xyXG4gICAgICAgICAgICBocCA9ICh0aGlzLmh1bWFuSGl0UG9pbnRzIC09IDEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJvYXJkID0gdGhpcy5haUJvYXJkO1xyXG4gICAgICAgICAgICBmYWxsaW5nU2VxdWVuY2VyID0gdGhpcy5haUZhbGxpbmdTZXF1ZW5jZXI7XHJcbiAgICAgICAgICAgIGhwID0gKHRoaXMuYWlIaXRQb2ludHMgLT0gMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBIcENoYW5nZWRFdmVudChocCwgZXZlbnQucGxheWVyVHlwZSkpO1xyXG4gICAgICAgIC8vIFRPRE86IFNlZSBpZiBvbmUgb2YgdGhlIHBsYXllcnMgaGFzIHJ1biBvdXQgb2YgSFAsIHNvbWV3aGVyZSBpZiBub3QgaGVyZS5cclxuXHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgRmFsbGluZ1NlcXVlbmNlckV2ZW50KGV2ZW50LnBsYXllclR5cGUpKTtcclxuICAgICAgICBmYWxsaW5nU2VxdWVuY2VyLnJlc2V0QW5kUGxheSgoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IEkgZG9uJ3Qga25vdywgbWF5YmUgbm90aGluZy5cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KGV2ZW50OiBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGlmIChldmVudC5zdGFydGluZyA9PT0gdHJ1ZSAmJiBldmVudC5wbGF5ZXJUeXBlID09PSBQbGF5ZXJUeXBlLkFpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWkuc3RyYXRlZ2l6ZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIE5vdGhpbmcgY3VycmVudGx5IGZvciB0aGUgaHVtYW4ncyBib2FyZCB0byBiZSBkb2luZyBhdCB0aGlzIHRpbWUuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBtb2RlbCA9IG5ldyBNb2RlbCgpOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0L2xpYi9saWIuZXM2LmQudHMnLz5cclxuXHJcbmltcG9ydCB7TnBjfSBmcm9tICcuL25wYydcclxuaW1wb3J0IHtOcGNTdGF0ZX0gZnJvbSAnLi4vLi4vZG9tYWluL25wYy1zdGF0ZSc7XHJcbmltcG9ydCB7ZXZlbnRCdXMsIEV2ZW50VHlwZX0gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9zdGFuZGVlLW1vdmVtZW50LWVuZGVkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNQbGFjZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLXBsYWNlZC1ldmVudCc7XHJcblxyXG4vLyBTdGFydGluZyBwb3NpdGlvbiBjb3VudHMgdXNlZCBpbiBpbml0aWFsaXphdGlvbi5cclxuY29uc3QgVE9UQUxfTlBDUyA9IDIwO1xyXG5cclxuY2xhc3MgTnBjTWFuYWdlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBucGNzOiBNYXA8bnVtYmVyLCBOcGM+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubnBjcyA9IG5ldyBNYXA8bnVtYmVyLCBOcGM+KCk7XHJcbiAgICAgICAgZm9yIChsZXQgbnBjSWR4ID0gMDsgbnBjSWR4IDwgVE9UQUxfTlBDUzsgbnBjSWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IG5wYyA9IG5ldyBOcGMoKTtcclxuICAgICAgICAgICAgdGhpcy5ucGNzLnNldChucGMuaWQsIG5wYyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5TdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZSwgKGV2ZW50OiBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubnBjcy5mb3JFYWNoKChucGM6IE5wYykgPT4ge1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IChNYXRoLnJhbmRvbSgpICogNyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IChNYXRoLnJhbmRvbSgpICogMTUpO1xyXG4gICAgICAgICAgICAgICAgbnBjLnN0YXJ0KHgsIHkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiBNb3ZlIHRoaXMgZWxzZXdoZXJlOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IChNYXRoLnJhbmRvbSgpICogNyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IChNYXRoLnJhbmRvbSgpICogMTUpO1xyXG4gICAgICAgICAgICAgICAgbnBjLmJlZ2luV2Fsa2luZ1RvKHgsIHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm5wY3MuZm9yRWFjaCgobnBjOiBOcGMpID0+IHtcclxuICAgICAgICAgICAgbnBjLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KGV2ZW50OiBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IG5wYyA9IHRoaXMubnBjcy5nZXQoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIGlmIChucGMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGV2ZW50Lng7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IGV2ZW50Lno7XHJcbiAgICAgICAgICAgICAgICBucGMudXBkYXRlUG9zaXRpb24oeCwgeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gKE1hdGgucmFuZG9tKCkgKiA3KTtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gKE1hdGgucmFuZG9tKCkgKiAxNSk7XHJcbiAgICAgICAgICAgICAgICBucGMuYmVnaW5XYWxraW5nVG8oeCwgeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IG5wY01hbmFnZXIgPSBuZXcgTnBjTWFuYWdlcigpOyIsImltcG9ydCB7RXZlbnRUeXBlLCBldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtOcGNQbGFjZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLXBsYWNlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1tb3ZlbWVudC1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNTdGF0ZX0gZnJvbSAnLi4vLi4vZG9tYWluL25wYy1zdGF0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjIHtcclxuICAgIHJlYWRvbmx5IGlkOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0ZTogTnBjU3RhdGU7XHJcbiAgICBwcml2YXRlIHRpbWVJblN0YXRlOiBudW1iZXI7XHJcblxyXG4gICAgLy8gXCJMYXN0XCIgYXMgaW4gdGhlIGxhc3Qga25vd24gY29vcmRpbmF0ZSwgYmVjYXVzZSBpdCBjb3VsZCBiZSBjdXJyZW50bHkgaW4tbW90aW9uLlxyXG4gICAgcHJpdmF0ZSB4bGFzdDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB5bGFzdDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUik7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBOcGNTdGF0ZS5JZGxlO1xyXG4gICAgICAgIHRoaXMudGltZUluU3RhdGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnhsYXN0ID0gMDtcclxuICAgICAgICB0aGlzLnlsYXN0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueGxhc3QgPSB4O1xyXG4gICAgICAgIHRoaXMueWxhc3QgPSB5O1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IE5wY1BsYWNlZEV2ZW50KHRoaXMuaWQsIHRoaXMuc3RhdGUsIHgsIHkpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCBieSB0aGUgTlBDIG1hbmFnZXIgcmF0aGVyIHRoYW4gdHJhY2tzIHRoYXQgcmVmZXJlbmNlIHRoZW0uXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy50aW1lSW5TdGF0ZSArPSBlbGFwc2VkO1xyXG4gICAgfVxyXG5cclxuICAgIHRyYW5zaXRpb25UbyhzdGF0ZTogTnBjU3RhdGUpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy50aW1lSW5TdGF0ZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgYmVnaW5XYWxraW5nVG8oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCh0aGlzLmlkLCB4LCB5KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaWduaWZpZXMgdGhlIGVuZCBvZiBhIHdhbGsuXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy54bGFzdCA9IHg7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9IHk7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVG8oTnBjU3RhdGUuSWRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U3RhdGUoKTogTnBjU3RhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2V9IGZyb20gJy4vdmlldy9zdGFuZGVlL3N0YW5kZWUtYW5pbWF0aW9uLXRleHR1cmUtYmFzZSc7XHJcbmltcG9ydCB7YnVpbGRpbmdQcmVsb2FkZXJ9IGZyb20gJy4vdmlldy9saWdodGluZy9idWlsZGluZy1wcmVsb2FkZXInO1xyXG5pbXBvcnQge3NvdW5kTG9hZGVyfSBmcm9tICcuL3NvdW5kL3NvdW5kLWxvYWRlcic7XHJcblxyXG4vLyAxKSBTdGFuZGVlIFRleHR1cmVzXHJcbi8vIDIpIEJ1aWxkaW5nXHJcbi8vIDMpIFNvdW5kXHJcbmNvbnN0IFRPVEFMX1RPX1BSRUxPQUQgPSAzO1xyXG5cclxuY2xhc3MgUHJlbG9hZGVyIHtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjYWxsYmFjazogKCkgPT4gdm9pZDtcclxuICAgIHByaXZhdGUgY291bnQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLmNvdW50ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcmVsb2FkKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG5cclxuICAgICAgICBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UucHJlbG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tJZkZpbmlzaGVkKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGJ1aWxkaW5nUHJlbG9hZGVyLnByZWxvYWQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrSWZGaW5pc2hlZCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzb3VuZExvYWRlci5wcmVsb2FkKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja0lmRmluaXNoZWQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrSWZGaW5pc2hlZCgpIHtcclxuICAgICAgICB0aGlzLmNvdW50Kys7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1ByZWxvYWRlZCAnICsgdGhpcy5jb3VudCArICcgb2YgJyArIFRPVEFMX1RPX1BSRUxPQUQpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jb3VudCA+PSBUT1RBTF9UT19QUkVMT0FEKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHByZWxvYWRlciA9IG5ldyBQcmVsb2FkZXIoKTsiLCJkZWNsYXJlIGNvbnN0IEhvd2w6IGFueTtcclxuXHJcbmltcG9ydCB7c291bmRNYW5hZ2VyfSBmcm9tICcuL3NvdW5kLW1hbmFnZXInO1xyXG5cclxuLy8gMSkgQW1iaWVuY2UgLSBOaWdodFxyXG4vLyAyKSBNdXNpYyAtIE9wZW5pbmdcclxuY29uc3QgVE9UQUxfVE9fUFJFTE9BRCA9IDI7XHJcblxyXG5jbGFzcyBTb3VuZExvYWRlciB7XHJcblxyXG4gICAgcHJlbG9hZENvbXBsZXRlQ2FsbGJhY2s6ICgpID0+IHZvaWQ7XHJcbiAgICBwcmVsb2FkQ291bnQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnByZWxvYWRDb21wbGV0ZUNhbGxiYWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLnByZWxvYWRDb3VudCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJlbG9hZChwcmVsb2FkQ29tcGxldGVDYWxsYmFjazogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMucHJlbG9hZENvbXBsZXRlQ2FsbGJhY2sgPSBwcmVsb2FkQ29tcGxldGVDYWxsYmFjaztcclxuXHJcbiAgICAgICAgbGV0IGFtYmllbmNlTmlnaHQgPSBuZXcgSG93bCh7XHJcbiAgICAgICAgICAgIHNyYzogWydhbWJpZW5jZS1uaWdodC5tNGEnXSxcclxuICAgICAgICAgICAgbG9vcDogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFtYmllbmNlTmlnaHQub25jZSgnbG9hZCcsICgpID0+IHRoaXMucHJlbG9hZENoZWNrSWZGaW5pc2hlZCgpKTtcclxuXHJcbiAgICAgICAgbGV0IG11c2ljT3BlbmluZyA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOiBbJ211c2ljLW9wZW5pbmcubTRhJ10sXHJcbiAgICAgICAgICAgIGxvb3A6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICBtdXNpY09wZW5pbmcub25jZSgnbG9hZCcsICgpID0+IHRoaXMucHJlbG9hZENoZWNrSWZGaW5pc2hlZCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHByZWxvYWRDaGVja0lmRmluaXNoZWQoKSB7XHJcbiAgICAgICAgdGhpcy5wcmVsb2FkQ291bnQrKztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucHJlbG9hZENvdW50ID49IFRPVEFMX1RPX1BSRUxPQUQpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVsb2FkQ29tcGxldGVDYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc291bmRMb2FkZXIgPSBuZXcgU291bmRMb2FkZXIoKTsiLCJkZWNsYXJlIGNvbnN0IEhvd2xlcjogYW55O1xyXG5cclxuY29uc3QgU09VTkRfS0VZID0gJzEyOTA4MzE5MC1mYWxsaW5nLXNvdW5kJztcclxuXHJcbmNsYXNzIFNvdW5kTWFuYWdlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBzb3VuZFRvZ2dsZUVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5zb3VuZFRvZ2dsZUVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NvdW5kLXRvZ2dsZScpO1xyXG4gICAgICAgIHRoaXMuc291bmRUb2dnbGVFbGVtZW50Lm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU291bmRTZXR0aW5nKCF0aGlzLnNvdW5kVG9nZ2xlRWxlbWVudC5jaGVja2VkKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdWxkIG9jY3VyIGJlZm9yZSBwcmVsb2FkaW5nIHNvIHRoZSBwbGF5ZXIgc2VlcyB0aGUgcmlnaHQgb3B0aW9uIGltbWVkaWF0ZWx5LlxyXG4gICAgICovXHJcbiAgICBhdHRhY2goKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTb3VuZFNldHRpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEb25lIG9mZiB0aGUgbWFpbiBleGVjdXRpb24gcGF0aCBpbiBjYXNlIHRoZSB1c2VyIGhhcyBjbGllbnQtc2lkZSBzdG9yYWdlIHR1cm5lZCBvZmYsXHJcbiAgICAgKiB0byBwcmV2ZW50IGFueSBzb3J0IG9mIG5hdGl2ZSBleGNlcHRpb24sIGlmIHRob3NlIHN0aWxsIGV4aXN0IHRoZXNlIGRheXMuXHJcbiAgICAgKi8gICAgXHJcbiAgICBwcml2YXRlIHVwZGF0ZVNvdW5kU2V0dGluZyhtdXRlPzogYm9vbGVhbikge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobXV0ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc291bmRWYWx1ZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oU09VTkRfS0VZKTtcclxuICAgICAgICAgICAgICAgIG11dGUgPSBzb3VuZFZhbHVlID09PSAnb2ZmJztcclxuICAgICAgICAgICAgICAgIHRoaXMuc291bmRUb2dnbGVFbGVtZW50LmNoZWNrZWQgPSAhbXV0ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBzb3VuZFZhbHVlOiBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICBpZiAobXV0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvdW5kVmFsdWUgPSAnb2ZmJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc291bmRWYWx1ZSA9ICdvbic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFNPVU5EX0tFWSwgc291bmRWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgSG93bGVyLm11dGUobXV0ZSk7XHJcbiAgICAgICAgfSwgMSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHNvdW5kTWFuYWdlciA9IG5ldyBTb3VuZE1hbmFnZXIoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jb25zdCBBU1BFQ1RfUkFUSU8gPSAxNi85O1xyXG5cclxuY2xhc3MgQ2FtZXJhV3JhcHBlciB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGNhbWVyYTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDYwLCBBU1BFQ1RfUkFUSU8sIDAuMSwgMTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUmVuZGVyZXJTaXplKHJlbmRlcmVyOiBhbnkpIHtcclxuICAgICAgICBsZXQgd2luZG93QXNwZWN0UmF0aW8gPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICBsZXQgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICAgICAgaWYgKHdpbmRvd0FzcGVjdFJhdGlvID4gQVNQRUNUX1JBVElPKSB7XHJcbiAgICAgICAgICAgIC8vIFRvbyB3aWRlOyBzY2FsZSBvZmYgb2Ygd2luZG93IGhlaWdodC5cclxuICAgICAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lckhlaWdodCAqIEFTUEVDVF9SQVRJTyk7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvd0FzcGVjdFJhdGlvIDw9IEFTUEVDVF9SQVRJTykge1xyXG4gICAgICAgICAgICAvLyBUb28gbmFycm93IG9yIGp1c3QgcmlnaHQ7IHNjYWxlIG9mZiBvZiB3aW5kb3cgd2lkdGguXHJcbiAgICAgICAgICAgIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVyV2lkdGggLyBBU1BFQ1RfUkFUSU8pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAvLyBTaG91bGQgYmUgbm8gbmVlZCB0byB1cGRhdGUgYXNwZWN0IHJhdGlvIGJlY2F1c2UgaXQgc2hvdWxkIGJlIGNvbnN0YW50LlxyXG4gICAgICAgIC8vIHRoaXMuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG4gICAgfVxyXG5cclxuICAgIGxvb2tBdCh2ZWMzOiBhbnkpIHtcclxuICAgICAgICB0aGlzLmNhbWVyYS5sb29rQXQodmVjMyk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGNhbWVyYVdyYXBwZXIgPSBuZXcgQ2FtZXJhV3JhcHBlcigpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmNsYXNzIEJ1aWxkaW5nUHJlbG9hZGVyIHtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBpbnN0YW5jZXM6IGFueVtdO1xyXG4gICAgcHJpdmF0ZSBpbnN0YW5jZXNSZXF1ZXN0ZWQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmluc3RhbmNlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VzUmVxdWVzdGVkID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcmVsb2FkKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgbGV0IG10bExvYWRlciA9IG5ldyBUSFJFRS5NVExMb2FkZXIoKTtcclxuICAgICAgICBtdGxMb2FkZXIuc2V0UGF0aCgnJyk7XHJcbiAgICAgICAgbXRsTG9hZGVyLmxvYWQoJ2dyZWVuLWJ1aWxkaW5nLm10bCcsIChtYXRlcmlhbHM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBtYXRlcmlhbHMucHJlbG9hZCgpO1xyXG4gICAgICAgICAgICBsZXQgb2JqTG9hZGVyID0gbmV3IFRIUkVFLk9CSkxvYWRlcigpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIuc2V0TWF0ZXJpYWxzKG1hdGVyaWFscyk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5zZXRQYXRoKCcnKTtcclxuICAgICAgICAgICAgb2JqTG9hZGVyLmxvYWQoJ2dyZWVuLWJ1aWxkaW5nLm9iaicsIChvYmo6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZXMucHVzaChvYmopO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfSwgKCkgPT4geyB9LCAoKSA9PiB7IGNvbnNvbGUubG9nKCdlcnJvciB3aGlsZSBsb2FkaW5nIDooJykgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldEluc3RhbmNlKCk6IGFueSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlOiBhbnk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlc1JlcXVlc3RlZCA9PT0gMCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZSA9IHRoaXMuaW5zdGFuY2VzWzBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlID0gdGhpcy5pbnN0YW5jZXNbMF0uY2xvbmUoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZXMucHVzaChpbnN0YW5jZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VzUmVxdWVzdGVkKys7XHJcblxyXG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgYnVpbGRpbmdQcmVsb2FkZXIgPSBuZXcgQnVpbGRpbmdQcmVsb2FkZXIoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge2J1aWxkaW5nUHJlbG9hZGVyfSBmcm9tICcuL2J1aWxkaW5nLXByZWxvYWRlcic7XHJcblxyXG5leHBvcnQgY2xhc3MgQnVpbGRpbmcge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzbGFiOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGxldCBvYmogPSBidWlsZGluZ1ByZWxvYWRlci5nZXRJbnN0YW5jZSgpO1xyXG4gICAgICAgIG9iai5zY2FsZS5zZXRTY2FsYXIoMC4yNSk7XHJcbiAgICAgICAgb2JqLnBvc2l0aW9uLnNldCg1LCAtMC4wMSwgMCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQob2JqKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcbmRlY2xhcmUgY29uc3QgVFdFRU46IGFueTtcclxuXHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuXHJcbmNvbnN0IE1BWF9DVVJUQUlOX0NPVU5UID0gNDtcclxuY29uc3QgQ1VSVEFJTl9XSURUSCA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjtcclxuY29uc3QgQ1VSVEFJTl9NT1ZFX1RJTUUgPSA0MDA7XHJcblxyXG5jbGFzcyBDdXJ0YWluVmVydGV4UG9zaXRpb24ge1xyXG4gICAgeCA9IDA7XHJcbiAgICBlbGFwc2VkID0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEkgbWlnaHQgaGF2ZSBzb21lIG9mIHRoZXNlIGJhY2t3YXJkcy4uLlxyXG4gKi9cclxuZXhwb3J0IGVudW0gQ3VydGFpbkRpcmVjdGlvbiB7XHJcbiAgICBPcGVuTGVmdFRvUmlnaHQsXHJcbiAgICBPcGVuUmlnaHRUb0xlZnQsXHJcbiAgICBDbG9zZUxlZnRUb1JpZ2h0LFxyXG4gICAgQ2xvc2VSaWdodFRvTGVmdFxyXG59XHJcblxyXG4vKipcclxuICogU29tZSBub3RlcyBvbiB2ZXJ0aWNlcyB3aXRoaW4gZWFjaCBjdXJ0YWluIG1lc2ggd2l0aG91dCBtb2RpZmljYXRpb25zOlxyXG4gKiBWZXJ0aWNlcyAxIGFuZCAzIHNob3VsZCByZXN0IGF0IHggPSAtQ1VSVEFJTl9XSURUSCAvIDIgKGhvdXNlIGxlZnQpXHJcbiAqIFZlcnRpY2VzIDAgYW5kIDIgc2hvdWxkIHJlc3QgYXQgeCA9ICBDVVJUQUlOX1dJRFRIIC8gMiAoaG91c2UgcmlnaHQpXHJcbiAqIFxyXG4gKiBFeGFtcGxlIHN0YXRlbWVudHM6XHJcbiAqIGNvbnNvbGUubG9nKCd2ZXJ0aWNlcyAxIGFuZCAzIHg6ICcgKyBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzFdLngsIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbM10ueCk7XHJcbiAqIGNvbnNvbGUubG9nKCd2ZXJ0aWNlcyAwIGFuZCAyIHg6ICcgKyBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzBdLngsIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMl0ueCk7XHJcbiAqIGNvbnNvbGUubG9nKCctLS0nKTtcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDdXJ0YWluIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG4gICAgcmVhZG9ubHkgY3VydGFpbnM6IGFueVtdO1xyXG5cclxuICAgIHByaXZhdGUgY3VydGFpblZlcnRleFBvc2l0aW9uOiBDdXJ0YWluVmVydGV4UG9zaXRpb247XHJcbiAgICBwcml2YXRlIGN1cnRhaW5Ud2VlbjogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLmN1cnRhaW5zID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IE1BWF9DVVJUQUlOX0NPVU5UOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShDVVJUQUlOX1dJRFRILCAxKTtcclxuICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtjb2xvcjogMHgxMDEwMzB9KTsgLy8gTWlkbmlnaHQgQmx1ZVxyXG4gICAgICAgICAgICBsZXQgY3VydGFpbiA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydGFpbnMucHVzaChjdXJ0YWluKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uID0gbmV3IEN1cnRhaW5WZXJ0ZXhQb3NpdGlvbigpO1xyXG4gICAgICAgIHRoaXMuY3VydGFpblR3ZWVuID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBjdXJ0YWluIG9mIHRoaXMuY3VydGFpbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5hZGQoY3VydGFpbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gZ3JvdXAgdG8gZml0IGFnYWluc3QgYnVpbGRpbmcuXHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoNS4wLCA0Ljc1LCAtMS40NTEpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuc2NhbGUuc2V0KDAuNywgMS4wLCAxKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJ0YWluVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi5lbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydGFpblR3ZWVuLnVwZGF0ZSh0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi5lbGFwc2VkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRBbmltYXRpb24oZmxvb3JJZHhzOiBudW1iZXJbXSwgZGlyZWN0aW9uOiBDdXJ0YWluRGlyZWN0aW9uLCBjYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcclxuICAgICAgICAvLyBQcmV2ZW50IG11bHRpcGxlIGFuaW1hdGlvbnMgYXQgdGhlIHNhbWUgdGltZS5cclxuICAgICAgICBpZiAodGhpcy5jdXJ0YWluVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRyb3BDdXJ0YWluKGZsb29ySWR4cyk7XHJcblxyXG4gICAgICAgIGxldCB4ZW5kOiBudW1iZXI7XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5DbG9zZUxlZnRUb1JpZ2h0IHx8IGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5PcGVuTGVmdFRvUmlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24ueCA9IENVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICB4ZW5kID0gLUNVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlUmlnaHRUb0xlZnQgfHwgZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5SaWdodFRvTGVmdCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54ID0gLUNVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICB4ZW5kID0gIENVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi5lbGFwc2VkID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJ0YWluVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24pXHJcbiAgICAgICAgICAgIC50byh7eDogeGVuZH0sIENVUlRBSU5fTU9WRV9USU1FKVxyXG4gICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5RdWFydGljLkluT3V0KVxyXG4gICAgICAgICAgICAub25VcGRhdGUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gU2VlIG5vdGUgYXQgdG9wIGFib3V0IHdoeSBpZHgxIGFuZCBpZHgyIGFyZSB3aGF0IHRoZXkgYXJlLlxyXG4gICAgICAgICAgICAgICAgbGV0IGlkeDE6IG51bWJlciwgaWR4MjogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5DbG9zZVJpZ2h0VG9MZWZ0IHx8IGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5PcGVuTGVmdFRvUmlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZHgxID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBpZHgyID0gMjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlTGVmdFRvUmlnaHQgfHwgZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5SaWdodFRvTGVmdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDEgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDIgPSAzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY3VydGFpbiBvZiB0aGlzLmN1cnRhaW5zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1tpZHgxXS54ID0gdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24ueDtcclxuICAgICAgICAgICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzW2lkeDJdLnggPSB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54O1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4geyB0aGlzLmNvbXBsZXRlQW5pbWF0aW9uKGNhbGxiYWNrKTsgfSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLmVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFrZSB0aGUgcmVxdWVzdGVkIG51bWJlciBvZiBjdXJ0YWlucyB2aXNpYmxlLlxyXG4gICAgICogUG9zaXRpb24gdGhlbSBvbiB0aGUgcmVxdWVzdGVkIGZsb29ycy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkcm9wQ3VydGFpbihmbG9vcklkeHM6IG51bWJlcltdKSB7XHJcbiAgICAgICAgZm9yIChsZXQgY3VydGFpbiBvZiB0aGlzLmN1cnRhaW5zKSB7XHJcbiAgICAgICAgICAgIGN1cnRhaW4udmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgZmxvb3JJZHhzLmxlbmd0aDsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IGZsb29ySWR4ID0gZmxvb3JJZHhzW2lkeF07XHJcbiAgICAgICAgICAgIGxldCBjdXJ0YWluID0gdGhpcy5jdXJ0YWluc1tpZHhdO1xyXG5cclxuICAgICAgICAgICAgY3VydGFpbi5wb3NpdGlvbi5zZXQoMCwgZmxvb3JJZHgsIDApO1xyXG5cclxuICAgICAgICAgICAgLy8gU2VlIG5vdGUgYXQgdG9wIGFib3V0IHdoeSB0aGVzZSBhcmUgd2hlcmUgdGhleSBhcmUuXHJcbiAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMF0ueCA9IC1DVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1sxXS54ID0gIENVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzJdLnggPSAtQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbM10ueCA9ICBDVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY3VydGFpbi52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb21wbGV0ZUFuaW1hdGlvbihjYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmN1cnRhaW5Ud2VlbiA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb25zdGFudHMnO1xyXG5pbXBvcnQge0hwT3JpZW50YXRpb259IGZyb20gJy4uLy4uL2RvbWFpbi9ocC1vcmllbnRhdGlvbic7XHJcblxyXG5leHBvcnQgY2xhc3MgSHBQYW5lbHMge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBwYW5lbHM6IGFueVtdO1xyXG4gICAgcHJpdmF0ZSBocE9yaWVudGF0aW9uOiBIcE9yaWVudGF0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhwT3JpZW50YXRpb246IEhwT3JpZW50YXRpb24pIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5wYW5lbHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDAuNiwgMC42KTtcclxuICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKCk7XHJcbiAgICAgICAgICAgIGxldCBwYW5lbCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIGxldCB4ID0gaWR4O1xyXG4gICAgICAgICAgICBsZXQgeSA9IDA7XHJcbiAgICAgICAgICAgIGxldCB6ID0gMDtcclxuICAgICAgICAgICAgcGFuZWwucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG4gICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiBNYWtlIHRoaXMgcHVsc2UgYXQgYWxsP1xyXG4gICAgICAgICAgICBwYW5lbC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoMHhmZmZmZmYpO1xyXG4gICAgICAgICAgICBwYW5lbC5tYXRlcmlhbC5lbWlzc2l2ZUludGVuc2l0eSA9IDAuMjU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBhbmVscy5wdXNoKHBhbmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaHBPcmllbnRhdGlvbiA9IGhwT3JpZW50YXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgcGFuZWwgb2YgdGhpcy5wYW5lbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5hZGQocGFuZWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRvIGZpdCBhZ2FpbnN0IGJ1aWxkaW5nLlxyXG4gICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24uc2V0KDEuODUsIDMuNTUsIC0xLjUpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuc2NhbGUuc2V0KDAuNywgMS45LCAxKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVIcChQQU5FTF9DT1VOVF9QRVJfRkxPT1IpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhQIGJhciBjYW4gZ28gZnJvbSByaWdodC10by1sZWZ0IG9yIGxlZnQtdG8tcmlnaHQsIGxpa2UgYSBmaWdodGluZyBnYW1lIEhQIGJhci5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlSHAoaHA6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChocCA+IFBBTkVMX0NPVU5UX1BFUl9GTE9PUikge1xyXG4gICAgICAgICAgICBocCA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IHRoaXMucGFuZWxzLmxlbmd0aDsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHBhbmVsID0gdGhpcy5wYW5lbHNbaWR4XTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaHBPcmllbnRhdGlvbiA9PT0gSHBPcmllbnRhdGlvbi5EZWNyZWFzZXNSaWdodFRvTGVmdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkeCA8IGhwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChpZHggPj0gUEFORUxfQ09VTlRfUEVSX0ZMT09SIC0gaHApIHtcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPOiBIYW5kbGUgdXBkYXRlIHRvIEhQID0gZnVsbCBhcyBkaWZmZXJlbnQgZnJvbSBIUCA8IGZ1bGwuXHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcbmRlY2xhcmUgY29uc3QgVFdFRU46IGFueTtcclxuXHJcbmltcG9ydCB7QnVpbGRpbmd9IGZyb20gJy4vYnVpbGRpbmcnO1xyXG5pbXBvcnQge0N1cnRhaW59IGZyb20gJy4vY3VydGFpbic7XHJcbmltcG9ydCB7SHBQYW5lbHN9IGZyb20gJy4vaHAtcGFuZWxzJztcclxuaW1wb3J0IHtIcE9yaWVudGF0aW9ufSBmcm9tICcuLi8uLi9kb21haW4vaHAtb3JpZW50YXRpb24nO1xyXG5pbXBvcnQge1Jvd0NsZWFyRGlyZWN0aW9ufSBmcm9tICcuLi8uLi9kb21haW4vcm93LWNsZWFyLWRpcmVjdGlvbic7XHJcbmltcG9ydCB7Q3VydGFpbkRpcmVjdGlvbn0gZnJvbSAnLi9jdXJ0YWluJztcclxuaW1wb3J0IHtQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb25zdGFudHMnO1xyXG5cclxuLy8gVE9ETzogT25seSB0aGUgM3JkIGZsb29yIGZyb20gdGhlIHRvcCBhbmQgYmVsb3cgYXJlIHZpc2libGUuIEFsc28sIHNlZSBib2FyZC50cy5cclxuZXhwb3J0IGNvbnN0IEZMT09SX0NPVU5UID0gMTc7XHJcblxyXG5jb25zdCBBQ1RJVkVfU0hBUEVfTElHSFRfQ09VTlQgPSA0O1xyXG5jb25zdCBQQU5FTF9TSVpFID0gMC43O1xyXG5cclxuY2xhc3MgRW1pc3NpdmVJbnRlbnNpdHkge1xyXG4gICAgdmFsdWU6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpZ2h0aW5nR3JpZCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBwYW5lbEdyb3VwOiBhbnk7XHJcbiAgICBwcml2YXRlIGJ1aWxkaW5nOiBCdWlsZGluZztcclxuXHJcbiAgICBwcml2YXRlIHJvd0NsZWFyRGlyZWN0aW9uOiBSb3dDbGVhckRpcmVjdGlvblxyXG4gICAgcHJpdmF0ZSByb3dDbGVhckN1cnRhaW46IEN1cnRhaW47XHJcbiAgICBwcml2YXRlIGp1bmtSb3dDdXJ0YWluOiBDdXJ0YWluO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGhwUGFuZWxzOiBIcFBhbmVscztcclxuXHJcbiAgICBwcml2YXRlIHBhbmVsczogYW55W11bXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzaGFwZUxpZ2h0czogYW55W107XHJcbiAgICBwcml2YXRlIGN1cnJlbnRTaGFwZUxpZ2h0SWR4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGhpZ2hsaWdodGVyOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBwdWxzZVR3ZWVuOiBhbnk7XHJcbiAgICBwcml2YXRlIHB1bHNlVHdlZW5FbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGVtaXNzaXZlSW50ZW5zaXR5OiBFbWlzc2l2ZUludGVuc2l0eTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihocE9yaWVudGF0aW9uOiBIcE9yaWVudGF0aW9uLCByb3dDbGVhckRpcmVjdGlvbjogUm93Q2xlYXJEaXJlY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIHRoaXMucGFuZWxHcm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIHRoaXMuYnVpbGRpbmcgPSBuZXcgQnVpbGRpbmcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yb3dDbGVhckRpcmVjdGlvbiA9IHJvd0NsZWFyRGlyZWN0aW9uO1xyXG4gICAgICAgIHRoaXMucm93Q2xlYXJDdXJ0YWluID0gbmV3IEN1cnRhaW4oKTtcclxuICAgICAgICB0aGlzLmp1bmtSb3dDdXJ0YWluID0gbmV3IEN1cnRhaW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy5ocFBhbmVscyA9IG5ldyBIcFBhbmVscyhocE9yaWVudGF0aW9uKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYW5lbHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBmbG9vcklkeCA9IDA7IGZsb29ySWR4IDwgRkxPT1JfQ09VTlQ7IGZsb29ySWR4KyspIHtcclxuICAgICAgICAgICAgdGhpcy5wYW5lbHNbZmxvb3JJZHhdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhbmVsSWR4ID0gMDsgcGFuZWxJZHggPCBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7IHBhbmVsSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KFBBTkVMX1NJWkUsIFBBTkVMX1NJWkUpOyAvLyBUT0RPOiBjbG9uZSgpID9cclxuICAgICAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7ZW1pc3NpdmVJbnRlbnNpdHk6IDEuMH0pO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhbmVsID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IHBhbmVsSWR4O1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBmbG9vcklkeCArIDE7IC8vIE9mZnNldCB1cCAxIGJlY2F1c2UgZ3JvdW5kIGlzIHkgPSAwLlxyXG4gICAgICAgICAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgICAgICAgICAgcGFuZWwucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFuZWxzW2Zsb29ySWR4XVtwYW5lbElkeF0gPSBwYW5lbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zaGFwZUxpZ2h0cyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGNvdW50ID0gMDsgY291bnQgPCBBQ1RJVkVfU0hBUEVfTElHSFRfQ09VTlQ7IGNvdW50KyspIHtcclxuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoUEFORUxfU0laRSwgUEFORUxfU0laRSk7XHJcbiAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7ZW1pc3NpdmVJbnRlbnNpdHk6IDEuMH0pO1xyXG4gICAgICAgICAgICBsZXQgc2hhcGVMaWdodCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2hhcGVMaWdodHMucHVzaChzaGFwZUxpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGVMaWdodElkeCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmMDBmZiwgMy41LCAzKTtcclxuXHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuID0gbnVsbDtcclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5ID0gbmV3IEVtaXNzaXZlSW50ZW5zaXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5idWlsZGluZy5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5yb3dDbGVhckN1cnRhaW4uZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuanVua1Jvd0N1cnRhaW4uZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuaHBQYW5lbHMuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMucGFuZWxHcm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRpbmcuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLnJvd0NsZWFyQ3VydGFpbi5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0N1cnRhaW4uc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmhwUGFuZWxzLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGZsb29yIG9mIHRoaXMucGFuZWxzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhbmVsIG9mIGZsb29yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhbmVsR3JvdXAuYWRkKHBhbmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgc2hhcGVMaWdodCBvZiB0aGlzLnNoYXBlTGlnaHRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFuZWxHcm91cC5hZGQoc2hhcGVMaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAuYWRkKHRoaXMuaGlnaGxpZ2h0ZXIpO1xyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gdG8gZml0IGFnYWluc3QgYnVpbGRpbmcuXHJcbiAgICAgICAgdGhpcy5wYW5lbEdyb3VwLnBvc2l0aW9uLnNldCgxLjg1LCAzLjgsIC0xLjU1KTtcclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAuc2NhbGUuc2V0KDAuNywgMS4wLCAxKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBjZWxscyBhcHBlYXIgdG8gcHVsc2UuXHJcbiAgICAgICAgdGhpcy5lbWlzc2l2ZUludGVuc2l0eS52YWx1ZSA9IDAuMzM7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkpXHJcbiAgICAgICAgICAgIC50byh7dmFsdWU6IDEuMH0sIDc1MClcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuU2ludXNvaWRhbC5Jbk91dClcclxuICAgICAgICAgICAgLnlveW8odHJ1ZSlcclxuICAgICAgICAgICAgLnJlcGVhdChJbmZpbml0eSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMucHVsc2VUd2VlbkVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwUHVsc2UoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5yb3dDbGVhckN1cnRhaW4uc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmp1bmtSb3dDdXJ0YWluLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5ocFBhbmVscy5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaFJvb21PZmYoZmxvb3JJZHg6IG51bWJlciwgcGFuZWxJZHg6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBwYW5lbCA9IHRoaXMucGFuZWxzW2Zsb29ySWR4XVtwYW5lbElkeF07XHJcbiAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaFJvb21PbihmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyLCBjb2xvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHBhbmVsID0gdGhpcy5wYW5lbHNbZmxvb3JJZHhdW3BhbmVsSWR4XTtcclxuICAgICAgICBwYW5lbC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICBwYW5lbC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoY29sb3IpO1xyXG4gICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlLnNldEhleChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZEFjdGl2ZVNoYXBlTGlnaHRUbyhmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyLCBjb2xvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHNoYXBlTGlnaHQgPSB0aGlzLmdldE5leHRTaGFwZUxpZ2h0KCk7XHJcbiAgICAgICAgc2hhcGVMaWdodC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoY29sb3IpO1xyXG4gICAgICAgIHNoYXBlTGlnaHQubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KGNvbG9yKTtcclxuXHJcbiAgICAgICAgLy8gRG8gbm90IGxpZ2h0IGlmIGhpZ2hlciB0aGFuIHRoZSBoaWdoZXN0ICp2aXNpYmxlKiBmbG9vci5cclxuICAgICAgICBpZiAoZmxvb3JJZHggPj0gRkxPT1JfQ09VTlQpIHtcclxuICAgICAgICAgICAgc2hhcGVMaWdodC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2hhcGVMaWdodC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB4ID0gcGFuZWxJZHg7XHJcbiAgICAgICAgbGV0IHkgPSBmbG9vcklkeCArIDE7IC8vIE9mZnNldCB1cCAxIGJlY2F1c2UgZ3JvdW5kIGlzIHkgPSAwLlxyXG4gICAgICAgIGxldCB6ID0gMDtcclxuICAgICAgICBzaGFwZUxpZ2h0LnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBY3RpdmVTaGFwZUxpZ2h0UG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlnaGxpZ2h0ZXIucG9zaXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZEhpZ2hsaWdodGVyVG8oZmxvb3JJZHg6IG51bWJlciwgcGFuZWxJZHg6IG51bWJlciwgY29sb3I6IG51bWJlcikge1xyXG4gICAgICAgIC8vIERvIG5vdCBsaWdodCBpZiBoaWdoZXIgdGhhbiB0aGUgaGlnaGVzdCAqdmlzaWJsZSogZmxvb3IuXHJcbiAgICAgICAgaWYgKGZsb29ySWR4ID49IEZMT09SX0NPVU5UKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIuY29sb3Iuc2V0SGV4KGNvbG9yKTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB4ID0gcGFuZWxJZHg7XHJcbiAgICAgICAgbGV0IHkgPSBmbG9vcklkeCArIDE7IC8vIE9mZnNldCB1cCAxIGJlY2F1c2UgZ3JvdW5kIGlzIHkgPSAwLlxyXG4gICAgICAgIGxldCB6ID0gMDtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodGVyLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVIcChocDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ocFBhbmVscy51cGRhdGVIcChocCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRSb3dDbGVhcmluZ0FuaW1hdGlvbihmbG9vcklkeHM6IG51bWJlcltdLCBjYWxsYmFjazogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIGxldCBjdXJ0YWluRGlyZWN0aW9uOiBDdXJ0YWluRGlyZWN0aW9uO1xyXG4gICAgICAgIGlmICh0aGlzLnJvd0NsZWFyRGlyZWN0aW9uID09PSBSb3dDbGVhckRpcmVjdGlvbi5MZWZ0VG9SaWdodCkge1xyXG4gICAgICAgICAgICBjdXJ0YWluRGlyZWN0aW9uID0gQ3VydGFpbkRpcmVjdGlvbi5PcGVuTGVmdFRvUmlnaHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3VydGFpbkRpcmVjdGlvbiA9IEN1cnRhaW5EaXJlY3Rpb24uT3BlblJpZ2h0VG9MZWZ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yb3dDbGVhckN1cnRhaW4uc3RhcnRBbmltYXRpb24oZmxvb3JJZHhzLCBjdXJ0YWluRGlyZWN0aW9uLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRKdW5rUm93Q3VydGFpbkFuaW1hdGlvbihmbG9vckNvdW50OiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZmxvb3JDb3VudCA+IDQpIHtcclxuICAgICAgICAgICAgZmxvb3JDb3VudCA9IDQ7XHJcbiAgICAgICAgfSBlbHNlIGlmIChmbG9vckNvdW50IDwgMCkge1xyXG4gICAgICAgICAgICBmbG9vckNvdW50ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZsb29ySWR4cyA9IFswLCAxLCAyLCAzXS5zbGljZSgwLCBmbG9vckNvdW50KTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnRhaW5EaXJlY3Rpb246IEN1cnRhaW5EaXJlY3Rpb247XHJcbiAgICAgICAgaWYgKHRoaXMucm93Q2xlYXJEaXJlY3Rpb24gPT09IFJvd0NsZWFyRGlyZWN0aW9uLkxlZnRUb1JpZ2h0KSB7XHJcbiAgICAgICAgICAgIGN1cnRhaW5EaXJlY3Rpb24gPSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlUmlnaHRUb0xlZnQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3VydGFpbkRpcmVjdGlvbiA9IEN1cnRhaW5EaXJlY3Rpb24uQ2xvc2VMZWZ0VG9SaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuanVua1Jvd0N1cnRhaW4uc3RhcnRBbmltYXRpb24oZmxvb3JJZHhzLCBjdXJ0YWluRGlyZWN0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlU2hhcGVMaWdodHNBbmRIaWdobGlnaHRlcigpIHtcclxuICAgICAgICBmb3IgKGxldCBzaGFwZUxpZ2h0IG9mIHRoaXMuc2hhcGVMaWdodHMpIHtcclxuICAgICAgICAgICAgc2hhcGVMaWdodC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TmV4dFNoYXBlTGlnaHQoKSB7XHJcbiAgICAgICAgbGV0IHNoYXBlTGlnaHQgPSB0aGlzLnNoYXBlTGlnaHRzW3RoaXMuY3VycmVudFNoYXBlTGlnaHRJZHhdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlTGlnaHRJZHgrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50U2hhcGVMaWdodElkeCA+PSBBQ1RJVkVfU0hBUEVfTElHSFRfQ09VTlQpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGVMaWdodElkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzaGFwZUxpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcFB1bHNlKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLnB1bHNlVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLnB1bHNlVHdlZW5FbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMucHVsc2VUd2Vlbi51cGRhdGUodGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGZsb29yIG9mIHRoaXMucGFuZWxzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhbmVsIG9mIGZsb29yKSB7XHJcbiAgICAgICAgICAgICAgICBwYW5lbC5tYXRlcmlhbC5lbWlzc2l2ZUludGVuc2l0eSA9IHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkudmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7Q2VsbENoYW5nZUV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9jZWxsLWNoYW5nZS1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtIcENoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvaHAtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7Um93c0ZpbGxlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9yb3dzLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7Um93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3Jvd3MtY2xlYXItYW5pbWF0aW9uLWNvbXBsZXRlZC1ldmVudCc7XHJcbmltcG9ydCB7RmFsbGluZ1NlcXVlbmNlckV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9mYWxsaW5nLXNlcXVlbmNlci1ldmVudCc7XHJcbmltcG9ydCB7TGlnaHRpbmdHcmlkLCBGTE9PUl9DT1VOVH0gZnJvbSAnLi9saWdodGluZy1ncmlkJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtDZWxsT2Zmc2V0fSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTd2l0Y2hib2FyZCB7XHJcblxyXG4gICAgcHJpdmF0ZSBsaWdodGluZ0dyaWQ6IExpZ2h0aW5nR3JpZDtcclxuICAgIHByaXZhdGUgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihsaWdodGluZ0dyaWQ6IExpZ2h0aW5nR3JpZCwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkID0gbGlnaHRpbmdHcmlkO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGUsIChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PT0gZXZlbnQucGxheWVyVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkNlbGxDaGFuZ2VFdmVudFR5cGUsIChldmVudDogQ2VsbENoYW5nZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2VsbENoYW5nZUV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuUm93c0ZpbGxlZEV2ZW50VHlwZSwgKGV2ZW50OiBSb3dzRmlsbGVkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PT0gZXZlbnQucGxheWVyVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlUm93Q2xlYXJpbmcoZXZlbnQuZmlsbGVkUm93SWR4cyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVKdW5rUm93QWRkaW5nKGV2ZW50LmZpbGxlZFJvd0lkeHMubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuSHBDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IEhwQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlSHBDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5GYWxsaW5nU2VxdWVuY2VyRXZlbnRUeXBlLCAoZXZlbnQ6IEZhbGxpbmdTZXF1ZW5jZXJFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUZhbGxpbmdTZXF1ZW5jZXJFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgZmxvb3JJZHggPSB0aGlzLmNvbnZlcnRSb3dUb0Zsb29yKGV2ZW50LnNoYXBlLmdldFJvdygpKTtcclxuICAgICAgICBsZXQgcGFuZWxJZHggPSBldmVudC5zaGFwZS5nZXRDb2woKTtcclxuICAgICAgICBsZXQgY29sb3IgPSB0aGlzLmNvbnZlcnRDb2xvcihldmVudC5zaGFwZS5jb2xvcik7XHJcblxyXG4gICAgICAgIGxldCB5VG90YWxPZmZzZXQgPSAwO1xyXG4gICAgICAgIGxldCB4VG90YWxPZmZzZXQgPSAwO1xyXG4gICAgICAgIGxldCBvZmZzZXRzID0gZXZlbnQuc2hhcGUuZ2V0T2Zmc2V0cygpO1xyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiBvZmZzZXRzKSB7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXRGbG9vcklkeCA9IGZsb29ySWR4IC0gb2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXRQYW5lbElkeCA9IHBhbmVsSWR4ICsgb2Zmc2V0Lng7XHJcbiAgICAgICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnNlbmRBY3RpdmVTaGFwZUxpZ2h0VG8ob2Zmc2V0Rmxvb3JJZHgsIG9mZnNldFBhbmVsSWR4LCBjb2xvcik7XHJcblxyXG4gICAgICAgICAgICB5VG90YWxPZmZzZXQgKz0gb2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIHhUb3RhbE9mZnNldCArPSBvZmZzZXQueDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB5b2ZmID0gKHlUb3RhbE9mZnNldCAvIG9mZnNldHMubGVuZ3RoKSAtIDI7XHJcbiAgICAgICAgbGV0IHhvZmYgPSB4VG90YWxPZmZzZXQgLyBvZmZzZXRzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zZW5kSGlnaGxpZ2h0ZXJUbyhmbG9vcklkeCArIHlvZmYsIHBhbmVsSWR4ICsgeG9mZiwgY29sb3IpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBQbGF5ZXJUeXBlLkh1bWFuKSB7XHJcbiAgICAgICAgICAgIGxldCBhY3RpdmVTaGFwZUxpZ2h0UG9zaXRpb24gPSB0aGlzLmxpZ2h0aW5nR3JpZC5nZXRBY3RpdmVTaGFwZUxpZ2h0UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgLy8gVE9ETzogSGF2ZSB0aGUgY2FtZXJhIGxvb2sgYXQgdGhpcz9cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDZWxsQ2hhbmdlRXZlbnQoZXZlbnQ6IENlbGxDaGFuZ2VFdmVudCkge1xyXG4gICAgICAgIGxldCBmbG9vcklkeCA9IHRoaXMuY29udmVydFJvd1RvRmxvb3IoZXZlbnQucm93KTtcclxuICAgICAgICBpZiAoZmxvb3JJZHggPj0gRkxPT1JfQ09VTlQpIHtcclxuICAgICAgICAgICAgcmV0dXJuOyAvLyBTa2lwIG9ic3RydWN0ZWQgZmxvb3JzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcGFuZWxJZHggPSBldmVudC5jb2w7XHJcbiAgICAgICAgaWYgKGV2ZW50LmNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc3dpdGNoUm9vbU9mZihmbG9vcklkeCwgcGFuZWxJZHgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IHRoaXMuY29udmVydENvbG9yKGV2ZW50LmNlbGwuZ2V0Q29sb3IoKSk7XHJcbiAgICAgICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnN3aXRjaFJvb21PbihmbG9vcklkeCwgcGFuZWxJZHgsIGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhbmltYXRlUm93Q2xlYXJpbmcoZmlsbGVkUm93SWR4czogbnVtYmVyW10pIHtcclxuICAgICAgICBsZXQgZmxvb3JJZHhzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGZpbGxlZFJvd0lkeCBvZiBmaWxsZWRSb3dJZHhzKSB7XHJcbiAgICAgICAgICAgIGxldCBmbG9vcklkeCA9IHRoaXMuY29udmVydFJvd1RvRmxvb3IoZmlsbGVkUm93SWR4KTtcclxuICAgICAgICAgICAgZmxvb3JJZHhzLnB1c2goZmxvb3JJZHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc3RhcnRSb3dDbGVhcmluZ0FuaW1hdGlvbihmbG9vcklkeHMsICgpID0+IHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQodGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1lbWJlciB0aGF0IHRoZSBqdW5rIHJvd3MgaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgb24gdGhlIGJvYXJkLlxyXG4gICAgICogXHJcbiAgICAgKiBEbyBub3QgbmVlZCB0byBmaXJlIGFuIGV2ZW50IGF0IHRoZSBlbmQgb2YgdGhpcyBhbmltYXRpb24gYmVjYXVzZSB0aGUgYm9hcmRcclxuICAgICAqIGRvZXMgbm90IG5lZWQgdG8gbGlzdGVuIGZvciBpdCAoaXQgbGlzdGVucyBmb3IgdGhlIGNsZWFyaW5nIGFuaW1hdGlvbiBpbnN0ZWFkKS5cclxuICAgICovXHJcbiAgICBwcml2YXRlIGFuaW1hdGVKdW5rUm93QWRkaW5nKGp1bmtSb3dDb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc3RhcnRKdW5rUm93Q3VydGFpbkFuaW1hdGlvbihqdW5rUm93Q291bnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlSHBDaGFuZ2VkRXZlbnQoZXZlbnQ6IEhwQ2hhbmdlZEV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQudXBkYXRlSHAoZXZlbnQuaHApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlRmFsbGluZ1NlcXVlbmNlckV2ZW50KGV2ZW50OiBGYWxsaW5nU2VxdWVuY2VyRXZlbnQpe1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLmhpZGVTaGFwZUxpZ2h0c0FuZEhpZ2hsaWdodGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IGNlbGwgcm93L2NvbCBjb29yZGluYXRlcyB0byBmbG9vci9wYW5lbCBjb29yZGluYXRlcy5cclxuICAgICAqIEFjY291bnQgZm9yIHRoZSB0d28gZmxvb3JzIHRoYXQgYXJlIG9ic3RydWN0ZWQgZnJvbSB2aWV3LiAoPylcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjb252ZXJ0Um93VG9GbG9vcihyb3c6IG51bWJlcikge1xyXG4gICAgICAgIGxldCB0aGluZyA9IChGTE9PUl9DT1VOVCAtIHJvdykgKyAxO1xyXG4gICAgICAgIHJldHVybiB0aGluZztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbnZlcnRDb2xvcihjb2xvcjogQ29sb3IpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB2YWx1ZTogbnVtYmVyO1xyXG4gICAgICAgIHN3aXRjaCAoY29sb3IpIHtcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5DeWFuOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDMzY2NjYztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLlllbGxvdzpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhmZmZmNTU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5QdXJwbGU6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4YTAyMGEwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuR3JlZW46XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4MjBhMDIwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuUmVkOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGZmMzMzMztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkJsdWU6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4NDQ0NGNjO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuT3JhbmdlOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGVlZDUzMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLldoaXRlOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGZmZmZmZjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAvLyBEZWZhdWx0IG9yIG1pc3NpbmcgY2FzZSBpcyBibGFjay5cclxuICAgICAgICAgICAgY2FzZSBDb2xvci5FbXB0eTpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgwMDAwMDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuLy8gRGltZW5zaW9ucyBvZiB0aGUgZW50aXJlIHNwcml0ZXNoZWV0OlxyXG5leHBvcnQgY29uc3QgU1BSSVRFU0hFRVRfV0lEVEggICA9IDI1NjtcclxuZXhwb3J0IGNvbnN0IFNQUklURVNIRUVUX0hFSUdIVCAgPSA1MTI7XHJcblxyXG4vLyBEaW1lbnNpb25zIG9mIG9uZSBmcmFtZSB3aXRoaW4gdGhlIHNwcml0ZXNoZWV0OlxyXG5leHBvcnQgY29uc3QgRlJBTUVfV0lEVEggICA9IDQ4O1xyXG5leHBvcnQgY29uc3QgRlJBTUVfSEVJR0hUICA9IDcyO1xyXG5cclxuY29uc3QgVE9UQUxfRElGRkVSRU5UX1RFWFRVUkVTID0gMztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXIge1xyXG5cclxuICAgIHJlYWRvbmx5IHRleHR1cmU6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0dXJlOiBhbnkpIHtcclxuICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2Uge1xyXG5cclxuICAgIHByaXZhdGUgdGV4dHVyZXM6IGFueVtdO1xyXG4gICAgcHJpdmF0ZSBsb2FkZWRDb3VudDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50VGV4dHVyZUlkeDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudGV4dHVyZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmxvYWRlZENvdW50ID0gMDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRUZXh0dXJlSWR4ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcmVsb2FkKGNhbGxiYWNrOiAoKSA9PiBhbnkpIHtcclxuICAgICAgICBsZXQgdGV4dHVyZUxvYWRlZEhhbmRsZXIgPSAodGV4dHVyZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEhhdmUgaXQgc2hvdyBvbmx5IG9uZSBmcmFtZSBhdCBhIHRpbWU6XHJcbiAgICAgICAgICAgIHRleHR1cmUucmVwZWF0LnNldChcclxuICAgICAgICAgICAgICAgIEZSQU1FX1dJRFRIICAvIFNQUklURVNIRUVUX1dJRFRILFxyXG4gICAgICAgICAgICAgICAgRlJBTUVfSEVJR0hUIC8gU1BSSVRFU0hFRVRfSEVJR0hUXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZXMucHVzaCh0ZXh0dXJlKTtcclxuICAgICAgICAgICAgdGhpcy5sb2FkZWRDb3VudCsrO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5sb2FkZWRDb3VudCA+PSBUT1RBTF9ESUZGRVJFTlRfVEVYVFVSRVMpIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudC5wbmcnLCB0ZXh0dXJlTG9hZGVkSGFuZGxlcik7XHJcbiAgICAgICAgdGV4dHVyZUxvYWRlci5sb2FkKCdmYWxsLXN0dWRlbnQyLnBuZycsIHRleHR1cmVMb2FkZWRIYW5kbGVyKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudDMucG5nJywgdGV4dHVyZUxvYWRlZEhhbmRsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG5ld0luc3RhbmNlKCk6IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlciB7XHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMuZ2V0TmV4dFRleHR1cmVJZHgoKTtcclxuICAgICAgICBsZXQgdGV4dHVyZSA9IHRoaXMudGV4dHVyZXNbaWR4XS5jbG9uZSgpOyAvLyBDbG9uaW5nIHRleHR1cmVzIGluIHRoZSB2ZXJzaW9uIG9mIFRocmVlSlMgdGhhdCBJIGFtIGN1cnJlbnRseSB1c2luZyB3aWxsIGR1cGxpY2F0ZSB0aGVtIDooXHJcbiAgICAgICAgcmV0dXJuIG5ldyBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXIodGV4dHVyZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXROZXh0VGV4dHVyZUlkeCgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRUZXh0dXJlSWR4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFRleHR1cmVJZHggPj0gVE9UQUxfRElGRkVSRU5UX1RFWFRVUkVTKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50VGV4dHVyZUlkeDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlID0gbmV3IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZSgpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7U3RhbmRlZX0gZnJvbSAnLi9zdGFuZGVlJztcclxuaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge05wY1BsYWNlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtcGxhY2VkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNNb3ZlbWVudENoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLW1vdmVtZW50LWNoYW5nZWQtZXZlbnQnO1xyXG5cclxuY29uc3QgWV9PRkZTRVQgPSAwLjc1OyAvLyBTZXRzIHRoZWlyIGZlZXQgb24gdGhlIGdyb3VuZCBwbGFuZS5cclxuXHJcbmNsYXNzIFN0YW5kZWVNYW5hZ2VyIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgc3RhbmRlZXM6IE1hcDxudW1iZXIsIFN0YW5kZWU+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGFuZGVlcyA9IG5ldyBNYXA8bnVtYmVyLCBTdGFuZGVlPigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24uc2V0WShZX09GRlNFVCk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5OcGNQbGFjZWRFdmVudFR5cGUsIChldmVudDogTnBjUGxhY2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVOcGNQbGFjZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5OcGNNb3ZlbWVudENoYW5nZWRFdmVudFR5cGUsIChldmVudDogTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVOcGNNb3ZlbWVudENoYW5nZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0YW5kZWVzLmZvckVhY2goKHN0YW5kZWU6IFN0YW5kZWUpID0+IHtcclxuICAgICAgICAgICAgc3RhbmRlZS5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlTnBjUGxhY2VkRXZlbnQoZXZlbnQ6IE5wY1BsYWNlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IHN0YW5kZWUgPSBuZXcgU3RhbmRlZShldmVudC5ucGNJZCk7XHJcbiAgICAgICAgc3RhbmRlZS5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHN0YW5kZWUuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuc3RhbmRlZXMuc2V0KHN0YW5kZWUubnBjSWQsIHN0YW5kZWUpO1xyXG5cclxuICAgICAgICBsZXQgeCA9IGV2ZW50Lng7XHJcbiAgICAgICAgbGV0IHogPSBldmVudC55O1xyXG4gICAgICAgIHRoaXMubW92ZVRvSW5pdGlhbFBvc2l0aW9uKHN0YW5kZWUsIHgsIHopO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbW92ZVRvSW5pdGlhbFBvc2l0aW9uKHN0YW5kZWU6IFN0YW5kZWUsIHg6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gVE9ETzogVXNlIGV2ZW50LngsIGV2ZW50Lnkgd2l0aCBzY2FsaW5nIHRvIGRldGVybWluZSBkZXN0aW5hdGlvblxyXG4gICAgICAgIHN0YW5kZWUubW92ZVRvKHgseik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOcGNNb3ZlbWVudENoYW5nZWRFdmVudChldmVudDogTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IHRoaXMuc3RhbmRlZXMuZ2V0KGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBpZiAoc3RhbmRlZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICAgICAgbGV0IHogPSBldmVudC55O1xyXG4gICAgICAgICAgICBzdGFuZGVlLndhbGtUbyh4LCB6LCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHN0YW5kZWVNYW5hZ2VyID0gbmV3IFN0YW5kZWVNYW5hZ2VyKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtjYW1lcmFXcmFwcGVyfSBmcm9tICcuLi9jYW1lcmEtd3JhcHBlcic7XHJcbmltcG9ydCB7XHJcbiAgICBTUFJJVEVTSEVFVF9XSURUSCxcclxuICAgIFNQUklURVNIRUVUX0hFSUdIVCxcclxuICAgIEZSQU1FX1dJRFRILFxyXG4gICAgRlJBTUVfSEVJR0hULFxyXG4gICAgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyLFxyXG4gICAgc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlfVxyXG5mcm9tICcuL3N0YW5kZWUtYW5pbWF0aW9uLXRleHR1cmUtYmFzZSc7XHJcblxyXG5jb25zdCBTVEFOREFSRF9ERUxBWSA9IDIyNTtcclxuY29uc3QgV0FMS19VUF9PUl9ET1dOX0RFTEFZID0gTWF0aC5mbG9vcihTVEFOREFSRF9ERUxBWSAqICgyLzMpKTsgLy8gQmVjYXVzZSB1cC9kb3duIHdhbGsgY3ljbGVzIGhhdmUgbW9yZSBmcmFtZXMuIFxyXG5cclxuY29uc3Qgc2NyYXRjaFZlY3RvcjE6IGFueSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbmNvbnN0IHNjcmF0Y2hWZWN0b3IyOiBhbnkgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG5cclxuY2xhc3MgU3RhbmRlZUFuaW1hdGlvbkZyYW1lIHtcclxuXHJcbiAgICByZWFkb25seSByb3c6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IGNvbDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMucm93ID0gcm93OyBcclxuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGVudW0gU3RhbmRlZUFuaW1hdGlvblR5cGUge1xyXG4gICAgU3RhbmRVcCxcclxuICAgIFN0YW5kRG93bixcclxuICAgIFN0YW5kTGVmdCxcclxuICAgIFN0YW5kUmlnaHQsXHJcbiAgICBXYWxrVXAsXHJcbiAgICBXYWxrRG93bixcclxuICAgIFdhbGtMZWZ0LFxyXG4gICAgV2Fsa1JpZ2h0LFxyXG4gICAgQ2hlZXJVcCxcclxuICAgIFBhbmljVXAsXHJcbiAgICBQYW5pY0Rvd25cclxufVxyXG5cclxuY2xhc3MgU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IHR5cGU6IFN0YW5kZWVBbmltYXRpb25UeXBlO1xyXG4gICAgcmVhZG9ubHkgbmV4dDogU3RhbmRlZUFuaW1hdGlvblR5cGU7IC8vIFByb2JhYmx5IG5vdCBnb2luZyB0byBiZSB1c2VkIGZvciB0aGlzIGdhbWVcclxuXHJcbiAgICByZWFkb25seSBmcmFtZXM6IFN0YW5kZWVBbmltYXRpb25GcmFtZVtdO1xyXG4gICAgcmVhZG9ubHkgZGVsYXlzOiBudW1iZXJbXTtcclxuICAgIHByaXZhdGUgY3VycmVudEZyYW1lSWR4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBmaW5pc2hlZDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZSwgbmV4dD86IFN0YW5kZWVBbmltYXRpb25UeXBlKSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICBpZiAobmV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLm5leHQgPSBuZXh0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dCA9IHR5cGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmZyYW1lcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZGVsYXlzID0gW107XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHggPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZyYW1lVGltZUVsYXBzZWQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmZpbmlzaGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVzaChmcmFtZTogU3RhbmRlZUFuaW1hdGlvbkZyYW1lLCBkZWxheSA9IFNUQU5EQVJEX0RFTEFZKSB7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMucHVzaChmcmFtZSk7XHJcbiAgICAgICAgdGhpcy5kZWxheXMucHVzaChkZWxheSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEZyYW1lVGltZUVsYXBzZWQgPj0gdGhpcy5kZWxheXNbdGhpcy5jdXJyZW50RnJhbWVJZHhdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEZyYW1lVGltZUVsYXBzZWQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZUlkeCsrO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50RnJhbWVJZHggPj0gdGhpcy5mcmFtZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZUlkeCA9IDA7IC8vIFNob3VsZG4ndCBiZSB1c2VkIGFueW1vcmUsIGJ1dCBwcmV2ZW50IG91dC1vZi1ib3VuZHMgYW55d2F5LlxyXG4gICAgICAgICAgICAgICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNGaW5pc2hlZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maW5pc2hlZDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50RnJhbWUoKTogU3RhbmRlZUFuaW1hdGlvbkZyYW1lIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mcmFtZXNbdGhpcy5jdXJyZW50RnJhbWVJZHhdO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZVNwcml0ZVdyYXBwZXIge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG4gICAgcHJpdmF0ZSBzcHJpdGU6IGFueTtcclxuICAgIHByaXZhdGUgdGV4dHVyZVdyYXBwZXI6IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcjtcclxuXHJcbiAgICBwcml2YXRlIGN1cnJlbnRBbmltYXRpb246IFN0YW5kZWVBbmltYXRpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFRocmVlSlMgb2JqZWN0czogXHJcbiAgICAgICAgdGhpcy50ZXh0dXJlV3JhcHBlciA9IHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZS5uZXdJbnN0YW5jZSgpO1xyXG4gICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TcHJpdGVNYXRlcmlhbCh7bWFwOiB0aGlzLnRleHR1cmVXcmFwcGVyLnRleHR1cmV9KTtcclxuICAgICAgICB0aGlzLnNwcml0ZSA9IG5ldyBUSFJFRS5TcHJpdGUobWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnNjYWxlLnNldCgxLCAxLjUpOyAvLyBBZGp1c3QgYXNwZWN0IHJhdGlvIGZvciA0OCB4IDcyIHNpemUgZnJhbWVzLiBcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLnNwcml0ZSk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgZGVmYXVsdCBhbmltYXRpb24gdG8gc3RhbmRpbmcgZmFjaW5nIGRvd246XHJcbiAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gY3JlYXRlU3RhbmREb3duKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy8gVE9ETzogU2V0IHRoaXMgZWxzZXdoZXJlXHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmFkanVzdExpZ2h0aW5nKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuc3RlcEFuaW1hdGlvbihlbGFwc2VkKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBPbmx5IHN3aXRjaGVzIGlmIHRoZSBnaXZlbiBhbmltYXRpb24gaXMgZGlmZmVyZW50IGZyb20gdGhlIGN1cnJlbnQgb25lLlxyXG4gICAgICovXHJcbiAgICBzd2l0Y2hBbmltYXRpb24odHlwZTogU3RhbmRlZUFuaW1hdGlvblR5cGUpIHtcclxuICAgICAgICBsZXQgYW5pbWF0aW9uID0gZGV0ZXJtaW5lQW5pbWF0aW9uKHR5cGUpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBbmltYXRpb24udHlwZSAhPT0gYW5pbWF0aW9uLnR5cGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0aW9uO1xyXG4gICAgICAgIH0gXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGp1c3RMaWdodGluZyhlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvLyBUT0RPOiBOb3QgeWV0IHN1cmUgaWYgSSdsbCBuZWVkIHRvIHVzZSB0aGUgZWxhcHNlZCB2YXJpYWJsZSBoZXJlLlxyXG4gICAgICAgIC8vIFRPRE86IE1vdmUgbWFnaWMgbnVtYmVycyBpbnRvIHNhbWUgZXF1YXRpb25zIGFzIHRoZSBOUENcclxuICAgICAgICB0aGlzLnNwcml0ZS5nZXRXb3JsZFBvc2l0aW9uKHNjcmF0Y2hWZWN0b3IxKTtcclxuICAgICAgICBjYW1lcmFXcmFwcGVyLmNhbWVyYS5nZXRXb3JsZFBvc2l0aW9uKHNjcmF0Y2hWZWN0b3IyKTtcclxuICAgICAgICBsZXQgZGlzdGFuY2VTcXVhcmVkOiBudW1iZXIgPSBzY3JhdGNoVmVjdG9yMS5kaXN0YW5jZVRvU3F1YXJlZChzY3JhdGNoVmVjdG9yMik7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gTWF0aC5tYXgoMC4yMCwgMS4wIC0gKE1hdGgubWluKDEuMCwgZGlzdGFuY2VTcXVhcmVkIC8gMjI1KSkpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLm1hdGVyaWFsLmNvbG9yLnNldFJHQih2YWx1ZSwgdmFsdWUsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBBbmltYXRpb24oZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFuaW1hdGlvbiA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbi5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBbmltYXRpb24uaXNGaW5pc2hlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGRldGVybWluZUFuaW1hdGlvbih0aGlzLmN1cnJlbnRBbmltYXRpb24ubmV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBmcmFtZSA9IHRoaXMuY3VycmVudEFuaW1hdGlvbi5nZXRDdXJyZW50RnJhbWUoKTtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCBmcmFtZSBjb29yZGluYXRlcyB0byB0ZXh0dXJlIGNvb3JkaW5hdGVzIGFuZCBzZXQgdGhlIGN1cnJlbnQgb25lXHJcbiAgICAgICAgbGV0IHhwY3QgPSAoZnJhbWUuY29sICogRlJBTUVfV0lEVEgpIC8gU1BSSVRFU0hFRVRfV0lEVEg7XHJcbiAgICAgICAgbGV0IHlwY3QgPSAoKChTUFJJVEVTSEVFVF9IRUlHSFQgLyBGUkFNRV9IRUlHSFQpIC0gMSAtIGZyYW1lLnJvdykgKiBGUkFNRV9IRUlHSFQpIC8gU1BSSVRFU0hFRVRfSEVJR0hUO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZVdyYXBwZXIudGV4dHVyZS5vZmZzZXQuc2V0KHhwY3QsIHlwY3QpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZXRlcm1pbmVBbmltYXRpb24odHlwZTogU3RhbmRlZUFuaW1hdGlvblR5cGUpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb246IFN0YW5kZWVBbmltYXRpb247XHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kVXAoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kRG93bjpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlU3RhbmREb3duKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0Rvd246XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtEb3duKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRMZWZ0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZExlZnQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrTGVmdDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa0xlZnQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZFJpZ2h0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZFJpZ2h0KCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa1JpZ2h0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVXYWxrUmlnaHQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5DaGVlclVwOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVDaGVlclVwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlUGFuaWNVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlBhbmljRG93bjpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlUGFuaWNEb3duKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTaG91bGQgbm90IGdldCBoZXJlJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBTdGFuZGluZyBVcFxyXG5sZXQgc3RhbmRVcEZyYW1lMSAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZFVwKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kVXApO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goc3RhbmRVcEZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIFVwXHJcbmxldCB3YWxrVXBGcmFtZTEgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxubGV0IHdhbGtVcEZyYW1lMiAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDEpO1xyXG5sZXQgd2Fsa1VwRnJhbWUzICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMik7XHJcbmxldCB3YWxrVXBGcmFtZTQgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAzKTtcclxubGV0IHdhbGtVcEZyYW1lNSAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDMpO1xyXG5sZXQgd2Fsa1VwRnJhbWU2ICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNSwgMyk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVXYWxrVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa1VwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lMSwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lMiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lMywgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lNCwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lNSwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lNiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIERvd25cclxubGV0IHN0YW5kRG93bkZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDApO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU3RhbmREb3duKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kRG93bik7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZERvd25GcmFtZTEpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gV2Fsa2luZyBEb3duXHJcbmxldCB3YWxrRG93bkZyYW1lMSAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAwKTtcclxubGV0IHdhbGtEb3duRnJhbWUyICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDEpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTMgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMik7XHJcbmxldCB3YWxrRG93bkZyYW1lNCAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAzKTtcclxubGV0IHdhbGtEb3duRnJhbWU1ICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDMpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTYgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMyk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVXYWxrRG93bigpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrRG93bik7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lMSwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWUyLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTMsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lNCwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWU1LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTYsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBTdGFuZGluZyBMZWZ0XHJcbmxldCBzdGFuZExlZnRGcmFtZTEgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAxKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kTGVmdCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goc3RhbmRMZWZ0RnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgTGVmdFxyXG5sZXQgd2Fsa0xlZnRGcmFtZTEgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMSk7XHJcbmxldCB3YWxrTGVmdEZyYW1lMiAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAwKTtcclxubGV0IHdhbGtMZWZ0RnJhbWUzICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDEpO1xyXG5sZXQgd2Fsa0xlZnRGcmFtZTQgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMik7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVXYWxrTGVmdCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrTGVmdCk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrTGVmdEZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrTGVmdEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrTGVmdEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrTGVmdEZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBTdGFuZGluZyBSaWdodFxyXG5sZXQgc3RhbmRSaWdodEZyYW1lMSAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgNCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZFJpZ2h0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goc3RhbmRSaWdodEZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIFJpZ2h0XHJcbmxldCB3YWxrUmlnaHRGcmFtZTEgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxubGV0IHdhbGtSaWdodEZyYW1lMiAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDQpO1xyXG5sZXQgd2Fsa1JpZ2h0RnJhbWUzICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgNCk7XHJcbmxldCB3YWxrUmlnaHRGcmFtZTQgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCA0KTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtSaWdodCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrUmlnaHQpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtSaWdodEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTMpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIENoZWVyIFVwXHJcbmxldCBjaGVlclVwRnJhbWUxICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxubGV0IGNoZWVyVXBGcmFtZTIgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDApO1xyXG5sZXQgY2hlZXJVcEZyYW1lMyAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMSk7XHJcbmxldCBjaGVlclVwRnJhbWU0ICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAwKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUNoZWVyVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuQ2hlZXJVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goY2hlZXJVcEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFBhbmljIFVwXHJcbmxldCBwYW5pY1VwRnJhbWUxICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxubGV0IHBhbmljVXBGcmFtZTIgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDIpO1xyXG5sZXQgcGFuaWNVcEZyYW1lMyAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMCk7XHJcbmxldCBwYW5pY1VwRnJhbWU0ICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAyKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVBhbmljVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNVcEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFBhbmljIERvd25cclxubGV0IHBhbmljRG93bkZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDApO1xyXG5sZXQgcGFuaWNEb3duRnJhbWUyICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMSk7XHJcbmxldCBwYW5pY0Rvd25GcmFtZTMgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAyKTtcclxubGV0IHBhbmljRG93bkZyYW1lNCAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDEpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGFuaWNEb3duKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlBhbmljRG93bik7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNEb3duRnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuZGVjbGFyZSBjb25zdCBUV0VFTjogYW55O1xyXG5cclxuaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1N0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQnO1xyXG5pbXBvcnQge1N0YW5kZWVTcHJpdGVXcmFwcGVyLCBTdGFuZGVlQW5pbWF0aW9uVHlwZX0gZnJvbSAnLi9zdGFuZGVlLXNwcml0ZS13cmFwcGVyJztcclxuaW1wb3J0IHtjYW1lcmFXcmFwcGVyfSBmcm9tICcuLi9jYW1lcmEtd3JhcHBlcic7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZSB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG4gICAgcmVhZG9ubHkgc3ByaXRlV3JhcHBlcjogU3RhbmRlZVNwcml0ZVdyYXBwZXI7XHJcblxyXG4gICAgcHJpdmF0ZSB3YWxrVHdlZW5FbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHdhbGtUd2VlbjogYW55O1xyXG5cclxuICAgIHByaXZhdGUgZmFjaW5nOiBhbnk7IC8vIEZhY2VzIGluIHRoZSB2ZWN0b3Igb2Ygd2hpY2ggd2F5IHRoZSBOUEMgaXMgd2Fsa2luZywgd2FzIHdhbGtpbmcgYmVmb3JlIHN0b3BwaW5nLCBvciB3YXMgc2V0IHRvLlxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIgPSBuZXcgU3RhbmRlZVNwcml0ZVdyYXBwZXIoKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLnNwcml0ZVdyYXBwZXIuZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5mYWNpbmcgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24uc2V0KC0yMDAsIDAsIC0yMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwV2FsayhlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmVuc3VyZUNvcnJlY3RBbmltYXRpb24oKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbW1lZGlhdGVseSBzZXQgc3RhbmRlZSBvbiBnaXZlbiBwb3NpdGlvbi5cclxuICAgICAqL1xyXG4gICAgbW92ZVRvKHg6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoeCwgMCwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgc3RhbmRlZSBpbiBtb3Rpb24gdG93YXJkcyBnaXZlbiBwb3NpdGlvbi5cclxuICAgICAqIFNwZWVkIGRpbWVuc2lvbiBpcyAxIHVuaXQvc2VjLlxyXG4gICAgICovXHJcbiAgICB3YWxrVG8oeDogbnVtYmVyLCB6OiBudW1iZXIsIHNwZWVkOiBudW1iZXIpIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG93IGxvbmcgaXQgd291bGQgdGFrZSwgZ2l2ZW4gdGhlIHNwZWVkIHJlcXVlc3RlZC5cclxuICAgICAgICBsZXQgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoeCwgMCwgeikuc3ViKHRoaXMuZ3JvdXAucG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IHZlY3Rvci5sZW5ndGgoKTtcclxuICAgICAgICBsZXQgdGltZSA9IChkaXN0YW5jZSAvIHNwZWVkKSAqIDEwMDA7XHJcblxyXG4gICAgICAgIC8vIERlbGVnYXRlIHRvIHR3ZWVuLmpzLiBQYXNzIGluIGNsb3N1cmVzIGFzIGNhbGxiYWNrcyBiZWNhdXNlIG90aGVyd2lzZSAndGhpcycgd2lsbCByZWZlclxyXG4gICAgICAgIC8vIHRvIHRoZSBwb3NpdGlvbiBvYmplY3QsIHdoZW4gZXhlY3V0aW5nIHN0b3BXYWxrKCkuXHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLndhbGtUd2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmdyb3VwLnBvc2l0aW9uKVxyXG4gICAgICAgICAgICAudG8oe3g6IHgsIHo6IHp9LCB0aW1lKVxyXG4gICAgICAgICAgICAub25Db21wbGV0ZSgoKSA9PiB7IHRoaXMuc3RvcFdhbGsoKTsgfSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVXBkYXRlIGRpcmVjdGlvbiB0aGlzIHN0YW5kZWUgd2lsbCBiZSBmYWNpbmcgd2hlbiB3YWxraW5nLlxyXG4gICAgICAgIHRoaXMuZmFjaW5nLnNldFgoeCAtIHRoaXMuZ3JvdXAucG9zaXRpb24ueCk7XHJcbiAgICAgICAgdGhpcy5mYWNpbmcuc2V0Wih6IC0gdGhpcy5ncm91cC5wb3NpdGlvbi56KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBXYWxrKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLndhbGtUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLndhbGtUd2Vlbi51cGRhdGUodGhpcy53YWxrVHdlZW5FbGFwc2VkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdG9wV2FsaygpIHtcclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbnVsbDtcclxuICAgICAgICBcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KFxyXG4gICAgICAgICAgICB0aGlzLm5wY0lkLFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24ueilcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZW5zdXJlQ29ycmVjdEFuaW1hdGlvbigpIHtcclxuICAgICAgICAvLyBsZXQgdGFyZ2V0ID0gdGhpcy5ncm91cC5wb3NpdGlvbi5jbG9uZSgpO1xyXG4gICAgICAgIC8vIHRhcmdldC5zZXRZKHRhcmdldC55ICsgMC41KTtcclxuICAgICAgICAvLyBjYW1lcmFXcmFwcGVyLmNhbWVyYS5sb29rQXQodGFyZ2V0KTtcclxuXHJcbiAgICAgICAgLy8gQW5nbGUgYmV0d2VlbiB0d28gdmVjdG9yczogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE0ODQyMjhcclxuICAgICAgICBsZXQgd29ybGREaXJlY3Rpb24gPSBjYW1lcmFXcmFwcGVyLmNhbWVyYS5nZXRXb3JsZERpcmVjdGlvbigpO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIodGhpcy5mYWNpbmcueiwgdGhpcy5mYWNpbmcueCkgLSBNYXRoLmF0YW4yKHdvcmxkRGlyZWN0aW9uLnosIHdvcmxkRGlyZWN0aW9uLngpO1xyXG4gICAgICAgIGlmIChhbmdsZSA8IDApIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xyXG4gICAgICAgIGFuZ2xlICo9ICgxODAvTWF0aC5QSSk7IC8vIEl0J3MgbXkgcGFydHkgYW5kIEknbGwgdXNlIGRlZ3JlZXMgaWYgSSB3YW50IHRvLlxyXG5cclxuICAgICAgICBpZiAodGhpcy53YWxrVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBpZiAoYW5nbGUgPCA2MCB8fCBhbmdsZSA+PSAzMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa1VwKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSA2MCAmJiBhbmdsZSA8IDEyMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrUmlnaHQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDEyMCAmJiBhbmdsZSA8IDI0MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrRG93bik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gMjQwICYmIGFuZ2xlIDwgMzAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChhbmdsZSA8IDYwIHx8IGFuZ2xlID49IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZFVwKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSA2MCAmJiBhbmdsZSA8IDEyMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZFJpZ2h0KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSAxMjAgJiYgYW5nbGUgPCAyNDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSAyNDAgJiYgYW5nbGUgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRMZWZ0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7Y2FtZXJhV3JhcHBlcn0gZnJvbSAnLi9jYW1lcmEtd3JhcHBlcic7XHJcbmltcG9ydCB7c2t5fSBmcm9tICcuL3dvcmxkL3NreSc7XHJcbmltcG9ydCB7Z3JvdW5kfSBmcm9tICcuL3dvcmxkL2dyb3VuZCc7XHJcbmltcG9ydCB7TGlnaHRpbmdHcmlkfSBmcm9tICcuL2xpZ2h0aW5nL2xpZ2h0aW5nLWdyaWQnO1xyXG5pbXBvcnQge1N3aXRjaGJvYXJkfSBmcm9tICcuL2xpZ2h0aW5nL3N3aXRjaGJvYXJkJztcclxuaW1wb3J0IHtzdGFuZGVlTWFuYWdlcn0gZnJvbSAnLi9zdGFuZGVlL3N0YW5kZWUtbWFuYWdlcic7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtIcE9yaWVudGF0aW9ufSBmcm9tICcuLi9kb21haW4vaHAtb3JpZW50YXRpb24nO1xyXG5pbXBvcnQge1Jvd0NsZWFyRGlyZWN0aW9ufSBmcm9tICcuLi9kb21haW4vcm93LWNsZWFyLWRpcmVjdGlvbic7XHJcblxyXG5jbGFzcyBWaWV3IHtcclxuXHJcbiAgICBwcml2YXRlIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XHJcblxyXG4gICAgcHJpdmF0ZSBza3lTY2VuZTogYW55O1xyXG4gICAgcHJpdmF0ZSBsZWZ0U2NlbmU6IGFueTtcclxuICAgIHByaXZhdGUgcmlnaHRTY2VuZTogYW55O1xyXG4gICAgcHJpdmF0ZSBncm91bmRTY2VuZTogYW55O1xyXG5cclxuICAgIHByaXZhdGUgcmVuZGVyZXI6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIGh1bWFuR3JpZDogTGlnaHRpbmdHcmlkO1xyXG4gICAgcHJpdmF0ZSBodW1hblN3aXRjaGJvYXJkOiBTd2l0Y2hib2FyZDtcclxuICAgIHByaXZhdGUgYWlHcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIGFpU3dpdGNoYm9hcmQ6IFN3aXRjaGJvYXJkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XHJcblxyXG4gICAgICAgIHRoaXMuc2t5U2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgICAgICB0aGlzLmxlZnRTY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gICAgICAgIHRoaXMucmlnaHRTY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kU2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWUsIGNhbnZhczogdGhpcy5jYW52YXN9KTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmF1dG9DbGVhciA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmh1bWFuR3JpZCA9IG5ldyBMaWdodGluZ0dyaWQoSHBPcmllbnRhdGlvbi5EZWNyZWFzZXNSaWdodFRvTGVmdCwgUm93Q2xlYXJEaXJlY3Rpb24uUmlnaHRUb0xlZnQpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5Td2l0Y2hib2FyZCA9IG5ldyBTd2l0Y2hib2FyZCh0aGlzLmh1bWFuR3JpZCwgUGxheWVyVHlwZS5IdW1hbik7XHJcbiAgICAgICAgdGhpcy5haUdyaWQgPSBuZXcgTGlnaHRpbmdHcmlkKEhwT3JpZW50YXRpb24uRGVjcmVhc2VzTGVmdFRvUmlnaHQsIFJvd0NsZWFyRGlyZWN0aW9uLkxlZnRUb1JpZ2h0KTtcclxuICAgICAgICB0aGlzLmFpU3dpdGNoYm9hcmQgPSBuZXcgU3dpdGNoYm9hcmQodGhpcy5haUdyaWQsIFBsYXllclR5cGUuQWkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuaHVtYW5HcmlkLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5odW1hblN3aXRjaGJvYXJkLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5haUdyaWQuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmFpU3dpdGNoYm9hcmQuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb1N0YXJ0KCk7XHJcblxyXG4gICAgICAgIHNreS5zdGFydCgpO1xyXG4gICAgICAgIGdyb3VuZC5zdGFydCgpO1xyXG4gICAgICAgIHN0YW5kZWVNYW5hZ2VyLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIC8vIFRoZSBjYW52YXMgc2hvdWxkIGhhdmUgYmVlbiBoaWRkZW4gdW50aWwgc2V0dXAgaXMgY29tcGxldGUuXHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgc2t5LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgZ3JvdW5kLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuaHVtYW5Td2l0Y2hib2FyZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5HcmlkLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWlHcmlkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5odW1hblN3aXRjaGJvYXJkLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHN0YW5kZWVNYW5hZ2VyLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNreVNjZW5lLCBjYW1lcmFXcmFwcGVyLmNhbWVyYSk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5jbGVhckRlcHRoKCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5sZWZ0U2NlbmUsIGNhbWVyYVdyYXBwZXIuY2FtZXJhKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmNsZWFyRGVwdGgoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnJpZ2h0U2NlbmUsIGNhbWVyYVdyYXBwZXIuY2FtZXJhKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmNsZWFyRGVwdGgoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLmdyb3VuZFNjZW5lLCBjYW1lcmFXcmFwcGVyLmNhbWVyYSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkb1N0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuc2t5U2NlbmUuYWRkKHNreS5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdW5kU2NlbmUuYWRkKGdyb3VuZC5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91bmRTY2VuZS5hZGQoc3RhbmRlZU1hbmFnZXIuZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmxlZnRTY2VuZS5hZGQodGhpcy5odW1hbkdyaWQuZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLnJpZ2h0U2NlbmUuYWRkKHRoaXMuYWlHcmlkLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmFpR3JpZC5ncm91cC5wb3NpdGlvbi5zZXRYKDExKTtcclxuICAgICAgICB0aGlzLmFpR3JpZC5ncm91cC5wb3NpdGlvbi5zZXRaKDEpO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLmdyb3VwLnJvdGF0aW9uLnkgPSAtTWF0aC5QSSAvIDQ7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFRlbXBvcmFyeSBmb3IgZGVidWdnaW5nP1xyXG4gICAgICAgIC8vIHRoaXMuc2NlbmUuYWRkKG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHg0MDQwNDApKTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogVGVtcG9yYXJ5P1xyXG4gICAgICAgIGxldCBzcG90TGlnaHRDb2xvciA9IDB4OTk5OWVlO1xyXG4gICAgICAgIGxldCBsZWZ0U3BvdExpZ2h0ID0gbmV3IFRIUkVFLlNwb3RMaWdodChzcG90TGlnaHRDb2xvcik7XHJcbiAgICAgICAgbGVmdFNwb3RMaWdodC5wb3NpdGlvbi5zZXQoLTMsIDAuNzUsIDIwKTtcclxuICAgICAgICBsZWZ0U3BvdExpZ2h0LnRhcmdldCA9IHRoaXMuYWlHcmlkLmdyb3VwO1xyXG4gICAgICAgIHRoaXMubGVmdFNjZW5lLmFkZChsZWZ0U3BvdExpZ2h0KTtcclxuICAgICAgICBsZXQgcmlnaHRTcG90TGlnaHQgPSBuZXcgVEhSRUUuU3BvdExpZ2h0KHNwb3RMaWdodENvbG9yKTtcclxuICAgICAgICByaWdodFNwb3RMaWdodC5wb3NpdGlvbi5zZXQoMCwgMC43NSwgMjApO1xyXG4gICAgICAgIHJpZ2h0U3BvdExpZ2h0LnRhcmdldCA9IHRoaXMuYWlHcmlkLmdyb3VwO1xyXG4gICAgICAgIHRoaXMucmlnaHRTY2VuZS5hZGQocmlnaHRTcG90TGlnaHQpO1xyXG5cclxuICAgICAgICBjYW1lcmFXcmFwcGVyLnNldFBvc2l0aW9uKC0zLCAwLjc1LCAxNSk7IC8vIE1vcmUgb3IgbGVzcyBleWUtbGV2ZWwgd2l0aCB0aGUgTlBDcy5cclxuICAgICAgICBjYW1lcmFXcmFwcGVyLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMyg1LCA4LCAyKSk7XHJcblxyXG4gICAgICAgIGNhbWVyYVdyYXBwZXIudXBkYXRlUmVuZGVyZXJTaXplKHRoaXMucmVuZGVyZXIpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbWVyYVdyYXBwZXIudXBkYXRlUmVuZGVyZXJTaXplKHRoaXMucmVuZGVyZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCB2aWV3ID0gbmV3IFZpZXcoKTtcclxuIiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgZ3Jhc3M6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDMwMCwgMzAwKTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7ZW1pc3NpdmU6IDB4MDIxZDAzLCBlbWlzc2l2ZUludGVuc2l0eTogMS4wfSk7XHJcbiAgICAgICAgdGhpcy5ncmFzcyA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgdGhpcy5ncmFzcy5yb3RhdGlvbi54ID0gKE1hdGguUEkgKiAzKSAvIDI7XHJcbiAgICAgICAgdGhpcy5ncmFzcy5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5ncmFzcyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBncm91bmQgPSBuZXcgR3JvdW5kKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuY29uc3QgU1RBUlRfWl9BTkdMRSA9IC0oTWF0aC5QSSAvIDMwKTtcclxuY29uc3QgRU5EX1pfQU5HTEUgICA9ICAgTWF0aC5QSSAvIDMwO1xyXG5jb25zdCBST1RBVElPTl9TUEVFRCA9IDAuMDAwMTtcclxuXHJcbmNsYXNzIFNreSB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIGRvbWU6IGFueTtcclxuICAgIHByaXZhdGUgcmR6OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoNTAsIDMyLCAzMik7IC8vIG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgxNTAsIDE1MCwgMTUwKTtcclxuICAgICAgICBsZXQgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuZ2VuZXJhdGVUZXh0dXJlKCkpO1xyXG4gICAgICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7bWFwOiB0ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZX0pO1xyXG4gICAgICAgIHRoaXMuZG9tZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgdGhpcy5kb21lLm1hdGVyaWFsLnNpZGUgPSBUSFJFRS5CYWNrU2lkZTtcclxuICAgICAgICB0aGlzLmRvbWUucG9zaXRpb24uc2V0KDEwLCAxMCwgMCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5kb21lKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZHogPSAtUk9UQVRJT05fU1BFRUQ7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5kb21lLnJvdGF0aW9uLnNldCgwLCAwLCBTVEFSVF9aX0FOR0xFKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuZG9tZS5yb3RhdGlvbi5zZXQoMCwgMCwgdGhpcy5kb21lLnJvdGF0aW9uLnogKyB0aGlzLnJkeik7XHJcbiAgICAgICAgaWYgKHRoaXMuZG9tZS5yb3RhdGlvbi56ID49IEVORF9aX0FOR0xFKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmR6ID0gLVJPVEFUSU9OX1NQRUVEO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5kb21lLnJvdGF0aW9uLnogPD0gU1RBUlRfWl9BTkdMRSkge1xyXG4gICAgICAgICAgICB0aGlzLnJkeiA9IFJPVEFUSU9OX1NQRUVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJhc2VkIG9uOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xOTk5MjUwNVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdlbmVyYXRlVGV4dHVyZSgpOiBhbnkge1xyXG4gICAgICAgIGxldCBzaXplID0gNTEyO1xyXG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICBjYW52YXMud2lkdGggPSBzaXplO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBzaXplO1xyXG4gICAgICAgIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICBjdHgucmVjdCgwLCAwLCBzaXplLCBzaXplKTtcclxuICAgICAgICBsZXQgZ3JhZGllbnQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgc2l6ZSk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuMDAsICcjMDAwMDAwJyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuNDAsICcjMTMxYzQ1Jyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuNzUsICcjZmY5NTQ0Jyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuODUsICcjMTMxYzQ1Jyk7XHJcbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEuMDAsICcjMTMxYzQ1Jyk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgcmV0dXJuIGNhbnZhcztcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc2t5ID0gbmV3IFNreSgpOyJdfQ==
