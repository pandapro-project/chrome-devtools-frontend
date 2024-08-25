// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Root from '../../../core/root/root.js';
import * as UI from '../../../ui/legacy/legacy.js';
import { SidebarAnnotationsTab } from './SidebarAnnotationsTab.js';
import { SidebarInsightsTab } from './SidebarInsightsTab.js';
export class RemoveAnnotation extends Event {
    removedAnnotation;
    static eventName = 'removeannotation';
    constructor(removedAnnotation) {
        super(RemoveAnnotation.eventName, { bubbles: true, composed: true });
        this.removedAnnotation = removedAnnotation;
    }
}
export class EventReferenceClick extends Event {
    metricEvent;
    static eventName = 'sidebarmetricclick';
    constructor(metricEvent) {
        super(EventReferenceClick.eventName, { bubbles: true, composed: true });
        this.metricEvent = metricEvent;
    }
}
export const DEFAULT_SIDEBAR_TAB = "insights" /* SidebarTabs.INSIGHTS */;
export class SidebarWidget extends UI.Widget.VBox {
    #tabbedPane = new UI.TabbedPane.TabbedPane();
    #insightsView = new InsightsView();
    #annotationsView = new AnnotationsView();
    wasShown() {
        this.#tabbedPane.show(this.element);
        if (!this.#tabbedPane.hasTab("insights" /* SidebarTabs.INSIGHTS */) &&
            Root.Runtime.experiments.isEnabled("timeline-rpp-sidebar" /* Root.Runtime.ExperimentName.TIMELINE_INSIGHTS */)) {
            this.#tabbedPane.appendTab("insights" /* SidebarTabs.INSIGHTS */, 'Insights', this.#insightsView, undefined, undefined, false, false, 0, 'timeline.insights-tab');
        }
        if (!this.#tabbedPane.hasTab("annotations" /* SidebarTabs.ANNOTATIONS */) &&
            Root.Runtime.experiments.isEnabled("perf-panel-annotations" /* Root.Runtime.ExperimentName.TIMELINE_ANNOTATIONS */)) {
            this.#tabbedPane.appendTab('annotations', 'Annotations', this.#annotationsView, undefined, undefined, false, false, 1, 'timeline.annotations-tab');
        }
        // TODO: automatically select the right tab depending on what content is
        // available to us.
    }
    setAnnotations(updatedAnnotations, annotationEntryToColorMap) {
        this.#annotationsView.setAnnotations(updatedAnnotations, annotationEntryToColorMap);
    }
    setTraceParsedData(traceParsedData) {
        this.#insightsView.setTraceParsedData(traceParsedData);
    }
    setInsights(insights) {
        this.#insightsView.setInsights(insights);
    }
    setActiveInsight(activeInsight) {
        this.#insightsView.setActiveInsight(activeInsight);
    }
}
class InsightsView extends UI.Widget.VBox {
    #component = new SidebarInsightsTab();
    constructor() {
        super();
        this.element.classList.add('sidebar-insights');
        this.element.appendChild(this.#component);
    }
    setTraceParsedData(data) {
        this.#component.traceParsedData = data;
    }
    setInsights(data) {
        this.#component.insights = data;
    }
    setActiveInsight(active) {
        this.#component.activeInsight = active;
    }
}
class AnnotationsView extends UI.Widget.VBox {
    #component = new SidebarAnnotationsTab();
    constructor() {
        super();
        this.element.classList.add('sidebar-annotations');
        this.element.appendChild(this.#component);
    }
    setAnnotations(annotations, annotationEntryToColorMap) {
        this.#component.annotationEntryToColorMap = annotationEntryToColorMap;
        this.#component.annotations = annotations;
    }
}
//# sourceMappingURL=Sidebar.js.map