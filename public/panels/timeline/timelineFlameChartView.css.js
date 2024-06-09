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

.timeline-overlays-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Ensure it appears on top of everything */
  z-index: 200;
  pointer-events: none;
}

.overlay-item {
  position: absolute;
  /* The FlameChartView will move these as the FlameChart is drawn */
  top: 0;
  left: 0;
}

.overlay-type-ENTRY_SELECTED {
  pointer-events: none;
  border: 2px solid var(--sys-color-primary);
  background-color: var(--sys-color-state-ripple-primary);

  &.cut-off-top {
    border-top: none;
  }

  &.cut-off-bottom {
    border-bottom: none;
  }
}

/*# sourceURL=timelineFlameChartView.css */
`);

export default styles;
