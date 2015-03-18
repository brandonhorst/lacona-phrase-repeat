"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/** @jsx createElement */

var _ = _interopRequire(require("lodash"));

var _laconaPhrase = require("lacona-phrase");

var createElement = _laconaPhrase.createElement;
var Phrase = _laconaPhrase.Phrase;

var Repeat = (function (_Phrase) {
  function Repeat() {
    _classCallCheck(this, Repeat);

    if (_Phrase != null) {
      _Phrase.apply(this, arguments);
    }
  }

  _inherits(Repeat, _Phrase);

  _createClass(Repeat, {
    filter: {
      value: function filter(result) {
        if (this.props.unique && _.isPlainObject(result) && result.repeat) {
          return !_.includes(result.repeat, result.child);
        }
        return true;
      }
    },
    getValue: {
      value: function getValue(result) {
        if (_.isPlainObject(result) && result.repeat) {
          if (result.child) {
            return result.repeat.concat([result.child]);
          } else {
            return result.repeat;
          }
        } else {
          return [result];
        }
      }
    },
    describe: {
      value: function describe() {
        var child = undefined,
            separator = undefined;

        if (this.props.children.length > 0 && this.props.children[0].Constructor === "content") {
          child = this.props.children[0].children[0];
          if (this.props.children.length > 1 && this.props.children[1].Constructor === "separator") {
            separator = this.props.children[1].children[0];
          }
        } else {
          child = this.props.children[0];
        }

        if (this.props.max === 1) {
          return child;
        } else {
          var childWithId = _.merge({}, child, { props: { id: "child" } });
          var content = separator ? createElement(
            "sequence",
            { merge: true },
            childWithId,
            separator
          ) : childWithId;

          var recurse = createElement(
            "sequence",
            null,
            content,
            createElement(
              Repeat,
              { id: "repeat", unique: this.props.unique, max: this.props.max - 1, min: this.props.min - 1 },
              this.props.children
            )
          );

          if (this.props.min <= 1) {
            return createElement(
              "choice",
              null,
              child,
              recurse
            );
          } else {
            return recurse;
          }
        }
      }
    }
  }, {
    defaultProps: {
      get: function () {
        return {
          max: Number.MAX_SAFE_INTEGER,
          min: 1,
          unique: false
        };
      }
    }
  });

  return Repeat;
})(Phrase);

module.exports = Repeat;