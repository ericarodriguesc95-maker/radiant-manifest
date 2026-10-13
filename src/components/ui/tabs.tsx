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
    const mutations = new MutationObserver(() => {
      checkScroll();
      const active = el.querySelector<HTMLElement>('[data-state="active"]');
      if (active && (active.offsetLeft < el.scrollLeft || active.offsetLeft + active.offsetWidth > el.scrollLeft + el.clientWidth)) {
        el.scrollTo({ left: active.offsetLeft - el.clientWidth / 2 + active.offsetWidth / 2, behavior: "instant" });
      }
    });
    mutations.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state"] });
    window.addEventListener("resize", checkScroll);
    return () => {
      resizeObs.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scrollBy = (direction: -1 | 1) => {
    const el = innerRef.current;
    if (!el) return;
    const gap = parseInt(getComputedStyle(el).gap || "16", 10) || 16;
    el.scrollBy({ left: direction * (el.clientWidth * 0.55 + gap), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <div className={cn("compact-tabs relative flex min-w-0 w-full items-center", (canScrollLeft || canScrollRight) && "px-9")}>
      {canScrollLeft && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 z-10 h-9 w-9 shrink-0 rounded-lg bg-card text-primary hover:text-primary/80"
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
          "flex min-w-0 w-full items-center gap-2 sm:gap-4 overflow-x-auto overscroll-x-contain border-b border-border/70 bg-transparent pb-0 text-muted-foreground select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] px-0",
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
          className="absolute right-0 z-10 h-9 w-9 shrink-0 rounded-lg bg-card text-primary hover:text-primary/80"
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
      "relative inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 border-transparent bg-transparent px-2 py-2 text-[11px] font-semibold tracking-normal leading-normal transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[state=active]:border-primary data-[state=active]:text-foreground disabled:pointer-events-none disabled:opacity-50 md:text-xs",
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
      "mt-3 sm:mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
