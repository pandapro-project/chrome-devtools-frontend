// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Formatter from '../../models/formatter/formatter.js';
import * as DiffView from '../../ui/components/diff_view/diff_view.js';
// These utilities are packaged in a class to allow unittests to stub or spy the implementation.
export class PanelUtils {
    static iconDataForResourceType(resourceType) {
        if (resourceType.isDocument()) {
            return { iconName: 'file-document', color: 'var(--icon-file-document)' };
        }
        if (resourceType.isImage()) {
            return { iconName: 'file-image', color: 'var(--icon-file-image)' };
        }
        if (resourceType.isFont()) {
            return { iconName: 'file-font', color: 'var(--icon-file-font)' };
        }
        if (resourceType.isScript()) {
            return { iconName: 'file-script', color: 'var(--icon-file-script)' };
        }
        if (resourceType.isStyleSheet()) {
            return { iconName: 'file-stylesheet', color: 'var(--icon-file-styles)' };
        }
        if (resourceType.name() === Common.ResourceType.resourceTypes.Manifest.name()) {
            return { iconName: 'file-manifest', color: 'var(--icon-default)' };
        }
        if (resourceType.name() === Common.ResourceType.resourceTypes.Wasm.name()) {
            return { iconName: 'file-wasm', color: 'var(--icon-default)' };
        }
        if (resourceType.name() === Common.ResourceType.resourceTypes.WebSocket.name()) {
            return { iconName: 'file-websocket', color: 'var(--icon-default)' };
        }
        if (resourceType.name() === Common.ResourceType.resourceTypes.Media.name()) {
            return { iconName: 'file-media', color: 'var(--icon-file-media)' };
        }
        if (resourceType.isWebbundle()) {
            return { iconName: 'bundle', color: 'var(--icon-default)' };
        }
        if (resourceType.name() === Common.ResourceType.resourceTypes.Fetch.name() ||
            resourceType.name() === Common.ResourceType.resourceTypes.XHR.name()) {
            return { iconName: 'file-fetch-xhr', color: 'var(--icon-default)' };
        }
        return { iconName: 'file-generic', color: 'var(--icon-default)' };
    }
    static async formatCSSChangesFromDiff(diff) {
        const indent = '  ';
        const { originalLines, currentLines, rows } = DiffView.DiffView.buildDiffRows(diff);
        const originalRuleMaps = await buildStyleRuleMaps(originalLines.join('\n'));
        const currentRuleMaps = await buildStyleRuleMaps(currentLines.join('\n'));
        let changes = '';
        let recordedOriginalSelector, recordedCurrentSelector;
        let hasOpenDeclarationBlock = false;
        for (const { currentLineNumber, originalLineNumber, type } of rows) {
            if (type !== "deletion" /* DiffView.DiffView.RowType.DELETION */ && type !== "addition" /* DiffView.DiffView.RowType.ADDITION */) {
                continue;
            }
            const isDeletion = type === "deletion" /* DiffView.DiffView.RowType.DELETION */;
            const lines = isDeletion ? originalLines : currentLines;
            // Diff line arrays starts at 0, but line numbers start at 1.
            const lineIndex = isDeletion ? originalLineNumber - 1 : currentLineNumber - 1;
            const line = lines[lineIndex].trim();
            const { declarationIDToStyleRule, styleRuleIDToStyleRule } = isDeletion ? originalRuleMaps : currentRuleMaps;
            let styleRule;
            let prefix = '';
            if (declarationIDToStyleRule.has(lineIndex)) {
                styleRule = declarationIDToStyleRule.get(lineIndex);
                const selector = styleRule.selector;
                // Use the equality of selector strings as a best-effort check for the equality of style rules.
                if (selector !== recordedOriginalSelector && selector !== recordedCurrentSelector) {
                    prefix += `${selector} {\n`;
                }
                prefix += indent;
                hasOpenDeclarationBlock = true;
            }
            else {
                if (hasOpenDeclarationBlock) {
                    prefix = '}\n\n';
                    hasOpenDeclarationBlock = false;
                }
                if (styleRuleIDToStyleRule.has(lineIndex)) {
                    styleRule = styleRuleIDToStyleRule.get(lineIndex);
                }
            }
            const processedLine = isDeletion ? `/* ${line} */` : line;
            changes += prefix + processedLine + '\n';
            if (isDeletion) {
                recordedOriginalSelector = styleRule?.selector;
            }
            else {
                recordedCurrentSelector = styleRule?.selector;
            }
        }
        if (changes.length > 0) {
            changes += '}';
        }
        return changes;
    }
    static highlightElement(element) {
        element.scrollIntoViewIfNeeded();
        element.animate([
            { offset: 0, backgroundColor: 'rgba(255, 255, 0, 0.2)' },
            { offset: 0.1, backgroundColor: 'rgba(255, 255, 0, 0.7)' },
            { offset: 1, backgroundColor: 'transparent' },
        ], { duration: 2000, easing: 'cubic-bezier(0, 0, 0.2, 1)' });
    }
}
async function buildStyleRuleMaps(content) {
    const rules = await new Promise(res => {
        const rules = [];
        Formatter.FormatterWorkerPool.formatterWorkerPool().parseCSS(content, (isLastChunk, currentRules) => {
            rules.push(...currentRules);
            if (isLastChunk) {
                res(rules);
            }
        });
    });
    // We use line numbers as unique IDs for rules and declarations
    const declarationIDToStyleRule = new Map();
    const styleRuleIDToStyleRule = new Map();
    for (const rule of rules) {
        if ('styleRange' in rule) {
            const selector = rule.selectorText.split('\n').pop()?.trim();
            if (!selector) {
                continue;
            }
            const styleRule = { rule, selector };
            styleRuleIDToStyleRule.set(rule.styleRange.startLine, styleRule);
            for (const property of rule.properties) {
                declarationIDToStyleRule.set(property.range.startLine, styleRule);
            }
        }
    }
    return { declarationIDToStyleRule, styleRuleIDToStyleRule };
}
//# sourceMappingURL=utils.js.map