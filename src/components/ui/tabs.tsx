import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const drag = React.useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const [showScrollHint, setShowScrollHint] = React.useState(false);

  React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  const checkOverflow = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    setShowScrollHint(el.scrollWidth > el.clientWidth + 2);
  }, []);

  React.useEffect(() => {
    checkOverflow();
    const el = innerRef.current;
    if (!el) return;
    const resizeObs = new ResizeObserver(checkOverflow);
    resizeObs.observe(el);
    window.addEventListener("resize", checkOverflow);
    return () => {
      resizeObs.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [checkOverflow]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = innerRef.current;
    if (!el || e.pointerType === "touch") return; // touch usa scroll nativo
    drag.current = { active: true, moved: false, startX: e.clientX, startScroll: el.scrollLeft };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = innerRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  };

  const endDrag = () => {
    drag.current.active = false;
    setTimeout(() => (drag.current.moved = false), 0);
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="relative w-full">
      <TabsPrimitive.List
        ref={innerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onScroll={checkOverflow}
        onClickCapture={onClickCapture}
        className={cn(
          // Editorial compacto: trilho hairline, arrastável no desktop/tablet, scroll nativo no mobile.
          "flex w-full items-center gap-3 sm:gap-4 overflow-x-auto overscroll-x-contain border-b border-border/70 bg-transparent pb-0 text-muted-foreground cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]",
          className,
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
      {showScrollHint && (
        <div className="pointer-events-none absolute right-0 top-0 flex h-full items-center pl-6 pr-1">
          <div className="flex items-center gap-0.5 rounded-full bg-gradient-to-l from-[hsl(32,30%,97%,0.95)] via-[hsl(32,30%,97%,0.85)] to-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary/90 shadow-sm">
            <span className="hidden sm:inline">arraste</span>
            <span className="sm:hidden">deslize</span>
            <ChevronRight className="h-3 w-3 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;



const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap border-b-2 border-transparent bg-transparent px-0.5 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.1em] leading-none transition-all duration-300 hover:text-foreground focus-visible:outline-none data-[state=active]:border-primary data-[state=active]:text-foreground disabled:pointer-events-none disabled:opacity-50 md:text-[11px]",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-5 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
