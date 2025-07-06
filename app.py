import os
import uuid
import logging
import hashlib
from deepface import DeepFace
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s: %(message)s')

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_unique_filename(filename):
    """Generate a unique filename to prevent conflicts."""
    ext = os.path.splitext(filename)[1]
    return f"{uuid.uuid4()}{ext}"

# Routes
@app.route("/")
def index():
    return render_template("index.html")

@app.route('/admin')
def admin_dashboard():
    return render_template('admin.html')

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/vote")
def vote():
    voter_id = request.args.get('voterId')
    # You can now use voter_id in your template if needed
    return render_template("vote.html", voter_id=voter_id)

@app.route("/verify")
def check():
    return render_template("verify.html")

@app.route("/results")
def results():
    return render_template("results.html")
@app.route("/voters")
def voters():
    return render_template("voters.html")

@app.route("/upload-image", methods=["GET", "POST"])
def upload_image():
    """Uploads and stores an image for future verification"""
    file_path = None
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        voter_id = request.form.get('voterId')

        if not voter_id:
            return jsonify({"error": "Voter ID is required"}), 400

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        # Save image with voter ID as filename
        filename = f"{voter_id}.jpg"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Calculate image hash
        with open(file_path, 'rb') as f:
            image_hash = hashlib.sha256(f.read()).hexdigest()

        return jsonify({
            "status": "success",
            "imageHash": image_hash,
            "message": "Image uploaded successfully"
        })

    except Exception as e:
        logging.error(f"Error in upload route: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500



@app.route("/verify-image", methods=["POST"])
def verify_image_route():
    """Verifies a voter's image using DeepFace"""
    file_path = None
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        voter_id = request.form.get('voterId')

        if not voter_id:
            return jsonify({"error": "Voter ID is required"}), 400

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        # Save uploaded image temporarily
        unique_filename = generate_unique_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)

        # Retrieve voter's registered image
        reference_image_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{voter_id}.jpg")
        
        if not os.path.exists(reference_image_path):
            return jsonify({"error": "No reference image found for this voter"}), 404

        # Perform DeepFace verification
        try:
            verification_result = DeepFace.verify(img1_path=file_path, img2_path=reference_image_path)
            verification_status = verification_result["verified"]
        except Exception as e:
            logging.error(f"DeepFace error: {str(e)}")
            return jsonify({"error": "Face verification failed"}), 400

        # Calculate image hash
        with open(file_path, 'rb') as f:
            image_hash = hashlib.sha256(f.read()).hexdigest()

        # Delete uploaded image after verification
        os.remove(file_path)

        return jsonify({
            "status": "success",
            "imageHash": image_hash,
            "verified": verification_status
        })

    except Exception as e:
        logging.error(f"Error in verify route: {str(e)}")
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/contract-address")
def contract_address():
    """Returns smart contract address and ABI"""
    contract_abi =  [
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
		"anonymous": False,
		"inputs": [
			{
				"indexed": False,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "CandidateAdded",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "voterId",
				"type": "uint256"
			},
			{
				"indexed": False,
				"internalType": "bytes32",
				"name": "uniqueId",
				"type": "bytes32"
			}
		],
		"name": "Debug",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": False,
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
		"anonymous": False,
		"inputs": [
			{
				"indexed": False,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			}
		],
		"name": "Voted",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": False,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": False,
				"internalType": "string",
				"name": "voterId",
				"type": "string"
			},
			{
				"indexed": False,
				"internalType": "bytes32",
				"name": "uniqueId",
				"type": "bytes32"
			},
			{
				"indexed": False,
				"internalType": "string",
				"name": "phoneNumber",
				"type": "string"
			},
			{
				"indexed": False,
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			},
			{
				"indexed": False,
				"internalType": "uint8",
				"name": "age",
				"type": "uint8"
			},
			{
				"indexed": False,
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
]
    return jsonify({
        "abi": contract_abi,
        #"address": "0xa4c3043e52c6855e1bea829c389a83fe643e68e1"  # Replace with actual contract address
        "address": "0xa4c3043e52c6855e1bea829c389a83fe643e68e1"
    })

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
