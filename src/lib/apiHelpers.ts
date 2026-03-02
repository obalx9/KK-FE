import { api } from './api';

export class MigrationHelper {
  static notImplemented(featureName: string): never {
    throw new Error(
      `Feature "${featureName}" needs migration from Supabase to REST API. ` +
      `See MIGRATION_GUIDE.md for instructions.`
    );
  }

  static deprecatedSupabaseCall(
    tableName: string,
    operation: string,
    endpoint: string
  ): never {
    throw new Error(
      `Deprecated: supabase.from('${tableName}').${operation}()\n` +
      `Replace with: api.${operation.split('(')[0]}('${endpoint}')\n` +
      `See MIGRATION_GUIDE.md for details.`
    );
  }
}

export function getMediaUrl(s3Url: string | null | undefined): string {
  if (!s3Url) return '';
  if (s3Url.startsWith('http')) return s3Url;
  return api.getMediaUrl(s3Url);
}

export function getTelegramMediaUrl(fileId: string, botToken: string): string {
  console.warn('Telegram file IDs are deprecated. All media should be in S3.');
  return '';
}

export async function handleApiError(error: unknown): Promise<never> {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    throw error;
  }
  throw new Error('Unknown error occurred');
}
