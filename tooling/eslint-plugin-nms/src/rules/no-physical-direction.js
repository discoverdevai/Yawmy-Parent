// Bans Tailwind classes that hardcode left/right (physical) layout. Forces use of
// logical equivalents so the app flips correctly under RTL (Arabic).
//
// Banned (physical) → Required (logical)
//   ml-*  → ms-*       margin-inline-start
//   mr-*  → me-*       margin-inline-end
//   pl-*  → ps-*
//   pr-*  → pe-*
//   left-*  → start-*
//   right-* → end-*
//   text-left  → text-start
//   text-right → text-end
//   border-l-* → border-s-*
//   border-r-* → border-e-*
//   rounded-l-*  → rounded-s-*
//   rounded-r-*  → rounded-e-*
//   rounded-tl-*, rounded-tr-*, rounded-bl-*, rounded-br-* → ss/se/es/ee variants

const PHYSICAL_PATTERNS = [
  { pattern: /\b(?:-?)(?:m|p)l-/, fix: (m) => m.replace(/(m|p)l-/, '$1s-') },
  { pattern: /\b(?:-?)(?:m|p)r-/, fix: (m) => m.replace(/(m|p)r-/, '$1e-') },
  { pattern: /\bleft-/, fix: (m) => m.replace('left-', 'start-') },
  { pattern: /\bright-/, fix: (m) => m.replace('right-', 'end-') },
  { pattern: /\btext-left\b/, fix: () => 'text-start' },
  { pattern: /\btext-right\b/, fix: () => 'text-end' },
  { pattern: /\bborder-l-/, fix: (m) => m.replace('border-l-', 'border-s-') },
  { pattern: /\bborder-r-/, fix: (m) => m.replace('border-r-', 'border-e-') },
  { pattern: /\brounded-l-/, fix: (m) => m.replace('rounded-l-', 'rounded-s-') },
  { pattern: /\brounded-r-/, fix: (m) => m.replace('rounded-r-', 'rounded-e-') },
  { pattern: /\brounded-tl-/, fix: (m) => m.replace('rounded-tl-', 'rounded-ss-') },
  { pattern: /\brounded-tr-/, fix: (m) => m.replace('rounded-tr-', 'rounded-se-') },
  { pattern: /\brounded-bl-/, fix: (m) => m.replace('rounded-bl-', 'rounded-es-') },
  { pattern: /\brounded-br-/, fix: (m) => m.replace('rounded-br-', 'rounded-ee-') },
];

const CLASSNAME_ATTRS = new Set(['className', 'tw']);

function checkClassString(value) {
  const offenders = [];
  for (const { pattern, fix } of PHYSICAL_PATTERNS) {
    const tokens = value.split(/\s+/);
    for (const token of tokens) {
      if (pattern.test(token)) {
        offenders.push({ token, suggestion: fix(token) });
      }
    }
  }
  return offenders;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow physical-direction Tailwind classes (ml-, mr-, left-, right-, text-left, text-right, etc). Use logical equivalents (ms-, me-, start-, end-, text-start, text-end) so layouts flip in RTL.',
    },
    messages: {
      physical:
        'Physical direction class "{{token}}" breaks RTL. Use "{{suggestion}}" instead.',
    },
    schema: [],
  },
  create(context) {
    function checkValue(node, value) {
      if (typeof value !== 'string') return;
      const offenders = checkClassString(value);
      for (const { token, suggestion } of offenders) {
        context.report({
          node,
          messageId: 'physical',
          data: { token, suggestion },
        });
      }
    }

    return {
      JSXAttribute(node) {
        if (!CLASSNAME_ATTRS.has(node.name && node.name.name)) return;
        const v = node.value;
        if (!v) return;
        if (v.type === 'Literal') {
          checkValue(v, v.value);
        } else if (v.type === 'JSXExpressionContainer') {
          const expr = v.expression;
          if (expr.type === 'Literal') {
            checkValue(expr, expr.value);
          } else if (expr.type === 'TemplateLiteral') {
            for (const q of expr.quasis) checkValue(q, q.value.cooked);
          }
        }
      },
      CallExpression(node) {
        // Catches cn('ms-2 ml-4', condition && 'pr-2') etc.
        const callee = node.callee;
        const calleeName =
          callee.type === 'Identifier' ? callee.name : callee.type === 'MemberExpression' ? callee.property?.name : null;
        if (!['cn', 'cva', 'clsx', 'twMerge', 'tw'].includes(calleeName)) return;
        for (const arg of node.arguments) {
          if (arg.type === 'Literal') {
            checkValue(arg, arg.value);
          } else if (arg.type === 'TemplateLiteral') {
            for (const q of arg.quasis) checkValue(q, q.value.cooked);
          }
        }
      },
    };
  },
};
