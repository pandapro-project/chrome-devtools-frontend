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

/* stylelint-disable no-descending-specificity */
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

.select-element {
  display: flex;
  gap: var(--sys-size-3);
  align-items: center;

  .resource-link {
    padding: var(--sys-size-2) var(--sys-size-4);
    font: var(--sys-typescale-body4-size);
    border: var(--sys-size-1) solid var(--sys-color-divider);
    border-radius: var(--sys-shape-corner-extra-small);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: var(--sys-size-32);

    devtools-icon[name="file-script"] {
      color: var(--icon-file-script);
      vertical-align: top;
      margin-right: var(--sys-size-1);
    }
  }

  .resource-link.not-selected {
    color: var(--sys-color-state-disabled);
    border-color: var(--sys-color-neutral-outline);
  }
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
  margin: var(--sys-size-4) 0;
  width: 100%;
  display: flex;
  position: relative;
}

.chat-input {
  --right-padding: calc(var(--sys-size-4) + 26px); /* Gap between the button and the edge + icon's width */

  field-sizing: content; /* stylelint-disable-line property-no-unknown */
  resize: none;
  width: 100%;
  max-height: 84px; /* 4 rows */
  border: 1px solid var(--sys-color-neutral-outline);
  border-radius: var(--sys-shape-corner-small);
  font: var(--sys-typescale-body4-regular);
  line-height: 18px;
  min-height: var(--sys-size-11);
  padding:
    var(--sys-size-4)
    var(--right-padding)
    var(--sys-size-4)
    var(--sys-size-4);
  color: var(--sys-color-on-surface);
  background-color: var(--sys-color-cdt-base-container);

  &::placeholder {
    opacity: 60%;
  }

  &:focus-visible {
    outline: 1px solid var(--sys-color-primary);
    border-color: var(--sys-color-primary);
  }

  &:disabled {
    color: var(--sys-color-state-disabled);
    background-color: var(--sys-color-state-disabled-container);
  }
}

.chat-input-button {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: var(--sys-size-4) var(--sys-size-4);
}

.disclaimer {
  display: flex;
  justify-content: center;
  border-top: var(--sys-size-1) solid var(--sys-color-divider);

  .disclaimer-text {
    max-width: var(--sys-size-36);
    color: var(--sys-color-on-surface-subtle);
    font: var(--sys-typescale-body5-regular);
    text-wrap: pretty;
    padding: var(--sys-size-2) var(--sys-size-5);
  }
}

.messages-scroll-container {
  overflow: auto;
  flex-grow: 1;
  scrollbar-gutter: stable;
}

.messages-container {
  margin: 0 auto;
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
  padding: var(--sys-size-7) var(--sys-size-5);
  font-size: 12px;
  word-break: break-word;
  border-bottom: var(--sys-size-1) solid var(--sys-color-divider);

  &:last-child {
    border-bottom: 0;
  }

  &.query {
    .message-content {
      /* devtools-markdown-view's paragraphs add 10px bottom margin. This negative margin is here to offset that. */
      margin-bottom: -10px;
    }
  }

  .message-info {
    display: flex;
    align-items: center;
    height: var(--sys-size-11);
    gap: var(--sys-size-4);
    font: var(--sys-typescale-body4-bold);

    img {
      border: 0;
      border-radius: var(--sys-shape-corner-full);
      display: block;
      height: var(--sys-size-9);
      width: var(--sys-size-9);
    }
  }

  .actions {
    display: flex;
    gap: var(--sys-size-8);
    justify-content: space-between;
    align-items: flex-end;
  }

  .aborted {
    color: var(--sys-color-state-disabled);
  }
}

.step {
  width: fit-content;
  background-color: var(--sys-color-surface3);
  border-radius: var(--sys-size-6);
  position: relative;

  &.empty {
    pointer-events: none;

    .arrow {
      display: none;
    }
  }

  &:not(&[open]):hover::after {
    content: "";
    height: 100%;
    width: 100%;
    border-radius: inherit;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    background-color: var(--sys-color-state-hover-on-subtle);
  }

  &.paused {
    .indicator {
      color: var(--sys-color-on-surface-subtle);
    }
  }

  &.canceled {
    .summary {
      color: var(--sys-color-state-disabled);
      text-decoration: line-through;
    }

    .indicator {
      color: var(--sys-color-state-disabled);
    }
  }

  devtools-markdown-view {
    --code-background-color: var(--sys-color-surface1);
  }

  devtools-icon {
    vertical-align: bottom;
  }

  .indicator {
    color: var(--sys-color-green-bright);
  }

  devtools-spinner {
    width: var(--sys-size-9);
    height: var(--sys-size-9);
    padding: var(--sys-size-2);
  }

  .summary {
    display: grid;
    grid-template-columns: auto 1fr auto;
    padding: var(--sys-size-3);
    line-height: var(--sys-size-9);
    cursor: default;
    gap: var(--sys-size-3);
    justify-content: center;
    align-items: center;

    .title {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      font: var(--sys-typescale-body4-regular);

      .paused {
        font: var(--sys-typescale-body4-bold);
      }
    }
  }

  &[open] {
    width: auto;

    .summary .title {
      white-space: normal;
      overflow: unset;
    }

    .summary .arrow {
      transform: rotate(180deg);
    }
  }

  summary::marker {
    content: "";
  }

  .step-details {
    padding: 0 var(--sys-size-10) var(--sys-size-3);
  }
}

.input-header {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
  line-height: 20px;
  gap: var(--sys-size-8);

  & .feedback-icon {
    width: var(--sys-size-8);
    height: var(--sys-size-8);
  }

  & .header-link-container:first-of-type {
    flex-shrink: 1;
    flex-basis: 100%;
    min-width: 0;
  }

  & .header-link-container {
    display: inline-flex;
    align-items: center;
    gap: var(--sys-size-2);
    flex-shrink: 0;
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
  display: grid;
  align-items: center;
  justify-content: center;
  font: var(--sys-typescale-headline4);
  gap: var(--sys-size-11);
  height: 100%;
  padding: var(--sys-size-3);

  .header {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    justify-content: center;
    align-self: end;
    gap: var(--sys-size-5);

    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      height: var(--sys-size-14);
      width: var(--sys-size-14);
      border-radius: var(--sys-shape-corner-small);
      background:
        linear-gradient(
          135deg,
          var(--sys-color-gradient-primary),
          var(--sys-color-gradient-tertiary)
        );
    }
  }

  .suggestions {
    display: flex;
    flex-direction: column;
    gap: var(--sys-size-5);
    align-items: center;
    justify-content: center;
    align-self: start;
  }
}

.action-result {
  /* devtools-code-block adds \\'margin-top: 8px\\' however we want the margin between \\'.action-result\\' and \\'.js-code-output\\' to be 2px
  that's why we use -6px here. */
  margin-bottom: -6px;
}

.js-code-output {
  devtools-code-block {
    --max-code-height: 50px;
  }
}

.context-details {
  devtools-code-block {
    --max-code-height: 80px;
  }
}

.error-step {
  color: var(--sys-color-error);
}

.side-effect-confirmation {
  p {
    margin: 0;
    margin-bottom: 12px;
    padding: 0;
  }
}

.side-effect-buttons-container {
  display: flex;
  gap: var(--sys-size-4);
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

/* stylelint-enable no-descending-specificity */

/*# sourceURL=./components/freestylerChatUi.css */
`);

export default styles;
