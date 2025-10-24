import { IUISPClient } from './types.js'
import { formatPhoneNumber } from './utils.js'

export const mapToWide = (clients: IUISPClient[]) => {
  return clients.map((client) => {
    const getAttribute = (searchKey: string) =>
      client.attributes.find((att) => att.key === searchKey)?.value
    return {
      first_name: client.firstName,
      last_name: client.lastName,
      email: client.contacts[0].email,
      phone_number: formatPhoneNumber(client.contacts[0].phone),
      sms_number: getAttribute('telefonoSms'),
      account_id: client.userIdent,
      invoicing_date: parseInt(getAttribute('fechaDeCorte')),
      location: getAttribute('lugarDeInstalacion'),
      balance: client.accountOutstanding,
      notifications_via_whatsapp: parseInt(
        getAttribute('enviarFacturaPorWhatsapp'),
      )
        ? true
        : false,
      notifications_via_sms: parseInt(getAttribute('enviarFacturaPorSms'))
        ? true
        : false,
      notifications_via_email: parseInt(getAttribute('enviarFacturaPorEmail'))
        ? true
        : false,
      archived: client.isArchived,
    }
  })
}

export const mapToAlegra = (clients: IUISPClient[]) => {
  return clients.map((client) => {
    const getAttribute = (searchKey: string) =>
      client.attributes.find((att) => att.key === searchKey)?.value
    return {
      name: `${client.firstName} ${client.lastName}`,
      nameObject: {
        firstName: client.firstName.split(' ')[0],
        secondName: client.firstName.split(' ')[1] || '',
        lastName: client.lastName,
      },
      identificationObject: {
        type: 'CC',
        number: getAttribute('numeroDeIdentificacion'),
      },
      email: client.contacts[0].email,
      identification: getAttribute('numeroDeIdentificacion'),
      kindOfPerson: 'PERSON_ENTITY',
      regime: 'SIMPLIFIED_REGIME',
    }
  })
}
