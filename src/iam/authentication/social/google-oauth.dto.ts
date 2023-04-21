/**
 * @see https://developers.google.com/identity/gsi/web/reference/html-reference#server-side
 */
export interface GoogleOAuthDto {
  // The ID token that Google issues.
  credential: string;

  // A string that's the same as the previous cookie value, g_csrf_token.
  g_csrf_token: string;

  // How the credential is selected.
  select_by?: string;
}
