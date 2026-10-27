import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const message =
  'Import crosses a layer boundary: pages → widgets | feature → context → hooks → queries → dtos | services → models; feature → view-models → models; ui does not depend on the domain. A module does not import a sibling of the same layer. Shared board data comes from a context provider';

function banOwn(groups, layer) {
  return [
    'error',
    {
      patterns: [
        { group: [...groups, layer, `${layer}/**`], message },
        { regex: '^\\.\\./', message },
      ],
    },
  ];
}

const ui = ['@/ui', '@/ui/**'];
const viewModels = ['@/view-models', '@/view-models/**'];
const hooks = ['@/hooks', '@/hooks/**'];
const context = ['@/context', '@/context/**'];

function ban(groups) {
  return [
    'error',
    {
      patterns: [{ group: groups, message }],
    },
  ];
}

const aboveModels = [
  '@/services',
  '@/services/**',
  '@/dtos',
  '@/dtos/**',
  '@/queries',
  '@/queries/**',
  '@/feature',
  '@/feature/**',
  '@/widgets',
  '@/widgets/**',
  '@/pages',
  '@/pages/**',
  '@/app',
  '@/app/**',
  ...viewModels,
  ...hooks,
  ...context,
  ...ui,
];

const aboveViewModels = [
  '@/services',
  '@/services/**',
  '@/dtos',
  '@/dtos/**',
  '@/queries',
  '@/queries/**',
  '@/feature',
  '@/feature/**',
  '@/widgets',
  '@/widgets/**',
  '@/pages',
  '@/pages/**',
  '@/app',
  '@/app/**',
  ...hooks,
  ...context,
  ...ui,
];

const aboveServices = [
  '@/dtos',
  '@/dtos/**',
  '@/queries',
  '@/queries/**',
  '@/feature',
  '@/feature/**',
  '@/widgets',
  '@/widgets/**',
  '@/pages',
  '@/pages/**',
  '@/app',
  '@/app/**',
  ...viewModels,
  ...hooks,
  ...context,
  ...ui,
];

const aboveDtos = [
  '@/services',
  '@/services/**',
  '@/queries',
  '@/queries/**',
  '@/feature',
  '@/feature/**',
  '@/widgets',
  '@/widgets/**',
  '@/pages',
  '@/pages/**',
  '@/app',
  '@/app/**',
  ...viewModels,
  ...hooks,
  ...context,
  ...ui,
];

const aboveQueries = [
  '@/services',
  '@/services/**',
  '@/feature',
  '@/feature/**',
  '@/widgets',
  '@/widgets/**',
  '@/pages',
  '@/pages/**',
  '@/app',
  '@/app/**',
  ...viewModels,
  ...hooks,
  ...context,
  ...ui,
];

const aboveHooks = [
  '@/dtos',
  '@/dtos/**',
  '@/feature',
  '@/feature/**',
  '@/widgets',
  '@/widgets/**',
  '@/pages',
  '@/pages/**',
  '@/app',
  '@/app/**',
  ...ui,
  ...context,
];

const aboveFeature = ['@/widgets', '@/widgets/**', '@/pages', '@/pages/**', '@/app', '@/app/**'];

const aboveUi = [
  '@/models',
  '@/models/**',
  '@/services',
  '@/services/**',
  '@/dtos',
  '@/dtos/**',
  '@/queries',
  '@/queries/**',
  '@/feature',
  '@/feature/**',
  '@/widgets',
  '@/widgets/**',
  '@/pages',
  '@/pages/**',
  '@/app',
  '@/app/**',
  ...viewModels,
  ...hooks,
  ...context,
];

const aboveWidgets = [
  '@/dtos',
  '@/dtos/**',
  '@/queries',
  '@/queries/**',
  '@/services',
  '@/services/**',
  '@/pages',
  '@/pages/**',
  '@/app',
  '@/app/**',
];

const abovePages = [
  '@/dtos',
  '@/dtos/**',
  '@/queries',
  '@/queries/**',
  '@/services',
  '@/services/**',
  '@/app',
  '@/app/**',
  ...context,
];

const aboveContext = [
  '@/dtos',
  '@/dtos/**',
  '@/feature',
  '@/feature/**',
  '@/widgets',
  '@/widgets/**',
  '@/pages',
  '@/pages/**',
  '@/app',
  '@/app/**',
  ...ui,
];

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'data', 'player_*.json'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'server/**/*.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/explicit-member-accessibility': 'error',
    },
  },
  { files: ['src/models/**/*.ts'], rules: { 'no-restricted-imports': ban(aboveModels) } },
  { files: ['src/view-models/**/*.ts'], rules: { 'no-restricted-imports': ban(aboveViewModels) } },
  { files: ['src/services/**/*.ts'], rules: { 'no-restricted-imports': ban(aboveServices) } },
  { files: ['src/dtos/**/*.ts'], rules: { 'no-restricted-imports': ban(aboveDtos) } },
  { files: ['src/queries/**/*.ts'], rules: { 'no-restricted-imports': ban(aboveQueries) } },
  { files: ['src/hooks/**/*.ts'], rules: { 'no-restricted-imports': banOwn(aboveHooks, '@/hooks') } },
  { files: ['src/context/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': ban(aboveContext) } },
  { files: ['src/context/*/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': banOwn(aboveContext, '@/context') } },
  { files: ['src/feature/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': ban(aboveFeature) } },
  { files: ['src/widgets/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': ban(aboveWidgets) } },
  { files: ['src/pages/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': ban(abovePages) } },
  { files: ['src/ui/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': ban(aboveUi) } },
  { files: ['src/feature/*/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': banOwn(aboveFeature, '@/feature') } },
  { files: ['src/widgets/*/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': banOwn(aboveWidgets, '@/widgets') } },
  { files: ['src/pages/*/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': banOwn(abovePages, '@/pages') } },
  { files: ['src/ui/*/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': banOwn(aboveUi, '@/ui') } },
  {
    files: ['src/**/*.{ts,tsx}', 'server/**/*.ts'],
    plugins: {
      dota: {
        rules: {
          component: {
            meta: {
              type: 'problem',
              schema: [],
              messages: {
                many: 'A file must contain one component',
                memo: 'Component {{name}} must be wrapped in memo',
                shape:
                  'Declare {{name}} as function {{component}}Component, set displayName, and export it through memo',
              },
            },
            create(context) {
              const found = [];
              const display = new Map();
              const functions = new Map();
              function isComponentName(name) {
                return /^[A-Z]/.test(name) && /[a-z]/.test(name) && !name.includes('_');
              }
              function memoInner(node) {
                if (
                  node?.type !== 'CallExpression' ||
                  node.callee.type !== 'Identifier' ||
                  node.callee.name !== 'memo' ||
                  node.arguments[0]?.type !== 'Identifier'
                ) {
                  return null;
                }
                return node.arguments[0].name;
              }
              return {
                FunctionDeclaration(node) {
                  if (node.id && isComponentName(node.id.name)) found.push({ name: node.id.name, inner: null, node });
                },
                VariableDeclarator(node) {
                  if (node.id.type !== 'Identifier') return;
                  if (node.init?.type === 'FunctionExpression' && node.init.id?.type === 'Identifier') {
                    functions.set(node.id.name, node.init.id.name);
                  }
                  if (!isComponentName(node.id.name)) return;
                  found.push({ name: node.id.name, inner: memoInner(node.init), node });
                },
                AssignmentExpression(node) {
                  if (
                    node.left.type === 'MemberExpression' &&
                    !node.left.computed &&
                    node.left.object.type === 'Identifier' &&
                    node.left.property.type === 'Identifier' &&
                    node.left.property.name === 'displayName' &&
                    node.right.type === 'Literal'
                  ) {
                    display.set(node.left.object.name, node.right.value);
                  }
                },
                'Program:exit'() {
                  if (found.length > 1) {
                    for (const item of found) context.report({ node: item.node, messageId: 'many' });
                  }
                  for (const item of found) {
                    const binding = item.name[0].toLowerCase() + item.name.slice(1) + 'Component';
                    if (
                      item.inner !== binding ||
                      functions.get(binding) !== item.name + 'Component' ||
                      display.get(binding) !== item.name
                    ) {
                      context.report({
                        node: item.node,
                        messageId: item.inner ? 'shape' : 'memo',
                        data: { name: item.name, component: item.name },
                      });
                    }
                  }
                },
              };
            },
          },
          'readonly-fields': {
            meta: {
              type: 'problem',
              fixable: 'code',
              schema: [],
              messages: {
                field: 'Field {{name}} must be readonly, or the type must be wrapped in Readonly<>',
                index: 'An index signature must be readonly, or the type must be wrapped in Readonly<>',
              },
            },
            create(context) {
              function coveredByReadonly(node) {
                let current = node.parent;
                while (current) {
                  if (
                    current.type === 'TSParenthesizedType' ||
                    current.type === 'TSUnionType' ||
                    current.type === 'TSIntersectionType'
                  ) {
                    current = current.parent;
                    continue;
                  }
                  if (current.type === 'TSTypeParameterInstantiation') {
                    const ref = current.parent;
                    return (
                      ref?.type === 'TSTypeReference' &&
                      ref.typeName?.type === 'Identifier' &&
                      ref.typeName.name === 'Readonly'
                    );
                  }
                  return false;
                }
                return false;
              }
              function reportMember(member) {
                if (member.readonly) return;
                const key = member.type === 'TSPropertySignature' ? member.key : null;
                const name = key?.type === 'Identifier' ? key.name : key?.type === 'Literal' ? String(key.value) : null;
                context.report({
                  node: member,
                  messageId: name ? 'field' : 'index',
                  data: { name: name ?? '' },
                  fix(fixer) {
                    return fixer.insertTextBefore(member, 'readonly ');
                  },
                });
              }
              function checkBody(members) {
                for (const member of members) {
                  if (member.type === 'TSPropertySignature' || member.type === 'TSIndexSignature') reportMember(member);
                }
              }
              return {
                TSTypeLiteral(node) {
                  if (coveredByReadonly(node)) return;
                  checkBody(node.members);
                },
                TSInterfaceBody(node) {
                  checkBody(node.body);
                },
              };
            },
          },
          'documented-fields': {
            meta: {
              type: 'problem',
              schema: [],
              messages: {
                field: 'Field {{name}} must have a JSDoc comment',
                index: 'An index signature must have a JSDoc comment',
              },
            },
            create(context) {
              const sourceCode = context.sourceCode;
              function inTypeOrInterface(node) {
                let current = node.parent;
                while (current) {
                  if (current.type === 'TSTypeAliasDeclaration' || current.type === 'TSInterfaceDeclaration')
                    return true;
                  if (
                    current.type === 'TSTypeLiteral' ||
                    current.type === 'TSInterfaceBody' ||
                    current.type === 'TSParenthesizedType' ||
                    current.type === 'TSUnionType' ||
                    current.type === 'TSIntersectionType' ||
                    current.type === 'TSArrayType' ||
                    current.type === 'TSTupleType' ||
                    current.type === 'TSTypeOperator' ||
                    current.type === 'TSTypeAnnotation' ||
                    current.type === 'TSTypeParameterInstantiation' ||
                    current.type === 'TSTypeReference' ||
                    current.type === 'TSConditionalType' ||
                    current.type === 'TSNamedTupleMember' ||
                    current.type === 'TSRestType' ||
                    current.type === 'TSOptionalType' ||
                    current.type === 'TSPropertySignature' ||
                    current.type === 'TSIndexSignature' ||
                    current.type === 'TSMethodSignature'
                  ) {
                    current = current.parent;
                    continue;
                  }
                  return false;
                }
                return false;
              }
              function documented(member) {
                const comments = sourceCode.getCommentsBefore(member);
                const comment = comments[comments.length - 1];
                if (!comment || comment.type !== 'Block' || !comment.value.trimStart().startsWith('*')) return false;
                const between = sourceCode.text.slice(comment.range[1], member.range[0]);
                return !/\n\s*\n/.test(between);
              }
              function reportMember(member) {
                if (documented(member)) return;
                const key = member.type === 'TSPropertySignature' ? member.key : null;
                const name = key?.type === 'Identifier' ? key.name : key?.type === 'Literal' ? String(key.value) : null;
                context.report({
                  node: member,
                  messageId: name ? 'field' : 'index',
                  data: { name: name ?? '' },
                });
              }
              function checkBody(members) {
                for (const member of members) {
                  if (member.type === 'TSPropertySignature' || member.type === 'TSIndexSignature') reportMember(member);
                }
              }
              return {
                TSTypeLiteral(node) {
                  if (!inTypeOrInterface(node)) return;
                  checkBody(node.members);
                },
                TSInterfaceBody(node) {
                  checkBody(node.body);
                },
              };
            },
          },
        },
      },
    },
    rules: {
      'dota/readonly-fields': 'error',
      'dota/documented-fields': 'error',
    },
  },
  { files: ['src/**/*.tsx'], rules: { 'dota/component': 'error' } },
  prettier,
);
