import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Spec from './web-vitals-injected/spec/spec.js';
export declare class LiveMetrics extends Common.ObjectWrapper.ObjectWrapper<EventTypes> implements SDK.TargetManager.Observer {
    #private;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): LiveMetrics;
    get lcpValue(): LCPValue | undefined;
    get clsValue(): CLSValue | undefined;
    get inpValue(): INPValue | undefined;
    get interactions(): InteractionValue[];
    clearInteractions(): void;
    targetAdded(target: SDK.Target.Target): Promise<void>;
    targetRemoved(target: SDK.Target.Target): Promise<void>;
    enable(): Promise<void>;
    disable(): Promise<void>;
}
export declare const enum Events {
    STATUS = "status"
}
export type MetricValue = Pick<Spec.MetricChangeEvent, 'value'>;
export interface LCPValue extends MetricValue {
    node?: SDK.DOMModel.DOMNode;
}
export type INPValue = MetricValue;
export type CLSValue = MetricValue;
export type InteractionValue = Pick<Spec.InteractionEvent, 'interactionType' | 'duration'> & {
    node?: SDK.DOMModel.DOMNode;
};
export interface StatusEvent {
    lcp?: LCPValue;
    cls?: CLSValue;
    inp?: INPValue;
    interactions: InteractionValue[];
}
type EventTypes = {
    [Events.STATUS]: StatusEvent;
};
export {};
