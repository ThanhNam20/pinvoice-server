const certificatePasswordGenerator = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const passwordLength = 12;
  let password = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= passwordLength; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
};

const invoiceNumberGenerator = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const passwordLength = 5;
  let password = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= passwordLength; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
};

const modelApiResponse = (status, data, message) => {
  return {
    status,
    data,
    message,
  };
};

module.exports = {
  certificatePasswordGenerator,
  modelApiResponse,
  invoiceNumberGenerator,
};
