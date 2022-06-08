"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtinStyles = void 0;
var styling_1 = require("./styling");
exports.builtinStyles = new styling_1.QuikPlugin('Builtin Styles', {
    fileload: function (e) {
        if (e.filename.endsWith('.js') || e.filename.endsWith('.ts')) {
            e.setStyle([
                new styling_1.QuikWord(/\/\/.*/, 'comment.line.double-dash'),
            ]);
        }
    }
});
//# sourceMappingURL=styles.js.map