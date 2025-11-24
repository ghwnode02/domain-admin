// Utility functions for handling JSON file format

export interface DomainData {
  domain: string;
  domain_url?: string;
  registrar?: string;
  registrar_url?: string;
  expiry_date?: string;
  notes?: string;
  status?: string;
}

// Parse JSON format
export function parseJSON(content: string): DomainData[] {
  return JSON.parse(content);
}

// Export to JSON format
export function exportToJSON(data: DomainData[]): string {
  return JSON.stringify(data, null, 2);
}

// Get MIME type for JSON
export function getMimeType(): string {
  return 'application/json';
}

// Get file extension for JSON
export function getFileExtension(): string {
  return 'json';
}
