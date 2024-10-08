// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as NetworkForward from '../../panels/network/forward/forward.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LitHtml from '../../ui/lit-html/lit-html.js';
import { ChangeManager } from './ChangeManager.js';
import { DOGFOOD_INFO, FreestylerChatUi, } from './components/FreestylerChatUi.js';
import { DrJonesNetworkAgent, DrJonesNetworkAgentResponseType, formatHeaders, formatNetworkRequestTiming, } from './DrJonesNetworkAgent.js';
import { FIX_THIS_ISSUE_PROMPT, FreestylerAgent, ResponseType } from './FreestylerAgent.js';
import freestylerPanelStyles from './freestylerPanel.css.js';
/*
  * TODO(nvitkov): b/346933425
  * Temporary string that should not be translated
  * as they may change often during development.
  */
const UIStringsTemp = {
    /**
     *@description AI assistant UI text for clearing messages.
     */
    clearMessages: 'Clear messages',
    /**
     *@description AI assistant UI tooltip text for the help button.
     */
    help: 'Help',
    /**
     *@description Title text for thinking step of DrJones Network agent.
     */
    inspectingNetworkData: 'Inspecting network data',
    /**
     *@description Thought text for thinking step of DrJones Network agent.
     */
    dataUsedToGenerateThisResponse: 'Data used to generate this response',
    /**
     *@description Heading text for the block that shows the network request details.
     */
    request: 'Request',
    /**
     *@description Heading text for the block that shows the network response details.
     */
    response: 'Response',
    /**
     *@description Prefix text for request URL.
     */
    requestUrl: 'Request URL',
    /**
     *@description Title text for request headers.
     */
    requestHeaders: 'Request Headers',
    /**
     *@description Title text for request timing details.
     */
    timing: 'Timing',
    /**
     *@description Title text for response headers.
     */
    responseHeaders: 'Response Headers',
    /**
     *@description Prefix text for response status.
     */
    responseStatus: 'Response Status',
};
// TODO(nvitkov): b/346933425
// const str_ = i18n.i18n.registerUIStrings('panels/freestyler/FreestylerPanel.ts', UIStrings);
// const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
/* eslint-disable  rulesdir/l10n_i18nString_call_only_with_uistrings */
const i18nString = i18n.i18n.lockedString;
// TODO(ergunsh): Use the WidgetElement instead of separately creating the toolbar.
function createToolbar(target, { onClearClick }) {
    const toolbarContainer = target.createChild('div', 'freestyler-toolbar-container');
    const leftToolbar = new UI.Toolbar.Toolbar('', toolbarContainer);
    const rightToolbar = new UI.Toolbar.Toolbar('freestyler-right-toolbar', toolbarContainer);
    const clearButton = new UI.Toolbar.ToolbarButton(i18nString(UIStringsTemp.clearMessages), 'clear', undefined, 'freestyler.clear');
    clearButton.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.CLICK */, onClearClick);
    leftToolbar.appendToolbarItem(clearButton);
    rightToolbar.appendSeparator();
    const helpButton = new UI.Toolbar.ToolbarButton(i18nString(UIStringsTemp.help), 'help', undefined, 'freestyler.help');
    helpButton.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.CLICK */, () => {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(DOGFOOD_INFO);
    });
    rightToolbar.appendToolbarItem(helpButton);
}
function defaultView(input, output, target) {
    // clang-format off
    LitHtml.render(LitHtml.html `
    <${FreestylerChatUi.litTagName} .props=${input} ${LitHtml.Directives.ref((el) => {
        if (!el || !(el instanceof FreestylerChatUi)) {
            return;
        }
        output.freestylerChatUi = el;
    })}></${FreestylerChatUi.litTagName}>
  `, target, { host: input }); // eslint-disable-line rulesdir/lit_html_host_this
    // clang-format on
}
let freestylerPanelInstance;
export class FreestylerPanel extends UI.Panel.Panel {
    view;
    static panelName = 'freestyler';
    #toggleSearchElementAction;
    #selectedElement;
    #selectedNetworkRequest;
    #contentContainer;
    #aidaClient;
    #freestylerAgent;
    #drJonesNetworkAgent;
    #viewProps;
    #viewOutput = {};
    #serverSideLoggingEnabled = isFreestylerServerSideLoggingEnabled();
    #consentViewAcceptedSetting = Common.Settings.Settings.instance().createLocalSetting('freestyler-dogfood-consent-onboarding-finished', false);
    #changeManager = new ChangeManager();
    constructor(view = defaultView, { aidaClient, aidaAvailability, syncInfo }) {
        super(FreestylerPanel.panelName);
        this.view = view;
        createToolbar(this.contentElement, { onClearClick: this.#clearMessages.bind(this) });
        this.#toggleSearchElementAction =
            UI.ActionRegistry.ActionRegistry.instance().getAction('elements.toggle-element-search');
        this.#aidaClient = aidaClient;
        this.#contentContainer = this.contentElement.createChild('div', 'freestyler-chat-ui-container');
        this.#selectedElement = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        this.#selectedNetworkRequest = UI.Context.Context.instance().flavor(SDK.NetworkRequest.NetworkRequest);
        this.#viewProps = {
            state: this.#consentViewAcceptedSetting.get() ? "chat-view" /* FreestylerChatUiState.CHAT_VIEW */ :
                "consent-view" /* FreestylerChatUiState.CONSENT_VIEW */,
            aidaAvailability,
            messages: [],
            inspectElementToggled: this.#toggleSearchElementAction.toggled(),
            selectedElement: this.#selectedElement,
            selectedNetworkRequest: this.#selectedNetworkRequest,
            isLoading: false,
            onTextSubmit: this.#startConversation.bind(this),
            onInspectElementClick: this.#handleSelectElementClick.bind(this),
            onFeedbackSubmit: this.#handleFeedbackSubmit.bind(this),
            onAcceptConsentClick: this.#handleAcceptConsentClick.bind(this),
            onCancelClick: this.#cancel.bind(this),
            onFixThisIssueClick: () => {
                void this.#startConversation(FIX_THIS_ISSUE_PROMPT, true);
            },
            onSelectedNetworkRequestClick: this.#handleSelectedNetworkRequestClick.bind(this),
            canShowFeedbackForm: this.#serverSideLoggingEnabled,
            userInfo: {
                accountImage: syncInfo.accountImage,
                accountFullName: syncInfo.accountFullName,
            },
            agentType: "freestyler" /* AgentType.FREESTYLER */,
        };
        this.#toggleSearchElementAction.addEventListener("Toggled" /* UI.ActionRegistration.Events.TOGGLED */, ev => {
            this.#viewProps.inspectElementToggled = ev.data;
            this.doUpdate();
        });
        this.#freestylerAgent = this.#createFreestylerAgent();
        this.#drJonesNetworkAgent = this.#createDrJonesNetworkAgent();
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DOMModel.DOMNode, ev => {
            if (this.#viewProps.selectedElement === ev.data) {
                return;
            }
            this.#viewProps.selectedElement = Boolean(ev.data) && ev.data.nodeType() === Node.ELEMENT_NODE ? ev.data : null;
            this.doUpdate();
        });
        UI.Context.Context.instance().addFlavorChangeListener(SDK.NetworkRequest.NetworkRequest, ev => {
            if (this.#viewProps.selectedNetworkRequest === ev.data) {
                return;
            }
            this.#viewProps.selectedNetworkRequest = Boolean(ev.data) ? ev.data : null;
            this.doUpdate();
        });
        this.doUpdate();
    }
    #createFreestylerAgent() {
        return new FreestylerAgent({
            aidaClient: this.#aidaClient,
            changeManager: this.#changeManager,
            serverSideLoggingEnabled: this.#serverSideLoggingEnabled,
        });
    }
    #createDrJonesNetworkAgent() {
        return new DrJonesNetworkAgent({
            aidaClient: this.#aidaClient,
            serverSideLoggingEnabled: this.#serverSideLoggingEnabled,
        });
    }
    static async instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!freestylerPanelInstance || forceNew) {
            const aidaAvailability = await Host.AidaClient.AidaClient.checkAccessPreconditions();
            const aidaClient = new Host.AidaClient.AidaClient();
            const syncInfo = await new Promise(resolve => Host.InspectorFrontendHost.InspectorFrontendHostInstance.getSyncInformation(syncInfo => resolve(syncInfo)));
            freestylerPanelInstance = new FreestylerPanel(defaultView, { aidaClient, aidaAvailability, syncInfo });
        }
        return freestylerPanelInstance;
    }
    wasShown() {
        this.registerCSSFiles([freestylerPanelStyles]);
        this.#viewOutput.freestylerChatUi?.restoreScrollPosition();
        this.#viewOutput.freestylerChatUi?.focusTextInput();
    }
    doUpdate() {
        this.view(this.#viewProps, this.#viewOutput, this.#contentContainer);
    }
    #handleSelectElementClick() {
        void this.#toggleSearchElementAction.execute();
    }
    #handleFeedbackSubmit(rpcId, rating, feedback) {
        void this.#aidaClient.registerClientEvent({
            corresponding_aida_rpc_global_id: rpcId,
            disable_user_content_logging: !this.#serverSideLoggingEnabled,
            do_conversation_client_event: {
                user_feedback: {
                    sentiment: rating,
                    user_input: {
                        comment: feedback,
                    },
                },
            },
        });
    }
    #handleAcceptConsentClick() {
        this.#consentViewAcceptedSetting.set(true);
        this.#viewProps.state = "chat-view" /* FreestylerChatUiState.CHAT_VIEW */;
        this.doUpdate();
    }
    #handleSelectedNetworkRequestClick() {
        if (this.#viewProps.selectedNetworkRequest) {
            const requestLocation = NetworkForward.UIRequestLocation.UIRequestLocation.tab(this.#viewProps.selectedNetworkRequest, "headers-component" /* NetworkForward.UIRequestLocation.UIRequestTabs.HEADERS_COMPONENT */);
            return Common.Revealer.reveal(requestLocation);
        }
    }
    handleAction(actionId) {
        switch (actionId) {
            case 'freestyler.element-panel-context': {
                this.#viewOutput.freestylerChatUi?.focusTextInput();
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.FreestylerOpenedFromElementsPanel);
                this.#viewProps.agentType = "freestyler" /* AgentType.FREESTYLER */;
                this.doUpdate();
                break;
            }
            case 'drjones.network-panel-context': {
                // TODO(samiyac): Add UMA
                this.#viewOutput.freestylerChatUi?.focusTextInput();
                this.#viewProps.agentType = "drjones-network-request" /* AgentType.DRJONES_NETWORK_REQUEST */;
                this.doUpdate();
                break;
            }
        }
    }
    #clearMessages() {
        this.#viewProps.messages = [];
        this.#viewProps.isLoading = false;
        this.#cancel();
        this.doUpdate();
    }
    #runAbortController = new AbortController();
    #cancel() {
        this.#runAbortController.abort();
        this.#runAbortController = new AbortController();
        this.#viewProps.isLoading = false;
        this.doUpdate();
    }
    async #startConversation(text, isFixQuery = false) {
        // TODO(samiyac): Refactor startConversation
        this.#viewProps.messages.push({
            entity: "user" /* ChatMessageEntity.USER */,
            text,
        });
        this.#viewProps.isLoading = true;
        const systemMessage = {
            entity: "model" /* ChatMessageEntity.MODEL */,
            suggestingFix: false,
            steps: [],
        };
        this.#viewProps.messages.push(systemMessage);
        this.doUpdate();
        this.#runAbortController = new AbortController();
        const signal = this.#runAbortController.signal;
        if (this.#viewProps.agentType === "freestyler" /* AgentType.FREESTYLER */) {
            await this.#conversationStepsForFreestylerAgent(text, isFixQuery, signal, systemMessage);
        }
        else if (this.#viewProps.agentType === "drjones-network-request" /* AgentType.DRJONES_NETWORK_REQUEST */) {
            await this.#conversationStepsForDrJonesNetworkAgent(text, signal, systemMessage);
        }
    }
    async #conversationStepsForFreestylerAgent(text, isFixQuery = false, signal, systemMessage) {
        let step = { isLoading: true };
        for await (const data of this.#freestylerAgent.run(text, { signal, selectedElement: this.#viewProps.selectedElement, isFixQuery })) {
            step.sideEffect = undefined;
            switch (data.type) {
                case ResponseType.QUERYING: {
                    step = { isLoading: true };
                    if (!systemMessage.steps.length) {
                        systemMessage.steps.push(step);
                    }
                    break;
                }
                case ResponseType.TITLE: {
                    step.title = data.title;
                    if (systemMessage.steps.at(-1) !== step) {
                        systemMessage.steps.push(step);
                    }
                    break;
                }
                case ResponseType.THOUGHT: {
                    step.isLoading = false;
                    step.thought = data.thought;
                    if (systemMessage.steps.at(-1) !== step) {
                        systemMessage.steps.push(step);
                    }
                    break;
                }
                case ResponseType.SIDE_EFFECT: {
                    step.isLoading = false;
                    step.code = data.code;
                    step.sideEffect = {
                        onAnswer: data.confirm,
                    };
                    if (systemMessage.steps.at(-1) !== step) {
                        systemMessage.steps.push(step);
                    }
                    break;
                }
                case ResponseType.ACTION: {
                    step.isLoading = false;
                    step.code = data.code;
                    step.output = data.output;
                    step.canceled = data.canceled;
                    if (systemMessage.steps.at(-1) !== step) {
                        systemMessage.steps.push(step);
                    }
                    break;
                }
                case ResponseType.ANSWER: {
                    systemMessage.suggestingFix = data.fixable;
                    systemMessage.answer = data.text;
                    systemMessage.rpcId = data.rpcId;
                    // When there is an answer without any thinking steps, we don't want to show the thinking step.
                    if (systemMessage.steps.length === 1 && systemMessage.steps[0].isLoading) {
                        systemMessage.steps.pop();
                    }
                    step.isLoading = false;
                    this.#viewProps.isLoading = false;
                    break;
                }
                case ResponseType.ERROR: {
                    step.isLoading = false;
                    systemMessage.error = data.error;
                    systemMessage.suggestingFix = false;
                    systemMessage.rpcId = undefined;
                    this.#viewProps.isLoading = false;
                    if (data.error === "abort" /* ErrorType.ABORT */) {
                        const lastStep = systemMessage.steps.at(-1);
                        // Mark the last step as cancelled to make the UI feel better.
                        if (lastStep) {
                            lastStep.canceled = true;
                        }
                    }
                }
            }
            this.doUpdate();
            this.#viewOutput.freestylerChatUi?.scrollToLastMessage();
        }
    }
    async #conversationStepsForDrJonesNetworkAgent(text, signal, systemMessage) {
        // TODO(samiyac): Only display the thinking step with context details when it is the first message
        const step = {
            isLoading: true,
            title: UIStringsTemp.inspectingNetworkData,
            thought: UIStringsTemp.dataUsedToGenerateThisResponse,
            contextDetails: this.#createContextDetailsForDrJonesNetworkAgent(),
        };
        if (!systemMessage.steps.length) {
            systemMessage.steps.push(step);
        }
        this.doUpdate();
        this.#viewOutput.freestylerChatUi?.scrollToLastMessage();
        for await (const data of this.#drJonesNetworkAgent.run(text, { signal, selectedNetworkRequest: this.#viewProps.selectedNetworkRequest })) {
            switch (data.type) {
                case DrJonesNetworkAgentResponseType.ANSWER: {
                    systemMessage.answer = data.text;
                    systemMessage.rpcId = data.rpcId;
                    step.isLoading = false;
                    this.#viewProps.isLoading = false;
                    break;
                }
                case DrJonesNetworkAgentResponseType.ERROR: {
                    step.isLoading = false;
                    systemMessage.error = "unknown" /* ErrorType.UNKNOWN */;
                    this.#viewProps.isLoading = false;
                }
            }
            this.doUpdate();
            this.#viewOutput.freestylerChatUi?.scrollToLastMessage();
        }
    }
    #createContextDetailsForDrJonesNetworkAgent() {
        if (this.#viewProps.selectedNetworkRequest) {
            const requestContextDetail = {
                title: UIStringsTemp.request,
                text: UIStringsTemp.requestUrl + ': ' + this.#viewProps.selectedNetworkRequest.url() + '\n\n' +
                    formatHeaders(UIStringsTemp.requestHeaders, this.#viewProps.selectedNetworkRequest.requestHeaders()),
            };
            const responseContextDetail = {
                title: UIStringsTemp.response,
                text: UIStringsTemp.responseStatus + ': ' + this.#viewProps.selectedNetworkRequest.statusCode + ' ' +
                    this.#viewProps.selectedNetworkRequest.statusText + '\n\n' +
                    formatHeaders(UIStringsTemp.responseHeaders, this.#viewProps.selectedNetworkRequest.responseHeaders),
            };
            const timingContextDetail = {
                title: UIStringsTemp.timing,
                text: formatNetworkRequestTiming(this.#viewProps.selectedNetworkRequest),
            };
            return [
                requestContextDetail,
                responseContextDetail,
                timingContextDetail,
            ];
        }
        return [];
    }
}
export class ActionDelegate {
    handleAction(_context, actionId) {
        switch (actionId) {
            case 'freestyler.element-panel-context':
            case 'drjones.network-panel-context': {
                void (async () => {
                    const view = UI.ViewManager.ViewManager.instance().view(FreestylerPanel.panelName);
                    if (view) {
                        await UI.ViewManager.ViewManager.instance().showView(FreestylerPanel.panelName);
                        const widget = (await view.widget());
                        widget.handleAction(actionId);
                    }
                })();
                return true;
            }
        }
        return false;
    }
}
function setFreestylerServerSideLoggingEnabled(enabled) {
    if (enabled) {
        localStorage.setItem('freestyler_enableServerSideLogging', 'true');
    }
    else {
        localStorage.setItem('freestyler_enableServerSideLogging', 'false');
    }
}
function isFreestylerServerSideLoggingEnabled() {
    const config = Common.Settings.Settings.instance().getHostConfig();
    if (config.aidaAvailability?.disallowLogging) {
        return false;
    }
    return localStorage.getItem('freestyler_enableServerSideLogging') !== 'false';
}
// @ts-ignore
globalThis.setFreestylerServerSideLoggingEnabled = setFreestylerServerSideLoggingEnabled;
//# sourceMappingURL=FreestylerPanel.js.map