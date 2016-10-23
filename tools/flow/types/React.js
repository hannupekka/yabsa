declare class ElementEvent<E> extends Event {
  target: E
}

declare type ElementType = React$Element<any>;
declare type DOMEvent = ElementEvent<HTMLInputElement>;
