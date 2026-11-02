import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TinyBank", () => {
    let signers: HardhatEthersSigner[];
    let myTokenC: MyToken;  
    let tinyBankC: TinyBank;
    beforeEach(async () => {
        signers = await hre.ethers.getSigners();
        myTokenC = await hre.ethers.deployContract("MyToken", [
            "MyToken",
            "MT",
            DECIMALS,
            MINTING_AMOUNT,
        ]);
        tinyBankC = await hre.ethers.deployContract("TinyBank", [
            await myTokenC.getAddress()
        ]);
        await myTokenC.setManager(tinyBankC.getAddress());
    });

    describe("Initialized state check", () => {
        it("should return totalStaked 0", async () => {
            expect(await tinyBankC.totalStaked()).equal(0)
        })
        it("should return staked 0 amount of signer0", async () => {
            const signer0 = signers[0];
            expect(await tinyBankC.staked(signer0.address)).equal(0);
        });
    });

    describe("Staking", async () => {
        it("should return staked amount", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await tinyBankC.stake(stakingAmount);
            expect (await tinyBankC.staked(signer0.address)).equal(stakingAmount);
            expect(await tinyBankC.totalStaked()).equal(stakingAmount);           
            expect(await myTokenC.balanceOf(tinyBankC)).equal(await tinyBankC.totalStaked()); 
        });
    });
    describe("Withdraw", () => {
        it("should return 0 staked after withdrawing total token", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await tinyBankC.stake(stakingAmount);
            await tinyBankC.withdraw(stakingAmount);
            expect(await tinyBankC.staked(signer0.address)).equal(0);
        });
    })
    describe("reward", () => {
        it("should reward 1MT every blocks", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await tinyBankC.stake(stakingAmount);
            
            const BLOCKS = 5n;
            const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
            for(var i=0; i<BLOCKS; i++) {
                await myTokenC.transfer(transferAmount, signer0.address);
            }
            await tinyBankC.withdraw(stakingAmount);
            expect(await myTokenC.balanceOf(signer0.address)).equal(
                hre.ethers.parseUnits((BLOCKS + MINTING_AMOUNT + 1n).toString())
            )
        })
        // 권한 없는 사람에 의해 rewardPerBlock 값이 변경될 때 revert를 해야 함
        it("Should revert when changing rewardPerBlock by hacker", async () => {
            const hacker = signers[3];
            const rewardToChange = hre.ethers.parseUnits("10000", DECIMALS);
            await expect(tinyBankC.connect(hacker).setRewardPerBlock(rewardToChange))
            .to.be.revertedWith("You are not a manager");
        })
    });
    
    describe("Multi Manager", () => {

        it("should register 3 managers", async () => {
            const manager1 = signers[1];
            const manager2 = signers[2];

            await tinyBankC.addManager(manager1.address);
            await tinyBankC.addManager(manager2.address);

            expect(await tinyBankC.managers(0)).to.equal(signers[0].address);
            expect(await tinyBankC.managers(1)).to.equal(manager1.address);
            expect(await tinyBankC.managers(2)).to.equal(manager2.address);
        });

        it("should revert when not all managers confirmed", async () => {
            const manager1 = signers[1];
            const manager2 = signers[2];
            const amount = hre.ethers.parseUnits("10", DECIMALS);

            await tinyBankC.addManager(manager1.address);
            await tinyBankC.addManager(manager2.address);

            await tinyBankC.connect(signers[0]).confirm();
            await tinyBankC.connect(manager1).confirm();

            await expect(
                tinyBankC.setRewardPerBlock(amount)
            ).to.be.revertedWith("Not all confirmed yet");
        });

        it("should change reward when all managers confirmed", async () => {
            const manager1 = signers[1];
            const manager2 = signers[2];
            const amount = hre.ethers.parseUnits("10", DECIMALS);

            await tinyBankC.addManager(manager1.address);
            await tinyBankC.addManager(manager2.address);

            await tinyBankC.connect(signers[0]).confirm();
            await tinyBankC.connect(manager1).confirm();
            await tinyBankC.connect(manager2).confirm();

            await expect(
                tinyBankC.setRewardPerBlock(amount)
            ).not.to.be.reverted;
        });

    });
});