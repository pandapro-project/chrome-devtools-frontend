// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2024 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:host {
  width: 100%;
  height: 100%;
  user-select: text;
  display: flex;
  flex-direction: column;
  background-color: var(--sys-color-cdt-base-container);
}

.chat-ui {
  width: 100%;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.input-form {
  display: flex;
  flex-direction: column;
  padding: var(--sys-size-8) var(--sys-size-4) 0 var(--sys-size-4);
  max-width: var(--sys-size-36);
  width: 100%;
  margin: 0 auto;
}

.chat-input-container {
  margin: var(--sys-size-3) 0;
  padding: 0 2px;
  border-radius: 4px;
  border: 1px solid var(--sys-color-neutral-outline);
  width: 100%;
  display: flex;
  background-color: var(--sys-color-cdt-base-container);
}

.chat-input {
  border: 0;
  height: var(--sys-size-11);
  padding: 0 6px;
  flex-grow: 1;
  color: var(--sys-color-on-surface);
  background-color: var(--sys-color-cdt-base-container);
}

.chat-input:focus-visible {
  outline: none;
}

.chat-input-container:has(.chat-input:focus-visible) {
  outline: 1px solid var(--sys-color-primary);
}

.chat-input::placeholder {
  color: var(--sys-color-state-disabled);
}

.chat-input-disclaimer {
  text-align: center;
  color: var(--sys-color-on-surface-subtle);
  margin-bottom: var(--sys-size-4);
}

.messages-scroll-container {
  overflow: overlay;
  flex-grow: 1;
}

.messages-container {
  margin: var(--sys-size-6) auto 0 auto;
  max-width: var(--sys-size-36);
  padding: 0 var(--sys-size-4);
}

.chat-message {
  user-select: text;
  cursor: initial;
  display: flex;
  flex-direction: column;
  gap: var(--sys-size-5);
  width: 100%;
  padding: var(--sys-size-7) var(--sys-size-8);
  font-size: 12px;
  word-break: break-word;
  border-bottom: var(--sys-size-1) solid var(--sys-color-divider);

  &:not(:first-child) {
    margin-top: var(--sys-size-5);
  }

  &:last-child {
    border-bottom: 0;
  }

  .message-info {
    display: flex;
    align-items: center;
    height: var(--sys-size-11);
    gap: var(--sys-size-4);

    .message-name {
      font-weight: bold;
    }
  }

  &.query {
    img {
      border: 0;
      border-radius: var(--sys-shape-corner-full);
      display: block;
      height: var(--sys-size-9);
      width: var(--sys-size-9);
    }
  }

  & .actions {
    display: flex;
    gap: var(--sys-size-8);
    justify-content: space-between;
    align-items: flex-end;
  }

  .thought {
    summary {
      line-height: var(--sys-size-9);
    }

    devtools-icon {
      vertical-align: bottom;
      color: var(--sys-color-green-bright);
    }

    devtools-icon.loading {
      color: var(--sys-color-blue-bright);
    }
  }
}

.input-header {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
  line-height: 20px;

  & .feedback-icon {
    width: var(--sys-size-8);
    height: var(--sys-size-8);
  }

  & .header-link-container {
    display: inline-flex;
    align-items: center;
    gap: var(--sys-size-2);
  }
}

.link {
  color: var(--text-link);
  text-decoration: underline;
}

.select-an-element-text {
  margin-left: 2px;
}

.empty-state-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 16px;
  opacity: 70%;
}

.action-result {
  margin: 8px 0;
}

.js-code-output {
  margin-top: -8px;
  white-space: pre;
  max-width: 100%;
  overflow: auto;
  scrollbar-width: none;
  padding: 4px 6px;
  background-color: var(--sys-color-surface3);
  color: var(--sys-color-on-surface);
  font-size: 10px;
  font-family: var(--source-code-font-family);
}

.error-step {
  color: var(--sys-color-error);
}

.side-effect-confirmation {
  background: var(--color-background);
  padding: 24px;
  border-radius: var(--sys-size-6);
  margin-bottom: 8px;

  p {
    margin: 0;
    margin-bottom: 12px;
    padding: 0;
  }
}

.side-effect-buttons-container {
  margin-top: 8px;

  devtools-button {
    margin-top: 4px;
  }
}

.consent-view {
  padding: 24px;
  text-wrap: pretty;

  .accept-button {
    margin-top: 8px;
  }

  ul {
    padding: 0 13px;
  }

  h2 {
    font-weight: 500;
  }
}

/*# sourceURL=./components/freestylerChatUi.css */
`);

export default styles;
