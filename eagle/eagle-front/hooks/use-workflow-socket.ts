"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

export function useWorkflowSocket(enabled = true) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!enabled) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const url = (
            process.env.NEXT_PUBLIC_WS_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:3001"
        )
            .replace(/^ws:/, "http:")
            .replace(/^wss:/, "https:")
            .replace(/\/$/, "");
        const socket = io(`${url}/workflow`, {
            auth: { token },
            transports: ["polling", "websocket"],
        });
        socket.on("workflow.updated", () => {
            queryClient.invalidateQueries({ queryKey: ["workflow"] });
            queryClient.invalidateQueries({ queryKey: ["queue"] });
            queryClient.invalidateQueries({ queryKey: ["consultations"] });
            queryClient.invalidateQueries({ queryKey: ["urgencies"] });
        });
        return () => {
            socket.disconnect();
        };
    }, [enabled, queryClient]);
}
