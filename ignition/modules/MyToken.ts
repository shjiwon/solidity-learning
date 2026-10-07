import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyTokenDeploy = buildModule("MyTokenDeploy", (m) => {
    const myTokenC = m.contract("MyToken", [
        "MyToken",
        "MT",
        18
    ]);

    return { myTokenC };
});

export default MyTokenDeploy;