
// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const sheet = new CSSStyleSheet();
sheet.replaceSync(':root {}');
const style = sheet.cssRules[0].style;

style.setProperty('--image-file-accelerometer-bottom', 'url(\"' + new URL('./accelerometer-bottom.png', import.meta.url).toString() + '\")');
style.setProperty('--image-file-accelerometer-left', 'url(\"' + new URL('./accelerometer-left.png', import.meta.url).toString() + '\")');
style.setProperty('--image-file-accelerometer-right', 'url(\"' + new URL('./accelerometer-right.png', import.meta.url).toString() + '\")');
style.setProperty('--image-file-accelerometer-top', 'url(\"' + new URL('./accelerometer-top.png', import.meta.url).toString() + '\")');
style.setProperty('--image-file-chromeLeft', 'url(\"' + new URL('./chromeLeft.avif', import.meta.url).toString() + '\")');
style.setProperty('--image-file-chromeMiddle', 'url(\"' + new URL('./chromeMiddle.avif', import.meta.url).toString() + '\")');
style.setProperty('--image-file-chromeRight', 'url(\"' + new URL('./chromeRight.avif', import.meta.url).toString() + '\")');
style.setProperty('--image-file-cssoverview_icons_2x', 'url(\"' + new URL('./cssoverview_icons_2x.avif', import.meta.url).toString() + '\")');
style.setProperty('--image-file-navigationControls_2x', 'url(\"' + new URL('./navigationControls_2x.png', import.meta.url).toString() + '\")');
style.setProperty('--image-file-navigationControls', 'url(\"' + new URL('./navigationControls.png', import.meta.url).toString() + '\")');
style.setProperty('--image-file-nodeIcon', 'url(\"' + new URL('./nodeIcon.avif', import.meta.url).toString() + '\")');
style.setProperty('--image-file-popoverArrows', 'url(\"' + new URL('./popoverArrows.png', import.meta.url).toString() + '\")');
style.setProperty('--image-file-toolbarResizerVertical', 'url(\"' + new URL('./toolbarResizerVertical.png', import.meta.url).toString() + '\")');
style.setProperty('--image-file-touchCursor_2x', 'url(\"' + new URL('./touchCursor_2x.png', import.meta.url).toString() + '\")');
style.setProperty('--image-file-touchCursor', 'url(\"' + new URL('./touchCursor.png', import.meta.url).toString() + '\")');
style.setProperty('--image-file-whatsnew', 'url(\"' + new URL('./whatsnew.avif', import.meta.url).toString() + '\")');
style.setProperty('--image-file-3d-center', 'url(\"' + new URL('./src/3d-center.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-3d-pan', 'url(\"' + new URL('./src/3d-pan.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-3d-rotate', 'url(\"' + new URL('./src/3d-rotate.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-accelerometer-back', 'url(\"' + new URL('./src/accelerometer-back.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-accelerometer-front', 'url(\"' + new URL('./src/accelerometer-front.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-content-center', 'url(\"' + new URL('./src/align-content-center.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-content-end', 'url(\"' + new URL('./src/align-content-end.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-content-space-around', 'url(\"' + new URL('./src/align-content-space-around.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-content-space-between', 'url(\"' + new URL('./src/align-content-space-between.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-content-space-evenly', 'url(\"' + new URL('./src/align-content-space-evenly.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-content-start', 'url(\"' + new URL('./src/align-content-start.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-content-stretch', 'url(\"' + new URL('./src/align-content-stretch.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-items-baseline', 'url(\"' + new URL('./src/align-items-baseline.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-items-center', 'url(\"' + new URL('./src/align-items-center.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-items-end', 'url(\"' + new URL('./src/align-items-end.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-items-start', 'url(\"' + new URL('./src/align-items-start.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-items-stretch', 'url(\"' + new URL('./src/align-items-stretch.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-self-center', 'url(\"' + new URL('./src/align-self-center.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-self-end', 'url(\"' + new URL('./src/align-self-end.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-self-start', 'url(\"' + new URL('./src/align-self-start.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-align-self-stretch', 'url(\"' + new URL('./src/align-self-stretch.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-arrow-back', 'url(\"' + new URL('./src/arrow-back.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-arrow-down', 'url(\"' + new URL('./src/arrow-down.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-arrow-drop-down-dark', 'url(\"' + new URL('./src/arrow-drop-down-dark.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-arrow-drop-down-light', 'url(\"' + new URL('./src/arrow-drop-down-light.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-arrow-forward', 'url(\"' + new URL('./src/arrow-forward.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-arrow-up-down-circle', 'url(\"' + new URL('./src/arrow-up-down-circle.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-arrow-up-down', 'url(\"' + new URL('./src/arrow-up-down.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-arrow-up', 'url(\"' + new URL('./src/arrow-up.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-bell', 'url(\"' + new URL('./src/bell.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-bezier-curve-filled', 'url(\"' + new URL('./src/bezier-curve-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-bin', 'url(\"' + new URL('./src/bin.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-bottom-panel-close', 'url(\"' + new URL('./src/bottom-panel-close.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-bottom-panel-open', 'url(\"' + new URL('./src/bottom-panel-open.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-brackets', 'url(\"' + new URL('./src/brackets.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-breakpoint-circle', 'url(\"' + new URL('./src/breakpoint-circle.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-breakpoint-crossed-filled', 'url(\"' + new URL('./src/breakpoint-crossed-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-breakpoint-crossed', 'url(\"' + new URL('./src/breakpoint-crossed.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-brush-filled', 'url(\"' + new URL('./src/brush-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-brush', 'url(\"' + new URL('./src/brush.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-bug', 'url(\"' + new URL('./src/bug.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-bundle', 'url(\"' + new URL('./src/bundle.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-calendar-today', 'url(\"' + new URL('./src/calendar-today.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-check-circle', 'url(\"' + new URL('./src/check-circle.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-check-double', 'url(\"' + new URL('./src/check-double.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-checker', 'url(\"' + new URL('./src/checker.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-checkmark', 'url(\"' + new URL('./src/checkmark.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-chevron-double-right', 'url(\"' + new URL('./src/chevron-double-right.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-chevron-down', 'url(\"' + new URL('./src/chevron-down.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-chevron-left-dot', 'url(\"' + new URL('./src/chevron-left-dot.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-chevron-left', 'url(\"' + new URL('./src/chevron-left.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-chevron-right', 'url(\"' + new URL('./src/chevron-right.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-chevron-up', 'url(\"' + new URL('./src/chevron-up.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-class', 'url(\"' + new URL('./src/class.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-clear-list', 'url(\"' + new URL('./src/clear-list.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-clear', 'url(\"' + new URL('./src/clear.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-cloud', 'url(\"' + new URL('./src/cloud.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-code-circle', 'url(\"' + new URL('./src/code-circle.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-code', 'url(\"' + new URL('./src/code.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-colon', 'url(\"' + new URL('./src/colon.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-color-picker-filled', 'url(\"' + new URL('./src/color-picker-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-color-picker', 'url(\"' + new URL('./src/color-picker.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-console-conditional-breakpoint', 'url(\"' + new URL('./src/console-conditional-breakpoint.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-console-logpoint', 'url(\"' + new URL('./src/console-logpoint.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-cookie', 'url(\"' + new URL('./src/cookie.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-copy', 'url(\"' + new URL('./src/copy.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-corporate-fare', 'url(\"' + new URL('./src/corporate-fare.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-credit-card', 'url(\"' + new URL('./src/credit-card.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-cross-circle-filled', 'url(\"' + new URL('./src/cross-circle-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-cross-circle', 'url(\"' + new URL('./src/cross-circle.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-cross', 'url(\"' + new URL('./src/cross.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-custom-typography', 'url(\"' + new URL('./src/custom-typography.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-database', 'url(\"' + new URL('./src/database.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-deployed', 'url(\"' + new URL('./src/deployed.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-device-fold', 'url(\"' + new URL('./src/device-fold.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-devices', 'url(\"' + new URL('./src/devices.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-devtools', 'url(\"' + new URL('./src/devtools.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-dock-bottom', 'url(\"' + new URL('./src/dock-bottom.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-dock-left', 'url(\"' + new URL('./src/dock-left.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-dock-right', 'url(\"' + new URL('./src/dock-right.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-dock-window', 'url(\"' + new URL('./src/dock-window.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-document', 'url(\"' + new URL('./src/document.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-dog-paw', 'url(\"' + new URL('./src/dog-paw.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-dots-horizontal', 'url(\"' + new URL('./src/dots-horizontal.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-dots-vertical', 'url(\"' + new URL('./src/dots-vertical.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-download', 'url(\"' + new URL('./src/download.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-edit', 'url(\"' + new URL('./src/edit.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-empty', 'url(\"' + new URL('./src/empty.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-errorWave', 'url(\"' + new URL('./src/errorWave.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-exclamation', 'url(\"' + new URL('./src/exclamation.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-experiment-check', 'url(\"' + new URL('./src/experiment-check.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-experiment', 'url(\"' + new URL('./src/experiment.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-extension', 'url(\"' + new URL('./src/extension.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-eye', 'url(\"' + new URL('./src/eye.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-document', 'url(\"' + new URL('./src/file-document.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-fetch-xhr', 'url(\"' + new URL('./src/file-fetch-xhr.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-font', 'url(\"' + new URL('./src/file-font.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-generic', 'url(\"' + new URL('./src/file-generic.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-image', 'url(\"' + new URL('./src/file-image.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-json', 'url(\"' + new URL('./src/file-json.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-manifest', 'url(\"' + new URL('./src/file-manifest.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-media', 'url(\"' + new URL('./src/file-media.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-script', 'url(\"' + new URL('./src/file-script.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-snippet', 'url(\"' + new URL('./src/file-snippet.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-stylesheet', 'url(\"' + new URL('./src/file-stylesheet.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-wasm', 'url(\"' + new URL('./src/file-wasm.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-file-websocket', 'url(\"' + new URL('./src/file-websocket.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-filter-clear', 'url(\"' + new URL('./src/filter-clear.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-filter-filled', 'url(\"' + new URL('./src/filter-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-filter', 'url(\"' + new URL('./src/filter.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-flex-direction', 'url(\"' + new URL('./src/flex-direction.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-flex-no-wrap', 'url(\"' + new URL('./src/flex-no-wrap.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-flex-wrap', 'url(\"' + new URL('./src/flex-wrap.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-flow', 'url(\"' + new URL('./src/flow.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-fold-more', 'url(\"' + new URL('./src/fold-more.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-folder', 'url(\"' + new URL('./src/folder.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-frame-crossed', 'url(\"' + new URL('./src/frame-crossed.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-frame-icon', 'url(\"' + new URL('./src/frame-icon.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-frame', 'url(\"' + new URL('./src/frame.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-gear-filled', 'url(\"' + new URL('./src/gear-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-gear', 'url(\"' + new URL('./src/gear.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-gears', 'url(\"' + new URL('./src/gears.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-google', 'url(\"' + new URL('./src/google.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-goto-filled', 'url(\"' + new URL('./src/goto-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-heap-snapshot', 'url(\"' + new URL('./src/heap-snapshot.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-heap-snapshots', 'url(\"' + new URL('./src/heap-snapshots.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-help', 'url(\"' + new URL('./src/help.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-hover', 'url(\"' + new URL('./src/hover.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-iframe-crossed', 'url(\"' + new URL('./src/iframe-crossed.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-iframe', 'url(\"' + new URL('./src/iframe.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-import', 'url(\"' + new URL('./src/import.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-indeterminate-question-box', 'url(\"' + new URL('./src/indeterminate-question-box.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-info-filled', 'url(\"' + new URL('./src/info-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-info', 'url(\"' + new URL('./src/info.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-issue-cross-filled', 'url(\"' + new URL('./src/issue-cross-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-issue-exclamation-filled', 'url(\"' + new URL('./src/issue-exclamation-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-issue-questionmark-filled', 'url(\"' + new URL('./src/issue-questionmark-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-issue-text-filled', 'url(\"' + new URL('./src/issue-text-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-justify-content-center', 'url(\"' + new URL('./src/justify-content-center.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-justify-content-end', 'url(\"' + new URL('./src/justify-content-end.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-justify-content-space-around', 'url(\"' + new URL('./src/justify-content-space-around.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-justify-content-space-between', 'url(\"' + new URL('./src/justify-content-space-between.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-justify-content-space-evenly', 'url(\"' + new URL('./src/justify-content-space-evenly.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-justify-content-start', 'url(\"' + new URL('./src/justify-content-start.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-justify-items-center', 'url(\"' + new URL('./src/justify-items-center.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-justify-items-end', 'url(\"' + new URL('./src/justify-items-end.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-justify-items-start', 'url(\"' + new URL('./src/justify-items-start.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-justify-items-stretch', 'url(\"' + new URL('./src/justify-items-stretch.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-keyboard-arrow-right', 'url(\"' + new URL('./src/keyboard-arrow-right.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-keyboard-pen', 'url(\"' + new URL('./src/keyboard-pen.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-keyboard', 'url(\"' + new URL('./src/keyboard.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-large-arrow-right-filled', 'url(\"' + new URL('./src/large-arrow-right-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-layers-filled', 'url(\"' + new URL('./src/layers-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-layers', 'url(\"' + new URL('./src/layers.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-left-panel-close', 'url(\"' + new URL('./src/left-panel-close.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-left-panel-open', 'url(\"' + new URL('./src/left-panel-open.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-lightbulb-spark', 'url(\"' + new URL('./src/lightbulb-spark.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-lightbulb', 'url(\"' + new URL('./src/lightbulb.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-lighthouse_logo', 'url(\"' + new URL('./src/lighthouse_logo.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-list', 'url(\"' + new URL('./src/list.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-location-on', 'url(\"' + new URL('./src/location-on.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-lock', 'url(\"' + new URL('./src/lock.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-match-case', 'url(\"' + new URL('./src/match-case.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-match-whole-word', 'url(\"' + new URL('./src/match-whole-word.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-memory', 'url(\"' + new URL('./src/memory.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-minus', 'url(\"' + new URL('./src/minus.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-mop', 'url(\"' + new URL('./src/mop.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-mouse', 'url(\"' + new URL('./src/mouse.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-network-settings', 'url(\"' + new URL('./src/network-settings.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-open-externally', 'url(\"' + new URL('./src/open-externally.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-pause', 'url(\"' + new URL('./src/pause.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-pen-spark', 'url(\"' + new URL('./src/pen-spark.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-performance', 'url(\"' + new URL('./src/performance.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-person', 'url(\"' + new URL('./src/person.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-play', 'url(\"' + new URL('./src/play.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-plus', 'url(\"' + new URL('./src/plus.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-policy', 'url(\"' + new URL('./src/policy.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-popup', 'url(\"' + new URL('./src/popup.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-preview_feature_video_thumbnail', 'url(\"' + new URL('./src/preview_feature_video_thumbnail.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-profile', 'url(\"' + new URL('./src/profile.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-psychiatry', 'url(\"' + new URL('./src/psychiatry.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-record-start', 'url(\"' + new URL('./src/record-start.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-record-stop', 'url(\"' + new URL('./src/record-stop.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-redo', 'url(\"' + new URL('./src/redo.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-refresh', 'url(\"' + new URL('./src/refresh.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-regular-expression', 'url(\"' + new URL('./src/regular-expression.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-replace', 'url(\"' + new URL('./src/replace.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-replay', 'url(\"' + new URL('./src/replay.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-report', 'url(\"' + new URL('./src/report.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-resizeDiagonal', 'url(\"' + new URL('./src/resizeDiagonal.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-resizeHorizontal', 'url(\"' + new URL('./src/resizeHorizontal.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-resizeVertical', 'url(\"' + new URL('./src/resizeVertical.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-resume', 'url(\"' + new URL('./src/resume.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-review', 'url(\"' + new URL('./src/review.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-right-panel-close', 'url(\"' + new URL('./src/right-panel-close.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-right-panel-open', 'url(\"' + new URL('./src/right-panel-open.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-scissors', 'url(\"' + new URL('./src/scissors.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-screen-rotation', 'url(\"' + new URL('./src/screen-rotation.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-search', 'url(\"' + new URL('./src/search.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-select-element', 'url(\"' + new URL('./src/select-element.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-send', 'url(\"' + new URL('./src/send.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-shadow', 'url(\"' + new URL('./src/shadow.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-small-status-dot', 'url(\"' + new URL('./src/small-status-dot.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-snippet', 'url(\"' + new URL('./src/snippet.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-spark-info', 'url(\"' + new URL('./src/spark-info.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-spark', 'url(\"' + new URL('./src/spark.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-star', 'url(\"' + new URL('./src/star.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-step-into', 'url(\"' + new URL('./src/step-into.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-step-out', 'url(\"' + new URL('./src/step-out.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-step-over', 'url(\"' + new URL('./src/step-over.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-step', 'url(\"' + new URL('./src/step.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-stop', 'url(\"' + new URL('./src/stop.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-symbol', 'url(\"' + new URL('./src/symbol.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-sync', 'url(\"' + new URL('./src/sync.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-table', 'url(\"' + new URL('./src/table.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-thumb-down', 'url(\"' + new URL('./src/thumb-down.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-thumb-up', 'url(\"' + new URL('./src/thumb-up.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-top-panel-close', 'url(\"' + new URL('./src/top-panel-close.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-top-panel-open', 'url(\"' + new URL('./src/top-panel-open.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-touch-app', 'url(\"' + new URL('./src/touch-app.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-triangle-bottom-right', 'url(\"' + new URL('./src/triangle-bottom-right.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-triangle-down', 'url(\"' + new URL('./src/triangle-down.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-triangle-left', 'url(\"' + new URL('./src/triangle-left.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-triangle-right', 'url(\"' + new URL('./src/triangle-right.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-triangle-up', 'url(\"' + new URL('./src/triangle-up.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-tune', 'url(\"' + new URL('./src/tune.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-undo', 'url(\"' + new URL('./src/undo.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-warning-filled', 'url(\"' + new URL('./src/warning-filled.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-warning', 'url(\"' + new URL('./src/warning.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-watch', 'url(\"' + new URL('./src/watch.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-width', 'url(\"' + new URL('./src/width.svg', import.meta.url).toString() + '\")');
style.setProperty('--image-file-zoom-in', 'url(\"' + new URL('./src/zoom-in.svg', import.meta.url).toString() + '\")');

document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
