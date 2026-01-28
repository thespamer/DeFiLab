// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BasicDEX is ReentrancyGuard {
    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    event Swapped(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed user, uint256 amountA, uint256 amountB);

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external nonReentrant {
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    function swap(address tokenIn, uint256 amountIn) external nonReentrant returns (uint256 amountOut) {
        require(tokenIn == address(tokenA) || tokenIn == address(tokenB), "Invalid token");
        
        bool isTokenA = tokenIn == address(tokenA);
        (IERC20 tIn, IERC20 tOut, uint256 resIn, uint256 resOut) = isTokenA 
            ? (tokenA, tokenB, reserveA, reserveB) 
            : (tokenB, tokenA, reserveB, reserveA);

        require(amountIn > 0, "AmountIn must be > 0");

        // x * y = k formula: (resIn + amountIn) * (resOut - amountOut) = resIn * resOut
        // amountOut = (resOut * amountIn) / (resIn + amountIn)
        amountOut = (resOut * amountIn) / (resIn + amountIn);

        tIn.transferFrom(msg.sender, address(this), amountIn);
        tOut.transfer(msg.sender, amountOut);

        if (isTokenA) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        emit Swapped(msg.sender, tokenIn, amountIn, amountOut);
    }

    function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256) {
        bool isTokenA = tokenIn == address(tokenA);
        (uint256 resIn, uint256 resOut) = isTokenA ? (reserveA, reserveB) : (reserveB, reserveA);
        return (resOut * amountIn) / (resIn + amountIn);
    }
}
