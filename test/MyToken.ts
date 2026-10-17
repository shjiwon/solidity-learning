import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { DECIMALS, MINTING_AMOUNT } from "./constant";

describe("My Token", () => {
    let myTokenC: MyToken;
    let signers: HardhatEthersSigner[];

    beforeEach("should deploy", async () => {
        signers = await hre.ethers.getSigners();
        myTokenC = await hre.ethers.deployContract("MyToken", [
            "MyToken",
            "MT",
            DECIMALS,
            MINTING_AMOUNT,
        ]);

        signers = await hre.ethers.getSigners();
    });

    describe("Basic state value check", () => {
        it("should return name", async () => {
            expect(await myTokenC.name()).equal("MyToken");
        });

        it("should return symbol", async () => {
            expect(await myTokenC.symbol()).equal("MT");
        });

        it("should return decimals", async () => {
            expect(await myTokenC.decimals()).equal(18);
        });

        it("should return 100 totalSupply", async () => {
            expect(await myTokenC.totalSupply()).equal(
                MINTING_AMOUNT * 10n ** DECIMALS
            );
        });
    });

    // 1 MT = 1 * 10^18
    describe("Mint", () => {
        it("should return 100MT balance for signer 0", async () => {
            const signer0 = signers[0];

            expect(
                await myTokenC.balanceOf(signer0.address)
            ).equal(
                MINTING_AMOUNT * 10n ** DECIMALS
            );
        });
    });

    describe("Transfer", () => {
        it("should have 0.5MT", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];

            await expect(
                myTokenC.transfer(
                    hre.ethers.parseUnits("0.5", DECIMALS),
                    signer1.address
                )
            )
                .to.emit(myTokenC, "Transfer")
                .withArgs(
                    signer0.address,
                    signer1.address,
                    hre.ethers.parseUnits("0.5", DECIMALS)
                );

            expect(
                await myTokenC.balanceOf(signer1.address)
            ).equal(
                hre.ethers.parseUnits("0.5", DECIMALS)
            );
        });

        it("should be reverted with insufficient balance error", async () => {
            const signer1 = signers[1];

            await expect(
                myTokenC.transfer(
                    hre.ethers.parseUnits(
                        (MINTING_AMOUNT + 1n).toString(),
                        DECIMALS
                    ),
                    signer1.address
                )
            ).to.be.revertedWith("insufficient balance");
        });
    });

    describe("TransferFrom", () => {
        it("should emit Approval event", async () => {
            const signer1 = signers[1];

            await expect(
                myTokenC.approve(
                    signer1.address,
                    hre.ethers.parseUnits("10", DECIMALS)
                )
            )
                .to.emit(myTokenC, "Approval")
                .withArgs(
                    signer1.address,
                    hre.ethers.parseUnits("10", DECIMALS)
                );
        });

        // 허락 받지 않은 사람의 토큰을 전송하려 할 때
        it("should be reverted with insufficient allowance error", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];

            await expect(
                myTokenC
                    .connect(signer1)
                    .transferFrom(
                        signer0.address,
                        signer1.address,
                        hre.ethers.parseUnits("1", DECIMALS)
                    )
            ).to.be.revertedWith("insufficient allowance");
        });

        // signer1이 승인받은 signer0의 토큰을 자신의 주소로 이동
        it("should transfer signer0 token to signer1 by signer1", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];
            const amount = hre.ethers.parseUnits("10", DECIMALS);

            // 1. approve: signer1에게 signer0의 자산 이동권한 부여
            await myTokenC.approve(
                signer1.address,
                amount
            );

            // 2. transferFrom: signer1이 signer0의 MT토큰을 자신의 주소(signer1)에게 전송
            await myTokenC
                .connect(signer1)
                .transferFrom(
                    signer0.address,
                    signer1.address,
                    amount
                );

            // 3. balance 확인
            expect(await myTokenC.balanceOf(signer0.address)
            ).equal(
                hre.ethers.parseUnits("90", DECIMALS)
            );

            expect(await myTokenC.balanceOf(signer1.address)
            ).equal(
                hre.ethers.parseUnits("10", DECIMALS)
            );
        });
    });
});