import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const mintingAmount = 100n;
const decimals = 18n;

describe("My Token", () => {
    let myTokenC: MyToken;
    let signers: HardhatEthersSigner[];

    beforeEach("should deploy", async () => {
        myTokenC = await hre.ethers.deployContract("MyToken", [
            "MyToken",
            "MT",
            18,
            100,
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
                mintingAmount * 10n ** decimals
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
                mintingAmount * 10n ** decimals
            );
        });
    });

    describe("Transfer", () => {
        it("should have 0.5MT", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];

            await expect(
                myTokenC.transfer(
                    hre.ethers.parseUnits("0.5", decimals),
                    signer1.address
                )
            )
                .to.emit(myTokenC, "Transfer")
                .withArgs(
                    signer0.address,
                    signer1.address,
                    hre.ethers.parseUnits("0.5", decimals)
                );

            expect(
                await myTokenC.balanceOf(signer1.address)
            ).equal(
                hre.ethers.parseUnits("0.5", decimals)
            );
        });

        it("should be reverted with insufficient balance error", async () => {
            const signer1 = signers[1];

            await expect(
                myTokenC.transfer(
                    hre.ethers.parseUnits(
                        (mintingAmount + 1n).toString(),
                        decimals
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
                    hre.ethers.parseUnits("10", decimals)
                )
            )
                .to.emit(myTokenC, "Approval")
                .withArgs(
                    signer1.address,
                    hre.ethers.parseUnits("10", decimals)
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
                        hre.ethers.parseUnits("1", decimals)
                    )
            ).to.be.revertedWith("insufficient allowance");
        });

        // signer1이 승인받은 signer0의 토큰을 자신의 주소로 이동
        it("should transfer signer0 token to signer1 by signer1", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];
            const amount = hre.ethers.parseUnits("10", decimals);

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
                hre.ethers.parseUnits("90", decimals)
            );

            expect(await myTokenC.balanceOf(signer1.address)
            ).equal(
                hre.ethers.parseUnits("10", decimals)
            );
        });
    });
});