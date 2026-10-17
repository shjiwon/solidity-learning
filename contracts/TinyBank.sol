// staking  < 보통 쓰는 용어
// deposit(MyToken) / withdraw(MyToken)  < 실습에서 쓸 용어 (예금, 출금)

// MyToken : token balance management
//  - the balance of TinyBank address
// TinyBank : deposit(저금) / withdraw vault(금고) < 중요
//  - users token management (유저들의 토큰 관리)
//  user --> deposit --> TinyBank --> transfer(TinyBank --> user)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMyToken {
    // MyToken.sol에서 정의한 함수를 그대로 가져와서 사용 가능
    function transfer(uint256 amount, address to) external;
    function transferFrom(address from, address to, uint256 amount) external;
}

contract TinyBank {
    event Staked(address, uint256);
    
    IMyToken public stakingToken;  // 저금할 토큰 배포
    mapping(address => uint256) public staked;
    uint public totalStaked;  // 모든 유저의 skaking 양

    // 그 토큰의 주소를 constructor의 파라미터로 줘야 함
    constructor(IMyToken _stakingToken) {
        stakingToken = _stakingToken;
    }

    function stake(uint256 _amount) external {
        require(_amount >= 0, "cannot stake 0 amount");
        stakingToken.transferFrom(msg.sender, address(this), _amount);  // contract의 주소를 받기(this)
        staked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }
}