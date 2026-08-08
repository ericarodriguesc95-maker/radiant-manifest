import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  const checkScroll = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    const left = Math.round(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(left > 2);
    setCanScrollRight(max > 2 && left < max - 2);
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = innerRef.current;
    if (!el) return;
    const resizeObs = new ResizeObserver(checkScroll);
    resizeObs.observe(el);
    window.addEventListener("resize", checkScroll);
    return () => {
      resizeObs.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scrollBy = (direction: -1 | 1) => {
    const el = innerRef.current;
    if (!el) return;
    const gap = parseInt(getComputedStyle(el).gap || "16", 10) || 16;
    el.scrollBy({ left: direction * (el.clientWidth * 0.55 + gap), behavior: "smooth" });
  };

  return (
    <div className="relative flex w-full items-center">
      {canScrollLeft && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 z-10 h-7 w-7 shrink-0 rounded-full bg-gradient-to-r from-[hsl(32,30%,97%,0.95)] to-[hsl(32,30%,97%,0.6)] text-primary shadow-sm hover:text-primary/80"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      <TabsPrimitive.List
        ref={innerRef}
        onScroll={checkScroll}
        className={cn(
          // Editorial compacto: trilho hairline com botões de navegação, scroll horizontal.
          "flex w-full items-center gap-3 sm:gap-4 overflow-x-auto overscroll-x-contain border-b border-border/70 bg-transparent pb-0 text-muted-foreground select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] px-8 sm:px-9",
          className,
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
      {canScrollRight && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => scrollBy(1)}
          className="absolute right-0 z-10 h-7 w-7 shrink-0 rounded-full bg-gradient-to-l from-[hsl(32,30%,97%,0.95)] to-[hsl(32,30%,97%,0.6)] text-primary shadow-sm hover:text-primary/80"
          aria-label="Próximo"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
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
