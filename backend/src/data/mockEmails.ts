export type RawEmail = {
  id: number;
  sender: string;
  subject: string;
  body: string;
};

export const mockEmails: RawEmail[] = [
  {
    id: 1,
    sender: "hr@example.com",
    subject: "Interview Schedule for Next Week",
    body: "Hi, we would like to schedule a 30-minute interview with you next Tuesday at 3 PM. Please confirm your availability."
  },
  {
    id: 2,
    sender: "billing@saas-co.com",
    subject: "Invoice for your subscription",
    body: "Dear customer, attached is the invoice for your monthly subscription. The total amount due is $49. Please pay by the due date to avoid service interruption."
  },
  {
    id: 3,
    sender: "support@store.com",
    subject: "Re: Issue with recent order",
    body: "We are sorry to hear about the issue with your recent order. Could you please share a photo of the damaged item so we can assist you further?"
  },
  {
    id: 4,
    sender: "marketing@newsletters.com",
    subject: "Limited time offer just for you!",
    body: "Save 30% on all products this weekend only. Visit our website and use the code SAVE30 at checkout."
  },
  {
    id: 5,
    sender: "manager@company.com",
    subject: "Weekly team sync-up",
    body: "Reminder: Our weekly team sync-up is scheduled for Friday at 10 AM. We'll discuss project updates and blockers."
  }
];
