/* eslint-disable jest/valid-expect */
const { ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { constructorArgs } = require("../utils/constructorArgs");
const { txHist } = require("../utils/utils"); // eslint-disable-line no-unused-vars

describe("DStor", () => {
	let DStor;
	let deployer, client1, client2, client3, otherClients; // eslint-disable-line no-unused-vars
	const def_uint = 42069; const def_str = "test"; const null_addr = "0x0000000000000000000000000000000000000000";
	const def_inputs = ["hash", 42069, ".type", "name", "description"];
	// await Promise.all(array.map(async (element, index) => {}));
	beforeEach(async () => {
		// Get ContractFactory and Signers
		const DStorFactory = await ethers.getContractFactory("DStor");
		[deployer, client1, client2, client3, ...otherClients] = await ethers.getSigners();

		DStor = await DStorFactory.connect(deployer).deploy(...constructorArgs["DStor"]); // Deploy
	});
	describe("Deployment", () => {
		it("Should track name, fileCount, and owner", async () => {
			expect(await DStor.name()).to.equal("DStor@HemlockStreet");
			expect(await DStor.fileCount()).to.equal(0);
			expect(await DStor.owner()).to.equal(deployer.address);
		});
	});

	describe("Uploads", () => {
		it("Should not allow empty hashes", async () => {
			await expect(DStor.connect(deployer).upload("", def_uint, def_str, def_str, def_str, client3.address)).to.be.reverted;
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow empty file sizes", async () => {
			await expect(DStor.connect(deployer).upload(def_str, 0, def_str, def_str, def_str, client3.address)).to.be.reverted;
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow empty file types", async () => {
			await expect(DStor.connect(deployer).upload(def_str, def_uint, "", def_str, def_str, client3.address)).to.be.reverted;
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow empty file names", async () => {
			await expect(DStor.connect(deployer).upload(def_str, def_uint, def_str, "", def_str, client3.address)).to.be.reverted;
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow empty file descriptions", async () => {
			await expect(DStor.connect(deployer).upload(def_str, def_uint, def_str, def_str, "", client3.address)).to.be.reverted;
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow empty recipient field", async () => {
			await expect(DStor.connect(deployer).upload(def_str, def_uint, def_str, def_str, def_str, null_addr)).to.be.reverted;
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow sends to self", async () => {
			await expect(DStor.connect(deployer).upload(def_str, def_uint, def_str, def_str, def_str, deployer.address)).to.be.reverted;
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should allow proper uploads", async () => {
			await DStor.connect(deployer).upload(...def_inputs, client3.address);
			expect(await DStor.fileCount()).to.equal(1);
			await DStor.connect(client1).upload(...def_inputs, client3.address);
			expect(await DStor.fileCount()).to.equal(2);
			await DStor.connect(deployer).upload(...def_inputs, client1.address);
			expect(await DStor.fileCount()).to.equal(3);
		});
	});

	async function setUp() {
		var files = [];
		const newFile = async (sender, recipient) => {
			const tx = await(await DStor.connect(sender).upload(...def_inputs, recipient.address)).wait(1);
			files.push([...def_inputs,  recipient.address, (await ethers.provider.getBlock(tx.blockNumber)).timestamp, sender.address]) ;
		};
		await newFile(deployer, client3);
		await newFile(client1, client3);
		await newFile(deployer, client1);
		return files;
	}

	const getfile = async (signer, fileId) => {
		const raw = await DStor.connect(signer).get(fileId);
		var ref = [];
		raw.forEach((value) => { ref.push(!value._isBigNumber ? value : value.toNumber()) });
		return ref;
	};

	async function retrieveAccessibleFileIds(signer, isSender) {
			const calldata = await DStor.connect(signer).getAccessibleFileIds(isSender);
			var result = [];
			calldata.forEach((id) => {result.push(id.toNumber())});
			return result;
		}

	describe("File Retrieval", () => {
		it("Should allow access to the uploaded files", async () => {
			const files = await setUp();
			assert.deepEqual(await getfile(deployer, 1), files[0]);
			assert.deepEqual(await getfile(client3, 1), files[0]);
			assert.deepEqual(await getfile(client1, 2), files[1]);
			assert.deepEqual(await getfile(client3, 2), files[1]);
			assert.deepEqual(await getfile(deployer, 3), files[2]);
			assert.deepEqual(await getfile(client1, 3), files[2]);
		});

		it("Should return proper file id arrays", async () => {
			await setUp();
			assert.deepEqual(await retrieveAccessibleFileIds(deployer, true), [1,3]);
			assert.deepEqual(await retrieveAccessibleFileIds(deployer, false), []);
			assert.deepEqual(await retrieveAccessibleFileIds(client1, true), [2]);
			assert.deepEqual(await retrieveAccessibleFileIds(client1, false), [3]);
			assert.deepEqual(await retrieveAccessibleFileIds(client3, true), []);
			assert.deepEqual(await retrieveAccessibleFileIds(client3, false), [1,2]);
		});

		it("Should return proper file arrays", async () => {
			await setUp();
			const file1 = await DStor.connect(deployer).get(1);
			const file2 = await DStor.connect(client1).get(2);
			const file3 = await DStor.connect(deployer).get(3);
			var fileBatch1; var fileBatch2;
			fileBatch1 = await DStor.connect(deployer).getAccessibleFiles(true);
			assert.deepEqual(fileBatch1,  [file1, file3]);
			fileBatch2 = await DStor.connect(deployer).getAccessibleFiles(false);
			assert.deepEqual(fileBatch2, []);
			fileBatch1 = await DStor.connect(client1).getAccessibleFiles(true);
			assert.deepEqual(fileBatch1, [file2]);
			fileBatch2 = await DStor.connect(client1).getAccessibleFiles(false);
			assert.deepEqual(fileBatch2, [file3]);
			fileBatch1 = await DStor.connect(client3).getAccessibleFiles(true);
			assert.deepEqual(fileBatch1, []);
			fileBatch2 = await DStor.connect(client3).getAccessibleFiles(false);
			assert.deepEqual(fileBatch2, [file1,  file2]);
		});

		it("Should prevent unauthorized access", async () => {
			await setUp();
			await expect(DStor.connect(client1).get(1)).to.be.revertedWith('ACCESS DENIED');
			await expect(DStor.connect(deployer).get(2)).to.be.revertedWith('ACCESS DENIED');
			await expect(DStor.connect(client3).get(3)).to.be.revertedWith('ACCESS DENIED');
		});
	});

	describe("File Interaction", () => {
		it("Disallow empty modifications", async () => {
				const files = await setUp();
				await expect(DStor.connect(deployer).modify(1, "", "", null_addr)).to.be.reverted;
				assert.deepEqual(await getfile(deployer, 1), files[0]);
			});
		it("Disallow modifications to send to self", async () => {
			const files = await setUp();
			await expect(DStor.connect(deployer).modify(1, "", "", deployer.address)).to.be.reverted;
			assert.deepEqual(await getfile(deployer, 1), files[0]);
		});
		it("Allow file name changes", async () => {
			const files = await setUp();
			await (await DStor.connect(deployer).modify(1, "newName", "", null_addr)).wait(1);
			const newFile = await getfile(deployer, 1);
			files[0][3] = "newName";
			assert.deepEqual(newFile, files[0]);
		});
		it("Allow file description changes", async () => {
			const files = await setUp();
			await (await DStor.connect(deployer).modify(1, "", "newDescription", null_addr)).wait(1);
			files[0][4] = "newDescription";
			assert.deepEqual(await getfile(deployer, 1), files[0]);
		});
		it("Allow file recipient changes", async () => {
			const files = await setUp();
			await (await DStor.connect(deployer).modify(1, "", "", client2.address)).wait(1);
			files[0][5] = client2.address;
			assert.deepEqual(await getfile(deployer, 1), files[0]);
			assert.deepEqual(await retrieveAccessibleFileIds(client2, false), [1]);
			assert.deepEqual(await retrieveAccessibleFileIds(client3, false), [2]);
		});
	});
});
