import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Ticket, CreateTicketDto } from "@/types/api";

/**
 * Create a new patient ticket
 */
export async function createTicket(data: CreateTicketDto): Promise<Ticket> {
  try {
    const response = await apiClient.post<Ticket>("/tickets", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get ticket by ticket number
 */
export async function getTicketByNumber(ticketNumber: string): Promise<Ticket> {
  try {
    const response = await apiClient.get<Ticket>(`/tickets/number/${ticketNumber}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get ticket by ID
 */
export async function getTicketById(id: string): Promise<Ticket> {
  try {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get tickets by patient ID
 */
export async function getTicketsByPatient(patientId: string): Promise<Ticket[]> {
  try {
    const response = await apiClient.get<Ticket[]>(`/tickets/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get tickets by hospital ID
 */
export async function getTicketsByHospital(hospitalId: string): Promise<Ticket[]> {
  try {
    const response = await apiClient.get<Ticket[]>(`/tickets/hospital/${hospitalId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get QR code for a ticket
 */
export async function getTicketQRCode(ticketNumber: string): Promise<{ qrCode: string }> {
  try {
    const response = await apiClient.get<{ qrCode: string }>(
      `/tickets/number/${ticketNumber}/qr`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

