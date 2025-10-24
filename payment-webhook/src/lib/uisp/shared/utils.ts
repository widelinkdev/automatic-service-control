export const formatPhoneNumber = (phone: string) => phone?.replace(/\D/g, '');

export const getPathFromResource = (resource: string) => {
  switch (resource) {
    case 'client':
      return 'clients';
    default:
      break;
  }
};

export function formatString(template: string, variables: { [key: string]: string }): string {
  return template.replace(/\${(.*?)}/g, (match, key) => variables[key.trim()]);
}