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
 * HTTP Verbose Sets
 */
const HTTPValidVerbose = new Set(['get','post','patch','head','delete','put']);

/**
 * @class APIDescriptor
 * @property {String} methodName 
 * @property {Function} methodFn
 * @param {Object} _descriptor 
 * @param {Array<Object>} _acls
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
        this._acls = [];
        this._descriptor = {
            http: {},
            accepts: [],
            returns: []
        };
    }

    /**
     * @public
     * @method APIDescriptor.http
     * @param {String} path 
     * @param {String} verb 
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError}
     */
    http(path,verb = 'get') {
        if('string' !== typeof(path)) {
            throw new TypeError('path should be a string');
        }
        if('string' !== typeof(verb)) {
            throw new TypeError('verb should be a string');
        }
        if(!HTTPValidVerbose.has(verb.toLowerCase())) {
            throw new TypeError(`invalid HTTP Verbose ${verb}`);
        }
        this._descriptor.http = {verb,path};
        return this;
    }

    /**
     * @public
     * @method APIDescriptor.errorStatus
     * @param {Number} errorCode 
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError}
     */
    errorStatus(errorCode) {
        if('number' !== typeof(errorCode)) {
            throw new TypeError('erroCode should be a number');
        }
        this._descriptor.http.errorStatus = errorCode;
        return this;
    }

    /**
     * @public
     * @method APIDescriptor.status
     * @param {Number} statusCode 
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError}
     */
    status(statusCode) {
        if('number' !== typeof(statusCode)) {
            throw new TypeError('erroCode should be a number');
        }
        this._descriptor.http.status = statusCode;
        return this;
    }

    /**
     * @public
     * @method APIDescriptor.get
     * @param {String} path
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError} 
     */
    get(path) {
        if('string' !== typeof(path)) {
            throw new TypeError('path should be a string');
        }
        return this.http(path,'get');
    }

    /**
     * @public
     * @method APIDescriptor.post
     * @param {String} path
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError} 
     */
    post(path) {
        if('string' !== typeof(path)) {
            throw new TypeError('path should be a string');
        }
        return this.http(path,'post');
    }

    /**
     * @public
     * @method APIDescriptor.delete
     * @param {String} path
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError} 
     */
    delete(path) {
        if('string' !== typeof(path)) {
            throw new TypeError('path should be a string');
        }
        return this.http(path,'delete');
    }

    /**
     * @public
     * @method APIDescriptor.put
     * @param {String} path
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError} 
     */
    put(path) {
        if('string' !== typeof(path)) {
            throw new TypeError('path should be a string');
        }
        return this.http(path,'put');
    }

    /**
     * @public
     * @method APIDescriptor.patch
     * @param {String} path
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError} 
     */
    patch(path) {
        if('string' !== typeof(path)) {
            throw new TypeError('path should be a string');
        }
        return this.http(path,'patch');
    }

    /**
     * @public
     * @method APIDescriptor.content
     * @param {String} contentType 
     * @return {APIDescriptor}
     * 
     * @throws {TypeError}
     */
    content(contentType) {
        if('string' !== typeof(contentType)) {
            throw new TypeError('content type should be a string');
        }
        this.contentType = contentType;
        return this;
    }

    /**
     * @public
     * @method APIDescriptor.desc
     * @param {String} description 
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError}
     */
    desc(description) {
        if('string' !== typeof(description)) {
            throw new TypeError('description should be a string!');
        }
        this._descriptor['description'] = description;
        return this;
    }

    /**
     * @public
     * @method APIDescriptor.disable
     * @returns {APIDescriptor}
     */
    disable() {
        this._descriptor.documented = false;
        return this;
    }

    /**
     * @public
     * @method APIDescriptor.accept
     * @param {Object} param0 
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError}
     * @throws {Error}
     */
    accept({ 
        arg = '' , 
        type = 'string', 
        required = false, 
        description,
        source 
    }) {
        if('string' !== typeof(arg)) {
            throw new TypeError('arg should be a string');
        }
        if(arg === '') {
            throw new Error('arg cannot be an empty string');
        }
        if('boolean' !== typeof(required)) {
            throw new TypeError('required should be a boolean');
        }
        if('string' !== typeof(type)) {
            throw new TypeError('type should be a string');
        }
        const index = this._descriptor.accepts.push({arg,type,required});
        if('string' === typeof(description)) {
            this._descriptor.accepts[index - 1]['description'] = description;
        }
        if('string' === typeof(source)) {
            this._descriptor.accepts[index - 1]['http'] = {source};
        }
        return this;
    }

    /**
     * @public
     * @method APIDescriptor.accept_response
     * @returns {APIDescriptor}
     */
    accept_response() {
        return this.accept({ arg: 'res', type: 'object', source: 'res' });
    }

    /**
     * @public
     * @method APIDescriptor.accept_request
     * @returns {APIDescriptor}
     */
    accept_request() {
        return this.accept({ arg: 'req', type: 'object', source: 'req' });
    }

    /**
     * @public
     * @method APIDescriptor.returns
     * @param {Object} param0 
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError}
     */
    returns({ 
        arg = 'response', 
        type = 'string', 
        root = true,
        target 
    }) {
        if('string' !== typeof(arg)) {
            throw new TypeError('arg should be a string');
        }
        if('boolean' !== typeof(root)) {
            throw new TypeError('root should be a boolean');
        }
        if('string' !== typeof(type)) {
            throw new TypeError('type should be a string');
        }
        const index = this._descriptor.returns.push({arg,type,root});
        if('string' === typeof(target)) {
            this._descriptor.returns[index - 1]['http'] = {target};
        }
        return this;
    }

    /**
     * @public
     * @method APIDescriptor.allow
     * @param {String} principalId 
     * @param {String} accessType 
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError}
     */
    allow(principalId,accessType = 'EXECUTE') {
        if('string' !== typeof(principalId)) {
            throw new TypeError('principalId should be a string!');
        }
        if('string' !== typeof(accessType)) {
            throw new TypeError('accessType should be a string!');
        }
        if(principalId.charAt(0) !== '$') {
            principalId = `$${principalId}`;
        }
        this._acls.push({ 
            principalType: 'ROLE',
            principalId,
            permission: 'ALLOW',
            property: this.methodName,
            accessType
        });
        return this;
    }

    /**
     * @public
     * @method APIDescriptor.deny
     * @param {String} principalId 
     * @param {String} accessType 
     * @returns {APIDescriptor}
     * 
     * @throws {TypeError}
     */
    deny(principalId,accessType = 'EXECUTE') {
        if('string' !== typeof(principalId)) {
            throw new TypeError('principalId should be a string!');
        }
        if('string' !== typeof(accessType)) {
            throw new TypeError('accessType should be a string!');
        }
        if(principalId.charAt(0) !== '$') {
            principalId = `$${principalId}`;
        }
        this._acls.push({ 
            principalType: 'ROLE',
            principalId,
            permission: 'DENY',
            property: this.methodName,
            accessType
        });
        return this;
    }

    /**
     * @public
     * @method APIDescriptor.getDescriptor
     * @returns {Object}
     */
    getDescriptor() {
        return this._descriptor;
    }
}

/**
 * Properties Validation Set & Handler
 */
const validTypeProperty = new Set([
    'unique',
    'numeric',
    'presence',
    'length_min',
    'length_max',
    'inclusion',
    'exclusion',
    'absence',
    'required',
    'type'
]);

const validDefinitionProperty = new Set([
    'required',
    'type'
]);

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
 * LoopbackModel constructor
 * @interface loopbackModelConstructor
 */
const loopbackModelConstructor = {
    isAuthenticated: false
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
 * @property {Boolean} isAuthenticated
 */
class loopbackModel extends events {

    /**
     * @constructor
     */
    constructor(options = {}) {
        super();
        this.disableBuiltInMethods = false;
        this.disableBuiltInExceptions = [];
        this.remoteMethods = new Set();
        this.attributes = new Map();
        this.observers = new Map();
        Object.assign(this,loopbackModelConstructor,options);
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
            presence: configuration.presence || propertyName
        };
        for(let key in configuration) {
            if(!validTypeProperty.has(key)) continue;
            if(key === 'absence') {
                delete _tConf.presence;
            }
            _tConf[key] = configuration[key];
        }
        this.attributes.set(propertyName,_tConf);
        return this;
    }

    /**
     * Disable all loopback model built-in methods
     * @public
     * @method loopbackModel.disableAllMethods
     * @param {Array<String>} except 
     * @returns {loopbackModel}
     */
    disableAllMethods(except) {
        if(except instanceof Array) {
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
    registerRemoteMethod(method,errorHandler,addToMiddleware = true) {
        if('function' !== typeof(method)) {
            throw new TypeError('method should be a function');
        }
        if(method.name === 'anonymous') {
            throw new Error('method function cannot be anonymous');
        }
        if(addToMiddleware === true) {
            this.disableBuiltInExceptions.push(method.name);
        }
        const fn = function() {
            const cb = arguments[arguments.length -1];
            method({
                params: arguments,
                model: this.Model,
                app: this.Model.app
            }).then(response => {
                cb(null,response);
            }).catch(E => {
                try {
                    if('undefined' !== typeof(errorHandler)) errorHandler(E);
                    cb(E);
                }
                catch(E) {
                    cb(E);
                }
            });
        };
        
        const api = new APIDescriptor(method.name,fn);
        if(this.isAuthenticated === true) {
            api.deny('everyone','*');
            api.allow('authenticated','*');
        }
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
                if('undefined' !== typeof(api.contentType)) {
                    Model.afterRemote(api.methodName,function(ctx, instance, next) {
                        ctx.res.header('Content-Type', api.contentType);
                        next();
                    });
                }
                Model.remoteMethod(api.methodName,api.getDescriptor());

                // Push ACLs
                if(api._acls.length > 0) {
                    Model.definition.settings.acls.push(...api._acls);
                }
            });

            // Apply properties configuration
            this.attributes.forEach((attributes,propertyName) => {
                if(Model.definition.rawProperties.hasOwnProperty(propertyName) === false) {
                    Model.definition.rawProperties[propertyName] = {};
                }
                if(Model.definition.properties.hasOwnProperty(propertyName) === false) {
                    Model.definition.properties[propertyName] = {};
                }
                Object.keys(attributes).forEach( (propertyKey) => {
                    if(validDefinitionProperty.has(propertyKey)) {
                        Model.definition.rawProperties[propertyName][propertyKey] = attributes[propertyKey];
                        Model.definition.properties[propertyName][propertyKey] = attributes[propertyKey];
                        return;
                    }
                    
                    propertyValidHandler[propertyKey](Model,propertyName,attributes[propertyKey]);
                });
            });

            // Apply observers
            this.observers.forEach((handler,hookName) => {
                Model.observe(hookName,handler);
            });
            if('function' === typeof(customHandler)) {
                customHandler(Model);
            }
        };
    }

}

// Export loopbackModel class as Default
module.exports = loopbackModel;