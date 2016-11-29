(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var game_state_1 = require('../game-state');
var playing_handler_1 = require('./playing-handler');
var Controller = (function () {
    function Controller() {
    }
    Controller.prototype.start = function () {
        playing_handler_1.playingHandler.start();
    };
    Controller.prototype.step = function (elapsed) {
        switch (game_state_1.gameState.getCurrent()) {
            case 2 /* Intro */:
                // TODO: Do stuff
                break;
            case 3 /* Playing */:
                playing_handler_1.playingHandler.step(elapsed);
                break;
            default:
                console.log('should not get here');
        }
    };
    return Controller;
}());
exports.controller = new Controller();
},{"../game-state":23,"./playing-handler":3}],2:[function(require,module,exports){
/// <reference path='../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var KEY_REPEAT_DELAY_INITIAL = 550;
var KEY_REPEAT_DELAY_CONTINUE = 200;
var Keyboard = (function () {
    function Keyboard() {
        this.keyState = new Map();
        this.previousKeyCode = -1;
        this.currentKeyCode = -1;
        this.keyHeldElapsed = 0;
        this.keyHeldInitial = true;
    }
    Keyboard.prototype.start = function () {
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
    Keyboard.prototype.step = function (elapsed) {
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
    Keyboard.prototype.isDown = function (key) {
        return this.keyState.get(key) === 0 /* Down */;
    };
    /**
     * Return if given key is 'down'. Also sets the key from 'Down' to 'Handling'.
     */
    Keyboard.prototype.isDownAndUnhandled = function (key) {
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
    Keyboard.prototype.isAnyKeyDownAndUnhandled = function () {
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
    Keyboard.prototype.eventToState = function (event, state) {
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
    Keyboard.prototype.keyCodeToKey = function (keyCode) {
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
    Keyboard.prototype.keyToState = function (key, state, event) {
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
    Keyboard.prototype.setState = function (key, state, force) {
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
    return Keyboard;
}());
exports.keyboard = new Keyboard();
},{}],3:[function(require,module,exports){
"use strict";
var keyboard_1 = require('./keyboard');
var event_bus_1 = require('../event/event-bus');
var player_movement_1 = require('../domain/player-movement');
var player_movement_event_1 = require('../event/player-movement-event');
var PlayingHandler = (function () {
    function PlayingHandler() {
    }
    PlayingHandler.prototype.start = function () {
        keyboard_1.keyboard.start();
    };
    PlayingHandler.prototype.step = function (elapsed) {
        keyboard_1.keyboard.step(elapsed);
        if (keyboard_1.keyboard.isDownAndUnhandled(1 /* Up */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.RotateClockwise, 0 /* Human */));
        }
        if (keyboard_1.keyboard.isDownAndUnhandled(0 /* Left */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Left, 0 /* Human */));
        }
        if (keyboard_1.keyboard.isDownAndUnhandled(3 /* Right */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Right, 0 /* Human */));
        }
        if (keyboard_1.keyboard.isDownAndUnhandled(2 /* Down */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Down, 0 /* Human */));
        }
        if (keyboard_1.keyboard.isDownAndUnhandled(4 /* Drop */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Drop, 0 /* Human */));
        }
    };
    return PlayingHandler;
}());
exports.playingHandler = new PlayingHandler();
},{"../domain/player-movement":6,"../event/event-bus":11,"../event/player-movement-event":19,"./keyboard":2}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
"use strict";
exports.PANEL_COUNT_PER_FLOOR = 10;
exports.TIME_UNTIL_EVERYONE_ON_SCREEN = 60 * 1000;
exports.AMBIENCE_NIGHT = 'AMBIENCE_NIGHT';
exports.MUSIC_OPENING = 'MUSIC_OPENING';
exports.MUSIC_MAIN = 'MUSIC_MAIN';
exports.MUSIC_MAIN_VOX = 'MUSIC_MAIN_VOX';
exports.STUDENTS_TALKING = 'STUDENTS_TALKING';
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{"./event-bus":11}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var ActiveShapeEndedEvent = (function (_super) {
    __extends(ActiveShapeEndedEvent, _super);
    function ActiveShapeEndedEvent(playerType, rowIdx) {
        _super.call(this);
        this.playerType = playerType;
        this.rowIdx = rowIdx;
    }
    ActiveShapeEndedEvent.prototype.getType = function () {
        return event_bus_1.EventType.ActiveShapeEndedEventType;
    };
    return ActiveShapeEndedEvent;
}(event_bus_1.AbstractEvent));
exports.ActiveShapeEndedEvent = ActiveShapeEndedEvent;
},{"./event-bus":11}],9:[function(require,module,exports){
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
},{"./event-bus":11}],10:[function(require,module,exports){
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
},{"./event-bus":11}],11:[function(require,module,exports){
"use strict";
(function (EventType) {
    EventType[EventType["ActiveShapeChangedEventType"] = 0] = "ActiveShapeChangedEventType";
    EventType[EventType["ActiveShapeEndedEventType"] = 1] = "ActiveShapeEndedEventType";
    EventType[EventType["BoardFilledEventType"] = 2] = "BoardFilledEventType";
    EventType[EventType["CellChangeEventType"] = 3] = "CellChangeEventType";
    EventType[EventType["FallingSequencerEventType"] = 4] = "FallingSequencerEventType";
    EventType[EventType["GameStateChangedType"] = 5] = "GameStateChangedType";
    EventType[EventType["HpChangedEventType"] = 6] = "HpChangedEventType";
    EventType[EventType["NpcFacingEventType"] = 7] = "NpcFacingEventType";
    EventType[EventType["NpcMovementChangedEventType"] = 8] = "NpcMovementChangedEventType";
    EventType[EventType["NpcPlacedEventType"] = 9] = "NpcPlacedEventType";
    EventType[EventType["NpcStateChagedEventType"] = 10] = "NpcStateChagedEventType";
    EventType[EventType["NpcTeleportedEventType"] = 11] = "NpcTeleportedEventType";
    EventType[EventType["PlayerMovementEventType"] = 12] = "PlayerMovementEventType";
    EventType[EventType["RowsClearAnimationCompletedEventType"] = 13] = "RowsClearAnimationCompletedEventType";
    EventType[EventType["RowsFilledEventType"] = 14] = "RowsFilledEventType";
    EventType[EventType["StandeeMovementEndedEventType"] = 15] = "StandeeMovementEndedEventType";
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
},{}],12:[function(require,module,exports){
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
},{"./event-bus":11}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var GameStateChangedEvent = (function (_super) {
    __extends(GameStateChangedEvent, _super);
    function GameStateChangedEvent(type) {
        _super.call(this);
        this.gameStateType = type;
    }
    GameStateChangedEvent.prototype.getType = function () {
        return event_bus_1.EventType.GameStateChangedType;
    };
    return GameStateChangedEvent;
}(event_bus_1.AbstractEvent));
exports.GameStateChangedEvent = GameStateChangedEvent;
},{"./event-bus":11}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var HpChangedEvent = (function (_super) {
    __extends(HpChangedEvent, _super);
    function HpChangedEvent(hp, playerType, blinkLost) {
        if (blinkLost === void 0) { blinkLost = false; }
        _super.call(this);
        this.hp = hp;
        this.playerType = playerType;
        this.blinkLost = blinkLost;
    }
    HpChangedEvent.prototype.getType = function () {
        return event_bus_1.EventType.HpChangedEventType;
    };
    return HpChangedEvent;
}(event_bus_1.AbstractEvent));
exports.HpChangedEvent = HpChangedEvent;
},{"./event-bus":11}],15:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var NpcFacingEvent = (function (_super) {
    __extends(NpcFacingEvent, _super);
    function NpcFacingEvent(npcId, x, y) {
        _super.call(this);
        this.npcId = npcId;
        this.x = x;
        this.y = y;
    }
    NpcFacingEvent.prototype.getType = function () {
        return event_bus_1.EventType.NpcFacingEventType;
    };
    return NpcFacingEvent;
}(event_bus_1.AbstractEvent));
exports.NpcFacingEvent = NpcFacingEvent;
},{"./event-bus":11}],16:[function(require,module,exports){
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
},{"./event-bus":11}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var NpcPlacedEvent = (function (_super) {
    __extends(NpcPlacedEvent, _super);
    function NpcPlacedEvent(npcId, x, y) {
        _super.call(this);
        this.npcId = npcId;
        this.x = x;
        this.y = y;
    }
    NpcPlacedEvent.prototype.getType = function () {
        return event_bus_1.EventType.NpcPlacedEventType;
    };
    return NpcPlacedEvent;
}(event_bus_1.AbstractEvent));
exports.NpcPlacedEvent = NpcPlacedEvent;
},{"./event-bus":11}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var NpcTeleportedEvent = (function (_super) {
    __extends(NpcTeleportedEvent, _super);
    function NpcTeleportedEvent(npcId, x, y) {
        _super.call(this);
        this.npcId = npcId;
        this.x = x;
        this.y = y;
    }
    NpcTeleportedEvent.prototype.getType = function () {
        return event_bus_1.EventType.NpcTeleportedEventType;
    };
    return NpcTeleportedEvent;
}(event_bus_1.AbstractEvent));
exports.NpcTeleportedEvent = NpcTeleportedEvent;
},{"./event-bus":11}],19:[function(require,module,exports){
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
},{"./event-bus":11}],20:[function(require,module,exports){
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
},{"./event-bus":11}],21:[function(require,module,exports){
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
},{"./event-bus":11}],22:[function(require,module,exports){
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
},{"./event-bus":11}],23:[function(require,module,exports){
"use strict";
var event_bus_1 = require('./event/event-bus');
var game_state_changed_event_1 = require('./event/game-state-changed-event');
var GameState = (function () {
    function GameState() {
        this.current = 0 /* Initializing */; // Default state.
    }
    GameState.prototype.getCurrent = function () {
        return this.current;
    };
    GameState.prototype.setCurrent = function (current) {
        this.current = current;
        event_bus_1.eventBus.fire(new game_state_changed_event_1.GameStateChangedEvent(current));
    };
    return GameState;
}());
exports.gameState = new GameState();
},{"./event/event-bus":11,"./event/game-state-changed-event":13}],24:[function(require,module,exports){
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
    sound_manager_1.soundManager.start();
    controller_1.controller.start();
    view_1.view.start();
    model_1.model.start();
    game_state_1.gameState.setCurrent(2 /* Intro */);
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
},{"./controller/controller":1,"./game-state":23,"./model/model":31,"./preloader":38,"./sound/sound-manager":40,"./view/view":52}],25:[function(require,module,exports){
"use strict";
var constants_1 = require('../../domain/constants');
var event_bus_1 = require('../../event/event-bus');
var vitals_1 = require('../vitals');
var MAX_COLS = constants_1.PANEL_COUNT_PER_FLOOR;
/**
 * How long to wait before manipulating a shape that has just come into play.
 */
var TIME_DELAY = 500;
/**
 * How long to wait before manipulating the shape that is in play.
 */
var TIME_BETWEEN_MOVES = 200;
// These constants are for timing how long to wait before dropping shape, since the start of the shape.
var TIME_FASTEST_TILL_DROP = 2850;
var TIME_SLOWEST_TILL_DROP = 4850;
var RANGE_TIME_TILL_DROP = TIME_SLOWEST_TILL_DROP - TIME_FASTEST_TILL_DROP;
/**
 * Adds some variation to TIME_BETWEEN_MOVES
 */
var TIME_MAX_ADDITIONAL_TIME_BETWEEN_MOVES = 100;
var Ai = (function () {
    function Ai(realBoard) {
        this.realBoard = realBoard;
        this.timeUntilNextMove = this.calculateTimeUntilNextMove();
        this.delayTtl = 0;
        this.timeTillDrop = TIME_SLOWEST_TILL_DROP;
        this.targetRotation = 0;
        this.currentRotation = 0;
        this.targetColIdx = 0;
        this.moveCompleted = false;
    }
    Ai.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.ActiveShapeChangedEventType, function (event) {
            _this.handleActiveShapeChangedEvent(event);
        });
    };
    Ai.prototype.step = function (elapsed) {
        this.timeTillDrop -= elapsed;
        if (this.delayTtl > 0) {
            this.delayTtl -= elapsed;
        }
        else {
            this.timeUntilNextMove -= elapsed;
            if (this.timeUntilNextMove <= 0) {
                this.timeUntilNextMove = this.calculateTimeUntilNextMove();
                this.advanceTowardsTarget();
            }
        }
    };
    /**
     * This method provides a high-level view of the AI's thought process.
     */
    Ai.prototype.strategize = function () {
        // Part 1 - Determine how long this move should be, based on current score.
        {
            // Higher means human is winning.
            var diff = vitals_1.vitals.humanHitPoints - vitals_1.vitals.aiHitPoints;
            var pct = (vitals_1.MAX_HP - diff) / (vitals_1.MAX_HP * 2);
            this.timeTillDrop = TIME_FASTEST_TILL_DROP + (pct * RANGE_TIME_TILL_DROP);
        }
        // Part 2 - Determine how to fit the given shape.
        {
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
            // Finally, set the values that will let the AI advance towards the target.
            this.targetRotation = bestRotation;
            this.currentRotation = 0;
            this.targetColIdx = bestColIdx;
            this.moveCompleted = false;
        }
    };
    Ai.prototype.handleActiveShapeChangedEvent = function (event) {
        if (event.playerType === 1 /* Ai */) {
            if (event.starting === true) {
                this.delayTtl = TIME_DELAY;
            }
        }
        else {
        }
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
            if (this.timeTillDrop <= 0) {
                this.realBoard.moveShapeDownAllTheWay();
                this.currentRotation = 0;
                this.targetColIdx = 0;
                this.moveCompleted = true;
            }
            else {
            }
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
    Ai.prototype.calculateTimeUntilNextMove = function () {
        return Math.floor(TIME_BETWEEN_MOVES + (Math.random() * TIME_MAX_ADDITIONAL_TIME_BETWEEN_MOVES));
    };
    return Ai;
}());
exports.Ai = Ai;
},{"../../domain/constants":5,"../../event/event-bus":11,"../vitals":37}],26:[function(require,module,exports){
"use strict";
var cell_1 = require('../../domain/cell');
var constants_1 = require('../../domain/constants');
var shape_factory_1 = require('./shape-factory');
var event_bus_1 = require('../../event/event-bus');
var cell_change_event_1 = require('../../event/cell-change-event');
var rows_filled_event_1 = require('../../event/rows-filled-event');
var active_shape_changed_event_1 = require('../../event/active-shape-changed-event');
var active_shape_ended_event_1 = require('../../event/active-shape-ended-event');
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
        this.eventBus.fire(new active_shape_ended_event_1.ActiveShapeEndedEvent(this.playerType, this.currentShape.getRow()));
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
            if (this.jiggleRotatedShapeAround() === false) {
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
    /**
     * Returns true if able to successfully rotate the shape alongside anything, if any.
     */
    Board.prototype.jiggleRotatedShapeAround = function () {
        var _this = this;
        var success = false;
        var originalRow = this.currentShape.getRow();
        var originalCol = this.currentShape.getCol();
        if (this.collisionDetected() === false) {
            success = true; // Didn't need to do any jiggling at all.
        }
        else {
            // Jiggle it left.
            if (success !== true) {
                success = this.doUpToThreeTimes(originalRow, originalCol, function () {
                    _this.currentShape.moveLeft();
                });
            }
            // If still unsuccessful, jiggle it right.
            if (success !== true) {
                success = this.doUpToThreeTimes(originalRow, originalCol, function () {
                    _this.currentShape.moveRight();
                });
            }
            ;
            // If still unsuccessful, move it up, up to 4 times.
            if (success !== true) {
                success = this.doUpToThreeTimes(originalRow, originalCol, function () {
                    _this.currentShape.moveUp();
                });
            }
        }
        return success;
    };
    /**
     * Used by jiggleRotatedShapeAround().
     *
     * Sets the current shape to the given original coordinates.
     * Then, runs the given lambda a few times to see if any produce a non-collision state.
     */
    Board.prototype.doUpToThreeTimes = function (originalRow, originalCol, thing) {
        this.currentShape.setRow(originalRow);
        this.currentShape.setCol(originalCol);
        var success = false;
        for (var count = 0; count < 3; count++) {
            thing();
            if (this.collisionDetected() === false) {
                success = true;
                break;
            }
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
},{"../../domain/cell":4,"../../domain/constants":5,"../../event/active-shape-changed-event":7,"../../event/active-shape-ended-event":8,"../../event/board-filled-event":9,"../../event/cell-change-event":10,"../../event/event-bus":11,"../../event/rows-filled-event":21,"./shape-factory":28}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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
},{"./shape":29}],29:[function(require,module,exports){
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
    Shape.prototype.setRow = function (row) {
        this.row = row;
    };
    Shape.prototype.getCol = function () {
        return this.col;
    };
    Shape.prototype.setCol = function (col) {
        this.col = col;
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
},{"../../domain/cell":4}],30:[function(require,module,exports){
"use strict";
var npc_manager_1 = require('./npc/npc-manager');
var IntroActivity = (function () {
    function IntroActivity() {
    }
    IntroActivity.prototype.start = function () {
        this.timeInIntro = 0;
    };
    IntroActivity.prototype.step = function (elapsed) {
        this.timeInIntro += elapsed;
        npc_manager_1.npcManager.step(elapsed); // This is at the point of a game jam where I just cross my fingers and hope some things just work.
        // TODO: Do more in intro.
        if (this.timeInIntro >= 1000) {
            return 3 /* Playing */;
        }
        else {
            return 2 /* Intro */;
        }
    };
    return IntroActivity;
}());
exports.introActivity = new IntroActivity();
},{"./npc/npc-manager":33}],31:[function(require,module,exports){
"use strict";
var game_state_1 = require('../game-state');
var intro_activity_1 = require('./intro-activity');
var playing_activity_1 = require('./playing-activity');
var Model = (function () {
    function Model() {
    }
    Model.prototype.start = function () {
        intro_activity_1.introActivity.start();
        playing_activity_1.playingActivity.start();
    };
    /**
     * Delegate step() to activities.
     * Determine next state from activities.
     */
    Model.prototype.step = function (elapsed) {
        var oldState = game_state_1.gameState.getCurrent();
        var newState;
        switch (oldState) {
            case 2 /* Intro */:
                newState = intro_activity_1.introActivity.step(elapsed);
                break;
            case 3 /* Playing */:
                newState = playing_activity_1.playingActivity.step(elapsed);
                break;
            default:
                console.log('should not get here');
        }
        if (newState !== oldState) {
            game_state_1.gameState.setCurrent(newState);
        }
    };
    return Model;
}());
exports.model = new Model();
},{"../game-state":23,"./intro-activity":30,"./playing-activity":36}],32:[function(require,module,exports){
"use strict";
var game_state_1 = require('../../game-state');
var CrowdStats = (function () {
    function CrowdStats() {
        //
    }
    CrowdStats.prototype.start = function () {
        //
    };
    /**
     * Teleport the NPC somewhere, depending on gameState.
     */
    CrowdStats.prototype.giveInitialDirection = function (npc) {
        switch (game_state_1.gameState.getCurrent()) {
            case 3 /* Playing */:
                this.moveNpcOffScreen(npc);
                break;
            case 2 /* Intro */:
                this.introTeleportOntoWalkway(npc);
                break;
            default:
                console.log('should not get here');
        }
    };
    CrowdStats.prototype.moveNpcOffScreen = function (npc) {
        var offscreen = Math.floor(Math.random() * 2);
        if (offscreen == 0) {
            npc.teleportTo(1 /* OffLeft */);
        }
        else {
            npc.teleportTo(2 /* OffRight */);
        }
    };
    CrowdStats.prototype.introTeleportOntoWalkway = function (npc) {
        var walkway = Math.floor(Math.random() * 3); // 3 = Total number of Building* locations
        switch (walkway) {
            case 0:
                this.introTeleportOntoBuildingLeft(npc);
                break;
            case 1:
                this.introTeleportOntoBuildingRight(npc);
                break;
            case 2:
                this.introTeleportOntoBuildingMiddle(npc);
                break;
            default:
                console.log('should not get here');
        }
    };
    CrowdStats.prototype.introTeleportOntoBuildingLeft = function (npc) {
        npc.teleportTo(3 /* BuildingLeft */);
        var direction = Math.floor(Math.random() * 2);
        if (direction === 0) {
            npc.addWaypoint(1 /* OffLeft */);
        }
        else {
            npc.addWaypoint(5 /* BuildingMiddle */);
            npc.addWaypoint(2 /* OffRight */);
        }
    };
    CrowdStats.prototype.introTeleportOntoBuildingRight = function (npc) {
        npc.teleportTo(4 /* BuildingRight */);
        var direction = Math.floor(Math.random() * 2);
        if (direction === 0) {
            npc.addWaypoint(5 /* BuildingMiddle */);
            npc.addWaypoint(1 /* OffLeft */);
        }
        else {
            npc.addWaypoint(2 /* OffRight */);
        }
    };
    CrowdStats.prototype.introTeleportOntoBuildingMiddle = function (npc) {
        npc.teleportTo(4 /* BuildingRight */);
        var direction = Math.floor(Math.random() * 2);
        if (direction === 0) {
            npc.addWaypoint(1 /* OffLeft */);
        }
        else {
            npc.addWaypoint(2 /* OffRight */);
        }
    };
    /**
     * Tell a waiting NPC what to do, depending on gameState.
     */
    CrowdStats.prototype.giveDirection = function (npc) {
        switch (game_state_1.gameState.getCurrent()) {
            case 2 /* Intro */:
                this.giveDirectionIntro(npc);
                break;
            case 3 /* Playing */:
                this.giveDirectionPlaying(npc);
                break;
            default:
                console.log('should not get here');
        }
    };
    /**
     * Have an offscreen NPC walk to the middle and them back offscreen.
     */
    CrowdStats.prototype.giveDirectionIntro = function (npc) {
        var side = Math.floor(Math.random() * 2);
        if (side === 0) {
            npc.addWaypoint(5 /* BuildingMiddle */);
            npc.addWaypoint(1 /* OffLeft */);
        }
        else {
            npc.addWaypoint(5 /* BuildingMiddle */);
            npc.addWaypoint(2 /* OffRight */);
        }
    };
    CrowdStats.prototype.giveDirectionPlaying = function (npc) {
        var action = Math.floor(Math.random() * 10);
        switch (action) {
            case 0:
            case 1:
            case 2:
            case 3:
                this.giveDirectionPlayingStand(npc);
                break;
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                this.giveDirectionPlayingMove(npc);
                break;
            default:
                console.log('should not get here');
        }
    };
    CrowdStats.prototype.giveDirectionPlayingStand = function (npc) {
        var side = Math.floor(Math.random() * 2);
        if (side === 0) {
            npc.standFacing(1 /* BuildingRight */, 15000);
        }
        else {
            npc.standFacing(0 /* BuildingLeft */, 15000);
        }
    };
    CrowdStats.prototype.giveDirectionPlayingMove = function (npc) {
        var where = Math.floor(Math.random() * 26);
        switch (where) {
            case 0:
                npc.addWaypoint(1 /* OffLeft */);
                break;
            case 1:
                npc.addWaypoint(2 /* OffRight */);
                break;
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                npc.addWaypoint(3 /* BuildingLeft */);
                break;
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
                npc.addWaypoint(4 /* BuildingRight */);
                break;
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
            case 19:
                npc.addWaypoint(5 /* BuildingMiddle */);
                break;
            case 20:
            case 21:
            case 22:
            case 23:
            case 24:
            case 25:
                npc.addWaypoint(6 /* Middle */);
                break;
            default:
                console.log('should not get here');
        }
    };
    return CrowdStats;
}());
exports.crowdStats = new CrowdStats();
},{"../../game-state":23}],33:[function(require,module,exports){
/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var npc_1 = require('./npc');
var event_bus_1 = require('../../event/event-bus');
var release_timer_1 = require('./release-timer');
var crowd_stats_1 = require('./crowd-stats');
var NpcManager = (function () {
    function NpcManager() {
        this.npcs = new Map();
        this.npcsOffscreen = [];
        this.npcsInPlay = [];
    }
    NpcManager.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.StandeeMovementEndedEventType, function (event) {
            _this.handleStandeeMovementEndedEvent(event);
        });
        // TODO: Register listeners for game events, like board collapse or if a shape caused holes.
        var _loop_1 = function(npcIdx) {
            var npc = new npc_1.Npc(function () {
                crowd_stats_1.crowdStats.giveDirection(npc);
            });
            npc.start();
            this_1.npcs.set(npc.id, npc);
            this_1.npcsOffscreen.push(npc);
        };
        var this_1 = this;
        for (var npcIdx = 0; npcIdx < release_timer_1.TOTAL_NPCS; npcIdx++) {
            _loop_1(npcIdx);
        }
        release_timer_1.releaseTimer.start();
        crowd_stats_1.crowdStats.start();
    };
    NpcManager.prototype.step = function (elapsed) {
        var expectedInPlay = release_timer_1.releaseTimer.step(elapsed);
        this.ensureInPlayNpcCount(expectedInPlay);
        this.npcsInPlay.forEach(function (npc) {
            npc.step(elapsed);
        });
    };
    NpcManager.prototype.ensureInPlayNpcCount = function (expectedInPlay) {
        if (this.npcsInPlay.length < expectedInPlay) {
            var diff = expectedInPlay - this.npcsInPlay.length;
            for (var count = 0; count < diff; count++) {
                this.sendAnOffscreenNpcIntoPlay();
            }
        }
    };
    NpcManager.prototype.sendAnOffscreenNpcIntoPlay = function () {
        var npc = this.npcsOffscreen.pop();
        if (npc != null) {
            this.npcsInPlay.push(npc);
            crowd_stats_1.crowdStats.giveInitialDirection(npc);
        }
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
},{"../../event/event-bus":11,"./crowd-stats":32,"./npc":34,"./release-timer":35}],34:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var npc_placed_event_1 = require('../../event/npc-placed-event');
var npc_movement_changed_event_1 = require('../../event/npc-movement-changed-event');
var npc_facing_event_1 = require('../../event/npc-facing-event');
var npc_teleported_event_1 = require('../../event/npc-teleported-event');
var Npc = (function () {
    function Npc(readyForCommandCallback) {
        this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.state = 1 /* WaitingForCommand */;
        this.standingTtl = 0;
        this.waypoints = [];
        this.xlast = 0;
        this.ylast = 0;
        this.readyForCommandCallback = readyForCommandCallback;
    }
    Npc.prototype.start = function () {
        // Place it out of view somewhere.
        this.xlast = -5;
        this.ylast = 15;
        event_bus_1.eventBus.fire(new npc_placed_event_1.NpcPlacedEvent(this.id, this.xlast, this.ylast));
    };
    Npc.prototype.step = function (elapsed) {
        switch (this.state) {
            case 0 /* Walking */:
                this.stepWalking();
                break;
            case 2 /* Standing */:
                this.stepStanding(elapsed);
                break;
            case 1 /* WaitingForCommand */:
                this.stepWaitingForCommand();
                break;
            default:
                console.log('should not get here');
        }
    };
    Npc.prototype.stepWalking = function () {
        // Maybe nothing here.
    };
    Npc.prototype.stepStanding = function (elapsed) {
        this.standingTtl -= elapsed;
        if (this.standingTtl <= 0) {
            this.state = 1 /* WaitingForCommand */;
        }
    };
    Npc.prototype.stepWaitingForCommand = function () {
        if (this.waypoints.length > 0) {
            var nextLocation = this.waypoints.shift();
            this.beginWalkingTo(nextLocation);
        }
        else {
            this.readyForCommandCallback();
        }
    };
    Npc.prototype.standFacing = function (focusPoint, standingTtl) {
        this.state = 2 /* Standing */;
        this.standingTtl = standingTtl;
        if (focusPoint === 0 /* BuildingLeft */) {
            event_bus_1.eventBus.fire(new npc_facing_event_1.NpcFacingEvent(this.id, 5, -3));
        }
        else if (focusPoint === 1 /* BuildingRight */) {
            event_bus_1.eventBus.fire(new npc_facing_event_1.NpcFacingEvent(this.id, 15.5, 5));
        }
    };
    Npc.prototype.addWaypoint = function (location) {
        this.waypoints.push(location);
    };
    /**
     * Signifies the end of a walk. Does not send an event.
     */
    Npc.prototype.updatePosition = function (x, y) {
        this.xlast = x;
        this.ylast = y;
        this.state = 1 /* WaitingForCommand */;
    };
    /**
     * Teleports the NPC to the given location.
     * Sends an event so the standee can be updated.
     */
    Npc.prototype.teleportTo = function (location) {
        var x, y;
        _a = this.generateRandomCoordinates(location), x = _a[0], y = _a[1];
        this.xlast = x;
        this.ylast = y;
        event_bus_1.eventBus.fire(new npc_teleported_event_1.NpcTeleportedEvent(this.id, x, y));
        var _a;
    };
    Npc.prototype.beginWalkingTo = function (location) {
        var x, y;
        _a = this.generateRandomCoordinates(location), x = _a[0], y = _a[1];
        this.state = 0 /* Walking */;
        event_bus_1.eventBus.fire(new npc_movement_changed_event_1.NpcMovementChangedEvent(this.id, x, y));
        var _a;
    };
    Npc.prototype.generateRandomCoordinates = function (location) {
        var x = 0;
        var y = 0;
        switch (location) {
            case 1 /* OffLeft */:
                _a = this.randomWithinRange(-5, 5, 2), x = _a[0], y = _a[1];
                break;
            case 2 /* OffRight */:
                _b = this.randomWithinRange(10, 15, 2), x = _b[0], y = _b[1];
                break;
            case 3 /* BuildingLeft */:
                _c = this.randomWithinRange(5, 4.5, 2), x = _c[0], y = _c[1];
                break;
            case 4 /* BuildingRight */:
                _d = this.randomWithinRange(9, 7.5, 2), x = _d[0], y = _d[1];
                break;
            case 5 /* BuildingMiddle */:
                _e = this.randomWithinRange(10, 2.5, 2), x = _e[0], y = _e[1];
                break;
            case 6 /* Middle */:
                _f = this.randomWithinRange(6, 10, 3), x = _f[0], y = _f[1];
                break;
            default:
                console.log('should not get here');
        }
        return [x, y];
        var _a, _b, _c, _d, _e, _f;
    };
    Npc.prototype.randomWithinRange = function (x, y, variance) {
        var xresult = x - (variance / 2) + (Math.random() * variance);
        var yresult = y - (variance / 2) + (Math.random() * variance);
        return [xresult, yresult];
    };
    return Npc;
}());
exports.Npc = Npc;
},{"../../event/event-bus":11,"../../event/npc-facing-event":15,"../../event/npc-movement-changed-event":16,"../../event/npc-placed-event":17,"../../event/npc-teleported-event":18}],35:[function(require,module,exports){
"use strict";
var game_state_1 = require('../../game-state');
var constants_1 = require('../../domain/constants');
// Starting position counts used in initialization.
exports.TOTAL_NPCS = 40;
var NPCS_PER_SECOND = constants_1.TIME_UNTIL_EVERYONE_ON_SCREEN / exports.TOTAL_NPCS;
var INTRO_STARTING_COUNT = 5;
var ReleaseTimer = (function () {
    function ReleaseTimer() {
        this.introTimeElapsed = 0;
        this.playTimeElapsed = 0;
    }
    ReleaseTimer.prototype.start = function () {
        this.introTimeElapsed = 0;
        this.playTimeElapsed = 0;
    };
    ReleaseTimer.prototype.step = function (elapsed) {
        var expectedInPlay = 0;
        switch (game_state_1.gameState.getCurrent()) {
            case 2 /* Intro */:
                expectedInPlay = this.stepIntro(elapsed);
                break;
            case 3 /* Playing */:
                expectedInPlay = this.stepPlaying(elapsed);
                break;
            default:
                console.log('should not get here');
        }
        return expectedInPlay;
    };
    ReleaseTimer.prototype.stepIntro = function (elapsed) {
        this.introTimeElapsed += elapsed;
        return INTRO_STARTING_COUNT;
    };
    ReleaseTimer.prototype.stepPlaying = function (elapsed) {
        this.playTimeElapsed += elapsed;
        var expectedInPlay = Math.floor(this.playTimeElapsed / NPCS_PER_SECOND);
        if (expectedInPlay > exports.TOTAL_NPCS) {
            expectedInPlay = exports.TOTAL_NPCS;
        }
        return expectedInPlay;
    };
    return ReleaseTimer;
}());
exports.releaseTimer = new ReleaseTimer();
},{"../../domain/constants":5,"../../game-state":23}],36:[function(require,module,exports){
"use strict";
var board_1 = require('./board/board');
var ai_1 = require('./ai/ai');
var npc_manager_1 = require('./npc/npc-manager');
var event_bus_1 = require('../event/event-bus');
var player_movement_1 = require('../domain/player-movement');
var hp_changed_event_1 = require('../event/hp-changed-event');
var shape_factory_1 = require('./board/shape-factory');
var falling_sequencer_1 = require('./board/falling-sequencer');
var falling_sequencer_event_1 = require('../event/falling-sequencer-event');
var vitals_1 = require('./vitals');
var PlayingActivity = (function () {
    function PlayingActivity() {
        var humanShapeFactory = new shape_factory_1.ShapeFactory();
        this.humanBoard = new board_1.Board(0 /* Human */, humanShapeFactory, event_bus_1.eventBus);
        this.humanFallingSequencer = new falling_sequencer_1.FallingSequencer(this.humanBoard);
        var aiShapeFactory = new shape_factory_1.ShapeFactory();
        this.aiBoard = new board_1.Board(1 /* Ai */, aiShapeFactory, event_bus_1.eventBus);
        this.aiFallingSequencer = new falling_sequencer_1.FallingSequencer(this.aiBoard);
        this.ai = new ai_1.Ai(this.aiBoard);
    }
    PlayingActivity.prototype.start = function () {
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
    PlayingActivity.prototype.step = function (elapsed) {
        this.humanBoard.step(elapsed);
        this.humanFallingSequencer.step(elapsed);
        this.aiBoard.step(elapsed);
        this.aiFallingSequencer.step(elapsed);
        this.ai.step(elapsed);
        npc_manager_1.npcManager.step(elapsed);
        return 3 /* Playing */;
    };
    PlayingActivity.prototype.handlePlayerMovement = function (event) {
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
    PlayingActivity.prototype.handleRowsFilledEvent = function (event) {
        var board = this.determineBoardForOppositeOf(event.playerType);
        board.addJunkRows(event.filledRowIdxs.length);
    };
    PlayingActivity.prototype.handleRowClearAnimationCompletedEvent = function (event) {
        var board = this.determineBoardFor(event.playerType);
        board.handleAnyFilledLinesPart2();
    };
    /**
     * Returns the human's board if given the human's type, or AI's board if given the AI.
     */
    PlayingActivity.prototype.determineBoardFor = function (playerType) {
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
    PlayingActivity.prototype.determineBoardForOppositeOf = function (playerType) {
        if (playerType === 0 /* Human */) {
            return this.aiBoard;
        }
        else {
            return this.humanBoard;
        }
    };
    PlayingActivity.prototype.handleBoardFilledEvent = function (event) {
        var board;
        var fallingSequencer;
        var hp;
        if (event.playerType === 0 /* Human */) {
            board = this.humanBoard;
            fallingSequencer = this.humanFallingSequencer;
            hp = (vitals_1.vitals.humanHitPoints -= 2);
        }
        else {
            board = this.aiBoard;
            fallingSequencer = this.aiFallingSequencer;
            hp = (vitals_1.vitals.aiHitPoints -= 2);
        }
        event_bus_1.eventBus.fire(new hp_changed_event_1.HpChangedEvent(hp, event.playerType, true));
        // TODO: See if one of the players has run out of HP, somewhere if not here.
        event_bus_1.eventBus.fire(new falling_sequencer_event_1.FallingSequencerEvent(event.playerType));
        fallingSequencer.resetAndPlay(function () {
            // TODO: I don't know, maybe nothing.
        });
    };
    PlayingActivity.prototype.handleActiveShapeChangedEvent = function (event) {
        if (event.starting === true && event.playerType === 1 /* Ai */) {
            this.ai.strategize();
        }
        else {
        }
    };
    return PlayingActivity;
}());
exports.playingActivity = new PlayingActivity();
},{"../domain/player-movement":6,"../event/event-bus":11,"../event/falling-sequencer-event":12,"../event/hp-changed-event":14,"./ai/ai":25,"./board/board":26,"./board/falling-sequencer":27,"./board/shape-factory":28,"./npc/npc-manager":33,"./vitals":37}],37:[function(require,module,exports){
"use strict";
var constants_1 = require('../domain/constants');
exports.MAX_HP = constants_1.PANEL_COUNT_PER_FLOOR; // HP corresponds to the number of long windows on the second floor of the physical building.
var Vitals = (function () {
    function Vitals() {
        this.humanHitPoints = exports.MAX_HP;
        this.aiHitPoints = exports.MAX_HP;
    }
    return Vitals;
}());
exports.vitals = new Vitals();
},{"../domain/constants":5}],38:[function(require,module,exports){
"use strict";
var standee_animation_texture_base_1 = require('./view/standee/standee-animation-texture-base');
var building_preloader_1 = require('./view/lighting/building-preloader');
var sound_loader_1 = require('./sound/sound-loader');
var Preloader = (function () {
    function Preloader() {
        this.loadingDiv = document.getElementById('loading');
        this.loadingMessage = document.getElementById('loading-message');
        this.loadingError = document.getElementById('loading-error');
        this.loadingBar = document.getElementById('loading-bar');
    }
    Preloader.prototype.preload = function (signalPreloadingComplete) {
        var _this = this;
        var count = 0;
        var total = 0;
        var callWhenFinished = function (success) {
            if (success) {
                count++;
                _this.loadingMessage.textContent = 'Loaded ' + count + ' of ' + total + ' fixtures...';
                if (count >= total) {
                    _this.fadeOut();
                    signalPreloadingComplete();
                    _this.deferredLoad();
                }
                _this.loadingBar.setAttribute('value', String(count));
            }
            else {
                _this.loadingError.textContent = 'Error loading fixtures. Please reload if you would like to retry.';
            }
        };
        total += standee_animation_texture_base_1.standeeAnimationTextureBase.preload(function (success) {
            callWhenFinished(success);
        });
        total += building_preloader_1.buildingPreloader.preload(function (success) {
            callWhenFinished(success);
        });
        total += sound_loader_1.soundLoader.preload(function (success) {
            callWhenFinished(success);
        });
        this.loadingBar.setAttribute('max', String(total));
    };
    Preloader.prototype.fadeOut = function () {
        var _this = this;
        this.loadingDiv.style.opacity = '0';
        this.loadingDiv.style.transition = 'opacity 1s';
        setTimeout(function () {
            _this.loadingDiv.style.display = 'none';
        }, 1250); // Just a little bit longer than transition time.
    };
    /**
     * Load more fixtures that will not be needed immediately.
     */
    Preloader.prototype.deferredLoad = function () {
        sound_loader_1.soundLoader.deferredLoad();
    };
    return Preloader;
}());
exports.preloader = new Preloader();
},{"./sound/sound-loader":39,"./view/lighting/building-preloader":42,"./view/standee/standee-animation-texture-base":48}],39:[function(require,module,exports){
"use strict";
var sound_manager_1 = require('./sound-manager');
var constants_1 = require('../domain/constants');
// 1) Ambience - Night
// 2) Music - Opening
var FILES_TO_PRELOAD = 2;
var SoundLoader = (function () {
    function SoundLoader() {
    }
    SoundLoader.prototype.preload = function (signalOneFileLoaded) {
        {
            var ambienceNightHowl_1 = new Howl({
                src: ['ambience-night.m4a'],
                volume: 0.33
            });
            ambienceNightHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.AMBIENCE_NIGHT, ambienceNightHowl_1);
                signalOneFileLoaded(true);
            });
            ambienceNightHowl_1.once('loaderror', function () {
                signalOneFileLoaded(false);
            });
        }
        {
            var musicOpeningHowl_1 = new Howl({
                src: ['music-opening.m4a'],
                volume: 0.5
            });
            musicOpeningHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.MUSIC_OPENING, musicOpeningHowl_1);
                signalOneFileLoaded(true);
            });
            musicOpeningHowl_1.once('loaderror', function () {
                signalOneFileLoaded(false);
            });
        }
        return FILES_TO_PRELOAD;
    };
    SoundLoader.prototype.deferredLoad = function () {
        {
            var musicMainHowl_1 = new Howl({
                src: ['music-main.m4a'],
                volume: 0.7
            });
            musicMainHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.MUSIC_MAIN, musicMainHowl_1);
            });
        }
        {
            var musicMainVoxHowl_1 = new Howl({
                src: ['music-main-vox.m4a'],
                volume: 0.7
            });
            musicMainVoxHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.MUSIC_MAIN_VOX, musicMainVoxHowl_1);
            });
        }
        {
            var studentsTalkingHowl_1 = new Howl({
                src: ['students-talking.m4a'],
                volume: 0.0
            });
            studentsTalkingHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.STUDENTS_TALKING, studentsTalkingHowl_1);
            });
        }
    };
    return SoundLoader;
}());
exports.soundLoader = new SoundLoader();
},{"../domain/constants":5,"./sound-manager":40}],40:[function(require,module,exports){
/// <reference path='../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var event_bus_1 = require('../event/event-bus');
var constants_1 = require('../domain/constants');
var SOUND_KEY = '129083190-falling-sound';
var SoundManager = (function () {
    function SoundManager() {
        var _this = this;
        this.soundToggleSection = document.getElementById('sound-toggle-section');
        this.soundToggleElement = document.getElementById('sound-toggle');
        this.soundToggleElement.onclick = function () {
            _this.updateSoundSetting(!_this.soundToggleElement.checked);
        };
        this.howls = new Map();
    }
    /**
     * Should occur before preloading so the player sees the right option immediately.
     */
    SoundManager.prototype.attach = function () {
        this.updateSoundSetting();
    };
    SoundManager.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.GameStateChangedType, function (event) {
            switch (event.gameStateType) {
                case 2 /* Intro */:
                    _this.cueIntroSounds();
                    break;
                case 3 /* Playing */:
                    _this.cuePlayingSounds();
                    break;
            }
        });
    };
    SoundManager.prototype.step = function (elapsed) {
        //
    };
    SoundManager.prototype.cacheHowl = function (key, value) {
        this.howls.set(key, value);
    };
    /**
     * Part 2 is done off the main execution path, in case the user has client-side storage turned off.
     */
    SoundManager.prototype.updateSoundSetting = function (mute) {
        var _this = this;
        // Part 1: Update Howler
        if (mute == null) {
            // Default to sound on, in case the second part fails.
            this.soundToggleElement.checked = true;
        }
        else {
            var soundValue = void 0;
            if (mute) {
                soundValue = 'off';
            }
            else {
                soundValue = 'on';
            }
            Howler.mute(mute);
        }
        // Part 2: Update session storage
        setTimeout(function () {
            _this.soundToggleElement.removeAttribute('disabled');
            if (mute == null) {
                var soundValue = sessionStorage.getItem(SOUND_KEY);
                if (soundValue === 'off') {
                    _this.soundToggleElement.checked = false;
                    Howler.mute(true);
                }
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
        }, 0);
    };
    SoundManager.prototype.cueIntroSounds = function () {
        var ambienceNightHowl = this.howls.get(constants_1.AMBIENCE_NIGHT);
        ambienceNightHowl.loop(true);
        ambienceNightHowl.play();
        var musicOpeningHowl = this.howls.get(constants_1.MUSIC_OPENING);
        musicOpeningHowl.loop(true);
        musicOpeningHowl.play();
    };
    /**
     * Once loaded, have the main music play after the intro music completes its current loop.
     * Also have the students talking start to play.
     */
    SoundManager.prototype.cuePlayingSounds = function () {
        var _this = this;
        var musicMainHowl = this.howls.get(constants_1.MUSIC_MAIN);
        var musicMainHowlVox = this.howls.get(constants_1.MUSIC_MAIN_VOX);
        if (musicMainHowl != null && musicMainHowlVox != null) {
            var musicOpeningHowl_1 = this.howls.get(constants_1.MUSIC_OPENING);
            musicOpeningHowl_1.loop(false);
            musicOpeningHowl_1.once('end', function () {
                musicOpeningHowl_1.unload();
                _this.chainMusicMain();
                // Also start the students talking.
                _this.cueStudentsTalkingSounds();
            });
        }
        else {
            // Not loaded yet, try again in a second.
            setTimeout(function () { return _this.cuePlayingSounds(); }, 1000);
        }
    };
    /**
     * Start this at a zero volume and gradually increase to about half volume.
     */
    SoundManager.prototype.cueStudentsTalkingSounds = function () {
        var _this = this;
        var studentsTalkingHowl = this.howls.get(constants_1.STUDENTS_TALKING);
        if (studentsTalkingHowl != null) {
            studentsTalkingHowl.loop(true);
            studentsTalkingHowl.fade(0.0, 0.4, constants_1.TIME_UNTIL_EVERYONE_ON_SCREEN);
            studentsTalkingHowl.play();
        }
        else {
            // Not loaded yet, try again in a second.
            setTimeout(function () { return _this.cueStudentsTalkingSounds(); }, 1000);
        }
    };
    SoundManager.prototype.chainMusicMain = function () {
        var _this = this;
        var musicMainHowl = this.howls.get(constants_1.MUSIC_MAIN);
        musicMainHowl.play();
        musicMainHowl.once('end', function () { return _this.chainMusicMainVox(); });
    };
    SoundManager.prototype.chainMusicMainVox = function () {
        var _this = this;
        var musicMainHowlVox = this.howls.get(constants_1.MUSIC_MAIN_VOX);
        musicMainHowlVox.play();
        musicMainHowlVox.once('end', function () { return _this.chainMusicMain(); });
    };
    return SoundManager;
}());
exports.soundManager = new SoundManager();
},{"../domain/constants":5,"../event/event-bus":11}],41:[function(require,module,exports){
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
    return CameraWrapper;
}());
exports.cameraWrapper = new CameraWrapper();
},{}],42:[function(require,module,exports){
"use strict";
// mtl and obj = 2 files.
var FILES_TO_PRELOAD = 2;
var BuildingPreloader = (function () {
    function BuildingPreloader() {
        this.instances = [];
        this.instancesRequested = 0;
    }
    BuildingPreloader.prototype.preload = function (signalOneFileLoaded) {
        var _this = this;
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('');
        mtlLoader.load('green-building.mtl', function (materials) {
            materials.preload();
            signalOneFileLoaded(true);
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('');
            objLoader.load('green-building.obj', function (obj) {
                _this.instances.push(obj);
                signalOneFileLoaded(true);
            }, undefined, function () { signalOneFileLoaded(false); });
        }, undefined, function () { signalOneFileLoaded(false); });
        return FILES_TO_PRELOAD;
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
},{}],43:[function(require,module,exports){
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
        // Quick hack to prevent building from being see-through.
        var geometry = new THREE.PlaneGeometry(9, 3);
        var material = new THREE.MeshLambertMaterial({ color: 0x343330 });
        var wall = new THREE.Mesh(geometry, material);
        wall.position.set(5, 1, -3.5);
        this.group.add(wall);
    };
    Building.prototype.step = function (elapsed) {
        //
    };
    return Building;
}());
exports.Building = Building;
},{"./building-preloader":42}],44:[function(require,module,exports){
"use strict";
var constants_1 = require('../../domain/constants');
var MAX_CURTAIN_COUNT = 4;
var CURTAIN_WIDTH = constants_1.PANEL_COUNT_PER_FLOOR;
var CURTAIN_MOVE_TIME = 750;
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
            var material = new THREE.MeshPhongMaterial({ color: 0x070716 }); // Midnight Blue
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
},{"../../domain/constants":5}],45:[function(require,module,exports){
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
            var x = void 0;
            if (hpOrientation === 0 /* DecreasesRightToLeft */) {
                x = idx;
            }
            else {
                x = constants_1.PANEL_COUNT_PER_FLOOR - idx - 1;
            }
            var y = 0;
            var z = 0;
            panel.position.set(x, y, z);
            panel.visible = false;
            // TODO: Make this pulse at all?
            panel.material.emissive.setHex(0xeeee00);
            panel.material.emissiveIntensity = 0.5;
            this.panels.push(panel);
        }
    }
    HpPanels.prototype.start = function () {
        for (var _i = 0, _a = this.panels; _i < _a.length; _i++) {
            var panel = _a[_i];
            this.group.add(panel);
        }
        // Transform to fit against building.
        this.group.position.set(1.85, 3.55, -1.5);
        this.group.scale.set(0.7, 1.9, 1);
        this.updateHp(constants_1.PANEL_COUNT_PER_FLOOR, false);
    };
    HpPanels.prototype.step = function (elapsed) {
        //
    };
    /**
     * HP bar can go from right-to-left or left-to-right, like a fighting game HP bar.
     * "blinkLost" means to animate the loss of the HP panels directly above.
     */
    HpPanels.prototype.updateHp = function (hp, blinkLost) {
        if (hp > constants_1.PANEL_COUNT_PER_FLOOR) {
            hp = constants_1.PANEL_COUNT_PER_FLOOR;
        }
        for (var idx = 0; idx < this.panels.length; idx++) {
            var panel = this.panels[idx];
            if (idx < hp) {
                panel.visible = true;
            }
            else {
                panel.visible = false;
            }
        }
        // Blink the lost panels, if any, to give the player the impression that they lost something.
        if (blinkLost === true && hp >= 0 && hp < this.panels.length - 1) {
            var idx = hp; // As in the next index up from the current HP index, since array start at 0.
            var panel1_1 = this.panels[idx];
            var panel2_1 = this.panels[idx + 1];
            var count_1 = 0;
            var blinkHandle_1 = setInterval(function () {
                count_1++;
                if (count_1 > 15) {
                    panel1_1.visible = false;
                    panel2_1.visible = false;
                    clearInterval(blinkHandle_1);
                }
                else {
                    panel1_1.visible = !panel1_1.visible;
                    panel2_1.visible = !panel2_1.visible;
                }
            }, 200);
        }
        // TODO: Handle update to HP = full as different from HP < full.
    };
    return HpPanels;
}());
exports.HpPanels = HpPanels;
},{"../../domain/constants":5}],46:[function(require,module,exports){
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
    LightingGrid.prototype.updateHp = function (hp, blinkLost) {
        this.hpPanels.updateHp(hp, blinkLost);
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
},{"../../domain/constants":5,"./building":43,"./curtain":44,"./hp-panels":45}],47:[function(require,module,exports){
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
        this.lightingGrid.updateHp(event.hp, event.blinkLost);
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
},{"../../event/event-bus":11,"../../event/rows-clear-animation-completed-event":20,"./lighting-grid":46}],48:[function(require,module,exports){
"use strict";
// Dimensions of the entire spritesheet:
exports.SPRITESHEET_WIDTH = 256;
exports.SPRITESHEET_HEIGHT = 512;
// Dimensions of one frame within the spritesheet:
exports.FRAME_WIDTH = 48;
exports.FRAME_HEIGHT = 72;
var FILES_TO_PRELOAD = 3;
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
    StandeeAnimationTextureBase.prototype.preload = function (signalThatOneTextureWasLoaded) {
        var _this = this;
        var textureLoadedHandler = function (texture) {
            // Have it show only one frame at a time:
            texture.repeat.set(exports.FRAME_WIDTH / exports.SPRITESHEET_WIDTH, exports.FRAME_HEIGHT / exports.SPRITESHEET_HEIGHT);
            _this.textures.push(texture);
            _this.loadedCount++;
            signalThatOneTextureWasLoaded(true);
        };
        var errorHandler = function () {
            signalThatOneTextureWasLoaded(false);
        };
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load('fall-student.png', textureLoadedHandler, undefined, errorHandler);
        textureLoader.load('fall-student2.png', textureLoadedHandler, undefined, errorHandler);
        textureLoader.load('fall-student3.png', textureLoadedHandler, undefined, errorHandler);
        return FILES_TO_PRELOAD;
    };
    StandeeAnimationTextureBase.prototype.newInstance = function () {
        var idx = this.getNextTextureIdx();
        var texture = this.textures[idx].clone(); // Cloning textures in the version of ThreeJS that I am currently using will duplicate them :(
        texture.needsUpdate = true;
        return new StandeeAnimationTextureWrapper(texture);
    };
    StandeeAnimationTextureBase.prototype.getNextTextureIdx = function () {
        this.currentTextureIdx++;
        if (this.currentTextureIdx >= FILES_TO_PRELOAD) {
            this.currentTextureIdx = 0;
        }
        return this.currentTextureIdx;
    };
    return StandeeAnimationTextureBase;
}());
exports.standeeAnimationTextureBase = new StandeeAnimationTextureBase();
},{}],49:[function(require,module,exports){
"use strict";
var standee_1 = require('./standee');
var event_bus_1 = require('../../event/event-bus');
var Y_OFFSET = 0.75; // Sets their feet on the ground plane.
var STANDEE_SPEED = 0.5;
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
        event_bus_1.eventBus.register(event_bus_1.EventType.NpcTeleportedEventType, function (event) {
            _this.handleNpcTeleportedEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.NpcMovementChangedEventType, function (event) {
            _this.handleNpcMovementChangedEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.NpcFacingEventType, function (event) {
            _this.handleNpcFacingEvent(event);
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
        this.moveToPosition(standee, x, z);
    };
    StandeeManager.prototype.handleNpcTeleportedEvent = function (event) {
        var standee = this.standees.get(event.npcId);
        if (standee != null) {
            var x = event.x;
            var z = event.y;
            this.moveToPosition(standee, x, z);
        }
    };
    StandeeManager.prototype.moveToPosition = function (standee, x, z) {
        standee.moveTo(x, z);
    };
    StandeeManager.prototype.handleNpcMovementChangedEvent = function (event) {
        var standee = this.standees.get(event.npcId);
        if (standee != null) {
            var x = event.x;
            var z = event.y;
            standee.walkTo(x, z, STANDEE_SPEED);
        }
    };
    StandeeManager.prototype.handleNpcFacingEvent = function (event) {
        var standee = this.standees.get(event.npcId);
        if (standee != null) {
            var x = event.x;
            var z = event.y;
            standee.lookAt(x, z);
        }
    };
    return StandeeManager;
}());
exports.standeeManager = new StandeeManager();
},{"../../event/event-bus":11,"./standee":51}],50:[function(require,module,exports){
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
        // Half size them and position their feet on the ground.
        this.group.scale.set(0.5, 0.5, 0.5);
        this.group.position.set(0, -0.4, 0);
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
},{"../camera-wrapper":41,"./standee-animation-texture-base":48}],51:[function(require,module,exports){
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
    Standee.prototype.lookAt = function (x, z) {
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
},{"../../event/event-bus":11,"../../event/standee-movement-ended-event":22,"../camera-wrapper":41,"./standee-sprite-wrapper":50}],52:[function(require,module,exports){
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
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
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
        this.canvas.style.opacity = '1';
        this.canvas.style.transition = 'opacity 2s';
    };
    View.prototype.step = function (elapsed) {
        sky_1.sky.step(elapsed);
        ground_1.ground.step(elapsed);
        this.humanSwitchboard.step(elapsed);
        this.humanGrid.step(elapsed);
        this.aiGrid.step(elapsed);
        this.humanSwitchboard.step(elapsed);
        standee_manager_1.standeeManager.step(elapsed);
        this.renderer.render(this.scene, camera_wrapper_1.cameraWrapper.camera);
    };
    View.prototype.doStart = function () {
        var _this = this;
        this.scene.add(sky_1.sky.group);
        this.scene.add(ground_1.ground.group);
        this.scene.add(standee_manager_1.standeeManager.group);
        this.scene.add(this.humanGrid.group);
        this.scene.add(this.aiGrid.group);
        this.aiGrid.group.position.setX(12);
        this.aiGrid.group.position.setZ(-2);
        this.aiGrid.group.rotation.y = -Math.PI / 3.5;
        var spotLightColor = 0x9999ee;
        var spotLight = new THREE.SpotLight(spotLightColor);
        spotLight.position.set(-3, 0.75, 20);
        spotLight.target = this.aiGrid.group;
        this.scene.add(spotLight);
        camera_wrapper_1.cameraWrapper.camera.position.set(5, 0.4, 15);
        camera_wrapper_1.cameraWrapper.camera.lookAt(new THREE.Vector3(6, 6.5, 2));
        camera_wrapper_1.cameraWrapper.updateRendererSize(this.renderer);
        window.addEventListener('resize', function () {
            camera_wrapper_1.cameraWrapper.updateRendererSize(_this.renderer);
        });
        // this.addDebugBox();
    };
    return View;
}());
exports.view = new View();
},{"./camera-wrapper":41,"./lighting/lighting-grid":46,"./lighting/switchboard":47,"./standee/standee-manager":49,"./world/ground":53,"./world/sky":54}],53:[function(require,module,exports){
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
},{}],54:[function(require,module,exports){
"use strict";
var START_Z_ANGLE = -(Math.PI / 30);
var END_Z_ANGLE = Math.PI / 30;
var ROTATION_SPEED = 0.0005;
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
},{}]},{},[24])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2NvbnRyb2xsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2tleWJvYXJkLnRzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlci9wbGF5aW5nLWhhbmRsZXIudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vY2VsbC50cyIsInNyYy9zY3JpcHRzL2RvbWFpbi9jb25zdGFudHMudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vcGxheWVyLW1vdmVtZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9hY3RpdmUtc2hhcGUtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ib2FyZC1maWxsZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9jZWxsLWNoYW5nZS1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2V2ZW50LWJ1cy50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2ZhbGxpbmctc2VxdWVuY2VyLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvZ2FtZS1zdGF0ZS1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvaHAtY2hhbmdlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy1mYWNpbmctZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ucGMtdGVsZXBvcnRlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3Jvd3MtY2xlYXItYW5pbWF0aW9uLWNvbXBsZXRlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L3Jvd3MtZmlsbGVkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvc3RhbmRlZS1tb3ZlbWVudC1lbmRlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2dhbWUtc3RhdGUudHMiLCJzcmMvc2NyaXB0cy9tYWluLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYWkvYWkudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ib2FyZC9ib2FyZC50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL2ZhbGxpbmctc2VxdWVuY2VyLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvc2hhcGUtZmFjdG9yeS50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL3NoYXBlLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvaW50cm8tYWN0aXZpdHkudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9tb2RlbC50cyIsInNyYy9zY3JpcHRzL21vZGVsL25wYy9jcm93ZC1zdGF0cy50cyIsInNyYy9zY3JpcHRzL21vZGVsL25wYy9ucGMtbWFuYWdlci50cyIsInNyYy9zY3JpcHRzL21vZGVsL25wYy9ucGMudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvcmVsZWFzZS10aW1lci50cyIsInNyYy9zY3JpcHRzL21vZGVsL3BsYXlpbmctYWN0aXZpdHkudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC92aXRhbHMudHMiLCJzcmMvc2NyaXB0cy9wcmVsb2FkZXIudHMiLCJzcmMvc2NyaXB0cy9zb3VuZC9zb3VuZC1sb2FkZXIudHMiLCJzcmMvc2NyaXB0cy9zb3VuZC9zb3VuZC1tYW5hZ2VyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9jYW1lcmEtd3JhcHBlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvYnVpbGRpbmctcHJlbG9hZGVyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9idWlsZGluZy50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvY3VydGFpbi50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvaHAtcGFuZWxzLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9saWdodGluZy1ncmlkLnRzIiwic3JjL3NjcmlwdHMvdmlldy9saWdodGluZy9zd2l0Y2hib2FyZC50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1tYW5hZ2VyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUtc3ByaXRlLXdyYXBwZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS50cyIsInNyYy9zY3JpcHRzL3ZpZXcvdmlldy50cyIsInNyYy9zY3JpcHRzL3ZpZXcvd29ybGQvZ3JvdW5kLnRzIiwic3JjL3NjcmlwdHMvdmlldy93b3JsZC9za3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUEsMkJBQXVDLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZELGdDQUE2QixtQkFBbUIsQ0FBQyxDQUFBO0FBRWpEO0lBQUE7SUFrQkEsQ0FBQztJQWhCRywwQkFBSyxHQUFMO1FBQ0ksZ0NBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQseUJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsTUFBTSxDQUFDLENBQUMsc0JBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsS0FBSyxhQUFtQjtnQkFDcEIsaUJBQWlCO2dCQUNqQixLQUFLLENBQUM7WUFDVixLQUFLLGVBQXFCO2dCQUN0QixnQ0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDN0IsS0FBSyxDQUFDO1lBQ1Y7Z0JBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzNDLENBQUM7SUFDTCxDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQWxCQSxBQWtCQyxJQUFBO0FBQ1ksa0JBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOztBQ3RCM0MseUVBQXlFOztBQXFCekUsSUFBTSx3QkFBd0IsR0FBSSxHQUFHLENBQUM7QUFDdEMsSUFBTSx5QkFBeUIsR0FBRyxHQUFHLENBQUM7QUFFdEM7SUFRSTtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQWEsQ0FBQztRQUNyQyxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUVELHdCQUFLLEdBQUw7UUFBQSxpQkFPQztRQU5HLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBQyxLQUFLO1lBQ3JDLEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFlBQVUsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFDLEtBQUs7WUFDbkMsS0FBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsVUFBUSxDQUFDLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsdUJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsY0FBYyxJQUFJLE9BQU8sQ0FBQztZQUUvQixJQUFJLFdBQVcsU0FBUyxDQUFDO1lBQ3pCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksd0JBQXdCLENBQUMsQ0FBQyxDQUFDO2dCQUNsRixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hCLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDdkIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLHlCQUF5QixDQUFDLENBQUMsQ0FBQztnQkFDM0YsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hCLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDdkIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsWUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pDLENBQUM7UUFDTCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUMvQixDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gseUJBQU0sR0FBTixVQUFPLEdBQVE7UUFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssWUFBVSxDQUFDO0lBQ2pELENBQUM7SUFFRDs7T0FFRztJQUNILHFDQUFrQixHQUFsQixVQUFtQixHQUFRO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxnQkFBYyxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsb0RBQW9EO1FBQ3RFLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILDJDQUF3QixHQUF4QjtRQUFBLGlCQVNDO1FBUkcsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBWSxFQUFFLEdBQVE7WUFDekMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLFlBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLEtBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxnQkFBYyxDQUFDLENBQUM7Z0JBQ3ZDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdEIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRU8sK0JBQVksR0FBcEIsVUFBcUIsS0FBb0IsRUFBRSxLQUFZO1FBQ25ELEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxZQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUN4QyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxVQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTywrQkFBWSxHQUFwQixVQUFxQixPQUFlO1FBQ2hDLElBQUksR0FBRyxHQUFHLGFBQVMsQ0FBQztRQUVwQixNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2Qsa0VBQWtFO1lBQ2xFLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTTtZQUNmLEtBQUssRUFBRTtnQkFDSCxHQUFHLEdBQUcsWUFBUSxDQUFDO2dCQUNmLEtBQUssQ0FBQztZQUNWLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTTtZQUNmLEtBQUssRUFBRTtnQkFDSCxHQUFHLEdBQUcsVUFBTSxDQUFDO2dCQUNiLEtBQUssQ0FBQztZQUNWLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTTtZQUNmLEtBQUssRUFBRTtnQkFDSCxHQUFHLEdBQUcsYUFBUyxDQUFDO2dCQUNoQixLQUFLLENBQUM7WUFDVixLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU07WUFDZixLQUFLLEVBQUU7Z0JBQ0gsR0FBRyxHQUFHLFlBQVEsQ0FBQztnQkFDZixLQUFLLENBQUM7WUFDVixLQUFLLEVBQUU7Z0JBQ0gsR0FBRyxHQUFHLFlBQVEsQ0FBQztnQkFDZixLQUFLLENBQUM7WUFFVixrRUFBa0U7WUFDbEUsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNO1lBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNO1lBQ2YsS0FBSyxFQUFFO2dCQUNILEdBQUcsR0FBRyxhQUFTLENBQUM7Z0JBQ2hCLEtBQUssQ0FBQztZQUVWLGtFQUFrRTtZQUNsRSxLQUFLLEVBQUUsQ0FBQyxDQUFJLE1BQU07WUFDbEIsS0FBSyxFQUFFLENBQUMsQ0FBSSxNQUFNO1lBQ2xCLEtBQUssR0FBRyxDQUFDLENBQUcsMEJBQTBCO1lBQ3RDLEtBQUssRUFBRSxDQUFDLENBQUksd0JBQXdCO1lBQ3BDLEtBQUssRUFBRSxDQUFDLENBQUksc0NBQXNDO1lBQ2xELEtBQUssRUFBRSxDQUFDLENBQUksdUNBQXVDO1lBQ25ELEtBQUssRUFBRSxDQUFDLENBQUksNkJBQTZCO1lBQ3pDLEtBQUssRUFBRSxDQUFDLENBQUksZ0NBQWdDO1lBQzVDLEtBQUssR0FBRyxDQUFDLENBQUcsZ0JBQWdCO1lBQzVCLEtBQUssR0FBRztnQkFDSixHQUFHLEdBQUcsY0FBVSxDQUFDO2dCQUNqQixLQUFLLENBQUM7WUFFVixrRUFBa0U7WUFDbEUsS0FBSyxHQUFHLENBQUMsQ0FBRyw0QkFBNEI7WUFDeEMsS0FBSyxDQUFDLENBQUMsQ0FBSyx1QkFBdUI7WUFDbkMsS0FBSyxFQUFFO2dCQUNILEdBQUcsR0FBRyxlQUFXLENBQUM7Z0JBQ2xCLEtBQUssQ0FBQztZQUVWLGtFQUFrRTtZQUNsRTtnQkFDSSxHQUFHLEdBQUcsYUFBUyxDQUFDO1FBQ3hCLENBQUM7UUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVPLDZCQUFVLEdBQWxCLFVBQW1CLEdBQVEsRUFBRSxLQUFZLEVBQUUsS0FBb0I7UUFDM0QsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBRTNCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDVixLQUFLLFlBQVE7Z0JBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQy9CLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLEtBQUssQ0FBQztZQUNWLEtBQUssVUFBTTtnQkFDUCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDN0IsOEVBQThFO2dCQUM5RSxLQUFLLENBQUM7WUFDVixLQUFLLGFBQVM7Z0JBQ1YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLEtBQUssQ0FBQztZQUNWLEtBQUssWUFBUTtnQkFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0IsY0FBYyxHQUFHLElBQUksQ0FBQztnQkFDdEIsS0FBSyxDQUFDO1lBQ1YsS0FBSyxZQUFRO2dCQUNULElBQUksQ0FBQyxRQUFRLENBQUMsWUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMvQixjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixLQUFLLENBQUM7WUFDVixLQUFLLGFBQVM7Z0JBQ1YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLEtBQUssQ0FBQztZQUNWLHlDQUF5QztZQUN6QyxLQUFLLGNBQVU7Z0JBQ1gsS0FBSyxDQUFDO1lBQ1YsS0FBSyxlQUFXO2dCQUNaLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLEtBQUssQ0FBQztZQUNWLEtBQUssYUFBUyxDQUFDO1lBQ2Y7Z0JBQ0ksSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLGNBQWMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMzQixDQUFDO0lBQ0wsQ0FBQztJQUVPLDJCQUFRLEdBQWhCLFVBQWlCLEdBQVEsRUFBRSxLQUFZLEVBQUUsS0FBYTtRQUFiLHFCQUFhLEdBQWIsYUFBYTtRQUNsRCxrQkFBa0I7UUFDbEIsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLFVBQVEsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWxDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLFlBQVUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssZ0JBQWMsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUNMLGVBQUM7QUFBRCxDQXpOQSxBQXlOQyxJQUFBO0FBRVksZ0JBQVEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDOzs7QUNuUHZDLHlCQUE0QixZQUFZLENBQUMsQ0FBQTtBQUN6QywwQkFBdUIsb0JBQW9CLENBQUMsQ0FBQTtBQUM1QyxnQ0FBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUV6RCxzQ0FBa0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUVuRTtJQUFBO0lBNkJBLENBQUM7SUEzQkcsOEJBQUssR0FBTDtRQUNJLG1CQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELDZCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLG1CQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXZCLEVBQUUsQ0FBQyxDQUFDLG1CQUFRLENBQUMsa0JBQWtCLENBQUMsVUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLG9CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksMkNBQW1CLENBQUMsZ0NBQWMsQ0FBQyxlQUFlLEVBQUUsYUFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLG1CQUFRLENBQUMsa0JBQWtCLENBQUMsWUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLG9CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksMkNBQW1CLENBQUMsZ0NBQWMsQ0FBQyxJQUFJLEVBQUUsYUFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLG1CQUFRLENBQUMsa0JBQWtCLENBQUMsYUFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLG9CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksMkNBQW1CLENBQUMsZ0NBQWMsQ0FBQyxLQUFLLEVBQUUsYUFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLG1CQUFRLENBQUMsa0JBQWtCLENBQUMsWUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLG9CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksMkNBQW1CLENBQUMsZ0NBQWMsQ0FBQyxJQUFJLEVBQUUsYUFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLG1CQUFRLENBQUMsa0JBQWtCLENBQUMsWUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLG9CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksMkNBQW1CLENBQUMsZ0NBQWMsQ0FBQyxJQUFJLEVBQUUsYUFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQztJQUNMLENBQUM7SUFDTCxxQkFBQztBQUFELENBN0JBLEFBNkJDLElBQUE7QUFDWSxzQkFBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7OztBQ2xDbkQ7SUFHSTtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsYUFBVyxDQUFDO0lBQzdCLENBQUM7SUFFRCx1QkFBUSxHQUFSLFVBQVMsS0FBWTtRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBRUQsdUJBQVEsR0FBUjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFDTCxXQUFDO0FBQUQsQ0FkQSxBQWNDLElBQUE7QUFkWSxZQUFJLE9BY2hCLENBQUE7QUFFRDs7R0FFRztBQUNIO0lBSUksb0JBQVksQ0FBUyxFQUFFLENBQVM7UUFDNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFDTCxpQkFBQztBQUFELENBUkEsQUFRQyxJQUFBO0FBUlksa0JBQVUsYUFRdEIsQ0FBQTs7O0FDN0JZLDZCQUFxQixHQUFHLEVBQUUsQ0FBQztBQUMzQixxQ0FBNkIsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRTFDLHNCQUFjLEdBQUcsZ0JBQWdCLENBQUM7QUFDbEMscUJBQWEsR0FBRyxlQUFlLENBQUM7QUFDaEMsa0JBQVUsR0FBRyxZQUFZLENBQUM7QUFDMUIsc0JBQWMsR0FBRyxnQkFBZ0IsQ0FBQztBQUNsQyx3QkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQzs7O0FDUG5ELFdBQVksY0FBYztJQUN0QixtREFBSSxDQUFBO0lBQ0osbURBQUksQ0FBQTtJQUNKLHFEQUFLLENBQUE7SUFDTCxtREFBSSxDQUFBO0lBQ0osbURBQUksQ0FBQTtJQUNKLHlFQUFlLENBQUE7SUFDZix1RkFBc0IsQ0FBQTtBQUMxQixDQUFDLEVBUlcsc0JBQWMsS0FBZCxzQkFBYyxRQVF6QjtBQVJELElBQVksY0FBYyxHQUFkLHNCQVFYLENBQUE7Ozs7Ozs7O0FDUkQsMEJBQXVDLGFBQWEsQ0FBQyxDQUFBO0FBSXJEO0lBQTZDLDJDQUFhO0lBTXRELGlDQUFZLEtBQVksRUFBRSxVQUFzQixFQUFFLFFBQWlCO1FBQy9ELGlCQUFPLENBQUM7UUFDUixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRUQseUNBQU8sR0FBUDtRQUNJLE1BQU0sQ0FBQyxxQkFBUyxDQUFDLDJCQUEyQixDQUFDO0lBQ2pELENBQUM7SUFDTCw4QkFBQztBQUFELENBaEJBLEFBZ0JDLENBaEI0Qyx5QkFBYSxHQWdCekQ7QUFoQlksK0JBQXVCLDBCQWdCbkMsQ0FBQTs7Ozs7Ozs7QUNwQkQsMEJBQXVDLGFBQWEsQ0FBQyxDQUFBO0FBR3JEO0lBQTJDLHlDQUFhO0lBS3BELCtCQUFZLFVBQXNCLEVBQUUsTUFBYztRQUM5QyxpQkFBTyxDQUFDO1FBQ1IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVELHVDQUFPLEdBQVA7UUFDSSxNQUFNLENBQUMscUJBQVMsQ0FBQyx5QkFBeUIsQ0FBQztJQUMvQyxDQUFDO0lBQ0wsNEJBQUM7QUFBRCxDQWRBLEFBY0MsQ0FkMEMseUJBQWEsR0FjdkQ7QUFkWSw2QkFBcUIsd0JBY2pDLENBQUE7Ozs7Ozs7O0FDakJELDBCQUF1QyxhQUFhLENBQUMsQ0FBQTtBQUdyRDtJQUFzQyxvQ0FBYTtJQUkvQywwQkFBWSxVQUFzQjtRQUM5QixpQkFBTyxDQUFDO1FBQ1IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUVELGtDQUFPLEdBQVA7UUFDSSxNQUFNLENBQUMscUJBQVMsQ0FBQyxvQkFBb0IsQ0FBQztJQUMxQyxDQUFDO0lBQ0wsdUJBQUM7QUFBRCxDQVpBLEFBWUMsQ0FacUMseUJBQWEsR0FZbEQ7QUFaWSx3QkFBZ0IsbUJBWTVCLENBQUE7Ozs7Ozs7O0FDZkQsMEJBQXVDLGFBQWEsQ0FBQyxDQUFBO0FBS3JEO0lBQXFDLG1DQUFhO0lBTTlDLHlCQUFZLElBQVUsRUFBRSxHQUFXLEVBQUUsR0FBVyxFQUFFLFVBQXNCO1FBQ3BFLGlCQUFPLENBQUM7UUFDUixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUVELGlDQUFPLEdBQVA7UUFDSSxNQUFNLENBQUMscUJBQVMsQ0FBQyxtQkFBbUIsQ0FBQztJQUN6QyxDQUFDO0lBQ0wsc0JBQUM7QUFBRCxDQWpCQSxBQWlCQyxDQWpCb0MseUJBQWEsR0FpQmpEO0FBakJZLHVCQUFlLGtCQWlCM0IsQ0FBQTs7O0FDdEJELFdBQVksU0FBUztJQUNqQix1RkFBMkIsQ0FBQTtJQUMzQixtRkFBeUIsQ0FBQTtJQUN6Qix5RUFBb0IsQ0FBQTtJQUNwQix1RUFBbUIsQ0FBQTtJQUNuQixtRkFBeUIsQ0FBQTtJQUN6Qix5RUFBb0IsQ0FBQTtJQUNwQixxRUFBa0IsQ0FBQTtJQUNsQixxRUFBa0IsQ0FBQTtJQUNsQix1RkFBMkIsQ0FBQTtJQUMzQixxRUFBa0IsQ0FBQTtJQUNsQixnRkFBdUIsQ0FBQTtJQUN2Qiw4RUFBc0IsQ0FBQTtJQUN0QixnRkFBdUIsQ0FBQTtJQUN2QiwwR0FBb0MsQ0FBQTtJQUNwQyx3RUFBbUIsQ0FBQTtJQUNuQiw0RkFBNkIsQ0FBQTtBQUNqQyxDQUFDLEVBakJXLGlCQUFTLEtBQVQsaUJBQVMsUUFpQnBCO0FBakJELElBQVksU0FBUyxHQUFULGlCQWlCWCxDQUFBO0FBRUQ7SUFBQTtJQUVBLENBQUM7SUFBRCxvQkFBQztBQUFELENBRkEsQUFFQyxJQUFBO0FBRnFCLHFCQUFhLGdCQUVsQyxDQUFBO0FBTUQ7SUFJSTtRQUNJLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQTRDLENBQUM7SUFDOUUsQ0FBQztJQUVELDJCQUFRLEdBQVIsVUFBUyxJQUFjLEVBQUUsT0FBbUM7UUFDeEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRVosQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUVmLENBQUM7UUFFRCxJQUFJLFFBQVEsR0FBaUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0UsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekIsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2Qix1RUFBdUU7SUFDM0UsQ0FBQztJQUVELDJFQUEyRTtJQUUzRSxpQ0FBaUM7SUFDakMsdUJBQUksR0FBSixVQUFLLEtBQW1CO1FBQ3BCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLEdBQUcsQ0FBQyxDQUFnQixVQUFRLEVBQVIscUJBQVEsRUFBUixzQkFBUSxFQUFSLElBQVEsQ0FBQztnQkFBeEIsSUFBSSxPQUFPLGlCQUFBO2dCQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsQjtRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0wsZUFBQztBQUFELENBdENBLEFBc0NDLElBQUE7QUF0Q1ksZ0JBQVEsV0FzQ3BCLENBQUE7QUFDWSxnQkFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7QUFDMUIsb0JBQVksR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUMsY0FBYzs7Ozs7Ozs7QUNuRTFELDBCQUF1QyxhQUFhLENBQUMsQ0FBQTtBQUdyRDtJQUEyQyx5Q0FBYTtJQUlwRCwrQkFBWSxVQUFzQjtRQUM5QixpQkFBTyxDQUFDO1FBQ1IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUVELHVDQUFPLEdBQVA7UUFDSSxNQUFNLENBQUMscUJBQVMsQ0FBQyx5QkFBeUIsQ0FBQztJQUMvQyxDQUFDO0lBQ0wsNEJBQUM7QUFBRCxDQVpBLEFBWUMsQ0FaMEMseUJBQWEsR0FZdkQ7QUFaWSw2QkFBcUIsd0JBWWpDLENBQUE7Ozs7Ozs7O0FDZkQsMEJBQXVDLGFBQWEsQ0FBQyxDQUFBO0FBR3JEO0lBQTJDLHlDQUFhO0lBSXBELCtCQUFZLElBQW1CO1FBQzNCLGlCQUFPLENBQUM7UUFDUixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztJQUM5QixDQUFDO0lBRUQsdUNBQU8sR0FBUDtRQUNJLE1BQU0sQ0FBQyxxQkFBUyxDQUFDLG9CQUFvQixDQUFDO0lBQzFDLENBQUM7SUFDTCw0QkFBQztBQUFELENBWkEsQUFZQyxDQVowQyx5QkFBYSxHQVl2RDtBQVpZLDZCQUFxQix3QkFZakMsQ0FBQTs7Ozs7Ozs7QUNmRCwwQkFBdUMsYUFBYSxDQUFDLENBQUE7QUFHckQ7SUFBb0Msa0NBQWE7SUFNN0Msd0JBQVksRUFBVSxFQUFFLFVBQXNCLEVBQUUsU0FBZTtRQUFmLHlCQUFlLEdBQWYsaUJBQWU7UUFDM0QsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVELGdDQUFPLEdBQVA7UUFDSSxNQUFNLENBQUMscUJBQVMsQ0FBQyxrQkFBa0IsQ0FBQztJQUN4QyxDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQWhCQSxBQWdCQyxDQWhCbUMseUJBQWEsR0FnQmhEO0FBaEJZLHNCQUFjLGlCQWdCMUIsQ0FBQTs7Ozs7Ozs7QUNuQkQsMEJBQXVDLGFBQWEsQ0FBQyxDQUFBO0FBRXJEO0lBQW9DLGtDQUFhO0lBTTdDLHdCQUFZLEtBQWEsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUMzQyxpQkFBTyxDQUFDO1FBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRCxnQ0FBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsa0JBQWtCLENBQUM7SUFDeEMsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FoQkEsQUFnQkMsQ0FoQm1DLHlCQUFhLEdBZ0JoRDtBQWhCWSxzQkFBYyxpQkFnQjFCLENBQUE7Ozs7Ozs7O0FDbEJELDBCQUF1QyxhQUFhLENBQUMsQ0FBQTtBQUVyRDtJQUE2QywyQ0FBYTtJQU10RCxpQ0FBWSxLQUFhLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDM0MsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDO0lBRUQseUNBQU8sR0FBUDtRQUNJLE1BQU0sQ0FBQyxxQkFBUyxDQUFDLDJCQUEyQixDQUFDO0lBQ2pELENBQUM7SUFDTCw4QkFBQztBQUFELENBaEJBLEFBZ0JDLENBaEI0Qyx5QkFBYSxHQWdCekQ7QUFoQlksK0JBQXVCLDBCQWdCbkMsQ0FBQTs7Ozs7Ozs7QUNsQkQsMEJBQXVDLGFBQWEsQ0FBQyxDQUFBO0FBRXJEO0lBQW9DLGtDQUFhO0lBTTdDLHdCQUFZLEtBQWEsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUMzQyxpQkFBTyxDQUFDO1FBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRCxnQ0FBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsa0JBQWtCLENBQUM7SUFDeEMsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FoQkEsQUFnQkMsQ0FoQm1DLHlCQUFhLEdBZ0JoRDtBQWhCWSxzQkFBYyxpQkFnQjFCLENBQUE7Ozs7Ozs7O0FDbEJELDBCQUF1QyxhQUFhLENBQUMsQ0FBQTtBQUVyRDtJQUF3QyxzQ0FBYTtJQU1qRCw0QkFBWSxLQUFhLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDM0MsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDO0lBRUQsb0NBQU8sR0FBUDtRQUNJLE1BQU0sQ0FBQyxxQkFBUyxDQUFDLHNCQUFzQixDQUFDO0lBQzVDLENBQUM7SUFDTCx5QkFBQztBQUFELENBaEJBLEFBZ0JDLENBaEJ1Qyx5QkFBYSxHQWdCcEQ7QUFoQlksMEJBQWtCLHFCQWdCOUIsQ0FBQTs7Ozs7Ozs7QUNsQkQsMEJBQXVDLGFBQWEsQ0FBQyxDQUFBO0FBSXJEO0lBQXlDLHVDQUFhO0lBS2xELDZCQUFZLFFBQXdCLEVBQUUsVUFBc0I7UUFDeEQsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxxQ0FBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsdUJBQXVCLENBQUM7SUFDN0MsQ0FBQztJQUNMLDBCQUFDO0FBQUQsQ0FkQSxBQWNDLENBZHdDLHlCQUFhLEdBY3JEO0FBZFksMkJBQW1CLHNCQWMvQixDQUFBOzs7Ozs7OztBQ2xCRCwwQkFBdUMsYUFBYSxDQUFDLENBQUE7QUFHckQ7SUFBc0Qsb0RBQWE7SUFJL0QsMENBQVksVUFBc0I7UUFDOUIsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxrREFBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsb0NBQW9DLENBQUM7SUFDMUQsQ0FBQztJQUNMLHVDQUFDO0FBQUQsQ0FaQSxBQVlDLENBWnFELHlCQUFhLEdBWWxFO0FBWlksd0NBQWdDLG1DQVk1QyxDQUFBOzs7Ozs7OztBQ2ZELDBCQUF1QyxhQUFhLENBQUMsQ0FBQTtBQUdyRDtJQUFxQyxtQ0FBYTtJQUs5Qyx5QkFBWSxhQUF1QixFQUFFLFVBQXNCO1FBQ3ZELGlCQUFPLENBQUM7UUFDUixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUVELGlDQUFPLEdBQVA7UUFDSSxNQUFNLENBQUMscUJBQVMsQ0FBQyxtQkFBbUIsQ0FBQztJQUN6QyxDQUFDO0lBQ0wsc0JBQUM7QUFBRCxDQWRBLEFBY0MsQ0Fkb0MseUJBQWEsR0FjakQ7QUFkWSx1QkFBZSxrQkFjM0IsQ0FBQTs7Ozs7Ozs7QUNqQkQsMEJBQXVDLGFBQWEsQ0FBQyxDQUFBO0FBRXJEO0lBQStDLDZDQUFhO0lBTXhELG1DQUFZLEtBQWEsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUMzQyxpQkFBTyxDQUFDO1FBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRCwyQ0FBTyxHQUFQO1FBQ0ksTUFBTSxDQUFDLHFCQUFTLENBQUMsNkJBQTZCLENBQUM7SUFDbkQsQ0FBQztJQUNMLGdDQUFDO0FBQUQsQ0FoQkEsQUFnQkMsQ0FoQjhDLHlCQUFhLEdBZ0IzRDtBQWhCWSxpQ0FBeUIsNEJBZ0JyQyxDQUFBOzs7QUNsQkQsMEJBQXVCLG1CQUFtQixDQUFDLENBQUE7QUFDM0MseUNBQW9DLGtDQUFrQyxDQUFDLENBQUE7QUE2QnZFO0lBR0k7UUFDSSxJQUFJLENBQUMsT0FBTyxHQUFHLG9CQUEwQixDQUFDLENBQUMsaUJBQWlCO0lBQ2hFLENBQUM7SUFFRCw4QkFBVSxHQUFWO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVELDhCQUFVLEdBQVYsVUFBVyxPQUFzQjtRQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixvQkFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLGdEQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNMLGdCQUFDO0FBQUQsQ0FmQSxBQWVDLElBQUE7QUFDWSxpQkFBUyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7OztBQzlDekMsMEJBQXdCLGFBQWEsQ0FBQyxDQUFBO0FBQ3RDLHNCQUFvQixlQUFlLENBQUMsQ0FBQTtBQUNwQyxxQkFBbUIsYUFBYSxDQUFDLENBQUE7QUFDakMsMkJBQXlCLHlCQUF5QixDQUFDLENBQUE7QUFDbkQsOEJBQTJCLHVCQUF1QixDQUFDLENBQUE7QUFDbkQsMkJBQXVDLGNBQWMsQ0FBQyxDQUFBO0FBRXRELFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxVQUFDLEtBQVU7SUFDckQsc0JBQVMsQ0FBQyxVQUFVLENBQUMsb0JBQTBCLENBQUMsQ0FBQztJQUNqRCw0QkFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3RCLHFCQUFTLENBQUMsT0FBTyxDQUFDO1FBQ2QsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDO0FBRUg7SUFFSSx3RUFBd0U7SUFDeEUscUVBQXFFO0lBQ3JFLDRCQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsdUJBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuQixXQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDYixhQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFFZCxzQkFBUyxDQUFDLFVBQVUsQ0FBQyxhQUFtQixDQUFDLENBQUM7SUFFMUMsSUFBSSxJQUFJLEdBQUc7UUFDUCxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU1QixJQUFJLE9BQU8sR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2pDLHVCQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLFdBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkIsYUFBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQiw0QkFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUM7SUFDRixJQUFJLEVBQUUsQ0FBQztBQUNYLENBQUM7QUFFRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUI7SUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDckIsSUFBSSxPQUFPLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQztJQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQixPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsc0JBQXNCO0lBQ3pDLENBQUM7SUFDRCxRQUFRLEdBQUcsR0FBRyxDQUFDO0lBQ2YsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUNuQixDQUFDOzs7QUM5Q0QsMEJBQW9DLHdCQUF3QixDQUFDLENBQUE7QUFHN0QsMEJBQWtDLHVCQUF1QixDQUFDLENBQUE7QUFNMUQsdUJBQTZCLFdBQVcsQ0FBQyxDQUFBO0FBRXpDLElBQU0sUUFBUSxHQUFHLGlDQUFxQixDQUFDO0FBRXZDOztHQUVHO0FBQ0gsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBRXZCOztHQUVHO0FBQ0gsSUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7QUFFL0IsdUdBQXVHO0FBQ3ZHLElBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLElBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLElBQU0sb0JBQW9CLEdBQUcsc0JBQXNCLEdBQUcsc0JBQXNCLENBQUM7QUFFN0U7O0dBRUc7QUFDSCxJQUFNLHNDQUFzQyxHQUFHLEdBQUcsQ0FBQztBQXlCbkQ7SUFnQkksWUFBWSxTQUFvQjtRQUM1QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDM0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFFbEIsSUFBSSxDQUFDLFlBQVksR0FBRyxzQkFBc0IsQ0FBQztRQUUzQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUMvQixDQUFDO0lBRUQsa0JBQUssR0FBTDtRQUFBLGlCQUlDO1FBSEcsb0JBQVEsQ0FBQyxRQUFRLENBQUMscUJBQVMsQ0FBQywyQkFBMkIsRUFBRSxVQUFDLEtBQThCO1lBQ3BGLEtBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxpQkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixJQUFJLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQztRQUU3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUM7UUFDN0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLGlCQUFpQixJQUFJLE9BQU8sQ0FBQztZQUNsQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO2dCQUMzRCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNoQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILHVCQUFVLEdBQVY7UUFDSSwyRUFBMkU7UUFDM0UsQ0FBQztZQUNHLGlDQUFpQztZQUNqQyxJQUFJLElBQUksR0FBRyxlQUFNLENBQUMsY0FBYyxHQUFHLGVBQU0sQ0FBQyxXQUFXLENBQUM7WUFDdEQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxlQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFlBQVksR0FBRyxzQkFBc0IsR0FBRyxDQUFDLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFRCxpREFBaUQ7UUFDakQsQ0FBQztZQUNHLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFMUMscURBQXFEO1lBQ3JELElBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUMxQyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7WUFDckIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUM7Z0JBQzlDLE9BQU0sTUFBTSxDQUFDLGFBQWEsRUFBRTtvQkFBQyxDQUFDO2dCQUU5QixHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO29CQUN0QyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztvQkFDaEMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7b0JBRTdCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDNUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7d0JBQ3hCLFdBQVcsR0FBRyxPQUFPLENBQUM7d0JBQ3RCLFlBQVksR0FBRyxRQUFRLENBQUM7d0JBQ3hCLFVBQVUsR0FBRyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLHFHQUFxRztvQkFDdEosQ0FBQztvQkFFRCxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztvQkFDakMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNuQixJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQzNDLEVBQUUsQ0FBQyxDQUFDLFlBQVksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUN6QixLQUFLLENBQUM7b0JBQ1YsQ0FBQztnQkFDTCxDQUFDO2dCQUNELE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ2xDLENBQUM7WUFFRCwyRUFBMkU7WUFDM0UsSUFBSSxDQUFDLGNBQWMsR0FBRyxZQUFZLENBQUM7WUFDbkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUM7WUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDL0IsQ0FBQztJQUNMLENBQUM7SUFFTywwQ0FBNkIsR0FBckMsVUFBc0MsS0FBOEI7UUFDaEUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsS0FBSyxVQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7WUFDL0IsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztRQUVSLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSyw2QkFBZ0IsR0FBeEIsVUFBeUIsTUFBbUI7UUFDeEMsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDeEQsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDcEQsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3BDLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzVDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFDO2NBQzdCLENBQUUsUUFBUSxHQUFHLGFBQWEsQ0FBQztjQUMzQixDQUFDLENBQUMsT0FBTyxHQUFJLEtBQUssQ0FBQztjQUNuQixDQUFDLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVPLGlDQUFvQixHQUE1QjtRQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUM7UUFDWCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsS0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUMvRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUM5QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7WUFFUixDQUFDO1FBQ0wsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDM0IsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNwQyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNuQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTyx1Q0FBMEIsR0FBbEM7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxzQ0FBc0MsQ0FBQyxDQUFDLENBQUM7SUFDckcsQ0FBQztJQUNMLFNBQUM7QUFBRCxDQTdKQSxBQTZKQyxJQUFBO0FBN0pZLFVBQUUsS0E2SmQsQ0FBQTs7O0FDck5ELHFCQUFtQixtQkFBbUIsQ0FBQyxDQUFBO0FBR3ZDLDBCQUFvQyx3QkFBd0IsQ0FBQyxDQUFBO0FBQzdELDhCQUE2QyxpQkFBaUIsQ0FBQyxDQUFBO0FBQy9ELDBCQUFxQyx1QkFBdUIsQ0FBQyxDQUFBO0FBQzdELGtDQUE4QiwrQkFBK0IsQ0FBQyxDQUFBO0FBQzlELGtDQUE4QiwrQkFBK0IsQ0FBQyxDQUFBO0FBQzlELDJDQUFzQyx3Q0FBd0MsQ0FBQyxDQUFBO0FBQy9FLHlDQUFvQyxzQ0FBc0MsQ0FBQyxDQUFBO0FBQzNFLG1DQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRWhFLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDLG1FQUFtRTtBQUN4RixJQUFNLFFBQVEsR0FBRyxpQ0FBcUIsQ0FBQztBQUN2QyxJQUFNLGFBQWEsR0FBRyxHQUFHLENBQUM7QUFPMUI7SUFpQkksZUFBWSxVQUFzQixFQUFFLFlBQTBCLEVBQUUsUUFBa0I7UUFDOUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxjQUFpQixDQUFDO1FBQ3BDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxhQUFhLENBQUM7UUFFdkMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN6QixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksV0FBSSxFQUFFLENBQUM7WUFDN0MsQ0FBQztRQUNMLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssYUFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsaUJBQWlCLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQVcsQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQVcsQ0FBQztRQUNqQyxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsNEJBQVksR0FBWjtRQUNJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxVQUFVLEdBQUcsY0FBaUIsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxvQkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLGNBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLG1GQUFtRjtZQUNuRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxPQUFPLENBQUM7WUFDbEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxhQUFhLENBQUM7Z0JBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDekIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztnQkFDeEMsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsNENBQTRCLEdBQTVCO1FBQ0ksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxnREFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTNGLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFN0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXZDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gscUNBQXFCLEdBQXJCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVELDZCQUFhLEdBQWI7UUFDSSxJQUFJLE9BQWdCLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxjQUFpQixDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDOUIsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNwQixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7Z0JBQ25DLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDbkIsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELDhCQUFjLEdBQWQ7UUFDSSxJQUFJLE9BQWdCLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxjQUFpQixDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDN0IsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNwQixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7Z0JBQ25DLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDbkIsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELDZCQUFhLEdBQWI7UUFDSSxJQUFJLE9BQWdCLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxjQUFpQixDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNwQixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7Z0JBQ25DLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDbkIsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELHNDQUFzQixHQUF0QjtRQUNJLElBQUksT0FBZ0IsQ0FBQztRQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLGNBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLEdBQUcsQ0FBQztnQkFDQSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMseUJBQXlCO1lBQzlELElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7WUFDbkMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNuQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7T0FFRztJQUNILHlCQUFTLEdBQVQ7UUFDSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFRCxvQ0FBb0IsR0FBcEI7UUFDSSxJQUFJLE9BQWdCLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxjQUFpQixDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDM0MsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNwQixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7Z0JBQ25DLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDbkIsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssd0NBQXdCLEdBQWhDO1FBQUEsaUJBK0JDO1FBOUJHLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzdDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFN0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNyQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMseUNBQXlDO1FBQzdELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLGtCQUFrQjtZQUNsQixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFO29CQUN0RCxLQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFFRCwwQ0FBMEM7WUFDMUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRTtvQkFDdEQsS0FBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBQUEsQ0FBQztZQUVGLG9EQUFvRDtZQUNwRCxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFO29CQUN0RCxLQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUMvQixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxnQ0FBZ0IsR0FBeEIsVUFBeUIsV0FBbUIsRUFBRSxXQUFtQixFQUFFLEtBQWlCO1FBQ2hGLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXRDLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQ3JDLEtBQUssRUFBRSxDQUFDO1lBQ1IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDckMsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDZixLQUFLLENBQUM7WUFDVixDQUFDO1FBQ0wsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELDJCQUFXLEdBQVgsVUFBWSxpQkFBeUI7UUFDakMsb0RBQW9EO1FBQ3BELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRXpDLCtCQUErQjtRQUMvQixHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDL0Msb0NBQW9DO1lBQ3BDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ3ZDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQztZQUNyQixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLE1BQUksR0FBRyxJQUFJLFdBQUksRUFBRSxDQUFDO2dCQUN0QixNQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQUksQ0FBQyxDQUFDO1lBQ25CLENBQUM7WUFFRCw0QkFBNEI7WUFDNUIsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBVyxDQUFDLENBQUM7WUFFM0Isc0NBQXNDO1lBQ3RDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUM7WUFDcEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtZQUMzRCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCO1lBQzNELENBQUM7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRUQseURBQXlEO1FBQ3pELDRCQUE0QjtRQUM1QixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDekQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDakQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBZSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ25GLENBQUM7UUFDTCxDQUFDO1FBRUQsaUVBQWlFO1FBQ2pFLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7WUFDdkMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCwyQkFBVyxHQUFYO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxnQ0FBZ0IsRUFBRSx3QkFBWSxDQUFDLENBQUM7UUFFdEUsb0RBQW9EO1FBQ3BELElBQUksQ0FBQyxVQUFVLEdBQUcsY0FBaUIsQ0FBQztRQUVwQyx1RUFBdUU7UUFDdkUsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BELEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUN6RCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNqRSxDQUFDO1FBQ0wsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsd0NBQXdCLEdBQXhCO1FBQ0ksSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDL0MsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFPLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsc0NBQXNCLEdBQXRCO1FBQ0ksSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDL0MsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFPLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxzQ0FBc0IsR0FBdEI7UUFDSSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFFdEIsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ3pELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ2pELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxhQUFXLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxLQUFLLEVBQUUsQ0FBQztnQkFDWixDQUFDO1lBQ0wsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsYUFBYSxFQUFFLENBQUM7WUFDcEIsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLENBQUMsYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsOEJBQWMsR0FBZDtRQUNJLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQy9DLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNkLElBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDO1lBQ2hDLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDekQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkMsRUFBRSxDQUFDLENBQUMsb0JBQW9CLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDakMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLGFBQVcsQ0FBQyxDQUFDLENBQUM7d0JBQ2xDLEtBQUssRUFBRSxDQUFDO3dCQUNSLG9CQUFvQixHQUFHLElBQUksQ0FBQztvQkFDaEMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixvQkFBb0IsR0FBRyxLQUFLLENBQUM7b0JBQ2pDLENBQUM7Z0JBQ0wsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssYUFBVyxDQUFDLENBQUMsQ0FBQzt3QkFDbEMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO29CQUNoQyxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLG9CQUFvQixHQUFHLEtBQUssQ0FBQztvQkFDakMsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQUNELFVBQVUsSUFBSSxLQUFLLENBQUM7UUFDeEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsa0NBQWtCLEdBQWxCO1FBQ0ksSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQy9DLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUNuRCxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixTQUFTLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVPLHNDQUFzQixHQUE5QjtRQUNJLElBQUksVUFBVSxHQUFhLEVBQUUsQ0FBQztRQUM5QixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQy9DLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUVELEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDL0MsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLFFBQVEsR0FBRyxDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUNwRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssYUFBVyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsT0FBTyxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUM7Z0JBQ2hDLENBQUM7WUFDTCxDQUFDO1lBQ0QsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUNqQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsbUNBQW1CLEdBQW5CO1FBQ0ksR0FBRyxDQUFDLENBQWUsVUFBOEIsRUFBOUIsS0FBQSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxFQUE5QixjQUE4QixFQUE5QixJQUE4QixDQUFDO1lBQTdDLElBQUksTUFBTSxTQUFBO1lBQ1gsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ25ELElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVuRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLFFBQVEsQ0FBQztZQUNiLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELFFBQVEsQ0FBQztZQUNiLENBQUM7WUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNqRTtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILHVDQUF1QixHQUF2QjtRQUNJLEdBQUcsQ0FBQyxDQUFlLFVBQThCLEVBQTlCLEtBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsRUFBOUIsY0FBOEIsRUFBOUIsSUFBOEIsQ0FBQztZQUE3QyxJQUFJLE1BQU0sU0FBQTtZQUNYLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFbkQsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxRQUFRLENBQUM7WUFDYixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxRQUFRLENBQUM7WUFDYixDQUFDO1lBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQVcsQ0FBQyxDQUFDO1NBQ3JEO0lBQ0wsQ0FBQztJQUVPLHFCQUFLLEdBQWI7UUFDSSxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDekQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDakQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQVcsQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDTCxDQUFDO1FBRUQsMkJBQWlFLEVBQWhFLDBCQUFrQixFQUFFLDBCQUFrQixDQUEyQjs7SUFDdEUsQ0FBQztJQUVEOztPQUVHO0lBQ0ssK0JBQWUsR0FBdkIsVUFBd0IsTUFBYyxFQUFFLE1BQWMsRUFBRSxLQUFZO1FBQ2hFLGlDQUFpQztRQUNqQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBZSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFTywwQkFBVSxHQUFsQixVQUFtQixjQUF1QjtRQUN0QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU8sMEJBQVUsR0FBbEI7UUFDSSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFFdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDO1FBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUUzQixNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7O09BR0c7SUFDSyxpQ0FBaUIsR0FBekI7UUFDSSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFFdEIsR0FBRyxDQUFDLENBQWUsVUFBOEIsRUFBOUIsS0FBQSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxFQUE5QixjQUE4QixFQUE5QixJQUE4QixDQUFDO1lBQTdDLElBQUksTUFBTSxTQUFBO1lBQ1gsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2hELElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVoRCxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLGFBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLENBQUM7U0FDSjtRQUVELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVPLCtCQUFlLEdBQXZCO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDUCxJQUFJLENBQUMsVUFBVSxHQUFHLGNBQWlCLENBQUMsQ0FBQyxzQ0FBc0M7WUFDM0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUMxRCxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7T0FFRztJQUNLLDJCQUFXLEdBQW5CO1FBQ0ksR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUN4QyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssYUFBVyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQ7O09BRUc7SUFDSyx5Q0FBeUIsR0FBakM7UUFDSSxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUNsRCxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBZSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsVUFBVSxHQUFHLGNBQWlCLENBQUMsQ0FBQyx1Q0FBdUM7UUFDaEYsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1FBRVIsQ0FBQztRQUNELE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gseUNBQXlCLEdBQXpCO1FBQ0ksb0dBQW9HO1FBQ3BHLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBRWxELDBCQUEwQjtRQUMxQixxR0FBcUc7UUFDckcsMERBQTBEO1FBQzFELEdBQUcsQ0FBQyxDQUFxQixVQUFhLEVBQWIsK0JBQWEsRUFBYiwyQkFBYSxFQUFiLElBQWEsQ0FBQztZQUFsQyxJQUFJLFlBQVksc0JBQUE7WUFDakIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3hDO1FBRUQsK0VBQStFO1FBQy9FLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUV0QixnRUFBZ0U7UUFDaEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxjQUFpQixDQUFDO1FBQ3BDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0NBQWdCLEdBQWhCO1FBQ0ksSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVyQywrRUFBK0U7UUFDL0UsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTyw4QkFBYyxHQUF0QjtRQUNJLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDL0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDakQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBZSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ25GLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ssc0NBQXNCLEdBQTlCO1FBQ0ksSUFBSSxhQUFhLEdBQWEsRUFBRSxDQUFDO1FBQ2pDLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUN6RCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztZQUNsQixHQUFHLENBQUMsQ0FBYSxVQUFHLEVBQUgsV0FBRyxFQUFILGlCQUFHLEVBQUgsSUFBRyxDQUFDO2dCQUFoQixJQUFJLElBQUksWUFBQTtnQkFDVCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssYUFBVyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsTUFBTSxHQUFHLEtBQUssQ0FBQztvQkFDZixLQUFLLENBQUM7Z0JBQ1YsQ0FBQzthQUNKO1lBQ0QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDVCxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9CLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssaUNBQWlCLEdBQXpCLFVBQTBCLE1BQWM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0IsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksV0FBSSxFQUFFLENBQUM7UUFDeEMsQ0FBQztJQUNMLENBQUM7SUFFTywyQ0FBMkIsR0FBbkMsVUFBb0MsUUFBYztRQUFkLHdCQUFjLEdBQWQsZ0JBQWM7UUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxvREFBdUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRU8sbUNBQW1CLEdBQTNCO1FBQ0ksSUFBSSxLQUFZLENBQUM7UUFDakIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTywrQkFBZSxHQUF2QjtRQUVJLHNEQUFzRDtRQUN0RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNsQixLQUFLLEVBQUUsQ0FBQztZQUNSLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNaLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxDQUFDO1FBQ0wsQ0FBQztRQUNELE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFTyw2QkFBYSxHQUFyQixVQUFzQixLQUFhO1FBQy9CLElBQUksS0FBWSxDQUFDO1FBQ2pCLE1BQU0sQ0FBQSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDWCxLQUFLLENBQUM7Z0JBQ0YsS0FBSyxHQUFHLFlBQVUsQ0FBQztnQkFDbkIsS0FBSyxDQUFDO1lBQ1YsS0FBSyxDQUFDO2dCQUNGLEtBQUssR0FBRyxjQUFZLENBQUM7Z0JBQ3JCLEtBQUssQ0FBQztZQUNWLEtBQUssQ0FBQztnQkFDRixLQUFLLEdBQUcsY0FBWSxDQUFDO2dCQUNyQixLQUFLLENBQUM7WUFDVixLQUFLLENBQUM7Z0JBQ0YsS0FBSyxHQUFHLGFBQVcsQ0FBQztnQkFDcEIsS0FBSyxDQUFDO1lBQ1YsS0FBSyxDQUFDO2dCQUNGLEtBQUssR0FBRyxXQUFTLENBQUM7Z0JBQ2xCLEtBQUssQ0FBQztZQUNWLEtBQUssQ0FBQztnQkFDRixLQUFLLEdBQUcsWUFBVSxDQUFDO2dCQUNuQixLQUFLLENBQUM7WUFDVixLQUFLLENBQUM7Z0JBQ0YsS0FBSyxHQUFHLGNBQVksQ0FBQztnQkFDckIsS0FBSyxDQUFDO1lBQ1Y7Z0JBQ0ksS0FBSyxHQUFHLGFBQVcsQ0FBQyxDQUFDLHFCQUFxQjtRQUNsRCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0wsWUFBQztBQUFELENBOXJCQSxBQThyQkMsSUFBQTtBQTlyQlksYUFBSyxRQThyQmpCLENBQUE7OztBQ2x0QkQsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBUTFCO0lBQUE7SUFJQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQUpBLEFBSUMsSUFBQTtBQUVEO0lBT0ksMEJBQVksS0FBbUI7UUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCx1Q0FBWSxHQUFaLFVBQWEsUUFBb0I7UUFBakMsaUJBYUM7UUFaRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDL0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRTNCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7YUFDM0MsRUFBRSxDQUFDLEVBQUMsYUFBYSxFQUFFLENBQUMsRUFBQyxFQUFFLFlBQVksQ0FBQzthQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsMkRBQTJEO2FBQzVGLFVBQVUsQ0FBQztZQUNSLEtBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLEtBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDMUIsUUFBUSxFQUFFLENBQUM7UUFDZixDQUFDLENBQUM7YUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCwrQkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDeEQsRUFBRSxDQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDekMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO2dCQUNqRCxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO29CQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ2xDLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzFDLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0FoREEsQUFnREMsSUFBQTtBQWhEWSx3QkFBZ0IsbUJBZ0Q1QixDQUFBOzs7Ozs7OztBQ2hFRCxzQkFBb0IsU0FBUyxDQUFDLENBQUE7QUFHOUI7SUFBcUIsMEJBQUs7SUFBMUI7UUFBcUIsOEJBQUs7UUFDdEIsVUFBSyxHQUFHLFlBQVUsQ0FBQztRQUNuQixpQkFBWSxHQUFHLENBQUMsQ0FBQztRQUNqQixxQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDeEIsYUFBUSxHQUFHO1lBQ1A7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNiO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNiO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNiO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNiO1NBQ0osQ0FBQTtJQUtMLENBQUM7SUFIRyw0QkFBVyxHQUFYO1FBQ0ksTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQWxDQSxBQWtDQyxDQWxDb0IsYUFBSyxHQWtDekI7QUFFRDtJQUFxQiwwQkFBSztJQUExQjtRQUFxQiw4QkFBSztRQUN0QixVQUFLLEdBQUcsWUFBVSxDQUFDO1FBQ25CLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLHFCQUFnQixHQUFHLElBQUksQ0FBQztRQUN4QixhQUFRLEdBQUc7WUFDUDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtZQUNEO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7WUFDRDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1NBQ0osQ0FBQztJQUtOLENBQUM7SUFIRyw0QkFBVyxHQUFYO1FBQ0ksTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQTlCQSxBQThCQyxDQTlCb0IsYUFBSyxHQThCekI7QUFFRDtJQUFxQiwwQkFBSztJQUExQjtRQUFxQiw4QkFBSztRQUN0QixVQUFLLEdBQUcsY0FBWSxDQUFDO1FBQ3JCLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLHFCQUFnQixHQUFHLElBQUksQ0FBQztRQUN4QixhQUFRLEdBQUc7WUFDUDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtZQUNEO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7WUFDRDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1NBQ0osQ0FBQTtJQUtMLENBQUM7SUFIRyw0QkFBVyxHQUFYO1FBQ0ksTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQTlCQSxBQThCQyxDQTlCb0IsYUFBSyxHQThCekI7QUFFRDtJQUFxQiwwQkFBSztJQUExQjtRQUFxQiw4QkFBSztRQUN0QixVQUFLLEdBQUcsY0FBWSxDQUFDO1FBQ3JCLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLHFCQUFnQixHQUFHLEtBQUssQ0FBQztRQUN6QixhQUFRLEdBQUc7WUFDUDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNiO1NBQ0osQ0FBQTtJQUtMLENBQUM7SUFIRyw0QkFBVyxHQUFYO1FBQ0ksTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQWZBLEFBZUMsQ0Fmb0IsYUFBSyxHQWV6QjtBQUVEO0lBQXFCLDBCQUFLO0lBQTFCO1FBQXFCLDhCQUFLO1FBQ3RCLFVBQUssR0FBRyxhQUFXLENBQUM7UUFDcEIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFDakIscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLGFBQVEsR0FBRztZQUNQO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7WUFDRDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtZQUNEO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7U0FDSixDQUFBO0lBS0wsQ0FBQztJQUhHLDRCQUFXLEdBQVg7UUFDSSxNQUFNLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0wsYUFBQztBQUFELENBOUJBLEFBOEJDLENBOUJvQixhQUFLLEdBOEJ6QjtBQUVEO0lBQXFCLDBCQUFLO0lBQTFCO1FBQXFCLDhCQUFLO1FBQ3RCLFVBQUssR0FBRyxjQUFZLENBQUM7UUFDckIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFDakIscUJBQWdCLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLGFBQVEsR0FBRztZQUNQO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7WUFDRDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtZQUNEO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7U0FDSixDQUFBO0lBS0wsQ0FBQztJQUhHLDRCQUFXLEdBQVg7UUFDSSxNQUFNLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0wsYUFBQztBQUFELENBOUJBLEFBOEJDLENBOUJvQixhQUFLLEdBOEJ6QjtBQUVEO0lBQXFCLDBCQUFLO0lBQTFCO1FBQXFCLDhCQUFLO1FBQ3RCLFVBQUssR0FBRyxXQUFTLENBQUM7UUFDbEIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFDakIscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLGFBQVEsR0FBRztZQUNQO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7WUFDRDtnQkFDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWO1lBQ0Q7Z0JBQ0ksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDVjtZQUNEO2dCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDUCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1Y7U0FDSixDQUFBO0lBS0wsQ0FBQztJQUhHLDRCQUFXLEdBQVg7UUFDSSxNQUFNLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0wsYUFBQztBQUFELENBOUJBLEFBOEJDLENBOUJvQixhQUFLLEdBOEJ6QjtBQUVEO0lBR0k7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxnQ0FBUyxHQUFULFVBQVUsY0FBdUI7UUFDN0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLGNBQWMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMseUJBQXlCO0lBQ3BELENBQUM7SUFFTyxnQ0FBUyxHQUFqQixVQUFrQixvQkFBNkI7UUFDM0MsSUFBSSxDQUFDLEdBQUcsR0FBRztZQUNQLElBQUksTUFBTSxFQUFFO1lBQ1osSUFBSSxNQUFNLEVBQUU7WUFDWixJQUFJLE1BQU0sRUFBRTtZQUNaLElBQUksTUFBTSxFQUFFO1lBQ1osSUFBSSxNQUFNLEVBQUU7WUFDWixJQUFJLE1BQU0sRUFBRTtZQUNaLElBQUksTUFBTSxFQUFFO1NBQ2YsQ0FBQztRQUVGLENBQUM7WUFDRyxxRUFBcUU7WUFDckUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUE7WUFDekIsNENBQTRDO1lBQzVDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNmLDhCQUE4QjtnQkFDOUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzdDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ1Qsd0NBQXdDO2dCQUN4QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDO1lBQy9CLENBQUM7UUFDTCxDQUFDO1FBRUQsc0ZBQXNGO1FBQ3RGLEVBQUUsQ0FBQyxDQUFDLG9CQUFvQixLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVsRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztvQkFDckMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUMxQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO3dCQUN4QixLQUFLLENBQUM7b0JBQ1YsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQXpEQSxBQXlEQyxJQUFBO0FBekRZLG9CQUFZLGVBeUR4QixDQUFBO0FBQ1ksd0JBQWdCLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQyxDQUFDLGNBQWM7OztBQ2xSbEUscUJBQXlCLG1CQUFtQixDQUFDLENBQUE7QUFHN0MsSUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsaURBQWlEO0FBRXRFO0lBWUk7UUFDSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLENBQUMsZ0RBQWdEO1FBQzdFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsSUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7UUFDckIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBRUQsd0JBQVEsR0FBUjtRQUNJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCx5QkFBUyxHQUFUO1FBQ0ksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUVELHNCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDZixDQUFDO0lBRUQsd0JBQVEsR0FBUjtRQUNJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRDs7T0FFRztJQUNILHlCQUFTLEdBQVQ7UUFDSSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBRUQsc0NBQXNCLEdBQXRCO1FBQ0ksSUFBSSxDQUFDLGtCQUFrQixJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsK0JBQWUsR0FBZjtRQUNJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELHNCQUFNLEdBQU47UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNwQixDQUFDO0lBRUQsc0JBQU0sR0FBTixVQUFPLEdBQVc7UUFDZCxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBRUQsc0JBQU0sR0FBTjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3BCLENBQUM7SUFFRCxzQkFBTSxHQUFOLFVBQU8sR0FBVztRQUNkLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFFRCwyQkFBVyxHQUFYO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsMEJBQVUsR0FBVjtRQUNJLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3JDLElBQUksT0FBTyxHQUFpQixFQUFFLENBQUM7UUFDL0IsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDM0MsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNkLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzVDLElBQUksTUFBTSxHQUFHLElBQUksaUJBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekIsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7O09BR0c7SUFDSCwyQkFBVyxHQUFYO1FBQ0ksd0VBQXdFO1FBQ3hFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVPLGdDQUFnQixHQUF4QjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTyxpQ0FBaUIsR0FBekI7UUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7SUFDTCxDQUFDO0lBQ0wsWUFBQztBQUFELENBM0dBLEFBMkdDLElBQUE7QUEzR3FCLGFBQUssUUEyRzFCLENBQUE7OztBQy9HRCw0QkFBeUIsbUJBQW1CLENBQUMsQ0FBQTtBQUU3QztJQUFBO0lBb0JBLENBQUM7SUFoQkcsNkJBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCw0QkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixJQUFJLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQztRQUU1Qix3QkFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLG1HQUFtRztRQUU3SCwwQkFBMEI7UUFDMUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxlQUFxQixDQUFDO1FBQ2pDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxhQUFtQixDQUFDO1FBQy9CLENBQUM7SUFDTCxDQUFDO0lBQ0wsb0JBQUM7QUFBRCxDQXBCQSxBQW9CQyxJQUFBO0FBQ1kscUJBQWEsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDOzs7QUN4QmpELDJCQUF1QyxlQUFlLENBQUMsQ0FBQTtBQUN2RCwrQkFBNEIsa0JBQWtCLENBQUMsQ0FBQTtBQUMvQyxpQ0FBOEIsb0JBQW9CLENBQUMsQ0FBQTtBQUVuRDtJQUFBO0lBOEJBLENBQUM7SUE1QkcscUJBQUssR0FBTDtRQUNJLDhCQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEIsa0NBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsb0JBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsSUFBSSxRQUFRLEdBQUcsc0JBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN0QyxJQUFJLFFBQXVCLENBQUM7UUFFNUIsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNmLEtBQUssYUFBbUI7Z0JBQ3BCLFFBQVEsR0FBRyw4QkFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkMsS0FBSyxDQUFDO1lBQ1YsS0FBSyxlQUFxQjtnQkFDdEIsUUFBUSxHQUFHLGtDQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN6QyxLQUFLLENBQUM7WUFDVjtnQkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLHNCQUFTLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLENBQUM7SUFDTCxDQUFDO0lBQ0wsWUFBQztBQUFELENBOUJBLEFBOEJDLElBQUE7QUFDWSxhQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7O0FDakNqQywyQkFBdUMsa0JBQWtCLENBQUMsQ0FBQTtBQUUxRDtJQUVJO1FBQ0ksRUFBRTtJQUNOLENBQUM7SUFFRCwwQkFBSyxHQUFMO1FBQ0ksRUFBRTtJQUNOLENBQUM7SUFFRDs7T0FFRztJQUNILHlDQUFvQixHQUFwQixVQUFxQixHQUFRO1FBQ3pCLE1BQU0sQ0FBQyxDQUFDLHNCQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdCLEtBQUssZUFBcUI7Z0JBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0IsS0FBSyxDQUFDO1lBQ1YsS0FBSyxhQUFtQjtnQkFDcEIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQyxLQUFLLENBQUM7WUFDVjtnQkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDM0MsQ0FBQztJQUNMLENBQUM7SUFFTyxxQ0FBZ0IsR0FBeEIsVUFBeUIsR0FBUTtRQUM3QixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM5QyxFQUFFLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixHQUFHLENBQUMsVUFBVSxDQUFDLGVBQW1CLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUFvQixDQUFDLENBQUM7UUFDekMsQ0FBQztJQUNMLENBQUM7SUFFTyw2Q0FBd0IsR0FBaEMsVUFBaUMsR0FBUTtRQUNyQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUEwQztRQUN2RixNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2QsS0FBSyxDQUFDO2dCQUNGLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEMsS0FBSyxDQUFDO1lBQ1YsS0FBSyxDQUFDO2dCQUNGLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekMsS0FBSyxDQUFDO1lBQ1YsS0FBSyxDQUFDO2dCQUNGLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDMUMsS0FBSyxDQUFDO1lBQ1Y7Z0JBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzNDLENBQUM7SUFDTCxDQUFDO0lBRU8sa0RBQTZCLEdBQXJDLFVBQXNDLEdBQVE7UUFDMUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxvQkFBd0IsQ0FBQyxDQUFDO1FBQ3pDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzlDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLEdBQUcsQ0FBQyxXQUFXLENBQUMsZUFBbUIsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEdBQUcsQ0FBQyxXQUFXLENBQUMsc0JBQTBCLENBQUMsQ0FBQztZQUM1QyxHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFvQixDQUFDLENBQUM7UUFDMUMsQ0FBQztJQUNMLENBQUM7SUFFTyxtREFBOEIsR0FBdEMsVUFBdUMsR0FBUTtRQUMzQyxHQUFHLENBQUMsVUFBVSxDQUFDLHFCQUF5QixDQUFDLENBQUM7UUFDMUMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDOUMsRUFBRSxDQUFDLENBQUMsU0FBUyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxzQkFBMEIsQ0FBQyxDQUFDO1lBQzVDLEdBQUcsQ0FBQyxXQUFXLENBQUMsZUFBbUIsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEdBQUcsQ0FBQyxXQUFXLENBQUMsZ0JBQW9CLENBQUMsQ0FBQztRQUMxQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLG9EQUErQixHQUF2QyxVQUF3QyxHQUFRO1FBQzVDLEdBQUcsQ0FBQyxVQUFVLENBQUMscUJBQXlCLENBQUMsQ0FBQztRQUMxQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM5QyxFQUFFLENBQUMsQ0FBQyxTQUFTLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixHQUFHLENBQUMsV0FBVyxDQUFDLGVBQW1CLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFvQixDQUFDLENBQUM7UUFDMUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILGtDQUFhLEdBQWIsVUFBYyxHQUFRO1FBQ2xCLE1BQU0sQ0FBQyxDQUFDLHNCQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdCLEtBQUssYUFBbUI7Z0JBQ3BCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0IsS0FBSyxDQUFDO1lBQ1YsS0FBSyxlQUFxQjtnQkFDdEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQixLQUFLLENBQUM7WUFDVjtnQkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDM0MsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLHVDQUFrQixHQUExQixVQUEyQixHQUFRO1FBQy9CLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsR0FBRyxDQUFDLFdBQVcsQ0FBQyxzQkFBMEIsQ0FBQyxDQUFDO1lBQzVDLEdBQUcsQ0FBQyxXQUFXLENBQUMsZUFBbUIsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEdBQUcsQ0FBQyxXQUFXLENBQUMsc0JBQTBCLENBQUMsQ0FBQztZQUM1QyxHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFvQixDQUFDLENBQUM7UUFDMUMsQ0FBQztJQUNMLENBQUM7SUFFTyx5Q0FBb0IsR0FBNUIsVUFBNkIsR0FBUTtRQUNqQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM1QyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2IsS0FBSyxDQUFDLENBQUM7WUFDUCxLQUFLLENBQUMsQ0FBQztZQUNQLEtBQUssQ0FBQyxDQUFDO1lBQ1AsS0FBSyxDQUFDO2dCQUNILElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEMsS0FBSyxDQUFDO1lBQ1QsS0FBSyxDQUFDLENBQUM7WUFDUCxLQUFLLENBQUMsQ0FBQztZQUNQLEtBQUssQ0FBQyxDQUFDO1lBQ1AsS0FBSyxDQUFDLENBQUM7WUFDUCxLQUFLLENBQUMsQ0FBQztZQUNQLEtBQUssQ0FBQztnQkFDRixJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25DLEtBQUssQ0FBQztZQUNWO2dCQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUMzQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLDhDQUF5QixHQUFqQyxVQUFrQyxHQUFRO1FBQ3RDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsR0FBRyxDQUFDLFdBQVcsQ0FBQyxxQkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixHQUFHLENBQUMsV0FBVyxDQUFDLG9CQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDTCxDQUFDO0lBRU8sNkNBQXdCLEdBQWhDLFVBQWlDLEdBQVE7UUFDckMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNaLEtBQUssQ0FBQztnQkFDRixHQUFHLENBQUMsV0FBVyxDQUFDLGVBQW1CLENBQUMsQ0FBQztnQkFDckMsS0FBSyxDQUFDO1lBQ1YsS0FBSyxDQUFDO2dCQUNGLEdBQUcsQ0FBQyxXQUFXLENBQUMsZ0JBQW9CLENBQUMsQ0FBQztnQkFDdEMsS0FBSyxDQUFDO1lBQ1YsS0FBSyxDQUFDLENBQUM7WUFDUCxLQUFLLENBQUMsQ0FBQztZQUNQLEtBQUssQ0FBQyxDQUFDO1lBQ1AsS0FBSyxDQUFDLENBQUM7WUFDUCxLQUFLLENBQUMsQ0FBQztZQUNQLEtBQUssQ0FBQztnQkFDRixHQUFHLENBQUMsV0FBVyxDQUFDLG9CQUF3QixDQUFDLENBQUM7Z0JBQzFDLEtBQUssQ0FBQztZQUNWLEtBQUssQ0FBQyxDQUFDO1lBQ1AsS0FBSyxDQUFDLENBQUM7WUFDUCxLQUFLLEVBQUUsQ0FBQztZQUNSLEtBQUssRUFBRSxDQUFDO1lBQ1IsS0FBSyxFQUFFLENBQUM7WUFDUixLQUFLLEVBQUU7Z0JBQ0gsR0FBRyxDQUFDLFdBQVcsQ0FBQyxxQkFBeUIsQ0FBQyxDQUFDO2dCQUMzQyxLQUFLLENBQUM7WUFDVixLQUFLLEVBQUUsQ0FBQztZQUNSLEtBQUssRUFBRSxDQUFDO1lBQ1IsS0FBSyxFQUFFLENBQUM7WUFDUixLQUFLLEVBQUUsQ0FBQztZQUNSLEtBQUssRUFBRSxDQUFDO1lBQ1IsS0FBSyxFQUFFO2dCQUNILEdBQUcsQ0FBQyxXQUFXLENBQUMsc0JBQTBCLENBQUMsQ0FBQztnQkFDNUMsS0FBSyxDQUFDO1lBQ1YsS0FBSyxFQUFFLENBQUM7WUFDUixLQUFLLEVBQUUsQ0FBQztZQUNSLEtBQUssRUFBRSxDQUFDO1lBQ1IsS0FBSyxFQUFFLENBQUM7WUFDUixLQUFLLEVBQUUsQ0FBQztZQUNSLEtBQUssRUFBRTtnQkFDSCxHQUFHLENBQUMsV0FBVyxDQUFDLGNBQWtCLENBQUMsQ0FBQztnQkFDcEMsS0FBSyxDQUFDO1lBQ1Y7Z0JBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzNDLENBQUM7SUFDTCxDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQTlMQSxBQThMQyxJQUFBO0FBQ1ksa0JBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOztBQ25NM0MsNEVBQTRFOztBQUU1RSxvQkFBa0IsT0FDbEIsQ0FBQyxDQUR3QjtBQUV6QiwwQkFBa0MsdUJBQXVCLENBQUMsQ0FBQTtBQUcxRCw4QkFBdUMsaUJBQWlCLENBQUMsQ0FBQTtBQUN6RCw0QkFBeUIsZUFBZSxDQUFDLENBQUE7QUFFekM7SUFPSTtRQUNJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztRQUVuQyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsMEJBQUssR0FBTDtRQUFBLGlCQW1CQztRQWxCRyxvQkFBUSxDQUFDLFFBQVEsQ0FBQyxxQkFBUyxDQUFDLDZCQUE2QixFQUFFLFVBQUMsS0FBZ0M7WUFDeEYsS0FBSSxDQUFDLCtCQUErQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxDQUFDO1FBRUgsNEZBQTRGO1FBRTVGO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxTQUFHLENBQUM7Z0JBQ2Qsd0JBQVUsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDWixNQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLE1BQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7UUFQakMsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRywwQkFBVSxFQUFFLE1BQU0sRUFBRTs7U0FRakQ7UUFFRCw0QkFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLHdCQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELHlCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLElBQUksY0FBYyxHQUFHLDRCQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQVE7WUFDN0IsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyx5Q0FBb0IsR0FBNUIsVUFBNkIsY0FBc0I7UUFDL0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLElBQUksR0FBRyxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7WUFDbkQsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFDdEMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU8sK0NBQTBCLEdBQWxDO1FBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNuQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLHdCQUFVLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekMsQ0FBQztJQUNMLENBQUM7SUFFTyxvREFBK0IsR0FBdkMsVUFBd0MsS0FBZ0M7UUFDcEUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoQixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdCLENBQUM7SUFDTCxDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQXJFQSxBQXFFQyxJQUFBO0FBQ1ksa0JBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOzs7QUNoRjNDLDBCQUFrQyx1QkFBdUIsQ0FBQyxDQUFBO0FBQzFELGlDQUE2Qiw4QkFBOEIsQ0FBQyxDQUFBO0FBQzVELDJDQUFzQyx3Q0FBd0MsQ0FBQyxDQUFBO0FBQy9FLGlDQUE2Qiw4QkFBOEIsQ0FBQyxDQUFBO0FBQzVELHFDQUFpQyxrQ0FBa0MsQ0FBQyxDQUFBO0FBSXBFO0lBY0ksYUFBWSx1QkFBbUM7UUFDM0MsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUU5RCxJQUFJLENBQUMsS0FBSyxHQUFHLHlCQUEwQixDQUFDO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBRXBCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZixJQUFJLENBQUMsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7SUFDM0QsQ0FBQztJQUVELG1CQUFLLEdBQUw7UUFDSSxrQ0FBa0M7UUFDbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsS0FBSyxHQUFJLEVBQUUsQ0FBQztRQUNqQixvQkFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLGlDQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxrQkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNqQixLQUFLLGVBQWdCO2dCQUNqQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ25CLEtBQUssQ0FBQztZQUNWLEtBQUssZ0JBQWlCO2dCQUNsQixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMzQixLQUFLLENBQUM7WUFDVixLQUFLLHlCQUEwQjtnQkFDM0IsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQzdCLEtBQUssQ0FBQztZQUNWO2dCQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUMzQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLHlCQUFXLEdBQW5CO1FBQ0ksc0JBQXNCO0lBQzFCLENBQUM7SUFFTywwQkFBWSxHQUFwQixVQUFxQixPQUFlO1FBQ2hDLElBQUksQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDO1FBRTVCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLHlCQUEwQixDQUFDO1FBQzVDLENBQUM7SUFDTCxDQUFDO0lBRU8sbUNBQXFCLEdBQTdCO1FBQ0ksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDbkMsQ0FBQztJQUNMLENBQUM7SUFFRCx5QkFBVyxHQUFYLFVBQVksVUFBc0IsRUFBRSxXQUFtQjtRQUNuRCxJQUFJLENBQUMsS0FBSyxHQUFHLGdCQUFpQixDQUFDO1FBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRS9CLEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxvQkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDekMsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQ0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxxQkFBd0IsQ0FBQyxDQUFDLENBQUM7WUFDakQsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQ0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQztJQUNMLENBQUM7SUFFRCx5QkFBVyxHQUFYLFVBQVksUUFBcUI7UUFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsNEJBQWMsR0FBZCxVQUFlLENBQVMsRUFBRSxDQUFTO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZixJQUFJLENBQUMsS0FBSyxHQUFHLHlCQUEwQixDQUFDO0lBQzVDLENBQUM7SUFFRDs7O09BR0c7SUFDSCx3QkFBVSxHQUFWLFVBQVcsUUFBcUI7UUFDNUIsSUFBSSxDQUFTLEVBQUUsQ0FBUyxDQUFDO1FBQ3pCLDZDQUFpRCxFQUFoRCxTQUFDLEVBQUUsU0FBQyxDQUE2QztRQUVsRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWYsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSx5Q0FBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztJQUN6RCxDQUFDO0lBRU8sNEJBQWMsR0FBdEIsVUFBdUIsUUFBcUI7UUFDeEMsSUFBSSxDQUFTLEVBQUUsQ0FBUyxDQUFDO1FBQ3pCLDZDQUFpRCxFQUFoRCxTQUFDLEVBQUUsU0FBQyxDQUE2QztRQUNsRCxJQUFJLENBQUMsS0FBSyxHQUFHLGVBQWdCLENBQUM7UUFDOUIsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxvREFBdUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztJQUM5RCxDQUFDO0lBRU8sdUNBQXlCLEdBQWpDLFVBQWtDLFFBQXFCO1FBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVWLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDZixLQUFLLGVBQW1CO2dCQUNwQixxQ0FBeUMsRUFBeEMsU0FBQyxFQUFFLFNBQUMsQ0FBcUM7Z0JBQzFDLEtBQUssQ0FBQztZQUNWLEtBQUssZ0JBQW9CO2dCQUNyQixzQ0FBMEMsRUFBekMsU0FBQyxFQUFFLFNBQUMsQ0FBc0M7Z0JBQzNDLEtBQUssQ0FBQztZQUNWLEtBQUssb0JBQXdCO2dCQUN6QixzQ0FBMEMsRUFBekMsU0FBQyxFQUFFLFNBQUMsQ0FBc0M7Z0JBQzNDLEtBQUssQ0FBQztZQUNWLEtBQUsscUJBQXlCO2dCQUMxQixzQ0FBMEMsRUFBekMsU0FBQyxFQUFFLFNBQUMsQ0FBc0M7Z0JBQzNDLEtBQUssQ0FBQztZQUNWLEtBQUssc0JBQTBCO2dCQUMzQix1Q0FBMkMsRUFBMUMsU0FBQyxFQUFFLFNBQUMsQ0FBdUM7Z0JBQzVDLEtBQUssQ0FBQztZQUNWLEtBQUssY0FBa0I7Z0JBQ25CLHFDQUF5QyxFQUF4QyxTQUFDLEVBQUUsU0FBQyxDQUFxQztnQkFDMUMsS0FBSyxDQUFDO1lBQ1Y7Z0JBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0lBQ2xCLENBQUM7SUFFTywrQkFBaUIsR0FBekIsVUFBMEIsQ0FBUyxFQUFFLENBQVMsRUFBRSxRQUFnQjtRQUM1RCxJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDOUQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDO1FBQzlELE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBQ0wsVUFBQztBQUFELENBekpBLEFBeUpDLElBQUE7QUF6SlksV0FBRyxNQXlKZixDQUFBOzs7QUNqS0QsMkJBQXVDLGtCQUFrQixDQUFDLENBQUE7QUFDMUQsMEJBQTRDLHdCQUF3QixDQUFDLENBQUE7QUFFckUsbURBQW1EO0FBQ3RDLGtCQUFVLEdBQUcsRUFBRSxDQUFDO0FBRTdCLElBQU0sZUFBZSxHQUFHLHlDQUE2QixHQUFHLGtCQUFVLENBQUM7QUFDbkUsSUFBTSxvQkFBb0IsR0FBRyxDQUFDLENBQUM7QUFFL0I7SUFLSTtRQUNJLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELDRCQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCwyQkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFFdkIsTUFBTSxDQUFDLENBQUMsc0JBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsS0FBSyxhQUFtQjtnQkFDcEIsY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pDLEtBQUssQ0FBQztZQUNWLEtBQUssZUFBcUI7Z0JBQ3RCLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMzQyxLQUFLLENBQUM7WUFDVjtnQkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELE1BQU0sQ0FBQyxjQUFjLENBQUM7SUFDMUIsQ0FBQztJQUVELGdDQUFTLEdBQVQsVUFBVSxPQUFlO1FBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLENBQUM7UUFDakMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0lBQ2hDLENBQUM7SUFFRCxrQ0FBVyxHQUFYLFVBQVksT0FBZTtRQUN2QixJQUFJLENBQUMsZUFBZSxJQUFJLE9BQU8sQ0FBQztRQUVoQyxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDLENBQUM7UUFDeEUsRUFBRSxDQUFDLENBQUMsY0FBYyxHQUFHLGtCQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzlCLGNBQWMsR0FBRyxrQkFBVSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxNQUFNLENBQUMsY0FBYyxDQUFDO0lBQzFCLENBQUM7SUFDTCxtQkFBQztBQUFELENBL0NBLEFBK0NDLElBQUE7QUFDWSxvQkFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7OztBQ3hEL0Msc0JBQW9CLGVBQWUsQ0FBQyxDQUFBO0FBQ3BDLG1CQUFpQixTQUFTLENBQUMsQ0FBQTtBQUMzQiw0QkFBeUIsbUJBQW1CLENBQUMsQ0FBQTtBQUM3QywwQkFBa0Msb0JBQW9CLENBQUMsQ0FBQTtBQUV2RCxnQ0FBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQU16RCxpQ0FBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUN6RCw4QkFBMkIsdUJBQXVCLENBQUMsQ0FBQTtBQUNuRCxrQ0FBK0IsMkJBQTJCLENBQUMsQ0FBQTtBQUMzRCx3Q0FBb0Msa0NBQWtDLENBQUMsQ0FBQTtBQUN2RSx1QkFBcUIsVUFBVSxDQUFDLENBQUE7QUFFaEM7SUFTSTtRQUNJLElBQUksaUJBQWlCLEdBQUcsSUFBSSw0QkFBWSxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGFBQUssQ0FBQyxhQUFnQixFQUFFLGlCQUFpQixFQUFFLG9CQUFRLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxvQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFbkUsSUFBSSxjQUFjLEdBQUcsSUFBSSw0QkFBWSxFQUFFLENBQUM7UUFDeEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGFBQUssQ0FBQyxVQUFhLEVBQUUsY0FBYyxFQUFFLG9CQUFRLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxvQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFN0QsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLE9BQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELCtCQUFLLEdBQUw7UUFBQSxpQkEyQkM7UUExQkcsb0JBQVEsQ0FBQyxRQUFRLENBQUMscUJBQVMsQ0FBQyx1QkFBdUIsRUFBRSxVQUFDLEtBQTBCO1lBQzVFLEtBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQztRQUVILG9CQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFTLENBQUMsbUJBQW1CLEVBQUUsVUFBQyxLQUFzQjtZQUNwRSxLQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxvQkFBUSxDQUFDLFFBQVEsQ0FBQyxxQkFBUyxDQUFDLG9DQUFvQyxFQUFFLFVBQUMsS0FBdUM7WUFDdEcsS0FBSSxDQUFDLHFDQUFxQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO1FBRUgsb0JBQVEsQ0FBQyxRQUFRLENBQUMscUJBQVMsQ0FBQyxvQkFBb0IsRUFBRSxVQUFDLEtBQXVCO1lBQ3RFLEtBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztRQUVILG9CQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFTLENBQUMsMkJBQTJCLEVBQUUsVUFBQyxLQUE4QjtZQUNwRixLQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLHdCQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFbkIsa0VBQWtFO1FBQ2xFLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsOEJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRCLHdCQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpCLE1BQU0sQ0FBQyxlQUFxQixDQUFDO0lBQ2pDLENBQUM7SUFFTyw4Q0FBb0IsR0FBNUIsVUFBNkIsS0FBMEI7UUFDbkQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVyRCxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNyQixLQUFLLGdDQUFjLENBQUMsSUFBSTtnQkFDcEIsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN0QixLQUFLLENBQUM7WUFDVixLQUFLLGdDQUFjLENBQUMsS0FBSztnQkFDckIsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN2QixLQUFLLENBQUM7WUFDVixLQUFLLGdDQUFjLENBQUMsSUFBSTtnQkFDcEIsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN0QixLQUFLLENBQUM7WUFDVixLQUFLLGdDQUFjLENBQUMsSUFBSTtnQkFDcEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFHLDhFQUE4RTtnQkFDMUgsQ0FBQztnQkFDRCxLQUFLLENBQUM7WUFDVixLQUFLLGdDQUFjLENBQUMsZUFBZTtnQkFDL0IsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzdCLEtBQUssQ0FBQztZQUNWO2dCQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDbEMsS0FBSyxDQUFDO1FBQ2QsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLCtDQUFxQixHQUE3QixVQUE4QixLQUFzQjtRQUNoRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9ELEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU8sK0RBQXFDLEdBQTdDLFVBQThDLEtBQXVDO1FBQ2pGLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckQsS0FBSyxDQUFDLHlCQUF5QixFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVEOztPQUVHO0lBQ0ssMkNBQWlCLEdBQXpCLFVBQTBCLFVBQXNCO1FBQzVDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxhQUFnQixDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMzQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0sscURBQTJCLEdBQW5DLFVBQW9DLFVBQXNCO1FBQ3RELEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxhQUFnQixDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMzQixDQUFDO0lBQ0wsQ0FBQztJQUVPLGdEQUFzQixHQUE5QixVQUErQixLQUF1QjtRQUNsRCxJQUFJLEtBQVksQ0FBQztRQUNqQixJQUFJLGdCQUFrQyxDQUFDO1FBQ3ZDLElBQUksRUFBVSxDQUFDO1FBRWYsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsS0FBSyxhQUFnQixDQUFDLENBQUMsQ0FBQztZQUN4QyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUN4QixnQkFBZ0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUM7WUFDOUMsRUFBRSxHQUFHLENBQUMsZUFBTSxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNyQixnQkFBZ0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7WUFDM0MsRUFBRSxHQUFHLENBQUMsZUFBTSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQ0FBYyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUQsNEVBQTRFO1FBRTVFLG9CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksK0NBQXFCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDM0QsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO1lBQzFCLHFDQUFxQztRQUN6QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyx1REFBNkIsR0FBckMsVUFBc0MsS0FBOEI7UUFDaEUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxVQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1FBRVIsQ0FBQztJQUNMLENBQUM7SUFDTCxzQkFBQztBQUFELENBN0pBLEFBNkpDLElBQUE7QUFDWSx1QkFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7OztBQ2hMckQsMEJBQW9DLHFCQUFxQixDQUFDLENBQUE7QUFFN0MsY0FBTSxHQUFHLGlDQUFxQixDQUFDLENBQUMsNkZBQTZGO0FBRTFJO0lBSUk7UUFDSSxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQU0sQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLGNBQU0sQ0FBQztJQUM5QixDQUFDO0lBQ0wsYUFBQztBQUFELENBUkEsQUFRQyxJQUFBO0FBQ1ksY0FBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7OztBQ2JuQywrQ0FBMEMsK0NBQStDLENBQUMsQ0FBQTtBQUMxRixtQ0FBZ0Msb0NBQW9DLENBQUMsQ0FBQTtBQUNyRSw2QkFBMEIsc0JBQXNCLENBQUMsQ0FBQTtBQUVqRDtJQU9JO1FBQ0ksSUFBSSxDQUFDLFVBQVUsR0FBb0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsY0FBYyxHQUFvQixRQUFRLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLFlBQVksR0FBb0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsVUFBVSxHQUF5QixRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFRCwyQkFBTyxHQUFQLFVBQVEsd0JBQW9DO1FBQTVDLGlCQWdDQztRQS9CRyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZCxJQUFJLGdCQUFnQixHQUFHLFVBQUMsT0FBZ0I7WUFDcEMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDVixLQUFLLEVBQUUsQ0FBQztnQkFDUixLQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsR0FBRyxTQUFTLEdBQUcsS0FBSyxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsY0FBYyxDQUFDO2dCQUN0RixFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDakIsS0FBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNmLHdCQUF3QixFQUFFLENBQUM7b0JBQzNCLEtBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDeEIsQ0FBQztnQkFDRCxLQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDekQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEtBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxHQUFHLG1FQUFtRSxDQUFDO1lBQ3hHLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixLQUFLLElBQUksNERBQTJCLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBZ0I7WUFDMUQsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLElBQUksc0NBQWlCLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBZ0I7WUFDaEQsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLElBQUksMEJBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFnQjtZQUMxQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU8sMkJBQU8sR0FBZjtRQUFBLGlCQU1DO1FBTEcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO1FBQ2hELFVBQVUsQ0FBQztZQUNQLEtBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDM0MsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsaURBQWlEO0lBQy9ELENBQUM7SUFFRDs7T0FFRztJQUNLLGdDQUFZLEdBQXBCO1FBQ0ksMEJBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBQ0wsZ0JBQUM7QUFBRCxDQTlEQSxBQThEQyxJQUFBO0FBQ1ksaUJBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDOzs7QUNqRXpDLDhCQUEyQixpQkFBaUIsQ0FBQyxDQUFBO0FBRTdDLDBCQU1PLHFCQUFxQixDQUFDLENBQUE7QUFFN0Isc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQixJQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQztBQUUzQjtJQUFBO0lBaUVBLENBQUM7SUEvREcsNkJBQU8sR0FBUCxVQUFRLG1CQUErQztRQUNuRCxDQUFDO1lBQ0csSUFBSSxtQkFBaUIsR0FBRyxJQUFJLElBQUksQ0FBQztnQkFDN0IsR0FBRyxFQUFFLENBQUMsb0JBQW9CLENBQUM7Z0JBQzNCLE1BQU0sRUFBRSxJQUFJO2FBQ2YsQ0FBQyxDQUFDO1lBQ0gsbUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDM0IsNEJBQVksQ0FBQyxTQUFTLENBQUMsMEJBQWMsRUFBRSxtQkFBaUIsQ0FBQyxDQUFDO2dCQUMxRCxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztZQUNILG1CQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2hDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVELENBQUM7WUFDRyxJQUFJLGtCQUFnQixHQUFHLElBQUksSUFBSSxDQUFDO2dCQUM1QixHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztnQkFDMUIsTUFBTSxFQUFFLEdBQUc7YUFDZCxDQUFDLENBQUM7WUFDSCxrQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUMxQiw0QkFBWSxDQUFDLFNBQVMsQ0FBQyx5QkFBYSxFQUFFLGtCQUFnQixDQUFDLENBQUM7Z0JBQ3hELG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsa0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDL0IsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0lBQzVCLENBQUM7SUFFRCxrQ0FBWSxHQUFaO1FBQ0ksQ0FBQztZQUNHLElBQUksZUFBYSxHQUFHLElBQUksSUFBSSxDQUFDO2dCQUN6QixHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDdkIsTUFBTSxFQUFFLEdBQUc7YUFDZCxDQUFDLENBQUM7WUFDSCxlQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDdkIsNEJBQVksQ0FBQyxTQUFTLENBQUMsc0JBQVUsRUFBRSxlQUFhLENBQUMsQ0FBQztZQUN0RCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFRCxDQUFDO1lBQ0csSUFBSSxrQkFBZ0IsR0FBRyxJQUFJLElBQUksQ0FBQztnQkFDNUIsR0FBRyxFQUFFLENBQUMsb0JBQW9CLENBQUM7Z0JBQzNCLE1BQU0sRUFBRSxHQUFHO2FBQ2QsQ0FBQyxDQUFDO1lBQ0gsa0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDMUIsNEJBQVksQ0FBQyxTQUFTLENBQUMsMEJBQWMsRUFBRSxrQkFBZ0IsQ0FBQyxDQUFDO1lBQzdELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVELENBQUM7WUFDRyxJQUFJLHFCQUFtQixHQUFHLElBQUksSUFBSSxDQUFDO2dCQUMvQixHQUFHLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztnQkFDN0IsTUFBTSxFQUFFLEdBQUc7YUFDZCxDQUFDLENBQUM7WUFDSCxxQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUM3Qiw0QkFBWSxDQUFDLFNBQVMsQ0FBQyw0QkFBZ0IsRUFBRSxxQkFBbUIsQ0FBQyxDQUFDO1lBQ2xFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7SUFDTCxrQkFBQztBQUFELENBakVBLEFBaUVDLElBQUE7QUFDWSxtQkFBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7O0FDbEY3Qyx5RUFBeUU7O0FBSXpFLDBCQUFrQyxvQkFBb0IsQ0FBQyxDQUFBO0FBR3ZELDBCQU9PLHFCQUFxQixDQUFDLENBQUE7QUFFN0IsSUFBTSxTQUFTLEdBQUcseUJBQXlCLENBQUM7QUFFNUM7SUFPSTtRQVBKLGlCQWdKQztRQXhJTyxJQUFJLENBQUMsa0JBQWtCLEdBQW9CLFFBQVEsQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUUzRixJQUFJLENBQUMsa0JBQWtCLEdBQXNCLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDckYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sR0FBRztZQUM5QixLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7T0FFRztJQUNILDZCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQsNEJBQUssR0FBTDtRQUFBLGlCQVdDO1FBVkcsb0JBQVEsQ0FBQyxRQUFRLENBQUMscUJBQVMsQ0FBQyxvQkFBb0IsRUFBRSxVQUFDLEtBQTRCO1lBQzNFLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixLQUFLLGFBQW1CO29CQUNwQixLQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3RCLEtBQUssQ0FBQztnQkFDVixLQUFLLGVBQXFCO29CQUN0QixLQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDeEIsS0FBSyxDQUFDO1lBQ2QsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELDJCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLEVBQUU7SUFDTixDQUFDO0lBRUQsZ0NBQVMsR0FBVCxVQUFVLEdBQVcsRUFBRSxLQUFVO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDSyx5Q0FBa0IsR0FBMUIsVUFBMkIsSUFBYztRQUF6QyxpQkFrQ0M7UUFqQ0csd0JBQXdCO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2Ysc0RBQXNEO1lBQ3RELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQzNDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksVUFBVSxTQUFRLENBQUM7WUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDUCxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxpQ0FBaUM7UUFDakMsVUFBVSxDQUFDO1lBQ1AsS0FBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDZixJQUFJLFVBQVUsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNuRCxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDdkIsS0FBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7b0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RCLENBQUM7WUFDTCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxVQUFVLFNBQVEsQ0FBQztnQkFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDUCxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUN2QixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLENBQUM7Z0JBQ0QsY0FBYyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDbEQsQ0FBQztRQUNMLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNWLENBQUM7SUFFTyxxQ0FBYyxHQUF0QjtRQUNJLElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsMEJBQWMsQ0FBQyxDQUFDO1FBQ3ZELGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV6QixJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHlCQUFhLENBQUMsQ0FBQztRQUNyRCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7T0FHRztJQUNLLHVDQUFnQixHQUF4QjtRQUFBLGlCQWlCQztRQWhCRyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBVSxDQUFDLENBQUM7UUFDL0MsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQywwQkFBYyxDQUFDLENBQUM7UUFDdEQsRUFBRSxDQUFDLENBQUMsYUFBYSxJQUFJLElBQUksSUFBSSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BELElBQUksa0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMseUJBQWEsQ0FBQyxDQUFDO1lBQ3JELGtCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QixrQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUN6QixrQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDMUIsS0FBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUV0QixtQ0FBbUM7Z0JBQ25DLEtBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0oseUNBQXlDO1lBQ3pDLFVBQVUsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLGdCQUFnQixFQUFFLEVBQXZCLENBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEQsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLCtDQUF3QixHQUFoQztRQUFBLGlCQVVDO1FBVEcsSUFBSSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyw0QkFBZ0IsQ0FBQyxDQUFDO1FBQzNELEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDOUIsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9CLG1CQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLHlDQUE2QixDQUFDLENBQUM7WUFDbEUsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0oseUNBQXlDO1lBQ3pDLFVBQVUsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLHdCQUF3QixFQUFFLEVBQS9CLENBQStCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUQsQ0FBQztJQUNMLENBQUM7SUFFTyxxQ0FBYyxHQUF0QjtRQUFBLGlCQUlDO1FBSEcsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQVUsQ0FBQyxDQUFDO1FBQy9DLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGlCQUFpQixFQUFFLEVBQXhCLENBQXdCLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU8sd0NBQWlCLEdBQXpCO1FBQUEsaUJBSUM7UUFIRyxJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLDBCQUFjLENBQUMsQ0FBQztRQUN0RCxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsY0FBYyxFQUFFLEVBQXJCLENBQXFCLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQWhKQSxBQWdKQyxJQUFBO0FBQ1ksb0JBQVksR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDOzs7QUNqSy9DLElBQU0sWUFBWSxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUM7QUFFMUI7SUFJSTtRQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELDBDQUFrQixHQUFsQixVQUFtQixRQUFhO1FBQzVCLElBQUksaUJBQWlCLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQy9ELElBQUksS0FBYSxFQUFFLE1BQWMsQ0FBQztRQUNsQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ25DLHdDQUF3QztZQUN4QyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDO1lBQ3RELE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsaUJBQWlCLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQztZQUMzQyx1REFBdUQ7WUFDdkQsS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDMUIsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEMsMEVBQTBFO1FBQzFFLCtEQUErRDtRQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDekMsQ0FBQztJQUNMLG9CQUFDO0FBQUQsQ0ExQkEsQUEwQkMsSUFBQTtBQUNZLHFCQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQzs7O0FDN0JqRCx5QkFBeUI7QUFDekIsSUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFFM0I7SUFLSTtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELG1DQUFPLEdBQVAsVUFBUSxtQkFBK0M7UUFBdkQsaUJBaUJDO1FBaEJHLElBQUksU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxVQUFDLFNBQWM7WUFDaEQsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3BCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTFCLElBQUksU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3RDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QixTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFVBQUMsR0FBUTtnQkFDMUMsS0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3pCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUMsRUFBRSxTQUFTLEVBQUUsY0FBUSxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pELENBQUMsRUFBRSxTQUFTLEVBQUUsY0FBUSxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztJQUM1QixDQUFDO0lBRUQsdUNBQVcsR0FBWDtRQUNJLElBQUksUUFBYSxDQUFDO1FBRWxCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUxQixNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFDTCx3QkFBQztBQUFELENBMUNBLEFBMENDLElBQUE7QUFDWSx5QkFBaUIsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7OztBQzlDekQsbUNBQWdDLHNCQUFzQixDQUFDLENBQUE7QUFFdkQ7SUFJSTtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVELHdCQUFLLEdBQUw7UUFDSSxJQUFJLEdBQUcsR0FBRyxzQ0FBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMxQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFcEIseURBQXlEO1FBQ3pELElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0MsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFJLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU5QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsdUJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsRUFBRTtJQUNOLENBQUM7SUFDTCxlQUFDO0FBQUQsQ0ExQkEsQUEwQkMsSUFBQTtBQTFCWSxnQkFBUSxXQTBCcEIsQ0FBQTs7O0FDM0JELDBCQUFvQyx3QkFBd0IsQ0FBQyxDQUFBO0FBRTdELElBQU0saUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLElBQU0sYUFBYSxHQUFHLGlDQUFxQixDQUFDO0FBQzVDLElBQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0FBRTlCO0lBQUE7UUFDSSxNQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ04sWUFBTyxHQUFHLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBQUQsNEJBQUM7QUFBRCxDQUhBLEFBR0MsSUFBQTtBQUVEOztHQUVHO0FBQ0gsV0FBWSxnQkFBZ0I7SUFDeEIsNkVBQWUsQ0FBQTtJQUNmLDZFQUFlLENBQUE7SUFDZiwrRUFBZ0IsQ0FBQTtJQUNoQiwrRUFBZ0IsQ0FBQTtBQUNwQixDQUFDLEVBTFcsd0JBQWdCLEtBQWhCLHdCQUFnQixRQUszQjtBQUxELElBQVksZ0JBQWdCLEdBQWhCLHdCQUtYLENBQUE7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSDtJQVFJO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVuQixHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDL0MsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6RCxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCO1lBQy9FLElBQUksT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUVELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLHFCQUFxQixFQUFFLENBQUM7UUFDekQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUVELHVCQUFLLEdBQUw7UUFDSSxHQUFHLENBQUMsQ0FBZ0IsVUFBYSxFQUFiLEtBQUEsSUFBSSxDQUFDLFFBQVEsRUFBYixjQUFhLEVBQWIsSUFBYSxDQUFDO1lBQTdCLElBQUksT0FBTyxTQUFBO1lBQ1osSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDM0I7UUFFRCwyQ0FBMkM7UUFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVsQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDL0IsQ0FBQztJQUVELHNCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQztZQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakUsQ0FBQztJQUNMLENBQUM7SUFFRCxnQ0FBYyxHQUFkLFVBQWUsU0FBbUIsRUFBRSxTQUEyQixFQUFFLFFBQXFCO1FBQXRGLGlCQXVDQztRQXRDRyxnREFBZ0Q7UUFDaEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTVCLElBQUksSUFBWSxDQUFDO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsSUFBSSxTQUFTLEtBQUssZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNwRyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDakQsSUFBSSxHQUFHLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsSUFBSSxTQUFTLEtBQUssZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUMzRyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztZQUNsRCxJQUFJLEdBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBQ0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO2FBQzFELEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxJQUFJLEVBQUMsRUFBRSxpQkFBaUIsQ0FBQzthQUNoQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2FBQ2xDLFFBQVEsQ0FBQztZQUNOLDZEQUE2RDtZQUM3RCxJQUFJLElBQVksRUFBRSxJQUFZLENBQUM7WUFDL0IsRUFBRSxDQUFDLENBQUMsU0FBUyxLQUFLLGdCQUFnQixDQUFDLGdCQUFnQixJQUFJLFNBQVMsS0FBSyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2dCQUNwRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2dCQUNULElBQUksR0FBRyxDQUFDLENBQUM7WUFDYixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsSUFBSSxTQUFTLEtBQUssZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDM0csSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFDVCxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsQ0FBQztZQUNELEdBQUcsQ0FBQyxDQUFnQixVQUFhLEVBQWIsS0FBQSxLQUFJLENBQUMsUUFBUSxFQUFiLGNBQWEsRUFBYixJQUFhLENBQUM7Z0JBQTdCLElBQUksT0FBTyxTQUFBO2dCQUNaLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztnQkFDakUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7YUFDOUM7UUFDTCxDQUFDLENBQUM7YUFDRCxVQUFVLENBQUMsY0FBUSxLQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdkQsS0FBSyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssNkJBQVcsR0FBbkIsVUFBb0IsU0FBbUI7UUFDbkMsR0FBRyxDQUFDLENBQWdCLFVBQWEsRUFBYixLQUFBLElBQUksQ0FBQyxRQUFRLEVBQWIsY0FBYSxFQUFiLElBQWEsQ0FBQztZQUE3QixJQUFJLE9BQU8sU0FBQTtZQUNaLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1NBQzNCO1FBRUQsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDOUMsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFakMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVyQyxzREFBc0Q7WUFDdEQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztZQUNwRCxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztZQUNwRCxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1lBRTNDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUVPLG1DQUFpQixHQUF6QixVQUEwQixRQUFxQjtRQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFekIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNYLFFBQVEsRUFBRSxDQUFDO1FBQ2YsQ0FBQztJQUNMLENBQUM7SUFDTCxjQUFDO0FBQUQsQ0F2SEEsQUF1SEMsSUFBQTtBQXZIWSxlQUFPLFVBdUhuQixDQUFBOzs7QUN2SkQsMEJBQW9DLHdCQUF3QixDQUFDLENBQUE7QUFHN0Q7SUFNSSxrQkFBWSxhQUE0QjtRQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWxDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBRWpCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsaUNBQXFCLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUNuRCxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2pELElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDN0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUUvQyxJQUFJLENBQUMsU0FBUSxDQUFDO1lBQ2QsRUFBRSxDQUFDLENBQUMsYUFBYSxLQUFLLDRCQUFrQyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNaLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixDQUFDLEdBQUcsaUNBQXFCLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QixLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUV0QixnQ0FBZ0M7WUFDaEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pDLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDO1lBRXZDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLENBQUM7SUFDTCxDQUFDO0lBRUQsd0JBQUssR0FBTDtRQUNJLEdBQUcsQ0FBQyxDQUFjLFVBQVcsRUFBWCxLQUFBLElBQUksQ0FBQyxNQUFNLEVBQVgsY0FBVyxFQUFYLElBQVcsQ0FBQztZQUF6QixJQUFJLEtBQUssU0FBQTtZQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3pCO1FBRUQscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQ0FBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsdUJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsRUFBRTtJQUNOLENBQUM7SUFFRDs7O09BR0c7SUFDSCwyQkFBUSxHQUFSLFVBQVMsRUFBVSxFQUFFLFNBQWtCO1FBQ25DLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxpQ0FBcUIsQ0FBQyxDQUFDLENBQUM7WUFDN0IsRUFBRSxHQUFHLGlDQUFxQixDQUFDO1FBQy9CLENBQUM7UUFFRCxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDaEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUU3QixFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDWCxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN6QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDMUIsQ0FBQztRQUNMLENBQUM7UUFFRCw2RkFBNkY7UUFDN0YsRUFBRSxDQUFDLENBQUMsU0FBUyxLQUFLLElBQUksSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9ELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLDZFQUE2RTtZQUMzRixJQUFJLFFBQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLElBQUksUUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWxDLElBQUksT0FBSyxHQUFHLENBQUMsQ0FBQztZQUNkLElBQUksYUFBVyxHQUFHLFdBQVcsQ0FBQztnQkFDMUIsT0FBSyxFQUFFLENBQUM7Z0JBQ1IsRUFBRSxDQUFDLENBQUMsT0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ2IsUUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7b0JBQ3ZCLFFBQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO29CQUN2QixhQUFhLENBQUMsYUFBVyxDQUFDLENBQUM7Z0JBQy9CLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osUUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFFBQU0sQ0FBQyxPQUFPLENBQUM7b0JBQ2pDLFFBQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxRQUFNLENBQUMsT0FBTyxDQUFDO2dCQUNyQyxDQUFDO1lBQ0wsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1osQ0FBQztRQUVELGdFQUFnRTtJQUNwRSxDQUFDO0lBQ0wsZUFBQztBQUFELENBNUZBLEFBNEZDLElBQUE7QUE1RlksZ0JBQVEsV0E0RnBCLENBQUE7OztBQzlGRCx5QkFBdUIsWUFBWSxDQUFDLENBQUE7QUFDcEMsd0JBQXNCLFdBQVcsQ0FBQyxDQUFBO0FBQ2xDLDBCQUF1QixhQUFhLENBQUMsQ0FBQTtBQUdyQyx3QkFBK0IsV0FBVyxDQUFDLENBQUE7QUFDM0MsMEJBQW9DLHdCQUF3QixDQUFDLENBQUE7QUFFN0QsbUZBQW1GO0FBQ3RFLG1CQUFXLEdBQUcsRUFBRSxDQUFDO0FBRTlCLElBQU0sd0JBQXdCLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLElBQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQztBQUV2QjtJQUFBO0lBRUEsQ0FBQztJQUFELHdCQUFDO0FBQUQsQ0FGQSxBQUVDLElBQUE7QUFFRDtJQXVCSSxzQkFBWSxhQUE0QixFQUFFLGlCQUFvQztRQUMxRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWxDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFRLEVBQUUsQ0FBQztRQUUvQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7UUFDM0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLGlCQUFPLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksaUJBQU8sRUFBRSxDQUFDO1FBRXBDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxvQkFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsbUJBQVcsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDO1lBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzNCLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsaUNBQXFCLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQztnQkFDbEUsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLGtCQUFrQjtnQkFDbEYsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO2dCQUNyRSxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUMvQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFFdEIsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO2dCQUNqQixJQUFJLENBQUMsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsdUNBQXVDO2dCQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ1YsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDNUMsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN0QixHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLHdCQUF3QixFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDNUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvRCxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7WUFDckUsSUFBSSxVQUFVLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQztRQUU5QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBRUQsNEJBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWhDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFdEIsR0FBRyxDQUFDLENBQWMsVUFBVyxFQUFYLEtBQUEsSUFBSSxDQUFDLE1BQU0sRUFBWCxjQUFXLEVBQVgsSUFBVyxDQUFDO1lBQXpCLElBQUksS0FBSyxTQUFBO1lBQ1YsR0FBRyxDQUFDLENBQWMsVUFBSyxFQUFMLGVBQUssRUFBTCxtQkFBSyxFQUFMLElBQUssQ0FBQztnQkFBbkIsSUFBSSxLQUFLLGNBQUE7Z0JBQ1YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDOUI7U0FDSjtRQUVELEdBQUcsQ0FBQyxDQUFtQixVQUFnQixFQUFoQixLQUFBLElBQUksQ0FBQyxXQUFXLEVBQWhCLGNBQWdCLEVBQWhCLElBQWdCLENBQUM7WUFBbkMsSUFBSSxVQUFVLFNBQUE7WUFDZixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNuQztRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV0QyxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV2Qyw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7YUFDcEQsRUFBRSxDQUFDLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBQyxFQUFFLEdBQUcsQ0FBQzthQUNyQixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO2FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDVixNQUFNLENBQUMsUUFBUSxDQUFDO2FBQ2hCLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsMkJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsb0NBQWEsR0FBYixVQUFjLFFBQWdCLEVBQUUsUUFBZ0I7UUFDNUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1QyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUMxQixDQUFDO0lBRUQsbUNBQVksR0FBWixVQUFhLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxLQUFhO1FBQzFELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsNkNBQXNCLEdBQXRCLFVBQXVCLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxLQUFhO1FBQ3BFLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0MsMkRBQTJEO1FBQzNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxtQkFBVyxDQUFDLENBQUMsQ0FBQztZQUMxQixVQUFVLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUMvQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixVQUFVLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUM5QixDQUFDO1FBRUQsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyx1Q0FBdUM7UUFDN0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsa0RBQTJCLEdBQTNCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ3JDLENBQUM7SUFFRCx3Q0FBaUIsR0FBakIsVUFBa0IsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLEtBQWE7UUFDL0QsMkRBQTJEO1FBQzNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxtQkFBVyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDckMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRUQsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyx1Q0FBdUM7UUFDN0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELCtCQUFRLEdBQVIsVUFBUyxFQUFVLEVBQUUsU0FBa0I7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxnREFBeUIsR0FBekIsVUFBMEIsU0FBbUIsRUFBRSxRQUFvQjtRQUMvRCxJQUFJLGdCQUFrQyxDQUFDO1FBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxtQkFBNkIsQ0FBQyxDQUFDLENBQUM7WUFDM0QsZ0JBQWdCLEdBQUcsMEJBQWdCLENBQUMsZUFBZSxDQUFDO1FBQ3hELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLGdCQUFnQixHQUFHLDBCQUFnQixDQUFDLGVBQWUsQ0FBQztRQUN4RCxDQUFDO1FBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFRCxtREFBNEIsR0FBNUIsVUFBNkIsVUFBa0I7UUFDM0MsRUFBRSxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUNELElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVsRCxJQUFJLGdCQUFrQyxDQUFDO1FBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxtQkFBNkIsQ0FBQyxDQUFDLENBQUM7WUFDM0QsZ0JBQWdCLEdBQUcsMEJBQWdCLENBQUMsZ0JBQWdCLENBQUM7UUFDekQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osZ0JBQWdCLEdBQUcsMEJBQWdCLENBQUMsZ0JBQWdCLENBQUM7UUFDekQsQ0FBQztRQUVELElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxvREFBNkIsR0FBN0I7UUFDSSxHQUFHLENBQUMsQ0FBbUIsVUFBZ0IsRUFBaEIsS0FBQSxJQUFJLENBQUMsV0FBVyxFQUFoQixjQUFnQixFQUFoQixJQUFnQixDQUFDO1lBQW5DLElBQUksVUFBVSxTQUFBO1lBQ2YsVUFBVSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7U0FDOUI7UUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDckMsQ0FBQztJQUVPLHdDQUFpQixHQUF6QjtRQUNJLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixJQUFJLHdCQUF3QixDQUFDLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFFTyxnQ0FBUyxHQUFqQixVQUFrQixPQUFlO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxHQUFHLENBQUMsQ0FBYyxVQUFXLEVBQVgsS0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLGNBQVcsRUFBWCxJQUFXLENBQUM7WUFBekIsSUFBSSxLQUFLLFNBQUE7WUFDVixHQUFHLENBQUMsQ0FBYyxVQUFLLEVBQUwsZUFBSyxFQUFMLG1CQUFLLEVBQUwsSUFBSyxDQUFDO2dCQUFuQixJQUFJLEtBQUssY0FBQTtnQkFDVixLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7YUFDbkU7U0FDSjtJQUNMLENBQUM7SUFDTCxtQkFBQztBQUFELENBak9BLEFBaU9DLElBQUE7QUFqT1ksb0JBQVksZUFpT3hCLENBQUE7OztBQ3RQRCwwQkFBa0MsdUJBQXVCLENBQUMsQ0FBQTtBQUsxRCxxREFBK0Msa0RBQWtELENBQUMsQ0FBQTtBQUVsRyw4QkFBd0MsaUJBQWlCLENBQUMsQ0FBQTtBQUsxRDtJQUtJLHFCQUFZLFlBQTBCLEVBQUUsVUFBc0I7UUFDMUQsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUVELDJCQUFLLEdBQUw7UUFBQSxpQkFnQ0M7UUEvQkcsb0JBQVEsQ0FBQyxRQUFRLENBQUMscUJBQVMsQ0FBQywyQkFBMkIsRUFBRSxVQUFDLEtBQThCO1lBQ3BGLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLEtBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxvQkFBUSxDQUFDLFFBQVEsQ0FBQyxxQkFBUyxDQUFDLG1CQUFtQixFQUFFLFVBQUMsS0FBc0I7WUFDcEUsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDdkMsS0FBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILG9CQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFTLENBQUMsbUJBQW1CLEVBQUUsVUFBQyxLQUFzQjtZQUNwRSxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxLQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixLQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxRCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxvQkFBUSxDQUFDLFFBQVEsQ0FBQyxxQkFBUyxDQUFDLGtCQUFrQixFQUFFLFVBQUMsS0FBcUI7WUFDbEUsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDdkMsS0FBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILG9CQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFTLENBQUMseUJBQXlCLEVBQUUsVUFBQyxLQUE0QjtZQUNoRixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxLQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELDBCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLEVBQUU7SUFDTixDQUFDO0lBRU8sbURBQTZCLEdBQXJDLFVBQXNDLEtBQThCO1FBQ2hFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDNUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNwQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFakQsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZDLEdBQUcsQ0FBQyxDQUFlLFVBQU8sRUFBUCxtQkFBTyxFQUFQLHFCQUFPLEVBQVAsSUFBTyxDQUFDO1lBQXRCLElBQUksTUFBTSxnQkFBQTtZQUNYLElBQUksY0FBYyxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksY0FBYyxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVoRixZQUFZLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6QixZQUFZLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztTQUM1QjtRQUVELElBQUksSUFBSSxHQUFHLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsWUFBWSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDekMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsSUFBSSxFQUFFLFFBQVEsR0FBRyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFN0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxhQUFnQixDQUFDLENBQUMsQ0FBQztZQUN2QyxJQUFJLHdCQUF3QixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUVuRixDQUFDO0lBQ0wsQ0FBQztJQUVPLDJDQUFxQixHQUE3QixVQUE4QixLQUFzQjtRQUNoRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSwyQkFBVyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsQ0FBQyx5QkFBeUI7UUFDckMsQ0FBQztRQUVELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxhQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlELENBQUM7SUFDTCxDQUFDO0lBRU8sd0NBQWtCLEdBQTFCLFVBQTJCLGFBQXVCO1FBQWxELGlCQVVDO1FBVEcsSUFBSSxTQUFTLEdBQWEsRUFBRSxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxDQUFxQixVQUFhLEVBQWIsK0JBQWEsRUFBYiwyQkFBYSxFQUFiLElBQWEsQ0FBQztZQUFsQyxJQUFJLFlBQVksc0JBQUE7WUFDakIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3BELFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDNUI7UUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsRUFBRTtZQUNuRCxvQkFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLHVFQUFnQyxDQUFDLEtBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7OztNQUtFO0lBQ00sMENBQW9CLEdBQTVCLFVBQTZCLFlBQW9CO1FBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsNEJBQTRCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVPLDBDQUFvQixHQUE1QixVQUE2QixLQUFxQjtRQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRU8saURBQTJCLEdBQW5DLFVBQW9DLEtBQTRCO1FBQzVELElBQUksQ0FBQyxZQUFZLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssdUNBQWlCLEdBQXpCLFVBQTBCLEdBQVc7UUFDakMsSUFBSSxLQUFLLEdBQUcsQ0FBQywyQkFBVyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTyxrQ0FBWSxHQUFwQixVQUFxQixLQUFZO1FBQzdCLElBQUksS0FBYSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDWixLQUFLLFlBQVU7Z0JBQ1gsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDakIsS0FBSyxDQUFDO1lBQ1YsS0FBSyxjQUFZO2dCQUNiLEtBQUssR0FBRyxRQUFRLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLEtBQUssY0FBWTtnQkFDYixLQUFLLEdBQUcsUUFBUSxDQUFDO2dCQUNqQixLQUFLLENBQUM7WUFDVixLQUFLLGFBQVc7Z0JBQ1osS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDakIsS0FBSyxDQUFDO1lBQ1YsS0FBSyxXQUFTO2dCQUNWLEtBQUssR0FBRyxRQUFRLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLEtBQUssWUFBVTtnQkFDWCxLQUFLLEdBQUcsUUFBUSxDQUFDO2dCQUNqQixLQUFLLENBQUM7WUFDVixLQUFLLGNBQVk7Z0JBQ2IsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDakIsS0FBSyxDQUFDO1lBQ1YsS0FBSyxhQUFXO2dCQUNaLEtBQUssR0FBRyxRQUFRLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNWLG9DQUFvQztZQUNwQyxLQUFLLGFBQVcsQ0FBQztZQUNqQjtnQkFDSSxLQUFLLEdBQUcsUUFBUSxDQUFDO2dCQUNqQixLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0wsa0JBQUM7QUFBRCxDQXBLQSxBQW9LQyxJQUFBO0FBcEtZLG1CQUFXLGNBb0t2QixDQUFBOzs7QUM5S0Qsd0NBQXdDO0FBQzNCLHlCQUFpQixHQUFLLEdBQUcsQ0FBQztBQUMxQiwwQkFBa0IsR0FBSSxHQUFHLENBQUM7QUFFdkMsa0RBQWtEO0FBQ3JDLG1CQUFXLEdBQUssRUFBRSxDQUFDO0FBQ25CLG9CQUFZLEdBQUksRUFBRSxDQUFDO0FBRWhDLElBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBRTNCO0lBSUksd0NBQVksT0FBWTtRQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBQ0wscUNBQUM7QUFBRCxDQVBBLEFBT0MsSUFBQTtBQVBZLHNDQUE4QixpQ0FPMUMsQ0FBQTtBQUVEO0lBTUk7UUFDSSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCw2Q0FBTyxHQUFQLFVBQVEsNkJBQXVEO1FBQS9ELGlCQXNCQztRQXJCRyxJQUFJLG9CQUFvQixHQUFHLFVBQUMsT0FBWTtZQUNwQyx5Q0FBeUM7WUFDekMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQ2QsbUJBQVcsR0FBSSx5QkFBaUIsRUFDaEMsb0JBQVksR0FBRywwQkFBa0IsQ0FDcEMsQ0FBQztZQUNGLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVCLEtBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQiw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUM7UUFFRixJQUFJLFlBQVksR0FBRztZQUNmLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQztRQUVGLElBQUksYUFBYSxHQUFHLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzlDLGFBQWEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3RGLGFBQWEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3ZGLGFBQWEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRXZGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztJQUM1QixDQUFDO0lBRUQsaURBQVcsR0FBWDtRQUNJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ25DLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyw4RkFBOEY7UUFDeEksT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDM0IsTUFBTSxDQUFDLElBQUksOEJBQThCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVPLHVEQUFpQixHQUF6QjtRQUNJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztJQUNsQyxDQUFDO0lBQ0wsa0NBQUM7QUFBRCxDQWxEQSxBQWtEQyxJQUFBO0FBQ1ksbUNBQTJCLEdBQUcsSUFBSSwyQkFBMkIsRUFBRSxDQUFDOzs7QUN0RTdFLHdCQUFzQixXQUFXLENBQUMsQ0FBQTtBQUNsQywwQkFBa0MsdUJBQXVCLENBQUMsQ0FBQTtBQU0xRCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyx1Q0FBdUM7QUFDOUQsSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDO0FBRTFCO0lBTUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWxDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7SUFDL0MsQ0FBQztJQUVELDhCQUFLLEdBQUw7UUFBQSxpQkFrQkM7UUFqQkcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRW5DLG9CQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFTLENBQUMsa0JBQWtCLEVBQUUsVUFBQyxLQUFxQjtZQUNsRSxLQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7UUFFSCxvQkFBUSxDQUFDLFFBQVEsQ0FBQyxxQkFBUyxDQUFDLHNCQUFzQixFQUFFLFVBQUMsS0FBeUI7WUFDMUUsS0FBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsb0JBQVEsQ0FBQyxRQUFRLENBQUMscUJBQVMsQ0FBQywyQkFBMkIsRUFBRSxVQUFDLEtBQThCO1lBQ3BGLEtBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztRQUVILG9CQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFTLENBQUMsa0JBQWtCLEVBQUUsVUFBQyxLQUFxQjtZQUNsRSxLQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsNkJBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFnQjtZQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLDZDQUFvQixHQUE1QixVQUE2QixLQUFxQjtRQUM5QyxJQUFJLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTyxpREFBd0IsR0FBaEMsVUFBaUMsS0FBeUI7UUFDdEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoQixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkMsQ0FBQztJQUNMLENBQUM7SUFFTyx1Q0FBYyxHQUF0QixVQUF1QixPQUFnQixFQUFFLENBQVMsRUFBRSxDQUFTO1FBQ3pELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTyxzREFBNkIsR0FBckMsVUFBc0MsS0FBOEI7UUFDaEUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoQixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDeEMsQ0FBQztJQUNMLENBQUM7SUFFTyw2Q0FBb0IsR0FBNUIsVUFBNkIsS0FBcUI7UUFDOUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoQixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixDQUFDO0lBQ0wsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0EvRUEsQUErRUMsSUFBQTtBQUNZLHNCQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQzs7QUM1Rm5ELDRFQUE0RTs7QUFJNUUsK0JBQTRCLG1CQUFtQixDQUFDLENBQUE7QUFDaEQsK0NBT0ssa0NBQWtDLENBQUMsQ0FBQTtBQUV4QyxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUM7QUFDM0IsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaURBQWlEO0FBRW5ILElBQU0sY0FBYyxHQUFRLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2hELElBQU0sY0FBYyxHQUFRLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBRWhEO0lBS0ksK0JBQVksR0FBVyxFQUFFLEdBQVc7UUFDaEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBQ0wsNEJBQUM7QUFBRCxDQVRBLEFBU0MsSUFBQTtBQWdCRDtJQVlJLDBCQUFZLElBQTBCLEVBQUUsSUFBMkI7UUFDL0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUM7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO1FBRWpDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFRCwrQkFBSSxHQUFKLFVBQUssS0FBNEIsRUFBRSxLQUFzQjtRQUF0QixxQkFBc0IsR0FBdEIsc0JBQXNCO1FBQ3JELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCwrQkFBSSxHQUFKLFVBQUssT0FBZTtRQUNoQixJQUFJLENBQUMsdUJBQXVCLElBQUksT0FBTyxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLHVCQUF1QixHQUFHLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUMsK0RBQStEO2dCQUN6RixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUN6QixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxxQ0FBVSxHQUFWO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELDBDQUFlLEdBQWY7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0FwREEsQUFvREMsSUFBQTtBQUVEO0lBUUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWxDLCtCQUErQjtRQUMvQixJQUFJLENBQUMsY0FBYyxHQUFHLDREQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2hFLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLGdEQUFnRDtRQUMvRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFNUIsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFcEMsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRUQsb0NBQUssR0FBTDtRQUNJLDJCQUEyQjtJQUMvQixDQUFDO0lBRUQsbUNBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNILDhDQUFlLEdBQWYsVUFBZ0IsSUFBMEI7UUFDdEMsSUFBSSxTQUFTLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1FBQ3RDLENBQUM7SUFDTCxDQUFDO0lBRU8sNkNBQWMsR0FBdEIsVUFBdUIsT0FBZTtRQUNsQyxvRUFBb0U7UUFDcEUsMERBQTBEO1FBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDN0MsOEJBQWEsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEQsSUFBSSxlQUFlLEdBQVcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQy9FLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLGVBQWUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTyw0Q0FBYSxHQUFyQixVQUFzQixPQUFlO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBQ0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXBELDJFQUEyRTtRQUMzRSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsNENBQVcsQ0FBQyxHQUFHLGtEQUFpQixDQUFDO1FBQ3pELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLG1EQUFrQixHQUFHLDZDQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLDZDQUFZLENBQUMsR0FBRyxtREFBa0IsQ0FBQztRQUN2RyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBQ0wsMkJBQUM7QUFBRCxDQXZFQSxBQXVFQyxJQUFBO0FBdkVZLDRCQUFvQix1QkF1RWhDLENBQUE7QUFFRCw0QkFBNEIsSUFBMEI7SUFDbEQsSUFBSSxTQUEyQixDQUFDO0lBQ2hDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDWCxLQUFLLGVBQTRCO1lBQzdCLFNBQVMsR0FBRyxhQUFhLEVBQUUsQ0FBQztZQUM1QixLQUFLLENBQUM7UUFDVixLQUFLLGNBQTJCO1lBQzVCLFNBQVMsR0FBRyxZQUFZLEVBQUUsQ0FBQztZQUMzQixLQUFLLENBQUM7UUFDVixLQUFLLGlCQUE4QjtZQUMvQixTQUFTLEdBQUcsZUFBZSxFQUFFLENBQUM7WUFDOUIsS0FBSyxDQUFDO1FBQ1YsS0FBSyxnQkFBNkI7WUFDOUIsU0FBUyxHQUFHLGNBQWMsRUFBRSxDQUFDO1lBQzdCLEtBQUssQ0FBQztRQUNWLEtBQUssaUJBQThCO1lBQy9CLFNBQVMsR0FBRyxlQUFlLEVBQUUsQ0FBQztZQUM5QixLQUFLLENBQUM7UUFDVixLQUFLLGdCQUE2QjtZQUM5QixTQUFTLEdBQUcsY0FBYyxFQUFFLENBQUM7WUFDN0IsS0FBSyxDQUFDO1FBQ1YsS0FBSyxrQkFBK0I7WUFDaEMsU0FBUyxHQUFHLGdCQUFnQixFQUFFLENBQUM7WUFDL0IsS0FBSyxDQUFDO1FBQ1YsS0FBSyxpQkFBOEI7WUFDL0IsU0FBUyxHQUFHLGVBQWUsRUFBRSxDQUFDO1lBQzlCLEtBQUssQ0FBQztRQUNWLEtBQUssZUFBNEI7WUFDN0IsU0FBUyxHQUFHLGFBQWEsRUFBRSxDQUFDO1lBQzVCLEtBQUssQ0FBQztRQUNWLEtBQUssZUFBNEI7WUFDN0IsU0FBUyxHQUFHLGFBQWEsRUFBRSxDQUFDO1lBQzVCLEtBQUssQ0FBQztRQUNWLEtBQUssa0JBQThCO1lBQy9CLFNBQVMsR0FBRyxlQUFlLEVBQUUsQ0FBQztZQUM5QixLQUFLLENBQUM7UUFDVjtZQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsY0FBYztBQUNkLElBQUksYUFBYSxHQUFTLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFEO0lBQ0ksSUFBSSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxlQUE0QixDQUFDLENBQUM7SUFDbkUsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5QixNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxhQUFhO0FBQ2IsSUFBSSxZQUFZLEdBQVUsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxZQUFZLEdBQVUsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxZQUFZLEdBQVUsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxZQUFZLEdBQVUsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxZQUFZLEdBQVUsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxZQUFZLEdBQVUsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFMUQ7SUFDSSxJQUFJLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLGNBQTJCLENBQUMsQ0FBQztJQUNsRSxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3BELFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDcEQsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUNwRCxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3BELFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDcEQsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUNwRCxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxnQkFBZ0I7QUFDaEIsSUFBSSxlQUFlLEdBQU8sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFMUQ7SUFDSSxJQUFJLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLGlCQUE4QixDQUFDLENBQUM7SUFDckUsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNoQyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxlQUFlO0FBQ2YsSUFBSSxjQUFjLEdBQVEsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxjQUFjLEdBQVEsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxjQUFjLEdBQVEsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxjQUFjLEdBQVEsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxjQUFjLEdBQVEsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxjQUFjLEdBQVEsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFMUQ7SUFDSSxJQUFJLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLGdCQUE2QixDQUFDLENBQUM7SUFDcEUsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUN0RCxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3RELFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDdEQsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUN0RCxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3RELFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDdEQsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsZ0JBQWdCO0FBQ2hCLElBQUksZUFBZSxHQUFPLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFEO0lBQ0ksSUFBSSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxpQkFBOEIsQ0FBQyxDQUFDO0lBQ3JFLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDaEMsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsZUFBZTtBQUNmLElBQUksY0FBYyxHQUFRLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksY0FBYyxHQUFRLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksY0FBYyxHQUFRLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksY0FBYyxHQUFRLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFEO0lBQ0ksSUFBSSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxnQkFBNkIsQ0FBQyxDQUFDO0lBQ3BFLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDL0IsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMvQixTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQy9CLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDL0IsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsaUJBQWlCO0FBQ2pCLElBQUksZ0JBQWdCLEdBQU0sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFMUQ7SUFDSSxJQUFJLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLGtCQUErQixDQUFDLENBQUM7SUFDdEUsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDckIsQ0FBQztBQUVELGdCQUFnQjtBQUNoQixJQUFJLGVBQWUsR0FBTyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGVBQWUsR0FBTyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGVBQWUsR0FBTyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGVBQWUsR0FBTyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUxRDtJQUNJLElBQUksU0FBUyxHQUFHLElBQUksZ0JBQWdCLENBQUMsaUJBQThCLENBQUMsQ0FBQztJQUNyRSxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDaEMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNoQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDckIsQ0FBQztBQUVELFdBQVc7QUFDWCxJQUFJLGFBQWEsR0FBUyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGFBQWEsR0FBUyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGFBQWEsR0FBUyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxJQUFJLGFBQWEsR0FBUyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUxRDtJQUNJLElBQUksU0FBUyxHQUFHLElBQUksZ0JBQWdCLENBQUMsZUFBNEIsQ0FBQyxDQUFDO0lBQ25FLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUIsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlCLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUIsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsV0FBVztBQUNYLElBQUksYUFBYSxHQUFTLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksYUFBYSxHQUFTLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksYUFBYSxHQUFTLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksYUFBYSxHQUFTLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFEO0lBQ0ksSUFBSSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxlQUE0QixDQUFDLENBQUM7SUFDbkUsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlCLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUIsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5QixNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxhQUFhO0FBQ2IsSUFBSSxlQUFlLEdBQU8sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxlQUFlLEdBQU8sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxlQUFlLEdBQU8sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxlQUFlLEdBQU8sSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFMUQ7SUFDSSxJQUFJLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLGtCQUE4QixDQUFDLENBQUM7SUFDckUsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNoQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDaEMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNoQyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3JCLENBQUM7OztBQ3RXRCwwQkFBa0MsdUJBQXVCLENBQUMsQ0FBQTtBQUMxRCw2Q0FBd0MsMENBQTBDLENBQUMsQ0FBQTtBQUNuRix1Q0FBeUQsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRiwrQkFBNEIsbUJBQW1CLENBQUMsQ0FBQTtBQUVoRDtJQVlJLGlCQUFZLEtBQWE7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksNkNBQW9CLEVBQUUsQ0FBQztRQUNoRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFFdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsdUJBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsc0JBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUU5QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCx3QkFBTSxHQUFOLFVBQU8sQ0FBUyxFQUFFLENBQVM7UUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7T0FHRztJQUNILHdCQUFNLEdBQU4sVUFBTyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQWE7UUFBMUMsaUJBaUJDO1FBaEJHLCtEQUErRDtRQUMvRCxJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRSxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDL0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRXJDLDBGQUEwRjtRQUMxRixxREFBcUQ7UUFDckQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQzthQUNoRCxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxJQUFJLENBQUM7YUFDdEIsVUFBVSxDQUFDLGNBQVEsS0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3RDLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUVsQyw2REFBNkQ7UUFDN0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsd0JBQU0sR0FBTixVQUFPLENBQVMsRUFBRSxDQUFTO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVPLDBCQUFRLEdBQWhCLFVBQWlCLE9BQWU7UUFDNUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNMLENBQUM7SUFFTywwQkFBUSxHQUFoQjtRQUNJLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFFdEIsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSx3REFBeUIsQ0FDdkMsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUN6QixDQUFDO0lBQ04sQ0FBQztJQUVPLHdDQUFzQixHQUE5QjtRQUNJLDRDQUE0QztRQUM1QywrQkFBK0I7UUFDL0IsdUNBQXVDO1FBRXZDLGlFQUFpRTtRQUNqRSxJQUFJLGNBQWMsR0FBRyw4QkFBYSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RHLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFBQyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLG1EQUFtRDtRQUUzRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsY0FBMkIsQ0FBQyxDQUFDO1lBQ3BFLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsaUJBQThCLENBQUMsQ0FBQztZQUN2RSxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLGdCQUE2QixDQUFDLENBQUM7WUFDdEUsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksR0FBRyxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxnQkFBNkIsQ0FBQyxDQUFDO1lBQ3RFLENBQUM7UUFDTCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxlQUE0QixDQUFDLENBQUM7WUFDckUsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxrQkFBK0IsQ0FBQyxDQUFDO1lBQ3hFLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsaUJBQThCLENBQUMsQ0FBQztZQUN2RSxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLGlCQUE4QixDQUFDLENBQUM7WUFDdkUsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0wsY0FBQztBQUFELENBMUhBLEFBMEhDLElBQUE7QUExSFksZUFBTyxVQTBIbkIsQ0FBQTs7O0FDaElELCtCQUE0QixrQkFBa0IsQ0FBQyxDQUFBO0FBQy9DLG9CQUFrQixhQUFhLENBQUMsQ0FBQTtBQUNoQyx1QkFBcUIsZ0JBQWdCLENBQUMsQ0FBQTtBQUN0Qyw4QkFBMkIsMEJBQTBCLENBQUMsQ0FBQTtBQUN0RCw0QkFBMEIsd0JBQXdCLENBQUMsQ0FBQTtBQUNuRCxnQ0FBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUt6RDtJQWFJO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBdUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFaEYsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLDRCQUFZLENBQUMsNEJBQWtDLEVBQUUsbUJBQTZCLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSx5QkFBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsYUFBZ0IsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSw0QkFBWSxDQUFDLDRCQUFrQyxFQUFFLG1CQUE2QixDQUFDLENBQUM7UUFDbEcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHlCQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFhLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsb0JBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUzQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFZixTQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWixlQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZixnQ0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXZCLDhEQUE4RDtRQUM5RCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUM7SUFDaEQsQ0FBQztJQUVELG1CQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLFNBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEIsZUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTdCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFcEMsZ0NBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSw4QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTyxzQkFBTyxHQUFmO1FBQUEsaUJBNEJDO1FBM0JHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0NBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBRTlDLElBQUksY0FBYyxHQUFHLFFBQVEsQ0FBQztRQUM5QixJQUFJLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDcEQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFMUIsOEJBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLDhCQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFELDhCQUFhLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7WUFDOUIsOEJBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxzQkFBc0I7SUFDMUIsQ0FBQztJQVNMLFdBQUM7QUFBRCxDQS9GQSxBQStGQyxJQUFBO0FBQ1ksWUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7OztBQzFHL0I7SUFNSTtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFbEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRCxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELHNCQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELHFCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLEVBQUU7SUFDTixDQUFDO0lBQ0wsYUFBQztBQUFELENBdkJBLEFBdUJDLElBQUE7QUFDWSxjQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQzs7O0FDeEJuQyxJQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUN0QyxJQUFNLFdBQVcsR0FBTyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNyQyxJQUFNLGNBQWMsR0FBRyxNQUFNLENBQUM7QUFFOUI7SUFPSTtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFbEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyx3Q0FBd0M7UUFDN0YsSUFBSSxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzNCLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTFCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUM7SUFDL0IsQ0FBQztJQUVELG1CQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsa0JBQUksR0FBSixVQUFLLE9BQWU7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5RCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDO1FBQy9CLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLEdBQUcsR0FBRyxjQUFjLENBQUM7UUFDOUIsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLDZCQUFlLEdBQXZCO1FBQ0ksSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNwQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZELFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNMLFVBQUM7QUFBRCxDQXZEQSxBQXVEQyxJQUFBO0FBQ1ksV0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtHYW1lU3RhdGVUeXBlLCBnYW1lU3RhdGV9IGZyb20gJy4uL2dhbWUtc3RhdGUnO1xyXG5pbXBvcnQge3BsYXlpbmdIYW5kbGVyfSBmcm9tICcuL3BsYXlpbmctaGFuZGxlcic7XHJcblxyXG5jbGFzcyBDb250cm9sbGVyIHtcclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBwbGF5aW5nSGFuZGxlci5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgc3dpdGNoIChnYW1lU3RhdGUuZ2V0Q3VycmVudCgpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5JbnRybzpcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IERvIHN0dWZmXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBHYW1lU3RhdGVUeXBlLlBsYXlpbmc6XHJcbiAgICAgICAgICAgICAgICBwbGF5aW5nSGFuZGxlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuZXhwb3J0IGNvbnN0IGVudW0gS2V5IHtcclxuICAgIExlZnQsXHJcbiAgICBVcCxcclxuICAgIERvd24sXHJcbiAgICBSaWdodCxcclxuICAgIERyb3AsXHJcbiAgICBQYXVzZSxcclxuICAgIC8vIFJlc3Qgb2YgdGhlc2UgYXJlIHNwZWNpYWwgZGlyZWN0aXZlc1xyXG4gICAgT3RoZXIsXHJcbiAgICBJZ25vcmUsXHJcbiAgICBQcmV2ZW50XHJcbn1cclxuXHJcbmNvbnN0IGVudW0gU3RhdGUge1xyXG4gICAgRG93bixcclxuICAgIFVwLFxyXG4gICAgSGFuZGxpbmdcclxufVxyXG5cclxuY29uc3QgS0VZX1JFUEVBVF9ERUxBWV9JTklUSUFMICA9IDU1MDtcclxuY29uc3QgS0VZX1JFUEVBVF9ERUxBWV9DT05USU5VRSA9IDIwMDtcclxuXHJcbmNsYXNzIEtleWJvYXJkIHtcclxuICAgIHByaXZhdGUga2V5U3RhdGU6IE1hcDxLZXksU3RhdGU+O1xyXG5cclxuICAgIHByaXZhdGUgcHJldmlvdXNLZXlDb2RlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRLZXlDb2RlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGtleUhlbGRFbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGtleUhlbGRJbml0aWFsOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMua2V5U3RhdGUgPSBuZXcgTWFwPEtleSxTdGF0ZT4oKTtcclxuICAgICAgICB0aGlzLnByZXZpb3VzS2V5Q29kZSA9IC0xO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEtleUNvZGUgPSAtMTtcclxuICAgICAgICB0aGlzLmtleUhlbGRFbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLmtleUhlbGRJbml0aWFsID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50VG9TdGF0ZShldmVudCwgU3RhdGUuRG93bik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRUb1N0YXRlKGV2ZW50LCBTdGF0ZS5VcCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGwgdGhpcyBkb2VzIGlzIGhhbmRsZSBpZiB0aGUgcGxheWVyIGlzIGhvbGRpbmcgZG93biBhIGtleSBmb3IgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lLlxyXG4gICAgICogSWYgc28sIGRldGVybWluZSB3aGV0aGVyIG9yIG5vdCB0byBlbXVsYXRlIHRoZWlyIGhhdmluZyBwcmVzc2VkIHRoZSBrZXkgZHVyaW5nIHRoaXMgZnJhbWUuXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEtleUNvZGUgIT09IHRoaXMucHJldmlvdXNLZXlDb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMua2V5SGVsZEVsYXBzZWQgKz0gZWxhcHNlZDtcclxuXHJcbiAgICAgICAgICAgIGxldCB1cGRhdGVTdGF0ZTogYm9vbGVhbjtcclxuICAgICAgICAgICAgaWYgKHRoaXMua2V5SGVsZEluaXRpYWwgPT09IHRydWUgJiYgdGhpcy5rZXlIZWxkRWxhcHNlZCA+PSBLRVlfUkVQRUFUX0RFTEFZX0lOSVRJQUwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5SGVsZEluaXRpYWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5SGVsZEVsYXBzZWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlU3RhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5SGVsZEluaXRpYWwgPT09IGZhbHNlICYmIHRoaXMua2V5SGVsZEVsYXBzZWQgPj0gS0VZX1JFUEVBVF9ERUxBWV9DT05USU5VRSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlIZWxkRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVTdGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh1cGRhdGVTdGF0ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGtleSA9IHRoaXMua2V5Q29kZVRvS2V5KHRoaXMuY3VycmVudEtleUNvZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShrZXksIFN0YXRlLkRvd24sIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5rZXlIZWxkRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMua2V5SGVsZEluaXRpYWwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBpZiBnaXZlbiBrZXkgaXMgJ0Rvd24nLlxyXG4gICAgICovXHJcbiAgICBpc0Rvd24oa2V5OiBLZXkpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5rZXlTdGF0ZS5nZXQoa2V5KSA9PT0gU3RhdGUuRG93bjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBpZiBnaXZlbiBrZXkgaXMgJ2Rvd24nLiBBbHNvIHNldHMgdGhlIGtleSBmcm9tICdEb3duJyB0byAnSGFuZGxpbmcnLlxyXG4gICAgICovXHJcbiAgICBpc0Rvd25BbmRVbmhhbmRsZWQoa2V5OiBLZXkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0Rvd24oa2V5KSkge1xyXG4gICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIFN0YXRlLkhhbmRsaW5nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBUT0RPOiBUaGlzIHdhc24ndCBzZXQgaW4gbWF6aW5nOyBuZWVkIHRvIHNlZSB3aHkuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVE9ETzogTm90IHN1cmUgaWYgdGhpcyB3b3VsZCB3b3JrIGluIHRoaXMgZ2FtZSB3aXRoIHRoZSBrZXkgZGVsYXkgY2FwdHVyaW5nLlxyXG4gICAgICogXHJcbiAgICAgKiBSZXR1cm5zIGlmIGFueSBrZXkgaXMgJ2Rvd24nLiBBbHNvIHNldCBhbGwgJ0Rvd24nIGtleXMgdG8gJ0hhbmRsaW5nJy5cclxuICAgICAqL1xyXG4gICAgaXNBbnlLZXlEb3duQW5kVW5oYW5kbGVkKCkge1xyXG4gICAgICAgIGxldCBhbnlLZXlEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5rZXlTdGF0ZS5mb3JFYWNoKChzdGF0ZTogU3RhdGUsIGtleTogS2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gU3RhdGUuRG93bikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBTdGF0ZS5IYW5kbGluZyk7XHJcbiAgICAgICAgICAgICAgICBhbnlLZXlEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBhbnlLZXlEb3duO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZXZlbnRUb1N0YXRlKGV2ZW50OiBLZXlib2FyZEV2ZW50LCBzdGF0ZTogU3RhdGUpIHtcclxuICAgICAgICBpZiAoc3RhdGUgPT09IFN0YXRlLkRvd24pIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50S2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PSBTdGF0ZS5VcCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRLZXlDb2RlID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNLZXlDb2RlID0gLTE7XHJcbiAgICAgICB9XHJcblxyXG4gICAgICAgbGV0IGtleSA9IHRoaXMua2V5Q29kZVRvS2V5KGV2ZW50LmtleUNvZGUpO1xyXG4gICAgICAgdGhpcy5rZXlUb1N0YXRlKGtleSwgc3RhdGUsIGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGtleUNvZGVUb0tleShrZXlDb2RlOiBudW1iZXIpOiBLZXkge1xyXG4gICAgICAgIGxldCBrZXkgPSBLZXkuT3RoZXI7XHJcblxyXG4gICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xyXG4gICAgICAgICAgICAvLyBEaXJlY3Rpb25hbHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA2NTogLy8gJ2EnXHJcbiAgICAgICAgICAgIGNhc2UgMzc6IC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIGtleSA9IEtleS5MZWZ0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODc6IC8vICd3J1xyXG4gICAgICAgICAgICBjYXNlIDM4OiAvLyB1cFxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LlVwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vICdkJ1xyXG4gICAgICAgICAgICBjYXNlIDM5OiAvLyByaWdodFxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LlJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODM6IC8vICdzJ1xyXG4gICAgICAgICAgICBjYXNlIDQwOiAvLyBkb3duXHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuRG93bjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDMyOiAvLyBzcGFjZVxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LkRyb3A7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIFBhdXNlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDgwOiAvLyAncCdcclxuICAgICAgICAgICAgY2FzZSAyNzogLy8gZXNjXHJcbiAgICAgICAgICAgIGNhc2UgMTM6IC8vIGVudGVyIGtleVxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LlBhdXNlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gSWdub3JlIGNlcnRhaW4ga2V5cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgODI6ICAgIC8vICdyJ1xyXG4gICAgICAgICAgICBjYXNlIDE4OiAgICAvLyBhbHRcclxuICAgICAgICAgICAgY2FzZSAyMjQ6ICAgLy8gYXBwbGUgY29tbWFuZCAoZmlyZWZveClcclxuICAgICAgICAgICAgY2FzZSAxNzogICAgLy8gYXBwbGUgY29tbWFuZCAob3BlcmEpXHJcbiAgICAgICAgICAgIGNhc2UgOTE6ICAgIC8vIGFwcGxlIGNvbW1hbmQsIGxlZnQgKHNhZmFyaS9jaHJvbWUpXHJcbiAgICAgICAgICAgIGNhc2UgOTM6ICAgIC8vIGFwcGxlIGNvbW1hbmQsIHJpZ2h0IChzYWZhcmkvY2hyb21lKVxyXG4gICAgICAgICAgICBjYXNlIDg0OiAgICAvLyAndCcgKGkuZS4sIG9wZW4gYSBuZXcgdGFiKVxyXG4gICAgICAgICAgICBjYXNlIDc4OiAgICAvLyAnbicgKGkuZS4sIG9wZW4gYSBuZXcgd2luZG93KVxyXG4gICAgICAgICAgICBjYXNlIDIxOTogICAvLyBsZWZ0IGJyYWNrZXRzXHJcbiAgICAgICAgICAgIGNhc2UgMjIxOiAgIC8vIHJpZ2h0IGJyYWNrZXRzXHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuSWdub3JlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IHNvbWUgdW53YW50ZWQgYmVoYXZpb3JzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSAxOTE6ICAgLy8gZm9yd2FyZCBzbGFzaCAocGFnZSBmaW5kKVxyXG4gICAgICAgICAgICBjYXNlIDk6ICAgICAvLyB0YWIgKGNhbiBsb3NlIGZvY3VzKVxyXG4gICAgICAgICAgICBjYXNlIDE2OiAgICAvLyBzaGlmdFxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LlByZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIEFsbCBvdGhlciBrZXlzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5Lk90aGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGtleTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGtleVRvU3RhdGUoa2V5OiBLZXksIHN0YXRlOiBTdGF0ZSwgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBsZXQgcHJldmVudERlZmF1bHQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcclxuICAgICAgICAgICAgY2FzZSBLZXkuTGVmdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LkxlZnQsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5VcDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlVwLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpIC0gY29tbWVudGVkIGZvciBpZiB0aGUgdXNlciB3YW50cyB0byBjbWQrdyBvciBjdHJsK3dcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5SaWdodDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LlJpZ2h0LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLZXkuRG93bjpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5LkRvd24sIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5Ecm9wOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuRHJvcCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5LlBhdXNlOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuUGF1c2UsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBNYXliZSBhZGQgYSBkZWJ1ZyBrZXkgaGVyZSAoJ2YnKVxyXG4gICAgICAgICAgICBjYXNlIEtleS5JZ25vcmU6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLZXkuUHJldmVudDpcclxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5PdGhlcjpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoS2V5Lk90aGVyLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChldmVudCAhPSBudWxsICYmIHByZXZlbnREZWZhdWx0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0U3RhdGUoa2V5OiBLZXksIHN0YXRlOiBTdGF0ZSwgZm9yY2UgPSBmYWxzZSkge1xyXG4gICAgICAgIC8vIEFsd2F5cyBzZXQgJ3VwJ1xyXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gU3RhdGUuVXApIHtcclxuICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBzdGF0ZSk7XHJcbiAgICAgICAgLy8gT25seSBzZXQgJ2Rvd24nIGlmIGl0IGlzIG5vdCBhbHJlYWR5IGhhbmRsZWRcclxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmtleVN0YXRlLmdldChrZXkpICE9PSBTdGF0ZS5IYW5kbGluZyB8fCBmb3JjZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZS5zZXQoa2V5LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBrZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpOyIsImltcG9ydCB7a2V5Ym9hcmQsIEtleX0gZnJvbSAnLi9rZXlib2FyZCc7XHJcbmltcG9ydCB7ZXZlbnRCdXN9IGZyb20gJy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50JztcclxuXHJcbmNsYXNzIFBsYXlpbmdIYW5kbGVyIHtcclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBrZXlib2FyZC5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAga2V5Ym9hcmQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgaWYgKGtleWJvYXJkLmlzRG93bkFuZFVuaGFuZGxlZChLZXkuVXApKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUm90YXRlQ2xvY2t3aXNlLCBQbGF5ZXJUeXBlLkh1bWFuKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoa2V5Ym9hcmQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5MZWZ0KSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkxlZnQsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChrZXlib2FyZC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LlJpZ2h0KSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LlJpZ2h0LCBQbGF5ZXJUeXBlLkh1bWFuKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoa2V5Ym9hcmQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5Eb3duKSkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBQbGF5ZXJNb3ZlbWVudEV2ZW50KFBsYXllck1vdmVtZW50LkRvd24sIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChrZXlib2FyZC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkRyb3ApKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRHJvcCwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgcGxheWluZ0hhbmRsZXIgPSBuZXcgUGxheWluZ0hhbmRsZXIoKTsiLCJpbXBvcnQge0NvbG9yfSBmcm9tICcuL2NvbG9yJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDZWxsIHtcclxuICAgIHByaXZhdGUgY29sb3I6IENvbG9yO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBDb2xvci5FbXB0eTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xvcihjb2xvcjogQ29sb3IpIHtcclxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sb3IoKTogQ29sb3Ige1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogT2Zmc2V0IGNhbGN1bGF0ZWQgZnJvbSB0b3AtbGVmdCBjb3JuZXIgYmVpbmcgMCwgMC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDZWxsT2Zmc2V0IHtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxufSIsImV4cG9ydCBjb25zdCBQQU5FTF9DT1VOVF9QRVJfRkxPT1IgPSAxMDtcclxuZXhwb3J0IGNvbnN0IFRJTUVfVU5USUxfRVZFUllPTkVfT05fU0NSRUVOID0gNjAgKiAxMDAwO1xyXG5cclxuZXhwb3J0IGNvbnN0IEFNQklFTkNFX05JR0hUID0gJ0FNQklFTkNFX05JR0hUJztcclxuZXhwb3J0IGNvbnN0IE1VU0lDX09QRU5JTkcgPSAnTVVTSUNfT1BFTklORyc7XHJcbmV4cG9ydCBjb25zdCBNVVNJQ19NQUlOID0gJ01VU0lDX01BSU4nO1xyXG5leHBvcnQgY29uc3QgTVVTSUNfTUFJTl9WT1ggPSAnTVVTSUNfTUFJTl9WT1gnO1xyXG5leHBvcnQgY29uc3QgU1RVREVOVFNfVEFMS0lORyA9ICdTVFVERU5UU19UQUxLSU5HJzsiLCJleHBvcnQgZW51bSBQbGF5ZXJNb3ZlbWVudCB7XHJcbiAgICBOb25lLFxyXG4gICAgTGVmdCxcclxuICAgIFJpZ2h0LFxyXG4gICAgRG93bixcclxuICAgIERyb3AsXHJcbiAgICBSb3RhdGVDbG9ja3dpc2UsXHJcbiAgICBSb3RhdGVDb3VudGVyQ2xvY2t3aXNlXHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1NoYXBlfSBmcm9tICcuLi9tb2RlbC9ib2FyZC9zaGFwZSc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHNoYXBlOiBTaGFwZTtcclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcbiAgICByZWFkb25seSBzdGFydGluZzogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzaGFwZTogU2hhcGUsIHBsYXllclR5cGU6IFBsYXllclR5cGUsIHN0YXJ0aW5nOiBib29sZWFuKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnNoYXBlID0gc2hhcGU7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgICAgICB0aGlzLnN0YXJ0aW5nID0gc3RhcnRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBY3RpdmVTaGFwZUVuZGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG4gICAgcmVhZG9ubHkgcm93SWR4OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSwgcm93SWR4OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5yb3dJZHggPSByb3dJZHg7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkFjdGl2ZVNoYXBlRW5kZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQm9hcmRGaWxsZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQm9hcmRGaWxsZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENlbGxDaGFuZ2VFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG4gICAgcmVhZG9ubHkgY2VsbDogQ2VsbDtcclxuICAgIHJlYWRvbmx5IHJvdzogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgY29sOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNlbGw6IENlbGwsIHJvdzogbnVtYmVyLCBjb2w6IG51bWJlciwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5jZWxsID0gY2VsbDtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdztcclxuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5DZWxsQ2hhbmdlRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gRXZlbnRUeXBlIHtcclxuICAgIEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSxcclxuICAgIEFjdGl2ZVNoYXBlRW5kZWRFdmVudFR5cGUsXHJcbiAgICBCb2FyZEZpbGxlZEV2ZW50VHlwZSxcclxuICAgIENlbGxDaGFuZ2VFdmVudFR5cGUsXHJcbiAgICBGYWxsaW5nU2VxdWVuY2VyRXZlbnRUeXBlLFxyXG4gICAgR2FtZVN0YXRlQ2hhbmdlZFR5cGUsXHJcbiAgICBIcENoYW5nZWRFdmVudFR5cGUsXHJcbiAgICBOcGNGYWNpbmdFdmVudFR5cGUsXHJcbiAgICBOcGNNb3ZlbWVudENoYW5nZWRFdmVudFR5cGUsXHJcbiAgICBOcGNQbGFjZWRFdmVudFR5cGUsXHJcbiAgICBOcGNTdGF0ZUNoYWdlZEV2ZW50VHlwZSxcclxuICAgIE5wY1RlbGVwb3J0ZWRFdmVudFR5cGUsXHJcbiAgICBQbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZSxcclxuICAgIFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50VHlwZSxcclxuICAgIFJvd3NGaWxsZWRFdmVudFR5cGUsXHJcbiAgICBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZVxyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBhYnN0cmFjdCBnZXRUeXBlKCk6RXZlbnRUeXBlXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnRIYW5kbGVyPFQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50PiB7XHJcbiAgICAoZXZlbnQ6IFQpOnZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudEJ1cyB7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVyc0J5VHlwZTpNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVyc0J5VHlwZSA9IG5ldyBNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT4oKTtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3Rlcih0eXBlOkV2ZW50VHlwZSwgaGFuZGxlcjpFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD4pIHtcclxuICAgICAgICBpZiAoIXR5cGUpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaGFuZGxlcnM6RXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+W10gPSB0aGlzLmhhbmRsZXJzQnlUeXBlLmdldCh0eXBlKTtcclxuICAgICAgICBpZiAoaGFuZGxlcnMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZXJzQnlUeXBlLnNldCh0eXBlLCBoYW5kbGVycyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFJldHVybiBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGNhbGxlZCB0byB1bnJlZ2lzdGVyIHRoZSBoYW5kbGVyXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFRPRE86IHVucmVnaXN0ZXIoKS4gQW5kIHJlbW92ZSB0aGUgbWFwIGtleSBpZiB6ZXJvIGhhbmRsZXJzIGxlZnQgZm9yIGl0LlxyXG4gICAgXHJcbiAgICAvLyBUT0RPOiBQcmV2ZW50IGluZmluaXRlIGZpcmUoKT9cclxuICAgIGZpcmUoZXZlbnQ6QWJzdHJhY3RFdmVudCkge1xyXG4gICAgICAgIGxldCBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnNCeVR5cGUuZ2V0KGV2ZW50LmdldFR5cGUoKSk7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiBoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGV2ZW50QnVzID0gbmV3IEV2ZW50QnVzKCk7XHJcbmV4cG9ydCBjb25zdCBkZWFkRXZlbnRCdXMgPSBuZXcgRXZlbnRCdXMoKTsgLy8gVXNlZCBieSBBSS5cclxuIiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhbGxpbmdTZXF1ZW5jZXJFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuRmFsbGluZ1NlcXVlbmNlckV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7R2FtZVN0YXRlVHlwZX0gZnJvbSAnLi4vZ2FtZS1zdGF0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZVN0YXRlQ2hhbmdlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ2FtZVN0YXRlVHlwZTogR2FtZVN0YXRlVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBHYW1lU3RhdGVUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmdhbWVTdGF0ZVR5cGUgPSB0eXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5HYW1lU3RhdGVDaGFuZ2VkVHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBIcENoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IGhwOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG4gICAgcmVhZG9ubHkgYmxpbmtMb3N0OiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhwOiBudW1iZXIsIHBsYXllclR5cGU6IFBsYXllclR5cGUsIGJsaW5rTG9zdD1mYWxzZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ocCA9IGhwO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5ibGlua0xvc3QgPSBibGlua0xvc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkhwQ2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjRmFjaW5nRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuTnBjRmFjaW5nRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLk5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjUGxhY2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyXHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLk5wY1BsYWNlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjVGVsZXBvcnRlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuTnBjVGVsZXBvcnRlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyTW92ZW1lbnRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG1vdmVtZW50OiBQbGF5ZXJNb3ZlbWVudDtcclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IobW92ZW1lbnQ6IFBsYXllck1vdmVtZW50LCBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm1vdmVtZW50ID0gbW92ZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuUGxheWVyTW92ZW1lbnRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5Sb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUm93c0ZpbGxlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGZpbGxlZFJvd0lkeHM6IG51bWJlcltdO1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihmaWxsZWRSb3dJZHhzOiBudW1iZXJbXSwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5maWxsZWRSb3dJZHhzID0gZmlsbGVkUm93SWR4cy5zbGljZSgwKTtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5Sb3dzRmlsbGVkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHo6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge2V2ZW50QnVzfSBmcm9tICcuL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7R2FtZVN0YXRlQ2hhbmdlZEV2ZW50fSBmcm9tICcuL2V2ZW50L2dhbWUtc3RhdGUtY2hhbmdlZC1ldmVudCc7XHJcblxyXG5leHBvcnQgY29uc3QgZW51bSBHYW1lU3RhdGVUeXBlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUgc3RhdGUgcmlnaHQgd2hlbiBKYXZhU2NyaXB0IHN0YXJ0cyBydW5uaW5nLiBJbmNsdWRlcyBwcmVsb2FkaW5nLlxyXG4gICAgICovXHJcbiAgICBJbml0aWFsaXppbmcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZnRlciBwcmVsb2FkIGlzIGNvbXBsZXRlIGFuZCBiZWZvcmUgbWFraW5nIG9iamVjdCBzdGFydCgpIGNhbGxzLlxyXG4gICAgICovXHJcbiAgICBTdGFydGluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgYWZ0ZXIgaW5pdGlhbCBvYmplY3RzIHN0YXJ0KCkgYW5kIGxpa2VseSB3aGVyZSB0aGUgZ2FtZSBpcyB3YWl0aW5nIG9uIHRoZSBwbGF5ZXIncyBmaXJzdCBpbnB1dC5cclxuICAgICAqL1xyXG4gICAgSW50cm8sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBtYWluIGdhbWUgbG9vcCBvZiBjb250cm9sbGluZyBwaWVjZXMuXHJcbiAgICAgKi9cclxuICAgIFBsYXlpbmcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmQgb2YgZ2FtZSwgc2NvcmUgaXMgc2hvd2luZywgbm90aGluZyBsZWZ0IHRvIGRvLlxyXG4gICAgICovXHJcbiAgICBFbmRlZFxyXG59XHJcblxyXG5jbGFzcyBHYW1lU3RhdGUge1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50OiBHYW1lU3RhdGVUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IEdhbWVTdGF0ZVR5cGUuSW5pdGlhbGl6aW5nOyAvLyBEZWZhdWx0IHN0YXRlLlxyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnQoKTogR2FtZVN0YXRlVHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDdXJyZW50KGN1cnJlbnQ6IEdhbWVTdGF0ZVR5cGUpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBjdXJyZW50O1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEdhbWVTdGF0ZUNoYW5nZWRFdmVudChjdXJyZW50KSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGdhbWVTdGF0ZSA9IG5ldyBHYW1lU3RhdGUoKTsiLCJpbXBvcnQge3ByZWxvYWRlcn0gZnJvbSAnLi9wcmVsb2FkZXInO1xyXG5pbXBvcnQge21vZGVsfSBmcm9tICcuL21vZGVsL21vZGVsJztcclxuaW1wb3J0IHt2aWV3fSBmcm9tICcuL3ZpZXcvdmlldyc7XHJcbmltcG9ydCB7Y29udHJvbGxlcn0gZnJvbSAnLi9jb250cm9sbGVyL2NvbnRyb2xsZXInO1xyXG5pbXBvcnQge3NvdW5kTWFuYWdlcn0gZnJvbSAnLi9zb3VuZC9zb3VuZC1tYW5hZ2VyJztcclxuaW1wb3J0IHtHYW1lU3RhdGVUeXBlLCBnYW1lU3RhdGV9IGZyb20gJy4vZ2FtZS1zdGF0ZSc7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgIGdhbWVTdGF0ZS5zZXRDdXJyZW50KEdhbWVTdGF0ZVR5cGUuSW5pdGlhbGl6aW5nKTtcclxuICAgIHNvdW5kTWFuYWdlci5hdHRhY2goKTtcclxuICAgIHByZWxvYWRlci5wcmVsb2FkKCgpID0+IHtcclxuICAgICAgICBtYWluKCk7XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBtYWluKCkge1xyXG5cclxuICAgIC8vIFN0YXJ0dXAgaW4gcmV2ZXJzZSBNVkMgb3JkZXIgdG8gZW5zdXJlIHRoYXQgZXZlbnQgYnVzIGhhbmRsZXJzIGluIHRoZVxyXG4gICAgLy8gY29udHJvbGxlciBhbmQgdmlldyByZWNlaXZlIChhbnkpIHN0YXJ0IGV2ZW50cyBmcm9tIG1vZGVsLnN0YXJ0KCkuXHJcbiAgICBzb3VuZE1hbmFnZXIuc3RhcnQoKTtcclxuICAgIGNvbnRyb2xsZXIuc3RhcnQoKTtcclxuICAgIHZpZXcuc3RhcnQoKTtcclxuICAgIG1vZGVsLnN0YXJ0KCk7XHJcbiAgICBcclxuICAgIGdhbWVTdGF0ZS5zZXRDdXJyZW50KEdhbWVTdGF0ZVR5cGUuSW50cm8pO1xyXG5cclxuICAgIGxldCBzdGVwID0gKCkgPT4ge1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcclxuXHJcbiAgICAgICAgbGV0IGVsYXBzZWQgPSBjYWxjdWxhdGVFbGFwc2VkKCk7XHJcbiAgICAgICAgY29udHJvbGxlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHZpZXcuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBtb2RlbC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHNvdW5kTWFuYWdlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfTtcclxuICAgIHN0ZXAoKTtcclxufVxyXG5cclxubGV0IGxhc3RTdGVwID0gRGF0ZS5ub3coKTtcclxuZnVuY3Rpb24gY2FsY3VsYXRlRWxhcHNlZCgpIHtcclxuICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSBsYXN0U3RlcDtcclxuICAgIGlmIChlbGFwc2VkID4gMTAwKSB7XHJcbiAgICAgICAgZWxhcHNlZCA9IDEwMDsgLy8gZW5mb3JjZSBzcGVlZCBsaW1pdFxyXG4gICAgfVxyXG4gICAgbGFzdFN0ZXAgPSBub3c7XHJcbiAgICByZXR1cm4gZWxhcHNlZDtcclxufSIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4uL2JvYXJkL3NoYXBlJztcclxuaW1wb3J0IHtQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb25zdGFudHMnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtldmVudEJ1cywgRXZlbnRUeXBlfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9hY3RpdmUtc2hhcGUtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVFbmRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9hY3RpdmUtc2hhcGUtZW5kZWQtZXZlbnQnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50fSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLW1vdmVtZW50JztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge1BsYXllck1vdmVtZW50RXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3BsYXllci1tb3ZlbWVudC1ldmVudCc7XHJcbmltcG9ydCB7TUFYX0hQLCB2aXRhbHN9IGZyb20gJy4uL3ZpdGFscyc7XHJcblxyXG5jb25zdCBNQVhfQ09MUyA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjtcclxuXHJcbi8qKlxyXG4gKiBIb3cgbG9uZyB0byB3YWl0IGJlZm9yZSBtYW5pcHVsYXRpbmcgYSBzaGFwZSB0aGF0IGhhcyBqdXN0IGNvbWUgaW50byBwbGF5LlxyXG4gKi9cclxuY29uc3QgVElNRV9ERUxBWSA9IDUwMDtcclxuXHJcbi8qKlxyXG4gKiBIb3cgbG9uZyB0byB3YWl0IGJlZm9yZSBtYW5pcHVsYXRpbmcgdGhlIHNoYXBlIHRoYXQgaXMgaW4gcGxheS5cclxuICovXHJcbmNvbnN0IFRJTUVfQkVUV0VFTl9NT1ZFUyA9IDIwMDtcclxuXHJcbi8vIFRoZXNlIGNvbnN0YW50cyBhcmUgZm9yIHRpbWluZyBob3cgbG9uZyB0byB3YWl0IGJlZm9yZSBkcm9wcGluZyBzaGFwZSwgc2luY2UgdGhlIHN0YXJ0IG9mIHRoZSBzaGFwZS5cclxuY29uc3QgVElNRV9GQVNURVNUX1RJTExfRFJPUCA9IDI4NTA7XHJcbmNvbnN0IFRJTUVfU0xPV0VTVF9USUxMX0RST1AgPSA0ODUwO1xyXG5jb25zdCBSQU5HRV9USU1FX1RJTExfRFJPUCA9IFRJTUVfU0xPV0VTVF9USUxMX0RST1AgLSBUSU1FX0ZBU1RFU1RfVElMTF9EUk9QO1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgc29tZSB2YXJpYXRpb24gdG8gVElNRV9CRVRXRUVOX01PVkVTXHJcbiAqL1xyXG5jb25zdCBUSU1FX01BWF9BRERJVElPTkFMX1RJTUVfQkVUV0VFTl9NT1ZFUyA9IDEwMDtcclxuXHJcbmludGVyZmFjZSBab21iaWVCb2FyZCB7XHJcbiAgICAvLyBXYXlzIHRvIGludGVyYWN0IHdpdGggaXQuXHJcbiAgICBtb3ZlU2hhcGVMZWZ0KCk6IGJvb2xlYW47XHJcbiAgICBtb3ZlU2hhcGVSaWdodCgpOiBib29sZWFuO1xyXG4gICAgbW92ZVNoYXBlRG93bigpOiBib29sZWFuO1xyXG4gICAgbW92ZVNoYXBlRG93bkFsbFRoZVdheSgpOiB2b2lkO1xyXG4gICAgbW92ZVRvVG9wKCk6IHZvaWQ7XHJcbiAgICByb3RhdGVTaGFwZUNsb2Nrd2lzZSgpOiBib29sZWFuO1xyXG4gICAgY29udmVydFNoYXBlVG9DZWxscygpOiB2b2lkO1xyXG4gICAgdW5kb0NvbnZlcnRTaGFwZVRvQ2VsbHMoKTogdm9pZDtcclxuXHJcbiAgICAvLyBXYXlzIHRvIGRlcml2ZSBpbmZvcm1hdGlvbiBmcm9tIGl0LlxyXG4gICAgZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCk6IG51bWJlcjtcclxuICAgIGNhbGN1bGF0ZUFnZ3JlZ2F0ZUhlaWdodCgpOiBudW1iZXI7XHJcbiAgICBjYWxjdWxhdGVDb21wbGV0ZUxpbmVzKCk6IG51bWJlcjtcclxuICAgIGNhbGN1bGF0ZUhvbGVzKCk6IG51bWJlcjtcclxuICAgIGNhbGN1bGF0ZUJ1bXBpbmVzcygpOiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBSZWFsQm9hcmQgZXh0ZW5kcyBab21iaWVCb2FyZCB7XHJcbiAgICBjbG9uZVpvbWJpZSgpOiBab21iaWVCb2FyZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEFpIHtcclxuXHJcbiAgICBwcml2YXRlIHJlYWxCb2FyZDogUmVhbEJvYXJkO1xyXG4gICAgcHJpdmF0ZSB0aW1lVW50aWxOZXh0TW92ZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBkZWxheVR0bDogbnVtYmVyO1xyXG5cclxuICAgIC8vIEhvdyBsb25nIHRoZSBjdXJyZW50IHNoYXBlIHNob3VsZCBsYXN0LCBpZiBwb3NzaWJsZSwgdGlsbCBBSSBoaXRzIHRoZSBzcGFjZSBiYXIuXHJcbiAgICBwcml2YXRlIHRpbWVUaWxsRHJvcDogbnVtYmVyO1xyXG5cclxuICAgIC8vIDAgPSBubyByb3RhdGlvbiwgMSA9IG9uZSByb3RhdGlvbiwgMiA9IHR3byByb3RhdGlvbnMsIDMgPSB0aHJlZSByb3RhdGlvbnMuXHJcbiAgICBwcml2YXRlIHRhcmdldFJvdGF0aW9uOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRSb3RhdGlvbjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB0YXJnZXRDb2xJZHg6IG51bWJlcjtcclxuICAgIC8vIFByZXZlbnQgQUkgZnJvbSBkb2luZyBhbnl0aGluZyB3aGlsZSB0aGUgcGllY2UgaXMgd2FpdGluZyB0byBcImxvY2tcIiBpbnRvIHRoZSBtYXRyaXguXHJcbiAgICBwcml2YXRlIG1vdmVDb21wbGV0ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IocmVhbEJvYXJkOiBSZWFsQm9hcmQpIHtcclxuICAgICAgICB0aGlzLnJlYWxCb2FyZCA9IHJlYWxCb2FyZDtcclxuICAgICAgICB0aGlzLnRpbWVVbnRpbE5leHRNb3ZlID0gdGhpcy5jYWxjdWxhdGVUaW1lVW50aWxOZXh0TW92ZSgpO1xyXG4gICAgICAgIHRoaXMuZGVsYXlUdGwgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnRpbWVUaWxsRHJvcCA9IFRJTUVfU0xPV0VTVF9USUxMX0RST1A7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0Um90YXRpb24gPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gMDtcclxuICAgICAgICB0aGlzLnRhcmdldENvbElkeCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ29tcGxldGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMudGltZVRpbGxEcm9wIC09IGVsYXBzZWQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRlbGF5VHRsID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmRlbGF5VHRsIC09IGVsYXBzZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50aW1lVW50aWxOZXh0TW92ZSAtPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICBpZiAodGhpcy50aW1lVW50aWxOZXh0TW92ZSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVVbnRpbE5leHRNb3ZlID0gdGhpcy5jYWxjdWxhdGVUaW1lVW50aWxOZXh0TW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZHZhbmNlVG93YXJkc1RhcmdldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBtZXRob2QgcHJvdmlkZXMgYSBoaWdoLWxldmVsIHZpZXcgb2YgdGhlIEFJJ3MgdGhvdWdodCBwcm9jZXNzLlxyXG4gICAgICovXHJcbiAgICBzdHJhdGVnaXplKCkge1xyXG4gICAgICAgIC8vIFBhcnQgMSAtIERldGVybWluZSBob3cgbG9uZyB0aGlzIG1vdmUgc2hvdWxkIGJlLCBiYXNlZCBvbiBjdXJyZW50IHNjb3JlLlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gSGlnaGVyIG1lYW5zIGh1bWFuIGlzIHdpbm5pbmcuXHJcbiAgICAgICAgICAgIGxldCBkaWZmID0gdml0YWxzLmh1bWFuSGl0UG9pbnRzIC0gdml0YWxzLmFpSGl0UG9pbnRzO1xyXG4gICAgICAgICAgICBsZXQgcGN0ID0gKE1BWF9IUCAtIGRpZmYpIC8gKE1BWF9IUCAqIDIpOyBcclxuICAgICAgICAgICAgdGhpcy50aW1lVGlsbERyb3AgPSBUSU1FX0ZBU1RFU1RfVElMTF9EUk9QICsgKHBjdCAqIFJBTkdFX1RJTUVfVElMTF9EUk9QKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFBhcnQgMiAtIERldGVybWluZSBob3cgdG8gZml0IHRoZSBnaXZlbiBzaGFwZS5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCB6b21iaWUgPSB0aGlzLnJlYWxCb2FyZC5jbG9uZVpvbWJpZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGFsbCBwb3NzaWJsZSByb3RhdGlvbnMgYW5kIGNvbHVtbnNcclxuICAgICAgICAgICAgbGV0IGJlc3RGaXRuZXNzID0gTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVI7XHJcbiAgICAgICAgICAgIGxldCBiZXN0Um90YXRpb24gPSAwO1xyXG4gICAgICAgICAgICBsZXQgYmVzdENvbElkeCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvdGF0aW9uID0gMDsgcm90YXRpb24gPCA0OyByb3RhdGlvbisrKSB7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSh6b21iaWUubW92ZVNoYXBlTGVmdCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBNQVhfQ09MUzsgaWR4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB6b21iaWUubW92ZVNoYXBlRG93bkFsbFRoZVdheSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHpvbWJpZS5jb252ZXJ0U2hhcGVUb0NlbGxzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmaXRuZXNzID0gdGhpcy5jYWxjdWxhdGVGaXRuZXNzKHpvbWJpZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpdG5lc3MgPiBiZXN0Rml0bmVzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0Rml0bmVzcyA9IGZpdG5lc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RSb3RhdGlvbiA9IHJvdGF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0Q29sSWR4ID0gem9tYmllLmdldEN1cnJlbnRTaGFwZUNvbElkeCgpOyAvLyBVc2UgdGhpcyByYXRoZXIgdGhhbiBpZHggaW4gY2FzZSBpdCB3YXMgb2ZmIGJlY2F1c2Ugb2Ygd2hhdGV2ZXIgcmVhc29uIChvYnN0cnVjdGlvbiwgd2FsbCwgZXRjLi4uKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgem9tYmllLnVuZG9Db252ZXJ0U2hhcGVUb0NlbGxzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgem9tYmllLm1vdmVUb1RvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjYW5Nb3ZlUmlnaHQgPSB6b21iaWUubW92ZVNoYXBlUmlnaHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FuTW92ZVJpZ2h0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB6b21iaWUucm90YXRlU2hhcGVDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRmluYWxseSwgc2V0IHRoZSB2YWx1ZXMgdGhhdCB3aWxsIGxldCB0aGUgQUkgYWR2YW5jZSB0b3dhcmRzIHRoZSB0YXJnZXQuXHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Um90YXRpb24gPSBiZXN0Um90YXRpb247XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXRDb2xJZHggPSBiZXN0Q29sSWR4O1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDb21wbGV0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5BaSkge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQuc3RhcnRpbmcgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsYXlUdGwgPSBUSU1FX0RFTEFZO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gRG8gbm90IG5lZWQgdG8gcmVhY3QgdG8gaHVtYW4ncyBzaGFwZSBtb3ZlbWVudHMuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZWQgb24gaHR0cHM6Ly9jb2RlbXlyb2FkLndvcmRwcmVzcy5jb20vMjAxMy8wNC8xNC90ZXRyaXMtYWktdGhlLW5lYXItcGVyZmVjdC1wbGF5ZXIvXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlRml0bmVzcyh6b21iaWU6IFpvbWJpZUJvYXJkKSB7XHJcbiAgICAgICAgbGV0IGFnZ3JlZ2F0ZUhlaWdodCA9IHpvbWJpZS5jYWxjdWxhdGVBZ2dyZWdhdGVIZWlnaHQoKTtcclxuICAgICAgICBsZXQgY29tcGxldGVMaW5lcyA9IHpvbWJpZS5jYWxjdWxhdGVDb21wbGV0ZUxpbmVzKCk7XHJcbiAgICAgICAgbGV0IGhvbGVzID0gem9tYmllLmNhbGN1bGF0ZUhvbGVzKCk7XHJcbiAgICAgICAgbGV0IGJ1bXBpbmVzcyA9IHpvbWJpZS5jYWxjdWxhdGVCdW1waW5lc3MoKTtcclxuICAgICAgICBsZXQgZml0bmVzcyA9ICgtMC41MTAwNjYgKiBhZ2dyZWdhdGVIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgKyAoIDAuNzYwNjY2ICogY29tcGxldGVMaW5lcylcclxuICAgICAgICAgICAgICAgICAgICArICgtMC4zNTY2MyAgKiBob2xlcylcclxuICAgICAgICAgICAgICAgICAgICArICgtMC4xODQ0ODMgKiBidW1waW5lc3MpO1xyXG4gICAgICAgIHJldHVybiBmaXRuZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWR2YW5jZVRvd2FyZHNUYXJnZXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubW92ZUNvbXBsZXRlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um90YXRpb24gPT09IHRoaXMudGFyZ2V0Um90YXRpb24gJiYgdGhpcy5yZWFsQm9hcmQuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCkgPT09IHRoaXMudGFyZ2V0Q29sSWR4KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVUaWxsRHJvcCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5tb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldENvbElkeCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVDb21wbGV0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gU3RpbGwgaGF2ZSB0aW1lIHRvIHdhaXQgYmVmb3JlIGRyb3BwaW5nIHRoZSBzaGFwZS5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3RhdGlvbiA8IHRoaXMudGFyZ2V0Um90YXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhbEJvYXJkLnJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbisrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5yZWFsQm9hcmQuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCkgPCB0aGlzLnRhcmdldENvbElkeCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFsQm9hcmQubW92ZVNoYXBlUmlnaHQoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlYWxCb2FyZC5nZXRDdXJyZW50U2hhcGVDb2xJZHgoKSA+IHRoaXMudGFyZ2V0Q29sSWR4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5tb3ZlU2hhcGVMZWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVUaW1lVW50aWxOZXh0TW92ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKFRJTUVfQkVUV0VFTl9NT1ZFUyArIChNYXRoLnJhbmRvbSgpICogVElNRV9NQVhfQURESVRJT05BTF9USU1FX0JFVFdFRU5fTU9WRVMpKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7U2hhcGV9IGZyb20gJy4vc2hhcGUnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi8uLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7U2hhcGVGYWN0b3J5LCBkZWFkU2hhcGVGYWN0b3J5fSBmcm9tICcuL3NoYXBlLWZhY3RvcnknO1xyXG5pbXBvcnQge0V2ZW50QnVzLCBkZWFkRXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7Q2VsbENoYW5nZUV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9jZWxsLWNoYW5nZS1ldmVudCc7XHJcbmltcG9ydCB7Um93c0ZpbGxlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9yb3dzLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUVuZGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7Qm9hcmRGaWxsZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYm9hcmQtZmlsbGVkLWV2ZW50JztcclxuXHJcbmNvbnN0IE1BWF9ST1dTID0gMTk7IC8vIFRvcCAyIHJvd3MgYXJlIG9ic3RydWN0ZWQgZnJvbSB2aWV3LiBBbHNvLCBzZWUgbGlnaHRpbmctZ3JpZC50cy5cclxuY29uc3QgTUFYX0NPTFMgPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7XHJcbmNvbnN0IFRFTVBfREVMQVlfTVMgPSA1MDA7XHJcblxyXG5jb25zdCBlbnVtIEJvYXJkU3RhdGUge1xyXG4gICAgUGF1c2VkLFxyXG4gICAgSW5QbGF5XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCb2FyZCB7XHJcbiAgICBwcml2YXRlIHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcbiAgICBwcml2YXRlIHNoYXBlRmFjdG9yeTogU2hhcGVGYWN0b3J5O1xyXG4gICAgcHJpdmF0ZSBldmVudEJ1czogRXZlbnRCdXM7XHJcblxyXG4gICAgcHJpdmF0ZSBib2FyZFN0YXRlOiBCb2FyZFN0YXRlO1xyXG4gICAgcHJpdmF0ZSBtc1RpbGxHcmF2aXR5VGljazogbnVtYmVyO1xyXG5cclxuICAgIGN1cnJlbnRTaGFwZTogU2hhcGU7XHJcbiAgICByZWFkb25seSBtYXRyaXg6IENlbGxbXVtdO1xyXG5cclxuICAgIHByaXZhdGUganVua1Jvd0hvbGVDb2x1bW46IG51bWJlcjtcclxuICAgIHByaXZhdGUganVua1Jvd0hvbGVEaXJlY3Rpb246IG51bWJlcjtcclxuICAgIHByaXZhdGUganVua1Jvd0NvbG9yMTogQ29sb3I7XHJcbiAgICBwcml2YXRlIGp1bmtSb3dDb2xvcjI6IENvbG9yO1xyXG4gICAgcHJpdmF0ZSBqdW5rUm93Q29sb3JJZHg6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlLCBzaGFwZUZhY3Rvcnk6IFNoYXBlRmFjdG9yeSwgZXZlbnRCdXM6IEV2ZW50QnVzKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgICAgICB0aGlzLnNoYXBlRmFjdG9yeSA9IHNoYXBlRmFjdG9yeTtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzID0gZXZlbnRCdXM7XHJcblxyXG4gICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuUGF1c2VkO1xyXG4gICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPSBURU1QX0RFTEFZX01TO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5tYXRyaXggPSBbXTtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCBNQVhfUk9XUzsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXhbcm93SWR4XSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XSA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwbGF5ZXJUeXBlID09PSBQbGF5ZXJUeXBlLkh1bWFuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPSBNQVhfQ09MUyAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuanVua1Jvd0hvbGVEaXJlY3Rpb24gPSAxO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0NvbG9yMSA9IENvbG9yLldoaXRlO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0NvbG9yMiA9IENvbG9yLldoaXRlO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0NvbG9ySWR4ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICByZXNldEFuZFBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuSW5QbGF5O1xyXG4gICAgICAgIHRoaXMuc3RhcnRTaGFwZSh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgZ2l2ZXMgYSBoaWdoIGxldmVsIHZpZXcgb2YgdGhlIG1haW4gZ2FtZSBsb29wLlxyXG4gICAgICogVGhpcyBzaG91bGRuJ3QgYmUgY2FsbGVkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLlBhdXNlZCkge1xyXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGhlcmUganVzdCB0byBlbnN1cmUgdGhhdCB0aGUgbWV0aG9kIHRvIHJ1bnMgaW1tZWRpYXRlbHkgYWZ0ZXIgdW5wYXVzaW5nLlxyXG4gICAgICAgICAgICB0aGlzLm1zVGlsbEdyYXZpdHlUaWNrID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm1zVGlsbEdyYXZpdHlUaWNrIC09IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1zVGlsbEdyYXZpdHlUaWNrIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPSBURU1QX0RFTEFZX01TO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHJ5R3Jhdml0eSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlU2hhcGVEb3duKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRW5kT2ZDdXJyZW50UGllY2VUYXNrcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbCB0aGlzIG9uY2UgYSBzaGFwZSBpcyBrbm93biB0byBiZSBpbiBpdHMgZmluYWwgcmVzdGluZyBwb3NpdGlvbi5cclxuICAgICAqL1xyXG4gICAgaGFuZGxlRW5kT2ZDdXJyZW50UGllY2VUYXNrcygpIHtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IEFjdGl2ZVNoYXBlRW5kZWRFdmVudCh0aGlzLnBsYXllclR5cGUsIHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb252ZXJ0U2hhcGVUb0NlbGxzKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFuZGxlRnVsbEJvYXJkKCkpIHtcclxuICAgICAgICAgICAgLy8gQm9hcmQgaXMgZnVsbCAtLSBzdGFydGluZyBhIG5ldyBzaGFwZSB3YXMgZGVsZWdhdGVkIHRvIGxhdGVyIGJ5IGhhbmRsZUZ1bGxCb2FyZCgpLlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhhbmRsZUFueUZpbGxlZExpbmVzUGFydDEoKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlcmUgd2VyZSBmaWxsZWQgbGluZXMgLS0gc3RhcnRpbmcgYSBuZXcgc2hhcGUgd2FzIGRlbGVnYXRlZCB0byBsYXRlciBieSBoYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQxKCkuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0U2hhcGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIGdldEN1cnJlbnRTaGFwZUNvbElkeCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVMZWZ0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzdWNjZXNzOiBib29sZWFuO1xyXG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdGUgPT09IEJvYXJkU3RhdGUuSW5QbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVSaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVSaWdodCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLkluUGxheSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlUmlnaHQoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZUxlZnQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlRG93bigpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLkluUGxheSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlRG93bigpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVNoYXBlRG93bkFsbFRoZVdheSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3VjY2VzczogYm9vbGVhbjtcclxuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXRlID09PSBCb2FyZFN0YXRlLkluUGxheSkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlRG93bigpO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKTsgLy8gVE9ETzogQWRkIHVwcGVyIGJvdW5kLlxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVXAoKTtcclxuICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBtb3ZlVG9Ub3AoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVRvVG9wKCk7IFxyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzdWNjZXNzOiBib29sZWFuO1xyXG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdGUgPT09IEJvYXJkU3RhdGUuSW5QbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLnJvdGF0ZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5qaWdnbGVSb3RhdGVkU2hhcGVBcm91bmQoKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLnJvdGF0ZUNvdW50ZXJDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgYWJsZSB0byBzdWNjZXNzZnVsbHkgcm90YXRlIHRoZSBzaGFwZSBhbG9uZ3NpZGUgYW55dGhpbmcsIGlmIGFueS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBqaWdnbGVSb3RhdGVkU2hhcGVBcm91bmQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICBsZXQgb3JpZ2luYWxSb3cgPSB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICBsZXQgb3JpZ2luYWxDb2wgPSB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7IC8vIERpZG4ndCBuZWVkIHRvIGRvIGFueSBqaWdnbGluZyBhdCBhbGwuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gSmlnZ2xlIGl0IGxlZnQuXHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdGhpcy5kb1VwVG9UaHJlZVRpbWVzKG9yaWdpbmFsUm93LCBvcmlnaW5hbENvbCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgc3RpbGwgdW5zdWNjZXNzZnVsLCBqaWdnbGUgaXQgcmlnaHQuXHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdGhpcy5kb1VwVG9UaHJlZVRpbWVzKG9yaWdpbmFsUm93LCBvcmlnaW5hbENvbCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVSaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBzdGlsbCB1bnN1Y2Nlc3NmdWwsIG1vdmUgaXQgdXAsIHVwIHRvIDQgdGltZXMuXHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdGhpcy5kb1VwVG9UaHJlZVRpbWVzKG9yaWdpbmFsUm93LCBvcmlnaW5hbENvbCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgamlnZ2xlUm90YXRlZFNoYXBlQXJvdW5kKCkuXHJcbiAgICAgKiBcclxuICAgICAqIFNldHMgdGhlIGN1cnJlbnQgc2hhcGUgdG8gdGhlIGdpdmVuIG9yaWdpbmFsIGNvb3JkaW5hdGVzLlxyXG4gICAgICogVGhlbiwgcnVucyB0aGUgZ2l2ZW4gbGFtYmRhIGEgZmV3IHRpbWVzIHRvIHNlZSBpZiBhbnkgcHJvZHVjZSBhIG5vbi1jb2xsaXNpb24gc3RhdGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZG9VcFRvVGhyZWVUaW1lcyhvcmlnaW5hbFJvdzogbnVtYmVyLCBvcmlnaW5hbENvbDogbnVtYmVyLCB0aGluZzogKCkgPT4gdm9pZCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLnNldFJvdyhvcmlnaW5hbFJvdyk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUuc2V0Q29sKG9yaWdpbmFsQ29sKTtcclxuXHJcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKGxldCBjb3VudCA9IDA7IGNvdW50IDwgMzsgY291bnQrKykge1xyXG4gICAgICAgICAgICB0aGluZygpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBhZGRKdW5rUm93cyhudW1iZXJPZlJvd3NUb0FkZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gQ2xlYXIgcm93cyBhdCB0aGUgdG9wIHRvIG1ha2Ugcm9vbSBhdCB0aGUgYm90dG9tLlxyXG4gICAgICAgIHRoaXMubWF0cml4LnNwbGljZSgwLCBudW1iZXJPZlJvd3NUb0FkZCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBqdW5rIHJvd3MgYXQgdGhlIGJvdHRvbS5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBudW1iZXJPZlJvd3NUb0FkZDsgaWR4KyspIHtcclxuICAgICAgICAgICAgLy8gU2V0IHRoZSByb3cgdG8gY29tcGxldGVseSBmaWxsZWQuXHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IHRoaXMuZ2V0TmV4dEp1bmtSb3dDb2xvcigpO1xyXG4gICAgICAgICAgICBsZXQgcm93OiBDZWxsW10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgICAgICAgICBjZWxsLnNldENvbG9yKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIHJvdy5wdXNoKGNlbGwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQdW5jaCBhIGhvbGUgaW4gdGhlIGxpbmUuXHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gcm93W3RoaXMuanVua1Jvd0hvbGVDb2x1bW5dO1xyXG4gICAgICAgICAgICBjZWxsLnNldENvbG9yKENvbG9yLkVtcHR5KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBhcmUgZm9yIHRoZSBuZXh0IGp1bmsgcm93IGxpbmUuXHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gKz0gdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbjtcclxuICAgICAgICAgICAgaWYgKHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVEaXJlY3Rpb24gKj0gLTE7IC8vIEZsaXBzIHRoZSBkaXJlY3Rpb25cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID49IE1BWF9DT0xTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gTUFYX0NPTFMgLSAyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbiAqPSAtMTsgLy8gRmxpcHMgdGhlIGRpcmVjdGlvblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeC5wdXNoKHJvdyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE5vdGlmeSBmb3IgYWxsIGNlbGxzIGJlY2F1c2UgZW50aXJlIGJvYXJkIGhhcyBjaGFuZ2VkLlxyXG4gICAgICAgIC8vIFRPRE86IE1vdmUgdG8gb3duIG1ldGhvZD9cclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCwgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFByZXZlbnQgYWN0aXZlIHNoYXBlIGZyb20gZ2V0dGluZyBidXJpZWQgaW4gYXMgbWFueSBhcyA0IHJvd3MuXHJcbiAgICAgICAgZm9yIChsZXQgY291bnQgPSAwOyBjb3VudCA8IDQ7IGNvdW50KyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpID4gMCAmJiB0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFZlcnkgaGFja3kgbWV0aG9kIGp1c3Qgc28gdGhlIEFJIGhhcyBhIHRlbXAgY29weSBvZiB0aGUgYm9hcmQgdG8gZXhwZXJpbWVudCB3aXRoLlxyXG4gICAgICovXHJcbiAgICBjbG9uZVpvbWJpZSgpOiBCb2FyZCB7XHJcbiAgICAgICAgbGV0IGNvcHkgPSBuZXcgQm9hcmQodGhpcy5wbGF5ZXJUeXBlLCBkZWFkU2hhcGVGYWN0b3J5LCBkZWFkRXZlbnRCdXMpO1xyXG5cclxuICAgICAgICAvLyBBbGxvdyB0aGUgQUkgdG8gbW92ZSBhbmQgcm90YXRlIHRoZSBjdXJyZW50IHNoYXBlXHJcbiAgICAgICAgY29weS5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5JblBsYXk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ29weSB0aGUgY3VycmVudCBzaGFwZSBhbmQgdGhlIG1hdHJpeC4gU2hvdWxkbid0IG5lZWQgYW55dGhpbmcgZWxzZS5cclxuICAgICAgICBjb3B5LmN1cnJlbnRTaGFwZSA9IHRoaXMuY3VycmVudFNoYXBlLmNsb25lU2ltcGxlKCk7XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGNvcHkubWF0cml4W3Jvd0lkeF1bY29sSWR4XS5zZXRDb2xvcihyb3dbY29sSWR4XS5nZXRDb2xvcigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvcHk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQWdncmVnYXRlSGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGNvbEhlaWdodHMgPSB0aGlzLmNhbGN1bGF0ZUNvbHVtbkhlaWdodHMoKTtcclxuICAgICAgICByZXR1cm4gY29sSGVpZ2h0cy5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEgKyBiOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEZhbGxpbmdTZXF1ZW5jZXIuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZUhpZ2hlc3RDb2x1bW4oKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgY29sSGVpZ2h0cyA9IHRoaXMuY2FsY3VsYXRlQ29sdW1uSGVpZ2h0cygpO1xyXG4gICAgICAgIHJldHVybiBjb2xIZWlnaHRzLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYSA+IGIgPyBhIDogYjsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQ29tcGxldGVMaW5lcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBjb21wbGV0ZUxpbmVzID0gMDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChyb3dbY29sSWR4XS5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvdW50ID49IHJvdy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlTGluZXMrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlTGluZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqIERldGVybWluZXMgaG9sZXMgYnkgc2Nhbm5pbmcgZWFjaCBjb2x1bW4sIGhpZ2hlc3QgZmxvb3IgdG8gbG93ZXN0IGZsb29yLCBhbmRcclxuICAgICAqIHNlZWluZyBob3cgbWFueSB0aW1lcyBpdCBzd2l0Y2hlcyBmcm9tIGNvbG9yZWQgdG8gZW1wdHkgKGJ1dCBub3QgdGhlIG90aGVyIHdheSBhcm91bmQpLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVIb2xlcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB0b3RhbEhvbGVzID0gMDtcclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IGhvbGVzID0gMDtcclxuICAgICAgICAgICAgbGV0IHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNDZWxsV2FzRW1wdHkgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG9sZXMrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NlbGxXYXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG90YWxIb2xlcyArPSBob2xlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRvdGFsSG9sZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQnVtcGluZXNzKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGJ1bXBpbmVzcyA9IDA7XHJcbiAgICAgICAgbGV0IGNvbEhlaWdodHMgPSB0aGlzLmNhbGN1bGF0ZUNvbHVtbkhlaWdodHMoKTtcclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBjb2xIZWlnaHRzLmxlbmd0aCAtIDI7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWwxID0gY29sSGVpZ2h0c1tpZHhdO1xyXG4gICAgICAgICAgICBsZXQgdmFsMiA9IGNvbEhlaWdodHNbaWR4ICsgMV07XHJcbiAgICAgICAgICAgIGJ1bXBpbmVzcyArPSBNYXRoLmFicyh2YWwxIC0gdmFsMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBidW1waW5lc3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVDb2x1bW5IZWlnaHRzKCk6IG51bWJlcltdIHtcclxuICAgICAgICBsZXQgY29sSGVpZ2h0czogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgY29sSGVpZ2h0cy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBoaWdoZXN0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gTUFYX1JPV1MgLSAxOyByb3dJZHggPj0gMDsgcm93SWR4LS0pIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBoaWdoZXN0ID0gTUFYX1JPV1MgLSByb3dJZHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29sSGVpZ2h0c1tjb2xJZHhdID0gaGlnaGVzdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbEhlaWdodHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgb25seSByZWFzb24gdGhpcyBpcyBub3QgcHJpdmF0ZSBpcyBzbyB0aGUgQUkgY2FuIGV4cGVyaW1lbnQgd2l0aCBpdC5cclxuICAgICAqIFdvcmsgaGVyZSBzaG91bGQgYWJsZSB0byBiZSBiZSB1bmRvbmUgYnkgdW5kb0NvbnZlcnRTaGFwZVRvQ2VsbHMuXHJcbiAgICAgKi9cclxuICAgIGNvbnZlcnRTaGFwZVRvQ2VsbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIHRoaXMuY3VycmVudFNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgcm93SWR4ID0gb2Zmc2V0LnkgKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICAgICAgbGV0IGNvbElkeCA9IG9mZnNldC54ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm93SWR4IDwgMCB8fCByb3dJZHggPj0gdGhpcy5tYXRyaXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbElkeCA8IDAgfHwgY29sSWR4ID49IHRoaXMubWF0cml4W3Jvd0lkeF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDZWxsQ29sb3Iocm93SWR4LCBjb2xJZHgsIHRoaXMuY3VycmVudFNoYXBlLmNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS4gU2hvdWxkIHVuZG8gY29udmVydFNoYXBlVG9DZWxscygpLlxyXG4gICAgICovXHJcbiAgICB1bmRvQ29udmVydFNoYXBlVG9DZWxscygpIHtcclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2YgdGhpcy5jdXJyZW50U2hhcGUuZ2V0T2Zmc2V0cygpKSB7XHJcbiAgICAgICAgICAgIGxldCByb3dJZHggPSBvZmZzZXQueSArIHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpO1xyXG4gICAgICAgICAgICBsZXQgY29sSWR4ID0gb2Zmc2V0LnggKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3dJZHggPCAwIHx8IHJvd0lkeCA+PSB0aGlzLm1hdHJpeC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sSWR4IDwgMCB8fCBjb2xJZHggPj0gdGhpcy5tYXRyaXhbcm93SWR4XS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgQ29sb3IuRW1wdHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNsZWFyKCkge1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgQ29sb3IuRW1wdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBbdGhpcy5qdW5rUm93Q29sb3IxLCB0aGlzLmp1bmtSb3dDb2xvcjJdID0gdGhpcy5nZXRSYW5kb21Db2xvcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciBtZXRob2QgdG8gY2hhbmdlIGEgc2luZ2xlIGNlbGwgY29sb3IncyBhbmQgbm90aWZ5IHN1YnNjcmliZXJzIGF0IHRoZSBzYW1lIHRpbWUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2hhbmdlQ2VsbENvbG9yKHJvd0lkeDogbnVtYmVyLCBjb2xJZHg6IG51bWJlciwgY29sb3I6IENvbG9yKSB7XHJcbiAgICAgICAgLy8gVE9ETzogTWF5YmUgYm91bmRzIGNoZWNrIGhlcmUuXHJcbiAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgY2VsbC5zZXRDb2xvcihjb2xvcik7XHJcbiAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBDZWxsQ2hhbmdlRXZlbnQoY2VsbCwgcm93SWR4LCBjb2xJZHgsIHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhcnRTaGFwZShmb3JjZUJhZ1JlZmlsbDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlID0gdGhpcy5zaGFwZUZhY3RvcnkubmV4dFNoYXBlKGZvcmNlQmFnUmVmaWxsKTtcclxuICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHRyeUdyYXZpdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGNhbk1vdmVEb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIGNhbk1vdmVEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gY2FuTW92ZURvd247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlbmRlZCBmb3IgY2hlY2tpbmcgb2YgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnRcclxuICAgICAqIHNoYXBlIGhhcyBhbnkgb3ZlcmxhcCB3aXRoIGV4aXN0aW5nIGNlbGxzIHRoYXQgaGF2ZSBjb2xvci5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjb2xsaXNpb25EZXRlY3RlZCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgY29sbGlzaW9uID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiB0aGlzLmN1cnJlbnRTaGFwZS5nZXRPZmZzZXRzKCkpIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IG9mZnNldC55ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Um93KCk7XHJcbiAgICAgICAgICAgIGxldCBjb2wgPSBvZmZzZXQueCArIHRoaXMuY3VycmVudFNoYXBlLmdldENvbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvdyA8IDAgfHwgcm93ID49IHRoaXMubWF0cml4Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sIDwgMCB8fCBjb2wgPj0gdGhpcy5tYXRyaXhbcm93XS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubWF0cml4W3Jvd11bY29sXS5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29sbGlzaW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlRnVsbEJvYXJkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBmdWxsID0gdGhpcy5pc0JvYXJkRnVsbCgpO1xyXG4gICAgICAgIGlmIChmdWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuUGF1c2VkOyAvLyBTdGFuZGJ5IHVudGlsIHNlcXVlbmNlIGlzIGZpbmlzaGVkLlxyXG4gICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IEJvYXJkRmlsbGVkRXZlbnQodGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIGZ1bGwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEl0IGlzIGNvbnNpZGVyZWQgZnVsbCBpZiB0aGUgdHdvIG9ic2N1cmVkIHJvd3MgYXQgdGhlIHRvcCBoYXZlIGNvbG9yZWQgY2VsbHMgaW4gdGhlbS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBpc0JvYXJkRnVsbCgpOiBib29sZWFuIHtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCAyOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZmlsbGVkIGxpbmVzIG1ldGhvZCAxIG9mIDIsIGJlZm9yZSBhbmltYXRpb24uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaGFuZGxlQW55RmlsbGVkTGluZXNQYXJ0MSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZmlsbGVkUm93SWR4cyA9IHRoaXMuZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpO1xyXG4gICAgICAgIGlmIChmaWxsZWRSb3dJZHhzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBSb3dzRmlsbGVkRXZlbnQoZmlsbGVkUm93SWR4cywgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuUGF1c2VkOyAvLyBTdGFuZGJ5IHVudGlsIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBEb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIGlmIHRoZXJlIGFyZSBubyBmaWxsZWQgbGluZXMuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmaWxsZWRSb3dJZHhzLmxlbmd0aCA+IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZmlsbGVkIGxpbmVzIG1ldGhvZCAyIG9mIDIsIGFmdGVyIGFuaW1hdGlvbi5cclxuICAgICAqIFRoaXMgaXMgcHVibGljIHNvIHRoYXQgdGhlIE1vZGVsIGNhbiBjYWxsIGl0LlxyXG4gICAgICovXHJcbiAgICBoYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQyKCkge1xyXG4gICAgICAgIC8vIEhhdmUgdG8gY2hlY2sgdGhpcyBhZ2FpbiBiZWNhdXNlIHRoZXJlIGlzIGEgc2xpZ2h0IGNoYW5jZSB0aGF0IHJvd3Mgc2hpZnRlZCBkdXJpbmcgdGhlIGFuaW1hdGlvbi5cclxuICAgICAgICBsZXQgZmlsbGVkUm93SWR4cyA9IHRoaXMuZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdGhlIGZpbGxlZCByb3dzLlxyXG4gICAgICAgIC8vIEkgdGhpbmsgdGhpcyBvbmx5IHdvcmtzIGJlY2F1c2UgZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpIHJldHVybnMgYW4gYXJyYXkgc29ydGVkIGFzY2VuZGluZyBmcm9tIDAuXHJcbiAgICAgICAgLy8gSWYgaXQgd2Fzbid0IHNvcnRlZCB0aGVuIGl0IGNvdWxkIGVuZCB1cCBza2lwcGluZyByb3dzLlxyXG4gICAgICAgIGZvciAobGV0IGZpbGxlZFJvd0lkeCBvZiBmaWxsZWRSb3dJZHhzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQW5kQ29sbGFwc2UoZmlsbGVkUm93SWR4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhhdmUgdG8gc2VuZCBjZWxsIGNoYW5nZSBub3RpZmljYXRpb25zIGJlY2F1c2UgcmVtb3ZlQW5kQ29sbGFwc2UoKSBkb2VzIG5vdC5cclxuICAgICAgICB0aGlzLm5vdGlmeUFsbENlbGxzKCk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGlvbiB3YXMgZmluaXNoZWQgYW5kIGJvYXJkIHdhcyB1cGRhdGVkLCBzbyByZXN1bWUgcGxheS5cclxuICAgICAgICB0aGlzLmJvYXJkU3RhdGUgPSBCb2FyZFN0YXRlLkluUGxheTtcclxuICAgICAgICB0aGlzLnN0YXJ0U2hhcGUoZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBvbmx5IHRoZSBib3R0b20gcm93LlxyXG4gICAgICovXHJcbiAgICByZW1vdmVCb3R0b21MaW5lKCkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQW5kQ29sbGFwc2UoTUFYX1JPV1MgLSAxKTtcclxuXHJcbiAgICAgICAgLy8gSGF2ZSB0byBzZW5kIGNlbGwgY2hhbmdlIG5vdGlmaWNhdGlvbnMgYmVjYXVzZSByZW1vdmVBbmRDb2xsYXBzZSgpIGRvZXMgbm90LlxyXG4gICAgICAgIHRoaXMubm90aWZ5QWxsQ2VsbHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG5vdGlmeUFsbENlbGxzKCkge1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IE1BWF9ST1dTOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBDZWxsQ2hhbmdlRXZlbnQoY2VsbCwgcm93SWR4LCBjb2xJZHgsIHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGxpc3Qgb2YgbnVtYmVycywgYXNjZW5kaW5nLCB0aGF0IGNvcnJlc3BvbmQgdG8gZmlsbGVkIHJvd3MuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpOiBudW1iZXJbXSB7XHJcbiAgICAgICAgbGV0IGZpbGxlZFJvd0lkeHM6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgbGV0IGZpbGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNlbGwgb2Ygcm93KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChmaWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIGZpbGxlZFJvd0lkeHMucHVzaChyb3dJZHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmaWxsZWRSb3dJZHhzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyByZW1vdmVzIHRoZSBvbGQgcm93IGFuZCBwdXRzIGEgbmV3IHJvdyBpbiBpdHMgcGxhY2UgYXQgcG9zaXRpb24gMCwgd2hpY2ggaXMgdGhlIGhpZ2hlc3QgdmlzdWFsbHkgdG8gdGhlIHBsYXllci5cclxuICAgICAqIERlbGVnYXRlcyBjZWxsIG5vdGlmaWNhdGlvbiB0byB0aGUgY2FsbGluZyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVtb3ZlQW5kQ29sbGFwc2Uocm93SWR4OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2Uocm93SWR4LCAxKTtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2UoMCwgMCwgW10pO1xyXG4gICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFswXVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoc3RhcnRpbmc9ZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KHRoaXMuY3VycmVudFNoYXBlLCB0aGlzLnBsYXllclR5cGUsIHN0YXJ0aW5nKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXROZXh0SnVua1Jvd0NvbG9yKCk6IENvbG9yIHtcclxuICAgICAgICBsZXQgY29sb3I6IENvbG9yO1xyXG4gICAgICAgIGlmICh0aGlzLmp1bmtSb3dDb2xvcklkeCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gdGhpcy5qdW5rUm93Q29sb3IxO1xyXG4gICAgICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcklkeCA9IDE7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmp1bmtSb3dDb2xvcklkeCA+PSAxKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gdGhpcy5qdW5rUm93Q29sb3IyO1xyXG4gICAgICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcklkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFJhbmRvbUNvbG9ycygpOiBbQ29sb3IsIENvbG9yXSB7XHJcblxyXG4gICAgICAgIC8vIFNlbGVjdCB0d28gY29sb3JzIHRoYXQgYXJlIG5vdCBlcXVhbCB0byBlYWNoIG90aGVyLlxyXG4gICAgICAgIGxldCByYW5kMSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgIGxldCByYW5kMiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgIGlmIChyYW5kMSA9PT0gcmFuZDIpIHtcclxuICAgICAgICAgICAgcmFuZDIrKztcclxuICAgICAgICAgICAgaWYgKHJhbmQyID4gNikge1xyXG4gICAgICAgICAgICAgICAgcmFuZDIgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbdGhpcy5jb2xvckJ5TnVtYmVyKHJhbmQxKSwgdGhpcy5jb2xvckJ5TnVtYmVyKHJhbmQyKV07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgY29sb3JCeU51bWJlcih2YWx1ZTogbnVtYmVyKTogQ29sb3Ige1xyXG4gICAgICAgIGxldCBjb2xvcjogQ29sb3I7XHJcbiAgICAgICAgc3dpdGNoKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuQ3lhbjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLlllbGxvdztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLlB1cnBsZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLkdyZWVuO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuUmVkO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuQmx1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLk9yYW5nZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5XaGl0ZTsgLy8gU2hvdWxkbid0IGdldCBoZXJlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVFdFRU46IGFueTtcclxuXHJcbmNvbnN0IEZBTExfVElNRV9NUyA9IDE3NTA7XHJcblxyXG5pbnRlcmZhY2UgRmFsbGluZ0JvYXJkIHtcclxuICAgIGNhbGN1bGF0ZUhpZ2hlc3RDb2x1bW4oKTogbnVtYmVyO1xyXG4gICAgcmVtb3ZlQm90dG9tTGluZSgpOiB2b2lkO1xyXG4gICAgcmVzZXRBbmRQbGF5KCk6IHZvaWRcclxufVxyXG5cclxuY2xhc3MgRmFsbEd1aWRlIHtcclxuICAgIGxhc3RIZWlnaHQ6IG51bWJlcjtcclxuICAgIHR3ZWVuZWRIZWlnaHQ6IG51bWJlcjtcclxuICAgIGVsYXBzZWQ6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZhbGxpbmdTZXF1ZW5jZXIge1xyXG5cclxuICAgIHByaXZhdGUgYm9hcmQ6IEZhbGxpbmdCb2FyZDtcclxuICAgIHByaXZhdGUgZmFsbFR3ZWVuOiBhbnk7XHJcbiAgICBwcml2YXRlIGZhbGxUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZmFsbEd1aWRlOiBGYWxsR3VpZGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoYm9hcmQ6IEZhbGxpbmdCb2FyZCkge1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSBib2FyZDtcclxuICAgICAgICB0aGlzLmZhbGxUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5mYWxsR3VpZGUgPSBuZXcgRmFsbEd1aWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRBbmRQbGF5KGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5mYWxsR3VpZGUubGFzdEhlaWdodCA9IHRoaXMuZmFsbEd1aWRlLnR3ZWVuZWRIZWlnaHQgPSB0aGlzLmJvYXJkLmNhbGN1bGF0ZUhpZ2hlc3RDb2x1bW4oKTtcclxuICAgICAgICB0aGlzLmZhbGxHdWlkZS5lbGFwc2VkID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5mYWxsVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5mYWxsR3VpZGUpXHJcbiAgICAgICAgICAgIC50byh7dHdlZW5lZEhlaWdodDogMH0sIEZBTExfVElNRV9NUylcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuTGluZWFyLk5vbmUpIC8vIFN1cnByaXNpbmdseSwgbGluZWFyIGlzIHRoZSBvbmUgdGhhdCBsb29rcyBtb3N0IFwicmlnaHRcIi5cclxuICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mYWxsVHdlZW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5yZXNldEFuZFBsYXkoKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGFydCh0aGlzLmZhbGxHdWlkZS5lbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERvaW5nIHRoaXMgaW4gdHdvIHBhcnRzIGJlY2F1c2Ugb25Db21wbGV0ZSgpIGNhbiBzZXQgdGhlIHR3ZWVuIHRvIG51bGwuXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZmFsbFR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5mYWxsR3VpZGUuZWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLmZhbGxUd2Vlbi51cGRhdGUodGhpcy5mYWxsR3VpZGUuZWxhcHNlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5mYWxsVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgbmV3SGVpZ2h0ID0gTWF0aC5jZWlsKHRoaXMuZmFsbEd1aWRlLnR3ZWVuZWRIZWlnaHQpO1xyXG4gICAgICAgICAgICBpZiAgKHRoaXMuZmFsbEd1aWRlLmxhc3RIZWlnaHQgPiBuZXdIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkaWZmID0gdGhpcy5mYWxsR3VpZGUubGFzdEhlaWdodCAtIG5ld0hlaWdodDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGRpZmY7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5yZW1vdmVCb3R0b21MaW5lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZhbGxHdWlkZS5sYXN0SGVpZ2h0ID0gbmV3SGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi9zaGFwZSc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcblxyXG5jbGFzcyBTaGFwZUkgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkN5YW47XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSA0O1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IHRydWU7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVJIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlSSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZUogZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkJsdWU7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IHRydWU7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdO1xyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlSiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZUooKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVMIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5PcmFuZ2U7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IHRydWU7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAxLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVMIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlTCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZU8gZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLlllbGxvdztcclxuICAgIHZhbHVlc1BlclJvdyA9IDQ7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gZmFsc2U7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVPIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlTygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZVMgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkdyZWVuO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSBmYWxzZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZVMge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVTKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlVCBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuUHVycGxlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSB0cnVlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlVCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVQoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVaIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5SZWQ7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IGZhbHNlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlWiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVooKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNoYXBlRmFjdG9yeSB7XHJcbiAgICBwcml2YXRlIGJhZzogU2hhcGVbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnJlZmlsbEJhZyh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0U2hhcGUoZm9yY2VCYWdSZWZpbGw6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5iYWcubGVuZ3RoIDw9IDAgfHwgZm9yY2VCYWdSZWZpbGwgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZpbGxCYWcoZm9yY2VCYWdSZWZpbGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5iYWcucG9wKCk7IC8vIEdldCBmcm9tIGVuZCBvZiBhcnJheS5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlZmlsbEJhZyhzdGFydGluZ1BpZWNlQXNGaXJzdDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuYmFnID0gW1xyXG4gICAgICAgICAgICBuZXcgU2hhcGVJKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZUooKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlTCgpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVUKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZU8oKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlUygpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVaKClcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEZpc2hlci1ZYXRlcyBTaHVmZmxlLCBiYXNlZCBvbjogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjQ1MDk3NlxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gdGhpcy5iYWcubGVuZ3RoXHJcbiAgICAgICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgICAgICAgICAgIHdoaWxlICgwICE9PSBpZHgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgICAgICAgICAgICAgbGV0IHJuZElkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGlkeCk7XHJcbiAgICAgICAgICAgICAgICBpZHggLT0gMTtcclxuICAgICAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICAgICAgICAgIGxldCB0ZW1wVmFsID0gdGhpcy5iYWdbaWR4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFnW2lkeF0gPSB0aGlzLmJhZ1tybmRJZHhdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWdbcm5kSWR4XSA9IHRlbXBWYWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE9ubHkgY2VydGFpbiBzaGFwZXMgY2FuIGJlIGRyb3BwZWQgb250byB3aGF0IGNvdWxkIGJlIGEgYmxhbmsgb3IgYWxtb3N0LWJsYW5rIGdyaWQuXHJcbiAgICAgICAgaWYgKHN0YXJ0aW5nUGllY2VBc0ZpcnN0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0SWR4ID0gdGhpcy5iYWcubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmFnW2xhc3RJZHhdLnN0YXJ0aW5nRWxpZ2libGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvIG5vdCBuZWVkIHRvIGRvIGFueXRoaW5nLlxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgbGFzdElkeDsgaWR4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5iYWdbaWR4XS5zdGFydGluZ0VsaWdpYmxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wVmFsID0gdGhpcy5iYWdbbGFzdElkeF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmFnW2xhc3RJZHhdID0gdGhpcy5iYWdbaWR4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWdbaWR4XSA9IHRlbXBWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZGVhZFNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTsgLy8gVXNlZCBieSBBSS4iLCJpbXBvcnQge0NlbGxPZmZzZXR9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuXHJcbmNvbnN0IFNQQVdOX0NPTCA9IDM7IC8vIExlZnQgc2lkZSBvZiBtYXRyaXggc2hvdWxkIGNvcnJlc3BvbmQgdG8gdGhpcy5cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTaGFwZSB7XHJcbiAgICBhYnN0cmFjdCByZWFkb25seSBjb2xvcjogQ29sb3I7XHJcbiAgICBhYnN0cmFjdCByZWFkb25seSB2YWx1ZXNQZXJSb3c6IG51bWJlcjtcclxuICAgIGFic3RyYWN0IHJlYWRvbmx5IHN0YXJ0aW5nRWxpZ2libGU6IGJvb2xlYW47XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IG1hdHJpY2VzOiBSZWFkb25seUFycmF5PFJlYWRvbmx5QXJyYXk8bnVtYmVyPj47XHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0SW5zdGFuY2UoKTogU2hhcGU7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50TWF0cml4SW5kZXg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcm93OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGNvbDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID0gMDsgLy8gVE9ETzogRW5zdXJlIHBvc2l0aW9uIDAgaXMgdGhlIHNwYXduIHBvc2l0aW9uXHJcbiAgICAgICAgdGhpcy5yb3cgPSAwO1xyXG4gICAgICAgIHRoaXMuY29sID0gU1BBV05fQ09MO1xyXG4gICAgICAgIHRoaXMuc3RhcnRpbmdFbGlnaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgIHRoaXMuY29sLS07XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVJpZ2h0KCkge1xyXG4gICAgICAgIHRoaXMuY29sKys7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVVwKCkge1xyXG4gICAgICAgIHRoaXMucm93LS07XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZURvd24oKSB7XHJcbiAgICAgICAgdGhpcy5yb3crKztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBtb3ZlVG9Ub3AoKSB7XHJcbiAgICAgICAgdGhpcy5yb3cgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUNvdW50ZXJDbG9ja3dpc2UoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggLT0gMTtcclxuICAgICAgICB0aGlzLmVuc3VyZUFycmF5Qm91bmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQ2xvY2t3aXNlKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ICs9IDE7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVBcnJheUJvdW5kcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvdygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3c7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Um93KHJvdzogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5yb3cgPSByb3c7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2woY29sOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3dDb3VudCgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMuZ2V0Q3VycmVudE1hdHJpeCgpLmxlbmd0aCAvIHRoaXMudmFsdWVzUGVyUm93KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRPZmZzZXRzKCk6IENlbGxPZmZzZXRbXSB7XHJcbiAgICAgICAgbGV0IG1hdHJpeCA9IHRoaXMuZ2V0Q3VycmVudE1hdHJpeCgpO1xyXG4gICAgICAgIGxldCBvZmZzZXRzOiBDZWxsT2Zmc2V0W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBtYXRyaXgubGVuZ3RoOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXRyaXhbaWR4XTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGlkeCAlIHRoaXMudmFsdWVzUGVyUm93O1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKGlkeCAvIHRoaXMudmFsdWVzUGVyUm93KTtcclxuICAgICAgICAgICAgICAgIGxldCBvZmZzZXQgPSBuZXcgQ2VsbE9mZnNldCh4LCB5KTtcclxuICAgICAgICAgICAgICAgIG9mZnNldHMucHVzaChvZmZzZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvZmZzZXRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFja3kgbWV0aG9kIHVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICogXCJTaW1wbGVcIiBhcyBpbiBkb2Vzbid0IG1hdHRlciB3aGF0IHRoZSBjdXJyZW50IHJvdy9jb2wvbWF0cml4IGlzLlxyXG4gICAgICovXHJcbiAgICBjbG9uZVNpbXBsZSgpOiBTaGFwZSB7XHJcbiAgICAgICAgLy8gR2V0IGFuIGluc3RhbmNlIG9mIHRoZSBjb25jcmV0ZSBjbGFzcy4gUmVzdCBvZiB2YWx1ZXMgYXJlIGlycmVsZXZhbnQuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEN1cnJlbnRNYXRyaXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0cmljZXNbdGhpcy5jdXJyZW50TWF0cml4SW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZW5zdXJlQXJyYXlCb3VuZHMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudE1hdHJpeEluZGV4IDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IHRoaXMubWF0cmljZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID49IHRoaXMubWF0cmljZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0dhbWVTdGF0ZVR5cGV9IGZyb20gJy4uL2dhbWUtc3RhdGUnO1xyXG5pbXBvcnQge25wY01hbmFnZXJ9IGZyb20gJy4vbnBjL25wYy1tYW5hZ2VyJztcclxuXHJcbmNsYXNzIEludHJvQWN0aXZpdHkge1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHRpbWVJbkludHJvOiBudW1iZXI7XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy50aW1lSW5JbnRybyA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpOiBHYW1lU3RhdGVUeXBlIHtcclxuICAgICAgICB0aGlzLnRpbWVJbkludHJvICs9IGVsYXBzZWQ7XHJcblxyXG4gICAgICAgIG5wY01hbmFnZXIuc3RlcChlbGFwc2VkKTsgLy8gVGhpcyBpcyBhdCB0aGUgcG9pbnQgb2YgYSBnYW1lIGphbSB3aGVyZSBJIGp1c3QgY3Jvc3MgbXkgZmluZ2VycyBhbmQgaG9wZSBzb21lIHRoaW5ncyBqdXN0IHdvcmsuXHJcblxyXG4gICAgICAgIC8vIFRPRE86IERvIG1vcmUgaW4gaW50cm8uXHJcbiAgICAgICAgaWYgKHRoaXMudGltZUluSW50cm8gPj0gMTAwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gR2FtZVN0YXRlVHlwZS5QbGF5aW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBHYW1lU3RhdGVUeXBlLkludHJvO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgaW50cm9BY3Rpdml0eSA9IG5ldyBJbnRyb0FjdGl2aXR5KCk7IiwiaW1wb3J0IHtHYW1lU3RhdGVUeXBlLCBnYW1lU3RhdGV9IGZyb20gJy4uL2dhbWUtc3RhdGUnO1xyXG5pbXBvcnQge2ludHJvQWN0aXZpdHl9IGZyb20gJy4vaW50cm8tYWN0aXZpdHknO1xyXG5pbXBvcnQge3BsYXlpbmdBY3Rpdml0eX0gZnJvbSAnLi9wbGF5aW5nLWFjdGl2aXR5JztcclxuXHJcbmNsYXNzIE1vZGVsIHtcclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBpbnRyb0FjdGl2aXR5LnN0YXJ0KCk7XHJcbiAgICAgICAgcGxheWluZ0FjdGl2aXR5LnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWxlZ2F0ZSBzdGVwKCkgdG8gYWN0aXZpdGllcy5cclxuICAgICAqIERldGVybWluZSBuZXh0IHN0YXRlIGZyb20gYWN0aXZpdGllcy5cclxuICAgICAqL1xyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgb2xkU3RhdGUgPSBnYW1lU3RhdGUuZ2V0Q3VycmVudCgpO1xyXG4gICAgICAgIGxldCBuZXdTdGF0ZTogR2FtZVN0YXRlVHlwZTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChvbGRTdGF0ZSkge1xyXG4gICAgICAgICAgICBjYXNlIEdhbWVTdGF0ZVR5cGUuSW50cm86XHJcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZSA9IGludHJvQWN0aXZpdHkuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEdhbWVTdGF0ZVR5cGUuUGxheWluZzpcclxuICAgICAgICAgICAgICAgIG5ld1N0YXRlID0gcGxheWluZ0FjdGl2aXR5LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaG91bGQgbm90IGdldCBoZXJlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmV3U3RhdGUgIT09IG9sZFN0YXRlKSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZS5zZXRDdXJyZW50KG5ld1N0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IG1vZGVsID0gbmV3IE1vZGVsKCk7IiwiaW1wb3J0IHtOcGN9IGZyb20gJy4vbnBjJztcclxuaW1wb3J0IHtOcGNMb2NhdGlvbiwgRm9jdXNQb2ludH0gZnJvbSAnLi9ucGMtbG9jYXRpb24nO1xyXG5pbXBvcnQge0dhbWVTdGF0ZVR5cGUsIGdhbWVTdGF0ZX0gZnJvbSAnLi4vLi4vZ2FtZS1zdGF0ZSc7XHJcblxyXG5jbGFzcyBDcm93ZFN0YXRzIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWxlcG9ydCB0aGUgTlBDIHNvbWV3aGVyZSwgZGVwZW5kaW5nIG9uIGdhbWVTdGF0ZS5cclxuICAgICAqL1xyXG4gICAgZ2l2ZUluaXRpYWxEaXJlY3Rpb24obnBjOiBOcGMpIHtcclxuICAgICAgICBzd2l0Y2ggKGdhbWVTdGF0ZS5nZXRDdXJyZW50KCkpIHtcclxuICAgICAgICAgICAgY2FzZSBHYW1lU3RhdGVUeXBlLlBsYXlpbmc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVOcGNPZmZTY3JlZW4obnBjKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEdhbWVTdGF0ZVR5cGUuSW50cm86XHJcbiAgICAgICAgICAgICAgICB0aGlzLmludHJvVGVsZXBvcnRPbnRvV2Fsa3dheShucGMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1vdmVOcGNPZmZTY3JlZW4obnBjOiBOcGMpIHtcclxuICAgICAgICBsZXQgb2Zmc2NyZWVuID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XHJcbiAgICAgICAgaWYgKG9mZnNjcmVlbiA9PSAwKSB7XHJcbiAgICAgICAgICAgIG5wYy50ZWxlcG9ydFRvKE5wY0xvY2F0aW9uLk9mZkxlZnQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5wYy50ZWxlcG9ydFRvKE5wY0xvY2F0aW9uLk9mZlJpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRyb1RlbGVwb3J0T250b1dhbGt3YXkobnBjOiBOcGMpIHtcclxuICAgICAgICBsZXQgd2Fsa3dheSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpOyAvLyAzID0gVG90YWwgbnVtYmVyIG9mIEJ1aWxkaW5nKiBsb2NhdGlvbnNcclxuICAgICAgICBzd2l0Y2ggKHdhbGt3YXkpIHtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBCdWlsZGluZ0xlZnRcclxuICAgICAgICAgICAgICAgIHRoaXMuaW50cm9UZWxlcG9ydE9udG9CdWlsZGluZ0xlZnQobnBjKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIEJ1aWxkaW5nUmlnaHRcclxuICAgICAgICAgICAgICAgIHRoaXMuaW50cm9UZWxlcG9ydE9udG9CdWlsZGluZ1JpZ2h0KG5wYyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBCdWlsZGluZ01pZGRsZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnRyb1RlbGVwb3J0T250b0J1aWxkaW5nTWlkZGxlKG5wYyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaG91bGQgbm90IGdldCBoZXJlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW50cm9UZWxlcG9ydE9udG9CdWlsZGluZ0xlZnQobnBjOiBOcGMpIHtcclxuICAgICAgICBucGMudGVsZXBvcnRUbyhOcGNMb2NhdGlvbi5CdWlsZGluZ0xlZnQpO1xyXG4gICAgICAgIGxldCBkaXJlY3Rpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAwKSB7IC8vIEdvIGxlZnRcclxuICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLk9mZkxlZnQpO1xyXG4gICAgICAgIH0gZWxzZSB7IC8vIEdvIHJpZ2h0XHJcbiAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5CdWlsZGluZ01pZGRsZSk7XHJcbiAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5PZmZSaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW50cm9UZWxlcG9ydE9udG9CdWlsZGluZ1JpZ2h0KG5wYzogTnBjKSB7XHJcbiAgICAgICAgbnBjLnRlbGVwb3J0VG8oTnBjTG9jYXRpb24uQnVpbGRpbmdSaWdodCk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IDApIHsgLy8gR28gbGVmdFxyXG4gICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uQnVpbGRpbmdNaWRkbGUpO1xyXG4gICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uT2ZmTGVmdCk7XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gR28gcmlnaHRcclxuICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLk9mZlJpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRyb1RlbGVwb3J0T250b0J1aWxkaW5nTWlkZGxlKG5wYzogTnBjKSB7XHJcbiAgICAgICAgbnBjLnRlbGVwb3J0VG8oTnBjTG9jYXRpb24uQnVpbGRpbmdSaWdodCk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IDApIHsgLy8gR28gbGVmdFxyXG4gICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uT2ZmTGVmdCk7XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gR28gcmlnaHRcclxuICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLk9mZlJpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWxsIGEgd2FpdGluZyBOUEMgd2hhdCB0byBkbywgZGVwZW5kaW5nIG9uIGdhbWVTdGF0ZS5cclxuICAgICAqL1xyXG4gICAgZ2l2ZURpcmVjdGlvbihucGM6IE5wYykge1xyXG4gICAgICAgIHN3aXRjaCAoZ2FtZVN0YXRlLmdldEN1cnJlbnQoKSkge1xyXG4gICAgICAgICAgICBjYXNlIEdhbWVTdGF0ZVR5cGUuSW50cm86XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdpdmVEaXJlY3Rpb25JbnRybyhucGMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5QbGF5aW5nOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5naXZlRGlyZWN0aW9uUGxheWluZyhucGMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhdmUgYW4gb2Zmc2NyZWVuIE5QQyB3YWxrIHRvIHRoZSBtaWRkbGUgYW5kIHRoZW0gYmFjayBvZmZzY3JlZW4uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2l2ZURpcmVjdGlvbkludHJvKG5wYzogTnBjKSB7XHJcbiAgICAgICAgbGV0IHNpZGUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcclxuICAgICAgICBpZiAoc2lkZSA9PT0gMCkge1xyXG4gICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uQnVpbGRpbmdNaWRkbGUpO1xyXG4gICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uT2ZmTGVmdCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLkJ1aWxkaW5nTWlkZGxlKTtcclxuICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLk9mZlJpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnaXZlRGlyZWN0aW9uUGxheWluZyhucGM6IE5wYykge1xyXG4gICAgICAgIGxldCBhY3Rpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XHJcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICB0aGlzLmdpdmVEaXJlY3Rpb25QbGF5aW5nU3RhbmQobnBjKTtcclxuICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgIGNhc2UgNzpcclxuICAgICAgICAgICAgY2FzZSA4OlxyXG4gICAgICAgICAgICBjYXNlIDk6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdpdmVEaXJlY3Rpb25QbGF5aW5nTW92ZShucGMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdpdmVEaXJlY3Rpb25QbGF5aW5nU3RhbmQobnBjOiBOcGMpIHtcclxuICAgICAgICBsZXQgc2lkZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xyXG4gICAgICAgIGlmIChzaWRlID09PSAwKSB7XHJcbiAgICAgICAgICAgIG5wYy5zdGFuZEZhY2luZyhGb2N1c1BvaW50LkJ1aWxkaW5nUmlnaHQsIDE1MDAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBucGMuc3RhbmRGYWNpbmcoRm9jdXNQb2ludC5CdWlsZGluZ0xlZnQsIDE1MDAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnaXZlRGlyZWN0aW9uUGxheWluZ01vdmUobnBjOiBOcGMpIHtcclxuICAgICAgICBsZXQgd2hlcmUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNik7XHJcbiAgICAgICAgc3dpdGNoICh3aGVyZSkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uT2ZmTGVmdCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLk9mZlJpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgY2FzZSA3OlxyXG4gICAgICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLkJ1aWxkaW5nTGVmdCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4OlxyXG4gICAgICAgICAgICBjYXNlIDk6XHJcbiAgICAgICAgICAgIGNhc2UgMTA6XHJcbiAgICAgICAgICAgIGNhc2UgMTE6XHJcbiAgICAgICAgICAgIGNhc2UgMTI6XHJcbiAgICAgICAgICAgIGNhc2UgMTM6XHJcbiAgICAgICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uQnVpbGRpbmdSaWdodCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxNDpcclxuICAgICAgICAgICAgY2FzZSAxNTpcclxuICAgICAgICAgICAgY2FzZSAxNjpcclxuICAgICAgICAgICAgY2FzZSAxNzpcclxuICAgICAgICAgICAgY2FzZSAxODpcclxuICAgICAgICAgICAgY2FzZSAxOTpcclxuICAgICAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5CdWlsZGluZ01pZGRsZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyMDpcclxuICAgICAgICAgICAgY2FzZSAyMTpcclxuICAgICAgICAgICAgY2FzZSAyMjpcclxuICAgICAgICAgICAgY2FzZSAyMzpcclxuICAgICAgICAgICAgY2FzZSAyNDpcclxuICAgICAgICAgICAgY2FzZSAyNTpcclxuICAgICAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5NaWRkbGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgY3Jvd2RTdGF0cyA9IG5ldyBDcm93ZFN0YXRzKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuaW1wb3J0IHtOcGN9IGZyb20gJy4vbnBjJ1xyXG5pbXBvcnQge05wY0xvY2F0aW9uLCBGb2N1c1BvaW50fSBmcm9tICcuL25wYy1sb2NhdGlvbic7XHJcbmltcG9ydCB7ZXZlbnRCdXMsIEV2ZW50VHlwZX0gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9zdGFuZGVlLW1vdmVtZW50LWVuZGVkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNQbGFjZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLXBsYWNlZC1ldmVudCc7XHJcbmltcG9ydCB7VE9UQUxfTlBDUywgcmVsZWFzZVRpbWVyfSBmcm9tICcuL3JlbGVhc2UtdGltZXInO1xyXG5pbXBvcnQge2Nyb3dkU3RhdHN9IGZyb20gJy4vY3Jvd2Qtc3RhdHMnO1xyXG5cclxuY2xhc3MgTnBjTWFuYWdlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBucGNzOiBNYXA8bnVtYmVyLCBOcGM+O1xyXG5cclxuICAgIHByaXZhdGUgbnBjc09mZnNjcmVlbjogTnBjW107XHJcbiAgICBwcml2YXRlIG5wY3NJblBsYXk6IE5wY1tdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubnBjcyA9IG5ldyBNYXA8bnVtYmVyLCBOcGM+KCk7XHJcblxyXG4gICAgICAgIHRoaXMubnBjc09mZnNjcmVlbiA9IFtdO1xyXG4gICAgICAgIHRoaXMubnBjc0luUGxheSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5TdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZSwgKGV2ZW50OiBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFJlZ2lzdGVyIGxpc3RlbmVycyBmb3IgZ2FtZSBldmVudHMsIGxpa2UgYm9hcmQgY29sbGFwc2Ugb3IgaWYgYSBzaGFwZSBjYXVzZWQgaG9sZXMuXHJcblxyXG4gICAgICAgIGZvciAobGV0IG5wY0lkeCA9IDA7IG5wY0lkeCA8IFRPVEFMX05QQ1M7IG5wY0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBucGMgPSBuZXcgTnBjKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNyb3dkU3RhdHMuZ2l2ZURpcmVjdGlvbihucGMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG5wYy5zdGFydCgpO1xyXG4gICAgICAgICAgICB0aGlzLm5wY3Muc2V0KG5wYy5pZCwgbnBjKTtcclxuICAgICAgICAgICAgdGhpcy5ucGNzT2Zmc2NyZWVuLnB1c2gobnBjKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbGVhc2VUaW1lci5zdGFydCgpO1xyXG4gICAgICAgIGNyb3dkU3RhdHMuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBleHBlY3RlZEluUGxheSA9IHJlbGVhc2VUaW1lci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlSW5QbGF5TnBjQ291bnQoZXhwZWN0ZWRJblBsYXkpO1xyXG5cclxuICAgICAgICB0aGlzLm5wY3NJblBsYXkuZm9yRWFjaCgobnBjOiBOcGMpID0+IHtcclxuICAgICAgICAgICAgbnBjLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbnN1cmVJblBsYXlOcGNDb3VudChleHBlY3RlZEluUGxheTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubnBjc0luUGxheS5sZW5ndGggPCBleHBlY3RlZEluUGxheSkge1xyXG4gICAgICAgICAgICBsZXQgZGlmZiA9IGV4cGVjdGVkSW5QbGF5IC0gdGhpcy5ucGNzSW5QbGF5Lmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yIChsZXQgY291bnQgPSAwOyBjb3VudCA8IGRpZmY7IGNvdW50KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZEFuT2Zmc2NyZWVuTnBjSW50b1BsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbmRBbk9mZnNjcmVlbk5wY0ludG9QbGF5KCkge1xyXG4gICAgICAgIGxldCBucGMgPSB0aGlzLm5wY3NPZmZzY3JlZW4ucG9wKCk7XHJcbiAgICAgICAgaWYgKG5wYyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMubnBjc0luUGxheS5wdXNoKG5wYyk7XHJcbiAgICAgICAgICAgIGNyb3dkU3RhdHMuZ2l2ZUluaXRpYWxEaXJlY3Rpb24obnBjKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KGV2ZW50OiBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IG5wYyA9IHRoaXMubnBjcy5nZXQoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIGlmIChucGMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgeCA9IGV2ZW50Lng7XHJcbiAgICAgICAgICAgIGxldCB5ID0gZXZlbnQuejtcclxuICAgICAgICAgICAgbnBjLnVwZGF0ZVBvc2l0aW9uKHgsIHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgbnBjTWFuYWdlciA9IG5ldyBOcGNNYW5hZ2VyKCk7IiwiaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge05wY1BsYWNlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtcGxhY2VkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNNb3ZlbWVudENoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLW1vdmVtZW50LWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY0ZhY2luZ0V2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtZmFjaW5nLWV2ZW50JztcclxuaW1wb3J0IHtOcGNUZWxlcG9ydGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy10ZWxlcG9ydGVkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNTdGF0ZX0gZnJvbSAnLi4vLi4vZG9tYWluL25wYy1tb3ZlbWVudC10eXBlJztcclxuaW1wb3J0IHtOcGNMb2NhdGlvbiwgRm9jdXNQb2ludH0gZnJvbSAnLi9ucGMtbG9jYXRpb24nO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wYyB7XHJcbiAgICByZWFkb25seSBpZDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGU6IE5wY1N0YXRlO1xyXG4gICAgcHJpdmF0ZSBzdGFuZGluZ1R0bDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgd2F5cG9pbnRzOiBOcGNMb2NhdGlvbltdO1xyXG5cclxuICAgIC8vIFwiTGFzdFwiIGFzIGluIHRoZSBsYXN0IGtub3duIGNvb3JkaW5hdGUsIGJlY2F1c2UgaXQgY291bGQgYmUgY3VycmVudGx5IGluLW1vdGlvbi5cclxuICAgIHByaXZhdGUgeGxhc3Q6IG51bWJlcjtcclxuICAgIHByaXZhdGUgeWxhc3Q6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHJlYWR5Rm9yQ29tbWFuZENhbGxiYWNrOiAoKSA9PiB2b2lkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJlYWR5Rm9yQ29tbWFuZENhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IE5wY1N0YXRlLldhaXRpbmdGb3JDb21tYW5kO1xyXG4gICAgICAgIHRoaXMuc3RhbmRpbmdUdGwgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLndheXBvaW50cyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnhsYXN0ID0gMDtcclxuICAgICAgICB0aGlzLnlsYXN0ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5yZWFkeUZvckNvbW1hbmRDYWxsYmFjayA9IHJlYWR5Rm9yQ29tbWFuZENhbGxiYWNrO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vIFBsYWNlIGl0IG91dCBvZiB2aWV3IHNvbWV3aGVyZS5cclxuICAgICAgICB0aGlzLnhsYXN0ID0gLTU7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9ICAxNTtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBOcGNQbGFjZWRFdmVudCh0aGlzLmlkLCB0aGlzLnhsYXN0LCB0aGlzLnlsYXN0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcclxuICAgICAgICAgICAgY2FzZSBOcGNTdGF0ZS5XYWxraW5nOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGVwV2Fsa2luZygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTnBjU3RhdGUuU3RhbmRpbmc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0ZXBTdGFuZGluZyhlbGFwc2VkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE5wY1N0YXRlLldhaXRpbmdGb3JDb21tYW5kOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGVwV2FpdGluZ0ZvckNvbW1hbmQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwV2Fsa2luZygpIHtcclxuICAgICAgICAvLyBNYXliZSBub3RoaW5nIGhlcmUuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwU3RhbmRpbmcoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zdGFuZGluZ1R0bCAtPSBlbGFwc2VkO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zdGFuZGluZ1R0bCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBOcGNTdGF0ZS5XYWl0aW5nRm9yQ29tbWFuZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwV2FpdGluZ0ZvckNvbW1hbmQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2F5cG9pbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IG5leHRMb2NhdGlvbiA9IHRoaXMud2F5cG9pbnRzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuYmVnaW5XYWxraW5nVG8obmV4dExvY2F0aW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlYWR5Rm9yQ29tbWFuZENhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YW5kRmFjaW5nKGZvY3VzUG9pbnQ6IEZvY3VzUG9pbnQsIHN0YW5kaW5nVHRsOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gTnBjU3RhdGUuU3RhbmRpbmc7XHJcbiAgICAgICAgdGhpcy5zdGFuZGluZ1R0bCA9IHN0YW5kaW5nVHRsO1xyXG5cclxuICAgICAgICBpZiAoZm9jdXNQb2ludCA9PT0gRm9jdXNQb2ludC5CdWlsZGluZ0xlZnQpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgTnBjRmFjaW5nRXZlbnQodGhpcy5pZCwgNSwgLTMpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGZvY3VzUG9pbnQgPT09IEZvY3VzUG9pbnQuQnVpbGRpbmdSaWdodCkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBOcGNGYWNpbmdFdmVudCh0aGlzLmlkLCAxNS41LCA1KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZFdheXBvaW50KGxvY2F0aW9uOiBOcGNMb2NhdGlvbikge1xyXG4gICAgICAgIHRoaXMud2F5cG9pbnRzLnB1c2gobG9jYXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2lnbmlmaWVzIHRoZSBlbmQgb2YgYSB3YWxrLiBEb2VzIG5vdCBzZW5kIGFuIGV2ZW50LlxyXG4gICAgICovXHJcbiAgICB1cGRhdGVQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueGxhc3QgPSB4O1xyXG4gICAgICAgIHRoaXMueWxhc3QgPSB5O1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0gTnBjU3RhdGUuV2FpdGluZ0ZvckNvbW1hbmQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWxlcG9ydHMgdGhlIE5QQyB0byB0aGUgZ2l2ZW4gbG9jYXRpb24uXHJcbiAgICAgKiBTZW5kcyBhbiBldmVudCBzbyB0aGUgc3RhbmRlZSBjYW4gYmUgdXBkYXRlZC5cclxuICAgICAqL1xyXG4gICAgdGVsZXBvcnRUbyhsb2NhdGlvbjogTnBjTG9jYXRpb24pIHtcclxuICAgICAgICBsZXQgeDogbnVtYmVyLCB5OiBudW1iZXI7XHJcbiAgICAgICAgW3gsIHldID0gdGhpcy5nZW5lcmF0ZVJhbmRvbUNvb3JkaW5hdGVzKGxvY2F0aW9uKTtcclxuXHJcbiAgICAgICAgdGhpcy54bGFzdCA9IHg7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9IHk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IE5wY1RlbGVwb3J0ZWRFdmVudCh0aGlzLmlkLCB4LCB5KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBiZWdpbldhbGtpbmdUbyhsb2NhdGlvbjogTnBjTG9jYXRpb24pIHtcclxuICAgICAgICBsZXQgeDogbnVtYmVyLCB5OiBudW1iZXI7XHJcbiAgICAgICAgW3gsIHldID0gdGhpcy5nZW5lcmF0ZVJhbmRvbUNvb3JkaW5hdGVzKGxvY2F0aW9uKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gTnBjU3RhdGUuV2Fsa2luZztcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCh0aGlzLmlkLCB4LCB5KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVJhbmRvbUNvb3JkaW5hdGVzKGxvY2F0aW9uOiBOcGNMb2NhdGlvbik6IFtudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIGxldCB4ID0gMDtcclxuICAgICAgICBsZXQgeSA9IDA7XHJcblxyXG4gICAgICAgIHN3aXRjaCAobG9jYXRpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBOcGNMb2NhdGlvbi5PZmZMZWZ0OlxyXG4gICAgICAgICAgICAgICAgW3gsIHldID0gdGhpcy5yYW5kb21XaXRoaW5SYW5nZSgtNSwgNSwgMik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBOcGNMb2NhdGlvbi5PZmZSaWdodDpcclxuICAgICAgICAgICAgICAgIFt4LCB5XSA9IHRoaXMucmFuZG9tV2l0aGluUmFuZ2UoMTAsIDE1LCAyKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE5wY0xvY2F0aW9uLkJ1aWxkaW5nTGVmdDpcclxuICAgICAgICAgICAgICAgIFt4LCB5XSA9IHRoaXMucmFuZG9tV2l0aGluUmFuZ2UoNSwgNC41LCAyKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE5wY0xvY2F0aW9uLkJ1aWxkaW5nUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICBbeCwgeV0gPSB0aGlzLnJhbmRvbVdpdGhpblJhbmdlKDksIDcuNSwgMik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBOcGNMb2NhdGlvbi5CdWlsZGluZ01pZGRsZTpcclxuICAgICAgICAgICAgICAgIFt4LCB5XSA9IHRoaXMucmFuZG9tV2l0aGluUmFuZ2UoMTAsIDIuNSwgMik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBOcGNMb2NhdGlvbi5NaWRkbGU6XHJcbiAgICAgICAgICAgICAgICBbeCwgeV0gPSB0aGlzLnJhbmRvbVdpdGhpblJhbmdlKDYsIDEwLCAzKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBbeCwgeV07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByYW5kb21XaXRoaW5SYW5nZSh4OiBudW1iZXIsIHk6IG51bWJlciwgdmFyaWFuY2U6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIGxldCB4cmVzdWx0ID0geCAtICh2YXJpYW5jZSAvIDIpICsgKE1hdGgucmFuZG9tKCkgKiB2YXJpYW5jZSk7XHJcbiAgICAgICAgbGV0IHlyZXN1bHQgPSB5IC0gKHZhcmlhbmNlIC8gMikgKyAoTWF0aC5yYW5kb20oKSAqIHZhcmlhbmNlKTtcclxuICAgICAgICByZXR1cm4gW3hyZXN1bHQsIHlyZXN1bHRdO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtHYW1lU3RhdGVUeXBlLCBnYW1lU3RhdGV9IGZyb20gJy4uLy4uL2dhbWUtc3RhdGUnO1xyXG5pbXBvcnQge1RJTUVfVU5USUxfRVZFUllPTkVfT05fU0NSRUVOfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuXHJcbi8vIFN0YXJ0aW5nIHBvc2l0aW9uIGNvdW50cyB1c2VkIGluIGluaXRpYWxpemF0aW9uLlxyXG5leHBvcnQgY29uc3QgVE9UQUxfTlBDUyA9IDQwO1xyXG5cclxuY29uc3QgTlBDU19QRVJfU0VDT05EID0gVElNRV9VTlRJTF9FVkVSWU9ORV9PTl9TQ1JFRU4gLyBUT1RBTF9OUENTO1xyXG5jb25zdCBJTlRST19TVEFSVElOR19DT1VOVCA9IDU7XHJcblxyXG5jbGFzcyBSZWxlYXNlVGltZXIge1xyXG5cclxuICAgIHByaXZhdGUgaW50cm9UaW1lRWxhcHNlZDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBwbGF5VGltZUVsYXBzZWQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmludHJvVGltZUVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMucGxheVRpbWVFbGFwc2VkID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmludHJvVGltZUVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMucGxheVRpbWVFbGFwc2VkID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGV4cGVjdGVkSW5QbGF5ID0gMDtcclxuXHJcbiAgICAgICAgc3dpdGNoIChnYW1lU3RhdGUuZ2V0Q3VycmVudCgpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5JbnRybzpcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkSW5QbGF5ID0gdGhpcy5zdGVwSW50cm8oZWxhcHNlZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBHYW1lU3RhdGVUeXBlLlBsYXlpbmc6XHJcbiAgICAgICAgICAgICAgICBleHBlY3RlZEluUGxheSA9IHRoaXMuc3RlcFBsYXlpbmcoZWxhcHNlZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaG91bGQgbm90IGdldCBoZXJlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZXhwZWN0ZWRJblBsYXk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcEludHJvKGVsYXBzZWQ6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgdGhpcy5pbnRyb1RpbWVFbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgcmV0dXJuIElOVFJPX1NUQVJUSU5HX0NPVU5UO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXBQbGF5aW5nKGVsYXBzZWQ6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgdGhpcy5wbGF5VGltZUVsYXBzZWQgKz0gZWxhcHNlZDtcclxuXHJcbiAgICAgICAgbGV0IGV4cGVjdGVkSW5QbGF5ID0gTWF0aC5mbG9vcih0aGlzLnBsYXlUaW1lRWxhcHNlZCAvIE5QQ1NfUEVSX1NFQ09ORCk7XHJcbiAgICAgICAgaWYgKGV4cGVjdGVkSW5QbGF5ID4gVE9UQUxfTlBDUykge1xyXG4gICAgICAgICAgICBleHBlY3RlZEluUGxheSA9IFRPVEFMX05QQ1M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZXhwZWN0ZWRJblBsYXk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHJlbGVhc2VUaW1lciA9IG5ldyBSZWxlYXNlVGltZXIoKTsiLCJpbXBvcnQge0dhbWVTdGF0ZVR5cGV9IGZyb20gJy4uL2dhbWUtc3RhdGUnO1xyXG5pbXBvcnQge0JvYXJkfSBmcm9tICcuL2JvYXJkL2JvYXJkJztcclxuaW1wb3J0IHtBaX0gZnJvbSAnLi9haS9haSc7XHJcbmltcG9ydCB7bnBjTWFuYWdlcn0gZnJvbSAnLi9ucGMvbnBjLW1hbmFnZXInO1xyXG5pbXBvcnQge2V2ZW50QnVzLCBFdmVudFR5cGV9IGZyb20gJy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NGaWxsZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcm93cy1maWxsZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9yb3dzLWNsZWFyLWFuaW1hdGlvbi1jb21wbGV0ZWQtZXZlbnQnO1xyXG5pbXBvcnQge0JvYXJkRmlsbGVkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2JvYXJkLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7SHBDaGFuZ2VkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1NoYXBlRmFjdG9yeX0gZnJvbSAnLi9ib2FyZC9zaGFwZS1mYWN0b3J5JztcclxuaW1wb3J0IHtGYWxsaW5nU2VxdWVuY2VyfSBmcm9tICcuL2JvYXJkL2ZhbGxpbmctc2VxdWVuY2VyJztcclxuaW1wb3J0IHtGYWxsaW5nU2VxdWVuY2VyRXZlbnR9IGZyb20gJy4uL2V2ZW50L2ZhbGxpbmctc2VxdWVuY2VyLWV2ZW50JztcclxuaW1wb3J0IHt2aXRhbHN9IGZyb20gJy4vdml0YWxzJztcclxuXHJcbmNsYXNzIFBsYXlpbmdBY3Rpdml0eSB7XHJcbiAgICBwcml2YXRlIGh1bWFuQm9hcmQ6IEJvYXJkO1xyXG4gICAgcHJpdmF0ZSBodW1hbkZhbGxpbmdTZXF1ZW5jZXI6IEZhbGxpbmdTZXF1ZW5jZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBhaUJvYXJkOiBCb2FyZDtcclxuICAgIHByaXZhdGUgYWlGYWxsaW5nU2VxdWVuY2VyOiBGYWxsaW5nU2VxdWVuY2VyO1xyXG5cclxuICAgIHByaXZhdGUgYWk6IEFpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGxldCBodW1hblNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTtcclxuICAgICAgICB0aGlzLmh1bWFuQm9hcmQgPSBuZXcgQm9hcmQoUGxheWVyVHlwZS5IdW1hbiwgaHVtYW5TaGFwZUZhY3RvcnksIGV2ZW50QnVzKTtcclxuICAgICAgICB0aGlzLmh1bWFuRmFsbGluZ1NlcXVlbmNlciA9IG5ldyBGYWxsaW5nU2VxdWVuY2VyKHRoaXMuaHVtYW5Cb2FyZCk7XHJcblxyXG4gICAgICAgIGxldCBhaVNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTtcclxuICAgICAgICB0aGlzLmFpQm9hcmQgPSBuZXcgQm9hcmQoUGxheWVyVHlwZS5BaSwgYWlTaGFwZUZhY3RvcnksIGV2ZW50QnVzKTtcclxuICAgICAgICB0aGlzLmFpRmFsbGluZ1NlcXVlbmNlciA9IG5ldyBGYWxsaW5nU2VxdWVuY2VyKHRoaXMuYWlCb2FyZCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWkgPSBuZXcgQWkodGhpcy5haUJvYXJkKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuUGxheWVyTW92ZW1lbnRFdmVudFR5cGUsIChldmVudDogUGxheWVyTW92ZW1lbnRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVBsYXllck1vdmVtZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlJvd3NGaWxsZWRFdmVudFR5cGUsIChldmVudDogUm93c0ZpbGxlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUm93c0ZpbGxlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50VHlwZSwgKGV2ZW50OiBSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVJvd0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQm9hcmRGaWxsZWRFdmVudFR5cGUsIChldmVudDogQm9hcmRGaWxsZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUJvYXJkRmlsbGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWkuc3RhcnQoKTtcclxuICAgICAgICBucGNNYW5hZ2VyLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IEluc3RlYWQgb2YgaGVyZSwgc3RhcnQgZ2FtZSB3aGVuIHBsYXllciBoaXRzIGEga2V5IGZpcnN0LlxyXG4gICAgICAgIHRoaXMuaHVtYW5Cb2FyZC5yZXNldEFuZFBsYXkoKTtcclxuICAgICAgICB0aGlzLmFpQm9hcmQucmVzZXRBbmRQbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmh1bWFuQm9hcmQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmh1bWFuRmFsbGluZ1NlcXVlbmNlci5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmFpQm9hcmQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmFpRmFsbGluZ1NlcXVlbmNlci5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmFpLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIG5wY01hbmFnZXIuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEdhbWVTdGF0ZVR5cGUuUGxheWluZztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVBsYXllck1vdmVtZW50KGV2ZW50OiBQbGF5ZXJNb3ZlbWVudEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGJvYXJkID0gdGhpcy5kZXRlcm1pbmVCb2FyZEZvcihldmVudC5wbGF5ZXJUeXBlKTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChldmVudC5tb3ZlbWVudCkge1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LkxlZnQ6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5SaWdodDpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Eb3duOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlRG93bigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuRHJvcDpcclxuICAgICAgICAgICAgICAgIGlmIChib2FyZC5tb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCkpIHsgICAgICAgLy8gQ2hlY2sgdGhhdCB3ZSBhcmUgaW4gYSBwb3NpdGlvbiB0byBtb3ZlIHRoZSBzaGFwZSBkb3duIGJlZm9yZSBleGVjdXRpbmcgdGhlIG5leHQgbGluZS4gXHJcbiAgICAgICAgICAgICAgICAgICAgYm9hcmQuaGFuZGxlRW5kT2ZDdXJyZW50UGllY2VUYXNrcygpOyAgIC8vIFByZXZlbnRzIGFueSBvdGhlciBrZXlzdHJva2VzIGFmZmVjdGluZyB0aGUgc2hhcGUgYWZ0ZXIgaXQgaGl0cyB0aGUgYm90dG9tLlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuUm90YXRlQ2xvY2t3aXNlOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQucm90YXRlU2hhcGVDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VuaGFuZGxlZCBtb3ZlbWVudCcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNmZXIgdGhlIGZpbGxlZCByb3dzIHRvIGJlIGp1bmsgcm93cyBvbiB0aGUgb3Bwb3NpdGUgcGxheWVyJ3MgYm9hcmQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaGFuZGxlUm93c0ZpbGxlZEV2ZW50KGV2ZW50OiBSb3dzRmlsbGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgYm9hcmQgPSB0aGlzLmRldGVybWluZUJvYXJkRm9yT3Bwb3NpdGVPZihldmVudC5wbGF5ZXJUeXBlKTtcclxuICAgICAgICBib2FyZC5hZGRKdW5rUm93cyhldmVudC5maWxsZWRSb3dJZHhzLmxlbmd0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVSb3dDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KGV2ZW50OiBSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBib2FyZCA9IHRoaXMuZGV0ZXJtaW5lQm9hcmRGb3IoZXZlbnQucGxheWVyVHlwZSk7XHJcbiAgICAgICAgYm9hcmQuaGFuZGxlQW55RmlsbGVkTGluZXNQYXJ0MigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaHVtYW4ncyBib2FyZCBpZiBnaXZlbiB0aGUgaHVtYW4ncyB0eXBlLCBvciBBSSdzIGJvYXJkIGlmIGdpdmVuIHRoZSBBSS4gXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lQm9hcmRGb3IocGxheWVyVHlwZTogUGxheWVyVHlwZSk6IEJvYXJkIHtcclxuICAgICAgICBpZiAocGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5odW1hbkJvYXJkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFpQm9hcmQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgdGhpcyBtZXRob2QgaXMgZ2l2ZW4gXCJIdW1hblwiLCBpdCB3aWxsIHJldHVybiB0aGUgQUkncyBib2FyZCwgYW5kIHZpY2UgdmVyc2EuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lQm9hcmRGb3JPcHBvc2l0ZU9mKHBsYXllclR5cGU6IFBsYXllclR5cGUpOiBCb2FyZCB7XHJcbiAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWlCb2FyZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5odW1hbkJvYXJkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUJvYXJkRmlsbGVkRXZlbnQoZXZlbnQ6IEJvYXJkRmlsbGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgYm9hcmQ6IEJvYXJkO1xyXG4gICAgICAgIGxldCBmYWxsaW5nU2VxdWVuY2VyOiBGYWxsaW5nU2VxdWVuY2VyO1xyXG4gICAgICAgIGxldCBocDogbnVtYmVyO1xyXG5cclxuICAgICAgICBpZiAoZXZlbnQucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICBib2FyZCA9IHRoaXMuaHVtYW5Cb2FyZDtcclxuICAgICAgICAgICAgZmFsbGluZ1NlcXVlbmNlciA9IHRoaXMuaHVtYW5GYWxsaW5nU2VxdWVuY2VyO1xyXG4gICAgICAgICAgICBocCA9ICh2aXRhbHMuaHVtYW5IaXRQb2ludHMgLT0gMik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYm9hcmQgPSB0aGlzLmFpQm9hcmQ7XHJcbiAgICAgICAgICAgIGZhbGxpbmdTZXF1ZW5jZXIgPSB0aGlzLmFpRmFsbGluZ1NlcXVlbmNlcjtcclxuICAgICAgICAgICAgaHAgPSAodml0YWxzLmFpSGl0UG9pbnRzIC09IDIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgSHBDaGFuZ2VkRXZlbnQoaHAsIGV2ZW50LnBsYXllclR5cGUsIHRydWUpKTtcclxuICAgICAgICAvLyBUT0RPOiBTZWUgaWYgb25lIG9mIHRoZSBwbGF5ZXJzIGhhcyBydW4gb3V0IG9mIEhQLCBzb21ld2hlcmUgaWYgbm90IGhlcmUuXHJcblxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEZhbGxpbmdTZXF1ZW5jZXJFdmVudChldmVudC5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgZmFsbGluZ1NlcXVlbmNlci5yZXNldEFuZFBsYXkoKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBJIGRvbid0IGtub3csIG1heWJlIG5vdGhpbmcuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQuc3RhcnRpbmcgPT09IHRydWUgJiYgZXZlbnQucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5BaSkge1xyXG4gICAgICAgICAgICB0aGlzLmFpLnN0cmF0ZWdpemUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBOb3RoaW5nIGN1cnJlbnRseSBmb3IgdGhlIGh1bWFuJ3MgYm9hcmQgdG8gYmUgZG9pbmcgYXQgdGhpcyB0aW1lLlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgcGxheWluZ0FjdGl2aXR5ID0gbmV3IFBsYXlpbmdBY3Rpdml0eSgpOyIsImltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi9kb21haW4vY29uc3RhbnRzJztcclxuXHJcbmV4cG9ydCBjb25zdCBNQVhfSFAgPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7IC8vIEhQIGNvcnJlc3BvbmRzIHRvIHRoZSBudW1iZXIgb2YgbG9uZyB3aW5kb3dzIG9uIHRoZSBzZWNvbmQgZmxvb3Igb2YgdGhlIHBoeXNpY2FsIGJ1aWxkaW5nLlxyXG5cclxuY2xhc3MgVml0YWxzIHtcclxuICAgIGh1bWFuSGl0UG9pbnRzOiBudW1iZXI7XHJcbiAgICBhaUhpdFBvaW50czogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuaHVtYW5IaXRQb2ludHMgPSBNQVhfSFA7XHJcbiAgICAgICAgdGhpcy5haUhpdFBvaW50cyA9IE1BWF9IUDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgdml0YWxzID0gbmV3IFZpdGFscygpOyIsImltcG9ydCB7c3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlfSBmcm9tICcuL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLWFuaW1hdGlvbi10ZXh0dXJlLWJhc2UnO1xyXG5pbXBvcnQge2J1aWxkaW5nUHJlbG9hZGVyfSBmcm9tICcuL3ZpZXcvbGlnaHRpbmcvYnVpbGRpbmctcHJlbG9hZGVyJztcclxuaW1wb3J0IHtzb3VuZExvYWRlcn0gZnJvbSAnLi9zb3VuZC9zb3VuZC1sb2FkZXInO1xyXG5cclxuY2xhc3MgUHJlbG9hZGVyIHtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsb2FkaW5nRGl2OiBIVE1MRGl2RWxlbWVudDtcclxuICAgIHByaXZhdGUgbG9hZGluZ01lc3NhZ2U6IEhUTUxEaXZFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBsb2FkaW5nRXJyb3I6IEhUTUxEaXZFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBsb2FkaW5nQmFyOiBIVE1MUHJvZ3Jlc3NFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubG9hZGluZ0RpdiA9IDxIVE1MRGl2RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRpbmcnKTtcclxuICAgICAgICB0aGlzLmxvYWRpbmdNZXNzYWdlID0gPEhUTUxEaXZFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1tZXNzYWdlJyk7XHJcbiAgICAgICAgdGhpcy5sb2FkaW5nRXJyb3IgPSA8SFRNTERpdkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nLWVycm9yJyk7XHJcbiAgICAgICAgdGhpcy5sb2FkaW5nQmFyID0gPEhUTUxQcm9ncmVzc0VsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nLWJhcicpO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoc2lnbmFsUHJlbG9hZGluZ0NvbXBsZXRlOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgICBsZXQgdG90YWwgPSAwO1xyXG5cclxuICAgICAgICBsZXQgY2FsbFdoZW5GaW5pc2hlZCA9IChzdWNjZXNzOiBib29sZWFuKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nTWVzc2FnZS50ZXh0Q29udGVudCA9ICdMb2FkZWQgJyArIGNvdW50ICsgJyBvZiAnICsgdG90YWwgKyAnIGZpeHR1cmVzLi4uJztcclxuICAgICAgICAgICAgICAgIGlmIChjb3VudCA+PSB0b3RhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbFByZWxvYWRpbmdDb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJyZWRMb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdCYXIuc2V0QXR0cmlidXRlKCd2YWx1ZScsIFN0cmluZyhjb3VudCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nRXJyb3IudGV4dENvbnRlbnQgPSAnRXJyb3IgbG9hZGluZyBmaXh0dXJlcy4gUGxlYXNlIHJlbG9hZCBpZiB5b3Ugd291bGQgbGlrZSB0byByZXRyeS4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdG90YWwgKz0gc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlLnByZWxvYWQoKHN1Y2Nlc3M6IGJvb2xlYW4pID0+IHtcclxuICAgICAgICAgICAgY2FsbFdoZW5GaW5pc2hlZChzdWNjZXNzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdG90YWwgKz0gYnVpbGRpbmdQcmVsb2FkZXIucHJlbG9hZCgoc3VjY2VzczogYm9vbGVhbikgPT4ge1xyXG4gICAgICAgICAgICBjYWxsV2hlbkZpbmlzaGVkKHN1Y2Nlc3MpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0b3RhbCArPSBzb3VuZExvYWRlci5wcmVsb2FkKChzdWNjZXNzOiBib29sZWFuKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxXaGVuRmluaXNoZWQoc3VjY2Vzcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubG9hZGluZ0Jhci5zZXRBdHRyaWJ1dGUoJ21heCcsIFN0cmluZyh0b3RhbCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmFkZU91dCgpIHtcclxuICAgICAgICB0aGlzLmxvYWRpbmdEaXYuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICB0aGlzLmxvYWRpbmdEaXYuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDFzJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgfSwgMTI1MCk7IC8vIEp1c3QgYSBsaXR0bGUgYml0IGxvbmdlciB0aGFuIHRyYW5zaXRpb24gdGltZS5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvYWQgbW9yZSBmaXh0dXJlcyB0aGF0IHdpbGwgbm90IGJlIG5lZWRlZCBpbW1lZGlhdGVseS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkZWZlcnJlZExvYWQoKSB7XHJcbiAgICAgICAgc291bmRMb2FkZXIuZGVmZXJyZWRMb2FkKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHByZWxvYWRlciA9IG5ldyBQcmVsb2FkZXIoKTsiLCJkZWNsYXJlIGNvbnN0IEhvd2w6IGFueTtcclxuXHJcbmltcG9ydCB7c291bmRNYW5hZ2VyfSBmcm9tICcuL3NvdW5kLW1hbmFnZXInO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIEFNQklFTkNFX05JR0hULFxyXG4gICAgTVVTSUNfT1BFTklORyxcclxuICAgIE1VU0lDX01BSU4sXHJcbiAgICBNVVNJQ19NQUlOX1ZPWCxcclxuICAgIFNUVURFTlRTX1RBTEtJTkdcclxufSBmcm9tICcuLi9kb21haW4vY29uc3RhbnRzJztcclxuXHJcbi8vIDEpIEFtYmllbmNlIC0gTmlnaHRcclxuLy8gMikgTXVzaWMgLSBPcGVuaW5nXHJcbmNvbnN0IEZJTEVTX1RPX1BSRUxPQUQgPSAyO1xyXG5cclxuY2xhc3MgU291bmRMb2FkZXIge1xyXG5cclxuICAgIHByZWxvYWQoc2lnbmFsT25lRmlsZUxvYWRlZDogKHN1Y2Nlc3M6IGJvb2xlYW4pID0+IHZvaWQpOiBudW1iZXIge1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGFtYmllbmNlTmlnaHRIb3dsID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICAgICAgc3JjOiBbJ2FtYmllbmNlLW5pZ2h0Lm00YSddLFxyXG4gICAgICAgICAgICAgICAgdm9sdW1lOiAwLjMzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhbWJpZW5jZU5pZ2h0SG93bC5vbmNlKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc291bmRNYW5hZ2VyLmNhY2hlSG93bChBTUJJRU5DRV9OSUdIVCwgYW1iaWVuY2VOaWdodEhvd2wpO1xyXG4gICAgICAgICAgICAgICAgc2lnbmFsT25lRmlsZUxvYWRlZCh0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGFtYmllbmNlTmlnaHRIb3dsLm9uY2UoJ2xvYWRlcnJvcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNpZ25hbE9uZUZpbGVMb2FkZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG11c2ljT3BlbmluZ0hvd2wgPSBuZXcgSG93bCh7XHJcbiAgICAgICAgICAgICAgICBzcmM6IFsnbXVzaWMtb3BlbmluZy5tNGEnXSxcclxuICAgICAgICAgICAgICAgIHZvbHVtZTogMC41XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtdXNpY09wZW5pbmdIb3dsLm9uY2UoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzb3VuZE1hbmFnZXIuY2FjaGVIb3dsKE1VU0lDX09QRU5JTkcsIG11c2ljT3BlbmluZ0hvd2wpO1xyXG4gICAgICAgICAgICAgICAgc2lnbmFsT25lRmlsZUxvYWRlZCh0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG11c2ljT3BlbmluZ0hvd2wub25jZSgnbG9hZGVycm9yJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2lnbmFsT25lRmlsZUxvYWRlZChmYWxzZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIEZJTEVTX1RPX1BSRUxPQUQ7XHJcbiAgICB9XHJcblxyXG4gICAgZGVmZXJyZWRMb2FkKCkge1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG11c2ljTWFpbkhvd2wgPSBuZXcgSG93bCh7XHJcbiAgICAgICAgICAgICAgICBzcmM6IFsnbXVzaWMtbWFpbi5tNGEnXSxcclxuICAgICAgICAgICAgICAgIHZvbHVtZTogMC43XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtdXNpY01haW5Ib3dsLm9uY2UoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzb3VuZE1hbmFnZXIuY2FjaGVIb3dsKE1VU0lDX01BSU4sIG11c2ljTWFpbkhvd2wpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG11c2ljTWFpblZveEhvd2wgPSBuZXcgSG93bCh7XHJcbiAgICAgICAgICAgICAgICBzcmM6IFsnbXVzaWMtbWFpbi12b3gubTRhJ10sXHJcbiAgICAgICAgICAgICAgICB2b2x1bWU6IDAuN1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbXVzaWNNYWluVm94SG93bC5vbmNlKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc291bmRNYW5hZ2VyLmNhY2hlSG93bChNVVNJQ19NQUlOX1ZPWCwgbXVzaWNNYWluVm94SG93bCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgc3R1ZGVudHNUYWxraW5nSG93bCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgICAgIHNyYzogWydzdHVkZW50cy10YWxraW5nLm00YSddLFxyXG4gICAgICAgICAgICAgICAgdm9sdW1lOiAwLjBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHN0dWRlbnRzVGFsa2luZ0hvd2wub25jZSgnbG9hZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNvdW5kTWFuYWdlci5jYWNoZUhvd2woU1RVREVOVFNfVEFMS0lORywgc3R1ZGVudHNUYWxraW5nSG93bCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc291bmRMb2FkZXIgPSBuZXcgU291bmRMb2FkZXIoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5kZWNsYXJlIGNvbnN0IEhvd2xlcjogYW55O1xyXG5cclxuaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge0dhbWVTdGF0ZVR5cGUsIGdhbWVTdGF0ZX0gZnJvbSAnLi4vZ2FtZS1zdGF0ZSc7XHJcbmltcG9ydCB7R2FtZVN0YXRlQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9nYW1lLXN0YXRlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1xyXG4gICAgVElNRV9VTlRJTF9FVkVSWU9ORV9PTl9TQ1JFRU4sXHJcbiAgICBBTUJJRU5DRV9OSUdIVCxcclxuICAgIE1VU0lDX09QRU5JTkcsXHJcbiAgICBNVVNJQ19NQUlOLFxyXG4gICAgTVVTSUNfTUFJTl9WT1gsXHJcbiAgICBTVFVERU5UU19UQUxLSU5HXHJcbn0gZnJvbSAnLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcblxyXG5jb25zdCBTT1VORF9LRVkgPSAnMTI5MDgzMTkwLWZhbGxpbmctc291bmQnO1xyXG5cclxuY2xhc3MgU291bmRNYW5hZ2VyIHtcclxuXHJcbiAgICBwcml2YXRlIHNvdW5kVG9nZ2xlU2VjdGlvbjogSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIHNvdW5kVG9nZ2xlRWxlbWVudDogSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICBwcml2YXRlIGhvd2xzOiBNYXA8c3RyaW5nLCBhbnk+OyAvLyBhbnkgPSBIb3dsXHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5zb3VuZFRvZ2dsZVNlY3Rpb24gPSA8SFRNTERpdkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb3VuZC10b2dnbGUtc2VjdGlvbicpO1xyXG5cclxuICAgICAgICB0aGlzLnNvdW5kVG9nZ2xlRWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc291bmQtdG9nZ2xlJyk7XHJcbiAgICAgICAgdGhpcy5zb3VuZFRvZ2dsZUVsZW1lbnQub25jbGljayA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTb3VuZFNldHRpbmcoIXRoaXMuc291bmRUb2dnbGVFbGVtZW50LmNoZWNrZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaG93bHMgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdWxkIG9jY3VyIGJlZm9yZSBwcmVsb2FkaW5nIHNvIHRoZSBwbGF5ZXIgc2VlcyB0aGUgcmlnaHQgb3B0aW9uIGltbWVkaWF0ZWx5LlxyXG4gICAgICovXHJcbiAgICBhdHRhY2goKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTb3VuZFNldHRpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuR2FtZVN0YXRlQ2hhbmdlZFR5cGUsIChldmVudDogR2FtZVN0YXRlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQuZ2FtZVN0YXRlVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBHYW1lU3RhdGVUeXBlLkludHJvOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VlSW50cm9Tb3VuZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5QbGF5aW5nOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VlUGxheWluZ1NvdW5kcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIGNhY2hlSG93bChrZXk6IHN0cmluZywgdmFsdWU6IGFueSkgeyAvLyBhbnkgPSBIb3dsXHJcbiAgICAgICAgdGhpcy5ob3dscy5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJ0IDIgaXMgZG9uZSBvZmYgdGhlIG1haW4gZXhlY3V0aW9uIHBhdGgsIGluIGNhc2UgdGhlIHVzZXIgaGFzIGNsaWVudC1zaWRlIHN0b3JhZ2UgdHVybmVkIG9mZi5cclxuICAgICAqLyAgICBcclxuICAgIHByaXZhdGUgdXBkYXRlU291bmRTZXR0aW5nKG11dGU/OiBib29sZWFuKSB7XHJcbiAgICAgICAgLy8gUGFydCAxOiBVcGRhdGUgSG93bGVyXHJcbiAgICAgICAgaWYgKG11dGUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBEZWZhdWx0IHRvIHNvdW5kIG9uLCBpbiBjYXNlIHRoZSBzZWNvbmQgcGFydCBmYWlscy5cclxuICAgICAgICAgICAgdGhpcy5zb3VuZFRvZ2dsZUVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHNvdW5kVmFsdWU6IHN0cmluZztcclxuICAgICAgICAgICAgaWYgKG11dGUpIHtcclxuICAgICAgICAgICAgICAgIHNvdW5kVmFsdWUgPSAnb2ZmJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNvdW5kVmFsdWUgPSAnb24nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEhvd2xlci5tdXRlKG11dGUpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUGFydCAyOiBVcGRhdGUgc2Vzc2lvbiBzdG9yYWdlXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRUb2dnbGVFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgaWYgKG11dGUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNvdW5kVmFsdWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFNPVU5EX0tFWSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc291bmRWYWx1ZSA9PT0gJ29mZicpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNvdW5kVG9nZ2xlRWxlbWVudC5jaGVja2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgSG93bGVyLm11dGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc291bmRWYWx1ZTogc3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgaWYgKG11dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3VuZFZhbHVlID0gJ29mZic7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvdW5kVmFsdWUgPSAnb24nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShTT1VORF9LRVksIHNvdW5kVmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjdWVJbnRyb1NvdW5kcygpIHtcclxuICAgICAgICBsZXQgYW1iaWVuY2VOaWdodEhvd2wgPSB0aGlzLmhvd2xzLmdldChBTUJJRU5DRV9OSUdIVCk7XHJcbiAgICAgICAgYW1iaWVuY2VOaWdodEhvd2wubG9vcCh0cnVlKTtcclxuICAgICAgICBhbWJpZW5jZU5pZ2h0SG93bC5wbGF5KCk7XHJcblxyXG4gICAgICAgIGxldCBtdXNpY09wZW5pbmdIb3dsID0gdGhpcy5ob3dscy5nZXQoTVVTSUNfT1BFTklORyk7XHJcbiAgICAgICAgbXVzaWNPcGVuaW5nSG93bC5sb29wKHRydWUpO1xyXG4gICAgICAgIG11c2ljT3BlbmluZ0hvd2wucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT25jZSBsb2FkZWQsIGhhdmUgdGhlIG1haW4gbXVzaWMgcGxheSBhZnRlciB0aGUgaW50cm8gbXVzaWMgY29tcGxldGVzIGl0cyBjdXJyZW50IGxvb3AuXHJcbiAgICAgKiBBbHNvIGhhdmUgdGhlIHN0dWRlbnRzIHRhbGtpbmcgc3RhcnQgdG8gcGxheS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjdWVQbGF5aW5nU291bmRzKCkge1xyXG4gICAgICAgIGxldCBtdXNpY01haW5Ib3dsID0gdGhpcy5ob3dscy5nZXQoTVVTSUNfTUFJTik7XHJcbiAgICAgICAgbGV0IG11c2ljTWFpbkhvd2xWb3ggPSB0aGlzLmhvd2xzLmdldChNVVNJQ19NQUlOX1ZPWCk7XHJcbiAgICAgICAgaWYgKG11c2ljTWFpbkhvd2wgIT0gbnVsbCAmJiBtdXNpY01haW5Ib3dsVm94ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IG11c2ljT3BlbmluZ0hvd2wgPSB0aGlzLmhvd2xzLmdldChNVVNJQ19PUEVOSU5HKTtcclxuICAgICAgICAgICAgbXVzaWNPcGVuaW5nSG93bC5sb29wKGZhbHNlKTtcclxuICAgICAgICAgICAgbXVzaWNPcGVuaW5nSG93bC5vbmNlKCdlbmQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBtdXNpY09wZW5pbmdIb3dsLnVubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFpbk11c2ljTWFpbigpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFsc28gc3RhcnQgdGhlIHN0dWRlbnRzIHRhbGtpbmcuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1ZVN0dWRlbnRzVGFsa2luZ1NvdW5kcygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBOb3QgbG9hZGVkIHlldCwgdHJ5IGFnYWluIGluIGEgc2Vjb25kLlxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuY3VlUGxheWluZ1NvdW5kcygpLCAxMDAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCB0aGlzIGF0IGEgemVybyB2b2x1bWUgYW5kIGdyYWR1YWxseSBpbmNyZWFzZSB0byBhYm91dCBoYWxmIHZvbHVtZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjdWVTdHVkZW50c1RhbGtpbmdTb3VuZHMoKSB7XHJcbiAgICAgICAgbGV0IHN0dWRlbnRzVGFsa2luZ0hvd2wgPSB0aGlzLmhvd2xzLmdldChTVFVERU5UU19UQUxLSU5HKTtcclxuICAgICAgICBpZiAoc3R1ZGVudHNUYWxraW5nSG93bCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN0dWRlbnRzVGFsa2luZ0hvd2wubG9vcCh0cnVlKTtcclxuICAgICAgICAgICAgc3R1ZGVudHNUYWxraW5nSG93bC5mYWRlKDAuMCwgMC40LCBUSU1FX1VOVElMX0VWRVJZT05FX09OX1NDUkVFTik7XHJcbiAgICAgICAgICAgIHN0dWRlbnRzVGFsa2luZ0hvd2wucGxheSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIE5vdCBsb2FkZWQgeWV0LCB0cnkgYWdhaW4gaW4gYSBzZWNvbmQuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5jdWVTdHVkZW50c1RhbGtpbmdTb3VuZHMoKSwgMTAwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hhaW5NdXNpY01haW4oKSB7XHJcbiAgICAgICAgbGV0IG11c2ljTWFpbkhvd2wgPSB0aGlzLmhvd2xzLmdldChNVVNJQ19NQUlOKTtcclxuICAgICAgICBtdXNpY01haW5Ib3dsLnBsYXkoKTtcclxuICAgICAgICBtdXNpY01haW5Ib3dsLm9uY2UoJ2VuZCcsICgpID0+IHRoaXMuY2hhaW5NdXNpY01haW5Wb3goKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGFpbk11c2ljTWFpblZveCgpIHtcclxuICAgICAgICBsZXQgbXVzaWNNYWluSG93bFZveCA9IHRoaXMuaG93bHMuZ2V0KE1VU0lDX01BSU5fVk9YKTtcclxuICAgICAgICBtdXNpY01haW5Ib3dsVm94LnBsYXkoKTtcclxuICAgICAgICBtdXNpY01haW5Ib3dsVm94Lm9uY2UoJ2VuZCcsICgpID0+IHRoaXMuY2hhaW5NdXNpY01haW4oKSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHNvdW5kTWFuYWdlciA9IG5ldyBTb3VuZE1hbmFnZXIoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jb25zdCBBU1BFQ1RfUkFUSU8gPSAxNi85O1xyXG5cclxuY2xhc3MgQ2FtZXJhV3JhcHBlciB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGNhbWVyYTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDYwLCBBU1BFQ1RfUkFUSU8sIDAuMSwgMTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUmVuZGVyZXJTaXplKHJlbmRlcmVyOiBhbnkpIHtcclxuICAgICAgICBsZXQgd2luZG93QXNwZWN0UmF0aW8gPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICBsZXQgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICAgICAgaWYgKHdpbmRvd0FzcGVjdFJhdGlvID4gQVNQRUNUX1JBVElPKSB7XHJcbiAgICAgICAgICAgIC8vIFRvbyB3aWRlOyBzY2FsZSBvZmYgb2Ygd2luZG93IGhlaWdodC5cclxuICAgICAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lckhlaWdodCAqIEFTUEVDVF9SQVRJTyk7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvd0FzcGVjdFJhdGlvIDw9IEFTUEVDVF9SQVRJTykge1xyXG4gICAgICAgICAgICAvLyBUb28gbmFycm93IG9yIGp1c3QgcmlnaHQ7IHNjYWxlIG9mZiBvZiB3aW5kb3cgd2lkdGguXHJcbiAgICAgICAgICAgIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVyV2lkdGggLyBBU1BFQ1RfUkFUSU8pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAvLyBTaG91bGQgYmUgbm8gbmVlZCB0byB1cGRhdGUgYXNwZWN0IHJhdGlvIGJlY2F1c2UgaXQgc2hvdWxkIGJlIGNvbnN0YW50LlxyXG4gICAgICAgIC8vIHRoaXMuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgY2FtZXJhV3JhcHBlciA9IG5ldyBDYW1lcmFXcmFwcGVyKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuLy8gbXRsIGFuZCBvYmogPSAyIGZpbGVzLlxyXG5jb25zdCBGSUxFU19UT19QUkVMT0FEID0gMjtcclxuXHJcbmNsYXNzIEJ1aWxkaW5nUHJlbG9hZGVyIHtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBpbnN0YW5jZXM6IGFueVtdO1xyXG4gICAgcHJpdmF0ZSBpbnN0YW5jZXNSZXF1ZXN0ZWQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmluc3RhbmNlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VzUmVxdWVzdGVkID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcmVsb2FkKHNpZ25hbE9uZUZpbGVMb2FkZWQ6IChzdWNjZXNzOiBib29sZWFuKSA9PiB2b2lkKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgbXRsTG9hZGVyID0gbmV3IFRIUkVFLk1UTExvYWRlcigpO1xyXG4gICAgICAgIG10bExvYWRlci5zZXRQYXRoKCcnKTtcclxuICAgICAgICBtdGxMb2FkZXIubG9hZCgnZ3JlZW4tYnVpbGRpbmcubXRsJywgKG1hdGVyaWFsczogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIG1hdGVyaWFscy5wcmVsb2FkKCk7XHJcbiAgICAgICAgICAgIHNpZ25hbE9uZUZpbGVMb2FkZWQodHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgb2JqTG9hZGVyID0gbmV3IFRIUkVFLk9CSkxvYWRlcigpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIuc2V0TWF0ZXJpYWxzKG1hdGVyaWFscyk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5zZXRQYXRoKCcnKTtcclxuICAgICAgICAgICAgb2JqTG9hZGVyLmxvYWQoJ2dyZWVuLWJ1aWxkaW5nLm9iaicsIChvYmo6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZXMucHVzaChvYmopO1xyXG4gICAgICAgICAgICAgICAgc2lnbmFsT25lRmlsZUxvYWRlZCh0cnVlKTtcclxuICAgICAgICAgICAgfSwgdW5kZWZpbmVkLCAoKSA9PiB7IHNpZ25hbE9uZUZpbGVMb2FkZWQoZmFsc2UpOyB9KTtcclxuICAgICAgICB9LCB1bmRlZmluZWQsICgpID0+IHsgc2lnbmFsT25lRmlsZUxvYWRlZChmYWxzZSk7IH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gRklMRVNfVE9fUFJFTE9BRDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0SW5zdGFuY2UoKTogYW55IHtcclxuICAgICAgICBsZXQgaW5zdGFuY2U6IGFueTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2VzUmVxdWVzdGVkID09PSAwKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlID0gdGhpcy5pbnN0YW5jZXNbMF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UgPSB0aGlzLmluc3RhbmNlc1swXS5jbG9uZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlcy5wdXNoKGluc3RhbmNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbnN0YW5jZXNSZXF1ZXN0ZWQrKztcclxuXHJcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBidWlsZGluZ1ByZWxvYWRlciA9IG5ldyBCdWlsZGluZ1ByZWxvYWRlcigpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7YnVpbGRpbmdQcmVsb2FkZXJ9IGZyb20gJy4vYnVpbGRpbmctcHJlbG9hZGVyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBCdWlsZGluZyB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgbGV0IG9iaiA9IGJ1aWxkaW5nUHJlbG9hZGVyLmdldEluc3RhbmNlKCk7XHJcbiAgICAgICAgb2JqLnNjYWxlLnNldFNjYWxhcigwLjI1KTtcclxuICAgICAgICBvYmoucG9zaXRpb24uc2V0KDUsIC0wLjAxLCAwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZChvYmopO1xyXG5cclxuICAgICAgICAvLyBRdWljayBoYWNrIHRvIHByZXZlbnQgYnVpbGRpbmcgZnJvbSBiZWluZyBzZWUtdGhyb3VnaC5cclxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSg5LCAzKTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IDB4MzQzMzMwfSk7XHJcbiAgICAgICAgbGV0IHdhbGwgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIHdhbGwucG9zaXRpb24uc2V0KDUsIDEsIC0zLjUpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh3YWxsKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcbmRlY2xhcmUgY29uc3QgVFdFRU46IGFueTtcclxuXHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuXHJcbmNvbnN0IE1BWF9DVVJUQUlOX0NPVU5UID0gNDtcclxuY29uc3QgQ1VSVEFJTl9XSURUSCA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjtcclxuY29uc3QgQ1VSVEFJTl9NT1ZFX1RJTUUgPSA3NTA7XHJcblxyXG5jbGFzcyBDdXJ0YWluVmVydGV4UG9zaXRpb24ge1xyXG4gICAgeCA9IDA7XHJcbiAgICBlbGFwc2VkID0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEkgbWlnaHQgaGF2ZSBzb21lIG9mIHRoZXNlIGJhY2t3YXJkcy4uLlxyXG4gKi9cclxuZXhwb3J0IGVudW0gQ3VydGFpbkRpcmVjdGlvbiB7XHJcbiAgICBPcGVuTGVmdFRvUmlnaHQsXHJcbiAgICBPcGVuUmlnaHRUb0xlZnQsXHJcbiAgICBDbG9zZUxlZnRUb1JpZ2h0LFxyXG4gICAgQ2xvc2VSaWdodFRvTGVmdFxyXG59XHJcblxyXG4vKipcclxuICogU29tZSBub3RlcyBvbiB2ZXJ0aWNlcyB3aXRoaW4gZWFjaCBjdXJ0YWluIG1lc2ggd2l0aG91dCBtb2RpZmljYXRpb25zOlxyXG4gKiBWZXJ0aWNlcyAxIGFuZCAzIHNob3VsZCByZXN0IGF0IHggPSAtQ1VSVEFJTl9XSURUSCAvIDIgKGhvdXNlIGxlZnQpXHJcbiAqIFZlcnRpY2VzIDAgYW5kIDIgc2hvdWxkIHJlc3QgYXQgeCA9ICBDVVJUQUlOX1dJRFRIIC8gMiAoaG91c2UgcmlnaHQpXHJcbiAqIFxyXG4gKiBFeGFtcGxlIHN0YXRlbWVudHM6XHJcbiAqIGNvbnNvbGUubG9nKCd2ZXJ0aWNlcyAxIGFuZCAzIHg6ICcgKyBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzFdLngsIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbM10ueCk7XHJcbiAqIGNvbnNvbGUubG9nKCd2ZXJ0aWNlcyAwIGFuZCAyIHg6ICcgKyBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzBdLngsIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMl0ueCk7XHJcbiAqIGNvbnNvbGUubG9nKCctLS0nKTtcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDdXJ0YWluIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG4gICAgcmVhZG9ubHkgY3VydGFpbnM6IGFueVtdO1xyXG5cclxuICAgIHByaXZhdGUgY3VydGFpblZlcnRleFBvc2l0aW9uOiBDdXJ0YWluVmVydGV4UG9zaXRpb247XHJcbiAgICBwcml2YXRlIGN1cnRhaW5Ud2VlbjogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLmN1cnRhaW5zID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IE1BWF9DVVJUQUlOX0NPVU5UOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShDVVJUQUlOX1dJRFRILCAxKTtcclxuICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtjb2xvcjogMHgwNzA3MTZ9KTsgLy8gTWlkbmlnaHQgQmx1ZVxyXG4gICAgICAgICAgICBsZXQgY3VydGFpbiA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydGFpbnMucHVzaChjdXJ0YWluKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uID0gbmV3IEN1cnRhaW5WZXJ0ZXhQb3NpdGlvbigpO1xyXG4gICAgICAgIHRoaXMuY3VydGFpblR3ZWVuID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBjdXJ0YWluIG9mIHRoaXMuY3VydGFpbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5hZGQoY3VydGFpbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gZ3JvdXAgdG8gZml0IGFnYWluc3QgYnVpbGRpbmcuXHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoNS4wLCA0Ljc1LCAtMS40NTEpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuc2NhbGUuc2V0KDAuNywgMS4wLCAxKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJ0YWluVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi5lbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydGFpblR3ZWVuLnVwZGF0ZSh0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi5lbGFwc2VkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRBbmltYXRpb24oZmxvb3JJZHhzOiBudW1iZXJbXSwgZGlyZWN0aW9uOiBDdXJ0YWluRGlyZWN0aW9uLCBjYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcclxuICAgICAgICAvLyBQcmV2ZW50IG11bHRpcGxlIGFuaW1hdGlvbnMgYXQgdGhlIHNhbWUgdGltZS5cclxuICAgICAgICBpZiAodGhpcy5jdXJ0YWluVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRyb3BDdXJ0YWluKGZsb29ySWR4cyk7XHJcblxyXG4gICAgICAgIGxldCB4ZW5kOiBudW1iZXI7XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5DbG9zZUxlZnRUb1JpZ2h0IHx8IGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5PcGVuTGVmdFRvUmlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24ueCA9IENVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICB4ZW5kID0gLUNVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlUmlnaHRUb0xlZnQgfHwgZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5SaWdodFRvTGVmdCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54ID0gLUNVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICB4ZW5kID0gIENVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi5lbGFwc2VkID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJ0YWluVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24pXHJcbiAgICAgICAgICAgIC50byh7eDogeGVuZH0sIENVUlRBSU5fTU9WRV9USU1FKVxyXG4gICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5RdWFydGljLkluT3V0KVxyXG4gICAgICAgICAgICAub25VcGRhdGUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gU2VlIG5vdGUgYXQgdG9wIGFib3V0IHdoeSBpZHgxIGFuZCBpZHgyIGFyZSB3aGF0IHRoZXkgYXJlLlxyXG4gICAgICAgICAgICAgICAgbGV0IGlkeDE6IG51bWJlciwgaWR4MjogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5DbG9zZVJpZ2h0VG9MZWZ0IHx8IGRpcmVjdGlvbiA9PT0gQ3VydGFpbkRpcmVjdGlvbi5PcGVuTGVmdFRvUmlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZHgxID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBpZHgyID0gMjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlTGVmdFRvUmlnaHQgfHwgZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5SaWdodFRvTGVmdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDEgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDIgPSAzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY3VydGFpbiBvZiB0aGlzLmN1cnRhaW5zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1tpZHgxXS54ID0gdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24ueDtcclxuICAgICAgICAgICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzW2lkeDJdLnggPSB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54O1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4geyB0aGlzLmNvbXBsZXRlQW5pbWF0aW9uKGNhbGxiYWNrKTsgfSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLmVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFrZSB0aGUgcmVxdWVzdGVkIG51bWJlciBvZiBjdXJ0YWlucyB2aXNpYmxlLlxyXG4gICAgICogUG9zaXRpb24gdGhlbSBvbiB0aGUgcmVxdWVzdGVkIGZsb29ycy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkcm9wQ3VydGFpbihmbG9vcklkeHM6IG51bWJlcltdKSB7XHJcbiAgICAgICAgZm9yIChsZXQgY3VydGFpbiBvZiB0aGlzLmN1cnRhaW5zKSB7XHJcbiAgICAgICAgICAgIGN1cnRhaW4udmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgZmxvb3JJZHhzLmxlbmd0aDsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IGZsb29ySWR4ID0gZmxvb3JJZHhzW2lkeF07XHJcbiAgICAgICAgICAgIGxldCBjdXJ0YWluID0gdGhpcy5jdXJ0YWluc1tpZHhdO1xyXG5cclxuICAgICAgICAgICAgY3VydGFpbi5wb3NpdGlvbi5zZXQoMCwgZmxvb3JJZHgsIDApO1xyXG5cclxuICAgICAgICAgICAgLy8gU2VlIG5vdGUgYXQgdG9wIGFib3V0IHdoeSB0aGVzZSBhcmUgd2hlcmUgdGhleSBhcmUuXHJcbiAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMF0ueCA9IC1DVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1sxXS54ID0gIENVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzJdLnggPSAtQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbM10ueCA9ICBDVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY3VydGFpbi52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb21wbGV0ZUFuaW1hdGlvbihjYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmN1cnRhaW5Ud2VlbiA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb25zdGFudHMnO1xyXG5pbXBvcnQge0hwT3JpZW50YXRpb259IGZyb20gJy4uLy4uL2RvbWFpbi9ocC1vcmllbnRhdGlvbic7XHJcblxyXG5leHBvcnQgY2xhc3MgSHBQYW5lbHMge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBwYW5lbHM6IGFueVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhwT3JpZW50YXRpb246IEhwT3JpZW50YXRpb24pIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5wYW5lbHMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgUEFORUxfQ09VTlRfUEVSX0ZMT09SOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgwLjYsIDAuNik7XHJcbiAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCgpO1xyXG4gICAgICAgICAgICBsZXQgcGFuZWwgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHg6IG51bWJlcjtcclxuICAgICAgICAgICAgaWYgKGhwT3JpZW50YXRpb24gPT09IEhwT3JpZW50YXRpb24uRGVjcmVhc2VzUmlnaHRUb0xlZnQpIHtcclxuICAgICAgICAgICAgICAgIHggPSBpZHg7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB4ID0gUEFORUxfQ09VTlRfUEVSX0ZMT09SIC0gaWR4IC0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgeSA9IDA7XHJcbiAgICAgICAgICAgIGxldCB6ID0gMDtcclxuICAgICAgICAgICAgcGFuZWwucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG4gICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiBNYWtlIHRoaXMgcHVsc2UgYXQgYWxsP1xyXG4gICAgICAgICAgICBwYW5lbC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoMHhlZWVlMDApO1xyXG4gICAgICAgICAgICBwYW5lbC5tYXRlcmlhbC5lbWlzc2l2ZUludGVuc2l0eSA9IDAuNTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLnB1c2gocGFuZWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLmFkZChwYW5lbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gdG8gZml0IGFnYWluc3QgYnVpbGRpbmcuXHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoMS44NSwgMy41NSwgLTEuNSk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5zY2FsZS5zZXQoMC43LCAxLjksIDEpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUhwKFBBTkVMX0NPVU5UX1BFUl9GTE9PUiwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhQIGJhciBjYW4gZ28gZnJvbSByaWdodC10by1sZWZ0IG9yIGxlZnQtdG8tcmlnaHQsIGxpa2UgYSBmaWdodGluZyBnYW1lIEhQIGJhci5cclxuICAgICAqIFwiYmxpbmtMb3N0XCIgbWVhbnMgdG8gYW5pbWF0ZSB0aGUgbG9zcyBvZiB0aGUgSFAgcGFuZWxzIGRpcmVjdGx5IGFib3ZlLlxyXG4gICAgICovXHJcbiAgICB1cGRhdGVIcChocDogbnVtYmVyLCBibGlua0xvc3Q6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAoaHAgPiBQQU5FTF9DT1VOVF9QRVJfRkxPT1IpIHtcclxuICAgICAgICAgICAgaHAgPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCB0aGlzLnBhbmVscy5sZW5ndGg7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYW5lbCA9IHRoaXMucGFuZWxzW2lkeF07XHJcblxyXG4gICAgICAgICAgICBpZiAoaWR4IDwgaHApIHtcclxuICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBCbGluayB0aGUgbG9zdCBwYW5lbHMsIGlmIGFueSwgdG8gZ2l2ZSB0aGUgcGxheWVyIHRoZSBpbXByZXNzaW9uIHRoYXQgdGhleSBsb3N0IHNvbWV0aGluZy5cclxuICAgICAgICBpZiAoYmxpbmtMb3N0ID09PSB0cnVlICYmIGhwID49IDAgJiYgaHAgPCB0aGlzLnBhbmVscy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgIGxldCBpZHggPSBocDsgLy8gQXMgaW4gdGhlIG5leHQgaW5kZXggdXAgZnJvbSB0aGUgY3VycmVudCBIUCBpbmRleCwgc2luY2UgYXJyYXkgc3RhcnQgYXQgMC5cclxuICAgICAgICAgICAgbGV0IHBhbmVsMSA9IHRoaXMucGFuZWxzW2lkeF07XHJcbiAgICAgICAgICAgIGxldCBwYW5lbDIgPSB0aGlzLnBhbmVsc1tpZHggKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBibGlua0hhbmRsZSA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICBpZiAoY291bnQgPiAxNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhbmVsMS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwyLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGJsaW5rSGFuZGxlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwxLnZpc2libGUgPSAhcGFuZWwxLnZpc2libGU7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwyLnZpc2libGUgPSAhcGFuZWwyLnZpc2libGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDIwMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPOiBIYW5kbGUgdXBkYXRlIHRvIEhQID0gZnVsbCBhcyBkaWZmZXJlbnQgZnJvbSBIUCA8IGZ1bGwuXHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcbmRlY2xhcmUgY29uc3QgVFdFRU46IGFueTtcclxuXHJcbmltcG9ydCB7QnVpbGRpbmd9IGZyb20gJy4vYnVpbGRpbmcnO1xyXG5pbXBvcnQge0N1cnRhaW59IGZyb20gJy4vY3VydGFpbic7XHJcbmltcG9ydCB7SHBQYW5lbHN9IGZyb20gJy4vaHAtcGFuZWxzJztcclxuaW1wb3J0IHtIcE9yaWVudGF0aW9ufSBmcm9tICcuLi8uLi9kb21haW4vaHAtb3JpZW50YXRpb24nO1xyXG5pbXBvcnQge1Jvd0NsZWFyRGlyZWN0aW9ufSBmcm9tICcuLi8uLi9kb21haW4vcm93LWNsZWFyLWRpcmVjdGlvbic7XHJcbmltcG9ydCB7Q3VydGFpbkRpcmVjdGlvbn0gZnJvbSAnLi9jdXJ0YWluJztcclxuaW1wb3J0IHtQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb25zdGFudHMnO1xyXG5cclxuLy8gVE9ETzogT25seSB0aGUgM3JkIGZsb29yIGZyb20gdGhlIHRvcCBhbmQgYmVsb3cgYXJlIHZpc2libGUuIEFsc28sIHNlZSBib2FyZC50cy5cclxuZXhwb3J0IGNvbnN0IEZMT09SX0NPVU5UID0gMTc7XHJcblxyXG5jb25zdCBBQ1RJVkVfU0hBUEVfTElHSFRfQ09VTlQgPSA0O1xyXG5jb25zdCBQQU5FTF9TSVpFID0gMC43O1xyXG5cclxuY2xhc3MgRW1pc3NpdmVJbnRlbnNpdHkge1xyXG4gICAgdmFsdWU6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpZ2h0aW5nR3JpZCB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBwYW5lbEdyb3VwOiBhbnk7XHJcbiAgICBwcml2YXRlIGJ1aWxkaW5nOiBCdWlsZGluZztcclxuXHJcbiAgICBwcml2YXRlIHJvd0NsZWFyRGlyZWN0aW9uOiBSb3dDbGVhckRpcmVjdGlvblxyXG4gICAgcHJpdmF0ZSByb3dDbGVhckN1cnRhaW46IEN1cnRhaW47XHJcbiAgICBwcml2YXRlIGp1bmtSb3dDdXJ0YWluOiBDdXJ0YWluO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGhwUGFuZWxzOiBIcFBhbmVscztcclxuXHJcbiAgICBwcml2YXRlIHBhbmVsczogYW55W11bXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzaGFwZUxpZ2h0czogYW55W107XHJcbiAgICBwcml2YXRlIGN1cnJlbnRTaGFwZUxpZ2h0SWR4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGhpZ2hsaWdodGVyOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBwdWxzZVR3ZWVuOiBhbnk7XHJcbiAgICBwcml2YXRlIHB1bHNlVHdlZW5FbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGVtaXNzaXZlSW50ZW5zaXR5OiBFbWlzc2l2ZUludGVuc2l0eTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihocE9yaWVudGF0aW9uOiBIcE9yaWVudGF0aW9uLCByb3dDbGVhckRpcmVjdGlvbjogUm93Q2xlYXJEaXJlY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIHRoaXMucGFuZWxHcm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIHRoaXMuYnVpbGRpbmcgPSBuZXcgQnVpbGRpbmcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yb3dDbGVhckRpcmVjdGlvbiA9IHJvd0NsZWFyRGlyZWN0aW9uO1xyXG4gICAgICAgIHRoaXMucm93Q2xlYXJDdXJ0YWluID0gbmV3IEN1cnRhaW4oKTtcclxuICAgICAgICB0aGlzLmp1bmtSb3dDdXJ0YWluID0gbmV3IEN1cnRhaW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy5ocFBhbmVscyA9IG5ldyBIcFBhbmVscyhocE9yaWVudGF0aW9uKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYW5lbHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBmbG9vcklkeCA9IDA7IGZsb29ySWR4IDwgRkxPT1JfQ09VTlQ7IGZsb29ySWR4KyspIHtcclxuICAgICAgICAgICAgdGhpcy5wYW5lbHNbZmxvb3JJZHhdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhbmVsSWR4ID0gMDsgcGFuZWxJZHggPCBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7IHBhbmVsSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KFBBTkVMX1NJWkUsIFBBTkVMX1NJWkUpOyAvLyBUT0RPOiBjbG9uZSgpID9cclxuICAgICAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7ZW1pc3NpdmVJbnRlbnNpdHk6IDEuMH0pO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhbmVsID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IHBhbmVsSWR4O1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBmbG9vcklkeCArIDE7IC8vIE9mZnNldCB1cCAxIGJlY2F1c2UgZ3JvdW5kIGlzIHkgPSAwLlxyXG4gICAgICAgICAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgICAgICAgICAgcGFuZWwucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFuZWxzW2Zsb29ySWR4XVtwYW5lbElkeF0gPSBwYW5lbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zaGFwZUxpZ2h0cyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGNvdW50ID0gMDsgY291bnQgPCBBQ1RJVkVfU0hBUEVfTElHSFRfQ09VTlQ7IGNvdW50KyspIHtcclxuICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoUEFORUxfU0laRSwgUEFORUxfU0laRSk7XHJcbiAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7ZW1pc3NpdmVJbnRlbnNpdHk6IDEuMH0pO1xyXG4gICAgICAgICAgICBsZXQgc2hhcGVMaWdodCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2hhcGVMaWdodHMucHVzaChzaGFwZUxpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGVMaWdodElkeCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmMDBmZiwgMy41LCAzKTtcclxuXHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuID0gbnVsbDtcclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5ID0gbmV3IEVtaXNzaXZlSW50ZW5zaXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5idWlsZGluZy5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5yb3dDbGVhckN1cnRhaW4uZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuanVua1Jvd0N1cnRhaW4uZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuaHBQYW5lbHMuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMucGFuZWxHcm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRpbmcuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLnJvd0NsZWFyQ3VydGFpbi5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0N1cnRhaW4uc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmhwUGFuZWxzLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGZsb29yIG9mIHRoaXMucGFuZWxzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhbmVsIG9mIGZsb29yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhbmVsR3JvdXAuYWRkKHBhbmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgc2hhcGVMaWdodCBvZiB0aGlzLnNoYXBlTGlnaHRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFuZWxHcm91cC5hZGQoc2hhcGVMaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAuYWRkKHRoaXMuaGlnaGxpZ2h0ZXIpO1xyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gdG8gZml0IGFnYWluc3QgYnVpbGRpbmcuXHJcbiAgICAgICAgdGhpcy5wYW5lbEdyb3VwLnBvc2l0aW9uLnNldCgxLjg1LCAzLjgsIC0xLjU1KTtcclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAuc2NhbGUuc2V0KDAuNywgMS4wLCAxKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBjZWxscyBhcHBlYXIgdG8gcHVsc2UuXHJcbiAgICAgICAgdGhpcy5lbWlzc2l2ZUludGVuc2l0eS52YWx1ZSA9IDAuMzM7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5wdWxzZVR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkpXHJcbiAgICAgICAgICAgIC50byh7dmFsdWU6IDEuMH0sIDc1MClcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuU2ludXNvaWRhbC5Jbk91dClcclxuICAgICAgICAgICAgLnlveW8odHJ1ZSlcclxuICAgICAgICAgICAgLnJlcGVhdChJbmZpbml0eSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMucHVsc2VUd2VlbkVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwUHVsc2UoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5yb3dDbGVhckN1cnRhaW4uc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmp1bmtSb3dDdXJ0YWluLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5ocFBhbmVscy5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaFJvb21PZmYoZmxvb3JJZHg6IG51bWJlciwgcGFuZWxJZHg6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBwYW5lbCA9IHRoaXMucGFuZWxzW2Zsb29ySWR4XVtwYW5lbElkeF07XHJcbiAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaFJvb21PbihmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyLCBjb2xvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHBhbmVsID0gdGhpcy5wYW5lbHNbZmxvb3JJZHhdW3BhbmVsSWR4XTtcclxuICAgICAgICBwYW5lbC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICBwYW5lbC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoY29sb3IpO1xyXG4gICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlLnNldEhleChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZEFjdGl2ZVNoYXBlTGlnaHRUbyhmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyLCBjb2xvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHNoYXBlTGlnaHQgPSB0aGlzLmdldE5leHRTaGFwZUxpZ2h0KCk7XHJcbiAgICAgICAgc2hhcGVMaWdodC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoY29sb3IpO1xyXG4gICAgICAgIHNoYXBlTGlnaHQubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KGNvbG9yKTtcclxuXHJcbiAgICAgICAgLy8gRG8gbm90IGxpZ2h0IGlmIGhpZ2hlciB0aGFuIHRoZSBoaWdoZXN0ICp2aXNpYmxlKiBmbG9vci5cclxuICAgICAgICBpZiAoZmxvb3JJZHggPj0gRkxPT1JfQ09VTlQpIHtcclxuICAgICAgICAgICAgc2hhcGVMaWdodC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2hhcGVMaWdodC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB4ID0gcGFuZWxJZHg7XHJcbiAgICAgICAgbGV0IHkgPSBmbG9vcklkeCArIDE7IC8vIE9mZnNldCB1cCAxIGJlY2F1c2UgZ3JvdW5kIGlzIHkgPSAwLlxyXG4gICAgICAgIGxldCB6ID0gMDtcclxuICAgICAgICBzaGFwZUxpZ2h0LnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBY3RpdmVTaGFwZUxpZ2h0UG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlnaGxpZ2h0ZXIucG9zaXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZEhpZ2hsaWdodGVyVG8oZmxvb3JJZHg6IG51bWJlciwgcGFuZWxJZHg6IG51bWJlciwgY29sb3I6IG51bWJlcikge1xyXG4gICAgICAgIC8vIERvIG5vdCBsaWdodCBpZiBoaWdoZXIgdGhhbiB0aGUgaGlnaGVzdCAqdmlzaWJsZSogZmxvb3IuXHJcbiAgICAgICAgaWYgKGZsb29ySWR4ID49IEZMT09SX0NPVU5UKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIuY29sb3Iuc2V0SGV4KGNvbG9yKTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB4ID0gcGFuZWxJZHg7XHJcbiAgICAgICAgbGV0IHkgPSBmbG9vcklkeCArIDE7IC8vIE9mZnNldCB1cCAxIGJlY2F1c2UgZ3JvdW5kIGlzIHkgPSAwLlxyXG4gICAgICAgIGxldCB6ID0gMDtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodGVyLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVIcChocDogbnVtYmVyLCBibGlua0xvc3Q6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmhwUGFuZWxzLnVwZGF0ZUhwKGhwLCBibGlua0xvc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0Um93Q2xlYXJpbmdBbmltYXRpb24oZmxvb3JJZHhzOiBudW1iZXJbXSwgY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcclxuICAgICAgICBsZXQgY3VydGFpbkRpcmVjdGlvbjogQ3VydGFpbkRpcmVjdGlvbjtcclxuICAgICAgICBpZiAodGhpcy5yb3dDbGVhckRpcmVjdGlvbiA9PT0gUm93Q2xlYXJEaXJlY3Rpb24uTGVmdFRvUmlnaHQpIHtcclxuICAgICAgICAgICAgY3VydGFpbkRpcmVjdGlvbiA9IEN1cnRhaW5EaXJlY3Rpb24uT3BlbkxlZnRUb1JpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnRhaW5EaXJlY3Rpb24gPSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5SaWdodFRvTGVmdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucm93Q2xlYXJDdXJ0YWluLnN0YXJ0QW5pbWF0aW9uKGZsb29ySWR4cywgY3VydGFpbkRpcmVjdGlvbiwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0SnVua1Jvd0N1cnRhaW5BbmltYXRpb24oZmxvb3JDb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGZsb29yQ291bnQgPiA0KSB7XHJcbiAgICAgICAgICAgIGZsb29yQ291bnQgPSA0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZmxvb3JDb3VudCA8IDApIHtcclxuICAgICAgICAgICAgZmxvb3JDb3VudCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBmbG9vcklkeHMgPSBbMCwgMSwgMiwgM10uc2xpY2UoMCwgZmxvb3JDb3VudCk7XHJcblxyXG4gICAgICAgIGxldCBjdXJ0YWluRGlyZWN0aW9uOiBDdXJ0YWluRGlyZWN0aW9uO1xyXG4gICAgICAgIGlmICh0aGlzLnJvd0NsZWFyRGlyZWN0aW9uID09PSBSb3dDbGVhckRpcmVjdGlvbi5MZWZ0VG9SaWdodCkge1xyXG4gICAgICAgICAgICBjdXJ0YWluRGlyZWN0aW9uID0gQ3VydGFpbkRpcmVjdGlvbi5DbG9zZVJpZ2h0VG9MZWZ0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnRhaW5EaXJlY3Rpb24gPSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlTGVmdFRvUmlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmp1bmtSb3dDdXJ0YWluLnN0YXJ0QW5pbWF0aW9uKGZsb29ySWR4cywgY3VydGFpbkRpcmVjdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZVNoYXBlTGlnaHRzQW5kSGlnaGxpZ2h0ZXIoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgc2hhcGVMaWdodCBvZiB0aGlzLnNoYXBlTGlnaHRzKSB7XHJcbiAgICAgICAgICAgIHNoYXBlTGlnaHQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZ2hsaWdodGVyLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRTaGFwZUxpZ2h0KCkge1xyXG4gICAgICAgIGxldCBzaGFwZUxpZ2h0ID0gdGhpcy5zaGFwZUxpZ2h0c1t0aGlzLmN1cnJlbnRTaGFwZUxpZ2h0SWR4XTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZUxpZ2h0SWR4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFNoYXBlTGlnaHRJZHggPj0gQUNUSVZFX1NIQVBFX0xJR0hUX0NPVU5UKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlTGlnaHRJZHggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2hhcGVMaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBQdWxzZShlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5wdWxzZVR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLnB1bHNlVHdlZW4udXBkYXRlKHRoaXMucHVsc2VUd2VlbkVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBmbG9vciBvZiB0aGlzLnBhbmVscykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYW5lbCBvZiBmbG9vcikge1xyXG4gICAgICAgICAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmVJbnRlbnNpdHkgPSB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGxDaGFuZ2VFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvY2VsbC1jaGFuZ2UtZXZlbnQnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9hY3RpdmUtc2hhcGUtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7SHBDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NGaWxsZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvcm93cy1maWxsZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9yb3dzLWNsZWFyLWFuaW1hdGlvbi1jb21wbGV0ZWQtZXZlbnQnO1xyXG5pbXBvcnQge0ZhbGxpbmdTZXF1ZW5jZXJFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvZmFsbGluZy1zZXF1ZW5jZXItZXZlbnQnO1xyXG5pbXBvcnQge0xpZ2h0aW5nR3JpZCwgRkxPT1JfQ09VTlR9IGZyb20gJy4vbGlnaHRpbmctZ3JpZCc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcbmltcG9ydCB7Q2VsbE9mZnNldH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uLy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgU3dpdGNoYm9hcmQge1xyXG5cclxuICAgIHByaXZhdGUgbGlnaHRpbmdHcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IobGlnaHRpbmdHcmlkOiBMaWdodGluZ0dyaWQsIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZCA9IGxpZ2h0aW5nR3JpZDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5DZWxsQ2hhbmdlRXZlbnRUeXBlLCAoZXZlbnQ6IENlbGxDaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUNlbGxDaGFuZ2VFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlJvd3NGaWxsZWRFdmVudFR5cGUsIChldmVudDogUm93c0ZpbGxlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZVJvd0NsZWFyaW5nKGV2ZW50LmZpbGxlZFJvd0lkeHMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlSnVua1Jvd0FkZGluZyhldmVudC5maWxsZWRSb3dJZHhzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkhwQ2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBIcENoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUhwQ2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuRmFsbGluZ1NlcXVlbmNlckV2ZW50VHlwZSwgKGV2ZW50OiBGYWxsaW5nU2VxdWVuY2VyRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PT0gZXZlbnQucGxheWVyVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVGYWxsaW5nU2VxdWVuY2VyRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGZsb29ySWR4ID0gdGhpcy5jb252ZXJ0Um93VG9GbG9vcihldmVudC5zaGFwZS5nZXRSb3coKSk7XHJcbiAgICAgICAgbGV0IHBhbmVsSWR4ID0gZXZlbnQuc2hhcGUuZ2V0Q29sKCk7XHJcbiAgICAgICAgbGV0IGNvbG9yID0gdGhpcy5jb252ZXJ0Q29sb3IoZXZlbnQuc2hhcGUuY29sb3IpO1xyXG5cclxuICAgICAgICBsZXQgeVRvdGFsT2Zmc2V0ID0gMDtcclxuICAgICAgICBsZXQgeFRvdGFsT2Zmc2V0ID0gMDtcclxuICAgICAgICBsZXQgb2Zmc2V0cyA9IGV2ZW50LnNoYXBlLmdldE9mZnNldHMoKTtcclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2Ygb2Zmc2V0cykge1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0Rmxvb3JJZHggPSBmbG9vcklkeCAtIG9mZnNldC55O1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0UGFuZWxJZHggPSBwYW5lbElkeCArIG9mZnNldC54O1xyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zZW5kQWN0aXZlU2hhcGVMaWdodFRvKG9mZnNldEZsb29ySWR4LCBvZmZzZXRQYW5lbElkeCwgY29sb3IpO1xyXG5cclxuICAgICAgICAgICAgeVRvdGFsT2Zmc2V0ICs9IG9mZnNldC55O1xyXG4gICAgICAgICAgICB4VG90YWxPZmZzZXQgKz0gb2Zmc2V0Lng7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgeW9mZiA9ICh5VG90YWxPZmZzZXQgLyBvZmZzZXRzLmxlbmd0aCkgLSAyO1xyXG4gICAgICAgIGxldCB4b2ZmID0geFRvdGFsT2Zmc2V0IC8gb2Zmc2V0cy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc2VuZEhpZ2hsaWdodGVyVG8oZmxvb3JJZHggKyB5b2ZmLCBwYW5lbElkeCArIHhvZmYsIGNvbG9yKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICBsZXQgYWN0aXZlU2hhcGVMaWdodFBvc2l0aW9uID0gdGhpcy5saWdodGluZ0dyaWQuZ2V0QWN0aXZlU2hhcGVMaWdodFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IEhhdmUgdGhlIGNhbWVyYSBsb29rIGF0IHRoaXM/XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2VsbENoYW5nZUV2ZW50KGV2ZW50OiBDZWxsQ2hhbmdlRXZlbnQpIHtcclxuICAgICAgICBsZXQgZmxvb3JJZHggPSB0aGlzLmNvbnZlcnRSb3dUb0Zsb29yKGV2ZW50LnJvdyk7XHJcbiAgICAgICAgaWYgKGZsb29ySWR4ID49IEZMT09SX0NPVU5UKSB7XHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gU2tpcCBvYnN0cnVjdGVkIGZsb29yc1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHBhbmVsSWR4ID0gZXZlbnQuY29sO1xyXG4gICAgICAgIGlmIChldmVudC5jZWxsLmdldENvbG9yKCkgPT09IENvbG9yLkVtcHR5KSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnN3aXRjaFJvb21PZmYoZmxvb3JJZHgsIHBhbmVsSWR4KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgY29sb3IgPSB0aGlzLmNvbnZlcnRDb2xvcihldmVudC5jZWxsLmdldENvbG9yKCkpO1xyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zd2l0Y2hSb29tT24oZmxvb3JJZHgsIHBhbmVsSWR4LCBjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYW5pbWF0ZVJvd0NsZWFyaW5nKGZpbGxlZFJvd0lkeHM6IG51bWJlcltdKSB7XHJcbiAgICAgICAgbGV0IGZsb29ySWR4czogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBmaWxsZWRSb3dJZHggb2YgZmlsbGVkUm93SWR4cykge1xyXG4gICAgICAgICAgICBsZXQgZmxvb3JJZHggPSB0aGlzLmNvbnZlcnRSb3dUb0Zsb29yKGZpbGxlZFJvd0lkeCk7XHJcbiAgICAgICAgICAgIGZsb29ySWR4cy5wdXNoKGZsb29ySWR4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnN0YXJ0Um93Q2xlYXJpbmdBbmltYXRpb24oZmxvb3JJZHhzLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtZW1iZXIgdGhhdCB0aGUganVuayByb3dzIGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkIG9uIHRoZSBib2FyZC5cclxuICAgICAqIFxyXG4gICAgICogRG8gbm90IG5lZWQgdG8gZmlyZSBhbiBldmVudCBhdCB0aGUgZW5kIG9mIHRoaXMgYW5pbWF0aW9uIGJlY2F1c2UgdGhlIGJvYXJkXHJcbiAgICAgKiBkb2VzIG5vdCBuZWVkIHRvIGxpc3RlbiBmb3IgaXQgKGl0IGxpc3RlbnMgZm9yIHRoZSBjbGVhcmluZyBhbmltYXRpb24gaW5zdGVhZCkuXHJcbiAgICAqL1xyXG4gICAgcHJpdmF0ZSBhbmltYXRlSnVua1Jvd0FkZGluZyhqdW5rUm93Q291bnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnN0YXJ0SnVua1Jvd0N1cnRhaW5BbmltYXRpb24oanVua1Jvd0NvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUhwQ2hhbmdlZEV2ZW50KGV2ZW50OiBIcENoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnVwZGF0ZUhwKGV2ZW50LmhwLCBldmVudC5ibGlua0xvc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlRmFsbGluZ1NlcXVlbmNlckV2ZW50KGV2ZW50OiBGYWxsaW5nU2VxdWVuY2VyRXZlbnQpe1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLmhpZGVTaGFwZUxpZ2h0c0FuZEhpZ2hsaWdodGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IGNlbGwgcm93L2NvbCBjb29yZGluYXRlcyB0byBmbG9vci9wYW5lbCBjb29yZGluYXRlcy5cclxuICAgICAqIEFjY291bnQgZm9yIHRoZSB0d28gZmxvb3JzIHRoYXQgYXJlIG9ic3RydWN0ZWQgZnJvbSB2aWV3LiAoPylcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjb252ZXJ0Um93VG9GbG9vcihyb3c6IG51bWJlcikge1xyXG4gICAgICAgIGxldCB0aGluZyA9IChGTE9PUl9DT1VOVCAtIHJvdykgKyAxO1xyXG4gICAgICAgIHJldHVybiB0aGluZztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbnZlcnRDb2xvcihjb2xvcjogQ29sb3IpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB2YWx1ZTogbnVtYmVyO1xyXG4gICAgICAgIHN3aXRjaCAoY29sb3IpIHtcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5DeWFuOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDMzY2NjYztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLlllbGxvdzpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhmZmZmNTU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5QdXJwbGU6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4YTAyMGEwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuR3JlZW46XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4MjBhMDIwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuUmVkOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGZmMzMzMztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkJsdWU6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4NDQ0NGNjO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuT3JhbmdlOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGVlZDUzMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLldoaXRlOlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGZmZmZmZjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAvLyBEZWZhdWx0IG9yIG1pc3NpbmcgY2FzZSBpcyBibGFjay5cclxuICAgICAgICAgICAgY2FzZSBDb2xvci5FbXB0eTpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgwMDAwMDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuLy8gRGltZW5zaW9ucyBvZiB0aGUgZW50aXJlIHNwcml0ZXNoZWV0OlxyXG5leHBvcnQgY29uc3QgU1BSSVRFU0hFRVRfV0lEVEggICA9IDI1NjtcclxuZXhwb3J0IGNvbnN0IFNQUklURVNIRUVUX0hFSUdIVCAgPSA1MTI7XHJcblxyXG4vLyBEaW1lbnNpb25zIG9mIG9uZSBmcmFtZSB3aXRoaW4gdGhlIHNwcml0ZXNoZWV0OlxyXG5leHBvcnQgY29uc3QgRlJBTUVfV0lEVEggICA9IDQ4O1xyXG5leHBvcnQgY29uc3QgRlJBTUVfSEVJR0hUICA9IDcyO1xyXG5cclxuY29uc3QgRklMRVNfVE9fUFJFTE9BRCA9IDM7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyIHtcclxuXHJcbiAgICByZWFkb25seSB0ZXh0dXJlOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IodGV4dHVyZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlIHtcclxuXHJcbiAgICBwcml2YXRlIHRleHR1cmVzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgbG9hZGVkQ291bnQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY3VycmVudFRleHR1cmVJZHg6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnRleHR1cmVzID0gW107XHJcbiAgICAgICAgdGhpcy5sb2FkZWRDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50VGV4dHVyZUlkeCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJlbG9hZChzaWduYWxUaGF0T25lVGV4dHVyZVdhc0xvYWRlZDogKHJlc3VsdDogYm9vbGVhbikgPT4gYW55KTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgdGV4dHVyZUxvYWRlZEhhbmRsZXIgPSAodGV4dHVyZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEhhdmUgaXQgc2hvdyBvbmx5IG9uZSBmcmFtZSBhdCBhIHRpbWU6XHJcbiAgICAgICAgICAgIHRleHR1cmUucmVwZWF0LnNldChcclxuICAgICAgICAgICAgICAgIEZSQU1FX1dJRFRIICAvIFNQUklURVNIRUVUX1dJRFRILFxyXG4gICAgICAgICAgICAgICAgRlJBTUVfSEVJR0hUIC8gU1BSSVRFU0hFRVRfSEVJR0hUXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZXMucHVzaCh0ZXh0dXJlKTtcclxuICAgICAgICAgICAgdGhpcy5sb2FkZWRDb3VudCsrO1xyXG4gICAgICAgICAgICBzaWduYWxUaGF0T25lVGV4dHVyZVdhc0xvYWRlZCh0cnVlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgZXJyb3JIYW5kbGVyID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBzaWduYWxUaGF0T25lVGV4dHVyZVdhc0xvYWRlZChmYWxzZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHRleHR1cmVMb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgICAgIHRleHR1cmVMb2FkZXIubG9hZCgnZmFsbC1zdHVkZW50LnBuZycsIHRleHR1cmVMb2FkZWRIYW5kbGVyLCB1bmRlZmluZWQsIGVycm9ySGFuZGxlcik7XHJcbiAgICAgICAgdGV4dHVyZUxvYWRlci5sb2FkKCdmYWxsLXN0dWRlbnQyLnBuZycsIHRleHR1cmVMb2FkZWRIYW5kbGVyLCB1bmRlZmluZWQsIGVycm9ySGFuZGxlcik7XHJcbiAgICAgICAgdGV4dHVyZUxvYWRlci5sb2FkKCdmYWxsLXN0dWRlbnQzLnBuZycsIHRleHR1cmVMb2FkZWRIYW5kbGVyLCB1bmRlZmluZWQsIGVycm9ySGFuZGxlcik7XHJcblxyXG4gICAgICAgIHJldHVybiBGSUxFU19UT19QUkVMT0FEO1xyXG4gICAgfVxyXG5cclxuICAgIG5ld0luc3RhbmNlKCk6IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlciB7XHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMuZ2V0TmV4dFRleHR1cmVJZHgoKTtcclxuICAgICAgICBsZXQgdGV4dHVyZSA9IHRoaXMudGV4dHVyZXNbaWR4XS5jbG9uZSgpOyAvLyBDbG9uaW5nIHRleHR1cmVzIGluIHRoZSB2ZXJzaW9uIG9mIFRocmVlSlMgdGhhdCBJIGFtIGN1cnJlbnRseSB1c2luZyB3aWxsIGR1cGxpY2F0ZSB0aGVtIDooXHJcbiAgICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXIodGV4dHVyZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXROZXh0VGV4dHVyZUlkeCgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRUZXh0dXJlSWR4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFRleHR1cmVJZHggPj0gRklMRVNfVE9fUFJFTE9BRCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUZXh0dXJlSWR4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFRleHR1cmVJZHg7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZSA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2UoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge1N0YW5kZWV9IGZyb20gJy4vc3RhbmRlZSc7XHJcbmltcG9ydCB7RXZlbnRUeXBlLCBldmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtOcGNQbGFjZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLXBsYWNlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjVGVsZXBvcnRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtdGVsZXBvcnRlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1tb3ZlbWVudC1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNGYWNpbmdFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLWZhY2luZy1ldmVudCc7XHJcblxyXG5jb25zdCBZX09GRlNFVCA9IDAuNzU7IC8vIFNldHMgdGhlaXIgZmVldCBvbiB0aGUgZ3JvdW5kIHBsYW5lLlxyXG5jb25zdCBTVEFOREVFX1NQRUVEID0gMC41O1xyXG5cclxuY2xhc3MgU3RhbmRlZU1hbmFnZXIge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFuZGVlczogTWFwPG51bWJlciwgU3RhbmRlZT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YW5kZWVzID0gbmV3IE1hcDxudW1iZXIsIFN0YW5kZWU+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXRZKFlfT0ZGU0VUKTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY1BsYWNlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNQbGFjZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY1BsYWNlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY1RlbGVwb3J0ZWRFdmVudFR5cGUsIChldmVudDogTnBjVGVsZXBvcnRlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTnBjVGVsZXBvcnRlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY01vdmVtZW50Q2hhbmdlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLk5wY0ZhY2luZ0V2ZW50VHlwZSwgKGV2ZW50OiBOcGNGYWNpbmdFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU5wY0ZhY2luZ0V2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RhbmRlZXMuZm9yRWFjaCgoc3RhbmRlZTogU3RhbmRlZSkgPT4ge1xyXG4gICAgICAgICAgICBzdGFuZGVlLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOcGNQbGFjZWRFdmVudChldmVudDogTnBjUGxhY2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IG5ldyBTdGFuZGVlKGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBzdGFuZGVlLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQoc3RhbmRlZS5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5zdGFuZGVlcy5zZXQoc3RhbmRlZS5ucGNJZCwgc3RhbmRlZSk7XHJcblxyXG4gICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Qb3NpdGlvbihzdGFuZGVlLCB4LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5wY1RlbGVwb3J0ZWRFdmVudChldmVudDogTnBjVGVsZXBvcnRlZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IHN0YW5kZWUgPSB0aGlzLnN0YW5kZWVzLmdldChldmVudC5ucGNJZCk7XHJcbiAgICAgICAgaWYgKHN0YW5kZWUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgeCA9IGV2ZW50Lng7XHJcbiAgICAgICAgICAgIGxldCB6ID0gZXZlbnQueTtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlVG9Qb3NpdGlvbihzdGFuZGVlLCB4LCB6KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtb3ZlVG9Qb3NpdGlvbihzdGFuZGVlOiBTdGFuZGVlLCB4OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHN0YW5kZWUubW92ZVRvKHgseik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOcGNNb3ZlbWVudENoYW5nZWRFdmVudChldmVudDogTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IHRoaXMuc3RhbmRlZXMuZ2V0KGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBpZiAoc3RhbmRlZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICAgICAgbGV0IHogPSBldmVudC55O1xyXG4gICAgICAgICAgICBzdGFuZGVlLndhbGtUbyh4LCB6LCBTVEFOREVFX1NQRUVEKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOcGNGYWNpbmdFdmVudChldmVudDogTnBjRmFjaW5nRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IHRoaXMuc3RhbmRlZXMuZ2V0KGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBpZiAoc3RhbmRlZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICAgICAgbGV0IHogPSBldmVudC55O1xyXG4gICAgICAgICAgICBzdGFuZGVlLmxvb2tBdCh4LCB6KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHN0YW5kZWVNYW5hZ2VyID0gbmV3IFN0YW5kZWVNYW5hZ2VyKCk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQvbGliL2xpYi5lczYuZC50cycvPlxyXG5cclxuZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtjYW1lcmFXcmFwcGVyfSBmcm9tICcuLi9jYW1lcmEtd3JhcHBlcic7XHJcbmltcG9ydCB7XHJcbiAgICBTUFJJVEVTSEVFVF9XSURUSCxcclxuICAgIFNQUklURVNIRUVUX0hFSUdIVCxcclxuICAgIEZSQU1FX1dJRFRILFxyXG4gICAgRlJBTUVfSEVJR0hULFxyXG4gICAgU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyLFxyXG4gICAgc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlfVxyXG5mcm9tICcuL3N0YW5kZWUtYW5pbWF0aW9uLXRleHR1cmUtYmFzZSc7XHJcblxyXG5jb25zdCBTVEFOREFSRF9ERUxBWSA9IDIyNTtcclxuY29uc3QgV0FMS19VUF9PUl9ET1dOX0RFTEFZID0gTWF0aC5mbG9vcihTVEFOREFSRF9ERUxBWSAqICgyLzMpKTsgLy8gQmVjYXVzZSB1cC9kb3duIHdhbGsgY3ljbGVzIGhhdmUgbW9yZSBmcmFtZXMuIFxyXG5cclxuY29uc3Qgc2NyYXRjaFZlY3RvcjE6IGFueSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbmNvbnN0IHNjcmF0Y2hWZWN0b3IyOiBhbnkgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG5cclxuY2xhc3MgU3RhbmRlZUFuaW1hdGlvbkZyYW1lIHtcclxuXHJcbiAgICByZWFkb25seSByb3c6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IGNvbDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMucm93ID0gcm93OyBcclxuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGVudW0gU3RhbmRlZUFuaW1hdGlvblR5cGUge1xyXG4gICAgU3RhbmRVcCxcclxuICAgIFN0YW5kRG93bixcclxuICAgIFN0YW5kTGVmdCxcclxuICAgIFN0YW5kUmlnaHQsXHJcbiAgICBXYWxrVXAsXHJcbiAgICBXYWxrRG93bixcclxuICAgIFdhbGtMZWZ0LFxyXG4gICAgV2Fsa1JpZ2h0LFxyXG4gICAgQ2hlZXJVcCxcclxuICAgIFBhbmljVXAsXHJcbiAgICBQYW5pY0Rvd25cclxufVxyXG5cclxuY2xhc3MgU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IHR5cGU6IFN0YW5kZWVBbmltYXRpb25UeXBlO1xyXG4gICAgcmVhZG9ubHkgbmV4dDogU3RhbmRlZUFuaW1hdGlvblR5cGU7IC8vIFByb2JhYmx5IG5vdCBnb2luZyB0byBiZSB1c2VkIGZvciB0aGlzIGdhbWVcclxuXHJcbiAgICByZWFkb25seSBmcmFtZXM6IFN0YW5kZWVBbmltYXRpb25GcmFtZVtdO1xyXG4gICAgcmVhZG9ubHkgZGVsYXlzOiBudW1iZXJbXTtcclxuICAgIHByaXZhdGUgY3VycmVudEZyYW1lSWR4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBmaW5pc2hlZDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZSwgbmV4dD86IFN0YW5kZWVBbmltYXRpb25UeXBlKSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICBpZiAobmV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLm5leHQgPSBuZXh0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dCA9IHR5cGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmZyYW1lcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZGVsYXlzID0gW107XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVJZHggPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZyYW1lVGltZUVsYXBzZWQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmZpbmlzaGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVzaChmcmFtZTogU3RhbmRlZUFuaW1hdGlvbkZyYW1lLCBkZWxheSA9IFNUQU5EQVJEX0RFTEFZKSB7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMucHVzaChmcmFtZSk7XHJcbiAgICAgICAgdGhpcy5kZWxheXMucHVzaChkZWxheSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZVRpbWVFbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEZyYW1lVGltZUVsYXBzZWQgPj0gdGhpcy5kZWxheXNbdGhpcy5jdXJyZW50RnJhbWVJZHhdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEZyYW1lVGltZUVsYXBzZWQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZUlkeCsrO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50RnJhbWVJZHggPj0gdGhpcy5mcmFtZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZUlkeCA9IDA7IC8vIFNob3VsZG4ndCBiZSB1c2VkIGFueW1vcmUsIGJ1dCBwcmV2ZW50IG91dC1vZi1ib3VuZHMgYW55d2F5LlxyXG4gICAgICAgICAgICAgICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNGaW5pc2hlZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maW5pc2hlZDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50RnJhbWUoKTogU3RhbmRlZUFuaW1hdGlvbkZyYW1lIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mcmFtZXNbdGhpcy5jdXJyZW50RnJhbWVJZHhdO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZVNwcml0ZVdyYXBwZXIge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG4gICAgcHJpdmF0ZSBzcHJpdGU6IGFueTtcclxuICAgIHByaXZhdGUgdGV4dHVyZVdyYXBwZXI6IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcjtcclxuXHJcbiAgICBwcml2YXRlIGN1cnJlbnRBbmltYXRpb246IFN0YW5kZWVBbmltYXRpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFRocmVlSlMgb2JqZWN0czogXHJcbiAgICAgICAgdGhpcy50ZXh0dXJlV3JhcHBlciA9IHN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZS5uZXdJbnN0YW5jZSgpO1xyXG4gICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TcHJpdGVNYXRlcmlhbCh7bWFwOiB0aGlzLnRleHR1cmVXcmFwcGVyLnRleHR1cmV9KTtcclxuICAgICAgICB0aGlzLnNwcml0ZSA9IG5ldyBUSFJFRS5TcHJpdGUobWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnNjYWxlLnNldCgxLCAxLjUpOyAvLyBBZGp1c3QgYXNwZWN0IHJhdGlvIGZvciA0OCB4IDcyIHNpemUgZnJhbWVzLiBcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLnNwcml0ZSk7XHJcblxyXG4gICAgICAgIC8vIEhhbGYgc2l6ZSB0aGVtIGFuZCBwb3NpdGlvbiB0aGVpciBmZWV0IG9uIHRoZSBncm91bmQuXHJcbiAgICAgICAgdGhpcy5ncm91cC5zY2FsZS5zZXQoMC41LCAwLjUsIDAuNSk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoMCwgLTAuNCwgMCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgZGVmYXVsdCBhbmltYXRpb24gdG8gc3RhbmRpbmcgZmFjaW5nIGRvd246XHJcbiAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gY3JlYXRlU3RhbmREb3duKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy8gVE9ETzogU2V0IHRoaXMgZWxzZXdoZXJlXHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmFkanVzdExpZ2h0aW5nKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuc3RlcEFuaW1hdGlvbihlbGFwc2VkKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBPbmx5IHN3aXRjaGVzIGlmIHRoZSBnaXZlbiBhbmltYXRpb24gaXMgZGlmZmVyZW50IGZyb20gdGhlIGN1cnJlbnQgb25lLlxyXG4gICAgICovXHJcbiAgICBzd2l0Y2hBbmltYXRpb24odHlwZTogU3RhbmRlZUFuaW1hdGlvblR5cGUpIHtcclxuICAgICAgICBsZXQgYW5pbWF0aW9uID0gZGV0ZXJtaW5lQW5pbWF0aW9uKHR5cGUpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBbmltYXRpb24udHlwZSAhPT0gYW5pbWF0aW9uLnR5cGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0aW9uO1xyXG4gICAgICAgIH0gXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGp1c3RMaWdodGluZyhlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvLyBUT0RPOiBOb3QgeWV0IHN1cmUgaWYgSSdsbCBuZWVkIHRvIHVzZSB0aGUgZWxhcHNlZCB2YXJpYWJsZSBoZXJlLlxyXG4gICAgICAgIC8vIFRPRE86IE1vdmUgbWFnaWMgbnVtYmVycyBpbnRvIHNhbWUgZXF1YXRpb25zIGFzIHRoZSBOUENcclxuICAgICAgICB0aGlzLnNwcml0ZS5nZXRXb3JsZFBvc2l0aW9uKHNjcmF0Y2hWZWN0b3IxKTtcclxuICAgICAgICBjYW1lcmFXcmFwcGVyLmNhbWVyYS5nZXRXb3JsZFBvc2l0aW9uKHNjcmF0Y2hWZWN0b3IyKTtcclxuICAgICAgICBsZXQgZGlzdGFuY2VTcXVhcmVkOiBudW1iZXIgPSBzY3JhdGNoVmVjdG9yMS5kaXN0YW5jZVRvU3F1YXJlZChzY3JhdGNoVmVjdG9yMik7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gTWF0aC5tYXgoMC4yMCwgMS4wIC0gKE1hdGgubWluKDEuMCwgZGlzdGFuY2VTcXVhcmVkIC8gMjI1KSkpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLm1hdGVyaWFsLmNvbG9yLnNldFJHQih2YWx1ZSwgdmFsdWUsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBBbmltYXRpb24oZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFuaW1hdGlvbiA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbi5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBbmltYXRpb24uaXNGaW5pc2hlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IGRldGVybWluZUFuaW1hdGlvbih0aGlzLmN1cnJlbnRBbmltYXRpb24ubmV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBmcmFtZSA9IHRoaXMuY3VycmVudEFuaW1hdGlvbi5nZXRDdXJyZW50RnJhbWUoKTtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCBmcmFtZSBjb29yZGluYXRlcyB0byB0ZXh0dXJlIGNvb3JkaW5hdGVzIGFuZCBzZXQgdGhlIGN1cnJlbnQgb25lXHJcbiAgICAgICAgbGV0IHhwY3QgPSAoZnJhbWUuY29sICogRlJBTUVfV0lEVEgpIC8gU1BSSVRFU0hFRVRfV0lEVEg7XHJcbiAgICAgICAgbGV0IHlwY3QgPSAoKChTUFJJVEVTSEVFVF9IRUlHSFQgLyBGUkFNRV9IRUlHSFQpIC0gMSAtIGZyYW1lLnJvdykgKiBGUkFNRV9IRUlHSFQpIC8gU1BSSVRFU0hFRVRfSEVJR0hUO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZVdyYXBwZXIudGV4dHVyZS5vZmZzZXQuc2V0KHhwY3QsIHlwY3QpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZXRlcm1pbmVBbmltYXRpb24odHlwZTogU3RhbmRlZUFuaW1hdGlvblR5cGUpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb246IFN0YW5kZWVBbmltYXRpb247XHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kVXAoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kRG93bjpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlU3RhbmREb3duKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0Rvd246XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtEb3duKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRMZWZ0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZExlZnQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrTGVmdDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa0xlZnQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZFJpZ2h0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZFJpZ2h0KCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa1JpZ2h0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVXYWxrUmlnaHQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5DaGVlclVwOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVDaGVlclVwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlUGFuaWNVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlBhbmljRG93bjpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlUGFuaWNEb3duKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTaG91bGQgbm90IGdldCBoZXJlJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBTdGFuZGluZyBVcFxyXG5sZXQgc3RhbmRVcEZyYW1lMSAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZFVwKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kVXApO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goc3RhbmRVcEZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIFVwXHJcbmxldCB3YWxrVXBGcmFtZTEgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxubGV0IHdhbGtVcEZyYW1lMiAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDEpO1xyXG5sZXQgd2Fsa1VwRnJhbWUzICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMik7XHJcbmxldCB3YWxrVXBGcmFtZTQgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAzKTtcclxubGV0IHdhbGtVcEZyYW1lNSAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDMpO1xyXG5sZXQgd2Fsa1VwRnJhbWU2ICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNSwgMyk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVXYWxrVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa1VwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lMSwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lMiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lMywgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lNCwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lNSwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtVcEZyYW1lNiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIERvd25cclxubGV0IHN0YW5kRG93bkZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDApO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU3RhbmREb3duKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kRG93bik7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZERvd25GcmFtZTEpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gV2Fsa2luZyBEb3duXHJcbmxldCB3YWxrRG93bkZyYW1lMSAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAwKTtcclxubGV0IHdhbGtEb3duRnJhbWUyICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDEpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTMgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMik7XHJcbmxldCB3YWxrRG93bkZyYW1lNCAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAzKTtcclxubGV0IHdhbGtEb3duRnJhbWU1ICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDMpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTYgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMyk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVXYWxrRG93bigpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrRG93bik7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lMSwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWUyLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTMsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lNCwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWU1LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTYsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBTdGFuZGluZyBMZWZ0XHJcbmxldCBzdGFuZExlZnRGcmFtZTEgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAxKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kTGVmdCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goc3RhbmRMZWZ0RnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgTGVmdFxyXG5sZXQgd2Fsa0xlZnRGcmFtZTEgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMSk7XHJcbmxldCB3YWxrTGVmdEZyYW1lMiAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAwKTtcclxubGV0IHdhbGtMZWZ0RnJhbWUzICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDEpO1xyXG5sZXQgd2Fsa0xlZnRGcmFtZTQgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMik7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVXYWxrTGVmdCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrTGVmdCk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrTGVmdEZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrTGVmdEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrTGVmdEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrTGVmdEZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBTdGFuZGluZyBSaWdodFxyXG5sZXQgc3RhbmRSaWdodEZyYW1lMSAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgNCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZFJpZ2h0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goc3RhbmRSaWdodEZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIFJpZ2h0XHJcbmxldCB3YWxrUmlnaHRGcmFtZTEgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxubGV0IHdhbGtSaWdodEZyYW1lMiAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDQpO1xyXG5sZXQgd2Fsa1JpZ2h0RnJhbWUzICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgNCk7XHJcbmxldCB3YWxrUmlnaHRGcmFtZTQgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCA0KTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtSaWdodCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrUmlnaHQpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtSaWdodEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTMpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIENoZWVyIFVwXHJcbmxldCBjaGVlclVwRnJhbWUxICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxubGV0IGNoZWVyVXBGcmFtZTIgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDApO1xyXG5sZXQgY2hlZXJVcEZyYW1lMyAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMSk7XHJcbmxldCBjaGVlclVwRnJhbWU0ICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAwKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUNoZWVyVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuQ2hlZXJVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goY2hlZXJVcEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFBhbmljIFVwXHJcbmxldCBwYW5pY1VwRnJhbWUxICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxubGV0IHBhbmljVXBGcmFtZTIgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDIpO1xyXG5sZXQgcGFuaWNVcEZyYW1lMyAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMCk7XHJcbmxldCBwYW5pY1VwRnJhbWU0ICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAyKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVBhbmljVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNVcEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFBhbmljIERvd25cclxubGV0IHBhbmljRG93bkZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDApO1xyXG5sZXQgcGFuaWNEb3duRnJhbWUyICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMSk7XHJcbmxldCBwYW5pY0Rvd25GcmFtZTMgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAyKTtcclxubGV0IHBhbmljRG93bkZyYW1lNCAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDEpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGFuaWNEb3duKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlBhbmljRG93bik7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNEb3duRnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuZGVjbGFyZSBjb25zdCBUV0VFTjogYW55O1xyXG5cclxuaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge1N0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3N0YW5kZWUtbW92ZW1lbnQtZW5kZWQtZXZlbnQnO1xyXG5pbXBvcnQge1N0YW5kZWVTcHJpdGVXcmFwcGVyLCBTdGFuZGVlQW5pbWF0aW9uVHlwZX0gZnJvbSAnLi9zdGFuZGVlLXNwcml0ZS13cmFwcGVyJztcclxuaW1wb3J0IHtjYW1lcmFXcmFwcGVyfSBmcm9tICcuLi9jYW1lcmEtd3JhcHBlcic7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhbmRlZSB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG4gICAgcmVhZG9ubHkgc3ByaXRlV3JhcHBlcjogU3RhbmRlZVNwcml0ZVdyYXBwZXI7XHJcblxyXG4gICAgcHJpdmF0ZSB3YWxrVHdlZW5FbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHdhbGtUd2VlbjogYW55O1xyXG5cclxuICAgIHByaXZhdGUgZmFjaW5nOiBhbnk7IC8vIEZhY2VzIGluIHRoZSB2ZWN0b3Igb2Ygd2hpY2ggd2F5IHRoZSBOUEMgaXMgd2Fsa2luZywgd2FzIHdhbGtpbmcgYmVmb3JlIHN0b3BwaW5nLCBvciB3YXMgc2V0IHRvLlxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIgPSBuZXcgU3RhbmRlZVNwcml0ZVdyYXBwZXIoKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLnNwcml0ZVdyYXBwZXIuZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5mYWNpbmcgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24uc2V0KC0yMDAsIDAsIC0yMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwV2FsayhlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmVuc3VyZUNvcnJlY3RBbmltYXRpb24oKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbW1lZGlhdGVseSBzZXQgc3RhbmRlZSBvbiBnaXZlbiBwb3NpdGlvbi5cclxuICAgICAqL1xyXG4gICAgbW92ZVRvKHg6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoeCwgMCwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgc3RhbmRlZSBpbiBtb3Rpb24gdG93YXJkcyBnaXZlbiBwb3NpdGlvbi5cclxuICAgICAqIFNwZWVkIGRpbWVuc2lvbiBpcyAxIHVuaXQvc2VjLlxyXG4gICAgICovXHJcbiAgICB3YWxrVG8oeDogbnVtYmVyLCB6OiBudW1iZXIsIHNwZWVkOiBudW1iZXIpIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG93IGxvbmcgaXQgd291bGQgdGFrZSwgZ2l2ZW4gdGhlIHNwZWVkIHJlcXVlc3RlZC5cclxuICAgICAgICBsZXQgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoeCwgMCwgeikuc3ViKHRoaXMuZ3JvdXAucG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IHZlY3Rvci5sZW5ndGgoKTtcclxuICAgICAgICBsZXQgdGltZSA9IChkaXN0YW5jZSAvIHNwZWVkKSAqIDEwMDA7XHJcblxyXG4gICAgICAgIC8vIERlbGVnYXRlIHRvIHR3ZWVuLmpzLiBQYXNzIGluIGNsb3N1cmVzIGFzIGNhbGxiYWNrcyBiZWNhdXNlIG90aGVyd2lzZSAndGhpcycgd2lsbCByZWZlclxyXG4gICAgICAgIC8vIHRvIHRoZSBwb3NpdGlvbiBvYmplY3QsIHdoZW4gZXhlY3V0aW5nIHN0b3BXYWxrKCkuXHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLndhbGtUd2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmdyb3VwLnBvc2l0aW9uKVxyXG4gICAgICAgICAgICAudG8oe3g6IHgsIHo6IHp9LCB0aW1lKVxyXG4gICAgICAgICAgICAub25Db21wbGV0ZSgoKSA9PiB7IHRoaXMuc3RvcFdhbGsoKTsgfSlcclxuICAgICAgICAgICAgLnN0YXJ0KHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVXBkYXRlIGRpcmVjdGlvbiB0aGlzIHN0YW5kZWUgd2lsbCBiZSBmYWNpbmcgd2hlbiB3YWxraW5nLlxyXG4gICAgICAgIHRoaXMuZmFjaW5nLnNldFgoeCAtIHRoaXMuZ3JvdXAucG9zaXRpb24ueCk7XHJcbiAgICAgICAgdGhpcy5mYWNpbmcuc2V0Wih6IC0gdGhpcy5ncm91cC5wb3NpdGlvbi56KTtcclxuICAgIH1cclxuXHJcbiAgICBsb29rQXQoeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmZhY2luZy5zZXRYKHggLSB0aGlzLmdyb3VwLnBvc2l0aW9uLngpO1xyXG4gICAgICAgIHRoaXMuZmFjaW5nLnNldFooeiAtIHRoaXMuZ3JvdXAucG9zaXRpb24ueik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwV2FsayhlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy53YWxrVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy53YWxrVHdlZW4udXBkYXRlKHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RvcFdhbGsoKSB7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLndhbGtUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChcclxuICAgICAgICAgICAgdGhpcy5ucGNJZCxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnopXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVuc3VyZUNvcnJlY3RBbmltYXRpb24oKSB7XHJcbiAgICAgICAgLy8gbGV0IHRhcmdldCA9IHRoaXMuZ3JvdXAucG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgICAvLyB0YXJnZXQuc2V0WSh0YXJnZXQueSArIDAuNSk7XHJcbiAgICAgICAgLy8gY2FtZXJhV3JhcHBlci5jYW1lcmEubG9va0F0KHRhcmdldCk7XHJcblxyXG4gICAgICAgIC8vIEFuZ2xlIGJldHdlZW4gdHdvIHZlY3RvcnM6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxNDg0MjI4XHJcbiAgICAgICAgbGV0IHdvcmxkRGlyZWN0aW9uID0gY2FtZXJhV3JhcHBlci5jYW1lcmEuZ2V0V29ybGREaXJlY3Rpb24oKTtcclxuICAgICAgICBsZXQgYW5nbGUgPSBNYXRoLmF0YW4yKHRoaXMuZmFjaW5nLnosIHRoaXMuZmFjaW5nLngpIC0gTWF0aC5hdGFuMih3b3JsZERpcmVjdGlvbi56LCB3b3JsZERpcmVjdGlvbi54KTtcclxuICAgICAgICBpZiAoYW5nbGUgPCAwKSBhbmdsZSArPSAyICogTWF0aC5QSTtcclxuICAgICAgICBhbmdsZSAqPSAoMTgwL01hdGguUEkpOyAvLyBJdCdzIG15IHBhcnR5IGFuZCBJJ2xsIHVzZSBkZWdyZWVzIGlmIEkgd2FudCB0by5cclxuXHJcbiAgICAgICAgaWYgKHRoaXMud2Fsa1R3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgaWYgKGFuZ2xlIDwgNjAgfHwgYW5nbGUgPj0gMzAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtVcCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gNjAgJiYgYW5nbGUgPCAxMjApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa1JpZ2h0KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSAxMjAgJiYgYW5nbGUgPCAyNDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa0Rvd24pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDI0MCAmJiBhbmdsZSA8IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrTGVmdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoYW5nbGUgPCA2MCB8fCBhbmdsZSA+PSAzMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gNjAgJiYgYW5nbGUgPCAxMjApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRSaWdodCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gMTIwICYmIGFuZ2xlIDwgMjQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kRG93bik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gMjQwICYmIGFuZ2xlIDwgMzAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kTGVmdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge2NhbWVyYVdyYXBwZXJ9IGZyb20gJy4vY2FtZXJhLXdyYXBwZXInO1xyXG5pbXBvcnQge3NreX0gZnJvbSAnLi93b3JsZC9za3knO1xyXG5pbXBvcnQge2dyb3VuZH0gZnJvbSAnLi93b3JsZC9ncm91bmQnO1xyXG5pbXBvcnQge0xpZ2h0aW5nR3JpZH0gZnJvbSAnLi9saWdodGluZy9saWdodGluZy1ncmlkJztcclxuaW1wb3J0IHtTd2l0Y2hib2FyZH0gZnJvbSAnLi9saWdodGluZy9zd2l0Y2hib2FyZCc7XHJcbmltcG9ydCB7c3RhbmRlZU1hbmFnZXJ9IGZyb20gJy4vc3RhbmRlZS9zdGFuZGVlLW1hbmFnZXInO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcbmltcG9ydCB7SHBPcmllbnRhdGlvbn0gZnJvbSAnLi4vZG9tYWluL2hwLW9yaWVudGF0aW9uJztcclxuaW1wb3J0IHtSb3dDbGVhckRpcmVjdGlvbn0gZnJvbSAnLi4vZG9tYWluL3Jvdy1jbGVhci1kaXJlY3Rpb24nO1xyXG5cclxuY2xhc3MgVmlldyB7XHJcblxyXG4gICAgcHJpdmF0ZSBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cclxuICAgIHByaXZhdGUgc2NlbmU6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBodW1hbkdyaWQ6IExpZ2h0aW5nR3JpZDtcclxuICAgIHByaXZhdGUgaHVtYW5Td2l0Y2hib2FyZDogU3dpdGNoYm9hcmQ7XHJcbiAgICBwcml2YXRlIGFpR3JpZDogTGlnaHRpbmdHcmlkO1xyXG4gICAgcHJpdmF0ZSBhaVN3aXRjaGJvYXJkOiBTd2l0Y2hib2FyZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xyXG5cclxuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YW50aWFsaWFzOiB0cnVlLCBjYW52YXM6IHRoaXMuY2FudmFzfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaHVtYW5HcmlkID0gbmV3IExpZ2h0aW5nR3JpZChIcE9yaWVudGF0aW9uLkRlY3JlYXNlc1JpZ2h0VG9MZWZ0LCBSb3dDbGVhckRpcmVjdGlvbi5SaWdodFRvTGVmdCk7XHJcbiAgICAgICAgdGhpcy5odW1hblN3aXRjaGJvYXJkID0gbmV3IFN3aXRjaGJvYXJkKHRoaXMuaHVtYW5HcmlkLCBQbGF5ZXJUeXBlLkh1bWFuKTtcclxuICAgICAgICB0aGlzLmFpR3JpZCA9IG5ldyBMaWdodGluZ0dyaWQoSHBPcmllbnRhdGlvbi5EZWNyZWFzZXNMZWZ0VG9SaWdodCwgUm93Q2xlYXJEaXJlY3Rpb24uTGVmdFRvUmlnaHQpO1xyXG4gICAgICAgIHRoaXMuYWlTd2l0Y2hib2FyZCA9IG5ldyBTd2l0Y2hib2FyZCh0aGlzLmFpR3JpZCwgUGxheWVyVHlwZS5BaSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5odW1hbkdyaWQuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmFpR3JpZC5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuYWlTd2l0Y2hib2FyZC5zdGFydCgpO1xyXG5cclxuICAgICAgICB0aGlzLmRvU3RhcnQoKTtcclxuXHJcbiAgICAgICAgc2t5LnN0YXJ0KCk7XHJcbiAgICAgICAgZ3JvdW5kLnN0YXJ0KCk7XHJcbiAgICAgICAgc3RhbmRlZU1hbmFnZXIuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGNhbnZhcyBzaG91bGQgaGF2ZSBiZWVuIGhpZGRlbiB1bnRpbCBzZXR1cCBpcyBjb21wbGV0ZS5cclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5vcGFjaXR5ID0gJzEnOyAgICAgIFxyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnRyYW5zaXRpb24gPSAnb3BhY2l0eSAycyc7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBza3kuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICBncm91bmQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5odW1hblN3aXRjaGJvYXJkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5odW1hbkdyaWQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5haUdyaWQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgc3RhbmRlZU1hbmFnZXIuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgY2FtZXJhV3JhcHBlci5jYW1lcmEpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9TdGFydCgpIHtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZChza3kuZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLnNjZW5lLmFkZChncm91bmQuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHN0YW5kZWVNYW5hZ2VyLmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5odW1hbkdyaWQuZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmFpR3JpZC5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5haUdyaWQuZ3JvdXAucG9zaXRpb24uc2V0WCgxMik7XHJcbiAgICAgICAgdGhpcy5haUdyaWQuZ3JvdXAucG9zaXRpb24uc2V0WigtMik7XHJcbiAgICAgICAgdGhpcy5haUdyaWQuZ3JvdXAucm90YXRpb24ueSA9IC1NYXRoLlBJIC8gMy41O1xyXG5cclxuICAgICAgICBsZXQgc3BvdExpZ2h0Q29sb3IgPSAweDk5OTllZTtcclxuICAgICAgICBsZXQgc3BvdExpZ2h0ID0gbmV3IFRIUkVFLlNwb3RMaWdodChzcG90TGlnaHRDb2xvcik7XHJcbiAgICAgICAgc3BvdExpZ2h0LnBvc2l0aW9uLnNldCgtMywgMC43NSwgMjApO1xyXG4gICAgICAgIHNwb3RMaWdodC50YXJnZXQgPSB0aGlzLmFpR3JpZC5ncm91cDtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZChzcG90TGlnaHQpO1xyXG5cclxuICAgICAgICBjYW1lcmFXcmFwcGVyLmNhbWVyYS5wb3NpdGlvbi5zZXQoNSwgMC40LCAxNSk7XHJcbiAgICAgICAgY2FtZXJhV3JhcHBlci5jYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDYsIDYuNSwgMikpO1xyXG5cclxuICAgICAgICBjYW1lcmFXcmFwcGVyLnVwZGF0ZVJlbmRlcmVyU2l6ZSh0aGlzLnJlbmRlcmVyKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjYW1lcmFXcmFwcGVyLnVwZGF0ZVJlbmRlcmVyU2l6ZSh0aGlzLnJlbmRlcmVyKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5hZGREZWJ1Z0JveCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHByaXZhdGUgYWRkRGVidWdCb3goKSB7XHJcbiAgICAvLyAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDAuNSwgMC41LCAwLjUpO1xyXG4gICAgLy8gICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtlbWlzc2l2ZTogMHhmZjAwZmZ9KTtcclxuICAgIC8vICAgICBsZXQgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAvLyAgICAgbWVzaC5wb3NpdGlvbi5zZXQoMTUuNSwgMCwgMi4wKTtcclxuICAgIC8vICAgICB0aGlzLnNjZW5lLmFkZChtZXNoKTtcclxuICAgIC8vIH1cclxufVxyXG5leHBvcnQgY29uc3QgdmlldyA9IG5ldyBWaWV3KCk7XHJcbiIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmNsYXNzIEdyb3VuZCB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIGdyYXNzOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cclxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgzMDAsIDMwMCk7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2VtaXNzaXZlOiAweDAyMWQwMywgZW1pc3NpdmVJbnRlbnNpdHk6IDEuMH0pO1xyXG4gICAgICAgIHRoaXMuZ3Jhc3MgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMuZ3Jhc3Mucm90YXRpb24ueCA9IChNYXRoLlBJICogMykgLyAyO1xyXG4gICAgICAgIHRoaXMuZ3Jhc3MucG9zaXRpb24uc2V0KDAsIDAsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuZ3Jhc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZ3JvdW5kID0gbmV3IEdyb3VuZCgpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmNvbnN0IFNUQVJUX1pfQU5HTEUgPSAtKE1hdGguUEkgLyAzMCk7XHJcbmNvbnN0IEVORF9aX0FOR0xFICAgPSAgIE1hdGguUEkgLyAzMDtcclxuY29uc3QgUk9UQVRJT05fU1BFRUQgPSAwLjAwMDU7XHJcblxyXG5jbGFzcyBTa3kge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBkb21lOiBhbnk7XHJcbiAgICBwcml2YXRlIHJkejogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDUwLCAzMiwgMzIpOyAvLyBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMTUwLCAxNTAsIDE1MCk7XHJcbiAgICAgICAgbGV0IHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmdlbmVyYXRlVGV4dHVyZSgpKTtcclxuICAgICAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe21hcDogdGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWV9KTtcclxuICAgICAgICB0aGlzLmRvbWUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMuZG9tZS5tYXRlcmlhbC5zaWRlID0gVEhSRUUuQmFja1NpZGU7XHJcbiAgICAgICAgdGhpcy5kb21lLnBvc2l0aW9uLnNldCgxMCwgMTAsIDApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuZG9tZSk7XHJcblxyXG4gICAgICAgIHRoaXMucmR6ID0gLVJPVEFUSU9OX1NQRUVEO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuZG9tZS5yb3RhdGlvbi5zZXQoMCwgMCwgU1RBUlRfWl9BTkdMRSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmRvbWUucm90YXRpb24uc2V0KDAsIDAsIHRoaXMuZG9tZS5yb3RhdGlvbi56ICsgdGhpcy5yZHopO1xyXG4gICAgICAgIGlmICh0aGlzLmRvbWUucm90YXRpb24ueiA+PSBFTkRfWl9BTkdMRSkge1xyXG4gICAgICAgICAgICB0aGlzLnJkeiA9IC1ST1RBVElPTl9TUEVFRDtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZG9tZS5yb3RhdGlvbi56IDw9IFNUQVJUX1pfQU5HTEUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZHogPSBST1RBVElPTl9TUEVFRDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlZCBvbjogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTk5OTI1MDVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVRleHR1cmUoKTogYW55IHtcclxuICAgICAgICBsZXQgc2l6ZSA9IDUxMjtcclxuICAgICAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gc2l6ZTtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gc2l6ZTtcclxuICAgICAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgY3R4LnJlY3QoMCwgMCwgc2l6ZSwgc2l6ZSk7XHJcbiAgICAgICAgbGV0IGdyYWRpZW50ID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHNpemUpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjAwLCAnIzAwMDAwMCcpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjQwLCAnIzEzMWM0NScpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjc1LCAnI2ZmOTU0NCcpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjg1LCAnIzEzMWM0NScpO1xyXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLjAwLCAnIzEzMWM0NScpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBncmFkaWVudDtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgIHJldHVybiBjYW52YXM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHNreSA9IG5ldyBTa3koKTsiXX0=
