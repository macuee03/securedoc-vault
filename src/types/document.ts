export interface DocumentItem {
  id: string;
  title: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  createdAt: Date;
  shareLinks?: { id: string; slug: string; isActive: boolean }[];
}
