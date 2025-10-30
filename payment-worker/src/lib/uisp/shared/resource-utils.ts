export interface UispAttribute {
  id: number
  clientId: number
  customAttributeId: number
  name: string
  key: string
  value: string
  clientZoneVisible: boolean
}

export type UispAttributeValueType =
  | 'string'
  | 'integer'
  | 'boolean'
  | 'date'
  | 'enum'

export interface UispCustomAttribute {
  id: number
  key: string
  name: string
  clientZoneVisible: boolean
  attributeType: string
  type: UispAttributeValueType
}

export interface UispAttributeTypes {
  key: string
  type: UispAttributeValueType
}

export interface Attributes {
  [key: string]: string | number | boolean
}

export const getUispCustomAttributes = (
  attributesList: UispCustomAttribute[],
): UispAttributeTypes[] => {
  return attributesList.map(({ key, type }) => ({ key, type }))
}

export const normalizeAttributes = (
  attributes: UispAttribute[],
  attributeTypes: UispAttributeTypes[],
) => {
  const getAttributeType = (keyParam: string) => {
    const foundAttribute = attributeTypes.find(({ key }) => key === keyParam)
    return foundAttribute?.type || 'string'
  }
  const formatAttribute = (attribute: UispAttribute) => {
    const { key, value } = attribute
    const type = getAttributeType(key)

    switch (type) {
      case 'boolean':
        return value === '1'
      case 'integer':
        return parseInt(value, 10) || 0
      default:
        return value
    }
  }
  return attributes.reduce((acc, attr) => {
    acc[attr.key] = formatAttribute(attr)
    return acc
  }, {} as Attributes)
}
