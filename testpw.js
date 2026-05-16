const bcrypt = require('bcryptjs');
async function test() {
  console.log(await bcrypt.compare("admin123", "$2b$10$bqzK8wKtCi.1lLF4HOsDCuBSLyZ8wvEBOx22OsuTFsYaTP4AJ.cga"));
  console.log(await bcrypt.compare("password123", "$2b$10$bqzK8wKtCi.1lLF4HOsDCuBSLyZ8wvEBOx22OsuTFsYaTP4AJ.cga"));
  console.log(await bcrypt.compare("Admin@123", "$2b$10$bqzK8wKtCi.1lLF4HOsDCuBSLyZ8wvEBOx22OsuTFsYaTP4AJ.cga"));
}
test();
