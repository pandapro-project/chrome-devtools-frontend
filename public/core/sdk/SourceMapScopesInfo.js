// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { decodeGeneratedRanges, decodeOriginalScopes, } from './SourceMapScopes.js';
export class SourceMapScopesInfo {
    /* eslint-disable-next-line no-unused-private-class-members */
    #sourceMap;
    /* eslint-disable-next-line no-unused-private-class-members */
    #originalScopes;
    #generatedRanges;
    constructor(sourceMap, originalScopes, generatedRanges) {
        this.#sourceMap = sourceMap;
        this.#originalScopes = originalScopes;
        this.#generatedRanges = generatedRanges;
    }
    static parseFromMap(sourceMap, sourceMapJson) {
        if (!sourceMapJson.originalScopes || !sourceMapJson.generatedRanges) {
            throw new Error('Cant create SourceMapScopesInfo without encoded scopes');
        }
        const scopeTrees = decodeOriginalScopes(sourceMapJson.originalScopes, sourceMapJson.names ?? []);
        const originalScopes = scopeTrees.map(tree => tree.root);
        const generatedRanges = decodeGeneratedRanges(sourceMapJson.generatedRanges, scopeTrees, sourceMapJson.names ?? []);
        return new SourceMapScopesInfo(sourceMap, originalScopes, generatedRanges);
    }
    /**
     * Given a generated position, returns the original name of the surrounding function as well as
     * all the original function names that got inlined into the surrounding generated function and their
     * respective callsites in the original code (ordered from inner to outer).
     *
     * @returns a list with inlined functions. Every entry in the list has a callsite in the orignal code,
     * except the last function (since the last function didn't get inlined).
     */
    findInlinedFunctions(generatedLine, generatedColumn) {
        const result = [];
        const rangeChain = this.#findGeneratedRangeChain(generatedLine, generatedColumn);
        // Walk the generated ranges from the innermost containing range outwards as long as we don't
        // encounter a range that is a scope in the generated code and a function scope originally.
        for (let i = rangeChain.length - 1; i >= 0; --i) {
            const range = rangeChain[i];
            const originalScope = range.originalScope;
            // Record the name if the range corresponds to a function scope in the authored code. And it's either a scope in the
            // generated code as well or it has a callsite info (which indicates inlining).
            if (originalScope?.kind === 'function' && (range.isScope || range.callsite)) {
                result.push({ name: originalScope.name ?? '', callsite: range.callsite });
                if (range.isScope) {
                    break;
                }
            }
        }
        return result;
    }
    /**
     * Given a generated position, this returns all the surrounding generated ranges from outer
     * to inner.
     */
    #findGeneratedRangeChain(line, column) {
        const result = [];
        (function walkRanges(ranges) {
            for (const range of ranges) {
                if (!contains(range, line, column)) {
                    continue;
                }
                result.push(range);
                walkRanges(range.children);
            }
        })(this.#generatedRanges);
        return result;
    }
}
function contains(range, line, column) {
    if (range.start.line > line || (range.start.line === line && range.start.column > column)) {
        return false;
    }
    if (range.end.line < line || (range.end.line === line && range.end.column <= column)) {
        return false;
    }
    return true;
}
//# sourceMappingURL=SourceMapScopesInfo.js.map