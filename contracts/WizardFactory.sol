// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./ERC20Mock.sol";
import "./SimpleLendingPool.sol";
import "./BasicDEX.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WizardFactory is Ownable {
    ERC20Mock public usdc;
    ERC20Mock public dai;
    SimpleLendingPool public pool;
    BasicDEX public dex;

    constructor() Ownable(msg.sender) {
        usdc = new ERC20Mock("USD Coin Mock", "USDC");
        dai = new ERC20Mock("DAI Stablecoin Mock", "DAI");
        
        pool = new SimpleLendingPool(address(usdc));
        dex = new BasicDEX(address(usdc), address(dai));

        // Initial setup: provide liquidity and some tokens
        usdc.mint(address(this), 1_000_000 * 10**18);
        dai.mint(address(this), 1_000_000 * 10**18);

        usdc.approve(address(dex), 500_000 * 10**18);
        dai.approve(address(dex), 500_000 * 10**18);
        dex.addLiquidity(500_000 * 10**18, 500_000 * 10**18);
    }

    function requestTokens(address to) external {
        usdc.mint(to, 1000 * 10**18);
        dai.mint(to, 1000 * 10**18);
    }
}
