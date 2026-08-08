import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const drag = React.useRef({ active: false, moved: false, startX: 0, startScroll: 0 });

  React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

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
    <TabsPrimitive.List
      ref={innerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
      className={cn(
        // Editorial compacto: trilho hairline, arrastável no desktop/tablet, scroll nativo no mobile.
        "flex w-full items-center gap-3 sm:gap-4 overflow-x-auto overscroll-x-contain border-b border-border/70 bg-transparent pb-0 text-muted-foreground cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]",
        className,
      )}
      {...props}
    />
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
