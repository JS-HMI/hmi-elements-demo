/**
 * Default Status Codes for systemVariables, define the UI appereance and behaviour of the variable.
 * They are simple strings and can be extended with custom statuses.
 */
var VarStatusCodes;
(function (VarStatusCodes) {
    /** The variable is subscribed for receiving updates. This is the default "ALL GOOD". */
    VarStatusCodes["Subscribed"] = "SUBSCRIBED";
    /**Something went wrong in retrieving the variable serverside, like for example the variable does not exist or
     * is corrupted, in general an action by the admin must be taken to fix this. The user should not be able to
     * interact with the item. The variable is not subscribed. Its value, if any, should not be trusted.
     */
    VarStatusCodes["Error"] = "ERROR";
    /**Loading... The variable is waiting to be written or being subscribed. Usefull to show some related UI. */
    VarStatusCodes["Pending"] = "PENDING";
    /**The variable value is within some "DANGER" zone. Used to show variable related alarms. */
    VarStatusCodes["Warning"] = "WARNING";
    /**The variable is ok, but will not receive updates for some reasons, for example no network.
     * One can trust the variable value as its last updated value.*/
    VarStatusCodes["Unsubscribed"] = "UNSUBSCRIBED";
})(VarStatusCodes || (VarStatusCodes = {}));
var ServiceStatusCodes;
(function (ServiceStatusCodes) {
    /**Engine Running, all ok */
    ServiceStatusCodes["Ready"] = "READY";
    /**Engine is still down, no subscription can be made, but no error was raised. */
    ServiceStatusCodes["Down"] = "DOWN";
    /**Waiting for initialization to complete */
    ServiceStatusCodes["Warming"] = "WARMUP";
    /**Engine could not be initialized. */
    ServiceStatusCodes["Error"] = "ERROR";
})(ServiceStatusCodes || (ServiceStatusCodes = {}));
var ErrorCodes;
(function (ErrorCodes) {
    /**Variable was not found in server */
    ErrorCodes["VarNotExist"] = "VAR-NOT-EXIST";
    ErrorCodes["WontSubcribe"] = "WONT-SUB";
    ErrorCodes["CantSubcribe"] = "CANT-SUB";
    ErrorCodes["CantUnSubcribe"] = "CANT-UNSUB";
    /**Provided Write Request value has wrong type or could not be understood */
    ErrorCodes["BadValue"] = "BAD-VALUE";
    /**Network is down, cannot retrieve values */
    ErrorCodes["NoNetwork"] = "NO-NETWORK";
    ErrorCodes["NetError"] = "NET-ERROR";
    /**Action cannot be performed, user has no rights. */
    ErrorCodes["Unauthorized"] = "UNAUTHORIZED";
    /**HTTP 400 error on request */
    ErrorCodes["BadReq"] = "BAD-REQUEST";
    /**Serverside bug? HTTP 500*/
    ErrorCodes["ServerError"] = "SERVER-ERROR";
    /**Return from a HTTP 404 */
    ErrorCodes["NotFound"] = "NOT-FOUND";
    ErrorCodes["BadData"] = "BAD-DATA";
    ErrorCodes["EngineNotExist"] = "NO-ENGINE";
    ErrorCodes["UnknownError"] = "UKNOWN";
})(ErrorCodes || (ErrorCodes = {}));
var Actions;
(function (Actions) {
    Actions["Write"] = "WRITE";
    Actions["Read"] = "READ";
    Actions["Subscribe"] = "SUBSCRIBE";
    Actions["Unsubscribe"] = "UNSUBSCRIBE";
    Actions["Update"] = "UPDATE";
    Actions["Init"] = "INITIALIZE";
    Actions["Unknown"] = "UNKNOWN";
})(Actions || (Actions = {}));
/**
 * Describe a system error occurred during a requested Action (like subscribe, write, etc.).
 * @prop {string}  code - Error code as defined in ErrorCodes
 * @prop {string}  message  - The error message (this by default will auto build itself), but you can override it.
 * @prop {string}  systemName  - System name
 * @prop {string}  targetName  - Target of the Action that generated the error, for example the caller of a write method.
 * @prop {string}  action      - Action Code as defined in "Actions", what was going to be performed.
 * @prop {number}  timestamp_ms - Time the error occurred, by default is Date.Now()
 * @prop {boolean} ack          - If the error was acknowledged by user or not.
 */
class systemError {
    /**
     * Standard constructor, by default will auto-build the error message and will set timestamp to Now.
     * @param sysName System name for example an engine name
     * @param Code Error code as in "ErrorCodes"
     * @param target (optional) name of who is in fault, like for example a variable name.
     * @param Action (optional) Action Code of what was going to be performed.
     */
    constructor(sysName, Code, target = "", Action = "") {
        // if(!(err && typeof err.code === "string")) throw TypeError("Err must be valid and of 'basicError' type: {code:string,message?:string}");
        if (typeof Code !== "string")
            throw TypeError("Code must be a string");
        if (typeof sysName !== "string")
            throw TypeError("sysName must be a string");
        //this.code = err.code;
        this.code = Code;
        this.timestamp_ms = Date.now();
        this.systemName = sysName;
        this.action = Action || "";
        this.targetName = target || "";
        this.ack = false;
        //this.message = err.message ? err.message : this.buildDefaultMessage();
        this.message = this.buildDefaultMessage();
    }
    buildDefaultMessage() {
        let message = `Error in system (${this.systemName})`;
        if (this.action !== "")
            message += ` during ${this.action}`;
        if (this.targetName !== "")
            message += ` on target (${this.targetName})`;
        message += `. Error Code: ${this.code}.`;
        return message;
    }
}
/**
 * Defines a generic variable bound to a specific system.
 * The "value" must be a JSON compatible object, since these values are
 * persisted in localstorage. So anything is good but functions.
 */
class systemVariable {
    // [key:string] : any 
    constructor(sys_obj) {
        this.system = sys_obj.system;
        this.name = sys_obj.name;
        this.value = null;
        this.status = null;
    }
}
/**
 * Class that implemets a general response to actions that involve variable read, write, subscribe, etc.
 * @prop {boolean} success  - weather the request had success or not
 * @prop {object}  error  - if success is false then this must not be null, contain error code and error message(optional).
 * @prop {string} name - name of the variable.
 * @prop {string}  system  -  system name related to the variable.
 * @prop {any}  value  -  the value of the variable (can be an object if supported).
 * @method setError - helper to set the "error" property.
 */
class VarResponse {
    constructor(Success, _name, _system, _value = null) {
        this.error = null;
        this.success = Success;
        this.name = _name;
        this.value = _value;
        this.system = _system;
    }
    setError(ErrorCode, Message = "") {
        this.error = {
            code: ErrorCode,
            message: Message
        };
    }
}

/*MIT License

OnChange:  Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> , with major improvement by Rodrigo Solís (https://github.com/sorodrigo)
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var onChangeProxy = (object, onChange) => {
    const BLACKLIST = [
        'sort',
        'reverse',
        'splice',
        'pop',
        'unshift',
        'shift',
        'push'
    ];
    let blocked = false;
    const handler = {
        get(target, property, receiver) {
            try {
                if (property === "prototype")
                    return Reflect.get(target, property, receiver);
                else
                    return new Proxy(target[property], handler);
            }
            catch (err) {
                return Reflect.get(target, property, receiver);
            }
        },
        defineProperty(target, property, descriptor) {
            const res = Reflect.defineProperty(target, property, descriptor);
            if (!blocked) {
                onChange();
            }
            return res;
        },
        deleteProperty(target, property) {
            const res = Reflect.deleteProperty(target, property);
            if (!blocked) {
                onChange();
            }
            return res;
        },
        apply(target, thisArg, argumentsList) {
            if (BLACKLIST.includes(target.name)) {
                blocked = true;
                const res = Reflect.apply(target, thisArg, argumentsList);
                onChange();
                blocked = false;
                return res;
            }
            return Reflect.apply(target, thisArg, argumentsList);
        }
    };
    return new Proxy(object, handler);
};
// --------------------------------------- FINISHED onChange ------------------------------------------------------------------ //

var _isCallback_locked = false;
var _under_transition = false;
const _transitions_callbackMap = new Map();
class BaseState {
    constructor(NAME) {
        this.name = NAME;
        this.callbackMap = new Map();
        if (typeof (this.name) !== "string")
            throw Error("Variable name must be a string.");
    }
    lock_callbacks() {
        if (_isCallback_locked) {
            this.unlock_callbacks();
            throw Error('Forbidden multiple-update during an update callback loop.');
        }
        else
            _isCallback_locked = true;
    }
    unlock_callbacks() {
        _isCallback_locked = false;
    }
    _call_watchers(input) {
        for (let update_callback of this.callbackMap.values()) {
            if (input === undefined)
                update_callback();
            else
                update_callback(input);
        }
    }
    /**
     * Attach a callback to be fired when this stateVariable (or Transition) changes (is dispatched).
     * @param target Element that holds the callback
     * @param callback the callback function needs to be bound to the element if using **this**
     */
    attachWatcher(target, callback) {
        if (target === null || target === undefined)
            throw Error("Target is undefined.");
        // add element to the watcher list
        this.callbackMap.set(target, callback);
    }
    /**
     * Removes the element from the watcher list
     * @param target element to be removed
     */
    detachWatcher(target) {
        if (target === null || target === undefined)
            throw Error("Target is undefined.");
        // remove element from watcher list
        this.callbackMap.delete(target);
    }
}
/**
 * A stateTransition is a global function that is meant to apply simultaneously an overall state change,
 * this can be made of just one variable change or multiple stateVariables changes at the same time, so that the initial and final
 * states are always well defined, it guarantees that UI updates are made at transition completion (final state) only.
 */
class StateTransition extends BaseState {
    constructor(NAME, func) {
        super(NAME);
        if (typeof func === "function")
            this.usrDefined_transition = func;
    }
    /**
     * User defined transition to be overwritten.
     * @param input Any meaningfull data.
     */
    usrDefined_transition(input) { }
    /**
     * Fires the user defined transition and calls the callbacks of all watchers.
     * @param input data to be passed to the user defined transition
     */
    applyTransition(input) {
        this.lock_callbacks();
        try {
            _under_transition = true;
            this.usrDefined_transition(input);
            _under_transition = false;
            // loop over watchers callbacks of the StateTransition
            this._call_watchers(input);
            // loop over automatically added StateVariable callbacks to _transitions_callbackMap
            for (let upd_callback of _transitions_callbackMap.values()) {
                upd_callback();
            }
        }
        catch (e) {
            _transitions_callbackMap.clear();
            this.unlock_callbacks();
            throw new Error(e.message);
        }
        _transitions_callbackMap.clear();
        this.unlock_callbacks();
    }
}
/**
 * A StateVariable hold the state of the App, its content can be a String, Object, Number and Boolean. Its **DEFAULT**
 * value is passed at creation time and defines the type of the variable, the type cannot be changed later.
 * A StateVariable is automatically stored in **localStorage**.
 * @param  value - Returns a proxy to the content of the stateVariable, whenever it is set (directly or indirectly using Array.push
 * for example) will run the callback for all watchers.Proxy to the content of stateVariable
 * @param  allowStandaloneAssign - Enable/Disable assignment outside of a stateTransition (default true)
 */
class StateVariable extends BaseState {
    constructor(NAME, DEFAULT) {
        super(NAME);
        this.type = typeof (DEFAULT);
        this.default_val = DEFAULT;
        this._err_on_value = 'Wrong type assignment to state variable: ' + this.name;
        this._valueProxy = undefined;
        this._auto_valueProxy = undefined;
        this.allowStandaloneAssign = true;
        this.transitionMap = new Map();
        // Sanity checks
        let white_list_types = ["string", "object", "number", "boolean"];
        if (!white_list_types.includes(this.type))
            throw TypeError(this._err_on_value);
        // set default variable if none
        this._val = this.GET() || this.CREATE(this.default_val);
        // proxy
        this._set_proxies();
    }
    _set_proxies() {
        if (this.type === "object" && typeof (this._val) === "object") {
            this._valueProxy = onChangeProxy(this._val, this.updateWatcherIfAllowed.bind(this));
            this._auto_valueProxy = onChangeProxy(this._val, this._markForWatchersUpdate.bind(this));
        }
    }
    set value(val) {
        this._checkIsAllowed();
        this._val = val;
        this._set_proxies();
        if (_under_transition)
            this._markForWatchersUpdate();
        else
            this.updateWatchers();
    }
    get value() {
        if (_under_transition)
            return (this.type === "object") ? this._auto_valueProxy : this._val;
        else
            return (this.type === "object") ? this._valueProxy : this._val;
    }
    CREATE(me) {
        if (typeof (me) === this.type) {
            let push_var = (this.type !== 'string') ? JSON.stringify(me) : me;
            localStorage.setItem(this.name, push_var);
        }
        else
            throw TypeError(this._err_on_value);
        return me;
    }
    UPDATE_DATA() {
        if (typeof (this._val) === this.type) {
            let push_var = (this.type !== 'string') ? JSON.stringify(this._val) : this._val;
            localStorage.setItem(this.name, push_var);
        }
        else {
            if (_under_transition)
                _under_transition = false;
            if (_isCallback_locked)
                this.unlock_callbacks();
            throw TypeError(this._err_on_value);
        }
    }
    RESET() {
        this.value = this.default_val;
    }
    GET() {
        let return_val = localStorage.getItem(this.name);
        if (return_val === null)
            return return_val;
        if (this.type !== 'string') {
            return_val = JSON.parse(return_val);
            if (typeof (return_val) !== this.type)
                throw TypeError("State variable: " + this.name + " is corrupted, returns type " + typeof (return_val) + " expecting " + this.type);
        }
        return return_val;
    }
    _markForWatchersUpdate() {
        this.UPDATE_DATA();
        _transitions_callbackMap.set(this, this._call_watchers.bind(this));
    }
    _checkIsAllowed() {
        if (!this.allowStandaloneAssign && !_under_transition) {
            if (_under_transition)
                _under_transition = false;
            throw "StateVariable " + this.name + " is not allowed assignment outside a state transition";
        }
    }
    updateWatcherIfAllowed() {
        this._checkIsAllowed();
        this.updateWatchers();
    }
    updateWatchers() {
        this.lock_callbacks();
        try {
            this.UPDATE_DATA();
            // loop over watchers callbacks
            this._call_watchers();
        }
        catch (e) {
            // make sure to unlock in case of error
            this.unlock_callbacks();
            throw new Error(e.message);
        }
        this.unlock_callbacks();
    }
    /**
     * Add a transition to this stateVariable, after that the variable can only be changed trough defined stateTransition.
     * @param name Used to identify the transition
     * @param func Definition of the variable update, **this** is bound to the variable.
     */
    addTransition(name, func) {
        let t = new StateTransition(name);
        if (typeof (func) === "function") {
            t.usrDefined_transition = func.bind(this);
            this.transitionMap.set(name, t);
            this.allowStandaloneAssign = false;
        }
    }
    /**
     * Fires one of the user defined transition related to this stateVariable.
     * @param name Identifier of the transition.
     * @param input Payload to be passed to the transition, if any.
     */
    applyTransition(name, input) {
        if (this.transitionMap.has(name))
            this.transitionMap.get(name).applyTransition(input);
        else
            throw Error(`Transition ${name} not found`);
    }
}
/**
 * A Message does not change the state of the app and is not persisted in any way, it used to exchange payloads between custom-elements.
 * A custom-element can listen for a specific message, retrieve its payload and fire a callback when this happens.
 */
class Message extends BaseState {
    sendMessage(input) {
        this._call_watchers(input);
    }
}
let baseMixin = (listOfComponents, baseClass) => class extends baseClass {
    constructor() {
        super();
        this._transitionMap = new Map();
        this._messageMap = new Map();
        this._extractTransitions();
        this._addGetterSetters();
    }
    _extractTransitions() {
        for (let itr = 0; itr < listOfComponents.length; itr++) {
            let comp = listOfComponents[itr];
            if (comp instanceof StateVariable) {
                for (let t of comp.transitionMap.values()) {
                    listOfComponents.push(t);
                }
            }
        }
    }
    applyTransition(name, input) {
        if (this._transitionMap.has(name))
            this._transitionMap.get(name)(input);
        else
            throw Error(`Transition ${name} not found`);
    }
    sendMessageOnChannel(name, payload) {
        if (this._messageMap.has(name))
            this._messageMap.get(name)(payload);
        else
            throw Error(`Message channel ${name} not found`);
    }
    _addGetterSetters() {
        for (let state_comp of listOfComponents) {
            if (state_comp instanceof StateVariable) {
                // adding proxy
                if (state_comp.type === "object")
                    this[`_${state_comp.name}Proxy`] = onChangeProxy(state_comp._val, () => { throw `${state_comp.name} cannot be assigned from a custom element`; });
                Object.defineProperty(this, state_comp.name, {
                    set: (val) => {
                        throw `${state_comp.name} cannot be assigned from a custom element`;
                    },
                    get: () => { return (state_comp.type === "object") ? this[`_${state_comp.name}Proxy`] : state_comp._val; }
                });
            }
            else if (state_comp instanceof Message) {
                this._messageMap.set(state_comp.name, state_comp.sendMessage.bind(state_comp));
            }
            else if (state_comp instanceof StateTransition) {
                this._transitionMap.set(state_comp.name, state_comp.applyTransition.bind(state_comp));
            }
            else {
                throw TypeError("Accept only StateVariable, StateTransition or Message.");
            }
        }
    }
    disconnectedCallback() {
        if (super['disconnectedCallback'] !== undefined) {
            super.disconnectedCallback();
        }
        for (let state_comp of listOfComponents) {
            //@ts-ignore
            state_comp.detachWatcher(this);
        }
    }
};
/**
 * This is a mixin to be applied to Lit-Element web-components. For any stateVariables in the list will add a read-only property
 * to the element named as the stateVariable. It will add an **applyTransition** method to dispatch the added
 * transition (either of a stateVariable or of a global stateTransition). For each change of a stateVariable or dispatch of
 * any of the stateTransition a render request is called. A hook function is added for each stateVariable with name **'on_VarName_update'**,
 * if this function is defined by the user then it will be run before the render.
 * For any **Message** in the list it will add a **gotMessage_"messageName"** method to react
 * to message exchange, this method passes as input the message payload.
 * @param listOfComponents is a list of StateVariables and StateTransition to add to the web-component
 * @param baseClass The class on which the mixin is applied
 */
let litStatesMixin = (listOfComponents, baseClass) => class extends baseMixin(listOfComponents, baseClass) {
    connectedCallback() {
        if (super['connectedCallback'] !== undefined) {
            super.connectedCallback();
        }
        for (let state_comp of listOfComponents) {
            if (state_comp instanceof Message) {
                if (this[`gotMessage_${state_comp.name}`])
                    //@ts-ignore
                    state_comp.attachWatcher(this, this[`gotMessage_${state_comp.name}`].bind(this));
            }
            else {
                //@ts-ignore
                state_comp.attachWatcher(this, this._stateRequestUpdate(state_comp.name).bind(this));
            }
        }
    }
    _stateRequestUpdate(varName) {
        return function () {
            if (this[`on_${varName}_update`])
                this[`on_${varName}_update`]();
            this.requestUpdate();
        };
    }
};

/**
 * Copyright (C) 2017-present by Andrea Giammarchi - @WebReflection
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const {replace} = '';
const ca = /[&<>'"]/g;

const esca = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};
const pe = m => esca[m];

const escape = es => replace.call(es, ca, pe);

// NOTE:
// There are plenty of way of doing this, here we chose to have a single 
// object representing the whole App state. If one have many var and many
// subsystems it can be heavy to write in localstorage all the time. It 
// could be more efficient if split instead per subsystem (or even per 
// single variables), to do so Impera-JS needs the additional capability 
// of attaching a stateVar to an already instantiated object, without using 
// a mixin. See issue: https://github.com/WebComponentHelpers/ImperaJS/issues/8
/**
 * Class that contains all the variable of the App for all the subsystem.
 * It is connected automatically to UI element and schedule updates on them.
 */
class DataTree extends StateVariable {
    constructor() {
        super("datatree", {});
        this.addTransition("create", this._create);
        this.addTransition("update", this._update);
        this.addTransition("multiupdate", this._multiupdate);
    }
    /**
     * Get the current value and status of the related stateVariable.
     * It returns a proxy to the real stateVariable, this is readonly, as a protection
     * it will throw if you try to assign a value.
     * @param varID identifier of the variable, an object with {name,system}
     */
    GetVar(varID) {
        if (this.ExistVar(varID)) {
            return this.value[varID.system][varID.name];
        }
        else
            return null;
    }
    Create(varID) {
        this.applyTransition("create", varID);
    }
    UpdateStatus(varID, _status) {
        let upd_var = new systemVariable(varID);
        upd_var.status = _status;
        this.applyTransition("update", upd_var);
    }
    /**
     * It upadtes with the variable or the list of variables.
     * This will automatically call UI update of all connected elements.
     * @param variables a list or a single systemVariable object {name,system,status,value}
     */
    Update(variables) {
        if (Array.isArray(variables)) {
            this.applyTransition("multiupdate", variables);
        }
        else {
            this.applyTransition("update", variables);
        }
    }
    _create(varID) {
        if (varID && typeof varID.system === "string" && typeof varID.name === "string") {
            varID.system = escape(varID.system);
            varID.name = escape(varID.name);
            let new_var = { status: null, value: null }; //new systemVariable(varID.name, varID.system);
            new_var.status = VarStatusCodes.Pending;
            if (!this.value.hasOwnProperty(varID.system))
                this.value[varID.system] = {};
            this.value[varID.system][varID.name] = new_var;
        }
    }
    _multiupdate(sys_vars) {
        sys_vars.forEach(input_var => {
            this._update(input_var);
        });
    }
    _update(varID) {
        this._checkVarType(varID);
        let sys_var = this.GetVar(varID);
        if (!sys_var)
            throw new Error("Requested Variable does not exist: " + varID.name);
        if (typeof varID.value === 'string')
            varID.value = escape(varID.value);
        if (varID.status)
            sys_var.status = escape(varID.status);
        // carefull here as value can also be false for a boolean, so if(varID.value) does not work
        if (varID.value !== null && varID.value !== undefined)
            sys_var.value = varID.value;
    }
    _checkVarType(v) {
        if (!v)
            throw new TypeError("Variable cannot be null");
        if (typeof v.name !== "string")
            throw new TypeError("Variable Name must be a string");
    }
    /**
     * Checks if the variable exist in the current state tree
     * @param varID identifier of the variable, an object with {name,system}
     */
    ExistVar(varID) {
        if (typeof varID.system !== "string" && typeof varID.name !== "string")
            return false;
        if (!this.value.hasOwnProperty(varID.system))
            return false;
        if (!this.value[varID.system].hasOwnProperty(varID.name))
            return false;
        return true;
    }
}

class ErrorTray extends StateVariable {
    constructor(name) {
        super(name, []);
        this.errorExpiry_days = 7;
        this.addTransition("create", this._create);
        this.addTransition("ack", this._ack);
        this.addTransition("clean", this._cleanup);
        this.swipe_interval_ID = window.setInterval(() => { this.applyTransition("clean"); }, 10000);
    }
    GetAll() {
        return this.value;
    }
    setSwipeInterval(interval_ms) {
        clearInterval(this.swipe_interval_ID);
        this.swipe_interval_ID = window.setInterval(() => { this.applyTransition("clean"); }, interval_ms);
    }
    Create(error) {
        if (!(error instanceof systemError))
            throw TypeError("input must be a 'systemError' instance.");
        this.applyTransition("create", error);
    }
    _create(error) {
        let err = {
            code: escape(error.code),
            message: escape(error.message),
            systemName: escape(error.systemName),
            targetName: escape(error.targetName),
            action: escape(error.action),
            timestamp_ms: error.timestamp_ms,
            ack: error.ack
        };
        this.value.push(err);
    }
    Acknoweldge(ID) {
        this.applyTransition("ack", ID);
    }
    _ack(ID) {
        let idx = this.value[ID];
        if (!idx)
            throw Error(`Error ID '${ID}' does not exist`);
        idx.ack = true;
    }
    GetUnack() {
        return this.value.filter((err) => { return !err.ack; });
    }
    CleanAll() {
        this.applyTransition("clean", true);
    }
    _cleanup(cleanAll) {
        if (this.value.lenght === 0)
            return;
        if (cleanAll) {
            this.value = [];
            return;
        }
        let day_in_ms = 86400000;
        let filtered_errors = this.value.filter((err) => {
            return (err.timestamp_ms + day_in_ms * this.errorExpiry_days) > Date.now();
        });
        if (filtered_errors.length < this.value.length)
            this.value = filtered_errors;
    }
}

class ServiceManager {
    constructor() {
        this.dataTree = new DataTree();
        this.errorTray = new ErrorTray("errortray");
        this.dataEngines = new Map();
        this.status = ServiceStatusCodes.Down;
        this._initPromise = new Promise((resolve) => {
            this._initResolve = resolve;
        });
        this._defaultEngine = null;
    }
    /**
     *
     * @param subsystemName
     * @param engine
     */
    AddEngine(engine) {
        let subsystemName = escape(engine.name);
        this.dataEngines.set(subsystemName, engine);
        if (this._defaultEngine === null)
            this._defaultEngine = engine;
    }
    SetDefeultEngine(engine) {
        if (!this.dataEngines.has(engine.name))
            this.AddEngine(engine);
        this._defaultEngine = engine;
    }
    GetEngine(engine_name) {
        if (typeof engine_name !== "string")
            throw Error("Engine Name must be a string");
        if (engine_name.toLocaleLowerCase() === "default")
            return this._defaultEngine;
        else
            return this.dataEngines.get(engine_name);
    }
    async Subscribe(engine_name, target) {
        if (typeof target.name !== "string" || typeof target.system !== "string")
            throw Error("CANNOT SUBSCRIBE variable " + target.name);
        await this.isInitialized();
        target.name = escape(target.name);
        target.system = escape(target.system);
        let engine = this.GetEngine(engine_name);
        if (engine) {
            if (this.dataTree.ExistVar(target)) {
                if (!engine.isVarSubscribed(target) && this.dataTree.GetVar(target).status !== VarStatusCodes.Pending) // var exist from localstorage but not yet subscribed
                    this.dataTree.UpdateStatus(target, VarStatusCodes.Pending);
            }
            else
                this.dataTree.Create(target);
            engine.RequestSubscription(target);
        }
        else {
            this.dataTree.Create(target);
            this.dataTree.UpdateStatus(target, VarStatusCodes.Error);
            this.CreateAndDispatchError(target.system, ErrorCodes.EngineNotExist, "", Actions.Subscribe);
            throw new Error(`Engine '${engine_name}' does not exist.`);
        }
    }
    async Unsubscribe(engine_name, target) {
        if (typeof target.name !== "string" || typeof target.system !== "string")
            throw Error("CANNOT UNSUBSCRIBE variable " + target.name);
        await this.isInitialized();
        let engine = this.GetEngine(engine_name);
        if (engine) {
            engine.RequestUnsubscription(target);
        }
        else {
            this.CreateAndDispatchError(target.system, ErrorCodes.EngineNotExist, "", Actions.Unsubscribe);
            throw new Error(`Engine '${engine_name}' does not exist.`);
        }
    }
    Update(data) {
        this.dataTree.Update(data);
    }
    async Read(engine_name, vars) {
        if (typeof vars !== "object")
            throw new TypeError("'system' must be a string and 'vars' an array of strings");
        await this.isInitialized();
        let engine = this.GetEngine(engine_name);
        if (engine) {
            let resp = await engine.Read(vars);
            // Maybe here we need something like STATUS OK - if was in error it is not clear that it would be subscribed
            // see issue https://github.com/JaS-HMI/jashmi/issues/2
            engine.UpdateVars(resp, VarStatusCodes.Subscribed, Actions.Read);
            return resp;
        }
        else {
            this.CreateAndDispatchError(engine_name, ErrorCodes.EngineNotExist, "", Actions.Read);
            throw new Error(`Engine '${engine_name}' does not exist.`);
        }
    }
    async Write(engine_name, vars, values) {
        if (typeof vars !== "object" ||
            typeof values !== "object")
            throw new TypeError("'system' must be a string and 'vars' and values cannot be null");
        await this.isInitialized();
        let engine = this.GetEngine(engine_name);
        if (engine) {
            let sys_vars = vars.map(v => { let x = new systemVariable(v); x.status = VarStatusCodes.Pending; return x; });
            this.dataTree.Update(sys_vars);
            let resp = await engine.Write(vars, values);
            // Maybe here we need something like STATUS OK - if was in error it is not clear that it would be subscribed
            // see issue https://github.com/JaS-HMI/jashmi/issues/2
            engine.UpdateVars(resp, VarStatusCodes.Subscribed, Actions.Write);
            return resp;
        }
        else {
            this.CreateAndDispatchError(engine_name, ErrorCodes.EngineNotExist, "", Actions.Write);
            throw new Error(`Engine '${engine_name}' does not exist.`);
        }
    }
    DispatchError(error) {
        this.errorTray.Create(error);
    }
    CreateAndDispatchError(system, code, target = "", action = "") {
        let error = new systemError(system, code, target, action);
        this.DispatchError(error);
    }
    async Init() {
        // signal that all the engines are added, can start 
        // adding variables to subscription list
        this._initResolve();
        this.status = ServiceStatusCodes.Warming;
        let proms = [];
        Array.from(this.dataEngines.values()).forEach(engine => proms.push(engine._init()));
        await Promise.all(proms);
        this.status = ServiceStatusCodes.Ready;
    }
    isInitialized() {
        return this._initPromise;
    }
}
// A bit ugly, but we must have a data instance that is shared 
// automatically between the ui-elements
var Manager = new ServiceManager();

/**Abstract class defining a Comunication Engine for data I/O with a server.*/
class DataCommsEngine {
    constructor(EngineName) {
        this.manager = Manager;
        this.status = ServiceStatusCodes.Down;
        /**
         * Variables waiting to be subscribed for updates. It is a key-number map.
         * The number represent how many UI element times requested updates from that variable.
         * Variables are purged once subscribed. If subscription fails with "NO-NET"
         * or "CANT-SUB" error the var is kept for later subscription,
         * if fails with "WONT-SUB" or "NOT-EXIST" it will be purged from list.
        */
        this.toBeSubscribed = new Map();
        /**
         * List of Variables waiting to be unsubscribed from updates.
         */
        this.toBeUnsubscribed = new Set();
        /**
         * List of Variables currently subscribed for updates. It is a key-number map.
         * The number represent the number of UI-elements registered with the same variable,
         * usually one, but for special cases could be more.
         */
        this.subscribedVar = new Map();
        this.sub_timerID = null;
        this.unsub_timerID = null;
        /**
         * Time the system will wait before sending subscruiption/unsubscription, so that variable
         * can be aggregated and make moreefficient network calls.
         */
        this.aggregationTime_ms = 10;
        this.name = EngineName || "DataEngine";
        this.VarDispatchErrorCases = [
            ErrorCodes.VarNotExist, ErrorCodes.WontSubcribe, ErrorCodes.Unauthorized,
            ErrorCodes.UnknownError, ErrorCodes.CantUnSubcribe
        ];
        this.VarErrorNoActCases = [ErrorCodes.BadValue, ErrorCodes.CantUnSubcribe,
            ErrorCodes.Unauthorized];
        this.VarErrorUnsubCases = [ErrorCodes.CantSubcribe, ErrorCodes.NoNetwork];
    }
    serializeSysObject(target) {
        if (typeof target.name !== "string" || target.name.includes(":") ||
            typeof target.system !== "string" || target.system.includes(":"))
            return null;
        return (target.system + ":" + target.name);
    }
    deserializeSysObject(target) {
        let tmp = target.split(":");
        if (tmp.length !== 2)
            return null;
        return { system: tmp[0], name: tmp[1] };
    }
    RequestSubscription(target) {
        let ser_obj = this.serializeSysObject(target);
        if (ser_obj === null)
            throw Error("CANNOT SUBSCRIBE variable " + target.name);
        if (this.subscribedVar.has(ser_obj)) {
            // case already subscribed, just bump the number of subscribed var
            let idx = this.subscribedVar.get(ser_obj);
            this.subscribedVar.set(ser_obj, idx + 1);
            return;
        }
        let count = this.toBeSubscribed.get(ser_obj) || 0;
        this.toBeSubscribed.set(ser_obj, count + 1);
        // this case just fill the subscribelist,willbe submitted after init
        if (this.status === ServiceStatusCodes.Down ||
            this.status === ServiceStatusCodes.Warming)
            return;
        if (this.sub_timerID)
            clearTimeout(this.sub_timerID);
        this.sub_timerID = window.setTimeout(this._subcribe.bind(this), this.aggregationTime_ms);
    }
    RequestUnsubscription(target) {
        let ser_obj = this.serializeSysObject(target);
        if (ser_obj === null || !this.subscribedVar.has(ser_obj))
            throw Error("CANNOT UNSUBSCRIBE variable " + target.name);
        let count = this.subscribedVar.get(ser_obj);
        if (count > 1) {
            // the variable needs to remain subscribed untill there 
            // are related UI element connected
            this.subscribedVar.set(ser_obj, count - 1);
            return;
        }
        this.toBeUnsubscribed.add(ser_obj);
        if (this.unsub_timerID)
            clearTimeout(this.unsub_timerID);
        this.unsub_timerID = window.setTimeout(this._unsubcribe.bind(this), this.aggregationTime_ms);
    }
    async _subcribe() {
        let targets = Array.from(this.toBeSubscribed.keys()).map(t => this.deserializeSysObject(t));
        let response = await this.Subscribe(targets);
        this.updateSubscriberLists(response);
        this.UpdateVars(response, VarStatusCodes.Subscribed, Actions.Subscribe);
    }
    updateSubscriberLists(response) {
        for (let rsp of response) {
            let var_id = this.serializeSysObject(rsp);
            if (rsp.success) {
                let count = this.toBeSubscribed.get(var_id);
                count += (this.subscribedVar.get(var_id) || 0);
                this.subscribedVar.set(var_id, count);
                this.toBeSubscribed.delete(var_id);
            }
            else {
                let code = rsp.error ? rsp.error.code : ErrorCodes.UnknownError;
                // keep in list for next try later in case of these errors
                if (code !== ErrorCodes.NoNetwork && code !== ErrorCodes.CantSubcribe)
                    this.toBeSubscribed.delete(var_id);
            }
        }
    }
    isVarSubscribed(varID) {
        let id = this.serializeSysObject(varID);
        return this.subscribedVar.has(id);
    }
    UpdateVars(response, ok_status, action = "") {
        let var_upd = [];
        for (let rsp of response) {
            let var_idx = new systemVariable(rsp);
            if (rsp.success) {
                var_idx.status = ok_status;
                if (rsp.value !== null && rsp.value !== undefined)
                    var_idx.value = rsp.value;
            }
            else {
                let code = rsp.error ? rsp.error.code : ErrorCodes.UnknownError;
                if (this.VarDispatchErrorCases.includes(code))
                    this.manager.CreateAndDispatchError(rsp.system, code, rsp.name, action);
                if (this.VarErrorUnsubCases.includes(code))
                    var_idx.status = VarStatusCodes.Unsubscribed;
                else if (this.VarErrorNoActCases.includes(code)) // no modify status, unless is "pending"
                 {
                    let _var = this.manager.dataTree.GetVar(rsp);
                    var_idx.status = _var.status === VarStatusCodes.Pending ? VarStatusCodes.Subscribed : null;
                }
                else
                    var_idx.status = VarStatusCodes.Error;
            }
            var_upd.push(var_idx);
        }
        this.manager.Update(var_upd);
    }
    async _unsubcribe() {
        let targets = Array.from(this.toBeUnsubscribed).map(t => this.deserializeSysObject(t));
        let response = await this.Unsubscribe(targets);
        for (let rsp of response) {
            let var_id = this.serializeSysObject(rsp);
            if (rsp.success)
                this.subscribedVar.delete(var_id);
            this.toBeUnsubscribed.delete(var_id);
        }
        this.UpdateVars(response, VarStatusCodes.Unsubscribed, Actions.Unsubscribe);
    }
    async _init() {
        this.status = ServiceStatusCodes.Warming;
        let resp = await this.Initialize();
        if (resp.success)
            this.status = ServiceStatusCodes.Ready;
        else {
            this.status = ServiceStatusCodes.Error;
            let code = resp.error ? resp.error.code : ErrorCodes.UnknownError;
            let err = new systemError(this.name, code, this.name, Actions.Init);
            this.manager.DispatchError(err);
        }
        if (this.toBeSubscribed.size > 0)
            this._subcribe();
    }
    /**
     * Action Update. It updates a list of variable values and statuses in the DataManager.
     * The updates will be automatically dispatched to all UI component connected to those variables.
     * @param data A list of variable updates, properties (like status or value) that are null will not be updated.
     */
    UpdateData(data) {
        this.manager.Update(data);
    }
}

class fakeDataEngine extends DataCommsEngine {
    constructor() {
        super(...arguments);
        this.var_types = new Map();
    }
    async Initialize() {
        // setInterval(this._updateVariables.bind(this), 2000);
        return { success: true };
    }
    _updateVariables() {
        let resp = [];
        this.var_types.forEach((val, key) => {
            if (val === "number") {
                let upd = Math.floor(Math.random() * 100);
                resp.push(new VarResponse(true, key, "default", upd));
            }
        });
        if (resp.length !== 0)
            this.UpdateVars(resp, VarStatusCodes.Subscribed, Actions.Read);
    }
    async Subscribe(variables) {
        let resp = [];
        variables.forEach(v => {
            let el = document.querySelector(`[name="${v.name}"]`);
            if (typeof v.name !== "string" || v.name === "" || el === null) {
                resp.push(new VarResponse(false, v.name, v.system));
                return;
            }
            // remember last value
            if (this.manager.dataTree.GetVar(v).value !== null) {
                resp.push(new VarResponse(true, v.name, v.system));
                return;
            }
            let val = 0;
            if (el.tagName.toLowerCase().includes("bool")) {
                val = (Math.random() > 0.5) ? true : false;
                this.var_types.set(v.name, "bool");
            }
            else {
                val = Math.floor(Math.random() * 100);
                this.var_types.set(v.name, "number");
            }
            resp.push(new VarResponse(true, v.name, v.system, val));
        });
        return resp;
    }
    async Unsubscribe(variables) {
        return variables.map(v => new VarResponse(true, v.name, v.system));
    }
    async Write(targets, values) {
        let resp = [];
        for (let i = 0; i < targets.length; i++) {
            resp.push(new VarResponse(true, targets[i].name, targets[i].system, values[i]));
        }
        return resp;
    }
    async Read(targets) {
        throw new Error("Method not implemented.");
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * True if the custom elements polyfill is in use.
 */
const isCEPolyfill = typeof window !== 'undefined' &&
    window.customElements != null &&
    window.customElements.polyfillWrapFlushCallback !==
        undefined;
/**
 * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
 * `container`.
 */
const removeNodes = (container, start, end = null) => {
    while (start !== end) {
        const n = start.nextSibling;
        container.removeChild(start);
        start = n;
    }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * An expression marker used text-positions, multi-binding attributes, and
 * attributes with markup-like text values.
 */
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * Suffix appended to all bound attribute names.
 */
const boundAttributeSuffix = '$lit$';
/**
 * An updatable Template that tracks the location of dynamic parts.
 */
class Template {
    constructor(result, element) {
        this.parts = [];
        this.element = element;
        const nodesToRemove = [];
        const stack = [];
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(element.content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        // Keeps track of the last index associated with a part. We try to delete
        // unnecessary nodes, but we never want to associate two different parts
        // to the same index. They must have a constant node between.
        let lastPartIndex = 0;
        let index = -1;
        let partIndex = 0;
        const { strings, values: { length } } = result;
        while (partIndex < length) {
            const node = walker.nextNode();
            if (node === null) {
                // We've exhausted the content inside a nested template element.
                // Because we still have parts (the outer for-loop), we know:
                // - There is a template in the stack
                // - The walker will find a nextNode outside the template
                walker.currentNode = stack.pop();
                continue;
            }
            index++;
            if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                if (node.hasAttributes()) {
                    const attributes = node.attributes;
                    const { length } = attributes;
                    // Per
                    // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                    // attributes are not guaranteed to be returned in document order.
                    // In particular, Edge/IE can return them out of order, so we cannot
                    // assume a correspondence between part index and attribute index.
                    let count = 0;
                    for (let i = 0; i < length; i++) {
                        if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                            count++;
                        }
                    }
                    while (count-- > 0) {
                        // Get the template literal section leading up to the first
                        // expression in this attribute
                        const stringForPart = strings[partIndex];
                        // Find the attribute name
                        const name = lastAttributeNameRegex.exec(stringForPart)[2];
                        // Find the corresponding attribute
                        // All bound attributes have had a suffix added in
                        // TemplateResult#getHTML to opt out of special attribute
                        // handling. To look up the attribute value we also need to add
                        // the suffix.
                        const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                        const attributeValue = node.getAttribute(attributeLookupName);
                        node.removeAttribute(attributeLookupName);
                        const statics = attributeValue.split(markerRegex);
                        this.parts.push({ type: 'attribute', index, name, strings: statics });
                        partIndex += statics.length - 1;
                    }
                }
                if (node.tagName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
            }
            else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                const data = node.data;
                if (data.indexOf(marker) >= 0) {
                    const parent = node.parentNode;
                    const strings = data.split(markerRegex);
                    const lastIndex = strings.length - 1;
                    // Generate a new text node for each literal section
                    // These nodes are also used as the markers for node parts
                    for (let i = 0; i < lastIndex; i++) {
                        let insert;
                        let s = strings[i];
                        if (s === '') {
                            insert = createMarker();
                        }
                        else {
                            const match = lastAttributeNameRegex.exec(s);
                            if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                s = s.slice(0, match.index) + match[1] +
                                    match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                            }
                            insert = document.createTextNode(s);
                        }
                        parent.insertBefore(insert, node);
                        this.parts.push({ type: 'node', index: ++index });
                    }
                    // If there's no text, we must insert a comment to mark our place.
                    // Else, we can trust it will stick around after cloning.
                    if (strings[lastIndex] === '') {
                        parent.insertBefore(createMarker(), node);
                        nodesToRemove.push(node);
                    }
                    else {
                        node.data = strings[lastIndex];
                    }
                    // We have a part for each match found
                    partIndex += lastIndex;
                }
            }
            else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                if (node.data === marker) {
                    const parent = node.parentNode;
                    // Add a new marker node to be the startNode of the Part if any of
                    // the following are true:
                    //  * We don't have a previousSibling
                    //  * The previousSibling is already the start of a previous part
                    if (node.previousSibling === null || index === lastPartIndex) {
                        index++;
                        parent.insertBefore(createMarker(), node);
                    }
                    lastPartIndex = index;
                    this.parts.push({ type: 'node', index });
                    // If we don't have a nextSibling, keep this node so we have an end.
                    // Else, we can remove it to save future costs.
                    if (node.nextSibling === null) {
                        node.data = '';
                    }
                    else {
                        nodesToRemove.push(node);
                        index--;
                    }
                    partIndex++;
                }
                else {
                    let i = -1;
                    while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                        // Comment node has a binding marker inside, make an inactive part
                        // The binding won't work, but subsequent bindings will
                        // TODO (justinfagnani): consider whether it's even worth it to
                        // make bindings in comments work
                        this.parts.push({ type: 'node', index: -1 });
                        partIndex++;
                    }
                }
            }
        }
        // Remove text binding nodes after the walk to not disturb the TreeWalker
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}
const endsWith = (str, suffix) => {
    const index = str.length - suffix.length;
    return index >= 0 && str.slice(index) === suffix;
};
const isTemplatePartActive = (part) => part.index !== -1;
// Allows `document.createComment('')` to be renamed for a
// small manual size-savings.
const createMarker = () => document.createComment('');
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-characters
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
 * space character except " ".
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
const lastAttributeNameRegex = 
// eslint-disable-next-line no-control-regex
/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const walkerNodeFilter = 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;
/**
 * Removes the list of nodes from a Template safely. In addition to removing
 * nodes from the Template, the Template part indices are updated to match
 * the mutated Template DOM.
 *
 * As the template is walked the removal state is tracked and
 * part indices are adjusted as needed.
 *
 * div
 *   div#1 (remove) <-- start removing (removing node is div#1)
 *     div
 *       div#2 (remove)  <-- continue removing (removing node is still div#1)
 *         div
 * div <-- stop removing since previous sibling is the removing node (div#1,
 * removed 4 nodes)
 */
function removeNodesFromTemplate(template, nodesToRemove) {
    const { element: { content }, parts } = template;
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let part = parts[partIndex];
    let nodeIndex = -1;
    let removeCount = 0;
    const nodesToRemoveInTemplate = [];
    let currentRemovingNode = null;
    while (walker.nextNode()) {
        nodeIndex++;
        const node = walker.currentNode;
        // End removal if stepped past the removing node
        if (node.previousSibling === currentRemovingNode) {
            currentRemovingNode = null;
        }
        // A node to remove was found in the template
        if (nodesToRemove.has(node)) {
            nodesToRemoveInTemplate.push(node);
            // Track node we're removing
            if (currentRemovingNode === null) {
                currentRemovingNode = node;
            }
        }
        // When removing, increment count by which to adjust subsequent part indices
        if (currentRemovingNode !== null) {
            removeCount++;
        }
        while (part !== undefined && part.index === nodeIndex) {
            // If part is in a removed node deactivate it by setting index to -1 or
            // adjust the index as needed.
            part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
            // go to the next active part.
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
            part = parts[partIndex];
        }
    }
    nodesToRemoveInTemplate.forEach((n) => n.parentNode.removeChild(n));
}
const countNodes = (node) => {
    let count = (node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) ? 0 : 1;
    const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
    while (walker.nextNode()) {
        count++;
    }
    return count;
};
const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
    for (let i = startIndex + 1; i < parts.length; i++) {
        const part = parts[i];
        if (isTemplatePartActive(part)) {
            return i;
        }
    }
    return -1;
};
/**
 * Inserts the given node into the Template, optionally before the given
 * refNode. In addition to inserting the node into the Template, the Template
 * part indices are updated to match the mutated Template DOM.
 */
function insertNodeIntoTemplate(template, node, refNode = null) {
    const { element: { content }, parts } = template;
    // If there's no refNode, then put node at end of template.
    // No part indices need to be shifted in this case.
    if (refNode === null || refNode === undefined) {
        content.appendChild(node);
        return;
    }
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let insertCount = 0;
    let walkerIndex = -1;
    while (walker.nextNode()) {
        walkerIndex++;
        const walkerNode = walker.currentNode;
        if (walkerNode === refNode) {
            insertCount = countNodes(node);
            refNode.parentNode.insertBefore(node, refNode);
        }
        while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
            // If we've inserted the node, simply adjust all subsequent parts
            if (insertCount > 0) {
                while (partIndex !== -1) {
                    parts[partIndex].index += insertCount;
                    partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                }
                return;
            }
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        }
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const directives = new WeakMap();
const isDirective = (o) => {
    return typeof o === 'function' && directives.has(o);
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = {};
/**
 * A sentinel value that signals a NodePart to fully clear its content.
 */
const nothing = {};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
class TemplateInstance {
    constructor(template, processor, options) {
        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    }
    update(values) {
        let i = 0;
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.commit();
            }
        }
    }
    _clone() {
        // There are a number of steps in the lifecycle of a template instance's
        // DOM fragment:
        //  1. Clone - create the instance fragment
        //  2. Adopt - adopt into the main document
        //  3. Process - find part markers and create parts
        //  4. Upgrade - upgrade custom elements
        //  5. Update - set node, attribute, property, etc., values
        //  6. Connect - connect to the document. Optional and outside of this
        //     method.
        //
        // We have a few constraints on the ordering of these steps:
        //  * We need to upgrade before updating, so that property values will pass
        //    through any property setters.
        //  * We would like to process before upgrading so that we're sure that the
        //    cloned fragment is inert and not disturbed by self-modifying DOM.
        //  * We want custom elements to upgrade even in disconnected fragments.
        //
        // Given these constraints, with full custom elements support we would
        // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
        //
        // But Safari does not implement CustomElementRegistry#upgrade, so we
        // can not implement that order and still have upgrade-before-update and
        // upgrade disconnected fragments. So we instead sacrifice the
        // process-before-upgrade constraint, since in Custom Elements v1 elements
        // must not modify their light DOM in the constructor. We still have issues
        // when co-existing with CEv0 elements like Polymer 1, and with polyfills
        // that don't strictly adhere to the no-modification rule because shadow
        // DOM, which may be created in the constructor, is emulated by being placed
        // in the light DOM.
        //
        // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
        // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
        // in one step.
        //
        // The Custom Elements v1 polyfill supports upgrade(), so the order when
        // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
        // Connect.
        const fragment = isCEPolyfill ?
            this.template.element.content.cloneNode(true) :
            document.importNode(this.template.element.content, true);
        const stack = [];
        const parts = this.template.parts;
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        let partIndex = 0;
        let nodeIndex = 0;
        let part;
        let node = walker.nextNode();
        // Loop through all the nodes and parts of a template
        while (partIndex < parts.length) {
            part = parts[partIndex];
            if (!isTemplatePartActive(part)) {
                this.__parts.push(undefined);
                partIndex++;
                continue;
            }
            // Progress the tree walker until we find our next part's node.
            // Note that multiple parts may share the same node (attribute parts
            // on a single element), so this loop may not run at all.
            while (nodeIndex < part.index) {
                nodeIndex++;
                if (node.nodeName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
                if ((node = walker.nextNode()) === null) {
                    // We've exhausted the content inside a nested template element.
                    // Because we still have parts (the outer for-loop), we know:
                    // - There is a template in the stack
                    // - The walker will find a nextNode outside the template
                    walker.currentNode = stack.pop();
                    node = walker.nextNode();
                }
            }
            // We've arrived at our part's node.
            if (part.type === 'node') {
                const part = this.processor.handleTextExpression(this.options);
                part.insertAfterNode(node.previousSibling);
                this.__parts.push(part);
            }
            else {
                this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
            }
            partIndex++;
        }
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const commentMarker = ` ${marker} `;
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
class TemplateResult {
    constructor(strings, values, type, processor) {
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    }
    /**
     * Returns a string of HTML used to create a `<template>` element.
     */
    getHTML() {
        const l = this.strings.length - 1;
        let html = '';
        let isCommentBinding = false;
        for (let i = 0; i < l; i++) {
            const s = this.strings[i];
            // For each binding we want to determine the kind of marker to insert
            // into the template source before it's parsed by the browser's HTML
            // parser. The marker type is based on whether the expression is in an
            // attribute, text, or comment position.
            //   * For node-position bindings we insert a comment with the marker
            //     sentinel as its text content, like <!--{{lit-guid}}-->.
            //   * For attribute bindings we insert just the marker sentinel for the
            //     first binding, so that we support unquoted attribute bindings.
            //     Subsequent bindings can use a comment marker because multi-binding
            //     attributes must be quoted.
            //   * For comment bindings we insert just the marker sentinel so we don't
            //     close the comment.
            //
            // The following code scans the template source, but is *not* an HTML
            // parser. We don't need to track the tree structure of the HTML, only
            // whether a binding is inside a comment, and if not, if it appears to be
            // the first binding in an attribute.
            const commentOpen = s.lastIndexOf('<!--');
            // We're in comment position if we have a comment open with no following
            // comment close. Because <-- can appear in an attribute value there can
            // be false positives.
            isCommentBinding = (commentOpen > -1 || isCommentBinding) &&
                s.indexOf('-->', commentOpen + 1) === -1;
            // Check to see if we have an attribute-like sequence preceding the
            // expression. This can match "name=value" like structures in text,
            // comments, and attribute values, so there can be false-positives.
            const attributeMatch = lastAttributeNameRegex.exec(s);
            if (attributeMatch === null) {
                // We're only in this branch if we don't have a attribute-like
                // preceding sequence. For comments, this guards against unusual
                // attribute values like <div foo="<!--${'bar'}">. Cases like
                // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
                // below.
                html += s + (isCommentBinding ? commentMarker : nodeMarker);
            }
            else {
                // For attributes we use just a marker sentinel, and also append a
                // $lit$ suffix to the name to opt-out of attribute-specific parsing
                // that IE and Edge do for style and certain SVG attributes.
                html += s.substr(0, attributeMatch.index) + attributeMatch[1] +
                    attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] +
                    marker;
            }
        }
        html += this.strings[l];
        return html;
    }
    getTemplateElement() {
        const template = document.createElement('template');
        template.innerHTML = this.getHTML();
        return template;
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const isPrimitive = (value) => {
    return (value === null ||
        !(typeof value === 'object' || typeof value === 'function'));
};
const isIterable = (value) => {
    return Array.isArray(value) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !!(value && value[Symbol.iterator]);
};
/**
 * Writes attribute values to the DOM for a group of AttributeParts bound to a
 * single attribute. The value is only set once even if there are multiple parts
 * for an attribute.
 */
class AttributeCommitter {
    constructor(element, name, strings) {
        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for (let i = 0; i < strings.length - 1; i++) {
            this.parts[i] = this._createPart();
        }
    }
    /**
     * Creates a single part. Override this to create a differnt type of part.
     */
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings = this.strings;
        const l = strings.length - 1;
        let text = '';
        for (let i = 0; i < l; i++) {
            text += strings[i];
            const part = this.parts[i];
            if (part !== undefined) {
                const v = part.value;
                if (isPrimitive(v) || !isIterable(v)) {
                    text += typeof v === 'string' ? v : String(v);
                }
                else {
                    for (const t of v) {
                        text += typeof t === 'string' ? t : String(t);
                    }
                }
            }
        }
        text += strings[l];
        return text;
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    }
}
/**
 * A Part that controls all or part of an attribute value.
 */
class AttributePart {
    constructor(committer) {
        this.value = undefined;
        this.committer = committer;
    }
    setValue(value) {
        if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value;
            // If the value is a not a directive, dirty the committer so that it'll
            // call setAttribute. If the value is a directive, it'll dirty the
            // committer if it calls setValue().
            if (!isDirective(value)) {
                this.committer.dirty = true;
            }
        }
    }
    commit() {
        while (isDirective(this.value)) {
            const directive = this.value;
            this.value = noChange;
            directive(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    }
}
/**
 * A Part that controls a location within a Node tree. Like a Range, NodePart
 * has start and end locations and can set and update the Nodes between those
 * locations.
 *
 * NodeParts support several value types: primitives, Nodes, TemplateResults,
 * as well as arrays and iterables of those types.
 */
class NodePart {
    constructor(options) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.options = options;
    }
    /**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    }
    /**
     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
     * such as those that appear in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    /**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendIntoPart(part) {
        part.__insert(this.startNode = createMarker());
        part.__insert(this.endNode = createMarker());
    }
    /**
     * Inserts this part after the `ref` part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterPart(ref) {
        ref.__insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        if (this.startNode.parentNode === null) {
            return;
        }
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        const value = this.__pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this.__commitText(value);
            }
        }
        else if (value instanceof TemplateResult) {
            this.__commitTemplateResult(value);
        }
        else if (value instanceof Node) {
            this.__commitNode(value);
        }
        else if (isIterable(value)) {
            this.__commitIterable(value);
        }
        else if (value === nothing) {
            this.value = nothing;
            this.clear();
        }
        else {
            // Fallback, will render the string representation
            this.__commitText(value);
        }
    }
    __insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    __commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this.__insert(value);
        this.value = value;
    }
    __commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        // If `value` isn't already a string, we explicitly convert it here in case
        // it can't be implicitly converted - i.e. it's a symbol.
        const valueAsString = typeof value === 'string' ? value : String(value);
        if (node === this.endNode.previousSibling &&
            node.nodeType === 3 /* Node.TEXT_NODE */) {
            // If we only have a single text node between the markers, we can just
            // set its value, rather than replacing it.
            // TODO(justinfagnani): Can we just check if this.value is primitive?
            node.data = valueAsString;
        }
        else {
            this.__commitNode(document.createTextNode(valueAsString));
        }
        this.value = value;
    }
    __commitTemplateResult(value) {
        const template = this.options.templateFactory(value);
        if (this.value instanceof TemplateInstance &&
            this.value.template === template) {
            this.value.update(value.values);
        }
        else {
            // Make sure we propagate the template processor from the TemplateResult
            // so that we use its syntax extension, etc. The template factory comes
            // from the render function options so that it can control template
            // caching and preprocessing.
            const instance = new TemplateInstance(template, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this.__commitNode(fragment);
            this.value = instance;
        }
    }
    __commitIterable(value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _value is an array, then the previous render was of an
        // iterable and _value will contain the NodeParts from the previous
        // render. If _value is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        const itemParts = this.value;
        let partIndex = 0;
        let itemPart;
        for (const item of value) {
            // Try to reuse an existing part
            itemPart = itemParts[partIndex];
            // If no existing part, create a new one
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                }
                else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            // Truncate the parts array so _value reflects the current state
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
/**
 * Implements a boolean attribute, roughly as defined in the HTML
 * specification.
 *
 * If the value is truthy, then the attribute is present with a value of
 * ''. If the value is falsey, the attribute is removed.
 */
class BooleanAttributePart {
    constructor(element, name, strings) {
        this.value = undefined;
        this.__pendingValue = undefined;
        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const value = !!this.__pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, '');
            }
            else {
                this.element.removeAttribute(this.name);
            }
            this.value = value;
        }
        this.__pendingValue = noChange;
    }
}
/**
 * Sets attribute values for PropertyParts, so that the value is only set once
 * even if there are multiple parts for a property.
 *
 * If an expression controls the whole property value, then the value is simply
 * assigned to the property under control. If there are string literals or
 * multiple expressions, then the strings are expressions are interpolated into
 * a string first.
 */
class PropertyCommitter extends AttributeCommitter {
    constructor(element, name, strings) {
        super(element, name, strings);
        this.single =
            (strings.length === 2 && strings[0] === '' && strings[1] === '');
    }
    _createPart() {
        return new PropertyPart(this);
    }
    _getValue() {
        if (this.single) {
            return this.parts[0].value;
        }
        return super._getValue();
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.element[this.name] = this._getValue();
        }
    }
}
class PropertyPart extends AttributePart {
}
// Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the third
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.
let eventOptionsSupported = false;
// Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
// blocks right into the body of a module
(() => {
    try {
        const options = {
            get capture() {
                eventOptionsSupported = true;
                return false;
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.addEventListener('test', options, options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.removeEventListener('test', options, options);
    }
    catch (_e) {
        // event options not supported
    }
})();
class EventPart {
    constructor(element, eventName, eventContext) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this.__boundHandleEvent = (e) => this.handleEvent(e);
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const newListener = this.__pendingValue;
        const oldListener = this.value;
        const shouldRemoveListener = newListener == null ||
            oldListener != null &&
                (newListener.capture !== oldListener.capture ||
                    newListener.once !== oldListener.once ||
                    newListener.passive !== oldListener.passive);
        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        if (shouldAddListener) {
            this.__options = getOptions(newListener);
            this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        this.value = newListener;
        this.__pendingValue = noChange;
    }
    handleEvent(event) {
        if (typeof this.value === 'function') {
            this.value.call(this.eventContext || this.element, event);
        }
        else {
            this.value.handleEvent(event);
        }
    }
}
// We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.
const getOptions = (o) => o &&
    (eventOptionsSupported ?
        { capture: o.capture, passive: o.passive, once: o.once } :
        o.capture);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */
function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    // If the TemplateStringsArray is new, generate a key from the strings
    // This key is shared between all templates with identical content
    const key = result.strings.join(marker);
    // Check if we already have a Template for this key
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        // If we have not seen this key before, create a new Template
        template = new Template(result, result.getTemplateElement());
        // Cache the Template for this key
        templateCache.keyString.set(key, template);
    }
    // Cache all future queries for this TemplateStringsArray
    templateCache.stringsArray.set(result.strings, template);
    return template;
}
const templateCaches = new Map();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const parts = new WeakMap();
/**
 * Renders a template result or other value to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result Any value renderable by NodePart - typically a TemplateResult
 *     created by evaluating a template tag like `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */
const render = (result, container, options) => {
    let part = parts.get(container);
    if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
        part.appendInto(container);
    }
    part.setValue(result);
    part.commit();
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Creates Parts when a template is instantiated.
 */
class DefaultTemplateProcessor {
    /**
     * Create parts for an attribute-position binding, given the event, attribute
     * name, and string literals.
     *
     * @param element The element containing the binding
     * @param name  The attribute name
     * @param strings The string literals. There are always at least two strings,
     *   event for fully-controlled bindings with a single expression.
     */
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === '.') {
            const committer = new PropertyCommitter(element, name.slice(1), strings);
            return committer.parts;
        }
        if (prefix === '@') {
            return [new EventPart(element, name.slice(1), options.eventContext)];
        }
        if (prefix === '?') {
            return [new BooleanAttributePart(element, name.slice(1), strings)];
        }
        const committer = new AttributeCommitter(element, name, strings);
        return committer.parts;
    }
    /**
     * Create parts for a text-position binding.
     * @param templateFactory
     */
    handleTextExpression(options) {
        return new NodePart(options);
    }
}
const defaultTemplateProcessor = new DefaultTemplateProcessor();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
if (typeof window !== 'undefined') {
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.2.1');
}
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// Get a key to lookup in `templateCaches`.
const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
let compatibleShadyCSSVersion = true;
if (typeof window.ShadyCSS === 'undefined') {
    compatibleShadyCSSVersion = false;
}
else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
    console.warn(`Incompatible ShadyCSS version detected. ` +
        `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and ` +
        `@webcomponents/shadycss@1.3.1.`);
    compatibleShadyCSSVersion = false;
}
/**
 * Template factory which scopes template DOM using ShadyCSS.
 * @param scopeName {string}
 */
const shadyTemplateFactory = (scopeName) => (result) => {
    const cacheKey = getTemplateCacheKey(result.type, scopeName);
    let templateCache = templateCaches.get(cacheKey);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(cacheKey, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    const key = result.strings.join(marker);
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        const element = result.getTemplateElement();
        if (compatibleShadyCSSVersion) {
            window.ShadyCSS.prepareTemplateDom(element, scopeName);
        }
        template = new Template(result, element);
        templateCache.keyString.set(key, template);
    }
    templateCache.stringsArray.set(result.strings, template);
    return template;
};
const TEMPLATE_TYPES = ['html', 'svg'];
/**
 * Removes all style elements from Templates for the given scopeName.
 */
const removeStylesFromLitTemplates = (scopeName) => {
    TEMPLATE_TYPES.forEach((type) => {
        const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
        if (templates !== undefined) {
            templates.keyString.forEach((template) => {
                const { element: { content } } = template;
                // IE 11 doesn't support the iterable param Set constructor
                const styles = new Set();
                Array.from(content.querySelectorAll('style')).forEach((s) => {
                    styles.add(s);
                });
                removeNodesFromTemplate(template, styles);
            });
        }
    });
};
const shadyRenderSet = new Set();
/**
 * For the given scope name, ensures that ShadyCSS style scoping is performed.
 * This is done just once per scope name so the fragment and template cannot
 * be modified.
 * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
 * to be scoped and appended to the document
 * (2) removes style elements from all lit-html Templates for this scope name.
 *
 * Note, <style> elements can only be placed into templates for the
 * initial rendering of the scope. If <style> elements are included in templates
 * dynamically rendered to the scope (after the first scope render), they will
 * not be scoped and the <style> will be left in the template and rendered
 * output.
 */
const prepareTemplateStyles = (scopeName, renderedDOM, template) => {
    shadyRenderSet.add(scopeName);
    // If `renderedDOM` is stamped from a Template, then we need to edit that
    // Template's underlying template element. Otherwise, we create one here
    // to give to ShadyCSS, which still requires one while scoping.
    const templateElement = !!template ? template.element : document.createElement('template');
    // Move styles out of rendered DOM and store.
    const styles = renderedDOM.querySelectorAll('style');
    const { length } = styles;
    // If there are no styles, skip unnecessary work
    if (length === 0) {
        // Ensure prepareTemplateStyles is called to support adding
        // styles via `prepareAdoptedCssText` since that requires that
        // `prepareTemplateStyles` is called.
        //
        // ShadyCSS will only update styles containing @apply in the template
        // given to `prepareTemplateStyles`. If no lit Template was given,
        // ShadyCSS will not be able to update uses of @apply in any relevant
        // template. However, this is not a problem because we only create the
        // template for the purpose of supporting `prepareAdoptedCssText`,
        // which doesn't support @apply at all.
        window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
        return;
    }
    const condensedStyle = document.createElement('style');
    // Collect styles into a single style. This helps us make sure ShadyCSS
    // manipulations will not prevent us from being able to fix up template
    // part indices.
    // NOTE: collecting styles is inefficient for browsers but ShadyCSS
    // currently does this anyway. When it does not, this should be changed.
    for (let i = 0; i < length; i++) {
        const style = styles[i];
        style.parentNode.removeChild(style);
        condensedStyle.textContent += style.textContent;
    }
    // Remove styles from nested templates in this scope.
    removeStylesFromLitTemplates(scopeName);
    // And then put the condensed style into the "root" template passed in as
    // `template`.
    const content = templateElement.content;
    if (!!template) {
        insertNodeIntoTemplate(template, condensedStyle, content.firstChild);
    }
    else {
        content.insertBefore(condensedStyle, content.firstChild);
    }
    // Note, it's important that ShadyCSS gets the template that `lit-html`
    // will actually render so that it can update the style inside when
    // needed (e.g. @apply native Shadow DOM case).
    window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
    const style = content.querySelector('style');
    if (window.ShadyCSS.nativeShadow && style !== null) {
        // When in native Shadow DOM, ensure the style created by ShadyCSS is
        // included in initially rendered output (`renderedDOM`).
        renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
    }
    else if (!!template) {
        // When no style is left in the template, parts will be broken as a
        // result. To fix this, we put back the style node ShadyCSS removed
        // and then tell lit to remove that node from the template.
        // There can be no style in the template in 2 cases (1) when Shady DOM
        // is in use, ShadyCSS removes all styles, (2) when native Shadow DOM
        // is in use ShadyCSS removes the style if it contains no content.
        // NOTE, ShadyCSS creates its own style so we can safely add/remove
        // `condensedStyle` here.
        content.insertBefore(condensedStyle, content.firstChild);
        const removes = new Set();
        removes.add(condensedStyle);
        removeNodesFromTemplate(template, removes);
    }
};
/**
 * Extension to the standard `render` method which supports rendering
 * to ShadowRoots when the ShadyDOM (https://github.com/webcomponents/shadydom)
 * and ShadyCSS (https://github.com/webcomponents/shadycss) polyfills are used
 * or when the webcomponentsjs
 * (https://github.com/webcomponents/webcomponentsjs) polyfill is used.
 *
 * Adds a `scopeName` option which is used to scope element DOM and stylesheets
 * when native ShadowDOM is unavailable. The `scopeName` will be added to
 * the class attribute of all rendered DOM. In addition, any style elements will
 * be automatically re-written with this `scopeName` selector and moved out
 * of the rendered DOM and into the document `<head>`.
 *
 * It is common to use this render method in conjunction with a custom element
 * which renders a shadowRoot. When this is done, typically the element's
 * `localName` should be used as the `scopeName`.
 *
 * In addition to DOM scoping, ShadyCSS also supports a basic shim for css
 * custom properties (needed only on older browsers like IE11) and a shim for
 * a deprecated feature called `@apply` that supports applying a set of css
 * custom properties to a given location.
 *
 * Usage considerations:
 *
 * * Part values in `<style>` elements are only applied the first time a given
 * `scopeName` renders. Subsequent changes to parts in style elements will have
 * no effect. Because of this, parts in style elements should only be used for
 * values that will never change, for example parts that set scope-wide theme
 * values or parts which render shared style elements.
 *
 * * Note, due to a limitation of the ShadyDOM polyfill, rendering in a
 * custom element's `constructor` is not supported. Instead rendering should
 * either done asynchronously, for example at microtask timing (for example
 * `Promise.resolve()`), or be deferred until the first time the element's
 * `connectedCallback` runs.
 *
 * Usage considerations when using shimmed custom properties or `@apply`:
 *
 * * Whenever any dynamic changes are made which affect
 * css custom properties, `ShadyCSS.styleElement(element)` must be called
 * to update the element. There are two cases when this is needed:
 * (1) the element is connected to a new parent, (2) a class is added to the
 * element that causes it to match different custom properties.
 * To address the first case when rendering a custom element, `styleElement`
 * should be called in the element's `connectedCallback`.
 *
 * * Shimmed custom properties may only be defined either for an entire
 * shadowRoot (for example, in a `:host` rule) or via a rule that directly
 * matches an element with a shadowRoot. In other words, instead of flowing from
 * parent to child as do native css custom properties, shimmed custom properties
 * flow only from shadowRoots to nested shadowRoots.
 *
 * * When using `@apply` mixing css shorthand property names with
 * non-shorthand names (for example `border` and `border-width`) is not
 * supported.
 */
const render$1 = (result, container, options) => {
    if (!options || typeof options !== 'object' || !options.scopeName) {
        throw new Error('The `scopeName` option is required.');
    }
    const scopeName = options.scopeName;
    const hasRendered = parts.has(container);
    const needsScoping = compatibleShadyCSSVersion &&
        container.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */ &&
        !!container.host;
    // Handle first render to a scope specially...
    const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName);
    // On first scope render, render into a fragment; this cannot be a single
    // fragment that is reused since nested renders can occur synchronously.
    const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
    render(result, renderContainer, Object.assign({ templateFactory: shadyTemplateFactory(scopeName) }, options));
    // When performing first scope render,
    // (1) We've rendered into a fragment so that there's a chance to
    // `prepareTemplateStyles` before sub-elements hit the DOM
    // (which might cause them to render based on a common pattern of
    // rendering in a custom element's `connectedCallback`);
    // (2) Scope the template with ShadyCSS one time only for this scope.
    // (3) Render the fragment into the container and make sure the
    // container knows its `part` is the one we just rendered. This ensures
    // DOM will be re-used on subsequent renders.
    if (firstScopeRender) {
        const part = parts.get(renderContainer);
        parts.delete(renderContainer);
        // ShadyCSS might have style sheets (e.g. from `prepareAdoptedCssText`)
        // that should apply to `renderContainer` even if the rendered value is
        // not a TemplateInstance. However, it will only insert scoped styles
        // into the document if `prepareTemplateStyles` has already been called
        // for the given scope name.
        const template = part.value instanceof TemplateInstance ?
            part.value.template :
            undefined;
        prepareTemplateStyles(scopeName, renderContainer, template);
        removeNodes(container, container.firstChild);
        container.appendChild(renderContainer);
        parts.set(container, part);
    }
    // After elements have hit the DOM, update styling if this is the
    // initial render to this container.
    // This is needed whenever dynamic changes are made so it would be
    // safest to do every render; however, this would regress performance
    // so we leave it up to the user to call `ShadyCSS.styleElement`
    // for dynamic changes.
    if (!hasRendered && needsScoping) {
        window.ShadyCSS.styleElement(container.host);
    }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var _a;
/**
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
 * replaced at compile time by the munged name for object[property]. We cannot
 * alias this function, so we have to use a small shim that has the same
 * behavior when not compiling.
 */
window.JSCompiler_renameProperty =
    (prop, _obj) => prop;
const defaultConverter = {
    toAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value ? '' : null;
            case Object:
            case Array:
                // if the value is `null` or `undefined` pass this through
                // to allow removing/no change behavior.
                return value == null ? value : JSON.stringify(value);
        }
        return value;
    },
    fromAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value !== null;
            case Number:
                return value === null ? null : Number(value);
            case Object:
            case Array:
                return JSON.parse(value);
        }
        return value;
    }
};
/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 */
const notEqual = (value, old) => {
    // This ensures (old==NaN, value==NaN) always returns false
    return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    converter: defaultConverter,
    reflect: false,
    hasChanged: notEqual
};
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
/**
 * The Closure JS Compiler doesn't currently have good support for static
 * property semantics where "this" is dynamic (e.g.
 * https://github.com/google/closure-compiler/issues/3177 and others) so we use
 * this hack to bypass any rewriting by the compiler.
 */
const finalized = 'finalized';
/**
 * Base element class which manages element properties and attributes. When
 * properties change, the `update` method is asynchronously called. This method
 * should be supplied by subclassers to render updates as desired.
 */
class UpdatingElement extends HTMLElement {
    constructor() {
        super();
        this._updateState = 0;
        this._instanceProperties = undefined;
        // Initialize to an unresolved Promise so we can make sure the element has
        // connected before first update.
        this._updatePromise = new Promise((res) => this._enableUpdatingResolver = res);
        /**
         * Map with keys for any properties that have changed since the last
         * update cycle with previous values.
         */
        this._changedProperties = new Map();
        /**
         * Map with keys of properties that should be reflected when updated.
         */
        this._reflectingProperties = undefined;
        this.initialize();
    }
    /**
     * Returns a list of attributes corresponding to the registered properties.
     * @nocollapse
     */
    static get observedAttributes() {
        // note: piggy backing on this to ensure we're finalized.
        this.finalize();
        const attributes = [];
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        this._classProperties.forEach((v, p) => {
            const attr = this._attributeNameForProperty(p, v);
            if (attr !== undefined) {
                this._attributeToPropertyMap.set(attr, p);
                attributes.push(attr);
            }
        });
        return attributes;
    }
    /**
     * Ensures the private `_classProperties` property metadata is created.
     * In addition to `finalize` this is also called in `createProperty` to
     * ensure the `@property` decorator can add property metadata.
     */
    /** @nocollapse */
    static _ensureClassProperties() {
        // ensure private storage for property declarations.
        if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
            this._classProperties = new Map();
            // NOTE: Workaround IE11 not supporting Map constructor argument.
            const superProperties = Object.getPrototypeOf(this)._classProperties;
            if (superProperties !== undefined) {
                superProperties.forEach((v, k) => this._classProperties.set(k, v));
            }
        }
    }
    /**
     * Creates a property accessor on the element prototype if one does not exist
     * and stores a PropertyDeclaration for the property with the given options.
     * The property setter calls the property's `hasChanged` property option
     * or uses a strict identity check to determine whether or not to request
     * an update.
     *
     * This method may be overridden to customize properties; however,
     * when doing so, it's important to call `super.createProperty` to ensure
     * the property is setup correctly. This method calls
     * `getPropertyDescriptor` internally to get a descriptor to install.
     * To customize what properties do when they are get or set, override
     * `getPropertyDescriptor`. To customize the options for a property,
     * implement `createProperty` like this:
     *
     * static createProperty(name, options) {
     *   options = Object.assign(options, {myOption: true});
     *   super.createProperty(name, options);
     * }
     *
     * @nocollapse
     */
    static createProperty(name, options = defaultPropertyDeclaration) {
        // Note, since this can be called by the `@property` decorator which
        // is called before `finalize`, we ensure storage exists for property
        // metadata.
        this._ensureClassProperties();
        this._classProperties.set(name, options);
        // Do not generate an accessor if the prototype already has one, since
        // it would be lost otherwise and that would never be the user's intention;
        // Instead, we expect users to call `requestUpdate` themselves from
        // user-defined accessors. Note that if the super has an accessor we will
        // still overwrite it
        if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
            return;
        }
        const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
        const descriptor = this.getPropertyDescriptor(name, key, options);
        if (descriptor !== undefined) {
            Object.defineProperty(this.prototype, name, descriptor);
        }
    }
    /**
     * Returns a property descriptor to be defined on the given named property.
     * If no descriptor is returned, the property will not become an accessor.
     * For example,
     *
     *   class MyElement extends LitElement {
     *     static getPropertyDescriptor(name, key, options) {
     *       const defaultDescriptor =
     *           super.getPropertyDescriptor(name, key, options);
     *       const setter = defaultDescriptor.set;
     *       return {
     *         get: defaultDescriptor.get,
     *         set(value) {
     *           setter.call(this, value);
     *           // custom action.
     *         },
     *         configurable: true,
     *         enumerable: true
     *       }
     *     }
     *   }
     *
     * @nocollapse
     */
    static getPropertyDescriptor(name, key, _options) {
        return {
            // tslint:disable-next-line:no-any no symbol in index
            get() {
                return this[key];
            },
            set(value) {
                const oldValue = this[name];
                this[key] = value;
                this._requestUpdate(name, oldValue);
            },
            configurable: true,
            enumerable: true
        };
    }
    /**
     * Returns the property options associated with the given property.
     * These options are defined with a PropertyDeclaration via the `properties`
     * object or the `@property` decorator and are registered in
     * `createProperty(...)`.
     *
     * Note, this method should be considered "final" and not overridden. To
     * customize the options for a given property, override `createProperty`.
     *
     * @nocollapse
     * @final
     */
    static getPropertyOptions(name) {
        return this._classProperties && this._classProperties.get(name) ||
            defaultPropertyDeclaration;
    }
    /**
     * Creates property accessors for registered properties and ensures
     * any superclasses are also finalized.
     * @nocollapse
     */
    static finalize() {
        // finalize any superclasses
        const superCtor = Object.getPrototypeOf(this);
        if (!superCtor.hasOwnProperty(finalized)) {
            superCtor.finalize();
        }
        this[finalized] = true;
        this._ensureClassProperties();
        // initialize Map populated in observedAttributes
        this._attributeToPropertyMap = new Map();
        // make any properties
        // Note, only process "own" properties since this element will inherit
        // any properties defined on the superClass, and finalization ensures
        // the entire prototype chain is finalized.
        if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
            const props = this.properties;
            // support symbols in properties (IE11 does not support this)
            const propKeys = [
                ...Object.getOwnPropertyNames(props),
                ...(typeof Object.getOwnPropertySymbols === 'function') ?
                    Object.getOwnPropertySymbols(props) :
                    []
            ];
            // This for/of is ok because propKeys is an array
            for (const p of propKeys) {
                // note, use of `any` is due to TypeSript lack of support for symbol in
                // index types
                // tslint:disable-next-line:no-any no symbol in index
                this.createProperty(p, props[p]);
            }
        }
    }
    /**
     * Returns the property name for the given attribute `name`.
     * @nocollapse
     */
    static _attributeNameForProperty(name, options) {
        const attribute = options.attribute;
        return attribute === false ?
            undefined :
            (typeof attribute === 'string' ?
                attribute :
                (typeof name === 'string' ? name.toLowerCase() : undefined));
    }
    /**
     * Returns true if a property should request an update.
     * Called when a property value is set and uses the `hasChanged`
     * option for the property if present or a strict identity check.
     * @nocollapse
     */
    static _valueHasChanged(value, old, hasChanged = notEqual) {
        return hasChanged(value, old);
    }
    /**
     * Returns the property value for the given attribute value.
     * Called via the `attributeChangedCallback` and uses the property's
     * `converter` or `converter.fromAttribute` property option.
     * @nocollapse
     */
    static _propertyValueFromAttribute(value, options) {
        const type = options.type;
        const converter = options.converter || defaultConverter;
        const fromAttribute = (typeof converter === 'function' ? converter : converter.fromAttribute);
        return fromAttribute ? fromAttribute(value, type) : value;
    }
    /**
     * Returns the attribute value for the given property value. If this
     * returns undefined, the property will *not* be reflected to an attribute.
     * If this returns null, the attribute will be removed, otherwise the
     * attribute will be set to the value.
     * This uses the property's `reflect` and `type.toAttribute` property options.
     * @nocollapse
     */
    static _propertyValueToAttribute(value, options) {
        if (options.reflect === undefined) {
            return;
        }
        const type = options.type;
        const converter = options.converter;
        const toAttribute = converter && converter.toAttribute ||
            defaultConverter.toAttribute;
        return toAttribute(value, type);
    }
    /**
     * Performs element initialization. By default captures any pre-set values for
     * registered properties.
     */
    initialize() {
        this._saveInstanceProperties();
        // ensures first update will be caught by an early access of
        // `updateComplete`
        this._requestUpdate();
    }
    /**
     * Fixes any properties set on the instance before upgrade time.
     * Otherwise these would shadow the accessor and break these properties.
     * The properties are stored in a Map which is played back after the
     * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
     * (<=41), properties created for native platform properties like (`id` or
     * `name`) may not have default values set in the element constructor. On
     * these browsers native properties appear on instances and therefore their
     * default value will overwrite any element default (e.g. if the element sets
     * this.id = 'id' in the constructor, the 'id' will become '' since this is
     * the native platform default).
     */
    _saveInstanceProperties() {
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        this.constructor
            ._classProperties.forEach((_v, p) => {
            if (this.hasOwnProperty(p)) {
                const value = this[p];
                delete this[p];
                if (!this._instanceProperties) {
                    this._instanceProperties = new Map();
                }
                this._instanceProperties.set(p, value);
            }
        });
    }
    /**
     * Applies previously saved instance properties.
     */
    _applyInstanceProperties() {
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        // tslint:disable-next-line:no-any
        this._instanceProperties.forEach((v, p) => this[p] = v);
        this._instanceProperties = undefined;
    }
    connectedCallback() {
        // Ensure first connection completes an update. Updates cannot complete
        // before connection.
        this.enableUpdating();
    }
    enableUpdating() {
        if (this._enableUpdatingResolver !== undefined) {
            this._enableUpdatingResolver();
            this._enableUpdatingResolver = undefined;
        }
    }
    /**
     * Allows for `super.disconnectedCallback()` in extensions while
     * reserving the possibility of making non-breaking feature additions
     * when disconnecting at some point in the future.
     */
    disconnectedCallback() {
    }
    /**
     * Synchronizes property values when attributes change.
     */
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this._attributeToProperty(name, value);
        }
    }
    _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
        const ctor = this.constructor;
        const attr = ctor._attributeNameForProperty(name, options);
        if (attr !== undefined) {
            const attrValue = ctor._propertyValueToAttribute(value, options);
            // an undefined value does not change the attribute.
            if (attrValue === undefined) {
                return;
            }
            // Track if the property is being reflected to avoid
            // setting the property again via `attributeChangedCallback`. Note:
            // 1. this takes advantage of the fact that the callback is synchronous.
            // 2. will behave incorrectly if multiple attributes are in the reaction
            // stack at time of calling. However, since we process attributes
            // in `update` this should not be possible (or an extreme corner case
            // that we'd like to discover).
            // mark state reflecting
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;
            if (attrValue == null) {
                this.removeAttribute(attr);
            }
            else {
                this.setAttribute(attr, attrValue);
            }
            // mark state not reflecting
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
        }
    }
    _attributeToProperty(name, value) {
        // Use tracking info to avoid deserializing attribute value if it was
        // just set from a property setter.
        if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
            return;
        }
        const ctor = this.constructor;
        // Note, hint this as an `AttributeMap` so closure clearly understands
        // the type; it has issues with tracking types through statics
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const propName = ctor._attributeToPropertyMap.get(name);
        if (propName !== undefined) {
            const options = ctor.getPropertyOptions(propName);
            // mark state reflecting
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
            this[propName] =
                // tslint:disable-next-line:no-any
                ctor._propertyValueFromAttribute(value, options);
            // mark state not reflecting
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
        }
    }
    /**
     * This private version of `requestUpdate` does not access or return the
     * `updateComplete` promise. This promise can be overridden and is therefore
     * not free to access.
     */
    _requestUpdate(name, oldValue) {
        let shouldRequestUpdate = true;
        // If we have a property key, perform property update steps.
        if (name !== undefined) {
            const ctor = this.constructor;
            const options = ctor.getPropertyOptions(name);
            if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                if (!this._changedProperties.has(name)) {
                    this._changedProperties.set(name, oldValue);
                }
                // Add to reflecting properties set.
                // Note, it's important that every change has a chance to add the
                // property to `_reflectingProperties`. This ensures setting
                // attribute + property reflects correctly.
                if (options.reflect === true &&
                    !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
                    if (this._reflectingProperties === undefined) {
                        this._reflectingProperties = new Map();
                    }
                    this._reflectingProperties.set(name, options);
                }
            }
            else {
                // Abort the request if the property should not be considered changed.
                shouldRequestUpdate = false;
            }
        }
        if (!this._hasRequestedUpdate && shouldRequestUpdate) {
            this._updatePromise = this._enqueueUpdate();
        }
    }
    /**
     * Requests an update which is processed asynchronously. This should
     * be called when an element should update based on some state not triggered
     * by setting a property. In this case, pass no arguments. It should also be
     * called when manually implementing a property setter. In this case, pass the
     * property `name` and `oldValue` to ensure that any configured property
     * options are honored. Returns the `updateComplete` Promise which is resolved
     * when the update completes.
     *
     * @param name {PropertyKey} (optional) name of requesting property
     * @param oldValue {any} (optional) old value of requesting property
     * @returns {Promise} A Promise that is resolved when the update completes.
     */
    requestUpdate(name, oldValue) {
        this._requestUpdate(name, oldValue);
        return this.updateComplete;
    }
    /**
     * Sets up the element to asynchronously update.
     */
    async _enqueueUpdate() {
        this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
        try {
            // Ensure any previous update has resolved before updating.
            // This `await` also ensures that property changes are batched.
            await this._updatePromise;
        }
        catch (e) {
            // Ignore any previous errors. We only care that the previous cycle is
            // done. Any error should have been handled in the previous update.
        }
        const result = this.performUpdate();
        // If `performUpdate` returns a Promise, we await it. This is done to
        // enable coordinating updates with a scheduler. Note, the result is
        // checked to avoid delaying an additional microtask unless we need to.
        if (result != null) {
            await result;
        }
        return !this._hasRequestedUpdate;
    }
    get _hasRequestedUpdate() {
        return (this._updateState & STATE_UPDATE_REQUESTED);
    }
    get hasUpdated() {
        return (this._updateState & STATE_HAS_UPDATED);
    }
    /**
     * Performs an element update. Note, if an exception is thrown during the
     * update, `firstUpdated` and `updated` will not be called.
     *
     * You can override this method to change the timing of updates. If this
     * method is overridden, `super.performUpdate()` must be called.
     *
     * For instance, to schedule updates to occur just before the next frame:
     *
     * ```
     * protected async performUpdate(): Promise<unknown> {
     *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
     *   super.performUpdate();
     * }
     * ```
     */
    performUpdate() {
        // Mixin instance properties once, if they exist.
        if (this._instanceProperties) {
            this._applyInstanceProperties();
        }
        let shouldUpdate = false;
        const changedProperties = this._changedProperties;
        try {
            shouldUpdate = this.shouldUpdate(changedProperties);
            if (shouldUpdate) {
                this.update(changedProperties);
            }
            else {
                this._markUpdated();
            }
        }
        catch (e) {
            // Prevent `firstUpdated` and `updated` from running when there's an
            // update exception.
            shouldUpdate = false;
            // Ensure element can accept additional updates after an exception.
            this._markUpdated();
            throw e;
        }
        if (shouldUpdate) {
            if (!(this._updateState & STATE_HAS_UPDATED)) {
                this._updateState = this._updateState | STATE_HAS_UPDATED;
                this.firstUpdated(changedProperties);
            }
            this.updated(changedProperties);
        }
    }
    _markUpdated() {
        this._changedProperties = new Map();
        this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
    }
    /**
     * Returns a Promise that resolves when the element has completed updating.
     * The Promise value is a boolean that is `true` if the element completed the
     * update without triggering another update. The Promise result is `false` if
     * a property was set inside `updated()`. If the Promise is rejected, an
     * exception was thrown during the update.
     *
     * To await additional asynchronous work, override the `_getUpdateComplete`
     * method. For example, it is sometimes useful to await a rendered element
     * before fulfilling this Promise. To do this, first await
     * `super._getUpdateComplete()`, then any subsequent state.
     *
     * @returns {Promise} The Promise returns a boolean that indicates if the
     * update resolved without triggering another update.
     */
    get updateComplete() {
        return this._getUpdateComplete();
    }
    /**
     * Override point for the `updateComplete` promise.
     *
     * It is not safe to override the `updateComplete` getter directly due to a
     * limitation in TypeScript which means it is not possible to call a
     * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
     * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
     * This method should be overridden instead. For example:
     *
     *   class MyElement extends LitElement {
     *     async _getUpdateComplete() {
     *       await super._getUpdateComplete();
     *       await this._myChild.updateComplete;
     *     }
     *   }
     */
    _getUpdateComplete() {
        return this._updatePromise;
    }
    /**
     * Controls whether or not `update` should be called when the element requests
     * an update. By default, this method always returns `true`, but this can be
     * customized to control when to update.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    shouldUpdate(_changedProperties) {
        return true;
    }
    /**
     * Updates the element. This method reflects property values to attributes.
     * It can be overridden to render and keep updated element DOM.
     * Setting properties inside this method will *not* trigger
     * another update.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    update(_changedProperties) {
        if (this._reflectingProperties !== undefined &&
            this._reflectingProperties.size > 0) {
            // Use forEach so this works even if for/of loops are compiled to for
            // loops expecting arrays
            this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));
            this._reflectingProperties = undefined;
        }
        this._markUpdated();
    }
    /**
     * Invoked whenever the element is updated. Implement to perform
     * post-updating tasks via DOM APIs, for example, focusing an element.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    updated(_changedProperties) {
    }
    /**
     * Invoked when the element is first updated. Implement to perform one time
     * work on the element after update.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    firstUpdated(_changedProperties) {
    }
}
_a = finalized;
/**
 * Marks class as having finished creating properties.
 */
UpdatingElement[_a] = true;

/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const supportsAdoptingStyleSheets = ('adoptedStyleSheets' in Document.prototype) &&
    ('replace' in CSSStyleSheet.prototype);
const constructionToken = Symbol();
class CSSResult {
    constructor(cssText, safeToken) {
        if (safeToken !== constructionToken) {
            throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
        }
        this.cssText = cssText;
    }
    // Note, this is a getter so that it's lazy. In practice, this means
    // stylesheets are not created until the first element instance is made.
    get styleSheet() {
        if (this._styleSheet === undefined) {
            // Note, if `adoptedStyleSheets` is supported then we assume CSSStyleSheet
            // is constructable.
            if (supportsAdoptingStyleSheets) {
                this._styleSheet = new CSSStyleSheet();
                this._styleSheet.replaceSync(this.cssText);
            }
            else {
                this._styleSheet = null;
            }
        }
        return this._styleSheet;
    }
    toString() {
        return this.cssText;
    }
}
const textFromCSSResult = (value) => {
    if (value instanceof CSSResult) {
        return value.cssText;
    }
    else if (typeof value === 'number') {
        return value;
    }
    else {
        throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`);
    }
};
/**
 * Template tag which which can be used with LitElement's `style` property to
 * set element styles. For security reasons, only literal string values may be
 * used. To incorporate non-literal values `unsafeCSS` may be used inside a
 * template string part.
 */
const css = (strings, ...values) => {
    const cssText = values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
    return new CSSResult(cssText, constructionToken);
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for LitElement usage.
// TODO(justinfagnani): inject version number at build time
(window['litElementVersions'] || (window['litElementVersions'] = []))
    .push('2.3.1');
/**
 * Sentinal value used to avoid calling lit-html's render function when
 * subclasses do not implement `render`
 */
const renderNotImplemented = {};
class LitElement extends UpdatingElement {
    /**
     * Return the array of styles to apply to the element.
     * Override this method to integrate into a style management system.
     *
     * @nocollapse
     */
    static getStyles() {
        return this.styles;
    }
    /** @nocollapse */
    static _getUniqueStyles() {
        // Only gather styles once per class
        if (this.hasOwnProperty(JSCompiler_renameProperty('_styles', this))) {
            return;
        }
        // Take care not to call `this.getStyles()` multiple times since this
        // generates new CSSResults each time.
        // TODO(sorvell): Since we do not cache CSSResults by input, any
        // shared styles will generate new stylesheet objects, which is wasteful.
        // This should be addressed when a browser ships constructable
        // stylesheets.
        const userStyles = this.getStyles();
        if (userStyles === undefined) {
            this._styles = [];
        }
        else if (Array.isArray(userStyles)) {
            // De-duplicate styles preserving the _last_ instance in the set.
            // This is a performance optimization to avoid duplicated styles that can
            // occur especially when composing via subclassing.
            // The last item is kept to try to preserve the cascade order with the
            // assumption that it's most important that last added styles override
            // previous styles.
            const addStyles = (styles, set) => styles.reduceRight((set, s) => 
            // Note: On IE set.add() does not return the set
            Array.isArray(s) ? addStyles(s, set) : (set.add(s), set), set);
            // Array.from does not work on Set in IE, otherwise return
            // Array.from(addStyles(userStyles, new Set<CSSResult>())).reverse()
            const set = addStyles(userStyles, new Set());
            const styles = [];
            set.forEach((v) => styles.unshift(v));
            this._styles = styles;
        }
        else {
            this._styles = [userStyles];
        }
    }
    /**
     * Performs element initialization. By default this calls `createRenderRoot`
     * to create the element `renderRoot` node and captures any pre-set values for
     * registered properties.
     */
    initialize() {
        super.initialize();
        this.constructor._getUniqueStyles();
        this.renderRoot =
            this.createRenderRoot();
        // Note, if renderRoot is not a shadowRoot, styles would/could apply to the
        // element's getRootNode(). While this could be done, we're choosing not to
        // support this now since it would require different logic around de-duping.
        if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
            this.adoptStyles();
        }
    }
    /**
     * Returns the node into which the element should render and by default
     * creates and returns an open shadowRoot. Implement to customize where the
     * element's DOM is rendered. For example, to render into the element's
     * childNodes, return `this`.
     * @returns {Element|DocumentFragment} Returns a node into which to render.
     */
    createRenderRoot() {
        return this.attachShadow({ mode: 'open' });
    }
    /**
     * Applies styling to the element shadowRoot using the `static get styles`
     * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
     * available and will fallback otherwise. When Shadow DOM is polyfilled,
     * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
     * is available but `adoptedStyleSheets` is not, styles are appended to the
     * end of the `shadowRoot` to [mimic spec
     * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
     */
    adoptStyles() {
        const styles = this.constructor._styles;
        if (styles.length === 0) {
            return;
        }
        // There are three separate cases here based on Shadow DOM support.
        // (1) shadowRoot polyfilled: use ShadyCSS
        // (2) shadowRoot.adoptedStyleSheets available: use it.
        // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
        // rendering
        if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
            window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map((s) => s.cssText), this.localName);
        }
        else if (supportsAdoptingStyleSheets) {
            this.renderRoot.adoptedStyleSheets =
                styles.map((s) => s.styleSheet);
        }
        else {
            // This must be done after rendering so the actual style insertion is done
            // in `update`.
            this._needsShimAdoptedStyleSheets = true;
        }
    }
    connectedCallback() {
        super.connectedCallback();
        // Note, first update/render handles styleElement so we only call this if
        // connected after first update.
        if (this.hasUpdated && window.ShadyCSS !== undefined) {
            window.ShadyCSS.styleElement(this);
        }
    }
    /**
     * Updates the element. This method reflects property values to attributes
     * and calls `render` to render DOM via lit-html. Setting properties inside
     * this method will *not* trigger another update.
     * @param _changedProperties Map of changed properties with old values
     */
    update(changedProperties) {
        // Setting properties in `render` should not trigger an update. Since
        // updates are allowed after super.update, it's important to call `render`
        // before that.
        const templateResult = this.render();
        super.update(changedProperties);
        // If render is not implemented by the component, don't call lit-html render
        if (templateResult !== renderNotImplemented) {
            this.constructor
                .render(templateResult, this.renderRoot, { scopeName: this.localName, eventContext: this });
        }
        // When native Shadow DOM is used but adoptedStyles are not supported,
        // insert styling after rendering to ensure adoptedStyles have highest
        // priority.
        if (this._needsShimAdoptedStyleSheets) {
            this._needsShimAdoptedStyleSheets = false;
            this.constructor._styles.forEach((s) => {
                const style = document.createElement('style');
                style.textContent = s.cssText;
                this.renderRoot.appendChild(style);
            });
        }
    }
    /**
     * Invoked on each update to perform rendering tasks. This method may return
     * any value renderable by lit-html's NodePart - typically a TemplateResult.
     * Setting properties inside this method will *not* trigger the element to
     * update.
     */
    render() {
        return renderNotImplemented;
    }
}
/**
 * Ensure this class is marked as `finalized` as an optimization ensuring
 * it will not needlessly try to `finalize`.
 *
 * Note this property name is a string to prevent breaking Closure JS Compiler
 * optimizations. See updating-element.ts for more information.
 */
LitElement['finalized'] = true;
/**
 * Render method used to render the value to the element's DOM.
 * @param result The value to render.
 * @param container Node into which to render.
 * @param options Element name.
 * @nocollapse
 */
LitElement.render = render$1;

class hmiElement extends litStatesMixin([Manager.dataTree, Manager.errorTray], LitElement) {
    constructor() {
        super();
        this.name = "";
        this.system = "default";
        this.engine = "default";
        this._init = false;
        this.service_manager = Manager;
    }
    static get properties() {
        return {
            name: { type: String },
            system: { type: String },
            engine: { type: String },
            status: { type: String }
        };
    }
    get value() {
        if (!this._init)
            return undefined;
        if (this.service_manager.dataTree.ExistVar(this))
            return this.datatree[this.system][this.name].value;
        else
            return null;
    }
    get status() {
        if (!this._init)
            return VarStatusCodes.Pending;
        if (this.service_manager.dataTree.ExistVar(this))
            return this.datatree[this.system][this.name].status;
        else
            return VarStatusCodes.Error;
    }
    set status(Status) {
        if (typeof Status !== "string")
            return;
        if (!this.service_manager.dataTree.ExistVar(this))
            return;
        const old_val = this.getAttribute("status");
        if (old_val !== Status || old_val !== this.status) {
            this.DataUpdate(null, Status);
        }
    }
    on_datatree_update() {
        this.setAttribute("status", this.status);
    }
    connectedCallback() {
        super.connectedCallback();
        // maybe here dispatch READY event??
        // maybe here resolve a READY promise so one can await it??
        Manager.Subscribe(this.engine, this).then(() => {
            this._init = true;
            this.on_datatree_update();
            this.requestUpdate();
        });
    }
    disconnectedCallback() {
        if (super.disconnectedCallback)
            super.disconnectedCallback();
        Manager.Unsubscribe(this.engine, this);
    }
    async Write(value) {
        return await this.WriteMultiple([this], [value]);
    }
    async WriteMultiple(targets, values) {
        return await Manager.Write(this.engine, targets, values);
    }
    async Read() {
        return this.ReadMultiple([this]);
    }
    async ReadMultiple(targets) {
        return await Manager.Read(this.engine, targets);
    }
    DataUpdate(Value, Status) {
        let sysVar = new systemVariable(this);
        sysVar.status = Status;
        sysVar.value = Value;
        this.DataUpdateMultiple(sysVar);
    }
    DataUpdateMultiple(sysvar) {
        Manager.Update(sysvar);
    }
}

class Loader extends LitElement {
    static get styles() {
        return css `
            :host{
                display:block;
            }
            path{
                stroke: var(--color, #3498db);
            }
            .loader {
                animation: spin var(--speed,0.7s) linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
    }
    render() {
        return html `
        <svg class="loader" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <path style="fill: none; stroke-width: 75;" d="M 238 38 C 362.264 38 463 138.736 463 263"></path>
        </svg>
        `;
    }
}
customElements.define("x-loader", Loader);

class statusSwitch extends hmiElement {
    static get styles() {
        return css `
        
            :host{
                display: block;
            }
            * {
                display : none;
            }
            x-loader{
                --color : var(--loaderColor);
            }

            [show]{
                display:block;
            }
        `;
    }
    render() {
        return html `
        <x-loader ?show="${this.status === VarStatusCodes.Pending}" > </x-loader>
        <slot  ?show="${this.status === VarStatusCodes.Subscribed}" name="sub"></slot>
        <slot  ?show="${this.status === VarStatusCodes.Unsubscribed}" name="unsub"> </slot>
        <slot  ?show="${this.status === VarStatusCodes.Error}" name="error"> </slot>
        `;
    }
}
//@ts-ignore
customElements.define("status-switch", statusSwitch);

class boolColorSwitch extends hmiElement {
    static get styles() {
        return css `
            :host{
                display:block;
                cursor : pointer;
            }
            slot, x-loader{
                display:none;
            }
            slot[show]{
                display:contents;
            }
            x-loader[show]{
                display:block;
            }
            slot {
                cursor : pointer;
            }
            :host([status="ERROR"]) > slot{
                cursor : not-allowed ;
            }
            :host([status="UNSUBSCRIBED"]) > slot{
                cursor : not-allowed ;
            }
            :host([read-only]) > slot{
                cursor : auto ;
            }
            [show]{
                display:block;
            }
            [val="on"]::slotted(*){
                stroke : black;
                fill : green;
            }
            [val="off"]::slotted(*){
                stroke : black;
                fill : lightgray;
            }
            :host([status="ERROR"]) > ::slotted(*){
                stroke : black;
                fill : red;
            }
            :host([status="UNSUBSCRIBED"]) > ::slotted(*){
                stroke : yellow;
            }
        `;
    }
    render() {
        return html `
            <slot val="${this.value ? "on" : "off"}" 
                  @click="${this.onclick}"
                  ?show="${this.status !== VarStatusCodes.Pending}"> Empty Slot</slot>
            <x-loader ?show="${this.status === VarStatusCodes.Pending}"></x-loader>
        `;
    }
    onclick() {
        let sts = this.status; // avoid the getter function call
        if (this.hasAttribute("read-only") ||
            sts === VarStatusCodes.Error ||
            sts === VarStatusCodes.Pending ||
            sts === VarStatusCodes.Unsubscribed)
            return;
        let toggle = this.value ? false : true;
        this.Write(toggle);
    }
}
//@ts-ignore
customElements.define("bool-color", boolColorSwitch);

class hmiLabel extends hmiElement {
    static get styles() {
        return css `
            :host{
                display:flex;
                flex-direction : column;
                justify-content : center;
                align-items : center;
            }
            div{
                border-style : solid;
                border-width : var(--border-w,1px);
                border-color : var(--border-c,grey);
                border-radius : var(--border-r,0.4rem);
                padding: var(--padding,0.2rem);
                font-family: 'Roboto', sans-serif;
                margin-bottom : 0.2rem;
                width:100%;
                text-align:center;
                color:var(--base-color,#333333);
            }
            :host([status="ERROR"]) > div{
                color : var(--error-color,red);
            }
            :host([status="WARNING"]) > div{
                color : var(--warning-color,orange);
            }
        `;
    }
    render() {
        return html `
            <div><strong>${this.name}</strong></div>
            <slot>Empty Slot</slot>
        `;
    }
}
//@ts-ignore
customElements.define("hmi-label", hmiLabel);

class pvrIcon extends LitElement {
    render() {
        return html `
        <svg viewBox="251.36 1.721 53.863 51.142" xmlns="http://www.w3.org/2000/svg">
            <g>
            <g>
                <polygon  points="278.2,37.2 253,22.6 253,51.7" style="stroke-miterlimit: 10;"></polygon>
                <polygon  points="278.8,37.2 304,51.7 304,22.6" style="stroke-miterlimit: 10;"></polygon>
            </g>
            <circle cx="278.8" cy="37.2" r="9.6" style="stroke-miterlimit: 10;"></circle>
            <rect x="266.8" y="3.2" class="st0" width="23.9" height="13.9" style="stroke-miterlimit: 10;"></rect>
            <rect x="271.8" y="3.2" class="st3" width="13.9" height="13.9" style="fill:none; stroke-miterlimit: 10;"></rect>
            <line x1="278.8" y1="27.6" x2="278.8" y2="10.1" style="stroke-miterlimit: 10;"></line>
            <line x1="271.8" y1="10.1" x2="285.7" y2="10.1" style="stroke-miterlimit: 10;"></line>
            </g>
        </svg>
        `;
    }
}
customElements.define("pvr-icon", pvrIcon);
class pvdIcon extends LitElement {
    render() {
        return html `
        <svg viewBox="140.37 3.264 54.407 50.055" xmlns="http://www.w3.org/2000/svg">
            <g>
            <g>
                <polygon  points="167.1,37.2 141.9,22.6 141.9,51.7" style="stroke-miterlimit: 10;"></polygon>
                <polygon  points="167.7,37.2 192.9,51.7 192.9,22.6" style="stroke-miterlimit: 10;"></polygon>
            </g>
            <circle  cx="167.7" cy="37.2" r="9.6" style="stroke-miterlimit: 10;"></circle>
            <line  x1="167.7" y1="27.6" x2="167.7" y2="12.3" style="stroke-miterlimit: 10;"></line>
            <path  d="M175.4,12.3c0-4.2-3.4-7.7-7.7-7.7S160,8,160,12.3H175.4z" style="stroke-miterlimit: 10;"></path>
            </g>
        </svg>
        `;
    }
}
customElements.define("pvd-icon", pvdIcon);
class ValvePR extends hmiElement {
    static get styles() {
        return css `
            bool-color{
                width : 100%;
            }
        `;
    }
    render() {
        return html `
            <hmi-label name="${this.name}"  engine="${this.engine}" system="${this.system}">
                <bool-color name="${this.name}"  engine="${this.engine}" system="${this.system}"> 
                    <pvr-icon></pvr-icon>
                </bool-color>
            </hmi-label>
        `;
    }
}
//@ts-ignore
customElements.define("valve-pr", ValvePR);
class ValvePD extends hmiElement {
    static get styles() {
        return css `
            bool-color{
                width : 100%;
            }
        `;
    }
    render() {
        return html `
            <hmi-label name="${this.name}"  engine="${this.engine}" system="${this.system}">
                <bool-color name="${this.name}"  engine="${this.engine}" system="${this.system}"> 
                    <pvd-icon></pvd-icon>
                </bool-color>
            </hmi-label>
        `;
    }
}
//@ts-ignore
customElements.define("valve-pd", ValvePD);

/*let engine = new JsonPollEngine("std",{
    readPrefix : "api/JSON/read",
    writePrefix: "api/JSON/write",
    readInterval_ms : 2000
});
*/


let engine = new fakeDataEngine("std");

Manager.AddEngine(engine);
Manager.Init();
//# sourceMappingURL=main.js.map
