import { type VariantProps, cva } from "class-variance-authority";

export const fadeIn = "animate-in fade-in duration-300";
export const slideIn = "animate-in slide-in-from-bottom-4 duration-300";
export const scaleIn = "animate-in zoom-in duration-300";
export const spinIn = "animate-in spin-in duration-300";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      hover: {
        lift: "hover:-translate-y-1 hover:shadow-md",
        glow: "hover:shadow-md hover:shadow-primary/20",
        none: "",
      },
    },
    defaultVariants: {
      hover: "none",
    },
  }
);

export type ButtonVariantsProps = VariantProps<typeof buttonVariants>;
export type CardVariantsProps = VariantProps<typeof cardVariants>;
