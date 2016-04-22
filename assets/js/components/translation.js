'use strict';

const React     = require('react');
const Promise   = require('bluebird');
const routing   = require('./helpers/routing.js');
const request   = require('./helpers/request.js');

// Enable cancelling of promises
Promise.config({cancellation: true});

var cache = {};

var getTranslationForKey = function(key, data, placeholders) {
    var translation = key;
    if (undefined !== data[key]) {
        translation = data[key];
    }

    // Replace placeholders
    if (placeholders) {
        for (var placeholder in placeholders) {
            if (placeholders.hasOwnProperty(placeholder)) {
                translation = translation.replace('%' + placeholder + '%', placeholders[placeholder]);
            }
        }
    }

    return translation;
};

var translate = function(key, placeholders, domain, locale) {
    placeholders = typeof placeholders !== 'undefined' ? placeholders : {};
    domain = typeof domain !== 'undefined' ? domain : 'messages';
    locale = typeof locale !== 'undefined' ? locale : 'fallback';

    if ('fallback' === locale) {
        locale = routing.getLanguage();
    }

    return new Promise(function(resolve, reject, onCancel) {
        // Maybe cached?
        if (undefined !== cache[domain] && undefined !== cache[domain][locale]) {
            return resolve(getTranslationForKey(key, cache[domain][locale], placeholders));
        }

        var req = request.createRequest('/translation/' + locale + '/' + domain)
            .then(function (response) {
                // Cache
                if (undefined === cache[domain]) {
                    cache[domain] = {};
                }
                cache[domain][locale] = response;

                return resolve(getTranslationForKey(key, response, placeholders));
            })
            .catch(function(err) {
                return reject(new Error(err));
            });

        onCancel(function() {
            req.cancel();
        });
    });
};

var Translation = React.createClass({

    translatePromise: null,

    getInitialState: function() {
        return {
            label:  '',
            domain: this.props.domain,
            locale: this.props.locale
        };
    },
    componentDidMount: function() {

        var label = this.props.children;
        var self = this;

        this.translatePromise = translate(label, this.props.placeholders, this.props.domain, this.props.locale);
        this.translatePromise
            .then(function(translation) {
                self.setState({label: translation});
            });
    },

    componentWillUnmount: function() {
        this.translatePromise.cancel();
    },

    render: function() {

        return (
            <span>{this.state.label}</span>
        )
    }
});

module.exports = Translation;
