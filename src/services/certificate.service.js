const { exec } = require('child_process');
const { certificatePasswordGenerator } = require('../utils/common');

const genClientCertificate = (userBody) => {
  const { name, commonName, organizationalUnitName, organizationName, localityName, stateOrProvinceName, countryName } =
    userBody;
  const trimCommonName = commonName.replace(/\s/g, '').toLowerCase();
  const p12Password = certificatePasswordGenerator();
  console.log(p12Password);
  exec(
    `cd && cd PKIServer/ && keytool -genkeypair -alias ${trimCommonName} -keyalg RSA -keysize 2048 -dname "CN=${trimCommonName}, OU=${organizationalUnitName}, O=${organizationName}, L=${localityName}, ST=${stateOrProvinceName}, C=${countryName}" -keypass ${p12Password} -validity 365 -storetype PKCS12 -keystore ${trimCommonName}.p12 -storepass ${p12Password} && keytool -certreq -alias ${trimCommonName} -keypass ${p12Password} -storetype PKCS12 -keystore ${trimCommonName}.p12 -storepass ${p12Password} -file ${trimCommonName}.csr && ejbca/bin/ejbca.sh ra addendentity --username ${trimCommonName} --dn "CN=${trimCommonName}, OU=${organizationalUnitName}, O=${organizationName}, L=${localityName}, ST=${stateOrProvinceName}, C=${countryName}" --token PEM --caname ManagementCA --type 1 --password ${p12Password} && ejbca/bin/ejbca.sh createcert --username ${trimCommonName} --password ${p12Password} -c ${trimCommonName}.csr -f ${trimCommonName}.pem && keytool -importcert -alias signKey -file ${trimCommonName}.pem -keystore ${trimCommonName}.p12 -storepass ${p12Password} -trustcacerts -noprompt && cp -b ${trimCommonName}.p12 ~/Pinvoice/pinvoice-server/certificates`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      return {
        p12NameFile: `${trimCommonName}.p12`,
        p12Password,
        p12Path: `./certificates/${trimCommonName}.p12`,
      };
    }
  );
};

module.exports = {
  genClientCertificate,
};
