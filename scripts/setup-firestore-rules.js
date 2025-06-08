// This script helps deploy Firebase security rules
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Create temporary files for Firebase rules
const createTempRulesFile = (rules, filename) => {
  const tempDir = path.join(__dirname, "../temp")

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
  }

  const filePath = path.join(tempDir, filename)
  fs.writeFileSync(filePath, rules)
  return filePath
}

// Deploy Firestore rules
const deployFirestoreRules = () => {
  try {
    // Import the rules from our project
    const { getSimpleFirestoreRules } = require("../lib/firebase-rules-simple")

    // Get the rules content
    const firestoreRules = getSimpleFirestoreRules()

    // Create temporary file
    const firestoreRulesPath = createTempRulesFile(firestoreRules, "firestore.rules")

    console.log("Deploying Firestore security rules...")

    // Create firebase.json if it doesn't exist
    const firebaseJsonPath = path.join(__dirname, "../firebase.json")
    if (!fs.existsSync(firebaseJsonPath)) {
      const firebaseJson = {
        firestore: {
          rules: "temp/firestore.rules",
          indexes: "firestore.indexes.json",
        },
        storage: {
          rules: "temp/storage.rules",
        },
      }

      fs.writeFileSync(firebaseJsonPath, JSON.stringify(firebaseJson, null, 2))
    }

    // Create empty indexes file if it doesn't exist
    const indexesPath = path.join(__dirname, "../firestore.indexes.json")
    if (!fs.existsSync(indexesPath)) {
      const indexes = {
        indexes: [],
        fieldOverrides: [],
      }

      fs.writeFileSync(indexesPath, JSON.stringify(indexes, null, 2))
    }

    // Deploy rules using Firebase CLI
    // Note: This requires Firebase CLI to be installed and logged in
    execSync("firebase deploy --only firestore:rules", { stdio: "inherit" })

    console.log("Firestore security rules deployed successfully!")
    return true
  } catch (error) {
    console.error("Error deploying Firestore rules:", error)
    return false
  }
}

// Deploy Storage rules
const deployStorageRules = () => {
  try {
    // Import the rules from our project
    const { getSimpleStorageSecurityRules } = require("../lib/firebase-rules-simple")

    // Get the rules content
    const storageRules = getSimpleStorageSecurityRules()

    // Create temporary file
    const storageRulesPath = createTempRulesFile(storageRules, "storage.rules")

    console.log("Deploying Storage security rules...")

    // Deploy rules using Firebase CLI
    execSync("firebase deploy --only storage", { stdio: "inherit" })

    console.log("Storage security rules deployed successfully!")
    return true
  } catch (error) {
    console.error("Error deploying Storage rules:", error)
    return false
  }
}

// Create indexes
const createFirestoreIndexes = () => {
  try {
    console.log("Creating Firestore indexes...")

    // Deploy indexes using Firebase CLI
    execSync("firebase deploy --only firestore:indexes", { stdio: "inherit" })

    console.log("Firestore indexes created successfully!")
    return true
  } catch (error) {
    console.error("Error creating Firestore indexes:", error)
    return false
  }
}

// Main function
const setupFirebaseRules = async () => {
  console.log("Starting Firebase rules setup...")

  // Deploy Firestore rules
  const firestoreSuccess = deployFirestoreRules()

  // Deploy Storage rules
  const storageSuccess = deployStorageRules()

  // Create indexes
  const indexesSuccess = createFirestoreIndexes()

  if (firestoreSuccess && storageSuccess && indexesSuccess) {
    console.log("Firebase rules setup completed successfully!")
  } else {
    console.log("Firebase rules setup completed with some errors.")
  }
}

// Run the setup
setupFirebaseRules().catch(console.error)
