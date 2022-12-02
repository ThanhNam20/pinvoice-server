const { exec } = require('child_process');
const { emailService, userService } = require('.');
const { certificatePasswordGenerator } = require('../utils/common');

const genClientCertificate = async (userBody, userId) => {
  const { name, commonName, organizationalUnitName, organizationName, localityName, stateOrProvinceName, countryName } =
    userBody;
  const trimCommonName = commonName.replace(/\s/g, '').toLowerCase();
  const p12Password = certificatePasswordGenerator();
  await exec(
    `cd && cd PKIServer/ && keytool -genkeypair -alias ${trimCommonName} -keyalg RSA -keysize 2048 -dname "CN=${trimCommonName}, OU=${organizationalUnitName}, O=${organizationName}, L=${localityName}, ST=${stateOrProvinceName}, C=${countryName}" -keypass ${p12Password} -validity 365 -storetype PKCS12 -keystore ${trimCommonName}.p12 -storepass ${p12Password} && keytool -certreq -alias ${trimCommonName} -keypass ${p12Password} -storetype PKCS12 -keystore ${trimCommonName}.p12 -storepass ${p12Password} -file ${trimCommonName}.csr && ejbca/bin/ejbca.sh ra addendentity --username ${trimCommonName} --dn "CN=${trimCommonName}, OU=${organizationalUnitName}, O=${organizationName}, L=${localityName}, ST=${stateOrProvinceName}, C=${countryName}" --token PEM --caname ManagementCA --type 1 --password ${p12Password} && ejbca/bin/ejbca.sh createcert --username ${trimCommonName} --password ${p12Password} -c ${trimCommonName}.csr -f ${trimCommonName}.pem && keytool -importcert -alias signKey -file ${trimCommonName}.pem -keystore ${trimCommonName}.p12 -storepass ${p12Password} -trustcacerts -noprompt && cp -b ${trimCommonName}.p12 ~/Pinvoice/pinvoice-server/certificates`,
    async (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        const attachments = [{ filename: `${trimCommonName}.p12`, path: `./certificates/${trimCommonName}.p12` }];
        const user = await userService.getUserById(userId);
        await emailService.sendCertificateAndKeyForNewClient(user.email, p12Password, attachments);
      }
    }
  );
};

module.exports = {
  genClientCertificate,
};
