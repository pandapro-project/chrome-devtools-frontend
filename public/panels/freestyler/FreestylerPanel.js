// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LitHtml from '../../ui/lit-html/lit-html.js';
import { FreestylerChatUi, } from './components/FreestylerChatUi.js';
import { FIX_THIS_ISSUE_PROMPT, FreestylerAgent, Step } from './FreestylerAgent.js';
import freestylerPanelStyles from './freestylerPanel.css.js';
const DOGFOOD_INFO = ' https://goo.gle/freestyler-dogfood';
/*
  * TODO(nvitkov): b/346933425
  * Temporary string that should not be translated
  * as they may change often during development.
  */
const TempUIStrings = {
    /**
     *@description Freestyler UI text for clearing messages.
     */
    clearMessages: 'Clear messages',
    /**
     *@description Freestyler UI text for sending feedback.
     */
    sendFeedback: 'Send feedback',
    /**
     *@description Freestyelr UI text for the help button.
     */
    help: 'Help',
    /**
     *@description Displayed when the user stop the response
     */
    stoppedResponse: 'You stopped this response',
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
    const clearButton = new UI.Toolbar.ToolbarButton(i18nString(TempUIStrings.clearMessages), 'clear', undefined, 'freestyler.clear');
    clearButton.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.Click */, onClearClick);
    leftToolbar.appendToolbarItem(clearButton);
    rightToolbar.appendSeparator();
    const helpButton = new UI.Toolbar.ToolbarButton(i18nString(TempUIStrings.sendFeedback), 'help', undefined, 'freestyler.feedback');
    helpButton.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.Click */, () => {
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
    #selectedNode;
    #contentContainer;
    #aidaClient;
    #agent;
    #viewProps;
    #viewOutput = {};
    #consentViewAcceptedSetting = Common.Settings.Settings.instance().createLocalSetting('freestyler-dogfood-consent-onboarding-finished', false);
    constructor(view = defaultView, { aidaClient, aidaAvailability }) {
        super(FreestylerPanel.panelName);
        this.view = view;
        createToolbar(this.contentElement, { onClearClick: this.#clearMessages.bind(this) });
        this.#toggleSearchElementAction =
            UI.ActionRegistry.ActionRegistry.instance().getAction('elements.toggle-element-search');
        this.#aidaClient = aidaClient;
        this.#contentContainer = this.contentElement.createChild('div', 'freestyler-chat-ui-container');
        this.#agent =
            new FreestylerAgent({ aidaClient: this.#aidaClient, confirmSideEffect: this.showConfirmSideEffectUi.bind(this) });
        this.#selectedNode = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        this.#viewProps = {
            state: this.#consentViewAcceptedSetting.get() ? "chat-view" /* FreestylerChatUiState.CHAT_VIEW */ :
                "consent-view" /* FreestylerChatUiState.CONSENT_VIEW */,
            aidaAvailability,
            messages: [],
            inspectElementToggled: this.#toggleSearchElementAction.toggled(),
            selectedNode: this.#selectedNode,
            isLoading: false,
            lastActionIsFixThisIssue: false,
            onTextSubmit: this.#handleTextSubmit.bind(this),
            onInspectElementClick: this.#handleSelectElementClick.bind(this),
            onRateClick: this.#handleRateClick.bind(this),
            onAcceptConsentClick: this.#handleAcceptConsentClick.bind(this),
            onCancelClick: this.#cancel.bind(this),
            onFixThisIssueClick: () => {
                void this.#handleTextSubmit(FIX_THIS_ISSUE_PROMPT);
            },
        };
        this.#toggleSearchElementAction.addEventListener("Toggled" /* UI.ActionRegistration.Events.Toggled */, ev => {
            this.#viewProps.inspectElementToggled = ev.data;
            this.doUpdate();
        });
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DOMModel.DOMNode, ev => {
            if (this.#viewProps.selectedNode === ev.data) {
                return;
            }
            this.#viewProps.selectedNode = ev.data;
            this.doUpdate();
        });
        this.doUpdate();
    }
    static async instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!freestylerPanelInstance || forceNew) {
            const aidaAvailability = await Host.AidaClient.AidaClient.getAidaClientAvailability();
            const aidaClient = new Host.AidaClient.AidaClient();
            freestylerPanelInstance = new FreestylerPanel(defaultView, { aidaClient, aidaAvailability });
        }
        return freestylerPanelInstance;
    }
    wasShown() {
        this.registerCSSFiles([freestylerPanelStyles]);
        this.#viewOutput.freestylerChatUi?.focusTextInput();
    }
    doUpdate() {
        this.view(this.#viewProps, this.#viewOutput, this.#contentContainer);
    }
    async showConfirmSideEffectUi(action) {
        const sideEffectConfirmationPromiseWithResolvers = Platform.PromiseUtilities.promiseWithResolvers();
        this.#viewProps.confirmSideEffectDialog = {
            code: action,
            onAnswer: (answer) => sideEffectConfirmationPromiseWithResolvers.resolve(answer),
        };
        this.doUpdate();
        const result = await sideEffectConfirmationPromiseWithResolvers.promise;
        this.#viewProps.confirmSideEffectDialog = undefined;
        this.doUpdate();
        return result;
    }
    #handleSelectElementClick() {
        void this.#toggleSearchElementAction.execute();
    }
    #handleRateClick(rpcId, rating) {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.registerAidaClientEvent(JSON.stringify({
            client: Host.AidaClient.CLIENT_NAME,
            event_time: new Date().toISOString(),
            corresponding_aida_rpc_global_id: rpcId,
            do_conversation_client_event: {
                user_feedback: {
                    sentiment: rating === "positive" /* Rating.POSITIVE */ ? 'POSITIVE' : 'NEGATIVE',
                },
            },
        }));
    }
    #handleAcceptConsentClick() {
        this.#consentViewAcceptedSetting.set(true);
        this.#viewProps.state = "chat-view" /* FreestylerChatUiState.CHAT_VIEW */;
        this.doUpdate();
    }
    handleAction(actionId) {
        switch (actionId) {
            case 'freestyler.element-panel-context': {
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.FreestylerOpenedFromElementsPanel);
                this.doUpdate();
                break;
            }
            case 'freestyler.style-tab-context': {
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.FreestylerOpenedFromStylesTab);
                this.doUpdate();
                break;
            }
        }
    }
    #clearMessages() {
        this.#viewProps.messages = [];
        this.#viewProps.isLoading = false;
        this.#agent.resetHistory();
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
    async #handleTextSubmit(text) {
        this.#viewProps.messages.push({
            entity: "user" /* ChatMessageEntity.USER */,
            text,
        });
        this.#viewProps.lastActionIsFixThisIssue = text === FIX_THIS_ISSUE_PROMPT;
        this.#viewProps.isLoading = true;
        let systemMessage = {
            entity: "model" /* ChatMessageEntity.MODEL */,
            steps: [],
        };
        this.doUpdate();
        this.#runAbortController = new AbortController();
        const signal = this.#runAbortController.signal;
        signal.addEventListener('abort', () => {
            systemMessage.rpcId = undefined;
            systemMessage.steps.push({ step: Step.ERROR, text: i18nString(TempUIStrings.stoppedResponse) });
        });
        for await (const data of this.#agent.run(text, { signal })) {
            if (data.step === Step.QUERYING) {
                systemMessage = {
                    entity: "model" /* ChatMessageEntity.MODEL */,
                    steps: [],
                };
                this.#viewProps.messages.push(systemMessage);
                this.doUpdate();
                continue;
            }
            if (data.step === Step.ANSWER || data.step === Step.ERROR) {
                this.#viewProps.isLoading = false;
            }
            systemMessage.rpcId = data.rpcId;
            systemMessage.steps.push(data);
            this.doUpdate();
        }
    }
}
export class ActionDelegate {
    handleAction(_context, actionId) {
        switch (actionId) {
            case 'freestyler.element-panel-context':
            case 'freestyler.style-tab-context': {
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
//# sourceMappingURL=FreestylerPanel.js.map