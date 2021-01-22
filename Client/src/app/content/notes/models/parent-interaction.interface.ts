export interface ParentInteraction{
    setFocus($event?);
    setFocusToEnd();
    updateHTML(content: string);
    getNative();
    mouseEnter($event);
    mouseOut($event);
}
