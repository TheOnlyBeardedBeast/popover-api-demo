import React, {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useFloating,
  Placement,
  offset,
  flip,
  autoUpdate,
} from "@floating-ui/react-dom";

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  anchor: React.RefObject<HTMLElement>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        !anchor.current?.contains(event.target as Node)
      ) {
        callback();
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

type PopoverProps = {
  id: string;
  placement?: Placement;
};

type PopoverType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  handleAnchorKeyDown: (event: React.KeyboardEvent) => void;
  handleContentKeyDown: (event: React.KeyboardEvent) => void;
  setAnchorReference: (ref: HTMLElement) => void;
  setContentReference: (ref: HTMLDivElement) => void;
  floatingStyles: React.CSSProperties;
} & PopoverProps;

const PopoverContext = createContext<PopoverType | null>(null);

const usePopover = () => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error("Popover context not initialized.");
  }

  return context;
};

type PopoverComposition = {
  Anchor: React.FC<{
    children: React.ReactElement;
  }>;
  Content: React.FC<React.PropsWithChildren>;
};

export const Popover: React.FC<React.PropsWithChildren<PopoverProps>> &
  PopoverComposition = ({ children, placement, ...rest }) => {
  const anchorRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { refs, floatingStyles } = useFloating({
    placement: placement,
    middleware: [offset(8), flip()],
    whileElementsMounted: autoUpdate,
  });

  const [isOpen, setIsopen] = useState(false);

  const trapFocus = () => {
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      contentRef.current?.querySelectorAll(focusableSelector);

    if (!focusableElements || focusableElements?.length === 0) {
      return; // No focusable elements, nothing to trap
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    contentRef.current?.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            anchorRef.current?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            close();
          }
        }
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      trapFocus();
    }
  }, [isOpen]);

  const setAnchorReference = (ref: HTMLElement) => {
    refs.setReference(ref);
    //@ts-ignore
    anchorRef.current = ref;
  };

  const setContentReference = (ref: HTMLDivElement) => {
    refs.setFloating(ref);
    //@ts-ignore
    contentRef.current = ref;
  };

  const open = () => {
    setIsopen(true);
    contentRef.current?.focus();
  };

  const close = () => {
    setIsopen(false);
    anchorRef.current?.focus();
  };

  const toggle = () => setIsopen((state) => !state);

  useClickOutside(contentRef, anchorRef, close);

  const handleContentKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      close();
      anchorRef.current?.focus();
    }
  };

  const handleAnchorKeyDown = (event: React.KeyboardEvent) => {
    if (["Enter", "Space"].includes(event.key)) {
      toggle();
      event.preventDefault();
    }

    if (event.key === "Tab" && event.shiftKey) {
      close();
    }

    if (event.key === "Escape") {
      close();
    }
  };

  const context = {
    isOpen,
    open,
    close,
    toggle,
    handleAnchorKeyDown,
    handleContentKeyDown,
    setAnchorReference,
    setContentReference,
    floatingStyles,
    placement,
    ...rest,
  };

  return (
    <PopoverContext.Provider value={context}>
      {children}
    </PopoverContext.Provider>
  );
};

const PopoverAnchor: React.FC<{
  children: React.ReactElement;
}> = ({ children }) => {
  const { id, toggle, isOpen, handleAnchorKeyDown, setAnchorReference } =
    usePopover();

  return cloneElement(children, {
    ...children.props,
    popovertarget: id,
    onClick: toggle,
    "aria-controls": id,
    "aria-describedby": id,
    "aria-expanded": isOpen,
    onKeyDown: handleAnchorKeyDown,
    ref: setAnchorReference,
  });
};

const PopoverCloseButton = () => {
  const { close } = usePopover();

  return (
    <button
      type="button"
      className="close-btn"
      aria-label="close"
      onClick={close}
    >
      X
    </button>
  );
};

const PopoverContent: React.FC<React.PropsWithChildren> = ({ children }) => {
  const {
    id,
    isOpen,
    handleContentKeyDown,
    setContentReference,
    floatingStyles,
  } = usePopover();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={setContentReference}
      role="tooltip"
      id={id}
      aria-hidden={!isOpen}
      popover="manual"
      onKeyDown={handleContentKeyDown}
      style={{
        border: "none",
        margin: 0,
        position: "absolute",
        display: isOpen ? "block" : "none",
        ...floatingStyles,
      }}
    >
      <PopoverCloseButton />
      {children}
    </div>
  );
};

Popover.Anchor = PopoverAnchor;
Popover.Content = PopoverContent;
