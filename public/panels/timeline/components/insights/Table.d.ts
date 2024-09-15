export interface TableData {
    headers: string[];
    /** Each row is a tuple of values. */
    rows: Array<Array<string | number>>;
}
export declare class Table extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../../ui/lit-html/static.js").Static;
    set data(data: TableData);
    connectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-performance-table': Table;
    }
}
