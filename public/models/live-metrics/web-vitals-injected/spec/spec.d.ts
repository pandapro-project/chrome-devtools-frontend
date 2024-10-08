import { type INPAttribution, type MetricType } from '../../../../third_party/web-vitals/web-vitals.js';
export declare const EVENT_BINDING_NAME = "__chromium_devtools_metrics_reporter";
export declare const INTERNAL_KILL_SWITCH = "__chromium_devtools_kill_live_metrics";
export type MetricChangeEvent = Pick<MetricType, 'name' | 'value'>;
export interface LCPChangeEvent extends MetricChangeEvent {
    name: 'LCP';
    nodeIndex?: number;
}
export interface CLSChangeEvent extends MetricChangeEvent {
    name: 'CLS';
}
export interface INPChangeEvent extends MetricChangeEvent {
    name: 'INP';
    interactionType: INPAttribution['interactionType'];
    nodeIndex?: number;
}
export interface InteractionEvent {
    name: 'Interaction';
    interactionType: INPAttribution['interactionType'];
    interactionId: number;
    duration: number;
    nodeIndex?: number;
}
export interface ResetEvent {
    name: 'reset';
}
export type WebVitalsEvent = LCPChangeEvent | CLSChangeEvent | INPChangeEvent | InteractionEvent | ResetEvent;
