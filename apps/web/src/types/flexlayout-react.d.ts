declare module 'flexlayout-react' {
    export class Model {
        static fromJson(json: any): Model;
        doAction(action: any): void;
        getActiveTabset(): any;
        getRoot(): any;
    }
    export class Actions {
        static addNode(json: any, toNodeId: string, location: any, index?: number): any;
    }
    export class Layout extends React.Component<any> { }
    export class TabNode {
        getComponent(): string;
    }
    export interface IJsonModel {
        global?: any;
        borders?: any[];
        layout: any;
    }
    export class DockLocation {
        static TOP: any;
        static BOTTOM: any;
        static LEFT: any;
        static RIGHT: any;
        static CENTER: any;
        getName(): string;
    }
}
