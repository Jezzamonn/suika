export interface PhysObject {
    body: any;
    elem: HTMLElement;

    updateElemPosition?: () => void;
}
