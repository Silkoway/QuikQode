"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var editor_1 = require("./editor");
var builtinStyles = new editor_1.QuikPlugin('Builtin Styles', {
    fileload: function (e) {
        if (e.filename.endsWith('.js') || e.filename.endsWith('.ts')) {
            e.setStyle([
                new editor_1.QuikWord(/\b(indexOf|match|replace|toString|length)(?=[^\w])/, 'support.function'),
                new editor_1.QuikWord(/\b(getElementsBy(TagName|ClassName|Name)|getElementById|typeof|instanceof)(?=[^\w])/g, 'keyword.other'),
                new editor_1.QuikWord(/\b(new|var|const|let|if|do|function|while|switch|for|foreach|in|continue|break)(?=[^\w])/, 'keyword.control'),
                new editor_1.QuikWord(/\b(document|window|Array|String|Object|Number|\$)(?=[^\w])/, 'support.class'),
                new editor_1.QuikWord(/\b(?<=var |let |const )[a-zA-Z$_][a-zA-Z$_0-9]*\b/, 'storage.name'),
                new editor_1.QuikWord(/(\+|-|\*|\/|=|>|<|>=|<=|&|\||%|!|\^)/, 'keyword.operator'),
                new editor_1.QuikWord(/[0-9]+(\.[0-9]+)?/, 'constant.numeric'),
                new editor_1.QuikWord(/'[^']*'/, 'string.quoted.single'),
                new editor_1.QuikWord(/"[^"]*"/, 'string.quoted.double'),
                new editor_1.QuikWord(/\/\/.*/, 'comment.line.double-dash'),
                new editor_1.QuikWord(/\/\*.*\*\//, 'comment.block')
            ]);
        }
    }
});
exports.default = builtinStyles;
//# sourceMappingURL=styles.js.map