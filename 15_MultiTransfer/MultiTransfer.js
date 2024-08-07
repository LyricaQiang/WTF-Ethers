import {ethers} from "ethers";

// 1. 创建HD钱包
console.log("\n1. 创建HD钱包")
// 通过助记词生成HD钱包
const mnemonic = `air organ twist rule prison symptom jazz cheap rather dizzy verb glare jeans orbit weapon universe require tired sing casino business anxiety seminar hunt`
const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic)
console.log(hdNode);

// 2. 获得20个钱包的地址
console.log("\n2. 通过HD钱包派生20个钱包")
const numWallet = 20
// 派生路径：m / purpose' / coin_type' / account' / change / address_index
// 我们只需要切换最后一位address_index，就可以从hdNode派生出新钱包
let basePath = "m/44'/60'/0'/0";
let addresses = [];
for (let i = 0; i < numWallet; i++) {
    let hdNodeNew = hdNode.derivePath(basePath + "/" + i);
    let walletNew = new ethers.Wallet(hdNodeNew.privateKey);
    addresses.push(walletNew.address);
}
console.log(addresses)
const amounts = Array(20).fill(ethers.parseEther("0.0001"))
console.log(`发送数额：${amounts}`)

// 3. 创建provider和wallet，发送代币用
//准备 alchemy API 可以参考https://github.com/AmazingAng/WTFSolidity/blob/main/Topics/Tools/TOOL04_Alchemy/readme.md 
const ALCHEMY_GOERLI_URL = 'https://eth-goerli.alchemyapi.io/v2/GlaeWuylnNM3uuOo-SAwJxuwTdqHaY5l';
const provider = new ethers.JsonRpcProvider(ALCHEMY_GOERLI_URL);

// 利用私钥和provider创建wallet对象
// 如果这个钱包没goerli测试网ETH了
// 请使用自己的小号钱包测试，钱包地址: 0x338f8891D6BdC58eEB4754352459cC461EfD2a5E ,请不要给此地址发送任何ETH
// 注意不要把自己的私钥上传到github上
const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

// 4. 声明Airdrop合约
// Airdrop的ABI
const abiAirdrop = [
    "function multiTransferToken(address,address[],uint256[]) external",
    "function multiTransferETH(address[],uint256[]) public payable",
];
// Airdrop合约地址（Goerli测试网）
const addressAirdrop = '0x71C2aD976210264ff0468d43b198FD69772A25fa' // Airdrop Contract
// 声明Airdrop合约
const contractAirdrop = new ethers.Contract(addressAirdrop, abiAirdrop, wallet)

// 5. 声明WETH合约
// WETH的ABI
const abiWETH = [
    "function balanceOf(address) public view returns(uint)",
    "function transfer(address, uint) public returns (bool)",
    "function approve(address, uint256) public returns (bool)"
];
// WETH合约地址（Goerli测试网）
const addressWETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6' // WETH Contract
// 声明WETH合约
const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet)


const main = async () => {

    // 6. 读取一个地址的ETH和WETH余额
    console.log("\n3. 读取一个地址的ETH和WETH余额")
    //读取WETH余额
    const balanceWETH = await contractWETH.balanceOf(addresses[10])
    console.log(`WETH持仓: ${ethers.formatEther(balanceWETH)}\n`)
    //读取ETH余额
    const balanceETH = await provider.getBalance(addresses[10])
    console.log(`ETH持仓: ${ethers.formatEther(balanceETH)}\n`)

    const myETH = await provider.getBalance(wallet)
    const myToken = await contractWETH.balanceOf(wallet.getAddress())
    // 如果钱包ETH足够和WETH足够
    if (ethers.formatEther(myETH) > 0.002 && ethers.formatEther(myToken) >= 0.002) {

        // 7. 调用multiTransferETH()函数，给每个钱包转 0.0001 ETH
        console.log("\n4. 调用multiTransferETH()函数，给每个钱包转 0.0001 ETH")
        // 发起交易
        const tx = await contractAirdrop.multiTransferETH(addresses, amounts, {value: ethers.parseEther("0.002")})
        // 等待交易上链
        await tx.wait()
        // console.log(`交易详情：`)
        // console.log(tx)
        const balanceETH2 = await provider.getBalance(addresses[10])
        console.log(`发送后该钱包ETH持仓: ${ethers.formatEther(balanceETH2)}\n`)

        // 8. 调用multiTransferToken()函数，给每个钱包转 0.0001 WETH
        console.log("\n5. 调用multiTransferToken()函数，给每个钱包转 0.0001 WETH")
        // 先approve WETH给Airdrop合约
        const txApprove = await contractWETH.approve(addressAirdrop, ethers.parseEther("1"))
        await txApprove.wait()
        // 发起交易
        const tx2 = await contractAirdrop.multiTransferToken(addressWETH, addresses, amounts)
        // 等待交易上链
        await tx2.wait()
        // console.log(`交易详情：`)
        // console.log(tx2)
        // 读取WETH余额
        const balanceWETH2 = await contractWETH.balanceOf(addresses[10])
        console.log(`发送后该钱包WETH持仓: ${ethers.formatEther(balanceWETH2)}\n`)

    } else {
        // 如果ETH和WETH不足
        console.log("ETH不足，请使用自己的小号钱包测试，并兑换一些WETH")
        console.log("1. chainlink水龙头: https://faucets.chain.link/goerli")
        console.log("2. paradigm水龙头: https://faucet.paradigm.xyz/")
    }
}


const testMain = async () => {
// 1、生成随机助记词
    const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(32))
// 2.利用助记词生成HD钱包
    const basePath = "44'/60'/0'/0"
    const baseWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, basePath)

// 3.通过HD钱包派生出20个不同的钱包
    let subWallets = []
    for (let i = 0; i < 20; i++) {
        const data = baseWallet.derivePath(i.toString())
        const newWallet = new ethers.Wallet(data.privateKey)// 这里用ethers又重新创建了一遍wallet实例
        subWallets.push(newWallet.address)
    }


// 4.创建provider、钱包（用来转账的钱包）、WETH合约实例
    const provider = new ethers.JsonRpcProvider(ALCHEMY_GOERLI_URL)
    const wallet = new ethers.Wallet(privateKey, provider)
    const abiWETH = [
        "function balanceOf(address) public view returns(uint)",
        "function transfer(address, uint) public returns (bool)",
        "function approve(address, uint256) public returns (bool)"
    ]
    const addressWETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
    const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet)


// 5.查看转账钱包的ETH余额和WETH的余额
    const balanceETH = await provider.getBalance(wallet)
    const balanceWETH = await contractWETH.balanceOf(wallet.getAddress())

// 6.如果余额足够，那么依次给20个钱包转账，调用空投合约multiTransferETH的方法，转账给20个批量生成的钱包
    const abiAirDrop = [
        "function multiTransferToken(address,address[],uint256[]) external",
        "function multiTransferETH(address[],uint256[]) public payable",
    ];
    const addressAirDrop = '0x71C2aD976210264ff0468d43b198FD69772A25fa'
    const contractAirDrop = new ethers.Contract(addressAirDrop, abiAirDrop, wallet)
    const amounts = Array(20).fill(ethers.parseEther('0.002'))

    if (ethers.formatEther(balanceETH) > 0.001 && ethers.formatEther(balanceWETH) > 0.001) {
        // 在以太坊网络中，如果调用的合约函数是可支付的，可以附带一个value参数传给以太坊网络，表明此次交易发送的ETH数量
        const tx = await contractAirDrop.multiTransferETH(subWallets, amounts, {value: ethers.parseEther("0.002")})
        tx.wait()

        // 7.如果WETH合约授权给空投合约，允许空投合约转出WETH到批量生成的钱包中
        const tx2 = await contractWETH.approve(addressAirDrop, amounts)
        tx2.wait()

        const tx3 = await contractAirDrop.multiTransferToken(addressWETH, subWallets, amounts)
        tx3.wait()
    }

}

main()
