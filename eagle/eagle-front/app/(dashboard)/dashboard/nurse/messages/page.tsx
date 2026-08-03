"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    MessageSquare,
    Send,
    Search,
    Plus,
    Paperclip,
    MoreVertical,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useCareTeamQuery } from "@/hooks/queries/use-workflow-query";
import { useNurseTeleconsultationConsultationsQuery } from "@/hooks/queries/use-consultations-query";
import { 
    useConversationMessagesQuery,
    useSendMessage,
} from "@/hooks/queries/use-messages-query";
import type { User, Message as ApiMessage, Consultation } from "@/types/api";

// Display type for contacts
type ContactDisplay = {
    id: string;
    name: string;
    role: string;
    center: string;
    function: string;
    status: "online" | "offline";
    lastActivity: string;
    unreadCount: number;
    urgent: boolean;
    consultationId?: string; // Link to consultation for messages
};

// Display type for messages
type MessageDisplay = {
    id: string;
    from: ContactDisplay;
    content: string;
    timestamp: string;
    type: "text" | "image" | "file" | "video";
    isOwn: boolean;
};

// Map User to ContactDisplay
function userToContact(user: User, consultation?: Consultation): ContactDisplay {
    // Calculate time since last login
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    const now = new Date();
    const diffMs = lastLogin ? now.getTime() - lastLogin.getTime() : Infinity;
    const diffMins = Math.floor(diffMs / 60000);
    const lastActivity = diffMins < 60 
        ? `Il y a ${diffMins} min` 
        : diffMins < 1440 
            ? `Il y a ${Math.floor(diffMins / 60)}h` 
            : "Il y a plus d'un jour";
    
    // Determine online status (within last 15 minutes)
    const status = diffMins <= 15 ? "online" : "offline";
    
    // Determine function from role
    const functionMap: Record<string, string> = {
        DOCTOR: "Médecin",
        NURSE: "Infirmier(e)",
        SECRETARY: "Secrétaire",
        ADMIN: "Administrateur",
        PRIMARY_DOCTOR: "Médecin Principal",
    };
    
    return {
        id: user.id,
        name: user.name,
        role: user.role,
        center: user.hospital?.name || "Centre inconnu",
        function: functionMap[user.role] || user.role,
        status,
        lastActivity,
        unreadCount: 0, // Would need to fetch from messages API
        urgent: false, // Would need urgency logic
        consultationId: consultation?.id,
    };
}

// Map API Message to MessageDisplay
function apiMessageToDisplay(
    message: ApiMessage, 
    contacts: ContactDisplay[], 
    currentUserId: string
): MessageDisplay {
    const sender = contacts.find(c => c.id === message.senderId);
    const isOwn = message.senderId === currentUserId;
    
    return {
        id: message.id,
        from: sender || {
            id: message.senderId,
            name: isOwn ? "Vous" : "Utilisateur inconnu",
            role: "",
            center: "",
            function: "",
            status: "offline",
            lastActivity: "",
            unreadCount: 0,
            urgent: false,
        },
        content: message.content,
        timestamp: new Date(message.createdAt).toLocaleTimeString("fr-FR", { 
            hour: "2-digit", 
            minute: "2-digit" 
        }),
        type: "text",
        isOwn,
    };
}

export default function NurseMessagingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "urgent" | "resolved">("all");
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [newMessageOpen, setNewMessageOpen] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [newMessageSearch, setNewMessageSearch] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const currentUserId = useAuthStore((state) => state.user?.id) || "";

    const {
        data: users = [],
        isLoading: usersLoading,
        refetch: refetchUsers,
    } = useCareTeamQuery();
    
    const {
        data: consultations = [],
        isLoading: consultationsLoading,
    } = useNurseTeleconsultationConsultationsQuery();
    
    // Build contacts from users
    const contacts = useMemo(() => {
        // Filter to relevant roles and add consultation links
        return users
            .filter(u =>
                u.id !== currentUserId &&
                ["doctor", "nurse", "secondary_secretary", "primary_secretary", "admin"].includes(u.role)
            )
            .map(user => {
                // Find a consultation involving this user
                const consultation = consultations.find(
                    c => c.doctor?.id === user.id || c.patient?.id === user.id
                );
                return userToContact(user, consultation);
            });
    }, [users, consultations, currentUserId]);
    
    // Get selected contact and their consultation
    const selectedContact = selectedContactId 
        ? contacts.find(c => c.id === selectedContactId) 
        : null;
    
    // Fetch messages for the selected consultation
    const { 
        data: apiMessages = [], 
        isLoading: messagesLoading,
        refetch: refetchMessages 
    } = useConversationMessagesQuery(
        selectedContact?.id || "",
        selectedContact?.consultationId,
    );
    
    // Send message mutation
    const sendMessageMutation = useSendMessage();
    
    // Transform API messages to display format
    const messages = useMemo(() => 
        apiMessages.map(msg => apiMessageToDisplay(msg, contacts, currentUserId)),
        [apiMessages, contacts, currentUserId]
    );

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedContactId, messages]);

    // Filter conversations
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            contact.function.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            contact.center.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeTab === "urgent") {
            return matchesSearch && contact.urgent;
        }
        if (activeTab === "resolved") {
            return matchesSearch && contact.unreadCount === 0 && !contact.urgent;
        }
        return matchesSearch;
    });

    const filteredNewMessageContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(newMessageSearch.toLowerCase()) ||
        contact.function.toLowerCase().includes(newMessageSearch.toLowerCase())
    );

    const handleSendMessage = () => {
        if (!messageText.trim() || !selectedContact) return;
        
        sendMessageMutation.mutate({
            consultationId: selectedContact.consultationId,
            receiverId: selectedContact.id,
            content: messageText.trim(),
            type: "text",
        }, {
            onSuccess: () => {
                setMessageText("");
                refetchMessages();
            },
        });
    };

    const handleStartConversation = (contactId: string) => {
        setSelectedContactId(contactId);
        setNewMessageOpen(false);
    };

    const urgentCount = contacts.filter(c => c.urgent).length;
    const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);
    
    const isLoading = usersLoading || consultationsLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <EnhancedNurseDashboardHeader />
                <div className="flex-1 flex overflow-hidden min-h-0">
                    {/* Left sidebar skeleton */}
                    <div className="w-80 border-r bg-muted/30 p-4 space-y-3">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    </div>
                    {/* Right panel skeleton */}
                    <div className="flex-1 flex flex-col">
                        <Skeleton className="h-16 w-full border-b" />
                        <div className="flex-1 p-4 space-y-3">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-12 w-3/4" />
                            ))}
                        </div>
                        <Skeleton className="h-20 w-full border-t" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <EnhancedNurseDashboardHeader />

            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Conversation List - Left Side */}
                <div className="w-80 border-r bg-muted/30 flex flex-col min-h-0">
                    {/* Header with New Message Button */}
                    <div className="p-2 border-b shrink-0 flex gap-2">
                        <Button
                            className="flex-1 h-8 text-xs"
                            size="sm"
                            onClick={() => setNewMessageOpen(true)}
                        >
                            <Plus className="size-3.5 mr-1.5" />
                            Nouveau message
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => refetchUsers()}
                        >
                            <RefreshCw className="size-3.5" />
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-2 border-b shrink-0">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-xs"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="border-b shrink-0">
                        <TabsList className="w-full grid grid-cols-3 rounded-none border-b-0 h-8">
                            <TabsTrigger value="all" className="flex-1 text-xs px-2">
                                Tous
                                {totalUnread > 0 && (
                                    <Badge variant="secondary" className="ml-1 size-4 p-0 text-[10px]">
                                        {totalUnread}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="urgent" className="flex-1 text-xs px-2">
                                Urgent
                                {urgentCount > 0 && (
                                    <Badge variant="destructive" className="ml-1 size-4 p-0 text-[10px]">
                                        {urgentCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="resolved" className="flex-1 text-xs px-2">
                                Résolu
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Conversation List */}
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="p-1.5 space-y-1">
                            {filteredContacts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
                                    <p>Aucun contact trouvé</p>
                                </div>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <Card
                                        key={contact.id}
                                        className={`cursor-pointer transition-all hover:shadow-md ${
                                            selectedContactId === contact.id
                                                ? "bg-primary/10 border-primary"
                                                : ""
                                        } ${contact.urgent ? "border-l-4 border-l-orange-500" : ""}`}
                                        onClick={() => setSelectedContactId(contact.id)}
                                    >
                                        <CardContent className="p-2">
                                            <div className="flex items-start gap-2">
                                                <Avatar className="size-8">
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                        {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                    </AvatarFallback>
                                                    {contact.status === "online" && (
                                                        <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-white rounded-full" />
                                                    )}
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <p className="font-medium text-xs truncate">{contact.name}</p>
                                                        {contact.urgent && (
                                                            <AlertCircle className="size-3 text-orange-500 shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {contact.function}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {contact.lastActivity}
                                                        </p>
                                                        {contact.unreadCount > 0 && (
                                                            <Badge variant="default" className="size-4 p-0 text-[10px]">
                                                                {contact.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Message Panel - Right Side */}
                <div className="flex-1 flex flex-col min-h-0">
                    {selectedContact ? (
                        <>
                            {/* Message Panel Header */}
                            <div className="p-3 border-b flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <Avatar className="size-9">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {selectedContact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                        </AvatarFallback>
                                        {selectedContact.status === "online" && (
                                            <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full" />
                                        )}
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">{selectedContact.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedContact.function} • {selectedContact.center}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="size-8"
                                        onClick={() => refetchMessages()}
                                    >
                                        <RefreshCw className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="size-8">
                                        <MoreVertical className="size-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages List */}
                            <ScrollArea className="flex-1 min-h-0 p-3">
                                {messagesLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <Skeleton key={i} className={`h-12 ${i % 2 === 0 ? 'w-3/4 ml-auto' : 'w-3/4'}`} />
                                        ))}
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center text-muted-foreground">
                                            <MessageSquare className="size-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Aucun message</p>
                                            <p className="text-xs mt-1">
                                                Envoyez le premier message
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-lg p-2 ${
                                                        message.isOwn
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted"
                                                    }`}
                                                >
                                                    {!message.isOwn && (
                                                        <p className="text-xs font-medium mb-0.5 opacity-80">
                                                            {message.from.name}
                                                        </p>
                                                    )}
                                                    <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                                                    <p className="text-[10px] opacity-70 mt-0.5">
                                                        {message.timestamp}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Message Input */}
                            <div className="p-3 border-t shrink-0">
                                <div className="flex items-end gap-2">
                                        <div className="relative flex-1">
                                            <Textarea
                                                placeholder="Tapez votre message..."
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                className="min-h-[50px] max-h-[100px] resize-none pr-16 text-sm"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                            />
                                            <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7"
                                                    title="Pièce jointe"
                                                >
                                                    <Paperclip className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!messageText.trim() || sendMessageMutation.isPending}
                                            size="sm"
                                            className="h-[50px]"
                                        >
                                            <Send className="size-4" />
                                        </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center min-h-0">
                            <div className="text-center">
                                <MessageSquare className="size-12 mx-auto text-muted-foreground mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    Sélectionnez une conversation
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Message Modal */}
            <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Nouvelle conversation</DialogTitle>
                        <DialogDescription>
                            Sélectionnez un contact pour démarrer une conversation
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par nom, centre ou fonction..."
                                value={newMessageSearch}
                                onChange={(e) => setNewMessageSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Contacts List */}
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-2">
                                {filteredNewMessageContacts.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>Aucun contact trouvé</p>
                                    </div>
                                ) : (
                                    filteredNewMessageContacts.map((contact) => (
                                        <Card
                                            key={contact.id}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => handleStartConversation(contact.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-10">
                                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                                            {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                        </AvatarFallback>
                                                        {contact.status === "online" && (
                                                            <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full" />
                                                        )}
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{contact.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {contact.function} • {contact.center}
                                                        </p>
                                                    </div>
                                                    {contact.consultationId && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Consultation active
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
