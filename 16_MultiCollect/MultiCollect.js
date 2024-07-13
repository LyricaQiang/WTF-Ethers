import { ethers } from "ethers";

// 1. 创建provider和wallet，发送代币用
// 准备 alchemy API 可以参考https://github.com/AmazingAng/WTFSolidity/blob/main/Topics/Tools/TOOL04_Alchemy/readme.md 
const ALCHEMY_GOERLI_URL = 'https://eth-goerli.alchemyapi.io/v2/GlaeWuylnNM3uuOo-SAwJxuwTdqHaY5l';
const provider = new ethers.JsonRpcProvider(ALCHEMY_GOERLI_URL);
// 利用私钥和provider创建wallet对象
const privateKey = '0x21ac72b6ce19661adf31ef0d2bf8c3fcad003deee3dc1a1a64f5fa3d6b049c06'
const wallet = new ethers.Wallet(privateKey, provider)
//
// // 2. 声明WETH合约
// // WETH的ABI
// const abiWETH = [
//     "function balanceOf(address) public view returns(uint)",
//     "function transfer(address, uint) public returns (bool)",
// ];
// // WETH合约地址（Goerli测试网）
// const addressWETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6' // WETH Contract
// // 声明WETH合约
// const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet)
//
// // 3. 创建HD钱包
// console.log("\n1. 创建HD钱包")
// // 通过助记词生成HD钱包
// const mnemonic = `air organ twist rule prison symptom jazz cheap rather dizzy verb glare jeans orbit weapon universe require tired sing casino business anxiety seminar hunt`
// const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic)
// console.log(hdNode);
//
// // 4. 获得20个钱包
// console.log("\n2. 通过HD钱包派生20个钱包")
// const numWallet = 20
// // 派生路径：m / purpose' / coin_type' / account' / change / address_index
// // 我们只需要切换最后一位address_index，就可以从hdNode派生出新钱包
// let basePath = "m/44'/60'/0'/0";
// let wallets = [];
// for (let i = 0; i < numWallet; i++) {
//     let hdNodeNew = hdNode.derivePath(basePath + "/" + i);
//     let walletNew = new ethers.Wallet(hdNodeNew.privateKey);
//     wallets.push(walletNew);
//     console.log(walletNew.address)
// }
// // 定义发送数额
// const amount = ethers.parseEther("0.0001")
// console.log(`发送数额：${amount}`)


const main = async () => {
    // 5. 读取一个地址的ETH和WETH余额
    console.log("\n3. 读取一个地址的ETH和WETH余额")
    //读取WETH余额
    const balanceWETH = await contractWETH.balanceOf(wallets[19])
    console.log(`WETH持仓: ${ethers.formatEther(balanceWETH)}`)
    //读取ETH余额
    const balanceETH = await provider.getBalance(wallets[19])
    console.log(`ETH持仓: ${ethers.formatEther(balanceETH)}\n`)

    // 如果钱包ETH足够
    if(ethers.formatEther(balanceETH) > ethers.formatEther(amount) &&
    ethers.formatEther(balanceWETH) >= ethers.formatEther(amount)){

        // 6. 批量归集钱包的ETH
        console.log("\n4. 批量归集20个钱包的ETH")
        const txSendETH = {
            to: wallet.address,
            value: amount
        }
        for (let i = 0; i < numWallet; i++) {
            // 将钱包连接到provider
            let walletiWithProvider = wallets[i].connect(provider)
            var tx = await walletiWithProvider.sendTransaction(txSendETH)
            console.log(`第 ${i+1} 个钱包 ${walletiWithProvider.address} ETH 归集开始`)
        }
        await tx.wait()
        console.log(`ETH 归集结束`)

        // 7. 批量归集钱包的WETH
        console.log("\n5. 批量归集20个钱包的WETH")
        for (let i = 0; i < numWallet; i++) {
            // 将钱包连接到provider
            let walletiWithProvider = wallets[i].connect(provider)
            // 将合约连接到新的钱包
            let contractConnected = contractWETH.connect(walletiWithProvider)
            var tx = await contractConnected.transfer(wallet.address, amount)
            console.log(`第 ${i+1} 个钱包 ${wallets[i].address} WETH 归集开始`)
        }
        await tx.wait()
        console.log(`WETH 归集结束`)

        // 8. 读取一个地址在归集后的ETH和WETH余额
        console.log("\n6. 读取一个地址在归集后的ETH和WETH余额")
        // 读取WETH余额
        const balanceWETHAfter = await contractWETH.balanceOf(wallets[19])
        console.log(`归集后WETH持仓: ${ethers.formatEther(balanceWETHAfter)}`)
        // 读取ETH余额
        const balanceETHAfter = await provider.getBalance(wallets[19])
        console.log(`归集后ETH持仓: ${ethers.formatEther(balanceETHAfter)}\n`)
    }
}

const testMain = async () => {
    // 1.批量创建HD钱包
    const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(32))
    const basePath = "44'/60'/0'/0"
    const baseWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, basePath)

    let wallets = []
    for(let i = 0; i < 20; i++) {
        const data = baseWallet.derivePath(i.toString())
        const newWallet = new ethers.Wallet(data.privateKey)
        wallets.push(newWallet) // 0x3F7C24f2E40bd3a6CA121456a8FF75519fb2db74
    }
    console.log(wallets)
    const amounts = ethers.parseEther("0.001")

    // 2. 连接到以太坊网络
    const provider = new ethers.JsonRpcProvider(ALCHEMY_GOERLI_URL)
    // 3. 定义一个接收归集金额的钱包
    const walletCollect = new ethers.Wallet(privateKey, provider)

    // 4. 遍历每一个钱包，直接通过钱包类的sendTransaction转账ETH到归集钱包
    const tx = {
        to: walletCollect.address,
        value: amounts
    }
    for(let i = 0; i < wallets.length; i++) {
        const data = wallets[i].connect(provider)
        const txInfo = await data.sendTransaction(tx)
        txInfo.wait()
    }

    // 5.遍历每一个钱包，直接通过调用WETH合约的transfer方法转账到归集钱包
    // 连接合约
    const abiAddressWETH = ''
    const addressWETH = ''
    const contractWETH = new ethers.Contract(addressWETH, abiAddressWETH)


    for(let i = 0; i < wallets.length; i++) {
        const data = wallets[i].connect(provider)
        const contractConnectedToWallet = contractWETH.connect(data)
        const data2 = await contractConnectedToWallet.transfer(walletCollect.address, amounts)
    }

    // 读取某个HD子钱包的ETH和WETH余额
    const da = await provider.getBalance(wallets[10])
    const balanceWETHAfter = await contractWETH.balanceOf(wallets[10].address)

}
testMain()



// 总结：
// wallet.sendTransaction适用复杂交易场景，如需要自定义gas费用
// contract.transfer适用简单交易场景，如只要发送代币





// main()
