/** For now user permissions are static */
export const userPermissions: Record<string, SCOPES> = {
  'users_list': 'ALL',
  'users_me': 'SELF',
  'users_unknowns': 'ALL',

  'channels_overview': 'SELF',
  'channels_dms': 'SELF',
  'channels_groups': 'SELF',

  'public-keys_create': 'SELF',
  'public-keys_list': 'ALL',

  'secrets_create': 'SELF',
  'secrets_list': 'ALL',
  'secrets_view': 'ALL',
  'contacts_list': 'SELF',

  'chats_dms': 'SELF',
  'chats_groups': 'SELF',
  'secrets_channel': 'SELF',

  'chat-media_multipart-init': 'SELF',
  'chat-media_list': 'SELF',
  'chat-media_part-upload': 'SELF',
  'chat-media_multipart-end': 'SELF',
  'chat-media_upload': 'SELF',

  'calls_view': 'ALL'
}