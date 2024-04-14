// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget, stubNoopSettings } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as TreeOutline from '../../ui/components/tree_outline/tree_outline.js';
import * as Elements from './elements.js';
const MAIN_FRAME_ID = 'MAIN_FRAME_ID';
describeWithMockConnection('AccessibilityTreeView', () => {
    let target;
    let toggleButoon;
    let treeComponent;
    beforeEach(() => {
        stubNoopSettings();
        target = createTarget();
        toggleButoon = document.createElement('div');
        treeComponent = new TreeOutline.TreeOutline.TreeOutline();
    });
    const updatesUiOnEvent = (inScope) => async () => {
        SDK.TargetManager.TargetManager.instance().setScopeTarget(inScope ? target : null);
        new Elements.AccessibilityTreeView.AccessibilityTreeView(toggleButoon, treeComponent);
        const model = target.model(SDK.AccessibilityModel.AccessibilityModel);
        const treeComponentDataSet = sinon.spy(treeComponent, 'data', ['set']);
        sinon.stub(SDK.FrameManager.FrameManager.instance(), 'getOutermostFrame').returns({
            id: MAIN_FRAME_ID,
        });
        model.dispatchEventToListeners("TreeUpdated" /* SDK.AccessibilityModel.Events.TreeUpdated */, {
            root: { numChildren: () => 0, role: () => null, getFrameId: () => MAIN_FRAME_ID, id: () => 'id' },
        });
        await new Promise(resolve => queueMicrotask(resolve));
        assert.strictEqual(treeComponentDataSet.set.called, inScope);
    };
    it('updates UI on in scope update event', updatesUiOnEvent(true));
    it('does not update UI on out of scope update event', updatesUiOnEvent(false));
});
//# sourceMappingURL=AccessibilityTreeView.test.js.map