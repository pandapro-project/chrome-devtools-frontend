// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../models/trace/trace.js';
import * as Timeline from '../panels/timeline/timeline.js';
import * as ThemeSupport from '../ui/legacy/theme_support/theme_support.js';
import { resetTestDOM } from './DOMHelpers.js';
import { checkForPendingActivity, startTrackingAsyncActivity, stopTrackingAsyncActivity, } from './TrackAsyncOperations.js';
beforeEach(() => {
    resetTestDOM();
    // Ensure that no trace data leaks between tests when testing the trace engine.
    for (const handler of Object.values(TraceEngine.Handlers.ModelHandlers)) {
        handler.reset();
    }
    Timeline.SourceMapsResolver.SourceMapsResolver.clearResolvedNodeNames();
    // Some unit tests exercise code that assumes a ThemeSupport instance is available.
    // Run this in a beforeEach in case an individual test overrides it.
    const setting = {
        get() {
            return 'default';
        },
    };
    ThemeSupport.ThemeSupport.instance({ forceNew: true, setting });
    startTrackingAsyncActivity();
});
afterEach(async () => {
    await checkForPendingActivity();
    sinon.restore();
    stopTrackingAsyncActivity();
    // Clear out any Sinon stubs or spies between individual tests.
});
//# sourceMappingURL=test_setup.js.map