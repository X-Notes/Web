export interface ParentInteraction{
    setFocus($event?);
    setFocusToEnd();
    updateHTML(content: string);
    getNative();
    getContent();
    mouseEnter($event);
    mouseOut($event);
}
