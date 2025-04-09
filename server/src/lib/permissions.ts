/** For now user permissions are static */
export const userPermissions: Record<string, SCOPES> = {
  'users_list': 'ALL',
  'users_me': 'SELF',
  'users_unknowns': 'ALL',

  'channels_overview': 'SELF',

  'public-keys_create': 'SELF',
  'public-keys_list': 'ALL',

  'secrets_create': 'SELF',
  'secrets_list': 'ALL',
  'secrets_view': 'ALL',
  'contacts_list': 'SELF'
}