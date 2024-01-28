// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../../core/host/host.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as Marked from '../../../third_party/marked/marked.js';
import * as Buttons from '../../../ui/components/buttons/buttons.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as MarkdownView from '../../../ui/components/markdown_view/markdown_view.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import { SourceType } from '../PromptBuilder.js';
import styles from './consoleInsight.css.js';
import listStyles from './consoleInsightSourcesList.css.js';
const UIStrings = {
    /**
     * @description The title of the button that allows providing the feebdack that a
     * console message insight was inaccruate.
     */
    inaccurate: 'Inaccurate',
    /**
     * @description The title of the button that allows providing the feebdack that a
     *console message insight was irrelevant.
     */
    irrelevant: 'Irrelevant',
    /**
     * @description The title of the button that allows providing the feebdack that a
     *console message insight was inappropriate.
     */
    inappropriate: 'Inappropriate',
    /**
     * @description The title of the button that allows providing the feebdack that a
     *console message insight was helpful.
     */
    notHelpful: 'Not helpful',
    /**
     * @description The title of the button that allows providing the feebdack that a
     *console message insight was not good for an unknown "other" reason.
     */
    other: 'Other',
    /**
     * @description The title of the insight source "Console message".
     */
    consoleMessage: 'Console message',
    /**
     * @description The title of the insight source "Stacktrace".
     */
    stackTrace: 'Stacktrace',
    /**
     * @description The title of the insight source "Network request".
     */
    networkRequest: 'Network request',
    /**
     * @description The title of the insight source "Related code".
     */
    relatedCode: 'Related code',
    /**
     * @description The text appearing before the list of sources that DevTools
     * could collect based on a console message. If the user clicks the button
     * related to the text, these sources will be used to generate insights.
     */
    refineButtonHint: 'Click this button to send the following data to the AI model running on Google\'s servers, so it can generate a more accurate and relevant response:',
    /**
     * @description The title that is shown while the insight is being generated.
     */
    generating: 'Generating…',
    /**
     * @description The header that indicates that the content shown is a console
     * insight.
     */
    insight: 'Insight',
    /**
     * @description The title of the a button that closes the rating form.
     */
    close: 'Close',
    /**
     * @description The title of the a button that closes the insight pane.
     */
    closeInsight: 'Close insight',
    /**
     * @description The title of the list of source data that was used to generate the insight.
     */
    sources: 'Sources',
    /**
     * @description The title of the button that allows the user to include more
     * sources for the generation of the console insight.
     */
    refine: 'Give context to personalize insight',
    /**
     * @description The title of the button that is shown while the console
     * insight is being re-generated.
     */
    refining: 'Personalizing insight…',
    /**
     * @description The title of the button that allows submitting positive
     * feedback about the console insight.
     */
    thumbUp: 'Thumb up',
    /**
     * @description The title of the button that allows submitting negative
     * feedback about the console insight.
     */
    thumbDown: 'Thumb down',
    /**
     * @description The title of the link that allows submitting more feedback.
     */
    submitFeedback: 'Submit feedback',
    /**
     * @description The title indicating the dogfood phase of the feature.
     */
    dogfood: 'Dogfood',
    /**
     * @description The title of the rating form that asks for the reason for the rating.
     */
    reason: 'Why did you choose this rating? (optional)',
    /**
     * @description The placeholder for the textarea for providing additional
     * feedback.
     */
    additionalFeedback: 'Provide additional feedback (optional)',
    /**
     * @description The title of the button that submits the feedback.
     */
    submit: 'Submit',
    /**
     * @description The text of the header inside the console insight pane when there was an error generating an insight.
     */
    error: 'Something went wrong…',
    /**
     * @description Title of the info icon button that shows more details about
     * how refining a console insight will work. It shows a tooltip with
     * additional info when hovered or pressed.
     */
    refineInfo: 'Learn how personalizing of insights works',
    /**
     * @description Label for screenreaders that is added to the end of the link
     * title to indicate that the link will be opened in a new tab.
     */
    opensInNewTab: '(opens in a new tab)',
};
const str_ = i18n.i18n.registerUIStrings('panels/explain/components/ConsoleInsight.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
const { render, html, Directives } = LitHtml;
export class CloseEvent extends Event {
    static eventName = 'close';
    constructor() {
        super(CloseEvent.eventName, { composed: true, bubbles: true });
    }
}
// key => localized string.
const negativeRatingReasons = [
    ['inaccurate', i18nLazyString(UIStrings.inaccurate)],
    ['irrelevant', i18nLazyString(UIStrings.irrelevant)],
    ['inapproprate', i18nLazyString(UIStrings.inappropriate)],
    ['not-helpful', i18nLazyString(UIStrings.notHelpful)],
    ['other', i18nLazyString(UIStrings.other)],
];
function localizeType(sourceType) {
    switch (sourceType) {
        case SourceType.MESSAGE:
            return i18nString(UIStrings.consoleMessage);
        case SourceType.STACKTRACE:
            return i18nString(UIStrings.stackTrace);
        case SourceType.NETWORK_REQUEST:
            return i18nString(UIStrings.networkRequest);
        case SourceType.RELATED_CODE:
            return i18nString(UIStrings.relatedCode);
    }
}
const DOGFOODFEEDBACK_URL = 'http://go/console-insights-experiment-general-feedback';
function buildRatingFormLink(rating, comment, explanation, consoleMessage, stackTrace, relatedCode, networkData) {
    const params = rating === 'Negative' ? {
        'entry.1465663861': rating,
        'entry.1232404632': explanation,
        'entry.37285503': stackTrace,
        'entry.542010749': consoleMessage,
        'entry.420621380': relatedCode,
        'entry.822323774': networkData,
    } :
        {
            'entry.1465663861': rating,
            'entry.1805879004': explanation,
            'entry.720239045': stackTrace,
            'entry.623054399': consoleMessage,
            'entry.1520357991': relatedCode,
            'entry.1966708581': networkData,
        };
    return `http://go/console-insights-experiment-rating?usp=pp_url&${Object.keys(params)
        .map(param => {
        return `${param}=${encodeURIComponent(params[param])}`;
    })
        .join('&')}`;
}
let nextInstanceId = 0;
export class ConsoleInsight extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-console-insight`;
    #shadow = this.attachShadow({ mode: 'open' });
    // Flip to false to enable non-dogfood branding. Note that rating is not
    // implemented.
    #dogfood = true;
    // Flip to false to enable a refine button.
    #refinedByDefault = false;
    #promptBuilder;
    #insightProvider;
    #renderer = new MarkdownRenderer();
    // Main state.
    #state = {
        type: "loading" /* State.LOADING */,
    };
    // Rating sub-form state.
    #ratingFormOpened = false;
    #selectedRating;
    #selectedRatingReasons = new Set();
    #popover;
    #id;
    #popoverInitiatedViaKeyboard = false;
    constructor(promptBuilder, insightProvider) {
        super();
        this.#promptBuilder = promptBuilder;
        this.#insightProvider = insightProvider;
        this.#render();
        // Stop keyboard event propagation to avoid Console acting on the events
        // inside the insight component.
        this.addEventListener('keydown', e => {
            e.stopPropagation();
        });
        this.addEventListener('keyup', e => {
            e.stopPropagation();
        });
        this.addEventListener('keypress', e => {
            e.stopPropagation();
        });
        this.tabIndex = 0;
        this.#id = nextInstanceId++;
        this.focus();
        this.#popover = new UI.PopoverHelper.PopoverHelper(this, this.#onPopoverRequest.bind(this));
        this.#popover.setTimeout(300);
        this.#popover.setHasPadding(true);
        // Measure the height of the element after an animation. `--actual-height` can
        // be used as the `from` value for the subsequent animation.
        this.addEventListener('animationend', () => {
            this.style.setProperty('--actual-height', `${this.offsetHeight}px`);
        });
    }
    #onPopoverRequest(event) {
        const hoveredNode = event.composedPath()[0];
        if (!hoveredNode || !hoveredNode.isSelfOrDescendant(this.#shadow.querySelector('.info'))) {
            return null;
        }
        const trapFocus = this.#popoverInitiatedViaKeyboard || event.type !== 'mousemove';
        return {
            box: hoveredNode.boxInWindow(),
            show: async (popover) => {
                const { sources } = await this.#promptBuilder.buildPrompt();
                const dialogId = `dialog-${this.#id}`;
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.fontSize = '13px';
                container.style.lineHeight = '20px';
                container.setAttribute('aria-modal', 'true');
                container.tabIndex = -1;
                container.role = 'dialog';
                if (trapFocus) {
                    container.addEventListener('keydown', event => {
                        const keyboardEvent = event;
                        if (keyboardEvent.key === 'Tab') {
                            const focusableElements = getFocusableElements(popover);
                            const focusedElement = getFocusedElement(popover);
                            // Trap focus for the tab navigation inside the dialog.
                            if (focusedElement) {
                                const focusedItemIdx = focusableElements.indexOf(focusedElement);
                                if (event.shiftKey && focusedItemIdx === 0) {
                                    focusableElements.at(-1)?.focus();
                                    event.preventDefault();
                                }
                                else if (!event.shiftKey && focusedItemIdx === focusableElements.length - 1) {
                                    focusableElements.at(0)?.focus();
                                    event.preventDefault();
                                }
                            }
                        }
                        else if (keyboardEvent.key === 'Escape') {
                            event.consume(true);
                            // Restore focus to the info icon.
                            this.#popover.hidePopover();
                            this.#shadow.querySelector('.info')?.focus();
                        }
                    });
                }
                const doc = document.createElement('div');
                doc.role = 'document';
                doc.tabIndex = 0;
                doc.setAttribute('aria-describedby', dialogId);
                container.append(doc);
                const text = document.createElement('p');
                text.id = dialogId;
                text.innerText = i18nString(UIStrings.refineButtonHint);
                text.style.margin = '0';
                doc.append(text);
                const list = document.createElement('devtools-console-insight-sources-list');
                list.sources = sources;
                doc.append(list);
                popover.contentElement.append(container);
                popover.setAnchorBehavior("PreferBottom" /* UI.GlassPane.AnchorBehavior.PreferBottom */);
                if (trapFocus) {
                    const origShow = popover.show;
                    popover.show = (document) => {
                        origShow.call(popover, document);
                        popover.contentElement.querySelector('[role=document]')?.focus();
                    };
                    const origHide = popover.hide;
                    popover.hide = () => {
                        origHide.call(popover);
                        this.#shadow.querySelector('.info')?.focus();
                    };
                }
                return true;
            },
        };
    }
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [styles];
        this.classList.add('opening');
    }
    disonnectedCallback() {
        this.#popover.dispose();
    }
    set dogfood(value) {
        this.#dogfood = value;
        this.#render();
    }
    get dogfood() {
        return this.#dogfood;
    }
    #transitionTo(newState) {
        const previousState = this.#state;
        this.#state = newState;
        if (newState.type !== previousState.type && previousState.type === "loading" /* State.LOADING */) {
            this.classList.add('loaded');
        }
        this.#render();
    }
    async update(includeContext = this.#refinedByDefault) {
        this.#transitionTo(this.#state.type === "insight" /* State.INSIGHT */ ? {
            ...this.#state,
            type: "refining" /* State.REFINING */,
        } :
            {
                type: "loading" /* State.LOADING */,
            });
        try {
            const requestedSources = includeContext ? undefined : [SourceType.MESSAGE];
            const { prompt, sources } = await this.#promptBuilder.buildPrompt(requestedSources);
            const explanation = await this.#insightProvider.getInsights(prompt);
            this.#transitionTo({
                type: "insight" /* State.INSIGHT */,
                tokens: Marked.Marked.lexer(explanation),
                explanation,
                sources,
                refined: includeContext,
            });
        }
        catch (err) {
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightErrored);
            this.#transitionTo({
                type: "error" /* State.ERROR */,
                error: err.message,
            });
        }
    }
    #onClose() {
        this.dispatchEvent(new CloseEvent());
        this.classList.add('closing');
    }
    #onCloseRating() {
        this.#ratingFormOpened = false;
        this.#selectedRating = undefined;
        this.#selectedRatingReasons.clear();
        this.#render();
    }
    #onSubmit() {
        if (this.#dogfood) {
            this.#openFeedbackFrom();
        }
        this.#onCloseRating();
    }
    #openFeedbackFrom() {
        if (this.#state.type !== "insight" /* State.INSIGHT */) {
            throw new Error('Unexpected state');
        }
        const link = buildRatingFormLink(this.#selectedRating ? 'Positive' : 'Negative', this.#shadow.querySelector('textarea')?.value || '', this.#state.explanation, this.#state.sources.filter(s => s.type === SourceType.MESSAGE).map(s => s.value).join('\n'), this.#state.sources.filter(s => s.type === SourceType.STACKTRACE).map(s => s.value).join('\n'), this.#state.sources.filter(s => s.type === SourceType.RELATED_CODE).map(s => s.value).join('\n'), this.#state.sources.filter(s => s.type === SourceType.NETWORK_REQUEST).map(s => s.value).join('\n'));
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(link);
    }
    #onRating(event) {
        this.#selectedRating = event.target.dataset.rating === 'true';
        if (this.#selectedRating) {
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightRatedPositive);
        }
        else {
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightRatedNegative);
        }
        if (this.#dogfood) {
            this.#openFeedbackFrom();
            return;
        }
        this.#ratingFormOpened = true;
        this.#render();
    }
    #onReason(event) {
        const target = event.target;
        if (!target.active) {
            this.#selectedRatingReasons.add(target.dataset.reason);
        }
        else {
            this.#selectedRatingReasons.delete(target.dataset.reason);
        }
        this.#render();
    }
    #onRefine() {
        if (this.#state.type !== "insight" /* State.INSIGHT */) {
            throw new Error('Unexpected state');
        }
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightRefined);
        void this.update(true);
    }
    #onInfoKeyDown(event) {
        if (event instanceof KeyboardEvent) {
            switch (event.key) {
                case 'Escape':
                    event.consume(true);
                    this.#popover.hidePopover();
                    break;
                case 'Enter':
                case ' ':
                    event.consume(true);
                    this.#popoverInitiatedViaKeyboard = true;
                    try {
                        event.target?.dispatchEvent(new MouseEvent('mousedown', {
                            bubbles: true,
                            composed: true,
                            cancelable: true,
                            clientX: event.target.getBoundingClientRect().x,
                            clientY: event.target.getBoundingClientRect().y,
                        }));
                    }
                    finally {
                        this.#popoverInitiatedViaKeyboard = false;
                    }
                    break;
            }
        }
    }
    #renderMain() {
        // clang-format off
        switch (this.#state.type) {
            case "loading" /* State.LOADING */:
                return html `<main>
            <div role="presentation" class="loader" style="clip-path: url('#clipPath');">
              <svg width="100%" height="64">
                <clipPath id="clipPath">
                  <rect x="0" y="0" width="100%" height="16" rx="8"></rect>
                  <rect x="0" y="24" width="100%" height="16" rx="8"></rect>
                  <rect x="0" y="48" width="100%" height="16" rx="8"></rect>
                </clipPath>
              </svg>
            </div>
          </main>`;
            case "refining" /* State.REFINING */:
            case "insight" /* State.INSIGHT */:
                return html `
        <main>
          <${MarkdownView.MarkdownView.MarkdownView.litTagName}
            .data=${{ tokens: this.#state.tokens, renderer: this.#renderer }}>
          </${MarkdownView.MarkdownView.MarkdownView.litTagName}>
          <details style="--list-height: ${this.#state.sources.length * 20}px;">
            <summary>${i18nString(UIStrings.sources)}</summary>
            <${ConsoleInsightSourcesList.litTagName} .sources=${this.#state.sources}>
            </${ConsoleInsightSourcesList.litTagName}>
          </details>
          ${!this.#state.refined ? html `<div class="refine-container">
            <${Buttons.Button.Button.litTagName}
                class="refine-button"
                .data=${{
                    variant: "tonal" /* Buttons.Button.Variant.TONAL */,
                    size: "MEDIUM" /* Buttons.Button.Size.MEDIUM */,
                    iconName: 'spark',
                }}
                @click=${this.#onRefine}
              >
              ${this.#state.type === "refining" /* State.REFINING */ ? i18nString(UIStrings.refining) : i18nString(UIStrings.refine)}
            </${Buttons.Button.Button.litTagName}>
            <${Buttons.Button.Button.litTagName}
              class="info"
              .data=${{
                    variant: "round" /* Buttons.Button.Variant.ROUND */,
                    size: "SMALL" /* Buttons.Button.Size.SMALL */,
                    iconName: 'info',
                    title: i18nString(UIStrings.refineInfo),
                }}
              @keydown=${this.#onInfoKeyDown}
            ></${Buttons.Button.Button.litTagName}>
          </div>
          ` : ''}
        </main>`;
            case "error" /* State.ERROR */:
                return html `
        <main>
          <div class="error">${this.#state.error}</div>
        </main>`;
        }
        // clang-format on
    }
    #renderFooter() {
        // clang-format off
        switch (this.#state.type) {
            case "loading" /* State.LOADING */:
            case "error" /* State.ERROR */:
                return LitHtml.nothing;
            case "insight" /* State.INSIGHT */:
            case "refining" /* State.REFINING */:
                return html `<footer>
        <div>
          <${Buttons.Button.Button.litTagName}
            data-rating=${'true'}
            .data=${{
                    variant: "round" /* Buttons.Button.Variant.ROUND */,
                    size: "SMALL" /* Buttons.Button.Size.SMALL */,
                    iconName: 'thumb-up',
                    active: this.#selectedRating,
                    title: i18nString(UIStrings.thumbUp),
                }}
            @click=${this.#onRating}
          ></${Buttons.Button.Button.litTagName}>
          <${Buttons.Button.Button.litTagName}
            data-rating=${'false'}
            .data=${{
                    variant: "round" /* Buttons.Button.Variant.ROUND */,
                    size: "SMALL" /* Buttons.Button.Size.SMALL */,
                    iconName: 'thumb-down',
                    active: this.#selectedRating !== undefined && !this.#selectedRating,
                    title: i18nString(UIStrings.thumbDown),
                }}
            @click=${this.#onRating}
          ></${Buttons.Button.Button.litTagName}>
        </div>
        <div class="filler"></div>
        ${this.#dogfood ? html `<div class="dogfood-feedback">
            <${IconButton.Icon.Icon.litTagName} name="dog-paw"></${IconButton.Icon.Icon.litTagName}>
            <span>${i18nString(UIStrings.dogfood)} - </span>
            <x-link href=${DOGFOODFEEDBACK_URL} class="link">${i18nString(UIStrings.submitFeedback)}</x-link>
        </div>` : ''}
      </footer>`;
        }
        // clang-format on
    }
    #getHeader() {
        switch (this.#state.type) {
            case "loading" /* State.LOADING */:
                return i18nString(UIStrings.generating);
            case "insight" /* State.INSIGHT */:
            case "refining" /* State.REFINING */:
                return i18nString(UIStrings.insight);
            case "error" /* State.ERROR */:
                return i18nString(UIStrings.error);
        }
    }
    #render() {
        const topWrapper = Directives.classMap({
            wrapper: true,
            top: this.#ratingFormOpened,
        });
        const bottomWrapper = Directives.classMap({
            wrapper: true,
            bottom: this.#ratingFormOpened,
        });
        // clang-format off
        render(html `
      <div class=${topWrapper}>
        <header>
          <div>
            <${IconButton.Icon.Icon.litTagName} name="spark"></${IconButton.Icon.Icon.litTagName}>
          </div>
          <div class="filler">
            <h2>
              ${this.#getHeader()}
            </h2>
          </div>
          <div>
            <${Buttons.Button.Button.litTagName}
              .data=${{
            variant: "round" /* Buttons.Button.Variant.ROUND */,
            size: "SMALL" /* Buttons.Button.Size.SMALL */,
            iconName: 'cross',
            title: i18nString(UIStrings.closeInsight),
        }}
              @click=${this.#onClose}
            ></${Buttons.Button.Button.litTagName}>
          </div>
        </header>
        ${this.#renderMain()}
        ${this.#renderFooter()}
      </div>
      ${this.#ratingFormOpened ? html `
        <div class=${bottomWrapper}>
          <header>
            <div class="filler">${i18nString(UIStrings.reason)}</div>
            <div>
              <${Buttons.Button.Button.litTagName}
                .data=${{
            variant: "round" /* Buttons.Button.Variant.ROUND */,
            size: "SMALL" /* Buttons.Button.Size.SMALL */,
            iconName: 'cross',
            title: i18nString(UIStrings.close),
        }}
                @click=${this.#onCloseRating}
              ></${Buttons.Button.Button.litTagName}>
            </div>
          </header>
          <main>
            ${!this.#selectedRating ? html `
                <div class="buttons">
                  ${Directives.repeat(negativeRatingReasons, ([key, label]) => {
            return html `
                      <${Buttons.Button.Button.litTagName}
                        data-reason=${key}
                        @click=${this.#onReason}
                        .data=${{
                variant: "secondary" /* Buttons.Button.Variant.SECONDARY */,
                size: "MEDIUM" /* Buttons.Button.Size.MEDIUM */,
                active: this.#selectedRatingReasons.has(key),
            }}
                      >
                        ${label()}
                      </${Buttons.Button.Button.litTagName}>
                    `;
        })}
                </div>
            ` : ''}
            <textarea placeholder=${i18nString(UIStrings.additionalFeedback)}></textarea>
          </main>
          <footer>
            <div class="filler"></div>
            <div>
              <${Buttons.Button.Button.litTagName}
                .data=${{
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
            size: "MEDIUM" /* Buttons.Button.Size.MEDIUM */,
            title: i18nString(UIStrings.submit),
        }}
                @click=${this.#onSubmit}
              >
                ${i18nString(UIStrings.submit)}
              </${Buttons.Button.Button.litTagName}>
            </div>
          </footer>
        </div>
      ` : ''}
    `, this.#shadow, {
            host: this,
        });
        // clang-format on
    }
}
class ConsoleInsightSourcesList extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-console-insight-sources-list`;
    #shadow = this.attachShadow({ mode: 'open' });
    #sources = [];
    constructor() {
        super();
        this.#shadow.adoptedStyleSheets = [listStyles];
    }
    #render() {
        // clang-format off
        render(html `
      <ul>
        ${Directives.repeat(this.#sources, item => item.value, item => {
            const icon = new IconButton.Icon.Icon();
            icon.data = { iconName: 'open-externally', color: 'var(--sys-color-primary)', width: '14px', height: '14px' };
            return html `<li><x-link class="link" title="${localizeType(item.type)} ${i18nString(UIStrings.opensInNewTab)}" href=${`data:text/plain,${encodeURIComponent(item.value)}`}>${localizeType(item.type)}${icon}</x-link></li>`;
        })}
      </ul>
    `, this.#shadow, {
            host: this,
        });
        // clang-format on
    }
    set sources(values) {
        this.#sources = values;
        this.#render();
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-console-insight', ConsoleInsight);
ComponentHelpers.CustomElements.defineComponent('devtools-console-insight-sources-list', ConsoleInsightSourcesList);
export class MarkdownRenderer extends MarkdownView.MarkdownView.MarkdownLitRenderer {
    renderToken(token) {
        const template = this.templateForToken(token);
        if (template === null) {
            console.warn(`Markdown token type '${token.type}' not supported.`);
            return LitHtml.html ``;
        }
        return template;
    }
    templateForToken(token) {
        switch (token.type) {
            case 'heading':
                return html `<strong>${this.renderText(token)}</strong>`;
            case 'link':
            case 'image':
                return LitHtml.html `${UI.XLink.XLink.create(token.href, token.text, undefined, undefined, 'token')}`;
        }
        return super.templateForToken(token);
    }
}
function getFocusedElement(popover) {
    const root = popover.contentElement.getComponentRoot();
    if (!(root instanceof ShadowRoot)) {
        throw new Error('Expected a shadow root');
    }
    let focusedElement = root.activeElement;
    while (focusedElement && focusedElement.shadowRoot?.activeElement) {
        focusedElement = focusedElement.shadowRoot?.activeElement;
    }
    return focusedElement;
}
function getFocusableElements(popover) {
    const root = popover.contentElement.getComponentRoot();
    if (!(root instanceof ShadowRoot)) {
        throw new Error('Expected a shadow root');
    }
    const focusableSelectors = [
        'x-link',
        '[role=document]',
    ];
    const result = [];
    function walk(root) {
        const iter = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        do {
            const currentNode = iter.currentNode;
            if (currentNode.shadowRoot) {
                walk(currentNode.shadowRoot);
            }
            if (currentNode instanceof ShadowRoot) {
                continue;
            }
            if (currentNode !== root && focusableSelectors.some(selector => currentNode.matches(selector))) {
                result.push(currentNode);
            }
        } while (iter.nextNode());
    }
    walk(root.host);
    return result;
}
//# sourceMappingURL=ConsoleInsight.js.map