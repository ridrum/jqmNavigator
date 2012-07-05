/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 7/5/12
 * Time: 4:02 PM
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(this, function ($) {

    $(document).bind("mobileinit", function () {

        $.mobile.ajaxEnabled = false;

        $.mobile.linkBindingEnabled = false;

        $.mobile.hashListeningEnabled = false;

        $.mobile.pushStateEnabled = false;

        $.mobile.autoInitializePage = false;

        $.extend($.mobile, {
            jqmNavigator:{

                _initialized:false,

                _containers:[],

                defaultPageContainer:null,

                /**
                 * Pushes view to the stack.
                 *
                 * @param view {Backbone.View}
                 * @param options {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 */
                pushView:function jqmNavigator_pushView(view, options) {
                    var containerViews = this._getPageContainerViews(options);

                    // Pushing the view to the stack
                    containerViews.views.push(view);
                    // Appending the view to the DOM
                    containerViews.pageContainer.append(view.el);
                    // Rendering the view
                    view.render();

                    if (!this._initialized) {
                        // Adding data-role with page value
                        view.$el.attr('data-role', 'page');

                        // First time initialization
                        $.mobile.initializePage();
                        // Setting to true after initialization
                        this._initialized = true;
                    } else {
                        // Changing page
                        $.mobile.changePage(view.$el, $.extend({
                            role:'page',
                            changeHash:false,
                            pageContainer:containerViews.pageContainer
                        }, options));
                    }
                },

                /**
                 * Pops view from the stack.
                 *
                 * @param options {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 */
                popView:function jqmNavigator_popView(options) {
                    var containerViews = this._getPageContainerViews(options);
                    if (containerViews.views.length > 1) {
                        // From view ref
                        var fromView = containerViews.views.pop();
                        // To view ref
                        toView = containerViews.views[containerViews.views.length - 1];

                        fromView.$el.on('pagehide', function (event) {
                            // Removing pagehide handler
                            fromView.$el.off('pagehide', arguments.callee);

                            // Detaching view from DOM
                            fromView.$el.detach();
                        });

                        // Changing to view below current one
                        $.mobile.changePage(toView.$el, $.extend({
                            role:'page',
                            reverse:true,
                            changeHash:false,
                            pageContainer:containerViews.pageContainer
                        }, options));

                    } else {
                        console.log('Can\'t pop first view, you can replace it instead!');
                    }
                },

                /**
                 * Pops views from a stack up to the first one.
                 *
                 * @param options {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 */
                popToFirst:function jqmNavigator_popToFirst(options) {
                    var containerViews = this._getPageContainerViews(options);
                    if (containerViews.views.length > 1) {
                        // From view ref
                        var fromView = containerViews.views[containerViews.views.length - 1],
                        // To view ref
                            toView = containerViews.views[0],
                        // Removed views
                            removedViews = containerViews.views.splice(1, containerViews.views.length - 1);

                        fromView.$el.on('pagehide', function (event) {
                            // Removing pagehide handler
                            fromView.$el.off('pagehide', arguments.callee);

                            removedViews.forEach(function (item) {
                                item.$el.detach();
                            }, this);
                        });

                        // Changing to view below current one
                        $.mobile.changePage(toView.$el, $.extend({
                            role:'page',
                            reverse:true,
                            changeHash:false,
                            pageContainer:containerViews.pageContainer
                        }, options));

                    } else {
                        console.log('Can\'t pop first view, you can replace it instead!');
                    }
                },

                /**
                 * Replaces current view on the stack.
                 *
                 * @param options {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 */
                replaceView:function jqmNavigator_replaceView(view, options) {
                    var containerViews = this._getPageContainerViews(options);
                    if (containerViews.views.length >= 1) {
                        // From view ref
                        var fromView = containerViews.views.pop();
                        fromView.$el.on('pagehide', function (event) {
                            // Removing pagehide handler
                            fromView.$el.off('pagehide', arguments.callee);

                            // Detaching view from DOM
                            fromView.$el.detach();
                        });

                        // Pushing the view to the stack
                        containerViews.views.push(view);
                        // Appending the view to the DOM
                        containerViews.pageContainer.append(view.el);
                        // Rendering the view
                        view.render();

                        // Changing page
                        $.mobile.changePage(view.$el, $.extend({
                            role:'page',
                            changeHash:false,
                            pageContainer:containerViews.pageContainer
                        }, options));
                    }
                },

                /**
                 * Replaces all views on the stack.
                 *
                 * @param options {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 */
                replaceAll:function jqmNavigator_replaceAll(view, options) {
                    var containerViews = this._getPageContainerViews(options);
                    if (containerViews.views.length >= 1) {
                        // From view ref
                        var fromView = containerViews.views[containerViews.views.length - 1],
                        // Removed views
                            removedViews = containerViews.views.splice(0, containerViews.views.length);

                        fromView.$el.on('pagehide', function (event) {
                            // Removing pagehide handler
                            fromView.$el.off('pagehide', arguments.callee);

                            removedViews.forEach(function (item) {
                                item.$el.detach();
                            }, this);
                        });

                        // Pushing the view to the stack
                        containerViews.views.push(view);
                        // Appending the view to the DOM
                        containerViews.pageContainer.append(view.el);
                        // Rendering the view
                        view.render();

                        // Changing page
                        $.mobile.changePage(view.$el, $.extend({
                            role:'page',
                            changeHash:false,
                            pageContainer:containerViews.pageContainer
                        }, options));

                    }
                },

                _getPageContainerViews:function (options) {
                    var pageContainer = options && options.pageContainer ? options.pageContainer :
                            $.mobile.pageContainer || this.defaultPageContainer || $('body'),
                        result;

                    this._containers.some(function (item) {
                        if (item.pageContainer[0] === pageContainer[0]) {
                            result = item;
                            return true;
                        }
                    }, this);

                    if (!result) this._containers.push(result = {pageContainer:pageContainer, views:[]});

                    return result;
                }

            }
        });
    });

}));