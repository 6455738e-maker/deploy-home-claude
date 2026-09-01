import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * 평문 비밀번호를 bcrypt로 해싱
 * @param {string} plainPassword - 평문 비밀번호
 * @returns {Promise<string>} 해시된 비밀번호
 */
export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * 평문 비밀번호가 해시와 일치하는지 검증
 * @param {string} plainPassword - 평문 비밀번호
 * @param {string} hashedPassword - 해시된 비밀번호
 * @returns {Promise<boolean>} 일치 여부
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
