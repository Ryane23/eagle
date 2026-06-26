"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

type NotificationDetailModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notification: {
        id: string;
        title: string;
        message: string;
        time: string;
        timestamp?: string;
        type?: string;
        priority?: "normal" | "urgent";
        actionUrl?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details?: Record<string, any>;
    } | null;
};

export function NotificationDetailModal({
    open,
    onOpenChange,
    notification,
}: NotificationDetailModalProps) {
    if (!notification) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="text-xl mb-2">
                                {notification.title}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2">
                                <Clock className="size-4" />
                                <span>{notification.time}</span>
                                {notification.timestamp && (
                                    <>
                                        <span>•</span>
                                        <span>{notification.timestamp}</span>
                                    </>
                                )}
                            </DialogDescription>
                        </div>
                        {notification.priority === "urgent" && (
                            <Badge variant="destructive">Urgent</Badge>
                        )}
                    </div>
                </DialogHeader>

                <Separator />

                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Message</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {notification.message}
                        </p>
                    </div>

                    {notification.details && Object.keys(notification.details).length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-medium mb-2">Détails</h4>
                                <div className="space-y-2">
                                    {Object.entries(notification.details).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground capitalize">
                                                {key.replace(/([A-Z])/g, " $1").trim()}:
                                            </span>
                                            <span className="font-medium">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {notification.actionUrl && (
                        <>
                            <Separator />
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Fermer
                                </Button>
                                <Button asChild>
                                    <Link href={notification.actionUrl}>
                                        <ExternalLink className="size-4 mr-2" />
                                        Aller à la page
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}







