import { pascalCase } from 'change-case';
import ts from 'typescript';
import { NamespaceReplacement } from './types';

const nsReplaceIfNeeded = (replacement: NamespaceReplacement, ns: string) => {
  if (replacement.hasOwnProperty(ns)) {
    return replacement[ns] || '';
  }

  return ns;
};

const concatPropertyEnumName = (
  replacement: NamespaceReplacement,
  node: ts.QualifiedName
): string => {
  const name = nsReplaceIfNeeded(replacement, node.right.escapedText.toString());

  if (ts.isQualifiedName(node.left)) {
    return `${concatPropertyEnumName(replacement, node.left)}_${name}`;
  }

  return `${
    ts.isIdentifier(node.left)
      ? `${nsReplaceIfNeeded(replacement, node.left.escapedText.toString())}_`
      : ''
  }${name}`;
};

const updateTypeNodeIfNeeded = (
  replacement: NamespaceReplacement,
  node: ts.TypeNode
): ts.TypeNode => {
  if (
    ts.isTypeReferenceNode(node) &&
    ts.isQualifiedName(node.typeName) &&
    !/^I[A-Z]/.test(node.typeName.right.escapedText.toString())
  ) {
    return ts.updateTypeReferenceNode(
      node,
      ts.createIdentifier(pascalCase(concatPropertyEnumName(replacement, node.typeName))),
      node.typeArguments
    );
  }

  return node;
};

const transformer = (nsReplacement: NamespaceReplacement) => (
  context: ts.TransformationContext
) => (rootNode: ts.SourceFile) => {
  let enumList = <any>ts.createNodeArray();
  let classList = <any>ts.createNodeArray();

  const extractEnum = (parentNamespace: string) => (node: ts.Node) => {
    const parent = nsReplacement.hasOwnProperty(parentNamespace)
      ? nsReplacement[parentNamespace]
      : parentNamespace;

    // const ns = parentNamespace !== "" ? `${parentNamespace}_` : "";
    const ns = parent !== '' ? `${parent}_` : '';

    if (ts.isEnumDeclaration(node)) {
      enumList = [
        ...enumList,
        ts.createEnumDeclaration(
          node.decorators,
          [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
          ts.createIdentifier(pascalCase(`${ns}${node.name.text}`)),
          node.members
        )
      ];
    }

    if (ts.isModuleDeclaration(node) && node.body != null) {
      ts.forEachChild(node.body, extractEnum(`${ns}${node.name.text}`));
    }
  };

  const optimizeVisitor = (node: ts.Node): any => {
    node = ts.visitEachChild(node, optimizeVisitor, context);

    // Remove `protobufjs`
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      (<any>node.moduleSpecifier).text === 'protobufjs'
    ) {
      return null;
    }

    // Remove `class` definition
    if (ts.isClassDeclaration(node)) {
      classList = [...classList, node.name!.escapedText];
      return null;
    }

    // Remove `enum` definition
    if (ts.isEnumDeclaration(node)) {
      return null;
    }

    // Format union types
    //   - Remove `null`, `Long`
    //   - Concat `enum` name
    if (ts.isPropertySignature(node) && node.type != null) {
      let unionTypes: ts.NodeArray<ts.TypeNode> | null = null;
      if (ts.isUnionTypeNode(node.type)) {
        unionTypes = node.type.types;
      } else if (
        ts.isParenthesizedTypeNode(node.type) &&
        node.type.type != null &&
        ts.isUnionTypeNode(node.type.type)
      ) {
        unionTypes = node.type.type.types;
      }

      if (unionTypes != null) {
        const types = unionTypes
          .filter(t => {
            if (t.kind === ts.SyntaxKind.NullKeyword) {
              return false;
            }

            if (ts.isTypeReferenceNode(t) && (<any>t.typeName).escapedText === 'Long') {
              return false;
            }

            return true;
          })
          .map(t => {
            if (ts.isArrayTypeNode(t)) {
              return ts.updateArrayTypeNode(
                t,
                updateTypeNodeIfNeeded(nsReplacement, t.elementType)
              );
            }

            if (ts.isTypeReferenceNode(t)) {
              return updateTypeNodeIfNeeded(nsReplacement, t);
            }

            return t;
          });

        return ts.updatePropertySignature(
          node,
          node.modifiers,
          node.name,
          undefined, // Remove optional
          ts.createParenthesizedType(ts.createUnionTypeNode(types)),
          node.initializer
        );
      }
    }

    // Add `export` to `namespace`
    if (ts.isModuleDeclaration(node)) {
      return ts.updateModuleDeclaration(
        node,
        node.decorators,
        [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
        node.name,
        node.body
      );
    }

    // Add `export` to `interface`
    if (ts.isInterfaceDeclaration(node)) {
      return ts.updateInterfaceDeclaration(
        node,
        node.decorators,
        [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
        node.name,
        node.typeParameters,
        node.heritageClauses,
        node.members
      );
    }

    return node;
  };

  const removeNamespaceVisitor = (node: ts.Node): any => {
    node = ts.visitEachChild(node, removeNamespaceVisitor, context);

    if (ts.isModuleDeclaration(node) && classList.includes(node.name.text)) {
      return null;
    }

    return node;
  };

  const shallowVisitor = (node: ts.Node): any =>
    ts.visitEachChild(
      node,
      child => {
        if (ts.isModuleDeclaration(child)) {
          return ts.updateModuleDeclaration(
            child,
            child.decorators,
            [...child.modifiers!, ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
            child.name,
            child.body
          );
        }

        return child;
      },
      context
    );

  // Process rootNode
  rootNode.forEachChild(extractEnum(''));

  rootNode = ts.visitNode(rootNode, optimizeVisitor);
  rootNode = ts.visitNode(rootNode, removeNamespaceVisitor);
  rootNode = ts.visitNode(rootNode, shallowVisitor);

  // Append formatted `enum` list to node statements
  rootNode.statements = <any>[...rootNode.statements, ...enumList];

  return rootNode;
};

export const optimize = (input: string, nsReplacement: NamespaceReplacement) => {
  const printer = ts.createPrinter();
  const source = ts.createSourceFile('', input, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS);

  const result = ts.transform(source, [transformer(nsReplacement)]);

  return printer.printFile(result.transformed[0]);
};
