const { exec } = require('child_process');
const { certificatePasswordGenerator } = require('../utils/common');
const genClientCertificate = (userBody) => {
  const { name, commonName, organizationalUnitName, organizationName, localityName, stateOrProvinceName, countryName } =
    userBody;
  const p12Password = certificatePasswordGenerator();
  exec(
    `cd && cd PKIServer/ && keytool -genkeypair -alias ${name} -keyalg RSA -keysize 2048 -dname "CN=${name}, OU=${organizationalUnitName}, O=${organizationName}, L=${localityName}, ST=${stateOrProvinceName}, C=${countryName}" -keypass ${p12Password} -validity 365 -storetype PKCS12 -keystore ${name}.p12 -storepass ${p12Password} && keytool -certreq -alias ${name} -keypass ${p12Password} -storetype PKCS12 -keystore ${name}.p12 -storepass ${p12Password} -file ${name}.csr && ejbca/bin/ejbca.sh ra addendentity --username ${name} --dn "CN=${name}, OU=${organizationalUnitName}, O=${organizationName}, L=${localityName}, ST=${stateOrProvinceName}, C=${countryName}" --token PEM --caname SERVERCA --type 1 --password ${p12Password} && ejbca/bin/ejbca.sh createcert --username ${name} --password ${p12Password} -c ${name}.csr -f ${name}.pem && keytool -importcert -alias signKey -file ${name}.pem -keystore ${name}.p12 -storepass ${p12Password} -trustcacerts -noprompt && cp -b ${name}.p12 ~/Pinvoice/pinvoice-server/certificates`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    }
  );
};

module.exports = {
  genClientCertificate,
};
