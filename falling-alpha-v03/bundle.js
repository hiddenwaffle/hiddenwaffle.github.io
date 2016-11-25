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
            autoplay: true,
            loop: true
        });
        ambienceNight.once('load', function () { return _this.preloadCheckIfFinished(); });
        var musicOpening = new Howl({
            src: ['music-opening.m4a'],
            autoplay: true,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2NvbnRyb2xsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2lucHV0LnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL2NlbGwudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vY29uc3RhbnRzLnRzIiwic3JjL3NjcmlwdHMvZG9tYWluL3BsYXllci1tb3ZlbWVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvYm9hcmQtZmlsbGVkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvY2VsbC1jaGFuZ2UtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ldmVudC1idXMudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9mYWxsaW5nLXNlcXVlbmNlci1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9yb3dzLWNsZWFyLWFuaW1hdGlvbi1jb21wbGV0ZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9yb3dzLWZpbGxlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9nYW1lLXN0YXRlLnRzIiwic3JjL3NjcmlwdHMvbWFpbi50cyIsInNyYy9zY3JpcHRzL21vZGVsL2FpL2FpLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvYm9hcmQudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ib2FyZC9mYWxsaW5nLXNlcXVlbmNlci50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL3NoYXBlLWZhY3RvcnkudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ib2FyZC9zaGFwZS50cyIsInNyYy9zY3JpcHRzL21vZGVsL21vZGVsLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbnBjL25wYy1tYW5hZ2VyLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbnBjL25wYy50cyIsInNyYy9zY3JpcHRzL3ByZWxvYWRlci50cyIsInNyYy9zY3JpcHRzL3NvdW5kL3NvdW5kLWxvYWRlci50cyIsInNyYy9zY3JpcHRzL3NvdW5kL3NvdW5kLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L2NhbWVyYS13cmFwcGVyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9idWlsZGluZy1wcmVsb2FkZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2J1aWxkaW5nLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9jdXJ0YWluLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9ocC1wYW5lbHMudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2xpZ2h0aW5nLWdyaWQudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL3N3aXRjaGJvYXJkLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUtYW5pbWF0aW9uLXRleHR1cmUtYmFzZS50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1zcHJpdGUtd3JhcHBlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLnRzIiwic3JjL3NjcmlwdHMvdmlldy92aWV3LnRzIiwic3JjL3NjcmlwdHMvdmlldy93b3JsZC9ncm91bmQudHMiLCJzcmMvc2NyaXB0cy92aWV3L3dvcmxkL3Nr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USxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNwQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZELFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNMLFVBQUM7QUFBRCxDQXZEQSxBQXVEQyxJQUFBO0FBQ1ksV0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtpbnB1dCwgS2V5fSBmcm9tICcuL2lucHV0JztcclxuaW1wb3J0IHtldmVudEJ1c30gZnJvbSAnLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5cclxuLy8gVE9ETzogSGVyZSBkZXRlcm1pbmUgaWYgcGxheWVyIGlzIGhvbGRpbmcgZG93biBvbmUgb2YgdGhlIGFycm93IGtleXM7IGlmIHNvLCBmaXJlIHJhcGlkIGV2ZW50cyBhZnRlciAoVEJEKSBhbW91bnQgb2YgdGltZS5cclxuXHJcbmNsYXNzIENvbnRyb2xsZXIge1xyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGlucHV0LnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpbnB1dC5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICBpZiAoaW5wdXQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5VcCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Sb3RhdGVDbG9ja3dpc2UsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkxlZnQpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuTGVmdCwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuUmlnaHQpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUmlnaHQsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkRvd24pKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRG93biwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0LmlzRG93bkFuZFVuaGFuZGxlZChLZXkuRHJvcCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Ecm9wLCBQbGF5ZXJUeXBlLkh1bWFuKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBjb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5leHBvcnQgY29uc3QgZW51bSBLZXkge1xyXG4gICAgTGVmdCxcclxuICAgIFVwLFxyXG4gICAgRG93bixcclxuICAgIFJpZ2h0LFxyXG4gICAgRHJvcCxcclxuICAgIFBhdXNlLFxyXG4gICAgLy8gUmVzdCBvZiB0aGVzZSBhcmUgc3BlY2lhbCBkaXJlY3RpdmVzXHJcbiAgICBPdGhlcixcclxuICAgIElnbm9yZSxcclxuICAgIFByZXZlbnRcclxufVxyXG5cclxuY29uc3QgZW51bSBTdGF0ZSB7XHJcbiAgICBEb3duLFxyXG4gICAgVXAsXHJcbiAgICBIYW5kbGluZ1xyXG59XHJcblxyXG5jb25zdCBLRVlfUkVQRUFUX0RFTEFZX0lOSVRJQUwgID0gNTUwO1xyXG5jb25zdCBLRVlfUkVQRUFUX0RFTEFZX0NPTlRJTlVFID0gMjAwO1xyXG5cclxuY2xhc3MgSW5wdXQge1xyXG4gICAgcHJpdmF0ZSBrZXlTdGF0ZTogTWFwPEtleSxTdGF0ZT47XHJcblxyXG4gICAgcHJpdmF0ZSBwcmV2aW91c0tleUNvZGU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY3VycmVudEtleUNvZGU6IG51bWJlcjtcclxuICAgIHByaXZhdGUga2V5SGVsZEVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUga2V5SGVsZEluaXRpYWw6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5rZXlTdGF0ZSA9IG5ldyBNYXA8S2V5LFN0YXRlPigpO1xyXG4gICAgICAgIHRoaXMucHJldmlvdXNLZXlDb2RlID0gLTE7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50S2V5Q29kZSA9IC0xO1xyXG4gICAgICAgIHRoaXMua2V5SGVsZEVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMua2V5SGVsZEluaXRpYWwgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRUb1N0YXRlKGV2ZW50LCBTdGF0ZS5Eb3duKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFRvU3RhdGUoZXZlbnQsIFN0YXRlLlVwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGlzIGRvZXMgaXMgaGFuZGxlIGlmIHRoZSBwbGF5ZXIgaXMgaG9sZGluZyBkb3duIGEga2V5IGZvciBhIGNlcnRhaW4gYW1vdW50IG9mIHRpbWUuXHJcbiAgICAgKiBJZiBzbywgZGV0ZXJtaW5lIHdoZXRoZXIgb3Igbm90IHRvIGVtdWxhdGUgdGhlaXIgaGF2aW5nIHByZXNzZWQgdGhlIGtleSBkdXJpbmcgdGhpcyBmcmFtZS5cclxuICAgICAqL1xyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50S2V5Q29kZSAhPT0gdGhpcy5wcmV2aW91c0tleUNvZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5rZXlIZWxkRWxhcHNlZCArPSBlbGFwc2VkO1xyXG5cclxuICAgICAgICAgICAgbGV0IHVwZGF0ZVN0YXRlOiBib29sZWFuO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5rZXlIZWxkSW5pdGlhbCA9PT0gdHJ1ZSAmJiB0aGlzLmtleUhlbGRFbGFwc2VkID49IEtFWV9SRVBFQVRfREVMQVlfSU5JVElBTCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlIZWxkSW5pdGlhbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlIZWxkRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVTdGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlIZWxkSW5pdGlhbCA9PT0gZmFsc2UgJiYgdGhpcy5rZXlIZWxkRWxhcHNlZCA+PSBLRVlfUkVQRUFUX0RFTEFZX0NPTlRJTlVFKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleUhlbGRFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZVN0YXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHVwZGF0ZVN0YXRlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQga2V5ID0gdGhpcy5rZXlDb2RlVG9LZXkodGhpcy5jdXJyZW50S2V5Q29kZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKGtleSwgU3RhdGUuRG93biwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmtleUhlbGRFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgdGhpcy5rZXlIZWxkSW5pdGlhbCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGlmIGdpdmVuIGtleSBpcyAnRG93bicuXHJcbiAgICAgKi9cclxuICAgIGlzRG93bihrZXk6IEtleSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmtleVN0YXRlLmdldChrZXkpID09PSBTdGF0ZS5Eb3duO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGlmIGdpdmVuIGtleSBpcyAnZG93bicuIEFsc28gc2V0cyB0aGUga2V5IGZyb20gJ0Rvd24nIHRvICdIYW5kbGluZycuXHJcbiAgICAgKi9cclxuICAgIGlzRG93bkFuZFVuaGFuZGxlZChrZXk6IEtleSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzRG93bihrZXkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMua2V5U3RhdGUuc2V0KGtleSwgU3RhdGUuSGFuZGxpbmcpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIFRPRE86IFRoaXMgd2Fzbid0IHNldCBpbiBtYXppbmc7IG5lZWQgdG8gc2VlIHdoeS5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUT0RPOiBOb3Qgc3VyZSBpZiB0aGlzIHdvdWxkIHdvcmsgaW4gdGhpcyBnYW1lIHdpdGggdGhlIGtleSBkZWxheSBjYXB0dXJpbmcuXHJcbiAgICAgKiBcclxuICAgICAqIFJldHVybnMgaWYgYW55IGtleSBpcyAnZG93bicuIEFsc28gc2V0IGFsbCAnRG93bicga2V5cyB0byAnSGFuZGxpbmcnLlxyXG4gICAgICovXHJcbiAgICBpc0FueUtleURvd25BbmRVbmhhbmRsZWQoKSB7XHJcbiAgICAgICAgbGV0IGFueUtleURvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmtleVN0YXRlLmZvckVhY2goKHN0YXRlOiBTdGF0ZSwga2V5OiBLZXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIFN0YXRlLkhhbmRsaW5nKTtcclxuICAgICAgICAgICAgICAgIGFueUtleURvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFueUtleURvd247XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudFRvU3RhdGUoZXZlbnQ6IEtleWJvYXJkRXZlbnQsIHN0YXRlOiBTdGF0ZSkge1xyXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gU3RhdGUuRG93bikge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRLZXlDb2RlID0gZXZlbnQua2V5Q29kZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09IFN0YXRlLlVwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEtleUNvZGUgPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0tleUNvZGUgPSAtMTtcclxuICAgICAgIH1cclxuXHJcbiAgICAgICBsZXQga2V5ID0gdGhpcy5rZXlDb2RlVG9LZXkoZXZlbnQua2V5Q29kZSk7XHJcbiAgICAgICB0aGlzLmtleVRvU3RhdGUoa2V5LCBzdGF0ZSwgZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUga2V5Q29kZVRvS2V5KGtleUNvZGU6IG51bWJlcik6IEtleSB7XHJcbiAgICAgICAgbGV0IGtleSA9IEtleS5PdGhlcjtcclxuXHJcbiAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XHJcbiAgICAgICAgICAgIC8vIERpcmVjdGlvbmFscyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDY1OiAvLyAnYSdcclxuICAgICAgICAgICAgY2FzZSAzNzogLy8gbGVmdFxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LkxlZnQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4NzogLy8gJ3cnXHJcbiAgICAgICAgICAgIGNhc2UgMzg6IC8vIHVwXHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuVXA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2ODogLy8gJ2QnXHJcbiAgICAgICAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuUmlnaHQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4MzogLy8gJ3MnXHJcbiAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd25cclxuICAgICAgICAgICAgICAgIGtleSA9IEtleS5Eb3duO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzI6IC8vIHNwYWNlXHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuRHJvcDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy8gUGF1c2UgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgODA6IC8vICdwJ1xyXG4gICAgICAgICAgICBjYXNlIDI3OiAvLyBlc2NcclxuICAgICAgICAgICAgY2FzZSAxMzogLy8gZW50ZXIga2V5XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuUGF1c2U7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBJZ25vcmUgY2VydGFpbiBrZXlzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA4MjogICAgLy8gJ3InXHJcbiAgICAgICAgICAgIGNhc2UgMTg6ICAgIC8vIGFsdFxyXG4gICAgICAgICAgICBjYXNlIDIyNDogICAvLyBhcHBsZSBjb21tYW5kIChmaXJlZm94KVxyXG4gICAgICAgICAgICBjYXNlIDE3OiAgICAvLyBhcHBsZSBjb21tYW5kIChvcGVyYSlcclxuICAgICAgICAgICAgY2FzZSA5MTogICAgLy8gYXBwbGUgY29tbWFuZCwgbGVmdCAoc2FmYXJpL2Nocm9tZSlcclxuICAgICAgICAgICAgY2FzZSA5MzogICAgLy8gYXBwbGUgY29tbWFuZCwgcmlnaHQgKHNhZmFyaS9jaHJvbWUpXHJcbiAgICAgICAgICAgIGNhc2UgODQ6ICAgIC8vICd0JyAoaS5lLiwgb3BlbiBhIG5ldyB0YWIpXHJcbiAgICAgICAgICAgIGNhc2UgNzg6ICAgIC8vICduJyAoaS5lLiwgb3BlbiBhIG5ldyB3aW5kb3cpXHJcbiAgICAgICAgICAgIGNhc2UgMjE5OiAgIC8vIGxlZnQgYnJhY2tldHNcclxuICAgICAgICAgICAgY2FzZSAyMjE6ICAgLy8gcmlnaHQgYnJhY2tldHNcclxuICAgICAgICAgICAgICAgIGtleSA9IEtleS5JZ25vcmU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgc29tZSB1bndhbnRlZCBiZWhhdmlvcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDE5MTogICAvLyBmb3J3YXJkIHNsYXNoIChwYWdlIGZpbmQpXHJcbiAgICAgICAgICAgIGNhc2UgOTogICAgIC8vIHRhYiAoY2FuIGxvc2UgZm9jdXMpXHJcbiAgICAgICAgICAgIGNhc2UgMTY6ICAgIC8vIHNoaWZ0XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuUHJldmVudDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy8gQWxsIG90aGVyIGtleXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUga2V5VG9TdGF0ZShrZXk6IEtleSwgc3RhdGU6IFN0YXRlLCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xyXG4gICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKGtleSkge1xyXG4gICAgICAgICAgICBjYXNlIEtleS5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuTGVmdCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5LlVwOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuVXAsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCkgLSBjb21tZW50ZWQgZm9yIGlmIHRoZSB1c2VyIHdhbnRzIHRvIGNtZCt3IG9yIGN0cmwrd1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5LlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuUmlnaHQsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5Eb3duOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuRG93biwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5LkRyb3A6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5Ecm9wLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLZXkuUGF1c2U6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5QYXVzZSwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IE1heWJlIGFkZCBhIGRlYnVnIGtleSBoZXJlICgnZicpXHJcbiAgICAgICAgICAgIGNhc2UgS2V5Lklnbm9yZTpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5QcmV2ZW50OlxyXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5Lk90aGVyOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuT3RoZXIsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGV2ZW50ICE9IG51bGwgJiYgcHJldmVudERlZmF1bHQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRTdGF0ZShrZXk6IEtleSwgc3RhdGU6IFN0YXRlLCBmb3JjZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgLy8gQWx3YXlzIHNldCAndXAnXHJcbiAgICAgICAgaWYgKHN0YXRlID09PSBTdGF0ZS5VcCkge1xyXG4gICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIHN0YXRlKTtcclxuICAgICAgICAvLyBPbmx5IHNldCAnZG93bicgaWYgaXQgaXMgbm90IGFscmVhZHkgaGFuZGxlZFxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFN0YXRlLkRvd24pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMua2V5U3RhdGUuZ2V0KGtleSkgIT09IFN0YXRlLkhhbmRsaW5nIHx8IGZvcmNlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIHN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGlucHV0ID0gbmV3IElucHV0KCk7IiwiaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi9jb2xvcic7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2VsbCB7XHJcbiAgICBwcml2YXRlIGNvbG9yOiBDb2xvcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNvbG9yID0gQ29sb3IuRW1wdHk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29sb3IoY29sb3I6IENvbG9yKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbG9yKCk6IENvbG9yIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb2xvcjtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE9mZnNldCBjYWxjdWxhdGVkIGZyb20gdG9wLWxlZnQgY29ybmVyIGJlaW5nIDAsIDAuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2VsbE9mZnNldCB7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgUEFORUxfQ09VTlRfUEVSX0ZMT09SID0gMTA7IiwiZXhwb3J0IGVudW0gUGxheWVyTW92ZW1lbnQge1xyXG4gICAgTm9uZSxcclxuICAgIExlZnQsXHJcbiAgICBSaWdodCxcclxuICAgIERvd24sXHJcbiAgICBEcm9wLFxyXG4gICAgUm90YXRlQ2xvY2t3aXNlLFxyXG4gICAgUm90YXRlQ291bnRlckNsb2Nrd2lzZVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi4vbW9kZWwvYm9hcmQvc2hhcGUnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBzaGFwZTogU2hhcGU7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG4gICAgcmVhZG9ubHkgc3RhcnRpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2hhcGU6IFNoYXBlLCBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlLCBzdGFydGluZzogYm9vbGVhbikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5zdGFydGluZyA9IHN0YXJ0aW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQm9hcmRGaWxsZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQm9hcmRGaWxsZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENlbGxDaGFuZ2VFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG4gICAgcmVhZG9ubHkgY2VsbDogQ2VsbDtcclxuICAgIHJlYWRvbmx5IHJvdzogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgY29sOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNlbGw6IENlbGwsIHJvdzogbnVtYmVyLCBjb2w6IG51bWJlciwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5jZWxsID0gY2VsbDtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdztcclxuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5DZWxsQ2hhbmdlRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gRXZlbnRUeXBlIHtcclxuICAgIEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSxcclxuICAgIEFjdGl2ZVNoYXBlRW5kZWRFdmVudFR5cGUsXHJcbiAgICBCb2FyZEZpbGxlZEV2ZW50VHlwZSxcclxuICAgIENlbGxDaGFuZ2VFdmVudFR5cGUsXHJcbiAgICBGYWxsaW5nU2VxdWVuY2VyRXZlbnRUeXBlLFxyXG4gICAgSHBDaGFuZ2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjUGxhY2VkRXZlbnRUeXBlLFxyXG4gICAgTnBjU3RhdGVDaGFnZWRFdmVudFR5cGUsXHJcbiAgICBQbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZSxcclxuICAgIFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50VHlwZSxcclxuICAgIFJvd3NGaWxsZWRFdmVudFR5cGUsXHJcbiAgICBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZVxyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBhYnN0cmFjdCBnZXRUeXBlKCk6RXZlbnRUeXBlXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnRIYW5kbGVyPFQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50PiB7XHJcbiAgICAoZXZlbnQ6IFQpOnZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudEJ1cyB7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVyc0J5VHlwZTpNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVyc0J5VHlwZSA9IG5ldyBNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT4oKTtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3Rlcih0eXBlOkV2ZW50VHlwZSwgaGFuZGxlcjpFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD4pIHtcclxuICAgICAgICBpZiAoIXR5cGUpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaGFuZGxlcnM6RXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+W10gPSB0aGlzLmhhbmRsZXJzQnlUeXBlLmdldCh0eXBlKTtcclxuICAgICAgICBpZiAoaGFuZGxlcnMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZXJzQnlUeXBlLnNldCh0eXBlLCBoYW5kbGVycyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFJldHVybiBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGNhbGxlZCB0byB1bnJlZ2lzdGVyIHRoZSBoYW5kbGVyXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFRPRE86IHVucmVnaXN0ZXIoKS4gQW5kIHJlbW92ZSB0aGUgbWFwIGtleSBpZiB6ZXJvIGhhbmRsZXJzIGxlZnQgZm9yIGl0LlxyXG4gICAgXHJcbiAgICAvLyBUT0RPOiBQcmV2ZW50IGluZmluaXRlIGZpcmUoKT9cclxuICAgIGZpcmUoZXZlbnQ6QWJzdHJhY3RFdmVudCkge1xyXG4gICAgICAgIGxldCBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnNCeVR5cGUuZ2V0KGV2ZW50LmdldFR5cGUoKSk7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiBoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGV2ZW50QnVzID0gbmV3IEV2ZW50QnVzKCk7XHJcbmV4cG9ydCBjb25zdCBkZWFkRXZlbnRCdXMgPSBuZXcgRXZlbnRCdXMoKTsgLy8gVXNlZCBieSBBSS5cclxuIiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhbGxpbmdTZXF1ZW5jZXJFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuRmFsbGluZ1NlcXVlbmNlckV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBIcENoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IGhwOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhwOiBudW1iZXIsIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuaHAgPSBocDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5IcENoYW5nZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtOcGNTdGF0ZX0gZnJvbSAnLi4vZG9tYWluL25wYy1zdGF0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjUGxhY2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgc3RhdGU6IE5wY1N0YXRlO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyXHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgc3RhdGU6IE5wY1N0YXRlLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLk5wY1BsYWNlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyTW92ZW1lbnRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG1vdmVtZW50OiBQbGF5ZXJNb3ZlbWVudDtcclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IobW92ZW1lbnQ6IFBsYXllck1vdmVtZW50LCBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm1vdmVtZW50ID0gbW92ZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuUGxheWVyTW92ZW1lbnRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5Sb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUm93c0ZpbGxlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGZpbGxlZFJvd0lkeHM6IG51bWJlcltdO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihmaWxsZWRSb3dJZHhzOiBudW1iZXJbXSwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5maWxsZWRSb3dJZHhzID0gZmlsbGVkUm93SWR4cy5zbGljZSgwKTtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5Sb3dzRmlsbGVkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHo6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgZW51bSBHYW1lU3RhdGVUeXBlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUgc3RhdGUgcmlnaHQgd2hlbiBKYXZhU2NyaXB0IHN0YXJ0cyBydW5uaW5nLiBJbmNsdWRlcyBwcmVsb2FkaW5nLlxyXG4gICAgICovXHJcbiAgICBJbml0aWFsaXppbmcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZnRlciBwcmVsb2FkIGlzIGNvbXBsZXRlIGFuZCBiZWZvcmUgbWFraW5nIG9iamVjdCBzdGFydCgpIGNhbGxzLlxyXG4gICAgICovXHJcbiAgICBTdGFydGluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgYWZ0ZXIgaW5pdGlhbCBvYmplY3RzIHN0YXJ0KCkgYW5kIGxpa2VseSB3aGVyZSB0aGUgZ2FtZSBpcyB3YWl0aW5nIG9uIHRoZSBwbGF5ZXIncyBmaXJzdCBpbnB1dC5cclxuICAgICAqL1xyXG4gICAgU3RhcnRlZCxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgdGhlIG1haW4gZ2FtZSBsb29wIG9mIGNvbnRyb2xsaW5nIHBpZWNlcy5cclxuICAgICAqL1xyXG4gICAgUGxheWluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuZCBvZiBnYW1lLCBzY29yZSBpcyBzaG93aW5nLCBub3RoaW5nIGxlZnQgdG8gZG8uXHJcbiAgICAgKi9cclxuICAgIEVuZGVkXHJcbn1cclxuXHJcbmNsYXNzIEdhbWVTdGF0ZSB7XHJcbiAgICBwcml2YXRlIGN1cnJlbnQ6IEdhbWVTdGF0ZVR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gR2FtZVN0YXRlVHlwZS5Jbml0aWFsaXppbmc7IC8vIERlZmF1bHQgc3RhdGUuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudCgpOiBHYW1lU3RhdGVUeXBlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHNldEN1cnJlbnQoY3VycmVudDogR2FtZVN0YXRlVHlwZSkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IGN1cnJlbnQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGdhbWVTdGF0ZSA9IG5ldyBHYW1lU3RhdGUoKTsiLCJpbXBvcnQge3ByZWxvYWRlcn0gZnJvbSAnLi9wcmVsb2FkZXInO1xyXG5pbXBvcnQge21vZGVsfSBmcm9tICcuL21vZGVsL21vZGVsJztcclxuaW1wb3J0IHt2aWV3fSBmcm9tICcuL3ZpZXcvdmlldyc7XHJcbmltcG9ydCB7Y29udHJvbGxlcn0gZnJvbSAnLi9jb250cm9sbGVyL2NvbnRyb2xsZXInO1xyXG5pbXBvcnQge3NvdW5kTWFuYWdlcn0gZnJvbSAnLi9zb3VuZC9zb3VuZC1tYW5hZ2VyJztcclxuaW1wb3J0IHtHYW1lU3RhdGVUeXBlLCBnYW1lU3RhdGV9IGZyb20gJy4vZ2FtZS1zdGF0ZSc7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgIGdhbWVTdGF0ZS5zZXRDdXJyZW50KEdhbWVTdGF0ZVR5cGUuSW5pdGlhbGl6aW5nKTtcclxuICAgIHNvdW5kTWFuYWdlci5hdHRhY2goKTtcclxuICAgIHByZWxvYWRlci5wcmVsb2FkKCgpID0+IHtcclxuICAgICAgICBtYWluKCk7XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBtYWluKCkge1xyXG5cclxuICAgIC8vIFN0YXJ0dXAgaW4gcmV2ZXJzZSBNVkMgb3JkZXIgdG8gZW5zdXJlIHRoYXQgZXZlbnQgYnVzIGhhbmRsZXJzIGluIHRoZVxyXG4gICAgLy8gY29udHJvbGxlciBhbmQgdmlldyByZWNlaXZlIChhbnkpIHN0YXJ0IGV2ZW50cyBmcm9tIG1vZGVsLnN0YXJ0KCkuXHJcbiAgICBjb250cm9sbGVyLnN0YXJ0KCk7XHJcbiAgICB2aWV3LnN0YXJ0KCk7XHJcbiAgICBtb2RlbC5zdGFydCgpO1xyXG4gICAgXHJcbiAgICBnYW1lU3RhdGUuc2V0Q3VycmVudChHYW1lU3RhdGVUeXBlLlN0YXJ0ZWQpO1xyXG5cclxuICAgIGxldCBzdGVwID0gKCkgPT4ge1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcclxuXHJcbiAgICAgICAgbGV0IGVsYXBzZWQgPSBjYWxjdWxhdGVFbGFwc2VkKCk7XHJcbiAgICAgICAgY29udHJvbGxlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHZpZXcuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBtb2RlbC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHNvdW5kTWFuYWdlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfTtcclxuICAgIHN0ZXAoKTtcclxufVxyXG5cclxubGV0IGxhc3RTdGVwID0gRGF0ZS5ub3coKTtcclxuZnVuY3Rpb24gY2FsY3VsYXRlRWxhcHNlZCgpIHtcclxuICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSBsYXN0U3RlcDtcclxuICAgIGlmIChlbGFwc2VkID4gMTAwKSB7XHJcbiAgICAgICAgZWxhcHNlZCA9IDEwMDsgLy8gZW5mb3JjZSBzcGVlZCBsaW1pdFxyXG4gICAgfVxyXG4gICAgbGFzdFN0ZXAgPSBub3c7XHJcbiAgICByZXR1cm4gZWxhcHNlZDtcclxufSIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4uL2JvYXJkL3NoYXBlJztcclxuaW1wb3J0IHtQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb25zdGFudHMnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtldmVudEJ1cywgRXZlbnRUeXBlfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50RXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudCc7XHJcblxyXG5jb25zdCBNQVhfQ09MUyA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjtcclxuY29uc3QgVElNRV9CRVRXRUVOX01PVkVTID0gMjUwO1xyXG5jb25zdCBUSU1FX01BWF9ERVZJQVRJT04gPSAxMDA7XHJcblxyXG5pbnRlcmZhY2UgWm9tYmllQm9hcmQge1xyXG4gICAgLy8gV2F5cyB0byBpbnRlcmFjdCB3aXRoIGl0LlxyXG4gICAgbW92ZVNoYXBlTGVmdCgpOiBib29sZWFuO1xyXG4gICAgbW92ZVNoYXBlUmlnaHQoKTogYm9vbGVhbjtcclxuICAgIG1vdmVTaGFwZURvd24oKTogYm9vbGVhbjtcclxuICAgIG1vdmVTaGFwZURvd25BbGxUaGVXYXkoKTogdm9pZDtcclxuICAgIG1vdmVUb1RvcCgpOiB2b2lkO1xyXG4gICAgcm90YXRlU2hhcGVDbG9ja3dpc2UoKTogYm9vbGVhbjtcclxuICAgIGNvbnZlcnRTaGFwZVRvQ2VsbHMoKTogdm9pZDtcclxuICAgIHVuZG9Db252ZXJ0U2hhcGVUb0NlbGxzKCk6IHZvaWQ7XHJcblxyXG4gICAgLy8gV2F5cyB0byBkZXJpdmUgaW5mb3JtYXRpb24gZnJvbSBpdC5cclxuICAgIGdldEN1cnJlbnRTaGFwZUNvbElkeCgpOiBudW1iZXI7XHJcbiAgICBjYWxjdWxhdGVBZ2dyZWdhdGVIZWlnaHQoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlQ29tcGxldGVMaW5lcygpOiBudW1iZXI7XHJcbiAgICBjYWxjdWxhdGVIb2xlcygpOiBudW1iZXI7XHJcbiAgICBjYWxjdWxhdGVCdW1waW5lc3MoKTogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUmVhbEJvYXJkIGV4dGVuZHMgWm9tYmllQm9hcmQge1xyXG4gICAgY2xvbmVab21iaWUoKTogWm9tYmllQm9hcmQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBaSB7XHJcblxyXG4gICAgcHJpdmF0ZSByZWFsQm9hcmQ6IFJlYWxCb2FyZDtcclxuICAgIHByaXZhdGUgdGltZVVudGlsTmV4dE1vdmU6IG51bWJlcjtcclxuXHJcbiAgICAvLyAwID0gbm8gcm90YXRpb24sIDEgPSBvbmUgcm90YXRpb24sIDIgPSB0d28gcm90YXRpb25zLCAzID0gdGhyZWUgcm90YXRpb25zLlxyXG4gICAgcHJpdmF0ZSB0YXJnZXRSb3RhdGlvbjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50Um90YXRpb246IG51bWJlcjtcclxuICAgIHByaXZhdGUgdGFyZ2V0Q29sSWR4OiBudW1iZXI7XHJcbiAgICAvLyBQcmV2ZW50IEFJIGZyb20gZG9pbmcgYW55dGhpbmcgd2hpbGUgdGhlIHBpZWNlIGlzIHdhaXRpbmcgdG8gXCJsb2NrXCIgaW50byB0aGUgbWF0cml4LlxyXG4gICAgcHJpdmF0ZSBtb3ZlQ29tcGxldGVkOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJlYWxCb2FyZDogUmVhbEJvYXJkKSB7XHJcbiAgICAgICAgdGhpcy5yZWFsQm9hcmQgPSByZWFsQm9hcmQ7XHJcbiAgICAgICAgdGhpcy50aW1lVW50aWxOZXh0TW92ZSA9IFRJTUVfQkVUV0VFTl9NT1ZFUztcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXRSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um90YXRpb24gPSAwO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0Q29sSWR4ID0gMDtcclxuICAgICAgICB0aGlzLm1vdmVDb21wbGV0ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy50aW1lVW50aWxOZXh0TW92ZSAtPSBlbGFwc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLnRpbWVVbnRpbE5leHRNb3ZlIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy50aW1lVW50aWxOZXh0TW92ZSA9IFRJTUVfQkVUV0VFTl9NT1ZFUztcclxuICAgICAgICAgICAgdGhpcy5hZHZhbmNlVG93YXJkc1RhcmdldCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgbWV0aG9kIHByb3ZpZGVzIGEgaGlnaC1sZXZlbCB2aWV3IG9mIHRoZSBBSSdzIHRob3VnaHQgcHJvY2Vzcy5cclxuICAgICAqL1xyXG4gICAgc3RyYXRlZ2l6ZSgpIHtcclxuICAgICAgICBsZXQgem9tYmllID0gdGhpcy5yZWFsQm9hcmQuY2xvbmVab21iaWUoKTtcclxuXHJcbiAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGFsbCBwb3NzaWJsZSByb3RhdGlvbnMgYW5kIGNvbHVtbnNcclxuICAgICAgICBsZXQgYmVzdEZpdG5lc3MgPSBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUjtcclxuICAgICAgICBsZXQgYmVzdFJvdGF0aW9uID0gMDtcclxuICAgICAgICBsZXQgYmVzdENvbElkeCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgcm90YXRpb24gPSAwOyByb3RhdGlvbiA8IDQ7IHJvdGF0aW9uKyspIHtcclxuICAgICAgICAgICAgd2hpbGUoem9tYmllLm1vdmVTaGFwZUxlZnQoKSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBNQVhfQ09MUzsgaWR4KyspIHtcclxuICAgICAgICAgICAgICAgIHpvbWJpZS5tb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk7XHJcbiAgICAgICAgICAgICAgICB6b21iaWUuY29udmVydFNoYXBlVG9DZWxscygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBmaXRuZXNzID0gdGhpcy5jYWxjdWxhdGVGaXRuZXNzKHpvbWJpZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZml0bmVzczogJyArIGZpdG5lc3MgKyAnLCByb3RhdGlvbjogJyArIHJvdGF0aW9uICsgJywgY29sOiAnICsgY29sSWR4KTtcclxuICAgICAgICAgICAgICAgIGlmIChmaXRuZXNzID4gYmVzdEZpdG5lc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Rml0bmVzcyA9IGZpdG5lc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdFJvdGF0aW9uID0gcm90YXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdENvbElkeCA9IHpvbWJpZS5nZXRDdXJyZW50U2hhcGVDb2xJZHgoKTsgLy8gVXNlIHRoaXMgcmF0aGVyIHRoYW4gaWR4IGluIGNhc2UgaXQgd2FzIG9mZiBiZWNhdXNlIG9mIHdoYXRldmVyIHJlYXNvbiAob2JzdHJ1Y3Rpb24sIHdhbGwsIGV0Yy4uLilcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB6b21iaWUudW5kb0NvbnZlcnRTaGFwZVRvQ2VsbHMoKTtcclxuICAgICAgICAgICAgICAgIHpvbWJpZS5tb3ZlVG9Ub3AoKTtcclxuICAgICAgICAgICAgICAgIGxldCBjYW5Nb3ZlUmlnaHQgPSB6b21iaWUubW92ZVNoYXBlUmlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYW5Nb3ZlUmlnaHQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgem9tYmllLnJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdiZXN0Rml0bmVzczogJWYsICVkLCAlZCcsIGJlc3RGaXRuZXNzLCBiZXN0Um90YXRpb24sIGJlc3RDb2xJZHgpO1xyXG5cclxuICAgICAgICAvLyBGaW5hbGx5LCBzZXQgdGhlIHZhbHVlcyB0aGF0IHdpbGwgbGV0IHRoZSBBSSBhZHZhbmNlIHRvd2FyZHMgdGhlIHRhcmdldC5cclxuICAgICAgICB0aGlzLnRhcmdldFJvdGF0aW9uID0gYmVzdFJvdGF0aW9uO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gMDtcclxuICAgICAgICB0aGlzLnRhcmdldENvbElkeCA9IGJlc3RDb2xJZHg7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ29tcGxldGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlZCBvbiBodHRwczovL2NvZGVteXJvYWQud29yZHByZXNzLmNvbS8yMDEzLzA0LzE0L3RldHJpcy1haS10aGUtbmVhci1wZXJmZWN0LXBsYXllci9cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVGaXRuZXNzKHpvbWJpZTogWm9tYmllQm9hcmQpIHtcclxuICAgICAgICBsZXQgYWdncmVnYXRlSGVpZ2h0ID0gem9tYmllLmNhbGN1bGF0ZUFnZ3JlZ2F0ZUhlaWdodCgpO1xyXG4gICAgICAgIGxldCBjb21wbGV0ZUxpbmVzID0gem9tYmllLmNhbGN1bGF0ZUNvbXBsZXRlTGluZXMoKTtcclxuICAgICAgICBsZXQgaG9sZXMgPSB6b21iaWUuY2FsY3VsYXRlSG9sZXMoKTtcclxuICAgICAgICBsZXQgYnVtcGluZXNzID0gem9tYmllLmNhbGN1bGF0ZUJ1bXBpbmVzcygpO1xyXG4gICAgICAgIGxldCBmaXRuZXNzID0gKC0wLjUxMDA2NiAqIGFnZ3JlZ2F0ZUhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICArICggMC43NjA2NjYgKiBjb21wbGV0ZUxpbmVzKVxyXG4gICAgICAgICAgICAgICAgICAgICsgKC0wLjM1NjYzICAqIGhvbGVzKVxyXG4gICAgICAgICAgICAgICAgICAgICsgKC0wLjE4NDQ4MyAqIGJ1bXBpbmVzcyk7XHJcbiAgICAgICAgcmV0dXJuIGZpdG5lc3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZHZhbmNlVG93YXJkc1RhcmdldCgpIHtcclxuICAgICAgICBpZiAodGhpcy5tb3ZlQ29tcGxldGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3RhdGlvbiA9PT0gdGhpcy50YXJnZXRSb3RhdGlvbiAmJiB0aGlzLnJlYWxCb2FyZC5nZXRDdXJyZW50U2hhcGVDb2xJZHgoKSA9PT0gdGhpcy50YXJnZXRDb2xJZHgpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogRHJvcCBzaGFwZSBzaG91bGQgYmUgb24gYSB0aW1lciBvciBzb21ldGhpbmcuXHJcbiAgICAgICAgICAgIHRoaXMucmVhbEJvYXJkLm1vdmVTaGFwZURvd25BbGxUaGVXYXkoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Um90YXRpb24gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldENvbElkeCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNvbXBsZXRlZCA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdGF0aW9uIDwgdGhpcy50YXJnZXRSb3RhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFsQm9hcmQucm90YXRlU2hhcGVDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uKys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWxCb2FyZC5nZXRDdXJyZW50U2hhcGVDb2xJZHgoKSA8IHRoaXMudGFyZ2V0Q29sSWR4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5tb3ZlU2hhcGVSaWdodCgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVhbEJvYXJkLmdldEN1cnJlbnRTaGFwZUNvbElkeCgpID4gdGhpcy50YXJnZXRDb2xJZHgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhbEJvYXJkLm1vdmVTaGFwZUxlZnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBwcml2YXRlIHBlcmZvcm1OZXdNb3ZlbWVudCgpIHtcclxuICAgICAgICAvLyBsZXQgbWF0cml4ID0gdGhpcy52aXN1YWwubWF0cml4O1xyXG4gICAgICAgIC8vIGxldCBzaGFwZSA9IHRoaXMudmlzdWFsLmN1cnJlbnRTaGFwZTtcclxuXHJcbiAgICAgICAgLy8gbGV0IHJhbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1KTtcclxuXHJcbiAgICAgICAgLy8gaWYgKHJhbmQgPT09IDApIHtcclxuICAgICAgICAvLyAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Sb3RhdGVDbG9ja3dpc2UsIFBsYXllclR5cGUuQWkpKTtcclxuICAgICAgICAvLyB9IGVsc2UgaWYgKHJhbmQgPT09IDEpIHtcclxuICAgICAgICAvLyAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5MZWZ0LCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChyYW5kID09PSAyKSB7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUmlnaHQsIFBsYXllclR5cGUuQWkpKTtcclxuICAgICAgICAvLyB9IGVsc2UgaWYgKHJhbmQgPT09IDMpIHtcclxuICAgICAgICAvLyAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Eb3duLCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChyYW5kID09PSA0KSB7XHJcbiAgICAgICAgLy8gICAgIGxldCBkcm9wQ2hhbmNlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKTsgLy8gSXMgdGhpcyBjYWxsZWQgTW9udGUtQ2FybG8/XHJcbiAgICAgICAgLy8gICAgIGlmIChkcm9wQ2hhbmNlIDwgMTApIHtcclxuICAgICAgICAvLyAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRHJvcCwgUGxheWVyVHlwZS5BaSkpO1xyXG4gICAgICAgIC8vICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgICAgICAgLy8gRG8gbm90aGluZyB0aGlzIHJvdW5kOyBtYXliZSBjb25zaWRlcmVkIGEgaGVzaXRhdGlvbi5cclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCdzaG91bGQgbm90IGdldCBoZXJlJyk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgLy8gfVxyXG5cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlVGltZVVudGlsTmV4dE1vdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoVElNRV9CRVRXRUVOX01PVkVTICsgKChNYXRoLnJhbmRvbSgpICogVElNRV9NQVhfREVWSUFUSU9OKSAtIChUSU1FX01BWF9ERVZJQVRJT04gLyAyKSkpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi9zaGFwZSc7XHJcbmltcG9ydCB7Q2VsbH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uLy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuaW1wb3J0IHtTaGFwZUZhY3RvcnksIGRlYWRTaGFwZUZhY3Rvcnl9IGZyb20gJy4vc2hhcGUtZmFjdG9yeSc7XHJcbmltcG9ydCB7RXZlbnRCdXMsIGRlYWRFdmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtDZWxsQ2hhbmdlRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2NlbGwtY2hhbmdlLWV2ZW50JztcclxuaW1wb3J0IHtSb3dzRmlsbGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3Jvd3MtZmlsbGVkLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge0JvYXJkRmlsbGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2JvYXJkLWZpbGxlZC1ldmVudCc7XHJcblxyXG5jb25zdCBNQVhfUk9XUyA9IDE5OyAvLyBUb3AgMiByb3dzIGFyZSBvYnN0cnVjdGVkIGZyb20gdmlldy4gQWxzbywgc2VlIGxpZ2h0aW5nLWdyaWQudHMuXHJcbmNvbnN0IE1BWF9DT0xTID0gUEFORUxfQ09VTlRfUEVSX0ZMT09SO1xyXG5jb25zdCBURU1QX0RFTEFZX01TID0gNTAwO1xyXG5cclxuY29uc3QgZW51bSBCb2FyZFN0YXRlIHtcclxuICAgIFBhdXNlZCxcclxuICAgIEluUGxheVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQm9hcmQge1xyXG4gICAgcHJpdmF0ZSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG4gICAgcHJpdmF0ZSBzaGFwZUZhY3Rvcnk6IFNoYXBlRmFjdG9yeTtcclxuICAgIHByaXZhdGUgZXZlbnRCdXM6IEV2ZW50QnVzO1xyXG5cclxuICAgIHByaXZhdGUgYm9hcmRTdGF0ZTogQm9hcmRTdGF0ZTtcclxuICAgIHByaXZhdGUgbXNUaWxsR3Jhdml0eVRpY2s6IG51bWJlcjtcclxuXHJcbiAgICBjdXJyZW50U2hhcGU6IFNoYXBlO1xyXG4gICAgcmVhZG9ubHkgbWF0cml4OiBDZWxsW11bXTtcclxuXHJcbiAgICBwcml2YXRlIGp1bmtSb3dIb2xlQ29sdW1uOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGp1bmtSb3dIb2xlRGlyZWN0aW9uOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGp1bmtSb3dDb2xvcjE6IENvbG9yO1xyXG4gICAgcHJpdmF0ZSBqdW5rUm93Q29sb3IyOiBDb2xvcjtcclxuICAgIHByaXZhdGUganVua1Jvd0NvbG9ySWR4OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSwgc2hhcGVGYWN0b3J5OiBTaGFwZUZhY3RvcnksIGV2ZW50QnVzOiBFdmVudEJ1cykge1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5zaGFwZUZhY3RvcnkgPSBzaGFwZUZhY3Rvcnk7XHJcbiAgICAgICAgdGhpcy5ldmVudEJ1cyA9IGV2ZW50QnVzO1xyXG5cclxuICAgICAgICB0aGlzLmJvYXJkU3RhdGUgPSBCb2FyZFN0YXRlLlBhdXNlZDtcclxuICAgICAgICB0aGlzLm1zVGlsbEdyYXZpdHlUaWNrID0gVEVNUF9ERUxBWV9NUztcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubWF0cml4ID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgTUFYX1JPV1M7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4W3Jvd0lkeF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF0gPSBuZXcgQ2VsbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gTUFYX0NPTFMgLSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmp1bmtSb3dIb2xlRGlyZWN0aW9uID0gMTtcclxuICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcjEgPSBDb2xvci5XaGl0ZTtcclxuICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcjIgPSBDb2xvci5XaGl0ZTtcclxuICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcklkeCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRBbmRQbGF5KCkge1xyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmJvYXJkU3RhdGUgPSBCb2FyZFN0YXRlLkluUGxheTtcclxuICAgICAgICB0aGlzLnN0YXJ0U2hhcGUodHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGdpdmVzIGEgaGlnaCBsZXZlbCB2aWV3IG9mIHRoZSBtYWluIGdhbWUgbG9vcC5cclxuICAgICAqIFRoaXMgc2hvdWxkbid0IGJlIGNhbGxlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5QYXVzZWQpIHtcclxuICAgICAgICAgICAgLy8gVGhpcyBpcyBoZXJlIGp1c3QgdG8gZW5zdXJlIHRoYXQgdGhlIG1ldGhvZCB0byBydW5zIGltbWVkaWF0ZWx5IGFmdGVyIHVucGF1c2luZy5cclxuICAgICAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayAtPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tc1RpbGxHcmF2aXR5VGljayA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1zVGlsbEdyYXZpdHlUaWNrID0gVEVNUF9ERUxBWV9NUztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyeUdyYXZpdHkoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZVNoYXBlRG93bigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUVuZE9mQ3VycmVudFBpZWNlVGFza3MoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGwgdGhpcyBvbmNlIGEgc2hhcGUgaXMga25vd24gdG8gYmUgaW4gaXRzIGZpbmFsIHJlc3RpbmcgcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIGhhbmRsZUVuZE9mQ3VycmVudFBpZWNlVGFza3MoKSB7XHJcbiAgICAgICAgdGhpcy5jb252ZXJ0U2hhcGVUb0NlbGxzKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFuZGxlRnVsbEJvYXJkKCkpIHtcclxuICAgICAgICAgICAgLy8gQm9hcmQgaXMgZnVsbCAtLSBzdGFydGluZyBhIG5ldyBzaGFwZSB3YXMgZGVsZWdhdGVkIHRvIGxhdGVyIGJ5IGhhbmRsZUZ1bGxCb2FyZCgpLlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhhbmRsZUFueUZpbGxlZExpbmVzUGFydDEoKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlcmUgd2VyZSBmaWxsZWQgbGluZXMgLS0gc3RhcnRpbmcgYSBuZXcgc2hhcGUgd2FzIGRlbGVnYXRlZCB0byBsYXRlciBieSBoYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQxKCkuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0U2hhcGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIGdldEN1cnJlbnRTaGFwZUNvbElkeCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVMZWZ0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzdWNjZXNzOiBib29sZWFuO1xyXG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdGUgPT09IEJvYXJkU3RhdGUuSW5QbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVSaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVSaWdodCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLkluUGxheSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlUmlnaHQoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZUxlZnQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlRG93bigpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLkluUGxheSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlRG93bigpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlRG93bkFsbFRoZVdheSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLkluUGxheSkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlRG93bigpO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKTsgLy8gVE9ETzogQWRkIHVwcGVyIGJvdW5kLlxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBtb3ZlVG9Ub3AoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVRvVG9wKCk7IFxyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzdWNjZXNzOiBib29sZWFuO1xyXG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdGUgPT09IEJvYXJkU3RhdGUuSW5QbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLnJvdGF0ZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5yb3RhdGVDb3VudGVyQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEp1bmtSb3dzKG51bWJlck9mUm93c1RvQWRkOiBudW1iZXIpIHtcclxuICAgICAgICAvLyBDbGVhciByb3dzIGF0IHRoZSB0b3AgdG8gbWFrZSByb29tIGF0IHRoZSBib3R0b20uXHJcbiAgICAgICAgdGhpcy5tYXRyaXguc3BsaWNlKDAsIG51bWJlck9mUm93c1RvQWRkKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGp1bmsgcm93cyBhdCB0aGUgYm90dG9tLlxyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IG51bWJlck9mUm93c1RvQWRkOyBpZHgrKykge1xyXG4gICAgICAgICAgICAvLyBTZXQgdGhlIHJvdyB0byBjb21wbGV0ZWx5IGZpbGxlZC5cclxuICAgICAgICAgICAgbGV0IGNvbG9yID0gdGhpcy5nZXROZXh0SnVua1Jvd0NvbG9yKCk7XHJcbiAgICAgICAgICAgIGxldCByb3c6IENlbGxbXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gbmV3IENlbGwoKTtcclxuICAgICAgICAgICAgICAgIGNlbGwuc2V0Q29sb3IoY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgcm93LnB1c2goY2VsbCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFB1bmNoIGEgaG9sZSBpbiB0aGUgbGluZS5cclxuICAgICAgICAgICAgbGV0IGNlbGwgPSByb3dbdGhpcy5qdW5rUm93SG9sZUNvbHVtbl07XHJcbiAgICAgICAgICAgIGNlbGwuc2V0Q29sb3IoQ29sb3IuRW1wdHkpO1xyXG5cclxuICAgICAgICAgICAgLy8gUHJlcGFyZSBmb3IgdGhlIG5leHQganVuayByb3cgbGluZS5cclxuICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZUNvbHVtbiArPSB0aGlzLmp1bmtSb3dIb2xlRGlyZWN0aW9uO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5qdW5rUm93SG9sZUNvbHVtbiA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbiAqPSAtMTsgLy8gRmxpcHMgdGhlIGRpcmVjdGlvblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPj0gTUFYX0NPTFMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPSBNQVhfQ09MUyAtIDI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlRGlyZWN0aW9uICo9IC0xOyAvLyBGbGlwcyB0aGUgZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4LnB1c2gocm93KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gTm90aWZ5IGZvciBhbGwgY2VsbHMgYmVjYXVzZSBlbnRpcmUgYm9hcmQgaGFzIGNoYW5nZWQuXHJcbiAgICAgICAgLy8gVE9ETzogTW92ZSB0byBvd24gbWV0aG9kP1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgQ2VsbENoYW5nZUV2ZW50KGNlbGwsIHJvd0lkeCwgY29sSWR4LCB0aGlzLnBsYXllclR5cGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUHJldmVudCBhY3RpdmUgc2hhcGUgZnJvbSBnZXR0aW5nIGJ1cmllZCBpbiBhcyBtYW55IGFzIDQgcm93cy5cclxuICAgICAgICBmb3IgKGxldCBjb3VudCA9IDA7IGNvdW50IDwgNDsgY291bnQrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U2hhcGUuZ2V0Um93KCkgPiAwICYmIHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVVwKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVmVyeSBoYWNreSBtZXRob2QganVzdCBzbyB0aGUgQUkgaGFzIGEgdGVtcCBjb3B5IG9mIHRoZSBib2FyZCB0byBleHBlcmltZW50IHdpdGguXHJcbiAgICAgKi9cclxuICAgIGNsb25lWm9tYmllKCk6IEJvYXJkIHtcclxuICAgICAgICBsZXQgY29weSA9IG5ldyBCb2FyZCh0aGlzLnBsYXllclR5cGUsIGRlYWRTaGFwZUZhY3RvcnksIGRlYWRFdmVudEJ1cyk7XHJcblxyXG4gICAgICAgIC8vIEFsbG93IHRoZSBBSSB0byBtb3ZlIGFuZCByb3RhdGUgdGhlIGN1cnJlbnQgc2hhcGVcclxuICAgICAgICBjb3B5LmJvYXJkU3RhdGUgPSBCb2FyZFN0YXRlLkluUGxheTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBDb3B5IHRoZSBjdXJyZW50IHNoYXBlIGFuZCB0aGUgbWF0cml4LiBTaG91bGRuJ3QgbmVlZCBhbnl0aGluZyBlbHNlLlxyXG4gICAgICAgIGNvcHkuY3VycmVudFNoYXBlID0gdGhpcy5jdXJyZW50U2hhcGUuY2xvbmVTaW1wbGUoKTtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgY29weS5tYXRyaXhbcm93SWR4XVtjb2xJZHhdLnNldENvbG9yKHJvd1tjb2xJZHhdLmdldENvbG9yKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29weTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVBZ2dyZWdhdGVIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgY29sSGVpZ2h0cyA9IHRoaXMuY2FsY3VsYXRlQ29sdW1uSGVpZ2h0cygpO1xyXG4gICAgICAgIHJldHVybiBjb2xIZWlnaHRzLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYSArIGI7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgRmFsbGluZ1NlcXVlbmNlci5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlSGlnaGVzdENvbHVtbigpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBjb2xIZWlnaHRzID0gdGhpcy5jYWxjdWxhdGVDb2x1bW5IZWlnaHRzKCk7XHJcbiAgICAgICAgcmV0dXJuIGNvbEhlaWdodHMucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhID4gYiA/IGEgOiBiOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVDb21wbGV0ZUxpbmVzKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGNvbXBsZXRlTGluZXMgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvd1tjb2xJZHhdLmdldENvbG9yKCkgIT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY291bnQgPj0gcm93Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGVMaW5lcysrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29tcGxldGVMaW5lcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICogRGV0ZXJtaW5lcyBob2xlcyBieSBzY2FubmluZyBlYWNoIGNvbHVtbiwgaGlnaGVzdCBmbG9vciB0byBsb3dlc3QgZmxvb3IsIGFuZFxyXG4gICAgICogc2VlaW5nIGhvdyBtYW55IHRpbWVzIGl0IHN3aXRjaGVzIGZyb20gY29sb3JlZCB0byBlbXB0eSAoYnV0IG5vdCB0aGUgb3RoZXIgd2F5IGFyb3VuZCkuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZUhvbGVzKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHRvdGFsSG9sZXMgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgaG9sZXMgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c0NlbGxXYXNFbXB0eSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBob2xlcysrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NlbGxXYXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjZWxsLmdldENvbG9yKCkgPT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NlbGxXYXNFbXB0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b3RhbEhvbGVzICs9IGhvbGVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdG90YWxIb2xlcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVCdW1waW5lc3MoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgYnVtcGluZXNzID0gMDtcclxuICAgICAgICBsZXQgY29sSGVpZ2h0cyA9IHRoaXMuY2FsY3VsYXRlQ29sdW1uSGVpZ2h0cygpO1xyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGNvbEhlaWdodHMubGVuZ3RoIC0gMjsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHZhbDEgPSBjb2xIZWlnaHRzW2lkeF07XHJcbiAgICAgICAgICAgIGxldCB2YWwyID0gY29sSGVpZ2h0c1tpZHggKyAxXTtcclxuICAgICAgICAgICAgYnVtcGluZXNzICs9IE1hdGguYWJzKHZhbDEgLSB2YWwyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGJ1bXBpbmVzcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZUNvbHVtbkhlaWdodHMoKTogbnVtYmVyW10ge1xyXG4gICAgICAgIGxldCBjb2xIZWlnaHRzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICBjb2xIZWlnaHRzLnB1c2goMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IGhpZ2hlc3QgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCByb3dJZHggPSBNQVhfUk9XUyAtIDE7IHJvd0lkeCA+PSAwOyByb3dJZHgtLSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hlc3QgPSBNQVhfUk9XUyAtIHJvd0lkeDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb2xIZWlnaHRzW2NvbElkeF0gPSBoaWdoZXN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29sSGVpZ2h0cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBvbmx5IHJlYXNvbiB0aGlzIGlzIG5vdCBwcml2YXRlIGlzIHNvIHRoZSBBSSBjYW4gZXhwZXJpbWVudCB3aXRoIGl0LlxyXG4gICAgICogV29yayBoZXJlIHNob3VsZCBhYmxlIHRvIGJlIGJlIHVuZG9uZSBieSB1bmRvQ29udmVydFNoYXBlVG9DZWxscy5cclxuICAgICAqL1xyXG4gICAgY29udmVydFNoYXBlVG9DZWxscygpIHtcclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2YgdGhpcy5jdXJyZW50U2hhcGUuZ2V0T2Zmc2V0cygpKSB7XHJcbiAgICAgICAgICAgIGxldCByb3dJZHggPSBvZmZzZXQueSArIHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpO1xyXG4gICAgICAgICAgICBsZXQgY29sSWR4ID0gb2Zmc2V0LnggKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3dJZHggPCAwIHx8IHJvd0lkeCA+PSB0aGlzLm1hdHJpeC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sSWR4IDwgMCB8fCBjb2xJZHggPj0gdGhpcy5tYXRyaXhbcm93SWR4XS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgdGhpcy5jdXJyZW50U2hhcGUuY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLiBTaG91bGQgdW5kbyBjb252ZXJ0U2hhcGVUb0NlbGxzKCkuXHJcbiAgICAgKi9cclxuICAgIHVuZG9Db252ZXJ0U2hhcGVUb0NlbGxzKCkge1xyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiB0aGlzLmN1cnJlbnRTaGFwZS5nZXRPZmZzZXRzKCkpIHtcclxuICAgICAgICAgICAgbGV0IHJvd0lkeCA9IG9mZnNldC55ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Um93KCk7XHJcbiAgICAgICAgICAgIGxldCBjb2xJZHggPSBvZmZzZXQueCArIHRoaXMuY3VycmVudFNoYXBlLmdldENvbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvd0lkeCA8IDAgfHwgcm93SWR4ID49IHRoaXMubWF0cml4Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb2xJZHggPCAwIHx8IGNvbElkeCA+PSB0aGlzLm1hdHJpeFtyb3dJZHhdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2VsbENvbG9yKHJvd0lkeCwgY29sSWR4LCBDb2xvci5FbXB0eSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2xlYXIoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2VsbENvbG9yKHJvd0lkeCwgY29sSWR4LCBDb2xvci5FbXB0eSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFt0aGlzLmp1bmtSb3dDb2xvcjEsIHRoaXMuanVua1Jvd0NvbG9yMl0gPSB0aGlzLmdldFJhbmRvbUNvbG9ycygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGVscGVyIG1ldGhvZCB0byBjaGFuZ2UgYSBzaW5nbGUgY2VsbCBjb2xvcidzIGFuZCBub3RpZnkgc3Vic2NyaWJlcnMgYXQgdGhlIHNhbWUgdGltZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGFuZ2VDZWxsQ29sb3Iocm93SWR4OiBudW1iZXIsIGNvbElkeDogbnVtYmVyLCBjb2xvcjogQ29sb3IpIHtcclxuICAgICAgICAvLyBUT0RPOiBNYXliZSBib3VuZHMgY2hlY2sgaGVyZS5cclxuICAgICAgICBsZXQgY2VsbCA9IHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XTtcclxuICAgICAgICBjZWxsLnNldENvbG9yKGNvbG9yKTtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCwgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFydFNoYXBlKGZvcmNlQmFnUmVmaWxsOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUgPSB0aGlzLnNoYXBlRmFjdG9yeS5uZXh0U2hhcGUoZm9yY2VCYWdSZWZpbGwpO1xyXG4gICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdHJ5R3Jhdml0eSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgY2FuTW92ZURvd24gPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlRG93bigpO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgY2FuTW92ZURvd24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVVwKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBjYW5Nb3ZlRG93bjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVuZGVkIGZvciBjaGVja2luZyBvZiB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgY3VycmVudFxyXG4gICAgICogc2hhcGUgaGFzIGFueSBvdmVybGFwIHdpdGggZXhpc3RpbmcgY2VsbHMgdGhhdCBoYXZlIGNvbG9yLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbGxpc2lvbkRldGVjdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjb2xsaXNpb24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIHRoaXMuY3VycmVudFNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gb2Zmc2V0LnkgKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICAgICAgbGV0IGNvbCA9IG9mZnNldC54ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm93IDwgMCB8fCByb3cgPj0gdGhpcy5tYXRyaXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb2wgPCAwIHx8IGNvbCA+PSB0aGlzLm1hdHJpeFtyb3ddLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXRyaXhbcm93XVtjb2xdLmdldENvbG9yKCkgIT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb2xsaXNpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVGdWxsQm9hcmQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGZ1bGwgPSB0aGlzLmlzQm9hcmRGdWxsKCk7XHJcbiAgICAgICAgaWYgKGZ1bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5QYXVzZWQ7IC8vIFN0YW5kYnkgdW50aWwgc2VxdWVuY2UgaXMgZmluaXNoZWQuXHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgQm9hcmRGaWxsZWRFdmVudCh0aGlzLnBsYXllclR5cGUpKTtcclxuICAgICAgICAgICAgZnVsbCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmdWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSXQgaXMgY29uc2lkZXJlZCBmdWxsIGlmIHRoZSB0d28gb2JzY3VyZWQgcm93cyBhdCB0aGUgdG9wIGhhdmUgY29sb3JlZCBjZWxscyBpbiB0aGVtLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGlzQm9hcmRGdWxsKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IDI7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBmaWxsZWQgbGluZXMgbWV0aG9kIDEgb2YgMiwgYmVmb3JlIGFuaW1hdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBoYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQxKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBmaWxsZWRSb3dJZHhzID0gdGhpcy5kZXRlcm1pbmVGaWxsZWRSb3dJZHhzKCk7XHJcbiAgICAgICAgaWYgKGZpbGxlZFJvd0lkeHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IFJvd3NGaWxsZWRFdmVudChmaWxsZWRSb3dJZHhzLCB0aGlzLnBsYXllclR5cGUpKTtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5QYXVzZWQ7IC8vIFN0YW5kYnkgdW50aWwgYW5pbWF0aW9uIGlzIGZpbmlzaGVkLlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIERvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgaWYgdGhlcmUgYXJlIG5vIGZpbGxlZCBsaW5lcy5cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZpbGxlZFJvd0lkeHMubGVuZ3RoID4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBmaWxsZWQgbGluZXMgbWV0aG9kIDIgb2YgMiwgYWZ0ZXIgYW5pbWF0aW9uLlxyXG4gICAgICogVGhpcyBpcyBwdWJsaWMgc28gdGhhdCB0aGUgTW9kZWwgY2FuIGNhbGwgaXQuXHJcbiAgICAgKi9cclxuICAgIGhhbmRsZUFueUZpbGxlZExpbmVzUGFydDIoKSB7XHJcbiAgICAgICAgLy8gSGF2ZSB0byBjaGVjayB0aGlzIGFnYWluIGJlY2F1c2UgdGhlcmUgaXMgYSBzbGlnaHQgY2hhbmNlIHRoYXQgcm93cyBzaGlmdGVkIGR1cmluZyB0aGUgYW5pbWF0aW9uLlxyXG4gICAgICAgIGxldCBmaWxsZWRSb3dJZHhzID0gdGhpcy5kZXRlcm1pbmVGaWxsZWRSb3dJZHhzKCk7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZmlsbGVkIHJvd3MuXHJcbiAgICAgICAgLy8gSSB0aGluayB0aGlzIG9ubHkgd29ya3MgYmVjYXVzZSBkZXRlcm1pbmVGaWxsZWRSb3dJZHhzKCkgcmV0dXJucyBhbiBhcnJheSBzb3J0ZWQgYXNjZW5kaW5nIGZyb20gMC5cclxuICAgICAgICAvLyBJZiBpdCB3YXNuJ3Qgc29ydGVkIHRoZW4gaXQgY291bGQgZW5kIHVwIHNraXBwaW5nIHJvd3MuXHJcbiAgICAgICAgZm9yIChsZXQgZmlsbGVkUm93SWR4IG9mIGZpbGxlZFJvd0lkeHMpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVBbmRDb2xsYXBzZShmaWxsZWRSb3dJZHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSGF2ZSB0byBzZW5kIGNlbGwgY2hhbmdlIG5vdGlmaWNhdGlvbnMgYmVjYXVzZSByZW1vdmVBbmRDb2xsYXBzZSgpIGRvZXMgbm90LlxyXG4gICAgICAgIHRoaXMubm90aWZ5QWxsQ2VsbHMoKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0aW9uIHdhcyBmaW5pc2hlZCBhbmQgYm9hcmQgd2FzIHVwZGF0ZWQsIHNvIHJlc3VtZSBwbGF5LlxyXG4gICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuSW5QbGF5O1xyXG4gICAgICAgIHRoaXMuc3RhcnRTaGFwZShmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIG9ubHkgdGhlIGJvdHRvbSByb3cuXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUJvdHRvbUxpbmUoKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVBbmRDb2xsYXBzZShNQVhfUk9XUyAtIDEpO1xyXG5cclxuICAgICAgICAvLyBIYXZlIHRvIHNlbmQgY2VsbCBjaGFuZ2Ugbm90aWZpY2F0aW9ucyBiZWNhdXNlIHJlbW92ZUFuZENvbGxhcHNlKCkgZG9lcyBub3QuXHJcbiAgICAgICAgdGhpcy5ub3RpZnlBbGxDZWxscygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbm90aWZ5QWxsQ2VsbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgTUFYX1JPV1M7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCwgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBudW1iZXJzLCBhc2NlbmRpbmcsIHRoYXQgY29ycmVzcG9uZCB0byBmaWxsZWQgcm93cy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkZXRlcm1pbmVGaWxsZWRSb3dJZHhzKCk6IG51bWJlcltdIHtcclxuICAgICAgICBsZXQgZmlsbGVkUm93SWR4czogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBsZXQgZmlsbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2VsbCBvZiByb3cpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjZWxsLmdldENvbG9yKCkgPT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZpbGxlZCkge1xyXG4gICAgICAgICAgICAgICAgZmlsbGVkUm93SWR4cy5wdXNoKHJvd0lkeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZpbGxlZFJvd0lkeHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIHJlbW92ZXMgdGhlIG9sZCByb3cgYW5kIHB1dHMgYSBuZXcgcm93IGluIGl0cyBwbGFjZSBhdCBwb3NpdGlvbiAwLCB3aGljaCBpcyB0aGUgaGlnaGVzdCB2aXN1YWxseSB0byB0aGUgcGxheWVyLlxyXG4gICAgICogRGVsZWdhdGVzIGNlbGwgbm90aWZpY2F0aW9uIHRvIHRoZSBjYWxsaW5nIG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByZW1vdmVBbmRDb2xsYXBzZShyb3dJZHg6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubWF0cml4LnNwbGljZShyb3dJZHgsIDEpO1xyXG4gICAgICAgIHRoaXMubWF0cml4LnNwbGljZSgwLCAwLCBbXSk7XHJcbiAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4WzBdW2NvbElkeF0gPSBuZXcgQ2VsbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChzdGFydGluZz1mYWxzZSkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQodGhpcy5jdXJyZW50U2hhcGUsIHRoaXMucGxheWVyVHlwZSwgc3RhcnRpbmcpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRKdW5rUm93Q29sb3IoKTogQ29sb3Ige1xyXG4gICAgICAgIGxldCBjb2xvcjogQ29sb3I7XHJcbiAgICAgICAgaWYgKHRoaXMuanVua1Jvd0NvbG9ySWR4IDw9IDApIHtcclxuICAgICAgICAgICAgY29sb3IgPSB0aGlzLmp1bmtSb3dDb2xvcjE7XHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0NvbG9ySWR4ID0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuanVua1Jvd0NvbG9ySWR4ID49IDEpIHtcclxuICAgICAgICAgICAgY29sb3IgPSB0aGlzLmp1bmtSb3dDb2xvcjI7XHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0NvbG9ySWR4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UmFuZG9tQ29sb3JzKCk6IFtDb2xvciwgQ29sb3JdIHtcclxuXHJcbiAgICAgICAgLy8gU2VsZWN0IHR3byBjb2xvcnMgdGhhdCBhcmUgbm90IGVxdWFsIHRvIGVhY2ggb3RoZXIuXHJcbiAgICAgICAgbGV0IHJhbmQxID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNyk7XHJcbiAgICAgICAgbGV0IHJhbmQyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNyk7XHJcbiAgICAgICAgaWYgKHJhbmQxID09PSByYW5kMikge1xyXG4gICAgICAgICAgICByYW5kMisrO1xyXG4gICAgICAgICAgICBpZiAocmFuZDIgPiA2KSB7XHJcbiAgICAgICAgICAgICAgICByYW5kMiA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLmNvbG9yQnlOdW1iZXIocmFuZDEpLCB0aGlzLmNvbG9yQnlOdW1iZXIocmFuZDIpXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjb2xvckJ5TnVtYmVyKHZhbHVlOiBudW1iZXIpOiBDb2xvciB7XHJcbiAgICAgICAgbGV0IGNvbG9yOiBDb2xvcjtcclxuICAgICAgICBzd2l0Y2godmFsdWUpIHtcclxuICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5DeWFuO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuWWVsbG93O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuUHVycGxlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuR3JlZW47XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5SZWQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5CbHVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuT3JhbmdlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLldoaXRlOyAvLyBTaG91bGRuJ3QgZ2V0IGhlcmVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUV0VFTjogYW55O1xyXG5cclxuY29uc3QgRkFMTF9USU1FX01TID0gMTc1MDtcclxuXHJcbmludGVyZmFjZSBGYWxsaW5nQm9hcmQge1xyXG4gICAgY2FsY3VsYXRlSGlnaGVzdENvbHVtbigpOiBudW1iZXI7XHJcbiAgICByZW1vdmVCb3R0b21MaW5lKCk6IHZvaWQ7XHJcbiAgICByZXNldEFuZFBsYXkoKTogdm9pZFxyXG59XHJcblxyXG5jbGFzcyBGYWxsR3VpZGUge1xyXG4gICAgbGFzdEhlaWdodDogbnVtYmVyO1xyXG4gICAgdHdlZW5lZEhlaWdodDogbnVtYmVyO1xyXG4gICAgZWxhcHNlZDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRmFsbGluZ1NlcXVlbmNlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBib2FyZDogRmFsbGluZ0JvYXJkO1xyXG4gICAgcHJpdmF0ZSBmYWxsVHdlZW46IGFueTtcclxuICAgIHByaXZhdGUgZmFsbFR3ZWVuRWxhcHNlZDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBmYWxsR3VpZGU6IEZhbGxHdWlkZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihib2FyZDogRmFsbGluZ0JvYXJkKSB7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IGJvYXJkO1xyXG4gICAgICAgIHRoaXMuZmFsbFR3ZWVuID0gbnVsbDtcclxuICAgICAgICB0aGlzLmZhbGxHdWlkZSA9IG5ldyBGYWxsR3VpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXNldEFuZFBsYXkoY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLmZhbGxHdWlkZS5sYXN0SGVpZ2h0ID0gdGhpcy5mYWxsR3VpZGUudHdlZW5lZEhlaWdodCA9IHRoaXMuYm9hcmQuY2FsY3VsYXRlSGlnaGVzdENvbHVtbigpO1xyXG4gICAgICAgIHRoaXMuZmFsbEd1aWRlLmVsYXBzZWQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmZhbGxUd2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmZhbGxHdWlkZSlcclxuICAgICAgICAgICAgLnRvKHt0d2VlbmVkSGVpZ2h0OiAwfSwgRkFMTF9USU1FX01TKVxyXG4gICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZSkgLy8gU3VycHJpc2luZ2x5LCBsaW5lYXIgaXMgdGhlIG9uZSB0aGF0IGxvb2tzIG1vc3QgXCJyaWdodFwiLlxyXG4gICAgICAgICAgICAub25Db21wbGV0ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZhbGxUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnJlc2V0QW5kUGxheSgpO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMuZmFsbEd1aWRlLmVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRG9pbmcgdGhpcyBpbiB0d28gcGFydHMgYmVjYXVzZSBvbkNvbXBsZXRlKCkgY2FuIHNldCB0aGUgdHdlZW4gdG8gbnVsbC5cclxuICAgICAqL1xyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5mYWxsVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmZhbGxHdWlkZS5lbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuZmFsbFR3ZWVuLnVwZGF0ZSh0aGlzLmZhbGxHdWlkZS5lbGFwc2VkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmZhbGxUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCBuZXdIZWlnaHQgPSBNYXRoLmNlaWwodGhpcy5mYWxsR3VpZGUudHdlZW5lZEhlaWdodCk7XHJcbiAgICAgICAgICAgIGlmICAodGhpcy5mYWxsR3VpZGUubGFzdEhlaWdodCA+IG5ld0hlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZmYgPSB0aGlzLmZhbGxHdWlkZS5sYXN0SGVpZ2h0IC0gbmV3SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgZGlmZjsgaWR4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnJlbW92ZUJvdHRvbUxpbmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZmFsbEd1aWRlLmxhc3RIZWlnaHQgPSBuZXdIZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge1NoYXBlfSBmcm9tICcuL3NoYXBlJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuXHJcbmNsYXNzIFNoYXBlSSBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuQ3lhbjtcclxuICAgIHZhbHVlc1BlclJvdyA9IDQ7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gdHJ1ZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZUkge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVJKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlSiBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuQmx1ZTtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gdHJ1ZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF07XHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVKIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlSigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZUwgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLk9yYW5nZTtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gdHJ1ZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMSxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDEsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZUwge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVMKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlTyBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuWWVsbG93O1xyXG4gICAgdmFsdWVzUGVyUm93ID0gNDtcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSBmYWxzZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZU8ge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVPKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlUyBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuR3JlZW47XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IGZhbHNlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMSwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlUyB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVMoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVUIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5QdXJwbGU7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IHRydWU7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVUIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlVCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZVogZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLlJlZDtcclxuICAgIHZhbHVlc1BlclJvdyA9IDM7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gZmFsc2U7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVaIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlWigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2hhcGVGYWN0b3J5IHtcclxuICAgIHByaXZhdGUgYmFnOiBTaGFwZVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMucmVmaWxsQmFnKHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIG5leHRTaGFwZShmb3JjZUJhZ1JlZmlsbDogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0aGlzLmJhZy5sZW5ndGggPD0gMCB8fCBmb3JjZUJhZ1JlZmlsbCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlZmlsbEJhZyhmb3JjZUJhZ1JlZmlsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmJhZy5wb3AoKTsgLy8gR2V0IGZyb20gZW5kIG9mIGFycmF5LlxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVmaWxsQmFnKHN0YXJ0aW5nUGllY2VBc0ZpcnN0OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5iYWcgPSBbXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZUkoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlSigpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVMKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZVQoKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlTygpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVTKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZVooKVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gRmlzaGVyLVlhdGVzIFNodWZmbGUsIGJhc2VkIG9uOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNDUwOTc2XHJcbiAgICAgICAgICAgIGxldCBpZHggPSB0aGlzLmJhZy5sZW5ndGhcclxuICAgICAgICAgICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cclxuICAgICAgICAgICAgd2hpbGUgKDAgIT09IGlkeCkge1xyXG4gICAgICAgICAgICAgICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXHJcbiAgICAgICAgICAgICAgICBsZXQgcm5kSWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaWR4KTtcclxuICAgICAgICAgICAgICAgIGlkeCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxyXG4gICAgICAgICAgICAgICAgbGV0IHRlbXBWYWwgPSB0aGlzLmJhZ1tpZHhdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWdbaWR4XSA9IHRoaXMuYmFnW3JuZElkeF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhZ1tybmRJZHhdID0gdGVtcFZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gT25seSBjZXJ0YWluIHNoYXBlcyBjYW4gYmUgZHJvcHBlZCBvbnRvIHdoYXQgY291bGQgYmUgYSBibGFuayBvciBhbG1vc3QtYmxhbmsgZ3JpZC5cclxuICAgICAgICBpZiAoc3RhcnRpbmdQaWVjZUFzRmlyc3QgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgbGV0IGxhc3RJZHggPSB0aGlzLmJhZy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iYWdbbGFzdElkeF0uc3RhcnRpbmdFbGlnaWJsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gRG8gbm90IG5lZWQgdG8gZG8gYW55dGhpbmcuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBsYXN0SWR4OyBpZHgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmJhZ1tpZHhdLnN0YXJ0aW5nRWxpZ2libGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBWYWwgPSB0aGlzLmJhZ1tsYXN0SWR4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWdbbGFzdElkeF0gPSB0aGlzLmJhZ1tpZHhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhZ1tpZHhdID0gdGVtcFZhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBkZWFkU2hhcGVGYWN0b3J5ID0gbmV3IFNoYXBlRmFjdG9yeSgpOyAvLyBVc2VkIGJ5IEFJLiIsImltcG9ydCB7Q2VsbE9mZnNldH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5cclxuY29uc3QgU1BBV05fQ09MID0gMzsgLy8gTGVmdCBzaWRlIG9mIG1hdHJpeCBzaG91bGQgY29ycmVzcG9uZCB0byB0aGlzLlxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNoYXBlIHtcclxuICAgIGFic3RyYWN0IHJlYWRvbmx5IGNvbG9yOiBDb2xvcjtcclxuICAgIGFic3RyYWN0IHJlYWRvbmx5IHZhbHVlc1BlclJvdzogbnVtYmVyO1xyXG4gICAgYWJzdHJhY3QgcmVhZG9ubHkgc3RhcnRpbmdFbGlnaWJsZTogYm9vbGVhbjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgbWF0cmljZXM6IFJlYWRvbmx5QXJyYXk8UmVhZG9ubHlBcnJheTxudW1iZXI+PjtcclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRJbnN0YW5jZSgpOiBTaGFwZTtcclxuXHJcbiAgICBwcml2YXRlIGN1cnJlbnRNYXRyaXhJbmRleDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByb3c6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY29sOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggPSAwOyAvLyBUT0RPOiBFbnN1cmUgcG9zaXRpb24gMCBpcyB0aGUgc3Bhd24gcG9zaXRpb25cclxuICAgICAgICB0aGlzLnJvdyA9IDA7XHJcbiAgICAgICAgdGhpcy5jb2wgPSBTUEFXTl9DT0w7XHJcbiAgICAgICAgdGhpcy5zdGFydGluZ0VsaWdpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUxlZnQoKSB7XHJcbiAgICAgICAgdGhpcy5jb2wtLTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlUmlnaHQoKSB7XHJcbiAgICAgICAgdGhpcy5jb2wrKztcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVXAoKSB7XHJcbiAgICAgICAgdGhpcy5yb3ctLTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICB0aGlzLnJvdysrO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIG1vdmVUb1RvcCgpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQ291bnRlckNsb2Nrd2lzZSgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCAtPSAxO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQXJyYXlCb3VuZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVDbG9ja3dpc2UoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggKz0gMTtcclxuICAgICAgICB0aGlzLmVuc3VyZUFycmF5Qm91bmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um93KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvdztcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2woKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvd0NvdW50KCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy5nZXRDdXJyZW50TWF0cml4KCkubGVuZ3RoIC8gdGhpcy52YWx1ZXNQZXJSb3cpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE9mZnNldHMoKTogQ2VsbE9mZnNldFtdIHtcclxuICAgICAgICBsZXQgbWF0cml4ID0gdGhpcy5nZXRDdXJyZW50TWF0cml4KCk7XHJcbiAgICAgICAgbGV0IG9mZnNldHM6IENlbGxPZmZzZXRbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IG1hdHJpeC5sZW5ndGg7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG1hdHJpeFtpZHhdO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gaWR4ICUgdGhpcy52YWx1ZXNQZXJSb3c7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IE1hdGguZmxvb3IoaWR4IC8gdGhpcy52YWx1ZXNQZXJSb3cpO1xyXG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IG5ldyBDZWxsT2Zmc2V0KHgsIHkpO1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0cy5wdXNoKG9mZnNldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9mZnNldHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYWNreSBtZXRob2QgdXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKiBcIlNpbXBsZVwiIGFzIGluIGRvZXNuJ3QgbWF0dGVyIHdoYXQgdGhlIGN1cnJlbnQgcm93L2NvbC9tYXRyaXggaXMuXHJcbiAgICAgKi9cclxuICAgIGNsb25lU2ltcGxlKCk6IFNoYXBlIHtcclxuICAgICAgICAvLyBHZXQgYW4gaW5zdGFuY2Ugb2YgdGhlIGNvbmNyZXRlIGNsYXNzLiBSZXN0IG9mIHZhbHVlcyBhcmUgaXJyZWxldmFudC5cclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRJbnN0YW5jZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q3VycmVudE1hdHJpeCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXRyaWNlc1t0aGlzLmN1cnJlbnRNYXRyaXhJbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbnN1cmVBcnJheUJvdW5kcygpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50TWF0cml4SW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID0gdGhpcy5tYXRyaWNlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50TWF0cml4SW5kZXggPj0gdGhpcy5tYXRyaWNlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7Qm9hcmR9IGZyb20gJy4vYm9hcmQvYm9hcmQnO1xyXG5pbXBvcnQge0FpfSBmcm9tICcuL2FpL2FpJztcclxuaW1wb3J0IHtucGNNYW5hZ2VyfSBmcm9tICcuL25wYy9ucGMtbWFuYWdlcic7XHJcbmltcG9ydCB7ZXZlbnRCdXMsIEV2ZW50VHlwZX0gZnJvbSAnLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuaW1wb3J0IHtQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4uL2RvbWFpbi9jb25zdGFudHMnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50RXZlbnR9IGZyb20gJy4uL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtSb3dzRmlsbGVkRXZlbnR9IGZyb20gJy4uL2V2ZW50L3Jvd3MtZmlsbGVkLWV2ZW50JztcclxuaW1wb3J0IHtSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcm93cy1jbGVhci1hbmltYXRpb24tY29tcGxldGVkLWV2ZW50JztcclxuaW1wb3J0IHtCb2FyZEZpbGxlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9ib2FyZC1maWxsZWQtZXZlbnQnO1xyXG5pbXBvcnQge0hwQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9ocC1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtTaGFwZUZhY3Rvcnl9IGZyb20gJy4vYm9hcmQvc2hhcGUtZmFjdG9yeSc7XHJcbmltcG9ydCB7RmFsbGluZ1NlcXVlbmNlcn0gZnJvbSAnLi9ib2FyZC9mYWxsaW5nLXNlcXVlbmNlcic7XHJcbmltcG9ydCB7RmFsbGluZ1NlcXVlbmNlckV2ZW50fSBmcm9tICcuLi9ldmVudC9mYWxsaW5nLXNlcXVlbmNlci1ldmVudCc7XHJcblxyXG5jb25zdCBNQVhfSFAgPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7IC8vIEhQIGNvcnJlc3BvbmRzIHRvIHRoZSBudW1iZXIgb2YgbG9uZyB3aW5kb3dzIG9uIHRoZSBzZWNvbmQgZmxvb3Igb2YgdGhlIHBoeXNpY2FsIGJ1aWxkaW5nLlxyXG5cclxuY2xhc3MgTW9kZWwge1xyXG4gICAgcHJpdmF0ZSBodW1hbkJvYXJkOiBCb2FyZDtcclxuICAgIHByaXZhdGUgaHVtYW5GYWxsaW5nU2VxdWVuY2VyOiBGYWxsaW5nU2VxdWVuY2VyO1xyXG4gICAgcHJpdmF0ZSBodW1hbkhpdFBvaW50czogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgYWlCb2FyZDogQm9hcmQ7XHJcbiAgICBwcml2YXRlIGFpRmFsbGluZ1NlcXVlbmNlcjogRmFsbGluZ1NlcXVlbmNlcjtcclxuICAgIHByaXZhdGUgYWlIaXRQb2ludHM6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGFpOiBBaTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBsZXQgaHVtYW5TaGFwZUZhY3RvcnkgPSBuZXcgU2hhcGVGYWN0b3J5KCk7XHJcbiAgICAgICAgdGhpcy5odW1hbkJvYXJkID0gbmV3IEJvYXJkKFBsYXllclR5cGUuSHVtYW4sIGh1bWFuU2hhcGVGYWN0b3J5LCBldmVudEJ1cyk7XHJcbiAgICAgICAgdGhpcy5odW1hbkZhbGxpbmdTZXF1ZW5jZXIgPSBuZXcgRmFsbGluZ1NlcXVlbmNlcih0aGlzLmh1bWFuQm9hcmQpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5IaXRQb2ludHMgPSBNQVhfSFA7XHJcblxyXG4gICAgICAgIGxldCBhaVNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTtcclxuICAgICAgICB0aGlzLmFpQm9hcmQgPSBuZXcgQm9hcmQoUGxheWVyVHlwZS5BaSwgYWlTaGFwZUZhY3RvcnksIGV2ZW50QnVzKTtcclxuICAgICAgICB0aGlzLmFpRmFsbGluZ1NlcXVlbmNlciA9IG5ldyBGYWxsaW5nU2VxdWVuY2VyKHRoaXMuYWlCb2FyZCk7XHJcbiAgICAgICAgdGhpcy5haUhpdFBvaW50cyA9IE1BWF9IUDtcclxuXHJcbiAgICAgICAgdGhpcy5haSA9IG5ldyBBaSh0aGlzLmFpQm9hcmQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5QbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZSwgKGV2ZW50OiBQbGF5ZXJNb3ZlbWVudEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUGxheWVyTW92ZW1lbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuUm93c0ZpbGxlZEV2ZW50VHlwZSwgKGV2ZW50OiBSb3dzRmlsbGVkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVSb3dzRmlsbGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnRUeXBlLCAoZXZlbnQ6IFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUm93Q2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5Cb2FyZEZpbGxlZEV2ZW50VHlwZSwgKGV2ZW50OiBCb2FyZEZpbGxlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQm9hcmRGaWxsZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGUsIChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5haS5zdGFydCgpO1xyXG4gICAgICAgIG5wY01hbmFnZXIuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogSW5zdGVhZCBvZiBoZXJlLCBzdGFydCBnYW1lIHdoZW4gcGxheWVyIGhpdHMgYSBrZXkgZmlyc3QuXHJcbiAgICAgICAgdGhpcy5odW1hbkJvYXJkLnJlc2V0QW5kUGxheSgpO1xyXG4gICAgICAgIHRoaXMuYWlCb2FyZC5yZXNldEFuZFBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuaHVtYW5Cb2FyZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5GYWxsaW5nU2VxdWVuY2VyLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWlCb2FyZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuYWlGYWxsaW5nU2VxdWVuY2VyLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWkuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgbnBjTWFuYWdlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlUGxheWVyTW92ZW1lbnQoZXZlbnQ6IFBsYXllck1vdmVtZW50RXZlbnQpIHtcclxuICAgICAgICBsZXQgYm9hcmQgPSB0aGlzLmRldGVybWluZUJvYXJkRm9yKGV2ZW50LnBsYXllclR5cGUpO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKGV2ZW50Lm1vdmVtZW50KSB7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuTGVmdDpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZUxlZnQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlUmlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LkRvd246XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVEb3duKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Ecm9wOlxyXG4gICAgICAgICAgICAgICAgaWYgKGJvYXJkLm1vdmVTaGFwZURvd25BbGxUaGVXYXkoKSkgeyAgICAgICAvLyBDaGVjayB0aGF0IHdlIGFyZSBpbiBhIHBvc2l0aW9uIHRvIG1vdmUgdGhlIHNoYXBlIGRvd24gYmVmb3JlIGV4ZWN1dGluZyB0aGUgbmV4dCBsaW5lLiBcclxuICAgICAgICAgICAgICAgICAgICBib2FyZC5oYW5kbGVFbmRPZkN1cnJlbnRQaWVjZVRhc2tzKCk7ICAgLy8gUHJldmVudHMgYW55IG90aGVyIGtleXN0cm9rZXMgYWZmZWN0aW5nIHRoZSBzaGFwZSBhZnRlciBpdCBoaXRzIHRoZSBib3R0b20uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Sb3RhdGVDbG9ja3dpc2U6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5yb3RhdGVTaGFwZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5oYW5kbGVkIG1vdmVtZW50Jyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2ZlciB0aGUgZmlsbGVkIHJvd3MgdG8gYmUganVuayByb3dzIG9uIHRoZSBvcHBvc2l0ZSBwbGF5ZXIncyBib2FyZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBoYW5kbGVSb3dzRmlsbGVkRXZlbnQoZXZlbnQ6IFJvd3NGaWxsZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBib2FyZCA9IHRoaXMuZGV0ZXJtaW5lQm9hcmRGb3JPcHBvc2l0ZU9mKGV2ZW50LnBsYXllclR5cGUpO1xyXG4gICAgICAgIGJvYXJkLmFkZEp1bmtSb3dzKGV2ZW50LmZpbGxlZFJvd0lkeHMubGVuZ3RoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVJvd0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQoZXZlbnQ6IFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGJvYXJkID0gdGhpcy5kZXRlcm1pbmVCb2FyZEZvcihldmVudC5wbGF5ZXJUeXBlKTtcclxuICAgICAgICBib2FyZC5oYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBodW1hbidzIGJvYXJkIGlmIGdpdmVuIHRoZSBodW1hbidzIHR5cGUsIG9yIEFJJ3MgYm9hcmQgaWYgZ2l2ZW4gdGhlIEFJLiBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkZXRlcm1pbmVCb2FyZEZvcihwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKTogQm9hcmQge1xyXG4gICAgICAgIGlmIChwbGF5ZXJUeXBlID09PSBQbGF5ZXJUeXBlLkh1bWFuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmh1bWFuQm9hcmQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWlCb2FyZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGlzIG1ldGhvZCBpcyBnaXZlbiBcIkh1bWFuXCIsIGl0IHdpbGwgcmV0dXJuIHRoZSBBSSdzIGJvYXJkLCBhbmQgdmljZSB2ZXJzYS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkZXRlcm1pbmVCb2FyZEZvck9wcG9zaXRlT2YocGxheWVyVHlwZTogUGxheWVyVHlwZSk6IEJvYXJkIHtcclxuICAgICAgICBpZiAocGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5haUJvYXJkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmh1bWFuQm9hcmQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQm9hcmRGaWxsZWRFdmVudChldmVudDogQm9hcmRGaWxsZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBib2FyZDogQm9hcmQ7XHJcbiAgICAgICAgbGV0IGZhbGxpbmdTZXF1ZW5jZXI6IEZhbGxpbmdTZXF1ZW5jZXI7XHJcbiAgICAgICAgbGV0IGhwOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGlmIChldmVudC5wbGF5ZXJUeXBlID09PSBQbGF5ZXJUeXBlLkh1bWFuKSB7XHJcbiAgICAgICAgICAgIGJvYXJkID0gdGhpcy5odW1hbkJvYXJkO1xyXG4gICAgICAgICAgICBmYWxsaW5nU2VxdWVuY2VyID0gdGhpcy5odW1hbkZhbGxpbmdTZXF1ZW5jZXI7XHJcbiAgICAgICAgICAgIGhwID0gKHRoaXMuaHVtYW5IaXRQb2ludHMgLT0gMSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYm9hcmQgPSB0aGlzLmFpQm9hcmQ7XHJcbiAgICAgICAgICAgIGZhbGxpbmdTZXF1ZW5jZXIgPSB0aGlzLmFpRmFsbGluZ1NlcXVlbmNlcjtcclxuICAgICAgICAgICAgaHAgPSAodGhpcy5haUhpdFBvaW50cyAtPSAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEhwQ2hhbmdlZEV2ZW50KGhwLCBldmVudC5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgLy8gVE9ETzogU2VlIGlmIG9uZSBvZiB0aGUgcGxheWVycyBoYXMgcnVuIG91dCBvZiBIUCwgc29tZXdoZXJlIGlmIG5vdCBoZXJlLlxyXG5cclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBGYWxsaW5nU2VxdWVuY2VyRXZlbnQoZXZlbnQucGxheWVyVHlwZSkpO1xyXG4gICAgICAgIGZhbGxpbmdTZXF1ZW5jZXIucmVzZXRBbmRQbGF5KCgpID0+IHtcclxuICAgICAgICAgICAgLy8gVE9ETzogSSBkb24ndCBrbm93LCBtYXliZSBub3RoaW5nLlxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LnN0YXJ0aW5nID09PSB0cnVlICYmIGV2ZW50LnBsYXllclR5cGUgPT09IFBsYXllclR5cGUuQWkpIHtcclxuICAgICAgICAgICAgdGhpcy5haS5zdHJhdGVnaXplKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gTm90aGluZyBjdXJyZW50bHkgZm9yIHRoZSBodW1hbidzIGJvYXJkIHRvIGJlIGRvaW5nIGF0IHRoaXMgdGltZS5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IG1vZGVsID0gbmV3IE1vZGVsKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuaW1wb3J0IHtOcGN9IGZyb20gJy4vbnBjJ1xyXG5pbXBvcnQge05wY1N0YXRlfSBmcm9tICcuLi8uLi9kb21haW4vbnBjLXN0YXRlJztcclxuaW1wb3J0IHtldmVudEJ1cywgRXZlbnRUeXBlfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1N0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY1BsYWNlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtcGxhY2VkLWV2ZW50JztcclxuXHJcbi8vIFN0YXJ0aW5nIHBvc2l0aW9uIGNvdW50cyB1c2VkIGluIGluaXRpYWxpemF0aW9uLlxyXG5jb25zdCBUT1RBTF9OUENTID0gMjA7XHJcblxyXG5jbGFzcyBOcGNNYW5hZ2VyIHtcclxuXHJcbiAgICBwcml2YXRlIG5wY3M6IE1hcDxudW1iZXIsIE5wYz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ucGNzID0gbmV3IE1hcDxudW1iZXIsIE5wYz4oKTtcclxuICAgICAgICBmb3IgKGxldCBucGNJZHggPSAwOyBucGNJZHggPCBUT1RBTF9OUENTOyBucGNJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgbnBjID0gbmV3IE5wYygpO1xyXG4gICAgICAgICAgICB0aGlzLm5wY3Muc2V0KG5wYy5pZCwgbnBjKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnRUeXBlLCAoZXZlbnQ6IFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5ucGNzLmZvckVhY2goKG5wYzogTnBjKSA9PiB7XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gKE1hdGgucmFuZG9tKCkgKiA3KTtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gKE1hdGgucmFuZG9tKCkgKiAxNSk7XHJcbiAgICAgICAgICAgICAgICBucGMuc3RhcnQoeCwgeSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IE1vdmUgdGhpcyBlbHNld2hlcmU6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gKE1hdGgucmFuZG9tKCkgKiA3KTtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gKE1hdGgucmFuZG9tKCkgKiAxNSk7XHJcbiAgICAgICAgICAgICAgICBucGMuYmVnaW5XYWxraW5nVG8oeCwgeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubnBjcy5mb3JFYWNoKChucGM6IE5wYykgPT4ge1xyXG4gICAgICAgICAgICBucGMuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoZXZlbnQ6IFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgbnBjID0gdGhpcy5ucGNzLmdldChldmVudC5ucGNJZCk7XHJcbiAgICAgICAgaWYgKG5wYyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gZXZlbnQuejtcclxuICAgICAgICAgICAgICAgIG5wYy51cGRhdGVQb3NpdGlvbih4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSAoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSAoTWF0aC5yYW5kb20oKSAqIDE1KTtcclxuICAgICAgICAgICAgICAgIG5wYy5iZWdpbldhbGtpbmdUbyh4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgbnBjTWFuYWdlciA9IG5ldyBOcGNNYW5hZ2VyKCk7IiwiaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge05wY1BsYWNlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtcGxhY2VkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNNb3ZlbWVudENoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLW1vdmVtZW50LWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY1N0YXRlfSBmcm9tICcuLi8uLi9kb21haW4vbnBjLXN0YXRlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGMge1xyXG4gICAgcmVhZG9ubHkgaWQ6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRlOiBOcGNTdGF0ZTtcclxuICAgIHByaXZhdGUgdGltZUluU3RhdGU6IG51bWJlcjtcclxuXHJcbiAgICAvLyBcIkxhc3RcIiBhcyBpbiB0aGUgbGFzdCBrbm93biBjb29yZGluYXRlLCBiZWNhdXNlIGl0IGNvdWxkIGJlIGN1cnJlbnRseSBpbi1tb3Rpb24uXHJcbiAgICBwcml2YXRlIHhsYXN0OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHlsYXN0OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IE5wY1N0YXRlLklkbGU7XHJcbiAgICAgICAgdGhpcy50aW1lSW5TdGF0ZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMueGxhc3QgPSAwO1xyXG4gICAgICAgIHRoaXMueWxhc3QgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy54bGFzdCA9IHg7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9IHk7XHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgTnBjUGxhY2VkRXZlbnQodGhpcy5pZCwgdGhpcy5zdGF0ZSwgeCwgeSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIGJ5IHRoZSBOUEMgbWFuYWdlciByYXRoZXIgdGhhbiB0cmFja3MgdGhhdCByZWZlcmVuY2UgdGhlbS5cclxuICAgICAqL1xyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnRpbWVJblN0YXRlICs9IGVsYXBzZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgdHJhbnNpdGlvblRvKHN0YXRlOiBOcGNTdGF0ZSkge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLnRpbWVJblN0YXRlID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBiZWdpbldhbGtpbmdUbyh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KHRoaXMuaWQsIHgsIHkpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNpZ25pZmllcyB0aGUgZW5kIG9mIGEgd2Fsay5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlUG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnhsYXN0ID0geDtcclxuICAgICAgICB0aGlzLnlsYXN0ID0geTtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25UbyhOcGNTdGF0ZS5JZGxlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRTdGF0ZSgpOiBOcGNTdGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge3N0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZX0gZnJvbSAnLi92aWV3L3N0YW5kZWUvc3RhbmRlZS1hbmltYXRpb24tdGV4dHVyZS1iYXNlJztcclxuaW1wb3J0IHtidWlsZGluZ1ByZWxvYWRlcn0gZnJvbSAnLi92aWV3L2xpZ2h0aW5nL2J1aWxkaW5nLXByZWxvYWRlcic7XHJcbmltcG9ydCB7c291bmRMb2FkZXJ9IGZyb20gJy4vc291bmQvc291bmQtbG9hZGVyJztcclxuXHJcbi8vIDEpIFN0YW5kZWUgVGV4dHVyZXNcclxuLy8gMikgQnVpbGRpbmdcclxuLy8gMykgU291bmRcclxuY29uc3QgVE9UQUxfVE9fUFJFTE9BRCA9IDM7XHJcblxyXG5jbGFzcyBQcmVsb2FkZXIge1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGNhbGxiYWNrOiAoKSA9PiB2b2lkO1xyXG4gICAgcHJpdmF0ZSBjb3VudDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY291bnQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcblxyXG4gICAgICAgIHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZS5wcmVsb2FkKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja0lmRmluaXNoZWQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYnVpbGRpbmdQcmVsb2FkZXIucHJlbG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tJZkZpbmlzaGVkKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNvdW5kTG9hZGVyLnByZWxvYWQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrSWZGaW5pc2hlZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tJZkZpbmlzaGVkKCkge1xyXG4gICAgICAgIHRoaXMuY291bnQrKztcclxuICAgICAgICBjb25zb2xlLmxvZygnUHJlbG9hZGVkICcgKyB0aGlzLmNvdW50ICsgJyBvZiAnICsgVE9UQUxfVE9fUFJFTE9BRCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvdW50ID49IFRPVEFMX1RPX1BSRUxPQUQpIHtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgcHJlbG9hZGVyID0gbmV3IFByZWxvYWRlcigpOyIsImRlY2xhcmUgY29uc3QgSG93bDogYW55O1xyXG5cclxuaW1wb3J0IHtzb3VuZE1hbmFnZXJ9IGZyb20gJy4vc291bmQtbWFuYWdlcic7XHJcblxyXG4vLyAxKSBBbWJpZW5jZSAtIE5pZ2h0XHJcbi8vIDIpIE11c2ljIC0gT3BlbmluZ1xyXG5jb25zdCBUT1RBTF9UT19QUkVMT0FEID0gMjtcclxuXHJcbmNsYXNzIFNvdW5kTG9hZGVyIHtcclxuXHJcbiAgICBwcmVsb2FkQ29tcGxldGVDYWxsYmFjazogKCkgPT4gdm9pZDtcclxuICAgIHByZWxvYWRDb3VudDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMucHJlbG9hZENvbXBsZXRlQ2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMucHJlbG9hZENvdW50ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcmVsb2FkKHByZWxvYWRDb21wbGV0ZUNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5wcmVsb2FkQ29tcGxldGVDYWxsYmFjayA9IHByZWxvYWRDb21wbGV0ZUNhbGxiYWNrO1xyXG5cclxuICAgICAgICBsZXQgYW1iaWVuY2VOaWdodCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOiBbJ2FtYmllbmNlLW5pZ2h0Lm00YSddLFxyXG4gICAgICAgICAgICBhdXRvcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgbG9vcDogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFtYmllbmNlTmlnaHQub25jZSgnbG9hZCcsICgpID0+IHRoaXMucHJlbG9hZENoZWNrSWZGaW5pc2hlZCgpKTtcclxuXHJcbiAgICAgICAgbGV0IG11c2ljT3BlbmluZyA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOiBbJ211c2ljLW9wZW5pbmcubTRhJ10sXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICBsb29wOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbXVzaWNPcGVuaW5nLm9uY2UoJ2xvYWQnLCAoKSA9PiB0aGlzLnByZWxvYWRDaGVja0lmRmluaXNoZWQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwcmVsb2FkQ2hlY2tJZkZpbmlzaGVkKCkge1xyXG4gICAgICAgIHRoaXMucHJlbG9hZENvdW50Kys7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnByZWxvYWRDb3VudCA+PSBUT1RBTF9UT19QUkVMT0FEKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJlbG9hZENvbXBsZXRlQ2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHNvdW5kTG9hZGVyID0gbmV3IFNvdW5kTG9hZGVyKCk7IiwiZGVjbGFyZSBjb25zdCBIb3dsZXI6IGFueTtcclxuXHJcbmNvbnN0IFNPVU5EX0tFWSA9ICcxMjkwODMxOTAtZmFsbGluZy1zb3VuZCc7XHJcblxyXG5jbGFzcyBTb3VuZE1hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgc291bmRUb2dnbGVFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuc291bmRUb2dnbGVFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb3VuZC10b2dnbGUnKTtcclxuICAgICAgICB0aGlzLnNvdW5kVG9nZ2xlRWxlbWVudC5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNvdW5kU2V0dGluZyghdGhpcy5zb3VuZFRvZ2dsZUVsZW1lbnQuY2hlY2tlZCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3VsZCBvY2N1ciBiZWZvcmUgcHJlbG9hZGluZyBzbyB0aGUgcGxheWVyIHNlZXMgdGhlIHJpZ2h0IG9wdGlvbiBpbW1lZGlhdGVseS5cclxuICAgICAqL1xyXG4gICAgYXR0YWNoKCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU291bmRTZXR0aW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRG9uZSBvZmYgdGhlIG1haW4gZXhlY3V0aW9uIHBhdGggaW4gY2FzZSB0aGUgdXNlciBoYXMgY2xpZW50LXNpZGUgc3RvcmFnZSB0dXJuZWQgb2ZmLFxyXG4gICAgICogdG8gcHJldmVudCBhbnkgc29ydCBvZiBuYXRpdmUgZXhjZXB0aW9uLCBpZiB0aG9zZSBzdGlsbCBleGlzdCB0aGVzZSBkYXlzLlxyXG4gICAgICovICAgIFxyXG4gICAgcHJpdmF0ZSB1cGRhdGVTb3VuZFNldHRpbmcobXV0ZT86IGJvb2xlYW4pIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKG11dGUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNvdW5kVmFsdWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFNPVU5EX0tFWSk7XHJcbiAgICAgICAgICAgICAgICBtdXRlID0gc291bmRWYWx1ZSA9PT0gJ29mZic7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNvdW5kVG9nZ2xlRWxlbWVudC5jaGVja2VkID0gIW11dGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc291bmRWYWx1ZTogc3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgaWYgKG11dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3VuZFZhbHVlID0gJ29mZic7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvdW5kVmFsdWUgPSAnb24nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShTT1VORF9LRVksIHNvdW5kVmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEhvd2xlci5tdXRlKG11dGUpO1xyXG4gICAgICAgIH0sIDEpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBzb3VuZE1hbmFnZXIgPSBuZXcgU291bmRNYW5hZ2VyKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuY29uc3QgQVNQRUNUX1JBVElPID0gMTYvOTtcclxuXHJcbmNsYXNzIENhbWVyYVdyYXBwZXIge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBjYW1lcmE6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg2MCwgQVNQRUNUX1JBVElPLCAwLjEsIDEwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVJlbmRlcmVyU2l6ZShyZW5kZXJlcjogYW55KSB7XHJcbiAgICAgICAgbGV0IHdpbmRvd0FzcGVjdFJhdGlvID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgbGV0IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyO1xyXG4gICAgICAgIGlmICh3aW5kb3dBc3BlY3RSYXRpbyA+IEFTUEVDVF9SQVRJTykge1xyXG4gICAgICAgICAgICAvLyBUb28gd2lkZTsgc2NhbGUgb2ZmIG9mIHdpbmRvdyBoZWlnaHQuXHJcbiAgICAgICAgICAgIHdpZHRoID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJIZWlnaHQgKiBBU1BFQ1RfUkFUSU8pO1xyXG4gICAgICAgICAgICBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3dBc3BlY3RSYXRpbyA8PSBBU1BFQ1RfUkFUSU8pIHtcclxuICAgICAgICAgICAgLy8gVG9vIG5hcnJvdyBvciBqdXN0IHJpZ2h0OyBzY2FsZSBvZmYgb2Ygd2luZG93IHdpZHRoLlxyXG4gICAgICAgICAgICB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lcldpZHRoIC8gQVNQRUNUX1JBVElPKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbmRlcmVyLnNldFNpemUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgLy8gU2hvdWxkIGJlIG5vIG5lZWQgdG8gdXBkYXRlIGFzcGVjdCByYXRpbyBiZWNhdXNlIGl0IHNob3VsZCBiZSBjb25zdGFudC5cclxuICAgICAgICAvLyB0aGlzLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICBsb29rQXQodmVjMzogYW55KSB7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KHZlYzMpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBjYW1lcmFXcmFwcGVyID0gbmV3IENhbWVyYVdyYXBwZXIoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jbGFzcyBCdWlsZGluZ1ByZWxvYWRlciB7XHJcbiAgICBcclxuICAgIHByaXZhdGUgaW5zdGFuY2VzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgaW5zdGFuY2VzUmVxdWVzdGVkOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5pbnN0YW5jZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmluc3RhbmNlc1JlcXVlc3RlZCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJlbG9hZChjYWxsYmFjazogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIGxldCBtdGxMb2FkZXIgPSBuZXcgVEhSRUUuTVRMTG9hZGVyKCk7XHJcbiAgICAgICAgbXRsTG9hZGVyLnNldFBhdGgoJycpO1xyXG4gICAgICAgIG10bExvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5tdGwnLCAobWF0ZXJpYWxzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgbWF0ZXJpYWxzLnByZWxvYWQoKTtcclxuICAgICAgICAgICAgbGV0IG9iakxvYWRlciA9IG5ldyBUSFJFRS5PQkpMb2FkZXIoKTtcclxuICAgICAgICAgICAgb2JqTG9hZGVyLnNldE1hdGVyaWFscyhtYXRlcmlhbHMpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIuc2V0UGF0aCgnJyk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5vYmonLCAob2JqOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzLnB1c2gob2JqKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH0sICgpID0+IHsgfSwgKCkgPT4geyBjb25zb2xlLmxvZygnZXJyb3Igd2hpbGUgbG9hZGluZyA6KCcpIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBhbnkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZTogYW55O1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZXNSZXF1ZXN0ZWQgPT09IDApIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UgPSB0aGlzLmluc3RhbmNlc1swXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbnN0YW5jZSA9IHRoaXMuaW5zdGFuY2VzWzBdLmNsb25lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzLnB1c2goaW5zdGFuY2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmluc3RhbmNlc1JlcXVlc3RlZCsrO1xyXG5cclxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGJ1aWxkaW5nUHJlbG9hZGVyID0gbmV3IEJ1aWxkaW5nUHJlbG9hZGVyKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtidWlsZGluZ1ByZWxvYWRlcn0gZnJvbSAnLi9idWlsZGluZy1wcmVsb2FkZXInO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1aWxkaW5nIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgc2xhYjogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBsZXQgb2JqID0gYnVpbGRpbmdQcmVsb2FkZXIuZ2V0SW5zdGFuY2UoKTtcclxuICAgICAgICBvYmouc2NhbGUuc2V0U2NhbGFyKDAuMjUpO1xyXG4gICAgICAgIG9iai5wb3NpdGlvbi5zZXQoNSwgLTAuMDEsIDApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKG9iaik7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcblxyXG5jb25zdCBNQVhfQ1VSVEFJTl9DT1VOVCA9IDQ7XHJcbmNvbnN0IENVUlRBSU5fV0lEVEggPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7XHJcbmNvbnN0IENVUlRBSU5fTU9WRV9USU1FID0gNDAwO1xyXG5cclxuY2xhc3MgQ3VydGFpblZlcnRleFBvc2l0aW9uIHtcclxuICAgIHggPSAwO1xyXG4gICAgZWxhcHNlZCA9IDA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJIG1pZ2h0IGhhdmUgc29tZSBvZiB0aGVzZSBiYWNrd2FyZHMuLi5cclxuICovXHJcbmV4cG9ydCBlbnVtIEN1cnRhaW5EaXJlY3Rpb24ge1xyXG4gICAgT3BlbkxlZnRUb1JpZ2h0LFxyXG4gICAgT3BlblJpZ2h0VG9MZWZ0LFxyXG4gICAgQ2xvc2VMZWZ0VG9SaWdodCxcclxuICAgIENsb3NlUmlnaHRUb0xlZnRcclxufVxyXG5cclxuLyoqXHJcbiAqIFNvbWUgbm90ZXMgb24gdmVydGljZXMgd2l0aGluIGVhY2ggY3VydGFpbiBtZXNoIHdpdGhvdXQgbW9kaWZpY2F0aW9uczpcclxuICogVmVydGljZXMgMSBhbmQgMyBzaG91bGQgcmVzdCBhdCB4ID0gLUNVUlRBSU5fV0lEVEggLyAyIChob3VzZSBsZWZ0KVxyXG4gKiBWZXJ0aWNlcyAwIGFuZCAyIHNob3VsZCByZXN0IGF0IHggPSAgQ1VSVEFJTl9XSURUSCAvIDIgKGhvdXNlIHJpZ2h0KVxyXG4gKiBcclxuICogRXhhbXBsZSBzdGF0ZW1lbnRzOlxyXG4gKiBjb25zb2xlLmxvZygndmVydGljZXMgMSBhbmQgMyB4OiAnICsgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1sxXS54LCBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzNdLngpO1xyXG4gKiBjb25zb2xlLmxvZygndmVydGljZXMgMCBhbmQgMiB4OiAnICsgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1swXS54LCBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzJdLngpO1xyXG4gKiBjb25zb2xlLmxvZygnLS0tJyk7XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ3VydGFpbiB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuICAgIHJlYWRvbmx5IGN1cnRhaW5zOiBhbnlbXTtcclxuXHJcbiAgICBwcml2YXRlIGN1cnRhaW5WZXJ0ZXhQb3NpdGlvbjogQ3VydGFpblZlcnRleFBvc2l0aW9uO1xyXG4gICAgcHJpdmF0ZSBjdXJ0YWluVHdlZW46IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcbiAgICAgICAgdGhpcy5jdXJ0YWlucyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBNQVhfQ1VSVEFJTl9DT1VOVDsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoQ1VSVEFJTl9XSURUSCwgMSk7XHJcbiAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7Y29sb3I6IDB4MTAxMDMwfSk7IC8vIE1pZG5pZ2h0IEJsdWVcclxuICAgICAgICAgICAgbGV0IGN1cnRhaW4gPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW5zLnB1c2goY3VydGFpbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbiA9IG5ldyBDdXJ0YWluVmVydGV4UG9zaXRpb24oKTtcclxuICAgICAgICB0aGlzLmN1cnRhaW5Ud2VlbiA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgY3VydGFpbiBvZiB0aGlzLmN1cnRhaW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAuYWRkKGN1cnRhaW4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIGdyb3VwIHRvIGZpdCBhZ2FpbnN0IGJ1aWxkaW5nLlxyXG4gICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24uc2V0KDUuMCwgNC43NSwgLTEuNDUxKTtcclxuICAgICAgICB0aGlzLmdyb3VwLnNjYWxlLnNldCgwLjcsIDEuMCwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VydGFpblR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24uZWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW5Ud2Vlbi51cGRhdGUodGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24uZWxhcHNlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0QW5pbWF0aW9uKGZsb29ySWR4czogbnVtYmVyW10sIGRpcmVjdGlvbjogQ3VydGFpbkRpcmVjdGlvbiwgY2FsbGJhY2s/OiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgLy8gUHJldmVudCBtdWx0aXBsZSBhbmltYXRpb25zIGF0IHRoZSBzYW1lIHRpbWUuXHJcbiAgICAgICAgaWYgKHRoaXMuY3VydGFpblR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kcm9wQ3VydGFpbihmbG9vcklkeHMpO1xyXG5cclxuICAgICAgICBsZXQgeGVuZDogbnVtYmVyO1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uQ2xvc2VMZWZ0VG9SaWdodCB8fCBkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uT3BlbkxlZnRUb1JpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLnggPSBDVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICAgICAgeGVuZCA9IC1DVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5DbG9zZVJpZ2h0VG9MZWZ0IHx8IGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5PcGVuUmlnaHRUb0xlZnQpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24ueCA9IC1DVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICAgICAgeGVuZCA9ICBDVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24uZWxhcHNlZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY3VydGFpblR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uKVxyXG4gICAgICAgICAgICAudG8oe3g6IHhlbmR9LCBDVVJUQUlOX01PVkVfVElNRSlcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuUXVhcnRpYy5Jbk91dClcclxuICAgICAgICAgICAgLm9uVXBkYXRlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFNlZSBub3RlIGF0IHRvcCBhYm91dCB3aHkgaWR4MSBhbmQgaWR4MiBhcmUgd2hhdCB0aGV5IGFyZS5cclxuICAgICAgICAgICAgICAgIGxldCBpZHgxOiBudW1iZXIsIGlkeDI6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uQ2xvc2VSaWdodFRvTGVmdCB8fCBkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uT3BlbkxlZnRUb1JpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4MSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4MiA9IDI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5DbG9zZUxlZnRUb1JpZ2h0IHx8IGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5PcGVuUmlnaHRUb0xlZnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZHgxID0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZHgyID0gMztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGN1cnRhaW4gb2YgdGhpcy5jdXJ0YWlucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbaWR4MV0ueCA9IHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1tpZHgyXS54ID0gdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24ueDtcclxuICAgICAgICAgICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IHsgdGhpcy5jb21wbGV0ZUFuaW1hdGlvbihjYWxsYmFjayk7IH0pXHJcbiAgICAgICAgICAgIC5zdGFydCh0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi5lbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1ha2UgdGhlIHJlcXVlc3RlZCBudW1iZXIgb2YgY3VydGFpbnMgdmlzaWJsZS5cclxuICAgICAqIFBvc2l0aW9uIHRoZW0gb24gdGhlIHJlcXVlc3RlZCBmbG9vcnMuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZHJvcEN1cnRhaW4oZmxvb3JJZHhzOiBudW1iZXJbXSkge1xyXG4gICAgICAgIGZvciAobGV0IGN1cnRhaW4gb2YgdGhpcy5jdXJ0YWlucykge1xyXG4gICAgICAgICAgICBjdXJ0YWluLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGZsb29ySWR4cy5sZW5ndGg7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBmbG9vcklkeCA9IGZsb29ySWR4c1tpZHhdO1xyXG4gICAgICAgICAgICBsZXQgY3VydGFpbiA9IHRoaXMuY3VydGFpbnNbaWR4XTtcclxuXHJcbiAgICAgICAgICAgIGN1cnRhaW4ucG9zaXRpb24uc2V0KDAsIGZsb29ySWR4LCAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNlZSBub3RlIGF0IHRvcCBhYm91dCB3aHkgdGhlc2UgYXJlIHdoZXJlIHRoZXkgYXJlLlxyXG4gICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzBdLnggPSAtQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMV0ueCA9ICBDVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1syXS54ID0gLUNVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzNdLnggPSAgQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGN1cnRhaW4udmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29tcGxldGVBbmltYXRpb24oY2FsbGJhY2s/OiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jdXJ0YWluVHdlZW4gPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuaW1wb3J0IHtIcE9yaWVudGF0aW9ufSBmcm9tICcuLi8uLi9kb21haW4vaHAtb3JpZW50YXRpb24nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEhwUGFuZWxzIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgcGFuZWxzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgaHBPcmllbnRhdGlvbjogSHBPcmllbnRhdGlvbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihocE9yaWVudGF0aW9uOiBIcE9yaWVudGF0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGFuZWxzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgUEFORUxfQ09VTlRfUEVSX0ZMT09SOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgwLjYsIDAuNik7XHJcbiAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCgpO1xyXG4gICAgICAgICAgICBsZXQgcGFuZWwgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBsZXQgeCA9IGlkeDtcclxuICAgICAgICAgICAgbGV0IHkgPSAwO1xyXG4gICAgICAgICAgICBsZXQgeiA9IDA7XHJcbiAgICAgICAgICAgIHBhbmVsLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogTWFrZSB0aGlzIHB1bHNlIGF0IGFsbD9cclxuICAgICAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KDB4ZmZmZmZmKTtcclxuICAgICAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmVJbnRlbnNpdHkgPSAwLjI1O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wYW5lbHMucHVzaChwYW5lbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmhwT3JpZW50YXRpb24gPSBocE9yaWVudGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IHBhbmVsIG9mIHRoaXMucGFuZWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAuYWRkKHBhbmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0byBmaXQgYWdhaW5zdCBidWlsZGluZy5cclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCgxLjg1LCAzLjU1LCAtMS41KTtcclxuICAgICAgICB0aGlzLmdyb3VwLnNjYWxlLnNldCgwLjcsIDEuOSwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlSHAoUEFORUxfQ09VTlRfUEVSX0ZMT09SKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIUCBiYXIgY2FuIGdvIGZyb20gcmlnaHQtdG8tbGVmdCBvciBsZWZ0LXRvLXJpZ2h0LCBsaWtlIGEgZmlnaHRpbmcgZ2FtZSBIUCBiYXIuXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUhwKGhwOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoaHAgPiBQQU5FTF9DT1VOVF9QRVJfRkxPT1IpIHtcclxuICAgICAgICAgICAgaHAgPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCB0aGlzLnBhbmVscy5sZW5ndGg7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYW5lbCA9IHRoaXMucGFuZWxzW2lkeF07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhwT3JpZW50YXRpb24gPT09IEhwT3JpZW50YXRpb24uRGVjcmVhc2VzUmlnaHRUb0xlZnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpZHggPCBocCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaWR4ID49IFBBTkVMX0NPVU5UX1BFUl9GTE9PUiAtIGhwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVE9ETzogSGFuZGxlIHVwZGF0ZSB0byBIUCA9IGZ1bGwgYXMgZGlmZmVyZW50IGZyb20gSFAgPCBmdWxsLlxyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5pbXBvcnQge0J1aWxkaW5nfSBmcm9tICcuL2J1aWxkaW5nJztcclxuaW1wb3J0IHtDdXJ0YWlufSBmcm9tICcuL2N1cnRhaW4nO1xyXG5pbXBvcnQge0hwUGFuZWxzfSBmcm9tICcuL2hwLXBhbmVscyc7XHJcbmltcG9ydCB7SHBPcmllbnRhdGlvbn0gZnJvbSAnLi4vLi4vZG9tYWluL2hwLW9yaWVudGF0aW9uJztcclxuaW1wb3J0IHtSb3dDbGVhckRpcmVjdGlvbn0gZnJvbSAnLi4vLi4vZG9tYWluL3Jvdy1jbGVhci1kaXJlY3Rpb24nO1xyXG5pbXBvcnQge0N1cnRhaW5EaXJlY3Rpb259IGZyb20gJy4vY3VydGFpbic7XHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuXHJcbi8vIFRPRE86IE9ubHkgdGhlIDNyZCBmbG9vciBmcm9tIHRoZSB0b3AgYW5kIGJlbG93IGFyZSB2aXNpYmxlLiBBbHNvLCBzZWUgYm9hcmQudHMuXHJcbmV4cG9ydCBjb25zdCBGTE9PUl9DT1VOVCA9IDE3O1xyXG5cclxuY29uc3QgQUNUSVZFX1NIQVBFX0xJR0hUX0NPVU5UID0gNDtcclxuY29uc3QgUEFORUxfU0laRSA9IDAuNztcclxuXHJcbmNsYXNzIEVtaXNzaXZlSW50ZW5zaXR5IHtcclxuICAgIHZhbHVlOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaWdodGluZ0dyaWQge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgcGFuZWxHcm91cDogYW55O1xyXG4gICAgcHJpdmF0ZSBidWlsZGluZzogQnVpbGRpbmc7XHJcblxyXG4gICAgcHJpdmF0ZSByb3dDbGVhckRpcmVjdGlvbjogUm93Q2xlYXJEaXJlY3Rpb25cclxuICAgIHByaXZhdGUgcm93Q2xlYXJDdXJ0YWluOiBDdXJ0YWluO1xyXG4gICAgcHJpdmF0ZSBqdW5rUm93Q3VydGFpbjogQ3VydGFpbjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBocFBhbmVsczogSHBQYW5lbHM7XHJcblxyXG4gICAgcHJpdmF0ZSBwYW5lbHM6IGFueVtdW107XHJcbiAgICBcclxuICAgIHByaXZhdGUgc2hhcGVMaWdodHM6IGFueVtdO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50U2hhcGVMaWdodElkeDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBoaWdobGlnaHRlcjogYW55O1xyXG5cclxuICAgIHByaXZhdGUgcHVsc2VUd2VlbjogYW55O1xyXG4gICAgcHJpdmF0ZSBwdWxzZVR3ZWVuRWxhcHNlZDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBlbWlzc2l2ZUludGVuc2l0eTogRW1pc3NpdmVJbnRlbnNpdHk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoaHBPcmllbnRhdGlvbjogSHBPcmllbnRhdGlvbiwgcm93Q2xlYXJEaXJlY3Rpb246IFJvd0NsZWFyRGlyZWN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLmJ1aWxkaW5nID0gbmV3IEJ1aWxkaW5nKCk7XHJcblxyXG4gICAgICAgIHRoaXMucm93Q2xlYXJEaXJlY3Rpb24gPSByb3dDbGVhckRpcmVjdGlvbjtcclxuICAgICAgICB0aGlzLnJvd0NsZWFyQ3VydGFpbiA9IG5ldyBDdXJ0YWluKCk7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q3VydGFpbiA9IG5ldyBDdXJ0YWluKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaHBQYW5lbHMgPSBuZXcgSHBQYW5lbHMoaHBPcmllbnRhdGlvbik7XHJcblxyXG4gICAgICAgIHRoaXMucGFuZWxzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZmxvb3JJZHggPSAwOyBmbG9vcklkeCA8IEZMT09SX0NPVU5UOyBmbG9vcklkeCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFuZWxzW2Zsb29ySWR4XSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbElkeCA9IDA7IHBhbmVsSWR4IDwgUEFORUxfQ09VTlRfUEVSX0ZMT09SOyBwYW5lbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShQQU5FTF9TSVpFLCBQQU5FTF9TSVpFKTsgLy8gVE9ETzogY2xvbmUoKSA/XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe2VtaXNzaXZlSW50ZW5zaXR5OiAxLjB9KTtcclxuICAgICAgICAgICAgICAgIGxldCBwYW5lbCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBwYW5lbElkeDtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gZmxvb3JJZHggKyAxOyAvLyBPZmZzZXQgdXAgMSBiZWNhdXNlIGdyb3VuZCBpcyB5ID0gMC5cclxuICAgICAgICAgICAgICAgIGxldCB6ID0gMDtcclxuICAgICAgICAgICAgICAgIHBhbmVsLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhbmVsc1tmbG9vcklkeF1bcGFuZWxJZHhdID0gcGFuZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2hhcGVMaWdodHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBjb3VudCA9IDA7IGNvdW50IDwgQUNUSVZFX1NIQVBFX0xJR0hUX0NPVU5UOyBjb3VudCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KFBBTkVMX1NJWkUsIFBBTkVMX1NJWkUpO1xyXG4gICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe2VtaXNzaXZlSW50ZW5zaXR5OiAxLjB9KTtcclxuICAgICAgICAgICAgbGV0IHNoYXBlTGlnaHQgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICB0aGlzLnNoYXBlTGlnaHRzLnB1c2goc2hhcGVMaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlTGlnaHRJZHggPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmhpZ2hsaWdodGVyID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmZjAwZmYsIDMuNSwgMyk7XHJcblxyXG4gICAgICAgIHRoaXMucHVsc2VUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5lbWlzc2l2ZUludGVuc2l0eSA9IG5ldyBFbWlzc2l2ZUludGVuc2l0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuYnVpbGRpbmcuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMucm93Q2xlYXJDdXJ0YWluLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmp1bmtSb3dDdXJ0YWluLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmhwUGFuZWxzLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLnBhbmVsR3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkaW5nLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5yb3dDbGVhckN1cnRhaW4uc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmp1bmtSb3dDdXJ0YWluLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5ocFBhbmVscy5zdGFydCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBmbG9vciBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiBmbG9vcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYW5lbEdyb3VwLmFkZChwYW5lbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHNoYXBlTGlnaHQgb2YgdGhpcy5zaGFwZUxpZ2h0cykge1xyXG4gICAgICAgICAgICB0aGlzLnBhbmVsR3JvdXAuYWRkKHNoYXBlTGlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wYW5lbEdyb3VwLmFkZCh0aGlzLmhpZ2hsaWdodGVyKTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRvIGZpdCBhZ2FpbnN0IGJ1aWxkaW5nLlxyXG4gICAgICAgIHRoaXMucGFuZWxHcm91cC5wb3NpdGlvbi5zZXQoMS44NSwgMy44LCAtMS41NSk7XHJcbiAgICAgICAgdGhpcy5wYW5lbEdyb3VwLnNjYWxlLnNldCgwLjcsIDEuMCwgMSk7XHJcblxyXG4gICAgICAgIC8vIE1ha2UgY2VsbHMgYXBwZWFyIHRvIHB1bHNlLlxyXG4gICAgICAgIHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkudmFsdWUgPSAwLjMzO1xyXG4gICAgICAgIHRoaXMucHVsc2VUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMucHVsc2VUd2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmVtaXNzaXZlSW50ZW5zaXR5KVxyXG4gICAgICAgICAgICAudG8oe3ZhbHVlOiAxLjB9LCA3NTApXHJcbiAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLlNpbnVzb2lkYWwuSW5PdXQpXHJcbiAgICAgICAgICAgIC55b3lvKHRydWUpXHJcbiAgICAgICAgICAgIC5yZXBlYXQoSW5maW5pdHkpXHJcbiAgICAgICAgICAgIC5zdGFydCh0aGlzLnB1bHNlVHdlZW5FbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RlcFB1bHNlKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMucm93Q2xlYXJDdXJ0YWluLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q3VydGFpbi5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuaHBQYW5lbHMuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICBzd2l0Y2hSb29tT2ZmKGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcGFuZWwgPSB0aGlzLnBhbmVsc1tmbG9vcklkeF1bcGFuZWxJZHhdO1xyXG4gICAgICAgIHBhbmVsLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzd2l0Y2hSb29tT24oZmxvb3JJZHg6IG51bWJlciwgcGFuZWxJZHg6IG51bWJlciwgY29sb3I6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBwYW5lbCA9IHRoaXMucGFuZWxzW2Zsb29ySWR4XVtwYW5lbElkeF07XHJcbiAgICAgICAgcGFuZWwudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgcGFuZWwubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KGNvbG9yKTtcclxuICAgICAgICBwYW5lbC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoY29sb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbmRBY3RpdmVTaGFwZUxpZ2h0VG8oZmxvb3JJZHg6IG51bWJlciwgcGFuZWxJZHg6IG51bWJlciwgY29sb3I6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBzaGFwZUxpZ2h0ID0gdGhpcy5nZXROZXh0U2hhcGVMaWdodCgpO1xyXG4gICAgICAgIHNoYXBlTGlnaHQubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KGNvbG9yKTtcclxuICAgICAgICBzaGFwZUxpZ2h0Lm1hdGVyaWFsLmVtaXNzaXZlLnNldEhleChjb2xvcik7XHJcblxyXG4gICAgICAgIC8vIERvIG5vdCBsaWdodCBpZiBoaWdoZXIgdGhhbiB0aGUgaGlnaGVzdCAqdmlzaWJsZSogZmxvb3IuXHJcbiAgICAgICAgaWYgKGZsb29ySWR4ID49IEZMT09SX0NPVU5UKSB7XHJcbiAgICAgICAgICAgIHNoYXBlTGlnaHQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNoYXBlTGlnaHQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgeCA9IHBhbmVsSWR4O1xyXG4gICAgICAgIGxldCB5ID0gZmxvb3JJZHggKyAxOyAvLyBPZmZzZXQgdXAgMSBiZWNhdXNlIGdyb3VuZCBpcyB5ID0gMC5cclxuICAgICAgICBsZXQgeiA9IDA7XHJcbiAgICAgICAgc2hhcGVMaWdodC5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QWN0aXZlU2hhcGVMaWdodFBvc2l0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhpZ2hsaWdodGVyLnBvc2l0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbmRIaWdobGlnaHRlclRvKGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIsIGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICAvLyBEbyBub3QgbGlnaHQgaWYgaGlnaGVyIHRoYW4gdGhlIGhpZ2hlc3QgKnZpc2libGUqIGZsb29yLlxyXG4gICAgICAgIGlmIChmbG9vcklkeCA+PSBGTE9PUl9DT1VOVCkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVyLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVyLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVyLmNvbG9yLnNldEhleChjb2xvcik7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgeCA9IHBhbmVsSWR4O1xyXG4gICAgICAgIGxldCB5ID0gZmxvb3JJZHggKyAxOyAvLyBPZmZzZXQgdXAgMSBiZWNhdXNlIGdyb3VuZCBpcyB5ID0gMC5cclxuICAgICAgICBsZXQgeiA9IDA7XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRlci5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlSHAoaHA6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuaHBQYW5lbHMudXBkYXRlSHAoaHApO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0Um93Q2xlYXJpbmdBbmltYXRpb24oZmxvb3JJZHhzOiBudW1iZXJbXSwgY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcclxuICAgICAgICBsZXQgY3VydGFpbkRpcmVjdGlvbjogQ3VydGFpbkRpcmVjdGlvbjtcclxuICAgICAgICBpZiAodGhpcy5yb3dDbGVhckRpcmVjdGlvbiA9PT0gUm93Q2xlYXJEaXJlY3Rpb24uTGVmdFRvUmlnaHQpIHtcclxuICAgICAgICAgICAgY3VydGFpbkRpcmVjdGlvbiA9IEN1cnRhaW5EaXJlY3Rpb24uT3BlbkxlZnRUb1JpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnRhaW5EaXJlY3Rpb24gPSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5SaWdodFRvTGVmdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucm93Q2xlYXJDdXJ0YWluLnN0YXJ0QW5pbWF0aW9uKGZsb29ySWR4cywgY3VydGFpbkRpcmVjdGlvbiwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0SnVua1Jvd0N1cnRhaW5BbmltYXRpb24oZmxvb3JDb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGZsb29yQ291bnQgPiA0KSB7XHJcbiAgICAgICAgICAgIGZsb29yQ291bnQgPSA0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZmxvb3JDb3VudCA8IDApIHtcclxuICAgICAgICAgICAgZmxvb3JDb3VudCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBmbG9vcklkeHMgPSBbMCwgMSwgMiwgM10uc2xpY2UoMCwgZmxvb3JDb3VudCk7XHJcblxyXG4gICAgICAgIGxldCBjdXJ0YWluRGlyZWN0aW9uOiBDdXJ0YWluRGlyZWN0aW9uO1xyXG4gICAgICAgIGlmICh0aGlzLnJvd0NsZWFyRGlyZWN0aW9uID09PSBSb3dDbGVhckRpcmVjdGlvbi5MZWZ0VG9SaWdodCkge1xyXG4gICAgICAgICAgICBjdXJ0YWluRGlyZWN0aW9uID0gQ3VydGFpbkRpcmVjdGlvbi5DbG9zZVJpZ2h0VG9MZWZ0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnRhaW5EaXJlY3Rpb24gPSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlTGVmdFRvUmlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmp1bmtSb3dDdXJ0YWluLnN0YXJ0QW5pbWF0aW9uKGZsb29ySWR4cywgY3VydGFpbkRpcmVjdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZVNoYXBlTGlnaHRzQW5kSGlnaGxpZ2h0ZXIoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgc2hhcGVMaWdodCBvZiB0aGlzLnNoYXBlTGlnaHRzKSB7XHJcbiAgICAgICAgICAgIHNoYXBlTGlnaHQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZ2hsaWdodGVyLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRTaGFwZUxpZ2h0KCkge1xyXG4gICAgICAgIGxldCBzaGFwZUxpZ2h0ID0gdGhpcy5zaGFwZUxpZ2h0c1t0aGlzLmN1cnJlbnRTaGFwZUxpZ2h0SWR4XTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZUxpZ2h0SWR4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFNoYXBlTGlnaHRJZHggPj0gQUNUSVZFX1NIQVBFX0xJR0hUX0NPVU5UKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlTGlnaHRJZHggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2hhcGVMaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBQdWxzZShlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5wdWxzZVR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLnB1bHNlVHdlZW4udXBkYXRlKHRoaXMucHVsc2VUd2VlbkVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBmbG9vciBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiBmbG9vcikge1xyXG4gICAgICAgICAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmVJbnRlbnNpdHkgPSB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGxDaGFuZ2VFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvY2VsbC1jaGFuZ2UtZXZlbnQnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9hY3RpdmUtc2hhcGUtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7SHBDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NGaWxsZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvcm93cy1maWxsZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9yb3dzLWNsZWFyLWFuaW1hdGlvbi1jb21wbGV0ZWQtZXZlbnQnO1xyXG5pbXBvcnQge0ZhbGxpbmdTZXF1ZW5jZXJFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvZmFsbGluZy1zZXF1ZW5jZXItZXZlbnQnO1xyXG5pbXBvcnQge0xpZ2h0aW5nR3JpZCwgRkxPT1JfQ09VTlR9IGZyb20gJy4vbGlnaHRpbmctZ3JpZCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7Q2VsbE9mZnNldH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uLy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgU3dpdGNoYm9hcmQge1xyXG5cclxuICAgIHByaXZhdGUgbGlnaHRpbmdHcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IobGlnaHRpbmdHcmlkOiBMaWdodGluZ0dyaWQsIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZCA9IGxpZ2h0aW5nR3JpZDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5DZWxsQ2hhbmdlRXZlbnRUeXBlLCAoZXZlbnQ6IENlbGxDaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUNlbGxDaGFuZ2VFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlJvd3NGaWxsZWRFdmVudFR5cGUsIChldmVudDogUm93c0ZpbGxlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZVJvd0NsZWFyaW5nKGV2ZW50LmZpbGxlZFJvd0lkeHMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlSnVua1Jvd0FkZGluZyhldmVudC5maWxsZWRSb3dJZHhzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkhwQ2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBIcENoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUhwQ2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuRmFsbGluZ1NlcXVlbmNlckV2ZW50VHlwZSwgKGV2ZW50OiBGYWxsaW5nU2VxdWVuY2VyRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PT0gZXZlbnQucGxheWVyVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVGYWxsaW5nU2VxdWVuY2VyRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGZsb29ySWR4ID0gdGhpcy5jb252ZXJ0Um93VG9GbG9vcihldmVudC5zaGFwZS5nZXRSb3coKSk7XHJcbiAgICAgICAgbGV0IHBhbmVsSWR4ID0gZXZlbnQuc2hhcGUuZ2V0Q29sKCk7XHJcbiAgICAgICAgbGV0IGNvbG9yID0gdGhpcy5jb252ZXJ0Q29sb3IoZXZlbnQuc2hhcGUuY29sb3IpO1xyXG5cclxuICAgICAgICBsZXQgeVRvdGFsT2Zmc2V0ID0gMDtcclxuICAgICAgICBsZXQgeFRvdGFsT2Zmc2V0ID0gMDtcclxuICAgICAgICBsZXQgb2Zmc2V0cyA9IGV2ZW50LnNoYXBlLmdldE9mZnNldHMoKTtcclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2Ygb2Zmc2V0cykge1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0Rmxvb3JJZHggPSBmbG9vcklkeCAtIG9mZnNldC55O1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0UGFuZWxJZHggPSBwYW5lbElkeCArIG9mZnNldC54O1xyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zZW5kQWN0aXZlU2hhcGVMaWdodFRvKG9mZnNldEZsb29ySWR4LCBvZmZzZXRQYW5lbElkeCwgY29sb3IpO1xyXG5cclxuICAgICAgICAgICAgeVRvdGFsT2Zmc2V0ICs9IG9mZnNldC55O1xyXG4gICAgICAgICAgICB4VG90YWxPZmZzZXQgKz0gb2Zmc2V0Lng7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgeW9mZiA9ICh5VG90YWxPZmZzZXQgLyBvZmZzZXRzLmxlbmd0aCkgLSAyO1xyXG4gICAgICAgIGxldCB4b2ZmID0geFRvdGFsT2Zmc2V0IC8gb2Zmc2V0cy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc2VuZEhpZ2hsaWdodGVyVG8oZmxvb3JJZHggKyB5b2ZmLCBwYW5lbElkeCArIHhvZmYsIGNvbG9yKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICBsZXQgYWN0aXZlU2hhcGVMaWdodFBvc2l0aW9uID0gdGhpcy5saWdodGluZ0dyaWQuZ2V0QWN0aXZlU2hhcGVMaWdodFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IEhhdmUgdGhlIGNhbWVyYSBsb29rIGF0IHRoaXM/XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2VsbENoYW5nZUV2ZW50KGV2ZW50OiBDZWxsQ2hhbmdlRXZlbnQpIHtcclxuICAgICAgICBsZXQgZmxvb3JJZHggPSB0aGlzLmNvbnZlcnRSb3dUb0Zsb29yKGV2ZW50LnJvdyk7XHJcbiAgICAgICAgaWYgKGZsb29ySWR4ID49IEZMT09SX0NPVU5UKSB7XHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gU2tpcCBvYnN0cnVjdGVkIGZsb29yc1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHBhbmVsSWR4ID0gZXZlbnQuY29sO1xyXG4gICAgICAgIGlmIChldmVudC5jZWxsLmdldENvbG9yKCkgPT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnN3aXRjaFJvb21PZmYoZmxvb3JJZHgsIHBhbmVsSWR4KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgY29sb3IgPSB0aGlzLmNvbnZlcnRDb2xvcihldmVudC5jZWxsLmdldENvbG9yKCkpO1xyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zd2l0Y2hSb29tT24oZmxvb3JJZHgsIHBhbmVsSWR4LCBjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYW5pbWF0ZVJvd0NsZWFyaW5nKGZpbGxlZFJvd0lkeHM6IG51bWJlcltdKSB7XHJcbiAgICAgICAgbGV0IGZsb29ySWR4czogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBmaWxsZWRSb3dJZHggb2YgZmlsbGVkUm93SWR4cykge1xyXG4gICAgICAgICAgICBsZXQgZmxvb3JJZHggPSB0aGlzLmNvbnZlcnRSb3dUb0Zsb29yKGZpbGxlZFJvd0lkeCk7XHJcbiAgICAgICAgICAgIGZsb29ySWR4cy5wdXNoKGZsb29ySWR4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnN0YXJ0Um93Q2xlYXJpbmdBbmltYXRpb24oZmxvb3JJZHhzLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtZW1iZXIgdGhhdCB0aGUganVuayByb3dzIGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkIG9uIHRoZSBib2FyZC5cclxuICAgICAqIFxyXG4gICAgICogRG8gbm90IG5lZWQgdG8gZmlyZSBhbiBldmVudCBhdCB0aGUgZW5kIG9mIHRoaXMgYW5pbWF0aW9uIGJlY2F1c2UgdGhlIGJvYXJkXHJcbiAgICAgKiBkb2VzIG5vdCBuZWVkIHRvIGxpc3RlbiBmb3IgaXQgKGl0IGxpc3RlbnMgZm9yIHRoZSBjbGVhcmluZyBhbmltYXRpb24gaW5zdGVhZCkuXHJcbiAgICAqL1xyXG4gICAgcHJpdmF0ZSBhbmltYXRlSnVua1Jvd0FkZGluZyhqdW5rUm93Q291bnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnN0YXJ0SnVua1Jvd0N1cnRhaW5BbmltYXRpb24oanVua1Jvd0NvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUhwQ2hhbmdlZEV2ZW50KGV2ZW50OiBIcENoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnVwZGF0ZUhwKGV2ZW50LmhwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUZhbGxpbmdTZXF1ZW5jZXJFdmVudChldmVudDogRmFsbGluZ1NlcXVlbmNlckV2ZW50KXtcclxuICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5oaWRlU2hhcGVMaWdodHNBbmRIaWdobGlnaHRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBjZWxsIHJvdy9jb2wgY29vcmRpbmF0ZXMgdG8gZmxvb3IvcGFuZWwgY29vcmRpbmF0ZXMuXHJcbiAgICAgKiBBY2NvdW50IGZvciB0aGUgdHdvIGZsb29ycyB0aGF0IGFyZSBvYnN0cnVjdGVkIGZyb20gdmlldy4gKD8pXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY29udmVydFJvd1RvRmxvb3Iocm93OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgdGhpbmcgPSAoRkxPT1JfQ09VTlQgLSByb3cpICsgMTtcclxuICAgICAgICByZXR1cm4gdGhpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb252ZXJ0Q29sb3IoY29sb3I6IENvbG9yKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgdmFsdWU6IG51bWJlcjtcclxuICAgICAgICBzd2l0Y2ggKGNvbG9yKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuQ3lhbjpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgzM2NjY2M7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5ZZWxsb3c6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZmZjU1O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuUHVycGxlOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGEwMjBhMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkdyZWVuOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDIwYTAyMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLlJlZDpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhmZjMzMzM7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5CbHVlOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDQ0NDRjYztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLk9yYW5nZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhlZWQ1MzA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5XaGl0ZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhmZmZmZmY7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLy8gRGVmYXVsdCBvciBtaXNzaW5nIGNhc2UgaXMgYmxhY2suXHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuRW1wdHk6XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4MDAwMDAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbi8vIERpbWVuc2lvbnMgb2YgdGhlIGVudGlyZSBzcHJpdGVzaGVldDpcclxuZXhwb3J0IGNvbnN0IFNQUklURVNIRUVUX1dJRFRIICAgPSAyNTY7XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVTSEVFVF9IRUlHSFQgID0gNTEyO1xyXG5cclxuLy8gRGltZW5zaW9ucyBvZiBvbmUgZnJhbWUgd2l0aGluIHRoZSBzcHJpdGVzaGVldDpcclxuZXhwb3J0IGNvbnN0IEZSQU1FX1dJRFRIICAgPSA0ODtcclxuZXhwb3J0IGNvbnN0IEZSQU1FX0hFSUdIVCAgPSA3MjtcclxuXHJcbmNvbnN0IFRPVEFMX0RJRkZFUkVOVF9URVhUVVJFUyA9IDM7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyIHtcclxuXHJcbiAgICByZWFkb25seSB0ZXh0dXJlOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IodGV4dHVyZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlIHtcclxuXHJcbiAgICBwcml2YXRlIHRleHR1cmVzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgbG9hZGVkQ291bnQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY3VycmVudFRleHR1cmVJZHg6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnRleHR1cmVzID0gW107XHJcbiAgICAgICAgdGhpcy5sb2FkZWRDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50VGV4dHVyZUlkeCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJlbG9hZChjYWxsYmFjazogKCkgPT4gYW55KSB7XHJcbiAgICAgICAgbGV0IHRleHR1cmVMb2FkZWRIYW5kbGVyID0gKHRleHR1cmU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBIYXZlIGl0IHNob3cgb25seSBvbmUgZnJhbWUgYXQgYSB0aW1lOlxyXG4gICAgICAgICAgICB0ZXh0dXJlLnJlcGVhdC5zZXQoXHJcbiAgICAgICAgICAgICAgICBGUkFNRV9XSURUSCAgLyBTUFJJVEVTSEVFVF9XSURUSCxcclxuICAgICAgICAgICAgICAgIEZSQU1FX0hFSUdIVCAvIFNQUklURVNIRUVUX0hFSUdIVFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmVzLnB1c2godGV4dHVyZSk7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGVkQ291bnQrKztcclxuICAgICAgICAgICAgaWYgKHRoaXMubG9hZGVkQ291bnQgPj0gVE9UQUxfRElGRkVSRU5UX1RFWFRVUkVTKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdGV4dHVyZUxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XHJcbiAgICAgICAgdGV4dHVyZUxvYWRlci5sb2FkKCdmYWxsLXN0dWRlbnQucG5nJywgdGV4dHVyZUxvYWRlZEhhbmRsZXIpO1xyXG4gICAgICAgIHRleHR1cmVMb2FkZXIubG9hZCgnZmFsbC1zdHVkZW50Mi5wbmcnLCB0ZXh0dXJlTG9hZGVkSGFuZGxlcik7XHJcbiAgICAgICAgdGV4dHVyZUxvYWRlci5sb2FkKCdmYWxsLXN0dWRlbnQzLnBuZycsIHRleHR1cmVMb2FkZWRIYW5kbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBuZXdJbnN0YW5jZSgpOiBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXIge1xyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLmdldE5leHRUZXh0dXJlSWR4KCk7XHJcbiAgICAgICAgbGV0IHRleHR1cmUgPSB0aGlzLnRleHR1cmVzW2lkeF0uY2xvbmUoKTsgLy8gQ2xvbmluZyB0ZXh0dXJlcyBpbiB0aGUgdmVyc2lvbiBvZiBUaHJlZUpTIHRoYXQgSSBhbSBjdXJyZW50bHkgdXNpbmcgd2lsbCBkdXBsaWNhdGUgdGhlbSA6KFxyXG4gICAgICAgIHJldHVybiBuZXcgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyKHRleHR1cmUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TmV4dFRleHR1cmVJZHgoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50VGV4dHVyZUlkeCsrO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRUZXh0dXJlSWR4ID49IFRPVEFMX0RJRkZFUkVOVF9URVhUVVJFUykge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUZXh0dXJlSWR4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFRleHR1cmVJZHg7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZSA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge1N0YW5kZWV9IGZyb20gJy4vc3RhbmRlZSc7XHJcbmltcG9ydCB7RXZlbnRUeXBlLCBldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtOcGNQbGFjZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLXBsYWNlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1tb3ZlbWVudC1jaGFuZ2VkLWV2ZW50JztcclxuXHJcbmNvbnN0IFlfT0ZGU0VUID0gMC43NTsgLy8gU2V0cyB0aGVpciBmZWV0IG9uIHRoZSBncm91bmQgcGxhbmUuXHJcblxyXG5jbGFzcyBTdGFuZGVlTWFuYWdlciB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHN0YW5kZWVzOiBNYXA8bnVtYmVyLCBTdGFuZGVlPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhbmRlZXMgPSBuZXcgTWFwPG51bWJlciwgU3RhbmRlZT4oKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldFkoWV9PRkZTRVQpO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuTnBjUGxhY2VkRXZlbnRUeXBlLCAoZXZlbnQ6IE5wY1BsYWNlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTnBjUGxhY2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zdGFuZGVlcy5mb3JFYWNoKChzdGFuZGVlOiBTdGFuZGVlKSA9PiB7XHJcbiAgICAgICAgICAgIHN0YW5kZWUuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5wY1BsYWNlZEV2ZW50KGV2ZW50OiBOcGNQbGFjZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBzdGFuZGVlID0gbmV3IFN0YW5kZWUoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIHN0YW5kZWUuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZChzdGFuZGVlLmdyb3VwKTtcclxuICAgICAgICB0aGlzLnN0YW5kZWVzLnNldChzdGFuZGVlLm5wY0lkLCBzdGFuZGVlKTtcclxuXHJcbiAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgIGxldCB6ID0gZXZlbnQueTtcclxuICAgICAgICB0aGlzLm1vdmVUb0luaXRpYWxQb3NpdGlvbihzdGFuZGVlLCB4LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1vdmVUb0luaXRpYWxQb3NpdGlvbihzdGFuZGVlOiBTdGFuZGVlLCB4OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIC8vIFRPRE86IFVzZSBldmVudC54LCBldmVudC55IHdpdGggc2NhbGluZyB0byBkZXRlcm1pbmUgZGVzdGluYXRpb25cclxuICAgICAgICBzdGFuZGVlLm1vdmVUbyh4LHopO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQoZXZlbnQ6IE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IHN0YW5kZWUgPSB0aGlzLnN0YW5kZWVzLmdldChldmVudC5ucGNJZCk7XHJcbiAgICAgICAgaWYgKHN0YW5kZWUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgeCA9IGV2ZW50Lng7XHJcbiAgICAgICAgICAgIGxldCB6ID0gZXZlbnQueTtcclxuICAgICAgICAgICAgc3RhbmRlZS53YWxrVG8oeCwgeiwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBzdGFuZGVlTWFuYWdlciA9IG5ldyBTdGFuZGVlTWFuYWdlcigpOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0L2xpYi9saWIuZXM2LmQudHMnLz5cclxuXHJcbmRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7Y2FtZXJhV3JhcHBlcn0gZnJvbSAnLi4vY2FtZXJhLXdyYXBwZXInO1xyXG5pbXBvcnQge1xyXG4gICAgU1BSSVRFU0hFRVRfV0lEVEgsXHJcbiAgICBTUFJJVEVTSEVFVF9IRUlHSFQsXHJcbiAgICBGUkFNRV9XSURUSCxcclxuICAgIEZSQU1FX0hFSUdIVCxcclxuICAgIFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcixcclxuICAgIHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZX1cclxuZnJvbSAnLi9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UnO1xyXG5cclxuY29uc3QgU1RBTkRBUkRfREVMQVkgPSAyMjU7XHJcbmNvbnN0IFdBTEtfVVBfT1JfRE9XTl9ERUxBWSA9IE1hdGguZmxvb3IoU1RBTkRBUkRfREVMQVkgKiAoMi8zKSk7IC8vIEJlY2F1c2UgdXAvZG93biB3YWxrIGN5Y2xlcyBoYXZlIG1vcmUgZnJhbWVzLiBcclxuXHJcbmNvbnN0IHNjcmF0Y2hWZWN0b3IxOiBhbnkgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG5jb25zdCBzY3JhdGNoVmVjdG9yMjogYW55ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb25GcmFtZSB7XHJcblxyXG4gICAgcmVhZG9ubHkgcm93OiBudW1iZXI7XHJcbiAgICByZWFkb25seSBjb2w6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb3c6IG51bWJlciwgY29sOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdzsgXHJcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBlbnVtIFN0YW5kZWVBbmltYXRpb25UeXBlIHtcclxuICAgIFN0YW5kVXAsXHJcbiAgICBTdGFuZERvd24sXHJcbiAgICBTdGFuZExlZnQsXHJcbiAgICBTdGFuZFJpZ2h0LFxyXG4gICAgV2Fsa1VwLFxyXG4gICAgV2Fsa0Rvd24sXHJcbiAgICBXYWxrTGVmdCxcclxuICAgIFdhbGtSaWdodCxcclxuICAgIENoZWVyVXAsXHJcbiAgICBQYW5pY1VwLFxyXG4gICAgUGFuaWNEb3duXHJcbn1cclxuXHJcbmNsYXNzIFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgXHJcbiAgICByZWFkb25seSB0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZTtcclxuICAgIHJlYWRvbmx5IG5leHQ6IFN0YW5kZWVBbmltYXRpb25UeXBlOyAvLyBQcm9iYWJseSBub3QgZ29pbmcgdG8gYmUgdXNlZCBmb3IgdGhpcyBnYW1lXHJcblxyXG4gICAgcmVhZG9ubHkgZnJhbWVzOiBTdGFuZGVlQW5pbWF0aW9uRnJhbWVbXTtcclxuICAgIHJlYWRvbmx5IGRlbGF5czogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIGN1cnJlbnRGcmFtZUlkeDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50RnJhbWVUaW1lRWxhcHNlZDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgZmluaXNoZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IodHlwZTogU3RhbmRlZUFuaW1hdGlvblR5cGUsIG5leHQ/OiBTdGFuZGVlQW5pbWF0aW9uVHlwZSkge1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgaWYgKG5leHQpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0ID0gbmV4dDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5leHQgPSB0eXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlbGF5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZyYW1lSWR4ID0gMDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1c2goZnJhbWU6IFN0YW5kZWVBbmltYXRpb25GcmFtZSwgZGVsYXkgPSBTVEFOREFSRF9ERUxBWSkge1xyXG4gICAgICAgIHRoaXMuZnJhbWVzLnB1c2goZnJhbWUpO1xyXG4gICAgICAgIHRoaXMuZGVsYXlzLnB1c2goZGVsYXkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID49IHRoaXMuZGVsYXlzW3RoaXMuY3VycmVudEZyYW1lSWR4XSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHgrKztcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEZyYW1lSWR4ID49IHRoaXMuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHggPSAwOyAvLyBTaG91bGRuJ3QgYmUgdXNlZCBhbnltb3JlLCBidXQgcHJldmVudCBvdXQtb2YtYm91bmRzIGFueXdheS5cclxuICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzRmluaXNoZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudEZyYW1lKCk6IFN0YW5kZWVBbmltYXRpb25GcmFtZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJhbWVzW3RoaXMuY3VycmVudEZyYW1lSWR4XTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVTcHJpdGVXcmFwcGVyIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuICAgIHByaXZhdGUgc3ByaXRlOiBhbnk7XHJcbiAgICBwcml2YXRlIHRleHR1cmVXcmFwcGVyOiBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50QW5pbWF0aW9uOiBTdGFuZGVlQW5pbWF0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUaHJlZUpTIG9iamVjdHM6IFxyXG4gICAgICAgIHRoaXMudGV4dHVyZVdyYXBwZXIgPSBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UubmV3SW5zdGFuY2UoKTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU3ByaXRlTWF0ZXJpYWwoe21hcDogdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlfSk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgVEhSRUUuU3ByaXRlKG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5zY2FsZS5zZXQoMSwgMS41KTsgLy8gQWRqdXN0IGFzcGVjdCByYXRpbyBmb3IgNDggeCA3MiBzaXplIGZyYW1lcy4gXHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5zcHJpdGUpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIGRlZmF1bHQgYW5pbWF0aW9uIHRvIHN0YW5kaW5nIGZhY2luZyBkb3duOlxyXG4gICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kRG93bigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vIFRPRE86IFNldCB0aGlzIGVsc2V3aGVyZVxyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5hZGp1c3RMaWdodGluZyhlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLnN0ZXBBbmltYXRpb24oZWxhcHNlZCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogT25seSBzd2l0Y2hlcyBpZiB0aGUgZ2l2ZW4gYW5pbWF0aW9uIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBjdXJyZW50IG9uZS5cclxuICAgICAqL1xyXG4gICAgc3dpdGNoQW5pbWF0aW9uKHR5cGU6IFN0YW5kZWVBbmltYXRpb25UeXBlKSB7XHJcbiAgICAgICAgbGV0IGFuaW1hdGlvbiA9IGRldGVybWluZUFuaW1hdGlvbih0eXBlKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uLnR5cGUgIT09IGFuaW1hdGlvbi50eXBlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcclxuICAgICAgICB9IFxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRqdXN0TGlnaHRpbmcoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gVE9ETzogTm90IHlldCBzdXJlIGlmIEknbGwgbmVlZCB0byB1c2UgdGhlIGVsYXBzZWQgdmFyaWFibGUgaGVyZS5cclxuICAgICAgICAvLyBUT0RPOiBNb3ZlIG1hZ2ljIG51bWJlcnMgaW50byBzYW1lIGVxdWF0aW9ucyBhcyB0aGUgTlBDXHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZ2V0V29ybGRQb3NpdGlvbihzY3JhdGNoVmVjdG9yMSk7XHJcbiAgICAgICAgY2FtZXJhV3JhcHBlci5jYW1lcmEuZ2V0V29ybGRQb3NpdGlvbihzY3JhdGNoVmVjdG9yMik7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlU3F1YXJlZDogbnVtYmVyID0gc2NyYXRjaFZlY3RvcjEuZGlzdGFuY2VUb1NxdWFyZWQoc2NyYXRjaFZlY3RvcjIpO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9IE1hdGgubWF4KDAuMjAsIDEuMCAtIChNYXRoLm1pbigxLjAsIGRpc3RhbmNlU3F1YXJlZCAvIDIyNSkpKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5tYXRlcmlhbC5jb2xvci5zZXRSR0IodmFsdWUsIHZhbHVlLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwQW5pbWF0aW9uKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBbmltYXRpb24gPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRBbmltYXRpb24uc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uLmlzRmluaXNoZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBbmltYXRpb24gPSBkZXRlcm1pbmVBbmltYXRpb24odGhpcy5jdXJyZW50QW5pbWF0aW9uLm5leHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZnJhbWUgPSB0aGlzLmN1cnJlbnRBbmltYXRpb24uZ2V0Q3VycmVudEZyYW1lKCk7XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgZnJhbWUgY29vcmRpbmF0ZXMgdG8gdGV4dHVyZSBjb29yZGluYXRlcyBhbmQgc2V0IHRoZSBjdXJyZW50IG9uZVxyXG4gICAgICAgIGxldCB4cGN0ID0gKGZyYW1lLmNvbCAqIEZSQU1FX1dJRFRIKSAvIFNQUklURVNIRUVUX1dJRFRIO1xyXG4gICAgICAgIGxldCB5cGN0ID0gKCgoU1BSSVRFU0hFRVRfSEVJR0hUIC8gRlJBTUVfSEVJR0hUKSAtIDEgLSBmcmFtZS5yb3cpICogRlJBTUVfSEVJR0hUKSAvIFNQUklURVNIRUVUX0hFSUdIVDtcclxuICAgICAgICB0aGlzLnRleHR1cmVXcmFwcGVyLnRleHR1cmUub2Zmc2V0LnNldCh4cGN0LCB5cGN0KTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGV0ZXJtaW5lQW5pbWF0aW9uKHR5cGU6IFN0YW5kZWVBbmltYXRpb25UeXBlKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uOiBTdGFuZGVlQW5pbWF0aW9uO1xyXG4gICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZFVwOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZFVwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa1VwOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVXYWxrVXAoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZERvd246XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kRG93bigpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVXYWxrRG93bigpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kTGVmdDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlU3RhbmRMZWZ0KCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0xlZnQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtMZWZ0KCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRSaWdodDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlU3RhbmRSaWdodCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa1JpZ2h0KCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuQ2hlZXJVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlQ2hlZXJVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlBhbmljVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVBhbmljVXAoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY0Rvd246XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVBhbmljRG93bigpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gU3RhbmRpbmcgVXBcclxubGV0IHN0YW5kVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU3RhbmRVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZFVwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHN0YW5kVXBGcmFtZTEpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gV2Fsa2luZyBVcFxyXG5sZXQgd2Fsa1VwRnJhbWUxICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMCk7XHJcbmxldCB3YWxrVXBGcmFtZTIgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAxKTtcclxubGV0IHdhbGtVcEZyYW1lMyAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDIpO1xyXG5sZXQgd2Fsa1VwRnJhbWU0ICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMyk7XHJcbmxldCB3YWxrVXBGcmFtZTUgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAzKTtcclxubGV0IHdhbGtVcEZyYW1lNiAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDUsIDMpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlV2Fsa1VwKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrVXBGcmFtZTEsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrVXBGcmFtZTIsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrVXBGcmFtZTMsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrVXBGcmFtZTQsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrVXBGcmFtZTUsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrVXBGcmFtZTYsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBTdGFuZGluZyBEb3duXHJcbmxldCBzdGFuZERvd25GcmFtZTEgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAwKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kRG93bigpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZERvd24pO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goc3RhbmREb3duRnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgRG93blxyXG5sZXQgd2Fsa0Rvd25GcmFtZTEgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcbmxldCB3YWxrRG93bkZyYW1lMiAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAxKTtcclxubGV0IHdhbGtEb3duRnJhbWUzICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDIpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTQgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMyk7XHJcbmxldCB3YWxrRG93bkZyYW1lNSAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAzKTtcclxubGV0IHdhbGtEb3duRnJhbWU2ICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDMpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlV2Fsa0Rvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0Rvd24pO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTEsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lMiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWUzLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTQsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lNSwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWU2LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gU3RhbmRpbmcgTGVmdFxyXG5sZXQgc3RhbmRMZWZ0RnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMSk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZExlZnQoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRMZWZ0KTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHN0YW5kTGVmdEZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIExlZnRcclxubGV0IHdhbGtMZWZ0RnJhbWUxICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDEpO1xyXG5sZXQgd2Fsa0xlZnRGcmFtZTIgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMCk7XHJcbmxldCB3YWxrTGVmdEZyYW1lMyAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAxKTtcclxubGV0IHdhbGtMZWZ0RnJhbWU0ICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDIpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlV2Fsa0xlZnQoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0xlZnQpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0xlZnRGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0xlZnRGcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0xlZnRGcmFtZTMpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0xlZnRGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gU3RhbmRpbmcgUmlnaHRcclxubGV0IHN0YW5kUmlnaHRGcmFtZTEgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDQpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU3RhbmRSaWdodCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZFJpZ2h0KTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHN0YW5kUmlnaHRGcmFtZTEpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gV2Fsa2luZyBSaWdodFxyXG5sZXQgd2Fsa1JpZ2h0RnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgNCk7XHJcbmxldCB3YWxrUmlnaHRGcmFtZTIgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCA0KTtcclxubGV0IHdhbGtSaWdodEZyYW1lMyAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDQpO1xyXG5sZXQgd2Fsa1JpZ2h0RnJhbWU0ICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgNCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVXYWxrUmlnaHQoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa1JpZ2h0KTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtSaWdodEZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtSaWdodEZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBDaGVlciBVcFxyXG5sZXQgY2hlZXJVcEZyYW1lMSAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMCk7XHJcbmxldCBjaGVlclVwRnJhbWUyICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAwKTtcclxubGV0IGNoZWVyVXBGcmFtZTMgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDEpO1xyXG5sZXQgY2hlZXJVcEZyYW1lNCAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDaGVlclVwKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLkNoZWVyVXApO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goY2hlZXJVcEZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTMpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goY2hlZXJVcEZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBQYW5pYyBVcFxyXG5sZXQgcGFuaWNVcEZyYW1lMSAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMCk7XHJcbmxldCBwYW5pY1VwRnJhbWUyICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAyKTtcclxubGV0IHBhbmljVXBGcmFtZTMgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDApO1xyXG5sZXQgcGFuaWNVcEZyYW1lNCAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMik7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQYW5pY1VwKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlBhbmljVXApO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNVcEZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTMpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNVcEZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBQYW5pYyBEb3duXHJcbmxldCBwYW5pY0Rvd25GcmFtZTEgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAwKTtcclxubGV0IHBhbmljRG93bkZyYW1lMiAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDEpO1xyXG5sZXQgcGFuaWNEb3duRnJhbWUzICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMik7XHJcbmxldCBwYW5pY0Rvd25GcmFtZTQgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAxKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVBhbmljRG93bigpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY0Rvd24pO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNEb3duRnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTMpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNEb3duRnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcbmRlY2xhcmUgY29uc3QgVFdFRU46IGFueTtcclxuXHJcbmltcG9ydCB7RXZlbnRUeXBlLCBldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9zdGFuZGVlLW1vdmVtZW50LWVuZGVkLWV2ZW50JztcclxuaW1wb3J0IHtTdGFuZGVlU3ByaXRlV3JhcHBlciwgU3RhbmRlZUFuaW1hdGlvblR5cGV9IGZyb20gJy4vc3RhbmRlZS1zcHJpdGUtd3JhcHBlcic7XHJcbmltcG9ydCB7Y2FtZXJhV3JhcHBlcn0gZnJvbSAnLi4vY2FtZXJhLXdyYXBwZXInO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWUge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuICAgIHJlYWRvbmx5IHNwcml0ZVdyYXBwZXI6IFN0YW5kZWVTcHJpdGVXcmFwcGVyO1xyXG5cclxuICAgIHByaXZhdGUgd2Fsa1R3ZWVuRWxhcHNlZDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB3YWxrVHdlZW46IGFueTtcclxuXHJcbiAgICBwcml2YXRlIGZhY2luZzogYW55OyAvLyBGYWNlcyBpbiB0aGUgdmVjdG9yIG9mIHdoaWNoIHdheSB0aGUgTlBDIGlzIHdhbGtpbmcsIHdhcyB3YWxraW5nIGJlZm9yZSBzdG9wcGluZywgb3Igd2FzIHNldCB0by5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyID0gbmV3IFN0YW5kZWVTcHJpdGVXcmFwcGVyKCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5zcHJpdGVXcmFwcGVyLmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLndhbGtUd2VlbiA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuZmFjaW5nID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCgtMjAwLCAwLCAtMjAwKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RlcFdhbGsoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVDb3JyZWN0QW5pbWF0aW9uKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW1tZWRpYXRlbHkgc2V0IHN0YW5kZWUgb24gZ2l2ZW4gcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIG1vdmVUbyh4OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24uc2V0KHgsIDAsIHopO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHN0YW5kZWUgaW4gbW90aW9uIHRvd2FyZHMgZ2l2ZW4gcG9zaXRpb24uXHJcbiAgICAgKiBTcGVlZCBkaW1lbnNpb24gaXMgMSB1bml0L3NlYy5cclxuICAgICAqL1xyXG4gICAgd2Fsa1RvKHg6IG51bWJlciwgejogbnVtYmVyLCBzcGVlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdyBsb25nIGl0IHdvdWxkIHRha2UsIGdpdmVuIHRoZSBzcGVlZCByZXF1ZXN0ZWQuXHJcbiAgICAgICAgbGV0IHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKHgsIDAsIHopLnN1Yih0aGlzLmdyb3VwLnBvc2l0aW9uKTtcclxuICAgICAgICBsZXQgZGlzdGFuY2UgPSB2ZWN0b3IubGVuZ3RoKCk7XHJcbiAgICAgICAgbGV0IHRpbWUgPSAoZGlzdGFuY2UgLyBzcGVlZCkgKiAxMDAwO1xyXG5cclxuICAgICAgICAvLyBEZWxlZ2F0ZSB0byB0d2Vlbi5qcy4gUGFzcyBpbiBjbG9zdXJlcyBhcyBjYWxsYmFja3MgYmVjYXVzZSBvdGhlcndpc2UgJ3RoaXMnIHdpbGwgcmVmZXJcclxuICAgICAgICAvLyB0byB0aGUgcG9zaXRpb24gb2JqZWN0LCB3aGVuIGV4ZWN1dGluZyBzdG9wV2FsaygpLlxyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5ncm91cC5wb3NpdGlvbilcclxuICAgICAgICAgICAgLnRvKHt4OiB4LCB6OiB6fSwgdGltZSlcclxuICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4geyB0aGlzLnN0b3BXYWxrKCk7IH0pXHJcbiAgICAgICAgICAgIC5zdGFydCh0aGlzLndhbGtUd2VlbkVsYXBzZWQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFVwZGF0ZSBkaXJlY3Rpb24gdGhpcyBzdGFuZGVlIHdpbGwgYmUgZmFjaW5nIHdoZW4gd2Fsa2luZy5cclxuICAgICAgICB0aGlzLmZhY2luZy5zZXRYKHggLSB0aGlzLmdyb3VwLnBvc2l0aW9uLngpO1xyXG4gICAgICAgIHRoaXMuZmFjaW5nLnNldFooeiAtIHRoaXMuZ3JvdXAucG9zaXRpb24ueik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwV2FsayhlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy53YWxrVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy53YWxrVHdlZW4udXBkYXRlKHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RvcFdhbGsoKSB7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLndhbGtUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChcclxuICAgICAgICAgICAgdGhpcy5ucGNJZCxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnopXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVuc3VyZUNvcnJlY3RBbmltYXRpb24oKSB7XHJcbiAgICAgICAgLy8gbGV0IHRhcmdldCA9IHRoaXMuZ3JvdXAucG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgICAvLyB0YXJnZXQuc2V0WSh0YXJnZXQueSArIDAuNSk7XHJcbiAgICAgICAgLy8gY2FtZXJhV3JhcHBlci5jYW1lcmEubG9va0F0KHRhcmdldCk7XHJcblxyXG4gICAgICAgIC8vIEFuZ2xlIGJldHdlZW4gdHdvIHZlY3RvcnM6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxNDg0MjI4XHJcbiAgICAgICAgbGV0IHdvcmxkRGlyZWN0aW9uID0gY2FtZXJhV3JhcHBlci5jYW1lcmEuZ2V0V29ybGREaXJlY3Rpb24oKTtcclxuICAgICAgICBsZXQgYW5nbGUgPSBNYXRoLmF0YW4yKHRoaXMuZmFjaW5nLnosIHRoaXMuZmFjaW5nLngpIC0gTWF0aC5hdGFuMih3b3JsZERpcmVjdGlvbi56LCB3b3JsZERpcmVjdGlvbi54KTtcclxuICAgICAgICBpZiAoYW5nbGUgPCAwKSBhbmdsZSArPSAyICogTWF0aC5QSTtcclxuICAgICAgICBhbmdsZSAqPSAoMTgwL01hdGguUEkpOyAvLyBJdCdzIG15IHBhcnR5IGFuZCBJJ2xsIHVzZSBkZWdyZWVzIGlmIEkgd2FudCB0by5cclxuXHJcbiAgICAgICAgaWYgKHRoaXMud2Fsa1R3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgaWYgKGFuZ2xlIDwgNjAgfHwgYW5nbGUgPj0gMzAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtVcCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gNjAgJiYgYW5nbGUgPCAxMjApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa1JpZ2h0KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSAxMjAgJiYgYW5nbGUgPCAyNDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0Rvd24pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDI0MCAmJiBhbmdsZSA8IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrTGVmdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoYW5nbGUgPCA2MCB8fCBhbmdsZSA+PSAzMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gNjAgJiYgYW5nbGUgPCAxMjApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRSaWdodCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gMTIwICYmIGFuZ2xlIDwgMjQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kRG93bik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gMjQwICYmIGFuZ2xlIDwgMzAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kTGVmdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge2NhbWVyYVdyYXBwZXJ9IGZyb20gJy4vY2FtZXJhLXdyYXBwZXInO1xyXG5pbXBvcnQge3NreX0gZnJvbSAnLi93b3JsZC9za3knO1xyXG5pbXBvcnQge2dyb3VuZH0gZnJvbSAnLi93b3JsZC9ncm91bmQnO1xyXG5pbXBvcnQge0xpZ2h0aW5nR3JpZH0gZnJvbSAnLi9saWdodGluZy9saWdodGluZy1ncmlkJztcclxuaW1wb3J0IHtTd2l0Y2hib2FyZH0gZnJvbSAnLi9saWdodGluZy9zd2l0Y2hib2FyZCc7XHJcbmltcG9ydCB7c3RhbmRlZU1hbmFnZXJ9IGZyb20gJy4vc3RhbmRlZS9zdGFuZGVlLW1hbmFnZXInO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcbmltcG9ydCB7SHBPcmllbnRhdGlvbn0gZnJvbSAnLi4vZG9tYWluL2hwLW9yaWVudGF0aW9uJztcclxuaW1wb3J0IHtSb3dDbGVhckRpcmVjdGlvbn0gZnJvbSAnLi4vZG9tYWluL3Jvdy1jbGVhci1kaXJlY3Rpb24nO1xyXG5cclxuY2xhc3MgVmlldyB7XHJcblxyXG4gICAgcHJpdmF0ZSBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cclxuICAgIHByaXZhdGUgc2t5U2NlbmU6IGFueTtcclxuICAgIHByaXZhdGUgbGVmdFNjZW5lOiBhbnk7XHJcbiAgICBwcml2YXRlIHJpZ2h0U2NlbmU6IGFueTtcclxuICAgIHByaXZhdGUgZ3JvdW5kU2NlbmU6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBodW1hbkdyaWQ6IExpZ2h0aW5nR3JpZDtcclxuICAgIHByaXZhdGUgaHVtYW5Td2l0Y2hib2FyZDogU3dpdGNoYm9hcmQ7XHJcbiAgICBwcml2YXRlIGFpR3JpZDogTGlnaHRpbmdHcmlkO1xyXG4gICAgcHJpdmF0ZSBhaVN3aXRjaGJvYXJkOiBTd2l0Y2hib2FyZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xyXG5cclxuICAgICAgICB0aGlzLnNreVNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgICAgICAgdGhpcy5sZWZ0U2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgICAgICB0aGlzLnJpZ2h0U2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgICAgICB0aGlzLmdyb3VuZFNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YW50aWFsaWFzOiB0cnVlLCBjYW52YXM6IHRoaXMuY2FudmFzfSk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5hdXRvQ2xlYXIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5odW1hbkdyaWQgPSBuZXcgTGlnaHRpbmdHcmlkKEhwT3JpZW50YXRpb24uRGVjcmVhc2VzUmlnaHRUb0xlZnQsIFJvd0NsZWFyRGlyZWN0aW9uLlJpZ2h0VG9MZWZ0KTtcclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQgPSBuZXcgU3dpdGNoYm9hcmQodGhpcy5odW1hbkdyaWQsIFBsYXllclR5cGUuSHVtYW4pO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkID0gbmV3IExpZ2h0aW5nR3JpZChIcE9yaWVudGF0aW9uLkRlY3JlYXNlc0xlZnRUb1JpZ2h0LCBSb3dDbGVhckRpcmVjdGlvbi5MZWZ0VG9SaWdodCk7XHJcbiAgICAgICAgdGhpcy5haVN3aXRjaGJvYXJkID0gbmV3IFN3aXRjaGJvYXJkKHRoaXMuYWlHcmlkLCBQbGF5ZXJUeXBlLkFpKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmh1bWFuR3JpZC5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5Td2l0Y2hib2FyZC5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5haVN3aXRjaGJvYXJkLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuZG9TdGFydCgpO1xyXG5cclxuICAgICAgICBza3kuc3RhcnQoKTtcclxuICAgICAgICBncm91bmQuc3RhcnQoKTtcclxuICAgICAgICBzdGFuZGVlTWFuYWdlci5zdGFydCgpO1xyXG5cclxuICAgICAgICAvLyBUaGUgY2FudmFzIHNob3VsZCBoYXZlIGJlZW4gaGlkZGVuIHVudGlsIHNldHVwIGlzIGNvbXBsZXRlLlxyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHNreS5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIGdyb3VuZC5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmh1bWFuR3JpZC5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmFpR3JpZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5Td2l0Y2hib2FyZC5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICBzdGFuZGVlTWFuYWdlci5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5za3lTY2VuZSwgY2FtZXJhV3JhcHBlci5jYW1lcmEpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuY2xlYXJEZXB0aCgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMubGVmdFNjZW5lLCBjYW1lcmFXcmFwcGVyLmNhbWVyYSk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5jbGVhckRlcHRoKCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5yaWdodFNjZW5lLCBjYW1lcmFXcmFwcGVyLmNhbWVyYSk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5jbGVhckRlcHRoKCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5ncm91bmRTY2VuZSwgY2FtZXJhV3JhcHBlci5jYW1lcmEpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9TdGFydCgpIHtcclxuICAgICAgICB0aGlzLnNreVNjZW5lLmFkZChza3kuZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VuZFNjZW5lLmFkZChncm91bmQuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kU2NlbmUuYWRkKHN0YW5kZWVNYW5hZ2VyLmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5sZWZ0U2NlbmUuYWRkKHRoaXMuaHVtYW5HcmlkLmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5yaWdodFNjZW5lLmFkZCh0aGlzLmFpR3JpZC5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5haUdyaWQuZ3JvdXAucG9zaXRpb24uc2V0WCgxMSk7XHJcbiAgICAgICAgdGhpcy5haUdyaWQuZ3JvdXAucG9zaXRpb24uc2V0WigxKTtcclxuICAgICAgICB0aGlzLmFpR3JpZC5ncm91cC5yb3RhdGlvbi55ID0gLU1hdGguUEkgLyA0O1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBUZW1wb3JhcnkgZm9yIGRlYnVnZ2luZz9cclxuICAgICAgICAvLyB0aGlzLnNjZW5lLmFkZChuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4NDA0MDQwKSk7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFRlbXBvcmFyeT9cclxuICAgICAgICBsZXQgc3BvdExpZ2h0Q29sb3IgPSAweDk5OTllZTtcclxuICAgICAgICBsZXQgbGVmdFNwb3RMaWdodCA9IG5ldyBUSFJFRS5TcG90TGlnaHQoc3BvdExpZ2h0Q29sb3IpO1xyXG4gICAgICAgIGxlZnRTcG90TGlnaHQucG9zaXRpb24uc2V0KC0zLCAwLjc1LCAyMCk7XHJcbiAgICAgICAgbGVmdFNwb3RMaWdodC50YXJnZXQgPSB0aGlzLmFpR3JpZC5ncm91cDtcclxuICAgICAgICB0aGlzLmxlZnRTY2VuZS5hZGQobGVmdFNwb3RMaWdodCk7XHJcbiAgICAgICAgbGV0IHJpZ2h0U3BvdExpZ2h0ID0gbmV3IFRIUkVFLlNwb3RMaWdodChzcG90TGlnaHRDb2xvcik7XHJcbiAgICAgICAgcmlnaHRTcG90TGlnaHQucG9zaXRpb24uc2V0KDAsIDAuNzUsIDIwKTtcclxuICAgICAgICByaWdodFNwb3RMaWdodC50YXJnZXQgPSB0aGlzLmFpR3JpZC5ncm91cDtcclxuICAgICAgICB0aGlzLnJpZ2h0U2NlbmUuYWRkKHJpZ2h0U3BvdExpZ2h0KTtcclxuXHJcbiAgICAgICAgY2FtZXJhV3JhcHBlci5zZXRQb3NpdGlvbigtMywgMC43NSwgMTUpOyAvLyBNb3JlIG9yIGxlc3MgZXllLWxldmVsIHdpdGggdGhlIE5QQ3MuXHJcbiAgICAgICAgY2FtZXJhV3JhcHBlci5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoNSwgOCwgMikpO1xyXG5cclxuICAgICAgICBjYW1lcmFXcmFwcGVyLnVwZGF0ZVJlbmRlcmVyU2l6ZSh0aGlzLnJlbmRlcmVyKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjYW1lcmFXcmFwcGVyLnVwZGF0ZVJlbmRlcmVyU2l6ZSh0aGlzLnJlbmRlcmVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgdmlldyA9IG5ldyBWaWV3KCk7XHJcbiIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmNsYXNzIEdyb3VuZCB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIGdyYXNzOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgzMDAsIDMwMCk7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2VtaXNzaXZlOiAweDAyMWQwMywgZW1pc3NpdmVJbnRlbnNpdHk6IDEuMH0pO1xyXG4gICAgICAgIHRoaXMuZ3Jhc3MgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMuZ3Jhc3Mucm90YXRpb24ueCA9IChNYXRoLlBJICogMykgLyAyO1xyXG4gICAgICAgIHRoaXMuZ3Jhc3MucG9zaXRpb24uc2V0KDAsIDAsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuZ3Jhc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZ3JvdW5kID0gbmV3IEdyb3VuZCgpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmNvbnN0IFNUQVJUX1pfQU5HTEUgPSAtKE1hdGguUEkgLyAzMCk7XHJcbmNvbnN0IEVORF9aX0FOR0xFICAgPSAgIE1hdGguUEkgLyAzMDtcclxuY29uc3QgUk9UQVRJT05fU1BFRUQgPSAwLjAwMDE7XHJcblxyXG5jbGFzcyBTa3kge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBkb21lOiBhbnk7XHJcbiAgICBwcml2YXRlIHJkejogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDUwLCAzMiwgMzIpOyAvLyBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMTUwLCAxNTAsIDE1MCk7XHJcbiAgICAgICAgbGV0IHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmdlbmVyYXRlVGV4dHVyZSgpKTtcclxuICAgICAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe21hcDogdGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWV9KTtcclxuICAgICAgICB0aGlzLmRvbWUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMuZG9tZS5tYXRlcmlhbC5zaWRlID0gVEhSRUUuQmFja1NpZGU7XHJcbiAgICAgICAgdGhpcy5kb21lLnBvc2l0aW9uLnNldCgxMCwgMTAsIDApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuZG9tZSk7XHJcblxyXG4gICAgICAgIHRoaXMucmR6ID0gLVJPVEFUSU9OX1NQRUVEO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZG9tZS5yb3RhdGlvbi5zZXQoMCwgMCwgU1RBUlRfWl9BTkdMRSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmRvbWUucm90YXRpb24uc2V0KDAsIDAsIHRoaXMuZG9tZS5yb3RhdGlvbi56ICsgdGhpcy5yZHopO1xyXG4gICAgICAgIGlmICh0aGlzLmRvbWUucm90YXRpb24ueiA+PSBFTkRfWl9BTkdMRSkge1xyXG4gICAgICAgICAgICB0aGlzLnJkeiA9IC1ST1RBVElPTl9TUEVFRDtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZG9tZS5yb3RhdGlvbi56IDw9IFNUQVJUX1pfQU5HTEUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZHogPSBST1RBVElPTl9TUEVFRDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlZCBvbjogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTk5OTI1MDVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVRleHR1cmUoKTogYW55IHtcclxuICAgICAgICBsZXQgc2l6ZSA9IDUxMjtcclxuICAgICAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gc2l6ZTtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gc2l6ZTtcclxuICAgICAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgY3R4LnJlY3QoMCwgMCwgc2l6ZSwgc2l6ZSk7XHJcbiAgICAgICAgbGV0IGdyYWRpZW50ID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHNpemUpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjAwLCAnIzAwMDAwMCcpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjQwLCAnIzEzMWM0NScpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjc1LCAnI2ZmOTU0NCcpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjg1LCAnIzEzMWM0NScpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLjAwLCAnIzEzMWM0NScpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBncmFkaWVudDtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgIHJldHVybiBjYW52YXM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHNreSA9IG5ldyBTa3koKTsiXX0=
