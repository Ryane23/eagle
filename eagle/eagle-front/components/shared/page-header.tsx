"use client";

import { memo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export type PageHeaderAction = {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
};

export type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: PageHeaderAction[];
  children?: ReactNode;
  className?: string;
};

function PageHeaderComponent({
  title,
  description,
  icon: Icon,
  iconColor = "text-indigo-600",
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h1 className="text-lg font-bold text-primary flex items-center gap-1.5">
          {Icon && <Icon className={`size-5 ${iconColor}`} />}
          {title}
        </h1>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions?.map((action, index) => {
          const ActionIcon = action.icon;
          const buttonContent = (
            <>
              {ActionIcon && <ActionIcon className="size-3.5 mr-1.5" />}
              {action.label}
            </>
          );

          if (action.href) {
            return (
              <Button
                key={index}
                variant={action.variant || "default"}
                size="sm"
                className="h-8 text-xs"
                asChild
              >
                <a href={action.href}>{buttonContent}</a>
              </Button>
            );
          }

          return (
            <Button
              key={index}
              variant={action.variant || "default"}
              size="sm"
              className="h-8 text-xs"
              onClick={action.onClick}
            >
              {buttonContent}
            </Button>
          );
        })}
        {children}
      </div>
    </div>
  );
}

export const PageHeader = memo(PageHeaderComponent);

