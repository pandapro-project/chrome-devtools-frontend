import * as Helpers from './helpers/helpers.js';
import * as Types from './types/types.js';
type EntryToNodeMap = Map<Types.TraceEvents.TraceEntry, Helpers.TreeHelpers.TraceEntryNode>;
export type FilterAction = FilterApplyAction | FilterUndoAction;
export declare const enum FilterApplyAction {
    MERGE_FUNCTION = "MERGE_FUNCTION",
    COLLAPSE_FUNCTION = "COLLAPSE_FUNCTION",
    COLLAPSE_REPEATING_DESCENDANTS = "COLLAPSE_REPEATING_DESCENDANTS"
}
export declare const enum FilterUndoAction {
    RESET_CHILDREN = "RESET_CHILDREN",
    UNDO_ALL_ACTIONS = "UNDO_ALL_ACTIONS"
}
export interface UserFilterAction {
    type: FilterAction;
    entry: Types.TraceEvents.TraceEntry;
}
export interface UserApplyFilterAction {
    type: FilterApplyAction;
    entry: Types.TraceEvents.TraceEntry;
}
/**
 * This class can take in a thread that has been generated by the
 * RendererHandler and apply certain actions to it in order to modify what is
 * shown to the user. These actions can be automatically applied by DevTools or
 * applied by the user.
 *
 * Once actions are applied, the invisibleEntries() method will return the
 * entries that are invisible, and this is the list of entries that should be
 * removed before rendering the resulting thread on the timeline.
 **/
export declare class EntriesFilter {
    #private;
    constructor(entryToNode: EntryToNodeMap);
    /**
     * Applies an action to hide entries or removes entries
     * from hidden entries array depending on the type of action.
     **/
    applyAction(action: UserFilterAction): void;
    /**
     * Returns the set of entries that are invisible given the set of applied actions.
     **/
    invisibleEntries(): Types.TraceEvents.TraceEventData[];
    isEntryModified(event: Types.TraceEvents.TraceEventData): boolean;
}
export {};
