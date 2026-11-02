// staking  < 보통 쓰는 용어
// deposit(MyToken) / withdraw(MyToken)  < 실습에서 쓸 용어 (예금, 출금)

// MyToken : token balance management
//  - the balance of TinyBank address
// TinyBank : deposit(저금) / withdraw vault(금고) < 중요
//  - users token management (유저들의 토큰 관리)
//  user --> deposit --> TinyBank --> transfer(TinyBank --> user)

// Reward
//  - reward token : MyToken
//  - reward resourcs : 1 MT/block minting  블럭 하나당 하나의 MT 토큰
//  - reward strategy : staked[user]/totalStaked distribution

//  - signer0 block 0 staking  
//  - signer1 block 5 staking
//  - 0-- 1-- 2-- 3-- 4-- 5--  꼭 앞 번호가 뒷 번호보다 나중에 만들어짐 
//    |                   |
//  - signer0 10MT        signer1 10MT

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMyToken {
    // MyToken.sol에서 정의한 함수를 그대로 가져와서 사용 가능
    function transfer(uint256 amount, address to) external;
    function transferFrom(address from, address to, uint256 amount) external;
    function mint(uint256 amount, address owner) external;
}

contract TinyBank {
    event Staked(address from, uint256 amount);
    event Withdraw(uint256 amount, address to);
    
    IMyToken public stakingToken;  // 저금할 토큰 배포

    mapping(address => uint256) public lastClaimedBlock;
    uint256 rewardPerBlock = 1 * 10 ** 10;

    mapping(address => uint256) public staked;
    uint public totalStaked;  // 모든 유저의 skaking 양

    // 그 토큰의 주소를 constructor의 파라미터로 줘야 함
    constructor(IMyToken _stakingToken) {
        stakingToken = _stakingToken;
    }

    // 누가 언제 호출?
    function  distributeReward(address to) internal {
        uint256 blocks = block.number - lastClaimedBlock[to];
        uint256 reward = (blocks * rewardPerBlock * 
            staked[to]) / totalStaked;
        stakingToken.mint(reward, to);
        lastClaimedBlock[to] = block.number;
    }

    function stake(uint256 _amount) external {
        require(_amount >= 0, "cannot stake 0 amount");
        distributeReward(msg.sender);
        stakingToken.transferFrom(msg.sender, address(this), _amount);  // contract의 주소를 받기(this)
        staked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        require(staked[msg.sender] >= _amount, "insufficient staked token");
        distributeReward(msg.sender);
        stakingToken.transfer(_amount, msg.sender);
        staked[msg.sender] -= _amount;
        totalStaked -= _amount;
        emit Withdraw(_amount, msg.sender);
    }
}