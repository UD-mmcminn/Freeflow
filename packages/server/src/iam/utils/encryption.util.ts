import bcrypt from 'bcryptjs'

export const getHash = async (value: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(value, salt)
}

export const compareHash = async (value: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(value, hash)
}
