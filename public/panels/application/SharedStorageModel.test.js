// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assertNotNullOrUndefined } from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as Resources from './application.js';
class SharedStorageListener {
    #model;
    #storagesWatched;
    #accessEvents;
    #changeEvents;
    constructor(model) {
        this.#model = model;
        this.#storagesWatched = new Array();
        this.#accessEvents = new Array();
        this.#changeEvents = new Map();
        this.#model.addEventListener("SharedStorageAdded" /* Resources.SharedStorageModel.Events.SharedStorageAdded */, this.#sharedStorageAdded, this);
        this.#model.addEventListener("SharedStorageRemoved" /* Resources.SharedStorageModel.Events.SharedStorageRemoved */, this.#sharedStorageRemoved, this);
        this.#model.addEventListener("SharedStorageAccess" /* Resources.SharedStorageModel.Events.SharedStorageAccess */, this.#sharedStorageAccess, this);
    }
    dispose() {
        this.#model.removeEventListener("SharedStorageAdded" /* Resources.SharedStorageModel.Events.SharedStorageAdded */, this.#sharedStorageAdded, this);
        this.#model.removeEventListener("SharedStorageRemoved" /* Resources.SharedStorageModel.Events.SharedStorageRemoved */, this.#sharedStorageRemoved, this);
        this.#model.removeEventListener("SharedStorageAccess" /* Resources.SharedStorageModel.Events.SharedStorageAccess */, this.#sharedStorageAccess, this);
        for (const storage of this.#storagesWatched) {
            storage.removeEventListener("SharedStorageChanged" /* Resources.SharedStorageModel.SharedStorageForOrigin.Events.SharedStorageChanged */, this.#sharedStorageChanged.bind(this, storage), this);
        }
    }
    get accessEvents() {
        return this.#accessEvents;
    }
    changeEventsForStorage(storage) {
        return this.#changeEvents.get(storage) || null;
    }
    changeEventsEmpty() {
        return this.#changeEvents.size === 0;
    }
    #sharedStorageAdded(event) {
        const storage = event.data;
        this.#storagesWatched.push(storage);
        storage.addEventListener("SharedStorageChanged" /* Resources.SharedStorageModel.SharedStorageForOrigin.Events.SharedStorageChanged */, this.#sharedStorageChanged.bind(this, storage), this);
    }
    #sharedStorageRemoved(event) {
        const storage = event.data;
        storage.removeEventListener("SharedStorageChanged" /* Resources.SharedStorageModel.SharedStorageForOrigin.Events.SharedStorageChanged */, this.#sharedStorageChanged.bind(this, storage), this);
        const index = this.#storagesWatched.indexOf(storage);
        if (index === -1) {
            return;
        }
        this.#storagesWatched = this.#storagesWatched.splice(index, 1);
    }
    #sharedStorageAccess(event) {
        this.#accessEvents.push(event.data);
    }
    #sharedStorageChanged(storage, event) {
        if (!this.#changeEvents.has(storage)) {
            this.#changeEvents.set(storage, new Array());
        }
        this.#changeEvents.get(storage)?.push(event.data);
    }
    async waitForStoragesAdded(expectedCount) {
        while (this.#storagesWatched.length < expectedCount) {
            await this.#model.once("SharedStorageAdded" /* Resources.SharedStorageModel.Events.SharedStorageAdded */);
        }
    }
}
describeWithMockConnection('SharedStorageModel', () => {
    let sharedStorageModel;
    let target;
    let listener;
    const TEST_ORIGIN_A = 'http://a.test';
    const TEST_ORIGIN_B = 'http://b.test';
    const TEST_ORIGIN_C = 'http://c.test';
    const ID = 'AA';
    const METADATA = {
        creationTime: 100,
        length: 3,
        remainingBudget: 2.5,
        bytesUsed: 30,
    };
    const ENTRIES = [
        {
            key: 'key1',
            value: 'a',
        },
        {
            key: 'key2',
            value: 'b',
        },
        {
            key: 'key3',
            value: 'c',
        },
    ];
    const EVENTS = [
        {
            accessTime: 0,
            type: "documentAppend" /* Protocol.Storage.SharedStorageAccessType.DocumentAppend */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_A,
            params: { key: 'key0', value: 'value0' },
        },
        {
            accessTime: 10,
            type: "workletGet" /* Protocol.Storage.SharedStorageAccessType.WorkletGet */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_A,
            params: { key: 'key0' },
        },
        {
            accessTime: 15,
            type: "workletLength" /* Protocol.Storage.SharedStorageAccessType.WorkletLength */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_B,
            params: {},
        },
        {
            accessTime: 20,
            type: "documentClear" /* Protocol.Storage.SharedStorageAccessType.DocumentClear */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_B,
            params: {},
        },
        {
            accessTime: 100,
            type: "workletSet" /* Protocol.Storage.SharedStorageAccessType.WorkletSet */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_C,
            params: { key: 'key0', value: 'value1', ignoreIfPresent: true },
        },
        {
            accessTime: 150,
            type: "workletRemainingBudget" /* Protocol.Storage.SharedStorageAccessType.WorkletRemainingBudget */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_C,
            params: {},
        },
    ];
    beforeEach(() => {
        target = createTarget();
        sharedStorageModel = target.model(Resources.SharedStorageModel.SharedStorageModel);
        listener = new SharedStorageListener(sharedStorageModel);
    });
    it('invokes storageAgent via SharedStorageForOrigin', async () => {
        const getMetadataSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata').resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        const getEntriesSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries').resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        const setEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        const deleteEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_deleteSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        const clearSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_clearSharedStorageEntries').resolves({
            getError: () => undefined,
        });
        const sharedStorage = new Resources.SharedStorageModel.SharedStorageForOrigin(sharedStorageModel, TEST_ORIGIN_A);
        assert.strictEqual(sharedStorage.securityOrigin, TEST_ORIGIN_A);
        const metadata = await sharedStorage.getMetadata();
        assert.isTrue(getMetadataSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN_A }));
        assert.deepEqual(METADATA, metadata);
        const entries = await sharedStorage.getEntries();
        assert.isTrue(getEntriesSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN_A }));
        assert.deepEqual(ENTRIES, entries);
        await sharedStorage.setEntry('new-key1', 'new-value1', true);
        assert.isTrue(setEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN_A, key: 'new-key1', value: 'new-value1', ignoreIfPresent: true }));
        await sharedStorage.deleteEntry('new-key1');
        assert.isTrue(deleteEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN_A, key: 'new-key1' }));
        await sharedStorage.clear();
        assert.isTrue(clearSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN_A }));
    });
    it('adds/removes SharedStorageForOrigin on SecurityOrigin events', async () => {
        const setTrackingSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageTracking').resolves({
            getError: () => undefined,
        });
        await sharedStorageModel.enable();
        assert.isTrue(setTrackingSpy.calledOnceWithExactly({ enable: true }));
        assert.isEmpty(sharedStorageModel.storages());
        const manager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
        assertNotNullOrUndefined(manager);
        const addedPromise = listener.waitForStoragesAdded(1);
        manager.dispatchEventToListeners(SDK.SecurityOriginManager.Events.SecurityOriginAdded, TEST_ORIGIN_A);
        await addedPromise;
        assertNotNullOrUndefined(sharedStorageModel.storageForOrigin(TEST_ORIGIN_A));
        manager.dispatchEventToListeners(SDK.SecurityOriginManager.Events.SecurityOriginRemoved, TEST_ORIGIN_A);
        assert.isEmpty(sharedStorageModel.storages());
    });
    it('does not add SharedStorageForOrigin if origin invalid', async () => {
        const setTrackingSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageTracking').resolves({
            getError: () => undefined,
        });
        await sharedStorageModel.enable();
        assert.isTrue(setTrackingSpy.calledOnceWithExactly({ enable: true }));
        assert.isEmpty(sharedStorageModel.storages());
        const manager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
        assertNotNullOrUndefined(manager);
        manager.dispatchEventToListeners(SDK.SecurityOriginManager.Events.SecurityOriginAdded, 'invalid');
        assert.isEmpty(sharedStorageModel.storages());
    });
    it('does not add SharedStorageForOrigin if origin already added', async () => {
        const setTrackingSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageTracking').resolves({
            getError: () => undefined,
        });
        await sharedStorageModel.enable();
        assert.isTrue(setTrackingSpy.calledOnceWithExactly({ enable: true }));
        assert.isEmpty(sharedStorageModel.storages());
        const addedPromise = listener.waitForStoragesAdded(1);
        const manager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
        assertNotNullOrUndefined(manager);
        manager.dispatchEventToListeners(SDK.SecurityOriginManager.Events.SecurityOriginAdded, TEST_ORIGIN_A);
        await addedPromise;
        assertNotNullOrUndefined(sharedStorageModel.storageForOrigin(TEST_ORIGIN_A));
        assert.strictEqual(1, sharedStorageModel.numStoragesForTesting());
        manager.dispatchEventToListeners(SDK.SecurityOriginManager.Events.SecurityOriginAdded, TEST_ORIGIN_A);
        assert.strictEqual(1, sharedStorageModel.numStoragesForTesting());
    });
    it('adds/removes SecurityOrigins when model is enabled/disabled', async () => {
        const setTrackingSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageTracking').resolves({
            getError: () => undefined,
        });
        const manager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
        assertNotNullOrUndefined(manager);
        const originSet = new Set([TEST_ORIGIN_A, TEST_ORIGIN_B, TEST_ORIGIN_C]);
        manager.updateSecurityOrigins(originSet);
        assert.strictEqual(3, manager.securityOrigins().length);
        const addedPromise = listener.waitForStoragesAdded(3);
        await sharedStorageModel.enable();
        assert.isTrue(setTrackingSpy.calledOnceWithExactly({ enable: true }));
        await addedPromise;
        assert.strictEqual(3, sharedStorageModel.numStoragesForTesting());
        assertNotNullOrUndefined(sharedStorageModel.storageForOrigin(TEST_ORIGIN_A));
        assertNotNullOrUndefined(sharedStorageModel.storageForOrigin(TEST_ORIGIN_B));
        assertNotNullOrUndefined(sharedStorageModel.storageForOrigin(TEST_ORIGIN_C));
        sharedStorageModel.disable();
        assert.isEmpty(sharedStorageModel.storages());
    });
    it('dispatches SharedStorageAccess events to listeners', async () => {
        const setTrackingSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageTracking').resolves({
            getError: () => undefined,
        });
        const manager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
        assertNotNullOrUndefined(manager);
        await sharedStorageModel.enable();
        assert.isTrue(setTrackingSpy.calledOnceWithExactly({ enable: true }));
        for (const event of EVENTS) {
            sharedStorageModel.sharedStorageAccessed(event);
        }
        assert.deepEqual(EVENTS, listener.accessEvents);
    });
    it('dispatches SharedStorageChanged events to listeners', async () => {
        const setTrackingSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageTracking').resolves({
            getError: () => undefined,
        });
        const manager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
        assertNotNullOrUndefined(manager);
        await sharedStorageModel.enable();
        assert.isTrue(setTrackingSpy.calledOnceWithExactly({ enable: true }));
        // For change events whose origins aren't yet in the model, the origin is added
        // to the model, with the `SharedStorageAdded` event being subsequently dispatched
        // instead of the `SharedStorageChanged` event.
        const addedPromise = listener.waitForStoragesAdded(3);
        for (const event of EVENTS) {
            sharedStorageModel.sharedStorageAccessed(event);
        }
        await addedPromise;
        assert.strictEqual(3, sharedStorageModel.numStoragesForTesting());
        assert.deepEqual(EVENTS, listener.accessEvents);
        assert.isTrue(listener.changeEventsEmpty());
        // All events will be dispatched as `SharedStorageAccess` events, but only change
        // events for existing origins will be forwarded as `SharedStorageChanged` events.
        for (const event of EVENTS) {
            sharedStorageModel.sharedStorageAccessed(event);
        }
        assert.deepEqual(EVENTS.concat(EVENTS), listener.accessEvents);
        const storageA = sharedStorageModel.storageForOrigin(TEST_ORIGIN_A);
        assertNotNullOrUndefined(storageA);
        assert.deepEqual(listener.changeEventsForStorage(storageA), [
            {
                accessTime: 0,
                type: "documentAppend" /* Protocol.Storage.SharedStorageAccessType.DocumentAppend */,
                mainFrameId: ID,
                params: { key: 'key0', value: 'value0' },
            },
        ]);
        const storageB = sharedStorageModel.storageForOrigin(TEST_ORIGIN_B);
        assertNotNullOrUndefined(storageB);
        assert.deepEqual(listener.changeEventsForStorage(storageB), [
            {
                accessTime: 20,
                type: "documentClear" /* Protocol.Storage.SharedStorageAccessType.DocumentClear */,
                mainFrameId: ID,
                params: {},
            },
        ]);
        const storageC = sharedStorageModel.storageForOrigin(TEST_ORIGIN_C);
        assertNotNullOrUndefined(storageC);
        assert.deepEqual(listener.changeEventsForStorage(storageC), [
            {
                accessTime: 100,
                type: "workletSet" /* Protocol.Storage.SharedStorageAccessType.WorkletSet */,
                mainFrameId: ID,
                params: { key: 'key0', value: 'value1', ignoreIfPresent: true },
            },
        ]);
    });
});
//# sourceMappingURL=SharedStorageModel.test.js.map