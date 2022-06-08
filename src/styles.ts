import { QuikPlugin, QuikWord as W } from './editor'

var builtinStyles = new QuikPlugin('Builtin Styles', {
    fileload: e => {
        if (e.filename.endsWith('.js') || e.filename.endsWith('.ts')) {
            e.setStyle([
            
                new W(/\b(indexOf|match|replace|toString|length)(?=[^\w])/, 'support.function'),
                new W(/\b(getElementsBy(TagName|ClassName|Name)|getElementById|typeof|instanceof)(?=[^\w])/g, 'keyword.other'),
                new W(/\b(new|var|const|let|if|do|function|while|switch|for|foreach|in|continue|break)(?=[^\w])/, 'keyword.control'),
                new W(/\b(document|window|Array|String|Object|Number|\$)(?=[^\w])/, 'support.class'),
                new W(/\b(?<=var |let |const )[a-zA-Z$_][a-zA-Z$_0-9]*\b/, 'storage.name'),
                new W(/(\+|-|\*|\/|=|>|<|>=|<=|&|\||%|!|\^)/, 'keyword.operator'),
                new W(/[0-9]+(\.[0-9]+)?/, 'constant.numeric'),
                new W(/'[^']*'/, 'string.quoted.single'),
                new W(/"[^"]*"/, 'string.quoted.double'),
                new W(/\/\/.*/, 'comment.line.double-dash'),
                new W(/\/\*.*\*\//, 'comment.block')
            ]);
        }
    }
});
export default builtinStyles;