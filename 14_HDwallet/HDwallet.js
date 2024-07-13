import { ethers } from "ethers";

// // 1. 创建HD钱包 (ethers V6)
// console.log("\n1. 创建HD钱包")
// // 生成随机助记词
// const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(32))
// // 创建HD基钱包
// // 基路径："m / purpose' / coin_type' / account' / change"
// const basePath = "44'/60'/0'/0"
// const baseWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, basePath)
// console.log(baseWallet);
//
// // 2. 通过HD钱包派生20个钱包
// console.log("\n2. 通过HD钱包派生20个钱包")
// const numWallet = 20
// // 派生路径：基路径 + "/ address_index"
// // 我们只需要提供最后一位address_index的字符串格式，就可以从baseWallet派生出新钱包。V6中不需要重复提供基路径！
// let wallets = [];
// for (let i = 0; i < numWallet; i++) {
//
//     let baseWalletNew = baseWallet.derivePath(i.toString());
//     console.log(`第${i+1}个钱包地址： ${baseWalletNew.address}`)
//     wallets.push(baseWalletNew);
// }
//
// // 3. 保存钱包（加密json）
// console.log("\n3. 保存钱包（加密json）")
// const wallet = ethers.Wallet.fromPhrase(mnemonic)
// console.log("通过助记词创建钱包：")
// console.log(wallet)
// // 加密json用的密码，可以更改成别的
// const pwd = "password"
// const json = await wallet.encrypt(pwd)
// console.log("钱包的加密json：")
// console.log(json)
//
// // 4. 从加密json读取钱包
// const wallet2 = await ethers.Wallet.fromEncryptedJson(json, pwd);
// console.log("\n4. 从加密json读取钱包：")
// console.log(wallet2)

const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(32))
const basePath = "44'/60'/0'/0"
const baseWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, basePath)
console.log(baseWallet)
// 总结： 通过ethers生成一个助记词，通过助记词创建HD钱包

let wallets  = []
for(let i = 0; i< 20; i++) {
    const data = baseWallet.derivePath(i.toString())
    console.log(`${i + 1}: ${data.address}`)
    console.log(data)
    wallets.push(data)
}
// 总结： 根据派生路径，派生出20个不同的钱包


const wallet = ethers.Wallet.fromPhrase(mnemonic)
const json = await wallet.encrypt('apsss')
console.log(json)
// 总结： 根据助记词生成钱包，钱包是一段加密的json

// 从加密的json读取钱包数据
const wallet2 = await ethers.Wallet.fromEncryptedJson(json, 'apsss')
console.log(wallet2)