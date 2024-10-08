import * as Types from '../types/types.js';
import { type InsightResult, type InsightSetContext, type RequiredData } from './types.js';
export type CLSInsightResult = InsightResult<{
    animationFailures?: readonly NoncompositedAnimationFailure[];
    shifts?: Map<Types.Events.LayoutShift, LayoutShiftRootCausesData>;
    clusters: Types.Events.SyntheticLayoutShiftCluster[];
}>;
export declare function deps(): ['Meta', 'Animations', 'LayoutShifts', 'NetworkRequests'];
export declare const enum AnimationFailureReasons {
    UNSUPPORTED_CSS_PROPERTY = "UNSUPPORTED_CSS_PROPERTY",
    TRANSFROM_BOX_SIZE_DEPENDENT = "TRANSFROM_BOX_SIZE_DEPENDENT",
    FILTER_MAY_MOVE_PIXELS = "FILTER_MAY_MOVE_PIXELS",
    NON_REPLACE_COMPOSITE_MODE = "NON_REPLACE_COMPOSITE_MODE",
    INCOMPATIBLE_ANIMATIONS = "INCOMPATIBLE_ANIMATIONS",
    UNSUPPORTED_TIMING_PARAMS = "UNSUPPORTED_TIMING_PARAMS"
}
export interface NoncompositedAnimationFailure {
    /**
     * Animation name.
     */
    name?: string;
    /**
     * Failure reason based on mask number defined in
     * https://source.chromium.org/search?q=f:compositor_animations.h%20%22enum%20FailureReason%22.
     */
    failureReasons: AnimationFailureReasons[];
    /**
     * Unsupported properties.
     */
    unsupportedProperties?: Types.Events.Animation['args']['data']['unsupportedProperties'];
}
export interface LayoutShiftRootCausesData {
    iframeIds: string[];
    fontRequests: Types.Events.SyntheticNetworkRequest[];
}
export declare function getNonCompositedFailure(event: Types.Events.SyntheticAnimationPair): NoncompositedAnimationFailure[];
export declare function generateInsight(parsedTrace: RequiredData<typeof deps>, context: InsightSetContext): CLSInsightResult;
