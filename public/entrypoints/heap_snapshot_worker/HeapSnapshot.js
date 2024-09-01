/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
/* eslint-disable rulesdir/use_private_class_members */
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
import { AllocationProfile } from './AllocationProfile.js';
export class HeapSnapshotEdge {
    snapshot;
    edges;
    edgeIndex;
    constructor(snapshot, edgeIndex) {
        this.snapshot = snapshot;
        this.edges = snapshot.containmentEdges;
        this.edgeIndex = edgeIndex || 0;
    }
    clone() {
        return new HeapSnapshotEdge(this.snapshot, this.edgeIndex);
    }
    hasStringName() {
        throw new Error('Not implemented');
    }
    name() {
        throw new Error('Not implemented');
    }
    node() {
        return this.snapshot.createNode(this.nodeIndex());
    }
    nodeIndex() {
        if (typeof this.snapshot.edgeToNodeOffset === 'undefined') {
            throw new Error('edgeToNodeOffset is undefined');
        }
        return this.edges.getValue(this.edgeIndex + this.snapshot.edgeToNodeOffset);
    }
    toString() {
        return 'HeapSnapshotEdge: ' + this.name();
    }
    type() {
        return this.snapshot.edgeTypes[this.rawType()];
    }
    itemIndex() {
        return this.edgeIndex;
    }
    serialize() {
        return new HeapSnapshotModel.HeapSnapshotModel.Edge(this.name(), this.node().serialize(), this.type(), this.edgeIndex);
    }
    rawType() {
        if (typeof this.snapshot.edgeTypeOffset === 'undefined') {
            throw new Error('edgeTypeOffset is undefined');
        }
        return this.edges.getValue(this.edgeIndex + this.snapshot.edgeTypeOffset);
    }
    isInternal() {
        throw new Error('Not implemented');
    }
    isInvisible() {
        throw new Error('Not implemented');
    }
    isWeak() {
        throw new Error('Not implemented');
    }
    getValueForSorting(_fieldName) {
        throw new Error('Not implemented');
    }
    nameIndex() {
        throw new Error('Not implemented');
    }
}
export class HeapSnapshotNodeIndexProvider {
    #node;
    constructor(snapshot) {
        this.#node = snapshot.createNode();
    }
    itemForIndex(index) {
        this.#node.nodeIndex = index;
        return this.#node;
    }
}
export class HeapSnapshotEdgeIndexProvider {
    #edge;
    constructor(snapshot) {
        this.#edge = snapshot.createEdge(0);
    }
    itemForIndex(index) {
        this.#edge.edgeIndex = index;
        return this.#edge;
    }
}
export class HeapSnapshotRetainerEdgeIndexProvider {
    #retainerEdge;
    constructor(snapshot) {
        this.#retainerEdge = snapshot.createRetainingEdge(0);
    }
    itemForIndex(index) {
        this.#retainerEdge.setRetainerIndex(index);
        return this.#retainerEdge;
    }
}
export class HeapSnapshotEdgeIterator {
    #sourceNode;
    edge;
    constructor(node) {
        this.#sourceNode = node;
        this.edge = node.snapshot.createEdge(node.edgeIndexesStart());
    }
    hasNext() {
        return this.edge.edgeIndex < this.#sourceNode.edgeIndexesEnd();
    }
    item() {
        return this.edge;
    }
    next() {
        if (typeof this.edge.snapshot.edgeFieldsCount === 'undefined') {
            throw new Error('edgeFieldsCount is undefined');
        }
        this.edge.edgeIndex += this.edge.snapshot.edgeFieldsCount;
    }
}
export class HeapSnapshotRetainerEdge {
    snapshot;
    #retainerIndexInternal;
    #globalEdgeIndex;
    #retainingNodeIndex;
    #edgeInstance;
    #nodeInstance;
    constructor(snapshot, retainerIndex) {
        this.snapshot = snapshot;
        this.setRetainerIndex(retainerIndex);
    }
    clone() {
        return new HeapSnapshotRetainerEdge(this.snapshot, this.retainerIndex());
    }
    hasStringName() {
        return this.edge().hasStringName();
    }
    name() {
        return this.edge().name();
    }
    nameIndex() {
        return this.edge().nameIndex();
    }
    node() {
        return this.nodeInternal();
    }
    nodeIndex() {
        if (typeof this.#retainingNodeIndex === 'undefined') {
            throw new Error('retainingNodeIndex is undefined');
        }
        return this.#retainingNodeIndex;
    }
    retainerIndex() {
        return this.#retainerIndexInternal;
    }
    setRetainerIndex(retainerIndex) {
        if (retainerIndex === this.#retainerIndexInternal) {
            return;
        }
        if (!this.snapshot.retainingEdges || !this.snapshot.retainingNodes) {
            throw new Error('Snapshot does not contain retaining edges or retaining nodes');
        }
        this.#retainerIndexInternal = retainerIndex;
        this.#globalEdgeIndex = this.snapshot.retainingEdges[retainerIndex];
        this.#retainingNodeIndex = this.snapshot.retainingNodes[retainerIndex];
        this.#edgeInstance = null;
        this.#nodeInstance = null;
    }
    set edgeIndex(edgeIndex) {
        this.setRetainerIndex(edgeIndex);
    }
    nodeInternal() {
        if (!this.#nodeInstance) {
            this.#nodeInstance = this.snapshot.createNode(this.#retainingNodeIndex);
        }
        return this.#nodeInstance;
    }
    edge() {
        if (!this.#edgeInstance) {
            this.#edgeInstance = this.snapshot.createEdge(this.#globalEdgeIndex);
        }
        return this.#edgeInstance;
    }
    toString() {
        return this.edge().toString();
    }
    itemIndex() {
        return this.#retainerIndexInternal;
    }
    serialize() {
        const node = this.node();
        const serializedNode = node.serialize();
        serializedNode.distance = this.#distance();
        serializedNode.ignored = this.snapshot.isNodeIgnoredInRetainersView(node.nodeIndex);
        return new HeapSnapshotModel.HeapSnapshotModel.Edge(this.name(), serializedNode, this.type(), this.#globalEdgeIndex);
    }
    type() {
        return this.edge().type();
    }
    isInternal() {
        return this.edge().isInternal();
    }
    getValueForSorting(fieldName) {
        if (fieldName === '!edgeDistance') {
            return this.#distance();
        }
        throw new Error('Invalid field name');
    }
    #distance() {
        if (this.snapshot.isEdgeIgnoredInRetainersView(this.#globalEdgeIndex)) {
            return HeapSnapshotModel.HeapSnapshotModel.baseUnreachableDistance;
        }
        return this.node().distanceForRetainersView();
    }
}
export class HeapSnapshotRetainerEdgeIterator {
    #retainersEnd;
    retainer;
    constructor(retainedNode) {
        const snapshot = retainedNode.snapshot;
        const retainedNodeOrdinal = retainedNode.ordinal();
        if (!snapshot.firstRetainerIndex) {
            throw new Error('Snapshot does not contain firstRetainerIndex');
        }
        const retainerIndex = snapshot.firstRetainerIndex[retainedNodeOrdinal];
        this.#retainersEnd = snapshot.firstRetainerIndex[retainedNodeOrdinal + 1];
        this.retainer = snapshot.createRetainingEdge(retainerIndex);
    }
    hasNext() {
        return this.retainer.retainerIndex() < this.#retainersEnd;
    }
    item() {
        return this.retainer;
    }
    next() {
        this.retainer.setRetainerIndex(this.retainer.retainerIndex() + 1);
    }
}
export class HeapSnapshotNode {
    snapshot;
    nodeIndex;
    constructor(snapshot, nodeIndex) {
        this.snapshot = snapshot;
        this.nodeIndex = nodeIndex || 0;
    }
    distance() {
        return this.snapshot.nodeDistances[this.nodeIndex / this.snapshot.nodeFieldCount];
    }
    distanceForRetainersView() {
        return this.snapshot.getDistanceForRetainersView(this.nodeIndex);
    }
    className() {
        return this.snapshot.strings[this.classIndex()];
    }
    classIndex() {
        return this.#detachednessAndClassIndex() >>> SHIFT_FOR_CLASS_INDEX;
    }
    setClassIndex(index) {
        let value = this.#detachednessAndClassIndex();
        value &= BITMASK_FOR_DOM_LINK_STATE; // Clear previous class index.
        value |= (index << SHIFT_FOR_CLASS_INDEX); // Set new class index.
        this.#setDetachednessAndClassIndex(value);
        if (this.classIndex() !== index) {
            throw new Error('String index overflow');
        }
    }
    dominatorIndex() {
        const nodeFieldCount = this.snapshot.nodeFieldCount;
        return this.snapshot.dominatorsTree[this.nodeIndex / this.snapshot.nodeFieldCount] * nodeFieldCount;
    }
    edges() {
        return new HeapSnapshotEdgeIterator(this);
    }
    edgesCount() {
        return (this.edgeIndexesEnd() - this.edgeIndexesStart()) / this.snapshot.edgeFieldsCount;
    }
    id() {
        throw new Error('Not implemented');
    }
    rawName() {
        return this.snapshot.strings[this.rawNameIndex()];
    }
    isRoot() {
        return this.nodeIndex === this.snapshot.rootNodeIndex;
    }
    isUserRoot() {
        throw new Error('Not implemented');
    }
    isHidden() {
        throw new Error('Not implemented');
    }
    isArray() {
        throw new Error('Not implemented');
    }
    isSynthetic() {
        throw new Error('Not implemented');
    }
    isDocumentDOMTreesRoot() {
        throw new Error('Not implemented');
    }
    name() {
        return this.rawName();
    }
    retainedSize() {
        return this.snapshot.retainedSizes[this.ordinal()];
    }
    retainers() {
        return new HeapSnapshotRetainerEdgeIterator(this);
    }
    retainersCount() {
        const snapshot = this.snapshot;
        const ordinal = this.ordinal();
        return snapshot.firstRetainerIndex[ordinal + 1] - snapshot.firstRetainerIndex[ordinal];
    }
    selfSize() {
        const snapshot = this.snapshot;
        return snapshot.nodes.getValue(this.nodeIndex + snapshot.nodeSelfSizeOffset);
    }
    type() {
        return this.snapshot.nodeTypes[this.rawType()];
    }
    traceNodeId() {
        const snapshot = this.snapshot;
        return snapshot.nodes.getValue(this.nodeIndex + snapshot.nodeTraceNodeIdOffset);
    }
    itemIndex() {
        return this.nodeIndex;
    }
    serialize() {
        return new HeapSnapshotModel.HeapSnapshotModel.Node(this.id(), this.name(), this.distance(), this.nodeIndex, this.retainedSize(), this.selfSize(), this.type());
    }
    rawNameIndex() {
        const snapshot = this.snapshot;
        return snapshot.nodes.getValue(this.nodeIndex + snapshot.nodeNameOffset);
    }
    edgeIndexesStart() {
        return this.snapshot.firstEdgeIndexes[this.ordinal()];
    }
    edgeIndexesEnd() {
        return this.snapshot.firstEdgeIndexes[this.ordinal() + 1];
    }
    ordinal() {
        return this.nodeIndex / this.snapshot.nodeFieldCount;
    }
    nextNodeIndex() {
        return this.nodeIndex + this.snapshot.nodeFieldCount;
    }
    rawType() {
        const snapshot = this.snapshot;
        return snapshot.nodes.getValue(this.nodeIndex + snapshot.nodeTypeOffset);
    }
    isFlatConsString() {
        if (this.rawType() !== this.snapshot.nodeConsStringType) {
            return false;
        }
        for (let iter = this.edges(); iter.hasNext(); iter.next()) {
            const edge = iter.edge;
            if (!edge.isInternal()) {
                continue;
            }
            const edgeName = edge.name();
            if ((edgeName === 'first' || edgeName === 'second') && edge.node().name() === '') {
                return true;
            }
        }
        return false;
    }
    #detachednessAndClassIndex() {
        const { snapshot, nodeIndex } = this;
        const nodeDetachednessAndClassIndexOffset = snapshot.nodeDetachednessAndClassIndexOffset;
        return nodeDetachednessAndClassIndexOffset !== -1 ?
            snapshot.nodes.getValue(nodeIndex + nodeDetachednessAndClassIndexOffset) :
            snapshot.detachednessAndClassIndexArray[nodeIndex / snapshot.nodeFieldCount];
    }
    #setDetachednessAndClassIndex(value) {
        const { snapshot, nodeIndex } = this;
        const nodeDetachednessAndClassIndexOffset = snapshot.nodeDetachednessAndClassIndexOffset;
        if (nodeDetachednessAndClassIndexOffset !== -1) {
            snapshot.nodes.setValue(nodeIndex + nodeDetachednessAndClassIndexOffset, value);
        }
        else {
            snapshot.detachednessAndClassIndexArray[nodeIndex / snapshot.nodeFieldCount] = value;
        }
    }
    detachedness() {
        return this.#detachednessAndClassIndex() & BITMASK_FOR_DOM_LINK_STATE;
    }
    setDetachedness(detachedness) {
        let value = this.#detachednessAndClassIndex();
        value &= ~BITMASK_FOR_DOM_LINK_STATE; // Clear the old bits.
        value |= detachedness; // Set the new bits.
        this.#setDetachednessAndClassIndex(value);
    }
}
export class HeapSnapshotNodeIterator {
    node;
    #nodesLength;
    constructor(node) {
        this.node = node;
        this.#nodesLength = node.snapshot.nodes.length;
    }
    hasNext() {
        return this.node.nodeIndex < this.#nodesLength;
    }
    item() {
        return this.node;
    }
    next() {
        this.node.nodeIndex = this.node.nextNodeIndex();
    }
}
export class HeapSnapshotIndexRangeIterator {
    #itemProvider;
    #indexes;
    #position;
    constructor(itemProvider, indexes) {
        this.#itemProvider = itemProvider;
        this.#indexes = indexes;
        this.#position = 0;
    }
    hasNext() {
        return this.#position < this.#indexes.length;
    }
    item() {
        const index = this.#indexes[this.#position];
        return this.#itemProvider.itemForIndex(index);
    }
    next() {
        ++this.#position;
    }
}
export class HeapSnapshotFilteredIterator {
    #iterator;
    #filter;
    constructor(iterator, filter) {
        this.#iterator = iterator;
        this.#filter = filter;
        this.skipFilteredItems();
    }
    hasNext() {
        return this.#iterator.hasNext();
    }
    item() {
        return this.#iterator.item();
    }
    next() {
        this.#iterator.next();
        this.skipFilteredItems();
    }
    skipFilteredItems() {
        while (this.#iterator.hasNext() && this.#filter && !this.#filter(this.#iterator.item())) {
            this.#iterator.next();
        }
    }
}
export class HeapSnapshotProgress {
    #dispatcher;
    constructor(dispatcher) {
        this.#dispatcher = dispatcher;
    }
    updateStatus(status) {
        this.sendUpdateEvent(i18n.i18n.serializeUIString(status));
    }
    updateProgress(title, value, total) {
        const percentValue = ((total ? (value / total) : 0) * 100).toFixed(0);
        this.sendUpdateEvent(i18n.i18n.serializeUIString(title, { PH1: percentValue }));
    }
    reportProblem(error) {
        // May be undefined in tests.
        if (this.#dispatcher) {
            this.#dispatcher.sendEvent(HeapSnapshotModel.HeapSnapshotModel.HeapSnapshotProgressEvent.BrokenSnapshot, error);
        }
    }
    sendUpdateEvent(serializedText) {
        // May be undefined in tests.
        if (this.#dispatcher) {
            this.#dispatcher.sendEvent(HeapSnapshotModel.HeapSnapshotModel.HeapSnapshotProgressEvent.Update, serializedText);
        }
    }
}
export class HeapSnapshotProblemReport {
    #errors;
    constructor(title) {
        this.#errors = [title];
    }
    addError(error) {
        if (this.#errors.length > 100) {
            return;
        }
        this.#errors.push(error);
    }
    toString() {
        return this.#errors.join('\n  ');
    }
}
const BITMASK_FOR_DOM_LINK_STATE = 3;
// The class index is stored in the upper 30 bits of the detachedness field.
const SHIFT_FOR_CLASS_INDEX = 2;
// The maximum number of results produced by inferInterfaceDefinitions.
const MAX_INTERFACE_COUNT = 1000;
// After this many properties, inferInterfaceDefinitions can stop adding more
// properties to an interface definition if the name is getting too long.
const MIN_INTERFACE_PROPERTY_COUNT = 1;
// The maximum length of an interface name produced by inferInterfaceDefinitions.
// This limit can be exceeded if the first MIN_INTERFACE_PROPERTY_COUNT property
// names are long.
const MAX_INTERFACE_NAME_LENGTH = 120;
// Each interface definition produced by inferInterfaceDefinitions will match at
// least this many objects. There's no point in defining interfaces which match
// only a single object.
const MIN_OBJECT_COUNT_PER_INTERFACE = 2;
export class HeapSnapshot {
    nodes;
    containmentEdges;
    #metaNode;
    #rawSamples;
    #samples;
    strings;
    #locations;
    #progress;
    #noDistance;
    rootNodeIndexInternal;
    #snapshotDiffs;
    #aggregatesForDiffInternal;
    #aggregates;
    #aggregatesSortedFlags;
    #profile;
    nodeTypeOffset;
    nodeNameOffset;
    nodeIdOffset;
    nodeSelfSizeOffset;
    #nodeEdgeCountOffset;
    nodeTraceNodeIdOffset;
    nodeFieldCount;
    nodeTypes;
    nodeArrayType;
    nodeHiddenType;
    nodeObjectType;
    nodeNativeType;
    nodeStringType;
    nodeConsStringType;
    nodeSlicedStringType;
    nodeCodeType;
    nodeSyntheticType;
    nodeClosureType;
    nodeRegExpType;
    edgeFieldsCount;
    edgeTypeOffset;
    edgeNameOffset;
    edgeToNodeOffset;
    edgeTypes;
    edgeElementType;
    edgeHiddenType;
    edgeInternalType;
    edgeShortcutType;
    edgeWeakType;
    edgeInvisibleType;
    edgePropertyType;
    #locationIndexOffset;
    #locationScriptIdOffset;
    #locationLineOffset;
    #locationColumnOffset;
    #locationFieldCount;
    nodeCount;
    #edgeCount;
    retainedSizes;
    firstEdgeIndexes;
    retainingNodes;
    retainingEdges;
    firstRetainerIndex;
    nodeDistances;
    firstDominatedNodeIndex;
    dominatedNodes;
    dominatorsTree;
    #allocationProfile;
    nodeDetachednessAndClassIndexOffset;
    #locationMap;
    #ignoredNodesInRetainersView;
    #ignoredEdgesInRetainersView;
    #nodeDistancesForRetainersView;
    #edgeNamesThatAreNotWeakMaps;
    detachednessAndClassIndexArray;
    #essentialEdges;
    #interfaceNames;
    #interfaceDefinitions;
    constructor(profile, progress) {
        this.nodes = profile.nodes;
        this.containmentEdges = profile.edges;
        this.#metaNode = profile.snapshot.meta;
        this.#rawSamples = profile.samples;
        this.#samples = null;
        this.strings = profile.strings;
        this.#locations = profile.locations;
        this.#progress = progress;
        this.#noDistance = -5;
        this.rootNodeIndexInternal = 0;
        if (profile.snapshot.root_index) {
            this.rootNodeIndexInternal = profile.snapshot.root_index;
        }
        this.#snapshotDiffs = {};
        this.#aggregates = {};
        this.#aggregatesSortedFlags = {};
        this.#profile = profile;
        this.#ignoredNodesInRetainersView = new Set();
        this.#ignoredEdgesInRetainersView = new Set();
        this.#edgeNamesThatAreNotWeakMaps = Platform.TypedArrayUtilities.createBitVector(this.strings.length);
        this.#interfaceNames = new Map();
    }
    initialize() {
        const meta = this.#metaNode;
        this.nodeTypeOffset = meta.node_fields.indexOf('type');
        this.nodeNameOffset = meta.node_fields.indexOf('name');
        this.nodeIdOffset = meta.node_fields.indexOf('id');
        this.nodeSelfSizeOffset = meta.node_fields.indexOf('self_size');
        this.#nodeEdgeCountOffset = meta.node_fields.indexOf('edge_count');
        this.nodeTraceNodeIdOffset = meta.node_fields.indexOf('trace_node_id');
        this.nodeDetachednessAndClassIndexOffset = meta.node_fields.indexOf('detachedness');
        this.nodeFieldCount = meta.node_fields.length;
        this.nodeTypes = meta.node_types[this.nodeTypeOffset];
        this.nodeArrayType = this.nodeTypes.indexOf('array');
        this.nodeHiddenType = this.nodeTypes.indexOf('hidden');
        this.nodeObjectType = this.nodeTypes.indexOf('object');
        this.nodeNativeType = this.nodeTypes.indexOf('native');
        this.nodeStringType = this.nodeTypes.indexOf('string');
        this.nodeConsStringType = this.nodeTypes.indexOf('concatenated string');
        this.nodeSlicedStringType = this.nodeTypes.indexOf('sliced string');
        this.nodeCodeType = this.nodeTypes.indexOf('code');
        this.nodeSyntheticType = this.nodeTypes.indexOf('synthetic');
        this.nodeClosureType = this.nodeTypes.indexOf('closure');
        this.nodeRegExpType = this.nodeTypes.indexOf('regexp');
        this.edgeFieldsCount = meta.edge_fields.length;
        this.edgeTypeOffset = meta.edge_fields.indexOf('type');
        this.edgeNameOffset = meta.edge_fields.indexOf('name_or_index');
        this.edgeToNodeOffset = meta.edge_fields.indexOf('to_node');
        this.edgeTypes = meta.edge_types[this.edgeTypeOffset];
        this.edgeTypes.push('invisible');
        this.edgeElementType = this.edgeTypes.indexOf('element');
        this.edgeHiddenType = this.edgeTypes.indexOf('hidden');
        this.edgeInternalType = this.edgeTypes.indexOf('internal');
        this.edgeShortcutType = this.edgeTypes.indexOf('shortcut');
        this.edgeWeakType = this.edgeTypes.indexOf('weak');
        this.edgeInvisibleType = this.edgeTypes.indexOf('invisible');
        this.edgePropertyType = this.edgeTypes.indexOf('property');
        const locationFields = meta.location_fields || [];
        this.#locationIndexOffset = locationFields.indexOf('object_index');
        this.#locationScriptIdOffset = locationFields.indexOf('script_id');
        this.#locationLineOffset = locationFields.indexOf('line');
        this.#locationColumnOffset = locationFields.indexOf('column');
        this.#locationFieldCount = locationFields.length;
        this.nodeCount = this.nodes.length / this.nodeFieldCount;
        this.#edgeCount = this.containmentEdges.length / this.edgeFieldsCount;
        this.retainedSizes = new Float64Array(this.nodeCount);
        this.firstEdgeIndexes = new Uint32Array(this.nodeCount + 1);
        this.retainingNodes = new Uint32Array(this.#edgeCount);
        this.retainingEdges = new Uint32Array(this.#edgeCount);
        this.firstRetainerIndex = new Uint32Array(this.nodeCount + 1);
        this.nodeDistances = new Int32Array(this.nodeCount);
        this.firstDominatedNodeIndex = new Uint32Array(this.nodeCount + 1);
        this.dominatedNodes = new Uint32Array(this.nodeCount - 1);
        this.#progress.updateStatus('Building edge indexes…');
        this.buildEdgeIndexes();
        this.#progress.updateStatus('Building retainers…');
        this.buildRetainers();
        this.#progress.updateStatus('Propagating DOM state…');
        this.propagateDOMState();
        this.#progress.updateStatus('Calculating node flags…');
        this.calculateFlags();
        this.#progress.updateStatus('Calculating distances…');
        this.calculateDistances(/* isForRetainersView=*/ false);
        this.#progress.updateStatus('Building postorder index…');
        const result = this.buildPostOrderIndex();
        // Actually it is array that maps node ordinal number to dominator node ordinal number.
        this.#progress.updateStatus('Building dominator tree…');
        this.dominatorsTree = this.buildDominatorTree(result.postOrderIndex2NodeOrdinal, result.nodeOrdinal2PostOrderIndex);
        this.#progress.updateStatus('Calculating shallow sizes…');
        this.calculateShallowSizes();
        this.#progress.updateStatus('Calculating retained sizes…');
        this.calculateRetainedSizes(result.postOrderIndex2NodeOrdinal);
        this.#progress.updateStatus('Building dominated nodes…');
        this.buildDominatedNodes();
        this.#progress.updateStatus('Calculating object names…');
        this.calculateObjectNames();
        this.applyInterfaceDefinitions(this.inferInterfaceDefinitions());
        this.#progress.updateStatus('Calculating statistics…');
        this.calculateStatistics();
        this.#progress.updateStatus('Calculating samples…');
        this.buildSamples();
        this.#progress.updateStatus('Building locations…');
        this.buildLocationMap();
        this.#progress.updateStatus('Finished processing.');
        if (this.#profile.snapshot.trace_function_count) {
            this.#progress.updateStatus('Building allocation statistics…');
            const nodes = this.nodes;
            const nodesLength = nodes.length;
            const nodeFieldCount = this.nodeFieldCount;
            const node = this.rootNode();
            const liveObjects = {};
            for (let nodeIndex = 0; nodeIndex < nodesLength; nodeIndex += nodeFieldCount) {
                node.nodeIndex = nodeIndex;
                const traceNodeId = node.traceNodeId();
                let stats = liveObjects[traceNodeId];
                if (!stats) {
                    liveObjects[traceNodeId] = stats = { count: 0, size: 0, ids: [] };
                }
                stats.count++;
                stats.size += node.selfSize();
                stats.ids.push(node.id());
            }
            this.#allocationProfile = new AllocationProfile(this.#profile, liveObjects);
            this.#progress.updateStatus('done');
        }
    }
    buildEdgeIndexes() {
        const nodes = this.nodes;
        const nodeCount = this.nodeCount;
        const firstEdgeIndexes = this.firstEdgeIndexes;
        const nodeFieldCount = this.nodeFieldCount;
        const edgeFieldsCount = this.edgeFieldsCount;
        const nodeEdgeCountOffset = this.#nodeEdgeCountOffset;
        firstEdgeIndexes[nodeCount] = this.containmentEdges.length;
        for (let nodeOrdinal = 0, edgeIndex = 0; nodeOrdinal < nodeCount; ++nodeOrdinal) {
            firstEdgeIndexes[nodeOrdinal] = edgeIndex;
            edgeIndex += nodes.getValue(nodeOrdinal * nodeFieldCount + nodeEdgeCountOffset) * edgeFieldsCount;
        }
    }
    buildRetainers() {
        const retainingNodes = this.retainingNodes;
        const retainingEdges = this.retainingEdges;
        // Index of the first retainer in the retainingNodes and retainingEdges
        // arrays. Addressed by retained node index.
        const firstRetainerIndex = this.firstRetainerIndex;
        const containmentEdges = this.containmentEdges;
        const edgeFieldsCount = this.edgeFieldsCount;
        const nodeFieldCount = this.nodeFieldCount;
        const edgeToNodeOffset = this.edgeToNodeOffset;
        const firstEdgeIndexes = this.firstEdgeIndexes;
        const nodeCount = this.nodeCount;
        for (let toNodeFieldIndex = edgeToNodeOffset, l = containmentEdges.length; toNodeFieldIndex < l; toNodeFieldIndex += edgeFieldsCount) {
            const toNodeIndex = containmentEdges.getValue(toNodeFieldIndex);
            if (toNodeIndex % nodeFieldCount) {
                throw new Error('Invalid toNodeIndex ' + toNodeIndex);
            }
            ++firstRetainerIndex[toNodeIndex / nodeFieldCount];
        }
        for (let i = 0, firstUnusedRetainerSlot = 0; i < nodeCount; i++) {
            const retainersCount = firstRetainerIndex[i];
            firstRetainerIndex[i] = firstUnusedRetainerSlot;
            retainingNodes[firstUnusedRetainerSlot] = retainersCount;
            firstUnusedRetainerSlot += retainersCount;
        }
        firstRetainerIndex[nodeCount] = retainingNodes.length;
        let nextNodeFirstEdgeIndex = firstEdgeIndexes[0];
        for (let srcNodeOrdinal = 0; srcNodeOrdinal < nodeCount; ++srcNodeOrdinal) {
            const firstEdgeIndex = nextNodeFirstEdgeIndex;
            nextNodeFirstEdgeIndex = firstEdgeIndexes[srcNodeOrdinal + 1];
            const srcNodeIndex = srcNodeOrdinal * nodeFieldCount;
            for (let edgeIndex = firstEdgeIndex; edgeIndex < nextNodeFirstEdgeIndex; edgeIndex += edgeFieldsCount) {
                const toNodeIndex = containmentEdges.getValue(edgeIndex + edgeToNodeOffset);
                if (toNodeIndex % nodeFieldCount) {
                    throw new Error('Invalid toNodeIndex ' + toNodeIndex);
                }
                const firstRetainerSlotIndex = firstRetainerIndex[toNodeIndex / nodeFieldCount];
                const nextUnusedRetainerSlotIndex = firstRetainerSlotIndex + (--retainingNodes[firstRetainerSlotIndex]);
                retainingNodes[nextUnusedRetainerSlotIndex] = srcNodeIndex;
                retainingEdges[nextUnusedRetainerSlotIndex] = edgeIndex;
            }
        }
    }
    allNodes() {
        return new HeapSnapshotNodeIterator(this.rootNode());
    }
    rootNode() {
        return this.createNode(this.rootNodeIndexInternal);
    }
    get rootNodeIndex() {
        return this.rootNodeIndexInternal;
    }
    get totalSize() {
        return this.rootNode().retainedSize();
    }
    getDominatedIndex(nodeIndex) {
        if (nodeIndex % this.nodeFieldCount) {
            throw new Error('Invalid nodeIndex: ' + nodeIndex);
        }
        return this.firstDominatedNodeIndex[nodeIndex / this.nodeFieldCount];
    }
    createFilter(nodeFilter) {
        const { minNodeId, maxNodeId, allocationNodeId, filterName } = nodeFilter;
        let filter;
        if (typeof allocationNodeId === 'number') {
            filter = this.createAllocationStackFilter(allocationNodeId);
            if (!filter) {
                throw new Error('Unable to create filter');
            }
            // @ts-ignore key can be added as a static property
            filter.key = 'AllocationNodeId: ' + allocationNodeId;
        }
        else if (typeof minNodeId === 'number' && typeof maxNodeId === 'number') {
            filter = this.createNodeIdFilter(minNodeId, maxNodeId);
            // @ts-ignore key can be added as a static property
            filter.key = 'NodeIdRange: ' + minNodeId + '..' + maxNodeId;
        }
        else if (filterName !== undefined) {
            filter = this.createNamedFilter(filterName);
            // @ts-ignore key can be added as a static property
            filter.key = 'NamedFilter: ' + filterName;
        }
        return filter;
    }
    search(searchConfig, nodeFilter) {
        const query = searchConfig.query;
        function filterString(matchedStringIndexes, string, index) {
            if (string.indexOf(query) !== -1) {
                matchedStringIndexes.add(index);
            }
            return matchedStringIndexes;
        }
        const regexp = searchConfig.isRegex ? new RegExp(query) : Platform.StringUtilities.createPlainTextSearchRegex(query, 'i');
        function filterRegexp(matchedStringIndexes, string, index) {
            if (regexp.test(string)) {
                matchedStringIndexes.add(index);
            }
            return matchedStringIndexes;
        }
        const useRegExp = searchConfig.isRegex || !searchConfig.caseSensitive;
        const stringFilter = useRegExp ? filterRegexp : filterString;
        const stringIndexes = this.strings.reduce(stringFilter, new Set());
        const filter = this.createFilter(nodeFilter);
        const nodeIds = [];
        const nodesLength = this.nodes.length;
        const nodes = this.nodes;
        const nodeNameOffset = this.nodeNameOffset;
        const nodeIdOffset = this.nodeIdOffset;
        const nodeFieldCount = this.nodeFieldCount;
        const node = this.rootNode();
        for (let nodeIndex = 0; nodeIndex < nodesLength; nodeIndex += nodeFieldCount) {
            node.nodeIndex = nodeIndex;
            if (filter && !filter(node)) {
                continue;
            }
            const name = node.name();
            if (name === node.rawName()) {
                // If the string displayed to the user matches the raw name from the
                // snapshot, then we can use the Set computed above. This avoids
                // repeated work when multiple nodes have the same name.
                if (stringIndexes.has(nodes.getValue(nodeIndex + nodeNameOffset))) {
                    nodeIds.push(nodes.getValue(nodeIndex + nodeIdOffset));
                }
            }
            else {
                // If the node is displaying a customized name, then we must perform the
                // full string search within that name here.
                if (useRegExp ? regexp.test(name) : (name.indexOf(query) !== -1)) {
                    nodeIds.push(nodes.getValue(nodeIndex + nodeIdOffset));
                }
            }
        }
        return nodeIds;
    }
    aggregatesWithFilter(nodeFilter) {
        const filter = this.createFilter(nodeFilter);
        // @ts-ignore key is added in createFilter
        const key = filter ? filter.key : 'allObjects';
        return this.getAggregatesByClassName(false, key, filter);
    }
    createNodeIdFilter(minNodeId, maxNodeId) {
        function nodeIdFilter(node) {
            const id = node.id();
            return id > minNodeId && id <= maxNodeId;
        }
        return nodeIdFilter;
    }
    createAllocationStackFilter(bottomUpAllocationNodeId) {
        if (!this.#allocationProfile) {
            throw new Error('No Allocation Profile provided');
        }
        const traceIds = this.#allocationProfile.traceIds(bottomUpAllocationNodeId);
        if (!traceIds.length) {
            return undefined;
        }
        const set = {};
        for (let i = 0; i < traceIds.length; i++) {
            set[traceIds[i]] = true;
        }
        function traceIdFilter(node) {
            return Boolean(set[node.traceNodeId()]);
        }
        return traceIdFilter;
    }
    createNamedFilter(filterName) {
        // Allocate an array with a single bit per node, which can be used by each
        // specific filter implemented below.
        const bitmap = Platform.TypedArrayUtilities.createBitVector(this.nodeCount);
        const getBit = (node) => {
            const ordinal = node.nodeIndex / this.nodeFieldCount;
            return bitmap.getBit(ordinal);
        };
        // Traverses the graph in breadth-first order with the given filter, and
        // sets the bit in `bitmap` for every visited node.
        const traverse = (filter) => {
            const distances = new Int32Array(this.nodeCount);
            for (let i = 0; i < this.nodeCount; ++i) {
                distances[i] = this.#noDistance;
            }
            const nodesToVisit = new Uint32Array(this.nodeCount);
            distances[this.rootNode().ordinal()] = 0;
            nodesToVisit[0] = this.rootNode().nodeIndex;
            const nodesToVisitLength = 1;
            this.bfs(nodesToVisit, nodesToVisitLength, distances, filter);
            for (let i = 0; i < this.nodeCount; ++i) {
                if (distances[i] !== this.#noDistance) {
                    bitmap.setBit(i);
                }
            }
        };
        const markUnreachableNodes = () => {
            for (let i = 0; i < this.nodeCount; ++i) {
                if (this.nodeDistances[i] === this.#noDistance) {
                    bitmap.setBit(i);
                }
            }
        };
        switch (filterName) {
            case 'objectsRetainedByDetachedDomNodes':
                // Traverse the graph, avoiding detached nodes.
                traverse((node, edge) => {
                    return edge.node().detachedness() !== 2 /* DOMLinkState.DETACHED */;
                });
                markUnreachableNodes();
                return (node) => !getBit(node);
            case 'objectsRetainedByConsole':
                // Traverse the graph, avoiding edges that represent globals owned by
                // the DevTools console.
                traverse((node, edge) => {
                    return !(node.isSynthetic() && edge.hasStringName() && edge.name().endsWith(' / DevTools console'));
                });
                markUnreachableNodes();
                return (node) => !getBit(node);
            case 'duplicatedStrings': {
                const stringToNodeIndexMap = new Map();
                const node = this.createNode(0);
                for (let i = 0; i < this.nodeCount; ++i) {
                    node.nodeIndex = i * this.nodeFieldCount;
                    const rawType = node.rawType();
                    if (rawType === this.nodeStringType || rawType === this.nodeConsStringType) {
                        // Check whether the cons string is already "flattened", meaning
                        // that one of its two parts is the empty string. If so, we should
                        // skip it. We don't help anyone by reporting a flattened cons
                        // string as a duplicate with its own content, since V8 controls
                        // that behavior internally.
                        if (node.isFlatConsString()) {
                            continue;
                        }
                        const name = node.name();
                        const alreadyVisitedNodeIndex = stringToNodeIndexMap.get(name);
                        if (alreadyVisitedNodeIndex === undefined) {
                            stringToNodeIndexMap.set(name, node.nodeIndex);
                        }
                        else {
                            bitmap.setBit(alreadyVisitedNodeIndex / this.nodeFieldCount);
                            bitmap.setBit(node.nodeIndex / this.nodeFieldCount);
                        }
                    }
                }
                return getBit;
            }
        }
        throw new Error('Invalid filter name');
    }
    getAggregatesByClassName(sortedIndexes, key, filter) {
        const aggregates = this.buildAggregates(filter);
        let aggregatesByClassName;
        if (key && this.#aggregates[key]) {
            aggregatesByClassName = this.#aggregates[key];
        }
        else {
            this.calculateClassesRetainedSize(aggregates.aggregatesByClassIndex, filter);
            aggregatesByClassName = aggregates.aggregatesByClassName;
            if (key) {
                this.#aggregates[key] = aggregatesByClassName;
            }
        }
        if (sortedIndexes && (!key || !this.#aggregatesSortedFlags[key])) {
            this.sortAggregateIndexes(aggregatesByClassName);
            if (key) {
                this.#aggregatesSortedFlags[key] = sortedIndexes;
            }
        }
        return aggregatesByClassName;
    }
    allocationTracesTops() {
        return this.#allocationProfile.serializeTraceTops();
    }
    allocationNodeCallers(nodeId) {
        return this.#allocationProfile.serializeCallers(nodeId);
    }
    allocationStack(nodeIndex) {
        const node = this.createNode(nodeIndex);
        const allocationNodeId = node.traceNodeId();
        if (!allocationNodeId) {
            return null;
        }
        return this.#allocationProfile.serializeAllocationStack(allocationNodeId);
    }
    aggregatesForDiff(interfaceDefinitions) {
        if (this.#aggregatesForDiffInternal?.interfaceDefinitions === interfaceDefinitions) {
            return this.#aggregatesForDiffInternal.aggregates;
        }
        // Temporarily apply the interface definitions from the other snapshot.
        const originalInterfaceDefinitions = this.#interfaceDefinitions;
        this.applyInterfaceDefinitions(JSON.parse(interfaceDefinitions));
        const aggregatesByClassName = this.getAggregatesByClassName(true, 'allObjects');
        this.applyInterfaceDefinitions(originalInterfaceDefinitions ?? []);
        const result = {};
        const node = this.createNode();
        for (const className in aggregatesByClassName) {
            const aggregate = aggregatesByClassName[className];
            const indexes = aggregate.idxs;
            const ids = new Array(indexes.length);
            const selfSizes = new Array(indexes.length);
            for (let i = 0; i < indexes.length; i++) {
                node.nodeIndex = indexes[i];
                ids[i] = node.id();
                selfSizes[i] = node.selfSize();
            }
            result[className] = { indexes: indexes, ids: ids, selfSizes: selfSizes };
        }
        this.#aggregatesForDiffInternal = { interfaceDefinitions, aggregates: result };
        return result;
    }
    isUserRoot(_node) {
        return true;
    }
    calculateShallowSizes() {
    }
    calculateDistances(isForRetainersView, filter) {
        const nodeCount = this.nodeCount;
        if (isForRetainersView) {
            const originalFilter = filter;
            filter = (node, edge) => {
                return !this.#ignoredNodesInRetainersView.has(edge.nodeIndex()) &&
                    (!originalFilter || originalFilter(node, edge));
            };
            if (this.#nodeDistancesForRetainersView === undefined) {
                this.#nodeDistancesForRetainersView = new Int32Array(nodeCount);
            }
        }
        const distances = isForRetainersView ? this.#nodeDistancesForRetainersView : this.nodeDistances;
        const noDistance = this.#noDistance;
        for (let i = 0; i < nodeCount; ++i) {
            distances[i] = noDistance;
        }
        const nodesToVisit = new Uint32Array(this.nodeCount);
        let nodesToVisitLength = 0;
        // BFS for user root objects.
        for (let iter = this.rootNode().edges(); iter.hasNext(); iter.next()) {
            const node = iter.edge.node();
            if (this.isUserRoot(node)) {
                distances[node.ordinal()] = 1;
                nodesToVisit[nodesToVisitLength++] = node.nodeIndex;
            }
        }
        this.bfs(nodesToVisit, nodesToVisitLength, distances, filter);
        // BFS for objects not reached from user roots.
        distances[this.rootNode().ordinal()] =
            nodesToVisitLength > 0 ? HeapSnapshotModel.HeapSnapshotModel.baseSystemDistance : 0;
        nodesToVisit[0] = this.rootNode().nodeIndex;
        nodesToVisitLength = 1;
        this.bfs(nodesToVisit, nodesToVisitLength, distances, filter);
    }
    bfs(nodesToVisit, nodesToVisitLength, distances, filter) {
        // Preload fields into local variables for better performance.
        const edgeFieldsCount = this.edgeFieldsCount;
        const nodeFieldCount = this.nodeFieldCount;
        const containmentEdges = this.containmentEdges;
        const firstEdgeIndexes = this.firstEdgeIndexes;
        const edgeToNodeOffset = this.edgeToNodeOffset;
        const edgeTypeOffset = this.edgeTypeOffset;
        const nodeCount = this.nodeCount;
        const edgeWeakType = this.edgeWeakType;
        const noDistance = this.#noDistance;
        let index = 0;
        const edge = this.createEdge(0);
        const node = this.createNode(0);
        while (index < nodesToVisitLength) {
            const nodeIndex = nodesToVisit[index++]; // shift generates too much garbage.
            const nodeOrdinal = nodeIndex / nodeFieldCount;
            const distance = distances[nodeOrdinal] + 1;
            const firstEdgeIndex = firstEdgeIndexes[nodeOrdinal];
            const edgesEnd = firstEdgeIndexes[nodeOrdinal + 1];
            node.nodeIndex = nodeIndex;
            for (let edgeIndex = firstEdgeIndex; edgeIndex < edgesEnd; edgeIndex += edgeFieldsCount) {
                const edgeType = containmentEdges.getValue(edgeIndex + edgeTypeOffset);
                if (edgeType === edgeWeakType) {
                    continue;
                }
                const childNodeIndex = containmentEdges.getValue(edgeIndex + edgeToNodeOffset);
                const childNodeOrdinal = childNodeIndex / nodeFieldCount;
                if (distances[childNodeOrdinal] !== noDistance) {
                    continue;
                }
                edge.edgeIndex = edgeIndex;
                if (filter && !filter(node, edge)) {
                    continue;
                }
                distances[childNodeOrdinal] = distance;
                nodesToVisit[nodesToVisitLength++] = childNodeIndex;
            }
        }
        if (nodesToVisitLength > nodeCount) {
            throw new Error('BFS failed. Nodes to visit (' + nodesToVisitLength + ') is more than nodes count (' + nodeCount + ')');
        }
    }
    buildAggregates(filter) {
        const aggregates = {};
        const aggregatesByClassName = {};
        const classIndexes = [];
        const nodes = this.nodes;
        const nodesLength = nodes.length;
        const nodeFieldCount = this.nodeFieldCount;
        const selfSizeOffset = this.nodeSelfSizeOffset;
        const node = this.rootNode();
        const nodeDistances = this.nodeDistances;
        for (let nodeIndex = 0; nodeIndex < nodesLength; nodeIndex += nodeFieldCount) {
            node.nodeIndex = nodeIndex;
            if (filter && !filter(node)) {
                continue;
            }
            const selfSize = nodes.getValue(nodeIndex + selfSizeOffset);
            if (!selfSize) {
                continue;
            }
            const classIndex = node.classIndex();
            const nodeOrdinal = nodeIndex / nodeFieldCount;
            const distance = nodeDistances[nodeOrdinal];
            if (!(classIndex in aggregates)) {
                const nodeType = node.type();
                const nameMatters = nodeType === 'object' || nodeType === 'native';
                const value = {
                    count: 1,
                    distance: distance,
                    self: selfSize,
                    maxRet: 0,
                    type: nodeType,
                    name: nameMatters ? node.className() : null,
                    idxs: [nodeIndex],
                };
                aggregates[classIndex] = value;
                classIndexes.push(classIndex);
                aggregatesByClassName[node.className()] = value;
            }
            else {
                const clss = aggregates[classIndex];
                if (!clss) {
                    continue;
                }
                clss.distance = Math.min(clss.distance, distance);
                ++clss.count;
                clss.self += selfSize;
                clss.idxs.push(nodeIndex);
            }
        }
        // Shave off provisionally allocated space.
        for (let i = 0, l = classIndexes.length; i < l; ++i) {
            const classIndex = classIndexes[i];
            const classIndexValues = aggregates[classIndex];
            if (!classIndexValues) {
                continue;
            }
            classIndexValues.idxs = classIndexValues.idxs.slice();
        }
        return { aggregatesByClassName: aggregatesByClassName, aggregatesByClassIndex: aggregates };
    }
    calculateClassesRetainedSize(aggregates, filter) {
        const rootNodeIndex = this.rootNodeIndexInternal;
        const node = this.createNode(rootNodeIndex);
        const list = [rootNodeIndex];
        const sizes = [-1];
        const classes = [];
        const seenClassNameIndexes = new Map();
        const nodeFieldCount = this.nodeFieldCount;
        const dominatedNodes = this.dominatedNodes;
        const firstDominatedNodeIndex = this.firstDominatedNodeIndex;
        while (list.length) {
            const nodeIndex = list.pop();
            node.nodeIndex = nodeIndex;
            let classIndex = node.classIndex();
            const seen = Boolean(seenClassNameIndexes.get(classIndex));
            const nodeOrdinal = nodeIndex / nodeFieldCount;
            const dominatedIndexFrom = firstDominatedNodeIndex[nodeOrdinal];
            const dominatedIndexTo = firstDominatedNodeIndex[nodeOrdinal + 1];
            if (!seen && (!filter || filter(node)) && node.selfSize()) {
                aggregates[classIndex].maxRet += node.retainedSize();
                if (dominatedIndexFrom !== dominatedIndexTo) {
                    seenClassNameIndexes.set(classIndex, true);
                    sizes.push(list.length);
                    classes.push(classIndex);
                }
            }
            for (let i = dominatedIndexFrom; i < dominatedIndexTo; i++) {
                list.push(dominatedNodes[i]);
            }
            const l = list.length;
            while (sizes[sizes.length - 1] === l) {
                sizes.pop();
                classIndex = classes.pop();
                seenClassNameIndexes.set(classIndex, false);
            }
        }
    }
    sortAggregateIndexes(aggregates) {
        const nodeA = this.createNode();
        const nodeB = this.createNode();
        for (const clss in aggregates) {
            aggregates[clss].idxs.sort((idxA, idxB) => {
                nodeA.nodeIndex = idxA;
                nodeB.nodeIndex = idxB;
                return nodeA.id() < nodeB.id() ? -1 : 1;
            });
        }
    }
    tryParseWeakMapEdgeName(edgeNameIndex) {
        const previousResult = this.#edgeNamesThatAreNotWeakMaps.getBit(edgeNameIndex);
        if (previousResult) {
            return undefined;
        }
        const edgeName = this.strings[edgeNameIndex];
        const ephemeronNameRegex = /^\d+(?<duplicatedPart> \/ part of key \(.*? @\d+\) -> value \(.*? @\d+\) pair in WeakMap \(table @(?<tableId>\d+)\))$/;
        const match = edgeName.match(ephemeronNameRegex);
        if (!match) {
            this.#edgeNamesThatAreNotWeakMaps.setBit(edgeNameIndex);
            return undefined;
        }
        return match.groups;
    }
    computeIsEssentialEdge(nodeIndex, edgeIndex, userObjectsMapAndFlag) {
        const edgeType = this.containmentEdges.getValue(edgeIndex + this.edgeTypeOffset);
        // Values in WeakMaps are retained by the key and table together. Removing
        // either the key or the table would be sufficient to remove the edge from
        // the other one, so we needn't use both of those edges when computing
        // dominators. We've found that the edge from the key generally produces
        // more useful results, so here we skip the edge from the table.
        if (edgeType === this.edgeInternalType) {
            const edgeNameIndex = this.containmentEdges.getValue(edgeIndex + this.edgeNameOffset);
            const match = this.tryParseWeakMapEdgeName(edgeNameIndex);
            if (match) {
                const nodeId = this.nodes.getValue(nodeIndex + this.nodeIdOffset);
                if (nodeId === parseInt(match.tableId, 10)) {
                    return false;
                }
            }
        }
        // Weak edges never retain anything.
        if (edgeType === this.edgeWeakType) {
            return false;
        }
        if (nodeIndex !== this.rootNodeIndex) {
            // Shortcuts at the root node have special meaning of marking user global objects.
            if (edgeType === this.edgeShortcutType) {
                return false;
            }
            const flags = userObjectsMapAndFlag ? userObjectsMapAndFlag.map : null;
            const userObjectFlag = userObjectsMapAndFlag ? userObjectsMapAndFlag.flag : 0;
            const nodeOrdinal = nodeIndex / this.nodeFieldCount;
            const childNodeIndex = this.containmentEdges.getValue(edgeIndex + this.edgeToNodeOffset);
            const childNodeOrdinal = childNodeIndex / this.nodeFieldCount;
            const nodeFlag = !flags || (flags[nodeOrdinal] & userObjectFlag);
            const childNodeFlag = !flags || (flags[childNodeOrdinal] & userObjectFlag);
            // We are skipping the edges from non-page-owned nodes to page-owned nodes.
            // Otherwise the dominators for the objects that also were retained by debugger would be affected.
            if (childNodeFlag && !nodeFlag) {
                return false;
            }
        }
        return true;
    }
    /**
     * The function checks whether the edge should be considered during building
     * postorder iterator and dominator tree.
     */
    isEssentialEdge(edgeIndex) {
        let essentialEdges = this.#essentialEdges;
        if (!essentialEdges) {
            essentialEdges = this.#essentialEdges = Platform.TypedArrayUtilities.createBitVector(this.#edgeCount);
            const { nodes, nodeFieldCount, edgeFieldsCount } = this;
            const userObjectsMapAndFlag = this.userObjectsMapAndFlag();
            const endNodeIndex = nodes.length;
            const node = this.createNode(0);
            for (let nodeIndex = 0; nodeIndex < endNodeIndex; nodeIndex += nodeFieldCount) {
                node.nodeIndex = nodeIndex;
                const edgeIndexesEnd = node.edgeIndexesEnd();
                for (let edgeIndex = node.edgeIndexesStart(); edgeIndex < edgeIndexesEnd; edgeIndex += edgeFieldsCount) {
                    if (this.computeIsEssentialEdge(nodeIndex, edgeIndex, userObjectsMapAndFlag)) {
                        essentialEdges.setBit(edgeIndex / edgeFieldsCount);
                    }
                }
            }
        }
        return essentialEdges.getBit(edgeIndex / this.edgeFieldsCount);
    }
    buildPostOrderIndex() {
        const nodeFieldCount = this.nodeFieldCount;
        const nodeCount = this.nodeCount;
        const rootNodeOrdinal = this.rootNodeIndexInternal / nodeFieldCount;
        const edgeFieldsCount = this.edgeFieldsCount;
        const edgeToNodeOffset = this.edgeToNodeOffset;
        const firstEdgeIndexes = this.firstEdgeIndexes;
        const containmentEdges = this.containmentEdges;
        const stackNodes = new Uint32Array(nodeCount);
        const stackCurrentEdge = new Uint32Array(nodeCount);
        const postOrderIndex2NodeOrdinal = new Uint32Array(nodeCount);
        const nodeOrdinal2PostOrderIndex = new Uint32Array(nodeCount);
        const visited = new Uint8Array(nodeCount);
        let postOrderIndex = 0;
        let stackTop = 0;
        stackNodes[0] = rootNodeOrdinal;
        stackCurrentEdge[0] = firstEdgeIndexes[rootNodeOrdinal];
        visited[rootNodeOrdinal] = 1;
        let iteration = 0;
        while (true) {
            ++iteration;
            while (stackTop >= 0) {
                const nodeOrdinal = stackNodes[stackTop];
                const edgeIndex = stackCurrentEdge[stackTop];
                const edgesEnd = firstEdgeIndexes[nodeOrdinal + 1];
                if (edgeIndex < edgesEnd) {
                    stackCurrentEdge[stackTop] += edgeFieldsCount;
                    if (!this.isEssentialEdge(edgeIndex)) {
                        continue;
                    }
                    const childNodeIndex = containmentEdges.getValue(edgeIndex + edgeToNodeOffset);
                    const childNodeOrdinal = childNodeIndex / nodeFieldCount;
                    if (visited[childNodeOrdinal]) {
                        continue;
                    }
                    ++stackTop;
                    stackNodes[stackTop] = childNodeOrdinal;
                    stackCurrentEdge[stackTop] = firstEdgeIndexes[childNodeOrdinal];
                    visited[childNodeOrdinal] = 1;
                }
                else {
                    // Done with all the node children
                    nodeOrdinal2PostOrderIndex[nodeOrdinal] = postOrderIndex;
                    postOrderIndex2NodeOrdinal[postOrderIndex++] = nodeOrdinal;
                    --stackTop;
                }
            }
            if (postOrderIndex === nodeCount || iteration > 1) {
                break;
            }
            const errors = new HeapSnapshotProblemReport(`Heap snapshot: ${nodeCount - postOrderIndex} nodes are unreachable from the root. Following nodes have only weak retainers:`);
            const dumpNode = this.rootNode();
            // Remove root from the result (last node in the array) and put it at the bottom of the stack so that it is
            // visited after all orphan nodes and their subgraphs.
            --postOrderIndex;
            stackTop = 0;
            stackNodes[0] = rootNodeOrdinal;
            stackCurrentEdge[0] = firstEdgeIndexes[rootNodeOrdinal + 1]; // no need to reiterate its edges
            for (let i = 0; i < nodeCount; ++i) {
                if (visited[i] || !this.hasOnlyWeakRetainers(i)) {
                    continue;
                }
                // Add all nodes that have only weak retainers to traverse their subgraphs.
                stackNodes[++stackTop] = i;
                stackCurrentEdge[stackTop] = firstEdgeIndexes[i];
                visited[i] = 1;
                dumpNode.nodeIndex = i * nodeFieldCount;
                const retainers = [];
                for (let it = dumpNode.retainers(); it.hasNext(); it.next()) {
                    retainers.push(`${it.item().node().name()}@${it.item().node().id()}.${it.item().name()}`);
                }
                errors.addError(`${dumpNode.name()} @${dumpNode.id()}  weak retainers: ${retainers.join(', ')}`);
            }
            console.warn(errors.toString());
        }
        // If we already processed all orphan nodes that have only weak retainers and still have some orphans...
        if (postOrderIndex !== nodeCount) {
            const errors = new HeapSnapshotProblemReport('Still found ' + (nodeCount - postOrderIndex) + ' unreachable nodes in heap snapshot:');
            const dumpNode = this.rootNode();
            // Remove root from the result (last node in the array) and put it at the bottom of the stack so that it is
            // visited after all orphan nodes and their subgraphs.
            --postOrderIndex;
            for (let i = 0; i < nodeCount; ++i) {
                if (visited[i]) {
                    continue;
                }
                dumpNode.nodeIndex = i * nodeFieldCount;
                errors.addError(dumpNode.name() + ' @' + dumpNode.id());
                // Fix it by giving the node a postorder index anyway.
                nodeOrdinal2PostOrderIndex[i] = postOrderIndex;
                postOrderIndex2NodeOrdinal[postOrderIndex++] = i;
            }
            nodeOrdinal2PostOrderIndex[rootNodeOrdinal] = postOrderIndex;
            postOrderIndex2NodeOrdinal[postOrderIndex++] = rootNodeOrdinal;
            console.warn(errors.toString());
        }
        return {
            postOrderIndex2NodeOrdinal: postOrderIndex2NodeOrdinal,
            nodeOrdinal2PostOrderIndex: nodeOrdinal2PostOrderIndex,
        };
    }
    hasOnlyWeakRetainers(nodeOrdinal) {
        const retainingEdges = this.retainingEdges;
        const beginRetainerIndex = this.firstRetainerIndex[nodeOrdinal];
        const endRetainerIndex = this.firstRetainerIndex[nodeOrdinal + 1];
        for (let retainerIndex = beginRetainerIndex; retainerIndex < endRetainerIndex; ++retainerIndex) {
            const retainerEdgeIndex = retainingEdges[retainerIndex];
            if (this.isEssentialEdge(retainerEdgeIndex)) {
                return false;
            }
        }
        return true;
    }
    // The algorithm is based on the article:
    // K. Cooper, T. Harvey and K. Kennedy "A Simple, Fast Dominance Algorithm"
    // Softw. Pract. Exper. 4 (2001), pp. 1-10.
    buildDominatorTree(postOrderIndex2NodeOrdinal, nodeOrdinal2PostOrderIndex) {
        const nodeFieldCount = this.nodeFieldCount;
        const firstRetainerIndex = this.firstRetainerIndex;
        const retainingNodes = this.retainingNodes;
        const retainingEdges = this.retainingEdges;
        const edgeFieldsCount = this.edgeFieldsCount;
        const edgeToNodeOffset = this.edgeToNodeOffset;
        const firstEdgeIndexes = this.firstEdgeIndexes;
        const containmentEdges = this.containmentEdges;
        const nodesCount = postOrderIndex2NodeOrdinal.length;
        const rootPostOrderedIndex = nodesCount - 1;
        const noEntry = nodesCount;
        const dominators = new Uint32Array(nodesCount);
        for (let i = 0; i < rootPostOrderedIndex; ++i) {
            dominators[i] = noEntry;
        }
        dominators[rootPostOrderedIndex] = rootPostOrderedIndex;
        // The affected array is used to mark entries which dominators have to be
        // recalculated because of changes in their retainers. This is just a
        // heuristic to guide the fixpoint algorithm below so that it can visit
        // nodes that are more likely to need modification; see crbug.com/361372448
        // for an example where visiting only affected nodes is insufficient.
        const affected = Platform.TypedArrayUtilities.createBitVector(nodesCount);
        let nodeOrdinal;
        // Time wasters are nodes with lots of predecessors which didn't change the
        // last time we visited them. We'll avoid marking such nodes as affected.
        const timeWasters = Platform.TypedArrayUtilities.createBitVector(nodesCount);
        { // Mark the root direct children as affected.
            nodeOrdinal = this.rootNodeIndexInternal / nodeFieldCount;
            const endEdgeIndex = firstEdgeIndexes[nodeOrdinal + 1];
            for (let edgeIndex = firstEdgeIndexes[nodeOrdinal]; edgeIndex < endEdgeIndex; edgeIndex += edgeFieldsCount) {
                if (!this.isEssentialEdge(edgeIndex)) {
                    continue;
                }
                const childNodeOrdinal = containmentEdges.getValue(edgeIndex + edgeToNodeOffset) / nodeFieldCount;
                affected.setBit(nodeOrdinal2PostOrderIndex[childNodeOrdinal]);
            }
        }
        let changed = true;
        let shouldVisitEveryNode = false;
        while (changed || !shouldVisitEveryNode) {
            // The original Cooper-Harvey-Kennedy algorithm visits every node on every traversal,
            // but that is far too expensive for the graph shapes encountered in heap snapshots.
            // Instead, we use the `affected` bitvector to guide iteration most of the time, and
            // only do a full traversal if the previous bitvector-based traversal found nothing
            // to change. The order in which nodes are visited doesn't matter for correctness.
            shouldVisitEveryNode = !changed;
            function getPrevious(postOrderIndex) {
                return shouldVisitEveryNode ? postOrderIndex - 1 : affected.previous(postOrderIndex);
            }
            changed = false;
            for (let postOrderIndex = getPrevious(rootPostOrderedIndex); postOrderIndex >= 0; postOrderIndex = getPrevious(postOrderIndex)) {
                affected.clearBit(postOrderIndex);
                // If dominator of the entry has already been set to root,
                // then it can't propagate any further.
                if (dominators[postOrderIndex] === rootPostOrderedIndex) {
                    continue;
                }
                nodeOrdinal = postOrderIndex2NodeOrdinal[postOrderIndex];
                let newDominatorIndex = noEntry;
                const beginRetainerIndex = firstRetainerIndex[nodeOrdinal];
                const endRetainerIndex = firstRetainerIndex[nodeOrdinal + 1];
                const edgeCount = endRetainerIndex - beginRetainerIndex;
                let orphanNode = true;
                for (let retainerIndex = beginRetainerIndex; retainerIndex < endRetainerIndex; ++retainerIndex) {
                    const retainerEdgeIndex = retainingEdges[retainerIndex];
                    const retainerNodeIndex = retainingNodes[retainerIndex];
                    if (!this.isEssentialEdge(retainerEdgeIndex)) {
                        continue;
                    }
                    orphanNode = false;
                    const retainerNodeOrdinal = retainerNodeIndex / nodeFieldCount;
                    let retainerPostOrderIndex = nodeOrdinal2PostOrderIndex[retainerNodeOrdinal];
                    if (dominators[retainerPostOrderIndex] !== noEntry) {
                        if (newDominatorIndex === noEntry) {
                            newDominatorIndex = retainerPostOrderIndex;
                        }
                        else {
                            while (retainerPostOrderIndex !== newDominatorIndex) {
                                while (retainerPostOrderIndex < newDominatorIndex) {
                                    retainerPostOrderIndex = dominators[retainerPostOrderIndex];
                                }
                                while (newDominatorIndex < retainerPostOrderIndex) {
                                    newDominatorIndex = dominators[newDominatorIndex];
                                }
                            }
                        }
                        // If item has already reached the root, it doesn't make sense
                        // to check other retainers.
                        if (newDominatorIndex === rootPostOrderedIndex) {
                            break;
                        }
                    }
                }
                // Make root dominator of orphans.
                if (orphanNode) {
                    newDominatorIndex = rootPostOrderedIndex;
                }
                if (newDominatorIndex !== noEntry && dominators[postOrderIndex] !== newDominatorIndex) {
                    timeWasters.clearBit(postOrderIndex); // It's not a waste of time if we changed something.
                    dominators[postOrderIndex] = newDominatorIndex;
                    changed = true;
                    nodeOrdinal = postOrderIndex2NodeOrdinal[postOrderIndex];
                    const beginEdgeToNodeFieldIndex = firstEdgeIndexes[nodeOrdinal] + edgeToNodeOffset;
                    const endEdgeToNodeFieldIndex = firstEdgeIndexes[nodeOrdinal + 1];
                    for (let toNodeFieldIndex = beginEdgeToNodeFieldIndex; toNodeFieldIndex < endEdgeToNodeFieldIndex; toNodeFieldIndex += edgeFieldsCount) {
                        const childNodeOrdinal = containmentEdges.getValue(toNodeFieldIndex) / nodeFieldCount;
                        const childPostOrderIndex = nodeOrdinal2PostOrderIndex[childNodeOrdinal];
                        // Mark the child node as affected, unless it's unlikely to be beneficial.
                        if (childPostOrderIndex !== postOrderIndex && !timeWasters.getBit(childPostOrderIndex)) {
                            affected.setBit(childPostOrderIndex);
                        }
                    }
                }
                else if (edgeCount > 1000) {
                    timeWasters.setBit(postOrderIndex);
                }
            }
        }
        const dominatorsTree = new Uint32Array(nodesCount);
        for (let postOrderIndex = 0, l = dominators.length; postOrderIndex < l; ++postOrderIndex) {
            nodeOrdinal = postOrderIndex2NodeOrdinal[postOrderIndex];
            dominatorsTree[nodeOrdinal] = postOrderIndex2NodeOrdinal[dominators[postOrderIndex]];
        }
        return dominatorsTree;
    }
    calculateRetainedSizes(postOrderIndex2NodeOrdinal) {
        const nodeCount = this.nodeCount;
        const nodes = this.nodes;
        const nodeSelfSizeOffset = this.nodeSelfSizeOffset;
        const nodeFieldCount = this.nodeFieldCount;
        const dominatorsTree = this.dominatorsTree;
        const retainedSizes = this.retainedSizes;
        for (let nodeOrdinal = 0; nodeOrdinal < nodeCount; ++nodeOrdinal) {
            retainedSizes[nodeOrdinal] = nodes.getValue(nodeOrdinal * nodeFieldCount + nodeSelfSizeOffset);
        }
        // Propagate retained sizes for each node excluding root.
        for (let postOrderIndex = 0; postOrderIndex < nodeCount - 1; ++postOrderIndex) {
            const nodeOrdinal = postOrderIndex2NodeOrdinal[postOrderIndex];
            const dominatorOrdinal = dominatorsTree[nodeOrdinal];
            retainedSizes[dominatorOrdinal] += retainedSizes[nodeOrdinal];
        }
    }
    buildDominatedNodes() {
        // Builds up two arrays:
        //  - "dominatedNodes" is a continuous array, where each node owns an
        //    interval (can be empty) with corresponding dominated nodes.
        //  - "indexArray" is an array of indexes in the "dominatedNodes"
        //    with the same positions as in the _nodeIndex.
        const indexArray = this.firstDominatedNodeIndex;
        // All nodes except the root have dominators.
        const dominatedNodes = this.dominatedNodes;
        // Count the number of dominated nodes for each node. Skip the root (node at
        // index 0) as it is the only node that dominates itself.
        const nodeFieldCount = this.nodeFieldCount;
        const dominatorsTree = this.dominatorsTree;
        let fromNodeOrdinal = 0;
        let toNodeOrdinal = this.nodeCount;
        const rootNodeOrdinal = this.rootNodeIndexInternal / nodeFieldCount;
        if (rootNodeOrdinal === fromNodeOrdinal) {
            fromNodeOrdinal = 1;
        }
        else if (rootNodeOrdinal === toNodeOrdinal - 1) {
            toNodeOrdinal = toNodeOrdinal - 1;
        }
        else {
            throw new Error('Root node is expected to be either first or last');
        }
        for (let nodeOrdinal = fromNodeOrdinal; nodeOrdinal < toNodeOrdinal; ++nodeOrdinal) {
            ++indexArray[dominatorsTree[nodeOrdinal]];
        }
        // Put in the first slot of each dominatedNodes slice the count of entries
        // that will be filled.
        let firstDominatedNodeIndex = 0;
        for (let i = 0, l = this.nodeCount; i < l; ++i) {
            const dominatedCount = dominatedNodes[firstDominatedNodeIndex] = indexArray[i];
            indexArray[i] = firstDominatedNodeIndex;
            firstDominatedNodeIndex += dominatedCount;
        }
        indexArray[this.nodeCount] = dominatedNodes.length;
        // Fill up the dominatedNodes array with indexes of dominated nodes. Skip the root (node at
        // index 0) as it is the only node that dominates itself.
        for (let nodeOrdinal = fromNodeOrdinal; nodeOrdinal < toNodeOrdinal; ++nodeOrdinal) {
            const dominatorOrdinal = dominatorsTree[nodeOrdinal];
            let dominatedRefIndex = indexArray[dominatorOrdinal];
            dominatedRefIndex += (--dominatedNodes[dominatedRefIndex]);
            dominatedNodes[dominatedRefIndex] = nodeOrdinal * nodeFieldCount;
        }
    }
    calculateObjectNames() {
        const { nodes, nodeCount, nodeNameOffset, nodeNativeType, nodeHiddenType, nodeObjectType, nodeCodeType, nodeClosureType, nodeRegExpType, } = this;
        // If the snapshot doesn't contain a detachedness field in each node, then
        // allocate a separate array so there is somewhere to store the class index.
        if (this.nodeDetachednessAndClassIndexOffset === -1) {
            this.detachednessAndClassIndexArray = new Uint32Array(nodeCount);
        }
        // We'll add some new values to the `strings` array during the processing below.
        // This map lets us easily find the index for each added string.
        const stringTable = new Map();
        const getIndexForString = (s) => {
            let index = stringTable.get(s);
            if (index === undefined) {
                index = this.addString(s);
                stringTable.set(s, index);
            }
            return index;
        };
        const hiddenClassIndex = getIndexForString('(system)');
        const codeClassIndex = getIndexForString('(compiled code)');
        const functionClassIndex = getIndexForString('Function');
        const regExpClassIndex = getIndexForString('RegExp');
        function getNodeClassIndex(node) {
            switch (node.rawType()) {
                case nodeHiddenType:
                    return hiddenClassIndex;
                case nodeObjectType:
                case nodeNativeType: {
                    let name = node.rawName();
                    // If the node name is (for example) '<div id="a">', then the class
                    // name should be just '<div>'. If the node name is already short
                    // enough, like '<div>', we must still call getIndexForString on that
                    // name, because the names added by getIndexForString are not
                    // deduplicated with preexisting strings, and we want all objects with
                    // class name '<div>' to refer to that class name via the same index.
                    // Otherwise, object categorization doesn't work.
                    if (name.startsWith('<')) {
                        const firstSpace = name.indexOf(' ');
                        if (firstSpace !== -1) {
                            name = name.substring(0, firstSpace) + '>';
                        }
                        return getIndexForString(name);
                    }
                    if (name.startsWith('Detached <')) {
                        const firstSpace = name.indexOf(' ', 10);
                        if (firstSpace !== -1) {
                            name = name.substring(0, firstSpace) + '>';
                        }
                        return getIndexForString(name);
                    }
                    // Avoid getIndexForString here; the class name index should match the name index.
                    return nodes.getValue(node.nodeIndex + nodeNameOffset);
                }
                case nodeCodeType:
                    return codeClassIndex;
                case nodeClosureType:
                    return functionClassIndex;
                case nodeRegExpType:
                    return regExpClassIndex;
                default:
                    return getIndexForString('(' + node.type() + ')');
            }
        }
        const node = this.createNode(0);
        for (let i = 0; i < nodeCount; ++i) {
            node.setClassIndex(getNodeClassIndex(node));
            node.nodeIndex = node.nextNodeIndex();
        }
    }
    interfaceDefinitions() {
        return JSON.stringify(this.#interfaceDefinitions ?? []);
    }
    isPlainJSObject(node) {
        return node.rawType() === this.nodeObjectType && node.rawName() === 'Object';
    }
    inferInterfaceDefinitions() {
        const { edgePropertyType } = this;
        // A map from interface names to their definitions.
        const candidates = new Map();
        for (let it = this.allNodes(); it.hasNext(); it.next()) {
            const node = it.item();
            if (!this.isPlainJSObject(node)) {
                continue;
            }
            let interfaceName = '{';
            const properties = [];
            for (let edgeIt = node.edges(); edgeIt.hasNext(); edgeIt.next()) {
                const edge = edgeIt.item();
                const edgeName = edge.name();
                if (edge.rawType() !== edgePropertyType || edgeName === '__proto__') {
                    continue;
                }
                const formattedEdgeName = JSHeapSnapshotNode.formatPropertyName(edgeName);
                if (interfaceName.length > MIN_INTERFACE_PROPERTY_COUNT &&
                    interfaceName.length + formattedEdgeName.length > MAX_INTERFACE_NAME_LENGTH) {
                    break; // The interface name is getting too long.
                }
                if (interfaceName.length !== 1) {
                    interfaceName += ', ';
                }
                interfaceName += formattedEdgeName;
                properties.push(edgeName);
            }
            // The empty interface is not a very meaningful, and can be sort of misleading
            // since someone might incorrectly interpret it as objects with no properties.
            if (properties.length === 0) {
                continue;
            }
            interfaceName += '}';
            const candidate = candidates.get(interfaceName);
            if (candidate) {
                ++candidate.count;
            }
            else {
                candidates.set(interfaceName, { name: interfaceName, properties, count: 1 });
            }
        }
        // Next, sort the candidates and select the most popular ones. It's possible that
        // some candidates represent the same properties in different orders, but that's
        // okay: by sorting here, we ensure that the most popular ordering appears first
        // in the result list, and the rules for applying interface definitions will prefer
        // the first matching definition if multiple matches contain the same properties.
        const sortedCandidates = Array.from(candidates.values());
        sortedCandidates.sort((a, b) => b.count - a.count);
        const result = [];
        const maxResultSize = Math.min(sortedCandidates.length, MAX_INTERFACE_COUNT);
        for (let i = 0; i < maxResultSize; ++i) {
            const candidate = sortedCandidates[i];
            if (candidate.count < MIN_OBJECT_COUNT_PER_INTERFACE) {
                break;
            }
            result.push(candidate);
        }
        return result;
    }
    applyInterfaceDefinitions(definitions) {
        const { edgePropertyType } = this;
        this.#interfaceDefinitions = definitions;
        // Any computed aggregate data will be wrong after recategorization, so clear it.
        this.#aggregates = {};
        this.#aggregatesSortedFlags = {};
        function selectBetterMatch(a, b) {
            if (!b || a.propertyCount > b.propertyCount) {
                return a;
            }
            if (b.propertyCount > a.propertyCount) {
                return b;
            }
            return a.index <= b.index ? a : b;
        }
        // The root node of the tree.
        const propertyTree = {
            next: new Map(),
            matchInfo: null,
            greatestNext: null,
        };
        // Build up the property tree.
        for (let interfaceIndex = 0; interfaceIndex < definitions.length; ++interfaceIndex) {
            const definition = definitions[interfaceIndex];
            const properties = definition.properties.toSorted();
            let currentNode = propertyTree;
            for (const property of properties) {
                const nextMap = currentNode.next;
                let nextNode = nextMap.get(property);
                if (!nextNode) {
                    nextNode = {
                        next: new Map(),
                        matchInfo: null,
                        greatestNext: null,
                    };
                    nextMap.set(property, nextNode);
                    if (currentNode.greatestNext === null || currentNode.greatestNext < property) {
                        currentNode.greatestNext = property;
                    }
                }
                currentNode = nextNode;
            }
            // Only set matchInfo on this node if it wasn't already set, to ensure that
            // interfaces defined earlier in the list have priority.
            if (!currentNode.matchInfo) {
                currentNode.matchInfo = {
                    name: definition.name,
                    propertyCount: properties.length,
                    index: interfaceIndex,
                };
            }
        }
        // The fallback match for objects which don't match any defined interface.
        const initialMatch = {
            name: 'Object',
            propertyCount: 0,
            index: Infinity,
        };
        // Iterate all nodes and check whether they match a named interface, using
        // the tree constructed above. Then update the class name for each node.
        for (let it = this.allNodes(); it.hasNext(); it.next()) {
            const node = it.item();
            if (!this.isPlainJSObject(node)) {
                continue;
            }
            // Collect and sort the properties of this object.
            const properties = [];
            for (let edgeIt = node.edges(); edgeIt.hasNext(); edgeIt.next()) {
                const edge = edgeIt.item();
                if (edge.rawType() === edgePropertyType) {
                    properties.push(edge.name());
                }
            }
            properties.sort();
            // We may explore multiple possible paths through the tree, so this set tracks
            // all states that match with the properties iterated thus far.
            const states = new Set();
            states.add(propertyTree);
            // This variable represents the best match found thus far. We start by checking
            // whether there is an interface definition for the empty object.
            let match = selectBetterMatch(initialMatch, propertyTree.matchInfo);
            // Traverse the tree to find any matches.
            for (const property of properties) {
                // Iterate only the states that already exist, not the ones added during the loop below.
                for (const currentState of Array.from(states.keys())) {
                    if (currentState.greatestNext === null || property >= currentState.greatestNext) {
                        // No further transitions are possible from this state.
                        states.delete(currentState);
                    }
                    const nextState = currentState.next.get(property);
                    if (nextState) {
                        states.add(nextState);
                        match = selectBetterMatch(match, nextState.matchInfo);
                    }
                }
            }
            // Update the node's class name accordingly.
            let classIndex = match === initialMatch ? node.rawNameIndex() : this.#interfaceNames.get(match.name);
            if (classIndex === undefined) {
                classIndex = this.addString(match.name);
                this.#interfaceNames.set(match.name, classIndex);
            }
            node.setClassIndex(classIndex);
        }
    }
    /**
     * Iterates children of a node.
     */
    iterateFilteredChildren(nodeOrdinal, edgeFilterCallback, childCallback) {
        const beginEdgeIndex = this.firstEdgeIndexes[nodeOrdinal];
        const endEdgeIndex = this.firstEdgeIndexes[nodeOrdinal + 1];
        for (let edgeIndex = beginEdgeIndex; edgeIndex < endEdgeIndex; edgeIndex += this.edgeFieldsCount) {
            const childNodeIndex = this.containmentEdges.getValue(edgeIndex + this.edgeToNodeOffset);
            const childNodeOrdinal = childNodeIndex / this.nodeFieldCount;
            const type = this.containmentEdges.getValue(edgeIndex + this.edgeTypeOffset);
            if (!edgeFilterCallback(type)) {
                continue;
            }
            childCallback(childNodeOrdinal);
        }
    }
    /**
     * Adds a string to the snapshot.
     */
    addString(string) {
        this.strings.push(string);
        return this.strings.length - 1;
    }
    /**
     * The phase propagates whether a node is attached or detached through the
     * graph and adjusts the low-level representation of nodes.
     *
     * State propagation:
     * 1. Any object reachable from an attached object is itself attached.
     * 2. Any object reachable from a detached object that is not already
     *    attached is considered detached.
     *
     * Representation:
     * - Name of any detached node is changed from "<Name>"" to
     *   "Detached <Name>".
     */
    propagateDOMState() {
        if (this.nodeDetachednessAndClassIndexOffset === -1) {
            return;
        }
        console.time('propagateDOMState');
        const visited = new Uint8Array(this.nodeCount);
        const attached = [];
        const detached = [];
        const stringIndexCache = new Map();
        const node = this.createNode(0);
        /**
         * Adds a 'Detached ' prefix to the name of a node.
         */
        const addDetachedPrefixToNodeName = function (snapshot, nodeIndex) {
            const oldStringIndex = snapshot.nodes.getValue(nodeIndex + snapshot.nodeNameOffset);
            let newStringIndex = stringIndexCache.get(oldStringIndex);
            if (newStringIndex === undefined) {
                newStringIndex = snapshot.addString('Detached ' + snapshot.strings[oldStringIndex]);
                stringIndexCache.set(oldStringIndex, newStringIndex);
            }
            snapshot.nodes.setValue(nodeIndex + snapshot.nodeNameOffset, newStringIndex);
        };
        /**
         * Processes a node represented by nodeOrdinal:
         * - Changes its name based on newState.
         * - Puts it onto working sets for attached or detached nodes.
         */
        const processNode = function (snapshot, nodeOrdinal, newState) {
            if (visited[nodeOrdinal]) {
                return;
            }
            const nodeIndex = nodeOrdinal * snapshot.nodeFieldCount;
            // Early bailout: Do not propagate the state (and name change) through JavaScript. Every
            // entry point into embedder code is a node that knows its own state. All embedder nodes
            // have their node type set to native.
            if (snapshot.nodes.getValue(nodeIndex + snapshot.nodeTypeOffset) !== snapshot.nodeNativeType) {
                visited[nodeOrdinal] = 1;
                return;
            }
            node.nodeIndex = nodeIndex;
            node.setDetachedness(newState);
            if (newState === 1 /* DOMLinkState.ATTACHED */) {
                attached.push(nodeOrdinal);
            }
            else if (newState === 2 /* DOMLinkState.DETACHED */) {
                // Detached state: Rewire node name.
                addDetachedPrefixToNodeName(snapshot, nodeIndex);
                detached.push(nodeOrdinal);
            }
            visited[nodeOrdinal] = 1;
        };
        const propagateState = function (snapshot, parentNodeOrdinal, newState) {
            snapshot.iterateFilteredChildren(parentNodeOrdinal, edgeType => ![snapshot.edgeHiddenType, snapshot.edgeInvisibleType, snapshot.edgeWeakType].includes(edgeType), nodeOrdinal => processNode(snapshot, nodeOrdinal, newState));
        };
        // 1. We re-use the deserialized field to store the propagated state. While
        //    the state for known nodes is already set, they still need to go
        //    through processing to have their name adjusted and them enqueued in
        //    the respective queues.
        for (let nodeOrdinal = 0; nodeOrdinal < this.nodeCount; ++nodeOrdinal) {
            node.nodeIndex = nodeOrdinal * this.nodeFieldCount;
            const state = node.detachedness();
            // Bail out for objects that have no known state. For all other objects set that state.
            if (state === 0 /* DOMLinkState.UNKNOWN */) {
                continue;
            }
            processNode(this, nodeOrdinal, state);
        }
        // 2. If the parent is attached, then the child is also attached.
        while (attached.length !== 0) {
            const nodeOrdinal = attached.pop();
            propagateState(this, nodeOrdinal, 1 /* DOMLinkState.ATTACHED */);
        }
        // 3. If the parent is not attached, then the child inherits the parent's state.
        while (detached.length !== 0) {
            const nodeOrdinal = detached.pop();
            node.nodeIndex = nodeOrdinal * this.nodeFieldCount;
            const nodeState = node.detachedness();
            // Ignore if the node has been found through propagating forward attached state.
            if (nodeState === 1 /* DOMLinkState.ATTACHED */) {
                continue;
            }
            propagateState(this, nodeOrdinal, 2 /* DOMLinkState.DETACHED */);
        }
        console.timeEnd('propagateDOMState');
    }
    buildSamples() {
        const samples = this.#rawSamples;
        if (!samples || !samples.length) {
            return;
        }
        const sampleCount = samples.length / 2;
        const sizeForRange = new Array(sampleCount);
        const timestamps = new Array(sampleCount);
        const lastAssignedIds = new Array(sampleCount);
        const timestampOffset = this.#metaNode.sample_fields.indexOf('timestamp_us');
        const lastAssignedIdOffset = this.#metaNode.sample_fields.indexOf('last_assigned_id');
        for (let i = 0; i < sampleCount; i++) {
            sizeForRange[i] = 0;
            timestamps[i] = (samples[2 * i + timestampOffset]) / 1000;
            lastAssignedIds[i] = samples[2 * i + lastAssignedIdOffset];
        }
        const nodes = this.nodes;
        const nodesLength = nodes.length;
        const nodeFieldCount = this.nodeFieldCount;
        const node = this.rootNode();
        for (let nodeIndex = 0; nodeIndex < nodesLength; nodeIndex += nodeFieldCount) {
            node.nodeIndex = nodeIndex;
            const nodeId = node.id();
            // JS objects have odd ids, skip native objects.
            if (nodeId % 2 === 0) {
                continue;
            }
            const rangeIndex = Platform.ArrayUtilities.lowerBound(lastAssignedIds, nodeId, Platform.ArrayUtilities.DEFAULT_COMPARATOR);
            if (rangeIndex === sampleCount) {
                // TODO: make heap profiler not allocate while taking snapshot
                continue;
            }
            sizeForRange[rangeIndex] += node.selfSize();
        }
        this.#samples = new HeapSnapshotModel.HeapSnapshotModel.Samples(timestamps, lastAssignedIds, sizeForRange);
    }
    buildLocationMap() {
        const map = new Map();
        const locations = this.#locations;
        for (let i = 0; i < locations.length; i += this.#locationFieldCount) {
            const nodeIndex = locations[i + this.#locationIndexOffset];
            const scriptId = locations[i + this.#locationScriptIdOffset];
            const line = locations[i + this.#locationLineOffset];
            const col = locations[i + this.#locationColumnOffset];
            map.set(nodeIndex, new HeapSnapshotModel.HeapSnapshotModel.Location(scriptId, line, col));
        }
        this.#locationMap = map;
    }
    getLocation(nodeIndex) {
        return this.#locationMap.get(nodeIndex) || null;
    }
    getSamples() {
        return this.#samples;
    }
    calculateFlags() {
        throw new Error('Not implemented');
    }
    calculateStatistics() {
        throw new Error('Not implemented');
    }
    userObjectsMapAndFlag() {
        throw new Error('Not implemented');
    }
    calculateSnapshotDiff(baseSnapshotId, baseSnapshotAggregates) {
        let snapshotDiff = this.#snapshotDiffs[baseSnapshotId];
        if (snapshotDiff) {
            return snapshotDiff;
        }
        snapshotDiff = {};
        const aggregates = this.getAggregatesByClassName(true, 'allObjects');
        for (const className in baseSnapshotAggregates) {
            const baseAggregate = baseSnapshotAggregates[className];
            const diff = this.calculateDiffForClass(baseAggregate, aggregates[className]);
            if (diff) {
                snapshotDiff[className] = diff;
            }
        }
        const emptyBaseAggregate = new HeapSnapshotModel.HeapSnapshotModel.AggregateForDiff();
        for (const className in aggregates) {
            if (className in baseSnapshotAggregates) {
                continue;
            }
            const classDiff = this.calculateDiffForClass(emptyBaseAggregate, aggregates[className]);
            if (classDiff) {
                snapshotDiff[className] = classDiff;
            }
        }
        this.#snapshotDiffs[baseSnapshotId] = snapshotDiff;
        return snapshotDiff;
    }
    calculateDiffForClass(baseAggregate, aggregate) {
        const baseIds = baseAggregate.ids;
        const baseIndexes = baseAggregate.indexes;
        const baseSelfSizes = baseAggregate.selfSizes;
        const indexes = aggregate ? aggregate.idxs : [];
        let i = 0;
        let j = 0;
        const l = baseIds.length;
        const m = indexes.length;
        const diff = new HeapSnapshotModel.HeapSnapshotModel.Diff();
        const nodeB = this.createNode(indexes[j]);
        while (i < l && j < m) {
            const nodeAId = baseIds[i];
            if (nodeAId < nodeB.id()) {
                diff.deletedIndexes.push(baseIndexes[i]);
                diff.removedCount++;
                diff.removedSize += baseSelfSizes[i];
                ++i;
            }
            else if (nodeAId >
                nodeB.id()) { // Native nodes(e.g. dom groups) may have ids less than max JS object id in the base snapshot
                diff.addedIndexes.push(indexes[j]);
                diff.addedCount++;
                diff.addedSize += nodeB.selfSize();
                nodeB.nodeIndex = indexes[++j];
            }
            else { // nodeAId === nodeB.id()
                ++i;
                nodeB.nodeIndex = indexes[++j];
            }
        }
        while (i < l) {
            diff.deletedIndexes.push(baseIndexes[i]);
            diff.removedCount++;
            diff.removedSize += baseSelfSizes[i];
            ++i;
        }
        while (j < m) {
            diff.addedIndexes.push(indexes[j]);
            diff.addedCount++;
            diff.addedSize += nodeB.selfSize();
            nodeB.nodeIndex = indexes[++j];
        }
        diff.countDelta = diff.addedCount - diff.removedCount;
        diff.sizeDelta = diff.addedSize - diff.removedSize;
        if (!diff.addedCount && !diff.removedCount) {
            return null;
        }
        return diff;
    }
    nodeForSnapshotObjectId(snapshotObjectId) {
        for (let it = this.allNodes(); it.hasNext(); it.next()) {
            if (it.node.id() === snapshotObjectId) {
                return it.node;
            }
        }
        return null;
    }
    nodeClassName(snapshotObjectId) {
        const node = this.nodeForSnapshotObjectId(snapshotObjectId);
        if (node) {
            return node.className();
        }
        return null;
    }
    idsOfObjectsWithName(name) {
        const ids = [];
        for (let it = this.allNodes(); it.hasNext(); it.next()) {
            if (it.item().name() === name) {
                ids.push(it.item().id());
            }
        }
        return ids;
    }
    createEdgesProvider(nodeIndex) {
        const node = this.createNode(nodeIndex);
        const filter = this.containmentEdgesFilter();
        const indexProvider = new HeapSnapshotEdgeIndexProvider(this);
        return new HeapSnapshotEdgesProvider(this, filter, node.edges(), indexProvider);
    }
    createEdgesProviderForTest(nodeIndex, filter) {
        const node = this.createNode(nodeIndex);
        const indexProvider = new HeapSnapshotEdgeIndexProvider(this);
        return new HeapSnapshotEdgesProvider(this, filter, node.edges(), indexProvider);
    }
    retainingEdgesFilter() {
        return null;
    }
    containmentEdgesFilter() {
        return null;
    }
    createRetainingEdgesProvider(nodeIndex) {
        const node = this.createNode(nodeIndex);
        const filter = this.retainingEdgesFilter();
        const indexProvider = new HeapSnapshotRetainerEdgeIndexProvider(this);
        return new HeapSnapshotEdgesProvider(this, filter, node.retainers(), indexProvider);
    }
    createAddedNodesProvider(baseSnapshotId, className) {
        const snapshotDiff = this.#snapshotDiffs[baseSnapshotId];
        const diffForClass = snapshotDiff[className];
        return new HeapSnapshotNodesProvider(this, diffForClass.addedIndexes);
    }
    createDeletedNodesProvider(nodeIndexes) {
        return new HeapSnapshotNodesProvider(this, nodeIndexes);
    }
    createNodesProviderForClass(className, nodeFilter) {
        return new HeapSnapshotNodesProvider(this, this.aggregatesWithFilter(nodeFilter)[className].idxs);
    }
    maxJsNodeId() {
        const nodeFieldCount = this.nodeFieldCount;
        const nodes = this.nodes;
        const nodesLength = nodes.length;
        let id = 0;
        for (let nodeIndex = this.nodeIdOffset; nodeIndex < nodesLength; nodeIndex += nodeFieldCount) {
            const nextId = nodes.getValue(nodeIndex);
            // JS objects have odd ids, skip native objects.
            if (nextId % 2 === 0) {
                continue;
            }
            if (id < nextId) {
                id = nextId;
            }
        }
        return id;
    }
    updateStaticData() {
        return new HeapSnapshotModel.HeapSnapshotModel.StaticData(this.nodeCount, this.rootNodeIndexInternal, this.totalSize, this.maxJsNodeId());
    }
    ignoreNodeInRetainersView(nodeIndex) {
        this.#ignoredNodesInRetainersView.add(nodeIndex);
        this.calculateDistances(/* isForRetainersView=*/ true);
        this.#updateIgnoredEdgesInRetainersView();
    }
    unignoreNodeInRetainersView(nodeIndex) {
        this.#ignoredNodesInRetainersView.delete(nodeIndex);
        if (this.#ignoredNodesInRetainersView.size === 0) {
            this.#nodeDistancesForRetainersView = undefined;
        }
        else {
            this.calculateDistances(/* isForRetainersView=*/ true);
        }
        this.#updateIgnoredEdgesInRetainersView();
    }
    unignoreAllNodesInRetainersView() {
        this.#ignoredNodesInRetainersView.clear();
        this.#nodeDistancesForRetainersView = undefined;
        this.#updateIgnoredEdgesInRetainersView();
    }
    #updateIgnoredEdgesInRetainersView() {
        const distances = this.#nodeDistancesForRetainersView;
        this.#ignoredEdgesInRetainersView.clear();
        if (distances === undefined) {
            return;
        }
        // To retain a value in a WeakMap, both the WeakMap and the corresponding
        // key must stay alive. If one of those two retainers is unreachable due to
        // the user ignoring some nodes, then the other retainer edge should also be
        // shown as unreachable, since it would be insufficient on its own to retain
        // the value.
        const unreachableWeakMapEdges = new Platform.MapUtilities.Multimap();
        const noDistance = this.#noDistance;
        const { nodeCount, nodeFieldCount } = this;
        const node = this.createNode(0);
        // Populate unreachableWeakMapEdges.
        for (let nodeOrdinal = 0; nodeOrdinal < nodeCount; ++nodeOrdinal) {
            if (distances[nodeOrdinal] !== noDistance) {
                continue;
            }
            node.nodeIndex = nodeOrdinal * nodeFieldCount;
            for (let iter = node.edges(); iter.hasNext(); iter.next()) {
                const edge = iter.edge;
                if (!edge.isInternal()) {
                    continue;
                }
                const match = this.tryParseWeakMapEdgeName(edge.nameIndex());
                if (match) {
                    unreachableWeakMapEdges.set(edge.nodeIndex(), match.duplicatedPart);
                }
            }
        }
        // Iterate the retaining edges for the target nodes found in the previous
        // step and mark any relevant WeakMap edges as ignored.
        for (const targetNodeIndex of unreachableWeakMapEdges.keys()) {
            node.nodeIndex = targetNodeIndex;
            for (let it = node.retainers(); it.hasNext(); it.next()) {
                const reverseEdge = it.item();
                if (!reverseEdge.isInternal()) {
                    continue;
                }
                const match = this.tryParseWeakMapEdgeName(reverseEdge.nameIndex());
                if (match && unreachableWeakMapEdges.hasValue(targetNodeIndex, match.duplicatedPart)) {
                    const forwardEdgeIndex = this.retainingEdges[reverseEdge.itemIndex()];
                    this.#ignoredEdgesInRetainersView.add(forwardEdgeIndex);
                }
            }
        }
    }
    areNodesIgnoredInRetainersView() {
        return this.#ignoredNodesInRetainersView.size > 0;
    }
    getDistanceForRetainersView(nodeIndex) {
        const nodeOrdinal = nodeIndex / this.nodeFieldCount;
        const distances = this.#nodeDistancesForRetainersView ?? this.nodeDistances;
        const distance = distances[nodeOrdinal];
        if (distance === this.#noDistance) {
            // An unreachable node should be sorted to the end, not the beginning.
            // To give such nodes a reasonable sorting order, we add a very large
            // number to the original distance computed without ignoring any nodes.
            return Math.max(0, this.nodeDistances[nodeOrdinal]) + HeapSnapshotModel.HeapSnapshotModel.baseUnreachableDistance;
        }
        return distance;
    }
    isNodeIgnoredInRetainersView(nodeIndex) {
        return this.#ignoredNodesInRetainersView.has(nodeIndex);
    }
    isEdgeIgnoredInRetainersView(edgeIndex) {
        return this.#ignoredEdgesInRetainersView.has(edgeIndex);
    }
}
class HeapSnapshotMetainfo {
    location_fields = []; // eslint-disable-line @typescript-eslint/naming-convention
    node_fields = []; // eslint-disable-line @typescript-eslint/naming-convention
    node_types = []; // eslint-disable-line @typescript-eslint/naming-convention
    edge_fields = []; // eslint-disable-line @typescript-eslint/naming-convention
    edge_types = []; // eslint-disable-line @typescript-eslint/naming-convention
    trace_function_info_fields = []; // eslint-disable-line @typescript-eslint/naming-convention
    trace_node_fields = []; // eslint-disable-line @typescript-eslint/naming-convention
    sample_fields = []; // eslint-disable-line @typescript-eslint/naming-convention
    type_strings = {}; // eslint-disable-line @typescript-eslint/naming-convention
}
export class HeapSnapshotHeader {
    title;
    meta;
    node_count; // eslint-disable-line @typescript-eslint/naming-convention
    edge_count; // eslint-disable-line @typescript-eslint/naming-convention
    trace_function_count; // eslint-disable-line @typescript-eslint/naming-convention
    root_index; // eslint-disable-line @typescript-eslint/naming-convention
    constructor() {
        // New format.
        this.title = '';
        this.meta = new HeapSnapshotMetainfo();
        this.node_count = 0;
        this.edge_count = 0;
        this.trace_function_count = 0;
        this.root_index = 0;
    }
}
export class HeapSnapshotItemProvider {
    iterator;
    #indexProvider;
    #isEmptyInternal;
    iterationOrder;
    currentComparator;
    #sortedPrefixLength;
    #sortedSuffixLength;
    constructor(iterator, indexProvider) {
        this.iterator = iterator;
        this.#indexProvider = indexProvider;
        this.#isEmptyInternal = !iterator.hasNext();
        this.iterationOrder = null;
        this.currentComparator = null;
        this.#sortedPrefixLength = 0;
        this.#sortedSuffixLength = 0;
    }
    createIterationOrder() {
        if (this.iterationOrder) {
            return;
        }
        this.iterationOrder = [];
        for (let iterator = this.iterator; iterator.hasNext(); iterator.next()) {
            this.iterationOrder.push(iterator.item().itemIndex());
        }
    }
    isEmpty() {
        return this.#isEmptyInternal;
    }
    serializeItemsRange(begin, end) {
        this.createIterationOrder();
        if (begin > end) {
            throw new Error('Start position > end position: ' + begin + ' > ' + end);
        }
        if (!this.iterationOrder) {
            throw new Error('Iteration order undefined');
        }
        if (end > this.iterationOrder.length) {
            end = this.iterationOrder.length;
        }
        if (this.#sortedPrefixLength < end && begin < this.iterationOrder.length - this.#sortedSuffixLength &&
            this.currentComparator) {
            const currentComparator = this.currentComparator;
            this.sort(currentComparator, this.#sortedPrefixLength, this.iterationOrder.length - 1 - this.#sortedSuffixLength, begin, end - 1);
            if (begin <= this.#sortedPrefixLength) {
                this.#sortedPrefixLength = end;
            }
            if (end >= this.iterationOrder.length - this.#sortedSuffixLength) {
                this.#sortedSuffixLength = this.iterationOrder.length - begin;
            }
        }
        let position = begin;
        const count = end - begin;
        const result = new Array(count);
        for (let i = 0; i < count; ++i) {
            const itemIndex = this.iterationOrder[position++];
            const item = this.#indexProvider.itemForIndex(itemIndex);
            result[i] = item.serialize();
        }
        return new HeapSnapshotModel.HeapSnapshotModel.ItemsRange(begin, end, this.iterationOrder.length, result);
    }
    sortAndRewind(comparator) {
        this.currentComparator = comparator;
        this.#sortedPrefixLength = 0;
        this.#sortedSuffixLength = 0;
    }
}
export class HeapSnapshotEdgesProvider extends HeapSnapshotItemProvider {
    snapshot;
    constructor(snapshot, filter, edgesIter, indexProvider) {
        const iter = filter ? new HeapSnapshotFilteredIterator(edgesIter, filter) :
            edgesIter;
        super(iter, indexProvider);
        this.snapshot = snapshot;
    }
    sort(comparator, leftBound, rightBound, windowLeft, windowRight) {
        const fieldName1 = comparator.fieldName1;
        const fieldName2 = comparator.fieldName2;
        const ascending1 = comparator.ascending1;
        const ascending2 = comparator.ascending2;
        const edgeA = this.iterator.item().clone();
        const edgeB = edgeA.clone();
        const nodeA = this.snapshot.createNode();
        const nodeB = this.snapshot.createNode();
        function compareEdgeField(fieldName, ascending, indexA, indexB) {
            edgeA.edgeIndex = indexA;
            edgeB.edgeIndex = indexB;
            let result = 0;
            if (fieldName === '!edgeName') {
                if (edgeB.name() === '__proto__') {
                    return -1;
                }
                if (edgeA.name() === '__proto__') {
                    return 1;
                }
                result = edgeA.hasStringName() === edgeB.hasStringName() ?
                    (edgeA.name() < edgeB.name() ? -1 : (edgeA.name() > edgeB.name() ? 1 : 0)) :
                    (edgeA.hasStringName() ? -1 : 1);
            }
            else {
                result = edgeA.getValueForSorting(fieldName) - edgeB.getValueForSorting(fieldName);
            }
            return ascending ? result : -result;
        }
        function compareNodeField(fieldName, ascending, indexA, indexB) {
            edgeA.edgeIndex = indexA;
            nodeA.nodeIndex = edgeA.nodeIndex();
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const valueA = nodeA[fieldName]();
            edgeB.edgeIndex = indexB;
            nodeB.nodeIndex = edgeB.nodeIndex();
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const valueB = nodeB[fieldName]();
            const result = valueA < valueB ? -1 : (valueA > valueB ? 1 : 0);
            return ascending ? result : -result;
        }
        function compareEdgeAndEdge(indexA, indexB) {
            let result = compareEdgeField(fieldName1, ascending1, indexA, indexB);
            if (result === 0) {
                result = compareEdgeField(fieldName2, ascending2, indexA, indexB);
            }
            if (result === 0) {
                return indexA - indexB;
            }
            return result;
        }
        function compareEdgeAndNode(indexA, indexB) {
            let result = compareEdgeField(fieldName1, ascending1, indexA, indexB);
            if (result === 0) {
                result = compareNodeField(fieldName2, ascending2, indexA, indexB);
            }
            if (result === 0) {
                return indexA - indexB;
            }
            return result;
        }
        function compareNodeAndEdge(indexA, indexB) {
            let result = compareNodeField(fieldName1, ascending1, indexA, indexB);
            if (result === 0) {
                result = compareEdgeField(fieldName2, ascending2, indexA, indexB);
            }
            if (result === 0) {
                return indexA - indexB;
            }
            return result;
        }
        function compareNodeAndNode(indexA, indexB) {
            let result = compareNodeField(fieldName1, ascending1, indexA, indexB);
            if (result === 0) {
                result = compareNodeField(fieldName2, ascending2, indexA, indexB);
            }
            if (result === 0) {
                return indexA - indexB;
            }
            return result;
        }
        if (!this.iterationOrder) {
            throw new Error('Iteration order not defined');
        }
        function isEdgeFieldName(fieldName) {
            return fieldName.startsWith('!edge');
        }
        if (isEdgeFieldName(fieldName1)) {
            if (isEdgeFieldName(fieldName2)) {
                Platform.ArrayUtilities.sortRange(this.iterationOrder, compareEdgeAndEdge, leftBound, rightBound, windowLeft, windowRight);
            }
            else {
                Platform.ArrayUtilities.sortRange(this.iterationOrder, compareEdgeAndNode, leftBound, rightBound, windowLeft, windowRight);
            }
        }
        else if (isEdgeFieldName(fieldName2)) {
            Platform.ArrayUtilities.sortRange(this.iterationOrder, compareNodeAndEdge, leftBound, rightBound, windowLeft, windowRight);
        }
        else {
            Platform.ArrayUtilities.sortRange(this.iterationOrder, compareNodeAndNode, leftBound, rightBound, windowLeft, windowRight);
        }
    }
}
export class HeapSnapshotNodesProvider extends HeapSnapshotItemProvider {
    snapshot;
    constructor(snapshot, nodeIndexes) {
        const indexProvider = new HeapSnapshotNodeIndexProvider(snapshot);
        const it = new HeapSnapshotIndexRangeIterator(indexProvider, nodeIndexes);
        super(it, indexProvider);
        this.snapshot = snapshot;
    }
    nodePosition(snapshotObjectId) {
        this.createIterationOrder();
        const node = this.snapshot.createNode();
        let i = 0;
        if (!this.iterationOrder) {
            throw new Error('Iteration order not defined');
        }
        for (; i < this.iterationOrder.length; i++) {
            node.nodeIndex = this.iterationOrder[i];
            if (node.id() === snapshotObjectId) {
                break;
            }
        }
        if (i === this.iterationOrder.length) {
            return -1;
        }
        const targetNodeIndex = this.iterationOrder[i];
        let smallerCount = 0;
        const currentComparator = this.currentComparator;
        const compare = this.buildCompareFunction(currentComparator);
        for (let i = 0; i < this.iterationOrder.length; i++) {
            if (compare(this.iterationOrder[i], targetNodeIndex) < 0) {
                ++smallerCount;
            }
        }
        return smallerCount;
    }
    buildCompareFunction(comparator) {
        const nodeA = this.snapshot.createNode();
        const nodeB = this.snapshot.createNode();
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fieldAccessor1 = nodeA[comparator.fieldName1];
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fieldAccessor2 = nodeA[comparator.fieldName2];
        const ascending1 = comparator.ascending1 ? 1 : -1;
        const ascending2 = comparator.ascending2 ? 1 : -1;
        function sortByNodeField(fieldAccessor, ascending) {
            const valueA = fieldAccessor.call(nodeA);
            const valueB = fieldAccessor.call(nodeB);
            return valueA < valueB ? -ascending : (valueA > valueB ? ascending : 0);
        }
        function sortByComparator(indexA, indexB) {
            nodeA.nodeIndex = indexA;
            nodeB.nodeIndex = indexB;
            let result = sortByNodeField(fieldAccessor1, ascending1);
            if (result === 0) {
                result = sortByNodeField(fieldAccessor2, ascending2);
            }
            return result || indexA - indexB;
        }
        return sortByComparator;
    }
    sort(comparator, leftBound, rightBound, windowLeft, windowRight) {
        if (!this.iterationOrder) {
            throw new Error('Iteration order not defined');
        }
        Platform.ArrayUtilities.sortRange(this.iterationOrder, this.buildCompareFunction(comparator), leftBound, rightBound, windowLeft, windowRight);
    }
}
export class JSHeapSnapshot extends HeapSnapshot {
    nodeFlags;
    flags;
    #statistics;
    constructor(profile, progress) {
        super(profile, progress);
        this.nodeFlags = {
            // bit flags
            canBeQueried: 1,
            detachedDOMTreeNode: 2,
            pageObject: 4, // The idea is to track separately the objects owned by the page and the objects owned by debugger.
        };
        this.initialize();
    }
    createNode(nodeIndex) {
        return new JSHeapSnapshotNode(this, nodeIndex === undefined ? -1 : nodeIndex);
    }
    createEdge(edgeIndex) {
        return new JSHeapSnapshotEdge(this, edgeIndex);
    }
    createRetainingEdge(retainerIndex) {
        return new JSHeapSnapshotRetainerEdge(this, retainerIndex);
    }
    containmentEdgesFilter() {
        return (edge) => !edge.isInvisible();
    }
    retainingEdgesFilter() {
        const containmentEdgesFilter = this.containmentEdgesFilter();
        function filter(edge) {
            return containmentEdgesFilter(edge) && !edge.node().isRoot() && !edge.isWeak();
        }
        return filter;
    }
    calculateFlags() {
        this.flags = new Uint32Array(this.nodeCount);
        this.markDetachedDOMTreeNodes();
        this.markQueriableHeapObjects();
        this.markPageOwnedNodes();
    }
    #hasUserRoots() {
        for (let iter = this.rootNode().edges(); iter.hasNext(); iter.next()) {
            if (this.isUserRoot(iter.edge.node())) {
                return true;
            }
        }
        return false;
    }
    // Updates the shallow sizes for "owned" objects of types kArray or kHidden to
    // zero, and add their sizes to the "owner" object instead.
    calculateShallowSizes() {
        // If there are no user roots, then that means the snapshot was produced with
        // the "expose internals" option enabled. In that case, we should faithfully
        // represent the actual memory allocations rather than attempting to make the
        // output more understandable to web developers.
        if (!this.#hasUserRoots()) {
            return;
        }
        const { nodeCount, nodes, nodeFieldCount, nodeSelfSizeOffset } = this;
        const kUnvisited = 0xffffffff;
        const kHasMultipleOwners = 0xfffffffe;
        if (nodeCount >= kHasMultipleOwners) {
            throw new Error('Too many nodes for calculateShallowSizes');
        }
        // For each node in order, `owners` will contain the index of the owning
        // node or one of the two values kUnvisited or kHasMultipleOwners. The
        // indexes in this array are NOT already multiplied by nodeFieldCount.
        const owners = new Uint32Array(nodeCount);
        // The worklist contains the indexes of nodes which should be visited during
        // the second loop below. The order of visiting doesn't matter. The indexes
        // in this array are NOT already multiplied by nodeFieldCount.
        const worklist = [];
        const node = this.createNode(0);
        for (let i = 0; i < nodeCount; ++i) {
            if (node.isHidden() || node.isArray()) {
                owners[i] = kUnvisited;
            }
            else {
                // The node owns itself.
                owners[i] = i;
                worklist.push(i);
            }
            node.nodeIndex = node.nextNodeIndex();
        }
        while (worklist.length !== 0) {
            const id = worklist.pop();
            const owner = owners[id];
            node.nodeIndex = id * nodeFieldCount;
            for (let iter = node.edges(); iter.hasNext(); iter.next()) {
                const edge = iter.edge;
                if (edge.isWeak()) {
                    continue;
                }
                const targetId = edge.nodeIndex() / nodeFieldCount;
                switch (owners[targetId]) {
                    case kUnvisited:
                        owners[targetId] = owner;
                        worklist.push(targetId);
                        break;
                    case targetId:
                    case owner:
                    case kHasMultipleOwners:
                        // There is no change necessary if the target is already marked as:
                        // * owned by itself,
                        // * owned by the owner of the current source node, or
                        // * owned by multiple nodes.
                        break;
                    default:
                        owners[targetId] = kHasMultipleOwners;
                        // It is possible that this node is already in the worklist
                        // somewhere, but visiting it an extra time is not harmful. The
                        // iteration is guaranteed to complete because each node can only be
                        // added twice to the worklist: once when changing from kUnvisited
                        // to a specific owner, and a second time when changing from that
                        // owner to kHasMultipleOwners.
                        worklist.push(targetId);
                        break;
                }
            }
        }
        for (let i = 0; i < nodeCount; ++i) {
            const ownerId = owners[i];
            switch (ownerId) {
                case kUnvisited:
                case kHasMultipleOwners:
                case i:
                    break;
                default: {
                    const ownedNodeIndex = i * nodeFieldCount;
                    const ownerNodeIndex = ownerId * nodeFieldCount;
                    node.nodeIndex = ownerNodeIndex;
                    if (node.isSynthetic() || node.isRoot()) {
                        // Adding shallow size to synthetic or root nodes is not useful.
                        break;
                    }
                    const sizeToTransfer = nodes.getValue(ownedNodeIndex + nodeSelfSizeOffset);
                    nodes.setValue(ownedNodeIndex + nodeSelfSizeOffset, 0);
                    nodes.setValue(ownerNodeIndex + nodeSelfSizeOffset, nodes.getValue(ownerNodeIndex + nodeSelfSizeOffset) + sizeToTransfer);
                    break;
                }
            }
        }
    }
    calculateDistances(isForRetainersView) {
        const pendingEphemeronEdges = new Set();
        const snapshot = this;
        function filter(node, edge) {
            if (node.isHidden() && edge.name() === 'sloppy_function_map' && node.rawName() === 'system / NativeContext') {
                return false;
            }
            if (node.isArray() && node.rawName() === '(map descriptors)') {
                // DescriptorArrays are fixed arrays used to hold instance descriptors.
                // The format of the these objects is:
                //   [0]: Number of descriptors
                //   [1]: Either Smi(0) if uninitialized, or a pointer to small fixed array:
                //          [0]: pointer to fixed array with enum cache
                //          [1]: either Smi(0) or pointer to fixed array with indices
                //   [i*3+2]: i-th key
                //   [i*3+3]: i-th type
                //   [i*3+4]: i-th descriptor
                // As long as maps may share descriptor arrays some of the descriptor
                // links may not be valid for all the maps. We just skip
                // all the descriptor links when calculating distances.
                // For more details see http://crbug.com/413608
                const index = parseInt(edge.name(), 10);
                return index < 2 || (index % 3) !== 1;
            }
            if (edge.isInternal()) {
                // Snapshots represent WeakMap values as being referenced by two edges:
                // one from the WeakMap, and a second from the corresponding key. To
                // avoid the case described in crbug.com/1290800, we should set the
                // distance of that value to the greater of (WeakMap+1, key+1). This
                // part of the filter skips the first edge in the matched pair of edges,
                // so that the distance gets set based on the second, which should be
                // greater or equal due to traversal order.
                const match = snapshot.tryParseWeakMapEdgeName(edge.nameIndex());
                if (match) {
                    if (!pendingEphemeronEdges.delete(match.duplicatedPart)) {
                        pendingEphemeronEdges.add(match.duplicatedPart);
                        return false;
                    }
                }
            }
            return true;
        }
        super.calculateDistances(isForRetainersView, filter);
    }
    isUserRoot(node) {
        return node.isUserRoot() || node.isDocumentDOMTreesRoot();
    }
    userObjectsMapAndFlag() {
        return { map: this.flags, flag: this.nodeFlags.pageObject };
    }
    flagsOfNode(node) {
        return this.flags[node.nodeIndex / this.nodeFieldCount];
    }
    markDetachedDOMTreeNodes() {
        const nodes = this.nodes;
        const nodesLength = nodes.length;
        const nodeFieldCount = this.nodeFieldCount;
        const nodeNativeType = this.nodeNativeType;
        const nodeTypeOffset = this.nodeTypeOffset;
        const flag = this.nodeFlags.detachedDOMTreeNode;
        const node = this.rootNode();
        for (let nodeIndex = 0, ordinal = 0; nodeIndex < nodesLength; nodeIndex += nodeFieldCount, ordinal++) {
            const nodeType = nodes.getValue(nodeIndex + nodeTypeOffset);
            if (nodeType !== nodeNativeType) {
                continue;
            }
            node.nodeIndex = nodeIndex;
            if (node.name().startsWith('Detached ')) {
                this.flags[ordinal] |= flag;
            }
        }
    }
    markQueriableHeapObjects() {
        // Allow runtime properties query for objects accessible from Window objects
        // via regular properties, and for DOM wrappers. Trying to access random objects
        // can cause a crash due to inconsistent state of internal properties of wrappers.
        const flag = this.nodeFlags.canBeQueried;
        const hiddenEdgeType = this.edgeHiddenType;
        const internalEdgeType = this.edgeInternalType;
        const invisibleEdgeType = this.edgeInvisibleType;
        const weakEdgeType = this.edgeWeakType;
        const edgeToNodeOffset = this.edgeToNodeOffset;
        const edgeTypeOffset = this.edgeTypeOffset;
        const edgeFieldsCount = this.edgeFieldsCount;
        const containmentEdges = this.containmentEdges;
        const nodeFieldCount = this.nodeFieldCount;
        const firstEdgeIndexes = this.firstEdgeIndexes;
        const flags = this.flags;
        const list = [];
        for (let iter = this.rootNode().edges(); iter.hasNext(); iter.next()) {
            if (iter.edge.node().isUserRoot()) {
                list.push(iter.edge.node().nodeIndex / nodeFieldCount);
            }
        }
        while (list.length) {
            const nodeOrdinal = list.pop();
            if (flags[nodeOrdinal] & flag) {
                continue;
            }
            flags[nodeOrdinal] |= flag;
            const beginEdgeIndex = firstEdgeIndexes[nodeOrdinal];
            const endEdgeIndex = firstEdgeIndexes[nodeOrdinal + 1];
            for (let edgeIndex = beginEdgeIndex; edgeIndex < endEdgeIndex; edgeIndex += edgeFieldsCount) {
                const childNodeIndex = containmentEdges.getValue(edgeIndex + edgeToNodeOffset);
                const childNodeOrdinal = childNodeIndex / nodeFieldCount;
                if (flags[childNodeOrdinal] & flag) {
                    continue;
                }
                const type = containmentEdges.getValue(edgeIndex + edgeTypeOffset);
                if (type === hiddenEdgeType || type === invisibleEdgeType || type === internalEdgeType ||
                    type === weakEdgeType) {
                    continue;
                }
                list.push(childNodeOrdinal);
            }
        }
    }
    markPageOwnedNodes() {
        const edgeShortcutType = this.edgeShortcutType;
        const edgeElementType = this.edgeElementType;
        const edgeToNodeOffset = this.edgeToNodeOffset;
        const edgeTypeOffset = this.edgeTypeOffset;
        const edgeFieldsCount = this.edgeFieldsCount;
        const edgeWeakType = this.edgeWeakType;
        const firstEdgeIndexes = this.firstEdgeIndexes;
        const containmentEdges = this.containmentEdges;
        const nodeFieldCount = this.nodeFieldCount;
        const nodesCount = this.nodeCount;
        const flags = this.flags;
        const pageObjectFlag = this.nodeFlags.pageObject;
        const nodesToVisit = new Uint32Array(nodesCount);
        let nodesToVisitLength = 0;
        const rootNodeOrdinal = this.rootNodeIndexInternal / nodeFieldCount;
        const node = this.rootNode();
        // Populate the entry points. They are Window objects and DOM Tree Roots.
        for (let edgeIndex = firstEdgeIndexes[rootNodeOrdinal], endEdgeIndex = firstEdgeIndexes[rootNodeOrdinal + 1]; edgeIndex < endEdgeIndex; edgeIndex += edgeFieldsCount) {
            const edgeType = containmentEdges.getValue(edgeIndex + edgeTypeOffset);
            const nodeIndex = containmentEdges.getValue(edgeIndex + edgeToNodeOffset);
            if (edgeType === edgeElementType) {
                node.nodeIndex = nodeIndex;
                if (!node.isDocumentDOMTreesRoot()) {
                    continue;
                }
            }
            else if (edgeType !== edgeShortcutType) {
                continue;
            }
            const nodeOrdinal = nodeIndex / nodeFieldCount;
            nodesToVisit[nodesToVisitLength++] = nodeOrdinal;
            flags[nodeOrdinal] |= pageObjectFlag;
        }
        // Mark everything reachable with the pageObject flag.
        while (nodesToVisitLength) {
            const nodeOrdinal = nodesToVisit[--nodesToVisitLength];
            const beginEdgeIndex = firstEdgeIndexes[nodeOrdinal];
            const endEdgeIndex = firstEdgeIndexes[nodeOrdinal + 1];
            for (let edgeIndex = beginEdgeIndex; edgeIndex < endEdgeIndex; edgeIndex += edgeFieldsCount) {
                const childNodeIndex = containmentEdges.getValue(edgeIndex + edgeToNodeOffset);
                const childNodeOrdinal = childNodeIndex / nodeFieldCount;
                if (flags[childNodeOrdinal] & pageObjectFlag) {
                    continue;
                }
                const type = containmentEdges.getValue(edgeIndex + edgeTypeOffset);
                if (type === edgeWeakType) {
                    continue;
                }
                nodesToVisit[nodesToVisitLength++] = childNodeOrdinal;
                flags[childNodeOrdinal] |= pageObjectFlag;
            }
        }
    }
    calculateStatistics() {
        const nodeFieldCount = this.nodeFieldCount;
        const nodes = this.nodes;
        const nodesLength = nodes.length;
        const nodeTypeOffset = this.nodeTypeOffset;
        const nodeSizeOffset = this.nodeSelfSizeOffset;
        const nodeNativeType = this.nodeNativeType;
        const nodeCodeType = this.nodeCodeType;
        const nodeConsStringType = this.nodeConsStringType;
        const nodeSlicedStringType = this.nodeSlicedStringType;
        const distances = this.nodeDistances;
        let sizeNative = 0;
        let sizeCode = 0;
        let sizeStrings = 0;
        let sizeJSArrays = 0;
        let sizeSystem = 0;
        const node = this.rootNode();
        for (let nodeIndex = 0; nodeIndex < nodesLength; nodeIndex += nodeFieldCount) {
            const nodeSize = nodes.getValue(nodeIndex + nodeSizeOffset);
            const ordinal = nodeIndex / nodeFieldCount;
            if (distances[ordinal] >= HeapSnapshotModel.HeapSnapshotModel.baseSystemDistance) {
                sizeSystem += nodeSize;
                continue;
            }
            const nodeType = nodes.getValue(nodeIndex + nodeTypeOffset);
            node.nodeIndex = nodeIndex;
            if (nodeType === nodeNativeType) {
                sizeNative += nodeSize;
            }
            else if (nodeType === nodeCodeType) {
                sizeCode += nodeSize;
            }
            else if (nodeType === nodeConsStringType || nodeType === nodeSlicedStringType || node.type() === 'string') {
                sizeStrings += nodeSize;
            }
            else if (node.rawName() === 'Array') {
                sizeJSArrays += this.calculateArraySize(node);
            }
        }
        this.#statistics = new HeapSnapshotModel.HeapSnapshotModel.Statistics();
        this.#statistics.total = this.totalSize;
        this.#statistics.v8heap = this.totalSize - sizeNative;
        this.#statistics.native = sizeNative;
        this.#statistics.code = sizeCode;
        this.#statistics.jsArrays = sizeJSArrays;
        this.#statistics.strings = sizeStrings;
        this.#statistics.system = sizeSystem;
    }
    calculateArraySize(node) {
        let size = node.selfSize();
        const beginEdgeIndex = node.edgeIndexesStart();
        const endEdgeIndex = node.edgeIndexesEnd();
        const containmentEdges = this.containmentEdges;
        const strings = this.strings;
        const edgeToNodeOffset = this.edgeToNodeOffset;
        const edgeTypeOffset = this.edgeTypeOffset;
        const edgeNameOffset = this.edgeNameOffset;
        const edgeFieldsCount = this.edgeFieldsCount;
        const edgeInternalType = this.edgeInternalType;
        for (let edgeIndex = beginEdgeIndex; edgeIndex < endEdgeIndex; edgeIndex += edgeFieldsCount) {
            const edgeType = containmentEdges.getValue(edgeIndex + edgeTypeOffset);
            if (edgeType !== edgeInternalType) {
                continue;
            }
            const edgeName = strings[containmentEdges.getValue(edgeIndex + edgeNameOffset)];
            if (edgeName !== 'elements') {
                continue;
            }
            const elementsNodeIndex = containmentEdges.getValue(edgeIndex + edgeToNodeOffset);
            node.nodeIndex = elementsNodeIndex;
            if (node.retainersCount() === 1) {
                size += node.selfSize();
            }
            break;
        }
        return size;
    }
    getStatistics() {
        return this.#statistics;
    }
}
export class JSHeapSnapshotNode extends HeapSnapshotNode {
    constructor(snapshot, nodeIndex) {
        super(snapshot, nodeIndex);
    }
    canBeQueried() {
        const snapshot = this.snapshot;
        const flags = snapshot.flagsOfNode(this);
        return Boolean(flags & snapshot.nodeFlags.canBeQueried);
    }
    name() {
        const snapshot = this.snapshot;
        if (this.rawType() === snapshot.nodeConsStringType) {
            return this.consStringName();
        }
        if (this.rawType() === snapshot.nodeObjectType && this.rawName() === 'Object') {
            return this.#plainObjectName();
        }
        return this.rawName();
    }
    consStringName() {
        const snapshot = this.snapshot;
        const consStringType = snapshot.nodeConsStringType;
        const edgeInternalType = snapshot.edgeInternalType;
        const edgeFieldsCount = snapshot.edgeFieldsCount;
        const edgeToNodeOffset = snapshot.edgeToNodeOffset;
        const edgeTypeOffset = snapshot.edgeTypeOffset;
        const edgeNameOffset = snapshot.edgeNameOffset;
        const strings = snapshot.strings;
        const edges = snapshot.containmentEdges;
        const firstEdgeIndexes = snapshot.firstEdgeIndexes;
        const nodeFieldCount = snapshot.nodeFieldCount;
        const nodeTypeOffset = snapshot.nodeTypeOffset;
        const nodeNameOffset = snapshot.nodeNameOffset;
        const nodes = snapshot.nodes;
        const nodesStack = [];
        nodesStack.push(this.nodeIndex);
        let name = '';
        while (nodesStack.length && name.length < 1024) {
            const nodeIndex = nodesStack.pop();
            if (nodes.getValue(nodeIndex + nodeTypeOffset) !== consStringType) {
                name += strings[nodes.getValue(nodeIndex + nodeNameOffset)];
                continue;
            }
            const nodeOrdinal = nodeIndex / nodeFieldCount;
            const beginEdgeIndex = firstEdgeIndexes[nodeOrdinal];
            const endEdgeIndex = firstEdgeIndexes[nodeOrdinal + 1];
            let firstNodeIndex = 0;
            let secondNodeIndex = 0;
            for (let edgeIndex = beginEdgeIndex; edgeIndex < endEdgeIndex && (!firstNodeIndex || !secondNodeIndex); edgeIndex += edgeFieldsCount) {
                const edgeType = edges.getValue(edgeIndex + edgeTypeOffset);
                if (edgeType === edgeInternalType) {
                    const edgeName = strings[edges.getValue(edgeIndex + edgeNameOffset)];
                    if (edgeName === 'first') {
                        firstNodeIndex = edges.getValue(edgeIndex + edgeToNodeOffset);
                    }
                    else if (edgeName === 'second') {
                        secondNodeIndex = edges.getValue(edgeIndex + edgeToNodeOffset);
                    }
                }
            }
            nodesStack.push(secondNodeIndex);
            nodesStack.push(firstNodeIndex);
        }
        return name;
    }
    // Creates a name for plain JS objects, which looks something like
    // '{propName, otherProp, thirdProp, ..., secondToLastProp, lastProp}'.
    // A variable number of property names is included, depending on the length
    // of the property names, so that the result fits nicely in a reasonably
    // sized DevTools window.
    #plainObjectName() {
        const snapshot = this.snapshot;
        const { edgeFieldsCount, edgePropertyType } = snapshot;
        const edge = snapshot.createEdge(0);
        let categoryNameStart = '{';
        let categoryNameEnd = '}';
        let edgeIndexFromStart = this.edgeIndexesStart();
        let edgeIndexFromEnd = this.edgeIndexesEnd() - edgeFieldsCount;
        let nextFromEnd = false;
        while (edgeIndexFromStart <= edgeIndexFromEnd) {
            edge.edgeIndex = nextFromEnd ? edgeIndexFromEnd : edgeIndexFromStart;
            // Skip non-property edges and the special __proto__ property.
            if (edge.rawType() !== edgePropertyType || edge.name() === '__proto__') {
                if (nextFromEnd) {
                    edgeIndexFromEnd -= edgeFieldsCount;
                }
                else {
                    edgeIndexFromStart += edgeFieldsCount;
                }
                continue;
            }
            const formatted = JSHeapSnapshotNode.formatPropertyName(edge.name());
            // Always include at least one property, regardless of its length. Beyond that point,
            // only include more properties if the name isn't too long.
            if (categoryNameStart.length > 1 && categoryNameStart.length + categoryNameEnd.length + formatted.length > 100) {
                break;
            }
            if (nextFromEnd) {
                edgeIndexFromEnd -= edgeFieldsCount;
                if (categoryNameEnd.length > 1) {
                    categoryNameEnd = ', ' + categoryNameEnd;
                }
                categoryNameEnd = formatted + categoryNameEnd;
            }
            else {
                edgeIndexFromStart += edgeFieldsCount;
                if (categoryNameStart.length > 1) {
                    categoryNameStart += ', ';
                }
                categoryNameStart += formatted;
            }
            nextFromEnd = !nextFromEnd;
        }
        if (edgeIndexFromStart <= edgeIndexFromEnd) {
            categoryNameStart += ', ...';
        }
        if (categoryNameEnd.length > 1) {
            categoryNameStart += ', ';
        }
        return categoryNameStart + categoryNameEnd;
    }
    static formatPropertyName(name) {
        // We don't need a strict test for whether a property name follows the
        // rules for being a JS identifier, but property names containing commas,
        // quotation marks, or braces could cause confusion, so we'll escape those.
        if (/[,'"{}]/.test(name)) {
            name = JSON.stringify({ [name]: 0 });
            name = name.substring(1, name.length - 3);
        }
        return name;
    }
    id() {
        const snapshot = this.snapshot;
        return snapshot.nodes.getValue(this.nodeIndex + snapshot.nodeIdOffset);
    }
    isHidden() {
        return this.rawType() === this.snapshot.nodeHiddenType;
    }
    isArray() {
        return this.rawType() === this.snapshot.nodeArrayType;
    }
    isSynthetic() {
        return this.rawType() === this.snapshot.nodeSyntheticType;
    }
    isUserRoot() {
        return !this.isSynthetic();
    }
    isDocumentDOMTreesRoot() {
        return this.isSynthetic() && this.rawName() === '(Document DOM trees)';
    }
    serialize() {
        const result = super.serialize();
        const snapshot = this.snapshot;
        const flags = snapshot.flagsOfNode(this);
        if (flags & snapshot.nodeFlags.canBeQueried) {
            result.canBeQueried = true;
        }
        if (flags & snapshot.nodeFlags.detachedDOMTreeNode) {
            result.detachedDOMTreeNode = true;
        }
        return result;
    }
}
export class JSHeapSnapshotEdge extends HeapSnapshotEdge {
    constructor(snapshot, edgeIndex) {
        super(snapshot, edgeIndex);
    }
    clone() {
        const snapshot = this.snapshot;
        return new JSHeapSnapshotEdge(snapshot, this.edgeIndex);
    }
    hasStringName() {
        if (!this.isShortcut()) {
            return this.hasStringNameInternal();
        }
        // @ts-ignore parseInt is successful against numbers.
        return isNaN(parseInt(this.nameInternal(), 10));
    }
    isElement() {
        return this.rawType() === this.snapshot.edgeElementType;
    }
    isHidden() {
        return this.rawType() === this.snapshot.edgeHiddenType;
    }
    isWeak() {
        return this.rawType() === this.snapshot.edgeWeakType;
    }
    isInternal() {
        return this.rawType() === this.snapshot.edgeInternalType;
    }
    isInvisible() {
        return this.rawType() === this.snapshot.edgeInvisibleType;
    }
    isShortcut() {
        return this.rawType() === this.snapshot.edgeShortcutType;
    }
    name() {
        const name = this.nameInternal();
        if (!this.isShortcut()) {
            return String(name);
        }
        // @ts-ignore parseInt is successful against numbers.
        const numName = parseInt(name, 10);
        return String(isNaN(numName) ? name : numName);
    }
    toString() {
        const name = this.name();
        switch (this.type()) {
            case 'context':
                return '->' + name;
            case 'element':
                return '[' + name + ']';
            case 'weak':
                return '[[' + name + ']]';
            case 'property':
                return name.indexOf(' ') === -1 ? '.' + name : '["' + name + '"]';
            case 'shortcut':
                if (typeof name === 'string') {
                    return name.indexOf(' ') === -1 ? '.' + name : '["' + name + '"]';
                }
                return '[' + name + ']';
            case 'internal':
            case 'hidden':
            case 'invisible':
                return '{' + name + '}';
        }
        return '?' + name + '?';
    }
    hasStringNameInternal() {
        const type = this.rawType();
        const snapshot = this.snapshot;
        return type !== snapshot.edgeElementType && type !== snapshot.edgeHiddenType;
    }
    nameInternal() {
        return this.hasStringNameInternal() ? this.snapshot.strings[this.nameOrIndex()] : this.nameOrIndex();
    }
    nameOrIndex() {
        return this.edges.getValue(this.edgeIndex + this.snapshot.edgeNameOffset);
    }
    rawType() {
        return this.edges.getValue(this.edgeIndex + this.snapshot.edgeTypeOffset);
    }
    nameIndex() {
        if (!this.hasStringNameInternal()) {
            throw new Error('Edge does not have string name');
        }
        return this.nameOrIndex();
    }
}
export class JSHeapSnapshotRetainerEdge extends HeapSnapshotRetainerEdge {
    constructor(snapshot, retainerIndex) {
        super(snapshot, retainerIndex);
    }
    clone() {
        const snapshot = this.snapshot;
        return new JSHeapSnapshotRetainerEdge(snapshot, this.retainerIndex());
    }
    isHidden() {
        return this.edge().isHidden();
    }
    isInvisible() {
        return this.edge().isInvisible();
    }
    isShortcut() {
        return this.edge().isShortcut();
    }
    isWeak() {
        return this.edge().isWeak();
    }
}
//# sourceMappingURL=HeapSnapshot.js.map