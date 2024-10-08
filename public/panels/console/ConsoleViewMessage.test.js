// Copyright (c) 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import { createConsoleViewMessageWithStubDeps, createStackTrace, } from '../../testing/ConsoleHelpers.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as UI from '../../ui/legacy/legacy.js';
describeWithMockConnection('ConsoleViewMessage', () => {
    describe('anchor rendering', () => {
        it('links to the top frame for normal console message', () => {
            const target = createTarget();
            const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
            const stackTrace = createStackTrace([
                'USER_ID::userNestedFunction::http://example.com/script.js::40::15',
                'USER_ID::userFunction::http://example.com/script.js::10::2',
                'APP_ID::entry::http://example.com/app.js::25::10',
            ]);
            const messageDetails = {
                type: "log" /* Protocol.Runtime.ConsoleAPICalledEventType.Log */,
                stackTrace,
            };
            const rawMessage = new SDK.ConsoleModel.ConsoleMessage(runtimeModel, Common.Console.FrontendMessageSource.ConsoleAPI, /* level */ null, 'got here', messageDetails);
            const { message, linkifier } = createConsoleViewMessageWithStubDeps(rawMessage);
            message.toMessageElement(); // Trigger rendering.
            sinon.assert.calledOnceWithExactly(linkifier.linkifyStackTraceTopFrame, target, stackTrace);
        });
        it('links to the frame with the logpoint/breakpoint if the stack trace contains the "marker sourceURL"', () => {
            const target = createTarget();
            const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
            const stackTrace = createStackTrace([
                `LOG_ID::eval::${SDK.DebuggerModel.LOGPOINT_SOURCE_URL}::0::15`,
                'USER_ID::userFunction::http://example.com/script.js::10::2',
                'APP_ID::entry::http://example.com/app.js::25::10',
            ]);
            const messageDetails = {
                type: "log" /* Protocol.Runtime.ConsoleAPICalledEventType.Log */,
                stackTrace,
            };
            const rawMessage = new SDK.ConsoleModel.ConsoleMessage(runtimeModel, Common.Console.FrontendMessageSource.ConsoleAPI, /* level */ null, 'value of x is 42', messageDetails);
            const { message, linkifier } = createConsoleViewMessageWithStubDeps(rawMessage);
            message.toMessageElement(); // Trigger rendering.
            const expectedCallFrame = stackTrace.callFrames[1]; // userFunction.
            sinon.assert.calledOnceWithExactly(linkifier.maybeLinkifyConsoleCallFrame, target, expectedCallFrame, { inlineFrameIndex: 0, revealBreakpoint: true, userMetric: undefined });
        });
        it('uses the last "marker sourceURL" frame when searching for the breakpoint/logpoint frame', () => {
            const target = createTarget();
            const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
            const stackTrace = createStackTrace([
                `LOG_ID::leakedClosure::${SDK.DebuggerModel.LOGPOINT_SOURCE_URL}::2::3`,
                'USER_ID::callback::http://example.com/script.js::5::42',
                `LOG_ID::eval::${SDK.DebuggerModel.LOGPOINT_SOURCE_URL}::0::15`,
                'USER_ID::userFunction::http://example.com/script.js::10::2',
                'APP_ID::entry::http://example.com/app.js::25::10',
            ]);
            const messageDetails = {
                type: "log" /* Protocol.Runtime.ConsoleAPICalledEventType.Log */,
                stackTrace,
            };
            const rawMessage = new SDK.ConsoleModel.ConsoleMessage(runtimeModel, Common.Console.FrontendMessageSource.ConsoleAPI, /* level */ null, 'value of x is 42', messageDetails);
            const { message, linkifier } = createConsoleViewMessageWithStubDeps(rawMessage);
            message.toMessageElement(); // Trigger rendering.
            const expectedCallFrame = stackTrace.callFrames[3]; // userFunction.
            sinon.assert.calledOnceWithExactly(linkifier.maybeLinkifyConsoleCallFrame, target, expectedCallFrame, { inlineFrameIndex: 0, revealBreakpoint: true, userMetric: undefined });
        });
    });
    describe('console insights', () => {
        it('shows a hover button', () => {
            sinon.stub(UI.ActionRegistry.ActionRegistry.instance(), 'hasAction')
                .withArgs('explain.console-message.hover')
                .returns(true);
            const target = createTarget();
            const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
            const rawMessage = new SDK.ConsoleModel.ConsoleMessage(runtimeModel, Common.Console.FrontendMessageSource.ConsoleAPI, "error" /* Protocol.Log.LogEntryLevel.Error */, 'got here');
            const { message } = createConsoleViewMessageWithStubDeps(rawMessage);
            const messageElement = message.toMessageElement(); // Trigger rendering.
            const button = messageElement.querySelector('[aria-label=\'Understand this error. Powered by AI.\']');
            assert.strictEqual(button?.textContent, 'Understand this errorAI');
        });
        it('does not show a hover button if the console message text is empty', () => {
            sinon.stub(UI.ActionRegistry.ActionRegistry.instance(), 'hasAction')
                .withArgs('explain.console-message.hover')
                .returns(true);
            const target = createTarget();
            const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
            const rawMessage = new SDK.ConsoleModel.ConsoleMessage(runtimeModel, Common.Console.FrontendMessageSource.ConsoleAPI, "error" /* Protocol.Log.LogEntryLevel.Error */, '');
            const { message } = createConsoleViewMessageWithStubDeps(rawMessage);
            const messageElement = message.toMessageElement(); // Trigger rendering.
            const button = messageElement.querySelector('[aria-label=\'Understand this error. Powered by AI.\']');
            assert.isNull(button);
        });
        it('does not show a hover button for the self-XSS warning message', () => {
            sinon.stub(UI.ActionRegistry.ActionRegistry.instance(), 'hasAction')
                .withArgs('explain.console-message.hover')
                .returns(true);
            const target = createTarget();
            const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
            const rawMessage = new SDK.ConsoleModel.ConsoleMessage(runtimeModel, Common.Console.FrontendMessageSource.SELF_XSS, "warning" /* Protocol.Log.LogEntryLevel.Warning */, 'Don’t paste code...');
            const { message } = createConsoleViewMessageWithStubDeps(rawMessage);
            const messageElement = message.toMessageElement(); // Trigger rendering.
            const button = messageElement.querySelector('[aria-label=\'Understand this warning. Powered by AI.\']');
            assert.isNull(button);
        });
    });
});
//# sourceMappingURL=ConsoleViewMessage.test.js.map