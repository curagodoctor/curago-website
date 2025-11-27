// src/components/ui/card.tsx
import * as React from "react";
import { cn } from "./utils";

// Base types
type DivRef = React.ElementRef<"div">;
type DivProps = React.ComponentPropsWithoutRef<"div">;

// ---------- CARD ----------
export const Card = React.forwardRef<DivRef, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

// ---------- CARD HEADER ----------
export const CardHeader = React.forwardRef<DivRef, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// ---------- CARD TITLE ----------
export const CardTitle = React.forwardRef<
  React.ElementRef<"h4">,
  React.ComponentPropsWithoutRef<"h4">
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    data-slot="card-title"
    className={cn("leading-none", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// ---------- CARD DESCRIPTION ----------
export const CardDescription = React.forwardRef<
  React.ElementRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn("text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// ---------- CARD ACTION ----------
export const CardAction = React.forwardRef<DivRef, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
);
CardAction.displayName = "CardAction";

// ---------- CARD CONTENT ----------
export const CardContent = React.forwardRef<DivRef, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

// ---------- CARD FOOTER ----------
export const CardFooter = React.forwardRef<DivRef, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6 pb-6 [.border-t]:pt-6",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
