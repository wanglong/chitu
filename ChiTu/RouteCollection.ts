﻿namespace chitu {

    var ns = chitu;
    var e = chitu.Errors;

    export class RouteCollection {
        _source: any
        _priority: number

        static defaultRouteName: string = 'default';

        _defaults: {}

        constructor(){
             this._init();    
        }
        
        _init() {
            var crossroads = window['crossroads']
            this._source = crossroads.create();
            this._source.ignoreCase = true;
            this._source.normalizeFn = crossroads.NORM_AS_OBJECT;
            this._priority = 0;
        }
        count() {
            return this._source.getNumRoutes();
        }
        routeMatched = chitu.Callbacks();
        mapRoute(args) {//name, url, defaults
            /// <param name="args" type="Objecct"/>
            args = args || {};

            var name = args.name;
            var url = args.url;
            var defaults = args.defaults;
            var rules = args.rules || {};

            if (!name) throw e.argumentNull('name');
            if (!url) throw e.argumentNull('url');

            this._priority = this._priority + 1;


            var self = this;
            var originalRoute = this._source.addRoute(url, function (args) {
                var values = $.extend(defaults, args);
                self.routeMatched.fire([name, values]);
            }, this._priority);

            var route = new chitu.Route(name, url, defaults);
            route.viewPath = args.viewPath;
            route.actionPath = args.actionPath;

            originalRoute.rules = rules;
            originalRoute.newRoute = route;

            if (this[name])
                throw e.routeExists(name);

            this[name] = route;
            if (name == ns.RouteCollection.defaultRouteName) {
                this._defaults = defaults;
            }
            return route;
        }
        getRouteData(url) {
            /// <returns type="Object"/>
            var data = this._source.getRouteData(url);
            if (data == null)
                throw e.canntParseUrl(url);

            var values: any = {};
            var paramNames = data.route._paramsIds || [];
            for (var i = 0; i < paramNames.length; i++) {
                var key = paramNames[i];
                values[key] = data.params[0][key];
            }

            values.viewPath = data.route.newRoute.viewPath;
            values.actionPath = data.route.newRoute.actionPath;

            return values;
        }
    }
} 