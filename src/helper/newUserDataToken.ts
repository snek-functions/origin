import { userGet } from '@snek-functions/iam'


export const newUserDataToken = async ({userId}) => {
    const data = await userGet({userId})
  
    return JSON.stringify(data)
  }
  