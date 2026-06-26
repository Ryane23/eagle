"use client";

import { memo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FileX, SearchX, Users, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type EmptyStateVariant = "search" | "data" | "users" | "inbox" | "custom";

export type EmptyStateProps = {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  className?: string;
};

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  search: SearchX,
  data: FileX,
  users: Users,
  inbox: Inbox,
  custom: FileX,
};

function EmptyStateComponent({
  variant = "data",
  icon,
  title,
  description,
  action,
  children,
  className,
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="size-12 mx-auto text-muted-foreground mb-3 opacity-50" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}

export const EmptyState = memo(EmptyStateComponent);

