// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as LitHtml from '../../lit-html/lit-html.js';
import * as VisualLogging from '../../visual_logging/visual_logging.js';
import * as IconButton from '../icon_button/icon_button.js';
import * as Input from '../input/input.js';
import settingCheckboxStyles from './settingCheckbox.css.js';
import { SettingDeprecationWarning } from './SettingDeprecationWarning.js';
/**
 * A simple checkbox that is backed by a boolean setting.
 */
export class SettingCheckbox extends HTMLElement {
    static litTagName = LitHtml.literal `setting-checkbox`;
    #shadow = this.attachShadow({ mode: 'open' });
    #setting;
    #changeListenerDescriptor;
    #textOverride;
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [Input.checkboxStyles, settingCheckboxStyles];
    }
    set data(data) {
        if (this.#changeListenerDescriptor && this.#setting) {
            this.#setting.removeChangeListener(this.#changeListenerDescriptor.listener);
        }
        this.#setting = data.setting;
        this.#textOverride = data.textOverride;
        this.#changeListenerDescriptor = this.#setting.addChangeListener(() => {
            this.#render();
        });
        this.#render();
    }
    #deprecationIcon() {
        if (!this.#setting?.deprecation) {
            return undefined;
        }
        return LitHtml.html `<${SettingDeprecationWarning.litTagName} .data=${this.#setting.deprecation}></${SettingDeprecationWarning.litTagName}>`;
    }
    #render() {
        if (!this.#setting) {
            throw new Error('No "Setting" object provided for rendering');
        }
        const icon = this.#deprecationIcon();
        const reason = this.#setting.disabledReason() ?
            LitHtml.html `
      <${IconButton.Icon.Icon.litTagName} class="disabled-reason" name="info" title=${this.#setting.disabledReason()} @click=${onclick}></${IconButton.Icon.Icon.litTagName}>
    ` :
            LitHtml.nothing;
        LitHtml.render(LitHtml.html `
      <p>
        <label>
          <input
            type="checkbox"
            .checked=${this.#setting.disabledReason() ? false : this.#setting.get()}
            ?disabled=${this.#setting.disabled()}
            @change=${this.#checkboxChanged}
            jslog=${VisualLogging.toggle().track({ click: true }).context(this.#setting.name)}
            aria-label=${this.#setting.title()}
          />
          ${this.#textOverride || this.#setting.title()}${reason}${icon}
        </label>
      </p>`, this.#shadow, { host: this });
    }
    #checkboxChanged(e) {
        this.#setting?.set(e.target.checked);
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            composed: false,
        }));
    }
}
customElements.define('setting-checkbox', SettingCheckbox);
//# sourceMappingURL=SettingCheckbox.js.map