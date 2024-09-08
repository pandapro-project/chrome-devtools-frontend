// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Types from '../types/types.js';
export const EnhancedTracesVersion = 1;
let handlerState = 1 /* HandlerState.UNINITIALIZED */;
const scriptRundownEvents = [];
const scriptToV8Context = new Map();
const scriptToScriptSource = new Map();
const largeScriptToScriptSource = new Map();
const scriptToSourceLength = new Map();
const targets = [];
const executionContexts = [];
const scripts = [];
function getScriptIsolateId(isolate, scriptId) {
    return scriptId + '@' + isolate;
}
export function initialize() {
    if (handlerState !== 1 /* HandlerState.UNINITIALIZED */) {
        throw new Error('Enhanced Traces Handler was not reset');
    }
    handlerState = 2 /* HandlerState.INITIALIZED */;
}
export function reset() {
    scriptRundownEvents.length = 0;
    scriptToV8Context.clear();
    scriptToScriptSource.clear();
    largeScriptToScriptSource.clear();
    scriptToSourceLength.clear();
    targets.length = 0;
    executionContexts.length = 0;
    scripts.length = 0;
    handlerState = 1 /* HandlerState.UNINITIALIZED */;
}
export function handleEvent(event) {
    if (handlerState !== 2 /* HandlerState.INITIALIZED */) {
        throw new Error('Enhanced Traces Handler is not initialized while handling event');
    }
    if (Types.TraceEvents.isTraceEventTargetRundown(event)) {
        // Set up script to v8 context mapping
        const data = event.args?.data;
        scriptToV8Context.set(getScriptIsolateId(data.isolate, data.scriptId), data.v8context);
        // Add target
        if (!targets.find(target => target.targetId === data.frame)) {
            targets.push({
                targetId: data.frame,
                type: data.frameType,
                isolate: data.isolate,
                pid: event.pid,
                url: data.url,
            });
        }
        // Add execution context, need to put back execution context id with info from other traces
        if (!executionContexts.find(executionContext => executionContext.v8Context === data.v8context)) {
            executionContexts.push({
                id: -1,
                origin: data.origin,
                v8Context: data.v8context,
                auxData: {
                    frameId: data.frame,
                    isDefault: data.isDefault,
                    type: data.contextType,
                },
                isolate: data.isolate,
            });
        }
    }
    else if (Types.TraceEvents.isTraceEventScriptRundown(event)) {
        scriptRundownEvents.push(event);
        const data = event.args.data;
        // Add script
        if (!scripts.find(script => script.scriptId === data.scriptId && script.isolate === data.isolate)) {
            scripts.push({
                scriptId: data.scriptId,
                isolate: data.isolate,
                executionContextId: data.executionContextId,
                startLine: data.startLine,
                startColumn: data.startColumn,
                endLine: data.endLine,
                endColumn: data.endColumn,
                hash: data.hash,
                isModule: data.isModule,
                url: data.url,
                hasSourceUrl: data.hasSourceUrl,
                sourceMapUrl: data.sourceMapUrl,
            });
        }
    }
    else if (Types.TraceEvents.isTraceEventScriptRundownSource(event)) {
        // Set up script to source text and length mapping
        const data = event.args.data;
        const scriptIsolateId = getScriptIsolateId(data.isolate, data.scriptId);
        if ('splitIndex' in data && 'splitCount' in data) {
            if (!largeScriptToScriptSource.has(scriptIsolateId)) {
                largeScriptToScriptSource.set(scriptIsolateId, new Array(data.splitCount).fill(''));
            }
            const splittedSource = largeScriptToScriptSource.get(scriptIsolateId);
            if (splittedSource && data.sourceText) {
                splittedSource[data.splitIndex] = data.sourceText;
            }
        }
        else {
            if (data.sourceText) {
                scriptToScriptSource.set(scriptIsolateId, data.sourceText);
            }
            if (data.length) {
                scriptToSourceLength.set(scriptIsolateId, data.length);
            }
        }
    }
}
export async function finalize() {
    if (handlerState !== 2 /* HandlerState.INITIALIZED */) {
        throw new Error('Enhanced Traces Handler is not initialized while being finalized');
    }
    // Put back execution context id
    const v8ContextToExecutionContextId = new Map();
    scriptRundownEvents.forEach(scriptRundownEvent => {
        const data = scriptRundownEvent.args.data;
        const v8Context = scriptToV8Context.get(getScriptIsolateId(data.isolate, data.scriptId));
        if (v8Context) {
            v8ContextToExecutionContextId.set(v8Context, data.executionContextId);
        }
    });
    executionContexts.forEach(executionContext => {
        if (executionContext.v8Context) {
            const id = v8ContextToExecutionContextId.get(executionContext.v8Context);
            if (id) {
                executionContext.id = id;
            }
        }
    });
    // Put back script source text and length
    scripts.forEach(script => {
        const scriptIsolateId = getScriptIsolateId(script.isolate, script.scriptId);
        if (scriptToScriptSource.has(scriptIsolateId)) {
            script.sourceText = scriptToScriptSource.get(scriptIsolateId);
            script.length = scriptToSourceLength.get(scriptIsolateId);
        }
        else if (largeScriptToScriptSource.has(scriptIsolateId)) {
            const splittedSources = largeScriptToScriptSource.get(scriptIsolateId);
            if (splittedSources) {
                script.sourceText = splittedSources.join('');
                script.length = script.sourceText.length;
            }
        }
        // put in the aux data
        script.auxData =
            executionContexts
                .find(context => context.id === script.executionContextId && context.isolate === script.isolate)
                ?.auxData;
    });
    handlerState = 3 /* HandlerState.FINALIZED */;
}
export function data() {
    if (handlerState !== 3 /* HandlerState.FINALIZED */) {
        throw new Error('Enhanced Traces Handler is not finalized');
    }
    return {
        targets,
        executionContexts,
        scripts,
    };
}
//# sourceMappingURL=EnhancedTracesHandler.js.map