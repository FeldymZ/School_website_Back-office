/* ============================
   CONTACT TYPES
   ============================ */

export interface ContactMessage {
  id: number;

  senderName: string;
  senderEmail: string;

  message: string;
  sentAt: string;

  replied: boolean;
  repliedAt?: string;
  replyMessage?: string;

  /* ============================
     📎 PIÈCE JOINTE RÉPONSE
     ============================ */

  attachmentUrl?: string;
  attachmentName?: string;
}

/* ============================
   PAGINATION
   ============================ */

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  number: number;
}
