// Require Node.JS module
const events = require('events');

/**
 * @function disableModelMethods
 * @param {Loopback.Model} model 
 * @param {Array<String>} methodsToExpose 
 * @returns {void}
 * @throws {TypeError}
 */
function disableModelMethods(model, methodsToExpose = []) {
    if('undefined' === typeof(model)) {
        throw new TypeError('model cant\'t be undefined');
    }
    const methods = model.sharedClass.methods();
    const relationMethods = [];

    try {
        Object.keys(model.definition.settings.relations)
        .forEach(function (relation) {
            relationMethods.push({ name: '__findById__' + relation, isStatic: false });
            relationMethods.push({ name: '__destroyById__' + relation, isStatic: false });
            relationMethods.push({ name: '__updateById__' + relation, isStatic: false });
            relationMethods.push({ name: '__exists__' + relation, isStatic: false });
            relationMethods.push({ name: '__link__' + relation, isStatic: false });
            relationMethods.push({ name: '__get__' + relation, isStatic: false });
            relationMethods.push({ name: '__create__' + relation, isStatic: false });
            relationMethods.push({ name: '__update__' + relation, isStatic: false });
            relationMethods.push({ name: '__destroy__' + relation, isStatic: false });
            relationMethods.push({ name: '__unlink__' + relation, isStatic: false });
            relationMethods.push({ name: '__count__' + relation, isStatic: false });
            relationMethods.push({ name: '__delete__' + relation, isStatic: false });
        });
    } catch (err) {
        // Empty statment
    }

    methods.concat(relationMethods).forEach(function (method) {
        if (methodsToExpose.indexOf(method.name) < 0) {
            model.disableRemoteMethodByName(method.name, method.isStatic);
        }
    });
}

/**
 * @class APIDescriptor
 * @property {String} methodName 
 * @property {Function} methodFn 
 */
class APIDescriptor {

    /**
     * @constructor
     * @param {String} methodName 
     * @param {Function} methodFn 
     */
    constructor(methodName,methodFn) {
        this.methodName = methodName;
        this.methodFn = methodFn;
        this._swaggerDescriptor = {
            http: {},
            accepts: [],
            returns: {
                arg: 'response', 
                type: 'string'
            }
        };
    }

    /**
     * @public
     * @method loopbackModelAPI.http
     * @param {String} path 
     * @param {String} verb 
     * @returns {loopbackModelAPI}
     * 
     * @throws {TypeError}
     */
    http(path,verb = 'get') {
        if('string' !== typeof(path)) {
            throw new TypeError('path should be a string');
        }
        verb = verb.toLocaleLowerCase();
        this._swaggerDescriptor.http['verb'] = verb;
        this._swaggerDescriptor.http['path'] = path;
        return this;
    }

    /**
     * @public
     * @method loopbackModelAPI.accept
     * @param {Object} param0 
     * @returns {loopbackModelAPI}
     * 
     * @throws {TypeError}
     */
    accept({ arg , type = 'string', required = false }) {
        if('string' !== typeof(arg)) {
            throw new TypeError('arg should be a string');
        }
        if('string' !== typeof(type)) {
            throw new TypeError('type should be a string');
        }
        if('boolean' !== typeof(required)) {
            throw new TypeError('required should be a boolean');
        }
        this._swaggerDescriptor.accepts.push({
            arg,type,required
        });
        return this;
    }

    /**
     * @public
     * @method loopbackModelAPI.returns
     * @param {Object} param0 
     * @returns {loopbackModelAPI}
     * 
     * @throws {TypeError}
     */
    returns({ arg = 'response', type = 'string', root = true }) {
        if('string' !== typeof(arg)) {
            throw new TypeError('arg should be a string');
        }
        if('string' !== typeof(type)) {
            throw new TypeError('type should be a string');
        }
        if('boolean' !== typeof(root)) {
            throw new TypeError('root should be a boolean');
        }
        this._swaggerDescriptor.returns = {
            arg,type,root
        };
        return this;
    }

    /**
     * @public
     * @method loopbackModelAPI.getDescriptor
     * @returns {Object}
     */
    getDescriptor() {
        return this._swaggerDescriptor;
    }
}

/**
 * Properties Validation Set & Handler
 */
const propertyValidProperties = new Set(['unique','numeric','length_min','length_max','inclusion','exclusion','absence']);
const propertyValidHandler = {
    unique(Model,propertyName,propertyValue) {
        if(propertyValue === false) return;
        Model.validatesUniquenessOf(propertyName);
    },
    presence(Model,propertyName) {
        Model.validatesPresenceOf(propertyName);
    },
    absence(Model,propertyName) {
        Model.validatesAbsenceOf(propertyName);
    },
    length_min(Model,propertyName,propertyValue) {
        if('number' !== typeof(propertyValue)) return;
        Model.validatesLengthOf(propertyName,{min: propertyValue});
    },
    length_max(Model,propertyName,propertyValue) {
        if('number' !== typeof(propertyValue)) return;
        Model.validatesLengthOf(propertyName,{max: propertyValue});
    },
    numeric(Model,propertyName,propertyValue) {
        if('boolean' !== typeof(propertyValue)) return;
        Model.validatesNumericalityOf(propertyName,{int: propertyValue});
    },
    inclusion(Model,propertyName,propertyValue) {
        if(propertyValue instanceof Array === false) return;
        Model.validatesInclusionOf(propertyName,{in: propertyValue});
    },
    exclusion(Model,propertyName,propertyValue) {
        if(propertyValue instanceof Array === false) return;
        Model.validatesExclusionOf(propertyName,{in: propertyValue});
    }
};

/**
 * Class to create a loopback Model and apply an overhead simplication of the original API!
 * @class loopbackModel
 * @extends events
 * 
 * @property {Boolean} disableBuiltInMethods
 * @property {Array.<String>} disableBuiltInExceptions
 * @property {Set.<APIDescriptor>} remoteMethods
 * @property {Map.<String,Object>} attributes
 * @property {Map.<String,Function>} observers
 */
class loopbackModel extends events {

    /**
     * @constructor
     */
    constructor() {
        super();
        this.disableBuiltInMethods = false;
        this.disableBuiltInExceptions = [];
        this.remoteMethods = new Set();
        this.attributes = new Map();
        this.observers = new Map();
    }

    /**
     * @public
     * @method loopbackModel.property
     * @param {String} propertyName 
     * @param {Object} configuration 
     * @returns {loopbackModel}
     * 
     * @throws {TypeError}
     */
    property(propertyName,configuration = {}) {
        if('string' !== typeof(propertyName)) {
            throw new TypeError('propertyName should be a string');
        }
        if('object' !== typeof(configuration)) {
            throw new TypeError('configuration should be an object');
        }
        const _tConf = {
            presence: propertyName
        };
        for(let key in configuration) {
            if(propertyValidProperties.has(key) === false) continue;
            if(key === 'absence') {
                delete _tConf.presence;
            }
            _tConf[key] = configuration[key];
        }
        this.attributes.set(propertyName,_tConf);
    }

    /**
     * Disable all loopback model built-in methods
     * @public
     * @method loopbackModel.disableAllMethods
     * @param {Array<String>} except 
     * @returns {loopbackModel}
     */
    disableAllMethods(except) {
        if(except instanceof Array === true) {
            this.disableBuiltInExceptions.push(...except);
        }
        this.disableBuiltInMethods = true;
        return this;
    }

    /**
     * @public
     * @method loopbackModel.registerRemoteMethod
     * @param {Function} method 
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError}
     * @throws {Error}
     */
    registerRemoteMethod(method) {
        if('function' !== typeof(method)) {
            throw new TypeError('method should be a function');
        }
        if(method.name === 'anonymous') {
            throw new Error('method function cannot be anonymous');
        }
        this.disableBuiltInExceptions.push(method.name);
        const fn = function() {
            const ctx = {
                params: arguments,
                model: this.Model,
                app: this.Model.app
            };
            const cb = arguments[arguments.length -1];
            method(ctx).then(response => {
                cb(null,response);
            }).catch(E => {
                cb(E);
            });
        };
        
        const api = new APIDescriptor(method.name,fn);
        this.remoteMethods.add(api);
        return api;
    }

    /**
     * @public
     * @method loopbackModel.observe
     * @param {String} hook 
     * @param {Function} handler 
     * @returns {loopbackModel}
     * 
     * @throws {TypeError}
     */
    observe(hook,handler) {
        if('string' !== typeof(hook)) {
            throw new TypeError('hook should be a string');
        }
        if('function' !== typeof(handler)) {
            throw new TypeError('handler should be a function');
        }
        this.observers.set(hook,handler);
        return this;
    }

    /**
     * @public
     * @method loopbackModel.export
     * @param {Function} customHandler
     * @returns {Function}
     */
    export(customHandler) {
        return (Model) => {
            if('function' === typeof(customHandler)) {
                customHandler(Model);
            }
            if(this.disableBuiltInMethods === true) {
                disableModelMethods(Model,this.disableBuiltInExceptions);
            }

            // Listen for event dataSourceAttached
            Model.on('dataSourceAttached',() => {
                this.emit('dataSourceAttached');
            });

            // Apply functions in the Model
            this.remoteMethods.forEach((api) => {
                const methodFn = api.methodFn.bind({Model});
                Model[api.methodName] = methodFn;
                Model.remoteMethod(api.methodName,api.getDescriptor());
            });

            // Apply properties configuration
            this.attributes.forEach((attributes,propertyName) => {
                Object.keys(attributes).forEach( (propertyKey) => {
                    propertyValidHandler[propertyKey](Model,propertyName,attributes[propertyKey]);
                });
            });

            // Apply observers
            this.observers.forEach((handler,hookName) => {
                Model.observe(hookName,handler);
            });
        };
    }

}

// Export loopbackModel class as Default
module.exports = loopbackModel;