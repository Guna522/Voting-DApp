// Connect to Metamask
async function connectMetamask() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const web3 = new Web3(window.ethereum);
            return web3;
        } catch (error) {
            console.error("User denied account access or error occurred:", error);
        }
    } else {
        console.error("Metamask not detected. Please install Metamask.");
    }
}


    async function connectMetamask() {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });
                return new Web3(window.ethereum);
            } catch (error) {
                console.error("User denied Metamask connection", error);
                alert("Please connect to Metamask.");
                return null;
            }
        } else {
            alert("Metamask is not installed. Please install it to continue.");
            return null;
        }
    }
    
    async function loadContract() {
        const contractAddress = "0xa4c3043e52c6855e1bea829c389a83fe643e68e1"; // Replace with your contract address
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "string[]",
                    "name": "_names",
                    "type": "string[]"
                }
            ],
            "name": "addCandidate",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                }
            ],
            "name": "CandidateAdded",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "voter",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "voterId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "bytes32",
                    "name": "uniqueId",
                    "type": "bytes32"
                }
            ],
            "name": "Debug",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "votingEnd",
                    "type": "uint256"
                }
            ],
            "name": "ElectionStarted",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_voterId",
                    "type": "string"
                },
                {
                    "internalType": "bytes32",
                    "name": "_uniqueId",
                    "type": "bytes32"
                },
                {
                    "internalType": "string",
                    "name": "_phoneNumber",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_imageUrl",
                    "type": "string"
                },
                {
                    "internalType": "uint8",
                    "name": "_age",
                    "type": "uint8"
                },
                {
                    "internalType": "string",
                    "name": "_gender",
                    "type": "string"
                }
            ],
            "name": "registerVoter",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "resetAllVoterStatus",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "resetElection",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_votingDuration",
                    "type": "uint256"
                }
            ],
            "name": "startElection",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "voter",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "candidateId",
                    "type": "uint256"
                }
            ],
            "name": "Voted",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "voter",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "voterId",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "bytes32",
                    "name": "uniqueId",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "phoneNumber",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "imageUrl",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint8",
                    "name": "age",
                    "type": "uint8"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "gender",
                    "type": "string"
                }
            ],
            "name": "VoterRegistered",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "_name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_voterId",
                    "type": "string"
                },
                {
                    "internalType": "bytes32",
                    "name": "_uniqueId",
                    "type": "bytes32"
                },
                {
                    "internalType": "string",
                    "name": "_phoneNumber",
                    "type": "string"
                }
            ],
            "name": "voteTo",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "candidates",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "numberOfVotes",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "checkElectionPeriod",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "electionStarted",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "electionTimer",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_voter",
                    "type": "address"
                }
            ],
            "name": "getStoredUniqueId",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_voter",
                    "type": "address"
                }
            ],
            "name": "getVoterDetails",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "voterId",
                    "type": "string"
                },
                {
                    "internalType": "bytes32",
                    "name": "uniqueId",
                    "type": "bytes32"
                },
                {
                    "internalType": "string",
                    "name": "phoneNumber",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "imageUrl",
                    "type": "string"
                },
                {
                    "internalType": "uint8",
                    "name": "age",
                    "type": "uint8"
                },
                {
                    "internalType": "string",
                    "name": "gender",
                    "type": "string"
                },
                {
                    "internalType": "bool",
                    "name": "hasVoted",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_voter",
                    "type": "address"
                }
            ],
            "name": "getVoterStatus",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "hasVoted",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "listOfVoters",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "MINIMUM_AGE",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "retrieveVotes",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "name",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "numberOfVotes",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct Voting.Candidate[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "uniqueIdToAddress",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "name": "usedVoterIds",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "voterDetails",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "voterId",
                    "type": "string"
                },
                {
                    "internalType": "bytes32",
                    "name": "uniqueId",
                    "type": "bytes32"
                },
                {
                    "internalType": "string",
                    "name": "phoneNumber",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "imageUrl",
                    "type": "string"
                },
                {
                    "internalType": "uint8",
                    "name": "age",
                    "type": "uint8"
                },
                {
                    "internalType": "string",
                    "name": "gender",
                    "type": "string"
                },
                {
                    "internalType": "bool",
                    "name": "registered",
                    "type": "bool"
                },
                {
                    "internalType": "bool",
                    "name": "hasVoted",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_voter",
                    "type": "address"
                }
            ],
            "name": "voterStatus",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "votingEnd",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "votingStart",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ] // Add your contract ABI here
        const web3 = await connectMetamask();
        if (web3) {
            return new web3.eth.Contract(contractABI, contractAddress);
        }
        return null;
    }
        
    // Register Voter
    async function registerVoter() {
        try {
            const web3 = await connectMetamask();
            if (!web3) return;
    
            const name = document.getElementById("name").value.trim();
            const voterId = document.getElementById("voterId").value.trim();
            const uniqueId = document.getElementById("uniqueId").value.trim();
            const phoneNumber = document.getElementById("phoneNumber").value.trim();
            const age = parseInt(document.getElementById("age").value);
            const gender = document.getElementById("gender").value;
            const fileInput = document.getElementById("voterPhoto");
    
            if (!name || !voterId || !uniqueId || !phoneNumber || isNaN(age) || !gender) {
                alert("All fields are required!");
                return;
            }
    
            if (fileInput.files.length === 0) {
                alert("Please upload a photo.");
                return;
            }
    
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append("file", file);
    
            // Upload image to backend
            const uploadResponse = await fetch("/upload-image", {
                method: "POST",
                body: formData,
            });
    
            if (!uploadResponse.ok) {
                alert("Image upload failed.");
                return;
            }
    
            const { imageHash } = await uploadResponse.json();
            const contract = await loadContract();
            if (!contract) return;
    
            const accounts = await web3.eth.getAccounts();
    
            await contract.methods
                .registerVoter(name, voterId, web3.utils.asciiToHex(uniqueId), phoneNumber, imageHash, age, gender)
                .send({ from: accounts[0] })
                .on("transactionHash", (hash) => {
                    alert("Transaction sent! Hash: " + hash);
                })
                .on("receipt", () => {
                    alert("Voter registered successfully!");
                    document.getElementById("registrationForm").reset();
                })
                .on("error", (error) => {
                    console.error("Transaction failed:", error);
                    alert("Registration failed!");
                });
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        }
    }
    
    // Vote for Candidate
    async function voteForCandidate() {
        try {
            const web3 = await connectMetamask();
            if (!web3) return;
    
            const fileInput = document.getElementById("voterPhoto");
            if (fileInput.files.length === 0) {
                alert("Please upload a photo for verification.");
                return;
            }
    
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append("file", file);
    
            const verifyResponse = await fetch("/verify-image", {
                method: "POST",
                body: formData,
            });
    
            if (!verifyResponse.ok) {
                alert("Image verification failed.");
                return;
            }
    
            const { prediction } = await verifyResponse.json();
            document.getElementById("verificationStatus").innerText = `Verification Result: ${prediction}`;
    
            if (prediction !== "Verified") {
                alert("Voter verification failed!");
                return;
            }
    
            const contract = await loadContract();
            if (!contract) return;
    
            const candidateId = parseInt(document.getElementById("candidateId").value);
            const name = document.getElementById("name").value.trim();
            const voterId = document.getElementById("voterId").value.trim();
            const uniqueId = document.getElementById("uniqueId").value.trim();
            const phoneNumber = document.getElementById("phoneNumber").value.trim();
    
            const accounts = await web3.eth.getAccounts();
            const paddedUniqueId = web3.utils.asciiToHex(uniqueId);
    
            console.log("Submitting vote with the following data:", {
                candidateId,
                name,
                voterId,
                uniqueId: paddedUniqueId,
                phoneNumber
            });
    
            let gasEstimate;
            try {
                gasEstimate = await contract.methods
                    .voteTo(candidateId, name, voterId, paddedUniqueId, phoneNumber)
                    .estimateGas({ from: accounts[0] });
            } catch (gasError) {
                console.error("Gas estimation failed:", gasError?.message || gasError);
                alert("Vote failed: You might not be registered, already voted, or submitted incorrect data.");
                return;
            }
    
            await contract.methods
                .voteTo(candidateId, name, voterId, paddedUniqueId, phoneNumber)
                .send({
                    from: accounts[0],
                    gas: gasEstimate + 50000
                })
                .on("transactionHash", (hash) => {
                    alert("Transaction sent! Hash: " + hash);
                })
                .on("receipt", () => {
                    alert("Vote cast successfully!");
                })
                .on("error", (error) => {
                    console.error("Transaction failed:", error);
                    alert("Voting failed! See console for details.");
                });
    
        } catch (error) {
            console.error("Error during voting:", error);
            alert("Something went wrong! Please check the console for details.");
        }
    }    
    
    // Fetch Election Results
    async function fetchResults() {
        try {
            const contract = await loadContract();
            if (!contract) return;
    
            // Check if election is still ongoing
            const isElectionActive = await contract.methods.checkElectionPeriod().call();
            const remainingTime = await contract.methods.electionTimer().call();
            
            const resultsContainer = document.getElementById("resultsContainer");
            const loadingMessage = document.getElementById("loadingMessage");
            const tableBody = document.querySelector("#resultsTable tbody");
            
            // Clear old data
            tableBody.innerHTML = "";
            
            if (isElectionActive) {
                // Election is still ongoing - show message with remaining time
                const timeInMinutes = Math.ceil(remainingTime / 60);
                loadingMessage.textContent = `Election is still in progress. Remaining time: ${timeInMinutes} minutes`;
                loadingMessage.style.display = "block";
                resultsContainer.style.display = "none";
            } else if (remainingTime === "0") {
                // Election has ended - show results
                loadingMessage.style.display = "none";
                resultsContainer.style.display = "block";
                
                const candidates = await contract.methods.retrieveVotes().call();
                
                candidates.forEach(candidate => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${candidate.id}</td>
                        <td>${candidate.name}</td>
                        <td>${candidate.numberOfVotes}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                // Election hasn't started yet
                loadingMessage.textContent = "No active election at the moment.";
                loadingMessage.style.display = "block";
                resultsContainer.style.display = "none";
            }
        } catch (error) {
            console.error("Error fetching election results:", error);
            alert("Election is still Going on.");
            alert("Error fetching election results. See console for details.");
        }
    }  
    // Attach it to the button
    document.getElementById("fetchResultsButton").addEventListener("click", fetchResults);    
    
    
    // Attach event listeners
    document.getElementById("registerButton").addEventListener("click", registerVoter);
    document.getElementById("voteButton").addEventListener("click", voteForCandidate);
    document.getElementById("fetchResultsButton").addEventListener("click", fetchResults);
    