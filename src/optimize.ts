import ts from 'typescript';
import { pascalCase } from 'change-case';
import { NamespaceReplacement } from './types';

const nsReplaceIfNeeded = (replacement: NamespaceReplacement, ns: string) => {
  if (replacement.has(ns)) {
    return replacement.get(ns)!;
  }

  return ns;
};

const concatPropertyEnumName = (
  replacement: NamespaceReplacement,
  node: ts.QualifiedName,
): string => {
  const name = nsReplaceIfNeeded(
    replacement,
    node.right.escapedText.toString(),
  );

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
  node: ts.TypeNode,
): ts.TypeNode => {
  if (
    ts.isTypeReferenceNode(node) &&
    ts.isQualifiedName(node.typeName) &&
    !/^I[A-Z]/.test(node.typeName.right.escapedText.toString())
  ) {
    return ts.factory.updateTypeReferenceNode(
      node,
      ts.factory.createIdentifier(
        pascalCase(concatPropertyEnumName(replacement, node.typeName)),
      ),
      node.typeArguments,
    );
  }

  return node;
};

const transformer =
  (nsReplacement: NamespaceReplacement): ts.TransformerFactory<ts.Node> =>
  (context) =>
  (source) => {
    const classList: Set<string> = new Set();
    let enumList = ts.factory.createNodeArray<ts.Statement>();

    /**
     * Extract enum
     */
    const extractEnum = (parentNamespace: string) => (node: ts.Node) => {
      const parent = nsReplacement.has(parentNamespace)
        ? nsReplacement.get(parentNamespace)!
        : parentNamespace;

      const ns = parent !== '' ? `${parent}_` : '';

      if (ts.isEnumDeclaration(node)) {
        enumList = ts.factory.createNodeArray([
          ...enumList,
          ts.factory.createEnumDeclaration(
            node.decorators,
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            ts.factory.createIdentifier(pascalCase(`${ns}${node.name.text}`)),
            node.members,
          ),
        ]);
      }

      if (ts.isModuleDeclaration(node) && node.body != null) {
        ts.forEachChild(node.body, extractEnum(`${ns}${node.name.text}`));
      }
    };

    /**
     * Optimize
     */
    const optimizeVisitor: ts.Visitor = (node) => {
      node = ts.visitEachChild(node, optimizeVisitor, context);

      // Remove `protobufjs`
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        (<any>node.moduleSpecifier).text === 'protobufjs'
      ) {
        return undefined;
      }

      // Remove `class` definition
      if (ts.isClassDeclaration(node)) {
        classList.add(node.name!.escapedText.toString());
        return undefined;
      }

      // Remove `enum` definition
      if (ts.isEnumDeclaration(node)) {
        return undefined;
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
          const unionTypeFilter = (n: ts.Node) => {
            if (
              ts.isLiteralTypeNode(n) &&
              n.literal.kind === ts.SyntaxKind.NullKeyword
            ) {
              return false;
            }

            if (
              ts.isTypeReferenceNode(n) &&
              (<any>n.typeName).escapedText === 'Long'
            ) {
              return false;
            }

            return true;
          };

          const types = unionTypes.filter(unionTypeFilter).map((t) => {
            if (ts.isArrayTypeNode(t)) {
              let elementType = t.elementType;

              if (
                ts.isParenthesizedTypeNode(t.elementType) &&
                ts.isUnionTypeNode(t.elementType.type)
              ) {
                elementType = ts.factory.updateParenthesizedType(
                  t.elementType,
                  ts.factory.updateUnionTypeNode(
                    t.elementType.type,
                    ts.factory.createNodeArray(
                      t.elementType.type.types.filter(unionTypeFilter),
                    ),
                  ),
                );
              }

              return ts.factory.updateArrayTypeNode(
                t,
                updateTypeNodeIfNeeded(nsReplacement, elementType),
              );
            }

            if (ts.isTypeReferenceNode(t)) {
              return updateTypeNodeIfNeeded(nsReplacement, t);
            }

            return t;
          });

          return ts.factory.updatePropertySignature(
            node,
            node.modifiers,
            node.name,
            undefined,
            ts.factory.createParenthesizedType(
              ts.factory.createUnionTypeNode(types),
            ),
          );
        }
      }

      // Add `export` to `namespace`
      if (ts.isModuleDeclaration(node)) {
        return ts.factory.updateModuleDeclaration(
          node,
          node.decorators,
          [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          node.name,
          node.body,
        );
      }

      // Add `export` to `interface`
      if (ts.isInterfaceDeclaration(node)) {
        return ts.factory.updateInterfaceDeclaration(
          node,
          node.decorators,
          [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          node.name,
          node.typeParameters,
          node.heritageClauses,
          node.members,
        );
      }

      // Remove type alias (only function type)
      if (ts.isTypeAliasDeclaration(node) && ts.isFunctionTypeNode(node.type)) {
        return undefined;
      }

      return node;
    };

    /**
     * Add declare
     */
    const declareVisitor: ts.Visitor = (node) =>
      ts.visitEachChild(
        node,
        (child) => {
          if (ts.isModuleDeclaration(child)) {
            return ts.factory.updateModuleDeclaration(
              child,
              child.decorators,
              [
                ...child.modifiers!,
                ts.factory.createModifier(ts.SyntaxKind.DeclareKeyword),
              ],
              child.name,
              child.body,
            );
          }
          return child;
        },
        context,
      );

    // Process SourceFile
    source.forEachChild(extractEnum(''));
    source = ts.visitNode(source, optimizeVisitor);
    source = ts.visitNode(source, declareVisitor);

    // Append formatted `enum` list to node statements
    source = ts.factory.updateSourceFile(source as ts.SourceFile, [
      ...(source as ts.SourceFile).statements,
      ...enumList,
    ]);

    return source;
  };

export const optimize = (
  input: string,
  nsReplacement: NamespaceReplacement,
) => {
  const source = ts.createSourceFile('', input, ts.ScriptTarget.Latest, true);
  const { transformed } = ts.transform(source, [transformer(nsReplacement)]);
  return ts.createPrinter().printFile(transformed[0] as any);
};
