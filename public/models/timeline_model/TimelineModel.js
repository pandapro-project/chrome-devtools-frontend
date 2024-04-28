/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as TraceEngine from '../trace/trace.js';
export class TimelineModelImpl {
    inspectedTargetEventsInternal;
    sessionId;
    mainFrameNodeId;
    pageFrames;
    workerIdByThread;
    requestsFromBrowser;
    mainFrame;
    minimumRecordTimeInternal;
    lastScheduleStyleRecalculation;
    paintImageEventByPixelRefId;
    lastPaintForLayer;
    currentScriptEvent;
    eventStack;
    browserFrameTracking;
    persistentIds;
    legacyCurrentPage;
    currentTaskLayoutAndRecalcEvents;
    tracingModelInternal;
    lastRecalculateStylesEvent;
    constructor() {
        this.minimumRecordTimeInternal = 0;
        this.reset();
        this.resetProcessingState();
        this.currentTaskLayoutAndRecalcEvents = [];
        this.tracingModelInternal = null;
        this.lastRecalculateStylesEvent = null;
    }
    /**
     * Iterates events in a tree hierarchically, from top to bottom,
     * calling back on every event's start and end in the order
     * dictated by the corresponding timestamp.
     *
     * Events are assumed to be in ascendent order by timestamp.
     *
     * For example, given this tree, the following callbacks
     * are expected to be made in the following order
     * |---------------A---------------|
     *  |------B------||-------D------|
     *    |---C---|
     *
     * 1. Start A
     * 3. Start B
     * 4. Start C
     * 5. End C
     * 6. End B
     * 7. Start D
     * 8. End D
     * 9. End A
     *
     * By default, async events are filtered. This behaviour can be
     * overriden making use of the filterAsyncEvents parameter.
     */
    static forEachEvent(events, onStartEvent, onEndEvent, onInstantEvent, startTime, endTime, filter, ignoreAsyncEvents = true) {
        startTime = startTime || 0;
        endTime = endTime || Infinity;
        const stack = [];
        const startEvent = TimelineModelImpl.topLevelEventEndingAfter(events, startTime);
        for (let i = startEvent; i < events.length; ++i) {
            const e = events[i];
            const { endTime: eventEndTime, startTime: eventStartTime, duration: eventDuration } = TraceEngine.Legacy.timesForEventInMilliseconds(e);
            const eventPhase = TraceEngine.Legacy.phaseForEvent(e);
            if ((eventEndTime || eventStartTime) < startTime) {
                continue;
            }
            if (eventStartTime >= endTime) {
                break;
            }
            const canIgnoreAsyncEvent = ignoreAsyncEvents && TraceEngine.Types.TraceEvents.isAsyncPhase(eventPhase);
            if (canIgnoreAsyncEvent || TraceEngine.Types.TraceEvents.isFlowPhase(eventPhase)) {
                continue;
            }
            let last = stack[stack.length - 1];
            let lastEventEndTime = last && TraceEngine.Legacy.timesForEventInMilliseconds(last).endTime;
            while (last && lastEventEndTime !== undefined && lastEventEndTime <= eventStartTime) {
                stack.pop();
                onEndEvent(last);
                last = stack[stack.length - 1];
                lastEventEndTime = last && TraceEngine.Legacy.timesForEventInMilliseconds(last).endTime;
            }
            if (filter && !filter(e)) {
                continue;
            }
            if (eventDuration) {
                onStartEvent(e);
                stack.push(e);
            }
            else {
                onInstantEvent && onInstantEvent(e, stack[stack.length - 1] || null);
            }
        }
        while (stack.length) {
            const last = stack.pop();
            if (last) {
                onEndEvent(last);
            }
        }
    }
    static topLevelEventEndingAfter(events, time) {
        let index = Platform.ArrayUtilities.upperBound(events, time, (time, event) => time - TraceEngine.Legacy.timesForEventInMilliseconds(event).startTime) -
            1;
        while (index > 0 && !TraceEngine.Legacy.TracingModel.isTopLevelEvent(events[index])) {
            index--;
        }
        return Math.max(index, 0);
    }
    static eventFrameId(event) {
        const data = event.args['data'] || event.args['beginData'];
        return data && data['frame'] || null;
    }
    setEvents(tracingModel) {
        this.reset();
        this.resetProcessingState();
        this.tracingModelInternal = tracingModel;
        this.minimumRecordTimeInternal = tracingModel.minimumRecordTime();
        this.processSyncBrowserEvents(tracingModel);
        if (this.browserFrameTracking) {
            this.processThreadsForBrowserFrames(tracingModel);
        }
        else {
            // The next line is for loading legacy traces recorded before M67.
            // TODO(alph): Drop the support at some point.
            const metadataEvents = this.processMetadataEvents(tracingModel);
            if (metadataEvents) {
                this.processMetadataAndThreads(metadataEvents);
            }
            else {
                this.processGenericTrace(tracingModel);
            }
        }
        this.inspectedTargetEventsInternal.sort(TraceEngine.Legacy.Event.compareStartTime);
        this.resetProcessingState();
    }
    processGenericTrace(tracingModel) {
        let browserMainThread = TraceEngine.Legacy.TracingModel.browserMainThread(tracingModel);
        if (!browserMainThread && tracingModel.sortedProcesses().length) {
            browserMainThread = tracingModel.sortedProcesses()[0].sortedThreads()[0];
        }
        for (const process of tracingModel.sortedProcesses()) {
            for (const thread of process.sortedThreads()) {
                this.processThreadEvents(thread);
            }
        }
    }
    processMetadataAndThreads(metadataEvents) {
        let startTime = 0;
        for (let i = 0, length = metadataEvents.page.length; i < length; i++) {
            const metaEvent = metadataEvents.page[i];
            const process = metaEvent.thread.process();
            const endTime = i + 1 < length ? metadataEvents.page[i + 1].startTime : Infinity;
            if (startTime === endTime) {
                continue;
            }
            this.legacyCurrentPage = metaEvent.args['data'] && metaEvent.args['data']['page'];
            for (const thread of process.sortedThreads()) {
                if (thread.name() === TimelineModelImpl.WorkerThreadName ||
                    thread.name() === TimelineModelImpl.WorkerThreadNameLegacy) {
                    const workerMetaEvent = metadataEvents.workers.find(e => {
                        if (e.args['data']['workerThreadId'] !== thread.id()) {
                            return false;
                        }
                        // This is to support old traces.
                        if (e.args['data']['sessionId'] === this.sessionId) {
                            return true;
                        }
                        const frameId = TimelineModelImpl.eventFrameId(e);
                        return frameId ? Boolean(this.pageFrames.get(frameId)) : false;
                    });
                    if (!workerMetaEvent) {
                        continue;
                    }
                    const workerId = workerMetaEvent.args['data']['workerId'];
                    if (workerId) {
                        this.workerIdByThread.set(thread, workerId);
                    }
                }
                this.processThreadEvents(thread);
            }
            startTime = endTime;
        }
    }
    processThreadsForBrowserFrames(tracingModel) {
        const processDataByPid = new Map();
        for (const frame of this.pageFrames.values()) {
            for (let i = 0; i < frame.processes.length; i++) {
                const pid = frame.processes[i].processId;
                let data = processDataByPid.get(pid);
                if (!data) {
                    data = [];
                    processDataByPid.set(pid, data);
                }
                const to = i === frame.processes.length - 1 ? (frame.deletedTime || Infinity) : frame.processes[i + 1].time;
                data.push({
                    from: frame.processes[i].time,
                    to: to,
                    main: !frame.parent,
                    url: frame.processes[i].url,
                });
            }
        }
        const allMetadataEvents = tracingModel.devToolsMetadataEvents();
        for (const process of tracingModel.sortedProcesses()) {
            const processData = processDataByPid.get(process.id());
            if (!processData) {
                continue;
            }
            // Sort ascending by range starts, followed by range ends
            processData.sort((a, b) => a.from - b.from || a.to - b.to);
            for (const thread of process.sortedThreads()) {
                if (thread.name() === TimelineModelImpl.RendererMainThreadName) {
                    this.processThreadEvents(thread);
                }
                else if (thread.name() === TimelineModelImpl.WorkerThreadName ||
                    thread.name() === TimelineModelImpl.WorkerThreadNameLegacy) {
                    const workerMetaEvent = allMetadataEvents.find(e => {
                        if (e.name !== TimelineModelImpl.DevToolsMetadataEvent.TracingSessionIdForWorker) {
                            return false;
                        }
                        if (e.thread.process() !== process) {
                            return false;
                        }
                        if (e.args['data']['workerThreadId'] !== thread.id()) {
                            return false;
                        }
                        const frameId = TimelineModelImpl.eventFrameId(e);
                        return frameId ? Boolean(this.pageFrames.get(frameId)) : false;
                    });
                    if (!workerMetaEvent) {
                        continue;
                    }
                    this.workerIdByThread.set(thread, workerMetaEvent.args['data']['workerId'] || '');
                    this.processThreadEvents(thread);
                }
                else {
                    this.processThreadEvents(thread);
                }
            }
        }
    }
    processMetadataEvents(tracingModel) {
        const metadataEvents = tracingModel.devToolsMetadataEvents();
        const pageDevToolsMetadataEvents = [];
        const workersDevToolsMetadataEvents = [];
        for (const event of metadataEvents) {
            if (event.name === TimelineModelImpl.DevToolsMetadataEvent.TracingStartedInPage) {
                pageDevToolsMetadataEvents.push(event);
                if (event.args['data'] && event.args['data']['persistentIds']) {
                    this.persistentIds = true;
                }
                const frames = ((event.args['data'] && event.args['data']['frames']) || []);
                frames.forEach((payload) => this.addPageFrame(event, payload));
                this.mainFrame = this.rootFrames()[0];
            }
            else if (event.name === TimelineModelImpl.DevToolsMetadataEvent.TracingSessionIdForWorker) {
                workersDevToolsMetadataEvents.push(event);
            }
            else if (event.name === TimelineModelImpl.DevToolsMetadataEvent.TracingStartedInBrowser) {
                console.assert(!this.mainFrameNodeId, 'Multiple sessions in trace');
                this.mainFrameNodeId = event.args['frameTreeNodeId'];
            }
        }
        if (!pageDevToolsMetadataEvents.length) {
            return null;
        }
        const sessionId = pageDevToolsMetadataEvents[0].args['sessionId'] || pageDevToolsMetadataEvents[0].args['data']['sessionId'];
        this.sessionId = sessionId;
        const mismatchingIds = new Set();
        function checkSessionId(event) {
            let args = event.args;
            // FIXME: put sessionId into args["data"] for TracingStartedInPage event.
            if (args['data']) {
                args = args['data'];
            }
            const id = args['sessionId'];
            if (id === sessionId) {
                return true;
            }
            mismatchingIds.add(id);
            return false;
        }
        const result = {
            page: pageDevToolsMetadataEvents.filter(checkSessionId).sort(TraceEngine.Legacy.Event.compareStartTime),
            workers: workersDevToolsMetadataEvents.sort(TraceEngine.Legacy.Event.compareStartTime),
        };
        if (mismatchingIds.size) {
            Common.Console.Console.instance().error('Timeline recording was started in more than one page simultaneously. Session id mismatch: ' +
                this.sessionId + ' and ' + [...mismatchingIds] + '.');
        }
        return result;
    }
    processSyncBrowserEvents(tracingModel) {
        const browserMain = TraceEngine.Legacy.TracingModel.browserMainThread(tracingModel);
        if (browserMain) {
            browserMain.events().forEach(this.processBrowserEvent, this);
        }
    }
    resetProcessingState() {
        this.lastScheduleStyleRecalculation = {};
        this.paintImageEventByPixelRefId = {};
        this.lastPaintForLayer = {};
        this.currentScriptEvent = null;
        this.eventStack = [];
        this.browserFrameTracking = false;
        this.persistentIds = false;
        this.legacyCurrentPage = null;
    }
    processThreadEvents(thread) {
        const events = thread.events();
        this.eventStack = [];
        const eventStack = this.eventStack;
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            let last = eventStack[eventStack.length - 1];
            while (last && last.endTime !== undefined && last.endTime <= event.startTime) {
                eventStack.pop();
                last = eventStack[eventStack.length - 1];
            }
            if (!this.processEvent(event)) {
                continue;
            }
            if (!TraceEngine.Types.TraceEvents.isAsyncPhase(event.phase) && event.duration) {
                if (eventStack.length) {
                    const parent = eventStack[eventStack.length - 1];
                    if (parent) {
                        parent.selfTime -= event.duration;
                        if (parent.selfTime < 0) {
                            parent.selfTime = 0;
                        }
                    }
                }
                event.selfTime = event.duration;
                eventStack.push(event);
            }
            this.inspectedTargetEventsInternal.push(event);
        }
    }
    processEvent(event) {
        const eventStack = this.eventStack;
        if (!eventStack.length) {
            this.currentTaskLayoutAndRecalcEvents = [];
        }
        if (this.currentScriptEvent) {
            if (this.currentScriptEvent.endTime !== undefined && event.startTime > this.currentScriptEvent.endTime) {
                this.currentScriptEvent = null;
            }
        }
        const eventData = event.args['data'] || event.args['beginData'] || {};
        const timelineData = EventOnTimelineData.forEvent(event);
        let pageFrameId = TimelineModelImpl.eventFrameId(event);
        const last = eventStack[eventStack.length - 1];
        if (!pageFrameId && last) {
            pageFrameId = EventOnTimelineData.forEvent(last).frameId;
        }
        timelineData.frameId = pageFrameId || (this.mainFrame && this.mainFrame.frameId) || '';
        switch (event.name) {
            case RecordType.ResourceSendRequest:
            case RecordType.WebSocketCreate: {
                const lastEvent = eventStack[eventStack.length - 1];
                if (!(lastEvent instanceof TraceEngine.Legacy.PayloadEvent)) {
                    break;
                }
                timelineData.url = eventData['url'];
                break;
            }
            case RecordType.ScheduleStyleRecalculation: {
                if (!(event instanceof TraceEngine.Legacy.PayloadEvent)) {
                    break;
                }
                this.lastScheduleStyleRecalculation[eventData['frame']] = event.rawPayload();
                break;
            }
            case RecordType.UpdateLayoutTree:
            case RecordType.RecalculateStyles: {
                if (this.currentScriptEvent) {
                    this.currentTaskLayoutAndRecalcEvents.push(event);
                }
                break;
            }
            case RecordType.Layout: {
                const frameId = event.args?.beginData?.frame;
                if (!frameId) {
                    break;
                }
                if (this.currentScriptEvent) {
                    this.currentTaskLayoutAndRecalcEvents.push(event);
                }
                break;
            }
            // @ts-ignore fallthrough intended.
            case RecordType.FunctionCall: {
                // Compatibility with old format.
                if (typeof eventData['scriptName'] === 'string') {
                    eventData['url'] = eventData['scriptName'];
                }
                if (typeof eventData['scriptLine'] === 'number') {
                    eventData['lineNumber'] = eventData['scriptLine'];
                }
            }
            case RecordType.EvaluateScript:
            case RecordType.CompileScript:
            // @ts-ignore fallthrough intended.
            case RecordType.CacheScript: {
                if (typeof eventData['lineNumber'] === 'number') {
                    --eventData['lineNumber'];
                }
                if (typeof eventData['columnNumber'] === 'number') {
                    --eventData['columnNumber'];
                }
            }
            case RecordType.RunMicrotasks: {
                // Microtasks technically are not necessarily scripts, but for purpose of
                // forced sync style recalc or layout detection they are.
                if (!this.currentScriptEvent) {
                    this.currentScriptEvent = event;
                }
                break;
            }
            case RecordType.SetLayerTreeId: {
                // This is to support old traces.
                if (this.sessionId && eventData['sessionId'] && this.sessionId === eventData['sessionId']) {
                    break;
                }
                // We currently only show layer tree for the main frame.
                const frameId = TimelineModelImpl.eventFrameId(event);
                const pageFrame = frameId ? this.pageFrames.get(frameId) : null;
                if (!pageFrame || pageFrame.parent) {
                    return false;
                }
                break;
            }
            case RecordType.Paint: {
                // Only keep layer paint events, skip paints for subframes that get painted to the same layer as parent.
                if (!eventData['layerId']) {
                    break;
                }
                const layerId = eventData['layerId'];
                this.lastPaintForLayer[layerId] = event;
                break;
            }
            case RecordType.PaintImage: {
                timelineData.url = eventData['url'];
                break;
            }
            case RecordType.DecodeImage: {
                let paintImageEvent = this.findAncestorEvent(RecordType.PaintImage);
                if (!paintImageEvent) {
                    const decodeLazyPixelRefEvent = this.findAncestorEvent(RecordType.DecodeLazyPixelRef);
                    paintImageEvent =
                        decodeLazyPixelRefEvent && this.paintImageEventByPixelRefId[decodeLazyPixelRefEvent.args['LazyPixelRef']];
                }
                if (!paintImageEvent) {
                    break;
                }
                const paintImageData = EventOnTimelineData.forEvent(paintImageEvent);
                timelineData.url = paintImageData.url;
                break;
            }
            case RecordType.DrawLazyPixelRef: {
                const paintImageEvent = this.findAncestorEvent(RecordType.PaintImage);
                if (!paintImageEvent) {
                    break;
                }
                this.paintImageEventByPixelRefId[event.args['LazyPixelRef']] = paintImageEvent;
                const paintImageData = EventOnTimelineData.forEvent(paintImageEvent);
                timelineData.url = paintImageData.url;
                break;
            }
            case RecordType.FrameStartedLoading: {
                if (timelineData.frameId !== event.args['frame']) {
                    return false;
                }
                break;
            }
            case RecordType.MarkDOMContent:
            case RecordType.MarkLoad: {
                const frameId = TimelineModelImpl.eventFrameId(event);
                if (!frameId || !this.pageFrames.has(frameId)) {
                    return false;
                }
                break;
            }
            case RecordType.CommitLoad: {
                if (this.browserFrameTracking) {
                    break;
                }
                const frameId = TimelineModelImpl.eventFrameId(event);
                const isOutermostMainFrame = Boolean(eventData['isOutermostMainFrame'] ?? eventData['isMainFrame']);
                const pageFrame = frameId ? this.pageFrames.get(frameId) : null;
                if (pageFrame) {
                    pageFrame.update(event.startTime, eventData);
                }
                else {
                    // We should only have one main frame which has persistent id,
                    // unless it's an old trace without 'persistentIds' flag.
                    if (!this.persistentIds) {
                        if (eventData['page'] && eventData['page'] !== this.legacyCurrentPage) {
                            return false;
                        }
                    }
                    else if (isOutermostMainFrame) {
                        return false;
                    }
                    else if (!this.addPageFrame(event, eventData)) {
                        return false;
                    }
                }
                if (isOutermostMainFrame && frameId) {
                    const frame = this.pageFrames.get(frameId);
                    if (frame) {
                        this.mainFrame = frame;
                    }
                }
                break;
            }
            case RecordType.SelectorStats: {
                this.lastRecalculateStylesEvent?.addArgs(event.args);
                break;
            }
        }
        return true;
    }
    processBrowserEvent(event) {
        if (event.name === RecordType.ResourceWillSendRequest) {
            const requestId = event.args?.data?.requestId;
            if (typeof requestId === 'string') {
                this.requestsFromBrowser.set(requestId, event);
            }
            return;
        }
        if (event.hasCategory(TraceEngine.Legacy.DevToolsMetadataEventCategory) && event.args['data']) {
            const data = event.args['data'];
            if (event.name === TimelineModelImpl.DevToolsMetadataEvent.TracingStartedInBrowser) {
                if (!data['persistentIds']) {
                    return;
                }
                this.browserFrameTracking = true;
                this.mainFrameNodeId = data['frameTreeNodeId'];
                const frames = data['frames'] || [];
                frames.forEach(payload => {
                    const parent = payload['parent'] && this.pageFrames.get(payload['parent']);
                    if (payload['parent'] && !parent) {
                        return;
                    }
                    let frame = this.pageFrames.get(payload['frame']);
                    if (!frame) {
                        frame = new PageFrame(payload);
                        this.pageFrames.set(frame.frameId, frame);
                        if (parent) {
                            parent.addChild(frame);
                        }
                        else {
                            this.mainFrame = frame;
                        }
                    }
                    // TODO(dgozman): this should use event.startTime, but due to races between tracing start
                    // in different processes we cannot do this yet.
                    frame.update(this.minimumRecordTimeInternal, payload);
                });
                return;
            }
            if (event.name === TimelineModelImpl.DevToolsMetadataEvent.FrameCommittedInBrowser && this.browserFrameTracking) {
                let frame = this.pageFrames.get(data['frame']);
                if (!frame) {
                    const parent = data['parent'] && this.pageFrames.get(data['parent']);
                    frame = new PageFrame(data);
                    this.pageFrames.set(frame.frameId, frame);
                    if (parent) {
                        parent.addChild(frame);
                    }
                }
                frame.update(event.startTime, data);
                return;
            }
            if (event.name === TimelineModelImpl.DevToolsMetadataEvent.ProcessReadyInBrowser && this.browserFrameTracking) {
                const frame = this.pageFrames.get(data['frame']);
                if (frame) {
                    frame.processReady(data['processPseudoId'], data['processId']);
                }
                return;
            }
            if (event.name === TimelineModelImpl.DevToolsMetadataEvent.FrameDeletedInBrowser && this.browserFrameTracking) {
                const frame = this.pageFrames.get(data['frame']);
                if (frame) {
                    frame.deletedTime = event.startTime;
                }
                return;
            }
        }
    }
    findAncestorEvent(name) {
        for (let i = this.eventStack.length - 1; i >= 0; --i) {
            const event = this.eventStack[i];
            if (event.name === name) {
                return event;
            }
        }
        return null;
    }
    addPageFrame(event, payload) {
        const parent = payload['parent'] && this.pageFrames.get(payload['parent']);
        if (payload['parent'] && !parent) {
            return false;
        }
        const pageFrame = new PageFrame(payload);
        this.pageFrames.set(pageFrame.frameId, pageFrame);
        pageFrame.update(event.startTime, payload);
        if (parent) {
            parent.addChild(pageFrame);
        }
        return true;
    }
    reset() {
        this.inspectedTargetEventsInternal = [];
        this.sessionId = null;
        this.mainFrameNodeId = null;
        this.workerIdByThread = new WeakMap();
        this.pageFrames = new Map();
        this.requestsFromBrowser = new Map();
        this.minimumRecordTimeInternal = 0;
    }
    tracingModel() {
        return this.tracingModelInternal;
    }
    inspectedTargetEvents() {
        return this.inspectedTargetEventsInternal;
    }
    rootFrames() {
        return Array.from(this.pageFrames.values()).filter(frame => !frame.parent);
    }
    pageURL() {
        return this.mainFrame && this.mainFrame.url || Platform.DevToolsPath.EmptyUrlString;
    }
    pageFrameById(frameId) {
        return frameId ? this.pageFrames.get(frameId) || null : null;
    }
    static findRecalculateStyleEvents(events, startTime = 0, endTime = Infinity) {
        const stack = [];
        const startEvent = TimelineModelImpl.topLevelEventEndingAfter(events, startTime);
        const startTimeInMicroSec = TraceEngine.Helpers.Timing.millisecondsToMicroseconds(TraceEngine.Types.Timing.MilliSeconds(startTime));
        const endTimeInMicroSec = TraceEngine.Helpers.Timing.millisecondsToMicroseconds(TraceEngine.Types.Timing.MilliSeconds(endTime));
        for (let i = startEvent; i < events.length; ++i) {
            const e = events[i];
            if (e.name !== "RecalculateStyles" /* TraceEngine.Types.TraceEvents.KnownEventName.RecalculateStyles */ &&
                e.name !== "UpdateLayoutTree" /* TraceEngine.Types.TraceEvents.KnownEventName.UpdateLayoutTree */) {
                continue;
            }
            if (!e.dur || e.ts + e.dur < startTimeInMicroSec) {
                continue;
            }
            if (e.ts >= endTimeInMicroSec) {
                break;
            }
            stack.push(e);
        }
        return stack;
    }
}
export var RecordType;
(function (RecordType) {
    RecordType["Task"] = "RunTask";
    RecordType["Program"] = "Program";
    RecordType["EventDispatch"] = "EventDispatch";
    RecordType["GPUTask"] = "GPUTask";
    RecordType["Animation"] = "Animation";
    RecordType["RequestMainThreadFrame"] = "RequestMainThreadFrame";
    RecordType["BeginFrame"] = "BeginFrame";
    RecordType["NeedsBeginFrameChanged"] = "NeedsBeginFrameChanged";
    RecordType["BeginMainThreadFrame"] = "BeginMainThreadFrame";
    RecordType["ActivateLayerTree"] = "ActivateLayerTree";
    RecordType["DrawFrame"] = "DrawFrame";
    RecordType["DroppedFrame"] = "DroppedFrame";
    RecordType["HitTest"] = "HitTest";
    RecordType["ScheduleStyleRecalculation"] = "ScheduleStyleRecalculation";
    RecordType["RecalculateStyles"] = "RecalculateStyles";
    RecordType["UpdateLayoutTree"] = "UpdateLayoutTree";
    RecordType["InvalidateLayout"] = "InvalidateLayout";
    RecordType["Layerize"] = "Layerize";
    RecordType["Layout"] = "Layout";
    RecordType["LayoutShift"] = "LayoutShift";
    RecordType["UpdateLayer"] = "UpdateLayer";
    RecordType["UpdateLayerTree"] = "UpdateLayerTree";
    RecordType["PaintSetup"] = "PaintSetup";
    RecordType["Paint"] = "Paint";
    RecordType["PaintImage"] = "PaintImage";
    RecordType["PrePaint"] = "PrePaint";
    RecordType["Rasterize"] = "Rasterize";
    RecordType["RasterTask"] = "RasterTask";
    RecordType["ScrollLayer"] = "ScrollLayer";
    RecordType["Commit"] = "Commit";
    RecordType["CompositeLayers"] = "CompositeLayers";
    RecordType["ComputeIntersections"] = "IntersectionObserverController::computeIntersections";
    RecordType["InteractiveTime"] = "InteractiveTime";
    RecordType["ParseHTML"] = "ParseHTML";
    RecordType["ParseAuthorStyleSheet"] = "ParseAuthorStyleSheet";
    RecordType["TimerInstall"] = "TimerInstall";
    RecordType["TimerRemove"] = "TimerRemove";
    RecordType["TimerFire"] = "TimerFire";
    RecordType["XHRReadyStateChange"] = "XHRReadyStateChange";
    RecordType["XHRLoad"] = "XHRLoad";
    RecordType["CompileScript"] = "v8.compile";
    RecordType["CompileCode"] = "V8.CompileCode";
    RecordType["OptimizeCode"] = "V8.OptimizeCode";
    RecordType["EvaluateScript"] = "EvaluateScript";
    RecordType["CacheScript"] = "v8.produceCache";
    RecordType["CompileModule"] = "v8.compileModule";
    RecordType["EvaluateModule"] = "v8.evaluateModule";
    RecordType["CacheModule"] = "v8.produceModuleCache";
    RecordType["WasmStreamFromResponseCallback"] = "v8.wasm.streamFromResponseCallback";
    RecordType["WasmCompiledModule"] = "v8.wasm.compiledModule";
    RecordType["WasmCachedModule"] = "v8.wasm.cachedModule";
    RecordType["WasmModuleCacheHit"] = "v8.wasm.moduleCacheHit";
    RecordType["WasmModuleCacheInvalid"] = "v8.wasm.moduleCacheInvalid";
    RecordType["FrameStartedLoading"] = "FrameStartedLoading";
    RecordType["CommitLoad"] = "CommitLoad";
    RecordType["MarkLoad"] = "MarkLoad";
    RecordType["MarkDOMContent"] = "MarkDOMContent";
    RecordType["MarkFirstPaint"] = "firstPaint";
    RecordType["MarkFCP"] = "firstContentfulPaint";
    RecordType["MarkLCPCandidate"] = "largestContentfulPaint::Candidate";
    RecordType["MarkLCPInvalidate"] = "largestContentfulPaint::Invalidate";
    RecordType["NavigationStart"] = "navigationStart";
    RecordType["TimeStamp"] = "TimeStamp";
    RecordType["ConsoleTime"] = "ConsoleTime";
    RecordType["UserTiming"] = "UserTiming";
    RecordType["EventTiming"] = "EventTiming";
    RecordType["ResourceWillSendRequest"] = "ResourceWillSendRequest";
    RecordType["ResourceSendRequest"] = "ResourceSendRequest";
    RecordType["ResourceReceiveResponse"] = "ResourceReceiveResponse";
    RecordType["ResourceReceivedData"] = "ResourceReceivedData";
    RecordType["ResourceFinish"] = "ResourceFinish";
    RecordType["ResourceMarkAsCached"] = "ResourceMarkAsCached";
    RecordType["RunMicrotasks"] = "RunMicrotasks";
    RecordType["FunctionCall"] = "FunctionCall";
    RecordType["GCEvent"] = "GCEvent";
    RecordType["MajorGC"] = "MajorGC";
    RecordType["MinorGC"] = "MinorGC";
    // The following types are used for CPUProfile.
    // JSRoot is used for the root node.
    // JSIdleFrame and JSIdleSample are used for idle nodes.
    // JSSystemFrame and JSSystemSample are used for other system nodes.
    // JSFrame and JSSample are used for other nodes, and will be categorized as |scripting|.
    RecordType["JSFrame"] = "JSFrame";
    RecordType["JSSample"] = "JSSample";
    RecordType["JSIdleFrame"] = "JSIdleFrame";
    RecordType["JSIdleSample"] = "JSIdleSample";
    RecordType["JSSystemFrame"] = "JSSystemFrame";
    RecordType["JSSystemSample"] = "JSSystemSample";
    RecordType["JSRoot"] = "JSRoot";
    // V8Sample events are coming from tracing and contain raw stacks with function addresses.
    // After being processed with help of JitCodeAdded and JitCodeMoved events they
    // get translated into function infos and stored as stacks in JSSample events.
    RecordType["V8Sample"] = "V8Sample";
    RecordType["JitCodeAdded"] = "JitCodeAdded";
    RecordType["JitCodeMoved"] = "JitCodeMoved";
    RecordType["StreamingCompileScript"] = "v8.parseOnBackground";
    RecordType["StreamingCompileScriptWaiting"] = "v8.parseOnBackgroundWaiting";
    RecordType["StreamingCompileScriptParsing"] = "v8.parseOnBackgroundParsing";
    RecordType["BackgroundDeserialize"] = "v8.deserializeOnBackground";
    RecordType["FinalizeDeserialization"] = "V8.FinalizeDeserialization";
    RecordType["V8Execute"] = "V8.Execute";
    RecordType["UpdateCounters"] = "UpdateCounters";
    RecordType["RequestAnimationFrame"] = "RequestAnimationFrame";
    RecordType["CancelAnimationFrame"] = "CancelAnimationFrame";
    RecordType["FireAnimationFrame"] = "FireAnimationFrame";
    RecordType["RequestIdleCallback"] = "RequestIdleCallback";
    RecordType["CancelIdleCallback"] = "CancelIdleCallback";
    RecordType["FireIdleCallback"] = "FireIdleCallback";
    RecordType["WebSocketCreate"] = "WebSocketCreate";
    RecordType["WebSocketSendHandshakeRequest"] = "WebSocketSendHandshakeRequest";
    RecordType["WebSocketReceiveHandshakeResponse"] = "WebSocketReceiveHandshakeResponse";
    RecordType["WebSocketDestroy"] = "WebSocketDestroy";
    RecordType["EmbedderCallback"] = "EmbedderCallback";
    RecordType["SetLayerTreeId"] = "SetLayerTreeId";
    RecordType["TracingStartedInPage"] = "TracingStartedInPage";
    RecordType["TracingSessionIdForWorker"] = "TracingSessionIdForWorker";
    RecordType["StartProfiling"] = "CpuProfiler::StartProfiling";
    RecordType["DecodeImage"] = "Decode Image";
    RecordType["DrawLazyPixelRef"] = "Draw LazyPixelRef";
    RecordType["DecodeLazyPixelRef"] = "Decode LazyPixelRef";
    RecordType["LazyPixelRef"] = "LazyPixelRef";
    RecordType["LayerTreeHostImplSnapshot"] = "cc::LayerTreeHostImpl";
    RecordType["PictureSnapshot"] = "cc::Picture";
    RecordType["DisplayItemListSnapshot"] = "cc::DisplayItemList";
    RecordType["InputLatencyMouseMove"] = "InputLatency::MouseMove";
    RecordType["InputLatencyMouseWheel"] = "InputLatency::MouseWheel";
    RecordType["ImplSideFling"] = "InputHandlerProxy::HandleGestureFling::started";
    RecordType["GCCollectGarbage"] = "BlinkGC.AtomicPhase";
    RecordType["CryptoDoEncrypt"] = "DoEncrypt";
    RecordType["CryptoDoEncryptReply"] = "DoEncryptReply";
    RecordType["CryptoDoDecrypt"] = "DoDecrypt";
    RecordType["CryptoDoDecryptReply"] = "DoDecryptReply";
    RecordType["CryptoDoDigest"] = "DoDigest";
    RecordType["CryptoDoDigestReply"] = "DoDigestReply";
    RecordType["CryptoDoSign"] = "DoSign";
    RecordType["CryptoDoSignReply"] = "DoSignReply";
    RecordType["CryptoDoVerify"] = "DoVerify";
    RecordType["CryptoDoVerifyReply"] = "DoVerifyReply";
    // CpuProfile is a virtual event created on frontend to support
    // serialization of CPU Profiles within tracing timeline data.
    RecordType["CpuProfile"] = "CpuProfile";
    RecordType["Profile"] = "Profile";
    RecordType["AsyncTask"] = "AsyncTask";
    RecordType["SelectorStats"] = "SelectorStats";
})(RecordType || (RecordType = {}));
(function (TimelineModelImpl) {
    TimelineModelImpl.Category = {
        Console: 'blink.console',
        UserTiming: 'blink.user_timing',
        Loading: 'loading',
    };
    TimelineModelImpl.WorkerThreadName = 'DedicatedWorker thread';
    TimelineModelImpl.WorkerThreadNameLegacy = 'DedicatedWorker Thread';
    TimelineModelImpl.RendererMainThreadName = 'CrRendererMain';
    TimelineModelImpl.BrowserMainThreadName = 'CrBrowserMain';
    // The names of threads before M111 were exactly this, but afterwards have
    // it a suffix after the exact role.
    TimelineModelImpl.UtilityMainThreadNameSuffix = 'CrUtilityMain';
    TimelineModelImpl.DevToolsMetadataEvent = {
        TracingStartedInBrowser: 'TracingStartedInBrowser',
        TracingStartedInPage: 'TracingStartedInPage',
        TracingSessionIdForWorker: 'TracingSessionIdForWorker',
        FrameCommittedInBrowser: 'FrameCommittedInBrowser',
        ProcessReadyInBrowser: 'ProcessReadyInBrowser',
        FrameDeletedInBrowser: 'FrameDeletedInBrowser',
    };
    TimelineModelImpl.Thresholds = {
        LongTask: 50,
        Handler: 150,
        RecurringHandler: 50,
        ForcedLayout: 30,
        IdleCallbackAddon: 5,
    };
})(TimelineModelImpl || (TimelineModelImpl = {}));
export class PageFrame {
    frameId;
    url;
    name;
    children;
    parent;
    processes;
    deletedTime;
    ownerNode;
    constructor(payload) {
        this.frameId = payload['frame'];
        this.url = payload['url'] || Platform.DevToolsPath.EmptyUrlString;
        this.name = payload['name'];
        this.children = [];
        this.parent = null;
        this.processes = [];
        this.deletedTime = null;
        // TODO(dgozman): figure this out.
        // this.ownerNode = target && payload['nodeId'] ? new SDK.DOMModel.DeferredDOMNode(target, payload['nodeId']) : null;
        this.ownerNode = null;
    }
    update(time, payload) {
        this.url = payload['url'] || '';
        this.name = payload['name'];
        if (payload['processId']) {
            this.processes.push({ time: time, processId: payload['processId'], processPseudoId: '', url: payload['url'] || '' });
        }
        else {
            this.processes.push({ time: time, processId: -1, processPseudoId: payload['processPseudoId'], url: payload['url'] || '' });
        }
    }
    processReady(processPseudoId, processId) {
        for (const process of this.processes) {
            if (process.processPseudoId === processPseudoId) {
                process.processPseudoId = '';
                process.processId = processId;
            }
        }
    }
    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }
}
export class EventOnTimelineData {
    url;
    frameId;
    constructor() {
        this.url = null;
        this.frameId = null;
    }
    static forEvent(event) {
        if (event instanceof TraceEngine.Legacy.PayloadEvent) {
            return EventOnTimelineData.forTraceEventData(event.rawPayload());
        }
        if (!(event instanceof TraceEngine.Legacy.Event)) {
            return EventOnTimelineData.forTraceEventData(event);
        }
        return getOrCreateEventData(event);
    }
    static forTraceEventData(event) {
        return getOrCreateEventData(event);
    }
}
function getOrCreateEventData(event) {
    let data = eventToData.get(event);
    if (!data) {
        data = new EventOnTimelineData();
        eventToData.set(event, data);
    }
    return data;
}
const eventToData = new Map();
//# sourceMappingURL=TimelineModel.js.map