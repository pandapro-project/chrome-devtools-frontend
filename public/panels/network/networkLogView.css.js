// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

.network-log-grid.data-grid {
  border: none !important; /* stylelint-disable-line declaration-no-important */
  flex: auto;
}

.network-log-grid.data-grid.no-selection:focus-visible {
  border: none !important; /* stylelint-disable-line declaration-no-important */
}

#network-container {
  overflow: hidden;
}

#network-container.grid-focused.no-node-selected:focus-within {
  border: 1px solid var(--sys-color-state-focus-ring);
}

.network-summary-bar {
  flex: 0 0 27px;
  line-height: 27px;
  padding-left: 5px;
  background-color: var(--sys-color-cdt-base-container);
  border-top: 1px solid var(--sys-color-divider);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: text;
}

.panel.network .toolbar.network-summary-bar {
  border-bottom: 0;
}

.network-summary-bar span[is="dt-icon-label"] {
  margin-right: 6px;
}

.network-summary-bar > * {
  flex: none;
}

.network-log-grid.data-grid tbody {
  background: transparent;
}

.network-log-grid.data-grid td {
  height: 41px;
  border-left: 1px solid var(--sys-color-divider);
  vertical-align: middle;
}

.network-log-grid.data-grid .corner {
  display: none;
}

.network-log-grid.data-grid.small td {
  height: 21px;
}

.network-log-grid.data-grid th {
  border-bottom: none;
}

.network-waterfall-header,
.network-log-grid.data-grid thead th {
  border-bottom: 1px solid var(--sys-color-divider);
  border-left: 1px solid var(--sys-color-divider);
}

.network-waterfall-header,
.network-log-grid.data-grid thead {
  height: 31px;
  background-color: var(--sys-color-surface1);
}

.network-waterfall-header.small,
.network-log-grid.data-grid.small thead {
  height: 27px;
}

.network-log-grid.data-grid select {
  appearance: none;
  border: none;
  width: 100%;
  color: inherit;
}

.network-log-grid.data-grid .waterfall-column {
  padding: 1px 0;
}

.network-log-grid.data-grid .waterfall-column .sort-order-icon-container {
  right: 15px;
  pointer-events: none;
}

.network-log-grid.data-grid th.sortable:active {
  background-image: none !important; /* stylelint-disable-line declaration-no-important */
}

.network-cell-subtitle {
  font-weight: normal;
  color: var(--sys-color-token-subtle);
}

.network-badge {
  margin-right: 4px;
}

.status-column .devtools-link {
  color: inherit;
}

.initiator-column .text-button.devtools-link,
.initiator-column .text-button.devtools-link:focus-visible {
  color: inherit;
  background-color: transparent;
  outline-offset: 0;
  height: 16px;
}

.network-error-row,
.network-error-row .network-cell-subtitle {
  /* stylelint-disable-next-line declaration-no-important */
  color: var(--sys-color-error) !important;
}

.network-log-grid.data-grid tr.selected.network-error-row,
.network-log-grid.data-grid tr.selected.network-error-row .network-cell-subtitle,
.network-log-grid.data-grid tr.selected.network-error-row .network-dim-cell,
.network-log-grid.data-grid:focus-within tr.selected.network-error-row .devtools-link,
.network-log-grid.data-grid:focus-within tr.selected.network-error-row,
.network-log-grid.data-grid:focus-within tr.selected.network-error-row .network-cell-subtitle,
.network-log-grid.data-grid:focus-within tr.selected.network-error-row .network-dim-cell {
  color: var(--sys-color-error);
}

/* We are using a multitude of different selector specificity rules here, which
   is incompatible with what stylelint requires as ordering of the rules. */
/* stylelint-disable no-descending-specificity */

.network-log-grid.data-grid tr.selected,
.network-log-grid.data-grid tr.selected .network-cell-subtitle,
.network-log-grid.data-grid tr.selected .network-dim-cell {
  color: inherit;
}

.network-log-grid.data-grid:focus tr.selected,
.network-log-grid.data-grid:focus tr.selected .network-cell-subtitle,
.network-log-grid.data-grid:focus tr.selected .network-dim-cell {
  color: var(--sys-color-on-tonal-container);
}

.network-header-subtitle {
  color: var(--sys-color-token-subtle);
}

.network-log-grid.data-grid.small .network-cell-subtitle,
.network-log-grid.data-grid.small .network-header-subtitle {
  display: none;
}

.network-log-grid.data-grid.small .network-cell-subtitle.always-visible {
  display: inline;
  margin-left: 4px;
}

.network-log-grid tr.highlighted-row {
  animation: network-row-highlight-fadeout 2s 0s;
}
/* See comment above why the rules were disabled */
/* stylelint-enable no-descending-specificity */

@keyframes network-row-highlight-fadeout {
  from {
    background-color: var(--sys-color-yellow-container);
  }

  to {
    background-color: transparent;
  }
}

/* Resource preview icons */
/* These rules are grouped by type and therefore do not adhere to the ordering of stylelint */
/* stylelint-disable no-descending-specificity, no-duplicate-selectors */

.network-log-grid.data-grid .icon.image {
  position: relative;
}

.network-log-grid.data-grid .icon {
  float: left;
  width: 32px;
  height: 32px;
  margin-top: 1px;
  margin-right: 3px;
}

.network-log-grid.data-grid:focus-within .network-error-row.selected div.icon:not(.image) {
  filter: none;
}

.network-log-grid.data-grid .network-error-row.data-grid-data-grid-node img.icon,
.network-log-grid.data-grid .network-error-row.data-grid-data-grid-node.selected img.icon {
  /* This is generated with https://codepen.io/sosuke/pen/Pjoqqp to target var(--color-red) */
  filter: brightness(0) saturate(100%) invert(35%) sepia(76%) saturate(1413%) hue-rotate(338deg) brightness(92%) contrast(103%);
}

.data-grid-data-grid-node devtools-icon[name="arrow-up-down-circle"],
.network-log-grid.data-grid.small .icon {
  width: 16px;
  height: 16px;
  vertical-align: sub;
}

.image-network-icon-preview {
  bottom: 0;
  left: 0;
  margin: auto;
  overflow: hidden;
  right: 0;
  top: 0;
}

.network-log-grid.data-grid .image-network-icon-preview {
  position: absolute;
  max-width: 18px;
  max-height: 21px;
  min-width: 1px;
  min-height: 1px;
}

.network-log-grid.data-grid.small .image-network-icon-preview {
  left: 2px;
  right: 2px;
  max-width: 10px;
  max-height: 12px;
}

.network-log-grid.data-grid .trailing-link-icon {
  padding-left: 0.5ex;
}
/* stylelint-enable no-descending-specificity, no-duplicate-selectors */
/* This is part of the large color block declared above, but should not be
   extracted out. */
/* stylelint-disable-next-line no-descending-specificity */
.network-dim-cell {
  color: var(--sys-color-token-subtle);
}

.network-frame-divider {
  width: 2px;
  background-color: var(--network-frame-divider-color); /* stylelint-disable-line plugin/use_theme_colors */
  z-index: 10;
  visibility: hidden;
}

#network-container.grid-mode .data-container {
  overflow: hidden;
}

.network-log-grid.data-grid .resources-dividers {
  z-index: 0;
}

.network-log-grid.data-grid .resources-dividers-label-bar {
  background-color: transparent;
  border: none;
  height: 30px;
  pointer-events: none;
}

.network-log-grid.data-grid span.separator-in-cell {
  user-select: none;
  min-width: 1ex;
  display: inline-block;
}

.network-status-pane {
  color: var(--sys-color-token-subtle);
  background-color: var(--sys-color-cdt-base-container);
  z-index: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
  overflow: auto;
}

.network-status-pane > .recording-hint {
  font-size: 14px;
  text-align: center;
  line-height: 28px;
}

.network-waterfall-header {
  position: absolute;
  border-left: 0;
  width: 100%;
  display: table;
  z-index: 200;

  & > div.hover-layer {
    display: none;
    background-color: var(--sys-color-state-hover-on-subtle);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &:hover > div.hover-layer {
    display: block;
  }
}

.network-waterfall-header div {
  display: table-cell;
  line-height: 14px;
  margin: auto 0;
  vertical-align: middle;
  text-align: left;
  font-weight: normal;
  padding: 0 4px;
}
/* All network-waterfall-header rules are defined here instead of above */
/* stylelint-disable-next-line no-descending-specificity */
.network-waterfall-header .sort-order-icon-container {
  position: absolute;
  top: 1px;
  right: 0;
  bottom: 1px;
  display: flex;
  align-items: center;
}

.network-waterfall-header .sort-order-icon {
  align-items: center;
  margin-right: 4px;
  margin-bottom: -2px;
}

.network-frame-group-icon {
  display: inline-block;
  margin: -7px 1px;
  vertical-align: baseline;
}

.network-frame-group-badge {
  margin-right: 4px;
}

.network-override-marker {
  position: relative;
  float: left;
}

.network-override-marker::before {
  background-color: var(--sys-color-purple-bright);
  content: var(--image-file-empty);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  outline: 1px solid var(--icon-gap-toolbar);
  left: 8px;
  position: absolute;
  top: 10px;
  z-index: 1;
}

@media (forced-colors: active) {
  .network-status-pane > .recording-hint {
    color: canvastext;
  }

  .initiator-column .devtools-link {
    color: linktext;
  }

  /* This is part of the large color block declared above, but should not be
   extracted out. */
  /* stylelint-disable no-descending-specificity */
  .network-log-grid.data-grid tbody tr.revealed.selected,
  .network-log-grid.data-grid:focus-within tbody tr.revealed.selected,
  .network-log-grid.data-grid:focus-within tr.selected .network-dim-cell,
  .network-log-grid.data-grid tr.selected .network-dim-cell,
  .network-log-grid.data-grid:focus-within tr.selected .initiator-column .devtools-link,
  .network-log-grid.data-grid tr.selected .initiator-column .devtools-link,
  .network-waterfall-header:hover * {
    color: HighlightText;
  }
  /* stylelint-enable no-descending-specificity */

  .network-log-grid {
    --color-grid-default: canvas;
    --color-grid-stripe: canvas;
    --color-grid-hovered: Highlight;
    --color-grid-selected: ButtonText;
    --color-grid-focus-selected: Highlight;
  }

  #network-container.no-node-selected:focus-within,
  .network-status-pane {
    forced-color-adjust: none;
    border-color: Highlight;
    background-color: canvas !important; /* stylelint-disable-line declaration-no-important */
  }

  .network-waterfall-header:hover {
    forced-color-adjust: none;
    background-color: Highlight !important; /* stylelint-disable-line declaration-no-important */

    & > div.hover-layer {
      display: none;
    }
  }

  .network-waterfall-header.small,
  .network-log-grid.data-grid.small thead .network-waterfall-header,
  .network-log-grid.data-grid thead {
    background-color: canvas;
  }

  .network-waterfall-header .sort-order-icon-container devtools-icon {
    background-color: inherit;
  }

  .network-waterfall-header:hover .sort-order-icon-container devtools-icon {
    color: HighlightText;
  }
}

/*# sourceURL=networkLogView.css */
`);

export default styles;
