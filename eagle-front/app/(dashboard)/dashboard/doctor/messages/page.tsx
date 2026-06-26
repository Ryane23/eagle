"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    MessageSquare,
    Send,
    Search,
    AlertCircle,
    RefreshCw,
    User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    useConsultationsQuery,
    useConsultationMessagesQuery,
    useSendMessage,
    useMarkAllMessagesAsRead,
    useDeleteMessage,
    useUnreadMessageCountQuery,
} from "@/hooks/queries";
import type { Consultation, Message } from "@/types/api";
import { toast } from "sonner";

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Hier";
    }
    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
    });
};

export default function MessagesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Get active consultations (conversations are per consultation)
    const { data: consultations = [], isLoading: isLoadingConsultations, refetch } = useConsultationsQuery();

    // Filter to only show in_progress consultations that have active messaging
    const activeConsultations = useMemo(() => {
        return consultations.filter(
            (c: Consultation) => c.status === "in_progress" || c.status === "scheduled"
        );
    }, [consultations]);

    // Filtered consultations based on search
    const filteredConsultations = useMemo(() => {
        if (!searchQuery) return activeConsultations;
        return activeConsultations.filter((c: Consultation) => {
            const patientName = c.patient
                ? `${c.patient.firstName} ${c.patient.lastName}`.toLowerCase()
                : "";
            return patientName.includes(searchQuery.toLowerCase());
        });
    }, [activeConsultations, searchQuery]);

    // Messages for selected consultation
    const { data: messages = [], isLoading: isLoadingMessages } = useConsultationMessagesQuery(
        selectedConsultation?.id || ""
    );
    const sendMessageMutation = useSendMessage();
    const markAllReadMutation = useMarkAllMessagesAsRead();
    const deleteMessageMutation = useDeleteMessage();
    const { data: unreadCount } = useUnreadMessageCountQuery(selectedConsultation?.id || "");

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Mark messages as read when conversation is selected
    useEffect(() => {
        if (selectedConsultation?.id && unreadCount && unreadCount.count > 0) {
            markAllReadMutation.mutate(selectedConsultation.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedConsultation?.id, unreadCount?.count]);

    const handleDeleteMessage = useCallback(
        (messageId: string) => {
            if (!selectedConsultation) return;
            deleteMessageMutation.mutate({
                id: messageId,
                consultationId: selectedConsultation.id,
            });
        },
        [selectedConsultation, deleteMessageMutation]
    );

    const handleSendMessage = useCallback(() => {
        if (!newMessage.trim() || !selectedConsultation) return;
        sendMessageMutation.mutate({
            consultationId: selectedConsultation.id,
            content: newMessage.trim(),
        });
        setNewMessage("");
    }, [newMessage, selectedConsultation, sendMessageMutation]);

    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        },
        [handleSendMessage]
    );

    const handleRefresh = useCallback(() => {
        refetch();
        toast.success("Conversations actualisées");
    }, [refetch]);

    return (
        <div className="flex flex-col h-full">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Tableau de bord", href: "/dashboard/doctor" },
                    { label: "Messages" },
                ]}
                actions={
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="size-4 mr-2" />
                        Actualiser
                    </Button>
                }
            />

            <div className="flex-1 p-4 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Conversations List */}
                    <div className="col-span-4 flex flex-col">
                        <Card className="flex-1 flex flex-col overflow-hidden">
                            <CardContent className="p-3 border-b">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-semibold flex items-center gap-2">
                                        <MessageSquare className="size-4" />
                                        Conversations
                                    </h2>
                                    <Badge variant="secondary">
                                        {activeConsultations.length}
                                    </Badge>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9"
                                    />
                                </div>
                            </CardContent>
                            <ScrollArea className="flex-1">
                                {isLoadingConsultations ? (
                                    <div className="p-3 space-y-2">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="flex gap-3 p-2">
                                                <Skeleton className="size-10 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredConsultations.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <MessageSquare className="size-10 mx-auto text-muted-foreground mb-2 opacity-50" />
                                        <p className="text-sm text-muted-foreground">
                                            Aucune conversation active
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {filteredConsultations.map((consultation) => {
                                            const isSelected = selectedConsultation?.id === consultation.id;
                                            const patientName = consultation.patient
                                                ? `${consultation.patient.firstName} ${consultation.patient.lastName}`
                                                : "Patient";

                                            return (
                                                <div
                                                    key={consultation.id}
                                                    className={`p-3 cursor-pointer transition-colors ${isSelected
                                                        ? "bg-primary/10"
                                                        : "hover:bg-muted/50"
                                                        }`}
                                                    onClick={() => setSelectedConsultation(consultation)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Avatar className="size-10">
                                                            <AvatarFallback>
                                                                {patientName
                                                                    .split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-medium text-sm truncate">
                                                                    {patientName}
                                                                </p>
                                                                <Badge
                                                                    variant={
                                                                        consultation.status === "in_progress"
                                                                            ? "default"
                                                                            : "secondary"
                                                                    }
                                                                    className="text-[10px]"
                                                                >
                                                                    {consultation.status === "in_progress"
                                                                        ? "En cours"
                                                                        : "Planifié"}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {consultation.type === "video" ? "Vidéo" : "Consultation"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </Card>
                    </div>

                    {/* Chat Area */}
                    <div className="col-span-8 flex flex-col">
                        <Card className="flex-1 flex flex-col overflow-hidden">
                            {selectedConsultation ? (
                                <>
                                    {/* Chat Header */}
                                    <CardContent className="p-3 border-b">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-10">
                                                    <AvatarFallback>
                                                        {selectedConsultation.patient
                                                            ? `${selectedConsultation.patient.firstName[0]}${selectedConsultation.patient.lastName[0]}`
                                                            : "P"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">
                                                        {selectedConsultation.patient
                                                            ? `${selectedConsultation.patient.firstName} ${selectedConsultation.patient.lastName}`
                                                            : "Patient"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {selectedConsultation.type === "video" ? "Vidéo" : "Consultation"}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedConsultation.urgencyLevel && (
                                                <Badge variant="destructive" className="gap-1">
                                                    <AlertCircle className="size-3" />
                                                    Urgence
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>

                                    {/* Messages */}
                                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                                        {isLoadingMessages ? (
                                            <div className="space-y-4">
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                                                    >
                                                        <Skeleton className="h-16 w-64 rounded-lg" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="h-full flex items-center justify-center">
                                                <div className="text-center">
                                                    <MessageSquare className="size-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Aucun message
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Commencez la conversation
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {messages.map((message: Message, index: number) => {
                                                    const isOwnMessage = message.senderId === selectedConsultation.doctorId;
                                                    const showDate =
                                                        index === 0 ||
                                                        formatDate(message.createdAt) !==
                                                        formatDate(messages[index - 1].createdAt);

                                                    return (
                                                        <div key={message.id}>
                                                            {showDate && (
                                                                <div className="flex justify-center my-4">
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {formatDate(message.createdAt)}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                            <div
                                                                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"
                                                                    }`}
                                                            >
                                                                <div className="group relative">
                                                                    <div
                                                                        className={`max-w-[70%] p-3 rounded-lg ${isOwnMessage
                                                                            ? "bg-primary text-primary-foreground"
                                                                            : "bg-muted"
                                                                            }`}
                                                                    >
                                                                        <p className="text-sm">{message.content}</p>
                                                                        <div
                                                                            className={`flex items-center gap-1 mt-1 ${isOwnMessage
                                                                                ? "text-primary-foreground/70"
                                                                                : "text-muted-foreground"
                                                                                }`}
                                                                        >
                                                                            <span className="text-[10px]">
                                                                                {formatTime(message.createdAt)}
                                                                            </span>
                                                                            {isOwnMessage && message.isRead && (
                                                                                <span className="text-[10px]">
                                                                                    ✓✓
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {isOwnMessage && (
                                                                        <button
                                                                            onClick={() => handleDeleteMessage(message.id)}
                                                                            className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center size-5 rounded-full bg-destructive text-destructive-foreground text-[10px]"
                                                                            title="Supprimer"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </ScrollArea>

                                    {/* Message Input */}
                                    <CardContent className="p-3 border-t">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Écrivez votre message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                className="flex-1"
                                                disabled={sendMessageMutation.isPending}
                                            />
                                            <Button
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                                            >
                                                <Send className="size-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <User className="size-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                                        <p className="text-lg font-medium text-muted-foreground">
                                            Sélectionnez une conversation
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Choisissez une consultation pour voir les messages
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
