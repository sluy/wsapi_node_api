import { api } from '../utils/api'
import { isAxiosError } from 'axios'

const mainInstanceData = {
  name: 'Principal',
  info: ''
}

async function create(payload) {
  if (typeof payload !== 'object' || payload === null) {
    payload = {}
  }
  try {
    return await api.post('instances', payload)
  } catch (error) {
    if (
      isAxiosError(error) &&
      typeof error.response &&
      typeof error.response.data === 'object' &&
      error.response.data !== null &&
      typeof error.response.data.message === 'string'
    ) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error('internal')
    }
  }
}

async function drop(value) {
  if (typeof value === 'object' && value !== null) {
    return drop(value.id)
  }
  if (typeof value === 'string') {
    value = parseInt(value)
  }
  if (typeof value === 'number' && !isNaN(value) && value > 0) {
    return await api.delete('instances', {
      value,
      field: 'id'
    })
  }
  throw new Error('Value must be an instance ({id: string|number, ...}) or id(string|number).')
}

async function all() {
  try {
    const res = await api.head('instances')
    if (res.status === true && Array.isArray(res.data)) {
      return res.data
    }
  } catch (error) {
    error.value = true
  }
}

export default {
  mainInstanceData,
  create,
  drop,
  all
}
